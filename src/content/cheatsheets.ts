import type { CodeLang } from '@/lib/content/types';

/**
 * Quick-reference sheets.
 *
 * Deliberately not a second copy of the lessons: each row is something you look up while typing
 * and forget again — syntax, a flag, an argument order. Explanations belong in the curriculum.
 */

export type CheatsheetRow = { code: string; note: string };

export type CheatsheetSection = {
  title: string;
  lang: CodeLang;
  rows: CheatsheetRow[];
};

export type Cheatsheet = {
  slug: string;
  title: string;
  summary: string;
  sections: CheatsheetSection[];
};

export const cheatsheets: Cheatsheet[] = [
  {
    slug: 'javascript',
    title: 'JavaScript',
    summary: 'Sintaks dan method yang paling sering dicari ulang.',
    sections: [
      {
        title: 'Array',
        lang: 'js',
        rows: [
          { code: 'arr.map(fn)', note: 'Array baru hasil transformasi tiap elemen' },
          { code: 'arr.filter(fn)', note: 'Array baru berisi elemen yang lolos' },
          { code: 'arr.reduce(fn, awal)', note: 'Meringkas array jadi satu nilai' },
          { code: 'arr.find(fn)', note: 'Elemen pertama yang cocok, atau undefined' },
          { code: 'arr.some(fn) / arr.every(fn)', note: 'Ada yang cocok / semua cocok' },
          { code: 'arr.at(-1)', note: 'Elemen terakhir, tanpa hitung panjang' },
          { code: 'arr.toSorted(fn)', note: 'Urut tanpa mengubah array asli' },
          { code: 'arr.with(i, nilai)', note: 'Salinan dengan satu elemen diganti' },
          { code: 'Array.from({length: n}, (_, i) => i)', note: 'Bikin array 0..n-1' },
        ],
      },
      {
        title: 'Object',
        lang: 'js',
        rows: [
          { code: 'Object.keys/values/entries(o)', note: 'Kunci / nilai / pasangan' },
          { code: 'Object.fromEntries(pairs)', note: 'Kebalikan dari entries' },
          { code: '{ ...a, ...b }', note: 'Gabung dangkal, b menimpa a' },
          { code: 'structuredClone(o)', note: 'Salinan dalam, termasuk Date & Map' },
          { code: 'o?.a?.b ?? "default"', note: 'Akses aman + nilai bawaan' },
          { code: 'const { a, ...sisa } = o', note: 'Ambil satu, kumpulkan sisanya' },
        ],
      },
      {
        title: 'Async',
        lang: 'js',
        rows: [
          { code: 'await Promise.all([a, b])', note: 'Paralel, gagal kalau salah satu gagal' },
          { code: 'await Promise.allSettled([a, b])', note: 'Paralel, laporkan semua hasil' },
          { code: 'AbortSignal.timeout(5000)', note: 'Batalkan otomatis setelah 5 detik' },
          { code: 'for await (const x of stream)', note: 'Iterasi sumber asinkron' },
          { code: 'queueMicrotask(fn)', note: 'Jalankan setelah kode ini, sebelum timer' },
        ],
      },
      {
        title: 'String & angka',
        lang: 'js',
        rows: [
          { code: '`Halo ${nama}`', note: 'Template literal' },
          { code: 'str.replaceAll(a, b)', note: 'Ganti semua kemunculan' },
          { code: 'str.padStart(2, "0")', note: 'Tambah nol di depan' },
          { code: 'n.toLocaleString("id-ID")', note: 'Format angka gaya Indonesia' },
          { code: 'Number.isNaN(x)', note: 'Cek NaN dengan benar' },
          { code: 'Math.abs(a - b) < Number.EPSILON', note: 'Bandingkan desimal dengan aman' },
        ],
      },
    ],
  },
  {
    slug: 'react',
    title: 'React',
    summary: 'Hook dan pola yang paling sering dipakai.',
    sections: [
      {
        title: 'Hook dasar',
        lang: 'tsx',
        rows: [
          { code: 'const [x, setX] = useState(awal)', note: 'State lokal' },
          { code: 'useState(() => hitungMahal())', note: 'Lazy initializer, jalan sekali' },
          { code: 'setX(prev => prev + 1)', note: 'Wajib bila nilai baru bergantung yang lama' },
          {
            code: 'useEffect(() => { ...; return cleanup }, [dep])',
            note: 'Sinkronisasi + pembersihan',
          },
          { code: 'const ref = useRef<HTMLInputElement>(null)', note: 'Akses elemen DOM' },
          { code: 'const id = useId()', note: 'Id stabil, aman terhadap hidrasi' },
        ],
      },
      {
        title: 'Pola',
        lang: 'tsx',
        rows: [
          { code: '{items.length > 0 && <List />}', note: 'Jangan pakai `items.length &&`' },
          { code: '{items.map(i => <Row key={i.id} />)}', note: 'key stabil, bukan indeks' },
          { code: '<Ctx.Provider value={v}>', note: 'Nilai yang jarang berubah saja' },
          { code: 'useSyncExternalStore(sub, get, getServer)', note: 'Store di luar React' },
          { code: 'useTransition()', note: 'Tandai pembaruan sebagai tidak mendesak' },
        ],
      },
    ],
  },
  {
    slug: 'tailwind',
    title: 'Tailwind CSS v4',
    summary: 'Konfigurasi CSS-first dan utility yang sering lupa.',
    sections: [
      {
        title: 'Setup & token',
        lang: 'css',
        rows: [
          { code: '@import "tailwindcss";', note: 'Menggantikan tiga direktif v3' },
          { code: '@theme { --color-brand: #8F5314; }', note: 'Token → utility `bg-brand`' },
          { code: '@theme inline { --color-bg: var(--bg); }', note: 'Token yang ikut tema aktif' },
          {
            code: '@custom-variant dark (&:where(.dark, .dark *));',
            note: 'Dark mode berbasis class',
          },
        ],
      },
      {
        title: 'Utility',
        lang: 'html',
        rows: [
          { code: 'group / group-hover:*', note: 'Bereaksi pada hover induk' },
          { code: 'peer / peer-checked:*', note: 'Bereaksi pada state elemen sebelumnya' },
          { code: 'focus-visible:outline-2', note: 'Focus ring hanya untuk keyboard' },
          { code: 'motion-reduce:transition-none', note: 'Hormati prefers-reduced-motion' },
          { code: 'sr-only / not-sr-only', note: 'Terbaca screen reader, tak terlihat' },
          { code: 'overflow-x-auto', note: 'Scroll di dalam wadahnya sendiri' },
        ],
      },
    ],
  },
  {
    slug: 'sql',
    title: 'SQL',
    summary: 'Query yang paling sering ditulis ulang.',
    sections: [
      {
        title: 'Membaca',
        lang: 'sql',
        rows: [
          {
            code: 'SELECT a, b FROM t WHERE x = $1',
            note: 'Selalu parameter, jangan rangkai string',
          },
          { code: 'ORDER BY created_at DESC LIMIT 20', note: 'Urut dan batasi' },
          { code: 'LEFT JOIN c ON c.t_id = t.id', note: 'Pertahankan baris tabel kiri' },
          { code: 'GROUP BY t.id HAVING COUNT(*) > 1', note: 'Saring setelah agregasi' },
          { code: 'WHERE id > $1 ORDER BY id LIMIT 20', note: 'Paginasi cursor' },
        ],
      },
      {
        title: 'Mengubah',
        lang: 'sql',
        rows: [
          { code: 'BEGIN; ... COMMIT;', note: 'Beberapa penulisan sebagai satu kesatuan' },
          { code: 'INSERT ... ON CONFLICT DO NOTHING', note: 'Aman terhadap duplikat' },
          { code: 'UPDATE t SET a = $1 WHERE id = $2', note: 'Jangan pernah lupa WHERE' },
          { code: 'CREATE INDEX CONCURRENTLY ...', note: 'Index tanpa mengunci tabel' },
        ],
      },
    ],
  },
  {
    slug: 'express',
    title: 'Express & Node',
    summary: 'Potongan yang berulang di setiap project.',
    sections: [
      {
        title: 'Express 5',
        lang: 'ts',
        rows: [
          { code: "app.use(express.json({ limit: '100kb' }))", note: 'Batasi ukuran body' },
          { code: 'router.get("/:id", handler)', note: 'Route param' },
          { code: 'app.use((err, req, res, next) => ...)', note: 'Error handler terpusat' },
          { code: 'res.status(201).location(url).json(data)', note: 'Respons pembuatan data' },
          { code: 'res.status(204).end()', note: 'Berhasil tanpa isi' },
        ],
      },
      {
        title: 'Node',
        lang: 'bash',
        rows: [
          { code: 'node --watch app.js', note: 'Restart otomatis, tanpa nodemon' },
          { code: 'node --env-file=.env app.js', note: 'Muat .env tanpa dotenv' },
          { code: 'npm ls <paket>', note: 'Lihat versi terpasang & siapa yang butuh' },
          { code: 'npm audit', note: 'Cek kerentanan dependency' },
        ],
      },
    ],
  },
  {
    slug: 'laravel',
    title: 'Laravel & Artisan',
    summary: 'Perintah dan pola Eloquent yang paling sering dipakai.',
    sections: [
      {
        title: 'Artisan',
        lang: 'bash',
        rows: [
          {
            code: 'php artisan make:model Post -mfsc',
            note: 'Model + migration + factory + seeder + controller',
          },
          { code: 'php artisan migrate --seed', note: 'Jalankan migrasi lalu seeder' },
          {
            code: 'php artisan migrate:fresh',
            note: 'Hapus semua tabel dan ulangi (jangan di produksi)',
          },
          { code: 'php artisan route:list', note: 'Lihat seluruh rute terdaftar' },
          { code: 'php artisan tinker', note: 'REPL dengan seluruh aplikasi termuat' },
          { code: 'php artisan queue:work', note: 'Jalankan worker antrean' },
        ],
      },
      {
        title: 'Eloquent',
        lang: 'php',
        rows: [
          { code: 'Post::with("author")->get()', note: 'Eager loading, menghindari N+1' },
          { code: 'Post::where("x", $y)->firstOrFail()', note: '404 otomatis kalau tidak ada' },
          { code: '$post->comments()->create([...])', note: 'Buat lewat relasi' },
          { code: 'DB::transaction(fn () => ...)', note: 'Transaksi' },
          {
            code: 'Model::preventLazyLoading()',
            note: 'Jadikan N+1 sebagai error saat development',
          },
        ],
      },
    ],
  },
  {
    slug: 'git',
    title: 'Git',
    summary: 'Perintah harian dan penyelamat saat salah langkah.',
    sections: [
      {
        title: 'Harian',
        lang: 'bash',
        rows: [
          { code: 'git status', note: 'Selalu cek sebelum melakukan apa pun' },
          { code: 'git add <file>', note: 'Per berkas, bukan `git add .`' },
          { code: 'git switch -c fitur/x', note: 'Buat dan pindah ke branch baru' },
          { code: 'git log --oneline --graph -20', note: 'Riwayat ringkas' },
          { code: 'git diff --staged', note: 'Lihat persis apa yang akan di-commit' },
        ],
      },
      {
        title: 'Saat salah langkah',
        lang: 'bash',
        rows: [
          { code: 'git restore <file>', note: 'Buang perubahan yang belum di-stage' },
          { code: 'git restore --staged <file>', note: 'Batalkan stage, isi tetap' },
          { code: 'git commit --amend', note: 'Perbaiki commit terakhir (yang belum di-push)' },
          { code: 'git revert <hash>', note: 'Batalkan commit dengan commit baru — aman' },
          { code: 'git reflog', note: 'Jaring pengaman terakhir; hampir semua bisa dipulihkan' },
        ],
      },
    ],
  },
  {
    slug: 'docker',
    title: 'Docker',
    summary: 'Perintah dan potongan Dockerfile yang berulang.',
    sections: [
      {
        title: 'Perintah',
        lang: 'bash',
        rows: [
          { code: 'docker compose up -d --build', note: 'Bangun dan jalankan di latar' },
          { code: 'docker compose logs -f app', note: 'Ikuti log satu service' },
          { code: 'docker compose exec app sh', note: 'Masuk ke dalam container' },
          { code: 'docker image ls', note: 'Lihat ukuran image' },
          { code: 'docker system prune -f', note: 'Bersihkan sisa yang tidak terpakai' },
        ],
      },
      {
        title: 'Dockerfile',
        lang: 'text',
        rows: [
          { code: 'FROM node:22-alpine AS build', note: 'Stage build terpisah' },
          {
            code: 'COPY package*.json ./ && npm ci',
            note: 'Sebelum COPY sisanya, supaya cache bekerja',
          },
          { code: 'FROM node:22-alpine AS runtime', note: 'Stage akhir tanpa dependency build' },
          {
            code: 'HEALTHCHECK CMD wget -qO- localhost:3000/health',
            note: 'Container yang bisa dipantau',
          },
        ],
      },
    ],
  },
];
