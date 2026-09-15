import {
  callout,
  code,
  compare,
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
  // 2026-08-05: revisi kedalaman narasi (plans/revisi-kedalaman-narasi/) — paragraf penghubung
  // ditambahkan di titik transisi kode yang sebelumnya kosong, tersebar di keempat file bab ini.
  // 2026-09-05: revisi studi kasus, error, dan kesalahan umum
  // (plans/revisi-studi-kasus-error-kesalahan/) — tiga bagian berjudul tetap ditambahkan tepat
  // sebelum Rangkuman di tiap sub-bab. Pesan error di dalamnya dijalankan sungguhan lebih dulu,
  // bukan ditulis dari ingatan.
  reviewedAt: '2026-09-05',
  lessons: [
    written(
      'apa-itu-javascript',
      'Apa itu JavaScript & Cara Menjalankannya',
      15,
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
              'Singkatan *Application Programming Interface*, dibaca huruf per huruf "a-pe-i". Terjemahan bebasnya adalah **daftar perintah siap pakai yang disediakan sesuatu, supaya programmu bisa menyuruhnya melakukan sesuatu**. Analogi yang paling dekat adalah daftar menu di rumah makan, sebab kamu tidak perlu tahu cara memasaknya, cukup tahu apa yang boleh dipesan dan bagaimana cara memesannya. `document` dan `fetch` adalah API yang disediakan browser, sedangkan `fs` dan `http` adalah API yang disediakan Node.js. Nanti di bab Backend, kata "API" juga dipakai untuk arti yang sedikit berbeda, yaitu layanan di server yang dipanggil lewat jaringan. Konsep dasarnya tetap sama, yakni sesuatu yang menyediakan perintah dan sesuatu yang memakainya.',
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
              'Artinya *proses*, yaitu satu program yang sedang berjalan di sistem operasi. Objek **Node.js** yang mewakili program**mu** sendiri: dari sini kamu membaca argumen baris perintah (`process.argv`), variabel lingkungan (`process.env`, tempat rahasia seperti password database disimpan), dan menghentikan program (`process.exit()`). Objek ini akan sering muncul lagi di bab Deployment.',
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
          'Ada satu cara sederhana untuk mengingat pembagiannya. Semua yang berhubungan dengan **layar, klik, dan halaman**, seperti `document`, `window`, dan `localStorage`, hanya masuk akal di browser, karena hanya di sanalah ada halaman yang dilihat orang. Sebaliknya, semua yang berhubungan dengan **berkas, folder, dan mesin**, seperti `fs`, `path`, dan `process`, hanya masuk akal di Node.js, karena di sanalah programmu benar-benar punya akses ke komputer.',
        ),
        p(
          'Pembagian itu bukan kebetulan, melainkan **keputusan keamanan yang disengaja**. Kalau halaman web bisa memanggil `fs`, situs mana pun yang kamu buka, termasuk yang jahat, bisa membaca dokumen di laptopmu tanpa kamu sadari. Browser sengaja tidak menyediakan perintah itu sama sekali, dan itulah sebabnya ketiadaannya bukan kekurangan yang perlu "diakali".',
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
        p(
          'Dua baris itu sengaja berbeda jenis, dan perbedaannya menjelaskan cara console bekerja. Baris pertama **memerintahkan** sesuatu dicetak, jadi teks `Halo dari browser` muncul karena kamu memintanya. Baris kedua tidak memerintahkan apa-apa dan hanya berupa perhitungan, tetapi hasilnya `31` tetap muncul, karena console selalu menampilkan nilai dari ekspresi terakhir yang diketik. Itulah sebabnya kamu tidak perlu menulis `console.log` saat sekadar mencoba sesuatu di sini. Satu hal yang sering membingungkan pemula, setelah `console.log(...)` dijalankan console juga menampilkan `undefined` di baris berikutnya. Itu bukan error, sebab `console.log` memang tidak mengembalikan nilai apa pun, dan console jujur menampilkan ketiadaan itu.',
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
        p(
          'Dua berkas ini bekerja berpasangan, dan yang menyambungkannya hanya satu baris berupa `<script type="module" src="./app.js">`. Atribut `src` menunjuk berkas JavaScript-nya, dan `./` di depannya berarti "di folder yang sama dengan berkas HTML ini". Letak tag itu di bagian bawah `<body>` juga bukan kebetulan, sebab browser membaca HTML dari atas ke bawah, jadi menaruh skrip di akhir menjamin seluruh isi halaman sudah ada saat skrip mulai berjalan. Perhatikan `app.js` sama sekali tidak menyebut `index.html`, sebab hubungannya satu arah dengan HTML yang memanggil JS. Isi `app.js` sendiri hanya menghitung selisih dua angka lalu mencetaknya lewat template literal, dan hasilnya muncul di console alih-alih di halaman karena `console.log` memang menulis ke sana.',
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
        p(
          'Ketiga perintah ini diketik di **terminal** dan bukan di dalam berkas JavaScript, dan itu perbedaan pertama yang perlu dipegang. `node --version` bukan sekadar formalitas, sebab kalau terminal menjawab `command not found`, artinya Node.js memang belum terpasang, dan itu jauh lebih baik diketahui sekarang daripada saat kamu bingung kenapa perintah berikutnya tidak jalan. `node app.js` menjalankan seluruh isi berkas dari atas ke bawah lalu keluar, persis seperti browser menjalankan `app.js` tadi, dan bedanya di sini tidak ada halaman, tidak ada `document`, dan hasilnya tercetak langsung di terminal. `node` tanpa argumen membuka REPL, padanan console browser yang berjalan di terminal, dan cocok untuk mencoba satu-dua baris tanpa membuat berkas. Perhatikan baris berawalan `#` adalah komentar di terminal dan bukan perintah, jadi tidak perlu ikut diketik.',
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
          'Kabar baiknya, bentuk pesan error selalu sama. Begitu kamu hafal strukturnya sekali, kamu bisa membaca error apa pun — bahkan dari library yang belum pernah kamu pakai. Perhatikan contoh berikut baris demi baris:',
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
        h2('Studi kasus di project nyata'),
        p(
          'Bayangkan kamu mengerjakan toko online kecil. Halaman produk menampilkan harga dalam rupiah, dan tiap malam ada skrip yang merangkum penjualan hari itu menjadi berkas CSV untuk dikirim ke pemilik toko. Halaman produk berjalan di browser, sedangkan skrip laporan berjalan di Node.js. Keduanya harus memformat rupiah dengan cara yang sama persis, sebab kalau berbeda, angka di layar dan angka di laporan akan terlihat seperti dua angka yang berbeda padahal sumbernya satu.',
        ),
        p(
          'Inilah bentuk paling sering dari materi sub-bab ini di pekerjaan sungguhan. Persoalannya bukan memilih browser atau Node.js, melainkan menulis satu berkas yang aman dipakai keduanya, lalu menaruh bagian yang khusus browser dan yang khusus Node.js di berkas terpisah. Berkas bersama itu tidak boleh menyentuh `document` maupun `node:fs`, karena begitu ia menyentuh salah satunya, ia langsung berhenti bisa dipakai di sisi yang lain.',
        ),
        code(
          'js',
          `
          // Berkas bersama. Sengaja tidak menyentuh document maupun node:fs,
          // supaya browser dan Node.js sama-sama bisa mengimpornya.

          const pemformat = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          });

          export function formatRupiah(angka) {
            if (typeof angka !== 'number' || Number.isNaN(angka)) {
              throw new TypeError(\`formatRupiah butuh number, dapat \${typeof angka}\`);
            }
            return pemformat.format(angka);
          }
          `,
          { filename: 'src/format-rupiah.js' },
        ),
        p(
          'Tiga hal di berkas ini yang membuatnya aman dipakai di dua runtime sekaligus. Pertama, satu-satunya API yang dipakai adalah `Intl.NumberFormat`, dan itu bagian dari bahasa JavaScript sendiri sehingga tersedia di browser maupun Node.js. Kedua, `pemformat` dibuat satu kali di luar fungsi, bukan di dalamnya, sebab membuat objek `Intl` termasuk operasi mahal dan memanggilnya untuk tiap harga di halaman berisi seratus produk akan terasa. Ketiga, fungsinya menolak masukan yang bukan number lewat `throw` alih-alih diam-diam mengembalikan teks aneh, dan itu yang membuat kesalahan ketahuan di tempat ia dibuat bukan di tempat ia terlihat.',
        ),
        code(
          'js',
          `
          // Hanya jalan di browser. Berkas inilah yang boleh menyentuh document.
          import { formatRupiah } from './format-rupiah.js';

          for (const el of document.querySelectorAll('[data-harga]')) {
            const harga = Number(el.dataset.harga);
            el.textContent = formatRupiah(harga);
          }
          `,
          { filename: 'src/halaman-produk.js' },
        ),
        code(
          'js',
          `
          // Hanya jalan di Node.js. Berkas inilah yang boleh menyentuh node:fs.
          import { writeFile } from 'node:fs/promises';
          import { formatRupiah } from '../src/format-rupiah.js';

          const penjualan = [
            { tanggal: '2026-09-01', total: 1250000 },
            { tanggal: '2026-09-02', total: 890000 },
          ];

          const baris = penjualan.map((r) => \`\${r.tanggal};\${formatRupiah(r.total)}\`);
          await writeFile('laporan.csv', \`tanggal;total\\n\${baris.join('\\n')}\\n\`, 'utf8');
          console.log(\`Laporan ditulis, \${baris.length} baris.\`);
          `,
          { filename: 'scripts/laporan.js' },
        ),
        p(
          'Dua berkas terakhir tidak pernah saling mengimpor, dan itu bukan kebetulan melainkan inti polanya. Yang mereka bagi hanya `format-rupiah.js` di tengah. `halaman-produk.js` mengambil angka dari atribut `data-harga` di HTML lalu menuliskannya kembali sebagai teks, sedangkan `laporan.js` mengambil angka dari array lalu menuliskannya ke berkas. Sumber data dan tujuan keluarannya berbeda total, tapi aturan formatnya satu, sehingga kalau nanti pemilik toko minta angkanya pakai koma desimal, kamu cukup mengubah satu berkas dan kedua sisi ikut berubah.',
        ),
        p(
          'Perhatikan juga `await` di `laporan.js` dipakai langsung di level teratas berkas tanpa dibungkus fungsi `async`. Ini disebut top-level await dan hanya bekerja di berkas yang diperlakukan sebagai module. Di Node.js, berkas `.js` diperlakukan sebagai module kalau `package.json` terdekat memuat `"type": "module"`, atau kalau berkasnya berekstensi `.mjs`. Kalau syarat itu tidak dipenuhi, baris `import` di atasnya sudah gagal lebih dulu sebelum `await` sempat jadi masalah.',
        ),
        callout(
          'tip',
          'Aturan praktis yang bisa langsung dipakai',
          'Kalau sebuah fungsi hanya mengubah data menjadi data, taruh di berkas bersama. Kalau ia membaca atau menulis sesuatu di luar program, entah itu halaman, berkas, atau jaringan, taruh di berkas yang khusus untuk satu runtime. Pemisahan ini juga yang membuat fungsi di berkas bersama gampang diuji, sebab ia tidak butuh browser dan tidak butuh berkas apa pun untuk dijalankan.',
        ),

        h2('Saat error-nya muncul'),
        p(
          'Empat error berikut adalah yang paling sering menghentikan orang di sub-bab ini. Teksnya ditulis apa adanya seperti yang muncul di terminal dan di console browser, sebab cara paling cepat mencari solusi adalah menyalin pesannya bukan menerka nama masalahnya.',
        ),
        code(
          'text',
          `
          $ node src/halaman-produk.js

          ReferenceError: document is not defined
              at Object.<anonymous> (/home/kamu/toko/src/halaman-produk.js:4:19)
          `,
          { caption: 'Kode browser dijalankan di Node.js.' },
        ),
        p(
          'Pesan ini persis membuktikan pembagian yang dibahas di awal sub-bab. `document` bukan bagian dari bahasa JavaScript, melainkan sesuatu yang disediakan browser, sehingga Node.js memang tidak punya nama itu sama sekali. Perhatikan jenis errornya `ReferenceError` dan bukan `TypeError`, dan itu memberi tahu bahwa namanya tidak ada sama sekali, bukan ada tapi bernilai kosong. Perbaikannya bukan menambahkan sesuatu ke Node.js, melainkan menjalankan berkas itu lewat halaman HTML di browser.',
        ),
        code(
          'text',
          `
          Access to script at 'file:///home/kamu/toko/src/halaman-produk.js'
          from origin 'null' has been blocked by CORS policy: Cross origin
          requests are only supported for protocol schemes: chrome,
          chrome-extension, chrome-untrusted, data, http, https, isolated-app.
          `,
          { caption: 'Halaman dibuka dengan klik dua kali, bukan lewat server lokal.' },
        ),
        p(
          "Bagian yang menjelaskan segalanya adalah `from origin 'null'`. Saat kamu membuka berkas HTML dengan klik dua kali, alamatnya berawalan `file://` dan browser menganggap halaman itu tidak punya asal yang jelas, sehingga aturan keamanan untuk module menolak memuatnya. Daftar protokol yang disebut di akhir pesan sudah menyiratkan perbaikannya, yaitu halamannya harus disajikan lewat `http`. Jalankan `npx serve` di folder project lalu buka alamat yang ia tampilkan, dan error ini hilang tanpa mengubah satu baris kode pun.",
        ),
        code(
          'text',
          `
          const { formatRupiah } = require('./src/format-rupiah.js');
                                   ^

          ReferenceError: require is not defined in ES module scope,
          you can use import instead
          `,
          { caption: 'Gaya CommonJS dipakai di berkas yang sudah berstatus module.' },
        ),
        p(
          'Error ini muncul karena dua gaya impor yang berbeda tercampur dalam satu project. `require` adalah gaya lama Node.js yang disebut CommonJS, sedangkan `import` adalah gaya standar yang dipakai materi ini. Begitu `package.json` memuat `"type": "module"`, seluruh berkas `.js` di project itu diperlakukan sebagai module dan `require` berhenti tersedia. Pesannya bahkan sudah menyebut perbaikannya sendiri di kalimat kedua. Kalau kamu menyalin potongan kode dari tutorial lama dan bertemu error ini, ubah `require` menjadi `import` alih-alih menghapus `"type": "module"`.',
        ),
        code(
          'text',
          `
          $ node --version
          bash: node: command not found
          `,
          { caption: 'Node.js belum terpasang, atau terminalnya belum dimuat ulang.' },
        ),
        p(
          'Pesan `command not found` datang dari terminal, bukan dari Node.js, dan bedanya penting. Artinya terminal sudah mencari program bernama `node` di seluruh folder yang ia kenal lalu tidak menemukannya. Dua penyebabnya jauh lebih sering daripada penyebab lain. Node.js memang belum dipasang, atau ia baru saja dipasang tapi terminal yang sedang terbuka masih memakai daftar folder yang lama. Coba tutup terminal lalu buka lagi sebelum menyimpulkan pemasangannya gagal.',
        ),
        table(
          ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
          [
            [
              '`ReferenceError: document is not defined`',
              'Kode yang butuh halaman dijalankan di Node.js',
              'Jalankan lewat berkas HTML di browser, dan pindahkan logika murninya ke berkas bersama',
            ],
            [
              "`blocked by CORS policy` dengan `origin 'null'`",
              'Halaman dibuka lewat `file://`, bukan lewat server',
              'Jalankan `npx serve` lalu buka alamat `http://localhost` yang muncul',
            ],
            [
              '`require is not defined in ES module scope`',
              'Gaya CommonJS dipakai di project yang sudah `"type": "module"`',
              'Ganti `require(...)` menjadi `import ... from ...`',
            ],
            [
              '`command not found`',
              'Program yang dipanggil tidak ada di daftar folder terminal',
              'Pasang Node.js versi LTS, lalu buka terminal baru',
            ],
            [
              "`Unexpected token '<'`",
              'Alamat `src` salah sehingga server mengirim halaman error HTML, dan browser mencoba membacanya sebagai JavaScript',
              'Periksa jalur di atribut `src`, biasanya kurang atau kelebihan `../`',
            ],
          ],
          'Lima error pertama yang paling sering ditemui saat menjalankan JavaScript.',
        ),

        h2('Kesalahan umum pemula'),
        p(
          'Kesalahan di bawah ini bukan kesalahan ceroboh. Semuanya justru muncul karena pembaca menerapkan satu pemahaman yang masuk akal ke situasi yang ternyata berbeda, dan itulah sebabnya kolom kedua sama pentingnya dengan kolom ketiga.',
        ),
        table(
          ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
          [
            [
              'Membuka `index.html` dengan klik dua kali di file manager',
              'Halamannya memang terbuka dan judulnya muncul, jadi sepertinya berhasil',
              'Alamatnya `file://`, sehingga tag `<script type="module">` diblokir dan tidak ada JavaScript yang jalan sama sekali',
            ],
            [
              'Menyalin contoh `fs.readFileSync` dari tutorial Node.js ke berkas yang dimuat halaman',
              'Kodenya jelas JavaScript, dan di video tutorialnya berjalan',
              'Browser sengaja tidak diberi akses ke berkas di komputer pengguna, jadi `node:fs` tidak akan pernah ada di sana',
            ],
            [
              'Menganggap `console.log` menampilkan hasil di halaman',
              'Kata *log* terdengar seperti menampilkan, dan hasilnya memang terlihat saat mencoba di console',
              'Tulisannya masuk ke panel Console di DevTools, sedangkan halaman tetap kosong sampai kamu mengubah `textContent` atau sejenisnya',
            ],
            [
              'Menutup DevTools lalu menyimpulkan tidak ada error',
              'Halamannya terlihat normal dan tidak ada tanda apa pun',
              'Error JavaScript tidak mengubah tampilan halaman, jadi satu-satunya tempat ia terlihat adalah panel Console yang sedang tertutup',
            ],
            [
              'Membaca baris terakhir stack trace lebih dulu',
              'Baris terakhir terasa seperti kesimpulan',
              'Stack trace dibaca dari atas, sebab baris teratas adalah tempat error benar-benar terjadi sedangkan baris bawah hanya rantai pemanggilnya',
            ],
            [
              'Memakai `Intl.NumberFormat` lalu membandingkan hasilnya dengan teks `Rp 1.250.000` yang diketik tangan',
              'Di layar keduanya terlihat sama persis',
              'Pemisah setelah `Rp` adalah spasi non-breaking `U+00A0`, bukan spasi biasa, sehingga perbandingannya bernilai `false`',
            ],
          ],
        ),
        p(
          'Dua baris pertama tabel itu punya akar yang sama, yaitu menganggap JavaScript adalah satu lingkungan tunggal. Begitu kamu memegang bahwa bahasanya sama tapi tempatnya berbeda, keduanya berhenti menjadi misteri. Baris terakhir jenisnya lain dan sengaja dimasukkan karena ia hampir selalu ditemukan lewat test yang gagal dengan pesan membingungkan, sebab kedua teks terlihat identik di layar padahal berbeda satu karakter. Kalau kamu perlu membandingkannya, bandingkan angkanya sebelum diformat bukan teks hasilnya.',
        ),
        callout(
          'warning',
          'Error merah di console tidak selalu berarti seluruh kode gagal',
          'JavaScript berhenti pada berkas atau module yang errornya muncul, sedangkan berkas lain yang sudah berjalan tetap berjalan. Karena itu halaman bisa terlihat setengah bekerja, dan itu justru menyesatkan. Biasakan membuka Console lebih dulu sebelum menyimpulkan apa pun tentang perilaku halaman.',
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
      20,
      'Tiga cara mendeklarasikan variabel, dan alasan teknis kenapa hanya dua yang masih dipakai.',
      [
        p(
          'Variabel adalah nama untuk sebuah nilai. JavaScript punya tiga kata kunci untuk membuatnya: `var`, `let`, dan `const`. Dalam kode modern kamu praktis hanya memakai dua — dan tahu **kenapa** yang ketiga ditinggalkan akan membantumu membaca kode lama tanpa bingung.',
        ),

        terms(
          {
            term: 'deklarasi',
            meaning:
              'Dari *declaration*, artinya **pernyataan atau pemberitahuan**. Ia adalah baris yang memperkenalkan sebuah nama baru ke dalam program, misalnya `const namaSitus = "Ruang Belajar"`. Kata "mendeklarasikan" berarti memberi tahu JavaScript bahwa nama itu ada dan mulai sekarang boleh dipakai. Ini berbeda dari sekadar mengisi nilai, sebab deklarasi hanya boleh dilakukan **sekali** untuk satu nama di satu scope, dan mengulanginya dengan `let` atau `const` justru menghasilkan `SyntaxError`.',
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
              'Dibaca "i-myu-ta-bel", artinya **tidak bisa diubah isinya**. Lawan katanya *mutable* (bisa diubah). Di JavaScript, semua nilai primitif seperti angka, teks, dan boolean bersifat immutable, sehingga `"halo".toUpperCase()` tidak mengubah teks aslinya, melainkan menghasilkan teks baru. Sebaliknya array dan object bersifat mutable, dan justru sifat itulah sumber banyak bug "kok ikut berubah?" yang dibahas di Sub-bab 1.3.',
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
              'Dibaca "ke-mel-keis". Gaya penamaan tanpa spasi di mana kata pertama huruf kecil semua dan setiap kata berikutnya diawali huruf besar: `jumlahKunjungan`, `sisaHariLangganan`. Disebut *camel* (unta) karena huruf besarnya naik-turun seperti punuk. Ini adalah idiom resmi JavaScript, bukan `snake_case` gaya Python dan bukan `PascalCase` yang di JavaScript sudah punya arti khusus untuk nama class dan nama komponen React.',
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
          'Urutan berpikirnya, tulis `const` lebih dulu. Kalau ternyata linter atau runtime protes karena kamu perlu menugaskan ulang, baru ubah jadi `let`. Cara ini membuat setiap `let` di kodemu menjadi sinyal bahwa "yang ini memang berubah", bukan sekadar kebiasaan.',
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
        p(
          'Perhatikan pilihan kata kuncinya bukan soal jenis nilai, melainkan soal **apakah nilainya akan diganti nanti**. `namaSitus` tidak pernah berubah sepanjang program, jadi `const`. `jumlahKunjungan` memang dirancang untuk naik, jadi `let`. Baris yang dikomentari di bawah menunjukkan apa yang terjadi bila aturan itu dilanggar, sebab `TypeError` muncul **saat program berjalan** dan bukan saat diketik, dan pesannya menyebut langsung "Assignment to constant variable" sehingga penyebabnya tidak perlu ditebak. Satu hal yang membingungkan di awal, baris `jumlahKunjungan = jumlahKunjungan + 1` membaca nilai lama di sisi kanan lebih dulu lalu menugaskan hasilnya ke nama yang sama di sisi kiri. Tanda `=` di JavaScript berarti "isi dengan", bukan "sama dengan" seperti di matematika.',
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
        p(
          "Bandingkan baris yang boleh dengan baris yang dikomentari, karena di situlah letak seluruh perbedaannya. `pengguna.level = 2` mengubah **isi** object, sebab objectnya masih object yang sama dan hanya salah satu propertinya berganti nilai. Nama `pengguna` tetap menunjuk ke alamat yang sama, sehingga `const` tidak merasa dilanggar. Sedangkan `pengguna = { nama: 'Lain' }` membuat object yang benar-benar baru di alamat baru dan meminta nama `pengguna` menunjuk ke sana, dan **itu** yang dilarang `const`. Cara mengingatnya, `const` menjaga panah dan bukan kotak yang ditunjuk panah itu. Pasangan array di bawahnya menegaskan hal yang sama dengan cara berbeda, sebab `push` menambah isi kotak (boleh), sedangkan `daftar = []` menyodorkan kotak baru (dilarang).",
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
          'Kedua variabel dideklarasikan di tempat yang **persis sama**, yaitu di dalam blok `if`, tetapi hanya satu yang masih hidup setelah blok itu ditutup. `var` mengabaikan kurung kurawal `if` sepenuhnya, sebab satu-satunya batas yang ia kenal adalah batas fungsi, jadi `pakaiVar` seolah-olah dideklarasikan langsung di dalam `contoh()`. `let` berhenti di kurung kurawal terdekat, sehingga `pakaiLet` benar-benar lenyap begitu blok `if` selesai, dan mengaksesnya menghasilkan `ReferenceError` yang jelas menyebut namanya. Kebocoran itu terdengar seperti kemudahan padahal justru sumber masalah, sebab variabel yang lolos dari bloknya bisa bertabrakan dengan nama lain di bagian bawah fungsi yang sama, dan tidak ada peringatan apa pun ketika itu terjadi.',
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
        p(
          'Yang membuat contoh ini menjadi bug sungguhan, bukan sekadar keanehan, adalah **jeda waktunya**. `setTimeout` tidak menjalankan fungsinya saat itu juga, melainkan menitipkannya untuk dijalankan setelah kode yang sedang berjalan selesai, dan itu berlaku bahkan dengan jeda `0`. Jadi ketiga loop selesai lebih dulu, baru ketiga fungsi dijalankan. Pada versi `var`, ketiganya membaca satu variabel `i` yang sama, dan pada saat mereka akhirnya dijalankan nilainya sudah `3`, yaitu angka yang membuat loop berhenti. Pada versi `let`, tiap putaran menciptakan `j` yang benar-benar baru, sehingga masing-masing fungsi membawa nilainya sendiri. Pola "nilai yang dibaca terlambat" ini akan kamu temui lagi di React, ketika sebuah handler menampilkan nilai state dari render sebelumnya, sebab akarnya persis sama dengan yang terjadi di sini.',
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
        h2('Studi kasus di project nyata'),
        p(
          'Kamu sedang membuat baris tombol filter di halaman katalog. Ada tombol Semua, Baru, dan Diskon, dan tiap tombol harus menyaring daftar produk saat diklik. Kodenya kamu tulis sekali lalu dipasang ke ketiga tombol lewat perulangan, karena menulis tiga fungsi yang isinya sama persis jelas mubazir. Halaman terbuka, tombolnya bisa diklik, tapi ketiganya menghasilkan filter yang sama.',
        ),
        p(
          'Bug ini termasuk yang paling sering dialami orang saat pertama kali memasang event handler di dalam loop, dan penyebabnya persis materi scope di sub-bab ini. Perbandingan di bawah memakai `setTimeout` alih-alih `addEventListener` supaya bisa kamu jalankan langsung di Node.js tanpa halaman, tapi perilakunya identik karena keduanya sama-sama menjalankan fungsi setelah loop-nya selesai.',
        ),
        compare(
          {
            title: 'Dengan `var`, ketiganya sama',
            lang: 'js',
            code: `
            const filter = ['semua', 'baru', 'diskon'];

            for (var i = 0; i < filter.length; i++) {
              setTimeout(() => console.log('klik ->', filter[i]), 0);
            }

            // klik -> undefined
            // klik -> undefined
            // klik -> undefined
            `,
            notes: ['Satu `i` dipakai bersama, dan saat fungsinya jalan nilainya sudah 3'],
          },
          {
            title: 'Dengan `let`, tiap putaran punya salinan',
            lang: 'js',
            code: `
            const filter = ['semua', 'baru', 'diskon'];

            for (let i = 0; i < filter.length; i++) {
              setTimeout(() => console.log('klik ->', filter[i]), 0);
            }

            // klik -> semua
            // klik -> baru
            // klik -> diskon
            `,
            notes: [
              '`let` membuat `i` baru tiap putaran, jadi tiap fungsi memegang nilainya sendiri',
            ],
          },
        ),
        p(
          'Yang berbeda hanya satu kata di kolom kiri dan kanan, tapi akibatnya berlawanan. Dengan `var`, hanya ada **satu** variabel `i` untuk seluruh loop, dan ketiga fungsi menyimpan rujukan ke variabel yang sama itu. Loop selesai lebih dulu sebelum satu pun fungsi dijalankan, dan saat itu `i` sudah bernilai 3, sehingga `filter[3]` menghasilkan `undefined` tiga kali. Dengan `let`, JavaScript membuat variabel `i` yang benar-benar baru pada tiap putaran, jadi fungsi pertama memegang `i` bernilai 0, fungsi kedua memegang `i` bernilai 1, dan seterusnya.',
        ),
        p(
          'Perhatikan keluaran kolom kiri bukan angka 3 melainkan `undefined`, dan itu yang membuat bug ini sulit dilacak pemula. Kalau pesannya menyebut angka 3, kamu akan langsung curiga pada `i`. Karena yang muncul justru `undefined`, tersangka pertama yang terpikir biasanya array `filter`, padahal array itu baik-baik saja. Ini contoh kenapa membaca gejala saja tidak cukup dan kamu perlu tahu mekanismenya.',
        ),
        p(
          'Bagian kedua studi kasus ini menyangkut `const`. Halaman katalog yang sama biasanya punya satu objek pengaturan yang dipakai banyak berkas, dan di situlah orang keliru mengira `const` sudah cukup melindunginya.',
        ),
        code(
          'js',
          `
          // src/pengaturan.js
          export const pengaturan = {
            perHalaman: 12,
            urutan: 'terbaru',
          };

          // src/daftar-produk.js
          import { pengaturan } from './pengaturan.js';

          function tampilkanHalamanCetak() {
            pengaturan.perHalaman = 100;   // niatnya sementara, nyatanya permanen
            render();
          }
          `,
          { filename: 'Dua berkas yang berbagi satu objek' },
        ),
        p(
          '`pengaturan` dideklarasikan dengan `const`, dan itu benar-benar mencegah satu hal saja, yaitu nama `pengaturan` menunjuk ke objek lain. Isi objeknya tetap bisa diubah siapa pun yang mengimpornya. Karena module di JavaScript hanya dijalankan sekali lalu hasilnya dipakai bersama, `perHalaman` yang diubah menjadi 100 di satu berkas akan terbaca 100 juga di seluruh berkas lain sampai halaman dimuat ulang. Pengguna yang menekan tombol cetak lalu kembali ke katalog akan melihat 100 produk per halaman tanpa pernah memintanya.',
        ),
        code(
          'js',
          `
          // src/pengaturan.js
          // Object.freeze membuat percobaan mengubah isinya gagal, bukan diam-diam berhasil.
          export const pengaturan = Object.freeze({
            perHalaman: 12,
            urutan: 'terbaru',
          });

          // src/daftar-produk.js
          import { pengaturan } from './pengaturan.js';

          function tampilkanHalamanCetak() {
            // Buat salinan untuk kebutuhan sesaat, jangan sentuh aslinya.
            render({ ...pengaturan, perHalaman: 100 });
          }
          `,
          { filename: 'Perbaikannya' },
        ),
        p(
          '`Object.freeze` mengubah kesalahan yang tadinya diam menjadi kesalahan yang bersuara. Di berkas module, yang otomatis berjalan dalam mode strict, percobaan menulis ke objek beku melempar `TypeError` alih-alih diabaikan. Baris `render({ ...pengaturan, perHalaman: 100 })` menunjukkan pola penggantinya, yaitu membuat objek baru berisi seluruh isi objek lama dengan satu nilai ditimpa. Aslinya tidak tersentuh, dan berkas lain tetap melihat 12.',
        ),
        callout(
          'info',
          '`Object.freeze` hanya membekukan satu lapis',
          'Kalau objekmu punya objek di dalamnya, isi objek dalam itu masih bisa diubah. Untuk pengaturan sederhana satu lapis ini sudah cukup, dan untuk struktur bersarang kamu perlu membekukan tiap lapisnya sendiri. Perbedaan satu lapis dan banyak lapis ini dibahas lebih jauh di Sub-bab 1.3 saat membahas menyalin object.',
        ),

        h2('Saat error-nya muncul'),
        p(
          'Tiga error berikut hampir selalu berasal dari materi sub-bab ini, dan ketiganya justru kabar baik karena ia menghentikanmu di tempat kesalahan dibuat.',
        ),
        code(
          'text',
          `
          console.log(total);
                      ^

          ReferenceError: Cannot access 'total' before initialization
          `,
          { caption: 'Variabel `const` atau `let` dipakai sebelum barisnya dijalankan.' },
        ),
        p(
          'Perhatikan kalimatnya berbunyi `Cannot access` dan bukan `is not defined`, dan perbedaan dua kata itu justru petunjuk terbesarnya. `is not defined` berarti namanya memang tidak ada di mana pun, sedangkan `Cannot access ... before initialization` berarti namanya ada, JavaScript sudah tahu ia akan dideklarasikan di berkas ini, tapi barisnya belum dijalankan. Inilah Temporal Dead Zone yang dibahas di atas. Perbaikannya memindahkan pemakaian ke bawah deklarasinya, bukan mengganti `const` menjadi `var`.',
        ),
        code(
          'text',
          `
          pajak = 0.12;
                ^

          TypeError: Assignment to constant variable.
          `,
          { caption: 'Nama yang dideklarasikan `const` diarahkan ke nilai lain.' },
        ),
        p(
          'Error ini sering membingungkan karena orang mengira `const` juga akan melarang `pajak.nilai = 0.12`, padahal tidak. Yang dilarang hanya mengarahkan ulang namanya. Kalau kamu bertemu error ini pada variabel yang memang perlu berubah nilainya, seperti penghitung di dalam loop atau penampung hasil sementara, ganti deklarasinya menjadi `let`. Kalau ia justru tidak seharusnya berubah, error ini baru saja menyelamatkanmu.',
        ),
        code(
          'text',
          `
          const c = Object.freeze({ perHalaman: 12 });
          c.perHalaman = 100;
            ^

          TypeError: Cannot assign to read only property 'perHalaman'
          of object '#<Object>'
          `,
          { caption: 'Isi objek beku dicoba diubah di dalam module.' },
        ),
        p(
          'Bentuk error ini yang membuat `Object.freeze` berguna. Tanpa `freeze`, baris yang sama berjalan mulus dan bugnya baru terlihat berjam-jam kemudian di bagian aplikasi yang sama sekali lain. Perlu dicatat error ini hanya muncul di mode strict, dan seluruh berkas module otomatis berada di mode strict. Kalau kamu mencoba potongan yang sama di console browser di halaman biasa, penulisannya diabaikan tanpa suara.',
        ),
        table(
          ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
          [
            [
              "`Cannot access 'x' before initialization`",
              'Nama dipakai sebelum baris `let` atau `const`-nya dijalankan',
              'Pindahkan pemakaian ke bawah deklarasinya',
            ],
            [
              '`x is not defined`',
              'Namanya memang tidak pernah dideklarasikan, atau salah ketik',
              'Periksa ejaannya, lalu periksa apakah ia dideklarasikan di scope yang lain',
            ],
            [
              '`Assignment to constant variable.`',
              'Nama `const` diarahkan ke nilai lain',
              'Ganti ke `let` bila memang perlu berubah, atau perbaiki logikanya bila tidak',
            ],
            [
              '`Cannot assign to read only property`',
              'Isi objek hasil `Object.freeze` dicoba ditulis',
              'Buat objek baru dengan `{ ...lama, kunci: baru }` alih-alih menimpa',
            ],
            [
              "`Identifier 'x' has already been declared`",
              'Satu nama dideklarasikan dua kali di scope yang sama',
              'Hapus salah satu, atau ganti nama yang kedua',
            ],
          ],
          'Kelima error ini muncul sebelum atau tepat saat baris bermasalah dijalankan.',
        ),

        h2('Kesalahan umum pemula'),
        p(
          'Kesalahan berikut lahir dari satu kesalahpahaman yang sama, yaitu menganggap `const` bicara tentang nilainya. `const` sebenarnya bicara tentang **namanya**, dan begitu itu dipegang, sebagian besar baris di bawah ini menjadi jelas dengan sendirinya.',
        ),
        table(
          ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
          [
            [
              'Memakai `let` untuk semua variabel supaya aman',
              'Toh `let` bisa segalanya, jadi kenapa repot memilih',
              'Pembaca berikutnya kehilangan informasi. `const` memberi tahu bahwa nama ini tidak akan berpindah, dan itu satu hal lebih sedikit yang perlu ia lacak',
            ],
            [
              'Mengira `const` membuat isi array dan object ikut beku',
              'Kata *constant* memang terdengar seperti tidak bisa berubah sama sekali',
              '`const arr = []` tetap mengizinkan `arr.push(1)`, sebab yang dikunci hanya nama `arr` bukan isinya',
            ],
            [
              'Mengganti `const` menjadi `var` saat bertemu error Temporal Dead Zone',
              'Errornya memang langsung hilang',
              'Nilainya jadi `undefined` dan bug berpindah ke tempat lain yang jauh lebih sulit dilacak. Yang tadinya berhenti dengan pesan jelas kini berjalan dengan data salah',
            ],
            [
              'Memasang event handler di dalam loop dengan `var`',
              'Loop-nya jelas benar, dan kalau ditambah `console.log` di dalam loop angkanya juga benar',
              'Fungsi handler baru berjalan setelah loop selesai, dan saat itu satu-satunya `i` yang ada sudah bernilai akhir',
            ],
            [
              'Menaruh deklarasi variabel di paling atas berkas biar rapi',
              'Terlihat teratur dan mirip gaya bahasa lain',
              'Jarak antara deklarasi dan pemakaiannya melebar, sehingga pembaca harus menggulir bolak-balik. Deklarasikan sedekat mungkin dengan pemakaian pertamanya',
            ],
            [
              'Menamai variabel `data`, `temp`, atau `arr2`',
              'Isinya memang data, dan namanya cepat diketik',
              'Nama itu tidak menyebut isinya, sehingga tiga bulan lagi kamu harus membaca kodenya untuk mengingat apa isinya. `produkTerfilter` menghemat waktu itu',
            ],
          ],
        ),
        p(
          'Baris ketiga adalah yang paling merugikan, dan itu perlu ditegaskan sendiri. Temporal Dead Zone sering terasa seperti gangguan, padahal ia justru fitur. `var` tidak punya Temporal Dead Zone, sehingga variabel yang dipakai terlalu awal bernilai `undefined` dan program terus berjalan membawa nilai kosong itu ke mana-mana. Error `Cannot access ... before initialization` menghentikanmu tepat di baris yang salah, sedangkan `undefined` membiarkanmu mencarinya di tempat yang keliru.',
        ),
        callout(
          'tip',
          'Aturan memilih yang jarang meleset',
          'Mulai dengan `const` untuk semuanya. Ubah menjadi `let` hanya ketika kamu benar-benar bertemu error `Assignment to constant variable`, sebab error itulah bukti bahwa nilainya memang perlu berpindah. Jangan pernah memakai `var` di kode baru, dan kalau kamu menemukannya di kode lama, ubah menjadi `const` lebih dulu lalu jalankan test.',
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
      20,
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
              'Singkatan *Not a Number*, dibaca "nan", artinya **bukan sebuah angka**. Nilai khusus yang muncul ketika sebuah perhitungan angka gagal menghasilkan angka yang sah, misalnya `Number("12abc")` atau `0 / 0`. Dua keanehannya perlu diingat. Pertama, `typeof NaN` justru menjawab `"number"`. Kedua, `NaN === NaN` bernilai `false`, menjadikannya satu-satunya nilai di JavaScript yang tidak sama dengan dirinya sendiri. Karena itu satu-satunya cara mengeceknya adalah `Number.isNaN(nilai)`.',
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
        p(
          "Enam baris pertama berperilaku persis seperti dugaanmu, sebab `typeof` mengembalikan **teks** berisi nama tipenya sehingga hasilnya selalu berupa string. Itu sebabnya pengecekan ditulis `typeof x === 'string'` dengan tanda kutip. Tiga baris berikutnya mulai jujur soal keterbatasannya. Array menjawab `'object'` karena di JavaScript array memang **sejenis object** dengan kunci berupa angka, sehingga `typeof` tidak bisa dipakai untuk membedakan keduanya, dan untuk itu ada `Array.isArray()`. Fungsi menjawab `'function'` meski sebenarnya juga object, dan itu pengecualian yang kebetulan berguna. Baris terakhir adalah cacat sejarah, sebab `null` seharusnya menjawab `'null'` tetapi implementasi pertama JavaScript keliru dan memperbaikinya sekarang akan merusak situs yang tak terhitung jumlahnya. Kesimpulan praktisnya, `typeof` andal untuk primitif tapi tidak untuk membedakan jenis-jenis object.",
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
        p(
          'Tiga contoh pertama semuanya menghasilkan `undefined`, tetapi lewat jalan yang berbeda, dan itu inti perbedaannya. `belumDiisi` dideklarasikan tanpa nilai, jadi JavaScript mengisinya sendiri. `pengguna.email` menghasilkan `undefined` karena property itu memang tidak pernah ada. Perhatikan JavaScript **tidak melempar error** untuk property yang tidak ditemukan, dan sifat pemaaf itu justru yang membuat salah ketik nama property sulit terdeteksi. Sebaliknya `fotoProfil = null` ditulis manusia, dan pesannya jelas bahwa nilainya sudah dicek dan memang tidak ada. Dua baris terakhir menegaskan konsekuensi praktisnya, sebab `==` menganggap keduanya sama karena sama-sama berarti "kosong", sementara `===` membedakannya karena tipenya berlainan. Karena itulah `nilai == null` menjadi satu-satunya pemakaian `==` yang banyak tim izinkan, karena ia menangkap keduanya sekaligus dalam satu pemeriksaan.',
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
        p(
          'Angka `0.30000000000000004` itu bukan kesalahan JavaScript, dan komentar di tengah contoh sudah menyebut alasannya, tetapi analogi pecahannya layak diperjelas. Dalam desimal, sepertiga tidak bisa ditulis tepat karena `0,333…` akan selalu terpotong di suatu titik. Komputer menyimpan angka dalam basis dua, dan di basis itu **`0,1` mengalami nasib yang sama**, sebab ia jadi deretan tak berujung yang harus dipotong. Menjumlahkan dua angka yang sudah dibulatkan menghasilkan pembulatan yang meleset sedikit, dan itulah `…04` di ujung. Baris terakhir menunjukkan cara menghadapinya, yaitu alih-alih menanyakan "apakah persis sama", tanyakan "apakah selisihnya lebih kecil dari toleransi". `Number.EPSILON` adalah selisih terkecil yang masih bisa dibedakan JavaScript, dan `Math.abs` membuat perbandingannya berlaku ke dua arah, sehingga selisih `-0,0000001` sama diterimanya dengan `+0,0000001`.',
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
        p(
          'Blok ini memuat dua batasan yang berbeda. Yang pertama soal **ukuran**. Di atas `Number.MAX_SAFE_INTEGER`, dua bilangan bulat yang berbeda bisa dinilai sama karena keduanya dibulatkan ke angka tersimpan yang sama, dan perhatikan tidak ada error maupun peringatan saat itu terjadi. Akhiran `n` pada `9007199254740992n` menandai **BigInt**, tipe terpisah yang dirancang untuk bilangan bulat sebesar apa pun, dan ia menjawab `false` dengan benar. Batasan kedua soal **kegagalan konversi**, sebab `Number(\'12abc\')` menghasilkan `NaN` yang meski namanya "Not a Number" justru bertipe `number`. Itu terdengar aneh sampai kamu memahaminya sebagai "angka yang tidak sah" alih-alih "bukan angka". Sifatnya yang paling penting ada di baris berikutnya, yaitu `NaN === NaN` bernilai `false`, satu-satunya nilai di JavaScript yang tidak sama dengan dirinya sendiri. Itulah sebabnya mengecek `NaN` **wajib** lewat `Number.isNaN()`, karena perbandingan biasa tidak akan pernah berhasil.',
        ),

        h2('Primitif disalin, reference dibagikan'),
        p(
          'Inilah inti sub-bab ini, dan kalau hanya satu hal yang kamu bawa pulang dari halaman ini, biarlah bagian ini yang tersisa. Perbedaannya terdengar teknis, tapi akibatnya sangat praktis: ia menjelaskan kenapa sebuah data "ikut berubah" padahal kamu merasa tidak pernah menyentuhnya.',
        ),
        p(
          'Duduk perkaranya begini. Setiap variabel sebenarnya adalah sebuah kotak kecil. Untuk nilai **primitif**, isi kotak itu adalah nilainya sendiri, sehingga angka `10` benar-benar tersimpan di dalam kotak bernama `a`. Untuk nilai **reference**, isi kotaknya bukan datanya, melainkan **secarik kertas berisi alamat**, sedangkan datanya sendiri tersimpan di tempat lain. Menyalin variabel selalu berarti menyalin isi kotaknya. Untuk primitif, yang tersalin adalah nilainya, sedangkan untuk reference yang tersalin hanyalah alamatnya, dan dua alamat yang sama tentu menunjuk ke rumah yang sama.',
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
        p(
          'Kedua contoh punya bentuk yang identik, yaitu buat variabel, salin ke variabel kedua, ubah yang kedua, lalu periksa yang pertama, dan justru karena bentuknya sama, hasil yang berbeda jadi mudah dilihat. Pada blok primitif, `let b = a` menyalin angka `10` itu sendiri ke kotak `b`, dan sejak saat itu keduanya tidak punya hubungan apa pun, jadi `b = 20` tidak menyentuh `a`. Pada blok reference, `const y = x` menyalin **alamatnya**, sehingga `x` dan `y` menjadi dua nama untuk satu object yang sama. Mengubah `y.skor` sama saja dengan mengubah `x.skor`, karena tidak pernah ada object kedua. Perhatikan `const` di sana tidak menghalangi apa pun, persis seperti yang dijelaskan di sub-bab variabel, sebab yang dikunci `const` adalah alamatnya, dan `y.skor = 20` tidak mengubah alamat.',
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

          // Dibungkus console.log karena '{' di awal baris dibaca sebagai blok, bukan object
          console.log({ a: 1 } === { a: 1 });   // false — dua object berbeda, isi kebetulan sama
          console.log([1, 2] === [1, 2]);       // false

          const satu = { a: 1 };
          const dua = satu;
          satu === dua;                // true  — object yang sama persis
          `,
        ),
        p(
          'Dua baris pertama berperilaku sesuai naluri, sebab primitif dibandingkan **isinya** sehingga angka 10 mana pun sama dengan angka 10 lainnya. Dua baris di tengah adalah yang mengejutkan, karena isi keduanya identik sampai ke koma terakhir tetapi hasilnya tetap `false`, sebab yang dibandingkan adalah **alamat**, dan setiap kali kamu menulis `{ ... }` JavaScript membuat object baru di alamat baru. Tiga baris terakhir menutup logikanya, sebab `dua` tidak membuat object baru melainkan hanya menyalin alamat dari `satu` sehingga perbandingannya `true`. Konsekuensi praktis yang perlu dipegang, **tidak ada cara membandingkan isi dua object dengan `===`**. Untuk itu kamu harus membandingkan property yang kamu pedulikan satu per satu, atau memakai fungsi pembanding dari library.',
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
        p(
          'Contoh ini sengaja menunjukkan salinan dangkal **berhasil dulu, baru gagal**, dan urutan itu yang membuatnya berbahaya. Mengubah `dangkal.nama` tidak menyentuh `asli.nama`, karena `nama` berisi string, sebuah primitif yang ikut tersalin nilainya. Sampai di sini semuanya terasa benar. Tapi `alamat` berisi object, dan spread hanya menyalin **alamatnya**, sehingga `dangkal.alamat` dan `asli.alamat` masih menunjuk object yang sama persis, dan mengubah kotanya lewat salinan ikut mengubah aslinya. Inilah sebabnya bug seperti ini sulit dilacak, sebab kodenya terlihat benar, pengujian pada data sederhana lolos, dan kegagalannya baru muncul pada data yang kebetulan bersarang. `structuredClone` menelusuri sampai lapisan terdalam dan membuat object baru di setiap tingkat, sehingga `dalam.alamat` benar-benar terpisah.',
        ),
        callout(
          'tip',
          '`structuredClone` menggantikan trik lama',
          'Dulu orang memakai `JSON.parse(JSON.stringify(obj))`. Trik itu membuang `Date` (jadi string), `Map`, `Set`, `undefined`, dan fungsi — dan gagal total pada struktur melingkar. `structuredClone` menangani semuanya dan sudah tersedia di semua browser modern serta Node 17+.',
        ),

        divider,
        h2('Studi kasus di project nyata'),
        p(
          'Kamu mengerjakan keranjang belanja untuk toko yang mengirim barang lewat kurir. Ongkos kirim dihitung bertingkat, yaitu sampai 0,3 kilogram kena tarif pertama, dan di atas itu naik ke tarif kedua. Pelanggan memasukkan dua barang dengan berat 0,1 dan 0,2 kilogram, jumlahnya jelas pas 0,3 kilogram, tapi sistem menagih tarif kedua. Pelanggan protes, dan saat kamu cek satu per satu, kedua angkanya benar.',
        ),
        p(
          'Ini bukan bug ketik dan bukan salah rumus. Ini akibat langsung dari cara komputer menyimpan angka pecahan, yang sudah disinggung di bagian angka di atas. Sekarang kita lihat bentuknya di kode yang sebenarnya.',
        ),
        code(
          'js',
          `
          const barang = [
            { nama: 'Kaos', beratKg: 0.1 },
            { nama: 'Topi', beratKg: 0.2 },
          ];

          const totalKg = barang.reduce((jumlah, b) => jumlah + b.beratKg, 0);

          console.log(totalKg);            // 0.30000000000000004
          console.log(totalKg > 0.3);      // true  <- inilah bugnya

          const ongkir = totalKg > 0.3 ? 18000 : 12000;
          console.log(ongkir);             // 18000, seharusnya 12000
          `,
          { filename: 'src/hitung-ongkir.js — versi yang bermasalah' },
        ),
        p(
          'Baris `console.log(totalKg)` memperlihatkan penyebabnya secara telanjang. Nilai 0,1 dan 0,2 tidak bisa disimpan persis dalam format biner yang dipakai JavaScript, sama seperti sepertiga tidak bisa ditulis habis dalam desimal. Selisihnya sangat kecil, hanya di digit ke tujuh belas, tapi perbandingan `>` tidak mengenal kata kecil. Nilainya memang lebih besar dari 0,3, jadi jawabannya `true`, dan pelanggan membayar enam ribu rupiah lebih mahal.',
        ),
        p(
          'Yang membuat bug seperti ini bertahan lama di produksi adalah ia tidak muncul di semua kasus. Kalau pelanggan membeli barang 0,25 dan 0,05 kilogram, jumlahnya bulat 0,3 dan tarifnya benar. Jadi laporan bug-nya akan berbunyi kadang salah kadang benar, dan itu jenis laporan yang paling sulit ditindaklanjuti kalau kamu belum tahu mekanismenya.',
        ),
        code(
          'js',
          `
          // Simpan berat dalam gram, yaitu bilangan bulat.
          // Satuan terkecil disimpan utuh, dan pembagian hanya dilakukan saat menampilkan.
          const barang = [
            { nama: 'Kaos', beratGram: 100 },
            { nama: 'Topi', beratGram: 200 },
          ];

          const totalGram = barang.reduce((jumlah, b) => jumlah + b.beratGram, 0);

          console.log(totalGram);          // 300
          console.log(totalGram > 300);    // false

          const ongkir = totalGram > 300 ? 18000 : 12000;
          console.log(ongkir);             // 12000

          // Baru diubah ke kilogram saat ditampilkan ke pengguna.
          const tampil = \`\${(totalGram / 1000).toFixed(1)} kg\`;
          `,
          { filename: 'src/hitung-ongkir.js — perbaikannya' },
        ),
        p(
          'Perbaikannya bukan membulatkan hasilnya, melainkan mengubah satuan yang disimpan. Bilangan bulat sampai sekitar sembilan ribu triliun disimpan JavaScript dengan tepat tanpa pembulatan sama sekali, jadi selama seluruh perhitungan memakai gram, tidak ada satu pun titik yang bisa menyelipkan selisih. Pembagian menjadi kilogram baru terjadi di baris terakhir, yaitu saat angkanya diubah menjadi teks untuk dilihat manusia, dan di titik itu selisih kecil sudah tidak berpengaruh apa pun.',
        ),
        callout(
          'tip',
          'Aturan yang berlaku untuk uang juga',
          'Alasan yang sama membuat harga sebaiknya disimpan dalam satuan terkecil mata uangnya. Untuk rupiah itu berarti menyimpan rupiah utuh dan menghindari desimal sama sekali, dan untuk mata uang bersen seperti dolar itu berarti menyimpan sen. Kalau sebuah kolom database bernama `harga` bertipe `float`, itu tanda bahaya yang layak diangkat sebelum kolomnya terlanjur berisi jutaan baris.',
        ),
        p(
          'Bagian kedua studi kasus ini menyangkut penyalinan object, dan situasinya juga sangat sering. Halaman pengaturan profil punya tombol Simpan dan tombol Batal. Saat pengguna mulai mengetik, kamu menyalin data aslinya supaya kalau ia menekan Batal, versi lama bisa dikembalikan.',
        ),
        code(
          'js',
          `
          const profilAsli = {
            nama: 'Sari',
            alamat: { kota: 'Bandung', pos: '40115' },
            minat: ['musik'],
          };

          const draf = { ...profilAsli };     // terlihat seperti salinan utuh

          draf.nama = 'Sari Dewi';            // hanya mengubah draf
          draf.alamat.kota = 'Jakarta';       // diam-diam mengubah profilAsli juga
          draf.minat.push('film');            // ini pun mengubah profilAsli

          console.log(profilAsli.nama);       // 'Sari'         <- aman
          console.log(profilAsli.alamat.kota) // 'Jakarta'      <- sudah rusak
          console.log(profilAsli.minat);      // ['musik', 'film']
          `,
          { filename: 'Kenapa tombol Batal tidak mengembalikan apa pun' },
        ),
        p(
          'Ketiga baris `console.log` menunjukkan bahwa salinannya hanya setengah bekerja, dan justru itu yang berbahaya. `draf.nama` berhasil terpisah karena teks termasuk primitif, sehingga yang tersalin adalah nilainya. `draf.alamat` dan `draf.minat` tidak terpisah karena keduanya object, sehingga yang tersalin hanya alamat rujukannya. Kedua variabel menunjuk ke object yang sama persis, dan mengubah lewat salah satu nama berarti mengubah yang dilihat nama lainnya.',
        ),
        p(
          'Akibat praktisnya, tombol Batal akan mengembalikan nama dengan benar tapi membiarkan kota tetap Jakarta. Bug seperti ini biasanya lolos dari pengujian manual karena penguji mencoba mengubah satu field lalu membatalkan, dan kebetulan field yang ia coba adalah field datar. Pola tiga titik `...` sering disebut spread, dan penting diingat ia menyalin **satu lapis** saja.',
        ),
        code(
          'js',
          `
          // structuredClone menyalin seluruh lapisan, termasuk object di dalam object.
          const draf = structuredClone(profilAsli);

          draf.alamat.kota = 'Jakarta';
          console.log(profilAsli.alamat.kota);   // 'Bandung'  <- aslinya utuh
          `,
        ),
        p(
          '`structuredClone` sudah tersedia di semua browser modern dan di Node.js sejak versi 17, jadi tidak perlu memasang library apa pun. Ia menyalin sampai ke lapisan terdalam, dan ia juga menangani hal yang `JSON.parse(JSON.stringify(...))` rusakkan, yaitu `Date` yang berubah menjadi teks, `Map` dan `Set` yang hilang isinya, serta `undefined` yang lenyap. Batasnya satu, yaitu ia tidak bisa menyalin fungsi, dan itu justru wajar karena data yang kamu simpan sebagai draf memang tidak seharusnya berisi fungsi.',
        ),

        h2('Saat error-nya muncul'),
        p(
          'Empat error di bawah ini bersama-sama menempati peringkat teratas error yang dilihat orang setiap hari, dan semuanya berakar pada tipe data.',
        ),
        code(
          'text',
          `
          console.log(pengguna.profil.nama);
                                     ^

          TypeError: Cannot read properties of undefined (reading 'nama')
          `,
          { caption: 'Properti dibaca dari sesuatu yang ternyata `undefined`.' },
        ),
        p(
          'Cara membaca error ini sering terbalik, dan itu membuat orang mencari di tempat yang salah. Yang `undefined` **bukan** `nama`, melainkan `pengguna.profil`. Kalimatnya berarti JavaScript hendak membaca `nama` dari sesuatu, lalu menemukan sesuatu itu ternyata `undefined`. Jadi pertanyaan yang benar bukan kenapa `nama` kosong, melainkan kenapa `profil` tidak ada. Biasanya jawabannya karena data dari server belum sampai, atau karena bentuk datanya berbeda dari yang kamu kira.',
        ),
        p(
          'Perbaikan cepatnya memakai optional chaining `pengguna.profil?.nama`, yang menghasilkan `undefined` alih-alih melempar error. Perbaikan sebenarnya memastikan bentuk datanya memang seperti yang kamu harapkan sebelum dipakai, sebab `?.` hanya membuat programnya tidak berhenti dan tidak membuat datanya jadi ada.',
        ),
        code(
          'text',
          `
          daftar.map((x) => x.nama);
                 ^

          TypeError: daftar.map is not a function
          `,
          { caption: 'Nilainya bukan array, walaupun namanya terdengar seperti array.' },
        ),
        p(
          'Error ini muncul ketika sebuah nilai diperlakukan sebagai array padahal bukan. Tersangka paling sering adalah respons server yang membungkus datanya, misalnya server mengirim `{ data: [...] }` sedangkan kodemu langsung memanggil `.map` pada objek pembungkusnya. Tersangka kedua adalah nilainya masih `undefined` karena datanya belum sampai. Cetak nilainya lebih dulu dengan `console.log(daftar)` sebelum menebak, dan ingat `typeof []` menghasilkan `object` sehingga `typeof` tidak bisa dipakai untuk memeriksa ini. Yang benar adalah `Array.isArray(daftar)`.',
        ),
        code(
          'text',
          `
          JSON.stringify(node);
               ^

          TypeError: Converting circular structure to JSON
          `,
          { caption: 'Object menunjuk balik ke dirinya sendiri.' },
        ),
        p(
          'Struktur melingkar terbentuk saat sebuah object menyimpan rujukan yang akhirnya kembali ke dirinya sendiri, misalnya sebuah komentar menyimpan induknya sedangkan induknya menyimpan daftar komentar. `JSON.stringify` menelusuri isinya sampai habis, dan pada struktur melingkar ia tidak pernah habis. Ini salah satu alasan menyalin object dengan `JSON.parse(JSON.stringify(...))` bukan kebiasaan yang baik, sebab `structuredClone` justru menangani struktur melingkar dengan benar.',
        ),
        code(
          'text',
          `
          structuredClone({ simpan: () => 1 });
          ^

          DOMException [DataCloneError]: () => 1 could not be cloned.
          `,
          { caption: 'Fungsi tidak bisa disalin.' },
        ),
        p(
          'Kalau kamu bertemu error ini, biasanya artinya kamu sedang menyalin sesuatu yang bukan data murni. Object yang berisi fungsi umumnya adalah komponen, instance kelas, atau elemen halaman, dan ketiganya memang tidak dimaksudkan untuk disalin. Pisahkan data yang perlu disalin dari perilaku yang tidak perlu, dan errornya hilang dengan sendirinya.',
        ),
        table(
          ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
          [
            [
              "`Cannot read properties of undefined (reading 'x')`",
              'Yang `undefined` adalah induknya, bukan `x`',
              'Telusuri kenapa induknya kosong, lalu pakai `?.` sebagai penahan sementara',
            ],
            [
              "`Cannot read properties of null (reading 'x')`",
              'Nilainya sengaja dikosongkan, biasanya hasil pencarian yang tidak ketemu',
              'Periksa hasilnya lebih dulu dengan `if (hasil)` sebelum membaca isinya',
            ],
            [
              '`x.map is not a function`',
              'Nilainya bukan array, sering karena masih terbungkus atau belum sampai',
              'Cetak nilainya, lalu periksa dengan `Array.isArray(x)` bukan `typeof`',
            ],
            [
              '`Converting circular structure to JSON`',
              'Object menunjuk balik ke dirinya sendiri',
              'Pakai `structuredClone`, atau kirim hanya field yang dibutuhkan',
            ],
            [
              '`DataCloneError`',
              'Ada fungsi atau elemen halaman di dalam object yang disalin',
              'Salin hanya bagian datanya, bukan seluruh objectnya',
            ],
          ],
          'Lima error yang seluruhnya berakar pada tipe nilai yang tidak sesuai dugaan.',
        ),

        h2('Kesalahan umum pemula'),
        p(
          'Tipe data adalah tempat kesalahan yang paling sering tidak menimbulkan error sama sekali. Programnya jalan, angkanya keluar, dan barulah beberapa minggu kemudian ada yang sadar angkanya salah. Karena itu tabel di bawah lebih banyak berisi hal yang berhasil diam-diam daripada hal yang gagal berisik.',
        ),
        table(
          ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
          [
            [
              'Memakai `typeof` untuk memeriksa apakah sesuatu array',
              '`typeof` bekerja untuk teks, angka, dan boolean, jadi masuk akal ia bekerja untuk array',
              '`typeof []` menghasilkan `object`, sama seperti `typeof {}` dan `typeof null`. Pemeriksaannya selalu lolos untuk hal yang salah, jadi pakai `Array.isArray()`',
            ],
            [
              'Membandingkan harga hasil perhitungan dengan `===`',
              'Kedua angka terlihat sama saat dicetak',
              'Pecahan menyimpan selisih di digit yang tidak ikut tercetak. Bandingkan bilangan bulatnya, atau pakai selisih yang lebih kecil dari `Number.EPSILON`',
            ],
            [
              'Menyalin object dengan `{ ...lama }` lalu menganggapnya benar-benar terpisah',
              'Untuk object satu lapis memang benar-benar terpisah, dan itu yang biasanya dicoba pertama kali',
              'Object di dalam object tetap dibagi bersama, jadi mengubah salinan ikut mengubah aslinya',
            ],
            [
              'Memakai `JSON.parse(JSON.stringify(x))` untuk menyalin dalam',
              'Cara ini beredar luas di internet dan memang bekerja untuk data sederhana',
              '`Date` berubah menjadi teks, `Map` dan `Set` menjadi object kosong, `undefined` hilang, dan struktur melingkar melempar error',
            ],
            [
              'Mengira `null` dan `undefined` sama saja',
              'Keduanya sama-sama berarti tidak ada isinya',
              '`undefined` berarti belum pernah diisi, sedangkan `null` berarti sengaja dikosongkan. Bedanya penting saat membaca data dari database, sebab kolom yang `null` berbeda maksudnya dari field yang tidak dikirim',
            ],
            [
              'Memakai `==` supaya tidak repot memikirkan tipe',
              'Ia lebih longgar, dan biasanya hasilnya memang yang diharapkan',
              "`0 == ''` bernilai `true` dan `null == 0` bernilai `false`, sehingga aturannya tidak bisa ditebak dari akal sehat. Pakai `===` selalu, kecuali `x == null` yang memang berguna untuk memeriksa dua-duanya sekaligus",
            ],
          ],
        ),
        p(
          'Baris kedua layak mendapat perhatian lebih karena akibatnya berupa uang. Kalau kamu perlu membandingkan dua angka pecahan hasil perhitungan, jangan pernah memakai `===` langsung. Bandingkan selisih mutlaknya dengan `Number.EPSILON`, yaitu jarak terkecil yang masih bisa dibedakan JavaScript, lewat bentuk `Math.abs(a - b) < Number.EPSILON`. Tapi itu penambal, dan jalan keluar yang sebenarnya tetap menyimpan angkanya sebagai bilangan bulat sejak awal seperti pada studi kasus di atas.',
        ),
        callout(
          'warning',
          'Kolom bertipe `float` untuk uang adalah bug yang menunggu waktu',
          'Kalau kamu ikut merancang tabel database, pilih tipe bilangan bulat untuk uang dan simpan satuan terkecilnya, atau pakai tipe desimal presisi tetap kalau basis datanya menyediakan. Kesalahan ini sangat mahal diperbaiki belakangan, sebab memperbaikinya berarti memigrasi seluruh baris yang sudah terlanjur menyimpan nilai yang tidak tepat.',
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
