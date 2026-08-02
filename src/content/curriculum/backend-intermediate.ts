import { defineCategory, defineChapter, q } from '@/lib/curriculum/authoring';
import { lessons as lessonsDesainApi } from './backend-intermediate/desain-api/lessons';
import { lessons as lessonsExpressLanjutan } from './backend-intermediate/express-lanjutan/lessons';
import { lessons as lessonsIntegrasi } from './backend-intermediate/integrasi/lessons';
import { lessons as lessonsKeamanan } from './backend-intermediate/keamanan/lessons';
import { lessons as lessonsLaravelLanjutan } from './backend-intermediate/laravel-lanjutan/lessons';

/** Backend Intermediate — 5 chapters, 58 lessons. */

const desainApi = defineChapter({
  slug: 'desain-api',
  number: 1,
  title: 'Desain API yang Baik',
  summary:
    'Kontrak API yang bisa dipakai klien lain tanpa bertanya, dan bisa berkembang tanpa merusak.',
  objectives: [
    'Merancang URL, status code, dan bentuk error yang konsisten',
    'Memilih antara paginasi offset dan cursor dengan alasan',
    'Menjaga kompatibilitas mundur saat API berubah',
  ],
  prerequisites: [{ category: 'backend-basic', chapter: 'nodejs-express-basic' }],
  stackVersions: ['RFC 9457', 'OpenAPI 3.1'],
  reviewedAt: '2026-08-02',
  lessons: lessonsDesainApi,
  quiz: [
    q(
      'bi1-q1',
      'Kapan paginasi berbasis cursor lebih tepat daripada offset?',
      [
        'Selalu',
        'Saat data sering berubah atau jumlahnya sangat besar, karena offset bisa melewatkan atau menggandakan baris',
        'Saat data statis',
        'Saat memakai GraphQL',
      ],
      1,
      'Kalau baris baru disisipkan di antara dua permintaan, `OFFSET 20` menunjuk baris yang berbeda dari sebelumnya. Cursor menunjuk posisi berdasarkan nilai, bukan hitungan, sehingga stabil.',
    ),
    q(
      'bi1-q2',
      'Apa fungsi `Idempotency-Key`?',
      [
        'Mengenkripsi permintaan',
        'Memastikan permintaan yang sama diulang tidak menghasilkan efek ganda, misalnya pembayaran dobel',
        'Mempercepat respons',
        'Menggantikan autentikasi',
      ],
      1,
      'Klien mengirim kunci unik per operasi. Kalau permintaan dengan kunci yang sama datang lagi — karena timeout lalu retry — server mengembalikan hasil yang pertama alih-alih memproses ulang.',
    ),
    q(
      'bi1-q3',
      'Mana yang termasuk perubahan yang merusak (breaking change)?',
      [
        'Menambah field opsional di respons',
        'Menghapus field yang sudah ada di respons',
        'Menambah endpoint baru',
        'Memperbaiki typo di dokumentasi',
      ],
      1,
      'Klien yang membaca field itu akan rusak. Menambah field umumnya aman; menghapus atau mengubah tipe tidak. Kalau harus, tempuh jalur deprecate dulu, hapus di versi berikutnya.',
    ),
  ],
  practice: {
    id: 'backend-intermediate/desain-api',
    title: 'Praktik bab ini',
    items: [
      'Audit API-mu terhadap sepuluh poin bab ini dan catat pelanggarannya',
      'Ubah bentuk error menjadi satu format seragam',
      'Ganti paginasi offset menjadi cursor pada satu endpoint',
      'Tulis spesifikasi OpenAPI untuk satu resource',
    ],
  },
});

