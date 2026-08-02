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
 * Frontend Intermediate — Chapter 5, all eleven lessons.
 *
 * The chapter is built around one claim: most "state management problems" are really
 * classification problems. Lesson 1 establishes the five categories and every later lesson is
 * an answer to one of them, so the tool comparisons never float free of the question they solve.
 *
 * Library APIs shown here target the versions declared in the chapter's `stackVersions`.
 */
export const lessons: LessonDraft[] = [
  written(
    'peta-kategori-state',
    'Peta Kategori State',
    11,
    'Lima jenis state yang sering disamakan padahal butuh perlakuan berbeda.',
    [
      p(
        'Hampir semua kebingungan soal "state management" berasal dari satu kesalahan yang sama: memperlakukan semua data seolah sejenis. Padahal data di sebuah aplikasi punya asal, pemilik, dan mode gagal yang berbeda-beda. Salah kategori berarti salah alat — dan alat yang salah terasa berat bukan karena librarynya buruk, melainkan karena ia sedang dipaksa mengerjakan tugas yang bukan miliknya.',
      ),

      h2('Lima kategori'),
      table(
        ['Kategori', 'Contoh', 'Siapa pemiliknya', 'Alat yang tepat'],
        [
          [
            'Lokal',
            'Input terbuka/tertutup, teks yang sedang diketik',
            'Satu komponen',
            '`useState`, `useReducer`',
          ],
          [
            'Client global',
            'Tema, sidebar terbuka, keranjang belanja',
            'Aplikasi',
            'Context, Zustand, Redux, Jotai',
          ],
          [
            'Server',
            'Daftar produk, profil pengguna, notifikasi',
            '**Server**',
            'TanStack Query, SWR, RTK Query',
          ],
          [
            'URL',
            'Filter, sort, halaman ke berapa, kata kunci',
            'Alamat halaman',
            '`searchParams`, `nuqs`',
          ],
          [
            'Form',
            'Nilai field, error validasi, status submit',
            'Satu formulir',
            'React Hook Form, form state bawaan',
          ],
        ],
        'Kategori menentukan alat. Urutannya juga urutan seberapa sering orang salah memilih.',
      ),

      h2('Pertanyaan yang memisahkan kategori'),
      ol(
        '**Siapa sumber kebenarannya?** Kalau jawabannya "server", ini server state — bukan client state, seberapa pun ia terlihat seperti data biasa.',
        '**Apakah harus bisa dibagikan lewat tautan?** Kalau ya, tempatnya di URL. Filter yang hilang saat halaman di-refresh adalah bug, bukan fitur.',
        '**Berapa komponen yang benar-benar membacanya?** Kalau satu, ia lokal. State global dengan satu pembaca adalah biaya tanpa manfaat.',
        '**Apakah ia bisa dihitung dari state lain?** Kalau ya, ia bukan state sama sekali — hitung saat render.',
      ),

      h2('Kesalahan yang paling mahal'),
      p(
        'Menyalin data server ke store global. Kelihatannya rapi: satu tempat untuk semua data. Yang sebenarnya terjadi adalah kamu baru saja berjanji akan menulis ulang caching, deduplikasi permintaan, refetch saat window kembali fokus, invalidasi setelah mutasi, penanganan `loading`/`error` per permintaan, dan pembatalan permintaan yang sudah usang — dengan tangan, tanpa dibayar.',
      ),
      compare(
        {
          title: 'Server state di store global',
          lang: 'ts',
          code: `
          const useStore = create((set) => ({
            produk: [],
            loading: false,
            error: null,
            async ambilProduk() {
              set({ loading: true, error: null });
              try {
                const res = await fetch('/api/produk');
                set({ produk: await res.json(), loading: false });
              } catch (e) {
                set({ error: e, loading: false });
              }
            },
          }));
          `,
          notes: [
            'Dua komponen yang memanggil ini serentak akan menembak API dua kali',
            'Tidak ada kebasian: data tetap dipakai walau sudah satu jam',
            'Setiap entitas baru berarti menyalin seluruh blok ini lagi',
          ],
        },
        {
          title: 'Server state di alat yang memang untuk itu',
          lang: 'ts',
          code: `
          const { data, isPending, error } = useQuery({
            queryKey: ['produk'],
            queryFn: () => fetch('/api/produk').then((r) => r.json()),
          });
          `,
          notes: [
            'Dua komponen dengan query key sama berbagi satu permintaan',
            'Kebasian, refetch, dan pembatalan sudah menjadi bawaan',
            'Entitas baru = satu `useQuery` lagi, bukan blok baru',
          ],
        },
      ),

      h2('Kategori bukan hierarki'),
      p(
        'Satu halaman biasanya memakai keempat atau kelima kategori sekaligus, dan itu normal. Halaman daftar produk yang sehat terlihat begini: kata kunci dan filter di **URL**, daftar produknya dari **TanStack Query**, keranjang di **Zustand**, dan status dropdown filter yang sedang terbuka cukup `useState` **lokal**.',
      ),
      callout(
        'tip',
        'Cara memakai bab ini',
        'Sepuluh sub-bab berikutnya adalah jawaban untuk kategori-kategori di atas. Kalau kamu sedang bingung memilih library, kembali ke tabel ini dulu — pertanyaannya hampir selalu "ini kategori apa", bukan "library mana yang terbaik".',
      ),
    ],
  ),

  written(
    'belum-butuh-library',
    'Kapan Kamu Belum Butuh Library',
    9,
    'Sebagian besar aplikasi kecil tidak membutuhkannya.',
    [
      p(
        'Sebelum menambah dependency, ada dua teknik bawaan React yang menyelesaikan mayoritas kasus: **mengangkat state** dan **komposisi**. Keduanya gratis, tidak menambah ukuran bundle, dan tidak perlu dipelajari orang lain yang membaca kodemu.',
      ),

      h2('Mengangkat state (lifting state up)'),
      p(
        'Kalau dua komponen bersaudara butuh data yang sama, pindahkan datanya ke induk terdekat yang memuat keduanya. Itu saja. Ini bukan solusi kelas dua — ini solusi default, dan React memang dirancang untuk ini.',
      ),
      code(
        'tsx',
        `
        function Halaman() {
          // Satu sumber kebenaran, di induk terdekat yang memuat kedua anak.
          const [terpilih, setTerpilih] = useState<string | null>(null);

          return (
            <>
              <DaftarProduk terpilih={terpilih} onPilih={setTerpilih} />
              <DetailProduk id={terpilih} />
            </>
          );
        }
        `,
      ),

      h2('Komposisi: obat untuk prop drilling'),
      p(
        'Alasan orang lari ke library global biasanya bukan "state-nya rumit", tapi "props-nya harus lewat lima lapisan". Sering kali itu bisa diselesaikan tanpa state global sama sekali — dengan mengoper **elemen**, bukan **data**.',
      ),
      compare(
        {
          title: 'Prop drilling',
          lang: 'tsx',
          code: `
          <Layout user={user}>
            {/* Layout tidak memakai user, */}
            {/* ia cuma meneruskannya */}
          </Layout>

          function Layout({ user, children }) {
            return (
              <div>
                <Header user={user} />
                {children}
              </div>
            );
          }
          `,
          notes: ['`Layout` dipaksa tahu soal `user` padahal tidak memakainya'],
        },
        {
          title: 'Komposisi',
          lang: 'tsx',
          code: `
          <Layout header={<Header user={user} />}>
            <Konten />
          </Layout>

          function Layout({ header, children }) {
            return (
              <div>
                {header}
                {children}
              </div>
            );
          }
          `,
          notes: [
            '`Layout` tidak tahu apa pun soal `user`',
            'Elemennya dibuat di tempat datanya sudah ada',
          ],
        },
      ),
      p(
        'Teknik ini dibahas lebih dalam di Bab 6. Yang penting sekarang: prop drilling sepanjang **dua atau tiga** lapisan bukan masalah yang layak dibayar dengan sebuah library.',
      ),

      h2('Kapan tanda-tandanya berubah'),
      p('Barulah pertimbangkan alat tambahan ketika muncul salah satu dari ini:'),
      ul(
        'Data yang sama dibutuhkan di **cabang pohon yang berjauhan** — misalnya sidebar dan modal di ujung lain aplikasi.',
        'Induk yang harus menampung state jadi **terlalu tinggi**, sehingga perubahan kecil me-render ulang setengah halaman.',
        'Kamu mulai **menyalin state yang sama** ke dua tempat dan menyinkronkannya dengan tangan.',
        'State-nya perlu **bertahan** melewati unmount komponen yang memakainya.',
      ),
      callout(
        'warning',
        'Biaya yang tidak kelihatan di awal',
        'Setiap library state adalah kontrak jangka panjang: satu lagi API untuk dipelajari, satu lagi cara debug, satu lagi sumber "kenapa komponen ini render ulang". Untuk aplikasi belajar atau proyek kecil, `useState` plus komposisi hampir selalu pilihan yang lebih dewasa — bukan yang lebih malas.',
      ),
    ],
  ),

  written(
    'context-api',
    'Context API & Jebakan Re-render',
    12,
    'Alat yang benar untuk masalah yang salah.',
    [
      p(
        'Context adalah mekanisme bawaan React untuk mengirim nilai ke bawah pohon tanpa mengoper props satu per satu. Ia sering disebut "state management bawaan React" — dan di situlah salah pahamnya dimulai. **Context bukan store.** Ia adalah alat distribusi, bukan alat penyimpanan atau optimasi.',
      ),

      h2('Bentuk dasar'),
      code(
        'tsx',
        `
        import { createContext, useContext, useState } from 'react';

        type Tema = 'terang' | 'gelap';
        type NilaiTema = { tema: Tema; ganti: () => void };

        // null sebagai nilai awal + pengecekan di hook = ketahuan kalau lupa memasang Provider.
        const KonteksTema = createContext<NilaiTema | null>(null);

        export function PenyediaTema({ children }: { children: React.ReactNode }) {
          const [tema, setTema] = useState<Tema>('terang');
          const ganti = () => setTema((t) => (t === 'terang' ? 'gelap' : 'terang'));

          return <KonteksTema value={{ tema, ganti }}>{children}</KonteksTema>;
        }

        export function useTema() {
          const nilai = useContext(KonteksTema);
          if (nilai === null) {
            throw new Error('useTema harus dipakai di dalam <PenyediaTema>');
          }
          return nilai;
        }
        `,
        { filename: 'src/context/tema.tsx' },
      ),
      callout(
        'info',
        'React 19: `<Context>` langsung sebagai Provider',
        'Sejak React 19 kamu bisa menulis `<KonteksTema value={...}>` tanpa `.Provider`. Bentuk lama `<KonteksTema.Provider>` masih bekerja, jadi kode lama tidak rusak — tapi untuk kode baru pakai bentuk pendeknya.',
      ),

      h2('Kenapa hook pembungkus itu wajib'),
      p(
        'Mengekspor `KonteksTema` mentah-mentah memaksa setiap pemakai menulis `useContext` **dan** mengecek `null` sendiri. Membungkusnya jadi `useTema()` memberi tiga hal sekaligus: pengecekan Provider yang gagal keras dengan pesan jelas, tipe yang sudah bukan `null`, dan satu tempat kalau implementasinya berubah nanti.',
      ),

      h2('Jebakannya: satu perubahan, semua konsumen render ulang'),
      p(
        'Inilah bagian yang membuat orang kecewa pada Context. Setiap konsumen `useContext` akan **selalu** dirender ulang saat nilai context berubah — tanpa peduli bagian mana yang ia pakai. Tidak ada selector, tidak ada perbandingan sebagian.',
      ),
      code(
        'tsx',
        `
        // Context berisi tema DAN pengguna DAN keranjang.
        // Satu ketikan yang mengubah keranjang akan me-render ulang
        // setiap komponen yang cuma membaca tema.
        <KonteksApp value={{ tema, pengguna, keranjang }}>
        `,
      ),
      p(
        'Ditambah satu jebakan kedua yang lebih halus: objek literal `{ tema, ganti }` adalah objek **baru** di setiap render Provider. Jadi meski isinya sama persis, semua konsumen tetap dianggap menerima nilai baru.',
      ),

      h2('Dua obatnya'),
      steps(
        {
          title: 'Pecah menjadi beberapa context',
          body: 'Pisahkan berdasarkan frekuensi perubahan. Tema yang berubah sekali sehari tidak boleh sepaket dengan keranjang yang berubah tiap klik. Ini obat yang paling efektif dan paling sering dilupakan.',
        },
        {
          title: 'Pisahkan nilai dari fungsi pengubah',
          body: 'Fungsi pengubah biasanya stabil selamanya. Menaruhnya di context terpisah membuat komponen yang hanya butuh "cara mengubah" tidak ikut render saat nilainya berubah.',
        },
      ),
      code(
        'tsx',
        `
        const KonteksNilai = createContext<Tema>('terang');
        const KonteksAksi = createContext<(() => void) | null>(null);

        export function PenyediaTema({ children }) {
          const [tema, setTema] = useState<Tema>('terang');

          // Pengubah didefinisikan dengan bentuk fungsi, jadi ia tidak
          // pernah bergantung pada nilai 'tema' dan tidak perlu ikut berubah.
          const ganti = useCallback(() => {
            setTema((t) => (t === 'terang' ? 'gelap' : 'terang'));
          }, []);

          return (
            <KonteksAksi value={ganti}>
              <KonteksNilai value={tema}>{children}</KonteksNilai>
            </KonteksAksi>
          );
        }
        `,
      ),
      callout(
        'tip',
        'React Compiler mengubah nuansanya, bukan aturannya',
        'Dengan React Compiler aktif, memoisasi nilai context sering ditangani otomatis sehingga `useMemo` manual tidak lagi perlu. Yang **tidak** hilang adalah sifat dasarnya: semua konsumen tetap ikut render saat nilai context benar-benar berubah. Memecah context tetap jadi solusi struktural, bukan solusi memoisasi.',
      ),

      h2('Kapan Context adalah pilihan yang benar'),
      table(
        ['Cocok', 'Tidak cocok'],
        [
          ['Tema terang/gelap', 'Isi keranjang yang sering berubah'],
          ['Bahasa aktif', 'Teks yang sedang diketik'],
          ['Data pengguna yang sudah login', 'Data server yang perlu cache & refetch'],
          ['Konfigurasi yang dibaca sekali', 'Posisi scroll atau state animasi'],
        ],
        'Polanya sederhana: jarang berubah, banyak pembaca.',
      ),
    ],
  ),

  written('zustand', 'Zustand', 11, 'Store global yang ringan.', [
    p(
      'Zustand adalah store global tanpa Provider, tanpa boilerplate, dan dengan satu kemampuan penting yang tidak dimiliki Context: **selector**. Komponen bisa berlangganan hanya pada potongan state yang benar-benar ia baca, sehingga perubahan di bagian lain tidak ikut me-render ulang.',
    ),

    h2('Membuat store'),
    code(
      'ts',
      `
        import { create } from 'zustand';

        type Item = { id: string; nama: string; harga: number; jumlah: number };

        type Keranjang = {
          items: Item[];
          tambah: (item: Omit<Item, 'jumlah'>) => void;
          hapus: (id: string) => void;
          kosongkan: () => void;
        };

        export const useKeranjang = create<Keranjang>((set) => ({
          items: [],

          tambah: (item) =>
            set((state) => {
              const ada = state.items.find((i) => i.id === item.id);
              if (ada) {
                return {
                  items: state.items.map((i) =>
                    i.id === item.id ? { ...i, jumlah: i.jumlah + 1 } : i,
                  ),
                };
              }
              return { items: [...state.items, { ...item, jumlah: 1 }] };
            }),

          hapus: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

          kosongkan: () => set({ items: [] }),
        }));
        `,
      { filename: 'src/store/keranjang.ts' },
    ),
    p(
      'Tidak ada Provider yang harus dipasang di root. Store-nya adalah modul biasa, dan `useKeranjang` adalah hook yang bisa dipakai di komponen mana pun.',
    ),

    h2('Selector: bagian yang membuatnya cepat'),
    compare(
      {
        title: 'Tanpa selector — boros',
        lang: 'tsx',
        code: `
          function JumlahItem() {
            // Mengambil SELURUH state.
            const { items } = useKeranjang();
            return <span>{items.length}</span>;
          }
          `,
        notes: ['Render ulang setiap kali apa pun di store berubah'],
      },
      {
        title: 'Dengan selector — hemat',
        lang: 'tsx',
        code: `
          function JumlahItem() {
            // Berlangganan hanya pada angkanya.
            const jumlah = useKeranjang((s) => s.items.length);
            return <span>{jumlah}</span>;
          }
          `,
        notes: ['Render ulang hanya kalau angkanya benar-benar berubah'],
      },
    ),

    h2('Jebakan selector yang mengembalikan objek'),
    p(
      'Zustand membandingkan hasil selector dengan `Object.is`. Selector yang membuat objek atau array **baru** setiap kali akan selalu dianggap berubah — dan komponennya render ulang terus, bahkan bisa masuk loop tak berujung.',
    ),
    code(
      'tsx',
      `
        // SALAH: objek baru setiap render -> selalu dianggap berubah
        const { tambah, hapus } = useKeranjang((s) => ({ tambah: s.tambah, hapus: s.hapus }));

        // BENAR (1): ambil satu per satu
        const tambah = useKeranjang((s) => s.tambah);
        const hapus = useKeranjang((s) => s.hapus);

        // BENAR (2): pakai useShallow kalau memang butuh beberapa sekaligus
        import { useShallow } from 'zustand/react/shallow';
        const { tambah, hapus } = useKeranjang(useShallow((s) => ({ tambah: s.tambah, hapus: s.hapus })));
        `,
    ),

    h2('Mengakses store di luar komponen'),
    p(
      'Karena store bukan Context, ia bisa dibaca dari mana saja — termasuk di dalam event handler, fungsi utilitas, atau kode non-React.',
    ),
    code(
      'ts',
      `
        // Membaca nilai sekarang tanpa berlangganan (tidak memicu render).
        const jumlahSekarang = useKeranjang.getState().items.length;

        // Mengubah dari luar komponen.
        useKeranjang.getState().kosongkan();
        `,
    ),

    h2('Menyimpan ke localStorage'),
    code(
      'ts',
      `
        import { persist } from 'zustand/middleware';

        export const useKeranjang = create<Keranjang>()(
          persist(
            (set) => ({ /* ...seperti di atas... */ }),
            {
              name: 'keranjang',
              // Simpan datanya saja — fungsi tidak perlu (dan tidak bisa) diserialisasi.
              partialize: (state) => ({ items: state.items }),
            },
          ),
        );
        `,
    ),
    callout(
      'warning',
      'Persist + SSR = ketidakcocokan hidrasi',
      'Di Next.js, server tidak punya `localStorage`, jadi render pertama selalu memakai state kosong sementara browser langsung punya isinya. Perbedaan itu memicu hydration mismatch. Polanya sama seperti yang dipakai website ini sendiri: tampilkan skeleton sampai store selesai terhidrasi, jangan langsung menampilkan datanya.',
    ),
  ]),

  written('redux-toolkit', 'Redux Toolkit', 12, 'Redux modern, jauh dari boilerplate versi lama.', [
    p(
      'Reputasi Redux sebagai "banyak boilerplate" berasal dari cara lama menulisnya: konstanta action, action creator, dan reducer `switch` yang panjang, semuanya ditulis tangan di file terpisah. **Redux Toolkit (RTK)** adalah cara resmi menulis Redux sekarang, dan ia menghapus hampir semua itu.',
    ),

    h2('Slice: reducer, action, dan tipe sekaligus'),
    code(
      'ts',
      `
        import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

        type Item = { id: string; nama: string; jumlah: number };
        type KeranjangState = { items: Item[] };

        const initialState: KeranjangState = { items: [] };

        const keranjangSlice = createSlice({
          name: 'keranjang',
          initialState,
          reducers: {
            // Terlihat seperti mutasi, tapi bukan — lihat catatan di bawah.
            tambah(state, action: PayloadAction<Omit<Item, 'jumlah'>>) {
              const ada = state.items.find((i) => i.id === action.payload.id);
              if (ada) {
                ada.jumlah += 1;
              } else {
                state.items.push({ ...action.payload, jumlah: 1 });
              }
            },
            hapus(state, action: PayloadAction<string>) {
              state.items = state.items.filter((i) => i.id !== action.payload);
            },
          },
        });

        export const { tambah, hapus } = keranjangSlice.actions;
        export default keranjangSlice.reducer;
        `,
      { filename: 'src/store/keranjang-slice.ts' },
    ),
    callout(
      'info',
      'Kenapa `state.items.push()` boleh di sini',
      'RTK membungkus reducer dengan **Immer**. Yang kamu ubah sebenarnya adalah objek draft; Immer mencatat perubahannya lalu menghasilkan objek baru yang immutable. Jadi aturan "jangan pernah memutasi state" tetap berlaku — Immer hanya membuat kodenya jauh lebih enak dibaca. Aturan ini **hanya** berlaku di dalam `createSlice`, bukan di komponen.',
    ),

    h2('Menyusun store dan tipe-tipenya'),
    code(
      'ts',
      `
        import { configureStore } from '@reduxjs/toolkit';
        import keranjangReducer from './keranjang-slice';

        export const store = configureStore({
          reducer: { keranjang: keranjangReducer },
        });

        // Tipe diturunkan dari store, bukan ditulis tangan — jadi ia tidak bisa basi.
        export type RootState = ReturnType<typeof store.getState>;
        export type AppDispatch = typeof store.dispatch;
        `,
      { filename: 'src/store/index.ts' },
    ),
    code(
      'ts',
      `
        import { useDispatch, useSelector } from 'react-redux';
        import type { AppDispatch, RootState } from './index';

        // Bungkus sekali supaya tidak perlu menulis tipe di setiap pemakaian.
        export const useAppDispatch = () => useDispatch<AppDispatch>();
        export const useAppSelector = useSelector.withTypes<RootState>();
        `,
      { filename: 'src/store/hooks.ts' },
    ),

    h2('Memakainya di komponen'),
    code(
      'tsx',
      `
        function TombolTambah({ produk }: { produk: { id: string; nama: string } }) {
          const dispatch = useAppDispatch();
          return <button onClick={() => dispatch(tambah(produk))}>Tambah</button>;
        }

        function JumlahItem() {
          // Selector, sama prinsipnya dengan Zustand: ambil sesempit mungkin.
          const jumlah = useAppSelector((s) => s.keranjang.items.length);
          return <span>{jumlah}</span>;
        }
        `,
    ),

    h2('Redux vs Zustand — jujur soal trade-off'),
    table(
      ['Aspek', 'Redux Toolkit', 'Zustand'],
      [
        ['Kode untuk store sederhana', 'Lebih panjang', 'Lebih pendek'],
        ['Provider di root', 'Wajib', 'Tidak perlu'],
        ['DevTools & time-travel', 'Sangat matang', 'Ada, lebih sederhana'],
        ['Middleware & konvensi tim', 'Kuat dan terstandar', 'Bebas, kamu yang atur'],
        ['Ukuran bundle', 'Lebih besar', 'Lebih kecil'],
        [
          'Cocok untuk',
          'Tim besar, alur state rumit, audit riwayat aksi',
          'Kebanyakan aplikasi menengah',
        ],
      ],
    ),
    p(
      'Redux masih pilihan tepat ketika **jejak perubahan** itu penting: aplikasi finansial, dasbor operasional, atau tim besar yang butuh satu konvensi yang tidak bisa ditawar. Untuk aplikasi menengah dengan sedikit client state, Zustand biasanya memberi manfaat yang sama dengan biaya lebih rendah.',
    ),
    callout(
      'warning',
      'RTK Query ada, tapi jangan pakai Redux biasa untuk data server',
      'Kalau kamu sudah memakai Redux, gunakan **RTK Query** untuk data server — bukan slice biasa dengan `createAsyncThunk` yang mengisi array. Alasannya sama seperti di sub-bab pertama: menyalin data server ke store berarti membangun ulang cache dan invalidasi dengan tangan.',
    ),
  ]),

  written(
    'jotai',
    'Jotai (pendekatan atomic)',
    10,
    'State sebagai atom-atom kecil yang saling menurunkan.',
    [
      p(
        'Redux dan Zustand memakai model **satu store besar**: kamu menyimpan semuanya di satu objek lalu memilih potongannya dengan selector. Jotai membalik arahnya — state dipecah menjadi **atom** kecil yang berdiri sendiri, dan yang besar dirakit dari yang kecil.',
      ),

      h2('Atom dasar'),
      code(
        'ts',
        `
        import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

        export const hitunganAtom = atom(0);
        export const namaAtom = atom('');
        `,
      ),
      code(
        'tsx',
        `
        function Penghitung() {
          const [hitungan, setHitungan] = useAtom(hitunganAtom);
          return <button onClick={() => setHitungan((n) => n + 1)}>{hitungan}</button>;
        }

        // Hanya membaca -> tidak ikut render saat setter berubah
        function Tampilan() {
          const hitungan = useAtomValue(hitunganAtom);
          return <p>{hitungan}</p>;
        }

        // Hanya menulis -> TIDAK render ulang saat nilainya berubah
        function TombolReset() {
          const set = useSetAtom(hitunganAtom);
          return <button onClick={() => set(0)}>Reset</button>;
        }
        `,
      ),
      callout(
        'tip',
        'Keunggulan yang paling terasa',
        '`useSetAtom` memberi komponen kemampuan mengubah tanpa berlangganan. Tombol reset yang tidak pernah menampilkan angkanya jadi tidak pernah render ulang — sesuatu yang butuh usaha ekstra untuk dicapai dengan Context.',
      ),

      h2('Derived atom: yang bisa dihitung, jangan disimpan'),
      p(
        'Ini kekuatan utama Jotai. Nilai turunan didefinisikan sebagai atom yang membaca atom lain, dan ia otomatis ikut terbarui — tanpa `useEffect`, tanpa risiko dua sumber kebenaran.',
      ),
      code(
        'ts',
        `
        export const itemsAtom = atom<Item[]>([]);

        // Read-only, dihitung dari itemsAtom.
        export const totalHargaAtom = atom((get) =>
          get(itemsAtom).reduce((jumlah, i) => jumlah + i.harga * i.jumlah, 0),
        );

        export const jumlahItemAtom = atom((get) => get(itemsAtom).length);

        // Bisa dibaca DAN ditulis: tulisannya diterjemahkan ke atom sumber.
        export const itemPertamaAtom = atom(
          (get) => get(itemsAtom)[0] ?? null,
          (get, set, baru: Item) => {
            const semua = get(itemsAtom);
            set(itemsAtom, [baru, ...semua.slice(1)]);
          },
        );
        `,
      ),

      h2('Kapan Jotai lebih cocok'),
      ul(
        'State-nya banyak dan **saling bergantung** — form kompleks, editor, kanvas, konfigurasi bercabang.',
        'Kamu ingin nilai turunan yang **tidak mungkin** tidak sinkron, karena ia memang tidak disimpan.',
        'Kamu sudah nyaman dengan `useState` — API Jotai memang sengaja dibuat semirip mungkin.',
      ),
      p(
        'Sebaliknya, kalau state globalmu sedikit dan datar (tema, sesi, keranjang), model store tunggal Zustand biasanya lebih mudah dilacak. Membaca satu store lebih cepat daripada mengejar rantai atom yang tersebar di banyak file.',
      ),

      h2('Ringkasan tiga pendekatan'),
      table(
        ['', 'Redux Toolkit', 'Zustand', 'Jotai'],
        [
          ['Model', 'Satu store + aksi', 'Satu store + selector', 'Banyak atom kecil'],
          ['Nilai turunan', 'Selector (dengan memo)', 'Selector', 'Derived atom (bawaan)'],
          ['Provider', 'Wajib', 'Tidak perlu', 'Opsional'],
          [
            'Paling kuat saat',
            'Jejak aksi & tim besar',
            'State global datar',
            'State saling bergantung',
          ],
        ],
      ),
    ],
  ),

  written(
    'tanstack-query',
    'Server State dengan TanStack Query',
    14,
    'Data server bukan state biasa — ia punya cache, kebasian, dan mode gagal sendiri.',
    [
      p(
        'Ini sub-bab terpenting di bab ini. Data server berbeda secara mendasar dari client state: kamu **bukan pemiliknya**. Server bisa mengubahnya kapan saja tanpa memberitahu, salinan di browsermu bisa basi kapan saja, dan permintaan untuk mengambilnya bisa gagal, lambat, atau datang tidak sesuai urutan.',
      ),

      h2('Yang sebenarnya kamu tulis ulang tanpa sadar'),
      p(
        'Setiap kali data server disimpan di `useState` + `useEffect`, ini daftar yang jadi tanggunganmu:',
      ),
      ul(
        'Cache — supaya pindah halaman lalu kembali tidak menembak API lagi',
        'Deduplikasi — dua komponen yang butuh data sama tidak boleh mengirim dua permintaan',
        'Kebasian — kapan data dianggap perlu diambil ulang',
        'Refetch — saat window kembali fokus, saat koneksi pulih, saat argumennya berubah',
        'Pembatalan — respons lama yang datang terlambat tidak boleh menimpa yang baru (race condition)',
        'Status `loading` / `error` / `success` per permintaan',
        'Invalidasi setelah mutasi — daftar harus segar setelah sebuah item ditambah',
      ),
      callout(
        'danger',
        'Race condition adalah bug paling sering di pola manual',
        'Ketik "a" lalu cepat ketik "ab". Permintaan untuk "a" berangkat duluan tapi bisa **tiba belakangan**, lalu menimpa hasil "ab". Layarmu menampilkan hasil untuk kata kunci yang sudah tidak diketik lagi. Ini nyaris tidak pernah muncul di localhost yang cepat, dan muncul terus di jaringan pengguna sungguhan.',
      ),

      h2('`useQuery`'),
      code(
        'tsx',
        `
        import { useQuery } from '@tanstack/react-query';

        async function ambilProduk(): Promise<Produk[]> {
          const res = await fetch('/api/produk');
          // fetch TIDAK melempar error untuk status 4xx/5xx — kamu harus mengeceknya sendiri.
          if (!res.ok) throw new Error('Gagal memuat produk');
          return res.json();
        }

        export function DaftarProduk() {
          const { data, isPending, isError, error } = useQuery({
            queryKey: ['produk'],
            queryFn: ambilProduk,
          });

          if (isPending) return <SkeletonDaftar />;
          if (isError) return <PesanGagal pesan={error.message} onCoba={() => refetch()} />;

          return (
            <ul>
              {data.map((p) => (
                <li key={p.id}>{p.nama}</li>
              ))}
            </ul>
          );
        }
        `,
      ),
      p(
        'Perhatikan urutan pengecekannya. Setelah `isPending` dan `isError` ditangani lebih dulu, TypeScript tahu `data` pasti ada di baris terakhir — tanpa `!` dan tanpa optional chaining.',
      ),

      h2('Query key adalah identitas cache'),
      p(
        'Query key menentukan entri cache mana yang dipakai. Semua nilai yang memengaruhi hasil **harus** masuk ke dalamnya — kalau tidak, kamu akan menampilkan data milik parameter lain.',
      ),
      code(
        'ts',
        `
        // Daftar semua produk
        useQuery({ queryKey: ['produk'], queryFn: ambilProduk });

        // Satu produk — id masuk ke key
        useQuery({ queryKey: ['produk', id], queryFn: () => ambilProduk(id) });

        // Berfilter — SEMUA argumen masuk ke key
        useQuery({
          queryKey: ['produk', { kategori, urutan, halaman }],
          queryFn: () => ambilProduk({ kategori, urutan, halaman }),
        });
        `,
      ),
      callout(
        'tip',
        'Kalau ia dipakai di `queryFn`, ia harus ada di `queryKey`',
        'Itu satu aturan yang mencegah hampir semua bug cache. Query key juga otomatis menjadi mekanisme refetch: begitu `halaman` berubah, key-nya berubah, dan TanStack Query mengambil data baru tanpa kamu menulis `useEffect` apa pun.',
      ),

      h2('`staleTime` vs `gcTime` — dua hal yang sering tertukar'),
      table(
        ['', '`staleTime`', '`gcTime`'],
        [
          ['Mengatur', 'Kapan data dianggap **basi**', 'Kapan data **dibuang** dari memori'],
          ['Default', '`0` — langsung basi', '5 menit'],
          ['Selama itu', 'Tidak ada refetch otomatis', 'Data masih ada untuk ditampilkan instan'],
          ['Setelah lewat', 'Refetch saat ada pemicu (fokus, mount)', 'Entri cache dihapus'],
        ],
      ),
      code(
        'ts',
        `
        useQuery({
          queryKey: ['produk'],
          queryFn: ambilProduk,
          staleTime: 5 * 60 * 1000, // 5 menit dianggap segar
          gcTime: 30 * 60 * 1000,   // simpan 30 menit walau tidak dipakai
        });
        `,
      ),
      p(
        '`staleTime: 0` yang jadi default itu agresif dan sering mengagetkan. Untuk data yang jarang berubah — kategori, profil, pengaturan — naikkan ke beberapa menit. Untuk data yang harus selalu terbaru seperti stok atau harga, biarkan kecil.',
      ),

      h2('Mutasi dan invalidasi'),
      code(
        'tsx',
        `
        import { useMutation, useQueryClient } from '@tanstack/react-query';

        function TombolTambahProduk() {
          const queryClient = useQueryClient();

          const { mutate, isPending } = useMutation({
            mutationFn: (baru: ProdukBaru) =>
              fetch('/api/produk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(baru),
              }).then((r) => {
                if (!r.ok) throw new Error('Gagal menyimpan');
                return r.json();
              }),

            // Setelah berhasil, tandai cache 'produk' basi -> otomatis diambil ulang.
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['produk'] });
            },
          });

          // isPending juga mencegah klik ganda.
          return (
            <button disabled={isPending} onClick={() => mutate({ nama: 'Baru' })}>
              {isPending ? 'Menyimpan…' : 'Tambah'}
            </button>
          );
        }
        `,
      ),
      p(
        "`invalidateQueries` cocok dengan **awalan** key. `{ queryKey: ['produk'] }` akan membatalkan `['produk']`, `['produk', 1]`, dan `['produk', { kategori: 'buku' }]` sekaligus. Karena itu susun key dari yang umum ke yang khusus.",
      ),
    ],
  ),

  written(
    'optimistic-update',
    'Optimistic Update',
    11,
    'Menampilkan hasil sebelum server mengonfirmasi.',
    [
      p(
        'Optimistic update berarti mengubah tampilan **seolah** operasinya sudah berhasil, sebelum server menjawab. Kalau ternyata gagal, perubahannya dibatalkan. Ini yang membuat tombol suka, centang todo, dan tombol simpan terasa seketika padahal jaringannya tidak.',
      ),

      h2('Pola lengkapnya'),
      code(
        'tsx',
        `
        const queryClient = useQueryClient();

        const { mutate } = useMutation({
          mutationFn: (id: string) => fetch(\`/api/todo/\${id}/selesai\`, { method: 'POST' }),

          async onMutate(id) {
            // 1. Hentikan refetch yang sedang jalan supaya tidak menimpa perubahan optimistik.
            await queryClient.cancelQueries({ queryKey: ['todo'] });

            // 2. Simpan snapshot untuk dikembalikan kalau gagal.
            const sebelumnya = queryClient.getQueryData<Todo[]>(['todo']);

            // 3. Ubah cache sekarang juga.
            queryClient.setQueryData<Todo[]>(['todo'], (lama) =>
              lama?.map((t) => (t.id === id ? { ...t, selesai: true } : t)),
            );

            // 4. Kembalikan konteks -> diterima onError.
            return { sebelumnya };
          },

          onError(_error, _id, context) {
            // 5. Gagal: kembalikan persis seperti semula.
            if (context?.sebelumnya) {
              queryClient.setQueryData(['todo'], context.sebelumnya);
            }
          },

          onSettled() {
            // 6. Berhasil atau gagal, selaraskan lagi dengan server.
            queryClient.invalidateQueries({ queryKey: ['todo'] });
          },
        });
        `,
      ),
      callout(
        'warning',
        'Langkah 1 bukan formalitas',
        '`cancelQueries` sering dilewati, dan akibatnya halus: sebuah refetch yang sudah berangkat sebelum mutasi bisa tiba **setelah** kamu mengubah cache, lalu menimpanya dengan data lama. Tampilan berkedip kembali ke keadaan sebelumnya lalu benar lagi — bug yang sangat membingungkan untuk dilacak.',
      ),

      h2('Kenapa `onSettled` tetap perlu'),
      p(
        'Tebakan optimistikmu hampir selalu tidak lengkap. Server mungkin mengisi `updatedAt`, menghitung ulang total, atau menolak sebagian. `invalidateQueries` di `onSettled` memastikan yang akhirnya tampil adalah kebenaran server, bukan tebakan browser.',
      ),

      h2('Kapan optimistic update berbahaya'),
      table(
        ['Aman', 'Berbahaya'],
        [
          ['Suka / bookmark', 'Pembayaran dan transaksi keuangan'],
          ['Centang todo', 'Pemesanan dengan stok terbatas'],
          ['Ubah judul catatan', 'Booking kursi atau jadwal'],
          ['Tandai sudah dibaca', 'Operasi yang tidak bisa dibatalkan (kirim email)'],
        ],
      ),
      p(
        'Aturannya: optimistic update cocok kalau kegagalan itu **jarang, murah, dan bisa dibatalkan tanpa merugikan**. Untuk hal yang menyangkut uang atau sumber daya terbatas, tampilkan status "memproses" yang jujur. Memberi tahu pengguna bahwa pesanannya berhasil lalu menariknya kembali jauh lebih buruk daripada menunggu satu detik.',
      ),

      h2('Alternatif yang lebih murah: umpan balik sedang berjalan'),
      p(
        'Kadang kamu tidak butuh optimistic update sama sekali — cukup buat penantiannya terbaca. Tombol yang berubah jadi `disabled` dengan teks "Menyimpan…" sudah menghilangkan sebagian besar rasa lambat, dan tidak punya risiko pembatalan sama sekali.',
      ),
      callout(
        'tip',
        'Kaitan dengan aturan formulir',
        'Apa pun pilihanmu, tombol submit harus dinonaktifkan selama permintaan berjalan. Itu mencegah kiriman ganda — dan di sisi server, operasi yang penting tetap harus idempoten, karena penjagaan di sisi klien tidak pernah cukup.',
      ),
    ],
  ),

  written('url-state', 'URL sebagai State', 11, 'State yang harus bisa dibagikan lewat tautan.', [
    p(
      'Ada satu kategori state yang hampir selalu ditaruh di tempat yang salah: **apa yang sedang dilihat pengguna**. Filter, urutan, kata kunci, halaman ke berapa, tab yang aktif. Semua itu disimpan di `useState`, dan akibatnya baru terasa saat pengguna menekan refresh — semuanya kembali ke awal.',
    ),

    h2('Tanda bahwa state itu milik URL'),
    p('Tanyakan tiga hal. Kalau ada satu saja yang "ya", tempatnya di URL:'),
    ol(
      'Kalau pengguna menyalin alamat halaman dan mengirimkannya, haruskah penerimanya melihat hal yang sama?',
      'Kalau ia menekan refresh, haruskah tampilannya bertahan?',
      'Kalau ia menekan tombol kembali, haruskah ia kembali ke keadaan sebelumnya?',
    ),
    p(
      'Filter produk lolos ketiganya. Status dropdown yang sedang terbuka tidak lolos satu pun — itu memang state lokal.',
    ),

    h2('Di Next.js App Router'),
    code(
      'tsx',
      `
        'use client';

        import { usePathname, useRouter, useSearchParams } from 'next/navigation';

        export function FilterKategori() {
          const router = useRouter();
          const pathname = usePathname();
          const searchParams = useSearchParams();

          const kategori = searchParams.get('kategori') ?? 'semua';

          function ubah(nilai: string) {
            // Salin dulu — searchParams bersifat read-only.
            const params = new URLSearchParams(searchParams);

            if (nilai === 'semua') {
              params.delete('kategori');
            } else {
              params.set('kategori', nilai);
            }
            // Filter berubah -> kembali ke halaman 1, kalau tidak hasilnya membingungkan.
            params.delete('halaman');

            router.push(\`\${pathname}?\${params.toString()}\`);
          }

          return (
            <select value={kategori} onChange={(e) => ubah(e.target.value)}>
              <option value="semua">Semua</option>
              <option value="buku">Buku</option>
            </select>
          );
        }
        `,
    ),
    p(
      'Perhatikan: tidak ada `useState` sama sekali. Nilainya dibaca langsung dari URL, jadi tidak mungkin tidak sinkron. Inilah keuntungan terbesarnya — satu sumber kebenaran, bukan dua yang harus disamakan.',
    ),

    h2('`push` atau `replace`?'),
    table(
      ['Aksi', 'Metode', 'Alasan'],
      [
        [
          'Ganti filter atau halaman',
          '`router.push`',
          'Tombol kembali harus mengembalikan filter sebelumnya',
        ],
        [
          'Mengetik di kotak pencarian',
          '`router.replace`',
          'Kalau `push`, setiap huruf jadi satu entri riwayat',
        ],
        [
          'Menyesuaikan URL saat muat awal',
          '`router.replace`',
          'Jangan menambah riwayat yang tidak dibuat pengguna',
        ],
      ],
    ),

    h2('Pencarian: debounce sebelum menulis ke URL'),
    code(
      'tsx',
      `
        const [teks, setTeks] = useState(searchParams.get('q') ?? '');

        useEffect(() => {
          const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            teks ? params.set('q', teks) : params.delete('q');
            router.replace(\`\${pathname}?\${params.toString()}\`);
          }, 300);

          return () => clearTimeout(timer);
        }, [teks, pathname, router, searchParams]);
        `,
    ),
    p(
      'Ini satu-satunya kasus di mana menyimpan salinan lokal itu benar: input harus terasa responsif tiap ketikan, sementara URL cukup menyusul setelah pengguna berhenti mengetik.',
    ),

    h2('Membaca di Server Component'),
    code(
      'tsx',
      `
        // Tidak perlu 'use client' — filternya sudah ada sebelum halaman dirender.
        export default async function HalamanProduk({
          searchParams,
        }: {
          searchParams: Promise<{ kategori?: string; halaman?: string }>;
        }) {
          const { kategori, halaman } = await searchParams;
          const produk = await ambilProduk({ kategori, halaman: Number(halaman ?? 1) });

          return <DaftarProduk produk={produk} />;
        }
        `,
    ),
    callout(
      'info',
      '`searchParams` adalah Promise di Next.js 15+',
      'Sejak Next.js 15, `params` dan `searchParams` harus di-`await`. Kode lama yang membacanya langsung akan gagal type-check. Ini juga alasan komponen yang memakainya perlu `async`.',
    ),
    callout(
      'warning',
      'URL itu publik',
      'Apa pun yang kamu taruh di query string akan muncul di riwayat browser, log server, dan header `Referer` saat pengguna mengeklik tautan keluar. Jangan pernah menaruh token, id sesi, atau data pribadi di sana.',
    ),
  ]),

  written(
    'kriteria-memilih',
    'Kriteria Memilih & Anti-pattern',
    11,
    'Cara memutuskan tanpa mengikuti tren.',
    [
      p(
        'Pertanyaan "library state management mana yang terbaik" tidak punya jawaban, karena ia melewatkan langkah sebelumnya: menentukan kategori. Sub-bab ini merangkum keputusannya menjadi alur yang bisa kamu jalankan tanpa harus mengikuti perdebatan siapa pun.',
      ),

      h2('Alur keputusan'),
      steps(
        {
          title: 'Apakah sumber kebenarannya server?',
          body: 'Kalau ya, berhenti di sini. Pakai TanStack Query (atau SWR / RTK Query). Jangan lanjut ke pertanyaan berikutnya — data server bukan urusan store global.',
        },
        {
          title: 'Apakah ia harus bisa dibagikan lewat tautan atau bertahan saat refresh?',
          body: 'Kalau ya, tempatnya di URL lewat `searchParams`.',
        },
        {
          title: 'Apakah ia bisa dihitung dari state lain?',
          body: 'Kalau ya, ia bukan state. Hitung saat render, jangan simpan.',
        },
        {
          title: 'Berapa komponen yang membacanya?',
          body: 'Satu komponen dan anak-anaknya -> `useState` di sana. Dua bersaudara -> angkat ke induk terdekat.',
        },
        {
          title: 'Tersebar jauh, tapi jarang berubah?',
          body: 'Context sudah cukup. Tema, bahasa, sesi pengguna.',
        },
        {
          title: 'Tersebar jauh dan sering berubah?',
          body: 'Baru di sini library global. Zustand untuk kebanyakan kasus, Jotai kalau state-nya saling bergantung, Redux Toolkit kalau tim besar atau jejak aksi penting.',
        },
      ),

      h2('Anti-pola yang paling sering muncul'),
      table(
        ['Anti-pola', 'Kenapa merugikan', 'Gantinya'],
        [
          [
            'Data server disalin ke store global',
            'Cache, dedup, refetch, dan invalidasi jadi tanggunganmu',
            'TanStack Query / RTK Query',
          ],
          [
            'Nilai turunan disimpan sebagai state',
            'Dua sumber kebenaran yang pasti akan tidak sinkron',
            'Hitung saat render, atau derived atom',
          ],
          [
            '`useEffect` untuk menyalin props ke state',
            'Satu render ekstra, dan nilai lama sempat tampil',
            'Pakai props langsung, atau `key` untuk mereset',
          ],
          [
            'Semua state ditaruh global "biar gampang"',
            'Semua render ulang jadi saling terkait, sulit dilacak',
            'Turunkan sedekat mungkin dengan pembacanya',
          ],
          [
            'Filter & paginasi di `useState`',
            'Hilang saat refresh, tidak bisa dibagikan',
            '`searchParams`',
          ],
          [
            'Dua library global sekaligus',
            'Dua model mental, dua cara debug, batasnya kabur',
            'Pilih satu untuk client state',
          ],
        ],
      ),

      h2('Anti-pola yang paling halus: `useEffect` penyalin'),
      compare(
        {
          title: 'Salah',
          lang: 'tsx',
          code: `
          function Profil({ user }) {
            const [nama, setNama] = useState(user.nama);

            // Render dulu dengan nama lama,
            // baru diperbaiki -> ada kedipan.
            useEffect(() => {
              setNama(user.nama);
            }, [user.nama]);

            return <h1>{nama}</h1>;
          }
          `,
          notes: [
            'Dua sumber kebenaran untuk satu nilai',
            'Satu render terbuang setiap kali props berubah',
          ],
        },
        {
          title: 'Benar',
          lang: 'tsx',
          code: `
          function Profil({ user }) {
            // Tidak perlu state sama sekali.
            return <h1>{user.nama}</h1>;
          }

          // Kalau memang perlu state yang bisa diedit,
          // reset dengan key — bukan dengan Effect.
          <FormProfil key={user.id} user={user} />
          `,
          notes: [
            'Satu sumber kebenaran',
            '`key` yang berubah membuat React memasang ulang komponennya',
          ],
        },
      ),
      callout(
        'danger',
        'React Compiler menolak pola ini',
        'Di project yang mengaktifkan React Compiler — termasuk website yang sedang kamu baca ini — `setState` di dalam Effect adalah **error lint**, bukan peringatan. Itu disengaja: polanya hampir selalu menandakan state yang seharusnya tidak ada. Perbaiki strukturnya, jangan matikan aturannya.',
      ),

      h2('Ukuran yang sebenarnya penting'),
      p(
        'Saat memilih, jangan bandingkan library berdasarkan popularitas atau jumlah bintang. Bandingkan berdasarkan: berapa banyak konsep baru yang harus dipelajari orang lain di timmu, seberapa mudah melacak "kenapa komponen ini render ulang", dan seberapa jelas batas tanggung jawabnya terhadap data server.',
      ),
    ],
  ),

  written(
    'praktik-migrasi-state',
    'Praktik: Pindahkan state ke tempat yang benar',
    13,
    'Merapikan aplikasi yang menyimpan semuanya di satu tempat.',
    [
      p(
        'Latihan ini memakai bentuk yang akan sering kamu temui di kode nyata: satu komponen halaman yang menyimpan **semuanya** di `useState`. Kodenya bekerja, tidak ada error, dan justru itu yang membuatnya bertahan lama. Tugasmu membongkarnya menjadi empat kategori.',
      ),

      h2('Titik awal'),
      code(
        'tsx',
        `
        'use client';

        export function HalamanProduk() {
          // Server state
          const [produk, setProduk] = useState<Produk[]>([]);
          const [memuat, setMemuat] = useState(true);
          const [gagal, setGagal] = useState<string | null>(null);

          // URL state
          const [kategori, setKategori] = useState('semua');
          const [urutan, setUrutan] = useState('terbaru');
          const [halaman, setHalaman] = useState(1);

          // Client global state
          const [keranjang, setKeranjang] = useState<Item[]>([]);

          // Nilai turunan yang malah disimpan
          const [totalHarga, setTotalHarga] = useState(0);

          // Lokal — ini satu-satunya yang sudah benar
          const [filterTerbuka, setFilterTerbuka] = useState(false);

          useEffect(() => {
            setMemuat(true);
            fetch(\`/api/produk?kategori=\${kategori}&urutan=\${urutan}&halaman=\${halaman}\`)
              .then((r) => r.json())
              .then((d) => { setProduk(d); setMemuat(false); })
              .catch((e) => { setGagal(e.message); setMemuat(false); });
          }, [kategori, urutan, halaman]);

          useEffect(() => {
            setTotalHarga(keranjang.reduce((n, i) => n + i.harga * i.jumlah, 0));
          }, [keranjang]);

          // ...
        }
        `,
      ),

      h2('Cacat yang ada di kode itu'),
      ol(
        '**Race condition.** Ganti kategori dua kali dengan cepat, dan respons pertama bisa tiba belakangan lalu menimpa yang benar.',
        '**Filter hilang saat refresh** dan tidak bisa dibagikan lewat tautan.',
        '**`totalHarga` adalah state kedua** untuk nilai yang sudah bisa dihitung — pasti akan tidak sinkron suatu saat.',
        '**Keranjang hilang** begitu pengguna pindah halaman.',
        '**Tidak ada cache.** Kembali ke kategori yang sama berarti menembak API lagi.',
        '**`setState` di dalam Effect** — ditolak React Compiler.',
      ),

      h2('Langkah pembongkaran'),
      steps(
        {
          title: '1. Pindahkan data server ke TanStack Query',
          body: 'Hapus `produk`, `memuat`, `gagal`, dan Effect pengambil datanya. Ganti dengan satu `useQuery` yang query key-nya memuat kategori, urutan, dan halaman. Race condition dan cache selesai sekaligus.',
        },
        {
          title: '2. Pindahkan filter ke URL',
          body: 'Hapus `kategori`, `urutan`, `halaman` dari `useState`. Baca dari `useSearchParams`, tulis dengan `router.push`. Ingat mengembalikan `halaman` ke 1 setiap kali filter berubah.',
        },
        {
          title: '3. Hapus nilai turunan',
          body: 'Hapus `totalHarga` beserta Effect-nya. Hitung saat render — atau jadikan bagian dari store keranjang sebagai fungsi, bukan sebagai state tersimpan.',
        },
        {
          title: '4. Pindahkan keranjang ke store global',
          body: 'Buat store Zustand dengan `persist`, supaya isinya bertahan antar halaman dan antar sesi. Ingat pola skeleton sampai terhidrasi kalau memakai SSR.',
        },
        {
          title: '5. Biarkan yang lokal tetap lokal',
          body: '`filterTerbuka` tidak perlu dipindah ke mana-mana. Memindahkannya ke store global justru langkah mundur.',
        },
      ),

      h2('Bentuk akhirnya'),
      code(
        'tsx',
        `
        'use client';

        export function HalamanProduk() {
          const searchParams = useSearchParams();
          const kategori = searchParams.get('kategori') ?? 'semua';
          const urutan = searchParams.get('urutan') ?? 'terbaru';
          const halaman = Number(searchParams.get('halaman') ?? 1);

          const { data, isPending, isError, error } = useQuery({
            queryKey: ['produk', { kategori, urutan, halaman }],
            queryFn: () => ambilProduk({ kategori, urutan, halaman }),
            staleTime: 60_000,
          });

          const totalHarga = useKeranjang((s) =>
            s.items.reduce((n, i) => n + i.harga * i.jumlah, 0),
          );

          const [filterTerbuka, setFilterTerbuka] = useState(false);

          if (isPending) return <SkeletonDaftar />;
          if (isError) return <PesanGagal pesan={error.message} />;

          return <DaftarProduk produk={data} total={totalHarga} />;
        }
        `,
      ),
      p(
        'Sepuluh `useState` dan dua `useEffect` menyusut menjadi satu `useState`, satu query, dan satu selector. Yang lebih penting daripada jumlah barisnya: enam cacat di daftar tadi hilang semua — bukan karena ditambal, melainkan karena setiap data akhirnya berada di tempat yang memang dirancang untuknya.',
      ),

      divider,

      checklist(
        'fi5-praktik',
        'Checklist praktik bab ini',
        'Daftar semua state di satu halamanmu, lalu beri label kategorinya masing-masing',
        'Pindahkan satu data server dari `useState` + `useEffect` ke `useQuery`',
        'Pastikan semua argumen yang dipakai `queryFn` juga ada di `queryKey`',
        'Pindahkan filter dan paginasi ke `searchParams`, dan reset halaman saat filter berubah',
        'Hapus setiap state yang sebenarnya bisa dihitung dari state lain',
        'Cari `useEffect` yang isinya hanya `setState`, lalu hilangkan penyebabnya',
        'Uji dengan jaringan dilambatkan (throttle) untuk memastikan tidak ada race condition',
        'Uji tombol kembali dan refresh — filter harus bertahan',
      ),
    ],
  ),
];
