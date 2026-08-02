import { defineCategory, defineChapter, q } from '@/lib/curriculum/authoring';
import { lessons as lessonsJenisKomponen } from './frontend-intermediate/jenis-komponen/lessons';
import { lessons as lessonsNextjs } from './frontend-intermediate/nextjs/lessons';
import { lessons as lessonsReactHooks } from './frontend-intermediate/react-hooks/lessons';
import { lessons as lessonsStateManagement } from './frontend-intermediate/state-management/lessons';
import { lessons as lessonsState } from './frontend-intermediate/state/lessons';
import { lessons as lessonsKomponen } from './frontend-intermediate/komponen/lessons';
import { lessons as lessonsReactFundamental } from './frontend-intermediate/react-fundamental/lessons';
import { lessons as lessonsTailwind } from './frontend-intermediate/tailwind/lessons';

/** Frontend Intermediate — 8 chapters, 100 lessons. */

const tailwind = defineChapter({
  slug: 'tailwind-css',
  number: 1,
  title: 'Tailwind CSS',
  summary:
    'Menulis style langsung di markup dengan disiplin, dan mengunci keputusannya sebagai design token.',
  objectives: [
    'Menyusun layout responsif tanpa menulis file CSS terpisah',
    'Mendefinisikan design token dengan `@theme` di Tailwind v4',
    'Menjaga kontras dan focus state tetap lolos saat mengejar tampilan',
  ],
  prerequisites: [],
  stackVersions: ['Tailwind CSS 4.3'],
  reviewedAt: '2026-08-02',
  lessons: lessonsTailwind,
  quiz: [
    q(
      'fi1-q1',
      'Apa perubahan terbesar Tailwind v4 dibanding v3?',
      [
        'Nama class berubah total',
        'Konfigurasi pindah ke CSS lewat `@theme`, dan `tailwind.config.js` tidak lagi wajib',
        'Tidak mendukung dark mode',
        'Harus dipakai dengan React',
      ],
      1,
      'v4 memakai pendekatan CSS-first: satu `@import "tailwindcss"` dan token didefinisikan di blok `@theme` sebagai CSS custom property, yang juga bisa dibaca langsung dari JavaScript maupun CSS biasa.',
    ),
    q(
      'fi1-q2',
      'Kapan `@apply` sebaiknya dihindari?',
      [
        'Selalu',
        'Ketika ia dipakai untuk membangun ulang sistem class bernama, sehingga keuntungan utility-first hilang',
        'Saat memakai dark mode',
        'Saat memakai Grid',
      ],
      1,
      '`@apply` berguna untuk beberapa pola yang benar-benar berulang. Kalau ia dipakai untuk membuat `.btn`, `.card`, `.badge` dan seterusnya, kamu kembali ke masalah CSS bernama — hanya dengan langkah tambahan.',
    ),
  ],
  practice: {
    id: 'frontend-intermediate/tailwind-css',
    title: 'Praktik bab ini',
    items: [
      'Definisikan lima token warna sendiri di `@theme` dan pakai di dua komponen',
      'Buat navbar yang berubah menjadi drawer di bawah 768px',
      'Pastikan setiap elemen interaktif punya focus ring yang terlihat di kedua tema',
      'Periksa kontras palet buatanmu dengan alat pengukur, bukan dengan perasaan',
    ],
  },
});

const reactFundamental = defineChapter({
  slug: 'fundamental-reactjs',
  number: 2,
  title: 'Fundamental ReactJS',
  summary: 'Model mental React: komponen, props, dan rendering deklaratif.',
  objectives: [
    'Menjelaskan apa yang React lakukan saat state berubah',
    'Merender daftar dengan `key` yang benar dan tahu kenapa indeks sering salah',
    'Menyusun UI dari komponen yang bisa dipakai ulang',
  ],
  prerequisites: [{ category: 'frontend-basic', chapter: 'jsx-dan-tsx' }],
  stackVersions: ['React 19.2'],
  reviewedAt: '2026-08-02',
  lessons: lessonsReactFundamental,
  quiz: [
    q(
      'fi2-q1',
      'Kenapa memakai indeks array sebagai `key` sering bermasalah?',
      [
        'Karena indeks selalu berubah',
        'Karena saat urutan atau isi daftar berubah, React mencocokkan elemen yang salah sehingga state internalnya tertukar',
        'Karena indeks bukan string',
        'Karena React melarangnya',
      ],
      1,
      '`key` adalah identitas item. Kalau item disisipkan di awal, semua indeks bergeser, dan React mengira item lama berubah isi. Input yang sedang diketik atau state internal komponen bisa ikut berpindah ke baris yang salah.',
    ),
    q(
      'fi2-q2',
      'Apa arti "props bersifat hanya-baca"?',
      [
        'Props tidak bisa dibaca komponen anak',
        'Komponen tidak boleh mengubah props yang diterimanya; perubahan datang dari komponen induk',
        'Props hanya bisa berupa string',
        'Props hanya berlaku sekali render',
      ],
      1,
      'Aliran data satu arah adalah yang membuat React bisa ditelusuri: kalau sebuah nilai salah, kamu menaikinya ke atas sampai ketemu sumbernya. Komponen yang menulis ke propsnya sendiri mematahkan itu.',
    ),
  ],
  practice: {
    id: 'frontend-intermediate/fundamental-reactjs',
    title: 'Praktik bab ini',
    items: [
      'Pecah satu desain halaman menjadi minimal empat komponen',
      'Render daftar dengan `key` yang benar-benar unik dan stabil',
      'Ganti satu kasus prop drilling dengan composition `children`',
    ],
  },
});

