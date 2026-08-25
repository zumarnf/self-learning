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
    10,
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
    10,
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
    13,
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
    13,
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
    13,
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
    9,
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
    11,
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
    12,
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

  written('usecontext', '`useContext`', 10, 'Membaca nilai dari provider terdekat.', [
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

  written('usereducer-hook', '`useReducer`', 11, 'State kompleks dengan transisi yang eksplisit.', [
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
    11,
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
    12,
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
    10,
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
    13,
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
    13,
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
