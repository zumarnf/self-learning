import type { CategorySlug } from '@/lib/curriculum/types';

/**
 * Domain glossary.
 *
 * One agreed definition per term, so that lessons, notes, and conversation use the same word for
 * the same thing. `lesson` points at where the term is actually taught; the integrity test fails
 * if that target does not exist.
 */

export type GlossaryEntry = {
  term: string;
  category: CategorySlug;
  definition: string;
  /** `category/chapter/lesson` — where this term is explained. */
  lesson?: string;
  aliases?: string[];
};

export const glossary: GlossaryEntry[] = [
  {
    term: 'Runtime',
    category: 'frontend-basic',
    definition:
      'Lingkungan tempat kode dijalankan beserta API yang tersedia di sana. Bahasanya sama, tapi browser punya `document` dan Node.js punya `fs`.',
    lesson: 'frontend-basic/javascript-dari-nol/apa-itu-javascript',
  },
  {
    term: 'Hoisting',
    category: 'frontend-basic',
    definition:
      'Pengangkatan deklarasi ke atas scope sebelum kode dijalankan. `var` menjadi `undefined`; `let` dan `const` melempar error sampai barisnya tercapai.',
    lesson: 'frontend-basic/javascript-dari-nol/variabel-let-const-var',
  },
  {
    term: 'Temporal Dead Zone',
    category: 'frontend-basic',
    aliases: ['TDZ'],
    definition:
      'Rentang antara awal blok dan baris deklarasi `let`/`const`. Mengakses variabel di rentang ini melempar error alih-alih memberi `undefined` diam-diam.',
    lesson: 'frontend-basic/javascript-dari-nol/variabel-let-const-var',
  },
  {
    term: 'Primitif vs Reference',
    category: 'frontend-basic',
    definition:
      'Nilai primitif disalin apa adanya; object dan array disalin alamatnya, sehingga dua variabel bisa menunjuk data yang sama.',
    lesson: 'frontend-basic/javascript-dari-nol/tipe-data',
  },
  {
    term: 'Closure',
    category: 'frontend-basic',
    definition:
      'Fungsi yang tetap mengingat lingkungan tempat ia dibuat, meski dipanggil dari tempat lain.',
    lesson: 'frontend-basic/javascript-dari-nol/scope-hoisting-closure',
  },
  {
    term: 'Prototype Chain',
    category: 'frontend-basic',
    definition:
      'Rantai objek yang ditelusuri JavaScript saat mencari property yang tidak ada di objek itu sendiri. Ini mekanisme pewarisan asli JavaScript.',
    lesson: 'frontend-basic/oop-javascript/prototype-chain',
  },
  {
    term: 'Event Loop',
    category: 'frontend-basic',
    definition:
      'Mekanisme yang memindahkan tugas dari antrean ke call stack saat stack kosong — yang membuat bahasa bertugas-tunggal bisa menangani banyak hal sekaligus.',
    lesson: 'frontend-basic/asynchronous-javascript/event-loop',
  },
  {
    term: 'Microtask',
    category: 'frontend-basic',
    definition:
      'Antrean berprioritas tinggi tempat callback Promise berada. Dikuras habis sebelum macrotask seperti `setTimeout` dijalankan.',
    lesson: 'frontend-basic/asynchronous-javascript/microtask-macrotask',
  },
  {
    term: 'Event Delegation',
    category: 'frontend-basic',
    definition:
      'Memasang satu listener di elemen induk untuk menangani event dari seluruh anaknya, termasuk anak yang ditambahkan kemudian.',
    lesson: 'frontend-basic/manipulasi-dom/bubbling-delegation',
  },
  {
    term: 'XSS',
    category: 'frontend-basic',
    aliases: ['Cross-Site Scripting'],
    definition:
      'Kerentanan ketika data dari pengguna dirender sebagai HTML atau skrip, sehingga penyerang bisa menjalankan kode di browser korban.',
    lesson: 'frontend-basic/manipulasi-dom/mengubah-konten',
  },
  {
    term: 'CORS',
    category: 'frontend-basic',
    definition:
      'Aturan yang ditegakkan browser tentang siapa boleh membaca respons lintas origin. CORS bukan kontrol akses — `curl` tidak terpengaruh sama sekali.',
    lesson: 'frontend-basic/ajax-web-api/cors',
  },
  {
    term: 'JSX',
    category: 'frontend-basic',
    definition:
      'Sintaks mirip HTML di dalam JavaScript yang dikompilasi menjadi pemanggilan fungsi biasa. Bukan HTML, bukan template engine.',
    lesson: 'frontend-basic/jsx-dan-tsx/kenapa-jsx',
  },
  {
    term: 'Utility-First',
    category: 'frontend-intermediate',
    definition:
      'Pendekatan CSS yang menyusun tampilan dari banyak class kecil bertugas tunggal, alih-alih membuat class bernama per komponen.',
    lesson: 'frontend-intermediate/tailwind-css/filosofi-utility-first',
  },
  {
    term: 'Design Token',
    category: 'frontend-intermediate',
    definition:
      'Nilai desain (warna, spacing, radius) yang disimpan sebagai variabel bernama dan menjadi satu-satunya sumber kebenaran untuk seluruh antarmuka.',
    lesson: 'frontend-intermediate/tailwind-css/design-token-theme',
  },
  {
    term: 'Reconciliation',
    category: 'frontend-intermediate',
    definition:
      'Proses React membandingkan pohon elemen baru dengan yang lama untuk menentukan perubahan minimum di DOM.',
    lesson: 'frontend-intermediate/fundamental-reactjs/virtual-dom',
  },
  {
    term: 'Server Component',
    category: 'frontend-intermediate',
    aliases: ['RSC'],
    definition:
      'Komponen React yang dirender di server dan kodenya tidak dikirim ke browser. Tidak bisa memakai state atau event handler.',
    lesson: 'frontend-intermediate/jenis-komponen-react/server-vs-client-component',
  },
  {
    term: 'Server State',
    category: 'frontend-intermediate',
    definition:
      'Data yang sumber kebenarannya ada di server. Ia punya kebasian, revalidasi, dan mode gagal sendiri — beda dari state klien biasa.',
    lesson: 'frontend-intermediate/state-management/tanstack-query',
  },
  {
    term: 'Compound Component',
    category: 'frontend-intermediate',
    definition:
      'Beberapa komponen yang bekerja sama lewat context bersama, sehingga struktur pemakaiannya terbaca langsung dari markup.',
    lesson: 'frontend-intermediate/jenis-komponen-react/compound-component',
  },
  {
    term: 'Hydration',
    category: 'frontend-intermediate',
    definition:
      'Proses React menempelkan interaktivitas ke HTML yang sudah dirender server. Ketidakcocokan antara keduanya menghasilkan peringatan hidrasi.',
    lesson: 'frontend-intermediate/nextjs/kenapa-nextjs',
  },
  {
    term: 'Idempoten',
    category: 'backend-basic',
    definition:
      'Operasi yang memberi hasil akhir sama meski dijalankan berkali-kali. `PUT` dan `DELETE` idempoten; `POST` biasanya tidak.',
    lesson: 'backend-basic/fondasi-backend/http-mendalam',
  },
  {
    term: 'Middleware',
    category: 'backend-basic',
    definition:
      'Fungsi yang berjalan di antara permintaan masuk dan penanganannya. Urutan pendaftarannya menentukan urutan eksekusinya.',
    lesson: 'backend-basic/nodejs-express-basic/middleware',
  },
  {
    term: 'ACID',
    category: 'backend-basic',
    definition: 'Empat jaminan transaksi database: Atomicity, Consistency, Isolation, Durability.',
    lesson: 'backend-basic/database-sql-dasar/transaksi-acid',
  },
  {
    term: 'SQL Injection',
    category: 'backend-basic',
    definition:
      'Kerentanan ketika input pengguna ikut menjadi bagian perintah SQL. Dicegah dengan prepared statement, bukan dengan penyaringan karakter.',
    lesson: 'backend-basic/database-sql-dasar/sql-injection',
  },
  {
    term: 'IDOR',
    category: 'backend-basic',
    aliases: ['Insecure Direct Object Reference'],
    definition:
      'Mengakses data milik orang lain hanya dengan mengganti ID pada permintaan, karena server tidak memeriksa kepemilikan.',
    lesson: 'backend-basic/auth-dasar/idor',
  },
  {
    term: 'JWT',
    category: 'backend-basic',
    aliases: ['JSON Web Token'],
    definition:
      'Token bertanda tangan yang bisa diverifikasi tanpa query database. Payload-nya base64, bukan enkripsi — siapa pun bisa membacanya.',
    lesson: 'backend-basic/auth-dasar/jwt',
  },
  {
    term: 'N+1 Query',
    category: 'backend-intermediate',
    definition:
      'Mengambil N baris lalu menjalankan satu query tambahan per baris untuk relasinya. Diperbaiki dengan eager loading.',
    lesson: 'backend-intermediate/laravel-intermediate/n-plus-one',
  },
  {
    term: 'Idempotency Key',
    category: 'backend-intermediate',
    definition:
      'Kunci unik per operasi yang dikirim klien, supaya permintaan yang diulang tidak menghasilkan efek ganda.',
    lesson: 'backend-intermediate/desain-api/idempotency',
  },
  {
    term: 'At-least-once Delivery',
    category: 'backend-intermediate',
    definition:
      'Jaminan antrean bahwa sebuah job akan dijalankan minimal sekali — dan karenanya bisa dijalankan lebih dari sekali. Handler harus idempoten.',
    lesson: 'backend-intermediate/express-intermediate/queue-bullmq',
  },
  {
    term: 'SSRF',
    category: 'backend-intermediate',
    aliases: ['Server-Side Request Forgery'],
    definition:
      'Memaksa server memanggil alamat pilihan penyerang, termasuk layanan internal dan endpoint metadata cloud yang tidak terjangkau dari luar.',
    lesson: 'backend-intermediate/keamanan-backend/ssrf',
  },
  {
    term: 'Zero Trust',
    category: 'backend-intermediate',
    definition:
      'Prinsip bahwa posisi di dalam jaringan bukan bukti kewenangan. Setiap permintaan diverifikasi, termasuk lalu lintas antar-layanan.',
    lesson: 'backend-intermediate/keamanan-backend/insecure-design',
  },
  {
    term: 'Expand–Migrate–Contract',
    category: 'deployment',
    definition:
      'Pola migrasi tanpa waktu henti: tambah bentuk baru, pindahkan data dan kode, baru hapus bentuk lama di rilis berikutnya.',
    lesson: 'deployment/deploy-backend/migrasi-saat-deploy',
  },
  {
    term: 'Reverse Proxy',
    category: 'deployment',
    definition:
      'Server di depan aplikasi yang menerima permintaan dari internet, lalu meneruskannya ke aplikasi. Menangani TLS, kompresi, dan berkas statis.',
    lesson: 'deployment/fondasi-deployment/reverse-proxy',
  },
  {
    term: 'CI/CD',
    category: 'deployment',
    definition:
      'Continuous Integration menjalankan pemeriksaan otomatis pada setiap perubahan; Continuous Delivery/Deployment mengotomatiskan rilisnya.',
    lesson: 'deployment/ci-cd/konsep-ci-cd',
  },
  {
    term: 'Correlation ID',
    category: 'deployment',
    definition:
      'Identifier yang menempel pada satu permintaan dan muncul di semua baris log yang dihasilkannya, sehingga satu perjalanan bisa ditelusuri utuh.',
    lesson: 'deployment/setelah-rilis/logging-terpusat',
  },
  {
    term: 'Core Web Vitals',
    category: 'deployment',
    definition:
      'Tiga metrik pengalaman pengguna: LCP (kapan konten utama muncul), INP (seberapa cepat respons interaksi), CLS (seberapa banyak layout bergeser).',
    lesson: 'deployment/setelah-rilis/analytics-web-vitals',
  },
];
