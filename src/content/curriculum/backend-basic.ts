import { defineCategory, defineChapter, q } from '@/lib/curriculum/authoring';
import { lessons as lessonsAuth } from './backend-basic/auth/lessons';
import { lessons as lessonsDatabaseSql } from './backend-basic/database-sql/lessons';
import { lessons as lessonsExpress } from './backend-basic/express/lessons';
import { lessons as lessonsLaravel } from './backend-basic/laravel/lessons';
import { lessons as lessonsFondasi } from './backend-basic/fondasi/lessons';

/** Backend Basic — 5 chapters, 58 lessons. Two stacks in parallel: Express and Laravel. */

const fondasi = defineChapter({
  slug: 'fondasi-backend',
  number: 1,
  title: 'Fondasi Backend & Cara Kerja Web',
  summary: 'Apa yang terjadi antara pengguna menekan tombol dan data muncul di layar.',
  objectives: [
    'Menelusuri satu permintaan dari browser sampai server dan kembali',
    'Memilih method dan status code HTTP yang tepat untuk sebuah aksi',
    'Menjelaskan kenapa konfigurasi dipisahkan dari kode',
  ],
  prerequisites: [],
  stackVersions: ['HTTP/1.1 & HTTP/2', 'REST'],
  // Bumped by the ADR-0006 pass: every lesson now carries `terms` + `references`.
  // 2026-09-07: revisi studi kasus, error, dan kesalahan umum
  // (plans/revisi-studi-kasus-error-kesalahan/) — ketiga bagian berjudul tetap ditambahkan
  // di seluruh 9 sub-bab.
  //
  // Seluruh pesan error dan angka di bab ini dihasilkan sungguhan dengan Node 26.5.0,
  // curl 8.5.0, dan Chrome for Testing 151 (dari cache Playwright). Yang diambil dari
  // keluaran asli, antara lain: byte HTTP mentah lewat net.connect (200/201/405/HEAD/301
  // beserta Transfer-Encoding chunked), empat kegagalan jaringan fetch yang semuanya
  // berpesan luar sama (ECONNREFUSED/ENOTFOUND/TimeoutError/unknown scheme), EADDRINUSE,
  // lima SyntaxError JSON.parse, dua TypeError JSON.stringify (BigInt dan struktur
  // melingkar), TypeError circular dependency CommonJS beserta jejak tumpukannya, dan
  // empat issue zod 4.4.3 yang dilaporkan sekaligus.
  //
  // Dua temuan yang MELAWAN dugaan awal dan tetap dilaporkan apa adanya:
  //   - fetch TIDAK melempar untuk 404 maupun 500 (r.ok=false, tanpa throw), jadi
  //     try/catch di sekitar fetch tidak menangkap keduanya.
  //   - Lingkaran ketergantungan yang sama GAGAL di CommonJS tapi BERHASIL di ESM
  //     (live binding), jadi materinya tidak boleh menyatakan "circular selalu error".
  reviewedAt: '2026-09-07',
  lessons: lessonsFondasi,
  quiz: [
    q(
      'be1-q1',
      'Method HTTP mana yang idempoten?',
      ['POST', 'PUT dan DELETE', 'Hanya GET', 'Semua method'],
      1,
      'Idempoten berarti memanggilnya berkali-kali memberi hasil akhir yang sama. `PUT` dan `DELETE` idempoten, `GET` idempoten sekaligus aman, sementara `POST` tidak — dua kali kirim biasanya membuat dua data.',
    ),
    q(
      'be1-q2',
      'Kenapa konfigurasi tidak boleh ditulis langsung di dalam kode?',
      [
        'Karena membuat kode lebih panjang',
        'Karena nilai berbeda per environment, dan rahasia yang ter-commit dianggap bocor selamanya',
        'Karena melanggar sintaks',
        'Karena membuat aplikasi lambat',
      ],
      1,
      'Selain soal per-environment, kredensial yang pernah masuk riwayat git harus dianggap sudah bocor — menghapus commitnya tidak menutup kebocoran, hanya rotasi yang bisa.',
    ),
  ],
  practice: {
    id: 'backend-basic/fondasi-backend',
    title: 'Praktik bab ini',
    items: [
      'Panggil satu API publik dengan `curl -i` dan baca seluruh headernya',
      'Rancang lima endpoint untuk satu fitur, pakai kata benda dan method yang tepat',
      'Buat berkas `.env.example` untuk satu aplikasi imajiner',
    ],
  },
});