const komponenReact = defineChapter({
  slug: 'pembuatan-komponen-react',
  number: 3,
  title: 'Pembuatan Komponen ReactJS (Studi Kasus)',
  summary: 'Delapan komponen nyata, dibangun dari nol, lengkap dengan keputusan API-nya.',
  objectives: [
    'Merancang API komponen tanpa ledakan boolean prop',
    'Membangun komponen overlay yang benar secara aksesibilitas',
    'Menyusun mini design system yang konsisten',
  ],
  prerequisites: [{ category: 'frontend-intermediate', chapter: 'fundamental-reactjs' }],
  stackVersions: ['React 19.2', 'Tailwind CSS 4.3'],
  reviewedAt: '2026-08-02',
  lessons: lessonsKomponen,
  quiz: [
    q(
      'fi3-q1',
      'Kenapa `<Button isPrimary isLarge isDanger />` adalah API yang buruk?',
      [
        'Karena terlalu panjang',
        'Karena boolean bisa dikombinasikan menjadi keadaan yang tidak punya arti, dan jumlah kombinasinya tumbuh eksponensial',
        'Karena boolean lambat',
        'Karena React tidak mendukung boolean prop',
      ],
      1,
      'Tiga boolean berarti delapan kombinasi, sebagian mustahil. `variant="primary" size="lg"` hanya mengizinkan keadaan yang valid dan langsung terbaca di call site.',
    ),
    q(
      'fi3-q2',
      'Apa yang wajib dilakukan dialog setelah ditutup?',
      [
        'Memuat ulang halaman',
        'Mengembalikan fokus ke elemen yang membukanya',
        'Menghapus semua state',
        'Menampilkan toast',
      ],
      1,
      'Tanpa itu, pengguna keyboard terlempar ke awal dokumen dan kehilangan posisinya. Fokus juga harus terkunci di dalam dialog selama ia terbuka.',
    ),
  ],
  practice: {
    id: 'frontend-intermediate/pembuatan-komponen-react',
    title: 'Praktik bab ini',
    items: [
      'Bangun `Button` dengan `variant` dan `size`, tanpa satu pun boolean prop tampilan',
      'Bangun `Dialog` yang lolos uji keyboard: `Esc`, focus trap, fokus kembali',
      'Ubah satu komponen berprop banyak menjadi compound component',
    ],
  },
});

