import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  p,
  steps,
  table,
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Backend Basic — Chapter 2, all twelve lessons.
 *
 * SQL is taught before any framework on purpose. An ORM hides the query but never the cost, and a
 * reader who meets `JOIN` for the first time through Eloquent or Prisma will not be able to tell a
 * slow query from a wrong one.
 *
 * Examples target PostgreSQL, but everything except the last lesson holds for MySQL too — the
 * places where they diverge are called out inline rather than silently assumed.
 */
export const lessons: LessonDraft[] = [
  written(
    'kenapa-database',
    'Kenapa Database, Bukan Berkas Biasa',
    8,
    'Empat masalah yang muncul begitu data disimpan sendiri.',
    [
      p(
        'Menyimpan data ke berkas JSON terasa cukup — sampai ada pengguna kedua. Empat masalah berikut muncul berurutan, dan database relasional dibangun persis untuk menyelesaikannya.',
      ),

      h2('1. Dua penulis sekaligus'),
      code(
        'js',
        `
        // Dua permintaan tiba bersamaan
        const data = JSON.parse(fs.readFileSync('data.json'));   // keduanya baca isi yang sama
        data.push(catatanBaru);
        fs.writeFileSync('data.json', JSON.stringify(data));     // yang kedua menimpa yang pertama
        `,
      ),
      p(
        'Satu catatan hilang, tanpa error apa pun. Ini bukan kemungkinan kecil — di server, permintaan bersamaan adalah keadaan normal.',
      ),

      h2('2. Mencari jadi mahal'),
      code(
        'js',
        `
        // Harus membaca SELURUH berkas, walau hanya butuh satu baris.
        const semua = JSON.parse(fs.readFileSync('data.json'));   // 500 MB masuk ke memori
        const satu = semua.find((c) => c.id === 42);
        `,
      ),
      p('Database dengan index menemukan baris itu tanpa menyentuh sisanya.'),

      h2('3. Tidak ada yang menjaga bentuk data'),
      code(
        'json',
        `
        [
          { "id": 1, "judul": "Catatan", "penulisId": 5 },
          { "id": 2, "judul": null,       "penulisId": 999 },
          { "id": 1, "judul": "Duplikat" }
        ]
        `,
      ),
      ul(
        '`id` ganda — tidak ada yang mencegahnya.',
        '`judul` `null` padahal seharusnya wajib.',
        '`penulisId: 999` menunjuk pengguna yang tidak ada.',
      ),
      p(
        'Database menegakkan ketiganya lewat `NOT NULL`, `UNIQUE`, dan `FOREIGN KEY` — di lapisan data, bukan di kode yang bisa dilupakan.',
      ),

      h2('4. Perubahan setengah jadi'),
      code(
        'text',
        `
        Transfer saldo:
          1. Kurangi saldo A   -> berhasil
          2. Tambah saldo B    -> server mati di sini

        Hasil: uang lenyap. Tidak ada cara mengembalikannya.
        `,
      ),
      p(
        'Transaksi database membuat kedua langkah itu berhasil bersama atau gagal bersama — dibahas di sub-bab 2.10.',
      ),

      h2('Kapan berkas biasa memang cukup'),
      table(
        ['Cukup berkas', 'Butuh database'],
        [
          ['Konfigurasi yang dibaca saat boot', 'Data yang ditulis banyak pengguna'],
          ['Data statis yang jarang berubah', 'Data yang perlu dicari dan disaring'],
          ['Satu pengguna, satu proses', 'Beberapa proses menulis bersamaan'],
          ['Cache yang boleh hilang', 'Data yang tidak boleh hilang'],
        ],
      ),
      callout(
        'info',
        'Website ini memang tidak punya database',
        'Ruang Belajar Fullstack menyimpan progres di `localStorage` — satu pengguna, satu perangkat, tidak ada penulis bersamaan, dan data yang hilang bukan bencana. Keputusannya tercatat di ADR-0002. Ini contoh nyata bahwa "pakai database" bukan jawaban otomatis; ia jawaban untuk masalah tertentu.',
      ),
    ],
  ),

  written(
    'konsep-tabel',
    'Konsep: tabel, baris, kolom, tipe data',
    9,
    'Bentuk dasar penyimpanan relasional.',
    [
      p(
        'Database relasional menyimpan data dalam **tabel**: kolom mendefinisikan bentuk, baris menyimpan datanya. Bentuknya ditetapkan lebih dulu — dan itu fitur, bukan batasan.',
      ),

      h2('Membuat tabel'),
      code(
        'sql',
        `
        CREATE TABLE catatan (
          id          BIGSERIAL PRIMARY KEY,
          judul       VARCHAR(200)  NOT NULL,
          isi         TEXT          NOT NULL,
          diarsipkan  BOOLEAN       NOT NULL DEFAULT FALSE,
          dibuat_pada TIMESTAMPTZ   NOT NULL DEFAULT NOW()
        );
        `,
      ),

      h2('Tipe data yang benar-benar dipakai'),
      table(
        ['Tipe', 'Untuk', 'Catatan'],
        [
          ['`VARCHAR(n)`', 'Teks berbatas', 'Batasnya jadi validasi tambahan'],
          ['`TEXT`', 'Teks panjang', 'Tanpa batas praktis'],
          ['`INTEGER`', 'Bilangan bulat', 'Sampai ~2,1 miliar'],
          ['`BIGINT`', 'Bilangan bulat besar', 'Untuk id yang bisa tumbuh besar'],
          ['`NUMERIC(12,2)`', '**Uang**', 'Eksak — tidak seperti float'],
          ['`BOOLEAN`', 'Benar/salah', '`TRUE`, `FALSE`, atau `NULL`'],
          ['`TIMESTAMPTZ`', '**Waktu**', 'Menyimpan zona waktu; pakai ini'],
          ['`DATE`', 'Tanggal saja', 'Ulang tahun, tanggal jatuh tempo'],
          ['`JSONB`', 'Data tak terstruktur', 'Bisa diindeks; jangan dipakai untuk semuanya'],
          ['`UUID`', 'Id acak', 'Tidak bisa ditebak berurutan'],
        ],
      ),
      callout(
        'danger',
        'Jangan pernah menyimpan uang sebagai `FLOAT`',
        '`0.1 + 0.2` tidak sama dengan `0.3` pada bilangan pecahan biner. Kesalahannya kecil per operasi dan menumpuk diam-diam sampai laporan keuangan tidak cocok. Pakai `NUMERIC(12,2)`, atau simpan sebagai integer dalam satuan terkecil.',
      ),
      callout(
        'warning',
        '`TIMESTAMP` tanpa `TZ` menyimpan waktu tanpa konteks',
        '"2026-08-02 10:00" itu jam sepuluh di mana? Server yang pindah zona waktu, atau pengguna di zona lain, langsung membuat datanya ambigu. Pakai `TIMESTAMPTZ`, simpan dalam UTC, dan ubah ke waktu lokal hanya saat menampilkan.',
      ),

      h2('`NULL` bukan nol dan bukan string kosong'),
      code(
        'sql',
        `
        -- NULL berarti "tidak diketahui", jadi perbandingan biasa tidak bekerja.
        SELECT * FROM catatan WHERE judul = NULL;      -- selalu kosong, bahkan kalau ada NULL
        SELECT * FROM catatan WHERE judul IS NULL;     -- ini yang benar

        -- NULL juga menular ke perhitungan
        SELECT 100 + NULL;        -- NULL, bukan 100
        SELECT COUNT(*) FROM t;   -- menghitung semua baris
        SELECT COUNT(kolom) FROM t; -- MELEWATI baris yang kolomnya NULL
        `,
      ),

      h2('Skema ketat lebih murah daripada skema longgar'),
      compare(
        {
          title: 'Longgar',
          lang: 'sql',
          code: `
          CREATE TABLE catatan (
            id    TEXT,
            judul TEXT,
            data  TEXT
          );
          `,
          notes: [
            'Apa pun bisa masuk',
            'Setiap pembaca harus memeriksa sendiri',
            'Bug muncul saat membaca',
          ],
        },
        {
          title: 'Ketat',
          lang: 'sql',
          code: `
          CREATE TABLE catatan (
            id     BIGSERIAL PRIMARY KEY,
            judul  VARCHAR(200) NOT NULL
                     CHECK (length(trim(judul)) > 0),
            status VARCHAR(20)  NOT NULL DEFAULT 'draf'
                     CHECK (status IN ('draf','terbit'))
          );
          `,
          notes: ['Data salah ditolak saat ditulis', 'Aturannya berlaku untuk SEMUA penulis'],
        },
      ),
      p(
        'Batasan di database berlaku bagi siapa pun yang menulis — aplikasimu, skrip migrasi, seseorang yang menjalankan `psql` tengah malam. Validasi di kode aplikasi tidak.',
      ),
    ],
  ),

  written(
    'key-index',
    'Primary Key, Foreign Key & Index',
    12,
    'Tiga hal yang menentukan benar dan cepatnya sebuah tabel.',
    [
      p(
        'Primary key menjawab "baris ini yang mana", foreign key menjawab "milik siapa", dan index menjawab "bagaimana menemukannya cepat". Dua yang pertama soal **kebenaran**; yang ketiga soal **kecepatan**.',
      ),

      h2('Primary key'),
      code(
        'sql',
        `
        -- Pilihan 1: berurutan. Sederhana, kecil, cepat.
        id BIGSERIAL PRIMARY KEY

        -- Pilihan 2: UUID. Tidak bisa ditebak, bisa dibuat klien.
        id UUID PRIMARY KEY DEFAULT gen_random_uuid()
        `,
      ),
      table(
        ['', 'Berurutan (`BIGSERIAL`)', '`UUID`'],
        [
          ['Ukuran', '8 byte', '16 byte'],
          ['Bisa ditebak', '**Ya** — `/catatan/42` lalu coba `43`', 'Tidak'],
          ['Bisa dibuat sebelum insert', 'Tidak', 'Ya'],
          ['Membocorkan jumlah data', '**Ya** — id 5000 berarti ada ~5000', 'Tidak'],
          ['Ramah index', 'Sangat', 'Kurang (acak)'],
        ],
      ),
      callout(
        'warning',
        'ID berurutan bukan celah keamanan, tapi ia memperbesarnya',
        'ID yang bisa ditebak hanya berbahaya kalau otorisasinya bocor — itulah IDOR (sub-bab 5.7). Memakai UUID **tidak** menggantikan pemeriksaan kepemilikan; ia hanya membuat penyerang tidak bisa menjelajah data dengan menaikkan angka. Perbaikan sebenarnya tetap: setiap query di-scope ke pemiliknya.',
      ),

      h2('Foreign key'),
      code(
        'sql',
        `
        CREATE TABLE komentar (
          id         BIGSERIAL PRIMARY KEY,
          catatan_id BIGINT NOT NULL
            REFERENCES catatan(id) ON DELETE CASCADE,
          isi        TEXT NOT NULL
        );
        `,
      ),
      p(
        'Ini menegakkan dua hal sekaligus: komentar tidak bisa menunjuk catatan yang tidak ada, dan tidak ada komentar yatim yang tertinggal.',
      ),
      table(
        ['`ON DELETE`', 'Yang terjadi saat induk dihapus'],
        [
          ['`CASCADE`', 'Anak ikut terhapus'],
          ['`RESTRICT`', 'Penghapusan **ditolak** selama masih ada anak'],
          ['`SET NULL`', 'Kolom anak jadi `NULL` (kolomnya harus boleh `NULL`)'],
          ['`NO ACTION`', 'Default — mirip `RESTRICT`, diperiksa di akhir transaksi'],
        ],
      ),
      callout(
        'danger',
        '`CASCADE` menghapus lebih banyak daripada yang terlihat',
        'Menghapus satu pengguna dengan rantai `CASCADE` bisa ikut menghapus catatannya, komentarnya, dan komentar orang lain di catatan itu. Untuk data penting, `RESTRICT` lebih aman: ia memaksa penghapusan dilakukan sadar, bukan sebagai efek samping.',
      ),

      h2('Index'),
      code(
        'sql',
        `
        -- Tanpa index: baca SELURUH tabel untuk menemukan satu baris
        SELECT * FROM catatan WHERE penulis_id = 42;

        CREATE INDEX idx_catatan_penulis ON catatan(penulis_id);

        -- Sekarang: langsung ke barisnya
        `,
      ),
      p('Kandidat index yang hampir selalu benar:'),
      ul(
        'Setiap kolom **foreign key** — Postgres tidak membuatnya otomatis.',
        'Kolom yang sering muncul di `WHERE`.',
        'Kolom yang dipakai `ORDER BY` pada tabel besar.',
        'Kolom yang butuh `UNIQUE` (index-nya jadi bonus).',
      ),
      code(
        'sql',
        `
        -- Index gabungan: URUTANNYA PENTING
        CREATE INDEX idx_catatan_penulis_waktu
          ON catatan(penulis_id, dibuat_pada DESC);

        -- Dipakai:        WHERE penulis_id = 42
        -- Dipakai:        WHERE penulis_id = 42 ORDER BY dibuat_pada DESC
        -- TIDAK dipakai:  WHERE dibuat_pada > '2026-01-01'   (kolom kedua saja)
        `,
      ),
      callout(
        'warning',
        'Index bukan gratis',
        'Setiap index memperlambat `INSERT`, `UPDATE`, dan `DELETE`, karena ia harus ikut diperbarui. Ia juga memakan ruang disk. Tabel dengan lima belas index yang jarang dipakai lebih lambat menulis tanpa manfaat membaca. Tambahkan index karena query yang lambat, bukan karena berjaga-jaga.',
      ),

      h2('Membuktikan index dipakai'),
      code(
        'sql',
        `
        EXPLAIN ANALYZE
        SELECT * FROM catatan WHERE penulis_id = 42;
        `,
      ),
      code(
        'text',
        `
        Seq Scan on catatan  (cost=0.00..1834.00 rows=12 width=64)
        -- "Seq Scan" pada tabel besar = index tidak dipakai

        Index Scan using idx_catatan_penulis on catatan
        -- "Index Scan" = index dipakai
        `,
      ),
      p(
        'Jangan menebak. `EXPLAIN ANALYZE` menunjukkan rencana yang **benar-benar** dijalankan, beserta waktunya.',
      ),
    ],
  ),

  written(
    'select-dasar',
    '`SELECT`, `WHERE`, `ORDER BY`, `LIMIT`',
    11,
    'Perintah yang paling sering kamu tulis seumur hidup.',
    [
      p(
        '`SELECT` membaca data. Empat klausa di bawah menyusun hampir semua pembacaan yang akan kamu tulis.',
      ),

      h2('Bentuk dasar'),
      code(
        'sql',
        `
        SELECT id, judul, dibuat_pada
        FROM catatan
        WHERE diarsipkan = FALSE
        ORDER BY dibuat_pada DESC
        LIMIT 20 OFFSET 0;
        `,
      ),
      callout(
        'tip',
        'Sebutkan kolomnya, jangan `SELECT *`',
        'Di aplikasi, `SELECT *` mengirim kolom yang tidak dipakai lewat jaringan, ikut berubah diam-diam saat skema berubah, dan gampang membocorkan kolom sensitif seperti `password_hash` ke respons API. `*` boleh saat menjelajah manual di `psql`; jangan di kode.',
      ),

      h2('`WHERE`'),
      code(
        'sql',
        `
        WHERE penulis_id = 42
        WHERE harga BETWEEN 10000 AND 50000
        WHERE status IN ('draf', 'ditinjau')
        WHERE judul ILIKE '%react%'        -- ILIKE: abaikan huruf besar/kecil (Postgres)
        WHERE dihapus_pada IS NULL
        WHERE diarsipkan = FALSE AND penulis_id = 42
        WHERE (status = 'draf' OR status = 'ditinjau') AND penulis_id = 42
        `,
      ),
      callout(
        'warning',
        'Tanda kurung pada campuran `AND`/`OR`',
        '`AND` dievaluasi lebih dulu daripada `OR`. Tanpa kurung, `a = 1 OR a = 2 AND b = 3` berarti `a = 1 OR (a = 2 AND b = 3)` — hampir selalu bukan yang kamu maksud. Ini bug yang tidak menimbulkan error, hanya hasil yang salah.',
      ),

      h2('`LIKE` dan biayanya'),
      code(
        'sql',
        `
        WHERE judul LIKE 'React%'    -- bisa memakai index
        WHERE judul LIKE '%React%'   -- TIDAK bisa; harus memindai seluruh tabel
        `,
      ),
      p(
        'Wildcard di depan mematikan index. Untuk pencarian teks sungguhan, pakai full-text search (`to_tsvector`) atau ekstensi `pg_trgm` — bukan `LIKE` dengan wildcard di awal pada tabel besar.',
      ),

      h2('Paginasi: `OFFSET` dan batasnya'),
      code(
        'sql',
        `
        -- Halaman 1
        SELECT ... ORDER BY dibuat_pada DESC LIMIT 20 OFFSET 0;
        -- Halaman 500
        SELECT ... ORDER BY dibuat_pada DESC LIMIT 20 OFFSET 10000;
        `,
      ),
      p(
        '`OFFSET 10000` memaksa database membaca 10.020 baris lalu membuang 10.000 pertama. Makin dalam halamannya, makin lambat.',
      ),
      compare(
        {
          title: 'Offset — sederhana',
          lang: 'sql',
          code: `
          SELECT * FROM catatan
          ORDER BY id DESC
          LIMIT 20 OFFSET 10000;
          `,
          notes: [
            'Bisa lompat ke halaman mana pun',
            'Melambat seiring kedalaman',
            'Item bergeser kalau ada data baru',
          ],
        },
        {
          title: 'Keyset — cepat',
          lang: 'sql',
          code: `
          SELECT * FROM catatan
          WHERE id < 10023
          ORDER BY id DESC
          LIMIT 20;
          `,
          notes: [
            'Kecepatannya tetap di halaman mana pun',
            'Hanya bisa maju/mundur',
            'Tidak bergeser saat ada data baru',
          ],
        },
      ),
      callout(
        'danger',
        'Selalu batasi `LIMIT` dari sisi server',
        'Kalau klien boleh mengirim `?perHalaman=1000000`, satu permintaan bisa menghabiskan memori server. Batasi dengan `Math.min(diminta, 100)` — ini bagian dari pertahanan terhadap penyalahgunaan sumber daya, bukan sekadar kerapian.',
      ),

      h2('Urutan yang tidak stabil'),
      code(
        'sql',
        `
        -- Kalau banyak baris punya dibuat_pada yang sama,
        -- urutannya bisa berbeda antar pemanggilan -> paginasi kacau.
        ORDER BY dibuat_pada DESC

        -- Tambahkan pemecah seri yang unik.
        ORDER BY dibuat_pada DESC, id DESC
        `,
      ),
    ],
  ),

  written(
    'insert-update-delete',
    '`INSERT`, `UPDATE`, `DELETE`',
    10,
    'Tiga perintah yang mengubah data — dan cara tidak merusaknya.',
    [
      h2('`INSERT`'),
      code(
        'sql',
        `
        INSERT INTO catatan (judul, isi, penulis_id)
        VALUES ('Catatan pertama', 'Isi catatan', 42);

        -- Beberapa baris sekaligus: jauh lebih cepat daripada satu per satu
        INSERT INTO catatan (judul, isi, penulis_id) VALUES
          ('Satu', 'Isi 1', 42),
          ('Dua',  'Isi 2', 42);

        -- Kembalikan baris yang baru dibuat (Postgres)
        INSERT INTO catatan (judul, isi, penulis_id)
        VALUES ('Tiga', 'Isi 3', 42)
        RETURNING id, dibuat_pada;
        `,
      ),
      callout(
        'tip',
        '`RETURNING` menghemat satu perjalanan',
        'Tanpa itu kamu harus `INSERT` lalu `SELECT` lagi untuk mendapat id dan nilai default. Dua query menjadi satu, dan tidak ada celah waktu di antaranya.',
      ),

      h2('`UPDATE` — dan kesalahan yang paling mahal'),
      code(
        'sql',
        `
        UPDATE catatan
        SET judul = 'Judul baru', diperbarui_pada = NOW()
        WHERE id = 42;
        `,
      ),
      callout(
        'danger',
        '`UPDATE` tanpa `WHERE` mengubah SELURUH tabel',
        'Satu perintah, semua baris. Tidak ada konfirmasi, tidak ada pembatalan. Biasakan **menulis `WHERE` lebih dulu**, baru `SET` — dan uji dengan `SELECT` memakai `WHERE` yang sama persis sebelum menjalankannya di data sungguhan.',
      ),
      code(
        'sql',
        `
        -- 1. Uji dulu: berapa baris yang akan kena?
        SELECT count(*) FROM catatan WHERE penulis_id = 42 AND status = 'draf';

        -- 2. Baru jalankan, dengan WHERE yang sama persis
        UPDATE catatan SET status = 'arsip'
        WHERE penulis_id = 42 AND status = 'draf';
        `,
      ),

      h2('Update yang bergantung pada nilai sekarang'),
      compare(
        {
          title: 'Rawan balapan',
          lang: 'text',
          code: `
          1. SELECT stok FROM produk
             WHERE id = 7;         -> 10
          2. (aplikasi menghitung 10 - 1)
          3. UPDATE produk SET stok = 9
             WHERE id = 7;

          Dua permintaan bersamaan
          -> keduanya membaca 10
          -> keduanya menulis 9
          -> satu penjualan hilang
          `,
          notes: ['Baca-lalu-tulis bisa saling menyela'],
        },
        {
          title: 'Aman',
          lang: 'sql',
          code: `
          UPDATE produk
          SET stok = stok - 1
          WHERE id = 7 AND stok > 0;

          -- Perhitungan terjadi DI DALAM
          -- database, dalam satu operasi.
          -- Periksa jumlah baris terpengaruh:
          -- 0 berarti stok sudah habis.
          `,
          notes: ['Tidak ada celah antara baca dan tulis'],
        },
      ),

      h2('`DELETE` dan soft delete'),
      code(
        'sql',
        `
        DELETE FROM catatan WHERE id = 42;
        `,
      ),
      p(
        'Untuk data yang mungkin perlu dipulihkan atau diaudit, **soft delete** sering lebih tepat:',
      ),
      code(
        'sql',
        `
        ALTER TABLE catatan ADD COLUMN dihapus_pada TIMESTAMPTZ;

        -- "Hapus"
        UPDATE catatan SET dihapus_pada = NOW() WHERE id = 42;

        -- Setiap pembacaan HARUS menyaringnya
        SELECT * FROM catatan WHERE dihapus_pada IS NULL;
        `,
      ),
      callout(
        'warning',
        'Soft delete punya biaya yang sering dilupakan',
        'Setiap query dari sekarang wajib menambahkan `WHERE dihapus_pada IS NULL` — satu yang lupa berarti data terhapus muncul lagi. Batasan `UNIQUE` juga tetap berlaku pada baris yang "terhapus", sehingga email yang dihapus tidak bisa didaftarkan ulang. Pilih soft delete karena ada alasannya, bukan sebagai default.',
      ),

      h2('`UPSERT`'),
      code(
        'sql',
        `
        INSERT INTO pengaturan (pengguna_id, kunci, nilai)
        VALUES (42, 'tema', 'gelap')
        ON CONFLICT (pengguna_id, kunci)
        DO UPDATE SET nilai = EXCLUDED.nilai;
        `,
      ),
      p(
        'Ini menggantikan pola "cek dulu, lalu insert atau update" yang punya celah balapan di antaranya. Database melakukannya dalam satu operasi atomik.',
      ),
    ],
  ),

  written(
    'join',
    '`JOIN`: inner, left, right',
    12,
    'Menggabungkan tabel — inti dari kata "relasional".',
    [
      p(
        'Data disimpan terpisah supaya tidak berulang, lalu disatukan saat dibaca. `JOIN` adalah cara menyatukannya.',
      ),

      h2('Data contoh'),
      code(
        'text',
        `
        pengguna                    catatan
        ┌────┬───────┐              ┌────┬───────────┬─────────────┐
        │ id │ nama  │              │ id │ judul     │ penulis_id  │
        ├────┼───────┤              ├────┼───────────┼─────────────┤
        │ 1  │ Ana   │              │ 10 │ Catatan A │ 1           │
        │ 2  │ Budi  │              │ 11 │ Catatan B │ 1           │
        │ 3  │ Citra │              │ 12 │ Catatan C │ 2           │
        └────┴───────┘              └────┴───────────┴─────────────┘
                                       (Citra belum punya catatan)
        `,
      ),

      h2('`INNER JOIN` — hanya yang berpasangan'),
      code(
        'sql',
        `
        SELECT p.nama, c.judul
        FROM pengguna p
        INNER JOIN catatan c ON c.penulis_id = p.id;
        `,
      ),
      code(
        'text',
        `
        nama  | judul
        ------+-----------
        Ana   | Catatan A
        Ana   | Catatan B
        Budi  | Catatan C

        Citra tidak muncul — ia tidak punya pasangan.
        `,
      ),

      h2('`LEFT JOIN` — semua dari kiri, pasangan kalau ada'),
      code(
        'sql',
        `
        SELECT p.nama, c.judul
        FROM pengguna p
        LEFT JOIN catatan c ON c.penulis_id = p.id;
        `,
      ),
      code(
        'text',
        `
        nama  | judul
        ------+-----------
        Ana   | Catatan A
        Ana   | Catatan B
        Budi  | Catatan C
        Citra | NULL        <- muncul, dengan NULL

        Ini yang kamu pakai untuk "semua pengguna,
        beserta catatannya kalau punya".
        `,
      ),

      h2('Ringkasan'),
      table(
        ['JOIN', 'Yang dikembalikan'],
        [
          ['`INNER`', 'Hanya baris yang punya pasangan di kedua tabel'],
          ['`LEFT`', 'Semua dari kiri + pasangannya (`NULL` bila tidak ada)'],
          ['`RIGHT`', 'Semua dari kanan + pasangannya — jarang dipakai; balik saja urutannya'],
          ['`FULL OUTER`', 'Semua dari keduanya'],
          ['`CROSS`', 'Setiap kombinasi — hampir selalu tidak disengaja'],
        ],
      ),

      h2('Jebakan: `WHERE` membatalkan `LEFT JOIN`'),
      compare(
        {
          title: 'Salah',
          lang: 'sql',
          code: `
          SELECT p.nama, c.judul
          FROM pengguna p
          LEFT JOIN catatan c
            ON c.penulis_id = p.id
          WHERE c.diarsipkan = FALSE;

          -- Citra hilang lagi!
          -- NULL = FALSE bernilai NULL,
          -- jadi barisnya tersaring keluar.
          `,
          notes: ['LEFT JOIN berubah jadi INNER JOIN diam-diam'],
        },
        {
          title: 'Benar',
          lang: 'sql',
          code: `
          SELECT p.nama, c.judul
          FROM pengguna p
          LEFT JOIN catatan c
            ON c.penulis_id = p.id
           AND c.diarsipkan = FALSE;

          -- Syarat pindah ke ON.
          -- Citra tetap muncul dengan NULL.
          `,
          notes: ['Syarat pada tabel kanan masuk ke ON, bukan WHERE'],
        },
      ),
      callout(
        'warning',
        'Ini bug yang tidak menimbulkan error',
        'Query-nya berjalan mulus dan mengembalikan data yang masuk akal — hanya kurang beberapa baris. Kalau `LEFT JOIN`-mu tidak mengembalikan baris tanpa pasangan, periksa `WHERE`-nya lebih dulu.',
      ),

      h2('Masalah N+1'),
      compare(
        {
          title: 'N+1 query',
          lang: 'js',
          code: `
          const pengguna = await q(
            'SELECT * FROM pengguna'
          );                              // 1 query

          for (const p of pengguna) {
            p.catatan = await q(
              'SELECT * FROM catatan WHERE penulis_id = $1',
              [p.id],
            );                            // N query
          }
          // 1000 pengguna -> 1001 query
          `,
          notes: ['Cepat di data uji, runtuh di produksi'],
        },
        {
          title: 'Satu query',
          lang: 'sql',
          code: `
          SELECT p.id, p.nama,
                 c.id AS catatan_id, c.judul
          FROM pengguna p
          LEFT JOIN catatan c
            ON c.penulis_id = p.id;

          -- Satu perjalanan, berapa pun
          -- jumlah penggunanya.
          `,
          notes: ['Gabungkan hasilnya di aplikasi'],
        },
      ),
      p(
        'N+1 adalah masalah performa paling umum di aplikasi backend, dan ORM membuatnya sangat mudah terjadi tanpa disadari — dibahas lagi di Bab 4.9 (Eloquent) karena di sanalah ia paling sering muncul.',
      ),
    ],
  ),

  written(
    'agregasi',
    'Agregasi: `COUNT`, `SUM`, `GROUP BY`, `HAVING`',
    11,
    'Meringkas banyak baris menjadi satu angka.',
    [
      h2('Fungsi agregat'),
      code(
        'sql',
        `
        SELECT
          COUNT(*)        AS jumlah_baris,
          COUNT(judul)    AS jumlah_berjudul,   -- MELEWATI NULL
          SUM(harga)      AS total,
          AVG(harga)      AS rata_rata,
          MIN(dibuat_pada) AS paling_lama,
          MAX(dibuat_pada) AS paling_baru
        FROM catatan;
        `,
      ),
      callout(
        'warning',
        '`COUNT(*)` dan `COUNT(kolom)` berbeda',
        '`COUNT(*)` menghitung semua baris. `COUNT(kolom)` hanya menghitung baris yang kolomnya **bukan `NULL`**. Kalau angkamu lebih kecil dari yang diharapkan, ini penyebab yang paling sering.',
      ),

      h2('`GROUP BY`'),
      code(
        'sql',
        `
        SELECT penulis_id, COUNT(*) AS jumlah
        FROM catatan
        GROUP BY penulis_id;
        `,
      ),
      code(
        'text',
        `
        penulis_id | jumlah
        -----------+--------
                 1 |      2
                 2 |      1
        `,
      ),
      callout(
        'danger',
        'Aturan yang tidak bisa dilanggar',
        'Setiap kolom di `SELECT` harus **ada di `GROUP BY`** atau **dibungkus fungsi agregat**. Postgres menolak query yang melanggarnya. MySQL dalam mode longgar justru menerimanya dan mengembalikan nilai acak dari salah satu baris — bug diam yang jauh lebih berbahaya daripada error.',
      ),

      h2('`HAVING` vs `WHERE`'),
      code(
        'sql',
        `
        SELECT penulis_id, COUNT(*) AS jumlah
        FROM catatan
        WHERE diarsipkan = FALSE       -- saring BARIS, sebelum dikelompokkan
        GROUP BY penulis_id
        HAVING COUNT(*) > 5            -- saring KELOMPOK, setelah dihitung
        ORDER BY jumlah DESC;
        `,
      ),
      table(
        ['', '`WHERE`', '`HAVING`'],
        [
          ['Berjalan', 'Sebelum `GROUP BY`', 'Setelah `GROUP BY`'],
          ['Menyaring', 'Baris', 'Kelompok'],
          ['Boleh pakai agregat', '**Tidak**', 'Ya'],
        ],
      ),
      p(
        'Untuk performa, saring sebanyak mungkin di `WHERE`. Baris yang sudah dibuang tidak perlu ikut dikelompokkan.',
      ),

      h2('Urutan eksekusi yang sebenarnya'),
      code(
        'text',
        `
        Ditulis:              Dijalankan:
        SELECT      (5)       FROM        (1)
        FROM        (1)       WHERE       (2)
        WHERE       (2)       GROUP BY    (3)
        GROUP BY    (3)       HAVING      (4)
        HAVING      (4)       SELECT      (5)
        ORDER BY    (6)       ORDER BY    (6)
        LIMIT       (7)       LIMIT       (7)
        `,
      ),
      p(
        'Ini menjelaskan kebingungan yang paling sering: alias yang dibuat di `SELECT` tidak bisa dipakai di `WHERE` (karena `SELECT` belum berjalan), tapi **bisa** dipakai di `ORDER BY`.',
      ),

      h2('Agregasi dengan `LEFT JOIN`'),
      code(
        'sql',
        `
        SELECT p.nama, COUNT(c.id) AS jumlah_catatan
        FROM pengguna p
        LEFT JOIN catatan c ON c.penulis_id = p.id
        GROUP BY p.id, p.nama;
        `,
      ),
      callout(
        'tip',
        'Pakai `COUNT(c.id)`, bukan `COUNT(*)`',
        'Pada `LEFT JOIN`, pengguna tanpa catatan tetap menghasilkan satu baris berisi `NULL`. `COUNT(*)` akan menghitungnya sebagai 1 — salah. `COUNT(c.id)` melewati `NULL` dan menghasilkan 0, yang benar.',
      ),
    ],
  ),

  written(
    'normalisasi',
    'Normalisasi 1NF–3NF secukupnya',
    11,
    'Menyusun tabel supaya satu fakta hanya tersimpan di satu tempat.',
    [
      p(
        'Normalisasi adalah proses menghilangkan pengulangan data. Aturannya terdengar formal, tapi tujuannya satu kalimat: **satu fakta disimpan di satu tempat saja**.',
      ),

      h2('Tabel yang belum dinormalisasi'),
      code(
        'text',
        `
        pesanan
        ┌────┬─────────────┬──────────────┬─────────────────┬──────────┐
        │ id │ pelanggan   │ email        │ produk          │ harga    │
        ├────┼─────────────┼──────────────┼─────────────────┼──────────┤
        │ 1  │ Ana         │ ana@x.com    │ Buku A, Buku B  │ 50k, 75k │
        │ 2  │ Ana         │ ana@x.com    │ Buku A          │ 50k      │
        │ 3  │ Budi        │ budi@x.com   │ Buku C          │ 60k      │
        └────┴─────────────┴──────────────┴─────────────────┴──────────┘
        `,
      ),
      p('Tiga jenis masalah muncul sekaligus:'),
      ul(
        '**Anomali update** — Ana ganti email, harus diubah di semua barisnya. Satu terlewat, datanya bertentangan.',
        '**Anomali insert** — produk baru tidak bisa dicatat sebelum ada yang memesannya.',
        '**Anomali delete** — menghapus pesanan terakhir Budi ikut menghapus satu-satunya catatan tentang Budi.',
      ),

      h2('1NF — satu nilai per sel'),
      code(
        'text',
        `
        Melanggar:  produk = "Buku A, Buku B"

        1NF:        satu baris per produk, tidak ada daftar di dalam sel
        `,
      ),

      h2('2NF — tidak ada kolom yang hanya bergantung sebagian kunci'),
      p(
        'Berlaku saat primary key-nya gabungan. Kalau kunci-nya `(pesanan_id, produk_id)`, maka `nama_produk` hanya bergantung pada `produk_id` — jadi ia milik tabel `produk`, bukan tabel pesanan.',
      ),

      h2('3NF — tidak ada kolom yang bergantung pada kolom non-kunci'),
      code(
        'text',
        `
        Melanggar: pesanan(id, pelanggan_id, email_pelanggan)
                   email bergantung pada pelanggan, bukan pada pesanan

        3NF:       email pindah ke tabel pelanggan
        `,
      ),

      h2('Hasil akhirnya'),
      code(
        'sql',
        `
        CREATE TABLE pelanggan (
          id    BIGSERIAL PRIMARY KEY,
          nama  VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE
        );

        CREATE TABLE produk (
          id    BIGSERIAL PRIMARY KEY,
          nama  VARCHAR(200)  NOT NULL,
          harga NUMERIC(12,2) NOT NULL
        );

        CREATE TABLE pesanan (
          id           BIGSERIAL PRIMARY KEY,
          pelanggan_id BIGINT NOT NULL REFERENCES pelanggan(id),
          dibuat_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE pesanan_item (
          pesanan_id BIGINT NOT NULL REFERENCES pesanan(id) ON DELETE CASCADE,
          produk_id  BIGINT NOT NULL REFERENCES produk(id),
          jumlah     INTEGER NOT NULL CHECK (jumlah > 0),
          -- Harga SAAT DIBELI, bukan harga produk sekarang.
          harga_saat_beli NUMERIC(12,2) NOT NULL,
          PRIMARY KEY (pesanan_id, produk_id)
        );
        `,
      ),
      callout(
        'danger',
        '`harga_saat_beli` bukan pelanggaran normalisasi',
        'Sekilas ia terlihat duplikat dari `produk.harga`. Sebenarnya ia **fakta yang berbeda**: harga produk sekarang, versus harga yang benar-benar dibayar waktu itu. Kalau harga produk naik, riwayat pesanan lama tidak boleh ikut berubah. Menyimpan nilai historis adalah kebenaran, bukan redundansi.',
      ),

      h2('Kapan sengaja tidak dinormalisasi'),
      p(
        'Denormalisasi — menyimpan data berulang dengan sengaja — kadang tepat, tapi **hanya setelah** ada masalah performa yang terukur:',
      ),
      table(
        ['Kasus', 'Alasan'],
        [
          [
            'Menyimpan `jumlah_komentar` di tabel artikel',
            '`COUNT` di setiap pemuatan terlalu mahal',
          ],
          [
            'Menyalin `nama_penulis` ke tabel artikel',
            'Menghindari `JOIN` di halaman yang sangat sering dibuka',
          ],
          [
            'Tabel laporan yang dihitung berkala',
            'Query analitik terlalu berat untuk dijalankan langsung',
          ],
        ],
      ),
      callout(
        'warning',
        'Denormalisasi memindahkan tanggung jawab ke kodemu',
        'Begitu satu fakta tersimpan di dua tempat, **kamu** yang harus menjaganya tetap sama. Satu jalur update yang lupa, dan datanya bertentangan tanpa ada yang memberitahu. Mulailah selalu dari bentuk ternormalisasi; denormalisasi hanya sebagai jawaban atas masalah yang sudah terukur.',
      ),
    ],
  ),

  written(
    'relasi',
    'Relasi 1-1, 1-N, N-N & tabel pivot',
    12,
    'Tiga bentuk hubungan antar tabel dan cara mewujudkannya.',
    [
      h2('One-to-Many (1-N) — yang paling umum'),
      p(
        'Satu penulis punya banyak catatan; satu catatan punya satu penulis. **Foreign key diletakkan di sisi "banyak".**',
      ),
      code(
        'sql',
        `
        CREATE TABLE catatan (
          id         BIGSERIAL PRIMARY KEY,
          judul      VARCHAR(200) NOT NULL,
          penulis_id BIGINT NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE
        );

        -- Postgres TIDAK membuat index otomatis untuk foreign key.
        CREATE INDEX idx_catatan_penulis ON catatan(penulis_id);
        `,
      ),
      callout(
        'warning',
        'Foreign key tanpa index adalah penyebab lambat yang tersembunyi',
        'Setiap `WHERE penulis_id = ?` dan setiap `JOIN` lewat kolom itu akan memindai seluruh tabel. Penghapusan induk juga melambat, karena database harus memeriksa anak-anaknya. Buat index untuk setiap foreign key sejak awal.',
      ),

      h2('One-to-One (1-1)'),
      code(
        'sql',
        `
        CREATE TABLE profil (
          -- UNIQUE inilah yang mengubah 1-N menjadi 1-1.
          pengguna_id BIGINT PRIMARY KEY REFERENCES pengguna(id) ON DELETE CASCADE,
          bio         TEXT,
          situs       VARCHAR(255)
        );
        `,
      ),
      p(
        'Pakai tabel terpisah kalau: kolomnya jarang dipakai, ukurannya besar, atau aksesnya perlu dibatasi berbeda dari tabel utama.',
      ),

      h2('Many-to-Many (N-N) — butuh tabel ketiga'),
      code(
        'sql',
        `
        CREATE TABLE tag (
          id   BIGSERIAL PRIMARY KEY,
          nama VARCHAR(50) NOT NULL UNIQUE
        );

        -- Tabel pivot: tidak menyimpan data selain hubungannya
        CREATE TABLE catatan_tag (
          catatan_id BIGINT NOT NULL REFERENCES catatan(id) ON DELETE CASCADE,
          tag_id     BIGINT NOT NULL REFERENCES tag(id)     ON DELETE CASCADE,

          -- Primary key gabungan: satu pasangan tidak bisa ganda
          PRIMARY KEY (catatan_id, tag_id)
        );

        -- Index untuk arah sebaliknya (cari catatan berdasarkan tag)
        CREATE INDEX idx_catatan_tag_tag ON catatan_tag(tag_id);
        `,
      ),
      code(
        'sql',
        `
        -- Semua tag milik satu catatan
        SELECT t.nama
        FROM tag t
        JOIN catatan_tag ct ON ct.tag_id = t.id
        WHERE ct.catatan_id = 42;

        -- Semua catatan yang punya tag tertentu
        SELECT c.judul
        FROM catatan c
        JOIN catatan_tag ct ON ct.catatan_id = c.id
        JOIN tag t          ON t.id = ct.tag_id
        WHERE t.nama = 'react';
        `,
      ),

      h2('Pivot yang membawa data sendiri'),
      code(
        'sql',
        `
        CREATE TABLE anggota_tim (
          tim_id      BIGINT NOT NULL REFERENCES tim(id)      ON DELETE CASCADE,
          pengguna_id BIGINT NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,

          -- Ini bukan sekadar hubungan — ia punya atributnya sendiri
          peran       VARCHAR(20) NOT NULL DEFAULT 'anggota'
                        CHECK (peran IN ('pemilik','admin','anggota')),
          bergabung_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),

          PRIMARY KEY (tim_id, pengguna_id)
        );
        `,
      ),
      p(
        'Begitu tabel pivot punya kolomnya sendiri, ia sebenarnya sudah menjadi **entitas** — bukan lagi sekadar penghubung. Beri nama yang mencerminkan itu (`keanggotaan`, `pendaftaran`), bukan gabungan dua nama tabel.',
      ),

      h2('Relasi ke diri sendiri'),
      code(
        'sql',
        `
        CREATE TABLE kategori (
          id       BIGSERIAL PRIMARY KEY,
          nama     VARCHAR(100) NOT NULL,
          -- NULL berarti kategori tingkat teratas
          induk_id BIGINT REFERENCES kategori(id) ON DELETE SET NULL
        );
        `,
      ),
      callout(
        'tip',
        'Menelusuri hierarki butuh query rekursif',
        'Untuk mengambil seluruh keturunan sebuah kategori, SQL punya `WITH RECURSIVE`. Untuk hierarki yang dangkal (dua sampai tiga tingkat), beberapa `JOIN` biasa lebih sederhana dan lebih mudah dibaca.',
      ),
    ],
  ),

  written(
    'transaksi-acid',
    'Transaksi & ACID',
    12,
    'Beberapa perubahan yang berhasil bersama atau gagal bersama.',
    [
      p(
        'Transaksi mengelompokkan beberapa perintah menjadi satu satuan yang tidak bisa dipecah. Ini yang mencegah kelas bug paling mahal di backend: **perubahan setengah jadi**.',
      ),

      h2('Bentuknya'),
      code(
        'sql',
        `
        BEGIN;

        UPDATE akun SET saldo = saldo - 100000 WHERE id = 1;
        UPDATE akun SET saldo = saldo + 100000 WHERE id = 2;

        COMMIT;   -- keduanya berlaku
        -- atau
        ROLLBACK; -- keduanya dibatalkan
        `,
      ),
      p(
        'Kalau server mati di antara dua `UPDATE`, database membatalkan yang pertama saat pulih. Uang tidak pernah lenyap di tengah jalan.',
      ),

      h2('ACID'),
      table(
        ['Sifat', 'Artinya'],
        [
          ['**A**tomicity', 'Semua berhasil, atau tidak ada satu pun yang berlaku'],
          ['**C**onsistency', 'Semua batasan (`NOT NULL`, foreign key, `CHECK`) tetap terpenuhi'],
          ['**I**solation', 'Transaksi bersamaan tidak saling melihat keadaan setengah jadi'],
          ['**D**urability', 'Setelah `COMMIT`, data selamat meski listrik mati'],
        ],
      ),

      h2('Di kode aplikasi'),
      code(
        'js',
        `
        const klien = await pool.connect();

        try {
          await klien.query('BEGIN');

          const { rows } = await klien.query(
            'INSERT INTO pesanan (pelanggan_id) VALUES ($1) RETURNING id',
            [pelangganId],
          );
          const pesananId = rows[0].id;

          for (const item of items) {
            await klien.query(
              \`INSERT INTO pesanan_item (pesanan_id, produk_id, jumlah, harga_saat_beli)
               VALUES ($1, $2, $3, $4)\`,
              [pesananId, item.produkId, item.jumlah, item.harga],
            );

            // Kurangi stok DAN pastikan tidak minus, dalam satu operasi.
            const hasil = await klien.query(
              'UPDATE produk SET stok = stok - $1 WHERE id = $2 AND stok >= $1',
              [item.jumlah, item.produkId],
            );

            if (hasil.rowCount === 0) {
              // Batalkan SELURUH pesanan — bukan sebagiannya.
              throw new Error(\`Stok produk \${item.produkId} tidak cukup\`);
            }
          }

          await klien.query('COMMIT');
          return pesananId;
        } catch (err) {
          await klien.query('ROLLBACK');
          throw err;
        } finally {
          // WAJIB — koneksi yang tidak dikembalikan akan menghabiskan pool.
          klien.release();
        }
        `,
      ),
      callout(
        'danger',
        'Tanpa `finally { release() }`, aplikasimu akan mati perlahan',
        'Setiap error yang melewati blok itu menyisakan satu koneksi tergantung. Setelah beberapa puluh kali, pool habis dan **seluruh** permintaan menggantung — termasuk yang tidak ada hubungannya. Gejalanya muncul jauh dari penyebabnya, dan itu yang membuatnya sulit dilacak.',
      ),

      h2('Jaga transaksi tetap pendek'),
      compare(
        {
          title: 'Berbahaya',
          lang: 'js',
          code: `
          await klien.query('BEGIN');

          await klien.query('UPDATE ...');

          // Panggilan jaringan DI DALAM transaksi
          await kirimEmail(pengguna.email);   // 3 detik
          await panggilApiPembayaran();       // bisa timeout

          await klien.query('COMMIT');
          `,
          notes: [
            'Baris terkunci selama panggilan jaringan',
            'Pihak ketiga lambat = database ikut tersendat',
          ],
        },
        {
          title: 'Benar',
          lang: 'js',
          code: `
          await klien.query('BEGIN');
          await klien.query('UPDATE ...');
          await klien.query('COMMIT');

          // Efek samping SETELAH commit
          await kirimEmail(pengguna.email);
          `,
          notes: ['Transaksi hanya menyentuh database', 'Kunci dilepas secepat mungkin'],
        },
      ),

      h2('Tingkat isolasi'),
      table(
        ['Tingkat', 'Mencegah', 'Catatan'],
        [
          [
            '`READ COMMITTED`',
            'Membaca data yang belum di-commit',
            '**Default Postgres** — cukup untuk hampir semua kasus',
          ],
          [
            '`REPEATABLE READ`',
            'Pembacaan yang berubah di tengah transaksi',
            'Untuk laporan yang butuh potret konsisten',
          ],
          [
            '`SERIALIZABLE`',
            'Hampir semua anomali',
            'Paling aman, paling mahal; bisa gagal dan perlu diulang',
          ],
        ],
      ),
      p(
        'Mulai dari default. Naikkan tingkat isolasi hanya kalau kamu bisa menyebutkan anomali konkret yang ingin dicegah — bukan karena terdengar lebih aman.',
      ),
    ],
  ),

  written(
    'sql-injection',
    'SQL Injection & Prepared Statement',
    12,
    'Kerentanan tertua yang masih terus terjadi, dan cara menutupnya sepenuhnya.',
    [
      p(
        'SQL injection terjadi ketika masukan pengguna berubah menjadi **perintah** SQL, bukan sekadar **nilai**. Ia sudah dikenal puluhan tahun dan masih menempati peringkat teratas OWASP — karena satu baris kode yang keliru sudah cukup.',
      ),

      h2('Bagaimana ia terjadi'),
      code(
        'js',
        `
        // KODE RENTAN — jangan pernah tulis seperti ini
        const query = \`SELECT * FROM pengguna WHERE email = '\${email}'\`;
        `,
      ),
      code(
        'sql',
        `
        -- Masukan normal: ana@contoh.com
        SELECT * FROM pengguna WHERE email = 'ana@contoh.com';

        -- Masukan penyerang: ' OR '1'='1
        SELECT * FROM pengguna WHERE email = '' OR '1'='1';
        -- -> mengembalikan SELURUH pengguna

        -- Masukan penyerang: '; DROP TABLE pengguna; --
        SELECT * FROM pengguna WHERE email = ''; DROP TABLE pengguna; --';
        -- -> tabelnya hilang
        `,
      ),
      p(
        'Kutip yang dikirim penyerang menutup string lebih awal, dan sisanya dibaca database sebagai perintah.',
      ),

      h2('Perbaikannya: prepared statement'),
      code(
        'js',
        `
        // Postgres (node-postgres)
        const hasil = await klien.query(
          'SELECT * FROM pengguna WHERE email = $1',
          [email],
        );

        // MySQL (mysql2)
        const [baris] = await koneksi.execute(
          'SELECT * FROM pengguna WHERE email = ?',
          [email],
        );
        `,
      ),
      callout(
        'info',
        'Kenapa ini benar-benar menutup celahnya',
        "Perintah dan nilainya dikirim ke database **terpisah**. Database sudah selesai mengurai struktur query sebelum melihat nilainya, jadi apa pun isi `email` — termasuk `'; DROP TABLE --` — hanya diperlakukan sebagai teks yang dicari. Ini bukan penyaringan karakter; strukturnya memang tidak bisa lagi berubah.",
      ),

      h2('Yang TIDAK menutup celahnya'),
      table(
        ['Cara', 'Kenapa gagal'],
        [
          [
            'Escape karakter sendiri',
            'Selalu ada kasus tepi yang terlewat: encoding, Unicode, multibyte',
          ],
          [
            'Blocklist kata seperti `DROP`',
            'Bisa dilewati dengan variasi huruf, komentar, atau encoding',
          ],
          ['Membatasi panjang input', 'Serangan bisa muat dalam beberapa karakter'],
          [
            'Menganggap input internal aman',
            'Data dari admin, webhook, atau tabel lain tetap bisa memuat muatan',
          ],
        ],
      ),

      h2('Yang tidak bisa diparameterkan'),
      code(
        'js',
        `
        // Nama kolom dan arah urutan TIDAK bisa jadi parameter.
        // Ini gagal (secara sintaks):
        klien.query('SELECT * FROM catatan ORDER BY $1 $2', [kolom, arah]);

        // Solusinya: ALLOW-LIST, bukan interpolasi
        const KOLOM_BOLEH = { judul: 'judul', tanggal: 'dibuat_pada' };
        const ARAH_BOLEH = { naik: 'ASC', turun: 'DESC' };

        const kolomSql = KOLOM_BOLEH[kolomDiminta] ?? 'dibuat_pada';
        const arahSql = ARAH_BOLEH[arahDiminta] ?? 'DESC';

        // Aman: nilainya berasal dari daftar yang KAMU tulis,
        // bukan dari apa pun yang dikirim klien.
        await klien.query(\`SELECT * FROM catatan ORDER BY \${kolomSql} \${arahSql}\`);
        `,
      ),
      callout(
        'warning',
        'Allow-list, bukan sanitasi',
        'Perhatikan bahwa nilai yang masuk ke query berasal dari **objek milikmu**, bukan dari input yang dibersihkan. Input klien hanya dipakai sebagai kunci pencarian. Kalau kuncinya tidak ada, dipakai nilai default. Tidak ada jalan bagi teks pengguna untuk sampai ke query.',
      ),

      h2('ORM bukan jaminan otomatis'),
      code(
        'js',
        `
        // AMAN — query builder memparameterkan sendiri
        await prisma.pengguna.findMany({ where: { email } });
        await db('pengguna').where({ email });

        // RENTAN — raw query dengan template string
        await prisma.$queryRawUnsafe(\`SELECT * FROM pengguna WHERE email = '\${email}'\`);
        await db.raw(\`SELECT * FROM pengguna WHERE email = '\${email}'\`);

        // AMAN — raw query dengan parameter
        await prisma.$queryRaw\`SELECT * FROM pengguna WHERE email = \${email}\`;
        `,
      ),
      p(
        'Perhatikan perbedaan dua baris terakhir: `$queryRaw` dengan **tagged template** memparameterkan otomatis, sementara `$queryRawUnsafe` dengan string biasa tidak. Namanya sudah memberi peringatan.',
      ),

      h2('Lapisan pertahanan kedua: hak akses minimum'),
      code(
        'sql',
        `
        -- User aplikasi tidak perlu bisa mengubah struktur tabel.
        CREATE USER app_user WITH PASSWORD '...';
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
        -- Tidak diberi: DROP, ALTER, CREATE
        `,
      ),
      p(
        'Kalau suatu hari ada injeksi yang lolos, hak akses yang sempit membatasi kerusakannya. Aplikasi yang tidak pernah mengubah skema tidak boleh terhubung sebagai pemilik skema.',
      ),
    ],
  ),

  written(
    'praktik-skema-blog',
    'Praktik: Rancang skema untuk aplikasi blog',
    13,
    'Menerapkan seluruh bab pada satu rancangan utuh.',
    [
      p(
        'Latihan penutup: rancang skema lengkap untuk blog sederhana. Semua konsep bab ini dipakai sekaligus — tipe data, key, index, relasi, batasan, dan transaksi.',
      ),

      h2('Kebutuhan'),
      ul(
        'Pengguna bisa mendaftar dan menulis artikel.',
        'Artikel punya satu penulis, banyak komentar, dan banyak tag.',
        'Tag dipakai bersama oleh banyak artikel.',
        'Komentar bisa membalas komentar lain (satu tingkat).',
        'Artikel punya status: draf, terbit, arsip.',
        'Artikel yang dihapus harus bisa dipulihkan selama 30 hari.',
      ),

      h2('Rancangannya'),
      code(
        'sql',
        `
        CREATE TABLE pengguna (
          id            BIGSERIAL PRIMARY KEY,
          email         VARCHAR(255) NOT NULL UNIQUE,
          -- Hash, bukan password. Panjangnya cukup untuk argon2/bcrypt.
          kata_sandi_hash VARCHAR(255) NOT NULL,
          nama          VARCHAR(100) NOT NULL,
          dibuat_pada   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
        );

        CREATE TABLE artikel (
          id           BIGSERIAL PRIMARY KEY,
          penulis_id   BIGINT NOT NULL REFERENCES pengguna(id) ON DELETE RESTRICT,
          judul        VARCHAR(200) NOT NULL CHECK (length(trim(judul)) > 0),
          -- Slug unik untuk URL yang stabil
          slug         VARCHAR(220) NOT NULL UNIQUE,
          isi          TEXT NOT NULL,
          status       VARCHAR(20) NOT NULL DEFAULT 'draf'
                         CHECK (status IN ('draf','terbit','arsip')),
          terbit_pada  TIMESTAMPTZ,
          dihapus_pada TIMESTAMPTZ,
          dibuat_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

          -- Artikel terbit WAJIB punya tanggal terbit.
          CHECK (status <> 'terbit' OR terbit_pada IS NOT NULL)
        );

        CREATE TABLE komentar (
          id           BIGSERIAL PRIMARY KEY,
          artikel_id   BIGINT NOT NULL REFERENCES artikel(id)  ON DELETE CASCADE,
          penulis_id   BIGINT NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
          -- Balasan; NULL berarti komentar tingkat atas
          induk_id     BIGINT REFERENCES komentar(id) ON DELETE CASCADE,
          isi          TEXT NOT NULL CHECK (length(trim(isi)) > 0),
          dibuat_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE tag (
          id   BIGSERIAL PRIMARY KEY,
          nama VARCHAR(50) NOT NULL UNIQUE,
          slug VARCHAR(60) NOT NULL UNIQUE
        );

        CREATE TABLE artikel_tag (
          artikel_id BIGINT NOT NULL REFERENCES artikel(id) ON DELETE CASCADE,
          tag_id     BIGINT NOT NULL REFERENCES tag(id)     ON DELETE CASCADE,
          PRIMARY KEY (artikel_id, tag_id)
        );
        `,
        { filename: 'migrations/001_skema_blog.sql' },
      ),

      h2('Index'),
      code(
        'sql',
        `
        -- Setiap foreign key
        CREATE INDEX idx_artikel_penulis   ON artikel(penulis_id);
        CREATE INDEX idx_komentar_artikel  ON komentar(artikel_id);
        CREATE INDEX idx_komentar_penulis  ON komentar(penulis_id);
        CREATE INDEX idx_komentar_induk    ON komentar(induk_id);
        CREATE INDEX idx_artikel_tag_tag   ON artikel_tag(tag_id);

        -- Query paling sering: daftar artikel terbit, terbaru dulu.
        -- Partial index: hanya mengindeks baris yang benar-benar dicari.
        CREATE INDEX idx_artikel_terbit
          ON artikel(terbit_pada DESC)
          WHERE status = 'terbit' AND dihapus_pada IS NULL;
        `,
      ),
      callout(
        'tip',
        'Partial index lebih kecil dan lebih cepat',
        'Klausa `WHERE` pada `CREATE INDEX` membuat index hanya memuat baris yang relevan. Halaman depan blog tidak pernah mencari draf atau artikel terhapus, jadi keduanya tidak perlu ikut diindeks. Index yang lebih kecil berarti lebih banyak muat di memori.',
      ),

      h2('Query yang harus bisa kamu tulis'),
      code(
        'sql',
        `
        -- 1. Halaman depan: 10 artikel terbit terbaru + nama penulis
        SELECT a.id, a.judul, a.slug, a.terbit_pada, p.nama AS penulis
        FROM artikel a
        JOIN pengguna p ON p.id = a.penulis_id
        WHERE a.status = 'terbit' AND a.dihapus_pada IS NULL
        ORDER BY a.terbit_pada DESC, a.id DESC
        LIMIT 10;

        -- 2. Satu artikel beserta tag-nya
        SELECT a.*, t.nama AS tag
        FROM artikel a
        LEFT JOIN artikel_tag at ON at.artikel_id = a.id
        LEFT JOIN tag t          ON t.id = at.tag_id
        WHERE a.slug = 'belajar-sql' AND a.dihapus_pada IS NULL;

        -- 3. Jumlah komentar per artikel (perhatikan COUNT(k.id), bukan COUNT(*))
        SELECT a.judul, COUNT(k.id) AS jumlah_komentar
        FROM artikel a
        LEFT JOIN komentar k ON k.artikel_id = a.id
        WHERE a.status = 'terbit'
        GROUP BY a.id, a.judul
        ORDER BY jumlah_komentar DESC;

        -- 4. Penulis dengan lebih dari 5 artikel terbit
        SELECT p.nama, COUNT(*) AS jumlah
        FROM pengguna p
        JOIN artikel a ON a.penulis_id = p.id
        WHERE a.status = 'terbit'
        GROUP BY p.id, p.nama
        HAVING COUNT(*) > 5;

        -- 5. Bersihkan artikel yang terhapus lebih dari 30 hari
        DELETE FROM artikel
        WHERE dihapus_pada IS NOT NULL
          AND dihapus_pada < NOW() - INTERVAL '30 days';
        `,
      ),

      h2('Menerbitkan artikel dalam satu transaksi'),
      code(
        'sql',
        `
        BEGIN;

        UPDATE artikel
        SET status = 'terbit', terbit_pada = NOW()
        WHERE id = 42
          AND penulis_id = 7        -- otorisasi di lapisan data
          AND status = 'draf';      -- hanya draf yang bisa diterbitkan

        -- Kalau 0 baris terpengaruh: bukan miliknya, atau bukan draf.
        -- Aplikasi harus memeriksanya dan ROLLBACK.

        INSERT INTO artikel_tag (artikel_id, tag_id)
        SELECT 42, id FROM tag WHERE slug = ANY($1)
        ON CONFLICT DO NOTHING;

        COMMIT;
        `,
      ),
      callout(
        'danger',
        'Perhatikan `AND penulis_id = 7`',
        'Ini bukan sekadar kehati-hatian. Tanpa syarat itu, siapa pun yang tahu id artikel bisa menerbitkan tulisan orang lain — itulah IDOR (sub-bab 5.7). Menyembunyikan tombolnya di antarmuka **bukan** kontrol akses; pemeriksaannya harus ada di query yang benar-benar mengubah data.',
      ),

      h2('Pertanyaan rancangan'),
      steps(
        {
          title: 'Kenapa `penulis_id` di artikel memakai `RESTRICT`, bukan `CASCADE`?',
          body: 'Menghapus satu pengguna tidak boleh menghapus artikelnya secara diam-diam. `RESTRICT` memaksa keputusan itu dibuat sadar — misalnya dengan memindahkan artikelnya ke akun "penulis dihapus" lebih dulu.',
        },
        {
          title: 'Kenapa `slug` perlu `UNIQUE` padahal sudah ada `id`?',
          body: 'Slug yang muncul di URL harus stabil dan tidak boleh bertabrakan. `UNIQUE` juga otomatis membuat index, sehingga pencarian berdasarkan slug jadi cepat tanpa index tambahan.',
        },
        {
          title: "Kenapa `CHECK (status <> 'terbit' OR terbit_pada IS NOT NULL)`?",
          body: 'Ia membuat keadaan mustahil menjadi tidak bisa dinyatakan: artikel berstatus terbit tanpa tanggal terbit akan ditolak database. Aturan yang ditegakkan di lapisan data berlaku untuk semua penulis, termasuk skrip dan migrasi.',
        },
      ),

      divider,

      checklist(
        'bb2-praktik',
        'Checklist praktik bab ini',
        'Buat seluruh tabel di database lokal dan pastikan tidak ada error',
        'Isi data contoh: 3 pengguna, 10 artikel, 20 komentar, 5 tag',
        'Tulis kelima query di atas dan bandingkan hasilnya dengan yang kamu harapkan',
        'Jalankan `EXPLAIN ANALYZE` pada query halaman depan; pastikan index dipakai',
        'Coba masukkan artikel berstatus terbit tanpa `terbit_pada` — pastikan ditolak',
        'Coba masukkan komentar dengan `artikel_id` yang tidak ada — pastikan ditolak',
        'Coba `UPDATE` tanpa `WHERE` di database uji, lalu `ROLLBACK` — rasakan akibatnya',
        'Tulis satu query dengan `LEFT JOIN` + syarat di `WHERE`, lihat baris yang hilang, lalu perbaiki dengan memindahkannya ke `ON`',
        'Pastikan tidak ada satu pun query di kodemu yang dirangkai dengan penggabungan string',
      ),
    ],
  ),
];
