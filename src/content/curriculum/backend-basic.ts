import { defineCategory, defineChapter, q } from '@/lib/curriculum/authoring';
import { lessons as lessonsAuth } from './backend-basic/auth/lessons';
import { lessons as lessonsDatabaseSql } from './backend-basic/database-sql/lessons';
import { lessons as lessonsExpress } from './backend-basic/express/lessons';
import { lessons as lessonsLaravel } from './backend-basic/laravel/lessons';
import { lessons as lessonsFondasi } from './backend-basic/fondasi/lessons';

/** Backend Basic — 5 chapters, 58 lessons. Two stacks in parallel: Express and Laravel. */

const fondasi = defineChapter({
  slug: 'fondasi-backend',
  number: 1,
  title: 'Fondasi Backend & Cara Kerja Web',
  summary: 'Apa yang terjadi antara pengguna menekan tombol dan data muncul di layar.',
  objectives: [
    'Menelusuri satu permintaan dari browser sampai server dan kembali',
    'Memilih method dan status code HTTP yang tepat untuk sebuah aksi',
    'Menjelaskan kenapa konfigurasi dipisahkan dari kode',
  ],
  prerequisites: [],
  stackVersions: ['HTTP/1.1 & HTTP/2', 'REST'],
  reviewedAt: '2026-08-02',
  lessons: lessonsFondasi,
  quiz: [
    q(
      'be1-q1',
      'Method HTTP mana yang idempoten?',
      ['POST', 'PUT dan DELETE', 'Hanya GET', 'Semua method'],
      1,
      'Idempoten berarti memanggilnya berkali-kali memberi hasil akhir yang sama. `PUT` dan `DELETE` idempoten, `GET` idempoten sekaligus aman, sementara `POST` tidak — dua kali kirim biasanya membuat dua data.',
    ),
    q(
      'be1-q2',
      'Kenapa konfigurasi tidak boleh ditulis langsung di dalam kode?',
      [
        'Karena membuat kode lebih panjang',
        'Karena nilai berbeda per environment, dan rahasia yang ter-commit dianggap bocor selamanya',
        'Karena melanggar sintaks',
        'Karena membuat aplikasi lambat',
      ],
      1,
      'Selain soal per-environment, kredensial yang pernah masuk riwayat git harus dianggap sudah bocor — menghapus commitnya tidak menutup kebocoran, hanya rotasi yang bisa.',
    ),
  ],
  practice: {
    id: 'backend-basic/fondasi-backend',
    title: 'Praktik bab ini',
    items: [
      'Panggil satu API publik dengan `curl -i` dan baca seluruh headernya',
      'Rancang lima endpoint untuk satu fitur, pakai kata benda dan method yang tepat',
      'Buat berkas `.env.example` untuk satu aplikasi imajiner',
    ],
  },
});

const sql = defineChapter({
  slug: 'database-sql-dasar',
  number: 2,
  title: 'Database Relasional & SQL Dasar',
  summary: 'Menyimpan data supaya bisa dicari, dihubungkan, dan tetap konsisten.',
  objectives: [
    'Merancang skema dengan relasi yang benar untuk sebuah fitur',
    'Menulis query dengan `JOIN` dan agregasi',
    'Menjelaskan kenapa string concatenation pada query adalah celah keamanan',
  ],
  prerequisites: [{ category: 'backend-basic', chapter: 'fondasi-backend' }],
  stackVersions: ['PostgreSQL 17', 'SQL:2023'],
  reviewedAt: '2026-08-02',
  lessons: lessonsDatabaseSql,
  quiz: [
    q(
      'be2-q1',
      'Kenapa prepared statement mencegah SQL injection?',
      [
        'Karena ia menyaring karakter berbahaya',
        'Karena perintah dan datanya dikirim terpisah, sehingga isi data tidak pernah bisa menjadi perintah',
        'Karena ia mengenkripsi query',
        'Karena ia membatasi panjang input',
      ],
      1,
      'Escaping manual selalu tertinggal dari kasus tepi. Parameterisasi memindahkan pemisahan itu ke lapisan protokol: server database sudah tahu mana perintah dan mana nilai sebelum nilainya tiba.',
    ),
    q(
      'be2-q2',
      'Apa beda `INNER JOIN` dan `LEFT JOIN`?',
      [
        'Tidak ada, hanya gaya penulisan',
        '`INNER JOIN` hanya mengembalikan baris yang punya pasangan di kedua tabel; `LEFT JOIN` mempertahankan semua baris tabel kiri',
        '`LEFT JOIN` lebih cepat',
        '`INNER JOIN` hanya untuk primary key',
      ],
      1,
      'Kalau kamu ingin "semua artikel beserta jumlah komentarnya, termasuk yang belum berkomentar", `LEFT JOIN` yang benar. `INNER JOIN` akan diam-diam menghilangkan artikel tanpa komentar.',
    ),
    q(
      'be2-q3',
      'Kapan sebuah transaksi dibutuhkan?',
      [
        'Setiap kali membaca data',
        'Ketika beberapa penulisan harus berhasil semua atau gagal semua',
        'Hanya di PostgreSQL',
        'Saat memakai index',
      ],
      1,
      'Contoh klasik: memindahkan saldo. Mengurangi satu akun tanpa menambah akun lain adalah kerusakan data yang baru ketahuan jauh kemudian.',
    ),
  ],
  practice: {
    id: 'backend-basic/database-sql-dasar',
    title: 'Praktik bab ini',
    items: [
      'Rancang skema blog dengan minimal empat tabel dan relasi yang benar',
      'Tulis query yang menggabungkan tiga tabel dengan agregasi',
      'Tunjukkan satu query rentan injeksi, lalu perbaiki dengan parameter',
      'Bungkus dua penulisan terkait dalam satu transaksi',
    ],
  },
});

