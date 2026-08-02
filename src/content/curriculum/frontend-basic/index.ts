import { defineCategory, defineChapter, q } from '@/lib/curriculum/authoring';
import { chapter as chapter1 } from './01-javascript-dari-nol';
import { lessons as lessonsAjax } from './ajax/lessons';
import { lessons as lessonsAsync } from './async/lessons';
import { lessons as lessonsDom } from './dom/lessons';
import { lessons as lessonsJsxTsx } from './jsx-tsx/lessons';
import { lessons as lessonsOop } from './oop/lessons';

/**
 * Frontend Basic — 6 chapters, 76 lessons.
 *
 * Ordering note: the learner's brief listed "JSX vs TSX" first. It is chapter 6 here instead,
 * because JSX only makes sense after JavaScript and TSX only after basic TypeScript. Nothing was
 * dropped — the sequence was rebuilt around what has to be understood before what
 * (see plans/website-belajar-fullstack/06-kurikulum.md).
 */

const chapter2 = defineChapter({
  slug: 'oop-javascript',
  number: 2,
  title: 'Konsep OOP pada JavaScript',
  summary:
    'Objek, prototype, dan class — termasuk kenapa `class` di JavaScript bukan class seperti di Java.',
  objectives: [
    'Menjelaskan rantai prototype dan bedanya dengan inheritance klasik',
    'Menentukan nilai `this` untuk empat cara pemanggilan fungsi',
    'Memilih antara inheritance dan composition dengan alasan yang bisa dipertahankan',
  ],
  prerequisites: [{ category: 'frontend-basic', chapter: 'javascript-dari-nol' }],
  stackVersions: ['ECMAScript 2024'],
  reviewedAt: '2026-08-02',
  lessons: lessonsOop,
  quiz: [
    q(
      'fb2-q1',
      'Apa yang menentukan nilai `this` di dalam sebuah fungsi biasa?',
      [
        'Tempat fungsi itu ditulis',
        'Cara fungsi itu dipanggil',
        'Nama fungsinya',
        'Urutan deklarasinya',
      ],
      1,
      'Untuk fungsi biasa, `this` ditentukan saat pemanggilan (call-site). Arrow function adalah pengecualian: ia tidak punya `this` sendiri dan mengambilnya dari scope tempat ia ditulis.',
    ),
    q(
      'fb2-q2',
      'Apa hubungan `class` dengan prototype di JavaScript?',
      [
        '`class` menggantikan prototype sepenuhnya',
        '`class` adalah gula sintaks di atas mekanisme prototype',
        'Keduanya tidak berhubungan',
        '`class` hanya bekerja di TypeScript',
      ],
      1,
      'Di balik layar, `class` tetap membuat function constructor dan mengisi `prototype`-nya. `Object.getPrototypeOf(instance) === Kelas.prototype` membuktikannya.',
    ),
    q(
      'fb2-q3',
      'Kenapa composition sering lebih disukai daripada inheritance yang dalam?',
      [
        'Karena lebih cepat dieksekusi',
        'Karena perubahan di class induk tidak merembet tak terduga ke banyak turunan',
        'Karena inheritance tidak didukung JavaScript',
        'Karena composition selalu butuh kode lebih sedikit',
      ],
      1,
      'Hierarki yang dalam membuat setiap perubahan di induk berpotensi memengaruhi seluruh turunan — masalah "base class yang rapuh". Composition menyusun perilaku dari bagian kecil yang bisa diganti sendiri-sendiri.',
    ),
  ],
  practice: {
    id: 'frontend-basic/oop-javascript',
    title: 'Praktik bab ini',
    items: [
      'Buat satu objek dengan tiga cara: literal, factory, dan class — lalu bandingkan',
      'Buktikan di console bahwa method yang dilepas dari objeknya kehilangan `this`',
      'Refactor To-Do List menjadi class dengan private field',
      'Tambah satu perilaku baru lewat composition, bukan lewat `extends`',
    ],
  },
});

