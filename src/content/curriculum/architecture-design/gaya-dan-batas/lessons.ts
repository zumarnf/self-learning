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
 * Architecture Design — Chapter 2, eight lessons.
 *
 * The shapes. Ordered from least distributed to most, on purpose: a reader who meets
 * microservices on lesson five has already been shown two cheaper shapes that solve the same
 * complaint, and is far less likely to reach for distribution as an upgrade.
 *
 * The decision table in the last lesson is the chapter's real payload. Everything before it
 * exists so the reader can answer its four questions honestly.
 */
export const lessons: LessonDraft[] = [
  written(
    'monolit-yang-baik',
    'Monolit yang Ditulis dengan Baik',
    20,
    'Kenapa bentuk paling sederhana masih menjadi jawaban yang benar untuk sebagian besar aplikasi.',
    [
      p(
        'Kalau kamu sering membaca artikel teknologi, kamu mungkin sudah menangkap kesan bahwa monolit itu tahap memalukan yang harus dilewati secepatnya. Kalimat "kami masih monolit" biasanya diucapkan dengan nada minta maaf, seolah sedang mengakui belum sempat naik kelas.',
      ),
      p(
        'Kesan itu keliru, dan meluruskannya adalah cara terbaik memulai bab ini. Mari mulai dari definisinya yang sebenarnya, karena definisinya jauh lebih sempit daripada yang biasa dibayangkan.',
      ),
      p(
        'Monolit adalah **satu unit yang dibangun, dirilis, dan dijalankan sebagai satu kesatuan**. Itu saja. Perhatikan bahwa definisi itu tidak menyebut apa pun tentang mutu kodenya. Tidak ada kata berantakan, tidak ada kata besar, tidak ada kata lambat.',
      ),
      p(
        'Analogi yang membantu adalah rumah dan kompleks perumahan. Monolit itu satu rumah dengan banyak kamar, sedangkan sistem terdistribusi itu beberapa rumah terpisah. Satu rumah bisa saja tertata sangat rapi dengan tiap kamar punya fungsi jelas, dan tiga rumah terpisah bisa saja semuanya berantakan. Jumlah bangunan tidak menentukan kerapian isinya.',
      ),
      p(
        'Aplikasi Next.js yang kamu bangun di kategori Frontend Intermediate adalah monolit. Aplikasi Express dengan struktur folder rapi dari kategori Backend juga monolit. Keduanya berjalan baik, dan tidak ada yang perlu diminta maaf.',
      ),

      terms(
        {
          term: 'monolith (monolit)',
          meaning:
            'Aplikasi yang seluruh bagiannya dibangun, dirilis, dan dijalankan sebagai satu unit. Dibaca "monolit". Kata ini menggambarkan **cara ia dikemas dan dijalankan**, bukan mutu kodenya. Monolit bisa sangat rapi di dalam, dan sistem yang terpecah menjadi dua puluh layanan bisa sangat berantakan.',
        },
        {
          term: 'deployment unit (unit rilis)',
          meaning:
            'Sesuatu yang dibangun lalu dinaikkan ke server sebagai satu paket, misalnya satu image Docker atau satu folder hasil build. Dibaca "diploiment yunit". Cara menghitungnya paling gampang, lihat berapa banyak perintah deploy terpisah yang harus dijalankan untuk merilis versi baru seluruh aplikasi. Kalau satu, kamu punya satu unit rilis. Jumlah unit rilis adalah pembeda paling jelas antara monolit dan bentuk terdistribusi, dan sekaligus penentu paling besar terhadap kerumitan operasionalnya.',
        },
        {
          term: 'in-process call (panggilan dalam proses)',
          meaning:
            'Pemanggilan fungsi biasa yang terjadi di dalam satu proses yang sama, tanpa melewati jaringan. Dibaca "in-proses kol". Ini `hitungTotal(pesanan)` yang biasa kamu tulis setiap hari. Sifatnya sangat berbeda dari panggilan lewat jaringan. Bandingkan angkanya, panggilan dalam proses selesai dalam hitungan nanodetik dan tidak pernah gagal karena kabel, sedangkan panggilan lewat jaringan butuh milidetik dan bisa gagal karena ratusan sebab yang tidak kamu kendalikan.',
        },
        {
          term: 'modular',
          meaning:
            'Sifat kode yang terbagi menjadi bagian-bagian dengan batas jelas dan pintu masuk resmi. Dibaca "modular". Ini sifat **internal** yang sama sekali tidak berhubungan dengan jumlah unit rilis, sehingga monolit bisa modular dan kumpulan layanan bisa tidak modular.',
        },
        {
          term: 'vertical slice (irisan tegak)',
          meaning:
            'Cara membagi kode mengikuti fitur dari ujung ke ujung, yaitu satu fitur membawa serta tampilan, rute, aturan, dan penyimpanannya. Dibaca "vertikal slais". Analoginya kue lapis, yaitu kamu bisa membaginya mendatar per lapisan sehingga tiap orang dapat satu lapisan saja, atau membaginya tegak sehingga tiap orang dapat potongan berisi semua lapisan. Pembagian tegak membuat satu perubahan bisnis tinggal di satu tempat, karena orang yang mengurus fitur pesanan memegang seluruh lapisan fitur itu.',
        },
        {
          term: 'scale out (menambah salinan)',
          meaning:
            'Menambah kapasitas dengan menjalankan lebih banyak salinan aplikasi yang sama di belakang load balancer. Dibaca "skeil aut". Monolit bisa di-scale out selama ia stateless, dan sub-bab [server stateless](/kelas/system-design/blok-penyusun/server-stateless) sudah menjelaskan syaratnya.',
        },
      ),

      h2('Apa yang sebenarnya dikeluhkan orang'),
      p(
        'Ketika seseorang mengeluhkan monolit, keluhannya hampir tidak pernah tentang jumlah unit rilis. Kalau ditelusuri, keluhannya biasanya salah satu dari lima ini, dan yang menarik adalah tidak satu pun disebabkan oleh monolitnya.',
      ),
      table(
        ['Keluhan', 'Penyebab sebenarnya', 'Butuh pemecahan?'],
        [
          [
            'Mengubah satu bagian merusak bagian lain yang tidak berhubungan',
            'Tidak ada batas modul. Semua bagian bisa memanggil semua bagian',
            'Tidak. Butuh batas',
          ],
          [
            'Butuh dua jam untuk tahu di mana sebuah aturan ditulis',
            'Cohesion rendah, kode satu fitur tersebar di banyak folder',
            'Tidak. Butuh irisan tegak',
          ],
          [
            'Test berjalan sangat lama sehingga jarang dijalankan',
            'Aturan bisnis terikat pada database dan HTTP',
            'Tidak. Butuh pembalikan ketergantungan',
          ],
          [
            'Satu bagian butuh mesin jauh lebih besar daripada sisanya',
            'Beban memang timpang. Menambah salinan berarti menambah semuanya',
            'Mungkin ya, tapi cukup satu bagian saja',
          ],
          [
            'Dua tim saling menunggu jadwal rilis',
            'Satu unit rilis dipakai bersama dua pihak yang punya jadwal berbeda',
            'Ya, kalau jadwalnya memang benar-benar berbeda',
          ],
        ],
        'Tiga keluhan pertama diselesaikan tanpa memecah apa pun, dan itulah keluhan yang paling sering terdengar.',
      ),
      p(
        'Tiga baris pertama itu penting sekali. Ketiganya adalah keluhan tentang **struktur internal**, dan memecah aplikasi tidak menyelesaikan satu pun di antaranya. Kalau batas modul kabur di dalam satu aplikasi, memecahnya menjadi lima layanan hanya mengubah kekacauan yang bisa di-debug dengan breakpoint menjadi kekacauan yang butuh trace terdistribusi.',
      ),
      callout(
        'warning',
        'Memecah tidak pernah menciptakan batas',
        'Ini kalimat terpenting di seluruh bab. Pemecahan hanya **memindahkan** batas yang sudah ada ke bentuk yang lebih mahal. Kalau batasnya belum ada, yang kamu pindahkan adalah kekusutannya, dan sekarang kekusutan itu melewati jaringan.',
      ),

      h2('Yang benar-benar dibeli monolit'),
      p(
        'Monolit bukan pilihan darurat sambil menunggu mampu memecah. Ia punya keunggulan nyata yang hilang begitu sistem menjadi terdistribusi, dan keunggulan itu pantas disebut terang-terangan.',
      ),
      table(
        ['Yang dimiliki monolit', 'Yang hilang saat dipecah'],
        [
          [
            'Panggilan antar bagian nyaris tanpa biaya dan tidak bisa gagal',
            'Setiap panggilan berubah menjadi permintaan jaringan yang bisa lambat, gagal, atau terulang',
          ],
          [
            'Transaksi database menjangkau beberapa bagian sekaligus',
            'Konsistensi lintas layanan butuh saga dan kompensasi. Dibahas di Bab 3 sub-bab 5',
          ],
          [
            'Menelusuri bug cukup dengan breakpoint dan stack trace',
            'Butuh trace terdistribusi supaya satu permintaan bisa diikuti lintas proses',
          ],
          [
            'Perubahan yang merusak langsung terlihat saat compile',
            'Perubahan kontrak baru terasa saat berjalan, di layanan lain, mungkin di lingkungan lain',
          ],
          [
            'Satu pipeline, satu rilis, satu rollback',
            'Beberapa pipeline yang urutan rilisnya harus dipikirkan',
          ],
          [
            'Menjalankan seluruh sistem di laptop cukup satu perintah',
            'Butuh beberapa proses hidup bersamaan, atau tiruan untuk yang tidak dijalankan',
          ],
        ],
        'Setiap baris kanan adalah biaya yang dibayar terus-menerus, bukan sekali saat pemecahan.',
      ),
      p(
        'Baris keempat sering diremehkan padahal dampaknya paling terasa sehari-hari. Di monolit, mengganti nama sebuah field dan lupa memperbarui satu pemanggil akan gagal saat `npm run type-check`. Di sistem terpisah, kesalahan yang sama lolos sampai produksi lalu muncul sebagai error di layanan lain yang tidak kamu sentuh sama sekali.',
      ),

      h2('Monolit yang baik terlihat seperti apa'),
      p(
        'Monolit yang baik punya ciri yang bisa diperiksa, bukan sekadar terasa rapi. Enam ciri berikut sudah cukup dan tidak satu pun menuntut teknologi tambahan.',
      ),
      ol(
        'Kode dibagi menurut bagian bisnis lebih dulu, baru menurut lapisan teknis di dalamnya.',
        'Setiap bagian bisnis punya satu pintu masuk resmi, dan isinya yang lain tidak diimpor dari luar.',
        'Setiap tabel dimiliki tepat satu bagian, dan bagian lain memintanya lewat pintu resmi.',
        'Aturan bisnis tidak menyentuh `req`, `res`, maupun objek ORM secara langsung.',
        'Aplikasinya stateless sehingga bisa dijalankan beberapa salinan sekaligus.',
        'Ada aturan impor yang ditegakkan linter, bukan sekadar kesepakatan lisan.',
      ),
      code(
        'text',
        `
        src/
          pesanan/              <- bagian bisnis
            index.ts            <- SATU-SATUNYA yang boleh diimpor dari luar
            rute.ts
            layanan.ts
            penyimpanan.ts
            domain.ts
          katalog/
            index.ts
            ...
          pembayaran/
            index.ts
            ...
          bersama/              <- hanya yang benar-benar dipakai semua
            db.ts
            logger.ts
          server.ts             <- composition root, merakit semuanya
        `,
        {
          caption:
            'Satu unit rilis, batas yang jelas di dalamnya. Inilah bentuk yang cocok untuk sebagian besar aplikasi.',
        },
      ),
      code(
        'ts',
        `
        // src/pesanan/index.ts
        // Pintu masuk resmi. Apa pun yang tidak ada di sini adalah urusan dalam modul Pesanan.

        export { rutePesanan } from './rute';
        export { buatLayananPesanan } from './layanan';
        export type { Pesanan, RingkasanPesanan } from './domain';

        // Sengaja TIDAK diekspor:
        // - penyimpanan.ts   (modul lain tidak perlu tahu data pesanan disimpan bagaimana)
        // - bentuk baris tabel (nama kolom bebas berubah tanpa memberi tahu siapa pun)
        `,
        {
          filename: 'src/pesanan/index.ts',
          caption:
            'Komentar tentang yang sengaja tidak diekspor sama pentingnya dengan daftar ekspornya.',
        },
      ),

      h2('Sampai kapan monolit cukup'),
      p(
        'Pertanyaan yang wajar berikutnya adalah sampai kapan bentuk ini bertahan. Jawaban jujurnya, jauh lebih lama daripada yang biasa dibayangkan. Sub-bab [dari satu server](/kelas/system-design/blok-penyusun/dari-satu-server) sudah menunjukkan bahwa satu aplikasi di belakang load balancer bisa melayani beban yang sangat besar.',
      ),
      p(
        'Batasnya bukan jumlah pengguna, melainkan tiga hal yang tidak bisa diselesaikan dengan menambah salinan.',
      ),
      steps(
        {
          title: 'Jadwal rilis yang benar-benar harus berbeda',
          body: 'Bukan sekadar tidak nyaman menunggu, melainkan ada bagian yang harus rilis beberapa kali sehari sementara bagian lain hanya boleh rilis sebulan sekali karena alasan kepatuhan atau risiko. Kalau semuanya bisa rilis bersamaan tanpa merugikan, pemecahan tidak membeli apa pun.',
        },
        {
          title: 'Kebutuhan sumber daya yang timpang jauh',
          body: 'Satu bagian butuh memori sangat besar atau prosesor sangat kuat sementara sisanya ringan. Menambah salinan monolit berarti menambah semuanya, dan itu membayar mahal untuk kapasitas yang tidak dipakai. Jawabannya biasanya menarik keluar satu bagian itu saja, bukan memecah semuanya.',
        },
        {
          title: 'Kebutuhan teknologi yang benar-benar berbeda',
          body: 'Satu bagian jauh lebih baik dikerjakan dengan bahasa atau runtime lain, misalnya pemrosesan gambar berat atau perhitungan numerik. Ini alasan yang sah, tetapi jauh lebih jarang daripada yang biasa diklaim.',
        },
      ),
      callout(
        'tip',
        'Tiga alasan itu tidak berlaku untuk sebagian besar aplikasi',
        'Aplikasi internal perusahaan, toko online skala menengah, aplikasi kursus, dan hampir semua aplikasi yang dikerjakan satu tim tidak mengalami satu pun dari ketiganya. Untuk aplikasi seperti itu, monolit modular bukan tahap sementara. Ia bentuk akhir yang benar.',
      ),

      h2('Rangkuman'),
      ul(
        'Monolit berarti satu unit rilis, dan itu tidak berkata apa-apa tentang mutu kodenya.',
        'Tiga dari lima keluhan tentang monolit adalah keluhan struktur internal yang tidak diselesaikan dengan memecah.',
        'Memecah tidak pernah menciptakan batas, ia hanya memindahkan batas yang sudah ada ke bentuk yang lebih mahal.',
        'Yang dibeli monolit yaitu panggilan tanpa biaya, transaksi lintas bagian, debugging sederhana, dan kesalahan yang terlihat saat compile.',
        'Monolit yang baik punya enam ciri yang bisa diperiksa, dan tidak satu pun menuntut teknologi tambahan.',
        'Batasnya adalah jadwal rilis yang berbeda, kebutuhan sumber daya yang timpang, dan kebutuhan teknologi yang berbeda.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Monolit yang ditulis dengan baik bukan tahap yang harus dilewati sebelum arsitektur yang sesungguhnya. Ia bentuk yang tepat untuk sebagian besar sistem, dan yang membedakannya dari bola lumpur bisa diukur.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini, sebuah monolit:

          berkas TypeScript    : 116
          sisi ketergantungan  : 337
          rata-rata per berkas : 2,9

          sisi per lapisan, 12 dari 13 kelompok mengikuti arah
          yang diharapkan:
            110  content -> lib
             40  app     -> lib
             36  app     -> components
             32  components -> lib
              1  lib     -> content      <- satu-satunya yang melawan

          siklus ketergantungan: 3, seluruhnya pasangan
          halaman-server dan komponen-klien di Next.js
        `,
        {
          caption:
            'Angka-angka itu yang membedakan monolit terjaga dari bola lumpur. Keduanya terlihat sama dari luar.',
        },
      ),
      p(
        'Yang dibeli monolit bisa dinyatakan sebagai angka juga, dan sebagian besarnya berupa hal yang tidak ada.',
      ),
      code(
        'text',
        `
        Yang TIDAK dibayar monolit, dengan angka dari bab lain:

          panggilan jaringan antar modul
            diukur: loopback 1,69 ms, internet p50 70,04 ms
            di monolit: pemanggilan fungsi, puluhan nanodetik

          ketersediaan berantai
            dihitung: 10 komponen @ 99,9% -> 99,0045% (87,2 jam/tahun)
            di monolit: satu komponen

          transaksi lintas layanan
            di monolit: satu transaksi basis data, dan itu saja

          konsistensi akhir
            diuji: saat beban tulis besar, 8 dari 8 pembacaan
            sesudah penulisan GAGAL di replika
            di monolit dengan satu basis data: tidak ada masalah ini

        Keempatnya adalah biaya yang HANYA muncul setelah dipecah.
        `,
      ),
      p(
        'Yang membuat monolit tetap sehat adalah batas internal yang ditegakkan, dan penegakannya tidak memerlukan proses terpisah.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini, fitness function yang
        dijalankan terhadap graf impornya:

          GAGAL  lib tidak boleh bergantung pada content (1)
          LULUS  components tidak boleh bergantung pada app
          LULUS  content tidak boleh bergantung pada components
          GAGAL  tidak ada siklus ketergantungan (3)
          LULUS  tidak ada berkas di atas 400 KB

        Lima aturan, sekitar tiga puluh baris kode, dijalankan
        bersama test lainnya. Itu seluruh mesin penegakan yang
        dibutuhkan sebuah monolit untuk tidak menjadi bola lumpur.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Monolit menjadi bola lumpur secara bertahap, dan gejalanya muncul jauh sebelum ada yang menyebutnya masalah arsitektur.',
      ),
      code(
        'text',
        `
        Gejala, berurutan dari yang paling awal:

          "Menambah satu field menyentuh tujuh berkas"
          "Test modul A merah karena perubahan di modul B"
          "Import ini menyebabkan siklus"
          "Tidak bisa menguji ini tanpa menyalakan basis data"
          "Tidak ada yang berani menyentuh modul itu"
          "Build-nya makan waktu sepuluh menit"

        Yang pertama bisa dihitung hari ini: ambil satu perubahan
        nyata dari riwayat git, lalu hitung berkas yang tersentuh.
        `,
      ),
      p(
        'Gejala terakhir punya bentuknya sendiri, dan pada project ini ia bahkan sempat menjadi kegagalan build yang nyata.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini:

          format:check     3.691 ms
          lint             6.021 ms
          type-check       2.403 ms
          test             7.184 ms
          build           64.834 ms

        Dan pada satu titik, build-nya GAGAL: beberapa halaman
        melewati batas 60 detik saat prarender, termasuk halaman
        yang tidak disentuh.

        Dugaan pertama: ada halaman yang berat.

        Yang diukur:
          rata-rata per halaman :  14 ms
          halaman yang gagal    :  30 ms
          satu halaman yang gagal tidak punya blok kode sama sekali
          CPU 4, swap 0, memori tersisa ~1,1 GB
          load average          : 12,84 pada mesin 4 CPU

        Satu perubahan, satu variabel:
          CIRCLE_NODE_TOTAL=2 npm run build -> EXIT=0, 15,9 detik

        Bukan monolitnya yang terlalu besar. Ketiga worker-nya
        berebut memori pada mesin tanpa swap.
        `,
        {
          caption:
            'Build yang lambat sering disalahkan pada ukuran monolit, dan sering bukan itu penyebabnya.',
        },
      ),
      p(
        'Kesalahan yang berlawanan juga nyata, yaitu memecah monolit karena gejala yang sebenarnya menuntut perbaikan lain.',
      ),
      code(
        'text',
        `
        Gejala yang SERING dikira menuntut pemecahan, dan tidak:

          "Query-nya lambat"
            diukur: agregasi 468,9 ms -> kolom denormalisasi 0,068 ms
            memecahnya menjadi empat layanan menghasilkan empat
            query lambat, bukan satu query cepat

          "Build-nya lambat"
            diukur di atas: penyebabnya pertentangan memori,
            bukan ukuran codebase

          "Deploy-nya menakutkan"
            yang dibutuhkan pipeline, rollback yang teruji, dan
            saklar fitur — bukan memecah sistem

          "Kodenya berantakan"
            batas internal yang ditegakkan menyelesaikannya tanpa
            satu pun panggilan jaringan
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Monolit sering diperlakukan sebagai sesuatu yang memalukan, dan itu menghasilkan keputusan yang mahal tanpa alasan yang bisa diukur.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memecah monolit karena "sudah besar"',
            'Katanya tidak bisa menskala',
            'Dihitung, 10 komponen berantai @ 99,9% menghasilkan 87,2 jam mati per tahun. Ukur dulu penghambatnya',
          ],
          [
            'Membiarkan batas internal tanpa penegakan',
            'Strukturnya sudah rapi',
            'Diukur, satu sisi `lib -> content` dan tiga siklus menyelinap masuk tanpa ada yang menyadarinya',
          ],
          [
            'Memecah karena query-nya lambat',
            'Bebannya kan terbagi',
            'Diukur, satu perubahan query mengubah 468,9 ms menjadi 0,068 ms tanpa satu pun komponen baru',
          ],
          [
            'Memecah karena build-nya lambat',
            'Codebase-nya terlalu besar',
            'Diukur pada project ini, penyebabnya pertentangan memori. Mengurangi worker menyelesaikannya',
          ],
          [
            'Menganggap monolit berarti satu berkas besar',
            'Namanya juga monolit',
            'Diukur, project ini 116 berkas dengan 12 dari 13 kelompok sisi mengikuti arah lapisan',
          ],
          [
            'Menunda memasang fitness function sampai nanti',
            'Sekarang masih kecil',
            'Penyimpangan tumbuh diam-diam. Tiga puluh baris kode hari ini jauh lebih murah daripada nanti',
          ],
        ],
      ),
      p(
        'Monolit yang ditulis dengan baik menyimpan satu keunggulan yang jarang disebut, yaitu bahwa memecahnya nanti tetap mungkin dan relatif murah. Batas modul yang sudah ditegakkan di dalam satu proses adalah batas yang sama yang akan menjadi batas layanan bila suatu saat pemecahan benar-benar diperlukan. Urutan sebaliknya, yaitu memecah lebih dulu lalu mencari batas yang benar, jauh lebih mahal.',
      ),
      references(
        {
          label: 'Architecture styles',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/',
          source: 'Microsoft',
          note: 'Perbandingan gaya beserta tantangan masing-masing, termasuk kapan bentuk sederhana masih tepat.',
        },
        {
          label: 'Web-Queue-Worker architecture style',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/web-queue-worker',
          source: 'Microsoft',
          note: 'Bentuk satu langkah di atas monolit polos, tanpa masuk ke wilayah terdistribusi.',
        },
        {
          label: 'The Twelve-Factor App',
          href: 'https://12factor.net/',
          source: '12factor.net',
          note: 'Syarat yang membuat satu unit rilis bisa dijalankan dalam banyak salinan dengan aman.',
        },
      ),
    ],
  ),

  written(
    'modular-monolith',
    'Modular Monolith',
    21,
    'Batas setegas microservice, operasional sesederhana monolit.',
    [
      p(
        'Kembali ke analogi rumah dari sub-bab sebelumnya. Ada rumah satu ruangan besar tanpa sekat, tempat kasur, kompor, dan meja kerja bercampur di satu tempat. Ada juga rumah dengan luas yang sama persis, tetapi bersekat menjadi kamar tidur, dapur, dan ruang kerja, masing-masing dengan pintunya sendiri.',
      ),
      p(
        'Keduanya sama-sama satu rumah, satu alamat, satu pintu depan. Yang membedakan hanya ada tidaknya sekat di dalam. Dan perbedaan itu menentukan apakah kamu bisa memasak tanpa membuat kasurmu berbau bawang.',
      ),
      p(
        'Sub-bab sebelumnya menyimpulkan bahwa sebagian besar keluhan tentang monolit sebenarnya keluhan tentang tidak adanya sekat. **Modular monolith** adalah jawaban langsung atas kesimpulan itu, yaitu satu unit rilis dengan batas internal yang ditegakkan sungguhan.',
      ),
      p(
        'Kata "ditegakkan sungguhan" itu yang membedakannya dari sekadar folder yang rapi. Sekat yang hanya digambar di lantai pakai kapur akan dilangkahi orang. Sekat yang berupa tembok tidak. Bentuk ini pantas mendapat perhatian lebih daripada yang biasa ia dapat, karena ia menyelesaikan hampir semua alasan orang ingin memecah aplikasi, sambil tidak membayar satu pun harga sistem terdistribusi. Untuk sebagian besar pembaca kurikulum ini, inilah bentuk yang benar.',
      ),

      terms(
        {
          term: 'modular monolith',
          meaning:
            'Satu unit rilis yang di dalamnya terbagi menjadi modul-modul dengan batas tegas, masing-masing memiliki datanya sendiri dan mengekspos permukaan yang sengaja dirancang. Dibaca "modular monolit". Bedanya dengan monolit biasa bukan pada jumlah folder, melainkan pada adanya penegakan yang membuat batas itu tidak bisa ditembus diam-diam.',
        },
        {
          term: 'public interface (permukaan publik)',
          meaning:
            'Bagian modul yang sengaja disediakan untuk dipakai modul lain, biasanya berupa berkas `index.ts` beserta tipe yang diekspor darinya. Ini pintu resmi ruangan tadi. Segala sesuatu di luar daftar itu adalah urusan dalam yang bebas diubah kapan saja tanpa memberi tahu siapa pun. Cara mengingatnya, apa pun yang tertulis `export` di `index.ts` adalah janji kepada modul lain, dan janji itu tidak boleh diingkari sembarangan. Yang tidak tertulis di sana bukan janji, jadi bebas diubah.',
        },
        {
          term: 'schema per module',
          meaning:
            'Cara memisahkan kepemilikan data di dalam satu database, yaitu tiap modul punya schema sendiri dan hanya boleh membaca serta menulis tabel di schema miliknya. Dibaca "skima per modul". Schema di PostgreSQL kira-kira seperti folder di dalam database, yaitu satu database bisa berisi beberapa schema, dan tiap schema berisi tabelnya sendiri. Akibatnya nama tabel menjadi `pesanan.pesanan` dan `katalog.produk`, sehingga siapa pemilik sebuah tabel langsung terbaca dari nama yang ditulis di query.',
        },
        {
          term: 'architecture test (test arsitektur)',
          meaning:
            'Test yang menguji bentuk kode, bukan perilakunya, misalnya test yang gagal ketika modul A mengimpor berkas dalam modul B. Dibaca "arsitektur test". Bedanya dengan test biasa perlu ditegaskan supaya tidak bingung. Test biasa **menjalankan** kodemu lalu memeriksa hasilnya. Test arsitektur **membaca** kodemu sebagai teks lalu memeriksa bentuknya, mirip seperti mencari kata dengan `grep`. Kegunaannya adalah mengubah aturan yang tadinya hanya kesepakatan lisan menjadi sesuatu yang benar-benar gagal di CI.',
        },
        {
          term: 'seam (jahitan)',
          meaning:
            'Titik di dalam kode tempat perilaku bisa diganti tanpa mengubah kode di sekitarnya. Dibaca "sim". Istilahnya diambil dari jahitan pada baju, yaitu tempat kain disambung, dan sekaligus satu-satunya tempat baju bisa dibuka lalu disambung ulang tanpa merusak kainnya. Permukaan publik sebuah modul adalah seam, dan itulah yang membuat modul bisa ditarik keluar menjadi layanan tanpa membongkar pemanggilnya, karena pemanggilnya sudah terbiasa lewat jahitan itu.',
        },
        {
          term: 'internal event (peristiwa internal)',
          meaning:
            'Pemberitahuan yang dikirim sebuah modul ketika sesuatu terjadi di dalamnya, tanpa modul itu tahu siapa yang mendengarkan. Bentuk ini menurunkan coupling lebih jauh lagi, karena pengirim tidak perlu mengimpor siapa pun. Dibahas tuntas di Bab 3 sub-bab 3.',
        },
      ),

      h2('Tiga tingkat penegakan'),
      p(
        'Yang membedakan modular monolith dari monolit yang folder-nya kebetulan rapi adalah penegakan. Ada tiga tingkat, dan kamu bisa memilih sesuai kebutuhan tanpa harus langsung mengambil yang paling ketat.',
      ),
      table(
        ['Tingkat', 'Cara', 'Ketat?', 'Biaya memasang'],
        [
          [
            '1. Kesepakatan',
            'Ditulis di README dan diingatkan saat review',
            'Longgar. Akan ditembus saat tenggat',
            'Nyaris nol',
          ],
          [
            '2. Ditegakkan linter',
            'Aturan `no-restricted-imports` yang gagal di CI',
            'Cukup ketat. Pelanggaran terlihat sebelum merge',
            'Beberapa puluh baris konfigurasi',
          ],
          [
            '3. Ditegakkan compiler dan database',
            'Paket terpisah di workspace, plus schema per modul dengan izin terpisah',
            'Sangat ketat. Nyaris mustahil ditembus tanpa sengaja',
            'Beberapa jam penyiapan awal',
          ],
        ],
        'Tingkat 2 adalah titik yang paling sepadan untuk sebagian besar project.',
      ),
      p(
        'Sebagian besar tim berhenti di tingkat satu, lalu heran kenapa batasnya perlahan hilang. Penyebabnya bukan kurang disiplin. Penyebabnya adalah menembus batas selalu lebih cepat daripada mengikutinya, dan di bawah tenggat pilihan yang lebih cepat selalu menang. Karena itu tingkat dua layak dipasang sejak awal.',
      ),

      h2('Menegakkan lewat linter'),
      p(
        'Bentuk paling praktis adalah melarang impor yang menembus pintu masuk resmi. Konfigurasi berikut memakai ESLint yang sudah dipakai project ini.',
      ),
      code(
        'js',
        `
        // eslint.config.mjs
        const modul = ['pesanan', 'katalog', 'pembayaran', 'pengguna'];

        // Setiap modul boleh mengimpor index.ts modul lain, tidak boleh isinya.
        const aturanLintasModul = modul.map((nama) => ({
          files: [\`src/\${nama}/**/*.ts\`],
          rules: {
            'no-restricted-imports': [
              'error',
              {
                patterns: [
                  {
                    group: modul
                      .filter((lain) => lain !== nama)
                      .map((lain) => \`**/\${lain}/*\`),
                    message:
                      'Antar modul hanya lewat pintu masuk resmi, yaitu import dari "@/<modul>".',
                  },
                ],
              },
            ],
          },
        }));

        export default [...aturanLintasModul];
        `,
        {
          filename: 'eslint.config.mjs',
          caption: 'Impor ke `@/katalog` diizinkan, impor ke `@/katalog/penyimpanan` gagal di CI.',
        },
      ),
      p(
        'Efeknya langsung terasa. Ketika seseorang butuh data katalog dari modul pesanan, ia tidak bisa lagi mengambil jalan pintas ke penyimpanan katalog. Ia harus meminta modul katalog menyediakan fungsi resmi, dan permintaan itulah yang membuat batasnya tetap sadar dan sengaja.',
      ),

      h2('Memisahkan kepemilikan data'),
      p(
        'Batas kode saja belum cukup, karena coupling lewat database tidak terlihat sebagai impor. Sub-bab 1.4 sudah menyebutnya sebagai bentuk paling erat. Di modular monolith, pemisahannya bisa dilakukan tanpa memisahkan database.',
      ),
      code(
        'sql',
        `
        -- Satu database, beberapa schema. Tiap modul memiliki schema-nya sendiri.
        CREATE SCHEMA pesanan;
        CREATE SCHEMA katalog;
        CREATE SCHEMA pembayaran;

        CREATE TABLE pesanan.pesanan (
          id            uuid PRIMARY KEY,
          id_pembeli    uuid NOT NULL,
          total_rupiah  bigint NOT NULL,
          status        text NOT NULL,
          dibuat_pada   timestamptz NOT NULL DEFAULT now()
        );

        CREATE TABLE katalog.produk (
          id            uuid PRIMARY KEY,
          nama          text NOT NULL,
          harga_rupiah  bigint NOT NULL
        );

        -- Tidak ada foreign key dari pesanan.pesanan ke katalog.produk.
        -- Modul pesanan menyimpan id produk beserta salinan harga saat pembelian,
        -- karena harga yang berlaku saat itu adalah fakta milik pesanan, bukan milik katalog.
        `,
        {
          filename: 'migrations/001-schema-per-modul.sql',
          caption:
            'Batas data terlihat langsung dari nama schema, dan pelanggarannya terlihat di query.',
        },
      ),
      p(
        'Komentar di bagian bawah menjelaskan keputusan yang sering diperdebatkan. Menghapus foreign key antar modul terasa seperti melepas jaring pengaman, dan memang benar begitu. Yang dibeli adalah kebebasan modul katalog mengubah tabelnya tanpa memikirkan modul pesanan, ditambah kemungkinan menarik salah satunya keluar nanti tanpa membongkar relasi database.',
      ),
      callout(
        'info',
        'Salinan harga bukan denormalisasi yang malas',
        'Menyimpan `harga_saat_beli` di baris pesanan bukan duplikasi data yang buruk. Harga yang berlaku saat pembelian adalah **fakta historis milik pesanan**, dan ia memang tidak boleh ikut berubah ketika katalog menaikkan harga besok. Ini contoh bahwa batas modul yang benar sering memperjelas arti data, bukan sekadar memisahkannya.',
      ),
      p(
        'Kalau database yang dipakai tidak mendukung schema terpisah dengan nyaman, awalan nama tabel sudah cukup untuk memulai, misalnya `pesanan_pesanan` dan `katalog_produk`. Yang penting bukan mekanismenya melainkan kejelasan siapa pemiliknya.',
      ),

      h2('Modul bicara dengan modul'),
      p(
        'Setelah batas tegak, muncul pertanyaan praktis, yaitu bagaimana modul pesanan mendapat nama produk untuk ditampilkan di rincian pesanan. Ada tiga cara, dan urutannya dari yang paling sederhana.',
      ),
      table(
        ['Cara', 'Bentuknya', 'Cocok ketika'],
        [
          [
            'Panggilan langsung ke permukaan publik',
            '`katalog.ambilRingkasan(idProduk)`',
            'Paling umum. Data dibutuhkan sekarang dan pemanggil menunggu jawabannya',
          ],
          [
            'Peristiwa internal',
            'Modul pesanan memancarkan `PesananDibayar`, modul lain mendengarkan',
            'Ketika pemancar tidak perlu tahu siapa yang peduli, dan pekerjaannya boleh terjadi setelahnya',
          ],
          [
            'Salinan data yang sengaja disimpan',
            'Nama dan harga produk ikut disimpan di baris pesanan',
            'Ketika nilainya adalah fakta historis yang memang tidak boleh berubah',
          ],
        ],
        'Ketiganya sah. Yang tidak sah hanya satu, yaitu membaca tabel milik modul lain secara langsung.',
      ),
      code(
        'ts',
        `
        // src/pesanan/layanan.ts
        import { ambilRingkasanProduk } from '@/katalog';   // pintu masuk resmi, bukan isinya

        export async function buatPesanan(idProduk: string, idPembeli: string) {
          const produk = await ambilRingkasanProduk(idProduk);
          if (!produk) return { jenis: 'produk-tidak-ada' } as const;

          // Harga disalin ke pesanan karena ia fakta saat transaksi terjadi.
          const pesanan = await penyimpanan.simpan({
            idPembeli,
            idProduk,
            namaProdukSaatBeli: produk.nama,
            hargaSaatBeli: produk.hargaRupiah,
            status: 'baru',
          });

          return { jenis: 'berhasil', pesanan } as const;
        }
        `,
        {
          filename: 'src/pesanan/layanan.ts',
          caption:
            'Panggilan biasa, tanpa jaringan, tanpa serialisasi, tanpa kemungkinan gagal karena timeout.',
        },
      ),
      p(
        'Perhatikan bahwa kode ini nyaris identik dengan versinya seandainya katalog adalah layanan terpisah. Perbedaannya hanya `await` yang tidak melewati jaringan dan tidak bisa gagal karena timeout. Kemiripan itu bukan kebetulan, melainkan justru yang membuat modul ini bisa ditarik keluar nanti tanpa membongkar pemanggilnya.',
      ),

      h2('Menjaganya lewat test'),
      p(
        'Selain linter, batas juga bisa dijaga test biasa yang membaca kode sebagai teks. Test seperti ini berjalan cepat dan menutup celah yang tidak tertangkap konfigurasi linter, misalnya impor dinamis.',
      ),
      code(
        'ts',
        `
        import { readFileSync } from 'node:fs';
        import { globSync } from 'node:fs';
        import { describe, expect, it } from 'vitest';

        const MODUL = ['pesanan', 'katalog', 'pembayaran', 'pengguna'];

        describe('batas modul', () => {
          it('tidak ada modul yang mengimpor isi modul lain', () => {
            const pelanggaran: string[] = [];

            for (const berkas of globSync('src/*/**/*.ts')) {
              const pemilik = berkas.split('/')[1];
              const isi = readFileSync(berkas, 'utf8');

              for (const lain of MODUL) {
                if (lain === pemilik) continue;
                // Diizinkan: from '@/katalog'.  Dilarang: from '@/katalog/penyimpanan'.
                if (new RegExp(\`from '@/\${lain}/\`).test(isi)) {
                  pelanggaran.push(\`\${berkas} menembus batas modul \${lain}\`);
                }
              }
            }

            expect(pelanggaran).toEqual([]);
          });
        });
        `,
        {
          filename: 'src/test/batas-modul.test.ts',
          caption:
            'Test yang menguji bentuk, bukan perilaku. Ia gagal di CI sebelum pelanggaran menyebar.',
        },
      ),

      h2('Kenapa bentuk ini sering menjadi jawaban akhir'),
      p(
        'Modular monolith punya sifat yang membuatnya tidak terasa sebagai kompromi. Ia menjawab keluhan yang nyata, sambil menyisakan pintu untuk berubah nanti kalau memang perlu.',
      ),
      ol(
        'Batas yang salah tetap murah diperbaiki, karena memindahkannya adalah refactor yang dijaga compiler dan test.',
        'Menarik satu modul keluar menjadi layanan nanti berarti mengganti isi satu berkas pintu masuk, karena pemanggilnya sudah menghormati permukaan itu.',
        'Tidak ada satu pun harga sistem terdistribusi yang dibayar sebelum manfaatnya benar-benar dibutuhkan.',
        'Tim baru tetap bisa menjalankan seluruh sistem di laptop dengan satu perintah.',
        'Kalau ternyata pemecahan tidak pernah dibutuhkan, tidak ada usaha yang terbuang, karena batas modul berguna dengan sendirinya.',
      ),
      callout(
        'tip',
        'Poin kelima adalah pembeda terbesarnya',
        'Bandingkan dengan memecah lebih awal. Kalau ternyata pemecahan tidak dibutuhkan, seluruh biaya operasionalnya sudah terlanjur dibayar dan tidak bisa diminta kembali. Modular monolith adalah satu-satunya bentuk yang tetap menguntungkan bahkan ketika tebakannya salah.',
      ),

      h2('Rangkuman'),
      ul(
        'Modular monolith adalah satu unit rilis dengan batas internal yang ditegakkan sungguhan.',
        'Ada tiga tingkat penegakan, dan tingkat linter adalah titik yang paling sepadan untuk sebagian besar project.',
        'Batas kode saja tidak cukup. Kepemilikan data dipisahkan lewat schema per modul atau awalan nama tabel.',
        'Modul bicara lewat panggilan ke permukaan publik, lewat peristiwa internal, atau lewat salinan data yang memang fakta historis.',
        'Test arsitektur menutup celah yang tidak tertangkap konfigurasi linter.',
        'Bentuk ini tetap menguntungkan bahkan kalau pemecahan tidak pernah terjadi, dan itu yang membedakannya dari memecah lebih awal.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Modular monolith adalah satu proses dengan batas internal yang ditegakkan. Yang membedakannya dari monolit biasa bukan strukturnya melainkan adanya sesuatu yang **memeriksa** batas itu secara otomatis.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini, sekitar tiga puluh baris
        kode yang menelusuri seluruh impor:

          LULUS  components tidak boleh bergantung pada app
          LULUS  content tidak boleh bergantung pada components
          LULUS  tidak ada berkas di atas 400 KB
          GAGAL  lib tidak boleh bergantung pada content (1 pelanggaran)
                 src/lib/curriculum/queries.ts -> src/content/curriculum/index.ts
          GAGAL  tidak ada siklus ketergantungan (3 pelanggaran)
                 src/app/dashboard-client.tsx -> src/app/page.tsx -> ...
                 src/app/latihan/latihan-client.tsx -> ...
                 src/app/roadmap/page.tsx -> ...

        Tanpa pemeriksaan itu, kelima aturan hanya hidup di kepala
        orang, dan dua di antaranya sudah dilanggar tanpa ada yang
        sengaja melanggarnya.
        `,
        {
          caption:
            'Selisih antara modular monolith dan monolit biasa adalah lima baris aturan yang dijalankan mesin.',
        },
      ),
      p(
        'Batas modul di dalam satu proses ditegakkan dengan tiga cara, dan ketiganya bisa dipakai bersamaan.',
      ),
      code(
        'text',
        `
        1. SATU PINTU MASUK per modul

           modul/pesanan/index.ts        <- satu-satunya yang boleh diimpor
           modul/pesanan/internal/...    <- tidak boleh diimpor dari luar

           Ditegakkan dengan aturan: tidak boleh ada impor ke jalur
           yang memuat "/internal/" dari luar modul itu.

        2. ARAH KETERGANTUNGAN

           Diukur pada project ini, 12 dari 13 kelompok sisi mengikuti
           arah yang diharapkan. Satu yang melawan langsung terlihat.

        3. KEPEMILIKAN DATA

           Modul pesanan tidak membaca tabel milik modul katalog
           secara langsung. Ia memintanya lewat pintu masuk modul itu.

           Ini yang paling sering dilanggar, dan paling mahal
           diperbaiki kemudian.
        `,
      ),
      p(
        'Poin ketiga itu yang membuat modular monolith bisa dipecah nanti bila memang diperlukan, dan tanpanya pemecahan menjadi jauh lebih mahal.',
      ),
      code(
        'text',
        `
        Bila modul berbagi tabel secara langsung:
          memecahnya menjadi layanan berarti memecah basis datanya,
          dan itu berarti setiap JOIN lintas modul harus ditulis
          ulang sebagai panggilan jaringan

          Diukur, biaya panggilan jaringan:
            loopback 1,69 ms melawan pemanggilan fungsi puluhan nanodetik
            internet p50 70,04 ms, p99 362,72 ms

        Bila modul sudah berbicara lewat pintu masuk:
          pemecahannya berarti mengganti pemanggilan fungsi menjadi
          panggilan jaringan DI SATU TEMPAT, yaitu pintu masuknya
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Batas modul di dalam satu proses tidak ditegakkan bahasa, dan itu berarti ia akan dilanggar kecuali ada yang memeriksanya.',
      ),
      code(
        'text',
        `
        Bentuk pelanggaran yang khas:

          import { hitungDiskon } from '@/modul/pesanan/internal/diskon';
            -> mengimpor bagian dalam modul lain

          import { db } from '@/modul/katalog/db';
            -> memakai koneksi basis data milik modul lain

          SELECT * FROM katalog_produk JOIN pesanan_item ...
            -> JOIN lintas modul, dan ini yang paling sulit dilihat
               sebab tidak muncul di graf impor sama sekali

        Yang ketiga hanya bisa ditangkap dengan memeriksa nama tabel
        yang disentuh tiap modul, bukan dengan menelusuri impor.
        `,
      ),
      p(
        'Kegagalan kedua berupa aturan yang ditulis dengan cara yang menghasilkan positif palsu, dan itu mematikan seluruh mekanismenya.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini. Aturan "tidak ada import
        paket luar di src/content", ditulis dua cara:

          aturan NAIF  (cocokkan teks "import ... from" di mana saja)
            259 "pelanggaran"

          aturan BENAR (hanya blok impor di AWAL berkas)
            0 pelanggaran

        Selisihnya seluruhnya POSITIF PALSU: kata "import" yang
        muncul di dalam CONTOH KODE yang ditulis sebagai teks materi.

        Fitness function yang menghasilkan 259 positif palsu akan
        dimatikan dalam seminggu, dan seluruh manfaatnya hilang.
        `,
        {
          caption:
            'Alat penegak batas harus lebih dipercaya daripada aturannya, atau ia akan diabaikan lebih dulu.',
        },
      ),
      p(
        'Kegagalan ketiga bersifat cakupan, yaitu membuat terlalu banyak modul sehingga batasnya menjadi penghalang.',
      ),
      code(
        'text',
        `
        Tanda modul terlalu banyak atau terlalu kecil:

          - satu fitur biasa menyentuh empat modul
          - banyak modul yang isinya satu atau dua berkas
          - pintu masuk modul hanya meneruskan tanpa menambah apa pun

        Uji penghapusan: bila modul ini dihapus dan isinya dipindah
        ke pemanggilnya, apakah kerumitannya HILANG atau MENYEBAR?

          hilang  -> modulnya memang tidak membeli apa-apa
          menyebar -> modulnya menanggung beban nyata

        Diukur pada project ini sebagai pembanding:
          116 berkas dikelompokkan menjadi 4 lapisan besar
          (app, components, lib, content), bukan puluhan modul kecil
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Modular monolith mudah dinyatakan dan sulit dijaga, sebab bahasa pemrogramannya sendiri tidak menolong.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat direktori per modul tanpa penegakan',
            'Strukturnya sudah terlihat',
            'Diukur, dua aturan dilanggar tanpa ada yang sengaja melanggarnya. Bahasa tidak menegakkannya',
          ],
          [
            'Mengizinkan impor ke bagian dalam modul lain',
            'Cuma satu fungsi kecil',
            'Setelah itu pintu masuk modul kehilangan artinya, dan pemecahan nanti menjadi jauh lebih mahal',
          ],
          [
            'Membiarkan modul berbagi tabel',
            'Basis datanya kan satu',
            'JOIN lintas modul tidak muncul di graf impor, dan ia yang paling mahal diperbaiki kemudian',
          ],
          [
            'Menulis aturan dengan pencocokan teks',
            'Lebih cepat ditulis',
            'Diukur, aturan naif menghasilkan 259 positif palsu. Ia akan dimatikan dalam seminggu',
          ],
          [
            'Membuat modul untuk setiap kelompok kecil',
            'Lebih terpisah lebih baik',
            'Satu fitur menyentuh empat modul. Pakai uji penghapusan sebelum membuat modul baru',
          ],
          [
            'Menganggap modular monolith tahap sementara',
            'Nanti pasti jadi microservice',
            'Untuk sebagian besar sistem ia bentuk akhirnya. Dan bila perlu dipecah, batasnya sudah siap',
          ],
        ],
      ),
      p(
        'Nilai sesungguhnya dari modular monolith baru terasa pada hari pemecahan benar-benar dipertimbangkan. Batas yang sudah ditegakkan di dalam satu proses adalah batas yang sudah terbukti bekerja, sudah punya pintu masuk yang jelas, dan sudah tidak berbagi data. Memecahnya menjadi pekerjaan mengganti pemanggilan fungsi dengan panggilan jaringan di satu tempat, bukan pekerjaan menemukan batas sambil memindahkan kode.',
      ),
      references(
        {
          label: 'Identifying microservice boundaries',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/microservices/model/microservice-boundaries',
          source: 'Microsoft',
          note: 'Cara menarik garis batas, berlaku sama persis untuk batas modul di dalam satu aplikasi.',
        },
        {
          label: 'no-restricted-imports',
          href: 'https://eslint.org/docs/latest/rules/no-restricted-imports',
          source: 'ESLint',
          note: 'Mekanisme penegakan tingkat dua yang dipakai di sub-bab ini.',
        },
        {
          label: 'Project references',
          href: 'https://www.typescriptlang.org/docs/handbook/project-references.html',
          source: 'TypeScript',
          note: 'Cara menegakkan batas di tingkat compiler kalau linter dirasa belum cukup ketat.',
        },
      ),
    ],
  ),

  written(
    'hexagonal-dan-clean',
    'Hexagonal dan Clean Architecture',
    21,
    'Tiga gaya berlapis yang sering dianggap berbeda, padahal menjawab satu keluhan yang sama.',
    [
      p(
        'Kalau kamu mencari materi arsitektur di internet, kamu akan bertemu tiga nama yang terlihat seperti tiga aliran bersaing, yaitu layered architecture, hexagonal architecture, dan clean architecture. Ditambah lagi ada onion architecture dan ports and adapters yang terdengar seperti dua nama lagi. Wajar kalau pemula merasa harus memilih salah satu dan takut memilih yang salah.',
      ),
      p(
        'Kabar baiknya, kamu tidak perlu memilih, karena ketiganya bukan aliran yang bersaing. Ketiganya menjawab **satu keluhan yang sama** dan memakai **satu mekanisme yang sama**.',
      ),
      p(
        'Keluhannya adalah aturan bisnis yang terlanjur menempel pada teknologi, misalnya aturan pembatalan pesanan yang tidak bisa dipakai di luar rute HTTP. Mekanismenya adalah pembalikan ketergantungan lewat interface, yang sudah kamu pelajari di sub-bab 1.6 lewat analogi colokan listrik.',
      ),
      p(
        'Jadi apa yang berbeda. Hanya dua hal, yaitu **kosakata** dan **seberapa jauh idenya dibawa**. Mirip seperti tiga orang menjelaskan cara menata dapur, yang satu menyebutnya rak dan laci, yang satu menyebutnya zona kering dan zona basah, yang satu menggambarnya sebagai lingkaran. Isinya sama, gambarnya beda.',
      ),

      terms(
        {
          term: 'hexagonal architecture',
          meaning:
            'Gaya yang menggambarkan aplikasi sebagai satu inti dikelilingi lubang-lubang penyambung. Dibaca "heksagonal", artinya bersegi enam. Satu hal yang sering membuat pemula bingung, **angka enam itu tidak punya arti apa pun**. Bukan berarti ada enam lapisan atau enam aturan. Bentuk segi enam hanya dipilih supaya gambarnya punya banyak sisi untuk menaruh lubang colokan. Nama resminya yang jauh lebih menjelaskan adalah **ports and adapters**, dan sebaiknya nama itu yang kamu ingat.',
        },
        {
          term: 'ports and adapters',
          meaning:
            'Nama yang lebih menjelaskan untuk hexagonal architecture. Port adalah lubang yang dinyatakan inti aplikasi berupa interface, adapter adalah steker yang mengisi lubang itu dengan teknologi tertentu. Satu port bisa punya beberapa adapter, misalnya port penyimpanan diisi adapter PostgreSQL di produksi dan adapter memori saat pengujian.',
        },
        {
          term: 'driving adapter (adapter penggerak)',
          meaning:
            'Adapter yang **memulai** pekerjaan, yaitu yang memanggil masuk ke inti aplikasi. Contohnya rute HTTP, pengerja antrean, perintah terminal, dan job terjadwal. Disebut juga primary adapter atau inbound adapter.',
        },
        {
          term: 'driven adapter (adapter yang digerakkan)',
          meaning:
            'Adapter yang **dipakai** oleh inti aplikasi untuk menjangkau dunia luar, yaitu database, pengirim email, gerbang pembayaran, dan penyimpanan berkas. Disebut juga secondary adapter atau outbound adapter. Inilah yang arah panahnya dibalik lewat interface.',
        },
        {
          term: 'clean architecture',
          meaning:
            'Gaya yang menyusun kode menjadi lingkaran berlapis dengan satu aturan tunggal, yaitu ketergantungan hanya boleh menunjuk ke dalam. Dibaca "klin arsitektur". Bayangkan bawang yang dibelah, yaitu ada lingkaran-lingkaran dari luar ke dalam. Lapisan terdalam berisi aturan bisnis murni yang tidak tahu apa-apa tentang dunia luar, lapisan terluar berisi kerangka kerja dan teknologi. Aturannya cuma satu dan mudah diingat, panah impor selalu menunjuk ke arah pusat, tidak pernah sebaliknya.',
        },
        {
          term: 'use case (kasus penggunaan)',
          meaning:
            'Satu tindakan lengkap yang bisa dilakukan seseorang terhadap sistem, misalnya "membatalkan pesanan" atau "mendaftarkan pengguna baru". Dibaca "yus keis". Cara mengenalinya, sebuah use case selalu bisa ditulis sebagai kalimat kerja yang dimengerti orang non-teknis. "Membatalkan pesanan" adalah use case. "Menyimpan baris ke tabel" bukan, karena itu langkah teknis di dalamnya. Di clean architecture tiap use case biasanya menjadi satu berkas tersendiri, sehingga isi foldernya terbaca seperti daftar kemampuan aplikasi.',
        },
        {
          term: 'entity (entitas)',
          meaning:
            'Objek domain yang punya identitas dan aturan yang melekat padanya, misalnya sebuah Pesanan yang tahu bahwa dirinya tidak boleh dibatalkan setelah dibayar. Dibaca "entiti". Bedanya dengan sekadar bentuk data begini. Bentuk data biasa hanya menyimpan `status: "dibayar"` lalu membiarkan setiap pemanggil memeriksa sendiri, dan pemanggil yang lupa memeriksa tidak akan ditegur siapa pun. Entitas menyimpan aturannya di dalam dirinya sebagai method `batalkan()`, sehingga mustahil membatalkan tanpa melewati pemeriksaannya.',
        },
        {
          term: 'framework independence',
          meaning:
            'Sifat ketika inti aplikasi tidak bergantung pada kerangka kerja tertentu sehingga bisa dipindahkan tanpa menulis ulang aturannya. Dibaca "freimwork independens", artinya kemerdekaan dari kerangka kerja. Manfaat ini sering dijual berlebihan di materi arsitektur, padahal berpindah dari Express ke kerangka kerja lain hampir tidak pernah terjadi dalam praktik. Manfaat yang benar-benar kamu rasakan tiap minggu justru dua hal lain, yaitu test yang berjalan dalam milidetik tanpa menyalakan apa pun, dan satu logika yang bisa dipanggil dari rute HTTP sekaligus dari job antrean tanpa disalin.',
        },
      ),

      h2('Satu keluhan, tiga kosakata'),
      p(
        'Tabel berikut menyandingkan istilah yang sebenarnya menunjuk hal yang sama. Menyadari kesamaannya membuat kamu bisa membaca materi mana pun tanpa merasa harus memilih aliran.',
      ),
      table(
        ['Peran', 'Layered', 'Hexagonal', 'Clean'],
        [
          [
            'Aturan bisnis murni',
            'Business logic layer',
            'Inti aplikasi',
            'Entities dan use cases',
          ],
          [
            'Kesepakatan bentuk yang dibutuhkan inti',
            'Interface repository',
            'Port',
            'Interface di lapisan use case',
          ],
          [
            'Kode yang memenuhi kesepakatan itu',
            'Data access layer',
            'Driven adapter',
            'Interface adapters dan frameworks',
          ],
          [
            'Pintu masuk permintaan',
            'Presentation layer',
            'Driving adapter',
            'Controllers di interface adapters',
          ],
          [
            'Aturan arahnya',
            'Dari atas ke bawah',
            'Dari luar ke dalam',
            'Selalu menunjuk ke dalam',
          ],
        ],
        'Baris terakhir memperlihatkan bahwa ketiganya menegakkan aturan yang sama dengan gambar yang berbeda.',
      ),
      p(
        'Perbedaan yang benar-benar ada hanya soal **seberapa jauh idenya dibawa**. Layered berhenti pada memisahkan tanggung jawab. Hexagonal menambahkan bahwa setiap sambungan ke luar adalah port yang bisa diisi adapter berbeda. Clean menambahkan lagi bahwa aturan bisnis paling inti sebaiknya tidak tahu apa pun, bahkan tidak tahu ada use case yang memakainya.',
      ),

      h2('Wujud hexagonal di satu modul'),
      p(
        'Cara tercepat memahami hexagonal adalah melihat daftar berkas satu modul yang menerapkannya. Perhatikan bahwa yang bertambah dibanding susunan biasa hanyalah kejelasan penamaan.',
      ),
      code(
        'text',
        `
        src/pesanan/
          domain/
            pesanan.ts            <- entitas dan aturannya, tidak mengimpor apa pun
          port/
            penyimpanan.ts        <- interface, dimiliki inti
            pengirim-notifikasi.ts
            gerbang-pembayaran.ts
          use-case/
            batalkan-pesanan.ts   <- memakai port, tidak tahu teknologi apa pun
            buat-pesanan.ts
          adapter/
            masuk/
              rute-http.ts        <- driving adapter
              pengerja-antrean.ts <- driving adapter kedua, logika yang sama
            keluar/
              penyimpanan-prisma.ts     <- driven adapter
              notifikasi-email.ts
              pembayaran-midtrans.ts
          index.ts                <- pintu masuk resmi modul
        `,
        {
          caption:
            'Folder `adapter/masuk` berisi dua pintu masuk yang memakai use case yang sama tanpa menyalin logika.',
        },
      ),
      p(
        'Susunan itu membuat satu hal langsung terlihat. Isi folder `use-case` adalah daftar kemampuan aplikasi yang bisa dibaca orang non-teknis. Isi folder `adapter` adalah daftar teknologi yang dipakai. Keduanya bisa berubah dengan alasan yang benar-benar berbeda, dan itulah pembenaran keberadaan dua folder itu.',
      ),
      compare(
        {
          title: 'Entitas anemik, aturan ada di luar',
          lang: 'ts',
          code: `
            export type Pesanan = {
              id: string;
              status: 'baru' | 'dibayar' | 'dibatalkan';
            };

            // Aturan hidup di pemanggil, dan setiap pemanggil harus mengingatnya sendiri.
            if (pesanan.status === 'dibayar') {
              return { jenis: 'sudah-dibayar' };
            }
            await penyimpanan.simpanStatus(pesanan.id, 'dibatalkan');
          `,
          notes: [
            'Pemanggil baru bisa lupa memeriksa',
            'Aturan yang sama tersebar di beberapa tempat',
            'Tidak ada satu tempat untuk membaca aturan pembatalan',
          ],
        },
        {
          title: 'Entitas membawa aturannya',
          lang: 'ts',
          code: `
            export class Pesanan {
              constructor(
                readonly id: string,
                private status: 'baru' | 'dibayar' | 'dibatalkan',
              ) {}

              batalkan(): { jenis: 'berhasil' } | { jenis: 'sudah-dibayar' } {
                if (this.status === 'dibayar') return { jenis: 'sudah-dibayar' };
                this.status = 'dibatalkan';
                return { jenis: 'berhasil' };
              }

              statusSekarang() {
                return this.status;
              }
            }
          `,
          notes: [
            'Mustahil membatalkan tanpa melewati aturannya',
            'Satu tempat untuk membaca dan mengubah aturan',
            'Tetap bisa diuji tanpa database sama sekali',
          ],
        },
      ),
      callout(
        'info',
        'Entitas berperilaku bukan kewajiban',
        'Untuk data yang memang hanya disimpan dan ditampilkan, bentuk sebelah kiri sudah tepat dan menambah kelas hanya menambah kerumitan. Bentuk sebelah kanan mulai membayar ketika sebuah data punya aturan yang harus selalu benar, dan aturan itu dipanggil dari lebih dari satu tempat.',
      ),

      h2('Manfaat yang benar dan yang dilebih-lebihkan'),
      p(
        'Materi tentang gaya-gaya ini sering menjual manfaat yang jarang terjadi, sementara manfaat yang benar-benar terasa justru kurang disebut. Ada baiknya memisahkan keduanya dengan jujur.',
      ),
      table(
        ['Manfaat yang dijanjikan', 'Sejujurnya', 'Seberapa sering terpakai'],
        [
          [
            'Bisa berganti database tanpa menyentuh aturan bisnis',
            'Benar secara teknis, tetapi berganti database jarang sekali terjadi',
            'Jarang',
          ],
          [
            'Bisa berganti kerangka kerja web',
            'Benar, tetapi berganti dari Express ke lainnya juga jarang',
            'Jarang',
          ],
          [
            'Aturan bisnis bisa diuji dalam milidetik tanpa infrastruktur',
            'Benar, dan inilah manfaat yang terasa setiap hari',
            'Sangat sering',
          ],
          [
            'Satu logika dipakai beberapa pintu masuk tanpa disalin',
            'Benar. Rute HTTP, job antrean, perintah terminal, dan webhook memakai use case yang sama',
            'Sering',
          ],
          [
            'Aturan bisnis bisa dibaca tanpa memahami teknologinya',
            'Benar, dan ini yang membuat orang baru cepat berguna',
            'Sering',
          ],
          [
            'Layanan luar bisa ditiru saat pengujian tanpa memanggilnya sungguhan',
            'Benar, dan ini menghemat biaya sekaligus mencegah test yang rapuh',
            'Sering',
          ],
        ],
        'Empat baris bawah adalah alasan sesungguhnya memakai gaya ini. Dua baris atas hanya bonus.',
      ),

      h2('Harga yang dibayar'),
      p(
        'Gaya ini bukan gratis, dan biayanya nyata. Menyebutnya di depan membuat kamu bisa memilih seberapa jauh mengambilnya.',
      ),
      ol(
        'Jumlah berkas bertambah. Satu use case sederhana bisa menyentuh empat berkas, dan untuk aplikasi kecil itu terasa berlebihan.',
        'Ada penerjemahan data di setiap batas. Bentuk tabel diterjemahkan menjadi bentuk domain, lalu menjadi bentuk respons. Sebagian terasa seperti pekerjaan menyalin.',
        'Menelusuri alur butuh melompat antar berkas, karena pemanggilnya lewat interface dan implementasinya baru ditentukan di composition root.',
        'Untuk endpoint yang hanya membaca lalu menampilkan, seluruh susunan ini murni menambah langkah tanpa melindungi apa pun.',
      ),
      callout(
        'tip',
        'Boleh dipakai sebagian, dan memang sebaiknya begitu',
        'Tidak ada aturan yang mewajibkan seluruh modul memakai susunan yang sama. Modul pembayaran yang penuh aturan pantas memakai bentuk penuh, sementara modul yang hanya menampilkan daftar artikel cukup rute dan penyimpanan. Menerapkan bentuk terberat di seluruh aplikasi adalah cara paling cepat membuat orang membencinya.',
      ),

      h2('Memilih di antara ketiganya'),
      p(
        'Karena ketiganya menjawab keluhan yang sama, memilihnya bukan soal benar atau salah melainkan soal seberapa jauh yang dibutuhkan.',
      ),
      table(
        ['Ambil ini', 'Kalau', 'Wujud nyatanya'],
        [
          [
            'Layered biasa',
            'Aplikasi sedang dan aturan bisnisnya belum banyak',
            'Rute, layanan, penyimpanan. Tiga berkas per modul',
          ],
          [
            'Hexagonal',
            'Ada beberapa pintu masuk, atau ada layanan luar yang perlu ditiru saat pengujian',
            'Tambahkan folder `port` dan `adapter`, pisahkan masuk dan keluar',
          ],
          [
            'Clean penuh',
            'Aturan bisnisnya rumit, berumur panjang, dan sering ditanyakan orang non-teknis',
            'Tambahkan entitas berperilaku dan satu berkas per use case',
          ],
        ],
        'Naik satu tingkat ketika keluhan yang sesuai muncul, bukan sebelum itu.',
      ),

      h2('Rangkuman'),
      ul(
        'Layered, hexagonal, dan clean menjawab keluhan yang sama dengan mekanisme yang sama, yaitu pembalikan ketergantungan.',
        'Yang berbeda hanya kosakata dan seberapa jauh idenya dibawa.',
        'Port adalah lubang yang dinyatakan inti, adapter adalah steker yang mengisinya dengan teknologi.',
        'Manfaat yang benar-benar terasa adalah test cepat dan pintu masuk bertambah, bukan berganti database.',
        'Harganya adalah bertambahnya berkas, penerjemahan di tiap batas, dan alur yang perlu dilompati saat ditelusuri.',
        'Boleh dipakai sebagian. Modul yang penuh aturan memakai bentuk penuh, modul yang hanya menampilkan tidak perlu.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Hexagonal dan Clean Architecture menyelesaikan satu masalah yang sama, yaitu membuat logika bisnis tidak bergantung pada hal-hal yang ada di luarnya. Yang dibeli dan yang dibayar keduanya bisa diukur.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini, satu sisi yang melawan arah:

          src/lib/curriculum/queries.ts -> src/content/curriculum/index.ts

        Akibatnya:
          - queries.ts tidak bisa diuji tanpa memuat SELURUH kurikulum
          - menambah kategori berpotensi menyentuh queries.ts
          - modul itu tidak bisa dipakai ulang di konteks lain

        Itulah masalah yang diselesaikan pembalikan ketergantungan,
        dinyatakan pada satu berkas nyata alih-alih sebagai diagram.
        `,
      ),
      p(
        'Bentuk penyelesaiannya sering jauh lebih sederhana daripada yang dibayangkan dari diagram heksagon, yaitu mengubah impor menjadi parameter.',
      ),
      code(
        'ts',
        `
        // SEBELUM: lapisan dalam tahu dari mana datanya berasal.
        import { curriculum } from '@/content/curriculum';
        export function cariPelajaran(slug: string) { /* memakai curriculum */ }

        // SESUDAH: lapisan dalam menetapkan APA yang ia butuhkan.
        export function cariPelajaran(sumber: Kategori[], slug: string) { /* ... */ }

        // Test kini menyediakan datanya sendiri:
        //   cariPelajaran([kategoriUji], 'apa-pun')
        `,
      ),
      p(
        'Ketika yang dibutuhkan bukan data melainkan kemampuan, barulah antarmuka menjadi bentuk yang tepat, dan bentuk antarmukanya menentukan apakah pembalikannya nyata.',
      ),
      code(
        'ts',
        `
        // PORT yang BOCOR — terlihat dibalik, sebenarnya tidak.
        export interface PenyimpanPesanan {
          query(sql: string, params: unknown[]): Promise<Row[]>;
          beginTransaction(): Promise<Transaction>;
        }
        // Lapisan dalam kini tahu penyimpanannya relasional.
        // Satu lapisan tidak langsung dibayar tanpa membeli apa pun.

        // PORT yang BENAR, ditulis dengan kata DOMAIN:
        export interface PenyimpanPesanan {
          ambil(id: PesananId): Promise<Pesanan | null>;
          simpan(pesanan: Pesanan): Promise<void>;
          cariMenunggu(batas: number): Promise<Pesanan[]>;
        }

        // ADAPTER yang memenuhinya, di lapisan luar:
        export class PenyimpanPesananPostgres implements PenyimpanPesanan { /* SQL */ }
        export class PenyimpanPesananMemori implements PenyimpanPesanan { /* untuk test */ }
        `,
        {
          caption:
            'Uji sederhananya: bisakah port ini dipenuhi oleh berkas JSON? Bila tidak, ia belum dibalik.',
        },
      ),
      p('Yang dibeli bisa diperiksa dengan membandingkan biaya pengujiannya.'),
      code(
        'text',
        `
        Tanpa pembalikan:
          menguji satu aturan bisnis menuntut basis data yang menyala,
          skema yang termigrasi, dan data uji.

          Diukur di bab lain, menyiapkan cluster PostgreSQL, membuat
          skema, dan mengisi 55.000 baris memakan beberapa detik per
          jalannya — dan itu per SUITE, bukan per test.

        Dengan pembalikan:
          test menyediakan implementasi memori.
          Diukur di mesin ini, satu pemanggilan fungsi murni selesai
          dalam puluhan nanodetik.

        Selisih itu yang menentukan apakah seseorang benar-benar
        menulis test untuk kasus tepi, atau hanya untuk jalur sukses.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kedua arsitektur ini punya biaya nyata, dan biaya itu sering tidak dihitung sebelum diterapkan di seluruh codebase.',
      ),
      code(
        'text',
        `
        Yang dibayar:

          1. Satu lapisan tidak langsung tambahan
             Membaca kode menjadi: lihat port, cari adapter-nya,
             baru baca implementasinya.

          2. Lebih banyak berkas
             Satu kemampuan menjadi port, adapter, dan tempat
             keduanya disambungkan.

          3. Pemetaan antar bentuk data
             Entitas domain, model basis data, dan bentuk respons API
             menjadi tiga bentuk yang berbeda, dan pemetaannya harus
             ditulis dan dijaga.

        Yang ketiga sering menjadi pekerjaan terbesar, dan manfaatnya
        baru terasa ketika salah satu dari ketiganya berubah tanpa
        memaksa dua lainnya ikut berubah.
        `,
      ),
      p(
        'Kesalahan yang paling sering adalah memakai bentuknya tanpa pembalikan yang sesungguhnya.',
      ),
      code(
        'text',
        `
        Tanda arsitekturnya hanya bentuk:

          - entitas domain memuat dekorator ORM
          - entitas domain punya kolom created_at dan updated_at
            yang hanya ada karena basis datanya begitu
          - use case menerima objek Request dan mengembalikan Response
          - port dinamai mengikuti tabelnya, bukan kemampuannya

        Uji: bisakah seluruh lapisan domain dipindahkan ke project
        lain tanpa membawa satu pun pustaka pihak ketiga?

        Bila jawabannya tidak, pembalikannya belum terjadi.
        `,
      ),
      code(
        'text',
        `
        KESALAHAN KEDUA: menerapkannya di seluruh codebase.

        Yang PANTAS dibalik:
          - logika bisnis yang punya aturan sungguhan
          - hal yang berbeda antara produksi dan test
          - hal yang mungkin diganti

        Yang TIDAK pantas:
          - CRUD yang benar-benar hanya CRUD
          - fungsi utilitas murni
          - hal dengan satu implementasi yang tidak dipakai di test

        Diukur pada project ini: src/lib/utils/cn.ts punya fan-in 16
        dan tidak ada satu pun alasan membalik ketergantungan padanya.

        Dan uji jumlah implementasi:
          1 implementasi + dipakai di test        -> berbayar
          1 implementasi + tidak dipakai di test  -> hapus port-nya
          2 atau lebih                            -> jelas berbayar
        `,
        {
          caption:
            'Menerapkan hexagonal pada endpoint CRUD sederhana menghasilkan empat berkas untuk satu SELECT.',
        },
      ),
      p(
        'Kesalahan ketiga menyangkut penegakan, sebab bahasa pemrogramannya tidak melarang lapisan dalam mengimpor lapisan luar.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini, fitness function:

          GAGAL  lib tidak boleh bergantung pada content (1)
                 src/lib/curriculum/queries.ts -> src/content/curriculum/index.ts

        Satu pelanggaran, tidak disengaja, dan tidak akan pernah
        ditemukan tanpa pemeriksaan otomatis.

        Arsitektur hexagonal tanpa aturan yang dijalankan mesin akan
        menyimpang kembali menjadi lapisan biasa dalam beberapa bulan.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kedua arsitektur ini punya diagram yang mudah diingat, dan itu membuat bentuknya sering disalin tanpa alasannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menerapkannya di seluruh codebase',
            'Biar konsisten',
            'CRUD sederhana menjadi empat berkas untuk satu `SELECT`. Terapkan pada logika yang punya aturan sungguhan',
          ],
          [
            'Menulis port mengikuti bentuk basis data',
            'Itu kan yang dibutuhkan',
            'Lapisan dalam tetap tahu penyimpanannya relasional. Uji: bisakah dipenuhi berkas JSON?',
          ],
          [
            'Membiarkan entitas domain memuat dekorator ORM',
            'Praktis, satu kelas saja',
            'Domainnya kini bergantung pada pustaka. Uji: bisakah dipindah tanpa membawa pustaka apa pun?',
          ],
          [
            'Membuat port dengan satu implementasi selamanya',
            'Katanya praktik yang baik',
            'Bila tidak dipakai di test juga, ia lapisan tanpa manfaat. Hitung implementasinya',
          ],
          [
            'Tidak menegakkan arah ketergantungannya',
            'Timnya sudah paham',
            'Diukur, satu sisi `lib -> content` menyelinap masuk tanpa ada yang menyadarinya',
          ],
          [
            'Mengabaikan biaya pemetaan antar bentuk data',
            'Cuma menyalin field',
            'Tiga bentuk data berarti dua pemetaan yang harus dijaga. Itu sering pekerjaan terbesarnya',
          ],
        ],
      ),
      p(
        'Cara paling jujur menilai apakah arsitektur ini pantas dipakai adalah bertanya berapa banyak aturan bisnis yang sebenarnya ada. Bila sebuah endpoint hanya membaca dan menulis baris tanpa satu pun keputusan, seluruh mesin port dan adapter hanya menambah berkas. Bila ada aturan yang benar-benar perlu diuji dalam banyak kombinasi, kemampuan mengujinya tanpa basis data sering sudah cukup untuk membayar seluruh biayanya.',
      ),
      references(
        {
          label: 'Common web application architectures',
          href: 'https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures',
          source: 'Microsoft',
          note: 'Membandingkan susunan berlapis tradisional dengan susunan yang arah ketergantungannya dibalik.',
        },
        {
          label: 'Design a DDD-oriented microservice',
          href: 'https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/',
          source: 'Microsoft',
          note: 'Bentuk clean architecture dijelaskan lengkap dengan entitas yang membawa aturannya sendiri.',
        },
        {
          label: 'Anti-corruption Layer pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer',
          source: 'Microsoft',
          note: 'Adapter khusus untuk batas dengan sistem luar yang bentuk datanya tidak kamu kendalikan.',
        },
      ),
    ],
  ),

  written(
    'menemukan-batas',
    'Menemukan Batas Modul',
    21,
    'Empat cara menarik garis pemisah, dan satu cara yang hampir selalu keliru.',
    [
      p(
        'Bayangkan kamu diminta menata ulang sebuah gudang yang isinya bercampur. Kamu sudah punya rak, sudah punya sekat, sudah punya label. Yang belum kamu tahu adalah **barang mana masuk rak mana**. Sekat terbaik pun tidak menolong kalau pembagiannya salah, misalnya gunting ditaruh di rak "benda logam" sementara lem ditaruh di rak "perlengkapan kantor", padahal keduanya selalu dipakai bersamaan.',
      ),
      p(
        'Sampai sini kamu sudah tahu batas itu penting dan tahu cara menegakkannya lewat linter dan schema. Yang belum dijawab adalah pertanyaan yang paling menentukan sekaligus paling sering dijawab dengan tebakan, yaitu **garisnya ditarik di mana**.',
      ),
      p(
        'Pertanyaan ini pantas mendapat perhatian besar karena batas yang salah adalah kesalahan paling mahal di seluruh kategori ini. Sifatnya licik, yaitu ia tidak langsung terasa. Hari pertama semuanya terlihat rapi. Enam bulan kemudian barulah muncul keluhan bahwa setiap permintaan fitur selalu menyentuh dua modul sekaligus, dan pada titik itu memindahkan garisnya sudah jauh lebih mahal daripada saat pertama ditarik.',
      ),

      terms(
        {
          term: 'bounded context',
          meaning:
            'Wilayah tempat sebuah istilah punya satu arti yang disepakati. Dibaca "baunded kontekst". Idenya berangkat dari kenyataan bahwa satu kata sering berarti berbeda bagi bagian bisnis yang berbeda, dan memaksakan satu definisi untuk semua justru menghasilkan model yang tidak cocok untuk siapa pun.',
        },
        {
          term: 'ubiquitous language (bahasa yang sama)',
          meaning:
            'Kesepakatan memakai satu istilah yang sama di percakapan, dokumen, dan kode untuk konsep yang sama. Dibaca "yubikuitus lenguij", artinya bahasa yang dipakai di mana-mana. Contoh masalahnya, tim bisnis menyebut sesuatu "penarikan dana", kode menyebutnya `withdrawalRequest`, dan tabelnya bernama `tx_out`. Sekarang setiap percakapan butuh penerjemahan tiga arah, dan setiap penerjemahan adalah kesempatan salah paham. Kalau ketiganya memakai satu kata yang sama, salah paham itu hilang tanpa perlu usaha tambahan.',
        },
        {
          term: 'aggregate',
          meaning:
            'Sekelompok data yang harus selalu konsisten bersama sehingga perubahannya diperlakukan sebagai satu kesatuan, misalnya sebuah pesanan beserta baris-baris isinya. Dibaca "agregat". Uji sederhananya, kalau kamu mengubah salah satunya tanpa mengubah yang lain, apakah datanya menjadi tidak masuk akal. Menambah barang ke pesanan tanpa memperbarui totalnya menghasilkan pesanan yang totalnya salah, jadi keduanya satu aggregate. Kegunaannya bagi kita di sini adalah sebagai penanda, karena data yang harus konsisten bersama sebaiknya tidak dipisahkan oleh batas modul.',
        },
        {
          term: 'change coupling',
          meaning:
            'Kecenderungan dua berkas berubah pada commit yang sama. Dibaca "ceinj kapling", artinya keterikatan lewat perubahan. Ini penanda paling jujur tentang batas yang benar, karena ia berasal dari perilaku nyata tim selama berbulan-bulan, bukan dari pendapat siapa pun dalam rapat. Cara membacanya, dua berkas yang selalu berubah bersamaan sebenarnya satu bagian betapapun jauh letak foldernya, dan dua berkas dalam satu folder yang tidak pernah berubah bersamaan sebenarnya dua bagian.',
        },
        {
          term: 'entity vs concept',
          meaning:
            'Perbedaan antara benda yang datanya disimpan dan konsep bisnis yang punya aturan sendiri. Tabel `pengguna` adalah entitas. "Pendaftaran", "penagihan", dan "moderasi" adalah konsep yang semuanya menyentuh pengguna dengan cara berbeda. Membagi menurut konsep hampir selalu lebih baik daripada membagi menurut tabel.',
        },
        {
          term: 'shared kernel',
          meaning:
            'Bagian kecil yang sengaja dipakai bersama beberapa modul, misalnya tipe uang atau tipe identitas pengguna. Dibaca "syerd kernel", artinya inti bersama. Ia sah selama memenuhi dua syarat, yaitu **sangat kecil** dan **sangat jarang berubah**. Contoh yang sehat adalah tipe `IdPengguna` yang isinya cuma sebuah string dan tidak pernah berubah bentuk. Contoh yang berbahaya adalah tipe `Pengguna` berisi dua puluh field, karena tiap kali satu field ditambah, seluruh modul yang memakainya ikut tersentuh.',
        },
      ),

      h2('Cara yang hampir selalu keliru'),
      p(
        'Sebelum membahas cara yang berhasil, satu cara yang paling menggoda perlu ditandai. Cara itu adalah **membagi menurut tabel database**, dan ia menggoda karena daftarnya sudah tersedia dan terasa objektif.',
      ),
      compare(
        {
          title: 'Dibagi menurut tabel',
          lang: 'text',
          code: `
            modul-pengguna/     -> tabel pengguna
            modul-produk/       -> tabel produk
            modul-pesanan/      -> tabel pesanan
            modul-transaksi/    -> tabel transaksi

            Permintaan: "kirim email saat pendaftaran"
            Menyentuh: modul-pengguna

            Permintaan: "tolak pendaftaran dari domain email tertentu"
            Menyentuh: modul-pengguna

            Permintaan: "pengguna bisa dibekukan admin"
            Menyentuh: modul-pengguna

            -> modul-pengguna membengkak menjadi tempat segalanya
          `,
          notes: [
            'Batas mengikuti bentuk penyimpanan, bukan bentuk pekerjaan',
            'Satu modul menampung banyak konsep yang tidak berhubungan',
            'Ujungnya menjadi god object berskala modul',
          ],
        },
        {
          title: 'Dibagi menurut konsep bisnis',
          lang: 'text',
          code: `
            pendaftaran/        -> aturan siapa boleh mendaftar
            profil/             -> data yang bisa diubah pengguna sendiri
            moderasi/           -> pembekuan, laporan, sanksi
            katalog/            -> produk dan harganya
            pemesanan/          -> keranjang sampai pesanan terbentuk
            penagihan/          -> tagihan, pembayaran, pelunasan

            Permintaan: "tolak pendaftaran dari domain email tertentu"
            Menyentuh: pendaftaran

            Permintaan: "pengguna bisa dibekukan admin"
            Menyentuh: moderasi
          `,
          notes: [
            'Batas mengikuti alasan berubahnya',
            'Beberapa modul boleh menyentuh data pengguna yang sama lewat pemiliknya',
            'Modul tetap kecil dan punya nama yang berarti bagi orang bisnis',
          ],
        },
      ),
      p(
        'Perbedaannya berakar pada satu hal. Tabel dibentuk menurut **cara menyimpan**, sedangkan modul sebaiknya dibentuk menurut **alasan berubah**. Aturan pendaftaran dan aturan pembekuan akun sama-sama menyentuh tabel pengguna, tetapi keduanya berubah karena permintaan yang sama sekali berbeda dan biasanya diminta orang yang berbeda pula.',
      ),
      callout(
        'warning',
        'Bukan berarti tabel pengguna harus dipecah',
        'Modul `pendaftaran`, `profil`, dan `moderasi` bisa saja sama-sama bekerja di atas satu tabel pengguna, dengan satu modul sebagai pemiliknya dan dua lainnya meminta lewat permukaan resmi. Batas modul dan batas tabel tidak wajib berimpit. Yang wajib adalah setiap tabel punya tepat satu pemilik.',
      ),

      h2('Empat cara yang berhasil'),
      p(
        'Empat cara berikut bisa dipakai bersamaan dan saling memeriksa. Kalau keempatnya menunjuk garis yang sama, kamu bisa cukup yakin.',
      ),
      steps(
        {
          title: 'Ikuti bahasa yang dipakai orang bisnis',
          body: 'Dengarkan bagaimana mereka menyebut pekerjaan mereka, lalu perhatikan di mana satu kata mulai berganti arti. Kalau tim gudang menyebut "pesanan" sebagai daftar barang yang harus diambil sementara tim keuangan menyebutnya sebagai jumlah yang harus ditagih, itu bukan kebingungan yang harus diluruskan. Itu dua konteks berbeda, dan di situlah garisnya.',
        },
        {
          title: 'Ikuti alur pekerjaan dari ujung ke ujung',
          body: 'Tuliskan perjalanan satu pekerjaan nyata, misalnya dari pengunjung menambah barang sampai barang dikirim. Perhatikan di mana tanggung jawabnya berpindah dan di mana pekerjaan bisa berhenti sebentar tanpa merusak apa pun. Titik jeda alami hampir selalu batas yang baik.',
        },
        {
          title: 'Ikuti data yang wajib konsisten bersama',
          body: 'Sekumpulan data yang harus benar bersamaan dalam satu waktu sebaiknya tidak dipisahkan batas. Pesanan dan baris isinya wajib konsisten bersama sehingga keduanya satu modul. Pesanan dan riwayat kunjungan pembeli tidak wajib, sehingga keduanya boleh terpisah.',
        },
        {
          title: 'Ikuti riwayat perubahan yang sudah terjadi',
          body: 'Untuk kode yang sudah berjalan, riwayat git menyimpan jawaban yang tidak bisa dibantah pendapat siapa pun. Berkas yang selalu berubah bersamaan memang satu bagian, betapapun jauh letak foldernya sekarang.',
        },
      ),
      code(
        'bash',
        `
        # Cara keempat, dijalankan langsung di repositori.
        # Mencari pasangan berkas yang paling sering berubah pada commit yang sama.

        git log --since="12 months ago" --name-only --pretty=format:"__%H" \\
          | awk '
              /^__/ { if (n > 1 && n < 20) for (i = 1; i < n; i++) for (j = i + 1; j < n; j++) print f[i] "  +  " f[j]; n = 1; next }
              /^src\\// { f[n++] = $0 }
            ' \\
          | sort | uniq -c | sort -rn | head -20
        `,
        {
          caption:
            'Commit yang menyentuh lebih dari 20 berkas dilewati karena biasanya format ulang, bukan perubahan fitur.',
        },
      ),
      p(
        'Hasilnya adalah daftar pasangan berkas beserta berapa kali keduanya berubah bersamaan. Pasangan yang muncul puluhan kali tetapi berada di modul berbeda adalah sinyal kuat bahwa batas di antara keduanya salah tempat. Sebaliknya, dua berkas dalam satu modul yang tidak pernah sekali pun berubah bersamaan adalah sinyal bahwa modul itu sebenarnya dua modul.',
      ),

      h2('Satu kata, dua arti, dan kenapa itu bagus'),
      p(
        'Gagasan yang paling sering ditolak pemula adalah membiarkan satu kata punya arti berbeda di modul berbeda. Rasanya seperti membiarkan kebingungan. Padahal memaksakan satu arti untuk semua justru yang menghasilkan bentuk data yang tidak cocok untuk siapa pun.',
      ),
      code(
        'ts',
        `
        // Modul katalog: produk adalah sesuatu yang dipajang dan dicari.
        export type Produk = {
          id: string;
          nama: string;
          deskripsi: string;
          gambar: string[];
          kategori: string;
          hargaRupiah: number;
        };

        // Modul gudang: produk adalah sesuatu yang punya tempat dan jumlah.
        export type Produk = {
          id: string;
          kodeRak: string;
          jumlahTersedia: number;
          jumlahDipesan: number;
          beratGram: number;
        };

        // Modul pemesanan: produk adalah sesuatu yang dibeli pada harga tertentu.
        export type BarangDipesan = {
          idProduk: string;
          namaSaatBeli: string;
          hargaSaatBeli: number;
          jumlah: number;
        };
        `,
        {
          caption:
            'Tiga bentuk berbeda untuk kata yang sama, masing-masing pas untuk pekerjaannya sendiri.',
        },
      ),
      p(
        'Bandingkan dengan satu tipe `Produk` raksasa berisi dua puluh field, di mana modul katalog harus mengabaikan `kodeRak` dan modul gudang harus mengabaikan `deskripsi`. Bentuk raksasa itu memaksa setiap modul mengetahui field yang bukan urusannya, dan setiap penambahan field oleh satu modul menyentuh seluruh modul lain.',
      ),
      p(
        'Yang menghubungkan ketiganya cukup satu hal, yaitu `id` produk. Identitas itulah shared kernel yang sah, karena ia sangat kecil dan sangat stabil.',
      ),

      h2('Memeriksa batas yang sudah ditarik'),
      p(
        'Setelah garis ditarik, ia pantas diuji sebelum dipakai. Lima pertanyaan berikut menemukan sebagian besar batas yang salah sebelum kode ditulis.',
      ),
      table(
        ['Pertanyaan', 'Jawaban yang buruk artinya'],
        [
          [
            'Bisakah aku menjelaskan modul ini dalam satu kalimat tanpa kata "dan"?',
            'Kalau butuh "dan", modul itu kemungkinan dua modul',
          ],
          [
            'Berapa banyak modul yang tersentuh untuk perubahan bisnis yang paling khas?',
            'Lebih dari satu secara rutin berarti garisnya memotong sesuatu yang utuh',
          ],
          [
            'Apakah ada data yang harus konsisten seketika tetapi berada di dua modul?',
            'Kalau ya, garisnya memotong aggregate dan akan menyusahkan sejak hari pertama',
          ],
          [
            'Apakah permukaan publik modul ini kecil dan stabil?',
            'Permukaan yang sangat lebar berarti modul ini tidak menyembunyikan apa pun',
          ],
          [
            'Apakah orang bisnis mengenali nama modul ini?',
            'Nama yang hanya berarti bagi programmer biasanya menandakan pembagian teknis, bukan bisnis',
          ],
        ],
        'Kelimanya bisa dijawab dalam sepuluh menit, jauh sebelum ada kode yang ditulis.',
      ),
      callout(
        'tip',
        'Kalau ragu, buat modulnya lebih besar',
        'Menggabungkan dua modul yang ternyata satu jauh lebih mudah daripada memisahkan satu modul yang ternyata dua. Menggabungkan berarti memindahkan berkas. Memisahkan berarti membongkar data yang sudah terlanjur bercampur. Karena itu ketika batasnya belum jelas, mulai dari modul yang lebih besar lalu pecah setelah polanya terlihat.',
      ),

      h2('Rangkuman'),
      ul(
        'Batas yang salah adalah kesalahan paling mahal, dan ia baru terasa berbulan-bulan kemudian.',
        'Membagi menurut tabel database hampir selalu keliru, karena tabel dibentuk menurut cara menyimpan bukan alasan berubah.',
        'Empat cara yang berhasil yaitu ikuti bahasa bisnis, alur pekerjaan, data yang wajib konsisten bersama, dan riwayat perubahan.',
        'Riwayat git memberi jawaban yang tidak bisa dibantah pendapat siapa pun.',
        'Satu kata boleh punya arti berbeda di modul berbeda, dan itu lebih baik daripada satu tipe raksasa.',
        'Kalau ragu, buat modul lebih besar. Menggabungkan jauh lebih murah daripada memisahkan.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Menemukan batas modul adalah pekerjaan menemukan, bukan memutuskan. Batas yang benar sudah ada di dalam sistemnya, dan tugasnya adalah membuatnya terlihat.',
      ),
      code(
        'text',
        `
        Tiga sumber bukti, ketiganya bisa diukur.

        1. GRAF KETERGANTUNGAN

           Diukur sungguhan pada project ini:
             116 berkas, 337 sisi, rata-rata 2,9 per berkas
             110  content -> lib
              40  app     -> lib
              36  app     -> components
              32  components -> lib

           Kelompok yang saling terhubung rapat dan jarang
           menyeberang adalah calon batas.

        2. PERUBAHAN BERSAMA

           Diukur dari riwayat git project ini:
             3x bersama (50%)  types.ts + curriculum-integrity.test.ts
             3x bersama (60%)  glossary.ts + curriculum-integrity.test.ts

           Berkas yang selalu berubah bersamaan sebaiknya berada di
           sisi batas yang SAMA.

        3. BAHASA YANG DIPAKAI ORANG

           Bila dua bagian memakai kata yang sama dengan ARTI yang
           berbeda, di situ ada batas.
        `,
        {
          caption:
            'Sumber ketiga tidak bisa diukur dengan skrip, dan sering yang paling menentukan.',
        },
      ),
      p(
        'Sumber ketiga itu pantas dijelaskan dengan contoh, sebab ia bentuk batas yang paling sering terlewat.',
      ),
      code(
        'text',
        `
        Kata "pesanan" berarti hal yang berbeda di tiap bagian:

          bagi KATALOG   : sekumpulan id produk dan jumlahnya
          bagi PEMBAYARAN: satu jumlah uang dan status transaksinya
          bagi PENGIRIMAN: alamat, berat, dan dimensi
          bagi AKUNTANSI : baris jurnal dengan pajak dan diskon

        Memaksa keempatnya memakai SATU bentuk data menghasilkan
        objek yang punya empat puluh field, yang tiga puluh di
        antaranya selalu kosong untuk tiap pemakainya.

        Batas yang benar berada tepat di antara keempat arti itu,
        dan masing-masing memakai bentuknya sendiri.
        `,
      ),
      p('Uji yang paling menentukan apakah sebuah batas pantas ada punya nama sendiri.'),
      code(
        'text',
        `
        UJI PENGHAPUSAN

        Bayangkan modul ini dihapus, dan isinya dipindahkan ke
        pemanggilnya.

          Kerumitannya HILANG      -> modulnya tidak membeli apa-apa
          Kerumitannya MENYEBAR    -> modulnya menanggung beban nyata

        Contoh yang hilang:
          class LayananPesanan {
            ambil(id) { return this.repo.ambil(id); }
            simpan(p) { return this.repo.simpan(p); }
          }
          -> dihapus, pemanggil memakai repo langsung. Tidak ada
             yang hilang selain satu berkas untuk dibaca.

        Contoh yang menyebar:
          batalkanPesanan() yang memeriksa status, batas waktu,
          kepemilikan, dan menulis jejak audit
          -> dihapus, keempat aturan itu tersebar ke setiap
             pemanggil, dan salah satunya pasti lupa
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Batas yang salah tempat tidak menghasilkan error. Ia menghasilkan gejala yang bisa dihitung.',
      ),
      code(
        'text',
        `
        Batas TERLALU BANYAK atau TERLALU KECIL:

          "Menambah satu field menyentuh tujuh berkas"
          "Satu fitur biasa menyentuh empat modul"
          "Pintu masuk modul hanya meneruskan"
          "Banyak modul yang isinya satu berkas"

        Batas TERLALU SEDIKIT atau TERLALU BESAR:

          "Tidak ada yang paham modul itu seluruhnya"
          "Test-nya butuh sepuluh menit"
          "Setiap perubahan berisiko merusak hal yang tidak
           berhubungan"

        Kedua kelompok bisa dihitung: ambil sepuluh perubahan
        terakhir dari riwayat git dan hitung berkas yang tersentuh
        masing-masing.
        `,
      ),
      p(
        'Kesalahan yang paling mahal adalah memutuskan batas terlalu dini, sebelum polanya cukup terlihat.',
      ),
      code(
        'text',
        `
        Urutan yang lebih murah:

          1. Tulis dulu di satu tempat, biarkan duplikasi ada
          2. Tunggu sampai POLA-nya terlihat dari tiga contoh nyata
          3. Baru tarik batasnya

        Alasannya: batas yang salah lebih mahal daripada duplikasi.

        Duplikasi  -> biayanya tetap, dan terlihat
        Batas salah -> biayanya tumbuh, dan tersembunyi. Diukur pada
                       project ini, satu berkas menyentuh 82 dari 116
                       berkas secara transitif

        Aturan praktisnya: tiga kejadian sebelum menarik abstraksi.
        Dua kejadian masih bisa kebetulan.
        `,
        {
          caption:
            'Duplikasi yang terlihat jauh lebih murah daripada abstraksi yang salah dan tersembunyi.',
        },
      ),
      p(
        'Kesalahan terakhir menyangkut data, dan ia yang paling sering membuat batas menjadi fiktif.',
      ),
      code(
        'text',
        `
        Batas yang ada di kode dan TIDAK ADA di data:

          modul/pesanan dan modul/katalog terpisah rapi
          dan keduanya membaca tabel produk secara langsung

        Batas itu fiktif. Tandanya tidak muncul di graf impor sama
        sekali, sehingga fitness function berbasis impor tidak akan
        menemukannya.

        Yang menemukannya: memeriksa nama tabel yang disentuh tiap
        modul. Tabel yang disentuh dua modul adalah batas yang bocor.

        Dan akibatnya baru terasa saat pemecahan dipertimbangkan:
        setiap JOIN lintas modul harus ditulis ulang sebagai
        panggilan jaringan — diukur, loopback 1,69 ms melawan
        pemanggilan fungsi puluhan nanodetik.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Menemukan batas terasa seperti pekerjaan intuisi, padahal sebagian besarnya bisa dibaca dari bukti yang sudah ada.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menarik batas dari dua kejadian yang mirip',
            'Sudah terlihat polanya',
            'Dua kejadian masih bisa kebetulan. Batas yang salah lebih mahal daripada duplikasi',
          ],
          [
            'Memutuskan batas dari struktur direktori',
            'Susunannya sudah rapi',
            'Diukur, graf impor yang sesungguhnya sering berbeda dari yang terlihat di direktori',
          ],
          [
            'Mengabaikan riwayat perubahan',
            'Itu kan cuma git log',
            'Diukur, dua berkas berubah bersamaan 60% dari waktunya. Itu batas yang bicara',
          ],
          [
            'Memaksa satu bentuk data untuk semua bagian',
            'Biar tidak ada duplikasi',
            'Objek dengan empat puluh field yang tiga puluh di antaranya selalu kosong per pemakai',
          ],
          [
            'Membuat batas di kode tanpa membaginya di data',
            'Kodenya kan sudah terpisah',
            'Batasnya fiktif, dan tidak muncul di graf impor. Periksa tabel yang disentuh tiap modul',
          ],
          [
            'Membuat modul untuk setiap kelompok kecil',
            'Lebih terpisah lebih baik',
            'Satu fitur menyentuh empat modul. Pakai uji penghapusan sebelum menambah batas',
          ],
        ],
      ),
      p(
        'Yang paling berguna dari ketiga sumber bukti di awal sub-bab ini adalah bahwa ketiganya sudah ada sekarang, tanpa perlu menunggu apa pun. Graf impor bisa dihitung dalam tiga puluh baris, riwayat perubahan bersama ada di git sejak commit pertama, dan perbedaan arti sebuah kata bisa ditemukan dengan bertanya kepada dua orang yang memakainya. Batas yang ditemukan dari ketiganya hampir selalu lebih baik daripada batas yang dipilih dari diagram.',
      ),
      references(
        {
          label: 'Identifying microservice boundaries',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/microservices/model/microservice-boundaries',
          source: 'Microsoft',
          note: 'Cara menurunkan batas dari analisis domain, berlaku sama untuk batas modul.',
        },
        {
          label: 'Domain analysis for microservices',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis',
          source: 'Microsoft',
          note: 'Bounded context dan ubiquitous language dijelaskan dengan contoh yang dijalankan sampai selesai.',
        },
        {
          label: 'Decomposing monoliths into microservices',
          href: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-decomposing-monoliths/introduction.html',
          source: 'Amazon Web Services',
          note: 'Pendekatan AWS untuk menemukan garis pemisah pada kode yang sudah berjalan.',
        },
      ),
    ],
  ),

  written(
    'microservice-kapan',
    'Microservice dan Kapan Ia Benar',
    21,
    'Empat sebab yang membenarkannya, dan satu bentuk gagal yang lebih buruk daripada keduanya.',
    [
      p(
        'Sekarang baru waktunya membahas microservice, dan urutan ini disengaja. Kalau bentuk ini dibahas di awal bab, ia akan terbaca sebagai tingkat yang lebih tinggi dari monolit, semacam naik kelas. Ia bukan. Setelah membaca dua sub-bab sebelumnya, kamu sudah punya pembanding yang jujur.',
      ),
      p(
        'Kembali ke analogi rumah untuk terakhir kalinya. Monolit adalah satu rumah, modular monolith adalah satu rumah bersekat, dan microservice adalah **beberapa rumah terpisah di alamat berbeda**.',
      ),
      p(
        'Apa yang kamu dapat dengan pindah ke beberapa rumah. Kamu bisa merenovasi dapur tanpa mengganggu penghuni rumah sebelah, dan kamu bisa memperbesar rumah yang penghuninya paling banyak tanpa memperbesar semuanya.',
      ),
      p(
        'Apa yang kamu bayar. Tiap rumah butuh listriknya sendiri, airnya sendiri, kuncinya sendiri, dan alamatnya sendiri. Berbicara dengan penghuni rumah sebelah tidak lagi cukup dengan memanggil dari ruang tengah, melainkan harus lewat telepon yang bisa saja tidak diangkat. Itulah harga yang dibayar terus-menerus, bukan sekali.',
      ),
      p(
        'Secara teknis, **microservice** berarti memecah aplikasi menjadi beberapa layanan yang dibangun, dirilis, dan dijalankan sendiri-sendiri, masing-masing memiliki datanya sendiri. Kata kuncinya ada pada "sendiri-sendiri". Kalau kemandirian itu tidak benar-benar ada, yang kamu dapat bukan microservice, melainkan bentuk yang lebih buruk daripada monolit.',
      ),

      terms(
        {
          term: 'microservice',
          meaning:
            'Layanan kecil yang berdiri sendiri, punya proses sendiri, punya data sendiri, dan bisa dirilis tanpa menunggu layanan lain. Dibaca "maikroservis". Kata "micro" pada namanya adalah sumber kesalahpahaman terbesar di seluruh bab ini, karena banyak orang mengira artinya sedikit baris kode. Ukuran yang sebenarnya adalah **cakupan tanggung jawab**, bukan jumlah baris. Sebuah layanan yang benar bisa saja berisi lima ribu baris dan tetap disebut microservice, asalkan seluruh baris itu melayani satu tanggung jawab yang utuh.',
        },
        {
          term: 'independent deployability (kemandirian rilis)',
          meaning:
            'Kemampuan merilis satu layanan tanpa harus merilis layanan lain pada saat yang sama. Dibaca "independen diploiabiliti". Uji sederhananya satu pertanyaan, bisakah kamu memperbaiki bug di layanan pembayaran lalu menaikkannya ke produksi hari ini juga, tanpa menyentuh dan tanpa menunggu layanan lain. Kalau bisa, kemandirian rilisnya nyata. Ini **satu-satunya** manfaat yang benar-benar khas microservice, karena semua manfaat lain bisa dicapai bentuk yang lebih murah. Kalau kemandirian ini tidak dibutuhkan, seluruh biayanya dibayar tanpa imbalan apa pun.',
        },
        {
          term: 'distributed monolith',
          meaning:
            'Kumpulan layanan yang terlihat terpisah tetapi harus dirilis bersamaan karena saling terikat erat. Dibaca "distributed monolit". Ini bentuk gagal yang paling sering terjadi, dan ia lebih buruk daripada monolit maupun microservice karena membayar seluruh biaya keduanya sekaligus.',
        },
        {
          term: 'database per service',
          meaning:
            'Aturan bahwa tiap layanan memiliki penyimpanannya sendiri dan layanan lain tidak boleh menyentuhnya langsung. Dibaca "database per servis". Ini syarat yang tidak bisa ditawar, dan alasannya mudah dipahami. Kalau layanan A dan layanan B sama-sama membaca tabel `pesanan`, maka A tidak bisa mengganti nama kolom di tabel itu tanpa merusak B. Artinya A tidak bebas berubah, artinya A tidak bisa dirilis sendirian, artinya kemandirian rilisnya palsu. Dalam analogi rumah, ini seperti dua rumah yang ternyata berbagi satu kamar mandi.',
        },
        {
          term: 'service boundary',
          meaning:
            'Garis pemisah antar layanan, yang sekaligus menjadi batas jaringan, batas transaksi, dan batas kegagalan. Dibaca "servis baundari". Berbeda dari batas modul yang hanya batas kode, batas layanan membawa serta seluruh masalah jaringan yang tidak bisa dihindari.',
        },
        {
          term: 'operational maturity (kematangan operasional)',
          meaning:
            'Sejauh mana sebuah tim sudah punya kemampuan menjalankan sistem terdistribusi, yaitu trace terdistribusi, log terpusat, pipeline rilis per layanan, dan kesiapan menangani kejadian. Dibaca "operasyonal machuriti". Cara mengukurnya paling jujur adalah satu pertanyaan, kalau ada laporan pesanan gagal masuk jam sebelas malam, berapa lama sampai kamu tahu layanan mana penyebabnya. Kalau jawabannya "buka log satu per satu di lima tempat", kematangannya belum cukup. Tanpa kemampuan ini, kerumitan tidak hilang saat dipecah, ia hanya berpindah ke tempat yang tidak terlihat.',
        },
        {
          term: 'fault isolation (pengisolasian kegagalan)',
          meaning:
            'Sifat ketika kegagalan satu bagian tidak menjatuhkan bagian lain. Dibaca "folt aisolasyen", artinya pengucilan kegagalan. Sering disebut sebagai keunggulan microservice, padahal ia **tidak datang otomatis**. Justru sebaliknya kalau tidak dikerjakan. Layanan rekomendasi yang mati total malah lebih aman daripada yang lambat, karena yang mati menjawab gagal seketika sementara yang lambat menahan sambungan pemanggilnya sampai habis. Tanpa timeout dan circuit breaker yang dibahas di [keandalan](/kelas/system-design/keandalan-studi-kasus/titik-kegagalan-tunggal), kegagalan justru merambat lebih jauh daripada di monolit.',
        },
      ),

      h2('Empat sebab, bukan ukuran tim'),
      p(
        'Nasihat yang paling sering beredar adalah memakai jumlah orang sebagai penentu, misalnya di atas dua puluh orang berarti waktunya microservice. Nasihat itu menyesatkan karena jumlah orang adalah gejala, bukan sebab. Ada empat sebab yang benar-benar menentukan.',
      ),
      table(
        ['Sebab', 'Pertanyaan yang menjawabnya', 'Kalau jawabannya tidak'],
        [
          [
            '**Kemandirian rilis**',
            'Adakah bagian yang benar-benar harus rilis pada jadwal berbeda, dan apakah menunggu itu benar-benar merugikan?',
            'Pemecahan tidak membeli apa pun. Ini sebab terkuat, dan tanpanya tiga sebab lain jarang cukup',
          ],
          [
            '**Kestabilan batas**',
            'Dalam beberapa bulan terakhir, apakah satu permintaan fitur biasanya memaksa mengubah beberapa wilayah sekaligus?',
            'Kalau sering, batasnya masih bergerak. Memecah di batas yang bergerak adalah kesalahan termahal di bab ini',
          ],
          [
            '**Kematangan operasional**',
            'Kalau ada masalah di produksi sekarang, berapa lama sampai kamu tahu bagian mana yang bermasalah?',
            'Kalau lama, kerumitan tidak hilang saat dipecah. Ia hanya berpindah ke tempat yang tidak terlihat',
          ],
          [
            '**Perbedaan skala atau teknologi**',
            'Adakah bagian yang jauh lebih berat, atau yang benar-benar butuh bahasa atau runtime berbeda?',
            'Kalau ada satu saja, jawabannya biasanya menarik keluar bagian itu, bukan memecah semuanya',
          ],
        ],
        'Kestabilan batas dan kematangan operasional berfungsi sebagai penolak. Salah satunya gagal sudah cukup untuk menunda.',
      ),
      p(
        'Sebab kedua pantas ditekankan. Memecah di batas yang masih bergerak adalah bentuk kesalahan yang paling sulit diperbaiki, karena memindahkan batas antar layanan berarti memindahkan data yang sudah terlanjur terpisah, mengubah kontrak yang sudah dipakai, dan menyelaraskan rilis beberapa pihak. Di modular monolith, kesalahan yang sama hanya berarti memindahkan folder.',
      ),
      callout(
        'warning',
        'Jumlah orang tetap berguna, tetapi sebagai pemeriksa',
        'Setelah keempat sebab dijawab, jumlah orang berguna untuk memeriksa hasilnya masuk akal atau tidak. Tim empat orang yang menyimpulkan butuh tujuh layanan sebaiknya memeriksa ulang jawabannya. Tim dua puluh lima orang yang menyimpulkan tetap satu unit rilis juga sebaiknya memeriksa ulang. Pemeriksa, bukan penentu.',
      ),

      h2('Distributed monolith, bentuk gagal yang paling sering'),
      p(
        'Sebelum membahas manfaatnya, bentuk gagalnya perlu dikenali karena ia jauh lebih sering terjadi daripada bentuk yang berhasil. Cirinya sangat khas dan mudah diperiksa.',
      ),
      ol(
        'Dua layanan atau lebih hampir selalu dirilis pada waktu yang sama karena kalau tidak, salah satunya rusak.',
        'Menambah satu field di layanan A memaksa layanan B ikut diperbarui sebelum bisa dipakai.',
        'Beberapa layanan membaca database yang sama, sehingga tidak ada yang bebas mengubah bentuk tabelnya.',
        'Menjalankan salah satu layanan di laptop mustahil tanpa menjalankan empat layanan lain sekaligus.',
        'Satu permintaan pengguna melewati lima layanan secara berantai, dan satu yang lambat membuat semuanya lambat.',
      ),
      compare(
        {
          title: 'Distributed monolith',
          lang: 'text',
          code: `
            Permintaan: "tambah field catatan pada pesanan"

            1. layanan-pesanan   : tambah kolom, tambah field di respons
            2. layanan-pengiriman: perbarui tipe respons pesanan
            3. layanan-laporan   : perbarui tipe respons pesanan
            4. rilis ketiganya dengan urutan yang benar
            5. kalau urutannya salah, produksi rusak

            Biaya: seluruh biaya terdistribusi
            Manfaat: nol
          `,
          notes: [
            'Kontraknya rapuh terhadap penambahan',
            'Tidak ada layanan yang benar-benar mandiri',
            'Rollback satu layanan tidak aman',
          ],
        },
        {
          title: 'Layanan yang benar-benar mandiri',
          lang: 'text',
          code: `
            Permintaan: "tambah field catatan pada pesanan"

            1. layanan-pesanan   : tambah kolom, tambah field di respons
            2. rilis. Selesai.

            layanan-pengiriman dan layanan-laporan mengabaikan field
            yang tidak mereka kenal, sehingga tidak perlu tahu apa pun.
          `,
          notes: [
            'Penambahan field bukan perubahan yang merusak',
            'Tiap layanan merilis sesuai jadwalnya sendiri',
            'Rollback satu layanan tetap aman',
          ],
        },
      ),
      p(
        'Perbedaan di antara keduanya ternyata bukan soal teknologi, melainkan soal **kontrak**. Kolom kanan bisa terjadi karena pemakai kontrak mengabaikan field yang tidak dikenal, dan karena tidak ada layanan yang membaca database milik layanan lain. Bab 3 sub-bab 2 membahas cara menulis kontrak yang punya sifat ini.',
      ),

      h2('Yang benar-benar berubah begitu dipecah'),
      p(
        'Begitu batas modul berubah menjadi batas jaringan, sejumlah hal yang tadinya gratis berubah menjadi pekerjaan. Daftar ini bukan untuk menakuti, melainkan supaya biayanya diketahui sebelum dibayar.',
      ),
      table(
        ['Di modular monolith', 'Setelah dipecah', 'Yang harus dikerjakan'],
        [
          [
            'Panggilan fungsi, selalu berhasil',
            'Permintaan jaringan yang bisa lambat, gagal, atau terulang',
            'Timeout, retry dengan backoff, dan penanganan bila gagal',
          ],
          [
            'Satu transaksi database untuk beberapa modul',
            'Tidak ada transaksi lintas layanan',
            'Saga dan kompensasi. Bab 3 sub-bab 5',
          ],
          [
            'Stack trace menunjuk penyebabnya langsung',
            'Jejak terputus di batas jaringan',
            'Trace terdistribusi dengan id yang diteruskan lintas layanan',
          ],
          [
            'Perubahan tipe gagal saat compile',
            'Perubahan kontrak baru terasa saat berjalan',
            'Kontrak berversi dan contract test',
          ],
          [
            'Satu pipeline dan satu rollback',
            'Beberapa pipeline dan urutan rilis yang harus dipikirkan',
            'Kompatibilitas mundur di setiap perubahan',
          ],
          [
            'Satu perintah untuk menjalankan semuanya',
            'Beberapa proses, atau tiruan untuk yang tidak dijalankan',
            'Compose untuk pengembangan lokal, atau tiruan yang dirawat',
          ],
          [
            'Satu tempat melihat log',
            'Log tersebar di beberapa layanan',
            'Log terpusat dengan id korelasi',
          ],
        ],
        'Kolom kanan adalah pekerjaan yang harus sudah ada SEBELUM pemecahan, bukan sesudahnya.',
      ),
      callout(
        'info',
        'Sebagian besar sudah kamu pelajari',
        'Timeout dan circuit breaker ada di [keandalan](/kelas/system-design/keandalan-studi-kasus/titik-kegagalan-tunggal), trace dan log terpusat ada di [observability](/kelas/backend-intermediate/express-intermediate/observability) serta [logging terpusat](/kelas/deployment/setelah-rilis/logging-terpusat), kompatibilitas mundur ada di [versioning](/kelas/backend-intermediate/desain-api/versioning). Yang baru di sini bukan tekniknya, melainkan kenyataan bahwa semuanya berubah dari opsional menjadi wajib.',
      ),

      h2('Apa yang sebenarnya dibeli'),
      p(
        'Setelah semua biaya di atas, apa yang didapat. Jujurnya tidak banyak, tetapi yang sedikit itu bisa sangat berharga di keadaan yang tepat.',
      ),
      ul(
        '**Kemandirian rilis.** Tim pembayaran merilis tiga kali sehari tanpa menunggu tim katalog yang merilis mingguan. Inilah manfaat utama dan satu-satunya yang benar-benar khas.',
        '**Penskalaan terpisah.** Layanan pencarian yang berat bisa dijalankan dua puluh salinan sementara layanan profil cukup dua.',
        '**Pilihan teknologi per layanan.** Layanan pemrosesan gambar boleh memakai bahasa lain tanpa memaksa seluruh aplikasi ikut.',
        '**Pengisolasian kegagalan, kalau dikerjakan.** Layanan rekomendasi yang mati tidak menjatuhkan checkout, asalkan pemanggilnya memang menyiapkan jalan keluar.',
        '**Batas kepemilikan yang jelas.** Satu tim benar-benar memiliki satu layanan beserta datanya dan jadwalnya.',
      ),
      p(
        'Perhatikan kata "kalau dikerjakan" pada poin keempat. Pengisolasian kegagalan tidak datang gratis dari pemecahan. Tanpa timeout dan nilai cadangan, layanan rekomendasi yang lambat justru menahan sambungan di layanan checkout sampai habis, dan kegagalannya merambat lebih luas daripada di monolit.',
      ),

      h2('Ukuran yang tepat untuk satu layanan'),
      p(
        'Kalau sudah memutuskan memecah, pertanyaan berikutnya adalah seberapa besar satu layanan. Awalan "micro" pada namanya menyesatkan banyak orang menuju layanan yang terlalu kecil.',
      ),
      table(
        ['Ukuran', 'Ciri', 'Akibat'],
        [
          [
            'Terlalu kecil',
            'Satu layanan per tabel atau per endpoint',
            'Hampir setiap permintaan melewati banyak layanan, latensi menumpuk, dan kegagalan lebih mungkin terjadi',
          ],
          [
            'Pas',
            'Satu layanan menampung satu bounded context beserta seluruh datanya',
            'Sebagian besar permintaan selesai di dalam satu layanan',
          ],
          [
            'Terlalu besar',
            'Satu layanan menampung beberapa konteks yang jadwal rilisnya berbeda',
            'Kembali muncul keluhan saling menunggu yang tadinya ingin diselesaikan',
          ],
        ],
        'Penanda ukuran yang pas adalah sebagian besar permintaan bisa dijawab tanpa memanggil layanan lain.',
      ),
      p(
        'Penanda di baris bawah tabel itu layak dijadikan pegangan. Kalau menjawab satu permintaan sederhana butuh memanggil empat layanan lain, batasnya terlalu halus. Setiap panggilan menambah waktu, menambah kemungkinan gagal, dan menambah satu tempat lagi yang harus dipantau.',
      ),

      h2('Rangkuman'),
      ul(
        'Microservice adalah pertukaran, bukan kenaikan kelas dari monolit.',
        'Empat sebab yang menentukan yaitu kemandirian rilis, kestabilan batas, kematangan operasional, dan perbedaan skala atau teknologi.',
        'Kestabilan batas dan kematangan operasional berfungsi sebagai penolak. Salah satunya gagal sudah cukup untuk menunda.',
        'Distributed monolith adalah bentuk gagal yang paling sering, dan ia lebih buruk daripada monolit maupun microservice.',
        'Yang berubah begitu dipecah adalah panggilan, transaksi, penelusuran, kontrak, pipeline, dan log. Semuanya harus siap sebelum pemecahan.',
        'Ukuran yang pas adalah satu bounded context, dengan penanda sebagian besar permintaan selesai tanpa memanggil layanan lain.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Microservice menyelesaikan masalah organisasi dan menciptakan masalah teknis. Keduanya bisa dihitung, dan hitungan itu yang menentukan apakah pertukarannya masuk akal.',
      ),
      code(
        'text',
        `
        Yang DIBAYAR, dengan angka.

        1. Ketersediaan berantai
           Dihitung sungguhan:
              1 komponen @ 99,9% -> 99,9000%   (  8,8 jam/tahun)
              5 komponen @ 99,9% -> 99,5010%   ( 43,7 jam/tahun)
             10 komponen @ 99,9% -> 99,0045%   ( 87,2 jam/tahun)
             30 komponen @ 99,9% -> 97,0431%   (259,0 jam/tahun)

        2. Latensi panggilan
           Diukur sungguhan di mesin ini:
             pemanggilan fungsi          puluhan nanodetik
             loopback                    1,69 ms
             internet                    p50 70,04 ms, p99 362,72 ms

           Satu permintaan yang melewati 5 layanan membayar 5 kali
           ongkos itu, dan p99-nya ditentukan yang PALING LAMBAT.

        3. Latensi ekor berlipat
           Dihitung: bila p99 tiap layanan 1%, peluang setidaknya
           satu kena ekor pada 10 layanan adalah 1 - 0,99^10 = 9,6%
        `,
        {
          caption:
            'Hampir 1 dari 10 permintaan merasakan latensi ekor, meski tiap layanannya hanya 1%.',
        },
      ),
      p(
        'Dan yang paling mahal tidak muncul sebagai angka latensi melainkan sebagai jaminan yang hilang.',
      ),
      code(
        'text',
        `
        4. Transaksi lintas layanan TIDAK ADA

           Di monolit: satu transaksi basis data, dan itu saja.
           Di microservice: dua penulisan ke dua layanan, dan yang
           kedua gagal. Yang pertama TIDAK dibatalkan.

           Yang menggantikannya: saga, kompensasi, dan kotak keluar
           transaksional — semuanya kode yang harus ditulis dan diuji.

        5. Konsistensi akhir menjadi bawaan

           Diuji sungguhan dengan replika PostgreSQL 16.15:
             saat diam  : 5 dari 5 pembacaan sesudah penulisan BERHASIL
             saat ramai : 8 dari 8 GAGAL (tertinggal 11 MB)

           Kelas bug itu tidak ada sama sekali di satu basis data.
        `,
      ),
      p('Yang dibeli juga nyata, dan hampir seluruhnya bersifat organisasi, bukan teknis.'),
      table(
        ['Yang dibeli', 'Syarat agar benar-benar diperoleh'],
        [
          ['Tim bisa merilis sendiri', 'Setiap layanan punya basis datanya SENDIRI'],
          ['Penskalaan per bagian', 'Bagian yang diskalakan memang punya beban yang berbeda'],
          ['Kegagalan terisolasi', 'Ada pemutus sirkuit dan perilaku degradasi yang dirancang'],
          ['Teknologi berbeda per layanan', 'Tim benar-benar punya alasan berbeda, bukan selera'],
          ['Batas yang dipaksakan', 'Batasnya memang sudah terbukti benar sebelum dipecah'],
        ],
      ),
      p('Baris pertama itu yang paling menentukan, dan yang paling sering tidak dipenuhi.'),

      h2('Saat error-nya muncul'),
      p(
        'Bentuk kegagalan yang paling umum punya nama sendiri, dan ia menggabungkan seluruh biaya microservice tanpa satu pun manfaatnya.',
      ),
      code(
        'text',
        `
        MONOLIT TERDISTRIBUSI
        Beberapa layanan, satu basis data bersama.

        Gejalanya:
          - setiap perubahan skema menyentuh beberapa layanan
          - layanan tidak bisa dirilis sendiri-sendiri
          - "kami harus merilis bersamaan" menjadi kalimat sehari-hari
          - transaksi lintas layanan tetap mustahil

        Dan seluruh biaya tetap dibayar:
          dihitung, 10 komponen berantai @ 99,9% -> 87,2 jam/tahun
          diukur, tiap panggilan membayar 1,69 ms sampai 70 ms

        Bentuk ini lebih buruk daripada monolit MAUPUN microservice
        yang benar.
        `,
      ),
      p('Kegagalan kedua bersifat waktu, yaitu memecah sebelum batasnya terbukti.'),
      code(
        'text',
        `
        Memindahkan batas DI DALAM satu proses:
          ubah beberapa impor, jalankan test, selesai dalam sehari

        Memindahkan batas ANTAR LAYANAN:
          pindahkan tabel, tulis penulisan ganda, backfill,
          pindahkan pembacaan, hapus yang lama
          dan selama itu kedua bentuk harus tetap bekerja

        Diukur di bab Deployment, biaya memindahkan data:
          283 byte/baris, 1 tahun @ 100 juta/hari -> 10,3 TB

        Karena itu urutan yang jauh lebih murah: temukan batasnya
        di dalam monolit lebih dulu, buktikan ia benar selama
        beberapa bulan, baru pecah.
        `,
        {
          caption:
            'Batas yang sudah terbukti di dalam satu proses adalah batas yang sudah siap dipecah.',
        },
      ),
      code(
        'text',
        `
        KEGAGALAN KETIGA: memecah karena gejala yang menuntut
        perbaikan lain.

        Diukur di bab lain pada project yang sama:

          "Query-nya lambat"
            agregasi 468,9 ms -> kolom denormalisasi 0,068 ms
            memecahnya menghasilkan empat query lambat

          "Build-nya lambat"
            penyebabnya pertentangan memori, bukan ukuran codebase.
            CIRCLE_NODE_TOTAL=2 npm run build -> EXIT=0, 15,9 detik

          "Deploy-nya menakutkan"
            yang dibutuhkan pipeline, rollback teruji, dan saklar
            fitur — bukan memecah sistem

          "Kodenya berantakan"
            batas internal yang ditegakkan menyelesaikannya tanpa
            satu pun panggilan jaringan
        `,
      ),
      p('Kegagalan keempat menyangkut hal yang ikut terbagi tanpa direncanakan.'),
      code(
        'text',
        `
        Yang IKUT terbagi saat sistem dipecah, dan sering lupa
        dihitung:

          pemantauan     : satu dasbor per layanan, atau tidak ada
                           yang melihat gambaran utuhnya
          penelusuran    : tanpa penanda korelasi, satu permintaan
                           meninggalkan lima baris log yang tidak
                           bisa disambungkan
          penyebaran     : lima pipeline, bukan satu
          lingkungan lokal: menjalankan seluruh sistem di laptop
                           menjadi pekerjaan tersendiri
          versi kontrak  : setiap perubahan kontrak menuntut masa
                           tumpang tindih

        Kelimanya adalah pekerjaan yang tidak ada sebelum pemecahan,
        dan harus tetap dikerjakan selamanya sesudahnya.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Microservice adalah keputusan yang paling sering diambil karena alasan yang salah, dan paling mahal dibatalkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memecah karena codebase-nya sudah besar',
            'Katanya tidak bisa menskala',
            'Dihitung, 10 komponen berantai @ 99,9% menghasilkan 87,2 jam mati per tahun',
          ],
          [
            'Memecah dengan basis data yang tetap bersama',
            'Kodenya kan sudah terpisah',
            'Seluruh biaya dibayar tanpa satu pun manfaatnya. Ini bentuk terburuk dari keduanya',
          ],
          [
            'Memecah sebelum batasnya terbukti',
            'Nanti disesuaikan',
            'Memindahkan batas antar layanan berarti memindahkan data. Diukur, 10,3 TB di tahun pertama',
          ],
          [
            'Memecah karena query-nya lambat',
            'Bebannya kan terbagi',
            'Diukur, satu perubahan query mengubah 468,9 ms menjadi 0,068 ms tanpa komponen baru',
          ],
          [
            'Mengabaikan biaya latensi ekor',
            'Tiap layanan kan cepat',
            'Dihitung, 10 layanan dengan p99 1% masing-masing menghasilkan 9,6% permintaan kena ekor',
          ],
          [
            'Lupa menghitung pemantauan dan penelusuran',
            'Itu urusan nanti',
            'Tanpa penanda korelasi, satu permintaan meninggalkan lima baris log yang tidak bisa disambungkan',
          ],
        ],
      ),
      p(
        'Ada satu pertanyaan yang memisahkan alasan yang sah dari yang tidak, dan ia tidak menyebut teknologi sama sekali. Apakah ada dua tim atau lebih yang saat ini harus menunggu satu sama lain untuk merilis? Bila jawabannya tidak, hampir setiap masalah yang terlihat menuntut microservice sebenarnya menuntut batas internal yang ditegakkan, dan itu bisa didapat tanpa satu pun panggilan jaringan.',
      ),
      references(
        {
          label: 'Microservices architecture style',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices',
          source: 'Microsoft',
          note: 'Manfaat dan tantangan disebut berdampingan, termasuk kapan gaya ini tidak cocok.',
        },
        {
          label: 'Microservices on AWS',
          href: 'https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/microservices-on-aws.html',
          source: 'Amazon Web Services',
          note: 'Termasuk pembahasan database per service dan akibatnya pada konsistensi.',
        },
        {
          label: 'Designing interservice communication',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/microservices/design/interservice-communication',
          source: 'Microsoft',
          note: 'Apa yang berubah begitu panggilan fungsi berubah menjadi panggilan jaringan.',
        },
      ),
    ],
  ),

  written(
    'memecah-yang-pertama',
    'Memecah Layanan yang Pertama',
    20,
    'Cara menarik satu bagian keluar tanpa menghentikan aplikasi yang sedang berjalan.',
    [
      p(
        'Anggap keempat sebab di sub-bab sebelumnya sudah dijawab dan jawabannya memang menunjuk pemecahan. Pertanyaan berikutnya terdengar sepele tetapi menentukan segalanya, yaitu **bagian mana yang keluar duluan**.',
      ),
      p(
        'Analogi yang tepat di sini adalah pindah rumah. Kamu tidak mengangkut seluruh isi rumah dalam satu perjalanan lalu berharap semuanya sampai dengan selamat. Kamu memindahkan sedikit demi sedikit, mulai dari barang yang paling tidak berisiko, sambil rumah lama tetap bisa ditinggali sampai perpindahannya benar-benar selesai.',
      ),
      p(
        'Alasannya sama persis dengan memecah aplikasi. Memecah semuanya sekaligus berarti mengganti sistem yang sudah terbukti jalan dengan sistem yang belum pernah dijalankan siapa pun, dan itu taruhan yang tidak perlu diambil. Menarik keluar satu bagian memberi kamu kesempatan belajar dengan risiko kecil, sekaligus memberi bukti apakah pemecahan berikutnya memang sepadan.',
      ),

      terms(
        {
          term: 'strangler fig pattern',
          meaning:
            'Cara memindahkan fungsi dari sistem lama ke sistem baru sedikit demi sedikit, dengan sebuah lapisan di depan yang mengarahkan tiap permintaan ke tempat yang benar. Dibaca "strengler fig". Namanya diambil dari pohon ara pencekik yang tumbuh melilit pohon inangnya, perlahan mengambil alih tugasnya, sampai akhirnya pohon inangnya lapuk dan pohon ara itu berdiri sendiri. Yang penting dari analogi ini adalah **tidak pernah ada momen pohon inangnya ditebang mendadak**, dan begitu pula pemindahan yang benar tidak pernah punya satu malam menegangkan.',
        },
        {
          term: 'facade (fasad)',
          meaning:
            'Lapisan tipis di depan yang menyembunyikan dari pemanggil bahwa di belakangnya ada dua sistem berbeda. Dibaca "fasad", diambil dari istilah arsitektur bangunan yang berarti muka bangunan. Idenya sama, yaitu dari luar tampak satu wajah utuh, padahal di belakangnya bisa ada dua bangunan berbeda usia. Dalam pemecahan bertahap, fasad inilah yang membuat kode pemanggil tidak perlu diubah sama sekali meskipun isi di belakangnya sedang pindah.',
        },
        {
          term: 'dual write (penulisan ganda)',
          meaning:
            'Menulis data yang sama ke dua tempat sekaligus selama masa peralihan. Dibaca "dual rait". Cara ini sederhana tetapi berbahaya, karena satu penulisan bisa berhasil dan yang lain gagal sehingga kedua tempat berbeda isi tanpa ada yang tahu.',
        },
        {
          term: 'backfill',
          meaning:
            'Memindahkan data lama ke tempat baru supaya tempat baru punya riwayat lengkap, bukan hanya data yang masuk sesudah peralihan. Dibaca "bekfil", artinya mengisi ke belakang. Tanpa langkah ini, sistem baru hanya tahu kejadian sejak ia dinyalakan, sehingga halaman riwayat pengguna tiba-tiba kosong untuk semua transaksi sebelum tanggal peralihan. Backfill biasanya dijalankan bertahap dalam potongan kecil, misalnya seribu baris tiap kali, supaya tidak membebani database yang sedang melayani pengguna sungguhan.',
        },
        {
          term: 'shadow mode (mode bayangan)',
          meaning:
            'Menjalankan sistem baru berdampingan dengan sistem lama tanpa memakai hasilnya, semata untuk membandingkan jawabannya. Dibaca "syedou moud", artinya mode bayangan, karena sistem baru mengikuti setiap gerak sistem lama seperti bayangan tanpa pernah menyentuh apa pun. Analoginya seperti karyawan baru yang mengerjakan pekerjaan yang sama diam-diam selama seminggu, lalu hasilnya dibandingkan dengan karyawan lama, sebelum ia benar-benar dipercaya melayani pelanggan.',
        },
        {
          term: 'feature flag',
          meaning:
            'Sakelar yang menentukan jalur mana yang dipakai saat aplikasi berjalan, tanpa perlu merilis ulang. Dibaca "fitur fleg". Wujud paling sederhananya adalah satu nilai di database atau di environment variable yang dibaca aplikasi tiap permintaan, misalnya angka 5 yang berarti lima persen permintaan diarahkan ke jalur baru. Nilainya inilah yang membuat pengalihan bisa dinaikkan perlahan dan dibatalkan dalam hitungan detik tanpa deploy apa pun.',
        },
      ),

      h2('Memilih yang pertama'),
      p(
        'Bagian pertama yang ditarik keluar sebaiknya dipilih karena ia **mudah**, bukan karena ia paling penting. Tujuan pemecahan pertama adalah membuktikan bahwa tim ini sanggup menjalankan dua unit rilis, bukan menyelesaikan masalah terbesar.',
      ),
      table(
        ['Ciri kandidat', 'Kenapa memudahkan'],
        [
          [
            'Datanya sedikit bersinggungan dengan data lain',
            'Memisahkan penyimpanannya tidak memaksa membongkar relasi yang rumit',
          ],
          [
            'Tidak berada di jalur permintaan yang paling ramai',
            'Kalau ada masalah, dampaknya terbatas dan tidak langsung terasa pengguna',
          ],
          [
            'Sudah punya batas modul yang jelas hari ini',
            'Permukaannya sudah ada, sehingga pemecahan berarti mengganti isi satu berkas',
          ],
          [
            'Pekerjaannya asinkron atau boleh sedikit tertunda',
            'Kegagalan sementara bisa diulang tanpa pengguna menunggu',
          ],
          [
            'Punya alasan nyata untuk terpisah',
            'Tanpa alasan nyata, pemecahan pertama hanya latihan yang biayanya tetap dibayar',
          ],
        ],
        'Kandidat yang paling sering memenuhi semuanya adalah pengiriman notifikasi, pemrosesan berkas, dan pembuatan laporan.',
      ),
      p(
        'Sebaliknya, kandidat yang paling buruk untuk pemecahan pertama adalah bagian yang berada di tengah hampir semua alur, misalnya modul pengguna atau modul autentikasi. Bagian seperti itu bersinggungan dengan segalanya, sehingga memecahnya berarti menghadapi semua kesulitan sekaligus di percobaan pertama.',
      ),

      h2('Enam langkah yang urutannya menentukan'),
      p(
        'Urutan berikut dirancang supaya setiap langkah bisa dibatalkan sendiri, dan supaya tidak ada satu titik pun ketika aplikasi bergantung pada sesuatu yang belum terbukti.',
      ),
      steps(
        {
          title: '1. Pastikan batas modulnya sudah tegak lebih dulu',
          body: 'Kalau bagian ini masih diimpor langsung isinya dari mana-mana, rapikan dulu sampai seluruh pemanggil lewat satu pintu masuk resmi. Langkah ini seluruhnya di dalam satu aplikasi, bisa dijalankan bertahap, dan tidak berisiko. Melewatinya berarti seluruh langkah berikutnya berjalan di atas fondasi yang goyah.',
        },
        {
          title: '2. Pindahkan kepemilikan datanya',
          body: 'Pastikan tabel milik bagian ini hanya disentuh bagian ini. Kalau masih ada modul lain yang membacanya langsung, sediakan fungsi resmi lalu ubah pemanggilnya. Ini biasanya langkah paling lama, dan sekaligus langkah yang paling menentukan apakah pemecahan akan berhasil.',
        },
        {
          title: '3. Bangun layanan baru yang isinya menjalankan kode yang sama',
          body: 'Layanan baru menjalankan logika yang sama persis, dengan penyimpanan yang masih menunjuk database yang sama. Belum ada pengguna yang diarahkan ke sana. Tujuannya membuktikan layanan itu bisa dibangun, dirilis, dipantau, dan dijalankan.',
        },
        {
          title: '4. Jalankan dalam mode bayangan',
          body: 'Aplikasi lama tetap melayani, tetapi setiap permintaan juga dikirim ke layanan baru dan jawabannya dibandingkan tanpa dipakai. Selisih yang muncul dicatat sebagai metrik. Jalankan sampai selisihnya nol selama beberapa hari, dan perbedaan yang muncul di sini hampir selalu mengajarkan sesuatu yang tidak terlihat saat membaca kode.',
        },
        {
          title: '5. Alihkan bertahap lewat feature flag',
          body: 'Mulai dari satu persen permintaan, lalu sepuluh, lalu lima puluh, lalu seratus. Setiap tahap diawasi memakai golden signal yang dibahas di [golden signal dan SLO](/kelas/system-design/keandalan-studi-kasus/golden-signal-slo). Pengalihan bisa dibatalkan dalam hitungan detik tanpa merilis apa pun.',
        },
        {
          title: '6. Pisahkan penyimpanannya, lalu hapus kode lama',
          body: 'Setelah seluruh lalu lintas berpindah dan stabil beberapa minggu, barulah database dipisahkan sungguhan. Kode lama dihapus setelah itu, bukan sebelumnya, supaya jalan kembali tetap terbuka selama masa peralihan.',
        },
      ),
      callout(
        'warning',
        'Langkah dua adalah yang paling sering dilewati dan paling mahal akibatnya',
        'Godaan terbesar adalah membiarkan layanan baru dan aplikasi lama sama-sama membaca tabel yang sama secara permanen, karena itu jauh lebih cepat. Kalau itu terjadi, kamu baru saja membangun distributed monolith. Layanan baru tidak akan pernah bisa mengubah bentuk datanya, dan kemandirian rilis yang menjadi alasan seluruh pekerjaan ini tidak pernah tercapai.',
      ),

      h2('Fasad yang menyembunyikan peralihan'),
      p(
        'Selama masa peralihan, pemanggil sebaiknya tidak tahu apa-apa. Yang berubah hanya isi satu berkas, yaitu berkas pintu masuk modul yang sedang dipindahkan.',
      ),
      code(
        'ts',
        `
        // src/notifikasi/index.ts
        // Pintu masuk yang sama seperti sebelumnya. Pemanggil tidak berubah sedikit pun.

        import { kirimLokal } from './layanan-lokal';
        import { kirimLewatLayanan } from './klien-layanan-notifikasi';
        import { persentasePengalihan } from '@/bersama/flag';

        export async function kirimNotifikasi(perintah: PerintahNotifikasi): Promise<void> {
          const pakaiLayananBaru = Math.random() * 100 < persentasePengalihan('notifikasi');

          if (!pakaiLayananBaru) {
            return kirimLokal(perintah);
          }

          try {
            return await kirimLewatLayanan(perintah);
          } catch (galat) {
            // Selama peralihan, kegagalan layanan baru jatuh kembali ke jalur lama.
            // Dicatat sebagai metrik supaya kegagalan tidak lewat begitu saja.
            metrik.tambah('notifikasi.fallback_ke_lokal');
            return kirimLokal(perintah);
          }
        }
        `,
        {
          filename: 'src/notifikasi/index.ts',
          caption:
            'Fallback ini sementara dan sengaja dihapus setelah pengalihan selesai, bukan dibiarkan selamanya.',
        },
      ),
      p(
        'Blok `catch` di atas layak diberi catatan supaya tidak disalahpahami. Ia melanggar prinsip jangan menelan error yang disebut di sub-bab 1.5, dan pelanggaran itu **disengaja serta dibatasi waktu**. Ia sah karena selama peralihan jalur lama masih ada dan masih benar, dan karena kegagalannya tetap tercatat sebagai metrik. Begitu pengalihan mencapai seratus persen dan stabil, seluruh blok ini dihapus bersama jalur lamanya.',
      ),

      h2('Memisahkan data tanpa penulisan ganda'),
      p(
        'Langkah keenam adalah bagian yang paling berisiko karena menyangkut data. Cara yang paling menggoda adalah menulis ke dua database sekaligus selama peralihan, dan cara itu punya cacat yang tidak bisa diperbaiki.',
      ),
      compare(
        {
          title: 'Penulisan ganda, rawan',
          lang: 'ts',
          code: `
            await dbLama.notifikasi.create({ data: catatan });
            await dbBaru.notifikasi.create({ data: catatan });

            // Kalau penulisan kedua gagal, yang pertama sudah terlanjur tersimpan.
            // Kedua database berbeda isi, dan tidak ada yang tahu sampai ada yang membandingkan.
          `,
          notes: [
            'Tidak ada transaksi yang menjangkau dua database',
            'Kegagalan sebagian menghasilkan selisih yang diam',
            'Selisihnya menumpuk seiring waktu',
          ],
        },
        {
          title: 'Satu penulis, satu penyalin',
          lang: 'ts',
          code: `
            // Satu-satunya penulis selama peralihan tetap database lama.
            await dbLama.notifikasi.create({ data: catatan });

            // Penyalinan dikerjakan terpisah dan aman diulang, memakai id sebagai penanda.
            await antrean.tambah('salin-notifikasi', { id: catatan.id });
          `,
          notes: [
            'Satu sumber kebenaran selama peralihan',
            'Penyalinan yang gagal cukup diulang tanpa menggandakan data',
            'Selisih bisa diukur dengan membandingkan jumlah baris',
          ],
        },
      ),
      p(
        'Kolom kanan memakai antrean yang sudah kamu kenal dari sub-bab [antrean pesan](/kelas/system-design/blok-penyusun/antrean-pesan). Yang membuatnya aman adalah pengerjanya idempoten, yaitu memakai `id` yang sama sehingga menjalankannya dua kali menghasilkan satu baris, bukan dua.',
      ),
      code(
        'sql',
        `
        -- Pemeriksaan selisih yang dijalankan berkala selama peralihan.
        -- Hasil bukan nol berarti penyalinan tertinggal atau ada yang gagal diam-diam.

        SELECT
          (SELECT count(*) FROM lama.notifikasi WHERE dibuat_pada >= now() - interval '1 day')
          -
          (SELECT count(*) FROM baru.notifikasi WHERE dibuat_pada >= now() - interval '1 day')
          AS selisih_sehari;
        `,
        {
          caption:
            'Selisih yang tidak diukur akan ditemukan oleh pengguna, biasanya pada saat yang paling tidak nyaman.',
        },
      ),

      h2('Kapan berhenti memecah'),
      p(
        'Setelah pemecahan pertama berhasil, godaan berikutnya adalah melanjutkan sampai semuanya terpecah. Itu bukan kesimpulan yang otomatis benar. Setiap pemecahan berikutnya harus melewati empat sebab yang sama seperti yang pertama.',
      ),
      ul(
        'Kalau bagian berikutnya tidak punya jadwal rilis yang berbeda, biarkan ia di tempatnya.',
        'Kalau batasnya masih sering bergerak, tunggu sampai berhenti bergerak.',
        'Kalau pemecahan pertama ternyata menambah waktu penyelesaian masalah secara nyata, perbaiki dulu kemampuan operasionalnya sebelum menambah layanan kedua.',
        'Susunan campuran yaitu satu monolit modular ditambah dua sampai tiga layanan yang memang perlu terpisah adalah bentuk yang sangat umum dan sangat sehat. Ia bukan tahap setengah jadi.',
      ),
      callout(
        'tip',
        'Bentuk campuran adalah tujuan yang sah',
        'Tidak ada aturan yang menyatakan sebuah sistem harus sepenuhnya monolit atau sepenuhnya microservice. Kebanyakan sistem yang sehat berada di tengah, yaitu inti yang tetap satu unit rilis, ditambah beberapa layanan yang keluar karena punya alasan nyata. Berhenti di titik itu bukan kegagalan menyelesaikan pekerjaan.',
      ),

      h2('Rangkuman'),
      ul(
        'Pilih bagian pertama karena mudah, bukan karena penting. Tujuannya membuktikan kesanggupan, bukan menyelesaikan masalah terbesar.',
        'Urutannya yaitu tegakkan batas, pindahkan kepemilikan data, bangun layanan, jalankan bayangan, alihkan bertahap, lalu pisahkan penyimpanan.',
        'Melewati langkah kepemilikan data menghasilkan distributed monolith, dan kemandirian rilis tidak akan pernah tercapai.',
        'Fasad membuat pemanggil tidak perlu tahu ada peralihan, dan feature flag membuat pembatalan memakan hitungan detik.',
        'Hindari penulisan ganda. Pakai satu penulis ditambah penyalinan yang aman diulang, lalu ukur selisihnya berkala.',
        'Bentuk campuran adalah tujuan yang sah. Setiap pemecahan berikutnya harus melewati empat sebab yang sama.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Layanan pertama yang dipecah menentukan apakah sisanya akan berjalan. Yang dipilih sebaiknya bukan yang paling penting melainkan yang paling mudah dilepas.',
      ),
      code(
        'text',
        `
        Ciri kandidat yang baik:

          - punya batas yang SUDAH jelas di dalam monolit
          - datanya hampir tidak dibagi dengan bagian lain
          - polanya asinkron, sehingga latensi tambahan tidak terasa
          - bebannya berbeda dari sisanya, sehingga penskalaan
            terpisah memang berguna
          - kegagalannya bisa ditoleransi sementara

        Contoh yang sering cocok:
          pengiriman surel dan notifikasi
          pengolahan gambar dan berkas
          pembuatan laporan
          pengindeksan pencarian

        Contoh yang hampir selalu buruk sebagai yang pertama:
          autentikasi (semua bergantung padanya)
          katalog produk (datanya dipakai semua orang)
          pesanan (pusat dari hampir semua transaksi)
        `,
        { caption: 'Yang pertama sebaiknya yang bila gagal, sistemnya masih bisa melayani.' },
      ),
      p('Alasan memilih yang asinkron bisa dihitung dari angka latensi yang sudah diukur.'),
      code(
        'text',
        `
        Diukur sungguhan:
          pemanggilan fungsi   puluhan nanodetik
          loopback             1,69 ms
          internet             p50 70,04 ms, p99 362,72 ms

        Untuk pekerjaan SINKRON di jalur permintaan, tambahan 1,69 ms
        per panggilan langsung terasa bila ada beberapa panggilan.

        Untuk pekerjaan ASINKRON lewat antrean, tambahan itu tidak
        terlihat pengguna sama sekali — permintaannya sudah dijawab
        202 sebelum pekerjaannya dimulai.

        Dan diukur di bab lain, manfaat memindahkannya:
          pekerjaan berat SINKRON  : permintaan ringan 73,9 - 74,6 ms
          pekerjaan berat ASINKRON : permintaan ringan  6,1 -  7,5 ms
        `,
      ),
      p(
        'Urutan pemecahannya menentukan apakah ada jalan mundur, dan bentuk yang aman punya lima langkah.',
      ),
      code(
        'text',
        `
        1. TARIK BATASNYA DI DALAM monolit
           Satu modul, satu pintu masuk, tidak berbagi tabel.
           Jalankan begitu selama beberapa bulan.

        2. PISAHKAN DATANYA, masih di dalam monolit
           Tabel milik modul itu hanya disentuh modul itu.
           Ini langkah yang paling sering dilewati, dan paling mahal
           bila dilewati.

        3. PINDAHKAN KODE-nya keluar, panggil lewat jaringan
           Pintu masuk modul menjadi klien HTTP. Satu tempat berubah.

        4. JALANKAN KEDUANYA bersamaan
           Saklar fitur menentukan mana yang dipakai. Bandingkan
           hasilnya sebelum mematikan yang lama.

        5. HAPUS yang lama
           Baru setelah langkah 4 berjalan tanpa selisih.

        Langkah 4 yang membuat pemecahan ini bisa dibatalkan.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan pemecahan pertama biasanya bukan pada layanannya melainkan pada apa yang tidak ikut dipindahkan.',
      ),
      code(
        'text',
        `
        1. Datanya tidak ikut dipindah

           Layanan baru membaca tabel yang sama dengan monolit.
           Hasilnya monolit terdistribusi: semua biaya, tanpa manfaat.

           Dihitung: 2 komponen berantai @ 99,9% -> 99,8%
           Diukur  : tiap panggilan membayar 1,69 ms sampai 70 ms

        2. Transaksi yang tadinya satu kini terpecah

           Di monolit: satu transaksi.
           Sesudah dipecah: dua penulisan, dan yang kedua gagal.
           Yang pertama TIDAK dibatalkan.

           Yang menutupnya bukan transaksi terdistribusi melainkan
           kotak keluar transaksional: tulis niatnya ke tabel DI
           DALAM transaksi yang sama, lalu kirim dari tabel itu.

           Diuji di bab Desain API: satu kunci idempotensi, lima
           permintaan bersamaan -> satu pembayaran yang lahir.

        3. Kegagalan layanan baru menjatuhkan monolit

           const hasil = await layananBaru.kirim(...);   // melempar

           Bila tidak dibungkus, layanan baru yang mati membuat
           monolit ikut gagal.

           Yang menutupnya: batas waktu, pemutus sirkuit, dan
           perilaku degradasi yang dirancang sejak awal.
        `,
      ),
      p('Kegagalan keempat khas dan sering tidak disadari sampai terjadi.'),
      code(
        'text',
        `
        PENGULANGAN YANG MEMPERBURUK

          Layanan baru melambat.
          Monolit mengulang panggilannya.
          Beban ke layanan baru naik dua kali lipat, justru saat ia
          paling tidak sanggup.
          Ia makin melambat, dan pengulangan makin banyak.

        Yang menutupnya:
          backoff yang membesar DENGAN komponen acak
          pemutus sirkuit yang BERHENTI mencoba setelah sekian
          kegagalan berturut-turut
          batas jumlah pengulangan

        Jeda tetap membuat semua pemanggil mencoba pada detik yang
        sama persis, dan itu memperburuk, bukan memperbaiki.
        `,
        {
          caption:
            'Mekanisme pemulihan yang tidak dirancang sering menjadi penyebab pemadaman, bukan penawarnya.',
        },
      ),
      code(
        'text',
        `
        KEGAGALAN KELIMA: yang ikut terbagi dan lupa disiapkan.

          penelusuran   : tanpa penanda korelasi, satu permintaan
                          meninggalkan dua baris log yang tidak bisa
                          disambungkan
          penyebaran    : dua pipeline, bukan satu
          lingkungan lokal: menjalankan keduanya di laptop
          versi kontrak : perubahan kontrak menuntut masa tumpang tindih

        Penanda korelasi paling murah dipasang SEBELUM pemecahan,
        saat masih ada satu proses:
          satu id dibuat di pintu masuk, diteruskan ke setiap
          panggilan keluar, dan ikut ke setiap baris log
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pemecahan pertama sering diperlakukan sebagai pekerjaan teknis, padahal sebagian besarnya adalah urutan dan kemampuan membatalkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memecah bagian yang paling penting lebih dulu',
            'Itu yang paling butuh diskalakan',
            'Bila gagal, seluruh sistem ikut gagal. Pilih yang paling mudah dilepas sebagai yang pertama',
          ],
          [
            'Memindahkan kode tanpa memindahkan data',
            'Datanya kan sama',
            'Hasilnya monolit terdistribusi. Dihitung, seluruh biaya berantai dan latensi tetap dibayar',
          ],
          [
            'Mengganti satu transaksi dengan dua penulisan',
            'Keduanya kan akan berhasil',
            'Yang kedua bisa gagal, dan yang pertama tidak dibatalkan. Pakai kotak keluar transaksional',
          ],
          [
            'Memanggil layanan baru tanpa batas waktu',
            'Biasanya cepat',
            'Layanan baru yang mati menjatuhkan monolit. Pasang batas waktu dan pemutus sirkuit',
          ],
          [
            'Mengulang panggilan yang gagal tanpa backoff',
            'Nanti juga berhasil',
            'Beban naik dua kali lipat justru saat hilirnya paling lemah. Pakai backoff acak yang membesar',
          ],
          [
            'Memasang penanda korelasi sesudah dipecah',
            'Nanti kalau perlu',
            'Jauh lebih murah dipasang saat masih satu proses. Sesudahnya, lognya sudah tidak bisa disambungkan',
          ],
        ],
      ),
      p(
        'Langkah yang paling sering dilewati dari kelima langkah di atas adalah yang kedua, yaitu memisahkan datanya sementara kodenya masih berada di satu proses. Langkah itu tidak menghasilkan apa pun yang terlihat, tidak menambah satu pun kemampuan, dan justru ia yang menentukan apakah pemecahan berikutnya menjadi pekerjaan sehari atau pekerjaan berbulan-bulan.',
      ),
      references(
        {
          label: 'Strangler Fig pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig',
          source: 'Microsoft',
          note: 'Pola pemindahan bertahap beserta peran fasad di depannya.',
        },
        {
          label: 'Migrate a monolith to microservices',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/microservices/migrate-monolith',
          source: 'Microsoft',
          note: 'Urutan langkah pemindahan, termasuk kenapa kepemilikan data didahulukan.',
        },
        {
          label: 'Strangler fig — AWS Prescriptive Guidance',
          href: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-aspnet-web-services/strangler-fig.html',
          source: 'Amazon Web Services',
          note: 'Versi AWS dengan penekanan pada pengalihan lalu lintas secara bertahap.',
        },
      ),
    ],
  ),

  written(
    'serverless-dan-edge',
    'Serverless dan Fungsi di Edge',
    21,
    'Sumbu yang berbeda dari monolit dan microservice, beserta harga yang jarang disebut.',
    [
      p(
        'Serverless sering ditaruh sebaris dengan monolit dan microservice, seolah ketiganya tiga pilihan dari satu daftar yang harus kamu pilih salah satu. Penempatan itu keliru, dan ia menyebabkan banyak kebingungan yang sebenarnya tidak perlu.',
      ),
      p(
        'Cara membedakannya begini. Bayangkan kamu memutuskan soal kendaraan. Pertanyaan pertama, mau satu mobil besar atau beberapa motor. Pertanyaan kedua, mau beli sendiri atau pakai ojek online. Kedua pertanyaan itu berdiri sendiri. Kamu bisa beli satu mobil, bisa pakai ojek beberapa kali, dan tidak ada yang aneh dari kombinasi mana pun.',
      ),
      p(
        'Monolit dan microservice menjawab pertanyaan pertama, yaitu **bagaimana sistem dibagi**. Serverless menjawab pertanyaan kedua, yaitu **bagaimana kode dijalankan dan dibayar**. Beli sendiri berarti server yang menyala terus dan dibayar bulanan entah dipakai atau tidak. Ojek online berarti dibayar hanya saat dipakai, dengan konsekuensi ada waktu menunggu jemputan.',
      ),
      p(
        'Akibat praktisnya, serverless bisa dipakai bersama bentuk mana pun. Monolit bisa berjalan sebagai fungsi serverless. Satu microservice di antara sepuluh bisa berjalan serverless sementara sisanya berjalan sebagai container biasa. Aplikasi Next.js yang kamu kenal dari kategori Frontend Intermediate sudah berjalan dengan model ini ketika dideploy ke Vercel.',
      ),

      terms(
        {
          term: 'serverless',
          meaning:
            'Model menjalankan kode ketika ada permintaan, tanpa kamu mengelola server yang menyalakannya. Dibaca "serverles", artinya tanpa server. Namanya menyesatkan dan sebaiknya kamu tahu itu sejak awal, karena servernya jelas tetap ada. Yang hilang bukan servernya, melainkan urusanmu dengan server itu. Sama seperti "tanpa dapur" pada layanan katering, yaitu dapurnya tetap ada, hanya saja bukan dapurmu dan bukan kamu yang membersihkannya.',
        },
        {
          term: 'function as a service (FaaS)',
          meaning:
            'Bentuk serverless yang satuannya sebuah fungsi, dipanggil oleh sebuah kejadian misalnya permintaan HTTP, pesan masuk ke antrean, atau jadwal. Disingkat FaaS, dibaca "fas". Contohnya AWS Lambda, Azure Functions, dan route handler Next.js yang dideploy ke Vercel.',
        },
        {
          term: 'cold start',
          meaning:
            'Jeda tambahan ketika sebuah fungsi dipanggil tetapi belum ada salinannya yang siap, sehingga lingkungannya harus disiapkan lebih dulu. Dibaca "kold start", artinya start dingin. Analoginya menunggu jemputan ojek, yaitu kalau kebetulan ada yang dekat kamu langsung berangkat, kalau tidak ada kamu menunggu dulu beberapa menit. Besarnya bergantung ukuran kode dan runtime yang dipakai, biasanya ratusan milidetik sampai beberapa detik, dan ia terasa paling sering justru pada lalu lintas yang jarang.',
        },
        {
          term: 'edge (tepi jaringan)',
          meaning:
            'Titik penyajian yang tersebar dekat dengan pengguna, sama seperti simpul CDN pada sub-bab [DNS dan CDN](/kelas/system-design/blok-penyusun/dns-dan-cdn). Dibaca "ej". Menjalankan kode di edge berarti kode itu dieksekusi di titik terdekat dengan pengguna, sehingga jarak jaringannya jauh lebih pendek.',
        },
        {
          term: 'stateless (tanpa keadaan)',
          meaning:
            'Sifat kode yang tidak menyimpan apa pun di memorinya untuk permintaan berikutnya. Dibaca "steitles". Serverless memaksakan sifat ini karena kamu tidak pernah tahu apakah permintaan berikutnya dilayani salinan yang sama. Sub-bab [server stateless](/kelas/system-design/blok-penyusun/server-stateless) menjelaskan syaratnya.',
        },
        {
          term: 'connection pool exhaustion',
          meaning:
            'Keadaan ketika jumlah sambungan ke database habis karena terlalu banyak pemakai sambungan sekaligus. Dibaca "koneksyen pul eksosyen", artinya kehabisan kolam sambungan. Kenapa ini masalah khas serverless. Satu server yang menyala terus membuka sepuluh sambungan lalu memakainya bergantian untuk ribuan permintaan. Seratus salinan fungsi serverless yang menyala bersamaan masing-masing ingin membuka sambungan sendiri, dan PostgreSQL bawaan hanya mengizinkan sekitar seratus sambungan sekaligus. Akibatnya database menolak, dan errornya muncul justru saat aplikasi sedang ramai.',
        },
        {
          term: 'vendor lock-in',
          meaning:
            'Keadaan ketika berpindah dari satu penyedia menjadi mahal karena terlalu banyak hal yang menempel pada layanan khasnya. Dibaca "vendor lok-in". Pada serverless, lock-in datang bukan dari fungsinya melainkan dari layanan sekitarnya yaitu antrean, pemicu, autentikasi, dan penyimpanan berkas milik penyedia itu.',
        },
      ),

      h2('Dua sumbu, bukan satu daftar'),
      p(
        'Cara paling jelas menaruh serverless pada tempatnya adalah memisahkan dua pertanyaan yang selama ini sering dicampur.',
      ),
      table(
        ['Pertanyaan', 'Pilihannya', 'Dibahas di'],
        [
          [
            'Bagaimana sistem dibagi',
            'Monolit, modular monolith, atau beberapa layanan',
            'Sub-bab 2.1 sampai 2.6',
          ],
          [
            'Bagaimana kode dijalankan dan dibayar',
            'Server yang selalu menyala, container, atau serverless',
            'Sub-bab ini',
          ],
        ],
        'Kedua baris dipilih terpisah, sehingga monolit serverless dan microservice non-serverless sama-sama masuk akal.',
      ),
      code(
        'text',
        `
        Kombinasi yang semuanya wajar ditemui:

        monolit          + server selalu menyala   -> aplikasi Express di VPS
        monolit          + serverless              -> Next.js di Vercel
        modular monolith + container               -> satu image Docker, beberapa salinan
        beberapa layanan + container               -> susunan microservice yang umum
        beberapa layanan + campuran                -> layanan inti container,
                                                      pemrosesan gambar serverless
        `,
        {
          caption: 'Tidak ada kombinasi yang otomatis salah. Yang menentukan adalah pola bebannya.',
        },
      ),

      h2('Kapan serverless benar-benar menguntungkan'),
      p(
        'Serverless punya keunggulan yang sangat nyata pada pola beban tertentu, dan sangat merugikan pada pola beban yang lain. Yang menentukan bukan besar kecilnya beban melainkan **bentuk grafiknya**.',
      ),
      table(
        ['Pola beban', 'Serverless?', 'Alasan'],
        [
          [
            'Jarang dipakai, misalnya beberapa kali sehari',
            'Sangat cocok',
            'Server yang selalu menyala dibayar penuh untuk waktu menganggur. Serverless dibayar saat dipakai saja',
          ],
          [
            'Bergelombang tajam dan tidak terduga',
            'Sangat cocok',
            'Kapasitas naik sendiri tanpa harus menyiapkan mesin cadangan lebih dulu',
          ],
          [
            'Ramai dan rata sepanjang hari',
            'Biasanya kurang cocok',
            'Pada beban tetap yang tinggi, server yang selalu menyala hampir selalu lebih murah per permintaan',
          ],
          [
            'Pekerjaan yang berjalan lama, misalnya beberapa menit',
            'Perlu diperiksa',
            'Ada batas waktu eksekusi. Pekerjaan panjang lebih cocok berupa job antrean di pekerja yang selalu menyala',
          ],
          [
            'Butuh sambungan tetap, misalnya WebSocket',
            'Kurang cocok',
            'Model fungsi berumur pendek bertentangan dengan sambungan yang harus terus terbuka',
          ],
          [
            'Sensitif terhadap jeda pertama',
            'Perlu diperiksa',
            'Cold start menambah waktu pada permintaan pertama setelah masa sepi',
          ],
        ],
        'Baris pertama dan kedua adalah alasan sesungguhnya orang memilih serverless.',
      ),
      callout(
        'info',
        'Website ini sendiri contoh yang pas',
        'Ruang belajar yang sedang kamu baca adalah halaman statis yang dibuat saat build, disajikan dari CDN. Tidak ada fungsi yang menyala untuk melayani sub-bab ini. Kalau nanti ada bagian yang butuh perhitungan saat diminta, bagian itu bisa menjadi fungsi tanpa mengubah bentuk aplikasinya. Itulah yang dimaksud sumbu yang berbeda.',
      ),

      h2('Dua harga yang paling sering mengejutkan'),
      p(
        'Dua hal berikut jarang disebut di materi pengenalan serverless, padahal keduanya yang paling sering menjadi masalah nyata di aplikasi yang menyentuh database.',
      ),
      steps(
        {
          title: 'Sambungan database yang habis',
          body: 'Satu server yang selalu menyala membuka sepuluh sambungan lalu memakainya bergantian untuk ribuan permintaan. Seratus salinan fungsi yang menyala bersamaan ingin membuka sambungannya masing-masing, dan database punya batas. Penawarnya adalah connection pooler di depan database, atau driver yang bicara lewat HTTP alih-alih membuka sambungan tetap.',
        },
        {
          title: 'Cold start yang menumpuk di rantai panggilan',
          body: 'Satu cold start mungkin hanya menambah beberapa ratus milidetik. Kalau satu permintaan melewati tiga fungsi berurutan dan ketiganya sedang dingin, tambahannya berlipat. Penawarnya adalah memperpendek rantai, memperkecil ukuran kode, dan menjaga fungsi yang paling sensitif tetap hangat.',
        },
      ),
      code(
        'ts',
        `
        // Pola yang benar untuk fungsi serverless yang menyentuh database.
        // Klien dibuat di lingkup modul, bukan di dalam handler.

        import { PrismaClient } from '@prisma/client';

        // Lingkup modul: kalau salinan fungsi ini dipakai ulang untuk permintaan berikutnya,
        // klien yang sama ikut dipakai ulang dan tidak ada sambungan baru yang dibuka.
        const prisma = new PrismaClient();

        export async function GET(request: Request) {
          const daftar = await prisma.artikel.findMany({ take: 20 });
          return Response.json(daftar);
        }

        // Yang KELIRU adalah membuat klien di dalam handler:
        //   export async function GET() {
        //     const prisma = new PrismaClient();   <- sambungan baru tiap permintaan
        //     ...
        //   }
        `,
        {
          filename: 'app/api/artikel/route.ts',
          caption:
            'Perbedaan letak satu baris menentukan apakah sambungan database habis saat ramai.',
        },
      ),

      h2('Menjalankan kode di edge'),
      p(
        'Edge adalah lapisan lain lagi, yaitu menjalankan kode di titik yang dekat dengan pengguna. Manfaatnya sangat spesifik, dan begitu pula batasnya.',
      ),
      table(
        ['Cocok dijalankan di edge', 'Tidak cocok di edge', 'Kenapa'],
        [
          [
            'Pengalihan berdasarkan negara atau bahasa',
            'Query database utama',
            'Database biasanya berada di satu wilayah, sehingga jarak dari edge ke sana justru jauh',
          ],
          [
            'Memeriksa cookie sesi untuk memilih halaman',
            'Perhitungan berat yang memakan prosesor',
            'Lingkungan edge sengaja dibatasi supaya ringan dan cepat menyala',
          ],
          [
            'Uji A/B dan feature flag',
            'Pekerjaan yang butuh library Node lengkap',
            'Runtime di edge biasanya bukan Node penuh, sehingga sebagian modul tidak tersedia',
          ],
          [
            'Menambahkan header keamanan',
            'Apa pun yang butuh menyimpan keadaan',
            'Tidak ada tempat menyimpan yang bertahan antar permintaan',
          ],
        ],
        'Aturan pendeknya, edge cocok untuk keputusan cepat berdasarkan permintaan itu sendiri.',
      ),
      callout(
        'warning',
        'Menaruh kode dekat pengguna tidak membuat data ikut dekat',
        'Kesalahan paling sering adalah memindahkan sebuah endpoint ke edge lalu terkejut karena ia justru lebih lambat. Penyebabnya sederhana, yaitu kodenya memang dekat pengguna tetapi databasenya tetap berada di satu wilayah. Permintaan sekarang menempuh perjalanan dari pengguna ke edge, lalu dari edge ke database yang jauh, lalu kembali. Yang berpindah hanya tempat pemrosesan, bukan tempat datanya.',
      ),

      h2('Lock-in dan cara menahannya'),
      p(
        'Serverless memang mengikat lebih erat pada satu penyedia, tetapi sumber ikatannya sering disalahpahami. Fungsinya sendiri biasanya berisi kode biasa yang mudah dipindahkan. Yang mengikat adalah **layanan di sekitarnya**.',
      ),
      ol(
        'Pemicu bawaan penyedia, misalnya fungsi yang otomatis berjalan saat berkas diunggah ke penyimpanan miliknya.',
        'Antrean, notifikasi, dan penjadwal milik penyedia yang bentuk pesannya khas.',
        'Autentikasi dan manajemen identitas yang menempel pada ekosistemnya.',
        'Konfigurasi infrastruktur yang ditulis dengan format khusus penyedia itu.',
      ),
      p(
        'Cara menahannya sama seperti yang kamu pelajari di sub-bab 1.6, yaitu bungkus setiap sambungan ke layanan penyedia di balik satu permukaan milikmu sendiri. Handler fungsi tetap tipis dan hanya menerjemahkan kejadian menjadi panggilan ke use case, sehingga use case-nya tidak pernah tahu ia dipanggil oleh siapa.',
      ),
      code(
        'ts',
        `
        // Handler tipis. Seluruh isinya hanya menerjemahkan bentuk kejadian penyedia
        // menjadi panggilan ke use case yang tidak tahu apa-apa tentang penyedia.

        import { prosesUnggahanGambar } from '@/media/use-case/proses-unggahan';

        export async function handler(kejadian: KejadianPenyimpananPenyedia) {
          const berkas = {
            kunci: kejadian.Records[0].s3.object.key,
            ukuranByte: kejadian.Records[0].s3.object.size,
          };

          await prosesUnggahanGambar(berkas);
        }
        `,
        {
          caption:
            'Berpindah penyedia berarti menulis ulang berkas ini saja, bukan logika pemrosesannya.',
        },
      ),

      h2('Rangkuman'),
      ul(
        'Serverless berada di sumbu yang berbeda dari monolit dan microservice, yaitu sumbu cara menjalankan dan membayar.',
        'Yang menentukan cocok atau tidak adalah bentuk grafik bebannya, bukan besarnya.',
        'Beban jarang dan beban bergelombang tajam paling diuntungkan. Beban tinggi yang rata biasanya lebih murah di server yang selalu menyala.',
        'Dua harga yang paling sering mengejutkan yaitu sambungan database yang habis dan cold start yang menumpuk di rantai panggilan.',
        'Edge cocok untuk keputusan cepat berdasarkan permintaan itu sendiri, dan tidak cocok untuk apa pun yang butuh data jauh.',
        'Lock-in datang dari layanan sekitar, bukan dari fungsinya. Bungkus sambungannya supaya handler tetap tipis.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Serverless dan fungsi di edge memindahkan pengelolaan server keluar dari tanggung jawabmu, dan sebagai gantinya memberi batas yang sangat tegas. Batas itu yang menentukan apakah ia cocok.',
      ),
      code(
        'text',
        `
        Batas yang paling sering menjadi penghalang:

          1. Tidak ada keadaan yang bertahan
             Disk hilang, memori hilang, koneksi hilang.
             Diukur di bab Deployment sebagai gejala:
               "berkas yang baru diunggah kadang tidak ditemukan"
               "sesi pengguna hilang secara acak"

          2. Batas waktu eksekusi
             Puluhan detik, bukan menit. Ekspor laporan dan
             pengolahan berat tidak muat.

          3. Cold start
             Fungsi yang lama tidak dipanggil dinyalakan dari nol.
             Diukur di bab Docker sebagai pembanding: aplikasi yang
             perlu warm-up menunjukkan status starting selama 3 detik
             sebelum sehat.

          4. Koneksi basis data
             Setiap instance membuka pool sendiri.
             Dihitung: 10 instance x pool 10 = 100 koneksi,
             sementara paket basis data kecil mengizinkan 60.
        `,
        {
          caption:
            'Keempatnya bukan kelemahan implementasi melainkan konsekuensi langsung dari tidak punya keadaan.',
        },
      ),
      p(
        'Edge runtime menambah satu batas lagi, dan ia sering disangka sekadar versi yang lebih cepat.',
      ),
      code(
        'text',
        `
        Yang TIDAK ada di edge runtime:

          modul Node: fs, net, child_process
          crypto versi Node (yang ada Web Crypto)
          driver basis data yang memakai soket TCP mentah
          dependency native apa pun

        Yang ADA:
          fetch, Request, Response, URL, TextEncoder
          crypto.subtle
          kedekatan dengan pengunjung

        Gejala saat batas itu ditabrak, dan ia muncul saat BUILD,
        bukan saat berjalan:
          Module not found: Can't resolve 'fs'
          Error: The edge runtime does not support Node.js 'crypto' module
        `,
      ),
      p('Manfaat kedekatan itu bisa dihitung dari angka latensi yang sudah diukur.'),
      code(
        'text',
        `
        Diukur sungguhan di mesin ini:
          HTTP round trip ke 127.0.0.1   1,69 ms
          HTTP round trip ke internet    p50 70,04 ms, p99 362,72 ms

        Untuk pekerjaan yang hanya memerlukan data yang sudah ada di
        dekat pengunjung, memindahkannya ke edge menghapus sebagian
        besar 70 ms itu.

        Untuk pekerjaan yang TETAP harus memanggil basis data di satu
        wilayah, memindahkannya ke edge justru MENAMBAH satu hop:
          pengunjung -> edge (dekat) -> basis data (jauh)
        dan hasilnya lebih lambat daripada menjalankannya di dekat
        basis datanya.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan yang paling sering pada lingkungan tanpa keadaan berasal dari asumsi yang benar pada satu proses yang berjalan terus.',
      ),
      code(
        'text',
        `
        1. Berkas yang ditulis hilang

           Ditulis ke /tmp, dan permintaan berikutnya mendarat di
           instance yang sama sekali lain.
           Perbaikan: object storage, bukan disk lokal.

        2. Koneksi basis data habis

           error: sorry, too many clients already
           Error: Timeout acquiring a connection from the pool

           Setiap instance membuka pool sendiri, dan jumlah instance
           berubah-ubah mengikuti beban.
           Perbaikan: pooler yang memang untuk lingkungan tanpa
           keadaan, dan ukuran pool 1 per instance.

        3. Proses panjang terpotong

           Task timed out after 10.01 seconds
           FUNCTION_INVOCATION_TIMEOUT

           Perbaikan: antrean, dengan kontrak 202 yang bisa dipantau.
           Diukur di bab Desain API bentuknya:
             202 Location: /unggah/<id> Retry-After: 1
             lalu 200 {"status":"berjalan","kemajuan":34}

        4. Cache di memori tidak pernah kena

           Tiap instance punya cache sendiri, dan instance-nya
           berumur pendek. Cache harus bersama.
        `,
      ),
      p(
        'Kegagalan kelima menyangkut biaya, dan ia punya bentuk yang khas pada model bayar-per-pemanggilan.',
      ),
      code(
        'text',
        `
        Bentuk beban yang mahal di serverless:

          - permintaan yang sangat banyak dan sangat ringan
            ongkos per pemanggilan dibayar untuk pekerjaan yang
            di server biasa hampir gratis

          - fungsi yang menunggu I/O lama
            dibayar sepanjang menunggu, meski CPU-nya menganggur

          - perulangan yang tidak sengaja
            fungsi A memanggil B, B memanggil A. Tagihannya baru
            terlihat di akhir bulan.

        Batas atas jumlah pemanggilan BUKAN pengaman opsional.
        Sama seperti batas atas pada autoscaling, ia wajib.
        `,
        { caption: 'Sistem yang menskala tanpa batas juga menagih tanpa batas.' },
      ),
      code(
        'text',
        `
        DAN SATU KESALAHAN yang halus: inisialisasi berat di tingkat
        modul.

          // Dijalankan pada SETIAP cold start
          const kamus = JSON.parse(fs.readFileSync('kamus-besar.json'));
          const klien = new KlienBerat({ ... });

        Setiap instance baru membayar biaya itu sebelum melayani satu
        permintaan pun.

        Yang menutupnya: muat secara malas pada pemakaian pertama,
        dan jaga bundel fungsinya tetap kecil.

        Diukur di bab Deployment sebagai pembanding: 30 berkas
        JavaScript klien project ini berjumlah 1.823,4 KB, dengan
        chunk terbesar 653,4 KB. Ukuran bundel menentukan waktu
        nyala, baik di peramban maupun di fungsi tanpa keadaan.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Serverless menghapus banyak pekerjaan dan menuntut cara berpikir yang berbeda, dan kesalahannya hampir semuanya berupa asumsi lama yang terbawa.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis berkas ke disk lokal',
            'Disknya kan ada',
            'Berkasnya hilang, dan permintaan berikutnya mendarat di instance lain. Pakai object storage',
          ],
          [
            'Memakai ukuran pool seperti di satu server',
            'Angkanya sudah teruji',
            'Dihitung, 10 instance x pool 10 = 100 koneksi terhadap batas 60. Pakai pool 1 dan pooler eksternal',
          ],
          [
            'Menjalankan proses panjang di dalam fungsi',
            'Cuma beberapa detik',
            'Batas eksekusinya puluhan detik. Pindahkan ke antrean dengan kontrak 202',
          ],
          [
            'Memakai edge runtime tanpa memeriksa batasnya',
            'Katanya lebih cepat',
            "Modul Node tidak ada di sana, dan gejalanya `Can't resolve 'fs'` saat build",
          ],
          [
            'Memindahkan ke edge padahal datanya jauh',
            'Lebih dekat pengunjung',
            'Menambah satu hop. Diukur, round trip ke basis data jauh tetap p50 70,04 ms',
          ],
          [
            'Tidak memasang batas atas pemanggilan',
            'Biar bisa menangani lonjakan apa pun',
            'Satu perulangan yang tidak sengaja menagih tanpa batas. Tagihannya terlihat di akhir bulan',
          ],
        ],
      ),
      p(
        'Pertanyaan yang paling membantu memutuskan bukan tentang skala melainkan tentang bentuk pekerjaannya. Apakah setiap permintaan bisa diselesaikan tanpa mengingat apa pun dari permintaan sebelumnya, dan apakah ia selesai dalam hitungan detik? Bila jawabannya ya untuk keduanya, serverless menghapus banyak pekerjaan tanpa banyak biaya. Bila salah satunya tidak, memaksakannya berarti membangun ulang keadaan dan antrean di atas platform yang sengaja dirancang tanpa keduanya.',
      ),
      references(
        {
          label: 'Serverless overview',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/serverless-quest/serverless-overview',
          source: 'Microsoft',
          note: 'Kapan model ini cocok dan kapan ia bukan jawaban yang tepat.',
        },
        {
          label: 'Functions',
          href: 'https://vercel.com/docs/functions',
          source: 'Vercel',
          note: 'Model fungsi yang dipakai aplikasi Next.js saat dideploy, termasuk batas waktu eksekusinya.',
        },
        {
          label: 'Server and Client Components',
          href: 'https://nextjs.org/docs/app/getting-started/server-and-client-components',
          source: 'Next.js',
          note: 'Bagaimana batas server dan klien diterjemahkan menjadi kode yang berjalan di tempat berbeda.',
        },
      ),
    ],
  ),

  written(
    'tabel-keputusan',
    'Memilih Bentuk dengan Tabel Keputusan',
    20,
    'Menggabungkan tujuh sub-bab sebelumnya menjadi satu proses yang bisa diulang.',
    [
      p(
        'Tujuh sub-bab sebelumnya membahas bentuk satu per satu. Sekarang muncul pertanyaan yang wajar, yaitu bagaimana kamu tahu mana yang harus dipilih untuk aplikasimu sendiri.',
      ),
      p(
        'Cara yang paling sering dipakai orang adalah bertanya kepada yang lebih berpengalaman, lalu mengikuti jawabannya. Cara itu tidak salah, tetapi ia punya kelemahan besar, yaitu kamu tidak bisa mengulanginya sendiri lain kali, dan kamu tidak punya cara membuktikan jawabannya keliru kalau ternyata memang keliru.',
      ),
      p(
        'Sub-bab ini menggantinya dengan **daftar pertanyaan yang urutannya tetap**, mirip seperti dokter yang menanyakan gejala satu per satu sebelum menyimpulkan. Kelebihannya, siapa pun yang menjalankan daftar yang sama pada aplikasi yang sama akan sampai pada kesimpulan yang sama, dan kalau kesimpulannya salah, kamu bisa menelusuri pertanyaan mana yang jawabannya keliru.',
      ),
      p(
        'Itulah yang membuat tabel keputusan berharga. Ia mengubah percakapan dari "menurutku sebaiknya microservice" menjadi "empat pertanyaannya sudah dijawab, ini jawabannya, dan ini kesimpulan yang mengikutinya".',
      ),

      terms(
        {
          term: 'decision table (tabel keputusan)',
          meaning:
            'Tabel yang memetakan kombinasi jawaban menjadi kesimpulan, sehingga keputusan yang sama menghasilkan hasil yang sama siapa pun yang menjalankannya. Dibaca "disisyen teibel". Kegunaannya bukan menghilangkan penilaian manusia, karena menjawab pertanyaannya tetap butuh penilaian. Yang berubah adalah **letak perdebatannya**. Tanpa tabel, orang berdebat tentang kesimpulan dan tidak pernah selesai. Dengan tabel, orang berdebat tentang jawaban pertanyaan nomor dua, dan perdebatan itu bisa diselesaikan dengan melihat riwayat git.',
        },
        {
          term: 'decision driver (pendorong keputusan)',
          meaning:
            'Faktor yang benar-benar mengubah kesimpulan. Dibaca "disisyen draiver". Membedakan pendorong dari sekadar pertimbangan itu penting, karena daftar pertimbangan bisa sepanjang apa pun sementara pendorong biasanya hanya tiga sampai lima.',
        },
        {
          term: 'default option (pilihan bawaan)',
          meaning:
            'Pilihan yang berlaku kalau tidak ada bukti yang mengalahkannya. Dibaca "difolt opsyen". Menetapkan pilihan bawaan mengubah **siapa yang harus membuktikan**. Tanpa pilihan bawaan, orang yang ingin bertahan di bentuk sederhana harus membela diri. Dengan pilihan bawaan, orang yang ingin memecahlah yang harus menunjukkan buktinya. Pergeseran kecil itu berdampak besar, karena bukti untuk memecah memang lebih mudah dikumpulkan daripada bukti untuk tidak memecah.',
        },
        {
          term: 'runner-up',
          meaning:
            'Pilihan kedua yang nyaris terpilih, seperti juara kedua dalam lomba. Dibaca "raner ap". Mencatat runner-up beserta satu faktor yang memisahkannya dari pemenang punya kegunaan yang sangat praktis. Setahun kemudian, ketika faktor itu berubah, kamu tidak perlu mengulang seluruh analisis. Kamu cukup membaca satu kalimat, melihat bahwa faktor pemisahnya sudah tidak berlaku, lalu langsung tahu bahwa runner-up-nya sekarang menang.',
        },
      ),

      h2('Pilihan bawaan dan beban pembuktian'),
      p(
        'Sebelum tabelnya, satu aturan perlu ditetapkan supaya tabel itu punya arah. Aturannya, **bentuk paling tidak terdistribusi adalah pilihan bawaan**, dan yang harus dibuktikan adalah alasan menyimpang darinya.',
      ),
      p(
        'Aturan ini bukan karena bentuk sederhana selalu lebih baik. Ia karena biaya kesalahannya tidak setara. Memulai dari modular monolith lalu ternyata butuh memecah berarti melakukan pemecahan yang sudah disiapkan seperti di sub-bab 2.6. Memulai dari lima layanan lalu ternyata tidak butuh berarti membayar biaya operasional setiap hari untuk manfaat yang tidak pernah datang, dan menyatukannya kembali jauh lebih sulit daripada memecah.',
      ),
      callout(
        'tip',
        'Pilihan bawaan tetap harus dijelaskan',
        'Memilih bawaan bukan berarti tidak memutuskan. Kalau kamu memilih modular monolith, tuliskan juga bahwa kamu memilihnya karena empat pertanyaan di bawah dijawab tidak, bukan karena tidak sempat memikirkannya. Bedanya besar bagi pembaca berikutnya.',
      ),

      h2('Empat pertanyaan, ditanyakan dengan bahasa biasa'),
      p(
        'Empat pendorong dari sub-bab 2.5 ditulis ulang di sini sebagai pertanyaan yang bisa dijawab siapa pun, termasuk orang yang tidak berpikir dalam istilah arsitektur.',
      ),
      table(
        [
          'Pertanyaan yang ditanyakan',
          'Yang sebenarnya diukur',
          'Jawaban yang mendorong pemecahan',
        ],
        [
          [
            'Kalau memperbaiki satu bagian, apakah semuanya harus ikut dirilis, dan apakah itu benar-benar merugikan?',
            'Kemandirian rilis',
            'Ya, dan menunggu itu memang merugikan',
          ],
          [
            'Beberapa bulan terakhir, apakah satu permintaan fitur biasanya memaksa mengubah beberapa wilayah sekaligus?',
            'Kestabilan batas',
            'Jarang. Batasnya sudah berhenti bergerak',
          ],
          [
            'Kalau ada masalah di produksi sekarang, berapa lama sampai kamu tahu bagian mana yang bermasalah?',
            'Kematangan operasional',
            'Cepat, karena sudah ada trace dan log terpusat',
          ],
          [
            'Adakah bagian yang jauh lebih berat daripada sisanya, atau yang butuh bahasa berbeda?',
            'Perbedaan skala atau teknologi',
            'Ya, dan bagiannya bisa disebutkan dengan jelas',
          ],
        ],
        'Pertanyaan versi teknisnya sengaja tidak dipakai, karena jawabannya jadi menebak istilah alih-alih menceritakan pengalaman.',
      ),
      p(
        'Perhatikan pertanyaan pertama. Ia punya dua bagian, dan bagian kedua yang sering hilang. Banyak sistem memang harus dirilis bersamaan, dan itu tidak merugikan siapa pun karena rilisnya memang mingguan dan semua pihak menerimanya. Kerugian nyata baru ada kalau satu bagian tertahan padahal ia butuh rilis harian.',
      ),

      h2('Tabelnya'),
      p(
        'Kombinasi jawaban dipetakan menjadi kesimpulan. Dua kolom tengah berfungsi sebagai penolak, artinya jawaban buruk di sana membatalkan pemecahan meskipun kolom lain mendukung.',
      ),
      table(
        ['Rilis terpisah dibutuhkan', 'Batas', 'Operasional', 'Skala berbeda', 'Kesimpulan'],
        [
          [
            'Tidak',
            'Apa pun',
            'Apa pun',
            'Tidak',
            '**Modular monolith.** Pemecahan tidak membeli apa pun',
          ],
          [
            'Tidak',
            'Masih bergerak',
            'Apa pun',
            'Ada satu',
            '**Modular monolith.** Selesaikan beban timpang dengan antrean atau cache lebih dulu',
          ],
          [
            'Belum, tapi mungkin nanti',
            'Mulai jelas',
            'Apa pun',
            'Tidak',
            '**Modular monolith** dengan batas yang ditegakkan alat, supaya pemecahan nanti murah',
          ],
          [
            'Satu bagian saja',
            'Stabil untuk bagian itu',
            'Cukup',
            'Ada satu',
            '**Modular monolith plus satu layanan** yang ditarik keluar. Sisanya tetap',
          ],
          [
            'Beberapa bagian',
            'Stabil dan disepakati',
            'Matang',
            'Ya',
            '**Beberapa layanan.** Tetap mulai dari satu, sesuai sub-bab 2.6',
          ],
          [
            'Beberapa bagian',
            'Stabil dan disepakati',
            '**Belum matang**',
            'Ya',
            '**Modular monolith dulu.** Bangun trace, log terpusat, dan pipeline per bagian sebelum memecah',
          ],
        ],
        'Baris terakhir adalah yang paling sering diabaikan, dan mengabaikannya menghasilkan sistem terdistribusi yang tidak bisa diselidiki saat bermasalah.',
      ),
      p(
        'Baris kedua layak dijelaskan karena ia terlihat berlawanan dengan naluri. Ada bagian yang jauh lebih berat, tetapi batasnya masih bergerak, sehingga jawabannya tetap tidak memecah. Alasannya, beban yang timpang punya jawaban yang jauh lebih murah, yaitu memindahkan pekerjaan berat ke antrean seperti di sub-bab [antrean pesan](/kelas/system-design/blok-penyusun/antrean-pesan), atau memasang cache di depannya. Memecah di batas yang masih bergerak menukar masalah murah dengan masalah mahal.',
      ),

      h2('Sumbu kedua, dijawab terpisah'),
      p(
        'Setelah bentuk pembagiannya ditentukan, sumbu kedua dari sub-bab 2.7 dijawab sendiri. Keduanya tidak saling menentukan.',
      ),
      table(
        ['Pola beban', 'Cara menjalankan', 'Catatan'],
        [
          [
            'Ramai dan rata sepanjang hari',
            'Container atau server yang selalu menyala',
            'Paling murah per permintaan pada beban tetap',
          ],
          [
            'Jarang atau bergelombang tajam',
            'Serverless',
            'Perhatikan sambungan database dan cold start',
          ],
          [
            'Campuran, sebagian rata sebagian bergelombang',
            'Campuran',
            'Bagian yang bergelombang berdiri sendiri sebagai fungsi',
          ],
        ],
        'Kombinasi apa pun dari tabel ini dan tabel sebelumnya adalah kombinasi yang sah.',
      ),

      h2('Menulis hasilnya supaya tidak diperdebatkan ulang'),
      p(
        'Hasil dari kedua tabel di atas pantas ditulis, dan bentuknya cukup pendek. Bentuk lengkapnya dibahas di Bab 4 sub-bab 2, tetapi kerangka ini sudah cukup untuk keputusan bentuk.',
      ),
      code(
        'text',
        `
        Keputusan bentuk — Aplikasi kursus internal, 2026-08-26

        Empat pertanyaan:
        1. Rilis terpisah dibutuhkan?      Tidak. Satu tim, rilis mingguan, tidak ada
                                          bagian yang tertahan.
        2. Batas sudah stabil?             Belum sepenuhnya. Tiga bulan terakhir, dua dari
                                          lima permintaan menyentuh dua wilayah sekaligus.
        3. Operasional matang?             Sebagian. Ada log terpusat, belum ada trace.
        4. Ada skala atau teknologi beda?  Ada satu, yaitu pembuatan sertifikat PDF yang
                                          memakan prosesor dan berjalan lama.

        Kesimpulan: MODULAR MONOLITH.
        Pembuatan sertifikat dipindahkan ke job antrean di dalam aplikasi yang sama,
        bukan ke layanan terpisah, karena pertanyaan 1 dijawab tidak.

        Runner-up: modular monolith plus satu layanan sertifikat.
        Yang memisahkan: kalau nanti sertifikat butuh mesin dengan memori jauh lebih besar
        daripada aplikasi utama, keputusan ini ditinjau ulang.

        Cara menjalankan: container, satu image, dua salinan di belakang load balancer.
        Beban rata pada jam kerja, jadi serverless tidak menguntungkan.

        Ditinjau ulang kalau: ada tim kedua yang butuh jadwal rilis sendiri, ATAU
        pertanyaan 2 dijawab "jarang" selama tiga bulan berturut-turut.
        `,
        {
          caption:
            'Baris terakhir yang membuat dokumen ini hidup. Tanpa pemicu peninjauan, ia menjadi arsip.',
        },
      ),
      p(
        'Bagian "ditinjau ulang kalau" adalah yang paling berharga dan paling sering hilang. Ia mengubah keputusan dari sesuatu yang permanen menjadi sesuatu yang punya masa berlaku, sehingga orang berikutnya tahu kapan boleh membukanya kembali tanpa merasa sedang membatalkan pekerjaan orang lain.',
      ),

      h2('Kesalahan yang paling sering saat memakai tabel ini'),
      ol(
        'Menjawab pertanyaan dengan harapan, bukan dengan kejadian. Pertanyaan kedua dan ketiga hanya berguna kalau dijawab dari riwayat nyata beberapa bulan terakhir.',
        'Melewati kolom penolak karena kolom lain sudah mendukung. Kestabilan batas dan kematangan operasional bukan pertimbangan yang bisa ditimbang, keduanya syarat.',
        'Menganggap kesimpulan berlaku selamanya. Empat jawaban itu berubah seiring waktu, dan itulah gunanya baris pemicu peninjauan.',
        'Menjawab untuk seluruh sistem sekaligus. Sebuah sistem boleh punya kesimpulan berbeda untuk bagian yang berbeda, dan bentuk campuran justru yang paling umum.',
      ),

      h2('Rangkuman'),
      ul(
        'Bentuk paling tidak terdistribusi adalah pilihan bawaan, dan yang harus dibuktikan adalah alasan menyimpang.',
        'Empat pertanyaan ditanyakan dengan bahasa biasa supaya dijawab dari pengalaman, bukan dari istilah.',
        'Kestabilan batas dan kematangan operasional adalah penolak, bukan pertimbangan yang bisa ditimbang.',
        'Sumbu cara menjalankan dijawab terpisah dari sumbu cara membagi.',
        'Tulis hasilnya beserta runner-up dan pemicu peninjauan, supaya keputusan tidak diperdebatkan ulang.',
        'Sistem boleh punya kesimpulan berbeda untuk bagian berbeda. Bentuk campuran adalah yang paling umum.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Tabel keputusan berguna karena ia memaksa pertanyaan yang tepat diajukan sebelum bentuk dipilih. Yang membuatnya bekerja adalah kolom-kolomnya berisi angka, bukan pendapat.',
      ),
      table(
        ['Pertanyaan', 'Jawaban yang mengarah ke monolit', 'Jawaban yang mengarah ke pemecahan'],
        [
          [
            'Berapa tim yang harus menunggu satu sama lain untuk merilis?',
            'Nol atau satu',
            'Dua atau lebih',
          ],
          ['Apakah ada bagian yang bebannya berbeda tajam?', 'Tidak', 'Ya, dan sudah diukur'],
          ['Apakah batas modulnya sudah terbukti beberapa bulan?', 'Belum', 'Sudah'],
          ['Apakah bagian itu bisa berbagi data dengan sisanya?', 'Harus', 'Tidak perlu'],
          ['Apakah kegagalan bagian itu bisa ditoleransi sementara?', 'Tidak', 'Bisa'],
          ['Apakah tim punya pemantauan dan penelusuran terpusat?', 'Belum', 'Sudah'],
        ],
      ),
      p(
        'Kolom pertama pada baris pertama adalah pertanyaan yang paling menentukan, dan ia tidak menyebut teknologi sama sekali. Microservice menyelesaikan masalah koordinasi organisasi, dan bila masalah itu tidak ada, seluruh biayanya dibayar tanpa manfaat.',
      ),
      code(
        'text',
        `
        Biaya yang dibayar setiap pemecahan, dengan angka:

          ketersediaan berantai, dihitung:
             1 komponen @ 99,9% -> 99,9000%   (  8,8 jam/tahun)
            10 komponen @ 99,9% -> 99,0045%   ( 87,2 jam/tahun)
            30 komponen @ 99,9% -> 97,0431%   (259,0 jam/tahun)

          latensi panggilan, diukur:
            pemanggilan fungsi  puluhan nanodetik
            loopback            1,69 ms
            internet            p50 70,04 ms, p99 362,72 ms

          latensi ekor, dihitung:
            10 layanan @ p99 1% -> 9,6% permintaan kena ekor

          transaksi lintas layanan: tidak ada
          konsistensi akhir: menjadi bawaan, dan diuji, saat beban
            tulis besar 8 dari 8 pembacaan sesudah penulisan gagal
        `,
        {
          caption:
            'Kelimanya dibayar sejak layanan pertama dipecah, dan tidak satu pun bisa dibatalkan dengan mudah.',
        },
      ),
      p('Untuk pilihan bentuk penyebaran, tabelnya berbeda dan pertanyaannya juga.'),
      table(
        ['Pertanyaan', 'Serverless / edge', 'Container / VPS'],
        [
          [
            'Apakah tiap permintaan bisa selesai tanpa mengingat apa pun?',
            'Harus ya',
            'Tidak masalah',
          ],
          ['Berapa lama pekerjaan terlamanya?', 'Di bawah puluhan detik', 'Bebas'],
          ['Apakah bebannya naik-turun tajam?', 'Cocok', 'Perlu autoscaling'],
          ['Apakah ada koneksi yang harus tetap terbuka?', 'Sulit', 'Wajar'],
          ['Apakah butuh modul Node atau dependency native?', 'Tidak di edge', 'Bebas'],
          ['Siapa yang mengurus TLS, log, dan pembaruan sistem?', 'Penyedia', 'Kamu'],
        ],
      ),

      h2('Saat error-nya muncul'),
      p('Tabel keputusan gagal dengan cara yang khas, yaitu diisi sesudah keputusannya diambil.'),
      code(
        'text',
        `
        Tanda tabelnya hanya pembenaran:

          - seluruh kolom mengarah ke satu jawaban yang sama
          - tidak ada satu pun baris yang mengarah ke jawaban lain
          - angkanya tidak ada, hanya kata "ya" dan "tidak"
          - tidak ada baris tentang biaya

        Tabel keputusan yang jujur hampir selalu punya beberapa baris
        yang mengarah ke jawaban yang TIDAK dipilih. Itulah bagian
        yang paling berguna untuk dibaca enam bulan kemudian.
        `,
      ),
      p(
        'Kesalahan kedua adalah memutuskan dari gejala yang sebenarnya menuntut perbaikan lain, dan contohnya bisa diukur.',
      ),
      code(
        'text',
        `
        Gejala yang sering dikira menuntut perubahan bentuk:

          "Query-nya lambat"
            diukur: agregasi 468,9 ms -> kolom denormalisasi 0,068 ms
            yang dibutuhkan: indeks dan denormalisasi

          "Build-nya lambat"
            diukur pada project ini: rata-rata per halaman 14 ms,
            halaman yang gagal 30 ms, load average 12,84 pada 4 CPU
            CIRCLE_NODE_TOTAL=2 npm run build -> EXIT=0, 15,9 detik
            yang dibutuhkan: mengurangi pekerjaan yang berjalan
            bersamaan

          "Deploy-nya menakutkan"
            yang dibutuhkan: pipeline, rollback teruji, saklar fitur

          "Kodenya berantakan"
            diukur pada project ini: fitness function menemukan satu
            pelanggaran arah dan tiga siklus
            yang dibutuhkan: batas internal yang ditegakkan

        Tidak satu pun dari keempatnya menuntut memecah sistem.
        `,
      ),
      code(
        'text',
        `
        KESALAHAN KETIGA: memilih bentuk tanpa menghitung yang
        ikut terbagi.

        Yang ikut terbagi saat sistem dipecah:
          pemantauan, penelusuran, penyebaran, lingkungan lokal,
          versi kontrak

        Kelimanya pekerjaan yang tidak ada sebelumnya dan harus
        dikerjakan selamanya sesudahnya.

        Penanda korelasi khususnya jauh lebih murah dipasang SEBELUM
        pemecahan, saat masih ada satu proses. Sesudahnya, log dari
        beberapa layanan sudah tidak bisa disambungkan.
        `,
      ),
      p(
        'Kesalahan keempat bersifat waktu, yaitu memutuskan bentuk terlalu awal ketika informasinya paling sedikit.',
      ),
      code(
        'text',
        `
        Biaya membatalkan tiap keputusan, dihitung dan diukur:

          memindahkan batas DI DALAM satu proses
            ubah beberapa impor, jalankan test -> sehari

          memindahkan batas ANTAR layanan
            pindahkan tabel, penulisan ganda, backfill, pindahkan
            pembacaan, hapus yang lama
            dan diukur, 283 byte/baris @ 100 juta/hari -> 10,3 TB
            dalam setahun -> berminggu-minggu

        Karena itu urutan yang hampir selalu benar: mulai dari monolit
        dengan batas yang ditegakkan, lalu pecah bagian yang memang
        terbukti perlu.

        Urutan sebaliknya, yaitu memecah lebih dulu lalu mencari
        batas yang benar, adalah yang paling mahal dari semuanya.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Tabel keputusan mudah dibuat dan mudah dipakai untuk membenarkan sesuatu yang sudah diputuskan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengisi tabel sesudah keputusannya diambil',
            'Biar terdokumentasi',
            'Seluruh barisnya mengarah ke satu jawaban. Tabel yang jujur punya baris yang mengarah ke jawaban lain',
          ],
          [
            'Mengisi kolom dengan "ya" dan "tidak" tanpa angka',
            'Pertanyaannya kan sederhana',
            'Tanpa angka, tidak ada yang bisa dikoreksi. "Bebannya besar" bukan jawaban; 34.722 QPS adalah jawaban',
          ],
          [
            'Tidak menulis baris tentang biaya',
            'Yang penting manfaatnya',
            'Dihitung, 10 komponen berantai menghasilkan 87,2 jam mati per tahun. Itu harus masuk tabel',
          ],
          [
            'Memutuskan bentuk dari gejala yang menuntut perbaikan lain',
            'Gejalanya nyata',
            'Diukur, keempat gejala yang paling sering disebut tidak satu pun menuntut memecah sistem',
          ],
          [
            'Memilih bentuk berdasarkan apa yang sedang populer',
            'Banyak yang memakainya',
            'Arsitektur mereka menjawab masalah mereka, termasuk masalah organisasi yang tidak kamu punya',
          ],
          [
            'Memutuskan bentuk akhir di awal project',
            'Biar tidak perlu ditulis ulang',
            'Informasinya paling sedikit tepat di awal. Mulai dari yang paling murah dibatalkan',
          ],
        ],
      ),
      p(
        'Cara membaca seluruh tabel di sub-bab ini dengan benar adalah menyadari bahwa tidak ada satu pun barisnya yang menyebut bentuk arsitektur sebagai jawaban. Setiap barisnya bertanya tentang keadaan yang bisa diperiksa hari ini, yaitu berapa tim yang menunggu, berapa beban yang berbeda, dan berapa lama batasnya sudah terbukti. Bentuk yang tepat adalah hasil dari jawaban-jawaban itu, bukan sesuatu yang dipilih lebih dulu lalu dicarikan alasannya.',
      ),
      references(
        {
          label: 'Architecture styles',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/',
          source: 'Microsoft',
          note: 'Daftar gaya beserta tantangannya, berguna sebagai pemeriksa hasil tabel keputusan.',
        },
        {
          label: 'Design principles for Azure applications',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/',
          source: 'Microsoft',
          note: 'Termasuk prinsip memilih bentuk paling sederhana yang memenuhi kebutuhan.',
        },
        {
          label: 'Architectural Decision Records',
          href: 'https://adr.github.io/',
          source: 'ADR GitHub organization',
          note: 'Bentuk lengkap untuk mencatat keputusan ini, dibahas tuntas di Bab 4.',
        },
      ),
    ],
  ),
];
