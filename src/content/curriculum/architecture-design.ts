import { defineCategory, defineChapter, q } from '@/lib/curriculum/authoring';
import { lessons as lessonsDokumentasiEvolusi } from './architecture-design/dokumentasi-evolusi/lessons';
import { lessons as lessonsFondasi } from './architecture-design/fondasi/lessons';
import { lessons as lessonsGayaDanBatas } from './architecture-design/gaya-dan-batas/lessons';
import { lessons as lessonsKomunikasi } from './architecture-design/komunikasi/lessons';

/**
 * Architecture Design — 4 chapters, 30 lessons.
 *
 * The shape layer. System Design (category 7) answers whether a system can carry its load;
 * this one answers what shape that system should have and where its boundaries go.
 *
 * Placed at order 8, directly after System Design, because nearly every lesson links back into
 * it — queues from Blok Penyusun, replication from Skala Data, timeouts and golden signals from
 * Keandalan. Putting Prompt Engineering between them would break a reading order that the
 * cross-references already assume.
 *
 * The category deliberately fills a gap System Design left on purpose: its plan records that
 * microservices were excluded there to avoid pushing beginners toward splitting applications
 * that do not need splitting. That reasoning holds, which is exactly why the topic needs a home
 * where the cheaper shapes are taught first and the decision table defaults to the least
 * distributed option.
 */

