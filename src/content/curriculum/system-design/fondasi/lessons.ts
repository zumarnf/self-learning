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
    19,
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

      h2('Studi kasus di project nyata'),
      p(
        'Desain sistem menjadi perlu tepat pada saat satu mesin berhenti cukup, dan titik itu jarang datang sebagai kegagalan yang jelas. Ia datang sebagai angka yang perlahan bergerak ke arah yang salah.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada mesin ini, dan angkanya menjelaskan
        kenapa pertanyaan skala punya jawaban yang berbeda-beda:

          baca 1 nilai dari array di memori          43 ns
          cari 1 kunci di Map 100.000 entri          50 ns
          SELECT 1 baris by primary key (sqlite)   1,05 us
          baca 1 KB dari SSD (cache OS)            3,38 us
          tulis 1 KB + fsync ke SSD                1,24 ms
          HTTP round trip ke 127.0.0.1             1,69 ms
          HTTP round trip ke internet             70,04 ms

        Selisih antara baris pertama dan terakhir adalah 1,6 juta kali.
        `,
        {
          caption:
            'Sebagian besar keputusan desain sistem sebenarnya keputusan tentang di baris mana pekerjaan itu dilakukan.',
        },
      ),
      p(
        'Pertanyaan pertama yang benar bukan "bagaimana menskalakannya" melainkan "apa yang sebenarnya menjadi penghambat", dan jawabannya sering mengejutkan.',
      ),
      code(
        'text',
        `
        Contoh dari project ini sendiri, diukur sungguhan.

        Gejala : npm run build gagal, beberapa halaman melewati batas
                 60 detik saat prarender — termasuk halaman yang tidak
                 disentuh sama sekali.

        Dugaan pertama: ada halaman yang berat.

        Yang diukur:
          penyorotan kode seluruh 427 halaman : 5.785 ms total
          rata-rata per halaman               :    14 ms
          halaman yang GAGAL                  :    30 ms
          salah satu halaman yang gagal       : tidak punya blok kode

        Halaman itu TIDAK lambat. Yang diukur berikutnya:
          CPU 4, swap 0, memori tersisa ~1,1 GB
          Next menjalankan 3 worker, ditambah basis data, peramban,
          dan editor yang sudah berjalan
          load average saat gagal: 12,84 pada mesin 4 CPU

        Satu perubahan, satu variabel:
          CIRCLE_NODE_TOTAL=2 npm run build
          -> EXIT=0, 506 halaman, 15,9 detik
        `,
      ),
      p(
        'Itulah bentuk kerja desain sistem yang sesungguhnya, dan ia jarang terlihat seperti diagram. Ia terlihat seperti mengukur sesuatu, menemukan bahwa dugaannya salah, lalu mengukur hal berikutnya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Sistem yang mulai melewati batas kemampuan satu mesin punya gejala yang khas, dan kebanyakan tidak berupa pesan error.',
      ),
      code(
        'text',
        `
        YANG BERUPA ERROR:

          Error: connect ETIMEDOUT
            koneksi habis, atau backend tidak menjawab

          error: sorry, too many clients already
            batas koneksi basis data terlampaui

          JavaScript heap out of memory
            satu proses menampung lebih dari yang muat

          Error: EMFILE: too many open files
            batas deskriptor berkas per proses terlampaui

        YANG TIDAK BERUPA ERROR, dan justru lebih sering:

          p50 tetap 80 ms, p99 naik dari 300 ms menjadi 4 detik
          antrean job tumbuh 200 pesan per jam, tidak pernah turun
          basis data memakai 90% CPU pada jam sibuk
          pengguna keluar sendiri sesudah instance ditambah
        `,
      ),
      p(
        'Baris pertama pada kelompok kedua pantas ditegaskan, sebab ia cara paling umum sebuah sistem memburuk tanpa ada yang menyadarinya.',
      ),
      code(
        'text',
        `
        Kenapa rata-rata menyembunyikannya:

          100 permintaan, 95 selesai dalam 50 ms, 5 dalam 4.000 ms
            rata-rata = 247 ms       <- terlihat wajar
            p50       =  50 ms       <- terlihat sangat bagus
            p95       =  50 ms
            p99       = 4.000 ms     <- ini yang dirasakan 1 dari 100 orang

        Pada seratus ribu permintaan per hari, "1 dari 100" berarti
        seribu orang setiap hari. Itu bukan pencilan.
        `,
      ),
      p(
        'Kesalahan berikutnya bersifat arah, yaitu menyelesaikan masalah skala yang belum ada sambil mengabaikan yang sudah ada.',
      ),
      code(
        'text',
        `
        Diukur sungguhan di bab lain pada project yang sama:

          pemakaian OFFSET pada 200.000 baris : 0,01 ms di halaman 1,
                                                1,51 ms di halaman jauh
          keyset pagination                   : rata 0,01 ms

          agregasi GROUP BY 1.000.000 komentar : 468,9 ms
          dibaca dari kolom denormalisasi      :   0,068 ms

        Kedua perbaikan itu tidak memerlukan mesin tambahan, tidak
        memerlukan cache, dan tidak memerlukan antrean. Keduanya
        perubahan satu query.

        Menambah mesin sebelum mengukur query hampir selalu berarti
        membayar lebih mahal untuk masalah yang sama.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Desain sistem adalah area tempat jawaban yang terdengar canggih paling mudah menggantikan jawaban yang benar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Merancang untuk jutaan pengguna sejak awal',
            'Biar tidak perlu ditulis ulang nanti',
            'Kerumitannya dibayar setiap hari, manfaatnya mungkin tidak pernah datang. Ukur dulu di mana batasnya',
          ],
          [
            'Menambah mesin sebelum mengukur query',
            'Sistemnya kan melambat',
            'Diukur, satu perubahan query mengubah 468,9 ms menjadi 0,068 ms tanpa mesin tambahan',
          ],
          [
            'Menilai performa dari rata-rata',
            'Itu angka ringkasannya',
            'Rata-rata menyembunyikan ekor. p99 4 detik berarti seribu orang per hari menunggu 4 detik',
          ],
          [
            'Menyimpulkan penyebab dari gejala',
            'Pesannya sudah jelas menyebut timeout',
            'Diukur pada project ini, halaman yang gagal hanya 30 ms. Penyebabnya memori mesin',
          ],
          [
            'Menyalin arsitektur perusahaan besar',
            'Mereka kan sudah teruji',
            'Arsitektur mereka menjawab masalah mereka, termasuk masalah organisasi yang tidak kamu punya',
          ],
          [
            'Menganggap desain sistem adalah menggambar diagram',
            'Itu yang terlihat di hasilnya',
            'Yang menentukan adalah angka: berapa besar, berapa cepat, berapa sering, dan apa yang boleh gagal',
          ],
        ],
      ),
      p(
        'Satu kebiasaan memisahkan pekerjaan desain sistem yang berguna dari yang sekadar terlihat rapi, yaitu setiap keputusan disertai angka yang menjadi dasarnya. Bukan "kita butuh cache" melainkan "endpoint ini dipanggil 34.000 kali per menit pada jam puncak, hasilnya sama untuk semua orang selama lima menit, dan tanpa cache basis datanya berada di 90% CPU". Angka itu juga yang nanti memberi tahu kapan keputusannya perlu ditinjau ulang.',
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
    18,
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

      h2('Studi kasus di project nyata'),
      p(
        'Kebutuhan fungsional menentukan apa yang dilakukan sistem, dan kebutuhan non-fungsional menentukan bentuknya. Yang kedua jauh lebih menentukan arsitektur, dan justru itu yang paling sering tidak ditulis.',
      ),
      code(
        'text',
        `
        Dua sistem dengan kebutuhan FUNGSIONAL yang sama persis:
          "pengguna dapat mengunggah foto dan melihatnya kembali"

        Sistem A, non-fungsional:
          10 pengguna, foto di bawah 5 MB, boleh lambat beberapa detik,
          boleh mati semalam

          -> satu server, disk lokal, tanpa CDN. Selesai dalam sehari.

        Sistem B, non-fungsional:
          10 juta pengguna, 100 foto/detik, muncul di bawah 200 ms
          di seluruh dunia, 99,95% tersedia, data tidak boleh hilang

          -> object storage, CDN, antrean pengolahan, beberapa wilayah,
             cadangan lintas wilayah. Berbulan-bulan.

        Kalimat fungsionalnya identik. Arsitekturnya tidak punya
        satu pun kesamaan.
        `,
        {
          caption:
            'Karena itu pertanyaan pertama pada wawancara desain sistem selalu tentang angka, bukan tentang fitur.',
        },
      ),
      p(
        'Kebutuhan non-fungsional yang berguna selalu punya angka, dan angka itu punya konsekuensi yang bisa dihitung.',
      ),
      code(
        'text',
        `
        Dihitung sungguhan, dari target ketersediaan ke waktu mati
        yang diizinkan:

              90%    ->  876,0 jam/tahun   4380,0 menit/bulan
              99%    ->   87,6 jam/tahun    438,0 menit/bulan
            99,9%    ->    8,8 jam/tahun     43,8 menit/bulan
           99,95%    ->    4,4 jam/tahun     21,9 menit/bulan
           99,99%    ->    0,9 jam/tahun      4,4 menit/bulan
          99,999%    ->    0,1 jam/tahun      0,4 menit/bulan

        Perhatikan baris keempat ke lima. Naik dari 99,95% ke 99,99%
        berarti waktu mati yang diizinkan turun dari 21,9 menjadi
        4,4 menit per bulan. Empat menit tidak cukup untuk seorang
        manusia bangun, membaca alarm, dan memutuskan apa pun.

        Artinya: di atas 99,95%, pemulihan harus OTOMATIS. Itu
        keputusan arsitektur yang lahir langsung dari satu angka.
        `,
      ),
      p('Hal yang sama berlaku untuk latensi, dan di sini bentuk angkanya menentukan.'),
      code(
        'text',
        `
        "Harus cepat"                    -> tidak bisa diuji
        "Rata-rata di bawah 200 ms"      -> menyembunyikan ekor
        "p95 di bawah 200 ms"            -> bisa diuji
        "p99 di bawah 500 ms untuk
         pencarian, diukur dari peramban
         pengguna di Indonesia"          -> bisa diuji DAN bisa dirancang

        Kenapa bentuk terakhir penting, dihitung dari angka yang diukur:
          HTTP round trip ke internet, p50 70,04 ms, p99 362,72 ms

        Bila satu permintaan halaman memerlukan tiga panggilan API
        berurutan ke server yang jauh, p99-nya sudah lebih dari satu
        detik sebelum satu baris logika pun dijalankan.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kebutuhan non-fungsional yang tidak ditulis tidak menghasilkan error saat dibangun. Ia menghasilkan penulisan ulang setelah sistemnya dipakai.',
      ),
      code(
        'text',
        `
        Bentuk yang khas:

          "Ternyata harus mendukung 20 bahasa"
            -> setiap teks yang ditanam di kode harus dicabut

          "Ternyata data pengguna Eropa tidak boleh keluar Eropa"
            -> basis data tunggal harus dipecah per wilayah

          "Ternyata harus ada jejak audit untuk setiap perubahan"
            -> setiap penulisan harus melewati satu jalur, dan
               jalur itu tidak ada

          "Ternyata harus bisa dipakai saat jaringan putus"
            -> seluruh asumsi tentang kapan data tersedia berubah

        Keempatnya bukan fitur baru. Keempatnya kebutuhan yang sudah
        ada sejak awal dan tidak pernah ditanyakan.
        `,
      ),
      p(
        'Arah sebaliknya juga menghasilkan kerugian, yaitu kebutuhan yang ditulis terlalu tinggi tanpa dasar.',
      ),
      code(
        'text',
        `
        "Kami butuh 99,999%"

        Dihitung: 0,4 menit per bulan. Konsekuensinya:
          - beberapa wilayah aktif bersamaan
          - failover otomatis yang diuji rutin
          - basis data dengan replikasi sinkron
          - tim yang siaga sepanjang waktu

        Dan pertanyaan yang jarang diajukan:
          Berapa kerugian nyata bila sistem ini mati 40 menit
          sebulan sekali?

        Untuk sebagian besar produk, jawabannya jauh lebih kecil
        daripada biaya mengejar sembilan yang kelima.
        `,
        {
          caption:
            'Kebutuhan non-fungsional yang terlalu tinggi sama merugikannya dengan yang tidak ditulis.',
        },
      ),
      p(
        'Ada satu kebutuhan yang hampir selalu terlewat dan akibatnya paling sulit diperbaiki belakangan, yaitu pertumbuhan.',
      ),
      code(
        'text',
        `
        Pertanyaannya bukan "berapa data sekarang" melainkan
        "berapa dalam tiga tahun".

        Dihitung untuk satu contoh pemendek alamat:
          per baris ~283 byte (kode 7 + url 200 + id 8 + waktu 8 + overhead 60)

           1 tahun @ 100 juta/hari ->  10,3 TB
           5 tahun                 ->  51,6 TB
          10 tahun                 -> 103,3 TB

        Pada 10,3 TB, satu mesin masih mungkin. Pada 103,3 TB, tidak.
        Dan keputusan tentang shard key harus diambil SEBELUM datanya
        sebesar itu, sebab memecah data yang sudah besar jauh lebih
        mahal daripada memecahnya sejak awal.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kebutuhan non-fungsional terasa seperti formalitas dokumen, dan ia satu-satunya bagian yang benar-benar menentukan bentuk sistemnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis "harus cepat" dan "harus andal"',
            'Itu memang yang diinginkan',
            'Tidak bisa diuji dan tidak bisa dirancang. Sebutkan persentil, ambang, dan dari mana diukurnya',
          ],
          [
            'Menetapkan target ketersediaan tanpa menghitungnya',
            'Angkanya kan cuma persen',
            'Dihitung, 99,99% berarti 4,4 menit per bulan. Itu menuntut pemulihan otomatis',
          ],
          [
            'Memakai rata-rata sebagai target latensi',
            'Itu angka ringkasannya',
            'Rata-rata menyembunyikan ekor. Yang dirasakan pengguna adalah p95 dan p99',
          ],
          [
            'Tidak menanyakan pertumbuhan data',
            'Sekarang masih kecil',
            'Dihitung, 10,3 TB di tahun pertama menjadi 103,3 TB di tahun kesepuluh. Keputusan shard diambil sebelum itu',
          ],
          [
            'Menetapkan target setinggi mungkin untuk aman',
            'Lebih tinggi kan lebih baik',
            'Biayanya nyata dan dibayar setiap hari. Tanyakan berapa kerugian sesungguhnya bila targetnya lebih rendah',
          ],
          [
            'Menganggap kebutuhan non-fungsional urusan nanti',
            'Yang penting fiturnya jalan dulu',
            'Kepatuhan wilayah data, jejak audit, dan dukungan luring bukan fitur. Ketiganya mengubah arsitektur',
          ],
        ],
      ),
      p(
        'Ada satu pertanyaan yang bila diajukan di awal menghemat sangat banyak, dan bunyinya sederhana. Apa yang harus benar tentang sistem ini yang tidak akan pernah muncul di daftar fitur? Jawabannya biasanya memuat kata seperti aturan wilayah data, jejak audit, jumlah bahasa, batas ukuran, dan berapa lama data harus disimpan, dan kelimanya adalah hal yang paling mahal ditambahkan belakangan.',
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
    19,
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

      h2('Studi kasus di project nyata'),
      p(
        'Proses empat langkah terasa seperti tata cara wawancara, dan nilainya justru pada pekerjaan sehari-hari, sebab ia mencegah kebiasaan yang paling mahal, yaitu memilih solusi sebelum masalahnya diukur.',
      ),
      p('Langkah pertama menghasilkan angka, dan angka itulah yang menentukan seluruh sisanya.'),
      code(
        'text',
        `
        LANGKAH 1 — perjelas dan sepakati batasnya

        Yang harus keluar sebagai ANGKA, bukan kalimat:
          berapa pengguna aktif harian
          berapa operasi tulis dan baca per hari
          berapa rasio baca terhadap tulis
          berapa besar satu satuan data
          berapa lama data disimpan
          berapa target latensi, pada persentil berapa
          berapa target ketersediaan
          mana yang boleh basi, dan berapa lama

        Yang harus keluar sebagai BATAS:
          apa yang TIDAK dikerjakan sistem ini
        `,
        {
          caption:
            'Baris terakhir sering paling berguna, sebab ia yang mencegah cakupannya melebar tanpa batas.',
        },
      ),
      code(
        'text',
        `
        LANGKAH 2 — estimasi kasar, dihitung sungguhan

          100.000.000 tulis/hari
            -> rata-rata     1.157 QPS
            -> puncak ~3x    3.472 QPS

          1.000.000.000 baca/hari (rasio 10:1)
            -> rata-rata    11.574 QPS
            -> puncak ~3x   34.722 QPS

          penyimpanan, 283 byte per baris:
             1 tahun  ->  10,3 TB
             5 tahun  ->  51,6 TB
            10 tahun  -> 103,3 TB

        Angka-angka itu langsung memutuskan beberapa hal:
          34.722 QPS baca  -> satu basis data tidak cukup; butuh cache
                              atau replika baca
          103,3 TB         -> satu mesin tidak cukup; butuh sharding
          1.157 QPS tulis  -> masih mungkin satu primary
        `,
      ),
      p(
        'Langkah ketiga barulah menggambar, dan yang digambar adalah jawaban atas angka-angka di langkah kedua, bukan diagram yang sudah dibayangkan sejak awal.',
      ),
      code(
        'text',
        `
        LANGKAH 3 — rancangan tingkat tinggi

        Untuk tiap kotak yang digambar, ada satu pertanyaan wajib:
          "Angka mana di langkah 2 yang membuat kotak ini perlu ada?"

        Kotak yang tidak bisa menjawabnya adalah kotak yang
        sebenarnya belum dibutuhkan.

        LANGKAH 4 — perdalam yang paling menentukan

        Bukan mendalami semuanya, melainkan satu atau dua bagian yang
        paling berisiko. Biasanya:
          - skema data dan shard key-nya
          - jalur terpanas, yaitu yang QPS-nya paling tinggi
          - apa yang terjadi saat komponen X mati
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan proses ini punya bentuk yang sangat khas, dan yang paling sering adalah melompat langsung ke langkah tiga.',
      ),
      code(
        'text',
        `
        Gejalanya terdengar seperti ini:

          "Kita pakai microservices, Kafka, dan Redis."
          Pertanyaan: berapa QPS-nya?
          Jawaban  : belum tahu.

        Contoh nyata dari project ini, yang menunjukkan biayanya:

          Gejala : build gagal, beberapa halaman melewati 60 detik.
          Dugaan : ada halaman yang berat. Solusi yang terbayang:
                   sederhanakan halamannya, atau naikkan batas waktunya.

          Yang terjadi bila langsung ke solusi: halaman disederhanakan,
          build tetap gagal, dan waktu terbuang.

          Yang terjadi bila diukur dulu:
            rata-rata per halaman :  14 ms
            halaman yang gagal    :  30 ms
            satu halaman yang gagal tidak punya blok kode sama sekali
            load average          : 12,84 pada mesin 4 CPU
            swap                  : 0
            memori tersisa        : ~1,1 GB

          Satu perubahan, satu variabel:
            CIRCLE_NODE_TOTAL=2 npm run build -> EXIT=0, 15,9 detik
        `,
        {
          caption:
            'Dugaan pertamanya masuk akal dan salah. Yang membedakan hanya urutan: ukur dulu, baru simpulkan.',
        },
      ),
      p(
        'Kegagalan kedua berupa estimasi yang dibuat sedemikian teliti sehingga waktunya habis di sana.',
      ),
      code(
        'text',
        `
        Estimasi kasar memang KASAR. Yang dicari bukan angka yang
        tepat melainkan URUTAN BESARANNYA.

          "sekitar 1.000 QPS"     -> satu mesin mungkin cukup
          "sekitar 100.000 QPS"   -> jelas tidak cukup
          "sekitar 10 TB"         -> satu basis data masih mungkin
          "sekitar 1 PB"          -> jelas tidak

        Selisih antara 1.157 dan 1.200 QPS tidak mengubah satu pun
        keputusan. Selisih antara 1.157 dan 34.722 mengubah semuanya.

        Bulatkan dengan berani, tulis asumsinya, dan lanjut.
        `,
      ),
      p(
        'Kegagalan ketiga menyangkut asumsi yang dipakai tanpa ditulis, dan akibatnya baru terlihat ketika orang lain membaca rancangannya.',
      ),
      code(
        'text',
        `
        Setiap angka di langkah 2 lahir dari asumsi. Tulis asumsinya
        di sebelah angkanya:

          rata-rata 1.157 QPS
            asumsi: lalu lintas merata sepanjang hari
            faktor puncak 3x
            asumsi: pola harian biasa, TANPA kampanye pemasaran

          283 byte per baris
            asumsi: URL rata-rata 200 karakter
            asumsi: tanpa indeks tambahan

        Yang membuat asumsi berbahaya bukan salahnya, melainkan
        tidak terlihatnya. Asumsi yang tertulis bisa dikoreksi orang
        lain dalam satu kalimat; asumsi yang tidak tertulis baru
        ketahuan setelah sistemnya dibangun.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Empat langkah ini mudah dihafal dan mudah dilewati, dan yang paling sering dilewati adalah dua yang pertama.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Langsung menggambar arsitektur',
            'Itu yang ditunggu orang',
            'Tidak ada dasar untuk menilai apakah tiap kotaknya perlu ada. Ukur dulu di langkah 1 dan 2',
          ],
          [
            'Melewatkan estimasi karena "belum tahu angkanya"',
            'Menebak kan tidak ilmiah',
            'Estimasi kasar dengan asumsi tertulis jauh lebih berguna daripada tidak ada angka sama sekali',
          ],
          [
            'Menghitung estimasi sampai ke digit terakhir',
            'Biar akurat',
            'Yang dicari urutan besarannya. 1.157 melawan 1.200 QPS tidak mengubah satu pun keputusan',
          ],
          [
            'Tidak menulis asumsi di sebelah angkanya',
            'Angkanya sudah ada',
            'Asumsi yang tidak terlihat tidak bisa dikoreksi. Ia baru ketahuan setelah sistemnya dibangun',
          ],
          [
            'Menyimpulkan penyebab dari gejala',
            'Pesannya sudah menyebutnya',
            'Diukur pada project ini, halaman yang "lambat" hanya 30 ms. Penyebabnya memori mesin',
          ],
          [
            'Mendalami semua bagian di langkah 4',
            'Biar lengkap',
            'Waktunya habis di bagian yang tidak berisiko. Dalami jalur terpanas dan skema datanya',
          ],
        ],
      ),
      p(
        'Cara paling ringkas menguji apakah sebuah rancangan sudah melewati keempat langkahnya adalah menunjuk satu kotak di diagramnya secara acak lalu bertanya angka mana yang membuatnya perlu ada. Bila jawabannya berupa angka dari langkah kedua, rancangannya berdiri di atas dasar. Bila jawabannya berupa kebiasaan atau nama teknologi, kotak itu ada karena sudah terbayang sejak awal, bukan karena dibutuhkan.',
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
    21,
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

      h2('Studi kasus di project nyata'),
      p(
        'Estimasi di balik amplop bukan menebak melainkan menghitung dari beberapa angka yang diketahui, dengan asumsi yang ditulis terbuka. Yang dicari bukan ketepatan melainkan urutan besarannya.',
      ),
      code(
        'text',
        `
        Dihitung sungguhan, dari jumlah harian ke QPS:

          tulis        100.000.000/hari
            -> rata-rata 1.157 QPS, puncak ~3.472 QPS

          baca (rasio 10:1)  1.000.000.000/hari
            -> rata-rata 11.574 QPS, puncak ~34.722 QPS

        Caranya: bagi dengan 86.400 detik, lalu kalikan tiga untuk
        puncaknya. Faktor tiga itu asumsi, dan ia ditulis sebagai asumsi.
        `,
      ),
      p(
        'Angka penyimpanan dihitung dengan cara yang sama, dan yang menentukan adalah memperkirakan ukuran satu baris dengan jujur.',
      ),
      code(
        'text',
        `
        Dihitung sungguhan untuk satu contoh pemendek alamat:

          per baris:
              7 byte  kode pendek
            200 byte  URL asli (asumsi rata-rata)
              8 byte  id pemilik
              8 byte  waktu dibuat
           ~60 byte   overhead baris dan indeks
          -----------
            283 byte

          @ 100 juta baris/hari:
             1 tahun ->  10,3 TB
             5 tahun ->  51,6 TB
            10 tahun -> 103,3 TB
        `,
        {
          caption:
            'Baris overhead itu yang paling sering dilupakan, dan ia bisa melipatgandakan hasilnya pada baris yang pendek.',
        },
      ),
      p(
        'Estimasi yang baik juga menyandarkan diri pada beberapa angka yang perlu dihafal, dan angka-angka itu bisa diukur sendiri alih-alih dihafal dari daftar orang lain.',
      ),
      code(
        'text',
        `
        Diukur sungguhan di mesin ini (Node 26.5.0):

          baca 1 nilai dari memori                  43 ns
          cari 1 kunci di Map 100.000 entri         50 ns
          SHA-256 atas 1 KB                       2,41 us
          baca 1 KB dari SSD (cache OS)           3,38 us
          baca 1 MB dari memori                 248,62 us
          baca 1 MB dari SSD (cache OS)         291,26 us
          tulis 1 KB + fsync ke SSD               1,24 ms
          HTTP round trip ke 127.0.0.1            1,69 ms
          HTTP round trip ke internet            70,04 ms

        Dari situ, satu perhitungan yang sering dibutuhkan:
          satu panggilan API ke layanan lain di internet ~70 ms
          sepuluh panggilan BERURUTAN ~700 ms
          sepuluh panggilan PARALEL   ~70-100 ms

        Itulah alasan bentuk N+1 pada panggilan jaringan jauh lebih
        mahal daripada N+1 pada query basis data lokal.
        `,
      ),
      p(
        'Untuk kapasitas mesin, angka yang cukup untuk estimasi kasar bisa diturunkan dari pengukuran yang sama.',
      ),
      code(
        'text',
        `
        Diukur di bab lain pada mesin yang sama:

          SELECT 1 baris by primary key (sqlite memori)   1,05 us
          -> secara teoretis ~950.000 per detik per inti

          pemindaian penuh 100.000 baris                 4,69 ms
          -> ~213 per detik per inti

        Selisihnya 4.400 kali, dan itu seluruh alasan indeks ada.

        Untuk PostgreSQL dengan I/O sungguhan, angkanya jauh lebih
        kecil. Yang penting bukan angkanya melainkan bahwa keduanya
        berada di urutan besaran yang berbeda.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan estimasi jarang berupa angka yang meleset sedikit. Yang merusak adalah meleset satu urutan besaran, dan penyebabnya biasanya satu dari beberapa pola.',
      ),
      code(
        'text',
        `
        1. Lupa faktor puncak

           1.157 QPS rata-rata terdengar kecil. Sistem dirancang
           untuk itu, lalu mati pada jam sibuk di 3.472 QPS.

           Dan puncak sesungguhnya bisa jauh lebih tajam: kampanye,
           notifikasi massal, atau berita bisa menghasilkan 20x
           rata-rata dalam beberapa menit.

        2. Lupa overhead

           "URL 200 karakter, jadi 200 byte per baris."
           Dihitung dengan overhead: 283 byte, yaitu 41% lebih besar.
           Pada baris yang pendek, overhead bisa MELEBIHI datanya.

        3. Lupa replikasi dan cadangan

           10,3 TB data mentah dengan 2 replika dan 30 hari cadangan
           harian bukan 10,3 TB, melainkan berkali lipat.

        4. Lupa bahwa indeks juga memakan tempat

           Diukur pada PostgreSQL 16.15 di bab lain:
             tabel komentar 1 juta baris: 83 MB total
             tabel artikel 200.000 baris: 38 MB total
           Angka "total" itu sudah termasuk indeksnya, dan pada tabel
           dengan banyak indeks, indeksnya bisa lebih besar daripada
           datanya.
        `,
      ),
      p(
        'Kesalahan kelima bersifat arah, yaitu menghitung dengan sangat teliti hal yang tidak menentukan apa pun.',
      ),
      code(
        'text',
        `
        Yang TIDAK mengubah keputusan:
          1.157 QPS melawan 1.200 QPS
          10,3 TB melawan 11,1 TB
          283 byte melawan 300 byte

        Yang MENGUBAH keputusan:
          1.157 QPS melawan 34.722 QPS   -> perlu cache atau tidak
          10,3 TB melawan 103,3 TB       -> perlu sharding atau tidak
          70 ms melawan 1,69 ms          -> panggilan jauh atau lokal

        Bulatkan dengan berani. Yang penting asumsinya tertulis,
        sehingga siapa pun bisa mengganti satu asumsi dan melihat
        hasilnya berubah.
        `,
        {
          caption:
            'Estimasi yang tidak bisa dikoreksi orang lain dalam satu kalimat adalah estimasi yang terlalu rumit.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Estimasi kasar terasa seperti tebakan yang dibungkus angka, dan yang membedakannya adalah asumsi yang ditulis.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai rata-rata tanpa faktor puncak',
            'Rata-rata kan mewakili',
            'Dihitung, puncak 3x membuat 1.157 QPS menjadi 3.472 QPS. Sistem mati tepat saat paling ramai',
          ],
          [
            'Menghitung ukuran baris dari isinya saja',
            'Itu kan datanya',
            'Dihitung, overhead menambah 41%. Pada baris pendek, overhead bisa melebihi datanya',
          ],
          [
            'Lupa replikasi, cadangan, dan indeks',
            'Yang dihitung kan datanya',
            'Data mentah 10,3 TB dengan replika dan cadangan menjadi berkali lipat',
          ],
          [
            'Menghitung sampai digit terakhir',
            'Biar akurat',
            'Yang dicari urutan besarannya. Ketelitian di bawah itu tidak mengubah satu pun keputusan',
          ],
          [
            'Tidak menulis asumsinya',
            'Angkanya sudah ada',
            'Asumsi yang tidak terlihat tidak bisa dikoreksi, dan baru ketahuan setelah sistemnya dibangun',
          ],
          [
            'Menghafal angka latensi dari daftar orang lain',
            'Itu kan angka yang terkenal',
            'Angkanya berubah seiring perangkat keras. Ukur sendiri: sepuluh baris kode sudah cukup',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas dicoba sendiri sekali. Menulis skrip yang mengukur waktu baca dari memori, dari SSD, dan lewat jaringan memakan waktu belasan menit, dan hasilnya jauh lebih melekat daripada daftar angka yang dihafal. Yang paling berharga dari latihan itu bukan angkanya, melainkan kebiasaan memeriksa apakah sesuatu memang secepat atau selambat yang kamu kira.',
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
    18,
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

      h2('Studi kasus di project nyata'),
      p(
        'Angka latensi yang beredar di internet berasal dari perangkat keras tahun tertentu dan berubah seiring waktu. Yang tidak berubah adalah **urutan besarannya**, dan itu bisa diukur sendiri dalam belasan menit.',
      ),
      code(
        'text',
        `
        Diukur sungguhan di mesin ini dengan Node 26.5.0.
        Tiap baris: median dari ribuan pengulangan, sesudah pemanasan.

          baca 1 nilai dari array di memori          43 ns   (p99   125 ns)
          cari 1 kunci di Map 100.000 entri          50 ns   (p99   149 ns)
          acak kriptografis 32 byte                1,66 us   (p99  3,13 us)
          SHA-256 atas 1 KB                        2,41 us   (p99  6,63 us)
          baca 1 KB dari SSD (cache OS)            3,38 us   (p99  9,79 us)
          SELECT 1 baris by primary key (sqlite)   1,05 us   (p99  2,32 us)
          baca 1 MB berurutan dari memori        248,62 us   (p99   318 us)
          baca 1 MB dari SSD (cache OS)          291,26 us   (p99  2,92 ms)
          tulis 1 KB + fsync ke SSD                1,24 ms   (p99  4,14 ms)
          HTTP round trip ke 127.0.0.1             1,69 ms   (p99  3,15 ms)
          pemindaian penuh 100.000 baris (sqlite)  4,69 ms   (p99  7,11 ms)
          HTTP round trip ke internet             70,04 ms   (p99   363 ms)
        `,
        { caption: 'Jarak antara baris pertama dan terakhir adalah 1,6 juta kali.' },
      ),
      p(
        'Beberapa baris di tabel itu pantas dibaca berpasangan, sebab selisihnya yang menjelaskan keputusan desain.',
      ),
      table(
        ['Pasangan', 'Selisih', 'Keputusan yang lahir darinya'],
        [
          [
            'Memori 43 ns melawan SSD 3,38 us',
            '~79 kali',
            'Cache di memori berbayar, dan itulah seluruh alasan cache ada',
          ],
          [
            'SSD baca 3,38 us melawan fsync 1,24 ms',
            '~367 kali',
            'Menulis jauh lebih mahal daripada membaca. Kumpulkan penulisan, jangan satu per satu',
          ],
          [
            'Loopback 1,69 ms melawan internet 70,04 ms',
            '~41 kali',
            'Panggilan lintas wilayah harus dikurangi jumlahnya, bukan dipercepat',
          ],
          [
            'SELECT by key 1,05 us melawan pindai 4,69 ms',
            '~4.400 kali',
            "Seluruh alasan indeks ada, dan alasan `LIKE '%kata%'` mahal",
          ],
          [
            'p50 70,04 ms melawan p99 363 ms internet',
            '~5 kali',
            'Batas waktu ditetapkan dari p99, bukan dari p50',
          ],
        ],
      ),
      p(
        'Baris terakhir itu yang paling sering salah dipakai. Batas waktu yang ditetapkan dari median akan memutus satu dari seratus permintaan yang sebenarnya akan berhasil.',
      ),
      code(
        'text',
        `
        Perhitungan yang paling sering dibutuhkan, dari angka di atas:

          satu panggilan API ke internet        ~70 ms
          10 panggilan BERURUTAN               ~700 ms
          10 panggilan PARALEL                 ~70-100 ms

          satu panggilan ke layanan di jaringan
          yang sama (loopback sebagai patokan)  ~1,7 ms
          100 panggilan BERURUTAN              ~170 ms
          100 panggilan PARALEL                ~5-20 ms

        Inilah bentuk N+1, dan kenapa ia jauh lebih mahal pada
        panggilan jaringan daripada pada query lokal.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan yang paling sering pada pengukuran latensi bukan pada alatnya melainkan pada cara mengambilnya, dan hasilnya angka yang terlihat meyakinkan dan tidak berarti apa-apa.',
      ),
      code(
        'text',
        `
        1. Tanpa pemanasan

           Pengukuran pertama pada Node menyertakan kompilasi JIT,
           alokasi awal, dan cache yang masih dingin. Ia bisa
           puluhan kali lebih lambat daripada yang sebenarnya.

           Karena itu seluruh angka di atas diambil SESUDAH tiga kali
           pemanasan, dan diambil sebagai median dari ribuan ulangan.

        2. Memakai rata-rata

           Satu pencilan 4 detik di antara seribu pengukuran 1 ms
           menaikkan rata-rata menjadi 5 ms, dan angka itu tidak
           mewakili satu pun pengukuran yang sebenarnya terjadi.

        3. Membiarkan kompilator membuang pekerjaannya

           for (let i = 0; i < n; i++) arr[12345];
           -> hasilnya tidak dipakai, dan mesin boleh membuangnya
              sepenuhnya. Hasilnya "0 ns".

           Karena itu pengukuran di atas menjumlahkan hasilnya ke
           sebuah variabel yang dipakai di akhir.

        4. Mengukur di mesin yang sedang sibuk

           Diukur pada project ini: load average 12,84 pada mesin
           4 CPU membuat seluruh pengukuran melar, dan itu bahkan
           menggagalkan build yang biasanya berhasil.
        `,
      ),
      p(
        'Kesalahan kelima menyangkut penafsiran, dan ini yang paling sering menghasilkan keputusan yang salah arah.',
      ),
      code(
        'text',
        `
        "Cache Redis lebih cepat daripada PostgreSQL."

        Diukur, keduanya dihubungi lewat jaringan. Bila keduanya
        berada di jaringan yang sama, keduanya membayar ongkos
        yang sama, yaitu round trip ~1,7 ms pada pengukuran loopback
        di atas.

        Yang membuat cache lebih cepat bukan Redis-nya, melainkan
        bahwa ia TIDAK MELAKUKAN PEKERJAAN: tidak membaca disk,
        tidak menggabungkan tabel, tidak mengurutkan.

        Untuk query by primary key yang sudah berindeks dan datanya
        ada di cache buffer, selisihnya jauh lebih kecil daripada
        yang dikira. Ukur dulu sebelum menambah satu komponen.
        `,
        {
          caption:
            'Cache di MEMORI PROSES ITU SENDIRI adalah cerita lain: 43 ns melawan 1,69 ms, yaitu 39.000 kali.',
        },
      ),
      code(
        'text',
        `
        DAN SATU LAGI yang sering dilupakan tentang p99:

        Bila satu permintaan halaman memanggil 10 layanan dan
        masing-masing p99-nya 1%, peluang SETIDAKNYA SATU di antaranya
        kena ekor adalah:

          1 - 0,99^10 = 9,6%

        Artinya hampir 1 dari 10 permintaan halaman akan merasakan
        latensi ekor, meski tiap layanannya hanya 1%. Inilah kenapa
        mengurangi JUMLAH panggilan sering lebih berpengaruh daripada
        mempercepat masing-masing.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Angka latensi mudah dihafal dan mudah dipakai untuk membenarkan keputusan yang belum diukur.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menghafal daftar angka dari internet',
            'Itu angka yang terkenal',
            'Angkanya berasal dari perangkat keras tahun tertentu. Ukur sendiri; belasan menit sudah cukup',
          ],
          [
            'Mengukur tanpa pemanasan',
            'Kodenya kan sama',
            'Pengukuran pertama menyertakan kompilasi JIT dan cache dingin. Bisa puluhan kali lebih lambat',
          ],
          [
            'Memakai rata-rata',
            'Itu ringkasannya',
            'Satu pencilan menggeser rata-rata jauh dari nilai yang sebenarnya terjadi. Pakai median dan p99',
          ],
          [
            'Membiarkan hasil pengukuran tidak dipakai',
            'Yang diukur kan waktunya',
            'Mesin boleh membuang pekerjaan yang hasilnya tidak dipakai. Hasilnya "0 ns" yang menyesatkan',
          ],
          [
            'Menetapkan batas waktu dari p50',
            'Itu waktu yang normal',
            'Diukur, p99 internet 363 ms melawan p50 70 ms. Batas dari p50 memutus permintaan yang akan berhasil',
          ],
          [
            'Menambah cache tanpa mengukur query aslinya',
            'Cache kan selalu lebih cepat',
            'Cache lewat jaringan membayar round trip yang sama. Yang menghemat adalah pekerjaan yang tidak dilakukan',
          ],
        ],
      ),
      p(
        'Satu latihan yang pantas dilakukan sekali dan diingat seumur karier adalah menulis skrip pengukuran sendiri di mesin yang kamu pakai sehari-hari. Sepuluh baris untuk memori, sepuluh untuk disk, sepuluh untuk jaringan, dan hasilnya jauh lebih melekat daripada daftar yang dihafal. Yang paling berharga bukan angkanya melainkan kebiasaan yang tumbuh darinya, yaitu memeriksa apakah sesuatu memang secepat atau selambat yang kamu kira.',
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
    19,
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

      h2('Studi kasus di project nyata'),
      p(
        'Angka ketersediaan terdengar abstrak sampai diterjemahkan menjadi menit. Setelah itu, ia langsung menentukan bentuk sistem dan bentuk tim yang menjaganya.',
      ),
      code(
        'text',
        `
        Dihitung sungguhan:

              90%    ->  876,0 jam/tahun   4380,0 menit/bulan   8640,0 detik/hari
              99%    ->   87,6 jam/tahun    438,0 menit/bulan    864,0 detik/hari
            99,9%    ->    8,8 jam/tahun     43,8 menit/bulan     86,4 detik/hari
           99,95%    ->    4,4 jam/tahun     21,9 menit/bulan     43,2 detik/hari
           99,99%    ->    0,9 jam/tahun      4,4 menit/bulan      8,6 detik/hari
          99,999%    ->    0,1 jam/tahun      0,4 menit/bulan      0,9 detik/hari
        `,
        {
          caption:
            'Setiap satu sembilan tambahan memotong waktu mati menjadi sepersepuluh, dan biayanya naik jauh lebih cepat.',
        },
      ),
      p(
        'Kolom menit per bulan itu yang paling berguna, sebab ia langsung menjawab pertanyaan apakah manusia sempat terlibat.',
      ),
      code(
        'text',
        `
          43,8 menit/bulan (99,9%)
            cukup untuk: alarm berbunyi, orang bangun, membaca,
            memutuskan, dan menjalankan rollback

           4,4 menit/bulan (99,99%)
            TIDAK cukup untuk manusia. Deteksi dan pemulihan harus
            OTOMATIS, dan itu keputusan arsitektur, bukan keputusan
            proses

        Karena itu batas antara 99,9% dan 99,99% bukan batas angka
        melainkan batas antara "ditangani orang" dan "ditangani sistem".
        `,
      ),
      p(
        'Yang sering tidak disadari adalah bahwa ketersediaan komponen **berkalikan**, bukan berlaku sendiri-sendiri.',
      ),
      code(
        'text',
        `
        Dihitung sungguhan, komponen berantai yang SEMUANYA harus hidup:

           1 komponen @ 99,9% -> sistem 99,9000%   (  8,8 jam/tahun)
           3 komponen @ 99,9% -> sistem 99,7003%   ( 26,3 jam/tahun)
           5 komponen @ 99,9% -> sistem 99,5010%   ( 43,7 jam/tahun)
          10 komponen @ 99,9% -> sistem 99,0045%   ( 87,2 jam/tahun)
          30 komponen @ 99,9% -> sistem 97,0431%   (259,0 jam/tahun)

        Tiga puluh layanan yang masing-masing 99,9% menghasilkan
        sistem 97%, yaitu sebelas hari mati per tahun.

        Itulah biaya tersembunyi memecah sistem menjadi banyak
        layanan, dan ia jarang dihitung sebelum keputusannya diambil.
        `,
      ),
      p('Arah sebaliknya juga berlaku, dan inilah alasan redundansi bekerja.'),
      code(
        'text',
        `
        Dihitung, komponen PARALEL yang cukup satu hidup:

          1 salinan @ 99% -> 99,0000%
          2 salinan @ 99% -> 99,9900%
          3 salinan @ 99% -> 99,9999%

        Dua salinan komponen yang biasa-biasa saja menghasilkan
        ketersediaan yang lebih tinggi daripada satu komponen yang
        sangat baik.

        Syaratnya satu, dan sering tidak terpenuhi: kegagalannya
        harus SALING BEBAS. Dua salinan di rak yang sama, dengan
        catu daya yang sama, atau dengan bug perangkat lunak yang
        sama, tidak saling bebas sama sekali.
        `,
        {
          caption:
            'Kata "saling bebas" itu yang membedakan redundansi sungguhan dari redundansi di atas kertas.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan yang paling mahal di area ini bukan salah hitung melainkan salah mendefinisikan apa yang dihitung.',
      ),
      code(
        'text',
        `
        "Ketersediaan kami 99,95%."

        Pertanyaan yang menentukan artinya:
          - diukur dari mana? dari dalam pusat data, atau dari
            peramban pengguna?
          - apa yang dihitung "mati"? hanya 5xx, atau termasuk
            permintaan yang lebih lambat dari 3 detik?
          - dihitung per permintaan, atau per menit?
          - fitur mana? halaman utama saja, atau seluruh alur checkout?

        Satu sistem yang sama bisa menghasilkan 99,99% dan 99,5%
        tergantung jawaban keempat pertanyaan itu. Angka tanpa
        definisi bukan janji, melainkan kesan.
        `,
      ),
      p(
        'Kesalahan kedua menyangkut selisih antara SLA, SLO, dan SLI, yang sering dipakai bergantian padahal ketiganya berbeda.',
      ),
      code(
        'text',
        `
          SLI  Indikator. Yang DIUKUR.
               contoh: persentase permintaan yang 2xx atau 3xx
                       dan selesai di bawah 300 ms

          SLO  Sasaran. Angka yang DIKEJAR tim.
               contoh: SLI di atas harus >= 99,9% per 30 hari

          SLA  Perjanjian. Angka yang MENGIKAT secara kontrak,
               beserta gantinya bila dilanggar.
               contoh: 99,5%, dan bila kurang, tagihan dipotong 10%

        Urutan angkanya hampir selalu: SLA lebih longgar daripada SLO.
        Alasannya praktis: SLO harus dilanggar lebih dulu supaya tim
        punya waktu bertindak SEBELUM kewajiban kontraknya terlanggar.
        `,
      ),
      code(
        'text',
        `
        Dan error budget, dihitung sungguhan:

          100.000.000 permintaan/bulan, SLO 99,9%
            anggaran error 0,1% = 100.000 permintaan boleh gagal
            setara 43,8 menit mati total

          Habis di tengah bulan -> rilis fitur berhenti sampai
          bulan berikutnya; seluruh kapasitas tim beralih ke
          keandalan.

        Itulah gunanya error budget: ia mengubah perdebatan
        "rilis cepat melawan stabil" menjadi satu angka yang bisa
        dilihat semua orang.
        `,
        {
          caption:
            'Anggaran yang tidak pernah habis berarti SLO-nya terlalu longgar, dan itu juga informasi.',
        },
      ),
      p(
        'Kesalahan terakhir bersifat arah, yaitu mengejar sembilan tanpa menghitung apa yang dibeli.',
      ),
      code(
        'text',
        `
        Pertanyaan yang jarang diajukan sebelum menaikkan target:

          Berapa kerugian NYATA bila sistem ini mati 40 menit
          sebulan sekali?

        Untuk sistem pembayaran, jawabannya besar. Untuk dasbor
        internal yang dipakai dua puluh orang pada jam kerja,
        jawabannya hampir nol — dan mengejar 99,99% di sana berarti
        membayar beberapa wilayah aktif, failover otomatis, dan tim
        siaga sepanjang waktu untuk sesuatu yang tidak ada yang
        memperhatikannya pada pukul tiga pagi.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Angka ketersediaan mudah disebut dan sulit dipenuhi, dan sebagian besar kesalahannya terjadi sebelum satu baris kode ditulis.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyebut target tanpa menerjemahkannya ke menit',
            'Angkanya kan sudah jelas',
            'Dihitung, 99,99% berarti 4,4 menit per bulan. Itu terlalu singkat untuk ditangani manusia',
          ],
          [
            'Menghitung ketersediaan tiap komponen sendiri-sendiri',
            'Masing-masing kan sudah 99,9%',
            'Dihitung, 30 komponen berantai @ 99,9% menghasilkan 97%, yaitu sebelas hari per tahun',
          ],
          [
            'Menambah salinan tanpa memastikan kegagalannya saling bebas',
            'Dua lebih baik daripada satu',
            'Dua salinan dengan catu daya atau bug yang sama gagal bersamaan. Redundansinya hanya di atas kertas',
          ],
          [
            'Menyebut angka tanpa mendefinisikan apa yang diukur',
            'Angkanya kan diambil dari pemantauan',
            'Satu sistem yang sama bisa menghasilkan 99,99% dan 99,5% tergantung definisinya',
          ],
          [
            'Memakai SLA dan SLO bergantian',
            'Sama-sama target',
            'SLO harus lebih ketat daripada SLA, supaya tim punya waktu bertindak sebelum kontraknya terlanggar',
          ],
          [
            'Mengejar sembilan tambahan tanpa menghitung manfaatnya',
            'Lebih tinggi kan lebih baik',
            'Biayanya nyata dan dibayar tiap hari. Tanyakan berapa kerugian sesungguhnya pada target yang lebih rendah',
          ],
        ],
      ),
      p(
        'Perhitungan yang paling mengubah cara pandang di sub-bab ini adalah yang ketiga, yaitu tiga puluh layanan berantai yang masing-masing 99,9% menghasilkan sistem 97%. Angka itu tidak berarti memecah sistem selalu salah, dan ia berarti pemecahan harus disertai perancangan agar kegagalan satu bagian tidak menjatuhkan seluruhnya. Tanpa itu, setiap layanan tambahan adalah satu tempat lagi yang bisa mematikan semuanya.',
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
    19,
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

      h2('Studi kasus di project nyata'),
      p(
        'Dokumen desain satu halaman berguna bukan karena panjangnya melainkan karena batas satu halaman memaksa memilih. Yang tersisa setelah dipaksa memilih biasanya adalah bagian yang memang menentukan.',
      ),
      code(
        'text',
        `
        Bentuk yang terbukti berguna, enam bagian:

        1. MASALAH
           Apa yang tidak bekerja sekarang, dengan ANGKA.
           Bukan "pencarian lambat", melainkan "p95 pencarian 4,2
           detik, dan 8% pengguna meninggalkan halaman sebelum
           hasilnya muncul".

        2. BATASAN DAN KEBUTUHAN NON-FUNGSIONAL
           Angka target, beserta apa yang TIDAK dikerjakan.

        3. PILIHAN YANG DIPERTIMBANGKAN
           Minimal dua, beserta alasan penolakannya.

        4. RANCANGAN YANG DIPILIH
           Satu diagram, dan untuk tiap kotak: angka mana di bagian 2
           yang membuatnya perlu ada.

        5. RISIKO DAN APA YANG BELUM DIKETAHUI
           Yang paling sering dilewatkan, dan paling berguna.

        6. BAGAIMANA KITA TAHU INI BERHASIL
           Metrik yang akan diperiksa sesudahnya, beserta angkanya.
        `,
        {
          caption:
            'Bagian 3 dan 5 yang paling dicari pembaca berikutnya, dan keduanya yang paling sering dihapus demi ringkas.',
        },
      ),
      p(
        'Bagian pertama menentukan seluruh sisanya, dan ia harus berdiri di atas pengukuran. Contoh dari project ini menunjukkan kenapa.',
      ),
      code(
        'text',
        `
        MASALAH yang ditulis dari dugaan:
          "Build kami lambat dan sering gagal karena ada halaman
           yang terlalu berat."

        MASALAH yang ditulis dari pengukuran:
          "npm run build gagal pada beberapa halaman dengan batas
           waktu prarender 60 detik, termasuk halaman yang tidak
           diubah. Diukur: penyorotan kode seluruh 427 halaman
           memakan 5.785 ms total, rata-rata 14 ms per halaman, dan
           halaman yang gagal hanya 30 ms. Satu halaman yang gagal
           bahkan tidak punya blok kode. Mesinnya 4 CPU, swap 0,
           memori tersisa ~1,1 GB, load average 12,84 saat gagal."

        Rumusan pertama mengarahkan ke pekerjaan berminggu-minggu
        menyederhanakan halaman. Rumusan kedua mengarahkan ke satu
        variabel, dan hasilnya:
          CIRCLE_NODE_TOTAL=2 npm run build -> EXIT=0, 15,9 detik
        `,
      ),
      p(
        'Bagian ketiga punya nilai yang baru terasa berbulan-bulan kemudian, yaitu mencegah perdebatan yang sama diulang.',
      ),
      code(
        'text',
        `
        PILIHAN YANG DIPERTIMBANGKAN

        A. Menambah replika baca
           + tidak mengubah kode aplikasi
           - read-after-write menjadi tidak terjamin
           Diukur: saat beban tulis besar, replika tertinggal 11 MB
           dan 8 dari 8 pembacaan setelah penulisan TIDAK menemukan
           datanya.
           DITOLAK: alur checkout membaca kembali data yang baru
           ditulis, dan itu akan rusak.

        B. Menambah cache di depan basis data
           + menurunkan beban baca paling besar
           - menambah satu tempat yang bisa basi
           Diukur di bab lain: 50 permintaan bersamaan untuk satu
           kunci yang kedaluwarsa menghasilkan 50 perhitungan tanpa
           penggabungan, dan 1 dengan.
           DIPILIH, dengan penggabungan permintaan.

        C. Denormalisasi penghitung
           Diukur: 468,9 ms menjadi 0,068 ms untuk halaman populer,
           dengan biaya tulis naik dari 0,0090 ms menjadi 0,2825 ms
           per operasi.
           DIPILIH untuk satu halaman yang memang terpanas.
        `,
        {
          caption:
            'Alasan penolakan yang disertai angka adalah bagian yang paling mahal direkonstruksi enam bulan kemudian.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Dokumen desain tidak menghasilkan error, dan biayanya muncul pada saat-saat tertentu yang bisa diperkirakan.',
      ),
      code(
        'text',
        `
        1. Enam bulan kemudian, ada yang bertanya "kenapa begini?"

           Tanpa bagian 3, tidak ada yang ingat alternatif apa saja
           yang sudah ditolak dan kenapa. Perdebatannya diulang dari
           nol, kadang dengan kesimpulan yang berbeda.

        2. Rancangannya dibangun, dan ternyata menjawab masalah lain

           Tanpa angka di bagian 1, tidak ada cara memeriksa apakah
           yang dibangun benar-benar menyelesaikannya.

        3. Sesudah dirilis, tidak ada yang tahu apakah berhasil

           Tanpa bagian 6, "berhasil" menjadi soal perasaan. Metrik
           yang ditetapkan SEBELUM membangun tidak bisa disesuaikan
           belakangan supaya terlihat bagus.

        4. Risiko yang sudah diketahui muncul sebagai kejutan

           Bagian 5 yang dihapus demi ringkas adalah bagian yang
           nanti dibaca orang saat sesuatu rusak.
        `,
      ),
      p(
        'Kegagalan yang berlawanan juga nyata, yaitu dokumen yang terlalu panjang sehingga tidak dibaca.',
      ),
      code(
        'text',
        `
        Gejala dokumen yang terlalu panjang:

          - disetujui tanpa satu pun komentar substansial
          - yang dikomentari hanya format dan tata bahasa
          - orang bertanya hal yang jawabannya ada di halaman 7
          - versi keduanya tidak pernah ditulis

        Batas satu halaman bukan gaya. Ia memaksa memilih, dan yang
        bertahan setelah dipaksa memilih biasanya memang yang
        menentukan.

        Rincian yang tidak muat bukan dihapus, melainkan dipindahkan
        ke lampiran yang boleh tidak dibaca.
        `,
      ),
      code(
        'text',
        `
        DAN SATU KESALAHAN yang halus: menulis kepastian yang
        tidak dimiliki.

          "Sistem ini akan menangani 50.000 QPS."

          -> itu janji, bukan estimasi. Bentuk yang jujur:

          "Dengan asumsi rasio baca:tulis 10:1 dan puncak 3x
           rata-rata, kami memperkirakan 34.722 QPS baca pada
           puncaknya. Asumsi yang paling mungkin meleset adalah
           faktor puncak: kampanye pemasaran bisa menghasilkan 20x
           dalam beberapa menit. Yang akan mempersempit perkiraan ini
           adalah data lalu lintas tiga bulan terakhir, yang belum
           kami miliki."

        Bentuk kedua bisa dikoreksi orang lain. Bentuk pertama hanya
        bisa dipercaya atau tidak.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Dokumen desain sering ditulis untuk mendapat persetujuan, padahal gunanya untuk membuat keputusannya bisa diperiksa.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis masalah tanpa angka',
            'Semua orang sudah tahu masalahnya',
            'Tidak ada cara memeriksa apakah yang dibangun menyelesaikannya. Dan dugaannya bisa saja salah',
          ],
          [
            'Hanya menulis rancangan yang dipilih',
            'Yang lain kan tidak dipakai',
            'Alasan penolakan adalah bagian yang paling dicari pembaca berikutnya, dan paling mahal direkonstruksi',
          ],
          [
            'Menghapus bagian risiko demi ringkas',
            'Belum tentu terjadi',
            'Bagian itu yang nanti dibaca saat sesuatu rusak. Menuliskannya memakan tiga kalimat',
          ],
          [
            'Tidak menulis cara mengukur keberhasilannya',
            'Nanti kelihatan sendiri',
            'Tanpa metrik yang ditetapkan lebih dulu, "berhasil" menjadi soal perasaan',
          ],
          [
            'Menulis dokumen tujuh halaman',
            'Biar lengkap',
            'Disetujui tanpa komentar substansial. Pindahkan rincian ke lampiran yang boleh tidak dibaca',
          ],
          [
            'Menulis estimasi sebagai kepastian',
            'Terdengar lebih meyakinkan',
            'Tanpa asumsi yang tertulis, tidak ada yang bisa dikoreksi. Sebutkan asumsi dan apa yang mempersempitnya',
          ],
        ],
      ),
      p(
        'Ada satu ujian sederhana untuk menilai apakah sebuah dokumen desain sudah cukup. Berikan kepada orang yang tidak ikut membuatnya, lalu minta ia menyebutkan satu alternatif yang ditolak beserta alasannya, dan satu angka yang menjadi dasar keputusan utamanya. Bila ia bisa menjawab keduanya setelah membaca lima menit, dokumen itu bekerja. Bila tidak, yang kurang hampir selalu bagian tiga atau bagian satu.',
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
