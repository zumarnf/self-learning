import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  ol,
  p,
  steps,
  table,
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
        '**SEO lemah.** Perayap yang tidak menjalankan JavaScript hanya melihat div kosong.',
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
      callout(
        'info',
        'Konsekuensi praktisnya',
        'Library berat yang hanya dipakai untuk menampilkan sesuatu — pemformat tanggal, parser Markdown, penyorot sintaks — bisa dipakai di Server Component tanpa menambah satu byte pun ke bundle browser. Website ini memakai Shiki (penyorot kode) persis dengan cara itu.',
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

      h2('Berkas khusus'),
      table(
        ['Berkas', 'Peran'],
        [
          ['`page.tsx`', 'Membuat rute bisa diakses publik. **Tanpa ini, folder bukan halaman.**'],
          [
            '`layout.tsx`',
            'Pembungkus bersama; **tidak dirender ulang** saat pindah antar anaknya',
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
        'Hasilnya: `RootLayout` > `LayoutKelas` > `page`. Saat pengguna berpindah dari satu pelajaran ke pelajaran lain, hanya `page` yang dirender ulang — sidebar dan navigasi tetap utuh, termasuk posisi scroll-nya.',
      ),
      callout(
        'tip',
        'Ini alasan sidebar tidak berkedip',
        'Di website ini, berpindah antar sub-bab tidak membuat sidebar melompat kembali ke atas. Itu bukan trik — itu konsekuensi langsung dari layout yang tidak dirender ulang.',
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
    ],
  ),

  written(
    'routing-lanjutan',
    'Routing: dynamic, group, parallel, intercepting',
    13,
    'Pola rute di luar yang sederhana.',
    [
      p('Empat pola rute yang menyelesaikan kebutuhan yang tidak bisa dijawab folder biasa.'),

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
        'Inilah yang mengubah satu berkas `page.tsx` menjadi 330 halaman HTML statis di website ini. Tanpa fungsi ini, setiap kunjungan akan dirender di server.',
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
        'Website ini memakai `dynamicParams = false` secara efektif: seluruh 330 sub-bab sudah dikenal saat build, jadi slug apa pun di luar itu memang seharusnya 404 — bukan dicoba dirender.',
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
      callout(
        'tip',
        'Baca keluaran build, jangan menebak',
        'Rute yang kamu kira statis tapi muncul sebagai `ƒ` berarti ada sesuatu yang memaksanya dinamis — biasanya `cookies()` atau `headers()` di layout yang jauh di atasnya. Keluaran build adalah cara tercepat menemukannya.',
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
      callout(
        'warning',
        'Jangan mengembalikan data sensitif dari Server Action',
        'Nilai kembaliannya dikirim ke browser. Kembalikan status dan pesan yang aman dibaca siapa pun — bukan objek database mentah, bukan detail error internal, bukan stack trace.',
      ),
    ],
  ),

  written('route-handler', 'Route Handler', 11, 'Membuat API di dalam Next.js.', [
    p(
      'Route Handler adalah cara membuat endpoint HTTP di App Router. Berkasnya bernama `route.ts` dan mengekspor fungsi bernama sesuai metode HTTP-nya.',
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
  ]),

  written('middleware', 'Middleware', 11, 'Kode yang berjalan sebelum permintaan mencapai rute.', [
    p(
      'Middleware berjalan sebelum permintaan sampai ke halaman atau route handler. Ia cocok untuk keputusan cepat berbasis permintaan: mengalihkan, menulis ulang URL, dan menambah header.',
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
        'Itu permintaan sopan kepada perayap yang patuh — bukan penjagaan. Halaman yang benar-benar privat tetap wajib dilindungi autentikasi di server. Website yang sedang kamu baca memakai `index: false` karena ia memang untuk satu orang, tapi itu bukan yang membuatnya aman.',
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
    ],
  ),

  written(
    'loading-streaming',
    'Loading UI, Streaming & Suspense',
    12,
    'Menampilkan bagian yang siap lebih dulu.',
    [
      p(
        'Tanpa streaming, server menunggu **seluruh** halaman selesai — termasuk query paling lambat — sebelum mengirim apa pun. Dengan streaming, HTML dikirim bertahap: yang siap duluan tampil duluan.',
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

        // Gagal keras saat start, bukan diam-diam undefined di permintaan pertama.
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
      callout(
        'danger',
        'Jangan pernah menyimpan token sesi di `localStorage`',
        '`localStorage` bisa dibaca JavaScript mana pun yang berjalan di halamanmu. Satu celah XSS — satu dependency yang dibajak, satu render HTML tak tersanitasi — dan seluruh token pengguna ikut tercuri. Cookie `HttpOnly` tidak bisa dibaca JavaScript sama sekali.',
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
    ],
  ),

  written(
    'praktik-bangun-ulang',
    'Praktik: Bangun ulang satu halaman website ini',
    15,
    'Menerapkan seluruh bab pada kode yang sedang kamu baca.',
    [
      p(
        'Praktik penutup Frontend Intermediate. Kamu akan membangun ulang halaman pelajaran — halaman yang sedang kamu baca sekarang — dari nol, memakai setiap konsep di bab ini. Sumber acuannya ada di depanmu: kodenya sendiri.',
      ),

      h2('Spesifikasinya'),
      ul(
        'URL: `/kelas/[category]/[chapter]/[lesson]`',
        'Seluruh halaman dibuat saat build (SSG), tidak ada render per permintaan.',
        'Sidebar navigasi tidak dirender ulang saat pindah antar pelajaran.',
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
          body: 'Buat `app/kelas/layout.tsx`. Bangun proyeksi navigasi di Server Component — hanya slug, judul, dan nomor — lalu oper sebagai prop. **Jangan** biarkan komponen sidebar mengimpor kurikulum.',
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
    ],
  ),
];