const fondasi = defineChapter({
  slug: 'fondasi-arsitektur',
  number: 1,
  title: 'Fondasi Arsitektur',
  summary:
    'Apa yang membuat sebuah keputusan pantas disebut arsitektur, dan gaya apa yang menariknya ke bentuk tertentu.',
  objectives: [
    'Memisahkan keputusan arsitektur dari detail implementasi lewat harga pembatalannya',
    'Menaksir biaya perubahan sebelum memutuskan, dan menunda keputusan satu arah dengan sadar',
    'Memilih tiga sampai empat atribut kualitas penggerak beserta yang sengaja tidak dikejar',
    'Menilai coupling dari kedalaman pengetahuan, dan cohesion dari alasan berubah bersama',
    'Menegakkan arah ketergantungan antar lapisan, dan mengenali lapisan yang bocor',
    'Membalik ketergantungan lewat interface sehingga aturan bisnis bisa diuji tanpa infrastruktur',
    'Mengenali delapan anti-pola beserta gejala awalnya, saat memperbaikinya masih murah',
  ],
  prerequisites: [
    { category: 'system-design', chapter: 'fondasi-sistem' },
    { category: 'backend-intermediate', chapter: 'express-intermediate' },
  ],
  stackVersions: ['TypeScript 5.9', 'ESLint 9', 'Node.js 20', 'Azure Architecture Center'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Node 26.5.0, git 2.43.0, project INI SENDIRI):
  //   - graf ketergantungan project ini ditelusuri dari seluruh pernyataan impor:
  //     116 berkas, 337 sisi, rata-rata 2,9 per berkas
  //   - fan-in: authoring.ts 58 langsung dan 82 dari 116 (71%) secara transitif;
  //     builders.ts 49; queries.ts 19
  //   - arah lapisan: 12 dari 13 kelompok sisi mengikuti arah yang diharapkan, dan
  //     SATU melawan arah: src/lib/curriculum/queries.ts -> src/content/curriculum/index.ts
  //   - tiga siklus ditemukan, seluruhnya pasangan halaman-server dan komponen-klien Next.js
  //   - perubahan bersama dari riwayat git: types.ts + curriculum-integrity.test.ts 50%,
  //     glossary.ts + curriculum-integrity.test.ts 60%
  //   - ketergantungan melingkar diuji di CommonJS dan ESM
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - ESM MENOLERANSI siklus untuk deklarasi fungsi (di-hoist, binding hidup) dan GAGAL
  //     untuk nilai yang dibaca saat modul dievaluasi:
  //       CommonJS -> TypeError: a.dariA is not a function
  //       ESM + fungsi -> BERHASIL
  //       ESM + const dibaca saat muat -> ReferenceError: Cannot access 'DARI_C' before initialization
  //     Materinya memakai itu untuk menjelaskan kenapa siklus tetap dilarang meski
  //     kebetulan tidak menimbulkan masalah sekarang.
  reviewedAt: '2026-09-14',
  lessons: lessonsFondasi,
  quiz: [
    q(
      'ad1-q1',
      'Sebuah tim memutuskan memakai library kecil untuk memformat tanggal, dipakai di tiga tempat lewat satu fungsi pembungkus. Apakah ini keputusan arsitektur?',
      [
        'Ya, karena setiap pilihan library adalah keputusan arsitektur',
        'Bukan, karena membatalkannya hanya berarti mengubah satu berkas pembungkus',
        'Ya, karena library adalah ketergantungan luar',
        'Bukan, karena library kecil tidak pernah penting',
      ],
      1,
      'Ukuran yang menentukan bukan jenis keputusannya melainkan seberapa banyak hal lain yang ikut berubah kalau ia dicabut. Karena pemakaiannya sudah dibungkus satu fungsi, penggantinya menyentuh satu berkas, sehingga ia detail implementasi. Kalau library yang sama dipanggil langsung di dua ratus tempat, jawabannya berubah.',
    ),
    q(
      'ad1-q2',
      'Modul Pesanan memanggil `modulPengguna.ambilRingkasan(id)` sepuluh kali, sedangkan modul Laporan menulis satu query `SELECT nama_depan, email_utama FROM pengguna`. Mana yang coupling-nya lebih tinggi?',
      [
        'Modul Pesanan, karena memanggil sepuluh kali',
        'Modul Laporan, karena ia harus tahu nama tabel dan nama kolom yang seharusnya bebas diubah pemiliknya',
        'Sama saja, keduanya bergantung pada modul Pengguna',
        'Modul Laporan, karena query SQL selalu lebih lambat',
      ],
      1,
      'Coupling diukur dari kedalaman pengetahuan, bukan dari jumlah pemanggilan. Modul Pesanan hanya perlu satu bentuk data tetap benar. Modul Laporan membuat dua nama kolom menjadi kontrak publik tanpa pemiliknya pernah menyetujui, sehingga modul Pengguna kehilangan kebebasan mengubah tabelnya.',
    ),
    q(
      'ad1-q3',
      'Sebuah fungsi aturan bisnis menerima `req` dan `res` milik Express. Apa akibat paling merugikan dari itu?',
      [
        'Kodenya menjadi lebih lambat karena objek Express besar',
        'Aturan itu tidak bisa dipakai dari job antrean, dari perintah terminal, maupun diuji tanpa membuat permintaan HTTP palsu',
        'Express tidak mengizinkan objeknya dipakai di luar rute',
        'TypeScript tidak bisa memeriksa tipenya dengan benar',
      ],
      1,
      'Begitu aturan bisnis menyentuh objek HTTP, ia terkunci pada satu cara pemanggilan. Kebutuhan yang hampir pasti datang, misalnya membatalkan pesanan kedaluwarsa lewat job terjadwal, memaksa logikanya disalin. Salinan itulah yang kemudian berbeda diam-diam.',
    ),
    q(
      'ad1-q4',
      'Sebuah project punya lima lapisan, dan empat di antaranya hanya meneruskan panggilan ke lapisan berikutnya. Apa penilaian yang tepat?',
      [
        'Bagus, karena lapisan yang banyak berarti pemisahan tanggung jawab yang baik',
        'Buruk, karena lapisan yang tidak punya alasan berbeda untuk berubah hanya menambah perjalanan tanpa membeli kebebasan',
        'Bagus, selama setiap lapisan punya test sendiri',
        'Buruk, karena lima lapisan melebihi batas maksimum yang dianjurkan',
      ],
      1,
      'Jumlah lapisan bukan ukuran kualitas. Uji yang benar adalah menanyakan apa yang bisa berubah di sebuah lapisan tanpa memaksa lapisan lain ikut berubah. Kalau jawabannya kosong, lapisan itu tidak membeli kebebasan apa pun dan hanya menambah berkas yang harus dibuka saat menelusuri.',
    ),
  ],
  practice: {
    id: 'architecture-design/fondasi-arsitektur',
    title: 'Praktik bab ini',
    items: [
      'Ambil tiga keputusan terakhir di projectmu, lalu tandai mana yang pintu satu arah dan mana yang dua arah',
      'Tulis tiga sampai empat atribut kualitas penggerak untuk projectmu, beserta yang sengaja tidak dikejar',
      'Cari satu tempat di kodemu yang tahu nama kolom milik modul lain, lalu rancang permukaan resmi penggantinya',
      'Jalankan perintah git yang mencari berkas paling sering berubah, lalu periksa apakah ada yang seharusnya stabil',
      'Ambil satu fungsi aturan bisnis yang menyentuh `req` dan `res`, lalu pisahkan sehingga bisa diuji tanpa server',
      'Periksa kodemu terhadap delapan anti-pola, dan catat gejala awal mana yang sudah terlihat',
    ],
  },
});

