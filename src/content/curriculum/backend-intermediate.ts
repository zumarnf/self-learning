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
  // 2026-09-14: revisi studi kasus, error, dan kesalahan umum
  // (plans/revisi-studi-kasus-error-kesalahan/) — ketiga bagian berjudul tetap ditambahkan
  // di seluruh 11 sub-bab.
  //
  // Seluruh respons HTTP yang dijadikan contoh dihasilkan sungguhan oleh server node:http
  // + node:sqlite pada Node 26.5.0, bukan diketik ulang. Yang diukur:
  //   - kontrak error RFC 9457 lengkap: 400 / 409 / 422 dengan application/problem+json,
  //     daftar errors per field, dan requestId di header maupun badan
  //   - ETag: 200 dengan 44 byte -> 304 dengan 0 byte
  //   - lost update lewat If-Match: penyunting A 200, penyunting B 412, dan tanpa
  //     If-Match sama sekali -> 428
  //   - idempotency key: LIMA permintaan bersamaan dengan satu kunci menghasilkan
  //     SATU pembayaran; tiga kunci berbeda menghasilkan tiga
  //   - 202 Accepted + Location + Retry-After + kemajuan 0/34/68/100
  //   - paginasi di node:sqlite 200.000 baris: OFFSET 0,01 -> 1,51 ms sementara keyset
  //     rata di 0,01 ms
  //   - allow-list ORDER BY: injeksi ditolak 422 dan jumlah baris tabel tetap utuh
  //
  // DUA HASIL YANG SENGAJA DILAPORKAN SEBAGAI PELAJARAN TENTANG CARA MENGUJI:
  //   - Uji "mengubah tipe id angka -> string" tercatat AMAN, dan itu MENYESATKAN:
  //     klien ujinya terlalu sederhana. Materinya memakai hasil itu untuk menjelaskan
  //     kenapa "tidak merusak klien uji saya" bukan bukti sebuah perubahan aman.
  //   - Percobaan urutan-seri pada node:sqlite TIDAK menunjukkan baris terlewat,
  //     sementara pada PostgreSQL 16.15 (bab database) ia terlewat. Materinya memakai
  //     selisih itu untuk menegaskan bahwa urutan nilai seri tidak pernah dijanjikan.
  //
  // Contoh OpenAPI TIDAK dijalankan — tidak ada pustaka OpenAPI di project ini dan
  // Dependency Version Gate (core.md) berlaku. Dinyatakan lewat callout di sub-bab itu.
  reviewedAt: '2026-09-14',
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
      'Klien mengirim kunci unik per operasi. Kalau permintaan dengan kunci yang sama datang lagi, misalnya karena timeout lalu retry, server mengembalikan hasil yang pertama alih-alih memproses ulang.',
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
  // 2026-09-14: revisi studi kasus, error, dan kesalahan umum
  // (plans/revisi-studi-kasus-error-kesalahan/) — ketiga bagian berjudul tetap ditambahkan
  // di seluruh 14 sub-bab.
  //
  // BATAS KEJUJURAN: Express, Prisma, BullMQ, Redis, dan Socket.IO tidak terpasang, dan
  // Dependency Version Gate (core.md) berlaku. Potongan ber-API mereka disusun dari
  // dokumentasi resmi dan dinyatakan tidak dieksekusi lewat callout di sub-bab queue-bullmq
  // dan socketio. Yang dijalankan sungguhan adalah mekanisme di bawahnya.
  //
  // Yang BENAR-BENAR dieksekusi untuk bab ini:
  //   - CORS di peramban sungguhan (server node:http + Chrome for Testing 149):
  //     asal diizinkan BERHASIL; tanpa header CORS DIBLOKIR (TypeError: Failed to fetch);
  //     Allow-Origin:* BERHASIL untuk permintaan sederhana; * + credentials DIBLOKIR
  //   - validasi magic byte: skrip PHP bernama .png DITOLAK, dan polyglot ber-header PNG sah
  //     TETAP DITERIMA — dipakai untuk menjelaskan kenapa magic byte saja tidak cukup
  //   - nama berkas: "CON.png" LOLOS pola regex dan tetap bermasalah (nama perangkat Windows)
  //   - cache stampede: 50 permintaan bersamaan -> 50 perhitungan tanpa penggabungan,
  //     1 dengan penggabungan; waktu dinding 122 vs 121 ms, jadi yang dihemat BEBAN bukan latensi
  //   - enam error tsc 5.9.3 pada mode strict, termasuk exhaustiveness lewat never
  //
  // TEMUAN YANG MELAWAN DUGAAN, diukur dan dipakai sebagai inti sub-bab TypeScript:
  //   `const a: ResponsPublik = dariDb` LOLOS tsc tanpa error, dan saat dijalankan
  //   JSON.stringify(a) tetap mengeluarkan sandiHash serta catatanInternal secara utuh.
  //   Pemeriksaan properti berlebih hanya berlaku pada object literal, bukan pada variabel.
  //   Jadi tipe TIDAK PERNAH menjadi kontrol keamanan — materinya menyatakan itu tegas.
  reviewedAt: '2026-09-14',
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
  // 2026-09-14: revisi studi kasus, error, dan kesalahan umum
  // (plans/revisi-studi-kasus-error-kesalahan/) — ketiga bagian berjudul tetap ditambahkan
  // di seluruh 13 sub-bab.
  //
  // BATAS KEJUJURAN: Laravel, Horizon, Redis, dan Pest tidak terpasang, dan Dependency
  // Version Gate (core.md) berlaku. Potongan ber-API Laravel disusun dari dokumentasi resmi
  // dan dinyatakan tidak dieksekusi lewat callout di sub-bab queue-horizon. Yang dijalankan
  // sungguhan adalah PHP 8.3.6 yang memang terpasang, plus pengukuran dari bab lain.
  //
  // Yang BENAR-BENAR dieksekusi dengan PHP 8.3.6 untuk bab ini:
  //   - rekursi observer: save() di dalam observer mencapai 51 penyimpanan dan
  //     kedalaman 51 sebelum penjaga menghentikannya
  //   - token bergaya Sanctum: hanya hash yang disimpan; rahasia diubah satu karakter,
  //     id ditukar, dan tanpa pemisah semuanya DITOLAK lewat hash_equals
  //   - kemampuan token terpisah dari peran pengguna (artikel:hapus DITOLAK meski
  //     penggunanya mungkin berhak lewat antarmuka web)
  //   - delapan kasus policy sebagai fungsi murni, termasuk selisih SENGAJA antara
  //     ubah (editor boleh atas miliknya) dan hapus (hanya admin)
  //   - tumpang tindih penjadwalan: tugas 5 menit dengan jeda 1 menit menghasilkan
  //     5 salinan berjalan bersamaan sebagai keadaan TETAP, bukan puncak sementara
  //   - isolasi listener: tanpa isolasi, satu listener yang gagal menghentikan sisanya
  //     sehingga catatan audit tidak pernah ditulis
  //
  // ANGKA YANG PALING MENENTUKAN, diukur dengan PHP 8.3.6: menyaring daftar dengan policy
  // membuat pengguna MEMINTA 20 dan MENERIMA 9, sementara 11 baris milik orang lain sudah
  // terbaca ke memori proses. Itu dipakai sebagai bukti bahwa policy tidak pernah cukup
  // untuk daftar — batasnya harus ikut ke klausa WHERE.
  reviewedAt: '2026-09-14',
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
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Node 26.5.0, PHP 8.3.6,
  // Chrome for Testing 149 lewat CDP, curl 8.5.0):
  //   - cookie lintas origin di peramban sungguhan: SameSite=Lax DITOLAK, dan
  //     SameSite=None TANPA Secure juga DITOLAK pada http:// -> /saya menjawab 401
  //     dengan cookieYangTiba:null di ketiga percobaan
  //   - SSE: server menutup aliran setelah 2 peristiwa, Chrome menyambung ulang
  //     SENDIRI 3 kali dalam 4 detik dan mengirim Last-Event-ID berisi id terakhir
  //   - kebocoran SSE: dari 6 koneksi hanya 1 yang dibersihkan lewat req.on('close'),
  //     dan 25 tick setInterval masih menembak ke response yang sudah berakhir
  //   - WebSocket lintas origin BERHASIL tanpa satu pun header CORS; Origin tiba di
  //     server, Authorization tidak pernah bisa dikirim peramban
  //   - skrip audit kontrak yang sama dijalankan ke backend Node dan backend PHP:
  //     12 pemeriksaan, 10 lolos di keduanya, 2 gagal hanya di sisi PHP
  //
  // TIGA HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - new EventSource(url, { headers }) TIDAK melempar. Argumennya diabaikan diam-diam,
  //     objeknya tetap hidup, dan ia menambah koneksi 2, 4, dan 6 ke server tanpa satu
  //     pun pendengar peristiwa. Kegagalan yang tidak bersuara sama sekali.
  //   - peristiwa 'error' pada SSE muncul dengan readyState=0 (CONNECTING), bukan CLOSED.
  //     Materinya memakai itu untuk melarang membangun penyambung ulang sendiri di atasnya.
  //   - kegagalan skrip audit di sisi PHP TIDAK direncanakan. Penyebabnya mb_strlen()
  //     tidak ada karena mbstring tidak terpasang; hasilnya 500 dengan badan KOSONG,
  //     content-type text/html, dan header CORS tetap lengkap. Klien melihat
  //     "SyntaxError: Unexpected end of JSON input" yang tidak menyebut PHP sama sekali.
  //     Dipakai apa adanya sebagai studi kasus, bukan diperbaiki diam-diam.
  //
  // Contoh Socket.IO dan pustaka unggah pihak ketiga TIDAK dijalankan — keduanya tidak
  // terpasang dan Dependency Version Gate (core.md) berlaku. Mekanisme di bawahnya yang
  // dijalankan: handshake WebSocket ditulis tangan dengan crypto + node:http.
  reviewedAt: '2026-09-14',
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
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Node 26.5.0, PHP 8.3.6,
  // node:sqlite, git 2.x, npm, curl 8.5.0):
  //   - IDOR: tanpa klausa pemilik, satu pengguna membaca tiga faktur yang dua
  //     di antaranya milik orang lain; dengan klausa itu, dua jadi 404
  //   - laju penebakan id berurutan: 200.000 percobaan dalam 52 ms
  //   - SQL injection: penggabungan string membocorkan seluruh tabel termasuk
  //     sandi_hash lewat OR 1=1 dan lewat UNION; prepared statement 0 baris
  //     untuk keduanya; exec bertumpuk MENGHAPUS tabel audit (1 baris -> 0)
  //   - command injection: exec("cat /tmp/catatan.txt; id") membocorkan uid dan
  //     seluruh grup proses; execFile gagal karena memperlakukannya satu nama berkas
  //   - biaya hash: sha256 2.395.136/detik, bcrypt cost=10 20/detik, cost=12 5/detik
  //   - AES-256-CBC menerima ciphertext yang diubah; AES-256-GCM menolaknya
  //   - SSRF: daftar tolak berbasis teks ditembus 2130706433, 0x7f000001, dan 0,
  //     ketiganya mengambil kredensial dari layanan internal
  //   - PHP unserialize: peran dinaikkan ke admin lewat payload tulisan sendiri,
  //     dan kelas Berkas dibangkitkan sehingga __destruct berjalan
  //   - npm audit project ini: 21 dependency langsung -> 651 paket, 6 kerentanan
  //     (2 moderate, 3 high, 1 critical), 4 di antaranya transitif
  //   - git: kredensial tetap terbaca dari riwayat sesudah berkasnya dikeluarkan
  //   - skrip audit 10 butir: 10 temuan pada versi rentan, 0 pada versi diperbaiki
  //
  // TIGA HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - Perbaikan "hitung hash palsu supaya waktunya seragam" MEMPERBURUK kebocoran:
  //     tanpa perbaikan selisihnya 28,05 ms; dengan patokan dihitung tiap permintaan
  //     selisihnya 28,58 ms (scrypt berjalan DUA KALI); baru dengan patokan yang
  //     dihitung sekali saat boot selisihnya turun ke 0,37 ms. Dipakai di materi
  //     sebagai bukti bahwa kontrol keamanan diukur, bukan dikira.
  //   - PHP __destruct TETAP berjalan meski unserialize() gagal di tengah
  //     ("Error at offset 50 of 54 bytes"). Kegagalan penguraian bukan jaminan
  //     tidak ada kode yang berjalan.
  //   - Pada skrip audit, butir pembatasan laju menerima 404 alih-alih 429 di versi
  //     rentan, dan itu BUKAN pembatasan yang bekerja melainkan kebocoran enumerasi
  //     dari butir lain yang menampakkan diri lagi. Dilaporkan apa adanya di materi.
  //
  // Contoh Laravel, Redis, dan pemindai SAST TIDAK dijalankan — tidak terpasang dan
  // Dependency Version Gate (core.md) berlaku. Mekanisme di bawahnya yang dijalankan.
  reviewedAt: '2026-09-14',
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
