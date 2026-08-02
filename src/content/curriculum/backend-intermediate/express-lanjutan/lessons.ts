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
    ],
  ),

  written('prisma', 'ORM: Prisma', 13, 'Query bertipe dari skema, dan biaya yang menyertainya.', [
    p(
      'Prisma menghasilkan klien bertipe dari satu berkas skema. Keunggulannya nyata: salah ketik nama kolom menjadi error type-check, bukan error runtime. Tapi ia tetap ORM — dan aturan dari Backend Basic tentang N+1 dan biaya query tetap berlaku.',
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
  ]),

  written(
    'relasi-query-kompleks',
    'Relasi & Query Kompleks di ORM',
    12,
    'Mengambil data bercabang tanpa membuat ratusan query.',
    [
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
    ],
  ),

  written(
    'transaksi-orm',
    'Transaksi Database',
    11,
    'Beberapa perubahan yang berhasil bersama atau tidak sama sekali.',
    [
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
    ],
  ),

  written(
    'middleware-keamanan',
    'Middleware Keamanan: helmet, CORS, rate limit',
    12,
    'Lapisan yang dipasang sekali dan melindungi setiap rute.',
    [
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
    ],
  ),

  written(
    'testing-express',
    'Testing: Vitest + Supertest',
    13,
    'Tes yang benar-benar menangkap bug, bukan yang sekadar hijau.',
    [
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
    ],
  ),

  written(
    'typescript-express',
    'TypeScript di Express',
    11,
    'Menutup celah tipe yang paling sering menjadi bug runtime.',
    [
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
    ],
  ),
];
