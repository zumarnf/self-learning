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
          // pakai nama di sini
        }
        `,
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
        'Di project yang mengaktifkan React Compiler — termasuk website ini — beberapa pelanggaran pola hooks menjadi **error**, bukan peringatan. Compiler perlu bisa memprediksi kapan sebuah nilai berubah; kode yang melanggar aturan membuat prediksi itu mustahil, jadi ia menolak mengompilasinya.',
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

      h2('Yang BUKAN pekerjaan Effect'),
      ul(
        '**Menghitung nilai turunan.** Hitung saat render.',
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

      h2('Effect berjalan dua kali di development'),
      callout(
        'tip',
        'Itu fitur, bukan bug',
        'Dengan Strict Mode aktif, React sengaja memasang → melepas → memasang ulang setiap komponen di development. Effect yang cleanup-nya benar akan tetap berperilaku normal. Effect yang cleanup-nya kurang akan langsung menampakkan gejalanya — dua koneksi terbuka, dua pemanggilan API, dua listener menumpuk. Kalau Effect-mu rusak karena ini, ia memang sudah rusak sebelumnya; kamu hanya belum melihatnya.',
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
      callout(
        'danger',
        'Tanpa `abort`, kamu punya race condition',
        'Ketik "a" lalu cepat "ab". Permintaan "a" berangkat duluan tapi bisa tiba belakangan, lalu menimpa hasil "ab". Layar menampilkan hasil untuk kata kunci yang sudah tidak ada di kotak pencarian. Bug ini nyaris tidak pernah muncul di localhost dan muncul terus di jaringan sungguhan — dan inilah alasan utama data server sebaiknya diserahkan ke TanStack Query (Bab 5).',
      ),

      h2('Cleanup juga jalan saat dependency berubah'),
      p(
        'Bukan hanya saat unmount. Setiap kali Effect akan dijalankan ulang, cleanup yang lama dijalankan lebih dulu. Membaca cleanup sebagai "kode saat komponen hilang" adalah sumber kesalahan yang sama dengan model lifecycle di sub-bab sebelumnya.',
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

      h2('1. Menghitung nilai turunan'),
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
          notes: ['Dua sumber kebenaran', 'Satu render ekstra dengan total lama'],
        },
        {
          title: 'Benar',
          lang: 'tsx',
          code: `
          const [items, setItems] = useState([]);

          // Dihitung saat render. Tidak mungkin tidak sinkron.
          const total = items.reduce((n, i) => n + i.harga, 0);
          `,
          notes: ['Satu sumber kebenaran', 'Satu state lebih sedikit'],
        },
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
    ],
  ),

  written(
    'uselayouteffect',
    '`useLayoutEffect` vs `useEffect`',
    9,
    'Perbedaan waktu jalan dan akibatnya.',
    [
      p(
        'Keduanya punya API yang identik. Yang berbeda hanya **kapan** ia berjalan relatif terhadap saat browser menggambar layar — dan perbedaan itu menentukan apakah pengguna melihat kedipan.',
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
        'Browser menunggu sampai ia selesai sebelum menampilkan apa pun. Pekerjaan berat di dalamnya langsung terasa sebagai jeda. Pakai hanya ketika kedipan visual benar-benar terjadi tanpanya — jangan sebagai default "biar aman".',
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
      callout(
        'warning',
        'Kenapa aturan ini penting sekarang',
        'React berhak merender ulang komponen kapan saja, dan dengan fitur konkuren ia bisa memulai render lalu membatalkannya. Komponen yang membaca atau menulis ref saat render menghasilkan keluaran yang bergantung pada berapa kali ia dirender — sesuatu yang tidak bisa dijamin React.',
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

      h2('Ref berupa fungsi'),
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
    ],
  ),

  written(
    'usememo-usecallback',
    '`useMemo` & `useCallback` di era React Compiler',
    12,
    'Optimasi yang sekarang lebih sering otomatis.',
    [
      p(
        'Selama bertahun-tahun, `useMemo` dan `useCallback` ditaburkan di mana-mana "untuk berjaga-jaga". React Compiler mengubah situasinya secara mendasar — dan di project yang mengaktifkannya, memoisasi manual yang tidak perlu justru menjadi **error lint**.',
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

      h2('Apa yang React Compiler kerjakan'),
      p(
        'Compiler menganalisis komponenmu saat build dan menyisipkan memoisasi secara otomatis — pada nilai, pada fungsi, dan pada elemen JSX. Hasilnya sering lebih baik daripada memoisasi manual, karena ia bisa melihat seluruh komponen sekaligus dan tidak lupa memperbarui dependency.',
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
          notes: ['Compiler menyisipkan memoisasi yang setara', 'Tidak ada dependency untuk lupa'],
        },
      ),

      h2('Kenapa memoisasi manual bisa jadi error'),
      callout(
        'danger',
        'Aturan di project ini',
        'Website yang sedang kamu baca mengaktifkan React Compiler, dan `useMemo` yang tidak bisa dipertahankan Compiler adalah **error lint**, bukan peringatan. Begitu juga `setState` di dalam Effect. Keduanya disengaja: Compiler perlu bisa memprediksi kapan sebuah nilai berubah, dan pola-pola itu membuat prediksinya mustahil. Perbaiki polanya — jangan matikan aturannya.',
      ),

      h2('Kapan memoisasi manual masih diperlukan'),
      p(
        'Compiler tidak menghapus kebutuhan untuk berpikir. Tiga kasus ini masih membutuhkan `useMemo` eksplisit:',
      ),
      ol(
        '**Perhitungan yang benar-benar berat** — mengurutkan puluhan ribu baris, memfilter dataset besar, memparsing teks panjang. Compiler memoisasi berdasarkan struktur, bukan berdasarkan biaya.',
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
        'Aturan lamanya tetap berlaku: **ukur dulu**. Memoisasi bukan gratis — ia menyimpan nilai di memori dan menambah perbandingan di setiap render. Memoisasi yang tidak perlu membuat kode lebih lambat *dan* lebih sulit dibaca sekaligus.',
      ),
      callout(
        'info',
        '`React.memo` berbeda dan masih relevan',
        '`React.memo` membungkus komponen agar tidak merender ulang saat props-nya tidak berubah. Compiler tidak sepenuhnya menggantikannya, terutama untuk komponen berat yang menerima props stabil. Tapi sama seperti di atas: pasang setelah profiler menunjukkan masalahnya, bukan sebelumnya.',
      ),
    ],
  ),

  written('usecontext', '`useContext`', 10, 'Membaca nilai dari provider terdekat.', [
    p(
      '`useContext` membaca nilai dari `Provider` terdekat di atasnya. Bab 5 sudah membahas kapan Context tepat dipakai; sub-bab ini fokus pada mekanika hook-nya dan hal-hal yang mengejutkan saat memakainya.',
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
      '**Nilai awal `null`, bukan objek palsu.** Objek palsu membuat komponen yang lupa dipasang Provider tetap berjalan dengan nilai yang salah — bug diam. `null` membuatnya gagal keras.',
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
      'Setiap konsumen dirender ulang saat nilai context berubah, tanpa selector. Untuk nilai yang berubah sering, pecah context-nya berdasarkan frekuensi perubahan atau pindah ke store dengan selector — alasan lengkapnya ada di Bab 5.',
    ),
  ]),

  written('usereducer-hook', '`useReducer`', 11, 'State kompleks dengan transisi yang eksplisit.', [
    p(
      '`useReducer` memindahkan logika perubahan state dari komponen ke satu fungsi murni. Alih-alih memanggil beberapa `setState` yang tersebar, komponen mengirim **aksi** dan reducer memutuskan hasilnya.',
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

          // Keadaan mustahil bisa terjadi:
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
          // Keadaan mustahil tidak bisa dinyatakan.
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

    h2('Reducer harus fungsi murni'),
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

          return (
            <button disabled={pending}>
              {pending ? 'Memproses…' : children}
            </button>
          );
        }
        `,
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
        'Perbedaannya dengan pola optimistic di Bab 5: kamu tidak perlu menyimpan snapshot dan mengembalikannya sendiri. React otomatis membuang keadaan optimistik saat aksinya selesai — berhasil maupun gagal — lalu memakai data sebenarnya.',
      ),

      h2('Batas pemakaiannya'),
      p(
        'Aturan dari Bab 5 tetap berlaku dan tidak berubah karena hook-nya jadi lebih mudah: optimistic update cocok kalau kegagalannya jarang, murah, dan bisa dibatalkan tanpa merugikan. Untuk pembayaran, pemesanan berstok terbatas, atau apa pun yang tidak bisa ditarik kembali, tampilkan status "memproses" yang jujur.',
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
        'Store progres belajar di website yang sedang kamu baca dibangun dengan `useSyncExternalStore`. Argumen ketiga — snapshot untuk server — selalu mengembalikan keadaan kosong, karena `localStorage` tidak ada di server. Itulah sebabnya setiap komponen berdata di sini menampilkan skeleton sampai `hydrated` bernilai true.',
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

      h2('Merancang nilai kembaliannya'),
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
        '**Tujuan:** tombol salin di setiap blok kode, dengan umpan balik "Tersalin" yang hilang sendiri.',
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
        '**Umpan balik juga harus terdengar.** Perubahan visual saja tidak cukup; tambahkan `aria-live="polite"` supaya screen reader mengumumkannya.',
      ),

      divider,

      checklist(
        'fi7-praktik',
        'Checklist praktik bab ini',
        'Tulis `useMediaQuery` dengan `useSyncExternalStore`, lengkap dengan snapshot server',
        'Tulis `useDebouncedValue` dan uji ketiga skenario di atas',
        'Tulis `useSalinKeClipboard` yang mengembalikan status kegagalan',
        'Cari setiap `useEffect` di kodemu dan jawab: sistem luar apa yang ia selaraskan?',
        'Hapus setiap Effect yang ternyata hanya menghitung nilai turunan',
        'Ganti satu Effect penyalin props dengan `key` atau pemakaian props langsung',
        'Pastikan setiap listener dan timer punya cleanup yang benar',
        'Jalankan dengan Strict Mode aktif dan pastikan tidak ada efek ganda yang tertinggal',
      ),
    ],
  ),
];