const sql = defineChapter({
  slug: 'database-sql-dasar',
  number: 2,
  title: 'Database Relasional & SQL Dasar',
  summary: 'Menyimpan data supaya bisa dicari, dihubungkan, dan tetap konsisten.',
  objectives: [
    'Merancang skema dengan relasi yang benar untuk sebuah fitur',
    'Menulis query dengan `JOIN` dan agregasi',
    'Menjelaskan kenapa string concatenation pada query adalah celah keamanan',
  ],
  prerequisites: [{ category: 'backend-basic', chapter: 'fondasi-backend' }],
  stackVersions: ['PostgreSQL 17', 'SQL:2023'],
  // Bumped by the ADR-0006 pass: every lesson now carries `terms` + `references`.
  // 2026-09-14: revisi studi kasus, error, dan kesalahan umum
  // (plans/revisi-studi-kasus-error-kesalahan/) — ketiga bagian berjudul tetap ditambahkan
  // di seluruh 12 sub-bab.
  //
  // SELURUH angka dan pesan error dihasilkan sungguhan pada PostgreSQL 16.15 yang dijalankan
  // sebagai cluster SEMENTARA TERPISAH (initdb di scratchpad, TCP 127.0.0.1:5455, dihentikan
  // dan dihapus setelah selesai). Cluster sistem dan container MySQL milik user TIDAK disentuh:
  // role "zum" tidak ada di cluster sistem, dan membuat role di sana adalah perubahan pada
  // mesin user yang tidak diminta.
  //
  // Data ujinya nyata: 205.000 pelanggan, 5.000 produk, 300.000 pesanan, 600.000 item, plus
  // skema blog 50.000 artikel + 60.000 komentar. Angka yang masuk materi antara lain:
  //   - Seq Scan 10,688 ms (Rows Removed by Filter: 150000) vs Index Scan 0,047 ms
  //   - OFFSET 250000 membaca 250.020 baris / 24,2 ms vs keyset 20 baris / 0,06 ms
  //   - index parsial 1040 kB vs index penuh 1552 kB; query halaman depan 8,865 -> 0,018 ms
  //   - LEFT JOIN + WHERE = 75.000 baris, identik dengan INNER JOIN; syarat di ON = 230.000
  //   - lost update: dua proses baca-lalu-tulis menyisakan saldo 90 dari seharusnya 80
  //   - N+1: 1.000 query 53 ms vs 1 JOIN 3 ms di LOKAL (0,053 ms per round trip) — materinya
  //     menyebut angka ini lokal secara eksplisit, sebab di situlah jebakannya
  //
  // Error asli yang dipakai: duplicate key (SQLSTATE 23505, diverifikasi lewat blok DO),
  // not-null, dua check constraint, dua arah foreign key, invalid input syntax, column does
  // not exist, "must appear in the GROUP BY clause", "aggregate functions are not allowed in
  // WHERE", "current transaction is aborted", dan deadlock detected dari dua sesi bersamaan.
  //
  // Tiga temuan yang MELAWAN dugaan dan tetap ditulis apa adanya:
  //   - LIKE 'awalan%' TIDAK memakai index biasa pada collation en_US.UTF-8 (12,5 ms);
  //     baru terpakai setelah index text_pattern_ops (0,119 ms).
  //   - ORDER BY $1 lewat parameter TIDAK mengurutkan — ia diperlakukan sebagai teks tetap,
  //     jadi gagal diam-diam, bukan error.
  //   - Injeksi lewat ORDER BY yang dirangkai BENAR-BENAR menghapus tabel artikel_tag di
  //     basis data percobaan, dan respons query-nya tetap terlihat normal.
  reviewedAt: '2026-09-14',
  lessons: lessonsDatabaseSql,
  quiz: [
    q(
      'be2-q1',
      'Kenapa prepared statement mencegah SQL injection?',
      [
        'Karena ia menyaring karakter berbahaya',
        'Karena perintah dan datanya dikirim terpisah, sehingga isi data tidak pernah bisa menjadi perintah',
        'Karena ia mengenkripsi query',
        'Karena ia membatasi panjang input',
      ],
      1,
      'Escaping manual selalu tertinggal dari kasus tepi. Parameterisasi memindahkan pemisahan itu ke lapisan protokol: server database sudah tahu mana perintah dan mana nilai sebelum nilainya tiba.',
    ),
    q(
      'be2-q2',
      'Apa beda `INNER JOIN` dan `LEFT JOIN`?',
      [
        'Tidak ada, hanya gaya penulisan',
        '`INNER JOIN` hanya mengembalikan baris yang punya pasangan di kedua tabel; `LEFT JOIN` mempertahankan semua baris tabel kiri',
        '`LEFT JOIN` lebih cepat',
        '`INNER JOIN` hanya untuk primary key',
      ],
      1,
      'Kalau kamu ingin "semua artikel beserta jumlah komentarnya, termasuk yang belum berkomentar", `LEFT JOIN` yang benar. `INNER JOIN` akan diam-diam menghilangkan artikel tanpa komentar.',
    ),
    q(
      'be2-q3',
      'Kapan sebuah transaksi dibutuhkan?',
      [
        'Setiap kali membaca data',
        'Ketika beberapa penulisan harus berhasil semua atau gagal semua',
        'Hanya di PostgreSQL',
        'Saat memakai index',
      ],
      1,
      'Contoh klasik: memindahkan saldo. Mengurangi satu akun tanpa menambah akun lain adalah kerusakan data yang baru ketahuan jauh kemudian.',
    ),
  ],
  practice: {
    id: 'backend-basic/database-sql-dasar',
    title: 'Praktik bab ini',
    items: [
      'Rancang skema blog dengan minimal empat tabel dan relasi yang benar',
      'Tulis query yang menggabungkan tiga tabel dengan agregasi',
      'Tunjukkan satu query rentan injeksi, lalu perbaiki dengan parameter',
      'Bungkus dua penulisan terkait dalam satu transaksi',
    ],
  },
});