const stateEvent = defineChapter({
  slug: 'state-dan-event-handler',
  number: 4,
  title: 'Pengelolaan Data & Tampilan (State & Event Handler)',
  summary: 'State sebagai snapshot, update immutable, dan empat keadaan UI yang wajib ditangani.',
  objectives: [
    'Menjelaskan kenapa membaca state tepat setelah `setState` memberi nilai lama',
    'Memperbarui object dan array tanpa mutasi',
    'Menangani loading, kosong, error, dan sukses di setiap tampilan berdata',
  ],
  prerequisites: [{ category: 'frontend-intermediate', chapter: 'fundamental-reactjs' }],
  stackVersions: ['React 19.2'],
  reviewedAt: '2026-08-02',
  lessons: lessonsState,
  quiz: [
    q(
      'fi4-q1',
      'Kenapa `console.log(count)` tepat setelah `setCount(count + 1)` masih menampilkan nilai lama?',
      [
        'Karena `setCount` lambat',
        'Karena `count` adalah konstanta untuk render saat ini; nilai baru baru terlihat di render berikutnya',
        'Karena ada bug di React',
        'Karena `console.log` di-cache',
      ],
      1,
      'Setiap render punya salinan state-nya sendiri. `setCount` menjadwalkan render baru, ia tidak mengubah variabel yang sudah ada di render sekarang.',
    ),
    q(
      'fi4-q2',
      'Kapan bentuk `setItems(prev => [...prev, item])` wajib dipakai?',
      [
        'Selalu',
        'Ketika nilai baru bergantung pada nilai sebelumnya, terutama bila ada beberapa pembaruan dalam satu event',
        'Hanya untuk array',
        'Hanya di dalam `useEffect`',
      ],
      1,
      'Tanpa bentuk updater, dua pemanggilan berurutan dalam satu event sama-sama membaca nilai lama, sehingga salah satunya hilang. Bentuk fungsi selalu menerima nilai terbaru.',
    ),
    q(
      'fi4-q3',
      'Apa masalah menyimpan nilai yang bisa dihitung dari state lain?',
      [
        'Boros memori',
        'Dua sumber kebenaran yang harus disinkronkan manual — dan akan menyimpang cepat atau lambat',
        'React melarangnya',
        'Membuat render lebih lambat',
      ],
      1,
      'Kalau `total` bisa dihitung dari `items`, hitung saat render. Menyimpannya berarti setiap perubahan `items` harus diikuti pembaruan `total` di semua tempat — satu yang terlewat sudah cukup untuk membuat bug.',
    ),
  ],
  practice: {
    id: 'frontend-intermediate/state-dan-event-handler',
    title: 'Praktik bab ini',
    items: [
      'Buktikan sendiri bahwa state adalah snapshot dengan dua `setState` berurutan',
      'Perbarui array bersarang tanpa satu pun mutasi',
      'Tampilkan keempat keadaan UI pada satu daftar hasil pencarian',
    ],
  },
});

const stateManagement = defineChapter({
  slug: 'state-management',
  number: 5,
  title: 'State Management',
  summary:
    'Lima kategori state dan solusi yang tepat untuk masing-masing — bukan satu library untuk semuanya.',
  objectives: [
    'Mengklasifikasikan sebuah state ke kategori yang benar sebelum memilih alat',
    'Menjelaskan kenapa server state butuh cache, bukan sekadar variabel global',
    'Menghindari Context sebagai pengganti state management global',
  ],
  prerequisites: [{ category: 'frontend-intermediate', chapter: 'state-dan-event-handler' }],
  stackVersions: ['React 19.2', 'TanStack Query 5', 'Zustand 5', 'Redux Toolkit 2'],
  reviewedAt: '2026-08-02',
  lessons: lessonsStateManagement,
  quiz: [
    q(
      'fi5-q1',
      'Kenapa data dari API sebaiknya tidak disimpan di store global biasa?',
      [
        'Karena store global lambat',
        'Karena data server punya kebasian, revalidasi, dan mode gagal sendiri yang harus ditulis ulang manual di store biasa',
        'Karena store global tidak bisa menyimpan objek',
        'Karena API selalu berubah',
      ],
      1,
      'Menyalin respons API ke Redux/Zustand berarti kamu membangun ulang caching, deduplikasi, refetch, dan invalidasi dengan tangan. Library server state sudah menyelesaikan semuanya.',
    ),
    q(
      'fi5-q2',
      'Apa masalah utama memakai Context untuk state yang sering berubah?',
      [
        'Context tidak mendukung objek',
        'Setiap perubahan nilai me-render ulang seluruh komponen yang mengonsumsinya, sedalam apa pun pohonnya',
        'Context hanya bekerja di server',
        'Context tidak bisa dipakai bersama TypeScript',
      ],
      1,
      'Context bagus untuk nilai yang jarang berubah — tema, bahasa, pengguna aktif. Untuk nilai yang berubah tiap ketikan, store dengan selector jauh lebih tepat.',
    ),
  ],
  practice: {
    id: 'frontend-intermediate/state-management',
    title: 'Praktik bab ini',
    items: [
      'Klasifikasikan setiap state di satu halaman ke lima kategori',
      'Pindahkan satu data server dari `useState` ke TanStack Query',
      'Pindahkan filter dan paginasi ke `searchParams`',
    ],
  },
});

