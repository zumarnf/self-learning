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
    11,
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
    12,
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
    13,
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
            'Fungsi yang memberitahu Next.js **semua kombinasi `params` yang harus dibuat saat build**. Inilah yang mengubah satu berkas `page.tsx` menjadi 410 halaman HTML statis di website ini. Tanpanya, setiap kunjungan dirender di server.',
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
        'Inilah yang mengubah satu berkas `page.tsx` menjadi 410 halaman HTML statis di website ini. Tanpa fungsi ini, setiap kunjungan akan dirender di server.',
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
    12,
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
    14,
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
            "Konstanta yang diekspor dari `page.tsx` atau `layout.tsx` untuk memaksa perilaku: `dynamic = 'force-dynamic'`, `dynamic = 'force-static'`, `dynamicParams = false`. Website ini efektif memakai yang terakhir — 410 slug sudah dikenal saat build, jadi slug lain memang seharusnya 404.",
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
        'Website ini memakai `dynamicParams = false` secara efektif: seluruh 410 sub-bab sudah dikenal saat build, jadi slug apa pun di luar itu memang seharusnya 404 — bukan dicoba dirender.',
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
    13,
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

  written('route-handler', 'Route Handler', 11, 'Membuat API di dalam Next.js.', [
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

  written('middleware', 'Middleware', 11, 'Kode yang berjalan sebelum permintaan mencapai rute.', [
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
    10,
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
    12,
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
    12,
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
    10,
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
    11,
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
    13,
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
    11,
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
    15,
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
