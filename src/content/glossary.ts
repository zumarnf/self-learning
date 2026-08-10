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
    term: 'Type Coercion',
    category: 'frontend-basic',
    aliases: ['Coercion', 'Konversi tipe otomatis'],
    definition:
      'Perilaku JavaScript diam-diam mengubah tipe sebuah nilai agar operasinya tetap bisa dijalankan. `"5" - 2` menghasilkan `3` karena teks `"5"` dipaksa menjadi angka.',
    lesson: 'frontend-basic/javascript-dari-nol/operator-dan-coercion',
  },
  {
    term: 'Truthy & Falsy',
    category: 'frontend-basic',
    definition:
      'Sifat sebuah nilai saat dipakai sebagai kondisi. Hanya delapan nilai yang falsy (`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`); sisanya truthy — termasuk `[]` dan `{}`.',
    lesson: 'frontend-basic/javascript-dari-nol/operator-dan-coercion',
  },
  {
    term: 'Short-circuit',
    category: 'frontend-basic',
    definition:
      'Sifat `&&` dan `||` yang berhenti mengevaluasi begitu hasilnya sudah pasti, sehingga sisi kanan tidak pernah dijalankan. Dasar dari pola `pengguna && kirimEmail(pengguna)`.',
    lesson: 'frontend-basic/javascript-dari-nol/operator-dan-coercion',
  },
  {
    term: 'Nullish Coalescing',
    category: 'frontend-basic',
    aliases: ['??'],
    definition:
      'Operator `??` yang memakai nilai cadangan hanya untuk `null` dan `undefined`. Berbeda dari `||`, ia menghormati `0` dan string kosong sebagai nilai yang sah.',
    lesson: 'frontend-basic/javascript-dari-nol/operator-dan-coercion',
  },
  {
    term: 'Optional Chaining',
    category: 'frontend-basic',
    aliases: ['?.'],
    definition:
      'Operator `?.` yang menghentikan pembacaan dengan aman dan menghasilkan `undefined` bila bagian sebelumnya kosong, alih-alih melempar `TypeError`.',
    lesson: 'frontend-basic/javascript-dari-nol/object',
  },
  {
    term: 'Callback',
    category: 'frontend-basic',
    definition:
      'Fungsi yang diserahkan ke fungsi lain untuk dipanggil nanti — pada tiap elemen array, saat tombol diklik, atau saat data selesai datang.',
    lesson: 'frontend-basic/javascript-dari-nol/fungsi',
  },
  {
    term: 'Lexical Scoping',
    category: 'frontend-basic',
    definition:
      'Aturan bahwa scope ditentukan oleh tempat kode **ditulis**, bukan tempat fungsinya dipanggil. Karena itu scope bisa dibaca tanpa menjalankan program.',
    lesson: 'frontend-basic/javascript-dari-nol/scope-hoisting-closure',
  },
  {
    term: 'Mutasi',
    category: 'frontend-basic',
    aliases: ['Mutation', 'Mutable'],
    definition:
      'Perubahan langsung pada data asli, bukan pada salinan baru. `push` dan `sort` melakukannya; `map`, `filter`, dan `toSorted` tidak. Pembedaan ini menentukan benar-tidaknya render ulang di React.',
    lesson: 'frontend-basic/javascript-dari-nol/array-dan-method',
  },
  {
    term: 'Immutable',
    category: 'frontend-basic',
    definition:
      'Tidak bisa diubah isinya. String di JavaScript immutable — setiap method string menghasilkan string baru dan tidak pernah mengubah yang lama.',
    lesson: 'frontend-basic/javascript-dari-nol/string-dan-template-literal',
  },
  {
    term: 'Destructuring',
    category: 'frontend-basic',
    definition:
      'Mengambil beberapa nilai sekaligus dari dalam object atau array lalu memberi masing-masing nama sendiri. Object berbasis nama, array berbasis posisi.',
    lesson: 'frontend-basic/javascript-dari-nol/destructuring-spread',
  },
  {
    term: 'Spread & Rest',
    category: 'frontend-basic',
    definition:
      'Tanda `...` yang menyebar isi bila berada di sisi kanan atau di pemanggilan fungsi, dan mengumpulkan sisa bila berada di sisi kiri atau di daftar parameter.',
    lesson: 'frontend-basic/javascript-dari-nol/destructuring-spread',
  },
  {
    term: 'Fungsi Murni',
    category: 'frontend-basic',
    aliases: ['Pure Function'],
    definition:
      'Fungsi yang hasilnya hanya bergantung pada argumennya dan tidak mengubah apa pun di luar dirinya. Paling mudah diuji, dan disyaratkan React untuk komponennya.',
    lesson: 'frontend-basic/javascript-dari-nol/praktik-todo-logic',
  },
  {
    term: 'ESM',
    category: 'frontend-basic',
    aliases: ['ECMAScript Modules', 'Modul ES'],
    definition:
      'Sistem modul resmi JavaScript yang memakai `import`/`export`. Berjalan di browser maupun Node modern, dan memungkinkan tree-shaking — tidak seperti CommonJS.',
    lesson: 'frontend-basic/javascript-dari-nol/modul-es',
  },
  {
    term: 'Tree-shaking',
    category: 'frontend-basic',
    definition:
      'Pembuangan kode yang tidak pernah diimpor siapa pun oleh bundler, sehingga berkas yang dikirim ke browser lebih kecil. Hanya mungkin pada modul ESM.',
    lesson: 'frontend-basic/javascript-dari-nol/modul-es',
  },
  {
    term: 'Code Splitting',
    category: 'frontend-basic',
    definition:
      'Memecah aplikasi menjadi beberapa berkas yang baru diunduh saat benar-benar dipakai, lewat `import()` dinamis. Dipakai website ini untuk memuat editor playground.',
    lesson: 'frontend-basic/javascript-dari-nol/modul-es',
  },
  {
    term: 'Strict Mode',
    category: 'frontend-basic',
    aliases: ['use strict', 'Mode ketat'],
    definition:
      'Mode yang mengubah beberapa kesalahan diam-diam menjadi error yang terlihat, misalnya salah ketik nama variabel. Modul ES selalu berjalan dalam mode ini.',
    lesson: 'frontend-basic/javascript-dari-nol/debugging',
  },
  {
    term: 'Stack Trace',
    category: 'frontend-basic',
    aliases: ['Jejak tumpukan'],
    definition:
      'Daftar siapa memanggil siapa yang dicetak bersama sebuah error, dari pemanggilan terbaru ke terlama. Baris pertama adalah tempat kejadiannya.',
    lesson: 'frontend-basic/javascript-dari-nol/error-handling',
  },
  {
    term: 'Prototype Chain',
    category: 'frontend-basic',
    definition:
      'Rantai objek yang ditelusuri JavaScript saat mencari property yang tidak ada di objek itu sendiri. Ini mekanisme pewarisan asli JavaScript.',
    lesson: 'frontend-basic/oop-javascript/prototype-chain',
  },
  {
    term: 'Encapsulation',
    category: 'frontend-basic',
    aliases: ['Enkapsulasi'],
    definition:
      'Menyembunyikan keadaan internal sehingga hanya bisa diubah lewat pintu yang kamu sediakan. Nilainya bukan kerahasiaan, melainkan jaminan bahwa aturan seperti "saldo tidak boleh negatif" mustahil dilanggar dari luar.',
    lesson: 'frontend-basic/oop-javascript/encapsulation',
  },
  {
    term: 'Private Field',
    category: 'frontend-basic',
    aliases: ['#field'],
    definition:
      'Property yang namanya diawali `#` dan dijaga bahasa — mengaksesnya dari luar class adalah `SyntaxError`, bukan sekadar tidak sopan. Berbeda dari konvensi `_nama` yang hanya kesepakatan.',
    lesson: 'frontend-basic/oop-javascript/encapsulation',
  },
  {
    term: 'this Binding',
    category: 'frontend-basic',
    aliases: ['Binding'],
    definition:
      'Penentuan nilai `this` untuk sebuah pemanggilan, dengan empat aturan berprioritas: `new` > explicit (`call`/`bind`) > implicit (`o.fn()`) > default. Ditentukan oleh call-site, bukan tempat fungsi ditulis.',
    lesson: 'frontend-basic/oop-javascript/this-binding',
  },
  {
    term: 'Gula Sintaks',
    category: 'frontend-basic',
    aliases: ['Syntactic Sugar'],
    definition:
      'Sintaks yang membuat sesuatu lebih enak ditulis tanpa menambah kemampuan baru. `class` adalah contohnya — `typeof Pengguna` tetap menjawab `"function"`.',
    lesson: 'frontend-basic/oop-javascript/class-dasar',
  },
  {
    term: 'Duck Typing',
    category: 'frontend-basic',
    definition:
      '"Kalau ia berjalan dan bersuara seperti bebek, ia bebek." JavaScript tidak peduli sebuah objek bertipe apa — yang penting ia punya method yang dipanggil. Object literal, factory, dan class bisa bercampur bebas.',
    lesson: 'frontend-basic/oop-javascript/polymorphism',
  },
  {
    term: 'Composition over Inheritance',
    category: 'frontend-basic',
    aliases: ['Composition'],
    definition:
      'Menyusun kemampuan dari bagian kecil yang berdiri sendiri, alih-alih mewarisi pohon yang kaku. Tes kalimatnya: "X adalah Y" → inheritance, "X punya Y" → composition.',
    lesson: 'frontend-basic/oop-javascript/composition-over-inheritance',
  },
  {
    term: 'Liskov Substitution',
    category: 'frontend-basic',
    aliases: ['LSP'],
    definition:
      'Objek turunan harus bisa menggantikan induknya tanpa mengejutkan pemanggil. Pinguin yang mewarisi `terbang()` lalu melempar error melanggarnya — tanda hierarkinya salah pilih.',
    lesson: 'frontend-basic/oop-javascript/solid-ringkas',
  },
  {
    term: 'Dependency Inversion',
    category: 'frontend-basic',
    aliases: ['Dependency Injection'],
    definition:
      'Bergantung pada kemampuan yang diserahkan dari luar, bukan mengambil sendiri implementasi konkret dari dalam. Inilah yang membuat test tidak perlu menambal `fetch` global.',
    lesson: 'frontend-basic/oop-javascript/solid-ringkas',
  },
  {
    term: 'Factory Method',
    category: 'frontend-basic',
    definition:
      'Method `static` yang membuat instance dengan cara tertentu dan punya nama yang menjelaskan asal datanya — `Pengguna.dariJSON(...)`. Tidak seperti `new`, ia boleh mengembalikan objek yang sudah ada.',
    lesson: 'frontend-basic/oop-javascript/static-factory',
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
    term: 'Blocking',
    category: 'frontend-basic',
    definition:
      'Pekerjaan yang menahan call stack begitu lama sehingga event loop tidak sempat memasukkan apa pun. Akibatnya halaman tidak bisa di-scroll atau diklik, karena tampilan dan JavaScript berbagi satu utas.',
    lesson: 'frontend-basic/asynchronous-javascript/event-loop',
  },
  {
    term: 'Promise',
    category: 'frontend-basic',
    definition:
      'Objek yang mewakili hasil operasi yang belum selesai. Punya tiga keadaan — `pending`, `fulfilled`, `rejected` — dan sekali berpindah dari `pending`, keadaannya tidak bisa berubah lagi.',
    lesson: 'frontend-basic/asynchronous-javascript/promise',
  },
  {
    term: 'Unhandled Rejection',
    category: 'frontend-basic',
    definition:
      'Promise yang gagal tanpa satu pun `.catch()` atau `try`/`catch` yang menangkapnya. Di browser muncul sebagai peringatan console; di Node.js modern ia menghentikan proses.',
    lesson: 'frontend-basic/asynchronous-javascript/promise',
  },
  {
    term: 'Callback Hell',
    category: 'frontend-basic',
    aliases: ['Pyramid of Doom'],
    definition:
      'Callback bersarang berlapis-lapis karena tiap operasi menunggu hasil sebelumnya. Masalahnya bukan estetika: penanganan error terduplikasi di tiap tingkat dan alur bacanya berlawanan dengan urutan kejadian.',
    lesson: 'frontend-basic/asynchronous-javascript/callback',
  },
  {
    term: 'Inversion of Control',
    category: 'frontend-basic',
    definition:
      'Menyerahkan fungsimu ke pihak lain sehingga pihak itu yang memutuskan kapan dan berapa kali ia dipanggil. Promise mengembalikan kendali itu — ia hanya bisa selesai sekali.',
    lesson: 'frontend-basic/asynchronous-javascript/callback',
  },
  {
    term: 'Exponential Backoff',
    category: 'frontend-basic',
    aliases: ['Backoff', 'Jitter'],
    definition:
      'Menunda percobaan ulang dengan jeda berlipat (1s, 2s, 4s) ditambah keacakan, supaya klien tidak mengulang serempak dan memperparah server yang sedang pulih.',
    lesson: 'frontend-basic/asynchronous-javascript/retry-backoff',
  },
  {
    term: 'AbortController',
    category: 'frontend-basic',
    aliases: ['AbortSignal', 'AbortError'],
    definition:
      'Cara standar membatalkan operasi yang sedang berjalan. `AbortError` yang dihasilkannya adalah pembatalan yang disengaja — jangan pernah ditampilkan sebagai pesan error ke pengguna.',
    lesson: 'frontend-basic/asynchronous-javascript/abort-timeout',
  },
  {
    term: 'Race Condition',
    category: 'frontend-basic',
    definition:
      'Dua operasi selesai dalam urutan yang tidak bisa dipastikan, sehingga hasilnya kadang benar kadang salah. Berbahaya karena hampir tidak pernah muncul di mesin pengembang yang jaringannya cepat.',
    lesson: 'frontend-basic/asynchronous-javascript/jebakan-async',
  },
  {
    term: 'Floating Promise',
    category: 'frontend-basic',
    definition:
      'Fungsi async yang dipanggil tanpa `await` dan tanpa `.catch()`, sehingga kegagalannya tidak pernah terlihat. Setiap promise harus di-`await` atau di-`catch` — tidak ada opsi ketiga.',
    lesson: 'frontend-basic/asynchronous-javascript/jebakan-async',
  },
  {
    term: 'Async Generator',
    category: 'frontend-basic',
    aliases: ['for await...of'],
    definition:
      'Fungsi `async function*` yang menghasilkan nilai bertahap dengan `yield`, dikonsumsi `for await...of`. Membuat paginasi jadi detail internal — pemanggil cukup melihat satu aliran item.',
    lesson: 'frontend-basic/asynchronous-javascript/async-iterator',
  },
  {
    term: 'Event Delegation',
    category: 'frontend-basic',
    definition:
      'Memasang satu listener di elemen induk untuk menangani event dari seluruh anaknya, termasuk anak yang ditambahkan kemudian.',
    lesson: 'frontend-basic/manipulasi-dom/bubbling-delegation',
  },
  {
    term: 'Reflow',
    category: 'frontend-basic',
    aliases: ['Layout', 'Layout Thrashing'],
    definition:
      'Perhitungan ulang posisi dan ukuran elemen — langkah render paling mahal. Membaca property layout (`offsetWidth`, `getBoundingClientRect`) di sela penulisan memaksanya berulang kali; obatnya baca semua dulu, baru tulis semua.',
    lesson: 'frontend-basic/manipulasi-dom/performa-dom',
  },
  {
    term: 'Koleksi Hidup',
    category: 'frontend-basic',
    aliases: ['Live Collection', 'HTMLCollection'],
    definition:
      'Kumpulan yang ikut berubah otomatis saat DOM berubah, hasil `getElementsBy*`. Berbahaya di dalam loop yang menghapus elemen — indeksnya bergeser. `querySelectorAll` menghasilkan koleksi statis yang aman.',
    lesson: 'frontend-basic/manipulasi-dom/seleksi-elemen',
  },
  {
    term: 'Atribut vs Property',
    category: 'frontend-basic',
    definition:
      'Atribut adalah yang tertulis di HTML (keadaan awal, selalu teks); property adalah yang ada di objek DOM (keadaan sekarang). Untuk `value`, `checked`, dan `selected` keduanya berhenti saling mencerminkan setelah pengguna berinteraksi.',
    lesson: 'frontend-basic/manipulasi-dom/atribut-property-dataset',
  },
  {
    term: 'DocumentFragment',
    category: 'frontend-basic',
    definition:
      'Wadah sementara di luar pohon DOM untuk merakit banyak elemen sebelum disisipkan sekaligus, sehingga hanya memicu satu kali perhitungan ulang alih-alih sekali per elemen.',
    lesson: 'frontend-basic/manipulasi-dom/membuat-menghapus-node',
  },
  {
    term: 'Bubbling & Capturing',
    category: 'frontend-basic',
    definition:
      'Perjalanan event: turun dari `document` ke elemen sasaran (capturing), tiba (target), lalu naik kembali (bubbling). Listener berjalan pada fase bubbling secara bawaan.',
    lesson: 'frontend-basic/manipulasi-dom/bubbling-delegation',
  },
  {
    term: 'IntersectionObserver',
    category: 'frontend-basic',
    aliases: ['Observer API'],
    definition:
      'Pengamat yang memberi tahu saat elemen masuk atau keluar layar, menggantikan listener `scroll` yang berjalan ratusan kali per detik dan memaksa pembacaan layout.',
    lesson: 'frontend-basic/manipulasi-dom/observer-api',
  },
  {
    term: 'Constraint Validation',
    category: 'frontend-basic',
    definition:
      'Validasi bawaan HTML lewat `required`, `type`, `pattern`, dan `minlength` — pesannya otomatis mengikuti bahasa perangkat. Tetap hanya UX: kontrol keamanannya wajib ada di server.',
    lesson: 'frontend-basic/manipulasi-dom/form-input',
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
    term: 'Preflight',
    category: 'frontend-basic',
    definition:
      'Permintaan `OPTIONS` yang dikirim browser lebih dulu untuk bertanya apakah permintaan sebenarnya diizinkan. Terpicu oleh method selain GET/POST/HEAD atau header tidak baku seperti `Authorization`.',
    lesson: 'frontend-basic/ajax-web-api/cors',
  },
  {
    term: 'Same-origin Policy',
    category: 'frontend-basic',
    aliases: ['Origin'],
    definition:
      'Aturan browser yang melarang halaman membaca jawaban dari origin lain. Origin = protokol + host + port, sehingga subdomain pun dihitung berbeda. Inilah yang memblokir — CORS adalah cara server memberi pengecualian.',
    lesson: 'frontend-basic/ajax-web-api/cors',
  },
  {
    term: 'Idempoten',
    category: 'frontend-basic',
    aliases: ['Safe Method'],
    definition:
      'Operasi yang hasil akhirnya sama meski dijalankan berkali-kali. `GET`, `PUT`, dan `DELETE` idempoten; `POST` tidak. Ini yang menentukan boleh-tidaknya sebuah permintaan diulang otomatis saat gagal.',
    lesson: 'frontend-basic/ajax-web-api/http-dasar',
  },
  {
    term: 'Bearer Token',
    category: 'frontend-basic',
    definition:
      'Token yang dikirim di header `Authorization`. Namanya menjelaskan risikonya: siapa pun yang membawanya diperlakukan sebagai pemiliknya. Rentan XSS — berbeda dari cookie `HttpOnly` yang rentan CSRF.',
    lesson: 'frontend-basic/ajax-web-api/auth-klien',
  },
  {
    term: 'HttpOnly',
    category: 'frontend-basic',
    aliases: ['SameSite', 'Secure'],
    definition:
      'Penanda cookie yang membuatnya tidak bisa dibaca JavaScript sama sekali, sehingga celah XSS tidak bisa mencurinya. Dipasangkan dengan `Secure` (hanya HTTPS) dan `SameSite` (pertahanan CSRF).',
    lesson: 'frontend-basic/ajax-web-api/auth-klien',
  },
  {
    term: 'Secure Context',
    category: 'frontend-basic',
    definition:
      'Syarat bahwa halaman dimuat lewat HTTPS atau `localhost`. Banyak API modern — Clipboard, Geolocation, Notification — menolak bekerja di luar itu.',
    lesson: 'frontend-basic/ajax-web-api/web-api-lain',
  },
  {
    term: 'Server-Sent Events',
    category: 'frontend-basic',
    aliases: ['SSE', 'EventSource'],
    definition:
      'Aliran satu arah dari server ke klien lewat HTTP biasa, dengan penyambungan ulang otomatis. Lebih sederhana daripada WebSocket, dan cukup untuk sebagian besar kebutuhan realtime.',
    lesson: 'frontend-basic/ajax-web-api/realtime',
  },
  {
    term: 'Empat Keadaan UI',
    category: 'frontend-basic',
    definition:
      'Setiap tampilan yang mengambil data punya empat keadaan — memuat, kosong, gagal, berhasil. Melewatkan tiga di antaranya adalah cacat yang paling sering sampai produksi.',
    lesson: 'frontend-basic/ajax-web-api/praktik-konsumsi-api',
  },
  {
    term: 'JSX',
    category: 'frontend-basic',
    definition:
      'Sintaks mirip HTML di dalam JavaScript yang dikompilasi menjadi pemanggilan fungsi biasa. Bukan HTML, bukan template engine.',
    lesson: 'frontend-basic/jsx-dan-tsx/kenapa-jsx',
  },
  {
    term: 'Deklaratif vs Imperatif',
    category: 'frontend-basic',
    definition:
      'Imperatif menuliskan langkah demi langkah cara mencapai hasil (gaya DOM manual); deklaratif menggambarkan hasil yang diinginkan dan membiarkan sistem menentukan langkahnya (gaya JSX).',
    lesson: 'frontend-basic/jsx-dan-tsx/kenapa-jsx',
  },
  {
    term: 'Virtual DOM',
    category: 'frontend-basic',
    definition:
      'Gambaran ringan struktur tampilan sebagai object biasa. React membandingkan gambaran baru dengan lama, lalu hanya menyentuh bagian DOM yang benar-benar berubah.',
    lesson: 'frontend-basic/jsx-dan-tsx/kenapa-jsx',
  },
  {
    term: 'Jebakan Angka Nol',
    category: 'frontend-basic',
    definition:
      '`{items.length && <Daftar />}` menampilkan angka `0` saat daftar kosong, karena `0` falsy tapi tetap dirender — berbeda dari `false` yang diabaikan. Pakai `length > 0 &&`.',
    lesson: 'frontend-basic/jsx-dan-tsx/ekspresi-di-jsx',
  },
  {
    term: 'React Element',
    category: 'frontend-basic',
    aliases: ['createElement', 'jsx-runtime'],
    definition:
      'Hasil kompilasi JSX: object JavaScript biasa berisi `type`, `props`, dan `key`. Bukan elemen DOM, dan belum menyentuh layar sama sekali.',
    lesson: 'frontend-basic/jsx-dan-tsx/kompilasi-jsx',
  },
  {
    term: 'Inferensi Tipe',
    category: 'frontend-basic',
    aliases: ['Type Inference'],
    definition:
      'Kemampuan TypeScript menyimpulkan tipe dari nilainya sendiri, sehingga sebagian besar anotasi tidak perlu ditulis. Ini yang membuat TypeScript jauh tidak seberat kelihatannya.',
    lesson: 'frontend-basic/jsx-dan-tsx/typescript-sekilas',
  },
  {
    term: 'Discriminated Union',
    category: 'frontend-basic',
    definition:
      'Union yang tiap anggotanya punya property penanda bernilai tetap. Membuat kombinasi props yang mustahil menjadi tidak bisa ditulis, sekaligus menghapus ledakan boolean prop.',
    lesson: 'frontend-basic/jsx-dan-tsx/generic-component',
  },
  {
    term: 'ReactNode',
    category: 'frontend-basic',
    definition:
      'Tipe untuk apa pun yang bisa dirender React — teks, angka, elemen, array, `null`. Tipe yang hampir selalu benar untuk `children`.',
    lesson: 'frontend-basic/jsx-dan-tsx/tipe-props-children',
  },
  {
    term: 'Type Assertion',
    category: 'frontend-basic',
    aliases: ['as'],
    definition:
      '`nilai as Tipe` berarti "percaya saja" — bukan konversi dan bukan pemeriksaan. Data dari jaringan tetap wajib divalidasi saat berjalan, karena tipe sudah dihapus di titik itu.',
    lesson: 'frontend-basic/jsx-dan-tsx/kapan-tsx',
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
    term: 'Utility Class',
    category: 'frontend-intermediate',
    definition:
      'Class CSS yang mengerjakan satu hal dan namanya menyebutkan hal itu — `p-4`, `flex`, `text-sm`. Artinya tidak pernah berubah di mana pun ia dipakai, sehingga mengubahnya tidak bisa merusak apa pun di tempat lain.',
    lesson: 'frontend-intermediate/tailwind-css/filosofi-utility-first',
  },
  {
    term: '@theme',
    category: 'frontend-intermediate',
    aliases: ['CSS-first'],
    definition:
      'Arahan Tailwind v4 untuk mendefinisikan design token di dalam CSS. Tiap token otomatis menghasilkan utility class, dan nilainya benar-benar menjadi CSS variable asli.',
    lesson: 'frontend-intermediate/tailwind-css/design-token-theme',
  },
  {
    term: 'group & peer',
    category: 'frontend-intermediate',
    definition:
      'Penanda Tailwind agar anak bereaksi pada state induk (`group`) atau pada saudara sebelumnya (`peer`). `peer` hanya bekerja untuk elemen sesudahnya — CSS tidak bisa memilih ke belakang.',
    lesson: 'frontend-intermediate/tailwind-css/variant-status',
  },
  {
    term: 'Mobile-first',
    category: 'frontend-intermediate',
    definition:
      'Class tanpa awalan berlaku untuk semua ukuran; `md:` berarti "mulai dari sedang ke atas". Mobile-first menambah kemampuan saat ruang tersedia, sementara desktop-first membatalkannya.',
    lesson: 'frontend-intermediate/tailwind-css/responsif',
  },
  {
    term: 'UI = f(state)',
    category: 'frontend-intermediate',
    definition:
      'Rumus yang merangkum React: tampilan adalah hasil perhitungan dari keadaan. Kamu menulis "kalau keadaannya begini, tampilannya begini" — bukan memerintahkan perubahan satu per satu.',
    lesson: 'frontend-intermediate/fundamental-reactjs/kenapa-react',
  },
  {
    term: 'Render & Commit',
    category: 'frontend-intermediate',
    definition:
      'Dua tahap React: **render** memanggil fungsi komponen untuk mendapat gambaran terbaru, **commit** menerapkannya ke DOM. Render ulang tidak selalu berarti DOM ikut berubah.',
    lesson: 'frontend-intermediate/fundamental-reactjs/komponen-pertama',
  },
  {
    term: 'Prop Drilling',
    category: 'frontend-intermediate',
    definition:
      'Data yang dioper melewati banyak lapisan yang tidak memakainya. Sering selesai dengan composition — oper komponennya, bukan datanya — tanpa perlu Context.',
    lesson: 'frontend-intermediate/fundamental-reactjs/composition-children',
  },
  {
    term: 'React Compiler',
    category: 'frontend-intermediate',
    aliases: ['Memoization'],
    definition:
      'Alat React 19 yang menganalisis komponen saat build lalu menyisipkan memoisasi otomatis, sehingga `useMemo` dan `useCallback` manual jauh berkurang. Ia melewati komponen yang melanggar Rules of React.',
    lesson: 'frontend-intermediate/fundamental-reactjs/react-compiler',
  },
  {
    term: 'Reconciliation',
    category: 'frontend-intermediate',
    definition:
      'Proses React membandingkan pohon elemen baru dengan yang lama untuk menentukan perubahan minimum di DOM.',
    lesson: 'frontend-intermediate/fundamental-reactjs/virtual-dom',
  },
  {
    term: 'API Komponen',
    category: 'frontend-intermediate',
    aliases: ['API Surface'],
    definition:
      'Daftar props sebuah komponen — janji kepada siapa pun yang memakainya. Mengubahnya merusak semua pemakai yang sudah ada, jadi merancangnya sadar sejak awal jauh lebih murah daripada memperbaikinya belakangan.',
    lesson: 'frontend-intermediate/pembuatan-komponen-react/anatomi-komponen',
  },
  {
    term: 'Focus Trap',
    category: 'frontend-intermediate',
    definition:
      'Menahan Tab agar tidak keluar dari dialog selama terbuka. Tanpa itu pengguna keyboard tersesat di halaman belakang — masih bisa mengklik tombol yang seharusnya tidak terjangkau.',
    lesson: 'frontend-intermediate/pembuatan-komponen-react/studi-dialog',
  },
  {
    term: 'Roving Tabindex',
    category: 'frontend-intermediate',
    definition:
      'Hanya satu item dalam kelompok yang bisa dijangkau Tab; sisanya `-1` dan diakses lewat tombol panah. Mencegah daftar sepuluh tab memaksa sepuluh tekanan Tab untuk melewatinya.',
    lesson: 'frontend-intermediate/pembuatan-komponen-react/studi-tabs',
  },
  {
    term: 'Snapshot State',
    category: 'frontend-intermediate',
    aliases: ['Stale Closure'],
    definition:
      'Nilai state di dalam satu render tidak pernah berubah — ia potret, bukan variabel hidup. Inilah kenapa `setJumlah(jumlah + 1)` tiga kali hanya menambah satu.',
    lesson: 'frontend-intermediate/state-dan-event-handler/state-snapshot',
  },
  {
    term: 'Updater Function',
    category: 'frontend-intermediate',
    aliases: ['Batching'],
    definition:
      'Bentuk `setJumlah(n => n + 1)` yang membaca nilai terbaru dari antrean, bukan dari potret render. Wajib saat beberapa pembaruan berurutan atau saat memperbarui di kode asinkron.',
    lesson: 'frontend-intermediate/state-dan-event-handler/batching-updater',
  },
  {
    term: 'State Turunan',
    category: 'frontend-intermediate',
    aliases: ['Derived State'],
    definition:
      'Nilai yang bisa dihitung dari state lain — jangan disimpan. Menyimpannya menciptakan dua sumber yang pasti berselisih, dan bugnya muncul jauh dari penyebabnya.',
    lesson: 'frontend-intermediate/state-dan-event-handler/derived-state',
  },
  {
    term: 'Reducer',
    category: 'frontend-intermediate',
    aliases: ['useReducer', 'Action', 'Dispatch'],
    definition:
      'Fungsi murni `(state, action) => stateBaru` yang memisahkan apa yang terjadi dari bagaimana state berubah. Dipakai saat beberapa nilai berubah bersama atau transisinya punya aturan.',
    lesson: 'frontend-intermediate/state-dan-event-handler/usereducer',
  },
  {
    term: 'Controlled vs Uncontrolled',
    category: 'frontend-intermediate',
    definition:
      'Controlled: React memegang nilai input lewat `value`, render tiap ketikan. Uncontrolled: DOM yang memegang, dibaca saat dibutuhkan. Mencampur keduanya berarti dua sumber yang pasti berselisih.',
    lesson: 'frontend-intermediate/state-dan-event-handler/controlled-uncontrolled',
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
    term: 'Client State',
    category: 'frontend-intermediate',
    definition:
      'Data yang dimiliki browser dan tidak punya versi "benar" di tempat lain — tema, sidebar terbuka, isi keranjang. Tidak perlu disinkronkan dengan siapa pun.',
    lesson: 'frontend-intermediate/state-management/peta-kategori-state',
  },
  {
    term: 'URL State',
    category: 'frontend-intermediate',
    definition:
      'State yang disimpan di query string — filter, urutan, halaman, kata kunci. Ujinya: kalau alamatnya disalin dan dikirim, penerimanya harus melihat hal yang sama.',
    lesson: 'frontend-intermediate/state-management/url-state',
  },
  {
    term: 'Selector',
    category: 'frontend-intermediate',
    definition:
      'Fungsi yang memilih sepotong state dari sebuah store, sehingga komponen hanya dirender ulang saat potongan itu berubah. Context tidak punya ini.',
    lesson: 'frontend-intermediate/state-management/zustand',
  },
  {
    term: 'Query Key',
    category: 'frontend-intermediate',
    definition:
      'Array yang menjadi identitas satu entri cache di TanStack Query. Aturannya: kalau sebuah nilai dipakai di `queryFn`, ia harus ada di `queryKey`.',
    lesson: 'frontend-intermediate/state-management/tanstack-query',
  },
  {
    term: 'staleTime vs gcTime',
    category: 'frontend-intermediate',
    definition:
      '`staleTime` mengatur kapan data dianggap basi sehingga perlu diambil ulang; `gcTime` mengatur kapan entri cache dibuang dari memori. Dua hal berbeda yang sering tertukar.',
    lesson: 'frontend-intermediate/state-management/tanstack-query',
  },
  {
    term: 'Optimistic Update',
    category: 'frontend-intermediate',
    definition:
      'Mengubah tampilan seolah operasinya sudah berhasil sebelum server menjawab, lalu membatalkannya kalau gagal. Cocok hanya jika kegagalannya jarang, murah, dan bisa ditarik.',
    lesson: 'frontend-intermediate/state-management/optimistic-update',
  },
  {
    term: 'Slice',
    category: 'frontend-intermediate',
    definition:
      'Satu potongan state Redux beserta reducer, action, dan tipenya dalam satu berkas. `createSlice` menghasilkan ketiganya sekaligus.',
    lesson: 'frontend-intermediate/state-management/redux-toolkit',
  },
  {
    term: 'Immer',
    category: 'frontend-intermediate',
    definition:
      'Library yang membuat `state.push()` boleh ditulis di dalam reducer Redux Toolkit. Yang diubah sebenarnya objek draft; hasilnya tetap objek baru yang immutable.',
    lesson: 'frontend-intermediate/state-management/redux-toolkit',
  },
  {
    term: 'Atom',
    category: 'frontend-intermediate',
    definition:
      'Potongan state terkecil pada Jotai. Sebuah atom bisa berisi nilai biasa, atau berisi rumus yang membaca atom lain — itulah derived atom.',
    lesson: 'frontend-intermediate/state-management/jotai',
  },
  {
    term: 'Rules of Hooks',
    category: 'frontend-intermediate',
    definition:
      'Dua aturan: hook hanya dipanggil di level teratas komponen, dan hanya dari komponen atau hook lain. Keduanya konsekuensi dari React mencocokkan state berdasarkan urutan pemanggilan.',
    lesson: 'frontend-intermediate/react-hooks/aturan-hooks',
  },
  {
    term: 'Lazy Initializer',
    category: 'frontend-intermediate',
    definition:
      'Bentuk `useState(() => hitung())` yang membuat perhitungan awal hanya dijalankan sekali saat inisialisasi, bukan di setiap render.',
    lesson: 'frontend-intermediate/react-hooks/usestate-mendalam',
  },
  {
    term: 'Effect',
    category: 'frontend-intermediate',
    aliases: ['useEffect'],
    definition:
      'Blok kode yang menyinkronkan komponen dengan sistem di luar React. Bukan lifecycle: kalimat ujinya "selaraskan ___ dengan ___", dan tanpa sistem luar biasanya Effect tidak dibutuhkan.',
    lesson: 'frontend-intermediate/react-hooks/useeffect-sinkronisasi',
  },
  {
    term: 'Cleanup',
    category: 'frontend-intermediate',
    definition:
      'Fungsi yang dikembalikan dari dalam Effect untuk membatalkan sinkronisasi sebelumnya. Ia berjalan setiap kali Effect dijalankan ulang, bukan hanya saat komponen hilang.',
    lesson: 'frontend-intermediate/react-hooks/dependency-cleanup',
  },
  {
    term: 'Dependency Array',
    category: 'frontend-intermediate',
    definition:
      'Array kedua pada `useEffect` berisi nilai yang Effect itu selaraskan. Dibandingkan dengan `Object.is`, sehingga objek dan fungsi yang dibuat ulang tiap render selalu dianggap berubah.',
    lesson: 'frontend-intermediate/react-hooks/dependency-cleanup',
  },
  {
    term: 'Layout Effect',
    category: 'frontend-intermediate',
    aliases: ['useLayoutEffect'],
    definition:
      'Effect yang berjalan setelah DOM diperbarui tapi sebelum browser menggambar layar. Dipakai saat mengukur lalu memposisikan, agar pengguna tidak melihat kedipan.',
    lesson: 'frontend-intermediate/react-hooks/uselayouteffect',
  },
  {
    term: 'Ref',
    category: 'frontend-intermediate',
    definition:
      'Kotak `.current` yang bertahan antar render tanpa memicu render saat isinya berubah. Dua kegunaannya: memegang elemen DOM, dan menyimpan nilai yang tidak ditampilkan.',
    lesson: 'frontend-intermediate/react-hooks/useref',
  },
  {
    term: 'Memoisasi',
    category: 'frontend-intermediate',
    definition:
      'Menyimpan hasil perhitungan agar tidak dihitung ulang selama masukannya sama. Dengan React Compiler aktif, memoisasi manual yang tidak perlu justru menjadi error lint.',
    lesson: 'frontend-intermediate/react-hooks/usememo-usecallback',
  },
  {
    term: 'Transisi',
    category: 'frontend-intermediate',
    aliases: ['Transition'],
    definition:
      'Pembaruan yang ditandai tidak mendesak, sehingga React boleh menundanya demi yang mendesak. Konten lama tetap terlihat sampai yang baru siap, bukan dikosongkan lebih dulu.',
    lesson: 'frontend-intermediate/react-hooks/usetransition-usedeferred',
  },
  {
    term: 'Store Eksternal',
    category: 'frontend-intermediate',
    definition:
      'Sumber data di luar pohon komponen React — `localStorage`, `matchMedia`, atau store buatan library. Disambungkan lewat `useSyncExternalStore`, yang menuntut snapshot stabil.',
    lesson: 'frontend-intermediate/react-hooks/hook-lain',
  },
  {
    term: 'Custom Hook',
    category: 'frontend-intermediate',
    definition:
      'Fungsi buatan sendiri berawalan `use` yang memanggil hook lain. Awalannya bukan gaya penamaan — itu yang membuat linter menegakkan aturan hooks di dalamnya.',
    lesson: 'frontend-intermediate/react-hooks/custom-hook',
  },
  {
    term: 'Presentational vs Container',
    category: 'frontend-intermediate',
    definition:
      'Pemisahan klasik antara komponen penampil dan komponen pengambil data. Bukan lagi anjuran umum: hooks memisahkan logika dari tampilan tanpa memaksa membuat komponen kedua.',
    lesson: 'frontend-intermediate/jenis-komponen-react/presentational-container',
  },
  {
    term: '"use client"',
    category: 'frontend-intermediate',
    definition:
      'Penanda **batas**, bukan penanda "berjalan di browser". Semua modul yang diimpor dari file bertanda ini ikut ke bundle klien, sedalam apa pun rantainya.',
    lesson: 'frontend-intermediate/jenis-komponen-react/use-client-boundary',
  },
  {
    term: 'Serialisasi Props',
    category: 'frontend-intermediate',
    definition:
      'Props dari Server ke Client Component melewati jaringan, jadi isinya terbatas pada nilai yang bisa diubah menjadi format serial. Fungsi, class instance, dan `Symbol` tidak bisa.',
    lesson: 'frontend-intermediate/jenis-komponen-react/server-vs-client-component',
  },
  {
    term: 'Render Props',
    category: 'frontend-intermediate',
    definition:
      'Komponen menerima fungsi yang mengembalikan JSX: ia menyediakan datanya, pemanggil memutuskan bentuknya. Masih unggul saat komponennya juga merender struktur, bukan sekadar menghitung nilai.',
    lesson: 'frontend-intermediate/jenis-komponen-react/render-props',
  },
  {
    term: 'Higher-Order Component',
    category: 'frontend-intermediate',
    aliases: ['HOC'],
    definition:
      'Fungsi yang menerima komponen dan mengembalikan komponen terbungkus, biasanya bernama `withSesuatu`. Pola lama — dikenali saat membaca kode warisan, digantikan custom hook untuk kode baru.',
    lesson: 'frontend-intermediate/jenis-komponen-react/hoc',
  },
  {
    term: 'Polymorphic Component',
    category: 'frontend-intermediate',
    definition:
      'Komponen yang elemen keluarannya ditentukan pemanggil lewat prop `as`. Ia mengubah semantik, bukan cuma tampilan — jadi yang bisa diklik tetap wajib `<button>` atau `<a>`.',
    lesson: 'frontend-intermediate/jenis-komponen-react/polymorphic-component',
  },
  {
    term: 'Error Boundary',
    category: 'frontend-intermediate',
    definition:
      'Komponen yang menangkap error saat render dari pohon di bawahnya. Sampai kini hanya bisa ditulis sebagai class — satu-satunya alasan tersisa untuk menulis class di React modern.',
    lesson: 'frontend-intermediate/jenis-komponen-react/error-suspense-boundary',
  },
  {
    term: 'Suspense',
    category: 'frontend-intermediate',
    definition:
      'Batas yang menampilkan `fallback` selama anak-anaknya belum siap. Ia hanya bekerja kalau penantiannya terjadi **di dalamnya**, bukan sudah di-`await` di induknya.',
    lesson: 'frontend-intermediate/nextjs/loading-streaming',
  },
  {
    term: 'Portal',
    category: 'frontend-intermediate',
    definition:
      'Merender anak ke node DOM di luar hierarki induknya, tapi tetap di posisi yang sama pada pohon React — jadi event, context, dan Error Boundary tetap mengalir seperti biasa.',
    lesson: 'frontend-intermediate/jenis-komponen-react/portal-layering',
  },
  {
    term: 'Containing Block',
    category: 'frontend-intermediate',
    definition:
      'Kotak acuan posisi sebuah elemen. `transform` dan `filter` pada induk membuat containing block baru, sehingga `position: fixed` berhenti mengacu ke viewport.',
    lesson: 'frontend-intermediate/jenis-komponen-react/portal-layering',
  },
  {
    term: 'App Router',
    category: 'frontend-intermediate',
    definition:
      'Sistem routing Next.js berbasis folder `app/`: struktur folder adalah routing. Nama folder menjadi URL, nama berkas menentukan perannya.',
    lesson: 'frontend-intermediate/nextjs/struktur-app-router',
  },
  {
    term: 'Route Group',
    category: 'frontend-intermediate',
    definition:
      'Folder bertanda kurung seperti `(pemasaran)` yang tidak muncul di URL. Dipakai memberi dua kelompok halaman layout berbeda tanpa prefiks alamat yang tidak berarti.',
    lesson: 'frontend-intermediate/nextjs/struktur-app-router',
  },
  {
    term: 'generateStaticParams',
    category: 'frontend-intermediate',
    definition:
      'Memberi tahu Next.js semua kombinasi `params` yang harus dibuat saat build. Inilah yang mengubah satu berkas rute menjadi ratusan halaman statis.',
    lesson: 'frontend-intermediate/nextjs/routing-lanjutan',
  },
  {
    term: 'Parallel Route',
    category: 'frontend-intermediate',
    definition:
      'Folder berawalan `@` yang menjadi prop pada layout. Manfaat sebenarnya bukan tata letak: setiap slot punya batas loading dan error sendiri.',
    lesson: 'frontend-intermediate/nextjs/routing-lanjutan',
  },
  {
    term: 'Intercepting Route',
    category: 'frontend-intermediate',
    definition:
      'Rute yang mencegat navigasi dan menampilkannya dengan cara berbeda — modal saat diklik dari daftar, halaman penuh saat alamatnya dibuka langsung.',
    lesson: 'frontend-intermediate/nextjs/routing-lanjutan',
  },
  {
    term: 'Waterfall',
    category: 'frontend-intermediate',
    definition:
      'Permintaan yang berangkat berurutan padahal tidak saling membutuhkan, sehingga totalnya menjadi jumlah semuanya. Obatnya `Promise.all`.',
    lesson: 'frontend-intermediate/nextjs/server-component-fetching',
  },
  {
    term: 'ISR',
    category: 'frontend-intermediate',
    definition:
      'Incremental Static Regeneration — halaman statis yang dibuat ulang di latar belakang setelah masa berlakunya lewat. Titik tengah antara SSG dan SSR.',
    lesson: 'frontend-intermediate/nextjs/rendering-caching',
  },
  {
    term: 'Cache Tag',
    category: 'frontend-intermediate',
    definition:
      'Label pada sebuah `fetch` yang membuat `revalidateTag` bisa menandai semua pemakaiannya sebagai basi sekaligus — tanpa perlu tahu di halaman mana saja ia dipakai.',
    lesson: 'frontend-intermediate/nextjs/rendering-caching',
  },
  {
    term: 'Server Action',
    category: 'frontend-intermediate',
    definition:
      'Fungsi server yang bisa dipanggil langsung dari komponen. Ia **endpoint publik**: wajib memvalidasi input dan memeriksa otorisasinya sendiri, persis seperti route handler.',
    lesson: 'frontend-intermediate/nextjs/server-action',
  },
  {
    term: 'Route Handler',
    category: 'frontend-intermediate',
    definition:
      'Berkas `route.ts` yang mengekspor fungsi bernama metode HTTP-nya. Dipakai untuk API publik dan webhook — URL-nya bagian dari kontrak yang kamu janjikan.',
    lesson: 'frontend-intermediate/nextjs/route-handler',
  },
  {
    term: 'Mass Assignment',
    category: 'frontend-intermediate',
    definition:
      'Menyebar body permintaan langsung ke query (`data: { ...isi }`), sehingga klien bisa mengirim `{ peran: "admin" }` dan tersimpan. Ambil field satu per satu dari hasil validasi.',
    lesson: 'frontend-intermediate/nextjs/route-handler',
  },
  {
    term: 'Open Graph',
    category: 'frontend-intermediate',
    definition:
      'Standar tag yang dipakai WhatsApp, Slack, dan LinkedIn untuk membuat pratinjau tautan. Perayapnya membaca HTML, bukan hasil render JavaScript.',
    lesson: 'frontend-intermediate/nextjs/metadata-seo',
  },
  {
    term: 'Streaming',
    category: 'frontend-intermediate',
    definition:
      'Mengirim HTML bertahap: bagian yang siap tampil duluan, yang lambat menyusul. Pengguna melihat kerangka halaman seketika, bukan layar kosong sampai query terlambat selesai.',
    lesson: 'frontend-intermediate/nextjs/loading-streaming',
  },
  {
    term: 'First Load JS',
    category: 'frontend-intermediate',
    definition:
      'Total JavaScript yang harus diunduh sebelum sebuah rute bisa dipakai, tercetak di keluaran `next build`. Lonjakan di satu rute hampir selalu satu impor yang menarik sesuatu besar.',
    lesson: 'frontend-intermediate/nextjs/produksi',
  },
  {
    term: 'NEXT_PUBLIC_',
    category: 'frontend-intermediate',
    definition:
      'Prefiks yang menanam nilai ke bundle browser. Ia berarti **publik tanpa pengecualian** — tidak ada "rahasia yang cuma dipakai memanggil API".',
    lesson: 'frontend-intermediate/nextjs/env-batas-server-klien',
  },
  {
    term: 'server-only',
    category: 'frontend-intermediate',
    definition:
      'Paket yang menggagalkan build kalau sebuah modul terimpor dari komponen klien. Ia mengubah kebocoran yang diam menjadi kegagalan yang terlihat.',
    lesson: 'frontend-intermediate/nextjs/env-batas-server-klien',
  },
  {
    term: 'Idempoten',
    category: 'backend-basic',
    definition:
      'Operasi yang memberi hasil akhir sama meski dijalankan berkali-kali. `PUT` dan `DELETE` idempoten; `POST` biasanya tidak.',
    lesson: 'backend-basic/fondasi-backend/http-mendalam',
  },
  {
    term: 'Stateless',
    category: 'backend-basic',
    definition:
      'HTTP tidak mengingat apa pun antar permintaan. Setiap permintaan harus membawa buktinya sendiri — dan itulah yang membuat server bisa ditambah jumlahnya tanpa ada yang kehilangan sesinya.',
    lesson: 'backend-basic/fondasi-backend/client-server',
  },
  {
    term: 'Masukan Tak Tepercaya',
    category: 'backend-basic',
    definition:
      'Semua yang datang dari klien — body, query, header, cookie. Bukan sebagian: siapa pun bisa memakai `curl`, jadi validasi di browser adalah kenyamanan, bukan kontrol keamanan.',
    lesson: 'backend-basic/fondasi-backend/client-server',
  },
  {
    term: 'Aman vs Idempoten',
    category: 'backend-basic',
    definition:
      '**Aman** berarti tidak mengubah apa pun (`GET`). **Idempoten** berarti hasil akhirnya sama meski diulang (`DELETE`). Sering dikira sama — `DELETE` idempoten tapi jelas tidak aman.',
    lesson: 'backend-basic/fondasi-backend/http-mendalam',
  },
  {
    term: '401 vs 403',
    category: 'backend-basic',
    definition:
      '`401` berarti "aku tidak tahu kamu siapa" — soal autentikasi. `403` berarti "aku tahu, dan kamu tidak boleh". Untuk data privat, `404` sering lebih aman daripada keduanya.',
    lesson: 'backend-basic/fondasi-backend/http-mendalam',
  },
  {
    term: 'REST',
    category: 'backend-basic',
    definition:
      'Gaya arsitektur, bukan protokol. Intinya: kata benda di URL, kata kerja di method HTTP — sehingga perilaku endpoint bisa ditebak tanpa dokumentasi.',
    lesson: 'backend-basic/fondasi-backend/rest',
  },
  {
    term: '12-Factor App',
    category: 'backend-basic',
    definition:
      'Dua belas prinsip aplikasi yang mudah di-deploy. Tiga yang paling menentukan: config di environment, proses stateless, dan log ke stdout.',
    lesson: 'backend-basic/fondasi-backend/environment-12factor',
  },
  {
    term: 'Log Terstruktur',
    category: 'backend-basic',
    definition:
      'Log berupa JSON dengan field bernama, bukan kalimat bebas. Bedanya praktis: ia bisa disaring dan dicari, sementara kalimat bebas hanya bisa dibaca satu per satu.',
    lesson: 'backend-basic/nodejs-express-basic/logging',
  },
  {
    term: 'Constraint',
    category: 'backend-basic',
    definition:
      'Aturan yang ditegakkan database sendiri — `NOT NULL`, `UNIQUE`, `FOREIGN KEY`, `CHECK`. Berbeda dari validasi di kode: ia tidak bisa dilewati jalur penulisan mana pun.',
    lesson: 'backend-basic/database-sql-dasar/konsep-tabel',
  },
  {
    term: 'Index',
    category: 'backend-basic',
    definition:
      'Struktur yang membuat baris bisa ditemukan tanpa memindai seluruh tabel. Tidak gratis: setiap index memperlambat tulis. PostgreSQL tidak membuatnya otomatis untuk foreign key.',
    lesson: 'backend-basic/database-sql-dasar/key-index',
  },
  {
    term: 'EXPLAIN ANALYZE',
    category: 'backend-basic',
    definition:
      'Menampilkan rencana eksekusi yang benar-benar dijalankan beserta waktunya. `Seq Scan` pada tabel besar berarti index tidak dipakai.',
    lesson: 'backend-basic/database-sql-dasar/key-index',
  },
  {
    term: 'Paginasi Keyset',
    category: 'backend-basic',
    definition:
      'Paginasi memakai nilai baris terakhir sebagai penanda, bukan `OFFSET`. Kecepatannya tetap di halaman mana pun, dan hasilnya tidak bergeser saat ada data baru.',
    lesson: 'backend-basic/database-sql-dasar/select-dasar',
  },
  {
    term: 'Prepared Statement',
    category: 'backend-basic',
    definition:
      'Mengirim perintah dan nilainya terpisah ke database. Strukturnya tidak bisa lagi berubah — ini bukan penyaringan karakter, melainkan penutupan celahnya.',
    lesson: 'backend-basic/database-sql-dasar/sql-injection',
  },
  {
    term: 'Normalisasi',
    category: 'backend-basic',
    definition:
      'Menyusun tabel supaya satu fakta hanya tersimpan di satu tempat. Tujuannya menghilangkan anomali update, insert, dan delete.',
    lesson: 'backend-basic/database-sql-dasar/normalisasi',
  },
  {
    term: 'Tabel Pivot',
    category: 'backend-basic',
    definition:
      'Tabel ketiga yang mewujudkan relasi N-N, berisi hanya pasangan id kedua sisi. Begitu ia menyimpan data lain, ia sudah menjadi entitas tersendiri.',
    lesson: 'backend-basic/database-sql-dasar/relasi',
  },
  {
    term: 'Event Loop',
    category: 'backend-basic',
    definition:
      'Putaran yang menjalankan callback saat call stack kosong. Node satu utas: satu perhitungan berat memblokir **semua** pengguna, bukan hanya pemicunya.',
    lesson: 'backend-basic/nodejs-express-basic/nodejs-runtime',
  },
  {
    term: 'ESM vs CommonJS',
    category: 'backend-basic',
    definition:
      'Dua sistem modul Node. ESM (`import`) untuk kode baru; CommonJS (`require`) di kode lama. Di ESM, ekstensi berkas wajib ditulis — Node tidak menebaknya seperti bundler.',
    lesson: 'backend-basic/nodejs-express-basic/modul-node',
  },
  {
    term: 'Graceful Shutdown',
    category: 'backend-basic',
    definition:
      'Menutup server dengan menyelesaikan permintaan yang sedang berjalan. Tanpanya, setiap deploy memutus permintaan di tengah jalan — termasuk yang sedang menulis ke database.',
    lesson: 'backend-basic/nodejs-express-basic/express-setup',
  },
  {
    term: 'Kebocoran Lapisan',
    category: 'backend-basic',
    definition:
      'Ketika satu lapisan menyentuh urusan lapisan lain — misalnya service yang memanggil `res.status()`. Begitu terjadi, logikanya tidak bisa lagi dipakai dari CLI, job, maupun tes.',
    lesson: 'backend-basic/nodejs-express-basic/struktur-folder',
  },
  {
    term: 'Trust Proxy',
    category: 'backend-basic',
    definition:
      'Setelan yang menentukan seberapa jauh header `X-Forwarded-*` dipercaya. Beri angka, jangan `true` — `true` membuat klien bisa memalsukan IP-nya dan melewati rate limit.',
    lesson: 'backend-basic/nodejs-express-basic/praktik-crud-express',
  },
  {
    term: 'Service Container',
    category: 'backend-basic',
    definition:
      'Tempat Laravel menyimpan cara membuat objek. Kelas cukup menyebutkan tipe yang ia butuhkan di konstruktor — container yang menyediakannya, dan tes bisa menggantinya.',
    lesson: 'backend-basic/php-laravel-basic/siklus-request-laravel',
  },
  {
    term: 'Route Model Binding',
    category: 'backend-basic',
    definition:
      'Laravel mengambil model dari database berdasarkan parameter rute dan otomatis 404. Ia mengambil datanya, **tidak** memeriksa kewenangannya — itu tetap tugasmu.',
    lesson: 'backend-basic/php-laravel-basic/routing-laravel',
  },
  {
    term: 'Eloquent',
    category: 'backend-basic',
    definition:
      'ORM Laravel dengan pola Active Record — model sendiri yang tahu cara menyimpan dirinya. Ia menyembunyikan query, tapi tidak pernah menyembunyikan biayanya.',
    lesson: 'backend-basic/php-laravel-basic/eloquent-dasar',
  },
  {
    term: 'Eager Loading',
    category: 'backend-basic',
    definition:
      'Mengambil relasi di depan dengan `with()`, sehingga jumlah query tetap dua berapa pun barisnya. Obat langsung untuk N+1.',
    lesson: 'backend-basic/php-laravel-basic/relasi-eloquent',
  },
  {
    term: 'Form Request',
    category: 'backend-basic',
    definition:
      'Kelas Laravel yang memuat aturan validasi **dan** otorisasi untuk satu jenis permintaan. `validated()` hanya mengembalikan field yang punya aturan — itulah perlindungan mass assignment-nya.',
    lesson: 'backend-basic/php-laravel-basic/form-request',
  },
  {
    term: 'API Resource',
    category: 'backend-basic',
    definition:
      'Kelas yang menentukan bentuk JSON secara eksplisit. Allow-list, bukan blocklist: kolom baru otomatis tersembunyi sampai kamu menyebutnya.',
    lesson: 'backend-basic/php-laravel-basic/api-resource',
  },
  {
    term: 'Autentikasi vs Otorisasi',
    category: 'backend-basic',
    definition:
      '"Siapa kamu" versus "kamu boleh apa". Yang pertama terjadi sekali saat masuk; yang kedua di **setiap** permintaan, untuk **setiap** objek.',
    lesson: 'backend-basic/auth-dasar/auth-vs-authz',
  },
  {
    term: 'Default Deny',
    category: 'backend-basic',
    definition:
      'Menolak semuanya, lalu membuka akses secara eksplisit. Dengan pola sebaliknya, setiap endpoint baru terbuka sampai seseorang ingat mendaftarkannya.',
    lesson: 'backend-basic/auth-dasar/auth-vs-authz',
  },
  {
    term: 'Hashing Adaptif',
    category: 'backend-basic',
    definition:
      'argon2id, bcrypt, atau scrypt — algoritma yang biayanya bisa dinaikkan seiring perangkat keras. Untuk password, **cepat adalah kelemahan**, bukan keunggulan.',
    lesson: 'backend-basic/auth-dasar/hashing-password',
  },
  {
    term: 'Salt',
    category: 'backend-basic',
    definition:
      'Nilai acak unik per password yang ikut di-hash, sehingga dua password identik menghasilkan hash berbeda. Sudah ditangani algoritmanya — jangan membuatnya sendiri.',
    lesson: 'backend-basic/auth-dasar/hashing-password',
  },
  {
    term: 'Session Fixation',
    category: 'backend-basic',
    definition:
      'Penyerang menentukan id sesi korban lebih dulu. Kalau id tidak berubah setelah login, ia kini memegang sesi yang sudah terautentikasi. Regenerasi setelah login menutupnya.',
    lesson: 'backend-basic/auth-dasar/session-cookie',
  },
  {
    term: 'Rotasi Refresh Token',
    category: 'backend-basic',
    definition:
      'Setiap pemakaian mencabut token lama dan menerbitkan yang baru. Nilainya ada pada **deteksi pemakaian ulang**: token yang muncul dua kali berarti dicuri, dan seluruh keluarganya dicabut.',
    lesson: 'backend-basic/auth-dasar/refresh-token',
  },
  {
    term: 'Enumerasi Akun',
    category: 'backend-basic',
    definition:
      'Memetakan email mana yang terdaftar dari beda pesan atau beda waktu respons. Langkah pertama serangan — ditutup dengan pesan identik dan waktu yang seragam.',
    lesson: 'backend-basic/auth-dasar/rate-limit-login',
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
    term: 'IDOR',
    category: 'backend-intermediate',
    aliases: ['Insecure Direct Object Reference'],
    definition:
      'Id sumber daya dipakai langsung dari input pengguna tanpa memeriksa kepemilikan, sehingga menaikkan angka di URL sudah cukup untuk membaca data orang lain.',
    lesson: 'backend-intermediate/keamanan-backend/broken-access-control',
  },
  {
    term: 'Mass Assignment',
    category: 'backend-intermediate',
    definition:
      'Menyalin seluruh isi body permintaan ke objek yang disimpan, sehingga field seperti `peran` atau `status` bisa diselipkan penyerang.',
    lesson: 'backend-intermediate/keamanan-backend/broken-access-control',
  },
  {
    term: 'Credential Stuffing',
    category: 'backend-intermediate',
    definition:
      'Mencoba pasangan email–password yang bocor dari situs lain. Berhasil karena password dipakai ulang, bukan karena sistem ditembus.',
    lesson: 'backend-intermediate/keamanan-backend/auth-failures',
  },
  {
    term: 'Timing Attack',
    category: 'backend-intermediate',
    definition:
      'Menyimpulkan rahasia dari selisih waktu respons. Ditutup dengan perbandingan waktu-konstan dan verifikasi terhadap hash palsu.',
    lesson: 'backend-intermediate/keamanan-backend/auth-failures',
  },
  {
    term: 'Session Fixation',
    category: 'backend-intermediate',
    definition:
      'Penyerang menanamkan ID sesi lebih dulu lalu menunggu korban login memakainya. Dicegah dengan meregenerasi ID sesi setelah login berhasil.',
    lesson: 'backend-intermediate/keamanan-backend/auth-failures',
  },
  {
    term: 'HMAC',
    category: 'backend-intermediate',
    aliases: ['Hash-based Message Authentication Code'],
    definition:
      'Sidik jari pesan yang hanya bisa dibuat pemegang secret bersama. Dasar verifikasi tanda tangan webhook, dihitung dari body mentah.',
    lesson: 'backend-intermediate/keamanan-backend/integrity-failures',
  },
  {
    term: 'Replay Attack',
    category: 'backend-intermediate',
    definition:
      'Mengirim ulang permintaan sah yang direkam sebelumnya. Tanda tangannya tetap valid, jadi yang menutupnya adalah timestamp dengan masa berlaku pendek.',
    lesson: 'backend-intermediate/keamanan-backend/integrity-failures',
  },
  {
    term: 'DNS Rebinding',
    category: 'backend-intermediate',
    definition:
      'Nama domain yang saat diperiksa menunjuk IP publik lalu berubah menunjuk alamat internal sebelum permintaan dikirim. Ditutup dengan allow-list host.',
    lesson: 'backend-intermediate/keamanan-backend/ssrf',
  },
  {
    term: 'Content-Security-Policy',
    category: 'backend-intermediate',
    aliases: ['CSP'],
    definition:
      'Header yang membatasi sumber skrip dan gaya yang boleh dimuat halaman. Lapisan kedua terhadap XSS — bukan pengganti escaping keluaran.',
    lesson: 'backend-intermediate/keamanan-backend/security-misconfiguration',
  },
  {
    term: 'Typosquatting',
    category: 'backend-intermediate',
    definition:
      'Menerbitkan paket berbahaya dengan nama mirip paket populer, menunggu seseorang salah ketik saat memasang.',
    lesson: 'backend-intermediate/keamanan-backend/vulnerable-components',
  },
  {
    term: 'Lockfile',
    category: 'backend-intermediate',
    definition:
      'Berkas yang mengunci versi persis setiap paket. `npm ci` mematuhinya dan gagal bila tidak cocok; `npm install` boleh menulisnya ulang.',
    lesson: 'backend-intermediate/keamanan-backend/vulnerable-components',
  },
  {
    term: 'Alert Fatigue',
    category: 'backend-intermediate',
    definition:
      'Kelelahan akibat terlalu banyak alert palsu sampai yang sungguhan ikut diabaikan. Cara paling umum pemantauan mahal menjadi tidak berguna.',
    lesson: 'backend-intermediate/keamanan-backend/logging-monitoring-failures',
  },
  {
    term: 'Optimistic Concurrency',
    category: 'backend-intermediate',
    aliases: ['ETag', 'If-Match'],
    definition:
      'Klien mengirim versi yang ia baca; server menolak dengan `412` bila sudah berubah. Ini yang mencegah lost update tanpa mengunci baris.',
    lesson: 'backend-intermediate/menyambung-frontend-backend/optimistic-sinkronisasi',
  },
  {
    term: 'Lost Update',
    category: 'backend-intermediate',
    definition:
      'Penyimpan kedua menghapus pekerjaan penyimpan pertama pada data yang sama. Berbahaya karena tidak menimbulkan error apa pun.',
    lesson: 'backend-intermediate/menyambung-frontend-backend/optimistic-sinkronisasi',
  },
  {
    term: 'Optimistic Update',
    category: 'backend-intermediate',
    definition:
      'Mengubah tampilan sebelum server menjawab, dengan kewajiban mengembalikan keadaan bila permintaannya ternyata gagal.',
    lesson: 'backend-intermediate/menyambung-frontend-backend/optimistic-sinkronisasi',
  },
  {
    term: 'Server-Sent Events',
    category: 'backend-intermediate',
    aliases: ['SSE'],
    definition:
      'Aliran satu arah dari server ke klien di atas HTTP biasa. Browser menyambung ulang sendiri, dan autentikasinya sama dengan permintaan HTTP lain.',
    lesson: 'backend-intermediate/menyambung-frontend-backend/realtime-frontend',
  },
  {
    term: 'Presigned URL',
    category: 'backend-intermediate',
    definition:
      'URL berumur pendek yang memberi izin sekali pakai mengunggah langsung ke storage, sehingga byte berkas tidak melewati server aplikasi.',
    lesson: 'backend-intermediate/menyambung-frontend-backend/upload-frontend',
  },
  {
    term: 'Preflight Request',
    category: 'backend-intermediate',
    definition:
      'Permintaan `OPTIONS` yang dikirim browser sebelum permintaan lintas-origin tertentu, untuk menanyakan apakah ia diizinkan.',
    lesson: 'backend-intermediate/menyambung-frontend-backend/cors-praktik',
  },
  {
    term: 'Egress Firewall',
    category: 'backend-intermediate',
    definition:
      'Pembatasan lalu lintas keluar dari server. Membuat SSRF yang lolos validasi tetap tidak bisa menjangkau tujuan yang berharga.',
    lesson: 'backend-intermediate/keamanan-backend/ssrf',
  },
  {
    term: 'Threat Modeling',
    category: 'backend-intermediate',
    definition:
      'Menelaah sebuah fitur untuk menemukan apa yang bisa disalahgunakan sebelum ia dibangun, lewat empat pertanyaan dan daftar ancaman STRIDE.',
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