const express = defineChapter({
  slug: 'nodejs-express-basic',
  number: 3,
  title: 'Node.js & ExpressJS Basic',
  summary: 'Membangun REST API pertama dengan Express 5, lengkap dengan struktur dan validasi.',
  objectives: [
    'Membuat endpoint CRUD yang mengembalikan status code yang benar',
    'Menyusun kode ke dalam lapisan yang jelas sejak awal',
    'Memvalidasi setiap input yang masuk sebelum ia menyentuh logika',
  ],
  prerequisites: [
    { category: 'backend-basic', chapter: 'fondasi-backend' },
    { category: 'frontend-basic', chapter: 'asynchronous-javascript' },
  ],
  stackVersions: ['Node.js 22 LTS', 'Express 5', 'Zod 4'],
  // Bumped by the ADR-0006 pass: every lesson now carries `terms` + `references`.
  // 2026-09-14: revisi studi kasus, error, dan kesalahan umum
  // (plans/revisi-studi-kasus-error-kesalahan/) — ketiga bagian berjudul tetap ditambahkan
  // di seluruh 14 sub-bab.
  //
  // BATAS KEJUJURAN YANG PALING MENENTUKAN DI BAB INI: Express TIDAK terpasang, dan
  // Dependency Version Gate (core.md) melarang menambahnya tanpa persetujuan user. Jadi
  // seluruh potongan ber-API Express disusun dari dokumentasi resmi dan DINYATAKAN tidak
  // dieksekusi lewat callout di sub-bab setup. Yang dijalankan sungguhan adalah MEKANISME
  // di bawahnya memakai node:http bawaan Node 26.5.0 — termasuk rantai middleware lengkap
  // dengan aturan "penangan error dikenali dari jumlah argumen", yang ditulis ulang dari nol
  // lalu benar-benar dijalankan untuk membuktikan urutannya.
  //
  // Angka dan pesan yang diambil dari keluaran asli:
  //   - event loop: 1 permintaan berat sinkron membuat 5 permintaan ringan menunggu
  //     73,9-74,6 ms; versi asinkron menurunkannya ke 6,1-7,5 ms
  //   - lima error modul (require di ESM, import di CJS, ERR_MODULE_NOT_FOUND,
  //     top-level await di CJS, __dirname di ESM) plus keterangan Node soal "type": "module"
  //   - enam jalur badan permintaan: 200 / 400 / 415 / 415 / 400 / 413
  //   - empat issue zod 4.4.3 untuk env, dan tujuh issue bersarang untuk badan pesanan
  //     (termasuk path ber-indeks array seperti ["item",0,"jumlah"])
  //
  // Tiga temuan yang MELAWAN dugaan awal dan tetap dilaporkan apa adanya:
  //   - Handler async yang melempar TIDAK menghasilkan 500; kliennya menggantung sampai
  //     TimeoutError 1205 ms tanpa respons apa pun. Tanpa penangan unhandledRejection,
  //     prosesnya mati dengan exit 1 dan seluruh sambungan lain ikut putus.
  //   - `.refine` zod TETAP dilaporkan meski skema dasarnya sudah gagal — dugaan awal saya
  //     sebaliknya, dan materinya ditulis mengikuti hasil pengukuran.
  //   - z.coerce.number() memakai Number(), jadi parse("") dan parse(null) sama-sama
  //     menghasilkan 0, bukan gagal. Materinya menyebut .min(1) sebagai penutupnya.
  //
  // Klaim yang DICABUT karena tidak bisa diverifikasi: bentuk bawaan `query parser` Express
  // untuk sintaks `?filter[harga][gte]=`. Nilai bawaannya berbeda antar-major dan Express
  // tidak terpasang, jadi materinya menyuruh pembaca mencetak req.query sendiri.
  reviewedAt: '2026-09-14',
  lessons: lessonsExpress,
  quiz: [
    q(
      'be3-q1',
      'Apa yang menentukan urutan eksekusi middleware di Express?',
      [
        'Nama fungsinya',
        'Urutan pendaftarannya dengan `app.use` atau pada rute',
        'Abjad',
        'Ukuran fungsinya',
      ],
      1,
      'Express menjalankan middleware persis sesuai urutan pendaftaran. Karena itu menempatkan middleware autentikasi setelah rute yang harus dilindungi berarti rute itu tidak terlindungi sama sekali.',
    ),
    q(
      'be3-q2',
      'Kenapa validasi input tidak cukup dilakukan di frontend?',
      [
        'Karena frontend lambat',
        'Karena siapa pun bisa memanggil API langsung tanpa lewat frontend sama sekali',
        'Karena JavaScript tidak bisa memvalidasi',
        'Karena validasi frontend melanggar CORS',
      ],
      1,
      'Validasi klien adalah soal pengalaman pengguna. Kontrol keamanannya ada di server, dan itu tidak bisa didelegasikan ke pihak yang dikendalikan penyerang.',
    ),
    q(
      'be3-q3',
      'Status code apa yang tepat untuk pembuatan data baru yang berhasil?',
      ['200 OK', '201 Created', '204 No Content', '302 Found'],
      1,
      '`201 Created` menandakan sumber daya baru terbentuk, biasanya disertai header `Location` yang menunjuk ke sana. `200` tidak salah total, tapi kurang informatif; `204` justru menyatakan tidak ada isi.',
    ),
  ],
  practice: {
    id: 'backend-basic/nodejs-express-basic',
    title: 'Praktik bab ini',
    items: [
      'Bangun lima endpoint CRUD dengan lapisan router/controller/service',
      'Validasi setiap body dan param dengan Zod',
      'Uji unhappy path: body kosong, id tidak ada, tipe salah',
      'Pasang error handler terpusat dan pastikan tidak ada stack trace bocor ke klien',
    ],
  },
});

