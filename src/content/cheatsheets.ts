import type { CodeLang } from '@/lib/content/types';

/**
 * Quick-reference sheets.
 *
 * Deliberately not a second copy of the lessons: each row is something you look up while typing
 * and forget again — syntax, a flag, an argument order. Explanations belong in the curriculum.
 *
 * Versions follow the curriculum, not the newest release (`node:22-alpine`, `actions/checkout@v4`,
 * Next.js 16, Laravel 11/12, PostgreSQL 16.15, Zod 4). A sheet that disagrees with the lesson it
 * summarises leaves the reader unsure which one is right. Every row was checked against the tool
 * itself where this machine has it; see plans/cheatsheet-perluasan/planning.md for which ones.
 *
 * Kept as one file on purpose: architecture-design/fondasi cites `src/content/cheatsheets.ts` as
 * part of this repository's own dependency graph, and `glossary.ts` sets the same precedent.
 */

/** Curriculum areas, in the order the navigation shows them. */
export const CHEATSHEET_GROUPS = [
  'Frontend',
  'Backend & data',
  'Keamanan',
  'Deployment & operasional',
  'Arsitektur & AI',
] as const;

export type CheatsheetGroup = (typeof CHEATSHEET_GROUPS)[number];

export type CheatsheetRow = { code: string; note: string };

export type CheatsheetSection = {
  title: string;
  lang: CodeLang;
  rows: CheatsheetRow[];
};

export type Cheatsheet = {
  slug: string;
  title: string;
  group: CheatsheetGroup;
  summary: string;
  sections: CheatsheetSection[];
};