const express = defineChapter({
  slug: 'nodejs-express-basic',
  number: 3,
  title: 'Node.js & ExpressJS Basic',
  summary: 'Membangun REST API pertama dengan Express 5, lengkap dengan struktur dan validasi.',
  objectives: [
    'Membuat endpoint CRUD yang mengembalikan status code yang benar',
    'Menyusun kode ke dalam lapisan yang jelas sejak awal',
    'Memvalidasi setiap input yang masuk sebelum ia menyentuh logika',
  ],
  prerequisites: [
    { category: 'backend-basic', chapter: 'fondasi-backend' },
    { category: 'frontend-basic', chapter: 'asynchronous-javascript' },
  ],
  stackVersions: ['Node.js 22 LTS', 'Express 5', 'Zod 4'],
  reviewedAt: '2026-08-02',
  lessons: lessonsExpress,
  quiz: [
    q(
      'be3-q1',
      'Apa yang menentukan urutan eksekusi middleware di Express?',
      [
        'Nama fungsinya',
        'Urutan pendaftarannya dengan `app.use` atau pada rute',
        'Abjad',
        'Ukuran fungsinya',
      ],
      1,
      'Express menjalankan middleware persis sesuai urutan pendaftaran. Karena itu menempatkan middleware autentikasi setelah rute yang harus dilindungi berarti rute itu tidak terlindungi sama sekali.',
    ),
    q(
      'be3-q2',
      'Kenapa validasi input tidak cukup dilakukan di frontend?',
      [
        'Karena frontend lambat',
        'Karena siapa pun bisa memanggil API langsung tanpa lewat frontend sama sekali',
        'Karena JavaScript tidak bisa memvalidasi',
        'Karena validasi frontend melanggar CORS',
      ],
      1,
      'Validasi klien adalah soal pengalaman pengguna. Kontrol keamanannya ada di server, dan itu tidak bisa didelegasikan ke pihak yang dikendalikan penyerang.',
    ),
    q(
      'be3-q3',
      'Status code apa yang tepat untuk pembuatan data baru yang berhasil?',
      ['200 OK', '201 Created', '204 No Content', '302 Found'],
      1,
      '`201 Created` menandakan sumber daya baru terbentuk, biasanya disertai header `Location` yang menunjuk ke sana. `200` tidak salah total, tapi kurang informatif; `204` justru menyatakan tidak ada isi.',
    ),
  ],
  practice: {
    id: 'backend-basic/nodejs-express-basic',
    title: 'Praktik bab ini',
    items: [
      'Bangun lima endpoint CRUD dengan lapisan router/controller/service',
      'Validasi setiap body dan param dengan Zod',
      'Uji jalur gagal: body kosong, id tidak ada, tipe salah',
      'Pasang error handler terpusat dan pastikan tidak ada stack trace bocor ke klien',
    ],
  },
});

