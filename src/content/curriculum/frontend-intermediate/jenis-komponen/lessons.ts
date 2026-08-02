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

      h2('Kapan ia masih relevan'),
      p(
        'Tiga situasi membuat pemisahan ini tetap berbayar: komponen tampilannya **benar-benar** dipakai dengan lebih dari satu sumber data; kamu memakai Storybook dan butuh komponen yang bisa dirender tanpa lingkungan apa pun; atau — yang paling penting sekarang — batasnya kebetulan sama dengan batas Server/Client Component, yang dibahas dua sub-bab berikutnya.',
      ),
      callout(
        'tip',
        'Aturan praktisnya',
        'Jangan memisahkan lebih dulu lalu mencari alasannya. Pisahkan saat pemakai kedua benar-benar muncul. Ini penerapan langsung dari prinsip "jangan membangun abstraksi untuk pemanggil yang belum ada".',
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
      callout(
        'warning',
        'Bahaya keamanan yang nyata',
        'Karena props dikirim ke browser, jangan pernah mengoper objek utuh dari database ke Client Component. Satu `<Profil user={user} />` yang membawa `passwordHash` atau `email` internal akan mengirimkannya ke browser — terlihat di payload RSC meski tidak pernah dirender di layar. Pilih field yang benar-benar perlu.',
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
        'Sebagian besar kasus "berbagi logika" sekarang lebih baik ditulis sebagai custom hook. Tapi render props tetap unggul untuk satu hal: ketika komponennya juga **merender sesuatu** — struktur, pembungkus, atau perilaku DOM — bukan sekadar menghitung nilai.',
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
    ],
  ),

  written(
    'hoc',
    'Higher-Order Component',
    9,
    'Pola lama yang perlu dikenali saat membaca kode warisan.',
    [
      p(
        'Higher-Order Component (HOC) adalah fungsi yang menerima komponen dan mengembalikan komponen baru yang sudah dibungkus. Namanya meminjam dari higher-order function di JavaScript. Sebelum hooks ada, ini adalah cara utama berbagi logika antar komponen.',
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

      h2('Yang masih pantas jadi HOC'),
      p(
        'Ada satu kategori yang tidak bisa digantikan hook, karena hook tidak bisa merender apa pun di sekitar komponen: pembungkus yang benar-benar **menambah elemen**. `React.memo` sendiri adalah HOC. Begitu juga pembungkus error boundary dan beberapa integrasi analitik. Di luar itu, pilih custom hook.',
      ),
      callout(
        'tip',
        'Kalau harus menulis HOC',
        'Selalu set `displayName` (`KomponenTerlindungi.displayName = \\`withAuth(${Komponen.displayName ?? Komponen.name})\\`;`) dan teruskan `ref` dengan benar. Dua hal ini yang paling sering dilupakan, dan keduanya baru terasa saat kamu sedang men-debug sesuatu yang lain.',
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
    ],
  ),

  written('portal-layering', 'Portal & Layering', 10, 'Merender di luar pohon DOM induknya.', [
    p(
      'Portal merender anak ke node DOM **di luar** hierarki induknya, sambil tetap mempertahankan posisinya di pohon React. Ini terdengar aneh sampai kamu menemui masalah yang ia selesaikan.',
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

      h2('Diagnosisnya'),
      ol(
        '**Prop berpasangan.** `adaGambar` + `gambar`, `adaBadge` + `teksBadge`. Salah satunya selalu bisa disimpulkan dari yang lain — dua sumber kebenaran untuk satu fakta.',
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
    ],
  ),
];
