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
 * Backend Intermediate — Chapter 2, all fourteen lessons.
 *
 * Where Backend Basic built a working API, this chapter builds one that survives contact with
 * production: real ORM, real queue, real cache, real tests, real observability.
 *
 * Every added dependency here is also added surface. The chapter says so explicitly at each
 * introduction rather than presenting the stack as free — a reader who adds Redis and BullMQ to a
 * project with fifty users has made it worse, not better.
 */
export const lessons: LessonDraft[] = [
  written(
    'arsitektur-berlapis',
    'Arsitektur Berlapis & Dependency Injection Sederhana',
    11,
    'Menyusun ketergantungan supaya kodenya bisa diuji tanpa database.',
    [
      p(
        'Bab 3.8 di Backend Basic menyusun folder. Sub-bab ini menyelesaikan bagian yang tertinggal: **bagaimana lapisan itu saling mendapatkan ketergantungannya** — dan kenapa itu menentukan apakah kodemu bisa diuji.',
      ),

      terms(
        {
          term: 'dependency injection',
          meaning:
            'Menerima ketergantungan **dari luar** alih-alih mengimpornya sendiri. Bab 3.8 menyusun folder; sub-bab ini menyelesaikan bagian yang tertinggal: bagaimana lapisan itu saling mendapatkan ketergantungannya — dan kenapa itu menentukan apakah kodemu bisa diuji.',
        },
        {
          term: 'impor langsung mengikat mati',
          meaning:
            'Service yang menulis `import { pool }` **wajib** punya database berjalan untuk bisa diuji. Tesnya jadi lambat, dan jalur gagal database — timeout, koneksi putus — tidak bisa disimulasikan sama sekali.',
        },
        {
          term: 'factory function',
          meaning:
            'Fungsi yang menerima ketergantungan lalu mengembalikan objek berisi metodenya — `buatLayananCatatan({ repo, log })`. Ia bentuk DI paling sederhana di JavaScript: tidak butuh library, tidak butuh dekorator.',
        },
        {
          term: 'composition root',
          meaning:
            '**Satu tempat** yang merakit seluruh objek dan menyambungkan ketergantungannya. Semua `new` dan semua pemanggilan factory hidup di sini; sisa kode hanya menerima apa yang ia butuhkan.',
        },
        {
          term: 'connection pool',
          meaning:
            'Kumpulan koneksi database yang dipakai bergantian, bukan dibuat baru tiap query. Membuka koneksi mahal — pool yang menyimpannya menghemat waktu itu di setiap permintaan.',
        },
        {
          term: 'connectionTimeoutMillis',
          meaning:
            'Batas waktu menunggu koneksi dari pool. **Tanpa timeout, koneksi yang menggantung menghabiskan pool** — dan begitu pool habis, seluruh permintaan tersendat, termasuk yang tidak ada hubungannya.',
        },
        {
          term: 'test double',
          meaning:
            'Pengganti sebuah ketergantungan saat pengujian — objek sederhana yang mengembalikan nilai yang kamu tentukan. Ia yang membuat "apa yang terjadi kalau database gagal?" bisa diuji tanpa mematikan database sungguhan.',
        },
        {
          term: 'deterministik',
          meaning:
            'Tes yang hasilnya **sama setiap kali dijalankan**. Tes yang bergantung pada database sungguhan kehilangan sifat ini: data sisa dari tes lain, waktu, dan urutan eksekusi semuanya bisa mengubah hasilnya.',
        },
        {
          term: 'DI tanpa framework',
          meaning:
            'Di JavaScript, DI tidak butuh container seperti di Laravel — cukup fungsi yang menerima objek. Framework DI baru berbayar saat grafik ketergantungannya besar; untuk kebanyakan API, composition root manual lebih mudah dibaca.',
        },
      ),

      h2('Masalah impor langsung'),
      compare(
        {
          title: 'Terikat mati',
          lang: 'js',
          code: `
          // services/catatan.js
          import { pool } from '../lib/db.js';

          export async function daftar(penggunaId) {
            const { rows } = await pool.query(...);
            return rows;
          }

          // Untuk mengujinya, kamu WAJIB
          // punya database yang berjalan.
          `,
          notes: ['Tes lambat', 'Tidak bisa menguji jalur gagal database'],
        },
        {
          title: 'Ketergantungan dioper',
          lang: 'js',
          code: `
          // services/catatan.js
          export function buatLayananCatatan({ repo, log }) {
            return {
              async daftar(penggunaId) {
                return repo.cariMilikPengguna(penggunaId);
              },
            };
          }

          // Tes cukup mengoper repo palsu.
          `,
          notes: ['Tes cepat dan deterministik', 'Jalur gagal bisa disimulasikan'],
        },
      ),

      h2('Composition root'),
      code(
        'js',
        `
        // src/container.js — SATU tempat yang merakit semuanya
        import { Pool } from 'pg';
        import { env } from './config/env.js';
        import { log } from './lib/log.js';
        import { buatRepoCatatan } from './repositories/catatan.js';
        import { buatLayananCatatan } from './services/catatan.js';

        export function buatContainer() {
          const pool = new Pool({
            connectionString: env.DATABASE_URL,
            max: 10,
            // Batas ini penting: tanpa timeout, koneksi yang menggantung
            // menghabiskan pool dan membuat SELURUH permintaan tersendat.
            connectionTimeoutMillis: 5_000,
            idleTimeoutMillis: 30_000,
          });

          const repoCatatan = buatRepoCatatan({ pool });
          const layananCatatan = buatLayananCatatan({ repo: repoCatatan, log });

          return { pool, layananCatatan, log };
        }
        `,
        { filename: 'src/container.js' },
      ),
      code(
        'js',
        `
        // src/app.js
        export function buatApp(container) {
          const app = express();

          app.use(express.json({ limit: '100kb' }));
          app.use('/api/catatan', buatRouterCatatan(container.layananCatatan));

          return app;
        }

        // src/server.js
        const container = buatContainer();
        const app = buatApp(container);
        app.listen(env.PORT);
        `,
      ),
      callout(
        'tip',
        'Tidak perlu library DI',
        'Fungsi pabrik dan satu berkas perakitan sudah cukup untuk hampir semua project Node. Library DI dengan dekorator dan metadata menambah konsep baru yang harus dipelajari setiap orang yang membaca kodemu — beli hanya kalau ada masalah yang benar-benar ia selesaikan.',
      ),

      h2('Hasilnya di tes'),
      code(
        'js',
        `
        it('hanya mengembalikan catatan milik pengguna', async () => {
          const repoPalsu = {
            cariMilikPengguna: vi.fn().mockResolvedValue([{ id: 1, judul: 'A' }]),
          };

          const layanan = buatLayananCatatan({ repo: repoPalsu, log: logDiam });
          const hasil = await layanan.daftar(42);

          expect(repoPalsu.cariMilikPengguna).toHaveBeenCalledWith(42);
          expect(hasil).toHaveLength(1);
        });

        it('meneruskan kegagalan database sebagai error yang bisa ditangani', async () => {
          const repoPalsu = {
            cariMilikPengguna: vi.fn().mockRejectedValue(new Error('koneksi putus')),
          };

          const layanan = buatLayananCatatan({ repo: repoPalsu, log: logDiam });
          await expect(layanan.daftar(42)).rejects.toThrow('koneksi putus');
        });
        `,
      ),
      p(
        'Tes kedua adalah yang tidak mungkin ditulis tanpa injeksi: mensimulasikan database yang putus dengan koneksi sungguhan itu sulit dan tidak deterministik.',
      ),

      h2('Batas yang tetap berlaku'),
      table(
        ['Lapisan', 'Menerima', 'Tidak boleh tahu'],
        [
          ['Router', 'Layanan', 'SQL, struktur tabel'],
          ['Controller', 'Layanan', 'SQL'],
          ['Service', 'Repository, log, klien luar', '**`req`/`res`, SQL**'],
          ['Repository', 'Pool koneksi', '`req`/`res`, aturan bisnis'],
        ],
      ),
      callout(
        'warning',
        'Jangan berlebihan',
        'Setiap lapisan yang tidak menyerap kerumitan hanya meneruskannya. Kalau sebuah service hanya memanggil satu method repository tanpa menambah aturan apa pun, ia belum layak ada — panggil repository-nya langsung dari controller sampai ada aturan bisnis yang benar-benar muncul.',
      ),
      references(
        {
          label: 'node-postgres — Pooling',
          href: 'https://www.postgresql.org/docs/17/runtime-config-connection.html',
          source: 'PostgreSQL',
          note: 'Batas koneksi di sisi server yang menentukan berapa besar pool aplikasi boleh dibuat.',
        },
        {
          label: 'Vitest — Mocking',
          href: 'https://vitest.dev/guide/mocking',
          source: 'Vitest',
          note: '`vi.fn()` dan `mockResolvedValue` yang dipakai membuat test double di atas.',
        },
        {
          label: 'Modules: ECMAScript modules',
          href: 'https://nodejs.org/api/esm.html',
          source: 'Node.js',
          note: 'Sistem impor yang menjadi batas fisik antar lapisan — dan yang membuat impor langsung mengikat.',
        },
        {
          label: 'Express — Writing middleware',
          href: 'https://expressjs.com/en/guide/writing-middleware.html',
          source: 'Express',
          note: 'Titik tempat container disuntikkan ke jalur permintaan.',
        },
      ),
    ],
  ),

  written('prisma', 'ORM: Prisma', 13, 'Query bertipe dari skema, dan biaya yang menyertainya.', [
    p(
      'Prisma menghasilkan klien bertipe dari satu berkas skema. Keunggulannya nyata: salah ketik nama kolom menjadi error type-check, bukan error runtime. Tapi ia tetap ORM — dan aturan dari Backend Basic tentang N+1 dan biaya query tetap berlaku.',
    ),

    terms(
      {
        term: 'Prisma',
        meaning:
          'ORM yang **menghasilkan klien bertipe** dari satu berkas skema. Keunggulannya nyata: salah ketik nama kolom menjadi error type-check, bukan error runtime. Tapi ia tetap ORM — aturan tentang N+1 dan biaya query dari Backend Basic tetap berlaku.',
      },
      {
        term: 'schema.prisma',
        meaning:
          'Satu berkas yang mendefinisikan model, relasi, dan koneksi database. Ia menjadi **sumber tunggal**: dari sini dihasilkan klien TypeScript, migration SQL, dan tipe yang dipakai seluruh aplikasi.',
      },
      {
        term: 'prisma generate',
        meaning:
          'Perintah yang membaca skema lalu menghasilkan klien bertipe. Harus dijalankan **setiap kali skema berubah** — dan itulah kenapa ia biasanya dipasang sebagai `postinstall`, supaya tidak pernah lupa.',
      },
      {
        term: 'prisma migrate',
        meaning:
          'Menghasilkan berkas SQL migration dari perubahan skema, lalu menjalankannya. Berbeda dari `db push` yang mengubah database langsung tanpa jejak — yang terakhir hanya untuk prototipe, bukan untuk apa pun yang punya riwayat.',
      },
      {
        term: 'include vs select',
        meaning:
          '`include` menambahkan relasi ke hasil default; `select` menentukan **persis** field mana yang diambil. Untuk API, `select` hampir selalu lebih tepat — ia mencegah kolom baru ikut terkirim tanpa keputusan sadar.',
      },
      {
        term: 'N+1 di Prisma',
        meaning:
          'Sama nyatanya seperti di ORM lain. Memanggil relasi di dalam perulangan menghasilkan satu query per item. Obatnya sama: ambil relasinya **di depan** lewat `include`/`select`, bukan satu per satu.',
      },
      {
        term: 'tipe yang diturunkan',
        meaning:
          'Prisma menghasilkan tipe dari **bentuk query-mu**, bukan dari seluruh model. `select: { id: true }` menghasilkan tipe yang **hanya** punya `id` — jadi mengakses field yang tidak diambil jadi error compile, bukan `undefined` saat runtime.',
      },
      {
        term: 'raw query di Prisma',
        meaning:
          'Jalan keluar untuk query yang tidak bisa dinyatakan lewat API-nya. Bentuk `$queryRaw` dengan **tagged template** memparameterkan otomatis; `$queryRawUnsafe` dengan string biasa **tidak** — namanya sudah memberi peringatan.',
      },
      {
        term: 'ORM menyembunyikan query, bukan biayanya',
        meaning:
          'Kalimat yang berlaku untuk setiap ORM. Satu baris Prisma yang terlihat sederhana bisa menghasilkan join berlapis. Biasakan memeriksa SQL yang dihasilkan — Prisma bisa mencetaknya lewat opsi `log`.',
      },
    ),

    h2('Skema'),
    code(
      'text',
      `
        // prisma/schema.prisma
        generator client {
          provider = "prisma-client-js"
        }

        datasource db {
          provider = "postgresql"
          url      = env("DATABASE_URL")
        }

        model Pengguna {
          id            BigInt    @id @default(autoincrement())
          email         String    @unique @db.VarChar(255)
          kataSandiHash String    @map("kata_sandi_hash") @db.VarChar(255)
          nama          String    @db.VarChar(100)
          catatan       Catatan[]
          dibuatPada    DateTime  @default(now()) @map("dibuat_pada")

          @@map("pengguna")
        }

        model Catatan {
          id          BigInt    @id @default(autoincrement())
          judul       String    @db.VarChar(200)
          isi         String    @db.Text
          diarsipkan  Boolean   @default(false)
          penulisId   BigInt    @map("penulis_id")
          penulis     Pengguna  @relation(fields: [penulisId], references: [id], onDelete: Cascade)
          dihapusPada DateTime? @map("dihapus_pada")
          dibuatPada  DateTime  @default(now()) @map("dibuat_pada")

          // Index untuk query yang paling sering dijalankan
          @@index([penulisId, dibuatPada(sort: Desc)])
          @@map("catatan")
        }
        `,
    ),
    callout(
      'tip',
      '`@map` memisahkan penamaan database dari penamaan kode',
      'Database memakai `snake_case` (konvensi SQL), kode memakai `camelCase` (konvensi JavaScript). Tanpa `@map`, kamu terpaksa memilih salah satu dan melanggarnya di sisi lain.',
    ),

    h2('Migrasi'),
    code(
      'bash',
      `
        npx prisma migrate dev --name buat_tabel_catatan   # pengembangan
        npx prisma migrate deploy                          # produksi — tidak interaktif
        npx prisma generate                                # hasilkan ulang klien
        npx prisma studio                                  # penjelajah data
        `,
    ),
    callout(
      'danger',
      'Jangan pernah `migrate dev` di produksi',
      '`migrate dev` boleh **menghapus dan membangun ulang** database saat mendeteksi penyimpangan skema. Ia dirancang untuk laptop. Di produksi hanya `migrate deploy` yang aman — ia hanya menerapkan migrasi yang belum berjalan, dan tidak pernah menghapus apa pun.',
    ),

    h2('Query'),
    code(
      'ts',
      `
        // Baca — semua bertipe, salah ketik ditolak type-check
        const catatan = await prisma.catatan.findMany({
          where: {
            penulisId: penggunaId,
            dihapusPada: null,
            judul: { contains: kueri, mode: 'insensitive' },
          },
          // Sebutkan kolomnya — jangan biarkan kolom baru ikut terkirim ke klien
          select: { id: true, judul: true, dibuatPada: true },
          orderBy: [{ dibuatPada: 'desc' }, { id: 'desc' }],
          take: 20,
          skip: 0,
        });

        // Satu item, dengan otorisasi di query
        const satu = await prisma.catatan.findFirst({
          where: { id, penulisId: penggunaId, dihapusPada: null },
        });

        // Buat
        const baru = await prisma.catatan.create({
          data: { judul, isi, penulisId: penggunaId },
        });

        // Ubah — penulisId di where adalah pertahanan IDOR
        const hasil = await prisma.catatan.updateMany({
          where: { id, penulisId: penggunaId },
          data: { judul },
        });

        if (hasil.count === 0) throw new KesalahanTidakDitemukan('Catatan');
        `,
    ),
    callout(
      'warning',
      'Pakai `updateMany`/`deleteMany` saat butuh scope kepemilikan',
      '`update({ where: { id } })` hanya menerima field unik — kamu **tidak bisa** menambahkan `penulisId` di sana. Memanggilnya berarti mengubah baris siapa pun yang id-nya cocok. `updateMany` menerima syarat bebas, dan `count` yang bernilai 0 memberi tahu bahwa barisnya tidak ada **atau** bukan milik pengguna itu.',
    ),

    h2('`select` vs `include`'),
    code(
      'ts',
      `
        // include: seluruh kolom relasi ikut — termasuk yang sensitif
        const a = await prisma.catatan.findMany({ include: { penulis: true } });
        // -> penulis.kataSandiHash ikut terbawa

        // select: hanya yang kamu sebutkan
        const b = await prisma.catatan.findMany({
          select: {
            id: true,
            judul: true,
            penulis: { select: { id: true, nama: true } },
          },
        });
        `,
    ),
    callout(
      'danger',
      '`include: { penulis: true }` membawa hash password',
      'Ini jalur kebocoran yang sangat mudah terjadi karena kodenya terlihat wajar. Kalau hasilnya langsung dikirim sebagai respons API, seluruh kolom tabel pengguna ikut — termasuk yang tidak pernah dimaksudkan keluar. Biasakan `select`, bukan `include`.',
    ),

    h2('Melihat query yang benar-benar dijalankan'),
    code(
      'ts',
      `
        const prisma = new PrismaClient({
          log: env.isProduksi
            ? ['warn', 'error']
            : [{ emit: 'event', level: 'query' }, 'warn', 'error'],
        });

        if (!env.isProduksi) {
          prisma.$on('query', (e) => {
            log.debug({ query: e.query, durasiMs: e.duration }, 'query');
          });
        }
        `,
    ),

    h2('Kapan turun ke SQL mentah'),
    code(
      'ts',
      `
        // Tagged template -> diparameterkan otomatis. AMAN.
        const hasil = await prisma.$queryRaw\`
          SELECT penulis_id, COUNT(*) AS jumlah
          FROM catatan WHERE dibuat_pada > \${sejak}
          GROUP BY penulis_id
        \`;

        // String biasa -> TIDAK diparameterkan. Namanya sudah memperingatkan.
        await prisma.$queryRawUnsafe(\`SELECT * FROM catatan WHERE id = \${id}\`);
        `,
    ),
    p(
      'Agregasi rumit, CTE, dan window function sering lebih jelas ditulis sebagai SQL. Yang penting: pakai bentuk tagged template, jangan `$queryRawUnsafe`.',
    ),
    references(
      {
        label: 'Prisma — Schema reference',
        href: 'https://www.prisma.io/docs/orm/prisma-schema/overview',
        source: 'Prisma',
        note: 'Bentuk `schema.prisma` yang menjadi sumber tunggal model, migration, dan tipe.',
      },
      {
        label: 'Select fields — select vs include',
        href: 'https://www.prisma.io/docs/orm/prisma-client/queries/select-fields',
        source: 'Prisma',
        note: 'Kenapa `include` membawa seluruh kolom relasi, dan `select` yang tepat untuk API.',
      },
      {
        label: 'Raw queries — $queryRaw',
        href: 'https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries',
        source: 'Prisma',
        note: 'Bentuk tagged template yang memparameterkan otomatis, versus `$queryRawUnsafe`.',
      },
      {
        label: 'SQL Injection Prevention Cheat Sheet',
        href: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
        source: 'OWASP',
        note: 'Alasan ORM bukan jaminan otomatis saat kamu turun ke SQL mentah.',
      },
    ),
  ]),

  written(
    'relasi-query-kompleks',
    'Relasi & Query Kompleks di ORM',
    12,
    'Mengambil data bercabang tanpa membuat ratusan query.',
    [
      terms(
        {
          term: 'query bercabang',
          meaning:
            'Pengambilan data yang menyentuh beberapa tabel sekaligus — artikel beserta penulis, komentar, dan tagnya. Di sinilah ORM paling mudah menghasilkan ratusan query tanpa satu pun tanda di kode.',
        },
        {
          term: '_count',
          meaning:
            'Bentuk Prisma untuk mengambil **jumlah** relasi tanpa memuat isinya. `_count: { select: { komentar: true } }` menghasilkan satu angka — jauh lebih murah daripada memuat seluruh komentar hanya untuk menghitungnya.',
        },
        {
          term: 'some',
          meaning:
            'Filter relasi yang berarti "punya **minimal satu** yang cocok". `komentar: { some: { penulisId: 42 } }` mencari catatan yang punya minimal satu komentar dari pengguna itu.',
        },
        {
          term: 'every',
          meaning:
            'Filter relasi yang berarti "**semua** yang cocok". Jebakannya besar: catatan **tanpa komentar sama sekali** ikut lolos, karena "semua dari nol elemen" bernilai benar secara logika. Gabungkan dengan `some: {}` kalau itu bukan yang kamu mau.',
        },
        {
          term: 'none',
          meaning:
            'Filter relasi yang berarti "**tidak punya** yang cocok". `komentar: { none: {} }` mencari catatan tanpa komentar sama sekali — bentuk yang jauh lebih jelas daripada `NOT EXISTS` yang ditulis tangan.',
        },
        {
          term: 'nested write',
          meaning:
            'Membuat atau mengubah beberapa tabel dalam **satu pemanggilan**. Prisma membungkusnya dalam **satu transaksi otomatis** — jadi kalau salah satu bagian gagal, tidak ada yang setengah tersimpan.',
        },
        {
          term: 'connectOrCreate',
          meaning:
            'Pola nested write yang berarti "pakai baris yang sudah ada, buat kalau belum". Ia menggantikan urutan "cari dulu, lalu putuskan" yang punya celah balapan di antaranya.',
        },
        {
          term: 'query yang terlalu pintar',
          meaning:
            'Batas kapan berhenti memakai API ORM. Agregasi berlapis, CTE, dan window function sering **lebih jelas** ditulis sebagai SQL. Memaksakannya lewat ORM menghasilkan kode yang benar tapi tidak bisa dibaca siapa pun.',
        },
        {
          term: 'ukur, jangan tebak',
          meaning:
            'Nyalakan log query saat pengembangan dan **hitung berapa query** yang benar-benar dijalankan satu halaman. Angka itu yang menemukan N+1 — bukan membaca kode dan merasa yakin tidak ada perulangan.',
        },
      ),

      h2('N+1 di Prisma'),
      compare(
        {
          title: 'N+1',
          lang: 'ts',
          code: `
          const catatan = await prisma.catatan.findMany();

          for (const c of catatan) {
            const penulis = await prisma.pengguna.findUnique({
              where: { id: c.penulisId },
            });
            console.log(penulis.nama);
          }

          // 100 catatan -> 101 query
          `,
          notes: ['Tidak terlihat di kode', 'Cepat dengan data uji, lambat di produksi'],
        },
        {
          title: 'Satu perjalanan',
          lang: 'ts',
          code: `
          const catatan = await prisma.catatan.findMany({
            select: {
              id: true,
              judul: true,
              penulis: {
                select: { id: true, nama: true },
              },
            },
          });

          // 2 query, berapa pun jumlah barisnya
          `,
          notes: ['Prisma menggabungkan sendiri'],
        },
      ),

      h2('Menghitung tanpa memuat'),
      code(
        'ts',
        `
        const catatan = await prisma.catatan.findMany({
          select: {
            id: true,
            judul: true,
            // Hanya jumlahnya — komentar tidak ikut dimuat
            _count: { select: { komentar: true } },
          },
        });

        catatan[0]._count.komentar;   // angka
        `,
      ),

      h2('Filter lewat relasi'),
      code(
        'ts',
        `
        // Catatan yang punya minimal satu komentar dari pengguna tertentu
        await prisma.catatan.findMany({
          where: { komentar: { some: { penulisId: 42 } } },
        });

        // Catatan yang SEMUA komentarnya sudah disetujui
        await prisma.catatan.findMany({
          where: { komentar: { every: { disetujui: true } } },
        });

        // Catatan tanpa komentar sama sekali
        await prisma.catatan.findMany({
          where: { komentar: { none: {} } },
        });
        `,
      ),
      callout(
        'warning',
        '`every` juga cocok untuk daftar kosong',
        'Catatan **tanpa komentar sama sekali** akan lolos `every: { disetujui: true }`, karena secara logika "semua dari nol elemen" bernilai benar. Kalau kamu tidak menginginkannya, gabungkan dengan `komentar: { some: {} }`. Ini jebakan yang menghasilkan hasil terlalu banyak tanpa error apa pun.',
      ),

      h2('Nested write dalam satu transaksi'),
      code(
        'ts',
        `
        // Prisma membungkus nested write dalam satu transaksi otomatis.
        const artikel = await prisma.artikel.create({
          data: {
            judul,
            isi,
            penulisId: penggunaId,
            tag: {
              // Pakai tag yang ada, buat kalau belum ada
              connectOrCreate: namaTag.map((nama) => ({
                where: { nama },
                create: { nama, slug: slugify(nama) },
              })),
            },
          },
          select: { id: true, judul: true, tag: { select: { nama: true } } },
        });
        `,
      ),

      h2('Paginasi cursor'),
      code(
        'ts',
        `
        const halaman = await prisma.catatan.findMany({
          where: { penulisId: penggunaId, dihapusPada: null },
          orderBy: [{ dibuatPada: 'desc' }, { id: 'desc' }],
          take: 20,
          // Lewati item cursor-nya sendiri
          ...(cursor !== undefined && { cursor: { id: cursor }, skip: 1 }),
        });
        `,
      ),

      h2('Agregasi'),
      code(
        'ts',
        `
        const ringkasan = await prisma.catatan.aggregate({
          where: { penulisId: penggunaId },
          _count: { _all: true },
          _max: { dibuatPada: true },
        });

        const perPenulis = await prisma.catatan.groupBy({
          by: ['penulisId'],
          where: { dihapusPada: null },
          _count: { _all: true },
          having: { penulisId: { _count: { gt: 5 } } },
        });
        `,
      ),

      h2('Menegakkan larangan N+1 dengan tes'),
      code(
        'ts',
        `
        it('tidak menjalankan query per baris', async () => {
          const jumlahQuery = { n: 0 };
          prisma.$on('query', () => { jumlahQuery.n += 1; });

          await buatCatatan({ jumlah: 50, penulisId: ana.id });

          jumlahQuery.n = 0;
          await request(app).get('/api/catatan').set('Authorization', bearer(ana));

          // Harus tetap kecil — tidak tumbuh mengikuti jumlah baris
          expect(jumlahQuery.n).toBeLessThan(6);
        });
        `,
      ),
      callout(
        'tip',
        'Ini satu-satunya cara N+1 tidak kembali',
        'N+1 tidak menimbulkan error dan tidak terlihat saat membaca kode. Ia muncul berbulan-bulan kemudian sebagai "aplikasinya makin lambat". Tes yang menghitung query membuatnya gagal **saat ditambahkan**, bukan saat sudah mahal.',
      ),
      references(
        {
          label: 'Prisma — Relation queries',
          href: 'https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries',
          source: 'Prisma',
          note: 'Filter relasi `some`, `every`, `none`, beserta nested write dan transaksinya.',
        },
        {
          label: 'Prisma — Aggregation, grouping & summarizing',
          href: 'https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing',
          source: 'Prisma',
          note: '`aggregate`, `groupBy`, dan `_count` yang dipakai contoh di atas.',
        },
        {
          label: 'Prisma — Pagination',
          href: 'https://www.prisma.io/docs/orm/prisma-client/queries/pagination',
          source: 'Prisma',
          note: 'Bentuk cursor beserta `skip: 1` yang melewati item cursor-nya sendiri.',
        },
        {
          label: 'Using EXPLAIN',
          href: 'https://www.postgresql.org/docs/17/using-explain.html',
          source: 'PostgreSQL',
          note: 'Memeriksa rencana eksekusi SQL yang benar-benar dihasilkan ORM.',
        },
      ),
    ],
  ),

  written(
    'transaksi-orm',
    'Transaksi Database',
    11,
    'Beberapa perubahan yang berhasil bersama atau tidak sama sekali.',
    [
      terms(
        {
          term: 'transaksi berurutan (array)',
          meaning:
            'Bentuk `$transaction([...])` — beberapa operasi yang dijalankan **berurutan dalam satu transaksi**. Cocok saat operasinya tidak saling bergantung dan tidak butuh nilai dari operasi sebelumnya.',
        },
        {
          term: 'transaksi interaktif',
          meaning:
            'Bentuk `$transaction(async (tx) => {...})` — kamu bisa **membaca hasil** satu operasi lalu memutuskan operasi berikutnya. Diperlukan saat ada percabangan, tapi ia menahan koneksi lebih lama.',
        },
        {
          term: 'tx',
          meaning:
            'Klien khusus di dalam transaksi interaktif. **Harus dipakai** untuk seluruh query di dalamnya — memanggil `prisma.` yang biasa akan berjalan **di luar** transaksi, dan tidak ikut dibatalkan saat gagal.',
        },
        {
          term: 'rollback lewat throw',
          meaning:
            'Cara membatalkan transaksi di Prisma: **melempar error**. Tidak ada `rollback()` eksplisit — begitu fungsi callback melempar, seluruh transaksi dibatalkan otomatis.',
        },
        {
          term: 'maxWait',
          meaning:
            'Berapa lama transaksi boleh **menunggu koneksi** dari pool sebelum menyerah. Tanpa batas ini, lonjakan trafik membuat permintaan menumpuk menunggu koneksi yang tidak kunjung tersedia.',
        },
        {
          term: 'timeout transaksi',
          meaning:
            'Berapa lama transaksi boleh **berjalan** sebelum dibatalkan paksa. Ia jaring pengaman terhadap transaksi yang macet — yang menahan kunci dan menghambat semua penulis lain ke baris yang sama.',
        },
        {
          term: 'decrement dengan syarat',
          meaning:
            'Pola `updateMany({ where: { stok: { gte: jumlah } }, data: { stok: { decrement: jumlah } } })`. Pengurangan dan pemeriksaan terjadi **dalam satu operasi atomik** — tidak ada celah untuk diselipi permintaan lain di antaranya.',
        },
        {
          term: 'count === 0 sebagai sinyal',
          meaning:
            'Karena `updateMany` mengembalikan jumlah baris terpengaruh, nilai **nol** berarti syaratnya tidak terpenuhi — stok habis, atau barisnya bukan milik pengguna itu. Memeriksanya adalah bagian dari logika, bukan kehati-hatian tambahan.',
        },
        {
          term: 'jangan panggil jaringan di dalam transaksi',
          meaning:
            'Aturan yang sama seperti di Backend Basic. Panggilan ke layanan luar **tidak boleh** berada di dalam transaksi: kamu tidak mengendalikan berapa lama jawabannya datang, dan selama itu kunci database tertahan.',
        },
      ),

      h2('Transaksi berurutan'),
      code(
        'ts',
        `
        // Array: semua dijalankan dalam satu transaksi, berurutan
        const [pesanan, stok] = await prisma.$transaction([
          prisma.pesanan.create({ data: { pelangganId, total } }),
          prisma.produk.update({ where: { id }, data: { stok: { decrement: 1 } } }),
        ]);
        `,
      ),

      h2('Transaksi interaktif'),
      code(
        'ts',
        `
        const pesanan = await prisma.$transaction(async (tx) => {
          const pesanan = await tx.pesanan.create({
            data: { pelangganId, status: 'menunggu' },
          });

          for (const item of items) {
            // Kurangi stok DAN pastikan tidak minus, dalam satu operasi.
            const hasil = await tx.produk.updateMany({
              where: { id: item.produkId, stok: { gte: item.jumlah } },
              data: { stok: { decrement: item.jumlah } },
            });

            if (hasil.count === 0) {
              // Melempar -> seluruh transaksi dibatalkan otomatis.
              throw new KesalahanStokHabis(item.produkId);
            }

            await tx.pesananItem.create({
              data: {
                pesananId: pesanan.id,
                produkId: item.produkId,
                jumlah: item.jumlah,
                hargaSaatBeli: item.harga,
              },
            });
          }

          return pesanan;
        }, {
          maxWait: 5_000,    // berapa lama menunggu koneksi dari pool
          timeout: 10_000,   // berapa lama transaksi boleh berjalan
        });
        `,
      ),
      callout(
        'danger',
        'Pakai `tx`, bukan `prisma`, di dalam blok transaksi',
        'Memanggil `prisma.sesuatu()` di dalam callback transaksi memakai koneksi **berbeda** — operasi itu tidak ikut dalam transaksi, dan tidak akan dibatalkan saat rollback. Kodenya terlihat benar dan bekerja normal sampai suatu hari ada rollback yang menyisakan setengah perubahan.',
      ),

      h2('Jaga transaksi tetap pendek'),
      compare(
        {
          title: 'Berbahaya',
          lang: 'ts',
          code: `
          await prisma.$transaction(async (tx) => {
            const p = await tx.pesanan.create({ ... });

            // Panggilan jaringan DI DALAM transaksi
            await kirimEmail(pelanggan.email);
            await panggilApiPembayaran(p);

            await tx.pesanan.update({ ... });
          });
          `,
          notes: [
            'Baris terkunci selama panggilan jaringan',
            'Timeout pihak ketiga = transaksi gagal',
          ],
        },
        {
          title: 'Benar',
          lang: 'ts',
          code: `
          const p = await prisma.$transaction(async (tx) => {
            const p = await tx.pesanan.create({ ... });
            await tx.produk.updateMany({ ... });
            return p;
          });

          // Efek samping SETELAH commit,
          // sebaiknya lewat antrean.
          await antrean.tambah('kirim-email', { pesananId: p.id });
          `,
          notes: ['Transaksi hanya menyentuh database'],
        },
      ),

      h2('Menangani balapan'),
      code(
        'ts',
        `
        // Optimistic locking: versi ikut di WHERE
        const hasil = await prisma.artikel.updateMany({
          where: { id, versi: versiYangDibaca },
          data: { judul, versi: { increment: 1 } },
        });

        if (hasil.count === 0) {
          // Orang lain sudah mengubahnya sejak kamu membacanya.
          throw new KesalahanKonflik('Artikel sudah diubah orang lain');
        }
        `,
      ),
      p(
        'Ini yang mencegah **lost update**: dua editor membuka artikel yang sama, dan yang menyimpan belakangan menimpa perubahan yang pertama tanpa jejak. Sisi HTTP-nya adalah `If-Match` + `412` dari Bab 1.8.',
      ),

      h2('Kesalahan yang perlu ditangani khusus'),
      code(
        'ts',
        `
        import { Prisma } from '@prisma/client';

        try {
          await prisma.pengguna.create({ data: { email, ... } });
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
              // Pelanggaran unique. JANGAN teruskan err.message —
              // ia memuat nama constraint dan kolomnya.
              throw new KesalahanKonflik('Data sudah ada');
            }
            if (err.code === 'P2025') throw new KesalahanTidakDitemukan();
          }
          throw err;
        }
        `,
      ),
      callout(
        'warning',
        'Pesan error ORM membocorkan struktur database',
        '`Unique constraint failed on the fields: (email)` menyebutkan nama kolom; error Postgres mentah menyebutkan nama constraint. Keduanya memberi peta kepada penyerang. Terjemahkan menjadi kode error milikmu sendiri sebelum dikirim ke klien.',
      ),
      references(
        {
          label: 'Prisma — Transactions and batch queries',
          href: 'https://www.prisma.io/docs/orm/prisma-client/queries/transactions',
          source: 'Prisma',
          note: 'Bentuk array dan interaktif, beserta opsi `maxWait` dan `timeout`.',
        },
        {
          label: 'Prisma — Error reference',
          href: 'https://www.prisma.io/docs/orm/reference/error-reference',
          source: 'Prisma',
          note: 'Arti kode `P2002`, `P2025`, dan kode lain yang perlu ditangani khusus.',
        },
        {
          label: 'Transaction Isolation',
          href: 'https://www.postgresql.org/docs/17/transaction-iso.html',
          source: 'PostgreSQL',
          note: 'Tingkat isolasi yang menentukan anomali mana yang masih mungkin terjadi.',
        },
        {
          label: 'Explicit Locking',
          href: 'https://www.postgresql.org/docs/17/explicit-locking.html',
          source: 'PostgreSQL',
          note: 'Alternatif optimistic locking saat bentroknya sering, bukan sesekali.',
        },
      ),
    ],
  ),

  written(
    'auth-produksi',
    'Autentikasi Produksi: JWT + refresh + pencabutan',
    13,
    'Merangkai seluruh potongan auth menjadi sistem yang bisa dicabut.',
    [
      p(
        'Bab 5 Backend Basic menjelaskan tiap potongan. Sub-bab ini merangkainya menjadi sistem utuh — termasuk bagian yang paling sering ditinggalkan: **pencabutan yang benar-benar bekerja**.',
      ),

      terms(
        {
          term: 'pencabutan yang bekerja',
          meaning:
            'Bagian auth yang **paling sering ditinggalkan**. Bab 5 Backend Basic menjelaskan tiap potongan; yang ini merangkainya — dan pencabutan adalah tempat rangkaian itu biasanya putus.',
        },
        {
          term: 'keluarga token',
          meaning:
            'Satu rantai refresh token yang berasal dari **satu login**. Semua rotasi berikutnya mewarisi `keluargaId` yang sama — sehingga saat pencurian terdeteksi, seluruh rantai bisa dicabut sekaligus.',
        },
        {
          term: 'simpan hash token',
          meaning:
            'Refresh token disimpan sebagai **hash**, bukan apa adanya — alasan yang sama persis dengan password. Kalau tabel sesi bocor, isinya tidak bisa langsung dipakai. SHA-256 cukup di sini karena tokennya sudah acak panjang.',
        },
        {
          term: 'access token pendek',
          meaning:
            'Umur 5–15 menit. Ia yang membatasi kerusakan: token yang dicuri hanya berguna sebentar, dan tidak perlu mekanisme pencabutan sendiri karena ia kedaluwarsa lebih cepat daripada kamu sempat bereaksi.',
        },
        {
          term: 'rotasi + deteksi pemakaian ulang',
          meaning:
            'Inti keamanan alur ini. Refresh token hanya sah **sekali**; kalau yang sudah dicabut muncul lagi, itu berarti **dicuri dan diputar ulang** — dan seluruh keluarganya dicabut.',
        },
        {
          term: 'token_version',
          meaning:
            'Kolom angka di tabel pengguna yang dinaikkan saat logout global, ganti password, atau perubahan izin. Access token yang membawa versi lebih rendah ditolak — pencabutan **massal** tanpa deny-list per token.',
        },
        {
          term: 'onDelete: Cascade pada sesi',
          meaning:
            'Menghapus pengguna otomatis menghapus seluruh sesinya. Di sini `CASCADE` justru **tepat** — berbeda dari artikel atau pesanan, sesi memang tidak punya arti tanpa pemiliknya.',
        },
        {
          term: 'cookie untuk refresh, header untuk access',
          meaning:
            'Pembagian yang disengaja. Refresh token di cookie `HttpOnly` ber-`path` sempit — tidak bisa dibaca JavaScript dan tidak ikut di setiap permintaan. Access token di header `Authorization` — tidak ikut otomatis, jadi tidak rawan CSRF.',
        },
        {
          term: 'logout global',
          meaning:
            'Mencabut **seluruh** sesi seorang pengguna sekaligus, bukan hanya yang di perangkat itu. Diperlukan saat akun dicurigai dibajak — dan itulah situasi ketika pengguna paling membutuhkannya bekerja.',
        },
      ),

      h2('Skema penyimpanan'),
      code(
        'text',
        `
        model SesiRefresh {
          id             String   @id @default(uuid())
          // HASH tokennya, bukan tokennya. Sama alasannya dengan password.
          tokenHash      String   @unique @map("token_hash")
          // Satu rantai token yang berasal dari satu login
          keluargaId     String   @map("keluarga_id")
          penggunaId     BigInt   @map("pengguna_id")
          pengguna       Pengguna @relation(fields: [penggunaId], references: [id], onDelete: Cascade)

          userAgent      String?  @map("user_agent") @db.VarChar(255)
          ip             String?  @db.VarChar(45)

          dicabutPada    DateTime? @map("dicabut_pada")
          kedaluwarsaPada DateTime @map("kedaluwarsa_pada")
          dibuatPada     DateTime @default(now()) @map("dibuat_pada")

          @@index([penggunaId])
          @@index([keluargaId])
          @@index([kedaluwarsaPada])
          @@map("sesi_refresh")
        }
        `,
      ),

      h2('Menerbitkan pasangan token'),
      code(
        'ts',
        `
        const UMUR_AKSES = 15 * 60;                  // 15 menit
        const UMUR_REFRESH = 30 * 24 * 60 * 60;      // 30 hari

        async function terbitkanPasangan(pengguna, keluargaId = crypto.randomUUID(), req) {
          const akses = jwt.sign(
            { sub: String(pengguna.id), peran: pengguna.peran, ver: pengguna.tokenVersi },
            env.JWT_SECRET,
            { expiresIn: UMUR_AKSES, issuer: 'api', audience: 'web', algorithm: 'HS256' },
          );

          const refresh = crypto.randomBytes(32).toString('base64url');

          await prisma.sesiRefresh.create({
            data: {
              tokenHash: sha256(refresh),
              keluargaId,
              penggunaId: pengguna.id,
              userAgent: req.headers['user-agent']?.slice(0, 255),
              ip: req.ip,
              kedaluwarsaPada: new Date(Date.now() + UMUR_REFRESH * 1000),
            },
          });

          return { akses, refresh };
        }
        `,
      ),

      h2('Verifikasi dengan pencabutan yang murah'),
      code(
        'ts',
        `
        export async function autentikasi(req, res, next) {
          const header = req.headers.authorization;

          if (header === undefined || !header.startsWith('Bearer ')) {
            return res.status(401).json({ error: { kode: 'TIDAK_TERAUTENTIKASI' } });
          }

          try {
            const payload = jwt.verify(header.slice(7), env.JWT_SECRET, {
              algorithms: ['HS256'],     // WAJIB — cegah algorithm confusion
              issuer: 'api',
              audience: 'web',
            });

            // tokenVersi dinaikkan saat logout-semua, ganti password,
            // atau perubahan peran. Satu pembacaan kecil yang di-cache.
            const versiSekarang = await cacheVersiToken.ambil(payload.sub);

            if (payload.ver !== versiSekarang) {
              return res.status(401).json({ error: { kode: 'TOKEN_DICABUT' } });
            }

            req.pengguna = { id: BigInt(payload.sub), peran: payload.peran };
            next();
          } catch {
            // Pesan generik — jangan bedakan kedaluwarsa, tanda tangan salah,
            // atau format salah. Semua itu informasi bagi penyerang.
            return res.status(401).json({ error: { kode: 'TIDAK_TERAUTENTIKASI' } });
          }
        }
        `,
      ),
      callout(
        'tip',
        '`tokenVersi` adalah pencabutan termurah untuk JWT',
        'Deny-list menyimpan setiap token yang dicabut dan tumbuh tanpa batas. Satu integer per pengguna, di-cache di Redis, memberi pencabutan seketika untuk **semua** token pengguna itu dengan satu operasi `increment`. Yang tidak bisa ia lakukan: mencabut satu perangkat saja — untuk itu pakai tabel sesi refresh.',
      ),

      h2('Rotasi dengan deteksi pemakaian ulang'),
      code(
        'ts',
        `
        export async function refresh(req, res) {
          const token = req.cookies.refresh;
          if (typeof token !== 'string') return tolak(res);

          const sesi = await prisma.sesiRefresh.findUnique({
            where: { tokenHash: sha256(token) },
            include: { pengguna: true },
          });

          if (sesi === null) return tolak(res);

          // INTI POLANYA: token yang sudah dicabut muncul lagi = ia dicuri.
          if (sesi.dicabutPada !== null) {
            await prisma.sesiRefresh.updateMany({
              where: { keluargaId: sesi.keluargaId, dicabutPada: null },
              data: { dicabutPada: new Date() },
            });

            log.warn(
              { penggunaId: String(sesi.penggunaId), keluargaId: sesi.keluargaId, ip: req.ip },
              'refresh token dipakai ulang — seluruh keluarga dicabut',
            );
            return tolak(res);
          }

          if (sesi.kedaluwarsaPada < new Date()) return tolak(res);

          // Rotasi: cabut yang lama, terbitkan yang baru dalam satu transaksi.
          const pasangan = await prisma.$transaction(async (tx) => {
            await tx.sesiRefresh.update({
              where: { id: sesi.id },
              data: { dicabutPada: new Date() },
            });
            return terbitkanPasangan(sesi.pengguna, sesi.keluargaId, req);
          });

          setCookieRefresh(res, pasangan.refresh);
          res.json({ data: { accessToken: pasangan.akses, kedaluwarsaDalam: UMUR_AKSES } });
        }
        `,
      ),

      h2('Cookie refresh'),
      code(
        'ts',
        `
        function setCookieRefresh(res, token) {
          res.cookie('refresh', token, {
            httpOnly: true,
            secure: env.isProduksi,
            sameSite: 'strict',
            // Dikirim HANYA ke endpoint refresh — tidak ikut di ratusan
            // permintaan API biasa, jadi peluang bocornya jauh lebih kecil.
            path: '/api/auth/refresh',
            maxAge: UMUR_REFRESH * 1000,
          });
        }
        `,
      ),

      h2('Yang wajib mencabut'),
      table(
        ['Peristiwa', 'Yang dicabut'],
        [
          ['Keluar dari perangkat ini', 'Satu sesi refresh'],
          ['Keluar dari semua perangkat', 'Semua sesi + naikkan `tokenVersi`'],
          ['Ganti password', '**Semua** + naikkan `tokenVersi`'],
          ['Perubahan peran/izin', 'Naikkan `tokenVersi`'],
          ['Akun dinonaktifkan', 'Semua + naikkan `tokenVersi`'],
          ['Terdeteksi pemakaian ulang', 'Seluruh keluarga token'],
        ],
      ),
      callout(
        'danger',
        'Ganti password yang tidak mencabut sesi lain hampir tidak berguna',
        'Alasan utama orang mengganti password adalah kecurigaan akun dibajak. Kalau sesi penyerang tetap aktif setelahnya, tindakan itu tidak mengubah apa pun bagi penyerang — sementara korban mengira dirinya sudah aman.',
      ),

      h2('Bersihkan token kedaluwarsa'),
      code(
        'ts',
        `
        // Job harian — tabel ini tumbuh terus kalau tidak dibersihkan.
        await prisma.sesiRefresh.deleteMany({
          where: { kedaluwarsaPada: { lt: new Date(Date.now() - 7 * 24 * 3600_000) } },
        });
        `,
      ),
      references(
        {
          label: 'RFC 8725 — JWT Best Current Practices',
          href: 'https://www.rfc-editor.org/rfc/rfc8725.html',
          source: 'IETF',
          note: 'Allow-list algoritma, verifikasi `iss`/`aud`, dan umur token yang dianjurkan.',
        },
        {
          label: 'OAuth 2.0 Security BCP — refresh token rotation',
          href: 'https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics',
          source: 'IETF',
          note: 'Rotasi beserta deteksi pemakaian ulang, langsung dari sumbernya.',
        },
        {
          label: 'Session Management Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Daftar peristiwa yang wajib mencabut sesi — termasuk ganti password.',
        },
        {
          label: 'Set-Cookie — path & SameSite',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie',
          source: 'MDN Web Docs',
          note: 'Atribut yang membuat cookie refresh hanya terkirim ke endpoint refresh.',
        },
      ),
    ],
  ),

  written(
    'middleware-keamanan',
    'Middleware Keamanan: helmet, CORS, rate limit',
    12,
    'Lapisan yang dipasang sekali dan melindungi setiap rute.',
    [
      terms(
        {
          term: 'urutan middleware keamanan',
          meaning:
            'Bukan selera — **ia menentukan apa yang terlindungi**. Header keamanan yang dipasang setelah rute tidak berlaku untuk rute itu; rate limit setelah handler tidak menahan apa pun. Urutan adalah bagian dari konfigurasinya.',
        },
        {
          term: 'trust proxy angka',
          meaning:
            'Rate limiter memakai IP klien yang dibaca dari `X-Forwarded-For`. Dengan **`true`**, Express mempercayai **seluruh rantai** — dan header itu bisa dipalsukan siapa pun. Penyerang cukup mengirim IP acak tiap permintaan untuk melewati rate limit sepenuhnya.',
        },
        {
          term: 'helmet',
          meaning:
            'Middleware yang memasang sekumpulan header keamanan sekaligus. Ia tidak menutup celah apa pun sendirian — yang ia lakukan adalah **memperkecil ledakan** ketika celah lain lolos.',
        },
        {
          term: 'Content-Security-Policy',
          meaning:
            'Header yang membatasi **dari mana** skrip, gaya, dan gambar boleh dimuat. Ia lapisan kedua terhadap XSS: bukan pengganti escaping, melainkan penahan kalau escaping terlewat di suatu tempat.',
        },
        {
          term: 'HSTS',
          meaning:
            'Singkatan *HTTP Strict Transport Security*. Ia memberitahu browser "situs ini **selalu** HTTPS, jangan pernah coba HTTP lagi" — menutup celah sesaat pada kunjungan pertama sebelum pengalihan terjadi.',
        },
        {
          term: 'CORS bukan kontrol akses',
          meaning:
            'Penegasan yang harus dipegang. CORS adalah **kontrol browser** — ia tidak menghalangi `curl`, skrip, maupun aplikasi mobile. Otorisasi tetap sepenuhnya di server; CORS hanya mengatur origin mana yang boleh membaca hasilnya dari halaman lain.',
        },
        {
          term: 'origin: true',
          meaning:
            'Kesalahan CORS yang paling berbahaya: ia **memantulkan origin apa pun** kembali — sama saja dengan tidak punya kebijakan. Ia sering muncul sebagai "perbaikan" setelah `origin: \'*\'` bersama `credentials: true` ditolak browser.',
        },
        {
          term: 'rate limit berjenjang',
          meaning:
            'Batas yang berbeda per kelompok endpoint: umum longgar, auth ketat, endpoint mahal paling ketat. Satu batas untuk semuanya selalu salah di salah satu ujung — terlalu longgar untuk login, atau terlalu ketat untuk pembacaan biasa.',
        },
        {
          term: 'store rate limit di Redis',
          meaning:
            'Penyimpanan hitungan di **memori proses tidak bekerja** dengan banyak proses — masing-masing punya hitungannya sendiri, jadi batas efektifnya berlipat sebanyak jumlah prosesnya. Redis membuat hitungannya bersama.',
        },
      ),

      h2('Urutan pemasangan'),
      code(
        'js',
        `
        // Urutannya bukan selera — ia menentukan apa yang terlindungi.
        app.set('trust proxy', 1);          // 1. berapa proxy yang dipercaya
        app.use(helmet());                  // 2. header keamanan
        app.use(cors(opsiCors));            // 3. origin yang diizinkan
        app.use(express.json({ limit: '100kb' }));   // 4. batas ukuran body
        app.use(pencatatPermintaan);        // 5. id korelasi & log
        app.use('/api', batasUmum);         // 6. rate limit
        app.use('/api/auth', batasAuth);    // 7. rate limit lebih ketat
        // ... rute ...
        app.use(penanganError);             // terakhir, selalu
        `,
      ),
      callout(
        'danger',
        '`trust proxy` harus angka, jangan `true`',
        'Rate limiter memakai IP klien, yang dibaca dari `X-Forwarded-For`. Dengan `true`, Express mempercayai **seluruh rantai** header itu — dan header itu bisa dipalsukan siapa pun. Penyerang cukup mengirim IP acak di setiap permintaan untuk melewati rate limit sepenuhnya. Angka `1` berarti hanya mempercayai satu proxy terdekat.',
      ),

      h2('Helmet'),
      code(
        'js',
        `
        app.use(helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameAncestors: ["'self'"],
              upgradeInsecureRequests: [],
            },
          },
          hsts: { maxAge: 31_536_000, includeSubDomains: true, preload: true },
          referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        }));

        // Jangan umumkan teknologi dan versinya
        app.disable('x-powered-by');
        `,
      ),
      table(
        ['Header', 'Melindungi dari'],
        [
          ['`Content-Security-Policy`', 'XSS — membatasi sumber skrip yang boleh berjalan'],
          ['`Strict-Transport-Security`', 'Penurunan ke HTTP tanpa enkripsi'],
          ['`X-Content-Type-Options`', 'Browser menebak tipe berkas dan mengeksekusinya'],
          ['`Referrer-Policy`', 'Kebocoran URL lengkap ke situs lain'],
          ['`X-Frame-Options`', 'Clickjacking'],
        ],
      ),

      h2('CORS'),
      code(
        'js',
        `
        const ORIGIN_DIIZINKAN = env.corsOrigins;   // dari environment, per lingkungan

        app.use(cors({
          origin(origin, callback) {
            // Permintaan tanpa origin (curl, server-to-server) — putuskan sadar.
            if (origin === undefined) return callback(null, true);

            // Cocokkan PERSIS. Jangan pernah memantulkan origin apa pun kembali.
            if (ORIGIN_DIIZINKAN.includes(origin)) return callback(null, true);

            callback(new Error('Origin tidak diizinkan'));
          },
          credentials: true,
          methods: ['GET', 'POST', 'PATCH', 'DELETE'],
          allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
          maxAge: 86_400,
        }));
        `,
      ),
      callout(
        'danger',
        'Tiga kesalahan CORS yang membatalkan seluruh perlindungannya',
        '**(1)** `origin: true` memantulkan origin apa pun kembali — sama saja tanpa kebijakan. **(2)** `origin: \'*\'` bersama `credentials: true` ditolak browser, dan sering "diperbaiki" dengan cara pertama. **(3)** `localhost` yang tertinggal di daftar produksi. Ingat juga: **CORS adalah kontrol browser** — ia tidak menghalangi `curl`, jadi otorisasi tetap di server.',
      ),

      h2('Rate limit berjenjang'),
      code(
        'js',
        `
        import rateLimit from 'express-rate-limit';
        import RedisStore from 'rate-limit-redis';

        const buatBatas = (opsi) => rateLimit({
          // Penyimpanan di memori TIDAK bekerja dengan banyak proses —
          // masing-masing punya hitungannya sendiri.
          store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
          standardHeaders: 'draft-7',
          legacyHeaders: false,
          ...opsi,
        });

        const batasUmum = buatBatas({ windowMs: 60_000, limit: 100 });

        const batasAuth = buatBatas({
          windowMs: 15 * 60_000,
          limit: 10,
          skipSuccessfulRequests: true,   // hanya hitung yang GAGAL
        });

        const batasMahal = buatBatas({ windowMs: 60_000, limit: 5 });

        app.use('/api', batasUmum);
        app.use('/api/auth', batasAuth);
        app.use('/api/ekspor', batasMahal);
        `,
      ),
      callout(
        'warning',
        'Rate limit per IP saja tidak cukup untuk login',
        'Botnet terdistribusi memakai ribuan IP, masing-masing hanya beberapa percobaan — jauh di bawah ambang per-IP. Yang menangkapnya adalah hitungan **per akun**. Keduanya harus ada, dan keduanya memakai backoff, bukan penguncian polos yang justru bisa dipakai mengunci akun korban.',
      ),

      h2('Batas ukuran di setiap jalur'),
      code(
        'js',
        `
        app.use(express.json({ limit: '100kb' }));
        app.use(express.urlencoded({ extended: true, limit: '100kb' }));
        // Unggahan berkas punya batasnya sendiri — lihat sub-bab 2.7.
        `,
      ),

      h2('Verifikasi, jangan berasumsi'),
      code(
        'bash',
        `
        curl -sI https://api.contoh.com/health | grep -iE \\
          "content-security-policy|strict-transport|x-content-type|referrer-policy"

        # Origin yang tidak diizinkan harus DITOLAK, bukan dipantulkan
        curl -sI -H "Origin: https://jahat.com" https://api.contoh.com/api/catatan \\
          | grep -i "access-control-allow-origin"
        `,
      ),
      p(
        'Konfigurasi yang benar tapi tidak diterapkan adalah kegagalan yang paling mudah terlewat. Periksa header pada server yang **benar-benar berjalan**, bukan dengan membaca berkas konfigurasi.',
      ),
      references(
        {
          label: 'Express — Production Best Practices: Security',
          href: 'https://expressjs.com/en/advanced/best-practice-security.html',
          source: 'Express',
          note: 'Anjuran resmi termasuk `trust proxy`, helmet, dan mematikan `x-powered-by`.',
        },
        {
          label: 'Content-Security-Policy',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy',
          source: 'MDN Web Docs',
          note: 'Setiap direktif beserta apa yang ia batasi.',
        },
        {
          label: 'Cross-Origin Resource Sharing (CORS)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS',
          source: 'MDN Web Docs',
          note: 'Aturan preflight dan larangan memadukan `*` dengan kredensial.',
        },
        {
          label: 'Denial of Service Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Rate limiting dan batas ukuran sebagai kontrol anti-penyalahgunaan sumber daya.',
        },
      ),
    ],
  ),

  written(
    'upload-aman',
    'Upload Berkas yang Aman',
    12,
    'Fitur yang paling sering menjadi jalan masuk eksekusi kode.',
    [
      p(
        'Unggah berkas menggabungkan beberapa risiko sekaligus: input tidak tepercaya, penulisan ke disk, dan penyajian kembali ke browser. Setiap langkah punya cara gagalnya sendiri.',
      ),

      terms(
        {
          term: 'unggah berkas',
          meaning:
            'Fitur yang **menggabungkan beberapa risiko sekaligus**: input tidak tepercaya, penulisan ke disk, dan penyajian kembali ke browser. Setiap langkah punya cara gagalnya sendiri — dan itulah kenapa ia sering jadi jalan masuk eksekusi kode.',
        },
        {
          term: 'multipart/form-data',
          meaning:
            'Format body untuk mengirim berkas beserta field biasa dalam satu permintaan. Ia diurai library terpisah (`multer`), bukan oleh `express.json()` — jadi batas ukurannya juga diatur terpisah.',
        },
        {
          term: 'memoryStorage',
          meaning:
            'Menyimpan berkas di **memori** dulu supaya bisa diperiksa **sebelum menyentuh disk**. Berbahaya untuk berkas besar, jadi ia selalu dipasangkan dengan `limits.fileSize` yang ketat.',
        },
        {
          term: 'mimetype bisa dipalsukan',
          meaning:
            'Peringatan terpenting sub-bab ini. `file.mimetype` dan nama berkas **keduanya dikirim klien**. Penyerang cukup mengganti header `Content-Type` menjadi `image/png` dan menamai berkasnya `foto.png` — isinya tetap boleh apa saja.',
        },
        {
          term: 'magic bytes',
          meaning:
            'Beberapa byte pertama sebuah berkas yang menandai formatnya sungguhan — PNG selalu diawali `89 50 4E 47`. Memeriksanya adalah **satu-satunya** cara mengetahui isi berkas, karena nama dan mimetype tidak bisa dipercaya.',
        },
        {
          term: 'nama berkas dari server',
          meaning:
            'Nama simpan **dihasilkan server** (UUID), bukan memakai nama dari klien. Ini menutup dua hal sekaligus: path traversal lewat `../../etc/passwd`, dan penimpaan berkas orang lain lewat nama yang sama.',
        },
        {
          term: 'path traversal',
          meaning:
            'Serangan yang memakai `../` di nama berkas untuk menulis ke luar folder yang dimaksud. Ia mustahil kalau nama simpannya dihasilkan server — dan sulit ditutup rapat kalau nama klien dipakai apa adanya.',
        },
        {
          term: 'jangan simpan di webroot',
          meaning:
            'Berkas unggahan **tidak boleh** berada di folder yang bisa dieksekusi server web. Berkas `.php` yang tersimpan di sana lalu diminta lewat browser akan **dijalankan** — dan itu eksekusi kode jarak jauh dengan pintu depan terbuka.',
        },
        {
          term: 'Content-Disposition saat menyajikan',
          meaning:
            'Header yang memaksa browser **mengunduh** berkas, bukan merendernya. Dipasangkan dengan `Content-Type` yang dikunci — supaya HTML atau SVG yang lolos tidak dieksekusi di origin situsmu.',
        },
      ),

      h2('Menerima berkas'),
      code(
        'js',
        `
        import multer from 'multer';

        const TIPE_DIIZINKAN = new Map([
          ['image/jpeg', '.jpg'],
          ['image/png', '.png'],
          ['image/webp', '.webp'],
          ['application/pdf', '.pdf'],
        ]);

        const upload = multer({
          // Simpan di memori supaya bisa diperiksa SEBELUM menyentuh disk.
          storage: multer.memoryStorage(),
          limits: {
            fileSize: 5 * 1024 * 1024,   // 5 MB per berkas
            files: 5,                     // maksimal 5 berkas
            fields: 10,
            parts: 20,
          },
          fileFilter(req, file, cb) {
            // Ini hanya penyaring awal — mimetype dari klien BISA DIPALSUKAN.
            if (!TIPE_DIIZINKAN.has(file.mimetype)) {
              return cb(new KesalahanValidasi({ berkas: 'tipe tidak diizinkan' }));
            }
            cb(null, true);
          },
        });
        `,
      ),
      callout(
        'danger',
        '`file.mimetype` dan nama berkas keduanya dikirim klien',
        'Penyerang cukup mengganti header `Content-Type` menjadi `image/png` dan menamai berkasnya `foto.png` — isinya tetap boleh apa saja. Penyaring berdasarkan keduanya menahan kesalahan pengguna, bukan serangan.',
      ),

      h2('Verifikasi isi sebenarnya'),
      code(
        'js',
        `
        import { fileTypeFromBuffer } from 'file-type';

        export async function periksaBerkas(buffer, tipeDiizinkan) {
          // Membaca magic byte dari isi berkas, bukan dari klaim klien.
          const terdeteksi = await fileTypeFromBuffer(buffer);

          if (terdeteksi === undefined || !tipeDiizinkan.has(terdeteksi.mime)) {
            throw new KesalahanValidasi({ berkas: 'isi berkas tidak sesuai tipe yang diizinkan' });
          }

          return terdeteksi;
        }
        `,
      ),

      h2('Nama berkas dibuat server'),
      compare(
        {
          title: 'Berbahaya',
          lang: 'js',
          code: `
          const tujuan = path.join(
            'uploads',
            file.originalname,
          );

          // originalname bisa berisi:
          //   ../../.env
          //   shell.php
          //   nama-yang-sudah-ada.jpg
          `,
          notes: ['Path traversal', 'Menimpa berkas lain', 'Ekstensi yang bisa dieksekusi'],
        },
        {
          title: 'Aman',
          lang: 'js',
          code: `
          const ext = TIPE_DIIZINKAN.get(
            terdeteksi.mime,
          );

          const nama = \`\${crypto.randomUUID()}\${ext}\`;

          // Nama dari server, ekstensi dari
          // hasil deteksi isi — bukan dari klien.
          `,
          notes: ['Tidak bisa ditebak', 'Tidak bisa menimpa', 'Ekstensi terkendali'],
        },
      ),

      h2('Simpan di luar webroot'),
      callout(
        'danger',
        'Berkas yang tersimpan di folder yang disajikan server web bisa dieksekusi',
        'Satu `.php` di folder yang dilayani PHP-FPM berarti eksekusi kode jarak jauh. Bahkan `.html` sudah cukup untuk XSS tersimpan pada origin yang sama. Simpan unggahan di object storage, atau di direktori yang **tidak pernah** disajikan langsung — lalu layani lewat handler milikmu.',
      ),
      code(
        'js',
        `
        // Menyajikan kembali dengan aman
        export async function unduh(req, res) {
          const berkas = await repo.cariBerkas(req.params.id, req.pengguna.id);   // scope pemilik
          if (berkas === null) return kirim404(res);

          res.set({
            // Tipe dari hasil deteksi kita, bukan dari klien
            'Content-Type': berkas.mime,
            // attachment: browser mengunduh, tidak merender
            'Content-Disposition': \`attachment; filename="\${encodeURIComponent(berkas.namaAsli)}"\`,
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'private, no-store',
          });

          streamDariPenyimpanan(berkas.kunci).pipe(res);
        }
        `,
      ),

      h2('Re-encode gambar'),
      code(
        'js',
        `
        import sharp from 'sharp';

        // Membangun ulang gambar dari piksel akan membuang metadata,
        // muatan yang disisipkan, dan struktur berkas yang cacat.
        const bersih = await sharp(buffer)
          .rotate()                            // hormati EXIF orientation
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
        `,
      ),
      callout(
        'tip',
        'Re-encode juga menghapus data lokasi',
        'Foto dari ponsel membawa EXIF berisi koordinat GPS, model perangkat, dan waktu pengambilan. Menyajikannya apa adanya membocorkan lokasi rumah penggunamu kepada siapa pun yang mengunduh gambarnya.',
      ),

      h2('Unggah langsung ke object storage'),
      code(
        'js',
        `
        // Untuk berkas besar: klien mengunggah langsung ke S3,
        // server hanya menerbitkan URL bertanda tangan berumur pendek.
        const perintah = new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: \`unggahan/\${req.pengguna.id}/\${crypto.randomUUID()}\`,
          ContentType: tipeYangDivalidasi,
          ContentLength: ukuranYangDivalidasi,
        });

        const url = await getSignedUrl(s3, perintah, { expiresIn: 300 });
        res.json({ data: { url, kedaluwarsaDalam: 300 } });
        `,
      ),
      p(
        'Ini menghindarkan server dari menangani byte-nya sama sekali. Tapi karena isinya tidak lewat kamu, verifikasi harus dilakukan **setelah** unggahan selesai — lewat notifikasi dari storage, sebelum berkasnya ditandai siap dipakai.',
      ),

      h2('Checklist unggahan'),
      ol(
        'Batas ukuran per berkas **dan** jumlah berkas.',
        'Allow-list tipe, diverifikasi dari **isi**, bukan dari klaim klien.',
        'Nama berkas dibuat server; nama asli hanya disimpan sebagai metadata.',
        'Disimpan di luar webroot atau di object storage.',
        'Disajikan dengan `Content-Disposition: attachment` dan `nosniff`.',
        'Gambar di-re-encode; dokumen dipindai bila memungkinkan.',
        'Akses berkas di-scope ke pemiliknya — id berkas bukan bukti kewenangan.',
        'Kuota per pengguna, supaya satu akun tidak menghabiskan penyimpanan.',
      ),
      references(
        {
          label: 'File Upload Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Daftar periksa lengkap — verifikasi isi, nama dari server, dan penyimpanan di luar webroot.',
        },
        {
          label: 'Content-Disposition',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition',
          source: 'MDN Web Docs',
          note: 'Membuat browser mengunduh berkas alih-alih merender dan mungkin mengeksekusinya.',
        },
        {
          label: 'X-Content-Type-Options',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options',
          source: 'MDN Web Docs',
          note: 'Melarang browser menebak tipe berkas dari isinya — penting untuk unggahan.',
        },
        {
          label: 'Unrestricted File Upload',
          href: 'https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload',
          source: 'OWASP',
          note: 'Bagaimana unggahan tanpa penjagaan berubah menjadi eksekusi kode jarak jauh.',
        },
      ),
    ],
  ),

  written(
    'queue-bullmq',
    'Background Job & Queue dengan BullMQ',
    13,
    'Memindahkan pekerjaan lambat keluar dari jalur permintaan.',
    [
      p(
        'Pekerjaan yang lambat, bisa gagal, atau bergantung pada pihak ketiga tidak boleh berada di dalam permintaan HTTP. Antrean memindahkannya — dengan konsekuensi yang harus kamu tangani sendiri: eksekusi ganda, kegagalan, dan urutan.',
      ),

      terms(
        {
          term: 'antrean (queue)',
          meaning:
            'Daftar pekerjaan yang menunggu dikerjakan proses lain. Ia memindahkan pekerjaan lambat keluar dari jalur permintaan — **dengan konsekuensi** yang harus kamu tangani sendiri: eksekusi ganda, kegagalan, dan urutan.',
        },
        {
          term: 'BullMQ',
          meaning:
            'Library antrean untuk Node yang memakai **Redis** sebagai penyimpanan. Ia menyediakan retry, backoff, penjadwalan, dan dead-letter — hal yang kalau ditulis sendiri akan menghabiskan waktu berminggu-minggu.',
        },
        {
          term: 'Queue vs Worker',
          meaning:
            '**Queue** adalah sisi yang menambahkan pekerjaan; **Worker** adalah sisi yang mengerjakannya. Keduanya bisa berada di proses berbeda — dan biasanya memang begitu, supaya beban worker tidak mengganggu API.',
        },
        {
          term: 'at-least-once',
          meaning:
            'Jaminan pengiriman yang dipakai hampir semua sistem antrean: sebuah job **bisa dijalankan lebih dari sekali**. Kalau worker mati setelah bekerja tapi sebelum menandai selesai, job itu akan diambil lagi.',
        },
        {
          term: 'handler idempoten',
          meaning:
            'Konsekuensi langsung dari at-least-once. Handler job **wajib** aman dijalankan berulang — kirim email yang sama dua kali menyebalkan; menagih kartu dua kali jauh lebih buruk.',
        },
        {
          term: 'exponential backoff',
          meaning:
            'Jeda antar percobaan yang naik berlipat — 1 detik, 2, 4, 8. Ia mencegah worker membanjiri layanan yang sedang bermasalah, dan memberi layanan itu waktu pulih sebelum dicoba lagi.',
        },
        {
          term: 'dead-letter',
          meaning:
            'Tujuan job yang **habis percobaannya**. Tanpa itu, kegagalan hilang diam-diam atau job berputar selamanya — dan keduanya berarti pekerjaan yang seharusnya terjadi tidak pernah terjadi tanpa ada yang tahu.',
        },
        {
          term: 'payload job harus kecil',
          meaning:
            'Simpan **id**, bukan seluruh objek. Payload besar membebani Redis, dan lebih buruk: data di dalamnya sudah **basi** saat job akhirnya berjalan. Ambil datanya segar dari database di dalam handler.',
        },
        {
          term: 'otorisasi di dalam job',
          meaning:
            'Job **tidak otomatis tepercaya** hanya karena datang dari antreanmu sendiri. Ia tetap harus memverifikasi kewenangan — payload bisa salah, dan keadaan bisa berubah antara saat job dibuat dan saat ia dijalankan.',
        },
      ),

      h2('Menyiapkan'),
      code(
        'js',
        `
        import { Queue, Worker } from 'bullmq';

        const koneksi = { host: env.REDIS_HOST, port: env.REDIS_PORT };

        export const antreanEmail = new Queue('email', {
          connection: koneksi,
          defaultJobOptions: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 },
            // Bersihkan otomatis — kalau tidak, Redis penuh oleh job selesai.
            removeOnComplete: { age: 24 * 3600, count: 1000 },
            removeOnFail: { age: 7 * 24 * 3600 },
          },
        });
        `,
      ),

      h2('Menambah dan memproses'),
      code(
        'js',
        `
        // Dari handler HTTP — kembalikan respons segera
        await antreanEmail.add('verifikasi', {
          penggunaId: String(pengguna.id),
          // Simpan ID, BUKAN objek lengkap. Payload job tersimpan di Redis
          // dan terlihat di dashboard — jangan taruh data pribadi di sana.
        }, {
          // ID job yang deterministik -> menambah dua kali tidak menghasilkan dua job.
          jobId: \`verifikasi:\${pengguna.id}:\${tokenId}\`,
        });

        res.status(202).json({ data: { pesan: 'Email verifikasi sedang dikirim' } });
        `,
      ),
      code(
        'js',
        `
        const pekerja = new Worker('email', async (job) => {
          const { penggunaId } = job.data;

          const pengguna = await prisma.pengguna.findUnique({
            where: { id: BigInt(penggunaId) },
            select: { id: true, email: true, nama: true },
          });

          if (pengguna === null) {
            // Pengguna sudah dihapus — ini bukan kegagalan yang perlu diulang.
            log.warn({ jobId: job.id }, 'pengguna tidak ada, job dilewati');
            return;
          }

          await kirimEmailVerifikasi(pengguna);
        }, {
          connection: koneksi,
          concurrency: 5,
          limiter: { max: 100, duration: 60_000 },   // hormati batas penyedia email
        });

        pekerja.on('failed', (job, err) => {
          log.error({ jobId: job?.id, percobaan: job?.attemptsMade, err }, 'job gagal');
        });
        `,
      ),

      h2('Job harus idempoten'),
      callout(
        'danger',
        'Antrean memberi jaminan at-least-once, bukan exactly-once',
        'Job bisa dijalankan lebih dari sekali: pekerja mati setelah mengerjakan tapi sebelum menandai selesai, koneksi Redis terputus, atau job diulang setelah gagal sebagian. Handler yang tidak idempoten akan mengirim email dua kali — atau, lebih buruk, memproses pembayaran dua kali.',
      ),
      code(
        'js',
        `
        const pekerja = new Worker('pembayaran', async (job) => {
          const { pembayaranId } = job.data;

          // Klaim secara atomik: hanya satu eksekusi yang berhasil mengubah statusnya.
          const klaim = await prisma.pembayaran.updateMany({
            where: { id: pembayaranId, status: 'menunggu' },
            data: { status: 'diproses' },
          });

          if (klaim.count === 0) {
            log.info({ jobId: job.id }, 'pembayaran sudah diproses, job dilewati');
            return;
          }

          await prosesPembayaran(pembayaranId);
        });
        `,
      ),

      h2('Percobaan ulang dan dead letter'),
      code(
        'js',
        `
        await antrean.add('sinkron', data, {
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },   // 2s, 4s, 8s, 16s, 32s
        });
        `,
      ),
      code(
        'js',
        `
        // Beberapa kegagalan TIDAK boleh diulang.
        const pekerja = new Worker('sinkron', async (job) => {
          try {
            await panggilApiPartner(job.data);
          } catch (err) {
            // 4xx = permintaan kita yang salah. Mengulang tidak akan menolong.
            if (err.status >= 400 && err.status < 500) {
              throw new UnrecoverableError(\`ditolak partner: \${err.status}\`);
            }
            throw err;   // 5xx dan timeout: boleh diulang
          }
        });
        `,
      ),
      callout(
        'warning',
        'Job yang mengulang selamanya adalah gangguan yang berjalan lambat',
        'Ia menghabiskan pekerja, memenuhi log, dan menutupi job lain yang sehat. Setiap job butuh batas percobaan dan tujuan akhir yang **benar-benar dilihat orang** — antrean gagal yang tidak pernah dibuka sama saja dengan membuang pekerjaannya.',
      ),

      h2('Job berjadwal & berulang'),
      code(
        'js',
        `
        // Tunda
        await antrean.add('pengingat', data, { delay: 24 * 3600 * 1000 });

        // Berulang
        await antrean.add('bersihkan-token', {}, {
          repeat: { pattern: '0 3 * * *' },   // 03:00 setiap hari
          jobId: 'bersihkan-token',           // cegah pendaftaran ganda
        });
        `,
      ),

      h2('Matikan pekerja dengan rapi'),
      code(
        'js',
        `
        for (const sinyal of ['SIGTERM', 'SIGINT']) {
          process.on(sinyal, async () => {
            // Selesaikan job yang sedang berjalan sebelum keluar.
            await pekerja.close();
            await antrean.close();
            process.exit(0);
          });
        }
        `,
      ),

      h2('Kapan kamu BELUM butuh antrean'),
      callout(
        'tip',
        'Antrean menambah Redis, proses pekerja, dan satu sistem lagi untuk dipantau',
        'Untuk aplikasi kecil, `setImmediate` atau sekadar menerima bahwa permintaannya butuh dua detik sering lebih baik. Tambahkan antrean saat ada masalah nyata: permintaan yang timeout, pekerjaan yang harus bertahan melewati restart, atau batas rate pihak ketiga yang harus dihormati.',
      ),
      references(
        {
          label: 'BullMQ — Guide',
          href: 'https://docs.bullmq.io/guide/introduction',
          source: 'BullMQ',
          note: 'Queue, Worker, dan alur job dari penambahan sampai penyelesaian.',
        },
        {
          label: 'BullMQ — Retrying failing jobs',
          href: 'https://docs.bullmq.io/guide/retrying-failing-jobs',
          source: 'BullMQ',
          note: '`attempts`, backoff eksponensial, dan `UnrecoverableError` untuk kegagalan permanen.',
        },
        {
          label: 'BullMQ — Repeatable jobs',
          href: 'https://docs.bullmq.io/guide/jobs/repeatable',
          source: 'BullMQ',
          note: 'Job berjadwal beserta `jobId` yang mencegah pendaftaran ganda.',
        },
        {
          label: 'Redis — Keyspace & expiration',
          href: 'https://redis.io/docs/latest/develop/use/keyspace/',
          source: 'Redis',
          note: 'Penyimpanan yang menopang antrean, beserta perilaku kedaluwarsanya.',
        },
      ),
    ],
  ),

  written(
    'cache-redis',
    'Caching dengan Redis',
    12,
    'Menyimpan hasil yang mahal — dan menjaganya tidak menjadi salah.',
    [
      p(
        'Cache mempercepat dengan menyimpan jawaban lama. Konsekuensinya melekat: **data yang kamu sajikan bisa basi**. Seluruh kesulitan caching ada di sana, bukan di cara menyimpannya.',
      ),

      terms(
        {
          term: 'cache',
          meaning:
            'Penyimpanan jawaban lama untuk mempercepat pembacaan berikutnya. Konsekuensinya melekat: **data yang kamu sajikan bisa basi**. Seluruh kesulitan caching ada di sana — bukan di cara menyimpannya.',
        },
        {
          term: 'cache-aside',
          meaning:
            'Pola paling umum: cek cache dulu, kalau kosong ambil dari database lalu **simpan hasilnya**. Aplikasi yang mengelola cache-nya sendiri — berbeda dari pola di mana cache yang mengambil data untukmu.',
        },
        {
          term: 'TTL',
          meaning:
            'Singkatan *Time To Live* — berapa lama entri cache berlaku. **Wajib ada**: tanpa TTL, entri menumpuk sampai memori Redis habis, dan data basi bertahan selamanya.',
        },
        {
          term: 'versi di kunci cache',
          meaning:
            'Awalan seperti `artikel:v1:` pada kunci. Saat bentuk data berubah, naikkan versinya — seluruh entri lama otomatis tidak terpakai. **Jauh lebih andal** daripada berusaha menghapusnya satu per satu.',
        },
        {
          term: 'invalidasi',
          meaning:
            'Membuang entri cache setelah datanya berubah. Ini bagian tersulit caching: melewatkan satu jalur penulisan berarti pengguna melihat data lama, dan gejalanya muncul jauh dari penyebabnya.',
        },
        {
          term: 'cache stampede',
          meaning:
            'Saat satu entri populer kedaluwarsa, **semua** permintaan bersamaan gagal cache dan menghantam database sekaligus. Obatnya: kunci pengambilan ulang, atau TTL yang diberi variasi acak supaya tidak kedaluwarsa serentak.',
        },
        {
          term: 'jangan cache data privat bersama',
          meaning:
            'Kunci cache **wajib** memuat id pengguna kalau isinya berbeda per pengguna. Kunci `dasbor` tanpa id akan menyajikan dasbor Ana kepada Budi — dan tidak ada error apa pun yang memberitahumu.',
        },
        {
          term: 'cache sebagai optimasi, bukan kebenaran',
          meaning:
            'Aplikasi harus **tetap benar** kalau cache-nya kosong atau mati. Redis yang tidak bisa dihubungi seharusnya membuat aplikasi lebih lambat, bukan gagal — jadi bungkus pembacaan cache dengan penanganan kegagalan.',
        },
        {
          term: 'apa yang layak di-cache',
          meaning:
            'Yang **mahal dihitung** dan **sering dibaca** — hasil agregasi, daftar yang jarang berubah, respons pihak ketiga. Meng-cache query yang sudah cepat menambah kerumitan tanpa manfaat yang bisa diukur.',
        },
      ),

      h2('Pola cache-aside'),
      code(
        'js',
        `
        export async function ambilArtikel(id) {
          const kunci = \`artikel:v1:\${id}\`;

          const tersimpan = await redis.get(kunci);
          if (tersimpan !== null) return JSON.parse(tersimpan);

          const artikel = await prisma.artikel.findUnique({ where: { id } });
          if (artikel === null) return null;

          // TTL WAJIB. Tanpa itu, entri menumpuk sampai memori Redis habis.
          await redis.set(kunci, JSON.stringify(artikel), 'EX', 300);

          return artikel;
        }
        `,
      ),
      callout(
        'danger',
        'Cache tanpa TTL adalah kebocoran memori yang tertunda',
        'Redis akan mengisi memorinya sampai penuh, lalu mulai membuang kunci berdasarkan kebijakan `maxmemory-policy` — yang default-nya `noeviction`, artinya **penulisan mulai gagal**. Setiap `set` harus punya `EX`.',
      ),

      h2('Penamaan kunci'),
      code(
        'js',
        `
        // Sertakan versi: naikkan v1 -> v2 untuk membatalkan seluruh entri
        // saat bentuk datanya berubah. Ini jauh lebih andal daripada
        // berusaha menghapus kunci satu per satu.
        \`artikel:v1:\${id}\`
        \`artikel:v1:daftar:\${penulisId}:\${halaman}\`

        // WAJIB sertakan id pengguna untuk data privat
        \`dasbor:v1:pengguna:\${penggunaId}\`
        `,
      ),
      callout(
        'danger',
        'Kunci cache yang tidak menyertakan identitas menyajikan data orang lain',
        'Kunci `dasbor:ringkasan` yang dipakai untuk semua pengguna akan menyajikan dasbor Ana kepada Budi. Ini bentuk lain dari IDOR — dan ia lebih sulit ditemukan karena bergantung pada siapa yang kebetulan mengisi cache lebih dulu.',
      ),

      h2('Invalidasi'),
      code(
        'js',
        `
        export async function perbaruiArtikel(id, penggunaId, data) {
          const artikel = await prisma.artikel.updateMany({
            where: { id, penulisId: penggunaId },
            data,
          });

          if (artikel.count === 0) throw new KesalahanTidakDitemukan();

          // Hapus entri yang terpengaruh
          await redis.del(\`artikel:v1:\${id}\`);

          // JANGAN pakai KEYS — ia memblokir seluruh Redis.
          // Pakai SCAN, atau lebih baik: rancang kunci supaya
          // penghapusan massal tidak diperlukan.
          const aliran = redis.scanStream({ match: \`artikel:v1:daftar:\${penggunaId}:*\`, count: 100 });
          for await (const kunci of aliran) {
            if (kunci.length > 0) await redis.del(...kunci);
          }
        }
        `,
      ),
      callout(
        'danger',
        'Jangan pernah menjalankan `KEYS` di produksi',
        'Redis satu utas. `KEYS *` memindai seluruh keyspace dan **memblokir setiap perintah lain** sampai selesai — pada database besar itu berarti seluruh aplikasi berhenti selama beberapa detik. Pakai `SCAN` yang berjalan bertahap.',
      ),

      h2('Cache stampede'),
      code(
        'js',
        `
        // Masalah: satu kunci populer kedaluwarsa -> 1.000 permintaan
        // bersamaan sama-sama mendapati cache kosong -> 1.000 query serentak.
        export async function ambilDenganKunci(kunci, ttl, muat) {
          const tersimpan = await redis.get(kunci);
          if (tersimpan !== null) return JSON.parse(tersimpan);

          // Hanya SATU yang boleh memuat ulang.
          const kunciGembok = \`\${kunci}:gembok\`;
          const dapat = await redis.set(kunciGembok, '1', 'NX', 'EX', 10);

          if (dapat === null) {
            // Yang lain menunggu sebentar lalu membaca hasilnya.
            await new Promise((r) => setTimeout(r, 100));
            const lagi = await redis.get(kunci);
            if (lagi !== null) return JSON.parse(lagi);
          }

          try {
            const nilai = await muat();
            await redis.set(kunci, JSON.stringify(nilai), 'EX', ttl);
            return nilai;
          } finally {
            await redis.del(kunciGembok);
          }
        }
        `,
      ),

      h2('Apa yang layak di-cache'),
      table(
        ['Layak', 'Tidak layak'],
        [
          ['Query mahal yang jarang berubah', 'Data yang berubah tiap detik'],
          ['Hasil agregasi & laporan', 'Query yang sudah cepat lewat index'],
          ['Respons API pihak ketiga', 'Data yang harus selalu tepat (saldo, stok)'],
          ['Konfigurasi & daftar referensi', 'Sesuatu yang salahnya berbahaya'],
        ],
      ),
      callout(
        'warning',
        'Jangan pakai cache untuk menutupi query yang lambat',
        'Kalau sebuah query lambat karena kekurangan index, cache hanya menyembunyikannya — dan kelambatannya kembali setiap kali cache dingin, biasanya justru saat trafik sedang tinggi setelah deploy. Perbaiki query-nya dulu; cache untuk yang memang mahal secara inheren.',
      ),

      h2('Redis mati — aplikasi harus tetap hidup'),
      code(
        'js',
        `
        export async function ambilDenganCache(kunci, ttl, muat) {
          try {
            const tersimpan = await redis.get(kunci);
            if (tersimpan !== null) return JSON.parse(tersimpan);
          } catch (err) {
            // Cache adalah optimasi, bukan sumber kebenaran.
            log.warn({ err }, 'redis tidak terjangkau, lanjut ke sumber data');
          }

          const nilai = await muat();

          try {
            await redis.set(kunci, JSON.stringify(nilai), 'EX', ttl);
          } catch {
            // Gagal menulis cache bukan alasan menggagalkan permintaan.
          }

          return nilai;
        }
        `,
      ),
      p(
        'Ini pembeda antara cache dan penyimpanan utama: kegagalan cache harus menurunkan performa, bukan menghentikan layanan.',
      ),
      references(
        {
          label: 'Redis — Keyspace',
          href: 'https://redis.io/docs/latest/develop/use/keyspace/',
          source: 'Redis',
          note: 'Perancangan kunci, TTL, dan perilaku kedaluwarsanya.',
        },
        {
          label: 'Redis — SCAN',
          href: 'https://redis.io/docs/latest/commands/scan/',
          source: 'Redis',
          note: 'Pengganti `KEYS` yang berjalan bertahap dan tidak memblokir seluruh server.',
        },
        {
          label: 'Redis — SET with NX and EX',
          href: 'https://redis.io/docs/latest/commands/set/',
          source: 'Redis',
          note: 'Opsi yang membuat kunci gembok anti-stampede bisa diklaim secara atomik.',
        },
        {
          label: 'Caching best practices',
          href: 'https://web.dev/articles/http-cache',
          source: 'web.dev',
          note: 'Prinsip caching yang berlaku sama di lapisan HTTP maupun aplikasi.',
        },
      ),
    ],
  ),

  written(
    'testing-express',
    'Testing: Vitest + Supertest',
    13,
    'Tes yang benar-benar menangkap bug, bukan yang sekadar hijau.',
    [
      terms(
        {
          term: 'piramida tes',
          meaning:
            'Gambaran proporsi jenis tes: banyak unit yang cepat, cukup integrasi, sedikit end-to-end. Bentuknya piramida karena makin ke atas makin lambat dan makin rapuh — bukan karena makin tidak berguna.',
        },
        {
          term: 'Supertest',
          meaning:
            'Library yang menjalankan permintaan HTTP terhadap aplikasi Express **tanpa membuka port**. Ia yang membuat tes integrasi bisa memanggil endpoint sungguhan sambil tetap cepat dan bisa berjalan paralel.',
        },
        {
          term: 'tes integrasi',
          meaning:
            'Menguji **jalur nyata** dari HTTP sampai database. Ia yang menangkap bug yang lolos unit test: middleware yang urutannya salah, otorisasi yang lupa dipasang, dan bentuk respons yang tidak sesuai kontrak.',
        },
        {
          term: 'database uji',
          meaning:
            'Database terpisah yang dipakai tes — bukan database pengembangan. Ia boleh dihapus dan dibangun ulang kapan saja, dan itulah yang membuat tes bisa dimulai dari keadaan yang **diketahui**.',
        },
        {
          term: 'isolasi antar tes',
          meaning:
            'Setiap tes mulai dari keadaan bersih. Tanpa itu, tes menjadi **bergantung urutan**: lulus saat dijalankan sendiri, gagal saat dijalankan bersama — dan menemukan penyebabnya jauh lebih mahal daripada mencegahnya.',
        },
        {
          term: 'tes otorisasi negatif',
          meaning:
            'Membuktikan bahwa yang **seharusnya ditolak** memang ditolak. Ini tes yang paling sering tidak ditulis, dan justru yang paling berharga — karena IDOR tidak menimbulkan gejala apa pun sampai ada yang mencarinya.',
        },
        {
          term: 'jangan uji implementasi',
          meaning:
            'Tes yang memeriksa **bagaimana** sesuatu dikerjakan akan gagal setiap kali kamu merapikan kode, meski perilakunya tidak berubah. Uji lewat antarmuka publik — status code, bentuk respons, dan keadaan database sesudahnya.',
        },
        {
          term: 'flaky test',
          meaning:
            'Tes yang kadang lulus kadang gagal tanpa kodenya berubah. Ia lebih berbahaya daripada tidak punya tes: orang belajar **mengabaikan** kegagalan, dan kegagalan yang sungguhan ikut terabaikan.',
        },
        {
          term: 'coverage bukan tujuan',
          meaning:
            'Angka cakupan mengukur baris yang **dijalankan**, bukan perilaku yang **diperiksa**. Tes yang memanggil semua fungsi tanpa satu pun assertion menghasilkan 100% — dan tidak menangkap apa pun.',
        },
      ),

      h2('Piramida yang realistis'),
      table(
        ['Jenis', 'Menguji', 'Porsi'],
        [
          ['Unit', 'Fungsi murni, aturan bisnis', 'Banyak — cepat'],
          ['**Integrasi**', 'Rute lengkap + database sungguhan', '**Paling berharga di backend**'],
          ['End-to-end', 'Seluruh sistem berjalan', 'Sedikit — lambat dan rapuh'],
        ],
      ),
      p(
        'Untuk API, tes integrasi memberi nilai tertinggi: ia menguji middleware, validasi, otorisasi, query, dan bentuk respons sekaligus — persis rangkaian tempat bug sungguhan bersembunyi.',
      ),

      h2('Menyiapkan'),
      code(
        'ts',
        `
        // vitest.config.ts
        export default defineConfig({
          test: {
            environment: 'node',
            setupFiles: ['./src/test/setup.ts'],
            // Tes integrasi berbagi satu database -> jangan paralel per berkas.
            poolOptions: { threads: { singleThread: true } },
          },
        });
        `,
      ),
      code(
        'ts',
        `
        // src/test/setup.ts
        import { beforeAll, afterAll, beforeEach } from 'vitest';

        beforeAll(async () => {
          // Database terpisah untuk tes — JANGAN pernah menunjuk database pengembangan.
          if (!process.env.DATABASE_URL?.includes('_test')) {
            throw new Error('DATABASE_URL tes harus menunjuk database bernama *_test');
          }
          execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        });

        beforeEach(async () => {
          // Bersihkan antar tes supaya tidak saling bergantung.
          await prisma.$executeRawUnsafe(
            'TRUNCATE catatan, sesi_refresh, pengguna RESTART IDENTITY CASCADE',
          );
        });

        afterAll(async () => {
          await prisma.$disconnect();
        });
        `,
      ),
      callout(
        'danger',
        'Penjagaan nama database itu wajib',
        'Satu `TRUNCATE` yang menunjuk database pengembangan menghapus seluruh data kerjamu, dan satu yang menunjuk produksi jauh lebih buruk. Pemeriksaan nama di `beforeAll` itu tiga baris dan menutup kelas kecelakaan yang tidak bisa dibatalkan.',
      ),

      h2('Tes integrasi'),
      code(
        'ts',
        `
        import request from 'supertest';

        describe('GET /api/catatan', () => {
          it('mengembalikan hanya catatan milik pengguna yang masuk', async () => {
            const ana = await buatPengguna();
            const budi = await buatPengguna();

            await buatCatatan({ penulisId: ana.id, jumlah: 3 });
            await buatCatatan({ penulisId: budi.id, jumlah: 5 });

            const res = await request(app)
              .get('/api/catatan')
              .set('Authorization', \`Bearer \${tokenUntuk(ana)}\`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(3);
          });

          it('menolak tanpa token', async () => {
            const res = await request(app).get('/api/catatan');
            expect(res.status).toBe(401);
          });

          it('membatasi per_hal di sisi server', async () => {
            const ana = await buatPengguna();
            await buatCatatan({ penulisId: ana.id, jumlah: 150 });

            const res = await request(app)
              .get('/api/catatan?per_hal=999999')
              .set('Authorization', \`Bearer \${tokenUntuk(ana)}\`);

            expect(res.body.data.length).toBeLessThanOrEqual(100);
          });
        });
        `,
      ),

      h2('Tes yang paling penting: jalur yang tidak bahagia'),
      code(
        'ts',
        `
        describe('otorisasi', () => {
          it('menolak akses ke catatan milik pengguna lain', async () => {
            const ana = await buatPengguna();
            const budi = await buatPengguna();
            const catatanBudi = await buatSatuCatatan({ penulisId: budi.id });

            for (const [method, jalur] of [
              ['get', \`/api/catatan/\${catatanBudi.id}\`],
              ['patch', \`/api/catatan/\${catatanBudi.id}\`],
              ['delete', \`/api/catatan/\${catatanBudi.id}\`],
            ] as const) {
              const res = await request(app)[method](jalur)
                .set('Authorization', \`Bearer \${tokenUntuk(ana)}\`)
                .send({ judul: 'dibajak' });

              expect(res.status, \`\${method} \${jalur}\`).toBe(404);
            }

            // Dan pastikan datanya benar-benar tidak berubah
            const sesudah = await prisma.catatan.findUnique({ where: { id: catatanBudi.id } });
            expect(sesudah?.judul).toBe(catatanBudi.judul);
          });

          it('mengabaikan penulisId yang dikirim klien', async () => {
            const ana = await buatPengguna();
            const budi = await buatPengguna();

            await request(app).post('/api/catatan')
              .set('Authorization', \`Bearer \${tokenUntuk(ana)}\`)
              .send({ judul: 'A', isi: 'B', penulisId: String(budi.id) })
              .expect(201);

            const catatan = await prisma.catatan.findFirst();
            expect(catatan?.penulisId).toBe(ana.id);
          });
        });
        `,
      ),
      callout(
        'tip',
        'Dua tes itu yang paling sering tidak ditulis',
        'Keduanya tidak menguji bahwa fitur berjalan — keduanya menguji bahwa sesuatu yang **seharusnya tidak bisa** memang tidak bisa. Salin dan sesuaikan untuk setiap sumber daya yang punya pemilik.',
      ),

      h2('Tiruan hanya untuk yang di luar kendalimu'),
      code(
        'ts',
        `
        // Tiru: layanan pihak ketiga, jam, pengacakan
        vi.mock('../lib/email.js', () => ({ kirimEmail: vi.fn().mockResolvedValue(true) }));
        vi.setSystemTime(new Date('2026-08-02T10:00:00Z'));

        // JANGAN tiru: database milikmu sendiri.
        // Repository tiruan akan tetap hijau saat query-nya salah.
        `,
      ),

      h2('Cakupan bukan tujuan'),
      callout(
        'warning',
        'Cakupan 100% tidak berarti apa-apa kalau semua tes menguji jalur sukses',
        'Cakupan mengukur baris yang **dijalankan**, bukan perilaku yang **diperiksa**. Tes yang memanggil endpoint dan hanya memastikan statusnya `200` menaikkan angka tanpa menangkap satu bug pun. Yang berharga adalah tes untuk input kosong, tidak valid, tidak berizin, dan dependensi yang gagal.',
      ),
      references(
        {
          label: 'Vitest — Getting Started',
          href: 'https://vitest.dev/guide/',
          source: 'Vitest',
          note: 'Test runner yang dipakai project ini, beserta konfigurasi dasarnya.',
        },
        {
          label: 'Vitest — Mocking & fake timers',
          href: 'https://vitest.dev/guide/mocking',
          source: 'Vitest',
          note: '`vi.mock` dan `vi.setSystemTime` untuk hal yang benar-benar di luar kendalimu.',
        },
        {
          label: 'Vitest — Test Coverage',
          href: 'https://vitest.dev/guide/coverage',
          source: 'Vitest',
          note: 'Cara mengukurnya — beserta alasan angkanya bukan tujuan.',
        },
        {
          label: 'Authorization Testing Automation Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Menjadikan uji otorisasi negatif bagian tetap dari suite tes.',
        },
      ),
    ],
  ),

  written(
    'socketio',
    'Realtime dengan Socket.IO',
    11,
    'Komunikasi dua arah, beserta beban yang menyertainya.',
    [
      p(
        'WebSocket memberi koneksi dua arah yang tetap terbuka. Ia menyelesaikan masalah yang tidak bisa diselesaikan polling — tapi ia juga memperkenalkan state per koneksi, yang bertentangan dengan sifat stateless yang membuat backend mudah diskalakan.',
      ),

      terms(
        {
          term: 'WebSocket',
          meaning:
            'Koneksi **dua arah yang tetap terbuka** antara browser dan server. Ia menyelesaikan masalah yang tidak bisa diselesaikan polling — tapi memperkenalkan **state per koneksi**, yang bertentangan dengan sifat stateless yang membuat backend mudah diskalakan.',
        },
        {
          term: 'Socket.IO',
          meaning:
            'Library di atas WebSocket yang menambahkan pemulihan koneksi, room, dan fallback ke polling. Ia bukan WebSocket murni — klien dan server harus **sama-sama** memakai Socket.IO.',
        },
        {
          term: 'handshake',
          meaning:
            'Fase awal koneksi tempat klien mengirim data autentikasi. Di sinilah token diperiksa — **sekali di awal**, bukan di setiap pesan, dan itu punya konsekuensi yang dibahas di bawah.',
        },
        {
          term: 'auth sekali di awal',
          meaning:
            'Konsekuensi yang harus disadari: koneksi yang sudah terbuka **tetap sah** meski token-nya kedaluwarsa atau dicabut. Untuk itu perlu pemeriksaan berkala, atau penutupan paksa saat pencabutan terjadi.',
        },
        {
          term: 'room',
          meaning:
            'Pengelompokan koneksi yang bisa dikirimi pesan sekaligus. Ia yang membuat "kirim ke semua anggota proyek 42" jadi satu pemanggilan — tapi **keanggotaannya wajib diotorisasi** saat bergabung.',
        },
        {
          term: 'otorisasi per event',
          meaning:
            'Setiap pesan masuk **tetap masukan tidak tepercaya**, sama seperti body HTTP. Koneksi yang terautentikasi bukan izin untuk melakukan apa pun — kewenangan tetap diperiksa per aksi.',
        },
        {
          term: 'maxHttpBufferSize',
          meaning:
            'Batas ukuran pesan. Koneksi terbuka **juga jalur masuk data** — tanpa batas, satu klien bisa mengirim pesan raksasa yang menghabiskan memori server.',
        },
        {
          term: 'state per koneksi',
          meaning:
            'Beban utama realtime. Server harus mengingat siapa terhubung di mana — dan itu membuat penambahan proses tidak lagi gratis: dua proses tidak otomatis saling tahu koneksi masing-masing.',
        },
        {
          term: 'adapter Redis',
          meaning:
            'Jembatan yang membuat beberapa proses Socket.IO saling meneruskan pesan. **Wajib** begitu kamu menjalankan lebih dari satu proses — tanpa itu, pesan hanya sampai ke klien yang kebetulan terhubung ke proses yang sama.',
        },
      ),

      h2('Menyiapkan'),
      code(
        'js',
        `
        import { Server } from 'socket.io';

        const io = new Server(httpServer, {
          cors: { origin: env.corsOrigins, credentials: true },
          // Batasi ukuran pesan — koneksi terbuka juga jalur masuk data.
          maxHttpBufferSize: 1e6,
          pingTimeout: 20_000,
        });
        `,
      ),

      h2('Autentikasi saat koneksi'),
      code(
        'js',
        `
        io.use(async (socket, next) => {
          const token = socket.handshake.auth?.token;

          if (typeof token !== 'string') {
            return next(new Error('tidak terautentikasi'));
          }

          try {
            const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
            socket.data.penggunaId = payload.sub;
            next();
          } catch {
            next(new Error('tidak terautentikasi'));
          }
        });
        `,
      ),
      callout(
        'danger',
        'Autentikasi saat koneksi tidak cukup',
        'Koneksi WebSocket bisa terbuka berjam-jam. Token yang sah saat handshake bisa sudah dicabut lima menit kemudian — karena logout, ganti password, atau akun dinonaktifkan. Verifikasi ulang secara berkala, dan **selalu periksa otorisasi per peristiwa**, bukan sekali saat masuk.',
      ),

      h2('Room dan otorisasinya'),
      code(
        'js',
        `
        io.on('connection', (socket) => {
          const penggunaId = socket.data.penggunaId;

          // Room pribadi — untuk mengirim notifikasi ke satu pengguna
          socket.join(\`pengguna:\${penggunaId}\`);

          socket.on('gabung-ruang', async (ruangId, balas) => {
            // WAJIB: periksa kewenangan SETIAP peristiwa.
            // Klien bisa mengirim ruangId apa pun.
            const boleh = await bolehAksesRuang(penggunaId, ruangId);

            if (!boleh) return balas({ ok: false, error: 'tidak berwenang' });

            socket.join(\`ruang:\${ruangId}\`);
            balas({ ok: true });
          });

          socket.on('pesan', async (data, balas) => {
            // Validasi payload — ia masukan yang tidak tepercaya, sama seperti body HTTP.
            const hasil = SkemaPesan.safeParse(data);
            if (!hasil.success) return balas({ ok: false, error: 'payload tidak valid' });

            // Otorisasi lagi — keanggotaan bisa dicabut setelah socket bergabung.
            if (!(await bolehAksesRuang(penggunaId, hasil.data.ruangId))) {
              return balas({ ok: false, error: 'tidak berwenang' });
            }

            const pesan = await simpanPesan({ ...hasil.data, penulisId: penggunaId });
            io.to(\`ruang:\${hasil.data.ruangId}\`).emit('pesan-baru', pesan);
            balas({ ok: true, id: pesan.id });
          });
        });
        `,
      ),
      callout(
        'danger',
        'Payload socket adalah masukan tidak tepercaya, sama seperti body HTTP',
        'Karena tidak melewati middleware validasi HTTP, mudah lupa memvalidasinya. Setiap handler peristiwa butuh skema, batas ukuran, dan pemeriksaan otorisasinya sendiri.',
      ),

      h2('Beberapa proses butuh adapter'),
      code(
        'js',
        `
        import { createAdapter } from '@socket.io/redis-adapter';

        // Tanpa ini, pengguna yang terhubung ke proses A tidak akan
        // menerima pesan yang dipancarkan dari proses B.
        io.adapter(createAdapter(redisPub, redisSub));
        `,
      ),

      h2('Rate limit juga berlaku di sini'),
      code(
        'js',
        `
        const hitung = new Map();

        socket.use(([peristiwa], next) => {
          const kunci = \`\${socket.data.penggunaId}:\${peristiwa}\`;
          const n = (hitung.get(kunci) ?? 0) + 1;
          hitung.set(kunci, n);

          setTimeout(() => hitung.set(kunci, (hitung.get(kunci) ?? 1) - 1), 1000);

          if (n > 20) return next(new Error('terlalu cepat'));
          next();
        });
        `,
      ),

      h2('Kapan WebSocket, kapan yang lebih sederhana'),
      table(
        ['Kebutuhan', 'Pilihan'],
        [
          ['Chat, kolaborasi, permainan', 'WebSocket'],
          ['Notifikasi satu arah dari server', '**SSE** — jauh lebih sederhana'],
          ['Kemajuan job', 'SSE atau polling dengan `Retry-After`'],
          ['Data yang diperbarui tiap beberapa menit', 'Polling biasa'],
        ],
      ),
      callout(
        'tip',
        'SSE sering cukup, dan jauh lebih murah',
        'Server-Sent Events berjalan di atas HTTP biasa: ia melewati proxy tanpa konfigurasi khusus, memakai autentikasi yang sama dengan endpoint lain, dan menyambung ulang sendiri. Kalau kamu hanya perlu mengirim dari server ke klien, WebSocket adalah beban yang tidak kamu butuhkan.',
      ),
      references(
        {
          label: 'Socket.IO — Server API',
          href: 'https://socket.io/docs/v4/server-api/',
          source: 'Socket.IO',
          note: 'Opsi server termasuk `maxHttpBufferSize` dan `pingTimeout`.',
        },
        {
          label: 'Socket.IO — Middlewares & authentication',
          href: 'https://socket.io/docs/v4/middlewares/',
          source: 'Socket.IO',
          note: 'Pemeriksaan token saat handshake, dan middleware per event.',
        },
        {
          label: 'Socket.IO — Redis adapter',
          href: 'https://socket.io/docs/v4/redis-adapter/',
          source: 'Socket.IO',
          note: 'Wajib begitu ada lebih dari satu proses yang melayani koneksi.',
        },
        {
          label: 'Server-Sent Events',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events',
          source: 'MDN Web Docs',
          note: 'Alternatif satu arah yang jauh lebih sederhana dan sering sudah cukup.',
        },
      ),
    ],
  ),

  written(
    'observability',
    'Observability: logging, request id, health check',
    12,
    'Kemampuan menjawab "apa yang terjadi" setelah kejadiannya lewat.',
    [
      p(
        'Aplikasi produksi akan gagal dengan cara yang tidak kamu antisipasi. Observability adalah kemampuan **menjelaskannya setelah kejadian** — tanpa itu, setiap laporan pengguna berakhir dengan "tidak bisa direproduksi".',
      ),

      terms(
        {
          term: 'observability',
          meaning:
            'Kemampuan **menjelaskan apa yang terjadi setelah kejadiannya lewat**. Aplikasi produksi akan gagal dengan cara yang tidak kamu antisipasi — tanpa observability, setiap laporan pengguna berakhir dengan "tidak bisa direproduksi".',
        },
        {
          term: 'tiga pilar',
          meaning:
            '**Log** menjawab apa yang terjadi pada satu permintaan tertentu. **Metrik** menjawab bagaimana kesehatan sistem secara keseluruhan. **Trace** menjawab ke mana saja satu permintaan pergi lintas layanan.',
        },
        {
          term: 'AsyncLocalStorage',
          meaning:
            'API Node yang menyimpan nilai **per rantai eksekusi asinkron** — sehingga id permintaan bisa dibaca dari fungsi mana pun tanpa dioper sebagai argumen ke setiap lapisan.',
        },
        {
          term: 'id korelasi dari hulu',
          meaning:
            'Memakai ulang `x-request-id` dari header **kalau sudah ada**, bukan selalu membuat baru. Ia yang membuat jejak tersambung lintas layanan — dan tanpa itu, satu perjalanan terpecah jadi beberapa jejak terpisah.',
        },
        {
          term: 'child logger',
          meaning:
            'Logger turunan yang membawa field tetap — misalnya `reqId`. Setiap baris darinya otomatis menyertakannya, jadi kamu tidak perlu mengulangnya di setiap pemanggilan dan tidak mungkin lupa.',
        },
        {
          term: 'health check',
          meaning:
            'Endpoint yang menjawab "apakah proses ini sehat". Ia dipakai load balancer dan orkestrator untuk memutuskan apakah instance layak menerima trafik — jadi jawabannya harus **cepat** dan **jujur**.',
        },
        {
          term: 'liveness vs readiness',
          meaning:
            '**Liveness** menjawab "apakah proses ini masih hidup" — gagal berarti restart. **Readiness** menjawab "apakah ia siap menerima trafik" — gagal berarti dikeluarkan dari rotasi sementara. Menyamakan keduanya menyebabkan restart yang tidak perlu.',
        },
        {
          term: 'health check tidak boleh berat',
          meaning:
            'Ia dipanggil **setiap beberapa detik** oleh setiap pemantau. Health check yang menjalankan query berat menambah beban justru saat sistem sedang tertekan — persis saat ia paling tidak boleh menambah beban.',
        },
        {
          term: 'log tanpa alert bukan deteksi',
          meaning:
            'Log yang tidak ada yang membaca adalah **arsip**. Yang membuatnya deteksi adalah alert pada pola tertentu: lonjakan `5xx`, lonjakan penolakan otorisasi, dan latensi yang menyimpang dari baseline.',
        },
      ),

      h2('Tiga pilar'),
      table(
        ['Pilar', 'Menjawab'],
        [
          ['**Log**', 'Apa yang terjadi pada satu permintaan tertentu'],
          ['**Metrik**', 'Bagaimana kesehatan sistem secara keseluruhan'],
          ['**Trace**', 'Ke mana saja satu permintaan pergi lintas layanan'],
        ],
      ),

      h2('Id korelasi'),
      code(
        'js',
        `
        import { AsyncLocalStorage } from 'node:async_hooks';

        export const konteks = new AsyncLocalStorage();

        export function pencatatPermintaan(req, res, next) {
          // Hormati id dari hulu supaya trace lintas layanan tersambung.
          req.id = req.headers['x-request-id'] ?? crypto.randomUUID();
          res.setHeader('X-Request-Id', req.id);

          const anak = log.child({ reqId: req.id });
          req.log = anak;

          const mulai = process.hrtime.bigint();

          res.on('finish', () => {
            const ms = Number(process.hrtime.bigint() - mulai) / 1e6;

            anak[res.statusCode >= 500 ? 'error' : 'info']({
              method: req.method,
              url: req.originalUrl,
              status: res.statusCode,
              durasiMs: Math.round(ms),
              penggunaId: req.pengguna?.id?.toString(),
            }, 'permintaan selesai');
          });

          // AsyncLocalStorage membuat reqId terjangkau dari lapisan
          // mana pun tanpa harus mengoper req ke mana-mana.
          konteks.run({ reqId: req.id, log: anak }, next);
        }
        `,
      ),
      callout(
        'tip',
        '`AsyncLocalStorage` menyelesaikan masalah yang nyata',
        'Tanpa itu, satu-satunya cara `reqId` sampai ke repository adalah dengan mengoper `req` melewati controller dan service — yang langsung merusak batas lapisan. `AsyncLocalStorage` menyediakannya tanpa mengubah tanda tangan fungsi mana pun.',
      ),

      h2('Yang wajib dan haram di log'),
      code(
        'js',
        `
        export const log = pino({
          level: env.LOG_LEVEL,
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'password', '*.password', '*.kataSandi',
              'token', '*.token', '*.refreshToken',
              '*.kartuKredit',
            ],
            censor: '[DISENSOR]',
          },
        });
        `,
      ),
      callout(
        'danger',
        '`redact` hanya menutup jalur yang kamu sebutkan',
        'Field bernama lain — `secret`, `apiKey`, `pin`, `nik` — tetap lolos. Aturan utamanya tidak berubah: **jangan pernah mencatat seluruh request body**. Catat field yang kamu pilih sadar. Log diakses lebih banyak orang daripada database dan disimpan bertahun-tahun.',
      ),

      h2('Health check yang jujur'),
      code(
        'js',
        `
        // Liveness: apakah proses ini masih hidup? Harus SANGAT ringan.
        // Kalau ini gagal, orchestrator akan me-restart proses.
        app.get('/health/live', (req, res) => res.json({ status: 'ok' }));

        // Readiness: apakah siap menerima trafik?
        app.get('/health/ready', async (req, res) => {
          const cek = { database: false, redis: false };

          try {
            await prisma.$queryRaw\`SELECT 1\`;
            cek.database = true;
          } catch { /* biarkan false */ }

          try {
            await redis.ping();
            cek.redis = true;
          } catch { /* biarkan false */ }

          // Redis untuk cache -> boleh mati tanpa membuat layanan tidak siap.
          const siap = cek.database;

          res.status(siap ? 200 : 503).json({ status: siap ? 'siap' : 'belum siap', cek });
        });
        `,
      ),
      callout(
        'danger',
        'Health check yang selalu mengembalikan `200` lebih buruk daripada tidak ada',
        'Ia meyakinkan orchestrator bahwa instance yang databasenya putus masih sehat — sehingga trafik terus dikirim ke sana. Health check harus benar-benar memeriksa dependensi yang menentukan, dan membedakan mana yang fatal dari mana yang hanya menurunkan kualitas.',
      ),
      callout(
        'warning',
        'Jangan bocorkan detail internal lewat health check',
        'Endpoint kesehatan sering dibiarkan publik. Jangan sertakan versi library, host database, atau pesan error mentah di dalamnya — itu memberi peta gratis kepada penyerang. Kalau perlu detail, lindungi endpoint-nya dengan autentikasi.',
      ),

      h2('Metrik'),
      code(
        'js',
        `
        import { Counter, Histogram, register } from 'prom-client';

        const permintaan = new Counter({
          name: 'http_requests_total',
          help: 'Jumlah permintaan HTTP',
          // Label harus berkardinalitas RENDAH.
          labelNames: ['method', 'route', 'status'],
        });

        const durasi = new Histogram({
          name: 'http_request_duration_seconds',
          help: 'Durasi permintaan',
          labelNames: ['method', 'route'],
          buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
        });

        // Endpoint metrik JANGAN dibiarkan publik.
        app.get('/metrics', autentikasiInternal, async (req, res) => {
          res.set('Content-Type', register.contentType);
          res.end(await register.metrics());
        });
        `,
      ),
      callout(
        'danger',
        'Jangan pakai URL mentah sebagai label metrik',
        '`/api/catatan/42` dan `/api/catatan/43` akan menjadi dua seri berbeda. Dengan ribuan id, sistem metrikmu meledak — ini disebut cardinality explosion, dan ia bisa menjatuhkan Prometheus. Pakai **pola rute** (`/api/catatan/:id`), bukan URL sebenarnya.',
      ),

      h2('Apa yang layak dipantau dan diberi alert'),
      ul(
        'Tingkat error `5xx` — lonjakan berarti ada yang rusak.',
        'Latensi p95 dan p99 — rata-rata menyembunyikan pengalaman terburuk.',
        'Kegagalan autentikasi beruntun — indikasi serangan penebakan.',
        'Lonjakan penolakan otorisasi — seseorang sedang memetakan apa yang bisa disentuh.',
        'Panjang antrean job dan jumlah yang gagal.',
        'Pemakaian pool koneksi database — mendekati batas berarti akan menggantung.',
      ),
      callout(
        'tip',
        'Log tanpa alert adalah arsip, bukan deteksi',
        'Ini kegagalan nomor sembilan di OWASP Top 10 dan yang paling sering dianggap sudah beres. Mengumpulkan log itu langkah pertama; yang membuatnya berguna adalah ada yang memberitahumu **saat sedang terjadi**, bukan saat kamu kebetulan membacanya minggu depan.',
      ),
      references(
        {
          label: 'AsyncLocalStorage',
          href: 'https://nodejs.org/api/async_context.html#class-asynclocalstorage',
          source: 'Node.js',
          note: 'Menyimpan konteks per permintaan tanpa mengopernya ke setiap fungsi.',
        },
        {
          label: 'OWASP Top 10 — Security Logging and Monitoring Failures',
          href: 'https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/',
          source: 'OWASP',
          note: 'Kategori yang menjelaskan kenapa log tanpa alert dihitung sebagai kegagalan.',
        },
        {
          label: 'Logging Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Peristiwa yang wajib dicatat, dan daftar tegas yang tidak boleh masuk log.',
        },
        {
          label: 'process.hrtime.bigint()',
          href: 'https://nodejs.org/api/process.html#processhrtimebigint',
          source: 'Node.js',
          note: 'Pengukur durasi beresolusi tinggi yang dipakai mencatat latensi permintaan.',
        },
      ),
    ],
  ),

  written(
    'typescript-express',
    'TypeScript di Express',
    11,
    'Menutup celah tipe yang paling sering menjadi bug runtime.',
    [
      terms(
        {
          term: 'strict',
          meaning:
            'Sekumpulan opsi TypeScript yang dinyalakan sekaligus — termasuk `strictNullChecks` yang membedakan `T` dari `T | null`. Tanpa `strict`, TypeScript memberi rasa aman tanpa jaminan yang sepadan.',
        },
        {
          term: 'noUncheckedIndexedAccess',
          meaning:
            'Membuat `arr[0]` bertipe `T | undefined`, bukan `T` — karena array **bisa kosong**. Ia menutup persis kelas bug yang muncul sebagai `Cannot read property of undefined` di produksi. Project ini memakainya.',
        },
        {
          term: 'verbatimModuleSyntax',
          meaning:
            'Memaksa impor tipe ditulis eksplisit dengan `import type`. Ia menghilangkan kebingungan tentang impor mana yang tersisa saat runtime — dan itu penting di Node, yang tidak punya bundler untuk merapikannya.',
        },
        {
          term: 'declaration merging',
          meaning:
            'Mekanisme TypeScript untuk **menambahkan properti** ke antarmuka yang sudah ada — dipakai memperluas `Express.Request` dengan `id`, `log`, dan `pengguna`.',
        },
        {
          term: 'pengguna sengaja opsional',
          meaning:
            'Keputusan desain yang penting. Menandainya wajib membuat TypeScript **diam** pada rute yang tidak memakai middleware auth — dan di situlah bug keamanan bersembunyi. Dengan opsional, setiap pembacaan memaksamu membuktikan autentikasi memang berjalan.',
        },
        {
          term: 'type narrowing lewat pembungkus',
          meaning:
            'Pola `wajibAuth(handler)` yang memeriksa sekali lalu **menyempitkan tipenya**. Di dalam handler, `req.pengguna` dijamin ada — tanpa `!` dan tanpa pengecekan ulang yang bisa terlewat.',
        },
        {
          term: 'z.infer',
          meaning:
            'Menurunkan tipe TypeScript **dari skema Zod**. Menulis tipe terpisah berarti keduanya bisa menyimpang tanpa ada yang memberi tahu; `z.infer` membuat itu **tidak mungkin**.',
        },
        {
          term: 'generic pada middleware',
          meaning:
            'Bentuk `validasiBody<T extends z.ZodTypeAny>(skema: T)` yang membawa tipe skema sampai ke handler. Tanpa generic, `req.body` setelah validasi tetap `any` — dan seluruh manfaat validasinya hilang di lapisan tipe.',
        },
        {
          term: 'tipe bukan pengganti validasi',
          meaning:
            'TypeScript hilang saat runtime. `req.body as BuatCatatanInput` **tidak memeriksa apa pun** — ia hanya membuat compiler diam. Yang memeriksa isinya tetap skema validasi; tipe hanya memastikan kodemu konsisten dengan hasilnya.',
        },
      ),

      h2('Menyiapkan'),
      code(
        'json',
        `
        {
          "compilerOptions": {
            "target": "ES2023",
            "module": "NodeNext",
            "moduleResolution": "NodeNext",
            "strict": true,
            "noUncheckedIndexedAccess": true,
            "verbatimModuleSyntax": true,
            "outDir": "dist",
            "sourceMap": true
          },
          "include": ["src"]
        }
        `,
        { filename: 'tsconfig.json' },
      ),
      callout(
        'tip',
        '`noUncheckedIndexedAccess` menutup kelas bug yang nyata',
        'Tanpa itu, `arr[0]` bertipe `T` — padahal array bisa kosong. Dengan itu, tipenya `T | undefined`, dan TypeScript memaksamu menanganinya. Ini persis kelas bug yang muncul sebagai `Cannot read property of undefined` di produksi. Project ini memakainya.',
      ),

      h2('Memperluas tipe `Request`'),
      code(
        'ts',
        `
        // src/types/express.d.ts
        import type { Logger } from 'pino';

        declare global {
          namespace Express {
            interface Request {
              id: string;
              log: Logger;
              pengguna?: { id: bigint; peran: 'pengguna' | 'editor' | 'admin' };
              kueriTervalidasi?: unknown;
            }
          }
        }

        export {};
        `,
      ),
      callout(
        'warning',
        '`pengguna` sengaja dibuat opsional',
        'Menandainya wajib akan membuat TypeScript diam pada rute yang **tidak** memakai middleware auth — dan di situlah bug keamanan bersembunyi. Dengan opsional, setiap pembacaan memaksamu membuktikan bahwa autentikasi memang berjalan.',
      ),

      h2('Handler yang menjamin autentikasi lewat tipe'),
      code(
        'ts',
        `
        // Tipe permintaan yang PASTI sudah terautentikasi
        type RequestTerautentikasi = Request & {
          pengguna: NonNullable<Request['pengguna']>;
        };

        // Pembungkus yang membuktikannya sekali, lalu menyempitkan tipenya
        export function wajibAuth(
          handler: (req: RequestTerautentikasi, res: Response) => Promise<void>,
        ) {
          return async (req: Request, res: Response, next: NextFunction) => {
            if (req.pengguna === undefined) {
              return res.status(401).json({ error: { kode: 'TIDAK_TERAUTENTIKASI' } });
            }
            try {
              await handler(req as RequestTerautentikasi, res);
            } catch (err) {
              next(err);
            }
          };
        }

        // Di dalam handler, req.pengguna dijamin ada — tanpa '!' dan tanpa pengecekan ulang.
        router.get('/', wajibAuth(async (req, res) => {
          const catatan = await layanan.daftar(req.pengguna.id);
          res.json({ data: catatan });
        }));
        `,
      ),

      h2('Tipe dari skema validasi'),
      code(
        'ts',
        `
        export const SkemaBuatCatatan = z.object({
          judul: z.string().trim().min(1).max(200),
          isi: z.string().trim().min(1).max(10_000),
        }).strict();

        // Tipe DITURUNKAN dari skema — tidak mungkin berbeda darinya.
        export type BuatCatatanInput = z.infer<typeof SkemaBuatCatatan>;
        `,
      ),
      p(
        'Menulis tipe terpisah dari skema berarti keduanya bisa menyimpang tanpa ada yang memberi tahu. `z.infer` membuat itu tidak mungkin.',
      ),

      h2('Middleware validasi yang bertipe'),
      code(
        'ts',
        `
        export function validasiBody<T extends z.ZodTypeAny>(skema: T) {
          return (req: Request, res: Response, next: NextFunction) => {
            const hasil = skema.safeParse(req.body);

            if (!hasil.success) {
              return next(new KesalahanValidasi(ambilField(hasil.error)));
            }

            // Setelah baris ini, req.body sesuai skema
            req.body = hasil.data as z.infer<T>;
            next();
          };
        }
        `,
      ),

      h2('Jangan pakai `any` untuk error'),
      code(
        'ts',
        `
        // TypeScript memberi tipe 'unknown' pada error — itu benar,
        // karena apa pun bisa dilempar di JavaScript.
        try {
          await sesuatu();
        } catch (err) {
          // Persempit sebelum dipakai
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            throw new KesalahanKonflik('Data sudah ada');
          }
          if (err instanceof Error) {
            log.error({ err }, err.message);
          }
          throw err;
        }
        `,
      ),

      h2('Membangun'),
      code(
        'json',
        `
        {
          "scripts": {
            "dev": "tsx watch src/server.ts",
            "build": "tsc",
            "start": "node dist/server.js",
            "type-check": "tsc --noEmit",
            "test": "vitest run"
          }
        }
        `,
      ),
      callout(
        'tip',
        'Jalankan `type-check` di CI, terpisah dari build',
        'Alat seperti `tsx` dan `esbuild` **menghapus** tipe tanpa memeriksanya — jadi kode yang tidak lolos type-check tetap berjalan di pengembangan. Tanpa langkah pemeriksaan terpisah, error tipe baru ketahuan saat build produksi, atau tidak sama sekali.',
      ),
      references(
        {
          label: 'TypeScript — tsconfig strict options',
          href: 'https://www.typescriptlang.org/tsconfig/#strict',
          source: 'TypeScript',
          note: 'Opsi yang dinyalakan `strict`, termasuk `strictNullChecks`.',
        },
        {
          label: 'noUncheckedIndexedAccess',
          href: 'https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess',
          source: 'TypeScript',
          note: 'Opsi yang membuat akses index bertipe `T | undefined` — dipakai project ini.',
        },
        {
          label: 'Declaration Merging',
          href: 'https://www.typescriptlang.org/docs/handbook/declaration-merging.html',
          source: 'TypeScript',
          note: 'Mekanisme yang dipakai memperluas `Express.Request`.',
        },
        {
          label: 'Zod — Type inference',
          href: 'https://zod.dev/basics',
          source: 'Zod',
          note: '`z.infer` yang menurunkan tipe dari skema, bukan menuliskannya dua kali.',
        },
      ),
    ],
  ),

  written(
    'praktik-api-blog-express',
    'Praktik: API blog lengkap beserta testnya',
    15,
    'Menyatukan seluruh bab menjadi satu API produksi.',
    [
      p(
        'Bangun API blog yang memakai setiap konsep bab ini: arsitektur berlapis, Prisma, auth dengan pencabutan, antrean, cache, dan tes yang benar-benar menangkap bug.',
      ),

      terms(
        {
          term: 'API produksi',
          meaning:
            'Bukan sekadar "berjalan". Ia punya arsitektur berlapis yang bisa diuji, auth yang **bisa dicabut**, batas di setiap jalur masuk, pekerjaan lambat di antrean, dan tes yang menangkap bug — bukan yang sekadar hijau.',
        },
        {
          term: 'endpoint publik vs terautentikasi',
          meaning:
            'Pembagian yang harus **eksplisit** di daftar rute. `GET /api/artikel` publik dan boleh di-cache; `POST /api/artikel` butuh identitas. Rute yang tidak jelas masuk kelompok mana adalah rute yang penjagaannya belum diputuskan.',
        },
        {
          term: 'pemilik atau admin',
          meaning:
            'Aturan otorisasi yang menggabungkan dua lapisan: **kepemilikan** (baris ini milikmu) dan **peran** (kamu admin). Keduanya diperiksa di service, dan kepemilikannya ikut lagi di query — pertahanan berlapis.',
        },
        {
          term: 'izin per aksi',
          meaning:
            'Perhatikan `artikel.terbitkan` pada endpoint terbitkan. Menerbitkan bukan sekadar mengubah — ia aksi tersendiri dengan izin tersendiri, dan itulah kenapa ia jadi sub-resource, bukan field pada `PATCH`.',
        },
        {
          term: 'rate limit berbeda per endpoint',
          meaning:
            'Komentar dibatasi lebih ketat daripada pembacaan artikel. Satu batas untuk semuanya selalu salah di salah satu ujung — dan endpoint yang menulis hampir selalu butuh batas yang lebih ketat.',
        },
        {
          term: 'cache pada endpoint publik',
          meaning:
            'Hanya endpoint **publik** yang boleh di-cache bersama. `GET /api/artikel` boleh; apa pun di balik autentikasi tidak — kecuali `private` dengan kunci yang memuat id pengguna.',
        },
        {
          term: 'ETag pada detail',
          meaning:
            'Dipasang pada `GET /api/artikel/:slug` karena isinya besar dan jarang berubah. Klien yang sudah punya versinya menerima `304` tanpa body — penghematan yang terasa di jaringan lambat.',
        },
        {
          term: 'tes sebagai kriteria selesai',
          meaning:
            'Latihan ini tidak selesai saat endpoint-nya berjalan, melainkan saat **tesnya membuktikan** yang seharusnya tidak bisa memang tidak bisa: pengguna lain ditolak, `penulisId` dari klien diabaikan, dan jumlah query tidak tumbuh mengikuti jumlah baris.',
        },
      ),

      h2('Cakupan'),
      code(
        'text',
        `
        POST   /api/auth/daftar
        POST   /api/auth/masuk
        POST   /api/auth/refresh
        POST   /api/auth/keluar
        POST   /api/auth/keluar-semua

        GET    /api/artikel                 publik, hanya yang terbit, cache 60s
        GET    /api/artikel/:slug           publik, ETag
        POST   /api/artikel                 penulis
        PATCH  /api/artikel/:id             pemilik atau admin
        DELETE /api/artikel/:id             pemilik atau admin
        POST   /api/artikel/:id/terbitkan   pemilik, butuh izin artikel.terbitkan

        GET    /api/artikel/:id/komentar
        POST   /api/artikel/:id/komentar    terautentikasi, rate limit ketat

        POST   /api/ekspor                  202 + job id
        GET    /api/ekspor/:jobId           status, di-scope ke pemilik
        `,
      ),

      h2('Struktur'),
      code(
        'text',
        `
        src/
        ├── server.ts              listen + graceful shutdown
        ├── app.ts                 rakit middleware & router
        ├── container.ts           composition root
        ├── config/env.ts          validasi environment
        ├── lib/{db,redis,log,errors}.ts
        ├── middleware/{auth,validasi,error,pencatat,batas}.ts
        ├── routes/{auth,artikel,komentar,ekspor}.ts
        ├── controllers/
        ├── services/
        ├── repositories/
        ├── schemas/
        ├── queue/{antrean,pekerja}.ts
        └── test/
            ├── setup.ts
            ├── bantuan.ts         factory untuk data uji
            └── *.test.ts
        `,
      ),

      h2('Langkah pengerjaan'),
      steps(
        {
          title: '1. Fondasi sebelum fitur',
          body: 'Skema Prisma, `config/env.ts` yang gagal keras, `lib/log.ts` dengan redact, dan `lib/errors.ts`. Uji dengan menghapus satu variabel environment — aplikasi harus menolak menyala dengan pesan yang menyebut variabelnya.',
        },
        {
          title: '2. Kerangka keamanan',
          body: 'helmet, CORS dengan allow-list dari environment, batas body, rate limit berjenjang, `trust proxy` diberi angka. Verifikasi dengan `curl -I` pada server yang benar-benar berjalan.',
        },
        {
          title: '3. Auth lengkap dengan pencabutan',
          body: 'Pasangan token, rotasi refresh dengan deteksi pemakaian ulang, `tokenVersi` untuk pencabutan massal. Uji: pakai refresh token yang sudah dirotasi — seluruh keluarga harus tercabut.',
        },
        {
          title: '4. Sumber daya artikel',
          body: 'Repository dengan scope kepemilikan di **setiap** query, service tanpa `res`, controller tipis, skema `.strict()`. Endpoint publik hanya menampilkan yang berstatus terbit.',
        },
        {
          title: '5. Cache dan ETag',
          body: 'Cache daftar artikel publik 60 detik dengan kunci berversi; ETag pada detail artikel. Pastikan endpoint privat memakai `Cache-Control: no-store`.',
        },
        {
          title: '6. Antrean',
          body: 'Ekspor sebagai job dengan `202 Accepted`; handler idempoten dengan klaim status atomik. Status job di-scope ke pemiliknya.',
        },
        {
          title: '7. Observability',
          body: 'Id korelasi di setiap log dan respons, `/health/live` dan `/health/ready` yang jujur, metrik dengan label berpola rute.',
        },
        {
          title: '8. Tes yang menangkap bug',
          body: 'Mulai dari tes otorisasi negatif dan mass assignment — bukan dari jalur sukses. Tambahkan tes penghitung query untuk N+1.',
        },
      ),

      h2('Tes minimum yang harus ada'),
      code(
        'ts',
        `
        // Otorisasi
        it('menolak akses artikel milik orang lain untuk PATCH dan DELETE');
        it('mengabaikan penulisId yang dikirim klien saat membuat');
        it('menolak terbitkan tanpa izin artikel.terbitkan');
        it('menyembunyikan artikel draf dari endpoint publik');

        // Auth
        it('mencabut seluruh keluarga token saat refresh token dipakai ulang');
        it('menolak token setelah keluar-semua');
        it('menolak token setelah ganti password');
        it('memberi pesan yang sama untuk email tidak ada dan password salah');

        // Batas & validasi
        it('membatasi per_hal ke maksimum 100');
        it('menolak field asing karena skema strict');
        it('menjawab 400 untuk JSON rusak, bukan 500');
        it('menjawab 413 untuk body melebihi batas');

        // Performa
        it('tidak menjalankan query per baris pada daftar artikel');

        // Job
        it('tidak memproses job ekspor dua kali');
        it('menolak membaca status job milik pengguna lain');
        `,
      ),
      callout(
        'tip',
        'Tulis tes otorisasi negatif lebih dulu',
        'Tes jalur sukses akan tetap ditulis — ia dibutuhkan supaya fiturnya bisa dipakai. Tes yang membuktikan sesuatu **tidak bisa** dilakukan adalah yang mudah dilewati, dan justru yang menangkap kelas bug paling mahal.',
      ),

      h2('Kriteria selesai'),
      code(
        'bash',
        `
        npm run type-check       # 0 error
        npm run lint             # 0
        npm run test             # semua lulus, termasuk tes negatif
        npm audit                # 0 kerentanan tinggi
        npm run build && npm start
        curl -sI localhost:3000/health/ready    # baca headernya
        `,
      ),
      p(
        'Baris terakhir penting: konfigurasi keamanan yang benar tapi tidak diterapkan adalah kegagalan yang paling mudah terlewat. Periksa pada server yang berjalan, bukan dengan membaca berkas konfigurasi.',
      ),

      divider,

      checklist(
        'bi2-praktik',
        'Checklist praktik bab ini',
        'Aplikasi menolak menyala kalau ada variabel environment yang hilang atau tidak valid',
        'Ketergantungan dirakit di satu composition root; service menerimanya lewat parameter',
        'Tidak ada `res.` di dalam folder `services/`',
        'Setiap query Prisma yang menyentuh milik pengguna menyertakan scope pemiliknya',
        '`select` dipakai, bukan `include` — hash password tidak mungkin ikut terbawa',
        'Refresh token dirotasi, disimpan sebagai hash, dan pemakaian ulang mencabut satu keluarga',
        'Ganti password dan keluar-semua benar-benar membatalkan token lama',
        '`trust proxy` diberi angka; CORS memakai allow-list persis dari environment',
        'Rate limit memakai penyimpanan bersama, bukan memori proses',
        'Unggahan diverifikasi dari isi, dinamai server, dan disajikan dengan `attachment`',
        'Job idempoten dengan klaim atomik; ada batas percobaan dan tujuan akhir',
        'Cache punya TTL, kuncinya berversi dan menyertakan identitas untuk data privat',
        'Redis mati tidak menjatuhkan aplikasi',
        'Ada tes otorisasi negatif untuk setiap sumber daya bermilik',
        'Ada tes yang menghitung query untuk mencegah N+1 kembali',
        '`/health/ready` benar-benar memeriksa database dan tidak membocorkan detail internal',
        'Log tidak memuat token, password, atau header `Authorization`',
      ),

      references(
        {
          label: 'Express — Production Best Practices',
          href: 'https://expressjs.com/en/advanced/best-practice-performance.html',
          source: 'Express',
          note: 'Daftar hal yang harus benar sebelum aplikasi Express dijalankan di produksi.',
        },
        {
          label: 'Prisma — Deployment & connection management',
          href: 'https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections',
          source: 'Prisma',
          note: 'Ukuran pool dan perilaku koneksi yang menentukan di lingkungan produksi.',
        },
        {
          label: 'BullMQ — Guide',
          href: 'https://docs.bullmq.io/guide/introduction',
          source: 'BullMQ',
          note: 'Antrean yang dipakai memindahkan pekerjaan lambat pada latihan ini.',
        },
        {
          label: 'REST Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Checklist keamanan yang dipetakan langsung ke daftar periksa di atas.',
        },
      ),
    ],
  ),
];