const chapter3 = defineChapter({
  slug: 'asynchronous-javascript',
  number: 3,
  title: 'Asynchronous JavaScript',
  summary:
    'Event loop, Promise, dan `async`/`await` — cara JavaScript menangani pekerjaan yang butuh waktu.',
  objectives: [
    'Menjelaskan urutan eksekusi antara kode sinkron, microtask, dan macrotask',
    'Menulis operasi paralel dengan `Promise.all` alih-alih `await` berantai',
    'Membatalkan permintaan yang tidak lagi dibutuhkan dengan `AbortController`',
  ],
  prerequisites: [{ category: 'frontend-basic', chapter: 'javascript-dari-nol' }],
  stackVersions: ['ECMAScript 2024'],
  reviewedAt: '2026-08-02',
  lessons: lessonsAsync,
  quiz: [
    q(
      'fb3-q1',
      'Manakah yang dicetak lebih dulu?\n\nsetTimeout(() => console.log("A"), 0);\nPromise.resolve().then(() => console.log("B"));',
      ['A lalu B', 'B lalu A', 'Tergantung browser', 'Keduanya bersamaan'],
      1,
      'Callback Promise masuk antrean microtask, yang dikuras sampai habis sebelum event loop mengambil macrotask berikutnya seperti `setTimeout`. Jadi B selalu lebih dulu, di runtime mana pun.',
    ),
    q(
      'fb3-q2',
      'Kenapa `await` di dalam loop sering menjadi masalah performa?',
      [
        'Karena `await` lambat',
        'Karena setiap iterasi menunggu iterasi sebelumnya selesai, padahal permintaannya independen',
        'Karena loop tidak mendukung Promise',
        'Karena `await` membuat memori bocor',
      ],
      1,
      'Kalau operasinya tidak saling bergantung, jalankan bersamaan: kumpulkan promise-nya lalu `await Promise.all(...)`. Sepuluh permintaan @200ms menjadi ±200ms, bukan ±2 detik.',
    ),
    q(
      'fb3-q3',
      'Apa beda `Promise.all` dan `Promise.allSettled`?',
      [
        'Tidak ada bedanya',
        '`all` gagal begitu satu promise ditolak; `allSettled` selalu menunggu semuanya dan melaporkan hasil masing-masing',
        '`allSettled` lebih cepat',
        '`all` hanya untuk dua promise',
      ],
      1,
      'Pakai `all` kalau semua hasil dibutuhkan dan satu kegagalan membuat sisanya tidak berguna. Pakai `allSettled` kalau sebagian boleh gagal — misalnya memuat beberapa widget dashboard yang berdiri sendiri.',
    ),
  ],
  practice: {
    id: 'frontend-basic/asynchronous-javascript',
    title: 'Praktik bab ini',
    items: [
      'Prediksi urutan output sebuah kode campuran sinkron/microtask/macrotask, lalu buktikan',
      'Ubah tiga `await` berurutan menjadi satu `Promise.all` dan ukur selisihnya',
      'Tambahkan timeout 5 detik ke sebuah `fetch` dengan `AbortController`',
      'Tulis fungsi retry dengan backoff eksponensial dan batas 3 percobaan',
    ],
  },
});

