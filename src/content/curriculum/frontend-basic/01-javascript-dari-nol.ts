import { callout, code, divider, h2, ol, p, table, ul } from '@/lib/content/builders';
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
  reviewedAt: '2026-08-02',
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
          'Kamu akan lebih sering melihat error daripada hasil yang benar — itu normal, dan error adalah informasi paling berguna yang kamu punya. Latih membacanya dari sekarang.',
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
          '`ReferenceError` — jenis errornya: ada nama yang dipakai tapi tidak pernah dideklarasikan.',
          '`nilai is not defined` — nama yang bermasalah.',
          '`app.js:7:15` — file, baris 7, kolom 15. Mulai menelusuri dari sini.',
          'Baris di bawahnya adalah *stack trace*: siapa memanggil siapa, dari yang terbaru ke yang terlama.',
        ),

        divider,
        h2('Rangkuman'),
        ul(
          'Bahasa JavaScript sama di mana-mana; **runtime**-nya yang berbeda dan menentukan API apa yang tersedia.',
          'Console browser untuk eksperimen cepat, file `.js` + `type="module"` untuk kode halaman, Node.js untuk kode di luar browser.',
          '`type="module"` memberi tiap file scope sendiri dan mode strict otomatis — pakai selalu.',
          'Error punya struktur tetap: jenis, pesan, lokasi, lalu jejak pemanggilan.',
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
        p('Inilah inti bab ini. Perhatikan hasil kedua contoh berikut:'),
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
        p('Perbandingan pun mengikuti aturan yang sama:'),
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

        h2('Menyalin object dengan aman'),
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
