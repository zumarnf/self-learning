import { larangStruktur, mesinStruktur, soal, wajibStruktur } from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * UI and layout, graded structurally.
 *
 * Three of these are written in Tailwind utility classes because that is what this curriculum
 * teaches and what this project itself uses; the fourth is raw CSS, because Tailwind v4 keeps its
 * configuration in CSS and `@theme` is genuinely a CSS skill.
 *
 * Each one carries a trap that a screenshot would hide: centering that does nothing without a
 * height, a grid that only looks responsive, a focus ring removed without a replacement, and a
 * token whose name produces no utility at all.
 */

export const exercises: Exercise[] = [
  soal({
    slug: 'kotak-di-tengah',
    title: 'Letakkan kotak tepat di tengah layar',
    topic: 'layout',
    level: 'basic',
    realWorldUse:
      'Halaman login, tampilan saat data kosong, dan layar loading satu halaman penuh. Ini salah satu layout yang paling sering ditulis dan paling sering setengah jadi, rata tengah horizontal tapi tidak vertikal.',
    source: { category: 'frontend-intermediate', chapter: 'tailwind-css' },
    codeLang: 'jsx',
    brief: {
      situation:
        'Kamu membuat halaman login. Kotak form login harus berada tepat di tengah layar, baik dari kiri ke kanan maupun dari atas ke bawah, di laptop maupun di ponsel. Kamu sudah menulis kotaknya, tinggal mengatur `div` pembungkusnya supaya kotak itu berada di tengah.',
      tasks: [
        'Isi atribut `className` pada `<div>` terluar di editor.',
        'Buat kotak di dalamnya berada di tengah secara horizontal DAN vertikal.',
        'Beri `div` terluar tinggi setinggi layar, memakai satuan yang aman di ponsel.',
      ],
      pitfalls: [
        'Perataan vertikal tidak melakukan apa pun kalau container-nya tidak punya tinggi. `div` yang tingginya sama dengan isinya sudah "rata tengah vertikal" tanpa kamu menulis apa pun. Itulah kenapa hasilnya sering terlihat tidak berubah.',
        '`text-center` merata-tengahkan TEKS di dalam kotak, bukan kotaknya terhadap layar. Keduanya hal yang berbeda.',
        'Tinggi `100vh` bukan tinggi layar yang sebenarnya di ponsel, karena address bar browser muncul dan hilang. Satuan `dvh` mengikuti perubahan itu, sehingga pakai `min-h-dvh`.',
      ],
      terms: [
        {
          term: 'flexbox',
          meaning:
            'Sistem layout CSS untuk menyusun elemen dalam satu baris atau satu kolom. Class `flex` mengubah sebuah elemen menjadi flex container. Di dalamnya, `justify-center` mengatur perataan pada sumbu utama dan `items-center` mengatur perataan pada sumbu yang tegak lurus.',
        },
        {
          term: 'container',
          meaning:
            'Sebutan untuk elemen pembungkus yang mengatur layout elemen di dalamnya. Pada `<div class="flex"><p>Hai</p></div>`, `div` itu adalah flex container dan `p` adalah isinya. Aturan perataan ditulis di container, bukan di elemen yang ingin dipindahkan.',
        },
        {
          term: 'dvh (dynamic viewport height)',
          meaning:
            'Satuan tinggi yang mengikuti tinggi layar yang benar-benar terlihat, termasuk saat address bar ponsel muncul atau hilang. `100dvh` sama dengan setinggi layar. Di Tailwind, `min-h-dvh` berarti tingginya minimal setinggi layar.',
        },
      ],
    },
    rules: [
      'Memakai flexbox atau grid untuk merata-tengahkan.',
      'Rata tengah pada kedua sumbu.',
      'Container-nya punya tinggi setinggi layar.',
    ],
    starter: `
      <div className="">
        <div className="rounded-lg border p-6">Masuk ke akunmu</div>
      </div>
    `,
    hints: [
      'Perataan butuh konteks layout dulu. Elemennya harus dijadikan `flex` atau `grid`.',
      'Di flexbox, dua arah berarti dua class yang berbeda. Di grid, satu class sudah cukup.',
      'Untuk tingginya, pakai `min-h-dvh`, bukan `min-h-screen` yang sama dengan `100vh`.',
    ],
    solution: {
      code: `
        <div className="flex min-h-dvh items-center justify-center">
          {/* flex membuat perataan berlaku, items-center dan justify-center untuk dua arah,
              dan min-h-dvh memberi ruang setinggi layar untuk dirata-tengahkan */}
          <div className="rounded-lg border p-6">Masuk ke akunmu</div>
        </div>
      `,
      steps: [
        '`flex` mengubah `div` terluar menjadi flex container, sehingga class perataan mulai berlaku.',
        '`justify-center` merata-tengahkan kotak pada arah horizontal.',
        '`items-center` merata-tengahkan kotak pada arah vertikal.',
        '`min-h-dvh` membuat container setinggi layar, sehingga ada ruang kosong di atas dan di bawah untuk dirata-tengahkan.',
      ],
      explanation:
        'Tiga class ini tidak bisa dihapus satu pun. `flex` membuat perataan berlaku, `items-center` dan `justify-center` menangani dua arah yang berbeda, dan `min-h-dvh` memberi ruang untuk dirata-tengahkan. Tanpa yang terakhir, kotaknya sudah "di tengah" container yang setinggi dirinya sendiri, jadi tidak berpindah ke mana-mana.',
    },
    alternativeSolutions: [
      `
        <div className="grid min-h-dvh place-items-center">
          <div className="rounded-lg border p-6">Masuk ke akunmu</div>
        </div>
      `,
      `
        <div className="flex min-h-dvh justify-center items-center bg-slate-50">
          <div className="rounded-lg border p-6">Masuk ke akunmu</div>
        </div>
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          <div className="flex items-center justify-center">
            <div className="rounded-lg border p-6">Masuk ke akunmu</div>
          </div>
        `,
        reason:
          'Tanpa tinggi, container-nya setinggi isinya, sehingga perataan vertikalnya tidak memindahkan apa pun.',
      },
      {
        code: `
          <div className="flex min-h-dvh justify-center">
            <div className="rounded-lg border p-6">Masuk ke akunmu</div>
          </div>
        `,
        reason: 'Hanya rata tengah secara horizontal, sedangkan arah vertikalnya terlewat.',
      },
      {
        code: `
          <div className="min-h-dvh text-center">
            <div className="rounded-lg border p-6">Masuk ke akunmu</div>
          </div>
        `,
        reason:
          '`text-center` merata-tengahkan teks di dalam kotak, bukan kotaknya terhadap layar.',
      },
    ],
    check: mesinStruktur('js', [
      wajibStruktur(
        'konteks-layout',
        'Memakai flexbox atau grid',
        'Perataan butuh konteks layout dulu. Tanpa `flex` atau `grid`, class `items-center` dan `justify-center` tidak berlaku sama sekali.',
        '[\\s"\']((flex)|(grid))[\\s"\']',
      ),
      wajibStruktur(
        'dua-sumbu',
        'Rata tengah pada kedua arah',
        'Baru satu arah yang tertangani. Di flexbox butuh `items-center` DAN `justify-center`. Di grid, `place-items-center` menangani keduanya sekaligus.',
        'place-items-center|(items-center[\\s\\S]{0,80}justify-center)|(justify-center[\\s\\S]{0,80}items-center)',
      ),
      wajibStruktur(
        'punya-tinggi',
        'Container-nya punya tinggi setinggi layar',
        'Belum ada tinggi. `div` yang setinggi isinya sendiri sudah "rata tengah vertikal" tanpa kamu menulis apa pun, dan itulah kenapa hasilnya terlihat tidak berubah.',
        '(min-)?h-(dvh|screen|full)',
      ),
      larangStruktur(
        'bukan-text-center',
        'Tidak mengandalkan `text-center`',
        '`text-center` merata-tengahkan teks DI DALAM kotak, bukan kotaknya terhadap layar. Keduanya hal yang berbeda.',
        '[\\s"\']text-center[\\s"\']',
      ),
    ]),
  }),

  soal({
    slug: 'grid-kartu-responsif',
    title: 'Grid kartu yang benar-benar responsif',
    topic: 'layout',
    level: 'intermediate',
    realWorldUse:
      'Daftar produk, galeri foto, dan dashboard berisi kartu. Grid dengan jumlah kolom tetap terlihat bagus di laptop pembuatnya, tapi berantakan di ponsel penggunanya.',
    source: { category: 'frontend-intermediate', chapter: 'tailwind-css' },
    codeLang: 'jsx',
    brief: {
      situation:
        'Halaman katalog menampilkan produk dalam bentuk kartu. Di laptop, tiga kartu berjajar dalam satu baris terlihat rapi. Tapi di ponsel yang layarnya sempit, tiga kartu sebaris membuat setiap kartu terlalu kecil untuk dibaca. Jumlah kolomnya harus menyesuaikan lebar layar.',
      tasks: [
        'Isi atribut `className` pada `<div>` pembungkus kartu di editor.',
        'Pakai layout grid dengan jarak antar kartu.',
        'Tampilkan satu kolom di ponsel, dua kolom mulai layar sedang, dan tiga kolom mulai layar besar.',
      ],
      pitfalls: [
        'Tulis dari layar kecil ke layar besar. Class tanpa awalan berlaku di semua ukuran, sedangkan awalan seperti `md:` menambah aturan MULAI ukuran itu ke atas, bukan hanya pada ukuran itu.',
        'Tulis `grid-cols-1` secara eksplisit. Satu kolom memang perilaku bawaannya, tapi menuliskannya adalah cara menyatakan bahwa tampilan ponsel sudah dipikirkan.',
        'Pakai `gap-*` untuk jarak, bukan margin di setiap kartu. Margin ikut menempel di tepi luar grid dan harus dibatalkan lagi dengan margin negatif.',
      ],
      terms: [
        {
          term: 'CSS grid',
          meaning:
            'Sistem layout CSS untuk menyusun elemen dalam baris dan kolom sekaligus. Class `grid` mengaktifkannya, dan `grid-cols-3` membagi lebar menjadi tiga kolom sama besar. Kartu akan mengisi kolom dari kiri ke kanan, lalu turun ke baris berikutnya.',
        },
        {
          term: 'breakpoint',
          meaning:
            'Lebar layar tempat tampilan berubah. Di Tailwind, `md` berarti mulai 768 piksel dan `lg` berarti mulai 1024 piksel. Class `md:grid-cols-2` berarti "mulai lebar 768 piksel, pakai dua kolom". Di bawah lebar itu, aturan tanpa awalan yang berlaku.',
        },
        {
          term: 'mobile-first',
          meaning:
            'Pendekatan menulis tampilan untuk layar kecil dulu, lalu menambah aturan untuk layar yang lebih besar. Tailwind dirancang dengan cara ini. Itulah kenapa class tanpa awalan adalah tampilan ponsel, dan awalan breakpoint dipakai untuk memperbesarnya.',
        },
      ],
    },
    rules: [
      'Memakai `grid` dengan jarak antar kartu.',
      'Satu kolom sebagai dasar, lalu bertambah lewat breakpoint.',
      'Tiga tingkat, yaitu dasar, sedang, dan besar.',
    ],
    starter: `
      <div className="">
        <article className="rounded-lg border p-4">Kartu 1</article>
        <article className="rounded-lg border p-4">Kartu 2</article>
        <article className="rounded-lg border p-4">Kartu 3</article>
      </div>
    `,
    hints: [
      'Jumlah kolom grid diatur dengan class `grid-cols-*`, dan setiap breakpoint bisa menimpanya.',
      'Jarak antar sel grid memakai `gap-*`, bukan margin pada setiap kartu.',
      'Bentuknya `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`.',
    ],
    solution: {
      code: `
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Mulai dari ponsel dengan 1 kolom, lalu bertambah di layar sedang dan besar */}
          <article className="rounded-lg border p-4">Kartu 1</article>
          <article className="rounded-lg border p-4">Kartu 2</article>
          <article className="rounded-lg border p-4">Kartu 3</article>
        </div>
      `,
      steps: [
        '`grid` mengubah `div` pembungkus menjadi grid container.',
        '`grid-cols-1` menetapkan satu kolom sebagai dasar, yang berlaku di semua ukuran layar sampai ada aturan lain.',
        '`md:grid-cols-2` menimpanya menjadi dua kolom mulai lebar layar 768 piksel.',
        '`lg:grid-cols-3` menimpanya lagi menjadi tiga kolom mulai lebar layar 1024 piksel.',
        '`gap-4` memberi jarak yang sama di antara kartu, tanpa menambah jarak di tepi luar grid.',
      ],
      explanation:
        '`gap-4` dipakai, bukan margin di setiap kartu. Margin akan menempel juga di tepi luar grid dan harus dibatalkan lagi dengan margin negatif, yaitu trik yang selalu berakhir menjadi satu baris kode yang tidak ada yang berani menghapusnya. `gap` hanya berlaku di antara sel.',
    },
    alternativeSolutions: [
      `
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-lg border p-4">Kartu 1</article>
          <article className="rounded-lg border p-4">Kartu 2</article>
          <article className="rounded-lg border p-4">Kartu 3</article>
        </div>
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          <div className="grid grid-cols-3 gap-4">
            <article className="rounded-lg border p-4">Kartu 1</article>
          </div>
        `,
        reason:
          'Tiga kolom di semua ukuran layar, sehingga di ponsel setiap kartu terlalu sempit untuk dibaca.',
      },
      {
        code: `
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-lg border p-4">Kartu 1</article>
          </div>
        `,
        reason: 'Tanpa `gap`, kartu-kartunya menempel satu sama lain tanpa jarak.',
      },
      {
        code: `
          <div className="flex gap-4">
            <article className="rounded-lg border p-4">Kartu 1</article>
          </div>
        `,
        reason:
          'Flexbox satu baris tanpa pembungkus tidak pernah turun ke baris kedua di layar yang sempit.',
      },
    ],
    check: mesinStruktur('js', [
      wajibStruktur(
        'pakai-grid',
        'Memakai `grid`',
        'Belum ada class `grid` pada pembungkusnya.',
        '[\\s"\']grid[\\s"\']',
      ),
      wajibStruktur(
        'kolom-dasar',
        'Satu kolom sebagai dasar',
        'Belum ada `grid-cols-1` tanpa awalan breakpoint. Satu kolom memang perilaku bawaannya, tapi menuliskannya menyatakan bahwa tampilan ponsel sudah dipikirkan.',
        '[\\s"\']grid-cols-1[\\s"\']',
      ),
      wajibStruktur(
        'naik-di-breakpoint',
        'Kolom bertambah di layar sedang dan besar',
        'Butuh dua tingkat kenaikan, misalnya `md:grid-cols-2` lalu `lg:grid-cols-3`.',
        '(sm|md):grid-cols-\\d[\\s\\S]{0,120}(lg|xl):grid-cols-\\d',
      ),
      wajibStruktur(
        'ada-gap',
        'Ada jarak antar kartu',
        'Belum ada `gap-*`. Jangan memakai margin di setiap kartu, karena margin ikut menempel di tepi luar grid dan harus dibatalkan lagi dengan margin negatif.',
        '[\\s"\']gap-\\d',
      ),
    ]),
  }),

  soal({
    slug: 'fokus-dan-reduced-motion',
    title: 'Tombol yang ramah keyboard dan reduced motion',
    topic: 'layout',
    level: 'intermediate',
    realWorldUse:
      'Dua hal yang paling sering hilang saat tombol dipercantik. Focus ring dibuang karena dianggap jelek, dan animasinya tetap berjalan bagi orang yang sudah meminta gerakan dikurangi.',
    source: { category: 'frontend-intermediate', chapter: 'tailwind-css' },
    codeLang: 'jsx',
    brief: {
      situation:
        'Ada pengguna yang tidak memakai mouse dan berpindah antar tombol dengan tombol Tab di keyboard. Supaya tahu tombol mana yang sedang aktif, mereka butuh tanda yang terlihat di sekeliling tombol itu. Ada juga pengguna yang merasa pusing melihat animasi, dan mereka sudah mengaktifkan pengaturan reduced motion di sistem operasinya. Tombol "Simpan" ini harus menghormati keduanya.',
      tasks: [
        'Isi atribut `className` pada tombol di editor.',
        'Tambahkan focus ring yang hanya muncul saat tombol dijangkau lewat keyboard.',
        'Tambahkan transisi warna yang halus.',
        'Matikan transisi itu bagi pengguna yang mengaktifkan reduced motion.',
      ],
      pitfalls: [
        'Pakai `focus-visible`, bukan `focus`. Varian `focus` juga menyala saat tombol diklik mouse, dan focus ring yang muncul di setiap klik itulah yang membuat orang tergoda menghapusnya sama sekali.',
        'Jangan memakai `outline-none` tanpa pengganti. Menghapus focus ring tanpa menggantinya membuat tombol mustahil dilacak oleh siapa pun yang berpindah dengan tombol Tab.',
      ],
      terms: [
        {
          term: 'focus ring',
          meaning:
            'Garis atau bayangan di sekeliling elemen yang sedang fokus, yaitu elemen yang akan bereaksi kalau tombol Enter ditekan. Bagi pengguna keyboard, focus ring adalah pengganti kursor mouse. Di Tailwind biasanya dibuat dengan `ring-2` atau `outline`.',
        },
        {
          term: 'focus-visible',
          meaning:
            'Varian yang hanya aktif ketika browser menilai pengguna butuh melihat fokusnya, terutama saat navigasi lewat keyboard. Saat tombol diklik mouse, varian ini biasanya tidak menyala. Di Tailwind ditulis sebagai awalan, misalnya `focus-visible:ring-2`.',
        },
        {
          term: 'reduced motion',
          meaning:
            'Pengaturan sistem operasi yang dipilih pengguna untuk mengurangi animasi di layar, misalnya karena gangguan keseimbangan. CSS membacanya lewat media query `prefers-reduced-motion`. Di Tailwind, awalan `motion-reduce:` hanya berlaku kalau pengaturan itu aktif.',
        },
      ],
    },
    rules: [
      'Punya focus ring lewat varian `focus-visible`.',
      'Punya transisi warna.',
      'Transisi dimatikan saat reduced motion aktif.',
      'Tidak memakai `outline-none` tanpa pengganti.',
    ],
    starter: `
      <button type="button" className="rounded-md px-4 py-2">
        Simpan
      </button>
    `,
    hints: [
      'Varian ditulis sebagai awalan yang diikuti tanda titik dua, misalnya `hover:bg-slate-100`.',
      'Tailwind punya varian khusus untuk preferensi gerakan pengguna, yaitu `motion-reduce`.',
      'Bentuknya `transition-colors focus-visible:ring-2 motion-reduce:transition-none`.',
    ],
    solution: {
      code: `
        <button
          type="button"
          // transition-colors untuk efek halus, focus-visible untuk pengguna keyboard,
          // dan motion-reduce mematikan transisi bagi yang meminta gerakan dikurangi
          className="rounded-md px-4 py-2 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          Simpan
        </button>
      `,
      steps: [
        '`transition-colors` membuat perubahan warna, misalnya saat hover, terjadi perlahan.',
        '`hover:bg-slate-100` memberi warna latar saat kursor berada di atas tombol.',
        '`focus-visible:ring-2` menampilkan focus ring setebal 2 piksel, tapi hanya saat tombol dijangkau lewat keyboard.',
        '`focus-visible:ring-offset-2` memberi sedikit jarak antara tombol dan focus ring supaya lebih mudah terlihat.',
        '`motion-reduce:transition-none` mematikan transisi bagi pengguna yang mengaktifkan reduced motion.',
      ],
      explanation:
        '`focus-visible` dipilih, bukan `focus`, karena browser hanya menyalakannya saat fokus datang dari keyboard. Itu menyelesaikan keberatan yang sebenarnya, yaitu focus ring yang muncul di setiap klik mouse, tanpa mengorbankan pengguna keyboard yang selama ini jadi korban `outline-none`.',
    },
    alternativeSolutions: [
      `
        <button
          type="button"
          className="rounded-md px-4 py-2 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 motion-reduce:transition-none"
        >
          Simpan
        </button>
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          <button type="button" className="rounded-md px-4 py-2 outline-none transition-colors motion-reduce:transition-none">
            Simpan
          </button>
        `,
        reason:
          'Menghapus focus ring tanpa menggantinya, sehingga tombol tidak bisa dilacak lewat tombol Tab.',
      },
      {
        code: `
          <button type="button" className="rounded-md px-4 py-2 transition-colors focus:ring-2">
            Simpan
          </button>
        `,
        reason:
          'Memakai `focus`, bukan `focus-visible`, dan transisinya tidak menghormati reduced motion.',
      },
      {
        code: `
          <button type="button" className="rounded-md px-4 py-2 focus-visible:ring-2">
            Simpan
          </button>
        `,
        reason:
          'Focus ring-nya sudah benar, tapi tidak ada transisi sama sekali seperti yang diminta soal.',
      },
    ],
    check: mesinStruktur('js', [
      wajibStruktur(
        'fokus-terlihat',
        'Punya focus ring lewat `focus-visible`',
        'Belum ada varian `focus-visible`. Pakai `focus-visible`, bukan `focus`. Browser hanya menyalakannya saat fokus datang dari keyboard, sehingga alasan orang ingin menghapusnya hilang.',
        'focus-visible:(ring|outline|border|shadow)',
      ),
      wajibStruktur(
        'ada-transisi',
        'Punya transisi warna',
        'Belum ada `transition-colors`.',
        '[\\s"\']transition-colors?[\\s"\']',
      ),
      wajibStruktur(
        'hormati-reduced-motion',
        'Transisi dimatikan saat reduced motion aktif',
        'Belum ada `motion-reduce:`. Pengguna yang mengaktifkan reduced motion sudah menyatakan preferensinya, dan mengabaikannya bukan pilihan desain.',
        'motion-reduce:',
      ),
      larangStruktur(
        'tanpa-outline-none',
        'Tidak memakai `outline-none` tanpa pengganti',
        '`outline-none` menghapus focus ring bawaan. Tanpa pengganti, tombol ini tidak bisa dilacak oleh siapa pun yang berpindah dengan tombol Tab.',
        '[\\s"\']outline-none[\\s"\']',
      ),
    ]),
  }),

  soal({
    slug: 'theme-token-tailwind',
    title: 'Design token dengan `@theme`',
    topic: 'layout',
    level: 'intermediate',
    realWorldUse:
      'Cara Tailwind v4 dikonfigurasi. Token yang namanya salah tidak memunculkan error apa pun. Ia hanya tidak menghasilkan utility class, dan class yang kamu tulis diam-diam tidak berefek.',
    source: { category: 'frontend-intermediate', chapter: 'tailwind-css' },
    brief: {
      situation:
        'Tim desain menetapkan warna merek, font judul, dan besar sudut kartu yang harus dipakai di seluruh aplikasi. Supaya tidak ada yang menulis kode warna sembarangan, nilai-nilai itu disimpan sebagai design token di satu tempat. Di Tailwind v4 tempatnya adalah blok `@theme` di file CSS, dan dari situ Tailwind membuat class seperti `bg-merek` secara otomatis.',
      tasks: [
        'Tulis blok `@theme` di bawah baris `@import` di editor.',
        'Definisikan token warna merek bernama `--color-merek`.',
        'Definisikan token font judul bernama `--font-display`.',
        'Definisikan token sudut kartu bernama `--radius-kartu`.',
      ],
      pitfalls: [
        'Awalan nama token yang menentukan class apa yang dibuat. `--color-merek` menghasilkan `bg-merek` dan `text-merek`. Menulis `--merek-color` tetap CSS yang sah dan tidak memunculkan peringatan apa pun, tapi tidak menghasilkan class, sehingga `bg-merek` yang kamu tulis nanti tidak berefek.',
        'Token harus ditulis di dalam `@theme`, bukan di `:root`. Variabel di `:root` tetap ada, tapi Tailwind tidak membuat class apa pun darinya.',
      ],
      terms: [
        {
          term: 'design token',
          meaning:
            'Nilai desain yang diberi nama dan dipakai ulang di seluruh aplikasi, misalnya warna merek atau ukuran sudut. Daripada menulis `#8f5314` di dua puluh tempat, semua tempat memakai nama `merek`. Mengganti warnanya cukup di satu tempat.',
        },
        {
          term: '@theme',
          meaning:
            'Blok khusus Tailwind v4 di dalam file CSS untuk mendaftarkan design token. Setiap variabel di dalamnya yang awalannya dikenali akan dibuatkan class. `--color-merek` di dalam `@theme` membuat Tailwind menyediakan `bg-merek`, `text-merek`, dan `border-merek`.',
        },
        {
          term: 'CSS custom property',
          meaning:
            'Variabel di CSS yang namanya diawali dua tanda hubung, misalnya `--color-merek`. Nilainya dibaca dengan `var(--color-merek)`. Semua design token di Tailwind v4 pada dasarnya adalah CSS custom property.',
        },
      ],
    },
    rules: [
      'Ada blok `@theme`.',
      'Token warna memakai awalan `--color-`.',
      'Token font memakai awalan `--font-`.',
      'Token sudut memakai awalan `--radius-`.',
    ],
    starter: `
      @import 'tailwindcss';

      /* definisikan token di sini */
    `,
    hints: [
      'Blok `@theme` berisi deklarasi CSS custom property biasa.',
      'Yang menentukan class bukan nama tokennya, melainkan awalannya.',
      'Bentuknya `@theme { --color-merek: #8f5314; }`.',
    ],
    solution: {
      code: `
        @import 'tailwindcss';

        /* Awalan menentukan class yang dibuat Tailwind. */
        @theme {
          --color-merek: #8f5314; /* menjadi bg-merek, text-merek, border-merek */
          --font-display: 'Instrument Sans', sans-serif; /* menjadi font-display */
          --radius-kartu: 14px; /* menjadi rounded-kartu */
        }
      `,
      steps: [
        '`@import "tailwindcss"` memuat Tailwind, dan baris ini sudah ada di editor.',
        '`@theme { ... }` membuka blok tempat token didaftarkan.',
        '`--color-merek` diawali `--color-`, sehingga Tailwind membuat class warna seperti `bg-merek` dan `text-merek`.',
        '`--font-display` diawali `--font-`, sehingga menjadi class `font-display`.',
        '`--radius-kartu` diawali `--radius-`, sehingga menjadi class `rounded-kartu`.',
      ],
      explanation:
        'Yang bekerja adalah awalannya, bukan namanya. Tailwind membaca `--color-*` lalu membuat seluruh keluarga class warna untuknya. Itu juga sebabnya token yang awalannya salah gagal tanpa suara. Secara CSS ia tetap variabel yang sah, hanya saja tidak ada yang memakainya untuk membuat class.',
    },
    alternativeSolutions: [
      `
        @import "tailwindcss";

        @theme {
          --color-merek: oklch(0.55 0.12 60);
          --color-merek-lembut: #f8eed6;
          --font-display: "Instrument Sans", ui-sans-serif, sans-serif;
          --radius-kartu: 0.875rem;
          --spacing-gutter: 1.5rem;
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          @import 'tailwindcss';

          @theme {
            --merek-color: #8f5314;
            --display-font: 'Instrument Sans', sans-serif;
            --kartu-radius: 14px;
          }
        `,
        reason: 'Awalannya terbalik. CSS-nya sah, tapi tidak satu pun class dibuat oleh Tailwind.',
      },
      {
        code: `
          @import 'tailwindcss';

          :root {
            --color-merek: #8f5314;
            --font-display: 'Instrument Sans', sans-serif;
            --radius-kartu: 14px;
          }
        `,
        reason:
          'Ditulis di `:root`, bukan di `@theme`. Variabelnya ada, tapi Tailwind tidak membuat class apa pun.',
      },
      {
        code: `
          @import 'tailwindcss';

          @theme {
            --color-merek: #8f5314;
          }
        `,
        reason: 'Hanya ada token warna, sedangkan token font dan sudut kartu belum didefinisikan.',
      },
    ],
    check: mesinStruktur('css', [
      wajibStruktur(
        'ada-theme',
        'Ada blok `@theme`',
        'Belum ada blok `@theme`. Menaruh variabel di `:root` saja tidak cukup, karena Tailwind hanya membuat class dari token yang ada di dalam `@theme`.',
        '@theme\\s*\\{',
      ),
      wajibStruktur(
        'token-warna',
        'Token warna memakai awalan `--color-`',
        'Awalannya yang menentukan class. `--color-merek` menghasilkan `bg-merek` dan `text-merek`, sedangkan `--merek-color` tidak menghasilkan apa-apa dan tidak memberi peringatan apa pun.',
        '--color-[a-z][\\w-]*\\s*:',
      ),
      wajibStruktur(
        'token-font',
        'Token font memakai awalan `--font-`',
        'Belum ada token `--font-*`, yang menghasilkan class `font-*`.',
        '--font-[a-z][\\w-]*\\s*:',
      ),
      wajibStruktur(
        'token-radius',
        'Token sudut memakai awalan `--radius-`',
        'Belum ada token `--radius-*`, yang menghasilkan class `rounded-*`.',
        '--radius-[a-z][\\w-]*\\s*:',
      ),
    ]),
  }),
];
