import {
  callout,
  code,
  divider,
  h2,
  ol,
  p,
  references,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
import { defineChapter, q, written } from '@/lib/curriculum/authoring';
import { lessons as lessonsArrayString } from './js-dasar/array-sampai-string';
import { lessons as lessonsModulPraktik } from './js-dasar/modul-sampai-praktik';
import { lessons as lessonsOperatorScope } from './js-dasar/operator-sampai-scope';

/**
 * Frontend Basic — Chapter 1.
 *
 * The entry point of the whole curriculum. Everything downstream (OOP, async, React, hooks)
 * assumes this chapter is understood, so it is written before anything else.
 */
export const chapter = defineChapter({
  slug: 'javascript-dari-nol',
  number: 1,
  title: 'Belajar JavaScript dari Nol untuk Pemula',
  summary:
    'Fondasi bahasa: sintaks, tipe data, fungsi, scope, array, object, modul, dan error handling.',
  objectives: [
    'Menjalankan JavaScript di browser maupun Node.js, dan tahu bedanya',
    'Memilih antara `let` dan `const` dengan alasan, bukan kebiasaan',
    'Menjelaskan kenapa `0.1 + 0.2 !== 0.3` dan kapan itu penting',
    'Memakai `map`, `filter`, dan `reduce` untuk menggantikan loop manual',
    'Membaca pesan error dan menelusurinya di DevTools',
  ],
  prerequisites: [],
  stackVersions: ['ECMAScript 2024', 'Node.js 22 LTS'],
  // 2026-08-03: revisi ADR-0006 — setiap sub-bab kini menjelaskan istilahnya sendiri dan
  // menunjuk halaman dokumentasi resminya.
  reviewedAt: '2026-08-03',
  lessons: [
    written(
      'apa-itu-javascript',
      'Apa itu JavaScript & Cara Menjalankannya',
      9,
      'Tiga tempat JavaScript berjalan, dan cara mengeksekusi baris pertamamu di masing-masing.',
      [
        p(
          'JavaScript adalah bahasa yang dirancang tahun 1995 untuk membuat halaman web bisa bereaksi. Tiga puluh tahun kemudian ia menjalankan hampir semuanya: tampilan di browser, server, aplikasi desktop, bahkan alat baris perintah. Bahasanya satu; yang berbeda adalah **tempat ia dijalankan** dan **apa yang tersedia di tempat itu**.',
        ),
        p(
          'Membedakan dua hal itu sejak awal akan menyelamatkanmu dari kebingungan yang sangat umum: kenapa `document` ada di browser tapi error di Node.js, dan kenapa `fs` ada di Node.js tapi tidak di browser.',
        ),

        terms(
          {
            term: 'runtime',
            meaning:
              'Dibaca "ran-taim", gabungan *run* (jalan) dan *time* (waktu) — harfiahnya "saat program berjalan". Dalam materi ini artinya lebih spesifik: **lingkungan tempat kodemu dijalankan, beserta seluruh perintah bawaan yang disediakan lingkungan itu**. Browser adalah satu runtime, Node.js adalah runtime lain, dan keduanya menjalankan bahasa yang sama persis. Yang berbeda hanya "perkakas" yang tersedia di masing-masing. Kamu akan bertemu kata ini terus sampai bab Deployment, jadi pastikan bedanya dengan "bahasa" benar-benar melekat sekarang.',
          },
          {
            term: 'API',
            meaning:
              'Singkatan *Application Programming Interface*, dibaca huruf per huruf "a-pe-i". Terjemahan bebasnya: **daftar perintah siap pakai yang disediakan sesuatu, supaya programmu bisa menyuruhnya melakukan sesuatu**. Analogi yang paling dekat adalah daftar menu di rumah makan — kamu tidak perlu tahu cara memasaknya, cukup tahu apa yang boleh dipesan dan bagaimana cara memesannya. `document` dan `fetch` adalah API yang disediakan browser; `fs` dan `http` adalah API yang disediakan Node.js. Nanti di bab Backend, kata "API" juga dipakai untuk arti yang sedikit berbeda — layanan di server yang dipanggil lewat jaringan. Konsep dasarnya tetap sama: sesuatu yang menyediakan perintah, dan sesuatu yang memakainya.',
          },
          {
            term: 'document',
            meaning:
              'API **browser**, bukan kata kunci JavaScript. Sebuah objek yang mewakili **seluruh halaman web yang sedang terbuka**, dan menjadi pintu masuk untuk membaca maupun mengubah isinya — misalnya `document.querySelector("h1")` untuk mengambil judul halaman. Menjalankan `document` di Node.js akan melempar `ReferenceError`, dan itu bukan bug: di Node.js tidak ada halaman web untuk diwakili. Seluruh Bab 4 nanti membahas objek ini.',
          },
          {
            term: 'window',
            meaning:
              'API **browser**. Objek paling luar yang mewakili **tab tempat halamanmu berjalan** — ia yang menampung ukuran layar, alamat URL, riwayat, dan timer. Setiap variabel global di browser sebenarnya menempel padanya, sehingga `window.alert(...)` dan `alert(...)` adalah hal yang sama. Node.js tidak punya `window` karena tidak punya jendela; padanan terdekatnya di sana adalah `globalThis`, yang tersedia di kedua runtime.',
          },
          {
            term: 'fetch',
            meaning:
              'Artinya *mengambil*. Perintah untuk **meminta data ke sebuah server lewat jaringan**, misalnya mengambil daftar produk dari layanan backend. Dulu ia hanya ada di browser sehingga sering disebut "API browser", tapi sejak Node.js 18 ia juga tersedia di sana — salah satu contoh bahwa batas antar-runtime bisa bergeser seiring waktu. Cara memakainya dibahas tuntas di Bab 5.',
          },
          {
            term: 'localStorage',
            meaning:
              'API **browser**. Kotak penyimpanan kecil di dalam browser (umumnya sekitar 5 MB) yang isinya **bertahan meski tab ditutup atau komputer dimatikan**. Isinya selalu berupa teks, dan terikat pada satu alamat situs — data yang disimpan situs A tidak bisa dibaca situs B. Website yang sedang kamu baca ini memakainya untuk menyimpan progres belajar, catatan, dan pilihan temamu; itu sebabnya tidak ada tombol login di sini.',
          },
          {
            term: 'fs',
            meaning:
              'Singkatan *file system*, artinya **sistem berkas**. Modul **Node.js** untuk membaca, menulis, menyalin, dan menghapus berkas di komputer tempat program itu berjalan — misalnya `fs.readFileSync("data.json")`. Modul ini **sengaja tidak ada di browser**, dan itu keputusan keamanan yang penting: kalau ada, halaman web mana pun yang kamu buka bisa membaca dokumen pribadimu. Kamu akan memakainya mulai Bab Backend Basic.',
          },
          {
            term: 'path',
            meaning:
              'Artinya *jalur*. Modul **Node.js** untuk merangkai dan membedah alamat berkas dengan benar. Kelihatannya sepele sampai kamu sadar bahwa Windows memisahkan folder dengan `\\` sementara Linux dan macOS memakai `/` — merangkai alamat dengan penyambungan teks biasa akan rusak begitu programnya pindah sistem operasi. `path.join("src", "lib", "util.js")` menyerahkan urusan itu ke Node.',
          },
          {
            term: 'process',
            meaning:
              'Artinya *proses*, yaitu satu program yang sedang berjalan di sistem operasi. Objek **Node.js** yang mewakili program**mu** sendiri: dari sini kamu membaca argumen baris perintah (`process.argv`), variabel lingkungan (`process.env`, tempat rahasia seperti kata sandi database disimpan), dan menghentikan program (`process.exit()`). Objek ini akan sering muncul lagi di bab Deployment.',
          },
          {
            term: 'http',
            meaning:
              'Singkatan *HyperText Transfer Protocol* — aturan baku yang dipakai browser dan server untuk saling berbicara. Modul **Node.js** bernama `http` memungkinkanmu membuat server sendiri yang menjawab permintaan dari browser. Kamu jarang memakainya langsung, karena framework seperti Express membungkusnya jadi jauh lebih nyaman; tapi Express sendiri berdiri di atas modul ini.',
          },
          {
            term: 'console',
            meaning:
              'Panel di dalam alat pengembang browser tempat kamu bisa **mengetik kode dan langsung melihat hasilnya**, sekaligus tempat munculnya pesan dan error. `console.log(nilai)` berarti "tampilkan nilai ini di panel itu" — `log` di sini berarti *mencatat*, bukan logaritma. Selama belajar, panel ini akan jadi alat yang paling sering kamu buka, dan Sub-bab 1.15 membahas belasan perintah lain selain `log`.',
          },
          {
            term: 'REPL',
            meaning:
              'Singkatan *Read–Eval–Print Loop*, dibaca "re-pel". Empat kata itu adalah siklus kerjanya: **Read** (baca satu baris yang kamu ketik), **Eval** (jalankan), **Print** (tampilkan hasilnya), **Loop** (ulangi dari awal). Console browser adalah REPL, begitu juga perintah `node` yang dijalankan tanpa nama berkas. Kelebihannya: kamu bisa menguji satu gagasan dalam hitungan detik tanpa membuat berkas apa pun.',
          },
          {
            term: 'parse',
            meaning:
              'Dibaca "pars", artinya **membedah teks menjadi struktur yang punya makna**. Saat browser mem-*parse* HTML, ia membaca teksnya dari atas ke bawah lalu menyusun pohon elemen yang bisa ditampilkan dan diubah JavaScript. Kata ini akan muncul lagi dalam bentuk lain: `JSON.parse` membedah teks JSON jadi object, dan `parseInt` membedah teks jadi angka.',
          },
          {
            term: 'defer',
            meaning:
              'Artinya *menunda*. Atribut pada tag `<script>` yang menyuruh browser tetap mengunduh berkas skrip secara paralel, tapi **baru menjalankannya setelah seluruh HTML selesai dibaca**. Tanpa itu, skrip yang mencari elemen halaman sering gagal karena elemennya memang belum ada saat skrip berjalan. Skrip bertipe module sudah otomatis berperilaku seperti ini.',
          },
          {
            term: 'LTS',
            meaning:
              'Singkatan *Long Term Support*, artinya **dukungan jangka panjang**. Label untuk versi yang dijanjikan akan terus diperbaiki keamanannya selama beberapa tahun, bukan beberapa bulan. Di Node.js, versi bernomor genap (20, 22, 24) menjadi LTS, sementara versi ganjil adalah jalur percobaan yang berumur pendek. Untuk belajar maupun produksi, selalu pilih yang LTS.',
          },
          {
            term: 'stack trace',
            meaning:
              'Terjemahannya *jejak tumpukan*. Daftar "siapa memanggil siapa" yang dicetak bersama sebuah error, disusun dari pemanggilan **terbaru di atas** ke yang terlama di bawah. Disebut tumpukan karena pemanggilan fungsi memang ditumpuk seperti piring: yang terakhir diletakkan adalah yang pertama diangkat. Baris teratas hampir selalu tempat kejadiannya, jadi mulailah menelusuri dari sana.',
          },
        ),

        h2('Runtime: bahasa vs lingkungannya'),
        p(
          'Bayangkan JavaScript sebagai bahasa Indonesia. Kosakata dan tata bahasanya sama di mana pun. Tapi kalau kamu bicara di dapur, kamu bisa menyebut "kompor"; kalau bicara di bandara, "kompor" tidak ada di sana — yang ada "landasan". Runtime adalah ruangannya.',
        ),
        table(
          ['Runtime', 'Dipakai untuk', 'Yang tersedia khusus di sana'],
          [
            [
              'Browser',
              'Tampilan & interaksi halaman web',
              '`document`, `window`, `fetch`, `localStorage`',
            ],
            ['Node.js', 'Server, CLI, alat build', '`fs`, `path`, `process`, `http`'],
            [
              'Bun / Deno',
              'Alternatif Node.js yang lebih baru',
              'Sebagian besar API Node + API web',
            ],
          ],
          'Inti bahasanya (`let`, `if`, `Array`, `Promise`) sama di ketiganya.',
        ),
        p(
          'Ada satu cara sederhana untuk mengingat pembagiannya. Semua yang berhubungan dengan **layar, klik, dan halaman** — `document`, `window`, `localStorage` — hanya masuk akal di browser, karena hanya di sanalah ada halaman yang dilihat orang. Sebaliknya, semua yang berhubungan dengan **berkas, folder, dan mesin** — `fs`, `path`, `process` — hanya masuk akal di Node.js, karena di sanalah programmu benar-benar punya akses ke komputer.',
        ),
        p(
          'Pembagian itu bukan kebetulan, melainkan **keputusan keamanan yang disengaja**. Kalau halaman web bisa memanggil `fs`, situs mana pun yang kamu buka — termasuk yang jahat — bisa membaca dokumen di laptopmu tanpa kamu sadari. Browser sengaja tidak menyediakan perintah itu sama sekali, dan itulah sebabnya ketiadaannya bukan kekurangan yang perlu "diakali".',
        ),
        callout(
          'info',
          'Kenapa ini sering jadi kebingungan pertama pemula',
          'Banyak tutorial di internet tidak menyebutkan runtime mana yang mereka pakai. Akibatnya kamu menyalin kode yang memanggil `fs`, menjalankannya di browser, lalu mendapat `ReferenceError: fs is not defined` dan mengira ada yang salah dengan pemasanganmu.',
          'Kebiasaan yang menyelamatkan: sebelum menyalin potongan kode dari mana pun, tanyakan satu hal dulu — **ini dijalankan di browser atau di Node.js?** Jawabannya menentukan perintah apa saja yang boleh muncul di dalamnya.',
        ),

        h2('Cara pertama: console browser'),
        p(
          'Cara tercepat mencoba satu baris. Buka browser, tekan `F12` (atau `Ctrl+Shift+I`, di macOS `Cmd+Option+I`), pilih tab **Console**, lalu ketik:',
        ),
        code(
          'js',
          `
          console.log('Halo dari browser');
          2026 - 1995;
          `,
          { caption: 'Console mengevaluasi ekspresi dan langsung menampilkan hasilnya.' },
        ),
        callout(
          'tip',
          'Console bukan cuma untuk print',
          'Console adalah REPL penuh: kamu bisa menjalankan fungsi, memeriksa objek, bahkan mengubah halaman yang sedang terbuka. Selama belajar, membuka console dan mencoba langsung jauh lebih cepat daripada menebak dari membaca.',
        ),

        h2('Cara kedua: file `.js` di dalam halaman HTML'),
        p(
          'Untuk kode yang lebih dari satu baris, taruh di file terpisah. Perhatikan atribut `type="module"` — ini yang membuat `import`/`export` bisa dipakai, dan sekarang adalah cara default menulis JavaScript modern.',
        ),
        code(
          'html',
          `
          <!doctype html>
          <html lang="id">
            <head>
              <meta charset="utf-8" />
              <title>Latihan JS</title>
            </head>
            <body>
              <h1>Buka console untuk melihat hasilnya</h1>

              <!-- defer: skrip diunduh paralel, dijalankan setelah HTML selesai diparse -->
              <script type="module" src="./app.js"></script>
            </body>
          </html>
          `,
          { filename: 'index.html' },
        ),
        code(
          'js',
          `
          const tahunSekarang = 2026;
          const tahunLahirJS = 1995;

          console.log(\`JavaScript berumur \${tahunSekarang - tahunLahirJS} tahun.\`);
          `,
          { filename: 'app.js' },
        ),
        callout(
          'warning',
          'Kenapa `type="module"` penting',
          'Tanpa `type="module"`, `import` akan error dan semua variabel di file itu bocor ke lingkup global — dua file bisa saling menimpa variabel tanpa peringatan. Dengan module, tiap file punya scope sendiri, dan skrip otomatis berperilaku seperti `"use strict"`.',
          'Efek sampingnya: file module tidak bisa dibuka lewat `file://`. Kamu butuh server lokal — misalnya `npx serve` di folder itu.',
        ),

        h2('Cara ketiga: Node.js di terminal'),
        p(
          'Node.js menjalankan JavaScript tanpa browser. Cek dulu apakah sudah terpasang, lalu jalankan file:',
        ),
        code(
          'bash',
          `
          # Cek versi. Kalau perintah tidak dikenal, Node.js belum terpasang.
          node --version

          # Jalankan sebuah file
          node app.js

          # Atau masuk ke mode interaktif (REPL), keluar dengan Ctrl+D
          node
          `,
        ),
        callout(
          'info',
          'Versi mana yang dipakai',
          'Pakai versi **LTS** (Long Term Support), saat materi ini ditulis Node.js 22. Versi ganjil (21, 23) adalah jalur eksperimental dan tidak didukung lama.',
        ),

        h2('Membaca error, bukan menghindarinya'),
        p(
          'Kamu akan lebih sering melihat error daripada hasil yang benar — itu normal, dan berlaku juga untuk programmer yang sudah bertahun-tahun bekerja. Yang membedakan pemula dari yang berpengalaman bukan jumlah errornya, melainkan **berapa lama waktu yang dibutuhkan untuk membacanya**. Error bukan tanda kamu gagal; ia justru satu-satunya laporan terperinci yang program berikan tentang apa yang sebenarnya terjadi.',
        ),
        p(
          'Kabar baiknya, bentuk pesan error selalu sama. Begitu kamu hafal strukturnya sekali, kamu bisa membaca error apa pun — bahkan dari pustaka yang belum pernah kamu pakai. Perhatikan contoh berikut baris demi baris:',
        ),
        code(
          'text',
          `
          Uncaught ReferenceError: nilai is not defined
              at hitung (app.js:7:15)
              at app.js:12:1
          `,
          { caption: 'Baca dari atas: jenis error, pesannya, lalu di mana ia terjadi.' },
        ),
        ol(
          '**`Uncaught`** — artinya *tidak tertangkap*. Error ini muncul dan tidak ada satu pun kode yang bersiap menanganinya, sehingga program berhenti. Cara menangkapnya dibahas di Sub-bab 1.14.',
          '**`ReferenceError`** — jenis errornya. Nama ini sudah memberi tahu banyak: ada sebuah **nama** yang dipakai padahal tidak pernah dideklarasikan. Jenis lain yang akan sering kamu temui adalah `TypeError` (nilainya ada, tapi tipenya tidak bisa diperlakukan begitu) dan `SyntaxError` (tulisannya salah, dan program bahkan tidak sempat berjalan).',
          '**`nilai is not defined`** — nama yang bermasalah. Tersangka pertamanya hampir selalu salah ketik, atau variabel yang dideklarasikan di scope lain sehingga tidak terlihat dari sini.',
          '**`app.js:7:15`** — berkas `app.js`, **baris 7**, **kolom 15**. Inilah titik yang harus kamu buka lebih dulu; jangan mulai menebak dari tempat lain.',
          '**Baris-baris di bawahnya** adalah *stack trace*. Ia menjawab pertanyaan "kenapa fungsi ini sampai dijalankan?" dengan menunjukkan rantai pemanggilnya, dari yang terbaru ke yang terlama.',
        ),
        callout(
          'tip',
          'Urutan membaca yang menghemat waktu',
          'Baca **baris pertama** untuk tahu *apa* yang salah, lalu **baris kedua** untuk tahu *di mana*. Dua baris itu sudah menyelesaikan sebagian besar kasus. Sisa stack trace baru berguna kalau ternyata baris yang error itu sendiri sudah benar — berarti masalahnya ada pada nilai yang dikirim ke sana, dan kamu perlu menelusuri ke atas untuk mencari pengirimnya.',
        ),

        divider,
        h2('Rangkuman'),
        ul(
          'Bahasa JavaScript sama di mana-mana; **runtime**-nya yang berbeda dan menentukan API apa yang tersedia.',
          'Console browser untuk eksperimen cepat, file `.js` + `type="module"` untuk kode halaman, Node.js untuk kode di luar browser.',
          '`type="module"` memberi tiap file scope sendiri dan mode strict otomatis — pakai selalu.',
          'Error punya struktur tetap: jenis, pesan, lokasi, lalu jejak pemanggilan.',
        ),
        references(
          {
            label: 'Introduction — JavaScript Guide',
            href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction',
            source: 'MDN',
            note: 'Pengantar resmi bahasanya, termasuk sejarah singkat dan hubungannya dengan standar ECMAScript.',
          },
          {
            label: 'The <script> element',
            href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script',
            source: 'MDN',
            note: 'Rujukan lengkap atribut `type`, `defer`, dan `async` — termasuk kapan masing-masing dijalankan.',
          },
          {
            label: 'JavaScript modules',
            href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules',
            source: 'MDN',
            note: 'Alasan `type="module"` mengubah perilaku file, ditulis oleh sumber yang mendefinisikannya.',
          },
          {
            label: 'Console API',
            href: 'https://developer.mozilla.org/en-US/docs/Web/API/console',
            source: 'MDN',
            note: 'Daftar lengkap perintah console — `log` hanya satu dari belasan yang tersedia.',
          },
          {
            label: 'Introduction to Node.js',
            href: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
            source: 'Node.js',
            note: 'Penjelasan resmi apa yang Node.js tambahkan di luar bahasa JavaScript itu sendiri.',
          },
          {
            label: 'Node.js releases & LTS schedule',
            href: 'https://nodejs.org/en/about/previous-releases',
            source: 'Node.js',
            note: 'Tabel versi mana yang berstatus LTS dan sampai kapan didukung.',
          },
        ),
      ],
    ),

    written(
      'variabel-let-const-var',
      'Variabel: `let`, `const`, dan kenapa `var` ditinggalkan',
      11,
      'Tiga cara mendeklarasikan variabel, dan alasan teknis kenapa hanya dua yang masih dipakai.',
      [
        p(
          'Variabel adalah nama untuk sebuah nilai. JavaScript punya tiga kata kunci untuk membuatnya: `var`, `let`, dan `const`. Dalam kode modern kamu praktis hanya memakai dua — dan tahu **kenapa** yang ketiga ditinggalkan akan membantumu membaca kode lama tanpa bingung.',
        ),

        terms(
          {
            term: 'deklarasi',
            meaning:
              'Dari *declaration*, artinya **pernyataan atau pemberitahuan**. Baris yang memperkenalkan sebuah nama baru ke dalam program: `const namaSitus = "Ruang Belajar"`. Kata "mendeklarasikan" berarti memberi tahu JavaScript bahwa nama itu ada dan mulai sekarang boleh dipakai. Ini berbeda dari sekadar mengisi nilai — deklarasi hanya boleh dilakukan **sekali** untuk satu nama di satu scope; mengulanginya dengan `let` atau `const` justru menghasilkan `SyntaxError`.',
          },
          {
            term: 'assign',
            meaning:
              'Dibaca "a-sain", artinya **menugaskan atau memberikan nilai**. Tanda `=` dalam JavaScript bukan "sama dengan" seperti di matematika, melainkan perintah "masukkan nilai di sebelah kanan ke dalam nama di sebelah kiri". Karena itu `x = x + 1` masuk akal di sini, padahal mustahil dalam matematika. Istilah "assign ulang" (*reassign*) berarti mengisi nama yang **sudah ada** dengan nilai yang berbeda — dan inilah tepatnya yang dilarang `const`.',
          },
          {
            term: 'scope',
            meaning:
              'Dibaca "skop", artinya **jangkauan atau wilayah berlaku**. Bagian dari kode di mana sebuah nama masih dikenali; di luar wilayah itu, namanya diperlakukan seolah tidak pernah ada dan memakainya menghasilkan `ReferenceError`. Analoginya seperti nama panggilan di dalam keluarga: di rumah semua orang paham siapa yang dimaksud, tapi begitu keluar rumah, nama itu tidak berarti apa-apa. Konsep ini dibahas tuntas di Sub-bab 1.8, dan ia menjelaskan hampir semua kebingungan "kenapa variabel saya `undefined`".',
          },
          {
            term: 'blok',
            meaning:
              'Dari *block*. Apa pun yang berada di antara sepasang kurung kurawal `{` dan `}` — badan sebuah `if`, badan sebuah `for`, badan sebuah fungsi, atau bahkan kurawal yang berdiri sendiri. Istilah ini penting karena `let` dan `const` **berhenti tepat di batas blok**, sementara `var` mengabaikannya sepenuhnya. Itulah perbedaan yang membuat `var` ditinggalkan.',
          },
          {
            term: 'hoisting',
            meaning:
              'Dibaca "hois-ting", dari kata *hoist* yang berarti **mengangkat atau menderek**. Nama ini menggambarkan perilaku JavaScript yang, sebelum menjalankan satu baris pun, terlebih dulu mendata seluruh deklarasi di sebuah scope dan seolah-olah "mengangkatnya" ke bagian paling atas. Yang penting dipahami: yang terangkat hanyalah **deklarasi namanya**, bukan nilainya. Karena itu `var` yang diakses terlalu awal bernilai `undefined` — namanya sudah ada, isinya belum.',
          },
          {
            term: 'TDZ',
            meaning:
              'Singkatan *Temporal Dead Zone*, terjemahannya **zona mati sementara**. Rentang yang dimulai dari awal sebuah blok sampai baris tempat `let` atau `const` dideklarasikan. Mengakses nama di dalam rentang itu **sengaja** dibuat melempar error, bukan mengembalikan `undefined`. Kata "temporal" (berkaitan dengan waktu) dipakai karena zona ini soal *kapan* baris dijalankan, bukan *di mana* letaknya di berkas. Ini bukan gangguan yang perlu diakali — ini fitur yang mengubah kesalahan urutan menjadi error yang langsung menunjuk barisnya.',
          },
          {
            term: 'immutable',
            meaning:
              'Dibaca "i-myu-ta-bel", artinya **tidak bisa diubah isinya**. Lawan katanya *mutable* (bisa diubah). Di JavaScript, semua nilai primitif — angka, teks, boolean — bersifat immutable: `"halo".toUpperCase()` tidak mengubah teks aslinya, melainkan menghasilkan teks baru. Sebaliknya array dan object bersifat mutable, dan justru sifat itulah sumber banyak bug "kok ikut berubah?" yang dibahas di Sub-bab 1.3.',
          },
          {
            term: 'shallow',
            meaning:
              'Artinya **dangkal**, yaitu hanya menyentuh lapisan paling luar dan tidak menembus ke dalam. Lawannya *deep* (dalam). `Object.freeze(obj)` bersifat shallow: property di tingkat pertama terkunci, tapi object yang berada **di dalam** object itu tetap bisa diubah dengan bebas. Kata ini akan muncul lagi berpasangan dengan *deep* saat membahas penyalinan data.',
          },
          {
            term: 'linter',
            meaning:
              'Dibaca "lin-ter", dari kata *lint* — serat halus yang menempel di pakaian. Alat yang membaca kodemu **tanpa menjalankannya** lalu menandai pola yang bermasalah: variabel yang tidak pernah dipakai, `let` yang seharusnya `const`, atau pemanggilan yang keliru. ESLint adalah linter yang paling umum di JavaScript dan dipakai juga oleh project website ini. Anggap ia sebagai pembaca kedua yang tidak pernah lelah.',
          },
          {
            term: 'camelCase',
            meaning:
              'Dibaca "ke-mel-keis". Gaya penamaan tanpa spasi di mana kata pertama huruf kecil semua dan setiap kata berikutnya diawali huruf besar: `jumlahKunjungan`, `sisaHariLangganan`. Disebut *camel* (unta) karena huruf besarnya naik-turun seperti punuk. Ini adalah idiom resmi JavaScript — bukan `snake_case` (gaya Python) dan bukan `PascalCase`, yang di JavaScript sudah punya arti khusus: nama class dan nama komponen React.',
          },
          {
            term: 'SCREAMING_SNAKE_CASE',
            meaning:
              'Gaya penamaan dengan huruf kapital semua dan garis bawah sebagai pemisah: `MAX_UPLOAD_MB`. Namanya berasal dari gabungan *screaming* (berteriak, karena huruf besar semua) dan *snake* (ular, karena garis bawahnya memanjang mendatar). Dipakai khusus untuk konstanta konfigurasi yang nilainya benar-benar tetap sepanjang umur program.',
          },
        ),

        h2('Aturan praktis'),
        table(
          ['Kata kunci', 'Bisa di-assign ulang?', 'Scope', 'Pakai kapan'],
          [
            ['`const`', 'Tidak', 'Blok `{ }`', '**Default.** Pakai ini dulu, selalu.'],
            ['`let`', 'Ya', 'Blok `{ }`', 'Hanya kalau nilainya memang harus berubah.'],
            ['`var`', 'Ya', 'Fungsi', 'Jangan dipakai di kode baru.'],
          ],
        ),
        p(
          'Urutan berpikirnya: tulis `const`. Kalau ternyata linter atau runtime protes karena kamu perlu menugaskan ulang, baru ubah jadi `let`. Cara ini membuat setiap `let` di kodemu menjadi sinyal — "yang ini memang berubah" — bukan sekadar kebiasaan.',
        ),
        code(
          'js',
          `
          const namaSitus = 'Ruang Belajar';
          let jumlahKunjungan = 0;

          jumlahKunjungan = jumlahKunjungan + 1;   // boleh — let
          // namaSitus = 'Lainnya';                // TypeError: Assignment to constant variable.
          `,
        ),

        h2('`const` bukan berarti nilainya beku'),
        p(
          'Ini kesalahpahaman paling sering. `const` mengunci **ikatan nama ke nilai**, bukan isi nilainya. Untuk object dan array, isinya masih bisa diubah.',
        ),
        code(
          'js',
          `
          const pengguna = { nama: 'Zum', level: 1 };

          pengguna.level = 2;        // BOLEH — isi object berubah, ikatannya tetap
          pengguna.email = 'a@b.c';  // BOLEH — menambah property

          // pengguna = { nama: 'Lain' };  // TypeError — ini mengganti ikatannya

          const daftar = [1, 2, 3];
          daftar.push(4);            // BOLEH — [1, 2, 3, 4]
          // daftar = [];            // TypeError
          `,
        ),
        callout(
          'tip',
          'Kalau isinya benar-benar harus beku',
          '`Object.freeze(obj)` mencegah perubahan property tingkat pertama. Tapi ia hanya satu lapis (*shallow*): object di dalam object tetap bisa diubah. Untuk data yang benar-benar tidak boleh berubah, biasakan membuat salinan baru daripada mengandalkan pembekuan.',
        ),

        h2('Scope: `var` bocor, `let`/`const` tidak'),
        p(
          'Scope adalah wilayah di mana sebuah nama dikenali. `let` dan `const` hidup di dalam blok — apa pun yang ada di antara `{` dan `}`. `var` mengabaikan blok dan hanya mengenal batas fungsi.',
        ),
        code(
          'js',
          `
          function contoh() {
            if (true) {
              var pakaiVar = 'saya bocor keluar blok';
              let pakaiLet = 'saya berhenti di sini';
            }

            console.log(pakaiVar);   // 'saya bocor keluar blok'
            console.log(pakaiLet);   // ReferenceError: pakaiLet is not defined
          }
          `,
        ),
        p(
          'Kebocoran itu terlihat sepele sampai kamu bertemu kasus klasik ini — perbedaan hasilnya bukan gaya penulisan, tapi bug sungguhan:',
        ),
        code(
          'js',
          `
          for (var i = 0; i < 3; i++) {
            setTimeout(() => console.log('var:', i), 0);
          }
          // var: 3, var: 3, var: 3
          // Hanya ada SATU i untuk seluruh loop; saat callback jalan, i sudah 3.

          for (let j = 0; j < 3; j++) {
            setTimeout(() => console.log('let:', j), 0);
          }
          // let: 0, let: 1, let: 2
          // let membuat j BARU setiap iterasi.
          `,
        ),

        h2('Hoisting & Temporal Dead Zone'),
        p(
          'Semua deklarasi "diangkat" (*hoisted*) ke atas scope-nya sebelum kode dijalankan. Bedanya pada apa yang terjadi kalau kamu mengaksesnya lebih awal.',
        ),
        code(
          'js',
          `
          console.log(a);   // undefined  — var sudah ada, isinya belum
          var a = 1;

          console.log(b);   // ReferenceError: Cannot access 'b' before initialization
          let b = 2;
          `,
        ),
        p(
          'Rentang antara awal blok dan baris deklarasi `let`/`const` disebut **Temporal Dead Zone**. Namanya seram, maksudnya sederhana: JavaScript sengaja melempar error alih-alih memberimu `undefined` diam-diam. Error yang berisik jauh lebih murah daripada nilai salah yang lolos.',
        ),
        callout(
          'warning',
          'Kenapa `undefined` diam-diam itu mahal',
          'Dengan `var`, salah urut penulisan menghasilkan `undefined` yang mengalir ke perhitungan berikutnya, menjadi `NaN`, lalu muncul sebagai teks aneh di layar tiga fungsi kemudian. Dengan `let`, kamu langsung tahu barisnya.',
        ),

        h2('Menamai variabel'),
        ul(
          'Gunakan `camelCase` — itu idiom JavaScript. Bukan `snake_case`, bukan `PascalCase` (yang dipakai untuk class dan komponen React).',
          'Nama menjelaskan **maksud**, bukan tipe: `sisaHariLangganan`, bukan `angka2`.',
          'Boolean ditulis seperti pernyataan: `sudahLogin`, `punyaAkses`, `bisaDiulang` — supaya `if (sudahLogin)` terbaca sebagai kalimat.',
          'Konstanta konfigurasi yang benar-benar tetap boleh `SCREAMING_SNAKE_CASE`: `MAX_UPLOAD_MB`.',
          'Hindari singkatan yang cuma kamu yang paham. Menghemat lima huruf tidak sebanding dengan satu pembaca yang bingung.',
        ),

        divider,
        h2('Rangkuman'),
        ul(
          '`const` sebagai default, `let` kalau memang berubah, `var` tidak sama sekali.',
          '`const` mengunci ikatan nama, bukan isi object atau array.',
          '`let`/`const` ber-scope blok; `var` ber-scope fungsi dan bocor keluar blok.',
          'Temporal Dead Zone membuat kesalahan urutan jadi error yang jelas, bukan `undefined` yang menyesatkan.',
        ),
        references(
          {
            label: 'const',
            href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const',
            source: 'MDN',
            note: 'Termasuk penegasan resmi bahwa `const` mengunci ikatan nama, bukan isi nilainya.',
          },
          {
            label: 'let',
            href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let',
            source: 'MDN',
            note: 'Bagian "Temporal dead zone" di halaman ini menjelaskan kenapa error-nya sengaja dibuat.',
          },
          {
            label: 'var',
            href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var',
            source: 'MDN',
            note: 'Dibaca bukan untuk dipakai, tapi supaya kamu paham saat menemuinya di kode lama.',
          },
          {
            label: 'Hoisting',
            href: 'https://developer.mozilla.org/en-US/docs/Glossary/Hoisting',
            source: 'MDN',
            note: 'Definisi ringkas istilahnya, lengkap dengan perbedaan perilaku antar kata kunci.',
          },
          {
            label: 'Object.freeze()',
            href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze',
            source: 'MDN',
            note: 'Menegaskan sifat *shallow*-nya dan menunjukkan pola pembekuan mendalam.',
          },
        ),
      ],
    ),

    written(
      'tipe-data',
      'Tipe Data: primitif vs reference',
      12,
      'Tujuh tipe primitif, tipe reference, dan kenapa membedakannya menentukan hasil saat menyalin nilai.',
      [
        p(
          'JavaScript membagi nilai menjadi dua kelompok besar: **primitif** dan **reference**. Perbedaan ini bukan trivia — ia menentukan apa yang terjadi saat kamu menyalin sebuah nilai, membandingkan dua nilai, atau mengoper nilai ke dalam fungsi.',
        ),

        terms(
          {
            term: 'primitif',
            meaning:
              'Dari *primitive*, artinya **paling dasar atau paling sederhana**. Nilai yang tidak tersusun dari nilai-nilai lain dan tidak bisa dipecah lagi: sebuah angka, sepotong teks, `true` atau `false`. Ciri terpentingnya bukan kesederhanaannya, melainkan **cara ia berpindah**: saat kamu menyalin nilai primitif ke variabel lain, yang berpindah adalah nilainya sendiri, sehingga kedua variabel sejak itu benar-benar terpisah.',
          },
          {
            term: 'reference',
            meaning:
              'Dibaca "re-fe-rens", artinya **rujukan atau penunjuk**. Nilai yang tidak disimpan langsung di dalam variabelnya, melainkan disimpan di tempat lain di memori — dan yang ada di dalam variabel hanyalah **alamat menuju tempat itu**. Object, array, dan function semuanya bekerja seperti ini. Konsekuensinya besar dan akan terasa sepanjang kurikulum: dua variabel bisa memegang alamat yang sama, sehingga perubahan lewat satu variabel langsung terlihat dari variabel lainnya.',
          },
          {
            term: 'typeof',
            meaning:
              'Gabungan *type* (tipe) dan *of* (dari), dibaca "taip-of". Operator bawaan yang menjawab pertanyaan "nilai ini bertipe apa?" dan **mengembalikan jawabannya sebagai teks**, misalnya `"string"` atau `"number"` — perhatikan bahwa hasilnya adalah teks, bukan tipe itu sendiri. Ia punya satu jawaban yang keliru sejak 1995 dan tidak akan pernah diperbaiki, yaitu untuk `null`; alasannya dijelaskan di bawah.',
          },
          {
            term: 'NaN',
            meaning:
              'Singkatan *Not a Number*, dibaca "nan", artinya **bukan sebuah angka**. Nilai khusus yang muncul ketika sebuah perhitungan angka gagal menghasilkan angka yang sah — misalnya `Number("12abc")` atau `0 / 0`. Dua keanehannya perlu diingat: pertama, `typeof NaN` justru menjawab `"number"`; kedua, `NaN === NaN` bernilai `false`, menjadikannya satu-satunya nilai di JavaScript yang tidak sama dengan dirinya sendiri. Karena itu satu-satunya cara mengeceknya adalah `Number.isNaN(nilai)`.',
          },
          {
            term: 'floating point',
            meaning:
              'Terjemahan harfiahnya **titik mengambang**, merujuk pada titik desimal yang posisinya bisa bergeser. Cara komputer menyimpan bilangan desimal memakai jumlah bit yang terbatas — di JavaScript, 64 bit untuk setiap angka. Karena jumlah bitnya terbatas sementara jumlah pecahan itu tak terhingga, sebagian pecahan hanya bisa disimpan **mendekati**, bukan tepat. Ini bukan kelalaian, melainkan konsekuensi matematis yang tidak bisa dihindari.',
          },
          {
            term: 'IEEE 754',
            meaning:
              'Dibaca "ai-tripel-i tujuh lima empat". Nama standar internasional yang mendefinisikan cara menyimpan bilangan floating point, diterbitkan oleh IEEE (lembaga standar teknik elektro dan elektronika). Standar inilah yang dipakai hampir semua bahasa pemrograman modern — dan itulah sebabnya `0.1 + 0.2` juga meleset di Python, Java, C, dan Go dengan cara yang persis sama. Jadi ketika kamu menemuinya, jangan mencari solusi yang khas JavaScript; masalahnya jauh lebih tua dari bahasa ini.',
          },
          {
            term: 'EPSILON',
            meaning:
              'Dibaca "ep-si-lon", nama huruf Yunani ε yang dalam matematika secara tradisional dipakai untuk melambangkan **selisih yang sangat kecil**. `Number.EPSILON` adalah selisih terkecil yang masih bisa dibedakan JavaScript di sekitar angka 1, nilainya sekitar `2,22 × 10⁻¹⁶`. Gunanya praktis: alih-alih bertanya "apakah dua desimal ini persis sama?", kamu bertanya "apakah selisihnya lebih kecil dari ambang yang mustahil berarti?".',
          },
          {
            term: 'BigInt',
            meaning:
              'Gabungan *big* (besar) dan *integer* (bilangan bulat). Tipe terpisah untuk bilangan bulat yang melampaui batas aman `number`, yaitu 9.007.199.254.740.991. Ditulis dengan akhiran huruf `n`, misalnya `10n`. Perlu diingat: BigInt **tidak bisa dicampur** dengan `number` dalam satu operasi aritmetika — `1n + 1` melempar `TypeError`. Kamu akan membutuhkannya saat menangani id besar dari database atau perhitungan keuangan berskala besar.',
          },
          {
            term: 'shallow / deep copy',
            meaning:
              'Terjemahannya **salinan dangkal** dan **salinan dalam**. Salinan dangkal hanya menyalin lapisan terluar sebuah object; segala object yang bersarang di dalamnya tetap **dibagi bersama** dengan aslinya, sehingga mengubah salah satu ikut mengubah yang lain. Salinan dalam menelusuri sampai ke lapisan terdalam dan membuat semuanya baru. Pembedaan ini akan kembali muncul sebagai penyebab bug di React, jadi kenali sekarang.',
          },
          {
            term: 'structuredClone',
            meaning:
              'Gabungan *structured* (terstruktur) dan *clone* (menggandakan). Fungsi bawaan browser dan Node.js modern yang membuat **salinan dalam** dari sebuah nilai, termasuk `Date`, `Map`, `Set`, dan bahkan struktur yang menunjuk dirinya sendiri. Ia menggantikan trik lama `JSON.parse(JSON.stringify(obj))` yang diam-diam merusak beberapa tipe data.',
          },
          {
            term: 'obj',
            meaning:
              'Singkatan *object*, nama parameter yang lazim dipakai di contoh kode dan dokumentasi. **Bukan kata kunci JavaScript** — ia hanya nama variabel biasa, dan kamu bebas menggantinya dengan `pengguna`, `data`, atau apa pun yang lebih menjelaskan isinya. Kebiasaan menyingkat seperti ini akan sering kamu temui; kalau bingung, ingat bahwa nama variabel tidak pernah punya arti khusus bagi JavaScript.',
          },
        ),

        h2('Tujuh tipe primitif'),
        table(
          ['Tipe', 'Contoh', 'Catatan'],
          [
            [
              '`string`',
              '`\'halo\'`, `"halo"`, `` `halo` ``',
              'Tidak bisa diubah isinya (immutable)',
            ],
            ['`number`', '`42`, `3.14`, `-0.5`', 'Semua angka, bulat maupun desimal'],
            ['`boolean`', '`true`, `false`', 'Hanya dua nilai'],
            ['`undefined`', '`undefined`', 'Belum diberi nilai'],
            ['`null`', '`null`', '**Sengaja** dikosongkan'],
            ['`bigint`', '`9007199254740993n`', 'Untuk bilangan bulat sangat besar'],
            ['`symbol`', '`Symbol("id")`', 'Kunci unik, jarang dipakai pemula'],
          ],
        ),
        p(
          'Selain ketujuh itu, semuanya adalah **object**: array, function, `Date`, `Map`, dan seterusnya.',
        ),

        h2('`typeof` dan satu bug legendarisnya'),
        code(
          'js',
          `
          typeof 'halo';        // 'string'
          typeof 42;            // 'number'
          typeof true;          // 'boolean'
          typeof undefined;     // 'undefined'
          typeof Symbol();      // 'symbol'
          typeof 10n;           // 'bigint'

          typeof {};            // 'object'
          typeof [];            // 'object'   <- array juga object
          typeof function(){};  // 'function' <- pengecualian yang berguna

          typeof null;          // 'object'   <- BUG, sejak 1995, tidak akan diperbaiki
          `,
        ),
        callout(
          'warning',
          '`typeof null === "object"` adalah bug yang dibiarkan',
          'Ini kesalahan implementasi di versi pertama JavaScript. Memperbaikinya sekarang akan merusak jutaan situs, jadi ia dibiarkan selamanya. Untuk mengecek `null`, bandingkan langsung: `nilai === null`.',
          'Untuk membedakan array dari object biasa, pakai `Array.isArray(nilai)` — bukan `typeof`.',
        ),

        h2('`null` vs `undefined`'),
        p(
          'Keduanya berarti "tidak ada nilai", tapi asal-usulnya berbeda, dan perbedaan itu berguna saat membaca kode orang lain.',
        ),
        ul(
          '`undefined` — JavaScript yang memberikannya: variabel belum diisi, property tidak ada, fungsi tidak me-`return`.',
          '`null` — **kamu** yang menaruhnya, artinya "kosong, dan itu disengaja".',
        ),
        code(
          'js',
          `
          let belumDiisi;
          console.log(belumDiisi);           // undefined

          const pengguna = { nama: 'Zum' };
          console.log(pengguna.email);       // undefined — property tidak ada

          const fotoProfil = null;           // sengaja: pengguna ini memang tidak punya foto

          console.log(null == undefined);    // true   — longgar, keduanya "kosong"
          console.log(null === undefined);   // false  — tipenya beda
          `,
        ),

        h2('Angka: satu tipe, satu jebakan'),
        p(
          'JavaScript menyimpan semua `number` sebagai floating point 64-bit. Konsekuensinya adalah hal yang membuat setiap pemula berhenti sejenak:',
        ),
        code(
          'js',
          `
          0.1 + 0.2;                    // 0.30000000000000004
          0.1 + 0.2 === 0.3;            // false

          // Ini bukan bug JavaScript — sama di Python, Java, C.
          // 0.1 tidak bisa direpresentasikan tepat dalam biner, sama seperti 1/3
          // tidak bisa ditulis tepat dalam desimal.

          // Cara membandingkan desimal dengan aman:
          Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;   // true
          `,
        ),
        callout(
          'danger',
          'Jangan pernah simpan uang sebagai desimal',
          'Untuk nilai uang, simpan dalam satuan terkecil sebagai bilangan bulat — rupiah penuh, atau sen. `hargaRupiah = 15000`, bukan `harga = 15000.00`. Pembulatan yang meleset satu sen akan terakumulasi, dan bug seperti itu baru ketahuan saat laporan keuangan tidak balance.',
        ),
        code(
          'js',
          `
          Number.MAX_SAFE_INTEGER;      // 9007199254740991
          9007199254740992 === 9007199254740993;   // true (!) — di luar batas aman

          // Untuk bilangan bulat yang lebih besar, pakai BigInt:
          9007199254740992n === 9007199254740993n; // false

          Number('12abc');              // NaN — "Not a Number"
          typeof NaN;                   // 'number' (ya, betul)
          NaN === NaN;                  // false — satu-satunya nilai yang tidak sama dengan dirinya
          Number.isNaN(NaN);            // true — ini cara mengeceknya
          `,
        ),

        h2('Primitif disalin, reference dibagikan'),
        p(
          'Inilah inti sub-bab ini, dan kalau hanya satu hal yang kamu bawa pulang dari halaman ini, biarlah bagian ini yang tersisa. Perbedaannya terdengar teknis, tapi akibatnya sangat praktis: ia menjelaskan kenapa sebuah data "ikut berubah" padahal kamu merasa tidak pernah menyentuhnya.',
        ),
        p(
          'Duduk perkaranya begini. Setiap variabel sebenarnya adalah sebuah kotak kecil. Untuk nilai **primitif**, isi kotak itu adalah nilainya sendiri — angka `10` benar-benar tersimpan di dalam kotak bernama `a`. Untuk nilai **reference**, isi kotaknya bukan datanya, melainkan **secarik kertas berisi alamat**; datanya sendiri tersimpan di tempat lain. Menyalin variabel selalu berarti menyalin isi kotaknya. Untuk primitif, yang tersalin adalah nilainya; untuk reference, yang tersalin hanyalah alamatnya — dan dua alamat yang sama tentu menunjuk ke rumah yang sama.',
        ),
        p('Perhatikan hasil kedua contoh berikut, lalu bandingkan dengan penjelasan di atas:'),
        code(
          'js',
          `
          // PRIMITIF — nilainya disalin
          let a = 10;
          let b = a;
          b = 20;
          console.log(a);   // 10 — a tidak terpengaruh

          // REFERENCE — alamatnya yang disalin, isinya sama
          const x = { skor: 10 };
          const y = x;
          y.skor = 20;
          console.log(x.skor);   // 20 — x ikut berubah, karena x dan y menunjuk object yang SAMA
          `,
        ),
        callout(
          'info',
          'Analogi yang menempel',
          'Primitif seperti fotokopi dokumen: kamu mencoret salinanmu, aslinya utuh. Reference seperti membagikan tautan ke satu dokumen bersama: siapa pun yang mengedit, semua melihat perubahannya.',
        ),
        p(
          'Perbandingan pun mengikuti aturan yang sama, dan hasilnya sering mengejutkan pertama kali. Saat kamu membandingkan dua object dengan `===`, JavaScript **tidak melihat isinya sama sekali** — ia hanya membandingkan alamat. Dua object dengan isi yang persis identik tetap dinilai berbeda, karena keduanya menempati alamat yang berlainan:',
        ),
        code(
          'js',
          `
          10 === 10;                   // true  — nilai yang sama
          'abc' === 'abc';             // true

          { a: 1 } === { a: 1 };       // false — dua object berbeda, isi kebetulan sama
          [1, 2] === [1, 2];           // false

          const satu = { a: 1 };
          const dua = satu;
          satu === dua;                // true  — object yang sama persis
          `,
        ),

        callout(
          'info',
          'Justru sifat ini yang dipakai React',
          'Kelihatannya merepotkan, tapi perbandingan berdasarkan alamat itu murah sekali — cukup satu langkah, tidak peduli seberapa besar datanya. React memanfaatkannya untuk memutuskan perlu tidaknya menggambar ulang layar: kalau alamatnya sama, ia menganggap tidak ada yang berubah dan melewati pekerjaan itu.',
          'Konsekuensinya menentukan cara kamu menulis kode nanti: mengubah isi array secara langsung dengan `push` tidak mengubah alamatnya, sehingga React tidak melihat perubahan apa pun dan layar tidak ikut diperbarui. Itulah alasan sesungguhnya di balik anjuran "selalu buat salinan baru" yang akan kamu dengar berkali-kali.',
        ),

        h2('Menyalin object dengan aman'),
        p(
          'Karena menyalin variabel reference hanya menyalin alamatnya, kamu butuh cara yang sungguh-sungguh membuat data baru. Ada dua tingkat kedalaman, dan memilih yang keliru adalah salah satu sumber bug yang paling sulit dilacak — karena kodenya terlihat benar dan baru gagal pada data yang kebetulan bersarang.',
        ),
        code(
          'js',
          `
          const asli = { nama: 'Zum', alamat: { kota: 'Bandung' } };

          // Salinan dangkal (shallow) — cukup untuk object satu lapis
          const dangkal = { ...asli };
          dangkal.nama = 'Lain';
          console.log(asli.nama);            // 'Zum'  — aman

          dangkal.alamat.kota = 'Jakarta';
          console.log(asli.alamat.kota);     // 'Jakarta' — TIDAK aman, alamat masih dibagi

          // Salinan dalam (deep) — bawaan browser & Node modern
          const dalam = structuredClone(asli);
          dalam.alamat.kota = 'Surabaya';
          console.log(asli.alamat.kota);     // 'Jakarta' — aman
          `,
        ),
        callout(
          'tip',
          '`structuredClone` menggantikan trik lama',
          'Dulu orang memakai `JSON.parse(JSON.stringify(obj))`. Trik itu membuang `Date` (jadi string), `Map`, `Set`, `undefined`, dan fungsi — dan gagal total pada struktur melingkar. `structuredClone` menangani semuanya dan sudah tersedia di semua browser modern serta Node 17+.',
        ),

        divider,
        h2('Rangkuman'),
        ul(
          'Tujuh tipe primitif; sisanya object.',
          '`typeof null === "object"` adalah bug historis — cek `null` dengan `===`.',
          '`undefined` diberikan sistem, `null` diberikan kamu.',
          'Desimal tidak presisi; jangan simpan uang sebagai desimal.',
          'Primitif disalin nilainya, reference dibagikan alamatnya — ini sumber banyak bug "kok ikut berubah?".',
          '`structuredClone` untuk salinan dalam, spread `{ ...obj }` untuk salinan dangkal.',
        ),
        references(
          {
            label: 'JavaScript data types and data structures',
            href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures',
            source: 'MDN',
            note: 'Daftar resmi ketujuh tipe primitif beserta batas nilainya masing-masing.',
          },
          {
            label: 'typeof',
            href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof',
            source: 'MDN',
            note: 'Termasuk catatan resmi bahwa `typeof null === "object"` adalah cacat yang dipertahankan demi kompatibilitas.',
          },
          {
            label: 'Number.EPSILON',
            href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON',
            source: 'MDN',
            note: 'Contoh resmi fungsi pembanding desimal yang memakai ambang toleransi.',
          },
          {
            label: 'The Number Type',
            href: 'https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-number-type',
            source: 'ECMAScript (TC39)',
            note: 'Spesifikasi bahasanya sendiri: `number` didefinisikan sebagai floating point 64-bit IEEE 754.',
          },
          {
            label: 'structuredClone()',
            href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone',
            source: 'MDN',
            note: 'Daftar tipe apa saja yang bisa dan tidak bisa disalin — fungsi termasuk yang tidak bisa.',
          },
        ),
      ],
    ),

    // Lessons 1.4 onward live in `js-dasar/` — sixteen written lessons in one module is a
    // file nobody opens twice. The split is purely for readability; numbering is still
    // assigned by `defineChapter`, so moving a lesson between files cannot create a gap.
    ...lessonsOperatorScope,
    ...lessonsArrayString,
    ...lessonsModulPraktik,
  ],
  quiz: [
    q(
      'fb1-q1',
      'Apa yang dicetak oleh kode ini?\n\nconst a = { n: 1 };\nconst b = a;\nb.n = 2;\nconsole.log(a.n);',
      ['1', '2', 'undefined', 'TypeError'],
      1,
      'Object adalah tipe reference. `b = a` menyalin alamatnya, bukan isinya — jadi `a` dan `b` menunjuk object yang sama. Mengubah lewat `b` terlihat lewat `a`. `const` tidak menghalangi ini karena ia hanya mengunci ikatan nama, bukan isi object.',
    ),
    q(
      'fb1-q2',
      'Kenapa `let` lebih aman daripada `var` di dalam loop yang memakai `setTimeout`?',
      [
        'Karena `let` lebih cepat dieksekusi',
        'Karena `let` membuat variabel baru di setiap iterasi, sementara `var` hanya punya satu variabel untuk seluruh loop',
        'Karena `var` tidak bisa dipakai di dalam loop',
        'Karena `setTimeout` hanya mendukung `let`',
      ],
      1,
      '`var` ber-scope fungsi, jadi seluruh iterasi berbagi satu variabel; saat callback akhirnya jalan, nilainya sudah mencapai akhir loop. `let` ber-scope blok dan di-*bind* ulang setiap iterasi, sehingga tiap callback menangkap nilainya sendiri.',
    ),
    q(
      'fb1-q3',
      'Manakah cara yang benar untuk mengecek apakah sebuah nilai adalah `null`?',
      [
        '`typeof nilai === "null"`',
        '`nilai == undefined`',
        '`nilai === null`',
        '`Number.isNaN(nilai)`',
      ],
      2,
      '`typeof null` mengembalikan `"object"` — bug historis yang tidak akan diperbaiki. `== undefined` bernilai true untuk `null` maupun `undefined`, jadi tidak membedakan keduanya. Perbandingan ketat `=== null` adalah satu-satunya cara yang tepat.',
    ),
    q(
      'fb1-q4',
      'Kenapa `0.1 + 0.2 === 0.3` bernilai `false`?',
      [
        'Karena ada bug di mesin JavaScript',
        'Karena `===` tidak bisa membandingkan desimal',
        'Karena angka desimal disimpan sebagai floating point biner yang tidak bisa merepresentasikan 0.1 secara tepat',
        'Karena hasilnya harus dibulatkan dulu dengan `Math.round`',
      ],
      2,
      'Ini perilaku standar IEEE 754 dan sama di Python, Java, maupun C. 0.1 dalam biner adalah pecahan berulang, persis seperti 1/3 dalam desimal. Bandingkan dengan toleransi (`Math.abs(a - b) < Number.EPSILON`), dan simpan uang sebagai bilangan bulat satuan terkecil.',
    ),
    q(
      'fb1-q5',
      'Apa fungsi `type="module"` pada tag `<script>`?',
      [
        'Membuat skrip diunduh lebih cepat',
        'Memberi file scope sendiri, mengaktifkan `import`/`export`, dan menyalakan mode strict otomatis',
        'Mengubah JavaScript menjadi TypeScript',
        'Membuat skrip berjalan sebelum HTML diparse',
      ],
      1,
      'Tanpa `type="module"`, variabel tingkat atas bocor ke lingkup global dan `import` tidak tersedia. Module juga otomatis berperilaku seperti `"use strict"` dan ditunda sampai HTML selesai diparse, seperti `defer`.',
    ),
    q(
      'fb1-q6',
      'Kode mana yang menyalin object secara mendalam (deep copy) dengan benar?',
      [
        '`const salinan = { ...asli }`',
        '`const salinan = Object.assign({}, asli)`',
        '`const salinan = structuredClone(asli)`',
        '`const salinan = asli`',
      ],
      2,
      'Spread dan `Object.assign` hanya menyalin satu lapis — object bersarang masih dibagi. `const salinan = asli` bahkan tidak menyalin apa pun. `structuredClone` menangani struktur bersarang, `Date`, `Map`, `Set`, dan referensi melingkar.',
    ),
  ],
  practice: {
    id: 'frontend-basic/javascript-dari-nol',
    title: 'Praktik bab ini',
    items: [
      'Jalankan satu baris JavaScript di console browser dan di Node.js, lalu catat satu API yang hanya ada di salah satunya',
      'Tulis ulang sebuah blok `var` menjadi `const`/`let` dan jelaskan kenapa masing-masing dipilih',
      'Buktikan sendiri perbedaan salinan primitif dan reference di console',
      'Buat satu fungsi yang melempar `Error` untuk input tidak valid, lalu tangani dengan `try`/`catch`',
      'Selesaikan modul logika To-Do List di sub-bab 1.16 tanpa menyentuh DOM sama sekali',
    ],
  },
});
