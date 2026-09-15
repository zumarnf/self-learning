import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  ol,
  p,
  references,
  steps,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Backend Intermediate — Chapter 1, all eleven lessons.
 *
 * Framework-agnostic on purpose: this is the contract layer, and a contract that only makes sense
 * inside one framework is not a contract. Express and Laravel both appear in later chapters as
 * implementations of what is decided here.
 *
 * The chapter's spine is backward compatibility. Almost every rule in it exists because an API is
 * a promise to clients you cannot redeploy — mobile apps, partner integrations, cached scripts.
 */
export const lessons: LessonDraft[] = [
  written(
    'penamaan-resource',
    'Penamaan Resource & Struktur URL',
    18,
    'Keputusan yang paling sulit diubah setelah ada klien yang memakainya.',
    [
      p(
        'URL adalah bagian API yang paling permanen. Field bisa ditambah, respons bisa diperkaya, tapi mengubah alamat berarti memutus setiap klien yang sudah memakainya — termasuk aplikasi mobile yang tidak bisa kamu paksa memperbarui diri.',
      ),

      terms(
        {
          term: 'kontrak API',
          meaning:
            'Janji yang kamu buat ke pemanggil: bentuk URL, method, bentuk body, dan status code-nya. URL adalah bagian yang **paling permanen** — field bisa ditambah, respons bisa diperkaya, tapi mengubah alamat memutus setiap klien yang sudah memakainya.',
        },
        {
          term: 'klien yang tidak bisa diperbarui',
          meaning:
            'Aplikasi mobile yang sudah terpasang di ponsel orang. Ia akan terus memanggil endpoint versi lama **berbulan-bulan** setelah kamu merasa sudah pindah — dan itulah alasan seluruh sub-bab ini ada.',
        },
        {
          term: 'kata benda jamak',
          meaning:
            'Konvensi penamaan resource: `/artikel`, bukan `/getArtikel` maupun `/artikelList`. Kata kerja hidup di **method HTTP**, bukan di URL. Menaruhnya di URL berarti setiap aksi baru butuh alamat baru.',
        },
        {
          term: 'kedalaman bersarang',
          meaning:
            'Berapa tingkat kepemilikan yang dinyatakan di path. Satu tingkat seperti `/artikel/42/komentar` masih baik dan dua tingkat masih wajar, sedangkan **lebih dari itu** sulit dibaca, sulit di-cache, dan sulit diubah. Obatnya, pecah jadi endpoint tingkat atas dengan filter.',
        },
        {
          term: 'sub-resource aksi',
          meaning:
            'Bentuk untuk operasi yang **bukan** perubahan data biasa — `POST /pesanan/42/pembatalan`. Ia membuat aturan bisnisnya eksplisit: satu endpoint, satu aturan, satu kumpulan status code. Memaksanya jadi `PATCH` field status menyembunyikan aturan itu di dalam validasi.',
        },
        {
          term: 'pola /saya/...',
          meaning:
            'Alamat untuk sumber daya yang hanya ada satu per pengguna — `/saya/profil`. Selain pengecualian sah dari aturan "selalu jamak", ia menghilangkan **satu kelas IDOR**: tidak ada id yang bisa diganti, karena identitasnya berasal dari token.',
        },
        {
          term: 'konsistensi bahasa',
          meaning:
            'Satu bahasa untuk seluruh API — mana pun. Yang merusak bukan pilihan bahasanya melainkan **campurannya**: `/artikel/{id}/comments` memaksa setiap pembaca menebak istilah mana yang dipakai di endpoint berikutnya.',
        },
        {
          term: 'bentuk pembungkus',
          meaning:
            'Keputusan apakah respons dibungkus (`{ "data": ... }`) atau telanjang. Ini **sangat sulit diubah nanti**: begitu klien mengharapkan array, menambahkan metadata paginasi menjadi perubahan yang memutus mereka. Mulai dengan pembungkus sejak endpoint pertama.',
        },
        {
          term: 'lima keputusan sekali pakai',
          meaning:
            'Bahasa, bentuk id, penamaan field, bentuk pembungkus, dan format tanggal. Kelimanya **diambil sekali di awal dan dipegang** — bukan karena satu pilihan lebih benar, melainkan karena ketidakkonsistenan yang membuat API sulit dipakai.',
        },
      ),

      h2('Aturan penamaan'),
      table(
        ['Aturan', 'Benar', 'Hindari'],
        [
          ['Kata benda jamak', '`/artikel`', '`/getArtikel`, `/artikelList`'],
          [
            'Huruf kecil + tanda hubung',
            '`/kategori-produk`',
            '`/kategoriProduk`, `/Kategori_Produk`',
          ],
          ['Konsisten satu bahasa', '`/artikel`, `/komentar`', 'Campur `/artikel` dan `/comments`'],
          ['Tanpa ekstensi', '`/artikel/42`', '`/artikel/42.json`'],
          ['Tanpa garis miring di akhir', '`/artikel`', '`/artikel/`'],
        ],
      ),
      callout(
        'tip',
        'Pilih satu bahasa dan tegakkan',
        'Project ini memakai Bahasa Indonesia untuk materi, tapi **API sebaiknya konsisten dalam satu bahasa** — bahasa mana pun. Yang merusak adalah campuran: `/artikel/{id}/comments` memaksa setiap pembaca menebak istilah mana yang dipakai di endpoint berikutnya.',
      ),

      h2('Kedalaman bersarang'),
      code(
        'text',
        `
        # Baik — hubungan kepemilikan yang jelas, satu tingkat
        GET /artikel/42/komentar

        # Batas wajar — dua tingkat
        GET /organisasi/7/proyek/12/tugas

        # Terlalu dalam — sulit dibaca, sulit di-cache, sulit diubah
        GET /organisasi/7/proyek/12/tugas/34/komentar/56/lampiran
        `,
      ),
      p('Kalau sudah lebih dari dua tingkat, pecah jadi endpoint tingkat atas dengan filter:'),
      code(
        'text',
        `
        GET /lampiran?komentarId=56
        GET /tugas?proyekId=12
        `,
      ),
      p(
        'Perhatikan hubungan induk-anaknya tidak hilang, ia hanya **pindah tempat**: dari jalur alamat ke query string. `GET /lampiran?komentarId=56` menjawab pertanyaan yang sama dengan alamat bertingkat tadi, tetapi lampirannya kini punya alamat tingkat atas sendiri (`/lampiran/99`) yang bisa dirujuk langsung tanpa menyebut seluruh silsilahnya.',
      ),
      p(
        'Keuntungan konkretnya ada tiga. **Cache** jadi mungkin, sebab satu lampiran punya satu alamat kanonik alih-alih alamat berbeda tergantung dari mana ia diakses. **Perubahan struktur** jadi murah, karena kalau nanti lampiran bisa menempel di tugas dan bukan hanya di komentar, kamu cukup menambah `?tugasId=`, bukan membuat cabang alamat baru. Dan **filter bisa digabung**, sebab `?komentarId=56&tipe=gambar` masuk akal sementara menambahkan filter di ujung alamat bertingkat tujuh segmen tidak lagi terbaca oleh siapa pun.',
      ),

      h2('Aksi yang bukan CRUD'),
      p(
        'Tidak semua operasi cocok dipaksa menjadi bentuk data. "Batalkan pesanan" bukan `PATCH` pada field status — ia punya aturan sendiri, efek samping sendiri, dan syarat sendiri.',
      ),
      compare(
        {
          title: 'Dipaksa jadi CRUD',
          lang: 'text',
          code: `
          PATCH /pesanan/42
          { "status": "dibatalkan" }

          Masalahnya:
          - Klien boleh menulis status apa saja?
          - Bagaimana dengan pengembalian dana?
          - Bagaimana kalau sudah dikirim?
          `,
          notes: ['Aturan bisnisnya tersembunyi di validasi field'],
        },
        {
          title: 'Sub-resource aksi',
          lang: 'text',
          code: `
          POST /pesanan/42/pembatalan
          { "alasan": "salah pilih" }

          -> 201 dengan detail pembatalan
          -> 409 kalau sudah dikirim

          Aturannya jadi eksplisit.
          `,
          notes: ['Satu endpoint, satu aturan, satu kumpulan status code'],
        },
      ),
      p(
        'Tiga pertanyaan di kolom kiri bukan retorika, sebab ketiganya harus dijawab kodemu, dan `PATCH` tidak menyediakan tempat untuk menjawabnya. Karena `PATCH` secara semantik berarti "ubah field ini", klien wajar mengira ia boleh mengirim `"status": "selesai"` juga. Setiap aturan yang membatasi itu, mulai dari transisi mana yang sah, siapa yang boleh, sampai apa yang harus terjadi bersamaan, akhirnya tersembunyi di dalam validasi satu field, tempat yang tidak akan dicari siapa pun.',
      ),
      p(
        'Kolom kanan mengubah aksinya menjadi **sumber daya tersendiri**, sebab sebuah pembatalan adalah benda yang punya alasan, waktu, dan pelaku. Perhatikan akibatnya pada status code, sebab `201` berarti "pembatalan berhasil dibuat" dan `409` berarti "bentrok dengan keadaan sekarang, pesanannya sudah dikirim". Keduanya menjelaskan diri sendiri, sedangkan pada versi `PATCH` kamu terpaksa memakai `422` untuk semua kegagalan dan menjelaskan bedanya lewat pesan teks.',
      ),
      p(
        'Ada satu keuntungan lagi yang baru terasa belakangan: karena pembatalan kini punya alamat sendiri, ia bisa **dibaca kembali** lewat `GET /pesanan/42/pembatalan` — lengkap dengan alasan dan waktunya. Dengan `PATCH`, informasi itu tidak ke mana-mana kecuali kamu membuat tabel dan endpoint terpisah untuknya.',
      ),

      h2('Singular atau plural untuk sumber daya tunggal'),
      code(
        'text',
        `
        # Sumber daya yang hanya ada satu per pengguna
        GET   /saya/profil
        PATCH /saya/profil
        GET   /saya/pengaturan

        # Ini pengecualian yang sah dari aturan "selalu jamak"
        `,
      ),
      p(
        'Pola `/saya/...` juga menghilangkan satu kelas IDOR: tidak ada id yang bisa diganti, karena identitasnya berasal dari token.',
      ),

      h2('Yang tidak boleh masuk URL'),
      callout(
        'danger',
        'URL tercatat di banyak tempat',
        'Riwayat browser, log akses server, log proxy dan CDN, dan header `Referer` saat pengguna mengeklik tautan keluar. Jangan pernah menaruh token, id sesi, kunci API, atau data pribadi di path maupun query string. Semuanya lewat header atau body.',
      ),

      h2('Keputusan yang harus diambil sekali dan dipegang'),
      ol(
        '**Bahasa** — Indonesia atau Inggris, untuk seluruh API.',
        '**Bentuk id** — integer berurutan atau UUID. Jangan campur antar sumber daya.',
        '**Penamaan field** — `snake_case` atau `camelCase`. Pilih satu.',
        '**Bentuk pembungkus** — `{ "data": ... }` atau objek telanjang. Ini sangat sulit diubah nanti.',
        '**Format tanggal** — ISO 8601 dengan zona waktu, selalu.',
      ),
      callout(
        'warning',
        'Array telanjang di tingkat atas adalah keputusan yang menyulitkan',
        'Mengembalikan `[{...}, {...}]` terlihat bersih sampai kamu perlu menambahkan paginasi. Menambahkan pembungkus setelah ada klien berarti perubahan yang memutus mereka. Mulailah dengan `{ "data": [...], "meta": {...} }` sejak endpoint pertama.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Penamaan sumber daya terasa seperti urusan selera sampai sebuah API dipakai klien yang tidak bisa kamu ubah, misalnya aplikasi ponsel yang sudah terpasang di perangkat pengguna. Sejak titik itu, setiap nama adalah janji.',
      ),
      p(
        'Cara paling jujur menilai sebuah rancangan alamat adalah membongkarnya dan melihat apa yang sebenarnya disampaikan tiap bagian.',
      ),
      code(
        'text',
        `
        https://api.toko.id/v1/pelanggan/42/pesanan?status=dibayar&limit=20

          /v1          versi kontraknya
          /pelanggan   sumber daya, KATA BENDA, JAMAK
          /42          identitas satu pelanggan
          /pesanan     sumber daya turunan — pesanan MILIK pelanggan 42
          ?status=     penyaringan, BUKAN identitas
          ?limit=      cara menampilkan, BUKAN identitas
        `,
      ),
      p(
        'Pembagian antara jalur dan query itu yang paling sering kabur, dan aturannya bisa diringkas jadi satu pertanyaan. Bila bagian itu dihilangkan, apakah yang tersisa masih sumber daya yang **sama**? Menghilangkan `?status=dibayar` tetap menyisakan pesanan milik pelanggan 42, jadi ia penyaring. Menghilangkan `/42` mengubahnya menjadi pesanan milik semua orang, jadi ia identitas.',
      ),
      p(
        'Keputusan kedua adalah **seberapa dalam bersarang**, dan di sini lebih dalam hampir selalu lebih buruk.',
      ),
      table(
        ['Bentuk', 'Masalahnya'],
        [
          [
            '`/pelanggan/42/pesanan/7/item/3/produk/9`',
            'Klien harus tahu seluruh rantainya untuk membuka satu produk, dan setiap perubahan struktur memutus alamatnya',
          ],
          [
            '`/pelanggan/42/pesanan`',
            'Wajar. Satu tingkat, dan bersarangnya memang menyatakan kepemilikan',
          ],
          ['`/pesanan/7/item`', 'Wajar. Item memang tidak punya arti tanpa pesanannya'],
          [
            '`/produk/9`',
            'Benar. Produk punya identitas sendiri, jadi ia tidak perlu bersarang di bawah siapa pun',
          ],
        ],
      ),
      p(
        'Aturan praktis yang menutup hampir semua kasus, **bersarang paling banyak satu tingkat**, dan hanya ketika turunannya memang tidak punya arti sendiri. Segala sesuatu yang punya identitas sendiri diberi alamat tingkat atas, lalu dihubungkan lewat penyaring, misalnya `/pesanan?pelanggan=42` alih-alih `/pelanggan/42/pesanan/7/item/3/produk/9`.',
      ),
      p(
        'Kasus ketiga yang selalu muncul adalah aksi yang bukan CRUD, misalnya membatalkan pesanan atau mengirim ulang surel verifikasi. Ada dua jalan yang sama-sama sah, dan memilih salah satu lalu memegangnya lebih berharga daripada memilih yang paling elegan.',
      ),
      code(
        'text',
        `
        JALAN 1 — aksi sebagai sub-sumber daya
          POST /pesanan/7/pembatalan        { "alasan": "salah pilih" }
          POST /pengguna/42/verifikasi-ulang

          Membaca seperti "buat sebuah pembatalan untuk pesanan 7".
          Cocok bila aksinya memang menghasilkan catatan yang bisa dilihat lagi.

        JALAN 2 — perubahan status lewat PATCH
          PATCH /pesanan/7                  { "status": "batal", "alasan": "salah pilih" }

          Cocok bila aksinya memang sekadar mengubah satu field,
          dan tidak ada catatan tersendiri yang lahir darinya.

        Yang SALAH, dan ini yang paling sering:
          POST /batalkanPesanan?id=7
          GET  /getPesananByPelanggan?id=42
          POST /api/hapusSemuaCatatan

          Kata kerja sudah ada di method HTTP. Mengulangnya di alamat
          berarti method-nya berhenti berarti apa-apa.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan penamaan tidak menghasilkan error hari ini. Ia menghasilkan error **berbulan-bulan kemudian**, ketika alamatnya harus berubah dan ada klien yang tidak bisa ikut berubah.',
      ),
      code(
        'text',
        `
        Yang terjadi ketika alamat diganti tanpa versi baru:

          Aplikasi ponsel versi 3.2 yang sudah terpasang di 40.000 perangkat
          memanggil  GET /getPesananByPelanggan?id=42

          Server diperbarui, alamat itu dihapus, diganti /v1/pelanggan/42/pesanan

          Yang dilihat 40.000 pengguna: 404, pada aplikasi yang tidak bisa
          dipaksa diperbarui pada hari yang sama.
        `,
      ),
      p(
        'Karena itu keputusan penamaan sebaiknya dianggap **permanen sejak awal**, dan biayanya untuk melakukannya dengan benar nyaris nol di hari pertama. Berikut daftar yang cukup diputuskan sekali lalu dipegang di seluruh API.',
      ),
      table(
        ['Keputusan', 'Pilih salah satu, lalu pegang'],
        [
          ['Tunggal atau jamak', '`/pesanan` jamak untuk semua, termasuk yang menunjuk satu baris'],
          ['Pemisah kata', '`kebab-case` di alamat, misalnya `/metode-pembayaran`'],
          ['Bahasa', 'Satu bahasa untuk seluruh API — jangan campur `orders` dan `pesanan`'],
          ['Nama field', 'Satu gaya, `snake_case` atau `camelCase`, dan tidak pernah dicampur'],
          ['Letak versi', 'Di jalur (`/v1/...`) atau di header — pilih satu'],
          ['Bentuk id', 'Angka atau string, dan **id besar selalu string**'],
        ],
      ),
      p('Baris terakhir bukan soal selera melainkan soal kerusakan data yang bisa diukur.'),
      code(
        'text',
        `
        Server mengirim  {"id":9007199254740993,"judul":"x"}

          setelah JSON.parse di klien : 9007199254740992
          sama dengan yang dikirim?   : false
        `,
        {
          caption:
            'Dijalankan sungguhan dengan Node 26.5.0. Klien JavaScript adalah pemakai API yang paling umum.',
        },
      ),
      p(
        'Id yang berubah satu digit tidak menghasilkan error apa pun. Ia menghasilkan permintaan berikutnya yang menunjuk baris **lain**, atau menunjuk baris yang tidak ada. Mengubahnya dari angka menjadi string setelah ada klien yang memakainya berarti memutus setiap klien itu, jadi keputusannya diambil sebelum klien pertama lahir.',
      ),
      p(
        'Kelompok kesalahan terakhir adalah menaruh sesuatu di alamat yang seharusnya tidak pernah ada di sana.',
      ),
      code(
        'text',
        `
        JANGAN pernah:
          /login?sandi=rahasia123
          /berkas?token=eyJhbGciOi...
          /pengguna?nik=3273011234560001

        Alasannya bukan estetika. URL tercatat di:
          - log server dan log proxy, yang disimpan berbulan-bulan
          - riwayat peramban
          - header Referer, yang ikut terkirim ke situs pihak ketiga
          - tangkapan layar dan tautan yang dibagikan

        HTTPS menyembunyikannya dari jaringan, BUKAN dari semua tempat di atas.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penamaan adalah bagian API yang paling murah dibereskan di hari pertama dan paling mahal diubah di bulan keenam.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh kata kerja di alamat, misalnya `/getPesanan`',
            'Namanya jadi jelas menyebutkan aksinya',
            'Kata kerja sudah ada di method HTTP. Mengulangnya membuat method-nya berhenti berarti apa-apa',
          ],
          [
            'Bersarang tiga tingkat atau lebih',
            'Menggambarkan hubungan datanya',
            'Klien harus tahu seluruh rantainya, dan setiap perubahan struktur memutus alamatnya',
          ],
          [
            'Mencampur tunggal dan jamak',
            'Satu baris memang tunggal',
            'Klien harus menghafal mana yang mana. Pilih satu bentuk untuk seluruh API',
          ],
          [
            'Mencampur bahasa Inggris dan Indonesia',
            'Yang penting terbaca',
            '`/orders/42/pesanan` memaksa pembaca menebak. Satu bahasa, tanpa kecuali',
          ],
          [
            'Mengirim id besar sebagai angka',
            'Id memang angka',
            'Diukur, `9007199254740993` menjadi `...992` di klien JavaScript, tanpa error apa pun',
          ],
          [
            'Menunda `/v1` sampai benar-benar dibutuhkan',
            'Sekarang belum perlu',
            'Saat dibutuhkan, sudah ada klien yang tidak bisa diubah. Biayanya sekarang nol',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas ditegaskan karena penundaannya selalu terasa masuk akal. Menambahkan `/v1` di hari pertama tidak menambah satu pun kerumitan, tidak mengubah cara kerja apa pun, dan tidak perlu dipikirkan lagi sesudahnya. Tanpa itu, satu-satunya pilihan pada hari sebuah perubahan harus memutus kompatibilitas adalah memaksa seluruh klien berubah bersamaan, dan aplikasi ponsel yang sudah terpasang di perangkat pengguna tidak bisa dipaksa begitu.',
      ),
      references(
        {
          label: 'RFC 9110 — HTTP Semantics',
          href: 'https://www.rfc-editor.org/rfc/rfc9110.html',
          source: 'IETF',
          note: 'Dasar semantik yang membuat "kata benda di URL, kata kerja di method" masuk akal.',
        },
        {
          label: 'RFC 3986 — URI Generic Syntax',
          href: 'https://www.rfc-editor.org/rfc/rfc3986.html',
          source: 'IETF',
          note: 'Bentuk resmi URL beserta bagian-bagiannya yang dinamai di sub-bab ini.',
        },
        {
          label: 'REST Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Termasuk larangan menaruh token dan data pribadi di URL.',
        },
        {
          label: 'Referer header',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referer',
          source: 'MDN Web Docs',
          note: 'Salah satu jalur bocornya URL ke pihak lain saat pengguna mengeklik tautan keluar.',
        },
      ),
    ],
  ),

  written(
    'status-code-tepat',
    'Memilih Status Code yang Tepat',
    20,
    'Kode yang salah membuat klien menangani kegagalan dengan cara yang salah.',
    [
      p(
        'Status code bukan hiasan — ia adalah bagian dari kontrak yang menentukan **apa yang klien lakukan berikutnya**. Klien memutuskan untuk mencoba lagi, meminta login ulang, atau menampilkan pesan berdasarkan angka itu.',
      ),

      terms(
        {
          term: 'status code sebagai kontrak',
          meaning:
            'Status code **bukan hiasan** — ia menentukan **apa yang klien lakukan berikutnya**. Klien memutuskan mencoba lagi, meminta login ulang, atau menampilkan pesan berdasarkan angka itu, bukan berdasarkan isi body.',
        },
        {
          term: '4xx vs 5xx',
          meaning:
            'Garis pemisah yang paling menentukan. `4xx` berarti **"kamu yang salah"**, sehingga mengulang permintaan yang sama tidak akan menolong. `5xx` berarti **"aku yang salah"**, sehingga mencoba lagi masuk akal.',
        },
        {
          term: 'biaya salah memakai 500',
          meaning:
            'Bukan sekadar kerapian. Klien **akan mencoba lagi** karena `5xx` berarti "mungkin sementara". Permintaan cacat itu diulang terus, membebani server, dan **membanjiri alarm** sehingga kegagalan server yang sungguhan tenggelam.',
        },
        {
          term: '400 vs 422',
          meaning:
            '`400` berarti **parser gagal**, sehingga server tidak bisa memahami bentuknya. `422` berarti bentuknya sah tetapi **isinya melanggar aturan**. Bedanya berguna, karena `400` menandakan bug di kode klien sedangkan `422` menandakan pengguna perlu memperbaiki isiannya.',
        },
        {
          term: '409 Conflict',
          meaning:
            'Permintaannya sah, tapi **bentrok dengan keadaan sekarang** — pesanan sudah dikirim, email sudah terdaftar, versi yang diubah sudah usang. Berbeda dari `422`: bentuk dan isinya benar, keadaannya yang tidak memungkinkan.',
        },
        {
          term: '409 yang membocorkan akun',
          meaning:
            'Pada pendaftaran publik, membedakan "email sudah ada" dari "berhasil" **memberi penyerang daftar akun**. Kalau alurmu memakai verifikasi email, jawab `202` yang sama untuk keduanya — yang membedakan hanya isi email yang diterima pemiliknya.',
        },
        {
          term: '201 + Location',
          meaning:
            'Jawaban untuk pembuatan sumber daya baru, dipasangkan dengan header `Location` berisi alamatnya. Klien jadi tahu ke mana harus pergi **tanpa menebak** bentuk URL dari id yang dikembalikan.',
        },
        {
          term: '204 tanpa body',
          meaning:
            'Aturan spesifikasi, bukan gaya: `204` **tidak boleh punya body**. Sebagian klien HTTP gagal mengurainya, sebagian lain diam-diam mengabaikannya. Kalau perlu mengirim sesuatu setelah `DELETE`, pakai `200`.',
        },
        {
          term: 'konsistensi > kesempurnaan',
          meaning:
            'Ada perdebatan sah antara `400` dan `422`, atau `403` dan `404`. Yang **tidak** bisa ditawar: endpoint berbeda tidak boleh menjawab kasus yang sama dengan kode berbeda. Tulis keputusanmu, lalu tegakkan di seluruh API.',
        },
      ),

      h2('Kelompok besar'),
      table(
        ['Kelas', 'Artinya bagi klien'],
        [
          ['`2xx`', 'Berhasil — lanjutkan'],
          ['`3xx`', 'Pergi ke tempat lain'],
          ['`4xx`', '**Kamu yang salah** — mengulang permintaan yang sama tidak akan menolong'],
          ['`5xx`', '**Aku yang salah** — mencoba lagi masuk akal'],
        ],
      ),
      callout(
        'danger',
        'Menjawab `500` untuk kesalahan klien punya biaya nyata',
        'Klien akan mencoba lagi — karena `5xx` berarti "mungkin sementara". Permintaan yang cacat itu diulang terus, membebani server, dan membanjiri alarm sehingga kegagalan server yang sungguhan tenggelam. JSON rusak adalah `400`, bukan `500`.',
      ),

      h2('Yang sering tertukar'),
      table(
        ['Kode', 'Kapan dipakai', 'Sering salah dipakai untuk'],
        [
          ['`400`', 'Bentuk permintaan cacat: JSON rusak, tipe salah', 'Semua kesalahan klien'],
          ['`401`', 'Tidak tahu kamu siapa', 'Tahu siapa tapi tidak berhak'],
          [
            '`403`',
            'Tahu siapa, tapi tidak berhak',
            'Data yang tidak boleh diketahui keberadaannya',
          ],
          ['`404`', 'Tidak ada, atau tidak berhak tahu ia ada', 'Daftar yang hasilnya kosong'],
          ['`409`', 'Bentrok dengan keadaan sekarang', 'Kegagalan validasi biasa'],
          ['`422`', 'Bentuk benar, isi tidak lolos aturan', '`400`'],
          ['`429`', 'Terlalu banyak permintaan', '`403`'],
        ],
      ),

      h2('`400` vs `422`'),
      code(
        'text',
        `
        # 400 — parser gagal. Server tidak bisa memahami bentuknya.
        POST /artikel
        { "judul": "Halo",

        # 422 — bentuknya sah, isinya melanggar aturan bisnis.
        POST /artikel
        { "judul": "", "isi": "..." }
        `,
      ),
      p(
        'Bedanya berguna bagi klien: `400` berarti ada bug di kode klien; `422` berarti pengguna perlu memperbaiki isiannya. Keduanya ditangani sangat berbeda di antarmuka.',
      ),

      h2('`409 Conflict`'),
      code(
        'text',
        `
        # Bentrok keadaan — bukan kesalahan bentuk
        POST /pesanan/42/pembatalan   -> 409 "pesanan sudah dikirim"
        POST /pengguna                -> 409 "email sudah terdaftar"
        PUT  /artikel/7               -> 409 "versi yang kamu ubah sudah usang"
        `,
      ),
      p(
        'Ketiga baris ini punya satu kesamaan yang membedakannya dari `422`: **permintaannya tidak salah apa pun**. Body-nya sah, isinya lolos setiap aturan, dan permintaan yang persis sama akan berhasil bila dikirim beberapa menit lebih awal. Yang menolak adalah **keadaan sumber daya saat ini** — pesanan sudah dikirim, email sudah dipakai, artikel sudah diubah orang lain.',
      ),
      p(
        'Bedanya penting bagi klien karena menentukan apa yang harus dilakukan berikutnya. `422` berarti "perbaiki isian lalu kirim lagi", sehingga tampilkan pesan di sebelah field yang salah. `409` berarti "isianmu benar, tapi dunia sudah berubah", sehingga yang tepat adalah memuat ulang keadaan terbaru dan menunjukkannya kepada pengguna. Baris ketiga adalah bentuk paling khas, yaitu dua orang menyunting artikel yang sama, dan `409` mencegah suntingan yang belakangan menimpa yang duluan tanpa ada yang menyadarinya.',
      ),
      callout(
        'warning',
        '`409` untuk email terdaftar membocorkan akun',
        'Pada endpoint pendaftaran publik, membedakan "email sudah ada" dari "berhasil" memberi penyerang daftar akun. Kalau pendaftaranmu memakai verifikasi email, jawab `202 Accepted` yang sama untuk keduanya — yang membedakan hanyalah isi email yang diterima pemiliknya.',
      ),

      h2('`2xx` yang bukan `200`'),
      table(
        ['Kode', 'Untuk'],
        [
          ['`201 Created`', 'Sumber daya baru dibuat — sertakan header `Location`'],
          ['`202 Accepted`', 'Diterima, diproses belakangan — sertakan cara memantaunya'],
          ['`204 No Content`', 'Berhasil, tidak ada yang perlu dikirim — **body harus kosong**'],
        ],
      ),
      code(
        'text',
        `
        HTTP/1.1 201 Created
        Location: /api/artikel/42

        { "data": { "id": 42, "judul": "Halo" } }
        `,
      ),
      p(
        'Header `Location` adalah bagian yang paling sering dilupakan pada `201`, padahal ia yang membuat kode itu berbeda dari `200`. Ia memberi tahu klien **di mana benda yang baru lahir itu tinggal**, sehingga klien tidak perlu menebak alamatnya dari isi respons. Perhatikan nilainya alamat lengkap ke sumber daya barunya, bukan alamat endpoint yang tadi dipanggil.',
      ),
      p(
        'Body tetap disertakan di sini, dan itu bukan pemborosan: tanpanya, klien harus mengirim satu permintaan `GET` lagi hanya untuk mengetahui `id` serta nilai-nilai yang diisi server (waktu dibuat, slug, status awal). Perhatikan pula ketiga kode di tabel atas punya kewajiban masing-masing yang membuatnya berguna — `201` wajib menyertakan `Location`, `202` wajib memberi cara memantau prosesnya, dan `204` wajib **tidak** berisi apa pun.',
      ),
      callout(
        'danger',
        '`204` dengan body melanggar spesifikasi',
        'Sebagian klien HTTP akan gagal mengurainya, sebagian lain diam-diam mengabaikannya. Kalau kamu perlu mengirim sesuatu setelah `DELETE`, pakai `200` dengan body — jangan `204` yang berisi.',
      ),

      h2('Daftar kosong tetap `200`'),
      code(
        'json',
        `
        // BENAR — pencarian yang tidak menemukan apa pun tetap berhasil
        HTTP/1.1 200 OK
        { "data": [], "meta": { "total": 0 } }
        `,
      ),
      p(
        '`404` berarti endpoint atau sumber dayanya tidak ada. "Tidak ada hasil untuk filtermu" adalah jawaban yang sah — klien yang menerima `404` akan menampilkan halaman error alih-alih empty state.',
      ),

      h2('Konsistensi lebih penting daripada kesempurnaan'),
      p(
        'Ada perdebatan sah antara `400` dan `422`, atau `403` dan `404`. Yang **tidak** bisa ditawar: endpoint yang berbeda tidak boleh menjawab kasus yang sama dengan kode berbeda. Tulis keputusanmu, dan tegakkan di seluruh API.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Status code adalah bagian kontrak yang dibaca oleh hal-hal yang **tidak pernah membaca badan respons**, yaitu cache, CDN, load balancer, pustaka percobaan ulang, dan sistem pemantauan. Karena itu memilihnya asal berarti melumpuhkan seluruh lapisan itu sekaligus.',
      ),
      p(
        'Berikut satu endpoint yang ditulis lengkap dengan seluruh jalur kegagalannya, lalu dijalankan sungguhan untuk delapan keadaan berbeda.',
      ),
      code(
        'text',
        `
          daftar, urut sah       200  application/json
          urut TIDAK dikenal     422  application/problem+json
          urut berisi injeksi    422  application/problem+json
          limit di luar batas    422  application/problem+json
          POST JSON rusak        400  application/problem+json
          POST validasi gagal    422  application/problem+json
          POST judul ganda       409  application/problem+json
          POST sah               201  application/json
                                      Location: /catatan/4
        `,
        { caption: 'Dijalankan sungguhan dengan node:http dan node:sqlite pada Node 26.5.0.' },
      ),
      p(
        'Tiga pasangan di daftar itu yang paling sering tertukar, dan masing-masing menyampaikan sesuatu yang tidak bisa disampaikan yang lain.',
      ),
      table(
        ['Pasangan', 'Bedanya', 'Yang bisa dilakukan klien'],
        [
          [
            '`400` vs `422`',
            '`400` badannya tidak bisa diurai sama sekali; `422` badannya sah tapi isinya melanggar aturan',
            'Pada `422` klien bisa menempelkan pesan di sebelah kolom yang salah; pada `400` ia hanya bisa menampilkan pesan umum',
          ],
          [
            '`401` vs `403`',
            '`401` belum diketahui siapa; `403` sudah diketahui tapi tidak berhak',
            'Pada `401` klien meminta pengguna masuk lagi; pada `403` itu tidak akan menolong',
          ],
          [
            '`404` vs `409`',
            '`404` sumber dayanya tidak ada; `409` ada tapi keadaannya bertabrakan',
            'Pada `409` klien tahu datanya ada dan perlu diselesaikan, misalnya judul yang sudah dipakai',
          ],
        ],
      ),
      p(
        'Kelompok `2xx` juga punya anggota selain `200`, dan memakainya menyampaikan hal yang berguna.',
      ),
      code(
        'text',
        `
        201 Created       sumber daya BARU lahir. WAJIB disertai header Location.
                          Diuji sungguhan: 201 + Location: /catatan/4

        202 Accepted      permintaan diterima, pekerjaannya BELUM selesai.
                          Diuji sungguhan: 202 + Location: /ekspor/<id> + Retry-After: 1

        204 No Content    berhasil, dan memang tidak ada yang perlu dikembalikan.
                          Dipakai DELETE. Badannya HARUS kosong.

        304 Not Modified  isinya tidak berubah sejak yang dipegang klien.
                          Diuji sungguhan: 200 dengan 44 byte -> 304 dengan 0 byte
        `,
        {
          caption:
            'Keempatnya dijalankan sungguhan; angka byte-nya dari pengukuran ETag di sub-bab caching.',
        },
      ),
      p(
        'Baris terakhir menunjukkan apa yang dibeli dengan memakai status yang tepat. Respons `304` mengirim **nol byte badan**, sedangkan `200` untuk isi yang sama mengirim 44 byte. Pada daftar yang besar dan pengguna yang membuka halaman yang sama berulang kali, selisih itu berlipat.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan status code yang paling merusak tidak menghasilkan error sama sekali, yaitu menjawab `200` untuk sesuatu yang gagal.',
      ),
      code(
        'text',
        `
        res.status(200).json({ sukses: false, pesan: 'Stok tidak cukup' })

        Yang membacanya dan menyimpulkan SEHAT:
          - cache peramban dan CDN, yang menyimpannya sebagai jawaban sah
          - load balancer dan pemeriksa kesehatan
          - pustaka percobaan ulang, yang tidak akan mencoba lagi
          - sistem pemantauan, yang melaporkan tingkat error NOL
          - fetch di sisi klien:

              /x -> tidak melempar. r.status=404  r.ok=false
              /y -> tidak melempar. r.status=500  r.ok=false
        `,
        { caption: 'Dua baris terakhir dijalankan sungguhan dengan Node 26.5.0 di bab Fondasi.' },
      ),
      p(
        'Dua baris terakhir itu menjelaskan kenapa `200` untuk kegagalan begitu merusak di sisi klien. Nilai `r.ok` mengikuti status code, bukan isi badan. Membungkus kegagalan dalam `200` berarti `r.ok` bernilai benar, dan setiap klien yang menulis `if (!r.ok) throw ...` akan melanjutkan seolah semuanya berhasil.',
      ),
      p(
        'Kesalahan kebalikannya sama merugikannya, yaitu menjawab `5xx` untuk hal yang bukan kesalahan server.',
      ),
      code(
        'text',
        `
        4xx = PEMANGGILNYA salah  -> tidak membangunkan siapa pun
        5xx = KITA yang salah     -> harus membangunkan seseorang

        JSON rusak dari klien yang dijawab 500 berarti setiap klien yang salah
        ketik membunyikan pemantauan produksi. Setelah beberapa minggu,
        tidak ada lagi yang memperhatikan bunyi itu — termasuk saat ia nyata.

        Diuji sungguhan, bentuk yang benar:
          POST JSON rusak  -> 400  (badannya tidak bisa diurai)
          POST judul ganda -> 409  (badannya sah, keadaannya bertabrakan)
        `,
      ),
      p(
        'Ada satu kasus yang hampir selalu salah dijawab dan sebenarnya sangat sederhana, yaitu **daftar yang kosong**.',
      ),
      code(
        'text',
        `
        GET /catatan?status=arsip   -> tidak ada satu pun yang cocok

        SALAH : 404 Not Found
        BENAR : 200 dengan { "data": [] }

        Alamat /catatan ADA dan berhasil dilayani. Yang kosong adalah hasil
        penyaringannya, dan itu bukan kegagalan. Menjawab 404 memaksa klien
        membedakan "alamatnya salah" dari "tidak ada yang cocok",
        padahal keduanya tampak sama.
        `,
      ),
      p(
        'Kelompok terakhir adalah status yang jarang dipakai padahal menutup masalah nyata, dan dua di antaranya sudah diukur di sub-bab caching.',
      ),
      code(
        'text',
        `
        PUT tanpa header If-Match
          -> 428 Precondition Required
             { "error": "Header If-Match wajib" }

        Dua penyunting memegang versi yang sama:
          penyunting A: PUT + If-Match   -> 200, versinya naik
          penyunting B: PUT + If-Match lama -> 412 Precondition Failed
             { "error": "Data sudah diubah orang lain", "etagSekarang": "..." }

        Tanpa keduanya, perubahan penyunting A HILANG ditimpa penyunting B,
        dan tidak ada satu pun error yang muncul.
        `,
        { caption: 'Dijalankan sungguhan dengan node:http pada Node 26.5.0.' },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Status code terasa seperti detail yang bisa dirapikan nanti, padahal ia bagian kontrak yang paling banyak dibaca mesin.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menjawab `200` dengan `{ sukses: false }`',
            'Kliennya kan membaca badan respons',
            'Diuji sungguhan, `r.ok` mengikuti status code. Cache, pemantauan, dan retry semuanya menyimpulkan sehat',
          ],
          [
            'Memakai `400` untuk semua masukan bermasalah',
            'Semuanya salah masukan',
            'Kehilangan beda antara badan yang tidak bisa diurai dan isi yang melanggar aturan. Yang kedua `422`',
          ],
          [
            'Menjawab `500` untuk JSON rusak dari klien',
            'Errornya memang terjadi',
            'Pemantauan berbunyi untuk kesalahan pemanggil. Setelah beberapa minggu bunyinya diabaikan',
          ],
          [
            'Menjawab `404` untuk daftar kosong',
            'Tidak ada yang ditemukan',
            'Alamatnya ada dan berhasil dilayani. Jawab `200` dengan array kosong',
          ],
          [
            'Menjawab `201` tanpa header `Location`',
            'Datanya sudah ada di badan',
            'Klien harus menebak alamat sumber daya baru. `Location` adalah bagian kontrak `201`',
          ],
          [
            'Memakai `403` untuk sumber daya milik orang lain',
            'Lebih jujur',
            'Itu mengakui bahwa sumber daya bernomor itu ADA. Untuk data pribadi, `404` menutup kebocoran',
          ],
        ],
      ),
      p(
        'Baris terakhir memuat pertukaran yang layak diputuskan sadar dan **konsisten**. Menjawab `404` untuk sumber daya milik orang lain menyembunyikan keberadaannya, dan itu benar untuk faktur, berkas, dan dokumen yang keberadaannya sendiri bersifat rahasia. Menjawab `403` lebih tepat untuk hal yang memang publik dan hanya aksinya yang dibatasi, misalnya menghapus artikel yang bisa dibaca siapa pun. Yang tidak boleh adalah mencampurnya, sebab selisih antara endpoint yang menjawab `403` dan yang menjawab `404` untuk situasi yang sama menjadi bocoran tersendiri.',
      ),
      references(
        {
          label: 'RFC 9110 §15 — Status Codes',
          href: 'https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes',
          source: 'IETF',
          note: 'Definisi resmi setiap kode, termasuk larangan body pada `204`.',
        },
        {
          label: 'HTTP response status codes',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status',
          source: 'MDN Web Docs',
          note: 'Rujukan yang lebih mudah dibaca, dengan contoh pemakaian tiap kode.',
        },
        {
          label: '422 Unprocessable Content',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422',
          source: 'MDN Web Docs',
          note: 'Batas antara "tidak bisa diurai" (`400`) dan "ditolak aturan" (`422`).',
        },
        {
          label: 'Authentication Cheat Sheet — account enumeration',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa `409` pada pendaftaran publik bisa menjadi alat enumerasi akun.',
        },
      ),
    ],
  ),

  written(
    'bentuk-error',
    'Bentuk Error Seragam (RFC 9457)',
    18,
    'Satu bentuk respons gagal yang bisa diandalkan setiap klien.',
    [
      p(
        'Klien harus bisa menangani kegagalan tanpa menebak. Kalau setiap endpoint mengembalikan bentuk error yang berbeda, setiap pemanggilan butuh penanganan khusus — dan satu yang terlewat menghasilkan layar putih.',
      ),

      terms(
        {
          term: 'bentuk error seragam',
          meaning:
            'Satu bentuk badan error untuk **seluruh** API. Tanpanya, setiap pemanggilan butuh penanganan khusus — dan satu yang terlewat menghasilkan layar putih. Nilainya bagi klien: satu penangan error, bukan satu per endpoint.',
        },
        {
          term: 'RFC 9457',
          meaning:
            'Standar resmi bentuk error HTTP, dulu bernama RFC 7807. Ia menetapkan sekumpulan field baku berupa `type`, `title`, `status`, `detail`, dan `instance`, lalu **membolehkan** kamu menambah field sendiri di sampingnya.',
        },
        {
          term: 'application/problem+json',
          meaning:
            '`Content-Type` khusus untuk badan error RFC 9457. Ia memberi tahu klien bahwa bentuknya bisa diandalkan — sebelum ia sempat membaca isinya.',
        },
        {
          term: 'type sebagai URI',
          meaning:
            'Field `type` bukan sekadar string bebas: ia **URI yang mengidentifikasi jenis masalah**, dan idealnya bisa dibuka untuk membaca dokumentasinya. Ia yang stabil, sementara `detail` boleh berubah per kejadian.',
        },
        {
          term: 'kode error stabil',
          meaning:
            'String seperti `VALIDASI_GAGAL` atau `SALDO_TIDAK_CUKUP`. **Pesan boleh berubah, diterjemahkan, atau diperhalus; kode tidak.** Perlakukan ia sebagai bagian kontrak: menambah kode baru aman, mengubah arti kode lama tidak.',
        },
        {
          term: 'requestId di badan error',
          meaning:
            'Correlation id yang ikut dikirim ke klien. Ia yang membuat detail lengkap bisa tinggal di **log server** sementara pengguna tetap punya sesuatu untuk dilaporkan — dan kamu bisa menemukan permintaannya persis.',
        },
        {
          term: 'pesan database sebagai peta',
          meaning:
            'Bahaya yang sering diremehkan. `duplicate key value violates unique constraint "pengguna_email_key"` memberi tahu **nama tabel, nama kolom, dan nama constraint** — struktur databasemu, tanpa penyerang perlu menebak.',
        },
        {
          term: 'error per field',
          meaning:
            'Peta `{ "judul": "wajib diisi" }` yang menyebut **field mana** yang salah. Ia yang membuat antarmuka bisa menampilkan pesan di sebelah input yang bersangkutan, alih-alih satu pesan umum di atas form.',
        },
        {
          term: 'notasi titik untuk nested',
          meaning:
            'Bentuk `"tag_ids.2"` yang menunjuk elemen ketiga sebuah array, atau `"alamat.kota"` untuk objek bersarang. Konvensi ini yang membuat error pada struktur dalam tetap bisa dipetakan ke input yang tepat.',
        },
      ),

      h2('Masalahnya'),
      code(
        'json',
        `
        // Endpoint A
        { "error": "Judul wajib diisi" }

        // Endpoint B
        { "message": "validation failed", "errors": { "judul": ["required"] } }

        // Endpoint C
        { "success": false, "msg": "gagal", "code": 4001 }

        // Endpoint D — plain text
        Internal Server Error
        `,
      ),
      p(
        'Empat endpoint di **satu API yang sama**, empat bentuk error yang tidak ada hubungannya satu sama lain. Bacalah dari sudut pandang klien: untuk mengetahui apakah sebuah permintaan gagal, ia harus memeriksa `error` (A), lalu `success` (C), lalu apakah responsnya JSON sama sekali (D). Setiap endpoint baru menuntut satu cabang penanganan baru, dan cabang yang terlewat muncul sebagai layar kosong tanpa pesan.',
      ),
      p(
        'Perhatikan endpoint D adalah yang terburuk sekaligus paling sering terjadi: teks polos itu biasanya jawaban bawaan framework saat ada error yang tidak tertangani. Kliennya memanggil `response.json()`, gagal mengurainya, dan melempar error kedua yang **menutupi** error aslinya — sehingga pesan yang sampai ke pengguna sama sekali tidak menjelaskan apa yang sebenarnya salah. Itulah alasan penampung error di ujung rantai middleware tidak bisa ditawar.',
      ),

      h2('RFC 9457 — Problem Details'),
      p(
        'Standar resmi untuk bentuk error HTTP. Ia menetapkan sekumpulan field baku, dan kamu boleh menambah field sendiri.',
      ),
      code(
        'json',
        `
        HTTP/1.1 422 Unprocessable Content
        Content-Type: application/problem+json

        {
          "type": "https://contoh.com/masalah/validasi",
          "title": "Data yang dikirim tidak valid",
          "status": 422,
          "detail": "Judul wajib diisi dan maksimal 200 karakter.",
          "instance": "/api/artikel",

          "errors": {
            "judul": ["wajib diisi"],
            "isi": ["maksimal 10000 karakter"]
          },
          "requestId": "a1b2c3d4"
        }
        `,
      ),
      p(
        'Perhatikan `Content-Type: application/problem+json`, bukan `application/json` biasa. Itu bagian dari standarnya: klien bisa mengenali "ini badan error berformat baku" dari header saja, tanpa menebak dari isinya. Perbedaan paling penting di dalam badan itu adalah antara `type` dan `detail`. `type` adalah **URI yang stabil** yang menandai jenis masalah — inilah yang dicocokkan program, dan ia tidak boleh berubah. `detail` adalah kalimat untuk kejadian ini saja, dan boleh diubah atau diterjemahkan kapan pun.',
      ),
      p(
        'Dua field terakhir adalah tambahanmu sendiri, dan standarnya memang mengizinkan itu. `errors` membawa rincian **per field** — inilah yang memungkinkan antarmuka menempelkan "wajib diisi" tepat di bawah input judul, bukan sebagai satu pesan umum di atas formulir. Dan `requestId` menyambungkan respons ini ke baris log di servermu; pengguna melaporkan kode delapan karakter itu, dan kamu menemukan jejak lengkapnya tanpa menebak dari perkiraan waktu.',
      ),
      table(
        ['Field', 'Isinya'],
        [
          ['`type`', 'URI yang mengidentifikasi **jenis** masalah — stabil, bisa didokumentasikan'],
          ['`title`', 'Ringkasan singkat, sama untuk setiap `type`'],
          ['`status`', 'Sama dengan status code HTTP-nya'],
          ['`detail`', 'Penjelasan khusus untuk kejadian ini'],
          ['`instance`', 'URI kejadiannya'],
        ],
      ),

      h2('Kalau tidak memakai RFC 9457'),
      p('Bentuk sederhana pun tidak masalah — asalkan **satu bentuk untuk seluruh API**:'),
      code(
        'json',
        `
        {
          "error": {
            "kode": "VALIDASI_GAGAL",
            "pesan": "Data yang dikirim tidak valid",
            "field": { "judul": "wajib diisi" },
            "requestId": "a1b2c3d4"
          }
        }
        `,
      ),
      p(
        'Bentuk ini membawa **informasi yang sama** dengan RFC 9457, hanya dengan nama field sendiri: `kode` menggantikan `type`, `pesan` menggantikan `title`/`detail`, `field` menggantikan `errors`. Yang tidak boleh hilang adalah pembagian perannya — satu penanda yang **stabil dan dibaca program** (`kode`), satu kalimat yang **boleh berubah dan dibaca manusia** (`pesan`), dan penanda penelusuran (`requestId`).',
      ),
      p(
        'Perhatikan seluruhnya dibungkus satu kunci `error`. Pembungkus itu yang membuat klien bisa membedakan sukses dari gagal dengan satu pemeriksaan, apa pun endpoint-nya — pasangan dari `{ data, meta }` pada respons berhasil. Pilih salah satu bentuk ini, tulis keputusannya, lalu tegakkan di **seluruh** API: yang merugikan klien bukan bentuk mana yang kamu pilih, melainkan adanya dua bentuk sekaligus.',
      ),
      callout(
        'tip',
        'Kode error lebih berharga daripada pesannya',
        'Pesan boleh berubah, diterjemahkan, atau diperhalus. Kode seperti `VALIDASI_GAGAL` atau `SALDO_TIDAK_CUKUP` adalah yang dipakai klien untuk bercabang. Perlakukan kode sebagai bagian kontrak: menambahnya aman, mengubah artinya tidak.',
      ),

      h2('Apa yang tidak boleh ada di dalamnya'),
      compare(
        {
          title: 'Membocorkan',
          lang: 'json',
          code: `
          {
            "error": {
              "pesan": "duplicate key value violates
                unique constraint
                \\"pengguna_email_key\\"",
              "stack": "at Pool.query (/app/src/
                repositories/pengguna.js:42)",
              "query": "INSERT INTO pengguna ..."
            }
          }
          `,
          notes: ['Nama tabel, nama constraint, jalur berkas, struktur query'],
        },
        {
          title: 'Aman',
          lang: 'json',
          code: `
          {
            "error": {
              "kode": "SUDAH_TERDAFTAR",
              "pesan": "Data sudah ada",
              "requestId": "a1b2c3d4"
            }
          }
          `,
          notes: ['Detail lengkapnya ada di log server, dikaitkan lewat requestId'],
        },
      ),
      p(
        'Kolom kiri tidak dibuat oleh orang yang ceroboh — ia lahir dari niat baik "supaya mudah di-debug". Masalahnya, yang menerima respons itu **bukan hanya kamu**. Baca apa yang diserahkannya kepada siapa pun yang mengirim permintaan: nama tabel `pengguna`, nama constraint `pengguna_email_key` yang mengungkap kolom `email` itu unik, jalur berkas `/app/src/repositories/pengguna.js` yang membocorkan struktur project, dan potongan `INSERT` yang memperlihatkan bentuk query-mu. Itu peta gratis untuk menyusun serangan berikutnya.',
      ),
      p(
        'Kolom kanan tidak menghilangkan informasinya, melainkan **memindahkannya**. Seluruh detail tadi tetap dicatat di log server, dan `requestId` adalah benang yang menyambungkan keduanya. Perhatikan pula `kode` berubah dari pesan database mentah menjadi `SUDAH_TERDAFTAR`, sehingga klien tetap bisa bercabang dengan tepat, tanpa perlu tahu satu pun detail internal. Aturan umumnya, error yang **kamu buat sendiri** boleh pesannya diteruskan, sedangkan error yang datang dari database atau paket pihak ketiga tidak pernah boleh.',
      ),
      callout(
        'danger',
        'Pesan error database adalah peta bagi penyerang',
        'Nama tabel, nama kolom, dan nama constraint memberi tahu struktur databasemu tanpa penyerang perlu menebak. Untuk `5xx`, jangan pernah meneruskan pesan aslinya ke klien — kirim `requestId` supaya kamu tetap bisa menelusurinya di log.',
      ),

      h2('Error validasi per field'),
      code(
        'json',
        `
        {
          "error": {
            "kode": "VALIDASI_GAGAL",
            "pesan": "Data yang dikirim tidak valid",
            "field": {
              "judul": "wajib diisi",
              "tag_ids.2": "harus bilangan bulat",
              "penulis.email": "format email tidak sah"
            }
          }
        }
        `,
      ),
      p(
        'Kunci memakai notasi titik supaya klien bisa memetakannya langsung ke field formulir — termasuk yang bersarang dan yang di dalam array.',
      ),

      h2('Sertakan `requestId` di setiap error'),
      code(
        'js',
        `
        res.setHeader('X-Request-Id', req.id);
        `,
      ),
      p(
        'Saat pengguna melapor "tadi gagal", satu id membuatmu menemukan persis permintaan itu di log — tanpa menebak dari perkiraan waktu, dan tanpa harus membocorkan detail apa pun ke klien.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Bentuk error adalah bagian API yang paling sering dibiarkan tumbuh sendiri, dan hasilnya adalah satu API dengan lima bentuk kegagalan berbeda. Klien lalu menulis lima penanganan, dan yang keenam pasti salah.',
      ),
      code(
        'text',
        `
        Lima bentuk yang biasanya lahir di satu API yang sama:

          { "error": "Tidak ditemukan" }
          { "message": "Validation failed", "errors": { "judul": ["required"] } }
          { "success": false, "msg": "stok kurang" }
          { "detail": "Internal Server Error" }
          "Bad Request"                        <- bahkan bukan JSON

        Klien harus memeriksa lima kunci berbeda untuk mengetahui apa yang salah.
        `,
      ),
      p(
        'Standar yang menyelesaikan ini bernama RFC 9457 Problem Details, dan yang membuatnya berguna bukan namanya melainkan bahwa ia sudah memutuskan nama-nama fieldnya untukmu. Berikut hasilnya dijalankan sungguhan pada satu endpoint dengan empat jalur kegagalan.',
      ),
      code(
        'text',
        `
        POST /catatan  dengan badan {judul:"x"}   (bukan JSON yang sah)

          400  Content-Type: application/problem+json
          {
            "type": "https://contoh.id/masalah/badan-tidak-bisa-diurai",
            "title": "Badan permintaan bukan JSON yang sah",
            "status": 400,
            "instance": "/catatan",
            "requestId": "b6f7cfb0-4905-43f3-8b7a-9bcc94c41a54",
            "detail": "Expected property name or '}' in JSON at position 1 (line 1 column 2)"
          }
        `,
        { caption: 'Dijalankan sungguhan dengan node:http pada Node 26.5.0.' },
      ),
      p(
        'Lima field pertamanya punya arti yang sudah ditetapkan standar. Field `type` adalah **identitas jenis masalahnya** dan berupa URL, sehingga klien bisa mencocokkannya tanpa membaca teks apa pun. Field `title` adalah kalimat untuk manusia, dan ia boleh berubah kapan saja tanpa memutus klien, tepat karena yang dicocokkan klien adalah `type`. Field `status` mengulang status code, `instance` menyebut alamat yang bermasalah, dan `requestId` adalah yang menghubungkan respons ini dengan satu baris di log server.',
      ),
      code(
        'text',
        `
        POST /catatan  dengan badan {"judul":"   ","prioritas":9}

          422  Content-Type: application/problem+json
          {
            "type": "https://contoh.id/masalah/validasi-gagal",
            "title": "Validasi gagal",
            "status": 422,
            "instance": "/catatan",
            "requestId": "ab882576-1e86-43f7-b764-e7e10d68d2ad",
            "errors": [
              { "field": "judul", "pesan": "Wajib diisi" },
              { "field": "prioritas", "pesan": "Harus bilangan bulat 1 sampai 5" }
            ]
          }
        `,
        {
          caption:
            'Dijalankan sungguhan. SELURUH field yang salah dilaporkan sekaligus, bukan satu per satu.',
        },
      ),
      p(
        'Kata "sekaligus" itu yang menentukan kualitas formulir di sisi klien. Dengan daftar `errors` per field, antarmuka bisa menyorot kedua kolom yang bermasalah dalam satu kali kirim. Tanpa itu, pengguna memperbaiki satu kolom, mengirim ulang, lalu menemukan kolom kedua juga salah, dan seterusnya.',
      ),
      p(
        'Field `errors` itu **bukan** bagian standar RFC 9457, melainkan tambahan yang memang diperbolehkan standar tersebut. Yang penting adalah namanya diputuskan sekali dan dipakai di seluruh API.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan paling berbahaya pada bentuk error bukan bentuknya melainkan **apa yang bocor lewatnya**.',
      ),
      code(
        'text',
        `
        JANGAN. Keempatnya pernah ditemukan di API produksi sungguhan.

          { "error": "connect ECONNREFUSED 10.0.3.17:5432" }
              -> membocorkan alamat internal basis data

          { "error": "ERROR: duplicate key value violates unique constraint
                      \\"pelanggan_email_key\\"" }
              -> membocorkan nama tabel dan nama batasan

          { "stack": "at Object.<anonymous> (/app/src/layanan/pesanan.js:42:15)" }
              -> membocorkan struktur folder server

          { "error": "Sandi salah untuk rina@contoh.id" }
              -> membenarkan bahwa alamat itu terdaftar
        `,
      ),
      p(
        'Keempatnya lahir dari niat baik yang sama, yaitu ingin membantu penelusuran. Jalan keluarnya bukan menghilangkan keterangan itu melainkan **memindahkannya ke log server** dan memberi klien satu pengenal untuk menemukannya.',
      ),
      code(
        'ts',
        `
        // Yang KELUAR ke klien: sedikit, dan tidak menyebutkan apa pun tentang dalamnya.
        {
          "type": "https://contoh.id/masalah/kesalahan-server",
          "title": "Terjadi kesalahan di server",
          "status": 500,
          "requestId": "8aaf7722-176e-46f2-8128-19b7dd8716a1"
        }

        // Yang MASUK ke log server: lengkap.
        logger.error({
          requestId,
          pesan: err.message,
          stack: err.stack,
          query: err.query,      // aman di sini, tidak aman di respons
        });
        `,
        { caption: 'requestId yang sama muncul di keduanya, dan itu yang menghubungkannya.' },
      ),
      p(
        'Pengenal itu juga harus dikembalikan lewat **header**, bukan hanya di badan respons, sebab kegagalan yang paling perlu ditelusuri sering justru yang badannya tidak berhasil terbaca klien.',
      ),
      code(
        'text',
        `
        Diukur sungguhan di bab Fondasi, id yang sama menghubungkan tiga tempat:

          curl -H 'X-Request-Id: jejak-manual-123' http://127.0.0.1:3998/catatan

          header respons : X-Request-Id: jejak-manual-123
          log server     : {"level":"info", ... ,"requestId":"jejak-manual-123", ... }
        `,
        { caption: 'Dijalankan sungguhan dengan Node 26.5.0 dan curl 8.5.0.' },
      ),
      p(
        'Kegagalan terakhir bersifat teknis dan sering luput, yaitu **Content-Type yang salah pada respons error**.',
      ),
      code(
        'text',
        `
        Diuji sungguhan:

          jalur sukses : Content-Type: application/json
          jalur gagal  : Content-Type: application/problem+json

        Perbedaannya penting bagi perantara. Sebuah gateway atau pustaka klien
        bisa mengenali problem+json dan menanganinya secara khusus tanpa
        harus menebak dari isi badannya.

        Yang JAUH lebih buruk, dan sering terjadi tanpa disadari:

          jalur gagal  : Content-Type: text/html

        Itu berarti yang menjawab BUKAN aplikasimu melainkan proxy atau
        gateway di depannya. Gejalanya di klien sudah diukur di bab Fondasi:

          SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Bentuk error adalah bagian kontrak yang paling sering berubah-ubah tanpa disengaja, sebab setiap jalur kegagalan ditulis pada waktu yang berbeda.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai bentuk error yang berbeda per endpoint',
            'Masing-masing sudah jelas',
            'Klien menulis beberapa penanganan berbeda, dan yang berikutnya pasti salah. Putuskan satu bentuk',
          ],
          [
            'Menyertakan pesan error asli dari basis data',
            'Supaya mudah ditelusuri',
            'Membocorkan nama tabel, nama batasan, dan alamat internal. Catat di server, kirim `requestId`',
          ],
          [
            'Menyertakan `stack` di respons',
            'Membantu saat mengembangkan',
            'Membocorkan struktur folder server. Simpan di log, dan pastikan tidak ikut di produksi',
          ],
          [
            'Meminta klien mencocokkan teks pesan',
            'Pesannya kan tetap',
            'Pesan akan berubah saat diperbaiki bahasanya atau diterjemahkan. Beri kode atau `type` yang tetap',
          ],
          [
            'Melaporkan satu kesalahan validasi per kali',
            'Satu per satu lebih jelas',
            'Diuji sungguhan, seluruh field bisa dilaporkan sekaligus. Pengguna jadi tidak mengirim ulang berkali-kali',
          ],
          [
            'Tidak mengembalikan `requestId` ke klien',
            'Sudah dicatat di log',
            'Pengguna yang melaporkan bug tidak punya apa pun untuk disebutkan. Kirim lewat header dan badan',
          ],
        ],
      ),
      p(
        'Baris keempat adalah yang paling sering menyebabkan klien rusak oleh perubahan yang dikira aman. Ketika satu-satunya cara klien mengenali sebuah kegagalan adalah mencocokkan kalimat `"Stok tidak cukup"`, maka memperbaiki kalimat itu menjadi `"Stok tidak mencukupi"` adalah perubahan yang memutus. Dengan `type` yang berupa URL tetap, kalimatnya bebas diperbaiki kapan saja, bahkan diterjemahkan ke beberapa bahasa, tanpa satu pun klien terpengaruh.',
      ),
      references(
        {
          label: 'RFC 9457 — Problem Details for HTTP APIs',
          href: 'https://www.rfc-editor.org/rfc/rfc9457.html',
          source: 'IETF',
          note: 'Spesifikasi lengkap beserta arti setiap field baku.',
        },
        {
          label: 'Error Handling Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Batas antara pesan yang boleh sampai ke klien dan yang harus tinggal di log.',
        },
        {
          label: 'Content-Type',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type',
          source: 'MDN Web Docs',
          note: 'Peran `application/problem+json` sebagai penanda bentuk badan error.',
        },
        {
          label: 'Improper Error Handling',
          href: 'https://owasp.org/www-community/Improper_Error_Handling',
          source: 'OWASP',
          note: 'Contoh nyata bagaimana pesan error database dipakai memetakan sistem.',
        },
      ),
    ],
  ),

  written(
    'paginasi',
    'Paginasi: offset vs cursor',
    18,
    'Dua pendekatan dengan trade-off yang berbeda tajam.',
    [
      p(
        'Setiap endpoint daftar **wajib** berpaginasi. Endpoint tanpa batas adalah cara paling mudah menjatuhkan server: satu permintaan yang mengembalikan seluruh tabel cukup untuk menghabiskan memori.',
      ),

      terms(
        {
          term: 'paginasi wajib',
          meaning:
            'Setiap endpoint daftar **harus** berpaginasi — tanpa pengecualian. Endpoint tanpa batas adalah cara paling mudah menjatuhkan server: satu permintaan yang mengembalikan seluruh tabel cukup untuk menghabiskan memori.',
        },
        {
          term: 'paginasi offset',
          meaning:
            'Melewati sekian baris pertama lalu mengambil sekian berikutnya — `?hal=2&per_hal=20`. Mudah dipahami dan bisa lompat ke halaman mana pun. Dua harganya besar: **makin dalam makin lambat**, dan item bisa terlewat atau ganda.',
        },
        {
          term: 'masalah pergeseran',
          meaning:
            'Konsekuensi offset yang jarang disadari. Pengguna membuka halaman 1 (item 1–20). Sementara ia membaca, 5 artikel baru ditambahkan. Di halaman 2, **item 16–20 muncul lagi** dan sebagian item lain tidak pernah muncul. Ini terjadi setiap kali datanya aktif.',
        },
        {
          term: 'biaya COUNT',
          meaning:
            'Menghitung total baris untuk `totalHalaman` memaksa database memindai tabel — mahal pada tabel besar, dan **tidak bisa memakai index** untuk kebanyakan filter. Ini alasan lain paginasi cursor lebih murah.',
        },
        {
          term: 'paginasi cursor',
          meaning:
            'Memakai **posisi baris terakhir** sebagai penanda, bukan angka halaman. Kecepatannya **sama** di halaman 1 maupun halaman 500, dan hasilnya tidak bergeser saat ada data baru. Harganya: hanya bisa maju/mundur, tidak bisa lompat.',
        },
        {
          term: 'cursor',
          meaning:
            'Nilai yang meng-encode posisi terakhir — biasanya id dan kolom urut, dalam base64url. Ia **bukan rahasia**, tapi juga **bukan sesuatu yang boleh dipercaya**: isinya datang dari klien dan wajib divalidasi setelah di-decode.',
        },
        {
          term: 'base64url',
          meaning:
            'Varian base64 yang aman dipakai di URL — tidak memuat `+`, `/`, maupun `=` yang perlu di-encode ulang. Dipakai untuk cursor supaya bisa langsung ditempel di query string tanpa masalah.',
        },
        {
          term: 'kolom urut yang unik',
          meaning:
            'Cursor bekerja dengan membandingkan nilai (`WHERE id < 10023`). Kalau kolom urutnya **tidak unik**, misalnya `dibuat_pada` saja, dua baris dengan nilai sama bisa terlewat atau ganda. Selalu pasangkan dengan `id` sebagai pemecah seri.',
        },
        {
          term: 'batas atas limit',
          meaning:
            'Nilai maksimum yang boleh diminta klien, ditegakkan **di server**. Tanpa itu, `?limit=999999` membatalkan seluruh manfaat paginasi — dan pertahanan sumber dayanya ikut hilang bersama itu.',
        },
      ),

      h2('Offset — sederhana'),
      code(
        'text',
        `
        GET /artikel?hal=2&per_hal=20
        `,
      ),
      code(
        'json',
        `
        {
          "data": [ ... ],
          "meta": {
            "halaman": 2,
            "perHalaman": 20,
            "total": 1337,
            "totalHalaman": 67
          }
        }
        `,
      ),
      p(
        'Permintaannya hanya dua parameter, dan itulah daya tarik model offset: siapa pun langsung paham `hal=2` berarti halaman kedua. Perhatikan blok `meta` mengembalikan **kembali** nilai yang diminta (`halaman`, `perHalaman`) — bukan pengulangan yang sia-sia, melainkan cara klien tahu nilai apa yang benar-benar dipakai server. Kalau klien mengirim `per_hal=999999` dan server membatasinya ke 100, `perHalaman: 100` di sini yang memberitahunya.',
      ),
      p(
        'Dua field terakhir yang membuat model ini istimewa sekaligus mahal. `total: 1337` dan `totalHalaman: 67` memungkinkan antarmuka menggambar deretan nomor halaman — sesuatu yang mustahil dilakukan model cursor. Harganya, keduanya menuntut satu query `COUNT` tambahan pada **setiap** permintaan, dan `COUNT` pada tabel berisi jutaan baris bukan operasi murah. Itulah pertukaran yang dirinci tabel di bawah.',
      ),
      table(
        ['Kelebihan', 'Kekurangan'],
        [
          ['Bisa lompat ke halaman mana pun', 'Makin dalam, makin lambat'],
          ['Total halaman diketahui', '`COUNT` pada tabel besar mahal'],
          ['Mudah dipahami', '**Item bisa terlewat atau ganda**'],
        ],
      ),
      callout(
        'danger',
        'Masalah pergeseran yang jarang disadari',
        'Pengguna membuka halaman 1 (item 1–20). Sementara ia membaca, 5 artikel baru ditambahkan. Saat ia membuka halaman 2, item 16–20 yang sudah ia lihat muncul lagi — dan sebagian item lain tidak pernah muncul sama sekali. Ini bukan kasus tepi teoretis; ia terjadi setiap kali datanya aktif.',
      ),

      h2('Cursor — stabil dan cepat'),
      code(
        'text',
        `
        GET /artikel?limit=20
        GET /artikel?limit=20&cursor=eyJpZCI6MTAwMjN9
        `,
      ),
      code(
        'json',
        `
        {
          "data": [ ... ],
          "meta": {
            "cursorBerikutnya": "eyJpZCI6MTAwMDN9",
            "adaLagi": true
          }
        }
        `,
      ),
      p(
        'Permintaan pertama tidak menyebut cursor sama sekali, dan itulah cara meminta halaman awal. Jawabannya membawa `cursorBerikutnya`, dan klien menempelkannya apa adanya pada permintaan berikutnya. Perhatikan nilai `eyJpZCI6MTAwMjN9` itu **base64 biasa** dan bukan enkripsi, sebab ia berisi `{"id":10023}`. Karena bisa dibaca siapa pun, jangan pernah menaruh sesuatu yang sensitif di dalamnya, dan tetap validasi isinya di server, karena klien bisa mengarang cursor sendiri.',
      ),
      p(
        'Alasan cursor dikodekan dan bukan dikirim sebagai `?setelah_id=10023` adalah **kebebasan mengubahnya nanti**. Hari ini penandanya cukup satu `id`; besok, saat pengurutan berubah menjadi berdasarkan tanggal, penandanya butuh dua nilai sekaligus (tanggal + id sebagai pemecah seri). Karena klien memperlakukan cursor sebagai teks buram yang hanya diteruskan kembali, perubahan itu tidak memutus siapa pun.',
      ),
      p(
        'Perhatikan pula `meta`-nya tidak punya `total` maupun `totalHalaman`, hanya `adaLagi`. Itu bukan kelalaian melainkan konsekuensi: model ini tidak pernah menghitung seluruh baris, dan justru itu yang membuatnya tetap cepat di kedalaman mana pun. Bandingkan SQL-nya di bawah.',
      ),
      code(
        'sql',
        `
        -- Offset: baca 10.020 baris, buang 10.000
        SELECT * FROM artikel ORDER BY id DESC LIMIT 20 OFFSET 10000;

        -- Cursor: langsung ke posisinya lewat index
        SELECT * FROM artikel WHERE id < 10023 ORDER BY id DESC LIMIT 20;
        `,
      ),
      p('Query kedua kecepatannya **sama** di halaman 1 maupun halaman 500.'),

      h2('Menyusun cursor'),
      code(
        'js',
        `
        // Cursor adalah posisi yang di-encode — bukan rahasia, tapi juga bukan
        // sesuatu yang boleh dipercaya begitu saja.
        function buatCursor(baris) {
          return Buffer.from(JSON.stringify({
            id: baris.id,
            dibuatPada: baris.dibuat_pada.toISOString(),
          })).toString('base64url');
        }

        function bacaCursor(cursor) {
          try {
            const isi = JSON.parse(Buffer.from(cursor, 'base64url').toString());

            // WAJIB divalidasi — cursor datang dari klien.
            const hasil = SkemaCursor.safeParse(isi);
            return hasil.success ? hasil.data : null;
          } catch {
            return null;
          }
        }
        `,
      ),
      p(
        'Perhatikan `buatCursor` memasukkan **dua** nilai dan bukan hanya `id`, yaitu `dibuatPada` beserta `id`. Itu keharusan begitu pengurutannya berdasarkan tanggal, sebab tanpa `id` sebagai pemecah seri, dua artikel yang terbit pada detik yang sama membuat posisinya ambigu, dan itulah yang dibahas bagian "Urutan harus unik" di bawah. `base64url` dipilih alih-alih base64 biasa karena hasilnya aman ditaruh di URL, sebab ia tidak menghasilkan karakter `+`, `/`, dan `=` yang harus di-escape.',
      ),
      p(
        '`bacaCursor` punya **dua** lapis penjagaan, dan keduanya perlu. `try/catch` menangkap cursor yang bentuknya rusak sama sekali — teks sembarang yang bukan base64, atau base64 yang isinya bukan JSON. Lapis kedua, `SkemaCursor.safeParse`, menangkap yang jauh lebih berbahaya: cursor yang **bentuknya sah tetapi isinya dikarang**. Ingat isinya base64 biasa, jadi siapa pun bisa menyusun `{"id":"1 OR 1=1"}` lalu mengodekannya.',
      ),
      p(
        'Perhatikan keduanya mengembalikan `null` alih-alih melempar. Itu keputusan sadar: cursor tidak sah paling masuk akal diperlakukan sebagai "tidak ada cursor", sehingga permintaannya jatuh kembali ke halaman pertama — merepotkan bagi yang mengarangnya, tidak berbahaya bagi siapa pun. Nilai yang lolos skema lalu dipakai **sebagai parameter query**, bukan disisipkan ke teks SQL.',
      ),
      callout(
        'danger',
        'Cursor adalah masukan yang tidak tepercaya',
        'Base64 bukan enkripsi — siapa pun bisa membacanya dan mengarang isinya. Cursor yang dipakai langsung untuk menyusun query tanpa validasi adalah jalur injeksi. Urai, validasi dengan skema, dan pakai nilainya sebagai parameter.',
      ),

      h2('Urutan harus unik'),
      code(
        'sql',
        `
        -- SALAH: banyak baris bisa punya dibuat_pada yang sama.
        -- Urutan antar baris itu tidak dijamin -> paginasi kacau.
        ORDER BY dibuat_pada DESC

        -- BENAR: pemecah seri yang pasti unik.
        ORDER BY dibuat_pada DESC, id DESC
        `,
      ),
      code(
        'sql',
        `
        -- Cursor untuk urutan gabungan
        WHERE (dibuat_pada, id) < ($1, $2)
        ORDER BY dibuat_pada DESC, id DESC
        LIMIT 20
        `,
      ),
      p(
        'Bentuk `(dibuat_pada, id) < ($1, $2)` disebut **perbandingan baris**, dan ia melakukan persis yang kamu maksud: bandingkan `dibuat_pada` dulu, dan hanya kalau nilainya sama, bandingkan `id` sebagai penentu. Menuliskannya sebagai `dibuat_pada < $1 AND id < $2` **salah** — syarat itu akan membuang artikel yang tanggalnya lebih tua tetapi `id`-nya kebetulan lebih besar, sehingga sebagian data tidak pernah muncul di halaman mana pun.',
      ),
      p(
        'Perhatikan urutan kolom di `WHERE` harus sama persis dengan urutan di `ORDER BY`, dan arahnya (`<` berpasangan dengan `DESC`) juga harus cocok. Ketidakcocokan di antara keduanya menghasilkan paginasi yang tampak bekerja pada halaman pertama lalu melewatkan baris di halaman-halaman berikutnya — kegagalan senyap yang hanya ketahuan kalau seseorang menghitung total item yang benar-benar terlihat. Bonusnya, bentuk ini bisa memakai composite index `(dibuat_pada DESC, id DESC)` sekaligus.',
      ),

      h2('Memilih'),
      table(
        ['Pakai offset kalau', 'Pakai cursor kalau'],
        [
          ['Data jarang berubah', 'Data aktif berubah'],
          ['Pengguna perlu lompat ke halaman tertentu', 'Hanya butuh "muat lebih banyak"'],
          ['Total item perlu ditampilkan', 'Total tidak penting'],
          ['Datanya kecil', 'Datanya besar'],
          ['Panel admin', 'Umpan publik, gulir tak berujung'],
        ],
      ),

      h2('Batas yang wajib ada'),
      code(
        'js',
        `
        // Batas atas ditentukan SERVER, bukan klien.
        const perHalaman = Math.min(Number(req.query.per_hal) || 20, 100);
        `,
      ),
      p(
        'Satu baris ini menangani tiga hal sekaligus, dan ketiganya perlu. `Number(...)` mengubah string query menjadi angka. `|| 20` menangkap dua kasus sekaligus, yaitu parameter yang tidak dikirim (`undefined` → `NaN`) dan yang isinya bukan angka (`"abc"` → `NaN`), dan keduanya jatuh ke nilai bawaan. Dan `Math.min(..., 100)` adalah batas atas yang **ditentukan server** alih-alih sekadar disarankan ke klien.',
      ),
      p(
        'Perhatikan urutannya, sebab batas dipasang **setelah** konversi dan bukan sebelum. Satu celah yang masih tersisa di baris ini patut kamu sadari, sebab `?per_hal=-5` lolos karena `-5` adalah angka yang sah dan lebih kecil dari 100. Nilai negatif pada `LIMIT` ditolak sebagian database dan diperlakukan aneh oleh sebagian lain, jadi bentuk yang lebih lengkap membungkusnya lagi menjadi `Math.max(1, Math.min(..., 100))`, atau lebih baik lagi memindahkan seluruh aturan ini ke skema validasi seperti pada `z.coerce.number().int().min(1).max(100).default(20)`.',
      ),
      callout(
        'warning',
        'Tanpa batas atas, `?per_hal=999999` adalah serangan satu baris',
        'Ia memaksa database mengembalikan seluruh tabel, memuat semuanya ke memori aplikasi, lalu menyerialisasinya menjadi JSON raksasa. Tidak perlu alat apa pun untuk melakukannya — cukup mengubah angka di URL.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Paginasi punya sifat yang tidak terlihat selama pengujian, yaitu **biayanya bertambah seiring nomor halaman**. Halaman pertama selalu cepat, jadi tidak ada yang menyadari apa pun sampai seseorang membuka halaman lima ribu atau sebuah pekerjaan ekspor menelusuri seluruh tabel halaman demi halaman.',
      ),
      code(
        'text',
        `
        Tabel 200.000 baris, mengambil 20 baris di posisi yang sama:

          OFFSET       0        median   0,01 ms
          OFFSET   50000        median   0,39 ms
          OFFSET  100000        median   0,95 ms
          OFFSET  199980        median   1,51 ms

          keyset  id >      0   median   0,01 ms
          keyset  id >  50000   median   0,01 ms
          keyset  id > 100000   median   0,01 ms
          keyset  id > 199980   median   0,01 ms
        `,
        { caption: 'Dijalankan sungguhan dengan node:sqlite bawaan Node 26.5.0.' },
      ),
      p(
        'Perhatikan bentuk kedua kolom itu. Biaya `OFFSET` **naik lurus** mengikuti nomor halaman, sedangkan biaya keyset **tidak bergerak sama sekali**. Selisihnya di posisi terakhir sekitar 150 kali, dan yang lebih menentukan daripada angkanya adalah bahwa selisih itu terus membesar seiring tabelnya tumbuh.',
      ),
      p('Pada basis data yang lebih besar, bentuknya sama dan angkanya lebih tajam.'),
      code(
        'text',
        `
        PostgreSQL 16.15, tabel 300.000 baris, kolom id sudah ber-index:

          OFFSET      0  ->  membaca     20 baris  ->  0,041 ms
          OFFSET 100000  ->  membaca 100.020 baris ->  9,745 ms
          OFFSET 250000  ->  membaca 250.020 baris -> 24,722 ms
          keyset id > 250000 -> membaca 20 baris   ->  0,064 ms
        `,
        {
          caption:
            'Dijalankan sungguhan di bab database. Angka "membaca" diambil dari EXPLAIN ANALYZE.',
        },
      ),
      p(
        'Baris "membaca" itu yang menjelaskan seluruhnya. Untuk memberi dua puluh baris pada halaman terakhir, basis data harus membaca 250.020 baris lalu **membuang** 250.000 di antaranya. Tidak ada index yang bisa memperbaikinya, sebab `OFFSET` memang berarti "hitung dan lewati sebanyak n".',
      ),
      p(
        'Keyset menggantikan nomor halaman dengan penanda posisi terakhir, dan bentuk kontraknya di API seperti ini.',
      ),
      code(
        'text',
        `
        Permintaan pertama:
          GET /catatan?limit=20

        Respons:
          {
            "data": [ ... 20 baris ... ],
            "berikutnya": "eyJpZCI6MTIzfQ"     // cursor, buram bagi klien
          }

        Permintaan berikutnya:
          GET /catatan?limit=20&setelah=eyJpZCI6MTIzfQ

        Ketika habis:
          { "data": [ ... ], "berikutnya": null }
        `,
      ),
      p(
        'Cursor sengaja dibuat **buram**, yaitu berupa teks tersandi alih-alih id telanjang. Alasannya bukan keamanan melainkan kebebasan berubah. Selama isinya tidak dijanjikan, kamu bisa menambahkan field pengurut kedua ke dalamnya nanti tanpa memutus satu pun klien, sebab tidak ada klien yang pernah menguraikannya.',
      ),
      table(
        ['Kebutuhan', 'Yang tepat', 'Alasannya'],
        [
          [
            'Menelusuri seluruh data, ekspor, sinkronisasi',
            'Keyset',
            'Tidak melambat di posisi jauh, dan tidak melewatkan baris saat data berubah',
          ],
          [
            'Gulir tak berujung di aplikasi',
            'Keyset',
            'Klien hanya bergerak maju, dan itu tepat yang diberikannya',
          ],
          [
            'Halaman bernomor yang bisa dilompati',
            '`OFFSET`, dengan batas nomor halaman',
            'Keyset tidak bisa melompat ke halaman 500',
          ],
          [
            'Menampilkan jumlah total halaman',
            'Perkiraan, bukan `count(*)` tepat',
            '`count(*)` pada tabel besar sendiri sudah mahal',
          ],
        ],
      ),

      h2('Saat error-nya muncul'),
      p(
        'Paginasi punya kegagalan kedua yang lebih serius daripada lambat, yaitu **baris yang tidak pernah terlihat pengguna**. Ia terjadi setiap kali kolom pengurutnya punya nilai yang sama pada beberapa baris.',
      ),
      code(
        'text',
        `
        Sepuluh tugas, SEMUANYA berprioritas 1, pada PostgreSQL 16.15:

        ORDER BY prioritas   (tanpa pemecah seri)
          halaman 1 (LIMIT 3 OFFSET 0)  ->  Tugas 2 | Tugas 3 | Tugas 1
          ... satu baris di halaman 1 disunting pengguna lain ...
          halaman 2 (LIMIT 3 OFFSET 3)  ->  Tugas 5 | Tugas 6 | Tugas 7

          Tugas 4 TIDAK PERNAH muncul di halaman mana pun.

        ORDER BY prioritas, id   (dengan pemecah seri)
          halaman 1  ->  Tugas 1 | Tugas 2 | Tugas 3
          halaman 2  ->  Tugas 4 | Tugas 5 | Tugas 6
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15 di bab database.' },
      ),
      p(
        'Perlu disebut jujur bahwa percobaan yang sama pada SQLite **tidak** menunjukkan gejala itu, sebab mesinnya kebetulan mempertahankan urutan penyisipan. Itu justru memperkuat kesimpulannya, yaitu urutan untuk nilai yang seri **tidak dijanjikan** dan bisa berbeda antar-mesin, antar-versi, dan antar-rencana eksekusi. Kode yang bergantung pada kebetulan itu akan berubah perilaku tanpa satu pun baris diubah.',
      ),
      code(
        'text',
        `
        Aturan yang menutup seluruh kelas bug ini, dan biayanya nol:
        SETIAP query berpaginasi harus berakhir pada kolom yang UNIK.

          ORDER BY dibuat_pada DESC, id DESC     benar
          ORDER BY prioritas, id                 benar
          ORDER BY nama                          rentan — nama bisa sama
          ORDER BY dibuat_pada DESC              rentan, terutama pada impor massal
        `,
      ),
      p(
        'Kegagalan ketiga adalah batas yang tidak pernah dipasang, dan akibatnya bukan kesalahan data melainkan **ketersediaan**.',
      ),
      code(
        'text',
        `
        GET /catatan?limit=1000000

          422  Content-Type: application/problem+json
          {
            "type": "https://contoh.id/masalah/parameter-tidak-valid",
            "title": "Parameter tidak valid",
            "status": 422,
            "errors": [
              { "field": "limit", "pesan": "Harus bilangan bulat 1 sampai 100",
                "diterima": "1000000" }
            ]
          }
        `,
        { caption: 'Dijalankan sungguhan dengan node:http dan node:sqlite.' },
      ),
      p(
        'Tanpa batas itu, satu permintaan memaksa server membaca sejuta baris, mengubahnya menjadi objek, lalu menyusunnya menjadi JSON. Seluruh pekerjaan itu menahan utasnya, dan akibatnya bagi permintaan lain sudah diukur di bab Express, yaitu lima permintaan ringan yang seharusnya selesai dalam enam milidetik menjadi tujuh puluh empat milidetik.',
      ),
      p('Batasnya perlu berlapis, dan ketiganya berbeda pekerjaan.'),
      code(
        'text',
        `
        batas bawaan   : dipakai bila klien tidak menyebut limit  -> 20
        batas atas     : ditolak bila klien meminta lebih         -> 100
        batas kedalaman: nomor halaman maksimal untuk OFFSET      -> misalnya 1000

        Yang terakhir sering dilupakan. Tanpa itu, ?page=999999 tetap
        memaksa basis data melewati jutaan baris meski limit-nya sudah dibatasi.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Paginasi adalah bagian yang paling sering ditulis dengan cara yang benar pada data kecil dan berubah sifat pada data besar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `OFFSET` untuk menelusuri seluruh tabel',
            'Itu cara paginasi yang biasa',
            'Diukur, `OFFSET 250000` membaca 250.020 baris untuk memberi 20. Pakai keyset',
          ],
          [
            'Mengurutkan hanya dengan kolom yang bisa seri',
            'Urutannya sudah benar',
            'Diuji sungguhan di PostgreSQL, satu baris tidak pernah muncul di halaman mana pun',
          ],
          [
            'Menyimpulkan aman karena di mesinnya tidak terjadi',
            'Sudah dicoba dan urutannya stabil',
            'SQLite kebetulan stabil, PostgreSQL tidak. Urutan untuk nilai seri tidak pernah dijanjikan',
          ],
          [
            'Tidak memberi batas atas pada `limit`',
            'Klien kita yang menentukan',
            'Endpoint bisa dipanggil langsung. `?limit=1000000` menahan utasnya dan seluruh permintaan lain menunggu',
          ],
          [
            'Mengirim id mentah sebagai cursor',
            'Lebih sederhana',
            'Isinya jadi terlanjur dijanjikan. Cursor buram bisa berubah bentuk tanpa memutus klien',
          ],
          [
            'Menyertakan `count(*)` total di setiap halaman',
            'Pengguna ingin tahu jumlahnya',
            '`count(*)` pada tabel besar sendiri sudah mahal, dan dihitung ulang di setiap halaman',
          ],
        ],
      ),
      p(
        'Baris ketiga pantas ditegaskan karena ia bentuk kesalahan penalaran yang berlaku jauh melampaui paginasi. Tidak terjadi bukan berarti tidak mungkin. Pada urutan yang tidak dijanjikan, mesin basis data bebas mengembalikan apa pun, dan yang menahan sebuah bug tidak muncul hari ini bisa berupa jumlah baris, rencana eksekusi yang dipilih, atau versi yang kebetulan terpasang. Yang menutupnya bukan pengujian melainkan menambahkan kolom unik ke klausa pengurutnya, dan itu tidak memakan biaya apa pun.',
      ),
      references(
        {
          label: 'LIMIT and OFFSET',
          href: 'https://www.postgresql.org/docs/17/queries-limit.html',
          source: 'PostgreSQL',
          note: 'Peringatan resmi bahwa `OFFSET` besar tetap memindai baris yang dilewati.',
        },
        {
          label: 'Indexes and ORDER BY',
          href: 'https://www.postgresql.org/docs/17/indexes-ordering.html',
          source: 'PostgreSQL',
          note: 'Kenapa paginasi cursor bisa memakai index sementara offset dalam tidak.',
        },
        {
          label: 'Base64 — base64url',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Base64',
          source: 'MDN Web Docs',
          note: 'Varian yang aman dipakai di URL, dipakai meng-encode cursor.',
        },
        {
          label: 'REST Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Batas ukuran respons sebagai kontrol anti-penyalahgunaan sumber daya.',
        },
      ),
    ],
  ),

  written(
    'filter-sort',
    'Filtering, Sorting & Sparse Fieldset',
    17,
    'Membiarkan klien menyempitkan hasil, tanpa membiarkannya menyusun query.',
    [
      terms(
        {
          term: 'filter terdaftar',
          meaning:
            'Setiap filter punya **nama yang kamu daftarkan** dan kolom yang kamu tentukan. Bukan pemetaan otomatis dari query string ke kolom: yang boleh disaring adalah keputusan desain, bukan konsekuensi bentuk tabelmu.',
        },
        {
          term: 'query builder di URL',
          meaning:
            'Anti-pattern berbahaya: API yang menerima `?where[peran]=admin` atau `?filter={"$ne":null}`. Itu **menyerahkan penyusunan query kepada klien** — bukan fitur fleksibel, melainkan injeksi dengan pintu depan terbuka.',
        },
        {
          term: 'sorting dengan tanda minus',
          meaning:
            'Konvensi `?urut=-dibuat_pada` — tanda minus berarti menurun, tanpa minus berarti menaik. Beberapa kunci dipisah koma. Konvensi ini dipakai luas, jadi klien kemungkinan besar sudah mengenalnya.',
        },
        {
          term: 'identifier tidak bisa diparameterkan',
          meaning:
            'Alasan teknis di balik seluruh sub-bab ini. Nama kolom dan arah `ORDER BY` **tidak bisa** jadi placeholder SQL — secara sintaks pun gagal. Satu-satunya cara aman adalah allow-list.',
        },
        {
          term: 'allow-list kolom',
          meaning:
            "Objek pemetaan milikmu sendiri: `{ dibuat_pada: 'dibuat_pada', populer: 'jumlah_dibaca' }`. Yang masuk ke SQL adalah **nilai dari objekmu**; input klien hanya kunci pencarian. Tidak ada jalan bagi teksnya untuk sampai ke query.",
        },
        {
          term: 'nama publik ≠ nama kolom',
          meaning:
            'Perhatikan `populer` yang memetakan ke `jumlah_dibaca`. Allow-list sekaligus menjadi **lapisan penerjemah**: nama di API tidak perlu mengikuti nama kolom, dan mengganti kolom tidak memutus klien.',
        },
        {
          term: 'batas jumlah kunci urut',
          meaning:
            'Potongan `.slice(0, 3)` di contoh. Tanpa batas, `?urut=a,b,c,...` berisi ratusan kunci memaksa database menyusun pengurutan yang sangat mahal — bentuk lain dari penyalahgunaan sumber daya.',
        },
        {
          term: 'default + pemecah seri',
          meaning:
            'Dua hal yang **selalu** ditambahkan di akhir: urutan default kalau klien tidak menyebut apa pun, dan `id` sebagai pemecah seri. Tanpa yang kedua, paginasi bisa menampilkan item ganda atau melewatkannya.',
        },
        {
          term: 'sparse fieldset',
          meaning:
            'Membiarkan klien meminta sebagian field saja — `?fields=id,judul`. Berguna untuk klien mobile yang jaringannya terbatas. Sama seperti sorting: nama field harus lewat allow-list, bukan langsung dimasukkan ke `SELECT`.',
        },
      ),

      h2('Filter'),
      code(
        'text',
        `
        GET /artikel?status=terbit
        GET /artikel?status=terbit&penulis_id=42
        GET /artikel?dibuat_setelah=2026-01-01
        GET /artikel?cari=react
        `,
      ),
      code(
        'js',
        `
        // Setiap filter divalidasi dan dipetakan ke kolom yang KAMU tentukan.
        const SkemaFilter = z.object({
          status: z.enum(['draf', 'terbit', 'arsip']).optional(),
          penulis_id: z.coerce.number().int().positive().optional(),
          dibuat_setelah: z.coerce.date().optional(),
          cari: z.string().trim().max(100).optional(),
        }).strict();
        `,
      ),
      p(
        'Perhatikan filternya ditulis **datar** dalam bentuk `?status=terbit&penulis_id=42`, bukan sebagai struktur bersarang seperti `?filter[status][eq]=terbit`. Bentuk datar itu keputusan sadar, sebab ia mudah dibaca di bilah alamat, mudah dijadikan tautan, dan yang terpenting, setiap nama parameter adalah **satu kemampuan yang kamu daftarkan**. Bentuk bersarang cepat berkembang menjadi bahasa query mini yang harus kamu urai sendiri, dan di situlah celah injeksi lahir.',
      ),
      p(
        'Skema Zod-nya menegakkan hal itu di kode. Setiap filter punya barisnya sendiri dengan tipe yang tepat. `status` dibatasi tiga nilai lewat `z.enum` sebagai allow-list alih-alih string bebas, `penulis_id` di-`coerce` menjadi integer positif karena query selalu string, dan `cari` dibatasi 100 karakter agar pencarian tidak dipakai untuk membebani server. Semuanya `.optional()` karena filter memang tidak wajib.',
      ),
      p(
        '`.strict()` di baris terakhir yang menutup rapat. Tanpa itu, Zod diam-diam membuang parameter asing dan kamu tidak pernah tahu ada klien yang mengirim `?password_hash=...` atau mencoba `?where[peran]=admin`. Dengan `.strict()`, percobaan seperti itu menjadi `422` yang tercatat — dan itu memberimu sinyal, bukan sekadar keamanan pasif.',
      ),
      callout(
        'danger',
        'Jangan pernah menerjemahkan query string langsung menjadi query database',
        'API yang menerima `?where[peran]=admin` atau `?filter={"$ne":null}` menyerahkan penyusunan query kepada klien. Itu bukan fitur fleksibel — itu injeksi dengan pintu depan terbuka. Setiap filter harus punya nama yang kamu daftarkan dan kolom yang kamu tentukan.',
      ),

      h2('Sorting'),
      code(
        'text',
        `
        GET /artikel?urut=-dibuat_pada          # tanda minus = menurun
        GET /artikel?urut=judul                 # menaik
        GET /artikel?urut=-dibuat_pada,judul    # beberapa kunci
        `,
      ),
      p(
        'Konvensi tanda minus ini dipakai luas (JSON:API memakainya juga), dan alasannya praktis, sebab satu parameter cukup untuk menyatakan **kolom dan arahnya sekaligus**. Alternatifnya, `?urut=dibuat_pada&arah=desc`, langsung buntu begitu klien ingin mengurutkan dua kolom dengan arah berbeda, persis seperti yang dilakukan baris ketiga dengan tanggal menurun lalu judul menaik sebagai pemecah seri.',
      ),
      code(
        'js',
        `
        // Nama kolom TIDAK BISA diparameterkan di SQL.
        // Karena itu ia harus berasal dari allow-list milikmu sendiri.
        const KOLOM_URUT = {
          dibuat_pada: 'dibuat_pada',
          judul: 'judul',
          populer: 'jumlah_dibaca',
        };

        function susunOrderBy(param) {
          const bagian = [];

          for (const potongan of String(param ?? '').split(',').slice(0, 3)) {
            const menurun = potongan.startsWith('-');
            const nama = menurun ? potongan.slice(1) : potongan;
            const kolom = KOLOM_URUT[nama];

            if (kolom === undefined) continue;   // abaikan yang tidak dikenal
            bagian.push(\`\${kolom} \${menurun ? 'DESC' : 'ASC'}\`);
          }

          // Selalu ada default DAN pemecah seri yang unik.
          if (bagian.length === 0) bagian.push('dibuat_pada DESC');
          bagian.push('id DESC');

          return bagian.join(', ');
        }
        `,
      ),
      p(
        'Perhatikan bahwa yang masuk ke SQL adalah nilai dari **objek milikmu**. Input klien hanya dipakai sebagai kunci pencarian — tidak ada jalan bagi teksnya untuk sampai ke query.',
      ),

      h2('Sparse fieldset'),
      code(
        'text',
        `
        GET /artikel?fields=id,judul,dibuat_pada
        `,
      ),
      code(
        'js',
        `
        const FIELD_BOLEH = new Set(['id', 'judul', 'ringkasan', 'dibuat_pada', 'status']);

        function pilihField(param) {
          if (param === undefined) return [...FIELD_BOLEH];

          const diminta = String(param).split(',').filter((f) => FIELD_BOLEH.has(f));

          // Kalau semua yang diminta tidak dikenal, kembalikan default —
          // jangan kembalikan objek kosong.
          return diminta.length > 0 ? diminta : [...FIELD_BOLEH];
        }
        `,
      ),
      p(
        'Polanya sama dengan `susunOrderBy`: input klien dipakai untuk **menyaring daftar milikmu**, bukan untuk menyusun daftar baru. Perhatikan `filter((f) => FIELD_BOLEH.has(f))` — yang lolos hanyalah nama yang sudah ada di `FIELD_BOLEH`, jadi `?fields=password_hash` menghasilkan array kosong, bukan kolom sensitif yang ikut terkirim.',
      ),
      p(
        'Dua cabang pengembaliannya menangani dua keadaan yang berbeda dan mudah tertukar. Kalau parameter `fields` **tidak dikirim sama sekali**, artinya klien tidak peduli — kembalikan semua. Kalau dikirim tetapi **tidak satu pun namanya dikenal**, itu kemungkinan besar salah ketik atau percobaan; kembalikan default juga, bukan objek kosong. Merespons dengan `{}` akan membuat klien mengira datanya memang tidak ada, dan bug seperti itu jauh lebih sulit dilacak daripada respons yang sekadar membawa lebih banyak field dari yang diminta.',
      ),
      callout(
        'warning',
        'Allow-list field juga kontrol keamanan',
        'Tanpa daftar itu, `?fields=password_hash` atau `?fields=catatan_internal` akan dilayani dengan patuh. Field yang tidak ada di daftar tidak boleh bisa diminta — bahkan kalau kolomnya memang ada di tabel.',
      ),

      h2('Pencarian teks'),
      code(
        'sql',
        `
        -- Untuk data kecil: cukup ILIKE
        WHERE judul ILIKE '%' || $1 || '%'

        -- Untuk data besar: LIKE dengan wildcard di depan tidak bisa memakai index.
        -- Pakai full-text search.
        WHERE to_tsvector('indonesian', judul || ' ' || isi)
              @@ plainto_tsquery('indonesian', $1)
        `,
      ),
      p(
        'Bentuk pertama menempelkan `%` di **kedua sisi** kata kunci, dan justru `%` di depan itu yang mematikan index — database tidak punya titik awal untuk melompat, jadi ia memindai seluruh tabel. Untuk tabel berisi beberapa ribu baris itu masih terasa instan; untuk ratusan ribu, setiap ketikan di kotak pencarian menjadi pemindaian penuh. Perhatikan kata kuncinya tetap dikirim sebagai parameter `$1` dan digabung dengan `||` **di dalam SQL**, bukan disisipkan ke teks query dari JavaScript.',
      ),
      p(
        'Bentuk kedua bekerja dengan cara yang berbeda secara mendasar. `to_tsvector` memecah judul dan isi menjadi daftar kata dasar, sehingga "berlari", "pelari", dan "lari" dipetakan ke akar yang sama menurut aturan bahasa yang disebut (`\'indonesian\'`). `plainto_tsquery` melakukan hal serupa pada kata pencarian, lalu `@@` mencocokkan keduanya. Karena hasil `to_tsvector` bisa disimpan di kolom tersendiri dan diberi index GIN, pencarian tetap cepat pada data besar, dan sebagai bonus ia menemukan kecocokan yang `ILIKE` lewatkan karena bentuk katanya berbeda.',
      ),
      callout(
        'tip',
        'Pakai `plainto_tsquery`, bukan `to_tsquery`',
        '`to_tsquery` memperlakukan input sebagai **sintaks kueri** — karakter seperti `&`, `|`, dan `!` punya arti khusus, dan input yang salah bentuk melempar error. `plainto_tsquery` memperlakukan input sebagai teks biasa, yang justru yang kamu inginkan untuk kotak pencarian.',
      ),

      h2('Dokumentasikan gabungannya'),
      p(
        'Filter, sort, dan paginasi dipakai bersamaan. Nyatakan dengan jelas: filter mana yang bisa digabung, kolom mana yang bisa diurutkan, dan berapa batas atas `limit`. Yang tidak didokumentasikan akan dicoba klien — lalu menjadi kontrak tak sengaja yang tidak bisa kamu ubah.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Penyaringan dan pengurutan adalah bagian API yang paling mudah menjadi lubang keamanan, sebab keduanya terasa seperti sekadar meneruskan pilihan pengguna ke basis data. Yang membuatnya berbeda dari parameter lain, nilai pengurut sering **berupa nama kolom**, dan nama kolom tidak bisa dilewatkan sebagai parameter query.',
      ),
      code(
        'text',
        `
        Diuji sungguhan di bab database:

        PREPARE urut(text) AS SELECT id, email FROM pengguna ORDER BY $1 LIMIT 2;
        EXECUTE urut('email');

           id |      email
           ---+-----------------
            1 | rina@contoh.id
            2 | admin@contoh.id      <- urutan id, BUKAN urutan email

        Pengurutan yang sebenarnya:
        SELECT id, email FROM pengguna ORDER BY email LIMIT 2;

           id |      email
           ---+-----------------
            2 | admin@contoh.id
            1 | rina@contoh.id
        `,
        {
          caption:
            'Dijalankan sungguhan pada PostgreSQL 16.15. Parameter diperlakukan sebagai teks tetap.',
        },
      ),
      p(
        'Jadi memakai parameter untuk nama kolom tidak menghasilkan error melainkan pengurutan yang **diam-diam tidak terjadi**. Godaan berikutnya adalah merangkainya dengan penggabungan teks, dan di situlah lubangnya terbuka.',
      ),
      code(
        'text',
        `
        Kode: "SELECT id, email FROM pengguna ORDER BY " + kolomDariPengguna

        masukan: email; DROP TABLE artikel_tag

           id |      email
           ---+-----------------
            2 | admin@contoh.id
            1 | rina@contoh.id
          (2 rows)

        Lalu:
        SELECT count(*) FROM artikel_tag;
          ERROR:  relation "artikel_tag" does not exist
        `,
        {
          caption:
            'Dijalankan sungguhan di basis data percobaan. Tabelnya benar-benar terhapus, dan responsnya terlihat normal.',
        },
      ),
      p(
        'Perhatikan bahwa query pertamanya mengembalikan hasil yang terlihat wajar. Tidak ada error di respons, tidak ada tanda apa pun bagi pemanggil maupun bagi pemantauan, dan sebuah tabel sudah hilang. Karena parameter tidak bisa menolong di sini, satu-satunya perlindungan adalah **daftar yang diizinkan**.',
      ),
      code(
        'ts',
        `
        // Nama kolom TIDAK PERNAH datang dari pengguna, bahkan setelah "divalidasi"
        // dengan regex. Petakan dari daftar TETAP yang kamu tulis sendiri.
        const URUT = {
          terbaru: 'dibuat DESC, id DESC',
          judul: 'judul ASC, id ASC',
          prioritas: 'prioritas DESC, id ASC',
        } as const;

        const urut = u.searchParams.get('urut') ?? 'terbaru';
        if (!(urut in URUT)) {
          return masalah(422, 'parameter-tidak-valid', 'Parameter tidak valid', {
            errors: [{ field: 'urut', pesan: 'Nilai tidak dikenal', diizinkan: Object.keys(URUT) }],
          });
        }
        const baris = db.prepare(\`SELECT * FROM catatan ORDER BY \${URUT[urut]} LIMIT ?\`).all(limit);

        // Perhatikan setiap nilai di URUT berakhir pada kolom UNIK,
        // sesuai aturan urutan stabil dari sub-bab paginasi.
        `,
        {
          caption:
            'Nilai tetap lewat parameter; hanya potongan SQL dari daftar TETAP yang boleh digabungkan.',
        },
      ),
      code(
        'text',
        `
        Hasilnya, dijalankan sungguhan:

          urut=judul                        200  application/json
          urut=harga                        422  { "field":"urut", "diizinkan":["terbaru","judul","prioritas"] }
          urut=judul%3B%20DROP%20TABLE...   422  { "field":"urut", "diizinkan":[...] }

          jumlah baris di tabel sesudahnya : 4   <- utuh
        `,
        { caption: 'Dijalankan sungguhan dengan node:http dan node:sqlite pada Node 26.5.0.' },
      ),
      p(
        'Field `diizinkan` di dalam responsnya bukan hiasan. Ia mengubah pesan kegagalan menjadi dokumentasi yang datang tepat saat dibutuhkan, sehingga pemakai API tidak perlu membuka dokumen apa pun untuk tahu nilai apa yang sah.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Penyaringan punya kegagalan kedua yang tidak berkaitan dengan keamanan melainkan dengan performa, dan bentuknya sudah diukur di bab database.',
      ),
      code(
        'text',
        `
        Tabel 205.000 baris, ada index biasa pada kolom email:

          WHERE email = 'pengguna137456@contoh.id'
            Index Only Scan  ->   0,100 ms

          WHERE email LIKE 'pengguna137456%'
            Parallel Seq Scan, Rows Removed by Filter: 102500  ->  12,506 ms

          WHERE email LIKE '%137456@contoh.id'
            Parallel Seq Scan  ->  13,929 ms

          WHERE lower(email) = 'pengguna137456@contoh.id'
            Parallel Seq Scan  ->  33,832 ms
        `,
        {
          caption:
            'Dijalankan sungguhan pada PostgreSQL 16.15. Index-nya ADA di ketiga kasus terakhir.',
        },
      ),
      p(
        "Ini yang membuat endpoint pencarian berbahaya. Sebuah parameter `?q=` yang diterjemahkan menjadi `LIKE '%...%'` tidak bisa memakai index apa pun, jadi setiap pencarian memindai seluruh tabel. Pada data pengembangan yang berisi ratusan baris ia terasa seketika, dan pada produksi ia menjadi endpoint yang bisa menjatuhkan basis data hanya dengan dipanggil berulang kali.",
      ),
      code(
        'text',
        `
        Tiga pilihan, dan masing-masing punya tempatnya:

          pencocokan tepat        WHERE email = ?              index biasa, tercepat
          awalan saja             WHERE email LIKE 'abc%'      butuh index text_pattern_ops
          pencarian teks bebas    ?q=kata di mana pun          BUKAN pekerjaan LIKE

        Untuk yang ketiga, pakai full-text search atau index trigram.
        Diukur di bab database, index text_pattern_ops menurunkan
        pencarian berawalan dari 12,506 ms menjadi 0,119 ms.
        `,
      ),
      p(
        'Kelompok kegagalan ketiga adalah gabungan penyaring yang tidak pernah dipikirkan bersama, dan ia menghasilkan hasil yang membingungkan tanpa satu pun error.',
      ),
      code(
        'text',
        `
        GET /pesanan?status=batal&status=dibayar

          Apa artinya? Klien mengira "batal ATAU dibayar".
          Server yang memakai get() hanya membaca "batal" — diukur di bab Fondasi:

            get("tag")            = "baju"                    <- hanya yang PERTAMA
            getAll("tag")         = ["baju","celana","topi"]
            Object.fromEntries(q) = {"tag":"topi"}            <- dua nilai HILANG

        GET /pesanan?min_total=500000&status=batal

          Apa artinya? "total di atas 500rb DAN batal" — hampir selalu benar,
          tapi itu keputusan yang harus DITULIS, bukan diasumsikan pembaca.
        `,
        {
          caption:
            'Tiga baris tengah dijalankan sungguhan dengan URLSearchParams pada Node 26.5.0.',
        },
      ),
      p(
        'Baris `Object.fromEntries` itu jebakan yang paling sering, sebab ia cara paling ringkas mengubah query menjadi objek biasa, dan ia membuang dua dari tiga nilai tanpa satu pun peringatan. Pengguna menyaring tiga status, server menerima satu, dan hasilnya terlihat seperti data yang memang sedikit.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penyaringan terasa seperti fitur kecil, dan ia menyimpan satu kerentanan serius beserta beberapa jebakan performa.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Merangkai nama kolom pengurut dari masukan pengguna',
            'Parameter tidak bisa dipakai untuk itu',
            'Diuji sungguhan, satu masukan menghapus sebuah tabel dan responsnya tetap terlihat normal',
          ],
          [
            'Memakai parameter query untuk nama kolom',
            'Sama-sama masukan pengguna',
            'Diuji sungguhan, pengurutannya diam-diam tidak terjadi. Nama kolom butuh daftar yang diizinkan',
          ],
          [
            "Menerjemahkan `?q=` menjadi `LIKE '%kata%'`",
            'Paling fleksibel bagi pengguna',
            'Diukur, tidak ada index yang bisa dipakai. Untuk pencarian teks, pakai full-text atau trigram',
          ],
          [
            'Mengubah query jadi objek dengan `Object.fromEntries`',
            'Paling ringkas',
            'Diuji sungguhan, kunci berulang kehilangan semua nilai kecuali yang terakhir. Pakai `getAll`',
          ],
          [
            'Membiarkan arti gabungan penyaring tidak ditulis',
            'Sudah jelas maksudnya',
            'Klien menebak, dan tebakannya bisa berbeda dari yang kamu maksud. Tulis di dokumentasi',
          ],
          [
            'Menambah penyaring baru tanpa index pendukungnya',
            'Query-nya sederhana',
            'Endpoint yang tadinya cepat jadi memindai seluruh tabel, dan gejalanya baru muncul di produksi',
          ],
        ],
      ),
      p(
        'Baris terakhir punya jalan keluar yang murah dan jarang dipakai. Setiap kali sebuah penyaring baru ditambahkan, jalankan `EXPLAIN ANALYZE` untuk query yang dihasilkannya pada data berukuran produksi. Perintah itu memakan beberapa detik dan menjawab pertanyaan yang tidak bisa dijawab pengujian biasa, yaitu apakah penyaring itu memakai index atau memindai seluruh tabel.',
      ),
      references(
        {
          label: 'SQL Injection Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Bagian "allow-list input validation" — satu-satunya cara aman untuk nama kolom.',
        },
        {
          label: 'Full Text Search',
          href: 'https://www.postgresql.org/docs/17/textsearch-controls.html',
          source: 'PostgreSQL',
          note: 'Beda `plainto_tsquery` dan `to_tsquery`, beserta alasan yang pertama lebih aman.',
        },
        {
          label: 'Pattern Matching — LIKE & ILIKE',
          href: 'https://www.postgresql.org/docs/17/functions-matching.html',
          source: 'PostgreSQL',
          note: 'Kenapa wildcard di depan mematikan index pada tabel besar.',
        },
        {
          label: 'Zod — Basics',
          href: 'https://zod.dev/basics',
          source: 'Zod',
          note: 'Skema filter dengan `.strict()` dan `z.coerce` yang dipakai contoh di atas.',
        },
      ),
    ],
  ),

  written(
    'versioning',
    'Versioning & Kompatibilitas Mundur',
    19,
    'Mengubah API tanpa memutus klien yang tidak bisa kamu perbarui.',
    [
      p(
        'API adalah janji kepada klien yang tidak bisa kamu deploy ulang: aplikasi mobile di perangkat pengguna, integrasi partner, skrip yang berjalan terjadwal. Kompatibilitas mundur bukan kesopanan — ia syarat agar API-mu bisa dipakai.',
      ),

      terms(
        {
          term: 'kompatibilitas mundur',
          meaning:
            'Kemampuan klien lama tetap bekerja setelah API berubah. **Bukan kesopanan** melainkan syarat agar API-mu bisa dipakai: aplikasi mobile di perangkat pengguna, integrasi partner, dan skrip terjadwal tidak bisa kamu deploy ulang.',
        },
        {
          term: 'perubahan yang aman',
          meaning:
            'Menambah field opsional di respons, menambah endpoint, menambah parameter query opsional, menambah header, dan **melonggarkan** validasi. Polanya satu: menambah kemungkinan, bukan menghapus atau mempersempit.',
        },
        {
          term: 'aturan validasi baru = memutus',
          meaning:
            'Yang paling sering tidak disadari. Menjadikan field opsional jadi **wajib**, atau menurunkan batas panjang dari 500 ke 200, akan menolak permintaan yang sebelumnya berhasil. Klien lama tidak berubah — tapi tiba-tiba mendapat `422`.',
        },
        {
          term: 'nilai enum baru',
          meaning:
            'Aman **hanya kalau** klien memang menanganinya dengan anggun. Klien yang menulis `switch` dengan `default: throw` akan meledak begitu kamu menambah status `ditinjau`. Karena itu "tangani nilai tak dikenal" harus jadi bagian kontrak sejak awal.',
        },
        {
          term: 'versi di URL',
          meaning:
            '`/api/v1/artikel` — pilihan yang benar untuk kebanyakan project. Ia **terlihat** di log, di `curl`, di dokumentasi, dan di kunci cache. Versi lewat header lebih "murni" secara REST tapi menambah gesekan di setiap alat diagnosis.',
        },
        {
          term: 'header Deprecation',
          meaning:
            'Header yang menandai sebuah endpoint atau field sudah usang. Dipasangkan dengan **`Sunset`** yang menyebut tanggal penghapusannya — sehingga klien punya peringatan yang bisa dibaca mesin, bukan hanya catatan di dokumentasi.',
        },
        {
          term: 'expand–contract',
          meaning:
            'Pola tiga langkah untuk berubah tanpa versi baru: **tambah** yang baru sambil mempertahankan yang lama, **tandai** yang lama usang, lalu **hapus** setelah pemakaiannya nol. Pola yang sama dengan migrasi database.',
        },
        {
          term: 'pantau pemakaian sebelum menghapus',
          meaning:
            'Langkah yang paling sering dilewati. Catat setiap permintaan yang masih membaca field lama, **lengkap dengan identitas kliennya**. Tanpa data ini, kamu tidak akan pernah berani menghapusnya — dan field usang itu hidup selamanya.',
        },
        {
          term: 'kontrak tak sengaja',
          meaning:
            'Perilaku yang tidak pernah kamu janjikan tapi terlanjur diandalkan klien — urutan default, field yang kebetulan ikut, atau parameter yang tidak didokumentasikan tapi bekerja. Begitu dipakai, ia jadi sama mengikatnya dengan kontrak resmi.',
        },
      ),

      h2('Aman vs memutus'),
      table(
        ['Aman ditambahkan', 'Memutus klien'],
        [
          ['Field baru **opsional** di respons', 'Menghapus field'],
          ['Endpoint baru', 'Mengganti nama field'],
          ['Parameter query baru yang opsional', 'Mengubah tipe field'],
          ['Nilai enum baru — **kalau klien menanganinya**', 'Mengubah arti sebuah field'],
          ['Header baru', 'Menambah aturan validasi baru'],
          ['Melonggarkan validasi', 'Mengubah status code untuk kasus yang sama'],
        ],
      ),
      callout(
        'danger',
        'Menambah aturan validasi baru adalah perubahan yang memutus',
        'Ini yang paling sering tidak disadari. Menjadikan field yang tadinya opsional jadi wajib, atau menurunkan batas panjang dari 500 ke 200, akan menolak permintaan yang sebelumnya berhasil. Klien lama tidak berubah — tapi tiba-tiba mendapat `422`.',
      ),

      h2('Nilai enum baru juga bisa memutus'),
      code(
        'js',
        `
        // Klien menulis ini, dan ia benar untuk API versi lama:
        switch (artikel.status) {
          case 'draf': return <Draf />;
          case 'terbit': return <Terbit />;
          default: throw new Error('status tidak dikenal');
        }

        // Kamu menambahkan status 'ditinjau' -> klien meledak.
        `,
      ),
      p(
        'Karena itu dokumentasikan sejak awal: "klien harus menangani nilai enum yang tidak dikenal dengan anggun". Menambah nilai enum aman **hanya kalau** itu bagian dari kontrak.',
      ),

      h2('Cara memberi versi'),
      table(
        ['Cara', 'Contoh', 'Catatan'],
        [
          ['**Di URL**', '`/api/v1/artikel`', 'Paling jelas, paling mudah di-cache dan di-debug'],
          [
            'Header',
            '`Accept: application/vnd.app.v1+json`',
            'URL tetap bersih; lebih sulit diuji dengan `curl`',
          ],
          ['Query', '`?version=1`', 'Mudah, tapi gampang lupa disertakan'],
        ],
      ),
      callout(
        'tip',
        'Untuk kebanyakan project, versi di URL adalah pilihan yang benar',
        'Ia terlihat di log, di `curl`, di dokumentasi, dan di kunci cache. Versi lewat header lebih "murni" secara REST tapi menambah gesekan di setiap alat yang kamu pakai untuk mendiagnosis.',
      ),

      h2('Mengubah tanpa versi baru'),
      p('Sebagian besar perubahan tidak perlu versi baru kalau dilakukan bertahap:'),
      steps(
        {
          title: '1. Tambah yang baru, pertahankan yang lama',
          body: 'Kirim `namaLengkap` **dan** `nama` sekaligus. Klien lama tetap bekerja; klien baru memakai yang baru.',
        },
        {
          title: '2. Tandai yang lama sebagai usang',
          body: 'Dokumentasikan, dan kirim header `Deprecation` beserta `Sunset` yang menyebut tanggalnya. Catat siapa saja yang masih memakainya.',
        },
        {
          title: '3. Pantau pemakaiannya',
          body: 'Catat setiap permintaan yang masih membaca field lama, lengkap dengan identitas kliennya. Tanpa data ini, kamu tidak akan pernah berani menghapusnya.',
        },
        {
          title: '4. Hapus setelah pemakaiannya nol',
          body: 'Bukan setelah tanggal yang kamu umumkan — setelah **angkanya benar-benar nol**, atau setelah kamu menghubungi yang tersisa.',
        },
      ),
      code(
        'text',
        `
        HTTP/1.1 200 OK
        Deprecation: true
        Sunset: Wed, 31 Dec 2026 23:59:59 GMT
        Link: <https://contoh.com/docs/migrasi-v2>; rel="deprecation"
        `,
      ),
      p(
        'Ketiga header ini mengubah pengumuman "endpoint ini akan dihapus" dari catatan di dokumentasi, yang mungkin tidak pernah dibaca siapa pun, menjadi sesuatu yang **bisa dibaca mesin**. `Deprecation: true` menandai endpoint-nya sudah usang, `Sunset` menyebut tanggal pastinya dalam format tanggal HTTP, dan `Link` menunjuk ke panduan migrasinya. Klien yang tertib bisa mencatat ketiganya ke log dan memunculkan peringatan bagi timnya jauh sebelum tanggalnya tiba.',
      ),
      p(
        'Perhatikan status responsnya tetap `200` — endpoint yang usang **masih bekerja normal**, dan itu memang inti dari deprecation: memberi waktu, bukan memutus. Perhatikan pula ketiganya baru bermakna kalau langkah 3 di atas benar-benar dijalankan. Mengirim header lalu menghapus endpoint pada tanggal yang tertulis, tanpa pernah memeriksa apakah masih ada yang memakainya, adalah cara paling rapi untuk merusak aplikasi orang lain sambil merasa sudah memberi tahu.',
      ),

      h2('Berapa lama versi lama dipertahankan'),
      p(
        'Tergantung siapa kliennya. API internal bisa dihentikan dalam hitungan minggu. API yang dipakai aplikasi mobile harus hidup selama masih ada versi aplikasi lama yang terpasang — dan itu bisa **bertahun-tahun**, karena sebagian pengguna tidak pernah memperbarui.',
      ),
      callout(
        'warning',
        'Setiap versi yang hidup adalah kode yang harus dipelihara',
        'Tiga versi berarti tiga jalur kode, tiga kumpulan tes, dan tiga tempat yang harus diperbaiki saat ada bug keamanan. Jangan menambah versi untuk perubahan yang bisa dilakukan secara aditif — biayanya jauh lebih besar daripada yang terlihat saat memulainya.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Pertanyaan yang menentukan pada versioning bukan "bagaimana memberi versi" melainkan **apa yang menghitung sebagai perubahan yang memutus**. Jawabannya sering berlawanan dengan dugaan, dan berikut hasilnya diuji terhadap sebuah klien sungguhan.',
      ),
      code(
        'text',
        `
        Klien membaca payload seperti ini:
          bacaKlien = (p) => ({ id: p.id, judul: p.judul.toUpperCase(), status: p.status })

        Lima perubahan di sisi server:

          menambah field baru                    AMAN    {"id":1,"judul":"BELANJA","status":"baru"}
          menambah nilai enum baru               AMAN    {"id":1,"judul":"BELANJA","status":"menunggu_verifikasi"}
          mengganti nama field judul -> nama     MEMUTUS TypeError: Cannot read properties of
                                                         undefined (reading 'toUpperCase')
          mengubah tipe id angka -> string       AMAN    {"id":"1","judul":"BELANJA","status":"baru"}
          menghapus field judul                  MEMUTUS TypeError: Cannot read properties of
                                                         undefined (reading 'toUpperCase')
        `,
        { caption: 'Dijalankan sungguhan dengan Node 26.5.0.' },
      ),
      p(
        'Dua hasil di daftar itu perlu dibaca hati-hati, dan yang kedua adalah pelajaran tentang cara menguji, bukan tentang versioning.',
      ),
      p(
        'Baris "menambah nilai enum baru" tercatat AMAN, dan itu benar **hanya untuk klien khusus ini**, sebab ia sekadar meneruskan nilainya. Klien yang memetakan status ke label berperilaku sebaliknya.',
      ),
      code(
        'text',
        `
        Dua klien, satu payload dengan status BARU "menunggu_verifikasi":

          klien ketat  -> Status tidak dikenal: menunggu_verifikasi   (melempar)
          klien tahan  -> Status lain (menunggu_verifikasi)           (tetap jalan)

        Bedanya satu baris:
          ketat : const l = label[p.status]; if (!l) throw ...
          tahan : return label[p.status] ?? 'Status lain (' + p.status + ')'
        `,
        { caption: 'Dijalankan sungguhan. Menambah nilai enum MEMUTUS klien yang ketat.' },
      ),
      p(
        'Baris "mengubah tipe id angka menjadi string" juga tercatat AMAN, dan itu **hasil pengujian yang menyesatkan**. Klien ujinya terlalu sederhana, ia hanya meneruskan id tanpa melakukan apa pun terhadapnya. Klien sungguhan yang membandingkan `id === 42`, menghitung, atau memakainya sebagai kunci angka akan rusak seketika. Inilah alasan "tidak memutus klien uji saya" bukan bukti bahwa sebuah perubahan aman.',
      ),
      table(
        ['Perubahan', 'Aman?', 'Catatan'],
        [
          ['Menambah field baru ke respons', 'Aman', 'Selama klien mengabaikan field tak dikenal'],
          ['Menambah endpoint baru', 'Aman', 'Tidak menyentuh yang sudah ada'],
          ['Menambah parameter opsional', 'Aman', 'Selama bawaannya sama dengan perilaku lama'],
          [
            'Menambah nilai enum baru',
            '**Bergantung klien**',
            'Diuji, memutus klien yang memetakan ketat',
          ],
          ['Mengganti nama field', 'Memutus', 'Diuji, klien menerima `undefined`'],
          ['Menghapus field', 'Memutus', 'Sama'],
          [
            'Mengubah tipe field',
            'Memutus',
            'Klien uji sederhana tidak menangkapnya — jangan simpulkan dari situ',
          ],
          ['Memperketat validasi', 'Memutus', 'Permintaan yang dulu diterima kini ditolak'],
          [
            'Mengubah status code untuk keadaan yang sama',
            'Memutus',
            'Klien bercabang berdasarkan status',
          ],
        ],
      ),
      p(
        'Baris keempat itu yang paling sering diremehkan karena terasa seperti penambahan. Untuk menghindarinya, dokumentasikan sejak awal bahwa daftar nilai enum **bisa bertambah**, dan minta klien menangani nilai tak dikenal. Bila itu tidak bisa dijamin, penambahan nilai enum harus diperlakukan sebagai perubahan yang memutus.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan versioning tidak muncul saat kamu mengubah sesuatu. Ia muncul di perangkat orang lain, seringkali berhari-hari kemudian, dan biasanya tidak sampai ke log-mu sama sekali.',
      ),
      code(
        'text',
        `
        Yang terjadi ketika sebuah field dihapus tanpa versi baru:

          Aplikasi ponsel 3.2 terpasang di 40.000 perangkat, membaca p.judul
          Server diperbarui, field judul diganti nama menjadi nama

          Di server : 200 OK. Tidak ada error. Grafik kesehatan datar.
          Di ponsel : TypeError, layar putih, aplikasi tertutup sendiri

        Kegagalannya TIDAK terlihat dari sisimu sama sekali, sebab yang gagal
        adalah kode yang berjalan di perangkat pengguna.
        `,
      ),
      p(
        'Karena itu satu-satunya perlindungan yang bekerja adalah **tidak pernah mengubah bentuk yang sudah dijanjikan**. Yang berubah adalah versi baru di sebelahnya, dan versi lama tetap berjalan sampai tidak ada lagi yang memakainya.',
      ),
      code(
        'text',
        `
        Dua cara memberi versi, dan keduanya sah:

        DI JALUR
          /v1/pesanan   /v2/pesanan
          + terlihat langsung, mudah di-cache, mudah dirutekan di proxy
          + bisa dibuka di peramban tanpa alat khusus
          - satu sumber daya punya dua alamat

        DI HEADER
          Accept: application/vnd.toko.v2+json
          + alamatnya tetap satu
          - tidak terlihat di log biasa, sulit diuji dengan peramban
          - cache HARUS diberi tahu lewat Vary: Accept, dan ini sering lupa

        Yang paling penting bukan pilihannya melainkan bahwa ia DIPILIH SEKALI
        dan dipakai untuk seluruh API.
        `,
      ),
      p(
        'Baris `Vary: Accept` pada cara kedua bukan detail kecil. Tanpa header itu, sebuah cache di depan API bisa menyimpan respons versi 2 lalu menyajikannya kepada klien yang meminta versi 1, dan gejalanya berupa bentuk data yang berubah-ubah tanpa pola. Mekanismenya diukur di sub-bab caching.',
      ),
      p(
        'Pertanyaan terakhir yang selalu muncul adalah berapa lama versi lama dipertahankan, dan jawabannya bukan angka melainkan **ukuran**.',
      ),
      code(
        'text',
        `
        Jangan menghapus versi berdasarkan tanggal. Hapus berdasarkan PEMAKAIAN.

          1. Catat versi pada setiap permintaan yang masuk
          2. Umumkan penghentian, beserta tanggal paling awal
          3. Tambahkan header peringatan pada respons versi lama:
               Deprecation: true
               Sunset: Wed, 31 Dec 2026 23:59:59 GMT
          4. Pantau angkanya. Turunkan hanya setelah mendekati nol.
          5. Sebelum menghapus, matikan sementara beberapa jam — "latihan padam".
             Yang masih memakainya akan segera memberi tahu.

        Menghapus berdasarkan tanggal tanpa melihat angka pemakaian berarti
        memutus siapa pun yang belum sempat berpindah.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Versioning adalah keputusan yang biayanya nyaris nol di awal dan sangat mahal bila ditunda.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menunda `/v1` sampai benar-benar butuh versi kedua',
            'Sekarang belum perlu',
            'Saat dibutuhkan, sudah ada klien yang tidak bisa diubah. Biayanya sekarang nol',
          ],
          [
            'Mengganti nama field karena yang lama kurang tepat',
            'Cuma ganti nama',
            'Diuji sungguhan, klien menerima `undefined` dan melempar `TypeError`',
          ],
          [
            'Menambah nilai enum baru tanpa memberi tahu',
            'Cuma menambah',
            'Diuji sungguhan, klien yang memetakan ketat langsung melempar. Dokumentasikan sejak awal',
          ],
          [
            'Menyimpulkan aman karena klien uji sendiri tidak rusak',
            'Sudah diuji',
            'Diuji sungguhan, perubahan tipe id LOLOS pada klien sederhana dan merusak klien yang berhitung',
          ],
          [
            'Memberi versi per endpoint, bukan per API',
            'Yang berubah cuma satu',
            'Klien harus melacak beberapa versi sekaligus. Beri versi untuk seluruh API',
          ],
          [
            'Menghapus versi lama berdasarkan tanggal',
            'Sudah diumumkan jauh hari',
            'Memutus siapa pun yang belum berpindah. Hapus berdasarkan angka pemakaian yang dipantau',
          ],
        ],
      ),
      p(
        'Baris keempat pantas jadi penutup karena ia bentuk kesalahan penalaran yang berlaku jauh melampaui versioning. Pengujian membuktikan sebuah perubahan **tidak merusak hal yang diuji**, dan tidak pernah membuktikan bahwa ia aman bagi hal yang tidak diuji. Untuk API yang dipakai klien di luar kendalimu, satu-satunya sikap yang aman adalah menganggap setiap perubahan bentuk sebagai memutus, kecuali kamu punya alasan yang bisa dijelaskan mengapa ia tidak.',
      ),
      references(
        {
          label: 'RFC 9745 — The Deprecation HTTP Header Field',
          href: 'https://www.rfc-editor.org/rfc/rfc9745.html',
          source: 'IETF',
          note: 'Header `Deprecation` yang membuat peringatan usang bisa dibaca mesin.',
        },
        {
          label: 'RFC 8594 — The Sunset HTTP Header Field',
          href: 'https://www.rfc-editor.org/rfc/rfc8594.html',
          source: 'IETF',
          note: 'Pasangan `Deprecation` yang menyebut tanggal penghapusannya.',
        },
        {
          label: 'RFC 9110 §12 — Content Negotiation',
          href: 'https://www.rfc-editor.org/rfc/rfc9110.html#name-content-negotiation',
          source: 'IETF',
          note: 'Dasar teknis versioning lewat header `Accept`, alternatif dari versi di URL.',
        },
        {
          label: 'REST Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Termasuk anjuran memberi versi pada API dan menghapus versi lama secara terencana.',
        },
      ),
    ],
  ),

  written(
    'idempotency',
    'Idempotency & `Idempotency-Key`',
    19,
    'Membuat permintaan yang sama dua kali tidak berakibat dua kali.',
    [
      p(
        'Jaringan tidak bisa diandalkan. Klien mengirim permintaan, koneksinya putus sebelum jawaban tiba, lalu ia mencoba lagi — padahal permintaan pertama **sudah berhasil** di server. Tanpa penjagaan, pengguna terkena tagihan dua kali.',
      ),

      terms(
        {
          term: 'idempotency',
          meaning:
            'Sifat operasi yang **hasil akhirnya sama** meski dijalankan berkali-kali. Ia bukan soal kerapian melainkan soal jaringan: klien mengirim permintaan, koneksinya putus sebelum jawaban tiba, lalu ia mencoba lagi — padahal yang pertama **sudah berhasil**.',
        },
        {
          term: 'POST tidak idempoten',
          meaning:
            'Setiap panggilan `POST` membuat sesuatu yang baru. Tanpa penjagaan, percobaan ulang yang wajar dari sisi klien menghasilkan **tagihan dua kali** — dan klien tidak punya cara mengetahui yang pertama berhasil.',
        },
        {
          term: 'Idempotency-Key',
          meaning:
            'Header berisi kunci acak yang dibuat klien **sekali per operasi logis**, dan dipakai ulang saat mencoba lagi. Server mengingat hasil untuk kunci itu, lalu mengembalikan **jawaban yang sama persis** alih-alih memproses ulang.',
        },
        {
          term: 'scope kunci per pengguna',
          meaning:
            'Kunci disimpan sebagai `idem:{userId}:{kunci}`, bukan kunci telanjang. Tanpa itu, satu pengguna bisa **membaca hasil operasi pengguna lain** hanya dengan menebak kuncinya — IDOR yang muncul di tempat yang tidak terduga.',
        },
        {
          term: 'sidik jari body',
          meaning:
            'Hash isi permintaan yang disimpan bersama kuncinya. Kunci yang sama dengan **isi berbeda** adalah bug klien, dan menjawabnya `422` mencegah kesalahan itu berubah jadi hasil yang salah diam-diam.',
        },
        {
          term: 'klaim atomik',
          meaning:
            'Pola "cek dulu, lalu tulis" punya **celah di antaranya**: dua permintaan bersamaan bisa sama-sama melihat kunci belum ada, lalu keduanya memproses. Klaimnya harus satu `INSERT` yang mengandalkan `UNIQUE` — gagal karena bentrok berarti sudah ada yang menang.',
        },
        {
          term: 'status diproses',
          meaning:
            'Keadaan antara: kunci sudah diklaim tapi hasilnya belum ada. Permintaan kedua yang tiba di jendela ini dijawab `409`, bukan diproses ulang maupun dibiarkan menunggu tanpa batas.',
        },
        {
          term: 'kembalikan hasil identik',
          meaning:
            'Termasuk **status code**-nya, bukan hanya body. Percobaan ulang yang berhasil harus terlihat sama persis dengan yang pertama dari sudut pandang klien — kalau tidak, ia akan bercabang ke jalur yang salah.',
        },
        {
          term: 'masa berlaku kunci',
          meaning:
            'Kunci idempotensi disimpan **berbatas waktu** — biasanya 24 jam. Menyimpannya selamanya membuat tabelnya tumbuh tanpa henti; menghapusnya terlalu cepat membuat percobaan ulang yang terlambat diproses dua kali.',
        },
      ),

      h2('Yang sudah idempoten secara alami'),
      table(
        ['Method', 'Idempoten?', 'Kenapa'],
        [
          ['`GET`', 'Ya', 'Hanya membaca'],
          ['`PUT`', 'Ya', 'Menetapkan keadaan akhir, bukan menambah'],
          ['`DELETE`', 'Ya', 'Menghapus dua kali tetap satu terhapus'],
          ['`PATCH`', 'Tidak selalu', '`{ "saldo": "+100" }` menambah tiap kali'],
          ['`POST`', '**Tidak**', 'Setiap panggilan membuat sesuatu yang baru'],
        ],
      ),

      h2('`Idempotency-Key`'),
      code(
        'text',
        `
        POST /pembayaran
        Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
        Content-Type: application/json

        { "jumlah": 150000, "pesananId": 42 }
        `,
      ),
      p(
        'Klien membuat kunci acak **sekali per operasi logis**, dan memakai kunci yang sama saat mencoba lagi. Server mengingat hasil untuk kunci itu.',
      ),

      h2('Implementasinya'),
      code(
        'js',
        `
        export async function tanganiPembayaran(req, res) {
          const kunci = req.headers['idempotency-key'];

          if (typeof kunci !== 'string' || kunci.length < 16 || kunci.length > 128) {
            return res.status(400).json({
              error: { kode: 'IDEMPOTENCY_KEY_TIDAK_SAH', pesan: 'Header Idempotency-Key wajib' },
            });
          }

          // Kunci di-scope PER PENGGUNA — kalau tidak, satu pengguna bisa
          // membaca hasil operasi pengguna lain hanya dengan menebak kuncinya.
          const kunciPenuh = \`idem:\${req.pengguna.id}:\${kunci}\`;

          // Sidik jari body: kunci yang sama dengan isi berbeda adalah bug klien.
          const sidikJari = sha256(JSON.stringify(req.body));

          const tersimpan = await db.cariIdempotensi(kunciPenuh);

          if (tersimpan !== null) {
            if (tersimpan.sidikJari !== sidikJari) {
              return res.status(422).json({
                error: { kode: 'KUNCI_DIPAKAI_ULANG', pesan: 'Kunci dipakai untuk isi yang berbeda' },
              });
            }

            if (tersimpan.status === 'diproses') {
              // Permintaan pertama masih berjalan. Jangan proses ganda.
              return res.status(409).json({
                error: { kode: 'SEDANG_DIPROSES', pesan: 'Permintaan sedang diproses' },
              });
            }

            // Kembalikan hasil yang SAMA PERSIS, termasuk status code-nya.
            return res.status(tersimpan.statusCode).json(tersimpan.body);
          }

          // Klaim kuncinya secara atomik — INSERT yang gagal berarti
          // ada permintaan lain yang menang balapan.
          const berhasilKlaim = await db.klaimIdempotensi(kunciPenuh, sidikJari);
          if (!berhasilKlaim) {
            return res.status(409).json({
              error: { kode: 'SEDANG_DIPROSES', pesan: 'Permintaan sedang diproses' },
            });
          }

          const hasil = await layanan.proses(req.body, req.pengguna.id);

          await db.simpanHasilIdempotensi(kunciPenuh, 201, hasil);
          res.status(201).json(hasil);
        }
        `,
      ),
      p(
        'Baris `kunci di-scope PER PENGGUNA` adalah penjagaan keamanan yang mudah terlewat. Kalau kunci disimpan apa adanya, penyerang tinggal menebak atau mencuri satu kunci milik orang lain, mengirimkannya, dan servermu akan dengan patuh **mengembalikan hasil operasi orang tersebut** — termasuk detail pembayaran. Menempelkan `req.pengguna.id` di depan membuat ruang kunci setiap pengguna terpisah sepenuhnya.',
      ),
      p(
        'Sidik jari body menutup masalah yang berbeda, yaitu klien yang keliru memakai kunci yang sama untuk **dua operasi berbeda**. Tanpa pemeriksaan itu, permintaan kedua akan menerima hasil pembayaran pertama seolah pembayaran keduanya berhasil, padahal tidak pernah diproses. Karena itu jawabannya `422` dan bukan hasil tersimpan, sebab ini bug di sisi klien, dan ia harus tahu.',
      ),
      p(
        'Perhatikan status `409 SEDANG_DIPROSES` muncul di **dua** tempat, dan keduanya perlu. Yang pertama menangani percobaan ulang yang tiba saat permintaan awal masih berjalan. Yang kedua menangani keadaan yang lebih sempit: dua permintaan tiba **benar-benar bersamaan**, keduanya melihat kunci belum ada, lalu berlomba mengklaimnya. `klaimIdempotensi` menang untuk satu dan gagal untuk yang lain — dan kegagalan itulah yang mencegah pemrosesan ganda.',
      ),
      p(
        'Perhatikan pula urutan tiga baris terakhir: `layanan.proses` dijalankan **sebelum** hasilnya disimpan, dan status `201` yang disimpan sama persis dengan yang dikirim. Kesamaan itu bukan kerapian — percobaan ulang yang menerima `200` padahal aslinya `201` akan membuat klien mengira tidak ada yang dibuat, lalu bercabang ke jalur yang keliru.',
      ),
      callout(
        'danger',
        'Klaim kunci harus atomik',
        'Pola "cek dulu, lalu tulis" punya celah di antaranya: dua permintaan bersamaan bisa sama-sama melihat kunci belum ada, lalu keduanya memproses. Klaimnya harus berupa satu `INSERT` yang mengandalkan `UNIQUE` — kalau gagal karena bentrok, berarti sudah ada yang menang.',
      ),

      h2('Masa berlaku kunci'),
      code(
        'sql',
        `
        CREATE TABLE idempotensi (
          kunci        VARCHAR(200) PRIMARY KEY,
          sidik_jari   CHAR(64) NOT NULL,
          status       VARCHAR(20) NOT NULL,   -- diproses | selesai
          status_code  INTEGER,
          body         JSONB,
          kedaluwarsa_pada TIMESTAMPTZ NOT NULL
        );

        CREATE INDEX idx_idempotensi_kedaluwarsa ON idempotensi(kedaluwarsa_pada);
        `,
      ),
      p(
        'Simpan 24 jam sampai beberapa hari — cukup lama untuk menutupi percobaan ulang, cukup pendek supaya tabelnya tidak tumbuh tanpa batas. Bersihkan dengan job terjadwal.',
      ),

      h2('Kapan ini diperlukan'),
      ul(
        '**Pembayaran dan transaksi keuangan** — tanpa pengecualian.',
        '**Pembuatan pesanan** dengan stok terbatas.',
        '**Pengiriman notifikasi** — email ganda menyebalkan, SMS ganda berbiaya.',
        '**Webhook masuk** — pengirim hampir selalu memakai pengiriman at-least-once.',
      ),
      callout(
        'warning',
        'Webhook pasti akan terkirim lebih dari sekali',
        'Hampir semua penyedia webhook memakai jaminan **at-least-once**: kalau jawabanmu lambat atau gagal, mereka mengirim ulang. Handler webhook yang tidak idempoten akan memproses pembayaran yang sama dua kali. Simpan id peristiwa dari pengirim dan abaikan yang sudah pernah diproses.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Idempotensi menjawab satu situasi yang pasti terjadi dan tidak bisa dihindari, yaitu **klien tidak tahu apakah permintaannya sampai**. Jaringan ponsel terputus tepat setelah permintaan terkirim dan sebelum jawabannya tiba, dan dari sisi klien keadaan itu tidak bisa dibedakan dari permintaan yang tidak pernah sampai.',
      ),
      code(
        'text',
        `
        Yang dilihat klien ketika jaringannya putus:

          TypeError: fetch failed
          cause: ECONNREFUSED / ETIMEDOUT / TimeoutError

        Yang TIDAK diketahui klien:
          - apakah permintaannya sampai ke server
          - apakah pembayarannya sudah diproses
          - apakah mencoba lagi akan membuat pembayaran KEDUA
        `,
        { caption: 'Bentuk kegagalan ini dijalankan sungguhan di bab Fondasi dengan Node 26.5.0.' },
      ),
      p(
        'Untuk `GET`, `PUT`, dan `DELETE`, mencoba lagi aman karena ketiganya idempoten secara alami. Untuk `POST`, tidak. Berikut ukurannya.',
      ),
      code(
        'text',
        `
        Diuji sungguhan di bab Fondasi:

          POST /catatan dua kali dengan badan IDENTIK
            ke-1 -> 201 {"id":2,...}
            ke-2 -> 201 {"id":3,...}
            jumlah baris = 3        <- DUA catatan lahir

          PUT /catatan/1 dua kali dengan badan IDENTIK
            ke-1 -> 200
            ke-2 -> 200
            jumlah baris tidak bertambah

          DELETE /catatan/2 dua kali
            ke-1 -> 204
            ke-2 -> 204             <- keadaan yang diminta SUDAH tercapai
        `,
      ),
      p(
        'Untuk `POST` yang tidak boleh berlipat, polanya bernama **idempotency key**. Klien membuat satu identitas acak untuk satu niat, mengirimnya sebagai header, dan server memastikan satu kunci menghasilkan paling banyak satu hasil.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan node:http pada Node 26.5.0:

        Tanpa Idempotency-Key:
          {"status":400,"badan":{"error":"Header Idempotency-Key wajib"}}

        Satu kunci, dikirim BERURUTAN tiga kali:
          ke-1: 201 {"id":1,"jumlah":250000,"status":"berhasil"}
          ke-2: 201 {"id":1,...,"diulang":true}
          ke-3: 201 {"id":1,...,"diulang":true}

        Satu kunci, dikirim BERSAMAAN lima kali:
          ke-1: 201 {"id":2,...}
          ke-2: 201 {"id":2,...,"diulang":true}
          ke-3: 201 {"id":2,...,"diulang":true}
          ke-4: 201 {"id":2,...,"diulang":true}
          ke-5: 201 {"id":2,...,"diulang":true}

        Kunci BERBEDA berarti niat berbeda:
          201 {"id":3,...}

        Jumlah pembayaran yang benar-benar lahir: 3
        `,
        {
          caption: 'Dijalankan sungguhan. Lima permintaan bersamaan menghasilkan SATU pembayaran.',
        },
      ),
      p(
        'Bagian "bersamaan" itu yang membedakan implementasi yang benar dari yang hanya terlihat benar, dan sekaligus bagian yang paling sering salah ditulis.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Implementasi idempotency key yang paling sering ditulis pertama kali punya lubang yang hanya muncul ketika permintaannya benar-benar bersamaan.',
      ),
      code(
        'ts',
        `
        // BENTUK YANG TERLIHAT BENAR dan gagal saat bersamaan.
        const tersimpan = simpanan.get(kunci);
        if (tersimpan) return jawab(tersimpan.status, tersimpan.badan);

        const hasil = await prosesPembayaran(isi);     // <-- 80 ms
        simpanan.set(kunci, hasil);
        return jawab(201, hasil);

        // Lima permintaan tiba dalam selang beberapa milidetik:
        //   kelimanya memeriksa simpanan   -> KOSONG, sebab belum ada yang selesai
        //   kelimanya lolos ke prosesPembayaran
        //   LIMA pembayaran lahir
        //
        // Celahnya ada di antara pemeriksaan dan penyimpanan, dan tidak bisa
        // ditutup dengan kode yang lebih hati-hati — ia melekat pada
        // adanya dua langkah terpisah.
        `,
      ),
      p(
        'Perbaikannya menandai kuncinya **sebelum** pekerjaannya dimulai, lalu membuat permintaan berikutnya **menunggu** hasil yang sedang berjalan alih-alih memulai pekerjaan kedua.',
      ),
      code(
        'ts',
        `
        const tersimpan = simpanan.get(kunci);
        if (tersimpan) {
          // Permintaan kedua IKUT menunggu yang pertama, lalu mengembalikan
          // jawaban yang SAMA. Inilah yang membuat lima permintaan bersamaan
          // menghasilkan satu pembayaran.
          const hasil = await tersimpan.berjalan;
          return jawab(hasil.status, { ...hasil.badan, diulang: true });
        }

        let selesaikan;
        // Ditandai SEBELUM pekerjaannya dimulai, bukan sesudahnya.
        simpanan.set(kunci, { berjalan: new Promise((r) => (selesaikan = r)) });

        const hasil = await prosesPembayaran(isi);
        selesaikan(hasil);
        simpanan.set(kunci, { berjalan: Promise.resolve(hasil) });
        return jawab(hasil.status, hasil.badan);
        `,
        {
          caption:
            'Pada beberapa proses server, peran "menandai lebih dulu" dipegang basis data lewat INSERT ber-UNIQUE.',
        },
      ),
      p(
        'Catatan pada keterangan gambar itu penting untuk produksi. Contoh di atas memakai satu peta di memori, dan itu hanya cukup untuk satu proses. Ketika aplikasinya berjalan dalam beberapa proses atau beberapa mesin, penandanya harus berada di tempat yang dilihat semuanya, dan bentuk yang paling sederhana adalah `INSERT` ke tabel dengan batasan `UNIQUE` pada kolom kuncinya. Permintaan kedua akan menabrak batasan itu, dan tabrakan itulah sinyal bahwa ia pengulangan.',
      ),
      code(
        'text',
        `
        Diuji sungguhan di bab database, bentuk tabrakannya:

          ERROR:  duplicate key value violates unique constraint "pelanggan_email_key"
          DETAIL:  Key (email)=(pengguna1@contoh.id) already exists.

          SQLSTATE = 23505     <- diverifikasi lewat blok DO

        Tangkap KODE-nya, bukan teks pesannya, lalu perlakukan sebagai
        "ini pengulangan" alih-alih sebagai kegagalan.
        `,
      ),
      p('Dua keputusan terakhir sering dilewatkan dan keduanya berakibat nyata.'),
      code(
        'text',
        `
        1. MASA BERLAKU KUNCI

           Menyimpan kunci selamanya berarti tabelnya tumbuh tanpa batas.
           Menyimpannya terlalu sebentar berarti percobaan ulang yang tertunda
           — misalnya klien yang baru online lagi setelah beberapa jam —
           menghasilkan pembayaran kedua.

           Yang lazim: 24 jam, dan itu harus DIDOKUMENTASIKAN supaya klien tahu
           berapa lama ia boleh memakai kunci yang sama.

        2. KUNCI YANG SAMA DENGAN BADAN YANG BERBEDA

           Klien mengirim ulang kunci lama dengan jumlah pembayaran berbeda.
           Itu BUKAN pengulangan melainkan kesalahan klien.

           Simpan sidik badan permintaannya bersama kuncinya, lalu:
             badan sama    -> kembalikan hasil tersimpan
             badan berbeda -> 422, "Idempotency-Key sudah dipakai untuk
                              permintaan yang berbeda"
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Idempotensi adalah bagian yang paling sering dipasang setengah, dan setengahnya biasanya justru bagian yang memberi jaminannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memeriksa kunci lalu memproses, tanpa menandai lebih dulu',
            'Pemeriksaannya sudah ada',
            'Diuji sungguhan, lima permintaan bersamaan sama-sama lolos. Tandai SEBELUM memproses',
          ],
          [
            'Membuat kunci di sisi server',
            'Server yang tahu datanya',
            'Hanya klien yang tahu bahwa dua percobaan adalah satu niat yang sama. Kunci dibuat klien',
          ],
          [
            'Memakai hash badan permintaan sebagai kunci',
            'Badan sama berarti niat sama',
            'Dua pembelian identik yang memang disengaja jadi terblokir. Kunci harus acak per niat',
          ],
          [
            'Menyimpan kunci di memori proses',
            'Cepat dan sederhana',
            'Beberapa proses tidak saling melihat, dan restart menghapus semuanya. Simpan di tempat bersama',
          ],
          [
            'Menyimpan kunci selamanya',
            'Lebih aman',
            'Tabelnya tumbuh tanpa batas. Beri masa berlaku, dan dokumentasikan berapa lama',
          ],
          [
            'Menerima kunci yang sama dengan badan berbeda',
            'Kuncinya kan sama',
            'Itu kesalahan klien, bukan pengulangan. Simpan sidik badannya dan tolak bila berbeda',
          ],
        ],
      ),
      p(
        'Baris ketiga layak diperjelas karena memakai hash badan terasa lebih elegan. Masalahnya, dua pembelian kopi seharga jumlah yang sama pada hari yang sama adalah **dua niat berbeda** yang badan permintaannya identik. Memakai hash badan sebagai kunci akan menolak pembelian kedua dan mengembalikan hasil pembelian pertama, sehingga pengguna merasa sudah membayar padahal belum. Kunci harus acak dan dibuat klien tepat pada saat pengguna menekan tombolnya, sekali per niat.',
      ),
      references(
        {
          label: 'RFC 9110 §9.2.2 — Idempotent Methods',
          href: 'https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods',
          source: 'IETF',
          note: 'Definisi resmi idempotensi, dan method mana yang sudah idempoten secara alami.',
        },
        {
          label: 'The Idempotency-Key HTTP Header Field',
          href: 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/',
          source: 'IETF',
          note: 'Draf standar header yang dipakai contoh di atas, beserta perilaku yang diharapkan.',
        },
        {
          label: 'INSERT ... ON CONFLICT',
          href: 'https://www.postgresql.org/docs/17/sql-insert.html',
          source: 'PostgreSQL',
          note: 'Mekanisme klaim atomik yang mengandalkan `UNIQUE`, bukan cek-lalu-tulis.',
        },
        {
          label: '409 Conflict',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409',
          source: 'MDN Web Docs',
          note: 'Status yang dipakai saat permintaan pertama dengan kunci yang sama masih diproses.',
        },
      ),
    ],
  ),

  written(
    'caching-http',
    'Caching HTTP: `ETag` & `Cache-Control`',
    17,
    'Membiarkan klien dan perantara menyimpan jawaban dengan aman.',
    [
      p(
        'Permintaan tercepat adalah yang tidak pernah dikirim. Caching HTTP sudah tersedia di setiap browser dan CDN — yang perlu kamu lakukan hanyalah menyatakan aturannya dengan benar.',
      ),

      terms(
        {
          term: 'caching HTTP',
          meaning:
            'Menyimpan jawaban agar tidak perlu diminta ulang. **Permintaan tercepat adalah yang tidak pernah dikirim** — dan mekanismenya sudah tersedia di setiap browser dan CDN. Yang perlu kamu lakukan hanya menyatakan aturannya dengan benar.',
        },
        {
          term: 'no-cache ≠ jangan simpan',
          meaning:
            'Penamaan paling membingungkan di HTTP, dan sumber kebocoran nyata. `no-cache` berarti **"boleh disimpan, tapi validasikan dulu sebelum dipakai"**. Yang berarti "jangan pernah disimpan" adalah **`no-store`**.',
        },
        {
          term: 'public vs private',
          meaning:
            '`public` membolehkan cache **bersama** seperti CDN dan proxy menyimpannya. `private` membatasi ke browser pengguna itu saja. Salah memilih berarti jawaban milik satu orang bisa tersaji ke orang lain.',
        },
        {
          term: 'stale-while-revalidate',
          meaning:
            'Membolehkan cache menyajikan jawaban **yang sudah basi** sambil menyegarkannya di latar belakang. Pengguna mendapat jawaban seketika; kesegarannya menyusul. Trade-off yang sadar antara kecepatan dan kemutakhiran.',
        },
        {
          term: 'ETag',
          meaning:
            'Sidik jari isi sebuah respons. Klien menyimpannya, lalu mengirimkannya kembali lewat `If-None-Match`. Kalau isinya belum berubah, server menjawab **`304` tanpa body** — query tetap jalan, tapi bandwidth dan waktu parsing di klien terhemat.',
        },
        {
          term: '304 Not Modified',
          meaning:
            'Jawaban yang mengatakan "yang kamu punya masih benar". Ia **tidak boleh punya body** — itulah sumber penghematannya. Untuk respons besar di jaringan lambat, perbedaannya terasa langsung.',
        },
        {
          term: 'If-Match & 412',
          meaning:
            'Pasangan untuk **optimistic concurrency**. Klien mengirim ETag yang ia baca tadi; kalau isinya sudah berubah, server menolak `412 Precondition Failed`. Ini yang menutup lost update: perubahan editor pertama tidak lagi hilang tanpa jejak.',
        },
        {
          term: 'Vary',
          meaning:
            'Header yang memberitahu cache **apa saja yang memengaruhi isi respons**. Melewatkannya berbahaya: kalau respons bergantung pada `Authorization` tapi cache tidak diberi tahu, proxy bersama bisa menyimpan jawaban milik Ana lalu menyajikannya kepada Budi.',
        },
        {
          term: 'cache poisoning',
          meaning:
            'Nama kelas bug di atas: cache menyimpan jawaban yang salah lalu menyajikannya berkali-kali. Ia berulang muncul di layanan besar, dan hampir selalu berakar pada `Vary` yang kurang atau `public` yang seharusnya `private`.',
        },
      ),

      h2('`Cache-Control`'),
      code(
        'text',
        `
        # Data publik yang jarang berubah
        Cache-Control: public, max-age=3600

        # Boleh disimpan, tapi periksa dulu ke server setiap kali
        Cache-Control: no-cache

        # JANGAN pernah disimpan — untuk data privat & sensitif
        Cache-Control: no-store

        # Hanya browser pengguna, bukan CDN atau proxy bersama
        Cache-Control: private, max-age=300

        # Boleh pakai yang basi sambil menyegarkan di latar
        Cache-Control: public, max-age=60, stale-while-revalidate=600
        `,
      ),
      p(
        'Kata `public` dan `private` di sini **tidak berbicara soal izin akses** — keduanya menyebut *siapa yang boleh menyimpan*. `public` berarti cache bersama (CDN, proxy perusahaan) boleh menyimpannya dan menyajikannya ke siapa saja. `private` berarti hanya browser milik satu pengguna itu yang boleh. Salah memilih di sini adalah bagaimana data satu pengguna berakhir tersaji ke pengguna lain, dan itulah yang disebut cache poisoning di daftar istilah.',
      ),
      p(
        '`max-age=3600` menyebut berapa **detik** respons dianggap segar; selama itu klien memakainya tanpa bertanya ke server sama sekali. Baris terakhir menambahkan `stale-while-revalidate=600`, dan ini pola yang sangat berguna: setelah 60 detik pertama lewat, klien boleh **langsung menyajikan yang basi** sambil menyegarkannya di latar belakang. Penggunanya tidak pernah menunggu, dan servermu tidak dibanjiri permintaan serentak begitu masa segarnya habis.',
      ),
      callout(
        'danger',
        '`no-cache` tidak berarti "jangan simpan"',
        'Ini penamaan yang membingungkan dan sumber kebocoran nyata. `no-cache` berarti *"boleh disimpan, tapi validasikan dulu sebelum dipakai"*. Yang berarti "jangan pernah disimpan" adalah **`no-store`**. Untuk respons berisi data pribadi, `no-store` yang kamu butuhkan.',
      ),
      code(
        'js',
        `
        // Data privat — jangan sampai tersimpan di CDN atau proxy bersama
        res.set('Cache-Control', 'no-store');

        // Data publik yang boleh disimpan CDN
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
        `,
      ),
      p(
        'Dua baris ini adalah keputusan yang harus kamu ambil **per endpoint**, bukan sekali untuk seluruh aplikasi. Aturan praktisnya sederhana: kalau responsnya berbeda tergantung siapa yang bertanya, ia tidak boleh `public`. Endpoint di balik autentikasi hampir selalu masuk kategori pertama — dan di sana `no-store` lebih tepat daripada `private`, karena `private` masih mengizinkan browser menyimpannya ke disk, tempat ia bisa terbaca di perangkat bersama.',
      ),

      h2('`ETag` — validasi bersyarat'),
      code(
        'text',
        `
        # Permintaan pertama
        GET /artikel/42
        -> 200 OK
           ETag: "a1b2c3d4"
           { "data": { ... } }          <- 40 KB terkirim

        # Permintaan berikutnya
        GET /artikel/42
        If-None-Match: "a1b2c3d4"
        -> 304 Not Modified              <- 0 byte body
        `,
      ),
      p(
        'ETag adalah **sidik jari isi respons**, yaitu string apa pun yang pasti berubah begitu isinya berubah. Perhatikan alurnya, sebab server mengirimnya di permintaan pertama, klien menyimpannya, lalu mengembalikannya lewat `If-None-Match` di permintaan berikutnya. Kalau sidik jarinya masih sama, server cukup menjawab `304` tanpa body sama sekali. Perhatikan pula ETag ditulis **di dalam tanda kutip**, dan itu bagian dari formatnya alih-alih hiasan, dan menghilangkannya membuat sebagian klien tidak mengenalinya.',
      ),
      code(
        'js',
        `
        export async function ambilArtikel(req, res) {
          const artikel = await repo.cariSatu(req.params.id);
          if (artikel === null) return kirim404(res);

          // ETag dari sesuatu yang pasti berubah saat isinya berubah.
          const etag = \`"\${sha256(JSON.stringify(artikel)).slice(0, 16)}"\`;

          res.set('ETag', etag);
          res.set('Cache-Control', 'private, no-cache');

          if (req.headers['if-none-match'] === etag) {
            return res.status(304).end();   // tanpa body
          }

          res.json({ data: artikel });
        }
        `,
      ),
      p(
        'Servernya tetap bekerja — query tetap jalan. Yang dihemat adalah **bandwidth** dan waktu parsing di klien. Untuk respons besar di jaringan lambat, itu perbedaan yang terasa.',
      ),

      h2('`ETag` untuk mencegah lost update'),
      code(
        'text',
        `
        # Klien mengubah artikel yang ia baca tadi
        PUT /artikel/42
        If-Match: "a1b2c3d4"

        -> 200 kalau versinya masih sama
        -> 412 Precondition Failed kalau sudah diubah orang lain
        `,
      ),
      p(
        'Perhatikan headernya `If-Match` dan bukan `If-None-Match` seperti pada caching tadi, dan artinya pun berlawanan. `If-None-Match` berkata "kirimkan **kalau sudah berubah**", sedangkan `If-Match` berkata "terapkan **hanya kalau belum berubah**". ETag yang sama dipakai untuk dua tujuan yang berbeda, yaitu menghemat bandwidth pada `GET`, dan mencegah tindihan pada `PUT`.',
      ),
      p(
        'Yang membuat pola ini disebut **optimistic** adalah ia tidak mengunci apa pun. Tidak ada yang menahan artikel selama seseorang menyuntingnya — dua orang bebas membuka dan mengetik bersamaan. Bentroknya baru terdeteksi **saat menyimpan**, dan `412` adalah cara server berkata "isian yang kamu ubah sudah bukan versi terbaru". Klien lalu bisa mengambil versi baru dan menawarkan penggabungan, alih-alih diam-diam menghapus pekerjaan orang lain.',
      ),
      callout(
        'tip',
        'Ini optimistic concurrency, dan ia menutup bug yang halus',
        'Dua editor membuka artikel yang sama. Yang pertama menyimpan, yang kedua menyimpan setelahnya — dan perubahan yang pertama hilang tanpa jejak. Dengan `If-Match`, penyimpanan kedua ditolak `412`, dan klien bisa memberi tahu penggunanya bahwa isinya sudah berubah.',
      ),

      h2('`Vary` — jangan sampai cache tertukar'),
      code(
        'text',
        `
        Cache-Control: private, max-age=60
        Vary: Authorization, Accept-Language
        `,
      ),
      p(
        'Cache secara bawaan mengenali sebuah respons **hanya dari alamatnya**. Itu masalah begitu alamat yang sama bisa menghasilkan isi yang berbeda: `/api/saya/profil` mengembalikan profil Ana atau profil Budi tergantung header `Authorization`, tetapi cache tidak tahu itu kecuali diberi tahu. `Vary` adalah cara memberitahunya — "isi respons ini bergantung pada header berikut, jadi jadikan header itu bagian dari kunci penyimpanannya".',
      ),
      p(
        'Perhatikan `Accept-Language` disebut juga, karena masalahnya sama persis: alamat yang sama menghasilkan teks Indonesia atau Inggris, dan tanpa `Vary` pembaca kedua bisa menerima bahasa milik pembaca pertama. Aturan praktisnya, **setiap header yang ikut memengaruhi isi respons wajib disebut di `Vary`**. Dan untuk data pribadi, jangan mengandalkan `Vary` sebagai satu-satunya penjagaan — pasangkan dengan `no-store`, karena `Vary` yang benar tetap tidak menghalangi respons itu tersimpan di disk perangkat bersama.',
      ),
      callout(
        'danger',
        'Melewatkan `Vary` bisa menyajikan data orang lain',
        'Kalau respons bergantung pada `Authorization` tapi cache tidak diberi tahu, proxy bersama bisa menyimpan jawaban milik Ana lalu menyajikannya kepada Budi. Ini bukan teori — ia kelas bug yang berulang muncul di layanan besar. Untuk data privat, pasangkan `private` dengan `no-store`, dan sebutkan `Vary` untuk apa pun yang memengaruhi isinya.',
      ),

      h2('Apa yang boleh dan tidak boleh di-cache'),
      table(
        ['Boleh di-cache publik', 'Jangan pernah'],
        [
          ['Daftar kategori', 'Profil pengguna'],
          ['Artikel yang sudah terbit', 'Isi keranjang'],
          ['Konfigurasi publik', 'Apa pun di balik autentikasi'],
          ['Aset statis (dengan hash di nama berkas)', 'Respons yang memuat token'],
        ],
      ),

      h2('Invalidasi'),
      code(
        'js',
        `
        // Setelah mutasi, cache harus disegarkan.
        // Yang paling andal: ubah kuncinya, jangan berusaha menghapusnya.
        // Aset: /app.a1b2c3.js  -> nama berubah saat isinya berubah
        // API: naikkan versi di kunci cache internal
        `,
      ),
      p(
        'Menghapus entri cache yang tersebar di banyak CDN dan proxy sulit dijamin. Mengubah kunci selalu bekerja — inilah alasan bundler menaruh hash di nama berkas.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Caching HTTP sering dikira hanya soal kecepatan, dan salah satu manfaat terbesarnya justru soal **kebenaran data**. Mekanisme yang sama yang menghemat bandwidth juga mencegah dua penyunting saling menimpa tanpa disadari.',
      ),
      p(
        'Mulai dari sisi yang lebih dikenal. Berikut satu sumber daya yang diminta dua kali oleh klien yang sama.',
      ),
      code(
        'text',
        `
        GET /catatan/1
          200  ETag: "3403bb69fc03e075"   badan = 44 byte
               Cache-Control: private, max-age=0, must-revalidate

        GET /catatan/1  dengan header  If-None-Match: "3403bb69fc03e075"
          304  ETag: "3403bb69fc03e075"   badan = 0 byte
        `,
        { caption: 'Dijalankan sungguhan dengan node:http pada Node 26.5.0.' },
      ),
      p(
        'Nol byte itu yang dibeli. Server tetap mengerjakan query dan tetap menghitung ETag-nya, jadi yang dihemat bukan pekerjaan server melainkan **data yang melintas**. Pada respons kecil seperti ini selisihnya 44 byte, dan pada daftar berisi ratusan baris ia menjadi puluhan kilobyte per permintaan yang tidak perlu dikirim sama sekali.',
      ),
      p(
        'Nilai `Cache-Control` di atas juga bukan pilihan asal, dan tiap bagiannya menjawab satu pertanyaan.',
      ),
      table(
        ['Arahan', 'Artinya', 'Kapan dipakai'],
        [
          [
            '`private`',
            'Boleh disimpan peramban, TIDAK boleh oleh CDN bersama',
            'Apa pun yang berbeda per pengguna',
          ],
          ['`public`', 'Boleh disimpan siapa pun di jalur', 'Data yang sama untuk semua orang'],
          ['`no-store`', 'Tidak boleh disimpan sama sekali', 'Data rahasia, halaman pembayaran'],
          [
            '`max-age=0, must-revalidate`',
            'Selalu tanya server dulu, tapi boleh dijawab `304`',
            'Data yang berubah dan harus selalu segar',
          ],
          [
            '`max-age=31536000, immutable`',
            'Pakai tanpa bertanya selama setahun',
            'Berkas ber-hash di nama, misalnya `app.4f2a.js`',
          ],
        ],
      ),
      p(
        'Baris pertama yang paling sering salah dan akibatnya paling serius. Menandai respons per-pengguna sebagai `public` memungkinkan sebuah cache bersama menyimpan data milik satu orang lalu menyajikannya kepada orang lain. Kegagalannya bukan kegagalan performa melainkan **kebocoran data**, dan ia tidak menghasilkan satu pun error.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Mekanisme ETag punya kegunaan kedua yang jauh lebih berharga daripada penghematan bandwidth, yaitu mencegah **lost update**. Berikut dua penyunting yang membuka catatan yang sama pada saat yang sama.',
      ),
      code(
        'text',
        `
        Keduanya memegang ETag "3403bb69fc03e075".

        PUT /catatan/1  tanpa header If-Match
          428 Precondition Required
          { "error": "Header If-Match wajib" }

        penyunting A: PUT + If-Match: "3403bb69fc03e075"
          200  ETag: "c66f0361385f4a10"   {"id":1,"judul":"Versi A","versi":2}

        penyunting B: PUT + If-Match: "3403bb69fc03e075"   (etag LAMA)
          412 Precondition Failed
          { "error": "Data sudah diubah orang lain",
            "etagSekarang": "c66f0361385f4a10" }

        Isi akhirnya:
          {"id":1,"judul":"Versi A","versi":2}
        `,
        { caption: 'Dijalankan sungguhan dengan node:http pada Node 26.5.0.' },
      ),
      p(
        'Tanpa `If-Match`, kedua penulisan itu berhasil dan perubahan penyunting A **hilang tanpa jejak**, ditimpa oleh B yang bekerja di atas versi yang sudah basi. Tidak ada error di mana pun, dan A baru menyadarinya ketika membuka kembali catatannya dan menemukan tulisannya lenyap. Ini bentuk HTTP dari lost update yang sudah diukur di bab database pada tingkat basis data.',
      ),
      code(
        'text',
        `
        Bentuk yang sama diukur di bab database, pada tingkat baris:

          Saldo awal 100, dua proses masing-masing mengurangi 10.
          Pola baca-lalu-tulis  -> saldo akhir 90     <- satu pengurangan HILANG
          Pola atomik           -> saldo akhir 80     <- benar
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Status `428 Precondition Required` di atas juga keputusan yang disengaja. Server **menolak** menulis bila klien tidak menyertakan `If-Match` sama sekali, alih-alih membiarkannya lewat. Tanpa penolakan itu, klien yang lupa memasang perlindungannya akan tetap berjalan dan tetap rentan, dan tidak ada yang memberitahunya.',
      ),
      p(
        'Kegagalan caching yang paling berbahaya menyangkut header `Vary`, dan ia menghasilkan kebocoran data antar-pengguna.',
      ),
      code(
        'text',
        `
        Endpoint yang responsnya BERGANTUNG pada siapa yang meminta:

          GET /profil
            Authorization: Bearer <token-rina>   -> data Rina
            Authorization: Bearer <token-budi>   -> data Budi

        Sebuah cache bersama menyimpan berdasarkan URL. URL-nya SAMA.
        Tanpa Vary, cache menyimpan data Rina lalu menyajikannya ke Budi.

        Yang menutupnya:
          Cache-Control: private        <- cache bersama tidak boleh menyimpannya
          Vary: Authorization           <- dan bila tetap disimpan, dibedakan per token

        Vary juga wajib pada:
          Vary: Accept-Language         bila responsnya diterjemahkan
          Vary: Accept-Encoding         bila dikompresi
          Vary: Accept                  bila versi ditentukan lewat header Accept
        `,
      ),
      p(
        'Baris terakhir menghubungkan kembali ke sub-bab versioning. API yang menaruh versinya di header `Accept` **wajib** menyertakan `Vary: Accept`, sebab tanpa itu sebuah cache bisa menyimpan respons versi 2 lalu menyajikannya kepada klien yang meminta versi 1. Gejalanya berupa bentuk data yang berubah-ubah tanpa pola, dan ia sangat sulit ditelusuri karena tidak terjadi di setiap permintaan.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Caching adalah bagian yang kegagalannya paling tidak terlihat, sebab yang salah terjadi di lapisan yang tidak kamu tulis.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menandai respons per-pengguna sebagai `public`',
            'Supaya lebih cepat',
            'Cache bersama menyimpan data satu orang lalu menyajikannya ke orang lain. Itu kebocoran, bukan bug performa',
          ],
          [
            'Melupakan `Vary` pada respons yang bergantung header',
            'URL-nya kan sudah membedakan',
            'Cache menyimpan berdasarkan URL. Tanpa `Vary`, respons yang salah tersaji ke pengguna yang salah',
          ],
          [
            'Tidak memakai `If-Match` pada `PUT`',
            'Penyuntingnya kan satu orang',
            'Diuji sungguhan, perubahan penyunting pertama hilang ditimpa yang kedua, tanpa error apa pun',
          ],
          [
            'Membiarkan `PUT` tanpa `If-Match` tetap berjalan',
            'Supaya klien lama tidak rusak',
            'Klien yang lupa memasang perlindungannya tetap rentan dan tidak ada yang memberitahunya. Jawab `428`',
          ],
          [
            'Memberi `max-age` panjang pada data yang berubah',
            'Supaya hemat',
            'Pengguna melihat data basi dan tidak ada cara memaksanya segar. Pakai `must-revalidate` plus ETag',
          ],
          [
            'Menghitung ETag dari waktu, bukan dari isi',
            'Lebih murah',
            'Dua pembaruan dalam detik yang sama menghasilkan ETag yang sama, dan perubahannya tidak terlihat klien',
          ],
        ],
      ),
      p(
        'Baris terakhir punya bentuk yang lebih halus daripada kelihatannya. `Last-Modified` hanya punya ketelitian satu detik, jadi dua perubahan dalam detik yang sama tidak bisa dibedakan. Menghitung ETag dari **isi** responsnya, misalnya dengan hash, menghilangkan seluruh kelas masalah itu sekaligus, dan biayanya hanya satu kali hash atas data yang memang sudah ada di memori.',
      ),
      references(
        {
          label: 'Cache-Control',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control',
          source: 'MDN Web Docs',
          note: 'Setiap direktif beserta artinya — termasuk beda `no-cache` dan `no-store`.',
        },
        {
          label: 'ETag',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag',
          source: 'MDN Web Docs',
          note: 'Pemakaian bersama `If-None-Match` untuk `304`, dan `If-Match` untuk `412`.',
        },
        {
          label: 'Vary',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Vary',
          source: 'MDN Web Docs',
          note: 'Header yang mencegah cache bersama menyajikan jawaban milik orang lain.',
        },
        {
          label: 'RFC 9111 — HTTP Caching',
          href: 'https://www.rfc-editor.org/rfc/rfc9111.html',
          source: 'IETF',
          note: 'Spesifikasi caching HTTP, termasuk aturan validasi bersyarat.',
        },
      ),
    ],
  ),

  written(
    'operasi-panjang',
    'Operasi Panjang: `202 Accepted` + job id',
    16,
    'Memindahkan pekerjaan lama keluar dari jalur permintaan.',
    [
      p(
        'Ekspor 500.000 baris, pembuatan laporan, pemrosesan video, sinkronisasi ke pihak ketiga — semuanya tidak boleh dikerjakan di dalam permintaan HTTP. Klien akan timeout, dan pekerjaannya tetap berjalan tanpa ada yang tahu hasilnya.',
      ),

      terms(
        {
          term: '202 Accepted',
          meaning:
            'Jawaban yang berarti **"diterima, akan diproses"** — bukan "selesai". Ia dipasangkan dengan `Location` berisi alamat untuk memantau kemajuannya. Tanpa cara memantau, `202` hanya memindahkan ketidakpastian ke klien.',
        },
        {
          term: 'operasi panjang',
          meaning:
            'Pekerjaan yang tidak boleh dikerjakan di dalam permintaan HTTP: ekspor 500.000 baris, pembuatan laporan, pemrosesan video, sinkronisasi ke pihak ketiga. Klien akan **timeout**, dan pekerjaannya tetap berjalan tanpa ada yang tahu hasilnya.',
        },
        {
          term: 'job',
          meaning:
            'Satuan pekerjaan latar yang punya id dan **keadaan**: `antre`, `diproses`, `selesai`, `gagal`, `dibatalkan`. Id-nya yang dipegang klien untuk bertanya "sudah sampai mana".',
        },
        {
          term: 'status job harus di-scope',
          meaning:
            'Job id sering bisa ditebak, dan hasilnya sering berisi data sensitif. `GET /ekspor/job_a1b2c3` yang **tidak memeriksa pemiliknya** adalah IDOR — dengan hadiah berupa berkas ekspor lengkap.',
        },
        {
          term: 'job ganda',
          meaning:
            'Pengguna menekan tombol dua kali → dua ekspor identik berjalan, memakan sumber daya dua kali. `Idempotency-Key` menutupnya: kembalikan job yang **sudah ada**, jangan buat yang baru.',
        },
        {
          term: 'Retry-After',
          meaning:
            'Header yang memberi tahu klien **berapa lama harus menunggu** sebelum bertanya lagi. Tanpa itu, polling agresif dari banyak klien bisa membebani server lebih berat daripada pekerjaannya sendiri.',
        },
        {
          term: 'keadaan akhir',
          meaning:
            'Setiap job **wajib** punya keadaan akhir, dan batas waktu yang memindahkannya ke `gagal` kalau macet terlalu lama. Job yang gagal diam-diam lebih buruk daripada yang fail loudly: pengguna menunggu tanpa batas untuk sesuatu yang tidak akan pernah selesai.',
        },
        {
          term: 'bisaDiulang',
          meaning:
            'Bendera pada job yang gagal, yang memberi tahu klien apakah mencoba lagi masuk akal. Kegagalan jaringan sementara bisa diulang; input yang salah bentuk tidak — dan membedakannya menghemat percobaan sia-sia.',
        },
        {
          term: 'URL bertanda tangan',
          meaning:
            'Alamat unduhan yang memuat tanda tangan berbatas waktu, bukan alamat tetap yang bisa ditebak. Dipasangkan dengan penghapusan otomatis setelah kedaluwarsa — karena data ekspor sering memuat informasi sensitif.',
        },
      ),

      h2('Polanya'),
      code(
        'text',
        `
        # 1. Klien meminta
        POST /ekspor
        { "format": "csv", "rentang": "2026-01-01/2026-08-01" }

        HTTP/1.1 202 Accepted
        Location: /ekspor/job_a1b2c3
        { "data": { "jobId": "job_a1b2c3", "status": "antre" } }

        # 2. Klien memantau
        GET /ekspor/job_a1b2c3
        { "data": { "status": "diproses", "kemajuan": 45 } }

        # 3. Selesai
        GET /ekspor/job_a1b2c3
        {
          "data": {
            "status": "selesai",
            "unduhUrl": "https://.../ekspor/a1b2c3.csv?token=...",
            "kedaluwarsaPada": "2026-08-03T10:00:00Z"
          }
        }
        `,
      ),
      p(
        'Kunci pola ini ada di langkah 1, yaitu `202 Accepted` dan bukan `200`. Bedanya bukan sekadar angka, sebab `202` berarti *"permintaanmu diterima, tapi belum dikerjakan"*, sebuah janji yang berbeda dari "sudah selesai". Dan header `Location` mengubah janji itu jadi bisa ditindaklanjuti, sebab ia menunjuk **alamat job** dan bukan alamat hasilnya. Perhatikan responsnya sudah membawa `jobId` dan `status` sejak awal, sehingga klien punya sesuatu untuk ditampilkan seketika alih-alih layar kosong.',
      ),
      p(
        'Langkah 2 dan 3 memakai alamat yang **sama persis**, dan hanya isinya yang berubah seiring waktu. Itu keputusan desain yang penting: job adalah sumber daya yang punya satu alamat tetap, bukan rangkaian endpoint berbeda per keadaan. Klien cukup menanyakan alamat itu berulang dan membaca field `status` untuk tahu kapan berhenti bertanya.',
      ),
      p(
        'Perhatikan hasil akhirnya **tidak** dikirim langsung di dalam respons, melainkan sebagai `unduhUrl` beserta `kedaluwarsaPada`. Untuk ekspor yang bisa berukuran puluhan megabita, menyisipkannya ke JSON akan memaksa seluruh berkas masuk ke memori server dan memori klien sekaligus. Tanggal kedaluwarsa yang ikut dikirim juga bukan hiasan: ia memberi tahu klien bahwa tautan itu berbatas waktu, sesuai pola URL bertanda tangan di bagian akhir sub-bab ini.',
      ),

      h2('Bentuk status job'),
      code(
        'js',
        `
        const STATUS = ['antre', 'diproses', 'selesai', 'gagal', 'dibatalkan'];

        {
          jobId: 'job_a1b2c3',
          status: 'diproses',
          kemajuan: 45,                        // 0-100, kalau bisa dihitung
          dibuatPada: '2026-08-02T10:00:00Z',
          selesaiPada: null,
          hasil: null,
          error: null,                          // diisi kalau status 'gagal'
        }
        `,
      ),
      p(
        'Daftar `STATUS` di baris pertama adalah kontrak yang menentukan kapan klien boleh berhenti bertanya. Tiga di antaranya, yaitu `selesai`, `gagal`, dan `dibatalkan`, adalah **keadaan akhir**, sedangkan sisanya sementara. Tanpa pembagian yang tegas seperti ini, klien tidak punya cara tahu apakah ia masih perlu menunggu, dan job yang macet berubah menjadi spinner yang berputar selamanya.',
      ),
      p(
        'Perhatikan `hasil` dan `error` keduanya `null` selama job berjalan, dan **hanya salah satu** yang terisi di akhir. Bentuk seperti ini membuat klien bisa bercabang tanpa menebak. `kemajuan` diberi komentar "kalau bisa dihitung" karena tidak semua pekerjaan bisa diukur persentasenya — dan mengarang angka palsu yang melompat dari 10 ke 90 lebih merusak kepercayaan daripada tidak mengirimnya sama sekali; untuk kasus itu, kirim `null` dan biarkan antarmuka menampilkan indikator tak-tentu.',
      ),
      callout(
        'danger',
        'Status job harus di-scope ke pemiliknya',
        'Job id sering bisa ditebak, dan hasilnya sering berisi data sensitif. `GET /ekspor/job_a1b2c3` yang tidak memeriksa siapa pemilik job itu adalah IDOR — dengan hadiah berupa berkas ekspor lengkap. Setiap pembacaan status wajib di-scope ke pengguna yang meminta.',
      ),

      h2('Jangan buat job ganda'),
      code(
        'js',
        `
        // Pengguna menekan tombol dua kali -> dua ekspor identik berjalan.
        // Idempotency-Key (sub-bab 1.7) menutupnya:
        const kunci = req.headers['idempotency-key'];
        const adaJob = await db.cariJobAktif(req.pengguna.id, kunci);

        if (adaJob !== null) {
          // Kembalikan job yang SUDAH ada, jangan buat yang baru.
          return res.status(202)
            .location(\`/ekspor/\${adaJob.id}\`)
            .json({ data: adaJob });
        }
        `,
      ),
      p(
        'Tanpa penjagaan ini, tombol "Ekspor" yang diklik dua kali menghasilkan dua job identik yang memindai tabel yang sama dan menghasilkan berkas yang sama, sehingga bebannya dua kali lipat dan ada dua tautan unduhan yang membingungkan. Perhatikan `cariJobAktif` dicari lewat **dua** hal sekaligus, yaitu `req.pengguna.id` dan kuncinya. Tanpa id pengguna, satu orang bisa memakai kunci tebakan untuk mengambil job orang lain, persis seperti IDOR yang diperingatkan di atas.',
      ),
      p(
        'Yang paling penting: respons untuk permintaan kedua **sama persis** dengan yang pertama — `202` beserta header `Location` yang menunjuk job yang sudah ada. Klien tidak bisa membedakan mana permintaan pertama dan mana yang kedua, dan memang tidak perlu. Ini penerapan langsung idempotensi dari sub-bab 1.7, hanya diterapkan pada operasi yang jawabannya memang selalu "sedang dikerjakan".',
      ),

      h2('Memberi tahu klien tanpa polling terus-menerus'),
      table(
        ['Cara', 'Cocok untuk', 'Catatan'],
        [
          ['Polling', 'Job pendek, klien sederhana', 'Beri `Retry-After` supaya tidak membanjiri'],
          ['Webhook', 'Klien server-to-server', 'Klien harus punya endpoint publik'],
          ['SSE', 'Kemajuan waktu-nyata satu arah', 'Lebih sederhana dari WebSocket'],
          ['WebSocket', 'Dua arah', 'Paling berat; hanya kalau memang perlu'],
        ],
      ),
      code(
        'text',
        `
        HTTP/1.1 200 OK
        Retry-After: 5

        { "data": { "status": "diproses" } }
        `,
      ),
      p(
        '`Retry-After: 5` memberi tahu klien untuk menunggu lima detik sebelum bertanya lagi. Tanpa itu, setiap klien menebak sendiri — dan tebakan yang umum adalah "secepat mungkin", sehingga satu job yang berjalan dua menit menghasilkan ratusan permintaan sia-sia dari satu pengguna saja. Perhatikan servernya berada di posisi yang jauh lebih tahu: ia bisa menaikkan angka itu saat antreannya panjang, dan menurunkannya saat job hampir selesai.',
      ),
      p(
        'Perhatikan pula statusnya `200`, bukan `202`. Permintaan **membaca status** memang berhasil sepenuhnya — yang belum selesai adalah pekerjaan yang sedang ditanyakan, dan itu tercermin di field `status` di dalam body, bukan di kode HTTP-nya.',
      ),

      h2('Kegagalan harus terlihat'),
      code(
        'json',
        `
        {
          "data": {
            "jobId": "job_a1b2c3",
            "status": "gagal",
            "error": {
              "kode": "SUMBER_DATA_TIDAK_TERJANGKAU",
              "pesan": "Gagal mengambil data. Coba lagi nanti.",
              "requestId": "r_9f8e7d"
            },
            "bisaDiulang": true
          }
        }
        `,
      ),
      p(
        'Perhatikan status HTTP-nya tetap `200`, sebab permintaan membaca status berhasil dan yang gagal adalah **job**-nya. Kegagalan itu dinyatakan di dalam data lewat `status: "gagal"` beserta objek `error` yang bentuknya sama seperti error API biasa (`kode`, `pesan`, `requestId`). Keseragaman itu berharga, sebab klien bisa memakai penangan error yang sama tanpa menulis cabang khusus untuk job.',
      ),
      p(
        '`bisaDiulang: true` adalah field yang paling sering dilupakan dan paling menghemat waktu semua orang. Ia menjawab pertanyaan yang hanya bisa dijawab server, yaitu apakah kegagalan ini karena gangguan sementara seperti sumber data tidak terjangkau atau timeout, atau karena masukannya memang salah. Untuk yang pertama, tombol "Coba lagi" masuk akal. Untuk yang kedua, mencoba lagi hanya akan gagal dengan cara yang persis sama, dan yang perlu ditampilkan adalah cara memperbaiki masukannya.',
      ),
      callout(
        'warning',
        'Job yang gagal diam-diam lebih buruk daripada yang fail loudly',
        'Pengguna menunggu tanpa batas untuk sesuatu yang tidak akan pernah selesai. Setiap job harus punya keadaan akhir berupa `selesai`, `gagal`, atau `dibatalkan`, beserta batas waktu yang memindahkannya ke `gagal` kalau macet terlalu lama.',
      ),

      h2('Hasil yang bisa diunduh'),
      ul(
        'URL bertanda tangan dengan **masa berlaku pendek**, bukan URL tetap yang bisa ditebak.',
        'Simpan di object storage, bukan di disk instance yang bisa hilang.',
        'Hapus otomatis setelah kedaluwarsa — data ekspor sering memuat informasi sensitif.',
        'Sertakan `Content-Disposition` supaya browser mengunduhnya, bukan merendernya.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Permintaan yang mengerjakan sesuatu yang lama punya satu masalah yang tidak bisa diselesaikan dengan mempercepatnya, yaitu **klien tidak bisa menunggu selamanya**. Peramban, proxy, dan load balancer semuanya punya batas waktu sendiri, dan tidak satu pun di bawah kendalimu.',
      ),
      code(
        'text',
        `
        Bentuk yang gagal, dan gagalnya bertahap:

          POST /ekspor   -> server mulai menyusun berkas berisi 2 juta baris
                            ... 30 detik ...
                            proxy memutus sambungannya

          Yang dilihat klien : TimeoutError, tanpa tahu apakah ekspornya jadi
          Yang terjadi di server : ekspornya TETAP berjalan sampai selesai
          Yang dilakukan klien : mencoba lagi -> ekspor KEDUA dimulai
        `,
      ),
      p(
        'Polanya bernama `202 Accepted`, dan intinya memisahkan **menerima permintaan** dari **menyelesaikan pekerjaannya**. Berikut hasilnya dijalankan sungguhan.',
      ),
      code(
        'text',
        `
        POST /ekspor  dengan header Idempotency-Key: ekspor-sept-2026

          202  Location: /ekspor/068b21ba-5846-4164-aff6-ef07efb043d7
               Retry-After: 1
               {"id":"068b21ba-...","status":"antre","kemajuan":0}

        Klien mengirim ulang karena jaringannya putus:

          202  Location: /ekspor/068b21ba-...     <- job yang SAMA
               jumlah job yang benar-benar lahir: 1

        Klien memeriksa statusnya:

          200  {"id":"068b21ba-...","status":"antre","kemajuan":0}      Retry-After: 1
          200  {"id":"068b21ba-...","status":"berjalan","kemajuan":34}  Retry-After: 1
          200  {"id":"068b21ba-...","status":"berjalan","kemajuan":68}  Retry-After: 1
          200  {"id":"068b21ba-...","status":"selesai","kemajuan":100,
                "hasilUrl":"/unduh/068b21ba-..."}
        `,
        { caption: 'Dijalankan sungguhan dengan node:http pada Node 26.5.0.' },
      ),
      p(
        'Lima keputusan di dalamnya masing-masing menjawab satu kegagalan nyata. Status `202` menyatakan permintaannya diterima dan **belum** selesai, jadi klien tidak menunggu. Header `Location` menunjuk alamat untuk memeriksa kemajuannya, sehingga klien tidak perlu menyusun alamat itu sendiri. Header `Retry-After` memberi tahu seberapa sering boleh bertanya, sehingga klien tidak membanjiri server. Field `kemajuan` memungkinkan antarmuka menampilkan sesuatu selain putaran tanpa akhir. Dan `hasilUrl` baru muncul setelah statusnya selesai, sehingga klien tidak bisa mengunduh berkas yang belum ada.',
      ),
      p('Bagian yang paling sering dilewatkan adalah baris kedua, yaitu pencegahan job ganda.'),
      code(
        'ts',
        `
        // Klien mengirim ulang karena jaringannya putus. Tanpa kunci ini,
        // setiap percobaan ulang memulai ekspor BARU — dan ekspor besar mahal.
        const kunci = req.headers['idempotency-key'];
        if (!kunci) return jawab(400, { error: 'Idempotency-Key wajib' });

        const adaSebelumnya = [...job.values()].find((j) => j.kunci === kunci);
        if (adaSebelumnya) {
          // Tetap 202, tetap menunjuk job yang SAMA. Klien tidak perlu tahu
          // bahwa permintaannya adalah pengulangan.
          return jawab(202, adaSebelumnya.ringkas(), { Location: '/ekspor/' + adaSebelumnya.id });
        }
        `,
        { caption: 'Diuji sungguhan: dua permintaan dengan kunci sama menghasilkan satu job.' },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pola job punya beberapa kegagalan khas, dan yang paling sering justru bukan pada job-nya melainkan pada **bentuk statusnya**.',
      ),
      code(
        'text',
        `
        BENTUK STATUS YANG KURANG:

          { "selesai": false }

          Klien tidak bisa membedakan:
            - masih antre (belum mulai sama sekali)
            - sedang berjalan (dan sudah sampai mana)
            - GAGAL (dan kenapa)

          Tanpa keadaan "gagal", klien akan bertanya selamanya.

        BENTUK YANG LENGKAP:

          { "status": "antre"    , "kemajuan": 0 }
          { "status": "berjalan" , "kemajuan": 34 }
          { "status": "selesai"  , "kemajuan": 100, "hasilUrl": "/unduh/..." }
          { "status": "gagal"    , "kemajuan": 68,
            "error": { "type": ".../ekspor-gagal", "title": "Data terlalu besar" } }

        Perhatikan bentuk error-nya SAMA dengan bentuk error API lainnya.
        Satu bentuk untuk seluruh API, termasuk yang muncul di dalam status job.
        `,
      ),
      p(
        'Kegagalan kedua adalah polling yang tidak dibatasi, dan akibatnya menyerang servermu sendiri.',
      ),
      code(
        'text',
        `
        Klien yang bertanya setiap 100 milidetik:

          1 klien  = 10 permintaan/detik
          100 klien menunggu ekspor = 1.000 permintaan/detik,
          dan hampir semuanya menjawab "masih berjalan"

        Yang menutupnya, dan ketiganya murah:

          Retry-After: 1              server yang menentukan iramanya, bukan klien
          backoff di klien            1s, 2s, 4s, 8s, lalu tetap di 8s
          batas total waktu bertanya  berhenti setelah beberapa menit,
                                      tampilkan "ekspor masih diproses, kami kirim surel"
        `,
      ),
      p(
        'Untuk pekerjaan yang benar-benar lama, bertanya berulang kali bukan bentuk terbaik. Ada tiga alternatif, dan masing-masing punya biayanya sendiri.',
      ),
      table(
        ['Cara', 'Cocok untuk', 'Biayanya'],
        [
          [
            'Polling dengan `Retry-After`',
            'Pekerjaan beberapa detik sampai beberapa menit',
            'Paling sederhana, dan paling banyak permintaan kosong',
          ],
          [
            'Webhook',
            'Klien yang punya server sendiri',
            'Butuh tanda tangan, percobaan ulang, dan penanganan duplikat di sisi penerima',
          ],
          [
            'Server-Sent Events',
            'Antarmuka peramban yang ingin kemajuan langsung',
            'Sambungan tetap terbuka, dan proxy bisa memutusnya',
          ],
          [
            'Surel atau notifikasi',
            'Pekerjaan berjam-jam',
            'Klien tidak perlu menunggu sama sekali',
          ],
        ],
      ),
      p(
        'Kegagalan ketiga adalah job yang menggantung selamanya, dan ini yang paling sulit ditelusuri karena tidak menghasilkan error apa pun.',
      ),
      code(
        'text',
        `
        Job yang statusnya "berjalan" selama tiga hari.

        Penyebab yang paling sering:
          - proses worker mati di tengah, dan tidak ada yang menandai job-nya gagal
          - worker menjalankan kode LAMA karena tidak dimulai ulang setelah deploy
          - job menunggu layanan luar yang tidak punya batas waktu

        Yang menutupnya:
          - setiap job punya batas waktu maksimum; lewat itu ditandai "gagal"
          - setiap pemanggilan ke luar punya timeout eksplisit
          - worker dimulai ulang saat deploy, dan itu langkah terpisah yang
            mudah dilupakan
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Operasi panjang adalah tempat di mana bentuk yang paling sederhana justru yang paling cepat gagal di produksi.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengerjakan ekspor besar di dalam permintaan HTTP',
            'Satu permintaan, satu jawaban',
            'Proxy memutusnya di tengah. Pekerjaannya tetap berjalan, dan klien tidak tahu apa-apa',
          ],
          [
            'Menjawab `200` untuk pekerjaan yang belum selesai',
            'Permintaannya kan berhasil diterima',
            'Klien mengira hasilnya sudah ada. `202` menyatakan "diterima, belum selesai"',
          ],
          [
            'Tidak memakai idempotency key untuk memulai job',
            'Cuma tombol ekspor',
            'Diuji sungguhan, tanpa kunci setiap percobaan ulang memulai job baru. Ekspor besar mahal',
          ],
          [
            'Bentuk status hanya `{ selesai: true/false }`',
            'Itu yang ingin diketahui klien',
            'Tanpa keadaan "gagal", klien bertanya selamanya. Sertakan status, kemajuan, dan error',
          ],
          [
            'Membiarkan klien menentukan irama polling',
            'Kliennya yang tahu kebutuhannya',
            '100 klien menanyakan tiap 100 ms menjadi 1.000 permintaan/detik. Kirim `Retry-After`',
          ],
          [
            'Tidak memberi batas waktu pada job',
            'Nanti juga selesai',
            'Job yang worker-nya mati menggantung di status "berjalan" selamanya, tanpa error apa pun',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas ditegaskan karena ia satu-satunya di tabel ini yang gejalanya adalah **ketiadaan gejala**. Job yang menggantung tidak muncul di grafik error, tidak membunyikan pemantauan, dan tidak menghasilkan satu pun baris log setelah baris terakhirnya. Yang menemukannya biasanya pengguna yang bertanya kenapa ekspornya belum jadi sejak hari Selasa. Batas waktu maksimum per job mengubahnya menjadi kegagalan yang terlihat, dan kegagalan yang terlihat bisa diperbaiki.',
      ),
      references(
        {
          label: '202 Accepted',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/202',
          source: 'MDN Web Docs',
          note: 'Semantik "diterima, belum selesai" beserta kewajiban menyediakan cara memantau.',
        },
        {
          label: 'Retry-After',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After',
          source: 'MDN Web Docs',
          note: 'Memberi klien jeda polling yang wajar alih-alih membiarkannya menebak.',
        },
        {
          label: 'Server-Sent Events',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events',
          source: 'MDN Web Docs',
          note: 'Alternatif polling untuk kemajuan waktu-nyata satu arah, lebih ringan dari WebSocket.',
        },
        {
          label: 'Content-Disposition',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition',
          source: 'MDN Web Docs',
          note: 'Membuat browser mengunduh berkas hasil, bukan merendernya di tab.',
        },
      ),
    ],
  ),

  written(
    'openapi',
    'Dokumentasi API dengan OpenAPI',
    18,
    'Kontrak yang bisa dibaca mesin — dan karenanya tidak bisa basi diam-diam.',
    [
      p(
        'Dokumentasi yang ditulis terpisah dari kode akan basi. OpenAPI menutup celah itu: ia bisa dihasilkan dari skema validasi yang sudah kamu tulis, dan bisa dipakai untuk menghasilkan klien, memvalidasi respons, dan menguji kontrak.',
      ),

      terms(
        {
          term: 'OpenAPI',
          meaning:
            'Format standar untuk mendeskripsikan API HTTP, ditulis dalam YAML atau JSON. Yang membedakannya dari dokumentasi biasa: ia **bisa dibaca mesin** — dan karena itu bisa dipakai menghasilkan klien, memvalidasi respons, dan menguji kontrak.',
        },
        {
          term: 'dokumentasi yang basi',
          meaning:
            'Masalah yang diselesaikan sub-bab ini. Dokumentasi yang ditulis terpisah dari kode **pasti** akan berbeda — bukan karena orang malas, tapi karena **tidak ada yang membuatnya gagal** saat menyimpang.',
        },
        {
          term: 'satu source of truth',
          meaning:
            'Menghasilkan OpenAPI dari **skema validasi yang sudah kamu tulis**, bukan menulisnya terpisah. Dengan begitu keduanya tidak bisa berbeda: mengubah aturan validasi otomatis mengubah dokumentasinya.',
        },
        {
          term: 'components/schemas',
          meaning:
            'Bagian OpenAPI tempat bentuk data didefinisikan sekali lalu dirujuk berkali-kali dengan `$ref`. Ia mencegah definisi objek yang sama ditulis ulang di setiap endpoint — dan ikut menyimpang satu per satu.',
        },
        {
          term: 'securitySchemes',
          meaning:
            'Deklarasi cara autentikasi API-mu — bearer token, API key, OAuth. Ia yang membuat alat penghasil klien tahu harus mengirim header apa, tanpa pemakainya perlu menebak dari contoh.',
        },
        {
          term: 'openapi-typescript',
          meaning:
            'Alat yang menghasilkan **tipe TypeScript** dari spesifikasi OpenAPI. Ini yang membuat kontrak benar-benar berguna: frontend memakai tipe yang **diturunkan** dari API, bukan ditulis ulang dengan tangan.',
        },
        {
          term: 'uji kontrak',
          meaning:
            'Pengujian yang membandingkan **respons sungguhan** dengan spesifikasi. Ia menangkap penyimpangan yang tidak tertangkap unit test — misalnya field yang diam-diam berubah tipe atau hilang.',
        },
        {
          term: 'respons gagal yang tidak didokumentasikan',
          meaning:
            'Penyebab bug klien yang sering luput. Klien yang tidak tahu sebuah endpoint bisa menjawab `409` **tidak akan menanganinya** — dan penggunanya melihat pesan error mentah. Dokumentasi yang hanya memuat jalur sukses mendokumentasikan separuh kontrak.',
        },
        {
          term: 'spesifikasi juga endpoint',
          meaning:
            'Peringatan keamanan yang sering dilewat. Spesifikasi lengkap memberi **peta seluruh API**, termasuk endpoint admin yang tidak ditautkan di mana pun. Kalau API-mu tidak publik, lindungi `/openapi.json` dengan autentikasi yang sama.',
        },
      ),

      h2('Bentuknya'),
      code(
        'yaml',
        `
        openapi: 3.1.0
        info:
          title: API Ruang Belajar
          version: 1.0.0

        paths:
          /artikel:
            get:
              summary: Daftar artikel
              parameters:
                - name: hal
                  in: query
                  schema: { type: integer, minimum: 1, default: 1 }
                - name: per_hal
                  in: query
                  schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
              responses:
                '200':
                  description: Berhasil
                  content:
                    application/json:
                      schema:
                        $ref: '#/components/schemas/DaftarArtikel'
                '401':
                  $ref: '#/components/responses/TidakTerautentikasi'

        components:
          schemas:
            Artikel:
              type: object
              required: [id, judul, status]
              properties:
                id: { type: integer }
                judul: { type: string, maxLength: 200 }
                status: { type: string, enum: [draf, terbit, arsip] }
          securitySchemes:
            bearerAuth:
              type: http
              scheme: bearer
              bearerFormat: JWT
        `,
      ),
      p(
        'OpenAPI adalah **kontrak API yang bisa dibaca mesin** — itulah yang membedakannya dari dokumentasi biasa. Perhatikan setiap parameter menyebut bukan hanya tipenya tetapi juga batasnya: `minimum: 1`, `maximum: 100`, `default: 20`. Angka-angka itu sama persis dengan yang ditegakkan skema validasimu, dan menuliskannya di sini membuat klien tahu batasnya **sebelum** mencoba dan menerima `422`.',
      ),
      p(
        'Bagian `responses` menyebut `401` di samping `200`, dan itu bagian yang paling sering dilewatkan orang. Dokumentasi yang hanya memuat jalur sukses membuat klien tidak menyiapkan penanganan untuk kegagalan yang pasti akan terjadi. Perhatikan pula `$ref` yang dipakai dua kali — ia menunjuk definisi yang ditulis sekali di `components`, sehingga bentuk `TidakTerautentikasi` yang sama bisa dipakai puluhan endpoint tanpa disalin.',
      ),
      p(
        'Di dalam `components/schemas`, `required: [id, judul, status]` menyatakan field mana yang **dijamin ada** — pembeda penting bagi klien TypeScript, karena field di luar daftar itu harus diperlakukan sebagai mungkin tidak ada. Dan `securitySchemes` mendokumentasikan cara autentikasinya, sehingga alat seperti Swagger UI bisa menyediakan kolom isian token dan mencoba endpoint-nya langsung dari halaman dokumentasi.',
      ),

      h2('Hasilkan dari skema, jangan tulis dua kali'),
      code(
        'js',
        `
        import { z } from 'zod';
        import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

        extendZodWithOpenApi(z);

        // Skema yang SAMA dipakai untuk memvalidasi permintaan
        // DAN untuk menghasilkan dokumentasi.
        export const SkemaArtikel = z.object({
          id: z.number().int().openapi({ example: 42 }),
          judul: z.string().max(200).openapi({ example: 'Belajar API' }),
          status: z.enum(['draf', 'terbit', 'arsip']),
        }).openapi('Artikel');
        `,
      ),
      p(
        "Perhatikan yang ditulis di sini **hanya satu** skema, dan ia mengerjakan dua pekerjaan sekaligus: menolak permintaan yang tidak sah saat runtime, dan menghasilkan blok `components/schemas/Artikel` di spesifikasi. `extendZodWithOpenApi(z)` menambahkan method `.openapi()` ke Zod, dan `.openapi('Artikel')` di baris terakhir memberi nama pada skemanya sehingga bisa dirujuk lewat `$ref`.",
      ),
      p(
        'Nilai `example` bukan sekadar hiasan. Ia yang muncul di halaman dokumentasi interaktif dan di data tiruan untuk frontend, dan contoh yang **masuk akal** membuat dokumentasi jauh lebih cepat dipahami daripada deretan `"string"` dan `0` yang dihasilkan otomatis. Yang mendasari seluruh pendekatan ini: dokumentasi yang ditulis terpisah pasti akan menyimpang dari kode, bukan karena orang malas, melainkan karena tidak ada yang membuatnya **gagal** saat menyimpang.',
      ),
      callout(
        'tip',
        'Satu source of truth',
        'Dokumentasi yang ditulis tangan pasti akan berbeda dari kode — bukan karena orang malas, tapi karena tidak ada yang membuatnya gagal saat menyimpang. Menghasilkannya dari skema validasi membuat keduanya tidak bisa berbeda.',
      ),
      code(
        'php',
        `
        // Laravel: paket seperti Scramble membaca Form Request dan API Resource
        composer require dedoc/scramble
        // -> dokumentasi tersedia di /docs/api tanpa anotasi tambahan
        `,
      ),
      p(
        'Di Laravel prinsipnya sama tetapi jalannya lebih pendek: Form Request sudah memuat aturan validasi dan API Resource sudah memuat bentuk respons, jadi keduanya **sudah menjadi** source of truth tanpa perlu ditambahi apa pun. Scramble membacanya langsung — itulah arti "tanpa anotasi tambahan" pada komentar terakhir, dan ia berbeda dari pendekatan lama yang menuntut blok komentar `@OA\\...` di atas setiap method, yang pada akhirnya menyimpang dari kodenya sama seperti dokumentasi yang ditulis terpisah.',
      ),

      h2('Apa yang harus ada di setiap endpoint'),
      ol(
        '**Ringkasan** dalam satu kalimat, dan penjelasan kalau perilakunya tidak jelas.',
        '**Semua parameter** beserta tipe, batas, dan nilai default.',
        '**Skema respons sukses** dengan contoh sungguhan.',
        '**Semua respons gagal** yang mungkin — `400`, `401`, `403`, `404`, `409`, `422`, `429`.',
        '**Kebutuhan autentikasi** dan izin yang diperlukan.',
        '**Batas rate limit** yang berlaku untuk endpoint itu.',
      ),
      callout(
        'warning',
        'Respons gagal yang tidak didokumentasikan adalah penyebab bug klien',
        'Klien yang tidak tahu bahwa sebuah endpoint bisa menjawab `409` tidak akan menanganinya — dan penggunanya melihat pesan error mentah atau layar kosong. Dokumentasi yang hanya memuat jalur sukses hanya mendokumentasikan separuh kontrak.',
      ),

      h2('Yang bisa dilakukan setelah ada OpenAPI'),
      table(
        ['Kegunaan', 'Alat'],
        [
          ['Halaman dokumentasi interaktif', 'Swagger UI, Scalar, Redoc'],
          ['Menghasilkan klien bertipe', '`openapi-typescript`, `orval`'],
          ['Uji kontrak di CI', 'Dredd, Schemathesis'],
          ['Memvalidasi respons saat pengembangan', 'Middleware validator OpenAPI'],
          ['Data tiruan untuk frontend', 'Prism'],
        ],
      ),
      code(
        'bash',
        `
        # Menghasilkan tipe TypeScript untuk frontend dari spesifikasi yang sama
        npx openapi-typescript http://localhost:3000/openapi.json -o src/tipe-api.ts
        `,
      ),
      p(
        'Perintah ini menutup lingkarannya: skema Zod di backend menghasilkan spesifikasi OpenAPI, dan spesifikasi itu menghasilkan **tipe TypeScript untuk frontend**. Akibatnya, mengubah `judul` menjadi wajib di backend akan memunculkan error kompilasi di frontend yang belum menyesuaikan — ketidakcocokan kontrak tertangkap saat build, bukan sebagai bug runtime di tangan pengguna.',
      ),
      p(
        'Perhatikan berkas `src/tipe-api.ts` yang dihasilkan **tidak boleh disunting tangan**, karena ia akan ditimpa pada pembangkitan berikutnya. Jalankan perintah ini sebagai bagian dari alur kerja, misalnya skrip npm yang dipanggil setelah backend berubah, alih-alih sesekali saat teringat. Tipe yang basi lebih menyesatkan daripada tidak ada tipe sama sekali.',
      ),
      p(
        'Ini yang membuat kontrak benar-benar berguna: frontend memakai tipe yang **diturunkan** dari API, bukan ditulis ulang dengan tangan. Perubahan di backend langsung menjadi error type-check di frontend — dibahas lagi di Bab 4.1.',
      ),

      h2('Jangan bocorkan spesifikasi internal'),
      callout(
        'danger',
        'Endpoint dokumentasi juga endpoint',
        'Spesifikasi lengkap memberi peta seluruh API-mu — termasuk endpoint admin yang tidak ditautkan di mana pun. Kalau API-mu tidak publik, lindungi `/openapi.json` dan halaman dokumentasinya dengan autentikasi yang sama seperti endpoint lain. "Tidak ada yang tahu alamatnya" bukan kontrol akses.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Nilai OpenAPI bukan pada dokumen yang dihasilkannya melainkan pada satu hal yang sulit didapat dengan cara lain, yaitu **satu sumber kebenaran yang bisa diperiksa mesin**. Tanpa itu, dokumentasi selalu berakhir menjadi cerita tentang API yang pernah ada.',
      ),
      code(
        'text',
        `
        Yang terjadi tanpa kontrak yang diperiksa mesin:

          Bulan 1  dokumen ditulis, cocok dengan kode
          Bulan 3  sebuah field ditambahkan. Dokumen tidak diperbarui.
          Bulan 5  sebuah field diganti nama. Dokumen tidak diperbarui.
          Bulan 8  klien baru membaca dokumen, menulis kode, dan gagal —
                   lalu berhenti mempercayai dokumen itu selamanya.

        Sejak titik itu, dokumennya lebih buruk daripada tidak ada,
        sebab ia masih terlihat resmi dan sudah tidak benar.
        `,
      ),
      p(
        'Yang membalik keadaan itu bukan kedisiplinan memperbarui melainkan menjadikan dokumennya sebagai sesuatu yang **bisa gagal**. Ada dua arah, dan keduanya sah.',
      ),
      table(
        ['Arah', 'Bagaimana kontraknya dijaga', 'Cocok untuk'],
        [
          [
            'Spec lebih dulu',
            'Spec ditulis manual, lalu test memeriksa respons sungguhan terhadapnya',
            'API yang dipakai tim lain, dan bentuknya perlu disepakati sebelum ditulis',
          ],
          [
            'Kode lebih dulu',
            'Spec dihasilkan dari skema validasi yang memang sudah ada',
            'API internal yang berubah cepat, dan tim yang sama memegang kedua sisinya',
          ],
        ],
      ),
      p(
        'Arah kedua punya keuntungan yang layak disebut. Skema validasi permintaan **sudah ada** di kodemu, ditulis bukan untuk dokumentasi melainkan karena memang dibutuhkan. Menghasilkan spec darinya berarti dokumen itu tidak bisa menyimpang, sebab ia lahir dari benda yang sama dengan yang menegakkan aturannya.',
      ),
      code(
        'ts',
        `
        // Skema yang SUDAH ada untuk memvalidasi permintaan — bukan ditulis
        // untuk dokumentasi. Diuji sungguhan dengan zod 4.4.3 di bab Express.
        const BuatCatatan = z.object({
          judul: z.string().trim().min(1).max(200),
          prioritas: z.number().int().min(1).max(5),
          selesai: z.boolean().default(false),
        });

        // Dari objek yang SAMA, hasilkan potongan OpenAPI-nya.
        // Menambah field di skema otomatis menambahnya di dokumen,
        // dan tidak ada jalan bagi keduanya untuk menyimpang.
        `,
        {
          caption:
            'Prinsipnya: dokumen lahir dari benda yang menegakkan aturan, bukan ditulis di sebelahnya.',
        },
      ),
      p(
        'Bagian kontrak yang paling sering **tidak** didokumentasikan justru yang paling dibutuhkan pemakai API, dan seluruhnya sudah diukur di sub-bab sebelumnya.',
      ),
      code(
        'text',
        `
        Yang hampir selalu ada di dokumen:
          alamat, method, bentuk badan permintaan, bentuk respons sukses

        Yang hampir selalu TIDAK ada, dan justru paling dibutuhkan:

          - seluruh status kegagalan beserta bentuknya
              400 badan tidak bisa diurai, 422 validasi, 409 konflik
          - nilai yang DIIZINKAN untuk parameter pengurut
              diuji sungguhan: {"field":"urut","diizinkan":["terbaru","judul","prioritas"]}
          - batas atas limit, dan apa yang terjadi bila dilampaui
          - berapa lama Idempotency-Key berlaku
          - apakah daftar nilai enum BISA BERTAMBAH
          - arti gabungan beberapa penyaring: DAN atau ATAU
          - header yang mempengaruhi respons, yang berarti Vary-nya
        `,
      ),
      p(
        'Baris kelima yang paling menentukan dan paling sering luput. Sudah diukur di sub-bab versioning bahwa menambah satu nilai enum **memutus** klien yang memetakan nilainya secara ketat. Menuliskan di dokumen bahwa daftar itu bisa bertambah memindahkan tanggung jawab menangani nilai tak dikenal ke klien, secara sadar dan sejak awal.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan kontrak tidak menghasilkan error di servermu. Ia menghasilkan error di kode orang lain, dan biasanya tidak pernah sampai ke lognya.',
      ),
      code(
        'text',
        `
        Tiga bentuk penyimpangan yang paling sering, semuanya senyap:

        1. Dokumen menyebut field yang sudah tidak ada
             dokumen: { "judul": "string" }
             kenyataan: { "nama": "string" }
             klien menulis p.judul.toUpperCase() dan menerima:
               TypeError: Cannot read properties of undefined (reading 'toUpperCase')

        2. Dokumen menyebut tipe yang berbeda
             dokumen: "id": integer
             kenyataan: "id": string
             klien membandingkan id === 42 dan tidak pernah cocok

        3. Dokumen tidak menyebut satu pun bentuk kegagalan
             klien menulis penanganan untuk 200 saja, dan menganggap
             selain itu sebagai "server rusak" — termasuk 422 yang
             sebenarnya kesalahan klien sendiri
        `,
        {
          caption:
            'Pesan TypeError pada nomor 1 dijalankan sungguhan dengan Node 26.5.0 di sub-bab versioning.',
        },
      ),
      p(
        'Yang menutup ketiganya bukan ketelitian membaca melainkan **test yang membandingkan respons sungguhan dengan spec**, dijalankan di setiap perubahan.',
      ),
      code(
        'ts',
        `
        // Bentuk paling sederhana yang sudah menutup sebagian besar penyimpangan,
        // dan tidak butuh alat apa pun selain skema yang sudah ada.
        it('respons daftar catatan cocok dengan kontraknya', async () => {
          const r = await fetch(dasar + '/v1/catatan?limit=2', { headers: { Accept: 'application/json' } });

          expect(r.status).toBe(200);
          expect(r.headers.get('content-type')).toContain('application/json');

          // Skema yang SAMA dengan yang dipakai menghasilkan dokumen.
          const hasil = SkemaDaftarCatatan.safeParse(await r.json());
          expect(hasil.success, JSON.stringify(hasil.error?.issues)).toBe(true);
        });

        it('jalur kegagalan juga bagian dari kontrak', async () => {
          const r = await fetch(dasar + '/v1/catatan?urut=harga', { headers: { Accept: 'application/json' } });

          expect(r.status).toBe(422);
          expect(r.headers.get('content-type')).toContain('application/problem+json');
          expect(SkemaProblemDetails.safeParse(await r.json()).success).toBe(true);
        });
        `,
        {
          caption:
            'Test kedua itu yang paling sering tidak ada, dan justru jalur kegagalan yang paling sering menyimpang.',
        },
      ),
      callout(
        'warning',
        'Contoh OpenAPI di sub-bab ini tidak dijalankan',
        'Project ini tidak memasang pustaka OpenAPI maupun alat pemeriksa spec, dan aturan project melarang menambah dependency tanpa persetujuan lebih dulu (`core.md`, Dependency Version Gate). Potongan di atas disusun mengikuti dokumentasi resmi OpenAPI dan pustaka terkait. Yang **dijalankan sungguhan** adalah seluruh respons yang dijadikan contohnya di sub-bab lain bab ini, termasuk bentuk `application/problem+json` dan daftar nilai `diizinkan`.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Dokumentasi API punya satu sifat yang membedakannya dari dokumentasi lain, yaitu ia dipakai orang yang tidak bisa membaca kodemu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis dokumen terpisah dari kode',
            'Lebih bebas menjelaskan',
            'Ia menyimpang pada perubahan pertama, dan sejak itu lebih buruk daripada tidak ada',
          ],
          [
            'Hanya mendokumentasikan jalur sukses',
            'Itu yang ingin dipakai orang',
            'Klien tidak tahu bentuk kegagalannya, lalu memperlakukan semua non-200 sebagai server rusak',
          ],
          [
            'Tidak menyebut nilai yang diizinkan untuk parameter',
            'Nanti juga ketahuan dari error',
            'Pemakai menebak berkali-kali. Sertakan daftarnya di dokumen DAN di pesan errornya',
          ],
          [
            'Tidak menyebut apakah daftar enum bisa bertambah',
            'Sekarang nilainya cuma empat',
            'Diuji sungguhan, menambah satu nilai memutus klien yang memetakan ketat',
          ],
          [
            'Memakai contoh yang tidak pernah dijalankan',
            'Ditulis dari kode yang benar',
            'Contoh yang salah ketik tetap terlihat resmi. Ambil contohnya dari respons sungguhan',
          ],
          [
            'Tidak menguji respons terhadap spec-nya',
            'Spec-nya kan dihasilkan dari kode',
            'Dihasilkan dari skema permintaan tidak berarti respons-nya ikut cocok. Uji keduanya',
          ],
        ],
      ),
      p(
        'Baris kelima punya perbaikan yang murah dan jarang dipakai. Alih-alih menulis contoh respons dengan tangan, ambil dari respons sungguhan yang dihasilkan test, lalu simpan sebagai berkas contoh. Dengan begitu contoh di dokumen tidak bisa salah ketik, dan ia otomatis berubah ketika bentuk responsnya berubah. Seluruh contoh keluaran di bab ini disusun dengan cara itu, yaitu disalin dari keluaran yang benar-benar dijalankan, bukan diketik ulang.',
      ),
      references(
        {
          label: 'OpenAPI Specification 3.1',
          href: 'https://spec.openapis.org/oas/latest.html',
          source: 'OpenAPI Initiative',
          note: 'Spesifikasi resmi — struktur `paths`, `components`, dan `securitySchemes`.',
        },
        {
          label: 'Zod — Basics',
          href: 'https://zod.dev/basics',
          source: 'Zod',
          note: 'Skema validasi yang menjadi sumber tunggal bagi dokumentasi yang dihasilkan.',
        },
        {
          label: 'Laravel — Validation & API Resources',
          href: 'https://laravel.com/docs/12.x/validation',
          source: 'Laravel',
          note: 'Sumber yang dibaca alat penghasil dokumentasi di sisi Laravel.',
        },
        {
          label: 'REST Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Termasuk anjuran melindungi endpoint dokumentasi pada API non-publik.',
        },
      ),
    ],
  ),

  written(
    'praktik-audit-api',
    'Praktik: Audit API CRUD-mu sendiri',
    21,
    'Menerapkan seluruh bab pada API yang sudah kamu bangun.',
    [
      p(
        'Ambil API catatan yang kamu bangun di Backend Basic — versi Express maupun Laravel. Bab ini memberi kamu daftar periksa; sekarang jalankan pada kodemu sendiri dan catat temuannya.',
      ),

      terms(
        {
          term: 'audit',
          meaning:
            'Pemeriksaan sistematis terhadap sesuatu yang **sudah** ada, memakai daftar periksa yang ditetapkan lebih dulu. Bedanya dari "membaca ulang kode": urutannya ditentukan daftar, bukan oleh apa yang kebetulan menarik perhatianmu.',
        },
        {
          term: 'panggil, jangan baca',
          meaning:
            'Disiplin inti latihan ini. Audit yang dilakukan dengan **membaca kode** akan menemukan yang kamu **ingat**, bukan yang kamu **tulis**. Panggil endpoint-nya dan catat apa yang benar-benar terjadi.',
        },
        {
          term: 'catat yang diterima',
          meaning:
            'Tulis status code dan body yang **sungguhan keluar**, bukan yang menurutmu seharusnya. Selisih antara keduanya persis daftar pekerjaan yang tersisa — dan selisih itu tidak akan terlihat kalau kamu hanya membaca.',
        },
        {
          term: 'temuan',
          meaning:
            'Satu penyimpangan konkret dari daftar periksa, ditulis dengan endpoint, apa yang diharapkan, dan apa yang terjadi. Temuan tanpa ketiganya tidak bisa ditindaklanjuti — ia jadi catatan perasaan, bukan pekerjaan.',
        },
        {
          term: 'urutkan berdasarkan dampak',
          meaning:
            'Langkah penutup yang menentukan. Bocornya data pengguna lain jauh lebih mendesak daripada URL yang penamaannya tidak konsisten. Daftar temuan yang tidak berurutan membuat yang penting tenggelam di antara yang sepele.',
        },
        {
          term: 'header yang menyebut teknologi',
          meaning:
            '`X-Powered-By: Express` atau `Server: nginx/1.24.0`. Ia tidak membuka celah sendiri, tapi memberi tahu penyerang **kerentanan mana yang layak dicoba**. Matikan — ia tidak memberi manfaat apa pun bagi klien sah.',
        },
        {
          term: 'audit lintas dua stack',
          meaning:
            'Latihan ini dijalankan pada versi Express **dan** Laravel milikmu. Temuan yang muncul di keduanya adalah masalah **prinsip**; yang hanya di satu adalah kebiasaan framework — dan membedakannya itu bagian dari pelajarannya.',
        },
        {
          term: 'daftar periksa sebagai kontrak',
          meaning:
            'Enam belas butir di akhir sub-bab bukan saran melainkan **kriteria selesai**. Setiap butir bisa dijawab ya atau tidak dengan satu perintah `curl` — bukan dengan membaca ulang kode dan merasa yakin.',
        },
      ),

      h2('Cara mengaudit'),
      p(
        'Jangan membaca kode. **Panggil endpoint-nya** dan catat apa yang benar-benar terjadi. Audit yang dilakukan dengan membaca akan menemukan yang kamu ingat, bukan yang kamu tulis.',
      ),

      h2('1. Struktur URL'),
      code(
        'bash',
        `
        # Daftar seluruh rute yang benar-benar terdaftar
        php artisan route:list          # Laravel
        # atau baca berkas routes/ untuk Express
        `,
      ),
      p(
        'Mulai dari sini karena keluaran perintah ini adalah **daftar yang benar-benar terdaftar**, bukan yang kamu kira terdaftar. Rute bisa lahir dari tempat yang tidak terlihat di satu berkas mana pun — `apiResource` yang membuat lima sekaligus, grup yang menyuntikkan middleware, paket pihak ketiga yang mendaftarkan endpoint sendiri. Baca kolom middleware-nya bersamaan dengan kolom path; empat pertanyaan di bawah dijawab dari tabel yang sama.',
      ),
      ul(
        'Semua kata benda jamak dan konsisten satu bahasa?',
        'Ada kata kerja yang tersisa di path (`/getCatatan`, `/hapusCatatan`)?',
        'Ada rute yang bersarang lebih dari dua tingkat?',
        'Ada rute yang tidak sengaja terbuka — kolom middleware-nya kosong?',
      ),

      h2('2. Status code'),
      code(
        'bash',
        `
        # Catat status code SEBENARNYA untuk setiap kasus
        curl -s -o /dev/null -w "POST kosong        -> %{http_code}\\n" \\
          -X POST localhost:3000/api/catatan -H "Authorization: Bearer $T" \\
          -H 'Content-Type: application/json' -d '{}'

        curl -s -o /dev/null -w "JSON rusak         -> %{http_code}\\n" \\
          -X POST localhost:3000/api/catatan -H "Authorization: Bearer $T" \\
          -H 'Content-Type: application/json' -d '{"judul": '

        curl -s -o /dev/null -w "tanpa token        -> %{http_code}\\n" \\
          localhost:3000/api/catatan

        curl -s -o /dev/null -w "milik orang lain   -> %{http_code}\\n" \\
          localhost:3000/api/catatan/1 -H "Authorization: Bearer $T_LAIN"

        curl -s -o /dev/null -w "id bukan angka     -> %{http_code}\\n" \\
          localhost:3000/api/catatan/abc -H "Authorization: Bearer $T"

        curl -s -o /dev/null -w "tidak ada          -> %{http_code}\\n" \\
          localhost:3000/api/catatan/999999 -H "Authorization: Bearer $T"

        curl -s -o /dev/null -w "buat berhasil      -> %{http_code}\\n" \\
          -X POST localhost:3000/api/catatan -H "Authorization: Bearer $T" \\
          -H 'Content-Type: application/json' -d '{"judul":"A","isi":"B"}'

        curl -s -o /dev/null -w "hapus berhasil     -> %{http_code}\\n" \\
          -X DELETE localhost:3000/api/catatan/1 -H "Authorization: Bearer $T"
        `,
      ),
      table(
        ['Kasus', 'Harus'],
        [
          ['POST body kosong', '`422`'],
          ['JSON rusak', '`400`'],
          ['Tanpa token', '`401`'],
          ['Milik orang lain', '`404` (atau `403`)'],
          ['id bukan angka', '`400`'],
          ['Tidak ada', '`404`'],
          ['Buat berhasil', '`201` + header `Location`'],
          ['Hapus berhasil', '`204` tanpa body'],
        ],
      ),
      callout(
        'danger',
        'Baris keempat adalah yang paling penting',
        'Kalau ia menjawab `200`, kamu punya IDOR — dan setiap pengguna bisa membaca data seluruh pengguna lain hanya dengan menaikkan angka di URL. Perbaiki ini sebelum yang lain.',
      ),

      h2('3. Bentuk error'),
      code(
        'bash',
        `
        # Kumpulkan SEMUA bentuk error yang dihasilkan API-mu
        for kasus in "kosong" "rusak" "tanpa-token" "tidak-ada"; do
          echo "--- $kasus ---"
        done
        # Lalu bandingkan: apakah semuanya berbentuk sama?
        `,
      ),
      p(
        'Yang diuji di sini bukan satu error, melainkan **keseragaman antar error**. Karena itu keempat kasusnya harus dikumpulkan berdampingan lalu dibandingkan — perbedaan bentuk baru terlihat saat keempatnya ada di layar bersamaan, tidak saat kamu memeriksanya satu per satu di waktu berbeda. Perhatikan keempat kasus itu sengaja menyentuh lapisan yang berbeda: validasi, parser body, middleware auth, dan handler. Empat lapisan itulah tempat bentuk error paling sering menyimpang, karena masing-masing punya penanganan bawaannya sendiri.',
      ),
      ul(
        'Satu bentuk untuk semua error?',
        'Ada `err.message` mentah yang bocor untuk kasus `5xx`?',
        'Ada nama tabel, jalur berkas, atau potongan query di respons?',
        'Ada `requestId` yang bisa dicocokkan ke log?',
      ),

      h2('4. Paginasi & batas'),
      code(
        'bash',
        `
        # Apakah batas atasnya ditegakkan?
        curl -s "localhost:3000/api/catatan?per_hal=999999" -H "Authorization: Bearer $T" \\
          | head -c 200

        # Apakah urutannya stabil? Panggil dua kali, bandingkan.
        curl -s "localhost:3000/api/catatan?hal=1" -H "Authorization: Bearer $T" > /tmp/a.json
        curl -s "localhost:3000/api/catatan?hal=1" -H "Authorization: Bearer $T" > /tmp/b.json
        diff /tmp/a.json /tmp/b.json && echo "stabil" || echo "TIDAK STABIL"
        `,
      ),
      p(
        'Perintah pertama menguji satu hal saja: apakah `?per_hal=999999` benar-benar dibatasi. `head -c 200` sengaja memotong keluarannya, karena kalau batasnya **tidak** ditegakkan, responsnya bisa puluhan megabita dan terminalmu ikut tersendat — pemotongan itu bagian dari pengujiannya, bukan kerapian.',
      ),
      p(
        'Uji kedua menangkap masalah yang tidak akan pernah terlihat dengan memanggil endpoint sekali. Dua permintaan **identik** dijalankan berturut-turut, lalu `diff` membandingkan hasilnya. Kalau keluarannya "TIDAK STABIL", `ORDER BY`-mu kekurangan pemecah seri yang unik — dan konsekuensinya adalah paginasi yang menampilkan item ganda serta melewatkan item lain, bug yang keluhannya biasanya berbunyi "kadang datanya hilang" dan hampir mustahil dilacak tanpa uji seperti ini.',
      ),

      h2('5. Header'),
      code(
        'bash',
        `
        curl -sI localhost:3000/api/catatan -H "Authorization: Bearer $T"
        `,
      ),
      p(
        'Opsi `-I` meminta **header saja** tanpa body, jadi keluarannya cukup pendek untuk diperiksa sekaligus. Header adalah bagian API yang paling jarang diaudit justru karena ia tidak terlihat di alat seperti Postman kecuali kamu sengaja membuka tabnya — sementara empat pertanyaan di bawah semuanya dijawab dari beberapa baris ini. Perhatikan token tetap disertakan: sebagian header hanya muncul pada respons terautentikasi, dan `Cache-Control` khususnya sering berbeda antara rute publik dan rute privat.',
      ),
      ul(
        '`Cache-Control: no-store` pada data privat?',
        'Tidak ada `X-Powered-By` atau header lain yang menyebut teknologi dan versinya?',
        'Ada `X-Request-Id` yang dikembalikan?',
        'Header rate limit (`RateLimit-*`) ada saat mendekati batas?',
      ),

      h2('Menuliskan temuan'),
      code(
        'text',
        `
        TEMUAN AUDIT API — <tanggal>

        BERAT
        [ ] GET /api/catatan/{id} menjawab 200 untuk catatan milik pengguna lain (IDOR)
        [ ] Respons 500 memuat err.message berisi nama constraint database

        SEDANG
        [ ] per_hal tidak dibatasi; ?per_hal=999999 mengembalikan seluruh tabel
        [ ] Bentuk error berbeda antara middleware validasi dan handler

        RINGAN
        [ ] DELETE mengembalikan 200 dengan body, seharusnya 204
        [ ] Tidak ada header Location pada 201
        `,
      ),
      p(
        'Perhatikan setiap butir menyebut **endpoint dan perilaku yang teramati**, bukan penilaian umum. "GET /api/catatan/{id} menjawab 200 untuk catatan milik pengguna lain" bisa langsung diverifikasi ulang oleh siapa pun dengan satu `curl`; "otorisasinya kurang ketat" tidak bisa, dan biasanya berakhir sebagai perdebatan. Tulis temuan dalam bentuk yang bisa dibuktikan salah — itu yang membedakan audit dari opini.',
      ),
      p(
        'Pembagian BERAT/SEDANG/RINGAN bukan soal seberapa mudah diperbaiki, melainkan **seberapa besar akibatnya kalau dibiarkan**. Perhatikan dua butir di bawah BERAT: keduanya membocorkan sesuatu ke pihak luar — data pengguna lain, dan struktur internal databasemu. Yang di RINGAN adalah ketidakrapian kontrak yang membuat klien bekerja lebih keras, tetapi tidak membahayakan siapa pun. Menaruh "204 seharusnya tanpa body" sederet dengan IDOR akan mengubur yang penting di antara yang sepele.',
      ),
      callout(
        'tip',
        'Urutkan berdasarkan dampak, bukan berdasarkan urutan penemuan',
        'Temuan berat adalah yang membocorkan data atau memungkinkan penyalahgunaan. Temuan ringan adalah ketidakrapian kontrak. Keduanya layak diperbaiki, tapi hanya yang pertama yang tidak boleh menunggu.',
      ),

      divider,

      checklist(
        'bi1-praktik',
        'Checklist audit API',
        'Semua URL kata benda jamak, satu bahasa, tanpa kata kerja di path',
        'Tidak ada rute yang bersarang lebih dari dua tingkat',
        'Setiap rute yang seharusnya terlindungi benar-benar punya middleware auth',
        'Kedelapan kasus status code di atas diuji dan hasilnya dicatat',
        'Catatan milik pengguna lain menjawab 404/403 — bukan 200',
        'Satu bentuk error untuk seluruh API, dengan kode error yang stabil',
        'Tidak ada `err.message`, stack trace, atau detail database di respons 5xx',
        'Setiap error menyertakan `requestId` yang bisa dicocokkan ke log',
        'Setiap endpoint daftar berpaginasi, dengan batas atas ditegakkan server',
        '`ORDER BY` punya pemecah seri unik sehingga urutannya stabil',
        'Kolom untuk sort dan field berasal dari allow-list, bukan dari input',
        '`Cache-Control: no-store` pada semua respons berisi data privat',
        'Tidak ada header yang menyebut teknologi atau versinya',
        '201 menyertakan header `Location`; 204 tidak punya body',
        'Endpoint yang mengubah uang atau stok menerima `Idempotency-Key`',
        'Temuan ditulis dan diurutkan berdasarkan dampak',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Mengaudit API yang sudah berjalan berbeda dari merancang yang baru, sebab kamu tidak bisa mengubah apa pun tanpa memikirkan klien yang sudah ada. Karena itu urutan audit yang berguna dimulai dari yang **tidak memutus siapa pun**, lalu bergerak ke yang butuh versi baru.',
      ),
      code(
        'text',
        `
        URUTAN AUDIT, dari yang paling murah:

        1. Keamanan     -> perbaiki SEKARANG, apa pun akibatnya bagi klien
        2. Ketersediaan -> batas yang hilang; sebagian bisa dipasang tanpa memutus
        3. Kebenaran    -> angka salah, data hilang; perbaiki dengan hati-hati
        4. Konsistensi  -> bentuk yang berbeda-beda; butuh versi baru
        5. Kenyamanan   -> penamaan, dokumentasi; tunda ke versi berikutnya
        `,
      ),
      p(
        'Kelompok pertama tidak bisa ditawar, dan ketiganya sudah diukur sungguhan sepanjang dua kategori terakhir.',
      ),
      code(
        'text',
        `
        TEMUAN KEAMANAN — perbaiki sekarang

        a. Nama kolom pengurut dirangkai dari masukan pengguna
             Diuji: masukan "email; DROP TABLE artikel_tag" MENGHAPUS tabelnya,
             dan respons query-nya tetap terlihat normal.
             Perbaikan: daftar yang diizinkan. Diuji, injeksinya jadi 422
             dan jumlah baris tabelnya utuh.

        b. Sumber daya diambil berdasarkan id saja
             Diuji: pengguna lain membaca baris utuh —
             {"id":4211,"pelanggan_id":7,...,"catatan":"Alamat Rina, Jl. Merdeka 12"}
             Perbaikan: syarat pemilik ikut ke dalam query. Diuji, hasilnya null -> 404.

        c. Respons memuat seluruh kolom tabel
             Kolom yang ditambahkan orang lain bulan depan otomatis ikut keluar.
             Perbaikan: daftar field yang dipilih, bukan daftar yang disembunyikan.
        `,
        { caption: 'Ketiganya dijalankan sungguhan di bab database dan bab auth.' },
      ),
      p(
        'Kelompok kedua menyangkut batas yang hilang, dan sebagian besar bisa dipasang tanpa memutus klien mana pun, sebab klien yang wajar tidak pernah melampauinya.',
      ),
      code(
        'text',
        `
        TEMUAN KETERSEDIAAN

        d. Tidak ada batas atas pada limit
             Diuji: ?limit=1000000 -> 422 setelah batas dipasang.
             Sebelum dipasang, satu permintaan memaksa membaca sejuta baris.
             Akibatnya bagi permintaan lain diukur di bab Express:
             lima permintaan ringan naik dari 6 ms menjadi 74 ms.

        e. Paginasi memakai OFFSET
             Diuji: OFFSET 250000 membaca 250.020 baris untuk memberi 20 (24,7 ms).
             Keyset di posisi sama membaca 20 baris (0,064 ms).
             Ini bisa ditambahkan TANPA memutus: sediakan cursor di samping
             page, lalu arahkan klien baru ke cursor.

        f. Tidak ada batas ukuran badan permintaan
             Diuji di bab Express: 413 setelah batas dipasang.
             Tanpa batas, JSON.parse atas badan besar menahan utasnya.
        `,
      ),
      p(
        'Kelompok ketiga adalah yang paling sulit diputuskan, sebab memperbaiki kebenaran kadang berarti mengubah angka yang sudah dipercaya klien.',
      ),
      code(
        'text',
        `
        TEMUAN KEBENARAN

        g. Urutan tidak berakhir pada kolom unik
             Diuji di PostgreSQL: satu baris TIDAK PERNAH muncul di halaman mana pun.
             Perbaikan aman, tidak memutus siapa pun: tambahkan ", id" ke ORDER BY.

        h. count(*) dipakai pada LEFT JOIN
             Diuji: pelanggan tanpa pesanan dilaporkan punya 1.
             Memperbaikinya MENGUBAH angka yang sudah dipakai klien —
             umumkan sebagai perbaikan, jangan diam-diam.

        i. PUT tanpa If-Match
             Diuji: perubahan penyunting pertama HILANG ditimpa yang kedua.
             Perbaikan bertahap: terima tanpa If-Match dulu sambil mencatat
             berapa banyak yang belum memakainya, baru wajibkan (428) belakangan.
        `,
      ),
      p(
        'Cara bertahap pada temuan terakhir itu pola yang berlaku umum untuk audit, yaitu **ukur dulu berapa yang terdampak, baru tegakkan**. Tanpa angka itu, keputusan mewajibkan sesuatu adalah tebakan tentang berapa banyak klien yang akan rusak.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Audit yang berguna menghasilkan daftar yang bisa dijalankan, bukan daftar pendapat. Berikut bentuknya sebagai berkas perintah yang seluruh angka harapannya berasal dari pengukuran di bab ini.',
      ),
      code(
        'text',
        `
        #!/bin/bash
        # audit-api.sh — dijalankan terhadap API yang sedang berjalan.
        A=http://localhost:3000/v1
        J="Accept: application/json"
        T="Authorization: Bearer $TOKEN"

        p() { printf '%-46s %s\\n' "$1" "$(curl -s -o /dev/null -w '%{http_code}' "\${@:2}")"; }

        echo "== KEAMANAN =="
        p "urut berisi injeksi           (422)" -H "$J" -H "$T" "$A/catatan?urut=judul;DROP+TABLE+x"
        p "sumber daya milik orang lain  (404)" -H "$J" -H "$T" "$A/pesanan/4211"
        p "tanpa token                   (401)" -H "$J"        "$A/catatan"

        echo "== KETERSEDIAAN =="
        p "limit berlebihan              (422)" -H "$J" -H "$T" "$A/catatan?limit=1000000"
        p "badan terlalu besar           (413)" -X POST -H "$J" -H "$T" \\
            -H 'Content-Type: application/json' --data-binary @besar.json "$A/catatan"

        echo "== KONTRAK =="
        p "JSON rusak                    (400)" -X POST -H "$J" -H "$T" \\
            -H 'Content-Type: application/json' -d '{judul:"x"}' "$A/catatan"
        p "validasi gagal                (422)" -X POST -H "$J" -H "$T" \\
            -H 'Content-Type: application/json' -d '{"judul":"   "}' "$A/catatan"
        p "daftar kosong                 (200)" -H "$J" -H "$T" "$A/catatan?status=tidakada"
        p "alamat tidak ada              (404)" -H "$J" -H "$T" "$A/tidakada"

        echo "== CACHING =="
        ETAG=$(curl -s -D- -o /dev/null -H "$J" -H "$T" "$A/catatan/1" | grep -i etag | cut -d' ' -f2 | tr -d '\\r')
        p "If-None-Match                 (304)" -H "$J" -H "$T" -H "If-None-Match: $ETAG" "$A/catatan/1"
        p "PUT tanpa If-Match            (428)" -X PUT -H "$J" -H "$T" \\
            -H 'Content-Type: application/json' -d '{"judul":"x"}' "$A/catatan/1"

        echo "== IDEMPOTENSI =="
        K=$(uuidgen)
        p "POST pertama                  (201)" -X POST -H "$J" -H "$T" -H "Idempotency-Key: $K" \\
            -H 'Content-Type: application/json' -d '{"judul":"Uji"}' "$A/catatan"
        p "POST kunci SAMA               (201)" -X POST -H "$J" -H "$T" -H "Idempotency-Key: $K" \\
            -H 'Content-Type: application/json' -d '{"judul":"Uji"}' "$A/catatan"
        echo "   ^ periksa id-nya SAMA, dan hanya SATU baris yang lahir"
        `,
        {
          caption:
            'Setiap angka harapan di daftar ini berasal dari respons yang benar-benar dijalankan di bab ini.',
        },
      ),
      p(
        'Dua baris terakhir memuat pemeriksaan yang tidak bisa dijawab status code. Kedua permintaan idempoten sama-sama menjawab `201`, dan yang membuktikan perlindungannya bekerja adalah **id di dalam badannya sama** dan hanya satu baris yang lahir. Diuji sungguhan, lima permintaan bersamaan dengan satu kunci menghasilkan satu pembayaran.',
      ),
      p(
        'Terakhir, satu temuan yang hanya muncul bila kamu mengukur alih-alih menebak, dan bentuknya ditemui sendiri saat menyusun materi ini.',
      ),
      code(
        'text',
        `
        Build project ini sendiri gagal dengan timeout per halaman 60 detik.

        Dugaan pertama : isinya terlalu berat.
        Diukur         : seluruh highlighting 427 halaman = 5.785 ms,
                         dan halaman yang timeout 60 DETIK hanya butuh 30 MILIDETIK.
        Penyebab nyata : 3 proses build berebut ~1,1 GB memori tersisa, tanpa swap.
                         Dengan 1 proses: 506 halaman dalam 15,9 detik.

        Pelajarannya berlaku untuk audit API juga: sebelum menyimpulkan
        endpoint-nya lambat, ukur dulu apakah endpoint-nya yang lambat.
        `,
        {
          caption:
            'Ditelusuri sungguhan saat menyusun materi ini, memakai disiplin diagnose project.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Audit API paling sering gagal bukan karena temuannya salah melainkan karena urutan perbaikannya tidak dipikirkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memperbaiki penamaan lebih dulu karena paling terlihat',
            'Itu yang paling mengganggu dibaca',
            'Mengganti alamat memutus setiap klien. Dahulukan keamanan dan ketersediaan',
          ],
          [
            'Mewajibkan header baru tanpa mengukur berapa yang terdampak',
            'Sudah diumumkan',
            'Klien yang belum berpindah langsung rusak. Terima dulu sambil mencatat, baru wajibkan',
          ],
          [
            'Memperbaiki angka yang salah tanpa mengumumkan',
            'Memperbaiki kan selalu baik',
            'Klien yang sudah menyesuaikan diri dengan angka lama ikut rusak. Umumkan sebagai perbaikan',
          ],
          [
            'Menyimpulkan endpoint lambat tanpa mengukur',
            'Terasa lambat',
            'Diuji sendiri saat menyusun materi ini, dugaan pertamanya salah. Ukur dulu, perbaiki kedua',
          ],
          [
            'Mengaudit hanya jalur sukses',
            'Itu yang dipakai orang',
            'Jalur kegagalan justru yang paling sering menyimpang dari kontraknya',
          ],
          [
            'Menghasilkan daftar pendapat, bukan daftar yang bisa dijalankan',
            'Sudah jelas apa yang salah',
            'Tidak ada cara membuktikan perbaikannya berhasil. Tulis sebagai perintah yang bisa dijalankan ulang',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas menjadi penutup bab ini. Sebuah audit yang menghasilkan dokumen berisi catatan akan dibaca sekali lalu dilupakan. Audit yang menghasilkan berkas perintah seperti di atas tetap berguna berbulan-bulan kemudian, sebab siapa pun bisa menjalankannya setelah mengubah sesuatu dan langsung tahu apakah ada yang kembali rusak. Perbedaannya bukan ketelitian melainkan apakah hasilnya bisa **dijalankan ulang**.',
      ),
      references(
        {
          label: 'REST Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Daftar periksa keamanan API yang melengkapi audit desain di atas.',
        },
        {
          label: 'HTTP response status codes',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status',
          source: 'MDN Web Docs',
          note: 'Rujukan untuk memeriksa kedelapan kasus status code pada langkah audit.',
        },
        {
          label: 'RFC 9457 — Problem Details for HTTP APIs',
          href: 'https://www.rfc-editor.org/rfc/rfc9457.html',
          source: 'IETF',
          note: 'Acuan bentuk error seragam yang diaudit di langkah keenam.',
        },
        {
          label: 'Express — Production Best Practices: Security',
          href: 'https://expressjs.com/en/advanced/best-practice-security.html',
          source: 'Express',
          note: 'Termasuk mematikan header yang menyebut teknologi dan versinya.',
        },
      ),
    ],
  ),
];