const jenisKomponen = defineChapter({
  slug: 'jenis-komponen-react',
  number: 6,
  title: 'Eksplorasi Mendalam Komponen & Jenisnya',
  summary:
    'Pola komponen dari yang klasik sampai Server Component, beserta kapan masing-masing tepat.',
  objectives: [
    'Menentukan letak batas `"use client"` dengan sadar',
    'Memilih antara compound component, render props, dan custom hook',
    'Menangani kegagalan sebagian dengan Error Boundary',
  ],
  prerequisites: [{ category: 'frontend-intermediate', chapter: 'pembuatan-komponen-react' }],
  stackVersions: ['React 19.2', 'Next.js 16.2'],
  reviewedAt: '2026-08-02',
  lessons: lessonsJenisKomponen,
  quiz: [
    q(
      'fi6-q1',
      'Apa yang terjadi pada komponen anak dari sebuah file bertanda `"use client"`?',
      [
        'Tidak ada; hanya file itu yang menjadi client',
        'Seluruh komponen yang diimpor ke dalamnya ikut menjadi bagian dari bundle klien',
        'Anaknya otomatis menjadi Server Component',
        'React melempar error',
      ],
      1,
      'Karena itu batas klien ditarik serapat mungkin ke daun. Pola yang aman: Server Component yang menerima island klien lewat `children`, sehingga sisanya tetap di server.',
    ),
    q(
      'fi6-q2',
      'Kapan Error Boundary lebih tepat daripada `try`/`catch`?',
      [
        'Selalu',
        'Untuk menangkap kegagalan yang terjadi saat rendering komponen anak, yang tidak bisa ditangkap `try`/`catch` biasa',
        'Untuk menangani error jaringan',
        'Untuk menangani error TypeScript',
      ],
      1,
      'Error saat render tidak melewati `try`/`catch` di event handler. Error Boundary menangkapnya dan menampilkan fallback, sehingga satu widget yang gagal tidak mengosongkan seluruh halaman.',
    ),
  ],
  practice: {
    id: 'frontend-intermediate/jenis-komponen-react',
    title: 'Praktik bab ini',
    items: [
      'Ubah satu halaman agar hanya bagian interaktifnya yang `"use client"`',
      'Bungkus satu widget dengan Error Boundary dan uji dengan error buatan',
      'Ubah komponen dengan lima boolean prop menjadi compound component',
    ],
  },
});

const hooks = defineChapter({
  slug: 'react-hooks',
  number: 7,
  title: 'React Hooks',
  summary:
    'Seluruh hook bawaan, kapan dipakai, dan kesalahan `useEffect` yang paling sering terjadi.',
  objectives: [
    'Menjelaskan `useEffect` sebagai sinkronisasi, bukan lifecycle',
    'Mengenali kasus di mana Effect sebenarnya tidak dibutuhkan',
    'Menulis custom hook yang benar-benar mengurangi duplikasi',
  ],
  prerequisites: [{ category: 'frontend-intermediate', chapter: 'state-dan-event-handler' }],
  stackVersions: ['React 19.2'],
  reviewedAt: '2026-08-02',
  lessons: lessonsReactHooks,
  quiz: [
    q(
      'fi7-q1',
      'Kapan `useEffect` TIDAK dibutuhkan?',
      [
        'Saat memanggil API',
        'Saat nilainya bisa dihitung langsung dari props atau state saat render',
        'Saat memasang event listener',
        'Saat komponen di-unmount',
      ],
      1,
      'Menghitung nilai turunan di dalam Effect berarti satu render tambahan dan satu sumber kebenaran tambahan. Hitung saja saat render. Effect adalah untuk menyinkronkan dengan sistem di luar React.',
    ),
    q(
      'fi7-q2',
      'Apa fungsi nilai kembalian dari `useEffect`?',
      [
        'Menentukan nilai state',
        'Fungsi cleanup yang dijalankan sebelum Effect berjalan lagi dan saat komponen dilepas',
        'Menentukan dependency',
        'Menghentikan render',
      ],
      1,
      'Tanpa cleanup, langganan menumpuk, timer terus berjalan, dan permintaan lama menimpa hasil yang baru — kebocoran yang baru terasa setelah aplikasi dipakai lama.',
    ),
    q(
      'fi7-q3',
      'Kenapa hook tidak boleh dipanggil di dalam kondisi atau loop?',
      [
        'Karena melanggar aturan penulisan',
        'Karena React mengidentifikasi hook berdasarkan urutan pemanggilannya, sehingga urutan yang berubah membuat state tertukar',
        'Karena akan lambat',
        'Karena TypeScript melarangnya',
      ],
      1,
      'React tidak menyimpan nama hook, hanya urutannya. Kalau satu hook dilewati pada render tertentu, semua hook setelahnya bergeser dan menerima state milik hook lain.',
    ),
  ],
  practice: {
    id: 'frontend-intermediate/react-hooks',
    title: 'Praktik bab ini',
    items: [
      'Temukan satu `useEffect` di kodemu yang sebenarnya tidak dibutuhkan, lalu hapus',
      'Tambahkan cleanup ke setiap Effect yang memasang langganan atau timer',
      'Tulis `useDebounce` dan pakai di kotak pencarian',
    ],
  },
});