const laravel = defineChapter({
  slug: 'php-laravel-basic',
  number: 4,
  title: 'PHP & Laravel Basic',
  summary:
    'Stack backend kedua: framework dengan konvensi kuat yang menyelesaikan banyak hal untukmu.',
  objectives: [
    'Membangun REST API CRUD dengan Eloquent dan API Resource',
    'Menulis migration dan seeder untuk skema yang bisa diulang',
    'Memvalidasi input dengan Form Request',
  ],
  prerequisites: [{ category: 'backend-basic', chapter: 'database-sql-dasar' }],
  stackVersions: ['PHP 8.3+', 'Laravel 12'],
  reviewedAt: '2026-08-02',
  lessons: lessonsLaravel,
  quiz: [
    q(
      'be4-q1',
      'Kenapa mengembalikan model Eloquent mentah dari API berisiko?',
      [
        'Karena formatnya tidak valid JSON',
        'Karena setiap kolom ikut terkirim, termasuk kolom internal yang tidak dimaksudkan untuk publik',
        'Karena Laravel melarangnya',
        'Karena akan sangat lambat',
      ],
      1,
      'Menambah satu kolom di database seharusnya tidak diam-diam mengubah kontrak API. API Resource membuat bentuk respons menjadi keputusan eksplisit.',
    ),
    q(
      'be4-q2',
      'Apa masalah N+1 pada Eloquent?',
      [
        'Query yang salah tulis',
        'Mengambil N baris lalu menjalankan satu query tambahan per baris untuk relasinya',
        'Migration yang gagal',
        'Relasi yang tidak punya foreign key',
      ],
      1,
      'Menampilkan 50 artikel beserta penulisnya bisa berubah menjadi 51 query tanpa disadari. `with()` (eager loading) menggabungkannya menjadi dua.',
    ),
  ],
  practice: {
    id: 'backend-basic/php-laravel-basic',
    title: 'Praktik bab ini',
    items: [
      'Buat migration, model, dan relasi untuk skema blog',
      'Bangun CRUD lengkap dengan Form Request dan API Resource',
      'Temukan satu masalah N+1 dan perbaiki dengan eager loading',
      'Bandingkan hasilnya dengan API Express yang kamu buat di bab 3',
    ],
  },
});

const auth = defineChapter({
  slug: 'auth-dasar',
  number: 5,
  title: 'Autentikasi & Otorisasi Dasar',
  summary:
    'Memastikan pengguna memang siapa yang diklaimnya, lalu membatasi apa yang boleh dilakukannya.',
  objectives: [
    'Menyimpan password dengan algoritma yang benar',
    'Memilih antara session cookie dan token, dengan alasan',
    'Memeriksa kepemilikan data di lapisan data, bukan hanya di tampilan',
  ],
  prerequisites: [
    { category: 'backend-basic', chapter: 'nodejs-express-basic' },
    { category: 'backend-basic', chapter: 'php-laravel-basic' },
  ],
  stackVersions: ['OWASP ASVS 5', 'OAuth 2.1'],
  reviewedAt: '2026-08-02',
  lessons: lessonsAuth,
  quiz: [
    q(
      'be5-q1',
      'Kenapa SHA-256 tidak boleh dipakai untuk menyimpan password?',
      [
        'Karena tidak aman secara kriptografi',
        'Karena ia dirancang untuk cepat, sehingga penyerang bisa mencoba miliaran tebakan per detik',
        'Karena hasilnya terlalu panjang',
        'Karena tidak didukung Node.js',
      ],
      1,
      'Untuk password kamu justru butuh yang **lambat** dan bisa dinaikkan biayanya seiring perangkat keras membaik. argon2id, bcrypt, dan scrypt dirancang untuk itu.',
    ),
    q(
      'be5-q2',
      'Apa itu IDOR?',
      [
        'Kesalahan penulisan query',
        'Mengakses data milik orang lain hanya dengan mengganti ID pada permintaan, karena server tidak memeriksa kepemilikan',
        'Serangan pada cookie',
        'Kesalahan konfigurasi CORS',
      ],
      1,
      'ID dari klien adalah masukan, bukan bukti kewenangan. Setiap query harus dibatasi ke pengguna atau tenant yang berhak — pemeriksaan di UI saja tidak menghalangi siapa pun yang memanggil API langsung.',
    ),
    q(
      'be5-q3',
      'Kenapa pesan "email tidak terdaftar" sebaiknya dihindari saat login gagal?',
      [
        'Karena membingungkan pengguna',
        'Karena memungkinkan penyerang menyusun daftar akun yang benar-benar ada',
        'Karena melanggar standar HTTP',
        'Karena membuat log membengkak',
      ],
      1,
      'Pesan yang berbeda antara "akun tidak ada" dan "password salah" adalah enumerasi akun. Pakai satu pesan generik yang sama untuk keduanya.',
    ),
  ],
  practice: {
    id: 'backend-basic/auth-dasar',
    title: 'Praktik bab ini',
    items: [
      'Implementasikan register dan login dengan hashing yang benar',
      'Tambahkan rate limit pada endpoint login',
      'Buktikan sendiri satu kasus IDOR di API-mu, lalu perbaiki',
      'Pastikan pesan error login tidak membocorkan keberadaan akun',
    ],
  },
});

export const backendBasic = defineCategory({
  slug: 'backend-basic',
  order: 3,
  title: 'Backend Basic',
  tagline: 'Sisi server, dua stack sekaligus',
  description:
    'HTTP, database, dan dua framework yang paling banyak dipakai di Indonesia: Express untuk ekosistem JavaScript, Laravel untuk ekosistem PHP. Membangun API yang sama di keduanya membuat kamu melihat mana yang konsep dan mana yang sekadar sintaks.',
  chapters: [fondasi, sql, express, laravel, auth],
});