const gayaDanBatas = defineChapter({
  slug: 'gaya-dan-batas',
  number: 2,
  title: 'Gaya Arsitektur dan Batas Modul',
  summary:
    'Bentuk apa yang dipilih, di mana garis pemisahnya ditarik, dan bukti apa yang membenarkan pemecahan.',
  objectives: [
    'Membedakan keluhan tentang struktur internal dari keluhan yang benar-benar menuntut pemecahan',
    'Menegakkan batas modul lewat linter, schema database, dan test arsitektur',
    'Memilih di antara layered, hexagonal, dan clean sesuai keluhan yang benar-benar muncul',
    'Menemukan batas dari bahasa bisnis, alur pekerjaan, data yang wajib konsisten, dan riwayat git',
    'Menjalankan tabel keputusan empat sebab, dengan bentuk paling tidak terdistribusi sebagai bawaan',
    'Menarik keluar layanan pertama secara bertahap tanpa menghentikan aplikasi yang berjalan',
    'Menempatkan serverless pada sumbu yang benar, yaitu cara menjalankan bukan cara membagi',
  ],
  prerequisites: [
    { category: 'architecture-design', chapter: 'fondasi-arsitektur' },
    { category: 'system-design', chapter: 'blok-penyusun' },
    { category: 'deployment', chapter: 'ci-cd' },
  ],
  stackVersions: ['PostgreSQL 17', 'Express 5', 'Next.js 16', 'ESLint 9', 'Vercel Functions'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (project ini sendiri, plus angka dari bab lain):
  //   - fitness function 5 aturan dijalankan terhadap graf impor project ini:
  //     3 GAGAL (1 pelanggaran arah, 3 siklus), 2 LULUS
  //   - sebaran ukuran berkas: p50 19 KB, p90 271 KB, maks 340 KB, total 9,7 MB
  //   - angka pembanding dari bab lain yang dipakai menimbang pemecahan:
  //     ketersediaan berantai (10 komponen @ 99,9% -> 87,2 jam/tahun), latensi panggilan
  //     (fungsi puluhan ns, loopback 1,69 ms, internet p50 70,04 ms), dan biaya migrasi
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN:
  //   - Ketiga siklus yang ditemukan BELUM TENTU harus diperbaiki; ketiganya bentuk lazim
  //     di Next.js. Materinya menyatakan itu apa adanya alih-alih menyajikannya sebagai
  //     cacat, dan menekankan bahwa nilai pengukurannya adalah temuan itu kini TERLIHAT.
  reviewedAt: '2026-09-14',
  lessons: lessonsGayaDanBatas,
  quiz: [
    q(
      'ad2-q1',
      'Sebuah tim mengeluh bahwa mengubah satu bagian sering merusak bagian lain yang tidak berhubungan, lalu mengusulkan memecah aplikasi menjadi lima layanan. Apa masalah dari usulan itu?',
      [
        'Lima layanan terlalu banyak untuk satu tim',
        'Keluhannya adalah tidak adanya batas, dan pemecahan tidak menciptakan batas melainkan memindahkan kekusutan yang sama ke bentuk yang lebih mahal',
        'Pemecahan sebaiknya dilakukan setelah pengguna mencapai jumlah tertentu',
        'Tidak ada masalah, itu memang jawaban yang tepat',
      ],
      1,
      'Kalau batas modul belum ada di dalam satu aplikasi, memecahnya menghasilkan kekacauan yang sama tetapi kini melewati jaringan. Keluhan ini diselesaikan dengan menegakkan pintu masuk per modul lewat linter, dan itu bisa dikerjakan minggu ini tanpa menyentuh infrastruktur.',
    ),
    q(
      'ad2-q2',
      'Empat pertanyaan tabel keputusan dijawab begini. Rilis terpisah dibutuhkan untuk beberapa bagian, batasnya stabil dan disepakati, ada perbedaan skala yang nyata, tetapi belum ada trace terdistribusi maupun log terpusat. Apa kesimpulannya?',
      [
        'Beberapa layanan, karena tiga dari empat sebab sudah terpenuhi',
        'Modular monolith dulu, karena kematangan operasional adalah penolak dan tanpanya kerumitan hanya menjadi tidak terlihat',
        'Beberapa layanan, dengan trace dipasang sesudah pemecahan selesai',
        'Serverless, karena ia menghilangkan kebutuhan pemantauan',
      ],
      1,
      'Kestabilan batas dan kematangan operasional bukan pertimbangan yang bisa ditimbang melawan sebab lain, keduanya syarat. Memecah tanpa penelusuran berarti setiap masalah produksi menjadi pencarian buta di beberapa proses sekaligus. Bangun kemampuannya lebih dulu, baru pecah.',
    ),
    q(
      'ad2-q3',
      'Saat menarik keluar layanan pertama, langkah mana yang paling sering dilewati dan paling mahal akibatnya?',
      [
        'Membuat pipeline rilis terpisah untuk layanan baru',
        'Memindahkan kepemilikan data, sehingga layanan baru dan aplikasi lama akhirnya sama-sama membaca tabel yang sama secara permanen',
        'Menulis dokumentasi untuk layanan baru',
        'Memilih nama yang tepat untuk layanan baru',
      ],
      1,
      'Membiarkan keduanya membaca tabel yang sama jauh lebih cepat, dan itulah godaannya. Akibatnya layanan baru tidak akan pernah bisa mengubah bentuk datanya sendiri, sehingga kemandirian rilis yang menjadi alasan seluruh pekerjaan itu tidak pernah tercapai. Hasilnya distributed monolith.',
    ),
    q(
      'ad2-q4',
      'Sebuah tim memindahkan satu endpoint ke edge supaya lebih dekat dengan pengguna, tetapi endpoint itu justru menjadi lebih lambat. Apa penyebab yang paling mungkin?',
      [
        'Runtime di edge lebih lambat daripada Node biasa',
        'Kodenya memang dekat pengguna, tetapi databasenya tetap di satu wilayah, sehingga permintaan menempuh perjalanan pengguna ke edge lalu edge ke database yang jauh',
        'Edge tidak mendukung permintaan yang menyentuh database',
        'CDN menyimpan respons lama sehingga permintaannya diulang',
      ],
      1,
      'Menaruh kode dekat pengguna tidak membuat data ikut dekat. Yang berpindah hanya tempat pemrosesan. Edge cocok untuk keputusan cepat berdasarkan permintaan itu sendiri, misalnya pengalihan bahasa atau pemeriksaan cookie, bukan untuk apa pun yang butuh membaca data yang jauh.',
    ),
  ],
  practice: {
    id: 'architecture-design/gaya-dan-batas',
    title: 'Praktik bab ini',
    items: [
      'Tulis enam ciri monolit yang baik, lalu periksa berapa yang sudah dipenuhi projectmu',
      'Pasang satu aturan `no-restricted-imports` yang melarang impor menembus pintu masuk modul, lalu jalankan lint',
      'Jalankan perintah git yang mencari pasangan berkas paling sering berubah bersamaan, lalu bandingkan dengan batas modul sekarang',
      'Jawab empat pertanyaan tabel keputusan untuk projectmu berdasarkan kejadian tiga bulan terakhir',
      'Pilih satu bagian yang paling mudah ditarik keluar, lalu tulis enam langkah pemindahannya',
      'Tentukan bagian mana di projectmu yang pola bebannya cocok untuk serverless, beserta alasannya',
    ],
  },
});

const komunikasi = defineChapter({
  slug: 'komunikasi-antar-bagian',
  number: 3,
  title: 'Komunikasi Antar Bagian',
  summary:
    'Setelah ada batas, bagaimana kedua sisinya bicara tanpa saling menjatuhkan dan tanpa kehilangan kemandirian rilis.',
  objectives: [
    'Memilih sinkron atau asinkron dari kebutuhan alur keputusan, bukan dari kebiasaan',
    'Menulis kontrak yang membuat penambahan field berhenti menjadi peristiwa',
    'Membedakan event dari perintah, dan memilih tingkat isi event yang tepat',
    'Menetapkan satu pemilik per data, lalu menjaga salinannya lewat versi dan rekonsiliasi',
    'Menutup masalah penulisan ganda dengan outbox, dan menjalankan saga beserta pembatalnya',
    'Menempatkan CQRS pada tingkat yang sepadan dengan keluhan yang benar-benar ada',
    'Menentukan apa yang pantas dan tidak pantas dikerjakan gerbang API',
  ],
  prerequisites: [
    { category: 'architecture-design', chapter: 'gaya-dan-batas' },
    { category: 'backend-intermediate', chapter: 'desain-api' },
    { category: 'system-design', chapter: 'skala-data' },
  ],
  stackVersions: ['PostgreSQL 17', 'Redis 8', 'BullMQ 5', 'Zod 4', 'OpenAPI 3.1'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (angka dari bab lain di kurikulum ini,
  // seluruhnya diukur sungguhan pada Node 26.5.0, PHP 8.3.6, dan PostgreSQL 16.15):
  //   - pekerjaan berat sinkron vs asinkron: permintaan ringan 73,9-74,6 ms vs 6,1-7,5 ms
  //   - latensi panggilan: fungsi puluhan ns, loopback 1,69 ms, internet p50 70,04 ms
  //   - isolasi listener: tanpa isolasi hanya 1 dari 3 berjalan; dengan isolasi 2 dari 3
  //   - idempotensi: satu kunci, lima permintaan bersamaan -> satu pembayaran lahir
  //   - read-after-write pada replika: 5/5 berhasil saat diam, 8/8 gagal saat beban
  //   - denormalisasi: baca 468,922 ms -> 0,068 ms, tulis 0,0090 -> 0,2825 ms
  //   - pertentangan baris: 2.000 UPDATE baris sama 459 ms vs berbeda 29 ms
  //   - kontrak identik diuji ke dua backend: 12 pemeriksaan, 2 gagal hanya di satu sisi
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN:
  //   - Pengujian "mengubah tipe id angka -> string" tercatat AMAN dan itu MENYESATKAN:
  //     klien ujinya terlalu sederhana. Materinya memakai hasil itu untuk menjelaskan
  //     kenapa "tidak merusak klien uji saya" bukan bukti sebuah perubahan aman.
  reviewedAt: '2026-09-14',
  lessons: lessonsKomunikasi,
  quiz: [
    q(
      'ad3-q1',
      'Halaman checkout memanggil layanan rekomendasi bersama layanan pesanan memakai `Promise.all`. Layanan rekomendasi mati. Apa yang terjadi dan apa perbaikannya?',
      [
        'Tidak terjadi apa-apa, `Promise.all` mengabaikan yang gagal',
        'Seluruh halaman gagal, karena `Promise.all` menolak begitu satu gagal. Perbaikannya memisahkan panggilan yang boleh gagal dan memberinya nilai cadangan',
        'Halaman tetap tampil tetapi kosong, dan tidak perlu diperbaiki',
        'Permintaan diulang otomatis sampai rekomendasi hidup kembali',
      ],
      1,
      'Ketersediaan halaman menjadi hasil perkalian ketersediaan semua layanan yang dipanggil bersama. Bagian yang paling tidak penting jadi punya kuasa menjatuhkan yang penting. Yang boleh gagal dipisahkan dengan `catch` yang mengembalikan nilai cadangan, dan kegagalannya tetap dicatat sebagai metrik.',
    ),
    q(
      'ad3-q2',
      'Penyedia menambah satu field baru di responsnya, dan pemakainya langsung rusak. Aturan mana yang dilanggar?',
      [
        'Penyedia melanggar aturan hanya menambah, karena menambah field selalu merusak',
        'Pemakai melanggar aturan mengabaikan yang tidak dikenal, karena ia menolak field asing alih-alih melewatinya',
        'Keduanya benar, dan penambahan field memang harus dikoordinasikan',
        'Penyedia seharusnya menaikkan versi API-nya untuk setiap penambahan',
      ],
      1,
      'Dua aturan harus dipegang bersamaan. Pengirim hanya menambah, dan pemakai mengabaikan yang tidak dikenal. Skema yang memakai mode ketat menolak field asing, sehingga penambahan yang seharusnya tidak merusak siapa pun berubah menjadi insiden. Validasi tetap ketat untuk field yang dibutuhkan.',
    ),
    q(
      'ad3-q3',
      'Sebuah fungsi menyimpan status pesanan ke database lalu memancarkan event ke antrean. Prosesnya mati tepat di antara keduanya. Apa akibatnya dan apa penawarnya?',
      [
        'Tidak ada akibat, karena database sudah menyimpan statusnya',
        'Pesanan tercatat dibayar tetapi tidak ada pendengar yang tahu, sehingga email dan poin tidak pernah terjadi. Penawarnya outbox, yaitu menyimpan niat mengirim di transaksi yang sama',
        'Antrean akan mendeteksi pesan yang hilang dan mengirimnya ulang',
        'Database akan membatalkan penyimpanan karena event gagal dipancarkan',
      ],
      1,
      'Ini masalah penulisan ganda. Dua tulisan ke dua tempat berbeda tanpa transaksi bersama, sehingga salah satunya bisa berhasil sendirian. Kegagalannya diam, tidak memunculkan error di mana pun. Outbox menutupnya dengan menyimpan pesan sebagai baris di database yang sama, lalu proses terpisah yang mengirimkannya.',
    ),
    q(
      'ad3-q4',
      'Modul Pesanan menyimpan salinan nama produk yang diperbarui lewat event. Kenapa baris salinan itu perlu menyimpan nomor versi dari sumbernya?',
      [
        'Supaya bisa mengetahui kapan salinan terakhir diperbarui',
        'Karena antrean tidak menjamin urutan, sehingga event versi lama bisa tiba setelah versi baru dan membuat salinan mundur ke nilai lama tanpa ada yang tahu',
        'Karena PostgreSQL mewajibkan kolom versi pada tabel salinan',
        'Supaya event yang gagal bisa dikirim ulang oleh pemiliknya',
      ],
      1,
      'Antrean menjamin pesan sampai minimal sekali tetapi tidak menjamin urutannya. Tanpa perbandingan versi pada klausa `WHERE`, event yang datang terlambat akan menimpa nilai yang lebih baru. Kegagalan ini tidak memunculkan error, hanya data yang salah, sehingga ia baru ketahuan dari keluhan pengguna.',
    ),
  ],
  practice: {
    id: 'architecture-design/komunikasi-antar-bagian',
    title: 'Praktik bab ini',
    items: [
      'Daftar seluruh panggilan ke luar di kodemu, lalu tandai mana yang benar-benar butuh jawabannya sekarang',
      'Tambahkan timeout dan keputusan sadar saat gagal pada satu panggilan yang belum punya keduanya',
      'Periksa skema validasi respons di kodemu, dan longgarkan yang menolak field asing tanpa alasan',
      'Ubah satu rangkaian pemanggilan langsung sesudah sebuah aksi menjadi satu event beserta pendengarnya',
      'Cari satu tabel yang ditulis lebih dari satu modul, lalu tetapkan pemiliknya dan sediakan permukaan resminya',
      'Pasang tabel outbox untuk satu alur yang sekarang menyimpan data lalu memancarkan pesan',
    ],
  },
});

const dokumentasiEvolusi = defineChapter({
  slug: 'dokumentasi-dan-evolusi',
  number: 4,
  title: 'Mendokumentasikan dan Menjaga Arsitektur',
  summary:
    'Cara menyimpan keputusan supaya tidak diperdebatkan ulang, menjaganya lewat test, dan mengubahnya saat sudah tidak cocok.',
  objectives: [
    'Menggambar dengan model C4 pada tingkat yang benar untuk tiap jenis pembaca',
    'Menulis ADR yang menyimpan konteks, alternatif yang ditolak, dan akibat yang menjadi lebih sulit',
    'Menulis dokumen arsitektur yang cukup kecil untuk bisa dijaga tetap benar',
    'Mengubah aturan arsitektur menjadi test yang gagal di CI, termasuk ratchet untuk kode lama',
    'Mengenali empat sinyal terukur bahwa bentuknya sudah tidak cocok, dan menghindari menulis ulang',
    'Menjalankan review arsitektur dengan pertanyaan dan skenario, bukan dengan pendapat',
    'Menjalankan seluruh proses dari brief kosong sampai ADR yang tercatat',
  ],
  prerequisites: [
    { category: 'architecture-design', chapter: 'komunikasi-antar-bagian' },
    { category: 'deployment', chapter: 'setelah-rilis' },
  ],
  stackVersions: ['C4 model', 'MADR 4', 'arc42 8', 'Vitest 4', 'ESLint 9'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (project ini sendiri, git 2.43.0):
  //   - fitness function 5 aturan dijalankan: 3 GAGAL, 2 LULUS, dengan berkas pelanggarnya
  //     disebut satu per satu
  //   - kesegaran dokumen diukur dari git: README.md terakhir 2026-08-27 (4 commit),
  //     src/ terakhir 2026-08-27 (12 commit)
  //   - berkas yang paling sering berubah: curriculum-integrity.test.ts 9x, types.ts 6x
  //   - data yang bocor ke bundel klien: 0 berkas di .next/static, 1.250 di .next/server
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - Aturan "tidak ada import paket luar di src/content" ditulis dua cara. Versi NAIF
  //     yang mencocokkan teks di mana saja menghasilkan 259 "pelanggaran"; versi BENAR
  //     yang hanya membaca blok impor di awal berkas menghasilkan 0. Seluruh selisihnya
  //     positif palsu dari contoh kode di dalam materi. Kekeliruan itu tidak diperbaiki
  //     diam-diam melainkan dipakai sebagai studi kasus tentang fitness function yang
  //     dimatikan karena tidak dipercaya.
  reviewedAt: '2026-09-14',
  lessons: lessonsDokumentasiEvolusi,
  quiz: [
    q(
      'ad4-q1',
      'Sebuah diagram arsitektur memuat kotak "Pembeli", kotak "PostgreSQL", dan kotak "OrderValidator" sekaligus. Apa yang salah?',
      [
        'Tidak ada yang salah, semakin lengkap semakin berguna',
        'Ia mencampur tiga tingkat kedalaman sekaligus, sehingga tidak ada pembaca yang bisa memakainya dengan nyaman',
        'Nama kelas seharusnya ditulis dalam bahasa Indonesia',
        'PostgreSQL seharusnya tidak pernah muncul di diagram arsitektur',
      ],
      1,
      'Model C4 memisahkan tingkat karena tiap tingkat melayani pembaca yang berbeda dan berubah dengan kecepatan yang berbeda. Orang di tingkat konteks, database di tingkat container, nama kelas di tingkat kode. Satu gambar yang memuat ketiganya terlalu kasar untuk yang teknis dan terlalu rinci untuk yang tidak.',
    ),
    q(
      'ad4-q2',
      'Sebuah tim memutuskan tidak memakai microservice untuk saat ini. Apakah keputusan itu pantas menjadi ADR?',
      [
        'Tidak, karena ADR hanya untuk keputusan yang mengubah kode',
        'Ya, dan justru keputusan menahan diri yang paling penting dicatat, karena ia tidak meninggalkan jejak apa pun di kode sehingga pasti diusulkan ulang',
        'Tidak, karena tidak melakukan sesuatu bukan keputusan',
        'Ya, tetapi cukup ditulis di pesan commit',
      ],
      1,
      'Keputusan untuk tidak melakukan sesuatu tidak menghasilkan satu baris kode pun, sehingga tidak ada tempat lain ia bisa hidup. Tanpa ADR, seseorang enam bulan lagi akan mengusulkannya lagi dan seluruh diskusi diulang dari nol, termasuk pertimbangan yang sudah pernah ditolak dengan alasan yang baik.',
    ),
    q(
      'ad4-q3',
      'Menyalakan test batas modul di kode lama menghasilkan 247 pelanggaran sekaligus. Apa yang sebaiknya dilakukan?',
      [
        'Matikan test-nya sampai seluruh pelanggaran selesai diperbaiki',
        'Pakai ratchet, yaitu tetapkan 247 sebagai ambang yang hanya boleh turun, sehingga pelanggaran baru gagal di CI sementara yang lama diperbaiki bertahap',
        'Perbaiki seluruh 247 pelanggaran sebelum menggabungkan pekerjaan lain',
        'Kecualikan seluruh berkas lama dari pemeriksaan secara permanen',
      ],
      1,
      'Menuntut nol pelanggaran di kode lama terlalu jauh dari keadaan sekarang, dan hasilnya test dimatikan lalu tidak pernah dinyalakan lagi. Ratchet mencegah kemunduran sambil memberi ruang perbaikan bertahap, dan angkanya yang turun terlihat di diff sehingga kemajuannya kelihatan.',
    ),
    q(
      'ad4-q4',
      'Sebuah usulan arsitektur menyebut tiga manfaat dan tidak menyebut satu pun kerugian. Apa penilaian yang tepat dalam review?',
      [
        'Bagus, berarti usulannya memang kuat',
        'Belum selesai dipikirkan, karena setiap keputusan arsitektur menaikkan satu atribut dengan menurunkan yang lain, sehingga usulan tanpa harga tidak bisa dinilai',
        'Perlu ditolak, karena usulan yang terlalu percaya diri biasanya keliru',
        'Perlu diterima kalau pengusulnya berpengalaman',
      ],
      1,
      'Bukan berarti usulannya salah, melainkan bahwa sisi yang paling menentukan belum diperiksa. Pertanyaan review yang tepat adalah menanyakan apa yang menjadi lebih sulit setelah ini. Usulan yang menyebut satu manfaat spesifik beserta tiga harganya jauh lebih bisa dinilai daripada yang menyebut tiga manfaat umum.',
    ),
  ],
  practice: {
    id: 'architecture-design/dokumentasi-dan-evolusi',
    title: 'Praktik bab ini',
    items: [
      'Gambar diagram konteks dan diagram container untuk projectmu, cukup kotak dan panah berketerangan',
      'Tulis satu ADR lengkap untuk keputusan yang paling sering dipertanyakan di projectmu',
      'Tulis dokumen arsitektur satu halaman berisi lima bagian minimum, lalu hapus semua yang bisa disimpulkan dari kode',
      'Pasang satu test arsitektur, misalnya pemeriksa ketergantungan melingkar, lalu jalankan dan baca outputnya',
      'Tulis pemicu peninjauan untuk dua keputusan yang sudah kamu ambil, lalu jadwalkan pemeriksaannya',
      'Jalankan tujuh langkah studi kasus pada satu sistem milikmu sendiri, dan tulis temuan dari langkah ketujuh',
    ],
  },
});

export const architectureDesign = defineCategory({
  slug: 'architecture-design',
  order: 8,
  title: 'Architecture Design',
  tagline: 'Dari "tetap jalan" ke "tetap bisa diubah"',
  description:
    'Lapisan yang menjawab pertanyaan berbeda dari System Design. Bukan apakah sistem sanggup menampung bebannya, melainkan bentuk apa yang tepat untuk sistem itu dan di mana batas modulnya ditarik. Dimulai dari cara mengenali keputusan yang mahal dibatalkan, dilanjutkan gaya arsitektur dari monolit sampai microservice beserta tabel keputusannya, cara bagian-bagian itu berkomunikasi tanpa saling menjatuhkan, dan ditutup cara mencatat keputusan supaya tidak diperdebatkan ulang.',
  chapters: [fondasi, gayaDanBatas, komunikasi, dokumentasiEvolusi],
});
