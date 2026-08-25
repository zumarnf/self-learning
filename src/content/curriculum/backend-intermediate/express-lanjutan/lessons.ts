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
            'Menerima ketergantungan **dari luar** alih-alih mengimpornya sendiri. Bab 3.8 menyusun folder, sedangkan sub-bab ini menyelesaikan bagian yang tertinggal, yaitu bagaimana lapisan itu saling mendapatkan ketergantungannya, dan kenapa itu menentukan apakah kodemu bisa diuji.',
        },
        {
          term: 'impor langsung mengikat mati',
          meaning:
            'Service yang menulis `import { pool }` **wajib** punya database berjalan untuk bisa diuji. Tesnya jadi lambat, dan unhappy path database seperti timeout atau koneksi putus tidak bisa disimulasikan sama sekali.',
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
          notes: ['Tes lambat', 'Tidak bisa menguji unhappy path database'],
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
          notes: ['Tes cepat dan deterministik', 'Unhappy path bisa disimulasikan'],
        },
      ),
      p(
        'Perbedaannya ada di baris `import` yang **hilang** dari kolom kanan. Pada kolom kiri, `services/catatan.js` menyebut `../lib/db.js` secara langsung, dan itu berarti berkas ini tidak bisa dimuat tanpa ikut memuat modul database beserta koneksinya. Pada kolom kanan, service tidak tahu database itu ada — ia hanya tahu ada sesuatu bernama `repo` yang punya method `cariMilikPengguna`.',
      ),
      p(
        'Perhatikan bentuknya berubah dari fungsi biasa menjadi **fungsi yang mengembalikan objek** (`buatLayananCatatan`). Itulah mekanismenya: ketergantungan diterima sekali saat perakitan, lalu dipakai oleh semua method di dalamnya. Di JavaScript ini sudah cukup — tidak perlu container DI seperti di Laravel, karena closure sudah melakukan pekerjaan yang sama.',
      ),
      p(
        'Catatan "unhappy path bisa disimulasikan" adalah keuntungan yang paling sering diremehkan. Dengan kolom kiri, menguji "apa yang terjadi kalau database timeout" berarti benar-benar membuat database timeout — sulit, lambat, dan tidak konsisten. Dengan kolom kanan, kamu cukup mengoper `repo` yang method-nya melempar, dan unhappy path itu teruji dalam milidetik. Ini penerapan langsung "uji jalur yang tidak bahagia" yang jadi gerbang keras di seluruh kurikulum ini.',
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
      p(
        'Perhatikan **semua** pemanggilan `new` dan semua perakitan berkumpul di `container.js`, tanpa satu pun di service maupun repository. Itulah arti composition root, yaitu satu tempat yang tahu bagaimana bagian-bagiannya disambung, sementara sisa kode hanya menerima apa yang ia butuhkan. Urutan di dalamnya mengikuti arah ketergantungan, yaitu `pool` dulu, lalu repo yang butuh pool, lalu service yang butuh repo.',
      ),
      p(
        'Tiga opsi pada `Pool` adalah pertahanan yang mudah dilupakan sampai ia dibutuhkan. `max: 10` membatasi jumlah koneksi — bukan pembatasan sewenang-wenang, melainkan pengakuan bahwa database punya batas koneksinya sendiri, dan aplikasi yang membuka tanpa batas akan menjatuhkannya. `connectionTimeoutMillis` menentukan berapa lama menunggu giliran; tanpanya, permintaan yang tidak kebagian koneksi menggantung **selamanya**, dan gejalanya muncul sebagai "seluruh API tersendat" yang penyebabnya sulit ditemukan. `idleTimeoutMillis` menutup koneksi menganggur supaya tidak menahan sumber daya di sisi database.',
      ),
      p(
        'Tiga baris di `server.js` memperlihatkan urutan yang menyatukan semuanya: rakit container, bangun app dari container, baru buka port. Karena `buatApp` menerima container sebagai argumen, tes bisa membangun app dengan container **berisi objek palsu** — tanpa database, tanpa jaringan, dan tanpa mengubah satu baris pun kode aplikasi.',
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
      p(
        'Kolom kanan menyelesaikannya dengan `select` **bersarang**: relasi `penulis` diminta di dalam permintaan yang sama, bukan diakses belakangan per baris. Prisma lalu mengumpulkan seluruh `penulisId` dan mengambil semua penulis dalam satu query tambahan — itulah asal angka "2 query, berapa pun jumlah barisnya". Ini prinsip yang sama dengan `with()` di Eloquent, hanya beda tata bahasanya.',
      ),
      p(
        'Perhatikan `select` juga menyebut kolom mana yang diambil, dan itu bonus yang penting: `{ id: true, nama: true }` pada penulis berarti `email` dan `kataSandiHash` **tidak pernah** ikut terbawa. Kalau kamu memakai `include` alih-alih `select`, seluruh kolom penulis ikut — termasuk yang tidak boleh keluar dari server. Untuk data yang menghadap API, `select` selalu pilihan yang lebih aman.',
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
      p(
        '`_count` diterjemahkan Prisma menjadi subquery penghitung, bukan pemuatan baris. Bedanya besar di halaman daftar: untuk menampilkan "42 komentar" di bawah setiap judul, memuat keempat puluh dua komentar itu berarti menarik ribuan baris ke memori hanya untuk dihitung lalu dibuang. Ini padanan `withCount` di Eloquent, dan alasan memakainya sama persis.',
      ),
      p(
        'Perhatikan hasilnya diakses lewat `catatan[0]._count.komentar` — bersarang di dalam objek `_count`, bukan sebagai `komentarCount` di tingkat atas. Perhatikan pula ia hanya bisa dipakai di dalam `select` atau `include`; menuliskannya sebagai kolom biasa akan ditolak, karena `_count` memang bukan kolom melainkan perhitungan.',
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
      p(
        'Ketiga kata kunci ini menjawab pertanyaan yang berbeda tentang **kumpulan** relasi, dan menerjemahkannya ke bahasa sehari-hari membuatnya mudah diingat: `some` berarti "ada minimal satu yang cocok", `every` berarti "semuanya cocok", `none` berarti "tidak ada satu pun". Ketiganya padanan `whereHas` dan `doesntHave` di Eloquent, dan sama-sama menjadi subquery `EXISTS` di SQL — jadi penyaringannya dikerjakan database, bukan dengan memuat semua catatan lalu membuangnya di JavaScript.',
      ),
      p(
        'Perhatikan `none: {}` memakai objek **kosong**, dan itu memang benar: syarat kosong berarti "tidak ada komentar apa pun", tanpa kriteria tambahan. Kalau kamu menulis `none: { disetujui: false }`, artinya berubah menjadi "tidak ada komentar yang belum disetujui" — yang juga akan mencakup catatan tanpa komentar sama sekali. Perbedaan sehalus itu yang membuat `every` punya jebakan yang dijelaskan tepat di bawah.',
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
      p(
        'Komentar pertama menyebut hal yang paling penting: Prisma membungkus nested write seperti ini dalam **satu transaksi otomatis**. Artinya kalau pembuatan salah satu tag gagal, artikelnya juga tidak jadi dibuat — tidak ada keadaan setengah jadi berupa artikel tanpa tag yang seharusnya melekat. Kamu tidak perlu menulis `BEGIN`/`COMMIT` sendiri untuk kasus ini.',
      ),
      p(
        '`connectOrCreate` menyelesaikan masalah yang biasanya butuh beberapa langkah: untuk setiap nama tag, cari yang cocok dengan `where`, dan **hanya kalau tidak ketemu** buat baru dari `create`. Tanpa itu kamu harus mengambil tag yang sudah ada, membandingkannya di JavaScript, lalu membuat sisanya — tiga perjalanan ke database beserta celah balapan di antaranya, karena dua permintaan bersamaan bisa sama-sama menyimpulkan tag itu belum ada.',
      ),
      p(
        'Perhatikan `select` di akhir menentukan bentuk yang dikembalikan, dan tanpa itu Prisma mengembalikan seluruh kolom artikel — termasuk `isi` yang bisa puluhan ribu karakter, padahal pemanggilnya hanya butuh `id` dan `judul` untuk respons `201`.',
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
      p(
        '`skip: 1` di baris terakhir sering dikira kekeliruan, padahal ia keharusan. Prisma memperlakukan `cursor` sebagai **item yang ditunjuk**, bukan posisi setelahnya — jadi tanpa `skip: 1`, item terakhir halaman sebelumnya akan muncul lagi sebagai item pertama halaman berikutnya. Ini bug yang tampak seperti "kadang ada yang dobel" dan sangat mudah lolos ke produksi.',
      ),
      p(
        'Penyebaran bersyarat `...(cursor !== undefined && {...})` menangani permintaan **halaman pertama**, yang memang tidak membawa cursor. Menuliskan `cursor: { id: undefined }` akan membuat Prisma mengeluh, jadi keduanya harus benar-benar tidak ada — bukan ada dengan nilai kosong. Perhatikan pula `orderBy` menyebut **dua** kolom: `dibuatPada` sebagai kunci utama dan `id` sebagai pemecah seri, sesuai aturan urutan stabil dari sub-bab 1.5. Tanpa `id` di sana, cursor akan menunjuk posisi yang ambigu begitu ada dua baris dengan waktu yang sama.',
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
      p(
        'Kedua bentuk ini adalah SQL agregasi dari sub-bab 2.6 dalam bentuk Prisma. `aggregate` memampatkan seluruh baris yang lolos `where` menjadi **satu** hasil — `_count` dan `_max` di sini setara `COUNT(*)` dan `MAX(dibuat_pada)`. Perhatikan `_count: { _all: true }`: bentuk `_all` menghitung **baris**, sedangkan menyebut nama kolom akan menghitung baris yang kolomnya bukan `null`. Perbedaan `COUNT(*)` versus `COUNT(kolom)` yang sama, hanya dengan nama berbeda.',
      ),
      p(
        "`groupBy` menambahkan pengelompokan, sebab `by: ['penulisId']` menghasilkan satu baris per penulis alih-alih satu baris untuk seluruh tabel. Dan `having` menyaring **kelompok** setelah dihitung, yang di sini berarti hanya penulis dengan lebih dari lima catatan. Perhatikan pembagian tugas antara `where` dan `having` tetap sama seperti di SQL mentah, yaitu `where` membuang baris **sebelum** pengelompokan sedangkan `having` membuang kelompok **sesudahnya**. Saring sebanyak mungkin di `where`, karena baris yang sudah dibuang tidak perlu ikut dikelompokkan.",
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
      p(
        "Tes ini mengubah N+1 dari masalah performa yang tak terlihat menjadi sesuatu yang bisa **gagal**. `prisma.$on('query', ...)` memasang pendengar pada setiap query yang benar-benar dijalankan, sehingga jumlahnya bisa dihitung — bukan diperkirakan dari membaca kode.",
      ),
      p(
        'Baris `jumlahQuery.n = 0` tepat sebelum permintaan adalah detail yang menentukan. Tanpa pengaturan ulang itu, hitungannya sudah terisi oleh query dari `buatCatatan` yang menyiapkan lima puluh baris data — dan ambangnya akan terlampaui bahkan pada kode yang benar. Yang ingin diukur hanyalah query dari **satu permintaan HTTP**, bukan dari penyiapannya.',
      ),
      p(
        'Angka 50 pada penyiapan dan ambang `toBeLessThan(6)` bekerja berpasangan. Kalau ada N+1, jumlah query akan sekitar 51 — jauh di atas ambang, jadi kegagalannya tegas dan bukan kebetulan. Sebaliknya, menyiapkan hanya lima baris akan membuat tes ini hijau bahkan dengan N+1, karena enam query masih di bawah ambang. Aturannya: jumlah data uji harus **jauh lebih besar** dari ambang yang kamu pasang.',
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
      p(
        'Bentuk array ini yang paling sederhana: berikan daftar operasi, Prisma menjalankan semuanya dalam satu transaksi secara berurutan, dan mengembalikan hasilnya sebagai array yang bisa langsung dirusak-struktur. Kalau salah satu gagal, semuanya dibatalkan.',
      ),
      p(
        'Batasnya juga jelas dan menentukan kapan kamu harus pindah ke bentuk berikutnya, yaitu **operasi kedua tidak bisa memakai hasil operasi pertama**, karena seluruh array sudah harus tersusun sebelum satu pun dijalankan. Begitu kamu butuh `pesanan.id` yang baru lahir untuk membuat baris berikutnya, atau butuh memeriksa hasil sebelum memutuskan langkah selanjutnya, bentuk interaktif di bawah yang kamu perlukan.',
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
      p(
        'Callback ini menerima `tx` — sebuah klien Prisma yang **terikat pada satu koneksi** milik transaksi ini. Setiap operasi di dalamnya harus lewat `tx`, dan itulah yang diperingatkan di bawah: memanggil `prisma.sesuatu()` di sini akan memakai koneksi lain, sehingga operasinya berada **di luar** transaksi dan tidak ikut dibatalkan saat rollback.',
      ),
      p(
        'Perhatikan `updateMany` dipakai alih-alih `update`, dan itu disengaja. `update` mencari baris lalu mengubahnya, sedangkan `updateMany` dengan syarat `stok: { gte: item.jumlah }` menggabungkan **pemeriksaan dan pengurangan dalam satu operasi** yang tidak bisa disela — pola yang sama seperti `SET stok = stok - 1 WHERE stok > 0` di sub-bab 2.6. Karena itu hasilnya dibaca dari `hasil.count`: nilai `0` berarti tidak ada baris yang memenuhi syarat, alias stoknya sudah tidak cukup.',
      ),
      p(
        '`throw` di dalam callback adalah cara membatalkan transaksi di Prisma, sehingga tidak ada `rollback()` yang perlu dipanggil manual. Melempar `KesalahanStokHabis` membatalkan **seluruhnya**, termasuk pesanan dan item yang sudah sempat dibuat pada putaran sebelumnya. Dua opsi terakhir menutup kebocoran sumber daya, di mana `maxWait` membatasi berapa lama menunggu giliran koneksi dan `timeout` memutus transaksi yang berjalan terlalu lama. Tanpa keduanya, satu transaksi yang macet bisa menahan koneksi sampai pool habis.',
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
      p(
        'Aturannya sama seperti di sub-bab 2.9 dan berlaku apa pun ORM-nya, yaitu **jangan pernah menaruh panggilan jaringan di dalam transaksi**. Selama blok itu berjalan, baris yang disentuh terkunci, dan pada kolom kiri kunci itu bertahan selama pemanggilan email dan pembayaran berlangsung, yang berarti beberapa detik pada hari baik dan tak tentu saat pihak ketiganya bermasalah. Pada trafik ramai, antrean yang menunggu kunci itu menumpuk sampai pool koneksi habis.',
      ),
      p(
        'Ada alasan kedua yang sama pentingnya: `kirimEmail` **tidak bisa di-rollback**. Kalau transaksi gagal setelah emailnya terkirim, pelanggan sudah menerima kabar tentang pesanan yang di database tidak pernah ada.',
      ),
      p(
        'Perhatikan kolom kanan tidak sekadar memindahkan pemanggilan ke luar, tetapi menaruhnya di **antrean**. Bedanya penting, sebab kalau `kirimEmail` dipanggil langsung setelah commit lalu gagal, emailnya hilang tanpa jejak padahal pesanannya sudah tersimpan. Dengan antrean, pekerjaan itu punya percobaan ulang, backoff, dan tempat pembuangan akhir bagi yang tetap gagal, mekanisme yang dibahas di sub-bab BullMQ.',
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
      p(
        'Prisma memberi kode pada kegagalan yang sudah ia kenali, dan kode itulah yang kamu cabangkan — bukan isi pesannya. `P2002` berarti pelanggaran batasan `UNIQUE`, `P2025` berarti baris yang dicari tidak ada. Mencocokkan teks pesan alih-alih kode adalah kesalahan yang rapuh: pesannya berubah antar versi Prisma, dan cabangmu diam-diam berhenti bekerja tanpa satu pun error.',
      ),
      p(
        'Komentar di dalamnya menandai bagian yang paling mudah tergelincir. `err.message` untuk `P2002` berbunyi seperti *"Unique constraint failed on the fields: (`email`)"* — ia menyebut nama kolommu, dan pada beberapa kasus nama constraint beserta tabelnya. Meneruskannya ke klien berarti membocorkan struktur database, persis yang dilarang di sub-bab 1.4. Karena itu yang dilempar adalah error milikmu sendiri dengan pesan generik.',
      ),
      p(
        'Baris `throw err` di akhir sama pentingnya dengan cabang-cabang di atasnya: error yang **tidak** kamu kenali harus diteruskan apa adanya, bukan ditelan. Blok `catch` yang menangkap segalanya lalu diam mengubah kegagalan yang berisik menjadi kerusakan data yang senyap — dan itu jauh lebih mahal daripada error yang muncul di log.',
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
          term: 'token family',
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
          term: 'rotasi + reuse detection',
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
            'Pembagian yang disengaja. Refresh token disimpan di cookie `HttpOnly` ber-`path` sempit, sehingga tidak bisa dibaca JavaScript dan tidak ikut di setiap permintaan. Access token dikirim di header `Authorization`, sehingga tidak ikut otomatis dan karena itu tidak rawan CSRF.',
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
      p(
        'Komentar pada `tokenHash` menyebut keputusan terpenting di seluruh model ini, yaitu yang tersimpan adalah **hash**-nya dan bukan tokennya. Kalau tabel ini bocor, penyerang hanya mendapat hash yang tidak bisa dipakai untuk apa pun, alasan yang sama persis dengan menyimpan hash password. `@unique` di sana bukan sekadar index, sebab ia yang menjamin satu token tidak bisa terdaftar dua kali sekaligus mempercepat pencarian saat verifikasi.',
      ),
      p(
        '`keluargaId` adalah yang membuat deteksi pencurian mungkin. Setiap rotasi menghasilkan baris baru, tetapi seluruh rantai yang berasal dari **satu kali login** membawa `keluargaId` yang sama — jadi begitu ada token lama yang muncul kembali, satu perintah cukup untuk mencabut seluruh rantainya. Perhatikan `onDelete: Cascade` pada relasi ke `Pengguna`: menghapus akun otomatis membuang semua sesinya, tanpa perlu diingat.',
      ),
      p(
        '`userAgent` dan `ip` bersifat opsional (`String?`) dan tidak dipakai untuk keputusan keamanan, sebab keduanya untuk **halaman "perangkat yang aktif"** supaya pengguna bisa mengenali sesi yang bukan miliknya dan mencabutnya. Perhatikan panjang `ip` dibatasi 45 karakter, karena itu panjang maksimum alamat IPv6 dalam bentuk teks dan bukan angka sembarang. Tiga `@@index` di akhir masing-masing melayani satu query nyata, yaitu daftar sesi per pengguna, pencabutan sekeluarga, dan pembersihan terjadwal untuk yang sudah kedaluwarsa.',
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
      p(
        'Perhatikan kedua token dibuat dengan cara yang **sama sekali berbeda**, dan itu disengaja. Access token adalah JWT bertanda tangan yang bisa diverifikasi tanpa menyentuh database — itulah yang membuatnya murah dipakai di setiap permintaan. Refresh token hanya nilai acak 32 byte tanpa makna apa pun; ia harus dicari di database untuk diverifikasi, dan justru itu yang membuatnya **bisa dicabut** kapan saja.',
      ),
      p(
        'Klaim `ver: pengguna.tokenVersi` di payload adalah kunci pencabutan yang murah. Karena JWT tidak bisa ditarik kembali, satu-satunya cara membatalkannya adalah membandingkannya dengan sesuatu — dan menaikkan `tokenVersi` di baris pengguna membuat **semua** access token lamanya langsung ditolak pada verifikasi berikutnya, tanpa perlu menyimpan daftar token yang dicabut.',
      ),
      p(
        'Parameter `keluargaId = crypto.randomUUID()` memakai nilai bawaan, dan itu trik kecil yang rapi: pemanggilan saat **login** tidak menyebutnya sehingga rantai baru lahir, sedangkan pemanggilan saat **rotasi** meneruskan `keluargaId` lama sehingga rantainya berlanjut. Perhatikan pula `?.slice(0, 255)` pada user agent — string itu datang dari klien dan panjangnya tidak terbatas, jadi memotongnya sesuai lebar kolom mencegah kegagalan `INSERT` yang dipicu header yang sengaja dibuat panjang.',
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
      p(
        "Dua pemeriksaan berjalan berurutan di sini, dan keduanya perlu. `jwt.verify` membuktikan tokennya **asli dan belum kedaluwarsa** — dengan `algorithms: ['HS256']` yang wajib ditulis eksplisit, karena tanpanya token sendiri yang menentukan algoritma verifikasinya dan penyerang tinggal mengirim `alg: none`. Pemeriksaan kedua membuktikan tokennya **belum dicabut**, sesuatu yang tidak bisa dijawab tanda tangan.",
      ),
      p(
        'Perbandingan `payload.ver !== versiSekarang` inilah pencabutan itu. Karena versinya diambil dari cache (`cacheVersiToken`), biayanya satu pembacaan Redis, bukan query database — cukup murah untuk dijalankan di setiap permintaan. Menaikkan angka itu sekali membatalkan **seluruh** access token milik pengguna tersebut seketika, tanpa perlu menyimpan daftar token yang dicabut yang akan tumbuh tanpa batas.',
      ),
      p(
        'Perhatikan blok `catch` mengembalikan kode yang **sama persis** dengan penolakan di awal fungsi. Token kedaluwarsa, tanda tangan palsu, format rusak, header hilang — semuanya dijawab `TIDAK_TERAUTENTIKASI`. Membedakannya terdengar membantu, tetapi setiap perbedaan memberi penyerang satu petunjuk tentang seberapa dekat tebakannya. Detail sebenarnya tetap ada di log server.',
      ),
      callout(
        'tip',
        '`tokenVersi` adalah pencabutan termurah untuk JWT',
        'Deny-list menyimpan setiap token yang dicabut dan tumbuh tanpa batas. Satu integer per pengguna, di-cache di Redis, memberi pencabutan seketika untuk **semua** token pengguna itu dengan satu operasi `increment`. Yang tidak bisa ia lakukan: mencabut satu perangkat saja — untuk itu pakai tabel sesi refresh.',
      ),

      h2('Rotasi dengan reuse detection'),
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
      p(
        'Blok bertanda "INTI POLANYA" adalah alasan seluruh mekanisme ini ada. Pikirkan apa artinya token yang **sudah dicabut** muncul kembali. Token hanya dicabut setelah dipakai, jadi kemunculan keduanya berarti ada dua pihak yang memegangnya, yaitu pemilik sah dan pencurinya. Server tidak bisa tahu mana yang mana, jadi ia mengambil sikap paling aman dengan mencabut **seluruh keluarga** lewat `keluargaId`. Korban terpaksa masuk ulang, dan penyerang kehilangan akses sepenuhnya.',
      ),
      p(
        'Perhatikan `updateMany` menyaring `dicabutPada: null` — hanya token yang masih hidup yang perlu disentuh, dan itu menjaga stempel waktu pencabutan sebelumnya tetap utuh untuk penelusuran. `log.warn` di bawahnya mencatat `ip` beserta `keluargaId`, dan ini bukan sekadar catatan: lonjakan peristiwa ini adalah salah satu sinyal pembobolan yang paling jelas, dan ia layak memicu alert.',
      ),
      p(
        'Rotasinya dibungkus `$transaction` supaya pencabutan token lama dan penerbitan yang baru **terjadi bersama atau tidak sama sekali**. Tanpa itu, kegagalan di antara keduanya bisa meninggalkan pengguna tanpa token yang sah sama sekali — ia tercabut tetapi tidak menerima gantinya. Perhatikan pula `terbitkanPasangan` menerima `sesi.keluargaId` yang lama, sehingga rantainya berlanjut alih-alih memulai keluarga baru.',
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
      p(
        'Refresh token sengaja ditaruh di **cookie**, bukan dikirim ke JavaScript seperti access token — dan `httpOnly: true` adalah alasannya. Dengan itu, skrip apa pun yang berhasil berjalan di halamanmu lewat XSS tidak bisa membacanya. Access token boleh dipegang JavaScript karena umurnya hanya lima belas menit; refresh token berumur tiga puluh hari, jadi kebocorannya jauh lebih mahal.',
      ),
      p(
        "`sameSite: 'strict'` lebih ketat daripada `'lax'` yang biasa dipakai cookie sesi, dan di sini ia tepat: endpoint refresh tidak pernah perlu dipanggil dari navigasi lintas situs. Perhatikan `secure: env.isProduksi` dan bukan `true` mati — `localhost` tanpa HTTPS akan menolak cookie bertanda `Secure`, sehingga menuliskannya mati membuat login gagal di lingkungan pengembangan tanpa pesan yang jelas.",
      ),
      p(
        "`path: '/api/auth/refresh'` adalah pembatasan yang paling sering dilupakan. Tanpa itu, browser menyertakan refresh token pada **setiap** permintaan ke servermu — ratusan kali sehari, di setiap log akses, di setiap proxy yang dilewati. Dengan path sempit, ia hanya berjalan saat benar-benar dibutuhkan, dan permukaan kebocorannya menyusut drastis.",
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
          ['Terreuse detection', 'Seluruh token family'],
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
      p(
        'Tabel sesi bertambah satu baris setiap kali seseorang login **dan** setiap kali token dirotasi — pada aplikasi aktif, itu ribuan baris per hari yang sebagian besar sudah tidak berguna. Tanpa pembersihan, tabelnya tumbuh tanpa henti dan setiap pencarian token ikut melambat.',
      ),
      p(
        'Perhatikan syaratnya bukan "sudah kedaluwarsa", melainkan **kedaluwarsa lebih dari tujuh hari lalu**. Jeda itu disengaja: baris yang baru saja kedaluwarsa masih berguna untuk penelusuran — misalnya saat menyelidiki laporan "akun saya diakses orang lain", di mana kolom `ip` dan `userAgent` dari sesi lama justru yang paling menjelaskan. Jalankan ini sebagai job terjadwal, bukan di dalam permintaan pengguna.',
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
          note: 'Rotasi beserta reuse detection, langsung dari sumbernya.',
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
        app.use(pencatatPermintaan);        // 5. correlation id & log
        app.use('/api', batasUmum);         // 6. rate limit
        app.use('/api/auth', batasAuth);    // 7. rate limit lebih ketat
        // ... rute ...
        app.use(penanganError);             // terakhir, selalu
        `,
      ),
      p(
        'Komentar di baris pertama benar secara harfiah: urutan ini adalah rantai ketergantungan, bukan preferensi. `trust proxy` harus lebih dulu dari apa pun yang membaca IP klien — rate limiter di baris 6 dan 7 bergantung padanya, dan memasangnya belakangan berarti keduanya membaca IP proxy alih-alih IP asli, sehingga **seluruh trafik dihitung sebagai satu pemanggil**.',
      ),
      p(
        '`helmet` dan `cors` berada di atas parser body karena keduanya bekerja pada header dan permintaan preflight, sehingga keduanya harus menjawab sebelum ada usaha membaca isi permintaan. `express.json({ limit })` menyusul, dan letaknya sebelum rate limit disengaja karena batas ukuran menolak body raksasa **sebelum** servermu menghabiskan memori untuk menguraikannya. Pencatat permintaan di baris 5 harus di atas rate limit supaya permintaan yang **ditolak** limiter pun tetap tercatat, sebab kalau tidak, justru trafik mencurigakan yang hilang dari log.',
      ),
      p(
        'Dua baris rate limit terakhir memperlihatkan pola berjenjang: `/api` mendapat batas umum, lalu `/api/auth` mendapat batas kedua yang lebih ketat **di atasnya**. Karena `/api/auth` juga cocok dengan prefiks `/api`, keduanya berlaku sekaligus — dan yang lebih ketat yang efektif. Penampung error tetap paling akhir, karena ia menangkap kegagalan dari semua yang di atasnya.',
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
      p(
        'Helmet memasang belasan header sekaligus dengan nilai bawaan yang masuk akal; yang ditulis di sini hanyalah tiga yang biasanya perlu disesuaikan. `contentSecurityPolicy` adalah yang paling berdampak sekaligus paling mudah salah — `defaultSrc: ["\'self\'"]` berarti seluruh sumber daya hanya boleh dari domainmu sendiri, dan `objectSrc: ["\'none\'"]` menutup `<object>`/`<embed>` yang merupakan jalur pintas klasik untuk melewati CSP.',
      ),
      p(
        '`hsts` dengan `maxAge` satu tahun memerintahkan browser **selalu** memakai HTTPS untuk domain ini, bahkan kalau penggunanya mengetik `http://`. Opsi `preload` mendaftarkannya ke daftar bawaan browser sehingga perlindungannya berlaku sejak kunjungan pertama — tetapi perhatikan ini keputusan yang sulit dibatalkan: begitu masuk daftar preload, domainmu tidak bisa lagi melayani HTTP sama sekali, dan mengeluarkannya butuh waktu berbulan-bulan.',
      ),
      p(
        '`app.disable(\'x-powered-by\')` ditulis terpisah karena ia bukan pemasangan header melainkan **penghapusan**. Express secara bawaan mengumumkan dirinya lewat header itu, dan menyebutkan teknologi beserta versinya adalah pengintaian gratis bagi penyerang — ia langsung tahu kerentanan mana yang layak dicoba. Ini penerapan langsung aturan "jangan bocorkan versi atau detail implementasi" di `security.md`.',
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
      p(
        'Fungsi `origin` dipakai alih-alih daftar sederhana karena ia memberi kendali atas **kasus yang tidak punya origin**. Permintaan dari `curl`, dari server lain, atau dari aplikasi mobile tidak mengirim header `Origin` sama sekali — dan baris pertama memutuskan itu diizinkan. Perhatikan komentarnya: "putuskan sadar". Untuk API yang memang hanya melayani browser, menolaknya justru lebih tepat.',
      ),
      p(
        "Baris `ORIGIN_DIIZINKAN.includes(origin)` mencocokkan **persis** — bukan `startsWith`, bukan pencocokan pola. Bedanya menentukan: `startsWith('https://situsku.com')` juga akan meloloskan `https://situsku.com.penyerang.id`, domain yang sepenuhnya milik orang lain. Daftarnya sendiri datang dari environment, sehingga origin pengembangan (`localhost`) tidak pernah ikut ke konfigurasi produksi.",
      ),
      p(
        '`credentials: true` diperlukan agar cookie refresh ikut terkirim pada permintaan lintas origin, dan justru itu yang membuat pencocokan persis di atas jadi wajib — dengan kredensial menyala, origin yang salah lolos berarti situs lain bisa memanggil API-mu memakai sesi penggunamu. `allowedHeaders` menyebut `Idempotency-Key` karena header buatan sendiri **tidak** diizinkan secara bawaan; melewatkannya membuat permintaan gagal di tahap preflight dengan pesan yang membingungkan. Dan `maxAge: 86_400` menyuruh browser menyimpan hasil preflight sehari penuh, menghemat satu perjalanan `OPTIONS` di setiap permintaan.',
      ),
      callout(
        'danger',
        'Tiga kesalahan CORS yang membatalkan seluruh perlindungannya',
        '**(1)** `origin: true` memantulkan origin apa pun kembali, yang sama saja dengan tanpa kebijakan. **(2)** `origin: \'*\'` bersama `credentials: true` ditolak browser, dan sering "diperbaiki" dengan cara pertama. **(3)** `localhost` yang tertinggal di daftar produksi. Ingat juga bahwa **CORS adalah kontrol browser**, sehingga ia tidak menghalangi `curl` dan otorisasi tetap di server.',
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
      p(
        'Komentar pada `store` menandai keputusan yang paling sering keliru. `express-rate-limit` secara bawaan menyimpan hitungan di **memori proses**, dan itu diam-diam salah begitu aplikasimu berjalan lebih dari satu proses — masing-masing punya hitungannya sendiri, jadi batas 100 dengan empat proses efektif menjadi 400. Redis membuat hitungannya bersama, dan ia juga bertahan saat proses direstart.',
      ),
      p(
        'Tiga tingkat batasnya mencerminkan tiga jenis risiko yang berbeda. `batasUmum` (100 per menit) melindungi kapasitas secara umum. `batasAuth` jauh lebih ketat (10 per 15 menit) karena endpoint login adalah target penebakan password — dan `skipSuccessfulRequests: true` di sana penting: yang dihitung hanya percobaan **gagal**, sehingga pengguna sah yang berkali-kali login dari kantor yang sama tidak ikut terblokir. `batasMahal` (5 per menit) menjaga operasi yang tiap panggilannya memakan banyak sumber daya, seperti ekspor.',
      ),
      p(
        "`standardHeaders: 'draft-7'` mengirim sisa kuota lewat header baku `RateLimit-*`, sehingga klien yang tertib bisa mengatur diri alih-alih menabrak batas lalu bingung. `legacyHeaders: false` mematikan header lama `X-RateLimit-*` yang sudah usang — mengirim keduanya hanya menambah ukuran respons tanpa manfaat.",
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
      p(
        'Kedua parser butuh batasnya **masing-masing**, dan itulah alasan baris kedua ada. Memasang `limit` hanya pada `express.json()` menyisakan jalur `urlencoded` terbuka lebar — permintaan berformat form dengan body 500 MB tetap diterima, dan pertahanan yang kamu kira sudah terpasang ternyata hanya menutup separuh pintu.',
      ),
      p(
        'Komentar terakhir menunjuk hal yang sering keliru: batas ini **tidak** berlaku untuk unggahan berkas. Unggahan datang sebagai `multipart/form-data` yang ditangani middleware berbeda (Multer di sub-bab 2.7), dengan batasnya sendiri yang harus diatur terpisah. Jadi setiap jalur masuk data punya batas yang berdiri sendiri, dan satu yang terlewat cukup untuk membatalkan yang lain.',
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
      p(
        'Komentar pada `memoryStorage()` menjelaskan keputusan pertama, yaitu berkas ditahan **di memori** supaya bisa diperiksa sebelum menyentuh disk sama sekali. Alternatifnya, `diskStorage`, menulis dulu lalu memeriksa belakangan, dan di antara keduanya ada jendela waktu ketika berkas berbahaya sudah ada di sistem berkasmu. Batas 5 MB membuat penahanan di memori ini aman, sedangkan untuk unggahan berukuran ratusan megabita pola yang tepat adalah mengalirkannya langsung ke object storage.',
      ),
      p(
        'Empat opsi di `limits` menutup empat cara membebani server, dan tiga terakhir sering dilupakan. `fileSize` membatasi tiap berkas, tetapi tanpa `files: 5` seseorang bisa mengirim seribu berkas berukuran 5 MB dalam satu permintaan. `fields` dan `parts` menutup celah yang lebih halus: permintaan multipart berisi puluhan ribu field kosong tidak melanggar batas ukuran mana pun, tetapi tetap menghabiskan CPU untuk menguraikannya.',
      ),
      p(
        'Komentar di dalam `fileFilter` menandai batas kemampuannya, dan ini yang paling penting untuk dipahami, yaitu `file.mimetype` berasal dari header `Content-Type` yang **dikirim klien**. Penyerang cukup menuliskan `image/png` sambil mengirim isi apa pun. Jadi penyaring ini menahan kesalahan pengguna, misalnya orang yang tidak sengaja memilih berkas `.docx`, alih-alih menahan serangan. Pemeriksaan yang sesungguhnya ada di bagian berikutnya.',
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
      p(
        'Ini pemeriksaan yang tidak bisa dipalsukan, karena ia membaca **isi berkasnya sendiri**. Setiap format punya beberapa byte pertama yang khas — disebut *magic byte*: PNG selalu diawali `89 50 4E 47`, JPEG `FF D8 FF`, PDF teks `%PDF-`. `fileTypeFromBuffer` membaca byte itu dan menyimpulkan tipe sebenarnya, terlepas dari apa yang diklaim header maupun nama berkasnya.',
      ),
      p(
        'Perhatikan `terdeteksi === undefined` juga ditolak, bukan hanya tipe yang tidak diizinkan. Nilai `undefined` berarti library-nya **tidak mengenali** formatnya sama sekali — dan berkas yang tidak dikenali persis seperti apa isinya adalah hal terakhir yang layak kamu simpan. Menerima yang tak dikenal karena "mungkin format baru" membalik prinsip allow-list menjadi blocklist.',
      ),
      p(
        'Return valuenya bukan sekadar penanda lolos: `terdeteksi.mime` yang dipakai untuk menentukan ekstensi simpan di bagian berikutnya. Dengan begitu ekstensinya berasal dari **isi yang terbukti**, bukan dari nama yang dikirim klien — dan berkas yang isinya PNG tidak akan pernah tersimpan dengan akhiran `.php`.',
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
      p(
        'Tiga komentar di kolom kiri adalah tiga serangan yang berbeda dari satu sumber yang sama: `file.originalname` datang dari klien. `../../.env` keluar dari folder tujuan lewat path traversal — dan `path.join` tidak menghalanginya, karena ia memang bertugas menggabungkan jalur, bukan memvalidasinya. `shell.php` menanam berkas yang bisa **dieksekusi** kalau foldernya kebetulan dilayani server web. Dan nama yang kebetulan sama menimpa berkas milik orang lain tanpa satu pun peringatan.',
      ),
      p(
        'Kolom kanan menutup ketiganya dengan satu keputusan, yaitu **nama tidak pernah berasal dari klien**. `crypto.randomUUID()` menghasilkan nama yang tidak bisa ditebak sekaligus mustahil bertabrakan, jadi penimpaan tidak mungkin terjadi. Perhatikan ekstensinya diambil dari `TIPE_DIIZINKAN.get(terdeteksi.mime)`, yang berasal dari hasil **deteksi isi** alih-alih dari nama kiriman. Rangkaiannya utuh, sebab isi diperiksa lewat magic byte, hasilnya menentukan ekstensi, dan tidak ada satu karakter pun dari klien yang sampai ke sistem berkas.',
      ),
      p(
        'Nama asli dari klien tetap boleh **disimpan sebagai data** di database, untuk ditampilkan kembali ke pengguna dan dipakai di header `Content-Disposition` saat mengunduh. Yang tidak boleh adalah memakainya sebagai nama di sistem berkas.',
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
      p(
        'Menyimpan berkas dengan aman belum cukup — **menyajikannya kembali** punya bahayanya sendiri, dan empat header di sini yang menutupnya. `Content-Type` diambil dari hasil deteksi yang tersimpan, bukan dari apa pun yang dikirim klien saat mengunduh. `Content-Disposition: attachment` memaksa browser **mengunduh** alih-alih merender; tanpa itu, berkas HTML atau SVG yang lolos akan dieksekusi **di origin situsmu**, dan itu XSS dengan akses penuh ke sesi penggunamu.',
      ),
      p(
        '`X-Content-Type-Options: nosniff` menutup celah turunannya: tanpa header itu, sebagian browser mengabaikan `Content-Type` yang kamu kirim dan menebak sendiri dari isi berkas — sehingga berkas yang kamu tandai `application/octet-stream` bisa tetap diperlakukan sebagai HTML. `Cache-Control: private, no-store` mencegah berkas pribadi tersimpan di CDN atau proxy bersama.',
      ),
      p(
        'Perhatikan baris pertama fungsinya: `repo.cariBerkas(req.params.id, req.pengguna.id)` menyertakan **id pemilik**. Ini pemeriksaan IDOR di lapisan data, dan tanpanya seluruh header keamanan di atas tidak ada gunanya — penyerang cukup menaikkan angka di URL untuk mengunduh berkas orang lain, dengan rapi dan sesuai standar.',
      ),

      h2('Re-encode gambar'),
      code(
        'js',
        `
        import sharp from 'sharp';

        // Membangun ulang gambar dari piksel akan membuang metadata,
        // payload yang disisipkan, dan struktur berkas yang cacat.
        const bersih = await sharp(buffer)
          .rotate()                            // hormati EXIF orientation
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
        `,
      ),
      p(
        'Komentar di atasnya menyebut inti pertahanannya: gambarnya **dibangun ulang dari piksel**. Berkas gambar bukan hanya piksel — ia juga punya metadata, blok komentar, dan struktur yang bisa disalahgunakan. Berkas yang isinya JPEG sah tetapi menyisipkan payload di blok komentarnya akan kehilangan payload itu setelah di-encode ulang, karena yang disalin hanyalah gambarnya. Ini menutup seluruh kelas serangan tanpa perlu tahu satu per satu bentuknya.',
      ),
      p(
        '`.rotate()` tanpa argumen membaca tag orientasi EXIF dan memutar gambarnya secara nyata. Itu perlu justru karena langkah ini membuang EXIF — tanpa `rotate()` lebih dulu, foto dari ponsel yang bergantung pada tag orientasi akan tersimpan miring. `.resize(..., { withoutEnlargement: true })` membatasi ukuran maksimum tanpa memperbesar gambar kecil, dan sekaligus menutup *decompression bomb*: berkas beberapa kilobita yang mengembang menjadi gambar 50.000 × 50.000 piksel dan menghabiskan memori server.',
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
          term: 'message queue (antrean)',
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
      p(
        "`defaultJobOptions` menetapkan aturan yang berlaku untuk **setiap** job di antrean ini, sehingga tidak ada yang bisa lupa memasangnya satu per satu. `attempts: 5` memberi lima kesempatan sebelum job dianggap gagal permanen, dan `backoff: { type: 'exponential', delay: 2000 }` menaikkan jedanya berlipat — 2 detik, 4, 8, 16. Jeda yang naik itu bukan sekadar kesabaran: ia memberi layanan yang sedang bermasalah waktu untuk pulih, alih-alih membanjirinya dengan percobaan ulang tepat saat ia sedang kewalahan.",
      ),
      p(
        'Dua baris `removeOn*` menutup masalah yang baru terasa berbulan-bulan kemudian. BullMQ menyimpan riwayat job di Redis, dan tanpa pembersihan otomatis, Redis penuh oleh catatan job yang sudah lama selesai. Perhatikan **umur simpannya berbeda**: job sukses dibuang setelah 24 jam, job gagal disimpan tujuh hari. Itu disengaja — yang gagal justru yang perlu kamu periksa, dan membuangnya secepat yang sukses berarti membuang bukti sebelum sempat dilihat.',
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
      p(
        'Perhatikan payload-nya hanya berisi `penggunaId` — satu string, bukan objek pengguna lengkap. Ada dua alasan, dan yang kedua lebih penting. Pertama, payload tersimpan di Redis dan **terlihat di dashboard**, jadi menaruh email atau nama di sana berarti menyebarkan data pribadi ke tempat yang aksesnya lebih longgar. Kedua, data di payload sudah **basi** saat job akhirnya berjalan: pengguna bisa saja mengganti emailnya dalam jeda beberapa detik itu, dan job akan mengirim ke alamat lama.',
      ),
      p(
        '`jobId` yang deterministik adalah idempotensi versi antrean. Karena id-nya disusun dari `pengguna.id` dan `tokenId`, menambahkan job yang sama dua kali, entah karena pengguna menekan tombol dua kali atau handler dipanggil ulang, tidak menghasilkan dua job. BullMQ mengenali id yang sudah ada dan mengabaikan yang kedua. Ini pola yang sama dengan `Idempotency-Key` di sub-bab 1.7, hanya di lapisan yang berbeda.',
      ),
      p(
        'Respons `202` dikirim **segera**, tanpa menunggu emailnya benar-benar terkirim. Itulah inti memakai antrean, sebab permintaan pengguna selesai dalam milidetik sementara pekerjaan yang lambat serta bisa gagal dipindahkan keluar dari jalur permintaan. Kode `202` juga jujur secara semantik dengan arti "diterima, belum selesai", sesuai kontraknya di sub-bab 1.9.',
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
      p(
        'Handler-nya mengambil data **segar dari database** memakai `penggunaId` dari payload — inilah konsekuensi dari menyimpan id, bukan objek. Perhatikan `select` membatasi kolom yang diambil, kebiasaan yang sama seperti di lapisan API: job pun tidak perlu menarik kolom yang tidak ia pakai.',
      ),
      p(
        'Blok `pengguna === null` menangani keadaan yang pasti terjadi cepat atau lambat: pengguna sudah dihapus dalam jeda antara job dibuat dan dijalankan. Perhatikan ia `return` biasa, bukan melempar — melempar akan memicu lima kali percobaan ulang untuk sesuatu yang **tidak akan pernah berubah**. Membedakan "gagal" dari "tidak perlu dikerjakan" adalah bagian dari menulis handler yang sehat.',
      ),
      p(
        'Dua opsi pekerja mengatur beban dari arah berbeda. `concurrency: 5` membatasi berapa job berjalan bersamaan di **proses ini**. `limiter: { max: 100, duration: 60_000 }` membatasi laju keseluruhan menjadi seratus job per menit, dan itu untuk menghormati batas rate penyedia email alih-alih melindungi servermu. Tanpanya, antrean yang menumpuk akan dilepas sekaligus dan akunmu di penyedia email bisa diblokir.',
      ),
      p(
        'Pendengar `failed` di akhir adalah satu-satunya cara kegagalan job terlihat. Berbeda dari error di jalur HTTP yang langsung dirasakan pengguna, job yang gagal berjalan di latar dan **tidak ada yang tahu** kecuali dicatat. Perhatikan `job?.attemptsMade` ikut dicatat: angka itu membedakan "gagal sekali lalu berhasil pada percobaan kedua" dari "gagal lima kali dan menyerah" — dua peristiwa yang sangat berbeda tingkat kegentingannya.',
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
      p(
        "Pola ini menutup celah at-least-once dengan cara yang sama seperti pengurangan stok di sub-bab 2.3: `updateMany` dengan syarat `status: 'menunggu'` menggabungkan **pemeriksaan dan perubahan dalam satu operasi** yang tidak bisa disela. Dua eksekusi job yang berjalan bersamaan sama-sama mencoba mengubah status, tetapi hanya satu yang menemukan barisnya masih `menunggu` — yang kalah mendapat `count === 0` dan berhenti.",
      ),
      p(
        'Perhatikan yang dipakai bukan pola "baca dulu, lalu tulis". Menulis `const p = await findUnique(...); if (p.status === \'menunggu\') { update(...) }` terlihat setara tetapi punya jendela di antara keduanya — dan di jendela itulah eksekusi kedua bisa menyelinap, sehingga pembayarannya diproses dua kali.',
      ),
      p(
        'Perhatikan pula fungsi ini `return` biasa, bukan melempar, saat job dilewati. Melempar akan menandainya **gagal** dan memicu percobaan ulang, padahal keadaannya justru sudah benar — pembayarannya memang sudah diproses. Membedakan "gagal" dari "tidak perlu dikerjakan" adalah bagian dari membuat handler idempoten.',
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
      p(
        'Tidak semua kegagalan layak diulang, dan `UnrecoverableError` adalah cara BullMQ menyatakan itu: ia menggagalkan job **seketika**, melewati sisa percobaan. Pembagiannya mengikuti arti status HTTP yang sudah kamu kenal — `4xx` berarti permintaan kita yang salah bentuk atau ditolak, dan mengirim permintaan yang sama persis empat kali lagi akan menghasilkan penolakan yang sama persis. `5xx` dan timeout berarti sisi sana yang sedang bermasalah, dan itu justru kasus yang backoff dirancang untuknya.',
      ),
      p(
        'Perhatikan `throw err` di baris terakhir meneruskan error aslinya apa adanya. Bedanya dengan `UnrecoverableError` bukan sekadar jenis: yang satu berkata "berhenti, ini tidak akan pernah berhasil", yang lain berkata "coba lagi nanti". Salah memilih membuat dua kegagalan yang berbeda: menandai semuanya bisa diulang berarti job rusak berputar sampai lima kali percobaan habis, dan menandai semuanya tidak bisa diulang berarti gangguan jaringan sedetik membuang pekerjaan yang sebenarnya masih bisa selesai.',
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
      p(
        '`delay` menunda sebuah job satu kali — berguna untuk pengingat, percobaan ulang terjadwal, atau tindak lanjut yang harus terjadi besok. Perhatikan satuannya milidetik, dan job yang tertunda tetap tersimpan di Redis sehingga ia **bertahan melewati restart** aplikasi; ini bedanya dengan `setTimeout`, yang hilang begitu prosesnya mati.',
      ),
      p(
        "`repeat` dengan pola cron menggantikan crontab sistem, dan `jobId` tetap di sana bukan kebetulan. Tanpa id tetap, setiap kali aplikasimu start ia akan mendaftarkan jadwal baru — jalankan tiga proses, dan pembersihan tokenmu berjalan tiga kali setiap pukul 03:00. Dengan `jobId: 'bersihkan-token'`, pendaftaran kedua dan seterusnya dikenali sebagai jadwal yang sama.",
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
      p(
        'Tanpa blok ini, setiap deploy berpotensi merusak pekerjaan yang sedang berjalan. Platform mengirim `SIGTERM` untuk meminta proses berhenti; kalau tidak ditangani, prosesnya mati **seketika** — dan job yang sedang setengah jalan berhenti di tengah, misalnya setelah kartu ditagih tetapi sebelum pesanannya ditandai lunas.',
      ),
      p(
        '`pekerja.close()` menunggu job yang sedang berjalan **selesai** lalu berhenti mengambil yang baru. Karena sifat at-least-once, job yang belum sempat selesai akan diambil kembali oleh pekerja lain — jadi tidak ada yang hilang; yang dihindari adalah kerusakan setengah jalan. Perhatikan `SIGINT` ikut ditangani supaya perilakunya sama saat kamu menekan Ctrl+C di terminal, dan `process.exit(0)` menyatakan berhenti secara normal, bukan karena gagal.',
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
      p(
        'Ini pola **cache-aside**, dan urutannya selalu tiga langkah: coba cache, kalau kosong ambil dari sumber, lalu simpan untuk pemanggilan berikutnya. Perhatikan `redis.get` mengembalikan `null` untuk kunci yang tidak ada — itu sebabnya perbandingannya `!== null` dan bukan pemeriksaan kebenaran biasa. Menulis `if (tersimpan)` akan salah untuk nilai yang tersimpan sebagai string `"0"` atau `""`, yang keduanya sah tetapi bernilai falsy.',
      ),
      p(
        'Perhatikan pula kasus `artikel === null` dikembalikan **tanpa** disimpan ke cache. Itu keputusan sadar dengan konsekuensi: id yang tidak ada tidak akan pernah tersimpan, sehingga setiap permintaan untuknya selalu menembus ke database. Kalau seseorang membanjiri API-mu dengan id acak, seluruhnya sampai ke database — namanya *cache penetration*, dan obatnya adalah menyimpan penanda "tidak ada" dengan TTL pendek.',
      ),
      p(
        "Argumen `'EX', 300` menetapkan masa berlaku 300 detik, dan komentar di atasnya menyebutnya **wajib**. Alasannya di peringatan berikut, tetapi ada alasan kedua yang sama pentingnya: TTL adalah jaring pengaman untuk invalidasi yang terlewat. Sepintar apa pun kamu menghapus entri saat data berubah, cepat atau lambat ada jalur yang lupa — dan TTL memastikan data basi itu paling lama hidup lima menit, bukan selamanya.",
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
      p(
        'Titik dua sebagai pemisah adalah konvensi Redis yang membuat kunci bisa dibaca sebagai hierarki: jenis, versi, lalu pengenal. Bagian `v1` yang disisipkan di tengah adalah trik yang menghemat banyak kesulitan — saat bentuk data yang kamu simpan berubah, kamu **tidak perlu menghapus apa pun**. Naikkan menjadi `v2`, dan seluruh entri lama otomatis tidak pernah dicari lagi lalu kedaluwarsa sendiri lewat TTL-nya. Membandingkannya dengan berusaha menemukan dan menghapus ribuan kunci lama, ini jauh lebih andal.',
      ),
      p(
        'Baris terakhir menandai aturan keamanan yang tidak bisa ditawar. Kunci untuk data privat **wajib** memuat identitas pemiliknya. Kunci seperti `dasbor:ringkasan` yang dipakai bersama akan menyajikan dasbor Ana kepada Budi — dan bug ini sangat sulit ditemukan karena hasilnya bergantung pada siapa yang kebetulan mengisi cache lebih dulu. Ia bisa lolos seluruh pengujian dan baru muncul di produksi sebagai laporan "saya melihat data orang lain".',
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
      p(
        'Perhatikan urutannya, di mana database diperbarui **lebih dulu** dan cache dihapus **setelahnya**. Membalik urutan itu membuka celah, sebab antara penghapusan cache dan penulisan database, permintaan lain bisa membaca nilai lama dari database dan mengisi cache kembali dengan data yang sudah usang. Perhatikan pula `updateMany` dengan `penulisId` di `where`, sehingga pemeriksaan kepemilikan tetap di lapisan data dan `count === 0` yang menjadi penanda gagal.',
      ),
      p(
        'Dua jenis penghapusan dipakai di sini karena dua bentuk kunci. Entri tunggal cukup `redis.del` dengan kunci yang persis. Entri daftar berpaginasi jumlahnya tak tentu, misalnya `...:daftar:42:1`, `...:42:2`, dan seterusnya, sehingga butuh pencarian berpola. Komentar di dalamnya memberi peringatan tegas, yaitu **jangan pakai `KEYS`**. Redis satu utas, dan `KEYS` memindai seluruh keyspace sambil memblokir setiap perintah lain, sehingga pada database besar itu berarti seluruh aplikasimu berhenti beberapa detik.',
      ),
      p(
        '`scanStream` melakukan pekerjaan yang sama secara bertahap, mengembalikan sedikit demi sedikit (`count: 100`) sehingga Redis tetap melayani perintah lain di antaranya. Tetapi baca kalimat terakhir komentarnya baik-baik: **lebih baik merancang kunci supaya penghapusan massal tidak diperlukan sama sekali**. Menaikkan versi pada prefiks, atau menaruh TTL pendek pada entri daftar, menghilangkan kebutuhan menyisir keyspace.',
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
      p(
        'Komentar di atas menjelaskan masalahnya dengan angka: satu kunci populer kedaluwarsa, dan seribu permintaan yang tiba pada detik yang sama **semuanya** mendapati cache kosong lalu menembus ke database serentak. Itulah *cache stampede* — dan ironisnya ia paling sering terjadi tepat saat trafik sedang tinggi, karena di situlah kunci populer paling sering diminta.',
      ),
      p(
        "Kuncinya ada pada `redis.set(kunciGembok, '1', 'NX', 'EX', 10)`. Opsi `NX` berarti *set if not exists*, sehingga perintahnya hanya berhasil kalau kuncinya belum ada, dan Redis menjaminnya **atomik**. Jadi dari seribu permintaan itu, tepat satu mendapat `dapat !== null` dan berhak memuat ulang, sedangkan sembilan ratus sembilan puluh sembilan sisanya mendapat `null`. `EX 10` di sana bukan TTL cache melainkan **umur gemboknya**, sehingga kalau proses pemegang gembok mati sebelum sempat melepasnya, gembok itu hilang sendiri setelah sepuluh detik alih-alih memblokir selamanya.",
      ),
      p(
        'Yang tidak mendapat gembok menunggu 100 milidetik lalu mencoba membaca cache lagi, yang biasanya sudah terisi oleh pemegang gembok. Perhatikan kalau ternyata **masih** kosong, mereka jatuh ke `muat()` juga alih-alih menunggu tanpa batas. Itu keputusan sadar, sebab lebih baik beberapa query berlebih daripada permintaan yang menggantung. Dan `redis.del(kunciGembok)` diletakkan di `finally` supaya gemboknya dilepas **di kedua jalur**, baik sukses maupun gagal, sebab melewatkannya berarti setiap kegagalan memuat menahan gembok sampai sepuluh detik penuh.',
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
        'Kalau sebuah query lambat karena kekurangan index, cache hanya menyembunyikannya — dan kelambatannya kembali setiap kali cache-nya cold, biasanya justru saat trafik sedang tinggi setelah deploy. Perbaiki query-nya dulu; cache untuk yang memang mahal secara inheren.',
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
            // Cache adalah optimasi, bukan source of truth.
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
          ['Unit', 'Pure function, aturan bisnis', 'Banyak — cepat'],
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
      p(
        'Tiga baris pemeriksaan di `beforeAll` adalah penjagaan yang paling murah di seluruh berkas ini. `TRUNCATE` di `beforeEach` menghapus tabel **tanpa konfirmasi dan tanpa pembatalan** — dan `DATABASE_URL` yang salah, entah karena `.env` tertukar atau variabel yang terbawa dari terminal lain, akan menghapus seluruh data kerjamu. Menuntut nama database mengandung `_test` menutup kelas kecelakaan yang tidak bisa dibatalkan.',
      ),
      p(
        'Pembersihan diletakkan di `beforeEach`, **bukan** `afterEach`, dan itu disengaja. Membersihkan sebelum tes berarti setiap tes mulai dari keadaan yang pasti bersih, bahkan ketika tes sebelumnya gagal di tengah jalan dan tidak sempat merapikan dirinya. Kalau dibersihkan sesudahnya, satu tes yang gagal meninggalkan data yang membuat tes berikutnya ikut gagal — dan kamu berakhir menelusuri kegagalan palsu.',
      ),
      p(
        'Dua opsi pada `TRUNCATE` menyelesaikan hal berbeda. `RESTART IDENTITY` mengulang penomoran `id` dari satu, sehingga tes yang kebetulan bergantung pada id tertentu tetap dapat hasil yang sama. `CASCADE` memungkinkan penghapusan tabel yang saling terhubung foreign key tanpa harus mengurutkannya manual — tanpa itu, `TRUNCATE pengguna` ditolak karena masih ada catatan yang merujuknya.',
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
      p(
        'Supertest mengirim permintaan HTTP sungguhan ke objek `app` **tanpa membuka port** — inilah yang membuat pemisahan `app`/`server` di sub-bab 3.4 terbayar. Tesnya melewati seluruh rantai yang sesungguhnya: middleware auth, validasi, controller, sampai database. Berbeda dari unit test yang menguji satu fungsi terisolasi, di sini yang diuji adalah **kontrak yang dilihat klien**.',
      ),
      p(
        'Tes pertama memakai **dua** pengguna dengan jumlah catatan yang sengaja dibedakan, yaitu tiga dan lima. Angka yang berbeda itu bukan kebetulan, sebab kalau keduanya tiga, tes akan tetap hijau meskipun scope pemiliknya bocor karena jumlahnya kebetulan sama. Perhatikan yang diperiksa adalah `toHaveLength(3)` dan bukan sekadar "ada isinya", sebab assertion yang longgar adalah cara paling umum sebuah tes berhenti membuktikan apa pun.',
      ),
      p(
        'Dua tes berikutnya menguji hal yang **tidak** boleh terjadi, dan keduanya jenis yang paling sering tidak ditulis. "Menolak tanpa token" hanya butuh dua baris tetapi ia satu-satunya yang menangkap middleware auth yang terpasang di urutan yang salah. Dan tes `per_hal=999999` membuktikan batas atas benar-benar ditegakkan server — perhatikan 150 catatan sengaja dibuat, lebih banyak dari batas 100, karena dengan data lebih sedikit dari batasnya tes itu akan hijau bahkan tanpa batas apa pun.',
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
      p(
        'Tes pertama menguji **tiga method sekaligus** lewat perulangan, dan itu bukan sekadar penghematan baris. Sangat sering `GET` sudah diperbaiki sementara `PATCH` dan `DELETE` masih memakai query lama tanpa scope pemilik — karena keduanya jarang diuji dengan token orang lain. Perhatikan pesan kedua pada `expect(res.status, \`${method} ${jalur}\`)`: tanpa label itu, kegagalan hanya berbunyi "expected 200 to be 404" dan kamu tidak tahu method mana yang bocor.',
      ),
      p(
        'Dua baris terakhir tes itu yang menutup celah paling halus. Status `404` saja **belum membuktikan apa-apa** kalau ternyata datanya sempat berubah sebelum ditolak — `PATCH` yang menulis dulu baru memeriksa izin akan tetap menghasilkan `404` sambil sudah merusak data. Membaca ulang dari database dan memastikan judulnya tidak berubah adalah bukti yang sesungguhnya.',
      ),
      p(
        'Tes kedua menembakkan `penulisId` milik Budi ke endpoint pembuatan, dan perhatikan yang diharapkan adalah `201` — permintaannya memang **berhasil**, hanya field asingnya yang diabaikan. Inilah yang membuktikan rangkaian validasi dan pembuatan lewat relasi pengguna bekerja. Hapus `.strict()` dari skema atau ganti pembuatannya menjadi `prisma.catatan.create({ data: req.body })`, dan tes ini langsung merah.',
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
      p(
        'Garis pemisahnya ada pada **apa yang kamu kendalikan**. Layanan email, gerbang pembayaran, jam sistem, dan pengacakan semuanya di luar kendali: memanggilnya sungguhan membuat tes lambat, mahal, atau tidak deterministik. `vi.setSystemTime` khususnya penting untuk apa pun yang menyangkut kedaluwarsa — tanpanya, menguji "token kedaluwarsa setelah 15 menit" berarti benar-benar menunggu lima belas menit.',
      ),
      p(
        'Komentar terakhir menyebut batas yang paling sering dilanggar, yaitu **jangan meniru databasemu sendiri**. Repository tiruan menghapus justru bagian yang paling mungkin salah, misalnya query yang lupa `WHERE penulis_id`, migration yang belum jalan, dan foreign key yang tidak sesuai. Tesnya akan tetap hijau sementara aplikasinya rusak di produksi, dan itu lebih berbahaya daripada tidak punya tes sama sekali karena ia memberi rasa aman yang keliru. Database di tes memang membuatnya lebih lambat, tapi itu harga yang sepadan.',
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
      p(
        'Socket.IO menumpang pada `httpServer` yang sama dengan Express — bukan port terpisah. Itu berarti CORS harus dikonfigurasi **lagi** di sini: konfigurasi `cors()` milik Express tidak berlaku untuk koneksi WebSocket, dan melewatkannya membuat koneksi dari frontend ditolak dengan pesan yang tidak menyebut CORS sama sekali.',
      ),
      p(
        'Komentar pada `maxHttpBufferSize` menandai hal yang mudah terlupa: koneksi terbuka **juga jalur masuk data**. Batas `express.json({ limit })` yang kamu pasang di sub-bab 2.6 tidak menyentuh WebSocket sama sekali, jadi tanpa baris ini satu klien bisa mengirim pesan berukuran ratusan megabita. `1e6` berarti satu megabita per pesan. `pingTimeout` menentukan berapa lama server menunggu balasan ping sebelum menganggap koneksinya mati — tanpanya, koneksi dari perangkat yang kehilangan sinyal akan menggantung dan terus memakan memori.',
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
      p(
        '`io.use` adalah middleware versi Socket.IO — ia berjalan sekali saat **handshake**, sebelum koneksinya diterima. Perhatikan tokennya dibaca dari `socket.handshake.auth`, bukan dari header `Authorization`: WebSocket tidak menyediakan cara memasang header sembarang dari browser, jadi klien mengirimkannya lewat objek `auth` saat menyambung.',
      ),
      p(
        '`socket.data.penggunaId` adalah tempat menitipkan identitas — padanan `req.pengguna` di dunia HTTP. Nilainya bertahan selama koneksi hidup, dan setiap handler peristiwa membacanya dari sana alih-alih mempercayai apa pun yang dikirim klien.',
      ),
      p(
        'Peringatan di bawah perlu dibaca serius karena ia membalik naluri yang terbentuk dari HTTP. Permintaan HTTP berumur milidetik, jadi memverifikasi token sekali di depan sudah memadai. Koneksi WebSocket bisa terbuka **berjam-jam** — token yang sah saat handshake bisa sudah dicabut lima menit kemudian karena logout, ganti password, atau akun dinonaktifkan, dan koneksinya tetap hidup seolah tidak terjadi apa-apa. Itulah alasan otorisasi harus diperiksa lagi **per peristiwa**, seperti pada bagian berikutnya.',
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
      p(
        '**Room** adalah cara Socket.IO mengelompokkan koneksi. `socket.join(\`pengguna:${penggunaId}\`)` di baris awal membuat room pribadi berisi satu orang — itulah yang nanti dipakai mengirim notifikasi ke pengguna tertentu, tanpa perlu melacak socket id-nya sendiri. Perhatikan namanya berprefiks (`pengguna:`, `ruang:`) supaya dua jenis room tidak pernah bertabrakan.',
      ),
      p(
        'Komentar pada `gabung-ruang` menyebut hal yang paling mudah tergelincir: **klien bisa mengirim `ruangId` apa pun**. Tidak ada yang menghalangi seseorang memanggil peristiwa itu dengan id ruang milik orang lain, jadi `bolehAksesRuang` bukan formalitas — ia satu-satunya yang berdiri antara penyerang dan percakapan pribadi orang lain. Ini IDOR dalam bentuk WebSocket.',
      ),
      p(
        'Handler `pesan` melakukan **dua** pemeriksaan berurutan, dan keduanya perlu. `SkemaPesan.safeParse` memvalidasi bentuknya, sebab payload socket tidak melewati satu pun middleware validasi HTTP sehingga ia harus divalidasi di sini. Lalu `bolehAksesRuang` diperiksa **lagi** walaupun sudah diperiksa saat bergabung, dan alasannya ada di komentarnya, yaitu keanggotaan bisa dicabut setelah socket bergabung sementara socket-nya tidak otomatis dikeluarkan.',
      ),
      p(
        'Perhatikan pola `balas` di setiap handler. Argumen terakhir itu adalah callback acknowledgement, yaitu cara klien tahu permintaannya berhasil atau ditolak, dan ia padanan status code di HTTP. Tanpa itu, penolakan otorisasi hilang tanpa jejak dan klien menampilkan pesan yang seolah terkirim. Dan `io.to(...).emit(...)` memancarkan hanya ke room yang disebut alih-alih ke seluruh klien terhubung, sebab kekeliruan memakai `io.emit()` di sini akan menyiarkan pesan pribadi ke semua orang.',
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
      p(
        "Ini kegagalan yang paling membingungkan saat aplikasimu naik dari satu proses ke banyak, karena semuanya **bekerja sempurna di laptop**. Socket.IO menyimpan daftar koneksi di memori prosesnya sendiri, jadi `io.to('ruang:7').emit(...)` yang dijalankan di proses A hanya menjangkau klien yang kebetulan terhubung ke proses A. Gejalanya: sebagian orang di ruang yang sama menerima pesan, sebagian tidak — dan siapa yang menerima berubah-ubah setiap kali mereka menyambung ulang.",
      ),
      p(
        'Adapter Redis menjadi jembatannya, sebab setiap pancaran diterbitkan ke Redis lalu semua proses lain menyalurkannya ke klien mereka masing-masing. Perhatikan ia butuh **dua** koneksi Redis (`redisPub` dan `redisSub`), dan itu bukan kelalaian melainkan syarat protokol pub/sub Redis, sebab koneksi yang sedang berlangganan tidak bisa dipakai menerbitkan.',
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
      p(
        '`socket.use` adalah middleware **per peristiwa** — ia berjalan setiap kali klien memancarkan sesuatu, berbeda dari `io.use` yang hanya berjalan sekali saat handshake. Kuncinya menggabungkan id pengguna dan nama peristiwa, sehingga seseorang yang membanjiri peristiwa `pesan` tidak ikut memblokir dirinya dari peristiwa lain.',
      ),
      p(
        'Rate limit di sini sering dilupakan justru karena rate limiter HTTP di sub-bab 2.6 terasa sudah menutup semuanya. Ia tidak: koneksi WebSocket dibuka **sekali**, dan setelah itu ribuan peristiwa bisa mengalir lewat koneksi yang sama tanpa menyentuh middleware Express sama sekali.',
      ),
      p(
        'Perhatikan `hitung` di sini sebuah `Map` di **memori proses**, dan itu sengaja: batas per-koneksi memang hanya bermakna di proses yang memegang koneksi itu. Ini beda dari rate limit HTTP yang wajib memakai Redis. Perhatikan juga `setTimeout` yang mengurangi hitungan setelah satu detik — itu sliding window sederhana, cukup untuk menahan banjir peristiwa, meski implementasi produksi biasanya memakai algoritma token bucket yang lebih rapi.',
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
          term: 'correlation id dari hulu',
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
            '**Liveness** menjawab "apakah proses ini masih hidup", dan gagal berarti restart. **Readiness** menjawab "apakah ia siap menerima trafik", dan gagal berarti dikeluarkan dari rotasi sementara. Menyamakan keduanya menyebabkan restart yang tidak perlu.',
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

      h2('Correlation id'),
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
      p(
        'Komentar di baris pertama menyebut hal yang membedakan sistem satu layanan dari sistem banyak layanan: id **dipakai ulang** dari header `x-request-id` kalau ada. Dengan begitu satu permintaan pengguna bisa ditelusuri melintasi API gateway, layanan A, dan layanan B dengan id yang sama — dan `res.setHeader` mengirimkannya kembali ke klien sehingga id itu juga ada di tangan pengguna saat ia melapor.',
      ),
      p(
        'Baris terakhir adalah yang paling penting sekaligus paling mudah dilewatkan. `konteks.run(...)` menjalankan sisa rantai permintaan **di dalam** sebuah penyimpanan yang mengikuti alur async — sehingga repository di lapisan terdalam bisa memanggil `konteks.getStore().log` dan mendapat logger yang sudah membawa `reqId`, tanpa `req` pernah dioper ke sana. Tanpa itu, satu-satunya cara `reqId` sampai ke bawah adalah mengoper `req` melewati controller dan service, yang langsung merusak batas lapisan dari sub-bab 2.1.',
      ),
      p(
        "Perhatikan pemilihan level ditulis `res.statusCode >= 500 ? 'error' : 'info'`. Pembagian yang sama seperti pada penangan error: `5xx` adalah bugmu dan layak memicu perhatian, `4xx` adalah bagian normal melayani klien. Mencatat keduanya sebagai `error` akan menenggelamkan masalah sungguhan di antara ribuan baris \"seseorang salah ketik alamat\".",
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
      p(
        "`redact` mengganti nilai **sebelum** ditulis, jadi rahasianya tidak pernah menyentuh disk maupun layanan pengumpul log. Perhatikan dua bentuk jalur yang dipakai. `'password'` mencocokkan field di tingkat teratas, sedangkan `'*.password'` mencocokkan field bernama sama satu tingkat lebih dalam, misalnya di dalam objek `body`, `pengguna`, atau apa pun. Keduanya harus ditulis, sebab menyebut salah satu saja menyisakan jalur yang lain terbuka.",
      ),
      p(
        'Dua baris pertama menyensor header `authorization` dan `cookie`, dan itu wajib: keduanya membawa token atau sesi yang, kalau tercatat, sama nilainya dengan menyimpan kunci akun pengguna di dalam log. Perhatikan `*.refreshToken` dan `*.kartuKredit` ikut disebut — daftar ini harus tumbuh seiring aplikasimu tumbuh, dan meninjaunya adalah bagian dari review setiap fitur yang menyentuh data sensitif.',
      ),
      p(
        'Tetapi `redact` adalah **jaring pengaman, bukan izin untuk ceroboh**. Ia hanya menutup nama yang kamu sebutkan, sehingga `secret`, `apiKey`, `pin`, atau `nik` tetap lolos. Aturan utamanya tidak berubah, yaitu jangan pernah mencatat seluruh request body melainkan catat field yang kamu pilih sadar. Ingat log biasanya diakses lebih banyak orang daripada database, disimpan bertahun-tahun, dan sering dikirim ke layanan pihak ketiga.',
      ),
      callout(
        'danger',
        '`redact` hanya menutup jalur yang kamu sebutkan',
        'Field bernama lain seperti `secret`, `apiKey`, `pin`, dan `nik` tetap lolos. Aturan utamanya tidak berubah, yaitu **jangan pernah mencatat seluruh request body**. Catat field yang kamu pilih sadar. Log diakses lebih banyak orang daripada database dan disimpan bertahun-tahun.',
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
      p(
        'Dua endpoint ini menjawab pertanyaan yang berbeda, dan menyatukannya adalah kesalahan yang mahal. **Liveness** menjawab "apakah proses ini masih waras", dan komentarnya menyebut akibatnya bahwa kalau gagal, orchestrator **me-restart** prosesnya. Karena itu ia harus sangat ringan dan tidak boleh memeriksa dependensi apa pun, sebab database yang sedang down akan membuat seluruh instance-mu di-restart berulang padahal me-restart tidak memperbaiki database.',
      ),
      p(
        '**Readiness** menjawab "apakah siap menerima trafik". Kalau gagal, orchestrator berhenti mengirim permintaan ke instance ini tetapi **tidak** membunuhnya — jadi ia bisa pulih sendiri saat dependensinya kembali. Di sinilah pemeriksaan dependensi memang tepat.',
      ),
      p(
        'Baris `const siap = cek.database` adalah keputusan yang paling penting di seluruh blok ini. Perhatikan Redis **tidak** ikut menentukan kesiapan, sesuai komentarnya: Redis dipakai sebagai cache, dan cache yang mati membuat aplikasi lebih lambat, bukan salah. Menjadikannya syarat berarti gangguan Redis sesaat akan mengeluarkan seluruh instance-mu dari rotasi sekaligus — mengubah penurunan kualitas menjadi pemadaman total. Membedakan dependensi yang **fatal** dari yang hanya **menurunkan kualitas** adalah inti dari health check yang jujur.',
      ),
      p(
        'Perhatikan pula `catch` yang sengaja kosong dengan komentar `/* biarkan false */`. Ini salah satu dari sedikit tempat menelan error dibenarkan — kegagalannya memang sudah terwakili oleh nilai `false` yang lalu dikirim di field `cek`, sehingga tidak ada informasi yang hilang.',
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
      p(
        'Dua jenis metrik menjawab pertanyaan yang berbeda. **Counter** hanya bisa naik, sehingga ia menjawab "berapa banyak", dan dari kenaikannya per satuan waktu kamu mendapat laju permintaan serta tingkat error. **Histogram** mengelompokkan nilai ke dalam kotak-kotak (`buckets`), dan itulah yang memungkinkan pertanyaan "berapa p95 latensinya" dijawab. Perhatikan bucket-nya dipilih rapat di angka kecil (0.01–0.1) lalu melebar, karena selisih antara 10 ms dan 50 ms jauh lebih berarti daripada antara 2 detik dan 5 detik.',
      ),
      p(
        'Komentar "Label harus berkardinalitas RENDAH" adalah peringatan yang biayanya nyata. Setiap kombinasi nilai label menghasilkan satu seri waktu tersendiri; `method` (5 nilai) × `route` (30 nilai) × `status` (8 nilai) menghasilkan 1.200 seri, dan itu wajar. Menukar `route` dengan URL sebenarnya akan mengubah 30 menjadi jumlah id yang pernah diminta — dan sistem metrikmu tumbang. Selalu pakai **pola rute** (`/api/catatan/:id`), bukan alamat yang benar-benar dipanggil.',
      ),
      p(
        'Komentar terakhir menandai kesalahan konfigurasi yang sering ditemukan di server sungguhan, yaitu endpoint `/metrics` yang **tidak boleh publik**. Isinya adalah peta operasional lengkap, mulai dari nama setiap rute, volume trafik, pola latensi, sampai jam sibukmu. Menaruh `autentikasiInternal` di sana adalah penerapan langsung prinsip zero trust, sebab "tidak ada yang tahu alamatnya" bukan kontrol akses.',
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
      p(
        '`strict: true` adalah satu sakelar yang menyalakan sekumpulan pemeriksaan sekaligus — yang terpenting `strictNullChecks`, yang memaksa `null` dan `undefined` ditangani secara eksplisit alih-alih menyelinap ke mana-mana. Untuk project baru, menyalakannya sejak awal jauh lebih murah daripada menyalakannya nanti di atas ribuan baris yang belum siap.',
      ),
      p(
        '`noUncheckedIndexedAccess` **tidak** termasuk dalam `strict` dan harus ditulis sendiri, padahal ia menutup salah satu kelas bug paling umum. Tanpa itu, `arr[0]` bertipe `T` — TypeScript berpura-pura elemennya pasti ada, padahal arraynya bisa kosong. Dengan itu, tipenya menjadi `T | undefined`, dan compiler memaksamu menanganinya. Inilah yang di produksi muncul sebagai `Cannot read property of undefined`.',
      ),
      p(
        'Tiga opsi modul menentukan bagaimana kodenya dijalankan. `module`/`moduleResolution: "NodeNext"` membuat TypeScript mengikuti aturan ESM Node yang sesungguhnya — termasuk kewajiban menulis ekstensi `.js` pada impor relatif, sesuai yang dibahas di sub-bab 3.2. `verbatimModuleSyntax` menuntut impor tipe ditulis `import type`, sehingga tidak ada impor yang secara tak sengaja tetap ada saat runtime dan menarik modul yang seharusnya tidak ikut.',
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
      p(
        'Berkas `.d.ts` ini hanya berisi **deklarasi tipe**, tidak menghasilkan kode apa pun saat dijalankan. `declare global` dengan `namespace Express` memakai fitur TypeScript bernama *declaration merging*: properti yang kamu sebut di sini **ditambahkan** ke tipe `Request` bawaan Express, bukan menggantikannya. Itulah cara `req.id` dan `req.log` yang dititipkan middleware menjadi terlihat oleh compiler.',
      ),
      p(
        'Baris `export {}` di akhir terlihat tidak berguna tetapi wajib — ia yang membuat berkas ini diperlakukan sebagai **modul**, dan `declare global` hanya sah di dalam modul. Tanpanya, TypeScript menganggapnya skrip global dan deklarasinya tidak bekerja seperti yang kamu harapkan.',
      ),
      p(
        'Tanda tanya pada `pengguna?` adalah keputusan desain yang paling penting di blok ini, dan peringatan di bawah menjelaskan kenapa. Menandainya wajib memang membuat kode lebih nyaman ditulis karena tidak perlu memeriksa apa-apa, tetapi TypeScript lalu **diam** pada rute yang lupa dipasangi middleware auth, dan di situlah bug keamanan bersembunyi. Dengan opsional, setiap pembacaan `req.pengguna` memaksamu membuktikan autentikasinya memang berjalan. Bagian berikutnya menunjukkan cara membuktikannya sekali saja alih-alih berulang di setiap handler.',
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
      p(
        'Pola ini menukar kenyamanan dengan jaminan. `RequestTerautentikasi` adalah tipe `Request` biasa dengan `pengguna` yang **dipastikan ada** lewat `NonNullable`, dan `wajibAuth` adalah satu-satunya pintu masuk ke tipe itu. Karena pemeriksaan `req.pengguna === undefined` terjadi di dalam pembungkus, handler di dalamnya boleh menulis `req.pengguna.id` langsung — tanpa `!` dan tanpa `if` yang diulang di setiap fungsi.',
      ),
      p(
        'Perhatikan `req as RequestTerautentikasi` adalah satu-satunya *type assertion* di seluruh pola ini, dan letaknya **tepat setelah** pemeriksaan yang membuktikannya. Itulah bentuk assertion yang sah: bukan memaksa compiler diam, melainkan menyampaikan sesuatu yang baru saja kamu buktikan dan tidak bisa disimpulkan compiler sendiri. Bandingkan dengan menaburkan `req.pengguna!` di setiap handler — sama-sama membungkam compiler, tetapi tanpa satu pun bukti.',
      ),
      p(
        'Blok `try/catch` dengan `next(err)` di dalamnya menangani hal terpisah: handler-nya `async`, dan pembungkus ini memastikan error dari dalamnya sampai ke penangan error terpusat. Di Express 5 hal itu sudah otomatis, tetapi menuliskannya membuat pola yang sama tetap aman dipakai di Express 4.',
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
      p(
        'Generic `<T extends z.ZodTypeAny>` inilah yang membawa tipe skema **menembus** middleware. Tanpanya, parameter `skema` harus diberi tipe umum, dan `hasil.data` yang keluar berakhir sebagai `any` — sehingga seluruh manfaat validasi hilang begitu melewati lapisan tipe, dan `req.body.judl` yang salah ketik tidak akan tertangkap compiler.',
      ),
      p(
        'Perhatikan komentar "Setelah baris ini, req.body sesuai skema": penugasan `req.body = hasil.data` bukan sekadar kerapian. Ia mengganti body mentah dengan **hasil validasi** — field asing sudah dibuang, tipe sudah dikonversi, nilai bawaan sudah terisi. Menghapus baris itu membuat validasinya tetap menolak yang salah, tetapi handler kembali membaca data mentah.',
      ),
      p(
        'Satu batas yang harus disadari, dan daftar istilah di atas menyebutnya, adalah **tipe bukan pengganti validasi**. TypeScript hilang sepenuhnya saat runtime, jadi menulis `req.body as BuatCatatanInput` tanpa skema tidak memeriksa apa pun, melainkan hanya membuat compiler diam sementara data sembarang tetap mengalir masuk. Yang memeriksa isinya tetap `safeParse`, sedangkan tipe hanya menjaga kodemu konsisten dengan hasilnya.',
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
      p(
        'Komentar pertama menjelaskan sesuatu yang sering dianggap merepotkan padahal benar: TypeScript memberi tipe `unknown` pada variabel `catch`, bukan `Error`. Alasannya jujur — di JavaScript, **apa pun** bisa dilempar, termasuk string, angka, atau `undefined`. Tergoda menuliskan `catch (err: any)` berarti membuang satu-satunya hal yang mengingatkanmu untuk memeriksa dulu.',
      ),
      p(
        'Dua `instanceof` di dalamnya adalah cara mempersempit `unknown` menjadi sesuatu yang aman dipakai. Urutannya juga masuk akal, yaitu yang **paling spesifik lebih dulu**. `PrismaClientKnownRequestError` dengan kode `P2002` diterjemahkan menjadi error domain milikmu, lalu `Error` biasa dicatat, lalu sisanya diteruskan. Perhatikan `err.message` baru boleh dibaca **setelah** `err instanceof Error` terbukti, sebab membacanya lebih awal akan menghasilkan `undefined` untuk sesuatu yang dilempar sebagai string.',
      ),
      p(
        '`throw err` di akhir sama pentingnya dengan cabang-cabang di atasnya. Error yang tidak kamu kenali harus diteruskan apa adanya ke penangan terpusat, bukan ditelan — `catch` yang menangkap segalanya lalu diam mengubah kegagalan yang berisik menjadi kerusakan data yang senyap.',
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
      p(
        'Perhatikan `dev` dan `start` menjalankan berkas yang **berbeda**: `tsx` menjalankan `src/server.ts` apa adanya saat pengembangan, sedangkan produksi menjalankan `dist/server.js` hasil kompilasi. Itu disengaja — `tsx` menambah lapisan transformasi yang tidak perlu ada di produksi, dan menjalankan hasil `tsc` berarti yang berjalan di server adalah persis artefak yang sudah diperiksa.',
      ),
      p(
        'Baris `type-check` berdiri terpisah dari `build`, dan peringatan di bawah menjelaskan kenapa itu bukan pengulangan. Alat seperti `tsx` dan `esbuild` **menghapus** anotasi tipe tanpa memeriksanya — sengaja, karena itulah yang membuatnya cepat. Akibatnya kode yang tidak lolos type-check tetap berjalan mulus di `npm run dev`, dan errornya baru muncul saat build produksi. Menjalankan `tsc --noEmit` sebagai langkah tersendiri di CI menutup jarak itu.',
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
            'Aturan otorisasi yang menggabungkan dua lapisan: **kepemilikan** (baris ini milikmu) dan **peran** (kamu admin). Keduanya diperiksa di service, dan kepemilikannya ikut lagi di query — defense in depth.',
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
      p(
        'Baca kolom kanan sebagai **daftar hal yang harus dibuktikan kodenya**, bukan sekadar catatan. Setiap keterangan di sana menunjuk satu sub-bab bab ini: "cache 60s" adalah 2.9, "ETag" adalah 1.8, "202 + job id" adalah 1.9, dan "di-scope ke pemilik" adalah 5.7 yang muncul lagi. Latihan ini sengaja menggabungkan semuanya karena di aplikasi nyata memang tidak pernah datang satu per satu.',
      ),
      p(
        'Perhatikan pembagian akses pada endpoint artikel, di mana `GET` publik, `POST` butuh peran penulis, `PATCH` dan `DELETE` butuh **pemilik atau admin**, sedangkan `terbitkan` butuh izin tersendiri. Empat tingkat berbeda pada satu sumber daya, dan itu tepat menggambarkan kenapa otorisasi tidak bisa diselesaikan satu middleware di depan pintu. Perhatikan pula `GET /api/artikel` publik hanya menampilkan yang **terbit**, sebab draf yang bocor ke daftar publik adalah kebocoran alih-alih sekadar bug tampilan.',
      ),
      p(
        'Dua endpoint komentar memakai `:id` artikel di jalurnya, dan `POST`-nya diberi "rate limit ketat" — endpoint yang memungkinkan siapa pun menulis ke database adalah target spam paling umum. Sementara dua endpoint ekspor memakai pola `202` dari sub-bab 1.9, dengan pengingat penting di ujungnya: status job **wajib** di-scope ke pemiliknya, karena job id sering bisa ditebak dan hasilnya berisi data lengkap.',
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
      p(
        'Susunan ini adalah struktur berlapis dari sub-bab 2.1 dengan tiga tambahan yang khas project berukuran ini. `container.ts` adalah composition root, yaitu satu-satunya tempat yang merakit objek dan menyambungkan ketergantungannya. `queue/` berdiri sendiri karena pekerja adalah **proses terpisah** dari API, sehingga ia diluncurkan sendiri, diskalakan sendiri, dan dimatikan sendiri. Dan `schemas/` dipisah karena skema Zod dipakai dari dua arah, yaitu memvalidasi masukan dan menurunkan tipe lewat `z.infer`.',
      ),
      p(
        'Perhatikan `test/bantuan.ts` diberi tempat tersendiri. Berkas itu berisi factory data uji (`buatPengguna`, `buatArtikel`) yang dipakai lintas berkas tes — dan tanpa tempat yang jelas, kode penyiapan seperti itu cenderung disalin ke setiap berkas tes lalu menyimpang satu sama lain. Perhatikan pula `server.ts` disebut "listen + graceful shutdown", terpisah dari `app.ts`: pemisahan yang membuat seluruh aplikasi bisa diuji dengan Supertest tanpa membuka satu port pun.',
      ),

      h2('Langkah pengerjaan'),
      steps(
        {
          title: '1. Fondasi sebelum fitur',
          body: 'Skema Prisma, `config/env.ts` yang fail loudly, `lib/log.ts` dengan redact, dan `lib/errors.ts`. Uji dengan menghapus satu variabel environment — aplikasi harus menolak menyala dengan pesan yang menyebut variabelnya.',
        },
        {
          title: '2. Kerangka keamanan',
          body: 'helmet, CORS dengan allow-list dari environment, batas body, rate limit berjenjang, `trust proxy` diberi angka. Verifikasi dengan `curl -I` pada server yang benar-benar berjalan.',
        },
        {
          title: '3. Auth lengkap dengan pencabutan',
          body: 'Pasangan token, rotasi refresh dengan reuse detection, `tokenVersi` untuk pencabutan massal. Uji: pakai refresh token yang sudah dirotasi — seluruh keluarga harus tercabut.',
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
          body: 'Correlation id di setiap log dan respons, `/health/live` dan `/health/ready` yang jujur, metrik dengan label berpola rute.',
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
        it('mencabut seluruh token family saat refresh token dipakai ulang');
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
      p(
        'Perhatikan hampir setiap judul di sini diawali kata **"menolak"**, **"mengabaikan"**, atau **"menyembunyikan"** — semuanya menguji sesuatu yang seharusnya **tidak** terjadi. Itulah yang membedakan daftar ini dari tes yang biasa ditulis lebih dulu. Jalur sukses adalah bagian yang paling jarang rusak di produksi, dan ia juga bagian yang sudah kamu coba puluhan kali secara manual selama membangun.',
      ),
      p(
        'Perhatikan pula setiap judul menyebut **perilaku yang bisa diamati**, bukan nama fungsi yang diuji. "Menjawab 400 untuk JSON rusak, bukan 500" langsung bisa diverifikasi siapa pun dengan satu `curl`, dan tetap bermakna walau seluruh isi controller-nya ditulis ulang. Judul seperti "menguji penanganError" akan berhenti bermakna begitu fungsinya diganti nama.',
      ),
      p(
        'Tiga kelompok terakhir sering luput dari daftar tes karena tidak terasa seperti "fitur". Batas ukuran dan JSON rusak menguji **jalur error**, yang tidak pernah dilalui saat mencoba manual. Tes performa mengubah N+1 dari masalah yang muncul berbulan-bulan kemudian menjadi kegagalan yang terlihat saat ditambahkan. Dan dua tes job menutup dua hal yang paling mudah bocor di pekerjaan latar: idempotensi handler, dan otorisasi yang mudah terlupa karena "job kan datang dari antrean sendiri".',
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
