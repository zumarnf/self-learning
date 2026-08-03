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
    10,
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
    9,
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
    11,
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
            'Deretan nilai jarak yang sudah ditetapkan, semuanya **kelipatan 4px**. Angka pada nama class adalah pengalinya: `p-4` berarti 4 × 4px = 16px. Menghafal satu titik acuan sudah cukup — `p-4` = 16px — sisanya bisa dihitung dari situ.',
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
    13,
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

      h2('Grid responsif tanpa breakpoint'),
      code(
        'html',
        `
        <div class="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
        `,
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
    11,
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
            'Terjemahannya **area pandang** — bagian halaman yang benar-benar terlihat di layar. Berbeda dari ukuran layar fisik, karena bar alamat browser dan papan ketik di ponsel ikut memakan ruangnya.',
        },
        {
          term: 'progressive enhancement',
          meaning:
            'Terjemahannya **peningkatan bertahap**. Alasan filosofis di balik mobile-first: mulai dari tampilan paling sederhana yang pasti bekerja, lalu **tambahkan** kemampuan saat ruangnya tersedia. Kebalikannya — merancang untuk desktop lalu mengecilkannya — hampir selalu menghasilkan kompromi yang buruk di ponsel.',
        },
        {
          term: 'touch target',
          meaning:
            'Terjemahannya **sasaran sentuh**. Area yang bisa ditekan jari, minimal sekitar 44×44 piksel. Ini yang paling sering terlupakan saat menguji hanya dengan tetikus: tombol yang mudah diklik kursor bisa hampir mustahil ditekan dengan ibu jari.',
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
    12,
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
            'Varian yang hanya aktif saat elemen difokuskan **lewat keyboard**, bukan saat diklik tetikus. Ini pembedaan yang penting: `focus:` biasa memunculkan cincin fokus setiap kali tombol diklik, yang terlihat mengganggu — sehingga banyak orang menghapusnya, dan **itulah yang merusak aksesibilitas keyboard**. `focus-visible:` menyelesaikan keduanya.',
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

      h2('Menyusun beberapa variant'),
      code(
        'html',
        `
        <button class="md:hover:bg-raised dark:hover:bg-surface md:dark:focus-visible:ring-2">
        <!-- dibaca kanan ke kiri: ring 2 saat focus-visible, di dark mode, di ≥768px -->
        `,
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
    10,
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
            'Singkatan *Flash of Unstyled Content*, terjemahannya **kedipan konten tanpa gaya**. Pada dark mode, gejalanya khas: halaman berkedip putih sepersekian detik sebelum berubah gelap. Penyebabnya karena tema baru diterapkan setelah JavaScript berjalan.',
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

      h2('Menghindari kedipan tema'),
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

      divider,
      h2('Rangkuman'),
      ul(
        'Token semantik mengalahkan `dark:` yang ditulis di setiap komponen.',
        'Skrip inline pra-paint adalah satu-satunya cara menghindari kedipan tema.',
        'Jangan hitam murni; turunkan saturasi; periksa ulang kontras di kedua mode.',
        'Bayangan tidak bekerja di latar gelap — pakai perbedaan warna permukaan.',
        '`color-scheme` membuat elemen bawaan browser ikut menyesuaikan.',
      ),
      references(
        {
          label: 'Dark mode',
          href: 'https://tailwindcss.com/docs/dark-mode',
          source: 'Tailwind CSS',
          note: 'Kedua strategi — mengikuti sistem dan berbasis class — beserta cara menyetelnya di v4.',
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
    13,
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
            'Menulis token dengan nama yang sama seperti bawaan Tailwind akan **menggantikannya**. Untuk membuang seluruh palet bawaan sekaligus — supaya tidak ada yang tidak sengaja memakai `blue-500` — pakai `--color-*: initial` lalu daftarkan warnamu sendiri.',
        },
        {
          term: 'satu sumber kebenaran',
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
        'Inilah keuntungan terbesar pendekatan CSS-first v4: satu sumber kebenaran yang dibaca semua lapisan — utility, CSS biasa, JavaScript, dan DevTools.',
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
    12,
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
            'Singkatan *class variance authority*. Pustaka kecil untuk menyusun **varian sebuah komponen** secara terstruktur — ukuran, warna, keadaan — beserta kombinasinya. Menggantikan rantai ternary panjang yang cepat menjadi tidak terbaca.',
        },
        {
          term: 'tailwind-merge',
          meaning:
            'Pustaka yang menyelesaikan **class yang saling bertabrakan**. Menulis `p-4 p-8` menghasilkan hasil yang bergantung pada urutan di berkas CSS, bukan urutan di atributmu — dan itu sering mengejutkan. `twMerge` memastikan yang terakhir yang menang, sehingga prop `className` dari luar bisa benar-benar menimpa bawaan komponen.',
        },
        {
          term: 'cn',
          meaning:
            'Nama fungsi pembantu yang lazim, gabungan `clsx` dan `twMerge`. Tugasnya dua: menggabungkan class bersyarat, lalu membereskan yang bertabrakan. Project ini punya fungsi itu di `src/lib/utils/cn.ts`.',
        },
        {
          term: 'clsx',
          meaning:
            'Pustaka kecil untuk **menyusun nama class secara bersyarat**: `clsx("dasar", aktif && "bg-primary")`. Ia hanya menggabungkan dan membuang nilai kosong — ia **tidak** menyelesaikan tabrakan, dan itulah kenapa ia biasa dipasangkan dengan `twMerge`.',
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
      callout(
        'info',
        'Project ini sengaja TIDAK memakai `tailwind-merge`',
        'Komponen di sini menyusun class dari token dan tidak pernah menimpa utility milik pemanggil, jadi resolusi konflik menyelesaikan masalah yang tidak ada. `cn()` di project ini hanya menggabungkan string. Tambahkan `twMerge` saat kamu benar-benar membangun pustaka komponen yang pemakainya perlu menimpa gaya.',
      ),

      h2('Urutan memilih'),
      ol(
        '**Komponen React** — jawaban untuk hampir semua pengulangan.',
        '**`cva`** — saat satu komponen punya beberapa varian.',
        '**`cn()`** — saat class perlu digabung secara kondisional.',
        '**`tailwind-merge`** — hanya kalau pemanggil memang perlu menimpa.',
        '**`@apply`** — hanya untuk HTML yang bukan milikmu.',
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
    11,
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
            'Varian Tailwind yang aktif ketika pengguna meminta pengurangan gerak. Yang perlu dipahami: **mematikan animasi sepenuhnya tidak selalu jawaban terbaik** — mengganti gerakan besar dengan pudar singkat sering lebih baik, karena umpan baliknya tetap ada tanpa perpindahan yang memicu keluhan.',
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
          ['Umpan balik tekan', '100–160ms'],
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
      callout(
        'warning',
        'Keyframe tidak bisa diinterupsi',
        'Transisi CSS bisa dibelokkan di tengah jalan; keyframe selalu mulai dari nol. Untuk elemen yang bisa dipicu berulang cepat — toast, toggle — pakai transisi.',
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
      callout(
        'info',
        'Reduced motion bukan "tanpa animasi"',
        'Yang menyebabkan ketidaknyamanan adalah **perpindahan posisi**, bukan perubahan warna. Mematikan semua transisi membuat antarmuka terasa rusak. Hapus geraknya, pertahankan umpan baliknya. Project ini melakukannya persis begitu setelah temuan audit.',
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

      divider,
      h2('Rangkuman'),
      ul(
        'Jangan `transition-all`; sebutkan propertinya.',
        'Animasikan `transform` dan `opacity` saja.',
        'Di bawah 300ms untuk UI; jangan `ease-in` untuk yang muncul.',
        'Keyframe tidak bisa diinterupsi — pakai transisi untuk pemicu berulang.',
        'Reduced motion = hapus gerak, pertahankan umpan balik warna.',
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
    12,
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
    15,
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
