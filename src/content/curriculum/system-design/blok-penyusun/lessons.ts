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
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * System Design — Chapter 2, eight lessons.
 *
 * The catalogue. Each block is introduced the same way: the problem it solves, the number that
 * says it is needed, its concrete shape in the stack this curriculum already teaches, and the
 * price of installing it.
 *
 * The chapter deliberately does NOT re-teach how to use Redis or BullMQ. Those live in
 * `backend-intermediate`; here they are the answer to a question, not the subject.
 */
export const lessons: LessonDraft[] = [
  written(
    'dari-satu-server',
    'Perjalanan dari Satu Server ke Banyak',
    13,
    'Sembilan langkah penskalaan, masing-masing dengan pemicu yang bisa diukur.',
    [
      p(
        'Bab ini adalah katalog blok penyusun. Sebelum membuka katalognya, ada baiknya melihat urutan pemasangannya, karena urutan itulah yang membedakan sistem yang tumbuh dengan tenang dari sistem yang dirumitkan sebelum waktunya.',
      ),
      p(
        'Sembilan langkah berikut hampir selalu muncul dalam urutan yang sama. Alasannya bukan tradisi, melainkan karena tiap langkah menyelesaikan bottleneck yang memang muncul lebih dulu, dan karena tiap langkah menambah kerumitan yang lebih besar daripada langkah sebelumnya. Kamu berhenti di langkah mana pun begitu sistemnya sudah cukup, dan sebagian besar aplikasi berhenti jauh sebelum langkah terakhir.',
      ),

      terms(
        {
          term: 'single-tier',
          meaning:
            'Susunan ketika seluruh bagian sistem berjalan pada satu mesin, yaitu server web, aplikasi, dan database. Ini titik awal hampir semua proyek dan bukan sesuatu yang memalukan. Kelemahannya, semua bagian saling berebut memori dan prosesor, sehingga satu bagian yang sibuk membuat bagian lain ikut lambat.',
        },
        {
          term: 'tier (lapisan)',
          meaning:
            'Kelompok mesin yang menjalankan peran yang sama, misalnya lapisan aplikasi, lapisan cache, dan lapisan data. Memisahkan lapisan berarti tiap peran bisa diperbesar sendiri tanpa ikut memperbesar yang lain, dan itulah manfaat utamanya.',
        },
        {
          term: 'object storage',
          meaning:
            'Layanan penyimpanan berkas yang diakses lewat HTTP, bukan lewat sistem berkas. Contohnya S3 dan padanannya. Dibaca "objek storij". Bedanya dengan disk lokal, object storage tidak terikat pada satu mesin, sehingga berkas tetap ada ketika servernya diganti dan bisa dilayani banyak mesin sekaligus.',
        },
        {
          term: 'scaling trigger',
          meaning:
            'Angka terukur yang menandakan sebuah langkah penskalaan sudah waktunya diambil, misalnya "prosesor server aplikasi bertahan di atas 70 persen selama jam sibuk". Tanpa pemicu, keputusan menambah komponen diambil berdasarkan firasat, dan firasat cenderung terlalu cepat.',
        },
        {
          term: 'critical path',
          meaning:
            'Rangkaian komponen yang harus hidup agar sebuah permintaan bisa dilayani. Semakin pendek critical path sebuah fungsi, semakin tinggi ketersediaan yang bisa dicapainya, sesuai perkalian di sub-bab [ketersediaan dan angka sembilan](/kelas/system-design/fondasi-sistem/ketersediaan-dan-sla).',
        },
      ),

      h2('Langkah nol, satu mesin untuk semuanya'),
      p(
        'Nginx, Express atau PHP-FPM, dan PostgreSQL berada di satu server. Gambar disimpan di disk lokal. Susunan ini punya kelebihan yang sering diremehkan, yaitu tidak ada satu pun panggilan jaringan antar-komponen, sehingga latensinya sangat rendah dan tidak ada kelas kegagalan jaringan sama sekali.',
      ),
      p(
        'Kekurangannya juga jelas. Semua komponen berebut memori yang sama, dan satu proses yang bocor memorinya bisa membunuh database. Selain itu tidak ada satu pun cadangan, jadi setiap pemeliharaan berarti waktu mati.',
      ),
      table(
        ['Pemicu untuk melangkah', 'Apa yang dilihat'],
        [
          [
            'Memori sering hampir penuh',
            'Database mulai membaca dari disk karena cache internalnya terdesak',
          ],
          [
            'Deploy selalu berarti mati sejenak',
            'Tidak ada mesin lain yang bisa melayani sementara',
          ],
          ['Query melambat saat aplikasi sibuk', 'Keduanya berebut prosesor yang sama'],
        ],
      ),

      h2('Langkah satu, pisahkan database'),
      p(
        'Langkah pertama yang hampir selalu benar adalah memindahkan database ke mesinnya sendiri. Ini langkah termurah dengan hasil terbesar, karena database dan aplikasi punya kebutuhan sumber daya yang sangat berbeda. Database menginginkan memori sebanyak mungkin agar datanya tetap berada di memori, sedangkan aplikasi menginginkan prosesor.',
      ),
      p(
        'Harga yang dibayar adalah satu perjalanan jaringan pada setiap query, yaitu sekitar setengah milidetik seperti pada tabel di sub-bab [angka latensi](/kelas/system-design/fondasi-sistem/angka-latensi). Untuk hampir semua aplikasi, harga itu jauh lebih murah daripada manfaatnya.',
      ),
      callout(
        'warning',
        'Perhatikan jumlah query per permintaan setelah langkah ini',
        'Selama database berada di mesin yang sama, masalah N+1 query terasa ringan. Begitu ia dipisah, seratus query kecil berubah menjadi seratus perjalanan jaringan. Kalau kamu belum memeriksanya, sub-bab [masalah N+1](/kelas/backend-intermediate/laravel-intermediate/n-plus-one) adalah tempat yang tepat sebelum melangkah lebih jauh.',
      ),

      h2('Langkah dua, naikkan kelas mesinnya'),
      p(
        'Sebelum menambah mesin, perbesar dulu mesin yang ada. Langkah ini sering dilewati karena terdengar tidak keren, padahal ia adalah satu-satunya langkah penskalaan yang **tidak menyentuh kode sama sekali** dan tidak menambah satu pun bagian baru yang bisa rusak.',
      ),
      p(
        'Satu instance PostgreSQL pada mesin dengan tiga puluh dua inti dan seratus dua puluh delapan gigabita memori melayani beban yang lebih besar daripada kebutuhan sebagian besar aplikasi yang pernah kamu pakai. Langkah ini punya batas, dan batas itu jauh lebih tinggi daripada yang biasanya diduga.',
      ),
      table(
        ['Kelebihan', 'Kekurangan'],
        [
          ['Nol perubahan kode', 'Ada langit-langitnya'],
          ['Nol kerumitan tambahan', 'Harga naik lebih cepat daripada kapasitas'],
          ['Konsistensi kuat tetap gratis', 'Tetap satu titik kegagalan'],
          ['Bisa dilakukan hari ini juga', 'Biasanya perlu restart'],
        ],
      ),

      h2('Langkah tiga, pindahkan berkas ke object storage dan CDN'),
      p(
        'Berkas media adalah beban yang paling salah tempat bila disimpan di disk server aplikasi. Ia besar, ia jarang berubah, dan ia tidak butuh logika apa pun untuk disajikan. Ketiga sifat itu membuatnya sempurna untuk dipindahkan.',
      ),
      p(
        'Memindahkannya menyelesaikan tiga masalah sekaligus. Bandwidth server aplikasi menjadi lega, disk tidak lagi menjadi alasan servernya tidak bisa diganti, dan pengguna di daerah jauh mendapat berkas dari tempat yang lebih dekat.',
      ),
      p(
        'Perhitungan bandwidth di sub-bab [estimasi kasar](/kelas/system-design/fondasi-sistem/estimasi-kasar) adalah cara tercepat mengetahui apakah langkah ini mendesak. Begitu bandwidth keluar melewati beberapa ratus megabit per detik, langkah ini bukan lagi pilihan.',
      ),

      h2('Langkah empat, pasang cache'),
      p(
        'Cache adalah langkah dengan perbandingan hasil terhadap usaha yang paling tinggi pada sistem yang lebih banyak dibaca daripada ditulis. Ia mengubah pembacaan yang memakan beberapa milidetik di database menjadi pembacaan yang memakan kurang dari satu milidetik di memori, dan sekaligus mengurangi beban database secara drastis.',
      ),
      p(
        'Pemicunya adalah menemukan bahwa sebagian besar permintaan menuju data yang sama. Cara mengukurnya sederhana, yaitu catat query yang paling sering dijalankan selama satu jam sibuk lalu lihat berapa persen dari total. Bila sepuluh query teratas menguasai lebih dari separuh beban, cache akan sangat efektif. Rinciannya ada di sub-bab 2.5 dan 2.6.',
      ),

      h2('Langkah lima, banyak mesin aplikasi di belakang load balancer'),
      p(
        'Ini langkah pertama yang benar-benar mengubah bentuk sistem, karena mulai dari sini ada lebih dari satu salinan aplikasi yang berjalan bersamaan. Manfaatnya dua, yaitu kapasitas prosesor bertambah dan satu mesin boleh mati tanpa menjatuhkan layanan.',
      ),
      p(
        'Syaratnya satu, yaitu aplikasinya harus **stateless**, dan syarat itu cukup penting sehingga mendapat sub-babnya sendiri di 2.4. Aplikasi yang menyimpan sesi di memori proses akan berperilaku aneh begitu ada dua salinan, karena pengguna yang login di mesin pertama akan dianggap belum login ketika permintaannya mendarat di mesin kedua.',
      ),

      h2('Langkah enam, pindahkan pekerjaan berat ke antrean'),
      p(
        'Sampai langkah lima, setiap permintaan dikerjakan sampai tuntas sebelum dijawab. Langkah enam memisahkan keduanya, yaitu permintaan dijawab segera dan pekerjaannya dilanjutkan di latar.',
      ),
      p(
        'Yang layak dipindahkan punya ciri yang jelas, yaitu memakan waktu lama, tidak dibutuhkan hasilnya seketika oleh pengguna, dan boleh gagal lalu dicoba ulang. Contohnya mengirim email, membuat ukuran kecil gambar, menyusun laporan, dan menyinkronkan data ke layanan lain.',
      ),
      p(
        'Manfaat yang kurang terlihat namun sama pentingnya adalah **peredam lonjakan**. Ketika sepuluh ribu unggahan datang bersamaan, antrean menampungnya dan worker mengerjakannya sesuai kecepatannya sendiri. Tanpa antrean, sepuluh ribu unggahan itu akan mencoba dikerjakan serentak dan menjatuhkan seluruh sistem.',
      ),

      h2('Langkah tujuh, tambahkan replika baca'),
      p(
        'Ketika cache sudah dipasang dan bacanya masih terlalu banyak, replika baca adalah langkah berikutnya. Semua penulisan tetap menuju satu mesin utama, sedangkan pembacaan bisa dibagi ke beberapa salinan.',
      ),
      p(
        'Harga yang dibayar adalah replication lag, yaitu replika bisa tertinggal beberapa milidetik sampai beberapa detik dari mesin utama. Akibatnya nyata dan sering mengejutkan, yaitu pengguna yang baru saja menulis komentar bisa tidak melihat komentarnya sendiri ketika halaman dimuat ulang. Cara menanganinya dibahas di sub-bab [replikasi dan replika baca](/kelas/system-design/skala-data/replikasi).',
      ),

      h2('Langkah delapan, sharding'),
      p(
        'Langkah terakhir dan paling mahal. Sharding memecah data ke beberapa database yang saling bebas, dan ia satu-satunya cara menambah kapasitas **tulis** setelah satu mesin tidak cukup.',
      ),
      p(
        'Ia diletakkan terakhir karena harganya paling besar. Join lintas shard menjadi mahal atau mustahil, transaksi yang menyentuh dua shard menjadi rumit, dan batasan unik tidak bisa lagi ditegakkan database. Sub-bab [sharding](/kelas/system-design/skala-data/sharding) membahasnya lengkap, termasuk cara memilih shard key yang tidak menyesal di kemudian hari.',
      ),
      callout(
        'danger',
        'Sharding yang terlalu dini sulit dibatalkan',
        'Menambah cache bisa dicabut dalam satu rilis. Menambah replika bisa dimatikan. Sharding mengubah bentuk seluruh data dan seluruh query yang menyentuhnya, dan mengembalikannya berarti memindahkan seluruh data lagi. Pastikan langkah nol sampai tujuh benar-benar sudah habis sebelum menyentuh langkah ini.',
      ),

      h2('Ringkasan sembilan langkah'),
      table(
        ['Langkah', 'Yang ditambahkan', 'Pemicunya', 'Harga'],
        [
          ['0', 'Satu mesin', 'Titik awal', 'Tidak ada'],
          [
            '1',
            'Database di mesin sendiri',
            'Memori berebut, deploy berarti mati',
            'Satu perjalanan jaringan per query',
          ],
          [
            '2',
            'Mesin lebih besar',
            'Prosesor atau memori bertahan tinggi',
            'Biaya, dan tetap satu titik kegagalan',
          ],
          [
            '3',
            'Object storage dan CDN',
            'Bandwidth atau disk membesar',
            'Satu layanan lagi untuk dikelola',
          ],
          [
            '4',
            'Cache',
            'Sedikit query menguasai banyak beban',
            'Data bisa basi, invalidasi harus dipikirkan',
          ],
          [
            '5',
            'Load balancer dan banyak aplikasi',
            'Prosesor aplikasi mentok',
            'Aplikasi harus stateless',
          ],
          [
            '6',
            'Antrean dan worker',
            'Ada pekerjaan lama di jalur permintaan',
            'Hasil tidak seketika, harus idempoten',
          ],
          ['7', 'Replika baca', 'Baca masih berat meski sudah di-cache', 'Replication lag'],
          ['8', 'Sharding', 'Tulis tidak muat di satu mesin', 'Join dan transaksi lintas shard'],
        ],
      ),
      p(
        'Perhatikan kolom terakhir. Harganya naik terus dari atas ke bawah, sedangkan manfaatnya tidak selalu naik. Itulah kenapa urutannya penting, dan itulah kenapa jawaban paling sering benar untuk pertanyaan "apa langkah berikutnya" adalah langkah yang nomornya paling kecil dan belum dikerjakan.',
      ),

      h2('Susunan akhir yang lazim'),
      code(
        'text',
        `
        Pengguna
          |
          v
        DNS  ------------------> memilih alamat IP terdekat
          |
          v
        CDN  ------------------> aset statis, gambar, halaman yang bisa di-cache
          | (yang tidak bisa di-cache diteruskan)
          v
        Load Balancer (L7) ----> health check, TLS berakhir di sini
          |
          +--> Aplikasi 1 --+
          +--> Aplikasi 2 --+---> Cache (Redis)
          +--> Aplikasi 3 --+---> Antrean --> Worker --> layanan luar
                            |
                            +---> Database leader ---replikasi---> Replika baca
        `,
        {
          caption:
            'Bab 2 membahas semua kotak di atas garis database, dan Bab 3 membahas yang di bawahnya.',
        },
      ),
      p(
        'Sisa sub-bab di bab ini membahas tiap kotak satu per satu, dengan pola yang sama, yaitu masalah apa yang diselesaikannya, angka apa yang menandakan ia dibutuhkan, wujud konkretnya di stack yang sudah kamu pakai, dan apa yang menjadi lebih sulit setelah ia terpasang.',
      ),

      references(
        {
          label: 'Nginx: Serving Static Content',
          href: 'https://nginx.org/en/docs/http/ngx_http_core_module.html',
          source: 'Nginx',
          note: 'Konfigurasi lapisan pertama pada susunan di atas.',
        },
        {
          label: 'The Twelve-Factor App: Processes',
          href: 'https://12factor.net/processes',
          source: '12factor',
          note: 'Syarat stateless yang membuat langkah lima mungkin dilakukan.',
        },
        {
          label: 'PostgreSQL: High Availability, Load Balancing, and Replication',
          href: 'https://www.postgresql.org/docs/current/high-availability.html',
          source: 'PostgreSQL',
          note: 'Pilihan resmi untuk langkah tujuh, termasuk perbandingan bentuk replikasinya.',
        },
      ),
    ],
  ),

  written(
    'dns-dan-cdn',
    'DNS dan CDN',
    12,
    'Dua lapisan pertama yang menyentuh permintaan, jauh sebelum servermu.',
    [
      p(
        'Dua komponen pertama yang dilewati sebuah permintaan bekerja sebelum servermu tahu ada permintaan sama sekali. Keduanya sering dianggap urusan infrastruktur yang tidak perlu dipikirkan pengembang, padahal keduanya adalah dua tuas paling murah untuk memperbaiki latensi dan mengurangi beban.',
      ),
      p(
        'DNS menentukan **ke mana** permintaan pergi, dan CDN menentukan **apakah permintaan itu perlu sampai ke servermu**. Sub-bab ini membahas keduanya dari sudut pandang keputusan desain, bukan dari sudut pandang konfigurasi.',
      ),

      terms(
        {
          term: 'DNS (domain name system)',
          meaning:
            'Sistem yang menerjemahkan nama domain seperti `toko.com` menjadi alamat IP seperti `93.184.216.34`. Dibaca "di-en-es". Setiap permintaan web dimulai dengan penerjemahan ini, dan hasilnya disimpan sementara di banyak tempat, mulai dari browser sampai penyedia internet.',
        },
        {
          term: 'record A dan AAAA',
          meaning:
            'Jenis catatan DNS yang memetakan nama domain langsung ke alamat IP. Record A untuk IPv4, record AAAA untuk IPv6. Dibaca "rekord ei" dan "rekord kuad-ei". Ini bentuk pemetaan paling langsung.',
        },
        {
          term: 'record CNAME',
          meaning:
            'Catatan yang memetakan satu nama domain ke nama domain lain, bukan ke alamat IP. Dibaca "si-neim". Dipakai luas oleh penyedia hosting dan CDN, karena mereka bisa mengubah alamat IP di belakangnya kapan saja tanpa kamu perlu mengubah apa pun.',
        },
        {
          term: 'TTL DNS',
          meaning:
            'Berapa lama sebuah jawaban DNS boleh disimpan sementara sebelum ditanyakan ulang. Dinyatakan dalam detik. TTL pendek membuat perpindahan alamat cepat berlaku, tetapi menambah jumlah pertanyaan DNS. TTL panjang sebaliknya. Nilai ini menjadi penting justru saat keadaan darurat, karena ia menentukan berapa lama pengguna masih diarahkan ke server yang sudah mati.',
        },
        {
          term: 'GeoDNS',
          meaning:
            'Menjawab pertanyaan DNS yang sama dengan alamat IP berbeda tergantung lokasi penanya. Pengguna di Asia mendapat alamat server Asia, pengguna di Eropa mendapat alamat server Eropa. Ini bentuk paling kasar dari pengarahan berbasis lokasi, dan ia bekerja tanpa perlu perubahan apa pun di aplikasi.',
        },
        {
          term: 'CDN (content delivery network)',
          meaning:
            'Jaringan server yang tersebar di banyak kota dan menyimpan salinan konten agar dekat dengan pengguna. Dibaca "si-di-en". Server yang tersebar itu disebut edge, sedangkan servermu sendiri disebut origin.',
        },
        {
          term: 'origin dan edge',
          meaning:
            'Origin adalah sumber aslinya, yaitu servermu. Edge adalah server CDN terdekat dengan pengguna. Tujuan seluruh pengaturan CDN adalah membuat sebanyak mungkin permintaan berhenti di edge dan tidak pernah mencapai origin.',
        },
        {
          term: 'cache hit dan cache miss',
          meaning:
            'Hit terjadi ketika edge sudah punya salinan yang diminta sehingga bisa langsung menjawab. Miss terjadi ketika ia harus mengambilnya dulu ke origin. Perbandingan hit terhadap total permintaan disebut hit ratio, dan angka itu adalah ukuran keberhasilan utama sebuah CDN.',
        },
        {
          term: 'purge',
          meaning:
            'Menghapus paksa salinan yang tersimpan di edge sebelum masa berlakunya habis, biasanya lewat API penyedia CDN. Dibaca "perj". Dibutuhkan ketika konten berubah dan kamu tidak mau menunggu masa berlakunya habis sendiri.',
        },
      ),

      h2('DNS, keputusan yang benar-benar ada'),
      p(
        'Sebagian besar pengaturan DNS hanya dikerjakan sekali dan tidak pernah disentuh lagi, dan itu wajar. Tetapi ada tiga keputusan yang punya akibat nyata pada desain sistem.',
      ),
      h2('Keputusan pertama, nilai TTL'),
      p(
        'TTL menentukan berapa lama dunia masih memakai jawaban lama setelah kamu mengubahnya. Konsekuensinya paling terasa saat keadaan darurat.',
      ),
      table(
        ['TTL', 'Kelebihan', 'Kekurangan', 'Kapan dipakai'],
        [
          [
            '30 sampai 60 detik',
            'Perpindahan darurat berlaku hampir seketika',
            'Pertanyaan DNS jauh lebih banyak',
            'Menjelang migrasi, atau untuk failover berbasis DNS',
          ],
          ['5 menit', 'Kompromi yang wajar', '', 'Nilai harian yang aman'],
          [
            '1 sampai 24 jam',
            'Pertanyaan DNS sangat sedikit',
            'Perpindahan butuh berjam-jam sampai merata',
            'Domain yang alamatnya praktis tidak pernah berubah',
          ],
        ],
      ),
      callout(
        'tip',
        'Turunkan TTL sebelum migrasi, bukan saat migrasi',
        'TTL baru sendiri baru berlaku setelah TTL lama kedaluwarsa. Kalau TTL-mu 24 jam dan kamu menurunkannya menjadi 60 detik sesaat sebelum pindah, sebagian dunia baru mengetahui nilai barunya sehari kemudian. Turunkan sehari penuh sebelum jadwal migrasi, lalu naikkan lagi setelah semuanya tenang.',
      ),
      h2('Keputusan kedua, memakai CNAME atau alamat IP langsung'),
      p(
        'Menunjuk ke nama domain penyedia lewat CNAME berarti mereka bisa mengganti alamat IP di belakangnya kapan saja tanpa melibatkanmu. Menunjuk langsung ke alamat IP memberi kendali penuh dan sekaligus memberi tanggung jawab penuh, termasuk tanggung jawab memperbaruinya ketika alamatnya berubah.',
      ),
      p(
        'Untuk domain utama tanpa subdomain ada batasan teknis, yaitu record CNAME tidak boleh berdampingan dengan record lain pada nama yang sama. Penyedia DNS modern menyelesaikannya dengan mekanisme khusus yang namanya berbeda-beda, dan itulah alasan hosting modern biasanya meminta kamu memakai nameserver mereka.',
      ),
      h2('Keputusan ketiga, DNS sebagai alat failover'),
      p(
        'DNS bisa dipakai memindahkan lalu lintas dari wilayah yang mati ke wilayah yang hidup. Cara ini paling murah dan paling lambat sekaligus, karena perpindahannya baru merata setelah TTL berakhir di semua tempat, dan sebagian klien menyimpan jawaban lebih lama daripada yang diminta TTL.',
      ),
      p(
        'Karena itu DNS cocok untuk perpindahan antar wilayah yang jarang terjadi, dan tidak cocok untuk memindahkan lalu lintas antar mesin di dalam satu wilayah. Untuk yang terakhir, load balancer jauh lebih tepat, dan itu isi sub-bab berikutnya.',
      ),

      h2('CDN, memindahkan konten mendekati pengguna'),
      p(
        'Dua angka menjelaskan seluruh nilai CDN. Round trip antar benua sekitar 150 milidetik, sedangkan perjalanan ke kota terdekat sekitar 10 milidetik. Untuk halaman yang memuat tiga puluh berkas, selisih itu berarti perbedaan beberapa detik.',
      ),
      p('Ada dua bentuk CDN, dan yang kedua jauh lebih umum.'),
      table(
        ['Bentuk', 'Cara kerja', 'Cocok untuk'],
        [
          [
            'Push',
            'Kamu mengunggah konten ke CDN lebih dulu',
            'Berkas yang jumlahnya sedikit dan hampir tidak pernah berubah',
          ],
          [
            'Pull',
            'Edge mengambil dari origin saat pertama kali diminta, lalu menyimpannya',
            'Hampir semua kasus, termasuk gambar, CSS, dan JavaScript',
          ],
        ],
      ),
      p(
        'Bentuk pull menang karena tidak butuh pengaturan apa pun selain menunjuk originnya. Permintaan pertama untuk sebuah berkas akan lambat karena edge harus mengambilnya dulu, dan seluruh permintaan sesudahnya menjadi cepat.',
      ),

      h2('Apa yang boleh dan tidak boleh masuk CDN'),
      table(
        ['Jenis konten', 'Boleh di-cache?', 'Catatan'],
        [
          [
            'CSS, JavaScript, font',
            'Ya, sangat lama',
            'Pakai nama berkas yang mengandung sidik jari isi',
          ],
          ['Gambar produk dan avatar', 'Ya, lama', 'Ubah nama berkasnya ketika gambarnya diganti'],
          ['Halaman pemasaran', 'Ya, menengah', 'Isinya sama untuk semua pengunjung'],
          ['Respons API yang publik', 'Ya, pendek', 'Kendalikan lewat `Cache-Control`'],
          [
            'Halaman yang menyebut nama pengguna',
            '**Tidak**',
            'Salah satu pengguna bisa menerima halaman milik orang lain',
          ],
          [
            'Respons yang bergantung cookie sesi',
            '**Tidak**',
            'Sama bahayanya dengan baris di atas',
          ],
          [
            'Data yang berubah tiap detik',
            'Tidak berguna',
            'Selalu miss, jadi hanya menambah satu lompatan',
          ],
        ],
      ),
      callout(
        'danger',
        'Halaman personal yang tersimpan di CDN adalah kebocoran data',
        'Kalau sebuah respons mengandung nama, saldo, atau daftar pesanan seseorang lalu ikut tersimpan di edge, pengunjung berikutnya bisa menerima salinan itu. Ini bukan kemungkinan teoretis melainkan insiden yang benar-benar pernah terjadi di banyak layanan. Untuk respons yang bergantung pada identitas, pakai `Cache-Control: private, no-store` dan pastikan `Vary` diatur dengan benar. Aturan lengkap soal header ini ada di sub-bab [caching HTTP](/kelas/backend-intermediate/desain-api/caching-http).',
      ),

      h2('Mengendalikan CDN lewat header'),
      p(
        'CDN tidak menebak apa yang boleh disimpan. Ia membaca header respons dari originmu, sehingga seluruh perilaku CDN sesungguhnya dikendalikan dari kode aplikasimu sendiri.',
      ),
      compare(
        {
          title: 'Aset dengan sidik jari isi',
          lang: 'text',
          code: `
            GET /_next/static/chunks/main-4f8a2c9b.js

            Cache-Control: public, max-age=31536000, immutable
          `,
          notes: [
            'Simpan satu tahun karena nama berkasnya berubah bila isinya berubah',
            '`immutable` memberi tahu browser agar tidak perlu memeriksa ulang sama sekali',
            'Tidak pernah perlu invalidasi manual',
          ],
        },
        {
          title: 'Halaman yang bisa berubah',
          lang: 'text',
          code: `
            GET /artikel/desain-sistem

            Cache-Control: public, max-age=60, stale-while-revalidate=600
          `,
          notes: [
            'Segar selama 60 detik',
            'Selama 10 menit sesudahnya, versi lama tetap disajikan sementara versi baru diambil di latar',
            'Pengguna tidak pernah menunggu pengambilan ulang',
          ],
        },
      ),
      p(
        'Nilai `stale-while-revalidate` pada panel kanan layak diperhatikan. Ia mengubah masa kedaluwarsa dari tembok menjadi jembatan. Tanpanya, permintaan pertama sesudah kedaluwarsa harus menunggu pengambilan ke origin. Dengannya, permintaan itu langsung dilayani dengan versi lama dan pengambilan ulang berjalan di belakang layar.',
      ),

      h2('Dua cara menyegarkan konten'),
      p(
        'Ketika konten berubah, ada dua cara membuat pengguna melihat versi barunya, dan salah satunya jauh lebih andal.',
      ),
      table(
        ['Cara', 'Bagaimana', 'Kelebihan', 'Kekurangan'],
        [
          [
            'Nama berkas bersidik jari',
            'Ubah nama berkasnya, misalnya `main-4f8a2c9b.js`',
            'Berlaku seketika di semua tempat, dan versi lama tetap bisa diakses',
            'Hanya bisa untuk berkas yang dirujuk dari HTML',
          ],
          [
            'Invalidasi lewat API',
            'Panggil API purge milik penyedia CDN',
            'Bisa untuk apa pun, termasuk HTML',
            'Butuh perkakas, dan penyebarannya butuh waktu beberapa detik sampai menit',
          ],
        ],
      ),
      p(
        'Cara pertama lebih disukai karena ia menghilangkan seluruh kelas masalahnya, bukan menanganinya. Alat build modern melakukannya secara otomatis, dan itulah yang terjadi ketika Next.js menghasilkan berkas di folder `_next/static` seperti yang dibahas di sub-bab [optimasi Next.js](/kelas/frontend-intermediate/nextjs/optimasi-next).',
      ),

      h2('Menakar apakah CDN sudah bekerja'),
      p(
        'Satu angka yang perlu dipantau adalah hit ratio, yaitu persentase permintaan yang dijawab edge tanpa menyentuh origin.',
      ),
      code(
        'bash',
        `
        # Sebagian besar CDN mengirim header yang menyebut hasilnya.
        curl -sI https://situsmu.com/_next/static/chunks/main-4f8a2c9b.js | grep -i -E 'cache|age|x-vercel|cf-'

        # Yang dicari kira-kira seperti ini:
        # x-vercel-cache: HIT
        # age: 8421
        # cache-control: public, max-age=31536000, immutable
        `,
      ),
      table(
        ['Hit ratio', 'Artinya', 'Yang perlu diperiksa'],
        [
          ['Di atas 95%', 'Sehat untuk aset statis', 'Tidak ada'],
          [
            '70% sampai 90%',
            'Wajar bila ada campuran HTML dan aset',
            'Apakah HTML bisa ikut di-cache',
          ],
          [
            'Di bawah 50%',
            'Ada yang salah',
            '`Cache-Control` yang terlalu ketat, `Vary` yang terlalu longgar, atau alamat mengandung parameter acak',
          ],
        ],
      ),
      p(
        'Penyebab paling sering hit ratio rendah adalah alamat yang mengandung parameter unik per pengunjung, misalnya penanda kampanye. Bagi CDN, dua alamat yang hanya berbeda parameternya adalah dua konten berbeda, sehingga tidak ada satu pun yang tersimpan berguna. Sebagian besar penyedia CDN menyediakan pengaturan untuk mengabaikan parameter tertentu, dan mengaktifkannya sering kali menaikkan hit ratio secara drastis dalam sekali ubah.',
      ),

      references(
        {
          label: 'Cache-Control',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control',
          source: 'MDN',
          note: 'Seluruh nilai yang mengendalikan perilaku CDN dan browser, termasuk `immutable`.',
        },
        {
          label: 'Vary',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Vary',
          source: 'MDN',
          note: 'Header yang menentukan kapan sebuah salinan boleh dipakai ulang untuk permintaan lain.',
        },
        {
          label: 'stale-while-revalidate',
          href: 'https://web.dev/articles/stale-while-revalidate',
          source: 'web.dev',
          note: 'Penjelasan pola yang membuat kedaluwarsa tidak lagi terasa oleh pengguna.',
        },
        {
          label: 'DNS',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/DNS',
          source: 'MDN',
          note: 'Ringkasan resmi cara kerja penerjemahan nama domain.',
        },
        {
          label: 'Vercel: Edge Network Caching',
          href: 'https://vercel.com/docs/edge-network/caching',
          source: 'Vercel',
          note: 'Contoh konkret perilaku CDN pada platform yang dipakai di bab Deployment.',
        },
      ),
    ],
  ),
  written(
    'load-balancer',
    'Load Balancer dan Reverse Proxy',
    13,
    'Satu pintu masuk yang membagi beban, menutup mesin yang sakit, dan mengakhiri TLS.',
    [
      p(
        'Begitu ada lebih dari satu mesin aplikasi, muncul pertanyaan yang tidak pernah ada sebelumnya, yaitu siapa yang memutuskan permintaan ini dilayani mesin yang mana. Jawabannya adalah load balancer, dan ia sekaligus menyelesaikan beberapa masalah lain yang awalnya terlihat tidak berhubungan.',
      ),
      p(
        'Kamu sudah memasang Nginx sebagai reverse proxy di sub-bab [reverse proxy](/kelas/deployment/fondasi-deployment/reverse-proxy). Sub-bab ini melanjutkannya satu tingkat, yaitu dari satu tujuan menjadi banyak tujuan, dan membahas keputusan yang muncul begitu tujuannya lebih dari satu.',
      ),

      terms(
        {
          term: 'load balancer',
          meaning:
            'Komponen yang menerima permintaan lalu meneruskannya ke salah satu dari beberapa server di belakangnya. Dibaca "lod belenser". Tujuannya dua, yaitu membagi beban agar tidak ada mesin yang kewalahan, dan menyembunyikan kenyataan bahwa ada mesin yang sedang mati.',
        },
        {
          term: 'reverse proxy',
          meaning:
            'Perantara yang berdiri di depan server dan meneruskan permintaan atas nama klien. Dibaca "rivers proksi". Bedanya dengan proxy biasa, proxy biasa mewakili klien sedangkan reverse proxy mewakili server. Load balancer adalah reverse proxy yang punya lebih dari satu tujuan, jadi keduanya sering merupakan program yang sama.',
        },
        {
          term: 'upstream',
          meaning:
            'Sebutan untuk server tujuan di belakang proxy. Dibaca "apstrim". Dalam berkas konfigurasi Nginx, daftar server tujuan ditulis dalam blok bernama `upstream`, dan istilah ini dipakai luas di luar Nginx juga.',
        },
        {
          term: 'L4 dan L7',
          meaning:
            'Dua tingkat tempat pembagian beban bisa dilakukan. L4 bekerja pada tingkat TCP, yaitu ia hanya melihat alamat dan port tanpa membuka isinya. L7 bekerja pada tingkat HTTP, yaitu ia membaca alamat, header, dan cookie. Dibaca "el empat" dan "el tujuh". Semakin tinggi lapisannya, semakin banyak yang bisa diputuskan dan semakin banyak pekerjaan per permintaan.',
        },
        {
          term: 'TLS termination',
          meaning:
            'Membuka enkripsi HTTPS di load balancer, lalu meneruskan permintaan ke server di belakangnya. Manfaatnya, sertifikat cukup dipasang di satu tempat dan server aplikasi tidak perlu memikirkan enkripsi. Perhatikan aturan di sub-bab [TLS di setiap hop](/kelas/keamanan-fullstack/batas-aplikasi-web/tls-setiap-hop) tetap berlaku, yaitu lalu lintas di belakang load balancer sebaiknya tetap terenkripsi.',
        },
        {
          term: 'health check',
          meaning:
            'Permintaan berkala dari load balancer ke tiap server untuk memastikan server itu masih layak menerima lalu lintas. Server yang gagal beberapa kali berturut-turut dikeluarkan dari daftar, dan dimasukkan kembali setelah berhasil beberapa kali.',
        },
        {
          term: 'liveness dan readiness',
          meaning:
            'Dua pertanyaan berbeda yang sering tertukar. Liveness bertanya "apakah proses ini masih hidup", dan jawaban gagal berarti proses harus dimulai ulang. Readiness bertanya "apakah proses ini siap melayani sekarang", dan jawaban gagal berarti proses dikeluarkan dari daftar tanpa dimulai ulang. Dibahas rinci di sub-bab [single point of failure](/kelas/system-design/keandalan-studi-kasus/titik-kegagalan-tunggal).',
        },
        {
          term: 'sticky session',
          meaning:
            'Pengaturan yang membuat satu pengguna selalu diarahkan ke server yang sama. Dibaca "stiki sesyen". Terdengar praktis dan sebenarnya adalah tambalan atas aplikasi yang belum stateless, dengan akibat pembagian beban menjadi tidak merata dan server yang mati membawa serta sesi penggunanya.',
        },
        {
          term: 'draining',
          meaning:
            'Proses mengeluarkan sebuah server dari daftar secara bertahap, yaitu berhenti mengirim permintaan baru sambil membiarkan permintaan yang sedang berjalan selesai. Dibaca "dreining". Tanpa draining, mematikan sebuah server berarti memutus permintaan yang sedang dilayani di tengah jalan.',
        },
      ),

      h2('L4 atau L7, apa bedanya bagi desain'),
      table(
        ['', 'L4 (TCP)', 'L7 (HTTP)'],
        [
          ['Yang dilihat', 'Alamat IP dan port', 'Alamat, header, cookie, metode'],
          [
            'Kecepatan',
            'Lebih cepat, pekerjaan per permintaan sedikit',
            'Lebih lambat, tetapi selisihnya biasanya tidak terasa',
          ],
          [
            'Bisa mengarahkan berdasarkan alamat?',
            'Tidak',
            'Ya, misalnya `/api` ke satu kelompok dan sisanya ke kelompok lain',
          ],
          ['Bisa mengakhiri TLS?', 'Tidak, ia meneruskan saja', 'Ya'],
          ['Bisa mencoba ulang permintaan gagal?', 'Tidak', 'Ya, untuk metode yang aman diulang'],
          ['Bisa memampatkan respons?', 'Tidak', 'Ya'],
          [
            'Cocok untuk',
            'Protokol selain HTTP, throughput sangat tinggi',
            'Hampir semua aplikasi web',
          ],
        ],
      ),
      p(
        'Untuk aplikasi web, jawabannya hampir selalu L7. Kemampuan mengarahkan berdasarkan alamat saja sudah cukup untuk membenarkannya, karena ia memungkinkan `/api` dilayani kelompok mesin yang berbeda dari halaman biasa, dan kedua kelompok itu bisa diperbesar sendiri-sendiri sesuai bebannya.',
      ),

      h2('Algoritma pembagian'),
      p(
        'Setelah tahu ada beberapa mesin, load balancer harus memilih salah satunya. Cara memilih itu punya beberapa bentuk, dan bentuknya berpengaruh nyata ketika permintaan tidak semuanya sama berat.',
      ),
      table(
        ['Algoritma', 'Cara kerja', 'Cocok ketika'],
        [
          [
            'Round robin',
            'Bergiliran satu per satu',
            'Semua mesin sama besar dan semua permintaan sama berat',
          ],
          [
            'Weighted round robin',
            'Bergiliran dengan jatah berbeda',
            'Ada mesin yang lebih besar daripada yang lain',
          ],
          [
            'Least connections',
            'Pilih yang sambungan aktifnya paling sedikit',
            'Lama tiap permintaan sangat bervariasi',
          ],
          [
            'IP hash',
            'Hitung dari alamat IP klien',
            'Butuh pengguna yang sama selalu ke mesin yang sama',
          ],
          [
            'Consistent hashing',
            'Hitung dengan hash ring',
            'Tujuan yang menyimpan data, misalnya kelompok cache',
          ],
        ],
      ),
      p(
        'Round robin adalah pilihan bawaan yang benar untuk sebagian besar kasus. Ia menjadi pilihan yang buruk ketika sebagian permintaan jauh lebih berat daripada yang lain, misalnya endpoint ekspor yang memakan sepuluh detik bercampur dengan endpoint biasa yang memakan sepuluh milidetik. Dalam keadaan itu, round robin akan terus mengirim permintaan ke mesin yang sedang tersendat, sedangkan least connections akan menghindarinya dengan sendirinya.',
      ),
      code(
        'text',
        `
        upstream aplikasi {
            least_conn;

            server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
            server 10.0.1.12:3000 max_fails=3 fail_timeout=30s;
            server 10.0.1.13:3000 max_fails=3 fail_timeout=30s;

            keepalive 64;
        }

        server {
            listen 443 ssl;
            server_name toko.com;

            location / {
                proxy_pass http://aplikasi;
                proxy_http_version 1.1;
                proxy_set_header Connection "";
                proxy_set_header Host              $host;
                proxy_set_header X-Real-IP         $remote_addr;
                proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;

                proxy_connect_timeout 2s;
                proxy_read_timeout   30s;
                proxy_next_upstream  error timeout http_502 http_503;
            }
        }
        `,
        {
          filename: 'nginx.conf',
          caption: 'Setiap baris di blok location menjawab satu masalah yang nyata.',
        },
      ),
      p(
        'Beberapa baris layak dijelaskan karena keduanya sering ditulis tanpa dipahami. Baris `keepalive 64` menahan sambungan ke upstream agar tetap terbuka, sehingga tidak ada jabat tangan TCP baru pada setiap permintaan. Tanpa dua baris `proxy_http_version` dan `Connection ""` di bawahnya, pengaturan keepalive itu tidak berlaku sama sekali, dan itu kesalahan yang sangat umum.',
      ),
      p(
        'Empat header `X-` meneruskan informasi yang hilang begitu ada perantara. Tanpa `X-Forwarded-For`, aplikasi akan melihat alamat IP load balancer pada setiap permintaan, sehingga rate limiter per IP di sub-bab [rate limit login](/kelas/backend-basic/auth-dasar/rate-limit-login) akan menghitung seluruh dunia sebagai satu pengguna. Tanpa `X-Forwarded-Proto`, aplikasi tidak tahu permintaan aslinya HTTPS, sehingga cookie dengan flag `Secure` bisa ditolak sendiri oleh aplikasinya.',
      ),
      callout(
        'danger',
        'Header X-Forwarded-For hanya boleh dipercaya dari proxy milikmu sendiri',
        'Header itu bisa dikirim siapa saja. Kalau aplikasimu langsung mempercayai nilainya, penyerang tinggal memalsukannya untuk melewati rate limiter per IP. Aturannya, aplikasi hanya boleh membaca header itu ketika permintaannya datang dari alamat proxy yang kamu kenal, dan kerangka kerja modern menyediakan pengaturan khusus untuk ini, misalnya `trust proxy` di Express.',
      ),

      h2('Health check, bagian yang paling menentukan'),
      p(
        'Membagi beban hanya separuh manfaat load balancer. Separuh lainnya, dan sering kali yang lebih berharga, adalah kemampuannya berhenti mengirim permintaan ke mesin yang sedang bermasalah.',
      ),
      p(
        'Agar itu bekerja, endpoint kesehatan harus menjawab pertanyaan yang benar. Inilah tempat perbedaan liveness dan readiness menjadi sangat konkret.',
      ),
      compare(
        {
          title: 'Salah, terlalu dangkal',
          lang: 'js',
          code: `
            app.get('/health', (req, res) => {
              res.status(200).json({ ok: true });
            });
          `,
          notes: [
            'Selalu menjawab 200 selama prosesnya hidup',
            'Mesin yang kehilangan database tetap dianggap sehat',
            'Load balancer terus mengirim permintaan yang pasti gagal',
          ],
        },
        {
          title: 'Benar, memeriksa kesiapan',
          lang: 'js',
          code: `
            app.get('/healthz', (req, res) => {
              // Liveness: cukup buktikan event loop tidak macet.
              res.status(200).json({ status: 'alive', version: BUILD_SHA });
            });

            app.get('/readyz', async (req, res) => {
              const checks = { db: false, cache: false };
              try {
                await db.query('SELECT 1');
                checks.db = true;
              } catch (err) {
                logger.warn({ err }, 'readiness: database tidak terjangkau');
              }
              try {
                await redis.ping();
                checks.cache = true;
              } catch (err) {
                logger.warn({ err }, 'readiness: cache tidak terjangkau');
              }

              // Cache bukan syarat wajib, database iya.
              const siap = checks.db;
              res.status(siap ? 200 : 503).json({ status: siap ? 'ready' : 'not-ready', checks });
            });
          `,
          notes: [
            'Dua endpoint untuk dua pertanyaan berbeda',
            'Kegagalan cache tidak mengeluarkan mesin dari daftar',
            'Kegagalan database mengeluarkannya sampai pulih',
            '`BUILD_SHA` mempermudah memastikan versi mana yang sedang melayani',
          ],
        },
      ),
      p(
        'Perhatikan keputusan pada baris `const siap = checks.db`. Ia menyatakan secara sadar bahwa database adalah syarat wajib sedangkan cache bukan. Kalau cache ikut dijadikan syarat, matinya Redis akan mengeluarkan **seluruh** mesin dari daftar sekaligus, dan layanan akan mati total padahal databasenya baik-baik saja. Ini bentuk konkret dari perkalian ketersediaan yang dibahas di Bab 1.',
      ),
      callout(
        'warning',
        'Health check yang terlalu dalam bisa menyebabkan cascading failure',
        'Kalau endpoint kesehatanmu memanggil tiga layanan lain, maka satu layanan yang lambat akan membuat seluruh mesin dinyatakan tidak sehat sekaligus. Batasi pemeriksaan pada ketergantungan yang benar-benar wajib, dan beri timeout yang pendek pada setiap pemeriksaan agar endpointnya sendiri tidak pernah menggantung.',
      ),

      h2('Menghentikan mesin tanpa memutus permintaan'),
      p(
        'Ketika sebuah mesin akan dimatikan, entah untuk rilis versi baru atau untuk pemeliharaan, urutan yang benar mencegah permintaan terpotong di tengah jalan.',
      ),
      steps(
        {
          title: 'Endpoint readiness mulai menjawab 503',
          body: 'Aplikasi menangkap sinyal berhenti dan langsung menandai dirinya tidak siap, tetapi belum berhenti melayani.',
        },
        {
          title: 'Load balancer berhenti mengirim permintaan baru',
          body: 'Ini butuh waktu satu sampai dua kali selang pemeriksaan, jadi aplikasi harus menunggu selama itu sebelum melanjutkan.',
        },
        {
          title: 'Permintaan yang sedang berjalan diselesaikan',
          body: 'Server berhenti menerima sambungan baru dan menunggu yang berjalan selesai, dengan timeout agar tidak menggantung selamanya.',
        },
        {
          title: 'Proses keluar',
          body: 'Setelah semuanya selesai atau timeout-nya habis, proses berhenti dengan bersih.',
        },
      ),
      code(
        'js',
        `
        let siapMelayani = true;
        const JEDA_DRAIN_MS = 10_000; // dua kali selang health check

        app.get('/readyz', (req, res) => {
          if (!siapMelayani) return res.status(503).json({ status: 'shutting-down' });
          // ... pemeriksaan ketergantungan seperti di atas
        });

        async function matikanDenganRapi(sinyal) {
          logger.info({ sinyal }, 'mulai mematikan, berhenti menerima lalu lintas baru');
          siapMelayani = false;

          // Beri load balancer waktu untuk melihat status tidak siap.
          await new Promise((resolve) => setTimeout(resolve, JEDA_DRAIN_MS));

          server.close(async () => {
            await queue.close();
            await db.end();
            await redis.quit();
            logger.info('semua sambungan ditutup, keluar');
            process.exit(0);
          });

          // Jaring pengaman bila ada sambungan yang tidak mau tutup.
          setTimeout(() => process.exit(1), 30_000).unref();
        }

        process.on('SIGTERM', () => matikanDenganRapi('SIGTERM'));
        process.on('SIGINT', () => matikanDenganRapi('SIGINT'));
        `,
        {
          caption:
            'Jeda sepuluh detik itu bukan pemborosan, melainkan bagian yang membuat rilis tidak memutus siapa pun.',
        },
      ),
      p(
        'Tanpa jeda pada baris `await new Promise`, prosesnya berhenti sebelum load balancer sempat menyadarinya, dan setiap permintaan yang terlanjur dikirim akan gagal. Inilah penyebab paling umum munculnya sedikit error 502 pada setiap rilis, dan penyebab itu sering dikira tidak bisa dihindari padahal bisa.',
      ),

      h2('Load balancer sendiri adalah titik kegagalan'),
      p(
        'Satu load balancer di depan tiga mesin aplikasi berarti tiga mesin itu dilindungi dan load balancernya sendiri tidak. Ada beberapa cara menjawabnya, dengan tingkat kerumitan yang berbeda.',
      ),
      table(
        ['Cara', 'Bagaimana', 'Kapan dipakai'],
        [
          [
            'Load balancer terkelola',
            'Penyedia awan menjalankan dan mereplikasinya untukmu',
            'Hampir selalu, karena masalahnya berpindah ke penyedia',
          ],
          [
            'Dua Nginx dengan IP mengambang',
            'Dua mesin berbagi satu alamat IP yang bisa berpindah',
            'Ketika kamu mengelola sendiri servernya',
          ],
          [
            'DNS ke beberapa alamat',
            'Beberapa record A untuk satu nama',
            'Perlindungan kasar, perpindahannya lambat',
          ],
        ],
      ),
      p(
        'Untuk sebagian besar tim, jawaban pertama adalah jawaban yang benar. Menjalankan sepasang load balancer sendiri berarti menambah satu sistem lagi yang harus dipahami, dipantau, dan diperbarui, dan manfaatnya jarang sepadan kecuali ada alasan khusus.',
      ),

      references(
        {
          label: 'Nginx: HTTP Load Balancing',
          href: 'https://nginx.org/en/docs/http/load_balancing.html',
          source: 'Nginx',
          note: 'Seluruh algoritma pembagian beban beserta parameter kegagalannya.',
        },
        {
          label: 'Nginx: ngx_http_upstream_module',
          href: 'https://nginx.org/en/docs/http/ngx_http_upstream_module.html',
          source: 'Nginx',
          note: 'Rujukan lengkap untuk `keepalive`, `max_fails`, dan pemeriksaan upstream.',
        },
        {
          label: 'X-Forwarded-For',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For',
          source: 'MDN',
          note: 'Termasuk peringatan resmi bahwa header ini mudah dipalsukan.',
        },
        {
          label: 'Kubernetes: Configure Liveness, Readiness and Startup Probes',
          href: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/',
          source: 'Kubernetes',
          note: 'Definisi baku beda liveness dan readiness beserta akibat masing-masing.',
        },
      ),
    ],
  ),

  written(
    'server-stateless',
    'Server Stateless dan Nasib Sesi',
    12,
    'Syarat yang harus dipenuhi sebelum mesin aplikasi boleh lebih dari satu.',
    [
      p(
        'Langkah kelima pada daftar penskalaan terlihat sederhana, yaitu jalankan aplikasinya di tiga mesin lalu pasang load balancer. Dalam praktiknya, langkah itu sering gagal pada percobaan pertama, dan penyebabnya hampir selalu sama, yaitu aplikasinya menyimpan sesuatu di dalam dirinya sendiri.',
      ),
      p(
        'Sub-bab ini membahas apa saja yang tanpa sadar disimpan di memori proses, kenapa masing-masing menjadi masalah begitu ada salinan kedua, dan ke mana masing-masing harus dipindahkan.',
      ),

      terms(
        {
          term: 'state',
          meaning:
            'Data yang bertahan di antara dua permintaan dan memengaruhi hasil permintaan berikutnya. Dibaca "steit". Contohnya sesi login, isi keranjang belanja, dan hitungan percobaan gagal. Yang bukan state adalah variabel yang lahir dan mati di dalam satu permintaan.',
        },
        {
          term: 'stateless',
          meaning:
            'Sifat proses yang tidak menyimpan state apa pun di dalam dirinya, sehingga permintaan mana pun bisa dilayani salinan mana pun dengan hasil yang sama. Dibaca "steitles". Ini bukan berarti aplikasinya tidak punya data, melainkan datanya berada di luar proses, yaitu di database, cache bersama, atau object storage.',
        },
        {
          term: 'stateful',
          meaning:
            'Kebalikannya, yaitu proses yang menyimpan state di dalam dirinya. Sebuah proses stateful tidak bisa digandakan begitu saja, dan mematikannya berarti kehilangan apa yang ia simpan.',
        },
        {
          term: 'shared session store',
          meaning:
            'Tempat menyimpan data sesi yang bisa dibaca semua salinan aplikasi, biasanya Redis atau tabel di database. Dengan ini, pengguna yang login lewat mesin pertama tetap dikenali ketika permintaannya mendarat di mesin ketiga.',
        },
        {
          term: 'ephemeral process',
          meaning:
            'Proses yang dianggap bisa dimatikan kapan saja tanpa kehilangan apa pun yang penting. Dibaca "efemeral". Ini salah satu prinsip pada dua belas faktor, dan ia adalah syarat agar penskalaan otomatis, rilis bergilir, dan pemulihan otomatis bisa bekerja.',
        },
        {
          term: 'sticky',
          meaning:
            'Sifat pengaturan yang memaksa satu pengguna selalu ke mesin yang sama. Sering dipakai sebagai jalan pintas agar aplikasi stateful tetap bisa dijalankan berganda, dengan akibat beban menjadi tidak merata dan matinya satu mesin membuang sesi penggunanya.',
        },
      ),

      h2('Yang tanpa sadar disimpan di memori proses'),
      p(
        'Daftar berikut adalah hal-hal yang paling sering ditemukan ketika sebuah aplikasi mulai dijalankan berganda, beserta gejalanya.',
      ),
      table(
        ['Yang disimpan di memori', 'Gejalanya saat ada 3 mesin', 'Harus pindah ke'],
        [
          ['Sesi login', 'Pengguna keluar sendiri secara acak', 'Redis atau tabel sesi'],
          ['Berkas unggahan di disk lokal', 'Gambar kadang ada kadang tidak', 'Object storage'],
          ['Cache dalam variabel `Map`', 'Data lama muncul di satu mesin saja', 'Redis'],
          [
            'Hitungan rate limiter',
            'Batasnya menjadi tiga kali lipat',
            'Redis dengan operasi atomik',
          ],
          [
            'Penjadwal `setInterval`',
            'Pekerjaan berkala berjalan tiga kali',
            'Satu penjadwal terpisah atau kunci terdistribusi',
          ],
          [
            'Sambungan WebSocket',
            'Pesan hanya sampai ke sebagian pengguna',
            'Adapter yang menyiarkan lewat Redis',
          ],
          [
            'Antrean dalam array di memori',
            'Pekerjaan hilang saat mesin diganti',
            'Antrean sungguhan seperti BullMQ',
          ],
        ],
      ),
      p(
        'Baris keempat layak diperiksa lebih dekat, karena akibatnya paling mudah luput. Rate limiter yang menghitung di memori proses akan mengizinkan seratus permintaan **per mesin**, sehingga dengan tiga mesin batas sesungguhnya menjadi tiga ratus. Yang lebih buruk, batasnya tidak tetap, karena bergantung pada mesin mana yang kebetulan menerima permintaan.',
      ),

      h2('Sesi, contoh yang paling sering ditemui'),
      p(
        'Ambil bentuk sesi yang tersimpan di memori, yang merupakan bawaan banyak contoh di internet.',
      ),
      compare(
        {
          title: 'Stateful, hanya cocok untuk satu mesin',
          lang: 'js',
          code: `
            import session from 'express-session';

            app.use(
              session({
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
                // Tanpa store, express-session memakai MemoryStore.
              }),
            );
          `,
          notes: [
            'Sesi hidup di memori proses',
            'Restart aplikasi mengeluarkan semua pengguna',
            'Mesin kedua tidak mengenali sesi dari mesin pertama',
          ],
        },
        {
          title: 'Stateless, siap digandakan',
          lang: 'js',
          code: `
            import session from 'express-session';
            import { RedisStore } from 'connect-redis';

            app.use(
              session({
                store: new RedisStore({ client: redis, prefix: 'sesi:' }),
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
                cookie: {
                  httpOnly: true,
                  secure: true,
                  sameSite: 'lax',
                  maxAge: 1000 * 60 * 60 * 24 * 7,
                },
              }),
            );
          `,
          notes: [
            'Sesi hidup di Redis, di luar proses',
            'Restart tidak mengeluarkan siapa pun',
            'Semua mesin membaca sesi yang sama',
            'Flag cookie mengikuti aturan di kategori Keamanan',
          ],
        },
      ),
      p(
        'Perhatikan proses ini tidak menghapus sesi, melainkan **memindahkannya**. Aplikasi tetap punya state, hanya saja state itu sekarang berada di tempat yang bisa diakses semua salinan. Inilah arti sesungguhnya kata stateless dalam konteks penskalaan.',
      ),
      p(
        'Ada juga bentuk sesi tanpa penyimpanan sama sekali, yaitu token bertanda tangan seperti JWT yang dibahas di sub-bab [JWT dan batasnya](/kelas/keamanan-fullstack/identitas-kewenangan/jwt-dan-batasnya). Bentuk itu memang membuat server tidak perlu menyimpan apa-apa, dengan harga yang sudah dibahas di sana, yaitu pencabutan menjadi sulit. Untuk aplikasi web biasa, sesi di Redis biasanya pilihan yang lebih tepat karena pencabutan seketika lebih berharga daripada menghemat satu pembacaan Redis.',
      ),

      h2('Pekerjaan berkala yang berjalan berkali-kali'),
      p(
        'Ini masalah yang paling sering baru ketahuan setelah beberapa hari, biasanya dari keluhan pengguna yang menerima email yang sama tiga kali.',
      ),
      code(
        'js',
        `
        // BERBAHAYA saat aplikasi dijalankan lebih dari satu salinan.
        setInterval(async () => {
          const langganan = await db.langganan.cariYangJatuhTempo();
          for (const item of langganan) {
            await kirimEmailPengingat(item);
          }
        }, 60 * 60 * 1000);
        `,
      ),
      p('Ada tiga jalan keluar, dengan tingkat kerumitan yang berbeda.'),
      table(
        ['Cara', 'Bagaimana', 'Cocok ketika'],
        [
          [
            'Penjadwal terpisah',
            'Satu proses khusus yang hanya menjalankan tugas berkala',
            'Paling sederhana dan paling sering benar',
          ],
          [
            'Penjadwal berulang milik antrean',
            'BullMQ atau Horizon menjadwalkan pekerjaan, satu worker mengerjakannya',
            'Sudah ada antrean di sistemmu',
          ],
          [
            'Kunci terdistribusi',
            'Semua salinan mencoba mengambil kunci, hanya satu yang berhasil',
            'Tidak ingin menambah proses baru',
          ],
        ],
      ),
      code(
        'js',
        `
        // Cara ketiga: kunci di Redis dengan masa berlaku.
        // NX berarti hanya berhasil bila kuncinya belum ada.
        // PX memberi masa berlaku, sehingga kunci tidak menggantung bila prosesnya mati.
        async function jalankanSekaliSaja(nama, ttlMs, kerjakan) {
          const token = crypto.randomUUID();
          const dapat = await redis.set('kunci:' + nama, token, 'NX', 'PX', ttlMs);
          if (dapat !== 'OK') return false;

          try {
            await kerjakan();
            return true;
          } finally {
            // Hapus hanya bila kuncinya masih milik kita.
            const skrip = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
            await redis.eval(skrip, 1, 'kunci:' + nama, token);
          }
        }
        `,
        {
          caption:
            'Pemeriksaan token saat menghapus mencegah satu proses menghapus kunci milik proses lain.',
        },
      ),
      p(
        'Bagian `finally` pada potongan itu bukan kerapian belaka. Tanpa pemeriksaan token, sebuah proses yang lambat bisa menghapus kunci yang sudah kedaluwarsa dan sudah diambil proses lain, dan pekerjaannya kembali berjalan ganda. Bahkan dengan pemeriksaan itu, kunci terdistribusi tetap punya kasus tepi ketika prosesnya tersendat lebih lama daripada masa berlaku kuncinya, dan itulah alasan cara pertama lebih disukai bila memungkinkan.',
      ),

      h2('WebSocket dan sambungan yang melekat'),
      p(
        'Sambungan realtime pada dasarnya stateful, karena sambungan itu benar-benar hidup di satu proses tertentu. Ini tidak bisa dihindari, yang bisa diatur adalah cara menyiarkan pesan ke sambungan yang tersebar di beberapa proses.',
      ),
      code(
        'text',
        `
        TANPA ADAPTER
        Pengguna A tersambung ke Mesin 1
        Pengguna B tersambung ke Mesin 2
        A mengirim pesan -> Mesin 1 menyiarkannya -> hanya sampai ke penghuni Mesin 1
        B tidak pernah menerimanya

        DENGAN ADAPTER REDIS
        A mengirim pesan -> Mesin 1 menerbitkannya ke Redis
        Redis menyiarkan ke semua mesin -> Mesin 2 meneruskan ke B
        `,
      ),
      p(
        'Untuk Socket.IO yang dibahas di sub-bab [Socket.IO](/kelas/backend-intermediate/express-intermediate/socketio), jawabannya adalah memasang adapter Redis. Perhatikan ini tidak membuat sambungannya menjadi stateless, melainkan membuat **penyiarannya** melintasi batas proses. Sambungannya tetap terikat pada satu mesin, dan matinya mesin itu tetap memutus sambungan yang ada di sana, sehingga klien tetap harus bisa menyambung kembali dengan sendirinya.',
      ),

      h2('Daftar periksa sebelum menggandakan aplikasi'),
      ol(
        'Jalankan dua salinan aplikasi di komputermu pada port berbeda, lalu pakai aplikasinya bergantian lewat keduanya',
        'Login lewat salinan pertama, lalu muat halaman dari salinan kedua, dan pastikan kamu masih dikenali',
        'Unggah berkas lewat salinan pertama, lalu ambil berkasnya lewat salinan kedua',
        'Cari seluruh `setInterval` dan `setTimeout` berulang di kode, lalu putuskan siapa yang boleh menjalankannya',
        'Cari variabel di lingkup modul yang menampung data, misalnya `const cache = new Map()`',
        'Pastikan rate limiter memakai penyimpanan bersama, bukan hitungan di memori',
        'Matikan salinan pertama di tengah pemakaian, dan pastikan tidak ada yang hilang selain sambungan realtime',
      ),
      callout(
        'tip',
        'Dua salinan di laptop menemukan hampir semua masalahnya',
        'Kamu tidak perlu tiga server sungguhan untuk menguji ini. Jalankan `PORT=3001 npm start` dan `PORT=3002 npm start` di dua terminal, lalu bolak-balik di antara keduanya. Hampir semua kejutan yang akan muncul di produksi akan muncul juga dalam lima menit percobaan ini, dan biayanya nol.',
      ),

      h2('Kapan stateful memang jawabannya'),
      p(
        'Sebagai penutup, perlu ditegaskan bahwa stateless bukan aturan moral. Ada komponen yang memang harus menyimpan state, dan memaksakan mereka menjadi stateless adalah kesalahan yang berbeda.',
      ),
      ul(
        '**Database** memang stateful, dan itulah pekerjaannya. Ia diskalakan dengan cara yang berbeda, dan itu isi Bab 3.',
        '**Cache** menyimpan state, tetapi state yang boleh hilang, sehingga ia bisa diganti kapan saja.',
        '**Layanan sambungan realtime** memegang sambungan yang tidak bisa dipindahkan, jadi yang diskalakan adalah jumlah simpulnya, bukan sifatnya.',
        '**Worker antrean** boleh menyimpan kemajuan sebuah pekerjaan selama pekerjaan itu bisa diulang dari awal bila prosesnya mati.',
      ),
      p(
        'Aturan sesungguhnya bukan "jangan punya state", melainkan **"tempatkan state di komponen yang memang dirancang untuk menyimpannya"**. Server aplikasi bukan salah satu komponen itu.',
      ),

      references(
        {
          label: 'The Twelve-Factor App: Processes',
          href: 'https://12factor.net/processes',
          source: '12factor',
          note: 'Prinsip resmi bahwa proses aplikasi harus stateless dan tidak berbagi apa pun.',
        },
        {
          label: 'The Twelve-Factor App: Disposability',
          href: 'https://12factor.net/disposability',
          source: '12factor',
          note: 'Alasan proses harus bisa dimatikan kapan saja tanpa kehilangan data.',
        },
        {
          label: 'Redis: SET',
          href: 'https://redis.io/docs/latest/commands/set/',
          source: 'Redis',
          note: 'Opsi `NX` dan `PX` yang dipakai untuk kunci terdistribusi pada sub-bab ini.',
        },
        {
          label: 'Socket.IO: Adapter',
          href: 'https://socket.io/docs/v4/adapter/',
          source: 'Socket.IO',
          note: 'Cara resmi menyiarkan pesan melintasi beberapa proses.',
        },
      ),
    ],
  ),
  written(
    'lapisan-cache',
    'Lapisan Cache dan Strateginya',
    14,
    'Lima tempat cache bisa berada, empat cara mengisinya, dan cara memutuskan masa berlakunya.',
    [
      p(
        'Cache adalah blok penyusun dengan perbandingan manfaat terhadap usaha yang paling tinggi pada sistem yang lebih banyak dibaca daripada ditulis. Ia juga blok yang paling sering dipasang setengah benar, karena memasangnya mudah sedangkan **membatalkannya** sulit.',
      ),
      p(
        'Kamu sudah memasang cache Redis di sub-bab [cache Redis](/kelas/backend-intermediate/express-intermediate/cache-redis) dan [caching serta optimasi Laravel](/kelas/backend-intermediate/laravel-intermediate/caching-optimasi). Sub-bab ini tidak mengulang caranya. Yang dibahas di sini adalah keputusan yang mengelilinginya, yaitu di lapisan mana cache diletakkan, bagaimana ia diisi, berapa lama isinya berlaku, dan siapa yang bertanggung jawab menghapusnya.',
      ),

      terms(
        {
          term: 'cache',
          meaning:
            'Salinan sementara sebuah data yang diletakkan di tempat yang lebih cepat atau lebih dekat daripada sumber aslinya. Dibaca "kesy". Sifat yang membedakannya dari database, yaitu isi cache boleh hilang kapan saja tanpa merusak kebenaran sistem. Kalau kehilangan isinya merusak sesuatu, itu bukan cache melainkan penyimpanan utama.',
        },
        {
          term: 'hit ratio',
          meaning:
            'Persentase permintaan yang bisa dijawab langsung dari cache. Ini angka utama untuk menilai apakah sebuah cache berguna. Hit ratio 40 persen berarti hampir dua pertiga permintaan tetap membebani sumber aslinya, dan pada angka serendah itu cachenya biasanya perlu ditinjau ulang, bukan diperbesar.',
        },
        {
          term: 'TTL (time to live)',
          meaning:
            'Masa berlaku sebuah isi cache, dinyatakan dalam detik. Dibaca "ti-ti-el". Setelah masa itu lewat, isinya dianggap tidak berlaku dan akan diambil ulang dari sumbernya. TTL adalah cara paling sederhana menjaga data tidak terlalu basi, dan sekaligus jaring pengaman ketika mekanisme penghapusan yang lebih tepat gagal.',
        },
        {
          term: 'invalidation (invalidasi)',
          meaning:
            'Menyatakan sebuah isi cache tidak berlaku lagi sebelum masa berlakunya habis, biasanya karena data aslinya berubah. Dibaca "invalidasi". Ada dua bentuk, yaitu menghapus kuncinya lalu membiarkan pembacaan berikutnya mengisinya kembali, atau langsung menimpanya dengan nilai baru.',
        },
        {
          term: 'stale (basi)',
          meaning:
            'Keadaan ketika isi cache sudah tidak sama dengan data aslinya. Dibaca "steil". Data basi bukan selalu masalah. Pertanyaan yang benar bukan "apakah boleh basi" melainkan "berapa lama boleh basi", dan jawabannya berbeda untuk tiap jenis data.',
        },
        {
          term: 'eviction policy',
          meaning:
            'Aturan yang menentukan isi mana yang dibuang ketika memori cache penuh. Yang paling umum adalah LRU, yaitu membuang yang paling lama tidak diakses. Ada juga LFU yang membuang yang paling jarang diakses, dan ini biasanya lebih baik ketika ada sekelompok kecil data yang selalu panas.',
        },
        {
          term: 'working set',
          meaning:
            'Bagian data yang benar-benar sering dibaca, biasanya jauh lebih kecil daripada seluruh data. Ukuran cache yang benar adalah ukuran working set, bukan ukuran seluruh datanya. Cara menghitungnya sudah dibahas di sub-bab [estimasi kasar](/kelas/system-design/fondasi-sistem/estimasi-kasar).',
        },
        {
          term: 'cache-aside',
          meaning:
            'Pola paling umum, yaitu aplikasi memeriksa cache lebih dulu, dan bila kosong ia membaca dari database lalu menyimpannya ke cache. Dibaca "kesy-esaid". Disebut aside karena cache berada di samping alur, bukan di tengahnya, sehingga aplikasilah yang mengendalikan seluruh keputusannya.',
        },
        {
          term: 'write-through dan write-behind',
          meaning:
            'Dua pola penulisan. Write-through menulis ke cache dan database sekaligus sebelum menjawab, sehingga cache tidak pernah basi dengan harga penulisan yang lebih lambat. Write-behind menulis ke cache lalu menjawab, dan penulisan ke database menyusul di latar, sehingga penulisan sangat cepat dengan risiko kehilangan data bila cachenya mati.',
        },
      ),

      h2('Lima lapisan tempat cache bisa berada'),
      p(
        'Cache bukan satu tempat. Sebuah permintaan bisa berhenti di lima titik berbeda sebelum mencapai database, dan tiap titik punya sifat yang berbeda.',
      ),
      table(
        ['Lapisan', 'Yang disimpan', 'Latensi', 'Siapa yang mengendalikan'],
        [
          ['Browser', 'Aset statis, respons dengan `Cache-Control`', 'Nol', 'Header dari servermu'],
          ['CDN', 'Aset dan halaman publik', '5 sampai 50 ms', 'Header dari servermu'],
          ['Reverse proxy', 'Respons penuh', '1 sampai 5 ms', 'Konfigurasi Nginx'],
          ['Aplikasi', 'Hasil query, hasil perhitungan', '1 sampai 5 ms', 'Kodemu, lewat Redis'],
          [
            'Database',
            'Rencana query, halaman data di memori',
            'Bervariasi',
            'Pengaturan database',
          ],
        ],
      ),
      p(
        'Aturan yang berguna, yaitu **semakin dekat ke pengguna, semakin murah**. Permintaan yang berhenti di browser tidak memakan apa pun. Permintaan yang berhenti di CDN tidak menyentuh servermu sama sekali. Karena itu urutan yang benar saat memikirkan cache adalah dari luar ke dalam, bukan langsung melompat ke Redis.',
      ),
      callout(
        'tip',
        'Periksa lapisan CDN sebelum menambah Redis',
        'Kalau halaman yang berat ternyata sama untuk semua pengunjung, satu header `Cache-Control` yang benar bisa menghilangkan seluruh bebannya tanpa satu baris kode pun. Redis baru menjadi jawaban untuk data yang berbeda per pengguna, atau untuk hasil perhitungan yang dipakai di banyak halaman sekaligus.',
      ),

      h2('Empat cara mengisi dan menulis cache'),
      table(
        ['Pola', 'Cara kerja', 'Kelebihan', 'Kekurangan'],
        [
          [
            'Cache-aside',
            'Aplikasi baca cache, bila kosong baca database lalu simpan',
            'Sederhana, aplikasi memegang kendali, cache boleh mati',
            'Permintaan pertama selalu lambat, dan bisa terjadi cache stampede',
          ],
          [
            'Read-through',
            'Library cache yang mengambil sendiri dari sumber saat kosong',
            'Kode aplikasi lebih bersih',
            'Terikat pada library, dan kesalahan lebih sulit ditelusuri',
          ],
          [
            'Write-through',
            'Tulis ke cache dan database sekaligus, baru jawab',
            'Cache tidak pernah basi',
            'Penulisan lebih lambat, dan cache terisi data yang mungkin tidak pernah dibaca',
          ],
          [
            'Write-behind',
            'Tulis ke cache, jawab, lalu database menyusul',
            'Penulisan sangat cepat',
            'Data hilang bila cache mati sebelum sempat menulis',
          ],
        ],
      ),
      p(
        'Untuk aplikasi web biasa, cache-aside adalah jawaban yang benar pada hampir semua kasus. Ia paling sederhana, dan yang terpenting ia membuat cache menjadi **opsional**, sehingga matinya Redis membuat sistem lambat, bukan mati.',
      ),
      code(
        'js',
        `
        const TTL_DETIK = 300;

        async function ambilTulisan(slug) {
          const kunci = 'tulisan:v1:' + slug;

          // 1. Coba cache. Kegagalan di sini tidak boleh menjatuhkan permintaan.
          try {
            const tersimpan = await redis.get(kunci);
            if (tersimpan !== null) {
              metrics.increment('cache.hit', { kunci: 'tulisan' });
              return JSON.parse(tersimpan);
            }
          } catch (err) {
            logger.warn({ err, kunci }, 'cache tidak terjangkau, lanjut ke database');
          }

          metrics.increment('cache.miss', { kunci: 'tulisan' });

          // 2. Source of truth.
          const tulisan = await db.tulisan.cariBerdasarkanSlug(slug);
          if (tulisan === null) return null;

          // 3. Isi cache untuk permintaan berikutnya.
          try {
            await redis.set(kunci, JSON.stringify(tulisan), 'EX', TTL_DETIK);
          } catch (err) {
            logger.warn({ err, kunci }, 'gagal menyimpan ke cache');
          }

          return tulisan;
        }
        `,
        {
          caption:
            'Perhatikan dua blok try dan penghitung metrik. Keduanya yang membuat cache ini layak produksi.',
        },
      ),
      p(
        'Dua penghitung `cache.hit` dan `cache.miss` sering dianggap tambahan yang bisa ditunda. Sebaliknya, keduanya adalah satu-satunya cara mengetahui apakah cachenya berguna. Tanpa angka itu, kamu tidak akan pernah tahu bahwa hit rationya ternyata lima persen dan seluruh pemasangan itu sia-sia.',
      ),

      h2('Menyusun kunci cache'),
      p(
        'Bentuk kunci menentukan seberapa mudah cachenya dikelola dan seberapa besar risiko kebocoran antar pengguna. Ada empat aturan yang layak diikuti sejak awal.',
      ),
      ol(
        '**Beri awalan yang menyatakan jenisnya**, misalnya `tulisan:`, `pengguna:`, `daftar:`. Awalan membuat penghapusan berkelompok dan pemeriksaan menjadi mungkin.',
        '**Sertakan nomor versi**, misalnya `tulisan:v1:`. Ketika bentuk datanya berubah, naikkan versinya dan seluruh isi lama menjadi tidak terpakai dengan sendirinya, tanpa perlu menghapus apa pun.',
        '**Sertakan seluruh hal yang memengaruhi hasil.** Kalau hasilnya berbeda per pengguna, id pengguna harus ada di kunci. Kalau berbeda per bahasa, bahasanya harus ada.',
        '**Jangan pernah memasukkan data rahasia ke dalam kunci**, karena kunci sering muncul di log dan di perkakas pemantauan.',
      ),
      compare(
        {
          title: 'Kunci yang bermasalah',
          lang: 'js',
          code: `
            // Tidak menyebut jenis, tidak berversi.
            const kunci = slug;

            // Hasilnya berbeda per pengguna, tetapi kuncinya tidak menyebutkan itu.
            const kunciDaftar = 'daftar-tulisan';

            // Membawa token ke dalam kunci.
            const kunciProfil = 'profil:' + sessionToken;
          `,
          notes: [
            'Baris kedua adalah kebocoran data antar pengguna',
            'Baris ketiga menuliskan rahasia ke log Redis',
            'Baris pertama tidak bisa dihapus berkelompok',
          ],
        },
        {
          title: 'Kunci yang benar',
          lang: 'js',
          code: `
            const kunci = 'tulisan:v1:' + slug;

            // Semua yang memengaruhi hasil ikut masuk.
            const kunciDaftar =
              'daftar:v1:pengguna:' + penggunaId +
              ':hal:' + halaman +
              ':urut:' + urutan;

            // Identitas diambil dari sesi yang sudah diverifikasi, bukan tokennya.
            const kunciProfil = 'profil:v1:' + req.session.penggunaId;
          `,
          notes: [
            'Awalan menyatakan jenis',
            '`v1` memungkinkan perubahan bentuk tanpa penghapusan',
            'Setiap pembeda hasil ikut disebut',
          ],
        },
      ),
      callout(
        'danger',
        'Kunci yang kurang pembeda adalah kebocoran data',
        'Kunci `daftar-tulisan` yang dipakai untuk hasil yang sebenarnya berbeda per pengguna akan menyajikan daftar milik orang pertama kepada semua orang berikutnya. Kelas kesalahan ini persis sama dengan menyimpan halaman personal di CDN, hanya saja terjadi satu lapisan lebih dalam. Setiap kali menulis kunci, tanyakan apa saja yang membuat hasilnya berbeda, lalu pastikan semuanya ada di kunci.',
      ),

      h2('Memilih TTL'),
      p(
        'Tidak ada satu nilai TTL yang benar. Yang ada adalah pertanyaan berapa lama data ini boleh basi, dan jawabannya berasal dari kebutuhan, bukan dari perasaan.',
      ),
      table(
        ['Jenis data', 'TTL yang wajar', 'Alasan'],
        [
          [
            'Aset dengan sidik jari isi',
            'Satu tahun',
            'Namanya berubah bila isinya berubah, jadi tidak akan pernah basi',
          ],
          [
            'Halaman artikel publik',
            '5 sampai 60 menit',
            'Jarang berubah, dan basi beberapa menit tidak merugikan',
          ],
          [
            'Profil pengguna',
            '5 sampai 15 menit, plus hapus saat diubah',
            'TTL sebagai jaring pengaman, penghapusan sebagai jalur utama',
          ],
          [
            'Daftar dengan paginasi',
            '30 sampai 120 detik',
            'Berubah sering, dan basi sebentar hampir tidak terlihat',
          ],
          [
            'Hasil perhitungan berat',
            '1 sampai 24 jam',
            'Mahal dihitung, dan biasanya tidak menuntut kesegaran',
          ],
          [
            'Sesi',
            'Sesuai masa berlaku sesinya',
            'Bukan cache sungguhan, melainkan penyimpanan utama sesi',
          ],
          [
            'Saldo, stok, hak akses',
            'Jangan di-cache',
            'Basi di sini berarti kesalahan yang merugikan',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah aturan yang tidak boleh dilanggar. Data yang menentukan uang, ketersediaan barang, atau kewenangan tidak boleh dibaca dari salinan yang mungkin sudah usang. Hak akses yang di-cache selama lima menit berarti pengguna yang baru dicabut aksesnya masih bisa masuk selama lima menit, dan itu adalah lubang keamanan, bukan pengoptimalan.',
      ),

      h2('Menghapus cache ketika datanya berubah'),
      p(
        'TTL saja membuat sistem selalu tertinggal sebesar TTL-nya. Untuk data yang perubahannya harus segera terlihat, penghapusan saat penulisan adalah jalur utamanya, dan TTL tetap dipasang sebagai jaring pengaman.',
      ),
      code(
        'js',
        `
        async function perbaruiTulisan(id, perubahan) {
          const tulisan = await db.tulisan.perbarui(id, perubahan);

          // Hapus, jangan timpa. Pembacaan berikutnya yang akan mengisinya kembali
          // dengan bentuk yang pasti sesuai kode terbaru.
          const kunci = [
            'tulisan:v1:' + tulisan.slug,
            'tulisan:v1:id:' + tulisan.id,
          ];
          try {
            await redis.del(...kunci);
          } catch (err) {
            logger.warn({ err, kunci }, 'gagal menghapus cache, mengandalkan TTL');
          }

          return tulisan;
        }
        `,
      ),
      p(
        'Menghapus lebih disukai daripada menimpa karena dua alasan. Pertama, menimpa mengharuskan kamu menyusun ulang bentuk data yang persis sama dengan yang dihasilkan jalur baca, dan dua tempat yang harus sama selalu berujung berbeda. Kedua, menimpa mengisi cache dengan data yang mungkin tidak akan pernah dibaca, sedangkan menghapus membiarkan cache hanya berisi yang benar-benar diminta.',
      ),
      p(
        'Kesulitan sesungguhnya bukan menghapus satu kunci, melainkan mengetahui **kunci mana saja** yang terpengaruh. Satu tulisan yang berubah bisa memengaruhi halaman tulisan itu, daftar tulisan terbaru, daftar per kategori, dan hitungan di halaman penulis. Ada dua cara menanganinya.',
      ),
      table(
        ['Cara', 'Bagaimana', 'Kelebihan', 'Kekurangan'],
        [
          [
            'Daftar kunci terkait',
            'Tulis manual semua kunci yang terpengaruh',
            'Tepat sasaran',
            'Mudah terlewat, dan bertambah setiap ada halaman baru',
          ],
          [
            'Versi berkelompok',
            'Simpan nomor versi kelompok, sertakan di setiap kunci',
            'Satu penghapusan membatalkan seluruh kelompok',
            'Isi lama menumpuk sampai TTL-nya habis',
          ],
        ],
      ),
      code(
        'js',
        `
        // Versi berkelompok: satu INCR membatalkan seluruh daftar sekaligus.
        async function kunciDaftar(kategori, halaman) {
          const versi = (await redis.get('versi:daftar:' + kategori)) ?? '1';
          return 'daftar:v1:' + kategori + ':ver' + versi + ':hal' + halaman;
        }

        async function batalkanSeluruhDaftar(kategori) {
          await redis.incr('versi:daftar:' + kategori);
        }
        `,
        {
          caption:
            'Setelah INCR, seluruh kunci lama tidak akan pernah dicari lagi dan hilang sendiri saat TTL-nya habis.',
        },
      ),

      h2('Menakar apakah cachenya berhasil'),
      p(
        'Tiga angka menjawab pertanyaan itu, dan ketiganya harus dipantau bersama karena masing-masing sendirian bisa menyesatkan.',
      ),
      table(
        ['Angka', 'Sehat bila', 'Bila tidak sehat'],
        [
          [
            'Hit ratio',
            'Di atas 80 persen untuk data panas',
            'Kuncinya terlalu banyak variasi, atau TTL terlalu pendek',
          ],
          [
            'Beban database',
            'Turun nyata sesudah cache dipasang',
            'Yang di-cache ternyata bukan query yang berat',
          ],
          [
            'Pemakaian memori cache',
            'Stabil di bawah batas',
            'Tidak ada TTL pada sebagian kunci, atau working set-nya lebih besar dari dugaan',
          ],
        ],
      ),
      code(
        'bash',
        `
        # Ringkasan cepat kesehatan sebuah instance Redis.
        redis-cli INFO stats | grep -E 'keyspace_hits|keyspace_misses'
        redis-cli INFO memory | grep -E 'used_memory_human|maxmemory_human|maxmemory_policy'
        redis-cli INFO keyspace

        # Hit ratio = keyspace_hits / (keyspace_hits + keyspace_misses)
        `,
      ),
      p(
        'Baris `maxmemory_policy` layak diperiksa sejak hari pertama. Nilai bawaan pada sebagian pemasangan adalah `noeviction`, yang berarti Redis akan **menolak penulisan** ketika memorinya penuh alih-alih membuang yang lama. Untuk sebuah cache, nilai yang benar hampir selalu `allkeys-lru`, sehingga isi yang paling lama tidak dipakai dibuang dengan sendirinya.',
      ),
      callout(
        'warning',
        'Cache tanpa batas memori bukan cache',
        'Kunci yang disimpan tanpa TTL dan tanpa eviction policy akan menumpuk sampai memorinya habis. Setelah itu, tergantung kebijakannya, Redis akan menolak penulisan atau membuang isi secara acak. Selalu tetapkan `maxmemory` dan kebijakannya secara sadar, dan selalu berikan TTL pada setiap kunci cache sekalipun kamu berencana menghapusnya secara manual.',
      ),

      references(
        {
          label: 'Redis: Key eviction',
          href: 'https://redis.io/docs/latest/develop/reference/eviction/',
          source: 'Redis',
          note: 'Seluruh eviction policy beserta perilakunya ketika memori penuh.',
        },
        {
          label: 'Redis: EXPIRE',
          href: 'https://redis.io/docs/latest/commands/expire/',
          source: 'Redis',
          note: 'Cara kerja masa berlaku kunci, termasuk kapan penghapusannya benar-benar terjadi.',
        },
        {
          label: 'Cache-Control',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control',
          source: 'MDN',
          note: 'Lapisan cache paling luar, yang sebaiknya dicoba sebelum menambah Redis.',
        },
        {
          label: 'Nginx: ngx_http_proxy_module proxy_cache',
          href: 'https://nginx.org/en/docs/http/ngx_http_proxy_module.html',
          source: 'Nginx',
          note: 'Cache pada lapisan reverse proxy, yang berada di antara CDN dan aplikasi.',
        },
      ),
    ],
  ),

  written(
    'masalah-cache',
    'Ketika Cache Justru Jadi Masalah',
    12,
    'Cache stampede, hot key, cache penetration, dan cold cache, beserta cara menutup masing-masing.',
    [
      p(
        'Cache yang dipasang dengan benar mengurangi beban secara drastis. Cache yang dipasang setengah benar bisa **menambah** beban, dan yang lebih berbahaya, ia menambah beban tepat pada saat sistem sedang paling rapuh.',
      ),
      p(
        'Sub-bab ini membahas empat kegagalan khas cache. Keempatnya punya sifat yang sama, yaitu tidak pernah muncul di lingkungan pengembangan, dan baru muncul di produksi ketika lalu lintasnya sudah cukup besar.',
      ),

      terms(
        {
          term: 'cache stampede',
          meaning:
            'Keadaan ketika satu kunci kedaluwarsa lalu ratusan permintaan yang datang bersamaan sama-sama mendapati cache kosong, sehingga semuanya menuju database pada saat yang sama. Disebut juga thundering herd, yaitu kawanan yang berlari serentak. Akibatnya database menerima lonjakan mendadak yang bisa jauh melampaui bebannya sehari-hari.',
        },
        {
          term: 'hot key',
          meaning:
            'Satu kunci yang menerima porsi lalu lintas yang jauh lebih besar daripada kunci lain, misalnya tulisan yang sedang viral. Masalahnya muncul ketika cachenya tersebar di beberapa simpul, karena seluruh lalu lintas untuk kunci itu jatuh ke satu simpul saja sementara simpul lain menganggur.',
        },
        {
          term: 'cache penetration',
          meaning:
            'Permintaan berulang untuk data yang **tidak ada**, sehingga cache selalu kosong dan setiap permintaan diteruskan ke database. Dibaca "penetreisyen". Bisa terjadi secara wajar karena tautan rusak, dan bisa juga dipakai dengan sengaja untuk membebani sistem.',
        },
        {
          term: 'cold cache',
          meaning:
            'Keadaan cache yang baru dimulai dan belum berisi apa pun, misalnya sesudah restart atau sesudah dipindahkan. Selama cache masih dingin, seluruh beban jatuh ke database, dan itulah alasan restart cache pada jam sibuk bisa menjatuhkan sistem yang selama ini terlihat baik-baik saja.',
        },
        {
          term: 'locking',
          meaning:
            'Mekanisme yang memastikan hanya satu proses yang mengerjakan sesuatu pada satu waktu. Dalam konteks cache, penguncian dipakai agar hanya satu permintaan yang pergi ke database ketika sebuah kunci kosong, sementara yang lain menunggu hasilnya.',
        },
        {
          term: 'filter Bloom',
          meaning:
            'Struktur data hemat memori yang bisa menjawab pertanyaan "apakah nilai ini pasti tidak ada" dengan sangat cepat. Dibaca "filter blum". Ia bisa menjawab "pasti tidak ada" dengan yakin, dan menjawab "mungkin ada" dengan kemungkinan salah kecil. Sifat itu cukup untuk menghentikan cache penetration sebelum menyentuh database.',
        },
      ),

      h2('Masalah pertama, cache stampede'),
      p(
        'Bayangkan halaman depan yang di-cache selama lima menit dan menerima seribu permintaan per detik. Selama lima menit itu semuanya dilayani cache, dan database praktis menganggur.',
      ),
      p(
        'Lalu masa berlakunya habis. Pada milidetik itu, seribu permintaan mendapati cache kosong secara bersamaan. Seribu-duanya menjalankan query yang sama ke database, dan database yang selama lima menit hanya melayani beberapa query mendadak menerima seribu query identik.',
      ),
      code(
        'text',
        `
        Detik 0     kunci diisi, TTL 300 detik
        Detik 1-299 1.000 QPS dilayani cache, database menerima 0
        Detik 300   kunci kedaluwarsa
        Detik 300   1.000 permintaan menemukan cache kosong
                    1.000 query identik menuju database serentak
                    Database tersendat, latensi melonjak
                    Permintaan menumpuk, sambungan habis
        `,
      ),
      p(
        'Yang membuatnya berbahaya adalah polanya berulang. Setelah database berhasil menjawab, cache terisi lagi dan tenang selama lima menit, lalu kejadian yang sama terulang. Grafik bebannya menjadi bergerigi tajam, dan penyebabnya sering dicari di tempat yang salah.',
      ),
      h2('Menutupnya dengan kunci pengisian'),
      p(
        'Gagasannya sederhana, yaitu izinkan hanya satu permintaan yang pergi ke database, dan biarkan sisanya menunggu sebentar lalu membaca cache lagi.',
      ),
      code(
        'js',
        `
        const TTL_DETIK = 300;
        const TTL_KUNCI_MS = 10_000;

        async function ambilDenganKunci(kunci, ambilDariSumber) {
          const tersimpan = await redis.get(kunci);
          if (tersimpan !== null) return JSON.parse(tersimpan);

          const kunciPengisian = 'isi:' + kunci;
          const token = crypto.randomUUID();
          const dapatKunci = await redis.set(kunciPengisian, token, 'NX', 'PX', TTL_KUNCI_MS);

          if (dapatKunci === 'OK') {
            try {
              const nilai = await ambilDariSumber();
              await redis.set(kunci, JSON.stringify(nilai), 'EX', TTL_DETIK);
              return nilai;
            } finally {
              const skrip =
                "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
              await redis.eval(skrip, 1, kunciPengisian, token);
            }
          }

          // Tidak dapat kunci, berarti ada yang sedang mengisi. Tunggu sebentar.
          for (let percobaan = 0; percobaan < 20; percobaan++) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            const kedua = await redis.get(kunci);
            if (kedua !== null) return JSON.parse(kedua);
          }

          // Sudah menunggu satu detik dan belum terisi. Jangan gantung permintaannya,
          // ambil sendiri dari sumber sebagai jalan terakhir.
          return ambilDariSumber();
        }
        `,
        {
          caption:
            'Baris terakhir penting: menunggu selamanya lebih buruk daripada satu query tambahan.',
        },
      ),
      p(
        'Perhatikan batas dua puluh percobaan pada perulangan itu. Tanpa batas, kegagalan pada proses pengisi akan membuat seluruh permintaan lain menggantung tanpa akhir, dan itu mengubah masalah kecil menjadi pemadaman total. Jalan keluar terakhirnya adalah mengambil sendiri, yang berarti dalam keadaan terburuk perilakunya kembali seperti tanpa kunci sama sekali, bukan lebih buruk.',
      ),
      h2('Menutupnya dengan penyegaran lebih awal'),
      p(
        'Cara kedua menghindari kekosongan sama sekali, yaitu dengan menyegarkan isi cache sebelum masa berlakunya benar-benar habis, sementara permintaan tetap dilayani dengan isi lama.',
      ),
      code(
        'js',
        `
        // Simpan nilai bersama waktu kedaluwarsa lunaknya.
        async function ambilDenganPenyegaranAwal(kunci, ambilDariSumber, opsi) {
          const { segarDetik, simpanDetik } = opsi; // mis. 300 dan 600
          const mentah = await redis.get(kunci);

          if (mentah !== null) {
            const { nilai, kedaluwarsaLunak } = JSON.parse(mentah);

            if (Date.now() < kedaluwarsaLunak) return nilai;

            // Sudah lewat batas lunak. Kembalikan yang lama SEKARANG,
            // dan segarkan di latar tanpa membuat pemanggil menunggu.
            segarkanDiLatar(kunci, ambilDariSumber, opsi);
            return nilai;
          }

          const baru = await ambilDariSumber();
          await simpan(kunci, baru, segarDetik, simpanDetik);
          return baru;
        }
        `,
        {
          caption:
            'Pola yang sama dengan stale-while-revalidate pada HTTP, dipindahkan ke lapisan aplikasi.',
        },
      ),
      p(
        'Cara ini punya sifat yang sangat baik, yaitu tidak ada satu pun permintaan yang pernah menunggu pengisian. Harganya adalah data yang disajikan bisa sedikit lebih basi daripada TTL yang tertulis, dan ada satu penyegaran yang berjalan di latar. Untuk halaman yang sangat panas, harga itu hampir selalu sepadan.',
      ),

      h2('Masalah kedua, hot key'),
      p(
        'Ketika cache tersebar di beberapa simpul, kunci dipetakan ke simpul berdasarkan hasil hitungan. Selama lalu lintasnya merata, pembagiannya juga merata. Masalah muncul ketika satu kunci menjadi jauh lebih panas daripada yang lain.',
      ),
      code(
        'text',
        `
        Simpul 1    2.000 operasi/detik   berisi kunci tulisan yang sedang viral
        Simpul 2      120 operasi/detik
        Simpul 3      140 operasi/detik

        Simpul 1 menjadi bottleneck, dua simpul lain menganggur.
        `,
      ),
      p('Ada tiga jawaban, dan yang pertama paling sering cukup.'),
      table(
        ['Cara', 'Bagaimana', 'Kekurangan'],
        [
          [
            'Cache di dalam proses',
            'Simpan kunci yang sangat panas di memori aplikasi dengan TTL sangat pendek',
            'Tiap mesin bisa punya versi berbeda selama beberapa detik',
          ],
          [
            'Menggandakan kunci',
            'Simpan sebagai `kunci#1` sampai `kunci#N`, lalu pilih acak saat membaca',
            'Invalidasi harus menghapus semua salinannya',
          ],
          [
            'Replika baca pada cache',
            'Beberapa salinan simpul yang sama melayani baca',
            'Perlu dukungan dari pemasangan Redis-nya',
          ],
        ],
      ),
      code(
        'js',
        `
        // Cache dua tingkat: memori proses di depan Redis.
        const memoriLokal = new Map(); // kunci -> { nilai, kedaluwarsa }
        const TTL_LOKAL_MS = 3_000;

        async function ambilDuaTingkat(kunci, ambilDariSumber) {
          const lokal = memoriLokal.get(kunci);
          if (lokal !== undefined && lokal.kedaluwarsa > Date.now()) return lokal.nilai;

          const nilai = await ambilDenganKunci(kunci, ambilDariSumber);
          memoriLokal.set(kunci, { nilai, kedaluwarsa: Date.now() + TTL_LOKAL_MS });
          return nilai;
        }
        `,
      ),
      p(
        'Tiga detik terlihat sangat pendek dan justru di situlah kekuatannya. Pada dua ribu permintaan per detik, tiga detik berarti enam ribu permintaan dilayani dari memori proses dan hanya satu yang menyentuh Redis. Sementara itu, data yang basi paling lama tiga detik hampir tidak pernah menjadi masalah untuk data yang sifatnya memang panas dan publik.',
      ),
      callout(
        'warning',
        'Cache di dalam proses mengembalikan sedikit sifat stateful',
        'Setiap mesin akan punya salinannya sendiri, jadi selama beberapa detik tiga mesin bisa menyajikan tiga versi yang sedikit berbeda. Ini bisa diterima untuk jumlah pembaca atau daftar populer, dan tidak bisa diterima untuk apa pun yang harus konsisten. Pakai hanya untuk data yang memang boleh berbeda sesaat, dan jangan pernah untuk hak akses.',
      ),

      h2('Masalah ketiga, cache penetration'),
      p(
        'Cache hanya menyimpan hasil yang ada. Permintaan untuk sesuatu yang tidak ada tidak pernah menghasilkan apa pun untuk disimpan, sehingga permintaan itu selalu diteruskan ke database.',
      ),
      code(
        'js',
        `
        // Celahnya ada di sini.
        const tersimpan = await redis.get('tulisan:v1:' + slug);
        if (tersimpan !== null) return JSON.parse(tersimpan);

        const tulisan = await db.tulisan.cariBerdasarkanSlug(slug);
        if (tulisan === null) return null; // <- tidak menyimpan apa-apa

        await redis.set('tulisan:v1:' + slug, JSON.stringify(tulisan), 'EX', 300);
        return tulisan;
        `,
      ),
      p(
        'Seseorang yang meminta seribu slug acak per detik akan mengirim seribu query per detik ke database, dan tidak satu pun dari permintaan itu bisa dicegah cache. Ini bukan sekadar teori, melainkan pola yang benar-benar dipakai untuk membebani layanan.',
      ),
      p('Perbaikannya adalah menyimpan ketiadaan itu sendiri sebagai hasil.'),
      code(
        'js',
        `
        const PENANDA_KOSONG = '\\u0000kosong';
        const TTL_KOSONG_DETIK = 60; // jauh lebih pendek daripada TTL biasa

        const tersimpan = await redis.get(kunci);
        if (tersimpan === PENANDA_KOSONG) return null;
        if (tersimpan !== null) return JSON.parse(tersimpan);

        const tulisan = await db.tulisan.cariBerdasarkanSlug(slug);

        if (tulisan === null) {
          await redis.set(kunci, PENANDA_KOSONG, 'EX', TTL_KOSONG_DETIK);
          return null;
        }

        await redis.set(kunci, JSON.stringify(tulisan), 'EX', 300);
        return tulisan;
        `,
        {
          caption:
            'TTL untuk ketiadaan sengaja pendek, agar data yang baru dibuat tidak lama dianggap tidak ada.',
        },
      ),
      p(
        'Nilai TTL yang pendek pada penanda kosong itu adalah pertukaran yang disengaja. Kalau seseorang membuat tulisan dengan slug yang sebelumnya pernah diminta, ia tidak perlu menunggu lima menit sampai tulisannya terlihat, cukup satu menit. Kalau ingin lebih tepat, hapus penanda kosong itu pada saat pembuatan.',
      ),
      p(
        'Untuk kasus dengan jumlah kemungkinan yang sangat besar, filter Bloom bisa menahan permintaan sebelum menyentuh cache maupun database. Redis menyediakan struktur ini lewat modulnya, dan ia menjawab "pasti tidak ada" dengan biaya memori yang sangat kecil.',
      ),

      h2('Masalah keempat, cold cache'),
      p(
        'Sebuah cache yang baru dimulai tidak berisi apa pun. Selama beberapa saat sesudahnya, seluruh beban yang selama ini ditahan cache jatuh ke database sekaligus.',
      ),
      p(
        'Kalau sistemmu sudah bergantung pada hit ratio sembilan puluh persen, maka cold cache berarti beban database mendadak menjadi sepuluh kali lipat. Sistem yang sehari-hari terlihat sangat lapang bisa tumbang dalam hitungan detik.',
      ),
      table(
        ['Pemicu cold cache', 'Cara mengurangi dampaknya'],
        [
          [
            'Restart Redis untuk pembaruan',
            'Lakukan di luar jam sibuk, dan aktifkan penyimpanan ke disk agar isinya kembali',
          ],
          [
            'Memindahkan cache ke instance baru',
            'Panaskan lebih dulu dengan menjalankan query untuk kunci terpanas',
          ],
          [
            'Menaikkan nomor versi kunci',
            'Naikkan bertahap per jenis data, bukan seluruhnya sekaligus',
          ],
          [
            'Eviction policy membuang terlalu banyak',
            'Perbesar memori, atau perpendek TTL agar isinya lebih relevan',
          ],
        ],
      ),
      code(
        'js',
        `
        // Pemanasan sederhana: isi kunci terpanas sebelum lalu lintas dialihkan.
        async function panaskanCache() {
          const terpopuler = await db.tulisan.ambilTerpopuler({ batas: 500 });
          for (const tulisan of terpopuler) {
            await redis.set(
              'tulisan:v1:' + tulisan.slug,
              JSON.stringify(tulisan),
              'EX',
              300,
            );
          }
          logger.info({ jumlah: terpopuler.length }, 'cache dipanaskan');
        }
        `,
      ),
      p(
        'Pemanasan seperti ini paling tepat dijalankan sebagai bagian dari kesiapan, yaitu sebelum endpoint `/readyz` menjawab siap. Dengan begitu, load balancer tidak akan mengirim lalu lintas ke mesin yang cachenya masih dingin, dan urutannya menyambung langsung ke pembahasan di sub-bab [load balancer](/kelas/system-design/blok-penyusun/load-balancer).',
      ),

      h2('Ringkasan empat masalah'),
      table(
        ['Masalah', 'Gejalanya', 'Penutupnya'],
        [
          [
            'Cache stampede',
            'Beban database bergerigi dengan jarak sebesar TTL',
            'Kunci pengisian, atau penyegaran lebih awal',
          ],
          [
            'Hot key',
            'Satu simpul cache jauh lebih sibuk daripada yang lain',
            'Cache di dalam proses, atau menggandakan kunci',
          ],
          [
            'Cache penetration',
            'Banyak permintaan untuk data yang tidak ada',
            'Simpan ketiadaan dengan TTL pendek, atau filter Bloom',
          ],
          [
            'Cold cache',
            'Beban database melonjak sesudah restart cache',
            'Pemanasan sebelum siap, dan restart di luar jam sibuk',
          ],
        ],
      ),
      callout(
        'tip',
        'Keempatnya hanya terlihat dengan pengukuran',
        'Tidak satu pun dari empat masalah ini muncul sebagai error. Semuanya muncul sebagai beban database yang lebih tinggi daripada seharusnya. Pantau hit ratio, beban database, dan pola bergerigi pada grafiknya, karena bentuk grafik sering menjadi petunjuk pertama sebelum ada yang mengeluh.',
      ),

      references(
        {
          label: 'Redis: SET',
          href: 'https://redis.io/docs/latest/commands/set/',
          source: 'Redis',
          note: 'Opsi `NX` dan `PX` yang menjadi dasar kunci pengisian pada sub-bab ini.',
        },
        {
          label: 'Redis: Scripting with Lua',
          href: 'https://redis.io/docs/latest/develop/programmability/eval-intro/',
          source: 'Redis',
          note: 'Cara menjalankan pemeriksaan dan penghapusan sebagai satu operasi atomik.',
        },
        {
          label: 'Redis: Bloom filter',
          href: 'https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/',
          source: 'Redis',
          note: 'Struktur yang menutup cache penetration dengan biaya memori sangat kecil.',
        },
        {
          label: 'Redis: Persistence',
          href: 'https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/',
          source: 'Redis',
          note: 'Pengaturan yang menentukan apakah isi cache kembali sesudah restart.',
        },
      ),
    ],
  ),
  written(
    'antrean-pesan',
    'Message Queue dan Pekerjaan Latar',
    14,
    'Memisahkan menjawab dari mengerjakan, dan menerima bahwa pekerjaan bisa berjalan dua kali.',
    [
      p(
        'Sampai sini semua blok yang dibahas mempercepat jalur permintaan. Antrean melakukan sesuatu yang berbeda, yaitu **mengeluarkan pekerjaan dari jalur permintaan sama sekali**. Permintaan dijawab segera, dan pekerjaannya dilanjutkan oleh proses lain.',
      ),
      p(
        'Kamu sudah memakai BullMQ di sub-bab [antrean BullMQ](/kelas/backend-intermediate/express-intermediate/queue-bullmq) dan Horizon di sub-bab [queue Horizon](/kelas/backend-intermediate/laravel-intermediate/queue-horizon). Sub-bab ini membahas keputusan desain di sekitarnya, yaitu apa yang layak dipindahkan, jaminan pengiriman apa yang sebenarnya kamu dapat, dan apa saja yang harus berubah pada kode karena jaminan itu lebih lemah daripada yang biasanya diduga.',
      ),

      terms(
        {
          term: 'message queue (antrean)',
          meaning:
            'Penampung di antara pengirim dan pengerja, tempat pesan disimpan sampai ada yang mengambilnya. Dibaca "mesij kiu". Pengirim disebut producer dan pengerja disebut consumer atau worker. Keduanya tidak perlu hidup pada saat yang sama, dan itulah inti manfaatnya.',
        },
        {
          term: 'producer dan consumer',
          meaning:
            'Producer adalah pihak yang menaruh pesan ke antrean, biasanya server aplikasi yang sedang melayani permintaan. Consumer adalah pihak yang mengambil dan mengerjakannya, biasanya proses worker terpisah. Keduanya bisa diperbesar sendiri-sendiri, dan itu salah satu keuntungan utamanya.',
        },
        {
          term: 'antrean dan pub/sub',
          meaning:
            'Dua model penyaluran yang berbeda. Pada antrean, satu pesan dikerjakan **satu** consumer saja, cocok untuk pekerjaan. Pada pub/sub, satu pesan diterima **semua** pelanggan, cocok untuk pemberitahuan peristiwa. Salah memilih model menghasilkan pekerjaan yang berjalan berkali-kali atau pemberitahuan yang hanya sampai ke satu pihak.',
        },
        {
          term: 'at-least-once',
          meaning:
            'Jaminan bahwa sebuah pesan akan dikerjakan **minimal** satu kali, dan boleh jadi lebih. Dibaca "et list wans". Ini jaminan yang diberikan hampir semua antrean nyata, dan konsekuensinya wajib diterima, yaitu kode pengerjanya harus aman bila dijalankan ulang.',
        },
        {
          term: 'idempotent',
          meaning:
            'Sifat sebuah operasi yang hasil akhirnya sama sekalipun dijalankan berkali-kali. Dibaca "idempoten". Menetapkan status menjadi `lunas` bersifat idempoten, sedangkan menambah saldo sebesar seratus ribu tidak. Sudah dibahas dari sisi API di sub-bab [idempotency](/kelas/backend-intermediate/desain-api/idempotency), dan di sini ia menjadi syarat, bukan pilihan.',
        },
        {
          term: 'dead letter queue (DLQ)',
          meaning:
            'Tempat penampungan pesan yang sudah gagal berkali-kali dan tidak akan dicoba lagi. Disingkat DLQ. Tanpa DLQ, pesan yang selalu gagal akan dicoba selamanya dan memakan kapasitas worker tanpa henti. Dengan DLQ, pesan itu disingkirkan dan menjadi sinyal yang bisa diperiksa manusia.',
        },
        {
          term: 'exponential backoff',
          meaning:
            'Menunda percobaan ulang dengan jeda yang berlipat, misalnya 1 detik, 2 detik, 4 detik, 8 detik. Tujuannya memberi waktu bagi penyebab kegagalan untuk pulih, sekaligus mencegah percobaan ulang yang justru memperparah keadaan.',
        },
        {
          term: 'queue depth',
          meaning:
            'Jumlah pesan yang sedang menunggu dikerjakan. Angka ini adalah sinyal kesehatan paling jujur untuk sistem berbasis antrean, karena kedalaman yang terus bertambah berarti pengerjaannya lebih lambat daripada pemasukannya, dan keadaan itu tidak akan pulih sendiri.',
        },
        {
          term: 'backpressure',
          meaning:
            'Mekanisme yang memperlambat atau menolak pemasukan baru ketika sistem sudah kewalahan. Dibaca "bekpresyer". Tanpa backpressure, antrean yang tidak tertangani akan tumbuh sampai memori atau disknya habis.',
        },
      ),

      h2('Apa yang layak dipindahkan'),
      p(
        'Tidak semua pekerjaan pantas dipindahkan ke antrean. Yang layak punya tiga ciri sekaligus, dan ketiadaan salah satunya biasanya berarti lebih baik dikerjakan langsung.',
      ),
      ol(
        '**Memakan waktu**, yaitu ratusan milidetik ke atas, sehingga menahan permintaan terasa oleh pengguna',
        '**Hasilnya tidak dibutuhkan seketika**, yaitu pengguna tetap bisa melanjutkan tanpa menunggunya',
        '**Boleh gagal lalu diulang**, yaitu tidak ada kerusakan bila dikerjakan beberapa saat kemudian',
      ),
      table(
        ['Pekerjaan', 'Ke antrean?', 'Alasan'],
        [
          [
            'Mengirim email verifikasi',
            'Ya',
            'Lambat, bergantung layanan luar, dan boleh telat beberapa detik',
          ],
          ['Membuat ukuran kecil gambar', 'Ya', 'Berat di prosesor, dan aslinya sudah tersimpan'],
          [
            'Menyusun laporan bulanan',
            'Ya',
            'Bisa memakan menit, jelas tidak boleh menahan permintaan',
          ],
          [
            'Menyinkronkan data ke layanan luar',
            'Ya',
            'Layanan luar bisa mati, dan percobaan ulang wajar',
          ],
          ['Memperbarui pencarian', 'Ya', 'Basi beberapa detik hampir tidak terasa'],
          [
            'Memotong stok saat checkout',
            '**Tidak**',
            'Harus tepat pada saat itu, dan hasilnya menentukan jawaban',
          ],
          ['Memverifikasi password', '**Tidak**', 'Hasilnya justru yang ditunggu pengguna'],
          ['Menyimpan komentar', 'Tidak', 'Cepat, dan pengguna berharap langsung melihatnya'],
        ],
      ),
      p(
        'Baris pemotongan stok layak dipahami alasannya. Memindahkannya ke antrean berarti pengguna diberi tahu pesanannya berhasil sebelum diketahui stoknya cukup. Kalau ternyata tidak cukup, kamu harus membatalkan pesanan yang sudah dinyatakan berhasil, dan itu jauh lebih buruk daripada menunggu lima puluh milidetik.',
      ),

      h2('Bentuknya pada jalur permintaan'),
      compare(
        {
          title: 'Sinkron, pengguna menunggu semuanya',
          lang: 'js',
          code: `
            app.post('/api/pesanan', async (req, res) => {
              const data = SkemaPesanan.parse(req.body);
              const pesanan = await db.pesanan.buat(data, req.session.penggunaId);

              await kirimEmailKonfirmasi(pesanan);   // ~800 ms
              await buatFakturPdf(pesanan);          // ~1.500 ms
              await sinkronKeGudang(pesanan);        // ~600 ms

              res.status(201).json(pesanan);
            });
          `,
          notes: [
            'Total sekitar 3 detik',
            'Layanan email mati berarti pesanan gagal',
            'Tidak ada percobaan ulang',
          ],
        },
        {
          title: 'Asinkron, pengguna menunggu yang penting saja',
          lang: 'js',
          code: `
            app.post('/api/pesanan', async (req, res) => {
              const data = SkemaPesanan.parse(req.body);
              const pesanan = await db.pesanan.buat(data, req.session.penggunaId);

              await antrean.addBulk([
                { name: 'email-konfirmasi', data: { pesananId: pesanan.id } },
                { name: 'faktur-pdf',       data: { pesananId: pesanan.id } },
                { name: 'sinkron-gudang',   data: { pesananId: pesanan.id } },
              ]);

              res.status(201).json(pesanan);
            });
          `,
          notes: [
            'Total sekitar 60 ms',
            'Layanan email mati tidak menggagalkan pesanan',
            'Percobaan ulang ditangani antrean',
            'Pesan hanya membawa id, bukan salinan datanya',
          ],
        },
      ),
      p(
        'Perhatikan isi pesan pada panel kanan hanya berisi `pesananId`, bukan seluruh objek pesanan. Ini pilihan yang disengaja. Pesan yang hanya membawa penunjuk selalu mengambil data terbaru saat dikerjakan, sedangkan pesan yang membawa salinan bisa mengerjakan data yang sudah usang bila pengerjaannya tertunda. Pesan kecil juga lebih murah disimpan dan dikirim.',
      ),
      callout(
        'warning',
        'Menaruh pesan sesudah menulis database, bukan sebelum',
        'Kalau pesan ditaruh lebih dulu lalu penulisan database gagal, worker akan mencari pesanan yang tidak pernah ada. Urutan yang benar adalah tulis dulu, baru antrekan. Kasus sebaliknya, yaitu penulisan berhasil tetapi pengantrean gagal, tetap mungkin terjadi dan itulah alasan pola outbox ada, yaitu menulis pesan ke tabel dalam transaksi yang sama lalu memindahkannya ke antrean secara berkala.',
      ),

      h2('Jaminan pengiriman yang sebenarnya kamu dapat'),
      table(
        ['Jaminan', 'Artinya', 'Harganya'],
        [
          ['At-most-once', 'Nol atau satu kali', 'Pesan bisa hilang tanpa jejak'],
          ['**At-least-once**', 'Satu kali atau lebih', 'Worker harus tahan dijalankan ulang'],
          [
            'Exactly-once',
            'Tepat satu kali',
            'Sangat mahal, dan pada praktiknya selalu berupa at-least-once ditambah penyaringan duplikat',
          ],
        ],
      ),
      p(
        'Baris tengah adalah yang kamu dapat dari BullMQ, Horizon, SQS, dan hampir semua antrean nyata. Alasannya mendasar dan tidak bisa dihindari. Ketika worker selesai mengerjakan sesuatu lalu mati sebelum sempat menyatakan selesai, antrean tidak punya cara mengetahui apakah pekerjaannya sudah selesai atau belum, sehingga satu-satunya pilihan aman adalah memberikannya lagi kepada worker lain.',
      ),
      p(
        'Karena itu pertanyaan yang benar bukan "bagaimana mencegah pengerjaan ganda", melainkan **"bagaimana membuat pengerjaan ganda tidak merusak apa-apa"**.',
      ),
      compare(
        {
          title: 'Tidak idempoten, berbahaya',
          lang: 'js',
          code: `
            worker.process('email-konfirmasi', async (job) => {
              const pesanan = await db.pesanan.cari(job.data.pesananId);
              await layananEmail.kirim(pesanan.email, templateKonfirmasi(pesanan));
              await db.pesanan.tambahHitunganEmail(pesanan.id); // += 1
            });
          `,
          notes: [
            'Dijalankan dua kali berarti dua email',
            'Hitungannya menjadi salah',
            'Tidak ada cara mengetahui ini sudah pernah dikerjakan',
          ],
        },
        {
          title: 'Idempoten, aman diulang',
          lang: 'js',
          code: `
            worker.process('email-konfirmasi', async (job) => {
              const { pesananId } = job.data;
              const kunciIdem = 'email-konfirmasi:' + pesananId;

              // Tandai lebih dulu. NX memastikan hanya satu yang lolos.
              const pertamaKali = await redis.set(kunciIdem, '1', 'NX', 'EX', 86_400);
              if (pertamaKali !== 'OK') {
                logger.info({ pesananId }, 'email konfirmasi sudah pernah dikirim, dilewati');
                return;
              }

              try {
                const pesanan = await db.pesanan.cari(pesananId);
                await layananEmail.kirim(pesanan.email, templateKonfirmasi(pesanan));
                await db.pesanan.tandaiEmailTerkirim(pesananId); // set, bukan tambah
              } catch (err) {
                // Gagal berarti belum terkirim, jadi izinkan percobaan berikutnya.
                await redis.del(kunciIdem);
                throw err;
              }
            });
          `,
          notes: [
            'Penanda mencegah pengiriman kedua',
            '`tandaiEmailTerkirim` menetapkan nilai, bukan menambah',
            'Penanda dihapus saat gagal agar percobaan ulang tetap bisa berjalan',
          ],
        },
      ),
      p(
        'Blok `catch` pada panel kanan adalah bagian yang paling mudah terlewat. Tanpa penghapusan penanda saat gagal, satu kegagalan sementara pada layanan email akan membuat email itu **tidak pernah** terkirim, karena percobaan berikutnya akan menganggapnya sudah pernah dikirim. Idempotensi yang dipasang tanpa memikirkan unhappy path justru menciptakan bug yang lebih sulit ditemukan daripada masalah aslinya.',
      ),

      h2('Percobaan ulang dan keadaan akhir'),
      p(
        'Setiap pekerjaan butuh dua hal, yaitu aturan percobaan ulang yang exponential backoff, dan keadaan akhir ketika percobaannya habis. Pekerjaan yang dicoba selamanya adalah pemadaman yang berjalan lambat.',
      ),
      code(
        'js',
        `
        await antrean.add(
          'sinkron-gudang',
          { pesananId },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 1_000 }, // 1s, 2s, 4s, 8s, 16s
            removeOnComplete: { age: 3_600, count: 1_000 },
            removeOnFail: false, // simpan yang gagal agar bisa diperiksa
          },
        );

        worker.on('failed', (job, err) => {
          if (job.attemptsMade >= job.opts.attempts) {
            metrics.increment('antrean.habis', { pekerjaan: job.name });
            logger.error(
              { pekerjaan: job.name, id: job.id, data: job.data, err },
              'pekerjaan gagal permanen, dipindahkan untuk diperiksa manusia',
            );
          }
        });
        `,
      ),
      p(
        'Jumlah percobaan yang tepat berbeda menurut jenis kegagalan yang diharapkan. Layanan luar yang sesekali tersendat pantas dicoba lima kali dengan jeda berlipat. Kegagalan yang disebabkan data yang tidak sah tidak akan pernah berhasil berapa kali pun dicoba, sehingga lebih baik langsung dipindahkan ke DLQ pada percobaan pertama. Membedakan keduanya di dalam kode worker membuat antrean tidak terisi pekerjaan yang mustahil berhasil.',
      ),
      code(
        'js',
        `
        import { UnrecoverableError } from 'bullmq';

        worker.process('sinkron-gudang', async (job) => {
          const pesanan = await db.pesanan.cari(job.data.pesananId);

          // Kegagalan permanen: tidak ada gunanya dicoba lagi.
          if (pesanan === null) {
            throw new UnrecoverableError('pesanan tidak ditemukan: ' + job.data.pesananId);
          }

          // Kegagalan sementara: lempar biasa agar dicoba ulang.
          await gudang.kirim(pesanan);
        });
        `,
      ),

      h2('Antrean atau pub/sub'),
      p(
        'Salah memilih di antara keduanya menghasilkan kesalahan yang gejalanya membingungkan, jadi perbedaannya layak ditegaskan.',
      ),
      table(
        ['', 'Antrean', 'Pub/sub'],
        [
          ['Siapa yang menerima satu pesan', 'Satu consumer saja', 'Semua pelanggan'],
          [
            'Dipakai untuk',
            'Pekerjaan yang harus dikerjakan sekali',
            'Peristiwa yang perlu diketahui banyak pihak',
          ],
          [
            'Menambah consumer berarti',
            'Pekerjaan dibagi, jadi lebih cepat',
            'Setiap pesan diproses satu kali lagi',
          ],
          ['Contoh', 'Kirim email, buat PDF', 'Beri tahu bahwa pesanan dibuat'],
          ['Wujud di stack ini', 'BullMQ, Horizon', 'Redis Pub/Sub, adapter Socket.IO'],
        ],
      ),
      p(
        'Kesalahan khas yang muncul dari salah pilih, yaitu memakai pub/sub untuk mengirim email lalu menambah worker kedua, dan tiba-tiba semua pengguna menerima dua email. Gejala itu terlihat seperti bug pada kode email, padahal penyebabnya ada pada pemilihan model penyaluran.',
      ),
      p(
        'Ada juga model ketiga yang menggabungkan keduanya, yaitu log terdistribusi seperti Apache Kafka. Di sana pesan disimpan berurutan dan tidak dihapus setelah dibaca, sehingga beberapa kelompok consumer bisa membaca aliran yang sama secara mandiri, dan sebuah kelompok bisa mengulang pembacaan dari titik mana pun. Model itu sangat berguna untuk aliran peristiwa berskala besar, dan ia menambah beban operasional yang tidak sepadan untuk aplikasi berukuran wajar.',
      ),

      h2('Memantau antrean'),
      p(
        'Antrean punya satu sifat yang membuatnya berbahaya bila tidak dipantau, yaitu kegagalannya tidak terlihat oleh pengguna. Permintaan tetap dijawab dengan sukses, dan pekerjaannya diam-diam menumpuk.',
      ),
      table(
        ['Angka', 'Sehat bila', 'Artinya bila tidak'],
        [
          [
            'Kedalaman antrean',
            'Naik turun dan kembali mendekati nol',
            'Terus naik berarti worker tidak sanggup mengejar',
          ],
          [
            'Usia pesan tertua',
            'Di bawah target yang kamu tetapkan',
            'Ada pekerjaan yang tertinggal jauh',
          ],
          ['Laju kegagalan', 'Mendekati nol', 'Ada ketergantungan yang sedang bermasalah'],
          [
            'Isi DLQ',
            'Kosong, atau bertambah sangat pelan',
            'Ada kelas kegagalan yang belum ditangani',
          ],
          ['Lama pengerjaan', 'Stabil', 'Melebar berarti ada yang melambat'],
        ],
      ),
      p(
        'Dari lima angka itu, **usia pesan tertua** adalah yang paling berguna untuk alert. Kedalaman antrean bisa menyesatkan karena sepuluh ribu pekerjaan ringan bisa habis dalam beberapa detik, sedangkan sepuluh pekerjaan berat bisa bertahan berjam-jam. Usia pesan tertua langsung menjawab pertanyaan yang sesungguhnya, yaitu berapa lama sesuatu sudah menunggu.',
      ),
      callout(
        'danger',
        'Antrean yang tumbuh tanpa batas akan menghabiskan penyimpanannya',
        'Ketika laju pemasukan melebihi laju pengerjaan, antrean tumbuh sampai memori atau disknya habis, dan pada saat itu bukan hanya antrean yang mati. Kalau antreanmu berada di Redis yang sama dengan cache, habisnya memori akan membuang isi cache juga. Pasang alert pada kedalaman antrean, batasi laju pemasukan pada sumber yang bisa membanjir, dan pertimbangkan memisahkan instance antrean dari instance cache.',
      ),

      h2('Menskalakan worker'),
      p(
        'Kelebihan yang sering luput adalah worker bisa diperbesar secara terpisah dari server aplikasi, dan dengan aturan yang berbeda.',
      ),
      table(
        ['Ukuran', 'Untuk server aplikasi', 'Untuk worker'],
        [
          [
            'Dasar penskalaan',
            'QPS dan pemakaian prosesor',
            'Kedalaman antrean dan usia pesan tertua',
          ],
          [
            'Jumlah minimum',
            'Dua, agar tetap hidup saat satu mati',
            'Bisa nol untuk antrean yang jarang terpakai',
          ],
          ['Waktu tanggap', 'Harus cepat, pengguna menunggu', 'Boleh beberapa menit'],
          ['Pemisahan', 'Biasanya satu kelompok', 'Sebaiknya per jenis pekerjaan'],
        ],
      ),
      p(
        'Baris terakhir layak dikerjakan sejak awal. Satu antrean bercampur berarti seribu pekerjaan pembuatan PDF yang lambat akan menahan email verifikasi yang seharusnya terkirim dalam hitungan detik. Memisahkan menjadi antrean cepat dan antrean lambat, masing-masing dengan kelompok workernya sendiri, menghilangkan seluruh kelas masalah itu dengan satu keputusan.',
      ),

      references(
        {
          label: 'BullMQ: Retrying failing jobs',
          href: 'https://docs.bullmq.io/guide/retrying-failing-jobs',
          source: 'BullMQ',
          note: 'Aturan percobaan ulang, exponential backoff, dan kegagalan yang tidak bisa dipulihkan.',
        },
        {
          label: 'BullMQ: Idempotence',
          href: 'https://docs.bullmq.io/guide/jobs/idempotence',
          source: 'BullMQ',
          note: 'Pernyataan resmi bahwa pekerjaan bisa berjalan lebih dari sekali.',
        },
        {
          label: 'Redis: Pub/Sub',
          href: 'https://redis.io/docs/latest/develop/interact/pubsub/',
          source: 'Redis',
          note: 'Model penyiaran, beserta catatan bahwa pesannya tidak disimpan.',
        },
        {
          label: 'Apache Kafka: Introduction',
          href: 'https://kafka.apache.org/documentation/#introduction',
          source: 'Apache Kafka',
          note: 'Model log terdistribusi sebagai pembanding antrean dan pub/sub.',
        },
        {
          label: 'Laravel: Queues',
          href: 'https://laravel.com/docs/12.x/queues',
          source: 'Laravel',
          note: 'Padanan seluruh pola di sub-bab ini pada sisi Laravel.',
        },
      ),
    ],
  ),

  written(
    'consistent-hashing',
    'Consistent Hashing',
    12,
    'Cara membagi kunci ke banyak simpul tanpa mengacak semuanya saat jumlah simpulnya berubah.',
    [
      p(
        'Sub-bab penutup bab ini membahas satu teknik yang muncul di banyak tempat sekaligus, yaitu di kelompok cache, di pembagian database, di pengarahan CDN, dan di pemilihan server oleh load balancer. Teknik itu menjawab satu pertanyaan yang terlihat sepele, yaitu bagaimana memutuskan kunci ini disimpan di simpul yang mana.',
      ),
      p(
        'Jawaban naif untuk pertanyaan itu bekerja dengan baik sampai jumlah simpulnya berubah, dan pada saat itu ia gagal dengan cara yang cukup buruk untuk menjatuhkan sistem.',
      ),

      terms(
        {
          term: 'hash',
          meaning:
            'Fungsi yang mengubah masukan berapa pun panjangnya menjadi angka dengan rentang tetap. Dibaca "hes". Sifat yang dipakai di sini ada dua, yaitu masukan yang sama selalu menghasilkan angka yang sama, dan masukan yang berbeda tersebar merata di seluruh rentang.',
        },
        {
          term: 'pembagian modulo',
          meaning:
            'Cara paling sederhana memetakan hash ke simpul, yaitu `simpul = hash(kunci) % jumlah_simpul`. Bekerja sempurna selama jumlah simpulnya tetap, dan runtuh begitu jumlahnya berubah karena hasil pembagiannya berubah untuk hampir semua kunci.',
        },
        {
          term: 'consistent hashing',
          meaning:
            'Cara memetakan kunci ke simpul sedemikian rupa sehingga penambahan atau pengurangan satu simpul hanya memindahkan sebagian kecil kunci, bukan hampir semuanya. Dibaca "konsisten hesying". Gagasannya menempatkan simpul dan kunci pada satu lingkaran angka yang sama.',
        },
        {
          term: 'hash ring',
          meaning:
            'Rentang seluruh nilai hash yang dibayangkan melingkar, yaitu nilai tertinggi bersebelahan dengan nilai nol. Simpul ditempatkan pada titik-titik di lingkaran itu, dan setiap kunci menjadi milik simpul pertama yang ditemukan bila berjalan searah jarum jam dari posisi kunci itu.',
        },
        {
          term: 'virtual node (vnode)',
          meaning:
            'Menempatkan satu simpul fisik pada banyak titik di cincin, bukan satu titik. Disebut juga vnode. Tujuannya membuat pembagian menjadi merata, karena dengan sedikit titik saja pembagiannya bisa sangat timpang secara kebetulan.',
        },
        {
          term: 'rebalancing',
          meaning:
            'Perpindahan data yang terjadi ketika susunan simpul berubah. Dibaca "ribalensing". Ukuran keberhasilan sebuah skema pembagian adalah seberapa sedikit data yang harus berpindah saat rebalancing, dan di situlah consistent hashing jauh mengungguli modulo.',
        },
      ),

      h2('Kenapa modulo gagal'),
      p(
        'Mulai dari cara yang paling wajar. Ada tiga simpul cache dan kunci dibagi dengan sisa pembagian.',
      ),
      code(
        'text',
        `
        simpul = hash(kunci) % 3

        kunci "tulisan:a"  hash 1001  ->  1001 % 3 = 2  -> simpul 2
        kunci "tulisan:b"  hash 1002  ->  1002 % 3 = 0  -> simpul 0
        kunci "tulisan:c"  hash 1003  ->  1003 % 3 = 1  -> simpul 1
        `,
      ),
      p('Sekarang tambahkan satu simpul sehingga jumlahnya menjadi empat.'),
      code(
        'text',
        `
        simpul = hash(kunci) % 4

        kunci "tulisan:a"  hash 1001  ->  1001 % 4 = 1  -> simpul 1  (berubah)
        kunci "tulisan:b"  hash 1002  ->  1002 % 4 = 2  -> simpul 2  (berubah)
        kunci "tulisan:c"  hash 1003  ->  1003 % 4 = 3  -> simpul 3  (berubah)
        `,
      ),
      p(
        'Ketiganya berpindah. Secara umum, mengubah jumlah simpul dari N menjadi N tambah satu membuat sekitar N dibagi N tambah satu bagian dari seluruh kunci berpindah tempat. Untuk tiga simpul menjadi empat, itu berarti sekitar tiga perempat kunci.',
      ),
      p(
        'Akibatnya berbeda menurut apa yang dibagi. Untuk kelompok cache, seluruh kunci yang berpindah menjadi miss sekaligus, sehingga beban database melonjak persis seperti cold cache yang dibahas di sub-bab sebelumnya. Untuk database yang di-shard, akibatnya jauh lebih parah, karena datanya benar-benar harus dipindahkan secara fisik sebelum sistem bisa berjalan lagi.',
      ),
      callout(
        'danger',
        'Menambah simpul cache pada jam sibuk dengan modulo bisa menjatuhkan sistem',
        'Menambah satu simpul terasa seperti tindakan yang menambah kapasitas. Dengan modulo, tindakan itu justru membuang tiga perempat isi cache pada saat yang sama, sehingga beban database melonjak berkali-kali lipat tepat ketika kamu menambah kapasitas karena sedang kewalahan. Ini contoh khas perbaikan yang memperburuk keadaan.',
      ),

      h2('Gagasan cincinnya'),
      p(
        'Consistent hashing mengganti pembagian dengan penempatan. Bayangkan seluruh kemungkinan nilai hash disusun melingkar, dari nol sampai nilai maksimum, lalu nilai maksimum bertemu kembali dengan nol.',
      ),
      code(
        'text',
        `
                        0
                        |
              S3 ------ + ------ S1
             /                     \\
            |                       |
            |         cincin        |
            |                       |
             \\                     /
              ------- S2 ----------

        Aturan: sebuah kunci menjadi milik simpul PERTAMA yang ditemukan
        bila berjalan searah jarum jam dari posisi kunci itu.
        `,
      ),
      steps(
        {
          title: 'Tempatkan simpul di cincin',
          body: 'Hitung hash dari nama tiap simpul, misalnya `cache-1`, lalu tempatkan pada posisi hasil hash itu.',
        },
        {
          title: 'Tempatkan kunci di cincin',
          body: 'Hitung hash dari kunci dengan fungsi yang sama, lalu bayangkan ia berada pada posisi itu.',
        },
        {
          title: 'Berjalan searah jarum jam',
          body: 'Simpul pertama yang ditemui adalah pemilik kunci itu. Aturan ini tidak menyebut jumlah simpul sama sekali, dan di situlah letak kekuatannya.',
        },
      ),
      p(
        'Karena aturannya tidak menyebut jumlah simpul, penambahan simpul tidak mengubah pemilik kunci mana pun kecuali kunci yang kebetulan berada tepat sebelum simpul baru itu.',
      ),
      code(
        'text',
        `
        SEBELUM
        S1 pada 100, S2 pada 200, S3 pada 300
        kunci pada 150 -> berjalan searah jarum jam -> S2
        kunci pada 250 -> S3
        kunci pada 350 -> berputar melewati 0 -> S1

        SESUDAH menambah S4 pada posisi 170
        kunci pada 150 -> S4   (berpindah, karena S4 kini lebih dekat)
        kunci pada 250 -> S3   (tidak berubah)
        kunci pada 350 -> S1   (tidak berubah)

        Hanya kunci di antara 100 dan 170 yang berpindah, yaitu sekitar 1/N.
        `,
      ),

      h2('Kenapa virtual node dibutuhkan'),
      p(
        'Dengan hanya beberapa simpul, penempatan mereka di cincin bisa sangat tidak merata secara kebetulan.',
      ),
      code(
        'text',
        `
        S1 pada 10, S2 pada 20, S3 pada 30, dari rentang 0 sampai 1000

        S1 memiliki 940 sampai 10  ->  sekitar 7 persen
        S2 memiliki 10 sampai 20   ->  sekitar 1 persen
        S3 memiliki 20 sampai 30   ->  sekitar 1 persen
        ... dan sisanya yang sangat besar juga milik S1

        Hasilnya S1 memikul hampir seluruh beban.
        `,
      ),
      p(
        'Jawabannya adalah menempatkan tiap simpul fisik pada banyak titik. Alih-alih menghitung hash dari `cache-1` saja, hitung juga hash dari `cache-1#0` sampai `cache-1#149`, lalu tempatkan seluruhnya. Dengan ratusan titik per simpul, sebaran kepemilikan menjadi jauh lebih merata karena hukum bilangan besar mulai bekerja.',
      ),
      code(
        'js',
        `
        import { createHash } from 'node:crypto';

        function hash32(teks) {
          // Ambil 4 bita pertama dari sha1 sebagai angka 32 bit.
          return createHash('sha1').update(teks).digest().readUInt32BE(0);
        }

        class CincinHash {
          #titik = []; // { posisi, simpul }, selalu terurut menaik
          #jumlahVirtual;

          constructor(simpulAwal = [], jumlahVirtual = 150) {
            this.#jumlahVirtual = jumlahVirtual;
            for (const simpul of simpulAwal) this.tambah(simpul);
          }

          tambah(simpul) {
            for (let i = 0; i < this.#jumlahVirtual; i++) {
              this.#titik.push({ posisi: hash32(simpul + '#' + i), simpul });
            }
            this.#titik.sort((a, b) => a.posisi - b.posisi);
          }

          hapus(simpul) {
            this.#titik = this.#titik.filter((titik) => titik.simpul !== simpul);
          }

          cari(kunci) {
            if (this.#titik.length === 0) return null;
            const posisi = hash32(kunci);

            // Pencarian biner untuk titik pertama yang posisinya >= posisi kunci.
            let kiri = 0;
            let kanan = this.#titik.length - 1;
            while (kiri < kanan) {
              const tengah = Math.floor((kiri + kanan) / 2);
              if (this.#titik[tengah].posisi < posisi) kiri = tengah + 1;
              else kanan = tengah;
            }

            const kandidat = this.#titik[kiri];
            // Bila posisi kunci melewati titik terakhir, berputar kembali ke awal.
            return kandidat.posisi >= posisi ? kandidat.simpul : this.#titik[0].simpul;
          }
        }
        `,
        {
          caption:
            'Baris terakhir adalah bagian "melingkar" yang membuat cincinnya benar-benar cincin.',
        },
      ),
      p(
        'Angka 150 pada `jumlahVirtual` bukan angka keramat, melainkan nilai yang lazim dipakai karena memberi sebaran yang cukup merata tanpa membuat daftar titiknya terlalu besar. Dengan sepuluh simpul, daftar itu berisi seribu lima ratus titik, dan pencarian biner atas seribu lima ratus titik memakan waktu yang tidak berarti.',
      ),

      h2('Membuktikan bahwa ia benar-benar lebih baik'),
      code(
        'js',
        `
        // Bandingkan berapa banyak kunci yang berpindah saat simpul bertambah.
        const kunci = Array.from({ length: 100_000 }, (_, i) => 'kunci:' + i);

        // Modulo
        const sebelumModulo = kunci.map((k) => hash32(k) % 3);
        const sesudahModulo = kunci.map((k) => hash32(k) % 4);
        const pindahModulo = kunci.filter((_, i) => sebelumModulo[i] !== sesudahModulo[i]).length;

        // Cincin
        const cincin = new CincinHash(['s1', 's2', 's3']);
        const sebelumCincin = kunci.map((k) => cincin.cari(k));
        cincin.tambah('s4');
        const sesudahCincin = kunci.map((k) => cincin.cari(k));
        const pindahCincin = kunci.filter((_, i) => sebelumCincin[i] !== sesudahCincin[i]).length;

        console.log('modulo berpindah:', pindahModulo); // sekitar 75.000
        console.log('cincin berpindah:', pindahCincin); // sekitar 25.000
        `,
      ),
      table(
        ['Perubahan', 'Modulo', 'Consistent hashing'],
        [
          ['3 simpul menjadi 4', 'sekitar 75 persen kunci berpindah', 'sekitar 25 persen'],
          ['4 simpul menjadi 5', 'sekitar 80 persen', 'sekitar 20 persen'],
          ['10 simpul menjadi 11', 'sekitar 91 persen', 'sekitar 9 persen'],
          ['100 simpul menjadi 101', 'sekitar 99 persen', 'sekitar 1 persen'],
        ],
      ),
      p(
        'Perhatikan arah kedua kolomnya. Pada modulo, semakin besar sistemnya semakin buruk akibat penambahan satu simpul. Pada consistent hashing, semakin besar sistemnya semakin kecil akibatnya. Sifat itulah yang membuat teknik ini menjadi dasar hampir semua sistem penyimpanan terdistribusi.',
      ),

      h2('Di mana ia sudah dipakai tanpa kamu menuliskannya'),
      table(
        ['Sistem', 'Bentuk pemakaiannya'],
        [
          [
            'Redis Cluster',
            'Memakai 16.384 hash slot yang dibagikan ke simpul, gagasan yang sama dengan virtual node',
          ],
          ['Cassandra dan DynamoDB', 'Cincin token untuk menentukan simpul pemilik sebuah partisi'],
          ['Kelompok Memcached', 'Library klien memilih simpul dengan hash ring'],
          ['CDN', 'Memilih server edge yang menyimpan sebuah objek'],
          ['Nginx', 'Direktif `hash ... consistent` pada blok upstream'],
        ],
      ),
      p(
        'Baris pertama layak dicatat. Redis Cluster tidak menempatkan simpul langsung di cincin, melainkan membagi rentang menjadi 16.384 potongan tetap yang disebut hash slot, lalu membagikan potongan itu ke simpul. Hasilnya setara, dengan kelebihan tambahan bahwa perpindahan bisa dilakukan per potongan secara terkendali, dan itu jauh lebih mudah dioperasikan.',
      ),
      code(
        'text',
        `
        upstream cache {
            hash $request_uri consistent;

            server 10.0.2.11:11211;
            server 10.0.2.12:11211;
            server 10.0.2.13:11211;
        }
        `,
        {
          filename: 'nginx.conf',
          caption: 'Kata `consistent` di baris pertama itulah seluruh isi sub-bab ini.',
        },
      ),

      h2('Kapan kamu benar-benar perlu menulisnya sendiri'),
      p(
        'Hampir tidak pernah. Kalau kamu memakai Redis Cluster, ia sudah menanganinya. Kalau kamu memakai Nginx untuk mengarahkan ke kelompok cache, satu kata pada konfigurasi sudah cukup. Kalau kamu memakai basis data terdistribusi, pembagiannya sudah ada di dalamnya.',
      ),
      p(
        'Nilai sub-bab ini bukan pada penerapannya, melainkan pada **kemampuan mengenali kapan pembagian menjadi masalah**. Ketika kamu melihat konfigurasi yang membagi dengan modulo, atau ketika penambahan satu simpul cache membuat beban database melonjak, kamu sekarang tahu apa yang sedang terjadi dan tahu nama solusinya.',
      ),
      p(
        'Teknik ini juga menjadi pijakan langsung untuk Bab 3, karena pemilihan shard pada database memakai pertanyaan yang persis sama, hanya dengan taruhan yang jauh lebih besar. Memindahkan isi cache berarti beberapa menit dengan hit ratio rendah, sedangkan memindahkan isi database berarti memindahkan data sungguhan yang harus tetap benar sepanjang perpindahannya.',
      ),

      references(
        {
          label: 'Redis: Cluster specification',
          href: 'https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/',
          source: 'Redis',
          note: 'Penjelasan resmi 16.384 hash slot dan cara potongan dipindahkan antar simpul.',
        },
        {
          label: 'Cassandra: Dynamo-style architecture',
          href: 'https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html',
          source: 'Apache Cassandra',
          note: 'Cincin token dan virtual node pada basis data terdistribusi nyata.',
        },
        {
          label: 'Nginx: ngx_http_upstream_module hash',
          href: 'https://nginx.org/en/docs/http/ngx_http_upstream_module.html',
          source: 'Nginx',
          note: 'Direktif `hash ... consistent` beserta perilakunya saat daftar server berubah.',
        },
        {
          label: 'Node.js: Crypto',
          href: 'https://nodejs.org/api/crypto.html',
          source: 'Node.js',
          note: 'Fungsi hash yang dipakai pada contoh penerapan cincin di sub-bab ini.',
        },
      ),
    ],
  ),
];
