import { defineCategory, defineChapter, q } from '@/lib/curriculum/authoring';
import { lessons as lessonsBatasAplikasiWeb } from './keamanan-fullstack/batas-aplikasi-web/lessons';
import { lessons as lessonsDataRahasiaJejak } from './keamanan-fullstack/data-rahasia-jejak/lessons';
import { lessons as lessonsIdentitasKewenangan } from './keamanan-fullstack/identitas-kewenangan/lessons';

/**
 * Keamanan Fullstack — 3 chapters, 20 lessons.
 *
 * Covers the fifteen recurring security control patterns, plus the four web-specific topics the
 * chain needs to hold together (XSS, CSP, file upload, and the closing end-to-end audit).
 *
 * Placed at order 5, before Deployment, because an application that is not yet safe is not yet
 * ready to release. It deliberately does NOT repeat `backend-intermediate/keamanan-backend`:
 * that chapter walks the OWASP categories server-side, while this one follows one request across
 * the browser/server boundary and asks where each control is installed.
 */

const batasAplikasiWeb = defineChapter({
  slug: 'batas-aplikasi-web',
  number: 1,
  title: 'Batas Aplikasi Web',
  summary:
    'Apa yang dikendalikan penyerang sebelum servermu melihat permintaan, dan kontrol mana yang menahannya.',
  objectives: [
    'Menggambar trust boundary sebuah fitur dan menentukan data mana yang tidak boleh dipercaya',
    'Mengonfigurasi CORS dengan allow-list origin yang persis, tanpa memantulkan header Origin',
    'Menutup XSS lewat escaping bawaan framework, lalu memasang CSP sebagai lapis kedua',
    'Mengamankan cookie sesi dan memutuskan kapan token CSRF memang diperlukan',
  ],
  prerequisites: [
    { category: 'frontend-basic', chapter: 'ajax-web-api' },
    { category: 'backend-basic', chapter: 'nodejs-express-basic' },
  ],
  stackVersions: ['CSP Level 3', 'Fetch Standard', 'OWASP Cheat Sheet Series'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Node 26.5.0, Chrome for Testing 149
  // lewat CDP, openssl, curl 8.5.0):
  //   - lima muatan yang melanggar SEMUA aturan validasi React diterima server 201,
  //     termasuk harga Rp1 dari field tersembunyi dan field peran yang tidak ada di formulir
  //   - XSS: innerHTML + <img onerror> BERJALAN (window.__XSS = 2 dari dua jalur),
  //     textContent menyimpan isi yang sama sebagai teks dengan 0 elemen anak
  //   - CSP: skrip inline tanpa nonce DIBLOKIR, dengan nonce berjalan, dan
  //     style-src 'self' ikut memblokir atribut style sehingga latar jadi transparan
  //   - frame-ancestors 'none' memblokir pembingkaian, pesan Chrome direkam apa adanya
  //   - SameSite diukur untuk empat cara sekaligus: Lax hanya meloloskan navigasi GET
  //     teratas; Strict tidak meloloskan apa pun; None tanpa Secure TIDAK PERNAH TERPASANG
  //   - CORS: JS hanya membaca cache-control dan content-type tanpa Expose-Headers,
  //     dan preflight OPTIONS hanya muncul untuk PATCH + header kustom
  //   - TLS: DEPTH_ZERO_SELF_SIGNED_CERT ditolak, rejectUnauthorized:false diterima,
  //     ERR_TLS_CERT_ALTNAME_INVALID untuk nama yang salah, koneksi TLSv1.3
  //
  // DUA HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - <script> yang disisipkan lewat innerHTML TIDAK berjalan, sementara <img onerror>
  //     berjalan. Materinya memakai itu untuk membongkar keyakinan bahwa memblokir kata
  //     "script" sudah cukup.
  //   - SameSite=Lax (bawaan Chrome modern) sudah menutup CSRF lewat form POST lintas
  //     situs, bentuk yang paling sering diajarkan. Yang tersisa adalah endpoint GET
  //     yang mengubah keadaan, dan materinya menggeser penekanannya ke sana.
  reviewedAt: '2026-09-14',
  lessons: lessonsBatasAplikasiWeb,
  quiz: [
    q(
      'kf1-q1',
      'Ketika kamu melihat error CORS di Console, apa yang sudah terjadi di server?',
      [
        'Tidak ada, permintaannya diblokir sebelum dikirim',
        'Permintaannya sudah sampai dan sudah diproses server, yang gagal hanya pembacaan responsnya oleh JavaScript',
        'Server menolak permintaannya dengan status 403',
        'Browser mengirim ulang permintaannya lewat jalur lain',
      ],
      1,
      'Same-Origin Policy menahan pembacaan respons, bukan pengiriman permintaan. Kalau endpoint itu menghapus data, data itu benar-benar terhapus. Karena itu CORS tidak pernah bisa dipakai sebagai kontrol akses.',
    ),
    q(
      'kf1-q2',
      'Kenapa memasang `unsafe-inline` pada `script-src` membuat CSP hampir tidak berguna melawan XSS?',
      [
        'Karena browser mengabaikan seluruh kebijakan bila nilai itu ada',
        'Karena payload XSS pada umumnya berupa skrip inline, sehingga ia ikut diizinkan bersama skrip inline milikmu',
        'Karena nilai itu hanya berlaku untuk gaya, bukan skrip',
        'Karena ia mematikan nonce yang sudah dipasang',
      ],
      1,
      'CSP tidak bisa membedakan skrip inline milikmu dari skrip inline yang disisipkan penyerang. Yang tersisa hanyalah perlindungan terhadap skrip dari domain luar, padahal payload XSS umumnya tidak membutuhkan domain luar.',
    ),
    q(
      'kf1-q3',
      'API yang diautentikasi lewat header `Authorization` dan sama sekali tidak memakai cookie sesi membutuhkan token CSRF?',
      [
        'Ya, setiap API yang mengubah data membutuhkannya',
        'Tidak, karena CSRF hidup dari cookie yang terkirim otomatis, dan header harus dipasang kode secara sadar',
        'Ya, tetapi cukup pada endpoint DELETE',
        'Tidak, karena CORS sudah menutupnya',
      ],
      1,
      'Halaman penyerang tidak punya apa pun untuk ditumpangi bila tidak ada kredensial yang dilampirkan browser secara otomatis. Memasang mesin token CSRF di sana menambah kerumitan tanpa menambah keamanan.',
    ),
  ],
  practice: {
    id: 'keamanan-fullstack/batas-aplikasi-web',
    title: 'Praktik bab ini',
    items: [
      'Gambar peta trust boundary satu fitur di aplikasimu, lalu tandai baris yang belum divalidasi ulang di server',
      'Ubah konfigurasi CORS-mu menjadi allow-list origin persis yang dibaca dari environment',
      'Cari setiap `dangerouslySetInnerHTML`, `innerHTML`, dan `v-html` di kodemu lalu tinjau satu per satu',
      'Pasang CSP dalam mode Report-Only, kumpulkan laporannya, lalu perbaiki sumbernya sebelum menegakkan',
      'Verifikasi seluruh header keamanan dengan `curl -I` terhadap alamat produksi',
    ],
  },
});

const identitasKewenangan = defineChapter({
  slug: 'identitas-kewenangan',
  number: 2,
  title: 'Identitas dan Kewenangan',
  summary:
    'Tujuh pola yang menentukan siapa boleh masuk, berapa lama, dan sejauh mana kewenangannya.',
  objectives: [
    'Memilih algoritma hashing password yang tepat dan merehash saat parameternya sudah usang',
    'Menahan penebakan tanpa membuka celah penolakan layanan lewat penguncian akun',
    'Memverifikasi JWT dengan allow-list algoritma, dan memahami batas kemampuan pencabutannya',
    'Menjalankan alur OAuth 2.0 dengan PKCE beserta tiga pemeriksaan wajibnya',
    'Memberi setiap identitas hak seminimal mungkin, bukan hanya pada IAM cloud',
  ],
  prerequisites: [{ category: 'backend-basic', chapter: 'auth-dasar' }],
  stackVersions: ['RFC 6749', 'RFC 7636', 'RFC 9700', 'RFC 6238', 'OWASP ASVS 5'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (PHP 8.3.6, Node 26.5.0):
  //   - biaya hash: sha256 2.395.136/detik, bcrypt cost=10 20/detik, cost=12 5/detik;
  //     dua pengguna bersandi sama menghasilkan hash sha256 IDENTIK dan hash bcrypt berbeda
  //   - password_needs_rehash: true untuk cost 8 terhadap target 12, false untuk 12
  //   - TOTP ditulis ulang dari RFC 6238 dengan crypto.createHmac: kode berubah tiap
  //     30 detik, toleransi satu langkah menerima t-30 dan menolak t-120
  //   - PKCE S256: verifier 43 karakter, penukaran DITOLAK tanpa verifier yang benar
  //   - rotasi refresh token: pemakaian token lama TERDETEKSI dan 3 token sekeluarga dicabut
  //   - koneksi node:sqlite hanya-baca menolak UPDATE, DELETE, DROP, dan CREATE yang
  //     semuanya sudah berhasil dirakit sebagai injeksi
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - Perbaikan "hitung hash palsu supaya waktunya seragam" MEMPERBURUK kebocoran
  //     enumerasi: tanpa perbaikan selisihnya 28,05 ms; dengan patokan dihitung tiap
  //     permintaan 28,58 ms (scrypt berjalan DUA KALI); baru dengan patokan yang dihitung
  //     sekali saat boot selisihnya 0,37 ms. Dipakai sebagai bukti bahwa kontrol keamanan
  //     harus diukur, bukan dinilai dari penalaran saja.
  //
  // Pemeriksaan sandi bocor lewat k-anonymity TIDAK dijalankan — memerlukan panggilan ke
  // layanan luar. Mekanismenya dijelaskan dan dinyatakan tidak dieksekusi di materi.
  reviewedAt: '2026-09-14',
  lessons: lessonsIdentitasKewenangan,
  quiz: [
    q(
      'kf2-q1',
      'Kenapa SHA-256 dengan salt tetap tidak layak dipakai untuk menyimpan password?',
      [
        'Karena salt-nya mudah ditebak',
        'Karena salt hanya mematikan rainbow table, sedangkan SHA-256 tetap sangat cepat dihitung sehingga penebakan massal tetap murah',
        'Karena SHA-256 sudah dianggap rusak seperti MD5',
        'Karena hasilnya terlalu pendek untuk disimpan',
      ],
      1,
      'Yang dibutuhkan untuk password adalah fungsi yang sengaja lambat dan bisa dinaikkan kelambatannya. Salt memaksa penyerang menebak per akun, tetapi tidak mengubah kecepatan perhitungannya sama sekali.',
    ),
    q(
      'kf2-q2',
      'Apa risiko mengunci akun selama tiga puluh menit sesudah lima kali gagal, tanpa kontrol lain?',
      [
        'Tidak ada, ini bentuk paling aman',
        'Penyerang bisa sengaja gagal lima kali untuk mengunci akun korban kapan saja, sehingga kontrolnya berubah menjadi alat penolakan layanan',
        'Akun tidak akan pernah bisa dibuka lagi',
        'Membuat hashing password menjadi tidak berguna',
      ],
      1,
      'Karena itu aturan yang dipakai adalah rate limit ditambah backoff, per akun dan per IP, bukan penguncian polos. Pengguna sah yang salah ketik hampir tidak terganggu, sementara penebak otomatis melambat sampai tidak berguna.',
    ),
    q(
      'kf2-q3',
      'Refresh token yang sudah pernah dipakai muncul lagi di endpoint refresh. Apa jawaban yang benar?',
      [
        'Terbitkan token baru seperti biasa, karena mungkin jaringan pengguna terputus',
        'Batalkan seluruh rangkaian token milik sesi itu, karena artinya ada dua pihak memegang token yang sama',
        'Tolak permintaannya saja tanpa tindakan lain',
        'Perpanjang masa berlaku token lama',
      ],
      1,
      'Server tidak bisa mengetahui mana yang korban dan mana yang penyerang, jadi satu-satunya jawaban aman adalah membatalkan seluruh token family itu. Korban login ulang sekali, penyerang kehilangan aksesnya.',
    ),
    q(
      'kf2-q4',
      'Kenapa `redirect_uri` harus dicocokkan sama persis, bukan dengan awalan atau wildcard?',
      [
        'Karena penyedia menolak alamat yang panjang',
        'Karena pencocokan longgar memungkinkan kode otorisasi dibelokkan ke alamat milik penyerang yang kebetulan lolos pola',
        'Karena wildcard memperlambat proses login',
        'Karena standar melarang alamat dengan parameter',
      ],
      1,
      'Kode otorisasi dikirim ke alamat tujuan pengalihan. Satu pola yang terlalu longgar cukup untuk membuat kode itu mendarat di server penyerang, dan sesudah itu ia tinggal menukarnya dengan token.',
    ),
  ],
  practice: {
    id: 'keamanan-fullstack/identitas-kewenangan',
    title: 'Praktik bab ini',
    items: [
      'Periksa parameter hashing password di aplikasimu terhadap anjuran terbaru, lalu pasang rehash saat login',
      'Tambahkan batas per akun di samping batas per IP pada endpoint login dan verifikasi OTP',
      'Cari setiap pemakaian `decode` pada token di kodemu dan pastikan tidak ada yang dipakai untuk keputusan izin',
      'Terapkan rotasi refresh token beserta reuse detection-nya',
      'Buat kredensial database terpisah tanpa hak DDL, lalu jalankan aplikasimu dengan kredensial itu',
    ],
  },
});

const dataRahasiaJejak = defineChapter({
  slug: 'data-rahasia-jejak',
  number: 3,
  title: 'Data, Rahasia, dan Jejak',
  summary:
    'Gerbang paling hulu, penyimpanan yang tidak bisa dieksekusi, rahasia yang tidak bocor, dan jejak yang bisa dibaca.',
  objectives: [
    'Memasang validasi skema di setiap gerbang, termasuk webhook dan respons pihak ketiga',
    'Memutus rantai SQL injection di tiga tempat yang berbeda',
    'Menerima unggahan berkas tanpa pernah memberi jalan eksekusi',
    'Memisahkan rahasia dari konfigurasi publik, dan merancang rotasi yang bisa dijalankan',
    'Mencatat peristiwa keamanan sehingga sebuah insiden bisa dijawab',
  ],
  prerequisites: [
    { category: 'backend-basic', chapter: 'database-sql-dasar' },
    { category: 'backend-intermediate', chapter: 'keamanan-backend' },
  ],
  stackVersions: ['OWASP ASVS 5', 'Zod 4', 'Prisma 6', 'Laravel 12'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Node 26.5.0, zod 4.4.3, Chrome 149, git):
  //   - zod: empat nilai berbahaya LOLOS pemeriksaan bentuk, lalu DITOLAK setelah
  //     aturan tambahan dipasang; .strict() melaporkan unrecognized_keys sementara
  //     perilaku bawaan membuang field asing tanpa laporan
  //   - prototype pollution: JSON.parse sendiri aman, dan fungsi merge buatan sendiri
  //     membuat SETIAP objek polos memiliki peran admin
  //   - berkas HTML yang diunggah dan disajikan apa adanya BERJALAN di origin aplikasi;
  //     berkas yang sama dengan Content-Disposition + nosniff hanya terunduh
  //   - basename(): menutup ../ dan TIDAK menutup CON.png, a.php.png, spasi sebelum
  //     ekstensi, maupun byte nol yang memotong nama
  //   - git: kredensial tetap terbaca dari riwayat dan dari objek blob sesudah berkasnya
  //     dikeluarkan dan git status bersih
  //   - redaksi log: kunci berhuruf besar tertangkap, rahasia di teks bebas lolos
  //   - log injection: masukan berisi baris baru menyisipkan baris palsu pada log yang
  //     digabung string, dan tetap satu baris pada JSON.stringify
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - z.string().url() MENERIMA 'javascript:alert(1)'. Itu skema URL yang sah menurut
  //     spesifikasi, dan sekaligus vektor XSS langsung bila nilainya dipasang di href.
  //     Materinya memakai itu untuk memisahkan "bentuknya benar" dari "aman dipakai di sini".
  reviewedAt: '2026-09-14',
  lessons: lessonsDataRahasiaJejak,
  quiz: [
    q(
      'kf3-q1',
      'Apa yang ditutup `.strict()` pada sebuah skema Zod, dan kenapa ia lebih baik daripada membuang field diam-diam?',
      [
        'Ia mempercepat validasi',
        'Ia menolak field tak dikenal sehingga percobaan mass assignment menjadi penolakan yang tercatat, bukan kejadian tanpa jejak',
        'Ia mengubah field tak dikenal menjadi null',
        'Ia memaksa semua field menjadi wajib',
      ],
      1,
      'Membuang dan menolak sama-sama aman bagi datanya. Bedanya, menolak menghasilkan sinyal yang bisa dicatat dan diberi alert, sedangkan membuang membuat percobaan penyisipan berlalu tanpa kamu ketahui.',
    ),
    q(
      'kf3-q2',
      'Kenapa nama kolom pada `ORDER BY` tidak bisa diamankan dengan prepared statement?',
      [
        'Karena database tidak mendukungnya sama sekali',
        'Karena nama kolom adalah identifier yang harus diketahui database saat menyusun rencana eksekusi, sebelum slot nilai diisi',
        'Karena nilainya terlalu pendek',
        'Karena ORM sudah menanganinya secara otomatis',
      ],
      1,
      'Placeholder hanya bisa menggantikan nilai. Untuk identifier, pertahanannya adalah memetakan input klien lewat objek allow-list milikmu sendiri, sehingga teks dari klien tidak pernah menyentuh query.',
    ),
    q(
      'kf3-q3',
      'Berkas diunggah dengan nama `foto.png` dan header `Content-Type: image/png`. Apa yang menentukan jenisnya sesungguhnya?',
      [
        'Ekstensi pada nama berkasnya',
        'Isi berkas itu sendiri, yaitu magic byte di awalnya, karena nama dan header sepenuhnya dikendalikan pengirim',
        'Header `Content-Length`',
        'Ukuran berkasnya',
      ],
      1,
      'Nama dan header hanyalah teks di dalam permintaan HTTP, jadi keduanya berada di luar trust boundary. Membaca beberapa byte pertama isi berkas adalah satu-satunya pemeriksaan yang benar-benar memeriksa berkasnya.',
    ),
    q(
      'kf3-q4',
      'Sebuah kunci API produksi tidak sengaja ter-commit ke git. Apa langkah pertama yang benar?',
      [
        'Menulis ulang riwayat git untuk menghapus commitnya',
        'Merotasi kuncinya, karena riwayat kemungkinan besar sudah ter-clone, ter-fork, atau terindeks',
        'Mengganti nama variabelnya',
        'Tidak perlu apa-apa bila repositorinya privat',
      ],
      1,
      'Menulis ulang riwayat tidak menarik kembali satu pun salinan yang sudah tersebar. Hanya rotasi yang benar-benar menutup kebocoran, dan pembersihan riwayat menyusul sesudahnya.',
    ),
  ],
  practice: {
    id: 'keamanan-fullstack/data-rahasia-jejak',
    title: 'Praktik bab ini',
    items: [
      'Tambahkan skema validasi pada satu endpoint webhook, lengkap dengan verifikasi tanda tangannya',
      'Cari setiap penggabungan string di dekat kata `SELECT` di kodemu lalu perbaiki satu per satu',
      'Ubah penyimpanan unggahan agar memakai nama yang dihasilkan server dan disajikan dengan `Content-Disposition: attachment`',
      'Jalankan build produksi lalu cari potongan rahasiamu di dalam hasil build',
      'Pasang lima aturan alert, lalu picu tiap aturannya dengan sengaja untuk membuktikan jalurnya bekerja',
      'Jalankan daftar periksa audit fitur pada satu fitur yang sudah ada di aplikasimu',
    ],
  },
});

export const keamananFullstack = defineCategory({
  slug: 'keamanan-fullstack',
  order: 5,
  title: 'Keamanan Fullstack',
  tagline: 'Dari kolom input sampai baris data',
  description:
    'Keamanan sebagai satu rantai utuh, bukan daftar istilah. Diikuti dari kolom input di browser sampai baris data di database, dengan lima belas pola kontrol yang berulang di hampir setiap aplikasi, dan ditutup satu audit fitur dari ujung ke ujung.',
  chapters: [batasAplikasiWeb, identitasKewenangan, dataRahasiaJejak],
});