export const cheatsheets: Cheatsheet[] = [
  /* ================================================================ Frontend */
  {
    slug: 'javascript',
    title: 'JavaScript',
    group: 'Frontend',
    summary:
      'Sintaks dan method yang paling sering dicari ulang. Nama pendek di contoh hanyalah tempat isian, bukan kata kunci. `arr` berarti array, `fn` fungsi, `o` object, `str` string, `n` angka, dan `i` indeks.',
    sections: [
      {
        title: 'Array',
        lang: 'js',
        rows: [
          { code: 'arr.map(fn)', note: 'Array baru hasil mengubah tiap elemen' },
          { code: 'arr.filter(fn)', note: 'Array baru berisi elemen yang lolos syarat' },
          {
            code: 'arr.reduce(fn, awal)',
            note: 'Ringkas array jadi satu nilai. Selalu beri nilai awal',
          },
          { code: 'arr.find(fn)', note: 'Elemen pertama yang cocok, atau `undefined`' },
          { code: 'arr.findIndex(fn)', note: 'Indeks elemen pertama yang cocok, atau `-1`' },
          { code: 'arr.includes(x)', note: 'Cek keberadaan nilai, termasuk `NaN`' },
          { code: 'arr.some(fn) / arr.every(fn)', note: 'Ada yang cocok, atau semuanya cocok' },
          { code: 'arr.flatMap(fn)', note: 'Map lalu ratakan satu tingkat' },
          { code: 'arr.at(-1)', note: 'Elemen terakhir tanpa menghitung panjang' },
          {
            code: 'arr.toSorted((a, b) => a - b)',
            note: 'Urutkan angka tanpa mengubah array asli. Tanpa fungsi, angka diurutkan sebagai teks',
          },
          { code: 'arr.with(i, nilai)', note: 'Salinan dengan satu elemen diganti' },
          { code: '[...new Set(arr)]', note: 'Buang duplikat' },
          {
            code: 'Object.groupBy(arr, fn)',
            note: 'Kelompokkan jadi objek, satu key per kelompok',
          },
          {
            code: 'Array.from({ length: n }, (_, i) => i)',
            note: 'Buat array berisi 0 sampai n-1',
          },
        ],
      },
      {
        title: 'Object',
        lang: 'js',
        rows: [
          {
            code: 'Object.entries(o)',
            note: 'Pasangan `[key, value]`, bisa diulang dengan `for...of`',
          },
          { code: 'Object.keys(o)', note: 'Daftar key' },
          { code: 'Object.fromEntries(pasangan)', note: 'Kebalikan dari `entries`' },
          { code: '{ ...a, ...b }', note: 'Gabung dangkal, isi `b` menimpa `a`' },
          { code: 'structuredClone(o)', note: 'Salinan dalam, termasuk Date dan Map' },
          {
            code: "o?.a?.b ?? 'bawaan'",
            note: 'Akses aman plus nilai bawaan saat `null` atau `undefined`',
          },
          { code: 'const { a, ...sisa } = o', note: 'Ambil satu, kumpulkan sisanya' },
          { code: "Object.hasOwn(o, 'a')", note: 'Cek key milik objek itu sendiri' },
          { code: 'JSON.stringify(o, null, 2)', note: 'Ubah ke teks JSON yang rapi' },
        ],
      },
      {
        title: 'Async',
        lang: 'js',
        rows: [
          {
            code: 'await Promise.all([a, b])',
            note: 'Jalan bersamaan, gagal kalau salah satu gagal',
          },
          {
            code: 'await Promise.allSettled([a, b])',
            note: 'Jalan bersamaan, laporkan semua hasil',
          },
          {
            code: 'await Promise.race([kerja, batasWaktu])',
            note: 'Ambil yang selesai paling dulu',
          },
          { code: 'await new Promise((r) => setTimeout(r, 1000))', note: 'Tunggu satu detik' },
          {
            code: 'try { await kerja() } catch (err) { ... }',
            note: 'Tangkap Promise yang ditolak',
          },
          { code: 'AbortSignal.timeout(5000)', note: 'Batal otomatis setelah 5 detik' },
          { code: 'for await (const x of sumber)', note: 'Iterasi sumber yang asynchronous' },
          { code: 'queueMicrotask(fn)', note: 'Jalankan setelah kode ini, sebelum timer' },
        ],
      },
      {
        title: 'String & angka',
        lang: 'js',
        rows: [
          { code: '`Halo ${nama}`', note: 'Template literal' },
          { code: 'str.trim()', note: 'Buang spasi di awal dan akhir' },
          { code: "str.split(',')", note: 'Pecah menjadi array' },
          { code: "str.includes('kopi')", note: 'Cek potongan teks, peka huruf besar kecil' },
          { code: "str.replaceAll('a', 'b')", note: 'Ganti semua kemunculan' },
          { code: "str.padStart(2, '0')", note: 'Tambah nol di depan, misalnya `7` jadi `07`' },
          { code: 'str.slice(0, 20)', note: 'Ambil 20 karakter pertama' },
          {
            code: 'Number.parseInt(str, 10)',
            note: 'Teks ke bilangan bulat. Selalu sebut basis 10',
          },
          { code: "Number('12.5')", note: 'Teks ke angka, hasilnya `NaN` kalau bukan angka' },
          { code: 'n.toFixed(2)', note: 'Dua angka desimal. Hasilnya string, bukan angka' },
          { code: "n.toLocaleString('id-ID')", note: 'Format ribuan gaya Indonesia' },
          {
            code: "new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n)",
            note: 'Format rupiah',
          },
          { code: 'Number.isNaN(x)', note: 'Cek `NaN` dengan benar' },
          {
            code: 'Math.abs(a - b) < Number.EPSILON',
            note: 'Bandingkan angka desimal dengan aman',
          },
        ],
      },
      {
        title: 'Class & OOP',
        lang: 'js',
        rows: [
          {
            code: 'class Akun { constructor(nama) { this.nama = nama } }',
            note: 'Class dengan constructor',
          },
          { code: '#saldo = 0', note: 'Field private, tidak bisa diakses dari luar class' },
          { code: 'get saldo() { return this.#saldo }', note: 'Getter, dibaca seperti properti' },
          {
            code: 'static dari(data) { return new Akun(data.nama) }',
            note: 'Method milik class, bukan milik objek',
          },
          {
            code: 'class Admin extends Akun { constructor(n) { super(n) } }',
            note: 'Pewarisan. `super` wajib dipanggil sebelum memakai `this`',
          },
          { code: 'akun instanceof Akun', note: 'Cek apakah objek dibuat dari class itu' },
        ],
      },
      {
        title: 'Modul',
        lang: 'js',
        rows: [
          { code: 'export function hitung() {}', note: 'Named export' },
          { code: 'export default Kartu', note: 'Satu default export per berkas' },
          {
            code: "import Kartu, { hitung } from './kartu.js'",
            note: 'Default dan named sekaligus',
          },
          { code: "import * as util from './util.js'", note: 'Semua export dalam satu objek' },
          {
            code: "const { gambar } = await import('./grafik.js')",
            note: 'Muat modul saat dibutuhkan',
          },
          {
            code: "import data from './data.json' with { type: 'json' }",
            note: 'Impor berkas JSON sebagai modul',
          },
        ],
      },
    ],
  },
  {
    slug: 'dom',
    title: 'DOM & Event',
    group: 'Frontend',
    summary:
      'Memilih, mengubah, dan mendengarkan elemen halaman tanpa framework. `el` berarti elemen, `e` objek event, dan `induk` elemen pembungkus.',
    sections: [
      {
        title: 'Memilih elemen',
        lang: 'js',
        rows: [
          {
            code: "document.querySelector('.kartu')",
            note: 'Elemen pertama yang cocok, atau `null`',
          },
          {
            code: "document.querySelectorAll('li')",
            note: 'Semua yang cocok, bisa langsung `forEach`',
          },
          { code: "document.getElementById('menu')", note: 'Cari berdasarkan id, tanpa tanda `#`' },
          {
            code: "el.closest('.kartu')",
            note: 'Naik ke leluhur terdekat yang cocok, termasuk dirinya',
          },
          { code: "el.matches('.aktif')", note: 'Cek apakah elemen cocok dengan selector' },
        ],
      },
      {
        title: 'Mengubah elemen',
        lang: 'js',
        rows: [
          { code: 'el.textContent = teks', note: 'Isi teks. Aman untuk data dari pengguna' },
          {
            code: 'el.innerHTML = html',
            note: 'Hanya untuk HTML tepercaya. Data pengguna di sini membuka celah XSS',
          },
          {
            code: "el.classList.toggle('aktif', kondisi)",
            note: 'Pasang class kalau kondisi benar, lepas kalau salah',
          },
          { code: 'el.dataset.id', note: 'Baca atribut `data-id`' },
          {
            code: "el.setAttribute('aria-expanded', 'true')",
            note: 'Atribut apa pun. Nilainya selalu string',
          },
          { code: 'el.hidden = true', note: 'Sembunyikan, juga dari screen reader' },
          {
            code: "el.style.setProperty('--lebar', '40%')",
            note: 'Ubah CSS variable dari JavaScript',
          },
        ],
      },
      {
        title: 'Membuat & menghapus',
        lang: 'js',
        rows: [
          { code: "document.createElement('li')", note: 'Buat elemen baru, belum tampil' },
          { code: "induk.append(el, 'teks')", note: 'Tambah di akhir, boleh elemen atau teks' },
          { code: 'induk.prepend(el)', note: 'Tambah di awal' },
          { code: 'el.remove()', note: 'Hapus dari halaman' },
          { code: 'induk.replaceChildren()', note: 'Kosongkan semua isi' },
          {
            code: 'template.content.cloneNode(true)',
            note: 'Salin isi `<template>` untuk dipakai berulang',
          },
        ],
      },
      {
        title: 'Event',
        lang: 'js',
        rows: [
          { code: "el.addEventListener('click', fn)", note: 'Dengarkan event' },
          { code: 'e.preventDefault()', note: 'Batalkan aksi bawaan, misalnya submit form' },
          {
            code: "e.target.closest('li')",
            note: 'Event delegation, satu listener di induk untuk semua anaknya',
          },
          {
            code: "el.addEventListener('click', fn, { once: true })",
            note: 'Lepas otomatis setelah sekali jalan',
          },
          {
            code: "el.addEventListener('scroll', fn, { passive: true })",
            note: 'Janji tidak memanggil `preventDefault`, sehingga scroll tetap mulus',
          },
          {
            code: "el.addEventListener('keydown', fn, { signal: ac.signal })",
            note: 'Lepas banyak listener sekaligus dengan `ac.abort()`',
          },
          { code: "if (e.key === 'Escape') tutup()", note: 'Tombol keyboard dibaca lewat `e.key`' },
          { code: 'new FormData(form)', note: 'Ambil semua isi form berdasarkan atribut `name`' },
          { code: 'Object.fromEntries(new FormData(form))', note: 'Isi form jadi objek biasa' },
        ],
      },
    ],
  },
  {
    slug: 'fetch',
    title: 'Fetch & Web API',
    group: 'Frontend',
    summary:
      'Mengambil dan mengirim data ke server, menyusun URL, lalu menyimpan sedikit data di browser.',
    sections: [
      {
        title: 'Mengambil data',
        lang: 'js',
        rows: [
          {
            code: "const res = await fetch('/api/produk')",
            note: 'Ditolak hanya saat jaringan gagal',
          },
          {
            code: 'if (!res.ok) throw new Error(`HTTP ${res.status}`)',
            note: 'Status 404 dan 500 tidak melempar error sendiri',
          },
          { code: 'const data = await res.json()', note: 'Ubah body JSON menjadi objek' },
          { code: 'await res.text()', note: 'Body sebagai teks biasa' },
          {
            code: 'fetch(url, { signal: AbortSignal.timeout(5000) })',
            note: 'Batalkan kalau lebih dari 5 detik',
          },
          { code: "res.headers.get('content-type')", note: 'Baca satu header respons' },
        ],
      },
      {
        title: 'Mengirim data',
        lang: 'js',
        rows: [
          {
            code: "fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })",
            note: 'Kirim JSON',
          },
          {
            code: "fetch(url, { method: 'POST', body: new FormData(form) })",
            note: 'Jangan set `Content-Type` sendiri, browser yang mengisinya',
          },
          { code: 'headers: { Authorization: `Bearer ${token}` }', note: 'Kirim token akses' },
          { code: "credentials: 'include'", note: 'Ikut kirim cookie ke origin lain' },
          { code: "fetch(url, { method: 'DELETE' })", note: 'Method selain GET' },
        ],
      },
      {
        title: 'URL & query string',
        lang: 'js',
        rows: [
          {
            code: "new URLSearchParams({ q: 'kopi', page: '2' }).toString()",
            note: 'Hasilnya `q=kopi&page=2`',
          },
          {
            code: "new URLSearchParams(location.search).get('q')",
            note: 'Baca query dari URL halaman',
          },
          {
            code: "const url = new URL('/api/produk', location.origin)",
            note: 'Susun URL absolut dengan aman',
          },
          {
            code: "url.searchParams.set('page', '2')",
            note: 'Ubah satu parameter tanpa merangkai string',
          },
          { code: 'encodeURIComponent(teks)', note: 'Amankan satu nilai di dalam URL' },
        ],
      },
      {
        title: 'Penyimpanan browser',
        lang: 'js',
        rows: [
          {
            code: "localStorage.setItem('tema', JSON.stringify(v))",
            note: 'Hanya menyimpan string, jadi ubah dulu ke JSON',
          },
          {
            code: "JSON.parse(localStorage.getItem('tema') ?? 'null')",
            note: 'Baca kembali, aman saat belum ada',
          },
          { code: "localStorage.removeItem('tema')", note: 'Hapus satu key' },
          { code: "sessionStorage.setItem('draf', teks)", note: 'Hilang saat tab ditutup' },
        ],
      },
      {
        title: 'Web API lain',
        lang: 'js',
        rows: [
          { code: 'navigator.clipboard.writeText(teks)', note: 'Salin ke clipboard, butuh HTTPS' },
          { code: 'crypto.randomUUID()', note: 'Id acak yang unik' },
          {
            code: 'new IntersectionObserver(cb).observe(el)',
            note: 'Tahu kapan elemen masuk ke layar',
          },
          {
            code: "matchMedia('(prefers-color-scheme: dark)').matches",
            note: 'Cek apakah pengguna memilih tema gelap',
          },
          {
            code: "history.pushState(null, '', '?page=2')",
            note: 'Ubah URL tanpa memuat ulang halaman',
          },
        ],
      },
    ],
  },
  {
    slug: 'typescript',
    title: 'TypeScript',
    group: 'Frontend',
    summary:
      'Tipe yang paling sering ditulis, cara mempersempitnya, dan pola untuk React. Semua tipe hilang saat build, jadi tidak ada di JavaScript hasilnya.',
    sections: [
      {
        title: 'Tipe dasar',
        lang: 'ts',
        rows: [
          {
            code: 'let total: number = 0',
            note: 'Anotasi tipe. Sering tidak perlu karena tipe ditebak',
          },
          { code: 'type Id = string | number', note: 'Union, salah satu dari beberapa tipe' },
          {
            code: 'type User = { id: number; nama?: string }',
            note: 'Properti opsional memakai `?`',
          },
          {
            code: 'interface User { id: number }',
            note: 'Mirip `type`, bisa diperluas dengan `extends`',
          },
          {
            code: "const PERAN = ['admin', 'staf'] as const",
            note: 'Jadi tipe literal yang tidak bisa diubah',
          },
          {
            code: 'type Peran = (typeof PERAN)[number]',
            note: "Union dari isi array, `'admin' | 'staf'`",
          },
          {
            code: 'function f(x: unknown) {}',
            note: 'Wajib dipersempit dulu sebelum dipakai. Lebih aman dari `any`',
          },
          {
            code: 'function simpan(data: User): Promise<void> {}',
            note: 'Tipe parameter dan tipe hasil',
          },
        ],
      },
      {
        title: 'Mempersempit tipe',
        lang: 'ts',
        rows: [
          { code: "if (typeof x === 'string') {}", note: 'Di dalam blok ini `x` pasti string' },
          { code: "if ('email' in obj) {}", note: 'Cek keberadaan properti' },
          { code: 'if (x instanceof Date) {}', note: 'Cek class' },
          { code: 'if (Array.isArray(x)) {}', note: 'Cek array' },
          {
            code: "switch (aksi.type) { case 'tambah': ... }",
            note: 'Discriminated union, tiap cabang mendapat tipe sendiri',
          },
          {
            code: 'const cfg = { port: 3000 } satisfies Config',
            note: 'Cek bentuk tanpa melebarkan tipe',
          },
          {
            code: "document.getElementById('app')!",
            note: 'Anggap pasti bukan `null`. Hindari kalau bisa dicek',
          },
        ],
      },
      {
        title: 'Generic & utility type',
        lang: 'ts',
        rows: [
          {
            code: 'function pertama<T>(arr: T[]): T | undefined {}',
            note: 'Generic, tipe hasil mengikuti tipe masukan',
          },
          { code: 'Partial<User>', note: 'Semua properti jadi opsional' },
          { code: "Pick<User, 'id' | 'nama'>", note: 'Ambil sebagian properti' },
          { code: "Omit<User, 'password'>", note: 'Buang properti tertentu' },
          { code: 'Record<string, number>', note: 'Objek dengan key string dan nilai angka' },
          { code: 'ReturnType<typeof buat>', note: 'Tipe hasil sebuah fungsi' },
          { code: 'Awaited<ReturnType<typeof ambil>>', note: 'Tipe isi Promise dari fungsi async' },
          { code: 'NonNullable<T>', note: 'Buang `null` dan `undefined` dari tipe' },
        ],
      },
      {
        title: 'TypeScript di React',
        lang: 'tsx',
        rows: [
          {
            code: "function Tombol(props: React.ComponentProps<'button'>) {}",
            note: 'Terima semua atribut `button` bawaan',
          },
          {
            code: 'type Props = { children: React.ReactNode }',
            note: 'Tipe untuk isi di antara tag',
          },
          {
            code: '(e: React.ChangeEvent<HTMLInputElement>) => setNama(e.target.value)',
            note: 'Tipe event input',
          },
          {
            code: '(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()',
            note: 'Tipe event submit',
          },
          { code: 'useState<User | null>(null)', note: 'Sebut tipenya kalau nilai awal `null`' },
          { code: 'useRef<HTMLInputElement>(null)', note: 'Ref ke elemen DOM' },
        ],
      },
    ],
  },
  {
    slug: 'react',
    title: 'React',
    group: 'Frontend',
    summary: 'Hook, pola, dan form React 19 yang paling sering dipakai.',
    sections: [
      {
        title: 'Hook dasar',
        lang: 'tsx',
        rows: [
          { code: 'const [x, setX] = useState(awal)', note: 'State lokal' },
          { code: 'useState(() => hitungMahal())', note: 'Lazy initializer, hanya jalan sekali' },
          {
            code: 'setX((prev) => prev + 1)',
            note: 'Wajib bila nilai baru bergantung pada yang lama',
          },
          {
            code: 'useEffect(() => { ...; return cleanup }, [dep])',
            note: 'Sinkronisasi dengan dunia luar, beserta pembersihannya',
          },
          { code: 'const ref = useRef<HTMLInputElement>(null)', note: 'Akses elemen DOM' },
          { code: 'const id = useId()', note: 'Id stabil, aman terhadap hidrasi' },
        ],
      },
      {
        title: 'Hook lanjutan',
        lang: 'tsx',
        rows: [
          {
            code: 'const [state, dispatch] = useReducer(reducer, awal)',
            note: 'State dengan banyak jenis aksi',
          },
          {
            code: 'const tema = use(TemaContext)',
            note: 'Baca context. Di React 19 boleh di dalam `if`',
          },
          {
            code: 'const tema = useContext(TemaContext)',
            note: 'Cara lama membaca context, tetap berlaku',
          },
          {
            code: 'useMemo(() => hitungMahal(a), [a])',
            note: 'Simpan hasil hitungan, hitung ulang saat `a` berubah',
          },
          { code: 'useCallback(fn, [dep])', note: 'Fungsi yang sama antar render' },
          {
            code: 'const tertunda = useDeferredValue(cari)',
            note: 'Versi nilai yang boleh tertinggal, input tetap responsif',
          },
          {
            code: 'const [isPending, startTransition] = useTransition()',
            note: 'Tandai pembaruan sebagai tidak mendesak',
          },
        ],
      },
      {
        title: 'Pola',
        lang: 'tsx',
        rows: [
          {
            code: '{items.length > 0 && <List />}',
            note: 'Jangan `items.length &&`, angka `0` akan ikut tampil',
          },
          {
            code: '{items.map((i) => <Row key={i.id} />)}',
            note: '`key` stabil dari data, bukan indeks',
          },
          { code: '<TemaContext value={tema}>', note: 'React 19, tanpa `.Provider`' },
          { code: 'useSyncExternalStore(sub, get, getServer)', note: 'Store di luar React' },
          {
            code: '<Suspense fallback={<Memuat />}>',
            note: 'Tampilan sementara selama anaknya menunggu',
          },
          {
            code: "const Grafik = lazy(() => import('./grafik'))",
            note: 'Muat komponen berat saat dibutuhkan',
          },
          { code: 'export default memo(Baris)', note: 'Lewati render ulang kalau props sama' },
        ],
      },
      {
        title: 'Form',
        lang: 'tsx',
        rows: [
          {
            code: '<form action={simpan}>',
            note: 'Aksi menerima `FormData`. Isi form direset setelah aksi selesai',
          },
          {
            code: 'const [state, aksi, isPending] = useActionState(fn, awal)',
            note: 'Hasil dan status sebuah aksi form',
          },
          {
            code: 'const { pending } = useFormStatus()',
            note: 'Status kirim dari form induk, dari `react-dom`',
          },
          {
            code: 'const [optimis, tambahOptimis] = useOptimistic(daftar, gabung)',
            note: 'Tampilkan hasil sebelum server menjawab',
          },
          {
            code: '<input value={v} onChange={(e) => setV(e.target.value)} />',
            note: 'Controlled, nilainya dipegang state',
          },
          {
            code: '<input name="email" defaultValue={email} />',
            note: 'Uncontrolled, dibaca lewat `FormData`',
          },
          { code: '<label htmlFor={id}>Email</label>', note: 'Label terhubung ke input lewat id' },
        ],
      },
    ],
  },
  {
    slug: 'nextjs',
    title: 'Next.js App Router',
    group: 'Frontend',
    summary: 'App Router pada Next.js 16. Nama berkas di folder `app` menentukan perilakunya.',
    sections: [
      {
        title: 'Berkas khusus',
        lang: 'text',
        rows: [
          { code: 'app/page.tsx', note: 'Halaman untuk URL `/`' },
          { code: 'app/blog/[slug]/page.tsx', note: 'Satu halaman untuk setiap slug' },
          {
            code: 'layout.tsx',
            note: 'Kerangka yang membungkus halaman di bawahnya, tidak dirender ulang saat pindah halaman',
          },
          { code: 'loading.tsx', note: 'Tampil otomatis selama halaman memuat' },
          { code: 'error.tsx', note: 'Menangkap error di segmen ini. Wajib Client Component' },
          { code: 'not-found.tsx', note: 'Tampil saat `notFound()` dipanggil' },
          { code: 'route.ts', note: 'Endpoint API. Ekspor fungsi `GET`, `POST`, dan seterusnya' },
          {
            code: 'app/(pemasaran)/tentang/page.tsx',
            note: 'Folder berkurung tidak muncul di URL',
          },
          { code: 'proxy.ts', note: 'Nama baru `middleware.ts` sejak Next.js 16' },
        ],
      },
      {
        title: 'Halaman & data',
        lang: 'tsx',
        rows: [
          {
            code: "export default async function Page({ params }: PageProps<'/blog/[slug]'>) {}",
            note: 'Halaman sebagai Server Component, dengan tipe params yang otomatis',
          },
          {
            code: 'const { slug } = await params',
            note: '`params` berupa Promise sejak Next.js 15',
          },
          { code: 'const { q } = await searchParams', note: 'Query string, juga berupa Promise' },
          {
            code: 'export async function generateStaticParams() {}',
            note: 'Daftar slug yang di-prerender saat build',
          },
          {
            code: 'export async function generateMetadata({ params }) {}',
            note: 'Judul dan deskripsi per halaman',
          },
          { code: 'notFound()', note: 'Tampilkan 404 dan hentikan render, dari `next/navigation`' },
          { code: "redirect('/masuk')", note: 'Alihkan dari server, dari `next/navigation`' },
          {
            code: 'export const revalidate = 60',
            note: 'Bangun ulang paling cepat tiap 60 detik. Berlaku bila Cache Components tidak diaktifkan',
          },
        ],
      },
      {
        title: 'Client & server',
        lang: 'tsx',
        rows: [
          { code: "'use client'", note: 'Baris pertama berkas yang butuh state atau event' },
          { code: "'use server'", note: 'Menandai Server Function yang bisa dipanggil dari form' },
          {
            code: "revalidatePath('/produk')",
            note: 'Buang cache halaman setelah datanya berubah',
          },
          { code: "import 'server-only'", note: 'Build gagal kalau berkas ini terimpor ke klien' },
          {
            code: "import { useRouter } from 'next/navigation'",
            note: 'Di App Router, bukan dari `next/router`',
          },
          { code: '<Link href="/produk">Produk</Link>', note: 'Pindah halaman tanpa memuat ulang' },
          {
            code: '<Image src="/foto.jpg" width={640} height={480} alt="Foto produk" />',
            note: 'Gambar dioptimasi. Ukuran wajib supaya layout tidak bergeser',
          },
        ],
      },
      {
        title: 'Perintah',
        lang: 'bash',
        rows: [
          { code: 'npx create-next-app@latest', note: 'Buat project baru' },
          { code: 'npm run dev', note: 'Server development' },
          { code: 'npm run build && npm run start', note: 'Build produksi, lalu jalankan' },
          { code: 'npx next info', note: 'Versi Next.js dan sistem, untuk laporan bug' },
        ],
      },
    ],
  },
  {
    slug: 'state-data',
    title: 'State & Data Fetching',
    group: 'Frontend',
    summary:
      'Zustand untuk state global milik browser, dan TanStack Query untuk data milik server. Keduanya dipakai di bab state management.',
    sections: [
      {
        title: 'Zustand',
        lang: 'tsx',
        rows: [
          {
            code: 'const useKeranjang = create((set) => ({ isi: [], tambah: (p) => set((s) => ({ isi: [...s.isi, p] })) }))',
            note: 'Buat store beserta aksinya',
          },
          {
            code: 'const isi = useKeranjang((s) => s.isi)',
            note: 'Ambil sebagian state. Render ulang hanya saat bagian itu berubah',
          },
          { code: 'const tambah = useKeranjang((s) => s.tambah)', note: 'Ambil aksi' },
          { code: 'set({ isi: [] })', note: 'Digabung dangkal ke state lama' },
          { code: 'useKeranjang.getState().isi', note: 'Baca state di luar komponen' },
          {
            code: "persist(fn, { name: 'keranjang' })",
            note: 'Simpan otomatis ke localStorage, dari `zustand/middleware`',
          },
        ],
      },
      {
        title: 'TanStack Query',
        lang: 'tsx',
        rows: [
          {
            code: "const { data, isPending, error } = useQuery({ queryKey: ['produk', id], queryFn: () => ambilProduk(id) })",
            note: 'Ambil data dengan cache',
          },
          {
            code: "queryKey: ['produk', id]",
            note: 'Key unik. Data diambil ulang saat isinya berubah',
          },
          { code: 'staleTime: 60_000', note: 'Data dianggap segar selama satu menit' },
          { code: 'enabled: Boolean(id)', note: 'Tunda query sampai `id` ada' },
          {
            code: 'const simpan = useMutation({ mutationFn: kirimProduk })',
            note: 'Untuk POST, PUT, dan DELETE',
          },
          {
            code: "queryClient.invalidateQueries({ queryKey: ['produk'] })",
            note: 'Tandai basi lalu ambil ulang',
          },
          {
            code: 'const queryClient = useQueryClient()',
            note: 'Akses client dari dalam komponen',
          },
          {
            code: '<QueryClientProvider client={queryClient}>',
            note: 'Pasang sekali di akar aplikasi',
          },
        ],
      },
      {
        title: 'Memilih tempat state',
        lang: 'tsx',
        rows: [
          { code: 'useState', note: 'Milik satu komponen, misalnya teks yang sedang diketik' },
          {
            code: "useSearchParams().get('kategori')",
            note: 'Di URL, bisa dibagikan dan bertahan saat reload',
          },
          { code: 'useQuery', note: 'Data milik server, lengkap dengan cache dan refetch' },
          { code: 'create', note: 'State global milik browser di Zustand, misalnya keranjang' },
          { code: 'createContext', note: 'Nilai yang jarang berubah, misalnya tema' },
        ],
      },
    ],
  },
  {
    slug: 'tailwind',
    title: 'Tailwind CSS v4',
    group: 'Frontend',
    summary: 'Konfigurasi CSS-first dan utility yang sering lupa.',
    sections: [
      {
        title: 'Setup & token',
        lang: 'css',
        rows: [
          { code: '@import "tailwindcss";', note: 'Menggantikan tiga direktif `@tailwind` di v3' },
          { code: '@theme { --color-brand: #8F5314; }', note: 'Token menjadi utility `bg-brand`' },
          { code: '@theme inline { --color-bg: var(--bg); }', note: 'Token yang ikut tema aktif' },
          {
            code: '@custom-variant dark (&:where(.dark, .dark *));',
            note: 'Dark mode berbasis class',
          },
          { code: '@source "../node_modules/ui";', note: 'Tambah folder yang dipindai class-nya' },
          { code: '@utility tab-4 { tab-size: 4; }', note: 'Buat utility sendiri' },
        ],
      },
      {
        title: 'Layout',
        lang: 'html',
        rows: [
          { code: 'flex items-center justify-center', note: 'Tengah horizontal dan vertikal' },
          { code: 'grid min-h-dvh place-items-center', note: 'Tepat di tengah layar' },
          {
            code: 'grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4',
            note: 'Grid kartu responsif tanpa breakpoint',
          },
          { code: 'mx-auto max-w-prose', note: 'Lebar baca yang nyaman, di tengah' },
          { code: 'size-10', note: 'Lebar dan tinggi sekaligus' },
          { code: 'min-h-dvh', note: 'Tinggi layar yang benar di mobile, beda dengan `h-screen`' },
          { code: 'truncate', note: 'Satu baris dengan elipsis' },
          { code: 'line-clamp-2', note: 'Potong setelah dua baris' },
        ],
      },
      {
        title: 'Responsif & state',
        lang: 'html',
        rows: [
          { code: 'md:grid-cols-2', note: 'Berlaku mulai lebar 48rem ke atas' },
          { code: 'max-md:hidden', note: 'Berlaku di bawah 48rem' },
          { code: 'dark:bg-zinc-900', note: 'Saat tema gelap aktif' },
          { code: 'hover:bg-zinc-100', note: 'Di v4 hanya aktif pada perangkat yang bisa hover' },
          {
            code: '@container / @md:flex-row',
            note: 'Container query, mengikuti lebar induk, bukan layar',
          },
          { code: 'aria-expanded:rotate-180', note: 'Gaya berdasarkan atribut ARIA' },
          { code: 'data-[state=open]:block', note: 'Gaya berdasarkan atribut data' },
          { code: 'not-last:border-b', note: 'Semua kecuali elemen terakhir' },
        ],
      },
      {
        title: 'Utility yang sering lupa',
        lang: 'html',
        rows: [
          { code: 'group / group-hover:underline', note: 'Bereaksi pada hover induk' },
          { code: 'peer / peer-checked:block', note: 'Bereaksi pada state elemen sebelumnya' },
          { code: 'focus-visible:outline-2', note: 'Focus ring hanya untuk keyboard' },
          { code: 'motion-reduce:transition-none', note: 'Hormati `prefers-reduced-motion`' },
          { code: 'sr-only', note: 'Terbaca screen reader, tidak terlihat' },
          { code: 'overflow-x-auto', note: 'Scroll di dalam container-nya sendiri' },
        ],
      },
      {
        title: 'Nilai bebas',
        lang: 'html',
        rows: [
          { code: 'w-[37rem]', note: 'Nilai di luar skala bawaan' },
          { code: 'bg-(--brand)', note: 'Pakai CSS variable, sintaks baru v4' },
          { code: 'grid-cols-[1fr_auto]', note: 'Garis bawah menggantikan spasi' },
          { code: 'mt-0!', note: 'Paksa menang. Di v4 tanda seru ditulis di akhir' },
        ],
      },
    ],
  },

  /* ========================================================== Backend & data */
  {
    slug: 'http',
    title: 'HTTP & curl',
    group: 'Backend & data',
    summary:
      'Method, status code, dan header yang paling sering dipakai, lalu cara menguji endpoint dari terminal.',
    sections: [
      {
        title: 'Method',
        lang: 'text',
        rows: [
          { code: 'GET /produk', note: 'Membaca. Aman diulang dan boleh di-cache' },
          { code: 'POST /produk', note: 'Membuat data baru. Mengulangnya bisa membuat data ganda' },
          { code: 'PUT /produk/42', note: 'Mengganti seluruh data. Hasilnya sama walau diulang' },
          { code: 'PATCH /produk/42', note: 'Mengubah sebagian field' },
          { code: 'DELETE /produk/42', note: 'Menghapus. Aman diulang' },
        ],
      },
      {
        title: 'Status code',
        lang: 'text',
        rows: [
          { code: '200 OK', note: 'Berhasil, ada isi' },
          { code: '201 Created', note: 'Data dibuat. Sertakan header `Location`' },
          { code: '204 No Content', note: 'Berhasil tanpa isi, misalnya setelah menghapus' },
          { code: '301 / 308', note: 'Pindah permanen. 308 mempertahankan method' },
          { code: '304 Not Modified', note: 'Pakai salinan cache karena `ETag` masih sama' },
          { code: '400 Bad Request', note: 'Format request rusak' },
          { code: '401 Unauthorized', note: 'Belum login, atau token tidak valid' },
          { code: '403 Forbidden', note: 'Sudah login, tapi tidak berhak' },
          {
            code: '404 Not Found',
            note: 'Tidak ada, atau sengaja disembunyikan dari yang tidak berhak',
          },
          { code: '409 Conflict', note: 'Bentrok, misalnya email sudah terdaftar' },
          { code: '422 Unprocessable Content', note: 'Formatnya benar, isinya gagal validasi' },
          {
            code: '429 Too Many Requests',
            note: 'Kena rate limit. Kalau ada, header `Retry-After` menyebut kapan boleh mencoba lagi',
          },
          {
            code: '500 Internal Server Error',
            note: 'Bug di server. Jangan kirim stack trace ke klien',
          },
          {
            code: '503 Service Unavailable',
            note: 'Sedang tidak bisa melayani, misalnya overload',
          },
        ],
      },
      {
        title: 'Header',
        lang: 'text',
        rows: [
          { code: 'Content-Type: application/json', note: 'Jenis isi body' },
          { code: 'Authorization: Bearer <token>', note: 'Token akses' },
          {
            code: 'Cache-Control: no-store',
            note: 'Jangan disimpan sama sekali, untuk data pribadi',
          },
          {
            code: 'Cache-Control: public, max-age=31536000, immutable',
            note: 'Aset berversi yang tidak pernah berubah',
          },
          { code: 'ETag: "v42"', note: 'Versi isi. Klien mengirimnya balik lewat `If-None-Match`' },
          { code: 'Location: /produk/42', note: 'Alamat data yang baru dibuat' },
          { code: 'Retry-After: 30', note: 'Coba lagi setelah 30 detik' },
        ],
      },
      {
        title: 'curl',
        lang: 'bash',
        rows: [
          {
            code: 'curl -i http://localhost:3000/api/produk',
            note: 'Tampilkan status dan header respons',
          },
          {
            code: 'curl -X POST http://localhost:3000/api/produk -H \'Content-Type: application/json\' -d \'{"nama":"Kopi"}\'',
            note: 'Kirim JSON',
          },
          {
            code: 'curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/saya',
            note: 'Kirim token dari variabel shell',
          },
          {
            code: 'curl -fsS http://localhost:3000/health',
            note: 'Keluar dengan kode error saat status 4xx atau 5xx, cocok untuk skrip',
          },
          {
            code: "curl -sS -o /dev/null -w '%{http_code}\\n' http://localhost:3000",
            note: 'Tampilkan status code saja',
          },
          { code: 'curl -v https://contoh.id', note: 'Detail koneksi, TLS, dan header' },
          { code: 'curl -L http://contoh.id', note: 'Ikuti redirect' },
          {
            code: 'curl -o berkas.zip https://contoh.id/berkas.zip',
            note: 'Simpan hasilnya ke berkas',
          },
        ],
      },
    ],
  },
  {
    slug: 'express',
    title: 'Express & Node',
    group: 'Backend & data',
    summary: 'Potongan yang berulang di setiap project Node, untuk Express 5 dan Zod 4.',
    sections: [
      {
        title: 'Express 5',
        lang: 'ts',
        rows: [
          {
            code: "app.use(express.json({ limit: '100kb' }))",
            note: 'Baca body JSON dan batasi ukurannya',
          },
          {
            code: "router.get('/:id', handler)",
            note: 'Route param, dibaca lewat `req.params.id`',
          },
          { code: 'req.query.page', note: 'Query string. Nilainya string atau `undefined`' },
          { code: "app.get('/*splat', handler)", note: 'Wildcard wajib diberi nama di Express 5' },
          {
            code: "app.get('/produk', async (req, res) => { ... })",
            note: 'Error dari handler async diteruskan otomatis ke error handler',
          },
          {
            code: 'app.use((err, req, res, next) => { ... })',
            note: 'Error handler terpusat. Wajib empat parameter',
          },
          { code: 'res.status(201).location(url).json(data)', note: 'Respons pembuatan data' },
          { code: 'res.status(204).end()', note: 'Berhasil tanpa isi' },
          { code: 'app.listen(port)', note: 'Mulai server' },
        ],
      },
      {
        title: 'Middleware & validasi',
        lang: 'ts',
        rows: [
          { code: 'app.use(helmet())', note: 'Header keamanan dasar sekaligus' },
          {
            code: "app.use(cors({ origin: ['https://app.contoh.id'], credentials: true }))",
            note: 'Allow-list origin. Jangan pakai `*` bersama cookie',
          },
          {
            code: 'app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }))',
            note: 'Paling banyak 100 request per 15 menit per IP',
          },
          {
            code: "app.set('trust proxy', 1)",
            note: 'Di belakang nginx, supaya IP klien terbaca benar',
          },
          {
            code: 'const Skema = z.object({ email: z.email(), umur: z.coerce.number().int().min(17) })',
            note: 'Skema validasi Zod 4',
          },
          {
            code: 'const hasil = Skema.safeParse(req.body)',
            note: 'Validasi tanpa melempar error',
          },
          {
            code: 'if (!hasil.success) return res.status(422).json({ errors: hasil.error.issues })',
            note: 'Tolak data yang tidak valid',
          },
          {
            code: '(req, res, next) => { ...; next() }',
            note: 'Middleware sendiri. Panggil `next()` untuk lanjut',
          },
        ],
      },
      {
        title: 'Node & npm',
        lang: 'bash',
        rows: [
          {
            code: 'node --watch app.js',
            note: 'Restart otomatis saat berkas berubah, tanpa nodemon',
          },
          { code: 'node --env-file=.env app.js', note: 'Muat `.env` tanpa dotenv' },
          { code: 'node --test', note: 'Jalankan test dengan test runner bawaan' },
          { code: 'npm ci', note: 'Instal persis sesuai lockfile, untuk CI dan produksi' },
          { code: 'npm install --save-exact zod', note: 'Pasang versi persis, tanpa `^`' },
          { code: 'npm ls zod', note: 'Versi terpasang dan siapa yang membutuhkannya' },
          { code: 'npm outdated', note: 'Dependency yang punya versi lebih baru' },
          { code: 'npm audit', note: 'Cek kerentanan dependency' },
        ],
      },
    ],
  },
  {
    slug: 'sql',
    title: 'SQL',
    group: 'Backend & data',
    summary:
      'Query PostgreSQL yang paling sering ditulis ulang. Nilai dari pengguna selalu lewat parameter seperti `$1`, tidak pernah dirangkai ke teks query.',
    sections: [
      {
        title: 'Membaca',
        lang: 'sql',
        rows: [
          {
            code: 'SELECT a, b FROM t WHERE x = $1',
            note: 'Sebut kolomnya, dan nilai lewat parameter',
          },
          { code: 'ORDER BY dibuat_pada DESC LIMIT 20', note: 'Urutkan lalu batasi' },
          { code: 'LEFT JOIN c ON c.t_id = t.id', note: 'Pertahankan semua baris tabel kiri' },
          { code: 'WHERE c.id IS NULL', note: 'Setelah LEFT JOIN, cari yang tidak punya pasangan' },
          { code: 'GROUP BY t.id HAVING COUNT(*) > 1', note: 'Saring setelah agregasi' },
          {
            code: "COUNT(*) FILTER (WHERE status = 'selesai')",
            note: 'Hitung bersyarat di dalam satu query',
          },
          { code: "COALESCE(kota, '-')", note: 'Nilai pengganti saat NULL' },
          { code: "WHERE dibuat_pada > now() - interval '7 days'", note: 'Tujuh hari terakhir' },
          {
            code: "WHERE nama ILIKE '%' || $1 || '%'",
            note: 'Cari potongan teks tanpa peduli huruf besar kecil',
          },
          {
            code: 'WHERE id < $1 ORDER BY id DESC LIMIT 20',
            note: 'Keyset pagination dari cursor',
          },
          {
            code: 'WHERE NOT EXISTS (SELECT 1 FROM c WHERE c.t_id = t.id)',
            note: 'Cara lain mencari yang tidak punya pasangan',
          },
        ],
      },
      {
        title: 'Mengubah',
        lang: 'sql',
        rows: [
          { code: 'BEGIN; ... COMMIT;', note: 'Beberapa penulisan sebagai satu kesatuan' },
          { code: 'ROLLBACK;', note: 'Batalkan semua perubahan sejak BEGIN' },
          {
            code: 'INSERT INTO t (a, b) VALUES ($1, $2) RETURNING id',
            note: 'Ambil id baru tanpa query kedua',
          },
          { code: 'INSERT ... ON CONFLICT DO NOTHING', note: 'Abaikan data kembar' },
          {
            code: 'INSERT ... ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama',
            note: 'Upsert, perbarui kalau sudah ada',
          },
          { code: 'UPDATE t SET a = $1 WHERE id = $2', note: 'Jangan pernah lupa WHERE' },
          { code: 'DELETE FROM t WHERE id = $1', note: 'Hapus satu baris' },
        ],
      },
      {
        title: 'Skema',
        lang: 'sql',
        rows: [
          {
            code: 'CREATE TABLE produk (id SERIAL PRIMARY KEY, nama TEXT NOT NULL)',
            note: 'Tabel dengan id otomatis',
          },
          { code: 'email TEXT NOT NULL UNIQUE', note: 'Wajib diisi dan tidak boleh kembar' },
          {
            code: 'harga INT NOT NULL CHECK (harga >= 0)',
            note: 'Aturan yang dijaga database sendiri',
          },
          {
            code: 'pengguna_id INT NOT NULL REFERENCES pengguna (id) ON DELETE CASCADE',
            note: 'Foreign key, ikut terhapus bersama induknya',
          },
          {
            code: 'dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()',
            note: 'Waktu beserta zona waktunya',
          },
          {
            code: 'ALTER TABLE produk ADD COLUMN stok INT NOT NULL DEFAULT 0',
            note: 'Tambah kolom ke tabel yang sudah ada',
          },
          {
            code: 'CREATE INDEX ON pesanan (pengguna_id)',
            note: 'Foreign key tidak otomatis punya index',
          },
          {
            code: 'CREATE INDEX CONCURRENTLY ...',
            note: 'Index tanpa menahan penulisan. Tidak bisa di dalam transaksi',
          },
        ],
      },
      {
        title: 'psql & diagnosa',
        lang: 'text',
        rows: [
          { code: 'psql -h localhost -U app -d toko', note: 'Masuk ke database' },
          { code: '\\dt', note: 'Daftar tabel' },
          { code: '\\d produk', note: 'Struktur satu tabel, termasuk index' },
          { code: '\\x', note: 'Hasil tampil vertikal, enak untuk baris yang lebar' },
          { code: '\\q', note: 'Keluar' },
          { code: 'EXPLAIN ANALYZE SELECT ...', note: 'Rencana eksekusi beserta waktu nyatanya' },
          {
            code: "SELECT pg_size_pretty(pg_total_relation_size('pesanan'))",
            note: 'Ukuran tabel beserta index-nya',
          },
        ],
      },
    ],
  },
  {
    slug: 'laravel',
    title: 'Laravel & Artisan',
    group: 'Backend & data',
    summary:
      'Perintah Artisan dan pola Eloquent untuk Laravel 11 dan 12. Di PHP, `fn` adalah kata kunci resmi untuk arrow function, berbeda dari JavaScript yang memakainya sebagai nama variabel biasa.',
    sections: [
      {
        title: 'Artisan',
        lang: 'bash',
        rows: [
          {
            code: 'php artisan make:model Post -mfsc',
            note: 'Model beserta migration, factory, seeder, dan controller',
          },
          {
            code: 'php artisan make:controller PostController --api',
            note: 'Controller khusus API',
          },
          {
            code: 'php artisan make:request SimpanPostRequest',
            note: 'Form Request untuk validasi',
          },
          {
            code: 'php artisan make:policy PostPolicy --model=Post',
            note: 'Aturan izin per model',
          },
          { code: 'php artisan install:api', note: 'Siapkan `routes/api.php` dan Sanctum' },
          { code: 'php artisan migrate --seed', note: 'Jalankan migrasi lalu seeder' },
          {
            code: 'php artisan migrate:fresh',
            note: 'Hapus semua tabel lalu ulangi. Jangan di produksi',
          },
          { code: 'php artisan route:list', note: 'Lihat semua route terdaftar' },
          { code: 'php artisan tinker', note: 'REPL dengan seluruh aplikasi termuat' },
          { code: 'php artisan queue:work', note: 'Jalankan worker antrean' },
          { code: 'php artisan test --filter=PostTest', note: 'Jalankan sebagian test' },
          { code: 'php artisan optimize', note: 'Cache config, route, dan view untuk produksi' },
        ],
      },
      {
        title: 'Routing & validasi',
        lang: 'php',
        rows: [
          {
            code: "Route::apiResource('posts', PostController::class);",
            note: 'Lima route REST sekaligus',
          },
          {
            code: "Route::middleware('auth:sanctum')->group(function () { ... });",
            note: 'Wajib login untuk semua route di dalamnya',
          },
          {
            code: "$request->validate(['judul' => 'required|string|max:200']);",
            note: 'Validasi cepat di controller',
          },
          {
            code: "'email' => ['required', 'email', Rule::unique('users')->ignore($user)]",
            note: 'Unik, kecuali milik dirinya sendiri',
          },
          {
            code: '$post->update($request->validated());',
            note: 'Hanya field yang lolos validasi',
          },
          {
            code: "Gate::authorize('update', $post);",
            note: 'Cek policy. Otomatis 403 kalau ditolak',
          },
          { code: 'return new PostResource($post);', note: 'Bentuk JSON lewat API Resource' },
          { code: 'abort(404);', note: 'Hentikan dengan status tertentu' },
        ],
      },
      {
        title: 'Eloquent',
        lang: 'php',
        rows: [
          { code: "Post::with('author')->get()", note: 'Eager loading, menghindari N+1' },
          {
            code: "Post::where('slug', $slug)->firstOrFail()",
            note: '404 otomatis kalau tidak ada',
          },
          { code: 'Post::latest()->paginate(15)', note: 'Terbaru dulu, 15 per halaman' },
          {
            code: "Post::query()->when($cari, fn ($q) => $q->where('judul', 'like', \"%{$cari}%\"))",
            note: 'Syarat hanya dipasang kalau `$cari` terisi',
          },
          { code: '$post->comments()->create([...])', note: 'Buat data lewat relasi' },
          { code: "$post->load('comments')", note: 'Muat relasi setelah model diambil' },
          { code: 'DB::transaction(fn () => ...)', note: 'Transaksi' },
          {
            code: 'Model::preventLazyLoading()',
            note: 'Jadikan N+1 sebagai error saat development',
          },
        ],
      },
    ],
  },

  /* ================================================================ Keamanan */
  {
    slug: 'keamanan',
    title: 'Keamanan Web',
    group: 'Keamanan',
    summary:
      'Bentuk yang benar untuk kontrol keamanan yang paling sering salah pasang. Semuanya dijalankan di server, bukan di browser.',
    sections: [
      {
        title: 'Password & token',
        lang: 'ts',
        rows: [
          {
            code: 'await argon2.hash(kataSandi, { type: argon2.argon2id })',
            note: 'Hash password. Jangan MD5 atau SHA biasa',
          },
          { code: 'await argon2.verify(hash, kataSandi)', note: 'Cocokkan password saat login' },
          {
            code: "crypto.randomBytes(32).toString('base64url')",
            note: 'Token acak untuk reset password atau session',
          },
          {
            code: "crypto.createHash('sha256').update(token).digest('hex')",
            note: 'Simpan hash token reset di database, bukan tokennya',
          },
          {
            code: 'crypto.timingSafeEqual(a, b)',
            note: 'Bandingkan rahasia tanpa bocor lewat waktu. Panjangnya harus sama',
          },
        ],
      },
      {
        title: 'Cookie & session',
        lang: 'ts',
        rows: [
          {
            code: "res.cookie('sid', id, { httpOnly: true, secure: true, sameSite: 'lax' })",
            note: 'Cookie session yang tidak bisa dibaca JavaScript',
          },
          { code: "sameSite: 'strict'", note: 'Tidak ikut terkirim dari situs lain sama sekali' },
          {
            code: 'maxAge: 7 * 24 * 60 * 60 * 1000',
            note: 'Umur cookie dalam milidetik, di sini 7 hari',
          },
          {
            code: 'req.session.regenerate(cb)',
            note: 'Ganti session id setelah login untuk mencegah session fixation',
          },
          { code: "res.clearCookie('sid')", note: 'Hapus cookie saat logout' },
        ],
      },
      {
        title: 'Header keamanan',
        lang: 'text',
        rows: [
          {
            code: "Content-Security-Policy: default-src 'self'",
            note: 'Hanya muat skrip dan aset dari origin sendiri',
          },
          {
            code: "Content-Security-Policy: frame-ancestors 'none'",
            note: 'Halaman tidak boleh dimuat di iframe, mencegah clickjacking',
          },
          {
            code: 'Strict-Transport-Security: max-age=63072000; includeSubDomains',
            note: 'Paksa HTTPS selama dua tahun',
          },
          { code: 'X-Content-Type-Options: nosniff', note: 'Browser tidak menebak jenis berkas' },
          {
            code: 'Referrer-Policy: strict-origin-when-cross-origin',
            note: 'Path lengkap tidak bocor ke situs lain',
          },
        ],
      },
      {
        title: 'Input & output',
        lang: 'ts',
        rows: [
          {
            code: "db.query('SELECT nama FROM t WHERE id = $1', [id])",
            note: 'Parameter, bukan template string. Menutup SQL injection',
          },
          {
            code: 'Skema.parse(req.body)',
            note: 'Validasi di server dengan allow-list bentuk data',
          },
          {
            code: 'el.textContent = input',
            note: 'Tampilkan data pengguna sebagai teks, bukan HTML',
          },
          {
            code: 'new URL(tujuan, location.origin).origin === location.origin',
            note: 'Cegah open redirect, hanya alihkan ke origin sendiri',
          },
          { code: 'npm audit --omit=dev', note: 'Kerentanan di dependency produksi' },
          {
            code: "git log -p -S 'API_KEY'",
            note: 'Cari rahasia yang pernah ter-commit, lalu rotasi rahasianya',
          },
        ],
      },
    ],
  },

  /* ================================================ Deployment & operasional */
  {
    slug: 'git',
    title: 'Git',
    group: 'Deployment & operasional',
    summary: 'Perintah harian, penyelamat saat salah langkah, dan rilis dengan tag.',
    sections: [
      {
        title: 'Harian',
        lang: 'bash',
        rows: [
          { code: 'git status', note: 'Selalu cek sebelum melakukan apa pun' },
          { code: 'git add <file>', note: 'Per berkas, bukan `git add .`' },
          { code: 'git diff --staged', note: 'Lihat persis apa yang akan di-commit' },
          {
            code: 'git commit -m "feat: tambah filter produk"',
            note: 'Awalan `feat`, `fix`, atau `docs` mengikuti Conventional Commits',
          },
          { code: 'git log --oneline --graph -20', note: 'Riwayat ringkas' },
          { code: 'git pull --rebase', note: 'Ambil perubahan tanpa commit merge tambahan' },
          {
            code: 'git push -u origin fitur/x',
            note: 'Push branch baru sekaligus menghubungkannya',
          },
        ],
      },
      {
        title: 'Branch & gabung',
        lang: 'bash',
        rows: [
          { code: 'git switch -c fitur/x', note: 'Buat dan pindah ke branch baru' },
          { code: 'git switch main', note: 'Pindah branch' },
          { code: 'git switch -', note: 'Kembali ke branch sebelumnya' },
          {
            code: 'git merge --no-ff fitur/x',
            note: 'Gabung dengan commit merge, riwayat fitur tetap terlihat',
          },
          { code: 'git rebase main', note: 'Pindahkan commit branch ini ke atas main terbaru' },
          { code: 'git branch -d fitur/x', note: 'Hapus branch yang sudah digabung' },
          { code: 'git fetch --prune', note: 'Buang referensi branch remote yang sudah dihapus' },
          {
            code: 'git stash push -m "setengah jadi"',
            note: 'Simpan sementara perubahan yang belum di-commit',
          },
          { code: 'git stash pop', note: 'Kembalikan simpanan terakhir' },
        ],
      },
      {
        title: 'Saat salah langkah',
        lang: 'bash',
        rows: [
          { code: 'git restore <file>', note: 'Buang perubahan yang belum di-stage' },
          { code: 'git restore --staged <file>', note: 'Batalkan stage, isi berkas tetap' },
          { code: 'git commit --amend', note: 'Perbaiki commit terakhir yang belum di-push' },
          {
            code: 'git reset --soft HEAD~1',
            note: 'Batalkan commit terakhir, perubahannya tetap di stage',
          },
          {
            code: 'git revert <hash>',
            note: 'Batalkan commit dengan commit baru. Aman untuk branch bersama',
          },
          {
            code: 'git reflog',
            note: 'Jaring pengaman terakhir. Hampir semua bisa dipulihkan dari sini',
          },
          { code: 'git cherry-pick <hash>', note: 'Salin satu commit ke branch ini' },
          { code: 'git bisect start', note: 'Cari commit penyebab bug dengan membelah riwayat' },
        ],
      },
      {
        title: 'Rilis & tag',
        lang: 'bash',
        rows: [
          {
            code: 'git tag -a v2.0.0 -m "Rilis 2.0.0"',
            note: 'Tag beranotasi, menyimpan pembuat dan tanggal',
          },
          { code: 'git push origin v2.0.0', note: 'Tag tidak ikut terkirim tanpa diminta' },
          { code: 'git push --follow-tags', note: 'Kirim commit beserta tag beranotasinya' },
          { code: 'git tag -l "v2.*"', note: 'Daftar tag yang cocok' },
          { code: 'git describe --tags', note: 'Tag terdekat dari commit sekarang' },
          {
            code: 'git log v1.0.0..HEAD --oneline',
            note: 'Commit sejak rilis terakhir, bahan untuk changelog',
          },
        ],
      },
    ],
  },
  {
    slug: 'docker',
    title: 'Docker',
    group: 'Deployment & operasional',
    summary:
      'Perintah harian, Dockerfile multi-stage untuk Node, dan Compose untuk menjalankan beberapa service sekaligus.',
    sections: [
      {
        title: 'Perintah',
        lang: 'bash',
        rows: [
          { code: 'docker build -t app:1.0 .', note: 'Bangun image dari Dockerfile di folder ini' },
          {
            code: 'docker run --rm -p 3000:3000 --env-file .env app:1.0',
            note: 'Jalankan container. Port kiri milik host, kanan milik container',
          },
          { code: 'docker ps', note: 'Container yang sedang berjalan' },
          { code: 'docker logs -f <container>', note: 'Ikuti log container' },
          { code: 'docker exec -it <container> sh', note: 'Masuk ke dalam container' },
          { code: 'docker image ls', note: 'Lihat ukuran image' },
          { code: 'docker system prune -f', note: 'Bersihkan sisa yang tidak terpakai' },
        ],
      },
      {
        title: 'Compose',
        lang: 'bash',
        rows: [
          { code: 'docker compose up -d --build', note: 'Bangun lalu jalankan di latar belakang' },
          { code: 'docker compose logs -f app', note: 'Ikuti log satu service' },
          { code: 'docker compose exec app sh', note: 'Masuk ke container sebuah service' },
          { code: 'docker compose ps', note: 'Status semua service' },
          { code: 'docker compose down', note: 'Hentikan dan hapus container. Volume tetap ada' },
          { code: 'docker compose down -v', note: 'Ikut hapus volume. Data database hilang' },
        ],
      },
      {
        title: 'Dockerfile',
        lang: 'text',
        rows: [
          { code: 'FROM node:22-alpine AS build', note: 'Stage build terpisah' },
          { code: 'WORKDIR /app', note: 'Folder kerja di dalam image' },
          {
            code: 'COPY package*.json ./',
            note: 'Salin manifest dulu, supaya cache instalasi terpakai ulang',
          },
          { code: 'RUN npm ci', note: 'Instal persis sesuai lockfile' },
          { code: 'COPY . .', note: 'Baru salin sisa kode' },
          { code: 'FROM node:22-alpine AS runtime', note: 'Stage akhir tanpa alat build' },
          {
            code: 'COPY --from=build /app/dist ./dist',
            note: 'Ambil hasil build dari stage sebelumnya',
          },
          { code: 'USER node', note: 'Jalankan sebagai user biasa, bukan root' },
          {
            code: 'HEALTHCHECK CMD wget -qO- http://localhost:3000/health || exit 1',
            note: 'Container yang bisa dipantau kesehatannya',
          },
          {
            code: 'CMD ["node", "dist/server.js"]',
            note: 'Bentuk exec, supaya sinyal berhenti sampai ke Node',
          },
        ],
      },
      {
        title: 'compose.yaml',
        lang: 'yaml',
        rows: [
          { code: 'ports: ["3000:3000"]', note: 'Buka port host ke container' },
          { code: 'env_file: .env', note: 'Muat variabel lingkungan dari berkas' },
          {
            code: 'depends_on: { db: { condition: service_healthy } }',
            note: 'Tunggu database sehat dulu',
          },
          {
            code: 'healthcheck: { test: ["CMD", "pg_isready", "-U", "app"], interval: 5s }',
            note: 'Cara Compose tahu service sudah siap',
          },
          {
            code: 'volumes: ["pgdata:/var/lib/postgresql/data"]',
            note: 'Data database bertahan walau container dihapus',
          },
          {
            code: 'restart: unless-stopped',
            note: 'Nyalakan ulang otomatis, kecuali dihentikan manual',
          },
        ],
      },
      {
        title: 'Isi .dockerignore',
        lang: 'text',
        rows: [
          { code: 'node_modules', note: 'Tidak ikut dikirim ke proses build' },
          { code: '.env', note: 'Rahasia tidak boleh masuk ke image' },
          { code: '.git', note: 'Riwayat git tidak dibutuhkan image' },
        ],
      },
    ],
  },
  {
    slug: 'cicd',
    title: 'CI/CD GitHub Actions',
    group: 'Deployment & operasional',
    summary:
      'Potongan workflow di `.github/workflows/`. Versi action mengikuti materi, yaitu `checkout@v4` dan `setup-node@v4`.',
    sections: [
      {
        title: 'Pemicu',
        lang: 'yaml',
        rows: [
          { code: 'on: [push, pull_request]', note: 'Jalan di setiap push dan pull request' },
          { code: 'on: { push: { branches: [main] } }', note: 'Hanya saat push ke main' },
          { code: 'on: { push: { tags: ["v*"] } }', note: 'Saat tag rilis dikirim' },
          { code: 'on: { workflow_dispatch: {} }', note: 'Tombol jalankan manual di tab Actions' },
          {
            code: 'concurrency: { group: "${{ github.workflow }}-${{ github.ref }}", cancel-in-progress: true }',
            note: 'Batalkan run lama di branch yang sama',
          },
        ],
      },
      {
        title: 'Job & langkah',
        lang: 'yaml',
        rows: [
          { code: 'runs-on: ubuntu-latest', note: 'Mesin yang menjalankan job' },
          { code: '- uses: actions/checkout@v4', note: 'Ambil kode repo' },
          {
            code: '- uses: actions/setup-node@v4\n  with: { node-version: 22, cache: npm }',
            note: 'Pasang Node beserta cache npm',
          },
          { code: '- run: npm ci', note: 'Instal sesuai lockfile' },
          { code: '- run: npm test', note: 'Job gagal kalau perintahnya gagal' },
          { code: 'needs: test', note: 'Tunggu job `test` lulus dulu' },
          { code: "if: github.ref == 'refs/heads/main'", note: 'Jalan hanya di main' },
          {
            code: 'strategy: { matrix: { node: [20, 22] } }',
            note: 'Jalankan job yang sama untuk beberapa versi',
          },
          { code: 'timeout-minutes: 15', note: 'Hentikan job yang macet' },
        ],
      },
      {
        title: 'Rahasia & izin',
        lang: 'yaml',
        rows: [
          { code: 'permissions: { contents: read }', note: 'Izin token sekecil mungkin' },
          {
            code: '${{ secrets.DEPLOY_TOKEN }}',
            note: 'Rahasia dari pengaturan repo, disamarkan di log',
          },
          { code: '${{ vars.API_URL }}', note: 'Variabel yang bukan rahasia' },
          {
            code: 'environment: production',
            note: 'Bisa diberi reviewer wajib sebelum deploy berjalan',
          },
          {
            code: 'env: { NODE_ENV: production }',
            note: 'Variabel lingkungan untuk semua langkah',
          },
        ],
      },
    ],
  },
  {
    slug: 'server',
    title: 'Server & Operasional',
    group: 'Deployment & operasional',
    summary:
      'Perintah di server Linux, dari SSH sampai pm2 dan nginx. Alamat `203.0.113.10` hanyalah contoh, ganti dengan alamat servermu.',
    sections: [
      {
        title: 'SSH & berkas',
        lang: 'bash',
        rows: [
          { code: 'ssh deploy@203.0.113.10', note: 'Masuk ke server sebagai user `deploy`' },
          {
            code: 'ssh-keygen -t ed25519 -C "email@contoh.id"',
            note: 'Buat pasangan kunci SSH',
          },
          { code: 'ssh-copy-id deploy@203.0.113.10', note: 'Pasang kunci publik di server' },
          { code: 'scp .env deploy@203.0.113.10:/srv/app/', note: 'Salin satu berkas ke server' },
          {
            code: 'rsync -az --delete dist/ deploy@203.0.113.10:/srv/app/dist/',
            note: 'Samakan isi folder, hanya yang berubah yang dikirim',
          },
        ],
      },
      {
        title: 'Proses',
        lang: 'bash',
        rows: [
          {
            code: 'pm2 start ecosystem.config.js --env production',
            note: 'Jalankan aplikasi dari berkas konfigurasi',
          },
          { code: 'pm2 reload api', note: 'Restart tanpa downtime' },
          { code: 'pm2 logs api --lines 50', note: 'Lima puluh baris log terakhir' },
          { code: 'pm2 status', note: 'Semua proses beserta pemakaian memorinya' },
          { code: 'pm2 save && pm2 startup', note: 'Jalan otomatis lagi setelah server reboot' },
          { code: 'sudo systemctl status nginx', note: 'Status sebuah service' },
          {
            code: 'sudo systemctl reload nginx',
            note: 'Muat ulang konfigurasi tanpa memutus koneksi',
          },
          { code: 'journalctl -u nginx -f', note: 'Ikuti log service systemd' },
        ],
      },
      {
        title: 'nginx',
        lang: 'text',
        rows: [
          {
            code: 'location / { proxy_pass http://127.0.0.1:3000; }',
            note: 'Teruskan request ke aplikasi Node',
          },
          { code: 'proxy_set_header Host $host;', note: 'Teruskan nama domain asli' },
          {
            code: 'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
            note: 'Teruskan IP klien yang asli',
          },
          {
            code: 'proxy_set_header X-Forwarded-Proto $scheme;',
            note: 'Beri tahu aplikasi bahwa klien memakai HTTPS',
          },
          { code: 'client_max_body_size 10m;', note: 'Batas ukuran upload' },
          { code: 'sudo nginx -t', note: 'Cek konfigurasi sebelum reload' },
          {
            code: 'sudo certbot --nginx -d contoh.id',
            note: "Sertifikat HTTPS gratis dari Let's Encrypt",
          },
        ],
      },
      {
        title: 'Diagnosa',
        lang: 'bash',
        rows: [
          { code: 'ss -tlnp', note: 'Port yang sedang didengarkan beserta prosesnya' },
          { code: 'lsof -i :3000', note: 'Proses yang memakai port 3000' },
          { code: 'tail -f /var/log/nginx/error.log', note: 'Ikuti log error nginx' },
          { code: 'df -h', note: 'Sisa ruang disk' },
          { code: 'free -h', note: 'Pemakaian memori' },
          { code: 'du -sh * | sort -h', note: 'Folder mana yang paling besar' },
          { code: 'top', note: 'Proses yang paling berat. Tekan `q` untuk keluar' },
        ],
      },
    ],
  },

  /* ========================================================= Arsitektur & AI */
  {
    slug: 'system-design',
    title: 'System Design',
    group: 'Arsitektur & AI',
    summary:
      'Angka dan rumus untuk estimasi cepat, sama dengan yang dipakai di materi. Yang penting urutan besarnya, bukan nilai persisnya.',
    sections: [
      {
        title: 'Angka latensi',
        lang: 'text',
        rows: [
          {
            code: 'baca memori utama        100 ns',
            note: 'Titik acuan, sekitar 200 kali cache L1',
          },
          { code: 'baca 4 KB acak dari SSD  150 us', note: 'Sekitar 1.500 kali memori' },
          { code: 'pulang pergi satu pusat data  500 us', note: 'Sekitar 5.000 kali memori' },
          {
            code: 'baca 1 MB berurutan dari SSD  1 ms',
            note: 'Membaca berurutan jauh lebih murah',
          },
          { code: 'cari posisi di disk berputar  10 ms', note: 'Sekitar 100.000 kali memori' },
          { code: 'pulang pergi antar benua  150 ms', note: 'Sekitar 1,5 juta kali memori' },
          {
            code: 'tulis 1 KB + fsync ke SSD  1,24 ms',
            note: 'Diukur di materi. Alasan menulis ke database terasa mahal',
          },
          {
            code: 'satu panggilan HTTP ke internet  ~70 ms',
            note: 'Sepuluh panggilan berurutan sudah sekitar 700 ms',
          },
        ],
      },
      {
        title: 'Estimasi kapasitas',
        lang: 'text',
        rows: [
          {
            code: 'QPS rata-rata = DAU x aksi per pengguna per hari / 86.400',
            note: 'Satu hari ada 86.400 detik',
          },
          {
            code: 'QPS puncak = QPS rata-rata x faktor puncak (2 sampai 5)',
            note: 'Faktor puncak tergantung pola pemakaian',
          },
          {
            code: '1 juta request per hari = ~12 QPS',
            note: 'Patokan cepat, biasanya jauh lebih kecil dari dugaan',
          },
          {
            code: 'penyimpanan per hari = data baru per hari x ukuran satu baris',
            note: 'Kalikan 365, lalu kalikan lama penyimpanan dalam tahun',
          },
          {
            code: 'bandwidth = QPS x ukuran respons',
            note: 'Contohnya 100 QPS x 50 KB = 5 MB per detik',
          },
          {
            code: 'jumlah mesin = QPS puncak / kapasitas per mesin, lalu x 2',
            note: 'Dua kali lipat sebagai cadangan',
          },
        ],
      },
      {
        title: 'Satuan',
        lang: 'text',
        rows: [
          { code: '2^10 = ~1 ribu     KB', note: 'Kilo' },
          { code: '2^20 = ~1 juta     MB', note: 'Mega' },
          { code: '2^30 = ~1 miliar   GB', note: 'Giga' },
          { code: '2^40 = ~1 triliun  TB', note: 'Tera' },
          { code: '1 hari  = 86.400 detik', note: 'Pembagi QPS' },
          { code: '1 tahun = ~31,5 juta detik', note: 'Sekitar 3,15 x 10^7' },
        ],
      },
      {
        title: 'Availability',
        lang: 'text',
        rows: [
          {
            code: '99%      87,6 jam/tahun   438,0 menit/bulan',
            note: 'Waktu mati yang masih diizinkan',
          },
          {
            code: '99,9%    8,8 jam/tahun    43,8 menit/bulan',
            note: 'Masih sempat ditangani manusia',
          },
          { code: '99,95%   4,4 jam/tahun    21,9 menit/bulan', note: 'Di antara keduanya' },
          {
            code: '99,99%   0,9 jam/tahun    4,4 menit/bulan',
            note: 'Pemulihan harus otomatis',
          },
          {
            code: '99,999%  0,1 jam/tahun    0,4 menit/bulan',
            note: 'Mahal dan jarang benar-benar dibutuhkan',
          },
          {
            code: 'A lalu B berurutan = A x B',
            note: 'Dua layanan 99,9% yang wajib hidup bersama hanya mencapai 99,8%',
          },
        ],
      },
    ],
  },
  {
    slug: 'arsitektur',
    title: 'Arsitektur',
    group: 'Arsitektur & AI',
    summary:
      'Template ADR, tingkat diagram C4, dan cara menegakkan batas modul. Bentuknya mengikuti bab Architecture Design.',
    sections: [
      {
        title: 'Template ADR',
        lang: 'text',
        rows: [
          {
            code: 'docs/adr/0007-kolom-penghitung.md',
            note: 'Satu berkas untuk setiap keputusan, bernomor urut',
          },
          { code: '# ADR 0007: Judul keputusan', note: 'Judul berupa keputusan, bukan topik' },
          {
            code: 'Status  : Diterima',
            note: 'Diusulkan, Diterima, atau Digantikan oleh ADR lain',
          },
          { code: '## Konteks', note: 'Masalahnya, beserta angka yang mendorong keputusan' },
          { code: '## Keputusan', note: 'Apa yang dipilih' },
          {
            code: '## Alternatif yang ditolak',
            note: 'Bagian yang paling dicari pembaca berikutnya',
          },
          { code: '## Konsekuensi', note: 'Harga yang dibayar, termasuk yang buruk' },
        ],
      },
      {
        title: 'Tingkat diagram C4',
        lang: 'text',
        rows: [
          {
            code: 'Level 1  System Context',
            note: 'Sistem sebagai satu kotak, beserta pengguna dan sistem lain',
          },
          {
            code: 'Level 2  Container',
            note: 'Aplikasi dan penyimpanan data yang berjalan sendiri. Bukan container Docker',
          },
          { code: 'Level 3  Component', note: 'Bagian besar di dalam satu container' },
          { code: 'Level 4  Code', note: 'Class dan fungsi. Jarang perlu digambar' },
        ],
      },
      {
        title: 'Batas modul',
        lang: 'ts',
        rows: [
          { code: 'src/pesanan/index.ts', note: 'Satu pintu masuk resmi untuk setiap modul' },
          {
            code: "import { buatPesanan } from '@/pesanan'",
            note: 'Impor lewat pintu masuk, bukan berkas di dalamnya',
          },
          {
            code: "export type { Pesanan } from './tipe'",
            note: 'Tipe publik juga lewat pintu masuk',
          },
          {
            code: "'no-restricted-imports': ['error', { patterns: [...] }]",
            note: 'Pelanggaran batas modul gagal di CI',
          },
        ],
      },
    ],
  },
  {
    slug: 'claude-code',
    title: 'Claude Code & Codex',
    group: 'Arsitektur & AI',
    summary:
      'Perintah Claude Code dan Codex CLI yang dipakai di bab Prompt Engineering. Flag Claude Code diperiksa terhadap versi 2.1.',
    sections: [
      {
        title: 'Claude Code di terminal',
        lang: 'bash',
        rows: [
          { code: 'claude', note: 'Mulai sesi interaktif di folder project' },
          {
            code: 'claude -p "jelaskan fungsi ini"',
            note: 'Sekali jalan tanpa sesi, cocok untuk skrip dan CI',
          },
          { code: 'claude -c', note: 'Lanjutkan percakapan terakhir di folder ini' },
          { code: 'claude --resume', note: 'Pilih percakapan lama untuk dilanjutkan' },
          {
            code: 'claude --permission-mode plan',
            note: 'Mulai di plan mode, hanya membaca sampai rencananya disetujui',
          },
          { code: 'claude --model <nama>', note: 'Pilih model untuk sesi ini' },
          { code: 'claude doctor', note: 'Periksa kesehatan instalasi' },
        ],
      },
      {
        title: 'Di dalam sesi',
        lang: 'text',
        rows: [
          { code: '/init', note: 'Buat `CLAUDE.md` dari isi codebase' },
          { code: '/memory', note: 'Sunting `CLAUDE.md` dan pengaturan memori' },
          { code: '/context', note: 'Lihat pemakaian context window' },
          { code: '/model', note: 'Ganti model dan kedalaman penalaran' },
          { code: '/permissions', note: 'Atur alat mana yang diizinkan dan mana yang ditolak' },
          {
            code: '/clear',
            note: 'Mulai sesi baru dengan context kosong. Sesi lama tetap bisa dibuka dengan `/resume`',
          },
          { code: '/compact', note: 'Ringkas percakapan supaya context lega' },
          { code: 'Shift+Tab', note: 'Ganti mode izin, termasuk plan mode' },
          { code: 'Esc', note: 'Hentikan Claude di tengah jalan' },
          { code: '@src/app/page.tsx', note: 'Sertakan berkas ke dalam prompt' },
        ],
      },
      {
        title: 'Berkas konfigurasi',
        lang: 'text',
        rows: [
          { code: 'CLAUDE.md', note: 'Instruksi project, dibaca di awal setiap sesi' },
          { code: '~/.claude/CLAUDE.md', note: 'Instruksi pribadi untuk semua project' },
          { code: '.claude/settings.json', note: 'Izin, hook, dan pengaturan project' },
          {
            code: '.claude/skills/<nama>/SKILL.md',
            note: 'Skill yang dimuat saat tugasnya cocok',
          },
          { code: '@AGENTS.md', note: 'Tulis di `CLAUDE.md` supaya `AGENTS.md` ikut dimuat' },
        ],
      },
      {
        title: 'Codex CLI',
        lang: 'bash',
        rows: [
          { code: 'codex', note: 'Mulai sesi interaktif' },
          {
            code: 'codex exec "jalankan test dan laporkan yang gagal"',
            note: 'Sekali jalan tanpa sesi',
          },
          { code: 'codex resume', note: 'Lanjutkan percakapan lama' },
          { code: 'codex --search', note: 'Izinkan pencarian web' },
          { code: 'codex --image tangkapan-layar.png', note: 'Sertakan gambar ke dalam prompt' },
          {
            code: 'AGENTS.md',
            note: 'Instruksi project yang dibaca Codex dan banyak alat lain',
          },
        ],
      },
    ],
  },
];
