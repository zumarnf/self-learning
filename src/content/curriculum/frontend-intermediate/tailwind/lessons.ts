import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  ol,
  p,
  table,
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
    ],
  ),

  written(
    'instalasi-v4',
    'Instalasi Tailwind v4 (CSS-first)',
    9,
    'Setup versi 4 yang berbeda jauh dari v3 — dan kenapa perubahannya masuk akal.',
    [
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
    ],
  ),

  written(
    'spacing-warna-tipografi',
    'Sistem Spacing, Warna & Tipografi',
    11,
    'Skala bawaan, cara membacanya, dan kenapa memakai skala mengalahkan angka bebas.',
    [
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
    ],
  ),

  written(
    'flexbox-grid',
    'Layout dengan Flexbox & Grid',
    13,
    'Dua sistem layout, kapan memilih yang mana, dan pola yang paling sering dipakai.',
    [
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
    ],
  ),

  written(
    'responsif',
    'Responsif: breakpoint & mobile-first',
    11,
    'Menulis dari layar kecil ke besar — dan kenapa arah itu penting.',
    [
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
    ],
  ),

  written(
    'variant-status',
    'Variant Status: hover, focus, group, peer',
    12,
    'Menangani state tanpa menulis satu baris JavaScript.',
    [
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
        <p class="hidden text-danger peer-invalid:peer-[:not(:placeholder-shown)]:block">
          Format email tidak valid
        </p>
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
        <div class="has-[:checked]:bg-accent-fill">   <!-- kalau punya anak tercentang -->
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
        '`has-[]` memungkinkan induk bereaksi pada anaknya.',
        'Variant bisa disusun; dibaca dari kanan ke kiri.',
      ),
    ],
  ),

  written(
    'dark-mode',
    'Dark Mode',
    10,
    'Dua tema tanpa menggandakan style — dan kenapa dark mode bukan sekadar membalik warna.',
    [
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
    ],
  ),

  written(
    'design-token-theme',
    'Design Token dengan `@theme`',
    13,
    'Fitur inti Tailwind v4 — dan cara project ini mengunci paletnya.',
    [
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
    ],
  ),

  written(
    'menyusun-komponen',
    'Menyusun Komponen: `@apply`, `cva`, `tailwind-merge`',
    12,
    'Menghindari class yang berulang di dua puluh tempat — tanpa kembali ke CSS bernama.',
    [
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
    ],
  ),

  written(
    'transisi-animasi',
    'Transisi & Animasi + reduced motion',
    11,
    'Gerak yang membantu, bukan yang memamerkan.',
    [
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
    ],
  ),
];