const expressLanjut = defineChapter({
  slug: 'express-intermediate',
  number: 2,
  title: 'ExpressJS Intermediate',
  summary:
    'Dari API contoh menjadi API produksi: ORM, transaksi, queue, cache, test, dan observability.',
  objectives: [
    'Memakai ORM dengan transaksi dan relasi yang benar',
    'Memindahkan pekerjaan berat ke queue',
    'Menulis test integrasi yang menjalankan jalur kode sungguhan',
  ],
  prerequisites: [{ category: 'backend-basic', chapter: 'nodejs-express-basic' }],
  stackVersions: ['Express 5', 'Prisma 6', 'BullMQ 5', 'Vitest 4'],
  reviewedAt: '2026-08-02',
  lessons: lessonsExpressLanjutan,
  quiz: [
    q(
      'bi2-q1',
      'Kenapa handler job di queue harus idempoten?',
      [
        'Supaya lebih cepat',
        'Karena antrean umumnya menjamin at-least-once delivery, sehingga satu job bisa dijalankan lebih dari sekali',
        'Karena Redis membutuhkannya',
        'Karena job tidak boleh gagal',
      ],
      1,
      'Worker yang mati setelah bekerja tapi sebelum menandai selesai akan membuat job diambil lagi. Kalau handler mengirim email atau memotong saldo, efeknya terjadi dua kali kecuali ia idempoten.',
    ),
    q(
      'bi2-q2',
      'Kenapa `Content-Type` dari klien tidak boleh dipercaya saat upload berkas?',
      [
        'Karena sering kosong',
        'Karena sepenuhnya dikendalikan pengirim; berkas berbahaya bisa mengaku sebagai gambar',
        'Karena browser tidak mengirimnya',
        'Karena melanggar standar HTTP',
      ],
      1,
      'Verifikasi isi berkasnya (magic byte), simpan dengan nama yang dihasilkan server, dan letakkan di lokasi yang tidak mungkin dieksekusi.',
    ),
    q(
      'bi2-q3',
      'Apa yang tidak boleh dilakukan di dalam sebuah transaksi database?',
      [
        'Menulis ke dua tabel',
        'Memanggil layanan eksternal lewat jaringan dan menunggu responsnya',
        'Membaca data',
        'Memakai `ROLLBACK`',
      ],
      1,
      'Transaksi menahan kunci. Menahannya selama panggilan HTTP yang bisa memakan detik atau timeout akan memblokir penulisan lain dan memicu deadlock.',
    ),
  ],
  practice: {
    id: 'backend-intermediate/express-intermediate',
    title: 'Praktik bab ini',
    items: [
      'Pindahkan satu operasi lambat ke queue dengan retry dan dead letter',
      'Tulis test integrasi untuk satu endpoint, termasuk kasus tanpa izin',
      'Pasang correlation id yang muncul di seluruh log satu permintaan',
      'Amankan endpoint upload dengan verifikasi isi berkas',
    ],
  },
});

const laravelLanjut = defineChapter({
  slug: 'laravel-intermediate',
  number: 3,
  title: 'Laravel Intermediate',
  summary:
    'Fitur Laravel yang membuatnya menang di aplikasi nyata: queue, policy, event, dan testing.',
  objectives: [
    'Memisahkan logika bisnis dari controller dengan service layer',
    'Mengamankan endpoint dengan Sanctum dan Policy',
    'Menulis test Pest untuk fitur dan unit',
  ],
  prerequisites: [{ category: 'backend-basic', chapter: 'php-laravel-basic' }],
  stackVersions: ['Laravel 12', 'PHP 8.3+', 'Pest 3'],
  reviewedAt: '2026-08-02',
  lessons: lessonsLaravelLanjutan,
  quiz: [
    q(
      'bi3-q1',
      'Apa fungsi Policy di Laravel?',
      [
        'Memvalidasi input',
        'Memusatkan aturan otorisasi per model sehingga bisa dipanggil dari controller, route, maupun view',
        'Mengatur routing',
        'Mengelola migrasi',
      ],
      1,
      'Tanpa Policy, aturan "hanya pemilik yang boleh mengubah" tersebar di banyak controller dan mudah terlewat di salah satunya.',
    ),
    q(
      'bi3-q2',
      'Kenapa mengirim email sebaiknya lewat queue?',
      [
        'Karena lebih murah',
        'Karena pengiriman email bisa memakan detik dan menahan respons permintaan pengguna',
        'Karena Laravel mewajibkannya',
        'Karena email tidak bisa dikirim sinkron',
      ],
      1,
      'Selain lambat, layanan email bisa gagal sementara. Di queue, kegagalan bisa diulang dengan backoff tanpa membuat pengguna melihat error.',
    ),
  ],
  practice: {
    id: 'backend-intermediate/laravel-intermediate',
    title: 'Praktik bab ini',
    items: [
      'Tulis Policy untuk satu model dan uji jalur ditolaknya',
      'Pindahkan pengiriman notifikasi ke queue',
      'Temukan dan perbaiki satu masalah N+1 dengan bukti jumlah query',
      'Tulis feature test Pest untuk seluruh CRUD satu resource',
    ],
  },
});