const nextjs = defineChapter({
  slug: 'nextjs',
  number: 8,
  title: 'NextJS',
  summary:
    'App Router, Server Component, caching, dan Server Action — framework yang dipakai website ini sendiri.',
  objectives: [
    'Menyusun rute dengan konvensi file App Router',
    'Memilih strategi rendering dan caching yang sesuai per halaman',
    'Menjaga rahasia tetap di server dan tidak bocor ke bundle klien',
  ],
  prerequisites: [{ category: 'frontend-intermediate', chapter: 'jenis-komponen-react' }],
  stackVersions: ['Next.js 16.2', 'React 19.2'],
  reviewedAt: '2026-08-02',
  lessons: lessonsNextjs,
  quiz: [
    q(
      'fi8-q1',
      'Apa yang membedakan Server Component dari Client Component?',
      [
        'Server Component lebih cepat ditulis',
        'Server Component dijalankan di server dan kodenya tidak dikirim ke browser; ia tidak bisa memakai state atau event handler',
        'Server Component hanya untuk API',
        'Tidak ada perbedaan nyata',
      ],
      1,
      'Karena tidak dikirim ke browser, Server Component boleh mengakses berkas, database, atau rahasia — dan tidak menambah satu byte pun ke bundle klien. Harganya: tidak ada `useState`, tidak ada `onClick`.',
    ),
    q(
      'fi8-q2',
      'Kenapa variabel berawalan `NEXT_PUBLIC_` tidak boleh berisi rahasia?',
      [
        'Karena namanya terlalu panjang',
        'Karena nilainya disisipkan ke dalam bundle JavaScript yang bisa dibaca siapa pun yang membuka situs',
        'Karena Next.js mengenkripsinya',
        'Karena hanya berlaku di development',
      ],
      1,
      'Prefix itu adalah instruksi eksplisit untuk mengekspor nilai ke browser. Apa pun yang ada di sana setara dengan menuliskannya di halaman — kunci API di situ sama saja dengan membagikannya.',
    ),
    q(
      'fi8-q3',
      'Apa yang harus tetap dilakukan pada Server Action meski ia dipanggil dari form milik sendiri?',
      [
        'Tidak ada; ia aman karena internal',
        'Memvalidasi input dan memeriksa otorisasi, karena Server Action adalah endpoint yang bisa dipanggil siapa saja',
        'Membungkusnya dengan `try`/`catch` saja',
        'Menjalankannya di Client Component',
      ],
      1,
      'Server Action dikompilasi menjadi endpoint HTTP. Siapa pun bisa memanggilnya langsung dengan payload buatan sendiri, jadi validasi dan otorisasi tetap wajib — sama seperti Route Handler biasa.',
    ),
  ],
  practice: {
    id: 'frontend-intermediate/nextjs',
    title: 'Praktik bab ini',
    items: [
      'Buat satu rute dinamis lengkap dengan `loading.tsx` dan `error.tsx`',
      'Ambil data di Server Component tanpa satu pun `useEffect`',
      'Tulis satu Server Action dengan validasi input yang eksplisit',
      'Baca output `next build` dan catat rute mana yang bundlenya terbesar',
    ],
  },
});

export const frontendIntermediate = defineCategory({
  slug: 'frontend-intermediate',
  order: 2,
  title: 'Frontend Intermediate',
  tagline: 'Dari fondasi ke aplikasi nyata',
  description:
    'Tailwind untuk tampilan, React untuk struktur, dan Next.js untuk menyatukan keduanya dengan server. Bab-bab di sini yang mengubah pemahaman JavaScript menjadi aplikasi yang benar-benar bisa dipakai.',
  chapters: [
    tailwind,
    reactFundamental,
    komponenReact,
    stateEvent,
    stateManagement,
    jenisKomponen,
    hooks,
    nextjs,
  ],
});
