import { defineCategory, defineChapter, q } from '@/lib/curriculum/authoring';
import { lessons as lessonsBlokPenyusun } from './system-design/blok-penyusun/lessons';
import { lessons as lessonsFondasi } from './system-design/fondasi/lessons';
import { lessons as lessonsKeandalanStudiKasus } from './system-design/keandalan-studi-kasus/lessons';
import { lessons as lessonsSkalaData } from './system-design/skala-data/lessons';

/**
 * System Design — 4 chapters, 30 lessons.
 *
 * The layer above everything else in the curriculum. Every component it discusses has already
 * been built somewhere in categories 1–6; what was never taught is *when* to reach for one, and
 * what number says it is needed.
 *
 * Placed last (order 7) because it references almost the whole path — cache and queues from
 * Backend Intermediate, indexes and transactions from Backend Basic, canary releases and health
 * checks from Deployment. Placed anywhere earlier, half its cross-references would point at
 * chapters the reader has not opened yet.
 *
 * It deliberately does NOT re-teach Redis, BullMQ, or Docker. Where those appear, the material
 * links to the chapter that already covers them and spends its own words on the decision instead.
 */

const fondasi = defineChapter({
  slug: 'fondasi-sistem',
  number: 1,
  title: 'Fondasi dan Estimasi Sistem',
  summary:
    'Kosakata, urutan kerja, dan aritmetika yang mengubah "penggunanya banyak" menjadi angka yang bisa ditindaklanjuti.',
  objectives: [
    'Memisahkan kebutuhan fungsional dari non-fungsional, dan menetapkan konsistensi per jenis data',
    'Menghitung QPS, penyimpanan, bandwidth, dan jumlah mesin dengan estimasi di balik amplop',
    'Memakai angka latensi untuk menilai target mana yang mungkin dan mana yang tidak',
    'Menghitung ketersediaan sebuah rantai layanan, dan memakai error budget sebagai keputusan',
    'Menulis dokumen desain satu halaman yang bisa dibaca dan diperiksa orang lain',
  ],
  prerequisites: [
    { category: 'backend-basic', chapter: 'fondasi-backend' },
    { category: 'deployment', chapter: 'setelah-rilis' },
  ],
  stackVersions: ['Google SRE Book', 'PostgreSQL 17', 'Prometheus 3', 'OpenAPI 3.1'],
  reviewedAt: '2026-08-25',
  lessons: lessonsFondasi,
  quiz: [
    q(
      'sd1-q1',
      'Sebuah aplikasi punya 200.000 pengguna aktif harian yang masing-masing membuka 20 halaman. Berapa kira-kira QPS baca saat puncak, dengan faktor puncak tiga kali?',
      ['Sekitar 46 QPS', 'Sekitar 140 QPS', 'Sekitar 4.000 QPS', 'Sekitar 12.000 QPS'],
      1,
      '200.000 dikali 20 sama dengan 4 juta pembacaan per hari. Dibagi 86.400 detik menghasilkan sekitar 46 QPS rata-rata, lalu dikali tiga menjadi sekitar 140 QPS. Angka sekecil itu dilayani satu server dengan santai, dan perhitungan lima baris tadi baru saja menghemat berbulan-bulan pekerjaan penskalaan yang tidak dibutuhkan.',
    ),
    q(
      'sd1-q2',
      'Kenapa latensi dilaporkan sebagai persentil, bukan sebagai rata-rata?',
      [
        'Karena persentil lebih mudah dihitung',
        'Karena rata-rata bisa menggambarkan pengalaman yang tidak dialami satu pengguna pun, sementara persentil memperlihatkan pengalaman terburuk yang masih cukup sering terjadi',
        'Karena rata-rata hanya berlaku untuk permintaan yang berhasil',
        'Karena persentil tidak terpengaruh jumlah permintaan',
      ],
      1,
      'Sembilan puluh sembilan permintaan 10 milidetik ditambah satu permintaan 5 detik menghasilkan rata-rata 60 milidetik, padahal tidak ada satu permintaan pun yang memakan 60 milidetik. P50 memberi tahu pengalaman yang khas dan P99 memberi tahu pengalaman terburuk yang masih layak dipedulikan.',
    ),
    q(
      'sd1-q3',
      'Empat komponen dengan ketersediaan 99,99 persen, 99,9 persen, 99,9 persen, dan 99,9 persen berada pada satu jalur yang semuanya wajib hidup. Berapa ketersediaan totalnya?',
      [
        '99,99 persen, yaitu yang tertinggi',
        '99,9 persen, yaitu yang terendah',
        'Sekitar 99,69 persen, karena keempatnya dikalikan',
        'Sekitar 99,95 persen, yaitu rata-ratanya',
      ],
      2,
      'Pada rantai yang semuanya wajib hidup, ketersediaan dikalikan, bukan diambil yang terkecil. Hasilnya lebih buruk daripada komponen terburuknya, dan inilah harga tersembunyi setiap komponen tambahan pada jalur wajib. Karena itu cache sebaiknya dirancang agar boleh gagal, sehingga ia keluar dari perkalian ini.',
    ),
    q(
      'sd1-q4',
      'Apa yang salah dengan menjawab "sistem kami harus konsisten kuat" untuk seluruh aplikasi sekaligus?',
      [
        'Tidak ada yang salah, itu jawaban paling aman',
        'Jawaban itu menutup pintu bagi cache dan replika baca untuk seluruh data, padahal sebagian besar data tidak membutuhkannya',
        'Konsistensi kuat tidak mungkin dicapai pada satu basis data',
        'Konsistensi kuat membuat penulisan menjadi tidak atomik',
      ],
      1,
      'Keputusan konsistensi diambil per jenis data. Saldo, stok, dan hak akses memang harus kuat. Jumlah suka, linimasa, dan hasil pencarian tidak, dan memaksakan konsistensi kuat di sana berarti membuang dua cara termurah menambah kapasitas tanpa mendapat apa pun sebagai gantinya.',
    ),
  ],
  practice: {
    id: 'system-design/fondasi-sistem',
    title: 'Praktik bab ini',
    items: [
      'Hitung QPS rata-rata dan puncak untuk aplikasi yang sedang kamu kerjakan, lalu bandingkan dengan kapasitas satu server',
      'Buat tabel asumsi yang menandai setiap angka sebagai data atau tebakan',
      'Susun anggaran latensi untuk satu halaman terberat di aplikasimu, dan cari di mana waktunya benar-benar habis',
      'Tetapkan target ketersediaan berbeda untuk tiga fungsi di aplikasimu, dan tuliskan alasan tiap angkanya',
      'Tulis satu dokumen desain satu halaman untuk fitur berikutnya yang akan kamu bangun',
    ],
  },
});