const chapter4 = defineChapter({
  slug: 'manipulasi-dom',
  number: 4,
  title: 'Manipulasi DOM',
  summary:
    'Membaca dan mengubah halaman dari JavaScript — fondasi yang menjelaskan apa yang React otomatiskan.',
  objectives: [
    'Menyeleksi, membuat, dan menghapus elemen dengan aman',
    'Menjelaskan event delegation dan kapan ia menghemat banyak listener',
    'Menghindari `innerHTML` pada data yang berasal dari pengguna',
  ],
  prerequisites: [{ category: 'frontend-basic', chapter: 'javascript-dari-nol' }],
  stackVersions: ['DOM Living Standard'],
  reviewedAt: '2026-08-02',
  lessons: lessonsDom,
  quiz: [
    q(
      'fb4-q1',
      'Kenapa `element.innerHTML = dataPengguna` berbahaya?',
      [
        'Karena lambat',
        'Karena string HTML dari pengguna bisa berisi skrip atau atribut event yang ikut dieksekusi — itu celah XSS',
        'Karena `innerHTML` sudah usang',
        'Karena tidak berfungsi di semua browser',
      ],
      1,
      'Konten yang berasal dari pengguna harus diperlakukan sebagai teks, bukan markup. Pakai `textContent`; kalau HTML memang wajib, sanitasi dulu dengan pustaka yang teruji.',
    ),
    q(
      'fb4-q2',
      'Apa keuntungan utama event delegation?',
      [
        'Membuat animasi lebih halus',
        'Satu listener di elemen induk menangani seluruh anak, termasuk anak yang ditambahkan kemudian',
        'Menghapus kebutuhan `preventDefault`',
        'Mempercepat CSS',
      ],
      1,
      'Alih-alih memasang listener ke setiap baris daftar, satu listener di wadahnya sudah cukup. Elemen yang dibuat setelahnya otomatis ikut tertangani — dan jumlah listener tidak tumbuh seiring data.',
    ),
    q(
      'fb4-q3',
      'Apa yang menyebabkan "layout thrashing"?',
      [
        'Terlalu banyak file CSS',
        'Membaca properti layout dan menulis style secara bergantian di dalam loop, sehingga browser dipaksa menghitung ulang berkali-kali',
        'Memakai `classList` daripada `style`',
        'Memakai `DocumentFragment`',
      ],
      1,
      'Membaca `offsetHeight` memaksa browser menyelesaikan layout tertunda. Kalau itu dilakukan setelah setiap penulisan, layout dihitung ulang tiap iterasi. Kumpulkan semua pembacaan dulu, baru lakukan penulisannya.',
    ),
  ],
  practice: {
    id: 'frontend-basic/manipulasi-dom',
    title: 'Praktik bab ini',
    items: [
      'Render daftar dari array tanpa memakai `innerHTML` sama sekali',
      'Ganti sepuluh listener menjadi satu dengan event delegation',
      'Tangkap submit form dan ubah isinya menjadi objek dengan `FormData`',
      'Pakai `IntersectionObserver` untuk memuat gambar hanya saat terlihat',
    ],
  },
});

const chapter5 = defineChapter({
  slug: 'ajax-web-api',
  number: 5,
  title: 'AJAX & Web API',
  summary:
    'Mengambil data dari server tanpa memuat ulang halaman, dan API browser yang sering dipakai bersamanya.',
  objectives: [
    'Memanggil REST API dengan `fetch` beserta penanganan errornya yang benar',
    'Menjelaskan apa yang sebenarnya terjadi saat browser memblokir permintaan karena CORS',
    'Menampilkan empat keadaan UI untuk setiap pengambilan data',
  ],
  prerequisites: [
    { category: 'frontend-basic', chapter: 'asynchronous-javascript' },
    { category: 'frontend-basic', chapter: 'manipulasi-dom' },
  ],
  stackVersions: ['Fetch Standard', 'HTTP/1.1 & HTTP/2'],
  reviewedAt: '2026-08-02',
  lessons: lessonsAjax,
  quiz: [
    q(
      'fb5-q1',
      'Apa yang terjadi saat `fetch` menerima respons dengan status 404?',
      [
        'Promise-nya ditolak dan masuk ke `catch`',
        'Promise-nya tetap terpenuhi; kamu harus memeriksa `response.ok` sendiri',
        '`fetch` otomatis mengulang permintaan',
        'Browser menampilkan halaman error',
      ],
      1,
      '`fetch` hanya menolak untuk kegagalan jaringan atau permintaan yang dibatalkan. Respons 404 dan 500 tetap dianggap "berhasil diterima". Selalu periksa `response.ok` sebelum membaca body.',
    ),
    q(
      'fb5-q2',
      'Apa yang benar tentang CORS?',
      [
        'CORS mengamankan API dari akses tidak sah',
        'CORS adalah aturan yang ditegakkan browser; server tetap harus melakukan otorisasi sendiri',
        'CORS diatur oleh klien',
        'CORS mencegah SQL injection',
      ],
      1,
      'CORS hanya mengatur apakah *browser* mengizinkan JavaScript membaca respons lintas origin. `curl`, Postman, atau skrip server tidak terpengaruh sama sekali. Otorisasi tetap tanggung jawab server.',
    ),
    q(
      'fb5-q3',
      'Kenapa menyimpan token autentikasi di `localStorage` berisiko?',
      [
        'Karena `localStorage` terlalu kecil',
        'Karena skrip apa pun yang berjalan di halaman itu bisa membacanya — satu celah XSS berarti token tercuri',
        'Karena `localStorage` dikirim otomatis ke server',
        'Karena datanya hilang saat tab ditutup',
      ],
      1,
      'Cookie `HttpOnly` tidak bisa dibaca JavaScript, sehingga XSS tidak langsung berarti pencurian token. Konsekuensinya, auth berbasis cookie membutuhkan perlindungan CSRF.',
    ),
  ],
  practice: {
    id: 'frontend-basic/ajax-web-api',
    title: 'Praktik bab ini',
    items: [
      'Panggil satu REST API publik dan tangani 404 secara eksplisit',
      'Tampilkan keempat keadaan UI untuk satu daftar data',
      'Tambahkan pembatalan permintaan saat kotak pencarian diketik cepat',
      'Buat satu fungsi pembungkus `fetch` dengan timeout dan bentuk error yang seragam',
    ],
  },
});

