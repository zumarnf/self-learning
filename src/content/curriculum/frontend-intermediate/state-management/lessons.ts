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

      terms(
        {
          term: 'state',
          meaning:
            'Data yang bisa berubah dan yang perubahannya harus tercermin di layar. Kata kuncinya "berubah" — nilai yang tidak pernah berubah bukan state, ia konstanta. Dan nilai yang bisa **dihitung** dari state lain juga bukan state; itu nilai turunan, dan menyimpannya adalah awal dari data yang tidak sinkron.',
        },
        {
          term: 'state management',
          meaning:
            'Payung untuk seluruh keputusan soal "data ini disimpan di mana, siapa yang boleh mengubahnya, dan siapa yang perlu tahu saat ia berubah". Klaim seluruh bab ini: sebagian besar "masalah state management" sebenarnya **masalah pengklasifikasian** — salah kategori berarti salah alat.',
        },
        {
          term: 'client state',
          meaning:
            'Data yang **dimiliki browser**: tema gelap/terang, sidebar terbuka, isi keranjang belanja. Tidak ada versi "benar" di tempat lain — yang ada di layar itulah kebenarannya. Karena itu ia tidak perlu disinkronkan dengan siapa pun.',
        },
        {
          term: 'server state',
          meaning:
            'Data yang **dimiliki server**: daftar produk, profil pengguna, notifikasi. Yang ada di browser cuma **salinan** yang bisa basi kapan saja. Sifat inilah yang membuatnya butuh alat berbeda — ia punya mode gagal (permintaan gagal), umur (kapan dianggap basi), dan bisa diminta beberapa komponen sekaligus.',
        },
        {
          term: 'URL state',
          meaning:
            'State yang tersimpan di alamat halaman — filter, urutan, nomor halaman, kata kunci. Ujinya satu kalimat: **apakah ini harus bisa dibagikan lewat tautan?** Kalau ya, tempatnya di URL. Filter yang hilang saat halaman di-refresh adalah bug, bukan fitur.',
        },
        {
          term: 'form state',
          meaning:
            'Nilai tiap field, pesan error validasi, dan status pengiriman sebuah formulir. Ia punya siklus hidup sendiri yang pendek dan aturan sendiri (kapan divalidasi, kapan error ditampilkan), jadi memaksanya ke store global hampir selalu memperumit.',
        },
        {
          term: 'kebasian (staleness)',
          meaning:
            'Keadaan ketika salinan data di browser sudah tidak sama dengan yang di server. Konsep ini **hanya ada** pada server state — dan itulah satu perbedaan paling tajam yang membuat menyalin data server ke store global jadi mahal.',
        },
        {
          term: 'deduplikasi permintaan',
          meaning:
            'Menggabungkan beberapa permintaan identik yang terjadi berbarengan menjadi satu. Tanpa itu, tiga komponen yang sama-sama butuh `/api/produk` menembak API tiga kali. Alat server state melakukannya otomatis lewat query key; store global tidak.',
        },
        {
          term: 'invalidasi',
          meaning:
            'Menandai data cache sebagai tidak berlaku lagi agar diambil ulang — biasanya setelah kamu mengubah sesuatu. Contoh: setelah menambah produk, daftar produk harus diinvalidasi. Menulis ini dengan tangan di store global berarti kamu harus ingat setiap tempat yang terpengaruh.',
        },
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
      p(
        'Perbandingan panjang-pendek di sini menyesatkan kalau dibaca sebagai "yang kanan lebih ringkas". Yang sebenarnya berbeda adalah **apa yang sudah tersedia**. Kolom kiri bukan kode yang buruk — ia benar untuk apa yang ia tulis; masalahnya ada pada tiga catatan di bawahnya, yang semuanya tentang hal yang **tidak ditulis**. Dua komponen yang memanggil `ambilProduk` bersamaan akan menembak API dua kali karena tidak ada deduplikasi. Data yang sudah satu jam tetap dipakai karena tidak ada konsep kebasian. Dan begitu ada entitas kedua — pesanan, pengguna, ulasan — seluruh blok `loading`/`error`/`try-catch` itu disalin lagi, dengan peluang baru untuk berbeda satu sama lain. Kolom kanan tidak menghilangkan pekerjaan itu; ia hanya memindahkannya ke alat yang memang dirancang untuk menanggungnya.',
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
      references(
        {
          label: 'Managing State',
          href: 'https://react.dev/learn/managing-state',
          source: 'React',
          note: 'Panduan resmi React soal memilih tempat menyimpan state sebelum memilih library.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Prinsip yang mendasari tabel kategori di atas, termasuk larangan menduplikasi state.',
        },
        {
          label: 'Why TanStack Query?',
          href: 'https://tanstack.com/query/latest/docs/framework/react/overview',
          source: 'TanStack Query',
          note: 'Alasan resmi kenapa server state butuh alat sendiri, bukan store global.',
        },
        {
          label: 'searchParams',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional',
          source: 'Next.js',
          note: 'Cara membaca state yang tersimpan di URL pada App Router.',
        },
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

      terms(
        {
          term: 'dependency',
          meaning:
            'Paket pihak ketiga yang project-mu ikut pasang dan andalkan. Setiap dependency adalah **kontrak jangka panjang**: satu lagi API untuk dipelajari, satu lagi cara debug, satu lagi sumber "kenapa komponen ini render ulang", dan satu lagi yang harus ikut di-update.',
        },
        {
          term: 'mengangkat state (lifting state up)',
          meaning:
            'Memindahkan state ke komponen **induk terdekat** yang memuat semua komponen yang membutuhkannya. Ini bukan solusi kelas dua — ini solusi **default**, dan React memang dirancang untuk ini. Baru setelah induk terdekatnya jadi terlalu tinggi, alat lain layak dipertimbangkan.',
        },
        {
          term: 'komponen bersaudara (sibling)',
          meaning:
            'Dua komponen yang berada di bawah induk yang sama. Mereka tidak bisa saling bicara langsung — komunikasi harus lewat induknya. Itu bukan keterbatasan React, melainkan konsekuensi aliran data satu arah yang membuat asal-usul sebuah nilai selalu bisa dilacak.',
        },
        {
          term: 'prop drilling',
          meaning:
            'Dibaca "prop driling", artinya **mengebor props**. Sebuah nilai dioper turun melewati beberapa lapisan komponen yang sendirinya tidak memakainya — mereka cuma jadi kurir. Ini alasan paling umum orang lari ke library global, padahal sering kali obatnya bukan library.',
        },
        {
          term: 'komposisi',
          meaning:
            'Menyusun antarmuka dengan mengoper **elemen** (`<Header user={user} />`), bukan **data** (`user={user}`). Bedanya besar: komponen pembungkus tidak perlu tahu apa pun tentang data yang lewat, karena elemennya sudah dibuat di tempat datanya tersedia.',
        },
        {
          term: 'children',
          meaning:
            'Prop khusus berisi apa pun yang kamu tulis di antara tag pembuka dan penutup sebuah komponen. Ia adalah bentuk komposisi paling sederhana — dan sekaligus alat paling ampuh melawan prop drilling, karena isinya dibuat oleh pemanggil, bukan oleh komponennya.',
        },
        {
          term: 'bundle',
          meaning:
            'Berkas JavaScript hasil penggabungan seluruh kode aplikasimu yang harus diunduh browser. Setiap library yang ditambahkan membesarkannya, dan setiap kilobyte tambahan berarti halaman lebih lambat bisa dipakai — terutama di jaringan lambat dan perangkat murah.',
        },
        {
          term: 'unmount',
          meaning:
            'Saat React mencabut sebuah komponen dari layar. Seluruh state di dalamnya ikut hilang. Kalau sebuah nilai **harus bertahan** melewati unmount — misalnya isi keranjang saat pengguna berpindah halaman — itu salah satu tanda sah bahwa state-nya perlu tempat di luar komponen.',
        },
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
      p(
        'Perhatikan `terpilih` hidup di `Halaman`, bukan di salah satu anaknya — dan itu **satu-satunya** keputusan yang dibuat di sini. Dari situ arahnya mengikuti pola data-turun-perubahan-naik: `DaftarProduk` menerima nilainya untuk menandai mana yang aktif, dan menerima `onPilih` untuk memberi tahu ketika pengguna memilih yang lain. `DetailProduk` hanya menerima nilainya, karena ia tidak pernah mengubah pilihan. Yang layak digarisbawahi adalah apa yang **tidak** ada: tidak ada context, tidak ada store, tidak ada library. Untuk dua komponen bersaudara, mengangkat state ke induk terdekat memang jawaban yang lengkap — dan menjangkau lebih jauh dari itu sebelum ada masalah nyata hanya menambah lapisan tanpa menambah kemampuan.',
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
      references(
        {
          label: 'Sharing State Between Components',
          href: 'https://react.dev/learn/sharing-state-between-components',
          source: 'React',
          note: 'Teknik mengangkat state ke induk terdekat, langkah demi langkah.',
        },
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Termasuk `children` sebagai bentuk komposisi paling sederhana.',
        },
        {
          label: 'Passing Data Deeply with Context — coba alternatifnya dulu',
          href: 'https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context',
          source: 'React',
          note: 'Dua alternatif resmi yang dianjurkan React sebelum menambah Context, apalagi library.',
        },
        {
          label: 'Thinking in React',
          href: 'https://react.dev/learn/thinking-in-react',
          source: 'React',
          note: 'Langkah menentukan di mana sebuah state seharusnya hidup.',
        },
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

      terms(
        {
          term: 'Context',
          meaning:
            'Mekanisme bawaan React untuk mengirim nilai ke seluruh komponen di bawahnya tanpa mengoper props satu per satu. Kalimat kunci sub-bab ini: **Context bukan store.** Ia alat **distribusi** — soal bagaimana nilai sampai ke bawah — bukan alat penyimpanan dan bukan alat optimasi.',
        },
        {
          term: 'store',
          meaning:
            'Tempat penyimpanan state yang hidup di luar pohon komponen, biasanya dengan kemampuan memilih bagian tertentu saja (selector). Bedanya dengan Context tegas: store menyimpan **dan** menyalurkan secara selektif; Context hanya menyalurkan, seluruhnya, ke semua konsumen.',
        },
        {
          term: 'konsumen (consumer)',
          meaning:
            'Komponen yang memanggil `useContext` untuk membaca sebuah context. Sifat penting yang mengejutkan banyak orang: **setiap** konsumen dirender ulang saat nilai context berubah — tanpa peduli bagian mana dari nilai itu yang sebenarnya ia pakai.',
        },
        {
          term: 'selector',
          meaning:
            'Fungsi yang memilih **sepotong** dari sebuah store, misalnya `(s) => s.keranjang.jumlah`. Komponen hanya dirender ulang kalau potongan itu yang berubah. Context **tidak punya** ini — dan ketiadaannya persis yang membuat orang kecewa pada Context untuk data yang sering berubah.',
        },
        {
          term: 'render ulang (re-render)',
          meaning:
            'React menjalankan ulang fungsi komponen untuk menghitung tampilan barunya. Ini tidak selalu mahal — yang mahal adalah **jumlahnya** ketika seluruh halaman ikut, padahal yang berubah cuma satu angka di pojok.',
        },
        {
          term: 'objek literal',
          meaning:
            'Objek yang ditulis langsung di tempat, seperti `{ tema, ganti }`. Setiap render Provider membuatnya **baru** — isinya sama persis tapi identitasnya berbeda menurut `Object.is`. Akibatnya semua konsumen dianggap menerima nilai baru meski tidak ada yang benar-benar berubah.',
        },
        {
          term: 'hook pembungkus',
          meaning:
            'Fungsi seperti `useTema()` yang membungkus `useContext` beserta pengecekan `null`-nya. Ia memberi tiga hal sekaligus: gagal keras dengan pesan jelas kalau Provider lupa dipasang, tipe yang sudah bukan `null`, dan satu tempat kalau implementasinya berubah nanti.',
        },
        {
          term: 'useCallback',
          meaning:
            'Hook yang menjaga identitas sebuah fungsi tetap sama antar render. Di contoh bawah ia dipakai supaya fungsi `ganti` tidak berubah tiap render — sehingga komponen yang hanya butuh "cara mengubah" tidak ikut dirender saat nilainya berubah.',
        },
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
      p(
        'Berkas ini mengekspor **dua** hal dan menyembunyikan satu. Yang diekspor: `PenyediaTema` untuk dipasang di dekat akar aplikasi, dan `useTema()` untuk dipakai komponen mana pun di bawahnya. Yang sengaja **tidak** diekspor adalah `KonteksTema` itu sendiri — dan itu keputusan yang menentukan. Perhatikan `createContext` diberi nilai awal `null`, bukan objek tema bawaan: dengan begitu, komponen yang dipakai tanpa Provider mendapat `null`, dan `useTema` bisa melemparkan error dengan pesan yang menyebutkan persis apa yang kurang. Kalau nilai awalnya diisi objek yang tampak masuk akal, kesalahan lupa memasang Provider akan lolos diam-diam dan muncul sebagai tema yang tidak pernah berubah — jauh lebih sulit dilacak daripada error yang berteriak.',
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
      p(
        "Perhatikan susunan bersarangnya: `KonteksAksi` di luar, `KonteksNilai` di dalam. Urutan itu disengaja meski secara fungsional keduanya setara — yang jarang berubah ditaruh di luar, yang sering berubah di dalam, sehingga struktur kodenya sendiri mencerminkan frekuensi perubahannya. Kunci teknisnya ada pada `useCallback` dengan array dependensi **kosong**, dan itu hanya mungkin karena `setTema` dipanggil dengan bentuk fungsi `(t) => ...`. Kalau ditulis `setTema(tema === 'terang' ? 'gelap' : 'terang')`, fungsi `ganti` akan bergantung pada nilai `tema` dan harus dibuat ulang setiap kali temanya berubah — yang membuat seluruh pemisahan ini sia-sia. Hasil akhirnya: komponen yang hanya memanggil `useContext(KonteksAksi)` untuk mendapat tombol pengubah **tidak pernah** ikut dirender saat temanya berganti.",
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
      references(
        {
          label: 'useContext',
          href: 'https://react.dev/reference/react/useContext',
          source: 'React',
          note: 'Termasuk bagian "optimizing re-renders when passing objects and functions".',
        },
        {
          label: 'createContext',
          href: 'https://react.dev/reference/react/createContext',
          source: 'React',
          note: 'Bentuk `<Konteks value=...>` tanpa `.Provider` sejak React 19.',
        },
        {
          label: 'Passing Data Deeply with Context',
          href: 'https://react.dev/learn/passing-data-deeply-with-context',
          source: 'React',
          note: 'Daftar resmi kasus pemakaian Context yang tepat — semuanya "jarang berubah, banyak pembaca".',
        },
        {
          label: 'useCallback',
          href: 'https://react.dev/reference/react/useCallback',
          source: 'React',
          note: 'Menjaga identitas fungsi pengubah tetap stabil saat dipisah ke context sendiri.',
        },
      ),
    ],
  ),

  written('zustand', 'Zustand', 11, 'Store global yang ringan.', [
    p(
      'Zustand adalah store global tanpa Provider, tanpa boilerplate, dan dengan satu kemampuan penting yang tidak dimiliki Context: **selector**. Komponen bisa berlangganan hanya pada potongan state yang benar-benar ia baca, sehingga perubahan di bagian lain tidak ikut me-render ulang.',
    ),

    terms(
      {
        term: 'Zustand',
        meaning:
          'Bahasa Jerman untuk **keadaan** (*state*), dibaca "tsu-shtand". Library store global buatan tim Poimandres. Tiga sifat yang membedakannya: tidak butuh Provider, tidak butuh boilerplate, dan punya **selector** — kemampuan yang tidak dimiliki Context.',
      },
      {
        term: 'create',
        meaning:
          'Fungsi utama Zustand untuk membuat sebuah store. Ia mengembalikan **hook** yang bisa langsung dipakai di komponen mana pun. Itu sebabnya tidak ada Provider yang harus dipasang di root — store-nya cuma modul biasa yang di-import.',
      },
      {
        term: 'set',
        meaning:
          'Fungsi yang diberikan Zustand ke dalam definisi store-mu untuk mengubah state. Ia menerima objek berisi field yang ingin diubah, atau sebuah fungsi `(state) => perubahan` kalau nilai barunya dihitung dari nilai lama — pola yang sama persis dengan setter `useState`.',
      },
      {
        term: 'selector',
        meaning:
          'Fungsi yang memilih **sepotong** state: `useKeranjang((s) => s.items.length)`. Komponen hanya dirender ulang kalau potongan itu yang berubah. Inilah bagian yang membuat Zustand cepat — dan melewatkannya berarti membuang keunggulan utamanya.',
      },
      {
        term: 's',
        meaning:
          'Sekadar singkatan dari *state* pada selector `(s) => s.items.length`. Namanya bebas — `(state) => state.items.length` sama benarnya. Nama pendek lazim dipakai karena selector hampir selalu satu ekspresi pendek.',
      },
      {
        term: 'useShallow',
        meaning:
          'Pembungkus dari `zustand/react/shallow` yang membandingkan hasil selector **per properti**, bukan per referensi. Dipakai saat kamu memang butuh beberapa nilai sekaligus — tanpanya, selector yang mengembalikan objek baru akan selalu dianggap berubah dan bisa memicu render tanpa henti.',
      },
      {
        term: 'Omit',
        meaning:
          'Utility type TypeScript. `Omit<Item, \'jumlah\'>` berarti "tipe `Item`, tapi tanpa properti `jumlah`". Dipakai di sini karena `jumlah` diisi oleh store-nya sendiri, jadi pemanggil tidak perlu — dan tidak boleh — menentukannya.',
      },
      {
        term: 'getState',
        meaning:
          'Metode pada store untuk membaca nilai sekarang **tanpa berlangganan**. Karena ia tidak memicu render, ia aman dipakai di luar komponen — di dalam event handler, fungsi utilitas, atau kode non-React. Sesuatu yang tidak mungkin dilakukan dengan Context.',
      },
      {
        term: 'middleware',
        meaning:
          'Lapisan yang membungkus store untuk menambah kemampuan tanpa mengubah kodenya. Zustand punya beberapa bawaan; yang paling sering dipakai adalah `persist`, yang menyimpan isi store ke `localStorage` secara otomatis.',
      },
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
      '`create<Keranjang>((set) => ({...}))` menerima satu fungsi yang menerima `set` sebagai argumen, dan mengembalikan **objek state awal** beserta seluruh fungsi yang boleh mengubahnya — `items`, `tambah`, `hapus`, `kosongkan` semuanya didefinisikan dalam satu tempat. `set` bekerja mirip `setState` versi `useState`, dengan satu perbedaan penting: hasil yang dikembalikan **digabung (merge)** ke state yang sudah ada, bukan menggantikannya seluruhnya — itulah mengapa `kosongkan: () => set({ items: [] })` cukup menyebut `items` saja tanpa perlu menuliskan ulang `tambah`, `hapus`, dan fungsi lainnya. Di dalam `tambah`, `set` dipanggil dengan bentuk fungsi `(state) => {...}` justru karena hasilnya perlu dihitung dari `state.items` yang sekarang — pola yang sama dengan bentuk updater `setJumlah((n) => n + 1)` yang sudah kamu kenal dari `useState`.',
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
    references(
      {
        label: 'Zustand — Introduction',
        href: 'https://zustand.docs.pmnd.rs/getting-started/introduction',
        source: 'Zustand',
        note: 'Dokumentasi resmi Zustand, termasuk bentuk `create` dan pemakaian dasarnya.',
      },
      {
        label: 'Prevent rerenders with useShallow',
        href: 'https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow',
        source: 'Zustand',
        note: 'Jalan keluar resmi untuk selector yang mengembalikan objek atau array.',
      },
      {
        label: 'persist middleware',
        href: 'https://zustand.docs.pmnd.rs/integrations/persisting-store-data',
        source: 'Zustand',
        note: 'Opsi `name` dan `partialize` yang dipakai contoh penyimpanan ke `localStorage`.',
      },
      {
        label: 'Omit<Type, Keys>',
        href: 'https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys',
        source: 'TypeScript',
        note: 'Utility type yang membuat pemanggil tidak perlu mengisi field `jumlah`.',
      },
    ),
  ]),

  written('redux-toolkit', 'Redux Toolkit', 12, 'Redux modern, jauh dari boilerplate versi lama.', [
    p(
      'Reputasi Redux sebagai "banyak boilerplate" berasal dari cara lama menulisnya: konstanta action, action creator, dan reducer `switch` yang panjang, semuanya ditulis tangan di file terpisah. **Redux Toolkit (RTK)** adalah cara resmi menulis Redux sekarang, dan ia menghapus hampir semua itu.',
    ),

    terms(
      {
        term: 'Redux',
        meaning:
          'Library state global tertua dan paling berpengaruh di ekosistem React. Reputasinya "banyak boilerplate" berasal dari **cara lama** menulisnya: konstanta action, action creator, dan reducer `switch` panjang, semuanya ditulis tangan di file terpisah.',
      },
      {
        term: 'boilerplate',
        meaning:
          'Dibaca "boilerpleit", artinya **kode pengulangan** — potongan yang harus ditulis berulang kali tanpa membawa makna baru. Namanya dari pelat baja cetakan yang dipakai berkali-kali di percetakan lama. Menghapusnya adalah alasan utama Redux Toolkit ada.',
      },
      {
        term: 'Redux Toolkit (RTK)',
        meaning:
          'Cara **resmi** menulis Redux sekarang. Bukan library saingan — ini yang direkomendasikan tim Redux sendiri. Kalau kamu menemukan tutorial Redux yang menulis konstanta action dengan tangan, tutorial itu mengajarkan cara yang sudah ditinggalkan.',
      },
      {
        term: 'slice',
        meaning:
          'Dibaca "slais", artinya **irisan**. Satu potongan state beserta seluruh reducer dan action-nya dalam satu berkas. `createSlice` menghasilkan ketiganya sekaligus — reducer, action creator, dan tipenya — jadi tidak ada yang bisa lupa disinkronkan.',
      },
      {
        term: 'payload',
        meaning:
          'Data yang dibawa sebuah action. Pada `PayloadAction<string>`, artinya "action ini membawa satu string". Namanya dari istilah pengiriman: muatan yang dibawa, dipisahkan dari label pengirimannya (`type`).',
      },
      {
        term: 'Immer',
        meaning:
          'Library yang membuat `state.items.push()` di dalam `createSlice` **boleh** ditulis. Yang kamu ubah sebenarnya objek **draft**; Immer mencatat perubahannya lalu menghasilkan objek baru yang immutable. Aturan "jangan memutasi state" tetap berlaku — hanya kodenya jadi enak dibaca. Ini **hanya** berlaku di dalam `createSlice`, bukan di komponen.',
      },
      {
        term: 'configureStore',
        meaning:
          'Fungsi RTK untuk merakit store dari beberapa slice sekaligus. Ia juga memasang DevTools dan middleware standar secara otomatis — bagian yang di Redux lama harus disiapkan sendiri.',
      },
      {
        term: 'dispatch',
        meaning:
          'Fungsi untuk **mengirim** sebuah action ke store. Namanya berarti "mengirimkan/menugaskan". Komponen tidak pernah mengubah state langsung; ia mengirim action, dan reducer yang memutuskan hasilnya.',
      },
      {
        term: 'ReturnType<typeof …>',
        meaning:
          'Trik TypeScript untuk **menurunkan** tipe dari kode yang sudah ada, alih-alih menuliskannya lagi. `RootState` diambil dari bentuk store yang sebenarnya — jadi ia tidak bisa basi saat slice baru ditambahkan.',
      },
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
    references(
      {
        label: 'Redux Toolkit — Getting Started',
        href: 'https://redux-toolkit.js.org/introduction/getting-started',
        source: 'Redux Toolkit',
        note: 'Cara resmi menulis Redux sekarang, menggantikan pola konstanta action buatan tangan.',
      },
      {
        label: 'createSlice',
        href: 'https://redux-toolkit.js.org/api/createSlice',
        source: 'Redux Toolkit',
        note: 'Menghasilkan reducer, action creator, dan tipenya sekaligus dari satu definisi.',
      },
      {
        label: 'Redux Style Guide',
        href: 'https://redux.js.org/style-guide/',
        source: 'Redux',
        note: 'Konvensi resmi, termasuk kenapa mutasi hanya boleh di dalam reducer yang dibungkus Immer.',
      },
      {
        label: 'RTK Query — Overview',
        href: 'https://redux-toolkit.js.org/rtk-query/overview',
        source: 'Redux Toolkit',
        note: 'Alat server state milik Redux sendiri, pengganti slice + `createAsyncThunk` untuk data API.',
      },
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

      terms(
        {
          term: 'Jotai',
          meaning:
            'Bahasa Jepang untuk **keadaan** (状態), dibaca "jo-tai". Library dari tim yang sama dengan Zustand (Poimandres). Bedanya arah: Zustand memakai satu store besar yang dipotong dengan selector, Jotai memecah state jadi banyak potongan kecil yang dirakit dari bawah.',
        },
        {
          term: 'atom',
          meaning:
            'Satu potongan state terkecil yang berdiri sendiri. Namanya dari kimia — bagian terkecil yang masih punya identitas. Sebuah atom bisa berisi nilai biasa, atau berisi **rumus** yang membaca atom lain. Yang kedua itulah kekuatan utama Jotai.',
        },
        {
          term: 'model atomic',
          meaning:
            'Pendekatan "bangun dari bawah": kamu mendefinisikan potongan-potongan kecil, lalu yang besar muncul sebagai turunannya. Lawannya model store tunggal, yang mendefinisikan satu objek besar lalu memotongnya dengan selector.',
        },
        {
          term: 'useAtom',
          meaning:
            'Hook yang mengembalikan `[nilai, setter]` — bentuknya sengaja dibuat semirip mungkin dengan `useState`, supaya perpindahannya terasa alami. Ia berlangganan **dan** bisa menulis.',
        },
        {
          term: 'useAtomValue',
          meaning:
            'Hanya **membaca** sebuah atom. Dipakai di komponen yang menampilkan nilainya tapi tidak pernah mengubahnya — lebih jelas maksudnya daripada mengambil `[nilai]` dan membuang setter-nya.',
        },
        {
          term: 'useSetAtom',
          meaning:
            'Hanya **menulis**, tanpa berlangganan. Ini keunggulan yang paling terasa: tombol reset yang tidak pernah menampilkan angkanya jadi **tidak pernah** dirender ulang — sesuatu yang butuh usaha ekstra untuk dicapai dengan Context.',
        },
        {
          term: 'derived atom',
          meaning:
            'Atom yang nilainya **dihitung** dari atom lain: `atom((get) => get(itemsAtom).length)`. Ia ikut terbarui otomatis, tanpa `useEffect`, dan tanpa risiko dua sumber kebenaran — karena nilainya memang tidak pernah disimpan.',
        },
        {
          term: 'get',
          meaning:
            'Fungsi yang diberikan Jotai ke dalam rumus sebuah derived atom untuk membaca atom lain. Selain membaca, ia juga **mendaftarkan ketergantungan**: Jotai jadi tahu atom mana yang harus dihitung ulang saat sumbernya berubah.',
        },
        {
          term: 'read-write atom',
          meaning:
            'Atom turunan yang juga bisa **ditulis** — argumen keduanya menerjemahkan tulisan itu kembali ke atom sumbernya. Berguna untuk membuat "pintu masuk" yang nyaman, misalnya `itemPertamaAtom` yang menulis ke `itemsAtom`.',
        },
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
      p(
        'Ketiga komponen membaca **atom yang sama**, tapi memakai hook yang berbeda — dan pilihan hook itulah yang menentukan siapa ikut dirender. `useAtom` memberi keduanya, nilai dan setter, seperti `useState`. `useAtomValue` hanya berlangganan nilainya. Yang paling menarik `useSetAtom`: ia memberi kemampuan **mengubah tanpa berlangganan**, sehingga `TombolReset` tidak pernah dirender ulang berapa kali pun angkanya berubah. Bandingkan dengan Context, di mana setiap konsumen ikut dirender tanpa peduli bagian mana yang ia pakai — di sana pemisahan seperti ini harus dicapai dengan memecah context menjadi dua, seperti yang dilakukan di sub-bab sebelumnya. Di Jotai pemisahan itu sudah menjadi bagian dari API-nya.',
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
      p(
        'Perhatikan `totalHargaAtom` dan `jumlahItemAtom` **tidak menyimpan apa pun** — keduanya berupa fungsi yang menghitung dari `itemsAtom` lewat `get`. Itu yang membuatnya mustahil tidak sinkron: tidak ada salinan yang bisa basi, karena tidak ada salinan. Bandingkan dengan menyimpan `totalHarga` sebagai state terpisah lalu menjaganya dengan `useEffect` — persis anti-pola nilai turunan dari sub-bab kesalahan `useEffect`, dan di sini masalahnya hilang di tingkat rancangan. `itemPertamaAtom` menunjukkan bentuk yang lebih jauh: argumen pertama membacanya, argumen kedua **menerjemahkan penulisan kembali ke atom sumber**. Jadi komponen bisa menulis ke `itemPertamaAtom` seolah ia state biasa, sementara yang sebenarnya berubah tetap `itemsAtom` — satu sumber kebenaran tetap terjaga meski cara mengaksesnya beragam.',
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
      references(
        {
          label: 'Jotai — Introduction',
          href: 'https://jotai.org/docs/introduction',
          source: 'Jotai',
          note: 'Model atomic dan alasan API-nya sengaja dibuat mirip `useState`.',
        },
        {
          label: 'atom()',
          href: 'https://jotai.org/docs/core/atom',
          source: 'Jotai',
          note: 'Bentuk atom biasa, derived atom, dan atom yang bisa dibaca sekaligus ditulis.',
        },
        {
          label: 'useAtom / useAtomValue / useSetAtom',
          href: 'https://jotai.org/docs/core/use-atom',
          source: 'Jotai',
          note: 'Tiga hook dengan perilaku langganan yang berbeda — dasar optimasi di sub-bab ini.',
        },
        {
          label: 'Comparison with other libraries',
          href: 'https://jotai.org/docs/basics/comparison',
          source: 'Jotai',
          note: 'Perbandingan resmi Jotai dengan Redux, Zustand, dan Recoil.',
        },
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

      terms(
        {
          term: 'TanStack Query',
          meaning:
            'Library khusus **server state**, dulu bernama React Query. "TanStack" adalah nama kumpulan tool dari Tanner Linsley. Ia bukan store — ia **cache** yang tahu cara mengambil ulang, membatalkan, dan menyegarkan data yang bukan milikmu.',
        },
        {
          term: 'cache',
          meaning:
            'Dibaca "kesh", artinya **simpanan sementara**. Data yang sudah pernah diambil disimpan supaya pindah halaman lalu kembali tidak menembak API lagi. Bedanya dengan store: cache tahu **umur** isinya, dan tahu kapan isinya perlu diperbarui.',
        },
        {
          term: 'useQuery',
          meaning:
            'Hook untuk **membaca** data server. Ia mengembalikan objek berisi `data`, `isPending`, `isError`, dan seterusnya. Kamu tidak memanggilnya untuk "mengambil data sekali" — kamu mendeklarasikan "komponen ini butuh data ini", dan library yang mengurus kapan mengambilnya.',
        },
        {
          term: 'queryKey',
          meaning:
            'Array yang menjadi **identitas** sebuah entri cache. Aturan tunggal yang mencegah hampir semua bug cache: **kalau sebuah nilai dipakai di `queryFn`, ia harus ada di `queryKey`.** Kalau tidak, kamu akan menampilkan data milik parameter lain.',
        },
        {
          term: 'queryFn',
          meaning:
            'Singkatan *query function*. Fungsi yang benar-benar mengambil datanya, biasanya memanggil `fetch`. Ia harus **melempar error** saat gagal — dan itu tidak otomatis, karena `fetch` tidak melempar apa pun untuk status 4xx/5xx.',
        },
        {
          term: 'isPending',
          meaning:
            'Bernilai `true` selama belum ada data sama sekali di cache untuk key ini. Memeriksanya lebih dulu bukan cuma soal tampilan: setelah `isPending` dan `isError` ditangani, TypeScript tahu `data` pasti ada — tanpa `!` dan tanpa optional chaining.',
        },
        {
          term: 'staleTime',
          meaning:
            'Berapa lama data dianggap **masih segar**. Selama itu tidak ada pengambilan ulang otomatis. Defaultnya `0` — langsung basi — dan itu agresif serta sering mengagetkan. Untuk data yang jarang berubah, naikkan ke beberapa menit.',
        },
        {
          term: 'gcTime',
          meaning:
            'Singkatan *garbage collection time*. Berapa lama entri cache disimpan **setelah tidak ada komponen yang memakainya**, sebelum dibuang dari memori. Sering tertukar dengan `staleTime`: `staleTime` soal kapan **diambil ulang**, `gcTime` soal kapan **dihapus**.',
        },
        {
          term: 'refetch',
          meaning:
            'Mengambil ulang data yang sudah pernah diambil. TanStack Query memicunya sendiri pada beberapa peristiwa: window kembali difokuskan, koneksi pulih, komponen dipasang ulang, atau `queryKey` berubah.',
        },
        {
          term: 'mutasi (mutation)',
          meaning:
            'Operasi yang **mengubah** data di server — tambah, ubah, hapus. Ditangani `useMutation`, bukan `useQuery`. Setelah mutasi berhasil, data terkait harus diinvalidasi supaya daftar yang tampil ikut segar.',
        },
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
      p(
        "Ketiga contoh menunjukkan satu pola yang meningkat kerumitannya: key adalah **array**, dan tiap elemen menyempitkan cakupan cache-nya. `['produk']` untuk daftar penuh, `['produk', id]` untuk satu produk, dan bentuk ketiga menaruh seluruh parameter dalam objek. Perhatikan kesesuaian antara `queryKey` dan `queryFn` di tiap contoh — apa yang muncul di key adalah persis apa yang dipakai fungsinya. Melanggar itu menghasilkan bug yang khas: kalau `halaman` dipakai di `queryFn` tapi lupa dimasukkan ke key, semua halaman berbagi satu entri cache, sehingga berpindah ke halaman 2 menampilkan data halaman 1. Sisi baiknya disebut di kotak berikut — karena key yang berubah otomatis memicu pengambilan baru, kamu tidak perlu menulis `useEffect` untuk memuat ulang saat filter berganti.",
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
      references(
        {
          label: 'TanStack Query — Overview',
          href: 'https://tanstack.com/query/latest/docs/framework/react/overview',
          source: 'TanStack Query',
          note: 'Daftar resmi hal yang harus kamu tulis sendiri kalau tidak memakai alat server state.',
        },
        {
          label: 'Query Keys',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-keys',
          source: 'TanStack Query',
          note: 'Aturan "kalau dipakai di queryFn, ia harus ada di queryKey", beserta pencocokan awalan.',
        },
        {
          label: 'Caching — staleTime vs gcTime',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/caching',
          source: 'TanStack Query',
          note: 'Dua opsi yang paling sering tertukar, dijelaskan dengan garis waktunya.',
        },
        {
          label: 'Query Invalidation',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation',
          source: 'TanStack Query',
          note: 'Menyegarkan daftar setelah mutasi berhasil, tanpa menulis refetch manual.',
        },
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

      terms(
        {
          term: 'optimistic update',
          meaning:
            'Mengubah tampilan **seolah** operasinya sudah berhasil, sebelum server menjawab. "Optimis" karena kamu bertaruh permintaannya akan sukses. Ini yang membuat tombol suka, centang todo, dan tombol simpan terasa seketika padahal jaringannya tidak.',
        },
        {
          term: 'rollback',
          meaning:
            'Mengembalikan tampilan ke keadaan sebelum perubahan optimistik, ketika ternyata gagal. Tanpa rollback yang benar, kegagalan meninggalkan layar yang berbohong — pengguna yakin datanya tersimpan padahal tidak.',
        },
        {
          term: 'queryClient',
          meaning:
            'Objek pusat TanStack Query yang memegang seluruh cache. Ia yang dipakai untuk membaca (`getQueryData`), menulis (`setQueryData`), membatalkan (`cancelQueries`), dan menandai basi (`invalidateQueries`) dari luar sebuah `useQuery`.',
        },
        {
          term: 'onMutate',
          meaning:
            'Callback yang berjalan **sebelum** mutasinya dikirim. Di sinilah perubahan optimistik dilakukan. Nilai yang ia kembalikan menjadi `context` yang diterima `onError` — itulah cara snapshot lama sampai ke tempat pembatalan.',
        },
        {
          term: 'cancelQueries',
          meaning:
            'Menghentikan pengambilan data yang sedang berjalan untuk key tertentu. Sering dilewati, dan akibatnya halus: refetch yang berangkat sebelum mutasi bisa tiba **setelah** kamu mengubah cache lalu menimpanya dengan data lama — tampilan berkedip ke keadaan sebelumnya lalu benar lagi.',
        },
        {
          term: 'snapshot',
          meaning:
            'Salinan isi cache **pada saat sebelum** diubah, diambil dengan `getQueryData`. Ia disimpan hanya untuk satu keperluan: dikembalikan persis seperti semula kalau mutasinya gagal.',
        },
        {
          term: 'setQueryData',
          meaning:
            'Menulis langsung ke cache tanpa memanggil server. Inilah mekanisme yang membuat perubahan optimistik langsung terlihat. Bentuk fungsinya — `(lama) => baru` — memastikan kamu bekerja dari isi cache terkini.',
        },
        {
          term: 'onSettled',
          meaning:
            'Callback yang berjalan **apa pun hasilnya** — berhasil maupun gagal. Di sini cache diinvalidasi agar tampilan akhirnya selaras dengan kebenaran server. Perlu karena tebakan optimistikmu hampir selalu tidak lengkap: server mungkin mengisi `updatedAt` atau menghitung ulang total.',
        },
        {
          term: 'context',
          meaning:
            'Bukan React Context. Di TanStack Query, ini sekadar nilai yang dikembalikan `onMutate` dan diteruskan ke `onError`/`onSettled` — jalur pribadi untuk menitipkan snapshot antar-callback dalam satu mutasi.',
        },
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
      p(
        'Enam langkah bernomor itu sebenarnya tiga pasang tanggung jawab. Langkah 1–3 di `onMutate` menyiapkan perubahan optimistik: menghentikan refetch yang sedang jalan, **menyimpan salinan keadaan sekarang**, lalu mengubah cache seolah servernya sudah setuju. Langkah 4–5 adalah jalur pembatalannya — nilai yang di-`return` dari `onMutate` diteruskan ke `onError` sebagai `context`, dan di situlah snapshot tadi dipakai untuk memulihkan keadaan persis seperti semula. Langkah 6 di `onSettled` menutupnya untuk kedua hasil. Perhatikan `setQueryData` dipanggil dengan **bentuk fungsi** `(lama) => ...`, bukan nilai langsung: itu memastikan perubahannya dihitung dari isi cache terkini, aturan yang sama dengan `setState` bentuk fungsi. Dan `?.` pada `lama?.map` diperlukan karena cache bisa saja masih kosong saat mutasi dipicu.',
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
      references(
        {
          label: 'Optimistic Updates',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates',
          source: 'TanStack Query',
          note: 'Pola resmi `onMutate` → `onError` → `onSettled`, persis urutan yang dipakai di atas.',
        },
        {
          label: 'useMutation',
          href: 'https://tanstack.com/query/latest/docs/framework/react/reference/useMutation',
          source: 'TanStack Query',
          note: 'Seluruh callback mutasi beserta nilai `context` yang mengalir di antaranya.',
        },
        {
          label: 'QueryClient — cancelQueries & setQueryData',
          href: 'https://tanstack.com/query/latest/docs/reference/QueryClient',
          source: 'TanStack Query',
          note: 'Dua metode yang membuat perubahan optimistik tidak tertimpa refetch yang sedang jalan.',
        },
        {
          label: 'useOptimistic',
          href: 'https://react.dev/reference/react/useOptimistic',
          source: 'React',
          note: 'Alternatif bawaan React 19 untuk kasus yang lebih sederhana, tanpa cache.',
        },
      ),
    ],
  ),

  written('url-state', 'URL sebagai State', 11, 'State yang harus bisa dibagikan lewat tautan.', [
    p(
      'Ada satu kategori state yang hampir selalu ditaruh di tempat yang salah: **apa yang sedang dilihat pengguna**. Filter, urutan, kata kunci, halaman ke berapa, tab yang aktif. Semua itu disimpan di `useState`, dan akibatnya baru terasa saat pengguna menekan refresh — semuanya kembali ke awal.',
    ),

    terms(
      {
        term: 'query string',
        meaning:
          'Bagian URL setelah tanda `?`, berisi pasangan `nama=nilai` dipisah `&` — misalnya `?kategori=buku&halaman=2`. Inilah tempat state yang harus bisa dibagikan lewat tautan disimpan.',
      },
      {
        term: 'searchParams',
        meaning:
          'Nama Next.js untuk isi query string yang sudah diurai. Di Client Component ia dibaca dengan hook `useSearchParams`; di Server Component ia datang sebagai prop halaman. Sifat penting: **read-only** — untuk mengubahnya kamu menyalinnya dulu.',
      },
      {
        term: 'URLSearchParams',
        meaning:
          'Kelas bawaan browser untuk membaca dan menyusun query string, dengan metode `get`, `set`, `delete`, dan `toString`. Ia bukan milik Next.js — ini API web standar, jadi pengetahuannya terpakai di mana pun.',
      },
      {
        term: 'useRouter',
        meaning:
          'Hook Next.js yang memberi kamu `push` dan `replace` untuk berpindah alamat dari kode. Di App Router ia diimpor dari `next/navigation`, **bukan** `next/router` — yang terakhir milik Pages Router yang lama.',
      },
      {
        term: 'push vs replace',
        meaning:
          '`push` **menambah** entri riwayat, sehingga tombol kembali mengembalikan keadaan sebelumnya. `replace` **mengganti** entri sekarang. Aturannya: ganti filter → `push`; mengetik di kotak pencarian → `replace`, kalau tidak setiap huruf jadi satu entri riwayat.',
      },
      {
        term: 'usePathname',
        meaning:
          'Hook Next.js yang mengembalikan bagian alamat **tanpa** query string — misalnya `/produk`. Dipakai untuk menyusun ulang URL lengkap: `${pathname}?${params.toString()}`.',
      },
      {
        term: 'riwayat (history)',
        meaning:
          'Tumpukan alamat yang pernah dikunjungi, yang dijelajahi tombol maju/mundur browser. Menambahkan entri untuk hal yang tidak dilakukan pengguna secara sadar — misalnya penyesuaian URL saat muat awal — membuat tombol kembali terasa rusak.',
      },
      {
        term: 'debounce',
        meaning:
          'Menunggu jeda setelah ketikan terakhir sebelum bertindak. Di sini ia dipakai sebelum **menulis ke URL** — dan inilah satu-satunya kasus di bab ini di mana menyimpan salinan lokal itu benar: input harus responsif tiap ketikan, URL cukup menyusul.',
      },
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
    references(
      {
        label: 'useSearchParams',
        href: 'https://nextjs.org/docs/app/api-reference/functions/use-search-params',
        source: 'Next.js',
        note: 'Membaca query string di Client Component, beserta sifat read-only-nya.',
      },
      {
        label: 'searchParams pada page',
        href: 'https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional',
        source: 'Next.js',
        note: 'Bentuk Promise sejak Next.js 15 yang harus di-`await` di Server Component.',
      },
      {
        label: 'useRouter — push & replace',
        href: 'https://nextjs.org/docs/app/api-reference/functions/use-router',
        source: 'Next.js',
        note: 'Dua metode navigasi dan pengaruhnya terhadap riwayat browser.',
      },
      {
        label: 'URLSearchParams',
        href: 'https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams',
        source: 'MDN Web Docs',
        note: 'API web standar yang dipakai menyusun ulang query string — bukan milik Next.js.',
      },
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

      terms(
        {
          term: 'anti-pola (anti-pattern)',
          meaning:
            'Solusi yang **tampak** masuk akal dan sering dipakai, tapi konsisten menghasilkan masalah. Bedanya dengan sekadar "kode jelek": anti-pola punya daya tarik — ada alasan orang terus memilihnya, dan itulah kenapa ia perlu dinamai.',
        },
        {
          term: 'alur keputusan',
          meaning:
            'Urutan pertanyaan yang dijawab satu per satu sampai berhenti di satu jawaban. Nilainya: ia menggantikan "library mana yang terbaik" — pertanyaan tanpa jawaban — dengan rangkaian pertanyaan yang masing-masing punya jawaban pasti.',
        },
        {
          term: 'SWR',
          meaning:
            'Library server state buatan Vercel, alternatif TanStack Query. Namanya singkatan **stale-while-revalidate** — "tampilkan yang basi sambil memvalidasi ulang", strategi cache yang juga ada di standar HTTP.',
        },
        {
          term: 'RTK Query',
          meaning:
            'Bagian Redux Toolkit yang menangani server state. Dipakai kalau project-mu **sudah** memakai Redux — bukan alasan untuk mulai memakai Redux. Fungsinya sejajar dengan TanStack Query.',
        },
        {
          term: '`useEffect` penyalin',
          meaning:
            'Anti-pola paling halus di daftar ini: Effect yang tugasnya cuma menyalin props ke state. Akibatnya dua: **dua sumber kebenaran** untuk satu nilai, dan satu render terbuang dengan nilai lama setiap kali props berubah — yang terlihat sebagai kedipan.',
        },
        {
          term: 'state global',
          meaning:
            'State yang bisa dibaca komponen mana pun. Godaannya besar ("biar gampang"), biayanya tidak kelihatan di awal: semua render ulang jadi saling terkait, dan menjawab "kenapa komponen ini render" berubah dari mudah jadi penyelidikan.',
        },
        {
          term: 'jejak aksi (action trail)',
          meaning:
            'Catatan berurutan setiap perubahan state beserta pemicunya. Ini keunggulan Redux yang paling nyata dan paling sering diabaikan — ia berharga di aplikasi finansial, dasbor operasional, atau tim besar yang perlu menelusuri "kenapa nilainya jadi begini".',
        },
        {
          term: 'turunkan sedekat mungkin',
          meaning:
            'Kebalikan dari mengangkat state. Aturan penutup bab ini: simpan state **serendah mungkin** di pohon, sedekat mungkin dengan yang membacanya. Global adalah pilihan terakhir, bukan titik awal.',
        },
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
      p(
        'Pola ini disebut "paling halus" karena ia **terlihat bertanggung jawab** — ada state, ada Effect yang menjaganya tetap sinkron, semuanya tampak rapi. Yang tersembunyi adalah dua biayanya. Pertama, ada dua sumber kebenaran untuk satu nilai: `user.nama` dari props dan `nama` di state, dan keduanya hanya cocok karena ada Effect yang merawatnya. Kedua, karena Effect berjalan **setelah** render, selalu ada satu render yang menampilkan nama lama bersama `user` yang baru — kedipan yang singkat tapi nyata. Kolom kanan menawarkan dua koreksi bergantung kebutuhan, sama seperti di Bab 3: kalau nilainya cuma ditampilkan, tidak butuh state sama sekali; kalau perlu diedit, `key` yang mereset seluruh komponen jauh lebih aman daripada Effect yang mereset field satu per satu.',
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
      references(
        {
          label: 'Managing State',
          href: 'https://react.dev/learn/managing-state',
          source: 'React',
          note: 'Urutan pertanyaan resmi React yang menjadi kerangka alur keputusan di atas.',
        },
        {
          label: 'You Might Not Need an Effect',
          href: 'https://react.dev/learn/you-might-not-need-an-effect',
          source: 'React',
          note: 'Sumber untuk dua anti-pola terhalus: nilai turunan disimpan, dan Effect penyalin props.',
        },
        {
          label: 'React Compiler',
          href: 'https://react.dev/learn/react-compiler',
          source: 'React',
          note: 'Alasan `setState` di dalam Effect menjadi error lint, bukan sekadar peringatan.',
        },
        {
          label: 'RTK Query — Comparison',
          href: 'https://redux-toolkit.js.org/rtk-query/comparison',
          source: 'Redux Toolkit',
          note: 'Perbandingan resmi RTK Query dengan TanStack Query dan SWR.',
        },
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

      terms(
        {
          term: 'migrasi state',
          meaning:
            'Memindahkan data yang sudah ada ke tempat yang lebih tepat, tanpa mengubah apa yang dilihat pengguna. Sifat penting latihan ini: kode awalnya **bekerja** dan tidak ada error — dan justru itu yang membuatnya bertahan lama tanpa ada yang membenahi.',
        },
        {
          term: 'race condition',
          meaning:
            'Dua permintaan berangkat, dan yang berangkat duluan bisa tiba belakangan lalu menimpa hasil yang lebih baru. Di kode awal, mengganti kategori dua kali dengan cepat cukup untuk memicunya. Ia nyaris tidak pernah muncul di localhost — dan muncul terus di jaringan pengguna sungguhan.',
        },
        {
          term: 'nilai turunan yang disimpan',
          meaning:
            'Cacat paling halus di kode awal: `totalHarga` disimpan sebagai state kedua padahal bisa dihitung dari `keranjang`. Dua sumber kebenaran seperti ini **pasti** akan tidak sinkron suatu saat — pertanyaannya kapan, bukan apakah.',
        },
        {
          term: 'persist',
          meaning:
            'Middleware Zustand yang menyimpan isi store ke `localStorage` secara otomatis, sehingga isinya bertahan antar halaman **dan** antar sesi. Ia yang menyelesaikan cacat "keranjang hilang saat pindah halaman".',
        },
        {
          term: 'skeleton',
          meaning:
            'Kerangka abu-abu berbentuk konten yang akan muncul, ditampilkan selama data belum siap. Fungsinya bukan hiasan: ia **memesan ruang** sehingga tata letak tidak melompat saat isinya tiba.',
        },
        {
          term: 'hidrasi (hydration)',
          meaning:
            'Proses React "menghidupkan" HTML yang sudah dikirim server dengan menyambungkannya ke kode di browser. Selama data dari `localStorage` belum ikut terpasang, tampilkan skeleton — kalau langsung menampilkan datanya, server dan browser berbeda dan hidrasinya gagal.',
        },
        {
          term: 'staleTime: 60_000',
          meaning:
            'Enam puluh ribu milidetik = satu menit. Garis bawah di angka (`60_000`) adalah pemisah ribuan JavaScript — murni untuk keterbacaan, tidak mengubah nilainya sedikit pun.',
        },
        {
          term: 'pembongkaran (refactor)',
          meaning:
            'Mengubah struktur kode tanpa mengubah perilakunya. Ukuran keberhasilan latihan ini bukan jumlah baris yang menyusut, melainkan bahwa **enam cacat hilang** — bukan karena ditambal, melainkan karena setiap data akhirnya berada di tempat yang memang dirancang untuknya.',
        },
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
      p(
        'Komponen ini **berfungsi** — dan itu penting disadari sebelum membongkarnya. Tidak ada error, tidak ada yang jelas-jelas salah tulis; ia jenis kode yang lolos review dan berjalan bertahun-tahun. Yang keliru bukan barisnya melainkan **penempatannya**: tujuh `useState` di sana menampung empat kategori data yang sifatnya sangat berbeda, dan semuanya diperlakukan sama. Komentar yang sudah dituliskan di kode menandai pembagiannya — `produk`/`memuat`/`gagal` adalah data server yang butuh cache dan pembatalan; `kategori`/`urutan`/`halaman` adalah keadaan yang seharusnya bisa dibagikan lewat tautan; `keranjang` perlu bertahan melewati perpindahan halaman; dan `totalHarga` sebenarnya bukan state sama sekali. Hanya `filterTerbuka` yang memang milik komponen ini. Enam cacat di bawah semuanya lahir dari satu kesalahan itu.',
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

      references(
        {
          label: 'Managing State',
          href: 'https://react.dev/learn/managing-state',
          source: 'React',
          note: 'Kerangka pengkategorian yang dipakai membongkar komponen di latihan ini.',
        },
        {
          label: 'Query Keys',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-keys',
          source: 'TanStack Query',
          note: 'Langkah 1 — memasukkan kategori, urutan, dan halaman ke query key sekaligus menyelesaikan race condition.',
        },
        {
          label: 'useSearchParams',
          href: 'https://nextjs.org/docs/app/api-reference/functions/use-search-params',
          source: 'Next.js',
          note: 'Langkah 2 — memindahkan filter dan paginasi dari `useState` ke URL.',
        },
        {
          label: 'persist middleware',
          href: 'https://zustand.docs.pmnd.rs/integrations/persisting-store-data',
          source: 'Zustand',
          note: 'Langkah 4 — membuat isi keranjang bertahan antar halaman dan antar sesi.',
        },
      ),
    ],
  ),
];
