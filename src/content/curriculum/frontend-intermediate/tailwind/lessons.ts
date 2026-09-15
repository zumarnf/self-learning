import {
  callout,
  checklist,
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
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Frontend Intermediate — Chapter 1, all twelve lessons.
 *
 * Written against Tailwind CSS 4.3, whose CSS-first configuration differs substantially from v3.
 * Examples reference this project's own `globals.css` where that makes the lesson concrete.
 */
export const lessons: LessonDraft[] = [
  written(
    'filosofi-utility-first',
    'Filosofi Utility-First & kritik yang sering muncul',
    17,
    'Kenapa class sebanyak itu justru mengurangi masalah — dan jawaban jujur atas keberatan yang wajar.',
    [
      p(
        'Reaksi pertama hampir semua orang terhadap Tailwind sama: "markup-nya kotor". Keberatan itu masuk akal, dan layak dijawab dengan serius — bukan dengan mengatakan "nanti juga terbiasa".',
      ),

      terms(
        {
          term: 'utility class',
          meaning:
            'Terjemahannya **class serbaguna**. Class CSS yang mengerjakan **satu hal saja** dan namanya menyebutkan hal itu: `p-4` untuk padding, `flex` untuk display, `text-sm` untuk ukuran huruf. Bedanya dengan class bernama seperti `.kartu` bukan soal panjang tulisan — melainkan bahwa artinya **tidak pernah berubah** di mana pun ia dipakai.',
        },
        {
          term: 'utility-first',
          meaning:
            'Pendekatan menyusun tampilan **terutama dari utility class** alih-alih menulis CSS bernama sendiri. Perlu ditegaskan: ini pertukaran yang sadar, bukan kemenangan tanpa biaya — markup jadi lebih panjang, ditukar dengan empat masalah CSS yang hilang.',
        },
        {
          term: 'CSS mati',
          meaning:
            'Terjemahan dari *dead CSS*. Aturan style yang sudah tidak dipakai siapa pun tapi **tidak berani dihapus**, karena tidak ada cara memastikannya. Ini masalah CSS bernama yang paling mahal, dan utility-first menutupnya secara struktural: style yang menempel di elemen ikut terhapus bersama elemennya.',
        },
        {
          term: 'jangkauan perubahan',
          meaning:
            'Terjemahan dari *blast radius*. Seberapa jauh akibat sebuah perubahan menyebar. Mengubah `.kartu` bisa merusak halaman yang tidak kamu buka sejak bulan lalu; mengubah `p-4` menjadi `p-6` pada satu elemen **tidak mungkin** menyentuh apa pun di luar elemen itu.',
        },
        {
          term: 'separation of concerns',
          meaning:
            'Terjemahannya **pemisahan urusan** — keberatan paling sering terhadap Tailwind. Jawaban jujurnya: yang dipisahkan CSS bernama sebenarnya **berkas**, bukan urusan. Style sebuah tombol dan markup tombol itu berubah bersamaan, jadi menaruhnya di dua berkas berbeda justru memaksamu membuka keduanya setiap kali.',
        },
        {
          term: 'purge',
          meaning:
            'Terjemahannya **membuang**. Proses Tailwind memindai kodemu lalu **hanya menghasilkan CSS untuk class yang benar-benar dipakai**. Akibatnya berkas CSS akhir biasanya kecil dan **berhenti tumbuh** seiring aplikasi membesar — kebalikan dari CSS bernama yang selalu bertambah.',
        },
        {
          term: 'skala',
          meaning:
            'Deretan nilai yang sudah ditetapkan — `p-1`, `p-2`, `p-4`, `p-8`. Manfaat tersembunyinya bukan kemudahan mengetik, melainkan bahwa ia **menghalangi nilai ad-hoc masuk**: tidak ada `p-13`, sehingga tampilan tetap konsisten tanpa perlu disiplin siapa pun.',
        },
        {
          term: 'markup',
          meaning:
            'Struktur HTML atau JSX sebuah tampilan. Keberatan "markup jadi kotor" adalah biaya yang nyata dan tidak perlu disangkal — yang layak diperdebatkan adalah apakah biaya itu sepadan dengan empat masalah yang hilang.',
        },
      ),

      h2('Masalah yang dipecahkannya'),
      code(
        'css',
        `
        /* Setelah setahun, siapa yang berani menghapus ini? */
        .kartu { padding: 16px; }
        .kartu-produk { padding: 16px; border: 1px solid #eee; }
        .kartu-produk-baru { padding: 12px; border: 1px solid #eee; }
        .card-wrapper-2 { /* dipakai di mana? */ }
        `,
      ),
      ol(
        '**CSS tidak pernah bisa dihapus dengan yakin.** Kamu tidak tahu apakah `.kartu-produk-baru` masih dipakai di suatu tempat, jadi ia menumpuk selamanya.',
        '**Penamaan menghabiskan waktu.** `.kartu`, `.kartu-baru`, `.kartu-baru-v2` — energi yang tidak menghasilkan apa pun.',
        '**Perubahan punya jangkauan tak terduga.** Mengubah `.kartu` bisa merusak halaman yang tidak kamu buka sejak bulan lalu.',
        '**Nilai ad-hoc menyelinap masuk.** `padding: 13px` di satu tempat, `14px` di tempat lain, tanpa ada yang menghentikannya.',
      ),
      p(
        'Utility-first menukar keempatnya dengan satu biaya: markup jadi lebih panjang. Style sebuah elemen **ada di elemen itu**, jadi menghapus elemennya menghapus stylenya, dan mengubahnya tidak bisa merusak apa pun di tempat lain.',
      ),

      h2('Jawaban atas keberatan yang wajar'),
      table(
        ['Keberatan', 'Jawaban jujur'],
        [
          [
            '"Markup jadi kotor"',
            'Benar. Yang ditukar: CSS yang tidak pernah bisa dihapus. Menurut pengalaman banyak tim, itu tukaran yang menguntungkan',
          ],
          [
            '"Sama saja dengan style inline"',
            '**Tidak.** Utility terikat design token, punya varian responsif dan state, dan tidak bisa memasukkan nilai sembarang',
          ],
          [
            '"Class-nya berulang di mana-mana"',
            'Ekstrak jadi komponen — bukan jadi class CSS. Itu memang cara React bekerja',
          ],
          [
            '"Harus hafal nama utility"',
            'Nyata di minggu pertama. Setelahnya, namanya mengikuti properti CSS-nya sendiri',
          ],
          [
            '"HTML-nya jadi besar"',
            'Benar sebelum gzip. Setelah kompresi, class yang berulang justru sangat efisien',
          ],
        ],
      ),

      h2('Kenapa bukan style inline'),
      compare(
        {
          title: 'Style inline',
          lang: 'html',
          code: `
            <div style="padding: 13px; color: #3b82f6">
          `,
          notes: [
            'Nilai bebas — tidak ada sistem',
            'Tidak bisa `:hover` atau media query',
            'Tidak ikut dark mode',
          ],
        },
        {
          title: 'Utility',
          lang: 'html',
          code: `
            <div class="p-3 text-primary hover:text-primary-hover md:p-6 dark:text-primary-dark">
          `,
          notes: [
            'Terikat skala dan token',
            'State dan breakpoint bekerja',
            'Dark mode ikut otomatis',
          ],
        },
      ),
      p(
        'Perbandingan ini menjawab keberatan "sama saja dengan style inline" secara konkret. Perhatikan `13px` dan `#3b82f6` di kolom kiri, karena keduanya nilai bebas yang tidak berasal dari sistem apa pun, dan tidak ada yang mencegah baris berikutnya memakai `14px`. Kolom kanan memakai `p-3` yang terikat skala spacing, dan `text-primary` yang menunjuk token warna, sehingga kalau paletnya berubah warna ini ikut berubah. Perbedaan yang lebih menentukan ada di dua bagian terakhir. Modifier `hover:` dan `md:` **mustahil ditulis sebagai style inline sama sekali**, karena atribut `style` tidak bisa memuat pseudo-class maupun media query. Jadi keduanya bukan dua cara menulis hal yang sama, sebab yang satu bisa melakukan hal yang tidak bisa dilakukan yang lain.',
      ),

      h2('Kapan Tailwind bukan pilihan yang tepat'),
      ul(
        'Halaman HTML statis tanpa build step — Tailwind butuh proses build.',
        'Tim yang sudah punya design system CSS matang dan berjalan baik.',
        'Kode yang harus disalin-tempel ke lingkungan tanpa Tailwind (template email).',
        'Saat kamu ingin **belajar CSS** — utility menyembunyikan properti aslinya.',
      ),
      callout(
        'info',
        'Website ini memakainya, dan itu keputusan sadar',
        'Palet Ink & Amber dikunci sebagai token di `globals.css`, dan tidak ada satu pun nilai warna atau spacing yang ditulis langsung di komponen. Itu justru lebih mudah ditegakkan dengan utility-first daripada dengan CSS bernama.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Argumen utility-first paling mudah dinilai bukan lewat perdebatan, melainkan lewat angka sebuah project yang sudah jalan. Website yang sedang kamu baca ini punya 440 halaman materi yang dibangun dari 38 berkas komponen. Pertanyaan yang menarik adalah berapa banyak CSS yang harus ditulis dan dirawat manusia untuk semua itu.',
      ),
      code(
        'text',
        `
        Diukur pada project ini, September 2026:

        Halaman yang dihasilkan          : 440
        Berkas komponen .tsx             : 38
        Berkas CSS tulis tangan          : 1  (globals.css, 489 baris)
        Isi globals.css                  : hampir seluruhnya definisi token

        CSS akhir yang dikirim ke pengguna:
          mentah                         : 63,6 KB
          setelah gzip                   : 11,1 KB
          jumlah aturan di layer utilities: 689
        `,
        {
          caption: 'Diukur dengan mengompilasi globals.css memakai Tailwind 4.3.3 yang terpasang.',
        },
      ),
      p(
        'Angka yang paling layak diperhatikan bukan 11,1 KB melainkan **satu berkas CSS untuk 440 halaman**, dan isinya pun bukan style melainkan daftar token. Tidak ada `.kartu`, tidak ada `.navbar-item-active`, tidak ada `.hero-section-wrapper`. Akibat langsungnya, tidak pernah ada momen seseorang membuka berkas CSS dan bertanya "aturan ini masih dipakai atau tidak", sebab tidak ada aturan yang bisa ditanyakan.',
      ),
      p(
        'Bandingkan dengan cara CSS bernama pada project sebesar ini. Setiap halaman baru menambah beberapa class, class itu menumpuk, dan setelah beberapa bulan tidak ada yang berani menghapusnya. Berkas CSS-nya tumbuh **seiring jumlah halaman**. Dengan utility, 689 aturan itu adalah seluruh kosakata yang dipakai 440 halaman, dan halaman ke-441 hampir pasti tidak menambah satu pun aturan baru karena ia memakai kosakata yang sudah ada.',
      ),
      table(
        ['Pertanyaan yang muncul di project nyata', 'CSS bernama', 'Utility-first'],
        [
          [
            'Class ini masih dipakai atau tidak?',
            'Harus dicari manual ke seluruh repo, dan tetap tidak yakin',
            'Tidak pernah muncul — style ikut terhapus bersama elemennya',
          ],
          [
            'Kalau saya ubah nilai ini, apa yang ikut berubah?',
            'Tidak diketahui sampai dicoba',
            'Hanya elemen yang sedang kamu sunting',
          ],
          [
            'Berapa besar CSS-nya tahun depan?',
            'Lebih besar, hampir pasti',
            'Kurang lebih sama, karena kosakatanya terbatas',
          ],
          [
            'Bagaimana menjaga spacing tetap konsisten?',
            'Butuh disiplin setiap orang, setiap kali',
            'Skalanya yang menghalangi — `p-13` tidak ada',
          ],
        ],
      ),
      p(
        'Baris terakhir itu yang paling sering diremehkan. Konsistensi yang bergantung pada disiplin manusia akan bocor, dan bocornya pelan sehingga tidak terasa sampai desainnya sudah berantakan. Konsistensi yang ditegakkan oleh bentuk alatnya tidak butuh siapa pun mengingatnya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan paling membingungkan di Tailwind versi 4 justru **bukan error**. Tidak ada pesan merah, buildnya sukses, tapi utility yang kamu tulis tidak berpengaruh sama sekali. Penyebabnya hampir selalu satu, yaitu CSS lama yang ditulis di luar cascade layer mana pun.',
      ),
      code(
        'text',
        `
        /* lama.css — warisan dari sebelum Tailwind masuk, DI LUAR layer mana pun */
        .kartu { padding: 8px; }

        /* versi yang sama, tapi ditaruh di dalam layer */
        @layer components {
          .kartu-berlapis { padding: 8px; }
        }

        <div class="kartu p-6">satu</div>
        <div class="kartu-berlapis p-6">dua</div>

        Diukur di Chrome 151:
          .kartu          + p-6  ->  padding = 8px    <-- p-6 KALAH, diam-diam
          .kartu-berlapis + p-6  ->  padding = 24px   <-- p-6 menang
        `,
        {
          caption:
            'Dijalankan sungguhan: Tailwind 4.3.3 dikompilasi, lalu dibaca lewat getComputedStyle di Chrome 151.',
        },
      ),
      p(
        'Perbedaan keduanya sama sekali bukan specificity, sebab `.kartu` dan `.p-6` sama-sama satu class. Yang menentukan adalah **cascade layer**. Tailwind versi 4 menaruh seluruh utility-nya di dalam `@layer utilities`, dan aturan CSS lama yang tidak berada di layer mana pun secara aturan CSS resmi **selalu mengalahkan aturan yang berlayer**, berapa pun specificity-nya. Jadi satu berkas CSS warisan bisa membuat semua utility-mu tampak tidak berfungsi.',
      ),
      p(
        'Ini juga alasan kenapa naluri pertama banyak orang, yaitu menambahkan `!important`, justru menyesatkan. Masalahnya bukan kekuatan aturan melainkan urutan layer, dan `!important` di sisi utility hanya menutupi gejalanya sampai suatu hari ada `!important` kedua di sisi lawan.',
      ),
      code(
        'text',
        `
        Perbaikannya satu baris, bukan !important:

        /* lama.css */
        @layer components {
          .kartu { padding: 8px; }
        }

        Sekarang .kartu berada di layer yang lebih rendah daripada utilities,
        jadi p-6 kembali menang dan hasilnya 24px.
        `,
      ),
      callout(
        'warning',
        'Kalau utility-mu "tidak berfungsi", periksa layer sebelum yang lain',
        'Buka DevTools, klik elemennya, dan lihat panel Styles. Chrome menampilkan nama layer di sebelah setiap aturan. Aturan tanpa keterangan layer adalah aturan tak berlayer, dan ia mengalahkan seluruh utility Tailwind tanpa terkecuali. Ini penyebab nomor satu keluhan "Tailwind saya rusak" pada project yang bermigrasi dari CSS lama.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sebagian besar kesalahan di tahap ini bukan soal salah mengetik nama utility, melainkan soal membawa kebiasaan CSS bernama ke dalam pendekatan yang cara kerjanya berbeda.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat `.kartu` sendiri agar markup lebih pendek',
            'Markup jadi bersih seperti dulu',
            'Kembali membawa keempat masalah CSS bernama, dan aturannya bisa mengalahkan utility bila tidak berlayer',
          ],
          [
            'Menambah `!important` ketika utility tampak tidak berfungsi',
            'Ia biasanya menyelesaikan konflik CSS',
            'Diuji sungguhan, penyebabnya adalah cascade layer. `!important` menutupi gejala dan memulai perang yang tidak ada pemenangnya',
          ],
          [
            'Menyamakan utility dengan style inline',
            'Sama-sama menempel di elemen',
            'Style inline tidak bisa `hover:`, tidak bisa media query, dan menerima nilai bebas apa pun',
          ],
          [
            'Khawatir HTML jadi besar karena class berulang',
            'Terlihat banyak sekali',
            'Class yang berulang justru sangat mudah dikompresi. Yang berhenti tumbuh adalah CSS-nya, dan itu bagian yang lebih mahal',
          ],
          [
            'Memakai Tailwind untuk belajar CSS',
            'Sekalian dua-duanya',
            'Utility menyembunyikan nama properti aslinya. Pahami dulu `display`, `flex`, dan `position`, baru pakai singkatannya',
          ],
          [
            'Memakainya pada halaman statis tanpa build step',
            'Tinggal pasang saja',
            'Tailwind perlu memindai kode untuk tahu class mana yang dipakai. Tanpa build, tidak ada yang memindai',
          ],
        ],
      ),
      p(
        'Baris pertama layak diperjelas karena ia bukan larangan mutlak. Mengekstrak sesuatu memang perlu ketika sebuah pola berulang di banyak tempat, tapi bentuk ekstraksinya adalah **komponen**, bukan class CSS baru. Satu komponen `<Kartu>` menyimpan deretan utility-nya di satu tempat, tetap terhapus otomatis ketika komponennya dihapus, dan tetap tidak bisa merusak apa pun di luar dirinya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Masalah CSS bernama: tidak bisa dihapus dengan yakin, dan perubahannya berjangkauan luas.',
        'Utility mengikat style ke elemennya — menghapus elemen menghapus stylenya.',
        'Berbeda dari style inline: terikat token, mendukung state dan breakpoint.',
        'Pengulangan diselesaikan dengan komponen, bukan dengan class CSS baru.',
      ),
      references(
        {
          label: 'Styling with utility classes',
          href: 'https://tailwindcss.com/docs/styling-with-utility-classes',
          source: 'Tailwind CSS',
          note: 'Argumen resmi di balik utility-first, termasuk jawaban atas keberatan yang paling sering.',
        },
        {
          label: 'Optimizing for production',
          href: 'https://tailwindcss.com/docs/optimizing-for-production',
          source: 'Tailwind CSS',
          note: 'Alasan berkas CSS akhir tetap kecil dan berhenti tumbuh seiring aplikasi membesar.',
        },
        {
          label: 'CSS cascade',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade',
          source: 'MDN',
          note: 'Mekanisme yang membuat perubahan CSS bernama berjangkauan luas dan sulit diprediksi.',
        },
        {
          label: 'Specificity',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity',
          source: 'MDN',
          note: 'Sumber perang `!important` yang justru dihindari utility-first karena semuanya setara.',
        },
      ),
    ],
  ),

  written(
    'instalasi-v4',
    'Instalasi Tailwind v4 (CSS-first)',
    17,
    'Setup versi 4 yang berbeda jauh dari v3 — dan kenapa perubahannya masuk akal.',
    [
      terms(
        {
          term: 'CSS-first',
          meaning:
            'Perubahan terbesar Tailwind v4: konfigurasi ditulis **di dalam berkas CSS** memakai `@theme`, bukan lagi di `tailwind.config.js`. Alasannya masuk akal — design token pada dasarnya memang CSS variable, jadi menaruhnya di CSS menghapus satu lapisan penerjemahan yang sebelumnya harus ada.',
        },
        {
          term: 'PostCSS',
          meaning:
            'Alat yang memproses CSS lewat rangkaian plugin sebelum berkas akhirnya dihasilkan. Tailwind berjalan sebagai salah satu plugin di dalamnya. Kamu jarang menyentuhnya langsung — tapi berguna tahu bahwa `@import "tailwindcss"` sebenarnya diproses oleh alat ini.',
        },
        {
          term: '@import',
          meaning:
            'Satu baris yang menggantikan tiga arahan `@tailwind base/components/utilities` di v3. Perubahan ini bukan sekadar kosmetik — ia membuat Tailwind memakai mekanisme impor CSS yang standar, bukan sintaks khusus miliknya sendiri.',
        },
        {
          term: 'zero-config',
          meaning:
            'Terjemahannya **tanpa konfigurasi**. Tailwind v4 bisa langsung bekerja tanpa berkas konfigurasi sama sekali — pemindaian berkas dilakukan otomatis. Kamu hanya perlu menulis konfigurasi ketika benar-benar ingin mengubah sesuatu.',
        },
        {
          term: 'content detection',
          meaning:
            'Terjemahannya **pendeteksian isi**. Cara Tailwind menemukan class mana yang kamu pakai. Di v4 ini otomatis, tapi batasnya tetap sama dan wajib diingat: **ia memindai teks, bukan menjalankan kode**. Class yang dirangkai seperti `` `text-${warna}-500` `` tidak akan pernah terdeteksi.',
        },
        {
          term: 'Lightning CSS',
          meaning:
            'Mesin pemroses CSS berbasis Rust yang dipakai Tailwind v4 di balik layar. Ia yang menangani prefix vendor, penggabungan berkas, dan pemadatan — pekerjaan yang di v3 membutuhkan beberapa plugin terpisah.',
        },
        {
          term: 'breaking change',
          meaning:
            'Terjemahannya **perubahan yang memutus kompatibilitas**. Perpindahan v3 ke v4 mengandung beberapa di antaranya, jadi tutorial dan jawaban Stack Overflow yang ditulis untuk v3 sering **tidak berlaku lagi**. Selalu periksa versi yang dibahas sebelum menyalin apa pun.',
        },
        {
          term: 'IntelliSense',
          meaning:
            'Ekstensi editor resmi Tailwind yang memberi autocomplete nama class, pratinjau warna, dan peringatan saat ada class yang saling bertabrakan. Manfaatnya besar dan sering diremehkan — ia menghapus sebagian besar keluhan "class-nya terlalu banyak untuk dihafal".',
        },
      ),

      h2('Pemasangan'),
      code(
        'bash',
        `
        npm install -D tailwindcss @tailwindcss/postcss
        `,
      ),
      code(
        'js',
        `
        const config = {
          plugins: {
            '@tailwindcss/postcss': {},
          },
        };

        export default config;
        `,
        { filename: 'postcss.config.mjs' },
      ),
      code(
        'css',
        `
        @import 'tailwindcss';
        `,
        { filename: 'src/app/globals.css', caption: 'Satu baris. Itu saja.' },
      ),
      p(
        'Tiga berkas, dan hanya itu yang dibutuhkan Tailwind v4. Perintah pertama memasang **dua** paket, yaitu `tailwindcss` sendiri dan `@tailwindcss/postcss` yang menghubungkannya ke pipeline build. Di v3 keduanya masih satu paket, dan pemisahan inilah yang sering membuat orang mengikuti tutorial lama lalu bingung kenapa tidak jalan. `postcss.config.mjs` mendaftarkan plugin itu, dan perhatikan tidak ada `autoprefixer` di sana karena v4 sudah menyertakannya. Berkas ketiga adalah yang paling mengejutkan, sebab **satu baris `@import`** menggantikan tiga direktif `@tailwind` di v3. Yang tidak ada di mana pun juga penting, karena tidak ada `tailwind.config.js` lagi. Sebabnya v4 mendeteksi berkas sumbermu otomatis dan memindahkan konfigurasi ke blok `@theme` di CSS.',
      ),

      h2('Yang berubah dari v3'),
      table(
        ['', 'v3', 'v4'],
        [
          ['Memuat', '`@tailwind base/components/utilities`', '`@import "tailwindcss"`'],
          ['Konfigurasi', '`tailwind.config.js`', '**Blok `@theme` di CSS**'],
          ['Token sebagai CSS variable', 'Perlu plugin', '**Otomatis**'],
          ['`content` paths', 'Wajib ditulis', 'Terdeteksi otomatis'],
          ['`autoprefixer`', 'Perlu dipasang', 'Sudah termasuk'],
          ['Kecepatan build', 'Cepat', 'Jauh lebih cepat'],
        ],
      ),
      callout(
        'info',
        'Kenapa konfigurasi pindah ke CSS',
        'Di v3, token warna hidup di JavaScript dan CSS tidak bisa membacanya — kamu harus menghasilkan variabel lewat plugin. Di v4, token **adalah** CSS custom property sejak awal, jadi CSS biasa, JavaScript, dan DevTools semuanya bisa membacanya tanpa perantara.',
      ),

      h2('Ada `tailwind.config.js`? Masih bisa'),
      code(
        'css',
        `
        @import 'tailwindcss';
        @config '../../tailwind.config.js';
        `,
        { caption: 'Untuk migrasi bertahap dari project v3.' },
      ),
      p(
        'Direktif `@config` adalah jembatan migrasi, karena ia menyuruh v4 membaca berkas konfigurasi gaya v3 yang sudah kamu punya sehingga seluruh token dan plugin di sana tetap berlaku. Perhatikan urutannya, dengan `@import` lebih dulu dan `@config` sesudahnya. Gunanya bukan supaya kamu tetap memakai v3 selamanya, melainkan supaya **upgrade tidak harus dilakukan sekaligus**. Kamu bisa naik ke v4 hari ini, menikmati build yang lebih cepat, lalu memindahkan token ke blok `@theme` sedikit demi sedikit. Untuk project baru, baris ini tidak diperlukan sama sekali.',
      ),

      h2('Memeriksa pemasangan'),
      code('html', `<div class="bg-red-500 p-4 text-white">Kalau ini merah, Tailwind aktif</div>`),
      callout(
        'warning',
        'Kalau class tidak berpengaruh sama sekali',
        'Periksa tiga hal berurutan: (1) apakah `globals.css` benar-benar diimpor di `layout.tsx`, (2) apakah PostCSS plugin terdaftar, (3) apakah kamu menyusun nama class dengan **string dinamis** — `bg-${warna}-500` tidak akan pernah terdeteksi, karena Tailwind memindai teks sumber, bukan menjalankan kodemu.',
      ),
      code(
        'jsx',
        `
        // SALAH: Tailwind tidak pernah melihat string ini
        <div className={\`bg-\${warna}-500\`} />

        // BENAR: nama class lengkap ada di sumber
        const KELAS = {
          merah: 'bg-red-500',
          biru: 'bg-blue-500',
        };
        <div className={KELAS[warna]} />
        `,
      ),
      p(
        'Penyebabnya disebut di kotak peringatan dan layak diulang karena tidak terduga, yaitu **Tailwind memindai teks berkas sumbermu, ia tidak menjalankan kodemu.** Jadi ia mencari kemunculan `bg-red-500` sebagai rangkaian karakter utuh. Pada versi SALAH, yang ada di berkas hanyalah `bg-` dan `-500` yang dipisah interpolasi, sehingga string `bg-red-500` tidak pernah muncul. Akibatnya class itu tidak pernah dihasilkan dan elemennya tampil tanpa warna sama sekali. Versi BENAR membalik arahnya dengan menulis **seluruh nama class secara lengkap** di objek `KELAS`, sehingga pemindai menemukannya dan yang dinamis tinggal pemilihan kuncinya saat program berjalan. Pola yang sama berlaku untuk semua utility dan bukan hanya warna, sebab `text-${ukuran}` dan `grid-cols-${n}` gagal karena alasan yang persis sama.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Kasus pemasangan yang paling sering ditemui di dunia kerja bukan project baru, melainkan project lama versi 3 yang harus dinaikkan ke versi 4. Bayangkan sebuah dashboard internal dengan 60 komponen yang sudah jalan dua tahun. Perintah `npm install tailwindcss@4` berhasil, buildnya sukses, tidak ada satu pun pesan error, lalu halamannya dibuka dan tampilannya rusak setengah.',
      ),
      p(
        'Yang membuat kasus ini pantas dipelajari adalah **kegagalannya senyap**. Tombolnya masih memakai `flex` dan tetap sejajar, tapi jarak antarnya hilang. Kartunya masih sejajar, tapi tidak lagi punya sudut membulat. Teksnya semua jadi seukuran. Pola yang tampak acak itu sebenarnya punya satu aturan yang sangat rapi, dan begitu aturannya terlihat, penyebabnya langsung jelas.',
      ),
      code(
        'text',
        `
        Berkas CSS-nya masih memakai sintaks versi 3:

          @tailwind base;
          @tailwind components;
          @tailwind utilities;

        Diukur dengan Tailwind 4.3.3 yang terpasang di project ini:

          keluaran CSS               : 20.086 byte
          box-sizing (preflight)     : TIDAK ADA
          -webkit-text-size-adjust   : TIDAK ADA
          .flex                      : ADA
          .grid                      : ADA
          .items-center              : ADA
          .p-4                       : TIDAK ADA
          .gap-4                     : TIDAK ADA
          .text-sm                   : TIDAK ADA
          .rounded-lg                : TIDAK ADA
          --spacing                  : TIDAK ADA

        Berkas yang sama, diganti satu baris menjadi @import 'tailwindcss':

          keluaran CSS               : 51.240 byte
          semua yang di atas         : ADA
        `,
        {
          caption:
            'Dijalankan sungguhan lewat @tailwindcss/postcss 4.3.3. Buildnya sukses pada kedua kasus.',
        },
      ),
      p(
        'Aturannya sekarang terbaca. Utility yang **tidak butuh nilai dari tema** tetap dihasilkan, sebab `display: flex` tidak perlu membaca apa pun. Utility yang **membaca nilai dari tema** hilang seluruhnya, sebab tanpa `@import "tailwindcss"` tidak ada tema yang dimuat, jadi `--spacing` tidak pernah ada dan `p-4` yang isinya `calc(var(--spacing) * 4)` tidak bisa dibentuk. Preflight juga bagian dari yang diimpor, jadi ia ikut hilang.',
      ),
      p(
        'Pelajarannya melampaui Tailwind. Ketika sebuah upgrade menghasilkan kerusakan yang tampak acak, carilah **satu aturan yang menjelaskan pola acak itu**, jangan memperbaiki gejalanya satu per satu. Di kasus ini, memperbaiki satu baris `@import` menyelesaikan enam puluh komponen sekaligus.',
      ),
      code(
        'ts',
        `
        // Urutan langkah upgrade yang paling sedikit menimbulkan kejutan.
        //
        // 1. Ganti pintu masuk CSS-nya lebih dulu, sebelum menyentuh apa pun yang lain,
        //    karena tanpa langkah ini semua pengujian berikutnya membaca hasil yang salah.
        //
        //    - @tailwind base;        }
        //    - @tailwind components;  }  ketiganya dihapus
        //    - @tailwind utilities;   }
        //    + @import 'tailwindcss';
        //
        // 2. Ganti plugin PostCSS-nya. Di versi 4 paketnya terpisah.
        //
        //    postcss.config.mjs
        //    - plugins: { tailwindcss: {}, autoprefixer: {} }
        //    + plugins: { '@tailwindcss/postcss': {} }
        //
        //    autoprefixer tidak lagi diperlukan sebab Lightning CSS sudah menanganinya.
        //
        // 3. Baru setelah dua langkah di atas, jalankan build dan catat apa yang masih rusak.
        //    Yang tersisa biasanya perubahan nama utility antar-major, bukan kegagalan setup.
        `,
        { caption: 'Dua langkah pertama harus selesai sebelum menilai apa pun.' },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pemasangan Tailwind versi 4 punya satu sifat yang perlu diketahui sejak awal, yaitu ia **jauh lebih sering gagal diam-diam daripada berteriak**. Dua contoh di bawah dijalankan sungguhan, dan yang pertama tidak menghasilkan pesan apa pun.',
      ),
      code(
        'text',
        `
        @import 'tailwindcss' source(none);
        @source "./folder-yang-tidak-ada";

        Hasilnya:
          === OK ===
          /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
          ...

        Tidak ada error. Tidak ada peringatan. Folder yang salah tulis
        diabaikan begitu saja, dan seluruh class di dalamnya tidak pernah dihasilkan.
        `,
        { caption: 'Dijalankan sungguhan dengan Tailwind 4.3.3.' },
      ),
      p(
        'Perilaku ini masuk akal dari sisi alatnya, sebab sebuah folder yang belum ada hari ini bisa saja ada besok. Tapi bagi orang yang memasangnya, akibatnya adalah gejala "class saya tidak jalan" tanpa satu pun petunjuk. Cara memastikannya bukan dengan membaca ulang konfigurasi melainkan dengan **memeriksa keluarannya**, misalnya mencari satu nama class yang kamu yakin dipakai di dalam berkas CSS hasil build.',
      ),
      code(
        'text',
        `
        @import 'tailwindcss' source(none);
        @config "./tailwind.config.js";

        CssSyntaxError: tailwindcss: /home/.../_twtest/w2.css:1:1:
        Can't resolve './tailwind.config.js' in '/home/.../_twtest'

        > 1 | @import "tailwindcss" source(none);
            | ^
          2 | @config "./tailwind.config.js";
        `,
        {
          caption: 'Dijalankan sungguhan. @config yang menunjuk berkas tidak ada memang berteriak.',
        },
      ),
      p(
        'Bandingkan keduanya. `@source` yang salah diam, `@config` yang salah berteriak. Bedanya karena `@config` adalah janji eksplisit bahwa sebuah berkas konfigurasi ada dan harus dibaca, sedangkan `@source` hanya menambah tempat yang layak dipindai. Kalau kamu memang masih memakai `tailwind.config.js` warisan versi 3, `@config` justru sahabatmu, sebab kesalahan jalur akan langsung terlihat.',
      ),
      callout(
        'tip',
        'Satu perintah untuk memastikan pemasangan benar-benar hidup',
        'Setelah setup, tulis satu elemen dengan class yang mustahil dipakai kebetulan, misalnya `bg-fuchsia-700`, buka halamannya, lalu periksa apakah warnanya muncul. Kalau muncul, rantai pemindaian sampai penulisan CSS sudah utuh. Cara ini menguji seluruh jalur sekaligus, jauh lebih cepat daripada membaca ulang konfigurasi baris demi baris.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Hampir semua kesalahan pemasangan berasal dari tutorial atau jawaban forum yang ditulis untuk versi 3, dan tulisan seperti itu masih jauh lebih banyak di internet daripada tulisan versi 4.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyalin `@tailwind base/components/utilities` dari tutorial',
            'Itu yang tertulis di hampir semua panduan',
            'Diuji sungguhan, buildnya sukses tapi preflight dan seluruh utility bertema hilang. Pakai `@import` satu baris',
          ],
          [
            'Menjalankan `npx tailwindcss init` lalu bingung berkasnya tidak terpakai',
            'Itu langkah wajib di versi 3',
            'Versi 4 tidak butuh berkas konfigurasi. Kalau memang ada yang mau dipakai, tunjuk dengan `@config`',
          ],
          [
            'Memasang `autoprefixer` sekalian',
            'Selalu berpasangan di versi 3',
            'Lightning CSS di dalam versi 4 sudah menambahkan prefix sendiri. Menambahnya hanya memperlambat build',
          ],
          [
            'Memakai plugin PostCSS bernama `tailwindcss`',
            'Nama paketnya memang itu',
            'Di versi 4 plugin PostCSS-nya paket terpisah, `@tailwindcss/postcss`. Nama lama tidak lagi berfungsi sebagai plugin',
          ],
          [
            'Menambah `@source` untuk setiap folder agar aman',
            'Lebih banyak lebih pasti',
            'Pendeteksian isi sudah otomatis. Diuji sungguhan, jalur yang salah tulis diabaikan tanpa peringatan, jadi tambahan itu bisa menyesatkan',
          ],
          [
            'Menyimpulkan setup gagal karena satu class tidak jalan',
            'Gejalanya memang begitu',
            'Periksa dulu apakah nama classnya dirangkai dari variabel. Pemindai membaca teks, bukan menjalankan kode',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah jebakan yang akan kembali muncul di beberapa sub-bab berikutnya, dan pantas diingat sekarang. Pemindaian Tailwind bekerja pada **teks berkas sumbermu**, bukan pada hasil jalannya program. Apa pun yang nama classnya baru terbentuk saat kode berjalan tidak akan pernah terlihat olehnya, dan itu bukan kerusakan pemasangan.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'v4 hanya butuh satu `@import "tailwindcss"` dan satu plugin PostCSS.',
        'Konfigurasi pindah ke blok `@theme` di CSS; token jadi CSS variable asli.',
        '`tailwind.config.js` masih bisa dipakai lewat `@config` untuk migrasi.',
        'Nama class yang disusun dinamis tidak akan terdeteksi — pakai peta nama lengkap.',
      ),
      references(
        {
          label: 'Installing Tailwind CSS with PostCSS',
          href: 'https://tailwindcss.com/docs/installation/using-postcss',
          source: 'Tailwind CSS',
          note: 'Langkah pemasangan resmi v4 — satu plugin dan satu baris `@import`.',
        },
        {
          label: 'Upgrade guide (v3 to v4)',
          href: 'https://tailwindcss.com/docs/upgrade-guide',
          source: 'Tailwind CSS',
          note: 'Daftar perubahan yang memutus kompatibilitas — wajib dibaca sebelum menyalin tutorial v3.',
        },
        {
          label: 'Detecting classes in source files',
          href: 'https://tailwindcss.com/docs/detecting-classes-in-source-files',
          source: 'Tailwind CSS',
          note: 'Penegasan resmi bahwa nama class harus utuh di sumber — dasar larangan string dinamis.',
        },
        {
          label: 'Editor setup',
          href: 'https://tailwindcss.com/docs/editor-setup',
          source: 'Tailwind CSS',
          note: 'Memasang IntelliSense yang menghapus sebagian besar keluhan "class-nya terlalu banyak".',
        },
      ),
    ],
  ),

  written(
    'spacing-warna-tipografi',
    'Sistem Spacing, Warna & Tipografi',
    18,
    'Skala bawaan, cara membacanya, dan kenapa memakai skala mengalahkan angka bebas.',
    [
      terms(
        {
          term: 'rem',
          meaning:
            'Singkatan *root em*. Satuan ukuran yang **relatif terhadap ukuran huruf akar** halaman — biasanya 16px. Inilah alasan Tailwind memakainya alih-alih px: kalau pengguna memperbesar ukuran huruf di pengaturan browser demi keterbacaan, **seluruh tata letak ikut membesar secara proporsional**. Dengan px, teksnya membesar tapi kotaknya tidak, dan tulisannya jadi meluber.',
        },
        {
          term: 'skala spacing',
          meaning:
            'Deretan nilai jarak yang sudah ditetapkan, semuanya **kelipatan 4px**. Angka pada nama class adalah pengalinya, sehingga `p-4` berarti 4 × 4px = 16px. Menghafal satu titik acuan saja sudah cukup, yaitu `p-4` sama dengan 16px, karena sisanya bisa dihitung dari situ.',
        },
        {
          term: 'gap vs space-y',
          meaning:
            '`gap-4` memberi jarak antar-anak pada wadah **flex atau grid**, sementara `space-y-4` menyisipkan margin pada tiap anak kecuali yang pertama. `gap` lebih bersih dan lebih jarang mengejutkan; `space-y` berguna untuk wadah yang bukan flex maupun grid.',
        },
        {
          term: 'skala warna',
          meaning:
            'Deretan `50` sampai `950` untuk tiap warna, dari paling terang ke paling gelap. Angka `500` adalah warna dasarnya. Perlu diketahui, **angkanya bukan persentase apa pun** — ia sekadar penomoran berurutan yang membuat pemilihan tingkat kecerahan bisa ditebak.',
        },
        {
          term: 'opacity modifier',
          meaning:
            'Garis miring di belakang nama warna: `bg-red-500/50` berarti merah dengan tembus pandang 50%. Ini menggantikan kebiasaan lama menulis nilai `rgba` sendiri, dan bekerja pada hampir semua utility yang berhubungan dengan warna.',
        },
        {
          term: 'palet bawaan',
          meaning:
            'Warna-warna siap pakai Tailwind seperti `slate`, `indigo`, dan `blue`. Berguna untuk mencoba-coba, tapi **jangan dipakai di project sungguhan** — palet bawaan yang sama dipakai ribuan situs lain, dan hasilnya langsung terbaca sebagai tampilan template. Project ini memakai tokennya sendiri.',
        },
        {
          term: 'line-height',
          meaning:
            'Terjemahannya **tinggi baris** — jarak vertikal antar baris teks. Di Tailwind ia sudah menempel pada utility ukuran huruf: `text-sm` sekaligus menetapkan tinggi baris yang serasi. Kamu hanya perlu mengubahnya lewat `leading-*` kalau memang ada alasan khusus.',
        },
        {
          term: 'measure',
          meaning:
            'Istilah tipografi untuk **panjang satu baris teks**. Baris yang terlalu panjang membuat mata sulit menemukan awal baris berikutnya; yang ideal sekitar 45–75 karakter. Utility `max-w-prose` sudah menetapkan batas itu untukmu.',
        },
        {
          term: 'font stack',
          meaning:
            'Daftar font berurutan yang dicoba browser dari kiri: kalau yang pertama tidak tersedia, ia turun ke berikutnya. Yang terakhir harus font generik seperti `sans-serif`, agar selalu ada yang bisa dipakai apa pun perangkatnya.',
        },
      ),

      h2('Spacing'),
      code(
        'html',
        `
        <div class="p-4">      <!-- padding 1rem = 16px -->
        <div class="px-6 py-3"><!-- horizontal 1.5rem, vertikal 0.75rem -->
        <div class="mt-8">     <!-- margin-top 2rem -->
        <div class="gap-2">    <!-- gap 0.5rem, untuk flex/grid -->
        <div class="space-y-4"><!-- jarak antar anak, bukan padding -->
        `,
      ),
      table(
        ['Kelas', 'rem', 'px'],
        [
          ['`1`', '0.25', '4'],
          ['`2`', '0.5', '8'],
          ['`3`', '0.75', '12'],
          ['`4`', '1', '**16**'],
          ['`6`', '1.5', '24'],
          ['`8`', '2', '32'],
          ['`12`', '3', '48'],
          ['`16`', '4', '64'],
        ],
        'Angkanya = kelipatan 4px. `p-4` = 16px adalah titik acuan yang paling sering dipakai.',
      ),
      callout(
        'tip',
        'Kenapa skala mengalahkan angka bebas',
        'Skala membuat ritme visual konsisten tanpa kamu memikirkannya. Begitu satu orang menulis `padding: 13px`, konsistensi itu hilang dan tidak ada yang menyadarinya sampai desainnya terlihat "agak berantakan" tanpa sebab yang jelas.',
      ),

      h2('Warna'),
      code(
        'html',
        `
        <div class="bg-slate-100 text-slate-900 border-slate-300">
        <div class="bg-red-500/50">        <!-- opacity 50% -->
        <div class="text-primary">          <!-- token milik project ini -->
        `,
      ),
      p(
        'Perhatikan komentar di tiap baris menyebut nilai `rem`-nya, dan angkanya mengikuti satu pola, yaitu **satuannya 0,25rem alias 4px.** Jadi `p-4` berarti empat langkah atau 1rem, sedangkan `gap-2` berarti dua langkah atau 0,5rem. Mengetahui rumus itu membuat kamu tidak perlu menghafal tabel, sekaligus menjelaskan kenapa `p-3` dan `p-5` ada tetapi `p-4.5` tidak. Skalanya sengaja dibatasi supaya semua jarak di aplikasi berasal dari kelipatan yang sama. Baris `px-6 py-3` menunjukkan penulisan singkat yang paling sering dipakai, dengan `x` untuk kiri-kanan dan `y` untuk atas-bawah. Adapun `gap-2` sengaja disebut khusus karena ia **hanya bekerja pada flex atau grid**, tidak pada elemen biasa.',
      ),
      callout(
        'danger',
        'Jangan pakai palet bawaan Tailwind di project sungguhan',
        '`bg-indigo-500`, `text-gray-100`, dan gradien ungu-ke-biru adalah penanda paling jelas bahwa sebuah antarmuka dibuat dari template. Aturan `frontend.md` di project ini memperlakukannya sebagai **cacat**, bukan pilihan. Kunci palet sendiri sebagai token — caranya di sub-bab 1.8.',
      ),

      h2('Tipografi'),
      code(
        'html',
        `
        <p class="text-sm">        <!-- 0.875rem, line-height ikut menyesuaikan -->
        <p class="text-base">      <!-- 1rem -->
        <p class="text-lg">
        <h1 class="text-3xl font-semibold tracking-tight">

        <p class="leading-relaxed">   <!-- line-height -->
        <p class="tracking-wide">     <!-- letter-spacing -->
        <p class="text-balance">      <!-- heading tidak menyisakan satu kata sendirian -->
        <p class="text-pretty">       <!-- paragraf tidak menyisakan kata yatim -->
        `,
      ),
      p(
        'Setiap ukuran teks sudah membawa `line-height` yang masuk akal — kamu jarang perlu mengaturnya sendiri.',
      ),

      h2('Nilai sembarang, dan kapan boleh'),
      code(
        'html',
        `
        <div class="top-[117px] w-[calc(100%-2rem)] bg-[#1da1f2]">
        `,
      ),
      p(
        'Kurung siku adalah cara Tailwind menerima nilai yang **tidak ada di skala mana pun**, dan ketiga contoh sengaja dipilih karena masing-masing punya alasan yang sah. `top-[117px]` dipakai untuk menyelaraskan dengan tinggi header pihak ketiga yang angkanya memang ganjil. `w-[calc(100%-2rem)]` dipakai untuk perhitungan yang tidak bisa dinyatakan skala apa pun. `bg-[#1da1f2]` dipakai untuk warna merek eksternal yang memang bukan milik paletmu. Perhatikan sintaksnya tetap mengikuti nama utility biasa, hanya nilainya yang dikurung. Seperti kata kotak berikut, ini adalah **pintu darurat**. Kalau kamu menulis nilai sembarang yang sama lebih dari sekali, itu tanda ia sudah menjadi bagian dari sistemmu dan seharusnya diangkat jadi token.',
      ),
      callout(
        'warning',
        'Nilai sembarang adalah pintu darurat',
        'Sah untuk hal yang benar-benar di luar sistem: tinggi header pihak ketiga, warna merek eksternal, perhitungan `calc`. Kalau kamu menulisnya lebih dari sekali untuk hal yang sama, itu tanda ia seharusnya jadi token.',
      ),

      h2('Membaca kelas yang panjang'),
      code(
        'html',
        `
        <!-- Urutan yang konsisten membuatnya bisa dipindai -->
        <div class="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-2 text-sm text-text hover:bg-raised">
        <!--  layout        | spacing | bentuk & warna              | teks        | state -->
        `,
      ),
      p(
        'Plugin `prettier-plugin-tailwindcss` mengurutkan class secara otomatis dan konsisten. Project ini memakainya — jadi urutannya tidak pernah jadi bahan perdebatan.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Situasi yang hampir pasti kamu temui, desainer mengirim rancangan dari Figma, dan angkanya tidak jatuh di skala. Padding kartunya 18px, jarak antarbaris 13px, dan ukuran huruf judulnya 22px. Skala Tailwind tidak punya satu pun dari ketiganya. Pertanyaannya bukan "bagaimana memaksakan angka ini" melainkan **angka mana yang benar-benar penting**.',
      ),
      p(
        'Untuk menjawabnya, ada baiknya tahu dulu bagaimana skala spacing itu sebenarnya dibentuk. Ia bukan tabel berisi puluhan nilai, melainkan satu variabel dan satu perkalian.',
      ),
      code(
        'text',
        `
        Isi sebenarnya dari CSS yang dihasilkan Tailwind 4.3.3:

          :root {
            --spacing: 0.25rem;
          }
          .p-4 {
            padding: calc(var(--spacing) * 4);
          }
          .gap-4 {
            gap: calc(var(--spacing) * 4);
          }

        Jadi p-4 = 0.25rem x 4 = 1rem = 16px pada ukuran huruf akar bawaan.
        Dan angka di belakang nama utility adalah pengalinya, bukan pikselnya.
        `,
        { caption: 'Dibaca langsung dari keluaran @tailwindcss/postcss 4.3.3.' },
      ),
      p(
        'Karena bentuknya perkalian, angka apa pun bisa dipakai tanpa perlu terdaftar, termasuk `p-4.5` yang menghasilkan 18px. Jadi angka 18px dari desainer sebenarnya bukan masalah. Yang layak dipertanyakan adalah apakah 18px itu keputusan atau kebetulan, dan pertanyaan itu hanya bisa dijawab desainernya.',
      ),
      table(
        ['Angka dari rancangan', 'Pertanyaan yang tepat', 'Keputusan yang biasanya benar'],
        [
          [
            'Padding 18px, sekali muncul',
            'Apakah 16px terasa berbeda?',
            'Pakai `p-4`. Selisih 2px tidak dilihat siapa pun, dan konsistensi lebih berharga',
          ],
          [
            'Padding 18px, muncul di semua kartu',
            'Apakah ini memang ritme desainnya?',
            'Pakai `p-4.5`, atau lebih baik ubah `--spacing` supaya seluruh skalanya ikut',
          ],
          [
            'Judul 22px',
            'Apakah ia bagian dari tangga tipografi?',
            'Daftarkan sebagai token `--text-judul`, jangan tulis `text-[22px]` berulang kali',
          ],
          [
            'Lebar sidebar 268px',
            'Apakah angkanya bermakna atau hasil menggeser?',
            'Nilai sembarang `w-[268px]` justru pas di sini — ia memang satu tempat, bukan ritme',
          ],
        ],
      ),
      p(
        'Baris terakhir penting supaya nilai sembarang tidak dianggap dosa. Ia dosa ketika dipakai untuk sesuatu yang **berulang**, sebab di situ ia menghancurkan sistem. Untuk satu ukuran yang memang hanya ada di satu tempat, menulis `w-[268px]` jauh lebih jujur daripada memaksakan `w-64` lalu tampilannya meleset.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Bagian nilai sembarang punya sifat yang perlu diketahui sebelum dipakai, yaitu **Tailwind tidak memvalidasi isinya sama sekali**. Apa pun yang kamu tulis di dalam kurung siku diteruskan apa adanya ke CSS, dan penilaian benar-salahnya diserahkan sepenuhnya ke peramban.',
      ),
      code(
        'text',
        `
        <div class="bg-[#gggggg] w-[10qq] p-4">nilai tak valid</div>

        CSS yang dihasilkan Tailwind 4.3.3 — buildnya SUKSES, tanpa peringatan:

          .w-\\[10qq\\]        { width: 10qq; }
          .bg-\\[\\#gggggg\\]   { background-color: #gggggg; }

        Yang dibaca Chrome 151 lewat getComputedStyle:

          background-color = rgba(0, 0, 0, 0)   <-- dibuang, elemennya transparan
          width            = 1024px             <-- dibuang, kembali ke auto
          padding          = 16px               <-- p-4 valid, tetap jalan
        `,
        { caption: 'Dijalankan sungguhan: dikompilasi Tailwind 4.3.3, lalu diukur di Chrome 151.' },
      ),
      p(
        'Jadi ada dua lapis yang sama-sama diam. Tailwind diam karena ia memang tidak menilai isi kurung siku, dan peramban diam karena membuang deklarasi yang tidak bisa diurai adalah perilaku CSS yang benar sejak dulu. Hasilnya, satu huruf salah ketik menghasilkan elemen transparan tanpa satu pun petunjuk di terminal.',
      ),
      p('Ada satu jebakan lagi di nilai sembarang yang lebih halus, yaitu spasi.'),
      code(
        'text',
        `
        <div class="w-[calc(100% - 2rem)]"></div>   <-- spasi asli di dalam kurung
        <div class="w-[calc(100%-2rem)]"></div>
        <div class="w-[calc(100%_-_2rem)]"></div>

        Utility yang benar-benar dihasilkan:

          .w-\\[calc\\(100\\%-2rem\\)\\]     { width: calc(100% - 2rem); }
          .w-\\[calc\\(100\\%_-_2rem\\)\\]   { width: calc(100% - 2rem); }

        Yang pertama TIDAK dihasilkan sama sekali.
        `,
        {
          caption:
            'Dijalankan sungguhan. Tailwind 4.3.3 menyisipkan sendiri spasi di sekitar tanda minus.',
        },
      ),
      p(
        'Alasannya sederhana begitu diingat bahwa atribut `class` memisahkan nama class dengan spasi. Begitu ada spasi asli di dalam kurung siku, pemindai membaca `w-[calc(100%` sebagai satu class dan `2rem)]` sebagai class lain, dan tidak satu pun dari keduanya berarti apa-apa. Pakai garis bawah bila memang butuh spasi, dan Tailwind akan menerjemahkannya kembali.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di bagian ini jarang membuat halaman rusak total. Ia membuat halaman **pelan-pelan tidak konsisten**, dan itu jenis kerusakan yang baru terasa setelah beberapa bulan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengira `p-4` berarti 4px',
            'Angkanya kan 4',
            'Angkanya pengali `--spacing`. Diuji sungguhan, `p-4` menghasilkan `calc(0.25rem * 4)` alias 16px',
          ],
          [
            'Memakai `text-[15px]` di banyak tempat',
            'Ukurannya memang pas',
            'Tangga tipografi jadi punya anak tangga tak resmi yang tidak ikut berubah saat tema diubah. Daftarkan sebagai token',
          ],
          [
            'Menulis nilai sembarang lalu tidak memeriksanya di peramban',
            'Buildnya sukses',
            'Diuji sungguhan, isi kurung siku tidak divalidasi siapa pun. `bg-[#gggggg]` menghasilkan elemen transparan tanpa error',
          ],
          [
            'Menulis spasi di dalam kurung siku',
            'Begitulah CSS ditulis',
            'Diuji sungguhan, classnya terpecah di spasi dan tidak dihasilkan sama sekali. Pakai garis bawah',
          ],
          [
            'Memakai `text-gray-400` untuk teks pendukung',
            'Terlihat lembut dan rapi',
            'Diukur, kontrasnya 2,60:1 di atas putih. Minimum WCAG untuk teks biasa 4,5:1, dan `text-gray-500` sudah 4,84:1',
          ],
          [
            'Mengubah satu nilai spacing langsung di komponen',
            'Cuma satu tempat ini',
            'Ia jadi pengecualian yang tidak terdokumentasi. Kalau memang perlu berbeda, jadikan token agar niatnya terbaca',
          ],
        ],
      ),
      p(
        'Baris kelima adalah kesalahan yang paling sering lolos review, sebab hasilnya memang terlihat enak dipandang oleh mata yang sehat di layar yang bagus. Angkanya sudah diukur langsung dari palet bawaan Tailwind 4.3.3, dan tiga tingkat abu yang berdekatan memberi hasil yang sangat berbeda: `text-gray-400` 2,60:1, `text-gray-500` 4,84:1, dan `text-gray-600` 7,56:1. Naik satu tingkat saja sudah memindahkan teksmu dari gagal ke lolos.',
      ),
      callout(
        'tip',
        'Cara membaca skala tanpa menghafalnya',
        'Untuk spacing, kalikan angkanya dengan 4 untuk mendapat piksel. `p-2` jadi 8px, `p-6` jadi 24px, `p-12` jadi 48px. Untuk warna, angka kecil berarti terang dan angka besar berarti gelap, sehingga `bg-red-50` adalah latar lembut dan `text-red-900` adalah teks pekat. Dua aturan itu sudah menutup sebagian besar kebutuhan sehari-hari.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Skala spacing = kelipatan 4px; `p-4` = 16px sebagai acuan.',
        'Skala menjaga ritme visual tanpa perlu dipikirkan.',
        'Palet bawaan Tailwind adalah penanda template — kunci palet sendiri.',
        'Ukuran teks sudah membawa line-height yang wajar.',
        'Nilai sembarang untuk pengecualian nyata; kalau berulang, jadikan token.',
      ),
      references(
        {
          label: 'Padding',
          href: 'https://tailwindcss.com/docs/padding',
          source: 'Tailwind CSS',
          note: 'Tabel lengkap skala spacing beserta padanan rem dan px-nya.',
        },
        {
          label: 'Colors',
          href: 'https://tailwindcss.com/docs/colors',
          source: 'Tailwind CSS',
          note: 'Skala 50–950, opacity modifier, dan cara mendefinisikan warna sendiri.',
        },
        {
          label: 'Font size',
          href: 'https://tailwindcss.com/docs/font-size',
          source: 'Tailwind CSS',
          note: 'Menegaskan bahwa tinggi baris sudah menempel pada tiap utility ukuran huruf.',
        },
        {
          label: 'CSS values and units',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units',
          source: 'MDN',
          note: 'Alasan `rem` lebih baik daripada `px` bagi pengguna yang memperbesar ukuran huruf.',
        },
      ),
    ],
  ),

  written(
    'flexbox-grid',
    'Layout dengan Flexbox & Grid',
    22,
    'Dua sistem layout, kapan memilih yang mana, dan pola yang paling sering dipakai.',
    [
      terms(
        {
          term: 'Flexbox',
          meaning:
            'Sistem tata letak **satu dimensi** — ia mengatur elemen dalam satu baris **atau** satu kolom, bukan keduanya sekaligus. Kekuatannya ada pada pembagian ruang sisa: ia pandai memutuskan siapa melar dan siapa menyusut. Pilih ini untuk navbar, deretan tombol, dan apa pun yang mengalir dalam satu arah.',
        },
        {
          term: 'Grid',
          meaning:
            'Sistem tata letak **dua dimensi** — baris dan kolom sekaligus. Bedanya dengan Flexbox bukan soal mana yang lebih baru: Grid membiarkanmu menetapkan kerangkanya **dari wadah**, sementara Flexbox membiarkan isinya yang menentukan. Pilih Grid untuk galeri, dashboard, dan tata letak halaman.',
        },
        {
          term: 'main axis / cross axis',
          meaning:
            'Terjemahannya **sumbu utama** dan **sumbu silang**. Pada Flexbox, `justify-*` mengatur sepanjang sumbu utama sementara `items-*` mengatur sumbu silang. Yang sering membingungkan: **arah keduanya bertukar** begitu kamu mengubah `flex-row` menjadi `flex-col`.',
        },
        {
          term: 'flex-1',
          meaning:
            'Singkatan dari "ambil semua ruang sisa yang tersedia". Dipakai pada anak yang harus melar mengisi sisa baris — misalnya kolom isi di sebelah sidebar yang lebarnya tetap.',
        },
        {
          term: 'shrink-0',
          meaning:
            'Mencegah sebuah elemen **menyusut** di bawah ukuran alaminya. Sering dibutuhkan untuk ikon dan avatar, yang tanpa itu bisa gepeng ketika teks di sebelahnya terlalu panjang.',
        },
        {
          term: 'min-w-0',
          meaning:
            'Perbaikan yang tampak aneh tapi sangat sering dibutuhkan. Anak sebuah flex container secara bawaan **menolak menyusut lebih kecil dari isinya**, sehingga `truncate` tidak bekerja dan teks panjang malah meluber. `min-w-0` mematikan perilaku itu.',
        },
        {
          term: 'auto-fill / auto-fit',
          meaning:
            'Kata kunci Grid untuk membuat jumlah kolom **menyesuaikan sendiri** dengan lebar yang tersedia, tanpa satu pun breakpoint. Bedanya halus: `auto-fill` mempertahankan kolom kosong, `auto-fit` menciutkannya sehingga isi yang ada melar memenuhi ruang.',
        },
        {
          term: 'minmax',
          meaning:
            'Fungsi CSS yang menetapkan **batas bawah dan batas atas** ukuran sebuah kolom: `minmax(240px, 1fr)` berarti "jangan pernah lebih sempit dari 240px, selebihnya bagi rata". Ini yang membuat grid responsif tanpa breakpoint jadi mungkin.',
        },
        {
          term: 'fr',
          meaning:
            'Singkatan *fraction*, artinya **pecahan ruang tersisa**. `1fr 2fr` berarti kolom kedua mendapat dua kali lebar kolom pertama dari sisa ruang. Berbeda dari persen, ia menghitung setelah gap dan ukuran tetap dikurangi lebih dulu.',
        },
        {
          term: 'gap',
          meaning:
            'Jarak antar-anak pada Flexbox maupun Grid. Menggantikan kebiasaan lama memberi margin pada tiap anak lalu menghapusnya pada yang terakhir — sebuah trik yang selalu berakhir dengan satu kasus tepi yang terlupakan.',
        },
      ),

      h2('Memilih di antara keduanya'),
      table(
        ['Kebutuhan', 'Pakai'],
        [
          ['Satu baris atau satu kolom', '**Flex**'],
          ['Baris dan kolom sekaligus', '**Grid**'],
          ['Ukuran mengikuti isi', 'Flex'],
          ['Ukuran ditentukan wadah', 'Grid'],
          ['Kartu sejajar dengan tinggi sama', 'Grid'],
          ['Navbar, toolbar, deretan tombol', 'Flex'],
        ],
      ),

      h2('Flexbox'),
      code(
        'html',
        `
        <div class="flex items-center justify-between gap-4">
          <span>Kiri</span>
          <span>Kanan</span>
        </div>

        <div class="flex flex-col gap-2">   <!-- arah kolom -->
        <div class="flex flex-wrap gap-3">  <!-- boleh turun baris -->

        <!-- Yang satu ini mengisi sisa ruang -->
        <div class="flex gap-4">
          <aside class="w-64 shrink-0">Sidebar</aside>
          <main class="min-w-0 flex-1">Konten</main>
        </div>
        `,
      ),
      p(
        'Tiga pola pertama menutup sebagian besar kebutuhan sehari-hari. `flex items-center justify-between` adalah resep navbar, dengan `items-center` yang menyejajarkan secara vertikal dan `justify-between` yang mendorong isinya ke dua ujung. `flex-col` memutar arahnya menjadi menumpuk ke bawah, dan perhatikan `gap` tetap bekerja di kedua arah. `flex-wrap` mengizinkan isi turun baris saat ruangnya habis, sesuatu yang **tidak** terjadi secara bawaan. Blok terakhir adalah pola sidebar yang paling sering dipakai, dan tiga class di dalamnya bekerja bersama. `w-64` menetapkan lebar sidebar, `shrink-0` mencegahnya menyusut saat konten mendesak, dan `flex-1` menyuruh konten mengisi sisa ruang. `min-w-0` yang menyertainya dijelaskan di kotak berikut, dan ia adalah perbaikan yang paling sering dibutuhkan sekaligus paling jarang diketahui.',
      ),
      callout(
        'danger',
        '`min-w-0` adalah perbaikan yang paling sering dibutuhkan',
        'Anak flex punya `min-width: auto` secara bawaan, artinya **ia menolak menyusut lebih kecil dari isinya**. Satu teks panjang tanpa spasi akan membuat seluruh layout melebar dan halaman bisa di-scroll ke samping. `min-w-0` mengizinkannya menyusut, dan itulah yang membuat `truncate` bekerja.',
      ),
      code(
        'html',
        `
        <!-- Tidak akan terpotong — layout malah melebar -->
        <div class="flex"><span class="truncate">teks sangat panjang…</span></div>

        <!-- Bekerja -->
        <div class="flex"><span class="min-w-0 truncate">teks sangat panjang…</span></div>
        `,
      ),
      p(
        'Kedua baris ini memakai `truncate` yang sama, tetapi hanya yang kedua benar-benar memotong teksnya. Sebabnya persis seperti dijelaskan kotak di atas, sebab `truncate` bekerja dengan menyembunyikan luapan teks dan itu hanya mungkin kalau elemennya **boleh lebih sempit dari isinya**. Pada baris pertama, `min-width: auto` bawaan membuat span menolak menyusut, jadi ia justru melebar sampai seluruh teks muat dan layout ikut melebar bersamanya. Gejalanya khas dan mudah dikenali, yaitu halaman tiba-tiba bisa di-scroll ke samping padahal tidak ada elemen yang jelas-jelas kelebaran. Kalau kamu menemuinya, `min-w-0` pada anak flex adalah tersangka pertama.',
      ),

      h2('Grid'),
      code(
        'html',
        `
        <!-- Tiga kolom sama lebar -->
        <div class="grid grid-cols-3 gap-4">

        <!-- Responsif: satu kolom di HP, tiga di layar besar -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

        <!-- Kolom dengan lebar berbeda -->
        <div class="grid grid-cols-[280px_1fr] gap-6">
          <aside>Sidebar</aside>
          <main class="min-w-0">Konten</main>
        </div>

        <!-- Satu item mengambil dua kolom -->
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-2">Lebar</div>
          <div>Biasa</div>
        </div>
        `,
      ),
      p(
        'Perbedaan mendasar dari flex terlihat di sini, karena pada grid **jumlah dan lebar kolom ditentukan induknya** dan bukan disepakati anak-anaknya. `grid-cols-3` membagi ruang jadi tiga bagian sama besar. Pola kedua menerapkan *mobile-first* dari sub-bab responsif, dengan satu kolom sebagai dasar lalu `md:` dan `lg:` yang menambah kolom saat layarnya melebar. `grid-cols-[280px_1fr]` menunjukkan nilai sembarang untuk grid, dan tanda **garis bawah** di sana penting karena ia menggantikan spasi, sebab nama class tidak boleh mengandung spasi. Artinya kolom pertama tepat 280px dan kolom kedua mengambil sisanya. Pola terakhir memakai `col-span-2` pada anaknya, yang merupakan satu-satunya tempat anak grid ikut menentukan, yaitu **berapa kolom yang ia tempati**.',
      ),

      h2('Grid responsif tanpa breakpoint'),
      code(
        'html',
        `
        <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
        `,
      ),
      p(
        'Bagian dalam kurung siku itu adalah CSS grid biasa, dan dua fungsinya bekerja berpasangan. `minmax(240px, 1fr)` berkata "tiap kolom minimal 240px, tapi boleh melar mengisi ruang". `auto-fill` berkata "buat sebanyak mungkin kolom yang muat". Gabungannya membuat browser sendiri yang menghitung, sehingga di layar 800px muat tiga kolom, di layar 500px hanya dua, dan di ponsel satu, **tanpa satu pun breakpoint yang kamu tulis**. Perhatikan bentuk yang dipakai adalah `grid-cols-[…]` dan bukan `[grid-template-columns:…]`. Keduanya menghasilkan CSS yang sama, tetapi yang pertama lebih pendek dan mengikuti penamaan utility lain. Kelemahannya juga perlu disadari. Karena breakpoint-nya ditentukan lebar wadah, kamu kehilangan kendali atas jumlah kolom di ukuran tertentu, sehingga untuk kasus itu `md:grid-cols-2` yang eksplisit tetap lebih tepat.',
      ),
      p(
        'Kolom menyesuaikan sendiri berdasarkan ruang yang tersedia — tanpa satu pun `md:` atau `lg:`. Berguna untuk galeri kartu yang jumlahnya berubah-ubah.',
      ),

      h2('Pola yang sering dipakai'),
      code(
        'html',
        `
        <!-- Konten terpusat dengan lebar maksimum -->
        <div class="mx-auto max-w-4xl px-4">

        <!-- Footer menempel di bawah, meski konten pendek -->
        <div class="flex min-h-dvh flex-col">
          <main class="flex-1">…</main>
          <footer>…</footer>
        </div>

        <!-- Sidebar sticky setinggi layar -->
        <aside class="sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto">
        `,
      ),
      callout(
        'tip',
        'Pakai `dvh`, bukan `vh`',
        '`100vh` di ponsel tidak sama dengan tinggi layar yang terlihat — bar alamat browser membuatnya meleset, sehingga bagian bawah terpotong. `100dvh` (dynamic viewport height) mengikuti tinggi yang benar-benar terlihat.',
      ),

      h2('Perataan'),
      table(
        ['Utility', 'Flex', 'Grid'],
        [
          ['`items-*`', 'Sumbu silang', 'Vertikal dalam sel'],
          ['`justify-*`', 'Sumbu utama', 'Horizontal dalam sel'],
          ['`place-items-center`', '—', 'Pusatkan keduanya'],
          ['`gap-*`', 'Ya', 'Ya'],
        ],
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Ambil satu susunan yang muncul di hampir semua aplikasi, yaitu baris daftar berkas. Sebelah kiri ada ikon, tengahnya nama berkas beserta keterangan kecil, dan kanannya tombol aksi. Bentuknya sepele, dan justru baris seperti inilah yang paling sering rusak di produksi, sebab nama berkas yang dipakai saat mengembangkan selalu pendek sedangkan nama berkas milik pengguna tidak.',
      ),
      code(
        'tsx',
        `
        // Susunan yang terlihat benar, dan memang berfungsi sampai namanya panjang.
        function BarisBerkas({ nama, keterangan }: { nama: string; keterangan: string }) {
          return (
            <div className="flex w-64 items-center gap-2 border">
              <IkonBerkas className="size-5 shrink-0" />
              <div className="flex-1">
                <p className="truncate font-medium">{nama}</p>
                <p className="truncate text-sm">{keterangan}</p>
              </div>
              <button className="shrink-0 border px-2">Hapus</button>
            </div>
          );
        }
        `,
        { caption: 'Tiga bagian, dua di antaranya shrink-0, tengahnya flex-1. Terlihat lengkap.' },
      ),
      p(
        'Susunan itu sudah memakai `truncate` pada kedua teksnya, dan `shrink-0` pada ikon serta tombolnya. Semua yang biasanya disebut di tutorial sudah ada. Berikut hasil pengukurannya ketika nama berkasnya panjang.',
      ),
      code(
        'text',
        `
        Nama berkas yang diuji:
          laporan-keuangan-kuartal-ketiga-2026-final-revisi.pdf

        Diukur di Chrome 151, wadah w-64 = 256px:

          TANPA min-w-0
            lebar kolom teks        : 400,66px      <-- lebih lebar dari wadahnya
            min-width yang dihitung : auto
            isi baris melebar ke    : 475px
            tepi kanan tombol Hapus : 476px         <-- 220px di luar wadah

          DENGAN min-w-0
            lebar kolom teks        : 179,77px
            min-width yang dihitung : 0px
            isi baris melebar ke    : 254px         <-- muat
        `,
        {
          caption:
            'Dijalankan sungguhan: Tailwind 4.3.3 dikompilasi, geometri dibaca lewat getBoundingClientRect di Chrome 151.',
        },
      ),
      p(
        'Penyebabnya satu aturan CSS yang jarang disebut. Sebuah flex item punya `min-width: auto` secara bawaan, dan `auto` di situ berarti **tidak boleh lebih kecil daripada isi terkecilnya**. Isi terkecil dari kolom tengah itu adalah kata terpanjang di dalamnya, dan nama berkas tanpa spasi seluruhnya adalah satu kata. Jadi kolom itu menolak menyempit, `flex-1` tidak bisa menahannya, dan tombolnya terdorong keluar.',
      ),
      p(
        '`truncate` tidak menyelamatkannya karena `truncate` menempel pada `<p>`, sedangkan yang menolak menyempit adalah `<div>` pembungkusnya. Aturan `min-width: auto` menjadi nol hanya pada elemen yang **dirinya sendiri** punya `overflow` selain `visible`, dan pembungkus itu tidak punya. Karena itu `min-w-0` harus dipasang pada flex item, bukan pada teksnya.',
      ),
      callout(
        'tip',
        'Aturan yang cukup diingat satu kali',
        'Setiap kali sebuah flex item berisi teks yang bisa panjang, pasang `min-w-0` padanya. Kalau item itu adalah pembungkus, `min-w-0` di pembungkus dan `truncate` di teksnya, dua-duanya diperlukan. Gejala yang harus memicu ingatan ini adalah tombol atau ikon yang terdorong keluar dari kotaknya ketika datanya panjang.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Layout tidak pernah melempar error. Ia hanya menghasilkan tampilan yang salah, dan itu membuatnya lebih sulit ditelusuri daripada kode yang gagal berjalan. Kegagalan senyap kedua yang paling sering muncul adalah `space-x-*` yang bertemu `flex-wrap`.',
      ),
      code(
        'text',
        `
        Empat item selebar w-24 di dalam wadah w-64, dengan flex-wrap:

          <div class="flex w-64 flex-wrap space-x-4">...</div>
          <div class="flex w-64 flex-wrap gap-4">...</div>

        Diukur di Chrome 151:

          space-x-4 + flex-wrap
            tinggi wadah         : 54px
            jarak antar baris    : 2,00px      <-- hanya setebal border
            margin item ke-2     : 0px / 16px
            margin item terakhir : 0px

          gap-4 + flex-wrap
            tinggi wadah         : 70px
            jarak antar baris    : 18,00px     <-- sesuai harapan
        `,
        { caption: 'Dijalankan sungguhan dan diukur di Chrome 151.' },
      ),
      p(
        'Sebabnya terlihat begitu CSS yang dihasilkannya dibaca. `space-x-4` bukan properti jarak, melainkan margin yang dipasang ke saudara-saudara tertentu.',
      ),
      code(
        'text',
        `
        Keluaran Tailwind 4.3.3 untuk space-x-4:

          :where(.space-x-4 > :not(:last-child)) {
            margin-inline-end: calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-x-reverse)));
          }
        `,
      ),
      p(
        'Tiga akibat langsung yang perlu diketahui. Pertama, ia hanya mengatur jarak **horizontal**, jadi baris yang membungkus ke bawah tidak mendapat jarak sama sekali. Kedua, `:not(:last-child)` menghitung urutan di DOM, bukan posisi visual, sehingga item terakhir di setiap baris tampak tetap punya margin di kanannya. Ketiga, `:where()` membuat specificity aturan itu nol, sehingga `mr-*` atau `ml-*` milik anaknya sendiri akan mengalahkannya tanpa perlu apa pun.',
      ),
      p(
        'Kesimpulan praktisnya, pakai `gap` untuk hampir semua kebutuhan jarak di flex dan grid. `space-x-*` masih berguna pada satu kasus yang cukup sempit, yaitu ketika kamu butuh jarak antaranak tapi wadahnya bukan flex maupun grid, misalnya deretan elemen inline biasa.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan layout di Tailwind hampir selalu kesalahan CSS yang dibawa masuk, bukan kesalahan utility. Nama utility-nya benar, aturan CSS di belakangnya yang belum dipahami.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `truncate` tanpa `min-w-0` di flex',
            '`truncate` memang untuk memotong teks',
            'Diukur, kolomnya membengkak jadi 400,66px di wadah 256px dan tombolnya terdorong 220px ke luar. `min-w-0` wajib di flex item-nya',
          ],
          [
            'Memakai `space-x-*` bersama `flex-wrap`',
            'Keduanya soal jarak dan pembungkusan',
            'Diukur, jarak antarbaris jadi 2px. `space-x-*` adalah margin horizontal, bukan jarak dua arah. Pakai `gap`',
          ],
          [
            'Memakai grid untuk semua susunan',
            'Ia lebih modern dan lebih kuat',
            'Untuk satu baris berisi beberapa item, flex lebih pendek dan lebih terbaca. Grid unggul saat ada dua sumbu',
          ],
          [
            'Menganggap `flex-1` menjamin item tidak melebar',
            'Namanya kan mengisi ruang',
            '`flex-1` mengatur pembagian ruang, sedangkan batas minimalnya diatur `min-width`. Keduanya urusan berbeda',
          ],
          [
            'Memakai `w-full` pada flex item, bukan `flex-1`',
            'Sama-sama mengisi',
            '`w-full` bernilai 100% dari induknya sehingga saudara-saudaranya terdesak. `flex-1` membagi ruang yang tersisa',
          ],
          [
            'Menyusun grid responsif dengan tumpukan breakpoint',
            'Itu cara yang diajarkan',
            '`grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]` menyesuaikan diri tanpa satu pun breakpoint, dan tidak salah ketika wadahnya sempit di layar lebar',
          ],
        ],
      ),
      p(
        'Baris terakhir mengandung sesuatu yang halus dan layak diperjelas. Breakpoint mengukur **lebar jendela**, bukan lebar wadah tempat gridmu berada. Kalau grid itu diletakkan di dalam sidebar sempit pada layar 1440px, `lg:grid-cols-3` akan tetap memecahnya menjadi tiga kolom sempit, sebab jendelanya memang lebar. Pola `auto-fit` mengukur ruang yang sebenarnya tersedia, jadi ia benar di kedua situasi.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Flex untuk satu sumbu; Grid untuk dua sumbu.',
        '`min-w-0` wajib pada anak flex yang isinya bisa panjang — tanpanya `truncate` tidak bekerja.',
        '`grid-cols-[280px_1fr]` untuk kolom berlebar berbeda.',
        '`auto-fill` + `minmax` membuat grid responsif tanpa breakpoint.',
        'Pakai `dvh` untuk tinggi layar di perangkat mobile.',
      ),
      references(
        {
          label: 'Flex',
          href: 'https://tailwindcss.com/docs/flex',
          source: 'Tailwind CSS',
          note: 'Utility `flex-1`, `shrink-0`, dan `basis-*` beserta perilaku bawaannya.',
        },
        {
          label: 'Grid template columns',
          href: 'https://tailwindcss.com/docs/grid-template-columns',
          source: 'Tailwind CSS',
          note: 'Termasuk sintaks nilai sembarang untuk `auto-fill` dan `minmax`.',
        },
        {
          label: 'Basic concepts of flexbox',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox',
          source: 'MDN',
          note: 'Sumbu utama dan sumbu silang — dasar kebingungan `justify` versus `items`.',
        },
        {
          label: 'CSS grid layout',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout',
          source: 'MDN',
          note: 'Panduan lengkap Grid, termasuk satuan `fr` dan fungsi `minmax`.',
        },
        {
          label: 'The large, small, and dynamic viewport units',
          href: 'https://web.dev/blog/viewport-units',
          source: 'web.dev',
          note: 'Alasan `100vh` meleset di ponsel dan kenapa `dvh` menggantikannya.',
        },
      ),
    ],
  ),

  written(
    'responsif',
    'Responsif: breakpoint & mobile-first',
    18,
    'Menulis dari layar kecil ke besar — dan kenapa arah itu penting.',
    [
      terms(
        {
          term: 'mobile-first',
          meaning:
            'Terjemahannya **layar kecil lebih dulu**. Aturan Tailwind yang sering disalahpahami: class **tanpa awalan** berlaku untuk **semua ukuran**, dan `md:` berarti "mulai dari sedang **ke atas**". Jadi `p-2 md:p-6` berarti padding 2 di ponsel dan 6 mulai dari tablet — bukan sebaliknya.',
        },
        {
          term: 'breakpoint',
          meaning:
            'Terjemahannya **titik ubah**. Lebar layar di mana tata letak berganti bentuk: `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem. Prinsip yang lebih penting daripada menghafal angkanya: **breakpoint mengikuti kapan tata letakmu mulai jelek**, bukan mengikuti nama perangkat tertentu.',
        },
        {
          term: 'min-width',
          meaning:
            'Jenis kueri media yang dipakai Tailwind: `md:` berarti "**lebar minimal** 48rem". Inilah alasan teknis kenapa arahnya harus dari kecil ke besar — tiap breakpoint menimpa yang lebih kecil, bukan sebaliknya.',
        },
        {
          term: 'container query',
          meaning:
            'Terjemahannya **kueri wadah**. Kemampuan sebuah komponen bereaksi terhadap **lebar wadahnya sendiri**, bukan lebar layar. Ini menyelesaikan masalah lama: kartu yang sama bisa muncul di sidebar sempit maupun kolom utama yang lebar, dan dengan media query biasa kamu tidak punya cara membedakannya.',
        },
        {
          term: 'viewport',
          meaning:
            'Terjemahannya **area pandang** — bagian halaman yang benar-benar terlihat di layar. Berbeda dari ukuran layar fisik, karena bar alamat browser dan keyboard di ponsel ikut memakan ruangnya.',
        },
        {
          term: 'progressive enhancement',
          meaning:
            'Terjemahannya **peningkatan bertahap**. Inilah alasan filosofis di balik mobile-first, yaitu mulai dari tampilan paling sederhana yang pasti bekerja, lalu **tambahkan** kemampuan saat ruangnya tersedia. Kebalikannya, yaitu merancang untuk desktop lalu mengecilkannya, hampir selalu menghasilkan kompromi yang buruk di ponsel.',
        },
        {
          term: 'touch target',
          meaning:
            'Terjemahannya **sasaran sentuh**. Area yang bisa ditekan jari, minimal sekitar 44×44 piksel. Ini yang paling sering terlupakan saat menguji hanya dengan mouse: tombol yang mudah diklik kursor bisa hampir mustahil ditekan dengan ibu jari.',
        },
        {
          term: 'safe area',
          meaning:
            'Terjemahannya **area aman**. Bagian layar yang tidak tertutup poni, sudut membulat, atau bilah gestur. Dijangkau lewat `env(safe-area-inset-*)`, dan wajib diperhatikan untuk tampilan yang memenuhi layar penuh.',
        },
      ),

      h2('Mobile-first'),
      code(
        'html',
        `
        <div class="text-sm md:text-base lg:text-lg">
        <!--        ^default   ^≥768px    ^≥1024px -->
        `,
      ),
      p(
        'Baris komentar di bawahnya menunjukkan hal yang paling sering disalahpahami pemula. Class `text-sm` **tanpa prefix bukan berarti "khusus mobile"**, sebab ia berlaku di semua ukuran layar termasuk desktop. Prefix `md:` dan `lg:` hanya **menimpanya** mulai lebar tertentu ke atas. Jadi urutan bacanya seperti lapisan, dimulai dari yang paling dasar, lalu tiap prefix menambahkan pengecualian untuk layar yang lebih lebar. Itulah arti *mobile-first*, dan ia bukan sekadar gaya penulisan. Karena class tanpa prefix selalu jadi dasarnya, tampilan di ponsel adalah yang **pasti bekerja**, sementara tampilan desktop adalah penyempurnaan di atasnya.',
      ),
      callout(
        'info',
        'Prefix berarti "dan ke atas"',
        '`md:text-base` artinya "mulai 768px ke atas". Class tanpa prefix berlaku di **semua** ukuran, jadi ia adalah gaya dasar untuk layar terkecil — bukan gaya desktop yang dikecilkan.',
      ),
      table(
        ['Prefix', 'Minimal lebar'],
        [
          ['(tanpa)', '0'],
          ['`sm:`', '640px'],
          ['`md:`', '768px'],
          ['`lg:`', '1024px'],
          ['`xl:`', '1280px'],
          ['`2xl:`', '1536px'],
        ],
      ),

      h2('Kenapa mulai dari kecil'),
      code(
        'html',
        `
        <!-- Mobile-first: dasar sederhana, kerumitan ditambahkan -->
        <div class="flex flex-col gap-4 md:flex-row md:gap-8">

        <!-- Desktop-first: harus membatalkan sesuatu di tiap breakpoint -->
        <div class="flex flex-row gap-8 max-md:flex-col max-md:gap-4">
        `,
      ),
      p(
        'Yang pertama menambah; yang kedua membatalkan. Menambah selalu lebih mudah dilacak — dan mengecilkan desain desktop hampir selalu menghasilkan kompromi yang lebih buruk daripada membesarkan desain mobile.',
      ),

      h2('Menyembunyikan dan menampilkan'),
      code(
        'html',
        `
        <div class="hidden md:block">Hanya layar besar</div>
        <div class="md:hidden">Hanya layar kecil</div>
        `,
      ),
      p(
        'Kedua baris ini bekerja berpasangan dan sering dipakai bersama, misalnya navigasi penuh di desktop dan tombol hamburger di ponsel. Baris pertama dibaca "sembunyikan sebagai dasar, tampilkan mulai `md`", sedangkan baris kedua kebalikannya, yaitu "tampil sebagai dasar, sembunyikan mulai `md`". Perhatikan yang pertama butuh **dua** class sedangkan yang kedua cukup satu, karena elemen memang tampil secara bawaan. Peringatan di kotak berikut layak diperhatikan sebelum memakainya untuk konten besar. Class `hidden` hanya `display: none`, jadi elemennya tetap ada di DOM dan gambarnya tetap diunduh, sehingga menyembunyikan galeri gambar dengan cara ini tidak menghemat apa pun bagi pengguna ponsel.',
      ),
      callout(
        'warning',
        '`hidden` tetap merender elemennya',
        'Ia hanya `display: none`. Elemen tetap ada di DOM, tetap dibaca sebagian teknologi bantu dalam kondisi tertentu, dan gambarnya tetap diunduh. Untuk konten berat, jangan merendernya sama sekali — pakai kondisi di React, bukan `hidden`.',
      ),

      h2('Breakpoint mengikuti konten'),
      code(
        'html',
        `
        <!-- SALAH: memilih breakpoint karena nama perangkat -->
        <!-- "md itu iPad, jadi pakai md" -->

        <!-- BENAR: ubah saat layoutnya mulai terlihat buruk -->
        <!-- Kecilkan jendela perlahan. Di titik mana ia mulai jelek? Di situ breakpoint-nya. -->
        `,
      ),
      p(
        'Blok ini sengaja hanya berisi komentar, karena yang diajarkan bukan sintaks melainkan **cara memutuskan**. Memilih breakpoint berdasarkan nama perangkat sudah tidak masuk akal sejak lama, sebab ukuran layar ponsel dan tablet saling tumpang tindih, jendela browser di desktop bisa dilebarkan sesuka hati, dan daftar perangkat berubah tiap tahun. Cara yang bertahan adalah yang disebut di baris terakhir, yaitu kecilkan jendela perlahan sambil melihat, lalu pasang breakpoint **tepat di titik desainnya mulai terlihat buruk**. Hasilnya sering tidak jatuh persis di `md` atau `lg`, dan itu tidak apa-apa, karena nilai sembarang seperti `min-[840px]:` sah dipakai justru untuk kasus ini.',
      ),

      h2('Container query — responsif terhadap wadah'),
      code(
        'html',
        `
        <div class="@container">
          <div class="flex flex-col @md:flex-row">
            <!-- bereaksi pada lebar WADAH, bukan lebar layar -->
          </div>
        </div>
        `,
      ),
      p(
        'Ini menyelesaikan masalah nyata: sebuah kartu bisa muncul di sidebar sempit **dan** di area konten yang lebar. Media query hanya tahu lebar layar; container query tahu lebar tempat komponen itu berada.',
      ),

      h2('Yang sering terlupa di layar kecil'),
      ul(
        '**Target sentuh minimal 44×44px** — `h-11` atau `p-3` pada elemen yang bisa ditekan.',
        '**Tidak ada scroll horizontal** — periksa dengan mengecilkan jendela sampai 320px.',
        '**Tabel dan blok kode** harus scroll di dalam wadahnya sendiri (`overflow-x-auto`), bukan mendorong halaman.',
        '**Safe area** pada perangkat berponi: `pb-[env(safe-area-inset-bottom)]`.',
        '**Hover bukan satu-satunya jalan** — apa pun yang muncul saat hover harus punya padanan sentuh dan keyboard.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Sebuah komponen ringkasan statistik dibuat untuk halaman utama dashboard, dan di sana ia sempurna. Beberapa minggu kemudian komponen yang sama dipakai ulang di dalam panel samping selebar 288px, dan bentuknya hancur. Kolomnya jadi tiga meski panelnya sempit, angkanya terpotong, dan labelnya menumpuk. Tidak ada yang salah tulis, dan tidak ada yang berubah pada komponennya.',
      ),
      code(
        'text',
        `
        Komponen yang sama, wadah yang sama-sama 286px,
        hanya lebar jendelanya yang berbeda. Diukur di Chrome 151:

          <div class="w-72">                       <-- 288px
            <div class="grid grid-cols-1 sm:grid-cols-3">...</div>
          </div>

          jendela 1400px
            lebar wadah      : 286px
            grid-template    : 95,33px 95,33px 95,34px   <-- tiga kolom di ruang 286px

          jendela 500px
            lebar wadah      : 286px                     <-- sama persis
            grid-template    : 286px                     <-- satu kolom
        `,
        { caption: 'Dijalankan sungguhan dan diukur di Chrome 151 pada dua ukuran jendela.' },
      ),
      p(
        'Inilah batas mendasar breakpoint yang perlu dipahami sebelum menyalahkan komponennya. `sm:` bertanya **"seberapa lebar jendelanya"**, bukan "seberapa lebar ruang yang saya punya". Komponen yang ditulis dengan breakpoint karena itu tidak bisa dipakai ulang di wadah berukuran berbeda, sebab ia mengambil keputusan berdasarkan informasi yang salah.',
      ),
      p(
        'Container query menjawab tepat pada titik itu. Ia mengukur wadah terdekat yang menyatakan diri sebagai container, sehingga keputusannya benar di mana pun komponennya diletakkan.',
      ),
      compare(
        {
          title: 'Breakpoint — mengukur jendela',
          lang: 'tsx',
          code: `
            <div className="grid grid-cols-1 sm:grid-cols-3">
              <Statistik ... />
            </div>

            // Benar di halaman utama.
            // Salah di panel samping selebar 288px.
          `,
          notes: ['Komponen jadi terikat tempatnya', 'Harus ditulis ulang untuk wadah lain'],
        },
        {
          title: 'Container query — mengukur wadah',
          lang: 'tsx',
          code: `
            <div className="@container">
              <div className="@md:grid-cols-3 grid grid-cols-1">
                <Statistik ... />
              </div>
            </div>

            // Benar di kedua tempat, tanpa perubahan.
          `,
          notes: ['Komponen bisa dipakai ulang di mana saja', 'Keputusannya berdasar ruang nyata'],
        },
      ),
      p(
        'Ada satu hal yang wajib diketahui sebelum menukar `sm:` dengan `@sm:`, yaitu **angkanya berbeda jauh**. Keduanya memakai nama yang sama tapi merujuk skala yang sama sekali lain, dan menukarnya begitu saja adalah cara tercepat mendapat hasil yang membingungkan.',
      ),
      table(
        ['Nama', 'Breakpoint jendela', 'Container query'],
        [
          ['`sm`', '40rem (640px)', '24rem (384px)'],
          ['`md`', '48rem (768px)', '28rem (448px)'],
          ['`lg`', '64rem (1024px)', '32rem (512px)'],
          ['`xl`', '80rem (1280px)', '36rem (576px)'],
        ],
      ),
      p(
        'Empat baris pertama diambil langsung dari CSS yang dihasilkan Tailwind 4.3.3. Perhatikan bahwa `@sm` lebih kecil daripada `sm`, dan itu memang masuk akal, sebab sebuah wadah hampir selalu lebih sempit daripada jendela yang memuatnya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Responsif tidak pernah gagal dengan pesan error. Ia gagal dengan tampilan yang benar di layar pengembangnya dan salah di layar orang lain. Dua pengukuran di bawah menunjukkan batas breakpoint dan akibat menulisnya dari arah yang salah.',
      ),
      code(
        'text',
        `
        <div class="grid grid-cols-1 gap-2 p-2 md:grid-cols-3 md:gap-6 md:p-8">
        <div class="p-8 md:p-2">tertukar</div>

        Diukur di Chrome 151:

          jendela 767px
            grid-template-columns : 751px                          <-- satu kolom
            gap                   : 8px
            padding               : 8px
            kotak "tertukar"      : 32px

          jendela 768px
            grid-template-columns : 218,66px 218,67px 218,67px     <-- tiga kolom
            gap                   : 24px
            padding               : 32px
            kotak "tertukar"      : 8px
        `,
        { caption: 'Dijalankan sungguhan. Selisih satu piksel memindahkan seluruh susunan.' },
      ),
      p(
        'Angka 768px itu bukan kebetulan, sebab `md:` diterjemahkan menjadi `@media (width >= 48rem)` dan 48rem sama dengan 768px. Batasnya **inklusif**, jadi 768px sudah masuk sedangkan 767px belum. Kalau ada bug yang hanya muncul di satu ukuran tablet tertentu, batas inilah yang pertama patut dicurigai.',
      ),
      p(
        'Kotak bernama "tertukar" menunjukkan akibat menulis dari arah yang salah. `p-8 md:p-2` memberi padding besar di ponsel dan padding kecil di desktop, tepat kebalikan dari yang hampir selalu diinginkan. Tidak ada error, dan di layar pengembang yang lebar hasilnya bahkan terlihat wajar, sebab yang aktif di sana adalah `md:p-2`.',
      ),
      code(
        'text',
        `
        Yang perlu diingat tentang arah:

          class tanpa awalan   -> berlaku di SEMUA ukuran, termasuk yang besar
          md:                  -> berlaku dari 768px KE ATAS, tidak pernah ke bawah

        Jadi p-2 md:p-8 berarti "padding 8, kecuali di layar lebar jadi 32".
        Dan p-8 md:p-2 berarti "padding 32, kecuali di layar lebar jadi 8".

        Tidak ada max-md: dalam pola mobile-first, dan itu bukan kekurangan —
        kebutuhan akan max-* hampir selalu tanda arahnya terbalik.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Semua kesalahan di bawah punya satu akar yang sama, yaitu menguji di layar sendiri dan menyimpulkan dari situ.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis desktop dulu lalu memperkecil dengan breakpoint',
            'Rancangan desktop biasanya datang lebih dulu',
            'Butuh `max-*` di mana-mana, dan bawaan halaman jadi versi paling berat. Mulai dari layar kecil',
          ],
          [
            'Mengira `md:` berlaku hanya di ukuran tablet',
            'Namanya medium',
            '`md:` berlaku dari 768px ke atas tanpa batas, jadi ia juga aktif di layar 4K',
          ],
          [
            'Menukar `sm:` dengan `@sm:` begitu saja',
            'Namanya sama',
            'Diukur, `sm` bernilai 640px sedangkan `@sm` bernilai 384px. Nilainya beda hampir dua kali',
          ],
          [
            'Memakai `@sm:` tanpa `@container` di induknya',
            'Sudah menulis variannya',
            'Tanpa wadah yang menyatakan diri container, tidak ada yang bisa diukur dan variannya tidak pernah aktif',
          ],
          [
            'Menyembunyikan menu dengan `hidden md:block`',
            'Rapi dan singkat',
            'Isinya tetap dikirim dan tetap ada di DOM. Untuk konten berat, ia tetap diunduh meski tak terlihat',
          ],
          [
            'Menguji responsif hanya dengan mengecilkan jendela peramban',
            'Terlihat sama saja',
            'Jendela sempit di desktop tetap melaporkan `hover: hover` dan tidak punya papan ketik virtual maupun safe area',
          ],
        ],
      ),
      p(
        'Baris terakhir yang paling sering menyisakan bug sampai produksi. Mengecilkan jendela menguji **lebar**, dan lebar hanyalah satu dari beberapa hal yang berbeda di ponsel. Ukuran target sentuh, papan ketik yang menutupi setengah layar, tinggi viewport yang berubah saat bilah alamat menyembunyikan diri, serta ketiadaan hover semuanya tidak ikut teruji. Untuk empat hal itu, tidak ada gantinya selain membuka halamannya di ponsel sungguhan.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Prefix berarti "dan ke atas"; class tanpa prefix adalah dasar untuk layar terkecil.',
        'Mobile-first menambah; desktop-first membatalkan.',
        '`hidden` tetap merender — untuk konten berat, jangan render sama sekali.',
        'Pilih breakpoint dari titik layout mulai terlihat buruk, bukan dari nama perangkat.',
        'Container query bereaksi pada lebar wadah, bukan lebar layar.',
      ),
      references(
        {
          label: 'Responsive design',
          href: 'https://tailwindcss.com/docs/responsive-design',
          source: 'Tailwind CSS',
          note: 'Menegaskan bahwa prefix berarti "dan ke atas" — sumber kesalahpahaman paling umum.',
        },
        {
          label: 'Responsive design',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design',
          source: 'MDN',
          note: 'Prinsip di balik pendekatan mobile-first, terlepas dari alat yang dipakai.',
        },
        {
          label: 'Container queries',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries',
          source: 'MDN',
          note: 'Komponen yang bereaksi pada lebar wadahnya sendiri, bukan lebar layar.',
        },
        {
          label: 'Target Size (Minimum)',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html',
          source: 'W3C WCAG',
          note: 'Standar resmi ukuran minimum sasaran sentuh yang wajib dipenuhi.',
        },
      ),
    ],
  ),

  written(
    'variant-status',
    'Variant Status: hover, focus, group, peer',
    20,
    'Menangani state tanpa menulis satu baris JavaScript.',
    [
      terms(
        {
          term: 'variant',
          meaning:
            'Terjemahannya **varian**. Awalan sebelum tanda titik dua yang menyatakan **kapan** sebuah utility berlaku: `hover:`, `focus:`, `md:`, `dark:`. Kekuatannya besar — seluruh state yang dulu butuh JavaScript kini bisa ditangani CSS sepenuhnya.',
        },
        {
          term: 'focus-visible',
          meaning:
            'Varian yang hanya aktif saat elemen difokuskan **lewat keyboard**, bukan saat diklik mouse. Ini pembedaan yang penting: `focus:` biasa memunculkan cincin fokus setiap kali tombol diklik, yang terlihat mengganggu — sehingga banyak orang menghapusnya, dan **itulah yang merusak aksesibilitas keyboard**. `focus-visible:` menyelesaikan keduanya.',
        },
        {
          term: 'cincin fokus',
          meaning:
            'Terjemahan dari *focus ring*. Garis yang menandai elemen mana yang sedang aktif bagi pengguna keyboard. **Tidak boleh dihapus tanpa pengganti** — tanpa itu, seseorang yang menavigasi dengan Tab benar-benar tidak tahu di mana ia berada.',
        },
        {
          term: 'group',
          meaning:
            'Penanda pada elemen **induk** yang membuat anak-anaknya bisa bereaksi terhadap state induk: `group` di kartu, lalu `group-hover:underline` pada judul di dalamnya. Menyelesaikan kasus "seluruh kartu di-hover, tapi yang berubah judulnya".',
        },
        {
          term: 'peer',
          meaning:
            'Terjemahannya **sejawat**. Penanda pada elemen **saudara sebelumnya**, sehingga elemen setelahnya bisa bereaksi: `peer` di input, lalu `peer-invalid:block` pada pesan error di bawahnya. Batasnya: hanya bekerja untuk saudara yang berada **sesudah** elemen ber-`peer`.',
        },
        {
          term: 'has',
          meaning:
            'Varian yang membuat induk bereaksi terhadap **isinya**: `has-checked:bg-accent-fill` pada label yang di dalamnya ada checkbox tercentang. Ini kemampuan CSS yang relatif baru dan menghapus banyak keperluan JavaScript untuk hal-hal kecil.',
        },
        {
          term: 'menyusun variant',
          meaning:
            'Beberapa varian bisa ditumpuk berurutan dan **dibaca dari kiri ke kanan**: `md:hover:focus-visible:ring-2` berarti "pada layar sedang ke atas, saat di-hover, dan saat difokuskan lewat keyboard". Urutannya tidak mengubah hasil, tapi konsisten membuatnya lebih mudah dibaca.',
        },
        {
          term: 'invalid / disabled',
          meaning:
            'Varian yang mengikuti **keadaan asli elemen form**, bukan class yang kamu tambah sendiri. `invalid:` mengikuti hasil validasi bawaan HTML dari Sub-bab 4.9, dan `disabled:` mengikuti atribut `disabled`. Keduanya berarti tampilanmu otomatis benar tanpa perlu disinkronkan dari JavaScript.',
        },
        {
          term: 'placeholder-shown',
          meaning:
            'Keadaan input yang **masih kosong** sehingga placeholder-nya terlihat. Berguna untuk menunda pesan error: jangan tampilkan "email tidak valid" pada input yang bahkan belum disentuh pengguna.',
        },
      ),

      h2('State dasar'),
      code(
        'html',
        `
        <button class="bg-surface hover:bg-raised active:scale-98 disabled:opacity-50">
        <input class="border-border focus:border-primary invalid:border-danger">
        <a class="text-muted visited:text-faint">
        `,
      ),
      p(
        'Bacalah tiap baris sebagai "tambahkan style ini **hanya** saat keadaan ini terjadi". `hover:bg-raised` berarti "ganti warna latar jadi `raised` hanya ketika kursor berada di atas tombol", dan begitu kursornya pindah style-nya lepas otomatis tanpa kamu perlu menulis kode JavaScript apa pun untuk memasang dan melepasnya. `active:scale-98` berlaku hanya **selama** tombol sedang ditekan (antara mouse-down dan mouse-up), memberi efek "mengecil sedikit" yang terasa responsif. `disabled:opacity-50` otomatis aktif kalau elemennya punya atribut HTML `disabled`, jadi bukan class yang kamu tambahkan manual melainkan keadaan sungguhan dari elemennya. Prinsip yang sama berlaku untuk semua variant di sub-bab ini, yaitu nama sebelum titik dua adalah **syaratnya**, dan utility sesudahnya hanya berlaku kalau syarat itu terpenuhi.',
      ),

      h2('`focus-visible`, bukan `focus`'),
      code(
        'html',
        `
        <!-- Ring muncul juga saat diklik mouse — mengganggu -->
        <button class="focus:ring-2">

        <!-- Ring hanya muncul untuk navigasi keyboard — benar -->
        <button class="focus-visible:ring-2 focus-visible:ring-primary">
        `,
      ),
      p(
        'Perbedaan `focus` dan `focus-visible` adalah **siapa yang memicunya**. `focus` aktif setiap kali elemen mendapat fokus, termasuk saat diklik mouse, sehingga cincin yang muncul setelah klik terasa mengganggu dan membuat banyak orang lalu menghapusnya sama sekali. `focus-visible` menyerahkan keputusan itu ke browser, karena ia hanya aktif kalau browser menyimpulkan pengguna sedang **bernavigasi dengan keyboard**. Jadi pengguna mouse tidak melihat cincinnya, pengguna keyboard tetap tahu posisinya, dan tidak ada alasan tersisa untuk menghapus penanda fokus, yang persis merupakan kesalahan yang diperingatkan kotak berikut.',
      ),
      callout(
        'danger',
        'Jangan pernah menghapus outline tanpa penggantinya',
        '`outline-none` tanpa `focus-visible:` apa pun membuat aplikasi **tidak bisa dipakai dengan keyboard** — pengguna tidak tahu di mana posisinya. Ini pelanggaran aksesibilitas paling umum sekaligus paling mudah dihindari. Aturan `frontend.md` di project ini memperlakukannya sebagai cacat yang wajib diperbaiki.',
      ),

      h2('`group` — bereaksi pada hover induk'),
      code(
        'html',
        `
        <a href="#" class="group flex items-center gap-2 rounded-md p-3 hover:bg-raised">
          <span class="text-text">Judul</span>
          <span class="text-faint group-hover:text-text">→</span>
          <span class="opacity-0 group-focus-visible:opacity-100 group-hover:opacity-100">
            Baru
          </span>
        </a>
        `,
      ),
      p(
        'Class `group` pada elemen induk adalah **penanda** dan bukan gaya, sebab ia tidak mengubah tampilan apa pun. Gunanya memberi anak-anaknya sesuatu untuk dirujuk lewat `group-hover:`. Itu menyelesaikan hal yang mustahil dengan `hover:` biasa, karena `hover:` hanya bereaksi saat elemen **itu sendiri** yang di-hover, sedangkan di sini panah dan label "Baru" harus berubah saat **seluruh tautannya** disentuh dan bukan hanya bagian kecil itu. Perhatikan `opacity-0` yang berpasangan dengan `group-hover:opacity-100`, yaitu pola menyembunyikan lalu memunculkan. Memakai opacity alih-alih `hidden` itu penting supaya elemennya sudah menempati ruang sejak awal dan tata letak tidak melompat saat muncul.',
      ),
      callout(
        'tip',
        'Selalu pasangkan `group-hover` dengan `group-focus-visible`',
        'Kalau sesuatu hanya muncul saat hover, pengguna keyboard tidak akan pernah melihatnya. Menambahkan `group-focus-visible:` di sebelahnya menutup celah itu dengan satu class.',
      ),
      code(
        'html',
        `
        <!-- Beberapa group bersarang -->
        <div class="group/kartu">
          <div class="group/baris">
            <span class="group-hover/kartu:text-primary group-hover/baris:underline">
          </div>
        </div>
        `,
      ),
      p(
        'Nama setelah garis miring (`group/kartu`, `group/baris`) memberi **nama** pada penanda `group`-nya, karena begitu ada dua `group` bersarang, `group-hover:` polos akan membingungkan — ia bereaksi ke `group` terdekat mana? Dengan nama, `group-hover/kartu:text-primary` secara eksplisit berarti "bereaksi saat `group/kartu` di-hover", terlepas dari `group/baris` yang ada di antaranya. Tanpa penamaan ini, memberi efek berbeda untuk hover kartu versus hover baris di dalamnya menjadi tidak mungkin dengan satu elemen `span` yang sama.',
      ),

      h2('`peer` — bereaksi pada elemen sebelumnya'),
      code(
        'html',
        `
        <input type="checkbox" class="peer sr-only" id="setuju" />
        <label for="setuju" class="border-border peer-checked:border-primary peer-checked:bg-accent-fill">
          Saya setuju
        </label>

        <!-- Validasi tanpa JavaScript -->
        <input type="email" required class="peer" />
        <p class="hidden text-danger peer-invalid:peer-not-placeholder-shown:block">
          Format email tidak valid
        </p>
        <!-- Dibaca: tampilkan hanya kalau input TIDAK valid DAN sudah pernah diisi,
             supaya error tidak muncul pada input yang belum disentuh sama sekali. -->
        `,
      ),
      callout(
        'warning',
        '`peer` hanya bekerja untuk elemen SESUDAHNYA',
        'CSS tidak bisa memilih elemen sebelumnya, jadi `peer` mengharuskan elemen pemicunya ditulis lebih dulu dalam markup. Kalau labelmu harus di atas input, `peer` tidak bisa dipakai — di situ JavaScript diperlukan.',
      ),

      h2('Variant yang berguna lainnya'),
      code(
        'html',
        `
        <li class="first:pt-0 last:border-b-0 odd:bg-raised">
        <div class="empty:hidden">          <!-- sembunyi kalau tidak ada isi -->
        <div class="has-checked:bg-accent-fill">      <!-- kalau punya anak tercentang -->
        <div class="motion-reduce:transition-none">
        <div class="print:hidden">
        `,
      ),
      p(
        'Beberapa dari varian ini menjawab kebutuhan yang sangat spesifik. `first:`/`last:`/`odd:` mengikuti **posisi** elemen di antara saudara-saudaranya, sehingga berguna untuk daftar yang butuh garis-warna selang-seling atau menghapus border pada baris terakhir, tanpa perlu menandai baris mana yang "terakhir" lewat JavaScript. `empty:hidden` memeriksa apakah elemen **tidak punya konten sama sekali**, sehingga cocok untuk kotak komentar atau catatan opsional yang seharusnya tidak menampilkan kotak kosong kalau isinya belum diisi. `motion-reduce:transition-none` menghormati preferensi sistem operasi "kurangi gerak" (`prefers-reduced-motion`) yang dibahas di Bab 4 Frontend Basic. Adapun `print:hidden` menyembunyikan elemen seperti tombol atau navigasi hanya saat halaman dicetak, karena elemen interaktif itu tidak berguna di atas kertas.',
      ),

      h2('Menyusun beberapa variant'),
      code(
        'html',
        `
        <button class="md:hover:bg-raised dark:hover:bg-surface md:dark:focus-visible:ring-2">
        <!-- dibaca kanan ke kiri: ring 2 saat focus-visible, di dark mode, di ≥768px -->
        `,
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Dua pola berikut muncul di hampir setiap aplikasi, dan keduanya biasanya dibangun dengan state React padahal tidak perlu satu baris pun JavaScript. Yang pertama adalah kartu dengan tombol aksi yang baru muncul saat kartunya disentuh kursor. Yang kedua adalah formulir yang menampilkan pesan kesalahan di bawah kolomnya begitu isinya tidak valid.',
      ),
      code(
        'tsx',
        `
        // Pola 1 — aksi yang muncul saat kartu dihampiri kursor.
        // Tanpa useState, tanpa onMouseEnter, tanpa re-render.
        function KartuCatatan({ judul, isi }: { judul: string; isi: string }) {
          return (
            <article className="group relative rounded-lg border p-4">
              <h3 className="font-medium">{judul}</h3>
              <p className="text-sm">{isi}</p>

              {/* Muncul saat kursor di atas .group, dan JUGA saat tombolnya
                  mendapat fokus papan ketik — itu bagian yang sering terlewat. */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <button className="rounded border px-2 text-sm">Ubah</button>
                <button className="rounded border px-2 text-sm">Hapus</button>
              </div>
            </article>
          );
        }
        `,
        { caption: 'group-focus-within menjaga tombolnya tetap terjangkau papan ketik.' },
      ),
      p(
        'Bagian `group-focus-within:opacity-100` adalah yang membedakan pola ini dari versi yang tidak bisa dipakai. Tanpanya, tombol Ubah dan Hapus tetap ada di urutan Tab tapi tetap tidak terlihat, sehingga pengguna papan ketik memfokuskan sesuatu yang tak tampak. Dengan `group-focus-within`, kartunya menyala begitu salah satu tombol di dalamnya difokuskan.',
      ),
      code(
        'tsx',
        `
        // Pola 2 — validasi formulir yang dibaca dari keadaan input itu sendiri.
        // Urutan elemennya menentukan, dan itu bukan selera.
        function KolomEmail() {
          return (
            <div>
              <label htmlFor="email" className="block text-sm">Email</label>

              {/* .peer harus ditulis SEBELUM elemen yang bereaksi padanya. */}
              <input
                id="email"
                type="email"
                required
                placeholder=" "
                className="peer w-full rounded border px-3 py-2"
              />

              {/* peer-invalid butuh input di atasnya. peer-placeholder-shown
                  menahan pesannya sampai pengguna benar-benar mengetik sesuatu. */}
              <p className="mt-1 hidden text-sm text-red-700 peer-invalid:block peer-placeholder-shown:hidden">
                Formatnya belum seperti alamat email.
              </p>
            </div>
          );
        }
        `,
        {
          caption:
            'Dua varian digabung supaya pesannya tidak muncul pada kolom yang belum disentuh.',
        },
      ),
      p(
        'Kombinasi `peer-invalid:block` dengan `peer-placeholder-shown:hidden` menyelesaikan masalah yang muncul pada hampir semua validasi tanpa JavaScript, yaitu kolom yang wajib diisi otomatis dianggap tidak valid sejak halaman terbuka. Selama placeholder masih terlihat, artinya pengguna belum mengetik apa pun, dan pesannya ditahan. Perlu ditegaskan bahwa ini murni lapisan pengalaman pengguna, sedangkan validasi yang mengikat tetap harus dijalankan di server.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Varian status tidak melempar error. Ia gagal dengan cara yang jauh lebih menjebak, yaitu bekerja sempurna di komputer yang dipakai menulisnya dan tidak bekerja sama sekali di tempat lain. Dua kegagalan di bawah diukur sungguhan.',
      ),
      code(
        'text',
        `
        CSS yang sebenarnya dihasilkan Tailwind 4.3.3 untuk group-hover:

          @media (hover: hover) {
            .group-hover\\:opacity-100:is(:where(.group):hover *) {
              opacity: 1;
            }
          }

        Perhatikan @media (hover: hover) yang membungkusnya.

        Diukur di Chrome 151 pada perangkat yang melaporkan hover: none,
        dengan kursor benar-benar berada di atas .group:

          matchMedia("(hover: hover)")                = false
          .group cocok dengan :hover                  = true
          opacity dari group-hover:opacity-100        = 0        <-- tidak aktif
          opacity dari .group:hover {opacity:1} manual = 1        <-- aktif
        `,
        {
          caption:
            'Dijalankan sungguhan. Baris terakhir membuktikan penyebabnya media query, bukan keadaan hover-nya.',
        },
      ),
      p(
        'Dua baris terakhir itu yang menutup kemungkinan salah tafsir. Keadaan `:hover` benar-benar aktif, dibuktikan oleh aturan CSS tulis tangan yang berhasil berlaku. Yang membuat versi Tailwind tidak aktif adalah `@media (hover: hover)`, dan pembungkus itu memang disengaja, sebab peramban di perangkat sentuh dulu mempertahankan keadaan hover setelah disentuh sehingga menu melekat terbuka.',
      ),
      p(
        'Akibat praktisnya keras dan sering diabaikan. **Apa pun yang hanya bisa dicapai lewat `hover:` tidak akan pernah bisa dicapai di ponsel dan tablet.** Tombol Hapus yang hanya muncul saat kursor mendekat berarti tombol Hapus yang tidak ada di separuh perangkat penggunamu.',
      ),
      code(
        'text',
        `
        <span class="peer-invalid:text-red-500">Email tidak valid</span>
        <input class="peer" type="email" value="bukan-email" />

        <input class="peer" type="email" value="bukan-email" />
        <span class="peer-invalid:text-red-500">Email tidak valid</span>

        Diukur di Chrome 151:

          label ditulis SEBELUM input  -> color = rgb(0, 0, 0)              <-- tidak aktif
          label ditulis SETELAH input  -> color = oklch(0.637 0.237 25.331) <-- red-500

        Sebabnya ada di selector yang dihasilkan:

          .peer-invalid\\:text-red-500:is(:where(.peer):invalid ~ *)
                                                              ^
                            kombinator ~ hanya menjangkau saudara SESUDAHNYA
        `,
        {
          caption:
            'Dijalankan sungguhan. Urutan DOM menentukan, dan CSS tidak punya kombinator ke arah sebaliknya.',
        },
      ),
      p(
        'Ini bukan keterbatasan Tailwind melainkan keterbatasan CSS itu sendiri. Tidak ada kombinator yang menunjuk saudara sebelumnya, jadi `peer-*` mustahil bekerja ke atas. Kalau rancangannya menuntut pesan berada di atas kolomnya, susun DOM-nya dengan input lebih dulu lalu tukar posisi visualnya memakai `flex flex-col-reverse`.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Varian status adalah bagian Tailwind yang paling terasa seperti sihir, dan itu tepat menjadi alasan kenapa perlu tahu CSS apa yang sebenarnya dihasilkannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh aksi penting hanya di balik `hover:`',
            'Bersih, muncul saat dibutuhkan',
            'Diukur, `hover:` dibungkus `@media (hover: hover)` sehingga tidak pernah aktif di perangkat sentuh. Aksinya hilang total di ponsel',
          ],
          [
            'Memakai `focus:ring` untuk cincin fokus',
            'Namanya paling langsung',
            'Diukur, cincinnya juga muncul saat diklik mouse dan itu terlihat seperti cacat. `focus-visible:ring` hanya muncul saat papan ketik',
          ],
          [
            'Menulis `peer` di elemen yang bereaksi',
            'Ia yang jadi fokus perhatian',
            '`peer` menandai **sumbernya**, bukan yang bereaksi. Yang bereaksi memakai `peer-*`',
          ],
          [
            'Menaruh pesan `peer-invalid` di atas inputnya',
            'Rancangannya begitu',
            'Diukur, selectornya memakai `~` yang hanya menjangkau ke bawah. Susun DOM-nya terbalik lalu pakai `flex-col-reverse`',
          ],
          [
            'Menghapus outline dengan `outline-none` lalu berhenti',
            'Outline bawaan memang jelek',
            'Fokus jadi tidak terlihat sama sekali dan halamannya tak bisa dipakai tanpa mouse. Selalu ada penggantinya',
          ],
          [
            'Menumpuk `group` di beberapa tingkat',
            'Perlu bereaksi ke dua induk',
            'Tanpa nama, `group-hover:` menunjuk `.group` terdekat mana pun. Beri nama dengan `group/kartu` lalu pakai `group-hover/kartu:`',
          ],
        ],
      ),
      p(
        'Baris pertama dan baris keempat sama-sama punya jalan keluar yang murah, dan keduanya layak jadi kebiasaan. Untuk aksi di kartu, tambahkan `group-focus-within:` di samping `group-hover:` dan biarkan tombolnya selalu terlihat di layar sempit dengan `md:opacity-0` sebagai gantinya. Untuk cincin fokus, biasakan menulis `focus-visible:` sebagai bawaan dan hanya turun ke `focus:` bila memang ada alasan yang bisa dijelaskan.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Pakai `focus-visible`, bukan `focus` — dan jangan pernah `outline-none` tanpa pengganti.',
        '`group-*` bereaksi pada induk; selalu pasangkan hover dengan focus-visible.',
        '`peer-*` bereaksi pada elemen sebelumnya dalam markup, tidak bisa sebaliknya.',
        '`has-*` memungkinkan induk bereaksi pada anaknya.',
        'Variant bisa disusun; dibaca dari kanan ke kiri.',
      ),
      references(
        {
          label: 'Hover, focus, and other states',
          href: 'https://tailwindcss.com/docs/hover-focus-and-other-states',
          source: 'Tailwind CSS',
          note: 'Daftar lengkap seluruh varian, termasuk `group`, `peer`, dan `has`.',
        },
        {
          label: ':focus-visible',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible',
          source: 'MDN',
          note: 'Alasan ia lebih tepat daripada `:focus` untuk menandai fokus keyboard.',
        },
        {
          label: ':has()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:has',
          source: 'MDN',
          note: 'Selector induk yang bereaksi pada isinya — dasar varian `has-*`.',
        },
        {
          label: 'Focus Visible (WCAG 2.4.7)',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html',
          source: 'W3C WCAG',
          note: 'Standar resmi yang membuat penghapusan cincin fokus menjadi pelanggaran, bukan pilihan gaya.',
        },
      ),
    ],
  ),

  written(
    'dark-mode',
    'Dark Mode',
    19,
    'Dua tema tanpa menggandakan style — dan kenapa dark mode bukan sekadar membalik warna.',
    [
      terms(
        {
          term: 'prefers-color-scheme',
          meaning:
            'Kueri media yang membaca **pengaturan tema di sistem operasi** pengguna. Ini perilaku bawaan Tailwind: `dark:` otomatis mengikuti pengaturan perangkat, tanpa kamu menulis apa pun. Kelemahannya cuma satu — pengguna tidak bisa memilih tema yang berbeda dari sistemnya.',
        },
        {
          term: 'strategi class',
          meaning:
            'Alternatif yang membuat tema ditentukan oleh **kehadiran sebuah class** (biasanya `dark` pada `<html>`), sehingga pengguna bisa memilih sendiri. Harganya: kamu yang bertanggung jawab menyimpan pilihan itu dan menerapkannya kembali saat halaman dimuat.',
        },
        {
          term: 'token semantik',
          meaning:
            'Token yang dinamai menurut **perannya**, bukan warnanya: `--color-surface`, bukan `--color-putih`. Inilah kunci dark mode yang rapi — kamu cukup mengubah nilai token di satu tempat, dan **tidak perlu menulis satu pun varian `dark:`** di komponen. Website yang sedang kamu baca ini bekerja persis begitu.',
        },
        {
          term: 'FOUC',
          meaning:
            'Singkatan *Flash of Unstyled Content*, terjemahannya **flicker konten tanpa gaya**. Pada dark mode, gejalanya khas: halaman berkedip putih sepersekian detik sebelum berubah gelap. Penyebabnya karena tema baru diterapkan setelah JavaScript berjalan.',
        },
        {
          term: 'skrip pra-paint',
          meaning:
            'Skrip kecil yang **berjalan sebelum browser menggambar apa pun**, ditaruh langsung di `<head>` tanpa `defer`. Ia membaca pilihan tema dari `localStorage` lalu memasang class-nya seketika. Ini satu-satunya cara menghapus FOUC sepenuhnya — dan pengecualian sah dari aturan "jangan taruh skrip di head".',
        },
        {
          term: 'color-scheme',
          meaning:
            'Property CSS yang memberi tahu browser tema mana yang sedang berlaku, sehingga **elemen bawaan ikut menyesuaikan** — batang gulir, kotak centang, tanggal, dan menu pilihan. Tanpa itu, halamanmu gelap tapi batang gulirnya tetap putih menyilaukan.',
        },
        {
          term: 'kontras',
          meaning:
            'Perbandingan kecerahan antara teks dan latarnya. Yang sering keliru: dark mode **bukan sekadar membalik warna**. Putih murni di atas hitam murni justru terlalu menyilaukan dan membuat huruf tampak bergetar, jadi tema gelap yang baik memakai putih yang diredam dan hitam yang diangkat.',
        },
        {
          term: 'elevation',
          meaning:
            'Terjemahannya **ketinggian**. Di tema terang, kedalaman ditunjukkan lewat bayangan. Di tema gelap bayangan hampir tidak terlihat, sehingga kedalaman harus ditunjukkan dengan **latar yang lebih terang** — makin tinggi sebuah permukaan, makin terang warnanya.',
        },
      ),

      h2('Dua strategi'),
      code(
        'css',
        `
        /* Bawaan: mengikuti pengaturan sistem, pengguna tidak bisa memilih */
        @import 'tailwindcss';
        `,
        { caption: 'Tanpa konfigurasi apa pun, `dark:` sudah bekerja — mengikuti setelan OS.' },
      ),
      p(
        'Perbedaan kedua strategi ini bukan soal tampilan melainkan **siapa yang memutuskan**. Bawaan Tailwind mengikat `dark:` ke media query `prefers-color-scheme`, sehingga temanya sepenuhnya ditentukan setelan sistem operasi. Cara itu cukup untuk banyak situs dan tidak butuh satu baris konfigurasi pun. Strategi kedua memindahkan keputusan itu ke penggunamu, dan harganya disebut di kotak istilah, yaitu kamu jadi bertanggung jawab menyimpan pilihannya dan menerapkannya kembali setiap halaman dimuat. Sub-bab ini memakai strategi kedua karena itulah yang dipakai website ini, tetapi pilihlah yang pertama kalau aplikasimu tidak benar-benar butuh tombol ganti tema, sebab lebih sedikit yang bisa rusak.',
      ),
      code(
        'css',
        `
        /* Berbasis class: pengguna bisa memilih sendiri */
        @import 'tailwindcss';
        @custom-variant dark (&:where(.dark, .dark *));
        `,
        {
          caption: 'Yang dipakai website ini — supaya pilihan pengguna mengalahkan pengaturan OS.',
        },
      ),
      code(
        'html',
        `
        <div class="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
        `,
      ),
      p(
        'Baris `@custom-variant dark (&:where(.dark, .dark *))` mendefinisikan ulang **kapan** varian `dark:` berlaku. Alih-alih mengikuti media query `prefers-color-scheme` bawaan, ia mengaktifkan `dark:` setiap kali elemennya sendiri atau salah satu leluhurnya (`.dark *`) punya class `.dark`. Inilah yang memungkinkan pengaturan tema di halaman ini, berupa tombol yang menambah atau menghapus class `.dark` di `<html>`, untuk **mengalahkan** apa pun yang di-set sistem operasi pengguna. Class `dark:bg-slate-900` pada contoh HTML hanya aktif saat class `.dark` itu ada di salah satu leluhurnya. Tanpa `@custom-variant`, ia akan selalu mengikuti pengaturan OS dan tidak bisa ditimpa manual.',
      ),

      h2('Cara yang lebih baik: token semantik'),
      compare(
        {
          title: 'Menulis dark: di mana-mana',
          lang: 'html',
          code: `
            <div class="bg-white dark:bg-slate-900">
              <p class="text-slate-900 dark:text-slate-100">
              <span class="text-slate-500 dark:text-slate-400">
              <hr class="border-slate-200 dark:border-slate-700">
          `,
          notes: ['Dua kali lipat class', 'Mudah ada yang terlewat'],
        },
        {
          title: 'Token semantik',
          lang: 'html',
          code: `
            <div class="bg-surface">
              <p class="text-text">
              <span class="text-muted">
              <hr class="border-border">
          `,
          notes: ['Nol prefix `dark:`', 'Tema berpindah di satu tempat'],
        },
      ),
      p(
        'Cara kedua adalah yang dipakai website ini: warnanya berganti karena **nilai tokennya** berubah, bukan karena tiap komponen punya dua versi class.',
      ),

      h2('Menghindari flicker tema'),
      code(
        'html',
        `
        <script>
          (function () {
            try {
              const pilihan = localStorage.getItem('tema');
              const gelap = pilihan === 'dark'
                || (pilihan !== 'light'
                    && window.matchMedia('(prefers-color-scheme: dark)').matches);
              document.documentElement.classList.toggle('dark', gelap);
            } catch (e) {}
          })();
        </script>
        `,
        { filename: 'Di dalam <head>, sebelum CSS' },
      ),
      p(
        "Baca variabel `gelap` sebagai satu keputusan dengan tiga tingkat prioritas. Kalau pengguna **pernah memilih** tema secara eksplisit, yang tersimpan sebagai `'dark'` di `localStorage`, pilihan itulah yang menang apa pun pengaturan sistemnya. Kalau belum pernah memilih (`pilihan` bukan `'dark'` dan bukan `'light'`, biasanya `null` di kunjungan pertama), baris kedua kondisi (`pilihan !== 'light' && window.matchMedia(...)`) baru dicek, yaitu mengikuti pengaturan sistem operasi lewat `prefers-color-scheme`. `document.documentElement.classList.toggle('dark', gelap)` lalu menambah atau menghapus class `dark` pada `<html>` sesuai hasil boolean `gelap`. Argumen kedua pada `toggle` inilah yang membuatnya bisa dipakai untuk memaksa keadaan tertentu, bukan sekadar membalik keadaan sebelumnya. Blok `try/catch` kosong menjaga skrip tidak crash kalau `localStorage` diblokir (mode privat ketat pada beberapa browser), dan kalau itu terjadi halaman diam-diam jatuh kembali ke pengaturan sistem.",
      ),
      callout(
        'danger',
        'Ini harus skrip inline yang memblokir render',
        'Pendekatan apa pun yang berbasis React berjalan **setelah** paint pertama — artinya pengguna melihat tema terang berkedip sebelum berubah gelap, di setiap pemuatan halaman. Ini satu-satunya tempat di project ini yang sengaja memakai skrip inline yang memblokir.',
      ),

      h2('Dark mode bukan warna yang dibalik'),
      ol(
        '**Jangan pakai hitam murni.** `#000` dengan teks putih menghasilkan silau dan bayangan gerak pada layar OLED. Pakai abu-abu sangat gelap.',
        '**Turunkan saturasi.** Warna jenuh terlihat menyala berlebihan di latar gelap.',
        '**Balik arah elevasi.** Di mode terang, permukaan yang lebih tinggi lebih **terang**; di mode gelap, ia lebih terang juga — bukan lebih gelap.',
        '**Bayangan hampir tidak terlihat** di latar gelap. Pakai perbedaan warna permukaan untuk menandai kedalaman.',
        '**Periksa ulang kontras.** Pasangan yang lolos di mode terang belum tentu lolos di gelap.',
      ),
      callout(
        'info',
        'Contoh nyata dari project ini',
        'Amber `#E5A13C` mencapai 8,8:1 di latar gelap — sangat baik. Di latar terang ia hanya 2,2:1 dan **tidak boleh membawa teks sama sekali**. Karena itu mode terang memakai `#8F5314`. Persis kasus poin nomor lima.',
      ),

      h2('`color-scheme`'),
      code(
        'css',
        `
        :root { color-scheme: light; }
        .dark { color-scheme: dark; }
        `,
      ),
      p(
        'Ini yang membuat scrollbar, kotak input bawaan, dan menu `<select>` ikut gelap. Tanpanya, elemen bawaan browser tetap putih dan terlihat janggal.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Dark mode dipasang di sebuah aplikasi berisi banyak formulir. Seluruh kartu, tombol, dan teksnya sudah dibalik dengan `dark:` dan hasilnya terlihat rapi. Lalu laporan masuk dari pengguna, dan bunyinya membingungkan, "kotak isian saya hitam di atas hitam". Padahal tidak ada satu pun `dark:` yang terlewat pada kotak isian itu.',
      ),
      p(
        'Yang terlewat bukan utility melainkan sebuah properti CSS yang tidak punya utility, dan pengaruhnya justru pada bagian yang tidak bisa disentuh CSS biasa.',
      ),
      code(
        'text',
        `
        <div class="bg-white text-black dark:bg-neutral-900 dark:text-white">kartu</div>
        <input />

        Diukur di Chrome 151, membaca getComputedStyle:

          TANPA .dark
            kartu  background = rgb(255, 255, 255)
            kartu  color      = rgb(0, 0, 0)
            input  color      = rgb(0, 0, 0)
            input  border     = rgb(0, 0, 0)

          DENGAN .dark, tanpa color-scheme
            kartu  background = oklch(0.205 0 none)     <-- gelap, benar
            kartu  color      = rgb(255, 255, 255)      <-- terang, benar
            input  color      = rgb(0, 0, 0)            <-- MASIH HITAM
            input  border     = rgb(0, 0, 0)            <-- MASIH HITAM

          DENGAN .dark + color-scheme: dark
            input  color      = rgb(255, 255, 255)      <-- ikut berubah
            input  border     = rgb(255, 255, 255)
        `,
        { caption: 'Dijalankan sungguhan dan diukur di Chrome 151.' },
      ),
      p(
        'Penjelasannya, teks yang diketik pengguna di dalam `<input>` diwarnai oleh peramban, bukan oleh stylesheet-mu, selama kamu tidak menyetel warnanya secara eksplisit. Cara memberi tahu peramban bahwa halamannya sedang gelap bukan lewat class melainkan lewat `color-scheme`. Properti itu juga yang menentukan warna batang penggulung, tampilan pemilih tanggal, kotak centang, dan menu `<select>` bawaan.',
      ),
      code(
        'css',
        `
        /* globals.css — dua baris yang harus ada di project mana pun berdark mode. */

        :root {
          color-scheme: light;
        }

        .dark {
          color-scheme: dark;
        }

        /* Tanpa keduanya, seluruh kontrol bawaan peramban tetap bermode terang
           meski setiap elemen milikmu sendiri sudah gelap. Ini juga alasan
           website ini menuliskannya di globals.css, bukan di komponen. */
        `,
        { caption: 'Diambil dari pola yang dipakai globals.css project ini.' },
      ),
      p(
        'Ada satu daftar yang layak diperiksa satu per satu ketika dark mode dinyatakan selesai, sebab semuanya termasuk yang tidak terlihat pada halaman contoh sederhana.',
      ),
      table(
        ['Yang sering terlewat', 'Gejalanya', 'Perbaikannya'],
        [
          [
            'Teks yang diketik di `<input>`',
            'Hitam di atas latar gelap',
            '`color-scheme: dark` pada `.dark`',
          ],
          [
            'Batang penggulung',
            'Terang menyilaukan di sisi halaman gelap',
            'Sama, `color-scheme` yang menanganinya',
          ],
          [
            'Bayangan `shadow-*`',
            'Tidak terlihat sama sekali',
            'Di mode gelap, ganti bayangan dengan border yang lebih terang',
          ],
          [
            'Gambar dan logo berlatar putih',
            'Kotak putih menyala di tengah halaman gelap',
            'Sediakan versi kedua, atau beri `dark:bg-white/90` pada wadahnya',
          ],
          [
            'Warna aksen yang sama untuk dua tema',
            'Kontrasnya jatuh di salah satu tema',
            'Aksen mode gelap hampir selalu perlu lebih terang',
          ],
        ],
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan dark mode yang paling terlihat pengguna bukan warna yang salah melainkan **kilatan tema** saat halaman dibuka. Halaman tampil terang sekejap, lalu berubah gelap. Penyebabnya selalu sama, yaitu keputusan tema diambil setelah halaman pertama digambar.',
      ),
      code(
        'tsx',
        `
        // Yang menghasilkan kilatan. Tidak ada error, dan tidak terlihat
        // di jaringan cepat dengan cache hangat.
        'use client';
        export function PenyediaTema({ children }: { children: React.ReactNode }) {
          useEffect(() => {
            const tersimpan = localStorage.getItem('tema');
            if (tersimpan === 'dark') document.documentElement.classList.add('dark');
          }, []);
          return <>{children}</>;
        }

        // Urutan yang sebenarnya terjadi:
        //   1. HTML tiba tanpa class dark        -> halaman digambar TERANG
        //   2. React dimuat dan dijalankan
        //   3. useEffect berjalan, class dark ditambahkan
        //   4. halaman digambar ulang            -> GELAP
        //
        // Selisih antara langkah 1 dan 4 adalah kilatannya. Ia terasa
        // seperti cacat aplikasi, dan pada koneksi lambat bisa lebih dari satu detik.
        `,
        {
          caption:
            'useEffect selalu berjalan setelah gambar pertama, jadi kilatannya tidak bisa dihindari dari sini.',
        },
      ),
      p(
        'Satu-satunya cara menghilangkannya adalah mengambil keputusan tema **sebelum** halaman digambar, dan itu berarti sebuah skrip yang berjalan sinkron di dalam `<head>`. Skrip sinkron biasanya dihindari karena memblokir, dan di sini pemblokiran itu justru yang dibutuhkan, sebab ia harus selesai lebih dulu.',
      ),
      code(
        'tsx',
        `
        // app/layout.tsx — skrip ini sengaja sinkron dan sengaja kecil.
        export default function RootLayout({ children }: { children: React.ReactNode }) {
          return (
            <html lang="id" suppressHydrationWarning>
              <head>
                <script
                  dangerouslySetInnerHTML={{
                    __html: \`(function(){try{
                      var t=localStorage.getItem('tema');
                      var g=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);
                      if(g)document.documentElement.classList.add('dark');
                    }catch(e){}})();\`,
                  }}
                />
              </head>
              <body>{children}</body>
            </html>
          );
        }

        // Tiga hal yang membuatnya aman:
        //   - try/catch, sebab localStorage bisa dilarang di mode privat
        //   - suppressHydrationWarning, sebab class html berubah sebelum React melihatnya
        //   - isinya sangat kecil, sehingga pemblokirannya tidak terukur
        `,
        {
          caption:
            'Satu-satunya tempat dangerouslySetInnerHTML pantas dipakai di sini, sebab isinya kita tulis sendiri dan tidak berasal dari pengguna.',
        },
      ),
      p(
        'Penggunaan `dangerouslySetInnerHTML` di sini perlu dijelaskan supaya tidak ditiru di tempat yang salah. Ia berbahaya ketika isinya berasal dari pengguna atau dari sumber luar. Di sini isinya adalah teks tetap yang ditulis di dalam repo, tidak ada satu pun bagiannya yang berasal dari input, jadi tidak ada jalan bagi siapa pun untuk menyisipkan kode. Aturan larangannya tetap berlaku penuh untuk semua kasus lain.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Dark mode terlihat seperti pekerjaan mekanis, yaitu menambahkan `dark:` di setiap tempat. Justru cara berpikir itu yang menghasilkan hasil paling banyak masalah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambahkan `dark:` pada setiap utility warna',
            'Setiap warna kan perlu pasangannya',
            'Jumlah classnya berlipat dan tiap warna baru harus diingat dua kali. Pakai token semantik yang nilainya berubah',
          ],
          [
            'Lupa `color-scheme`',
            'Semua elemen sudah punya `dark:`',
            'Diukur, teks di dalam `<input>` tetap `rgb(0, 0, 0)` dan batang penggulung tetap terang',
          ],
          [
            'Membalik warna secara harfiah, putih jadi hitam',
            'Itu definisi membalik',
            'Hitam pekat di atas putih pekat melelahkan mata. Mode gelap yang baik memakai abu sangat gelap, bukan `#000`',
          ],
          [
            'Menentukan tema di `useEffect`',
            'Itu tempat efek sisi klien',
            'Diuji, ia selalu berjalan setelah gambar pertama sehingga kilatan temanya tidak bisa dihindari dari sana',
          ],
          [
            'Memakai `@media (prefers-color-scheme: dark)` padahal ada tombol pilihan',
            'Ia mengikuti sistem, terasa pintar',
            'Pilihan pengguna tidak bisa mengalahkan sistem. Untuk tombol pilihan, `dark` harus berbasis class',
          ],
          [
            'Mempertahankan `shadow-lg` di mode gelap',
            'Bayangan memberi kedalaman',
            'Bayangan hitam di atas latar hampir hitam tidak terlihat. Kedalaman di mode gelap dibentuk dengan perbedaan terang permukaan',
          ],
        ],
      ),
      p(
        'Baris kelima menjelaskan kenapa website ini menuliskan `@custom-variant dark (&:where(.dark, .dark *))` di `globals.css` alih-alih memakai perilaku bawaan. Diperiksa pada keluaran Tailwind 4.3.3, deklarasi itu menghasilkan selector `.dark\\:bg-neutral-900:where(.dark, .dark *)`, sedangkan tanpa deklarasi itu `dark:` diterjemahkan menjadi `@media (prefers-color-scheme: dark)`. Bentuk pertama bisa dikalahkan oleh pilihan pengguna, bentuk kedua tidak bisa.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Token semantik mengalahkan `dark:` yang ditulis di setiap komponen.',
        'Skrip inline pra-paint adalah satu-satunya cara menghindari flicker tema.',
        'Jangan hitam murni; turunkan saturasi; periksa ulang kontras di kedua mode.',
        'Bayangan tidak bekerja di latar gelap — pakai perbedaan warna permukaan.',
        '`color-scheme` membuat elemen bawaan browser ikut menyesuaikan.',
      ),
      references(
        {
          label: 'Dark mode',
          href: 'https://tailwindcss.com/docs/dark-mode',
          source: 'Tailwind CSS',
          note: 'Kedua strategi, yaitu mengikuti sistem dan berbasis class, beserta cara menyetelnya di v4.',
        },
        {
          label: 'prefers-color-scheme',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme',
          source: 'MDN',
          note: 'Kueri media yang membaca pengaturan tema di sistem operasi pengguna.',
        },
        {
          label: 'color-scheme',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme',
          source: 'MDN',
          note: 'Yang membuat batang gulir, kotak centang, dan `<select>` ikut menyesuaikan tema.',
        },
        {
          label: 'Contrast (Minimum) — WCAG 1.4.3',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
          source: 'W3C WCAG',
          note: 'Ambang 4,5:1 yang membuat amber `#E5A13C` tidak boleh membawa teks di latar terang.',
        },
        {
          label: 'Building a color scheme',
          href: 'https://web.dev/articles/building/a-color-scheme',
          source: 'web.dev',
          note: 'Alasan dark mode bukan sekadar membalik warna, beserta cara menyusun palet gelap yang nyaman.',
        },
      ),
    ],
  ),

  written(
    'design-token-theme',
    'Design Token dengan `@theme`',
    21,
    'Fitur inti Tailwind v4 — dan cara project ini mengunci paletnya.',
    [
      terms(
        {
          term: '@theme',
          meaning:
            'Arahan CSS khas Tailwind v4 untuk **mendefinisikan design token**. Yang membuatnya berbeda dari sekadar variabel: tiap token di dalamnya **otomatis menghasilkan utility class**. Menulis `--color-primary` sekali langsung memberimu `bg-primary`, `text-primary`, dan `border-primary` tanpa konfigurasi tambahan apa pun.',
        },
        {
          term: 'design token',
          meaning:
            'Nilai desain yang dikunci di satu tempat lalu dipakai ulang di mana-mana — warna, jarak, radius sudut, bayangan. Nilainya bukan penghematan ketikan: ia **membuat perubahan menyeluruh menjadi satu baris**, dan membuat nilai ad-hoc jadi terlihat mencolok saat direview.',
        },
        {
          term: 'namespace',
          meaning:
            'Awalan yang menentukan **utility apa** yang dihasilkan sebuah token. `--color-*` menghasilkan utility warna, `--spacing-*` menghasilkan jarak, `--font-*` menghasilkan keluarga huruf. Salah memilih awalan berarti tokennya tetap ada sebagai variabel, tapi utility-nya tidak pernah muncul.',
        },
        {
          term: '@theme inline',
          meaning:
            'Varian `@theme` yang membuat token **merujuk variabel lain alih-alih menyalin nilainya**. Inilah yang memungkinkan satu token berubah mengikuti tema: `--color-surface` menunjuk `var(--surface)`, dan nilai `--surface` itulah yang berbeda antara mode terang dan gelap.',
        },
        {
          term: 'CSS variable',
          meaning:
            'Disebut juga *custom property*, ditulis dengan awalan dua tanda hubung. Token Tailwind v4 **benar-benar menjadi CSS variable asli**, bukan nilai yang disalin saat build. Akibatnya token bisa dibaca dan diubah dari JavaScript, dan bisa diwarisi ke elemen anak seperti variabel CSS biasa.',
        },
        {
          term: 'oklch',
          meaning:
            'Ruang warna modern yang lebih dekat dengan cara mata manusia melihat kecerahan. Keunggulan praktisnya: menaikkan angka kecerahannya menghasilkan perubahan yang **terasa merata**, sementara pada `hsl` warna kuning dan biru dengan angka yang sama bisa terasa sangat berbeda terangnya.',
        },
        {
          term: 'menimpa bawaan',
          meaning:
            'Menulis token dengan nama yang sama seperti bawaan Tailwind akan **menggantikannya**. Untuk membuang seluruh palet bawaan sekaligus supaya tidak ada yang tidak sengaja memakai `blue-500`, pakai `--color-*: initial` lalu daftarkan warnamu sendiri.',
        },
        {
          term: 'satu source of truth',
          meaning:
            'Prinsip bahwa setiap nilai desain hanya punya **satu tempat resmi**. Di project ini, `globals.css` adalah tempat itu, dan aturannya tegas: tidak boleh ada nilai hex atau jarak ad-hoc yang ditulis langsung di komponen.',
        },
      ),

      h2('Bentuk dasarnya'),
      code(
        'css',
        `
        @import 'tailwindcss';

        @theme {
          --color-brand: #8f5314;
          --font-display: 'Instrument Sans', sans-serif;
          --radius-card: 14px;
          --spacing-gutter: 1.5rem;
        }
        `,
      ),
      p(
        'Tiap token otomatis menghasilkan utility-nya: `bg-brand`, `text-brand`, `font-display`, `rounded-card`, `p-gutter`.',
      ),
      table(
        ['Awalan token', 'Utility yang dihasilkan'],
        [
          ['`--color-*`', '`bg-*`, `text-*`, `border-*`, `fill-*`'],
          ['`--font-*`', '`font-*`'],
          ['`--text-*`', '`text-*` (ukuran)'],
          ['`--radius-*`', '`rounded-*`'],
          ['`--shadow-*`', '`shadow-*`'],
          ['`--ease-*` / `--duration-*`', '`ease-*` / `duration-*`'],
        ],
      ),

      h2('`@theme inline` — token yang mengikuti tema'),
      code(
        'css',
        `
        :root {
          --bg: #faf7f1;
          --text: #191713;
          --primary: #8f5314;
        }

        .dark {
          --bg: #0e0d0b;
          --text: #ede6da;
          --primary: #e5a13c;
        }

        @theme inline {
          --color-bg: var(--bg);
          --color-text: var(--text);
          --color-primary: var(--primary);
        }
        `,
        { filename: 'globals.css', caption: 'Pola yang dipakai website ini.' },
      ),
      p(
        'Perhatikan susunannya **dua lapis**, dan itu yang membuat pergantian tema bekerja tanpa satu pun class berubah. Lapis pertama adalah CSS custom property biasa: `:root` memegang nilai tema terang, `.dark` menimpanya dengan nilai tema gelap. Lapis kedua, blok `@theme inline`, **memetakan** variabel itu menjadi utility Tailwind — dari `--color-bg` lahir `bg-bg`, dari `--color-text` lahir `text-text`. Karena pemetaannya menunjuk `var(--bg)` alih-alih menyalin nilainya, mengganti class `.dark` di `<html>` seketika mengubah seluruh tampilan. Kata `inline` itulah kuncinya, dan kotak berikut menjelaskan apa yang terjadi tanpanya.',
      ),
      callout(
        'info',
        'Kenapa `inline` yang dipakai',
        'Tanpa `inline`, Tailwind menyalin **nilainya** saat build — sehingga pergantian tema tidak berpengaruh. Dengan `inline`, utility merujuk ke `var(--bg)`, jadi mengganti nilai variabel di `.dark` langsung mengubah seluruh tampilan tanpa satu pun class berubah.',
      ),

      h2('Menerapkan langkah demi langkah'),
      ol(
        '**Kumpulkan warna yang benar-benar dipakai** — biasanya jauh lebih sedikit dari dugaan.',
        '**Beri nama menurut perannya, bukan wujudnya.** `--color-surface`, bukan `--color-abu-muda`. Nama berdasarkan wujud akan berbohong begitu dark mode masuk.',
        '**Hitung kontras sebelum mengunci.** Teks minimal 4.5:1; teks besar dan ikon bermakna minimal 3:1.',
        '**Definisikan di `:root` dan `.dark`,** lalu petakan lewat `@theme inline`.',
        '**Larang nilai mentah di komponen.** Ini yang membuat sistemnya bertahan.',
      ),
      callout(
        'warning',
        'Nama berdasarkan wujud selalu berumur pendek',
        '`--color-abu-terang` yang nilainya menjadi hampir hitam di dark mode adalah nama yang berbohong. `--color-surface` tetap benar di kedua mode, karena ia menggambarkan **peran**, bukan warna.',
      ),

      h2('Menambah tanpa mengganti bawaan'),
      code(
        'css',
        `
        @theme {
          --color-merek: #8f5314;    /* menambah, sisanya tetap ada */
        }

        @theme {
          --color-*: initial;        /* hapus SELURUH palet bawaan */
          --color-bg: #faf7f1;       /* lalu definisikan sendiri */
          --color-text: #191713;
        }
        `,
      ),
      p(
        'Kedua blok memakai `@theme` yang sama tapi berperilaku berlawanan. Blok pertama **menambah**: `--color-merek` menghasilkan utility `bg-merek`, `text-merek`, dan seterusnya, sementara seluruh palet bawaan Tailwind tetap tersedia. Blok kedua memakai `--color-*: initial` yang **menghapus seluruh namespace warna** lebih dulu, sehingga hanya warna yang kamu definisikan setelahnya yang ada. Perhatikan tanda bintang di sana adalah wildcard untuk namespace, dan pola yang sama berlaku untuk `--spacing-*` maupun `--font-*`. Efeknya disebut di kotak berikut dan layak dipertimbangkan serius: setelah palet bawaan dibuang, `bg-indigo-500` menjadi **error saat build**, bukan sekadar sesuatu yang harus ditangkap reviewer.',
      ),
      callout(
        'tip',
        'Menghapus palet bawaan adalah pagar yang efektif',
        'Setelah `--color-*: initial`, menulis `bg-indigo-500` menjadi **error**, bukan sekadar tidak dianjurkan. Aturan yang ditegakkan alat selalu lebih bertahan daripada aturan yang ditegakkan review.',
      ),

      h2('Token bisa dibaca dari mana saja'),
      code(
        'js',
        `
        // JavaScript
        getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
        `,
      ),
      code(
        'css',
        `
        /* CSS biasa, di luar utility */
        .khusus { border-color: var(--color-border); }
        `,
      ),
      p(
        'Inilah keuntungan terbesar pendekatan CSS-first v4: satu source of truth yang dibaca semua lapisan — utility, CSS biasa, JavaScript, dan DevTools.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Uji paling jujur untuk sebuah sistem token adalah permintaan yang pasti datang cepat atau lambat, yaitu klien mengganti warna mereknya. Pertanyaannya sederhana dan jawabannya menyingkap segalanya, **berapa berkas yang harus disunting**. Pada project yang menulis warna langsung di komponen, jawabannya puluhan sampai ratusan. Pada project yang mengunci token, jawabannya satu baris.',
      ),
      p(
        'Website ini menempuh jalur kedua, dan tulisan di `globals.css`-nya menyebutkan alasannya dengan tegas, bahwa tidak ada satu pun nilai warna atau spacing yang boleh ditulis langsung di komponen. Yang membuat aturan itu bisa ditegakkan adalah `@theme inline`, dan perbedaan antara memakainya dan tidak memakainya jauh lebih besar daripada yang terlihat.',
      ),
      code(
        'text',
        `
        Dua versi yang isinya sama, hanya berbeda satu kata:

          :root  { --merek: #8f5314; }
          .dark  { --merek: #e5a13c; }

          @theme        { --color-primary: var(--merek); }
          @theme inline { --color-primary: var(--merek); }

        CSS yang dihasilkan Tailwind 4.3.3:

          @theme (biasa)
            :root { --color-primary: var(--merek); }
            .bg-primary { background-color: var(--color-primary); }   <-- dua lompatan

          @theme inline
            (tidak ada variabel --color-primary sama sekali)
            .bg-primary { background-color: var(--merek); }           <-- langsung
        `,
        { caption: 'Dibaca langsung dari keluaran @tailwindcss/postcss 4.3.3.' },
      ),
      p(
        'Selisih satu lompatan itu tidak berarti apa-apa sampai ada tema gelap yang tidak dipasang di elemen akar. Situasinya nyata dan sering, misalnya satu bagian halaman terang yang sengaja dibuat gelap, seperti bilah alat editor atau blok kode.',
      ),
      code(
        'text',
        `
        <div class="bg-primary">terang</div>
        <div class="dark">
          <div class="bg-primary">pulau gelap di dalam halaman terang</div>
        </div>

        Diukur di Chrome 151:

          @theme (biasa)
            #terang = rgb(143, 83, 20)
            #pulau  = rgb(143, 83, 20)     <-- TIDAK ikut gelap

          @theme inline
            #terang = rgb(143, 83, 20)
            #pulau  = rgb(229, 161, 60)    <-- ikut gelap, benar
        `,
        { caption: 'Dijalankan sungguhan dan diukur di Chrome 151.' },
      ),
      p(
        'Sebabnya ada pada cara CSS menyelesaikan variabel. Pada `@theme` biasa, `--color-primary` dideklarasikan di `:root`, jadi nilai `var(--merek)` di dalamnya diselesaikan di `:root` juga. Nilai hasil penyelesaian itulah yang diwariskan ke seluruh keturunan, sehingga `--merek` yang berbeda di dalam `.dark` datang terlambat dan tidak berpengaruh. `@theme inline` menghapus perantaranya, sehingga `var(--merek)` baru diselesaikan di elemen yang memakainya, dan di sana `.dark` sudah berlaku.',
      ),
      p(
        'Karena itu urutan menulis tokennya adalah menaruh nilai mentah di `:root` dan `.dark`, lalu memetakannya ke namespace Tailwind di dalam `@theme inline`. Nilai warnanya hidup di satu tempat, dan mengganti merek benar-benar berarti mengganti beberapa baris.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Bagian `@theme` termasuk yang paling sering menimbulkan error, dan itu kabar baik, sebab error jauh lebih mudah diperbaiki daripada kegagalan senyap. Tiga di bawah dijalankan sungguhan.',
      ),
      code(
        'text',
        `
        @import 'tailwindcss';

        :root {
          --primary: #8f5314;
        }

        .tombol {
          @apply bg-primary;
        }

        CssSyntaxError: tailwindcss: .../b.css:1:1:
        Cannot apply unknown utility class \`bg-primary\`
        `,
        { caption: 'Dijalankan sungguhan dengan Tailwind 4.3.3.' },
      ),
      p(
        'Ini kesalahpahaman yang paling sering muncul, dan pesannya sendiri tidak menjelaskannya. Sebuah CSS variable biasa di `:root` **tidak pernah** menghasilkan utility. Yang menghasilkan utility hanyalah variabel yang dideklarasikan di dalam `@theme`, dan itu memang disengaja, sebab kalau tidak, setiap variabel apa pun di project akan diam-diam menjadi nama class.',
      ),
      code(
        'text',
        `
        @theme {
          --primary: #8f5314;
        }

        CssSyntaxError: Cannot apply unknown utility class \`bg-primary\`
        `,
        { caption: 'Dijalankan sungguhan. Sudah di dalam @theme, dan tetap gagal.' },
      ),
      p(
        'Kali ini variabelnya sudah berada di tempat yang benar, tapi namanya belum. Tailwind memakai **awalan namespace** untuk memutuskan utility mana yang dibentuk, jadi `--color-primary` menghasilkan `bg-primary`, `text-primary`, dan `border-primary`, sedangkan `--primary` tidak menghasilkan apa pun. Namespace lain bekerja sama, misalnya `--spacing-*`, `--radius-*`, `--font-*`, dan `--breakpoint-*`.',
      ),
      code(
        'text',
        `
        @theme {
          .kartu { padding: 1rem; }
        }

        CssSyntaxError: tailwindcss: .../o.css:1:1:
        \`@theme\` blocks must only contain custom properties or \`@keyframes\`.

          @theme {
        >   .kartu {
        >     padding: 1rem;
          }
        `,
        { caption: 'Dijalankan sungguhan. @theme bukan tempat menulis aturan CSS.' },
      ),
      p(
        'Pesan ini menegaskan peran `@theme` dengan tepat. Ia adalah **daftar nilai**, bukan tempat menulis style. Satu pengecualian yang disebutkannya adalah `@keyframes`, sebab definisi animasi memang bagian dari tema dan dirujuk oleh token `--animate-*`.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di bagian ini bertahan lama, sebab token yang salah bentuk tetap bekerja untuk kasus sederhana dan baru gagal ketika temanya bertambah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis token di `:root` lalu berharap ada utility-nya',
            'Ia sudah jadi variabel CSS',
            'Diuji sungguhan, hasilnya `Cannot apply unknown utility class`. Hanya `@theme` yang membentuk utility',
          ],
          [
            'Menamai token `--primary`, bukan `--color-primary`',
            'Lebih pendek dan jelas',
            'Diuji sungguhan, tanpa awalan namespace tidak ada utility yang dibentuk sama sekali',
          ],
          [
            'Memakai `@theme` biasa untuk token yang berubah menurut tema',
            'Itu bentuk yang standar',
            'Diukur, pulau gelap di dalam halaman terang tidak ikut berubah. Untuk token bertema, `@theme inline` yang benar',
          ],
          [
            'Menamai token berdasarkan warnanya, misalnya `--color-biru`',
            'Nama warna paling mudah diingat',
            'Ketika mereknya berganti jadi hijau, namanya berdusta. Namai berdasarkan perannya, misalnya `--color-primary`',
          ],
          [
            'Mengganti seluruh palet bawaan tanpa sengaja',
            'Hanya menambahkan warna sendiri',
            '`--color-*: initial` di dalam `@theme` menghapus seluruh palet. Tanpa baris itu, tokenmu hanya menambah',
          ],
          [
            'Mengunci warna tanpa menghitung kontrasnya',
            'Warnanya sudah disetujui desainer',
            'Diukur pada palet project ini, amber `#E5A13C` di atas latar terang hanya 2,07:1. Ia dipakai sebagai isian, tidak pernah sebagai teks',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah keputusan nyata yang tercatat di project ini, dan angkanya berasal dari pengukuran, bukan dari perkiraan. Warna aksen `#8F5314` mencapai 6,15:1 di atas putih sehingga aman sebagai teks, sedangkan amber `#E5A13C` hanya 2,07:1 di atas latar terang sehingga hanya boleh menjadi bidang isian dengan teks gelap di atasnya. Dua warna yang sama-sama berasal dari satu keluarga merek bisa berakhir dengan peran yang sepenuhnya berbeda, dan yang memutuskan adalah angkanya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        '`@theme` menghasilkan utility dari token secara otomatis.',
        '`@theme inline` membuat utility merujuk variabel — syarat agar tema bisa berganti.',
        'Beri nama menurut peran, bukan wujud.',
        'Hitung kontras sebelum mengunci warna.',
        '`--color-*: initial` menghapus palet bawaan dan menjadikan penyimpangan sebagai error.',
      ),
      references(
        {
          label: 'Theme variables',
          href: 'https://tailwindcss.com/docs/theme',
          source: 'Tailwind CSS',
          note: 'Seluruh namespace `@theme`, termasuk `--color-*: initial` untuk membuang palet bawaan.',
        },
        {
          label: 'Adding custom styles',
          href: 'https://tailwindcss.com/docs/adding-custom-styles',
          source: 'Tailwind CSS',
          note: 'Kapan menambah token dan kapan cukup memakai nilai sembarang.',
        },
        {
          label: 'Using CSS custom properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties',
          source: 'MDN',
          note: 'Karena token v4 benar-benar CSS variable, seluruh aturan pewarisannya berlaku.',
        },
        {
          label: 'oklch()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch',
          source: 'MDN',
          note: 'Ruang warna yang membuat perubahan kecerahan terasa merata antar-warna.',
        },
      ),
    ],
  ),

  written(
    'menyusun-komponen',
    'Menyusun Komponen: `@apply`, `cva`, `tailwind-merge`',
    21,
    'Menghindari class yang berulang di dua puluh tempat — tanpa kembali ke CSS bernama.',
    [
      terms(
        {
          term: '@apply',
          meaning:
            'Arahan yang menyalin utility ke dalam sebuah class CSS bernama. Terlihat seperti jalan keluar untuk class yang berulang, tapi **ia mengembalikan seluruh masalah CSS bernama** dari Sub-bab 1.1: tidak bisa dihapus dengan yakin, dan perubahannya berjangkauan luas. Pakai sehemat mungkin.',
        },
        {
          term: 'komponen sebagai jawaban',
          meaning:
            'Cara yang benar mengatasi pengulangan class: **buat komponen**, bukan class CSS baru. `<Tombol variant="utama">` menyelesaikan hal yang sama dengan `.btn-utama`, tapi tanpa menciptakan lapisan CSS yang harus dirawat terpisah.',
        },
        {
          term: 'cva',
          meaning:
            'Singkatan *class variance authority*. Library kecil untuk menyusun **varian sebuah komponen** secara terstruktur, mencakup ukuran, warna, dan keadaan, beserta kombinasinya. Ia menggantikan rantai ternary panjang yang cepat menjadi tidak terbaca.',
        },
        {
          term: 'tailwind-merge',
          meaning:
            'Library yang menyelesaikan **class yang saling bertabrakan**. Menulis `p-4 p-8` menghasilkan hasil yang bergantung pada urutan di berkas CSS, bukan urutan di atributmu — dan itu sering mengejutkan. `twMerge` memastikan yang terakhir yang menang, sehingga prop `className` dari luar bisa benar-benar menimpa bawaan komponen.',
        },
        {
          term: 'cn',
          meaning:
            'Nama fungsi pembantu yang lazim, gabungan `clsx` dan `twMerge`. Tugasnya dua: menggabungkan class bersyarat, lalu membereskan yang bertabrakan. Project ini punya fungsi itu di `src/lib/utils/cn.ts`.',
        },
        {
          term: 'clsx',
          meaning:
            'Library kecil untuk **menyusun nama class secara bersyarat**: `clsx("dasar", aktif && "bg-primary")`. Ia hanya menggabungkan dan membuang nilai kosong — ia **tidak** menyelesaikan tabrakan, dan itulah kenapa ia biasa dipasangkan dengan `twMerge`.',
        },
        {
          term: 'urutan class tidak berpengaruh',
          meaning:
            'Kesalahpahaman yang sangat umum. Urutan class di dalam atribut `class` **tidak menentukan apa pun** — yang menentukan adalah urutan aturan di berkas CSS hasil build. Inilah alasan `p-4 p-8` tidak bisa diandalkan, dan alasan `tailwind-merge` perlu ada.',
        },
        {
          term: 'prop className',
          meaning:
            'Kebiasaan membiarkan komponen menerima `className` dari luar agar bisa disesuaikan di tempat pemakaian. Berguna, tapi hanya benar-benar bekerja kalau digabungkan dengan `twMerge` — tanpa itu, class dari luar bisa kalah oleh bawaan komponen tanpa alasan yang terlihat.',
        },
      ),

      h2('Cara pertama: komponen, bukan class'),
      code(
        'jsx',
        `
        // Pengulangan diselesaikan di lapisan komponen — bukan di CSS
        export function Kartu({ children }) {
          return (
            <div className="rounded-lg border border-border bg-surface p-5">
              {children}
            </div>
          );
        }
        `,
      ),
      p(
        'Ini jawaban utama untuk "class-nya berulang di mana-mana". Di React, satuan pemakaian ulang adalah komponen — dan ia sudah membawa strukturnya, bukan hanya stylenya.',
      ),

      h2('`@apply` — dan kapan ia menyembunyikan masalah'),
      code(
        'css',
        `
        @layer components {
          .tombol { @apply rounded-md px-4 py-2 font-medium; }
        }
        `,
      ),
      p(
        '`@apply` menyalin utility ke dalam class CSS bernama, dan sekilas itu terasa seperti jalan tengah yang ideal karena kamu menulis utility lalu memakainya sebagai class biasa. Masalahnya, yang kamu hasilkan **adalah class CSS bernama**, lengkap dengan seluruh kerugiannya dari awal bab ini. Class `.tombol` tidak bisa dihapus dengan yakin karena kamu tidak tahu di mana saja ia dipakai, dan mengubahnya bisa merusak halaman yang tidak kamu buka sejak lama. Jadi kamu menukar satu kerugian dengan kerugian yang sama, plus satu lapisan tambahan. `@layer components` di sana menempatkannya pada lapisan yang benar sehingga utility tetap bisa menimpanya, tetapi itu memperbaiki urutan dan bukan masalah pokoknya.',
      ),
      callout(
        'warning',
        'Kalau kamu membangun `.btn`, `.card`, `.badge` — kamu kembali ke titik awal',
        'Kamu mendapatkan semua kerugian CSS bernama (tidak bisa dihapus dengan yakin, jangkauan perubahan luas) **plus** satu lapisan tambahan. `@apply` masuk akal untuk hal yang tidak bisa jadi komponen: gaya `prose`, reset elemen, dan style untuk HTML yang datang dari luar.',
      ),
      code(
        'css',
        `
        /* Pemakaian @apply yang tepat: mengatur HTML yang bukan milikmu */
        .prose-lesson h2 { @apply mt-12 font-sans text-xl font-semibold; }
        .prose-lesson code { @apply rounded-sm border border-code-border px-1; }
        `,
        { caption: 'Persis alasan website ini memakainya untuk kelas `prose-lesson`.' },
      ),
      p(
        'Inilah kasus di mana `@apply` memang jawabannya, dan komentarnya menyebut syaratnya, yaitu **HTML yang bukan milikmu.** Materi di halaman ini dirender dari data menjadi `<h2>` dan `<code>` biasa, sehingga tidak ada tempat untuk menempelkan `className` karena kamu tidak menulis tag-nya satu per satu. Selektor turunan seperti `.prose-lesson h2` menyelesaikan itu dengan satu class di pembungkus, lalu seluruh elemen di dalamnya ikut tergaya. Pola yang sama berlaku untuk keluaran Markdown, konten dari CMS, dan HTML dari editor teks kaya. Perhatikan pembedanya bukan "apakah stylenya berulang", melainkan **apakah kamu punya akses ke elemennya**. Kalau punya, komponen selalu lebih tepat.',
      ),

      h2('`cva` untuk varian'),
      code('bash', `npm install class-variance-authority`),
      code(
        'tsx',
        `
        import { cva, type VariantProps } from 'class-variance-authority';

        const tombol = cva(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:ring-2',
          {
            variants: {
              varian: {
                utama: 'bg-primary-fill text-on-primary-fill hover:brightness-95',
                sekunder: 'border border-border bg-surface hover:bg-raised',
                hantu: 'text-muted hover:bg-raised hover:text-text',
              },
              ukuran: {
                sm: 'h-9 px-3 text-sm',
                md: 'h-11 px-4',
              },
            },
            defaultVariants: { varian: 'sekunder', ukuran: 'md' },
          },
        );

        type Props = React.ComponentProps<'button'> & VariantProps<typeof tombol>;

        export function Tombol({ varian, ukuran, className, ...sisa }: Props) {
          return <button className={tombol({ varian, ukuran, className })} {...sisa} />;
        }
        `,
      ),
      p(
        '`cva` menerima dua bagian, dan pembagiannya jelas. Argumen pertama adalah class **dasar** yang berlaku untuk semua varian, mencakup bentuk, tipografi, transisi, dan cincin fokus. Argumen kedua berisi `variants`, tempat tiap dimensi punya daftar pilihannya sendiri, sehingga `varian` mengatur warna dan `ukuran` mengatur tinggi serta padding. Karena keduanya dimensi terpisah, mereka bisa dikombinasikan bebas tanpa kamu menulis satu pun kombinasinya. `defaultVariants` menutup celah terakhir, sebab `<Tombol>` tanpa prop apa pun tetap menghasilkan tombol yang benar.',
      ),
      p(
        "Dua baris terakhir menghubungkannya ke React. `VariantProps<typeof tombol>` **menurunkan tipe** dari konfigurasi di atasnya — jadi `varian` otomatis bertipe `'utama' | 'sekunder' | 'hantu'` tanpa kamu menuliskannya lagi, dan menambah varian baru di `cva` langsung memperbarui tipenya. Perhatikan juga `className` ikut dioper ke dalam `tombol({ ... })`, bukan digabung terpisah: `cva` sudah menempatkannya di urutan paling akhir supaya pemanggil bisa menimpa gaya bawaan. Ini penerapan pola \"warisi, keluarkan yang perlu digabung, teruskan sisanya\" dari Bab 3, dengan `cva` mengambil alih bagian tengahnya.",
      ),
      callout(
        'tip',
        'Keuntungan yang tidak terlihat dari `cva`',
        'Tipe variannya dihasilkan otomatis lewat `VariantProps`. Salah ketik `varian="utamaa"` menjadi error saat menulis — dan editor menampilkan pilihan yang benar. Ini menghapus ledakan boolean prop sekaligus memberi keamanan tipe.',
      ),

      h2('`tailwind-merge` — menyelesaikan konflik'),
      code(
        'tsx',
        `
        // Masalah: dua utility yang bertabrakan, yang menang ditentukan
        // urutan di file CSS — bukan urutan di className
        <div className="p-4 p-8" />        // hasilnya tidak bisa diprediksi

        import { twMerge } from 'tailwind-merge';
        twMerge('p-4 p-8');                 // 'p-8' — yang terakhir menang
        twMerge('px-2 p-4');                // 'p-4'
        twMerge('text-red-500', undefined); // 'text-red-500'
        `,
      ),
      p(
        'Komentar pertama menyebut sesuatu yang mengejutkan. Pada `className="p-4 p-8"`, yang menang **bukan** yang ditulis belakangan. CSS tidak melihat urutan di atribut `class`, melainkan urutan aturan di berkas CSS-nya, dan urutan itu ditentukan Tailwind saat build. Jadi hasilnya bisa `p-4` maupun `p-8` tergantung bagaimana keduanya kebetulan tersusun, dan itulah arti "tidak bisa diprediksi". `twMerge` menyelesaikannya dengan **memahami arti tiap utility**, sebab ia tahu `p-4` dan `p-8` mengatur properti yang sama lalu membuang yang lebih awal. Baris ketiga menunjukkan ia juga mengenali hubungan yang lebih halus, karena `p-4` mencakup `px-2` sehingga yang lama dibuang meski namanya berbeda. Baris terakhir menandai ia aman menerima `undefined`.',
      ),
      code(
        'tsx',
        `
        import { clsx, type ClassValue } from 'clsx';
        import { twMerge } from 'tailwind-merge';

        export function cn(...input: ClassValue[]) {
          return twMerge(clsx(input));
        }

        // Sekarang pemanggil bisa menimpa dengan hasil yang bisa diprediksi
        <Kartu className="p-8" />
        `,
      ),
      p(
        'Fungsi `cn` menggabungkan dua alat yang menyelesaikan masalah berbeda, dan **urutannya penting**, karena `clsx` dijalankan lebih dulu di dalam dan `twMerge` di luar. `clsx` mengurus penggabungan kondisional dengan membuang `false`, `null`, dan `undefined`, lalu menyatukan sisanya jadi satu string. `twMerge` baru menerima string itu dan menyelesaikan konflik di dalamnya. Membaliknya tidak akan bekerja, karena `twMerge` mengharapkan string dan bukan objek atau boolean. Tipe `ClassValue` dari `clsx` yang dipakai di parameter membuat `cn` menerima semua bentuk masukan yang didukungnya. Setelah ini, `<Kartu className="p-8" />` berperilaku persis seperti dugaan pemanggil, dan seperti kata kotak berikut, project ini sendiri tidak membutuhkannya.',
      ),
      callout(
        'info',
        'Project ini sengaja TIDAK memakai `tailwind-merge`',
        'Komponen di sini menyusun class dari token dan tidak pernah menimpa utility milik pemanggil, jadi resolusi konflik menyelesaikan masalah yang tidak ada. `cn()` di project ini hanya menggabungkan string. Tambahkan `twMerge` saat kamu benar-benar membangun library komponen yang pemakainya perlu menimpa gaya.',
      ),

      h2('Urutan memilih'),
      ol(
        '**Komponen React** — jawaban untuk hampir semua pengulangan.',
        '**`cva`** — saat satu komponen punya beberapa varian.',
        '**`cn()`** — saat class perlu digabung secara kondisional.',
        '**`tailwind-merge`** — hanya kalau pemanggil memang perlu menimpa.',
        '**`@apply`** — hanya untuk HTML yang bukan milikmu.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Sebuah komponen `<Tombol>` dipakai di empat puluh tempat. Suatu hari muncul satu layar yang butuh tombol dengan latar merah, dan yang dilakukan pemakainya paling wajar, yaitu mengoper class tambahan lewat prop `className`. Hasilnya tidak berubah sama sekali, atau lebih tepatnya berubah pada sebagian tombol dan tidak pada sebagian lain, dan itu membuatnya tampak seperti bug hantu.',
      ),
      code(
        'tsx',
        `
        function Tombol({ className, ...sisanya }: React.ComponentProps<'button'>) {
          return <button className={\`rounded bg-blue-500 px-4 py-2 \${className ?? ''}\`} {...sisanya} />;
        }

        // Di tempat pemakaian:
        <Tombol className="bg-red-500">Hapus</Tombol>
        `,
        {
          caption:
            'Terlihat benar: class tambahan ditulis paling belakang, jadi seharusnya menang.',
        },
      ),
      p(
        'Anggapan bahwa class yang ditulis paling belakang menang adalah kesalahpahaman yang perlu diluruskan lebih dulu, sebab dari sinilah seluruh kebutuhan akan `tailwind-merge` berasal.',
      ),
      code(
        'text',
        `
        <div class="p-4 p-2 bg-red-500 bg-blue-500"></div>
                    ^^^  ^^^  ^^^^^^^^^^  ^^^^^^^^^^^
                    urutan yang ditulis di markup

        Urutan sebenarnya di dalam CSS hasil Tailwind 4.3.3:

          .bg-blue-500 { background-color: var(--color-blue-500); }
          .bg-red-500  { background-color: var(--color-red-500); }
          .p-2         { padding: calc(var(--spacing) * 2); }
          .p-4         { padding: calc(var(--spacing) * 4); }

        Yang menang adalah yang berada paling bawah di CSS:
          background -> bg-red-500     (padahal ditulis lebih DULU di markup)
          padding    -> p-4            (padahal ditulis lebih DULU di markup)
        `,
        { caption: 'Dibaca langsung dari keluaran @tailwindcss/postcss 4.3.3.' },
      ),
      p(
        'Jadi urutan di atribut `class` sama sekali tidak berpengaruh. Yang menentukan adalah urutan aturan di dalam berkas CSS, dan urutan itu ditetapkan Tailwind sendiri secara tetap. Pada contoh di atas urutannya kebetulan menurut abjad, sehingga `bg-red-500` jatuh di bawah `bg-blue-500` dan memenangi pertarungan tanpa peduli siapa yang ditulis belakangan di markup.',
      ),
      p(
        'Inilah yang diselesaikan `tailwind-merge`. Ia tidak mengandalkan urutan CSS melainkan **membuang class yang bertabrakan** sebelum sampai ke atribut, sehingga hanya satu yang tersisa dan hasilnya bisa diprediksi.',
      ),
      code(
        'tsx',
        `
        import { twMerge } from 'tailwind-merge';
        import { cva, type VariantProps } from 'class-variance-authority';

        const gayaTombol = cva('inline-flex items-center rounded font-medium transition-colors', {
          variants: {
            tampilan: {
              utama: 'bg-blue-600 text-white hover:bg-blue-700',
              sekunder: 'border border-neutral-300 hover:bg-neutral-50',
              bahaya: 'bg-red-600 text-white hover:bg-red-700',
            },
            ukuran: { kecil: 'px-2 py-1 text-sm', sedang: 'px-4 py-2', besar: 'px-6 py-3 text-lg' },
          },
          defaultVariants: { tampilan: 'utama', ukuran: 'sedang' },
        });

        type PropsTombol = React.ComponentProps<'button'> & VariantProps<typeof gayaTombol>;

        export function Tombol({ className, tampilan, ukuran, ...sisanya }: PropsTombol) {
          // twMerge membuang class yang bertabrakan, yang datang belakangan menang.
          return <button className={twMerge(gayaTombol({ tampilan, ukuran }), className)} {...sisanya} />;
        }

        // Sekarang hasilnya bisa diprediksi:
        // <Tombol className="bg-red-500" />  -> bg-blue-600 dibuang, bg-red-500 dipakai
        `,
        {
          caption:
            'cva mengurus varian, twMerge mengurus tabrakan. Keduanya menyelesaikan masalah yang berbeda.',
        },
      ),
      callout(
        'warning',
        'Contoh cva dan tailwind-merge di atas TIDAK dijalankan',
        'Ketiga paketnya, yaitu `class-variance-authority`, `tailwind-merge`, dan `clsx`, tidak terpasang di project ini, dan aturan project melarang menambah dependency tanpa persetujuan lebih dulu. Kodenya disusun mengikuti dokumentasi resmi masing-masing, tapi berbeda dengan seluruh pengukuran lain di sub-bab ini, ia tidak dieksekusi. Yang dijalankan sungguhan adalah masalah yang mendasarinya, yaitu urutan CSS yang mengalahkan urutan markup.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Menyusun komponen adalah bagian Tailwind yang paling banyak menghasilkan error sungguhan, dan dua di bawah ini termasuk yang paling sering ditemui.',
      ),
      code(
        'text',
        `
        /* Tombol.module.css — atau <style> di dalam komponen Vue/Svelte */
        .tombol {
          @apply px-4 py-2;
        }

        CssSyntaxError: tailwindcss: .../f.css:1:1:
        Cannot apply unknown utility class \`px-4\`. Are you using CSS modules or
        similar and missing \`@reference\`?
        https://tailwindcss.com/docs/functions-and-directives#reference-directive
        `,
        {
          caption:
            'Dijalankan sungguhan dengan Tailwind 4.3.3. Pesannya bahkan menyebutkan perbaikannya.',
        },
      ),
      p(
        'Penyebabnya, setiap berkas CSS Module dikompilasi **sendiri-sendiri**, terpisah dari berkas utamamu. Berkas itu karena itu tidak tahu apa pun tentang tema dan utility yang ada, sehingga `px-4` benar-benar tidak dikenalnya. Perbaikannya adalah `@reference "../app/globals.css";` di puncak berkas, yang membuat Tailwind membaca tema dari sana tanpa ikut menyalin isinya.',
      ),
      code(
        'text',
        `
        .tombol {
          @apply px-4 py-2 rounded-mdd bg-primary;
        }

        CssSyntaxError: tailwindcss: .../a.css:1:1:
        Cannot apply unknown utility class \`rounded-mdd\`

        > 1 | @import 'tailwindcss';
            | ^
          2 |
          3 | .tombol {
        `,
        { caption: 'Dijalankan sungguhan. Salah ketik satu huruf, dan seluruh build berhenti.' },
      ),
      p(
        'Perhatikan perbedaan penting antara dua tempat. Salah ketik di dalam `@apply` **menghentikan build**, sedangkan salah ketik di atribut `class` pada markup tidak menghasilkan apa pun, tidak error dan tidak juga style. Sifat berteriak itu sebenarnya keuntungan `@apply` yang jarang disebut, sebab ia menangkap salah ketik yang di markup akan lolos diam-diam.',
      ),
      p(
        'Ada satu perbedaan lagi antara dua cara mengekstrak class yang tidak menghasilkan error apa pun tapi menentukan sekali, yaitu apakah class hasilnya bisa dipakai bersama varian.',
      ),
      code(
        'text',
        `
        @utility tombol-utama {
          @apply rounded-md px-4 py-2 font-medium;
        }

        @layer components {
          .kartu-lama {
            @apply rounded-md p-4;
          }
        }

        Class yang dipakai di markup:
          <div class="tombol-utama md:tombol-utama hover:tombol-utama"></div>
          <div class="kartu-lama md:kartu-lama"></div>

        Yang benar-benar dihasilkan Tailwind 4.3.3:

          .tombol-utama                       ADA
          .md\\:tombol-utama                   ADA
          .hover\\:tombol-utama                ADA
          .md\\:kartu-lama                     TIDAK ADA     <-- diam-diam hilang
        `,
        { caption: 'Dijalankan sungguhan. @utility mendukung varian, @layer components tidak.' },
      ),
      p(
        'Karena itu versi 4 menganjurkan `@utility` ketika kamu memang perlu membuat class sendiri di CSS. Class dari `@layer components` tetap berfungsi, tapi ia berhenti di situ, dan `md:` maupun `hover:` di depannya akan hilang tanpa peringatan apa pun.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di bagian ini hampir selalu berasal dari niat baik, yaitu ingin markup lebih rapi. Yang keliru bukan niatnya melainkan alat yang dipilih untuk mencapainya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menjadikan `@apply` cara utama merapikan markup',
            'Markup jadi bersih seperti dulu',
            'Kembali membangun berkas CSS bernama yang tidak bisa dihapus dengan yakin, hanya dengan sintaks berbeda',
          ],
          [
            'Menyambung class tambahan dengan template literal',
            'Yang ditulis belakangan menang',
            'Diukur, urutan di markup tidak berpengaruh sama sekali. Urutan CSS yang menentukan, dan itu ditetapkan Tailwind',
          ],
          [
            'Memakai `@apply` di CSS Module tanpa `@reference`',
            'Sintaksnya sama saja',
            'Diuji sungguhan, buildnya gagal. Setiap CSS Module dikompilasi terpisah dan tidak mengenal temamu',
          ],
          [
            'Membuat class sendiri dengan `@layer components`',
            'Itu cara yang diajarkan di versi 3',
            'Diuji sungguhan, `md:` dan `hover:` di depan classnya tidak dihasilkan. Pakai `@utility`',
          ],
          [
            'Membuat prop boolean untuk setiap tampilan tombol',
            'Paling mudah ditulis',
            '`<Tombol primary danger small />` membuka kombinasi yang tidak masuk akal. Satu prop `tampilan` menutupnya',
          ],
          [
            'Mengurutkan class dengan tangan agar rapi',
            'Terlihat lebih terbaca',
            'Waktu yang terbuang, dan hasilnya tidak konsisten antarorang. `prettier-plugin-tailwindcss` melakukannya otomatis',
          ],
        ],
      ),
      p(
        'Baris terakhir bisa dilihat hasilnya langsung, sebab project ini memasang plugin tersebut. Class yang ditulis berantakan akan disusun ulang oleh Prettier ke urutan yang selalu sama.',
      ),
      code(
        'text',
        `
        Sebelum prettier --write:

          <div className="text-white p-4 md:p-6 flex hover:bg-red-600 bg-red-500
                          rounded-lg items-center dark:bg-red-700 gap-2">

        Sesudahnya:

          <div className="flex items-center gap-2 rounded-lg bg-red-500 p-4
                          text-white hover:bg-red-600 md:p-6 dark:bg-red-700">

        Urutannya bukan abjad melainkan menurut peran:
          tata letak -> kotak -> tampilan -> tipografi -> varian status -> responsif -> tema
        `,
        {
          caption:
            'Dijalankan sungguhan dengan prettier 3.9.6 dan prettier-plugin-tailwindcss 0.8.1 yang terpasang di project ini.',
        },
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Pengulangan diselesaikan dengan komponen, bukan dengan class CSS baru.',
        '`@apply` untuk HTML yang tidak bisa kamu bungkus komponen.',
        '`cva` memberi varian sekaligus tipe yang dihasilkan otomatis.',
        '`tailwind-merge` hanya perlu kalau pemanggil menimpa gaya.',
        'Tambahkan alat saat masalahnya muncul, bukan sebelumnya.',
      ),
      references(
        {
          label: 'Reusing styles',
          href: 'https://tailwindcss.com/docs/styling-with-utility-classes#managing-duplication',
          source: 'Tailwind CSS',
          note: 'Anjuran resmi mendahulukan komponen daripada `@apply` untuk mengatasi pengulangan.',
        },
        {
          label: 'Functions and directives — @apply',
          href: 'https://tailwindcss.com/docs/functions-and-directives#apply-directive',
          source: 'Tailwind CSS',
          note: 'Termasuk peringatan resmi bahwa ia mengembalikan masalah CSS bernama.',
        },
        {
          label: 'Styling with utility classes — Conflicting utilities',
          href: 'https://tailwindcss.com/docs/styling-with-utility-classes#conflicting-utilities',
          source: 'Tailwind CSS',
          note: 'Penegasan bahwa urutan class di atribut tidak menentukan apa pun — dasar kebutuhan `tailwind-merge`.',
        },
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Pola prop `variant` dan `className` yang menjadi lapisan penyelesai pengulangan.',
        },
      ),
    ],
  ),

  written(
    'transisi-animasi',
    'Transisi & Animasi + reduced motion',
    19,
    'Gerak yang membantu, bukan yang memamerkan.',
    [
      terms(
        {
          term: 'transisi',
          meaning:
            'Perubahan **bertahap** dari satu keadaan ke keadaan lain, bukan lompatan seketika. Di Tailwind kamu menyebutkan **property apa** yang beranimasi (`transition-colors`) dan **berapa lama** (`duration-150`). Menyebutkan propertynya penting — `transition-all` memaksa browser mengamati semuanya, termasuk yang mahal.',
        },
        {
          term: 'duration',
          meaning:
            'Lamanya sebuah transisi. Acuan yang berguna: **150–200 ms** untuk hal kecil seperti warna tombol, **200–300 ms** untuk yang lebih besar. Di atas 300 ms mulai terasa lambat, dan pada elemen yang sering disentuh itu berubah dari "halus" menjadi "mengganggu".',
        },
        {
          term: 'easing',
          meaning:
            'Terjemahannya **kurva percepatan** — bagaimana gerakan berubah cepat-lambat sepanjang durasinya. `ease-out` (cepat lalu melambat) hampir selalu tepat untuk sesuatu yang **muncul**, karena ia terasa seperti benda yang datang lalu berhenti dengan sendirinya.',
        },
        {
          term: 'compositor-friendly',
          meaning:
            'Terjemahan bebasnya **ramah bagi tahap penyusunan lapisan**. Hanya `transform` dan `opacity` yang bisa dianimasikan tanpa memicu perhitungan ulang tata letak. Menganimasikan `width`, `height`, atau `left` memaksa reflow di **setiap frame** — dan itulah sumber animasi yang tersendat.',
        },
        {
          term: 'prefers-reduced-motion',
          meaning:
            'Pengaturan sistem tempat pengguna menyatakan bahwa **gerakan mengganggunya**. Ini bukan preferensi gaya: bagi sebagian orang, animasi besar memicu pusing dan mual sungguhan. Menghormatinya lewat `motion-reduce:` bukan penyempurnaan opsional melainkan kewajiban aksesibilitas.',
        },
        {
          term: 'motion-reduce',
          meaning:
            'Varian Tailwind yang aktif ketika pengguna meminta pengurangan gerak. Yang perlu dipahami: **mematikan animasi sepenuhnya tidak selalu jawaban terbaik** — mengganti gerakan besar dengan pudar singkat sering lebih baik, karena feedback-nya tetap ada tanpa perpindahan yang memicu keluhan.',
        },
        {
          term: 'interruptible',
          meaning:
            'Terjemahannya **bisa disela**. Animasi yang menanggapi tindakan baru **di tengah jalan**, alih-alih memaksa selesai dulu. Transisi CSS bersifat begini secara bawaan; animasi berbasis keyframe sering tidak, dan itu terasa kaku saat pengguna berubah pikiran.',
        },
        {
          term: 'gerak fungsional',
          meaning:
            'Gerakan yang **menjelaskan sesuatu**: dari mana panel muncul, ke mana item berpindah, apakah sesuatu sedang diproses. Lawannya gerak dekoratif yang hanya memperlambat. Ujinya sederhana — kalau animasi itu dihapus, apakah ada informasi yang hilang bagi pengguna?',
        },
      ),

      h2('Transisi'),
      code(
        'html',
        `
        <button class="transition-colors duration-150 hover:bg-raised">
        <div class="transition-transform duration-200 hover:scale-105">
        <div class="transition-opacity">
        `,
      ),
      callout(
        'danger',
        'Jangan pakai `transition-all`',
        'Ia mengamati **setiap** properti yang berubah, termasuk yang memicu perhitungan layout, dan sering menganimasikan hal yang tidak kamu maksud. Sebutkan properti yang benar-benar berubah: `transition-colors`, `transition-transform`, `transition-opacity`.',
      ),

      h2('Hanya `transform` dan `opacity`'),
      code(
        'html',
        `
        <!-- Murah — hanya tahap composite, berjalan di GPU -->
        <div class="transition-transform hover:-translate-y-1">
        <div class="transition-opacity hover:opacity-80">

        <!-- Mahal — memicu layout ulang di SETIAP frame -->
        <div class="transition-[width] hover:w-64">
        <div class="transition-[height]">
        `,
      ),
      p(
        'Ini penerapan langsung dari sub-bab 4.11: `transform` dan `opacity` melewati tahap layout dan paint sepenuhnya.',
      ),

      h2('Durasi dan easing'),
      table(
        ['Elemen', 'Durasi'],
        [
          ['Feedback tekan', '100–160ms'],
          ['Tooltip, popover kecil', '125–200ms'],
          ['Dropdown', '150–250ms'],
          ['Modal, drawer', '200–500ms'],
        ],
      ),
      callout(
        'tip',
        'Di bawah 300ms untuk UI, tanpa pengecualian',
        'Dropdown 180ms terasa **lebih responsif** daripada yang 400ms. Dan jangan pernah `ease-in` untuk sesuatu yang muncul — ia mulai lambat, tepat di saat pengguna sedang menunggu.',
      ),
      code(
        'css',
        `
        @theme {
          /* Easing bawaan CSS terlalu lemah untuk terbaca sebagai keputusan */
          --ease-out-ui: cubic-bezier(0.23, 1, 0.32, 1);
          --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
          --duration-fast: 120ms;
          --duration-normal: 180ms;
        }
        `,
        { caption: 'Token motion project ini.' },
      ),
      p(
        'Motion ikut ditokenkan seperti warna dan spacing, dan alasannya sama, sebab animasi yang terasa berbeda-beda antar komponen hampir selalu berasal dari nilai yang ditulis ad-hoc di tiap tempat. Komentarnya menyebut kenapa easing bawaan tidak dipakai, karena `ease-out` standar CSS terlalu lembut untuk terbaca sebagai keputusan desain. Kurva `cubic-bezier(0.23, 1, 0.32, 1)` melesat cepat di awal lalu melambat panjang di akhir, dan itu yang membuat sebuah elemen terasa "tiba" alih-alih sekadar bergeser. Perhatikan ada easing terpisah untuk drawer, sebab elemen besar yang menempuh jarak jauh butuh kurva yang berbeda dari tooltip kecil. Setelah didefinisikan di `@theme`, keduanya langsung tersedia sebagai `ease-out-ui` dan `duration-fast` di utility.',
      ),

      h2('Animasi bawaan dan kustom'),
      code(
        'html',
        `
        <div class="animate-spin">
        <div class="animate-pulse">     <!-- skeleton -->
        <div class="animate-bounce">
        `,
      ),
      code(
        'css',
        `
        @theme {
          --animate-masuk: masuk 200ms var(--ease-out-ui);
        }

        @keyframes masuk {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        `,
      ),
      p(
        'Pola ini butuh **dua bagian yang saling melengkapi**. `@keyframes masuk` mendefinisikan gerakannya dalam CSS biasa, dan `--animate-masuk` di `@theme` mendaftarkannya ke Tailwind sehingga lahir utility `animate-masuk`. Perhatikan nilai token itu memuat tiga hal sekaligus, yaitu nama keyframe, durasi, dan easing. Dengan begitu seluruh keputusan motion tetap terkumpul di satu tempat, dan easing-nya memakai token dari bagian sebelumnya alih-alih nilai baru. Isi keyframenya sendiri menerapkan aturan di awal sub-bab, sebab hanya `opacity` dan `transform` yang dianimasikan tanpa `height` maupun `margin`. Peringatan di kotak berikut menentukan kapan pola ini tepat, karena keyframe cocok untuk sesuatu yang muncul sekali dan bukan untuk elemen yang bisa dipicu berulang cepat.',
      ),
      callout(
        'warning',
        'Keyframe tidak bisa diinterupsi',
        'Transisi CSS bisa dibelokkan di tengah jalan, sedangkan keyframe selalu mulai dari nol. Untuk elemen yang bisa dipicu berulang cepat seperti toast dan toggle, pakai transisi.',
      ),

      h2('`prefers-reduced-motion` — kewajiban'),
      code(
        'html',
        `
        <div class="transition-transform motion-reduce:transition-none hover:scale-105 motion-reduce:hover:scale-100">
        `,
      ),
      code(
        'css',
        `
        /* Cara global — dan yang lebih tepat daripada mematikan semuanya */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            /* Pergerakan dihapus; warna dan opacity tetap — keduanya membawa makna */
            transition-property: color, background-color, border-color, opacity !important;
            transition-duration: 120ms !important;
            animation-duration: 0.01ms !important;
          }
        }
        `,
      ),
      p(
        'Blok CSS ini lebih tepat daripada varian `motion-reduce:` di atasnya untuk satu alasan praktis, yaitu ia berlaku **untuk seluruh halaman sekaligus**. Varian per-elemen menuntut kamu mengingatnya di setiap tempat, dan yang terlewat tidak akan ketahuan. Bagian yang paling layak diperhatikan adalah baris `transition-property`, sebab ia **tidak mematikan semua transisi** melainkan mempersempitnya menjadi warna dan opacity saja. Itu sesuai maksud spesifikasinya, karena yang menyebabkan ketidaknyamanan adalah perpindahan posisi dan bukan perubahan warna, sehingga mematikan seluruh feedback justru membuat antarmuka terasa rusak. `animation-duration: 0.01ms` dipakai alih-alih `0` karena nilai nol pada sebagian browser membuat event `animationend` tidak pernah terpicu, sehingga kode yang menunggu animasi selesai akan menggantung.',
      ),
      callout(
        'info',
        'Reduced motion bukan "tanpa animasi"',
        'Yang menyebabkan ketidaknyamanan adalah **perpindahan posisi**, bukan perubahan warna. Mematikan semua transisi membuat antarmuka terasa rusak. Hapus geraknya, pertahankan feedback-nya. Project ini melakukannya persis begitu setelah temuan audit.',
      ),

      h2('Kapan tidak menganimasikan sama sekali'),
      table(
        ['Frekuensi pemakaian', 'Keputusan'],
        [
          ['Ratusan kali sehari (pintasan keyboard)', '**Tanpa animasi**'],
          ['Puluhan kali sehari (hover, navigasi)', 'Sangat singkat atau tidak sama sekali'],
          ['Sesekali (modal, drawer, toast)', 'Animasi standar'],
          ['Jarang (onboarding)', 'Boleh lebih ekspresif'],
        ],
      ),
      p(
        'Sidebar di website ini sengaja **tidak** dianimasikan saat dibuka-tutup — ia dipakai puluhan kali per sesi, dan animasi apa pun akan membuatnya terasa lambat.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Panel samping yang muncul dari kanan adalah salah satu animasi yang paling sering diminta, dan juga salah satu yang paling sering dibuat dengan cara yang membuat aplikasinya terasa berat. Dua versi di bawah menghasilkan gerak yang secara visual mirip, dan biaya jalannya berbeda enam kali.',
      ),
      compare(
        {
          title: 'Menganimasikan lebar',
          lang: 'tsx',
          code: `
            <aside
              className={
                'overflow-hidden transition-all duration-300 ' +
                (terbuka ? 'w-80' : 'w-0')
              }
            >
              <DaftarNotifikasi />
            </aside>
          `,
          notes: [
            'Setiap frame memaksa hitung ulang tata letak',
            'Seluruh isinya ikut dihitung ulang',
          ],
        },
        {
          title: 'Menganimasikan transform',
          lang: 'tsx',
          code: `
            <aside
              className={
                'w-80 transition-transform duration-300 ' +
                (terbuka ? 'translate-x-0' : 'translate-x-full')
              }
            >
              <DaftarNotifikasi />
            </aside>
          `,
          notes: [
            'Lebarnya tetap, tata letak tidak berubah',
            'Isinya dihitung sekali, lalu digeser',
          ],
        },
      ),
      code(
        'text',
        `
        Diukur di Chrome 151, 200 paragraf berteks, 60 frame, tiga kali jalan:

          menganimasikan width      : 117ms, 123ms, 125ms
          menganimasikan transform  :  21ms,  22ms,  21ms

        Selisihnya kurang lebih enam kali.
        `,
        {
          caption: 'Dijalankan sungguhan di Chrome 151. Angkanya konsisten pada tiga pengulangan.',
        },
      ),
      p(
        'Sumber selisihnya bukan kerumitan `transform` melainkan **apa yang harus dihitung ulang peramban setiap frame**. Mengubah lebar sebuah wadah berarti setiap teks di dalamnya harus dipatahkan ulang jadi baris baru, dan itu pekerjaan yang berulang enam puluh kali per detik. Mengubah `transform` tidak mengubah ukuran apa pun, sehingga hasil perhitungan tata letak yang sudah ada tetap berlaku dan yang berubah hanya posisi gambarnya.',
      ),
      p(
        'Karena itu ukuran keputusannya bukan "mana yang lebih cepat" melainkan **"apakah properti ini mengubah tata letak"**. Yang mengubah tata letak antara lain `width`, `height`, `padding`, `margin`, `top`, `left`, dan `font-size`. Yang tidak mengubahnya hanya dua, yaitu `transform` dan `opacity`.',
      ),
      table(
        ['Yang ingin dianimasikan', 'Cara yang murah', 'Kenapa'],
        [
          [
            'Panel muncul dari samping',
            '`translate-x-full` ke `translate-x-0`',
            'Lebarnya tidak pernah berubah',
          ],
          [
            'Menu turun dari atas',
            '`-translate-y-2 opacity-0` ke `translate-y-0 opacity-100`',
            'Dua properti termurah sekaligus',
          ],
          [
            'Kartu membesar saat dihampiri',
            '`hover:scale-105`',
            'Tidak mendorong kartu tetangganya',
          ],
          [
            'Akordion membuka isinya',
            '`grid-rows-[0fr]` ke `grid-rows-[1fr]`',
            'Satu-satunya cara animasi tinggi otomatis tanpa mengukur dengan JavaScript',
          ],
        ],
      ),
      p(
        'Baris terakhir perlu penjelasan karena ia satu-satunya pengecualian yang wajar. Tinggi isi akordion tidak diketahui sebelumnya, dan `height: auto` tidak bisa dianimasikan. Trik grid dengan satuan `fr` bekerja karena `grid-template-rows` bisa dianimasikan sedangkan `auto` tidak, dan hasilnya masih mengubah tata letak sehingga tetap lebih mahal daripada `transform`. Bedanya, di sini tidak ada alternatif yang lebih murah.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Animasi tidak pernah gagal dengan pesan error. Yang gagal adalah orangnya, dan gejalanya bisa berupa gerak yang tersendat atau gerak yang tetap berjalan padahal penggunanya sudah minta dihentikan. Yang kedua lebih serius, sebab bagi sebagian orang ia menimbulkan mual dan pusing sungguhan.',
      ),
      code(
        'text',
        `
        <div class="transition-transform duration-300 motion-reduce:transition-none">
        <div class="animate-spin motion-reduce:animate-none">

        Diukur di Chrome 151 dengan Emulation.setEmulatedMedia:

          prefers-reduced-motion: no-preference
            transition-duration = 0.3s
            animation-name      = spin

          prefers-reduced-motion: reduce
            transition-duration = 0.3s      <-- tetap 0.3s, dan itu tidak masalah
            transition-property = none      <-- tidak ada properti yang ditransisikan
            animation-name      = none      <-- animasinya benar-benar mati
        `,
        { caption: 'Dijalankan sungguhan di Chrome 151 lewat protokol DevTools.' },
      ),
      p(
        'Angka `0.3s` yang tetap bertahan itu sering membuat orang mengira `motion-reduce:transition-none` tidak bekerja. Sebenarnya ia bekerja dengan benar. Yang diubahnya adalah `transition-property` menjadi `none`, dan begitu tidak ada properti yang ditransisikan, durasi berapa pun tidak berlaku pada apa pun. Jadi periksa `transition-property`, bukan durasinya.',
      ),
      p(
        'Kegagalan kedua lebih halus dan tidak bisa diukur dengan alat, yaitu animasi yang menahan pengguna. Ia tetap "berhasil" secara teknis.',
      ),
      code(
        'text',
        `
        Tiga durasi yang sama-sama berjalan tanpa error,
        dengan akibat yang sangat berbeda:

          duration-150   umpan balik seketika, terasa seperti aplikasi asli
          duration-300   batas atas yang masih terasa responsif
          duration-700   pengguna sudah selesai membaca sebelum geraknya berhenti
          duration-1000  terasa seperti aplikasi yang lambat, bukan aplikasi yang halus

        Yang perlu diingat, animasi terjadi SETELAH pengguna memutuskan.
        Setiap milidetik sesudah itu adalah menunggu.
        `,
      ),
      p(
        'Angka acuan yang biasa dipakai, gerak yang merespons tindakan langsung sebaiknya 150 sampai 200 milidetik, dan gerak yang memperkenalkan sesuatu yang baru muncul boleh sampai 300. Di atas 400, hampir selalu ada yang keliru pada niatnya, sebab animasi yang panjang hanya masuk akal untuk sesuatu yang tidak menghalangi apa pun.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Animasi adalah bagian yang paling menyenangkan dikerjakan, dan justru karena itu paling mudah berlebihan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `transition-all`',
            'Satu class untuk semuanya',
            'Peramban mengawasi setiap properti yang berubah, termasuk yang mengubah tata letak. Sebut propertinya dengan tepat',
          ],
          [
            'Menganimasikan `width` atau `height`',
            'Itu yang memang berubah',
            'Diukur, 117ms melawan 21ms untuk gerak yang mirip. Pakai `transform` bila bisa',
          ],
          [
            'Melewatkan `prefers-reduced-motion`',
            'Animasinya halus dan tidak mengganggu',
            'Bagi sebagian orang ia menimbulkan mual sungguhan. Ini baseline aksesibilitas, bukan pilihan gaya',
          ],
          [
            'Memakai `duration-1000` agar terlihat halus',
            'Lambat terasa mahal',
            'Animasi terjadi setelah pengguna memutuskan, jadi setiap milidetiknya adalah menunggu',
          ],
          [
            'Menganimasikan sesuatu yang muncul saat halaman dimuat',
            'Kesan pertama jadi bagus',
            'Ia menunda saat isinya bisa dibaca. Konten utama sebaiknya sudah ada sejak frame pertama',
          ],
          [
            'Menyimpulkan `motion-reduce` tidak jalan karena durasinya tetap',
            'Angkanya masih 0.3s',
            'Diukur, yang berubah adalah `transition-property` menjadi `none`. Periksa properti, bukan durasi',
          ],
        ],
      ),
      p(
        'Baris pertama layak diperjelas karena `transition-all` terlihat sangat praktis. Masalahnya bukan biaya menuliskannya melainkan bahwa ia menyalakan transisi pada properti yang tidak kamu sadari sedang berubah, misalnya `height` yang bergeser karena isinya bertambah. Akibatnya muncul gerak yang tidak pernah kamu rancang, dan gerak seperti itu adalah yang paling sulit dilacak asalnya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Jangan `transition-all`; sebutkan propertinya.',
        'Animasikan `transform` dan `opacity` saja.',
        'Di bawah 300ms untuk UI; jangan `ease-in` untuk yang muncul.',
        'Keyframe tidak bisa diinterupsi — pakai transisi untuk pemicu berulang.',
        'Reduced motion = hapus gerak, pertahankan feedback warna.',
        'Elemen yang sering dipakai lebih baik tanpa animasi sama sekali.',
      ),
      references(
        {
          label: 'Transition property',
          href: 'https://tailwindcss.com/docs/transition-property',
          source: 'Tailwind CSS',
          note: 'Utility transisi beserta alasan menyebutkan property lebih baik daripada `transition-all`.',
        },
        {
          label: 'prefers-reduced-motion',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion',
          source: 'MDN',
          note: 'Pengaturan sistem yang wajib dihormati — bukan preferensi gaya melainkan kebutuhan nyata.',
        },
        {
          label: 'Stick to compositor-only properties',
          href: 'https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count',
          source: 'web.dev',
          note: 'Alasan hanya `transform` dan `opacity` yang aman dianimasikan.',
        },
        {
          label: 'Animation from Interactions (WCAG 2.3.3)',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html',
          source: 'W3C WCAG',
          note: 'Standar resmi yang mendasari kewajiban menghormati pengurangan gerak.',
        },
        {
          label: 'CSS easing functions',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function',
          source: 'MDN',
          note: 'Perbedaan `ease-in`, `ease-out`, dan kenapa keduanya tidak bisa ditukar begitu saja.',
        },
      ),
    ],
  ),

  written(
    'aksesibilitas-tailwind',
    'Aksesibilitas: `focus-visible`, `sr-only`, kontras',
    22,
    'Utility yang menjaga baseline tetap terpenuhi — dan yang tidak bisa ditawar.',
    [
      p(
        'Aturan `frontend.md` di project ini menempatkan aksesibilitas **di atas** preferensi desain. Ini bukan sikap moral — antarmuka yang tidak bisa dipakai keyboard adalah antarmuka yang rusak, sama seperti tombol yang tidak merespons klik.',
      ),

      terms(
        {
          term: 'aksesibilitas',
          meaning:
            'Dari *accessibility*, sering disingkat **a11y** (huruf a, 11 huruf, huruf y). Kemampuan sebuah antarmuka dipakai oleh **semua orang**, termasuk yang memakai pembaca layar, hanya keyboard, atau memperbesar tampilan. Aturan project ini menempatkannya **di atas preferensi desain** — dan alasannya praktis, bukan moral: antarmuka yang tidak bisa dipakai keyboard sama rusaknya dengan tombol yang tidak merespons klik.',
        },
        {
          term: 'sr-only',
          meaning:
            'Singkatan *screen reader only*. Utility yang menyembunyikan elemen **dari mata tapi tetap membiarkannya dibacakan** teknologi bantu. Bedakan tegas dari `hidden`, yang menyembunyikannya dari **semua orang** termasuk pembaca layar.',
        },
        {
          term: 'not-sr-only',
          meaning:
            'Kebalikannya — memunculkan kembali elemen yang tadinya `sr-only`. Pemakaian paling umum: tautan "lewati ke konten utama" yang tersembunyi sampai difokuskan dengan Tab, lalu muncul untuk pengguna keyboard.',
        },
        {
          term: 'skip link',
          meaning:
            'Terjemahannya **tautan lewati**. Tautan pertama di halaman yang membiarkan pengguna keyboard melompat langsung ke konten utama tanpa menelusuri seluruh menu navigasi. Tanpa itu, setiap perpindahan halaman berarti puluhan tekanan Tab.',
        },
        {
          term: 'rasio kontras',
          meaning:
            'Perbandingan kecerahan antara teks dan latarnya, ditulis seperti `4.5:1`. Ambang WCAG AA: **4,5:1** untuk teks biasa, **3:1** untuk teks besar dan elemen antarmuka yang bermakna. Angka ini bisa dihitung, jadi ia bukan soal selera — ia bisa benar atau salah.',
        },
        {
          term: 'warna sebagai satu-satunya penanda',
          meaning:
            'Kesalahan yang sangat umum: menandai error hanya dengan border merah. Sekitar 8% laki-laki mengalami buta warna tertentu, dan mereka tidak akan melihat perbedaannya. Selalu **tambahkan ikon atau teks** — pola yang sama dipakai callout di website ini.',
        },
        {
          term: 'outline-none',
          meaning:
            'Utility yang menghapus cincin fokus bawaan browser. Menulisnya **tanpa menyediakan pengganti** adalah salah satu cacat aksesibilitas paling sering di web. Aturan project ini menyebutnya terang-terangan: focus indicator tidak pernah dihapus tanpa penggantinya.',
        },
        {
          term: 'ring',
          meaning:
            'Utility Tailwind untuk membuat cincin di sekeliling elemen memakai `box-shadow`. Lebih fleksibel daripada `outline` karena bisa diberi warna, ketebalan, dan jarak — sehingga cocok sebagai pengganti cincin fokus bawaan yang serasi dengan desainmu.',
        },
        {
          term: 'urutan fokus',
          meaning:
            'Urutan elemen yang dilalui saat menekan Tab. Ia mengikuti **urutan di markup**, bukan urutan visual. Karena itu utility seperti `order-*` pada flexbox bisa membuat tampilan dan urutan fokus tidak lagi sejalan — dan pengguna keyboard jadi melompat-lompat tanpa pola.',
        },
      ),

      h2('Focus yang selalu terlihat'),
      code(
        'html',
        `
        <button class="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
        `,
      ),
      code(
        'css',
        `
        /* Sekali di globals.css — berlaku untuk seluruh aplikasi */
        :focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        `,
      ),
      p(
        'Kedua blok menyelesaikan hal yang sama dari dua arah, dan sebaiknya kamu pilih salah satu. Blok pertama memakai utility per-elemen, dengan `ring-2` yang menggambar cincin, `ring-primary` yang mewarnainya dengan token, dan `ring-offset-2` yang memberi jarak dari tepinya supaya cincin tetap terbaca di atas latar apa pun. Blok kedua memasang aturan `:focus-visible` **sekali di `globals.css`** sehingga berlaku untuk seluruh elemen yang bisa difokus, termasuk yang lupa kamu beri class. Untuk aplikasi sungguhan, pendekatan global hampir selalu lebih aman, sebab cacat aksesibilitas yang paling umum bukan cincin yang salah warna melainkan **cincin yang lupa dipasang** di satu tombol yang jarang disentuh.',
      ),
      callout(
        'danger',
        'Uji ini sekarang di project apa pun yang sedang kamu buat',
        'Tekan Tab berulang kali. Kalau ada satu saja titik di mana kamu **tidak tahu di mana posisimu**, aplikasi itu tidak bisa dipakai tanpa mouse. Ini pemeriksaan sepuluh detik yang menangkap cacat aksesibilitas paling umum.',
      ),

      h2('`sr-only`'),
      code(
        'html',
        `
        <!-- Tombol berikon butuh nama yang bisa dibaca -->
        <button>
          <TrashIcon aria-hidden="true" />
          <span class="sr-only">Hapus tugas</span>
        </button>

        <!-- Skip link: terlihat hanya saat difokus -->
        <a href="#konten" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
          Lompat ke konten
        </a>

        <!-- Label yang tetap ada tapi tidak ditampilkan -->
        <label for="cari" class="sr-only">Cari</label>
        <input id="cari" type="search" />
        `,
      ),
      callout(
        'warning',
        '`sr-only` bukan `hidden`',
        '`hidden` menghapus elemen dari **semua** pengguna, termasuk screen reader. `sr-only` menyembunyikannya secara visual tapi tetap membacakannya. Memakai `hidden` untuk label adalah menghapus labelnya.',
      ),
      p(
        'Perhatikan rangkaian empat class pada tautan "Lompat ke konten": `sr-only` menyembunyikannya secara visual di keadaan normal, lalu `focus:not-sr-only` **membatalkan** penyembunyian itu tepat saat elemennya difokuskan (biasanya dengan menekan Tab pertama kali di halaman), dan `focus:absolute focus:top-4 focus:left-4` memposisikannya di pojok kiri atas layar begitu ia muncul — supaya tidak mendorong tata letak lain saat tiba-tiba terlihat. Hasilnya: pengguna mouse tidak pernah melihat tautan ini sama sekali, tapi pengguna keyboard yang menekan Tab pertama kali langsung melihatnya muncul, dan bisa menekan Enter untuk melompati seluruh menu navigasi.',
      ),

      h2('Kontras'),
      table(
        ['Jenis', 'Minimum WCAG AA'],
        [
          ['Teks biasa', '**4.5:1**'],
          ['Teks besar (≥24px atau ≥19px tebal)', '3:1'],
          ['Ikon dan batas UI yang bermakna', '3:1'],
          ['Teks nonaktif', 'Tidak diatur — tapi tetap harus terbaca'],
        ],
      ),
      callout(
        'danger',
        'Warna abu-abu muda di atas putih hampir selalu gagal',
        '`text-gray-400` di atas putih adalah sekitar 2,8:1 — gagal. Ini kombinasi paling umum di antarmuka buatan pemula, dan ia membuat teks sekunder tidak terbaca bagi banyak orang. Ukur, jangan kira-kira.',
      ),

      h2('Warna tidak boleh jadi satu-satunya pembawa makna'),
      code(
        'html',
        `
        <!-- SALAH: hanya warna -->
        <span class="text-danger">Gagal</span>

        <!-- BENAR: ikon + kata + warna -->
        <span class="flex items-center gap-1 text-danger">
          <XIcon aria-hidden="true" />
          Gagal
        </span>
        `,
      ),
      p(
        'Sekitar satu dari dua belas laki-laki mengalami buta warna tertentu. Selain itu, warna juga tidak terbaca dalam cetakan hitam-putih dan pada layar dengan pengaturan kontras tinggi.',
      ),

      h2('Target sentuh'),
      code(
        'html',
        `
        <button class="h-11 w-11">          <!-- 44×44px -->
        <a class="-m-2 p-2">                <!-- perbesar area tanpa mengubah tampilan -->
        `,
      ),
      p(
        'Trik `-m-2 p-2` berguna untuk ikon kecil yang **tampilan visualnya** harus tetap mungil tapi **area yang bisa disentuh** perlu diperbesar ke ukuran minimum 44×44px. `p-2` menambah padding di sekeliling ikon, memperluas area klik/sentuhnya; `-m-2` (margin negatif dengan besaran yang sama) menarik elemennya kembali ke posisi visual semula, sehingga padding tambahan tadi tidak mendorong elemen lain di sekitarnya menjauh. Hasil akhirnya: ikon terlihat sama persis seperti sebelumnya, tapi area yang bisa ditekan jari di layar sentuh jauh lebih besar dari sekadar ukuran ikonnya.',
      ),

      h2('Checklist sepuluh menit'),
      ol(
        'Tekan Tab dari atas ke bawah — apakah posisi fokus selalu terlihat?',
        'Apakah urutan Tab mengikuti urutan visual?',
        'Apakah setiap tombol berikon punya nama yang bisa dibaca?',
        'Apakah setiap input punya `<label>`?',
        'Ukur kontras teks terkecil — apakah ≥4.5:1?',
        'Nyalakan reduced motion di OS — apakah antarmuka masih berfungsi?',
        'Zoom ke 200% — apakah masih terbaca tanpa scroll ke samping?',
        'Apakah ada informasi yang hanya disampaikan lewat warna?',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Sebuah tabel data di panel admin diaudit aksesibilitasnya, dan tiga temuan muncul yang semuanya berasal dari keputusan yang terlihat wajar. Bilah alatnya berisi tombol beriikon tanpa teks. Kolom statusnya dibedakan hanya dengan warna titik. Dan teks keterangan di bawah setiap barisnya memakai abu lembut supaya tidak mencuri perhatian.',
      ),
      code(
        'tsx',
        `
        // Versi yang gagal audit. Tidak ada yang salah tulis di sini.
        function BarisPesanan({ pesanan }: { pesanan: Pesanan }) {
          return (
            <tr>
              <td>{pesanan.nomor}</td>
              <td>
                <span className={pesanan.lunas ? 'text-green-500' : 'text-red-500'}>●</span>
              </td>
              <td className="text-gray-400 text-sm">{pesanan.catatan}</td>
              <td>
                <button className="focus:ring-2"><IkonUbah /></button>
                <button className="focus:ring-2"><IkonHapus /></button>
              </td>
            </tr>
          );
        }
        `,
        {
          caption:
            'Tiga masalah sekaligus: nama tombol, warna sebagai satu-satunya penanda, dan kontras.',
        },
      ),
      p(
        'Temuan ketiga bisa diukur, dan angkanya menutup perdebatan selera. Berikut kontras beberapa warna teks bawaan Tailwind di atas latar putih, dihitung dari nilai sRGB yang sebenarnya dipakai peramban.',
      ),
      code(
        'text',
        `
        Diukur di Chrome 151 dari palet bawaan Tailwind 4.3.3,
        di atas latar #ffffff, memakai rumus kontras WCAG:

          text-gray-400     #99a1af    2,60:1     GAGAL   (minimum teks biasa 4,5:1)
          text-gray-500     #6a7282    4,84:1     lolos
          text-gray-600     #4a5565    7,56:1     lolos dengan lapang
          text-blue-500     #2b7fff    3,76:1     GAGAL untuk teks, lolos untuk ikon/border
          text-yellow-400   #fdc700    1,57:1     GAGAL total
        `,
        {
          caption:
            'Dijalankan sungguhan: warna dibaca dari getComputedStyle, dikonversi ke sRGB lewat canvas, lalu dihitung.',
        },
      ),
      p(
        'Perhatikan bahwa `text-gray-400` dan `text-gray-500` hanya berselisih satu tingkat, tapi yang satu gagal dan yang lain lolos. Ini yang membuat masalah kontras begitu sering lolos review, sebab kedua warnanya terlihat sangat mirip bagi mata yang sehat di layar yang bagus dan di ruangan yang teduh. Yang membedakan bukan penilaian mata melainkan angkanya.',
      ),
      code(
        'tsx',
        `
        // Versi yang lolos audit. Perubahannya kecil dan semuanya bisa dijelaskan.
        function BarisPesanan({ pesanan }: { pesanan: Pesanan }) {
          return (
            <tr>
              <td>{pesanan.nomor}</td>
              <td>
                {/* Warna TAMBAHAN, bukan pembawa makna. Yang membawa makna adalah teksnya. */}
                <span
                  className={
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm ' +
                    (pesanan.lunas
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800')
                  }
                >
                  <span aria-hidden="true">{pesanan.lunas ? '✓' : '!'}</span>
                  {pesanan.lunas ? 'Lunas' : 'Belum lunas'}
                </span>
              </td>

              {/* gray-600 menggantikan gray-400: 7,56:1 melawan 2,60:1. */}
              <td className="text-sm text-gray-600">{pesanan.catatan}</td>

              <td>
                {/* Nama tombol dibawa sr-only, dan cincin fokusnya focus-visible. */}
                <button className="rounded p-2 focus-visible:ring-2">
                  <IkonUbah aria-hidden="true" className="size-4" />
                  <span className="sr-only">Ubah pesanan {pesanan.nomor}</span>
                </button>
                <button className="rounded p-2 focus-visible:ring-2">
                  <IkonHapus aria-hidden="true" className="size-4" />
                  <span className="sr-only">Hapus pesanan {pesanan.nomor}</span>
                </button>
              </td>
            </tr>
          );
        }
        `,
        {
          caption:
            'Nama tombolnya menyertakan nomor pesanan, sebab "Hapus" saja tidak memberi tahu menghapus apa.',
        },
      ),
      p(
        'Bagian `sr-only` yang menyertakan nomor pesanan patut diperhatikan. Pengguna pembaca layar biasanya menelusuri halaman dengan meminta daftar seluruh tombol, dan daftar berisi dua puluh tombol bernama "Hapus" tidak berguna sama sekali. Menyertakan nomornya membuat setiap tombol punya identitas.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Aksesibilitas tidak pernah menghasilkan error, dan itu justru masalahnya. Halaman yang tidak bisa dipakai tanpa mouse tetap lolos build, lolos test, dan terlihat sempurna bagi orang yang membuatnya. Dua pengukuran di bawah menunjukkan hal-hal yang biasanya baru disadari kalau memang diukur.',
      ),
      code(
        'text',
        `
        <button class="focus:ring-2">A</button>
        <button class="focus-visible:ring-2">B</button>

        Diukur di Chrome 151 dengan peristiwa masukan asli
        lewat protokol DevTools, bukan dengan .focus() dari skrip:

          KLIK MOUSE pada A     :focus = true   :focus-visible = false   -> ADA cincin
          KLIK MOUSE pada B     :focus = true   :focus-visible = false   -> tidak ada cincin

          TEKAN TAB ke A        :focus = true   :focus-visible = true    -> ADA cincin
          TEKAN TAB ke B        :focus = true   :focus-visible = true    -> ADA cincin
        `,
        {
          caption:
            'Dijalankan sungguhan lewat Input.dispatchMouseEvent dan Input.dispatchKeyEvent di Chrome 151.',
        },
      ),
      p(
        'Tabel itu menjelaskan seluruh persoalan dalam empat baris. `focus:` dan `focus-visible:` berperilaku **sama** ketika pengguna menekan Tab, dan berbeda **hanya** ketika pengguna mengeklik dengan mouse. Jadi memilih `focus-visible:` tidak mengurangi apa pun bagi pengguna papan ketik, dan menghilangkan cincin yang tampak seperti cacat bagi pengguna mouse. Tidak ada pertukaran di sini, hanya satu pilihan yang lebih baik.',
      ),
      p(
        'Pengukuran kedua menyangkut perbedaan yang sering dianggap sama, yaitu antara menyembunyikan sesuatu secara visual dan menghilangkannya sama sekali.',
      ),
      code(
        'text',
        `
        <span class="sr-only">Hapus catatan</span>
        <span class="hidden">Hapus catatan</span>

        Diukur di Chrome 151:

          sr-only
            position    = absolute
            width       = 1px
            height      = 1px
            clip-path   = inset(50%)
            overflow    = hidden
            white-space = nowrap
            kotak       = 1x1px          <-- ada di halaman, dibacakan pembaca layar

          hidden
            display     = none
            kotak       = 0x0px          <-- tidak ada, TIDAK dibacakan
        `,
        { caption: 'Dijalankan sungguhan dan diukur di Chrome 151.' },
      ),
      p(
        'Rangkaian properti `sr-only` itu bukan kumpulan trik sembarangan. `position: absolute` mengeluarkannya dari alur sehingga tidak menyisakan ruang, ukuran 1x1 piksel dengan `clip-path: inset(50%)` membuatnya tidak tergambar, dan `white-space: nowrap` mencegah teks panjang di dalamnya mengubah tata letak sekitarnya. Yang penting, elemennya **tetap ada**, dan itu satu-satunya alasan pembaca layar masih membacakannya. `display: none` menghapusnya dari pohon aksesibilitas, sehingga memakainya untuk memberi nama tombol berarti tombolnya tetap tanpa nama.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Hampir semua kesalahan aksesibilitas berasal dari satu kebiasaan, yaitu menguji halaman hanya dengan cara yang dipakai sendiri.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis `outline-none` tanpa penggantinya',
            'Outline bawaan memang tidak rapi',
            'Halamannya jadi tidak bisa ditelusuri tanpa mouse. Kalau outline dihapus, `focus-visible:ring-2` wajib ada',
          ],
          [
            'Memakai `focus:ring` untuk cincin fokus',
            'Namanya paling langsung',
            'Diukur, cincinnya juga muncul saat diklik mouse. `focus-visible:` memberi hasil identik bagi pengguna papan ketik',
          ],
          [
            'Memakai `hidden` untuk menyembunyikan label tombol',
            'Sama-sama tidak terlihat',
            'Diukur, `hidden` bernilai `display: none` dan hilang dari pohon aksesibilitas. Tombolnya jadi tanpa nama. Pakai `sr-only`',
          ],
          [
            'Membedakan status hanya dengan warna',
            'Warna paling cepat dibaca',
            'Sekitar satu dari dua belas laki-laki tidak bisa membedakan merah dan hijau. Sertakan teks atau bentuk',
          ],
          [
            'Memakai `text-gray-400` untuk teks pendukung',
            'Terlihat lembut dan berkelas',
            'Diukur, 2,60:1 di atas putih dan minimumnya 4,5:1. `text-gray-600` mencapai 7,56:1 tanpa terlihat kasar',
          ],
          [
            'Memberi tombol ikon padding `p-1`',
            'Ikonnya kecil, kotaknya cukup',
            'Target sentuh jadi sekitar 24px, sedangkan acuannya 44px. Pakai `p-2` beserta `size-5` atau lebih besar',
          ],
        ],
      ),
      p(
        'Baris keempat punya satu tolok ukur yang mudah diingat dan mudah diterapkan, yaitu **cetak halamanmu hitam-putih dalam kepala**. Kalau setelah semua warnanya hilang masih terbaca mana yang sudah lunas dan mana yang belum, penanda selain warna sudah cukup. Kalau tidak, ada informasi yang hanya bisa diakses sebagian penggunamu.',
      ),
      callout(
        'tip',
        'Uji sepuluh detik yang menemukan lebih banyak masalah daripada alat mana pun',
        'Letakkan mouse jauh dari jangkauan, lalu jelajahi halamanmu hanya dengan Tab, Enter, Spasi, dan Esc. Kalau ada satu saja hal yang tidak bisa dicapai, atau kamu kehilangan jejak posisi fokus, di situlah masalahnya. Uji ini tidak butuh alat apa pun dan menemukan lebih banyak daripada pemeriksa otomatis, sebab yang diukurnya adalah bisa atau tidaknya halaman itu dipakai.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Focus ring wajib terlihat — uji dengan menekan Tab.',
        '`sr-only` menyembunyikan visual tapi tetap dibacakan; `hidden` menghapus untuk semua.',
        'Teks minimal 4.5:1; ikon dan batas bermakna minimal 3:1.',
        'Warna tidak boleh jadi satu-satunya pembawa makna.',
        'Target sentuh 44×44px — `-m-2 p-2` memperbesar area tanpa mengubah tampilan.',
      ),
      references(
        {
          label: 'Screen readers',
          href: 'https://tailwindcss.com/docs/screen-readers',
          source: 'Tailwind CSS',
          note: 'Utility `sr-only` dan `not-sr-only` beserta pemakaiannya untuk skip link.',
        },
        {
          label: 'Contrast (Minimum) — WCAG 1.4.3',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
          source: 'W3C WCAG',
          note: 'Ambang 4,5:1 untuk teks biasa dan 3:1 untuk teks besar.',
        },
        {
          label: 'Use of Color — WCAG 1.4.1',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html',
          source: 'W3C WCAG',
          note: 'Standar yang melarang warna menjadi satu-satunya pembawa makna.',
        },
        {
          label: ':focus-visible',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible',
          source: 'MDN',
          note: 'Pengganti `:focus` yang menghapus alasan orang menulis `outline-none`.',
        },
        {
          label: 'ARIA states and properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes',
          source: 'MDN',
          note: 'Rujukan `aria-current`, `aria-expanded`, dan atribut lain yang dipakai di praktik penutup.',
        },
      ),
    ],
  ),

  written(
    'praktik-navbar-card',
    'Praktik: Navbar + Card responsif dari nol',
    23,
    'Membangun dua komponen nyata dengan token sendiri — dan mengujinya terhadap baseline.',
    [
      p(
        'Praktik penutup bab. Kamu akan membangun dua komponen yang muncul di hampir setiap aplikasi, memakai token sendiri, dan mengujinya terhadap checklist aksesibilitas.',
      ),

      terms(
        {
          term: 'navbar',
          meaning:
            'Singkatan *navigation bar*, terjemahannya **bilah navigasi**. Komponen yang muncul di hampir setiap aplikasi, dan justru karena itu ia menjadi tempat paling sering cacat aksesibilitas lolos — menu yang tidak bisa ditutup dengan `Esc`, atau halaman aktif yang hanya ditandai warna.',
        },
        {
          term: 'card',
          meaning:
            'Terjemahannya **kartu**. Wadah berisi satu satuan informasi yang berdiri sendiri. Uji kelayakannya sederhana: kalau kartunya dipindah ke tempat lain, apakah isinya masih masuk akal tanpa konteks di sekitarnya?',
        },
        {
          term: 'truncate',
          meaning:
            'Memotong teks yang terlalu panjang menjadi satu baris dengan tanda elipsis. Jebakannya sudah kamu temui di Sub-bab 1.4: di dalam flex container, ia **tidak bekerja** tanpa `min-w-0` pada anaknya.',
        },
        {
          term: 'line-clamp',
          meaning:
            'Memotong teks setelah sejumlah **baris**, bukan satu baris seperti `truncate`. `line-clamp-3` menyisakan tiga baris lalu memberi elipsis — pilihan yang lebih baik untuk ringkasan di dalam kartu.',
        },
        {
          term: 'overlay',
          meaning:
            'Terjemahannya **lapisan penutup** — menu, dialog, atau panel yang muncul di atas halaman. Tiga kewajibannya sering terlupakan: bisa ditutup dengan `Esc`, mengunci fokus di dalamnya selama terbuka, dan **mengembalikan fokus** ke pemicunya setelah ditutup.',
        },
        {
          term: 'aria-expanded',
          meaning:
            'Atribut yang memberi tahu apakah sesuatu yang dikendalikan tombol sedang **terbuka atau tertutup**. Tanpa itu, pengguna pembaca layar menekan tombol menu dan tidak mendapat kabar apa pun tentang apa yang terjadi.',
        },
        {
          term: 'aria-current',
          meaning:
            'Menandai item mana yang **sedang aktif** dalam sebuah navigasi, ditulis `aria-current="page"`. Ini padanan tekstual dari penanda visual yang biasanya cuma berupa warna atau garis bawah.',
        },
        {
          term: 'zoom 200%',
          meaning:
            'Uji yang diwajibkan WCAG: tampilan harus tetap bisa dipakai saat diperbesar dua kali lipat. Ini menangkap masalah yang tidak terlihat pada layar biasa — teks yang terpotong, tombol yang saling menumpuk, dan tata letak yang meluber ke samping.',
        },
        {
          term: 'baseline',
          meaning:
            'Terjemahannya **batas minimum**. Kumpulan syarat yang tidak bisa ditawar apa pun keputusan desainnya: kontras cukup, fokus terlihat, bisa dipakai keyboard, menghormati pengurangan gerak. Aturan project ini menyatakannya tegas — **aksesibilitas mengalahkan estetika**.',
        },
      ),

      h2('1. Kunci tokennya dulu'),
      code(
        'css',
        `
        @import 'tailwindcss';
        @custom-variant dark (&:where(.dark, .dark *));

        :root {
          --bg: #faf7f1;
          --surface: #ffffff;
          --raised: #f4efe6;
          --border: #e5ddcf;
          --text: #191713;
          --muted: #6b6357;
          --primary: #8f5314;      /* 5.7:1 di atas --bg — lolos AA */
        }

        .dark {
          --bg: #0e0d0b;
          --surface: #1a1814;
          --raised: #221f1a;
          --border: #2e2a24;
          --text: #ede6da;
          --muted: #a39a8b;
          --primary: #e5a13c;      /* 8.8:1 di atas --bg */
        }

        @theme inline {
          --color-bg: var(--bg);
          --color-surface: var(--surface);
          --color-raised: var(--raised);
          --color-border: var(--border);
          --color-text: var(--text);
          --color-muted: var(--muted);
          --color-primary: var(--primary);
        }
        `,
        { filename: 'globals.css' },
      ),
      p(
        'Perhatikan **tidak satu pun token dinamai menurut warnanya**, sebab tidak ada `--krem` atau `--coklat`. Semuanya dinamai menurut peran, yaitu `bg` untuk latar halaman, `surface` untuk permukaan kartu, dan `raised` untuk permukaan yang lebih tinggi. Itulah yang membuat blok `.dark` di bawahnya bisa membalik seluruh nilainya tanpa satu nama pun jadi berbohong. Perhatikan juga urutan kecerahannya **terbalik** di tema gelap. Di tema terang `surface` lebih terang dari `bg`, sedangkan di tema gelap ia justru lebih terang dari latar yang hampir hitam. Itu penerapan konsep *elevation* dari kotak istilah, karena bayangan hampir tidak terlihat di tema gelap sehingga kedalaman ditunjukkan lewat latar yang lebih terang. Komentar angka kontras di `--primary` juga kebiasaan yang layak ditiru, yaitu mencatat hasil pengukuran di sebelah nilainya supaya tidak ada yang mengubahnya tanpa mengukur ulang.',
      ),
      callout(
        'warning',
        'Hitung kontras SEBELUM melanjutkan',
        'Kalau kamu memilih warna sendiri, ukur dulu pasangan teks-dan-latar. Menemukan bahwa paletmu gagal setelah dua puluh komponen dibangun berarti menyentuh dua puluh komponen lagi.',
      ),

      h2('2. Navbar'),
      code(
        'jsx',
        `
        export function Navbar({ menu, aktif }) {
          const [terbuka, setTerbuka] = useState(false);

          return (
            <header className="border-border bg-bg/85 sticky top-0 z-30 border-b backdrop-blur-sm">
              <nav aria-label="Menu utama" className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
                <a href="/" className="text-text font-medium">Beranda</a>

                {/* Desktop */}
                <ul className="ml-4 hidden items-center gap-1 md:flex">
                  {menu.map((m) => (
                    <li key={m.href}>
                      <a
                        href={m.href}
                        aria-current={m.href === aktif ? 'page' : undefined}
                        className={cn(
                          'rounded-md px-3 py-2 text-sm transition-colors duration-150',
                          m.href === aktif
                            ? 'bg-raised text-text font-medium'
                            : 'text-muted hover:text-text',
                        )}
                      >
                        {m.label}
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Pemicu drawer — hanya layar kecil */}
                <button
                  type="button"
                  onClick={() => setTerbuka(true)}
                  aria-expanded={terbuka}
                  aria-controls="menu-mobile"
                  className="text-muted hover:bg-raised ml-auto inline-flex h-11 w-11 items-center justify-center rounded-md md:hidden"
                >
                  <MenuIcon aria-hidden="true" />
                  <span className="sr-only">Buka menu</span>
                </button>
              </nav>
            </header>
          );
        }
        `,
      ),
      ul(
        '`h-11 w-11` — target sentuh 44px.',
        '`sr-only` — tombol berikon tetap punya nama.',
        '`aria-current="page"` — halaman aktif diketahui teknologi bantu, bukan hanya terlihat.',
        '`aria-expanded` + `aria-controls` — hubungan tombol dan drawer terbaca.',
        '`transition-colors`, bukan `transition-all`.',
      ),

      h2('3. Drawer dengan `Esc` dan pengembalian fokus'),
      code(
        'jsx',
        `
        const pemicuRef = useRef(null);

        useEffect(() => {
          if (!terbuka) return;

          function onKey(e) {
            if (e.key === 'Escape') {
              setTerbuka(false);
              pemicuRef.current?.focus();      // kembalikan fokus — WAJIB
            }
          }

          document.addEventListener('keydown', onKey);
          document.body.style.overflow = 'hidden';

          return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
          };
        }, [terbuka]);
        `,
      ),
      p(
        "Effect ini menangani **tiga kewajiban overlay sekaligus**, dan tiap bagiannya punya pasangan pembersihnya. Baris `if (!terbuka) return` di awal membuat seluruh isinya hanya berjalan saat drawer terbuka, sekaligus menjadi alasan `terbuka` masuk ke array dependensi. Listener `keydown` menangkap `Escape` di tingkat `document` dan bukan pada drawernya, supaya ia bekerja di mana pun fokus berada. `document.body.style.overflow = 'hidden'` mengunci gulir halaman di belakangnya, lalu blok `return` mengembalikan keduanya dengan melepas listener dan memulihkan gulir. Yang paling mudah terlupa adalah `pemicuRef.current?.focus()`, sebab tanpa itu menutup drawer membuat fokus terlempar ke awal dokumen, dan pengguna keyboard harus menekan Tab dari nol untuk kembali ke tempatnya.",
      ),
      callout(
        'danger',
        'Tanpa pengembalian fokus, pengguna keyboard tersesat',
        'Saat drawer ditutup, fokus harus kembali ke tombol yang membukanya. Tanpa itu, fokus terlempar ke awal dokumen dan pengguna harus menekan Tab dari nol. Ini kesalahan overlay yang paling sering.',
      ),

      h2('4. Card'),
      code(
        'jsx',
        `
        export function Kartu({ judul, ringkasan, tag, href }) {
          return (
            <article className="border-border bg-surface hover:border-border-strong group rounded-lg border p-5 transition-colors duration-150">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-text min-w-0 font-medium">
                  <a
                    href={href}
                    className="focus-visible:ring-primary rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <span className="line-clamp-2">{judul}</span>
                  </a>
                </h3>

                {tag && (
                  <span className="bg-raised text-muted shrink-0 rounded-full px-2 py-0.5 text-xs">
                    {tag}
                  </span>
                )}
              </div>

              <p className="text-muted mt-2 line-clamp-3 text-sm">{ringkasan}</p>
            </article>
          );
        }
        `,
      ),
      ul(
        '`min-w-0` pada judul — tanpa ini `line-clamp` tidak bekerja di dalam flex.',
        '`shrink-0` pada tag — supaya tidak ikut menyusut.',
        '`line-clamp-2` / `line-clamp-3` — judul dan ringkasan panjang tidak merusak tinggi kartu.',
        '`focus-visible:ring` diberikan ke `<a>`, bukan ke `<article>` — yang bisa difokus adalah tautannya.',
      ),

      h2('5. Grid kartu'),
      code(
        'jsx',
        `
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <Kartu key={i.id} {...i} />
          ))}
        </div>
        `,
      ),
      p(
        'Baris ini menutup praktik dengan menerapkan mobile-first dari sub-bab responsif, yaitu **satu kolom sebagai dasar**. Tidak ada `grid-cols-1` yang ditulis karena grid memang satu kolom kalau tidak disebut, lalu `sm:grid-cols-2` dan `lg:grid-cols-3` menambah kolom saat ruangnya tersedia. `mx-auto max-w-6xl` menjaga isinya tetap terbaca di layar lebar dengan membatasi lebar lalu memusatkannya, dan `px-4` memberi napas di tepi layar sempit. Perhatikan `gap-4` mengurus jarak antar-kartu sepenuhnya, sebab tidak ada `margin` di komponen `Kartu` itu sendiri, sehingga kartunya bisa dipakai di tata letak lain tanpa membawa jarak yang tidak diminta. Adapun `key={i.id}` memakai identitas dari data dan bukan indeks, sesuai aturan yang sudah dibahas di Bab 2.',
      ),

      checklist(
        'frontend-intermediate/tailwind-css/praktik',
        'Checklist praktik 1.12',
        'Tidak ada satu pun warna bawaan Tailwind (`gray-*`, `indigo-*`) — semua dari token',
        'Kontras teks terkecil diukur dan ≥4.5:1, di kedua mode',
        'Tab dari atas ke bawah: posisi fokus selalu terlihat',
        'Urutan Tab mengikuti urutan visual',
        'Tombol berikon punya `sr-only` atau `aria-label`',
        '`aria-current="page"` pada menu aktif',
        'Drawer: `Esc` menutup, dan fokus kembali ke tombol pemicu',
        'Target sentuh minimal 44×44px',
        'Zoom 200% masih terbaca tanpa scroll horizontal',
        'Reduced motion dinyalakan — antarmuka tetap berfungsi',
        'Judul dan ringkasan sangat panjang tidak merusak layout (`line-clamp` + `min-w-0`)',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Navbar dan card yang baru saja dibangun akan bertemu satu hal yang tidak ada di halaman latihan, yaitu **data sungguhan**. Data latihan selalu rapi, judulnya pendek, dan jumlahnya tepat tiga. Data sungguhan punya judul sepanjang dua baris, nama berkas tanpa spasi, kategori kosong, dan kadang berjumlah satu.',
      ),
      p(
        'Empat kegagalan berikut adalah yang paling sering muncul ketika komponen seperti ini dipasang ke halaman nyata, dan semuanya sudah punya jawabannya di sub-bab sebelumnya.',
      ),
      table(
        ['Yang terjadi dengan data sungguhan', 'Penyebabnya', 'Perbaikannya'],
        [
          [
            'Tombol di kanan card terdorong keluar',
            'Flex item berisi teks panjang punya `min-width: auto`',
            '`min-w-0` pada flex item-nya, `truncate` pada teksnya',
          ],
          [
            'Grid kartu jadi tiga kolom sempit di dalam sidebar',
            'Breakpoint mengukur jendela, bukan wadah',
            '`@container` pada wadah, `@md:` pada gridnya',
          ],
          [
            'Baris kedua kartu menempel ke baris pertama',
            '`space-x-*` hanya mengatur jarak horizontal',
            'Ganti dengan `gap`',
          ],
          [
            'Satu kartu sendirian melebar penuh dan terlihat aneh',
            '`1fr` membagi seluruh ruang yang ada',
            '`minmax(16rem, 24rem)` memberi batas atas',
          ],
        ],
      ),
      p(
        'Baris kedua yang paling sering luput, sebab gejalanya baru muncul setelah komponennya dipakai ulang di tempat lain. Berikut pengukurannya pada kartu yang lebarnya persis sama di dua ukuran jendela berbeda.',
      ),
      code(
        'text',
        `
        <div class="w-72">                                  <-- 288px, sama di kedua uji
          <div class="grid grid-cols-1 sm:grid-cols-3">...</div>
        </div>

        Diukur di Chrome 151:

          jendela 1400px   lebar wadah 286px   ->  95,33px  95,33px  95,34px
          jendela  500px   lebar wadah 286px   ->  286px

        Wadahnya identik, hasilnya berbeda. Yang berubah cuma jendelanya.
        `,
        { caption: 'Dijalankan sungguhan dan diukur di Chrome 151.' },
      ),
      code(
        'tsx',
        `
        // Grid kartu yang benar di mana pun ia diletakkan.
        function GridKartu({ daftar }: { daftar: Catatan[] }) {
          return (
            <div className="@container">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,24rem))] gap-4">
                {daftar.map((c) => (
                  <Kartu key={c.id} catatan={c} />
                ))}
              </div>
            </div>
          );
        }

        // auto-fit  : jumlah kolomnya dihitung dari ruang yang benar-benar ada
        // minmax    : batas bawah menjaga kartu tidak terlalu sempit,
        //             batas atas menjaga satu kartu sendirian tidak melebar penuh
        // gap       : jarak dua arah, jadi baris yang membungkus tetap berjarak
        //
        // Tidak ada satu pun breakpoint di sini, dan justru itu yang membuatnya
        // benar baik di halaman utama maupun di sidebar selebar 288px.
        `,
        { caption: 'Satu baris grid-cols menggantikan tiga breakpoint, dan lebih benar.' },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Drawer sudah punya `Esc` dan pengembalian fokus di langkah tiga, dan itu menutup dua dari tiga kewajiban overlay. Yang ketiga tidak pernah menghasilkan pesan apa pun dan hampir selalu terlewat, yaitu **isi drawer yang tertutup masih bisa dicapai dengan Tab**.',
      ),
      p(
        'Masalahnya muncul justru karena keinginan yang baik. Supaya drawer bisa bergeser masuk dan keluar dengan mulus, ia tidak dihapus dari halaman melainkan digeser keluar layar dengan `translate-x-full` lalu diredupkan dengan `opacity-0`. Keduanya properti visual, dan tidak satu pun dari keduanya menghapus elemen dari urutan Tab.',
      ),
      code(
        'text',
        `
        <button id="pemicu">Buka menu</button>

        <!-- Drawer TERTUTUP, disembunyikan dengan translate + opacity -->
        <div class="pointer-events-none fixed inset-y-0 right-0 w-80 translate-x-full opacity-0">
          <a id="t1">Beranda</a>
          <a id="t2">Materi</a>
          <button id="t3">Tutup</button>
        </div>

        <a id="akhir">Tautan terakhir halaman</a>

        Menekan Tab berulang kali di Chrome 151:

          Tab ke-1  ->  #pemicu
          Tab ke-2  ->  #t1        <-- di dalam drawer yang TERTUTUP
          Tab ke-3  ->  #t2        <-- fokusnya tidak terlihat di mana pun
          Tab ke-4  ->  #t3
          Tab ke-5  ->  #akhir

        Keadaan #t1 saat itu:
          kotaknya = 63x22 piksel pada x = 1024   (di luar layar)
          opacity induknya = 0
        `,
        { caption: 'Dijalankan sungguhan lewat Input.dispatchKeyEvent di Chrome 151.' },
      ),
      p(
        'Bagi pengguna papan ketik, tiga tekanan Tab itu adalah tiga kali fokus menghilang entah ke mana. Tidak ada yang menyorot, tidak ada yang bergulir, dan halamannya tampak berhenti merespons. `pointer-events-none` tidak menolong sama sekali, sebab ia hanya mengurusi mouse.',
      ),
      p(
        'Ada dua perbaikan yang sama-sama terukur, dan pilihannya bergantung pada apakah kamu butuh animasi masuk-keluar.',
      ),
      code(
        'text',
        `
        Perbaikan 1 — jangan render isinya saat tertutup

          {terbuka && <IsiDrawer />}

          atau dengan class hidden, yang bernilai display: none.
          Diukur pada halaman yang sama, tautan di dalamnya
          TIDAK PERNAH muncul di urutan Tab sama sekali.

          Kekurangannya, tidak ada elemen yang bisa dianimasikan keluar.

        Perbaikan 2 — pertahankan elemennya, tambahkan atribut inert

          <div inert class="... translate-x-full opacity-0">

          Diukur di Chrome 151 pada halaman yang sama persis:

            Tab ke-1  ->  #pemicu
            Tab ke-2  ->  #akhir     <-- drawer dilewati seluruhnya

          Animasinya tetap bisa berjalan, sebab elemennya masih ada.
        `,
        { caption: 'Kedua perbaikan dijalankan sungguhan dan diukur di Chrome 151.' },
      ),
      p(
        'Atribut `inert` mengeluarkan sebuah cabang dari urutan Tab sekaligus dari pohon aksesibilitas, jadi pembaca layar juga berhenti membacakannya. Ia satu atribut tanpa nilai, didukung seluruh peramban arus utama, dan menyelesaikan persoalan yang sebelumnya butuh menambah `tabindex="-1"` ke setiap elemen di dalamnya satu per satu.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Praktik menggabungkan seluruh materi bab ini, jadi kesalahan yang muncul di sini biasanya adalah kesalahan yang sudah dibahas terpisah dan baru bertemu sekarang.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menguji dengan judul pendek buatan sendiri',
            'Datanya untuk contoh saja',
            'Judul panjang, nama tanpa spasi, dan kolom kosong adalah yang merusak susunan. Uji dengan yang terburuk',
          ],
          [
            'Menyusun grid kartu dengan tumpukan breakpoint',
            'Itu cara yang paling sering dicontohkan',
            'Diukur, komponennya jadi salah di sidebar sempit pada layar lebar. `auto-fit` atau `@container` yang benar',
          ],
          [
            'Menyembunyikan drawer dengan `opacity-0`',
            'Transisinya jadi mulus',
            'Diukur, tiga tekanan Tab mendarat di dalam drawer yang tertutup. Tambahkan `inert`, atau jangan render isinya',
          ],
          [
            'Lupa mengembalikan fokus setelah drawer ditutup',
            'Drawer-nya sudah hilang',
            'Tab berikutnya melompat ke awal halaman. Pengguna papan ketik kehilangan tempatnya',
          ],
          [
            'Menulis warna langsung, bukan token',
            'Cuma satu komponen ini',
            'Satu pengecualian membuka pintu untuk yang berikutnya, dan tema jadi mustahil diganti belakangan',
          ],
          [
            'Menyatakan selesai setelah terlihat benar',
            'Semua sudah sesuai rancangan',
            'Terlihat benar diuji dengan mouse, di layar sendiri, dengan data sendiri. Tiga-tiganya bukan keadaan pengguna',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas jadi penutup bab ini. Sebuah komponen dinyatakan selesai bukan ketika ia terlihat sesuai rancangan, melainkan ketika ia sudah diuji pada keadaan yang tidak nyaman, yaitu data terburuk, hanya papan ketik, layar sempit, dan tema gelap. Empat pengujian itu tidak butuh alat apa pun dan memakan waktu beberapa menit.',
      ),
      callout(
        'tip',
        'Urutan memeriksa yang paling cepat menemukan masalah',
        'Pertama, ganti seluruh teks contoh dengan teks yang jauh lebih panjang dan lihat apa yang terdorong keluar. Kedua, letakkan mouse jauh lalu jelajahi dengan Tab saja. Ketiga, kecilkan jendela sampai 360px. Keempat, nyalakan tema gelapnya. Urutan ini menemukan sebagian besar masalah sebelum satu pun alat otomatis dijalankan, dan tiga di antaranya sudah menjadi pengukuran nyata di sub-bab sebelumnya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Kunci token dan ukur kontras **sebelum** membangun komponen.',
        '`min-w-0` adalah syarat agar `truncate` dan `line-clamp` bekerja di dalam flex.',
        'Overlay wajib menangani `Esc` dan mengembalikan fokus.',
        '`aria-current`, `aria-expanded`, dan `sr-only` adalah tiga hal kecil dengan dampak besar.',
        'Uji dengan Tab, zoom 200%, dan reduced motion sebelum menganggapnya selesai.',
      ),
      references(
        {
          label: 'Theme variables',
          href: 'https://tailwindcss.com/docs/theme',
          source: 'Tailwind CSS',
          note: 'Langkah pertama praktik ini — mengunci token sebelum satu komponen pun dibangun.',
        },
        {
          label: 'Line clamp',
          href: 'https://tailwindcss.com/docs/line-clamp',
          source: 'Tailwind CSS',
          note: 'Memotong teks setelah sejumlah baris, pilihan yang lebih tepat daripada `truncate` di kartu.',
        },
        {
          label: 'aria-expanded',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded',
          source: 'MDN',
          note: 'Wajib pada tombol yang membuka menu, agar keadaannya terumumkan.',
        },
        {
          label: 'Reflow — WCAG 1.4.10',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/reflow.html',
          source: 'W3C WCAG',
          note: 'Dasar uji zoom 200% yang menutup checklist praktik ini.',
        },
        {
          label: 'Keyboard-navigable JavaScript widgets',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets',
          source: 'MDN',
          note: 'Kewajiban `Esc`, kunci fokus, dan pengembalian fokus pada overlay.',
        },
      ),
    ],
  ),
];