const blokPenyusun = defineChapter({
  slug: 'blok-penyusun',
  number: 2,
  title: 'Blok Penyusun Sistem Berskala',
  summary:
    'Katalog komponen beserta pemicu pemasangannya, wujud konkretnya di stack yang sudah kamu pakai, dan harga yang dibayar masing-masing.',
  objectives: [
    'Menempatkan sembilan langkah penskalaan pada urutan yang benar, beserta pemicu terukurnya',
    'Mengendalikan CDN lewat header, dan mengenali konten yang tidak boleh di-cache di sana',
    'Menyusun load balancer beserta health check yang membedakan liveness dan readiness',
    'Membuat aplikasi benar-benar stateless sebelum menggandakannya',
    'Memilih strategi cache, menyusun kunci, dan menutup serbuan, hot key, serta penembusan',
    'Memindahkan pekerjaan ke antrean dengan pengerjaan yang aman diulang',
  ],
  prerequisites: [
    { category: 'system-design', chapter: 'fondasi-sistem' },
    { category: 'backend-intermediate', chapter: 'express-intermediate' },
    { category: 'deployment', chapter: 'fondasi-deployment' },
  ],
  stackVersions: ['Nginx 1.27', 'Redis 8', 'BullMQ 5', 'Socket.IO 4'],
  reviewedAt: '2026-08-25',
  lessons: lessonsBlokPenyusun,
  quiz: [
    q(
      'sd2-q1',
      'Kenapa memasang cache sebagai syarat wajib pada endpoint readiness adalah kesalahan?',
      [
        'Karena pemeriksaan cache selalu lambat',
        'Karena matinya Redis akan mengeluarkan seluruh mesin dari daftar load balancer sekaligus, sehingga layanan mati total padahal databasenya sehat',
        'Karena readiness tidak boleh memeriksa apa pun selain proses',
        'Karena cache tidak punya endpoint kesehatan',
      ],
      1,
      'Menjadikan cache sebagai syarat wajib mengubahnya dari komponen yang mempercepat menjadi komponen yang bisa menjatuhkan. Yang benar adalah database menjadi syarat wajib sedangkan cache tidak, sehingga matinya Redis membuat sistem lambat, bukan mati.',
    ),
    q(
      'sd2-q2',
      'Sebuah kunci cache populer kedaluwarsa saat lalu lintas 1.000 QPS. Apa yang terjadi tanpa kunci pengisian?',
      [
        'Tidak ada, permintaan berikutnya mengisinya kembali',
        'Seribu permintaan menemukan cache kosong bersamaan lalu menjalankan query identik ke database secara serentak',
        'Redis menolak seluruh permintaan sampai kuncinya terisi',
        'Load balancer mengalihkan lalu lintas ke mesin lain',
      ],
      1,
      'Ini cache stampede. Polanya berulang tiap TTL, sehingga grafik beban database menjadi bergerigi tajam dengan jarak sebesar TTL-nya. Penutupnya adalah kunci pengisian sehingga hanya satu permintaan yang pergi ke database, atau penyegaran lebih awal sehingga tidak pernah ada kekosongan.',
    ),
    q(
      'sd2-q3',
      'Sebuah pekerjaan antrean menjalankan `tambahSaldo(pengguna, 100000)`. Kenapa ini berbahaya?',
      [
        'Karena penambahan saldo terlalu lambat untuk antrean',
        'Karena antrean menjamin at-least-once, sehingga pekerjaan itu bisa berjalan lebih dari sekali dan saldonya bertambah berkali-kali',
        'Karena antrean tidak boleh menyentuh data keuangan',
        'Karena BullMQ tidak mendukung transaksi',
      ],
      1,
      'Hampir semua antrean nyata menjamin at-least-once, bukan exactly-once, karena worker yang mati setelah selesai bekerja tetapi sebelum menyatakan selesai tidak bisa dibedakan dari worker yang mati sebelum bekerja. Karena itu pengerjanya harus idempoten, misalnya menetapkan nilai alih-alih menambah, atau memakai penanda sekali pakai.',
    ),
    q(
      'sd2-q4',
      'Kelompok cache berisi tiga simpul memakai `hash(kunci) % 3`. Satu simpul ditambahkan sehingga menjadi empat. Berapa bagian kunci yang berpindah tempat?',
      [
        'Sekitar seperempat',
        'Sekitar sepertiga',
        'Sekitar tiga perempat',
        'Tidak ada, karena hash-nya tetap sama',
      ],
      2,
      'Pembagian modulo membuat hampir semua kunci berpindah begitu pembaginya berubah, yaitu sekitar N per N tambah satu bagian. Untuk kelompok cache itu berarti tiga perempat isinya menjadi miss sekaligus, sehingga menambah simpul saat sibuk justru menjatuhkan sistem. Consistent hashing menurunkannya menjadi sekitar seperempat.',
    ),
  ],
  practice: {
    id: 'system-design/blok-penyusun',
    title: 'Praktik bab ini',
    items: [
      'Tentukan kamu berada di langkah keberapa pada sembilan langkah penskalaan, lalu tuliskan pemicu untuk langkah berikutnya',
      'Periksa hit ratio CDN-mu dengan `curl -sI`, lalu cari penyebabnya bila di bawah lima puluh persen',
      'Pisahkan endpoint kesehatanmu menjadi `/healthz` dan `/readyz` dengan syarat yang berbeda',
      'Jalankan dua salinan aplikasimu di dua port lalu pakai bergantian, dan catat apa yang rusak',
      'Tambahkan penghitung `cache.hit` dan `cache.miss`, lalu ukur hit ratio yang sebenarnya',
      'Cari satu pekerjaan antrean di kodemu yang belum aman bila dijalankan dua kali, lalu perbaiki',
    ],
  },
});

