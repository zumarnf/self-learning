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
 * Frontend Intermediate — Chapter 2, all eleven lessons.
 *
 * Written against React 19.2. Deliberately leans on Frontend Basic: `map`/`key`, closures,
 * immutability, and the DOM work from chapter 4 all reappear here with their names attached.
 */
export const lessons: LessonDraft[] = [
  written(
    'kenapa-react',
    'Kenapa React: masalah apa yang sebenarnya dipecahkan',
    10,
    'Melihat React sebagai jawaban atas kode DOM manual yang kamu tulis sendiri di Frontend Basic.',
    [
      p(
        'Di Bab 4 Frontend Basic kamu membangun To-Do List dengan DOM murni. Ia bekerja. Bab ini menjelaskan kenapa pendekatan itu berhenti bekerja saat aplikasi membesar — memakai kodemu sendiri sebagai bukti.',
      ),

      terms(
        {
          term: 'React',
          meaning:
            'Pustaka untuk membangun tampilan yang **menghitung ulang seluruh gambaran** setiap kali datanya berubah, lalu menerapkan perbedaannya ke layar. Namanya sendiri menjelaskan gagasannya: tampilan **bereaksi** terhadap data. Bukan framework lengkap — routing, pengambilan data, dan lainnya datang dari luar.',
        },
        {
          term: 'sinkronisasi manual',
          meaning:
            'Masalah utama yang dipecahkan React, dan kamu sudah merasakannya sendiri di Bab 4 Frontend Basic. Setiap tempat baru yang menampilkan sepotong data menambah satu pembaruan yang **harus diingat**. Satu yang terlewat menghasilkan tampilan yang tidak cocok dengan datanya — bug yang sangat sulit dilacak justru karena **datanya benar**.',
        },
        {
          term: 'UI = f(state)',
          meaning:
            'Rumus yang merangkum seluruh React: **tampilan adalah hasil perhitungan dari keadaan**. Kamu tidak lagi memerintahkan "ubah teks ini, aktifkan tombol itu"; kamu menulis "kalau keadaannya begini, tampilannya begini" — lalu React yang mengurus sisanya.',
        },
        {
          term: 'state',
          meaning:
            'Terjemahannya **keadaan**. Data yang bisa berubah dan menentukan tampilan saat ini. Perubahannya adalah **satu-satunya pemicu** React menggambar ulang — dan itulah sebabnya mengubah variabel biasa tidak membuat apa pun bergerak di layar.',
        },
        {
          term: 'sumber kebenaran',
          meaning:
            'Terjemahan dari *source of truth*. Tempat resmi sebuah data disimpan. Di DOM manual sering ada dua — variabel di JavaScript **dan** teks di layar — dan keduanya bisa berselisih. Di React hanya ada satu: state. Layar selalu turunan darinya.',
        },
        {
          term: 'komponen',
          meaning:
            'Fungsi yang mengembalikan gambaran tampilan. Satuan penyusun aplikasi React, dan satuan yang bisa dipakai ulang, diuji, serta dipindahkan sendiri-sendiri.',
        },
        {
          term: 'pustaka vs framework',
          meaning:
            'Pembedaan yang menjelaskan banyak hal: **pustaka** kamu panggil, **framework** yang memanggil kodemu. React sengaja memilih menjadi pustaka tampilan saja — akibatnya kamu punya kebebasan memilih sisanya, sekaligus beban harus memilihnya sendiri.',
        },
        {
          term: 'ekosistem',
          meaning:
            'Kumpulan pustaka di sekitar React yang mengisi apa yang tidak ia sediakan: routing, pengambilan data, manajemen state, formulir. Ini kekuatan sekaligus kerumitannya — dan sebagian besar Frontend Intermediate ini justru membahas cara memilih di antaranya.',
        },
      ),

      h2('Masalah 1: sinkronisasi manual'),
      code(
        'js',
        `
        // Satu perubahan data harus diikuti beberapa pembaruan DOM
        function toggleSelesai(id) {
          daftar = daftar.map((t) => (t.id === id ? { ...t, selesai: !t.selesai } : t));

          // Dan sekarang JANGAN LUPA:
          perbaruiBaris(id);          // centang dan coretan
          perbaruiRingkasan();        // "3 dari 5 selesai"
          perbaruiFilter();           // jumlah di tiap tab
          perbaruiTombolHapusSemua(); // aktif/nonaktif
        }
        `,
      ),
      p(
        'Setiap tempat baru yang menampilkan data itu menambah satu baris yang **harus diingat**. Satu yang terlewat menghasilkan tampilan yang tidak cocok dengan datanya — bug yang sangat sulit dilacak karena datanya benar.',
      ),
      code(
        'jsx',
        `
        // React: ubah data, tampilan menyusul. Tidak ada daftar yang harus diingat.
        setDaftar((d) => d.map((t) => (t.id === id ? { ...t, selesai: !t.selesai } : t)));
        `,
      ),

      h2('Masalah 2: membangun ulang merusak keadaan'),
      code(
        'js',
        `
        // Pola Bab 4
        wadah.replaceChildren();
        for (const t of daftar) wadah.append(buatBaris(t));

        // Setiap render ulang menghapus:
        //   fokus keyboard · teks yang sedang diketik · posisi scroll · animasi berjalan
        `,
      ),
      p(
        'React menerima deskripsi tampilan yang baru, **membandingkannya** dengan yang lama, lalu hanya mengubah bagian yang benar-benar berbeda. Input yang sedang diketik tidak ikut dibuat ulang.',
      ),

      h2('Masalah 3: tidak ada satuan yang bisa dipakai ulang'),
      code(
        'js',
        `
        // Struktur, style, dan perilaku tersebar di tiga tempat berbeda
        // index.html  -> markup
        // style.css   -> tampilan
        // app.js      -> perilaku
        //
        // Memindahkan "kartu produk" ke halaman lain berarti menyalin dari tiga berkas
        // dan berharap tidak ada yang tertinggal.
        `,
      ),
      code(
        'jsx',
        `
        // Satu berkas berisi ketiganya, dan bisa dipindahkan utuh
        export function KartuProduk({ produk, onBeli }) {
          return (
            <article className="rounded-lg border border-border p-4">
              <h3>{produk.nama}</h3>
              <button onClick={() => onBeli(produk.id)}>Beli</button>
            </article>
          );
        }
        `,
      ),

      h2('Yang React TIDAK selesaikan'),
      ul(
        'Ia tidak membuat aplikasimu cepat dengan sendirinya — pembaruan yang salah tetap lambat.',
        'Ia tidak mengurus pengambilan data, routing, atau form. Semuanya pustaka terpisah.',
        'Ia tidak menghapus kebutuhan paham DOM, CSS, dan asinkron.',
        'Ia menambah ukuran bundle dan satu lapisan yang harus dipelajari.',
      ),
      callout(
        'info',
        'Kapan React berlebihan',
        'Halaman statis, blog, dan landing page tidak membutuhkannya. Kalau tampilanmu jarang berubah setelah dimuat, HTML dan sedikit JavaScript adalah jawaban yang lebih tepat — lebih cepat, lebih sedikit yang bisa rusak.',
      ),

      h2('Tiga gagasan intinya'),
      ol(
        '**Deklaratif** — kamu menggambarkan hasil untuk sebuah keadaan; React yang mengurus perpindahannya.',
        '**Komponen** — satuan yang membawa struktur, tampilan, dan perilaku sekaligus.',
        '**Aliran data satu arah** — data turun lewat props, perubahan naik lewat callback. Itu yang membuat bug bisa ditelusuri ke sumbernya.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Sinkronisasi manual antara data dan DOM adalah sumber bug yang tumbuh seiring aplikasi.',
        'React membandingkan deskripsi lama dan baru, sehingga keadaan DOM tidak ikut hancur.',
        'Komponen menyatukan struktur, tampilan, dan perilaku dalam satu satuan.',
        'React tidak mengurus data, routing, maupun form — semuanya terpisah.',
      ),
      references(
        {
          label: 'Thinking in React',
          href: 'https://react.dev/learn/thinking-in-react',
          source: 'React',
          note: 'Pergeseran dari sinkronisasi manual ke tampilan sebagai hasil perhitungan dari state.',
        },
        {
          label: 'Describing the UI',
          href: 'https://react.dev/learn/describing-the-ui',
          source: 'React',
          note: 'Titik masuk resmi React — komponen sebagai satuan penyusun aplikasi.',
        },
        {
          label: 'Reacting to Input with State',
          href: 'https://react.dev/learn/reacting-to-input-with-state',
          source: 'React',
          note: 'Perbandingan langsung pendekatan imperatif dan deklaratif memakai contoh formulir.',
        },
        {
          label: 'React — Home',
          href: 'https://react.dev/',
          source: 'React',
          note: 'Menegaskan cakupan React sebagai pustaka tampilan, bukan framework lengkap.',
        },
      ),
    ],
  ),

  written(
    'setup-project',
    'Menyiapkan Project: Vite vs Next.js',
    10,
    'Dua titik awal dan konsekuensinya — dipilih dari kebutuhan, bukan dari popularitas.',
    [
      terms(
        {
          term: 'Vite',
          meaning:
            'Dibaca "vit" (dari bahasa Prancis, artinya *cepat*). Alat build yang menjalankan server pengembangan hampir seketika dan hanya memproses berkas yang benar-benar kamu buka. Untuk **belajar React murni**, ini pilihan yang tepat: konsep yang harus dipelajari sedikit, dan tidak ada lapisan server yang mengaburkan apa yang sebenarnya terjadi.',
        },
        {
          term: 'Next.js',
          meaning:
            'Framework React yang menambahkan routing, rendering di server, dan optimasi bawaan. Kuat, tapi membawa **banyak konsep sekaligus** — Server Component, pemetaan rute lewat folder, strategi caching. Pilih ini kalau kamu memang butuh SEO atau kode server, bukan karena ia paling sering disebut orang.',
        },
        {
          term: 'SPA',
          meaning:
            'Singkatan *Single Page Application*. Satu dokumen HTML dimuat sekali, lalu isinya diganti dari JavaScript tanpa berpindah halaman. Ini yang dihasilkan Vite secara bawaan.',
        },
        {
          term: 'SSR',
          meaning:
            'Singkatan *Server-Side Rendering*, terjemahannya **penggambaran di sisi server**. HTML dibuat di server lalu dikirim jadi ke browser. Manfaatnya dua: mesin pencari langsung melihat isinya, dan pengguna melihat sesuatu lebih cepat tanpa menunggu JavaScript diunduh.',
        },
        {
          term: 'CSR',
          meaning:
            'Singkatan *Client-Side Rendering* — HTML awalnya nyaris kosong, dan seluruh isi digambar JavaScript di browser. Konsekuensinya: mesin pencari dan pratinjau tautan media sosial sering hanya melihat halaman kosong.',
        },
        {
          term: 'SEO',
          meaning:
            'Singkatan *Search Engine Optimization*. Disebut di sini karena ia **satu-satunya alasan teknis paling kuat** untuk memilih Next.js di awal. Kalau aplikasimu berada di balik login, isinya memang tidak untuk dicari — dan SSR-nya jadi tidak terpakai.',
        },
        {
          term: 'HMR',
          meaning:
            'Singkatan *Hot Module Replacement*, terjemahannya **penggantian modul panas**. Kemampuan mengganti kode yang sedang berjalan **tanpa memuat ulang halaman**, sehingga state-mu tidak hilang saat menyimpan berkas. Ini yang membuat pengembangan terasa langsung.',
        },
        {
          term: 'bundler',
          meaning:
            'Alat yang menggabungkan banyak berkas modul menjadi sedikit berkas siap kirim. Vite memakai esbuild dan Rollup; Next.js memakai Turbopack. Kamu jarang menyentuhnya langsung — tapi berguna tahu siapa yang bekerja saat build terasa lambat.',
        },
        {
          term: 'boilerplate',
          meaning:
            'Terjemahannya **kode kerangka** — berkas dan konfigurasi awal yang selalu ada di project baru. Semakin banyak boilerplate, semakin banyak yang harus dipahami sebelum kamu sempat menulis baris pertama yang benar-benar milikmu.',
        },
      ),

      h2('Memilih'),
      table(
        ['Kebutuhan', 'Vite', 'Next.js'],
        [
          ['Belajar React murni', '**Ya**', 'Terlalu banyak konsep sekaligus'],
          ['Dashboard di balik login', '**Ya**', 'Boleh, tapi SSR-nya tidak terpakai'],
          ['Butuh SEO / dibagikan publik', 'Tidak', '**Ya**'],
          ['Butuh kode server', 'Tidak', '**Ya**'],
          ['Waktu mulai dev server', '**Sangat cepat**', 'Cepat'],
          ['Konsep yang harus dipelajari', 'Sedikit', 'Banyak'],
        ],
      ),
      callout(
        'tip',
        'Untuk belajar Bab 2 ini, pakai Vite',
        'Next.js membawa Server Component, routing berbasis berkas, dan strategi caching sekaligus. Mempelajari React **dan** ketiganya bersamaan membuat sulit membedakan mana yang React dan mana yang Next. Next.js dibahas tuntas di Bab 8.',
      ),

      h2('Vite'),
      code(
        'bash',
        `
        npm create vite@latest aplikasi-saya -- --template react-ts
        cd aplikasi-saya
        npm install
        npm run dev
        `,
      ),
      code(
        'text',
        `
        src/
        ├── main.tsx        # titik masuk — menempelkan React ke DOM
        ├── App.tsx         # komponen akar
        ├── components/     # buat sendiri
        └── index.css
        `,
      ),
      code(
        'tsx',
        `
        import { StrictMode } from 'react';
        import { createRoot } from 'react-dom/client';
        import App from './App.tsx';
        import './index.css';

        createRoot(document.getElementById('root')!).render(
          <StrictMode>
            <App />
          </StrictMode>,
        );
        `,
        { filename: 'src/main.tsx' },
      ),
      callout(
        'warning',
        'StrictMode memanggil komponenmu dua kali — sengaja',
        'Hanya saat development. Tujuannya membongkar efek samping yang tersembunyi: kalau komponenmu rusak karena dipanggil dua kali, ia memang punya bug yang cepat atau lambat akan muncul. Jangan matikan StrictMode untuk "memperbaiki" ini — perbaiki penyebabnya.',
      ),

      h2('Struktur folder yang tidak menyusahkan nanti'),
      code(
        'text',
        `
        src/
        ├── components/
        │   ├── ui/            # primitif tanpa logika bisnis: Button, Card
        │   └── tugas/         # komponen khusus fitur
        ├── hooks/
        ├── lib/               # fungsi murni — bisa diuji tanpa React
        ├── types/
        └── App.tsx
        `,
      ),
      callout(
        'info',
        'Kelompokkan per fitur, bukan per jenis berkas',
        'Folder `components/`, `hooks/`, `utils/` yang berisi semua fitur bercampur terlihat rapi saat kecil, tapi mengerjakan satu fitur berarti membuka lima folder berbeda. Setelah aplikasi tumbuh, kelompokkan per fitur — semua yang berubah bersama, disimpan bersama.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Vite untuk belajar dan aplikasi di balik login; Next.js kalau butuh SEO atau kode server.',
        'StrictMode memanggil komponen dua kali di development untuk membongkar efek samping.',
        'Jangan matikan StrictMode — perbaiki penyebabnya.',
        'Kelompokkan berkas per fitur begitu aplikasi tumbuh.',
      ),
      references(
        {
          label: 'Getting Started',
          href: 'https://vite.dev/guide/',
          source: 'Vite',
          note: 'Membuat project React dengan satu perintah, tanpa konfigurasi awal.',
        },
        {
          label: 'Installation',
          href: 'https://nextjs.org/docs/app/getting-started/installation',
          source: 'Next.js',
          note: 'Titik awal Next.js beserta struktur folder App Router yang dihasilkannya.',
        },
        {
          label: '<StrictMode>',
          href: 'https://react.dev/reference/react/StrictMode',
          source: 'React',
          note: 'Menjelaskan kenapa komponen dipanggil dua kali di development dan kenapa itu berguna.',
        },
        {
          label: 'Start a New React Project',
          href: 'https://react.dev/learn/start-a-new-react-project',
          source: 'React',
          note: 'Anjuran resmi React sendiri dalam memilih titik awal sebuah project.',
        },
        {
          label: 'Hot Module Replacement',
          href: 'https://vite.dev/guide/features#hot-module-replacement',
          source: 'Vite',
          note: 'Mekanisme yang membuat perubahan kode terlihat tanpa kehilangan state.',
        },
      ),
    ],
  ),

  written(
    'komponen-pertama',
    'Komponen Pertama & Cara React Merender',
    11,
    'Fungsi yang mengembalikan tampilan — dan apa yang terjadi saat ia dipanggil.',
    [
      terms(
        {
          term: 'komponen',
          meaning:
            'Fungsi JavaScript biasa yang **mengembalikan gambaran tampilan**. Dua aturan yang membedakannya dari fungsi lain: namanya **wajib diawali huruf besar**, dan ia dipakai seperti tag — `<Sapaan />`, bukan `Sapaan()`. Huruf besar itulah yang membuat JSX menerjemahkannya sebagai komponen alih-alih elemen HTML.',
        },
        {
          term: 'render',
          meaning:
            'Terjemahannya **menggambar**. Di React kata ini punya arti yang sangat spesifik: **React memanggil fungsi komponenmu** untuk mendapat gambaran tampilan terbaru. Perhatikan bahwa memanggil bukan berarti mengubah layar — perubahan layar baru terjadi pada tahap berikutnya.',
        },
        {
          term: 'commit',
          meaning:
            'Tahap **setelah** render, ketika React benar-benar menyentuh DOM. Pembagian dua tahap inilah yang membuat React efisien: ia menghitung dulu apa yang perlu berubah, baru menerapkannya sekaligus, bukan sedikit demi sedikit sambil menghitung.',
        },
        {
          term: 'render pertama',
          meaning:
            'Terjemahan dari *initial render* — saat komponen digambar untuk pertama kalinya. Berbeda dari **re-render**, yaitu penggambaran ulang yang terjadi setelah state atau props berubah. Pembedaan ini akan penting sekali saat membahas `useEffect` di bab berikutnya.',
        },
        {
          term: 'fungsi murni',
          meaning:
            'Syarat yang **diwajibkan React** untuk komponen: hasilnya hanya bergantung pada props dan state, dan ia tidak mengubah apa pun di luar dirinya selama render. Bukan anjuran gaya — React berhak memanggil komponenmu berkali-kali, jadi komponen yang tidak murni menghasilkan perilaku yang tidak bisa ditebak.',
        },
        {
          term: 'efek samping',
          meaning:
            'Terjemahan dari *side effect*. Apa pun yang menyentuh dunia di luar komponen: mengubah variabel global, menulis ke `localStorage`, mengirim permintaan jaringan. **Dilarang terjadi selama render** — tempatnya di event handler atau di dalam `useEffect`.',
        },
        {
          term: 'root',
          meaning:
            'Terjemahannya **akar**. Titik tempat React menempelkan seluruh aplikasinya ke DOM, dibuat dengan `createRoot(document.getElementById("root"))`. Ini satu-satunya tempat React dan DOM asli bertemu langsung.',
        },
        {
          term: 'top-down',
          meaning:
            'Terjemahannya **dari atas ke bawah**. Arah render React: sebuah komponen yang digambar ulang akan menyebabkan anak-anaknya ikut dipanggil ulang. Ini yang membuat perilakunya bisa ditebak — dan sekaligus yang membuat penempatan state menjadi keputusan yang berpengaruh.',
        },
      ),

      h2('Komponen adalah fungsi'),
      code(
        'tsx',
        `
        export function Sapaan() {
          return <h1>Halo</h1>;
        }

        // Dipakai seperti tag
        <Sapaan />
        `,
      ),
      table(
        ['Aturan', 'Kenapa'],
        [
          ['Nama diawali **huruf besar**', '`<sapaan />` dikira tag HTML tak dikenal'],
          ['Mengembalikan JSX, `null`, string, atau angka', '`undefined` menyebabkan error'],
          ['**Murni** — masukan sama, keluaran sama', 'React boleh memanggilnya kapan saja'],
          [
            'Tidak mengubah apa pun di luar dirinya saat render',
            'Efek samping punya tempatnya sendiri',
          ],
        ],
      ),

      h2('Kemurnian bukan formalitas'),
      code(
        'tsx',
        `
        // SALAH: mengubah sesuatu di luar dirinya saat render
        let hitungan = 0;
        function Buruk() {
          hitungan++;                          // efek samping saat render
          document.title = 'Halo';             // menyentuh dunia luar
          return <p>{hitungan}</p>;
        }

        // BENAR: hanya menghitung dan mengembalikan
        function Baik({ hitungan }) {
          return <p>{hitungan}</p>;
        }
        `,
      ),
      callout(
        'warning',
        'Kenapa React menuntut kemurnian',
        'React berhak memanggil komponenmu **lebih dari sekali**, menundanya, atau membatalkannya di tengah jalan — itulah dasar `useTransition` dan Suspense. Komponen yang punya efek samping saat render menghasilkan hasil berbeda tiap kali dipanggil, dan bug seperti itu muncul acak. StrictMode memanggil dua kali justru untuk membongkarnya lebih awal.',
      ),

      h2('Apa yang terjadi saat render'),
      ol(
        '**Memicu** — render pertama, atau `setState` dipanggil.',
        '**Render** — React memanggil fungsi komponenmu. Hasilnya objek deskripsi, bukan DOM.',
        '**Rekonsiliasi** — React membandingkan deskripsi baru dengan yang lama.',
        '**Commit** — hanya perbedaannya yang diterapkan ke DOM sungguhan.',
        '**Paint** — browser menggambar.',
      ),
      code(
        'tsx',
        `
        function Kartu({ judul }) {
          console.log('render:', judul);    // tercetak setiap render
          return <h3>{judul}</h3>;
        }
        `,
        {
          caption: 'Menaruh log di badan komponen adalah cara tercepat melihat kapan ia dirender.',
        },
      ),
      callout(
        'info',
        'Render tidak berarti DOM berubah',
        'React bisa memanggil komponenmu, mendapati hasilnya sama persis, lalu **tidak menyentuh DOM sama sekali**. "Render ulang" jauh lebih murah daripada yang dibayangkan banyak orang — dan itu sebabnya optimasi prematur di React sering menyelesaikan masalah yang tidak ada.',
      ),

      h2('Menyusun komponen'),
      code(
        'tsx',
        `
        function Halaman() {
          return (
            <main>
              <Header />
              <DaftarProduk />
              <Footer />
            </main>
          );
        }
        `,
      ),
      p(
        'Pohon komponen inilah yang React telusuri saat merender: dari akar ke bawah, berhenti di cabang yang tidak berubah.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Komponen adalah fungsi yang mengembalikan deskripsi tampilan.',
        'Nama wajib huruf besar; mengembalikan `undefined` adalah error.',
        'Komponen harus murni — React boleh memanggilnya berkali-kali.',
        'Render menghasilkan objek deskripsi; commit yang menyentuh DOM.',
        'Render ulang tidak selalu berarti DOM berubah.',
      ),
      references(
        {
          label: 'Your First Component',
          href: 'https://react.dev/learn/your-first-component',
          source: 'React',
          note: 'Aturan penamaan huruf besar dan kenapa komponen dipakai seperti tag.',
        },
        {
          label: 'Render and Commit',
          href: 'https://react.dev/learn/render-and-commit',
          source: 'React',
          note: 'Pembagian dua tahap yang menjelaskan kenapa render ulang tidak selalu mengubah DOM.',
        },
        {
          label: 'Keeping Components Pure',
          href: 'https://react.dev/learn/keeping-components-pure',
          source: 'React',
          note: 'Syarat kemurnian yang diwajibkan React, beserta apa yang terjadi kalau dilanggar.',
        },
        {
          label: 'createRoot',
          href: 'https://react.dev/reference/react-dom/client/createRoot',
          source: 'React',
          note: 'Satu-satunya titik tempat React menempel ke DOM asli.',
        },
      ),
    ],
  ),

  written(
    'props',
    'Props: mengalirkan data ke bawah',
    11,
    'Kontrak masuk sebuah komponen — dan kenapa ia hanya-baca.',
    [
      terms(
        {
          term: 'props',
          meaning:
            'Singkatan *properties*. Satu objek berisi seluruh data yang dikirim **dari komponen induk ke anaknya**. Sifat terpentingnya: props bersifat **hanya-baca**. Mengubahnya dari dalam komponen anak tidak akan memberi tahu induknya apa pun, dan React memang melarangnya.',
        },
        {
          term: 'aliran satu arah',
          meaning:
            'Terjemahan dari *one-way data flow*. Data hanya mengalir **ke bawah** — dari induk ke anak, tidak pernah sebaliknya. Terdengar membatasi, tapi justru inilah yang membuat penelusuran bug mungkin: kalau sebuah nilai salah, kamu tahu pasti asalnya dari atas.',
        },
        {
          term: 'callback prop',
          meaning:
            'Fungsi yang dikirim induk ke anak agar anak bisa **memberi kabar ke atas**. Karena data hanya mengalir turun, inilah satu-satunya cara anak memengaruhi induknya — bukan dengan mengubah props, melainkan dengan memanggil fungsi yang induknya sediakan.',
        },
        {
          term: 'prop drilling',
          meaning:
            'Terjemahan bebasnya **pengeboran prop**. Keadaan ketika sebuah data harus dioper melewati banyak lapisan komponen yang **tidak memakainya sama sekali**, hanya untuk sampai ke tujuan di bawah. Dua jalan keluarnya dibahas di Sub-bab 2.8 (composition) dan bab berikutnya (context).',
        },
        {
          term: 'destructuring props',
          meaning:
            'Pola `function Profil({ nama, umur })` yang mengambil property langsung di daftar parameter. Persis destructuring object dari Sub-bab 1.11, diterapkan pada props — dan manfaat tambahannya: daftar parameter itu sekaligus menjadi **dokumentasi** prop apa saja yang dipakai.',
        },
        {
          term: 'nilai default',
          meaning:
            'Nilai cadangan untuk prop opsional, ditulis di destructuring: `{ umur = 0 }`. Ingat aturan dari Sub-bab 1.7 yang berlaku persis sama di sini — ia **hanya terpicu oleh `undefined`**, bukan oleh `null`.',
        },
        {
          term: 'spread props',
          meaning:
            'Meneruskan seluruh sisa props sekaligus dengan `{...sisanya}`. Berguna untuk komponen pembungkus, tapi punya biaya: pembaca tidak lagi bisa melihat prop apa saja yang sebenarnya diterima hanya dengan membaca komponennya.',
        },
        {
          term: 'immutable',
          meaning:
            'Artinya **tidak boleh diubah**. Props bersifat immutable dari sudut pandang penerimanya. Kalau sebuah nilai memang perlu berubah, ia bukan props — ia state, dan tempatnya di komponen yang memilikinya.',
        },
      ),

      h2('Dasar'),
      code(
        'tsx',
        `
        type Props = {
          nama: string;
          umur?: number;
          onKlik: () => void;
        };

        function Profil({ nama, umur = 0, onKlik }: Props) {
          return <button onClick={onKlik}>{nama} ({umur})</button>;
        }

        <Profil nama="Zum" onKlik={() => console.log('klik')} />
        `,
      ),

      h2('Props hanya-baca'),
      code(
        'tsx',
        `
        function Buruk({ items }) {
          items.push('baru');        // JANGAN — mengubah data milik induk
          return <ul>{items.map(...)}</ul>;
        }

        function Baik({ items, onTambah }) {
          return <button onClick={() => onTambah('baru')}>Tambah</button>;
        }
        `,
      ),
      callout(
        'danger',
        'Kenapa aturan ini menentukan segalanya',
        'Aliran data satu arah adalah yang membuat React bisa ditelusuri: kalau sebuah nilai salah, kamu menaikinya ke atas sampai ketemu sumbernya. Komponen yang menulis ke propsnya sendiri memutus rantai itu — dan React tidak akan memberi tahumu, karena ia tidak mengamati perubahan itu.',
      ),

      h2('Data turun, perubahan naik'),
      code(
        'tsx',
        `
        function Induk() {
          const [nilai, setNilai] = useState('');

          return <Anak nilai={nilai} onUbah={setNilai} />;
          //            ^data turun    ^perubahan naik
        }

        function Anak({ nilai, onUbah }) {
          return <input value={nilai} onChange={(e) => onUbah(e.target.value)} />;
        }
        `,
      ),

      h2('`children`'),
      code(
        'tsx',
        `
        function Panel({ judul, children }: { judul: string; children: React.ReactNode }) {
          return (
            <section className="rounded-lg border border-border p-4">
              <h2>{judul}</h2>
              {children}
            </section>
          );
        }

        <Panel judul="Pengaturan">
          <p>Isi apa pun di sini</p>
          <Tombol />
        </Panel>
        `,
      ),
      callout(
        'tip',
        '`children` adalah alat paling ampuh melawan prop drilling',
        'Alih-alih mengoper data melewati lima lapisan komponen, oper **komponennya** sebagai `children` dari tempat datanya berada. Dibahas tuntas di Bab 6.',
      ),

      h2('Meneruskan sisa props'),
      code(
        'tsx',
        `
        type Props = React.ComponentProps<'button'> & { varian?: 'utama' | 'hantu' };

        function Tombol({ varian = 'utama', className, ...sisa }: Props) {
          return <button className={\`\${KELAS[varian]} \${className ?? ''}\`} {...sisa} />;
        }

        // Semua atribut <button> asli tetap bekerja dan tetap bertipe
        <Tombol type="submit" disabled aria-label="Kirim" varian="hantu" />
        `,
      ),

      h2('Kesalahan yang sering terjadi'),
      code(
        'tsx',
        `
        <Tombol onClick={handleKlik()} />     // SALAH: dipanggil saat render
        <Tombol onClick={handleKlik} />       // BENAR: dioper
        <Tombol onClick={() => hapus(id)} />  // BENAR: butuh argumen

        <Kartu judul=judul />                 // SALAH: nilai JS butuh kurung kurawal
        <Kartu judul={judul} />               // BENAR

        <Kartu aktif="false" />               // SALAH: string "false" itu truthy
        <Kartu aktif={false} />               // BENAR
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Props hanya-baca — komponen tidak boleh mengubah yang diterimanya.',
        'Data turun lewat props; perubahan naik lewat callback.',
        '`children` menghindari prop drilling dengan mengoper komponen, bukan data.',
        '`...sisa` + `ComponentProps` meneruskan atribut HTML lengkap dengan tipenya.',
        '`onClick={fn()}` memanggil saat render; `onClick={fn}` mengoper.',
      ),
      references(
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Rujukan utama sub-bab ini, termasuk `children` dan penerusan props.',
        },
        {
          label: 'Keeping Components Pure',
          href: 'https://react.dev/learn/keeping-components-pure',
          source: 'React',
          note: 'Alasan props bersifat hanya-baca dan apa akibatnya kalau diubah.',
        },
        {
          label: 'Responding to Events',
          href: 'https://react.dev/learn/responding-to-events',
          source: 'React',
          note: 'Pembedaan mengoper fungsi dan memanggilnya — kesalahan nomor satu di sub-bab ini.',
        },
        {
          label: 'Sharing State Between Components',
          href: 'https://react.dev/learn/sharing-state-between-components',
          source: 'React',
          note: 'Pola callback prop untuk menyampaikan perubahan dari anak ke induk.',
        },
      ),
    ],
  ),

  written(
    'rendering-kondisional',
    'Rendering Kondisional',
    10,
    'Menampilkan sesuatu hanya bila perlu — dan jebakan yang menampilkan angka nol.',
    [
      terms(
        {
          term: 'rendering kondisional',
          meaning:
            'Terjemahannya **menampilkan berdasarkan syarat**. Tiga bentuknya punya kegunaan berbeda: `&&` untuk "tampil atau tidak sama sekali", ternary untuk "salah satu dari dua", dan `early return` untuk "seluruh komponen berubah bentuk".',
        },
        {
          term: 'early return',
          meaning:
            'Keluar dari komponen lebih awal dengan `return` sebelum JSX utamanya. Ini bentuk **paling terbaca** untuk keadaan yang mengubah seluruh tampilan — memuat, gagal, kosong. Menuliskannya sebagai ternary bertingkat menghasilkan kode yang benar tapi hampir mustahil dibaca ulang.',
        },
        {
          term: 'jebakan angka nol',
          meaning:
            'Bug paling terkenal di React. `{items.length && <Daftar />}` menampilkan **angka `0`** di layar saat daftarnya kosong — karena `0` falsy sehingga `&&` mengembalikannya, dan berbeda dari `false`, **angka nol benar-benar dirender**. Obatnya: ubah jadi boolean dulu dengan `items.length > 0 &&`.',
        },
        {
          term: 'nilai yang diabaikan',
          meaning:
            'React sengaja tidak menampilkan apa pun untuk `true`, `false`, `null`, dan `undefined`. Sifat inilah yang membuat pola `&&` bisa bekerja sama sekali. Perhatikan lagi bahwa `0` **tidak** termasuk daftar ini.',
        },
        {
          term: 'return null',
          meaning:
            'Cara sah menyatakan "komponen ini tidak menampilkan apa-apa". Berbeda dari mengembalikan `undefined`, yang justru merupakan **error** di React. Kalau sebuah komponen sering mengembalikan `null`, pertimbangkan memindahkan syaratnya ke induknya.',
        },
        {
          term: 'state mesin',
          meaning:
            'Terjemahan bebas dari *state machine*. Menyimpan keadaan sebagai **satu nilai berhingga** — `"memuat" | "gagal" | "berhasil"` — alih-alih beberapa boolean terpisah. Keunggulannya: kombinasi mustahil seperti "sedang memuat **dan** gagal sekaligus" menjadi tidak bisa ditulis.',
        },
        {
          term: 'empat keadaan UI',
          meaning:
            'Memuat, kosong, gagal, berhasil — persis yang kamu pelajari di Sub-bab 5.12 Frontend Basic. Rendering kondisional adalah alat untuk menampilkannya, dan `early return` adalah bentuk yang paling cocok untuk keempatnya.',
        },
        {
          term: 'ternary bertingkat',
          meaning:
            'Ternary di dalam ternary. Secara teknis sah, tapi menjadi tidak terbaca dengan sangat cepat — dan di dalam JSX yang sudah penuh kurung, ia jauh lebih buruk lagi. Kalau butuh lebih dari satu tingkat, pindahkan ke `early return` di atas JSX.',
        },
      ),

      h2('Tiga bentuk'),
      code(
        'tsx',
        `
        {sudahLogin && <Profil />}                      // tampil kalau true
        {sudahLogin ? <Profil /> : <TombolLogin />}     // salah satu

        function Halaman({ status }) {                  // early return
          if (status === 'memuat') return <Skeleton />;
          if (status === 'gagal') return <Error />;
          return <Konten />;
        }
        `,
      ),

      h2('Jebakan angka nol'),
      code(
        'tsx',
        `
        {items.length && <Daftar items={items} />}
        // Saat kosong: 0 && ... menghasilkan 0, dan React MERENDER angka 0 di layar

        {items.length > 0 && <Daftar items={items} />}    // BENAR
        {Boolean(items.length) && <Daftar items={items} />}
        `,
      ),
      callout(
        'danger',
        'Ini bug yang lolos review lebih sering daripada yang kamu duga',
        'Angka "0" yang muncul sendirian di halaman terlihat seperti kesalahan data, bukan kesalahan kode — jadi orang mencarinya di tempat yang salah. `false`, `null`, dan `undefined` diabaikan React; **`0` tidak**.',
      ),

      h2('Empat keadaan UI'),
      code(
        'tsx',
        `
        function DaftarTugas({ status, tugas, pesan, onCobaLagi }) {
          if (status === 'memuat') return <Skeleton baris={5} />;

          if (status === 'gagal') {
            return (
              <div role="alert">
                <p>{pesan}</p>
                <button onClick={onCobaLagi}>Coba lagi</button>
              </div>
            );
          }

          if (tugas.length === 0) {
            return (
              <div>
                <p>Belum ada tugas.</p>
                <button onClick={onTambah}>Tambah yang pertama</button>
              </div>
            );
          }

          return <ul>{tugas.map((t) => <Baris key={t.id} tugas={t} />)}</ul>;
        }
        `,
      ),
      callout(
        'info',
        'Early return membuat keempat keadaan terbaca berurutan',
        'Bandingkan dengan satu blok JSX berisi ternary bertingkat — versi ini bisa dibaca dari atas ke bawah, dan menambah keadaan kelima tidak menyentuh yang lain. Ini penerapan langsung dari sub-bab 1.5 Frontend Basic.',
      ),

      h2('Skeleton harus memesan ruang'),
      code(
        'tsx',
        `
        // SALAH: tinggi berubah saat data datang — halaman melompat
        {memuat ? <p>Memuat…</p> : <Daftar items={items} />}

        // BENAR: skeleton setinggi hasil akhirnya
        {memuat
          ? Array.from({ length: 5 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-md bg-raised" />)
          : items.map((i) => <Baris key={i.id} item={i} />)}
        `,
      ),

      h2('Menyembunyikan vs tidak merender'),
      code(
        'tsx',
        `
        <div className={terbuka ? '' : 'hidden'}>{isi}</div>
        // Tetap dirender: state di dalamnya bertahan, gambarnya tetap diunduh

        {terbuka && <div>{isi}</div>}
        // Tidak dirender: state di dalamnya HILANG saat ditutup
        `,
      ),
      p(
        'Keduanya benar untuk kasus berbeda. Untuk tab yang isinya berat, `hidden` mempertahankan posisi scroll dan isian form. Untuk modal, tidak merender lebih tepat — supaya keadaannya bersih setiap kali dibuka.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`length > 0 &&`, bukan `length &&` — `0` tetap dirender.',
        'Early return membuat empat keadaan UI terbaca berurutan.',
        'Skeleton harus memesan tinggi akhirnya supaya layout tidak melompat.',
        '`hidden` mempertahankan state; tidak merender menghapusnya.',
      ),
      references(
        {
          label: 'Conditional Rendering',
          href: 'https://react.dev/learn/conditional-rendering',
          source: 'React',
          note: 'Ketiga bentuk beserta peringatan resmi tentang jebakan `&&` dengan angka nol.',
        },
        {
          label: 'Preserving and Resetting State',
          href: 'https://react.dev/learn/preserving-and-resetting-state',
          source: 'React',
          note: 'Menjelaskan kenapa `hidden` mempertahankan state sementara tidak merender menghapusnya.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Anjuran memakai satu nilai berhingga alih-alih beberapa boolean yang bisa bertabrakan.',
        },
        {
          label: 'Cumulative Layout Shift (CLS)',
          href: 'https://web.dev/articles/cls',
          source: 'web.dev',
          note: 'Alasan skeleton wajib memesan tinggi akhirnya, bukan sekadar menampilkan teks "Memuat…".',
        },
      ),
    ],
  ),

  written(
    'rendering-list',
    'Rendering List & Kenapa `key` Penting',
    12,
    'Menampilkan banyak item dan menjaga identitasnya — sumber bug yang tampak mustahil.',
    [
      terms(
        {
          term: 'key',
          meaning:
            'Penanda **identitas** sebuah elemen di dalam daftar. Perlu ditegaskan apa yang ia **bukan**: ia bukan sekadar syarat formal untuk menghilangkan peringatan console. Ia adalah cara React menjawab pertanyaan "apakah elemen ini masih elemen yang sama seperti tadi?" — dan jawaban itu menentukan apakah state di dalamnya dipertahankan atau dibuang.',
        },
        {
          term: 'identitas',
          meaning:
            'Sesuatu yang **melekat pada data itu sendiri** dan tidak berubah sepanjang hidupnya — biasanya `id` dari database. Bedakan dari **posisi**, yang berubah setiap kali daftar diurutkan, disaring, atau disisipi. Inilah alasan indeks array bukan identitas.',
        },
        {
          term: 'indeks sebagai key',
          meaning:
            'Kesalahan yang gejalanya sangat aneh: teks yang sedang diketik **berpindah ke baris lain**, atau centang menempel di item yang salah setelah daftar diurutkan. Penyebabnya karena React mengira item di posisi 0 masih item yang sama, padahal isinya sudah berganti. Aman **hanya** kalau daftarnya tidak pernah berubah urutan, disaring, maupun disisipi.',
        },
        {
          term: 'unik di antara saudara',
          meaning:
            'Syarat sebenarnya sebuah `key`: ia hanya perlu unik **di dalam daftar yang sama**, bukan unik di seluruh aplikasi. Dua daftar berbeda boleh sama-sama memakai key `1`, dan itu tidak masalah sama sekali.',
        },
        {
          term: 'stabil',
          meaning:
            'Syarat kedua: key harus **sama pada tiap render** untuk item yang sama. Karena itu `key={Math.random()}` adalah kesalahan yang lebih buruk daripada tidak memberi key — setiap render menghasilkan key baru, sehingga React membuang dan membangun ulang seluruh daftar setiap kali.',
        },
        {
          term: 'reconciliation',
          meaning:
            'Proses React mencocokkan elemen lama dengan elemen baru untuk menentukan perubahan seminimal mungkin. `key` adalah **petunjuk utama** yang ia pakai dalam pencocokan itu — tanpa key, ia hanya bisa menebak berdasarkan urutan.',
        },
        {
          term: 'Fragment dengan key',
          meaning:
            'Ketika satu item daftar menghasilkan beberapa elemen sejajar, `<>` biasa tidak bisa diberi key. Pakai bentuk panjangnya: `<Fragment key={t.id}>`. Ini satu-satunya alasan bentuk panjang Fragment masih dibutuhkan.',
        },
        {
          term: 'daftar besar',
          meaning:
            'Daftar dengan ratusan atau ribuan baris. Merendernya sekaligus membuat halaman berat meski React sudah efisien — jalan keluarnya **virtualisasi**, yaitu hanya merender baris yang benar-benar terlihat di layar.',
        },
      ),

      h2('Dasar'),
      code(
        'tsx',
        `
        <ul>
          {tugas.map((t) => (
            <li key={t.id}>{t.judul}</li>
          ))}
        </ul>
        `,
      ),

      h2('Apa yang sebenarnya dilakukan `key`'),
      p(
        'Saat daftar berubah, React membandingkan daftar lama dan baru. `key` adalah **identitas** yang dipakainya untuk memutuskan: "ini item yang sama yang berubah isinya" atau "ini item yang berbeda".',
      ),
      code(
        'tsx',
        `
        // Sebelum: [A, B, C]   Sesudah: [Z, A, B, C]

        // Dengan key stabil:
        //   React melihat Z baru -> sisipkan SATU elemen. A, B, C tidak disentuh.

        // Dengan key = indeks:
        //   posisi 0: dulu A, sekarang Z -> "isinya berubah"
        //   posisi 1: dulu B, sekarang A -> "isinya berubah"
        //   posisi 2: dulu C, sekarang B -> "isinya berubah"
        //   posisi 3: baru C             -> sisipkan
        //   -> React mengubah EMPAT elemen, bukan satu
        `,
      ),

      h2('Bug yang tampak mustahil'),
      code(
        'tsx',
        `
        // Setiap baris punya input yang belum tersimpan
        {tugas.map((t, i) => (
          <li key={i}>
            <input defaultValue={t.judul} />
            <button onClick={() => hapus(t.id)}>Hapus</button>
          </li>
        ))}
        `,
      ),
      callout(
        'danger',
        'Yang terjadi kalau kamu menghapus baris pertama',
        'React mengira baris di posisi 0 "berubah isinya", jadi ia **mempertahankan elemen input yang sama** dan hanya mengganti propsnya. Tapi `defaultValue` hanya dipakai sekali — sehingga teks yang kamu ketik di baris pertama sekarang muncul di baris yang isinya milik item lain. Datanya benar; tampilannya berbohong.',
      ),
      code(
        'tsx',
        `
        {tugas.map((t) => (
          <li key={t.id}>          {/* identitas ikut berpindah bersama itemnya */}
            <input defaultValue={t.judul} />
          </li>
        ))}
        `,
      ),

      h2('Memilih `key`'),
      table(
        ['Sumber', 'Boleh?'],
        [
          ['`item.id` dari database', '**Terbaik**'],
          ['`crypto.randomUUID()` saat item dibuat', 'Baik'],
          ['Gabungan field yang unik', 'Boleh kalau benar-benar unik'],
          [
            'Indeks array',
            'Hanya kalau daftar **tidak pernah** berubah urutan, disisipi, atau disaring',
          ],
          ['`Math.random()`', '**Tidak pernah** — key baru tiap render, semua dibuat ulang'],
        ],
      ),
      callout(
        'warning',
        'Kapan indeks benar-benar aman',
        'Kalau daftarnya statis, tidak pernah diurutkan ulang, tidak pernah disisipi di tengah, dan itemnya tidak punya state internal. Kalau salah satu saja tidak terpenuhi, pakai id.',
      ),

      h2('`key` bersifat lokal'),
      code(
        'tsx',
        `
        // key hanya perlu unik di antara SAUDARANYA, bukan di seluruh aplikasi
        <ul>{a.map((x) => <li key={x.id}>{x.nama}</li>)}</ul>
        <ul>{b.map((x) => <li key={x.id}>{x.nama}</li>)}</ul>   // id yang sama pun tidak masalah
        `,
      ),

      h2('`key` untuk memaksa reset'),
      code(
        'tsx',
        `
        // Mengganti key membuat React MEMBUANG komponen lama dan membuat yang baru,
        // beserta seluruh state di dalamnya
        <FormProfil key={penggunaId} pengguna={pengguna} />

        // Tanpa key: pindah ke pengguna lain akan MEMPERTAHANKAN isian form sebelumnya
        `,
      ),
      callout(
        'tip',
        'Ini teknik yang sah dan sering menyelamatkan',
        'Alih-alih menulis `useEffect` yang mereset lima state saat props berubah, ganti `key`-nya. Satu baris, tanpa efek, dan tidak mungkin ada state yang terlewat direset.',
      ),

      h2('Fragment dengan key'),
      code(
        'tsx',
        `
        import { Fragment } from 'react';

        {items.map((i) => (
          <Fragment key={i.id}>
            <dt>{i.istilah}</dt>
            <dd>{i.arti}</dd>
          </Fragment>
        ))}
        `,
        { caption: 'Bentuk pendek `<>` tidak bisa menerima key.' },
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`key` adalah identitas yang dipakai React untuk mencocokkan item lama dan baru.',
        'Indeks sebagai key membuat state internal berpindah ke baris yang salah.',
        'Pakai id yang ikut berpindah bersama itemnya.',
        '`key` hanya perlu unik di antara saudaranya.',
        'Mengganti `key` adalah cara bersih memaksa reset seluruh state komponen.',
      ),
      references(
        {
          label: 'Rendering Lists',
          href: 'https://react.dev/learn/rendering-lists',
          source: 'React',
          note: 'Bagian "Why does React need keys?" — penjelasan resmi paling langsung soal identitas.',
        },
        {
          label: 'Preserving and Resetting State',
          href: 'https://react.dev/learn/preserving-and-resetting-state',
          source: 'React',
          note: 'Termasuk teknik mengganti `key` untuk memaksa reset seluruh state komponen.',
        },
        {
          label: '<Fragment> (<>)',
          href: 'https://react.dev/reference/react/Fragment',
          source: 'React',
          note: 'Kapan bentuk panjangnya wajib dipakai — yaitu saat butuh `key`.',
        },
        {
          label: 'react/jsx-key',
          href: 'https://react.dev/reference/rules/rules-of-hooks',
          source: 'React',
          note: 'Aturan yang ditegakkan lint untuk menangkap daftar tanpa `key` sebelum sampai ke browser.',
        },
      ),
    ],
  ),

  written(
    'styling-react',
    'Styling di React',
    10,
    'Beberapa pendekatan, dan kriteria memilih yang tidak berdasarkan selera.',
    [
      terms(
        {
          term: 'CSS Module',
          meaning:
            'Berkas CSS biasa berakhiran `.module.css` yang **nama class-nya diacak otomatis** saat build, sehingga mustahil bertabrakan dengan berkas lain. Kelebihannya: kamu menulis CSS biasa. Kekurangannya: setiap komponen jadi butuh dua berkas yang harus dibuka bergantian.',
        },
        {
          term: 'scoping',
          meaning:
            'Terjemahannya **pembatasan jangkauan**. Jaminan bahwa style sebuah komponen **tidak bisa bocor** ke komponen lain. Ini masalah inti yang dipecahkan semua pendekatan di sub-bab ini — masing-masing dengan cara berbeda.',
        },
        {
          term: 'CSS-in-JS',
          meaning:
            'Pendekatan menulis style di dalam berkas JavaScript, seperti styled-components dan Emotion. Sempat sangat populer, kini banyak ditinggalkan karena **biaya saat program berjalan**: style harus dihitung dan disisipkan di browser, dan itu bertabrakan dengan Server Component yang berjalan tanpa browser sama sekali.',
        },
        {
          term: 'runtime cost',
          meaning:
            'Terjemahannya **biaya saat berjalan**. Pekerjaan yang harus dilakukan browser **setiap kali** halaman dibuka. Tailwind dan CSS Module memindahkan hampir seluruh pekerjaannya ke tahap build, sehingga biaya ini nyaris nol.',
        },
        {
          term: 'zero-runtime',
          meaning:
            'Terjemahannya **tanpa biaya saat berjalan**. Sebutan untuk pendekatan yang menghasilkan CSS statis di tahap build. Ini yang membuat Tailwind dan CSS Module tetap bekerja mulus di Server Component, sementara CSS-in-JS klasik tidak.',
        },
        {
          term: 'CSS global',
          meaning:
            'Berkas CSS yang berlaku untuk **seluruh aplikasi**. Bukan berarti selalu salah — reset, token, dan gaya dasar elemen memang tempatnya di sini. Yang bermasalah adalah menaruh style **komponen** di dalamnya, karena di situlah tabrakan nama dan CSS mati bermula.',
        },
        {
          term: 'clsx / cn',
          meaning:
            'Fungsi pembantu untuk **menyusun nama class secara bersyarat**: `cn("dasar", aktif && "bg-primary")`. Menggantikan penyambungan teks manual yang mudah menghasilkan spasi ganda atau kata `false` yang ikut masuk ke atribut.',
        },
        {
          term: 'kriteria memilih',
          meaning:
            'Sub-bab ini menolak memilih berdasarkan selera. Tiga pertanyaan yang menentukan: apakah project sudah punya pilihan (**ikuti yang ada**), apakah kamu memakai Server Component (**hindari CSS-in-JS**), dan apakah timnya lebih nyaman dengan CSS biasa (**CSS Module masuk akal**).',
        },
      ),

      h2('Pilihan yang ada'),
      table(
        ['Pendekatan', 'Kelebihan', 'Kekurangan'],
        [
          ['**Tailwind**', 'Tidak ada penamaan, style ikut komponen', 'Markup panjang'],
          ['**CSS Module**', 'CSS biasa, scope otomatis', 'Dua berkas per komponen'],
          ['**CSS-in-JS**', 'Style dinamis dari props', 'Biaya runtime, banyak yang ditinggalkan'],
          ['**CSS global**', 'Sederhana', 'Tabrakan nama, tidak bisa dihapus dengan yakin'],
        ],
      ),

      h2('CSS Module'),
      code(
        'css',
        `
        .kartu { border: 1px solid var(--color-border); padding: 1rem; }
        .aktif { border-color: var(--color-primary); }
        `,
        { filename: 'Kartu.module.css' },
      ),
      code(
        'tsx',
        `
        import gaya from './Kartu.module.css';

        <div className={\`\${gaya.kartu} \${aktif ? gaya.aktif : ''}\`} />
        // Nama class jadi unik saat build: 'Kartu_kartu__x7f2a'
        `,
      ),

      h2('Class kondisional'),
      code(
        'tsx',
        `
        import { clsx } from 'clsx';

        <div
          className={clsx(
            'rounded-md border p-4',
            aktif && 'border-primary',
            nonaktif && 'opacity-50',
            { 'bg-danger-fill': gagal },
          )}
        />
        `,
      ),
      callout(
        'danger',
        'Nama class yang disusun dinamis tidak akan terdeteksi Tailwind',
        'Tailwind memindai **teks sumber**, bukan menjalankan kodemu. `bg-${warna}-500` tidak pernah muncul sebagai teks utuh, jadi class-nya tidak pernah dihasilkan. Pakai peta berisi nama lengkap.',
      ),
      code(
        'tsx',
        `
        const WARNA = {
          sukses: 'bg-accent-fill text-accent',
          gagal: 'bg-danger-fill text-danger',
        } as const;

        <div className={WARNA[status]} />
        `,
      ),

      h2('Style inline: hanya untuk nilai yang dihitung'),
      code(
        'tsx',
        `
        // Tepat — nilainya baru diketahui saat berjalan
        <div style={{ width: \`\${persen}%\` }} />
        <div style={{ transform: \`translateY(\${offset}px)\` }} />

        // Tidak tepat — ini milik CSS
        <div style={{ padding: 16, borderRadius: 8, color: '#666' }} />
        `,
      ),

      h2('Kriteria memilih'),
      ol(
        '**Ikuti yang sudah dipakai project.** Konsistensi mengalahkan preferensi — dua sistem styling dalam satu project adalah yang terburuk.',
        '**Project baru:** Tailwind kalau kamu nyaman dengan utility; CSS Module kalau tim lebih kuat di CSS.',
        '**Hindari CSS-in-JS runtime** di project baru — banyak yang beralih karena biaya runtime dan ketidakcocokan dengan Server Component.',
        '**Apa pun pilihannya, kunci token.** Nilai warna dan spacing yang tersebar adalah masalah yang sama di sistem mana pun.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Konsistensi dalam satu project mengalahkan preferensi pribadi.',
        'CSS Module memberi scope otomatis dengan CSS biasa.',
        '`clsx` untuk class kondisional; nama class dinamis tidak terdeteksi Tailwind.',
        'Style inline hanya untuk nilai yang dihitung saat berjalan.',
        'Kunci design token apa pun sistem styling yang dipakai.',
      ),
      references(
        {
          label: 'CSS Modules',
          href: 'https://nextjs.org/docs/app/getting-started/css',
          source: 'Next.js',
          note: 'Dukungan bawaan CSS Module beserta aturan penamaan berkasnya.',
        },
        {
          label: 'Styling with utility classes',
          href: 'https://tailwindcss.com/docs/styling-with-utility-classes',
          source: 'Tailwind CSS',
          note: 'Pendekatan yang dipakai project ini, dibahas tuntas di Bab 1.',
        },
        {
          label: 'CSS Modules — Vite',
          href: 'https://vite.dev/guide/features#css-modules',
          source: 'Vite',
          note: 'Cara kerja pengacakan nama class yang membuat scoping otomatis mungkin.',
        },
        {
          label: 'Server Components',
          href: 'https://react.dev/reference/rsc/server-components',
          source: 'React',
          note: 'Alasan CSS-in-JS berbasis runtime bertabrakan dengan arah React sekarang.',
        },
      ),
    ],
  ),

  written(
    'composition-children',
    'Composition & `children`',
    12,
    'Menyusun komponen dari komponen lain — jalan keluar dari prop drilling.',
    [
      terms(
        {
          term: 'composition',
          meaning:
            'Terjemahannya **penyusunan**. Membangun tampilan dengan **merakit komponen dari komponen lain** alih-alih menambah prop. Ini jawaban React untuk hal-hal yang di dunia OOP diselesaikan dengan pewarisan — dan alasannya sama dengan Sub-bab 2.10 Frontend Basic: merakit jauh lebih lentur daripada mewarisi.',
        },
        {
          term: 'children',
          meaning:
            'Prop khusus berisi **apa pun yang ditulis di antara tag pembuka dan penutup** sebuah komponen. Kekuatannya sering diremehkan: dengan `children`, komponen pembungkus **tidak perlu tahu apa pun** tentang isi yang ia bungkus.',
        },
        {
          term: 'ledakan prop',
          meaning:
            'Terjemahan dari *prop explosion*. Komponen yang props-nya terus bertambah setiap ada kebutuhan baru — `judul`, `ikonJudul`, `tombolPrimer`, `warnaTombol`. Gejalanya khas: setiap fitur baru berarti **mengedit komponen lama**, dan itu tanda composition-nya belum dipakai.',
        },
        {
          term: 'prop drilling',
          meaning:
            'Data yang harus dioper melewati banyak lapisan yang tidak memakainya. Composition menyelesaikan sebagian besar kasusnya dengan cara yang mengejutkan sederhana: **oper komponennya, bukan datanya** — sehingga lapisan di tengah tidak perlu tahu apa-apa.',
        },
        {
          term: 'slot',
          meaning:
            'Terjemahannya **lubang isian**. Prop yang isinya berupa JSX, misalnya `header` atau `footer`. Berguna ketika sebuah komponen butuh **beberapa** tempat isian sekaligus — karena `children` hanya menyediakan satu.',
        },
        {
          term: 'compound component',
          meaning:
            'Terjemahannya **komponen majemuk**. Sekelompok komponen yang dirancang untuk dipakai bersama: `<Modal><Modal.Header/><Modal.Body/></Modal>`. Bentuk composition yang paling lentur, dan pola yang dipakai hampir semua pustaka komponen modern.',
        },
        {
          term: 'container / presentational',
          meaning:
            'Pembagian lama antara komponen yang **mengurus data** dan yang **hanya menampilkan**. Sudah tidak dianjurkan sebagai aturan kaku sejak adanya hooks, tapi gagasan intinya tetap berguna: komponen yang tidak tahu dari mana datanya datang jauh lebih mudah dipakai ulang dan diuji.',
        },
        {
          term: 'inversion of control',
          meaning:
            'Terjemahannya **pembalikan kendali**. Dengan `children`, **pemakai komponen** yang memutuskan apa isinya, bukan penulis komponennya. Inilah alasan mendasar kenapa composition tidak pernah membutuhkan prop baru untuk kebutuhan yang belum terpikirkan.',
        },
      ),

      h2('Masalah: props yang terus bertambah'),
      code(
        'tsx',
        `
        // Setiap kebutuhan baru menambah satu prop
        <Modal
          judul="Hapus?"
          isi="Yakin?"
          tombolPrimer="Hapus"
          tombolSekunder="Batal"
          ikonJudul={<Warning />}
          adaFooter
          footerKiri={<Checkbox />}
          onPrimer={...}
          onSekunder={...}
        />
        `,
      ),
      code(
        'tsx',
        `
        // Composition: strukturnya terbaca langsung dari pemakaiannya
        <Modal>
          <Modal.Header>
            <Warning /> Hapus?
          </Modal.Header>

          <Modal.Body>Yakin?</Modal.Body>

          <Modal.Footer>
            <Checkbox /> Jangan tanya lagi
            <Button variant="hantu">Batal</Button>
            <Button variant="danger">Hapus</Button>
          </Modal.Footer>
        </Modal>
        `,
      ),

      h2('Prop drilling'),
      code(
        'tsx',
        `
        // pengguna melewati tiga lapisan yang tidak memakainya sama sekali
        <Halaman pengguna={pengguna}>
          <Sidebar pengguna={pengguna}>
            <Menu pengguna={pengguna}>
              <Avatar pengguna={pengguna} />
        `,
      ),
      code(
        'tsx',
        `
        // Composition: komponen yang butuh data dirakit DI TEMPAT datanya ada
        function Halaman() {
          const pengguna = usePengguna();

          return (
            <Layout
              sidebar={
                <Sidebar>
                  <Menu>
                    <Avatar pengguna={pengguna} />
                  </Menu>
                </Sidebar>
              }
            />
          );
        }
        // Layout, Sidebar, dan Menu tidak perlu tahu apa pun tentang pengguna
        `,
      ),
      callout(
        'tip',
        'Coba composition sebelum menjangkau Context',
        'Prop drilling sering dijawab dengan Context, padahal composition lebih sederhana dan tidak menambah re-render. Context tepat untuk nilai yang dibutuhkan **banyak cabang berjauhan** — tema, bahasa, pengguna aktif.',
      ),

      h2('Slot lewat props'),
      code(
        'tsx',
        `
        type Props = {
          kiri?: React.ReactNode;
          kanan?: React.ReactNode;
          children: React.ReactNode;
        };

        function Toolbar({ kiri, kanan, children }: Props) {
          return (
            <div className="flex items-center gap-3">
              {kiri}
              <div className="flex-1">{children}</div>
              {kanan}
            </div>
          );
        }

        <Toolbar kiri={<Logo />} kanan={<Avatar />}>
          <Pencarian />
        </Toolbar>
        `,
      ),

      h2('Compound component'),
      code(
        'tsx',
        `
        function Kartu({ children }: { children: React.ReactNode }) {
          return <article className="rounded-lg border border-border">{children}</article>;
        }

        Kartu.Header = function Header({ children }) {
          return <div className="border-b border-border p-4">{children}</div>;
        };

        Kartu.Body = function Body({ children }) {
          return <div className="p-4">{children}</div>;
        };

        <Kartu>
          <Kartu.Header>Judul</Kartu.Header>
          <Kartu.Body>Isi</Kartu.Body>
        </Kartu>
        `,
      ),
      p('Versi yang berbagi state lewat Context — dan kapan pola ini sepadan — dibahas di Bab 6.'),

      h2('Kapan composition berlebihan'),
      callout(
        'warning',
        'Jangan memecah komponen yang belum menyakitkan',
        'Komponen dengan tiga prop yang jelas lebih baik daripada compound component dengan lima bagian yang harus dirakit setiap kali dipakai. Composition menyelesaikan masalah **props yang meledak** dan **prop drilling** — kalau keduanya belum terjadi, ia hanya menambah lapisan.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Composition menggantikan props yang terus bertambah dengan struktur yang terbaca.',
        'Prop drilling sering selesai dengan composition, tanpa perlu Context.',
        'Slot lewat props berguna saat posisinya harus ditentukan komponen induk.',
        'Compound component memberi API yang terbaca dari markup.',
        'Jangan memecah sebelum masalahnya benar-benar terasa.',
      ),
      references(
        {
          label: 'Passing JSX as children',
          href: 'https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children',
          source: 'React',
          note: 'Mekanisme dasar composition — mengoper komponen alih-alih menambah prop.',
        },
        {
          label: 'Extracting Components',
          href: 'https://react.dev/learn/your-first-component#nesting-and-organizing-components',
          source: 'React',
          note: 'Kapan sebuah komponen layak dipecah, dan kapan justru terlalu dini.',
        },
        {
          label: 'Passing Data Deeply with Context',
          href: 'https://react.dev/learn/passing-data-deeply-with-context',
          source: 'React',
          note: 'Menegaskan bahwa composition sebaiknya dicoba lebih dulu sebelum Context.',
        },
        {
          label: 'Thinking in React',
          href: 'https://react.dev/learn/thinking-in-react',
          source: 'React',
          note: 'Langkah memecah rancangan menjadi hierarki komponen yang masuk akal.',
        },
      ),
    ],
  ),

  written(
    'virtual-dom',
    'Virtual DOM & Reconciliation',
    12,
    'Apa yang sebenarnya dilakukan React di balik layar — dan apa yang sering dilebih-lebihkan.',
    [
      terms(
        {
          term: 'Virtual DOM',
          meaning:
            'Terjemahannya **DOM maya**. Gambaran struktur tampilan yang disimpan React di memori sebagai **object JavaScript biasa** — jauh lebih murah dibuat dan dibandingkan daripada elemen DOM sungguhan. Perlu diluruskan: ia **bukan** teknologi rahasia, hanya object bersarang seperti yang kamu lihat di Sub-bab 6.4 Frontend Basic.',
        },
        {
          term: 'reconciliation',
          meaning:
            'Terjemahannya **pencocokan**. Proses React membandingkan gambaran lama dengan gambaran baru untuk menentukan **perubahan seminimal mungkin** yang perlu diterapkan ke DOM. Dua petunjuk utamanya: jenis elemen dan `key`.',
        },
        {
          term: 'diffing',
          meaning:
            'Terjemahannya **pencarian perbedaan**. Algoritma di dalam reconciliation. Ia sengaja memakai dua asumsi penyederhana: elemen dengan **jenis berbeda menghasilkan pohon berbeda**, dan `key` menandai elemen yang tetap sama antar-render. Tanpa dua asumsi itu, pencocokan sempurna akan terlalu mahal untuk dilakukan tiap render.',
        },
        {
          term: 'klaim yang menyesatkan',
          meaning:
            '"Virtual DOM lebih cepat daripada DOM" — ini **tidak benar** dan layak diluruskan. Menyentuh DOM tetap sama mahalnya. Yang React lakukan adalah **menyentuhnya lebih sedikit**, secara otomatis. DOM manual yang ditulis dengan sangat hati-hati justru bisa lebih cepat; yang React beli untukmu adalah kecepatan yang **wajar tanpa perlu melacaknya sendiri**.',
        },
        {
          term: 'Fiber',
          meaning:
            'Nama arsitektur internal React sejak versi 16. Kemampuan utamanya: pekerjaan render bisa **dipecah dan dijeda** di tengah jalan, sehingga tugas mendesak seperti ketikan pengguna tidak perlu menunggu render besar selesai.',
        },
        {
          term: 'batching',
          meaning:
            'Terjemahannya **penggabungan**. Beberapa perubahan state yang terjadi berdekatan digabung menjadi **satu** render. Sejak React 18 ini berlaku otomatis di mana pun — termasuk di dalam `setTimeout` dan penangan Promise, yang sebelumnya tidak ikut digabung.',
        },
        {
          term: 'render ulang',
          meaning:
            'React memanggil ulang fungsi komponenmu. Yang wajib dipahami: **render ulang tidak berarti DOM berubah**. Kalau hasil gambarannya sama, tidak ada satu pun elemen yang disentuh — sehingga "komponen ini render 20 kali" belum tentu masalah.',
        },
        {
          term: 'optimasi prematur',
          meaning:
            'Membungkus segalanya dengan `memo` tanpa pernah mengukur. Biayanya nyata: perbandingan props juga memakan waktu, dan kodenya jadi lebih sulit dibaca. Aturan yang berlaku sejak Frontend Basic tetap sama — **ukur dulu dengan Profiler**, baru optimalkan.',
        },
        {
          term: 'React DevTools Profiler',
          meaning:
            'Alat resmi untuk **mengukur** komponen mana yang benar-benar sering render dan berapa lama. Inilah yang memisahkan optimasi yang berdasar dari tebakan — dan hampir selalu menunjukkan bahwa dugaan awalmu salah sasaran.',
        },
      ),

      h2('Bukan "DOM virtual lebih cepat dari DOM"'),
      p(
        'Klaim itu menyesatkan. Menyentuh DOM tetap operasi yang sama mahalnya. Yang React lakukan adalah **menyentuhnya lebih sedikit** — dan melakukannya secara otomatis, tanpa kamu harus melacak apa yang berubah.',
      ),
      code(
        'js',
        `
        // DOM manual yang ditulis dengan hati-hati bisa LEBIH cepat dari React,
        // karena ia tahu persis satu elemen mana yang berubah.
        //
        // Yang React beli untukmu bukan kecepatan mentah —
        // melainkan kecepatan yang WAJAR tanpa harus melacaknya sendiri.
        `,
      ),

      h2('Prosesnya'),
      ol(
        'Komponen dipanggil, menghasilkan pohon objek deskripsi (elemen React).',
        'React membandingkannya dengan pohon dari render sebelumnya.',
        'Perbedaannya dikumpulkan jadi daftar perubahan minimum.',
        'Daftar itu diterapkan ke DOM sungguhan dalam satu tahap commit.',
      ),

      h2('Dua aturan pembandingan'),
      code(
        'tsx',
        `
        // Aturan 1: TIPE yang berbeda -> buang seluruh subpohon, bangun baru
        {kondisi ? <div><Form /></div> : <span><Form /></span>}
        // div -> span: Form DIBONGKAR dan dibuat ulang, seluruh state-nya hilang

        // Aturan 2: tipe sama -> pertahankan elemen, perbarui propsnya saja
        <div className="a" />  ->  <div className="b" />
        // Elemen DOM yang sama, hanya className yang diubah
        `,
      ),
      callout(
        'danger',
        'Komponen yang didefinisikan di dalam komponen lain',
        'Ini bug yang gejalanya sangat membingungkan: input kehilangan fokus setiap ketikan.',
      ),
      code(
        'tsx',
        `
        // SALAH: Baris adalah fungsi BARU setiap render induknya
        function Halaman() {
          function Baris({ item }) {          // referensi berbeda tiap render
            return <input defaultValue={item.nama} />;
          }
          return items.map((i) => <Baris key={i.id} item={i} />);
        }
        // React melihat "tipe komponen berbeda" -> bongkar dan bangun ulang tiap render
        // -> fokus hilang setiap ketikan

        // BENAR: definisikan di luar
        function Baris({ item }) {
          return <input defaultValue={item.nama} />;
        }
        `,
      ),

      h2('Posisi juga identitas'),
      code(
        'tsx',
        `
        {kondisi ? <Counter /> : <Counter />}
        // Posisinya sama, tipenya sama -> React MEMPERTAHANKAN state-nya.
        // Berganti kondisi tidak mereset counter — sering mengejutkan.

        {kondisi ? <Counter key="a" /> : <Counter key="b" />}
        // key berbeda -> dianggap komponen berbeda -> state di-reset
        `,
      ),

      h2('Apa yang tidak perlu kamu optimasi'),
      callout(
        'info',
        'Render ulang tidak otomatis berarti masalah',
        'Komponen yang dirender ulang tapi menghasilkan output yang sama **tidak menyentuh DOM sama sekali**. Membungkus semuanya dengan `memo` sering menambah biaya perbandingan tanpa menghemat apa pun. Ukur dulu dengan React DevTools Profiler — dan di React 19 dengan React Compiler, sebagian besarnya sudah otomatis.',
      ),

      h2('Yang benar-benar berdampak'),
      ol(
        '`key` yang stabil — mencegah pembongkaran yang tidak perlu.',
        'Jangan mendefinisikan komponen di dalam komponen.',
        'Jangan mengubah tipe elemen tanpa alasan (`div` ↔ `span`).',
        'Untuk daftar sangat panjang (>200 baris), virtualisasi — bukan memoisasi.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'React tidak lebih cepat dari DOM — ia menyentuh DOM lebih sedikit, secara otomatis.',
        'Tipe berbeda membongkar seluruh subpohon beserta state-nya.',
        'Komponen yang didefinisikan di dalam komponen dibongkar setiap render.',
        'Posisi dan tipe yang sama membuat state dipertahankan; `key` mengubah itu.',
        'Ukur sebelum memoisasi — render ulang sering tidak menyentuh DOM.',
      ),
      references(
        {
          label: 'Preserving and Resetting State',
          href: 'https://react.dev/learn/preserving-and-resetting-state',
          source: 'React',
          note: 'Aturan posisi dan tipe yang menentukan kapan state dipertahankan atau dibuang.',
        },
        {
          label: 'Render and Commit',
          href: 'https://react.dev/learn/render-and-commit',
          source: 'React',
          note: 'Menegaskan bahwa render ulang tidak otomatis berarti DOM ikut berubah.',
        },
        {
          label: 'Queueing a Series of State Updates',
          href: 'https://react.dev/learn/queueing-a-series-of-state-updates',
          source: 'React',
          note: 'Cara React menggabungkan beberapa perubahan state menjadi satu render.',
        },
        {
          label: 'React Developer Tools',
          href: 'https://react.dev/learn/react-developer-tools',
          source: 'React',
          note: 'Profiler yang memisahkan optimasi berdasar dari tebakan.',
        },
      ),
    ],
  ),

  written(
    'react-compiler',
    'React Compiler dan artinya bagi memoization',
    11,
    'Perubahan besar di React 19 yang mengurangi kebutuhan `useMemo` dan `useCallback` manual.',
    [
      p(
        'Selama bertahun-tahun, "optimasi React" berarti menaburkan `useMemo`, `useCallback`, dan `memo`. React Compiler mengubah itu: ia menganalisis komponenmu saat build dan menyisipkan memoisasi yang diperlukan secara otomatis.',
      ),

      terms(
        {
          term: 'React Compiler',
          meaning:
            'Alat yang **menganalisis komponenmu saat build** lalu menyisipkan memoisasi yang diperlukan secara otomatis. Perubahannya besar: selama bertahun-tahun "optimasi React" berarti menaburkan `useMemo` dan `useCallback` dengan tangan, dan compiler menghapus sebagian besar pekerjaan itu.',
        },
        {
          term: 'memoization',
          meaning:
            'Dibaca "me-mo-i-sei-syen", terjemahannya **penyimpanan hasil**. Mengingat hasil sebuah perhitungan agar tidak dihitung ulang selama masukannya tidak berubah. Perlu diingat: ia **tidak gratis** — perbandingan masukan juga memakan waktu dan memori, dan itulah kenapa memoisasi yang ditaburkan sembarangan justru merugikan.',
        },
        {
          term: 'useMemo',
          meaning:
            'Hook yang mengingat **hasil sebuah perhitungan**. Dipakai saat perhitungannya benar-benar mahal, atau saat hasilnya berupa object atau array yang identitasnya harus tetap stabil antar-render.',
        },
        {
          term: 'useCallback',
          meaning:
            'Hook yang mengingat **sebuah fungsi**. Sebenarnya bentuk khusus dari `useMemo` — `useCallback(fn, deps)` sama persis dengan `useMemo(() => fn, deps)`. Gunanya menjaga identitas fungsi tetap sama agar komponen anak yang di-`memo` tidak ikut render ulang.',
        },
        {
          term: 'memo',
          meaning:
            'Pembungkus komponen yang **melewati render ulang** kalau props-nya tidak berubah. Perbandingannya dangkal, jadi ia hanya bekerja kalau props berupa object dan fungsi juga stabil — dan itulah kenapa ketiganya (`memo`, `useMemo`, `useCallback`) hampir selalu dipakai bertiga.',
        },
        {
          term: 'referential equality',
          meaning:
            'Terjemahannya **kesamaan berdasarkan alamat**. Akar dari seluruh urusan memoisasi: `{} === {}` bernilai `false` meski isinya sama, persis seperti yang kamu pelajari di Sub-bab 1.3 Frontend Basic. Object baru yang dibuat tiap render membuat `memo` selalu menganggap props-nya berubah.',
        },
        {
          term: 'Rules of React',
          meaning:
            'Sekumpulan aturan yang **harus dipenuhi** agar compiler bisa bekerja: komponen harus murni, hooks dipanggil di tingkat teratas, dan props maupun state tidak boleh dimutasi. Compiler tidak bisa memperbaiki kode yang melanggarnya — ia hanya akan melewatkan komponen itu.',
        },
        {
          term: 'eslint-plugin-react-hooks',
          meaning:
            'Plugin lint yang menegakkan Rules of React **sebelum** compiler dijalankan. Project ini memakainya, dan aturannya di sini berstatus **error, bukan peringatan** — karena melanggarnya berarti compiler diam-diam berhenti mengoptimalkan komponen itu.',
        },
        {
          term: 'opt-in',
          meaning:
            'Terjemahannya **ikut secara sadar**. React Compiler tidak menyala dengan sendirinya; ia harus dipasang dan diaktifkan. Ia juga bisa dijalankan **bertahap** — hanya untuk sebagian folder — sehingga project besar tidak perlu mengubah semuanya sekaligus.',
        },
      ),

      h2('Sebelum dan sesudah'),
      compare(
        {
          title: 'Manual',
          lang: 'tsx',
          code: `
            const filtered = useMemo(
              () => items.filter((i) => i.aktif),
              [items],
            );

            const onKlik = useCallback(
              (id) => hapus(id),
              [hapus],
            );

            export default memo(Daftar);
          `,
          notes: ['Mudah salah dependency', 'Menambah kebisingan'],
        },
        {
          title: 'Dengan Compiler',
          lang: 'tsx',
          code: `
            const filtered = items.filter((i) => i.aktif);

            const onKlik = (id) => hapus(id);

            export default Daftar;
          `,
          notes: ['Compiler menyisipkan memoisasi', 'Kode kembali terbaca'],
        },
      ),

      h2('Syaratnya: komponenmu harus murni'),
      code(
        'tsx',
        `
        // Compiler MELEWATI komponen yang melanggar aturan React —
        // ia tidak mengoptimalkan sesuatu yang tidak bisa ia pahami.

        // Yang membuatnya melewati komponenmu:
        //   - mengubah props atau state secara langsung
        //   - efek samping di badan komponen
        //   - memanggil hook di dalam kondisi atau loop
        `,
      ),
      callout(
        'info',
        'ESLint akan memberi tahu — dan itu error, bukan saran',
        'Project ini menjalankan plugin React Compiler lewat ESLint. Dua pelanggaran yang ditemukan di audit sesi lalu — `useMemo` yang tidak bisa dipertahankan dan `setState` di dalam Effect — keduanya muncul sebagai **error lint**, bukan peringatan. Perbaiki polanya; jangan matikan aturannya.',
      ),

      h2('Kapan memoisasi manual masih diperlukan'),
      code(
        'tsx',
        `
        // 1. Perhitungan yang benar-benar berat
        const hasil = useMemo(() => hitungRibuanBaris(data), [data]);

        // 2. Referensi stabil yang dituntut pustaka luar
        const opsi = useMemo(() => ({ tinggi: 400 }), []);
        useEfekPustakaLuar(opsi);

        // 3. Nilai Context yang objek — mencegah seluruh konsumen re-render
        const value = useMemo(() => ({ pengguna, keluar }), [pengguna, keluar]);
        `,
      ),

      h2('Yang tidak berubah'),
      ul(
        'Compiler **tidak** memperbaiki `key` yang salah.',
        'Ia **tidak** memperbaiki fetch waterfall.',
        'Ia **tidak** mengurangi ukuran bundle.',
        'Ia **tidak** membuat daftar 5.000 baris jadi cepat — itu butuh virtualisasi.',
      ),
      callout(
        'warning',
        'Compiler mengoptimalkan memoisasi, bukan arsitektur',
        'Masalah performa React yang paling sering di aplikasi nyata bukan re-render — melainkan pengambilan data yang berurutan padahal bisa paralel, dan bundle yang membawa pustaka berat ke halaman yang tidak memakainya. Keduanya tidak disentuh Compiler.',
      ),

      h2('Cara kerjanya, singkat'),
      code(
        'tsx',
        `
        // Yang kamu tulis
        function Daftar({ items }) {
          const aktif = items.filter((i) => i.aktif);
          return <ul>{aktif.map((i) => <li key={i.id}>{i.nama}</li>)}</ul>;
        }

        // Yang kira-kira dihasilkan Compiler
        function Daftar({ items }) {
          const $ = useMemoCache(2);
          let aktif;
          if ($[0] !== items) {
            aktif = items.filter((i) => i.aktif);
            $[0] = items;
            $[1] = aktif;
          } else {
            aktif = $[1];
          }
          return <ul>{aktif.map((i) => <li key={i.id}>{i.nama}</li>)}</ul>;
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Compiler menyisipkan memoisasi otomatis — `useMemo`/`useCallback` manual jauh berkurang.',
        'Ia melewati komponen yang melanggar aturan React; ESLint yang memberi tahu.',
        'Masih perlu manual untuk perhitungan berat, referensi untuk pustaka luar, dan nilai Context.',
        'Ia tidak memperbaiki `key`, waterfall, ukuran bundle, atau daftar sangat panjang.',
      ),
      references(
        {
          label: 'React Compiler',
          href: 'https://react.dev/learn/react-compiler',
          source: 'React',
          note: 'Cara memasang, mengaktifkan bertahap, dan batas yang tidak bisa ia selesaikan.',
        },
        {
          label: 'Rules of React',
          href: 'https://react.dev/reference/rules',
          source: 'React',
          note: 'Aturan yang wajib dipenuhi agar compiler mau mengoptimalkan sebuah komponen.',
        },
        {
          label: 'useMemo',
          href: 'https://react.dev/reference/react/useMemo',
          source: 'React',
          note: 'Termasuk catatan resmi kapan memoisasi manual masih benar-benar diperlukan.',
        },
        {
          label: 'memo',
          href: 'https://react.dev/reference/react/memo',
          source: 'React',
          note: 'Menjelaskan perbandingan dangkal props dan kenapa ia gagal tanpa identitas yang stabil.',
        },
        {
          label: 'React 19',
          href: 'https://react.dev/blog/2024/12/05/react-19',
          source: 'React',
          note: 'Konteks perubahan versi 19, termasuk `ref` sebagai prop dan arah compiler.',
        },
      ),
    ],
  ),

  written(
    'praktik-halaman-profil',
    'Praktik: Halaman profil dari data statis',
    14,
    'Menyusun beberapa komponen jadi satu halaman — tanpa satu pun state.',
    [
      p(
        'Praktik ini sengaja **tanpa state sama sekali**. Tujuannya melatih hal yang paling menentukan kualitas kode React: memecah tampilan menjadi komponen, dan mengalirkan data lewat props.',
      ),

      terms(
        {
          term: 'data dulu, komponen kemudian',
          meaning:
            'Urutan kerja yang dipakai praktik ini. Merancang **bentuk datanya** lebih dulu membuat pembagian komponen muncul dengan sendirinya — biasanya satu komponen per satuan data. Urutan sebaliknya sering menghasilkan komponen yang bentuknya dipaksakan mengikuti tampilan, lalu berantakan saat datanya berubah.',
        },
        {
          term: 'komponen daun',
          meaning:
            'Terjemahan dari *leaf component*. Komponen di ujung pohon yang **tidak tahu-menahu dari mana datanya datang** — ia hanya menerima props dan menampilkannya. Inilah komponen yang paling mudah dipakai ulang, diuji, dan dipindahkan.',
        },
        {
          term: 'hierarki komponen',
          meaning:
            'Susunan komponen dari halaman di puncak sampai daun di ujung. Pertanyaan penuntunnya bukan "apa yang terlihat sebagai satu kotak", melainkan **"apa yang berubah bersamaan"** — bagian yang selalu berubah bersama sebaiknya tinggal bersama.',
        },
        {
          term: 'kapan memecah',
          meaning:
            'Dua tanda yang cukup jelas: bagian itu **berulang**, atau ia punya **satu tanggung jawab yang bisa disebutkan dalam satu kalimat**. Memecah sebelum salah satunya muncul hanya menambah berkas yang harus dibuka tanpa manfaat apa pun.',
        },
        {
          term: 'keadaan kosong',
          meaning:
            'Terjemahan dari *empty state*. Tanggung jawabnya ada di **komponen daftar itu sendiri**, bukan di pemanggilnya. Alasannya sederhana: daftar itu yang tahu isinya kosong, dan menaruhnya di pemanggil berarti setiap pemanggil baru harus mengingatnya lagi.',
        },
        {
          term: 'data statis',
          meaning:
            'Data yang ditulis langsung di kode, bukan diambil dari server. Sengaja dipakai di praktik ini agar perhatianmu tertuju penuh pada **struktur komponen** — pengambilan data dan state datang di bab berikutnya.',
        },
        {
          term: 'semantik HTML',
          meaning:
            'Memilih tag menurut **maknanya**, bukan tampilannya: `<article>` untuk satuan yang berdiri sendiri, `<section>` untuk bagian bertema, `<nav>` untuk navigasi. Manfaatnya nyata bagi pembaca layar — dan `<div>` untuk segalanya menghapus seluruh manfaat itu.',
        },
        {
          term: 'props sebagai kontrak',
          meaning:
            'Daftar props sebuah komponen adalah **janji tentang apa yang ia butuhkan**. Menuliskannya sebagai tipe membuat janji itu diperiksa mesin — dan sekaligus menjadi dokumentasi yang tidak bisa basi, seperti yang kamu pelajari di Sub-bab 6.7 Frontend Basic.',
        },
      ),

      h2('1. Data'),
      code(
        'ts',
        `
        export type Proyek = {
          id: string;
          nama: string;
          ringkasan: string;
          tag: string[];
          status: 'aktif' | 'arsip';
        };

        export type Profil = {
          nama: string;
          peran: string;
          bio: string;
          proyek: Proyek[];
        };

        export const profil: Profil = {
          nama: 'Zum',
          peran: 'Fullstack Developer',
          bio: 'Sedang belajar dari JavaScript sampai deployment.',
          proyek: [
            {
              id: 'p1',
              nama: 'Ruang Belajar',
              ringkasan: 'Website kurikulum fullstack dengan progres tersimpan lokal.',
              tag: ['Next.js', 'TypeScript'],
              status: 'aktif',
            },
            {
              id: 'p2',
              nama: 'To-Do DOM',
              ringkasan: 'Latihan manipulasi DOM tanpa framework.',
              tag: ['JavaScript'],
              status: 'arsip',
            },
          ],
        };
        `,
        { filename: 'src/data/profil.ts' },
      ),
      callout(
        'tip',
        'Rancang bentuk datanya sebelum komponennya',
        'Komponen mengikuti bentuk data, bukan sebaliknya. Kalau kamu mulai dari komponen, kamu akan menemukan props yang aneh dan data yang harus dibentuk ulang di banyak tempat.',
      ),

      h2('2. Memecah jadi komponen'),
      code(
        'text',
        `
        HalamanProfil
        ├── HeaderProfil     (nama, peran, bio)
        ├── DaftarProyek     (proyek[])
        │   └── KartuProyek  (satu proyek)
        │       └── Label    (satu tag)
        └── FooterProfil
        `,
      ),
      p(
        'Aturan sederhana untuk memecah: **kalau ia muncul lebih dari sekali, atau punya satu tanggung jawab yang bisa disebut dalam satu kalimat — jadikan komponen.**',
      ),

      h2('3. Komponen daun'),
      code(
        'tsx',
        `
        export function Label({ children }: { children: React.ReactNode }) {
          return (
            <span className="bg-raised text-muted rounded-full px-2 py-0.5 text-xs">
              {children}
            </span>
          );
        }
        `,
        { filename: 'src/components/Label.tsx' },
      ),
      code(
        'tsx',
        `
        import type { Proyek } from '../data/profil';
        import { Label } from './Label';

        export function KartuProyek({ proyek }: { proyek: Proyek }) {
          return (
            <article className="border-border bg-surface rounded-lg border p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-text min-w-0 font-medium">{proyek.nama}</h3>

                {proyek.status === 'arsip' && (
                  <span className="text-faint shrink-0 text-xs">Arsip</span>
                )}
              </div>

              <p className="text-muted mt-2 text-sm">{proyek.ringkasan}</p>

              {proyek.tag.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {proyek.tag.map((t) => (
                    <li key={t}>
                      <Label>{t}</Label>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        }
        `,
        { filename: 'src/components/KartuProyek.tsx' },
      ),

      h2('4. Daftar dengan keadaan kosong'),
      code(
        'tsx',
        `
        export function DaftarProyek({ proyek }: { proyek: Proyek[] }) {
          if (proyek.length === 0) {
            return (
              <p className="border-border text-muted rounded-lg border border-dashed p-6 text-sm">
                Belum ada proyek yang ditampilkan.
              </p>
            );
          }

          return (
            <ul className="grid gap-4 sm:grid-cols-2">
              {proyek.map((p) => (
                <li key={p.id}>
                  <KartuProyek proyek={p} />
                </li>
              ))}
            </ul>
          );
        }
        `,
      ),
      callout(
        'warning',
        'Keadaan kosong bukan opsional',
        'Daftar tanpa penanganan kosong akan menampilkan area kosong tanpa penjelasan — tidak bisa dibedakan dari halaman yang rusak. Ini kebiasaan yang sama dengan yang kamu bangun di Frontend Basic Bab 5.',
      ),

      h2('5. Merakit'),
      code(
        'tsx',
        `
        import { profil } from './data/profil';
        import { DaftarProyek } from './components/DaftarProyek';

        export default function App() {
          return (
            <main className="mx-auto max-w-4xl px-4 py-12">
              <header>
                <h1 className="text-text text-3xl font-semibold tracking-tight">
                  {profil.nama}
                </h1>
                <p className="text-primary mt-1 text-sm">{profil.peran}</p>
                <p className="text-muted mt-4 max-w-prose">{profil.bio}</p>
              </header>

              <section className="mt-12" aria-labelledby="proyek">
                <h2 id="proyek" className="text-text text-lg font-semibold">
                  Proyek
                </h2>
                <div className="mt-4">
                  <DaftarProyek proyek={profil.proyek} />
                </div>
              </section>
            </main>
          );
        }
        `,
      ),

      h2('6. Kesalahan yang harus kamu hindari'),
      code(
        'tsx',
        `
        {proyek.tag.length && <ul>…</ul>}          // menampilkan 0 saat kosong
        {proyek.map((p, i) => <li key={i}>…</li>)} // key indeks pada daftar yang bisa berubah
        function App() { function Kartu() {…} }    // komponen di dalam komponen
        <KartuProyek {...proyek} />                // props melebar tanpa kontrak jelas
        `,
      ),

      checklist(
        'frontend-intermediate/fundamental-reactjs/praktik',
        'Checklist praktik 2.11',
        'Bentuk data dirancang lebih dulu, sebelum komponen',
        'Minimal empat komponen, masing-masing satu tanggung jawab',
        'Tidak ada komponen yang didefinisikan di dalam komponen lain',
        '`key` memakai id yang stabil, bukan indeks',
        'Kondisional memakai `length > 0 &&`, bukan `length &&`',
        'Keadaan kosong ditangani dengan kalimat yang menjelaskan',
        'Semua props punya tipe eksplisit',
        'Tidak ada nilai warna atau spacing mentah — semuanya token',
        'Struktur heading benar: satu `h1`, lalu `h2` untuk tiap bagian',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Rancang bentuk data sebelum komponen.',
        'Pecah jadi komponen saat ia berulang atau punya satu tanggung jawab yang jelas.',
        'Komponen daun tidak tahu-menahu soal data induknya.',
        'Keadaan kosong ditangani di komponen daftar, bukan di pemanggilnya.',
        'Bab berikutnya menambahkan state — dan semua kebiasaan ini tetap berlaku.',
      ),
      references(
        {
          label: 'Thinking in React',
          href: 'https://react.dev/learn/thinking-in-react',
          source: 'React',
          note: 'Urutan resmi yang dipakai praktik ini: rancang data dulu, baru pecah jadi komponen.',
        },
        {
          label: 'Your First Component',
          href: 'https://react.dev/learn/your-first-component',
          source: 'React',
          note: 'Kapan sebuah bagian layak dipecah menjadi komponen tersendiri.',
        },
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Props sebagai kontrak masuk — dasar seluruh aliran data di praktik ini.',
        },
        {
          label: 'HTML: content sectioning',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements',
          source: 'MDN',
          note: 'Memilih `<article>`, `<section>`, dan `<nav>` menurut maknanya, bukan tampilannya.',
        },
        {
          label: 'Adding Interactivity',
          href: 'https://react.dev/learn/adding-interactivity',
          source: 'React',
          note: 'Titik masuk bab berikutnya — state, event, dan perubahan yang terjadi seiring waktu.',
        },
      ),
    ],
  ),
];
