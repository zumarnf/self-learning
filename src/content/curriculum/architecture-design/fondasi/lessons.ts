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
 * Architecture Design — Chapter 1, eight lessons.
 *
 * The vocabulary and the forces. Chapter 2 picks shapes, Chapter 3 connects them, Chapter 4
 * records them. This chapter exists so none of that reads as fashion: every shape later in the
 * category is pulled into position by one of the forces named here.
 *
 * Deliberately front-loads cost of change. A reader who understands why some decisions are
 * expensive to undo will ask for evidence before splitting anything, and a reader who does not
 * will treat every pattern as an upgrade.
 */
export const lessons: LessonDraft[] = [
  written(
    'apa-itu-arsitektur',
    'Apa Itu Arsitektur Perangkat Lunak',
    20,
    'Batas antara keputusan biasa dan keputusan yang pantas disebut arsitektur.',
    [
      p(
        'Bayangkan dua permintaan datang ke mejamu pada hari yang sama. Permintaan pertama, ganti warna tombol beli dari biru menjadi hijau. Permintaan kedua, mulai sekarang satu pesanan boleh berisi barang dari beberapa penjual sekaligus.',
      ),
      p(
        'Permintaan pertama selesai dalam sepuluh menit. Kamu buka satu berkas, ganti satu nilai warna, selesai. Kalau ternyata hijaunya jelek, kamu kembalikan lagi dalam sepuluh menit berikutnya.',
      ),
      p(
        'Permintaan kedua terlihat mirip kecilnya kalau hanya dibaca kalimatnya. Kenyataannya ia menyentuh tabel pesanan, tabel pengiriman, cara ongkos kirim dihitung, halaman keranjang, halaman riwayat, laporan penjualan, dan cara dana dibagi ke tiap penjual. Kalau ternyata keputusannya keliru, kamu tidak bisa mengembalikannya dalam sepuluh menit, karena sudah ada ribuan baris data tersimpan dalam bentuk yang baru.',
      ),
      p(
        'Perbedaan antara kedua permintaan itu **bukan soal seberapa sulit kodenya**. Yang membedakan adalah seberapa banyak hal lain yang ikut bergerak, dan seberapa mahal kalau kamu ingin kembali. Perbedaan itulah yang menjadi topik kategori ini.',
      ),
      p(
        'Dari situ lahir definisi kerja yang bisa langsung kamu pakai besok. **Arsitektur adalah kumpulan keputusan yang mahal untuk dibatalkan.** Keputusan warna tombol bukan arsitektur, ia detail implementasi. Keputusan tentang bentuk sebuah pesanan adalah arsitektur, karena mencabutnya berarti menyentuh puluhan berkas sekaligus memindahkan data yang sudah terlanjur tersimpan.',
      ),
      p(
        'Kata arsitektur memang sering dipakai untuk hal lain, dan itu yang membuatnya terdengar mengambang. Ada yang memakainya untuk susunan folder, ada yang untuk gambar kotak dan panah di papan tulis, ada yang untuk daftar teknologi yang dipakai. Ketiganya menyentuh sesuatu yang nyata, tetapi tidak satu pun menjelaskan kenapa topik ini butuh kategori sendiri. Definisi di atas menjelaskannya.',
      ),
      p(
        'Definisi itu punya satu sifat yang enak, yaitu ia tidak bergantung pada besar kecilnya project. Aplikasi kecil pun punya arsitektur, hanya saja keputusannya lebih sedikit dan lebih murah dibatalkan. Yang berubah seiring aplikasi membesar bukan keberadaan arsitekturnya, melainkan **harga** kesalahannya.',
      ),

      terms(
        {
          term: 'architecture (arsitektur)',
          meaning:
            'Kumpulan keputusan berdampak luas tentang bentuk sebuah sistem, yaitu bagian besar apa saja yang ada, siapa boleh bicara dengan siapa, data dipegang siapa, dan aturan apa yang berlaku di seluruh bagian. Dibaca "arsitektur". Ciri pembedanya bukan seberapa rumit keputusannya, melainkan seberapa banyak hal lain yang ikut berubah kalau keputusan itu dicabut. Contoh keputusan arsitektur di aplikasi toko yaitu memutuskan bahwa harga barang disimpan ikut di dalam baris pesanan, bukan diambil ulang dari tabel produk setiap kali pesanan dibuka. Contoh yang bukan arsitektur yaitu memutuskan memakai `map` alih-alih `for` di satu fungsi.',
        },
        {
          term: 'component (komponen)',
          meaning:
            'Satu bagian sistem yang punya tanggung jawab jelas dan punya cara resmi untuk dipanggil dari luar. Dibaca "komponen". Di kategori ini kata komponen dipakai pada satuan yang lebih besar daripada komponen React, misalnya modul pembayaran, layanan notifikasi, atau seluruh aplikasi Express. Ukurannya berbeda, tetapi idenya sama persis dengan komponen React yang sudah kamu kenal, yaitu ada isi yang disembunyikan dan ada permukaan yang dipakai orang lain. Tombol React menyembunyikan cara ia menggambar dirinya dan hanya memperlihatkan `props`. Modul pembayaran menyembunyikan cara ia bicara ke gerbang pembayaran dan hanya memperlihatkan fungsi `bayar()`.',
        },
        {
          term: 'boundary (batas)',
          meaning:
            'Garis pemisah yang menentukan apa yang boleh melewatinya dan dalam bentuk apa. Dibaca "baundari". Wujud paling konkretnya di kode adalah berkas `index.ts` sebuah folder, yaitu apa pun yang diekspor dari sana boleh dipakai folder lain, sedangkan berkas di sebelahnya yang tidak diekspor adalah urusan dalam. Batas adalah gagasan paling penting di seluruh kategori ini, karena hampir semua keputusan arsitektur sebenarnya adalah keputusan tentang di mana garis itu ditarik dan seberapa keras ia dijaga.',
        },
        {
          term: 'architectural style (gaya arsitektur)',
          meaning:
            'Pola susunan yang sudah punya nama dan sudah sering dipakai orang, misalnya monolit, modular monolith, microservice, atau event-driven. Gaya bukan resep wajib. Ia lebih mirip nama bentuk yang membuat percakapan menjadi cepat, karena menyebut satu kata sudah membawa serta seperangkat konsekuensi yang dikenal semua orang. Mirip kata "rumah panggung" yang begitu disebut sudah membawa serta bayangan tiang, tangga, dan kolong, tanpa perlu menjelaskan satu per satu.',
        },
        {
          term: 'design pattern (pola desain)',
          meaning:
            'Solusi berulang untuk masalah yang berulang, lengkap dengan nama, konteks pemakaian, dan harganya. Dibaca "disain patern". Bedanya dengan gaya arsitektur, pola bekerja pada satuan yang lebih kecil dan biasanya menjawab satu masalah spesifik. Perbandingan ukurannya begini, gaya arsitektur menjawab "aplikasi ini bentuknya apa", sedangkan pola menjawab "apa yang harus kulakukan ketika layanan pembayaran tidak menjawab selama tiga puluh detik".',
        },
        {
          term: 'implementation detail (detail implementasi)',
          meaning:
            'Keputusan yang bisa diubah tanpa memaksa bagian lain ikut berubah, misalnya nama variabel, isi sebuah fungsi, atau library kecil yang dipakai di satu tempat saja. Perbedaan antara detail implementasi dan arsitektur bukan soal penting atau tidak penting, melainkan soal seberapa jauh akibatnya menyebar. Mengganti cara sebuah fungsi mengurutkan daftar adalah detail implementasi, sekalipun fungsi itu sangat penting, karena tidak ada berkas lain yang perlu tahu cara pengurutannya berubah.',
        },
        {
          term: 'cross-cutting concern',
          meaning:
            'Kebutuhan yang muncul di hampir semua bagian sistem sehingga tidak bisa ditaruh di satu tempat saja, misalnya logging, autentikasi, penanganan error, dan pengukuran performa. Dibaca "kros kating konsern". Arti harfiahnya urusan yang memotong melintang, karena ia menembus semua lapisan alih-alih duduk di salah satunya. Kebutuhan seperti ini pantas disebut arsitektur karena cara menanganinya menentukan bentuk kode di banyak tempat sekaligus. Contohnya, memutuskan bahwa setiap permintaan membawa satu id korelasi akan mengubah tanda tangan fungsi di hampir seluruh aplikasi.',
        },
        {
          term: 'stakeholder',
          meaning:
            'Pihak yang punya kepentingan atas sistem ini dan akan merasakan akibat keputusannya, misalnya pengguna, tim yang merawat, pemilik produk, dan tim keamanan. Dibaca "steikholder". Kata ini sering terdengar korporat, tetapi ia penting karena banyak keputusan arsitektur baru masuk akal setelah jelas kepentingan siapa yang sedang dilayani. Contohnya, menyimpan seluruh riwayat perubahan harga terasa berlebihan bagi pengguna, tetapi menjadi wajib begitu ada pihak keuangan yang harus menjelaskan angka tahun lalu.',
        },
      ),

      callout(
        'tip',
        'Analogi yang membantu, beserta batasnya',
        'Bayangkan membangun rumah. Memindahkan lemari adalah pekerjaan sore hari. Memindahkan tembok penopang adalah pekerjaan yang menyentuh atap, lantai, dan instalasi listrik sekaligus. Keduanya sama-sama "mengubah rumah", tetapi harganya beda jauh, dan tembok penopang itulah arsitekturnya. **Batas analoginya:** rumah selesai lalu berhenti berubah, sedangkan perangkat lunak berubah terus seumur hidupnya. Karena itu perangkat lunak justru dirancang supaya temboknya masih mungkin dipindah, dan itu yang tidak berlaku pada rumah.',
      ),

      h2('Tiga hal yang sering dikira arsitektur'),
      p(
        'Sebelum masuk lebih jauh, ada baiknya membereskan tiga kesalahpahaman yang membuat topik ini terasa lebih misterius daripada seharusnya.',
      ),
      table(
        ['Sering dikira arsitektur', 'Sebenarnya', 'Kenapa keliru'],
        [
          [
            'Susunan folder',
            'Petunjuk, bukan bukti',
            'Folder `services` dan `repositories` bisa saja berisi kode yang saling memanggil bebas ke segala arah. Nama folder tidak menegakkan apa pun',
          ],
          [
            'Daftar teknologi',
            'Hasil dari keputusan, bukan keputusannya',
            'Memilih PostgreSQL adalah jawaban. Pertanyaannya adalah data apa yang dipegang siapa dan sekuat apa konsistensinya, dan pertanyaan itulah yang arsitektural',
          ],
          [
            'Diagram di papan tulis',
            'Cara mengomunikasikan keputusan',
            'Diagram yang tidak cocok dengan kodenya bukan arsitektur, melainkan harapan. Bab 4 membahas cara membuat keduanya tetap sinkron',
          ],
        ],
        'Ketiganya berguna, tetapi tidak satu pun menjadi arsitektur hanya karena wujudnya rapi.',
      ),
      p(
        'Uji cepat yang bisa kamu pakai kapan saja begini. Tanyakan **apa yang harus ikut berubah kalau keputusan ini dicabut**. Kalau jawabannya "hanya berkas ini", itu detail. Kalau jawabannya menyebut banyak berkas, data yang sudah tersimpan, atau kesepakatan dengan tim lain, kamu sedang memegang keputusan arsitektur dan pantas melambat sebentar.',
      ),

      h2('Arsitektur ada bahkan ketika tidak diputuskan'),
      p(
        'Setiap aplikasi punya arsitektur, termasuk yang tidak pernah membicarakannya. Bedanya hanya satu, yaitu arsitektur itu **dipilih** atau **terjadi**. Arsitektur yang terjadi terbentuk dari akumulasi keputusan kecil yang masing-masing masuk akal saat dibuat.',
      ),
      p(
        'Bentuknya kira-kira begini. Ada satu fungsi yang butuh data pengguna, jadi ia memanggil query langsung. Ada satu controller yang butuh mengirim email, jadi ia memanggil pengirim email langsung. Ada satu job antrean yang butuh logika yang sama dengan controller, jadi logikanya disalin. Tidak ada satu pun langkah itu yang salah kalau dilihat sendirian. Setahun kemudian, mengganti penyedia email berarti menyentuh tiga puluh berkas, dan tidak ada yang tahu kenapa.',
      ),
      compare(
        {
          title: 'Arsitektur yang terjadi',
          lang: 'text',
          code: `
            controller pesanan
              -> query SQL langsung
              -> kirim email langsung
              -> panggil API pembayaran langsung
              -> tulis log ke berkas

            job antrean
              -> query SQL yang sama, disalin
              -> kirim email dengan template berbeda
          `,
          notes: [
            'Setiap pemanggil tahu detail setiap tujuan',
            'Mengganti satu tujuan berarti mencari seluruh pemanggilnya',
            'Logika yang sama hidup di dua tempat dan mulai berbeda diam-diam',
          ],
        },
        {
          title: 'Arsitektur yang dipilih',
          lang: 'text',
          code: `
            controller pesanan
              -> layanan Pesanan

            job antrean
              -> layanan Pesanan

            layanan Pesanan
              -> penyimpanan Pesanan   (interface)
              -> pengirim Notifikasi   (interface)
              -> gerbang Pembayaran    (interface)
          `,
          notes: [
            'Pemanggil hanya tahu satu permukaan',
            'Mengganti penyedia email menyentuh satu berkas adapter',
            'Logika pesanan hidup di satu tempat dan dipakai dua pintu masuk',
          ],
        },
      ),
      p(
        'Perhatikan bahwa kolom kanan tidak memakai teknologi baru apa pun. Tidak ada layanan tambahan, tidak ada antrean tambahan, tidak ada mesin tambahan. Yang berbeda hanya **siapa boleh tahu apa**, dan perbedaan itu sudah cukup untuk mengubah biaya perubahan di masa depan secara drastis.',
      ),
      callout(
        'tip',
        'Arsitektur pertama yang benar hampir selalu sederhana',
        'Kolom kanan di atas masih satu aplikasi, satu database, satu proses deploy. Kategori ini tidak akan mendorongmu memecah apa pun sebelum ada bukti bahwa pemecahan itu dibutuhkan. Yang didorong sejak awal hanyalah batas yang jelas, karena batas itu murah dibuat sekarang dan mahal ditambahkan nanti.',
      ),

      h2('Bedanya dengan System Design'),
      p(
        'Kategori [System Design](/kelas/system-design/fondasi-sistem) yang baru kamu lewati dan kategori ini sering dianggap satu hal yang sama. Keduanya memang bertetangga dekat, tetapi pertanyaan yang mereka jawab berbeda, dan membedakannya membuat keduanya jauh lebih berguna.',
      ),
      table(
        ['', 'System Design', 'Architecture Design'],
        [
          [
            'Pertanyaan utama',
            'Sanggup tidak sistem ini menampung bebannya',
            'Bentuk apa yang paling tepat untuk sistem ini',
          ],
          [
            'Bahan baku keputusan',
            'Angka, yaitu QPS, latensi, ukuran data, ketersediaan',
            'Sifat, yaitu kestabilan batas, kebutuhan rilis, kematangan operasional',
          ],
          [
            'Contoh keputusan',
            'Pasang cache Redis di depan query terberat',
            'Modul pembayaran tidak boleh membaca tabel milik modul pengguna',
          ],
          [
            'Contoh kesalahan mahal',
            'Salah memilih shard key sehingga data timpang',
            'Memecah layanan di batas yang ternyata masih bergerak',
          ],
          ['Ditulis sebagai', 'Estimasi dan anggaran latensi', 'Diagram, batas modul, dan ADR'],
        ],
        'Keduanya saling melengkapi. Angka dari System Design sering menjadi bukti yang membenarkan sebuah keputusan arsitektur.',
      ),
      p(
        'Hubungan praktisnya begini. System Design memberi tahu kamu bahwa satu bagian aplikasi menerima beban sepuluh kali lipat bagian lain. Architecture Design memakai fakta itu untuk memutuskan apakah bagian itu pantas dipisahkan menjadi layanan sendiri, dan kalau ya, di mana garis pemisahnya ditarik. Tanpa angka, keputusan pemisahan hanya selera. Tanpa keputusan bentuk, angka tidak berubah menjadi tindakan.',
      ),

      h2('Empat pertanyaan yang selalu muncul'),
      p(
        'Seluruh kategori ini pada dasarnya adalah empat pertanyaan yang diulang pada berbagai skala. Mengenali keempatnya sekarang membuat sisa materi terasa jauh lebih tertata.',
      ),
      steps(
        {
          title: 'Bagian besarnya apa saja',
          body: 'Aplikasi ini terdiri dari apa saja kalau dilihat dari jauh. Jawabannya bisa berupa modul di dalam satu aplikasi, bisa berupa layanan terpisah, bisa campuran. Bab 2 membahas cara memilihnya.',
        },
        {
          title: 'Batasnya di mana',
          body: 'Garis pemisah antar bagian ditarik berdasarkan apa. Ini pertanyaan tersulit sekaligus paling mahal kalau salah, karena batas yang keliru baru terasa berbulan-bulan kemudian. Bab 2 sub-bab keempat khusus membahas cara menemukannya.',
        },
        {
          title: 'Mereka bicara bagaimana',
          body: 'Sekali ada lebih dari satu bagian, muncul pertanyaan apakah mereka saling memanggil dan menunggu, atau saling mengirim pesan dan melanjutkan hidup. Pilihan ini menentukan apa yang terjadi ketika salah satu bagian sedang bermasalah. Seluruh Bab 3 membahasnya.',
        },
        {
          title: 'Keputusannya dicatat di mana',
          body: 'Keputusan yang hanya hidup di kepala orang akan hilang bersama orangnya, lalu diperdebatkan ulang oleh orang berikutnya yang tidak tahu alasannya. Bab 4 membahas cara mencatatnya supaya tetap berguna dan tidak basi.',
        },
      ),

      h2('Kapan memikirkan arsitektur, dan kapan tidak'),
      p(
        'Ada dua kesalahan yang sama besarnya dan sama-sama sering terjadi. Yang pertama adalah tidak pernah memikirkan bentuk sampai aplikasinya terlanjur kusut. Yang kedua adalah memikirkan bentuk terlalu jauh untuk aplikasi yang belum punya pengguna.',
      ),
      table(
        ['Situasi', 'Berapa banyak arsitektur yang pantas'],
        [
          [
            'Prototipe untuk membuktikan sebuah ide',
            'Nyaris nol. Kecepatan membuktikan lebih berharga, dan kode ini kemungkinan besar dibuang',
          ],
          [
            'Aplikasi baru yang memang akan dipakai',
            'Batas modul yang jelas di dalam satu aplikasi. Belum perlu apa pun yang terdistribusi',
          ],
          [
            'Aplikasi berjalan yang mulai sering menabrak dirinya sendiri',
            'Waktunya menegakkan batas yang selama ini hanya kesepakatan lisan',
          ],
          [
            'Beberapa tim mengerjakan satu kode dan saling menunggu',
            'Waktunya mempertimbangkan pemisahan, dengan bukti, bukan dengan firasat',
          ],
          [
            'Satu bagian jelas jauh lebih berat daripada sisanya',
            'Waktunya mempertimbangkan menarik keluar bagian itu saja, bukan memecah semuanya',
          ],
        ],
        'Jumlah arsitektur yang pantas ditentukan oleh bukti yang tersedia, bukan oleh ambisi.',
      ),
      callout(
        'warning',
        'Merancang untuk skala yang belum ada adalah biaya, bukan investasi',
        'Susunan yang dirancang untuk sejuta pengguna, dijalankan untuk seratus pengguna, membawa seluruh kerumitannya tanpa satu pun manfaatnya. Ia lebih lambat dibangun, lebih sulit di-debug, lebih mahal dijalankan, dan lebih sering rusak. Setiap kali kategori ini menawarkan bentuk yang lebih terdistribusi, ia akan lebih dulu menyebut kapan bentuk itu tidak dibutuhkan.',
      ),

      h2('Rangkuman'),
      ul(
        'Arsitektur adalah kumpulan keputusan yang mahal untuk dibatalkan, bukan susunan folder atau daftar teknologi.',
        'Uji cepatnya adalah bertanya apa saja yang ikut berubah kalau keputusan ini dicabut.',
        'Setiap aplikasi punya arsitektur. Yang membedakan hanya apakah ia dipilih atau terjadi begitu saja.',
        'System Design menjawab apakah sistem sanggup menampung bebannya, Architecture Design menjawab bentuk apa yang tepat untuk sistem itu.',
        'Empat pertanyaan yang berulang yaitu bagian besarnya apa, batasnya di mana, mereka bicara bagaimana, dan keputusannya dicatat di mana.',
        'Jumlah arsitektur yang pantas ditentukan bukti yang ada sekarang, bukan skala yang dibayangkan.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Arsitektur perangkat lunak adalah kumpulan keputusan yang mahal diubah kemudian. Definisi itu terdengar abstrak sampai diukur pada satu codebase yang nyata.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini, dengan menelusuri seluruh
        pernyataan impor di src/:

          berkas TypeScript             : 116
          sisi ketergantungan           : 337
          berkas tanpa ketergantungan lokal : 8

        Dan berkas yang paling banyak diimpor:
          58  src/lib/curriculum/authoring.ts
          49  src/lib/content/builders.ts
          19  src/lib/curriculum/queries.ts
          16  src/components/ui/icons.tsx
          16  src/lib/utils/cn.ts
        `,
      ),
      p(
        'Angka 58 itu belum menunjukkan seluruhnya. Yang menentukan adalah berapa banyak berkas yang terpengaruh bila bentuk API berkas itu berubah, dan itu dihitung secara transitif.',
      ),
      code(
        'text',
        `
        Diukur sungguhan:

          src/lib/curriculum/authoring.ts
            58 berkas bergantung LANGSUNG
            82 dari 116 berkas bergantung secara TRANSITIF (71%)

        Artinya mengubah bentuk fungsi \`written()\` di berkas itu
        menyentuh 71% dari seluruh codebase.

        Itulah arti "mahal diubah kemudian", dinyatakan sebagai angka
        alih-alih sebagai perasaan.
        `,
        {
          caption:
            'Keputusan tentang bentuk satu fungsi kecil ternyata adalah keputusan arsitektur.',
        },
      ),
      p(
        'Sebaliknya, ada banyak keputusan yang terlihat besar dan sebenarnya murah dibatalkan, dan membedakan keduanya adalah inti pekerjaan arsitektur.',
      ),
      table(
        ['Keputusan', 'Berapa berkas terpengaruh', 'Mahal dibatalkan?'],
        [
          ['Bentuk `written()` dan `Block`', '82 dari 116 (71%)', 'Ya, sangat'],
          ['Struktur direktori `content/`', 'Seluruh berkas kurikulum', 'Ya'],
          ['Pustaka ikon yang dipakai', '16 berkas', 'Sedang'],
          ['Warna dan token desain', 'Berkas gaya saja', 'Tidak'],
          ['Isi satu sub-bab', '1 berkas', 'Tidak'],
        ],
      ),
      p(
        'Perhatikan bahwa yang menentukan bukan seberapa penting sesuatu terasa, melainkan berapa banyak tempat yang harus ikut berubah. Itu bisa dihitung, dan tidak perlu diperdebatkan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Keputusan arsitektur yang keliru tidak menghasilkan error. Ia menghasilkan pekerjaan yang terasa jauh lebih berat daripada seharusnya, dan gejalanya cukup khas.',
      ),
      code(
        'text',
        `
        Gejala bahwa sebuah batas berada di tempat yang salah:

          "Menambah satu field menyentuh tujuh berkas"
          "Setiap perubahan kecil memerlukan perubahan di tiga lapisan"
          "Tidak ada yang berani menyentuh modul itu"
          "Kami harus merilis semuanya bersamaan"
          "Test-nya selalu merah untuk alasan yang tidak berhubungan"

        Kelimanya terukur, bukan soal perasaan. Yang pertama bisa
        dihitung dengan menelusuri satu perubahan nyata dan
        menghitung berkas yang tersentuh.
        `,
      ),
      p('Pada project ini, riwayat git memberi sinyal serupa tanpa perlu menebak.'),
      code(
        'text',
        `
        Diukur sungguhan dari riwayat git project ini, berkas yang
        sering berubah BERSAMAAN:

          3x bersama (50% dari perubahan yang lebih jarang)
              src/lib/content/types.ts
              src/test/curriculum-integrity.test.ts

          3x bersama (60% dari perubahan yang lebih jarang)
              src/content/glossary.ts
              src/test/curriculum-integrity.test.ts

        Dua berkas yang selalu berubah bersamaan punya coupling,
        terlepas dari apakah ada import di antara keduanya.

        Angka itu disebut perubahan bersama, dan ia sering
        menunjukkan batas yang salah tempat lebih jelas daripada
        diagram mana pun.
        `,
        {
          caption:
            'Dalam kasus ini, coupling-nya wajar: test integritas memang harus mengikuti bentuk data yang diujinya.',
        },
      ),
      p(
        'Kesalahan yang berlawanan juga nyata, yaitu memperlakukan setiap keputusan sebagai keputusan arsitektur.',
      ),
      code(
        'text',
        `
        Biaya memperlakukan keputusan murah sebagai keputusan mahal:

          - rapat untuk memutuskan nama variabel
          - dokumen untuk memilih pustaka yang dipakai satu berkas
          - abstraksi untuk sesuatu yang punya satu pemakai

        Uji yang cukup andal: hitung berapa berkas yang harus berubah
        bila keputusan ini dibatalkan minggu depan.

          1 berkas       -> putuskan sendiri, lanjutkan
          5-10 berkas    -> sebutkan di pull request
          > 50 berkas    -> ini keputusan arsitektur. Tulis alasannya
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Arsitektur sering dibayangkan sebagai diagram dan nama pola, padahal ia sebagian besar berupa keputusan tentang di mana batas diletakkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menilai pentingnya keputusan dari perasaan',
            'Ini kan bagian inti',
            'Diukur, satu fungsi kecil ternyata menyentuh 71% codebase. Hitung berkas yang terpengaruh',
          ],
          [
            'Memakai nama pola sebagai jawaban',
            'Pola itu kan sudah teruji',
            '"Pakai hexagonal" bukan keputusan sampai jelas batas apa yang dipisahkan dan kenapa',
          ],
          [
            'Membuat abstraksi untuk pemakai yang belum ada',
            'Biar fleksibel nanti',
            'Biayanya dibayar tiap hari oleh setiap pembaca. Manfaatnya mungkin tidak pernah datang',
          ],
          [
            'Memperlakukan setiap keputusan sebagai keputusan arsitektur',
            'Biar tidak salah',
            'Rapat untuk hal yang bisa dibatalkan dalam lima menit. Hitung dulu biayanya membatalkan',
          ],
          [
            'Menilai arsitektur dari diagramnya',
            'Itu yang terlihat',
            'Diagram menunjukkan niat. Graf impor yang sesungguhnya sering berbeda, dan itu bisa diukur',
          ],
          [
            'Mengabaikan riwayat perubahan sebagai sumber',
            'Itu kan cuma git log',
            'Diukur, berkas yang sering berubah bersamaan menunjukkan coupling yang tidak terlihat dari import',
          ],
        ],
      ),
      p(
        'Cara paling langsung mengetahui arsitektur sebuah project bukan membaca dokumennya melainkan menelusuri seluruh pernyataan impornya dan menggambar grafnya. Skrip yang melakukannya bisa ditulis dalam tiga puluh baris, dan hasilnya hampir selalu menunjukkan sesuatu yang tidak ada di dokumen mana pun.',
      ),
      references(
        {
          label: 'Azure Application Architecture Guide',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/',
          source: 'Microsoft',
          note: 'Peta besar cara Microsoft menyusun keputusan arsitektur, dari gaya sampai pola.',
        },
        {
          label: 'AWS Well-Architected Framework',
          href: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html',
          source: 'Amazon Web Services',
          note: 'Kerangka pertanyaan yang dipakai AWS untuk menilai sebuah arsitektur.',
        },
        {
          label: 'arc42 overview',
          href: 'https://arc42.org/overview',
          source: 'arc42',
          note: 'Kerangka dokumen arsitektur yang dipakai di Bab 4 kategori ini.',
        },
      ),
    ],
  ),

  written(
    'keputusan-mahal',
    'Keputusan yang Mahal Dibatalkan',
    21,
    'Cara memisahkan pintu yang bisa dibuka dua arah dari pintu yang hanya satu arah.',
    [
      p(
        'Ada satu kejadian yang hampir setiap developer pernah alami. Kamu menyimpan nomor telepon pengguna sebagai angka, karena isinya memang angka. Delapan bulan kemudian ada pengguna dari luar negeri yang nomornya diawali tanda tambah, ada yang nomornya diawali angka nol yang ternyata hilang, dan ada yang menulis pakai spasi. Sekarang di database sudah ada dua belas ribu baris dalam bentuk yang salah.',
      ),
      p(
        'Memperbaikinya bukan sekadar mengganti tipe kolom. Kamu harus memutuskan nomor mana yang masih bisa diselamatkan, nomor mana yang sudah kehilangan angka nol di depannya dan tidak bisa ditebak lagi, lalu menjalankan perpindahan itu tanpa menghentikan aplikasi. Padahal keputusan awalnya hanya satu baris, dan saat itu terasa jelas benar.',
      ),
      p(
        'Sekarang bandingkan dengan keputusan lain di hari yang sama. Kamu memilih sebuah library untuk memformat tanggal. Setahun kemudian ternyata ada yang lebih cocok. Kamu ganti dalam satu sore, dan tidak ada satu pun data yang perlu disentuh.',
      ),
      p(
        'Dua keputusan itu terasa sama beratnya saat dibuat, yaitu sama-sama satu baris dan sama-sama tidak dibahas siapa pun. Yang berbeda hanya harganya kalau ternyata keliru. Karena itu keterampilan pertama yang perlu dilatih di kategori ini adalah **menaksir harga pembatalan sebelum memutuskan**. Keterampilan inilah yang membedakan orang yang cepat dan tepat dari orang yang cepat lalu menyesal.',
      ),
      p(
        'Kabar baiknya, sebagian besar keputusan sehari-hari ternyata murah dibatalkan, dan untuk keputusan seperti itu berlama-lama justru merugikan. Kabar yang perlu diwaspadai, sebagian kecil keputusan sangat mahal dibatalkan, dan justru keputusan itu yang paling sering diambil terburu-buru karena kelihatannya sepele saat dibuat, persis seperti kolom nomor telepon tadi.',
      ),

      terms(
        {
          term: 'reversible decision (keputusan dua arah)',
          meaning:
            'Keputusan yang bisa dibatalkan dengan biaya kecil dan dalam waktu singkat, misalnya memilih library untuk memformat tanggal. Sering disebut two-way door, dibaca "tu wei dor", karena kamu bisa masuk lalu keluar lagi lewat pintu yang sama. Keputusan seperti ini sebaiknya diambil cepat dan diperbaiki kalau ternyata keliru.',
        },
        {
          term: 'irreversible decision (keputusan satu arah)',
          meaning:
            'Keputusan yang begitu diambil sangat sulit atau sangat mahal dibatalkan, misalnya memecah satu database menjadi beberapa database milik layanan berbeda. Sering disebut one-way door, dibaca "wan wei dor". Keputusan seperti ini pantas dilambatkan, dicari alternatifnya, dan dicatat alasannya.',
        },
        {
          term: 'cost of change (biaya perubahan)',
          meaning:
            'Seberapa besar usaha yang dibutuhkan untuk mengubah sesuatu di kemudian hari. Biaya perubahan tidak tetap, ia naik seiring waktu. Contohnya begini. Mengganti bentuk kolom nomor telepon di hari pertama berarti mengubah satu baris migrasi, karena belum ada datanya. Mengganti kolom yang sama setelah dua belas ribu baris tersimpan berarti menulis skrip perpindahan, memutuskan nasib data yang rusak, dan menjalankannya tanpa mematikan aplikasi. Keputusannya sama, harganya beda ratusan kali lipat.',
        },
        {
          term: 'coupling (keterikatan)',
          meaning:
            'Seberapa banyak sebuah bagian harus tahu tentang bagian lain agar bisa bekerja. Dibaca "kapling". Coupling adalah penggerak utama biaya perubahan, karena semakin banyak yang tahu tentang sesuatu, semakin banyak yang harus ikut diubah ketika sesuatu itu berubah. Dibahas tuntas di sub-bab 1.4.',
        },
        {
          term: 'lock-in',
          meaning:
            'Keadaan ketika berpindah dari sebuah pilihan menjadi sangat mahal karena terlalu banyak hal yang sudah menempel padanya. Dibaca "lok in". Lock-in bukan selalu buruk. Memakai fitur khas sebuah database sering sepadan, misalnya memakai JSONB milik PostgreSQL karena ia benar-benar menyelesaikan masalahmu. Yang berbahaya adalah lock-in yang terjadi tanpa disadari, misalnya ketika `prisma.pengguna.findMany()` dipanggil langsung di dua ratus berkas, sehingga berpindah ORM berarti menyentuh dua ratus tempat padahal tidak ada satu pun yang pernah memutuskan untuk terikat sekuat itu.',
        },
        {
          term: 'migration (migrasi)',
          meaning:
            'Perpindahan dari bentuk lama ke bentuk baru, termasuk memindahkan data yang sudah terlanjur tersimpan. Migrasi kode relatif murah karena kode bisa ditulis ulang. Migrasi data mahal karena data yang salah bentuk tidak bisa dibatalkan dengan `git revert` dan sering harus dijalankan tanpa menghentikan layanan.',
        },
        {
          term: 'technical debt (utang teknis)',
          meaning:
            'Kerumitan tambahan yang muncul karena sebuah keputusan cepat diambil hari ini, dan harus dibayar berupa usaha ekstra setiap kali kode itu disentuh. Dibaca "teknikal det". Analoginya benar-benar seperti utang uang, yaitu kamu mendapat sesuatu lebih cepat hari ini dengan janji membayar lebih banyak nanti, dan "bunga"-nya berupa waktu ekstra tiap kali menyentuh bagian itu. Contohnya, menyalin logika perhitungan diskon ke dua tempat menghemat satu jam hari ini, lalu menagih lima belas menit tiap kali aturan diskon berubah, selamanya. Sama seperti utang uang, ia tidak selalu buruk. Yang membedakan utang sehat dari utang berbahaya adalah apakah ia diambil sadar dan ada rencana melunasinya.',
        },
        {
          term: 'YAGNI',
          meaning:
            'Singkatan dari You Are not Going to Need It, artinya kamu tidak akan membutuhkannya, dibaca "yagni". Prinsip yang mengingatkan bahwa kemampuan yang dibangun untuk kebutuhan yang belum ada biasanya tidak pernah terpakai, sementara biayanya berupa kode tambahan yang harus dibaca dan dirawat mulai berjalan hari ini juga. Contoh pelanggarannya yang paling sering, yaitu membuat sistem plugin supaya "nanti mudah ditambah jenis pembayaran baru", padahal sampai dua tahun kemudian jenis pembayarannya tetap satu, dan setiap orang baru tetap harus memahami sistem plugin itu untuk mengubah hal paling sederhana.',
        },
        {
          term: 'last responsible moment',
          meaning:
            'Waktu terakhir sebuah keputusan masih bisa ditunda tanpa merugikan, yaitu tepat sebelum menundanya mulai menghambat pekerjaan. Dibaca "last risponsibel moument". Idenya bukan menunda selama mungkin, melainkan menunda sampai informasinya paling lengkap dan sebelum penundaan itu sendiri jadi masalah. Contohnya, memilih penyedia pengiriman email di hari pertama adalah terlalu dini karena kamu belum tahu berapa banyak email yang akan dikirim. Memilihnya sehari sebelum rilis adalah terlambat karena sekarang kamu memutuskan di bawah tekanan. Titik yang tepat ada di antara keduanya, yaitu saat fitur kirim email mulai dibangun.',
        },
      ),

      h2('Dua jenis pintu'),
      p(
        'Cara paling praktis memilah keputusan adalah membayangkan pintu. Sebagian keputusan seperti pintu yang bisa dibuka dua arah, artinya kalau ternyata di baliknya bukan yang kamu cari, kamu tinggal keluar lagi. Sebagian lain seperti pintu satu arah, artinya begitu lewat, jalan kembali jauh lebih panjang daripada jalan masuknya.',
      ),
      table(
        ['Keputusan', 'Jenis pintu', 'Harga pembatalan'],
        [
          [
            'Memilih library validasi',
            'Dua arah',
            'Satu berkas adapter kalau pemakaiannya dibungkus, beberapa jam kalau tersebar',
          ],
          [
            'Memilih nama kolom di tabel baru',
            'Dua arah',
            'Satu migrasi, selama tabelnya belum dipakai pihak luar',
          ],
          [
            'Memilih format respons API publik',
            'Cenderung satu arah',
            'Semua klien yang sudah memakainya harus ikut berubah, dan sebagian di luar kendalimu',
          ],
          [
            'Memilih bentuk penyimpanan data inti',
            'Satu arah',
            'Migrasi data berjalan berhari-hari dan tidak bisa dibatalkan dengan revert',
          ],
          [
            'Memecah satu aplikasi menjadi beberapa layanan',
            'Satu arah',
            'Menyatukan kembali berarti membatalkan pembagian data, kontrak, dan pipeline rilis',
          ],
          [
            'Menentukan batas modul di dalam satu aplikasi',
            'Dua arah, tetapi makin lama makin berat',
            'Selama masih satu aplikasi, memindahkan batas adalah refactor yang dijaga compiler',
          ],
        ],
        'Baris terakhir adalah alasan kenapa kategori ini menyarankan menegakkan batas lebih dulu, dan menunda pemisahan.',
      ),
      p(
        'Baris terakhir itu layak diperhatikan lebih lama. Batas modul di dalam satu aplikasi adalah keputusan yang **sengaja dibuat murah dibatalkan**. Kalau ternyata garisnya salah, kamu memindahkan berkas dan mengubah impor, lalu compiler dan test memberi tahu apa saja yang ikut rusak. Batas yang sama, tetapi diwujudkan sebagai dua layanan terpisah dengan dua database, memindahkannya berarti migrasi data dan koordinasi rilis.',
      ),

      h2('Kenapa biaya perubahan naik seiring waktu'),
      p(
        'Ada tiga hal yang membuat sebuah keputusan makin lama makin mahal dibatalkan, dan mengenali ketiganya membantumu tahu kapan waktunya melambat.',
      ),
      steps(
        {
          title: 'Jumlah kode yang bergantung padanya',
          body: 'Setiap pemanggilan baru menambah satu tempat yang harus disentuh saat keputusan itu dicabut. Sepuluh pemanggilan masih terasa ringan, dua ratus pemanggilan berubah menjadi project tersendiri. Inilah alasan kenapa membungkus ketergantungan luar di balik satu permukaan sering sepadan.',
        },
        {
          title: 'Jumlah data yang sudah tersimpan dalam bentuk itu',
          body: 'Kode bisa ditulis ulang dalam sehari. Data yang sudah tersimpan dalam bentuk lama harus dipindahkan tanpa hilang dan tanpa menghentikan layanan. Sub-bab [migrasi saat deploy](/kelas/deployment/deploy-backend/migrasi-saat-deploy) sudah menunjukkan kenapa langkah ini yang paling sering menjadi penghambat rilis.',
        },
        {
          title: 'Jumlah pihak luar yang sudah mengandalkannya',
          body: 'Begitu ada klien di luar kendalimu yang memakai sebuah bentuk, kamu tidak lagi bisa mengubahnya sendirian. Sub-bab [versioning](/kelas/backend-intermediate/desain-api/versioning) membahas cara hidup dengan kenyataan ini, dan intinya adalah menambah bentuk baru sambil mempertahankan yang lama, bukan mengganti.',
        },
      ),
      p(
        'Tiga faktor itu punya satu kesamaan yang berguna, yaitu ketiganya **bisa diperlambat pertumbuhannya**. Membungkus ketergantungan menahan faktor pertama. Menunda menyimpan data dalam bentuk yang belum mantap menahan faktor kedua. Menandai sebuah endpoint sebagai internal sebelum benar-benar siap dipublikasikan menahan faktor ketiga.',
      ),

      h2('Menunda sampai saat terakhir yang bertanggung jawab'),
      p(
        'Karena keputusan satu arah mahal, godaan pertama adalah menundanya selama mungkin. Godaan itu meleset sedikit. Yang benar adalah menundanya sampai **saat terakhir yang masih bertanggung jawab**, yaitu titik ketika menunda lebih lama mulai menghambat pekerjaan atau memaksa kamu menulis kode yang nanti dibuang.',
      ),
      p(
        'Bedanya terlihat dari contoh. Memutuskan penyedia pengiriman email di hari pertama adalah keputusan yang terlalu dini, karena kamu belum tahu volume, belum tahu jenis email, dan belum tahu batas anggaran. Menunda keputusan itu sampai fitur kirim email benar-benar dibangun berarti kamu memutuskan dengan informasi yang jauh lebih lengkap. Menundanya sampai sehari sebelum rilis adalah cerita yang berbeda, karena sekarang kamu memutuskan di bawah tekanan waktu.',
      ),
      code(
        'ts',
        `
        // Menunda keputusan penyedia email, tanpa menghambat pekerjaan hari ini.
        // Yang diputuskan sekarang hanya BENTUK permukaannya, dan itu keputusan dua arah.

        export type Email = {
          kepada: string;
          subjek: string;
          isiHtml: string;
        };

        export interface PengirimEmail {
          kirim(email: Email): Promise<void>;
        }

        // Implementasi hari ini: cukup mencetak ke log supaya alur bisa dikembangkan dan diuji.
        export class PengirimEmailKeLog implements PengirimEmail {
          async kirim(email: Email): Promise<void> {
            console.info('[email]', email.kepada, email.subjek);
          }
        }
        `,
        {
          filename: 'src/notifikasi/pengirim-email.ts',
          caption:
            'Keputusan penyedia ditunda, tetapi pekerjaan lain tidak ikut tertunda karena permukaannya sudah ada.',
        },
      ),
      p(
        'Perhatikan apa yang sebenarnya sedang terjadi. Kamu tidak sedang membangun kemampuan untuk kebutuhan yang belum ada, yang justru dilarang prinsip YAGNI. Kamu sedang mengubah satu keputusan satu arah menjadi keputusan dua arah, dengan biaya satu berkas berisi satu interface. Itulah bentuk paling murah dari menjaga pilihan tetap terbuka.',
      ),
      callout(
        'warning',
        'Batas antara menjaga pilihan dan over-engineering itu tipis',
        'Satu interface dengan satu implementasi yang menunda satu keputusan mahal adalah investasi yang murah. Lima lapisan abstraksi yang menunda keputusan yang sebenarnya tidak akan pernah berubah adalah biaya yang dibayar setiap kali seseorang membaca kode itu. Pembedanya adalah pertanyaan jujur, yaitu apakah keputusan ini benar-benar masih terbuka.',
      ),

      h2('Keputusan yang paling sering diambil terlalu cepat'),
      p(
        'Dari pengalaman berulang, ada beberapa keputusan yang kelihatan sepele saat dibuat tetapi ternyata satu arah. Kenali daftar ini supaya kamu melambat tepat pada waktunya.',
      ),
      table(
        ['Keputusan', 'Kenapa kelihatan sepele', 'Kenapa sebenarnya mahal'],
        [
          [
            'Memakai `id` berurutan yang bisa ditebak untuk data publik',
            'Angka berurutan paling mudah dan sudah disediakan database',
            'Angka itu bocor ke URL, ke klien, ke laporan, dan menggantinya berarti menyentuh semuanya sekaligus. Sub-bab [IDOR](/kelas/backend-basic/auth-dasar/idor) menunjukkan sisi keamanannya',
          ],
          [
            'Menyimpan waktu tanpa zona waktu',
            'Kolom `timestamp` biasa terasa cukup saat semua pengguna satu negara',
            'Begitu ada pengguna di zona lain, seluruh data lama menjadi ambigu dan tidak ada cara memulihkan niat aslinya',
          ],
          [
            'Menaruh dua konsep berbeda di satu tabel karena kolomnya mirip',
            'Menghemat satu tabel dan satu join',
            'Keduanya berkembang ke arah berbeda, lalu tabel itu penuh kolom yang hanya berlaku untuk sebagian baris',
          ],
          [
            'Membiarkan modul membaca tabel milik modul lain',
            'Query-nya sudah ada, tinggal dipanggil',
            'Bentuk tabel itu berubah menjadi kontrak publik tanpa pernah diputuskan, dan pemiliknya tidak lagi bebas mengubahnya',
          ],
          [
            'Mengembalikan seluruh isi baris database sebagai respons API',
            'Paling cepat ditulis dan otomatis lengkap',
            'Setiap kolom baru ikut bocor ke klien, dan menghapus satu kolom menjadi perubahan yang merusak klien',
          ],
        ],
        'Semua baris ini punya pola yang sama, yaitu sesuatu yang internal diam-diam berubah menjadi kontrak.',
      ),
      p(
        'Pola yang sama itu layak disebut terang-terangan, karena ia akan muncul lagi di Bab 2 dan Bab 3. **Yang membuat sebuah keputusan menjadi satu arah biasanya bukan keputusannya sendiri, melainkan orang lain yang mulai bergantung padanya.** Karena itu cara termurah menjaga pintu tetap dua arah adalah membatasi siapa yang boleh tahu.',
      ),

      h2('Cara menaksir sebelum memutuskan'),
      p(
        'Empat pertanyaan berikut bisa dijawab dalam dua menit dan sudah cukup untuk membedakan keputusan yang pantas dipercepat dari yang pantas dilambatkan.',
      ),
      ol(
        'Kalau enam bulan lagi ini ternyata keliru, apa saja yang harus ikut berubah.',
        'Apakah ada data yang tersimpan dalam bentuk ini, dan apakah data itu bisa diubah bentuknya tanpa kehilangan makna.',
        'Apakah ada pihak di luar kendaliku yang akan mulai bergantung pada ini.',
        'Kalau aku menunda keputusan ini dua minggu, apa yang terhambat.',
      ),
      p(
        'Kalau tiga jawaban pertama ringan, ambil keputusannya sekarang dan lanjutkan. Kalau salah satunya berat, kamu sedang berdiri di depan pintu satu arah, dan itulah saat menuliskan alasannya sebagai catatan keputusan. Bab 4 sub-bab kedua membahas bentuk catatan itu.',
      ),
      callout(
        'info',
        'Menunda bukan berarti diam',
        'Menunda keputusan satu arah hampir selalu berarti mengerjakan sesuatu yang lain yang membuat keputusan itu lebih mudah diambil nanti, misalnya mengumpulkan angka pemakaian, membungkus ketergantungan, atau memisahkan modul supaya batasnya terlihat. Penundaan yang tidak disertai pekerjaan apa pun hanya menunda rasa sakit.',
      ),

      h2('Rangkuman'),
      ul(
        'Keputusan dua arah sebaiknya diambil cepat, keputusan satu arah pantas dilambatkan dan dicatat.',
        'Biaya perubahan naik karena tiga hal yaitu jumlah kode yang bergantung, jumlah data yang tersimpan, dan jumlah pihak luar yang mengandalkan.',
        'Ketiganya bisa diperlambat, misalnya dengan membungkus ketergantungan dan menunda menyimpan data dalam bentuk yang belum mantap.',
        'Tunda sampai saat terakhir yang bertanggung jawab, bukan selama mungkin.',
        'Sebagian besar keputusan menjadi satu arah bukan karena isinya, melainkan karena ada pihak lain yang mulai bergantung padanya.',
        'Empat pertanyaan cepat sudah cukup untuk memisahkan mana yang perlu dilambatkan.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Keputusan yang mahal dibatalkan punya satu ciri yang bisa diukur, yaitu banyaknya tempat yang harus ikut berubah. Itu bukan penilaian melainkan hitungan.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini:

          src/lib/curriculum/authoring.ts
            fan-in langsung   : 58 berkas
            fan-in transitif  : 82 dari 116 berkas (71%)

          src/lib/content/builders.ts
            fan-in langsung   : 49 berkas

        Mengubah bentuk fungsi \`written()\` atau bentuk \`Block\` di
        kedua berkas itu berarti menyentuh mayoritas codebase.

        Sebagai pembanding, satu berkas pelajaran:
          fan-in : 1 berkas (berkas indeks kategorinya)
        `,
        {
          caption:
            'Selisih antara 82 dan 1 adalah selisih antara keputusan arsitektur dan keputusan biasa.',
        },
      ),
      p(
        'Beberapa keputusan mahal karena alasan yang berbeda, yaitu karena data yang sudah tersimpan mengikuti bentuknya.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan PostgreSQL 16.15:

          kode LAMA membaca nama_lengkap  -> berhasil
          -- migrasi RENAME dijalankan, kode BARU di-deploy --
          kode BARU membaca nama          -> berhasil
          -- ada bug, kode di-rollback ke versi LAMA --

          SELECT nama_lengkap FROM pengguna
            ERROR: column "nama_lengkap" does not exist

        Rollback kodenya berhasil, dan aplikasinya tetap rusak.

        Dan dihitung dengan volume yang realistis:
          283 byte/baris, 100 juta baris/hari
          1 tahun -> 10,3 TB

        Memindahkan 10,3 TB sambil sistemnya melayani adalah
        pekerjaan berminggu-minggu.
        `,
      ),
      p(
        'Karena itu keputusan bisa diurutkan dari yang paling mahal dibatalkan, dan urutan itu menentukan berapa banyak pemikiran yang pantas dikeluarkan.',
      ),
      table(
        ['Keputusan', 'Yang harus ikut berubah', 'Biaya membatalkan'],
        [
          [
            'Bentuk data yang tersimpan',
            'Seluruh data yang sudah ada',
            'Sangat mahal, dan bertambah tiap hari',
          ],
          [
            'Kontrak API publik',
            'Setiap klien, termasuk yang tidak kamu kendalikan',
            'Sangat mahal',
          ],
          ['Batas modul dan arah ketergantungan', 'Setiap berkas yang menyeberanginya', 'Mahal'],
          ['Bentuk fungsi dengan fan-in tinggi', 'Diukur, 82 dari 116 berkas', 'Mahal'],
          ['Pustaka pihak ketiga di satu lapisan', 'Lapisan itu saja', 'Sedang'],
          ['Isi satu fungsi', 'Fungsi itu', 'Murah'],
        ],
      ),
      p(
        'Yang membuat daftar itu berguna adalah bahwa ia bisa dibalik menjadi strategi, yaitu menunda keputusan yang mahal sampai informasinya cukup, dan mengambil keputusan yang murah dengan cepat.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Keputusan mahal yang diambil terlalu cepat tidak menghasilkan error saat diambil. Biayanya muncul sebagai pekerjaan yang tidak pernah selesai.',
      ),
      code(
        'text',
        `
        Bentuk yang khas:

          "Kita tidak bisa mengubah itu, terlalu banyak yang pakai"
          "Sudah ada tiga cara melakukan hal yang sama, dan
           ketiganya masih dipakai"
          "Kita sudah mulai migrasi ke bentuk baru dua tahun lalu"
          "Jangan sentuh modul itu, tidak ada yang paham lagi"

        Ketiga yang pertama adalah gejala keputusan yang dibatalkan
        SEBAGIAN: yang lama tidak pernah dihapus, dan sekarang
        keduanya harus dijaga.
        `,
      ),
      p(
        'Ada satu bentuk kegagalan yang lebih halus, yaitu keputusan yang membeku karena tidak ada yang tahu apa yang akan rusak bila diubah.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini, fitness function yang
        dijalankan terhadap graf impornya:

          GAGAL  lib tidak boleh bergantung pada content (1 pelanggaran)
                 src/lib/curriculum/queries.ts -> src/content/curriculum/index.ts

          GAGAL  tidak ada siklus ketergantungan (3 pelanggaran)
                 src/app/dashboard-client.tsx -> src/app/page.tsx -> ...
                 src/app/latihan/latihan-client.tsx -> src/app/latihan/page.tsx -> ...
                 src/app/roadmap/page.tsx -> src/app/roadmap/roadmap-client.tsx -> ...

        Ketiga siklus itu adalah pasangan halaman server dan komponen
        klien yang saling mengimpor — bentuk yang lazim di Next.js
        dan tetap merupakan siklus.

        Yang penting bukan apakah temuan itu harus diperbaiki,
        melainkan bahwa ia SEKARANG TERLIHAT dan bisa diputuskan.
        `,
        {
          caption:
            'Keputusan yang tidak terlihat tidak bisa ditinjau ulang, dan itu yang membuatnya membeku.',
        },
      ),
      p('Dan satu kesalahan arah sebaliknya, yaitu menunda keputusan murah karena takut salah.'),
      code(
        'text',
        `
        Keputusan yang MURAH dibatalkan, dan sering ditunda berhari-hari:

          nama fungsi
          struktur satu berkas
          pustaka yang dipakai di satu tempat
          bentuk satu komponen

        Untuk semuanya, mencoba lalu mengubah lebih murah daripada
        memperdebatkan. Uji cepatnya: bila keputusan ini salah,
        berapa lama memperbaikinya?

          di bawah sehari -> ambil sekarang, lanjutkan
          berminggu-minggu -> tunda sampai informasinya cukup
        `,
      ),

      h2('Kesalahan umum pemula'),
      p('Yang paling sering keliru bukan keputusannya melainkan waktu mengambilnya.'),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memutuskan bentuk data sebelum pola aksesnya jelas',
            'Harus mulai dari suatu tempat',
            'Diuji, `RENAME` membuat rollback mustahil. Dan 10,3 TB tidak bisa dipindah dalam semalam',
          ],
          [
            'Menerbitkan API publik sebelum bentuknya stabil',
            'Biar klien bisa mulai',
            'Setiap klien yang memakainya mengunci bentuknya. Tandai eksperimental, dan beri versi',
          ],
          [
            'Membuat abstraksi sebelum ada pemakai kedua',
            'Nanti pasti ada',
            'Abstraksi untuk satu pemakai adalah lapisan tanpa manfaat, dan ia menaikkan fan-in',
          ],
          [
            'Menunda keputusan murah karena takut salah',
            'Biar tidak perlu diubah',
            'Untuk yang bisa diperbaiki dalam sehari, mencoba lebih murah daripada memperdebatkan',
          ],
          [
            'Membatalkan keputusan hanya sebagian',
            'Nanti sisanya menyusul',
            'Dua cara melakukan hal yang sama harus dijaga keduanya, dan itu biaya permanen',
          ],
          [
            'Tidak pernah mengukur ketergantungan yang sebenarnya',
            'Sudah terlihat dari strukturnya',
            'Diukur, satu berkas menyentuh 71% codebase secara transitif. Itu tidak terlihat dari direktori',
          ],
        ],
      ),
      p(
        'Ada satu pertanyaan yang bila diajukan sebelum keputusan besar menghemat banyak, dan ia bukan tentang benar atau salah. Berapa lama waktu yang dibutuhkan untuk membatalkan keputusan ini bila enam bulan lagi ternyata keliru? Jawabannya memisahkan keputusan yang pantas ditunda dari keputusan yang pantas diambil sekarang, dan ia jauh lebih berguna daripada berusaha menebak mana yang benar.',
      ),
      references(
        {
          label: 'Design principles for Azure applications',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/',
          source: 'Microsoft',
          note: 'Sepuluh prinsip yang beberapa di antaranya langsung soal menahan biaya perubahan.',
        },
        {
          label: 'Architectural Decision Records',
          href: 'https://adr.github.io/',
          source: 'ADR GitHub organization',
          note: 'Tempat mencatat keputusan satu arah beserta alasannya, dibahas tuntas di Bab 4.',
        },
        {
          label: 'The Twelve-Factor App',
          href: 'https://12factor.net/',
          source: '12factor.net',
          note: 'Kumpulan keputusan awal yang sengaja dibuat supaya perubahan berikutnya tetap murah.',
        },
      ),
    ],
  ),

  written(
    'atribut-kualitas',
    'Atribut Kualitas yang Menarik Bentuk',
    21,
    'Kenapa dua aplikasi dengan fitur sama bisa pantas berbentuk sangat berbeda.',
    [
      p(
        'Bayangkan dua orang diminta merancang tempat menyimpan barang. Orang pertama merancang untuk menyimpan beras di dapur rumah. Orang kedua merancang untuk menyimpan vaksin di rumah sakit. Keduanya menghasilkan benda yang fungsinya sama, yaitu wadah tertutup yang bisa dibuka dan ditutup. Bentuknya jauh berbeda, dan tidak satu pun dari mereka salah.',
      ),
      p(
        'Yang membuat bentuknya berbeda bukan daftar fungsinya, melainkan **sifat yang dituntut**. Wadah beras dituntut murah dan mudah dibersihkan. Wadah vaksin dituntut suhunya stabil dan punya alarm kalau listriknya mati. Sifat itulah yang menarik bentuknya ke arah masing-masing.',
      ),
      p(
        'Hal yang sama persis terjadi pada perangkat lunak, dan inilah sebabnya kalau kamu bertanya kepada sepuluh orang bagaimana sebaiknya sebuah aplikasi disusun, kamu mendapat sepuluh jawaban berbeda yang sebagian besar benar. Mereka tidak sedang berselera berbeda. Mereka diam-diam sedang mengejar sifat yang berbeda.',
      ),
      p(
        'Sifat yang dituntut dari sebuah sistem punya nama resmi, yaitu **atribut kualitas**. Dua aplikasi bisa punya daftar fitur yang nyaris identik dan tetap pantas berbentuk sangat berbeda karena atribut kualitasnya berbeda. Dan sebagian besar percakapan arsitektur yang berputar-putar tanpa ujung sebenarnya adalah percakapan tentang atribut kualitas yang tidak pernah disebut namanya oleh siapa pun.',
      ),

      terms(
        {
          term: 'quality attribute (atribut kualitas)',
          meaning:
            'Sifat yang dituntut dari sistem selain daftar fiturnya, misalnya harus cepat, harus tetap hidup, harus mudah diubah, harus aman. Sering juga disebut **non-functional requirement**, dibaca "non fangsyonal rikuairment". Kategori [System Design](/kelas/system-design/fondasi-sistem/kebutuhan-fungsional-nonfungsional) sudah memperkenalkannya dari sisi angka. Di sini yang dilihat adalah tarikannya terhadap bentuk.',
        },
        {
          term: 'maintainability (kemudahan dirawat)',
          meaning:
            'Seberapa mudah orang berikutnya memahami dan mengubah sistem ini tanpa merusak bagian lain. Dibaca "meinteinabiliti". Cara mengukurnya yang paling jujur adalah pertanyaan ini, berapa lama orang yang baru bergabung minggu lalu butuh waktu untuk menambah satu field ke halaman profil. Kalau jawabannya dua jam, maintainability-nya baik. Kalau jawabannya dua hari karena ia harus membaca tujuh berkas dulu untuk tahu di mana harus mengubah, itu sinyal. Atribut ini paling sering diabaikan karena tidak terlihat pengguna, dan sekaligus paling sering menjadi penyebab sebuah project melambat drastis setelah tahun pertama.',
        },
        {
          term: 'testability (kemudahan diuji)',
          meaning:
            'Seberapa mudah sebuah perilaku dibuktikan benar tanpa menjalankan seluruh sistem. Dibaca "testabiliti". Contoh konkret bedanya begini. Untuk menguji aturan "pesanan yang sudah dibayar tidak bisa dibatalkan", kamu bisa memanggil satu fungsi dan langsung melihat hasilnya, atau kamu harus menyalakan database, mengisi data awal, menjalankan server, lalu mengirim permintaan HTTP. Yang pertama testability-nya baik, yang kedua tidak. Testability berguna sebagai penanda cepat karena kode yang sulit diuji tanpa menyalakan database dan jaringan biasanya sedang memberi tahu bahwa batasnya kabur.',
        },
        {
          term: 'observability',
          meaning:
            'Seberapa mudah kamu mengetahui apa yang sedang terjadi di dalam sistem hanya dari sinyal yang dipancarkannya, yaitu log, metrik, dan trace. Dibaca "observabiliti". Sub-bab [observability](/kelas/backend-intermediate/express-intermediate/observability) sudah membahas cara memasangnya. Di kategori ini ia muncul sebagai syarat, karena bentuk yang terdistribusi tidak bisa dijalankan tanpanya.',
        },
        {
          term: 'evolvability (kemudahan berkembang)',
          meaning:
            'Seberapa mudah sistem menerima perubahan yang belum terbayang saat ia dibangun. Dibaca "ivolvabiliti". Bedanya dengan maintainability tipis tetapi nyata. Maintainability adalah soal mengubah yang sudah ada, misalnya memperbaiki cara ongkos kirim dihitung. Evolvability adalah soal menambahkan yang dulu tidak terpikir sama sekali, misalnya aplikasi yang tadinya hanya menjual barang tiba-tiba juga harus menjual kelas online, dan ternyata bentuk pesanannya bisa menampung keduanya tanpa dibongkar.',
        },
        {
          term: 'operability (kemudahan dioperasikan)',
          meaning:
            'Seberapa mudah sistem ini dijalankan sehari-hari oleh orang yang merawatnya, termasuk merilis, memantau, memulihkan, dan menyelidiki masalah. Dibaca "operabiliti". Pertanyaan yang mengukurnya, kalau jam sebelas malam ada laporan bahwa pesanan tidak masuk, berapa lama sampai kamu tahu penyebabnya, dan apakah kamu bisa memperbaikinya sendirian. Atribut ini paling sering dilupakan saat memilih bentuk terdistribusi, padahal justru ini yang paling banyak berubah begitu satu aplikasi menjadi banyak layanan.',
        },
        {
          term: 'trade-off',
          meaning:
            'Pertukaran, yaitu keuntungan yang dibeli dengan kerugian di tempat lain. Dibaca "treid of". Dalam atribut kualitas, trade-off bukan pengecualian melainkan keadaan normal. Menaikkan satu atribut hampir selalu menurunkan atribut lain, dan pekerjaan seorang perancang adalah memilih mana yang boleh turun.',
        },
        {
          term: 'architecture characteristic driver',
          meaning:
            'Atribut kualitas yang benar-benar menentukan bentuk, yaitu yang kalau diabaikan membuat sistem gagal memenuhi tujuannya. Diterjemahkan bebas menjadi atribut penggerak. Dari belasan atribut yang bisa disebut, biasanya hanya tiga sampai empat yang layak menjadi penggerak. Memilih terlalu banyak sama saja dengan tidak memilih, persis seperti daftar prioritas berisi sepuluh butir yang semuanya bertanda penting, yang pada akhirnya tidak menolong siapa pun memutuskan apa yang dikerjakan lebih dulu.',
        },
      ),

      h2('Fitur yang sama, bentuk yang berbeda'),
      p(
        'Cara tercepat merasakan gagasan ini adalah membandingkan dua sistem yang daftar fiturnya mirip. Keduanya menyimpan data, keduanya punya halaman daftar, keduanya punya notifikasi. Yang berbeda hanya sifat yang dituntut, dan perbedaan itu saja sudah cukup untuk menghasilkan dua bentuk yang jauh berbeda.',
      ),
      table(
        ['', 'Aplikasi catatan internal untuk 40 karyawan', 'Aplikasi ticketing konser'],
        [
          [
            'Atribut paling menentukan',
            'Maintainability dan kecepatan menambah fitur',
            'Ketersediaan dan sanggup menahan lonjakan mendadak',
          ],
          [
            'Bentuk yang wajar',
            'Satu aplikasi, satu database, satu proses deploy',
            'Antrean di depan penulisan, cache agresif, kapasitas yang bisa dinaikkan cepat',
          ],
          [
            'Konsistensi data',
            'Kuat di mana-mana, karena murah dan tidak ada alasan tidak',
            'Kuat hanya di stok tiket, longgar di sisanya supaya tetap melayani',
          ],
          [
            'Harga kesalahan',
            'Beberapa orang terganggu satu jam',
            'Pendapatan hilang dalam hitungan menit dan tidak bisa diulang',
          ],
          [
            'Yang boleh dikorbankan',
            'Performa, karena tidak ada yang merasakannya',
            'Kemudahan dirawat sampai batas tertentu, karena ketersediaan lebih mahal kalau gagal',
          ],
        ],
        'Daftar fitur keduanya bisa sangat mirip. Yang tidak mirip adalah sifat yang dituntut.',
      ),
      p(
        'Perhatikan baris terakhir. Setiap kolom menyebutkan sesuatu yang **boleh dikorbankan**, dan itu bukan kelalaian melainkan bagian dari keputusan. Rancangan yang mengaku unggul di semua atribut sekaligus biasanya belum diuji, karena atribut kualitas saling tarik-menarik.',
      ),

      h2('Tarik-menarik yang paling sering muncul'),
      p(
        'Beberapa pasangan atribut hampir selalu bertabrakan. Mengenali pasangan ini membuatmu bisa menyebut harganya di depan, bukan menemukannya setelah dibangun.',
      ),
      table(
        ['Menaikkan ini', 'Cenderung menurunkan ini', 'Kenapa'],
        [
          [
            'Ketersediaan lewat penggandaan komponen',
            'Konsistensi dan kesederhanaan',
            'Begitu ada lebih dari satu salinan, muncul kemungkinan keduanya berbeda isi, dan mendamaikannya menambah kerumitan',
          ],
          [
            'Performa lewat cache dan denormalisasi',
            'Kesegaran data dan kemudahan dirawat',
            'Salinan yang dibuat demi kecepatan harus dijaga tetap benar, dan penjagaan itu adalah kode tambahan yang bisa lupa dijalankan',
          ],
          [
            'Kemudahan diubah lewat batas modul yang tegas',
            'Kecepatan menulis kode di awal',
            'Melewati batas resmi selalu lebih panjang daripada memanggil langsung. Yang dibeli adalah kemudahan nanti, yang dibayar adalah usaha sekarang',
          ],
          [
            'Kemandirian rilis lewat layanan terpisah',
            'Kemudahan dioperasikan dan ditelusuri',
            'Satu permintaan sekarang melintasi beberapa proses, sehingga menjawab pertanyaan sederhana pun butuh trace',
          ],
          [
            'Keamanan lewat pemeriksaan berlapis',
            'Kecepatan respons dan kenyamanan',
            'Setiap pemeriksaan tambahan memakan waktu dan menambah langkah bagi pengguna. Sub-bab [hak seminimal mungkin](/kelas/keamanan-fullstack/identitas-kewenangan/hak-seminimal-mungkin) menunjukkan batas wajarnya',
          ],
        ],
        'Tidak satu pun baris ini berarti jangan dilakukan. Semuanya berarti sebutkan harganya sebelum melakukannya.',
      ),
      callout(
        'warning',
        'Keamanan adalah pengecualian yang tidak ditawar',
        'Baris terakhir tabel di atas menyebut keamanan sebagai trade-off, dan itu benar untuk *seberapa banyak* lapisan yang dipasang. Yang tidak pernah menjadi trade-off adalah aturan keras yang sudah kamu pelajari di kategori [Keamanan Fullstack](/kelas/keamanan-fullstack/batas-aplikasi-web/batas-kepercayaan). Otorisasi di sisi server, validasi input, dan rahasia yang tidak pernah masuk kode bukan pilihan yang bisa dikalahkan performa atau kenyamanan.',
      ),

      h2('Memilih tiga sampai empat, bukan sepuluh'),
      p(
        'Daftar atribut kualitas yang bisa disebut sangat panjang. Kalau semuanya dianggap penting, tidak ada satu pun yang benar-benar menentukan, dan kamu kembali memutuskan berdasarkan selera. Karena itu langkah nyatanya adalah memilih tiga sampai empat atribut yang benar-benar menjadi penggerak bentuk.',
      ),
      steps(
        {
          title: 'Tulis semua atribut yang terlintas',
          body: 'Cepat saja, tanpa menyaring. Biasanya keluar delapan sampai dua belas, misalnya cepat, aman, mudah diubah, hemat biaya, tahan mati, mudah diuji, mudah dipantau, mudah dipakai tim baru.',
        },
        {
          title: 'Coret yang tidak punya konsekuensi kalau gagal',
          body: 'Untuk setiap atribut tanyakan apa yang benar-benar terjadi kalau ia tidak terpenuhi. Kalau jawabannya samar atau tidak ada yang peduli, ia bukan penggerak bentuk. Ini menghabisi separuh daftar dengan cepat.',
        },
        {
          title: 'Ubah sisanya menjadi kalimat yang bisa diperiksa',
          body: 'Ganti "harus cepat" menjadi "halaman daftar pesanan tampil di bawah satu detik pada P95". Ganti "mudah diubah" menjadi "menambah metode pembayaran baru tidak menyentuh modul pesanan". Atribut yang tidak bisa diperiksa tidak bisa dipakai menilai rancangan.',
        },
        {
          title: 'Urutkan, lalu sebutkan yang boleh kalah',
          body: 'Dari tiga sampai empat yang tersisa, tentukan mana yang menang kalau dua di antaranya bertabrakan. Inilah bagian yang paling sering dilewati, dan justru inilah yang menyelesaikan perdebatan berbulan-bulan kemudian.',
        },
      ),
      code(
        'text',
        `
        Atribut penggerak — Aplikasi kursus internal

        1. Maintainability  (menang atas semuanya)
           Diperiksa: satu orang baru bisa menambah jenis materi baru dalam satu hari,
           tanpa menyentuh modul penilaian.

        2. Konsistensi data nilai  (menang atas performa)
           Diperiksa: nilai yang tersimpan tidak pernah berbeda antara halaman rapor
           dan halaman detail, bahkan saat penyimpanan bersamaan.

        3. Observability  (menang atas kesederhanaan)
           Diperiksa: dari satu id permintaan, seluruh langkah pemrosesan bisa dilacak.

        Yang sengaja TIDAK menjadi penggerak:
        - Performa ekstrem. 300 pengguna internal, beban puncak jauh di bawah satu server.
        - Ketersediaan 99,99 persen. Mati satu jam di luar jam kerja tidak merugikan.
        - Kemandirian rilis per modul. Satu tim, satu jadwal rilis.
        `,
        {
          caption:
            'Bentuk yang bisa ditempel di dokumen desain. Bagian "yang sengaja tidak" sama pentingnya dengan bagian atas.',
        },
      ),
      p(
        'Bagian bawah contoh itu yang paling sering hilang di dokumen nyata, padahal ia yang paling berguna. Menuliskan atribut yang **sengaja tidak dikejar** mencegah seseorang enam bulan lagi menambahkan kerumitan demi sesuatu yang memang tidak pernah dibutuhkan.',
      ),

      h2('Dari atribut ke bentuk'),
      p(
        'Setelah atribut penggeraknya jelas, bentuk mulai bisa disimpulkan. Tabel berikut memperlihatkan tarikan yang paling sering terjadi. Ia bukan aturan otomatis, tetapi ia menunjukkan bahwa bentuk memang punya sebab.',
      ),
      table(
        ['Atribut penggerak', 'Tarikan terhadap bentuk', 'Dibahas di'],
        [
          [
            'Maintainability di tim kecil',
            'Satu aplikasi dengan batas modul yang tegas. Pemecahan hanya menambah biaya',
            'Bab 2 sub-bab 1 dan 2',
          ],
          [
            'Kemandirian rilis antar tim',
            'Pemisahan menjadi layanan, dimulai dari satu bagian yang paling butuh',
            'Bab 2 sub-bab 5 dan 6',
          ],
          [
            'Ketahanan terhadap lonjakan mendadak',
            'Pekerjaan berat dipindah ke antrean, jalur permintaan dibuat tipis',
            'Bab 3 sub-bab 1 dan 3',
          ],
          [
            'Konsistensi kuat pada data tertentu',
            'Data itu tetap dipegang satu pemilik, dan tidak ikut dipecah',
            'Bab 3 sub-bab 4 dan 5',
          ],
          [
            'Beban baca jauh lebih besar daripada tulis',
            'Model baca dipisahkan dari model tulis',
            'Bab 3 sub-bab 6',
          ],
          [
            'Evolvability saat kebutuhan masih berubah cepat',
            'Batas dibuat murah dipindahkan, keputusan satu arah ditunda',
            'Bab 1 sub-bab 2, Bab 4 sub-bab 5',
          ],
        ],
        'Setiap baris di kolom kanan akan dibuka penuh nanti. Yang penting sekarang adalah melihat bahwa bentuk punya sebab.',
      ),
      callout(
        'info',
        'Atribut yang tidak disebut tetap bekerja',
        'Kalau tidak ada yang pernah menyebut maintainability sebagai penggerak, ia tidak lantas hilang. Ia hanya berhenti dipertimbangkan saat memutuskan, lalu tagihannya datang belakangan dalam bentuk perubahan kecil yang memakan waktu berhari-hari. Menyebutkan atribut secara terbuka adalah cara termurah membuatnya ikut diperhitungkan.',
      ),

      h2('Rangkuman'),
      ul(
        'Bentuk sistem ditarik oleh atribut kualitas, bukan oleh daftar fitur.',
        'Dua aplikasi dengan fitur mirip pantas berbentuk berbeda kalau sifat yang dituntutnya berbeda.',
        'Atribut kualitas saling tarik-menarik, sehingga rancangan yang mengaku unggul di semuanya belum diuji.',
        'Aturan keras keamanan bukan trade-off. Yang bisa ditawar hanya seberapa banyak lapisan tambahannya.',
        'Pilih tiga sampai empat atribut penggerak, tulis dalam kalimat yang bisa diperiksa, lalu urutkan mana yang menang.',
        'Tuliskan juga atribut yang sengaja tidak dikejar, karena itu yang mencegah kerumitan datang belakangan.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Atribut kualitas adalah sifat yang menarik bentuk sistem ke arah tertentu, dan hampir selalu saling bertarik ke arah yang berlawanan. Yang membuatnya bisa diputuskan adalah angka.',
      ),
      code(
        'text',
        `
        Contoh pertarikan yang terukur, dari bab System Design:

        KECEPATAN BACA melawan KECEPATAN TULIS
          agregasi 1.000.000 baris   468,922 ms
          kolom denormalisasi          0,068 ms   (6.900x lebih cepat)
          biaya tulisnya 0,0090 ms -> 0,2825 ms   (31x lebih lambat)

        KESEGARAN melawan KAPASITAS BACA
          replika baca menambah kapasitas
          dan saat beban tulis besar, 8 dari 8 pembacaan sesudah
          penulisan GAGAL menemukan datanya

        KETERSEDIAAN melawan KESEDERHANAAN
          2 salinan @ 99% -> 99,99%
          10 komponen berantai @ 99,9% -> 99,0045% (87,2 jam/tahun)
        `,
        {
          caption:
            'Tiap baris adalah pertukaran, bukan perbaikan. Yang bisa dipilih hanyalah arah mana yang lebih berharga di sini.',
        },
      ),
      p(
        'Karena itu atribut kualitas hanya berguna bila ditulis dengan angka dan dengan cara mengukurnya, bukan sebagai kata sifat.',
      ),
      table(
        ['Ditulis sebagai kata sifat', 'Ditulis sebagai atribut yang bisa diuji'],
        [
          ['Harus cepat', 'p95 pencarian di bawah 300 ms, diukur dari peramban pengguna'],
          ['Harus andal', 'SLI 99,9% per 30 hari, diukur di penyeimbang beban'],
          [
            'Harus mudah dirawat',
            'Menambah satu jenis blok konten menyentuh paling banyak 3 berkas',
          ],
          [
            'Harus aman',
            'Tidak ada endpoint yang mengembalikan data milik pengguna lain, diuji otomatis',
          ],
          ['Harus mudah diuji', 'Seluruh logika bisnis bisa diuji tanpa basis data'],
          [
            'Harus bisa menskala',
            'Menangani 3.472 QPS tulis pada puncak, dengan p99 di bawah 500 ms',
          ],
        ],
      ),
      p('Baris ketiga pantas diperhatikan karena ia bisa diukur pada project ini sendiri.'),
      code(
        'text',
        `
        Diukur sungguhan pada project ini:

          src/lib/content/builders.ts
            49 berkas mengimpornya langsung

        Artinya menambah satu jenis blok konten baru menyentuh
        berkas itu, dan setiap berkas kurikulum yang memakainya
        tidak perlu berubah sama sekali — mereka hanya memanggil
        fungsi baru bila memerlukannya.

        Itulah bentuk "mudah dirawat" yang terukur: penambahan
        bersifat aditif, bukan menuntut perubahan di 49 tempat.

        Yang TIDAK aditif, dan karena itu mahal:
          mengubah BENTUK fungsi yang sudah ada
          diukur, authoring.ts menyentuh 82 dari 116 berkas (71%)
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Atribut kualitas yang tidak ditulis tidak menghasilkan error saat pembangunan. Ia menghasilkan penulisan ulang setelah sistemnya dipakai.',
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

        Keempatnya BUKAN fitur baru. Keempatnya atribut kualitas yang
        sudah ada sejak awal dan tidak pernah ditanyakan.
        `,
      ),
      p(
        'Kegagalan kedua berupa mengejar satu atribut sampai merusak yang lain, dan biayanya bisa dihitung.',
      ),
      code(
        'text',
        `
        Mengejar KETERSEDIAAN tanpa menghitung kesederhanaan:

        Dihitung sungguhan:
           1 komponen @ 99,9% -> 99,9000%   (  8,8 jam/tahun)
           5 komponen @ 99,9% -> 99,5010%   ( 43,7 jam/tahun)
          10 komponen @ 99,9% -> 99,0045%   ( 87,2 jam/tahun)
          30 komponen @ 99,9% -> 97,0431%   (259,0 jam/tahun)

        Menambah cache, antrean, penyeimbang beban, dan gerbang API
        "untuk ketangguhan" menambah empat komponen BERANTAI.

        Bila keempatnya tidak dirancang agar kegagalannya tidak
        menjatuhkan seluruhnya, sistem yang "lebih tangguh" justru
        lebih sering mati daripada satu server.
        `,
        {
          caption:
            'Komponen paralel menambah ketersediaan; komponen berantai menguranginya. Keduanya sering dicampur.',
        },
      ),
      code(
        'text',
        `
        Mengejar KECEPATAN tanpa menghitung konsistensi:

        Diuji sungguhan dengan replika streaming PostgreSQL 16.15:

          saat sistem DIAM  : 5 dari 5 pembacaan sesudah penulisan BERHASIL
          saat beban BESAR  : 8 dari 8 GAGAL (replika tertinggal 11 MB)

        Kapasitas baca bertambah, dan jaminan "data yang baru saya
        tulis bisa saya baca" hilang — tepat pada saat sistem sedang
        ramai, yaitu saat ia paling diperhatikan.
        `,
      ),
      p(
        'Kesalahan ketiga bersifat urutan, yaitu menulis atribut kualitas sesudah arsitekturnya dipilih.',
      ),
      code(
        'text',
        `
        Atribut kualitas MENARIK bentuk. Bila ia ditulis sesudahnya,
        ia hanya menjadi pembenaran.

        Contoh urutan yang benar:
          "p95 pencarian di bawah 300 ms, dari peramban pengguna
           di Indonesia"
            -> panggilan API ke server di benua lain sudah memakan
               p50 70,04 ms dan p99 362,72 ms (diukur)
            -> maka pencariannya harus dilayani dari dekat pengguna
            -> maka indeks pencariannya harus direplikasi
            -> maka ia boleh sedikit basi

        Satu angka menghasilkan tiga keputusan arsitektur berturut-turut.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Atribut kualitas terasa seperti bagian dokumen yang bisa diisi belakangan, dan justru ia yang menentukan bentuk seluruh sistem.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis "harus cepat" dan "harus andal"',
            'Itu memang yang diinginkan',
            'Tidak bisa diuji dan tidak bisa dirancang. Sebutkan angka, persentil, dan dari mana diukurnya',
          ],
          [
            'Mengejar beberapa atribut sekaligus tanpa memilih',
            'Semuanya kan penting',
            'Diukur, kecepatan baca dibayar kecepatan tulis 31 kali. Pertukaran itu tidak bisa dihindari',
          ],
          [
            'Menambah komponen demi ketangguhan',
            'Lebih banyak lapisan kan lebih aman',
            'Dihitung, 10 komponen berantai @ 99,9% menghasilkan 87,2 jam mati per tahun',
          ],
          [
            'Menulis atribut kualitas sesudah arsitekturnya dipilih',
            'Biar sesuai kenyataan',
            'Ia berubah menjadi pembenaran. Atribut kualitas MENARIK bentuk, bukan menjelaskannya',
          ],
          [
            'Melupakan atribut yang tidak terlihat sebagai fitur',
            'Yang penting fiturnya jalan',
            'Kepatuhan wilayah data, jejak audit, dan jumlah bahasa mengubah arsitektur, bukan menambah layar',
          ],
          [
            'Menetapkan target setinggi mungkin',
            'Lebih tinggi kan lebih baik',
            'Dihitung, 99,99% berarti 4,4 menit per bulan — terlalu singkat untuk ditangani manusia',
          ],
        ],
      ),
      p(
        'Ada satu latihan yang membuat atribut kualitas berhenti menjadi kata sifat, dan ia memakan waktu sepuluh menit. Ambil setiap kalimat kualitas yang pernah ditulis tentang sistemmu, lalu tanyakan bagaimana kamu akan menguji apakah ia terpenuhi. Kalimat yang tidak punya jawaban bukan kebutuhan melainkan harapan, dan tidak ada arsitektur yang bisa dirancang dari harapan.',
      ),
      references(
        {
          label: 'The pillars of the AWS Well-Architected Framework',
          href: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html',
          source: 'Amazon Web Services',
          note: 'Enam pilar yang pada dasarnya adalah daftar atribut kualitas beserta pertanyaan pemeriksanya.',
        },
        {
          label: 'Azure Well-Architected Framework',
          href: 'https://learn.microsoft.com/en-us/azure/well-architected/',
          source: 'Microsoft',
          note: 'Versi Microsoft dengan lima pilar, berguna untuk melihat mana atribut yang benar-benar universal.',
        },
        {
          label: 'Service Level Objectives',
          href: 'https://sre.google/sre-book/service-level-objectives/',
          source: 'Google SRE Book',
          note: 'Cara mengubah atribut yang samar menjadi target yang bisa diperiksa.',
        },
      ),
    ],
  ),

  written(
    'coupling-cohesion',
    'Coupling dan Cohesion',
    22,
    'Dua ukuran yang menjelaskan kenapa satu perubahan kecil bisa merembet ke mana-mana.',
    [
      p(
        'Pernahkah kamu mengubah satu hal kecil, lalu sesuatu yang sama sekali tidak berhubungan ikut rusak. Kamu mengganti nama kolom `nama_depan` menjadi `nama_lengkap` di tabel pengguna, lalu halaman laporan penjualan yang tidak ada hubungannya dengan profil ikut error. Rasanya seperti kode itu punya kabel tersembunyi yang tidak kelihatan sampai salah satunya tertarik.',
      ),
      p(
        'Kabel tersembunyi itu punya nama, yaitu **coupling**. Dan hampir setiap keluhan tentang kode yang sulit diubah, test yang lambat, rilis yang menakutkan, dan tim yang saling menunggu bisa diterjemahkan menjadi satu kalimat yang sama, yaitu terlalu banyak hal yang tahu terlalu banyak tentang hal lain.',
      ),
      p(
        'Coupling punya pasangan yang selalu disebut bersamanya, yaitu **cohesion**. Kalau coupling bicara tentang hubungan **antar** kotak, cohesion bicara tentang isi **di dalam** satu kotak. Keduanya sering dihafalkan sebagai jargon tanpa pernah menjadi alat. Padahal keduanya bisa langsung dipakai untuk menilai sebuah rancangan dalam beberapa menit, dan menjelaskan lebih banyak daripada diagram mana pun.',
      ),
      p(
        'Untuk membuat keduanya menempel, pakai bayangan lemari pakaian. **Cohesion tinggi** berarti tiap laci berisi satu jenis, yaitu laci kaus isinya kaus semua. **Coupling rendah** berarti mengambil kaus tidak memaksa kamu membongkar laci celana. Lemari yang buruk adalah kebalikannya, yaitu tiap laci isinya campur aduk, dan menarik satu barang membuat barang di laci lain ikut jatuh.',
      ),

      terms(
        {
          term: 'coupling (keterikatan)',
          meaning:
            'Seberapa banyak sebuah bagian harus tahu tentang bagian lain agar bisa bekerja. Dibaca "kapling", artinya kurang lebih ikatan atau sambungan. Ukurannya bukan apakah dua bagian saling memanggil, melainkan **seberapa dalam pengetahuannya**. Bandingkan dua baris ini. Baris pertama, `pengguna.ambilNama(id)`, hanya perlu tahu ada fungsi bernama `ambilNama`. Baris kedua, `SELECT nama_depan FROM pengguna WHERE id = $1`, perlu tahu nama tabelnya, nama kolomnya, dan bahwa nama disimpan terpisah depan dan belakang. Baris kedua coupling-nya jauh lebih tinggi, sekalipun sama-sama satu baris.',
        },
        {
          term: 'cohesion (kepaduan)',
          meaning:
            'Seberapa erat isi sebuah bagian saling berhubungan dan bersama-sama melayani satu tujuan. Dibaca "kohisyen", artinya kepaduan atau kelekatan. Modul dengan cohesion tinggi berisi hal-hal yang memang berubah bersamaan, misalnya folder `pembayaran` yang isinya menghitung total, membuat tagihan, dan mencatat pelunasan. Modul dengan cohesion rendah berisi kumpulan hal yang kebetulan ditaruh bersama, misalnya berkas `utils.ts` yang isinya memformat tanggal, menghitung pajak, dan membungkus `fetch`. Ketiganya tidak punya hubungan apa pun selain sama-sama tidak punya tempat lain.',
        },
        {
          term: 'afferent coupling',
          meaning:
            'Jumlah bagian lain yang bergantung **kepada** modul ini, yaitu jumlah panah yang masuk. Dibaca "aferent kapling". Angka tinggi berarti modul ini banyak dipakai, sehingga mengubah permukaannya mahal. Contohnya berkas berisi tipe `Pengguna` yang diimpor tiga puluh berkas lain. Modul seperti ini pantas punya permukaan yang kecil dan sangat jarang berubah, karena setiap perubahannya menagih tiga puluh tempat sekaligus.',
        },
        {
          term: 'efferent coupling',
          meaning:
            'Jumlah bagian lain yang modul ini bergantung **kepadanya**, yaitu jumlah panah yang keluar. Dibaca "eferent kapling". Angka tinggi berarti modul ini rapuh, karena ia bisa rusak gara-gara perubahan di banyak tempat yang tidak ia kendalikan. Contohnya satu berkas rute yang mengimpor dua belas modul berbeda, sehingga perubahan di salah satu dari dua belas itu berpotensi merusaknya. Cara mengingat bedanya, huruf **a** pada afferent seperti **a**suk yaitu panah masuk, huruf **e** pada efferent seperti **e**xit yaitu panah keluar.',
        },
        {
          term: 'temporal coupling',
          meaning:
            'Keterikatan pada urutan waktu, yaitu ketika sesuatu hanya bekerja benar kalau dipanggil setelah sesuatu yang lain. Dibaca "temporal kapling", dari kata temporal yang berarti berkaitan dengan waktu. Bentuk paling menyebalkan dari coupling karena ia tidak terlihat di tanda tangan fungsi mana pun. Contohnya, `siapkanKonteks()` wajib dipanggil sebelum `prosesPesanan()`, tetapi tidak ada apa pun di kedua nama itu yang mengatakan begitu. Orang berikutnya memanggilnya terbalik, kodenya tetap jalan tanpa error, dan hasilnya baru salah di produksi.',
        },
        {
          term: 'content coupling',
          meaning:
            'Bentuk coupling paling parah, yaitu ketika sebuah bagian mengubah atau membaca isi dalam bagian lain secara langsung tanpa lewat permukaan resminya. Dibaca "konten kapling". Contoh yang paling sering terjadi di aplikasi web adalah satu modul menulis langsung ke tabel milik modul lain, misalnya modul pesanan menjalankan `UPDATE saldo SET jumlah = ...` padahal saldo itu milik modul dompet. Akibatnya seluruh aturan yang dijaga modul dompet, misalnya batas minimum dan pencatatan riwayat, terlewati begitu saja tanpa memunculkan error apa pun.',
        },
        {
          term: 'connascence',
          meaning:
            'Istilah untuk hubungan yang membuat dua potong kode harus ikut berubah bersama supaya sistem tetap benar. Dibaca "konesens", dari kata Latin yang berarti lahir bersama. Kegunaannya adalah memberi tingkatan pada coupling, dari yang ringan sampai yang berat. Contoh yang ringan, dua berkas sama-sama memakai nama fungsi `hitungTotal`, sehingga mengganti namanya cukup dilakukan alat rename di editor. Contoh yang berat, dua berkas sama-sama mengandalkan bahwa satu dipanggil sebelum yang lain, dan tidak ada alat mana pun yang bisa menemukannya.',
        },
        {
          term: 'god object',
          meaning:
            'Satu berkas atau satu kelas yang tahu dan mengerjakan terlalu banyak hal sekaligus, biasanya bernama `AppService`, `Manager`, atau `Helper`. Dibaca "god objek", artinya objek dewa, karena ia seolah tahu segalanya dan mengurus segalanya. Ciri khasnya paling mudah dikenali dari riwayat git, yaitu berkas itu muncul di hampir setiap pull request. Akibatnya ia menjadi titik tabrakan setiap kali dua orang bekerja bersamaan, dan tidak ada seorang pun yang berani mengubahnya karena tidak ada yang tahu apa saja yang bergantung padanya.',
        },
      ),

      h2('Ukuran yang benar bukan jumlah panah'),
      p(
        'Kesalahpahaman pertama tentang coupling adalah menganggapnya sebagai jumlah pemanggilan. Kalau begitu ukurannya, jawaban terbaik adalah tidak ada bagian yang memanggil bagian lain, dan itu jelas bukan program.',
      ),
      p(
        'Ukuran yang benar adalah **seberapa dalam pengetahuannya**. Pertanyaannya bukan berapa kali A memanggil B, melainkan berapa banyak hal tentang B yang harus tetap benar supaya A tidak rusak. Dua contoh berikut punya jumlah pemanggilan yang sama dan tingkat coupling yang jauh berbeda.',
      ),
      compare(
        {
          title: 'Coupling tinggi',
          lang: 'ts',
          code: `
            // Modul Pesanan tahu bentuk tabel milik modul Pengguna.
            const baris = await db.query(
              'SELECT nama_depan, nama_belakang, email_utama FROM pengguna WHERE id = $1',
              [idPengguna],
            );

            const namaLengkap = baris[0].nama_depan + ' ' + baris[0].nama_belakang;
          `,
          notes: [
            'Mengganti nama kolom di modul Pengguna merusak modul Pesanan',
            'Menggabungkan dua kolom nama menjadi satu merusak modul Pesanan',
            'Modul Pengguna tidak pernah setuju menjadikan tabelnya kontrak publik',
          ],
        },
        {
          title: 'Coupling rendah',
          lang: 'ts',
          code: `
            // Modul Pesanan hanya tahu satu permukaan dan satu bentuk data.
            const pengguna = await modulPengguna.ambilRingkasan(idPengguna);

            const namaLengkap = pengguna.namaLengkap;
          `,
          notes: [
            'Modul Pengguna bebas mengubah tabelnya kapan saja',
            'Yang harus tetap benar hanya bentuk `RingkasanPengguna`',
            'Perubahan yang merusak menjadi terlihat di satu tempat, bukan tersebar',
          ],
        },
      ),
      p(
        'Kolom kanan tetap memanggil modul lain, dan itu wajar. Yang berubah adalah **apa yang harus tetap benar**. Di kolom kiri, tiga nama kolom database menjadi bagian dari kontrak tanpa pernah diputuskan siapa pun. Di kolom kanan, kontraknya satu bentuk data yang memang sengaja dibuat untuk dipakai orang lain.',
      ),
      callout(
        'tip',
        'Pertanyaan penilai yang cepat',
        'Untuk menilai coupling antara dua bagian, tanyakan **apa saja yang kalau diubah di B akan merusak A**. Kalau daftarnya panjang dan berisi hal-hal yang seharusnya bebas diubah B, coupling-nya terlalu tinggi. Kalau daftarnya pendek dan berisi hal yang memang sengaja dijanjikan B, coupling-nya sehat.',
      ),

      h2('Cohesion, atau kenapa folder utils selalu membengkak'),
      p(
        'Cohesion menjawab pertanyaan yang berbeda, yaitu apakah isi sebuah bagian memang pantas berada bersama. Ukurannya sederhana dan cukup jujur, yaitu **apakah isinya cenderung berubah pada waktu yang sama karena alasan yang sama**.',
      ),
      table(
        ['Bentuk', 'Ciri', 'Contoh', 'Sehat?'],
        [
          [
            'Cohesion fungsional',
            'Semua isinya melayani satu tujuan yang sama',
            'Modul `pembayaran` berisi hitung total, buat tagihan, catat pelunasan',
            'Paling sehat',
          ],
          [
            'Cohesion berdasarkan alur',
            'Isinya berurutan dalam satu proses',
            'Modul `impor-csv` berisi baca berkas, validasi baris, simpan hasil',
            'Sehat',
          ],
          [
            'Cohesion berdasarkan jenis teknis',
            'Isinya sejenis secara teknis tetapi melayani tujuan berbeda',
            'Folder `controllers` berisi seluruh controller dari seluruh fitur',
            'Bisa jalan, tetapi menyembunyikan batas fitur',
          ],
          [
            'Cohesion kebetulan',
            'Isinya tidak berhubungan sama sekali',
            'Berkas `utils.ts` berisi format tanggal, hitung pajak, dan pembungkus fetch',
            'Paling tidak sehat',
          ],
        ],
        'Baris paling bawah selalu terjadi bukan karena kemalasan, melainkan karena tidak ada tempat lain yang terasa cocok.',
      ),
      p(
        'Baris terakhir itu punya gejala yang khas dan mudah dikenali. Berkas `utils.ts` hampir selalu menjadi berkas yang paling sering muncul di konflik merge, karena setiap orang menambahkan sesuatu ke sana. Ia juga berkas yang paling banyak diimpor di seluruh project, sehingga afferent coupling-nya paling tinggi sekaligus isinya paling tidak padu. Kombinasi itu yang membuatnya sulit diubah.',
      ),
      p(
        'Perbaikannya bukan melarang `utils`. Perbaikannya adalah memindahkan setiap isinya ke tempat yang memang memilikinya. Fungsi format tanggal pindah ke modul yang menampilkan tanggal. Fungsi hitung pajak pindah ke modul pembayaran. Pembungkus fetch pindah ke lapisan yang bicara ke luar. Yang tersisa di `utils` biasanya tinggal sedikit sekali dan memang benar-benar umum.',
      ),

      h2('Coupling yang tidak terlihat di kode'),
      p(
        'Dua bentuk coupling paling merepotkan justru tidak muncul sebagai impor apa pun, sehingga tidak bisa ditemukan dengan mencari pemanggil.',
      ),
      steps(
        {
          title: 'Coupling lewat database bersama',
          body: 'Dua modul yang membaca dan menulis tabel yang sama terikat sangat erat meskipun kodenya tidak pernah saling memanggil. Pemilik tabel tidak bisa mengubah bentuknya, tidak bisa mengubah arti sebuah kolom, dan tidak bisa memindahkannya. Ini bentuk content coupling, dan ia yang paling sering menggagalkan pemisahan layanan nanti.',
        },
        {
          title: 'Coupling lewat urutan waktu',
          body: 'Fungsi `siapkanKonteks()` harus dipanggil sebelum `prosesPesanan()`, tetapi tidak ada apa pun di tanda tangan keduanya yang mengatakan begitu. Orang berikutnya memanggil dalam urutan berbeda, dan hasilnya bug yang sulit dijelaskan. Penawarnya adalah membuat ketergantungan itu terlihat, misalnya dengan menjadikan hasil langkah pertama sebagai parameter wajib langkah kedua.',
        },
      ),
      code(
        'ts',
        `
        // Temporal coupling — urutan wajib, tetapi tidak terlihat.
        siapkanKonteks(idPesanan);
        await prosesPesanan(idPesanan);   // diam-diam membaca konteks global

        // Dibuat terlihat — urutan dipaksa oleh tipe, bukan oleh ingatan.
        const konteks = await siapkanKonteks(idPesanan);
        await prosesPesanan(konteks);     // mustahil dipanggil sebelum konteks ada
        `,
        {
          caption: 'Ketergantungan yang dipaksa compiler tidak bisa dilupakan orang berikutnya.',
        },
      ),

      h2('Aturan praktis yang bisa langsung dipakai'),
      p(
        'Ada satu kalimat yang merangkum keduanya dan cukup untuk dipakai sehari-hari, yaitu **rapatkan yang berubah bersama, jauhkan yang tidak**. Dari kalimat itu turun beberapa aturan yang lebih konkret.',
      ),
      ol(
        'Kalau dua hal selalu berubah bersamaan, mereka pantas berada di modul yang sama. Memisahkan keduanya hanya menambah perjalanan tanpa menambah kebebasan.',
        'Kalau satu hal sering berubah sementara tetangganya hampir tidak pernah, keduanya pantas dipisah, karena yang stabil sedang ikut menanggung risiko yang tidak perlu.',
        'Susun folder berdasarkan bagian bisnis lebih dulu, baru berdasarkan jenis teknis di dalamnya. Fitur berubah sebagai satu kesatuan, sedangkan jenis teknis tidak pernah berubah bersamaan.',
        'Setiap modul punya satu pintu masuk resmi. Apa pun yang tidak diekspor dari pintu itu adalah urusan dalam yang bebas diubah kapan saja.',
        'Tabel database dimiliki tepat satu modul. Modul lain meminta lewat pintu resmi pemiliknya, bukan lewat query sendiri.',
      ),
      compare(
        {
          title: 'Disusun berdasarkan jenis teknis',
          lang: 'text',
          code: `
            src/
              controllers/
                pesanan.ts
                pengguna.ts
                pembayaran.ts
              services/
                pesanan.ts
                pengguna.ts
                pembayaran.ts
              repositories/
                pesanan.ts
                pengguna.ts
                pembayaran.ts
          `,
          notes: [
            'Satu perubahan fitur menyentuh tiga folder',
            'Batas antar fitur tidak terlihat sama sekali',
            'Tidak ada tempat alami untuk menaruh aturan bisnis milik satu fitur',
          ],
        },
        {
          title: 'Disusun berdasarkan bagian bisnis',
          lang: 'text',
          code: `
            src/
              pesanan/
                index.ts        <- satu-satunya pintu keluar
                rute.ts
                layanan.ts
                penyimpanan.ts
              pengguna/
                index.ts
                ...
              pembayaran/
                index.ts
                ...
          `,
          notes: [
            'Satu perubahan fitur menyentuh satu folder',
            'Batas terlihat dari struktur, dan bisa ditegakkan aturan impor',
            'Memindahkan satu bagian keluar nanti berarti memindahkan satu folder',
          ],
        },
      ),
      callout(
        'info',
        'Susunan berdasarkan jenis teknis tidak selalu salah',
        'Untuk aplikasi kecil dengan satu bagian bisnis, susunan kiri justru lebih ringan dan tidak menimbulkan masalah. Ia mulai merugikan ketika bagian bisnisnya bertambah, karena sejak itu setiap perubahan tersebar dan tidak ada satu pun tempat yang bisa disebut sebagai pemilik sebuah aturan.',
      ),

      h2('Rangkuman'),
      ul(
        'Coupling diukur dari seberapa dalam sebuah bagian tahu tentang bagian lain, bukan dari jumlah pemanggilan.',
        'Cohesion diukur dari apakah isi sebuah bagian cenderung berubah bersamaan karena alasan yang sama.',
        'Coupling paling berbahaya sering tidak terlihat di kode, yaitu lewat tabel database bersama dan lewat urutan waktu.',
        'Berkas `utils` membengkak karena ia menampung yang tidak punya pemilik, dan itu membuatnya sulit diubah.',
        'Aturan tunggalnya adalah rapatkan yang berubah bersama, jauhkan yang tidak.',
        'Satu modul punya satu pintu masuk resmi, dan satu tabel dimiliki tepat satu modul.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Coupling adalah seberapa banyak satu bagian harus tahu tentang bagian lain, dan cohesion adalah seberapa erat isi satu bagian saling berhubungan. Keduanya sering dijelaskan sebagai rasa, padahal keduanya bisa dihitung.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini, dari seluruh pernyataan
        impornya:

          berkas TypeScript    : 116
          sisi ketergantungan  : 337
          rata-rata per berkas : 2,9 ketergantungan

        FAN-OUT tertinggi (mengimpor paling banyak):
          10  src/content/curriculum/index.ts
           9  src/app/kelas/[category]/[chapter]/page.tsx
           9  src/components/content/block-renderer.tsx

        FAN-IN tertinggi (paling banyak diimpor):
          58  src/lib/curriculum/authoring.ts
          49  src/lib/content/builders.ts
          19  src/lib/curriculum/queries.ts
        `,
        {
          caption:
            'Fan-in tinggi pada berkas kecil yang stabil adalah tanda sehat. Fan-in tinggi pada berkas yang sering berubah adalah masalah.',
        },
      ),
      p(
        'Kalimat pada keterangan itu bisa diperiksa, sebab riwayat git memberi tahu seberapa sering sebuah berkas berubah.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dari riwayat git project ini:

          9x  src/test/curriculum-integrity.test.ts
          6x  src/lib/content/types.ts
          5x  src/content/glossary.ts
          5x  src/content/curriculum/frontend-intermediate/nextjs/lessons.ts
          5x  src/components/layout/sidebar-nav.tsx
          4x  src/lib/curriculum/types.ts
          4x  src/lib/curriculum/authoring.ts

        Dan bandingkan dengan fan-in-nya:
          authoring.ts : fan-in 58, berubah 4 kali
          types.ts     : fan-in tinggi, berubah 6 kali

        Berkas dengan fan-in tinggi YANG SERING BERUBAH adalah
        tempat biaya perubahan berlipat: satu perubahan di sana
        berpotensi menyentuh puluhan berkas.
        `,
      ),
      p(
        'Ada satu ukuran coupling lain yang tidak terlihat dari impor sama sekali, yaitu berkas yang selalu berubah bersamaan.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dari riwayat git project ini:

          3x bersama (50% dari perubahan yang lebih jarang)
              src/lib/content/types.ts
              src/test/curriculum-integrity.test.ts

          3x bersama (60% dari perubahan yang lebih jarang)
              src/content/glossary.ts
              src/test/curriculum-integrity.test.ts

        Dua berkas yang selalu berubah bersamaan punya coupling,
        terlepas dari apakah ada import di antara keduanya.

        Dalam kasus ini coupling-nya WAJAR: test integritas memang
        harus mengikuti bentuk data yang diujinya. Yang perlu dicurigai
        adalah pasangan yang berubah bersamaan TANPA alasan yang jelas.
        `,
        {
          caption:
            'Perubahan bersama sering menunjukkan batas yang salah tempat lebih jelas daripada graf impor.',
        },
      ),
      p(
        'Untuk cohesion, ukuran yang paling berguna adalah apakah isi sebuah modul berubah karena alasan yang sama.',
      ),
      code(
        'text',
        `
        Uji yang cukup andal:
          "Sebutkan satu kalimat yang menjelaskan apa yang dikerjakan
           modul ini, tanpa memakai kata DAN."

          "Menyusun dan memvalidasi blok konten"           -> dua hal
          "Menyusun blok konten"                           -> satu hal

        Modul yang butuh kata DAN untuk dijelaskan biasanya punya
        dua alasan berubah, dan karena itu akan berubah dua kali
        lebih sering daripada seharusnya.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Coupling yang tinggi tidak menghasilkan error. Ia menghasilkan pekerjaan yang terasa jauh lebih berat daripada seharusnya, dan gejalanya bisa diukur.',
      ),
      code(
        'text',
        `
        Gejala coupling yang terlalu tinggi:

          "Menambah satu field menyentuh tujuh berkas"
          "Test modul A merah karena perubahan di modul B"
          "Tidak bisa menguji ini tanpa menyalakan basis data"
          "Setiap perubahan kecil menuntut perubahan di tiga lapisan"

        Yang pertama bisa dihitung: ambil satu perubahan nyata dari
        riwayat git, lalu hitung berkas yang tersentuh.

        Diukur pada project ini, tertutup transitif berkas dengan
        fan-in tertinggi:
          82 dari 116 berkas (71%)

        Artinya perubahan pada BENTUK fungsi di berkas itu berpotensi
        menyentuh 71% codebase — meski perubahan yang bersifat
        MENAMBAH tidak menyentuh satu pun.
        `,
      ),
      p(
        'Bentuk coupling yang paling merusak adalah yang melingkar, dan akibatnya berbeda antar sistem modul.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan Node 26.5.0, dua modul yang saling
        mengimpor.

        CommonJS:
          saat b.cjs dimuat, a.dariA adalah: undefined
          a.pakaiB() -> B
          b.pakaiA() -> TypeError: a.dariA is not a function
          Warning: Accessing non-existent property 'dariA' of module
                   exports inside circular dependency

        ESM, siklus yang SAMA, dengan deklarasi fungsi:
          saat b.mjs dimuat, dariA adalah: function
          pakaiB() -> B
          pakaiA() -> A
          BERHASIL, karena deklarasi fungsi di-hoist dan binding-nya hidup

        ESM, dengan nilai yang dibaca SAAT MODUL DIMUAT:
          ReferenceError: Cannot access 'DARI_C' before initialization
        `,
        {
          caption:
            'ESM menoleransi siklus untuk fungsi, dan TIDAK untuk nilai yang dibaca saat modul dievaluasi.',
        },
      ),
      code(
        'text',
        `
        Dan siklus itu memang ada di project ini, diukur sungguhan:

          src/app/dashboard-client.tsx -> src/app/page.tsx -> ...
          src/app/latihan/latihan-client.tsx -> src/app/latihan/page.tsx -> ...
          src/app/roadmap/page.tsx -> src/app/roadmap/roadmap-client.tsx -> ...

        Ketiganya pasangan halaman server dan komponen klien yang
        saling mengimpor. Bentuk itu lazim di Next.js dan tetap
        merupakan siklus — dan ia tidak menimbulkan masalah di sini
        karena yang diimpor adalah komponen, bukan nilai yang dibaca
        saat modul dievaluasi.

        Yang penting bukan apakah temuan itu harus diperbaiki,
        melainkan bahwa ia terlihat dan bisa diputuskan.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Coupling dan cohesion sering dinilai dari rasa, padahal keduanya punya ukuran yang bisa dijalankan dalam tiga puluh baris kode.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menilai coupling dari struktur direktori',
            'Kelihatan dari susunannya',
            'Diukur, graf impor yang sesungguhnya sering berbeda dari yang terlihat di direktori',
          ],
          [
            'Menganggap fan-in tinggi selalu buruk',
            'Banyak yang bergantung padanya',
            'Fan-in tinggi pada berkas kecil yang STABIL adalah tanda sehat. Yang berbahaya adalah yang sering berubah',
          ],
          [
            'Mengabaikan coupling yang tidak lewat import',
            'Tidak ada import berarti tidak terkait',
            'Diukur dari git, dua berkas berubah bersamaan 60% dari waktunya tanpa satu pun import',
          ],
          [
            'Membiarkan siklus karena "toh jalan"',
            'Tidak ada error',
            'Diuji, di CommonJS ia gagal, dan di ESM ia gagal begitu nilainya dibaca saat modul dimuat',
          ],
          [
            'Memecah modul demi ukuran',
            'Modul kecil kan lebih baik',
            'Kecil tidak sama dengan kohesif. Satu modul panjang yang kohesif lebih baik daripada lima yang dangkal',
          ],
          [
            'Membuat modul yang menjelaskan dirinya dengan kata "dan"',
            'Isinya memang dua hal',
            'Dua alasan berubah berarti ia akan berubah dua kali lebih sering. Pisahkan berdasarkan alasannya',
          ],
        ],
      ),
      p(
        'Ukuran yang paling berguna dari semuanya juga yang paling sederhana, dan ia tidak memerlukan alat sama sekali. Ambil satu perubahan yang baru saja kamu lakukan, hitung berapa berkas yang tersentuh, lalu tanyakan apakah jumlahnya masuk akal untuk perubahan sebesar itu. Bila menambah satu field menyentuh tujuh berkas, batasnya berada di tempat yang salah, dan itu berlaku terlepas dari sekelihatan rapi apa pun strukturnya.',
      ),
      references(
        {
          label: 'Architectural principles',
          href: 'https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles',
          source: 'Microsoft',
          note: 'Separation of concerns, encapsulation, dan dependency inversion dijelaskan sebagai satu rangkaian.',
        },
        {
          label: 'no-restricted-imports',
          href: 'https://eslint.org/docs/latest/rules/no-restricted-imports',
          source: 'ESLint',
          note: 'Cara menegakkan batas modul supaya ia bukan sekadar kesepakatan lisan.',
        },
        {
          label: 'Modules: Packages — subpath exports',
          href: 'https://nodejs.org/api/packages.html',
          source: 'Node.js',
          note: 'Mekanisme resmi Node untuk menentukan apa yang boleh diimpor dari luar sebuah paket.',
        },
      ),
    ],
  ),

  written(
    'lapisan-dan-arah',
    'Lapisan dan Arah Ketergantungan',
    21,
    'Kenapa arah panah antar lapisan lebih menentukan daripada jumlah lapisannya.',
    [
      p(
        'Bayangkan sebuah restoran. Ada pelayan yang menerima pesanan dari tamu, ada juru masak yang memasak, ada gudang yang menyimpan bahan. Pembagian itu masuk akal, dan hampir semua restoran punya pembagian serupa.',
      ),
      p(
        'Sekarang perhatikan **arah perintahnya**. Pelayan menyampaikan pesanan ke juru masak, juru masak mengambil bahan dari gudang. Perintah mengalir satu arah. Kalau suatu hari gudang mulai memanggil pelayan untuk menanyakan tamu meja empat pesan apa, restoran itu mulai kacau, dan kekacauannya bukan karena ada yang malas melainkan karena arah perintahnya berbalik.',
      ),
      p(
        'Hampir semua aplikasi web akhirnya berlapis seperti restoran itu, entah disengaja atau tidak. Ada bagian yang mengurus permintaan masuk, ada bagian yang mengurus aturan bisnis, ada bagian yang mengurus penyimpanan. Sub-bab [arsitektur berlapis](/kelas/backend-intermediate/express-intermediate/arsitektur-berlapis) sudah memperkenalkan bentuknya dari sisi kode Express.',
      ),
      p(
        'Yang belum pernah dibahas dan justru paling menentukan adalah **arah panah** di antara lapisan itu. Dua aplikasi bisa punya nama folder yang persis sama dan berperilaku sangat berbeda, semata karena satu membiarkan panahnya menunjuk ke dua arah dan yang lain tidak. Sub-bab ini tentang arah itu.',
      ),

      terms(
        {
          term: 'layer (lapisan)',
          meaning:
            'Kelompok kode yang punya tanggung jawab sejenis dan menempati satu tingkat yang sama dalam alur permintaan, misalnya lapisan penyajian, lapisan aturan bisnis, dan lapisan akses data. Dibaca "leyer". Kembali ke analogi restoran, lapisan itu pelayan, juru masak, dan gudang. Lapisan adalah cara membagi berdasarkan **jenis pekerjaan**, berbeda dari modul yang membagi berdasarkan **bagian bisnis**. Kalau lapisan itu pelayan dan juru masak, maka modul itu bagian dapur panas dan bagian dapur dingin.',
        },
        {
          term: 'n-tier architecture',
          meaning:
            'Gaya klasik yang membagi aplikasi menjadi beberapa tingkat berlapis, biasanya tiga yaitu presentation, business logic, dan data access. Dibaca "en-tir". Kata tier kadang berarti pemisahan fisik ke mesin berbeda, sedangkan layer berarti pemisahan logis di dalam satu kode. Keduanya sering dipakai bergantian.',
        },
        {
          term: 'dependency (ketergantungan)',
          meaning:
            'Hubungan ketika sebuah bagian membutuhkan bagian lain untuk bekerja, biasanya terlihat sebagai baris impor di bagian atas berkas. Dibaca "dipendensi". Arah ketergantungan adalah arah panah dari yang membutuhkan menuju yang dibutuhkan. Cara membacanya sederhana, kalau berkas A menulis `import { x } from "./b"`, maka A bergantung pada B, dan panahnya menunjuk dari A ke B. Arah inilah yang menentukan siapa bisa rusak gara-gara siapa, yaitu mengubah B berpotensi merusak A, tetapi mengubah A tidak pernah merusak B.',
        },
        {
          term: 'dependency rule (aturan ketergantungan)',
          meaning:
            'Aturan yang menetapkan bahwa ketergantungan hanya boleh mengalir ke satu arah, biasanya dari luar ke dalam atau dari atas ke bawah. Lapisan yang lebih dalam tidak boleh tahu apa pun tentang lapisan yang lebih luar. Wujud konkretnya, berkas `layanan.ts` boleh menulis `import` dari `penyimpanan.ts`, tetapi `penyimpanan.ts` tidak boleh sekali pun menulis `import` dari `layanan.ts`. Aturan sesederhana ini yang membuat lapisan benar-benar berguna, bukan sekadar nama folder yang kelihatan rapi.',
        },
        {
          term: 'domain (domain)',
          meaning:
            'Bagian kode yang berisi aturan bisnis inti, yaitu hal-hal yang tetap benar terlepas dari apakah aplikasinya berupa web, aplikasi terminal, atau job terjadwal. Dibaca "domein". Cara menguji apakah sesuatu termasuk domain, tanyakan apakah aturan ini tetap berlaku seandainya aplikasinya diganti menjadi program yang dijalankan dari terminal tanpa halaman web sama sekali. Aturan "pesanan yang sudah dibayar tidak bisa dibatalkan pembeli" tetap berlaku, jadi ia domain. Aturan "kalau gagal kembalikan status 409" tidak berlaku di terminal, jadi ia bukan domain.',
        },
        {
          term: 'infrastructure (infrastruktur)',
          meaning:
            'Bagian kode yang bicara dengan dunia luar, yaitu database, jaringan, berkas, antrean, layanan pihak ketiga. Dibaca "infrastraktur". Ciri khasnya adalah ia berisi detail teknologi yang bisa diganti tanpa mengubah arti bisnisnya, misalnya berganti dari PostgreSQL ke MySQL. Cara mengenalinya cepat, kalau sebuah berkas mengimpor sesuatu yang namanya merek teknologi, misalnya `@prisma/client`, `ioredis`, atau `nodemailer`, berkas itu berada di lapisan infrastruktur.',
        },
        {
          term: 'leaky abstraction',
          meaning:
            'Permukaan yang seharusnya menyembunyikan detail, tetapi detail itu tetap bocor keluar sehingga pemakainya tetap harus tahu. Dibaca "liki abstraksyen", artinya abstraksi yang bocor. Analoginya seperti stopkontak yang kabelnya menjulur keluar, yaitu tujuannya menyembunyikan kabel tetapi kabelnya tetap kelihatan dan tetap harus kamu urus. Contoh yang sering terjadi adalah fungsi penyimpanan yang mengembalikan objek hasil ORM apa adanya, sehingga seluruh aplikasi jadi tahu ORM apa yang dipakai, dan menggantinya berarti menyentuh semuanya.',
        },
        {
          term: 'circular dependency (ketergantungan melingkar)',
          meaning:
            'Keadaan ketika A butuh B dan B juga butuh A, baik langsung maupun lewat perantara seperti A butuh B, B butuh C, dan C butuh A lagi. Dibaca "sirkular dipendensi". Selain menyebabkan masalah teknis saat memuat modul, misalnya nilai yang tiba-tiba `undefined` tanpa sebab yang jelas, ia menandakan batas yang salah. Dua bagian yang saling membutuhkan sebenarnya satu bagian yang belum diakui sebagai satu, dan jalan keluarnya biasanya menggabungkan keduanya atau menarik bagian yang dipakai bersama menjadi bagian ketiga.',
        },
      ),

      h2('Lapisan dan modul bukan hal yang sama'),
      p(
        'Sebelum bicara arah, satu kebingungan perlu dibereskan. Lapisan membagi berdasarkan **jenis pekerjaan**, sedangkan modul membagi berdasarkan **bagian bisnis**. Keduanya bisa hidup bersama dan memang sebaiknya begitu.',
      ),
      code(
        'text',
        `
        src/
          pesanan/                 <- modul, dibagi menurut bisnis
            rute.ts                <- lapisan penyajian
            layanan.ts             <- lapisan aturan bisnis
            penyimpanan.ts         <- lapisan akses data
            index.ts               <- pintu masuk resmi modul
          pembayaran/
            rute.ts
            layanan.ts
            penyimpanan.ts
            index.ts
          bersama/
            db.ts                  <- infrastruktur yang memang dipakai semua modul
        `,
        {
          caption:
            'Modul di tingkat pertama, lapisan di dalamnya. Perubahan satu fitur tetap menyentuh satu folder.',
        },
      ),
      p(
        'Susunan seperti ini menjawab keluhan yang muncul di sub-bab sebelumnya. Perubahan fitur pesanan menyentuh folder `pesanan` saja, sementara di dalam folder itu tanggung jawab tetap terpisah rapi. Kamu mendapat keuntungan lapisan tanpa membayar tersebarnya perubahan ke tiga folder berbeda.',
      ),

      h2('Aturan arah, dan kenapa ia yang menentukan'),
      p(
        'Inti dari lapisan bukan jumlahnya, melainkan satu aturan yang harus dipegang tanpa kecuali, yaitu **ketergantungan hanya mengalir satu arah**. Lapisan penyajian boleh tahu tentang lapisan aturan bisnis. Lapisan aturan bisnis tidak boleh tahu apa pun tentang lapisan penyajian.',
      ),
      table(
        ['Dari', 'Ke', 'Boleh?', 'Kenapa'],
        [
          [
            'Rute HTTP',
            'Layanan bisnis',
            'Boleh',
            'Inilah arah alaminya. Pintu masuk memanggil aturan',
          ],
          [
            'Layanan bisnis',
            'Penyimpanan',
            'Boleh, lewat interface',
            'Aturan butuh data, tetapi tidak perlu tahu data itu datang dari mana',
          ],
          [
            'Layanan bisnis',
            'Objek `req` dan `res` milik Express',
            'Tidak boleh',
            'Aturan bisnis menjadi mustahil dipakai dari job antrean, dari CLI, atau dari test tanpa server',
          ],
          [
            'Penyimpanan',
            'Layanan bisnis',
            'Tidak boleh',
            'Membuat lingkaran. Kalau penyimpanan butuh aturan, aturannya salah tempat',
          ],
          [
            'Modul Pesanan',
            'Pintu masuk modul Pembayaran',
            'Boleh',
            'Antar modul lewat permukaan resmi adalah cara yang benar',
          ],
          [
            'Modul Pesanan',
            'Berkas dalam modul Pembayaran',
            'Tidak boleh',
            'Melewati pintu resmi berarti mengikat diri pada isi yang seharusnya bebas berubah',
          ],
        ],
        'Empat baris bertanda tidak boleh adalah pelanggaran yang paling sering terjadi dan paling mahal akibatnya.',
      ),
      p(
        'Baris ketiga layak dibahas lebih lama karena akibatnya paling sering diremehkan. Begitu lapisan aturan bisnis menyentuh `req` dan `res`, aturan itu terkunci pada satu cara pemanggilan. Kamu tidak bisa memakainya dari job BullMQ yang dibahas di sub-bab [antrean](/kelas/backend-intermediate/express-intermediate/queue-bullmq), tidak bisa memakainya dari perintah artisan, dan tidak bisa mengujinya tanpa membuat permintaan HTTP palsu.',
      ),
      compare(
        {
          title: 'Aturan bisnis terkunci pada HTTP',
          lang: 'ts',
          code: `
            export async function batalkanPesanan(req: Request, res: Response) {
              const pesanan = await db.pesanan.findUnique({
                where: { id: req.params.id },
              });

              if (!pesanan) {
                return res.status(404).json({ pesan: 'Tidak ditemukan' });
              }
              if (pesanan.status === 'dibayar') {
                return res.status(409).json({ pesan: 'Sudah dibayar' });
              }

              await db.pesanan.update({
                where: { id: pesanan.id },
                data: { status: 'dibatalkan' },
              });

              return res.json({ ok: true });
            }
          `,
          notes: [
            'Aturan "pesanan yang sudah dibayar tidak bisa dibatalkan" terkubur di antara kode HTTP',
            'Mustahil dipanggil dari job antrean atau dari perintah terminal',
            'Diuji hanya dengan menjalankan server dan mengirim permintaan sungguhan',
          ],
        },
        {
          title: 'Aturan bisnis berdiri sendiri',
          lang: 'ts',
          code: `
            // layanan.ts — tidak tahu apa pun tentang HTTP
            export async function batalkanPesanan(
              idPesanan: string,
              penyimpanan: PenyimpananPesanan,
            ): Promise<HasilPembatalan> {
              const pesanan = await penyimpanan.cari(idPesanan);

              if (!pesanan) return { jenis: 'tidak-ditemukan' };
              if (pesanan.status === 'dibayar') return { jenis: 'sudah-dibayar' };

              await penyimpanan.simpanStatus(pesanan.id, 'dibatalkan');
              return { jenis: 'berhasil' };
            }
          `,
          notes: [
            'Aturannya terbaca sebagai kalimat, bukan sebagai kode jaringan',
            'Bisa dipanggil dari rute HTTP, job antrean, atau perintah terminal',
            'Diuji dengan memanggil fungsi dan memberi penyimpanan tiruan',
          ],
        },
      ),
      p(
        'Kolom kanan memindahkan penerjemahan hasil menjadi kode status HTTP ke lapisan rute, tempatnya memang di sana. Rute membaca `hasil.jenis` lalu memilih 404, 409, atau 200. Aturan bisnisnya sendiri tidak pernah tahu bahwa HTTP ada.',
      ),

      h2('Lapisan yang bocor'),
      p(
        'Lapisan yang benar arahnya masih bisa gagal kalau permukaannya bocor. Bentuk kebocoran yang paling sering terjadi ada tiga, dan ketiganya terlihat tidak berbahaya saat ditulis.',
      ),
      steps(
        {
          title: 'Mengembalikan objek ORM apa adanya',
          body: 'Fungsi penyimpanan mengembalikan hasil Prisma atau Eloquent langsung. Sejak itu, seluruh lapisan di atasnya memakai method dan properti khas ORM tersebut, sehingga menggantinya berarti menyentuh seluruh aplikasi. Penawarnya adalah mengembalikan bentuk data milik domain, bukan bentuk milik ORM.',
        },
        {
          title: 'Menerima objek permintaan mentah',
          body: 'Layanan menerima `req.body` apa adanya lalu memilih sendiri field yang dipakai. Selain bentuk coupling, ini juga celah mass assignment yang dibahas di sub-bab [validasi input](/kelas/keamanan-fullstack/data-rahasia-jejak/validasi-input). Penawarnya adalah memvalidasi di gerbang lalu meneruskan bentuk yang sudah pasti.',
        },
        {
          title: 'Membocorkan error teknologi ke atas',
          body: 'Error unik dari driver database naik sampai ke rute lalu dikirim ke klien apa adanya. Pemanggil jadi harus mengenali kode error milik PostgreSQL, dan pesan internal ikut bocor. Penawarnya adalah menerjemahkan error teknis menjadi hasil bermakna di batas lapisan penyimpanan.',
        },
      ),
      code(
        'ts',
        `
        // Penyimpanan menerjemahkan error teknis menjadi hasil yang bermakna bagi domain.
        export async function simpanEmailBaru(
          idPengguna: string,
          email: string,
        ): Promise<{ jenis: 'berhasil' } | { jenis: 'email-sudah-dipakai' }> {
          try {
            await db.pengguna.update({ where: { id: idPengguna }, data: { email } });
            return { jenis: 'berhasil' };
          } catch (galat) {
            // P2002 adalah kode Prisma untuk pelanggaran unique constraint.
            // Kode ini berhenti di sini dan tidak pernah naik ke lapisan atas.
            if (isKodePrisma(galat, 'P2002')) return { jenis: 'email-sudah-dipakai' };
            throw galat;
          }
        }
        `,
        {
          filename: 'src/pengguna/penyimpanan.ts',
          caption:
            'Pengetahuan tentang kode error Prisma berhenti di satu berkas, bukan menyebar ke seluruh aplikasi.',
        },
      ),
      callout(
        'warning',
        'Jangan menelan error yang tidak dikenali',
        'Perhatikan baris `throw galat` di akhir. Hanya kegagalan yang memang sudah diperkirakan yang diterjemahkan menjadi hasil. Sisanya tetap dilempar supaya terlihat, tercatat, dan bisa diselidiki. Menangkap semua error lalu mengembalikan hasil yang seolah normal mengubah kegagalan keras menjadi data yang salah diam-diam.',
      ),

      h2('Berapa lapisan yang pantas'),
      p(
        'Pertanyaan berapa lapisan hampir selalu dijawab keliru dengan angka. Jawaban yang lebih berguna adalah **sebanyak yang punya alasan berbeda untuk berubah**, dan untuk aplikasi web biasa angkanya kecil.',
      ),
      table(
        ['Jumlah lapisan', 'Cocok untuk', 'Risiko'],
        [
          [
            'Dua, yaitu rute dan penyimpanan',
            'Aplikasi CRUD yang aturannya nyaris tidak ada',
            'Begitu aturan bisnis muncul, ia menumpuk di rute dan sulit dipakai ulang',
          ],
          [
            'Tiga, yaitu rute, layanan, penyimpanan',
            'Sebagian besar aplikasi web',
            'Nyaris tidak ada. Ini titik keseimbangan yang wajar',
          ],
          [
            'Empat atau lebih dengan pemetaan di tiap batas',
            'Aturan bisnis yang rumit dan berumur panjang',
            'Banyak berkas yang isinya menyalin data dari satu bentuk ke bentuk hampir sama',
          ],
        ],
        'Lapisan yang tidak punya alasan berbeda untuk berubah hanya menambah perjalanan tanpa menambah kebebasan.',
      ),
      p(
        'Uji sederhananya begini. Untuk setiap lapisan tanyakan **apa yang bisa berubah di sini tanpa memaksa lapisan lain ikut berubah**. Kalau jawabannya kosong, lapisan itu tidak memberi kebebasan apa pun dan hanya menambah satu berkas yang harus dibuka.',
      ),

      h2('Menegakkan arah, bukan sekadar menyepakatinya'),
      p(
        'Aturan arah yang hanya hidup sebagai kesepakatan lisan akan dilanggar, bukan karena ada yang jahat melainkan karena tenggat. Karena itu ia pantas ditegakkan alat, dan penegakannya jauh lebih murah daripada yang biasa dibayangkan.',
      ),
      code(
        'js',
        `
        // eslint.config.mjs
        export default [
          {
            files: ['src/*/layanan.ts'],
            rules: {
              'no-restricted-imports': [
                'error',
                {
                  paths: [
                    { name: 'express', message: 'Lapisan layanan tidak boleh tahu HTTP.' },
                    { name: '@prisma/client', message: 'Lewat interface penyimpanan.' },
                  ],
                  patterns: [
                    {
                      group: ['../*/penyimpanan', '../*/rute'],
                      message: 'Antar modul hanya lewat index.ts.',
                    },
                  ],
                },
              ],
            },
          },
        ];
        `,
        {
          filename: 'eslint.config.mjs',
          caption:
            'Batas yang dijaga linter akan gagal di CI, bukan ditemukan enam bulan kemudian saat sudah terlanjur menyebar.',
        },
      ),
      p(
        'Cara ini punya sifat yang enak. Pelanggaran pertama langsung terlihat, saat memperbaikinya masih semudah memindahkan satu impor. Tanpa penegakan, pelanggaran pertama tidak terlihat, pelanggaran kedua puluh baru terasa, dan saat itu memperbaikinya sudah menjadi project tersendiri.',
      ),

      h2('Rangkuman'),
      ul(
        'Lapisan membagi menurut jenis pekerjaan, modul membagi menurut bagian bisnis. Keduanya dipakai bersama.',
        'Yang membuat lapisan berguna bukan jumlahnya, melainkan aturan bahwa ketergantungan mengalir satu arah.',
        'Aturan bisnis yang menyentuh `req` dan `res` terkunci pada HTTP dan tidak bisa dipakai dari antrean atau terminal.',
        'Lapisan bisa bocor lewat objek ORM yang diteruskan, `req.body` mentah yang diterima, dan error teknologi yang naik ke atas.',
        'Tiga lapisan cukup untuk sebagian besar aplikasi web. Lapisan tanpa alasan berbeda untuk berubah hanya menambah perjalanan.',
        'Aturan arah pantas ditegakkan linter, karena kesepakatan lisan selalu kalah oleh tenggat.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Lapisan hanya berguna bila arah ketergantungannya ditegakkan. Tanpa penegakan, yang tersisa hanyalah nama direktori yang terlihat rapi.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini, seluruh sisi ketergantungan
        dikelompokkan per lapisan:

          110  content -> lib
           58  content -> content
           40  app     -> lib
           36  app     -> components
           32  components -> lib
           22  components -> components
           14  lib     -> lib
           10  test    -> lib
            9  app     -> app
            2  app     -> content
            2  test    -> content
            1  lib     -> content        <- MELAWAN ARAH
            1  test    -> components
        `,
        { caption: 'Dua belas baris pertama mengikuti arah yang diharapkan. Satu baris tidak.' },
      ),
      p(
        'Satu sisi yang melawan arah itu bisa ditemukan tepat berkasnya, dan itulah nilai mengukur alih-alih menebak.',
      ),
      code(
        'text',
        `
        Diukur sungguhan:

          src/lib/curriculum/queries.ts  ->  src/content/curriculum/index.ts

        Lapisan lib, yang seharusnya tidak tahu apa pun tentang isi
        kurikulum, mengimpor langsung dari lapisan content.

        Akibatnya:
          - queries.ts tidak bisa diuji tanpa memuat SELURUH kurikulum
          - menambah kategori baru berpotensi menyentuh queries.ts
          - lib tidak lagi bisa dipakai ulang di konteks lain

        Dan dua sisi lain yang MELEWATI lapisan:
          src/app/cheatsheet/page.tsx        -> src/content/cheatsheets.ts
          src/app/glosarium/glosarium-client.tsx -> src/content/glossary.ts
        `,
      ),
      p(
        'Perlu dinyatakan dengan jujur bahwa ketiga temuan itu belum tentu salah. Yang penting adalah bahwa ketiganya kini **terlihat** dan bisa diputuskan, alih-alih menyelinap masuk tanpa ada yang menyadarinya.',
      ),
      code(
        'text',
        `
        Aturan arah yang lazim, dari luar ke dalam:

          app        boleh bergantung pada semuanya
          components boleh bergantung pada lib
          content    boleh bergantung pada lib
          lib        TIDAK boleh bergantung pada app, components,
                     atau content

        Alasannya bukan estetika. Lapisan paling dalam adalah yang
        paling banyak dipakai, dan karena itu paling mahal diubah.

        Diukur pada project ini:
          src/lib/curriculum/authoring.ts -> 82 dari 116 berkas (71%)
          bergantung padanya secara transitif
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pelanggaran arah tidak menghasilkan error kompilasi. Gejalanya muncul sebagai pekerjaan yang terasa berat di tempat yang tidak terduga.',
      ),
      code(
        'text',
        `
        Gejala bahwa arahnya terbalik:

          "Tidak bisa menguji modul ini tanpa menyalakan basis data"
            -> lapisan dalam bergantung pada lapisan luar

          "Menambah satu halaman menyentuh lapisan domain"
            -> arah ketergantungannya dari dalam ke luar

          "Kami tidak bisa memakai modul ini di project lain"
            -> ia membawa serta seluruh lapisan di atasnya

          "Import ini menyebabkan siklus"
            -> arahnya sudah terbalik di suatu tempat
        `,
      ),
      p(
        'Siklus adalah bentuk pelanggaran arah yang paling langsung, dan akibatnya berbeda antar sistem modul.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan Node 26.5.0:

        CommonJS, dua modul yang saling mengimpor:
          saat b.cjs dimuat, a.dariA adalah: undefined
          b.pakaiA() -> TypeError: a.dariA is not a function
          Warning: Accessing non-existent property 'dariA' of module
                   exports inside circular dependency

        ESM, siklus yang SAMA, memakai deklarasi fungsi:
          pakaiA() -> A      BERHASIL

        ESM, dengan nilai yang dibaca SAAT MODUL DIMUAT:
          ReferenceError: Cannot access 'DARI_C' before initialization

        Kesimpulan yang tepat: ESM menoleransi siklus untuk FUNGSI
        yang di-hoist, dan tidak untuk NILAI yang dibaca saat modul
        dievaluasi. Siklus yang "aman hari ini" bisa menjadi
        ReferenceError begitu ada yang menambahkan satu konstanta.
        `,
        {
          caption:
            'Itulah kenapa siklus tetap dilarang meski kebetulan tidak menimbulkan masalah sekarang.',
        },
      ),
      code(
        'text',
        `
        Dan siklus itu memang ada di project ini, diukur sungguhan:

          src/app/dashboard-client.tsx -> src/app/page.tsx -> ...
          src/app/latihan/latihan-client.tsx -> src/app/latihan/page.tsx -> ...
          src/app/roadmap/page.tsx -> src/app/roadmap/roadmap-client.tsx -> ...

        Ketiganya pasangan halaman server dan komponen klien yang
        saling mengimpor, bentuk yang lazim di Next.js. Ia tidak
        menimbulkan masalah karena yang diimpor adalah komponen,
        bukan nilai yang dibaca saat modul dievaluasi.

        Yang ditunjukkan pengukuran bukan bahwa ketiganya harus
        diperbaiki, melainkan bahwa keputusannya sekarang bisa
        diambil dengan sadar.
        `,
      ),
      p(
        'Kesalahan terakhir bersifat penegakan, yaitu aturan arah yang hanya hidup di kepala orang.',
      ),
      code(
        'text',
        `
        Aturan yang tidak dijalankan mesin akan menyimpang, dan
        penyimpangannya baru terlihat secara kebetulan.

        Diukur pada project ini, fitness function yang dijalankan
        terhadap graf impornya:

          GAGAL  lib tidak boleh bergantung pada content (1)
          LULUS  components tidak boleh bergantung pada app
          LULUS  content tidak boleh bergantung pada components
          GAGAL  tidak ada siklus ketergantungan (3)
          LULUS  tidak ada berkas di atas 400 KB

        Lima aturan, tiga puluh baris kode, dan hasilnya langsung
        bisa ditindaklanjuti.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p('Lapisan mudah dibuat sebagai direktori dan sulit dijaga sebagai aturan.'),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat direktori berlapis tanpa menegakkan arahnya',
            'Strukturnya sudah rapi',
            'Diukur, satu sisi `lib -> content` menyelinap masuk tanpa ada yang menyadarinya',
          ],
          [
            'Mengizinkan lapisan dalam mengimpor lapisan luar "sekali ini saja"',
            'Cuma satu tempat',
            'Lapisan dalam kehilangan kemampuan diuji sendiri, dan pengecualian berikutnya jadi lebih mudah',
          ],
          [
            'Membiarkan siklus karena tidak menimbulkan error',
            'Toh jalan',
            'Diuji, ESM menoleransi siklus untuk fungsi dan gagal untuk nilai. Satu konstanta baru sudah cukup',
          ],
          [
            'Melewati lapisan tengah untuk mempercepat',
            'Lebih langsung',
            'Diukur, dua sisi `app -> content` melewati `lib`. Perubahan di `content` kini menyentuh `app` langsung',
          ],
          [
            'Menegakkan aturan lewat review manusia',
            'Reviewer-nya teliti',
            'Aturan yang tidak dijalankan mesin akan menyimpang, dan penyimpangannya ditemukan secara kebetulan',
          ],
          [
            'Membuat terlalu banyak lapisan',
            'Lebih terpisah lebih baik',
            'Setiap lapisan menambah tempat yang harus dilewati. Tiga lapisan yang ditegakkan lebih baik daripada enam yang tidak',
          ],
        ],
      ),
      p(
        'Yang membuat lapisan bekerja bukan jumlahnya melainkan apakah arahnya benar-benar dijaga oleh sesuatu yang berjalan otomatis. Tiga puluh baris skrip yang menelusuri seluruh impor dan memeriksa arahnya sudah cukup, dan hasilnya pada project ini menemukan satu pelanggaran arah dan tiga siklus yang tidak ada di dokumen mana pun.',
      ),
      references(
        {
          label: 'N-tier architecture style',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/n-tier',
          source: 'Microsoft',
          note: 'Bentuk klasik berlapis beserta kapan ia masih pilihan yang tepat.',
        },
        {
          label: 'Common web application architectures',
          href: 'https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures',
          source: 'Microsoft',
          note: 'Perbandingan susunan berlapis tradisional dengan susunan yang aturan arahnya dibalik.',
        },
        {
          label: 'Cloud design patterns',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/',
          source: 'Microsoft',
          note: 'Katalog pola yang beberapa di antaranya khusus menjaga batas antar lapisan tetap bersih.',
        },
      ),
    ],
  ),

  written(
    'membalik-ketergantungan',
    'Membalik Ketergantungan lewat Interface',
    21,
    'Cara membuat aturan bisnis berhenti bergantung pada database dan mulai dilayani olehnya.',
    [
      p(
        'Sub-bab sebelumnya menutup dengan aturan arah, dan menyisakan satu pertanyaan yang wajar. Aturan bisnis jelas membutuhkan data, dan data ada di database. Kalau aturan bisnis tidak boleh tahu tentang teknologi penyimpanan, lalu bagaimana ia mengambil datanya.',
      ),
      p(
        'Jawabannya paling mudah dipahami lewat colokan listrik. Kipas angin butuh listrik, tetapi kipas angin tidak tahu apa-apa tentang PLN, tentang panel surya, atau tentang genset. Yang ia tahu hanya satu, yaitu ada lubang colokan dengan bentuk tertentu, dan kalau stekernya masuk ke situ maka listriknya mengalir.',
      ),
      p(
        'Perhatikan siapa yang menentukan bentuk lubangnya. **Bukan PLN.** Bentuk colokan sudah ditetapkan sebagai standar, lalu PLN, panel surya, dan genset semuanya menyesuaikan diri dengan standar itu. Kipas angin tinggal mencolok, dan sumber listriknya bisa diganti kapan saja tanpa kipasnya diubah sedikit pun.',
      ),
      p(
        'Teknik yang akan dibahas di sub-bab ini persis begitu. Namanya terdengar jauh lebih rumit daripada praktiknya, yaitu **membalik arah ketergantungan**. Aturan bisnis berperan sebagai kipas angin yang menetapkan bentuk colokannya, dan database berperan sebagai sumber listrik yang harus menyesuaikan diri. Idenya satu kalimat, yaitu alih-alih aturan bisnis bergantung pada database, keduanya sama-sama bergantung pada sebuah kesepakatan bentuk yang **dimiliki oleh aturan bisnis**.',
      ),

      terms(
        {
          term: 'dependency inversion (pembalikan ketergantungan)',
          meaning:
            'Prinsip yang menyatakan bagian penting tidak boleh bergantung pada bagian detail. Keduanya bergantung pada sebuah kesepakatan bentuk, dan kesepakatan itu dimiliki bagian yang penting. Disingkat DIP, dibaca "dipendensi inversyen". Kata "inversi" atau pembalikan mengacu pada arah panahnya, yaitu tadinya aturan bisnis menunjuk ke database, sesudah dibalik justru database yang menunjuk ke aturan bisnis. Dalam analogi colokan listrik, inilah bagian ketika bentuk lubang ditetapkan oleh pemakai listrik, bukan oleh pembangkitnya.',
        },
        {
          term: 'interface',
          meaning:
            'Daftar kemampuan yang dijanjikan tanpa menyebutkan cara memenuhinya, misalnya "ada fungsi `cari(id)` yang mengembalikan sebuah Pesanan atau null". Dibaca "interfeis". Inilah bentuk lubang colokan dalam bentuk kode, yaitu ia menyatakan bentuk sambungannya tanpa menyatakan siapa yang akan mengisinya. Di TypeScript ia ditulis dengan kata kunci `interface` atau `type`. Satu hal yang sering mengagetkan pemula, interface **hilang sepenuhnya** saat kode dijalankan, karena ia hanya kesepakatan yang diperiksa saat compile dan tidak menghasilkan satu baris JavaScript pun.',
        },
        {
          term: 'port',
          meaning:
            'Nama lain untuk interface yang dimiliki domain dan menjadi lubang tempat dunia luar menyambung. Dibaca "port". Istilah ini datang dari gaya hexagonal architecture yang dibahas di Bab 2, dan namanya memang diambil dari lubang colokan. Port menjawab pertanyaan "apa yang dibutuhkan domain", bukan "bagaimana kebutuhan itu dipenuhi". Contohnya `interface PenyimpananPesanan` adalah port, karena ia menyatakan domain butuh cara mencari dan menyimpan pesanan, tanpa menyebut PostgreSQL sekali pun.',
        },
        {
          term: 'adapter',
          meaning:
            'Kode yang memenuhi sebuah port dengan teknologi tertentu, misalnya adapter PostgreSQL untuk port penyimpanan pesanan. Dibaca "adapter". Ini stekernya, yaitu benda yang bentuknya menyesuaikan lubang lalu menyambungkannya ke sumber yang sesungguhnya. Adapter adalah tempat sah satu-satunya bagi detail teknologi, sehingga hanya berkas adapter yang boleh mengimpor `@prisma/client`. Mengganti teknologi berarti menulis adapter baru tanpa menyentuh satu baris pun di domain.',
        },
        {
          term: 'dependency injection (penyuntikan ketergantungan)',
          meaning:
            'Cara memberikan ketergantungan dari luar alih-alih membuatnya sendiri di dalam. Disingkat DI, dibaca "dipendensi injeksyen". Namanya terdengar berat, padahal bentuk paling sederhananya bukan library apa pun melainkan sekadar **parameter fungsi**. Bandingkan dua baris ini. Tanpa DI, `function buatLayanan() { const db = new PrismaClient(); ... }`, yaitu fungsi itu membuat sendiri ketergantungannya sehingga tidak bisa diganti. Dengan DI, `function buatLayanan(penyimpanan) { ... }`, yaitu ketergantungannya diserahkan dari luar sehingga saat pengujian kamu bisa menyerahkan yang palsu.',
        },
        {
          term: 'composition root',
          meaning:
            'Satu tempat di ujung aplikasi tempat semua bagian nyata dirakit menjadi satu, biasanya berkas yang menyalakan server seperti `server.ts` atau `main.ts`. Dibaca "komposisyen rut", artinya akar perakitan. Inilah satu-satunya tempat yang boleh tahu semua teknologi sekaligus, dan karena itu ia juga satu-satunya tempat yang harus diubah saat sebuah teknologi diganti. Dalam analogi colokan, ini momen ketika seseorang benar-benar mencolokkan steker ke lubangnya.',
        },
        {
          term: 'test double',
          meaning:
            'Pengganti sebuah ketergantungan saat pengujian, misalnya penyimpanan tiruan yang menyimpan data di memori alih-alih di PostgreSQL. Dibaca "test dabel", istilahnya diambil dari kata stunt double yaitu pemeran pengganti di film. Kemudahan membuat test double adalah penanda paling jujur bahwa pembalikan ketergantungan sudah berhasil, karena ia hanya mudah kalau ketergantungannya memang datang dari luar lewat parameter.',
        },
        {
          term: 'anti-corruption layer',
          meaning:
            'Lapisan penerjemah di batas dengan sistem luar yang bentuk datanya tidak kamu kendalikan, misalnya API pihak ketiga atau sistem lama. Diterjemahkan bebas menjadi lapisan penangkal pencemaran. Fungsinya menjaga istilah dan bentuk data asing tidak merembes masuk ke dalam domain. Contohnya, API ekspedisi mengembalikan field bernama `cust_nm` dan `dest_zip`. Tanpa lapisan ini, nama aneh itu ikut menyebar ke seluruh aplikasimu. Dengan lapisan ini, ia berhenti di satu berkas dan diterjemahkan menjadi `namaPenerima` dan `kodePos`. Sering disingkat ACL, dan berbeda dari ACL yang berarti daftar hak akses.',
        },
      ),

      h2('Masalahnya, digambar dulu'),
      p(
        'Susunan berlapis yang paling umum punya panah yang semuanya menunjuk ke bawah, dan di dasarnya ada database. Akibatnya bagian paling penting yaitu aturan bisnis berada paling dekat dengan bagian yang paling sering ingin diganti.',
      ),
      code(
        'text',
        `
        Sebelum dibalik                    Sesudah dibalik

        Rute HTTP                          Rute HTTP
            |                                  |
            v                                  v
        Layanan bisnis                     Layanan bisnis
            |                                  |
            v                             (punya) PenyimpananPesanan   <-- interface
        Prisma / SQL                                  ^
            |                                         |  (memenuhi)
            v                                  PenyimpananPrisma
        PostgreSQL                                    |
                                                      v
                                                  PostgreSQL

        Panah bawah = "harus tahu tentang"
        `,
        {
          caption:
            'Yang berubah hanya arah satu panah, dan perubahan itu yang memindahkan kepemilikan kesepakatan.',
        },
      ),
      p(
        'Di kolom kanan, `PenyimpananPesanan` **dimiliki oleh layanan bisnis**, bukan oleh lapisan database. Layanan bisnis yang menentukan bentuk apa yang ia butuhkan, dan lapisan database yang harus menyesuaikan diri. Itulah arti kata membalik di nama tekniknya.',
      ),

      h2('Wujud konkretnya di TypeScript'),
      p(
        'Prakteknya jauh lebih sederhana daripada namanya. Yang dibutuhkan hanya tiga berkas, dan tidak satu pun memerlukan library tambahan.',
      ),
      code(
        'ts',
        `
        // 1. Bentuk data milik domain. Bukan bentuk milik Prisma, bukan bentuk milik tabel.
        export type Pesanan = {
          id: string;
          idPembeli: string;
          totalRupiah: number;
          status: 'baru' | 'dibayar' | 'dibatalkan';
        };

        // 2. Port. Domain menyatakan apa yang ia butuhkan, bukan bagaimana memenuhinya.
        export interface PenyimpananPesanan {
          cari(id: string): Promise<Pesanan | null>;
          simpanStatus(id: string, status: Pesanan['status']): Promise<void>;
        }
        `,
        {
          filename: 'src/pesanan/domain.ts',
          caption:
            'Berkas ini tidak mengimpor apa pun. Itulah tandanya ia benar-benar berada di lapisan paling dalam.',
        },
      ),
      code(
        'ts',
        `
        import type { PenyimpananPesanan } from './domain';

        export type HasilPembatalan =
          | { jenis: 'berhasil' }
          | { jenis: 'tidak-ditemukan' }
          | { jenis: 'sudah-dibayar' };

        export function buatLayananPesanan(penyimpanan: PenyimpananPesanan) {
          return {
            async batalkan(idPesanan: string): Promise<HasilPembatalan> {
              const pesanan = await penyimpanan.cari(idPesanan);

              if (!pesanan) return { jenis: 'tidak-ditemukan' };
              if (pesanan.status === 'dibayar') return { jenis: 'sudah-dibayar' };

              await penyimpanan.simpanStatus(pesanan.id, 'dibatalkan');
              return { jenis: 'berhasil' };
            },
          };
        }
        `,
        {
          filename: 'src/pesanan/layanan.ts',
          caption:
            'Layanan menerima penyimpanan dari luar. Inilah dependency injection dalam bentuk paling sederhana.',
        },
      ),
      code(
        'ts',
        `
        import type { Pesanan, PenyimpananPesanan } from './domain';
        import { db } from '../bersama/db';

        export const penyimpananPrisma: PenyimpananPesanan = {
          async cari(id) {
            const baris = await db.pesanan.findUnique({ where: { id } });
            if (!baris) return null;

            // Menerjemahkan bentuk tabel menjadi bentuk domain.
            // Kolom baru di tabel tidak otomatis bocor ke seluruh aplikasi.
            return {
              id: baris.id,
              idPembeli: baris.id_pembeli,
              totalRupiah: Number(baris.total_rupiah),
              status: baris.status as Pesanan['status'],
            };
          },

          async simpanStatus(id, status) {
            await db.pesanan.update({ where: { id }, data: { status } });
          },
        };
        `,
        {
          filename: 'src/pesanan/penyimpanan-prisma.ts',
          caption:
            'Satu-satunya berkas di modul ini yang tahu Prisma ada, dan satu-satunya yang tahu nama kolom.',
        },
      ),
      p(
        'Perhatikan fungsi `cari` di adapter. Ia tidak mengembalikan hasil Prisma apa adanya, melainkan menerjemahkannya menjadi bentuk `Pesanan` milik domain. Terjemahan sepanjang empat baris itulah yang mencegah kebocoran yang dibahas di sub-bab sebelumnya, dan ia juga yang membuat menambah kolom `catatan_internal` di tabel tidak otomatis membuat kolom itu terkirim ke klien.',
      ),

      h2('Merakitnya di satu tempat'),
      p(
        'Setelah semua bagian berdiri sendiri, ada satu tempat yang merakitnya. Tempat itu adalah composition root, dan ia biasanya berkas yang menyalakan aplikasi.',
      ),
      code(
        'ts',
        `
        import express from 'express';
        import { buatLayananPesanan } from './pesanan/layanan';
        import { penyimpananPrisma } from './pesanan/penyimpanan-prisma';

        // Satu-satunya tempat yang tahu semua teknologi sekaligus.
        const layananPesanan = buatLayananPesanan(penyimpananPrisma);

        const app = express();

        app.post('/pesanan/:id/batal', async (req, res) => {
          const hasil = await layananPesanan.batalkan(req.params.id);

          // Rute yang menerjemahkan hasil domain menjadi kode status HTTP.
          if (hasil.jenis === 'tidak-ditemukan') {
            return res.status(404).json({ pesan: 'Pesanan tidak ditemukan' });
          }
          if (hasil.jenis === 'sudah-dibayar') {
            return res.status(409).json({ pesan: 'Pesanan yang sudah dibayar tidak bisa dibatalkan' });
          }
          return res.status(200).json({ status: 'dibatalkan' });
        });
        `,
        {
          filename: 'src/server.ts',
          caption:
            'Mengganti PostgreSQL dengan penyimpanan lain berarti mengubah satu baris di berkas ini.',
        },
      ),

      h2('Keuntungan yang paling cepat terasa'),
      p(
        'Manfaat yang biasanya disebut pertama adalah kebebasan mengganti database, dan justru itu manfaat yang paling jarang dipakai. Manfaat yang benar-benar terasa setiap minggu ada dua, yaitu test yang cepat dan pintu masuk yang bertambah tanpa menyalin logika.',
      ),
      code(
        'ts',
        `
        import { describe, expect, it } from 'vitest';
        import { buatLayananPesanan } from '@/pesanan/layanan';
        import type { Pesanan, PenyimpananPesanan } from '@/pesanan/domain';

        function penyimpananDiMemori(isi: Pesanan[]): PenyimpananPesanan {
          const data = new Map(isi.map((pesanan) => [pesanan.id, pesanan]));
          return {
            async cari(id) {
              return data.get(id) ?? null;
            },
            async simpanStatus(id, status) {
              const pesanan = data.get(id);
              if (pesanan) data.set(id, { ...pesanan, status });
            },
          };
        }

        describe('pembatalan pesanan', () => {
          it('menolak pesanan yang sudah dibayar', async () => {
            const layanan = buatLayananPesanan(
              penyimpananDiMemori([
                { id: 'p1', idPembeli: 'u1', totalRupiah: 50000, status: 'dibayar' },
              ]),
            );

            expect(await layanan.batalkan('p1')).toEqual({ jenis: 'sudah-dibayar' });
          });

          it('menjawab tidak ditemukan untuk id yang tidak ada', async () => {
            const layanan = buatLayananPesanan(penyimpananDiMemori([]));

            expect(await layanan.batalkan('entah')).toEqual({ jenis: 'tidak-ditemukan' });
          });
        });
        `,
        {
          filename: 'src/test/pesanan-batalkan.test.ts',
          caption: 'Tanpa database, tanpa server, tanpa menunggu. Aturan bisnisnya diuji langsung.',
        },
      ),
      p(
        'Test seperti ini berjalan dalam hitungan milidetik dan bisa dijalankan ratusan kali sehari. Bandingkan dengan test yang harus menyalakan database, menjalankan migrasi, mengisi data awal, lalu membersihkannya kembali. Perbedaan kecepatan itu yang menentukan apakah test benar-benar dijalankan atau hanya ada di repositori.',
      ),
      p(
        'Manfaat kedua muncul saat kebutuhan bertambah. Ketika pembatalan pesanan juga harus bisa dilakukan lewat job terjadwal untuk pesanan yang kedaluwarsa, kamu memanggil `layananPesanan.batalkan` dari job itu. Tidak ada logika yang disalin, dan aturan "yang sudah dibayar tidak bisa dibatalkan" otomatis berlaku di kedua pintu masuk.',
      ),

      h2('Kapan teknik ini justru berlebihan'),
      p(
        'Membalik ketergantungan punya harga, yaitu satu berkas interface tambahan, satu fungsi penerjemah, dan satu lapisan lagi yang harus dibuka saat menelusuri alur. Untuk sebagian kode, harga itu lebih besar daripada manfaatnya.',
      ),
      table(
        ['Situasi', 'Balik ketergantungannya?', 'Alasan'],
        [
          [
            'Aturan bisnis nyata yang punya beberapa cabang keputusan',
            'Ya',
            'Inilah yang paling untung diuji cepat dan dipakai dari beberapa pintu masuk',
          ],
          [
            'Endpoint yang hanya mengambil daftar lalu menampilkannya',
            'Tidak',
            'Tidak ada aturan yang perlu dilindungi. Interface hanya menambah berkas',
          ],
          [
            'Panggilan ke layanan luar yang bisa gagal atau berbayar',
            'Ya',
            'Test tidak boleh benar-benar memanggilnya, dan penyedianya termasuk yang mungkin diganti',
          ],
          [
            'Pemakaian library kecil yang murni menghitung, misalnya format tanggal',
            'Tidak',
            'Tidak ada efek samping, mudah diuji apa adanya, dan menggantinya murah',
          ],
          [
            'Integrasi dengan sistem lama yang bentuk datanya aneh',
            'Ya, sekaligus anti-corruption layer',
            'Menjaga istilah asing tidak merembes ke seluruh domain',
          ],
        ],
        'Aturannya sederhana, yaitu balik ketergantungan pada hal yang mahal, tidak stabil, atau yang perlu diuji tanpa dijalankan sungguhan.',
      ),
      callout(
        'warning',
        'Satu interface untuk satu implementasi yang tidak akan pernah berubah adalah biaya murni',
        'Kalau kamu membuat `interface PemformatTanggal` dengan satu implementasi dan tidak ada rencana apa pun menggantinya, kamu menambah satu lapisan yang harus dibaca setiap orang tanpa membeli kebebasan apa pun. Prinsip YAGNI dari sub-bab 1.2 berlaku penuh di sini. Pertanyaan penentunya adalah apakah ada alasan nyata untuk mengganti atau menirunya.',
      ),

      h2('Rangkuman'),
      ul(
        'Membalik ketergantungan berarti domain memiliki kesepakatan bentuknya, dan teknologi yang menyesuaikan diri.',
        'Wujudnya tiga berkas, yaitu bentuk data domain beserta port-nya, layanan yang menerimanya, dan adapter yang memenuhinya.',
        'Adapter menerjemahkan bentuk tabel menjadi bentuk domain, sehingga kolom baru tidak otomatis bocor ke mana-mana.',
        'Composition root adalah satu-satunya tempat yang boleh tahu semua teknologi sekaligus.',
        'Manfaat yang paling terasa bukan mengganti database, melainkan test cepat dan pintu masuk baru tanpa menyalin logika.',
        'Balik ketergantungan pada yang mahal, tidak stabil, atau perlu diuji tanpa dijalankan. Sisanya biarkan langsung.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Membalik ketergantungan berarti membuat lapisan dalam menetapkan kontraknya sendiri, lalu lapisan luar yang memenuhinya. Yang dibeli bisa diukur, dan yang dibayar juga.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini:

          src/lib/curriculum/queries.ts -> src/content/curriculum/index.ts

        Lapisan lib mengimpor lapisan content secara LANGSUNG.
        Akibatnya:
          - queries.ts tidak bisa diuji tanpa memuat SELURUH kurikulum
          - menambah kategori berpotensi menyentuh queries.ts
          - lib tidak bisa dipakai ulang di konteks lain

        Bentuk yang dibalik: queries.ts menetapkan apa yang ia
        butuhkan, dan siapa pun yang memanggilnya menyediakan itu.
        `,
      ),
      code(
        'ts',
        `
        // SEBELUM: lapisan dalam tahu dari mana datanya berasal.
        import { curriculum } from '@/content/curriculum';

        export function cariPelajaran(slug: string) {
          return curriculum.flatMap((k) => k.chapters).flatMap((b) => b.lessons)
            .find((p) => p.slug === slug);
        }

        // SESUDAH: lapisan dalam menetapkan APA yang ia butuhkan.
        export function cariPelajaran(sumber: Kategori[], slug: string) {
          return sumber.flatMap((k) => k.chapters).flatMap((b) => b.lessons)
            .find((p) => p.slug === slug);
        }

        // Pemanggil yang menyediakan datanya:
        //   cariPelajaran(curriculum, slug)
        // Dan test yang menyediakan data uji:
        //   cariPelajaran([kategoriUji], 'apa-pun')
        `,
        { caption: 'Membalik ketergantungan sering sesederhana mengubah impor menjadi parameter.' },
      ),
      p(
        'Bentuk kedua, yaitu antarmuka yang ditetapkan lapisan dalam, dipakai ketika yang dibutuhkan bukan data melainkan kemampuan.',
      ),
      code(
        'ts',
        `
        // Lapisan dalam menetapkan kontraknya SENDIRI.
        // Perhatikan bentuknya: ia ditulis dengan kata-kata domain,
        // bukan kata-kata basis data.
        export interface PenyimpanPesanan {
          ambil(id: PesananId): Promise<Pesanan | null>;
          simpan(pesanan: Pesanan): Promise<void>;
        }

        export function batalkanPesanan(
          penyimpan: PenyimpanPesanan,
          id: PesananId,
        ): Promise<HasilPembatalan> {
          // seluruh aturan bisnis di sini, tanpa satu pun
          // pengetahuan tentang SQL, HTTP, atau berkas
        }

        // Lapisan luar yang MEMENUHI kontrak itu:
        export class PenyimpanPesananPostgres implements PenyimpanPesanan {
          async ambil(id: PesananId) { /* SQL di sini */ }
          async simpan(pesanan: Pesanan) { /* SQL di sini */ }
        }
        `,
      ),
      p(
        'Yang dibeli bisa diperiksa langsung, yaitu bahwa logikanya kini bisa diuji tanpa satu pun komponen luar.',
      ),
      code(
        'text',
        `
        Sebelum dibalik:
          untuk menguji satu aturan bisnis, dibutuhkan basis data
          yang menyala, skema yang termigrasi, dan data uji

          Diukur di bab lain: menyiapkan cluster PostgreSQL, membuat
          skema, dan mengisi 55.000 baris memakan beberapa detik
          per jalannya — dan itu per SUITE, bukan per test

        Sesudah dibalik:
          test menyediakan objek tiruan yang memenuhi antarmukanya
          Diukur di mesin ini, satu pemanggilan fungsi murni
          selesai dalam puluhan nanodetik
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Membalik ketergantungan punya biaya nyata, dan biaya itu sering tidak dihitung sebelum diterapkan di mana-mana.',
      ),
      code(
        'text',
        `
        Yang dibayar:

          1. Satu lapisan tidak langsung tambahan
             Membaca kode menjadi: lihat antarmuka, cari siapa yang
             memenuhinya, baru baca implementasinya.

          2. Lebih banyak berkas
             Satu kemampuan kini menjadi antarmuka, implementasi,
             dan tempat keduanya disambungkan.

          3. Antarmuka yang bocor
             Bila antarmukanya ditulis mengikuti bentuk basis data,
             yang terjadi hanyalah memindahkan nama tanpa membalik
             apa pun.
        `,
      ),
      code(
        'ts',
        `
        // ANTARMUKA YANG BOCOR — terlihat dibalik, sebenarnya tidak.
        export interface PenyimpanPesanan {
          query(sql: string, params: unknown[]): Promise<Row[]>;   // BOCOR
          beginTransaction(): Promise<Transaction>;                 // BOCOR
        }
        // Lapisan dalam kini tahu bahwa penyimpanannya adalah basis
        // data relasional. Menggantinya dengan apa pun yang lain
        // tetap mustahil, dan satu lapisan tidak langsung sudah
        // dibayar tanpa membeli apa-apa.

        // ANTARMUKA YANG BENAR ditulis dengan kata DOMAIN:
        export interface PenyimpanPesanan {
          ambil(id: PesananId): Promise<Pesanan | null>;
          simpan(pesanan: Pesanan): Promise<void>;
          cariMenunggu(batas: number): Promise<Pesanan[]>;
        }
        `,
        {
          caption:
            'Uji sederhananya: bisakah antarmuka ini dipenuhi oleh berkas JSON? Bila tidak, ia belum dibalik.',
        },
      ),
      p('Kesalahan kedua bersifat cakupan, yaitu membalik segalanya termasuk yang tidak perlu.'),
      code(
        'text',
        `
        Yang PANTAS dibalik:
          - hal yang berbeda antara produksi dan test
          - hal yang mungkin diganti: penyedia pembayaran, penyimpanan
            berkas, pengirim surel
          - hal yang membuat logika tidak bisa diuji sendiri

        Yang TIDAK pantas dibalik:
          - fungsi utilitas murni
          - pustaka yang tidak mungkin diganti
          - hal yang punya satu implementasi dan akan tetap begitu

        Diukur pada project ini: src/lib/utils/cn.ts punya fan-in 16
        dan tidak ada satu pun alasan membalik ketergantungan
        padanya. Ia fungsi murni tanpa keadaan dan tanpa I/O.
        `,
      ),
      code(
        'text',
        `
        DAN SATU KESALAHAN yang halus: antarmuka dengan satu
        implementasi selamanya.

        Bila sebuah antarmuka hanya pernah punya satu implementasi
        DAN tidak pernah dipakai untuk menguji, ia adalah lapisan
        tidak langsung yang tidak membeli apa pun.

        Uji: hitung implementasinya.
          1 implementasi + dipakai di test  -> berbayar
          1 implementasi + tidak dipakai di test -> hapus antarmukanya
          2 implementasi atau lebih -> jelas berbayar
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Membalik ketergantungan adalah teknik yang mudah diterapkan berlebihan, sebab ia terasa seperti kerapian.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat antarmuka untuk setiap kelas',
            'Katanya praktik yang baik',
            'Antarmuka dengan satu implementasi yang tidak dipakai di test adalah lapisan tanpa manfaat',
          ],
          [
            'Menulis antarmuka mengikuti bentuk basis data',
            'Itu kan yang dibutuhkan',
            'Lapisan dalam tetap tahu penyimpanannya relasional. Satu lapisan dibayar tanpa membeli apa pun',
          ],
          [
            'Mengimpor lapisan luar dari lapisan dalam "sekali ini saja"',
            'Cuma satu tempat',
            'Diukur, satu sisi `lib -> content` membuat modul itu tidak bisa diuji tanpa seluruh kurikulum',
          ],
          [
            'Membalik ketergantungan pada fungsi murni',
            'Biar konsisten',
            'Fungsi tanpa keadaan dan tanpa I/O tidak perlu dibalik. Diukur, `cn.ts` fan-in 16 dan tetap sederhana',
          ],
          [
            'Memakai kerangka injeksi ketergantungan sejak awal',
            'Nanti pasti dibutuhkan',
            'Parameter fungsi sudah menyelesaikan sebagian besar kasus tanpa satu pun pustaka',
          ],
          [
            'Menganggap pembalikan menjamin bisa ganti implementasi',
            'Antarmukanya kan ada',
            'Hanya bila antarmukanya ditulis dengan kata domain. Uji: bisakah dipenuhi oleh berkas JSON?',
          ],
        ],
      ),
      p(
        'Bentuk pembalikan yang paling sering benar juga yang paling sederhana, yaitu mengubah impor menjadi parameter. Ia tidak memerlukan antarmuka, tidak memerlukan kerangka kerja, dan langsung membuat fungsinya bisa diuji dengan data apa pun. Baru ketika parameter itu ternyata berupa kemampuan dan bukan data, antarmuka menjadi bentuk yang tepat.',
      ),
      references(
        {
          label: 'Anti-corruption Layer pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer',
          source: 'Microsoft',
          note: 'Bentuk khusus adapter untuk batas dengan sistem yang bentuk datanya tidak kamu kendalikan.',
        },
        {
          label: 'Interfaces — TypeScript Handbook',
          href: 'https://www.typescriptlang.org/docs/handbook/2/objects.html',
          source: 'TypeScript',
          note: 'Cara TypeScript menyatakan kesepakatan bentuk yang hilang saat kode dijalankan.',
        },
        {
          label: 'Testing — Vitest guide',
          href: 'https://vitest.dev/guide/',
          source: 'Vitest',
          note: 'Runner yang dipakai contoh test di sub-bab ini.',
        },
      ),
    ],
  ),

  written(
    'hukum-conway',
    'Hukum Conway dan Bentuk Tim',
    19,
    'Kenapa susunan sistem cenderung meniru susunan orang yang membangunnya.',
    [
      p(
        'Coba perhatikan sesuatu yang mungkin pernah kamu alami. Kalau sebuah aplikasi dikerjakan oleh satu tim frontend dan satu tim backend yang terpisah, hampir pasti aplikasinya terbelah menjadi dua bagian besar dengan API di tengahnya. Kalau aplikasi yang sama dikerjakan tiga tim yang masing-masing memegang satu fitur dari ujung ke ujung, hampir pasti bentuknya menjadi tiga bagian yang masing-masing punya tampilan dan datanya sendiri.',
      ),
      p(
        'Yang menarik, tidak ada satu pun dari kedua hasil itu yang pernah diputuskan lewat rapat arsitektur. Bentuknya muncul sendiri, mengikuti siapa yang sehari-hari bicara dengan siapa.',
      ),
      p(
        'Pengamatan itu punya nama, yaitu **hukum Conway**, dan bunyinya kira-kira begini. **Sebuah sistem cenderung berbentuk seperti pola komunikasi orang-orang yang membangunnya.**',
      ),
      p(
        'Sekilas ini terdengar seperti pengamatan sosial yang tidak ada urusannya dengan kode. Padahal akibatnya sangat praktis, yaitu keputusan arsitektur yang bertabrakan dengan susunan tim hampir selalu kalah. Kalahnya pun tidak berupa penolakan terbuka dalam rapat, melainkan berupa pengikisan pelan yang tidak pernah dibahas siapa pun sampai batasnya benar-benar habis.',
      ),

      terms(
        {
          term: "Conway's law (hukum Conway)",
          meaning:
            'Pengamatan bahwa bentuk sebuah sistem cenderung mengikuti pola komunikasi organisasi yang membangunnya. Dibaca "konwei", diambil dari nama Melvin Conway yang menuliskannya pada 1967. Ia bukan aturan yang harus dipatuhi melainkan kecenderungan yang bisa diamati, dan justru karena itu ia berguna sebagai alat prediksi. Cara memakainya, kalau kamu tahu susunan timnya, kamu bisa menebak bentuk sistemnya sebelum membuka kodenya sama sekali.',
        },
        {
          term: 'inverse Conway maneuver',
          meaning:
            'Cara memakai hukum Conway secara sengaja, yaitu mengatur susunan tim lebih dulu supaya sistem yang dihasilkan berbentuk seperti yang diinginkan. Dibaca "invers konwei manuver", artinya manuver Conway terbalik, karena arah pemakaiannya dibalik dari ramalan menjadi alat. Contohnya, kalau ingin tiga bagian yang benar-benar mandiri, bentuk tiga tim yang benar-benar mandiri, bukan satu tim yang diminta menjaga tiga batas sekaligus lewat disiplin semata.',
        },
        {
          term: 'cognitive load (beban kognitif)',
          meaning:
            'Banyaknya hal yang harus dipegang seseorang di kepalanya untuk bisa bekerja dengan benar. Dibaca "kognitif lod". Contoh nyatanya, untuk menambah satu field ke halaman pesanan, apakah kamu cukup memahami modul pesanan saja, atau harus ingat juga bahwa modul laporan membaca tabel yang sama dan modul gudang mengandalkan urutan kolomnya. Batas modul yang baik mengurangi beban ini karena seseorang cukup memahami satu bagian beserta permukaan tetangganya, bukan seluruh sistem sekaligus.',
        },
        {
          term: 'handoff (serah terima)',
          meaning:
            'Titik ketika sebuah pekerjaan harus berpindah ke orang atau tim lain sebelum bisa selesai. Dibaca "handof". Yang mahal dari handoff bukan waktu mengerjakannya, melainkan **waktu menunggunya**. Contohnya, tim backend selesai dalam dua jam, lalu pekerjaannya menunggu tiga hari di antrean tim frontend sebelum disentuh. Jumlah handoff untuk menyelesaikan satu fitur adalah salah satu ukuran paling jujur tentang apakah batas sistem sudah sejalan dengan batas tim.',
        },
        {
          term: 'ownership (kepemilikan)',
          meaning:
            'Kejelasan tentang siapa yang bertanggung jawab merawat sebuah bagian, memutuskan perubahannya, dan menjawab saat ia bermasalah. Dibaca "onersyip". Uji cepatnya satu pertanyaan, kalau bagian ini bermasalah jam sebelas malam, nama siapa yang muncul di kepala semua orang. Kalau tidak ada namanya, bagian itu tidak punya pemilik. Bagian tanpa pemilik biasanya berkembang menjadi bagian paling kusut, karena setiap orang menambah dan tidak ada yang merasa berhak merapikan.',
        },
        {
          term: 'bounded context',
          meaning:
            'Wilayah tempat sebuah istilah punya satu arti yang disepakati. Dibaca "baunded kontekst", artinya konteks yang dibatasi. Contohnya kata "pesanan". Bagi tim gudang, pesanan berarti daftar barang yang harus diambil dari rak. Bagi tim keuangan, pesanan berarti sejumlah uang yang harus ditagih. Keduanya benar di wilayahnya masing-masing. Alih-alih memaksakan satu definisi untuk semua, batas konteks mengakui perbedaan itu lalu menariknya menjadi garis pemisah. Dibahas tuntas di Bab 2 sub-bab 4.',
        },
      ),

      h2('Bentuknya terlihat dari mana'),
      p(
        'Cara termudah merasakan hukum ini adalah melihat gejalanya, bukan definisinya. Beberapa gejala berikut hampir selalu muncul ketika bentuk sistem dan bentuk tim tidak sejalan.',
      ),
      table(
        ['Gejala yang terasa', 'Yang sebenarnya terjadi'],
        [
          [
            'Satu fitur kecil butuh persetujuan tiga tim',
            'Batas sistem memotong sesuatu yang seharusnya utuh, sehingga satu perubahan bisnis menjadi tiga perubahan teknis',
          ],
          [
            'Ada modul yang selalu menjadi sumber konflik merge',
            'Modul itu tidak punya pemilik, sehingga semua orang menambah dan tidak ada yang merapikan',
          ],
          [
            'Dua tim membangun hal yang hampir sama tanpa saling tahu',
            'Tidak ada permukaan resmi yang bisa dipakai ulang, sehingga menyalin lebih murah daripada berkoordinasi',
          ],
          [
            'Layanan terpisah tetapi rilisnya harus barengan',
            'Pemisahannya di tingkat berkas saja, sedangkan ketergantungannya tidak ikut terpisah',
          ],
          [
            'Satu orang menjadi satu-satunya yang paham sebuah bagian',
            'Beban kognitif bagian itu terlalu besar untuk dibagi, biasanya karena batasnya kabur',
          ],
        ],
        'Tidak satu pun gejala ini terlihat sebagai masalah arsitektur pada awalnya. Semuanya terasa sebagai masalah koordinasi.',
      ),
      p(
        'Baris keempat adalah yang paling mahal dan akan muncul lagi di Bab 2 dengan nama resminya. Layanan yang terpisah secara fisik tetapi harus dirilis bersamaan memberi seluruh kerumitan sistem terdistribusi tanpa satu pun manfaatnya. Bentuk seperti itu hampir selalu lahir dari pemecahan yang mengikuti struktur organisasi lama.',
      ),

      h2('Memakainya sebagai alat prediksi'),
      p(
        'Karena hukum ini menyatakan kecenderungan, ia bisa dipakai untuk memeriksa sebuah rencana sebelum dijalankan. Caranya sederhana, yaitu bandingkan bentuk yang direncanakan dengan pola komunikasi yang benar-benar ada sekarang.',
      ),
      steps(
        {
          title: 'Gambar bentuk sistem yang direncanakan',
          body: 'Cukup kotak dan panah. Berapa bagian besar, siapa bicara dengan siapa, dan bagian mana yang punya datanya sendiri.',
        },
        {
          title: 'Gambar pola komunikasi tim yang sebenarnya',
          body: 'Bukan bagan organisasi resmi, melainkan siapa yang benar-benar sering bicara dengan siapa untuk menyelesaikan pekerjaan. Keduanya sering berbeda jauh.',
        },
        {
          title: 'Cari batas sistem yang tidak punya pasangan di gambar kedua',
          body: 'Setiap batas sistem yang tidak sejalan dengan batas komunikasi akan terus ditembus, karena menembusnya selalu lebih cepat daripada berkoordinasi. Ini bukan soal disiplin, melainkan soal jalur yang paling sedikit hambatannya.',
        },
        {
          title: 'Pilih salah satu, ubah batasnya atau ubah timnya',
          body: 'Kalau susunan tim tidak bisa diubah, sesuaikan batas sistemnya supaya tetap masuk akal. Kalau batas sistemnya memang penting, ubah siapa memiliki apa. Yang tidak berhasil adalah mempertahankan keduanya sambil berharap disiplin akan menutup selisihnya.',
        },
      ),
      callout(
        'info',
        'Berlaku juga untuk tim satu orang',
        'Kalau kamu bekerja sendirian, hukum ini tidak hilang, ia hanya berubah bentuk. Sistem cenderung mengikuti cara kamu membagi perhatian. Kalau kamu selalu mengerjakan fitur secara utuh dari tampilan sampai database, batas modulmu cenderung mengikuti fitur. Kalau kamu terbiasa berpikir per lapisan teknis, batas modulmu cenderung mengikuti lapisan. Keduanya sah, dan mengetahui kecenderunganmu sendiri membantu memilih dengan sadar.',
      ),

      h2('Batas yang sejalan membuat kerja terasa ringan'),
      p(
        'Ada satu ukuran yang cukup jujur untuk menilai apakah batas sistem sudah sejalan dengan cara kerja, yaitu **berapa banyak bagian yang harus disentuh untuk menyelesaikan satu perubahan bisnis yang khas**.',
      ),
      compare(
        {
          title: 'Batas tidak sejalan',
          lang: 'text',
          code: `
            Permintaan: "tambah metode pembayaran QRIS"

            Yang harus disentuh:
              - tim frontend       -> komponen pilihan pembayaran
              - tim backend-api    -> endpoint baru
              - tim backend-core   -> logika perhitungan biaya
              - tim data           -> kolom baru di tabel transaksi

            Empat serah terima, empat jadwal, empat antrean review.
          `,
          notes: [
            'Batas mengikuti lapisan teknis',
            'Setiap perubahan bisnis memotong seluruh lapisan',
            'Waktu selesai ditentukan tim paling sibuk, bukan besarnya pekerjaan',
          ],
        },
        {
          title: 'Batas sejalan',
          lang: 'text',
          code: `
            Permintaan: "tambah metode pembayaran QRIS"

            Yang harus disentuh:
              - tim pembayaran     -> tampilan, endpoint, logika, penyimpanan

            Satu serah terima, yaitu ke pemilik produk saat selesai.
          `,
          notes: [
            'Batas mengikuti bagian bisnis',
            'Satu perubahan bisnis tinggal di satu wilayah',
            'Tim lain tidak perlu tahu QRIS ada',
          ],
        },
      ),
      p(
        'Perhatikan bahwa kolom kanan tidak berarti tim pembayaran mengerjakan segalanya sendiri selamanya. Ia berarti untuk **perubahan yang khas di wilayahnya**, ia tidak perlu menunggu siapa pun. Perubahan lintas wilayah tetap ada dan memang harus ada, hanya saja ia menjadi pengecualian, bukan keseharian.',
      ),

      h2('Kapan susunan tim harus ikut berubah'),
      p(
        'Karena kategori ini tentang sistem dan bukan tentang manajemen, batasnya perlu jelas. Kamu mungkin tidak berwenang mengubah susunan tim, dan itu tidak apa-apa. Yang bisa kamu lakukan adalah **menyebutkan selisihnya secara terbuka** ketika sebuah rencana arsitektur mengandalkan susunan tim yang tidak ada.',
      ),
      table(
        ['Rencana arsitektur', 'Mengandalkan', 'Kalau tidak ada'],
        [
          [
            'Memecah menjadi layanan yang rilis sendiri-sendiri',
            'Ada pemilik jelas per layanan yang bisa memutuskan dan merilis',
            'Layanan tetap dirilis barengan, dan kamu mendapat kerumitannya tanpa manfaatnya',
          ],
          [
            'Batas modul yang ditegakkan ketat',
            'Ada yang merasa memiliki tiap modul dan menolak jalan pintas',
            'Batas ditembus perlahan, dan setahun kemudian tidak ada lagi batas',
          ],
          [
            'Kepemilikan data per bagian',
            'Ada yang bertanggung jawab menjawab permintaan data dari bagian lain',
            'Bagian lain membaca tabel langsung karena tidak ada yang bisa ditanya',
          ],
          [
            'Kontrak API internal yang berversi',
            'Ada yang merawat kontrak dan memberi tahu saat berubah',
            'Kontrak berubah diam-diam dan pemakainya rusak tanpa peringatan',
          ],
        ],
        'Kolom kanan bukan ramalan buruk. Ia hasil yang bisa diperkirakan ketika sebuah bentuk tidak punya penopang organisasinya.',
      ),
      callout(
        'tip',
        'Kalau tidak bisa mengubah tim, sesuaikan ambisinya',
        'Satu tim beranggota empat orang yang mengelola satu aplikasi tidak akan mendapat manfaat dari memecah menjadi lima layanan, karena tidak ada yang perlu rilis terpisah dan tidak ada yang saling menunggu. Yang tetap masuk akal dan tetap murah adalah menegakkan batas modul di dalam satu aplikasi. Bab 2 sub-bab 2 membahas bentuk itu secara utuh.',
      ),

      h2('Rangkuman'),
      ul(
        'Sistem cenderung berbentuk seperti pola komunikasi orang yang membangunnya.',
        'Batas sistem yang tidak punya pasangan di pola komunikasi akan terus ditembus, karena menembusnya lebih cepat.',
        'Gejalanya terasa sebagai masalah koordinasi, bukan sebagai masalah arsitektur.',
        'Ukuran yang jujur adalah berapa banyak bagian yang disentuh untuk satu perubahan bisnis yang khas.',
        'Kalau susunan tim tidak bisa diubah, sesuaikan batas sistem dan sebutkan selisihnya secara terbuka.',
        'Untuk tim kecil, batas modul di dalam satu aplikasi memberi hampir seluruh manfaatnya tanpa biayanya.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Hukum Conway menyatakan bahwa bentuk sistem cenderung meniru bentuk komunikasi organisasi yang membangunnya. Yang membuatnya berguna bukan pengamatannya melainkan akibat praktisnya, yaitu bahwa batas modul dan batas tim sebaiknya diputuskan bersamaan.',
      ),
      code(
        'text',
        `
        Bentuk yang paling sering terlihat:

          tim frontend + tim backend
            -> batasnya di antara keduanya, yaitu API
            -> setiap fitur menuntut koordinasi dua tim
            -> "menunggu backend" dan "menunggu frontend" menjadi
               kalimat sehari-hari

          tim per domain (pesanan, pembayaran, katalog)
            -> batasnya di antara domain
            -> satu fitur biasanya selesai dalam satu tim
            -> koordinasi hanya saat kontrak antar domain berubah

        Keduanya menghasilkan arsitektur yang berbeda, dan tidak
        satu pun dari keduanya dipilih dengan sengaja.
        `,
        {
          caption:
            'Bentuk sistem yang tidak dipilih dengan sengaja tetap dipilih — oleh struktur organisasinya.',
        },
      ),
      p(
        'Pada project satu orang, hukum ini tetap berlaku dengan bentuk yang berbeda, dan bisa dilihat pada project ini sendiri.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini:

          110  content -> lib
           58  content -> content
           40  app     -> lib
           36  app     -> components
           32  components -> lib

        Bentuknya mengikuti cara kerjanya: isi kurikulum ditulis
        terpisah dari cara ia ditampilkan, dan keduanya memakai
        satu lapisan alat bersama.

        Dan berkas yang paling banyak diimpor:
          58  src/lib/curriculum/authoring.ts
          49  src/lib/content/builders.ts

        Keduanya adalah "kontrak" yang disepakati antara orang yang
        menulis isi dan orang yang menulis tampilan — meski keduanya
        orang yang sama.
        `,
      ),
      p(
        'Akibat praktis yang paling berguna dari hukum ini adalah bahwa ia bisa dipakai ke arah sebaliknya, yaitu mengubah bentuk tim untuk mendapatkan bentuk sistem yang diinginkan.',
      ),
      code(
        'text',
        `
        Disebut manuver Conway terbalik:

          Ingin sistem terbagi per domain?
            -> bagi timnya per domain, bukan per lapisan teknologi

          Ingin satu tim bisa merilis sendiri?
            -> beri tim itu seluruh lapisan yang dibutuhkan fiturnya,
               termasuk basis datanya sendiri

          Ingin lapisan bersama tetap stabil?
            -> ia harus punya pemilik yang jelas, dan perubahannya
               melewati kontrak yang disepakati

        Dan sebaliknya: memecah sistem menjadi layanan sementara
        timnya tetap terbagi per lapisan menghasilkan bentuk terburuk
        dari keduanya, yaitu banyak layanan yang tidak bisa dirilis
        tanpa koordinasi.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ketidakcocokan antara bentuk tim dan bentuk sistem tidak menghasilkan error. Ia menghasilkan pekerjaan yang selalu tertunda pada tempat yang sama.',
      ),
      code(
        'text',
        `
        Gejala yang khas:

          "Fitur ini menunggu tim lain"
            -> batas sistemnya memotong tengah-tengah alur kerja

          "Kami harus merilis bersamaan"
            -> layanan terpisah tanpa kontrak yang bisa berevolusi

          "Tidak ada yang tahu siapa pemilik modul itu"
            -> modul tanpa pemilik akan menampung segalanya

          "Setiap tim menulis ulang hal yang sama"
            -> tidak ada lapisan bersama, atau ada dan tidak
               ditemukan siapa pun

        Ketiga yang pertama adalah masalah organisasi yang menyamar
        sebagai masalah teknis, dan menyelesaikannya dengan teknik
        saja tidak pernah berhasil.
        `,
      ),
      p(
        'Ada satu sinyal terukur yang cukup andal, yaitu berapa tim yang harus terlibat untuk menyelesaikan satu fitur.',
      ),
      code(
        'text',
        `
        Hitung untuk sepuluh fitur terakhir:

          1 tim   -> batasnya cocok dengan alur kerjanya
          2 tim   -> masih wajar untuk sebagian fitur
          3+ tim  -> batasnya memotong tempat yang salah

        Dan sinyal yang sama pada tingkat berkas, diukur dari
        riwayat git project ini:

          3x bersama (50% dari perubahan yang lebih jarang)
              src/lib/content/types.ts
              src/test/curriculum-integrity.test.ts

          3x bersama (60% dari perubahan yang lebih jarang)
              src/content/glossary.ts
              src/test/curriculum-integrity.test.ts

        Berkas yang selalu berubah bersamaan menunjukkan batas
        yang mungkin salah tempat. Pada tingkat tim, angkanya
        adalah berapa tim yang harus setuju untuk satu perubahan.
        `,
        {
          caption:
            'Dalam kasus di atas, coupling-nya wajar. Yang perlu dicurigai adalah pasangan yang tidak punya alasan jelas.',
        },
      ),
      p(
        'Kesalahan yang paling mahal adalah memecah sistem tanpa memecah kepemilikannya, dan biayanya bisa dihitung.',
      ),
      code(
        'text',
        `
        Dihitung sungguhan, komponen BERANTAI yang semuanya harus hidup:

           1 komponen @ 99,9% -> 99,9000%   (  8,8 jam/tahun)
          10 komponen @ 99,9% -> 99,0045%   ( 87,2 jam/tahun)
          30 komponen @ 99,9% -> 97,0431%   (259,0 jam/tahun)

        Memecah menjadi tiga puluh layanan menambah tiga puluh tempat
        yang bisa mati, dan bila tidak ada tim yang benar-benar
        memiliki masing-masing, tidak ada yang menjaganya.

        Hasilnya: seluruh biaya memecah sistem dibayar, dan tidak
        satu pun manfaatnya diperoleh.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Hukum Conway sering dianggap pengamatan sosiologis yang menarik, padahal ia alat perancangan yang bisa dipakai dengan sengaja.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membagi tim per lapisan teknologi',
            'Setiap orang mengerjakan keahliannya',
            'Setiap fitur memotong semua tim. Koordinasi menjadi pekerjaan utama',
          ],
          [
            'Memecah sistem tanpa memecah kepemilikan',
            'Yang penting kodenya terpisah',
            'Dihitung, 30 komponen berantai @ 99,9% menghasilkan 259 jam mati per tahun, tanpa satu pun manfaat',
          ],
          [
            'Membiarkan modul bersama tanpa pemilik',
            'Semua orang boleh menyentuhnya',
            'Modul tanpa pemilik menampung segalanya, dan diukur, fan-in-nya menyentuh 71% codebase',
          ],
          [
            'Menyelesaikan masalah koordinasi dengan alat',
            'Alatnya akan mempermudah',
            'Batas yang memotong alur kerja tetap memotongnya. Yang perlu berubah adalah batasnya',
          ],
          [
            'Menyalin struktur tim perusahaan besar',
            'Mereka kan berhasil',
            'Struktur mereka menjawab masalah organisasi mereka, dan itu yang paling tidak bisa disalin',
          ],
          [
            'Mengabaikan hukum ini pada project satu orang',
            'Tidak ada tim di sini',
            'Bentuknya tetap mengikuti cara kerjamu. Diukur pada project ini, batasnya mengikuti pemisahan isi dan tampilan',
          ],
        ],
      ),
      p(
        'Nilai praktis hukum ini bisa diringkas menjadi satu pertanyaan yang pantas diajukan sebelum memutuskan batas modul. Siapa yang akan mengubah bagian ini, dan seberapa sering ia perlu menunggu orang lain? Bila jawabannya melibatkan lebih dari dua pihak untuk perubahan yang biasa, batasnya berada di tempat yang akan terus menimbulkan gesekan, betapapun rapi diagramnya.',
      ),
      references(
        {
          label: 'Organization — Operational Excellence Pillar',
          href: 'https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/organization.html',
          source: 'Amazon Web Services',
          note: 'Bagian yang membahas kepemilikan, tanggung jawab, dan akibatnya pada cara sistem dijalankan.',
        },
        {
          label: 'Domain analysis for microservices',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis',
          source: 'Microsoft',
          note: 'Menyelaraskan batas layanan dengan batas bisnis, bukan dengan lapisan teknis.',
        },
        {
          label: 'Operational Excellence — Azure Well-Architected',
          href: 'https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/',
          source: 'Microsoft',
          note: 'Sisi organisasi dan proses yang menentukan apakah sebuah bentuk sanggup dijalankan.',
        },
      ),
    ],
  ),

  written(
    'anti-pola-arsitektur',
    'Anti-pola yang Sering Terjadi',
    21,
    'Delapan bentuk yang terlihat masuk akal saat dibuat dan mahal saat harus dibongkar.',
    [
      p(
        'Pikirkan bagaimana sebuah rumah berubah menjadi berantakan. Tidak pernah ada satu hari ketika seseorang memutuskan "mulai hari ini rumah ini berantakan". Yang terjadi adalah satu barang ditaruh di meja karena sedang buru-buru, lalu barang kedua ditaruh di atasnya karena mejanya sudah terpakai, lalu setahun kemudian meja itu tidak bisa dipakai untuk apa pun.',
      ),
      p(
        'Kode berantakan terbentuk persis dengan cara yang sama. Karena itu materi arsitektur yang hanya berisi daftar bentuk yang dianjurkan tidak banyak menolong, sebab masalah sesungguhnya bukan tidak tahu bentuk yang benar, melainkan tidak sadar sedang bergerak menjauh darinya.',
      ),
      p(
        'Sub-bab ini melakukan kebalikan dari daftar anjuran, yaitu membahas **bentuk yang salah beserta gejala awalnya**. Gejala awal itu yang paling berharga, karena di titik itu memperbaikinya masih semudah memindahkan satu barang, bukan membongkar seluruh meja.',
      ),
      p(
        'Satu hal yang perlu dipegang sejak awal. Tidak satu pun anti-pola di bawah lahir dari kemalasan atau ketidaktahuan. Semuanya lahir dari keputusan yang **masuk akal saat dibuat**, dan baru berubah menjadi masalah setelah keadaannya berubah.',
      ),

      terms(
        {
          term: 'anti-pattern (anti-pola)',
          meaning:
            'Bentuk yang sering muncul, terlihat seperti solusi, tetapi menimbulkan lebih banyak masalah daripada yang diselesaikannya. Dibaca "anti-patern". Ciri khas sebuah anti-pola bukan bahwa ia buruk dalam segala keadaan, melainkan bahwa ia terus dipilih meskipun ada pilihan lain yang lebih murah. Analoginya seperti memakai kursi untuk menggantung baju, yaitu untuk sehari memang menyelesaikan masalah, tetapi kalau jadi kebiasaan kamu kehilangan kursi sekaligus tidak pernah punya gantungan.',
        },
        {
          term: 'big ball of mud',
          meaning:
            'Sistem tanpa batas yang bisa dikenali, tempat hampir semua bagian bisa memanggil hampir semua bagian lain. Dibaca "big bol of mad", artinya bola lumpur besar, karena isinya tercampur sampai tidak bisa dibedakan lagi mana bagian yang mana. Bukan hasil satu keputusan besar, melainkan hasil ribuan keputusan kecil yang masing-masing menghemat sepuluh menit. Gejala yang paling mudah dikenali, kamu tidak bisa menjelaskan aplikasimu kepada orang lain tanpa membuka kodenya.',
        },
        {
          term: 'distributed monolith',
          meaning:
            'Sistem yang terpisah menjadi banyak layanan tetapi tetap harus dirilis bersama karena saling terikat erat. Dibaca "distributed monolit", artinya monolit yang disebar. Bentuk ini menggabungkan kerumitan operasional layanan terpisah dengan ketidakbebasan monolit, sehingga ia lebih buruk daripada keduanya. Analoginya seperti memisahkan dapur dan ruang makan ke dua bangunan berbeda, tetapi tetap mengharuskan keduanya direnovasi bersamaan. Kamu membayar ongkos punya dua bangunan tanpa mendapat kebebasan merenovasi salah satunya.',
        },
        {
          term: 'accidental complexity (kerumitan yang tidak perlu)',
          meaning:
            'Kerumitan yang berasal dari cara kita menyelesaikan masalah, bukan dari masalahnya sendiri. Dibaca "aksidental komplesiti". Lawannya adalah essential complexity, yaitu kerumitan yang memang melekat pada masalahnya dan tidak bisa dihilangkan siapa pun. Contoh pembedanya, menghitung pajak progresif memang rumit secara alami dan itu essential. Butuh membuka tujuh berkas hanya untuk menemukan di mana pajak itu dihitung adalah kerumitan yang kita tambahkan sendiri, dan itu accidental. Yang pertama harus diterima, yang kedua harus dikurangi.',
        },
        {
          term: 'golden hammer',
          meaning:
            'Kebiasaan memakai satu alat yang sudah dikuasai untuk semua masalah, termasuk yang tidak cocok. Dibaca "golden hamer". Namanya dari pepatah bahwa bagi orang yang hanya punya palu, semua benda terlihat seperti paku.',
        },
        {
          term: 'premature optimization',
          meaning:
            'Mengoptimalkan sesuatu sebelum ada bukti bahwa ia memang menjadi masalah. Dibaca "primatur optimaiseysen", artinya optimasi yang terlalu dini. Harganya bukan hanya waktu yang terbuang, melainkan kode yang lebih sulit dibaca dan lebih sulit diubah demi keuntungan yang tidak pernah terjadi. Contohnya memasang cache Redis di depan query yang ternyata hanya dipanggil dua kali sehari dan sudah selesai dalam tiga milidetik. Sekarang ada satu komponen tambahan yang bisa mati, tanpa satu pun manfaat.',
        },
        {
          term: 'shared database',
          meaning:
            'Keadaan ketika beberapa bagian atau beberapa layanan menulis dan membaca tabel yang sama. Dibaca "syerd database", artinya database yang dipakai bersama. Ia adalah bentuk coupling paling erat yang mungkin ada, karena bentuk tabel berubah menjadi kontrak publik tanpa pernah diputuskan siapa pun. Gejalanya sangat khas dan mudah dikenali, yaitu ada satu tabel yang semua orang tahu tidak boleh diubah namanya, tetapi tidak ada seorang pun yang bisa menjelaskan siapa saja yang memakainya.',
        },
        {
          term: 'resume-driven development',
          meaning:
            'Memilih teknologi atau bentuk arsitektur karena menarik untuk dipelajari dan bagus dituliskan di CV, bukan karena project ini membutuhkannya. Dibaca "rezyume driven develompent", artinya pengembangan yang didorong isi CV. Biayanya ditanggung orang yang merawat sistem itu setelahnya. Perlu ditegaskan, keinginan mencoba teknologi baru itu wajar dan tidak perlu disembunyikan. Yang menjadi anti-pola adalah menyamarkannya sebagai alasan teknis, karena alasan palsu tidak bisa diperdebatkan dengan jujur oleh siapa pun.',
        },
      ),

      h2('Delapan bentuk, gejala awalnya, dan penawarnya'),
      p(
        'Tabel berikut adalah inti sub-bab ini. Kolom gejala awal yang paling berguna, karena di situlah perbaikannya masih murah.',
      ),
      table(
        ['Anti-pola', 'Gejala awal', 'Penawarnya'],
        [
          [
            '**Big ball of mud**',
            'Mulai muncul impor dari folder yang jauh dan tidak berhubungan. Test butuh menyalakan hampir seluruh aplikasi',
            'Tegakkan pintu masuk resmi per modul dan aturan impor lewat linter. Dibahas di Bab 2 sub-bab 2',
          ],
          [
            '**Distributed monolith**',
            'Dua layanan hampir selalu dirilis bersamaan. Mengubah satu selalu memaksa mengubah yang lain',
            'Satukan kembali, atau perbaiki kontraknya supaya benar-benar bisa berubah sendiri. Bab 3 sub-bab 2',
          ],
          [
            '**Shared database**',
            'Ada tabel yang ditulis lebih dari satu modul. Tidak ada yang berani mengubah namanya',
            'Tetapkan satu pemilik per tabel, sediakan permukaan resmi untuk yang lain. Bab 3 sub-bab 4',
          ],
          [
            '**God object**',
            'Ada satu berkas yang muncul di hampir setiap pull request dan sering konflik',
            'Pecah menurut alasan berubahnya, bukan menurut panjangnya. Sub-bab 1.4',
          ],
          [
            '**Golden hammer**',
            'Setiap masalah baru dijawab dengan alat yang sama, termasuk yang bentuknya tidak cocok',
            'Tuliskan dua alternatif beserta alasan menolaknya sebelum memutuskan. Bab 4 sub-bab 2',
          ],
          [
            '**Premature optimization**',
            'Ada cache, antrean, atau pemisahan yang tidak pernah diukur manfaatnya',
            'Minta angka sebelum menambah komponen. Kategori [System Design](/kelas/system-design/fondasi-sistem/estimasi-kasar) menyediakan caranya',
          ],
          [
            '**Anemic layer**',
            'Ada lapisan yang isinya hanya meneruskan panggilan tanpa menambah apa pun',
            'Hapus lapisannya. Lapisan tanpa alasan berbeda untuk berubah tidak membeli kebebasan',
          ],
          [
            '**Resume-driven development**',
            'Pilihan teknologi tidak bisa dijelaskan dengan kebutuhan yang ada sekarang',
            'Wajibkan setiap keputusan besar disertai kebutuhan yang memicunya. Bab 4 sub-bab 2',
          ],
        ],
        'Semuanya punya pola yang sama, yaitu murah diperbaiki saat masih berupa gejala dan mahal saat sudah menjadi bentuk.',
      ),

      h2('Dua yang paling sering menimpa pemula'),
      p(
        'Dari delapan di atas, dua yang paling sering muncul di aplikasi pertama seseorang layak dibahas lebih panjang karena keduanya berlawanan arah.',
      ),
      steps(
        {
          title: 'Terlalu sedikit batas, yaitu big ball of mud',
          body: 'Berawal dari niat baik, yaitu jangan membuat abstraksi sebelum dibutuhkan. Niatnya benar, tetapi diterapkan sampai tidak ada batas sama sekali. Gejalanya khas yaitu kamu tidak bisa menjelaskan aplikasimu tanpa membuka kode, dan menambah fitur baru berarti membaca seluruh alur dari awal. Penawarnya bukan menambah abstraksi, melainkan menegakkan pintu masuk per bagian bisnis.',
        },
        {
          title: 'Terlalu banyak batas, yaitu lapisan yang tidak berbuat apa-apa',
          body: 'Berawal dari niat baik juga, yaitu meniru susunan yang dilihat di materi arsitektur. Hasilnya lima lapisan yang isinya memanggil lapisan berikutnya dengan data yang sama. Gejalanya khas yaitu menelusuri satu permintaan berarti membuka tujuh berkas dan tidak satu pun berisi keputusan. Penawarnya adalah menghapus lapisan yang tidak punya alasan berbeda untuk berubah.',
        },
      ),
      compare(
        {
          title: 'Lapisan yang tidak berbuat apa-apa',
          lang: 'ts',
          code: `
            // rute.ts
            export const ambil = (req, res) => kontrolerPesanan.ambil(req, res);

            // kontroler.ts
            export const ambil = (req, res) => res.json(layananPesanan.ambil(req.params.id));

            // layanan.ts
            export const ambil = (id) => manajerPesanan.ambil(id);

            // manajer.ts
            export const ambil = (id) => repositoriPesanan.ambil(id);

            // repositori.ts
            export const ambil = (id) => db.pesanan.findUnique({ where: { id } });
          `,
          notes: [
            'Empat berkas tanpa satu pun keputusan di dalamnya',
            'Menambah satu field berarti menyentuh lima berkas',
            'Tidak ada satu pun yang bisa berubah tanpa yang lain ikut berubah',
          ],
        },
        {
          title: 'Lapisan yang punya alasan berbeda',
          lang: 'ts',
          code: `
            // rute.ts — menerjemahkan HTTP menjadi panggilan domain
            export const ambil = async (req, res) => {
              const hasil = await layananPesanan.ambil(req.params.id, req.pengguna.id);
              if (hasil.jenis === 'tidak-berhak') return res.sendStatus(403);
              if (hasil.jenis === 'tidak-ditemukan') return res.sendStatus(404);
              return res.json(hasil.pesanan);
            };

            // layanan.ts — memegang aturan siapa boleh melihat apa
            export const ambil = async (id, idPeminta) => {
              const pesanan = await penyimpanan.cari(id);
              if (!pesanan) return { jenis: 'tidak-ditemukan' };
              if (pesanan.idPembeli !== idPeminta) return { jenis: 'tidak-berhak' };
              return { jenis: 'ok', pesanan };
            };
          `,
          notes: [
            'Rute berubah kalau bentuk HTTP berubah',
            'Layanan berubah kalau aturan akses berubah',
            'Dua alasan berbeda, sehingga dua lapisan memang berguna',
          ],
        },
      ),
      p(
        'Perhatikan bahwa kolom kanan justru **lebih sedikit** berkasnya daripada kolom kiri, sekaligus lebih banyak isinya. Jumlah lapisan bukan ukuran kualitas. Yang menjadi ukuran adalah apakah setiap lapisan memegang keputusan yang benar-benar miliknya.',
      ),
      callout(
        'warning',
        'Pemeriksaan hak akses di kolom kanan bukan sekadar contoh',
        'Baris `pesanan.idPembeli !== idPeminta` adalah pencegahan IDOR yang dibahas di sub-bab [IDOR](/kelas/backend-basic/auth-dasar/idor). Perhatikan di mana ia berada, yaitu di lapisan yang memegang aturan, bukan di rute. Dengan begitu ia otomatis berlaku ketika fungsi yang sama dipanggil dari job antrean atau dari halaman lain, dan tidak bisa terlewat karena seseorang lupa menyalinnya.',
      ),

      h2('Cara memeriksa sendiri tanpa alat apa pun'),
      p(
        'Lima pertanyaan berikut bisa dijawab dengan membaca kode selama sepuluh menit, dan sudah cukup untuk menemukan sebagian besar anti-pola di atas sebelum ia mengeras.',
      ),
      ol(
        'Kalau aku menghapus satu modul, berapa banyak berkas di luar modul itu yang ikut rusak. Angka besar berarti pintu masuknya terlalu lebar.',
        'Berkas mana yang paling sering muncul di riwayat perubahan. Berkas itu kandidat god object atau kandidat batas yang salah.',
        'Ada tabel yang ditulis lebih dari satu modul? Kalau ya, tabel itu sudah menjadi kontrak publik tanpa pernah diputuskan.',
        'Ada lapisan yang seluruh isinya hanya meneruskan? Kalau ya, ia tidak membeli kebebasan apa pun.',
        'Ada komponen yang dipasang tanpa pernah diukur manfaatnya? Kalau ya, ia menambah bagian yang bisa rusak tanpa imbalan.',
      ),
      code(
        'bash',
        `
        # Pertanyaan kedua bisa dijawab langsung dari riwayat git.
        # Berkas yang paling sering berubah adalah kandidat terkuat untuk diperiksa.

        git log --since="6 months ago" --name-only --pretty=format: \\
          | grep -E '^src/' \\
          | sort \\
          | uniq -c \\
          | sort -rn \\
          | head -15
        `,
        {
          caption:
            'Bukan vonis, melainkan daftar tempat yang pantas dibaca ulang. Berkas rute memang wajar sering berubah.',
        },
      ),
      p(
        'Hasil perintah itu perlu dibaca dengan hati-hati. Berkas yang sering berubah tidak otomatis bermasalah, karena sebagian bagian memang wajar sering disentuh. Yang menjadi sinyal adalah ketika berkas yang **seharusnya stabil** justru berada di urutan atas, misalnya berkas konfigurasi bersama atau berkas berisi tipe yang dipakai semua modul.',
      ),

      h2('Rangkuman'),
      ul(
        'Anti-pola lahir dari keputusan yang masuk akal saat dibuat, sehingga yang perlu dikenali adalah gejala awalnya.',
        'Big ball of mud datang dari terlalu sedikit batas, lapisan kosong datang dari terlalu banyak batas. Keduanya sama merepotkannya.',
        'Distributed monolith adalah yang paling mahal, karena ia membeli kerumitan terdistribusi tanpa kebebasan rilis.',
        'Shared database mengubah bentuk tabel menjadi kontrak publik tanpa pernah diputuskan siapa pun.',
        'Jumlah lapisan bukan ukuran kualitas. Ukurannya adalah apakah tiap lapisan memegang keputusan miliknya sendiri.',
        'Lima pertanyaan dan satu perintah git sudah cukup untuk pemeriksaan mandiri yang jujur.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Anti-pola arsitektur punya satu kesamaan, yaitu semuanya terasa masuk akal saat diambil. Yang membedakannya dari keputusan yang baik hanya terlihat setelah beberapa bulan, dan sebagian besar bisa dikenali dari angka.',
      ),
      code(
        'text',
        `
        BOLA LUMPUR BESAR
        Tidak ada batas yang jelas; segalanya mengimpor segalanya.

        Tandanya bisa dihitung:
          - rata-rata fan-out per berkas tinggi
          - banyak siklus ketergantungan
          - tidak ada sisi yang bisa dikelompokkan per lapisan

        Diukur sungguhan pada project ini sebagai pembanding:
          116 berkas, 337 sisi -> rata-rata 2,9 per berkas
          siklus ditemukan     : 3, seluruhnya pasangan
                                 halaman-server dan komponen-klien
          sisi per lapisan     : 12 dari 13 kelompok mengikuti arah
                                 yang diharapkan
        `,
        {
          caption:
            'Angka-angka itu yang membedakan struktur yang terjaga dari bola lumpur, dan keduanya terlihat sama di diagram.',
        },
      ),
      p(
        'Anti-pola kedua adalah objek dewa, yaitu satu berkas yang tahu terlalu banyak dan karena itu disentuh setiap perubahan.',
      ),
      code(
        'text',
        `
        Cara mengenalinya, diukur pada project ini:

          fan-in tertinggi:
            58  src/lib/curriculum/authoring.ts
            49  src/lib/content/builders.ts

          seberapa sering berubah (dari riwayat git):
            4x  authoring.ts
            6x  src/lib/content/types.ts

        Fan-in tinggi SAJA bukan objek dewa. Yang membuatnya objek
        dewa adalah fan-in tinggi DITAMBAH sering berubah DITAMBAH
        berubah karena alasan yang berbeda-beda.

        Di sini, authoring.ts punya fan-in 58 dan hanya berubah 4
        kali, dan perubahannya bersifat MENAMBAH kemampuan. Itu
        bentuk yang sehat: ia kernel bersama, bukan objek dewa.
        `,
      ),
      p(
        'Anti-pola ketiga adalah lapisan yang tidak melakukan apa-apa selain meneruskan, dan ia paling sering lahir dari niat baik.',
      ),
      code(
        'ts',
        `
        // LAPISAN ANEMIK — setiap metode hanya meneruskan.
        export class LayananPesanan {
          constructor(private repo: RepoPesanan) {}
          ambil(id: string) { return this.repo.ambil(id); }
          simpan(p: Pesanan) { return this.repo.simpan(p); }
          hapus(id: string) { return this.repo.hapus(id); }
        }

        // Uji penghapusan: bila kelas ini dihapus dan pemanggilnya
        // memakai repo langsung, apa yang hilang?
        //   -> tidak ada. Ia hanya menambah satu berkas untuk dibaca.

        // Lapisan berbayar bila ia MENAMBAH sesuatu:
        export async function batalkanPesanan(repo: RepoPesanan, id: string) {
          const p = await repo.ambil(id);
          if (!p) throw new TidakDitemukan(id);
          if (p.status === 'terkirim') throw new TidakBolehDibatalkan(id);
          if (Date.now() - p.dibuat > 24 * 3600_000) throw new TerlambatDibatalkan(id);
          await repo.simpan({ ...p, status: 'dibatalkan' });
          return p;
        }
        `,
        {
          caption:
            'Uji penghapusan: kalau lapisan ini dihapus, apakah kerumitannya hilang atau justru menyebar ke pemanggil?',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Anti-pola keempat adalah yang paling mahal, yaitu memecah sistem menjadi banyak layanan tanpa memecah datanya.',
      ),
      code(
        'text',
        `
        MONOLIT TERDISTRIBUSI
        Beberapa layanan, satu basis data bersama.

        Yang terjadi:
          - setiap perubahan skema menyentuh beberapa layanan
          - layanan tidak bisa dirilis sendiri-sendiri
          - transaksi lintas layanan mustahil
          - dan seluruh biaya jaringan tetap dibayar

        Dihitung sungguhan:
          10 komponen berantai @ 99,9% -> 99,0045% (87,2 jam/tahun)

        Diukur sungguhan, biaya panggilan jaringan:
          loopback  1,69 ms
          internet  p50 70,04 ms, p99 362,72 ms

        Artinya: seluruh biaya memecah dibayar, dan tidak satu pun
        manfaatnya diperoleh. Bentuk ini lebih buruk daripada monolit
        maupun microservice yang benar.
        `,
      ),
      p(
        'Anti-pola kelima adalah abstraksi yang dibangun untuk masa depan yang tidak pernah datang.',
      ),
      code(
        'text',
        `
        Tandanya:
          - antarmuka dengan satu implementasi, selamanya
          - lapisan konfigurasi untuk hal yang tidak pernah diubah
          - "dukungan multi-tenant" pada produk dengan satu tenant
          - "dukungan beberapa basis data" yang tidak pernah dipakai

        Biayanya dibayar SETIAP HARI oleh setiap orang yang membaca
        kodenya, dan manfaatnya dibayar sekali bila kebutuhannya
        benar-benar datang.

        Uji: hitung implementasinya.
          1 implementasi + dipakai di test        -> berbayar
          1 implementasi + tidak dipakai di test  -> hapus
          2 atau lebih                            -> jelas berbayar
        `,
      ),
      p(
        'Anti-pola keenam bersifat penegakan, yaitu aturan arsitektur yang hanya hidup di dokumen.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini, fitness function yang
        dijalankan terhadap graf impornya:

          GAGAL  lib tidak boleh bergantung pada content (1)
                 src/lib/curriculum/queries.ts -> src/content/curriculum/index.ts
          LULUS  components tidak boleh bergantung pada app
          LULUS  content tidak boleh bergantung pada components
          GAGAL  tidak ada siklus ketergantungan (3)
          LULUS  tidak ada berkas di atas 400 KB

        Tiga aturan gagal. Tidak satu pun dari ketiganya sengaja
        dilanggar; ketiganya menyelinap masuk karena tidak ada yang
        memeriksanya secara otomatis.

        Aturan yang tidak dijalankan mesin akan menyimpang, dan
        penyimpangannya ditemukan secara kebetulan.
        `,
      ),
      code(
        'text',
        `
        DAN SATU JEBAKAN pada fitness function itu sendiri:

        Aturan "tidak ada import paket luar di src/content" ditulis
        dengan mencocokkan teks "import ... from" di MANA SAJA dalam
        berkas. Hasilnya, diukur:

          aturan NAIF  : 259 "pelanggaran"
          aturan BENAR : 0 pelanggaran

        Selisihnya seluruhnya POSITIF PALSU: kata "import" yang
        muncul di dalam CONTOH KODE yang ditulis sebagai teks materi.

        Fitness function yang menghasilkan ratusan positif palsu akan
        dimatikan dalam seminggu, dan seluruh manfaatnya hilang.
        `,
        {
          caption:
            'Anti-pola juga berlaku untuk alat yang dipakai menjaga arsitektur, bukan hanya untuk arsitekturnya.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Anti-pola jarang dipilih dengan sengaja. Ia tumbuh dari keputusan kecil yang masing-masing masuk akal.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambah lapisan yang hanya meneruskan',
            'Biar terpisah rapi',
            'Uji penghapusan: bila dihapus, tidak ada kerumitan yang hilang. Ia hanya berkas tambahan untuk dibaca',
          ],
          [
            'Memecah menjadi layanan dengan basis data bersama',
            'Kodenya kan sudah terpisah',
            'Seluruh biaya jaringan dibayar tanpa satu pun manfaatnya. Dihitung, 10 komponen berantai = 87,2 jam/tahun',
          ],
          [
            'Membuat abstraksi untuk kebutuhan yang belum ada',
            'Biar siap nanti',
            'Biayanya dibayar tiap hari oleh setiap pembaca. Hitung implementasinya sebelum membuat antarmuka',
          ],
          [
            'Menganggap fan-in tinggi selalu objek dewa',
            'Banyak yang bergantung padanya',
            'Diukur, `authoring.ts` fan-in 58 dan hanya berubah 4 kali secara aditif. Itu kernel, bukan objek dewa',
          ],
          [
            'Menulis aturan arsitektur hanya di dokumen',
            'Timnya sudah sepakat',
            'Diukur, tiga aturan dilanggar tanpa ada yang sengaja melanggarnya. Jalankan otomatis',
          ],
          [
            'Menulis fitness function dengan pencocokan teks',
            'Lebih cepat ditulis',
            'Diukur, aturan naif menghasilkan 259 positif palsu melawan 0 pelanggaran sesungguhnya',
          ],
        ],
      ),
      p(
        'Ada satu uji yang menangkap sebagian besar anti-pola di daftar ini, dan namanya uji penghapusan. Bayangkan sebuah modul, lapisan, atau layanan dihapus dan isinya dipindahkan ke pemanggilnya. Bila kerumitannya hilang, modul itu memang tidak membeli apa-apa. Bila kerumitannya menyebar ke banyak tempat, modul itu sedang menanggung beban nyata dan pantas ada.',
      ),
      references(
        {
          label: 'Performance antipatterns for cloud applications',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/antipatterns/',
          source: 'Microsoft',
          note: 'Katalog bentuk yang sering muncul beserta gejala dan cara memperbaikinya.',
        },
        {
          label: 'Architecture styles',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/',
          source: 'Microsoft',
          note: 'Daftar gaya beserta tantangan masing-masing, berguna untuk melihat harga sebuah bentuk sebelum memilihnya.',
        },
        {
          label: 'Cloud design patterns — introduction',
          href: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/introduction.html',
          source: 'Amazon Web Services',
          note: 'Pengantar katalog pola AWS, termasuk konteks kapan sebuah pola tidak diperlukan.',
        },
      ),
    ],
  ),
];