const skalaData = defineChapter({
  slug: 'skala-data',
  number: 3,
  title: 'Menskalakan Lapisan Data',
  summary:
    'Jalan keluar basis data dalam urutan yang benar, dari memilih penyimpanan sampai membagi data, beserta yang hilang di tiap langkah.',
  objectives: [
    'Memilih jenis penyimpanan berdasarkan pola akses, bukan berdasarkan besarnya skala',
    'Mengenali sumber daya mana yang benar-benar habis sebelum menambah mesin',
    'Memasang replika baca dan menangani replication lag yang menyertainya',
    'Menetapkan kebutuhan konsistensi per jenis data, dan menegakkan yang harus kuat di lapisan data',
    'Memilih shard key yang tidak menyesal, dan mengetahui apa yang hilang begitu data terbagi',
    'Memakai denormalisasi secara sadar, lengkap dengan rekonsiliasi yang menjaganya jujur',
  ],
  prerequisites: [
    { category: 'system-design', chapter: 'blok-penyusun' },
    { category: 'backend-basic', chapter: 'database-sql-dasar' },
  ],
  stackVersions: ['PostgreSQL 17', 'MySQL 8.4', 'MongoDB 8', 'Apache Cassandra 5'],
  reviewedAt: '2026-08-25',
  lessons: lessonsSkalaData,
  quiz: [
    q(
      'sd3-q1',
      'Sebuah tim ingin pindah ke basis data dokumen karena bentuk atribut produknya sangat bervariasi. Apa yang sebaiknya diperiksa lebih dulu?',
      [
        'Apakah timnya sudah menguasai basis data dokumen',
        'Apakah PostgreSQL yang sudah dipakai bisa menyimpan bentuk bervariasi lewat kolom JSONB beserta index GIN untuk pencariannya',
        'Apakah datanya sudah melebihi satu terabita',
        'Apakah ada dana untuk basis data tambahan',
      ],
      1,
      'Setiap penyimpanan tambahan membawa biaya tetap berupa pencadangan, pemantauan, pengamanan, dan pemahaman orang berikutnya. Banyak kebutuhan yang terlihat menuntut basis data baru ternyata sudah tersedia di tempat datanya sekarang, dan JSONB menutup sebagian besar alasan berpindah ke penyimpanan dokumen.',
    ),
    q(
      'sd3-q2',
      'Pengguna mengirim komentar lalu menyegarkan halaman, dan komentarnya tidak muncul. Apa penyebab yang paling mungkin pada sistem berreplika?',
      [
        'Penulisannya gagal tanpa pesan error',
        'Penulisan masuk ke leader, sedangkan pembacaan mendarat di follower yang belum menerima perubahan itu',
        'Cache halaman belum kedaluwarsa',
        'Transaksi penulisannya belum di-commit',
      ],
      1,
      'Ini replication lag, dan gejalanya paling terasa justru pada penulisnya sendiri. Penanganan yang paling sederhana adalah mengarahkan pembacaan pengguna itu ke leader selama beberapa detik sesudah ia menulis, bukan mengarahkan seluruh pengguna yang login ke leader.',
    ),
    q(
      'sd3-q3',
      'Kapan sharding menjadi jawaban yang benar?',
      [
        'Ketika query mulai terasa lambat',
        'Ketika pembacaannya sudah terlalu banyak untuk satu mesin',
        'Ketika laju penulisan atau ukuran datanya sendiri sudah melampaui satu mesin, sesudah index, cache, mesin lebih besar, dan replika baca semuanya habis',
        'Ketika tabelnya sudah melewati sepuluh juta baris',
      ],
      2,
      'Sharding adalah satu-satunya cara menambah kapasitas tulis, dan sekaligus langkah yang paling mahal serta paling sulit dibatalkan karena join, transaksi, dan batasan unik ikut hilang. Query lambat hampir selalu soal index, dan pembacaan yang terlalu banyak dijawab cache lalu replika.',
    ),
    q(
      'sd3-q4',
      'Kenapa kolom `jumlah_komentar` yang disimpan langsung di tabel tulisan membutuhkan rekonsiliasi berkala?',
      [
        'Karena basis data menghapus nilainya secara berkala',
        'Karena penyimpangan pasti terjadi cepat atau lambat ketika ada jalur penulisan yang lupa menjaganya, dan penyimpangan itu tidak menimbulkan error apa pun',
        'Karena `COUNT` lebih cepat daripada membaca kolom',
        'Karena trigger tidak bisa dipercaya',
      ],
      1,
      'Denormalisasi membeli kecepatan baca dengan kewajiban menjaga salinannya. Kegagalan menjaga itu tidak memunculkan error, hanya angka yang salah, sehingga satu-satunya cara mengetahuinya adalah menghitung ulang dari sumbernya secara berkala dan memberi alert ketika ditemukan penyimpangan.',
    ),
  ],
  practice: {
    id: 'system-design/skala-data',
    title: 'Praktik bab ini',
    items: [
      'Tulis daftar pertanyaan yang diajukan aplikasimu ke basis data, lalu nilai apakah penyimpanan yang dipakai sudah cocok',
      'Jalankan query rasio hit cache dan `pg_stat_statements`, lalu urutkan berdasarkan waktu total',
      'Buat tabel keputusan konsistensi per jenis data untuk aplikasimu',
      'Cari satu pemeriksaan lalu tulis di kodemu yang bisa balapan, lalu ubah menjadi satu operasi atomik',
      'Tentukan calon shard key untuk aplikasimu, lalu simulasikan sebarannya dengan query hash',
      'Pasang rekonsiliasi berkala untuk satu nilai yang sudah kamu denormalisasi',
    ],
  },
});