const laravel = defineChapter({
  slug: 'php-laravel-basic',
  number: 4,
  title: 'PHP & Laravel Basic',
  summary:
    'Stack backend kedua: framework dengan konvensi kuat yang menyelesaikan banyak hal untukmu.',
  objectives: [
    'Membangun REST API CRUD dengan Eloquent dan API Resource',
    'Menulis migration dan seeder untuk skema yang bisa diulang',
    'Memvalidasi input dengan Form Request',
  ],
  prerequisites: [{ category: 'backend-basic', chapter: 'database-sql-dasar' }],
  stackVersions: ['PHP 8.3+', 'Laravel 12'],
  // Bumped by the ADR-0006 pass: every lesson now carries `terms` + `references`.
  // 2026-09-14: revisi studi kasus, error, dan kesalahan umum
  // (plans/revisi-studi-kasus-error-kesalahan/) — ketiga bagian berjudul tetap ditambahkan
  // di seluruh 14 sub-bab.
  //
  // BATAS KEJUJURAN: Composer dan Laravel TIDAK terpasang, dan Dependency Version Gate
  // (core.md) melarang menambahnya tanpa persetujuan user. Seluruh potongan ber-API Laravel
  // disusun dari dokumentasi resmi dan DINYATAKAN tidak dieksekusi lewat callout di sub-bab
  // composer-struktur. Yang dijalankan sungguhan adalah PHP 8.3.6 yang memang terpasang.
  //
  // Yang benar-benar dieksekusi dengan PHP 8.3.6:
  //   - strict_types: TypeError/ArgumentCountError untuk empat bentuk masukan salah
  //   - tanpa strict_types: '89000' -> 178000, 89000.5 -> 178000, true -> 2
  //   - readonly (Error: Cannot modify readonly property), enum from/tryFrom
  //     (ValueError vs NULL), match (UnhandledMatchError), dan perbedaan ketat/longgar
  //     antara match dan switch
  //   - ?-> versus akses langsung (PHP Warning, hasilnya NULL, program TERUS BERJALAN)
  //   - service container lengkap lewat Reflection — autowiring, pengikatan interface,
  //     dan penukaran implementasi untuk test, semuanya dijalankan
  //   - autoload PSR-4 lewat spl_autoload_register, termasuk jejak "dicari:" per berkas
  //   - htmlspecialchars atas lima masukan XSS nyata, yang mendasari {{ }} vs {!! !!}
  //
  // TEMUAN YANG TIDAK DIDUGA: PHP 8.3.6 PUNYA peringatan untuk pemotongan float ke int
  // ("Implicit conversion from float 89000.5 to int loses precision"), tetapi setelan
  // bawaan CLI (error_reporting=22527) TIDAK menyertakan E_DEPRECATED, jadi peringatan itu
  // tidak pernah tampil. Materinya menyebut kedua keluaran itu berdampingan.
  //
  // Angka dari bab lain yang dirujuk ulang di sini semuanya berasal dari pengukuran nyata
  // di bab database dan bab Fondasi, bukan dari perkiraan.
  reviewedAt: '2026-09-14',
  lessons: lessonsLaravel,
  quiz: [
    q(
      'be4-q1',
      'Kenapa mengembalikan model Eloquent mentah dari API berisiko?',
      [
        'Karena formatnya tidak valid JSON',
        'Karena setiap kolom ikut terkirim, termasuk kolom internal yang tidak dimaksudkan untuk publik',
        'Karena Laravel melarangnya',
        'Karena akan sangat lambat',
      ],
      1,
      'Menambah satu kolom di database seharusnya tidak diam-diam mengubah kontrak API. API Resource membuat bentuk respons menjadi keputusan eksplisit.',
    ),
    q(
      'be4-q2',
      'Apa masalah N+1 pada Eloquent?',
      [
        'Query yang salah tulis',
        'Mengambil N baris lalu menjalankan satu query tambahan per baris untuk relasinya',
        'Migration yang gagal',
        'Relasi yang tidak punya foreign key',
      ],
      1,
      'Menampilkan 50 artikel beserta penulisnya bisa berubah menjadi 51 query tanpa disadari. `with()` (eager loading) menggabungkannya menjadi dua.',
    ),
  ],
  practice: {
    id: 'backend-basic/php-laravel-basic',
    title: 'Praktik bab ini',
    items: [
      'Buat migration, model, dan relasi untuk skema blog',
      'Bangun CRUD lengkap dengan Form Request dan API Resource',
      'Temukan satu masalah N+1 dan perbaiki dengan eager loading',
      'Bandingkan hasilnya dengan API Express yang kamu buat di bab 3',
    ],
  },
});

