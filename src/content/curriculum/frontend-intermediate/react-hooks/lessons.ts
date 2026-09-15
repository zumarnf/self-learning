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
 * Frontend Intermediate — Chapter 7, all fifteen lessons.
 *
 * `useEffect` gets four consecutive lessons (3–6) because it is the single hook that causes the
 * most damage when misunderstood, and because the fix is almost always "delete it", not "write it
 * better". The order is deliberate: correct mental model first, mechanics second, misuse third.
 */
export const lessons: LessonDraft[] = [
  written(
    'aturan-hooks',
    'Aturan Hooks & Alasan di Baliknya',
    19,
    'Dua aturan, dan kenapa keduanya bukan sekadar konvensi.',
    [
      p(
        'Hooks punya dua aturan yang terdengar sewenang-wenang sampai kamu tahu bagaimana React menyimpan state. Setelah itu, keduanya jadi konsekuensi yang tak terhindarkan.',
      ),

      terms(
        {
          term: 'hook',
          meaning:
            'Dibaca "huk", artinya **kait**. Fungsi khusus React yang namanya selalu diawali `use`. Ia "mengaitkan" komponenmu ke kemampuan React seperti ingatan, efek samping, dan konteks. Bukan fungsi biasa — ia punya dua aturan pemakaian yang **tidak bisa ditawar**, dan sub-bab ini menjelaskan kenapa keduanya bukan sekadar konvensi.',
        },
        {
          term: 'level teratas',
          meaning:
            'Terjemahan dari *top level*. Hook hanya boleh dipanggil **langsung di badan komponen** — bukan di dalam `if`, loop, `try`, atau fungsi bersarang. Alasannya ada di bawah, dan begitu kamu tahu cara React menyimpan state, aturan ini berubah dari sewenang-wenang menjadi konsekuensi yang tak terhindarkan.',
        },
        {
          term: 'urutan pemanggilan',
          meaning:
            'Kunci seluruh sub-bab ini. React **tidak menyimpan state berdasarkan nama variabel** — ia menyimpannya dalam daftar berurutan, dan mencocokkannya berdasarkan **urutan hook dipanggil** pada tiap render. Satu hook yang dilewati karena `if` menggeser seluruh sisanya, sehingga `useState` untuk nama tiba-tiba membaca nilai milik `useState` untuk umur.',
        },
        {
          term: 'daftar hook',
          meaning:
            'Struktur internal React tempat state tiap komponen disimpan, satu slot per hook, berurutan. Inilah yang membuat React bisa tahu `useState` mana yang mana tanpa kamu memberi nama apa pun — dan sekaligus alasan urutannya tidak boleh berubah antar-render.',
        },
        {
          term: 'aturan kedua',
          meaning:
            'Hook hanya boleh dipanggil dari **komponen React atau hook lain**. Memanggilnya dari fungsi biasa membuat React tidak punya komponen untuk menempelkan state-nya — dan itu memang melempar error, bukan gagal diam-diam.',
        },
        {
          term: 'eslint-plugin-react-hooks',
          meaning:
            'Plugin lint resmi yang menegakkan kedua aturan. Dua aturan utamanya: `rules-of-hooks` menangkap hook di tempat yang salah, dan `exhaustive-deps` menangkap nilai yang dipakai Effect tapi tidak didaftarkan.',
        },
        {
          term: 'exhaustive-deps',
          meaning:
            'Aturan lint yang memeriksa **kelengkapan dependency array**. Peringatannya hampir selalu benar. Menekannya dengan `// eslint-disable-next-line` mengubah bug yang bisa dideteksi mesin menjadi bug yang harus ditemukan pengguna — kalau kamu merasa harus mematikannya, itu tanda **struktur Effect-nya** yang perlu diubah.',
        },
        {
          term: 'React Compiler',
          meaning:
            'Di project yang mengaktifkannya, termasuk website ini, sebagian pelanggaran pola hooks menjadi **error** dan bukan peringatan. Alasannya teknis, sebab compiler perlu bisa memprediksi kapan sebuah nilai berubah, dan kode yang melanggar aturan membuat prediksi itu mustahil.',
        },
      ),

      h2('Aturan 1: hanya panggil di level teratas'),
      code(
        'tsx',
        `
        // SALAH: di dalam kondisi
        if (masuk) {
          const [nama, setNama] = useState('');
        }

        // SALAH: di dalam loop
        for (const item of items) {
          const [dipilih] = useState(false);
        }

        // SALAH: setelah return lebih awal
        if (!user) return null;
        const [data, setData] = useState(null);

        // BENAR: hook di atas, kondisi di dalam
        const [nama, setNama] = useState('');
        if (masuk) {
          // pakai nama di sini — nilainya tetap ada, hanya pemakaiannya yang bersyarat
        }
        `,
      ),
      p(
        'Ketiga bentuk SALAH punya satu kesamaan yang mungkin belum terlihat, yaitu semuanya membuat **jumlah hook yang dipanggil bisa berbeda antar-render**. Kondisi bisa berubah, jumlah item di loop bisa berubah, dan `return` lebih awal membuat hook di bawahnya tidak pernah tercapai. Bentuk BENAR di bawah menunjukkan koreksinya, dan perhatikan yang dipindah **bukan pemakaiannya melainkan pemanggilan hook-nya**, sebab `useState` naik ke atas tanpa syarat, sedangkan `if (masuk)` tetap ada untuk mengatur kapan nilainya dipakai. Itu pola umum yang berlaku untuk ketiga kasus, yaitu hook selalu dipanggil dan percabangan terjadi setelahnya. Diagram di bawah menjelaskan kenapa aturan ini tidak bisa ditawar.',
      ),

      h2('Kenapa: React menghitung urutan, bukan nama'),
      p(
        'React tidak menyimpan state berdasarkan nama variabelmu — ia tidak bisa melihatnya. Yang ia simpan adalah **daftar berurutan**, dan setiap pemanggilan hook mengambil slot berikutnya.',
      ),
      code(
        'text',
        `
        Render 1 (masuk = true)        Render 2 (masuk = false)
        ─────────────────────────      ─────────────────────────
        slot 0: useState('')  <- nama  slot 0: useState(0)  <- hitungan  ✗ SALAH
        slot 1: useState(0)   <- hitungan   (nama dilewati, semua bergeser)
        slot 2: useRef(null)  <- kotak slot 1: useRef(null) <- ???       ✗ SALAH
        `,
      ),
      p(
        'Yang membuatnya berbahaya: **tidak ada error**. `hitungan` diam-diam menerima nilai milik `nama`, dan `kotak` menerima nilai milik `hitungan`. Aplikasinya berperilaku aneh tanpa satu pun pesan yang menunjuk penyebabnya.',
      ),

      h2('Aturan 2: hanya panggil dari komponen React atau hook lain'),
      code(
        'ts',
        `
        // SALAH: fungsi biasa
        function hitungTotal(items) {
          const [diskon] = useState(0);   // tidak ada komponen yang memilikinya
          return items.length * diskon;
        }

        // BENAR: custom hook (namanya diawali 'use')
        function useTotal(items) {
          const [diskon] = useState(0);
          return items.length * diskon;
        }
        `,
      ),
      p(
        'Nama berawalan `use` bukan sekadar gaya penulisan — itulah yang dipakai linter untuk membedakan mana fungsi yang boleh memanggil hook. Tanpa awalan itu, aturan pertama tidak bisa ditegakkan secara otomatis.',
      ),

      h2('Apa yang dijaga linter'),
      table(
        ['Aturan', 'Yang dideteksi'],
        [
          ['`rules-of-hooks`', 'Hook di dalam kondisi, loop, atau fungsi biasa'],
          ['`exhaustive-deps`', 'Nilai yang dipakai Effect tapi tidak ada di dependency array'],
        ],
      ),
      callout(
        'danger',
        'Jangan pernah mematikan `exhaustive-deps` dengan komentar',
        'Peringatan itu hampir selalu benar. Menekannya dengan `// eslint-disable-next-line` mengubah bug yang bisa dideteksi menjadi bug yang harus ditemukan pengguna. Kalau kamu merasa harus mematikannya, itu tanda struktur Effect-nya yang perlu diubah — bukan aturannya.',
      ),
      callout(
        'info',
        'React Compiler menaikkan taruhannya',
        'Di project yang mengaktifkan React Compiler, termasuk website ini, beberapa pelanggaran pola hooks menjadi **error** dan bukan peringatan. Compiler perlu bisa memprediksi kapan sebuah nilai berubah, sedangkan kode yang melanggar aturan membuat prediksi itu mustahil, jadi ia menolak mengompilasinya.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen `PanelFilter` menampilkan pesan singkat saat tidak ada filter aktif, dan formulir lengkap saat ada. Seseorang menambahkan `return null` di awal untuk kasus tidak aktif, lalu menambahkan `useState` untuk mengingat filter yang terakhir dipakai. Setelah itu, mengaktifkan filter membuat nilai dari komponen lain muncul di kotak pencarian, dan nilai tanggal berpindah ke kolom kategori.',
      ),
      p(
        'Penyebabnya bukan kesalahan logika melainkan urutan pemanggilan hook yang berubah antar-render. React menyimpan state berdasarkan **urutan**, bukan nama.',
      ),
      code(
        'text',
        `
        Render 1 — filter tidak aktif, return null lebih awal:
          slot 0: useState('')        <- cari
          (berhenti di sini)

        Render 2 — filter aktif, seluruh hook dipanggil:
          slot 0: useState('')        <- cari
          slot 1: useState(null)      <- tanggal
          slot 2: useState('')        <- kategori

        React mencocokkan berdasarkan NOMOR SLOT.
        Kalau jumlah hook berubah, isi slot bergeser dan nilainya tertukar.
        `,
        { caption: 'Inilah alasan teknis di balik aturan hook, bukan sekadar konvensi.' },
      ),
      code(
        'tsx',
        `
        // SALAH: jumlah hook berbeda antar-render.
        function PanelFilter({ aktif }: { aktif: boolean }) {
          const [cari, setCari] = useState('');
          if (!aktif) return <p>Tidak ada filter aktif</p>;   // return LEBIH AWAL
          const [tanggal, setTanggal] = useState<string | null>(null);
          const [kategori, setKategori] = useState('');
          // ...
        }

        // BENAR: seluruh hook dipanggil lebih dulu, percabangan sesudahnya.
        function PanelFilter({ aktif }: { aktif: boolean }) {
          const [cari, setCari] = useState('');
          const [tanggal, setTanggal] = useState<string | null>(null);
          const [kategori, setKategori] = useState('');

          if (!aktif) return <p>Tidak ada filter aktif</p>;

          return <form>{/* ... */}</form>;
        }
        `,
        { caption: 'Percabangan boleh, asal setelah seluruh hook dipanggil.' },
      ),
      p(
        'Aturannya bisa dinyatakan satu kalimat, yaitu **panggil hook di level teratas komponen, dalam urutan yang sama setiap kali**. Yang dilarang bukan percabangan melainkan hook yang berada di dalam percabangan, di dalam loop, atau setelah `return`. Menaruh seluruh hook di atas lalu bercabang di bawahnya menyelesaikan seluruh masalah ini.',
      ),
      p(
        'Aturan kedua yang sering dilupakan, hook hanya boleh dipanggil dari komponen React atau dari custom hook lain. Fungsi bantu biasa yang memanggil `useState` di dalamnya melanggar itu, dan yang lebih merugikan, plugin lint tidak akan memeriksa aturan hook di dalamnya sebab ia mengenali custom hook dari awalan `use` pada namanya.',
      ),
      p(
        'Kalau kamu benar-benar tidak ingin memanggil hook untuk kasus tertentu, jalan keluarnya memisahkan komponennya. Buat `PanelFilterAktif` yang memuat seluruh hook, lalu komponen luar yang memutuskan merender atau tidak. Dengan begitu tidak ada satu komponen pun yang jumlah hooknya berubah.',
      ),
      callout(
        'tip',
        'Plugin lint menangkap hampir seluruh pelanggaran ini',
        'Aturan `react-hooks/rules-of-hooks` yang aktif di project ini menandai hook yang dipanggil bersyarat sebagai **error**, bukan peringatan. Kalau kamu pernah tergoda mematikannya untuk satu baris, jangan. Aturan ini punya nol positif palsu, sebab pelanggarannya memang selalu bug.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React 19 dan konfigurasi ESLint project ini sendiri.',
      ),
      code(
        'text',
        `
        if (a) return null;
        const [n, setN] = useState(0);

        error  React Hook "useState" is called conditionally. React Hooks must be
        called in the exact same order in every component render. Did you
        accidentally call a React Hook after an early return?
                                                    react-hooks/rules-of-hooks
        `,
        { caption: 'Diuji dengan ESLint project ini. Pesannya bahkan menebak penyebabnya.' },
      ),
      p(
        'Kalimat terakhir pesannya, yaitu apakah kamu tidak sengaja memanggil hook setelah `return` lebih awal, hampir selalu tepat. Ini salah satu pesan lint yang paling menolong sebab ia langsung menyebut pola yang menyebabkannya. Perbaikannya memindahkan seluruh hook ke atas `return` mana pun.',
      ),
      code(
        'text',
        `
        useState(0);   // dipanggil di luar komponen

        Warning: Invalid hook call. Hooks can only be called inside of the body
        of a function component. This could happen for one of the following
        reasons: 1. You might have mismatching versions of React and the renderer

        TypeError: Cannot read properties of null (reading 'useState')
        `,
        { caption: 'Diuji sungguhan. Dua pesan muncul bersamaan.' },
      ),
      p(
        'Pesan pertama yang menjelaskan, dan pesan kedua hanya akibatnya. React menyimpan penampung hook di variabel internal yang hanya terisi selama sebuah komponen sedang dirender, sehingga di luar itu nilainya `null`. Alasan nomor satu yang disebut pesannya, yaitu dua salinan React di `node_modules`, layak diperiksa dengan `npm ls react` kalau kamu yakin pemanggilannya sudah benar.',
      ),
      code(
        'text',
        `
        useEffect(() => { setN(n + 1); });

        warning  React Hook useEffect contains a call to 'setN'. Without a list
        of dependencies, this can lead to an infinite chain of updates. To fix
        this, pass [n] as a second argument to the useEffect Hook
                                                    react-hooks/exhaustive-deps
        `,
        { caption: 'Diuji dengan ESLint project ini. Peringatan, bukan error.' },
      ),
      p(
        'Efek tanpa daftar dependensi berjalan setelah **setiap** render, sehingga memanggil setter di dalamnya menghasilkan putaran tanpa henti. Peringatan ini bahkan menyebutkan daftar dependensi yang seharusnya dipakai. Yang perlu diperhatikan, menambahkan `[n]` hanya memindahkan masalahnya kalau efeknya memang mengubah `n`, dan itu dibahas di Sub-bab 7.5.',
      ),
      code(
        'text',
        `
        useEffect(() => { setN(n + 1); }, [n]);

        error  Calling setState synchronously within an effect can trigger
        cascading renders. Effects are intended to synchronize state between
        React and external systems such as manually updating the DOM, state
        management libraries, or other platform APIs.
        `,
        { caption: 'Diuji dengan ESLint project ini. Aturan dari React Compiler.' },
      ),
      p(
        'Pesan ini datang dari aturan lint React Compiler yang aktif di project ini, dan ia berstatus **error** bukan peringatan. Isinya menjelaskan maksud efek yang sebenarnya, yaitu menyinkronkan dengan sistem di luar React. Menyetel state React dari dalam efek hampir selalu berarti ada nilai yang seharusnya dihitung saat render, dan itu topik utama Sub-bab 7.5.',
      ),
      table(
        ['Pesan', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`React Hook is called conditionally`',
            'Hook dipanggil setelah `return` atau di dalam kondisi',
            'Pindahkan seluruh hook ke atas percabangan',
          ],
          [
            '`Invalid hook call`',
            'Hook dipanggil di luar komponen, atau ada dua salinan React',
            'Panggil dari komponen atau custom hook, dan periksa `npm ls react`',
          ],
          [
            '`Without a list of dependencies, this can lead to an infinite chain`',
            'Efek tanpa daftar dependensi memanggil setter',
            'Tambahkan daftar dependensi, atau hapus efeknya sama sekali',
          ],
          [
            '`Calling setState synchronously within an effect`',
            'State React disetel dari dalam efek',
            'Hitung nilainya saat render, bukan lewat efek',
          ],
          [
            'Nilai state tertukar antar-kolom',
            'Jumlah hook berbeda antar-render',
            'Pastikan seluruh hook selalu dipanggil dalam urutan yang sama',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Aturan hook terlihat sewenang-wenang sampai kamu tahu React mencocokkan berdasarkan urutan. Setelah itu, seluruh aturannya masuk akal sekaligus.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh `return` lebih awal sebelum sebagian hook',
            'Kasus itu memang tidak butuh hooknya',
            'Jumlah hook berbeda antar-render, sehingga nilai state bergeser slot dan tertukar',
          ],
          [
            'Memanggil hook di dalam `if` atau loop',
            'Hanya perlu pada kondisi tertentu',
            'Sama, urutannya berubah. Panggil selalu, lalu bercabang pada hasilnya',
          ],
          [
            'Mematikan aturan lint untuk satu baris',
            'Kasusnya khusus, dan kodenya jalan',
            'Aturan ini nyaris tanpa positif palsu. Kalau ia menyala, hampir pasti ada bug yang belum terlihat',
          ],
          [
            'Menamai custom hook tanpa awalan `use`',
            'Ia kan fungsi biasa',
            'Plugin lint tidak memeriksa aturan hook di dalamnya, sehingga pelanggaran lolos tanpa peringatan',
          ],
          [
            'Memanggil hook dari fungsi bantu di dalam komponen',
            'Ia dipanggil dari komponen juga',
            'Fungsi itu bisa dipanggil bersyarat, sehingga urutannya tidak terjamin. Angkat hooknya ke level teratas',
          ],
          [
            'Mengira aturan ini melarang percabangan',
            'Namanya aturan hook',
            'Percabangan sepenuhnya boleh. Yang dilarang hanya hook yang berada di dalamnya',
          ],
        ],
      ),
      p(
        'Baris kelima layak diperhatikan karena bentuknya sering terlihat rapi. Fungsi bantu bernama `siapkanFilter` yang memanggil `useState` di dalamnya akan bekerja selama ia selalu dipanggil, dan rusak begitu seseorang membungkus pemanggilannya dengan `if`. Karena namanya tidak berawalan `use`, plugin lint tidak memeriksanya dan tidak ada peringatan sama sekali.',
      ),
      callout(
        'info',
        'Kenapa React tidak memakai nama alih-alih urutan',
        "Memakai urutan membuat pemanggilan hook tidak perlu argumen tambahan, sehingga `useState(0)` cukup ditulis apa adanya. Alternatifnya menuntut kunci unik di tiap pemanggilan, misalnya `useState('cari', 0)`, dan itu jauh lebih berisik sekaligus membuka peluang kunci yang bentrok. Aturan urutan adalah harga yang dibayar untuk API yang sangat ringkas.",
      ),
      references(
        {
          label: 'Rules of Hooks',
          href: 'https://react.dev/reference/rules/rules-of-hooks',
          source: 'React',
          note: 'Kedua aturan beserta penjelasan resmi kenapa urutan pemanggilan menentukan segalanya.',
        },
        {
          label: 'Reusing Logic with Custom Hooks',
          href: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
          source: 'React',
          note: 'Aturan kedua: hook hanya boleh dipanggil dari komponen atau hook lain.',
        },
        {
          label: 'react-hooks/exhaustive-deps',
          href: 'https://react.dev/reference/rules/rules-of-hooks#only-call-hooks-at-the-top-level',
          source: 'React',
          note: 'Aturan lint yang menangkap pelanggaran sebelum kodenya sempat dijalankan.',
        },
        {
          label: 'React Compiler',
          href: 'https://react.dev/learn/react-compiler',
          source: 'React',
          note: 'Alasan pelanggaran aturan hooks menjadi error, bukan peringatan, saat compiler aktif.',
        },
      ),
    ],
  ),

  written(
    'usestate-mendalam',
    '`useState` — tinjauan mendalam',
    20,
    'Detail yang terlewat saat pertama kali belajar.',
    [
      p(
        'Kamu sudah memakai `useState` sejak Bab 4. Sub-bab ini mengumpulkan empat detail yang biasanya baru dipahami setelah tersandung olehnya.',
      ),

      terms(
        {
          term: 'lazy initializer',
          meaning:
            'Dibaca "leizi inisiailaizer", artinya **penyiap nilai awal yang malas**. Kalau kamu menulis `useState(hitungBerat())`, fungsi itu dipanggil di **setiap** render dan hasilnya dibuang kecuali render pertama. Kalau kamu menulis `useState(() => hitungBerat())`, React hanya memanggilnya saat inisialisasi. "Malas" di sini pujian: pekerjaannya ditunda sampai benar-benar dibutuhkan.',
        },
        {
          term: 'setter',
          meaning:
            'Fungsi kedua yang dikembalikan `useState` — `setJumlah` pada `const [jumlah, setJumlah] = useState(0)`. Namanya dari *to set* (menyetel). Ia tidak mengubah variabelnya di tempat; ia memberi tahu React "untuk render berikutnya, nilainya jadi ini".',
        },
        {
          term: 'updater function',
          meaning:
            'Memanggil setter dengan sebuah fungsi, bukan nilai: `setJumlah((n) => n + 1)`. React memanggil fungsi itu dengan nilai **terbaru** dalam antrean, bukan nilai yang tertangkap saat render. Aturan praktisnya: kalau nilai barumu dihitung dari nilai lama, pakai bentuk fungsi.',
        },
        {
          term: 'n',
          meaning:
            'Sekadar singkatan dari *number* pada contoh `(n) => n + 1`. Namanya bebas — `(sebelumnya) => sebelumnya + 1` sama benarnya. Nama pendek dipakai karena fungsinya cuma satu baris dan konteksnya sudah jelas dari nama setter-nya.',
        },
        {
          term: 'bailout',
          meaning:
            'Dibaca "beilaut", artinya **keluar lebih awal**. Kalau kamu menyetel nilai yang **sama persis** dengan nilai sekarang, React tidak melanjutkan render ke anak-anak komponen. Perbandingannya memakai `Object.is`.',
        },
        {
          term: 'Object.is',
          meaning:
            'Fungsi bawaan JavaScript untuk membandingkan dua nilai. Hampir sama dengan `===`, dengan dua beda: `Object.is(NaN, NaN)` bernilai `true`, dan `Object.is(0, -0)` bernilai `false`. React memakainya di mana-mana untuk memutuskan "apakah ini nilai baru?".',
        },
        {
          term: 'shallow comparison',
          meaning:
            'Membandingkan **referensi**, bukan isi. Dua objek dengan isi identik tapi dibuat terpisah tetap dianggap berbeda. Inilah alasan update immutable harus membuat objek baru — dan alasan `{...obj}` yang tidak mengubah apa pun **tetap** memicu render.',
        },
        {
          term: 'key',
          meaning:
            'Prop khusus React. Selain untuk daftar, ia juga menjadi **identitas** sebuah komponen. Saat `key` berubah, React membuang instance lamanya beserta seluruh state di dalamnya, lalu memasang yang baru dari nol — cara paling bersih untuk mereset form saat objek yang diedit berganti.',
        },
        {
          term: 'instance komponen',
          meaning:
            'Satu "salinan hidup" komponen di layar, lengkap dengan kotak-kotak state miliknya. Dua `<FormProfil />` di tempat berbeda adalah dua instance dengan state terpisah, meski kodenya satu.',
        },
      ),

      h2('1. Nilai awal yang mahal: pakai bentuk fungsi'),
      compare(
        {
          title: 'Dijalankan setiap render',
          lang: 'tsx',
          code: `
          const [data, setData] = useState(
            bacaDariLocalStorage()
          );

          // Fungsinya dipanggil di SETIAP render.
          // Hasilnya dibuang kecuali render pertama,
          // tapi biayanya tetap dibayar.
          `,
          notes: ['Boros untuk perhitungan berat'],
        },
        {
          title: 'Dijalankan sekali',
          lang: 'tsx',
          code: `
          const [data, setData] = useState(
            () => bacaDariLocalStorage()
          );

          // React hanya memanggilnya saat
          // inisialisasi.
          `,
          notes: ['Disebut lazy initializer'],
        },
      ),
      p(
        'Perbedaannya hanya terasa kalau perhitungannya mahal — membaca `localStorage`, mem-parse JSON besar, atau memfilter ribuan item. Untuk `useState(0)`, keduanya sama saja.',
      ),

      h2('2. Bentuk fungsi pada setter'),
      code(
        'tsx',
        `
        // Bermasalah: kedua panggilan membaca 'jumlah' yang sama
        setJumlah(jumlah + 1);
        setJumlah(jumlah + 1);   // hasilnya +1, bukan +2

        // Benar: setiap panggilan menerima nilai terbaru
        setJumlah((n) => n + 1);
        setJumlah((n) => n + 1); // hasilnya +2
        `,
      ),
      p(
        'Aturan praktisnya: kalau nilai barumu **dihitung dari nilai lama**, pakai bentuk fungsi. Ini juga yang membuat handler tidak perlu masuk ke dependency array Effect nanti.',
      ),

      h2('3. Bailout: menyetel nilai yang sama tidak memicu render'),
      code(
        'tsx',
        `
        const [nama, setNama] = useState('Ana');

        setNama('Ana');   // React membandingkan dengan Object.is -> tidak ada render
        `,
      ),
      p(
        'Perbandingannya dangkal. Objek baru dengan isi identik **tetap** dianggap berbeda, karena referensinya berbeda — itulah alasan update immutable harus membuat objek baru, dan alasan `{...obj}` yang tidak mengubah apa pun tetap memicu render.',
      ),
      callout(
        'info',
        'Kadang React tetap merender sekali lagi',
        'Setelah bailout, React kadang masih merender komponen itu satu kali sebelum berhenti. Ini perilaku internal yang tidak perlu kamu antisipasi — yang penting: ia tidak melanjutkan render ke anak-anaknya.',
      ),

      h2('4. Mereset state dengan `key`'),
      p(
        'Ini teknik yang menghilangkan seluruh kategori `useEffect` penyalin. Saat `key` berubah, React membuang instance komponennya dan memasang yang baru — seluruh state-nya kembali ke awal.',
      ),
      compare(
        {
          title: 'Reset dengan Effect',
          lang: 'tsx',
          code: `
          function FormProfil({ userId }) {
            const [nama, setNama] = useState('');

            useEffect(() => {
              setNama('');   // reset saat user ganti
            }, [userId]);

            // ...
          }
          `,
          notes: ['Satu render dengan nilai lama sempat terjadi', 'Ditolak React Compiler'],
        },
        {
          title: 'Reset dengan key',
          lang: 'tsx',
          code: `
          <FormProfil key={userId} userId={userId} />

          // Di dalam FormProfil tidak perlu
          // Effect sama sekali.
          `,
          notes: ['Tidak ada render dengan nilai lama', 'Bekerja untuk SEMUA state di dalamnya'],
        },
      ),
      p(
        'Catatan pada kolom kiri layak dibaca pelan, karena keduanya menjelaskan kenapa versi Effect bukan sekadar "lebih panjang" melainkan **salah**. Effect berjalan **setelah** render selesai, jadi ada satu render penuh di mana form sudah menampilkan `userId` yang baru tetapi isian namanya masih milik pengguna lama. Itu sekejap tetapi terlihat, dan pada koneksi lambat bisa lama. Kekurangan kedua lebih dalam, sebab `setNama(\'\')` hanya mereset satu state. Begitu form bertambah field, tiap field baru harus diingat untuk ditambahkan ke Effect itu, dan yang terlupa akan membawa nilai lama tanpa gejala. Versi `key` menghindari keduanya karena ia tidak mereset apa pun, melainkan **membuang seluruh komponen** lalu memasang yang baru, sehingga semua state di dalamnya otomatis kembali ke awal berapa pun jumlahnya.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Editor catatan menyimpan draf ke penyimpanan peramban. Nilai awalnya dibaca dengan `useState(bacaDraf())`, dan setelah dipakai beberapa minggu editor terasa tersendat saat mengetik cepat. Setelah diukur, ternyata `bacaDraf` yang mengurai JSON berukuran ratusan kilobyte dipanggil pada **setiap** ketikan, dan hasilnya dibuang kecuali pada render pertama.',
      ),
      p(
        'Argumen `useState` dievaluasi setiap render, dan hanya dipakai pada render pertama. Bentuk fungsi mengubah itu.',
      ),
      code(
        'tsx',
        `
        // SALAH: bacaDraf() dipanggil tiap render, hasilnya dibuang.
        const [draf, setDraf] = useState(bacaDraf());

        // BENAR: React hanya memanggilnya saat inisialisasi.
        const [draf, setDraf] = useState(() => bacaDraf());

        // Untuk nilai sederhana, bentuk biasa sudah tepat.
        const [n, setN] = useState(0);              // tidak perlu dibungkus
        const [nama, setNama] = useState('');       // tidak perlu dibungkus
        `,
        { caption: 'Bentuk fungsi hanya untuk nilai awal yang mahal dihitung.' },
      ),
      p(
        'Yang perlu dipahami, bentuk biasa **tidak salah** untuk nilai sederhana. Membungkus `useState(0)` menjadi `useState(() => 0)` hanya menambah kebisingan tanpa manfaat, sebab membuat angka nol tidak memakan biaya apa pun. Pakai bentuk fungsi saat penyiapannya benar-benar mahal, yaitu membaca penyimpanan, mengurai JSON besar, atau menghitung dari daftar panjang.',
      ),
      code(
        'tsx',
        `
        // Mereset state saat konteksnya berganti: pakai key, bukan efek.
        // SALAH: efek yang menyinkronkan props ke state.
        function FormSunting({ pesananId }: { pesananId: string }) {
          const [catatan, setCatatan] = useState('');
          useEffect(() => { setCatatan(''); }, [pesananId]);   // dua render, satu salah
          // ...
        }

        // BENAR: key memaksa React membuat instance baru.
        <FormSunting key={pesananId} pesananId={pesananId} />

        function FormSunting({ pesananId }: { pesananId: string }) {
          const [catatan, setCatatan] = useState('');   // otomatis kosong lagi
          // ...
        }
        `,
        { caption: 'Mengganti `key` membongkar komponennya dan membuat state baru.' },
      ),
      p(
        'Pola `key` untuk mereset state adalah yang paling sering dilewatkan padahal paling bersih. Versi efek menghasilkan dua render untuk satu perubahan, dan pada render pertama catatan lama masih tampil untuk pesanan yang baru. Versi `key` tidak punya masalah itu sebab React membongkar komponennya dan membangunnya dari nol dengan nilai awal.',
      ),
      p(
        'Yang perlu diperhatikan, `key` membongkar **seluruh** state di dalam komponen itu beserta keturunannya. Itu diinginkan saat berpindah ke pesanan yang berbeda, dan tidak diinginkan kalau kamu hanya ingin mereset satu kolom. Untuk reset sebagian, setel state itu secara eksplisit di dalam penangan peristiwa yang menyebabkannya.',
      ),
      code(
        'tsx',
        `
        // Menyetel nilai yang SAMA: React melewati penggambaran ulang.
        const [n, setN] = useState(5);
        setN(5);      // tidak ada render baru

        // Tapi perbandingannya memakai Object.is, sehingga ini TETAP merender:
        const [opsi, setOpsi] = useState({ batas: 10 });
        setOpsi({ batas: 10 });    // object BARU, rujukannya berbeda
        `,
        { caption: 'Perbandingannya pada rujukan, bukan pada isi.' },
      ),
      p(
        'Ini penyebab penggambaran ulang yang tidak perlu dan sulit dilihat. Menyetel state dengan object yang isinya sama persis tetap memicu render, sebab `Object.is` membandingkan rujukan. Kalau kamu menyetel state dari respons server yang isinya belum berubah, bandingkan lebih dulu atau simpan hanya bagian yang memang berubah.',
      ),
      callout(
        'warning',
        'Menyetel nilai yang sama tidak selalu berarti nol render',
        'React memang melewati penggambaran ulang saat nilainya identik, dan pada pengukuran ia bisa tetap menjalankan komponennya sekali sebelum menyimpulkan tidak ada yang berubah. Ini disebut bailout, dan yang dijamin adalah anak-anaknya tidak ikut digambar ulang. Jangan mengandalkan ini sebagai pengoptimalan, dan pakai sebagai jaring pengaman saja.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada `useState`, dan tiga di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        const [draf, setDraf] = useState(bacaDrafBesar());

        // Tidak ada error. bacaDrafBesar() dipanggil pada SETIAP render.
        // Pada editor yang mengetik cepat, ini puluhan kali per detik.
        `,
        { caption: 'Nilai awal yang mahal dievaluasi berulang.' },
      ),
      p(
        'Cara menemukannya adalah menaruh `console.log` di dalam fungsinya lalu mengetik beberapa huruf. Kalau tercetak berkali-kali, ia dipanggil tiap render. Perbaikannya membungkusnya dengan fungsi panah, dan itu satu pasang tanda kurung. Perhatikan ini berbeda dari `useMemo`, sebab `useState` hanya memanggilnya sekali seumur hidup komponen bukan sekali per perubahan dependensi.',
      ),
      code(
        'text',
        `
        function Kotak({ awal }: { awal: string }) {
          const [nilai, setNilai] = useState(awal);
          return <input value={nilai} onChange={...} />;
        }

        // Induk mengubah 'awal'. Kotak tetap menampilkan nilai lama.
        // Tidak ada error.
        `,
        { caption: 'Props disalin ke state, dan salinannya tidak pernah diperbarui.' },
      ),
      p(
        'Argumen `useState` hanya dibaca sekali seumur hidup komponen. Ada tiga jalan keluar tergantung maksudnya. Kalau nilainya memang harus selalu mengikuti props, jangan disimpan sebagai state sama sekali. Kalau ia harus direset saat konteksnya berganti, pakai `key`. Kalau induk perlu tahu perubahannya, angkat statenya ke induk.',
      ),
      code(
        'text',
        `
        const [daftar, setDaftar] = useState([]);
        daftar.push(baru);
        setDaftar(daftar);

        // Tidak ada error. Tampilan tidak berubah.
        `,
        { caption: 'Rujukan yang sama diserahkan kembali.' },
      ),
      p(
        'Sudah dibahas di bab tentang state dan muncul lagi di sini karena inilah kesalahan `useState` yang paling sering. React membandingkan dengan `Object.is`, dan `daftar` masih array yang sama persis. Gejalanya khas, yaitu data bertambah kalau dicetak ke console tapi layar diam. Buat nilai baru dengan spread.',
      ),
      code(
        'text',
        `
        const [n, setN] = useState(0);
        setN(n + 1);

        error  Calling setState synchronously within an effect can trigger
        cascading renders.
        `,
        { caption: 'Diuji dengan ESLint project ini, saat pemanggilan berada di dalam efek.' },
      ),
      p(
        'Aturan React Compiler yang aktif di project ini menandainya sebagai error. Menyetel state dari dalam efek hampir selalu berarti ada nilai yang seharusnya dihitung saat render. Kalau kamu memang perlu bereaksi terhadap perubahan dari luar React, itu memang tugas efek, dan pemanggilan setternya sebaiknya berada di dalam callback dari sistem luar itu bukan di badan efeknya.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Fungsi mahal dipanggil tiap ketikan',
            'Nilai awal ditulis sebagai pemanggilan langsung',
            'Bungkus dengan fungsi panah, yaitu `useState(() => f())`',
          ],
          [
            'State tidak mengikuti perubahan props',
            'Argumen `useState` hanya dibaca sekali',
            'Jangan salin props ke state, atau reset dengan `key`',
          ],
          [
            'Tampilan diam setelah setter dipanggil',
            'Rujukan yang sama diserahkan kembali',
            'Buat nilai baru dengan spread, `filter`, atau `map`',
          ],
          [
            '`Calling setState synchronously within an effect`',
            'State disetel dari dalam badan efek',
            'Hitung saat render, atau setel dari callback sistem luar',
          ],
          [
            'Render terjadi walaupun isinya sama',
            'Perbandingan pada rujukan, bukan isi',
            'Bandingkan lebih dulu, atau simpan hanya bagian yang berubah',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        '`useState` adalah hook pertama yang dipelajari, dan sebagian besar kesalahan di bawah muncul justru setelah aplikasinya mulai besar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memanggil fungsi mahal langsung sebagai nilai awal',
            'Ia kan hanya nilai awal',
            'Dipanggil tiap render dan hasilnya dibuang. Bungkus dengan fungsi panah',
          ],
          [
            'Membungkus semua nilai awal dengan fungsi',
            'Lebih aman',
            'Untuk angka dan teks, ia hanya menambah kebisingan. Pakai hanya kalau penyiapannya mahal',
          ],
          [
            'Mereset state dengan efek yang mengawasi props',
            'Efek memang untuk bereaksi',
            'Dua render untuk satu perubahan, dan satu di antaranya menampilkan nilai lama. Pakai `key`',
          ],
          [
            'Memakai `key` untuk mereset satu kolom saja',
            'Polanya kan sudah benar',
            '`key` membongkar seluruh state komponen beserta keturunannya. Untuk reset sebagian, setel eksplisit di penangan',
          ],
          [
            'Menyimpan nilai yang bisa dihitung dari state lain',
            'Supaya tidak dihitung ulang',
            'Dua sumber kebenaran yang harus dijaga sinkron. Hitung saat render',
          ],
          [
            'Membuat satu state untuk tiap field formulir',
            'Tiap field berbeda',
            'Sepuluh field berarti sepuluh state dan sepuluh setter. Kumpulkan menjadi satu object',
          ],
        ],
      ),
      p(
        'Baris keempat perlu diperhatikan supaya pola `key` tidak dipakai berlebihan. Mengganti `key` sama dengan membuang komponennya lalu membuat yang baru, sehingga seluruh state di dalamnya hilang termasuk state komponen anak, posisi gulir, dan fokus keyboard. Itu tepat saat berpindah ke entitas yang berbeda, dan berlebihan untuk mengosongkan satu kotak input.',
      ),
      callout(
        'tip',
        'Cara memastikan nilai awalmu tidak dipanggil berulang',
        'Taruh `console.log` di dalam fungsi penyiapnya, lalu ketik beberapa huruf di halaman itu. Kalau tercetak sekali, bentuknya sudah benar. Kalau tercetak tiap ketikan, ia dipanggil tiap render. Pemeriksaan sepuluh detik itu menemukan salah satu penyebab kelambatan yang paling sering dan paling tidak terlihat.',
      ),
      references(
        {
          label: 'useState',
          href: 'https://react.dev/reference/react/useState',
          source: 'React',
          note: 'Rujukan API lengkap: lazy initializer, bentuk fungsi pada setter, dan aturan bailout.',
        },
        {
          label: 'Preserving and Resetting State',
          href: 'https://react.dev/learn/preserving-and-resetting-state',
          source: 'React',
          note: 'Kenapa `key` mereset seluruh state sebuah subtree, dan kapan teknik itu tepat dipakai.',
        },
        {
          label: 'Queueing a Series of State Updates',
          href: 'https://react.dev/learn/queueing-a-series-of-state-updates',
          source: 'React',
          note: 'Alasan `setJumlah(jumlah + 1)` dua kali hanya menambah satu.',
        },
        {
          label: 'Object.is()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is',
          source: 'MDN Web Docs',
          note: 'Perbandingan yang dipakai React untuk memutuskan apakah state benar-benar berubah.',
        },
      ),
    ],
  ),

  written(
    'useeffect-sinkronisasi',
    '`useEffect`: sinkronisasi, bukan lifecycle',
    22,
    'Model mental yang benar sejak awal.',
    [
      p(
        'Kalau kamu datang dari class component, godaan terbesarnya adalah membaca `useEffect` sebagai `componentDidMount` + `componentDidUpdate` + `componentWillUnmount`. Model itu akan menyesatkanmu terus-menerus. Model yang benar: **Effect menyinkronkan komponenmu dengan sistem di luar React.**',
      ),

      terms(
        {
          term: 'Effect',
          meaning:
            'Ditulis dengan E besar dalam dokumentasi React untuk membedakannya dari "efek samping" secara umum. Effect adalah blok kode yang **menyinkronkan komponenmu dengan sistem di luar React** — koneksi jaringan, `localStorage`, langganan event browser, widget pihak ketiga. Kalau tidak ada "sistem di luar" yang terlibat, kemungkinan besar itu bukan pekerjaan Effect.',
        },
        {
          term: 'lifecycle',
          meaning:
            'Dibaca "laifsaikel", artinya **siklus hidup**. Istilah dari era class component: `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`. Membaca `useEffect` sebagai gabungan ketiganya adalah model mental yang akan menyesatkanmu terus-menerus — itulah inti sub-bab ini.',
        },
        {
          term: 'mount / unmount',
          meaning:
            '**Mount** = React memasang komponen ke layar untuk pertama kalinya. **Unmount** = React mencabutnya dari layar. Dua istilah ini tetap dipakai, tapi Effect tidak dirancang mengikuti keduanya — ia mengikuti **nilai yang disinkronkan**.',
        },
        {
          term: 'cleanup',
          meaning:
            'Dibaca "kliinap", artinya **pembersihan**. Fungsi yang kamu `return` dari dalam Effect. Tugasnya **membatalkan sinkronisasi sebelumnya** — memutus koneksi, melepas listener, membatalkan timer. Ia tidak hanya berjalan saat komponen hilang: ia berjalan **setiap kali** Effect akan dijalankan ulang.',
        },
        {
          term: 'dependency array',
          meaning:
            'Array kedua pada `useEffect(fn, [a, b])`. Isinya nilai-nilai yang Effect ini **selaraskan**. React membandingkannya dengan `Object.is` tiap render; kalau ada yang berbeda, cleanup lama dijalankan lalu Effect dijalankan ulang.',
        },
        {
          term: 'event handler',
          meaning:
            'Fungsi yang berjalan **karena pengguna melakukan sesuatu** — mengklik, mengetik, mengirim form. Bedanya dengan Effect tegas: handler menjawab "apa yang terjadi karena aksi ini?", Effect menjawab "apa yang harus tetap selaras selama komponen ini ada?".',
        },
        {
          term: 'Strict Mode',
          meaning:
            'Mode pengembangan React yang sengaja **memasang → melepas → memasang ulang** setiap komponen sekali, hanya di development. Efeknya, Effect yang cleanup-nya kurang akan langsung menampakkan gejala berupa dua koneksi terbuka, dua pemanggilan API, dan dua listener menumpuk. Kalau Effect-mu rusak karena Strict Mode, ia memang sudah rusak sebelumnya dan kamu hanya belum melihatnya.',
        },
        {
          term: 'subscription / langganan',
          meaning:
            'Pola "daftarkan diri untuk menerima kabar, lalu berhenti berlangganan saat selesai". Contohnya `addEventListener`, koneksi WebSocket, atau observer. Setiap langganan **wajib** punya pasangan pembatalannya di cleanup — kalau tidak, ia menumpuk diam-diam sampai jadi kebocoran memori.',
        },
      ),

      h2('Perbedaan dua model itu'),
      table(
        ['Model lifecycle (keliru)', 'Model sinkronisasi (benar)'],
        [
          ['"Jalankan ini saat komponen muncul"', '"Jaga agar X selaras dengan state ini"'],
          ['Dependency array = kapan dijalankan ulang', 'Dependency array = apa yang disinkronkan'],
          ['Cleanup = saat komponen hilang', 'Cleanup = batalkan sinkronisasi sebelumnya'],
          ['Effect kosong `[]` terasa spesial', '`[]` cuma berarti "tidak bergantung apa pun"'],
        ],
      ),
      p(
        'Kalimat ujinya: setiap Effect harus bisa dibaca sebagai *"selaraskan ___ dengan ___"*. Kalau kalimat itu tidak masuk akal, kemungkinan besar itu bukan pekerjaan Effect.',
      ),

      h2('Contoh sinkronisasi yang sah'),
      code(
        'tsx',
        `
        // "Selaraskan koneksi chat dengan roomId"
        useEffect(() => {
          const koneksi = buatKoneksi(serverUrl, roomId);
          koneksi.sambungkan();

          return () => koneksi.putuskan();
        }, [serverUrl, roomId]);
        `,
      ),
      p(
        'Perhatikan bahwa cleanup di sini **bukan** "saat komponen hilang". Saat `roomId` berubah dari `"umum"` ke `"acak"`, React menjalankan cleanup untuk koneksi lama lalu membuat yang baru. Itu terjadi berkali-kali selama komponennya hidup.',
      ),

      h2('Urutan yang sebenarnya terjadi'),
      code(
        'text',
        `
        roomId: "umum"   -> Effect jalan     -> sambung ke "umum"
        roomId: "acak"   -> cleanup lama     -> putus dari "umum"
                         -> Effect jalan     -> sambung ke "acak"
        komponen hilang  -> cleanup terakhir -> putus dari "acak"
        `,
      ),
      p(
        'Baca kolom kanan dari atas ke bawah dan perhatikan satu hal, yaitu **tidak pernah ada dua koneksi terbuka bersamaan.** Itu jaminan yang diberikan React dengan selalu menjalankan cleanup lama **sebelum** Effect baru. Baris kedua dan ketiga adalah inti sub-bab ini, sebab satu perubahan `roomId` memicu dua tindakan berpasangan, putus lalu sambung, dan keduanya terjadi selama komponen tetap hidup di layar. Karena itu menganggap cleanup sebagai "kode yang berjalan saat komponen dihapus" akan menyesatkan, sebab ia lebih tepat dibaca sebagai **kebalikan dari Effect-nya sendiri**. Aturan praktis yang lahir dari sini, untuk setiap hal yang kamu buka, pasang, atau daftarkan di dalam Effect, tuliskan pasangannya di cleanup, dan kalau kamu kesulitan menuliskannya, biasanya itu tanda pekerjaan tersebut bukan milik Effect.',
      ),

      h2('Yang BUKAN pekerjaan Effect'),
      ul(
        '**Menghitung derived value.** Hitung saat render.',
        '**Menangani event pengguna.** Taruh di event handler — di sanalah "karena pengguna mengklik" seharusnya hidup.',
        '**Mengatur state berdasarkan props.** Pakai props langsung, atau `key` untuk mereset.',
        '**Mengirim analitik untuk sebuah aksi.** Aksi terjadi di handler, bukan setelah render.',
      ),
      compare(
        {
          title: 'Effect untuk event',
          lang: 'tsx',
          code: `
          const [terkirim, setTerkirim] = useState(false);

          useEffect(() => {
            if (terkirim) {
              kirimAnalitik('form-selesai');
              tampilkanToast();
            }
          }, [terkirim]);

          function submit() {
            setTerkirim(true);
          }
          `,
          notes: ['Alurnya terpecah dua tempat', 'State hanya ada untuk memicu Effect'],
        },
        {
          title: 'Langsung di handler',
          lang: 'tsx',
          code: `
          function submit() {
            kirimAnalitik('form-selesai');
            tampilkanToast();
          }
          `,
          notes: ['Alurnya terbaca berurutan', 'Satu state lebih sedikit'],
        },
      ),
      p(
        'Perhatikan state `terkirim` di kolom kiri, sebab ia **tidak menyimpan apa pun yang ditampilkan** dan hanya ada sebagai pemicu Effect. Itu tanda paling jelas bahwa Effect-nya tidak diperlukan. Alurnya juga terpecah, sebab pembaca yang ingin tahu apa yang terjadi saat form dikirim harus menelusuri dari `submit` ke `setTerkirim`, lalu mencari Effect mana yang mengamati `terkirim`. Kolom kanan menyatukannya kembali menjadi tiga baris yang dibaca berurutan. Aturan yang bisa dibawa pulang, kalau sesuatu terjadi **karena pengguna melakukan sesuatu** maka tempatnya di event handler, sedangkan Effect adalah untuk sesuatu yang terjadi **karena komponen sedang tampil**. Perhatikan versi kanan juga menghilangkan satu jebakan yang tidak terlihat, sebab pada versi kiri `terkirim` yang tetap `true` membuat Effect berjalan lagi setiap kali komponen dipasang ulang.',
      ),

      h2('Effect berjalan dua kali di development'),
      callout(
        'tip',
        'Itu fitur, bukan bug',
        'Dengan Strict Mode aktif, React sengaja memasang → melepas → memasang ulang setiap komponen di development. Effect yang cleanup-nya benar akan tetap berperilaku normal. Effect yang cleanup-nya kurang akan langsung menampakkan gejalanya — dua koneksi terbuka, dua pemanggilan API, dua listener menumpuk. Kalau Effect-mu rusak karena ini, ia memang sudah rusak sebelumnya; kamu hanya belum melihatnya.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman peta memasang pustaka peta pihak ketiga yang menyentuh DOM langsung. Tim menaruh pemasangannya di badan komponen, dan hasilnya peta dibuat ulang pada tiap render sehingga posisi dan tingkat perbesaran yang diatur pengguna hilang setiap kali ada state lain berubah. Setelah dipindahkan ke efek, masalahnya berganti, yaitu peta lama tidak pernah dilepas sehingga sepuluh peta menumpuk di memori.',
      ),
      p(
        'Efek dirancang untuk satu hal, yaitu **menyinkronkan komponen dengan sistem di luar React**. Kedua masalah di atas adalah dua sisi dari pemakaian yang benar, yaitu memasang dan melepas.',
      ),
      code(
        'tsx',
        `
        function Peta({ pusat, zoom }: { pusat: Koordinat; zoom: number }) {
          const wadahRef = useRef<HTMLDivElement>(null);
          const petaRef = useRef<InstansiPeta | null>(null);

          // Pemasangan: sekali, saat komponen dipasang.
          useEffect(() => {
            if (!wadahRef.current) return;

            const peta = buatPeta(wadahRef.current, { pusat, zoom });
            petaRef.current = peta;

            // Pelepasan: WAJIB, kalau tidak peta menumpuk di memori.
            return () => {
              peta.hancurkan();
              petaRef.current = null;
            };
            // Sengaja kosong: peta dibuat SEKALI, perubahan diurus efek lain.
            // eslint-disable-next-line react-hooks/exhaustive-deps
          }, []);

          // Sinkronisasi: setiap kali props berubah, beri tahu petanya.
          useEffect(() => {
            petaRef.current?.pindahKe(pusat, zoom);
          }, [pusat, zoom]);

          return <div ref={wadahRef} className="peta" />;
        }
        `,
        { filename: 'src/peta/Peta.tsx' },
      ),
      p(
        'Pemisahan menjadi dua efek adalah keputusan yang menentukan. Efek pertama membuat dan menghancurkan peta, dan dependensinya sengaja kosong sebab peta hanya perlu dibuat sekali. Efek kedua menyinkronkan posisi, dan dependensinya berisi nilai yang memang harus diikuti. Menggabungkan keduanya berarti peta dihancurkan dan dibuat ulang setiap kali pengguna menggeser.',
      ),
      p(
        'Komentar yang menonaktifkan aturan lint di sana adalah salah satu dari sedikit tempat yang sah, dan ia **wajib disertai penjelasan**. Aturan `exhaustive-deps` benar bahwa `pusat` dan `zoom` dipakai di dalam efek, dan di sini keduanya sengaja hanya dipakai sebagai nilai awal. Menonaktifkan tanpa penjelasan membuat pembaca berikutnya tidak tahu apakah itu disengaja atau kelalaian.',
      ),
      code(
        'tsx',
        `
        // Bentuk lain yang sangat umum: berlangganan ke sistem luar.
        useEffect(() => {
          function tanganiOnline() { setTerhubung(navigator.onLine); }

          window.addEventListener('online', tanganiOnline);
          window.addEventListener('offline', tanganiOnline);

          // Bacaan awal, sebab peristiwa hanya dipicu saat BERUBAH.
          tanganiOnline();

          return () => {
            window.removeEventListener('online', tanganiOnline);
            window.removeEventListener('offline', tanganiOnline);
          };
        }, []);
        `,
        { caption: 'Pola berlangganan: pasang, baca sekali, lalu lepas.' },
      ),
      p(
        'Baris `tanganiOnline()` yang dipanggil langsung sering dilupakan, dan tanpa itu keadaan awalnya salah. Peristiwa `online` dan `offline` hanya dipicu saat keadaannya **berubah**, sehingga pengguna yang membuka halaman dalam keadaan luring tidak akan pernah mendapat pemberitahuan. Membaca sekali saat pemasangan menutup itu.',
      ),
      p(
        'Perlu ditegaskan bahwa efek **tidak berjalan di server**. Diuji dengan `renderToStaticMarkup`, komponen yang efeknya melempar tetap dirender tanpa masalah sebab efeknya tidak pernah dipanggil. Ini berarti apa pun yang kamu taruh di efek tidak akan pernah mempengaruhi HTML yang dikirim server, dan itu kadang diinginkan kadang menjadi sumber kebingungan.',
      ),
      callout(
        'danger',
        'Sebagian besar `useEffect` yang beredar di internet sebenarnya tidak diperlukan',
        'Efek untuk menghitung nilai turunan, untuk menyinkronkan dua state, untuk mengubah state saat props berubah, dan untuk bereaksi terhadap klik semuanya punya jalan yang lebih baik. Sub-bab 7.5 membahasnya satu per satu. Sebelum menulis efek, tanyakan apakah yang kamu sinkronkan benar-benar berada di luar React.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React 19, dan sebagian besarnya berupa kebocoran yang tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          const peta = buatPeta(wadah);
        }, []);
        // tanpa fungsi pembersih

        // Pengguna bolak-balik halaman sepuluh kali.
        // Sepuluh instansi peta hidup di memori, dan semuanya masih mendengarkan peristiwa.
        `,
        { caption: 'Tidak ada error, dan memori terus naik.' },
      ),
      p(
        'Ini kebocoran memori yang paling sering di aplikasi satu halaman, sebab tidak ada pemuatan ulang yang membersihkannya. Gejalanya berupa tab yang makin berat setelah beberapa menit dipakai. Tab Memory di DevTools bisa menghitung node yang terlepas, dan pencegahannya selalu sama, yaitu setiap efek yang memulai sesuatu wajib mengembalikan fungsi yang menghentikannya.',
      ),
      code(
        'text',
        `
        # Diukur dengan React 19:
        efek n=1
        cleanup n=1      <- pembersih lama berjalan DULU
        efek n=2
        cleanup n=2      <- saat komponen dilepas

        # Pembersih berjalan sebelum efek berikutnya, bukan hanya saat unmount.
        `,
        { caption: 'Diukur sungguhan. Urutannya sering disalahpahami.' },
      ),
      p(
        'Banyak orang mengira fungsi pembersih hanya berjalan saat komponen dilepas. Pengukuran di atas menunjukkan ia juga berjalan **sebelum setiap kali efeknya dijalankan ulang**. Ini justru yang membuat pola langganan bekerja benar, yaitu langganan lama dilepas sebelum yang baru dipasang. Kalau kamu mengira pembersih hanya untuk unmount, kamu akan menulis efek yang menumpuk langganan.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          ambilData().then(setData);
        }, [filter]);

        // Pengguna mengganti filter cepat. Permintaan lama selesai belakangan
        // dan menimpa hasil yang baru.
        `,
        { caption: 'Tidak ada pembatalan, sehingga respons basi menang.' },
      ),
      p(
        'Ini race condition dari Bab 3 Frontend Basic yang muncul dalam bentuk efek. Fungsi pembersih adalah tempat yang tepat untuk membatalkannya, baik dengan `AbortController` maupun dengan bendera `dibatalkan` yang diperiksa sebelum menyetel state. Tanpa itu, hasil pencarian bisa menampilkan kata yang sudah lama ditinggalkan pengguna.',
      ),
      code(
        'text',
        `
        # Di StrictMode, efek berjalan DUA KALI saat komponen dipasang:
        efek
        cleanup
        efek

        # Ini disengaja, bukan bug.
        `,
        { caption: 'React sengaja memasang, melepas, lalu memasang ulang.' },
      ),
      p(
        'Perilaku ini hanya terjadi di mode pengembangan, dan tujuannya menemukan efek yang tidak aman dijalankan ulang. Efek yang benar akan berperilaku sama dijalankan berapa kali pun, sebab pembersihnya mengembalikan keadaan seperti semula. Kalau ada yang rusak karenanya, yang rusak adalah efekmu, dan mematikan `StrictMode` hanya menunda masalahnya sampai produksi.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Memori naik terus setelah bolak-balik halaman',
            'Efek tidak mengembalikan fungsi pembersih',
            'Setiap efek yang memulai sesuatu wajib menghentikannya',
          ],
          [
            'Langganan menumpuk setiap kali dependensi berubah',
            'Mengira pembersih hanya berjalan saat unmount',
            'Ia berjalan sebelum tiap eksekusi ulang juga',
          ],
          [
            'Hasil lama menimpa hasil baru',
            'Permintaan tidak dibatalkan di pembersih',
            'Pakai `AbortController`, atau bendera yang diperiksa sebelum menyetel state',
          ],
          [
            'Efek berjalan dua kali di pengembangan',
            '`StrictMode` sengaja mengujinya',
            'Pastikan efeknya aman dijalankan ulang, jangan matikan `StrictMode`',
          ],
          [
            'Keadaan awal salah pada langganan',
            'Peristiwa hanya dipicu saat berubah',
            'Baca nilainya sekali saat pemasangan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        '`useEffect` adalah hook yang paling sering dipakai untuk hal yang bukan tugasnya, dan sebagian besar kesalahan di bawah berasal dari situ.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Melupakan fungsi pembersih',
            'Efeknya hanya memasang sekali',
            'Di aplikasi satu halaman, komponen dilepas tiap kali pengguna berpindah. Langganan dan timer menumpuk',
          ],
          [
            'Mengira pembersih hanya untuk unmount',
            'Namanya pembersihan',
            'Ia berjalan sebelum setiap eksekusi ulang efek. Ini yang membuat pola langganan bekerja benar',
          ],
          [
            'Menggabungkan pemasangan dan sinkronisasi dalam satu efek',
            'Keduanya soal peta yang sama',
            'Peta dihancurkan dan dibuat ulang tiap props berubah. Pisahkan menjadi dua efek dengan dependensi berbeda',
          ],
          [
            'Mematikan `StrictMode` karena efek berjalan dua kali',
            'Supaya seperti produksi',
            'Ia sengaja menemukan efek yang tidak aman dijalankan ulang. Yang rusak adalah efekmu',
          ],
          [
            'Menonaktifkan `exhaustive-deps` tanpa penjelasan',
            'Aturannya terlalu rewel',
            'Pembaca berikutnya tidak tahu itu disengaja atau kelalaian. Kalau memang perlu, tulis alasannya di komentar',
          ],
          [
            'Memakai efek untuk bereaksi terhadap klik pengguna',
            'Klik kan mengubah state',
            'Lakukan langsung di penangan klik. Efek untuk sinkronisasi dengan sistem luar, bukan untuk merespons interaksi',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah pembedaan yang paling menentukan. Kalau sesuatu terjadi **karena pengguna melakukan sesuatu**, tempatnya di penangan peristiwa. Kalau sesuatu terjadi **karena komponennya tampil di layar**, barulah efek. Mengirim analitik saat tombol diklik masuk kategori pertama, dan berlangganan peristiwa jaringan masuk kategori kedua.',
      ),
      callout(
        'info',
        'Efek tidak berjalan di server',
        'Diuji dengan `renderToStaticMarkup`, komponen yang efeknya melempar tetap dirender tanpa masalah. Ini berarti apa pun di dalam efek tidak mempengaruhi HTML yang dikirim server, dan pengambilan data lewat efek berarti pengguna melihat keadaan kosong lebih dulu. Di App Router, pengambilan data lebih tepat di Server Component.',
      ),
      references(
        {
          label: 'Synchronizing with Effects',
          href: 'https://react.dev/learn/synchronizing-with-effects',
          source: 'React',
          note: 'Sumber model mental "sinkronisasi, bukan lifecycle" yang dipakai sub-bab ini.',
        },
        {
          label: 'You Might Not Need an Effect',
          href: 'https://react.dev/learn/you-might-not-need-an-effect',
          source: 'React',
          note: 'Daftar resmi kasus yang sering keliru ditulis sebagai Effect beserta penggantinya.',
        },
        {
          label: 'Lifecycle of Reactive Effects',
          href: 'https://react.dev/learn/lifecycle-of-reactive-effects',
          source: 'React',
          note: 'Kenapa cleanup berjalan berkali-kali selama komponen hidup, bukan hanya saat unmount.',
        },
        {
          label: 'StrictMode',
          href: 'https://react.dev/reference/react/StrictMode',
          source: 'React',
          note: 'Alasan Effect sengaja dijalankan dua kali di development.',
        },
      ),
    ],
  ),

  written(
    'dependency-cleanup',
    'Dependency Array & Fungsi Cleanup',
    23,
    'Dua bagian yang paling sering ditulis asal.',
    [
      p(
        'Dependency array dan cleanup adalah dua bagian `useEffect` yang paling sering ditulis sekadar untuk mendiamkan linter. Padahal keduanya yang menentukan apakah Effect-mu benar.',
      ),

      terms(
        {
          term: 'linter',
          meaning:
            'Alat yang membaca kodemu tanpa menjalankannya, lalu menandai pola yang mencurigakan. Di project React, `eslint-plugin-react-hooks` adalah linter yang menjaga dependency array. Menulis dependency "sekadar untuk mendiamkan linter" membalik tujuannya — peringatannya ada untuk memberitahumu bahwa Effect-mu belum benar.',
        },
        {
          term: 'nilai primitif',
          meaning:
            'Nilai yang dibandingkan berdasarkan **isinya**, bukan referensinya: string, number, boolean, `null`, `undefined`, `symbol`, `bigint`. `"acak" === "acak"` bernilai `true`. Sebaliknya `{} === {}` bernilai `false` meski keduanya kosong — dan itulah sumber sebagian besar loop tak berujung pada Effect.',
        },
        {
          term: 'loop tak berujung',
          meaning:
            'Effect jalan → memicu render → objek dependency dibuat ulang → dianggap berubah → Effect jalan lagi. Gejalanya: tab browser panas, request menumpuk di Network tab. Penyebabnya hampir selalu objek, array, atau fungsi yang dibuat langsung di badan komponen lalu didaftarkan sebagai dependency.',
        },
        {
          term: 'AbortController',
          meaning:
            'API bawaan browser untuk **membatalkan** operasi yang sedang berjalan, terutama `fetch`. Kamu membuat satu controller, mengoper `controller.signal` ke `fetch`, lalu memanggil `controller.abort()` di cleanup. Namanya dari *abort* = membatalkan.',
        },
        {
          term: 'signal',
          meaning:
            'Properti `controller.signal` — sebuah objek `AbortSignal` yang kamu titipkan ke `fetch`. Anggap ia tali penarik: `fetch` memegang ujungnya, dan `abort()` menariknya. Saat ditarik, `fetch` menolak promise-nya dengan error bernama `AbortError`.',
        },
        {
          term: 'AbortError',
          meaning:
            "Nama error yang dilempar `fetch` saat dibatalkan. Pembatalan **bukan kegagalan** — inilah alasan contoh di bawah memeriksa `e.name === 'AbortError'` lalu `return` diam-diam alih-alih menampilkannya sebagai error ke pengguna.",
        },
        {
          term: 'race condition',
          meaning:
            'Dibaca "reis kondisyen", artinya **kondisi balapan**. Dua permintaan berangkat, dan yang berangkat duluan bisa tiba belakangan lalu menimpa hasil yang lebih baru. Ketik "a" lalu cepat "ab": layar bisa menampilkan hasil untuk "a". Bug ini nyaris tidak pernah muncul di localhost dan muncul terus di jaringan sungguhan.',
        },
        {
          term: 'unsubscribe',
          meaning:
            'Fungsi yang dikembalikan sebuah store/observer saat kamu berlangganan, dan yang harus kamu panggil untuk berhenti. Menyimpannya lalu memanggilnya di cleanup adalah satu-satunya cara menghindari langganan yang menumpuk tiap render.',
        },
        {
          term: 'IntersectionObserver / ResizeObserver',
          meaning:
            'Dua API browser yang mengabari kamu saat sebuah elemen masuk layar (*intersection* = perpotongan dengan viewport) atau berubah ukuran (*resize*). Keduanya wajib di-`.disconnect()` di cleanup.',
        },
      ),

      h2('Tiga bentuk dependency array'),
      code(
        'tsx',
        `
        // 1. Tanpa array: jalan setelah SETIAP render
        useEffect(() => { ... });

        // 2. Array kosong: jalan sekali setelah pasang
        useEffect(() => { ... }, []);

        // 3. Berisi nilai: jalan saat salah satunya berubah
        useEffect(() => { ... }, [roomId, serverUrl]);
        `,
      ),
      p(
        'Perbandingannya memakai `Object.is` — sama seperti `useState`. Artinya objek, array, dan fungsi yang dibuat ulang setiap render akan **selalu** dianggap berubah.',
      ),

      h2('Jebakan: dependency berupa objek atau fungsi'),
      compare(
        {
          title: 'Loop tak berujung',
          lang: 'tsx',
          code: `
          const opsi = { roomId, tema };   // objek BARU tiap render

          useEffect(() => {
            sambungkan(opsi);
          }, [opsi]);   // selalu berbeda -> jalan terus
          `,
          notes: ['Effect jalan -> render -> objek baru -> Effect jalan lagi'],
        },
        {
          title: 'Bergantung pada nilai primitif',
          lang: 'tsx',
          code: `
          useEffect(() => {
            sambungkan({ roomId, tema });
          }, [roomId, tema]);
          `,
          notes: [
            'String dan angka dibandingkan berdasarkan nilainya',
            'Objeknya dibuat di dalam Effect',
          ],
        },
      ),
      p(
        'Aturan praktis: **pindahkan objek/fungsi ke dalam Effect**, dan bergantunglah pada nilai primitif yang menyusunnya. Kalau fungsinya harus di luar karena dipakai bersama, bungkus dengan `useCallback`.',
      ),

      h2('Cleanup: apa yang harus dibatalkan'),
      table(
        ['Yang dibuat Effect', 'Yang wajib dibatalkan'],
        [
          ['`addEventListener`', '`removeEventListener` dengan referensi fungsi yang sama'],
          ['`setInterval` / `setTimeout`', '`clearInterval` / `clearTimeout`'],
          ['Koneksi WebSocket / EventSource', 'Tutup koneksinya'],
          ['`IntersectionObserver`, `ResizeObserver`', '`.disconnect()`'],
          ['Permintaan `fetch`', '`AbortController.abort()`'],
          ['Langganan ke store eksternal', 'Panggil fungsi unsubscribe'],
        ],
      ),

      h2('Pola pembatalan fetch'),
      code(
        'tsx',
        `
        useEffect(() => {
          const controller = new AbortController();

          async function ambil() {
            try {
              const res = await fetch(\`/api/cari?q=\${kueri}\`, { signal: controller.signal });
              setHasil(await res.json());
            } catch (e) {
              // Pembatalan bukan kegagalan — jangan tampilkan sebagai error.
              if (e instanceof Error && e.name === 'AbortError') return;
              setGagal(e);
            }
          }

          ambil();
          return () => controller.abort();
        }, [kueri]);
        `,
      ),
      p(
        'Perhatikan fungsi `async` dideklarasikan **di dalam** Effect lalu dipanggil, bukan dijadikan Effect-nya sendiri. Itu keharusan, sebab fungsi `async` selalu mengembalikan Promise sedangkan React mengharapkan Effect mengembalikan **fungsi cleanup**. Menulis `useEffect(async () => ...)` membuat React menerima Promise di tempat cleanup dan pembersihannya tidak pernah berjalan. Baris `return () => controller.abort()` adalah pasangan cleanup dari `new AbortController()` di baris pertama, dan karena `[kueri]` menjadi dependensi, ia berjalan **setiap kali kata kuncinya berubah** dan bukan hanya saat komponen hilang. Di situlah race condition dicegah, sebab permintaan untuk kata kunci lama dibatalkan sebelum yang baru berangkat. Pemeriksaan `AbortError` di dalam `catch` melengkapinya, karena pembatalan yang kita sengaja lakukan tidak boleh muncul sebagai pesan gagal.',
      ),
      callout(
        'danger',
        'Tanpa `abort`, kamu punya race condition',
        'Ketik "a" lalu cepat "ab". Permintaan "a" berangkat duluan tapi bisa tiba belakangan, lalu menimpa hasil "ab". Layar menampilkan hasil untuk kata kunci yang sudah tidak ada di kotak pencarian. Bug ini nyaris tidak pernah muncul di localhost dan muncul terus di jaringan sungguhan — dan inilah alasan utama data server sebaiknya diserahkan ke TanStack Query (Bab 5).',
      ),

      h2('Cleanup juga jalan saat dependency berubah'),
      p(
        'Bukan hanya saat unmount. Setiap kali Effect akan dijalankan ulang, cleanup yang lama dijalankan lebih dulu. Membaca cleanup sebagai "kode saat komponen hilang" adalah sumber kesalahan yang sama dengan model lifecycle di sub-bab sebelumnya.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen pencarian memanggil server setiap kali kata kuncinya berubah. Setelah dipasang, tab Network menunjukkan permintaan yang mengalir terus-menerus bahkan saat pengguna tidak menyentuh apa pun. Penyebabnya satu baris, yaitu daftar dependensi memuat object opsi yang dibuat baru di badan komponen.',
      ),
      p('Perilaku ini bisa diukur. Berikut hasil pengukuran dengan React 19 sungguhan.'),
      code(
        'tsx',
        `
        function MemoUji({ pemicu }: { pemicu: number }) {
          const opsi = { batas: 10 };            // objek BARU tiap render
          useMemo(() => hitung(), [opsi]);       // dependensinya selalu berubah
          return <div>{pemicu}</div>;
        }

        // Diukur: tiga render menghasilkan TIGA perhitungan.
        // MEMO dengan dependensi objek literal: dihitung 3x untuk 3 render
        `,
        { caption: 'Diukur sungguhan. Penyimpanan hasilnya tidak pernah terpakai.' },
      ),
      p(
        'React membandingkan dependensi dengan `Object.is`, yaitu perbandingan **rujukan** bukan isi. Object literal `{ batas: 10 }` menghasilkan object baru pada tiap render, sehingga perbandingannya selalu berbeda. Hal yang sama berlaku untuk array literal dan untuk fungsi panah yang ditulis langsung di badan komponen.',
      ),
      code(
        'tsx',
        `
        // Empat jalan keluar, urut dari yang paling sederhana.

        // 1. Pindahkan ke luar komponen. Kalau tidak bergantung pada apa pun.
        const OPSI = { batas: 10 };
        function Cari() {
          useEffect(() => { ambil(OPSI); }, []);   // OPSI stabil selamanya
        }

        // 2. Sebutkan nilai primitifnya, bukan objectnya.
        function Cari({ batas }: { batas: number }) {
          useEffect(() => { ambil({ batas }); }, [batas]);   // angka, bukan object
        }

        // 3. Bungkus dengan useMemo kalau memang harus berupa object.
        const opsi = useMemo(() => ({ batas, urut }), [batas, urut]);

        // 4. Pindahkan pembuatannya KE DALAM efek.
        useEffect(() => {
          const opsi = { batas, urut };
          ambil(opsi);
        }, [batas, urut]);
        `,
        { caption: 'Jalan keluar kedua dan keempat paling sering yang tepat.' },
      ),
      p(
        'Jalan keluar keempat sering dilewatkan padahal paling bersih. Kalau object itu hanya dipakai di dalam efek, tidak ada alasan membuatnya di badan komponen. Memindahkannya ke dalam efek menghapus seluruh masalah dependensi sekaligus, dan daftar dependensinya menjadi nilai primitif yang perbandingannya jelas.',
      ),
      code(
        'tsx',
        `
        // Fungsi pembersih: dua bentuk yang paling sering dibutuhkan.

        // Membatalkan permintaan.
        useEffect(() => {
          const kendali = new AbortController();

          ambilHasil(kata, { signal: kendali.signal })
            .then(setHasil)
            .catch((e) => { if (e.name !== 'AbortError') setGalat(e); });

          return () => kendali.abort();
        }, [kata]);

        // Bendera, untuk API yang tidak mendukung pembatalan.
        useEffect(() => {
          let dibatalkan = false;

          hitungBerat(data).then((hasil) => {
            if (!dibatalkan) setHasil(hasil);     // jangan setel kalau sudah usang
          });

          return () => { dibatalkan = true; };
        }, [data]);
        `,
        {
          caption: 'Yang pertama menghentikan pekerjaannya, yang kedua hanya mengabaikan hasilnya.',
        },
      ),
      p(
        'Perbedaan keduanya layak dipahami. `AbortController` benar-benar **menghentikan** permintaannya sehingga menghemat jaringan dan beban server. Bendera hanya mencegah hasilnya dipakai, dan pekerjaannya tetap berjalan sampai selesai. Pakai yang pertama kalau APInya mendukung, dan yang kedua sebagai jalan terakhir.',
      ),
      p(
        'Pengukuran urutan pembersih dari sub-bab sebelumnya berlaku di sini, yaitu pembersih lama berjalan **sebelum** efek berikutnya. Itu yang membuat pola pembatalan bekerja benar, sebab permintaan lama dibatalkan tepat sebelum yang baru dikirim. Kalau urutannya sebaliknya, akan ada sesaat di mana dua permintaan hidup bersamaan.',
      ),
      callout(
        'warning',
        'Jangan menghapus dependensi untuk menghentikan efek yang berjalan terus',
        'Menghapus item dari daftar dependensi menghilangkan gejalanya dan menciptakan bug baru, yaitu efeknya tidak lagi berjalan saat nilai itu berubah sehingga tampilannya memakai nilai basi. Perbaiki penyebabnya, yaitu buat nilainya stabil atau pindahkan ke dalam efek. Aturan `exhaustive-deps` menandai penghapusan seperti ini.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada dependensi dan pembersih, dan seluruhnya diuji sungguhan.',
      ),
      code(
        'text',
        `
        const opsi = { batas: 10 };
        useEffect(() => { ambil(opsi); }, [opsi]);

        // Diukur: efek berjalan pada SETIAP render.
        // Tab Network menunjukkan permintaan yang mengalir terus.
        `,
        { caption: 'Dependensi berupa object yang dibuat baru tiap render.' },
      ),
      p(
        'Tidak ada error, dan gejalanya berupa permintaan yang tidak pernah berhenti. Cara menemukannya adalah menaruh `console.log` di dalam efek lalu melihat berapa kali tercetak tanpa interaksi apa pun. Kalau ia tercetak terus, ada dependensi yang tidak stabil. Fungsi dan array literal punya masalah yang persis sama.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          const id = setInterval(perbarui, 1000);
        }, []);
        // tanpa clearInterval

        // Pengguna bolak-balik lima kali. Lima interval berjalan bersamaan.
        // Perbaruinya lima kali per detik.
        `,
        { caption: 'Timer tidak dihentikan saat komponen dilepas.' },
      ),
      p(
        'Gejalanya khas dan membingungkan, yaitu sesuatu berjalan makin cepat setelah pengguna bolak-balik. Setiap pemasangan menambah satu timer, dan tidak ada yang menghentikannya. Ini juga menahan komponennya di memori sebab timer memegang rujukan ke fungsinya. Kembalikan `() => clearInterval(id)`.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          ambil(kata).then(setHasil);
        }, [kata]);

        // Pengguna mengetik cepat. Permintaan untuk 'ka' selesai
        // setelah permintaan untuk 'kaos polos'.
        // Layar menampilkan hasil 'ka'.
        `,
        { caption: 'Tidak ada pembatalan, sehingga respons basi menang.' },
      ),
      p(
        'Tidak ada error, dan bugnya hanya muncul saat jaringan tidak seragam. Karena di komputer pengembangan jaringan biasanya cepat dan stabil, ia hampir tidak pernah tertangkap saat pengujian manual. Pakai pembatas jaringan di DevTools untuk membuatnya bisa direproduksi, lalu tambahkan pembatalan di fungsi pembersih.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          ambil(kata).then(setHasil);
        }, []);   // 'kata' dihapus supaya tidak berjalan terus

        warning  React Hook useEffect has a missing dependency: 'kata'.
        Either include it or remove the dependency array.
                                            react-hooks/exhaustive-deps
        `,
        { caption: 'Dependensi dihapus untuk menghentikan gejalanya.' },
      ),
      p(
        'Ini jalan keluar yang paling sering diambil dan paling merugikan. Gejalanya memang hilang, dan sekarang efeknya tidak pernah berjalan lagi saat `kata` berubah sehingga pencariannya tidak berfungsi sama sekali. Aturan lint menandainya, dan pesannya menawarkan dua pilihan yang benar, yaitu sertakan dependensinya atau hapus seluruh daftarnya.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Efek berjalan pada tiap render',
            'Dependensi berupa object, array, atau fungsi yang dibuat baru',
            'Pindahkan ke luar komponen, sebutkan primitifnya, atau pindahkan ke dalam efek',
          ],
          [
            'Sesuatu berjalan makin cepat setelah bolak-balik',
            'Timer tidak dihentikan di pembersih',
            'Kembalikan `clearInterval` atau `clearTimeout`',
          ],
          [
            'Hasil lama menimpa hasil baru',
            'Permintaan tidak dibatalkan',
            'Pakai `AbortController` di pembersih, atau bendera',
          ],
          [
            '`has a missing dependency`',
            'Dependensi dihapus untuk menghentikan gejala',
            'Perbaiki penyebabnya, jangan hapus dependensinya',
          ],
          [
            'Efek tidak berjalan saat nilai berubah',
            'Nilai itu tidak ada di daftar dependensi',
            'Sertakan, dan buat nilainya stabil kalau ia object',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Daftar dependensi adalah tempat sebagian besar bug efek berasal, dan hampir seluruhnya berakar pada perbandingan rujukan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh object atau array literal di dependensi',
            'Isinya kan sama',
            'Perbandingannya pada rujukan. Object baru tiap render berarti dependensinya selalu berubah',
          ],
          [
            'Menghapus dependensi untuk menghentikan efek yang berjalan terus',
            'Gejalanya hilang',
            'Efeknya tidak lagi berjalan saat nilai itu berubah, sehingga tampilannya memakai nilai basi',
          ],
          [
            'Menonaktifkan `exhaustive-deps` sebagai kebiasaan',
            'Aturannya terlalu rewel',
            'Aturan ini menangkap kelas bug nilai basi yang sangat sulit ditelusuri. Kalau memang perlu dimatikan, tulis alasannya',
          ],
          [
            'Melupakan pembersih pada langganan dan timer',
            'Komponennya jarang dilepas',
            'Di aplikasi satu halaman, ia dilepas tiap perpindahan. Langganan menumpuk dan memori naik',
          ],
          [
            'Memakai bendera padahal APInya mendukung pembatalan',
            'Keduanya sama-sama bekerja',
            'Bendera hanya mengabaikan hasilnya, dan pekerjaannya tetap berjalan. `AbortController` benar-benar menghentikannya',
          ],
          [
            'Menaruh fungsi dari props langsung di dependensi',
            'Ia memang dipakai di dalam efek',
            'Fungsi panah dari induk adalah rujukan baru tiap render. Minta induk menstabilkannya, atau pindahkan pemanggilannya',
          ],
        ],
      ),
      p(
        'Baris terakhir sering menjadi sumber efek yang berjalan terus dan penyebabnya berada di berkas lain. Komponen induk yang mengirim `onSelesai={() => segarkan()}` menghasilkan fungsi baru tiap render, dan anak yang menaruhnya di dependensi efek akan menjalankan efeknya terus. Pada project dengan React Compiler ini biasanya ditangani otomatis, dan tanpa compiler induknya perlu membungkus dengan `useCallback`.',
      ),
      callout(
        'tip',
        'Cara menemukan dependensi yang tidak stabil dalam satu menit',
        "Taruh `console.log('efek jalan')` sebagai baris pertama efeknya, lalu buka halamannya dan jangan sentuh apa pun. Kalau ia tercetak lebih dari sekali, ada dependensi yang berubah tanpa sebab. Cetak juga tiap dependensinya untuk melihat mana yang rujukannya berganti.",
      ),
      references(
        {
          label: 'useEffect — Parameters & Caveats',
          href: 'https://react.dev/reference/react/useEffect',
          source: 'React',
          note: 'Aturan resmi dependency array dan fungsi cleanup, termasuk kenapa isinya tidak boleh dinamis.',
        },
        {
          label: 'Removing Effect Dependencies',
          href: 'https://react.dev/learn/removing-effect-dependencies',
          source: 'React',
          note: 'Cara menghilangkan dependency berupa objek/fungsi tanpa mematikan lint.',
        },
        {
          label: 'AbortController',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController',
          source: 'MDN Web Docs',
          note: 'API pembatalan yang dipakai pola cleanup `fetch` di atas.',
        },
        {
          label: 'Fetch: aborting a request',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#aborting_a_fetch',
          source: 'MDN Web Docs',
          note: 'Perilaku `fetch` saat sinyal dibatalkan, termasuk error bernama `AbortError`.',
        },
      ),
    ],
  ),

  written(
    'kesalahan-useeffect',
    'Kesalahan Umum `useEffect`',
    22,
    'Kapan Effect justru bukan jawabannya.',
    [
      p(
        'Dokumentasi resmi React punya satu halaman berjudul *"You Might Not Need an Effect"*, dan itu bukan kebetulan. Sebagian besar `useEffect` di kode nyata seharusnya tidak ada. Sub-bab ini adalah katalog pola yang perlu kamu kenali dan hapus.',
      ),

      terms(
        {
          term: 'derived value',
          meaning:
            'Nilai yang bisa **dihitung ulang** dari state lain kapan saja — total dari daftar item, jumlah item terpilih, teks yang sudah difilter. Menyimpannya sebagai state kedua berarti kamu punya dua source of truth yang harus dijaga tetap sama. Hitung saat render, dan ketidaksinkronan itu menjadi mustahil.',
        },
        {
          term: 'source of truth',
          meaning:
            'Satu tempat yang menentukan nilai sebenarnya sebuah data. Kalau nilainya ada di dua tempat, salah satunya pasti akan basi cepat atau lambat — dan bug itu selalu kembali. Aturannya: satu data, satu tempat menyimpannya.',
        },
        {
          term: 'reduce',
          meaning:
            'Metode array JavaScript yang "meringkas" seluruh isi array jadi satu nilai. Pada `items.reduce((n, i) => n + i.harga, 0)`: `n` adalah hasil sementara (dimulai dari `0`), `i` adalah item yang sedang diproses. Nama pendek `n`/`i` di sini konvensi umum, bukan aturan.',
        },
        {
          term: 'Effect chain',
          meaning:
            'Effect A menyetel state yang memicu Effect B, yang menyetel state yang memicu Effect C. Untuk satu aksi pengguna, React harus merender tiga kali berturut-turut — dan alur logikanya jadi mustahil dibaca berurutan karena tersebar di tiga blok terpisah.',
        },
        {
          term: 'toast',
          meaning:
            'Notifikasi kecil yang muncul sebentar lalu hilang sendiri, biasanya di pojok layar. Namanya dari roti panggang yang "meloncat" keluar dari pemanggang. Menampilkannya adalah reaksi terhadap **aksi**, jadi tempatnya di event handler.',
        },
        {
          term: 'deduplikasi',
          meaning:
            'Menghindari permintaan ganda untuk data yang sama. Kalau tiga komponen membutuhkan `/api/produk` sekaligus, tanpa deduplikasi ada tiga request identik. Library server state melakukannya otomatis; `useEffect` + `fetch` tidak.',
        },
        {
          term: 'refetch',
          meaning:
            'Mengambil ulang data yang sudah pernah diambil — misalnya saat tab kembali difokuskan, atau setelah pengguna menyimpan perubahan. Menuliskannya sendiri di atas `useEffect` berarti kamu ikut menanggung kapan harus mengambil ulang dan bagaimana menghindari tumpang tindih.',
        },
        {
          term: 'server state',
          meaning:
            'Data yang **dimiliki server**, bukan komponenmu — daftar produk, profil pengguna, hasil pencarian. Ia punya sifat yang tidak dimiliki state biasa: bisa basi, bisa gagal diambil, dan bisa diminta beberapa komponen sekaligus. Karena itu ia ditangani library khusus (TanStack Query), bukan `useState` + `useEffect`.',
        },
      ),

      h2('1. Menghitung derived value'),
      compare(
        {
          title: 'Salah',
          lang: 'tsx',
          code: `
          const [items, setItems] = useState([]);
          const [total, setTotal] = useState(0);

          useEffect(() => {
            setTotal(items.reduce((n, i) => n + i.harga, 0));
          }, [items]);
          `,
          notes: ['Dua source of truth', 'Satu render ekstra dengan total lama'],
        },
        {
          title: 'Benar',
          lang: 'tsx',
          code: `
          const [items, setItems] = useState([]);

          // Dihitung saat render. Tidak mungkin tidak sinkron.
          const total = items.reduce((n, i) => n + i.harga, 0);
          `,
          notes: ['Satu source of truth', 'Satu state lebih sedikit'],
        },
      ),
      p(
        'Kesalahan ini paling sering muncul karena `total` **terasa** seperti sesuatu yang harus disimpan. Padahal ia sepenuhnya bisa dihitung dari `items`, dan begitu ia disimpan terpisah, ada dua tempat yang harus dijaga tetap cocok, persis seperti masalah "satu perubahan, beberapa pembaruan" dari sub-bab kenapa React. Catatan kedua di kolom kiri menyebut biaya yang tidak terlihat, sebab karena Effect berjalan setelah render, ada satu render penuh yang menampilkan `total` **lama** bersama `items` yang baru. Versi kanan menghapus keduanya dengan satu baris yang dihitung saat render. Aturan yang bisa dipakai untuk mengenali kasus serupa, kalau sebuah state selalu bisa dihitung dari state lain maka ia bukan state melainkan **derived value**, dan tempatnya di badan komponen.',
      ),

      h2('2. Menyalin props ke state'),
      code(
        'tsx',
        `
        // SALAH
        function Profil({ user }) {
          const [nama, setNama] = useState(user.nama);
          useEffect(() => setNama(user.nama), [user.nama]);
        }

        // BENAR — kalau tidak perlu diedit
        function Profil({ user }) {
          return <h1>{user.nama}</h1>;
        }

        // BENAR — kalau perlu diedit: reset dengan key
        <FormProfil key={user.id} user={user} />
        `,
      ),
      p(
        'Versi SALAH menyimpan salinan `user.nama` ke state, lalu memakai Effect untuk menjaga salinannya tetap cocok, sehingga ada dua source of truth lagi dengan satu render bernilai lama seperti kasus sebelumnya. Yang membedakan sub-bab ini adalah **ada dua koreksi, dan memilihnya bergantung pada satu pertanyaan, yaitu apakah nilainya perlu diedit pengguna?** Kalau tidak, jawabannya sesederhana membaca `user.nama` langsung tanpa butuh state sama sekali, dan nilainya otomatis benar setiap kali props berubah. Kalau ya, state memang diperlukan karena pengguna harus bisa mengetik, tetapi cara meresetnya bukan Effect melainkan `key`, dan seperti dibahas sebelumnya `key` mereset **seluruh** state di dalam form alih-alih hanya satu field yang kebetulan kamu ingat.',
      ),

      h2('3. Menangani event pengguna'),
      p(
        'Effect berjalan **karena render terjadi**, bukan karena pengguna melakukan sesuatu. Kalau logikamu adalah "ketika pengguna mengklik", tempatnya di handler.',
      ),
      code(
        'tsx',
        `
        // SALAH
        useEffect(() => {
          if (produkDitambahkan) tampilkanToast('Berhasil');
        }, [produkDitambahkan]);

        // BENAR
        function tambah() {
          simpanProduk();
          tampilkanToast('Berhasil');
        }
        `,
      ),
      p(
        'Perhatikan versi BENAR **tidak punya state `produkDitambahkan` sama sekali**, dan itu petunjuk utamanya. State di versi SALAH tidak menyimpan apa pun yang ditampilkan, melainkan hanya jembatan agar Effect punya sesuatu untuk diamati. Begitu logikanya dipindah ke handler, jembatan itu tidak diperlukan lagi. Versi SALAH juga menyimpan bug yang tidak terlihat, sebab `produkDitambahkan` yang tetap `true` akan memicu toast lagi setiap kali komponen dipasang ulang, misalnya saat pengguna kembali ke halaman itu. Cara paling cepat mengenali pola ini adalah membaca Effect-nya sebagai kalimat. Kalau bunyinya "ketika pengguna melakukan X", ia salah tempat, sebab Effect seharusnya berbunyi "selama komponen ini tampil dengan nilai Y".',
      ),

      h2('4. Merantai Effect'),
      compare(
        {
          title: 'Salah',
          lang: 'tsx',
          code: `
          useEffect(() => {
            if (kartu > 0) setGiliran(g => g + 1);
          }, [kartu]);

          useEffect(() => {
            if (giliran > 3) setSelesai(true);
          }, [giliran]);

          useEffect(() => {
            if (selesai) kirimSkor();
          }, [selesai]);
          `,
          notes: ['Tiga render berantai untuk satu aksi', 'Alurnya mustahil dibaca berurutan'],
        },
        {
          title: 'Benar',
          lang: 'tsx',
          code: `
          function mainkanKartu(kartu) {
            const giliranBaru = giliran + 1;
            setGiliran(giliranBaru);

            if (giliranBaru > 3) {
              setSelesai(true);
              kirimSkor();
            }
          }
          `,
          notes: ['Satu render', 'Seluruh alur terbaca di satu tempat'],
        },
      ),
      p(
        'Kolom kiri menunjukkan pola yang tumbuh perlahan dan sulit dibalik. Tiap Effect mengamati state yang diubah Effect sebelumnya, sehingga satu aksi pengguna memicu **tiga render berantai**, dan tiap render itu menggambar layar dengan keadaan setengah jadi. Lebih buruk lagi, alurnya tidak bisa dibaca berurutan, sebab untuk memahami apa yang terjadi setelah kartu bertambah, pembaca harus melompat antar-Effect dan melacak state mana memicu Effect mana. Kolom kanan menyusunnya kembali sebagai **satu fungsi yang dibaca dari atas ke bawah**, dan perhatikan trik pentingnya, yaitu `giliranBaru` dihitung sebagai variabel lokal lalu dipakai langsung, alih-alih membaca `giliran` yang belum diperbarui. Itu yang memungkinkan seluruh keputusan diambil dalam satu render.',
      ),

      h2('5. Menginisialisasi sesuatu sekali'),
      code(
        'tsx',
        `
        // SALAH: jalan dua kali di Strict Mode
        useEffect(() => {
          daftarkanAplikasi();
        }, []);

        // BENAR: taruh di luar komponen kalau memang sekali seumur aplikasi
        daftarkanAplikasi();

        export function App() { ... }
        `,
      ),
      p(
        'Kode yang ditulis **di luar** definisi komponen, yaitu langsung di level modul, hanya berjalan **sekali**, tepat saat berkas itu pertama kali diimpor oleh JavaScript, tidak peduli berapa kali komponennya sendiri dipasang, dilepas, atau di-render ulang. Itulah kenapa versi BENAR meletakkan `daftarkanAplikasi()` di luar `App`, sebab pemanggilan sekali seumur aplikasi tidak butuh Effect sama sekali, karena masalah "dijalankan dua kali oleh Strict Mode" itu spesifik untuk kode yang berjalan **di dalam** siklus render komponen.',
      ),

      h2('6. Mengambil data'),
      p(
        'Ini yang paling sering, dan yang paling banyak konsekuensinya. Effect + `fetch` berarti kamu menanggung sendiri race condition, cache, deduplikasi, dan refetch.',
      ),
      code(
        'tsx',
        `
        // Sebisa mungkin hindari
        useEffect(() => {
          fetch('/api/produk').then(r => r.json()).then(setProduk);
        }, []);

        // Di Next.js: ambil di Server Component
        const produk = await ambilProduk();

        // Di Client Component: pakai library server state
        const { data } = useQuery({ queryKey: ['produk'], queryFn: ambilProduk });
        `,
      ),
      p(
        'Baris pertama tampak paling sederhana, dan justru itu jebakannya, sebab ia bekerja di localhost lalu gagal dalam banyak cara di dunia nyata. Perhatikan apa yang **tidak ada** di sana. Tidak ada pembatalan, jadi ada race condition. Tidak ada penanganan gagal, jadi kegagalan jaringan berakhir sebagai unhandled rejection. Tidak ada keadaan memuat, jadi layar kosong tanpa penjelasan. Dan tidak ada cache, jadi kembali ke halaman ini mengambil ulang semuanya. Dua alternatifnya menyelesaikan itu dengan cara berbeda. Di Next.js, `await ambilProduk()` di Server Component menghapus masalahnya di akar, sebab datanya sudah ada sebelum HTML dikirim, sehingga tidak ada Effect maupun keadaan memuat sama sekali. Di Client Component, `useQuery` menyediakan cache, deduplikasi, dan pembatalan sebagai bawaan, yaitu pekerjaan yang tidak masuk akal ditulis ulang di tiap komponen.',
      ),

      h2('Kapan Effect memang jawabannya'),
      ul(
        'Menyambung ke sistem luar: WebSocket, `IntersectionObserver`, pemutar video, peta.',
        'Berlangganan event browser: `resize`, `scroll`, `online`/`offline`, `keydown` global.',
        'Menyinkronkan ke `localStorage` atau `document.title`.',
        'Integrasi dengan library non-React yang mengelola DOM sendiri.',
      ),
      callout(
        'tip',
        'Uji satu kalimat',
        'Sebelum menulis Effect, coba lengkapi: *"Effect ini menyelaraskan ___ dengan ___."* Kalau tidak ada sistem luar yang bisa mengisi bagian pertama, kemungkinan besar kamu tidak butuh Effect.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Sebuah berkas komponen berisi tujuh `useEffect`. Setelah ditelusuri satu per satu, lima di antaranya ternyata tidak diperlukan sama sekali. Satu menghitung total dari daftar, satu menyalin props ke state, satu menyinkronkan dua state, satu mengirim analitik saat tombol diklik, dan satu mereset formulir saat id berubah. Kelimanya punya jalan yang lebih pendek, lebih cepat, dan tanpa render tambahan.',
      ),
      p(
        'Sub-bab ini membongkar kelimanya. Polanya sama, yaitu efek dipakai untuk sesuatu yang bukan sinkronisasi dengan dunia luar.',
      ),
      compare(
        {
          title: '1. Menghitung nilai turunan',
          lang: 'tsx',
          code: `
          const [barang, setBarang] = useState([]);
          const [total, setTotal] = useState(0);

          useEffect(() => {
            setTotal(barang.reduce((j, b) => j + b.hargaSen, 0));
          }, [barang]);

          // DUA render untuk satu perubahan.
          // Render pertama menampilkan total LAMA.
          `,
          notes: ['Ada satu render dengan nilai yang belum sinkron'],
        },
        {
          title: 'Hitung saat render',
          lang: 'tsx',
          code: `
          const [barang, setBarang] = useState([]);

          const total = barang.reduce((j, b) => j + b.hargaSen, 0);

          // SATU render. Mustahil tidak sinkron.
          `,
          notes: ['Tidak ada state kedua yang bisa menyimpang'],
        },
      ),
      code(
        'tsx',
        `
        // 2. Menyalin props ke state
        // SALAH:
        const [nilai, setNilai] = useState(props.nilai);
        useEffect(() => { setNilai(props.nilai); }, [props.nilai]);

        // BENAR: pakai propsnya langsung, atau reset dengan key.
        <FormSunting key={props.id} nilai={props.nilai} />


        // 3. Menyinkronkan dua state
        // SALAH:
        useEffect(() => { setBolehKirim(nama !== '' && email !== ''); }, [nama, email]);

        // BENAR:
        const bolehKirim = nama !== '' && email !== '';


        // 4. Bereaksi terhadap klik pengguna
        // SALAH:
        useEffect(() => { if (terkirim) catatAnalitik('form_terkirim'); }, [terkirim]);

        // BENAR: lakukan di penangannya.
        function kirim() {
          simpan();
          catatAnalitik('form_terkirim');
        }


        // 5. Mereset state saat props berubah
        // SALAH:
        useEffect(() => { setCatatan(''); }, [pesananId]);

        // BENAR:
        <FormCatatan key={pesananId} />
        `,
        { caption: 'Kelimanya tidak butuh efek sama sekali.' },
      ),
      p(
        'Kasus keempat adalah pembedaan yang paling menentukan di seluruh bab ini. Kalau sesuatu terjadi **karena pengguna melakukan sesuatu**, tempatnya di penangan peristiwa. Kalau sesuatu terjadi **karena komponennya tampil di layar**, barulah efek. Analitik pengiriman formulir masuk kategori pertama, dan versi efeknya bahkan salah, sebab ia juga akan terpicu kalau `terkirim` bernilai benar saat halaman baru dimuat.',
      ),
      p(
        'Pertanyaan yang memisahkan efek yang diperlukan dari yang tidak bisa diringkas satu kalimat, yaitu **apakah aku sedang menyinkronkan dengan sesuatu di luar React**. Peta pihak ketiga, langganan peristiwa peramban, timer, koneksi WebSocket, dan judul dokumen semuanya di luar React. State React, props, dan nilai turunan semuanya di dalam.',
      ),
      code(
        'text',
        `
        Efek yang MEMANG diperlukan:

        - Berlangganan peristiwa peramban (online, resize, keydown global)
        - Memasang dan melepas pustaka pihak ketiga yang menyentuh DOM
        - Timer dan interval
        - Koneksi WebSocket atau EventSource
        - Menyinkronkan judul dokumen atau atribut pada <html>
        - Menyimpan ke localStorage sebagai reaksi terhadap perubahan state

        Yang TIDAK: menghitung, menyalin, menyinkronkan state, bereaksi ke klik.
        `,
        { caption: 'Daftar ini pendek, dan itu memang seharusnya.' },
      ),
      callout(
        'danger',
        'Efek yang menyetel state selalu berarti dua render',
        'Render pertama terjadi karena perubahan aslinya, dan pada render itu nilai yang disetel efek masih yang lama sehingga tampilannya salah sesaat. Render kedua baru menampilkan nilai yang benar. Untuk perhitungan cepat kedipannya mungkin tidak terlihat, dan untuk yang lebih berat ia terlihat jelas. Aturan lint React Compiler di project ini menandainya sebagai error.',
      ),

      h2('Saat error-nya muncul'),
      p('Empat kegagalan berikut diuji dengan ESLint project ini dan React 19 sungguhan.'),
      code(
        'text',
        `
        useEffect(() => { setTotal(hitung(barang)); }, [barang]);

        error  Calling setState synchronously within an effect can trigger
        cascading renders. Effects are intended to synchronize state between
        React and external systems such as manually updating the DOM, state
        management libraries, or other platform APIs.
        (https://react.dev/learn/you-might-not-need-an-effect)
        `,
        { caption: 'Diuji dengan ESLint project ini. Aturan React Compiler, berstatus error.' },
      ),
      p(
        'Pesan ini bahkan menyertakan tautan ke halaman dokumentasi resmi yang membahas persis topik sub-bab ini. Statusnya error bukan peringatan, sehingga ia menghentikan `npm run lint`. Ini keputusan yang disengaja, sebab pola ini hampir selalu berarti ada nilai yang seharusnya dihitung saat render.',
      ),
      code(
        'text',
        `
        useEffect(() => { setN(n + 1); });

        warning  React Hook useEffect contains a call to 'setN'. Without a list
        of dependencies, this can lead to an infinite chain of updates.
                                            react-hooks/exhaustive-deps
        `,
        { caption: 'Diuji dengan ESLint project ini. Efek tanpa daftar dependensi.' },
      ),
      p(
        'Efek tanpa daftar dependensi berjalan setelah setiap render, sehingga menyetel state di dalamnya menghasilkan putaran tanpa henti. React akan menghentikannya dengan `Maximum update depth exceeded` setelah sekitar lima puluh putaran. Peringatan ini menangkapnya sebelum sempat dijalankan.',
      ),
      code(
        'text',
        `
        // Halaman baru dimuat dengan terkirim = true dari server.
        useEffect(() => { if (terkirim) catatAnalitik('form_terkirim'); }, [terkirim]);

        // Analitik tercatat padahal pengguna tidak mengirim apa pun.
        `,
        { caption: 'Efek terpicu oleh keadaan awal, bukan oleh tindakan pengguna.' },
      ),
      p(
        'Tidak ada error, dan data analitiknya salah tanpa ada yang menyadari. Efek tidak bisa membedakan perubahan yang disebabkan pengguna dari nilai awal yang kebetulan sama. Penangan peristiwa tidak punya masalah itu sebab ia hanya berjalan saat pengguna benar-benar melakukan sesuatu.',
      ),
      code(
        'text',
        `
        useEffect(() => { setNilai(props.nilai); }, [props.nilai]);

        // Pengguna sedang mengetik. Induk digambar ulang karena alasan lain.
        // Ketikan pengguna tertimpa nilai dari props.
        `,
        { caption: 'Menyalin props ke state menimpa masukan pengguna.' },
      ),
      p(
        'Ini bug yang paling menyakitkan dari kelima pola di atas, sebab ia membuang pekerjaan pengguna. Efeknya berjalan setiap kali `props.nilai` berubah, termasuk saat induknya digambar ulang dan mengirim nilai yang sama. Untuk kolom yang sedang diketik, ini berarti ketikan hilang di tengah jalan. Pakai props langsung, atau reset dengan `key`.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Calling setState synchronously within an effect`',
            'Nilai turunan dihitung lewat efek',
            'Hitung saat render, hapus efeknya',
          ],
          [
            '`this can lead to an infinite chain of updates`',
            'Efek tanpa daftar dependensi memanggil setter',
            'Hapus efeknya, atau tambahkan daftar dependensi yang benar',
          ],
          [
            'Analitik tercatat tanpa tindakan pengguna',
            'Efek terpicu oleh keadaan awal',
            'Pindahkan ke penangan peristiwa',
          ],
          [
            'Ketikan pengguna tertimpa',
            'Props disalin ke state lewat efek',
            'Pakai props langsung, atau reset dengan `key`',
          ],
          [
            'Tampilan salah sesaat lalu benar',
            'Efek menyetel state, sehingga ada dua render',
            'Hitung saat render',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Efek yang tidak diperlukan adalah sumber bug terbesar di seluruh kategori ini, dan sebagian besarnya berasal dari satu kesalahpahaman tentang untuk apa efek ada.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai efek untuk menghitung nilai turunan',
            'Supaya tidak dihitung tiap render',
            'Dua render untuk satu perubahan, dan satu di antaranya menampilkan nilai lama. Perhitungan biasa jauh lebih murah daripada render tambahan',
          ],
          [
            'Menyalin props ke state lewat efek',
            'Supaya bisa diubah di dalam',
            'Menimpa ketikan pengguna saat induk digambar ulang. Pakai props langsung atau `key`',
          ],
          [
            'Memakai efek untuk bereaksi terhadap klik',
            'Klik kan mengubah state',
            'Efek juga terpicu oleh keadaan awal, sehingga tindakan tercatat tanpa pengguna melakukan apa pun',
          ],
          [
            'Menyinkronkan dua state dengan efek',
            'Efek memang untuk bereaksi terhadap perubahan',
            'Kalau satu bisa dihitung dari yang lain, ia bukan state. Hitung saat render',
          ],
          [
            'Mereset state dengan efek yang mengawasi props',
            'Perlu dikosongkan saat berpindah',
            'Dua render, dan yang pertama menampilkan data lama untuk entitas baru. Pakai `key`',
          ],
          [
            'Menambahkan efek untuk mengambil data di App Router',
            'Itu cara yang sudah dikuasai',
            'Pengambilan data lebih tepat di Server Component. Efek berarti satu perjalanan bolak-balik tambahan dan keadaan kosong yang terlihat pengguna',
          ],
        ],
      ),
      p(
        'Baris ketiga layak ditegaskan karena akibatnya berupa data yang salah, bukan sekadar performa. Efek tidak bisa membedakan pengguna menekan tombol dari halaman yang kebetulan dimuat dengan keadaan itu. Kalau kamu melihat analitik yang angkanya jauh lebih tinggi dari yang masuk akal, periksa apakah pencatatannya dilakukan di efek.',
      ),
      callout(
        'tip',
        'Satu pertanyaan sebelum menulis `useEffect`',
        'Apakah aku sedang menyinkronkan dengan sesuatu di **luar** React. Kalau jawabannya peta, timer, langganan peristiwa, WebSocket, atau judul dokumen, efek memang jawabannya. Kalau jawabannya state lain, props, atau nilai yang bisa dihitung, hampir pasti ada jalan yang lebih pendek tanpa efek sama sekali.',
      ),
      references(
        {
          label: 'You Might Not Need an Effect',
          href: 'https://react.dev/learn/you-might-not-need-an-effect',
          source: 'React',
          note: 'Halaman resmi yang menjadi kerangka seluruh katalog kesalahan di sub-bab ini.',
        },
        {
          label: 'Separating Events from Effects',
          href: 'https://react.dev/learn/separating-events-from-effects',
          source: 'React',
          note: 'Garis pemisah antara "karena pengguna melakukan sesuatu" dan "karena render terjadi".',
        },
        {
          label: 'Fetching data with Effects (dan alternatifnya)',
          href: 'https://react.dev/reference/react/useEffect#fetching-data-with-effects',
          source: 'React',
          note: 'Peringatan resmi tentang race condition, cache, dan deduplikasi saat mengambil data via Effect.',
        },
        {
          label: 'Array.prototype.reduce()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce',
          source: 'MDN Web Docs',
          note: 'Metode yang dipakai contoh menghitung total di atas.',
        },
      ),
    ],
  ),

  written(
    'uselayouteffect',
    '`useLayoutEffect` vs `useEffect`',
    18,
    'Perbedaan waktu jalan dan akibatnya.',
    [
      p(
        'Keduanya punya API yang identik. Yang berbeda hanya **kapan** ia berjalan relatif terhadap saat browser menggambar layar — dan perbedaan itu menentukan apakah pengguna melihat flicker.',
      ),

      terms(
        {
          term: 'paint / menggambar',
          meaning:
            'Momen browser benar-benar menyalakan piksel di layar. Semua yang terjadi **sebelum** paint tidak pernah dilihat pengguna; semua yang terjadi **sesudahnya** berpotensi terlihat sebagai perubahan mendadak. Seluruh perbedaan dua hook di sub-bab ini bermuara ke satu garis ini.',
        },
        {
          term: 'flicker',
          meaning:
            'Elemen sempat terlihat di posisi atau bentuk yang salah, lalu melompat ke tempat yang benar. Terjadi ketika perubahan dilakukan **setelah** paint. Ini gejala visual yang membedakan "butuh `useLayoutEffect`" dari "cukup `useEffect`".',
        },
        {
          term: 'layout',
          meaning:
            'Tahap browser menghitung posisi dan ukuran setiap elemen. Nama `useLayoutEffect` berarti "Effect yang berjalan setelah layout dihitung tapi sebelum digambar" — persis jendela waktu yang kamu butuhkan untuk mengukur lalu memperbaiki posisi.',
        },
        {
          term: 'getBoundingClientRect',
          meaning:
            'Metode DOM yang mengembalikan kotak posisi dan ukuran sebuah elemen relatif terhadap viewport: `top`, `left`, `width`, `height`. Inilah cara "mengukur" elemen sungguhan — dan ia hanya bisa dipanggil setelah elemennya ada di DOM.',
        },
        {
          term: 'ref',
          meaning:
            'Singkatan dari *reference* (rujukan). Objek berisi `.current` yang React isi dengan elemen DOM sungguhan setelah dipasang. Dibahas tuntas di sub-bab berikutnya; di sini ia dipakai sekadar untuk bisa mengukur tooltip-nya.',
        },
        {
          term: 'tooltip',
          meaning:
            'Kotak kecil berisi keterangan yang muncul di dekat elemen tertentu. Ia contoh klasik `useLayoutEffect` karena posisinya baru bisa dihitung setelah tahu ukuran aslinya — dan menghitungnya setelah paint berarti pengguna melihatnya melompat.',
        },
        {
          term: 'SSR',
          meaning:
            'Singkatan *Server-Side Rendering* — HTML dibuat di server sebelum dikirim ke browser. Di server tidak ada layar untuk digambar, jadi `useLayoutEffect` tidak berjalan dan React memperingatkanmu. Ini relevan langsung di Next.js, yang merender di server secara default.',
        },
        {
          term: 'isomorphic',
          meaning:
            'Dibaca "aisomorfik", artinya **berbentuk sama di dua tempat**. Pola `useIsomorphicLayoutEffect` memilih `useEffect` saat di server dan `useLayoutEffect` saat di browser, sehingga satu komponen bisa hidup di keduanya tanpa peringatan.',
        },
      ),

      h2('Urutannya'),
      code(
        'text',
        `
        1. React merender komponen
        2. React menerapkan perubahan ke DOM
        3. useLayoutEffect jalan          <- browser BELUM menggambar
        4. Browser menggambar layar
        5. useEffect jalan                <- setelah pengguna melihat
        `,
      ),
      p(
        'Karena `useLayoutEffect` berjalan sebelum langkah 4, perubahan yang ia buat masuk ke gambar yang sama — pengguna tidak pernah melihat keadaan sebelumnya.',
      ),

      h2('Kasus yang membutuhkannya: mengukur lalu memposisikan'),
      code(
        'tsx',
        `
        'use client';

        export function Tooltip({ target, children }) {
          const ref = useRef<HTMLDivElement>(null);
          const [posisi, setPosisi] = useState({ atas: 0, kiri: 0 });

          // Dengan useEffect: tooltip sempat terlihat di posisi 0,0
          // lalu melompat ke tempat yang benar.
          useLayoutEffect(() => {
            const kotakTarget = target.getBoundingClientRect();
            const kotakTooltip = ref.current!.getBoundingClientRect();

            setPosisi({
              atas: kotakTarget.top - kotakTooltip.height - 8,
              kiri: kotakTarget.left + kotakTarget.width / 2 - kotakTooltip.width / 2,
            });
          }, [target]);

          return <div ref={ref} style={{ top: posisi.atas, left: posisi.kiri }}>{children}</div>;
        }
        `,
      ),
      p(
        'Urutan kejadiannya penting untuk dipahami. Render pertama menghasilkan tooltip di posisi `{ atas: 0, kiri: 0 }` (nilai awal state), lalu `useLayoutEffect` langsung berjalan, **sebelum** browser sempat menggambar apa pun ke layar, untuk mengukur posisi target lewat `getBoundingClientRect()` dan menghitung posisi yang benar. Karena `setPosisi` dipanggil di dalam `useLayoutEffect`, React menggabungkan perubahan itu ke dalam gambar yang sama, sehingga posisi `0,0` tidak pernah benar-benar terlihat pengguna, berbeda dengan komentar di kode yang menjelaskan apa yang **akan** terjadi kalau dipakai `useEffect` biasa. `ref.current!` dengan tanda seru memastikan TypeScript bahwa `ref.current` sudah terisi elemen DOM saat baris itu dijalankan, dan itu sah di sini karena Effect (termasuk `useLayoutEffect`) selalu berjalan setelah React memasang elemennya, sehingga `ref.current` tidak lagi `null`.',
      ),

      h2('Kapan memakai yang mana'),
      table(
        ['Kebutuhan', 'Pilihan'],
        [
          ['Mengukur DOM lalu langsung mengubah posisi/ukuran', '`useLayoutEffect`'],
          ['Menyesuaikan posisi scroll sebelum terlihat', '`useLayoutEffect`'],
          ['Mengambil data, berlangganan, mengirim analitik', '`useEffect`'],
          ['Menyimpan ke `localStorage`', '`useEffect`'],
          ['Ragu-ragu', '`useEffect`'],
        ],
      ),

      h2('Biayanya nyata'),
      callout(
        'warning',
        '`useLayoutEffect` memblokir gambar',
        'Browser menunggu sampai ia selesai sebelum menampilkan apa pun. Pekerjaan berat di dalamnya langsung terasa sebagai jeda. Pakai hanya ketika flicker visual benar-benar terjadi tanpanya — jangan sebagai default "biar aman".',
      ),

      h2('Peringatan saat SSR'),
      p(
        '`useLayoutEffect` tidak berjalan di server dan React akan memperingatkanmu bila sebuah komponen memakainya saat dirender di server. Solusinya: jalankan hanya setelah komponen terpasang di browser.',
      ),
      code(
        'tsx',
        `
        // Aman di SSR: pakai useEffect di server, useLayoutEffect di browser.
        const useIsomorphicLayoutEffect =
          typeof window !== 'undefined' ? useLayoutEffect : useEffect;
        `,
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tooltip harus muncul tepat di atas tombol pemicunya. Posisinya dihitung dari ukuran tooltip itu sendiri, sehingga baru bisa diketahui setelah ia dirender. Ditulis dengan `useEffect`, tooltip muncul sesaat di pojok kiri atas lalu melompat ke tempat yang benar. Kedipannya terlihat jelas, terutama pada perangkat yang lebih lambat.',
      ),
      p(
        'Perbedaan `useLayoutEffect` dan `useEffect` adalah **kapan** ia berjalan relatif terhadap penggambaran layar. Berikut urutannya, diukur dengan React 19 sungguhan.',
      ),
      code(
        'text',
        `
        # Diukur dengan React 19:
        render
        useLayoutEffect
        useEffect

        Urutan lengkapnya:
          1. React menjalankan komponen (render)
          2. React mengubah DOM (commit)
          3. useLayoutEffect berjalan          <- SEBELUM peramban menggambar
          4. Peramban menggambar layar
          5. useEffect berjalan                <- SETELAH peramban menggambar
        `,
        { caption: 'Diukur sungguhan. Selisihnya satu langkah, dan itu yang menentukan.' },
      ),
      p(
        'Karena `useLayoutEffect` berjalan sebelum penggambaran, perubahan DOM yang ia lakukan tidak pernah terlihat sebagai kedipan. Peramban menahan penggambaran sampai ia selesai. Itu yang menyelesaikan masalah tooltip pada cerita di awal, sekaligus yang membuatnya harus dipakai hemat.',
      ),
      code(
        'tsx',
        `
        function Tooltip({ pemicuRef, isi }: TooltipProps) {
          const ref = useRef<HTMLDivElement>(null);
          const [posisi, setPosisi] = useState({ atas: 0, kiri: 0 });

          // useLayoutEffect, bukan useEffect. Pengukuran harus selesai
          // sebelum peramban menggambar, kalau tidak tooltip berkedip.
          useLayoutEffect(() => {
            if (!ref.current || !pemicuRef.current) return;

            const tooltip = ref.current.getBoundingClientRect();
            const pemicu = pemicuRef.current.getBoundingClientRect();

            setPosisi({
              atas: pemicu.top - tooltip.height - 8,
              kiri: pemicu.left + pemicu.width / 2 - tooltip.width / 2,
            });
          }, [isi, pemicuRef]);   // hitung ulang kalau isinya berubah ukuran

          return (
            <div
              ref={ref}
              role="tooltip"
              style={{ position: 'fixed', top: posisi.atas, left: posisi.kiri }}
            >
              {isi}
            </div>
          );
        }
        `,
        { filename: 'src/ui/Tooltip.tsx' },
      ),
      p(
        'Yang perlu diperhatikan, `useLayoutEffect` berjalan **secara sinkron** dan menahan penggambaran. Kode yang lambat di dalamnya membuat halaman terasa tersendat, sebab peramban tidak bisa menggambar apa pun sampai ia selesai. Ini kebalikan dari `useEffect` yang berjalan setelah penggambaran sehingga tidak pernah menahan apa pun.',
      ),
      p(
        'Dependensi `[isi, pemicuRef]` diperlukan sebab ukuran tooltip berubah kalau isinya berubah. Menghitung ulang hanya saat pemasangan berarti tooltip yang isinya berganti akan salah posisi. Perhatikan `pemicuRef` sendiri adalah object yang stabil dari `useRef`, sehingga menaruhnya di dependensi aman.',
      ),
      code(
        'text',
        `
        Kapan memakai useLayoutEffect, dan kapan tidak:

        Mengukur DOM lalu langsung mengubah posisi   -> useLayoutEffect
        Memulihkan posisi gulir setelah daftar berubah -> useLayoutEffect
        Mengukur teks untuk menentukan potongan       -> useLayoutEffect

        Mengambil data dari server                    -> useEffect
        Berlangganan peristiwa                        -> useEffect
        Memasang timer                                -> useEffect
        Mengirim analitik                             -> useEffect

        Aturannya: pakai useEffect sebagai bawaan.
        Naik ke useLayoutEffect HANYA kalau ada kedipan yang terlihat.
        `,
        { caption: 'Daftar kirinya pendek, dan itu memang seharusnya.' },
      ),
      callout(
        'warning',
        '`useLayoutEffect` tidak berjalan di server dan memicu peringatan',
        'Karena tidak ada DOM di server, React memberi peringatan saat komponen yang memakainya dirender di sana. Untuk komponen yang dirender di kedua sisi, jalan keluarnya menunda perenderan bagian yang membutuhkannya sampai komponennya terpasang di klien, atau memakai pola yang memilih hook sesuai lingkungan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering, dan dua di antaranya berupa kedipan yang harus kamu lihat sendiri.',
      ),
      code(
        'text',
        `
        Warning: useLayoutEffect does nothing on the server, because its effect
        cannot be encoded into the renderer's output format. This will lead to
        a mismatch between the initial, non-hydrated UI and the intended UI.
        `,
        { caption: 'Komponen yang memakainya dirender di server.' },
      ),
      p(
        'Pesannya menjelaskan akibatnya, yaitu HTML dari server akan berbeda dari yang dimaksudkan sebab pengukurannya tidak pernah terjadi. Untuk komponen yang memang hanya berarti di klien, misalnya tooltip, jalan keluarnya menunda perenderannya sampai terpasang. Untuk pustaka yang harus mendukung keduanya, ada pola memilih hook sesuai lingkungan yang umum dipakai.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          setPosisi(hitungPosisi());
        }, []);

        // Tooltip muncul di pojok kiri atas, lalu melompat ke tempat yang benar.
        // Kedipannya terlihat, terutama di perangkat lambat.
        `,
        { caption: '`useEffect` berjalan setelah penggambaran, sehingga posisi awalnya terlihat.' },
      ),
      p(
        'Tidak ada error, dan gejalanya berupa kedipan yang sering diabaikan sebagai hal kecil. Di perangkat cepat ia mungkin hanya satu bingkai, dan di ponsel kelas menengah ia jelas terlihat. Cara memeriksanya adalah menyalakan pembatas CPU di tab Performance lalu memicu tooltipnya. Kalau kedipannya terlihat, `useLayoutEffect` memang jawabannya.',
      ),
      code(
        'text',
        `
        useLayoutEffect(() => {
          const hasil = hitungBerat(dataBesar);   // 200 ms
          setHasil(hasil);
        }, [dataBesar]);

        // Halaman membeku 200 ms setiap kali dataBesar berubah.
        // Tidak ada error.
        `,
        { caption: '`useLayoutEffect` menahan penggambaran sampai selesai.' },
      ),
      p(
        'Karena ia berjalan sinkron sebelum penggambaran, seluruh isinya menahan layar. Ini kebalikan dari `useEffect` yang tidak pernah menahan apa pun. Kalau kamu memakai `useLayoutEffect` untuk hal yang tidak berhubungan dengan pengukuran DOM, kamu membayar biaya pembekuan tanpa mendapat manfaatnya. Pakai `useEffect` sebagai bawaan.',
      ),
      code(
        'text',
        `
        useLayoutEffect(() => {
          setUkuran(ref.current.getBoundingClientRect().width);
        });
        // tanpa daftar dependensi

        Error: Maximum update depth exceeded.
        `,
        { caption: 'Efek tanpa dependensi yang menyetel state menghasilkan putaran.' },
      ),
      p(
        'Setiap penyetelan state memicu render, dan setiap render menjalankan efeknya lagi. Karena `useLayoutEffect` berjalan sinkron, putarannya terjadi tanpa satu pun penggambaran di antaranya sehingga tab benar-benar membeku sampai React menghentikannya. Tambahkan daftar dependensi, dan bandingkan nilai barunya sebelum menyetel kalau perlu.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`useLayoutEffect does nothing on the server`',
            'Komponennya dirender di server',
            'Tunda perenderannya sampai terpasang di klien',
          ],
          [
            'Elemen berkedip dari posisi awal ke posisi benar',
            '`useEffect` berjalan setelah penggambaran',
            'Ganti ke `useLayoutEffect` untuk pengukuran DOM',
          ],
          [
            'Halaman membeku saat efek berjalan',
            '`useLayoutEffect` menahan penggambaran',
            'Pindahkan pekerjaan berat ke `useEffect`',
          ],
          [
            '`Maximum update depth exceeded`',
            'Efek tanpa dependensi menyetel state',
            'Tambahkan daftar dependensi, dan bandingkan sebelum menyetel',
          ],
          [
            'Posisi salah setelah isinya berubah',
            'Dependensi tidak memuat nilai yang mempengaruhi ukuran',
            'Sertakan nilai itu di daftar dependensi',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        '`useLayoutEffect` adalah hook yang jarang diperlukan dan mudah dipakai berlebihan, sebab ia terlihat seperti versi yang lebih baik dari `useEffect`.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `useLayoutEffect` sebagai bawaan',
            'Ia berjalan lebih dulu, jadi lebih aman',
            'Ia menahan penggambaran. Untuk pekerjaan yang tidak berhubungan dengan pengukuran DOM, ini biaya tanpa manfaat',
          ],
          [
            'Memakainya untuk mengambil data',
            'Supaya datanya siap lebih cepat',
            'Permintaan jaringan tetap asinkron, dan menahan penggambaran tidak mempercepatnya sama sekali',
          ],
          [
            'Membiarkan kedipan karena hanya satu bingkai',
            'Di komputer sendiri tidak terlihat',
            'Di ponsel kelas menengah ia jelas terlihat. Pakai pembatas CPU untuk memeriksanya',
          ],
          [
            'Mengabaikan peringatan tentang server',
            'Halamannya tetap tampil',
            'HTML dari server berbeda dari yang dimaksudkan, dan itu bisa menyebabkan ketidakcocokan hidrasi',
          ],
          [
            'Menaruh pekerjaan berat di dalamnya',
            'Perlu selesai sebelum digambar',
            'Seluruh isinya menahan layar. Kalau memang berat, pertimbangkan apakah ia benar-benar harus sebelum penggambaran',
          ],
          [
            'Memakainya untuk animasi masuk',
            'Supaya tidak berkedip',
            'Untuk animasi, `requestAnimationFrame` atau transisi CSS biasanya lebih tepat dan tidak menahan apa pun',
          ],
        ],
      ),
      p(
        'Baris pertama adalah kesalahan yang paling sering dan paling mudah dihindari. Aturannya bisa dinyatakan tegas, yaitu pakai `useEffect` sebagai bawaan, dan naik ke `useLayoutEffect` hanya setelah kamu **melihat** kedipannya sendiri. Kalau kamu tidak bisa menunjukkan kedipan yang diperbaikinya, ia tidak diperlukan.',
      ),
      callout(
        'info',
        'Sebagian pengukuran bisa dihindari sama sekali',
        'CSS modern menyediakan banyak hal yang dulu butuh pengukuran JavaScript, misalnya `position: sticky`, kueri wadah, `aspect-ratio`, dan `anchor positioning` untuk tooltip pada peramban yang mendukungnya. Sebelum menulis pengukuran, periksa apakah CSS sudah bisa menyelesaikannya, sebab solusi CSS tidak pernah menahan penggambaran.',
      ),
      references(
        {
          label: 'useLayoutEffect',
          href: 'https://react.dev/reference/react/useLayoutEffect',
          source: 'React',
          note: 'Rujukan resmi, termasuk peringatan performa dan perilakunya saat SSR.',
        },
        {
          label: 'useEffect',
          href: 'https://react.dev/reference/react/useEffect',
          source: 'React',
          note: 'Pasangannya yang berjalan setelah browser menggambar layar.',
        },
        {
          label: 'Element.getBoundingClientRect()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect',
          source: 'MDN Web Docs',
          note: 'Cara mengukur posisi dan ukuran elemen sungguhan di layar.',
        },
        {
          label: 'Render and Commit',
          href: 'https://react.dev/learn/render-and-commit',
          source: 'React',
          note: 'Tiga tahap React, yaitu trigger, render, dan commit, yang menjelaskan urutan di atas.',
        },
      ),
    ],
  ),

  written(
    'useref',
    '`useRef`: nilai mutable & akses DOM',
    21,
    'Kotak yang bertahan antar render tanpa memicu render.',
    [
      p(
        '`useRef` mengembalikan objek dengan satu properti `.current` yang bertahan sepanjang umur komponen. Perbedaan pentingnya dari `useState`: **mengubah `.current` tidak memicu render**.',
      ),

      terms(
        {
          term: 'ref',
          meaning:
            'Singkatan dari *reference* (rujukan). Bayangkan sebuah kotak berlabel `.current` yang ikut hidup bersama komponenmu: isinya bertahan antar render, tapi menggantinya **tidak** memberitahu React apa pun. Dua kegunaannya berbeda jauh — memegang elemen DOM sungguhan, dan menyimpan nilai yang tidak ditampilkan.',
        },
        {
          term: 'mutable',
          meaning:
            'Dibaca "myutabel", artinya **bisa diubah di tempat**. `ref.current = 5` mengubah isi kotaknya langsung, tanpa membuat objek baru dan tanpa memicu render. Lawannya *immutable* — pola yang dipakai `useState`, di mana kamu selalu membuat nilai baru.',
        },
        {
          term: '.current',
          meaning:
            'Satu-satunya properti objek yang dikembalikan `useRef`. Namanya berarti "nilai saat ini". Objek pembungkusnya sendiri tidak pernah berganti sepanjang umur komponen — yang berganti hanya isi `.current`, dan itulah yang membuatnya stabil untuk dipakai di Effect.',
        },
        {
          term: 'optional chaining (`?.`)',
          meaning:
            'Operator JavaScript `?.` yang berarti "kalau nilainya `null` atau `undefined`, berhenti di sini dan hasilkan `undefined` alih-alih melempar error". Pada `inputRef.current?.focus()` ia memang perlu — ref belum terisi saat render pertama, jadi `.current` sungguhan bisa bernilai `null`.',
        },
        {
          term: 'HTMLInputElement',
          meaning:
            'Tipe TypeScript untuk elemen `<input>` sungguhan di DOM. Ada satu tipe seperti ini per jenis elemen — `HTMLDivElement`, `HTMLButtonElement`, dan seterusnya. Menuliskannya di `useRef<HTMLInputElement>(null)` yang membuat editor tahu metode apa saja yang tersedia di `.current`.',
        },
        {
          term: 'pure render',
          meaning:
            'Komponen yang, untuk props dan state yang sama, selalu menghasilkan keluaran yang sama — tanpa efek samping. Membaca atau menulis `.current` saat render melanggar ini: hasilnya jadi bergantung pada **berapa kali** komponen dirender, sesuatu yang tidak dijamin React.',
        },
        {
          term: 'concurrent features',
          meaning:
            'Kemampuan React memulai sebuah render, menjedanya, membuangnya, lalu mengulanginya. Ini alasan aturan "jangan sentuh ref saat render" bukan sekadar kerapian: dengan render yang bisa dibatalkan, kode yang bergantung pada jumlah render pasti akan salah cepat atau lambat.',
        },
        {
          term: 'forwardRef',
          meaning:
            'API lama untuk meneruskan `ref` dari komponen induk ke elemen di dalam komponen anak. **Sejak React 19 tidak lagi diperlukan** — `ref` bisa diterima sebagai prop biasa. `forwardRef` masih bekerja demi kode lama, tapi jangan dipakai untuk kode baru.',
        },
        {
          term: 'callback ref',
          meaning:
            'Alih-alih objek, kamu mengoper **fungsi** ke atribut `ref`. React memanggilnya dengan elemennya saat dipasang, dan dengan `null` saat dilepas. Di React 19 fungsi ini boleh mengembalikan cleanup — bentuk paling rapi untuk memasang observer pada sebuah elemen.',
        },
      ),

      h2('Dua kegunaan yang berbeda'),
      table(
        ['', '`useState`', '`useRef`'],
        [
          ['Bertahan antar render', 'Ya', 'Ya'],
          ['Perubahan memicu render', '**Ya**', '**Tidak**'],
          ['Boleh dibaca saat render', 'Ya', 'Tidak (kecuali inisialisasi)'],
          ['Untuk', 'Data yang ditampilkan', 'Data yang tidak ditampilkan, dan DOM'],
        ],
      ),

      h2('Kegunaan 1: mengakses elemen DOM'),
      code(
        'tsx',
        `
        'use client';

        export function KotakCari() {
          const inputRef = useRef<HTMLInputElement>(null);

          useEffect(() => {
            inputRef.current?.focus();
          }, []);

          return <input ref={inputRef} type="search" />;
        }
        `,
      ),
      p(
        'Tipenya `HTMLInputElement | null` — `null` karena ref belum terisi saat render pertama. Optional chaining di sini bukan kehati-hatian berlebihan; ia memang perlu.',
      ),

      h2('Kegunaan 2: nilai mutable yang tidak ditampilkan'),
      code(
        'tsx',
        `
        export function Timer() {
          const [detik, setDetik] = useState(0);
          const idTimer = useRef<number | null>(null);

          function mulai() {
            if (idTimer.current !== null) return;   // sudah jalan
            idTimer.current = window.setInterval(() => setDetik((d) => d + 1), 1000);
          }

          function berhenti() {
            if (idTimer.current === null) return;
            clearInterval(idTimer.current);
            idTimer.current = null;
          }

          useEffect(() => berhenti, []);   // bersihkan saat komponen hilang

          return <button onClick={mulai}>{detik}</button>;
        }
        `,
      ),
      p(
        'ID timer tidak pernah ditampilkan, jadi menyimpannya di state hanya akan menghasilkan render yang sia-sia.',
      ),

      h2('Jangan membaca `.current` saat render'),
      code(
        'tsx',
        `
        // SALAH: hasil render jadi tidak murni dan tidak bisa diprediksi
        function Komponen() {
          const ref = useRef(0);
          ref.current += 1;
          return <p>{ref.current}</p>;
        }

        // BENAR: baca dan tulis di handler atau Effect
        function Komponen() {
          const ref = useRef(0);
          return <button onClick={() => { ref.current += 1; }}>Klik</button>;
        }
        `,
      ),
      p(
        'Perbedaannya bukan pada baris `ref.current += 1` melainkan pada **kapan baris itu dijalankan**. Di versi SALAH ia berada di badan komponen, sehingga berjalan setiap kali React memanggil fungsinya, dan karena mengubah ref tidak memicu render, angkanya bisa berbeda-beda tanpa ada yang mengubah data apa pun. Ini pelanggaran kemurnian yang sama seperti `hitungan++` di sub-bab komponen, hanya memakai ref alih-alih variabel modul. Di versi BENAR baris itu dipindah ke dalam handler, yang berjalan **sebagai respons peristiwa** dan bukan sebagai bagian dari render. Aturan praktisnya, ref boleh dibaca dan ditulis di handler maupun Effect tetapi tidak pernah di badan komponen, dan kalau nilainya memang perlu ditampilkan, yang kamu butuhkan sebenarnya state.',
      ),
      callout(
        'warning',
        'Kenapa aturan ini penting sekarang',
        'React berhak melakukan re-render komponen kapan saja, dan dengan fitur konkuren ia bisa memulai render lalu membatalkannya. Komponen yang membaca atau menulis ref saat render menghasilkan keluaran yang bergantung pada berapa kali ia dirender — sesuatu yang tidak bisa dijamin React.',
      ),

      h2('React 19: `ref` sebagai prop biasa'),
      code(
        'tsx',
        `
        // React 19: cukup terima sebagai prop
        function Input({ ref, ...sisa }: { ref?: React.Ref<HTMLInputElement> }) {
          return <input ref={ref} {...sisa} />;
        }

        // Sebelum React 19 ini butuh forwardRef.
        // forwardRef masih bekerja, tapi tidak lagi diperlukan untuk kode baru.
        `,
      ),

      h2('Callback ref'),
      code(
        'tsx',
        `
        // Dipanggil saat elemen dipasang dan dilepas —
        // berguna kalau kamu perlu bereaksi terhadap keduanya.
        <div
          ref={(node) => {
            if (node === null) return;
            const observer = new ResizeObserver(ukur);
            observer.observe(node);

            // React 19: fungsi ref boleh mengembalikan cleanup.
            return () => observer.disconnect();
          }}
        />
        `,
      ),
      p(
        'React memanggil fungsi ref ini dengan elemen DOM-nya saat elemen dipasang, dan dengan `null` saat elemen dilepas, dan itulah alasan baris pertama `if (node === null) return` diperlukan, supaya `ResizeObserver` tidak dipasang pada `null`. Sejak React 19, fungsi ref boleh **mengembalikan** fungsi cleanup persis seperti `useEffect`, sebab fungsi yang di-`return` (`() => observer.disconnect()`) dijalankan otomatis sesaat sebelum React memanggil ref lagi dengan `null`, sehingga observer yang dipasang saat elemen muncul selalu dibersihkan saat elemen itu hilang, tanpa perlu `useEffect` terpisah untuk mengelolanya.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen unggah berkas menampilkan bilah kemajuan. Nilai kemajuannya disimpan di `ref` supaya tidak memicu render pada tiap potongan yang terkirim, dan hasilnya bilah kemajuannya tidak pernah bergerak. Setelah diubah menjadi state, bilahnya bergerak dan halaman terasa tersendat sebab ia digambar ulang ratusan kali per detik.',
      ),
      p(
        'Kedua masalah itu adalah dua sisi dari satu pembedaan. Berikut buktinya, diukur dengan React 19 sungguhan.',
      ),
      code(
        'text',
        `
        # Diukur dengan React 19:
        render ke-0, ref=0
        (dua klik yang menaikkan ref selesai — tidak ada render baru)
        render ke-1, ref=2

        Mengubah ref TIDAK memicu render.
        Nilainya tetap tersimpan, dan baru terlihat saat ada render karena hal lain.
        `,
        { caption: 'Diukur sungguhan. Inilah seluruh perbedaannya.' },
      ),
      p(
        'Baris terakhir yang menentukan. Nilai `ref` **tetap tersimpan** dengan benar, yaitu dua klik menghasilkan nilai dua. Yang tidak terjadi adalah penggambaran ulang, sehingga layar tidak pernah menunjukkan perubahannya. Untuk bilah kemajuan, itu berarti nilainya benar dan tampilannya diam.',
      ),
      code(
        'tsx',
        `
        // Jalan tengah: ref untuk nilai yang berubah sangat sering,
        // state untuk yang ditampilkan, diperbarui berkala.
        function Unggah({ berkas }: { berkas: File }) {
          const kemajuanRef = useRef(0);
          const [kemajuanTampil, setKemajuanTampil] = useState(0);

          useEffect(() => {
            const kendali = new AbortController();

            // Perbarui tampilan maksimal 10 kali per detik, bukan tiap potongan.
            const timer = setInterval(() => {
              setKemajuanTampil(kemajuanRef.current);
            }, 100);

            unggah(berkas, {
              sinyal: kendali.signal,
              onKemajuan: (nilai) => { kemajuanRef.current = nilai; },   // tanpa render
            });

            return () => {
              clearInterval(timer);
              kendali.abort();
            };
          }, [berkas]);

          return <progress value={kemajuanTampil} max={100} />;
        }
        `,
        { filename: 'src/unggah/Unggah.tsx' },
      ),
      p(
        'Pola ini memakai keduanya sesuai kekuatannya masing-masing. `ref` menerima ratusan pembaruan per detik tanpa satu pun render, dan `state` disalin dari sana sepuluh kali per detik untuk ditampilkan. Hasilnya bilah yang bergerak mulus dengan biaya render yang terkendali. Ini pola yang sama dengan yang dipakai untuk pelacakan posisi kursor dan penggulir.',
      ),
      code(
        'tsx',
        `
        // Dua kegunaan ref yang paling sering, dan keduanya sah.

        // 1. Memegang elemen DOM.
        const kotakRef = useRef<HTMLInputElement>(null);
        useEffect(() => { kotakRef.current?.focus(); }, []);

        // 2. Menyimpan nilai antar-render yang TIDAK mempengaruhi tampilan.
        const timerRef = useRef<number | null>(null);
        const nilaiSebelumnyaRef = useRef(nilai);

        useEffect(() => {
          nilaiSebelumnyaRef.current = nilai;   // disimpan setelah render
        });
        `,
        { caption: 'Yang menyatukan keduanya: tidak ada yang perlu digambar ulang.' },
      ),
      p(
        'Nilai `ref` untuk elemen DOM selalu dimulai dari `null`, dan itu bukan pilihan melainkan kenyataan. React baru mengisinya setelah komponennya terpasang, sehingga kode yang berjalan sebelum itu benar-benar mendapat `null`. Itu sebabnya `kotakRef.current?.focus()` dengan tanda tanya bukan kehati-hatian berlebihan melainkan satu-satunya bentuk yang benar.',
      ),
      p(
        'Perlu ditegaskan `ref` **tidak boleh dibaca maupun ditulis selama render**. Membacanya saat render menghasilkan nilai yang bisa berbeda antar-render tanpa React tahu, dan menulisnya melanggar aturan bahwa render harus murni. Bacalah dan tulislah di dalam penangan peristiwa atau di dalam efek. Aturan lint React Compiler di project ini menandai pelanggarannya.',
      ),
      callout(
        'warning',
        '`ref` bukan tempat menyimpan sesuatu yang ditampilkan',
        'Kalau nilainya muncul di layar, ia harus berupa state. Menyimpannya di `ref` menghasilkan tampilan yang tertinggal dari kenyataan, dan gejalanya berupa angka yang baru berubah setelah pengguna mengklik hal lain. Ini bug yang membingungkan sebab nilainya benar dan tampilannya salah.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React 19, dan dua di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        const hitung = useRef(0);
        <button onClick={() => { hitung.current += 1; }}>Tambah</button>
        <p>{hitung.current}</p>

        // Diukur: dua klik, dan angka di layar tetap 0.
        // Nilainya benar-benar 2, hanya tidak digambar ulang.
        `,
        { caption: 'Diukur sungguhan. Nilai tersimpan, tampilan diam.' },
      ),
      p(
        'Ini kesalahan `ref` yang paling sering dan paling membingungkan, sebab tidak ada yang rusak. Nilainya benar, kodenya benar, dan hanya penggambarannya yang tidak pernah dipicu. Gejalanya khas, yaitu angkanya tiba-tiba melompat ke nilai yang benar saat pengguna mengklik hal lain yang kebetulan mengubah state. Kalau nilainya ditampilkan, ia harus berupa state.',
      ),
      code(
        'text',
        `
        const ref = useRef<HTMLInputElement>(null);
        ref.current.focus();      // dipanggil di badan komponen

        TypeError: Cannot read properties of null (reading 'focus')
        `,
        { caption: '`ref` belum terisi saat badan komponen berjalan.' },
      ),
      p(
        'React mengisi `ref` setelah komponennya terpasang di DOM, dan badan komponen berjalan sebelum itu. Perbaikannya memindahkan pemanggilannya ke dalam efek. Yang harus dihindari adalah tanda seru untuk memaksa TypeScript diam, sebab itu mengubah error yang jelas menjadi kegagalan saat berjalan di tempat yang lebih sulit ditelusuri.',
      ),
      code(
        'text',
        `
        const ref = useRef<HTMLInputElement>();   // tanpa nilai awal
        <input ref={ref} />

        error TS2322: Type 'MutableRefObject<HTMLInputElement | undefined>'
        is not assignable to type 'Ref<HTMLInputElement>'.
        `,
        { caption: 'Nilai awal tidak diberikan, sehingga tipenya menyertakan `undefined`.' },
      ),
      p(
        'Perbedaan antara `useRef<T>(null)` dan `useRef<T>()` menghasilkan dua tipe yang berbeda, dan hanya yang pertama cocok untuk dipasang ke atribut `ref`. Aturan praktisnya, kalau `ref` akan dipasang ke elemen, selalu beri nilai awal `null`. Kalau ia menyimpan nilai biasa seperti id timer, nilai awal lain barulah masuk akal.',
      ),
      code(
        'text',
        `
        function Kartu({ n }: { n: number }) {
          const ref = useRef(0);
          ref.current = n;          // ditulis SELAMA render
          return <div>{ref.current}</div>;
        }

        error  Ref values may not be written during render.
        `,
        { caption: '`ref` ditulis di badan komponen.' },
      ),
      p(
        'Render harus murni, yaitu menghasilkan hal yang sama untuk masukan yang sama tanpa efek samping. Menulis `ref` selama render melanggar itu, dan akibatnya nyata di `StrictMode` yang menjalankan render dua kali. Aturan lint React Compiler di project ini menandainya. Tulis `ref` di dalam efek atau di dalam penangan peristiwa.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Nilai berubah tapi layar diam',
            '`ref` tidak memicu penggambaran ulang',
            'Kalau nilainya ditampilkan, pakai state',
          ],
          [
            '`Cannot read properties of null` pada `ref.current`',
            '`ref` belum terisi saat badan komponen berjalan',
            'Baca di dalam efek atau penangan, dan pakai `?.`',
          ],
          [
            '`MutableRefObject<... | undefined> is not assignable`',
            '`useRef` dipanggil tanpa nilai awal',
            'Beri `null` untuk `ref` yang dipasang ke elemen',
          ],
          [
            '`Ref values may not be written during render`',
            '`ref` ditulis di badan komponen',
            'Tulis di dalam efek atau penangan peristiwa',
          ],
          [
            'Halaman tersendat saat nilai berubah sangat sering',
            'Seluruh perubahan disimpan sebagai state',
            'Simpan di `ref`, dan salin ke state secara berkala untuk ditampilkan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        '`useRef` sering dipakai sebagai jalan pintas untuk menghindari penggambaran ulang, dan itu justru yang membuatnya sering salah tempat.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan nilai yang ditampilkan di `ref`',
            'Supaya tidak memicu render',
            'Layar tidak pernah menunjukkan perubahannya. Nilai yang ditampilkan harus berupa state',
          ],
          [
            'Membaca `ref.current` di badan komponen',
            'Nilainya kan sudah ada',
            'Ia baru terisi setelah komponen terpasang. Baca di dalam efek',
          ],
          [
            'Memakai tanda seru untuk menghilangkan peringatan null',
            'Elemennya pasti ada',
            'Ia pasti ada setelah terpasang, dan belum sebelum itu. Tanda seru memindahkan kegagalan ke waktu berjalan',
          ],
          [
            'Menulis `ref` selama render',
            'Lebih dekat dengan tempat nilainya tersedia',
            'Melanggar kemurnian render, dan berperilaku aneh di `StrictMode`',
          ],
          [
            'Memakai `ref` untuk menghindari aturan dependensi efek',
            'Supaya efeknya tidak berjalan terus',
            'Ini menyembunyikan nilai basi alih-alih memperbaikinya. Perbaiki dependensinya',
          ],
          [
            'Memakai `ref` untuk seluruh interaksi DOM',
            'Itu cara yang sudah dikuasai dari Bab 4 Frontend Basic',
            'Sebagian besar bisa lewat state dan kelas. Sisakan `ref` untuk fokus, media, pengukuran, dan pustaka non-React',
          ],
        ],
      ),
      p(
        'Baris kelima layak diwaspadai karena ia terlihat seperti teknik yang cerdas. Menyimpan nilai di `ref` supaya tidak perlu masuk daftar dependensi memang menghentikan efek yang berjalan terus, dan sekaligus membuat efeknya memakai nilai yang bisa basi. Kalau efeknya memang harus memakai nilai terbaru, perbaiki dependensinya. `ref` untuk itu hanya tepat pada kasus khusus seperti penangan yang tidak boleh memicu pemasangan ulang.',
      ),
      callout(
        'tip',
        'Satu pertanyaan untuk memilih antara `ref` dan state',
        'Apakah nilainya muncul di layar. Kalau ya, ia state. Kalau tidak, misalnya id timer, elemen DOM, nilai sebelumnya untuk perbandingan, atau penghitung internal, `ref` adalah tempatnya. Pertanyaan sepuluh detik itu menutup hampir seluruh kesalahan di sub-bab ini.',
      ),
      references(
        {
          label: 'useRef',
          href: 'https://react.dev/reference/react/useRef',
          source: 'React',
          note: 'Rujukan API, termasuk larangan membaca atau menulis `.current` saat render.',
        },
        {
          label: 'Referencing Values with Refs',
          href: 'https://react.dev/learn/referencing-values-with-refs',
          source: 'React',
          note: 'Perbedaan ref dan state, serta kapan sebuah nilai memang tidak perlu memicu render.',
        },
        {
          label: 'Manipulating the DOM with Refs',
          href: 'https://react.dev/learn/manipulating-the-dom-with-refs',
          source: 'React',
          note: 'Pola akses DOM yang aman, termasuk callback ref dan cleanup-nya.',
        },
        {
          label: 'Optional chaining (?.)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining',
          source: 'MDN Web Docs',
          note: 'Operator yang membuat `inputRef.current?.focus()` aman saat ref masih `null`.',
        },
      ),
    ],
  ),

  written(
    'usememo-usecallback',
    '`useMemo` & `useCallback` di era React Compiler',
    21,
    'Optimasi yang sekarang lebih sering otomatis.',
    [
      p(
        'Selama bertahun-tahun, `useMemo` dan `useCallback` ditaburkan di mana-mana "untuk berjaga-jaga". React Compiler mengubah situasinya secara mendasar — dan di project yang mengaktifkannya, memoization manual yang tidak perlu justru menjadi **error lint**.',
      ),

      terms(
        {
          term: 'memoization (memoization)',
          meaning:
            'Dibaca "memoaizeisyen". Menyimpan hasil sebuah perhitungan supaya tidak perlu dihitung ulang selama masukannya belum berubah. Namanya dari *memo* — catatan pengingat. Di React, yang "diingat" bukan cuma angka: bisa hasil pengurutan, sebuah fungsi, bahkan potongan JSX.',
        },
        {
          term: 'useMemo',
          meaning:
            'Hook yang menyimpan **hasil** sebuah perhitungan. `useMemo(() => items.sort(bandingkan), [items])` berarti "jalankan pengurutannya lagi hanya kalau `items` berubah". Fungsi di dalamnya dijalankan saat render, jadi ia tidak boleh punya efek samping.',
        },
        {
          term: 'useCallback',
          meaning:
            'Hook yang menyimpan **referensi sebuah fungsi**, agar identitasnya tidak berubah tiap render. Secara teknis `useCallback(fn, deps)` sama persis dengan `useMemo(() => fn, deps)` — ia ada semata karena membungkus fungsi adalah kasus yang sangat sering muncul.',
        },
        {
          term: 'referensi fungsi',
          meaning:
            'Setiap kali komponen dirender, `function tangani() {}` di dalamnya menghasilkan objek fungsi **baru** — isinya sama, tapi identitasnya berbeda menurut `Object.is`. Inilah alasan fungsi sebagai dependency Effect atau prop `React.memo` bisa membuat semuanya jalan ulang tanpa alasan nyata.',
        },
        {
          term: 'React Compiler',
          meaning:
            'Alat yang membaca komponenmu **saat build** lalu menyisipkan memoization otomatis — pada nilai, fungsi, dan elemen JSX. Hasilnya sering lebih baik daripada memoization manual, karena ia melihat seluruh komponen sekaligus dan tidak pernah lupa memperbarui dependency.',
        },
        {
          term: 'error lint',
          meaning:
            'Di project ini, `useMemo` yang tidak bisa dipertahankan Compiler dan `setState` di dalam Effect berstatus **error**, bukan peringatan — artinya build berhenti. Ini disengaja: keduanya membuat Compiler tidak bisa memprediksi kapan sebuah nilai berubah. Perbaiki polanya, jangan matikan aturannya.',
        },
        {
          term: 'React DevTools Profiler',
          meaning:
            'Tab di ekstensi React DevTools yang merekam render sungguhan: komponen mana yang render, berapa kali, dan berapa lama. Ini alat yang mengubah "sepertinya lambat" menjadi angka. Optimasi tanpa data darinya adalah tebakan.',
        },
        {
          term: 'React.memo',
          meaning:
            'Berbeda dari dua hook di atas. Ia membungkus **komponen** agar tidak melakukan re-render saat props-nya tidak berubah (dibandingkan dangkal). Compiler tidak sepenuhnya menggantikannya — tapi aturannya sama: pasang setelah profiler menunjukkan masalahnya, bukan sebelumnya.',
        },
      ),

      h2('Apa yang keduanya lakukan'),
      code(
        'tsx',
        `
        // Menyimpan hasil perhitungan
        const terurut = useMemo(() => items.sort(bandingkan), [items]);

        // Menyimpan referensi fungsi
        const tangani = useCallback((id: string) => hapus(id), [hapus]);

        // useCallback(fn, deps) sama dengan useMemo(() => fn, deps)
        `,
      ),
      p(
        'Komentar terakhir menyingkap sesuatu yang sering dianggap dua hal terpisah, yaitu **`useCallback` sebenarnya `useMemo` yang mengingat sebuah fungsi.** Ia ada karena kasusnya cukup sering sehingga layak diberi nama sendiri, bukan karena mekanismenya berbeda. Bedanya hanya pada apa yang kamu tulis, sebab `useMemo(() => hitung(), deps)` mengingat **hasil** pemanggilan, sedangkan `useCallback(fn, deps)` mengingat **fungsinya sendiri** tanpa memanggilnya. Itu sebabnya `useCallback` menerima fungsi langsung sebagai argumen pertama, sementara `useMemo` menerima fungsi yang mengembalikan nilai. Salah menukar keduanya menghasilkan bug yang membingungkan, sebab `useMemo(fn, deps)` akan menyimpan fungsi itu sebagai nilai, bukan menjalankannya.',
      ),

      h2('Apa yang React Compiler kerjakan'),
      p(
        'Compiler menganalisis komponenmu saat build dan menyisipkan memoization secara otomatis — pada nilai, pada fungsi, dan pada elemen JSX. Hasilnya sering lebih baik daripada memoization manual, karena ia bisa melihat seluruh komponen sekaligus dan tidak lupa memperbarui dependency.',
      ),
      compare(
        {
          title: 'Ditulis tangan',
          lang: 'tsx',
          code: `
          const terurut = useMemo(
            () => items.sort(bandingkan),
            [items],
          );

          const tangani = useCallback(
            (id) => hapus(id),
            [hapus],
          );
          `,
          notes: ['Dependency harus dijaga manual', 'Mudah tertinggal saat kode berubah'],
        },
        {
          title: 'Dengan React Compiler',
          lang: 'tsx',
          code: `
          const terurut = items.sort(bandingkan);

          function tangani(id) {
            hapus(id);
          }
          `,
          notes: [
            'Compiler menyisipkan memoization yang setara',
            'Tidak ada dependency untuk lupa',
          ],
        },
      ),
      p(
        'Catatan kedua di kolom kiri menyebut biaya yang paling sering terwujud, yaitu **dependency yang tertinggal saat kode berubah.** Array `[items]` benar hari ini, tetapi begitu isi `useMemo` ditambah memakai variabel lain dan array-nya lupa diperbarui, hasilnya nilai basi, yaitu bug yang tidak menghasilkan error dan hanya muncul pada urutan aksi tertentu. Compiler tidak punya masalah itu karena ia membaca isi fungsinya dan menyimpulkan dependensinya sendiri, setiap kali kamu build. Satu catatan penting yang tidak terlihat di perbandingan ini, `items.sort(...)` **mengubah array aslinya**, sehingga sesuai aturan mutasi dari Bab 1 versi yang benar-benar aman memakai `toSorted`. Compiler mengoptimalkan apa yang kamu tulis, dan ia tidak memperbaiki kode yang keliru.',
      ),

      h2('Kenapa memoization manual bisa jadi error'),
      callout(
        'danger',
        'Aturan di project ini',
        'Website yang sedang kamu baca mengaktifkan React Compiler, dan `useMemo` yang tidak bisa dipertahankan Compiler adalah **error lint**, bukan peringatan. Begitu juga `setState` di dalam Effect. Keduanya disengaja: Compiler perlu bisa memprediksi kapan sebuah nilai berubah, dan pola-pola itu membuat prediksinya mustahil. Perbaiki polanya — jangan matikan aturannya.',
      ),

      h2('Kapan memoization manual masih diperlukan'),
      p(
        'Compiler tidak menghapus kebutuhan untuk berpikir. Tiga kasus ini masih membutuhkan `useMemo` eksplisit:',
      ),
      ol(
        '**Perhitungan yang benar-benar berat** — mengurutkan puluhan ribu baris, memfilter dataset besar, memparsing teks panjang. Compiler memoization berdasarkan struktur, bukan berdasarkan biaya.',
        '**Nilai yang dipakai sebagai dependency Effect**, ketika stabilitasnya menentukan apakah Effect jalan ulang.',
        '**Project yang belum mengaktifkan Compiler.** Ini masih mayoritas kode React yang ada di dunia.',
      ),

      h2('Cara mengukur, bukan menebak'),
      code(
        'tsx',
        `
        // React DevTools Profiler menunjukkan komponen mana yang benar-benar
        // sering render dan berapa lama. Optimasi tanpa data ini adalah tebakan.
        `,
      ),
      p(
        'Aturan lamanya tetap berlaku: **ukur dulu**. Memoization bukan gratis — ia menyimpan nilai di memori dan menambah perbandingan di setiap render. Memoization yang tidak perlu membuat kode lebih lambat *dan* lebih sulit dibaca sekaligus.',
      ),
      callout(
        'info',
        '`React.memo` berbeda dan masih relevan',
        '`React.memo` membungkus komponen agar tidak melakukan re-render saat props-nya tidak berubah. Compiler tidak sepenuhnya menggantikannya, terutama untuk komponen berat yang menerima props stabil. Tapi sama seperti di atas: pasang setelah profiler menunjukkan masalahnya, bukan sebelumnya.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tim menghabiskan dua hari menaburkan `useMemo` dan `useCallback` ke seluruh komponen karena tabel terasa lambat. Setelah selesai, kecepatannya nyaris tidak berubah dan muncul satu bug baru dari daftar dependensi yang tidak lengkap. Pengukuran di Profiler kemudian menunjukkan waktunya habis di satu komponen yang memformat tanggal seribu kali, dan itu satu-satunya yang benar-benar butuh disimpan hasilnya.',
      ),
      p(
        'Keduanya adalah alat pengoptimalan, dan alat pengoptimalan yang dipakai tanpa pengukuran hampir selalu menambah biaya. Berikut biaya yang sering tidak terlihat.',
      ),
      code(
        'tsx',
        `
        // Diukur dengan React 19: dependensi berupa objek literal
        // membuat penyimpanan hasilnya TIDAK PERNAH terpakai.
        function MemoUji({ pemicu }: { pemicu: number }) {
          const opsi = { batas: 10 };              // objek BARU tiap render
          useMemo(() => hitung(), [opsi]);
          return <div>{pemicu}</div>;
        }

        // Hasil: dihitung 3x untuk 3 render.
        // Seluruh biaya useMemo dibayar, dan nol penghematan.
        `,
        { caption: 'Diukur sungguhan. Ini bentuk `useMemo` yang paling sering salah.' },
      ),
      p(
        '`useMemo` sendiri tidak gratis. Ia menyimpan nilai, membandingkan seluruh dependensinya pada tiap render, dan menambah satu slot hook. Untuk perhitungan yang murah, biaya perbandingan itu bisa lebih besar daripada perhitungannya sendiri. Menambahkannya ke mana-mana berarti membayar biaya di seluruh komponen untuk penghematan di beberapa saja.',
      ),
      code(
        'tsx',
        `
        // Kapan useMemo BENAR-BENAR berguna:

        // 1. Perhitungan yang mahal, terukur di Profiler.
        const terurut = useMemo(
          () => barisSangatBanyak.toSorted(bandingkan),   // 10.000 baris
          [barisSangatBanyak, bandingkan],
        );

        // 2. Menjaga IDENTITAS object yang menjadi dependensi efek.
        //    Ini bukan soal kecepatan, melainkan soal kebenaran.
        const opsi = useMemo(() => ({ batas, urut }), [batas, urut]);
        useEffect(() => { ambil(opsi); }, [opsi]);   // efek tidak berjalan terus

        // 3. Nilai konteks, supaya pembacanya tidak digambar ulang tanpa perlu.
        const nilai = useMemo(() => ({ pengguna, keluar }), [pengguna, keluar]);
        `,
        { caption: 'Kasus kedua sering lebih penting daripada yang pertama.' },
      ),
      p(
        'Kasus kedua layak ditegaskan sebab ia sering dianggap pengoptimalan padahal soal kebenaran. Object yang dibuat baru tiap render membuat efek yang bergantung padanya berjalan terus-menerus, dan itu bukan masalah kecepatan melainkan bug. `useMemo` di sana menstabilkan identitasnya, dan menghapusnya akan merusak fungsinya bukan sekadar memperlambat.',
      ),
      p(
        'Pada project yang mengaktifkan React Compiler termasuk website ini, kasus pertama dan ketiga biasanya ditangani otomatis sehingga menuliskannya sendiri tidak diperlukan. Yang tetap perlu diperhatikan adalah kasus kedua, sebab compiler tidak selalu bisa menyimpulkan bahwa identitas sebuah nilai penting untuk kebenaran, bukan hanya untuk kecepatan.',
      ),
      code(
        'tsx',
        `
        // useCallback adalah useMemo untuk fungsi. Bentuk ini identik:
        const tangani = useCallback(() => kirim(id), [id]);
        const tangani = useMemo(() => () => kirim(id), [id]);

        // Ia hanya berguna kalau fungsinya menjadi:
        // - dependensi efek, atau
        // - prop untuk komponen yang dioptimalkan dengan memo.
        //
        // Untuk penangan onClick biasa, ia TIDAK memberi manfaat apa pun.
        `,
        { caption: 'Fungsi baru tiap render tidak mahal. Yang mahal adalah akibatnya.' },
      ),
      callout(
        'danger',
        'Ukur dulu di Profiler, jangan menebak',
        'Sebagian besar tebakan tentang bagian mana yang lambat ternyata salah, dan cerita di awal sub-bab ini adalah contohnya. Rekam di tab Profiler React DevTools, lihat komponen mana yang benar-benar memakan waktu, lalu perbaiki yang itu saja. Pengoptimalan yang ditaburkan tanpa pengukuran menambah baris, menambah daftar dependensi yang bisa salah, dan hampir tidak mengubah apa pun.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React 19 dan ESLint project ini, dan tiga di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        const opsi = { batas: 10 };
        const hasil = useMemo(() => hitung(opsi), [opsi]);

        # Diukur: dihitung 3x untuk 3 render.
        # Penyimpanan hasilnya tidak pernah terpakai.
        `,
        { caption: 'Diukur sungguhan. Dependensi berupa object literal.' },
      ),
      p(
        'Tidak ada error, dan seluruh biaya `useMemo` dibayar tanpa satu pun penghematan. Ini bentuk yang paling sering salah dan paling sulit dilihat, sebab kodenya terlihat benar. Cara memeriksanya adalah menaruh `console.log` di dalam fungsi yang dibungkus lalu menghitung berapa kali tercetak. Perbaikannya menstabilkan dependensinya, atau menaruh objectnya di dalam fungsi memo.',
      ),
      code(
        'text',
        `
        const total = useMemo(() => a + b, [a, b]);

        # Tidak ada error. Biaya perbandingan dua dependensi
        # lebih besar daripada satu penjumlahan.
        `,
        { caption: 'Pengoptimalan yang biayanya melebihi penghematannya.' },
      ),
      p(
        'Untuk perhitungan semurah penjumlahan, `useMemo` justru memperlambat. Ia menyimpan nilai, membandingkan dua dependensi, dan menambah satu slot hook, semuanya untuk menghindari satu operasi penjumlahan. Aturan praktisnya, jangan membungkus apa pun yang lebih murah daripada membandingkan dependensinya sendiri.',
      ),
      code(
        'text',
        `
        const tangani = useCallback(() => kirim(id), []);   // 'id' tidak disertakan

        warning  React Hook useCallback has a missing dependency: 'id'.
        Either include it or remove the dependency array.
                                            react-hooks/exhaustive-deps
        `,
        { caption: 'Diuji dengan ESLint project ini. Dependensi tidak lengkap.' },
      ),
      p(
        'Ini bug nilai basi yang paling sering datang dari `useCallback`. Fungsi yang disimpan memegang `id` dari render pertama selamanya, sehingga tombolnya selalu mengirim id yang salah setelah pengguna berpindah item. Tidak ada error saat berjalan, dan gejalanya berupa aksi yang mengenai data yang salah. Aturan lint menangkapnya.',
      ),
      code(
        'text',
        `
        const Anak = memo(function Anak({ onKlik }) { ... });

        <Anak onKlik={() => kirim(id)} />   // fungsi baru tiap render

        # memo tidak pernah menolong. Anak digambar ulang terus.
        `,
        { caption: '`memo` dibatalkan oleh prop yang identitasnya berubah.' },
      ),
      p(
        'Ini pasangan kesalahan yang sering terjadi bersamaan, yaitu membungkus anak dengan `memo` lalu mengirimkan fungsi baru sebagai prop. `memo` membandingkan props dengan `Object.is`, dan fungsi panah baru selalu berbeda. Hasilnya biaya perbandingan `memo` dibayar tanpa satu pun penghematan. Perbaikannya membungkus fungsinya dengan `useCallback`, atau pada project dengan React Compiler membiarkan compiler yang mengurusnya.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Nilai dihitung ulang tiap render walau dibungkus `useMemo`',
            'Dependensinya object atau array literal',
            'Stabilkan dependensinya, atau pindahkan objectnya ke dalam fungsi memo',
          ],
          [
            'Pengoptimalan tidak mengubah apa pun',
            'Perhitungannya lebih murah daripada perbandingannya',
            'Hapus pembungkusnya, dan ukur di Profiler sebelum menambah',
          ],
          [
            'Fungsi memakai nilai dari render lama',
            'Dependensi `useCallback` tidak lengkap',
            'Sertakan seluruh nilai yang dipakai di dalamnya',
          ],
          [
            '`memo` tidak mencegah penggambaran ulang',
            'Ada prop berupa fungsi atau object baru tiap render',
            'Stabilkan propnya, atau andalkan React Compiler',
          ],
          [
            'Efek berjalan terus setelah `useMemo` dihapus',
            '`useMemo` itu untuk kebenaran, bukan kecepatan',
            'Kembalikan, sebab ia menstabilkan identitas dependensi efek',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kedua hook ini adalah yang paling sering dipakai tanpa alasan, dan pada project dengan React Compiler sebagian besarnya sudah tidak diperlukan sama sekali.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaburkan keduanya ke seluruh komponen',
            'Semakin sedikit perhitungan semakin baik',
            'Biaya perbandingan dibayar di mana-mana untuk penghematan di beberapa tempat saja, plus daftar dependensi yang bisa salah',
          ],
          [
            'Membungkus perhitungan murah',
            'Tidak ada ruginya',
            'Ada. Membandingkan dependensi lebih mahal daripada menjumlahkan dua angka',
          ],
          [
            'Memakai `useCallback` untuk penangan `onClick` biasa',
            'Fungsinya kan dibuat ulang tiap render',
            'Membuat fungsi sangat murah. Ia hanya berguna kalau fungsinya menjadi dependensi efek atau prop komponen yang dioptimalkan',
          ],
          [
            'Membungkus dengan `memo` tanpa menstabilkan propsnya',
            'Anaknya jadi tidak digambar ulang',
            'Satu prop berupa fungsi atau object baru sudah cukup membatalkan seluruh manfaatnya',
          ],
          [
            'Menghapus seluruh `useMemo` setelah mengaktifkan React Compiler',
            'Compiler menggantikan semuanya',
            'Sebagian ada untuk menjaga identitas dependensi efek, bukan untuk kecepatan. Yang itu tetap diperlukan',
          ],
          [
            'Mengoptimalkan sebelum mengukur',
            'Dugaannya masuk akal',
            'Sebagian besar tebakan salah. Rekam di Profiler lebih dulu',
          ],
        ],
      ),
      p(
        'Baris kelima layak diperiksa satu per satu sebelum menghapus apa pun. Ada `useMemo` yang ada bukan demi kecepatan melainkan demi identitas, misalnya object pengaturan yang menjadi dependensi efek. Menghapusnya membuat efeknya berjalan terus-menerus, dan itu bug bukan sekadar perlambatan. Hapus bertahap, dan perhatikan apakah ada efek yang mulai berjalan lebih sering.',
      ),
      callout(
        'info',
        'React Compiler mengubah kebutuhan ini, dan tidak menghapusnya',
        'Pada project yang mengaktifkannya termasuk website ini, penyimpanan hasil untuk kecepatan biasanya ditangani otomatis sehingga menaburkan `useMemo` menjadi mubazir. Yang tetap perlu ditulis sendiri adalah kasus di mana identitas sebuah nilai penting untuk kebenaran. Periksa lencana di React DevTools untuk melihat komponen mana yang benar-benar dioptimalkan compiler.',
      ),
      references(
        {
          label: 'useMemo',
          href: 'https://react.dev/reference/react/useMemo',
          source: 'React',
          note: 'Termasuk bagian resmi "should you add useMemo everywhere?" — jawabannya tidak.',
        },
        {
          label: 'useCallback',
          href: 'https://react.dev/reference/react/useCallback',
          source: 'React',
          note: 'Kapan identitas fungsi benar-benar penting, dan kapan membungkusnya cuma menambah kerumitan.',
        },
        {
          label: 'React Compiler',
          href: 'https://react.dev/learn/react-compiler',
          source: 'React',
          note: 'Cara compiler menyisipkan memoization otomatis dan apa yang masih perlu ditulis tangan.',
        },
        {
          label: 'memo',
          href: 'https://react.dev/reference/react/memo',
          source: 'React',
          note: 'Memoization pada level komponen — berbeda dari dua hook di atas.',
        },
      ),
    ],
  ),

  written('usecontext', '`useContext`', 19, 'Membaca nilai dari provider terdekat.', [
    p(
      '`useContext` membaca nilai dari `Provider` terdekat di atasnya. Bab 5 sudah membahas kapan Context tepat dipakai; sub-bab ini fokus pada mekanika hook-nya dan hal-hal yang mengejutkan saat memakainya.',
    ),

    terms(
      {
        term: 'context',
        meaning:
          'Dibaca "kontek(s)", artinya **konteks**. Cara React mengirim sebuah nilai ke seluruh komponen di bawahnya tanpa mengoper prop satu per satu di tiap lapisan. Bayangkan pengumuman lewat pengeras suara: siapa pun di dalam ruangan bisa mendengarnya tanpa harus dibisiki berantai.',
      },
      {
        term: 'Provider / penyedia',
        meaning:
          'Komponen yang **menyediakan** nilainya, ditulis `<Konteks value={...}>`. Semua komponen di dalamnya bisa membaca nilai itu. Sejak React 19 kamu bisa menulis `<Konteks value=...>` langsung tanpa `.Provider`.',
      },
      {
        term: 'createContext',
        meaning:
          'Fungsi yang membuat "saluran" context-nya. Argumennya adalah nilai default — dipakai hanya kalau sebuah komponen membaca context tanpa ada Provider di atasnya. Di pola ini kita sengaja memberi `null` supaya kasus itu fail loudly, bukan diam-diam salah.',
      },
      {
        term: 'nilai default',
        meaning:
          'Argumen `createContext(...)`. Godaan terbesarnya adalah mengisinya dengan objek palsu supaya "aman". Justru sebaliknya: objek palsu membuat komponen yang lupa dipasang Provider tetap berjalan dengan nilai salah — bug diam yang sulit dilacak.',
      },
      {
        term: 'custom hook pembungkus',
        meaning:
          'Fungsi seperti `useSidebar()` yang memanggil `useContext` lalu memeriksa hasilnya. Ia menyembunyikan objek context-nya sehingga tak seorang pun bisa memakai `useContext` mentah dan melewati pengecekan — pola yang membuat kesalahan pemakaian mustahil, bukan sekadar tidak dianjurkan.',
      },
      {
        term: 'fail loudly',
        meaning:
          'Melempar error dengan pesan jelas begitu keadaan yang mustahil terjadi, alih-alih melanjutkan dengan nilai cadangan. Yang membaca pesannya sedang bingung — jadi sebutkan persis nama hook dan Provider yang harus dipasang.',
      },
      {
        term: 'provider terdekat',
        meaning:
          'Kalau ada dua Provider bersarang untuk context yang sama, komponen membaca nilai dari yang **paling dekat di atasnya**. Sifat ini berguna: satu bagian halaman bisa memakai tema berbeda tanpa memengaruhi sisanya.',
      },
      {
        term: 'Client Component',
        meaning:
          'Komponen yang filenya diawali `"use client"` dan ikut dikirim ke browser. Context adalah fitur klien — `createContext` dan `useContext` tidak bisa dipakai di Server Component. Tapi Provider klien **tetap boleh membungkus** konten server lewat `children`, dan konten itu tidak ikut ke bundle browser.',
      },
    ),

    h2('Pola lengkap yang layak disalin'),
    code(
      'tsx',
      `
        'use client';

        import { createContext, useContext, useState } from 'react';

        type NilaiSidebar = { terbuka: boolean; alihkan: () => void };

        const Konteks = createContext<NilaiSidebar | null>(null);

        export function PenyediaSidebar({ children }: { children: React.ReactNode }) {
          const [terbuka, setTerbuka] = useState(false);
          const alihkan = () => setTerbuka((t) => !t);

          return <Konteks value={{ terbuka, alihkan }}>{children}</Konteks>;
        }

        export function useSidebar() {
          const nilai = useContext(Konteks);
          if (nilai === null) {
            throw new Error('useSidebar harus dipakai di dalam <PenyediaSidebar>');
          }
          return nilai;
        }
        `,
      { filename: 'src/context/sidebar.tsx' },
    ),
    p('Tiga keputusan di kode itu, semuanya disengaja:'),
    ol(
      '**Nilai awal `null`, bukan objek palsu.** Objek palsu membuat komponen yang lupa dipasang Provider tetap berjalan dengan nilai yang salah — bug diam. `null` membuatnya fail loudly.',
      '**Context tidak diekspor.** Hanya Provider dan hook-nya. Ini mencegah orang lain memakai `useContext` mentah dan melewati pengecekannya.',
      '**Pesan error menyebut nama hook dan Provider-nya.** Yang membacanya sedang panik; beri tahu persis apa yang harus dipasang.',
    ),

    h2('Provider terdekat yang menang'),
    code(
      'tsx',
      `
        <KonteksTema value="gelap">
          <A />                      {/* membaca "gelap" */}

          <KonteksTema value="terang">
            <B />                    {/* membaca "terang" */}
          </KonteksTema>
        </KonteksTema>
        `,
    ),
    p(
      'Sifat bersarang ini berguna: satu bagian halaman bisa memakai tema berbeda tanpa memengaruhi sisanya.',
    ),

    h2('Yang paling sering ditanyakan'),
    callout(
      'warning',
      'Provider TIDAK bisa membaca context-nya sendiri',
      'Komponen yang memasang `<KonteksTema value=...>` berada **di luar** provider itu menurut React. Kalau ia memanggil `useContext(KonteksTema)`, ia akan mendapat nilai default atau nilai dari provider di atasnya, bukan yang baru saja ia pasang.',
    ),

    h2('Context dan Server Component'),
    p(
      'Context adalah fitur klien. `createContext` dan `useContext` tidak bisa dipakai di Server Component — file yang memuatnya wajib punya `"use client"`.',
    ),
    code(
      'tsx',
      `
        // app/layout.tsx — Server Component
        export default function Layout({ children }) {
          return (
            <html>
              <body>
                {/* Provider adalah Client Component, */}
                {/* tapi children-nya tetap dirender di server. */}
                <PenyediaSidebar>{children}</PenyediaSidebar>
              </body>
            </html>
          );
        }
        `,
    ),
    p(
      'Ini penerapan pola `children` dari Bab 6: Provider klien membungkus konten server tanpa menyeret konten itu ke bundle browser.',
    ),

    h2('Ingat biayanya'),
    p(
      'Setiap konsumen di-render ulang saat nilai context berubah, tanpa selector. Untuk nilai yang berubah sering, pecah context-nya berdasarkan frekuensi perubahan atau pindah ke store dengan selector — alasan lengkapnya ada di Bab 5.',
    ),
    divider,
    h2('Studi kasus di project nyata'),
    p(
      'Tema terang dan gelap disimpan di konteks yang dibaca lima puluh komponen. Setelah dipasang, mengetik satu huruf di kotak pencarian membuat seluruh halaman digambar ulang. Penyebabnya bukan pencariannya melainkan nilai konteks yang berupa object literal, sehingga setiap render penyedianya membuat object baru dan seluruh pembacanya menganggap nilainya berubah.',
    ),
    p(
      'Konteks membandingkan nilainya dengan `Object.is`, yaitu perbandingan rujukan. Ini konsekuensi yang sama dengan dependensi efek, muncul dalam bentuk yang dampaknya jauh lebih luas.',
    ),
    code(
      'tsx',
      `
        // SALAH: object baru tiap render penyedianya.
        function PenyediaTema({ children }: { children: ReactNode }) {
          const [tema, setTema] = useState<'terang' | 'gelap'>('terang');
          return (
            <KonteksTema.Provider value={{ tema, setTema }}>
              {children}
            </KonteksTema.Provider>
          );
        }

        // BENAR: identitasnya stabil selama nilainya tidak berubah.
        function PenyediaTema({ children }: { children: ReactNode }) {
          const [tema, setTema] = useState<'terang' | 'gelap'>('terang');
          const nilai = useMemo(() => ({ tema, setTema }), [tema]);
          return <KonteksTema.Provider value={nilai}>{children}</KonteksTema.Provider>;
        }
        `,
      { caption: 'Setter dari `useState` sudah stabil, jadi tidak perlu di dependensi.' },
    ),
    p(
      'Fungsi `setTema` dari `useState` dijamin stabil oleh React, yaitu rujukannya sama sepanjang hidup komponen. Karena itu ia tidak perlu masuk daftar dependensi, dan aturan lint pun tahu itu. Yang perlu masuk hanya `tema`. Ini berbeda dari fungsi yang kamu tulis sendiri, yang identitasnya berubah tiap render kecuali dibungkus.',
    ),
    code(
      'tsx',
      `
        // Memisahkan konteks yang berubah sering dari yang jarang.
        // Pembaca yang hanya butuh 'keluar' tidak ikut digambar ulang
        // saat 'pengguna' berubah.
        const KonteksPengguna = createContext<Pengguna | null>(null);
        const KonteksAksi = createContext<{ keluar: () => void } | null>(null);

        function PenyediaAuth({ children }: { children: ReactNode }) {
          const [pengguna, setPengguna] = useState<Pengguna | null>(null);

          // Aksi tidak pernah berubah, jadi dependensinya kosong.
          const aksi = useMemo(() => ({
            keluar: () => { hapusSesi(); setPengguna(null); },
          }), []);

          return (
            <KonteksAksi.Provider value={aksi}>
              <KonteksPengguna.Provider value={pengguna}>
                {children}
              </KonteksPengguna.Provider>
            </KonteksAksi.Provider>
          );
        }
        `,
      { filename: 'src/auth/PenyediaAuth.tsx' },
    ),
    p(
      'Memisahkan menjadi dua konteks adalah pengoptimalan yang sering menentukan pada aplikasi besar. Tombol Keluar di bilah navigasi hanya butuh fungsinya, dan tanpa pemisahan ia akan digambar ulang setiap kali data pengguna disegarkan. Dengan pemisahan, ia membaca konteks yang nilainya tidak pernah berubah sehingga tidak pernah ikut digambar ulang.',
    ),
    code(
      'tsx',
      `
        // Fungsi pembaca dengan penjaga, supaya pesannya berguna.
        export function pakaiTema() {
          const konteks = useContext(KonteksTema);
          if (!konteks) throw new Error('pakaiTema harus dipakai di dalam <PenyediaTema>');
          return konteks;
        }
        `,
      { caption: 'Konteks tanpa penyedia mengembalikan nilai bawaan, bukan error.' },
    ),
    p(
      'Diuji dengan React 19, `useContext` pada konteks yang tidak punya penyedia mengembalikan **nilai bawaan** yang diberikan saat `createContext`, bukan melempar. Kalau bawaannya `undefined`, yang kamu dapat adalah `undefined` dan errornya baru muncul jauh kemudian saat propertinya dibaca. Penjaga di fungsi pembaca mengubah itu menjadi pesan yang langsung menyebut penyebabnya.',
    ),
    callout(
      'warning',
      'Konteks bukan pengganti pustaka state',
      'Setiap pembaca konteks digambar ulang saat nilainya berubah, tanpa cara memilih hanya bagian yang ia pakai. Untuk nilai yang jarang berubah seperti tema dan pengguna, itu tidak masalah. Untuk state yang berubah sering dan dibaca banyak komponen, pustaka state yang mendukung pemilihan bagian jauh lebih tepat, dan itu dibahas di bab berikutnya.',
    ),

    h2('Saat error-nya muncul'),
    p(
      'Empat kegagalan berikut diuji dengan React 19, dan dua di antaranya tidak melempar apa pun.',
    ),
    code(
      'text',
      `
        const C = createContext(undefined);
        function K() { const v = useContext(C); return <div>{String(v)}</div>; }

        # Diuji: dirender sebagai <div>undefined</div>. TIDAK melempar.
        `,
      { caption: 'Diuji sungguhan. Konteks tanpa penyedia mengembalikan nilai bawaan.' },
    ),
    p(
      'Inilah kenapa penjaga di fungsi pembaca penting. Tanpa penyedia, nilainya `undefined` dan komponennya tetap dirender. Error baru muncul jauh kemudian saat ada yang menulis `konteks.tema`, dan pesannya berbunyi `Cannot read properties of undefined` tanpa menyebut konteks apa pun. Penjaga mengubahnya menjadi pesan yang langsung menunjuk penyedianya yang hilang.',
    ),
    code(
      'text',
      `
        <KonteksTema.Provider value={{ tema, setTema }}>

        # Tidak ada error. Seluruh pembaca konteks digambar ulang
        # tiap kali penyedianya digambar ulang, walau tema tidak berubah.
        `,
      { caption: 'Nilai konteks berupa object literal baru tiap render.' },
    ),
    p(
      'Untuk konteks dengan lima pembaca, dampaknya kecil. Untuk lima puluh pembaca yang tersebar di seluruh halaman, ini penyebab kelambatan yang sulit ditelusuri sebab tidak ada satu pun tanda. Cara menemukannya adalah menyalakan Highlight updates di React DevTools, dan kalau seluruh halaman berkedip untuk perubahan yang tidak berhubungan, periksa nilai konteksnya.',
    ),
    code(
      'text',
      `
        const C = createContext<Tema | null>(null);
        function K() {
          const { tema } = useContext(C);
        }

        TypeError: Cannot destructure property 'tema' of 'useContext(...)' as it is null.
        `,
      { caption: 'Nilai bawaan `null` dibongkar tanpa diperiksa.' },
    ),
    p(
      'Pesannya menyebut pembongkaran yang gagal dan sama sekali tidak menyebut penyedia yang hilang. Untuk konteks yang dibaca di puluhan tempat, menelusuri dari pesan ini memakan waktu. Fungsi pembaca dengan penjaga menyelesaikannya sekali untuk seluruh pemakai, dan itu satu baris pemeriksaan.',
    ),
    code(
      'text',
      `
        <PenyediaTema>
          <Halaman />
        </PenyediaTema>

        # Halaman memakai pakaiTema(). Bekerja.
        # Lalu ada yang memakainya di komponen di LUAR penyedia:
        Error: pakaiTema harus dipakai di dalam <PenyediaTema>
        `,
      { caption: 'Penjaga memberi pesan yang menyebut apa yang harus diperbaiki.' },
    ),
    p(
      'Bandingkan pesan ini dengan `Cannot destructure property` dari contoh sebelumnya. Keduanya menandai masalah yang sama persis, dan hanya yang ini yang memberi tahu apa yang harus dilakukan. Menulis penjaga di setiap fungsi pembaca konteks adalah kebiasaan yang biayanya satu baris dan manfaatnya terasa setiap kali ada yang salah pakai.',
    ),
    table(
      ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
      [
        [
          'Nilai konteks `undefined` tanpa error',
          'Tidak ada penyedia, dan bawaannya `undefined`',
          'Tulis penjaga di fungsi pembaca',
        ],
        [
          'Seluruh halaman digambar ulang untuk perubahan kecil',
          'Nilai konteks berupa object literal baru tiap render',
          'Bungkus dengan `useMemo`',
        ],
        [
          '`Cannot destructure property ... as it is null`',
          'Nilai bawaan `null` dibongkar tanpa diperiksa',
          'Pakai fungsi pembaca dengan penjaga',
        ],
        [
          'Komponen yang hanya butuh aksi ikut digambar ulang',
          'Data dan aksi berada di konteks yang sama',
          'Pisahkan menjadi dua konteks',
        ],
        [
          'Konteks terasa lambat pada state yang sering berubah',
          'Setiap pembaca digambar ulang tanpa bisa memilih bagian',
          'Pakai pustaka state yang mendukung pemilihan bagian',
        ],
      ],
    ),

    h2('Kesalahan umum pemula'),
    p(
      'Konteks menyelesaikan masalah props berantai dan sering dipakai untuk masalah yang bukan itu.',
    ),
    table(
      ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
      [
        [
          'Memberikan object literal sebagai nilai konteks',
          'Nilainya kan sama',
          'Rujukannya baru tiap render, sehingga seluruh pembaca digambar ulang',
        ],
        [
          'Menaruh seluruh state aplikasi di satu konteks',
          'Satu tempat untuk semuanya',
          'Setiap perubahan apa pun menggambar ulang seluruh pembacanya. Pisahkan per kebutuhan',
        ],
        [
          'Memakai konteks untuk state yang dibagi dua komponen bersebelahan',
          'Supaya tidak perlu meneruskan props',
          'Mengangkat state ke induk bersama lebih sederhana dan lebih mudah ditelusuri',
        ],
        [
          'Tidak menulis penjaga di fungsi pembaca',
          'Penyedianya kan selalu ada',
          'Sampai ada yang memakainya di luar, dan pesan errornya tidak menyebut penyedia sama sekali',
        ],
        [
          'Memakai konteks sebagai pengganti pustaka state',
          'Ia sudah bawaan React',
          'Tidak ada cara memilih hanya bagian yang dipakai, sehingga seluruh pembaca ikut digambar ulang',
        ],
        [
          'Memberikan nilai bawaan yang terlihat sah saat `createContext`',
          'Supaya tidak `undefined`',
          'Komponen tanpa penyedia jadi bekerja dengan nilai palsu, dan bugnya tersembunyi. Pakai `null` lalu tulis penjaga',
        ],
      ],
    ),
    p(
      "Baris terakhir sering diambil dengan niat baik dan hasilnya justru menyembunyikan bug. Memberi bawaan `{ tema: 'terang', setTema: () => {} }` membuat komponen yang lupa dibungkus penyedia tetap berjalan, dengan setter yang tidak melakukan apa-apa. Gejalanya berupa tombol yang tidak berfungsi tanpa satu pun error. Pakai `null` sebagai bawaan, dan biarkan penjaga yang berteriak.",
    ),
    callout(
      'tip',
      'Pola tiga bagian untuk setiap konteks',
      'Buat konteksnya dengan bawaan `null` dan jangan diekspor. Buat komponen penyedianya yang membungkus nilainya dengan `useMemo`. Buat fungsi pembaca berawalan `pakai` atau `use` yang memuat penjaga. Ekspor hanya dua yang terakhir. Pola itu menutup seluruh kesalahan di sub-bab ini sekaligus.',
    ),
    references(
      {
        label: 'useContext',
        href: 'https://react.dev/reference/react/useContext',
        source: 'React',
        note: 'Termasuk catatan bahwa Provider tidak bisa membaca context yang ia pasang sendiri.',
      },
      {
        label: 'createContext',
        href: 'https://react.dev/reference/react/createContext',
        source: 'React',
        note: 'Arti nilai default dan bentuk `<Konteks value=...>` tanpa `.Provider` sejak React 19.',
      },
      {
        label: 'Passing Data Deeply with Context',
        href: 'https://react.dev/learn/passing-data-deeply-with-context',
        source: 'React',
        note: 'Kapan Context tepat dipakai, dan alternatif yang sebaiknya dicoba lebih dulu.',
      },
      {
        label: 'Server and Client Components',
        href: 'https://nextjs.org/docs/app/getting-started/server-and-client-components',
        source: 'Next.js',
        note: 'Kenapa Provider klien tetap boleh membungkus konten server lewat `children`.',
      },
    ),
  ]),

  written('usereducer-hook', '`useReducer`', 22, 'State kompleks dengan transisi yang eksplisit.', [
    p(
      '`useReducer` memindahkan logika perubahan state dari komponen ke satu pure function. Alih-alih memanggil beberapa `setState` yang tersebar, komponen mengirim **aksi** dan reducer memutuskan hasilnya.',
    ),

    terms(
      {
        term: 'reducer',
        meaning:
          'Dibaca "rediuser", artinya **peringkas**. Pure function bertanda tangan `(state, aksi) => stateBaru`. Namanya dari `Array.prototype.reduce`, yang juga meringkas "keadaan sekarang + item berikutnya" menjadi keadaan berikutnya. Ia tidak tahu apa-apa tentang React — cukup dua masukan, satu keluaran.',
      },
      {
        term: 'action (aksi)',
        meaning:
          "Objek yang menggambarkan **apa yang terjadi**, bukan apa yang harus diubah: `{ type: 'gagal', pesan: '...' }`. Bedanya halus tapi penting — komponen melaporkan peristiwa, reducer yang memutuskan akibatnya.",
      },
      {
        term: 'dispatch / kirim',
        meaning:
          'Fungsi kedua yang dikembalikan `useReducer`. Kamu memanggilnya dengan sebuah aksi, dan React menjalankan reducer-nya untuk render berikutnya. Dokumentasi resmi menamainya `dispatch`; di materi ini dinamai `kirim` supaya maksudnya langsung terbaca.',
      },
      {
        term: 'type',
        meaning:
          "Properti wajib pada objek aksi yang menyebut jenis peristiwanya. Ia yang dipakai `switch` di dalam reducer, dan sekaligus yang dipakai TypeScript untuk mempersempit tipe — begitu `aksi.type === 'berhasil'`, TypeScript tahu `aksi.data` pasti ada.",
      },
      {
        term: 'discriminated union',
        meaning:
          'Gabungan beberapa bentuk objek yang dibedakan satu properti penanda — di sini `type`. Inilah yang membuat TypeScript **menolak** kode kamu ketika kamu menambah jenis aksi baru dan lupa menanganinya di `switch`. Itu bukan efek samping; itu alasan utama memakai bentuk ini.',
      },
      {
        term: 'impossible state',
        meaning:
          'Kombinasi state yang secara logika tidak boleh ada — misalnya "sedang memuat" **dan** "gagal" **dan** "data terisi" sekaligus. Tiga `useState` terpisah membiarkan kombinasi itu terjadi; satu field `status` dengan empat nilai membuatnya tidak bisa dinyatakan sama sekali.',
      },
      {
        term: 'pure function',
        meaning:
          'Fungsi yang untuk masukan sama selalu menghasilkan keluaran sama, dan tidak melakukan apa pun ke dunia luar — tidak menulis `localStorage`, tidak memanggil API, tidak mengubah argumennya. Reducer **wajib** murni, karena React boleh memanggilnya lebih dari sekali untuk aksi yang sama.',
      },
      {
        term: 'transisi',
        meaning:
          'Perpindahan dari satu keadaan ke keadaan berikutnya. Nilai `useReducer` ada di sini: satu aksi = satu transisi yang utuh, bukan tiga panggilan `setState` yang harus kamu jaga tetap konsisten satu per satu.',
      },
      {
        term: 'spread (`...state`)',
        meaning:
          'Operator JavaScript yang menyalin seluruh properti sebuah objek ke objek baru. `{ ...state, status: \'memuat\' }` berarti "sama seperti sebelumnya, kecuali `status`". Ini cara membuat state baru tanpa mengubah yang lama — syarat agar reducer tetap murni.',
      },
    ),

    h2('Bentuknya'),
    code(
      'tsx',
      `
        type State = { status: 'diam' | 'memuat' | 'sukses' | 'gagal'; data: Produk[]; pesan: string };

        type Aksi =
          | { type: 'mulai' }
          | { type: 'berhasil'; data: Produk[] }
          | { type: 'gagal'; pesan: string }
          | { type: 'ulangi' };

        function reducer(state: State, aksi: Aksi): State {
          switch (aksi.type) {
            case 'mulai':
              return { ...state, status: 'memuat', pesan: '' };
            case 'berhasil':
              return { status: 'sukses', data: aksi.data, pesan: '' };
            case 'gagal':
              return { ...state, status: 'gagal', pesan: aksi.pesan };
            case 'ulangi':
              return { status: 'memuat', data: [], pesan: '' };
          }
        }

        const [state, kirim] = useReducer(reducer, {
          status: 'diam',
          data: [],
          pesan: '',
        });
        `,
    ),
    p(
      'Karena `Aksi` adalah discriminated union dan `switch`-nya menangani setiap varian, TypeScript akan menolak kode ini kalau kamu menambah jenis aksi baru dan lupa menanganinya. Itu bukan efek samping — itu alasan utama memakai bentuk ini.',
    ),

    h2('Kapan lebih baik daripada beberapa `useState`'),
    compare(
      {
        title: 'Beberapa useState',
        lang: 'tsx',
        code: `
          const [memuat, setMemuat] = useState(false);
          const [data, setData] = useState([]);
          const [gagal, setGagal] = useState(null);

          // Impossible state bisa terjadi:
          // memuat=true DAN gagal!=null DAN data terisi
          `,
        notes: ['Setiap transisi butuh tiga panggilan yang harus konsisten'],
      },
      {
        title: 'useReducer',
        lang: 'tsx',
        code: `
          const [state, kirim] = useReducer(reducer, awal);

          // status hanya bisa satu dari empat nilai.
          // Impossible state tidak bisa dinyatakan.
          kirim({ type: 'mulai' });
          `,
        notes: ['Satu aksi = satu transisi yang utuh'],
      },
    ),

    h2('Tanda kamu sebaiknya beralih ke reducer'),
    ul(
      'Beberapa state selalu berubah bersamaan.',
      'Nilai berikutnya bergantung pada beberapa nilai sebelumnya sekaligus.',
      'Logika perubahannya diulang di beberapa handler.',
      'Kamu kesulitan menjawab "keadaan apa saja yang mungkin?" dengan pasti.',
    ),

    h2('Reducer harus pure function'),
    code(
      'ts',
      `
        // SALAH: efek samping di dalam reducer
        function reducer(state, aksi) {
          if (aksi.type === 'simpan') {
            fetch('/api/simpan', { method: 'POST' });   // TIDAK di sini
            localStorage.setItem('data', '...');        // TIDAK di sini
            return { ...state, tersimpan: true };
          }
        }

        // BENAR: reducer hanya menghitung state berikutnya.
        // Efek samping tetap di handler atau Effect.
        `,
    ),
    p(
      'Reducer harus bisa dipanggil dua kali dengan argumen yang sama dan menghasilkan keluaran yang sama — React memang memanggilnya dua kali di Strict Mode untuk memastikan itu.',
    ),

    h2('Menguji reducer itu murah'),
    code(
      'ts',
      `
        // Tidak perlu merender apa pun — reducer adalah fungsi biasa.
        it('gagal menyimpan pesan errornya', () => {
          const hasil = reducer(
            { status: 'memuat', data: [], pesan: '' },
            { type: 'gagal', pesan: 'Jaringan putus' },
          );

          expect(hasil.status).toBe('gagal');
          expect(hasil.pesan).toBe('Jaringan putus');
        });
        `,
    ),
    callout(
      'tip',
      'Reducer + Context = store sederhana',
      'Menggabungkan `useReducer` dengan Context memberi kamu store global tanpa library apa pun. Ingat batasnya dari Bab 5: tanpa selector, semua konsumen tetap ikut render. Untuk state yang sering berubah dan banyak pembacanya, store dengan selector tetap lebih tepat.',
    ),
    divider,
    h2('Studi kasus di project nyata'),
    p(
      'Komponen keranjang belanja punya lima state, yaitu daftar barang, kode promo, ongkir, sedang menghitung, dan pesan galat. Tujuh penangan peristiwa masing-masing menyetel tiga sampai empat state sekaligus. Setelah fitur hapus barang ditambahkan, muncul keadaan di mana barangnya kosong sementara ongkirnya masih terhitung, dan tombol bayar tetap aktif.',
    ),
    p(
      'Ini gejala yang khas, yaitu beberapa state yang selalu berubah bersama tapi diperbarui di banyak tempat. `useReducer` memindahkan seluruh aturan perubahannya ke satu fungsi.',
    ),
    code(
      'tsx',
      `
        type Keadaan = {
          barang: Barang[];
          promo: Promo | null;
          ongkirSen: number;
          menghitung: boolean;
          galat: string | null;
        };

        // Aksi menyatakan APA YANG TERJADI, bukan apa yang harus diubah.
        type Aksi =
          | { jenis: 'barang-dimuat'; barang: Barang[] }
          | { jenis: 'barang-dihapus'; id: string }
          | { jenis: 'promo-dipakai'; promo: Promo }
          | { jenis: 'promo-dibatalkan' }
          | { jenis: 'ongkir-dihitung'; sen: number }
          | { jenis: 'gagal'; pesan: string };

        function reducer(k: Keadaan, aksi: Aksi): Keadaan {
          switch (aksi.jenis) {
            case 'barang-dihapus': {
              const barang = k.barang.filter((b) => b.id !== aksi.id);
              return {
                ...k,
                barang,
                // Aturan yang tadinya tersebar: keranjang kosong berarti
                // promo dan ongkir ikut hilang.
                promo: barang.length === 0 ? null : k.promo,
                ongkirSen: barang.length === 0 ? 0 : k.ongkirSen,
                galat: null,
              };
            }

            case 'promo-dipakai':
              // Promo hanya berlaku kalau ada barang.
              if (k.barang.length === 0) return k;
              return { ...k, promo: aksi.promo, galat: null };

            case 'ongkir-dihitung':
              return { ...k, ongkirSen: aksi.sen, menghitung: false, galat: null };

            case 'gagal':
              return { ...k, menghitung: false, galat: aksi.pesan };

            default:
              return k;
          }
        }
        `,
      { filename: 'src/keranjang/reducer.ts' },
    ),
    p(
      'Aturan bahwa keranjang kosong berarti promo dan ongkir ikut hilang kini tertulis **satu kali**. Pada versi `useState`, aturan itu harus diulang di setiap tempat yang bisa mengosongkan keranjang, yaitu hapus satu barang, hapus semua, dan kembalikan pesanan. Salah satu selalu terlewat saat aturannya berubah.',
    ),
    p(
      "Bentuk `case 'promo-dipakai'` yang mengembalikan `k` apa adanya saat keranjang kosong adalah pola yang layak dicontoh. Reducer boleh memutuskan tidak ada yang berubah, dan mengembalikan object yang sama membuat React melewati penggambaran ulang. Ini lebih baik daripada memeriksa syaratnya di komponen, sebab pemeriksaannya menjadi bagian dari aturan.",
    ),
    code(
      'tsx',
      `
        function Keranjang() {
          const [keadaan, kirim] = useReducer(reducer, KEADAAN_AWAL);

          // Nilai turunan tetap DIHITUNG, bukan disimpan di reducer.
          const subtotal = keadaan.barang.reduce((j, b) => j + b.hargaSen * b.jumlah, 0);
          const potongan = keadaan.promo ? hitungPotongan(subtotal, keadaan.promo) : 0;
          const total = subtotal - potongan + keadaan.ongkirSen;
          const bolehBayar = keadaan.barang.length > 0 && !keadaan.menghitung;

          return (
            <>
              {keadaan.barang.map((b) => (
                <Baris key={b.id} barang={b}
                  onHapus={() => kirim({ jenis: 'barang-dihapus', id: b.id })} />
              ))}
              <p>Total {formatRupiah(total)}</p>
              <button disabled={!bolehBayar}>Bayar</button>
            </>
          );
        }
        `,
      { caption: 'Nilai turunan tetap dihitung saat render, tidak masuk ke reducer.' },
    ),
    p(
      'Ini pembedaan yang sering keliru. `useReducer` untuk state yang **tidak bisa disimpulkan** dari state lain. Subtotal, potongan, dan total semuanya bisa dihitung dari `barang` dan `promo`, sehingga menyimpannya di reducer berarti mengulang kesalahan nilai turunan dari bab tentang state. Reducer memegang fakta, dan komponennya menghitung kesimpulan.',
    ),
    p(
      'Keuntungan yang sering menentukan adalah pengujian. Fungsi `reducer` adalah fungsi murni yang menerima keadaan dan aksi lalu mengembalikan keadaan baru, sehingga seluruh aturannya bisa diuji tanpa merender apa pun. Menguji bahwa menghapus barang terakhir juga mengosongkan promo cukup dua baris pemanggilan, tanpa peramban dan tanpa klik.',
    ),
    callout(
      'tip',
      'Tanda bahwa `useState` sudah tidak cukup',
      'Ada tiga atau lebih state yang selalu berubah bersama. Satu penangan menyetel tiga state sekaligus. Aturan tentang apa yang boleh berubah menjadi apa diulang di beberapa tempat. Atau muncul keadaan yang tidak masuk akal, misalnya keranjang kosong dengan ongkir terhitung. Kalau dua di antaranya benar, `useReducer` biasanya sepadan.',
    ),

    h2('Saat error-nya muncul'),
    p(
      'Empat kegagalan berikut adalah yang paling sering pada reducer, dan dua di antaranya tidak melempar apa pun.',
    ),
    code(
      'text',
      `
        case 'barang-dihapus':
          k.barang = k.barang.filter((b) => b.id !== aksi.id);   // diubah di tempat
          return k;

        // Tidak ada error. Tampilan tidak berubah sama sekali.
        `,
      { caption: 'Reducer mengubah keadaan di tempat lalu mengembalikannya.' },
    ),
    p(
      'React membandingkan dengan `Object.is`, dan karena objectnya sama persis ia melewati penggambaran ulang. Di reducer kesalahan ini sangat mudah terjadi sebab `k` terlihat seperti variabel biasa yang bebas diubah. Reducer wajib mengembalikan object **baru** untuk setiap perubahan, dan mengembalikan yang lama hanya kalau memang tidak ada yang berubah.',
    ),
    code(
      'text',
      `
        function reducer(k, aksi) {
          switch (aksi.jenis) {
            case 'barang-dihapus':
              return { ...k, barang: [] };
          }
          // tidak ada default
        }

        TypeError: Cannot read properties of undefined (reading 'barang')
        `,
      { caption: 'Cabang `default` tidak ada, sehingga fungsinya mengembalikan `undefined`.' },
    ),
    p(
      'Fungsi yang jatuh sampai ke bawah tanpa `return` mengembalikan `undefined`, dan React menyimpan itu sebagai keadaan baru. Seluruh pembacaan sesudahnya gagal, dan halamannya rusak total. Selalu sediakan `default` yang mengembalikan `k` apa adanya, atau lebih baik lagi melempar error yang menyebut jenis aksinya supaya salah ketik langsung ketahuan.',
    ),
    code(
      'text',
      `
        case 'barang-dihapus': {
          simpanKeServer(k.barang);      // efek samping di dalam reducer
          return { ...k, barang: [] };
        }

        // Di StrictMode, simpanKeServer dipanggil DUA KALI.
        `,
      { caption: 'Reducer harus murni, dan React memanggilnya lebih dari sekali.' },
    ),
    p(
      'React memperlakukan reducer sebagai fungsi murni dan boleh memanggilnya beberapa kali, terutama di `StrictMode` yang sengaja memanggilnya dua kali untuk menemukan efek samping. Pemanggilan server, pencatatan, dan penulisan ke penyimpanan semuanya harus berada di luar. Reducer hanya menghitung keadaan baru dari keadaan lama dan aksi.',
    ),
    code(
      'text',
      `
        kirim({ jenis: 'barang-dihapuz', id });   // salah ketik

        // Tidak ada error. Aksinya jatuh ke default dan diabaikan.
        // Tombol hapus tidak melakukan apa-apa.
        `,
      { caption: 'Salah ketik jenis aksi lolos tanpa satu pun tanda.' },
    ),
    p(
      'Dengan union tipe yang ketat seperti pada studi kasus, TypeScript menolak salah ketik ini sebelum dijalankan. Tanpa tipe, ia jatuh ke `default` dan diabaikan diam-diam. Untuk berjaga-jaga, `default` yang melempar error menyebut jenisnya jauh lebih baik daripada yang mengembalikan keadaan apa adanya, sebab ia mengubah kegagalan senyap menjadi kegagalan yang terlihat.',
    ),
    table(
      ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
      [
        [
          'Tampilan tidak berubah setelah mengirim aksi',
          'Reducer mengubah keadaan di tempat',
          'Kembalikan object baru dengan spread',
        ],
        [
          '`Cannot read properties of undefined`',
          'Tidak ada cabang `default`',
          'Kembalikan `k` apa adanya, atau lempar error yang menyebut jenisnya',
        ],
        [
          'Efek samping berjalan dua kali di pengembangan',
          'Ada pemanggilan server di dalam reducer',
          'Pindahkan ke penangan peristiwa atau efek',
        ],
        [
          'Aksi diabaikan tanpa tanda',
          'Salah ketik jenis aksi jatuh ke `default`',
          'Pakai union tipe yang ketat, dan lempar di `default`',
        ],
        [
          'Nilai turunan tidak sinkron',
          'Total dan subtotal disimpan di reducer',
          'Hitung saat render, jangan simpan di keadaan',
        ],
      ],
    ),

    h2('Kesalahan umum pemula'),
    p(
      '`useReducer` sering dipakai terlalu dini atau terlalu terlambat, dan keduanya punya biayanya sendiri.',
    ),
    table(
      ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
      [
        [
          'Memakai `useReducer` untuk satu atau dua state sederhana',
          'Katanya lebih terstruktur',
          'Menambah tipe aksi, fungsi reducer, dan satu lapisan tak langsung untuk hal yang cukup `useState`',
        ],
        [
          'Menamai aksi dengan apa yang harus diubah',
          'Lebih langsung',
          'Nama seperti `setBarang` membuat reducer sekadar setter berkedok, dan aturannya tetap tersebar di pemanggil',
        ],
        [
          'Menyimpan nilai turunan di dalam keadaan',
          'Supaya tidak dihitung ulang',
          'Dua sumber kebenaran yang harus dijaga di setiap cabang reducer. Hitung saat render',
        ],
        [
          'Menaruh pemanggilan server di dalam reducer',
          'Di sana keadaannya tersedia',
          'Reducer harus murni dan React boleh memanggilnya dua kali',
        ],
        [
          'Membuat satu reducer raksasa untuk seluruh halaman',
          'Semua aturan di satu tempat',
          'Menjadi ratusan baris dan sulit diuji. Pecah per bagian yang aturannya memang berhubungan',
        ],
        [
          'Melupakan cabang `default`',
          'Seluruh aksi sudah ditangani',
          'Salah ketik membuat keadaan menjadi `undefined`, dan seluruh halaman rusak',
        ],
      ],
    ),
    p(
      'Baris kedua adalah pembeda antara reducer yang berguna dan reducer yang hanya menambah lapisan. Aksi bernama `setPromo` memindahkan keputusan ke pemanggil, sehingga aturan tentang kapan promo boleh dipakai tetap tersebar. Aksi bernama `promo-dipakai` menyerahkan keputusan itu ke reducer, dan di situlah seluruh keuntungannya berada. Namai aksi dengan **peristiwa**, bukan dengan perubahan.',
    ),
    callout(
      'info',
      'Reducer bisa diuji tanpa merender apa pun',
      'Karena ia hanya menerima keadaan dan aksi lalu mengembalikan keadaan baru, seluruh aturannya bisa diuji sebagai fungsi biasa. Menguji sepuluh kombinasi aksi memakan sepuluh baris dan berjalan dalam milidetik, tanpa peramban dan tanpa memalsukan apa pun. Ini keuntungan yang sering menentukan pada alur yang aturannya rumit.',
    ),
    references(
      {
        label: 'useReducer',
        href: 'https://react.dev/reference/react/useReducer',
        source: 'React',
        note: 'Rujukan API lengkap, termasuk syarat reducer harus pure function.',
      },
      {
        label: 'Extracting State Logic into a Reducer',
        href: 'https://react.dev/learn/extracting-state-logic-into-a-reducer',
        source: 'React',
        note: 'Kapan beberapa `useState` sebaiknya digabung menjadi satu reducer.',
      },
      {
        label: 'Scaling Up with Reducer and Context',
        href: 'https://react.dev/learn/scaling-up-with-reducer-and-context',
        source: 'React',
        note: 'Pola store sederhana tanpa library, beserta batasannya.',
      },
      {
        label: 'Discriminated unions',
        href: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions',
        source: 'TypeScript',
        note: 'Mekanisme yang membuat `switch` di dalam reducer diperiksa lengkap oleh compiler.',
      },
    ),
  ]),

  written(
    'usetransition-usedeferred',
    '`useTransition` & `useDeferredValue`',
    20,
    'Menjaga antarmuka tetap responsif saat ada pekerjaan berat.',
    [
      p(
        'Keduanya adalah hook konkuren: mereka memberi tahu React bahwa sebagian pembaruan **tidak mendesak**, sehingga React boleh menundanya demi yang mendesak — seperti menampilkan huruf yang baru diketik.',
      ),

      terms(
        {
          term: 'concurrent (konkuren)',
          meaning:
            'Dibaca "konkuren", artinya **berjalan berdampingan**. Kemampuan React menyiapkan beberapa versi antarmuka sekaligus, menjeda salah satunya, dan mendahulukan yang lebih mendesak. Ini yang membuat "input tetap bisa diketik sementara daftar besar masih difilter" jadi mungkin.',
        },
        {
          term: 'pembaruan mendesak vs tidak mendesak',
          meaning:
            'React membedakan keduanya. Yang **mendesak** adalah huruf yang baru diketik dan harus langsung muncul, sebab jeda 100ms saja sudah terasa lengket. Yang **tidak mendesak** adalah daftar hasil, yang boleh menyusul sedetik kemudian. Kedua hook di sub-bab ini adalah cara memberi tahu React mana yang mana.',
        },
        {
          term: 'useDeferredValue',
          meaning:
            'Hook yang menunda **nilainya**. Ia mengembalikan salinan yang "tertinggal" dari nilai yang kamu berikan. Input memakai nilai terbaru sehingga tetap responsif; pekerjaan berat memakai salinan tertunda. Dipakai saat nilainya datang dari props atau state yang bukan milikmu.',
        },
        {
          term: 'useTransition',
          meaning:
            'Hook yang menandai **pembaruannya**. Ia memberimu `[sedangPindah, mulaiTransisi]`: bungkus `setState`-mu di dalam `mulaiTransisi(...)`, dan `sedangPindah` menyala selama pembaruan itu diproses. Dipakai saat kamu yang mengontrol pemanggilan `setState`-nya.',
        },
        {
          term: 'transition (transisi)',
          meaning:
            'Istilah React untuk pembaruan yang ditandai tidak mendesak. Sifat pentingnya: konten **lama tetap terlihat** sampai yang baru siap, alih-alih layar dikosongkan lebih dulu. Itu perbedaan antara "berpindah tab" dan "layar berkedip kosong lalu isinya muncul".',
        },
        {
          term: 'debounce',
          meaning:
            'Teknik lama: tunggu jeda tetap (misalnya 300ms) setelah pengguna berhenti mengetik, baru kerjakan. Bedanya dengan hook ini tegas — debounce **selalu** menunggu selama itu bahkan di perangkat cepat, sedangkan React memakai secepat perangkatnya mampu.',
        },
        {
          term: 'stale (basi)',
          meaning:
            'Keadaan ketika yang tampil di layar belum mencerminkan masukan terbaru. Kamu bisa mendeteksinya dengan membandingkan nilai asli dan nilai tertunda, lalu meredupkan tampilannya — supaya pengguna tahu hasilnya sedang menyusul, bukan sudah selesai.',
        },
        {
          term: 'virtualisasi',
          meaning:
            'Hanya merender baris yang benar-benar terlihat di layar dari daftar yang panjang. Ini contoh optimasi **sungguhan** — ia mengurangi jumlah pekerjaan. Hook di sub-bab ini menjadwalkan ulang pekerjaan yang sama, tidak menguranginya.',
        },
      ),

      h2('Masalahnya'),
      code(
        'tsx',
        `
        function Pencarian() {
          const [kueri, setKueri] = useState('');

          // Memfilter 20.000 item di setiap ketikan.
          const hasil = filterBerat(semuaItem, kueri);

          return (
            <>
              <input value={kueri} onChange={(e) => setKueri(e.target.value)} />
              <Daftar items={hasil} />
            </>
          );
        }
        `,
      ),
      p(
        'Karena React harus menyelesaikan render sebelum menggambar, huruf yang diketik baru muncul setelah 20.000 item selesai difilter. Input terasa lengket, dan pengguna mengira aplikasinya rusak.',
      ),

      h2('`useDeferredValue` — menunda nilainya'),
      code(
        'tsx',
        `
        function Pencarian() {
          const [kueri, setKueri] = useState('');
          const kueriTertunda = useDeferredValue(kueri);

          // Filter memakai nilai TERTUNDA.
          const hasil = filterBerat(semuaItem, kueriTertunda);

          // Penanda bahwa hasil yang tampil belum yang terbaru.
          const basi = kueri !== kueriTertunda;

          return (
            <>
              <input value={kueri} onChange={(e) => setKueri(e.target.value)} />
              <div style={{ opacity: basi ? 0.6 : 1 }}>
                <Daftar items={hasil} />
              </div>
            </>
          );
        }
        `,
      ),
      p(
        'Input memakai nilai terbaru sehingga tetap responsif; daftarnya menyusul. Beda dengan debounce, tidak ada penundaan tetap — React memakai secepat perangkatnya mampu.',
      ),

      h2('`useTransition` — menandai pembaruannya'),
      code(
        'tsx',
        `
        function NavigasiTab() {
          const [tab, setTab] = useState('beranda');
          const [sedangPindah, mulaiTransisi] = useTransition();

          function pindah(tabBaru: string) {
            mulaiTransisi(() => {
              setTab(tabBaru);   // ditandai tidak mendesak
            });
          }

          return (
            <>
              <button onClick={() => pindah('laporan')} disabled={sedangPindah}>
                Laporan {sedangPindah && '…'}
              </button>
              <KontenTab tab={tab} />
            </>
          );
        }
        `,
      ),
      p(
        'Bedanya dengan `useDeferredValue`: `useTransition` memberimu bendera `sedangPindah`, sehingga kamu bisa menampilkan indikator. Ia juga membuat tab lama **tetap terlihat** sampai yang baru siap — bukan mengosongkan layar dulu.',
      ),

      h2('Memilih di antara keduanya'),
      table(
        ['Situasi', 'Pilihan'],
        [
          ['Kamu mengontrol pemanggilan `setState`-nya', '`useTransition`'],
          ['Nilainya datang dari props atau state yang bukan milikmu', '`useDeferredValue`'],
          ['Butuh indikator "sedang memproses"', '`useTransition`'],
          ['Cukup menandai hasil lama sebagai basi', '`useDeferredValue`'],
        ],
      ),

      h2('Bukan pengganti optimasi sungguhan'),
      callout(
        'warning',
        'Ini menjadwalkan ulang, bukan mempercepat',
        'Kalau filtermu butuh 2 detik, `useDeferredValue` tidak membuatnya jadi 200ms — ia hanya membuat input tetap bisa diketik selama itu. Untuk pekerjaan yang benar-benar berat, solusinya tetap: kurangi jumlah data (paginasi, virtualisasi) atau pindahkan pekerjaannya ke server. Hook ini menutupi jeda, bukan menghapusnya.',
      ),
      callout(
        'info',
        'Kaitannya dengan pekerjaan asinkron',
        'Di React 19, fungsi async juga bisa dijalankan di dalam `startTransition`, dan `useActionState` (sub-bab berikutnya) dibangun di atas mekanisme yang sama untuk menangani status pengiriman form.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman katalog punya kotak pencarian yang menyaring sepuluh ribu produk di sisi klien. Mengetik satu huruf memblokir halaman selama sekitar dua ratus milidetik, sehingga huruf berikutnya baru muncul setelah penyaringan selesai. Pengguna yang mengetik cepat melihat teksnya tertinggal beberapa huruf di belakang jarinya.',
      ),
      p(
        'Masalahnya bukan penyaringan itu sendiri melainkan bahwa ia menahan pembaruan kotak input. Dua hook ini memisahkan pembaruan yang **mendesak** dari yang boleh menunggu.',
      ),
      code(
        'tsx',
        `
        function Katalog({ produk }: { produk: Produk[] }) {
          const [kata, setKata] = useState('');
          // Nilai yang boleh tertinggal. React memakai nilai lama
          // sampai penyaringan yang baru selesai.
          const kataTertunda = useDeferredValue(kata);

          // Penyaringan memakai nilai TERTUNDA, bukan nilai terbaru.
          const terlihat = useMemo(
            () => produk.filter((p) => p.nama.toLowerCase().includes(kataTertunda.toLowerCase())),
            [produk, kataTertunda],
          );

          // Tanda bahwa hasilnya sedang tertinggal dari ketikan.
          const tertinggal = kata !== kataTertunda;

          return (
            <>
              {/* Kotak input memakai nilai TERBARU, jadi selalu responsif. */}
              <input value={kata} onChange={(e) => setKata(e.currentTarget.value)} />

              <div style={{ opacity: tertinggal ? 0.6 : 1 }}>
                <DaftarProduk produk={terlihat} />
              </div>
            </>
          );
        }
        `,
        { filename: 'src/katalog/Katalog.tsx' },
      ),
      p(
        'Kuncinya ada pada dua nilai yang berbeda. Kotak input memakai `kata` yang selalu terbaru sehingga ketikan langsung terlihat. Penyaringan memakai `kataTertunda` yang boleh tertinggal, sehingga React bisa membatalkan penyaringan yang sedang berjalan saat pengguna mengetik huruf berikutnya. Tanpa pemisahan itu, keduanya terikat pada nilai yang sama.',
      ),
      p(
        'Perbandingan `kata !== kataTertunda` memberi tanda bahwa hasilnya sedang tertinggal, dan itu penting untuk pengalaman pengguna. Tanpa tanda apa pun, pengguna melihat daftar yang tidak cocok dengan yang ia ketik dan mengira aplikasinya rusak. Menurunkan opasitas sedikit sudah cukup menyampaikan bahwa hasilnya sedang diperbarui.',
      ),
      code(
        'tsx',
        `
        // useTransition: untuk pembaruan yang kamu picu sendiri.
        function Tab() {
          const [tab, setTab] = useState('ringkasan');
          const [sedangPindah, mulaiTransisi] = useTransition();

          function pindah(tujuan: string) {
            // Pembaruan di dalam startTransition ditandai TIDAK mendesak.
            // React boleh menundanya demi pembaruan lain yang lebih penting.
            mulaiTransisi(() => setTab(tujuan));
          }

          return (
            <>
              <button onClick={() => pindah('ringkasan')} disabled={sedangPindah}>
                Ringkasan
              </button>
              <button onClick={() => pindah('laporan')}>Laporan</button>
              {sedangPindah ? <Spinner /> : null}
              <IsiTab tab={tab} />
            </>
          );
        }
        `,
        { caption: '`useTransition` menandai pembaruan, `useDeferredValue` menandai nilai.' },
      ),
      p(
        'Perbedaan keduanya bisa diringkas satu kalimat. `useTransition` dipakai saat **kamu yang memicu** pembaruannya, misalnya di dalam penangan klik. `useDeferredValue` dipakai saat nilainya **datang dari luar**, misalnya dari props atau dari state yang disetel komponen lain. Untuk kasus pencarian di atas, keduanya bisa dipakai dan `useDeferredValue` lebih pendek.',
      ),
      p(
        'Yang perlu jujur disebut, keduanya tidak membuat apa pun lebih cepat. Penyaringan sepuluh ribu produk tetap memakan dua ratus milidetik. Yang berubah adalah **siapa yang menunggu**, yaitu kotak input tidak lagi ikut menunggu. Kalau pekerjaannya benar-benar terlalu berat, jalan keluar yang sesungguhnya adalah memindahkan penyaringan ke server atau mengurangi jumlah datanya.',
      ),
      callout(
        'warning',
        'Keduanya tidak menggantikan debounce',
        'Debounce mengurangi **jumlah** pekerjaan dengan menunda sampai pengguna berhenti mengetik. Kedua hook ini tidak mengurangi jumlah pekerjaan sama sekali, hanya membuatnya bisa dipotong. Untuk penyaringan di sisi klien, keduanya sudah cukup. Untuk pemanggilan server, debounce tetap diperlukan supaya tidak mengirim satu permintaan per huruf.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering, dan seluruhnya berupa hasil yang tidak sesuai harapan bukan pesan error.',
      ),
      code(
        'text',
        `
        const kataTertunda = useDeferredValue(kata);
        <input value={kataTertunda} onChange={(e) => setKata(e.target.value)} />

        // Kotak input jadi tertinggal. Ketikan terasa tersendat.
        `,
        { caption: 'Nilai tertunda dipakai untuk kotak input itu sendiri.' },
      ),
      p(
        'Ini membalik seluruh tujuannya. Kotak input harus memakai nilai **terbaru** supaya ketikan langsung terlihat, dan hanya bagian yang beratlah yang memakai nilai tertunda. Gejalanya persis sama dengan masalah aslinya, yaitu teks tertinggal di belakang jari. Periksa mana yang memakai nilai mana.',
      ),
      code(
        'text',
        `
        const terlihat = produk.filter((p) => p.nama.includes(kataTertunda));
        // tanpa useMemo

        // Penyaringan tetap berjalan tiap render, termasuk render
        // yang dipicu perubahan 'kata'. Tidak ada penghematan.
        `,
        { caption: 'Nilai tertunda tanpa penyimpanan hasil.' },
      ),
      p(
        '`useDeferredValue` menunda **nilainya**, dan tidak menunda perhitungan yang memakainya. Kalau penyaringan berjalan langsung di badan komponen, ia tetap dijalankan pada setiap render termasuk render yang dipicu ketikan. Bungkus dengan `useMemo` yang dependensinya nilai tertunda, dan pada project dengan React Compiler ini biasanya ditangani otomatis.',
      ),
      code(
        'text',
        `
        mulaiTransisi(async () => {
          const data = await ambil();
          setData(data);
        });

        // Pembaruan setelah await TIDAK ikut ditandai sebagai transisi.
        `,
        { caption: 'Hanya pembaruan sinkron di dalamnya yang ditandai.' },
      ),
      p(
        'Fungsi yang diberikan ke `startTransition` harus menyetel state secara **sinkron**. Begitu ada `await`, sisa fungsinya berjalan di tugas yang berbeda dan penandaannya sudah tidak berlaku. Untuk pembaruan setelah menunggu, panggil `startTransition` lagi di dalam, atau pakai pola Action yang dibahas di sub-bab berikutnya.',
      ),
      code(
        'text',
        `
        const [sedangPindah, mulaiTransisi] = useTransition();
        mulaiTransisi(() => setKata(e.target.value));

        // Ketikan terasa tertinggal. Kotak input ikut ditunda.
        `,
        { caption: 'Pembaruan yang mendesak ditandai sebagai tidak mendesak.' },
      ),
      p(
        'Pembaruan kotak input adalah pembaruan paling mendesak yang ada, sebab pengguna sedang menunggu hurufnya muncul. Menandainya sebagai transisi membuat React boleh menundanya, dan hasilnya persis kebalikan dari yang diinginkan. Setel nilai kotaknya secara langsung, dan tandai hanya pembaruan yang beratnya sebagai transisi.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Ketikan tertinggal di kotak input',
            'Nilai tertunda dipakai untuk kotaknya',
            'Kotak memakai nilai terbaru, bagian berat memakai nilai tertunda',
          ],
          [
            'Tidak ada penghematan sama sekali',
            'Perhitungannya tidak dibungkus `useMemo`',
            'Bungkus dengan dependensi berupa nilai tertunda',
          ],
          [
            'Pembaruan setelah `await` tetap memblokir',
            'Penandaan transisi hanya berlaku untuk yang sinkron',
            'Panggil `startTransition` lagi setelah `await`',
          ],
          [
            'Kotak input ikut tertunda',
            'Pembaruan mendesak ditandai sebagai transisi',
            'Setel nilai kotaknya langsung, di luar transisi',
          ],
          [
            'Pengguna mengira aplikasinya rusak',
            'Tidak ada tanda bahwa hasilnya sedang tertinggal',
            'Bandingkan nilai terbaru dengan yang tertunda, lalu beri tanda visual',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kedua hook ini sering dianggap alat pemercepat, dan itu kesalahpahaman yang membuatnya dipakai di tempat yang salah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengira keduanya membuat perhitungan lebih cepat',
            'Namanya soal performa',
            'Pekerjaannya tetap sama beratnya. Yang berubah hanya siapa yang menunggu',
          ],
          [
            'Memakainya untuk menggantikan debounce pada pemanggilan server',
            'Sama-sama menunda',
            'Debounce mengurangi jumlah permintaan, keduanya tidak. Satu permintaan per huruf tetap terkirim',
          ],
          [
            'Memakai nilai tertunda untuk kotak input',
            'Supaya seluruhnya konsisten',
            'Kotak input jadi tertinggal, dan itu kebalikan dari tujuannya',
          ],
          [
            'Membungkus setiap `setState` dengan `startTransition`',
            'Supaya halaman selalu responsif',
            'Pembaruan yang mendesak ikut ditunda. Tandai hanya yang berat',
          ],
          [
            'Tidak memberi tanda saat hasilnya tertinggal',
            'Perbedaannya cuma sesaat',
            'Pada daftar besar, perbedaannya terlihat jelas dan pengguna mengira aplikasinya rusak',
          ],
          [
            'Memakainya untuk menutupi perhitungan yang memang terlalu berat',
            'Halamannya jadi tidak membeku',
            'Hasilnya tetap lambat muncul. Kalau penyaringan sepuluh ribu baris memang berat, pindahkan ke server',
          ],
        ],
      ),
      p(
        'Baris terakhir layak dipertimbangkan sebelum memakai kedua hook ini sama sekali. Kalau penyaringan di sisi klien memakan dua ratus milidetik, pertanyaannya bukan bagaimana menyembunyikannya melainkan kenapa sepuluh ribu baris harus berada di peramban. Penyaringan di server dengan paginasi hampir selalu menghasilkan pengalaman yang lebih baik, dan sekaligus mengurangi data yang dikirim.',
      ),
      callout(
        'info',
        'Keduanya bagian dari rendering yang bisa dipotong',
        'React 18 memperkenalkan kemampuan memotong pekerjaan render di tengah jalan untuk mengerjakan yang lebih mendesak lebih dulu. Kedua hook ini adalah cara memberi tahu React mana yang boleh dipotong. Tanpa penandaan itu, React memperlakukan seluruh pembaruan sebagai sama mendesaknya dan mengerjakannya sampai selesai.',
      ),
      references(
        {
          label: 'useTransition',
          href: 'https://react.dev/reference/react/useTransition',
          source: 'React',
          note: 'Menandai pembaruan sebagai tidak mendesak beserta bendera `isPending`-nya.',
        },
        {
          label: 'useDeferredValue',
          href: 'https://react.dev/reference/react/useDeferredValue',
          source: 'React',
          note: 'Termasuk perbandingan resmi dengan debounce dan throttle.',
        },
        {
          label: 'startTransition',
          href: 'https://react.dev/reference/react/startTransition',
          source: 'React',
          note: 'Versi tanpa hook, untuk dipakai di luar komponen.',
        },
        {
          label: 'Keeping Components Pure',
          href: 'https://react.dev/learn/keeping-components-pure',
          source: 'React',
          note: 'Syarat kemurnian yang membuat React aman menjeda dan mengulang render.',
        },
      ),
    ],
  ),

  written(
    'useoptimistic-useactionstate',
    '`useOptimistic` & `useActionState`',
    23,
    'Hook baru untuk form dan mutasi.',
    [
      p(
        'React 19 menambahkan beberapa hook yang dirancang khusus untuk alur form dan mutasi — bagian yang selama ini paling banyak memakai kode berulang.',
      ),

      terms(
        {
          term: 'mutation (mutasi)',
          meaning:
            'Operasi yang **mengubah** data di server — menyimpan profil, menambah komentar, menghapus item. Lawannya *query*, yang hanya membaca. Bagian ini dulu paling banyak memakai kode berulang: satu state untuk pesan, satu untuk status kirim, satu `try/catch`, satu `preventDefault`.',
        },
        {
          term: 'useActionState',
          meaning:
            'Hook React 19 yang mengembalikan tiga hal sekaligus: `[keadaan, aksi, sedangKirim]`. Kamu memberinya sebuah fungsi async, dan React mengurus status pengiriman serta hasilnya. Fungsi itu menerima keadaan sebelumnya sebagai argumen pertama — polanya sama seperti reducer.',
        },
        {
          term: 'FormData',
          meaning:
            "Objek bawaan browser berisi seluruh isi sebuah form, diambil berdasarkan atribut `name` tiap input. `formData.get('nama')` mengembalikan nilainya. Tipenya `string | File | null`, jadi memeriksanya dengan `typeof` sebelum dipakai bukan kehati-hatian berlebihan.",
        },
        {
          term: 'action pada `<form>`',
          meaning:
            'Atribut `action` yang biasanya berisi URL, tapi di React 19 boleh diisi **fungsi**. React akan memanggilnya dengan `FormData` saat form dikirim, dan menangani `preventDefault` untukmu. Ini yang menghapus seluruh boilerplate `onSubmit`.',
        },
        {
          term: 'useFormStatus',
          meaning:
            'Hook dari `react-dom` yang membaca status `<form>` **di atasnya**. Kegunaannya: tombol kirim bisa tahu form sedang diproses tanpa dioper prop. Syaratnya keras — ia harus dipanggil dari komponen yang berada **di dalam** form, bukan dari komponen yang merender form itu.',
        },
        {
          term: 'pending',
          meaning:
            'Dibaca "pending", artinya **sedang berlangsung**. Bendera boolean yang bernilai `true` selama pengiriman belum selesai. Dipakai untuk menonaktifkan tombol (mencegah pengiriman ganda) dan mengganti labelnya jadi "Menyimpan…".',
        },
        {
          term: 'useOptimistic',
          meaning:
            'Hook yang menampilkan hasil **seolah-olah** sudah berhasil, sebelum server menjawab. Kalau ternyata gagal, React mengembalikan tampilannya ke keadaan sebenarnya. Ini yang membuat "like" terasa instan padahal jaringannya butuh 300ms.',
        },
        {
          term: 'optimistic update',
          meaning:
            'Nama polanya. "Optimis" karena kamu bertaruh permintaannya akan berhasil. Taruhannya masuk akal untuk aksi yang hampir selalu berhasil dan mudah dibatalkan — dan buruk untuk aksi yang konsekuensinya besar, seperti pembayaran.',
        },
        {
          term: 'role="alert" / role="status"',
          meaning:
            'Atribut ARIA yang membuat screen reader **membacakan** isi elemen begitu berubah. `alert` untuk kegagalan (mendesak, memotong pembacaan lain), `status` untuk keberhasilan (sopan, menunggu giliran). Keduanya sering terlupa di form buatan tangan.',
        },
        {
          term: 'aria-describedby',
          meaning:
            'Atribut yang mengaitkan sebuah input dengan elemen lain yang menjelaskannya — di sini pesan error-nya. Efeknya: screen reader membacakan pesan itu saat fokus masuk ke input, sehingga pengguna tahu apa yang salah tanpa harus menjelajah halaman.',
        },
      ),

      h2('`useActionState` — status pengiriman tanpa state manual'),
      code(
        'tsx',
        `
        'use client';

        import { useActionState } from 'react';

        type Keadaan = { pesan: string; berhasil: boolean };

        async function simpanProfil(_sebelumnya: Keadaan, formData: FormData): Promise<Keadaan> {
          const nama = formData.get('nama');

          if (typeof nama !== 'string' || nama.trim() === '') {
            return { pesan: 'Nama wajib diisi.', berhasil: false };
          }

          try {
            await simpanKeServer({ nama });
            return { pesan: 'Tersimpan.', berhasil: true };
          } catch {
            return { pesan: 'Gagal menyimpan. Coba lagi.', berhasil: false };
          }
        }

        export function FormProfil() {
          const [keadaan, aksi, sedangKirim] = useActionState(simpanProfil, {
            pesan: '',
            berhasil: false,
          });

          return (
            <form action={aksi}>
              <label htmlFor="nama">Nama</label>
              <input id="nama" name="nama" aria-describedby="pesan" />

              <button disabled={sedangKirim}>{sedangKirim ? 'Menyimpan…' : 'Simpan'}</button>

              <p id="pesan" role={keadaan.berhasil ? 'status' : 'alert'}>
                {keadaan.pesan}
              </p>
            </form>
          );
        }
        `,
      ),
      p(
        'Yang hilang dibanding cara lama: `useState` untuk pesan, `useState` untuk status kirim, `onSubmit` dengan `preventDefault`, dan `try/catch` yang tersebar di komponen.',
      ),
      callout(
        'tip',
        'Ini juga memperbaiki aksesibilitas',
        '`role="alert"` membuat pesan kegagalan dibacakan screen reader begitu muncul, dan `aria-describedby` mengaitkannya dengan input. Keduanya sering terlupa di form buatan tangan — di sini keduanya jadi bagian dari pola.',
      ),

      h2('`useFormStatus` — status dari komponen anak'),
      code(
        'tsx',
        `
        'use client';

        import { useFormStatus } from 'react-dom';

        // Komponen ini membaca status <form> terdekat DI ATASNYA.
        // Tidak perlu prop, tidak perlu context buatan sendiri.
        export function TombolKirim({ children }: { children: React.ReactNode }) {
          const { pending } = useFormStatus();
          // pending: true selama Server Action form ini masih berjalan

          return (
            <button disabled={pending}>
              {pending ? 'Memproses…' : children}
            </button>
          );
        }
        `,
      ),
      p(
        'Perhatikan komponen ini **tidak menerima satu prop pun tentang status**, sebab tidak ada `sedangKirim` maupun `disabled`. Ia mencari sendiri `<form>` terdekat di atasnya dan membaca statusnya. Itu menyelesaikan masalah yang biasanya dijawab dengan prop drilling, sebab tombol kirim sering berada beberapa lapis di dalam form, dan tanpa hook ini status `pending` harus dioper melewati tiap lapisan. Konsekuensinya disebut di kotak berikut dan mudah terlewat, sebab karena ia membaca form **di atasnya**, memanggilnya di komponen yang justru merender `<form>` itu sendiri akan selalu memberi `pending: false`. Aturannya, `useFormStatus` hanya bekerja dari dalam, jadi tombol kirim harus menjadi komponen tersendiri.',
      ),
      callout(
        'warning',
        'Harus berada di dalam `<form>`, bukan komponen yang memuatnya',
        '`useFormStatus` membaca form di atasnya. Memanggilnya di komponen yang **merender** `<form>` akan selalu memberi `pending: false`. Ia harus dipanggil dari komponen yang berada di dalam form itu.',
      ),

      h2('`useOptimistic` — tampilkan dulu, konfirmasi belakangan'),
      code(
        'tsx',
        `
        'use client';

        import { useOptimistic } from 'react';

        export function DaftarPesan({ pesan, kirimPesan }: Props) {
          const [tampil, tambahOptimistik] = useOptimistic(
            pesan,
            (sekarang: Pesan[], teksBaru: string) => [
              ...sekarang,
              { id: 'sementara', teks: teksBaru, mengirim: true },
            ],
          );

          async function aksi(formData: FormData) {
            const teks = formData.get('teks') as string;

            tambahOptimistik(teks);      // langsung tampil
            await kirimPesan(teks);      // kalau gagal, React mengembalikannya sendiri
          }

          return (
            <>
              <ul>
                {tampil.map((p) => (
                  <li key={p.id} style={{ opacity: p.mengirim ? 0.5 : 1 }}>
                    {p.teks}
                  </li>
                ))}
              </ul>
              <form action={aksi}>
                <input name="teks" />
                <button>Kirim</button>
              </form>
            </>
          );
        }
        `,
      ),
      p(
        'Perbedaannya dengan pola optimistic di Bab 5 adalah kamu tidak perlu menyimpan snapshot dan mengembalikannya sendiri. React otomatis membuang keadaan optimistik saat aksinya selesai, baik berhasil maupun gagal, lalu memakai data sebenarnya.',
      ),

      h2('Batas pemakaiannya'),
      p(
        'Aturan dari Bab 5 tetap berlaku dan tidak berubah karena hook-nya jadi lebih mudah: optimistic update cocok kalau kegagalannya jarang, murah, dan bisa dibatalkan tanpa merugikan. Untuk pembayaran, pemesanan berstok terbatas, atau apa pun yang tidak bisa ditarik kembali, tampilkan status "memproses" yang jujur.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tombol suka pada daftar komentar memanggil server lalu memperbarui angkanya. Di jaringan kantor terasa seketika. Di jaringan seluler, pengguna menekan tombol dan angkanya baru berubah setelah delapan ratus milidetik, sehingga sebagian menekan dua tiga kali karena mengira kliknya tidak terbaca.',
      ),
      p(
        'Pembaruan optimistis menampilkan hasil yang diharapkan **sebelum** server menjawab, lalu mengembalikannya kalau ternyata gagal. `useOptimistic` mengurus pengembalian itu sendiri.',
      ),
      code(
        'tsx',
        `
        'use client';
        import { useOptimistic, useActionState } from 'react';

        function TombolSuka({ komentar, sukaAksi }: Props) {
          // Nilai optimistis dihitung dari nilai sungguhan plus perubahan sementara.
          const [sukaTampil, tambahOptimistis] = useOptimistic(
            komentar.jumlahSuka,
            (sekarang, delta: number) => sekarang + delta,
          );

          async function tangani() {
            // Tampilkan LEBIH DULU. React mengembalikannya sendiri
            // begitu aksinya selesai, berhasil maupun gagal.
            tambahOptimistis(komentar.sudahSuka ? -1 : 1);
            await sukaAksi(komentar.id);
          }

          return (
            <form action={tangani}>
              <button type="submit" aria-pressed={komentar.sudahSuka}>
                Suka {sukaTampil}
              </button>
            </form>
          );
        }
        `,
        { filename: 'src/komentar/TombolSuka.tsx' },
      ),
      p(
        'Yang membedakan `useOptimistic` dari menyimpan salinan state sendiri adalah **pengembaliannya otomatis**. Begitu aksinya selesai, nilai optimistisnya dibuang dan React memakai nilai sungguhan dari props. Kalau aksinya gagal, nilai sungguhan tidak berubah sehingga tampilannya kembali seperti semula tanpa satu baris kode pengembalian.',
      ),
      p(
        'Yang perlu ditegaskan, `tambahOptimistis` hanya boleh dipanggil di dalam Action atau di dalam transisi. Memanggilnya di luar itu menghasilkan peringatan, sebab React tidak tahu kapan harus membuang nilai optimistisnya. Bentuk `<form action={tangani}>` sudah membuat fungsinya menjadi Action, sehingga syaratnya terpenuhi tanpa perlu apa pun lagi.',
      ),
      code(
        'tsx',
        `
        // useActionState: mengelola keadaan pengiriman formulir.
        'use client';

        function FormKomentar({ pesananId }: { pesananId: string }) {
          const [keadaan, aksi, sedangKirim] = useActionState(
            async (sebelumnya: Keadaan, data: FormData) => {
              const isi = String(data.get('isi') ?? '').trim();
              if (isi === '') return { galat: 'Komentar tidak boleh kosong', isi };

              try {
                await kirimKomentar(pesananId, isi);
                return { galat: null, isi: '' };      // berhasil, kosongkan
              } catch (e) {
                // GAGAL: kembalikan isinya supaya ketikan pengguna tidak hilang.
                return { galat: (e as Error).message, isi };
              }
            },
            { galat: null, isi: '' },
          );

          return (
            <form action={aksi}>
              <textarea name="isi" defaultValue={keadaan.isi} disabled={sedangKirim} />
              {keadaan.galat ? <p role="alert">{keadaan.galat}</p> : null}
              <button type="submit" disabled={sedangKirim}>
                {sedangKirim ? 'Mengirim…' : 'Kirim'}
              </button>
            </form>
          );
        }
        `,
        { filename: 'src/komentar/FormKomentar.tsx' },
      ),
      p(
        'Nilai ketiga yang dikembalikan `useActionState`, yaitu `sedangKirim`, menghapus kebutuhan state `memuat` yang biasa ditulis sendiri. Bersamanya hilang pula seluruh kelas bug dari `finally` yang lupa mengembalikan tombol ke keadaan aktif, sebab React yang mengurusnya. Tombol yang mati saat mengirim juga menutup masalah klik ganda.',
      ),
      p(
        'Baris `return { galat: ..., isi }` pada jalur gagal adalah bagian yang paling sering dilupakan. Karena `defaultValue` dibaca dari keadaan, mengembalikan `isi` kosong pada kegagalan akan membuang ketikan pengguna. Aturan dari Bab 5 Frontend Basic berlaku penuh di sini, yaitu jangan pernah membuang apa yang sudah diketik pengguna.',
      ),
      callout(
        'danger',
        'Optimistis hanya untuk aksi yang hampir selalu berhasil',
        'Menampilkan berhasil lalu menariknya kembali jauh lebih membingungkan daripada menunggu sebentar. Pakai untuk suka, centang selesai, dan hapus dari daftar. Jangan pakai untuk pembayaran, pengiriman pesanan, atau apa pun yang kegagalannya punya akibat nyata bagi pengguna.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada kedua hook ini, dan dua di antaranya berupa peringatan React.',
      ),
      code(
        'text',
        `
        function tangani() {
          tambahOptimistis(1);      // dipanggil di luar Action atau transisi
        }
        <button onClick={tangani}>Suka</button>

        Warning: An optimistic state update occurred outside a transition or
        action. To fix, move the update to an action, or wrap with startTransition.
        `,
        { caption: 'React tidak tahu kapan harus membuang nilai optimistisnya.' },
      ),
      p(
        'Pesannya menyebut kedua perbaikannya secara langsung. Nilai optimistis hanya berarti selama ada aksi yang sedang berjalan, sebab React membuangnya begitu aksinya selesai. Di luar aksi, tidak ada titik akhir yang jelas sehingga nilainya bisa tertinggal selamanya. Pakai `<form action={...}>`, atau bungkus dengan `startTransition`.',
      ),
      code(
        'text',
        `
        const [keadaan, aksi] = useActionState(async (data: FormData) => { ... }, awal);

        // Argumen pertama fungsinya adalah KEADAAN SEBELUMNYA, bukan FormData.
        TypeError: data.get is not a function
        `,
        { caption: 'Tanda tangan fungsinya salah urutan.' },
      ),
      p(
        'Fungsi yang diberikan ke `useActionState` menerima dua argumen, yaitu keadaan sebelumnya lalu `FormData`. Ini berbeda dari Action biasa yang hanya menerima `FormData`, dan urutannya sering tertukar. Dengan TypeScript, kesalahan ini ditolak sebelum dijalankan asalkan tipe keadaannya dituliskan.',
      ),
      code(
        'text',
        `
        catch (e) {
          return { galat: e.message, isi: '' };   // isi dikosongkan
        }

        // Pengiriman gagal. Seluruh ketikan pengguna hilang.
        `,
        { caption: 'Isi formulir tidak dikembalikan pada jalur gagal.' },
      ),
      p(
        'Tidak ada error, dan ini kegagalan pengalaman yang paling menyakitkan pada formulir panjang. Karena `defaultValue` membaca dari keadaan, mengembalikan isi kosong berarti membuang pekerjaan pengguna. Selalu kembalikan isi yang dikirim pada jalur gagal, dan kosongkan hanya setelah benar-benar berhasil.',
      ),
      code(
        'text',
        `
        const [sukaTampil, tambahOptimistis] = useOptimistic(jumlah);
        tambahOptimistis(jumlah + 1);

        // Nilai optimistis TIDAK kembali saat aksinya gagal,
        // sebab tidak ada aksi yang menandai akhirnya.
        `,
        { caption: 'Perubahan optimistis dipakai tanpa aksi yang menyertainya.' },
      ),
      p(
        'Pengembalian otomatis bekerja karena React tahu kapan aksinya selesai. Tanpa aksi, tidak ada titik itu dan nilainya bertahan. Gejalanya berupa angka yang naik terus setiap kali diklik walaupun servernya menolak. Pastikan setiap pemanggilan optimistis berpasangan dengan aksi yang benar-benar berjalan sampai selesai.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`optimistic state update occurred outside a transition or action`',
            'Dipanggil di luar Action atau transisi',
            'Pakai `<form action={...}>`, atau bungkus `startTransition`',
          ],
          [
            '`data.get is not a function`',
            'Argumen pertama adalah keadaan sebelumnya, bukan `FormData`',
            'Perbaiki urutan parameternya',
          ],
          [
            'Ketikan pengguna hilang setelah gagal',
            'Isi tidak dikembalikan pada jalur gagal',
            'Kembalikan isi yang dikirim, kosongkan hanya saat berhasil',
          ],
          [
            'Nilai optimistis tidak pernah kembali',
            'Tidak ada aksi yang menandai akhirnya',
            'Pasangkan setiap perubahan optimistis dengan aksi',
          ],
          [
            'Pengguna melihat berhasil lalu ditarik kembali',
            'Optimistis dipakai untuk aksi yang sering gagal',
            'Pakai hanya untuk aksi yang hampir selalu berhasil',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kedua hook ini relatif baru dan menggantikan pola yang sudah lama ditulis dengan tangan, sehingga sebagian besar kesalahan berasal dari membawa kebiasaan lama.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan salinan state sendiri untuk pembaruan optimistis',
            'Itu cara yang sudah dikuasai',
            'Kamu harus menulis pengembaliannya sendiri di setiap jalur gagal, dan satu jalur selalu terlewat. `useOptimistic` mengurusnya',
          ],
          [
            'Memakai optimistis untuk pembayaran',
            'Supaya terasa cepat',
            'Menampilkan berhasil lalu menariknya kembali jauh lebih membingungkan daripada menunggu. Pakai untuk aksi ringan saja',
          ],
          [
            'Mengembalikan isi kosong pada jalur gagal',
            'Formulir kan perlu dikosongkan',
            'Hanya setelah berhasil. Pada kegagalan, ketikan pengguna wajib dipertahankan',
          ],
          [
            'Menyimpan state `memuat` sendiri di samping `useActionState`',
            'Supaya bisa diatur',
            'Nilai ketiga dari `useActionState` sudah menyediakannya, dan tidak mungkin lupa direset',
          ],
          [
            'Memakai `onSubmit` alih-alih `action` pada formulir',
            'Itu cara yang sudah dikenal',
            'Prop `action` yang membuat fungsinya menjadi Action, dan itu syarat `useOptimistic` bekerja',
          ],
          [
            'Tidak menonaktifkan tombol saat mengirim',
            'Pengguna toh menunggu',
            'Pada jaringan lambat ia akan menekan lagi. Pakai nilai `sedangKirim` yang sudah tersedia',
          ],
        ],
      ),
      p(
        'Baris pertama layak ditegaskan karena pola lama masih sangat umum dan sebagian besar bugnya berasal dari pengembalian yang tidak lengkap. Menyimpan salinan sendiri berarti setiap jalur kegagalan, termasuk kegagalan jaringan, penolakan server, dan pembatalan, harus mengembalikan nilainya secara eksplisit. `useOptimistic` membuang seluruh kelas bug itu sebab pengembaliannya bukan kode yang kamu tulis.',
      ),
      callout(
        'info',
        'Keduanya bagian dari pola Action di React 19',
        'Prop `action` pada formulir, `useActionState`, `useOptimistic`, dan `useFormStatus` dirancang bekerja bersama. Di Next.js App Router, fungsi yang ditandai `use server` bisa langsung dipakai sebagai `action`, sehingga pengiriman formulir tidak butuh satu baris `fetch` pun. Pembahasannya ada di bab Next.js.',
      ),
      references(
        {
          label: 'useActionState',
          href: 'https://react.dev/reference/react/useActionState',
          source: 'React',
          note: 'Bentuk `[keadaan, aksi, sedangKirim]` dan cara fungsi aksinya menerima keadaan sebelumnya.',
        },
        {
          label: 'useOptimistic',
          href: 'https://react.dev/reference/react/useOptimistic',
          source: 'React',
          note: 'Termasuk penjelasan kapan React membuang keadaan optimistik dan kembali ke data sebenarnya.',
        },
        {
          label: 'useFormStatus',
          href: 'https://react.dev/reference/react-dom/hooks/useFormStatus',
          source: 'React',
          note: 'Syarat resmi bahwa hook ini harus dipanggil dari dalam `<form>`, bukan dari komponen yang merendernya.',
        },
        {
          label: 'FormData',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData',
          source: 'MDN Web Docs',
          note: 'Objek yang diterima fungsi aksi form, termasuk tipe kembalian `get()`.',
        },
      ),
    ],
  ),

  written(
    'hook-lain',
    '`useId`, `useSyncExternalStore`, `useDebugValue`',
    20,
    'Hook yang jarang dipakai tapi menyelamatkan saat dibutuhkan.',
    [
      p(
        'Tiga hook yang jarang muncul di tutorial, tapi masing-masing menyelesaikan masalah yang tidak punya solusi baik lainnya.',
      ),

      terms(
        {
          term: 'useId',
          meaning:
            'Hook yang menghasilkan string id unik yang **sama di server dan di browser**. Kegunaan utamanya: mengaitkan `<label htmlFor>` dengan `<input id>` di komponen yang dipakai berkali-kali di satu halaman, tanpa risiko id kembar.',
        },
        {
          term: 'hydration mismatch',
          meaning:
            'Dibaca "haidreisyen mismatch", artinya **ketidakcocokan saat hidrasi**. Terjadi ketika HTML dari server berbeda dari yang dihasilkan browser. `Math.random()` atau penghitung sendiri pasti memicunya di SSR — dan akibat terburuknya bukan peringatan di konsol, melainkan kaitan label–input yang putus sehingga screen reader kehilangan nama input itu.',
        },
        {
          term: 'htmlFor',
          meaning:
            'Nama JSX untuk atribut HTML `for` pada `<label>` (`for` adalah kata kunci JavaScript, jadi tidak bisa dipakai apa adanya). Nilainya harus sama persis dengan `id` input yang dituju — itulah yang membuat mengklik label memindahkan fokus ke inputnya.',
        },
        {
          term: 'useSyncExternalStore',
          meaning:
            'Hook untuk berlangganan ke sumber data **di luar React** — `localStorage`, `matchMedia`, status jaringan, atau store buatan sendiri. Ia menerima tiga fungsi: cara berlangganan, cara membaca nilai sekarang di browser, dan cara membacanya di server.',
        },
        {
          term: 'store eksternal',
          meaning:
            'Tempat penyimpanan data yang hidup di luar pohon komponen React dan bisa berubah kapan saja. Zustand, Redux, dan library sejenis semuanya memakai hook ini di dalamnya — jadi memahaminya berarti memahami cara kerja mereka.',
        },
        {
          term: 'snapshot',
          meaning:
            'Nilai sebuah store **pada satu momen**. Fungsi pembacanya harus mengembalikan nilai yang sama menurut `Object.is` selama datanya belum berubah. Mengembalikan objek baru tiap panggilan membuat React merender tanpa henti — jebakan paling umum pada hook ini.',
        },
        {
          term: 'getServerSnapshot',
          meaning:
            'Argumen ketiga, **wajib** kalau ada SSR. Di server tidak ada `window` atau `localStorage`, jadi ia harus mengembalikan nilai netral. Di website ini ia selalu mengembalikan empty state — dan itulah sebabnya setiap komponen berdata menampilkan skeleton sampai `hydrated` bernilai true.',
        },
        {
          term: 'useDebugValue',
          meaning:
            'Hook yang **hanya** memengaruhi tampilan React DevTools, sebab ia memberi label pada custom hook-mu sehingga terbaca "StatusJaringan: Daring" alih-alih sekadar `true`. Tidak berpengaruh apa pun di produksi, sebab ia murni alat bantu saat menelusuri masalah.',
        },
        {
          term: 'navigator.onLine',
          meaning:
            'Properti bawaan browser yang bernilai `true` saat perangkat terhubung jaringan. Ia berpasangan dengan event `online`/`offline` — kombinasi itulah yang membuat contoh `useSyncExternalStore` di bawah menjadi kasus nyata, bukan buatan.',
        },
      ),

      h2('`useId` — id unik yang aman untuk SSR'),
      code(
        'tsx',
        `
        'use client';

        export function KolomEmail() {
          const id = useId();

          return (
            <>
              <label htmlFor={id}>Email</label>
              <input id={id} type="email" aria-describedby={\`\${id}-bantuan\`} />
              <p id={\`\${id}-bantuan\`}>Kami tidak akan membagikannya.</p>
            </>
          );
        }
        `,
      ),
      p(
        'Satu pemanggilan `useId` dipakai untuk **tiga** kaitan sekaligus, dan itu polanya. `htmlFor={id}` menghubungkan label dengan input, sehingga mengeklik teks "Email" memindahkan fokus ke kolomnya. `aria-describedby` menghubungkan input dengan kalimat bantuannya, sehingga pembaca layar membacakannya setelah nama kolomnya. Perhatikan id kedua dibentuk dengan **menambahkan akhiran** (`\${id}-bantuan`) alih-alih memanggil `useId` lagi, dan itu cara yang dianjurkan ketika satu komponen butuh beberapa id yang berhubungan. Kenapa harus hook dan bukan id yang ditulis tangan? Karena komponen ini bisa muncul dua kali di satu halaman, dan dua elemen dengan `id` yang sama membuat kaitan label menjadi ambigu, sehingga pembaca layar hanya akan mengenali yang pertama.',
      ),
      callout(
        'danger',
        'Kenapa bukan `Math.random()` atau penghitung sendiri',
        'Di SSR, server dan browser menghasilkan angka yang berbeda. Atribut `id` dan `htmlFor` jadi tidak cocok, React melaporkan hydration mismatch, dan yang lebih buruk: kaitan label dengan input putus sehingga screen reader kehilangan namanya. `useId` menghasilkan nilai yang sama di kedua sisi.',
      ),
      p(
        '`useId` **bukan** untuk `key` dalam daftar. `key` harus berasal dari identitas datamu, bukan dari hook yang dipanggil per komponen.',
      ),

      h2('`useSyncExternalStore` — berlangganan ke store di luar React'),
      code(
        'ts',
        `
        export function useStatusJaringan() {
          return useSyncExternalStore(
            // 1. Berlangganan; kembalikan fungsi berhenti berlangganan.
            (beriTahu) => {
              window.addEventListener('online', beriTahu);
              window.addEventListener('offline', beriTahu);
              return () => {
                window.removeEventListener('online', beriTahu);
                window.removeEventListener('offline', beriTahu);
              };
            },
            // 2. Baca nilai sekarang (di browser).
            () => navigator.onLine,
            // 3. Baca nilai di server — WAJIB kalau ada SSR.
            () => true,
          );
        }
        `,
      ),
      p(
        'Hook inilah yang dipakai Zustand, Redux, dan library store lain di dalamnya. Kamu juga akan memakainya langsung saat menyambungkan React ke sumber data non-React: `localStorage`, `matchMedia`, atau store buatan sendiri.',
      ),
      callout(
        'info',
        'Website ini memakainya',
        'Store progres belajar di website yang sedang kamu baca dibangun dengan `useSyncExternalStore`. Argumen ketiga, yaitu snapshot untuk server, selalu mengembalikan empty state, karena `localStorage` tidak ada di server. Itulah sebabnya setiap komponen berdata di sini menampilkan skeleton sampai `hydrated` bernilai true.',
      ),
      callout(
        'warning',
        'Snapshot harus stabil',
        'Fungsi pembaca snapshot harus mengembalikan nilai yang sama (menurut `Object.is`) selama datanya tidak berubah. Mengembalikan objek baru setiap panggilan akan membuat React merender tanpa henti. Kalau perlu objek, simpan hasilnya di luar dan kembalikan referensi yang sama.',
      ),

      h2('`useDebugValue` — label di React DevTools'),
      code(
        'ts',
        `
        export function useStatusJaringan() {
          const daring = useSyncExternalStore(...);

          // Muncul di DevTools sebagai: StatusJaringan: "Daring"
          useDebugValue(daring ? 'Daring' : 'Luring');

          return daring;
        }
        `,
      ),
      p(
        'Hanya berguna di dalam custom hook, dan hanya terlihat di DevTools. Untuk hook sederhana ia tidak perlu; untuk hook yang mengembalikan struktur rumit, ia menghemat waktu saat men-debug.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen kolom formulir dipakai dua kali di satu halaman, dan keduanya memakai `id="email"` supaya labelnya terhubung. Akibatnya mengklik label kedua justru memfokuskan kolom pertama. Setelah diganti dengan angka acak, muncul masalah baru, yaitu peringatan ketidakcocokan hidrasi sebab id yang dihasilkan server berbeda dari yang dihasilkan klien.',
      ),
      p(
        'Sub-bab ini membahas hook yang jarang dipakai dan menyelesaikan masalah yang tidak punya jalan keluar lain. `useId` adalah salah satunya.',
      ),
      code(
        'tsx',
        `
        // useId: id yang unik, stabil, dan SAMA di server dan klien.
        function Kolom({ label }: { label: string }) {
          const id = useId();
          return (
            <>
              <label htmlFor={id}>{label}</label>
              <input id={id} />
            </>
          );
        }

        // Untuk beberapa id dalam satu komponen, pakai satu useId sebagai awalan.
        function KolomLengkap({ label, bantuan }: Props) {
          const id = useId();
          return (
            <>
              <label htmlFor={\`\${id}-kolom\`}>{label}</label>
              <input id={\`\${id}-kolom\`} aria-describedby={\`\${id}-bantuan\`} />
              <p id={\`\${id}-bantuan\`}>{bantuan}</p>
            </>
          );
        }
        `,
        { caption: 'Satu `useId` per komponen, lalu tambahkan akhiran.' },
      ),
      p(
        'Yang membuat `useId` diperlukan bukan keunikannya melainkan **kestabilannya lintas server dan klien**. Angka acak menghasilkan nilai berbeda di kedua sisi, sehingga HTML dari server tidak cocok dengan yang dihasilkan klien dan React membuang seluruh hasil server. `useId` menghasilkan nilai yang sama di kedua sisi berdasarkan posisi komponennya di pohon.',
      ),
      code(
        'tsx',
        `
        // useSyncExternalStore: berlangganan ke sumber data DI LUAR React
        // dengan cara yang aman untuk rendering yang bisa dipotong.
        function pakaiOnline() {
          return useSyncExternalStore(
            // 1. Cara berlangganan. Kembalikan fungsi pelepasnya.
            (beritahu) => {
              window.addEventListener('online', beritahu);
              window.addEventListener('offline', beritahu);
              return () => {
                window.removeEventListener('online', beritahu);
                window.removeEventListener('offline', beritahu);
              };
            },
            // 2. Cara membaca nilainya di klien.
            () => navigator.onLine,
            // 3. Cara membaca nilainya di server. WAJIB kalau dirender di server.
            () => true,
          );
        }
        `,
        { caption: 'Tiga argumen, dan yang ketiga sering dilupakan.' },
      ),
      p(
        'Ini pengganti yang lebih benar untuk pola `useState` ditambah `useEffect` yang berlangganan peristiwa. Bedanya, `useSyncExternalStore` menjamin nilainya konsisten bahkan saat React memotong render di tengah jalan, sedangkan pola lama bisa menampilkan nilai yang sudah usang. Untuk sebagian besar aplikasi perbedaannya tidak terasa, dan untuk pustaka yang dipakai orang lain ia penting.',
      ),
      code(
        'tsx',
        `
        // useImperativeHandle: membatasi apa yang bisa disentuh dari luar.
        type PegangKolom = { fokus: () => void; kosongkan: () => void };

        const Kolom = forwardRef<PegangKolom, Props>(function Kolom(props, ref) {
          const dalamRef = useRef<HTMLInputElement>(null);

          // Pemanggil hanya dapat dua method ini, bukan seluruh elemen DOM.
          useImperativeHandle(ref, () => ({
            fokus: () => dalamRef.current?.focus(),
            kosongkan: () => { if (dalamRef.current) dalamRef.current.value = ''; },
          }), []);

          return <input ref={dalamRef} {...props} />;
        });
        `,
        { caption: 'Dipakai untuk membatasi, bukan untuk membuka akses.' },
      ),
      p(
        'Hook ini sering disalahpahami sebagai cara membuka akses DOM ke pemanggil, padahal gunanya kebalikannya, yaitu **membatasi**. Tanpa itu, meneruskan `ref` memberi pemanggil seluruh elemen DOM beserta ratusan properti yang bisa ia ubah. Dengan itu, kontraknya jelas dan implementasinya bebas berubah selama kedua method itu tetap ada.',
      ),
      p(
        'Di React 19, `ref` sudah bisa diterima sebagai prop biasa untuk komponen fungsi sehingga `forwardRef` tidak lagi selalu diperlukan. Yang tetap berlaku adalah prinsipnya, yaitu sediakan antarmuka yang sempit alih-alih membuka seluruh elemen. Perintah imperatif seperti fokus dan gulir memang cocok untuk pola ini, dan sisanya lebih baik lewat props.',
      ),
      callout(
        'tip',
        'Ketiganya jarang diperlukan, dan itu memang seharusnya',
        '`useId` diperlukan setiap kali komponen menghasilkan id sendiri. `useSyncExternalStore` diperlukan saat berlangganan ke sumber di luar React, terutama kalau kamu menulis pustaka. `useImperativeHandle` diperlukan saat pemanggil memang butuh memerintah komponenmu. Kalau tidak ada di antara ketiganya, kamu tidak membutuhkannya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada hook-hook ini, dan seluruhnya menyangkut hal yang tidak punya jalan keluar lain.',
      ),
      code(
        'text',
        `
        const id = \`kolom-\${Math.random()}\`;
        <input id={id} />

        Warning: Prop \`id\` did not match. Server: "kolom-0.234" Client: "kolom-0.871"
        `,
        { caption: 'Nilai acak berbeda antara server dan klien.' },
      ),
      p(
        'Ini ketidakcocokan hidrasi, dan akibatnya lebih besar dari sekadar peringatan. React bisa membuang seluruh HTML dari server lalu menggambar ulang dari nol di klien, sehingga keuntungan rendering di server hilang. `useId` menyelesaikannya sebab nilainya ditentukan dari posisi komponen di pohon, bukan dari sumber acak.',
      ),
      code(
        'text',
        `
        <Kolom label="Email" />
        <Kolom label="Email cadangan" />
        // keduanya memakai id="email" yang ditulis tetap

        // Mengklik label kedua memfokuskan kolom PERTAMA.
        // Tidak ada error.
        `,
        { caption: 'Id tetap pada komponen yang dipakai berulang.' },
      ),
      p(
        'Tidak ada error sebab HTML tidak melarang id ganda, hanya perilakunya menjadi tidak terduga. Peramban menghubungkan label ke elemen pertama yang idnya cocok. Gejalanya khas dan mudah dikenali, yaitu mengklik label memfokuskan kolom yang salah. Pemeriksa aksesibilitas juga menandainya.',
      ),
      code(
        'text',
        `
        useSyncExternalStore(langganan, () => navigator.onLine);
        // argumen ketiga tidak diberikan

        Error: Missing getServerSnapshot, which is required for server-rendered
        content. Will revert to client rendering.
        `,
        { caption: 'Cara membaca nilai di server tidak disediakan.' },
      ),
      p(
        'Pesannya menyebut akibatnya, yaitu React kembali ke rendering di klien untuk bagian itu. Argumen ketiga diperlukan sebab server tidak punya `navigator`, dan tanpa nilai apa pun React tidak bisa menghasilkan HTML. Berikan nilai yang masuk akal sebagai bawaan, dan untuk keadaan jaringan biasanya `true`.',
      ),
      code(
        'text',
        `
        useSyncExternalStore(
          langganan,
          () => ({ lebar: window.innerWidth }),   // object BARU tiap panggilan
        );

        Error: The result of getSnapshot should be cached to avoid an infinite loop
        `,
        { caption: 'Fungsi pembaca mengembalikan object baru setiap kali dipanggil.' },
      ),
      p(
        'React memanggil fungsi pembaca berkali-kali dan membandingkan hasilnya dengan `Object.is` untuk tahu apakah perlu menggambar ulang. Object baru selalu berbeda, sehingga ia menyimpulkan nilainya berubah terus dan terbentuk putaran. Kembalikan nilai primitif, atau simpan objectnya di variabel di luar dan perbarui hanya saat nilainya benar-benar berubah.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          ['`Prop \\`id\\` did not match`', 'Id dihasilkan dari nilai acak', 'Pakai `useId`'],
          [
            'Label memfokuskan kolom yang salah',
            'Id tetap pada komponen yang dipakai berulang',
            'Pakai `useId` sebagai awalan',
          ],
          [
            '`Missing getServerSnapshot`',
            'Argumen ketiga tidak diberikan',
            'Sediakan nilai bawaan untuk server',
          ],
          [
            '`The result of getSnapshot should be cached`',
            'Fungsi pembaca mengembalikan object baru',
            'Kembalikan primitif, atau simpan objectnya di luar',
          ],
          [
            'Pemanggil bisa mengubah apa pun pada elemen',
            '`ref` diteruskan tanpa dibatasi',
            'Pakai `useImperativeHandle` untuk menyempitkan kontraknya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Hook-hook ini jarang dipakai, dan kesalahan yang muncul biasanya berupa memakainya untuk hal yang salah atau tidak tahu ia ada.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `Math.random()` atau penghitung global untuk id',
            'Yang penting unik',
            'Nilainya berbeda antara server dan klien, sehingga terjadi ketidakcocokan hidrasi',
          ],
          [
            'Memakai `useId` sebagai kunci daftar',
            'Ia kan menghasilkan id unik',
            'Ia stabil per komponen, bukan per data. Untuk `key`, pakai id yang melekat pada datanya',
          ],
          [
            'Memanggil `useId` beberapa kali dalam satu komponen',
            'Tiap elemen butuh idnya sendiri',
            'Satu panggilan sudah cukup. Tambahkan akhiran untuk tiap elemen',
          ],
          [
            'Berlangganan sumber luar dengan `useState` dan `useEffect`',
            'Itu cara yang sudah dikuasai',
            'Nilainya bisa usang saat render dipotong. Untuk pustaka, `useSyncExternalStore` lebih benar',
          ],
          [
            'Memakai `useImperativeHandle` untuk membuka akses DOM',
            'Supaya pemanggil bisa mengaturnya',
            'Gunanya justru membatasi. Kalau kamu meneruskan seluruh elemen, hook ini tidak menambah apa pun',
          ],
          [
            'Memakai perintah imperatif untuk hal yang bisa lewat props',
            'Lebih langsung',
            'Props membuat alur datanya jelas dan bisa diikuti. Sisakan perintah untuk fokus, gulir, dan pemutaran media',
          ],
        ],
      ),
      p(
        'Baris kedua layak diluruskan sebab `useId` sering terlihat seperti jawaban untuk masalah `key`. Nilai yang ia hasilkan stabil per **posisi komponen**, sehingga dua baris daftar yang bertukar posisi akan bertukar id juga. Itu persis kebalikan dari yang dibutuhkan `key`, yang harus menyatakan identitas data bukan posisinya.',
      ),
      callout(
        'info',
        'Hook yang tidak dibahas di sini biasanya memang tidak kamu butuhkan',
        'React menyediakan beberapa hook lain yang sangat khusus, misalnya untuk penandaan performa dan untuk integrasi dengan alat pengembangan. Kalau kamu tidak menulis pustaka atau alat, hampir pasti kamu tidak akan menemuinya. Daftar hook yang benar-benar dipakai sehari-hari jauh lebih pendek daripada daftar lengkapnya.',
      ),
      references(
        {
          label: 'useId',
          href: 'https://react.dev/reference/react/useId',
          source: 'React',
          note: 'Termasuk peringatan resmi bahwa hook ini bukan untuk `key` dalam daftar.',
        },
        {
          label: 'useSyncExternalStore',
          href: 'https://react.dev/reference/react/useSyncExternalStore',
          source: 'React',
          note: 'Tiga argumennya, syarat snapshot yang stabil, dan kewajiban snapshot server saat SSR.',
        },
        {
          label: 'useDebugValue',
          href: 'https://react.dev/reference/react/useDebugValue',
          source: 'React',
          note: 'Label custom hook di React DevTools — tidak berpengaruh di produksi.',
        },
        {
          label: 'Navigator.onLine',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine',
          source: 'MDN Web Docs',
          note: 'Sumber data untuk contoh `useStatusJaringan`, beserta event `online`/`offline`-nya.',
        },
      ),
    ],
  ),

  written(
    'custom-hook',
    'Membuat Custom Hook',
    21,
    'Mengekstrak logika yang benar-benar berulang.',
    [
      p(
        'Bab 6 sudah memperkenalkan custom hook sebagai pengganti HOC dan render props. Sub-bab ini membahas cara merancangnya dengan baik — dan kapan sebaiknya tidak membuatnya sama sekali.',
      ),

      terms(
        {
          term: 'custom hook',
          meaning:
            'Fungsi buatanmu sendiri yang namanya diawali `use` dan memanggil hook lain di dalamnya. Awalan `use` bukan sekadar gaya penamaan — ia yang membuat linter tahu bahwa aturan hooks berlaku di dalam fungsi itu. Tanpa awalan itu, pelanggaran tidak akan terdeteksi.',
        },
        {
          term: 'mengekstrak (extract)',
          meaning:
            'Memindahkan sepotong logika keluar dari komponen ke tempatnya sendiri. Kata kuncinya "logika", bukan "baris". Mengekstrak untuk memendekkan komponen adalah alasan yang buruk — kompleksitasnya cuma pindah, dan sekarang pembaca harus membuka dua file untuk memahami satu alur.',
        },
        {
          term: 'small ≠ shallow',
          meaning:
            'Prinsip yang dipakai di seluruh materi ini: **kecil tidak sama dengan dangkal**. Satu komponen panjang yang utuh sering lebih mudah dibaca daripada lima potongan dangkal yang harus dibuka bergantian. Tunggu sampai pemakai kedua benar-benar muncul sebelum mengekstrak.',
        },
        {
          term: 'Higher-Order Component (HOC)',
          meaning:
            'Pola lama: fungsi yang menerima komponen dan mengembalikan komponen baru yang sudah "dibungkus" kemampuan tambahan. Custom hook menggantikannya untuk hampir semua kasus, karena ia berbagi **logika** tanpa menambah lapisan komponen di pohon.',
        },
        {
          term: 'render props',
          meaning:
            'Pola lama lainnya: mengoper fungsi sebagai `children` supaya komponen bisa "meminjamkan" state-nya. Sama seperti HOC, hampir seluruh kegunaannya kini ditutupi custom hook dengan kode yang jauh lebih sedikit bersarang.',
        },
        {
          term: 'return value',
          meaning:
            'Bentuk yang dikembalikan hook menentukan seberapa enak ia dipakai. Aturan praktisnya, satu nilai dikembalikan langsung, sepasang nilai dan setter dikembalikan sebagai array supaya pemanggil bebas menamainya, sedangkan tiga atau lebih dikembalikan sebagai objek supaya namanya sekaligus jadi dokumentasi.',
        },
        {
          term: 'matchMedia',
          meaning:
            "API browser untuk mengevaluasi media query dari JavaScript — `window.matchMedia('(max-width: 767px)')`. Objeknya punya properti `.matches` dan event `change`, kombinasi yang persis dibutuhkan `useSyncExternalStore`.",
        },
        {
          term: 'renderHook',
          meaning:
            'Fungsi dari `@testing-library/react` yang memasang sebuah hook di komponen uji minimal, supaya kamu bisa mengujinya tanpa membuat komponen palsu. Hasilnya dibaca lewat `result.current`.',
        },
        {
          term: 'act',
          meaning:
            'Pembungkus dari React yang memastikan seluruh pembaruan state selesai diproses sebelum baris berikutnya dijalankan. Tanpanya, assertion-mu bisa berjalan sebelum React sempat melakukan re-render — dan test-nya gagal secara acak.',
        },
      ),

      h2('Kapan mengekstrak'),
      table(
        ['Ekstrak kalau…', 'Jangan ekstrak kalau…'],
        [
          ['Logika yang sama muncul di 2+ komponen', 'Baru dipakai di satu tempat'],
          ['Ada beberapa hook yang selalu dipakai bersama', 'Hanya untuk memendekkan komponen'],
          ['Logikanya bisa diberi nama yang bermakna', 'Namanya jadi `useLogikaKomponenX`'],
          ['Ia menyembunyikan detail yang tidak relevan', 'Pemanggil tetap harus tahu isinya'],
        ],
      ),
      callout(
        'warning',
        'Hook dengan satu pemanggil biasanya hanya memindahkan kode',
        'Komponen tidak jadi lebih sederhana — kompleksitasnya cuma pindah ke file lain, dan sekarang pembaca harus membuka dua file untuk memahami satu alur. Ini bentuk lain dari "small ≠ shallow". Tunggu sampai pemakai kedua benar-benar muncul.',
      ),

      h2('Merancang return value-nya'),
      code(
        'ts',
        `
        // Satu nilai: kembalikan langsung
        function useLebarJendela(): number { ... }

        // Dua nilai berpasangan nilai+setter: array (pemanggil bisa menamai bebas)
        function useToggle(awal = false): [boolean, () => void] { ... }

        // Tiga atau lebih: objek (nama jadi dokumentasi)
        function useAmbilData<T>(url: string): {
          data: T | null;
          memuat: boolean;
          gagal: Error | null;
          muatUlang: () => void;
        } { ... }
        `,
      ),
      p(
        'Aturan pemilihan bentuk kembalian ini bersandar pada perbedaan destructuring dari Bab 1, yaitu **array berbasis posisi, objek berbasis nama.** Untuk dua nilai, array lebih enak karena pemanggil bebas menamainya, sehingga `const [buka, toggleBuka] = useToggle()` dan `const [gelap, toggleGelap] = useToggle()` sama sahnya, persis seperti `useState`. Begitu jumlahnya tiga atau lebih, kebebasan itu berubah jadi beban, sebab pemanggil harus mengingat urutannya, dan menukar dua posisi menghasilkan bug yang tidak terdeteksi tipe kalau tipenya kebetulan sama. Objek menghapus masalah itu karena namanya melekat pada nilainya, sekaligus membuat pemanggil bebas mengambil hanya yang ia butuhkan. Nama field-nya pun jadi dokumentasi, sebab `{ data, memuat, gagal }` sudah menjelaskan bentuk hasilnya tanpa membuka berkas hook-nya.',
      ),

      h2('Contoh lengkap: `useMediaQuery`'),
      code(
        'ts',
        `
        'use client';

        import { useSyncExternalStore } from 'react';

        export function useMediaQuery(kueri: string): boolean {
          return useSyncExternalStore(
            (beriTahu) => {
              const mql = window.matchMedia(kueri);
              mql.addEventListener('change', beriTahu);
              return () => mql.removeEventListener('change', beriTahu);
            },
            () => window.matchMedia(kueri).matches,
            // Di server tidak ada matchMedia. Kembalikan false — dan sadari
            // konsekuensinya: render pertama SELALU menganggap kuerinya tidak cocok.
            () => false,
          );
        }
        `,
        { filename: 'src/hooks/use-media-query.ts' },
      ),
      code(
        'tsx',
        `
        const kurangiGerak = useMediaQuery('(prefers-reduced-motion: reduce)');
        const layarKecil = useMediaQuery('(max-width: 767px)');
        `,
      ),
      p(
        'Inilah imbalan dari seluruh kerumitan di atas, sebab pemakaiannya **satu baris** dan seluruh urusan berlangganan, membaca, serta membersihkan tersembunyi di dalam hook. Perhatikan kedua contoh memakai hook yang **sama persis** dengan kueri yang berbeda, dan itu tanda hook-nya dirancang benar, karena ia menerima kueri sebagai parameter alih-alih menuliskannya di dalam. Contoh pertama layak diperhatikan sendiri, sebab `prefers-reduced-motion` adalah preferensi sistem pengguna yang menandakan ia ingin animasi dikurangi, dan menghormatinya adalah bagian dari baseline aksesibilitas yang dianut project ini. Perlu diingat konsekuensi argumen ketiga tadi, sebab pada render pertama di server keduanya bernilai `false`, jadi jangan menjadikan nilai ini satu-satunya penentu apakah sesuatu ditampilkan.',
      ),
      p(
        'Ketiga argumen `useSyncExternalStore` menjawab tiga pertanyaan berbeda tentang `matchMedia`, yang merupakan sumber data di luar kendali React. Argumen pertama menjawab "bagaimana cara berlangganan", sebab ia mendaftarkan `beriTahu` sebagai pendengar event `change` pada `matchMedia` lalu mengembalikan fungsi untuk berhenti berlangganan. Pemanggilan `beriTahu` inilah yang memicu React membaca ulang nilainya. Argumen kedua menjawab "apa nilainya sekarang di browser", sebab `.matches` bernilai `true`/`false` tergantung kueri media saat ini cocok atau tidak. Argumen ketiga menjawab "apa nilainya di server", yang wajib ada karena Server Component tidak punya `window` atau `matchMedia` sama sekali. Mengembalikan `false` di sini berarti render pertama di server **selalu** mengasumsikan kuerinya tidak cocok, baru dikoreksi begitu kode berjalan di browser.',
      ),

      h2('Kesalahan yang sering muncul'),
      ol(
        '**Mengembalikan objek baru setiap render** sehingga pemanggil tidak bisa memakainya sebagai dependency dengan aman.',
        '**Menerima terlalu banyak opsi** sampai konfigurasinya lebih rumit daripada menulis ulang logikanya.',
        '**Menggabungkan beberapa tanggung jawab** — `useAuthDanTemaDanKeranjang` adalah tiga hook yang menyamar.',
        '**Lupa cleanup** pada listener atau langganan yang ia buat.',
        '**Mengira ia berbagi state.** Setiap pemanggil punya salinannya sendiri; untuk nilai bersama, pakai Context atau store.',
      ),

      h2('Menguji custom hook'),
      code(
        'ts',
        `
        import { act, renderHook } from '@testing-library/react';

        it('useToggle membalik nilainya', () => {
          const { result } = renderHook(() => useToggle(false));

          expect(result.current[0]).toBe(false);

          act(() => result.current[1]());
          expect(result.current[0]).toBe(true);
        });
        `,
      ),
      p(
        '`renderHook` memasang hook di komponen uji minimal, dan `act` memastikan React selesai memproses pembaruan sebelum assertion dijalankan.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Logika penyimpanan draf otomatis disalin di empat halaman, yaitu tunda sampai pengguna berhenti mengetik, simpan ke penyimpanan peramban, tangani kuota penuh, dan bersihkan draf yang lebih dari seminggu. Empat puluh baris di tiap tempat. Saat ditemukan bug pada penanganan kuota, tiga salinan diperbaiki dan yang keempat terlewat selama dua bulan.',
      ),
      p(
        'Custom hook membagi logika seperti ini. Ia hanya fungsi biasa yang namanya diawali `use` dan boleh memanggil hook lain.',
      ),
      code(
        'tsx',
        `
        export function useDraf<T>(kunci: string, nilaiAwal: T, { jedaMs = 800 } = {}) {
          // Nilai awal dibaca SEKALI, lewat bentuk fungsi supaya tidak
          // membaca penyimpanan pada tiap render.
          const [nilai, setNilai] = useState<T>(() => bacaDraf(kunci) ?? nilaiAwal);
          const [status, setStatus] = useState<'siap' | 'menyimpan' | 'gagal'>('siap');

          useEffect(() => {
            setStatus('menyimpan');

            const timer = setTimeout(() => {
              const berhasil = simpanDraf(kunci, nilai);
              setStatus(berhasil ? 'siap' : 'gagal');
            }, jedaMs);

            // Batalkan penyimpanan lama saat nilainya berubah lagi,
            // dan saat komponennya dilepas.
            return () => clearTimeout(timer);
          }, [kunci, nilai, jedaMs]);

          const hapus = useCallback(() => {
            hapusDraf(kunci);
            setNilai(nilaiAwal);
            // nilaiAwal sengaja tidak di dependensi: ia nilai awal, bukan nilai hidup.
            // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [kunci]);

          return { nilai, setNilai, status, hapus };
        }
        `,
        { filename: 'src/hook/useDraf.ts' },
      ),
      p(
        'Empat puluh baris di empat tempat menjadi satu berkas dan satu baris pemanggilan. Yang lebih penting dari penghematan barisnya, kini ada **satu tempat** yang harus diperbaiki saat ada bug. Kasus kuota penuh yang tadinya terlewat di satu salinan kini mustahil terlewat, sebab hanya ada satu salinan.',
      ),
      p(
        'Yang perlu ditegaskan, custom hook membagi **logika**, bukan state. Empat halaman yang memanggil `useDraf` masing-masing punya `nilai` dan `status` sendiri yang sepenuhnya terpisah. Ini sering disalahpahami, yaitu orang mengira memanggil hook yang sama berarti berbagi nilai yang sama. Untuk berbagi nilai antar-komponen, yang dibutuhkan konteks atau pustaka state.',
      ),
      p(
        'Komentar yang menonaktifkan aturan lint di sana **wajib disertai penjelasan**, dan di sini alasannya `nilaiAwal` memang hanya dipakai sebagai nilai awal bukan nilai yang harus diikuti. Menonaktifkan tanpa penjelasan membuat pembaca berikutnya tidak bisa membedakan yang disengaja dari yang lalai, dan itu jauh lebih merugikan daripada peringatannya sendiri.',
      ),
      code(
        'tsx',
        `
        // Bentuk kembalian: object untuk lebih dari dua nilai, array untuk dua.
        // Array memaksa pemakainya mengingat urutan.
        const { nilai, setNilai, status, hapus } = useDraf('catatan-7', '');

        // Bandingkan dengan bentuk array yang sulit dibaca:
        const [nilai, setNilai, status, hapus] = useDraf('catatan-7', '');
        //                       ^ urutan ketiga itu apa? harus buka berkasnya
        `,
        { caption: 'Object memberi nama, array memaksa mengingat urutan.' },
      ),
      callout(
        'tip',
        'Aturan tiga berlaku untuk hook juga',
        'Jangan membuat custom hook dari satu pemakaian. Tulis logikanya langsung di komponen lebih dulu, dan angkat setelah pemakai kedua atau ketiga muncul. Hook yang dirancang dari satu contoh hampir selalu salah bentuk, sebab kamu menebak apa yang akan berbeda antar-pemakai.',
      ),

      h2('Saat error-nya muncul'),
      p('Empat kegagalan berikut diuji dengan ESLint project ini dan React 19 sungguhan.'),
      code(
        'text',
        `
        function ambilDraf(kunci: string) {      // nama tidak diawali 'use'
          const [nilai, setNilai] = useState('');
          return { nilai, setNilai };
        }

        error  React Hook "useState" is called in function "ambilDraf" that is
        neither a React function component nor a custom React Hook function.
                                            react-hooks/rules-of-hooks
        `,
        { caption: 'Diuji dengan ESLint project ini. Awalan `use` bukan sekadar konvensi.' },
      ),
      p(
        'Yang lebih merugikan dari errornya adalah akibat sampingannya. Tanpa awalan `use`, plugin lint tidak memeriksa aturan hook di dalam fungsi itu sama sekali, sehingga pelanggaran seperti memanggil hook di dalam kondisi lolos tanpa satu pun peringatan. Awalan itu yang membuat seluruh pemeriksaan aktif.',
      ),
      code(
        'text',
        `
        function useDraf(kunci) {
          if (!kunci) return null;             // return lebih awal
          const [nilai, setNilai] = useState('');
        }

        error  React Hook "useState" is called conditionally.
        `,
        { caption: 'Custom hook tunduk pada aturan yang sama dengan komponen.' },
      ),
      p(
        'Ini sering terlupa sebab custom hook terlihat seperti fungsi biasa. Seluruh hook di dalamnya harus dipanggil di level teratas dan dalam urutan yang sama pada tiap pemanggilan. Panggil seluruh hook lebih dulu, lalu lakukan percabangan pada nilai yang dikembalikan.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          const timer = setTimeout(simpan, 800);
        }, [nilai]);
        // tanpa clearTimeout

        // Pengguna mengetik 10 huruf. 10 timer berjalan.
        // Sepuluh penyimpanan terjadi, dan kuota cepat penuh.
        `,
        { caption: 'Efek di dalam hook tidak membersihkan pekerjaan sebelumnya.' },
      ),
      p(
        'Karena logikanya kini dipakai empat halaman, satu kebocoran menjadi empat kali lipat dampaknya. Ini justru alasan tambahan untuk menulisnya dengan benar sekali, sebab perbaikan di satu tempat menyembuhkan seluruh pemakainya. Fungsi pembersih dijalankan sebelum efek berikutnya dan saat komponen dilepas, seperti diukur di Sub-bab 7.4.',
      ),
      code(
        'text',
        `
        const { nilai } = useDraf('catatan', '');
        // di komponen lain:
        const { nilai } = useDraf('catatan', '');

        // Keduanya punya state SENDIRI. Mengetik di satu tidak
        // mengubah yang lain, walaupun kuncinya sama.
        `,
        { caption: 'Custom hook membagi logika, bukan state.' },
      ),
      p(
        'Tidak ada error, dan ini kesalahpahaman yang paling sering. Dua komponen yang memanggil hook yang sama punya state yang terpisah sepenuhnya, sebab tiap pemanggilan hook menciptakan slot state sendiri. Kalau keduanya memang harus berbagi nilai, yang dibutuhkan konteks atau pustaka state. Kuncinya yang sama hanya berarti keduanya menulis ke tempat penyimpanan yang sama, dan itu justru bisa saling menimpa.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`is neither a React function component nor a custom React Hook`',
            'Nama fungsi tidak diawali `use`',
            'Ganti namanya, supaya aturan hook ikut diperiksa',
          ],
          [
            '`React Hook is called conditionally`',
            'Hook dipanggil setelah `return` di dalam custom hook',
            'Panggil seluruh hook di level teratas',
          ],
          [
            'Timer atau langganan menumpuk',
            'Efek di dalam hook tidak punya pembersih',
            'Kembalikan fungsi pembersih dari efeknya',
          ],
          [
            'Dua komponen tidak berbagi nilai',
            'Custom hook membagi logika, bukan state',
            'Pakai konteks atau pustaka state untuk berbagi nilai',
          ],
          [
            'Pemakai harus mengingat urutan nilai kembalian',
            'Hook mengembalikan array untuk banyak nilai',
            'Kembalikan object dengan nama',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Custom hook adalah pengganti yang tepat untuk sebagian besar pemakaian HOC dan render props, dan ia punya kesalahannya sendiri.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengira custom hook berbagi state antar-komponen',
            'Fungsinya kan sama',
            'Tiap pemanggilan punya state sendiri. Untuk berbagi nilai, pakai konteks',
          ],
          [
            'Membuat custom hook dari satu pemakaian',
            'Supaya rapi sejak awal',
            'Bentuknya hampir selalu salah. Tulis di komponen dulu, angkat setelah pemakai kedua',
          ],
          [
            'Menamai fungsi tanpa awalan `use`',
            'Ia kan fungsi biasa',
            'Plugin lint tidak memeriksa aturan hook di dalamnya, sehingga pelanggaran lolos',
          ],
          [
            'Mengembalikan array untuk lebih dari dua nilai',
            'Seperti `useState`',
            'Pemakainya harus mengingat urutan dan tidak bisa melewati satu. Pakai object',
          ],
          [
            'Membuat satu hook raksasa untuk seluruh halaman',
            'Semua logika di satu tempat',
            'Menjadi ratusan baris dan sulit diuji. Pecah per tanggung jawab',
          ],
          [
            'Menonaktifkan `exhaustive-deps` tanpa penjelasan',
            'Aturannya terlalu rewel',
            'Pembaca berikutnya tidak bisa membedakan yang disengaja dari yang lalai. Tulis alasannya di komentar',
          ],
        ],
      ),
      p(
        'Baris pertama adalah kesalahpahaman yang paling mahal waktunya. Dua komponen yang sama-sama memanggil `useKeranjang` akan punya keranjang yang berbeda, dan itu bisa lama disadari sebab kodenya terlihat benar. Custom hook adalah cara berbagi **cara kerja**, dan berbagi **nilai** menuntut alat yang berbeda.',
      ),
      callout(
        'info',
        'Custom hook bisa diuji tanpa merender komponen',
        'Pustaka pengujian React menyediakan cara memanggil hook di lingkungan uji tanpa membuat komponen pembungkus. Karena logikanya terpisah dari tampilan, mengujinya jauh lebih cepat dan lebih sedikit yang perlu disiapkan. Ini salah satu keuntungan nyata memindahkan logika ke hook.',
      ),
      references(
        {
          label: 'Reusing Logic with Custom Hooks',
          href: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
          source: 'React',
          note: 'Panduan resmi merancang custom hook, termasuk kapan sebaiknya tidak membuatnya.',
        },
        {
          label: 'Rules of Hooks — hanya dari komponen atau hook lain',
          href: 'https://react.dev/reference/rules/rules-of-hooks',
          source: 'React',
          note: 'Kenapa awalan `use` bukan sekadar konvensi penamaan.',
        },
        {
          label: 'Window.matchMedia()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia',
          source: 'MDN Web Docs',
          note: 'API yang dipakai contoh `useMediaQuery`, beserta event `change`-nya.',
        },
        {
          label: 'act()',
          href: 'https://react.dev/reference/react/act',
          source: 'React',
          note: 'Pembungkus yang memastikan pembaruan selesai sebelum assertion dijalankan.',
        },
      ),
    ],
  ),

  written(
    'praktik-tiga-hook',
    'Praktik: Tulis tiga custom hook untuk website ini',
    24,
    'Menerapkan langsung ke project yang sedang kamu baca.',
    [
      p(
        'Tiga hook berikut adalah kebutuhan nyata dari website yang sedang kamu baca. Masing-masing memakai konsep berbeda dari bab ini, dan ketiganya harus benar di lingkungan SSR — karena itu bagian yang paling sering salah.',
      ),

      terms(
        {
          term: 'media query',
          meaning:
            'Aturan CSS yang berlaku hanya pada kondisi tertentu — lebar layar, orientasi, atau preferensi pengguna. Contoh: `(max-width: 767px)`. Dari JavaScript, kondisi yang sama bisa dievaluasi dengan `window.matchMedia`.',
        },
        {
          term: 'prefers-reduced-motion',
          meaning:
            'Media query yang membaca setelan sistem operasi pengguna: "kurangi gerak". Menghormatinya **bukan penyempurnaan** — bagi sebagian orang animasi memicu pusing dan mual, jadi ini bagian dari baseline aksesibilitas project ini.',
        },
        {
          term: 'debounce',
          meaning:
            'Menunggu jeda tetap setelah masukan terakhir sebelum bertindak. Nama teknisnya dari elektronika: menghilangkan "pantulan" saklar. Untuk mengurangi jumlah **render**, `useDeferredValue` lebih baik; debounce tetap tepat untuk mengurangi jumlah **permintaan jaringan**.',
        },
        {
          term: 'setTimeout / clearTimeout',
          meaning:
            'Pasangan API browser untuk menjadwalkan sesuatu di masa depan dan membatalkannya. `setTimeout` mengembalikan sebuah id; `clearTimeout(id)` membatalkannya. Di dalam Effect, pembatalan itu **wajib** ada di cleanup — kalau tidak, timer lama tetap berjalan setelah nilainya berubah.',
        },
        {
          term: 'generic `<T>`',
          meaning:
            'Notasi TypeScript untuk "tipe yang ditentukan saat dipakai". Pada `useDebouncedValue<T>(nilai: T): T`, ia berarti "apa pun tipe yang kamu masukkan, itu juga yang keluar" — string masuk, string keluar, tanpa perlu menulis satu versi hook per tipe.',
        },
        {
          term: 'Clipboard API',
          meaning:
            'API browser untuk membaca dan menulis clipboard lewat `navigator.clipboard`. Dua syaratnya sering mengejutkan: halaman harus dilayani lewat HTTPS (atau `localhost`), dan aksinya harus dipicu interaksi pengguna. Karena itu kegagalannya nyata dan harus ditangani.',
        },
        {
          term: 'aria-live="polite"',
          meaning:
            'Atribut yang membuat screen reader **mengumumkan** perubahan isi sebuah elemen — "polite" berarti menunggu jeda alami, tidak memotong. Tanpa ini, feedback "Tersalin" hanya ada secara visual, dan pengguna screen reader tidak tahu tombolnya berhasil.',
        },
        {
          term: 'feedback',
          meaning:
            'Konfirmasi yang diberikan antarmuka setelah pengguna bertindak. Aturannya di project ini: feedback harus bisa **dilihat dan didengar**. Perubahan warna saja tidak cukup, dan itulah alasan poin ketiga di daftar bawah bukan sekadar saran.',
        },
      ),

      h2('Hook 1 — `useMediaQuery`'),
      p(
        '**Tujuan:** menyembunyikan sidebar di layar kecil dan mematikan animasi saat pengguna meminta gerak yang dikurangi.',
      ),
      ul(
        'Pakai `useSyncExternalStore`, bukan `useState` + `useEffect`.',
        'Sediakan snapshot server yang mengembalikan `false`.',
        'Bersihkan listener saat kuerinya berubah, bukan hanya saat unmount.',
      ),
      code(
        'tsx',
        `
        // Pemakaiannya
        const kurangiGerak = useMediaQuery('(prefers-reduced-motion: reduce)');

        <div className={kurangiGerak ? '' : 'transition-transform duration-200'}>
        `,
      ),
      callout(
        'info',
        'Kenapa `prefers-reduced-motion` bukan opsional',
        'Bagi sebagian orang, animasi bukan sekadar tidak disukai — ia memicu pusing dan mual. Menghormati preferensi ini adalah bagian dari baseline aksesibilitas project ini, bukan penyempurnaan.',
      ),

      h2('Hook 2 — `useDebouncedValue`'),
      p('**Tujuan:** kotak pencarian glosarium tidak boleh memfilter ulang di setiap ketikan.'),
      code(
        'ts',
        `
        export function useDebouncedValue<T>(nilai: T, jeda = 250): T {
          const [tertunda, setTertunda] = useState(nilai);

          useEffect(() => {
            const timer = setTimeout(() => setTertunda(nilai), jeda);
            return () => clearTimeout(timer);
          }, [nilai, jeda]);

          return tertunda;
        }
        `,
      ),
      p(
        'Bentuknya berbeda dari `debounce` di Frontend Basic, meski tujuannya sama. Di sana yang ditunda adalah **pemanggilan fungsi**, sedangkan di sini yang ditunda adalah **nilai**, karena hook ini menerima nilai terbaru dan mengembalikan versi yang tertinggal beberapa ratus milidetik. Perhatikan Effect-nya memasang `setTimeout` lalu mengembalikan `clearTimeout` sebagai cleanup, dan `[nilai, jeda]` sebagai dependensi. Itu kombinasi yang menyelesaikan ketiga hal di daftar uji sekaligus. Tiap ketikan mengubah `nilai`, sehingga cleanup membatalkan timer sebelumnya sebelum yang baru dipasang, dan hanya ketikan terakhir yang bertahan penuh selama jeda. Cleanup yang sama juga berjalan saat komponen dilepas, sehingga tidak ada `setTertunda` yang dipanggil setelah komponennya hilang. Inilah contoh yang bagus untuk aturan sub-bab cleanup, sebab satu pasangan pasang–batalkan menutup tiga skenario berbeda tanpa kode tambahan.',
      ),
      p('Uji sendiri tiga hal ini:'),
      ol(
        'Ketik cepat sepuluh huruf — nilai tertunda hanya boleh berubah sekali di akhir.',
        'Ubah `jeda` saat komponennya hidup — timer lama harus dibatalkan.',
        'Lepas komponennya saat timer sedang berjalan — tidak boleh ada `setState` setelah unmount.',
      ),
      callout(
        'tip',
        'Bandingkan dengan `useDeferredValue`',
        'Untuk kasus ini, `useDeferredValue` sebenarnya pilihan yang lebih baik: ia menyesuaikan dengan kecepatan perangkat alih-alih memakai jeda tetap. Debounce tetap tepat kalau yang ingin kamu kurangi adalah **jumlah permintaan jaringan**, bukan jumlah render.',
      ),

      h2('Hook 3 — `useSalinKeClipboard`'),
      p(
        '**Tujuan:** tombol salin di setiap blok kode, dengan feedback "Tersalin" yang hilang sendiri.',
      ),
      code(
        'ts',
        `
        export function useSalinKeClipboard(durasi = 2000) {
          const [tersalin, setTersalin] = useState(false);

          async function salin(teks: string) {
            try {
              await navigator.clipboard.writeText(teks);
              setTersalin(true);
              return true;
            } catch {
              // Clipboard API butuh HTTPS dan izin. Kegagalannya harus
              // terlihat oleh pemanggil, bukan ditelan diam-diam.
              setTersalin(false);
              return false;
            }
          }

          useEffect(() => {
            if (!tersalin) return;
            const timer = setTimeout(() => setTersalin(false), durasi);
            return () => clearTimeout(timer);
          }, [tersalin, durasi]);

          return { tersalin, salin };
        }
        `,
      ),
      p('Tiga detail yang membedakannya dari versi asal jadi:'),
      ol(
        '**Kegagalan dikembalikan**, tidak ditelan. Pemanggil bisa menampilkan pesan alternatif.',
        '**Timer dibersihkan** — kalau tidak, menekan salin dua kali membuat penanda hilang lebih cepat dari yang seharusnya.',
        '**Feedback juga harus terdengar.** Perubahan visual saja tidak cukup; tambahkan `aria-live="polite"` supaya screen reader mengumumkannya.',
      ),

      divider,

      checklist(
        'fi7-praktik',
        'Checklist praktik bab ini',
        'Tulis `useMediaQuery` dengan `useSyncExternalStore`, lengkap dengan snapshot server',
        'Tulis `useDebouncedValue` dan uji ketiga skenario di atas',
        'Tulis `useSalinKeClipboard` yang mengembalikan status kegagalan',
        'Cari setiap `useEffect` di kodemu dan jawab: sistem luar apa yang ia selaraskan?',
        'Hapus setiap Effect yang ternyata hanya menghitung derived value',
        'Ganti satu Effect penyalin props dengan `key` atau pemakaian props langsung',
        'Pastikan setiap listener dan timer punya cleanup yang benar',
        'Jalankan dengan Strict Mode aktif dan pastikan tidak ada efek ganda yang tertinggal',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Panel pencarian produk menggabungkan tiga hook sekaligus, yaitu state untuk kata kunci, efek untuk memanggil server dengan pembatalan, dan ref untuk memfokuskan kotak input saat pintasan keyboard ditekan. Ketiganya sudah dibahas terpisah, dan yang membuat praktik ini layak ditulis adalah **bagaimana ketiganya saling mempengaruhi**.',
      ),
      code(
        'tsx',
        `
        'use client';

        export function PanelCari({ onPilih }: { onPilih: (p: Produk) => void }) {
          const [kata, setKata] = useState('');
          const [keadaan, setKeadaan] = useState<Keadaan<Produk[]>>({ status: 'kosong' });

          const kotakRef = useRef<HTMLInputElement>(null);
          const idPermintaan = useRef(0);

          // 1. Pintasan keyboard. Berlangganan sekali, lepas saat dilepas.
          useEffect(() => {
            function tangani(peristiwa: KeyboardEvent) {
              if (peristiwa.key === '/' && document.activeElement !== kotakRef.current) {
                peristiwa.preventDefault();
                kotakRef.current?.focus();
              }
            }
            document.addEventListener('keydown', tangani);
            return () => document.removeEventListener('keydown', tangani);
          }, []);

          // 2. Pencarian: debounce, pembatalan, dan penjaga respons basi.
          useEffect(() => {
            if (kata.trim() === '') {
              setKeadaan({ status: 'kosong' });
              return;
            }

            const kendali = new AbortController();
            const idSaya = ++idPermintaan.current;

            const timer = setTimeout(async () => {
              setKeadaan((lama) =>
                lama.status === 'sukses'
                  ? { status: 'memuat-ulang', data: lama.data }
                  : { status: 'memuat' },
              );

              try {
                const hasil = await cariProduk(kata.trim(), kendali.signal);
                if (idSaya !== idPermintaan.current) return;
                setKeadaan(
                  hasil.length === 0 ? { status: 'kosong' } : { status: 'sukses', data: hasil },
                );
              } catch (galat) {
                if ((galat as Error).name === 'AbortError') return;
                if (idSaya !== idPermintaan.current) return;
                setKeadaan({ status: 'gagal', galat: galat as Error });
              }
            }, 400);

            // Dijalankan saat 'kata' berubah DAN saat komponen dilepas.
            return () => {
              clearTimeout(timer);
              kendali.abort();
            };
          }, [kata]);

          return (
            <div>
              <input
                ref={kotakRef}
                value={kata}
                onChange={(e) => setKata(e.currentTarget.value)}
                placeholder="Tekan / untuk mencari"
                aria-label="Cari produk"
              />
              <HasilCari keadaan={keadaan} onPilih={onPilih} adaKata={kata.trim() !== ''} />
            </div>
          );
        }
        `,
        { filename: 'src/cari/PanelCari.tsx' },
      ),
      p(
        'Efek pertama punya dependensi kosong dan itu benar, sebab penangan keyboardnya hanya memakai `kotakRef` yang identitasnya stabil selamanya. Kalau ia memakai `kata`, dependensi kosong akan membuatnya memegang nilai dari render pertama selamanya, dan itu bug nilai basi yang dibahas di Sub-bab 7.4.',
      ),
      p(
        'Efek kedua memuat tiga penjaga sekaligus, dan ketiganya diperlukan. `clearTimeout` membatalkan penundaan yang belum sempat berjalan. `kendali.abort()` menghentikan permintaan yang sudah melayang. Dan `idSaya !== idPermintaan.current` menangkap kasus permintaan yang terlanjur selesai tepat sebelum dibatalkan. Melewatkan salah satunya menyisakan satu kelas bug.',
      ),
      p(
        'Penjaga id muncul **dua kali**, yaitu di jalur sukses dan di jalur gagal. Tanpa penjaga di jalur gagal, permintaan lama yang kehabisan waktu akan menimpa hasil permintaan baru yang sudah berhasil dengan pesan kesalahan. Ini bug yang hanya muncul pada urutan waktu tertentu dan sangat sulit direproduksi tanpa pembatas jaringan.',
      ),
      p(
        'Pemakaian `useRef` untuk `idPermintaan` adalah pilihan yang tepat sebab nilainya **tidak ditampilkan**. Menyimpannya sebagai state akan memicu penggambaran ulang pada tiap ketikan tanpa satu pun manfaat. Ini penerapan langsung aturan dari Sub-bab 7.7, yaitu kalau nilainya tidak muncul di layar, tempatnya `ref`.',
      ),
      callout(
        'tip',
        'Ketiga penjaga itu bisa diangkat menjadi satu custom hook',
        'Pola debounce, pembatalan, dan penjaga respons basi berulang di hampir setiap kotak pencarian. Setelah kamu menulisnya dua kali, angkat menjadi `usePencarian` seperti dibahas di Sub-bab 7.14. Yang penting menulisnya dengan tangan lebih dulu, supaya kamu tahu apa yang hook itu sembunyikan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering saat ketiga hook dipakai bersama, dan seluruhnya hanya muncul pada jaringan yang tidak sempurna.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          function tangani(e) { if (e.key === 'Enter') cari(kata); }
          document.addEventListener('keydown', tangani);
          return () => document.removeEventListener('keydown', tangani);
        }, []);   // 'kata' dipakai tapi tidak di dependensi

        warning  React Hook useEffect has a missing dependency: 'kata'.
        `,
        { caption: 'Penangan memegang nilai dari render pertama selamanya.' },
      ),
      p(
        'Gejalanya khas, yaitu menekan Enter selalu mencari kata kosong tidak peduli apa yang diketik. Penangan yang dipasang sekali memegang closure dari render pertama, dan di sana `kata` masih teks kosong. Ada dua jalan keluar, yaitu menambahkan `kata` ke dependensi sehingga penangannya dipasang ulang, atau menyimpan nilainya di `ref` yang selalu terbaru.',
      ),
      code(
        'text',
        `
        # Pengguna mengetik 'kaos' lalu 'kaos polos'.
        # Jaringan lambat, jawaban untuk 'kaos' datang belakangan.

        # Layar menampilkan hasil 'kaos'. Tidak ada error.
        `,
        { caption: 'Penjaga respons basi tidak ada.' },
      ),
      p(
        'Ini race condition dari Bab 3 Frontend Basic yang muncul dalam bentuk efek. Pembatalan lewat `AbortController` menutup sebagian besar kasusnya, dan penjaga id menutup sisanya yaitu permintaan yang terlanjur selesai tepat sebelum dibatalkan. Keduanya dipakai bersama, bukan salah satu.',
      ),
      code(
        'text',
        `
        # Pengguna mengetik cepat lalu berpindah halaman.

        Uncaught (in promise) AbortError: This operation was aborted
        `,
        { caption: 'Pembatalan yang disengaja tidak dibedakan dari kegagalan.' },
      ),
      p(
        "Setiap perubahan kata membatalkan permintaan sebelumnya, dan pembatalan itu melempar. Kalau `catch` tidak memeriksa `AbortError` lebih dulu, pengguna akan melihat pesan kegagalan setiap kali ia mengetik satu huruf lagi. Baris `if (galat.name === 'AbortError') return` harus menjadi baris pertama di dalam `catch`.",
      ),
      code(
        'text',
        `
        useEffect(() => {
          document.addEventListener('keydown', tangani);
        }, []);
        // tanpa removeEventListener

        # Pengguna bolak-balik lima kali. Lima penangan aktif.
        # Menekan / memfokuskan kotak yang sudah tidak ada di halaman.
        `,
        { caption: 'Langganan global tidak dilepas saat komponen dilepas.' },
      ),
      p(
        'Penangan pada `document` bertahan selama halamannya hidup, sehingga komponen yang sudah dilepas tetap menanggapinya. Selain perilaku yang salah, penangan itu memegang rujukan ke komponennya sehingga menahan seluruh isinya di memori. Ini kebocoran yang paling sering di aplikasi satu halaman, dan pencegahannya satu baris di fungsi pembersih.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Penangan selalu memakai nilai lama',
            'Dependensi tidak lengkap pada efek berlangganan',
            'Tambahkan ke dependensi, atau simpan nilainya di `ref`',
          ],
          [
            'Layar menampilkan hasil pencarian yang lama',
            'Tidak ada pembatalan dan penjaga id',
            'Pakai `AbortController` di pembersih, dan periksa nomor permintaan',
          ],
          [
            '`AbortError` muncul sebagai pesan kegagalan',
            'Pembatalan disengaja tidak dibedakan',
            "Periksa `galat.name === \\'AbortError\\'` sebagai baris pertama `catch`",
          ],
          [
            'Penangan global menumpuk setelah bolak-balik',
            'Langganan tidak dilepas di pembersih',
            'Kembalikan `removeEventListener` dari efeknya',
          ],
          [
            'Halaman digambar ulang tiap ketikan tanpa perlu',
            'Nilai internal disimpan sebagai state',
            'Simpan di `ref` kalau nilainya tidak ditampilkan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Praktik penutup bab ini menggabungkan seluruh materi, dan kesalahan yang muncul hampir selalu berupa satu penjaga yang terlewat.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai debounce saja tanpa pembatalan',
            'Jumlah permintaan sudah berkurang',
            'Permintaan yang sudah berangkat tetap bisa datang tidak berurutan. Keduanya menyelesaikan masalah yang berbeda',
          ],
          [
            'Memakai pembatalan saja tanpa penjaga id',
            'Permintaan lama sudah dibatalkan',
            'Permintaan yang terlanjur selesai tepat sebelum dibatalkan tetap lolos. Penjaga id menutup celah itu',
          ],
          [
            'Menyimpan nomor permintaan sebagai state',
            'Ia kan berubah',
            'Nilainya tidak ditampilkan, dan menyimpannya sebagai state memicu render tiap ketikan. Pakai `ref`',
          ],
          [
            'Memasang penangan global tanpa melepasnya',
            'Komponennya jarang dilepas',
            'Di aplikasi satu halaman ia dilepas tiap perpindahan. Penangan menumpuk dan menahan memori',
          ],
          [
            'Menguji hanya di jaringan cepat',
            'Alurnya kan sama',
            'Race condition, pembatalan, dan keadaan memuat semuanya hanya muncul saat lambat. Pakai pembatas jaringan',
          ],
          [
            'Mengangkat menjadi custom hook sebelum menulisnya dengan tangan',
            'Supaya rapi sejak awal',
            'Kamu tidak tahu apa yang hook itu sembunyikan, sehingga saat ada bug kamu tidak tahu di mana mencarinya',
          ],
        ],
      ),
      p(
        'Baris kedua adalah celah yang paling sering tersisa setelah orang menambahkan pembatalan dan merasa selesai. Urutannya begini, yaitu permintaan A selesai, lalu pengguna mengetik sehingga A dibatalkan, dan pembatalan tidak berpengaruh pada permintaan yang sudah selesai. Hasil A tetap masuk ke penangan dan menimpa yang baru. Penjaga id adalah satu-satunya yang menutup ini.',
      ),
      callout(
        'info',
        'Yang kamu bawa dari bab ini ke bab berikutnya',
        'Hook dipanggil di level teratas dalam urutan yang sama. Efek untuk sinkronisasi dengan dunia luar, bukan untuk menghitung. Setiap efek yang memulai sesuatu wajib menghentikannya. `ref` untuk nilai yang tidak ditampilkan. Dan pengoptimalan diukur dulu, bukan ditebak. Bab berikutnya membahas state management, dan seluruh keputusan di sana bertumpu pada satu pertanyaan yang sudah muncul di bab ini, yaitu di mana sebuah nilai layak tinggal.',
      ),
      references(
        {
          label: 'prefers-reduced-motion',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion',
          source: 'MDN Web Docs',
          note: 'Media query preferensi pengguna yang wajib dihormati oleh hook pertama.',
        },
        {
          label: 'Clipboard API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API',
          source: 'MDN Web Docs',
          note: 'Syarat HTTPS dan izin yang membuat kegagalan `writeText` nyata, bukan teoretis.',
        },
        {
          label: 'setTimeout()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout',
          source: 'MDN Web Docs',
          note: 'Termasuk id kembalian yang dipakai `clearTimeout` di cleanup.',
        },
        {
          label: 'ARIA live regions',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions',
          source: 'MDN Web Docs',
          note: 'Cara membuat feedback "Tersalin" juga terdengar, bukan hanya terlihat.',
        },
      ),
    ],
  ),
];