const keandalanStudiKasus = defineChapter({
  slug: 'keandalan-studi-kasus',
  number: 4,
  title: 'Keandalan dan Studi Kasus',
  summary:
    'Apa yang dibutuhkan agar susunan berskala benar-benar bertahan hidup, lalu tiga sistem nyata dirancang dari nol.',
  objectives: [
    'Menemukan single point of failure dan memutuskan mana yang layak digandakan',
    'Memutus cascading failure dengan timeout, bulkhead, dan circuit breaker',
    'Memantau empat golden signal dan memberi alert berdasarkan laju pemakaian error budget',
    'Menyetel autoscaling dengan ukuran yang tepat, dan mengenali lapisan yang tidak ikut terskalakan',
    'Menetapkan RPO dan RTO, lalu memilih strategi pemulihan yang sepadan',
    'Merancang sistem utuh dengan proses empat langkah, dan menilai hasilnya dengan daftar periksa',
  ],
  prerequisites: [
    { category: 'system-design', chapter: 'skala-data' },
    { category: 'deployment', chapter: 'setelah-rilis' },
    { category: 'deployment', chapter: 'ci-cd' },
  ],
  stackVersions: ['Google SRE Book', 'Prometheus 3', 'Kubernetes 1.32', 'Redis 8', 'RFC 9110'],
  reviewedAt: '2026-08-25',
  lessons: lessonsKeandalanStudiKasus,
  quiz: [
    q(
      'sd4-q1',
      'Sebuah layanan pihak ketiga melambat dari 100 milidetik menjadi 30 detik. Kenapa itu lebih berbahaya daripada layanan yang mati total?',
      [
        'Karena layanan yang mati tidak pernah mengganggu',
        'Karena layanan yang lambat menahan sambungan pemanggilnya sampai habis, sehingga permintaan lain yang tidak berhubungan ikut menunggu dan seluruh armada bisa jatuh',
        'Karena kegagalan lambat tidak tercatat di log',
        'Karena timeout tidak berlaku untuk layanan yang masih hidup',
      ],
      1,
      'Komponen yang mati memberi jawaban gagal dengan cepat sehingga sumber dayanya segera dilepas. Komponen yang lambat menahan sumber daya, dan penumpukan itulah yang merambat menjadi cascading failure. Pertahanannya adalah timeout, bulkhead berupa connection pool terpisah, dan circuit breaker.',
    ),
    q(
      'sd4-q2',
      'Kenapa alert "prosesor di atas 90 persen" sebaiknya tidak membangunkan siapa pun?',
      [
        'Karena prosesor tinggi tidak pernah menjadi masalah',
        'Karena itu penyebab yang dicurigai, bukan gejala yang dirasakan pengguna, dan sistem bisa saja tetap melayani dengan baik pada angka itu',
        'Karena prosesor tidak bisa diukur dengan tepat',
        'Karena angka itu terlalu rendah untuk dianggap masalah',
      ],
      1,
      'Alert yang membangunkan orang harus berdasarkan gejala, yaitu hal yang benar-benar dirasakan pengguna seperti latensi P99 atau laju kesalahan. Prosesor tinggi berguna sebagai isi dasbor untuk menelusuri penyebab, dan menjadikannya alert hanya menghasilkan alert fatigue yang membuat alert sungguhan ikut diabaikan.',
    ),
    q(
      'sd4-q3',
      'Pada studi kasus pemendek alamat, kenapa kode 302 dipilih meskipun kode 301 jauh lebih ringan bagi server?',
      [
        'Karena 301 tidak didukung semua browser',
        'Karena kebutuhan fungsional menuntut jumlah klik bisa dihitung, sedangkan 301 disimpan browser sehingga kunjungan berikutnya tidak pernah menyentuh server',
        'Karena 302 lebih cepat diproses browser',
        'Karena 301 tidak bisa dipakai untuk alamat yang berubah',
      ],
      1,
      'Ini contoh langsung bagaimana satu butir pada daftar kebutuhan menentukan sebuah kode status sekaligus menentukan bahwa bebannya akan jauh lebih besar. Kalau penghitungan klik dikeluarkan dari cakupan, 301 menjadi pilihan yang benar dan bebannya turun drastis.',
    ),
    q(
      'sd4-q4',
      'Pada studi kasus linimasa, kenapa akun dengan sepuluh juta pengikut ditangani dengan cara yang berbeda dari akun biasa?',
      [
        'Karena akun besar biasanya memposting lebih sering',
        'Karena fanout saat tulis untuk akun itu berarti sepuluh juta penulisan dari satu posting, sehingga akun besar dibiarkan diambil saat pengikutnya membaca',
        'Karena akun besar disimpan di basis data yang berbeda',
        'Karena pengikut akun besar tidak membutuhkan urutan waktu',
      ],
      1,
      'Aturan gabungan memakai fanout saat tulis untuk 99 persen akun sehingga pembacaan menjadi sangat murah, dan fanout saat baca untuk 1 persen akun besar sehingga write amplification tidak meledak. Membuka linimasa berarti menggabungkan satu daftar siap pakai dengan beberapa daftar kecil milik akun besar yang diikuti.',
    ),
  ],
  practice: {
    id: 'system-design/keandalan-studi-kasus',
    title: 'Praktik bab ini',
    items: [
      'Tanyakan "apa yang terjadi bila ini mati" pada setiap kotak di diagram sistemmu, lalu catat jawabannya',
      'Tambahkan timeout dan nilai cadangan pada satu panggilan ke layanan luar yang belum punya keduanya',
      'Pasang instrumentasi empat golden signal pada satu layananmu, dan pastikan labelnya tidak bernilai tak terbatas',
      'Tetapkan RPO dan RTO untuk tiap jenis data di aplikasimu, lalu bandingkan dengan jadwal cadangan yang berjalan sekarang',
      'Jalankan pemulihan sungguhan dari cadangan ke lingkungan terpisah, dan catat berapa lama benar-benar butuh waktu',
      'Kerjakan satu dari tiga latihan pada sub-bab terakhir, lalu nilai hasilnya dengan daftar periksa desain',
    ],
  },
});

export const systemDesign = defineCategory({
  slug: 'system-design',
  order: 7,
  title: 'System Design',
  tagline: 'Dari "bisa jalan" ke "tetap jalan"',
  description:
    'Lapisan di atas seluruh kurikulum. Bukan komponen baru, melainkan cara memutuskan komponen mana yang dipasang, berapa besar ukurannya, dan harga apa yang dibayar untuk masing-masing. Dimulai dari aritmetika yang mengubah jumlah pengguna menjadi angka, dilanjutkan katalog blok penyusun beserta pemicunya, jalan keluar lapisan data dalam urutan yang benar, dan ditutup tiga sistem nyata yang dirancang dari nol.',
  chapters: [fondasi, blokPenyusun, skalaData, keandalanStudiKasus],
});
