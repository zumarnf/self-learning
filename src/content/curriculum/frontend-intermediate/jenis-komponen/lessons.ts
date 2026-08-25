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
 * Frontend Intermediate — Chapter 6, all twelve lessons.
 *
 * Ordered oldest pattern to newest on purpose. Presentational/container and HOC come first not
 * because they are recommended, but because a reader will meet them in existing code long before
 * they meet Server Components — and a pattern you cannot name is a pattern you cannot replace.
 */
export const lessons: LessonDraft[] = [
  written(
    'presentational-container',
    'Presentational vs Container',
    9,
    'Pemisahan klasik antara tampilan dan logika.',
    [
      p(
        'Pola ini muncul sekitar 2015 dan mendominasi kode React selama bertahun-tahun. Idenya memisahkan komponen menjadi dua peran: **container** yang tahu dari mana data datang, dan **presentational** yang hanya tahu cara menampilkannya.',
      ),

      terms(
        {
          term: 'presentational',
          meaning:
            'Dibaca "prezenteisyenel", artinya **komponen penampil**. Ia tidak tahu apa pun tentang API, store, atau routing — hanya menerima props dan menghasilkan tampilan. Ciri yang bisa diuji: berikan props yang sama, ia selalu menghasilkan hasil yang sama.',
        },
        {
          term: 'container',
          meaning:
            'Artinya **wadah**. Kebalikan dari presentational: ia tahu dari mana data datang (query, store, router) tapi tidak tahu bentuk tampilannya. Ia mengambil data, lalu menyerahkannya sebagai props ke komponen penampil.',
        },
        {
          term: 'pattern (pola)',
          meaning:
            'Bentuk penyelesaian yang berulang dan sudah punya nama. Nilai sebuah nama bukan soal kerapian: **pola yang tidak bisa kamu sebut namanya adalah pola yang tidak bisa kamu ganti**. Itu alasan bab ini menaruh pola-pola lama di depan, bukan karena menganjurkannya.',
        },
        {
          term: 'Dan Abramov',
          meaning:
            'Salah satu tokoh yang mempopulerkan pola ini pada 2015, dan yang kemudian **menarik anjurannya sendiri** setelah hooks hadir. Ini konteks penting: kalau kamu menemukan artikel lama yang menganjurkannya sebagai aturan, penulisnya sendiri sudah tidak lagi.',
        },
        {
          term: 'hooks',
          meaning:
            'Alasan pola ini kehilangan tempatnya sebagai anjuran umum. Hooks sudah memisahkan **logika** dari **tampilan** tanpa memaksa membuat komponen kedua — jadi manfaat utama pemisahannya bisa didapat tanpa membayar lapisan prop tambahan.',
        },
        {
          term: 'Storybook',
          meaning:
            'Alat untuk menampilkan komponen satu per satu di luar aplikasi, supaya bisa dilihat dan diuji tanpa menjalankan seluruh sistem. Ini salah satu dari tiga situasi di mana pemisahan presentational/container masih benar-benar berbayar.',
        },
        {
          term: 'abstraksi prematur',
          meaning:
            'Membangun lapisan untuk pemanggil yang **belum ada**. Biayanya dibayar hari ini berupa satu file lagi untuk dibuka dan satu lapisan lagi untuk ditelusuri, demi manfaat yang mungkin tidak pernah datang. Aturan praktisnya, pisahkan saat pemakai kedua benar-benar muncul dan bukan sebelumnya.',
        },
        {
          term: 'custom hook',
          meaning:
            'Fungsi berawalan `use` yang membungkus logika supaya bisa dipakai ulang. Ia adalah pengganti langsung pola ini di React modern: logikanya tetap bisa dibagikan lewat `useProfil()`, tanpa komponen perantara.',
        },
      ),

      h2('Bentuknya'),
      code(
        'tsx',
        `
        // Presentational — tidak tahu apa pun soal API atau store.
        // Berikan props yang sama, ia selalu menghasilkan tampilan yang sama.
        function DaftarProdukView({ produk, onPilih }: Props) {
          return (
            <ul>
              {produk.map((p) => (
                <li key={p.id}>
                  <button onClick={() => onPilih(p.id)}>{p.nama}</button>
                </li>
              ))}
            </ul>
          );
        }

        // Container — tahu dari mana datanya, tidak tahu bentuk tampilannya.
        function DaftarProdukContainer() {
          const { data } = useQuery({ queryKey: ['produk'], queryFn: ambilProduk });
          const router = useRouter();

          return <DaftarProdukView produk={data ?? []} onPilih={(id) => router.push(\`/produk/\${id}\`)} />;
        }
        `,
      ),
      p(
        'Perhatikan apa yang **tidak ada** di masing-masing. `DaftarProdukView` tidak memuat `useQuery`, `useRouter`, atau alamat API mana pun, sebab ia hanya menerima `produk` dan `onPilih`, dan itu membuatnya bisa diuji dengan mengoper array biasa tanpa memalsukan jaringan. Sebaliknya `DaftarProdukContainer` tidak memuat satu pun tag HTML, sebab ia hanya mengurus dari mana data datang dan apa yang terjadi saat sesuatu dipilih. Baris `data ?? []` menandai satu tanggung jawab container yang mudah terlewat, yaitu **menormalkan bentuk data** sebelum menyerahkannya, sehingga komponen tampilan tidak perlu menangani kemungkinan `undefined`. Perlu dicatat, contoh ini menunjukkan polanya bekerja, dan bagian berikutnya menjelaskan kenapa ia tidak lagi dianjurkan sebagai kebiasaan.',
      ),

      h2('Apa yang sebenarnya ia beli'),
      ul(
        'Komponen tampilan gampang diuji — cukup oper props, tidak perlu memalsukan jaringan atau store.',
        'Komponen tampilan gampang dipakai ulang dengan sumber data yang berbeda.',
        'Batasnya jelas: satu file tidak berisi campuran `fetch` dan JSX sekaligus.',
      ),

      h2('Kenapa ia tidak lagi jadi anjuran umum'),
      p(
        'Dan Abramov, yang mempopulerkannya, kemudian menarik anjurannya sendiri setelah hooks hadir. Alasannya: hooks sudah memisahkan logika dari tampilan **tanpa** memaksa membuat komponen kedua. Kalau kamu memisahkan hanya demi mengikuti pola, yang kamu dapat adalah dua file, satu lapisan prop tambahan, dan tidak satu pun manfaat di atas.',
      ),
      compare(
        {
          title: 'Pemisahan tanpa alasan',
          lang: 'tsx',
          code: `
          function ProfilContainer() {
            const { data } = useQuery(...);
            return <ProfilView user={data} />;
          }

          function ProfilView({ user }) {
            return <h1>{user.nama}</h1>;
          }
          `,
          notes: [
            'Dua file, satu lapisan prop, nol manfaat',
            'Tidak ada pemakai kedua untuk ProfilView',
          ],
        },
        {
          title: 'Satu komponen + custom hook',
          lang: 'tsx',
          code: `
          function Profil() {
            const { data } = useProfil();
            return <h1>{data.nama}</h1>;
          }
          `,
          notes: ['Logikanya tetap bisa dipakai ulang lewat useProfil', 'Tanpa komponen perantara'],
        },
      ),
      p(
        'Bandingkan dengan contoh `DaftarProduk` di atas, karena di sana pemisahan membeli sesuatu sedangkan di sini tidak. `ProfilView` hanya merender satu `<h1>` dan **tidak punya pemakai kedua**, jadi yang dihasilkan pemisahan itu cuma satu file tambahan dan satu lapisan prop yang harus ditelusuri pembaca. Kolom kanan menunjukkan bahwa tujuan aslinya tetap tercapai tanpa komponen perantara, sebab logika pengambilan data dipindah ke `useProfil`, sehingga ia tetap bisa dipakai ulang di komponen mana pun, sementara tampilannya tinggal satu fungsi. Inilah yang dimaksud "hooks sudah memisahkan logika dari tampilan tanpa memaksa membuat komponen kedua", sekaligus kenapa penulis polanya sendiri menarik anjurannya.',
      ),

      h2('Kapan ia masih relevan'),
      p(
        'Tiga situasi membuat pemisahan ini tetap berbayar. Pertama, komponen tampilannya **benar-benar** dipakai dengan lebih dari satu sumber data. Kedua, kamu memakai Storybook dan butuh komponen yang bisa dirender tanpa lingkungan apa pun. Ketiga, yang paling penting sekarang, batasnya kebetulan sama dengan batas Server/Client Component, yang dibahas dua sub-bab berikutnya.',
      ),
      callout(
        'tip',
        'Aturan praktisnya',
        'Jangan memisahkan lebih dulu lalu mencari alasannya. Pisahkan saat pemakai kedua benar-benar muncul. Ini penerapan langsung dari prinsip "jangan membangun abstraksi untuk pemanggil yang belum ada".',
      ),
      references(
        {
          label: 'Reusing Logic with Custom Hooks',
          href: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
          source: 'React',
          note: 'Pengganti pola ini di React modern — berbagi logika tanpa komponen perantara.',
        },
        {
          label: 'Keeping Components Pure',
          href: 'https://react.dev/learn/keeping-components-pure',
          source: 'React',
          note: 'Sifat "props sama → tampilan sama" yang membuat komponen penampil mudah diuji.',
        },
        {
          label: 'Extracting Components',
          href: 'https://react.dev/learn/your-first-component#nesting-and-organizing-components',
          source: 'React',
          note: 'Panduan resmi kapan sebuah komponen layak dipecah — dan kapan tidak.',
        },
        {
          label: 'Thinking in React',
          href: 'https://react.dev/learn/thinking-in-react',
          source: 'React',
          note: 'Cara memutuskan batas komponen dari bentuk datanya, bukan dari pola yang sedang populer.',
        },
      ),
    ],
  ),

  written(
    'server-vs-client-component',
    'Server Component vs Client Component',
    13,
    'Perbedaan paling penting di React modern.',
    [
      p(
        'React Server Component (RSC) adalah perubahan terbesar di React sejak hooks. Sebelumnya semua komponen berjalan di browser; sekarang sebagian bisa berjalan **hanya di server** dan tidak pernah mengirim satu byte JavaScript pun ke pengguna.',
      ),

      terms(
        {
          term: 'RSC',
          meaning:
            'Singkatan **React Server Component**. Perubahan terbesar di React sejak hooks. Sebelumnya semua komponen berjalan di browser; sekarang sebagian bisa berjalan **hanya di server** dan tidak pernah mengirim satu byte JavaScript pun ke pengguna.',
        },
        {
          term: 'Server Component',
          meaning:
            'Komponen yang dijalankan **hanya di server**. Ia boleh `async`/`await`, boleh menyentuh database dan rahasia, tapi tidak punya `useState`, `useEffect`, maupun event handler. Di App Router, ini adalah **default** — kamu tidak perlu menandainya.',
        },
        {
          term: 'Client Component',
          meaning:
            'Komponen yang filenya diawali `"use client"` dan kodenya ikut dikirim ke browser. Ia bisa memakai state, event handler, dan API browser — tapi tidak boleh menyentuh database atau rahasia, karena semua isinya bisa dibaca siapa pun.',
        },
        {
          term: '"use client"',
          meaning:
            'Direktif berupa string di baris paling atas sebuah file. Ia **bukan** penanda "komponen ini berjalan di browser" — ia penanda **batas**: mulai dari file ini ke bawah, semuanya masuk bundle klien. Dibahas tuntas di sub-bab berikutnya.',
        },
        {
          term: 'bundle',
          meaning:
            'Berkas JavaScript yang harus diunduh dan dijalankan browser. Angka "nol JavaScript" pada Server Component itu harfiah: kodenya tidak pernah ikut, jadi ia tidak menambah waktu unduh, waktu parse, maupun waktu eksekusi di perangkat pengguna.',
        },
        {
          term: 'notFound()',
          meaning:
            'Fungsi Next.js yang menghentikan render dan menampilkan halaman 404. Dipanggil langsung di badan Server Component — tidak perlu state error, tidak perlu `if` bercabang yang mengembalikan JSX berbeda.',
        },
        {
          term: 'children sebagai jalan keluar',
          meaning:
            'Client Component **tidak bisa mengimpor** Server Component. Tapi ia bisa **menerimanya sebagai `children`** — karena `children` sudah berupa hasil render, bukan referensi ke komponennya. Server yang mengerjakannya, klien hanya menempatkannya.',
        },
        {
          term: 'serialisasi',
          meaning:
            'Mengubah nilai menjadi format yang bisa dikirim lewat jaringan. Props dari server ke klien melewati batas itu, jadi isinya terbatas: string, angka, boolean, array, objek biasa, `Date`, `Map`, `Set` bisa. **Fungsi, class instance, dan `Symbol` tidak bisa.**',
        },
        {
          term: 'payload RSC',
          meaning:
            'Data yang dikirim server ke browser berisi hasil render Server Component beserta props untuk Client Component. Ini yang membuat peringatan keamanan di bawah nyata: satu `<Profil user={user} />` yang membawa `passwordHash` akan **mengirimkannya ke browser** meski tidak pernah tampil di layar.',
        },
      ),

      h2('Perbedaannya'),
      table(
        ['', 'Server Component', 'Client Component'],
        [
          ['Berjalan di', 'Server saja', 'Server (render awal) lalu browser'],
          ['JavaScript ke browser', '**Nol**', 'Ikut ke bundle'],
          ['`useState`, `useEffect`', 'Tidak bisa', 'Bisa'],
          ['Event handler (`onClick`)', 'Tidak bisa', 'Bisa'],
          ['`async`/`await` di komponen', 'Bisa', 'Tidak'],
          ['Akses database / rahasia', 'Bisa', '**Tidak boleh**'],
          ['Akses `window`, `localStorage`', 'Tidak', 'Bisa'],
          ['Default di App Router', '**Ya**', 'Perlu `"use client"`'],
        ],
      ),

      h2('Server Component: mengambil data langsung'),
      code(
        'tsx',
        `
        // Tanpa 'use client' -> ini Server Component.
        // Tidak ada useEffect, tidak ada state loading, tidak ada race condition.
        export default async function HalamanProduk({ params }: { params: Promise<{ id: string }> }) {
          const { id } = await params;
          const produk = await db.produk.findUnique({ where: { id } });

          if (!produk) notFound();

          return (
            <article>
              <h1>{produk.nama}</h1>
              <p>{produk.deskripsi}</p>
            </article>
          );
        }
        `,
      ),
      p(
        'Perhatikan yang **tidak** ada di sana: tidak ada `useState` untuk data, tidak ada `useState` untuk loading, tidak ada `useEffect`, tidak ada penanganan respons yang datang terlambat. Semua itu hilang karena datanya sudah ada sebelum HTML dibuat.',
      ),

      h2('Client Component: apa pun yang butuh browser'),
      code(
        'tsx',
        `
        'use client';

        import { useState } from 'react';

        export function TombolSuka({ awal }: { awal: number }) {
          const [jumlah, setJumlah] = useState(awal);
          return <button onClick={() => setJumlah((n) => n + 1)}>{jumlah} suka</button>;
        }
        `,
      ),

      h2('Aturan arah: server boleh memuat klien, tidak sebaliknya'),
      p(
        'Server Component boleh merender Client Component. Client Component **tidak bisa** mengimpor Server Component — karena saat komponen klien dijalankan di browser, tidak ada server di sana.',
      ),
      code(
        'tsx',
        `
        // BOLEH: server merender klien
        export default async function Halaman() {
          const data = await ambilData();
          return <TombolInteraktif data={data} />;   // TombolInteraktif punya 'use client'
        }

        // TIDAK BOLEH: klien mengimpor server
        'use client';
        import KomponenServer from './komponen-server';   // gagal
        `,
      ),
      p(
        'Arah yang boleh dan tidak boleh ini bukan aturan sewenang-wenang, sebab ia mengikuti **di mana kode itu benar-benar berjalan**. Blok pertama sah karena `Halaman` berjalan di server, menyelesaikan `await ambilData()` di sana, lalu mengirim hasilnya ke browser bersama instruksi untuk merender `TombolInteraktif`. Blok kedua gagal karena kebalikannya mustahil. Begitu kode berada di browser, tidak ada server untuk menjalankan komponen server itu, dan mengimpornya akan menyeret seluruh isinya, termasuk kredensial database dan kode yang tidak pernah boleh sampai ke klien. Perhatikan bahwa yang dilarang adalah **mengimpor** dan bukan merender, sebab perbedaan halus itulah yang membuka jalan keluar di bagian berikutnya.',
      ),
      p('Tapi ada jalan keluar yang sering dilupakan: **oper sebagai `children`**.'),
      code(
        'tsx',
        `
        // Server Component
        export default async function Halaman() {
          return (
            <PembungkusKlien>
              {/* Ini dirender di SERVER, lalu hasilnya dioper sebagai children. */}
              <KontenServer />
            </PembungkusKlien>
          );
        }

        // Client Component — menerima elemen jadi, bukan mengimpor komponennya.
        'use client';
        export function PembungkusKlien({ children }: { children: React.ReactNode }) {
          const [buka, setBuka] = useState(false);
          return <div>{buka && children}</div>;
        }
        `,
      ),
      p(
        'Kuncinya ada pada komentar di dalam `Halaman`, sebab `<KontenServer />` **dirender di server**, dan yang dioper ke `PembungkusKlien` bukan komponennya melainkan **hasilnya yang sudah jadi**. Karena itu larangan tadi tidak dilanggar, sebab `PembungkusKlien` tidak pernah mengimpor apa pun dari sisi server dan hanya menerima `children` seperti prop biasa. Ini persis pola komposisi dari Bab 2, dipakai untuk menyelesaikan batas yang sama sekali berbeda. Perhatikan `PembungkusKlien` bebas melakukan apa saja terhadap `children`, entah menyembunyikannya lewat `buka &&`, membungkusnya, atau menganimasikannya, tanpa perlu tahu isinya apa. Inilah cara membuat konten yang dirender server tetap bisa berada di dalam tab, modal, atau accordion yang interaktif.',
      ),
      callout(
        'info',
        'Kenapa itu bekerja',
        '`children` sudah berupa hasil render, bukan referensi ke komponennya. Server yang mengerjakannya, klien hanya menempatkannya. Pola ini penting: ia membuat komponen interaktif bisa membungkus konten server tanpa menyeret konten itu ke bundle browser.',
      ),

      h2('Yang dioper harus bisa diserialisasi'),
      p(
        'Props dari Server Component ke Client Component melewati batas jaringan, jadi ia harus bisa diubah menjadi format serial. String, angka, boolean, array, objek biasa, `Date`, `Map`, `Set` — semuanya bisa. Yang tidak bisa: **fungsi**, class instance, dan `Symbol`.',
      ),
      code(
        'tsx',
        `
        // GAGAL: fungsi tidak bisa diserialisasi
        <TombolKlien onKlik={() => console.log('halo')} />

        // BENAR: oper datanya, biarkan komponen klien yang membuat handlernya
        <TombolKlien id={produk.id} />
        `,
      ),
      p(
        'Batasan ini masuk akal begitu kamu ingat bahwa props dari Server ke Client Component harus **melewati jaringan**. Apa pun yang dioper diubah menjadi teks, dikirim ke browser, lalu disusun kembali, sedangkan fungsi tidak bisa diubah menjadi teks tanpa kehilangan seluruh isinya. Karena itu baris pertama gagal, dan pesannya menyebut kata "serializable" yang mudah membingungkan kalau kamu tidak tahu ada perjalanan jaringan di antaranya. Koreksinya membalik tanggung jawab, sebab server mengirim **data** (`id`) dan komponen klien yang membuat handler-nya sendiri, dan itu sah karena kode itu memang berjalan di browser. Kotak berikut menyebut sisi lain dari kenyataan yang sama, yaitu karena props benar-benar dikirim, apa pun yang kamu oper bisa dibaca siapa saja yang membuka payload halaman.',
      ),
      callout(
        'warning',
        'Bahaya keamanan yang nyata',
        'Karena props dikirim ke browser, jangan pernah mengoper objek utuh dari database ke Client Component. Satu `<Profil user={user} />` yang membawa `passwordHash` atau `email` internal akan mengirimkannya ke browser — terlihat di payload RSC meski tidak pernah dirender di layar. Pilih field yang benar-benar perlu.',
      ),
      references(
        {
          label: 'Server Components',
          href: 'https://react.dev/reference/rsc/server-components',
          source: 'React',
          note: 'Rujukan resmi React untuk komponen yang berjalan hanya di server.',
        },
        {
          label: 'Server and Client Components',
          href: 'https://nextjs.org/docs/app/getting-started/server-and-client-components',
          source: 'Next.js',
          note: 'Aturan arah impor dan pola `children` yang membuat konten server bisa dibungkus komponen klien.',
        },
        {
          label: '"use client"',
          href: 'https://react.dev/reference/rsc/use-client',
          source: 'React',
          note: 'Termasuk daftar tipe nilai yang boleh dan tidak boleh dioper melewati batas server–klien.',
        },
        {
          label: 'notFound()',
          href: 'https://nextjs.org/docs/app/api-reference/functions/not-found',
          source: 'Next.js',
          note: 'Menghentikan render dan menampilkan 404 langsung dari badan Server Component.',
        },
      ),
    ],
  ),

  written(
    'use-client-boundary',
    'Kapan `"use client"` & Di Mana Batasnya',
    12,
    'Menarik batas serapat mungkin ke daun.',
    [
      p(
        '`"use client"` bukan penanda "komponen ini berjalan di browser". Ia adalah **penanda batas**: begitu satu modul menyatakannya, seluruh modul yang ia impor ikut masuk ke bundle klien. Salah menaruhnya di satu tempat bisa menyeret setengah aplikasi ke browser.',
      ),

      terms(
        {
          term: 'batas (boundary)',
          meaning:
            'Garis pemisah antara bagian yang dikerjakan server dan bagian yang dikirim ke browser. `"use client"` menggambar garis itu. Yang sering disalahpahami: garisnya **menurun** — semua yang diimpor dari file bertanda itu ikut ke sisi klien, sedalam apa pun rantainya.',
        },
        {
          term: 'merambat',
          meaning:
            'Sifat batas ini yang membuatnya berbahaya. Satu `"use client"` di `layout.tsx` menyeret sidebar, lalu navigasi, lalu apa pun yang navigasi itu impor. Kamu tidak menandai satu komponen — kamu menandai satu **cabang pohon impor**.',
        },
        {
          term: 'leaf',
          meaning:
            'Komponen paling ujung yang tidak merender komponen lain — sebuah tombol, sebuah input. Aturan bab ini: **turunkan `"use client"` sedekat mungkin ke daun**, supaya yang ikut ke browser hanya bagian yang memang butuh browser.',
        },
        {
          term: 'tree-shaking',
          meaning:
            'Kemampuan bundler membuang kode yang tidak dipakai. Batasnya yang sering tidak disadari: ia bekerja pada **modul dan ekspor**, bukan pada **properti objek**. Mengimpor satu objek besar berarti seluruh isinya ikut, meski kamu cuma memakai satu field.',
        },
        {
          term: 'proyeksi ramping',
          meaning:
            'Versi ringkas sebuah data yang dibangun di Server Component lalu dioper sebagai prop. Sidebar tidak butuh isi pelajaran — ia hanya butuh slug, judul, dan nomor. Karena bundler tidak bisa membuang properti objek, **kamu** yang harus memilihnya lebih dulu.',
        },
        {
          term: 'import type',
          meaning:
            'Bentuk impor TypeScript yang hanya membawa **tipe**, bukan nilai. Ia dihapus saat kompilasi dan tidak punya biaya runtime sama sekali — jadi Client Component boleh menulis `import type { Lesson } from ...` tanpa menyeret apa pun ke bundle.',
        },
        {
          term: 'kebocoran bundle',
          meaning:
            'Kode yang ikut ke browser padahal tidak pernah dibutuhkan di sana. Yang membuatnya sulit ditangkap: **tampilannya tetap normal**. Tidak ada error, tidak ada peringatan, halaman tetap berfungsi — ia hanya jadi makin mahal untuk pembaca.',
        },
        {
          term: 'ditegakkan tes',
          meaning:
            'Karena kebocoran tidak menimbulkan gejala, aturannya tidak bisa dititipkan pada kedisiplinan. Website ini menegakkannya lewat `client-bundle-boundary.test.ts`: satu impor terlarang dari Client Component membuat suite merah.',
        },
      ),

      h2('Efek yang merambat'),
      code(
        'text',
        `
        app/layout.tsx          <- 'use client' di sini
          └─ Sidebar            ikut jadi klien
              └─ NavigasiUtama  ikut jadi klien
                  └─ data/kurikulum.ts  IKUT KE BUNDLE BROWSER
        `,
      ),
      p(
        'Itu bukan contoh karangan. Cacat persis seperti ini pernah ditemukan di website yang sedang kamu baca: komponen sidebar diberi `"use client"` karena butuh menandai menu aktif, dan karena ia mengimpor kurikulum, **seluruh prosa dan contoh kode setiap sub-bab** ikut terkirim ke browser. Ukurannya 86 KB saat baru 16 sub-bab, dan akan tumbuh linear seiring materi ditulis.',
      ),

      h2('Aturan: turunkan batasnya sedekat mungkin ke daun'),
      compare(
        {
          title: 'Batas terlalu tinggi',
          lang: 'tsx',
          code: `
          'use client';

          export function Artikel({ isi, judul }) {
            const [suka, setSuka] = useState(0);

            return (
              <article>
                <h1>{judul}</h1>
                {/* Seluruh isi artikel ikut ke bundle */}
                <div>{isi}</div>
                <button onClick={() => setSuka(suka + 1)}>
                  {suka}
                </button>
              </article>
            );
          }
          `,
          notes: ['Satu tombol memaksa seluruh artikel jadi Client Component'],
        },
        {
          title: 'Batas di daun',
          lang: 'tsx',
          code: `
          // Server Component — tidak ada 'use client'
          export function Artikel({ isi, judul }) {
            return (
              <article>
                <h1>{judul}</h1>
                <div>{isi}</div>
                <TombolSuka />
              </article>
            );
          }

          // File terpisah
          'use client';
          export function TombolSuka() {
            const [suka, setSuka] = useState(0);
            return <button onClick={() => setSuka(suka + 1)}>{suka}</button>;
          }
          `,
          notes: ['Hanya tombolnya yang jadi JavaScript di browser'],
        },
      ),
      p(
        'Kedua versi menampilkan artikel yang sama dengan tombol suka yang sama, tapi **jumlah JavaScript yang diunduh pembaca berbeda jauh**. Kuncinya ada pada kalimat di rujukan, yaitu `"use client"` menandai **batas modul** dan bukan satu komponen. Menaruhnya di atas `Artikel` berarti seluruh berkas itu beserta semua yang ia impor ikut dikirim ke browser, termasuk isi artikel yang tidak pernah interaktif. Versi kanan memindahkan direktifnya ke berkas terpisah yang hanya berisi tombolnya, sehingga `Artikel` tetap dirender di server dan yang menyeberang ke browser hanya beberapa baris. Perhatikan `Artikel` tetap **merender** `<TombolSuka />`, sebab sesuai aturan arah tadi server boleh merender klien. Aturan praktisnya, turunkan `"use client"` sedekat mungkin ke daun, dan letakkan pada berkas terkecil yang benar-benar membutuhkannya.',
      ),

      h2('Daftar pemicu yang benar-benar butuh `"use client"`'),
      ul(
        '`useState`, `useReducer`, `useEffect`, `useLayoutEffect`, `useRef` untuk DOM',
        'Event handler: `onClick`, `onChange`, `onSubmit`, `onScroll`',
        'API browser: `window`, `document`, `localStorage`, `navigator`, `IntersectionObserver`',
        'Context provider dan konsumennya',
        'Library pihak ketiga yang di dalamnya memakai salah satu di atas',
      ),
      p(
        'Yang **bukan** pemicu: menampilkan data, `map` atas array, kondisional, styling, dan menerima props. Semua itu bisa dikerjakan di server.',
      ),

      h2('Menegakkannya dengan mesin, bukan ingatan'),
      p(
        'Masalah dari kebocoran seperti ini: tampilannya tetap normal. Tidak ada error, tidak ada peringatan, halaman tetap berfungsi — ia hanya jadi makin mahal untuk pembaca. Karena itu aturannya harus dijaga tes, bukan kedisiplinan.',
      ),
      code(
        'ts',
        `
        // Tes yang dipakai website ini (disederhanakan)
        const TERLARANG_DI_KLIEN = [
          "from '@/content/curriculum",
          "from '@/lib/curriculum/queries'",
        ];

        it('tidak ada Client Component yang mengimpor kurikulum', () => {
          const pelanggar = fileKlien.filter((f) =>
            TERLARANG_DI_KLIEN.some((t) => bacaImpor(f).includes(t)),
          );
          expect(pelanggar).toEqual([]);
        });
        `,
      ),
      p(
        'Tes ini tidak menguji perilaku aplikasi sama sekali, melainkan menguji **struktur impor**, dan itu justru yang membuatnya tepat di sini. Kebocoran bundle tidak punya gejala yang bisa diamati dari luar, sebab halaman tetap benar dan tidak ada error, hanya berkas yang diunduh membengkak. Yang bisa dideteksi hanyalah polanya di kode sumber, jadi tesnya membaca daftar berkas berdirektif `"use client"` lalu memeriksa apakah ada yang mengimpor modul terlarang. `expect(pelanggar).toEqual([])` sengaja membandingkan dengan array kosong alih-alih memeriksa panjangnya, sehingga pesan gagalnya langsung **menyebutkan berkas mana** yang melanggar dan bukan sekadar "diharapkan 0 dapat 3". Ini contoh kecil dari prinsip yang berlaku umum, bahwa aturan yang hanya dijaga kedisiplinan akan dilanggar suatu hari.',
      ),
      callout(
        'tip',
        'Solusinya: proyeksi ramping',
        'Kalau komponen klien butuh sebagian data besar, bangun versi ringkasnya di Server Component lalu oper sebagai prop. Sidebar tidak butuh isi pelajaran — ia hanya butuh slug, judul, dan nomor. Bundler tidak bisa membuang properti objek yang tidak dipakai, jadi kamu yang harus memilihnya lebih dulu.',
      ),
      callout(
        'info',
        '`import type` tetap aman',
        "Impor tipe dihapus saat kompilasi dan tidak punya biaya runtime sama sekali. Client Component boleh menulis `import type { Lesson } from '@/lib/content/types'` tanpa menyeret apa pun ke bundle.",
      ),
      references(
        {
          label: '"use client"',
          href: 'https://react.dev/reference/rsc/use-client',
          source: 'React',
          note: 'Penjelasan resmi bahwa direktif ini menandai batas modul, bukan satu komponen.',
        },
        {
          label: 'Server and Client Components — moving the boundary down',
          href: 'https://nextjs.org/docs/app/getting-started/server-and-client-components',
          source: 'Next.js',
          note: 'Anjuran resmi menurunkan `"use client"` sedekat mungkin ke daun.',
        },
        {
          label: 'Analyzing bundles',
          href: 'https://nextjs.org/docs/app/guides/package-bundling',
          source: 'Next.js',
          note: 'Cara mengukur apa yang benar-benar ikut ke bundle, bukan menebaknya.',
        },
        {
          label: 'Type-Only Imports and Export',
          href: 'https://www.typescriptlang.org/docs/handbook/modules/reference.html#type-only-imports-and-exports',
          source: 'TypeScript',
          note: 'Kenapa `import type` dihapus saat kompilasi dan tidak berbiaya runtime.',
        },
      ),
    ],
  ),

  written(
    'compound-component',
    'Compound Component',
    12,
    'Beberapa komponen yang berbagi state lewat context.',
    [
      p(
        'Compound component adalah sekumpulan komponen yang dirancang untuk dipakai bersama dan berbagi state secara diam-diam. Kamu sudah memakainya di HTML biasa: `<select>` dan `<option>` tidak berguna sendiri-sendiri, tapi bersama mereka membentuk satu kontrol.',
      ),

      terms(
        {
          term: 'compound component',
          meaning:
            'Dibaca "kompaund", artinya **komponen majemuk**. Sekumpulan komponen yang dirancang untuk dipakai bersama dan berbagi state secara diam-diam. Kamu sudah memakainya di HTML biasa: `<select>` dan `<option>` tidak berguna sendiri-sendiri, tapi bersama membentuk satu kontrol.',
        },
        {
          term: 'API komponen',
          meaning:
            'Bentuk props dan susunan yang harus ditulis pemanggil untuk memakai sebuah komponen. Ia dinilai seperti API lain: apakah maksudnya terbaca, apakah kesalahan pemakaian bisa terjadi diam-diam, dan berapa banyak yang harus diingat.',
        },
        {
          term: 'prop proliferation',
          meaning:
            'Dibaca "prop proliferesyen", artinya **props yang beranak-pinak**. Gejala API berprop banyak, sebab setiap permintaan tampilan baru menambah satu prop baru seperti `ikonTerbuka`, `gayaJudul`, dan `bolehBanyakTerbuka`, sampai daftarnya lebih panjang daripada komponennya sendiri.',
        },
        {
          term: 'static property',
          meaning:
            'Menempelkan komponen anak ke komponen induknya sebagai properti: `Accordion.Item = ...`. Efeknya bukan teknis melainkan komunikatif — `<Accordion.Trigger>` langsung memberi tahu pembaca bahwa ia hanya bermakna di dalam `<Accordion>`.',
        },
        {
          term: 'aria-expanded',
          meaning:
            'Atribut ARIA yang memberitahu screen reader apakah bagian yang dikendalikan tombol ini sedang terbuka atau tertutup. Tanpa ini, pengguna screen reader menekan tombol tanpa tahu apa yang terjadi.',
        },
        {
          term: 'aria-controls',
          meaning:
            'Atribut yang menghubungkan tombol dengan `id` panel yang ia buka-tutup. Bersama `aria-expanded`, keduanya bukan tanggung jawab pemanggil — kalau diserahkan ke pemanggil, ia akan lupa. Komponen yang mengelolanya sendiri membuat kesalahan itu mustahil.',
        },
        {
          term: 'React.Children.map',
          meaning:
            'API lama untuk menelusuri `children` dan menyuntikkan props ke dalamnya. **Jangan dipakai untuk pola ini**: ia rusak begitu ada elemen pembungkus di antaranya, misalnya sebuah `<div>` atau `<hr />`. Context bekerja sedalam apa pun pohonnya.',
        },
        {
          term: 'role="region"',
          meaning:
            'Menandai sebuah area sebagai bagian penting yang bisa dituju langsung oleh pengguna screen reader. Dipasang di panel isi accordion supaya isinya bisa ditemukan, bukan sekadar muncul di bawah tombolnya.',
        },
      ),

      h2('Masalah yang ia selesaikan'),
      compare(
        {
          title: 'API berprop banyak',
          lang: 'tsx',
          code: `
          <Accordion
            items={[
              { judul: 'A', isi: 'satu' },
              { judul: 'B', isi: 'dua' },
            ]}
            ikonTerbuka={<ChevronUp />}
            ikonTertutup={<ChevronDown />}
            gayaJudul="tebal"
            bolehBanyakTerbuka
          />
          `,
          notes: [
            'Setiap permintaan tampilan baru = satu prop baru',
            'Tidak bisa menyisipkan apa pun di antara item',
          ],
        },
        {
          title: 'Compound component',
          lang: 'tsx',
          code: `
          <Accordion bolehBanyakTerbuka>
            <Accordion.Item nilai="a">
              <Accordion.Trigger>A</Accordion.Trigger>
              <Accordion.Content>satu</Accordion.Content>
            </Accordion.Item>

            <hr />

            <Accordion.Item nilai="b">
              <Accordion.Trigger>B</Accordion.Trigger>
              <Accordion.Content>dua</Accordion.Content>
            </Accordion.Item>
          </Accordion>
          `,
          notes: ['Susunannya milik pemanggil', 'Tidak perlu prop baru untuk tata letak baru'],
        },
      ),
      p(
        'Perhatikan `<hr />` di tengah kolom kanan, sebab elemen sederhana itu adalah bukti perbedaannya. Pada versi berprop, satu-satunya cara menyisipkan pemisah antar-item adalah menambah prop baru ke `Accordion` dan mengubah implementasinya, sedangkan pada versi compound pemanggil cukup menuliskannya karena **susunan isinya memang miliknya**. Pola yang sama berlaku untuk `ikonTerbuka` dan `gayaJudul`, sebab keduanya lahir karena pemanggil tidak punya kendali atas apa yang dirender, sehingga tiap kebutuhan tampilan baru harus dititipkan lewat prop. Yang tetap tinggal sebagai prop di kolom kanan hanyalah `bolehBanyakTerbuka`, dan itu tepat karena ia mengatur **perilaku** alih-alih tampilan. Aturan pembedanya, perilaku jadi prop dan susunan jadi `children`.',
      ),

      h2('Implementasinya'),
      code(
        'tsx',
        `
        'use client';

        import { createContext, useContext, useState } from 'react';

        type KonteksAccordion = {
          terbuka: string[];
          alihkan: (nilai: string) => void;
        };

        const Konteks = createContext<KonteksAccordion | null>(null);

        function pakaiAccordion(komponen: string) {
          const nilai = useContext(Konteks);
          if (nilai === null) {
            throw new Error(\`<Accordion.\${komponen}> harus berada di dalam <Accordion>\`);
          }
          return nilai;
        }

        export function Accordion({
          children,
          bolehBanyakTerbuka = false,
        }: {
          children: React.ReactNode;
          bolehBanyakTerbuka?: boolean;
        }) {
          const [terbuka, setTerbuka] = useState<string[]>([]);

          function alihkan(nilai: string) {
            setTerbuka((lama) => {
              if (lama.includes(nilai)) return lama.filter((v) => v !== nilai);
              return bolehBanyakTerbuka ? [...lama, nilai] : [nilai];
            });
          }

          return <Konteks value={{ terbuka, alihkan }}>{children}</Konteks>;
        }
        `,
        { filename: 'src/components/ui/accordion.tsx' },
      ),
      p(
        'Inilah yang membuat compound component bekerja, yaitu **Context dipakai secara lokal** dan bukan sebagai state global. `Accordion` menyimpan daftar panel yang terbuka lalu membagikannya ke seluruh keturunannya, sehingga `Accordion.Trigger` bisa mengetahui statusnya tanpa satu pun prop dioper, dan pemanggil bebas menyusun apa pun di antaranya. Perhatikan `bolehBanyakTerbuka` tidak disimpan di context melainkan **dibaca di dalam `alihkan`**, sebab baris `return bolehBanyakTerbuka ? [...lama, nilai] : [nilai]` adalah seluruh perbedaan antara accordion yang membuka banyak panel dan yang hanya satu. Fungsi `pakaiAccordion(komponen)` di atasnya menerapkan pola hook pembungkus dari Bab 5, dengan satu tambahan yang cerdas, yaitu ia menerima nama komponen sehingga pesan errornya menyebut persis bagian mana yang salah tempat.',
      ),
      code(
        'tsx',
        `
        const KonteksItem = createContext<string | null>(null);

        Accordion.Item = function Item({ nilai, children }: { nilai: string; children: React.ReactNode }) {
          return <KonteksItem value={nilai}>{children}</KonteksItem>;
        };

        Accordion.Trigger = function Trigger({ children }: { children: React.ReactNode }) {
          const { terbuka, alihkan } = pakaiAccordion('Trigger');
          const nilai = useContext(KonteksItem)!;
          const aktif = terbuka.includes(nilai);

          return (
            <button
              type="button"
              aria-expanded={aktif}
              aria-controls={\`panel-\${nilai}\`}
              onClick={() => alihkan(nilai)}
            >
              {children}
            </button>
          );
        };

        Accordion.Content = function Content({ children }: { children: React.ReactNode }) {
          const { terbuka } = pakaiAccordion('Content');
          const nilai = useContext(KonteksItem)!;
          if (!terbuka.includes(nilai)) return null;

          return (
            <div id={\`panel-\${nilai}\`} role="region">
              {children}
            </div>
          );
        };
        `,
      ),
      p(
        'Perhatikan bahwa ada **dua** context di sini, bukan satu, dan keduanya menjawab pertanyaan berbeda. `Konteks` (dari blok kode sebelumnya) menjawab "daftar id mana saja yang sedang terbuka, dan bagaimana mengubahnya", dan dibaca oleh `Accordion.Trigger` serta `Accordion.Content`. `KonteksItem` menjawab pertanyaan yang lebih sempit, yaitu "item **mana** yang sedang dibicarakan di titik pohon ini", dan nilainya cuma satu string, di-set oleh `Accordion.Item`, lalu dibaca `useContext(KonteksItem)!` oleh `Trigger` dan `Content` yang ada di dalamnya. Tanda seru setelah `useContext(KonteksItem)` adalah **non-null assertion** TypeScript, karena penulisnya menjamin nilainya tidak akan pernah `null` di sini, karena `Trigger` dan `Content` menurut definisi API selalu dipasang di dalam `Accordion.Item`. Fungsi `pakaiAccordion(\'Trigger\')` yang muncul di awal `Trigger` dan `Content` adalah pembungkus `useContext(Konteks)` yang sama seperti `useTabs()` di sub-bab compound component sebelumnya, dan parameter string di dalamnya dipakai untuk menyebut nama komponen yang benar dalam pesan error kalau Provider-nya lupa dipasang.',
      ),

      h2('Detail yang membedakan implementasi bagus dan asal jadi'),
      ol(
        '**Pesan error yang menyebut nama komponennya.** `<Accordion.Trigger> harus berada di dalam <Accordion>` jauh lebih menolong daripada `Cannot read property of null`.',
        '**Atribut ARIA ikut dikelola komponen.** `aria-expanded` dan `aria-controls` bukan tanggung jawab pemanggil — kalau diserahkan, ia akan lupa.',
        '**Jangan memakai `React.Children.map` untuk menyuntik props.** Cara itu rusak begitu ada elemen pembungkus di antaranya. Context bekerja sedalam apa pun pohonnya.',
      ),

      h2('Biayanya'),
      p(
        'Compound component menukar kesederhanaan dengan keluwesan. Untuk komponen yang dipakai di tiga tempat dengan bentuk yang sama, API berprop sederhana lebih baik. Pola ini berbayar saat komponennya benar-benar dipakai dalam banyak susunan berbeda — komponen overlay, menu, tab, dan tabel adalah kandidat klasiknya.',
      ),
      references(
        {
          label: 'Passing Data Deeply with Context',
          href: 'https://react.dev/learn/passing-data-deeply-with-context',
          source: 'React',
          note: 'Mekanisme yang membuat komponen anak menemukan induknya sedalam apa pun pohonnya.',
        },
        {
          label: 'Children.map — dan kenapa dianjurkan menghindarinya',
          href: 'https://react.dev/reference/react/Children',
          source: 'React',
          note: 'Peringatan resmi bahwa menelusuri `children` rapuh, beserta alternatif yang dianjurkan.',
        },
        {
          label: 'ARIA: aria-expanded',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded',
          source: 'MDN Web Docs',
          note: 'Atribut yang wajib dikelola komponen, bukan diserahkan ke pemanggil.',
        },
        {
          label: 'ARIA: disclosure pattern',
          href: 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/',
          source: 'W3C WAI-ARIA APG',
          note: 'Pola resmi buka-tutup konten — dasar perilaku accordion yang benar.',
        },
      ),
    ],
  ),

  written(
    'render-props',
    'Render Props & `children` sebagai fungsi',
    10,
    'Menyerahkan keputusan rendering ke pemanggil.',
    [
      p(
        'Render props adalah pola di mana sebuah komponen tidak menentukan tampilannya sendiri, melainkan menerima **fungsi** yang mengembalikan JSX. Komponen menyediakan datanya; pemanggil memutuskan bentuknya.',
      ),

      terms(
        {
          term: 'render props',
          meaning:
            'Pola di mana sebuah komponen tidak menentukan tampilannya sendiri, melainkan menerima **fungsi** yang mengembalikan JSX. Pembagian tugasnya jelas: komponen menyediakan datanya, pemanggil memutuskan bentuknya.',
        },
        {
          term: 'children sebagai fungsi',
          meaning:
            'Varian render props yang menaruh fungsinya di antara tag pembuka dan penutup, bukan sebagai prop bernama. Keduanya setara. Pakai `children` kalau hanya ada satu fungsi; pakai prop bernama kalau ada beberapa slot berbeda — nama membuat pemakaiannya terbaca.',
        },
        {
          term: 'generic `<T>`',
          meaning:
            'Notasi TypeScript untuk "tipe yang ditentukan saat dipakai". Pada `Daftar<T>`, ia berarti komponen ini bekerja untuk array apa pun — dan fungsi `render` yang kamu oper otomatis tahu tipe itemnya, tanpa kamu menuliskannya lagi.',
        },
        {
          term: 'slot',
          meaning:
            'Lubang di dalam sebuah komponen tempat pemanggil menyisipkan isinya sendiri. `renderHeader`, `renderRow`, `renderFooter` adalah tiga slot berbeda pada satu komponen tabel — dan itulah kasus di mana prop bernama mengalahkan `children`.',
        },
        {
          term: 'call site',
          meaning:
            'Baris tempat sebuah komponen atau fungsi **dipanggil**, bukan tempat ia didefinisikan. Ukuran keberhasilan sebuah API komponen ada di sini: apakah orang yang membaca `<Daftar ... />` bisa langsung paham tanpa membuka definisinya.',
        },
        {
          term: 'empty state',
          meaning:
            'Tampilan saat datanya nol. Prop `kosong` ada supaya keadaan ini punya jawaban yang jelas, bukan area kosong tanpa keterangan. Ini salah satu dari empat keadaan UI yang wajib ditangani setiap tampilan berdata.',
        },
        {
          term: 'HOC',
          meaning:
            'Singkatan *Higher-Order Component*. Pola lama untuk membungkus komponen secara massal, dibahas di sub-bab berikutnya. Disebut di tabel perbandingan supaya kamu bisa membedakannya dari render props — keduanya sering tertukar.',
        },
        {
          term: 'callback hell versi JSX',
          meaning:
            'Bentuk kode yang muncul saat tiga render props bersarang: indentasi terus menjorok dan alurnya sulit diikuti. Namanya meminjam dari masalah lama pada callback asinkron. Kalau sudah dua tingkat, pertimbangkan mengganti sebagiannya dengan custom hook.',
        },
      ),

      h2('Bentuknya'),
      code(
        'tsx',
        `
        'use client';

        type Props<T> = {
          items: T[];
          render: (item: T, indeks: number) => React.ReactNode;
          kosong?: React.ReactNode;
        };

        export function Daftar<T>({ items, render, kosong }: Props<T>) {
          if (items.length === 0) return <>{kosong ?? <p>Belum ada data.</p>}</>;
          return <ul>{items.map((item, i) => render(item, i))}</ul>;
        }
        `,
      ),
      code(
        'tsx',
        `
        <Daftar
          items={produk}
          kosong={<KeadaanKosong aksi="Tambah produk pertama" />}
          render={(p) => (
            <li key={p.id}>
              {p.nama} — {formatRupiah(p.harga)}
            </li>
          )}
        />
        `,
      ),
      p(
        'Perhatikan bahwa `Daftar` sendiri **tidak tahu** bagaimana bentuk satu baris harus terlihat, sebab ia hanya tahu bagaimana menangani daftar kosong dan bagaimana melakukan perulangan. Bentuk visual tiap baris sepenuhnya ditentukan oleh fungsi `render` yang dioper pemanggil, yang dipanggil sekali untuk tiap `item` beserta `indeks`-nya. Generic `<T>` pada `Props<T>` dan `Daftar<T>` berarti tipe `item` di dalam `render` otomatis mengikuti tipe array yang dioper lewat `items`, sehingga mengoper `produk: Produk[]` membuat parameter `p` di `render={(p) => ...}` otomatis bertipe `Produk`, tanpa kamu menuliskan tipenya secara manual.',
      ),

      h2('Varian `children` sebagai fungsi'),
      code(
        'tsx',
        `
        <Daftar items={produk}>
          {(p) => <li key={p.id}>{p.nama}</li>}
        </Daftar>

        // Implementasinya cuma berubah tipe children:
        type Props<T> = {
          items: T[];
          children: (item: T, indeks: number) => React.ReactNode;
        };
        `,
      ),
      p(
        'Keduanya setara. Pakai `children` kalau hanya ada satu fungsi; pakai prop bernama kalau ada beberapa slot yang berbeda (`renderHeader`, `renderRow`, `renderFooter`) — karena nama membuat call site terbaca.',
      ),

      h2('Kapan render props masih menang atas custom hook'),
      p(
        'Sebagian besar kasus "berbagi logika" sekarang lebih baik ditulis sebagai custom hook. Tetapi render props tetap unggul untuk satu hal, yaitu ketika komponennya juga **merender sesuatu** seperti struktur, pembungkus, atau perilaku DOM, dan bukan sekadar menghitung nilai.',
      ),
      code(
        'tsx',
        `
        // Komponen ini merender elemen pengamat DAN memberi statusnya.
        // Custom hook tidak bisa merender apa pun.
        <SaatTerlihat>
          {(terlihat) => <img src={terlihat ? asli : placeholder} alt="" />}
        </SaatTerlihat>
        `,
      ),
      p(
        'Contoh ini tepat sasaran karena `SaatTerlihat` melakukan **dua** hal yang tidak bisa dipisahkan, sebab ia memasang `IntersectionObserver` sebagai logika sekaligus merender elemen yang diamati observer itu. Custom hook bisa mengerjakan bagian pertama, tapi tidak bisa merender elemen apa pun, sehingga pemakainya tetap harus menyiapkan ref dan elemennya sendiri. Dengan render props, keduanya datang sepaket, karena komponen menyediakan elemen dan pengamatnya lalu **menyerahkan hasilnya** ke fungsi yang kamu tulis. Perhatikan fungsi itu menerima `terlihat` sebagai argumen dan bebas memakainya untuk apa saja. Di sini ia memilih antara gambar asli dan placeholder, tetapi bisa juga menjalankan animasi atau memuat data. Komponen tidak pernah menentukan tampilannya, sebab ia hanya menyediakan informasi.',
      ),
      table(
        ['Kebutuhan', 'Pilihan'],
        [
          ['Berbagi logika murni (nilai, efek, state)', 'Custom hook'],
          ['Berbagi logika **dan** merender struktur', 'Render props / children sebagai fungsi'],
          ['Beberapa komponen yang berbagi state', 'Compound component'],
          ['Membungkus komponen lain secara massal', 'HOC (pola lama — lihat sub-bab berikutnya)'],
        ],
      ),

      h2('Jebakan: fungsi baru setiap render'),
      p(
        'Fungsi render adalah fungsi baru di setiap render induk, jadi `React.memo` pada komponen penerimanya tidak akan menolong. Dengan React Compiler aktif hal ini sering ditangani otomatis; tanpanya, sadari bahwa memo di sini biasanya sia-sia.',
      ),
      callout(
        'warning',
        'Jangan bersarang terlalu dalam',
        'Tiga render props bersarang menghasilkan bentuk kode yang dulu disebut "callback hell" versi JSX — indentasi terus menjorok dan alurnya sulit diikuti. Kalau sudah sampai dua tingkat, pertimbangkan mengganti sebagiannya dengan custom hook.',
      ),
      references(
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Termasuk mengoper JSX dan fungsi sebagai prop — dasar teknis pola ini.',
        },
        {
          label: 'Reusing Logic with Custom Hooks',
          href: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
          source: 'React',
          note: 'Pengganti render props untuk kasus berbagi logika murni tanpa merender apa pun.',
        },
        {
          label: 'Generics',
          href: 'https://www.typescriptlang.org/docs/handbook/2/generics.html',
          source: 'TypeScript',
          note: 'Mekanisme di balik `Daftar<T>` yang membuat tipe item mengalir ke fungsi render.',
        },
        {
          label: 'memo',
          href: 'https://react.dev/reference/react/memo',
          source: 'React',
          note: 'Kenapa memo tidak menolong ketika prop-nya adalah fungsi yang dibuat ulang tiap render.',
        },
      ),
    ],
  ),

  written(
    'hoc',
    'Higher-Order Component',
    9,
    'Pola lama yang perlu dikenali saat membaca legacy code.',
    [
      p(
        'Higher-Order Component (HOC) adalah fungsi yang menerima komponen dan mengembalikan komponen baru yang sudah dibungkus. Namanya meminjam dari higher-order function di JavaScript. Sebelum hooks ada, ini adalah cara utama berbagi logika antar komponen.',
      ),

      terms(
        {
          term: 'Higher-Order Component (HOC)',
          meaning:
            'Fungsi yang **menerima komponen** dan **mengembalikan komponen baru** yang sudah dibungkus kemampuan tambahan. Namanya meminjam dari *higher-order function* di JavaScript — fungsi yang bekerja atas fungsi lain.',
        },
        {
          term: 'awalan `with`',
          meaning:
            'Konvensi penamaan HOC memakai bentuk `withAuth`, `withTheme`, dan `withRouter`. Ini tanda pengenal paling cepat saat membaca kode lama. Tanda keduanya, **komponen yang diekspor bukan komponen yang didefinisikan**, sebab yang diekspor adalah hasil pembungkusan.',
        },
        {
          term: 'legacy code',
          meaning:
            'Kode yang sudah ada dan masih berjalan, ditulis dengan cara yang tidak lagi dianjurkan. Kamu tidak akan sering **menulis** HOC baru, tapi kamu akan **membacanya** — kode React sebelum 2019 penuh pola ini, dan banyak library masih memakainya.',
        },
        {
          term: 'displayName',
          meaning:
            'Properti yang menentukan nama sebuah komponen di React DevTools. HOC yang tidak mengaturnya membuat pohon komponen berisi `Unknown` atau `Anonymous` — dan menelusuri masalah di pohon tanpa nama jauh lebih lambat.',
        },
        {
          term: 'tabrakan nama prop',
          meaning:
            'Dua HOC yang sama-sama menyuntikkan prop bernama `data` akan saling menimpa **tanpa peringatan apa pun**. Ini kelas bug yang tidak mungkin terjadi pada custom hook, karena di sana kamu sendiri yang menamai hasilnya.',
        },
        {
          term: 'wrapper hell',
          meaning:
            'Bentuk `withAuth(withTheme(withRouter(withData(Komponen))))`. Empat lapisan tambahan di pohon komponen dan di DevTools, dan urutannya diam-diam bermakna. Ini analog dari "callback hell" pada pola sebelumnya.',
        },
        {
          term: 'React.ComponentType<P>',
          meaning:
            'Tipe TypeScript untuk "apa pun yang bisa dipakai sebagai komponen React yang menerima props bertipe `P`". Dipakai HOC karena ia harus menerima komponen apa pun — dan justru keumuman inilah yang membuat tipenya sering berakhir sebagai `any`.',
        },
        {
          term: 'spread props (`{...props}`)',
          meaning:
            'Meneruskan seluruh props yang diterima pembungkus ke komponen di dalamnya. Praktis, tapi ia juga penyebab masalah "sumber prop tidak terlihat": membaca komponen anak, kamu tidak tahu sebuah prop datang dari mana tanpa menelusuri rantai pembungkusnya.',
        },
      ),

      h2('Bentuknya'),
      code(
        'tsx',
        `
        function withAuth<P extends object>(Komponen: React.ComponentType<P>) {
          return function KomponenTerlindungi(props: P) {
            const { user, memuat } = useSesi();

            if (memuat) return <Skeleton />;
            if (!user) return <Redirect ke="/masuk" />;

            return <Komponen {...props} />;
          };
        }

        const DasborTerlindungi = withAuth(Dasbor);
        `,
      ),
      p(
        'Baca `withAuth` sebagai fungsi biasa yang menerima satu komponen dan mengembalikan komponen baru, dan bukan sihir apa pun. `<P extends object>` adalah generic yang berarti "apa pun bentuk props komponen aslinya, pertahankan bentuk itu", sedangkan `React.ComponentType<P>` adalah tipe untuk "komponen React yang menerima props bertipe `P`". Fungsi `KomponenTerlindungi` yang dikembalikan **membungkus** `Komponen` asli, sebab ia memeriksa sesi lebih dulu lalu hanya merender `<Komponen {...props} />`, yang meneruskan seluruh props yang diterimanya apa adanya, kalau pemeriksaan itu lolos. `DasborTerlindungi` yang dihasilkan `withAuth(Dasbor)` bukan `Dasbor` itu sendiri, melainkan komponen baru yang **merender** `Dasbor` di dalamnya setelah pemeriksaan sesi selesai. Kalau kamu merender `<DasborTerlindungi />`, yang sebenarnya terjadi adalah `KomponenTerlindungi` dirender, dan ia baru merender `Dasbor` kalau `user` ada.',
      ),

      h2('Kenapa kamu tetap perlu mengenalinya'),
      p(
        'Kamu tidak akan sering menulis HOC baru, tapi kamu akan **membacanya**. Banyak library masih memakainya, dan kode React yang ditulis sebelum 2019 penuh dengan pola ini. Tanda pengenalnya: nama berawalan `with`, dan komponen yang diekspor bukan komponen yang didefinisikan.',
      ),

      h2('Masalah yang membuatnya ditinggalkan'),
      ol(
        '**Nama komponen hilang di React DevTools.** Pohon komponen berisi `Unknown` atau `Anonymous` kecuali kamu mengatur `displayName` sendiri.',
        '**Tabrakan nama prop.** Dua HOC yang sama-sama menyuntik prop `data` akan saling menimpa tanpa peringatan.',
        '**Sumber prop tidak terlihat.** Membaca komponen anak, kamu tidak tahu prop itu datang dari mana — harus menelusuri rantai pembungkusnya.',
        '**Wrapper hell.** `withAuth(withTheme(withRouter(withData(Komponen))))` menambah empat lapis di pohon DOM dan di DevTools.',
        '**Tipe TypeScript jadi rumit.** Menyimpulkan tipe melalui beberapa lapisan HOC sering berakhir dengan `any`.',
      ),

      h2('Penggantinya: custom hook'),
      compare(
        {
          title: 'HOC',
          lang: 'tsx',
          code: `
          const Dasbor = withAuth(function Dasbor({ user }) {
            return <h1>Halo {user.nama}</h1>;
          });

          // Dari mana 'user' datang?
          // Harus baca withAuth untuk tahu.
          `,
          notes: ['Satu lapisan tambahan di pohon', 'Asal prop tidak terlihat'],
        },
        {
          title: 'Custom hook',
          lang: 'tsx',
          code: `
          function Dasbor() {
            const { user, memuat } = useSesi();

            if (memuat) return <Skeleton />;
            if (!user) return <Redirect ke="/masuk" />;

            return <h1>Halo {user.nama}</h1>;
          }
          `,
          notes: ['Tidak ada lapisan tambahan', 'Sumber setiap nilai terbaca di tempat'],
        },
      ),
      p(
        'Komentar di kolom kiri menyebut keluhan yang paling nyata, yaitu `user` muncul sebagai prop **tanpa ada yang mengopernya di call site**. Untuk tahu dari mana ia datang, pembaca harus membuka `withAuth`, dan kalau ada dua HOC bertumpuk, ia harus membuka keduanya sambil menebak mana yang menyuntikkan prop yang mana. Masalahnya bertambah saat dua HOC kebetulan menyuntikkan prop bernama sama, sebab yang terluar menang secara diam-diam. Kolom kanan menghapus seluruh kelas masalah itu karena `useSesi()` **terlihat di dalam komponen**, tepat di baris yang memakainya. Perhatikan keuntungan kedua yang mudah terlewat, yaitu penanganan `memuat` dan `!user` kini berada di komponen itu sendiri sebagai early return biasa, alih-alih tersembunyi di dalam pembungkus yang perilakunya sama untuk semua komponen yang ia bungkus.',
      ),

      h2('Yang masih pantas jadi HOC'),
      p(
        'Ada satu kategori yang tidak bisa digantikan hook, karena hook tidak bisa merender apa pun di sekitar komponen: pembungkus yang benar-benar **menambah elemen**. `React.memo` sendiri adalah HOC. Begitu juga pembungkus error boundary dan beberapa integrasi analitik. Di luar itu, pilih custom hook.',
      ),
      callout(
        'tip',
        'Kalau harus menulis HOC',
        'Selalu set `displayName` (`KomponenTerlindungi.displayName = \\`withAuth(${Komponen.displayName ?? Komponen.name})\\`;`) dan teruskan `ref` dengan benar. Dua hal ini yang paling sering dilupakan, dan keduanya baru terasa saat kamu sedang men-debug sesuatu yang lain.',
      ),
      references(
        {
          label: 'memo — sebuah HOC bawaan React',
          href: 'https://react.dev/reference/react/memo',
          source: 'React',
          note: 'Contoh HOC yang masih relevan karena ia benar-benar membungkus, bukan sekadar berbagi logika.',
        },
        {
          label: 'Reusing Logic with Custom Hooks',
          href: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
          source: 'React',
          note: 'Pengganti resmi HOC untuk berbagi logika, tanpa lapisan tambahan di pohon komponen.',
        },
        {
          label: 'Manipulating the DOM with Refs',
          href: 'https://react.dev/learn/manipulating-the-dom-with-refs',
          source: 'React',
          note: 'Meneruskan `ref` melewati pembungkus — hal kedua yang paling sering dilupakan penulis HOC.',
        },
        {
          label: 'React Developer Tools',
          href: 'https://react.dev/learn/react-developer-tools',
          source: 'React',
          note: 'Alat tempat hilangnya nama komponen akibat `displayName` yang tidak diatur benar-benar terasa.',
        },
      ),
    ],
  ),

  written(
    'custom-hook-pengganti',
    'Custom Hook sebagai pengganti HOC & render props',
    11,
    'Berbagi logika tanpa membungkus pohon komponen.',
    [
      p(
        'Custom hook adalah fungsi biasa yang namanya diawali `use` dan boleh memanggil hook lain. Itu seluruh definisinya — tidak ada API khusus, tidak ada pendaftaran. Kesederhanaan itulah yang membuatnya menggantikan dua pola sebelumnya.',
      ),

      terms(
        {
          term: 'custom hook',
          meaning:
            'Fungsi biasa yang namanya diawali `use` dan boleh memanggil hook lain. Itu **seluruh** definisinya — tidak ada API khusus, tidak ada pendaftaran, tidak ada pembungkus. Kesederhanaan itulah yang membuatnya menggantikan HOC dan render props.',
        },
        {
          term: 'berbagi logika, bukan state',
          meaning:
            'Salah paham paling sering tentang custom hook. Dua komponen yang memanggil `useUkuranJendela()` **tidak** berbagi satu state — masing-masing punya salinannya sendiri. Custom hook membagikan **resep**, bukan **nilainya**.',
        },
        {
          term: 'nilai bersama',
          meaning:
            'Kalau kamu benar-benar butuh satu nilai yang sama dibaca banyak komponen, itu **bukan** tugas custom hook. Itu tugas Context (untuk yang jarang berubah) atau store global dengan selector (untuk yang sering) — dibahas di Bab 5.',
        },
        {
          term: 'debounce',
          meaning:
            'Menunggu jeda setelah masukan terakhir sebelum bertindak. Bagian yang membuatnya benar-benar bekerja ada di cleanup: `clearTimeout` membatalkan timer lama **setiap kali** nilainya berubah. Tanpa itu, ia cuma menunda semua ketikan, bukan menggabungkannya.',
        },
        {
          term: 'cleanup',
          meaning:
            'Fungsi yang di-`return` dari dalam Effect untuk membatalkan sinkronisasi sebelumnya — melepas listener, membatalkan timer, menutup koneksi. Setiap custom hook yang memasang sesuatu ke dunia luar wajib punya pasangannya.',
        },
        {
          term: 'resize listener',
          meaning:
            'Langganan ke event `resize` pada `window`, yang menyala tiap kali ukuran jendela berubah. Contoh klasik pekerjaan custom hook: satu langganan, satu pembatalan, dan komponen pemakainya tidak perlu tahu detail apa pun.',
        },
        {
          term: 'awalan `use`',
          meaning:
            'Bukan sekadar konvensi penamaan. Awalan inilah yang membuat `eslint-plugin-react-hooks` tahu bahwa aturan hooks berlaku di dalam fungsi itu. Fungsi yang memanggil hook tanpa awalan `use` tidak akan diperiksa — pelanggarannya lolos diam-diam.',
        },
        {
          term: 'generic `<T>`',
          meaning:
            'Pada `useDebounce<T>(nilai: T): T`, ia berarti "apa pun tipe yang kamu masukkan, itu juga yang keluar". String masuk, string keluar — tanpa perlu menulis satu versi hook per tipe, dan tanpa kehilangan tipe di sisi pemanggil.',
        },
      ),

      h2('Dari HOC ke hook'),
      code(
        'ts',
        `
        // Satu fungsi, tanpa komponen pembungkus.
        export function useUkuranJendela() {
          const [ukuran, setUkuran] = useState({ lebar: 0, tinggi: 0 });

          useEffect(() => {
            function ukur() {
              setUkuran({ lebar: window.innerWidth, tinggi: window.innerHeight });
            }

            ukur();                                   // ukur sekali saat pasang
            window.addEventListener('resize', ukur);
            return () => window.removeEventListener('resize', ukur);
          }, []);

          return ukuran;
        }
        `,
      ),
      p(
        'Bandingkan dengan `withAuth` di sub-bab sebelumnya, sebab HOC menghasilkan **komponen baru** yang membungkus komponen lain, sementara `useUkuranJendela` hanyalah fungsi yang mengembalikan **nilai**. Tidak ada lapisan tambahan di pohon komponen, dan tidak ada `props` yang perlu diteruskan lewat `{...props}`, sehingga komponen yang memakainya cukup memanggil `const { lebar } = useUkuranJendela()` seperti memanggil `useState`. Effect di dalamnya mengukur ulang setiap kali jendela berubah ukuran, dan fungsi yang dikembalikan (`() => window.removeEventListener(...)`) memastikan pendengar `resize` itu dilepas saat komponen yang memakai hook ini dilepas, yaitu pola cleanup yang sama dengan Bab 7. Karena logikanya berdiri sendiri di luar komponen mana pun, hook yang sama bisa dipanggil dari sepuluh komponen berbeda tanpa satu pun perlu tahu bagaimana ia bekerja di dalamnya.',
      ),

      h2('Yang dibagi adalah logika, bukan state'),
      p(
        'Ini salah paham paling sering. Dua komponen yang memanggil `useUkuranJendela()` **tidak** berbagi satu state — masing-masing punya salinannya sendiri. Custom hook membagikan **resep**, bukan **nilainya**.',
      ),
      code(
        'tsx',
        `
        function A() {
          const { lebar } = useUkuranJendela();  // state milik A
        }

        function B() {
          const { lebar } = useUkuranJendela();  // state milik B, terpisah
        }
        `,
      ),
      p(
        'Kalau kamu benar-benar butuh satu nilai bersama, itu bukan tugas custom hook — itu tugas Context atau store global (Bab 5).',
      ),

      h2('Contoh yang langsung berguna'),
      code(
        'ts',
        `
        // Menunda nilai sampai pengetikan berhenti.
        export function useDebounce<T>(nilai: T, jeda = 300): T {
          const [tertunda, setTertunda] = useState(nilai);

          useEffect(() => {
            const timer = setTimeout(() => setTertunda(nilai), jeda);
            // Cleanup membatalkan timer lama setiap kali nilai berubah —
            // inilah yang membuatnya benar-benar "debounce".
            return () => clearTimeout(timer);
          }, [nilai, jeda]);

          return tertunda;
        }
        `,
      ),
      code(
        'ts',
        `
        // Membaca dan menulis localStorage dengan aman.
        export function usePenyimpanan<T>(kunci: string, awal: T) {
          const [nilai, setNilai] = useState<T>(awal);
          const [terhidrasi, setTerhidrasi] = useState(false);

          // Server tidak punya localStorage, jadi pembacaan dilakukan setelah pasang.
          useEffect(() => {
            try {
              const tersimpan = window.localStorage.getItem(kunci);
              if (tersimpan !== null) setNilai(JSON.parse(tersimpan) as T);
            } catch {
              // Penyimpanan diblokir atau isinya rusak: pakai nilai awal, jangan gagalkan render.
            }
            setTerhidrasi(true);
          }, [kunci]);

          function simpan(baru: T) {
            setNilai(baru);
            try {
              window.localStorage.setItem(kunci, JSON.stringify(baru));
            } catch {
              // Kuota penuh atau mode privat — nilai di memori tetap benar.
            }
          }

          return { nilai, simpan, terhidrasi };
        }
        `,
      ),
      p(
        'Hook ini mengembalikan **objek tiga field**, sesuai aturan "tiga atau lebih pakai objek" dari Bab 5, dan ketiganya menjawab kebutuhan berbeda, yakni `nilai` untuk ditampilkan, `simpan` untuk mengubah, dan `terhidrasi` untuk mengetahui apakah nilainya sudah bisa dipercaya. Perhatikan pembacaan dari `localStorage` sengaja ditaruh di dalam `useEffect` dan bukan sebagai nilai awal `useState`, sebab di server tidak ada `localStorage` sama sekali, jadi membacanya saat render akan langsung melempar error. Kedua blok `catch` yang isinya hanya komentar juga disengaja, sebab kegagalan penyimpanan **tidak boleh menggagalkan render**, dan nilai di memori tetap benar meski tidak tersimpan. Yang tersisa adalah masalah waktu, dan itulah tugas `terhidrasi` yang dijelaskan di kotak berikut.',
      ),
      callout(
        'info',
        'Kenapa ada `terhidrasi`',
        'Di SSR, render pertama di server selalu memakai nilai awal karena `localStorage` tidak ada di sana. Kalau komponen langsung menampilkan data tersimpan, React akan melaporkan hydration mismatch. Bendera `terhidrasi` memberi komponen cara menampilkan skeleton sampai nilainya benar-benar tersedia — pola yang dipakai website ini.',
      ),

      h2('Aturan menulis custom hook yang baik'),
      ul(
        '**Nama harus diawali `use`.** Bukan gaya penulisan — linter memakainya untuk menegakkan aturan hooks.',
        '**Satu tanggung jawab.** `useAuthAndThemeAndCart` adalah tiga hook yang menyamar jadi satu.',
        '**Kembalikan objek kalau lebih dari dua nilai**, array kalau pemanggil perlu menamai ulang (seperti `useState`).',
        '**Jangan mengekstrak sesuatu yang hanya dipakai sekali.** Hook dengan satu pemanggil biasanya cuma memindahkan kode, bukan menyederhanakannya.',
      ),
      references(
        {
          label: 'Reusing Logic with Custom Hooks',
          href: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
          source: 'React',
          note: 'Termasuk penegasan bahwa custom hook berbagi logika, bukan state.',
        },
        {
          label: 'Rules of Hooks',
          href: 'https://react.dev/reference/rules/rules-of-hooks',
          source: 'React',
          note: 'Alasan awalan `use` bukan sekadar gaya penulisan.',
        },
        {
          label: 'Window: resize event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event',
          source: 'MDN Web Docs',
          note: 'Sumber data untuk contoh `useUkuranJendela`, beserta kewajiban melepas listener-nya.',
        },
        {
          label: 'Window.localStorage',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
          source: 'MDN Web Docs',
          note: 'Termasuk kondisi yang membuatnya melempar error — kuota penuh dan mode privat.',
        },
      ),
    ],
  ),

  written(
    'controlled-uncontrolled-api',
    'Controlled vs Uncontrolled sebagai pola API',
    11,
    'Membiarkan pemanggil memilih siapa yang memegang state.',
    [
      p(
        'Kamu sudah mengenal controlled dan uncontrolled pada input form. Pola yang sama berlaku saat kamu **merancang komponen sendiri**: siapa yang memegang state — komponennya, atau yang memakainya?',
      ),

      terms(
        {
          term: 'controlled',
          meaning:
            'Artinya **terkendali**. Nilainya dipegang oleh **pemanggil**, dan komponen hanya menampilkan apa yang diberikan sambil melaporkan perubahan lewat callback. Konsekuensinya: pemanggil bisa mengubahnya dari mana saja, menyinkronkannya ke URL, atau menyimpannya.',
        },
        {
          term: 'uncontrolled',
          meaning:
            'Artinya **tak terkendali** — istilah teknis, bukan penilaian buruk. Nilainya dipegang **komponen itu sendiri**. Pemanggil cukup menyebut nilai awalnya lalu melepasnya. Paling ringkas untuk kasus biasa, tapi tidak bisa diubah dari luar.',
        },
        {
          term: 'defaultAktif / nilaiAwal',
          meaning:
            'Konvensi penamaan untuk prop yang hanya dibaca **sekali** saat komponen dipasang. Awalan `default` adalah sinyal ke pembaca: mengubahnya nanti tidak akan berpengaruh. React sendiri memakai konvensi ini pada `defaultValue` dan `defaultChecked`.',
        },
        {
          term: 'callback perubahan',
          meaning:
            'Prop bertipe fungsi seperti `onAktifChange` yang dipanggil komponen setiap kali nilainya seharusnya berubah. Dalam mode terkendali, ini **satu-satunya** cara komponen memengaruhi nilainya — ia melapor, pemanggil yang memutuskan.',
        },
        {
          term: 'mode ditentukan keberadaan prop',
          meaning:
            'Inti implementasinya: `const terkendali = nilai !== undefined`. Bukan sebuah prop `mode` terpisah, melainkan **ada-tidaknya** prop nilainya. Ini konvensi yang sama dengan `<input value>` vs `<input defaultValue>` di React.',
        },
        {
          term: 'as const',
          meaning:
            'Penanda TypeScript yang mengubah `[sekarang, ubah]` dari "array berisi dua hal" menjadi **tuple** dengan posisi bermakna. Tanpa ini, `const [nilai, ubah] = ...` akan kehilangan tipe masing-masing elemen.',
        },
        {
          term: 'optional call (`?.()`)',
          meaning:
            'Bentuk `onChange?.(baru)` berarti "panggil kalau ada, diam kalau tidak". Karena callback-nya opsional, ini yang mencegah error saat pemanggil memakai mode tak terkendali dan tidak mengoper apa pun.',
        },
        {
          term: 'komponen library',
          meaning:
            'Komponen yang dipakai banyak tempat dengan kebutuhan berbeda-beda — tab, dialog, select, date picker. Justru untuk kategori inilah mendukung **kedua mode** berbayar; untuk komponen sekali pakai, memilih satu mode sudah cukup.',
        },
      ),

      h2('Dua bentuknya'),
      compare(
        {
          title: 'Uncontrolled — komponen yang pegang',
          lang: 'tsx',
          code: `
          <Tabs defaultAktif="profil" />

          // Pemanggil tidak perlu state apa pun.
          // Tapi juga tidak bisa mengubahnya dari luar.
          `,
          notes: ['Paling ringkas untuk kasus biasa'],
        },
        {
          title: 'Controlled — pemanggil yang pegang',
          lang: 'tsx',
          code: `
          const [aktif, setAktif] = useState('profil');

          <Tabs aktif={aktif} onAktifChange={setAktif} />

          // Pemanggil bisa mengubahnya dari mana saja,
          // menyinkronkan ke URL, atau menyimpannya.
          `,
          notes: ['Perlu state di pemanggil, tapi bisa dikendalikan penuh'],
        },
      ),

      h2('Mendukung keduanya sekaligus'),
      p(
        'Komponen library yang baik mendukung dua-duanya. Polanya: kalau prop terkendali diberikan, pakai itu; kalau tidak, pakai state internal.',
      ),
      code(
        'ts',
        `
        'use client';

        export function useNilaiTerkendali<T>({
          nilai,
          nilaiAwal,
          onChange,
        }: {
          nilai?: T;
          nilaiAwal: T;
          onChange?: (baru: T) => void;
        }) {
          const [internal, setInternal] = useState(nilaiAwal);

          // Keberadaan prop 'nilai' yang menentukan modenya.
          const terkendali = nilai !== undefined;
          const sekarang = terkendali ? nilai : internal;

          function ubah(baru: T) {
            // Dalam mode terkendali, komponen TIDAK menyimpan apa pun sendiri —
            // ia hanya melapor. Pemanggil yang memutuskan.
            if (!terkendali) setInternal(baru);
            onChange?.(baru);
          }

          return [sekarang, ubah] as const;
        }
        `,
      ),
      p(
        'Baris `const terkendali = nilai !== undefined` adalah seluruh mekanismenya, yaitu **keberadaan prop yang menentukan mode** dan bukan sebuah flag terpisah. Itu penting karena pemanggil tidak perlu mengumumkan niatnya, sebab ia cukup mengoper `nilai` atau tidak. Dari situ `sekarang` memilih sumbernya, dan `ubah` berperilaku berbeda di tiap mode. Dalam mode tak terkendali ia memperbarui state internal **dan** melapor, sedangkan dalam mode terkendali ia **hanya melapor**, karena kalau ia ikut menyimpan sendiri akan ada dua source of truth yang bisa berbeda. `onChange?.()` dengan tanda tanya diperlukan karena prop itu opsional di kedua mode. Dan `as const` di akhir membuat TypeScript menyimpulkan tuple `[T, (baru: T) => void]` alih-alih array biasa, sehingga destructuring di pemanggil mendapat tipe yang tepat per posisi.',
      ),
      code(
        'tsx',
        `
        export function Tabs({ aktif, defaultAktif, onAktifChange, children }: Props) {
          const [sekarang, ubah] = useNilaiTerkendali({
            nilai: aktif,
            nilaiAwal: defaultAktif ?? 'pertama',
            onChange: onAktifChange,
          });

          return <KonteksTabs value={{ sekarang, ubah }}>{children}</KonteksTabs>;
        }
        `,
      ),

      h2('Konvensi penamaan yang sudah baku'),
      table(
        ['Prop', 'Arti'],
        [
          ['`nilai` / `value`', 'Mode terkendali — pemanggil pegang'],
          ['`defaultNilai` / `defaultValue`', 'Mode tak terkendali — nilai awal saja'],
          ['`onNilaiChange`', 'Dipanggil setiap kali nilainya berubah'],
        ],
        'Ikuti konvensi ini persis. Pemakai komponenmu sudah mengenalnya dari elemen HTML.',
      ),

      h2('Jebakan yang sering terjadi'),
      callout(
        'danger',
        'Jangan pernah beralih mode di tengah jalan',
        'Komponen yang awalnya menerima `nilai={undefined}` lalu berubah menjadi `nilai="a"` akan melompat dari tak terkendali ke terkendali. React memperingatkan ini pada input bawaan, dan pada komponen buatan sendiri akibatnya bisa lebih membingungkan. Penyebab tersering: nilai yang belum selesai dimuat. Solusinya jangan render komponennya sampai datanya siap, atau berikan nilai awal yang bukan `undefined`.',
      ),
      callout(
        'warning',
        'Mode terkendali tanpa handler = input yang beku',
        'Kalau pemanggil memberi `nilai` tapi lupa `onChange`, komponennya tidak akan pernah berubah — dan tidak ada error apa pun. Ini bug yang tampak seperti "komponennya rusak". Di mode pengembangan, pertimbangkan menuliskan peringatan eksplisit untuk kombinasi itu.',
      ),
      references(
        {
          label: 'Controlled and uncontrolled components',
          href: 'https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components',
          source: 'React',
          note: 'Definisi resmi dua mode ini, dan kenapa keduanya sah untuk komponen buatan sendiri.',
        },
        {
          label: '<input> — value vs defaultValue',
          href: 'https://react.dev/reference/react-dom/components/input',
          source: 'React',
          note: 'Konvensi penamaan yang wajib diikuti komponenmu, termasuk peringatan saat mode berpindah.',
        },
        {
          label: 'You Might Not Need an Effect — controlling a component',
          href: 'https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes',
          source: 'React',
          note: 'Kenapa menyalin prop terkendali ke state internal lewat Effect adalah jalan yang salah.',
        },
        {
          label: 'const assertions (as const)',
          href: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions',
          source: 'TypeScript',
          note: 'Penanda yang membuat return value terbaca sebagai tuple, bukan array biasa.',
        },
      ),
    ],
  ),

  written(
    'polymorphic-component',
    'Polymorphic Component (`as` prop)',
    12,
    'Satu komponen, banyak elemen keluaran.',
    [
      p(
        'Polymorphic component adalah komponen yang membiarkan pemanggil menentukan **elemen HTML apa** yang akhirnya dirender, lewat prop `as`. Satu `<Teks>` bisa keluar sebagai `<p>`, `<span>`, `<h1>`, atau bahkan komponen lain.',
      ),

      terms(
        {
          term: 'polymorphic',
          meaning:
            'Dibaca "polimorfik", artinya **berbentuk banyak**. Komponen yang membiarkan pemanggil menentukan elemen HTML apa yang akhirnya dirender. Satu `<Teks>` bisa keluar sebagai `<p>`, `<span>`, `<h1>`, atau bahkan komponen lain.',
        },
        {
          term: 'prop `as`',
          meaning:
            'Prop yang membawa **elemen tujuan**: `as="a"`, `as="h1"`, atau `as={Link}`. Konvensi ini dipakai hampir semua design system modern, jadi pemakai komponenmu kemungkinan besar sudah mengenalnya.',
        },
        {
          term: 'ElementType',
          meaning:
            'Tipe React untuk "apa pun yang sah dirender sebagai elemen" — nama tag HTML seperti `\'a\'`, atau sebuah komponen. Generic `T extends ElementType` inilah yang membuat TypeScript tahu prop apa yang sah untuk elemen tujuannya.',
        },
        {
          term: 'ComponentPropsWithoutRef<T>',
          meaning:
            'Tipe React yang mengambil **seluruh props sah** milik elemen `T` — `href` untuk `<a>`, `type` dan `disabled` untuk `<button>`. Ini yang membuat `as="a" href="/x"` lolos type-check sementara `href` pada `<button>` ditolak.',
        },
        {
          term: 'Omit untuk mencegah tabrakan',
          meaning:
            "Bagian `Omit<ComponentPropsWithoutRef<T>, keyof PropsSendiri | 'as'>` menyingkirkan props bawaan elemen yang namanya bentrok dengan props milik komponenmu. Aturannya jelas: kalau namanya sama, **milik komponenmu yang menang**.",
        },
        {
          term: 'semantik',
          meaning:
            'Makna sebuah elemen bagi browser dan teknologi bantu, terlepas dari tampilannya. Inilah yang membuat `as` berbahaya kalau dipakai sembarangan: **ia mengubah semantik, bukan cuma tampilan**.',
        },
        {
          term: 'div yang bisa diklik',
          meaning:
            'Anti-pattern yang dimungkinkan prop `as`. `<Tombol as="div" onClick={...}>` terlihat seperti tombol tapi bukan tombol: tidak bisa difokus dengan Tab, tidak merespons Enter atau Spasi, dan dibaca screen reader sebagai teks biasa. Kalau bisa diklik, ia harus `<button>` atau `<a>`. Selalu.',
        },
        {
          term: 'button vs a',
          meaning:
            'Garis pemisahnya soal **perilaku**, bukan tampilan. Menjalankan aksi di halaman ini → `<button>`. Pindah ke alamat lain → `<a href>`, karena hanya `<a>` yang bisa dibuka di tab baru, disalin alamatnya, dan dibaca sebagai tautan.',
        },
      ),

      h2('Masalah yang ia selesaikan'),
      p(
        'Tombol yang menavigasi seharusnya berupa `<a>`, bukan `<button>` — karena hanya `<a>` yang bisa dibuka di tab baru, disalin alamatnya, dan dibaca screen reader sebagai tautan. Tapi kamu tetap ingin tampilan tombolmu. Tanpa `as`, kamu terpaksa menduplikasi seluruh style ke komponen kedua.',
      ),
      code(
        'tsx',
        `
        <Tombol>Simpan</Tombol>                          {/* <button> */}
        <Tombol as="a" href="/produk">Lihat produk</Tombol>  {/* <a> */}
        <Tombol as={Link} href="/kelas">Mulai belajar</Tombol> {/* <Link> Next.js */}
        `,
      ),

      h2('Mengetiknya dengan benar'),
      code(
        'tsx',
        `
        import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

        type PropsSendiri = {
          variant?: 'primary' | 'ghost';
          size?: 'sm' | 'md';
          children: ReactNode;
        };

        type PropsPolimorfik<T extends ElementType> = PropsSendiri & {
          as?: T;
          // Omit mencegah tabrakan: kalau elemen tujuan punya prop bernama sama
          // dengan milik kita, milik kita yang menang.
        } & Omit<ComponentPropsWithoutRef<T>, keyof PropsSendiri | 'as'>;

        export function Tombol<T extends ElementType = 'button'>({
          as,
          variant = 'primary',
          size = 'md',
          children,
          ...sisa
        }: PropsPolimorfik<T>) {
          const Komponen = as ?? 'button';

          return (
            <Komponen className={kelas(variant, size)} {...sisa}>
              {children}
            </Komponen>
          );
        }
        `,
        { filename: 'src/components/ui/tombol.tsx' },
      ),
      p(
        'Generic `T extends ElementType` inilah yang membuat TypeScript tahu prop apa yang sah. Dengan `as="a"`, ia menerima `href`; dengan default `button`, ia menerima `type` dan `disabled` — dan menolak `href` sebagai error.',
      ),

      h2('Aksesibilitas: bagian yang paling sering salah'),
      callout(
        'danger',
        '`as` mengubah semantik, bukan cuma tampilan',
        'Menulis `<Tombol as="div" onClick={...}>` menghasilkan sesuatu yang **terlihat** seperti tombol tapi bukan tombol: tidak bisa difokus dengan Tab, tidak merespons Enter atau Spasi, dan dibaca screen reader sebagai teks biasa. Kalau ia bisa diklik, ia harus `<button>` atau `<a>`. Selalu.',
      ),
      table(
        ['Perilakunya', 'Elemen yang benar'],
        [
          ['Menjalankan aksi di halaman ini', '`<button>`'],
          ['Pindah ke alamat lain', '`<a href>` atau `<Link>`'],
          ['Membuka dialog / menu', '`<button>` dengan `aria-expanded`'],
          ['Tidak bisa diklik sama sekali', 'Elemen apa pun'],
        ],
      ),

      h2('Biaya yang perlu dipertimbangkan'),
      ul(
        'Tipenya rumit dan pesan errornya panjang — orang yang salah memakainya butuh waktu memahami keluhan TypeScript.',
        'Meneruskan `ref` pada komponen polimorfik menambah satu lapisan generic lagi.',
        'Terlalu banyak kebebasan bisa dipakai untuk melanggar semantik, seperti contoh `as="div"` di atas.',
      ),
      p(
        'Karena itu batasi pemakaiannya. Untuk kebanyakan project, dua atau tiga komponen dasar (`Tombol`, `Teks`, `Kotak`) sudah cukup — sisanya lebih baik jadi komponen terpisah yang jelas maksudnya.',
      ),
      references(
        {
          label: '<button>',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button',
          source: 'MDN Web Docs',
          note: 'Perilaku bawaan yang hilang saat kamu menggantinya dengan `<div>`: fokus, Enter, Spasi.',
        },
        {
          label: '<a>: The Anchor element',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a',
          source: 'MDN Web Docs',
          note: 'Kenapa perpindahan alamat harus memakai tautan, bukan tombol yang memanggil router.',
        },
        {
          label: 'Common components — props bawaan tiap elemen',
          href: 'https://react.dev/reference/react-dom/components/common',
          source: 'React',
          note: 'Sumber tipe yang dibaca `ComponentPropsWithoutRef<T>` saat menentukan prop mana yang sah.',
        },
        {
          label: 'Omit<Type, Keys>',
          href: 'https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys',
          source: 'TypeScript',
          note: 'Cara menyingkirkan props elemen yang namanya bentrok dengan props milik komponenmu.',
        },
      ),
    ],
  ),

  written(
    'error-suspense-boundary',
    'Error Boundary & Suspense Boundary',
    12,
    'Membatasi dampak kegagalan dan penantian.',
    [
      p(
        'Keduanya adalah **boundary**: komponen yang menangkap sesuatu dari pohon di bawahnya. Error Boundary menangkap error saat render; Suspense Boundary menangkap penantian. Tanpa keduanya, satu komponen yang gagal atau lambat menjatuhkan seluruh halaman.',
      ),

      terms(
        {
          term: 'boundary',
          meaning:
            'Artinya **batas**. Komponen yang menangkap sesuatu dari pohon di bawahnya sehingga tidak merambat ke atas. Error Boundary menangkap **error saat render**; Suspense Boundary menangkap **penantian**. Tanpa keduanya, satu komponen yang gagal atau lambat menjatuhkan seluruh halaman.',
        },
        {
          term: 'class component',
          meaning:
            'Cara lama menulis komponen React, memakai `class ... extends Component`. Sampai hari ini Error Boundary **hanya** bisa ditulis begini — belum ada padanan hook-nya. Ini satu-satunya alasan tersisa untuk menulis class di React modern.',
        },
        {
          term: 'getDerivedStateFromError',
          meaning:
            'Metode statis yang React panggil saat render anak melempar error. Tugasnya satu: mengembalikan state baru sehingga komponen berpindah menampilkan fallback. Ia tidak boleh punya efek samping — pelaporan dikerjakan metode berikutnya.',
        },
        {
          term: 'componentDidCatch',
          meaning:
            'Metode tempat error **dilaporkan** ke layanan pemantauan. Ia menerima error beserta `componentStack` — jejak komponen yang menunjukkan di bagian pohon mana error itu terjadi, informasi yang tidak ada di stack trace biasa.',
        },
        {
          term: 'fallback',
          meaning:
            'Tampilan pengganti saat isi sebenarnya belum bisa ditampilkan — karena gagal (Error Boundary) atau karena masih ditunggu (Suspense). Ia bukan tempelan: fallback yang buruk merusak tata letak, dan itu dibahas tepat di bawah.',
        },
        {
          term: 'Suspense',
          meaning:
            'Komponen bawaan React yang menampilkan `fallback` selama anak-anaknya belum siap. Di Next.js App Router ia sekaligus mekanisme **streaming**: server mengirim HTML yang sudah siap lebih dulu, lalu menambal bagian yang lambat.',
        },
        {
          term: 'streaming',
          meaning:
            'Mengirim HTML secara bertahap, bukan menunggu semuanya selesai. Efeknya nyata bagi pengguna: header dan kerangka halaman muncul seketika, bukan layar kosong sampai query paling lambat selesai.',
        },
        {
          term: 'layout shift',
          meaning:
            'Konten yang melompat karena sesuatu muncul dan mendorongnya. Penyebab paling umum: fallback yang jauh lebih kecil daripada isi aslinya. Ini bukan urusan estetika — ia diukur sebagai **CLS**, metrik yang dinilai mesin pencari.',
        },
        {
          term: 'CLS',
          meaning:
            'Singkatan *Cumulative Layout Shift*, salah satu Core Web Vitals. Ia menjumlahkan seberapa banyak konten bergeser tanpa diminta pengguna. Ambang baiknya **< 0,1**. Skeleton yang kira-kira setinggi isi aslinya adalah cara paling murah menjaganya.',
        },
      ),

      h2('Error Boundary'),
      p(
        'Sampai hari ini, Error Boundary **hanya** bisa ditulis sebagai class component — belum ada padanan hook-nya. Ini satu-satunya alasan tersisa untuk menulis class di React modern.',
      ),
      code(
        'tsx',
        `
        'use client';

        import { Component, type ReactNode } from 'react';

        type Props = { children: ReactNode; fallback: (coba: () => void) => ReactNode };
        type State = { error: Error | null };

        export class BatasError extends Component<Props, State> {
          state: State = { error: null };

          // Dipanggil saat render anak melempar error -> ubah state jadi fallback.
          static getDerivedStateFromError(error: Error): State {
            return { error };
          }

          // Tempat melaporkan ke layanan pemantauan.
          componentDidCatch(error: Error, info: React.ErrorInfo) {
            laporkan(error, info.componentStack);
          }

          render() {
            if (this.state.error !== null) {
              return this.props.fallback(() => this.setState({ error: null }));
            }
            return this.props.children;
          }
        }
        `,
      ),
      p(
        'Dua method bernama panjang itu punya pembagian tugas yang jelas, dan komentarnya sudah menandainya. `getDerivedStateFromError` bersifat **murni**, sebab ia hanya mengubah error menjadi state tanpa boleh melakukan apa pun selain itu, dan hasilnya membuat `render()` berpindah ke cabang fallback. `componentDidCatch` adalah tempat efek samping, yaitu melaporkan ke layanan pemantauan, dan hanya di sinilah `componentStack` tersedia, yaitu jejak komponen mana yang bersarang di mana saat error terjadi. Perhatikan `static` pada method pertama, sebab ia dipanggil pada kelasnya dan bukan pada instance, justru karena React memanggilnya sebelum komponen dianggap dalam keadaan sehat. Dan `render()` di bawah hanya punya dua cabang, yaitu menampilkan fallback saat ada error dan menampilkan anaknya saat tidak ada, sehingga seluruh mekanismenya lebih sederhana daripada nama-nama methodnya.',
      ),
      code(
        'tsx',
        `
        <BatasError
          fallback={(coba) => (
            <div role="alert">
              <p>Bagian ini gagal dimuat.</p>
              <button onClick={coba}>Coba lagi</button>
            </div>
          )}
        >
          <GrafikPenjualan />
        </BatasError>
        `,
      ),
      p(
        'Prop `fallback` di sini adalah **render prop**, pola yang dibahas lebih dalam beberapa sub-bab lalu, berupa fungsi yang dipanggil `BatasError` sendiri alih-alih JSX statis. Fungsi itu menerima satu argumen, `coba`, yang saat dipanggil menjalankan `this.setState({ error: null })` untuk mengosongkan kembali state error, sehingga `render()` kembali ke cabang `this.props.children` dan React **mencoba melakukan re-render** `GrafikPenjualan` dari awal. Itulah mekanisme di balik tombol "Coba lagi", sebab ia tidak memuat ulang halaman atau memanggil API apa pun melainkan sekadar meminta `BatasError` melupakan error yang tersimpan dan memberi komponen anaknya kesempatan kedua.',
      ),
      callout(
        'warning',
        'Yang TIDAK ditangkap Error Boundary',
        'Error di dalam event handler, di dalam `setTimeout`, di kode asinkron, dan error saat rendering di server. Semuanya harus ditangani dengan `try/catch` biasa. Error Boundary hanya menangkap yang terjadi **saat React merender**.',
      ),

      h2('Letakkan boundary di beberapa tempat, bukan satu'),
      p(
        'Satu Error Boundary di root berarti satu widget yang gagal mengosongkan seluruh halaman. Pasang boundary di sekitar bagian yang bisa gagal secara independen: setiap widget dasbor, setiap panel, setiap area berdata.',
      ),
      code(
        'tsx',
        `
        <Dasbor>
          <BatasError fallback={...}><Pendapatan /></BatasError>
          <BatasError fallback={...}><Kunjungan /></BatasError>
          <BatasError fallback={...}><Aktivitas /></BatasError>
        </Dasbor>
        `,
        { caption: 'Grafik yang gagal tidak menghilangkan dua grafik lainnya.' },
      ),

      h2('Suspense Boundary'),
      code(
        'tsx',
        `
        import { Suspense } from 'react';

        export default function Halaman() {
          return (
            <>
              {/* Tampil segera */}
              <Header />

              {/* Halaman terkirim duluan; bagian ini menyusul saat datanya siap. */}
              <Suspense fallback={<SkeletonDaftar />}>
                <DaftarProduk />
              </Suspense>

              <Suspense fallback={<SkeletonUlasan />}>
                <Ulasan />
              </Suspense>
            </>
          );
        }
        `,
      ),
      p(
        'Perhatikan ada **dua** `Suspense` yang terpisah, dan bukan satu yang membungkus keduanya, dan itu keputusan yang menentukan. Dengan boundary terpisah, `DaftarProduk` bisa muncul begitu datanya siap tanpa menunggu `Ulasan` yang mungkin jauh lebih lambat, sedangkan satu boundary bersama akan membuat keduanya menunggu yang paling lambat. `<Header />` sengaja diletakkan di luar keduanya karena ia tidak mengambil data apa pun, sehingga bisa dikirim seketika. Aturan yang bisa dibawa, letakkan boundary di sekitar bagian yang **bisa selesai secara independen**, dan biarkan yang tidak butuh data berada di luar semuanya.',
      ),
      p(
        'Di Next.js App Router, `Suspense` adalah mekanisme **streaming**: server mengirim HTML yang sudah siap lebih dulu, lalu menambal bagian yang lambat begitu datanya selesai. Pengguna melihat header dan kerangka halaman seketika, bukan layar kosong sampai query paling lambat selesai.',
      ),

      h2('Fallback harus memesan ruang'),
      callout(
        'danger',
        'Spinner kecil adalah penyebab layout shift',
        'Fallback yang jauh lebih kecil daripada isi aslinya membuat konten melompat saat datanya tiba — dan itu langsung merusak Cumulative Layout Shift. Buat skeleton yang **kira-kira setinggi** isi aslinya. Ini bukan urusan estetika; CLS adalah metrik yang dinilai mesin pencari dan dirasakan pengguna sebagai kekacauan.',
      ),

      h2('Keduanya dipakai bersama'),
      code(
        'tsx',
        `
        <BatasError fallback={(coba) => <GagalMuat onCoba={coba} />}>
          <Suspense fallback={<SkeletonDaftar />}>
            <DaftarProduk />
          </Suspense>
        </BatasError>
        `,
      ),
      p(
        'Urutannya penting: Error Boundary **di luar** Suspense. Kalau terbalik, error yang terjadi setelah data tiba tidak akan tertangkap oleh boundary yang sudah "selesai" menunggu.',
      ),
      callout(
        'info',
        'Di Next.js, keduanya punya bentuk berbasis file',
        '`loading.tsx` otomatis menjadi Suspense boundary untuk segmen rute itu, dan `error.tsx` otomatis menjadi Error Boundary-nya. Keduanya dibahas di Bab 8.',
      ),
      references(
        {
          label: 'Component — static getDerivedStateFromError',
          href: 'https://react.dev/reference/react/Component#static-getderivedstatefromerror',
          source: 'React',
          note: 'API resmi Error Boundary, termasuk daftar error yang justru TIDAK ia tangkap.',
        },
        {
          label: '<Suspense>',
          href: 'https://react.dev/reference/react/Suspense',
          source: 'React',
          note: 'Perilaku fallback dan aturan penempatan boundary.',
        },
        {
          label: 'Loading UI and Streaming',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/loading',
          source: 'Next.js',
          note: 'Bentuk berbasis file dari Suspense boundary di App Router.',
        },
        {
          label: 'Cumulative Layout Shift (CLS)',
          href: 'https://web.dev/articles/cls',
          source: 'web.dev',
          note: 'Metrik yang langsung memburuk ketika fallback tidak memesan ruang yang cukup.',
        },
      ),
    ],
  ),

  written('portal-layering', 'Portal & Layering', 10, 'Merender di luar pohon DOM induknya.', [
    p(
      'Portal merender anak ke node DOM **di luar** hierarki induknya, sambil tetap mempertahankan posisinya di pohon React. Ini terdengar aneh sampai kamu menemui masalah yang ia selesaikan.',
    ),

    terms(
      {
        term: 'portal',
        meaning:
          'Mekanisme React untuk merender anak ke node DOM **di luar** hierarki induknya, sambil tetap mempertahankan posisinya di pohon React. Terdengar aneh sampai kamu menemui masalah yang ia selesaikan — dan masalah itu selalu berupa CSS yang memenjarakan.',
      },
      {
        term: 'containing block',
        meaning:
          'Kotak acuan yang dipakai browser untuk menghitung posisi sebuah elemen. Inti masalahnya ada di sini: `position: fixed` biasanya relatif terhadap viewport, **kecuali** ada induk ber-`transform` atau `filter` — yang membuat containing block baru dan menariknya ke situ.',
      },
      {
        term: 'overflow: hidden',
        meaning:
          'Properti CSS yang memotong apa pun yang keluar dari batas sebuah elemen. Salah satu dari tiga properti yang "memenjarakan" anak-anaknya — modal yang lahir di dalamnya akan terpotong tanpa ada yang salah di kode React-mu.',
      },
      {
        term: 'z-index',
        meaning:
          'Angka yang menentukan elemen mana tampil di atas mana. Ia adalah sumber frustrasi klasik karena bekerja **di dalam konteks penumpukan**, bukan secara global — `z-index: 9999` bisa kalah oleh elemen ber-`z-index: 1` di konteks yang berbeda.',
      },
      {
        term: 'createPortal',
        meaning:
          'Fungsi dari `react-dom` bertanda tangan `createPortal(anak, wadahDOM)`. Argumen keduanya adalah node DOM sungguhan, biasanya `document.body`, dan itulah sebabnya ia tidak bisa berjalan di server tempat `document` tidak ada.',
      },
      {
        term: 'event bubbling lewat pohon React',
        meaning:
          'Bagian yang paling sering mengejutkan: meski elemennya ada di `<body>`, secara React ia tetap anak dari komponen yang membuatnya. **Event tetap menggelembung ke induk React**, bukan ke induk DOM. Context juga tetap mengalir, dan Error Boundary di atasnya tetap menangkap.',
      },
      {
        term: 'focus trap',
        meaning:
          'Mengunci fokus keyboard di dalam dialog selama ia terbuka, sehingga Tab tidak menyasar ke halaman di belakangnya. Portal **tidak** memberimu ini — ia hanya memindahkan elemen. Kunci fokus, tutup dengan `Esc`, dan pengembalian fokus tetap tanggung jawabmu.',
      },
      {
        term: 'top layer',
        meaning:
          'Lapisan khusus browser di atas seluruh isi halaman, tempat `<dialog>` yang dibuka dengan `showModal()` dirender. Karena ia berada di luar aliran penumpukan biasa, ia **bebas dari seluruh masalah `z-index` dan `overflow`** yang jadi alasan portal dibuat.',
      },
      {
        term: 'aria-modal="true"',
        meaning:
          'Atribut yang memberitahu teknologi bantu bahwa isi di luar dialog ini sedang tidak relevan. Ia bekerja bersama `role="dialog"` — dan keduanya wajib ada, karena portal tidak menambahkannya untukmu.',
      },
    ),

    h2('Masalahnya: CSS yang memenjarakan'),
    p(
      'Modal yang dirender di dalam elemen ber-`overflow: hidden` akan terpotong. Yang ber-`position: relative` di induk akan salah posisi. Yang berada di dalam elemen dengan `transform` akan kehilangan `position: fixed` — karena `transform` membuat containing block baru, dan `fixed` jadi relatif terhadapnya, bukan terhadap viewport.',
    ),
    code(
      'css',
      `
        /* Tiga properti ini "memenjarakan" anak-anaknya */
        .kartu {
          overflow: hidden;   /* modal terpotong */
          transform: scale(1); /* position: fixed jadi relatif ke sini */
          filter: blur(0);     /* sama efeknya dengan transform */
        }
        `,
    ),

    h2('Solusinya'),
    code(
      'tsx',
      `
        'use client';

        import { createPortal } from 'react-dom';

        export function Modal({ anak, terbuka }: { anak: React.ReactNode; terbuka: boolean }) {
          if (!terbuka) return null;

          // Dirender ke <body>, tapi tetap "anak" komponen ini di pohon React.
          return createPortal(
            <div className="lapisan-modal" role="dialog" aria-modal="true">
              {anak}
            </div>,
            document.body,
          );
        }
        `,
    ),
    p(
      '`createPortal(anak, wadahDOM)` menerima dua argumen, yaitu apa yang mau dirender dan **ke mana** ia sungguhan diletakkan di DOM. Dipanggil di dalam `return` sebuah komponen dan bukan sebagai efek samping, sehingga React tetap menganggapnya sebagai hasil render biasa, hanya saja lokasinya di HTML akhir bukan di dalam `<div>` induk `Modal` melainkan langsung anak dari `document.body`. Komentar di kode di atas menegaskan inti seluruh sub-bab ini. Elemen `lapisan-modal` lolos dari `overflow: hidden` atau `transform` induknya secara **DOM**, tetapi secara **pohon React**, tempat `props`, `context`, dan `key` berlaku, ia tidak pernah pindah dari tempatnya semula.',
    ),

    h2('Yang tetap mengikuti pohon React'),
    p(
      'Ini bagian yang paling sering mengejutkan: meski elemennya ada di `<body>`, secara React ia tetap anak dari komponen yang membuatnya. Artinya **event tetap menggelembung ke induk React**, bukan ke induk DOM.',
    ),
    code(
      'tsx',
      `
        function Kartu() {
          // onClick ini TETAP terpanggil saat tombol di dalam modal diklik,
          // walaupun secara DOM modalnya ada di <body>.
          return (
            <div onClick={() => console.log('kartu diklik')}>
              <Modal terbuka anak={<button>Klik</button>} />
            </div>
          );
        }
        `,
    ),
    p(
      'Context juga tetap mengalir, dan Error Boundary di atasnya tetap menangkap error dari dalam portal.',
    ),

    h2('SSR: portal tidak bisa berjalan di server'),
    code(
      'tsx',
      `
        'use client';

        export function Modal({ anak }: { anak: React.ReactNode }) {
          const [terpasang, setTerpasang] = useState(false);

          // document belum ada saat render di server.
          useEffect(() => setTerpasang(true), []);

          if (!terpasang) return null;
          return createPortal(anak, document.body);
        }
        `,
    ),
    p(
      'Render pertama di server selalu menghasilkan `terpasang === false`, sehingga komponen mengembalikan `null` dan tidak pernah memanggil `createPortal` di server, sehingga mencegah crash karena `document` memang tidak ada di sana. Effect dengan dependency array kosong `[]` baru berjalan **setelah** React selesai memasang komponennya di browser, mengubah `terpasang` menjadi `true` dan memicu satu render tambahan yang akhirnya benar-benar merender portalnya. Konsekuensinya, modal ini muncul sepersekian detik **setelah** halaman selesai dimuat dan bukan bersamaan dengan HTML awal. Itu cukup singkat untuk tidak terasa mengganggu, tetapi berarti komponen ini tidak boleh dipakai untuk sesuatu yang harus terlihat sejak render pertama.',
    ),

    h2('Portal tidak menyelesaikan aksesibilitas'),
    callout(
      'warning',
      'Yang masih jadi tanggung jawabmu',
      'Portal hanya memindahkan elemen. Dialog tetap wajib: mengunci fokus di dalamnya selama terbuka, menutup dengan `Esc`, mengembalikan fokus ke elemen pemicunya setelah ditutup, memberi `role="dialog"` dan `aria-modal="true"`, dan mencegah halaman di belakangnya ikut ter-scroll.',
    ),

    h2('Alternatif modern: `<dialog>` dan popover'),
    code(
      'tsx',
      `
        // Elemen <dialog> bawaan browser sudah menangani banyak hal di atas:
        // focus trap, Esc, dan lapisan atas (top layer) tanpa z-index sama sekali.
        <dialog ref={ref}>
          <form method="dialog">
            <button>Tutup</button>
          </form>
        </dialog>

        // ref.current?.showModal();
        `,
    ),
    p(
      'Untuk dialog sederhana, `<dialog>` sering lebih baik daripada portal buatan sendiri — ia dirender di *top layer* browser sehingga bebas dari seluruh masalah `z-index` dan `overflow` di atas. Portal tetap diperlukan untuk hal yang bukan dialog: tooltip, dropdown, dan toast yang perlu keluar dari pembungkusnya.',
    ),
    references(
      {
        label: 'createPortal',
        href: 'https://react.dev/reference/react-dom/createPortal',
        source: 'React',
        note: 'Termasuk penegasan bahwa event tetap menggelembung lewat pohon React, bukan pohon DOM.',
      },
      {
        label: 'Containing block',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Containing_block',
        source: 'MDN Web Docs',
        note: 'Kenapa `transform` dan `filter` membuat `position: fixed` berhenti mengacu ke viewport.',
      },
      {
        label: '<dialog>',
        href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog',
        source: 'MDN Web Docs',
        note: 'Elemen bawaan yang sudah menangani focus trap, Esc, dan top layer tanpa `z-index`.',
      },
      {
        label: 'ARIA: dialog (modal) pattern',
        href: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
        source: 'W3C WAI-ARIA APG',
        note: 'Daftar kewajiban aksesibilitas yang tetap jadi tanggung jawabmu setelah portal dipasang.',
      },
    ),
  ]),

  written(
    'praktik-refactor-compound',
    'Praktik: Refactor komponen boolean-heavy',
    12,
    'Mengubah API yang sudah mulai rusak.',
    [
      p(
        'Latihan ini memakai bentuk yang muncul di hampir semua codebase yang berumur: komponen yang tumbuh satu prop pada satu waktu, masing-masing masuk akal saat ditambahkan, sampai keseluruhannya tidak bisa lagi dipahami.',
      ),

      terms(
        {
          term: 'boolean-heavy',
          meaning:
            'Komponen yang API-nya didominasi prop bernilai benar/salah. Bentuk ini muncul di hampir semua codebase yang berumur, dan cara munculnya selalu sama: satu prop pada satu waktu, masing-masing masuk akal saat ditambahkan, sampai keseluruhannya tidak bisa lagi dipahami.',
        },
        {
          term: 'prop berpasangan',
          meaning:
            'Dua prop yang selalu muncul bersama, seperti `adaGambar` + `gambar`. Salah satunya **selalu bisa disimpulkan** dari yang lain — jadi keduanya adalah dua source of truth untuk satu fakta. Obatnya: hapus yang boolean, biarkan keberadaan nilainya yang menjawab.',
        },
        {
          term: 'kombinasi mustahil',
          meaning:
            'Gabungan prop yang sah menurut tipe tapi tidak berarti apa-apa — `adaGambar={false} gambarDiAtas`. Delapan boolean berarti **256 kombinasi**, dan sebagian besarnya tidak valid. Tipe yang mengizinkan impossible state adalah tipe yang belum selesai.',
        },
        {
          term: 'variant (varian)',
          meaning:
            "Satu prop bernilai terbatas yang menggantikan beberapa boolean: `variant?: 'datar' | 'terangkat' | 'interaktif'`. Ia mengubah 8 kombinasi menjadi 3 keadaan yang memang ada, dan sekaligus memberi nama pada masing-masing.",
        },
        {
          term: 'discriminated union',
          meaning:
            "Gabungan beberapa bentuk tipe yang dibedakan satu properti penanda — di sini `variant`. Inilah yang membuat `'interaktif'` **wajib** punya `onClick` sementara varian lain **tidak boleh** punya, diperiksa saat type-check.",
        },
        {
          term: 'never',
          meaning:
            'Tipe TypeScript untuk "nilai yang tidak mungkin ada". `onClick?: never` berarti "prop ini tidak boleh diisi pada varian ini" — cara menyatakan larangan lewat tipe, bukan lewat komentar yang bisa diabaikan.',
        },
        {
          term: 'make illegal states unrepresentable',
          meaning:
            'Prinsip yang menutup latihan ini: kalau sebuah keadaan tidak valid, buat ia **tidak bisa dinyatakan** — bukan divalidasi saat runtime. Error saat type-check lebih murah daripada bug di produksi, dan tidak butuh siapa pun mengingat aturannya.',
        },
        {
          term: 'kapan berhenti',
          meaning:
            'Bagian yang sering dilewatkan dari sebuah refactor. Compound component lebih panjang ditulis dan menambah satu konsep untuk dipahami. Kalau komponennya dipakai di tiga tempat dengan bentuk sama persis, berhenti di Langkah 2 — melanjutkan berarti membayar tanpa membeli apa pun.',
        },
      ),

      h2('Titik awal'),
      code(
        'tsx',
        `
        type PropsKartu = {
          judul: string;
          isi: string;
          gambar?: string;
          adaGambar?: boolean;
          gambarDiAtas?: boolean;
          adaTombol?: boolean;
          labelTombol?: string;
          onTombolKlik?: () => void;
          adaBadge?: boolean;
          teksBadge?: string;
          warnaBadge?: 'merah' | 'hijau';
          kompak?: boolean;
          berbayang?: boolean;
          bisaDiklik?: boolean;
          onKartuKlik?: () => void;
        };

        export function Kartu(props: PropsKartu) {
          // ...sekitar 80 baris kondisional
        }
        `,
      ),
      p(
        'Tipe ini adalah gejala yang paling mudah dikenali, dan ia tumbuh perlahan, sebab tidak ada satu commit pun yang salah, hanya deretan permintaan wajar yang masing-masing menambah satu prop. Perhatikan polanya, yaitu **delapan boolean** (`adaGambar`, `gambarDiAtas`, `adaTombol`, `adaBadge`, `kompak`, `berbayang`, `bisaDiklik`, dan pasangannya) yang secara matematis menghasilkan 256 kombinasi, sementara mungkin hanya selusin yang masuk akal. Perhatikan juga hampir semuanya opsional dengan tanda `?`, sehingga TypeScript tidak bisa membantu, sebab tipe ini menerima `<Kartu judul="a" isi="b" />` maupun kombinasi yang tidak berarti apa-apa dengan sama sahnya. Komentar "sekitar 80 baris kondisional" adalah akibat langsungnya, sebab setiap boolean menambah percabangan di dalam.',
      ),

      h2('Diagnosisnya'),
      ol(
        '**Prop berpasangan.** `adaGambar` + `gambar`, `adaBadge` + `teksBadge`. Salah satunya selalu bisa disimpulkan dari yang lain — dua source of truth untuk satu fakta.',
        '**Kombinasi mustahil.** `adaGambar={false} gambarDiAtas` sah menurut tipenya, dan tidak berarti apa-apa. Delapan boolean berarti 256 kombinasi, sebagian besar tidak valid.',
        '**Susunan terkunci.** Tidak ada cara menaruh badge di bawah judul tanpa menambah prop baru lagi.',
        '**Call site tidak terbaca.** `<Kartu kompak berbayang bisaDiklik adaBadge />` tidak memberi tahu pembaca bentuk hasilnya.',
      ),

      h2('Langkah 1 — hapus boolean yang bisa disimpulkan'),
      compare(
        {
          title: 'Sebelum',
          lang: 'tsx',
          code: `
          <Kartu
            adaGambar
            gambar="/foto.jpg"
            adaBadge
            teksBadge="Baru"
          />
          `,
          notes: ['adaGambar={false} gambar="/foto.jpg" — apa artinya?'],
        },
        {
          title: 'Sesudah',
          lang: 'tsx',
          code: `
          <Kartu
            gambar="/foto.jpg"
            badge="Baru"
          />

          // Di dalam komponen:
          {gambar !== undefined && <img src={gambar} alt="" />}
          `,
          notes: ['Keberadaan nilainya sudah menjadi jawabannya'],
        },
      ),
      p(
        'Langkah pertama ini menghapus **empat prop menjadi dua** tanpa kehilangan satu pun kemampuan, dan prinsipnya bisa dipakai di mana saja, yaitu kalau sebuah boolean selalu bisa disimpulkan dari keberadaan nilai lain, ia tidak perlu ada. Catatan di kolom kiri menunjukkan alasannya, sebab `adaGambar={false}` bersama `gambar="/foto.jpg"` adalah kombinasi yang sah menurut tipenya tetapi tidak punya arti, dan setiap kombinasi tanpa arti adalah pertanyaan yang harus dijawab pembaca kode. Baris terakhir kolom kanan menunjukkan penerapannya di dalam komponen, sebab `gambar !== undefined` menggantikan pemeriksaan `adaGambar`, sehingga tidak ada lagi dua nilai yang bisa saling bertentangan. Perhatikan pemeriksaannya memakai `!== undefined` dan bukan `&&` polos, sebab string kosong adalah nilai yang sah dan tidak boleh diperlakukan sebagai "tidak ada".',
      ),

      h2('Langkah 2 — gabungkan boolean tampilan menjadi varian'),
      code(
        'tsx',
        `
        // Sebelum: kompak + berbayang + bisaDiklik = 8 kombinasi
        // Sesudah: hanya keadaan yang benar-benar ada
        type PropsKartu = {
          variant?: 'datar' | 'terangkat' | 'interaktif';
          size?: 'sm' | 'md';
        };
        `,
      ),
      p(
        'Ini juga menyelesaikan masalah tersembunyi: `bisaDiklik` tanpa `onKartuKlik` sebelumnya menghasilkan kartu yang terlihat bisa diklik tapi tidak melakukan apa-apa. Dengan varian `interaktif`, handler bisa dijadikan wajib lewat tipe.',
      ),

      h2('Langkah 3 — serahkan susunan lewat compound component'),
      code(
        'tsx',
        `
        <Kartu variant="terangkat">
          <Kartu.Media src="/foto.jpg" alt="" />
          <Kartu.Badge nada="hijau">Baru</Kartu.Badge>
          <Kartu.Judul>Belajar React</Kartu.Judul>
          <Kartu.Isi>Mulai dari komponen dan props.</Kartu.Isi>
          <Kartu.Aksi>
            <Tombol onClick={mulai}>Mulai</Tombol>
          </Kartu.Aksi>
        </Kartu>
        `,
      ),
      p(
        'Lima belas prop menyusut menjadi dua, dan setiap susunan baru sekarang tidak memerlukan perubahan apa pun pada komponennya.',
      ),

      h2('Langkah 4 — pastikan yang mustahil tidak bisa ditulis'),
      code(
        'ts',
        `
        // Discriminated union: 'interaktif' WAJIB punya handler,
        // varian lain TIDAK BOLEH punya.
        type PropsKartu =
          | { variant?: 'datar' | 'terangkat'; onClick?: never; children: ReactNode }
          | { variant: 'interaktif'; onClick: () => void; children: ReactNode };
        `,
      ),
      p(
        'Kuncinya ada pada `onClick?: never` di cabang pertama, yaitu bentuk yang mungkin terlihat aneh tetapi sangat berguna. `never` berarti "tidak ada nilai yang sah untuk ini", sehingga `<Kartu variant="datar" onClick={...} />` ditolak type-check, karena kartu yang tidak interaktif **tidak bisa** diberi handler klik. Cabang kedua melakukan kebalikannya, sebab `onClick` di sana wajib tanpa tanda tanya, sehingga `<Kartu variant="interaktif">` tanpa handler juga ditolak. Perhatikan `variant` di cabang pertama opsional sedangkan di cabang kedua wajib, dan itu yang memungkinkan TypeScript memilih cabang yang tepat berdasarkan nilainya, persis mekanisme diskriminan dari Bab 6. Hasilnya, dua kesalahan yang sebelumnya hanya bisa ditemukan dengan mencoba kini **tidak bisa dituliskan sama sekali**.',
      ),
      callout(
        'tip',
        'Prinsip yang berlaku umum',
        'Kalau sebuah keadaan tidak valid, buat ia **tidak bisa dinyatakan** — bukan divalidasi saat runtime. Error saat type-check lebih murah daripada bug di produksi, dan tidak butuh siapa pun mengingat aturannya.',
      ),

      h2('Kapan berhenti'),
      p(
        'Refactor ini punya biaya: compound component lebih panjang ditulis dan butuh satu konsep lagi untuk dipahami. Kalau komponennya dipakai di tiga tempat dengan bentuk yang sama persis, berhenti di Langkah 2. Lanjutkan ke Langkah 3 hanya kalau susunannya memang bervariasi di pemakaian nyata.',
      ),

      divider,

      checklist(
        'fi6-praktik',
        'Checklist praktik bab ini',
        'Cari satu komponen di kodemu yang punya lebih dari lima prop boolean',
        'Hapus setiap boolean yang bisa disimpulkan dari keberadaan prop lain',
        'Gabungkan boolean tampilan menjadi satu prop `variant`',
        'Ubah satu komponen berprop banyak menjadi compound component',
        'Pakai discriminated union supaya kombinasi mustahil ditolak type-check',
        'Periksa ulang setiap `"use client"`: bisakah batasnya diturunkan lebih dekat ke daun?',
        'Pastikan setiap elemen yang bisa diklik benar-benar `<button>` atau `<a>`',
        'Bungkus minimal satu widget berdata dengan Error Boundary dan Suspense',
      ),

      references(
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Dasar merancang bentuk props — termasuk mengoper JSX alih-alih menambah prop baru.',
        },
        {
          label: 'Discriminated unions',
          href: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions',
          source: 'TypeScript',
          note: 'Mekanisme Langkah 4 yang membuat kombinasi mustahil ditolak saat type-check.',
        },
        {
          label: 'The never type',
          href: 'https://www.typescriptlang.org/docs/handbook/2/functions.html#never',
          source: 'TypeScript',
          note: 'Cara menyatakan "prop ini tidak boleh ada di varian ini" lewat tipe.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Prinsip yang sama diterapkan ke state: hindari nilai yang bisa disimpulkan dari nilai lain.',
        },
      ),
    ],
  ),
];