const chapter6 = defineChapter({
  slug: 'jsx-dan-tsx',
  number: 6,
  title: 'Perbedaan JSX dan TSX',
  summary:
    'Jembatan dari JavaScript murni ke React — dan apa yang ditambahkan TypeScript di atasnya.',
  objectives: [
    'Menjelaskan JSX sebagai gula sintaks untuk pemanggilan fungsi biasa',
    'Memberi tipe pada props, children, event, dan ref di file `.tsx`',
    'Memutuskan kapan sebuah project sebaiknya memakai TSX sejak awal',
  ],
  prerequisites: [
    { category: 'frontend-basic', chapter: 'manipulasi-dom' },
    { category: 'frontend-basic', chapter: 'oop-javascript' },
  ],
  stackVersions: ['React 19.2', 'TypeScript 5.9'],
  reviewedAt: '2026-08-02',
  lessons: lessonsJsxTsx,
  quiz: [
    q(
      'fb6-q1',
      'JSX sebenarnya berubah menjadi apa setelah dikompilasi?',
      [
        'String HTML',
        'Pemanggilan fungsi yang mengembalikan objek deskripsi elemen',
        'Perintah `document.createElement` langsung',
        'Template literal',
      ],
      1,
      '`<h1>Halo</h1>` menjadi kira-kira `jsx("h1", { children: "Halo" })`, yang mengembalikan objek biasa. React memakai objek itu untuk memutuskan apa yang perlu diubah di DOM sungguhan.',
    ),
    q(
      'fb6-q2',
      'Apa masalah kode `{items.length && <List />}` ketika `items` kosong?',
      [
        'Tidak ada masalah',
        'React menampilkan angka 0 di layar, karena `0` adalah nilai falsy yang tetap dirender',
        'React melempar error',
        'Komponen dirender dua kali',
      ],
      1,
      '`0 && x` menghasilkan `0`, dan React merender angka nol sebagai teks. Pakai `items.length > 0 && <List />` supaya sisi kirinya benar-benar boolean.',
    ),
    q(
      'fb6-q3',
      'Apa keuntungan utama `.tsx` dibanding `.jsx`?',
      [
        'File-nya lebih kecil',
        'Kesalahan props, event, dan bentuk data tertangkap saat menulis, bukan saat aplikasi dijalankan',
        'Rendering lebih cepat',
        'Tidak perlu `key` pada list',
      ],
      1,
      'TypeScript memindahkan sekelas bug dari runtime ke waktu tulis. Biayanya adalah waktu belajar dan sedikit tambahan sintaks; imbalannya terasa begitu jumlah komponen bertambah.',
    ),
  ],
  practice: {
    id: 'frontend-basic/jsx-dan-tsx',
    title: 'Praktik bab ini',
    items: [
      'Tulis satu komponen dalam JSX, lalu konversikan ke TSX',
      'Beri tipe pada props yang punya nilai opsional dan nilai default',
      'Ketik satu handler `onChange` dan satu `useRef` untuk elemen input',
      'Ubah komponen dengan tiga boolean prop menjadi satu discriminated union',
    ],
  },
});

export const frontendBasic = defineCategory({
  slug: 'frontend-basic',
  order: 1,
  title: 'Frontend Basic',
  tagline: 'Fondasi yang menentukan segalanya',
  description:
    'Tanpa bab-bab ini, React akan terasa seperti sihir yang kadang bekerja. Mulai dari JavaScript nol, lalu objek, asinkron, DOM, pengambilan data, dan berakhir di JSX sebagai jembatan ke React.',
  chapters: [chapter1, chapter2, chapter3, chapter4, chapter5, chapter6],
});