const auth = defineChapter({
  slug: 'auth-dasar',
  number: 5,
  title: 'Autentikasi & Otorisasi Dasar',
  summary:
    'Memastikan pengguna memang siapa yang diklaimnya, lalu membatasi apa yang boleh dilakukannya.',
  objectives: [
    'Menyimpan password dengan algoritma yang benar',
    'Memilih antara session cookie dan token, dengan alasan',
    'Memeriksa kepemilikan data di lapisan data, bukan hanya di tampilan',
  ],
  prerequisites: [
    { category: 'backend-basic', chapter: 'nodejs-express-basic' },
    { category: 'backend-basic', chapter: 'php-laravel-basic' },
  ],
  stackVersions: ['OWASP ASVS 5', 'OAuth 2.1'],
  // Bumped by the ADR-0006 pass: every lesson now carries `terms` + `references`.
  // 2026-09-14: revisi studi kasus, error, dan kesalahan umum
  // (plans/revisi-studi-kasus-error-kesalahan/) — ketiga bagian berjudul tetap ditambahkan
  // di seluruh 9 sub-bab.
  //
  // SELURUH angka dihasilkan sungguhan dengan node:crypto, node:sqlite, dan node:http pada
  // Node 26.5.0, plus Chrome for Testing 149 untuk perilaku cookie. Yang diukur:
  //   - SHA-256 1.270.049 hash/detik vs scrypt N=2^14 35 hash/detik (~36.000x)
  //   - SHA-256 + salt 1.228.039/detik: salt TIDAK memperlambat apa pun, hanya menggagalkan
  //     tabel pelangi — itu dua pekerjaan yang berbeda
  //   - kebocoran waktu login: email tak terdaftar 0,0 ms vs email ada 28,7 ms; versi aman
  //     28,4 / 28,5 / 28,2 ms
  //   - backoff eksponensial: 298 tebakan per 24 jam vs tanpa batas
  //   - HttpOnly: cookie `sesi` TIDAK muncul di document.cookie tapi TETAP dikirim ke server
  //   - IDOR: pengguna lain membaca baris utuh sampai syarat pemilik masuk ke query
  //   - rotasi refresh token + deteksi reuse mencabut seluruh keluarga token
  //   - tiga serangan JWT (payload diubah, alg:none, token kedaluwarsa) semuanya LOLOS pada
  //     verifikasi yang hanya mengurai, dan tertahan pada verifikasi bertiga lapis
  //
  // TEMUAN YANG MELAWAN BUKU TEKS, dan tetap ditulis apa adanya: perbandingan `===` atas
  // string 64 karakter TIDAK menunjukkan bocoran waktu bertingkat (3,23 / 0,79 / 0,59 / 0,59
  // / 0,62 ns) — V8 memeriksa panjang lebih dulu, menyamakan string identik, dan membandingkan
  // beberapa byte sekaligus. Materinya karena itu TIDAK mengklaim `===` pasti bocor; alasan
  // memakai timingSafeEqual dirumuskan sebagai "waktunya tidak bisa diperkirakan", dan
  // kerataan timingSafeEqual (70,87 / 71,02 / 78,50 ns) yang dijadikan buktinya.
  //
  // Catatan alat: binary Chrome berpindah dari cache Playwright chromium-1234 (Chrome 151,
  // dipakai bab Tailwind) ke chromium-1228 (Chrome 149) di tengah program ini. Pengukuran
  // lama tetap sah sebab benar-benar dijalankan saat itu; yang baru memakai 149.
  reviewedAt: '2026-09-14',
  lessons: lessonsAuth,
  quiz: [
    q(
      'be5-q1',
      'Kenapa SHA-256 tidak boleh dipakai untuk menyimpan password?',
      [
        'Karena tidak aman secara kriptografi',
        'Karena ia dirancang untuk cepat, sehingga penyerang bisa mencoba miliaran tebakan per detik',
        'Karena hasilnya terlalu panjang',
        'Karena tidak didukung Node.js',
      ],
      1,
      'Untuk password kamu justru butuh yang **lambat** dan bisa dinaikkan biayanya seiring perangkat keras membaik. argon2id, bcrypt, dan scrypt dirancang untuk itu.',
    ),
    q(
      'be5-q2',
      'Apa itu IDOR?',
      [
        'Kesalahan penulisan query',
        'Mengakses data milik orang lain hanya dengan mengganti ID pada permintaan, karena server tidak memeriksa kepemilikan',
        'Serangan pada cookie',
        'Kesalahan konfigurasi CORS',
      ],
      1,
      'ID dari klien adalah masukan, bukan bukti kewenangan. Setiap query harus dibatasi ke pengguna atau tenant yang berhak — pemeriksaan di UI saja tidak menghalangi siapa pun yang memanggil API langsung.',
    ),
    q(
      'be5-q3',
      'Kenapa pesan "email tidak terdaftar" sebaiknya dihindari saat login gagal?',
      [
        'Karena membingungkan pengguna',
        'Karena memungkinkan penyerang menyusun daftar akun yang benar-benar ada',
        'Karena melanggar standar HTTP',
        'Karena membuat log membengkak',
      ],
      1,
      'Pesan yang berbeda antara "akun tidak ada" dan "password salah" adalah enumerasi akun. Pakai satu pesan generik yang sama untuk keduanya.',
    ),
  ],
  practice: {
    id: 'backend-basic/auth-dasar',
    title: 'Praktik bab ini',
    items: [
      'Implementasikan register dan login dengan hashing yang benar',
      'Tambahkan rate limit pada endpoint login',
      'Buktikan sendiri satu kasus IDOR di API-mu, lalu perbaiki',
      'Pastikan pesan error login tidak membocorkan keberadaan akun',
    ],
  },
});

export const backendBasic = defineCategory({
  slug: 'backend-basic',
  order: 3,
  title: 'Backend Basic',
  tagline: 'Sisi server, dua stack sekaligus',
  description:
    'HTTP, database, dan dua framework yang paling banyak dipakai di Indonesia: Express untuk ekosistem JavaScript, Laravel untuk ekosistem PHP. Membangun API yang sama di keduanya membuat kamu melihat mana yang konsep dan mana yang sekadar sintaks.',
  chapters: [fondasi, sql, express, laravel, auth],
});