const menyambung = defineChapter({
  slug: 'menyambung-frontend-backend',
  number: 4,
  title: 'Menyambungkan Frontend & Backend',
  summary: 'Titik temu keduanya — tempat sebagian besar bug integrasi lahir.',
  objectives: [
    'Menjaga tipe frontend tetap sinkron dengan kontrak API',
    'Memilih strategi autentikasi lintas domain yang konsisten',
    'Menangani kegagalan secara end-to-end tanpa membocorkan detail internal',
  ],
  prerequisites: [
    { category: 'backend-intermediate', chapter: 'desain-api' },
    { category: 'frontend-intermediate', chapter: 'state-management' },
  ],
  stackVersions: ['Next.js 16.2', 'OpenAPI 3.1'],
  reviewedAt: '2026-08-02',
  lessons: lessonsIntegrasi,
  quiz: [
    q(
      'bi4-q1',
      'Kenapa `Access-Control-Allow-Origin: *` tidak boleh dipakai bersama `Allow-Credentials: true`?',
      [
        'Karena melanggar sintaks HTTP',
        'Karena artinya situs mana pun bisa mengirim permintaan dengan cookie pengguna dan membaca hasilnya',
        'Karena browser mengabaikannya',
        'Karena membuat permintaan lambat',
      ],
      1,
      'Browser memang menolak kombinasi itu, dan alasannya penting: ia setara dengan mengizinkan setiap situs bertindak atas nama pengguna yang sedang login.',
    ),
    q(
      'bi4-q2',
      'Apa cara terbaik menjaga tipe frontend tetap sesuai respons API?',
      [
        'Menulis ulang tipenya secara manual dan rajin memperbaruinya',
        'Menghasilkan tipe dari spesifikasi API sehingga perubahan kontrak langsung menjadi error kompilasi',
        'Memakai `any`',
        'Mengandalkan test end-to-end saja',
      ],
      1,
      'Tipe yang ditulis manual akan menyimpang, dan penyimpangannya baru ketahuan di runtime. Tipe hasil generate mengubah perubahan kontrak menjadi error saat build.',
    ),
  ],
  practice: {
    id: 'backend-intermediate/menyambung-frontend-backend',
    title: 'Praktik bab ini',
    items: [
      'Hasilkan tipe TypeScript dari spesifikasi OpenAPI API-mu',
      'Konfigurasikan CORS dengan allow-list origin yang persis',
      'Tangani satu kegagalan API dari server sampai pesan di layar',
      'Terapkan optimistic update pada satu mutasi lalu uji kasus gagalnya',
    ],
  },
});

const keamanan = defineChapter({
  slug: 'keamanan-backend',
  number: 5,
  title: 'Keamanan Backend (OWASP Top 10 dalam Praktik)',
  summary:
    'Sepuluh kategori kerentanan paling umum, dengan contoh kode yang salah dan perbaikannya.',
  objectives: [
    'Mengenali kerentanan di kode sendiri sebelum orang lain menemukannya',
    'Menerapkan kontrol yang tepat untuk tiap kategori',
    'Menyusun checklist keamanan yang benar-benar dijalankan sebelum rilis',
  ],
  prerequisites: [{ category: 'backend-basic', chapter: 'auth-dasar' }],
  stackVersions: ['OWASP Top 10 (2021)', 'OWASP ASVS 5'],
  reviewedAt: '2026-08-02',
  lessons: lessonsKeamanan,
  quiz: [
    q(
      'bi5-q1',
      'Kategori OWASP mana yang menempati peringkat pertama?',
      ['Injection', 'Broken Access Control', 'Cryptographic Failures', 'SSRF'],
      1,
      'Sejak daftar 2021, Broken Access Control naik ke peringkat satu. Sebagian besarnya adalah hal sederhana: endpoint yang lupa memeriksa kepemilikan data.',
    ),
    q(
      'bi5-q2',
      'Apa yang membuat SSRF berbahaya?',
      [
        'Ia memperlambat server',
        'Server memanggil alamat pilihan penyerang, termasuk layanan internal dan endpoint metadata cloud yang tidak terjangkau dari luar',
        'Ia merusak database',
        'Ia hanya memengaruhi frontend',
      ],
      1,
      'Server-mu berada di dalam perimeter. Satu fitur "ambil dari URL" tanpa allow-list bisa dipakai membaca `169.254.169.254` dan mengambil kredensial instance.',
    ),
    q(
      'bi5-q3',
      'Apa yang harus dilakukan pada rahasia yang pernah ter-commit ke git?',
      [
        'Cukup hapus commitnya',
        'Rotasi rahasianya, karena riwayat kemungkinan besar sudah ter-clone atau terindeks',
        'Ubah namanya',
        'Tidak perlu apa-apa jika repo privat',
      ],
      1,
      'Menulis ulang riwayat tidak menarik kembali salinan yang sudah tersebar. Satu-satunya tindakan yang benar-benar menutup kebocoran adalah mengganti rahasianya.',
    ),
  ],
  practice: {
    id: 'backend-intermediate/keamanan-backend',
    title: 'Praktik bab ini',
    items: [
      'Cari satu IDOR di API-mu sendiri dan perbaiki',
      'Jalankan audit dependency dan tindak lanjuti temuannya',
      'Pasang header keamanan dan verifikasi dengan `curl -I`',
      'Susun checklist keamanan pra-rilis untuk aplikasimu',
    ],
  },
});

export const backendIntermediate = defineCategory({
  slug: 'backend-intermediate',
  order: 4,
  title: 'Backend Intermediate',
  tagline: 'Dari berjalan menjadi layak dipakai',
  description:
    'Desain kontrak API, fitur produksi di kedua stack, titik temu dengan frontend, dan keamanan yang diperlakukan sebagai bagian dari pekerjaan — bukan tugas terpisah di akhir.',
  chapters: [desainApi, expressLanjut, laravelLanjut, menyambung, keamanan],
});
