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
