import {
  callout,
  code,
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
 * System Design — Chapter 1, seven lessons.
 *
 * The vocabulary and the arithmetic. Every later chapter picks components; this one teaches how
 * to decide whether a component is needed at all, and how big it has to be.
 *
 * Deliberately front-loads estimation. A reader who can turn "banyak pengguna" into a QPS number
 * can evaluate the rest of the category for themselves, and a reader who cannot will treat every
 * building block as equally mandatory.
 */
export const lessons: LessonDraft[] = [
  written(
    'kenapa-desain-sistem',
    'Kenapa Desain Sistem Ada',
    13,
    'Jarak antara aplikasi yang jalan dan aplikasi yang tetap jalan ketika ramai.',
    [
      p(
        'Sampai titik ini kamu sudah bisa membangun aplikasi fullstack yang utuh. Ada antarmuka React, ada API Express atau Laravel, ada database, ada pipeline yang merilisnya, dan ada pemantauan yang memberi tahu ketika sesuatu mati. Aplikasi itu **jalan**, dan itu pencapaian yang nyata.',
      ),
      p(
        'Kategori ini membahas jarak antara "jalan" dan "tetap jalan". Keduanya terdengar mirip, padahal keduanya adalah dua masalah yang sama sekali berbeda. Aplikasi yang jalan dinilai dengan satu pertanyaan, yaitu apakah fiturnya benar. Aplikasi yang tetap jalan dinilai dengan pertanyaan yang jauh lebih tidak nyaman, yaitu apa yang akan patah lebih dulu kalau penggunanya menjadi seratus kali lipat besok pagi.',
      ),
      p(
        'Pertanyaan kedua itu tidak bisa dijawab dengan menulis kode yang lebih rapi. Ia dijawab dengan **angka** dan dengan **pilihan struktur**, dan itulah dua hal yang diajarkan kategori ini.',
      ),

      terms(
        {
          term: 'system design',
          meaning:
            'Kegiatan memutuskan **bentuk kasar** sebuah sistem sebelum menulis detailnya, yaitu komponen apa saja yang ada, siapa bicara dengan siapa, data disimpan di mana, dan bagian mana yang boleh lambat. Dibaca "sistem disain". Bedanya dengan menulis kode, desain sistem bekerja pada satuan yang lebih besar, yaitu server, database, cache, dan antrean, bukan fungsi dan kelas.',
        },
        {
          term: 'scalability (skalabilitas)',
          meaning:
            'Kemampuan sebuah sistem menampung beban yang lebih besar **dengan menambah sumber daya**, bukan dengan menulis ulang seluruhnya. Dibaca "skeilabiliti". Perhatikan definisi ini tidak berbicara soal cepat. Sistem yang lambat tetapi bisa dibuat sanggup melayani sepuluh kali lipat pengguna hanya dengan menambah mesin adalah sistem yang skalabel, sedangkan sistem yang sangat cepat tetapi mentok di satu mesin tidak.',
        },
        {
          term: 'load (beban)',
          meaning:
            'Ukuran seberapa banyak pekerjaan yang harus dilakukan sistem dalam satu satuan waktu. Beban bukan satu angka tunggal, melainkan gabungan beberapa angka, misalnya berapa permintaan per detik, berapa besar tiap permintaan, berapa banyak data yang tersimpan, dan berapa banyak sambungan yang terbuka bersamaan. Dua sistem dengan jumlah pengguna sama bisa punya beban yang sangat berbeda.',
        },
        {
          term: 'bottleneck',
          meaning:
            'Bagian sistem yang paling dulu kehabisan kapasitas, sehingga seluruh sistem berjalan secepat bagian itu saja. Namanya diambil dari leher botol yang membatasi kecepatan air keluar sekalipun botolnya besar. Sifat penting yang sering dilupakan, yaitu bottleneck tidak pernah hilang. Ia hanya **berpindah** ke bagian berikutnya begitu yang lama diperbesar.',
        },
        {
          term: 'vertical scaling (scale up)',
          meaning:
            'Menambah kapasitas dengan membuat **satu mesin** menjadi lebih besar, yaitu lebih banyak inti prosesor, lebih banyak memori, atau disk yang lebih cepat. Dibaca "vertikal skeiling". Cara ini paling sederhana karena kodenya tidak perlu berubah sama sekali, dan cara ini selalu punya langit-langit karena tidak ada mesin yang bisa dibeli tanpa batas.',
        },
        {
          term: 'horizontal scaling (scale out)',
          meaning:
            'Menambah kapasitas dengan menjalankan **banyak mesin** yang bekerja bersama. Dibaca "horizontal skeiling". Cara ini praktis tanpa langit-langit, tetapi ia menuntut aplikasinya siap dijalankan berkali-kali secara bersamaan, dan tuntutan itulah yang biasanya memaksa perubahan kode.',
        },
        {
          term: 'single point of failure (SPOF)',
          meaning:
            'Satu komponen yang kalau mati membuat seluruh sistem ikut mati. Disingkat SPOF, dibaca "es-pi-o-ef". Aplikasi satu server punya banyak sekali SPOF sekaligus, yaitu servernya, databasenya, dan sambungan jaringannya. Menghilangkan SPOF selalu berarti menyediakan cadangan yang bisa mengambil alih.',
        },
        {
          term: 'trade-off',
          meaning:
            'Pertukaran, yaitu keputusan yang membeli satu keuntungan dengan membayar kerugian di tempat lain. Dibaca "treid of". Dalam desain sistem hampir tidak ada pilihan yang murni lebih baik. Cache membuat baca menjadi cepat dengan harga data yang bisa basi. Replika membuat baca menjadi banyak dengan harga data yang bisa tertinggal. Menyebut harga sebuah keputusan adalah bagian dari keputusannya, bukan tambahan.',
        },
        {
          term: 'distributed (terdistribusi)',
          meaning:
            'Sifat sistem yang bagian-bagiannya berjalan di lebih dari satu mesin dan berkomunikasi lewat jaringan. Dibaca "distribiuted". Begitu sebuah sistem menjadi terdistribusi, muncul kelas masalah baru yang tidak pernah ada di satu mesin, yaitu pesan bisa hilang, mesin bisa mati sendirian, dan dua mesin bisa punya jawaban berbeda untuk pertanyaan yang sama.',
        },
        {
          term: 'capacity (kapasitas)',
          meaning:
            'Batas atas beban yang masih bisa dilayani sebuah komponen dengan mutu yang masih diterima. Perhatikan bagian terakhir kalimat itu. Sebuah database yang secara teknis masih menjawab tetapi butuh sepuluh detik per query sudah melewati kapasitasnya, sekalipun ia belum mati.',
        },
      ),

      h2('Aplikasi yang jalan dan aplikasi yang tetap jalan'),
      p(
        'Bayangkan aplikasi blog yang kamu bangun sepanjang kurikulum ini sudah dirilis. Satu server virtual kecil menjalankan Express, PostgreSQL berada di server yang sama, berkas gambar disimpan di disk lokal, dan Nginx berdiri di depan sebagai reverse proxy seperti yang dibahas di sub-bab [reverse proxy](/kelas/deployment/fondasi-deployment/reverse-proxy).',
      ),
      p(
        'Dengan lima puluh pembaca per hari, susunan ini sempurna. Ia murah, mudah dipahami, mudah di-debug, dan tidak punya satu pun bagian yang tidak kamu mengerti. Tidak ada alasan membuatnya lebih rumit.',
      ),
      p(
        'Sekarang salah satu tulisanmu dibagikan luas dan pembacanya melonjak. Yang menarik bukan bahwa aplikasinya melambat, melainkan **urutan** bagian yang menyerah. Urutan itu hampir selalu sama, dan mengenalinya adalah separuh dari isi kategori ini.',
      ),
      table(
        ['Beban', 'Yang patah lebih dulu', 'Kenapa', 'Jawaban yang biasa dipakai'],
        [
          [
            'Puluhan pengunjung per hari',
            'Tidak ada',
            'Satu mesin jauh lebih besar daripada kebutuhannya',
            'Tidak perlu apa-apa',
          ],
          [
            'Ribuan per hari',
            'Query yang tidak punya index',
            'Satu query lambat menahan sambungan database lebih lama',
            'Index, sesuai sub-bab [key dan index](/kelas/backend-basic/database-sql-dasar/key-index)',
          ],
          [
            'Puluhan ribu per hari',
            'Jumlah sambungan database',
            'Setiap permintaan meminjam satu sambungan, dan jumlahnya terbatas',
            'Pooling dan cache untuk data yang sama',
          ],
          [
            'Ratusan ribu per hari',
            'Prosesor server aplikasi',
            'Render, serialisasi JSON, dan TLS memakan prosesor',
            'Tambah mesin aplikasi di belakang load balancer',
          ],
          [
            'Jutaan per hari',
            'Database sebagai satu-satunya penulis',
            'Semua tulisan tetap harus melewati satu mesin',
            'Replika baca, lalu sharding sebagai jalan terakhir',
          ],
          [
            'Berkas gambar ikut membesar',
            'Disk lokal dan bandwidth server',
            'Gambar jauh lebih besar daripada HTML dan JSON',
            'Object storage dan CDN',
          ],
        ],
        'Urutan ini bukan ramalan, melainkan pola yang berulang karena tiap lapisan punya batas yang berbeda.',
      ),
      p(
        'Perhatikan kolom terakhir. Tidak satu pun jawabannya adalah "tulis ulang aplikasinya". Semuanya adalah **menambahkan satu blok** pada tempat yang tepat, dan blok itu selalu blok yang sama dari daftar yang tidak panjang. Itulah kabar baiknya, yaitu sistem berskala besar dirakit dari komponen yang jumlahnya sedikit dan sudah dikenal, bukan ditemukan ulang setiap kali.',
      ),

      h2('Bottleneck berpindah, tidak hilang'),
      p(
        'Kesalahpahaman yang paling mahal di awal adalah menganggap penskalaan sebagai pekerjaan yang selesai. Ia tidak pernah selesai, karena setiap perbaikan hanya memindahkan batasnya.',
      ),
      p(
        'Contohnya begini. Kamu menambahkan index dan query yang tadinya dua detik menjadi lima milidetik. Beban database turun drastis, dan sekarang server aplikasi yang menjadi sibuk karena ia akhirnya sempat memproses permintaan sebanyak itu. Kamu menambah dua mesin aplikasi, dan sekarang database kembali menjadi sibuk karena tiga mesin menekan satu database. Kamu menambah cache Redis, dan sekarang jaringan antara aplikasi dan Redis yang menjadi ramai.',
      ),
      p(
        'Setiap langkah itu benar dan setiap langkah itu menaikkan kapasitas total. Yang keliru hanyalah harapan bahwa akan ada satu langkah yang membuat masalahnya hilang selamanya. Karena itu pertanyaan yang benar bukan "bagaimana membuat sistem ini cepat", melainkan **"apa yang akan menjadi bottleneck berikutnya, dan berapa jauh lagi jaraknya"**.',
      ),
      callout(
        'tip',
        'Ukur dulu, tebak belakangan',
        'Bottleneck yang sebenarnya sering berbeda dari yang dikira. Sebelum menambah komponen apa pun, lihat angka yang sudah kamu kumpulkan lewat sub-bab [pemantauan](/kelas/deployment/setelah-rilis/monitoring-uptime) dan [observability](/kelas/backend-intermediate/express-intermediate/observability). Menambah cache di depan query yang sebenarnya sudah cepat hanya menambah bagian yang bisa rusak.',
      ),

      h2('Tiga besaran yang dipakai untuk bicara'),
      p(
        'Percakapan desain sistem menjadi kabur ketika dipakai kata sifat, dan menjadi jelas ketika dipakai angka. "Ramai" tidak bisa ditindaklanjuti, sedangkan "sekitar tiga ribu permintaan per detik saat puncak" bisa langsung diubah menjadi jumlah mesin. Ada tiga besaran yang hampir selalu muncul.',
      ),
      table(
        ['Besaran', 'Menjawab pertanyaan', 'Satuan yang lazim', 'Dibahas tuntas di'],
        [
          [
            '**Latensi**',
            'Berapa lama satu permintaan dilayani?',
            'Milidetik, dilaporkan sebagai persentil',
            'Sub-bab 1.5',
          ],
          [
            '**Throughput**',
            'Berapa banyak permintaan yang bisa dilayani per detik?',
            'QPS atau RPS',
            'Sub-bab 1.4',
          ],
          [
            '**Ketersediaan**',
            'Berapa besar bagian waktu sistem benar-benar melayani?',
            'Persen, ditulis sebagai angka sembilan',
            'Sub-bab 1.6',
          ],
        ],
      ),
      p(
        'Ketiganya saling menarik. Menaikkan throughput dengan menumpuk antrean akan menaikkan latensi. Menaikkan ketersediaan dengan menambah replika di wilayah lain akan menaikkan latensi tulis karena datanya harus menyeberang benua. Tidak ada susunan yang memaksimalkan ketiganya sekaligus, dan menyadari itu sejak awal mencegah banyak keputusan yang terdengar bagus tetapi saling membatalkan.',
      ),

      h2('Desain sistem adalah rangkaian pertukaran'),
      p(
        'Hampir setiap teknik di kategori ini adalah pertukaran, bukan peningkatan murni. Menyadari harganya sejak awal membuat kamu memilih dengan sadar, bukan mengikuti apa yang sedang populer.',
      ),
      table(
        ['Teknik', 'Yang dibeli', 'Yang dibayar'],
        [
          [
            'Cache',
            'Baca menjadi jauh lebih cepat dan murah',
            'Data bisa basi, dan ada satu lagi bagian yang bisa rusak',
          ],
          [
            'Replika baca',
            'Kapasitas baca bertambah',
            'Replika bisa tertinggal, sehingga pengguna bisa tidak melihat tulisannya sendiri',
          ],
          [
            'Antrean pesan',
            'Permintaan dijawab cepat dan lonjakan diredam',
            'Hasilnya tidak langsung ada, dan pekerjaan bisa dijalankan dua kali',
          ],
          [
            'Sharding',
            'Kapasitas tulis bertambah',
            'Join dan agregasi lintas shard menjadi mahal atau mustahil',
          ],
          [
            'Denormalisasi',
            'Baca menjadi cepat tanpa join',
            'Satu data hidup di banyak tempat, dan semuanya harus dijaga',
          ],
          [
            'Banyak wilayah',
            'Dekat dengan pengguna dan tahan bencana',
            'Konflik tulis dan biaya operasional yang jauh lebih besar',
          ],
        ],
      ),
      p(
        'Kolom kanan itulah yang biasanya hilang dari percakapan, dan justru kolom kanan yang menentukan apakah sebuah teknik pantas dipakai sekarang. Sepanjang kategori ini, setiap teknik akan selalu disertai kolom kanannya.',
      ),

      h2('Kapan kamu belum membutuhkan semua ini'),
      p(
        'Bagian ini sengaja diletakkan di sub-bab pertama, bukan di akhir, karena kesalahan yang paling sering dilakukan setelah membaca materi desain sistem adalah memakai semuanya sekaligus pada aplikasi yang belum membutuhkannya.',
      ),
      p(
        'Satu server modern jauh lebih kuat daripada yang dibayangkan kebanyakan orang. Satu instance PostgreSQL dengan memori yang cukup dan index yang benar melayani beban yang lebih besar daripada kebutuhan hampir semua aplikasi yang pernah kamu pakai sehari-hari. Menambah antrean, cache, replika, dan sharding pada aplikasi dengan lima ratus pengguna tidak membuatnya lebih tahan, melainkan membuatnya punya lima bagian baru yang bisa rusak dan tidak ada yang benar-benar memahaminya.',
      ),
      callout(
        'danger',
        'Kerumitan yang belum dibutuhkan adalah kerugian murni',
        'Setiap komponen yang ditambahkan membawa biaya yang tidak pernah hilang, yaitu satu lagi hal yang harus dipantau, di-backup, di-update, diamankan, dan dipahami orang berikutnya. Tambahkan sebuah blok ketika kamu bisa menunjuk angka yang menunjukkan blok itu dibutuhkan, bukan ketika kamu membaca bahwa perusahaan besar memakainya.',
      ),
      p(
        'Urutan yang sehat kira-kira seperti ini, dan tiap langkah baru diambil ketika langkah sebelumnya sudah tidak cukup.',
      ),
      ol(
        'Satu server menjalankan semuanya, dengan index yang benar dan query yang sudah diperiksa',
        'Database dipisahkan ke mesinnya sendiri, sehingga keduanya tidak berebut memori',
        'Mesin dinaikkan kelasnya, karena ini langkah termurah yang tidak menyentuh kode sama sekali',
        'Aset statis dan gambar dipindahkan ke object storage dan CDN',
        'Cache dipasang untuk data yang sering dibaca dan jarang berubah',
        'Beberapa mesin aplikasi dijalankan di belakang load balancer',
        'Pekerjaan berat dipindahkan ke antrean dan worker',
        'Replika baca ditambahkan ketika bacanya jauh lebih banyak daripada tulisnya',
        'Sharding dilakukan hanya ketika tulisnya sendiri sudah tidak muat di satu mesin',
      ),
      p(
        'Sembilan langkah itu adalah kerangka Bab 2 dan Bab 3 kategori ini. Kamu tidak akan pernah menjalankan semuanya pada satu aplikasi, dan itu bukan kegagalan. Mengetahui langkah keberapa yang sedang kamu butuhkan justru adalah keahliannya.',
      ),

      h2('Bentuk pertanyaan yang bisa dijawab'),
      p(
        'Sebagai penutup, ada satu kebiasaan kecil yang mengubah cara berpikir. Setiap kali muncul pertanyaan desain, ubah dulu menjadi bentuk yang mengandung angka dan batas.',
      ),
      steps(
        {
          title: 'Dari "apakah perlu cache" menjadi',
          body: 'Berapa persen permintaan menuju data yang sama, seberapa sering data itu berubah, dan berapa lama data basi masih bisa diterima pengguna?',
        },
        {
          title: 'Dari "apakah perlu antrean" menjadi',
          body: 'Berapa lama pekerjaan ini berjalan, apakah pengguna benar-benar harus menunggunya selesai, dan apa yang terjadi kalau pekerjaannya dijalankan dua kali?',
        },
        {
          title: 'Dari "database apa yang harus dipakai" menjadi',
          body: 'Bentuk pertanyaan apa yang akan paling sering diajukan ke data ini, dan apakah ada aturan yang harus dijamin tepat pada saat penulisan?',
        },
        {
          title: 'Dari "apakah sanggup melayani banyak pengguna" menjadi',
          body: 'Berapa permintaan per detik saat puncak, berapa besar tiap responsnya, dan berapa kapasitas satu mesin untuk beban seperti itu?',
        },
      ),
      p(
        'Kolom kanan pada keempat baris itu bisa dijawab. Kolom kirinya tidak. Sub-bab berikutnya membahas cara menyusun kolom kanan itu secara sistematis, dan sub-bab 1.4 membahas cara menghitung angkanya.',
      ),

      references(
        {
          label: 'Site Reliability Engineering: Introduction',
          href: 'https://sre.google/sre-book/introduction/',
          source: 'Google SRE',
          note: 'Pembahasan resmi soal beda antara membangun sistem dan menjaganya tetap hidup.',
        },
        {
          label: 'The Twelve-Factor App',
          href: 'https://12factor.net/',
          source: '12factor',
          note: 'Syarat agar sebuah aplikasi bisa dijalankan berkali-kali secara bersamaan.',
        },
        {
          label: 'Nginx: HTTP Load Balancing',
          href: 'https://nginx.org/en/docs/http/load_balancing.html',
          source: 'Nginx',
          note: 'Bentuk konkret langkah keenam pada daftar penskalaan di sub-bab ini.',
        },
        {
          label: 'PostgreSQL: Resource Consumption',
          href: 'https://www.postgresql.org/docs/current/runtime-config-resource.html',
          source: 'PostgreSQL',
          note: 'Batas sumber daya satu instance, termasuk memori dan jumlah sambungan.',
        },
      ),
    ],
  ),

  written(
    'kebutuhan-fungsional-nonfungsional',
    'Kebutuhan Fungsional dan Non-Fungsional',
    12,
    'Dua daftar yang harus ada sebelum satu komponen pun dipilih.',
    [
      p(
        'Kesalahan paling mahal dalam desain sistem terjadi sebelum satu baris kode ditulis, yaitu ketika seseorang mulai memilih komponen padahal belum jelas sistemnya harus melakukan apa dan sebesar apa. Susunan untuk seribu pengguna dan susunan untuk seratus juta pengguna bukan versi besar dan kecil dari hal yang sama. Keduanya adalah sistem yang berbeda.',
      ),
      p(
        'Karena itu langkah pertama selalu sama, yaitu menyusun dua daftar. Daftar pertama menjawab **apa yang sistem lakukan**, dan daftar kedua menjawab **bagaimana sistem itu harus berperilaku**. Daftar kedua yang paling sering dilewati, dan daftar kedua pula yang paling menentukan bentuk arsitekturnya.',
      ),

      terms(
        {
          term: 'functional requirement',
          meaning:
            'Pernyataan tentang **apa yang bisa dilakukan** sebuah sistem, ditulis dari sudut pandang penggunanya. Contohnya "pengguna bisa memendekkan sebuah alamat" atau "pengguna bisa melihat daftar tulisan orang yang diikutinya". Ciri khasnya, kebutuhan fungsional bisa diuji dengan mencoba fiturnya.',
        },
        {
          term: 'non-functional requirement',
          meaning:
            'Pernyataan tentang **bagaimana** sistem berperilaku ketika menjalankan fungsinya, misalnya secepat apa, sesering apa, seandal apa, dan seaman apa. Kadang disebut juga atribut mutu. Kebutuhan ini tidak bisa diuji dengan mencoba fiturnya sekali, melainkan harus diukur di bawah beban.',
        },
        {
          term: 'DAU (daily active users)',
          meaning:
            'Jumlah pengguna aktif harian, yaitu berapa orang yang benar-benar memakai sistem dalam satu hari. Dibaca "di-ei-yu". Angka ini adalah titik awal hampir semua estimasi, karena hampir semua besaran lain diturunkan darinya. Jangan tertukar dengan jumlah akun terdaftar, yang biasanya jauh lebih besar dan jauh kurang berguna.',
        },
        {
          term: 'MAU (monthly active users)',
          meaning:
            'Jumlah pengguna aktif bulanan. Dipakai untuk melihat ukuran keseluruhan produk, sedangkan DAU dipakai untuk menghitung beban. Perbandingan DAU dibagi MAU sering dipakai sebagai ukuran seberapa lekat sebuah produk, dan nilai sepertiga sudah tergolong sangat tinggi.',
        },
        {
          term: 'percentile (persentil)',
          meaning:
            'Cara melaporkan sebaran angka. P95 sebesar 400 milidetik berarti 95 persen permintaan dilayani dalam 400 milidetik atau kurang, dan 5 persen sisanya lebih lambat dari itu. Dibaca "pi sembilan puluh lima". Persentil dipakai menggantikan rata-rata karena rata-rata menyembunyikan pengguna yang paling menderita.',
        },
        {
          term: 'SLA, SLO, dan SLI',
          meaning:
            'Tiga istilah bertingkat. **SLI** adalah angka yang benar-benar diukur, misalnya persentase permintaan yang berhasil. **SLO** adalah target internal atas angka itu, misalnya 99,9 persen. **SLA** adalah janji kepada pelanggan beserta akibatnya bila dilanggar, misalnya pengembalian dana. SLA selalu lebih longgar daripada SLO, karena tidak ada yang mau berjanji tepat di batas kemampuannya.',
        },
        {
          term: 'strong consistency',
          meaning:
            'Jaminan bahwa setiap pembacaan sesudah sebuah penulisan pasti melihat hasil penulisan itu. Ini perilaku yang kamu kenal dari satu database tunggal di sub-bab [transaksi dan ACID](/kelas/backend-basic/database-sql-dasar/transaksi-acid), dan jaminan ini menjadi mahal begitu datanya tersebar ke banyak mesin.',
        },
        {
          term: 'eventual consistency',
          meaning:
            'Jaminan yang lebih longgar, yaitu semua salinan data **akhirnya** akan sama bila tidak ada penulisan baru, tetapi untuk sementara waktu pembaca bisa melihat versi lama. Dibaca "iventual konsistensi". Ini bukan bug, melainkan pilihan yang ditukar dengan kecepatan dan ketersediaan.',
        },
        {
          term: 'durability',
          meaning:
            'Jaminan bahwa data yang sudah dinyatakan tersimpan tidak akan hilang, sekalipun mesinnya mati mendadak. Ini huruf D pada ACID. Pada sistem terdistribusi, durabilitas biasanya dinyatakan sebagai berapa salinan yang harus sudah menerima data sebelum penulisan dianggap sukses.',
        },
        {
          term: 'out of scope',
          meaning:
            'Daftar hal yang **sengaja tidak** dikerjakan, ditulis secara terbuka. Bagian ini terasa sepele dan justru sangat berguna, karena ia mencegah perdebatan berulang dan mencegah desain membengkak untuk kebutuhan yang tidak pernah diminta siapa pun.',
        },
      ),

      h2('Daftar pertama, apa yang sistem lakukan'),
      p(
        'Kebutuhan fungsional ditulis pendek dan konkret. Tiga sampai lima butir sudah cukup untuk sebuah desain awal, karena tujuannya menyepakati inti, bukan mencatat setiap tombol.',
      ),
      p(
        'Ambil contoh layanan pemendek alamat, yang akan dipakai lagi sebagai studi kasus di sub-bab [studi kasus pemendek URL](/kelas/system-design/keandalan-studi-kasus/studi-kasus-pemendek-url).',
      ),
      code(
        'text',
        `
        KEBUTUHAN FUNGSIONAL
        1. Pengguna mengirim alamat panjang dan menerima alamat pendek.
        2. Membuka alamat pendek mengalihkan pengunjung ke alamat aslinya.
        3. Pemilik alamat bisa melihat berapa kali alamatnya dibuka.

        DI LUAR CAKUPAN
        - Alamat pendek pilihan sendiri.
        - Masa berlaku dan penghapusan.
        - Statistik rinci seperti asal negara dan perangkat.
        `,
        { caption: 'Tiga butir masuk, tiga butir sengaja ditolak. Keduanya sama pentingnya.' },
      ),
      p(
        'Bagian "di luar cakupan" bukan formalitas. Alamat pendek pilihan sendiri terlihat seperti fitur kecil, padahal ia mengubah cara alamat dibuat secara mendasar, karena tiba-tiba dibutuhkan pemeriksaan tabrakan dan penyaringan kata terlarang. Menuliskannya sebagai keputusan membuat kamu bisa menjawab dengan tenang ketika ia diminta kemudian.',
      ),
      p(
        'Cara paling cepat menyusun daftar ini adalah menelusuri satu alur pemakaian dari awal sampai akhir dan mencatat setiap titik di mana sistem harus melakukan sesuatu. Alur yang tidak pernah ditelusuri biasanya menyembunyikan satu kebutuhan yang baru ketahuan setelah desainnya jadi.',
      ),

      h2('Daftar kedua, bagaimana sistem harus berperilaku'),
      p(
        'Daftar ini yang menentukan arsitektur. Fungsi yang sama persis bisa menghasilkan dua sistem yang sangat berbeda hanya karena angka di daftar ini berbeda.',
      ),
      table(
        ['Aspek', 'Pertanyaan yang harus dijawab', 'Kenapa ia mengubah desain'],
        [
          [
            'Skala',
            'Berapa DAU? Berapa aksi per pengguna per hari? Berapa perbandingan baca dan tulis?',
            'Menentukan jumlah mesin, dan menentukan apakah database tunggal masih cukup',
          ],
          [
            'Latensi',
            'Berapa target P95 dan P99? Bagian mana yang boleh lambat?',
            'Target di bawah 10 milidetik memaksa datanya berada di memori, bukan di disk',
          ],
          [
            'Ketersediaan',
            'Berapa lama boleh mati dalam setahun? Apakah semua fitur sama pentingnya?',
            'Menentukan berapa banyak cadangan dan apakah butuh lebih dari satu wilayah',
          ],
          [
            'Konsistensi',
            'Apakah pembaca harus langsung melihat tulisan terbaru?',
            'Menentukan boleh tidaknya memakai replika baca dan cache',
          ],
          [
            'Durabilitas',
            'Berapa banyak data yang boleh hilang bila terjadi bencana?',
            'Menentukan jadwal cadangan dan jumlah salinan',
          ],
          [
            'Pertumbuhan',
            'Berapa kali lipat per tahun yang diperkirakan?',
            'Desain untuk hari ini yang tidak bisa tumbuh akan ditulis ulang tahun depan',
          ],
        ],
      ),
      p(
        'Baris konsistensi layak diperhatikan tersendiri karena ia paling sering dijawab dengan refleks. Refleksnya adalah menjawab "tentu harus langsung terlihat", padahal jawaban itu menutup pintu bagi cache dan replika baca sekaligus, dan keduanya adalah dua cara termurah menambah kapasitas.',
      ),
      p(
        'Yang benar adalah menjawabnya **per data, bukan per sistem**. Saldo dompet harus konsisten kuat karena kesalahan di situ berarti uang. Jumlah pembaca sebuah tulisan sama sekali tidak perlu, karena tidak ada yang dirugikan bila angkanya tertinggal sepuluh detik.',
      ),
      table(
        ['Data', 'Konsistensi yang dibutuhkan', 'Akibat pada desain'],
        [
          ['Saldo dan transaksi', 'Kuat', 'Selalu dibaca dari leader, tidak boleh di-cache'],
          [
            'Stok barang saat checkout',
            'Kuat',
            'Dijaga batasan database, bukan pemeriksaan di kode',
          ],
          [
            'Profil pengguna',
            'Akhir, beberapa detik',
            'Boleh di-cache dengan invalidasi saat diubah',
          ],
          [
            'Jumlah suka dan pembaca',
            'Akhir, boleh puluhan detik',
            'Boleh dihitung berkala dan disimpan sebagai angka jadi',
          ],
          ['Linimasa', 'Akhir, beberapa detik', 'Boleh disusun sebelumnya dan disimpan di cache'],
        ],
      ),

      h2('Menerjemahkan kalimat menjadi angka'),
      p(
        'Pemangku kepentingan jarang berbicara dengan angka. Yang kamu terima biasanya kalimat, dan tugasmu mengubahnya menjadi besaran yang bisa dihitung. Terjemahan ini harus dilakukan terbuka, sehingga siapa pun bisa mengoreksi asumsinya.',
      ),
      table(
        ['Yang dikatakan', 'Yang perlu ditanyakan', 'Bentuk angkanya'],
        [
          [
            '"Harus cepat"',
            'Cepat menurut siapa, dan pada operasi yang mana?',
            'P95 di bawah 200 milidetik untuk membuka halaman',
          ],
          [
            '"Tidak boleh mati"',
            'Berapa menit mati per bulan yang masih bisa diterima?',
            '99,9 persen, yaitu sekitar 43 menit per bulan',
          ],
          [
            '"Penggunanya banyak"',
            'Berapa aktif per hari, dan berapa saat puncak?',
            '200 ribu DAU, puncak tiga kali rata-rata',
          ],
          [
            '"Datanya jangan hilang"',
            'Berapa jam data terakhir yang boleh hilang bila server rusak total?',
            'RPO satu jam, sehingga cadangan tiap jam',
          ],
          [
            '"Harus real-time"',
            'Berapa detik keterlambatan yang masih terasa langsung?',
            'Di bawah dua detik dari kirim sampai tampil',
          ],
        ],
      ),
      callout(
        'tip',
        'Asumsi yang ditulis lebih berguna daripada jawaban yang ditunggu',
        'Kalau angkanya belum ada, jangan berhenti. Tulis asumsimu secara terbuka, misalnya "diasumsikan 100 ribu DAU dengan puncak tiga kali rata-rata", lalu lanjutkan. Asumsi yang tertulis bisa dikoreksi orang lain dalam sepuluh detik, sedangkan desain yang tertunda menunggu angka pasti tidak menghasilkan apa-apa.',
      ),

      h2('Perbandingan baca dan tulis menentukan segalanya'),
      p(
        'Dari semua angka non-fungsional, satu angka punya pengaruh paling besar terhadap bentuk sistem, yaitu perbandingan antara jumlah pembacaan dan jumlah penulisan.',
      ),
      table(
        ['Perbandingan baca:tulis', 'Contoh sistem', 'Arah desain yang masuk akal'],
        [
          [
            '100:1 atau lebih',
            'Blog, berita, katalog produk',
            'Cache dan CDN memberi hasil terbesar, replika baca sangat efektif',
          ],
          ['10:1', 'Media sosial, forum', 'Cache tetap berguna, susunan linimasa perlu dipikirkan'],
          [
            '1:1',
            'Aplikasi pesan, kolaborasi',
            'Kapasitas tulis sama pentingnya, antrean menjadi wajar',
          ],
          [
            '1:10 atau lebih tulis',
            'Telemetri perangkat, pencatatan peristiwa',
            'Cache hampir tidak berguna, penyimpanan yang kuat menulis lebih penting',
          ],
        ],
      ),
      p(
        'Perhatikan baris terakhir. Pada sistem yang lebih banyak menulis daripada membaca, memasang cache adalah pekerjaan sia-sia, karena data yang di-cache sudah keburu berubah sebelum sempat dibaca ulang. Itu contoh konkret betapa sebuah teknik yang dianggap selalu benar sebenarnya bergantung sepenuhnya pada satu angka di daftar kebutuhan.',
      ),

      h2('Satu kesalahan yang perlu dihindari'),
      p(
        'Kesalahan yang paling umum bukan salah menghitung, melainkan **mengarang angka tanpa mengakuinya**. Menyebut "sekitar sejuta pengguna" tanpa dasar terdengar meyakinkan, dan seluruh perhitungan sesudahnya menjadi tidak bisa dipercaya karena tidak ada yang tahu angka itu datang dari mana.',
      ),
      p(
        'Perbaikannya sederhana. Setiap angka ditulis bersama sumbernya, dan sumber yang jujur boleh berupa tebakan asalkan disebut tebakan.',
      ),
      code(
        'text',
        `
        ASUMSI (bisa dikoreksi)
        DAU                    100.000   dari data analitik bulan lalu
        Aksi baca per pengguna       20   tebakan, berdasarkan pola halaman saat ini
        Aksi tulis per pengguna       2   tebakan
        Faktor puncak                 3x  dari grafik trafik jam 19.00-21.00
        Pertumbuhan setahun           3x  target tim produk
        `,
        {
          caption:
            'Dua angka berasal dari data, tiga angka adalah tebakan, dan semuanya diberi label.',
        },
      ),
      p(
        'Tabel semacam ini berumur panjang. Enam bulan kemudian, ketika sistemnya berperilaku di luar dugaan, tabel inilah yang memberi tahu asumsi mana yang ternyata meleset, dan itu jauh lebih berguna daripada mencoba mengingat apa yang dipikirkan waktu itu.',
      ),

      references(
        {
          label: 'Service Level Objectives',
          href: 'https://sre.google/sre-book/service-level-objectives/',
          source: 'Google SRE',
          note: 'Definisi resmi SLI, SLO, dan SLA beserta cara memilih angkanya.',
        },
        {
          label: 'Latency: The New Web Performance Bottleneck',
          href: 'https://web.dev/articles/rail',
          source: 'web.dev',
          note: 'Angka latensi yang masih terasa langsung oleh manusia, berguna untuk menyusun target.',
        },
        {
          label: 'PostgreSQL: Transaction Isolation',
          href: 'https://www.postgresql.org/docs/current/transaction-iso.html',
          source: 'PostgreSQL',
          note: 'Bentuk konkret konsistensi kuat pada satu database tunggal.',
        },
        {
          label: 'Consistency in Cassandra',
          href: 'https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html',
          source: 'Apache Cassandra',
          note: 'Contoh sistem yang membuat tingkat konsistensi bisa dipilih per permintaan.',
        },
      ),
    ],
  ),
  written(
    'proses-empat-langkah',
    'Proses Empat Langkah',
    13,
    'Urutan kerja yang mencegah desain berhenti di gambar atau tersesat di detail.',
    [
      p(
        'Dua daftar kebutuhan di sub-bab sebelumnya adalah bahan bakunya. Sub-bab ini membahas urutan mengolahnya. Tanpa urutan, percakapan desain punya dua cara gagal yang sama seringnya. Cara pertama, ia berhenti pada gambar kotak dan panah yang terlihat rapi tetapi tidak menjawab satu pun pertanyaan sulit. Cara kedua, ia langsung menyelam ke satu detail kecil dan tidak pernah muncul lagi, sehingga bagian sistem yang lain tidak pernah dibahas.',
      ),
      p(
        'Empat langkah berikut membagi perhatian secara sengaja. Langkah pertama dan terakhir sengaja pendek, sedangkan dua langkah di tengah mendapat porsi terbesar. Pembagian itu bukan selera, melainkan cerminan tempat kesalahan biasanya lahir.',
      ),

      terms(
        {
          term: 'scope (cakupan)',
          meaning:
            'Batas tegas soal apa yang sedang dirancang dan apa yang tidak. Cakupan yang tidak disepakati adalah penyebab paling umum pekerjaan desain terbuang, karena dua orang bisa berjam-jam membahas sistem yang berbeda tanpa menyadarinya.',
        },
        {
          term: 'high-level design',
          meaning:
            'Gambaran kasar berisi komponen utama dan arah aliran data, tanpa detail implementasi. Disebut tingkat tinggi karena ia dilihat dari jauh, seperti peta kota yang menunjukkan jalan besar tanpa menunjukkan setiap gang.',
        },
        {
          term: 'deep dive',
          meaning:
            'Membahas satu komponen secara rinci, termasuk struktur datanya, alur kegagalannya, dan pilihan yang ditolak. Menyelam dilakukan pada dua atau tiga komponen saja, yaitu yang paling sulit atau paling menentukan, bukan pada semuanya.',
        },
        {
          term: 'API contract',
          meaning:
            'Kesepakatan tentang bentuk permintaan dan respons sebuah endpoint, yaitu method, alamat, parameter, bentuk badan, dan kode status. Sudah dibahas tuntas di bab [desain API](/kelas/backend-intermediate/desain-api), dan di sini ia dipakai sebagai alat komunikasi antar-komponen, bukan sebagai tujuan.',
        },
        {
          term: 'data model',
          meaning:
            'Bentuk entitas yang disimpan beserta hubungannya, yaitu tabel atau koleksi, kolom, dan kunci. Model data adalah bagian desain yang paling mahal diubah sesudah sistemnya jalan, karena datanya sudah terlanjur ada dalam bentuk lama.',
        },
        {
          term: 'diagram komponen',
          meaning:
            'Gambar berisi kotak untuk tiap komponen dan panah untuk tiap jalur komunikasi. Aturan yang membuatnya berguna, yaitu setiap panah diberi label mengenai jenis komunikasinya, misalnya HTTP sinkron, pesan asinkron, atau replikasi.',
        },
      ),

      h2('Gambaran empat langkahnya'),
      table(
        ['Langkah', 'Yang dikerjakan', 'Porsi waktu', 'Hasil yang harus ada'],
        [
          [
            '1. Pahami dan batasi',
            'Bertanya, menyusun dua daftar kebutuhan, menghitung estimasi kasar',
            'Sekitar 15 persen',
            'Daftar fungsional, daftar non-fungsional, angka QPS dan penyimpanan, daftar di luar cakupan',
          ],
          [
            '2. High-level design',
            'Menggambar komponen, menetapkan kontrak API, menetapkan model data',
            'Sekitar 35 persen',
            'Satu diagram berlabel, beberapa endpoint inti, skema entitas utama',
          ],
          [
            '3. Menyelam',
            'Membahas dua sampai tiga komponen tersulit secara rinci',
            'Sekitar 35 persen',
            'Perbandingan pilihan, keputusan beserta alasannya, penanganan kasus tepi',
          ],
          [
            '4. Tutup',
            'Menyebut pertukaran, bottleneck berikutnya, dan rencana perbaikan',
            'Sekitar 15 persen',
            'Ringkasan satu paragraf, daftar batasan yang diketahui',
          ],
        ],
      ),

      h2('Langkah satu, pahami dan batasi'),
      p(
        'Langkah ini sudah dibahas isinya di sub-bab sebelumnya. Yang perlu ditambahkan di sini adalah disiplin waktunya. Langkah satu harus **pendek tetapi tidak boleh dilewati**. Pendek karena tujuannya menyepakati arah, bukan menyelesaikan analisis. Tidak boleh dilewati karena setiap kesalahan di sini akan diperbesar oleh seluruh pekerjaan sesudahnya.',
      ),
      p(
        'Tanda bahwa langkah satu sudah selesai adalah kamu bisa menuliskan kalimat berikut dan tidak ada yang keberatan.',
      ),
      code(
        'text',
        `
        Kami merancang <apa>, untuk <siapa>, yang harus bisa <tiga fungsi inti>.
        Skalanya sekitar <DAU> dengan puncak <QPS>. Latensinya ditargetkan <angka>,
        ketersediaannya <angka>, dan <daftar> sengaja tidak dikerjakan.
        `,
        {
          caption:
            'Kalau ada bagian yang tidak bisa diisi, di situlah pertanyaan berikutnya berada.',
        },
      ),

      h2('Langkah dua, high-level design'),
      p(
        'Di sini kamu menggambar. Bentuk gambarnya sederhana, yaitu kotak untuk komponen dan panah untuk komunikasi, dan satu aturan membuatnya jauh lebih berguna, yaitu **setiap panah diberi label**.',
      ),
      code(
        'text',
        `
        Browser
          | HTTPS
          v
        CDN  --(lolos, aset statis)-->  Object Storage
          | HTTPS
          v
        Load Balancer (L7)
          | HTTP
          v
        Server Aplikasi  x3
          |            \\
          | TCP         \\ enqueue (asinkron)
          v              v
        Cache Redis     Antrean  --> Worker --> Layanan Email
          |
          | TCP
          v
        PostgreSQL (leader)  --replikasi-->  PostgreSQL (replika baca)
        `,
        {
          caption:
            'Perhatikan tiap panah menyebut jenis komunikasinya, termasuk mana yang asinkron.',
        },
      ),
      p(
        'Label pada panah bukan hiasan. Panah asinkron berarti pemanggilnya tidak menunggu, dan itu langsung menjawab pertanyaan soal latensi. Panah replikasi berarti ada kemungkinan tertinggal, dan itu langsung menjawab pertanyaan soal konsistensi. Diagram tanpa label memaksa setiap pembacanya menebak dua hal itu sendiri, dan biasanya mereka menebak berbeda.',
      ),
      p(
        'Setelah gambar, tetapkan kontrak API untuk fungsi intinya. Cukup beberapa endpoint, karena tujuannya menunjukkan bentuk interaksi, bukan menulis spesifikasi lengkap.',
      ),
      code(
        'text',
        `
        POST /api/v1/urls              { url }                -> 201 { shortCode, shortUrl }
        GET  /{shortCode}                                     -> 302 Location: <url asli>
        GET  /api/v1/urls/{code}/stats                        -> 200 { clicks, createdAt }
        `,
      ),
      p(
        'Lalu tetapkan model datanya. Tulis kolom dan kunci saja, karena tipe rinci dan batasan bisa menyusul.',
      ),
      code(
        'sql',
        `
        CREATE TABLE urls (
          id           BIGSERIAL PRIMARY KEY,
          short_code   VARCHAR(7)  NOT NULL UNIQUE,
          original_url TEXT        NOT NULL,
          user_id      BIGINT      REFERENCES users(id),
          created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX urls_user_id_created_at_idx ON urls (user_id, created_at DESC);
        `,
        {
          caption:
            'Index kedua ada karena "daftar alamat milik saya" adalah query yang pasti muncul.',
        },
      ),
      p(
        'Sebelum melanjutkan ke langkah tiga, berhenti sejenak dan pastikan arah ini disepakati. Menyelam ke komponen yang ternyata tidak dibutuhkan adalah cara paling rapi membuang waktu.',
      ),

      h2('Langkah tiga, menyelam pada yang benar'),
      p(
        'Langkah tiga adalah bagian yang paling menentukan mutu sebuah desain, dan langkah tiga pula yang paling sering salah sasaran. Pilih komponen yang memenuhi salah satu dari tiga sifat berikut.',
      ),
      ul(
        '**Paling sulit diskalakan**, misalnya lapisan penyimpanan pada sistem yang menulis banyak, atau lapisan sambungan pada sistem realtime',
        '**Paling menentukan kebenaran**, misalnya pemotongan stok, pemrosesan pembayaran, atau rate limiter',
        '**Paling khas**, yaitu bagian yang membuat sistem ini berbeda dari contoh buku teks',
      ),
      p(
        'Sebaliknya, jangan menyelam pada bagian yang jawabannya sudah standar. Cara memasang Nginx di depan tiga server aplikasi bukan bahan yang layak menghabiskan sepertiga waktu desain, karena tidak ada keputusan berarti yang diambil di situ.',
      ),
      p(
        'Bentuk menyelam yang baik selalu punya empat bagian, dan bagian keduanya yang paling sering hilang.',
      ),
      steps(
        {
          title: 'Sebutkan tantangannya secara spesifik',
          body: 'Bukan "linimasa harus cepat", melainkan "linimasa harus tersusun dari ribuan akun yang diikuti dalam waktu di bawah 200 milidetik pada P95".',
        },
        {
          title: 'Bandingkan minimal dua pendekatan',
          body: 'Tulis kelebihan dan kekurangan masing-masing dalam bentuk tabel. Satu pendekatan tanpa pembanding bukan keputusan, melainkan asumsi yang disamarkan.',
        },
        {
          title: 'Pilih satu dan sebutkan alasannya',
          body: 'Alasannya harus merujuk angka dari langkah satu. "Dipilih karena 99 persen akun punya kurang dari sepuluh ribu pengikut" adalah alasan, sedangkan "dipilih karena lebih baik" bukan.',
        },
        {
          title: 'Turunkan ke detail yang bisa dikerjakan',
          body: 'Struktur data yang dipakai, tambahan skema, kunci cache, dan yang terpenting, apa yang terjadi ketika komponen ini gagal.',
        },
      ),

      h2('Langkah empat, tutup dengan jujur'),
      p(
        'Langkah terakhir singkat dan sering dilewati karena terasa seperti basa-basi. Ia bukan basa-basi. Langkah empat adalah tempat kamu menuliskan apa yang **belum** beres, dan tulisan itulah yang menyelamatkan orang berikutnya.',
      ),
      p('Empat hal yang harus ada.'),
      ol(
        'Ringkasan satu paragraf tentang cara kerja sistemnya dari ujung ke ujung',
        'Pertukaran yang sudah diterima secara sadar, ditulis beserta akibatnya bagi pengguna',
        'Bottleneck berikutnya beserta perkiraan kapan ia tercapai',
        'Perbaikan yang direncanakan, beserta pemicunya',
      ),
      code(
        'text',
        `
        PERTUKARAN YANG DITERIMA
        - Jumlah klik diperbarui asinkron, sehingga bisa tertinggal sampai 30 detik.
        - Alamat pendek tidak bisa dipilih sendiri, agar pembuatannya tidak perlu
          memeriksa tabrakan.

        LEHER BOTOL BERIKUTNYA
        - Tulisan ke PostgreSQL, diperkirakan mentok sekitar 5.000 tulisan per detik.
          Pada laju tumbuh saat ini, tercapai sekitar 14 bulan lagi.

        PERBAIKAN YANG DIRENCANAKAN
        - Pindahkan penghitung klik ke Redis dengan penulisan berkala ke database.
          Pemicu: beban tulis database melewati 60 persen kapasitas.
        `,
      ),
      callout(
        'tip',
        'Menyebut kelemahan menaikkan kepercayaan, bukan menurunkannya',
        'Desain yang mengaku punya batas terbaca sebagai desain yang sudah dipikirkan sampai batasnya. Desain yang tidak menyebut satu pun kelemahan hampir selalu berarti batasnya belum pernah dicari.',
      ),

      h2('Kesalahan yang berulang di tiap langkah'),
      table(
        ['Langkah', 'Kesalahan yang sering terjadi', 'Akibatnya', 'Perbaikannya'],
        [
          [
            '1',
            'Langsung menggambar tanpa bertanya',
            'Merancang sistem untuk masalah yang salah',
            'Paksakan mengisi kalimat cakupan lebih dulu',
          ],
          [
            '1',
            'Menebak skala tanpa mengakuinya',
            'Semua perhitungan sesudahnya tak bisa dipercaya',
            'Tandai tiap angka dengan sumber atau label tebakan',
          ],
          [
            '2',
            'Langsung memecah menjadi banyak layanan',
            'Kerumitan operasional tanpa manfaat',
            'Mulai dari satu aplikasi, pecah ketika ada alasan',
          ],
          ['2', 'Panah tanpa label', 'Pembaca menebak mana yang sinkron', 'Beri label tiap panah'],
          [
            '3',
            'Menyelam pada semua komponen',
            'Semuanya dangkal, tidak ada yang tuntas',
            'Pilih dua sampai tiga saja',
          ],
          [
            '3',
            'Satu pendekatan tanpa pembanding',
            'Keputusan tidak bisa diperiksa orang lain',
            'Selalu tulis minimal dua pilihan',
          ],
          [
            '4',
            'Melewatkan langkah empat',
            'Batas sistem tidak diketahui siapa pun',
            'Selalu tulis pertukaran dan bottleneck berikutnya',
          ],
        ],
      ),

      references(
        {
          label: 'OpenAPI Specification',
          href: 'https://spec.openapis.org/oas/latest.html',
          source: 'OpenAPI Initiative',
          note: 'Bentuk formal kontrak API yang dihasilkan langkah dua.',
        },
        {
          label: 'PostgreSQL: CREATE INDEX',
          href: 'https://www.postgresql.org/docs/current/sql-createindex.html',
          source: 'PostgreSQL',
          note: 'Rujukan untuk index yang menyertai model data pada langkah dua.',
        },
        {
          label: 'Site Reliability Engineering: Simplicity',
          href: 'https://sre.google/sre-book/simplicity/',
          source: 'Google SRE',
          note: 'Alasan resmi menahan diri dari memecah sistem lebih awal daripada perlunya.',
        },
      ),
    ],
  ),

  written(
    'estimasi-kasar',
    'Estimasi di Balik Amplop',
    15,
    'Mengubah jumlah pengguna menjadi QPS, penyimpanan, bandwidth, dan jumlah mesin.',
    [
      p(
        'Ini sub-bab yang paling praktis di seluruh kategori. Isinya aritmetika sederhana yang bisa dikerjakan tanpa kalkulator, dan hasilnya menentukan hampir semua keputusan sesudahnya. Tanpa angka, setiap komponen terlihat sama-sama perlu. Dengan angka, sebagian besar komponen ternyata belum perlu.',
      ),
      p(
        'Namanya estimasi di balik amplop karena secara harfiah bisa dikerjakan di balik amplop surat. Targetnya bukan ketepatan, melainkan **urutan besaran**. Meleset dua kali lipat itu bagus sekali. Meleset sepuluh kali lipat masih berguna. Yang berbahaya adalah tidak menghitung sama sekali, karena tebakan tanpa perhitungan bisa meleset seribu kali lipat tanpa ada yang menyadarinya.',
      ),

      terms(
        {
          term: 'QPS (queries per second)',
          meaning:
            'Jumlah permintaan yang diterima sistem tiap detik. Dibaca "kiu-pi-es". Kadang ditulis RPS untuk requests per second, dan keduanya berarti sama dalam percakapan sehari-hari. QPS adalah satuan utama untuk menghitung jumlah mesin.',
        },
        {
          term: 'peak QPS',
          meaning:
            'QPS pada jam tersibuk, bukan rata-rata sepanjang hari. Angka inilah yang menentukan kapasitas, karena sistem yang hanya sanggup melayani rata-rata akan mati tepat pada saat paling banyak orang memakainya. Faktor puncak yang lazim berkisar dua sampai lima kali rata-rata.',
        },
        {
          term: 'throughput',
          meaning:
            'Banyaknya pekerjaan yang diselesaikan per satuan waktu. Dibaca "truput". Untuk API, throughput biasanya sama dengan QPS. Untuk pemrosesan data, satuannya bisa berupa jumlah baris per detik atau megabita per detik.',
        },
        {
          term: 'bandwidth',
          meaning:
            'Jumlah data yang mengalir lewat jaringan per satuan waktu, biasanya dalam megabita per detik. Sering terlupakan padahal ia bisa menjadi bottleneck lebih dulu daripada prosesor, terutama pada layanan yang mengirim gambar atau video.',
        },
        {
          term: 'replication factor',
          meaning:
            'Berapa salinan data yang disimpan agar tahan terhadap kerusakan mesin. Nilai tiga adalah pilihan yang sangat umum. Angka ini penting pada estimasi karena kebutuhan penyimpanan sesungguhnya adalah hasil hitungan mentah dikalikan faktor ini.',
        },
        {
          term: 'retention',
          meaning:
            'Berapa lama data disimpan sebelum boleh dihapus atau dipindahkan ke penyimpanan yang lebih murah. Retention adalah pengali langsung pada kebutuhan penyimpanan, dan ia sering kali merupakan keputusan bisnis, bukan keputusan teknis.',
        },
        {
          term: 'working set',
          meaning:
            'Bagian data yang benar-benar sering diakses, biasanya jauh lebih kecil daripada seluruh data. Dibaca "wo-king set". Ukuran working set menentukan berapa besar cache yang dibutuhkan, dan pada kebanyakan sistem ia mengikuti pola bahwa sekitar 20 persen data melayani sekitar 80 persen permintaan.',
        },
      ),

      h2('Angka yang perlu diingat'),
      p(
        'Semua perhitungan di bawah bertumpu pada beberapa angka bulat. Menghafal yang bercetak tebal saja sudah cukup untuk sebagian besar keperluan.',
      ),
      table(
        ['Besaran', 'Nilai bulat yang dipakai', 'Catatan'],
        [
          [
            'Detik dalam sehari',
            '**86.400, dibulatkan 100.000**',
            'Pembulatan ini membuat pembagian bisa dikerjakan di kepala',
          ],
          ['Detik dalam sebulan', '2,5 juta', 'Berguna untuk menghitung biaya bulanan'],
          ['Detik dalam setahun', '31,5 juta, dibulatkan 30 juta', ''],
          ['1 KB', '10^3 bita', 'Sekitar satu paragraf teks'],
          ['1 MB', '10^6 bita', 'Sekitar satu foto terkompresi'],
          ['1 GB', '10^9 bita', ''],
          ['1 TB', '10^12 bita', ''],
          ['2^10', '**sekitar seribu**', 'Dipakai untuk menaksir ukuran struktur data'],
          ['2^20', 'sekitar sejuta', ''],
          ['2^30', 'sekitar semiliar', ''],
        ],
      ),
      callout(
        'tip',
        'Membulatkan 86.400 menjadi 100.000 adalah kebiasaan yang benar',
        'Kesalahannya sekitar 16 persen, jauh lebih kecil daripada ketidakpastian tebakan "berapa aksi per pengguna per hari" yang menjadi masukannya. Ketelitian yang melebihi ketelitian masukannya adalah ketelitian palsu.',
      ),

      h2('Menghitung QPS'),
      p('Rumusnya satu baris, dan seluruh sisanya adalah penerapan.'),
      code(
        'text',
        `
        QPS rata-rata = DAU x aksi per pengguna per hari / 86.400
        QPS puncak    = QPS rata-rata x faktor puncak (2 sampai 5)
        `,
      ),
      p(
        'Ambil contoh aplikasi blog dengan 200 ribu pengguna aktif harian. Tiap pengguna rata-rata membuka 20 halaman dan menulis 0,1 komentar per hari, yaitu satu komentar per sepuluh orang.',
      ),
      code(
        'text',
        `
        BACA
        200.000 x 20 = 4.000.000 pembacaan per hari
        4.000.000 / 86.400 = ~46 QPS rata-rata
        Puncak 3x        = ~140 QPS

        TULIS
        200.000 x 0,1 = 20.000 penulisan per hari
        20.000 / 86.400 = ~0,23 QPS rata-rata
        Puncak 3x       = ~0,7 QPS

        Perbandingan baca:tulis = 200 : 1
        `,
      ),
      p(
        'Perhatikan hasilnya, dan perhatikan betapa kecilnya. Seratus empat puluh permintaan baca per detik adalah beban yang dilayani **satu** server Express sederhana dengan santai, dan tulisannya kurang dari satu per detik. Aplikasi dengan dua ratus ribu pengguna aktif harian ini tidak membutuhkan sharding, tidak membutuhkan antrean, dan kemungkinan besar belum membutuhkan replika baca.',
      ),
      p(
        'Perhitungan lima baris tadi baru saja menghemat berbulan-bulan pekerjaan yang tidak perlu. Itulah gunanya estimasi.',
      ),
      p('Bandingkan dengan sistem berbagi tulisan berskala jauh lebih besar.'),
      code(
        'text',
        `
        DAU 300 juta, tiap orang menulis 2 dan membaca 100 per hari

        TULIS  300.000.000 x 2   / 86.400 = ~7.000 QPS,  puncak 3x = ~21.000 QPS
        BACA   300.000.000 x 100 / 86.400 = ~350.000 QPS, puncak 3x = ~1.050.000 QPS
        `,
      ),
      p(
        'Sejuta permintaan baca per detik tidak mungkin dilayani satu database mana pun. Angka inilah yang memaksa hadirnya cache, replika, sharding, dan susunan linimasa yang disiapkan lebih dulu. Dua sistem yang sama fungsinya membutuhkan arsitektur yang berbeda semata-mata karena angka ini berbeda empat ribu kali lipat.',
      ),

      h2('Menghitung penyimpanan'),
      code(
        'text',
        `
        Penyimpanan harian  = jumlah catatan per hari x ukuran rata-rata satu catatan
        Penyimpanan tahunan = penyimpanan harian x 365
        Total               = penyimpanan tahunan x retention x faktor replikasi
        `,
      ),
      p(
        'Langkah tersulitnya adalah menaksir ukuran satu catatan, dan cara paling jujur adalah menjumlahkan kolomnya satu per satu lalu menambahkan kelebihan untuk index dan metadata.',
      ),
      code(
        'text',
        `
        UKURAN SATU KOMENTAR
        id            8 bita
        post_id       8 bita
        user_id       8 bita
        isi         500 bita   (rata-rata, bukan maksimum)
        created_at    8 bita
        --------------------
        subtotal    532 bita
        + 40% untuk index, padding, dan metadata
        = ~750 bita, dibulatkan 1 KB
        `,
      ),
      p(
        'Tambahan 40 persen itu bukan angka keramat, melainkan pengakuan bahwa satu baris di database tidak pernah sebesar jumlah kolomnya saja. Ada index yang menyimpan salinan kunci, ada informasi versi baris, dan ada ruang kosong akibat penyelarasan.',
      ),
      code(
        'text',
        `
        20.000 komentar per hari x 1 KB = 20 MB per hari
        20 MB x 365                     = ~7,3 GB per tahun
        Simpan 5 tahun                  = ~37 GB
        Faktor replikasi 3              = ~110 GB
        `,
      ),
      p(
        'Seratus sepuluh gigabita muat di satu disk yang harganya tidak seberapa. Sekali lagi, angkanya sendiri yang mengatakan bahwa sharding belum menjadi bahan pembicaraan.',
      ),
      callout(
        'warning',
        'Berkas media mengubah semuanya',
        'Teks itu kecil dan media itu besar. Satu foto berukuran 500 KB setara dengan lima ratus komentar. Kalau tiap pengguna mengunggah satu foto per hari, kebutuhan penyimpanannya melonjak ratusan kali lipat dan jawabannya berpindah dari database ke object storage serta CDN. Selalu hitung media secara terpisah dari teks.',
      ),

      h2('Menghitung bandwidth'),
      code(
        'text',
        `
        Bandwidth masuk  = QPS tulis x ukuran rata-rata permintaan
        Bandwidth keluar = QPS baca  x ukuran rata-rata respons
        `,
      ),
      p('Untuk blog tadi, dengan halaman berukuran sekitar 60 KB termasuk HTML dan JSON.'),
      code(
        'text',
        `
        KELUAR  140 QPS x 60 KB  = ~8,4 MB/detik  = ~67 Mbps
        MASUK   0,7 QPS x 2 KB   = ~1,4 KB/detik  (dapat diabaikan)
        `,
      ),
      p(
        'Enam puluh tujuh megabit per detik masih nyaman bagi satu server. Sekarang lihat apa yang terjadi pada layanan yang menyajikan gambar.',
      ),
      code(
        'text',
        `
        10.000 QPS x 500 KB = 5 GB/detik = 40 Gbps
        `,
      ),
      p(
        'Empat puluh gigabit per detik bukan lagi urusan menambah server, melainkan urusan biaya jaringan yang sangat besar. Angka ini adalah cara paling cepat membuktikan bahwa CDN bukan pilihan melainkan keharusan, seperti yang dibahas di sub-bab [caching dan CDN di produksi](/kelas/deployment/deploy-frontend/caching-cdn-produksi).',
      ),

      h2('Menghitung jumlah mesin'),
      p(
        'Kapasitas satu mesin bergantung pada beratnya pekerjaan, jadi angka di bawah adalah kisaran kasar untuk memulai, bukan janji. Setelah sistem berjalan, ganti dengan hasil pengukuranmu sendiri.',
      ),
      table(
        ['Komponen', 'Kisaran kapasitas satu mesin', 'Catatan'],
        [
          [
            'Server aplikasi',
            '1.000 sampai 10.000 QPS',
            'Sangat bergantung pada berat tiap permintaan',
          ],
          [
            'Database relasional',
            '5.000 sampai 10.000 QPS query sederhana',
            'Turun drastis untuk query dengan join berat',
          ],
          ['Redis', 'sekitar 100.000 operasi per detik', 'Untuk GET dan SET sederhana'],
          [
            'Simpul antrean',
            '10.000 sampai 100.000 pesan per detik',
            'Bergantung pada ukuran pesan dan jaminan pengiriman',
          ],
        ],
      ),
      code(
        'text',
        `
        Jumlah mesin = QPS puncak / kapasitas per mesin, lalu dikalikan 2 untuk cadangan

        Contoh: puncak 30.000 QPS, kapasitas 5.000 QPS per mesin
        30.000 / 5.000 = 6 mesin
        6 x 2 = 12 mesin
        `,
      ),
      p(
        'Pengali dua di baris terakhir bukan pemborosan. Ia menjawab dua hal sekaligus, yaitu satu mesin boleh mati tanpa menjatuhkan sisanya, dan pembaruan versi bisa dilakukan bergiliran tanpa mengurangi kapasitas di bawah kebutuhan.',
      ),

      h2('Menghitung ukuran cache'),
      p(
        'Cache tidak perlu memuat seluruh data, hanya working set-nya. Aturan kasar yang sangat sering cocok, yaitu sekitar 20 persen data melayani sekitar 80 persen permintaan.',
      ),
      code(
        'text',
        `
        Total tulisan             1.000.000
        Working set 20%          200.000
        Ukuran satu tulisan            5 KB
        Kebutuhan cache      200.000 x 5 KB = 1 GB
        + 30% kelebihan struktur data Redis = ~1,3 GB
        `,
      ),
      p(
        'Satu koma tiga gigabita adalah instance Redis yang sangat kecil dan sangat murah. Bandingkan dengan biaya menambah replika database, dan alasan cache selalu dicoba lebih dulu menjadi jelas dengan sendirinya.',
      ),

      h2('Kesalahan estimasi yang paling sering'),
      table(
        ['Kesalahan', 'Akibatnya', 'Perbaikannya'],
        [
          [
            'Memakai rata-rata, bukan puncak',
            'Sistem mati tepat saat paling ramai',
            'Selalu kalikan dua sampai lima',
          ],
          [
            'Lupa faktor replikasi',
            'Kebutuhan penyimpanan meleset tiga kali lipat',
            'Kalikan jumlah salinan',
          ],
          ['Lupa media', 'Meleset ratusan kali lipat', 'Hitung teks dan media terpisah'],
          [
            'Terlalu teliti',
            'Angka 3.472 QPS memberi rasa pasti yang palsu',
            'Bulatkan, lalu tulis sebagai kisaran',
          ],
          [
            'Memakai angka hari ini saja',
            'Desain ditulis ulang tahun depan',
            'Kalikan dengan target pertumbuhan setahun',
          ],
          [
            'Lupa kelebihan index',
            'Disk penuh lebih cepat dari perkiraan',
            'Tambahkan 30 sampai 50 persen',
          ],
        ],
      ),
      p(
        'Menutup sub-bab ini, ada satu kebiasaan yang layak dibawa terus. Setiap kali seseorang menyebutkan skala dengan kata sifat, kerjakan lima baris perhitungan ini sebelum menjawab. Sebagian besar percakapan desain berakhir jauh lebih cepat setelah angkanya muncul, dan biasanya berakhir dengan kesimpulan bahwa yang dibutuhkan lebih sederhana daripada yang dibayangkan.',
      ),

      references(
        {
          label: 'Redis: Memory Optimization',
          href: 'https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/',
          source: 'Redis',
          note: 'Kelebihan memori nyata sebuah struktur data Redis, bahan untuk estimasi ukuran cache.',
        },
        {
          label: 'PostgreSQL: Database Physical Storage',
          href: 'https://www.postgresql.org/docs/current/storage.html',
          source: 'PostgreSQL',
          note: 'Penjelasan resmi kenapa satu baris memakan lebih banyak ruang daripada jumlah kolomnya.',
        },
        {
          label: 'Prometheus: Querying Basics',
          href: 'https://prometheus.io/docs/prometheus/latest/querying/basics/',
          source: 'Prometheus',
          note: 'Cara mengganti tebakan pada sub-bab ini dengan QPS yang benar-benar terukur.',
        },
        {
          label: 'Site Reliability Engineering: Software Engineering in SRE',
          href: 'https://sre.google/sre-book/software-engineering-in-sre/',
          source: 'Google SRE',
          note: 'Contoh nyata perencanaan kapasitas berbasis perkiraan beban.',
        },
      ),
    ],
  ),
  written(
    'angka-latensi',
    'Angka Latensi yang Perlu Dikenali',
    12,
    'Perbedaan memori, SSD, jaringan lokal, dan lintas benua, serta akibatnya pada desain.',
    [
      p(
        'Ada satu kumpulan angka yang membuat banyak keputusan desain menjadi jelas dengan sendirinya. Angka-angka itu menyatakan berapa lama sebuah operasi berlangsung, mulai dari membaca memori sampai mengirim paket menyeberangi benua. Yang penting bukan hafalannya, melainkan **perbandingan antar angkanya**, karena perbandingan itulah yang memberi tahu operasi mana yang boleh dilakukan seribu kali dan operasi mana yang harus dijaga agar hanya sekali.',
      ),
      p(
        'Sub-bab ini juga menjelaskan kenapa latensi selalu dilaporkan sebagai persentil, bukan rata-rata, dan kenapa perbedaan itu bukan soal selera statistik melainkan soal siapa yang menderita.',
      ),

      terms(
        {
          term: 'latency (latensi)',
          meaning:
            'Waktu yang dibutuhkan satu operasi dari mulai sampai selesai. Dibaca "leitensi". Berbeda dari throughput yang menghitung banyaknya pekerjaan per detik. Sebuah sistem bisa punya throughput tinggi dan latensi buruk sekaligus, misalnya ketika permintaan diantre panjang lalu diproses berbondong-bondong.',
        },
        {
          term: 'nanodetik, mikrodetik, milidetik',
          meaning:
            'Tiga satuan yang selalu muncul bersama dan mudah tertukar. Satu milidetik sama dengan seperseribu detik, ditulis ms. Satu mikrodetik sama dengan seperseribu milidetik, ditulis us. Satu nanodetik sama dengan seperseribu mikrodetik, ditulis ns. Setiap naik satu tingkat, angkanya seribu kali lebih besar.',
        },
        {
          term: 'round trip (RTT)',
          meaning:
            'Waktu sejak sebuah permintaan dikirim sampai jawabannya kembali. Disingkat RTT dari round-trip time. Angka ini penting karena setiap panggilan jaringan membayar satu RTT penuh, sehingga sepuluh panggilan berurutan membayar sepuluh kali RTT sekalipun tiap panggilan mengambil data yang sangat kecil.',
        },
        {
          term: 'P50, P95, P99',
          meaning:
            'Persentil latensi. P50 adalah nilai tengah, yaitu separuh permintaan lebih cepat dan separuh lebih lambat. P99 sebesar 2 detik berarti satu dari seratus permintaan memakan waktu 2 detik atau lebih. Dibaca "pi lima puluh" dan "pi sembilan puluh sembilan".',
        },
        {
          term: 'tail latency',
          meaning:
            'Bagian paling lambat dari sebaran latensi, yaitu P99 ke atas. Disebut ekor karena bentuk grafiknya memanjang ke kanan. Ekor inilah yang dirasakan pengguna sebagai "aplikasinya kadang macet", dan ekor pula yang paling sering disembunyikan oleh laporan rata-rata.',
        },
        {
          term: 'sinkron dan asinkron',
          meaning:
            'Sinkron berarti pemanggil menunggu sampai hasilnya ada sebelum melanjutkan. Asinkron berarti pemanggil melanjutkan pekerjaannya dan hasilnya datang belakangan. Dalam desain sistem, memindahkan sebuah operasi dari sinkron ke asinkron adalah cara paling ampuh menurunkan latensi yang dirasakan pengguna tanpa mempercepat operasinya sama sekali.',
        },
        {
          term: 'sequential dan random access',
          meaning:
            'Membaca berurutan berarti mengambil data yang letaknya bersebelahan, sedangkan membaca acak berarti melompat-lompat. Perbedaannya sangat besar pada disk dan masih terasa pada SSD. Inilah alasan index dirancang agar pembacaan menjadi berurutan sebisa mungkin.',
        },
      ),

      h2('Tabel angkanya'),
      p(
        'Angka di bawah adalah urutan besaran yang lazim dipakai di industri. Nilai persisnya berbeda antar perangkat keras, dan itu tidak mengapa karena yang dipakai adalah perbandingannya.',
      ),
      table(
        ['Operasi', 'Waktu', 'Setara dengan'],
        [
          ['Membaca cache L1 prosesor', '0,5 ns', 'Titik acuan'],
          ['Membaca memori utama', '**100 ns**', '200 kali cache L1'],
          ['Memampatkan 1 KB', '3 us', '30 kali memori'],
          ['Mengirim 1 KB lewat jaringan 1 Gbps', '10 us', '100 kali memori'],
          ['Membaca 4 KB acak dari SSD', '**150 us**', '1.500 kali memori'],
          ['Membaca 1 MB berurutan dari memori', '250 us', ''],
          ['Pulang pergi dalam satu pusat data', '**500 us**', '5.000 kali memori'],
          ['Membaca 1 MB berurutan dari SSD', '1 ms', ''],
          ['Mencari posisi di disk berputar', '**10 ms**', '100.000 kali memori'],
          ['Membaca 1 MB berurutan dari disk berputar', '20 ms', ''],
          ['Pulang pergi antar benua', '**150 ms**', '1,5 juta kali memori'],
        ],
        'Lima baris bercetak tebal sudah cukup untuk hampir semua percakapan desain.',
      ),
      p(
        'Cara termudah mengingatnya adalah dengan mengubah skalanya menjadi satuan manusia. Andaikan membaca memori memakan waktu satu detik, maka membaca SSD memakan waktu setengah jam, memanggil layanan di pusat data yang sama memakan waktu satu setengah jam, mencari posisi di disk berputar memakan waktu satu hari penuh, dan memanggil layanan di benua lain memakan waktu lebih dari dua minggu.',
      ),

      h2('Lima kesimpulan yang langsung berguna'),
      ol(
        '**Memori sangat cepat dibandingkan disk.** Perbandingannya sekitar seratus ribu kali. Inilah seluruh alasan keberadaan cache, dan alasan kenapa memindahkan data yang sering dibaca ke memori memberi dampak yang tidak bisa disaingi optimasi query mana pun.',
        '**Jaringan dalam satu pusat data itu murah, tetapi tidak gratis.** Setengah milidetik terdengar kecil, sampai kamu melakukannya seratus kali dalam satu permintaan dan tiba-tiba menghabiskan 50 milidetik hanya untuk menunggu.',
        '**Jarak geografis tidak bisa dinegosiasikan.** Seratus lima puluh milidetik antar benua adalah batas kecepatan cahaya di dalam serat optik, dan tidak ada perangkat keras yang bisa memperbaikinya. Satu-satunya jawaban adalah memindahkan datanya lebih dekat, dan itulah yang dikerjakan CDN.',
        '**Membaca berurutan jauh lebih cepat daripada membaca acak.** Ini alasan index dirancang agar pembacaan berkumpul di tempat yang berdekatan, dan alasan query yang membaca banyak baris terpisah bisa jauh lebih lambat daripada yang terlihat.',
        '**Memampatkan data hampir selalu menguntungkan sebelum dikirim.** Tiga mikrodetik untuk memampatkan satu kilobita jauh lebih murah daripada sepuluh mikrodetik untuk mengirimnya, apalagi bila hasilnya menjadi separuh ukuran.',
      ),

      h2('Menerjemahkan target latensi menjadi keputusan'),
      p(
        'Angka di tabel bisa dibalik menjadi aturan praktis. Kalau kamu punya target latensi, tabel berikut memberi tahu di mana datanya harus berada.',
      ),
      table(
        ['Target latensi', 'Yang masih mungkin', 'Yang sudah tidak mungkin'],
        [
          [
            'Di bawah 1 ms',
            'Data di memori proses yang sama',
            'Apa pun yang menyentuh jaringan atau disk',
          ],
          [
            'Di bawah 10 ms',
            'Cache di jaringan lokal, SSD, query berindex',
            'Beberapa panggilan jaringan berurutan',
          ],
          [
            'Di bawah 100 ms',
            'Beberapa query database dan satu panggilan cache',
            'Panggilan lintas benua',
          ],
          [
            'Di bawah 500 ms',
            'Satu atau dua panggilan lintas layanan',
            'Belasan panggilan berurutan',
          ],
          ['Di bawah 1 detik', 'Satu panggilan lintas wilayah', 'Pemrosesan berat yang sinkron'],
          [
            'Di atas 1 detik',
            'Harus asinkron dengan penanda proses',
            'Membiarkan pengguna menunggu tanpa feedback',
          ],
        ],
      ),
      p(
        'Baris terakhir menghubungkan sub-bab ini dengan hal yang sudah kamu pelajari. Ketika sebuah pekerjaan tidak mungkin selesai dalam waktu yang wajar, jawabannya bukan mempercepat pekerjaannya melainkan mengubah bentuk interaksinya, yaitu menjawab segera lalu mengerjakannya di latar seperti pada sub-bab [operasi yang berjalan lama](/kelas/backend-intermediate/desain-api/operasi-panjang) dan [antrean BullMQ](/kelas/backend-intermediate/express-intermediate/queue-bullmq).',
      ),

      h2('Kenapa rata-rata menyesatkan'),
      p(
        'Bayangkan seratus permintaan. Sembilan puluh sembilan di antaranya dilayani dalam 10 milidetik, dan satu dilayani dalam 5 detik karena kebetulan menunggu koneksi database yang sedang penuh.',
      ),
      code(
        'text',
        `
        Rata-rata = (99 x 10 ms + 1 x 5.000 ms) / 100 = ~60 ms
        P50       = 10 ms
        P95       = 10 ms
        P99       = 10 ms
        P99,9     = 5.000 ms
        `,
      ),
      p(
        'Rata-rata sebesar 60 milidetik menggambarkan pengalaman yang **tidak dialami siapa pun**. Tidak ada satu permintaan pun yang memakan waktu 60 milidetik. Yang benar-benar terjadi adalah hampir semua orang mendapat 10 milidetik dan satu orang mendapat lima detik, dan satu orang itu yang akan menulis keluhan.',
      ),
      p(
        'Karena itu latensi selalu dilaporkan sebagai persentil. P50 memberi tahu pengalaman yang khas, sedangkan P99 memberi tahu pengalaman terburuk yang masih cukup sering terjadi untuk dipedulikan.',
      ),
      callout(
        'warning',
        'Tail latency menguat ketika komponen bertambah',
        'Kalau satu halaman memanggil lima layanan secara berurutan dan tiap layanan punya P99 sebesar satu detik, peluang sebuah permintaan menyentuh setidaknya satu ekor menjadi jauh lebih besar daripada satu persen. Semakin banyak komponen dalam satu jalur, semakin sering pengguna bertemu bagian yang paling lambat. Inilah alasan memecah sistem menjadi banyak layanan punya harga latensi yang nyata.',
      ),

      h2('Menghitung anggaran latensi'),
      p(
        'Cara praktis memakai semua ini adalah menyusun anggaran. Tetapkan target keseluruhan, lalu bagikan ke tiap bagian, dan lihat apakah jumlahnya masuk akal.',
      ),
      code(
        'text',
        `
        TARGET  P95 halaman daftar tulisan = 300 ms

        Jaringan pengguna ke server        80 ms   (di luar kendalimu)
        TLS dan pemrosesan proxy           10 ms
        Query daftar tulisan               40 ms
        Query jumlah komentar              35 ms
        Render dan serialisasi JSON        25 ms
        Jaringan server ke pengguna        80 ms
        ---------------------------------------
        Total                             270 ms   sisa anggaran 30 ms
        `,
      ),
      p(
        'Anggaran seperti ini langsung memperlihatkan hal-hal yang tidak terlihat sebelumnya. Seratus enam puluh milidetik dari tiga ratus, yaitu lebih dari separuh anggaran, habis untuk perjalanan jaringan yang tidak bisa kamu percepat. Yang benar-benar berada di bawah kendalimu hanya seratus milidetik, dan dari seratus itu tujuh puluh lima dipakai dua query.',
      ),
      p(
        'Kesimpulan yang muncul dengan sendirinya, yaitu menggabungkan dua query menjadi satu memberi hasil yang jauh lebih besar daripada mengoptimasi serialisasi JSON, dan memindahkan server lebih dekat ke pengguna memberi hasil yang lebih besar daripada keduanya. Tanpa anggaran, ketiga pekerjaan itu terlihat sama menariknya.',
      ),

      h2('Latensi yang dirasakan bukan latensi yang diukur'),
      p(
        'Terakhir, ada perbedaan penting antara angka di server dan pengalaman di layar. Pengguna tidak merasakan milidetik, ia merasakan apakah antarmuka menjawab.',
      ),
      table(
        ['Rentang waktu', 'Yang dirasakan pengguna', 'Yang harus dilakukan antarmuka'],
        [
          [
            'Di bawah 100 ms',
            'Terasa langsung, seperti menekan tombol fisik',
            'Tidak perlu penanda apa pun',
          ],
          ['100 ms sampai 300 ms', 'Terasa cepat', 'Tidak perlu penanda'],
          ['300 ms sampai 1 detik', 'Terasa ada jeda', 'Tandai tombol sebagai sedang bekerja'],
          [
            '1 detik sampai 10 detik',
            'Perhatian mulai berpindah',
            'Tampilkan kerangka atau penanda kemajuan',
          ],
          [
            'Di atas 10 detik',
            'Dianggap gagal',
            'Ubah menjadi asinkron dan beri tahu ketika selesai',
          ],
        ],
      ),
      p(
        'Tabel ini menyambung ke sub-bab [empat keadaan UI](/kelas/frontend-intermediate/state-dan-event-handler/empat-keadaan-ui). Sebuah operasi yang memakan dua detik terasa jauh lebih cepat bila ada kerangka yang menahan tata letak, dan terasa jauh lebih lambat bila layar diam tanpa keterangan apa pun. Latensi yang sama, pengalaman yang berbeda.',
      ),

      references(
        {
          label: 'RAIL model: measure performance with the RAIL model',
          href: 'https://web.dev/articles/rail',
          source: 'web.dev',
          note: 'Angka resmi soal rentang waktu yang masih terasa langsung oleh manusia.',
        },
        {
          label: 'Core Web Vitals',
          href: 'https://web.dev/articles/vitals',
          source: 'web.dev',
          note: 'Ambang latensi yang dipakai untuk menilai pengalaman halaman, termasuk LCP dan INP.',
        },
        {
          label: 'Prometheus: Histograms and summaries',
          href: 'https://prometheus.io/docs/practices/histograms/',
          source: 'Prometheus',
          note: 'Cara menghitung persentil latensi dengan benar, termasuk jebakan rata-rata persentil.',
        },
        {
          label: 'Site Reliability Engineering: Monitoring Distributed Systems',
          href: 'https://sre.google/sre-book/monitoring-distributed-systems/',
          source: 'Google SRE',
          note: 'Alasan resmi memakai sebaran latensi alih-alih rata-rata.',
        },
      ),
    ],
  ),

  written(
    'ketersediaan-dan-sla',
    'Ketersediaan dan Angka Sembilan',
    13,
    'Menerjemahkan persen menjadi menit, dan menghitung ketersediaan rantai layanan.',
    [
      p(
        'Ketersediaan diucapkan sebagai persen, dan persen adalah bentuk yang menyesatkan karena selisih yang terlihat kecil ternyata berarti perbedaan besar. Jarak antara 99 persen dan 99,9 persen terlihat sepersepuluh persen, padahal jarak itu adalah selisih antara tiga setengah hari mati per tahun dan sembilan jam mati per tahun.',
      ),
      p(
        'Sub-bab ini menerjemahkan persen menjadi menit, menunjukkan cara menghitung ketersediaan sebuah rantai layanan, dan menjelaskan kenapa menambah komponen menurunkan ketersediaan sedangkan menambah cadangan menaikkannya.',
      ),

      terms(
        {
          term: 'availability (ketersediaan)',
          meaning:
            'Bagian waktu ketika sistem benar-benar melayani permintaan dengan benar, dinyatakan dalam persen. Dibaca "aveilabiliti". Perhatikan frasa "dengan benar", karena sistem yang menjawab dengan kode 500 pada setiap permintaan tetap dihitung sebagai tidak tersedia sekalipun prosesnya hidup.',
        },
        {
          term: 'nines (angka sembilan)',
          meaning:
            'Cara menyebut tingkat ketersediaan dengan menghitung digit sembilan. Dua sembilan berarti 99 persen, tiga sembilan berarti 99,9 persen, empat sembilan berarti 99,99 persen. Setiap tambahan satu sembilan mengurangi waktu mati menjadi sepersepuluhnya, dan biasanya melipatgandakan biayanya.',
        },
        {
          term: 'downtime',
          meaning:
            'Lama waktu sistem tidak melayani. Perlu disepakati apakah pemeliharaan terjadwal ikut dihitung, karena banyak perselisihan lahir dari perbedaan tafsir soal ini. Kebiasaan modern adalah menghitung semuanya, dengan alasan pengguna tidak peduli apakah matinya direncanakan.',
        },
        {
          term: 'redundancy (redundansi)',
          meaning:
            'Menyediakan lebih dari satu salinan sebuah komponen sehingga kegagalan satu salinan tidak menjatuhkan layanan. Dibaca "redundansi". Bentuknya bisa aktif, yaitu semua salinan melayani bersamaan, atau siaga, yaitu salinan cadangan menunggu giliran.',
        },
        {
          term: 'failover',
          meaning:
            'Perpindahan otomatis dari komponen yang gagal ke cadangannya. Dibaca "feilover". Perpindahan ini tidak pernah benar-benar seketika, karena selalu ada waktu untuk mendeteksi kegagalan, memilih cadangan, dan mengarahkan lalu lintas.',
        },
        {
          term: 'error budget',
          meaning:
            'Jatah kegagalan yang boleh dipakai dalam satu periode, yaitu selisih antara seratus persen dan target SLO. SLO 99,9 persen memberi jatah sekitar 43 menit per bulan. Gagasan pentingnya, jatah ini boleh dibelanjakan untuk merilis fitur baru, dan ketika jatahnya habis maka rilis dihentikan sampai periode berikutnya.',
        },
        {
          term: 'correlated failure',
          meaning:
            'Kegagalan beberapa komponen sekaligus karena penyebab yang sama, misalnya dua server yang mati bersamaan karena berada di rak yang sama, atau tiga replika yang rusak bersamaan karena menerima pembaruan versi yang cacat. Redundansi hanya membantu bila kegagalannya tidak berkorelasi.',
        },
      ),

      h2('Persen menjadi menit'),
      table(
        ['Ketersediaan', 'Mati per tahun', 'Mati per bulan', 'Mati per minggu'],
        [
          ['99% (dua sembilan)', '3,65 hari', '7,3 jam', '1,68 jam'],
          ['99,9% (tiga sembilan)', '**8,77 jam**', '**43,8 menit**', '10,1 menit'],
          ['99,95%', '4,38 jam', '21,9 menit', '5,04 menit'],
          ['99,99% (empat sembilan)', '**52,6 menit**', '**4,38 menit**', '1,01 menit'],
          ['99,999% (lima sembilan)', '5,26 menit', '26,3 detik', '6,05 detik'],
        ],
      ),
      p(
        'Perhatikan baris empat sembilan. Empat menit per bulan berarti kamu tidak punya waktu untuk seorang manusia menyadari ada masalah, membuka laptop, dan memutuskan sesuatu. Pada tingkat itu, seluruh pemulihan harus otomatis, dan itu adalah persyaratan teknis yang mahal.',
      ),
      p(
        'Baris lima sembilan berarti dua puluh enam detik per bulan. Menjanjikan angka itu tanpa infrastruktur berlipat di beberapa wilayah adalah janji yang tidak bisa ditepati, dan lebih baik tidak dijanjikan sejak awal.',
      ),
      callout(
        'tip',
        'Pilih angka sembilan yang bisa dibayar, bukan yang terdengar bagus',
        'Bagi sebagian besar aplikasi, 99,9 persen adalah target yang jujur dan bisa dicapai dengan susunan yang wajar. Naik ke 99,99 persen biasanya berarti melipatgandakan seluruh critical path dan menyiapkan pemulihan otomatis, dan pertanyaan yang sebenarnya adalah apakah tiga puluh sembilan menit tambahan per bulan itu bernilai sebesar biayanya.',
      ),

      h2('Rantai layanan mengalikan ketersediaan'),
      p(
        'Ini bagian yang paling sering mengejutkan. Ketika sebuah permintaan harus melewati beberapa komponen dan semuanya wajib hidup, ketersediaannya **dikalikan**, bukan diambil yang terkecil.',
      ),
      code(
        'text',
        `
        Load balancer  99,99%
        Aplikasi       99,9%
        Database       99,9%
        Cache          99,9%   (wajib, karena aplikasi gagal bila cache mati)

        Total = 0,9999 x 0,999 x 0,999 x 0,999 = ~99,69%
        `,
      ),
      p(
        'Empat komponen yang masing-masing terlihat andal menghasilkan sistem yang mati sekitar sepuluh jam per tahun, lebih buruk daripada komponen terburuknya. Setiap komponen tambahan pada jalur wajib **menurunkan** ketersediaan total, dan inilah harga tersembunyi dari memecah sistem menjadi banyak bagian.',
      ),
      p(
        'Baris keempat pada contoh itu sengaja ditulis. Cache seharusnya **tidak** wajib. Kalau aplikasimu gagal total ketika Redis mati, kamu baru saja mengubah komponen yang seharusnya mempercepat menjadi komponen yang bisa menjatuhkan.',
      ),
      code(
        'js',
        `
        // RAPUH: kegagalan cache menjatuhkan permintaan.
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached);
        const rows = await db.query(sql);
        await redis.set(key, JSON.stringify(rows), 'EX', 300);
        return rows;

        // TAHAN: cache boleh gagal, database tetap menjawab.
        let cached = null;
        try {
          cached = await redis.get(key);
        } catch (err) {
          metrics.increment('cache.error');
          logger.warn({ err, key }, 'cache tidak terjangkau, lanjut ke database');
        }
        if (cached) return JSON.parse(cached);

        const rows = await db.query(sql);
        try {
          await redis.set(key, JSON.stringify(rows), 'EX', 300);
        } catch (err) {
          metrics.increment('cache.error');
        }
        return rows;
        `,
        { caption: 'Versi kedua mengubah cache dari komponen wajib menjadi komponen opsional.' },
      ),
      p(
        'Perhatikan versi kedua tetap mencatat kegagalannya lewat `metrics.increment` dan `logger.warn`. Kegagalan yang ditelan diam-diam justru berbahaya, karena cache yang mati selama seminggu akan terlihat normal sampai databasenya tumbang. Bedanya dengan menelan error adalah kegagalannya tetap terlihat, hanya saja tidak diteruskan ke pengguna.',
      ),

      h2('Cadangan sejajar mengalikan keandalan ke arah sebaliknya'),
      p(
        'Kalau rantai menurunkan ketersediaan, cadangan sejajar menaikkannya, dan kenaikannya sangat besar. Sistem gagal hanya bila **semua** salinannya gagal bersamaan.',
      ),
      code(
        'text',
        `
        Satu server dengan ketersediaan 99%
        Peluang gagal = 1%

        Dua server sejajar, keduanya harus gagal
        Peluang gagal = 0,01 x 0,01 = 0,0001 = 0,01%
        Ketersediaan  = 99,99%

        Tiga server sejajar
        Peluang gagal = 0,01^3 = 0,000001
        Ketersediaan  = 99,9999%
        `,
      ),
      p(
        'Dua server yang biasa-biasa saja menghasilkan ketersediaan yang jauh lebih baik daripada satu server yang sangat bagus. Inilah alasan redundansi hampir selalu lebih murah daripada mengejar keandalan sempurna pada satu mesin, dan alasan kenapa jumlah minimum instance sebaiknya dua, bukan satu.',
      ),
      callout(
        'danger',
        'Perkalian ini hanya berlaku bila kegagalannya tidak berkorelasi',
        'Dua server di rak yang sama akan mati bersamaan ketika listrik raknya padam. Tiga replika yang menerima versi cacat yang sama akan rusak bersamaan dalam hitungan menit. Sertifikat yang kedaluwarsa mematikan seluruh armada sekaligus. Pada kasus seperti itu, perhitungan di atas sama sekali tidak berlaku, dan redundansi hanya membuatmu merasa aman tanpa benar-benar aman.',
      ),

      h2('Tidak semua bagian butuh angka sembilan yang sama'),
      p(
        'Menetapkan satu target ketersediaan untuk seluruh sistem adalah cara cepat membuat biayanya membengkak. Yang benar adalah menetapkannya per fungsi, sesuai akibat kalau fungsi itu mati.',
      ),
      table(
        ['Fungsi', 'Target yang masuk akal', 'Alasannya'],
        [
          ['Login dan checkout', '99,99%', 'Matinya berarti kehilangan pendapatan langsung'],
          ['Membaca konten', '99,9%', 'Mengganggu, tetapi bisa dilayani dari cache atau CDN'],
          ['Unggah gambar', '99,5%', 'Pengguna bisa mencoba lagi beberapa menit kemudian'],
          ['Halaman statistik', '99%', 'Tertunda beberapa jam pun tidak ada yang dirugikan'],
          ['Pengiriman email kampanye', '99%', 'Sifatnya asinkron, keterlambatan bisa diterima'],
        ],
      ),
      p(
        'Pembagian ini punya akibat teknis yang nyata. Fungsi dengan target tertinggi harus punya jalur yang sesedikit mungkin bergantung pada komponen lain, sedangkan fungsi dengan target rendah justru sebaiknya dipindahkan ke antrean agar kegagalannya tidak menyentuh jalur utama.',
      ),

      h2('Error budget, cara memakai jatah kegagalan'),
      p(
        'Gagasan yang mengubah cara tim bekerja adalah menganggap sisa antara SLO dan seratus persen sebagai **jatah yang boleh dibelanjakan**, bukan sebagai kegagalan yang harus dihindari total.',
      ),
      code(
        'text',
        `
        SLO 99,9% per bulan
        Jatah kegagalan = 0,1% x 30 hari = ~43 menit

        Terpakai minggu 1   8 menit   rilis yang harus dikembalikan
        Terpakai minggu 2   0 menit
        Terpakai minggu 3  25 menit   database gagal berpindah otomatis
        ------------------------------------------------
        Terpakai           33 menit   sisa 10 menit
        `,
      ),
      p(
        'Selama jatah masih ada, tim boleh merilis dengan agresif karena risiko yang diambil masih terbayar. Ketika jatahnya habis, rilis fitur dihentikan dan perhatian dialihkan ke keandalan sampai periode berikutnya. Kerangka ini menghilangkan perdebatan yang biasanya tidak berujung antara pihak yang ingin cepat merilis dan pihak yang ingin aman, karena keduanya sekarang membaca angka yang sama.',
      ),
      p(
        'Untuk bisa menerapkannya, kamu perlu mengukur SLI-nya lebih dulu, dan alat untuk itu sudah dibahas di sub-bab [pemantauan dan uptime](/kelas/deployment/setelah-rilis/monitoring-uptime).',
      ),

      references(
        {
          label: 'Embracing Risk',
          href: 'https://sre.google/sre-book/embracing-risk/',
          source: 'Google SRE',
          note: 'Sumber asli gagasan error budget dan cara menghitungnya.',
        },
        {
          label: 'Service Level Objectives',
          href: 'https://sre.google/sre-book/service-level-objectives/',
          source: 'Google SRE',
          note: 'Cara memilih target ketersediaan per fungsi, bukan satu angka untuk semuanya.',
        },
        {
          label: 'Kubernetes: Pod Topology Spread Constraints',
          href: 'https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/',
          source: 'Kubernetes',
          note: 'Contoh mekanisme yang khusus dibuat untuk mencegah correlated failure.',
        },
        {
          label: 'PostgreSQL: High Availability, Load Balancing, and Replication',
          href: 'https://www.postgresql.org/docs/current/high-availability.html',
          source: 'PostgreSQL',
          note: 'Pilihan resmi untuk menghilangkan database sebagai single point of failure.',
        },
      ),
    ],
  ),

  written(
    'menulis-dokumen-desain',
    'Menulis Dokumen Desain Satu Halaman',
    12,
    'Menggabungkan seluruh bab menjadi satu dokumen yang bisa dibaca orang lain.',
    [
      p(
        'Enam sub-bab sebelumnya memberi kosakata, urutan kerja, dan angka. Sub-bab penutup ini menggabungkannya menjadi satu keluaran yang nyata, yaitu dokumen desain satu halaman. Dokumen ini bukan formalitas perusahaan besar. Ia adalah cara termurah mengetahui bahwa kamu benar-benar sudah memikirkan sesuatu, karena gagasan yang belum bisa ditulis dalam satu halaman biasanya memang belum selesai dipikirkan.',
      ),
      p(
        'Aturan yang menjaganya tetap berguna hanya satu, yaitu ia harus **satu halaman**. Batas itu memaksa setiap kalimat memperebutkan tempatnya, dan hasilnya adalah dokumen yang benar-benar dibaca orang lain.',
      ),

      terms(
        {
          term: 'design doc',
          meaning:
            'Tulisan pendek yang menjelaskan apa yang akan dibangun, bagaimana bentuknya, kenapa bentuk itu yang dipilih, dan apa yang sengaja tidak dikerjakan. Bedanya dengan dokumentasi biasa, dokumen desain ditulis **sebelum** kodenya ada, dan nilainya justru pada bagian alasannya.',
        },
        {
          term: 'ADR (architecture decision record)',
          meaning:
            'Catatan satu keputusan arsitektur beserta konteks dan akibatnya, disimpan permanen dan diberi nomor. Dibaca "ei-di-ar". Bedanya dengan dokumen desain, ADR mencatat **satu** keputusan yang berumur panjang, sedangkan dokumen desain menggambarkan satu sistem secara keseluruhan. Format yang dipakai project ini ada di folder `docs/adr`.',
        },
        {
          term: 'alternatif yang ditolak',
          meaning:
            'Bagian dokumen yang mencatat pilihan lain yang sempat dipertimbangkan beserta alasan penolakannya. Bagian ini yang paling sering dilewati dan paling sering dicari orang berikutnya, karena tanpanya sebuah perdebatan yang sudah selesai akan diulang dari awal enam bulan kemudian.',
        },
        {
          term: 'trigger (pemicu)',
          meaning:
            'Kondisi terukur yang menandakan sebuah rencana perbaikan harus mulai dikerjakan, misalnya "ketika beban tulis melewati 60 persen kapasitas". Pemicu mengubah rencana yang kabur menjadi rencana yang bisa dipantau otomatis.',
        },
      ),

      h2('Kerangka delapan bagian'),
      p(
        'Kerangka berikut mengikuti empat langkah di sub-bab 1.3, dengan tambahan dua bagian yang khusus berguna bagi pembaca di masa depan.',
      ),
      table(
        ['Bagian', 'Isinya', 'Panjang yang wajar'],
        [
          [
            '1. Masalah',
            'Apa yang belum bisa dilakukan hari ini, dan siapa yang dirugikan',
            '2 sampai 3 kalimat',
          ],
          ['2. Cakupan', 'Apa yang dikerjakan, dan apa yang sengaja tidak', 'Dua daftar pendek'],
          [
            '3. Angka',
            'DAU, QPS puncak, penyimpanan, target latensi dan ketersediaan',
            'Satu tabel asumsi',
          ],
          [
            '4. Desain',
            'Diagram berlabel, kontrak API inti, model data inti',
            'Satu diagram dan dua potongan',
          ],
          [
            '5. Keputusan penting',
            'Dua sampai tiga keputusan tersulit beserta pembandingnya',
            'Satu tabel per keputusan',
          ],
          ['6. Alternatif yang ditolak', 'Pilihan lain dan alasan penolakannya', 'Beberapa baris'],
          [
            '7. Risiko dan pertukaran',
            'Yang diterima secara sadar beserta akibatnya bagi pengguna',
            'Daftar pendek',
          ],
          ['8. Rencana berikutnya', 'Bottleneck berikutnya beserta pemicunya', 'Daftar pendek'],
        ],
      ),

      h2('Contoh utuh'),
      p(
        'Berikut satu dokumen lengkap untuk fitur yang cukup kecil sehingga seluruhnya muat, yaitu penghitung pembaca tulisan pada aplikasi blog.',
      ),
      code(
        'text',
        `
        DESAIN: PENGHITUNG PEMBACA TULISAN
        Penulis: <nama>   Tanggal: 2026-08-24   Status: usulan

        1. MASALAH
        Penulis tidak tahu tulisannya dibaca berapa orang. Menghitung dengan
        UPDATE pada setiap kunjungan menambahkan satu penulisan database ke jalur
        baca yang saat ini sepenuhnya bisa di-cache, dan itu membatalkan cache.

        2. CAKUPAN
        Dikerjakan     : jumlah pembaca per tulisan, tampil di halaman tulisan
                         dan di dasbor penulis.
        Tidak dikerjakan: pembaca unik per orang, asal negara, grafik per jam.

        3. ANGKA
        DAU                    200.000    dari analitik
        Baca per pengguna           20    dari analitik
        Baca per hari        4.000.000
        QPS baca rata-rata          46
        QPS baca puncak            140    faktor 3x
        Tulisan yang ada        50.000
        Target latensi tambahan  < 5 ms   pada P95 halaman tulisan
        Toleransi keterlambatan  60 detik angka boleh tertinggal semenit

        4. DESAIN
        Browser --GET /p/{slug}--> Aplikasi
                                     |
                                     +--INCR viewsraw:{id}--> Redis
                                     |
                                     +--baca views dari kolom--> PostgreSQL

        Worker berkala (tiap 60 detik)
          Redis SCAN viewsraw:* --> UPDATE posts SET views = views + n --> hapus kunci

        Skema: ALTER TABLE posts ADD COLUMN views BIGINT NOT NULL DEFAULT 0;

        5. KEPUTUSAN PENTING
        Di mana angka dijumlahkan?
        | Pilihan               | Kelebihan            | Kekurangan                    |
        | UPDATE tiap kunjungan | Selalu tepat         | 140 tulisan/detik ke database |
        |                       |                      | dan cache halaman batal       |
        | INCR Redis + berkala  | Beban database nyaris| Angka tertinggal <= 60 detik  |
        |                       | nol                  | Hilang bila Redis mati        |
        Dipilih: INCR Redis + berkala. Toleransi 60 detik sudah disepakati di
        bagian 3, dan menahan 140 penulisan per detik dari database jauh lebih
        berharga daripada ketepatan sesaat pada angka yang sifatnya hiasan.

        6. ALTERNATIF YANG DITOLAK
        - Tabel peristiwa terpisah lalu dijumlahkan saat baca. Ditolak karena
          menambah 50 juta baris per tahun untuk angka yang tidak pernah
          dipertanyakan ketepatannya.
        - Layanan analitik pihak ketiga. Ditolak karena angkanya harus tampil di
          dasbor penulis, sehingga tetap dibutuhkan salinan di database sendiri.

        7. RISIKO DAN PERTUKARAN
        - Redis mati berarti kehilangan hitungan sampai 60 detik terakhir. Diterima.
        - Angka di halaman bisa tertinggal semenit. Diterima, sudah dinyatakan di
          bagian 3.
        - Worker berkala adalah komponen baru yang harus dipantau. Ditambahkan ke
          daftar alert.

        8. RENCANA BERIKUTNYA
        - Pembaca unik per orang, bila diminta. Pemicu: permintaan dari tiga
          penulis atau lebih.
        - Pindahkan penjumlahan ke antrean bila jumlah tulisan melewati 500.000,
          karena SCAN berkala mulai mahal di atas angka itu.
        `,
        {
          caption:
            'Satu halaman, dan setiap bagian menjawab pertanyaan yang benar-benar akan ditanyakan.',
        },
      ),

      h2('Apa yang membuat dokumen ini berguna'),
      p(
        'Perhatikan beberapa hal pada contoh di atas, karena hal-hal itulah yang membedakan dokumen yang dibaca dari dokumen yang diarsipkan.',
      ),
      ul(
        '**Bagian 3 dirujuk oleh bagian 5.** Keputusan dibenarkan dengan angka yang sudah disepakati sebelumnya, bukan dengan pendapat. Ini yang membuat keputusannya bisa diperiksa orang lain.',
        '**Bagian 5 memuat pembanding.** Satu pilihan tanpa pembanding tidak bisa dinilai, karena pembaca tidak tahu apa yang sudah dipertimbangkan.',
        '**Bagian 6 mencatat yang ditolak.** Tanpa ini, seseorang akan mengusulkan tabel peristiwa terpisah lagi dalam tiga bulan.',
        '**Bagian 7 mengaku kehilangan data.** Kalimat "Redis mati berarti kehilangan hitungan" ditulis terbuka, sehingga tidak ada yang terkejut ketika itu benar-benar terjadi.',
        '**Bagian 8 punya pemicu terukur.** "Bila jumlah tulisan melewati 500.000" bisa dipantau, sedangkan "nanti kalau sudah besar" tidak.',
      ),

      h2('Kapan dokumen ini tidak diperlukan'),
      p(
        'Menulis dokumen untuk setiap perubahan akan mematikan kebiasaannya sendiri. Batasnya kira-kira begini.',
      ),
      table(
        ['Situasi', 'Perlu dokumen?', 'Alasan'],
        [
          [
            'Menambah satu endpoint dengan pola yang sudah ada',
            'Tidak',
            'Tidak ada keputusan berarti yang diambil',
          ],
          ['Memperbaiki bug', 'Tidak', 'Yang dibutuhkan adalah akar masalah, bukan desain'],
          [
            'Menambah komponen infrastruktur baru',
            'Ya',
            'Menambah bagian yang bisa rusak dan harus dipantau',
          ],
          ['Mengubah model data yang sudah berisi data', 'Ya', 'Paling mahal untuk dibatalkan'],
          [
            'Memilih antara dua library yang setara',
            'Cukup ADR pendek',
            'Satu keputusan, bukan satu sistem',
          ],
          ['Mengubah cara sesuatu diskalakan', 'Ya', 'Akibatnya terasa jauh setelah rilis'],
        ],
      ),
      p(
        'Untuk baris yang cukup ADR, project ini sudah punya tempatnya. Formatnya ada di folder `docs/adr`, dan isinya cukup konteks, keputusan, serta akibatnya.',
      ),
      callout(
        'tip',
        'Dokumen yang basi lebih berbahaya daripada tidak ada dokumen',
        'Ketika desainnya berubah di tengah jalan, ubah dokumennya di perubahan yang sama. Dokumen yang masih menggambarkan rencana lama akan tetap dipercaya, lalu ditemukan salah pada saat yang paling tidak tepat. Kalau sebuah dokumen sudah tidak bisa dijaga kebenarannya, menghapusnya lebih baik daripada membiarkannya.',
      ),

      h2('Menutup bab ini'),
      p(
        'Sampai di sini kamu punya seluruh perkakas untuk memulai sebuah desain, yaitu kosakata untuk menyebut bagian-bagiannya, urutan kerja yang menjaga perhatian tetap seimbang, aritmetika untuk mengubah pengguna menjadi angka, angka latensi untuk menilai apa yang mungkin, dan cara menghitung ketersediaan sebuah rantai.',
      ),
      p(
        'Yang belum kamu punya adalah katalog blok yang bisa dipasang, dan itulah isi Bab 2. Setiap blok di sana akan diperkenalkan dengan pola yang sama, yaitu masalah apa yang diselesaikannya, kapan ia mulai dibutuhkan, wujud konkretnya di stack yang sudah kamu pakai, dan harga yang harus dibayar untuk memasangnya.',
      ),

      references(
        {
          label: 'Site Reliability Engineering: Postmortem Culture',
          href: 'https://sre.google/sre-book/postmortem-culture/',
          source: 'Google SRE',
          note: 'Contoh budaya menulis yang jujur soal kelemahan, dasar yang sama dengan bagian 7 dokumen ini.',
        },
        {
          label: 'OpenAPI Specification',
          href: 'https://spec.openapis.org/oas/latest.html',
          source: 'OpenAPI Initiative',
          note: 'Format resmi bila bagian kontrak API pada dokumen perlu ditulis lengkap.',
        },
        {
          label: 'PostgreSQL: ALTER TABLE',
          href: 'https://www.postgresql.org/docs/current/sql-altertable.html',
          source: 'PostgreSQL',
          note: 'Rujukan untuk perubahan skema yang muncul di bagian desain contoh.',
        },
      ),
    ],
  ),
];
