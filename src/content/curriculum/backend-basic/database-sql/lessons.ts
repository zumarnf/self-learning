import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  p,
  references,
  steps,
  table,
  terms,
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

      terms(
        {
          term: 'database relasional',
          meaning:
            'Penyimpanan data berbentuk tabel yang saling berhubungan. Disebut "relasional" karena hubungan antar tabel adalah bagian resmi dari modelnya — bukan sesuatu yang kamu urus sendiri di kode.',
        },
        {
          term: 'concurrency (permintaan bersamaan)',
          meaning:
            'Dua atau lebih permintaan berjalan pada waktu yang sama. Di server ini **keadaan normal**, bukan kemungkinan kecil. Contoh di bawah menunjukkan akibatnya pada berkas biasa: satu catatan hilang tanpa error apa pun.',
        },
        {
          term: 'lost update',
          meaning:
            'Nama masalah pada contoh pertama: dua proses membaca isi yang sama, keduanya menambah, lalu yang kedua **menimpa** hasil yang pertama. Tidak ada pengecualian yang dilempar — datanya hanya lenyap.',
        },
        {
          term: 'index',
          meaning:
            'Struktur tambahan yang membuat database bisa menemukan baris tertentu **tanpa membaca seluruh tabel**. Ini yang membedakan pencarian di database dari `find()` pada array 500 MB yang harus dimuat ke memori lebih dulu.',
        },
        {
          term: 'constraint',
          meaning:
            'Aturan yang ditegakkan **database sendiri** dan bukan kode aplikasi, misalnya `NOT NULL`, `UNIQUE`, dan `FOREIGN KEY`. Bedanya menentukan, sebab aturan di kode bisa dilupakan pada satu jalur penulisan sedangkan aturan di database tidak bisa dilewati siapa pun.',
        },
        {
          term: 'NOT NULL',
          meaning:
            'Constraint yang melarang kolom dikosongkan. Menjawab masalah `"judul": null` di contoh: bukan lagi soal ingat memvalidasi, melainkan soal database menolak menyimpannya.',
        },
        {
          term: 'UNIQUE',
          meaning:
            'Constraint yang melarang dua baris punya nilai sama di kolom itu. Ia yang mencegah `id` ganda — dan yang membuat "cek dulu, baru simpan" tidak lagi rawan diselipi permintaan lain di antaranya.',
        },
        {
          term: 'FOREIGN KEY',
          meaning:
            'Constraint yang memastikan sebuah nilai benar-benar menunjuk baris yang ada di tabel lain. Ia yang membuat `penulisId: 999` ditolak kalau pengguna 999 tidak ada — masalah yang mustahil dijaga oleh berkas JSON.',
        },
        {
          term: 'transaksi',
          meaning:
            'Sekumpulan perubahan yang **berhasil bersama atau gagal bersama**. Ia jawaban untuk masalah keempat: transfer saldo yang mati di tengah jalan tidak boleh meninggalkan uang yang lenyap.',
        },
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
      references(
        {
          label: 'PostgreSQL — Data Consistency Checks',
          href: 'https://www.postgresql.org/docs/17/mvcc.html',
          source: 'PostgreSQL',
          note: 'Cara database menangani penulis bersamaan tanpa saling menimpa.',
        },
        {
          label: 'PostgreSQL — Constraints',
          href: 'https://www.postgresql.org/docs/17/ddl-constraints.html',
          source: 'PostgreSQL',
          note: '`NOT NULL`, `UNIQUE`, dan `FOREIGN KEY` yang menjawab masalah ketiga.',
        },
        {
          label: 'SQLite — Appropriate Uses For SQLite',
          href: 'https://www.sqlite.org/whentouse.html',
          source: 'SQLite',
          note: 'Panduan jujur kapan database memang tidak diperlukan — pelengkap tabel di atas.',
        },
        {
          label: 'PostgreSQL — Transactions',
          href: 'https://www.postgresql.org/docs/17/tutorial-transactions.html',
          source: 'PostgreSQL',
          note: 'Jawaban untuk masalah keempat: perubahan yang berhasil bersama atau gagal bersama.',
        },
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

      terms(
        {
          term: 'tabel',
          meaning:
            'Wadah data berbentuk kotak-kotak: **kolom** mendefinisikan bentuk, **baris** menyimpan datanya. Bentuknya ditetapkan lebih dulu lewat `CREATE TABLE` — dan itu fitur, bukan batasan.',
        },
        {
          term: 'schema (skema)',
          meaning:
            'Definisi bentuk data, yang menyebut kolom apa saja, tipenya apa, dan aturan apa yang berlaku. Perbedaan pentingnya dari kode aplikasi adalah skema berlaku untuk **siapa pun** yang menulis, entah aplikasimu, skrip migrasi, atau seseorang yang menjalankan `psql` tengah malam.',
        },
        {
          term: 'VARCHAR(n) vs TEXT',
          meaning:
            '`VARCHAR(200)` membatasi panjang; `TEXT` tidak. Di PostgreSQL keduanya sama cepat, jadi pilihannya bukan soal performa melainkan soal **validasi**: batas panjang di skema adalah satu lapis penjagaan tambahan yang gratis.',
        },
        {
          term: 'NUMERIC(12,2)',
          meaning:
            'Tipe angka **eksak** dengan 12 digit total dan 2 di belakang koma — tipe yang benar untuk uang. Lawannya `FLOAT`, yang menyimpan perkiraan: `0.1 + 0.2` tidak sama dengan `0.3`, dan kesalahannya menumpuk diam-diam sampai laporan keuangan tidak cocok.',
        },
        {
          term: 'TIMESTAMPTZ',
          meaning:
            'Waktu **beserta zona waktunya** — dan tipe yang harus kamu pakai. `TIMESTAMP` tanpa `TZ` menyimpan "2026-08-02 10:00" tanpa konteks: jam sepuluh **di mana**? Server yang pindah zona, atau pengguna di zona lain, langsung membuatnya ambigu.',
        },
        {
          term: 'BIGSERIAL',
          meaning:
            'Tipe PostgreSQL yang membuat kolom angka bertambah otomatis setiap baris baru — dipakai untuk `id`. Awalan `BIG` berarti ia `BIGINT`, jadi tidak akan kehabisan angka seperti `SERIAL` biasa (~2,1 miliar).',
        },
        {
          term: 'JSONB',
          meaning:
            'Tipe untuk data yang bentuknya tidak tetap, disimpan dalam format biner sehingga **bisa diindeks**. Peringatannya: jangan dipakai untuk semuanya — begitu data masuk JSONB, kamu kehilangan constraint dan tipe yang jadi alasan memakai database relasional.',
        },
        {
          term: 'NULL',
          meaning:
            'Berarti **"tidak diketahui"** — bukan nol, bukan string kosong, bukan `false`. Konsekuensinya mengejutkan: `judul = NULL` **selalu** menghasilkan kosong (harus `IS NULL`), dan `100 + NULL` menghasilkan `NULL`, bukan `100`.',
        },
        {
          term: 'CHECK',
          meaning:
            "Constraint berisi syarat yang harus dipenuhi setiap baris — `CHECK (status IN ('draf','terbit'))`. Ia mengubah aturan yang biasanya hidup di kode menjadi aturan yang **tidak bisa dilewati siapa pun**.",
        },
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
      p(
        'Lima baris itu bukan sekadar daftar kolom — masing-masing menuliskan sebuah **janji yang dijaga database**, bukan oleh kodemu. `BIGSERIAL PRIMARY KEY` melakukan dua hal sekaligus: mengisi `id` otomatis untuk setiap baris baru, dan menjamin tidak ada dua baris dengan `id` sama. `NOT NULL` pada `judul` dan `isi` berarti `INSERT` yang lupa mengisinya akan **ditolak**, bukan diam-diam tersimpan sebagai kosong. `DEFAULT FALSE` pada `diarsipkan` membuat baris lama tetap punya nilai yang masuk akal saat kolom itu ditambahkan, sehingga kamu tidak pernah harus menangani `NULL` yang artinya "belum diputuskan".',
      ),
      p(
        'Perhatikan `dibuat_pada` mengambil nilainya dari `NOW()` di sisi **database**, bukan dari `new Date()` di aplikasi. Bedanya terasa saat kamu punya dua server aplikasi yang jamnya meleset beberapa detik, atau saat data dimasukkan lewat skrip lain di luar aplikasimu: dengan `DEFAULT NOW()`, semua baris memakai satu sumber waktu yang sama. Aturan umumnya, apa pun yang bisa dijamin oleh definisi tabel sebaiknya dijamin di sana — validasi di kode masih perlu untuk memberi pesan yang ramah, tapi ia bisa dilupakan, sementara constraint tabel tidak bisa dilewati siapa pun.',
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
      p(
        'Dua baris pertama terlihat setara padahal hasilnya berbeda jauh, dan inilah sumber bug SQL yang paling sering menipu pemula. `judul = NULL` selalu kosong karena SQL memperlakukan `NULL` sebagai "tidak diketahui": membandingkan sesuatu yang tidak diketahui dengan apa pun tidak menghasilkan benar maupun salah, melainkan tetap tidak diketahui — dan baris hanya ikut terpilih kalau syaratnya benar-benar **benar**. Karena itu satu-satunya cara memeriksanya adalah operator khusus `IS NULL`. Logika yang sama menjelaskan `100 + NULL` menghasilkan `NULL`: menambahkan angka yang tidak diketahui pada 100 memang tidak bisa menghasilkan angka yang diketahui.',
      ),
      p(
        'Dua baris `COUNT` terakhir adalah jebakan turunannya yang paling mahal, karena keduanya berjalan tanpa error dan hanya berbeda angkanya. `COUNT(*)` menghitung **baris**, sedangkan `COUNT(kolom)` menghitung **nilai yang tidak NULL** pada kolom itu. Pada tabel 1.000 baris yang 300 di antaranya belum mengisi kolom tersebut, yang pertama menjawab 1.000 dan yang kedua menjawab 700. Kalau yang kamu maksud adalah "berapa banyak catatan", pakai `COUNT(*)`; `COUNT(kolom)` baru tepat ketika pertanyaanmu memang "berapa banyak yang sudah mengisi kolom ini".',
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
      references(
        {
          label: 'PostgreSQL — Data Types',
          href: 'https://www.postgresql.org/docs/17/datatype.html',
          source: 'PostgreSQL',
          note: 'Daftar lengkap tipe beserta batas nilainya.',
        },
        {
          label: 'Numeric Types — arbitrary precision',
          href: 'https://www.postgresql.org/docs/17/datatype-numeric.html#DATATYPE-NUMERIC-DECIMAL',
          source: 'PostgreSQL',
          note: 'Kenapa `NUMERIC` eksak dan `FLOAT` tidak — dasar aturan penyimpanan uang.',
        },
        {
          label: 'Date/Time Types — timestamp with time zone',
          href: 'https://www.postgresql.org/docs/17/datatype-datetime.html',
          source: 'PostgreSQL',
          note: 'Beda `TIMESTAMP` dan `TIMESTAMPTZ`, beserta akibatnya saat server pindah zona.',
        },
        {
          label: 'Constraints — CHECK, NOT NULL, UNIQUE',
          href: 'https://www.postgresql.org/docs/17/ddl-constraints.html',
          source: 'PostgreSQL',
          note: 'Cara memindahkan aturan dari kode aplikasi ke lapisan yang tidak bisa dilewati.',
        },
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

      terms(
        {
          term: 'primary key',
          meaning:
            'Kolom yang menjawab **"baris ini yang mana"** — unik, tidak boleh `NULL`, dan tidak berubah. Setiap tabel harus punya satu. Ia soal **kebenaran**, bukan kecepatan.',
        },
        {
          term: 'foreign key',
          meaning:
            'Kolom yang menjawab **"milik siapa"** dengan menunjuk primary key tabel lain. Ia menegakkan dua hal sekaligus: nilai yang menunjuk baris tak-ada akan ditolak, dan tidak ada anak yatim yang tertinggal saat induknya hilang.',
        },
        {
          term: 'index',
          meaning:
            'Struktur pencarian yang menjawab **"bagaimana menemukannya cepat"**. Berbeda dari dua yang di atas: primary key dan foreign key soal kebenaran, index murni soal **kecepatan**.',
        },
        {
          term: 'UUID',
          meaning:
            'Singkatan *Universally Unique Identifier*, yaitu id acak 16 byte yang tidak bisa ditebak berurutan. Kelebihannya, id ini bisa dibuat klien sebelum insert dan tidak membocorkan jumlah data. Kekurangannya, ukurannya dua kali lebih besar dan kurang ramah index karena acak.',
        },
        {
          term: 'ON DELETE CASCADE',
          meaning:
            'Aturan yang membuat baris anak **ikut terhapus** saat induknya dihapus. Bahayanya sering diremehkan: satu rantai `CASCADE` bisa ikut menghapus catatan, komentarnya, dan komentar orang lain di catatan itu. Untuk data penting, `RESTRICT` lebih aman.',
        },
        {
          term: 'ON DELETE RESTRICT',
          meaning:
            'Aturan yang **menolak** penghapusan selama masih ada anak. Ia memaksa penghapusan dilakukan sadar dan berurutan, bukan sebagai efek samping yang baru disadari setelah data hilang.',
        },
        {
          term: 'composite index',
          meaning:
            'Index atas beberapa kolom sekaligus — dan **urutannya penting**. `(penulis_id, dibuat_pada)` dipakai untuk `WHERE penulis_id = 42`, tapi **tidak** dipakai untuk `WHERE dibuat_pada > ...` saja. Aturannya: index bisa dipakai dari kolom paling kiri.',
        },
        {
          term: 'biaya index',
          meaning:
            'Setiap index memperlambat `INSERT`, `UPDATE`, dan `DELETE` karena harus ikut diperbarui, dan memakan ruang disk. Tabel dengan lima belas index yang jarang dipakai **lebih lambat menulis tanpa manfaat membaca**. Tambahkan index karena query yang lambat, bukan karena berjaga-jaga.',
        },
        {
          term: 'EXPLAIN ANALYZE',
          meaning:
            'Perintah yang menampilkan rencana eksekusi yang **benar-benar dijalankan** beserta waktunya. `Seq Scan` pada tabel besar berarti index tidak dipakai; `Index Scan` berarti dipakai. Jangan menebak — perintah ini yang menjawabnya.',
        },
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
      p(
        'Keduanya sama-sama sah, dan pilihannya bukan soal mana yang lebih modern melainkan **apa yang bocor lewat id-mu**. `BIGSERIAL` menghasilkan 1, 2, 3, … sehingga siapa pun yang melihat `/catatan/42` bisa menebak bahwa `/catatan/41` ada, dan bisa memperkirakan berapa banyak data yang kamu punya hanya dari angka id terbesar yang pernah ia lihat. `gen_random_uuid()` menghasilkan nilai acak 128-bit yang tidak bisa ditebak — tapi ingat, id yang tidak bisa ditebak **bukan pengganti pemeriksaan izin**; ia hanya menutup satu jalur intip, bukan mengunci pintunya.',
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
        'ID yang bisa ditebak hanya berbahaya kalau otorisasinya bocor, dan itulah yang disebut IDOR (sub-bab 5.7). Memakai UUID **tidak** menggantikan pemeriksaan kepemilikan, karena ia hanya membuat penyerang tidak bisa menjelajah data dengan menaikkan angka. Perbaikan sebenarnya tetap sama, yaitu setiap query di-scope ke pemiliknya.',
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
        -- Composite index: URUTANNYA PENTING
        CREATE INDEX idx_catatan_penulis_waktu
          ON catatan(penulis_id, dibuat_pada DESC);

        -- Dipakai:        WHERE penulis_id = 42
        -- Dipakai:        WHERE penulis_id = 42 ORDER BY dibuat_pada DESC
        -- TIDAK dipakai:  WHERE dibuat_pada > '2026-01-01'   (kolom kedua saja)
        `,
      ),
      p(
        'Tiga baris komentar di bawah perintah itu adalah inti pelajarannya. Bayangkan composite index seperti buku telepon yang diurutkan menurut **nama keluarga lalu nama depan**. Mencari "Wijaya" mudah, mencari "Wijaya, Andi" lebih mudah lagi, tapi mencari semua orang bernama depan "Andi" tanpa tahu nama keluarganya memaksamu membaca seluruh buku. Persis itu yang terjadi pada baris ketiga, sebab `dibuat_pada` adalah kolom kedua sehingga tanpa nilai `penulis_id` database tidak punya titik masuk dan terpaksa memindai seluruh tabel. Karena itu urutan kolom dalam `CREATE INDEX` bukan selera, melainkan ditentukan oleh bentuk `WHERE` yang benar-benar kamu jalankan.',
      ),
      p(
        'Baris kedua menunjukkan bonus yang sering terlewat: `ORDER BY dibuat_pada DESC` ikut tertolong karena datanya **sudah tersimpan terurut** di dalam index, sehingga database tidak perlu mengurutkan ulang hasilnya. Itulah alasan `DESC` ditulis di dalam definisi index — ia dicocokkan dengan arah urutan yang paling sering dipakai halaman "catatan terbaru".',
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
        'Baca keluarannya dari kata pertama. `Seq Scan` (sequential scan) berarti database membaca tabel **baris demi baris dari awal sampai akhir**, sedangkan `Index Scan` berarti ia melompat langsung ke baris yang cocok lewat index. Angka `rows=12` menunjukkan ia hanya butuh 12 baris, dan justru itu yang membuat `Seq Scan` di sini mencurigakan, sebab membaca ribuan baris untuk mendapat dua belas adalah kerja yang hampir seluruhnya terbuang. Perhatikan juga `cost=0.00..1834.00`, di mana angka pertama adalah perkiraan biaya sampai baris pertama keluar dan angka kedua sampai semuanya selesai. Nilainya bukan detik melainkan satuan internal, jadi ia berguna untuk **membandingkan** dua rencana alih-alih dibaca sebagai waktu.',
      ),
      p(
        'Ada satu peringatan penting, yaitu `Seq Scan` tidak selalu salah. Pada tabel kecil berisi puluhan atau ratusan baris, membaca semuanya justru lebih cepat daripada bolak-balik ke index, dan perencana Postgres memang sengaja memilihnya. Karena itu ujilah dengan data yang jumlahnya realistis, sebab index yang tampak "tidak dipakai" di tabel berisi sepuluh baris uji coba sering terbukti dipakai begitu datanya puluhan ribu. Yang tidak boleh dilakukan adalah menebak, jadi jalankan `EXPLAIN ANALYZE` lalu baca rencana yang **benar-benar** dijalankan beserta waktunya.',
      ),
      references(
        {
          label: 'PostgreSQL — Primary & Foreign Keys',
          href: 'https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-FK',
          source: 'PostgreSQL',
          note: 'Termasuk seluruh opsi `ON DELETE` beserta akibatnya masing-masing.',
        },
        {
          label: 'PostgreSQL — Indexes',
          href: 'https://www.postgresql.org/docs/17/indexes.html',
          source: 'PostgreSQL',
          note: 'Jenis index, composite index, dan aturan kolom paling kiri.',
        },
        {
          label: 'Using EXPLAIN',
          href: 'https://www.postgresql.org/docs/17/using-explain.html',
          source: 'PostgreSQL',
          note: 'Membaca rencana eksekusi — cara membuktikan index dipakai, bukan menebaknya.',
        },
        {
          label: 'UUID Type & gen_random_uuid()',
          href: 'https://www.postgresql.org/docs/17/datatype-uuid.html',
          source: 'PostgreSQL',
          note: 'Alternatif id berurutan, beserta harga ukuran dan keramahan index-nya.',
        },
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

      terms(
        {
          term: 'SELECT *',
          meaning:
            'Meminta **semua** kolom. Boleh saat menjelajah manual di `psql`; **jangan di kode**. Tiga alasannya: mengirim kolom yang tidak dipakai lewat jaringan, ikut berubah diam-diam saat skema berubah, dan gampang membocorkan kolom sensitif seperti `password_hash` ke respons API.',
        },
        {
          term: 'WHERE',
          meaning:
            'Klausa penyaring — hanya baris yang memenuhi syaratnya yang dikembalikan. Operatornya lebih kaya dari yang biasa dipakai: `BETWEEN`, `IN`, `ILIKE`, `IS NULL`, dan gabungan `AND`/`OR`.',
        },
        {
          term: 'presedensi AND/OR',
          meaning:
            '`AND` dievaluasi **lebih dulu** daripada `OR`. Tanpa tanda kurung, `a = 1 OR a = 2 AND b = 3` berarti `a = 1 OR (a = 2 AND b = 3)` — hampir selalu bukan yang kamu maksud. Bug ini tidak menimbulkan error, hanya hasil yang salah.',
        },
        {
          term: 'ILIKE',
          meaning:
            'Versi `LIKE` milik PostgreSQL yang **mengabaikan huruf besar/kecil**. Huruf `I` di depan berarti *insensitive*. Di database lain, padanannya biasanya `LOWER(kolom) LIKE LOWER(...)`.',
        },
        {
          term: 'wildcard di depan',
          meaning:
            "Pola `LIKE '%React%'` yang diawali `%`. Ia **mematikan index** — database terpaksa memindai seluruh tabel. Untuk pencarian teks sungguhan, pakai full-text search (`to_tsvector`) atau ekstensi `pg_trgm`.",
        },
        {
          term: 'LIMIT / OFFSET',
          meaning:
            '`LIMIT` membatasi jumlah baris, `OFFSET` melewati sekian baris pertama. Bersama, keduanya membentuk paginasi paling sederhana — dan paling lambat saat halamannya dalam.',
        },
        {
          term: 'paginasi keyset',
          meaning:
            'Alternatif `OFFSET` yang memakai nilai baris terakhir sebagai penanda: `WHERE id < 10023 LIMIT 20`. Kecepatannya **tetap** di halaman mana pun, dan hasilnya tidak bergeser saat ada data baru. Harganya: hanya bisa maju/mundur, tidak bisa lompat ke halaman tertentu.',
        },
        {
          term: 'batas LIMIT dari server',
          meaning:
            'Nilai maksimum yang boleh diminta klien. Kalau `?perHalaman=1000000` diterima apa adanya, satu permintaan bisa menghabiskan memori server. Batasi dengan `Math.min(diminta, 100)` — ini pertahanan sumber daya, bukan kerapian.',
        },
        {
          term: 'urutan tidak stabil',
          meaning:
            'Ketika banyak baris punya nilai `ORDER BY` yang sama, urutannya bisa **berbeda antar pemanggilan** sehingga paginasi jadi kacau, karena satu item bisa muncul dua kali atau justru terlewat. Obatnya adalah menambahkan pemecah seri yang unik, biasanya `id`.',
        },
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
      p(
        'Lima klausa itu selalu ditulis dalam urutan tersebut, tetapi database **menjalankannya** dengan urutan yang berbeda, dan memahami hal ini menghilangkan banyak kebingungan nanti. Yang pertama dikerjakan adalah `FROM` (ambil tabelnya), lalu `WHERE` menyaring baris, kemudian `SELECT` memilih kolom, `ORDER BY` mengurutkan hasilnya, dan terakhir `LIMIT`/`OFFSET` memotong bagian yang dikirim. Itu sebabnya `LIMIT 20` tidak berarti "ambil 20 baris pertama lalu urutkan". Pengurutan terjadi lebih dulu atas **seluruh** baris yang lolos `WHERE`, jadi 20 yang kamu terima benar-benar 20 yang terbaru dan bukan 20 sembarang.',
      ),
      p(
        'Perhatikan juga `LIMIT 20` ada di sana sejak query paling dasar. Kebiasaan itu disengaja: tabel yang hari ini berisi 50 baris bisa berisi 5 juta tahun depan, dan `SELECT` tanpa `LIMIT` akan menarik semuanya ke memori aplikasimu sekaligus. Anggap batas jumlah baris sebagai bagian wajib dari setiap query yang menghadap pengguna, bukan tambahan yang dipasang belakangan saat sudah lambat.',
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
      p(
        'Tujuh baris itu sengaja disusun dari yang paling sederhana ke yang paling mudah salah. `BETWEEN` mencakup **kedua ujungnya** — `BETWEEN 10000 AND 50000` ikut memilih harga tepat 50.000, hal yang sering terlewat saat membuat rentang bersambung. `IN (...)` adalah cara ringkas menulis rangkaian `OR` untuk kolom yang sama, dan lebih terbaca ketika pilihannya bertambah. `ILIKE` khas PostgreSQL: ia sama dengan `LIKE` tetapi mengabaikan besar-kecil huruf, jadi di database lain kamu perlu `LOWER(judul) LIKE ...`.',
      ),
      p(
        'Baris `dihapus_pada IS NULL` layak diperhatikan tersendiri karena ia pola yang akan sering kamu pakai: alih-alih benar-benar menghapus baris, banyak aplikasi hanya mengisi kolom waktu penghapusan (*soft delete*), sehingga "yang masih aktif" berarti "yang kolom itu masih kosong". Dan sesuai aturan `NULL` di sub-bab sebelumnya, satu-satunya cara memeriksanya adalah `IS NULL` — menulis `dihapus_pada = NULL` di sini akan menghasilkan daftar kosong tanpa satu pun pesan error.',
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
      p(
        'Perbedaan nyatanya ada pada satu baris. Kolom kiri memakai `OFFSET 10000` sedangkan kolom kanan memakai `WHERE id < 10023`. Yang kiri memaksa database membaca sepuluh ribu baris hanya untuk membuangnya, sedangkan yang kanan **melompat langsung** ke posisi itu lewat index `id`, persis seperti membuka buku pada halaman bertanda alih-alih menghitung halaman satu per satu dari depan. Angka `10023` bukan nomor halaman melainkan `id` baris terakhir yang sudah diterima klien pada permintaan sebelumnya. Itulah sebabnya cara ini hanya bisa maju atau mundur satu langkah, dan tidak bisa melompat ke "halaman 500".',
      ),
      p(
        'Catatan "tidak bergeser saat ada data baru" adalah keunggulan yang paling sering diremehkan. Dengan `OFFSET`, satu catatan baru yang masuk sementara pengguna membaca halaman 1 akan menggeser seluruh daftar satu posisi, sehingga item terakhir halaman 1 muncul lagi sebagai item pertama halaman 2. Dengan keyset, penandanya adalah `id` yang nilainya tetap, jadi masuknya data baru tidak memengaruhi apa pun. Pakai `OFFSET` untuk panel admin yang butuh lompat halaman; pakai keyset untuk umpan yang di-scroll terus dan daftar yang datanya sering bertambah.',
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
      p(
        'SQL tidak menjanjikan urutan apa pun untuk baris yang nilai `ORDER BY`-nya **sama** — database bebas mengembalikannya dalam susunan berbeda setiap kali, tergantung rencana eksekusi yang ia pilih saat itu. Selama datanya tampil di satu halaman, tidak ada yang terasa. Masalahnya muncul di paginasi: kalau lima catatan punya `dibuat_pada` identik dan urutannya berubah antara permintaan halaman 1 dan halaman 2, satu catatan bisa muncul dua kali sementara yang lain tidak pernah terlihat sama sekali.',
      ),
      p(
        'Baris kedua menutup celah itu dengan menambahkan `id DESC` sebagai **pemecah seri**. Karena `id` unik, tidak akan pernah ada dua baris yang seluruh kunci urutannya sama, sehingga hasilnya pasti sama di setiap pemanggilan. Jadikan ini kebiasaan: setiap `ORDER BY` yang dipakai untuk paginasi diakhiri dengan kolom unik — biayanya nyaris nol, dan ia menutup bug yang sangat sulit dilacak karena hanya muncul sesekali.',
      ),
      references(
        {
          label: 'SELECT',
          href: 'https://www.postgresql.org/docs/17/sql-select.html',
          source: 'PostgreSQL',
          note: 'Rujukan lengkap seluruh klausa beserta urutan evaluasinya.',
        },
        {
          label: 'LIMIT and OFFSET',
          href: 'https://www.postgresql.org/docs/17/queries-limit.html',
          source: 'PostgreSQL',
          note: 'Termasuk peringatan resmi bahwa `OFFSET` besar tetap memindai baris yang dilewati.',
        },
        {
          label: 'Pattern Matching — LIKE & ILIKE',
          href: 'https://www.postgresql.org/docs/17/functions-matching.html',
          source: 'PostgreSQL',
          note: 'Kenapa wildcard di depan mematikan index, dan alternatif pencarian teksnya.',
        },
        {
          label: 'Full Text Search',
          href: 'https://www.postgresql.org/docs/17/textsearch.html',
          source: 'PostgreSQL',
          note: "Pengganti `LIKE '%kata%'` untuk pencarian teks pada tabel besar.",
        },
      ),
    ],
  ),

  written(
    'insert-update-delete',
    '`INSERT`, `UPDATE`, `DELETE`',
    10,
    'Tiga perintah yang mengubah data — dan cara tidak merusaknya.',
    [
      terms(
        {
          term: 'RETURNING',
          meaning:
            'Klausa PostgreSQL yang mengembalikan baris yang baru dibuat atau diubah, dalam perintah yang sama. Ia menghemat satu perjalanan: tanpa itu kamu harus `INSERT` lalu `SELECT` lagi untuk mendapat id dan nilai default — dua query, dengan celah waktu di antaranya.',
        },
        {
          term: 'UPDATE tanpa WHERE',
          meaning:
            'Kesalahan paling mahal di sub-bab ini. Satu perintah, **semua baris** berubah. Tidak ada konfirmasi, tidak ada pembatalan. Kebiasaan yang menyelamatkan: tulis `WHERE` **lebih dulu**, baru `SET`.',
        },
        {
          term: 'uji dengan SELECT dulu',
          meaning:
            'Menjalankan `SELECT count(*)` dengan `WHERE` **yang sama persis** sebelum menjalankan `UPDATE` atau `DELETE` di data sungguhan. Angkanya memberi tahu berapa baris yang akan kena — sebelum kena.',
        },
        {
          term: 'baca-lalu-tulis',
          meaning:
            'Pola `SELECT` nilai, hitung di aplikasi, lalu `UPDATE`. Ia **rawan balapan**: dua permintaan bersamaan sama-sama membaca `10`, sama-sama menulis `9`, dan satu penjualan hilang tanpa error apa pun.',
        },
        {
          term: 'perhitungan di dalam query',
          meaning:
            'Obat untuk masalah di atas: `SET stok = stok - 1 WHERE id = 7 AND stok > 0`. Perhitungan terjadi **di dalam database dalam satu operasi**, jadi tidak ada celah untuk diselipi. Periksa jumlah baris terpengaruh — nol berarti stok sudah habis.',
        },
        {
          term: 'soft delete',
          meaning:
            'Menandai baris sebagai terhapus (`dihapus_pada = NOW()`) alih-alih benar-benar menghapusnya. Berguna untuk data yang mungkin perlu dipulihkan atau diaudit — tapi ia punya biaya yang sering dilupakan.',
        },
        {
          term: 'biaya soft delete',
          meaning:
            'Dua hal yang jarang disebut. Pertama, **setiap** query dari sekarang wajib menambahkan `WHERE dihapus_pada IS NULL`, karena satu saja yang lupa membuat data terhapus muncul lagi. Kedua, constraint `UNIQUE` tetap berlaku pada baris "terhapus", sehingga email yang dihapus tidak bisa didaftarkan ulang.',
        },
        {
          term: 'UPSERT',
          meaning:
            'Gabungan *update* dan *insert*: simpan kalau belum ada, perbarui kalau sudah. Di PostgreSQL ditulis `ON CONFLICT ... DO UPDATE`. Ia menggantikan pola "cek dulu, lalu insert atau update" yang punya celah balapan di antaranya.',
        },
        {
          term: 'EXCLUDED',
          meaning:
            'Tabel semu di dalam `ON CONFLICT DO UPDATE` yang berisi nilai yang **tadinya akan** dimasukkan. `SET nilai = EXCLUDED.nilai` berarti "pakai nilai baru yang barusan ditolak karena bentrok".',
        },
        {
          term: 'atomik',
          meaning:
            'Operasi yang terjadi **utuh atau tidak sama sekali**, tanpa bisa diselipi operasi lain di tengahnya. Ini sifat yang membuat `UPSERT` dan `SET stok = stok - 1` aman dari balapan, sementara pola baca-lalu-tulis tidak.',
        },
      ),

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
      p(
        'Ketiga bentuk itu menyisipkan data yang sama, tetapi biayanya berbeda jauh. Bentuk pertama adalah `INSERT` biasa yang menyebutkan nama kolomnya secara eksplisit. Menulis `INSERT INTO catatan VALUES (...)` tanpa daftar kolom membuat query-mu bergantung pada **urutan kolom di tabel**, dan diam-diam salah begitu ada kolom baru ditambahkan. Bentuk kedua memasukkan dua baris dalam satu perintah. Cara ini jauh lebih cepat bukan karena SQL-nya lebih pintar, melainkan karena setiap perintah terpisah butuh satu perjalanan bolak-balik ke server, dan perjalanan itulah yang mahal saat kamu memasukkan ratusan baris.',
      ),
      p(
        'Bentuk ketiga memakai `RETURNING`, klausa khas PostgreSQL yang membuat `INSERT` ikut mengembalikan baris hasilnya. Ini penting karena `id` dan `dibuat_pada` **baru ada setelah** baris tersimpan — keduanya diisi oleh `BIGSERIAL` dan `DEFAULT NOW()` di sisi database, bukan oleh aplikasimu. Tanpa `RETURNING` kamu harus menjalankan `SELECT` susulan untuk mengetahuinya, dan di antara dua perintah itu selalu ada celah waktu yang bisa disisipi perubahan lain.',
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
      p(
        'Perhatikan `diperbarui_pada = NOW()` ikut ditulis pada `SET`, bukan hanya kolom yang benar-benar diubah pengguna. Berbeda dari `dibuat_pada` yang bisa mengandalkan `DEFAULT`, kolom "terakhir diubah" tidak punya mekanisme otomatis kecuali kamu memasang trigger — jadi setiap `UPDATE` harus memperbaruinya sendiri. Kolom ini bukan hiasan: ia yang nanti menjawab "sejak kapan data ini berubah" saat menelusuri masalah, dan yang dipakai cache untuk tahu kapan isinya sudah basi.',
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
      p(
        'Kebiasaan dua langkah ini murah dan menyelamatkan banyak orang. Langkah pertama menjalankan `SELECT count(*)` dengan `WHERE` **yang sama persis** dengan yang akan dipakai `UPDATE`, lalu angkanya memberi tahu berapa baris yang akan terkena. Kalau kamu mengira akan mengubah 3 baris dan jawabannya 4.000, kamu baru saja mencegah insiden, biasanya karena salah ketik nama kolom atau lupa satu syarat `AND`. Kuncinya ada pada kata *sama persis*, sebab begitu `WHERE` di langkah kedua berbeda sedikit saja dari yang diuji, hasil pengujiannya tidak lagi berarti apa-apa.',
      ),
      p(
        "Urutan menulisnya juga disengaja. Biasakan mengetik `WHERE` **sebelum** `SET`, karena kecelakaan paling mahal di SQL terjadi ketika seseorang menjalankan perintah yang belum selesai diketik. Perintah `UPDATE catatan SET status = 'arsip'` yang dijalankan tanpa `WHERE` mengubah seluruh isi tabel tanpa peringatan maupun pembatalan. Di data produksi, tambahkan satu lapis lagi dengan menjalankannya di dalam transaksi (`BEGIN`), memeriksa jumlah baris terpengaruh, baru `COMMIT`. Mekanismenya dibahas di sub-bab transaksi.",
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
      p(
        'Kolom kiri gagal bukan karena kodenya keliru, melainkan karena ada **jeda** antara langkah 1 dan langkah 3. Selama jeda beberapa milidetik itu, permintaan lain bisa menyelinap, membaca angka `10` yang sama, dan menghitung `9` yang sama pula. Keduanya lalu menulis `9`, padahal dua barang terjual, sehingga stokmu seharusnya `8`. Tidak ada error yang muncul. Yang tersisa hanya selisih antara catatan penjualan dan stok, yang biasanya baru ketahuan berhari-hari kemudian saat stok fisik dihitung.',
      ),
      p(
        'Kolom kanan menutup jeda itu dengan memindahkan perhitungannya **ke dalam** database, karena `SET stok = stok - 1` membaca dan menulis dalam satu operasi yang tidak bisa disela. Bagian `AND stok > 0` sama pentingnya, sebab ia mencegah stok menjadi negatif ketika dua permintaan berebut barang terakhir. Yang kalah tidak akan mengubah baris apa pun, dan di situlah komentar terakhirnya berlaku, yaitu periksa **jumlah baris terpengaruh** yang dikembalikan perintah. Nilai `0` berarti barangnya sudah habis, dan aplikasimu harus menjawab "stok tidak cukup", bukan menganggap penjualan berhasil.',
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
      p(
        'Inti soft delete ada pada pergantian perintah, karena yang dijalankan bukan `DELETE` melainkan `UPDATE` yang mengisi `dihapus_pada` dengan waktu sekarang. Barisnya tetap utuh di tabel, lengkap dengan seluruh isinya, sehingga bisa dipulihkan dengan mengosongkan kolom itu kembali dan tetap bisa diperiksa saat ada audit. Tipe kolomnya sengaja `TIMESTAMPTZ` dan bukan `BOOLEAN`, sebab dengan waktu kamu tahu **kapan** sesuatu dihapus. Nilai `NULL` di kolom itu pun punya arti yang jelas, yaitu belum pernah dihapus.',
      ),
      p(
        'Baris terakhir adalah harga yang harus dibayar terus-menerus. Sejak kolom itu ada, **setiap** pembacaan wajib menambahkan `WHERE dihapus_pada IS NULL`, karena satu query yang lupa akan menampilkan data yang menurut pengguna sudah hilang. Karena itu soft delete sebaiknya dipasang di satu tempat terpusat lewat *scope* bawaan ORM atau sebuah view, bukan diandalkan pada ingatan setiap orang yang menulis query baru.',
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
      references(
        {
          label: 'INSERT — termasuk ON CONFLICT',
          href: 'https://www.postgresql.org/docs/17/sql-insert.html',
          source: 'PostgreSQL',
          note: 'Bentuk UPSERT resmi beserta arti tabel semu `EXCLUDED`.',
        },
        {
          label: 'UPDATE',
          href: 'https://www.postgresql.org/docs/17/sql-update.html',
          source: 'PostgreSQL',
          note: 'Termasuk bentuk `SET kolom = kolom - 1` yang menghindari pola baca-lalu-tulis.',
        },
        {
          label: 'DELETE',
          href: 'https://www.postgresql.org/docs/17/sql-delete.html',
          source: 'PostgreSQL',
          note: 'Perilaku penghapusan, termasuk interaksinya dengan foreign key.',
        },
        {
          label: 'RETURNING Data From Modified Rows',
          href: 'https://www.postgresql.org/docs/17/dml-returning.html',
          source: 'PostgreSQL',
          note: 'Mendapat id dan nilai default tanpa query kedua.',
        },
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

      terms(
        {
          term: 'JOIN',
          meaning:
            'Menggabungkan baris dari dua tabel berdasarkan sebuah syarat. Ini inti dari kata "relasional": data disimpan **terpisah** supaya tidak berulang, lalu disatukan saat dibaca.',
        },
        {
          term: 'ON',
          meaning:
            'Syarat yang menentukan baris mana dipasangkan dengan baris mana — biasanya `ON c.penulis_id = p.id`. Bedanya dengan `WHERE` terlihat sepele tapi menentukan, dan itu jebakan utama sub-bab ini.',
        },
        {
          term: 'INNER JOIN',
          meaning:
            'Hanya mengembalikan baris yang **punya pasangan di kedua tabel**. Pengguna tanpa catatan tidak akan muncul sama sekali. Ini default kalau kamu menulis `JOIN` tanpa kata depan.',
        },
        {
          term: 'LEFT JOIN',
          meaning:
            'Mengembalikan **semua** baris tabel kiri, beserta pasangannya kalau ada — dan `NULL` kalau tidak. Ini yang kamu pakai untuk "semua pengguna, beserta catatannya kalau punya".',
        },
        {
          term: 'RIGHT JOIN',
          meaning:
            'Kebalikan `LEFT JOIN`: semua dari tabel kanan. Jarang dipakai dalam praktik — membalik urutan tabel lalu memakai `LEFT JOIN` hampir selalu lebih mudah dibaca.',
        },
        {
          term: 'CROSS JOIN',
          meaning:
            'Setiap baris kiri dipasangkan dengan **setiap** baris kanan. 1000 × 1000 baris menghasilkan sejuta. Hampir selalu tidak disengaja — biasanya akibat lupa menulis syarat `ON`.',
        },
        {
          term: 'alias tabel',
          meaning:
            'Nama pendek untuk sebuah tabel dalam satu query — `FROM pengguna p`. Bukan sekadar penghemat ketikan: begitu dua tabel punya kolom bernama sama (`id`), alias yang membuat `p.id` dan `c.id` bisa dibedakan.',
        },
        {
          term: 'WHERE membatalkan LEFT JOIN',
          meaning:
            'Jebakan terbesar sub-bab ini. Menaruh syarat tabel kanan di `WHERE` mengubah `LEFT JOIN` jadi `INNER JOIN` **diam-diam** — karena `NULL = FALSE` bernilai `NULL`, dan barisnya tersaring keluar. Syarat pada tabel kanan harus masuk ke `ON`.',
        },
        {
          term: 'masalah N+1',
          meaning:
            'Satu query mengambil N baris, lalu **N query lagi** dijalankan satu per satu untuk melengkapi masing-masing. 1000 pengguna menjadi 1001 query. Ia masalah performa paling umum di backend, cepat di data uji dan runtuh di produksi — dan ORM membuatnya sangat mudah terjadi tanpa disadari.',
        },
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
      p(
        'Yang menyambungkan kedua tabel itu adalah kolom `penulis_id` di tabel kanan, karena nilainya menunjuk ke `id` di tabel kiri. Baca isinya, di mana catatan 10 dan 11 sama-sama berisi `1` sehingga keduanya milik Ana, sedangkan catatan 12 berisi `2` yang berarti milik Budi. Perhatikan dua ketimpangan yang sengaja dipasang, karena keduanya yang akan membedakan hasil setiap jenis `JOIN` di bawah. **Ana punya dua catatan** sehingga namanya akan muncul dua kali, dan **Citra tidak punya satu pun** sehingga ia akan hilang atau muncul dengan `NULL` tergantung `JOIN` yang kamu pilih.',
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
      p(
        'Klausa `ON c.penulis_id = p.id` adalah syarat pasangannya, sehingga untuk setiap baris pengguna database mencari baris catatan yang `penulis_id`-nya cocok. Perhatikan hasilnya punya **tiga baris, bukan tiga pengguna**, sebab "Ana" muncul dua kali karena ia punya dua catatan yang cocok. Inilah sifat `JOIN` yang paling sering mengejutkan pemula. Hasil join bukan daftar pengguna, melainkan daftar **pasangan**, jadi satu baris kiri bisa melahirkan banyak baris hasil. Kalau kamu pernah heran kenapa `COUNT(*)` setelah join memberi angka lebih besar dari jumlah penggunamu, inilah sebabnya.',
      ),
      p(
        'Citra menghilang karena `INNER` hanya mengembalikan baris yang **punya pasangan di kedua sisi**. Ini yang benar ketika pertanyaanmu memang "tampilkan catatan beserta penulisnya" — pengguna tanpa catatan memang tidak punya apa-apa untuk ditampilkan. Tapi ia jadi bug diam-diam ketika pertanyaanmu adalah "tampilkan semua pengguna beserta jumlah catatannya", karena pengguna baru yang belum menulis apa pun akan lenyap dari daftar tanpa satu pun error.',
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
      p(
        'Query-nya hanya berbeda satu kata dari yang sebelumnya, karena `INNER` diganti `LEFT`, tetapi barisnya bertambah satu. Kata "kiri" merujuk pada tabel yang ditulis di `FROM`, yaitu `pengguna`. Dengan begitu `LEFT JOIN` menjanjikan **setiap baris kiri pasti muncul**, punya pasangan atau tidak. Citra tidak punya catatan, jadi database tetap mengeluarkan barisnya dan mengisi kolom dari tabel kanan dengan `NULL`.',
      ),
      p(
        '`NULL` di situ punya arti yang spesifik dan penting untuk langkah berikutnya: ia menandai "tidak ada pasangan", bukan "judulnya kosong". Karena itulah cara memeriksa pengguna yang belum menulis apa pun adalah `WHERE c.id IS NULL` setelah `LEFT JOIN` — dan karena itu pula `COUNT(c.id)` akan menghitung Citra sebagai 0, sementara `COUNT(*)` menghitungnya sebagai 1. Pilih `LEFT JOIN` setiap kali kalimat kebutuhanmu mengandung kata "semua ... beserta ... kalau ada".',
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
      p(
        'Bandingkan baris terakhir kedua kolom, karena yang berpindah hanyalah `c.diarsipkan = FALSE`, dari `WHERE` ke `AND` di dalam `ON`. Sebabnya ada pada **urutan kerja** database, sebab `JOIN` dikerjakan lebih dulu dan `WHERE` menyaring hasilnya belakangan. Pada kolom kiri, `LEFT JOIN` memang sudah menghasilkan baris Citra dengan seluruh kolom kanan bernilai `NULL`, lalu `WHERE` datang dan menguji `NULL = FALSE`. Sesuai aturan `NULL` yang kamu pelajari di sub-bab 2.2, perbandingan itu tidak menghasilkan benar, jadi baris Citra dibuang. `LEFT JOIN`-nya berubah menjadi `INNER JOIN` tanpa satu pun peringatan.',
      ),
      p(
        'Kolom kanan menaruh syarat itu di `ON`, sehingga ia menjadi bagian dari **aturan pencocokan**, bukan penyaring hasil akhir: catatan yang diarsipkan dianggap bukan pasangan yang sah, dan pengguna tanpa pasangan tetap keluar dengan `NULL` seperti janji `LEFT JOIN`. Pegang aturan praktisnya — syarat tentang tabel **kiri** boleh di `WHERE`, syarat tentang tabel **kanan** harus di `ON`. Satu-satunya pengecualian adalah `WHERE c.id IS NULL`, yang memang sengaja dipakai untuk mencari baris yang tidak punya pasangan.',
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
      references(
        {
          label: 'Table Joins',
          href: 'https://www.postgresql.org/docs/17/tutorial-join.html',
          source: 'PostgreSQL',
          note: 'Pengantar resmi INNER, LEFT, dan bentuk join lainnya.',
        },
        {
          label: 'FROM Clause — join types',
          href: 'https://www.postgresql.org/docs/17/queries-table-expressions.html#QUERIES-JOIN',
          source: 'PostgreSQL',
          note: 'Beda `ON` dan `WHERE` — sumber jebakan yang membatalkan `LEFT JOIN`.',
        },
        {
          label: 'Comparison Functions — IS NULL',
          href: 'https://www.postgresql.org/docs/17/functions-comparison.html',
          source: 'PostgreSQL',
          note: 'Kenapa `NULL = FALSE` bernilai `NULL`, bukan `TRUE` — akar jebakan di atas.',
        },
        {
          label: 'Using EXPLAIN',
          href: 'https://www.postgresql.org/docs/17/using-explain.html',
          source: 'PostgreSQL',
          note: 'Membuktikan sebuah join memakai index, bukan memindai seluruh tabel.',
        },
      ),
    ],
  ),

  written(
    'agregasi',
    'Agregasi: `COUNT`, `SUM`, `GROUP BY`, `HAVING`',
    11,
    'Meringkas banyak baris menjadi satu angka.',
    [
      terms(
        {
          term: 'agregasi',
          meaning:
            'Meringkas **banyak baris menjadi satu nilai** — jumlah, total, rata-rata. Ini pergeseran cara berpikir: hasilnya bukan lagi baris-baris data, melainkan angka yang menjawab pertanyaan tentang data itu.',
        },
        {
          term: 'COUNT(*) vs COUNT(kolom)',
          meaning:
            'Perbedaan yang paling sering jadi bug. `COUNT(*)` menghitung **semua baris**. `COUNT(kolom)` hanya menghitung baris yang kolomnya **bukan `NULL`**. Kalau angkamu lebih kecil dari yang diharapkan, ini penyebab pertama yang harus diperiksa.',
        },
        {
          term: 'GROUP BY',
          meaning:
            'Membagi baris menjadi kelompok berdasarkan nilai satu atau beberapa kolom, lalu menjalankan fungsi agregat **per kelompok**. Tanpa `GROUP BY`, agregat menghasilkan satu angka untuk seluruh tabel.',
        },
        {
          term: 'aturan GROUP BY',
          meaning:
            'Setiap kolom di `SELECT` harus **ada di `GROUP BY`** atau **dibungkus fungsi agregat**. PostgreSQL menolak query yang melanggarnya. MySQL dalam mode longgar justru menerimanya dan mengembalikan nilai **acak** dari salah satu baris — bug diam yang jauh lebih berbahaya daripada error.',
        },
        {
          term: 'HAVING',
          meaning:
            'Menyaring **kelompok**, setelah agregat dihitung — `HAVING COUNT(*) > 5`. Bedanya dengan `WHERE`: `WHERE` menyaring baris **sebelum** dikelompokkan dan tidak boleh memakai fungsi agregat.',
        },
        {
          term: 'urutan eksekusi',
          meaning:
            'Urutan SQL **dijalankan** berbeda dari urutan ia **ditulis**: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`. Ini menjelaskan kebingungan paling sering: alias yang dibuat di `SELECT` tidak bisa dipakai di `WHERE`, tapi **bisa** di `ORDER BY`.',
        },
        {
          term: 'alias (AS)',
          meaning:
            'Nama baru untuk kolom hasil — `COUNT(*) AS jumlah`. Karena `SELECT` berjalan setelah `WHERE`, alias belum ada saat `WHERE` dievaluasi. Itu bukan keanehan; itu konsekuensi langsung urutan di atas.',
        },
        {
          term: 'COUNT(c.id) pada LEFT JOIN',
          meaning:
            'Detail yang sering salah. Pada `LEFT JOIN`, pengguna tanpa catatan tetap menghasilkan satu baris berisi `NULL`. `COUNT(*)` menghitungnya sebagai **1** — salah. `COUNT(c.id)` melewati `NULL` dan menghasilkan **0**, yang benar.',
        },
        {
          term: 'saring sedini mungkin',
          meaning:
            'Aturan performa untuk agregasi: buang baris sebanyak mungkin di `WHERE`, bukan di `HAVING`. Baris yang sudah dibuang tidak perlu ikut dikelompokkan maupun dihitung.',
        },
      ),

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
      p(
        'Fungsi agregat memampatkan **banyak baris menjadi satu nilai**. Query ini tidak punya `GROUP BY`, jadi seluruh tabel diperlakukan sebagai satu kelompok dan hasilnya hanya satu baris berisi enam kolom — bukan satu baris per catatan. `AS` di setiap baris memberi nama pada kolom hasil; tanpanya, kolommu akan bernama `count`, `sum`, `avg`, dan menjadi membingungkan begitu ada dua agregat sejenis dalam satu query.',
      ),
      p(
        'Satu sifat menyatukan lima dari enam fungsi itu, yaitu **`NULL` dilewati dan bukan dianggap nol**. Ini penting untuk `AVG`, sebab pada 10 catatan yang 4 di antaranya `harga`-nya `NULL`, `AVG(harga)` membagi dengan 6 alih-alih 10. Kalau yang kamu maksud memang "harga kosong berarti gratis", tulis eksplisit `AVG(COALESCE(harga, 0))` alih-alih berharap database menebaknya. Pengecualiannya adalah `COUNT(*)` di baris pertama yang menghitung baris apa adanya tanpa peduli isinya, dan itulah yang membedakannya dari `COUNT(judul)` tepat di bawahnya.',
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
      p(
        '`GROUP BY penulis_id` mengubah aturan mainnya, karena alih-alih satu kelompok untuk seluruh tabel, database membuat **satu kelompok per nilai `penulis_id` yang berbeda**, lalu menjalankan `COUNT(*)` di dalam masing-masing. Karena itu hasilnya dua baris, sesuai data contoh di sub-bab join, dengan penulis 1 punya dua catatan dan penulis 2 punya satu. Kalau ada seratus penulis, hasilnya seratus baris. Jumlah baris keluaran selalu sama dengan jumlah nilai unik pada kolom yang dikelompokkan.',
      ),
      p(
        'Perhatikan `SELECT`-nya hanya berisi dua hal: kolom yang dikelompokkan, dan sebuah fungsi agregat. Itu bukan kebetulan melainkan keharusan — begitu baris dilebur menjadi kelompok, kolom seperti `judul` tidak lagi punya satu nilai yang bisa ditampilkan, karena di dalam kelompok penulis 1 ada dua judul berbeda. Pertanyaan "judul yang mana?" tidak punya jawaban, dan itulah yang dijelaskan peringatan berikutnya.',
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
      p(
        'Query ini memakai dua penyaring yang bekerja pada tingkat berbeda. `WHERE diarsipkan = FALSE` berjalan **sebelum** pengelompokan, jadi catatan yang diarsipkan tidak pernah ikut terhitung sama sekali. `HAVING COUNT(*) > 5` berjalan **setelah** pengelompokan, menyaring kelompok berdasarkan angka yang baru saja dihasilkan — sesuatu yang mustahil dilakukan `WHERE`, karena saat `WHERE` dievaluasi hitungannya memang belum ada. Perhatikan pula `ORDER BY jumlah DESC` di baris terakhir bisa memakai alias `jumlah`, sedangkan `WHERE` tidak akan bisa; alasannya ada pada urutan eksekusi tepat di bawah ini.',
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
      p(
        'Inilah bentuk yang akan paling sering kamu tulis di aplikasi nyata, yaitu "daftar semua X beserta jumlah Y-nya", dan ia menggabungkan dua pelajaran sebelumnya. `LEFT JOIN` memastikan pengguna tanpa catatan tetap muncul, sedangkan `COUNT(c.id)` memastikan angkanya `0` dan bukan `1`, sebab pada baris Citra kolom `c.id` bernilai `NULL` dan `COUNT` melewati `NULL`. Menukarnya dengan `COUNT(*)` akan menghitung baris kosong itu sebagai satu catatan, yang salah tanpa error apa pun.',
      ),
      p(
        '`GROUP BY p.id, p.nama` menyebut dua kolom, dan `p.id` di depan bukan kelebihan. Kalau kamu hanya mengelompokkan menurut `p.nama`, dua pengguna berbeda yang kebetulan bernama sama akan dilebur menjadi satu baris dengan hitungan yang tercampur. Mengelompokkan menurut kunci primer menjamin satu kelompok benar-benar satu pengguna; `p.nama` ikut disebut semata-mata agar boleh ditampilkan di `SELECT`.',
      ),
      callout(
        'tip',
        'Pakai `COUNT(c.id)`, bukan `COUNT(*)`',
        'Pada `LEFT JOIN`, pengguna tanpa catatan tetap menghasilkan satu baris berisi `NULL`. `COUNT(*)` akan menghitungnya sebagai 1 — salah. `COUNT(c.id)` melewati `NULL` dan menghasilkan 0, yang benar.',
      ),
      references(
        {
          label: 'Aggregate Functions',
          href: 'https://www.postgresql.org/docs/17/functions-aggregate.html',
          source: 'PostgreSQL',
          note: 'Daftar fungsi agregat, termasuk beda `COUNT(*)` dan `COUNT(kolom)`.',
        },
        {
          label: 'GROUP BY and HAVING Clauses',
          href: 'https://www.postgresql.org/docs/17/queries-table-expressions.html#QUERIES-GROUP',
          source: 'PostgreSQL',
          note: 'Aturan kolom di `SELECT`, dan kapan `HAVING` yang dipakai alih-alih `WHERE`.',
        },
        {
          label: 'SELECT — evaluation order',
          href: 'https://www.postgresql.org/docs/17/sql-select.html',
          source: 'PostgreSQL',
          note: 'Urutan klausa dijalankan — dasar alasan alias tidak tersedia di `WHERE`.',
        },
        {
          label: 'MySQL — ONLY_FULL_GROUP_BY',
          href: 'https://dev.mysql.com/doc/refman/8.4/en/group-by-handling.html',
          source: 'MySQL',
          note: 'Mode longgar MySQL yang menerima query melanggar aturan dan mengembalikan nilai acak.',
        },
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

      terms(
        {
          term: 'normalisasi',
          meaning:
            'Proses menghilangkan pengulangan data. Aturannya terdengar formal, tapi tujuannya muat satu kalimat: **satu fakta disimpan di satu tempat saja.**',
        },
        {
          term: 'anomali update',
          meaning:
            'Satu fakta tersimpan di banyak baris, jadi mengubahnya harus dilakukan di semuanya. Ana ganti email → harus diubah di setiap barisnya. **Satu terlewat, dan datanya bertentangan** — tanpa ada yang memberitahu.',
        },
        {
          term: 'anomali insert',
          meaning:
            'Sebuah fakta tidak bisa dicatat karena terikat pada fakta lain yang belum ada. Produk baru tidak bisa dimasukkan sebelum ada yang memesannya — padahal produk jelas ada terlepas dari pesanan.',
        },
        {
          term: 'anomali delete',
          meaning:
            'Menghapus satu fakta ikut menghapus fakta lain yang menumpang di baris yang sama. Menghapus pesanan terakhir Budi ikut menghapus satu-satunya catatan tentang Budi.',
        },
        {
          term: '1NF',
          meaning:
            'Bentuk normal pertama: **satu nilai per sel**. `produk = "Buku A, Buku B"` melanggarnya. Perbaikannya: satu baris per produk, tidak ada daftar yang disembunyikan di dalam satu kolom.',
        },
        {
          term: '2NF',
          meaning:
            'Bentuk normal kedua: tidak ada kolom yang hanya bergantung pada **sebagian** primary key. Berlaku saat kunci-nya gabungan — kalau kuncinya `(pesanan_id, produk_id)`, maka `nama_produk` hanya bergantung pada `produk_id`, jadi ia milik tabel `produk`.',
        },
        {
          term: '3NF',
          meaning:
            'Bentuk normal ketiga: tidak ada kolom yang bergantung pada kolom **non-kunci**. Contohnya `kota` yang bergantung pada `kode_pos`, bukan pada primary key barisnya. Untuk hampir semua aplikasi, 3NF adalah titik berhenti yang cukup.',
        },
        {
          term: 'nilai historis',
          meaning:
            'Nilai yang sengaja disalin karena ia **fakta yang berbeda**, bukan duplikat. `harga_saat_beli` bukan pelanggaran normalisasi: harga produk sekarang dan harga yang benar-benar dibayar waktu itu adalah dua fakta. Kalau harga naik, riwayat pesanan lama tidak boleh ikut berubah.',
        },
        {
          term: 'denormalisasi',
          meaning:
            'Menyimpan data berulang **dengan sengaja** demi performa — misalnya `jumlah_komentar` di tabel artikel. Harganya: begitu satu fakta ada di dua tempat, **kamu** yang harus menjaganya tetap sama. Lakukan hanya setelah ada masalah performa yang terukur, bukan sebagai titik awal.',
        },
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
      p(
        'Sel berisi `"Buku A, Buku B"` terlihat praktis sampai kamu harus menggunakannya. Coba jawab dengan SQL, berapa kali Buku A dipesan? Kamu terpaksa mencari potongan teks, dan pencarian itu akan salah menghitung kalau ada produk bernama "Buku AB". Coba ubah harga Buku A saja, dan ternyata tidak ada barisnya untuk diubah. Coba pasang `FOREIGN KEY` agar produk yang tidak ada tidak bisa dipesan, dan itu mustahil karena isinya teks bebas alih-alih rujukan. Aturan "satu nilai per sel" pada dasarnya berarti **jangan simpan daftar di dalam satu kolom**, karena setiap alat yang dimiliki database bekerja per baris alih-alih per potongan teks.',
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
      p(
        'Uji sederhananya adalah menanyakan untuk setiap kolom, *"nilai ini ditentukan oleh apa?"*. Pada `pesanan(id, pelanggan_id, email_pelanggan)`, jawabannya untuk `email_pelanggan` bukan "oleh pesanannya" melainkan "oleh pelanggannya", sementara `pelanggan_id` sendiri bukan kunci tabel ini. Kolom yang ditentukan oleh kolom **non-kunci** seperti itulah yang dipindahkan. Akibat konkretnya adalah anomali update di awal sub-bab. Selama email disalin di setiap pesanan, satu pelanggan yang ganti email menuntut kamu memperbarui semua barisnya, dan satu baris yang terlewat membuat datamu bertentangan dengan dirinya sendiri. Setelah dipindah, email hanya ada di **satu tempat**, jadi tidak ada lagi yang bisa bertentangan.',
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
      p(
        'Satu tabel gemuk tadi kini menjadi empat, dan setiap fakta hanya tinggal di satu tempat, yaitu identitas pelanggan di `pelanggan`, katalog di `produk`, peristiwa pemesanan di `pesanan`, dan isi keranjangnya di `pesanan_item`. Tabel terakhir itulah yang menyelesaikan pelanggaran 1NF, sebab alih-alih daftar `"Buku A, Buku B"` dalam satu sel, sekarang ada **satu baris per produk** dalam sebuah pesanan. Kata `REFERENCES` pada `pelanggan_id` dan `produk_id` mengubah rujukan yang tadinya berupa teks bebas menjadi janji yang dijaga database, sehingga memasukkan `produk_id` yang tidak ada akan ditolak.',
      ),
      p(
        'Tiga detail di `pesanan_item` layak diperhatikan. `PRIMARY KEY (pesanan_id, produk_id)` adalah kunci gabungan yang sekaligus mencegah satu produk tercatat dua kali dalam pesanan yang sama — kalau pelanggan membeli dua buku yang sama, yang bertambah adalah kolom `jumlah`. `CHECK (jumlah > 0)` menutup kemungkinan pesanan berjumlah nol atau negatif, aturan yang biasanya hidup di kode tetapi di sini tidak bisa dilewati siapa pun, termasuk skrip yang menulis langsung ke database. Dan `ON DELETE CASCADE` hanya dipasang pada `pesanan_id`, bukan pada `produk_id`: menghapus sebuah pesanan memang wajar ikut menghapus isinya, sedangkan menghapus sebuah produk **tidak boleh** menghapus riwayat pembelian orang lain.',
      ),
      callout(
        'danger',
        '`harga_saat_beli` bukan pelanggaran normalisasi',
        'Sekilas ia terlihat duplikat dari `produk.harga`. Sebenarnya ia **fakta yang berbeda**: harga produk sekarang, versus harga yang benar-benar dibayar waktu itu. Kalau harga produk naik, riwayat pesanan lama tidak boleh ikut berubah. Menyimpan nilai historis adalah kebenaran, bukan redundansi.',
      ),

      h2('Kapan sengaja tidak dinormalisasi'),
      p(
        'Denormalisasi, yaitu menyimpan data berulang dengan sengaja, kadang memang tepat, tetapi **hanya setelah** ada masalah performa yang terukur:',
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
      references(
        {
          label: 'Data Definition — Constraints',
          href: 'https://www.postgresql.org/docs/17/ddl-constraints.html',
          source: 'PostgreSQL',
          note: 'Alat yang menegakkan hasil normalisasi: `UNIQUE`, `FOREIGN KEY`, dan `CHECK`.',
        },
        {
          label: 'Numeric Types — NUMERIC untuk uang',
          href: 'https://www.postgresql.org/docs/17/datatype-numeric.html',
          source: 'PostgreSQL',
          note: 'Tipe yang dipakai `harga` dan `harga_saat_beli` pada skema ternormalisasi di atas.',
        },
        {
          label: 'Materialized Views',
          href: 'https://www.postgresql.org/docs/17/rules-materializedviews.html',
          source: 'PostgreSQL',
          note: 'Bentuk denormalisasi yang dikelola database, bukan dijaga tangan.',
        },
        {
          label: 'MySQL — Normalization & table design',
          href: 'https://dev.mysql.com/doc/refman/8.4/en/data-size.html',
          source: 'MySQL',
          note: 'Sudut pandang lain soal trade-off ukuran tabel dan pengulangan data.',
        },
      ),
    ],
  ),

  written(
    'relasi',
    'Relasi 1-1, 1-N, N-N & tabel pivot',
    12,
    'Tiga bentuk hubungan antar tabel dan cara mewujudkannya.',
    [
      terms(
        {
          term: 'relasi',
          meaning:
            'Hubungan antar tabel. Hanya ada tiga bentuk, dan mengenali yang mana **menentukan letak foreign key-nya** — satu-satunya keputusan struktural yang benar-benar perlu kamu ambil.',
        },
        {
          term: 'One-to-Many (1-N)',
          meaning:
            'Bentuk paling umum. Satu penulis punya banyak catatan, sedangkan satu catatan punya satu penulis. Aturannya cukup satu kalimat, yaitu **foreign key diletakkan di sisi "banyak"**, sehingga kolom `penulis_id` ada di tabel `catatan` dan bukan sebaliknya.',
        },
        {
          term: 'One-to-One (1-1)',
          meaning:
            'Satu baris berpasangan dengan tepat satu baris di tabel lain. Secara teknis ia 1-N yang dibatasi: **`UNIQUE` atau `PRIMARY KEY` pada foreign key-nya** yang mengubah 1-N menjadi 1-1.',
        },
        {
          term: 'Many-to-Many (N-N)',
          meaning:
            'Satu catatan punya banyak tag, satu tag dipakai banyak catatan. Bentuk ini **tidak bisa diwujudkan dengan dua tabel saja** — ia selalu butuh tabel ketiga.',
        },
        {
          term: 'tabel pivot',
          meaning:
            'Tabel ketiga yang mewujudkan relasi N-N, berisi **hanya** pasangan id dari kedua sisi. Nama lainnya *junction table* atau *join table*. Kalau ia mulai menyimpan data lain, ia sudah bukan pivot melainkan entitas tersendiri.',
        },
        {
          term: 'primary key gabungan',
          meaning:
            'Primary key yang terdiri dari dua kolom, seperti `PRIMARY KEY (catatan_id, tag_id)`. Pada tabel pivot ia mengerjakan dua hal sekaligus: memberi identitas, dan **memastikan satu pasangan tidak bisa dicatat dua kali**.',
        },
        {
          term: 'foreign key tanpa index',
          meaning:
            'Penyebab lambat yang paling tersembunyi. **PostgreSQL tidak membuat index otomatis untuk foreign key.** Akibatnya setiap `WHERE penulis_id = ?` dan setiap `JOIN` lewat kolom itu memindai seluruh tabel — dan penghapusan induk ikut melambat karena database harus memeriksa anak-anaknya.',
        },
        {
          term: 'index arah sebaliknya',
          meaning:
            'Pada tabel pivot, primary key gabungan `(catatan_id, tag_id)` hanya melayani pencarian yang dimulai dari `catatan_id`. Untuk "cari catatan berdasarkan tag", kamu butuh index terpisah pada `tag_id` — ini yang paling sering terlewat.',
        },
        {
          term: 'kapan memisah tabel 1-1',
          meaning:
            'Tiga alasan sah: kolomnya **jarang dipakai**, **ukurannya besar** (teks panjang, blob), atau **aksesnya perlu dibatasi berbeda** dari tabel utama. Di luar itu, menggabungkannya dalam satu tabel lebih sederhana.',
        },
      ),

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
      p(
        'Satu-ke-banyak selalu dibentuk dengan menaruh kolom rujukan di sisi **banyak**, sehingga `penulis_id` ada di tabel `catatan` alih-alih daftar catatan di tabel `pengguna`. Alasannya sederhana, yaitu satu catatan hanya punya satu penulis sehingga nilainya muat dalam satu kolom, sedangkan jumlah catatan per pengguna tidak terbatas. `REFERENCES pengguna(id)` membuat database menolak catatan yang penulisnya tidak ada, sedangkan `ON DELETE CASCADE` menentukan apa yang terjadi saat penggunanya dihapus, yang di sini berarti catatannya ikut terhapus. Pilihan itu harus disengaja, sebab untuk data yang tidak boleh hilang bersama induknya, `ON DELETE RESTRICT` yang menolak penghapusan sering lebih tepat.',
      ),
      p(
        'Baris terakhir memperbaiki asumsi yang sering keliru: membuat foreign key **tidak** otomatis membuat index-nya di PostgreSQL. Yang dibuat otomatis hanyalah index untuk `PRIMARY KEY` dan `UNIQUE`. Tanpa `CREATE INDEX` itu, setiap `WHERE penulis_id = 42` dan setiap `JOIN` lewat kolom tersebut harus memindai seluruh tabel `catatan` — dan penghapusan seorang pengguna pun ikut melambat, karena database harus mencari anak-anaknya untuk di-*cascade*.',
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
      p(
        'Banyak-ke-banyak tidak bisa diwakili satu kolom di sisi mana pun, karena satu catatan punya banyak tag dan satu tag dipakai banyak catatan. Karena itu hubungannya sendiri yang menjadi tabel. `catatan_tag` tidak menyimpan apa pun selain sepasang rujukan, dan satu barisnya berarti "catatan ini memakai tag itu". `PRIMARY KEY (catatan_id, tag_id)` menjamin pasangan yang sama tidak bisa masuk dua kali, jadi kamu tidak perlu memeriksa duplikat di kode.',
      ),
      p(
        'Baris `CREATE INDEX` terakhir menutup celah yang mudah terlewat, dan alasannya adalah aturan "kolom paling kiri" dari sub-bab 2.3. Primary key gabungan tadi sudah membuat index atas `(catatan_id, tag_id)`, sehingga pertanyaan "tag apa saja milik catatan 42" terlayani. Pertanyaan sebaliknya, yaitu "catatan apa saja yang bertag react", memakai `tag_id` sendirian yang merupakan kolom kedua, jadi index itu tidak bisa dipakai. Karena tabel pivot hampir selalu ditanya dari **dua arah**, sediakan index untuk arah keduanya sejak awal.',
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
      p(
        "Kedua query menjawab pertanyaan yang berlawanan arah, dan bedanya terletak pada **berapa kali** tabel pivot dilompati. Query pertama berangkat dari `tag`, mampir ke `catatan_tag`, dan berhenti di sana karena yang dicari hanya nama tag — `catatan_id` sudah diketahui, jadi tidak perlu menyentuh tabel `catatan` sama sekali. Query kedua butuh dua `JOIN` karena syaratnya berupa **nama** tag, bukan id-nya: ia harus lewat `tag` untuk menerjemahkan `'react'` menjadi sebuah id, lalu lewat `catatan_tag` untuk menemukan catatan yang memakainya.",
      ),
      p(
        'Pola inilah yang akan berulang di hampir setiap relasi banyak-ke-banyak: tabel pivot berperan sebagai jembatan, dan kamu selalu melewatinya untuk berpindah dari satu sisi ke sisi lain. Perhatikan juga keduanya memakai `JOIN` (yaitu `INNER JOIN`) — pilihan yang tepat di sini, karena catatan tanpa tag memang tidak punya apa pun untuk ditampilkan. Kalau pertanyaanmu berubah menjadi "semua catatan **beserta** tag-nya kalau ada", kamu perlu mengganti `JOIN` pertama menjadi `LEFT JOIN`.',
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
      p(
        'Tidak ada yang istimewa secara teknis di sini, sebab `induk_id` adalah foreign key biasa yang hanya saja menunjuk ke **tabelnya sendiri**. Dengan satu kolom itu, sebuah tabel datar bisa menyimpan pohon sedalam apa pun, misalnya "Elektronik" punya `induk_id` `NULL`, "Laptop" menunjuk ke Elektronik, dan "Laptop Gaming" menunjuk ke Laptop. Perhatikan kolomnya sengaja **tidak** `NOT NULL`, dan justru di situ letak desainnya, sebab `NULL` di sini bukan data yang hilang melainkan penanda bermakna untuk kategori tingkat teratas yang memang tidak punya induk.',
      ),
      p(
        '`ON DELETE SET NULL` juga dipilih dengan sadar. Kalau dipakai `CASCADE`, menghapus "Elektronik" akan ikut melenyapkan Laptop, Laptop Gaming, dan seluruh keturunannya dalam satu perintah — kehilangan berantai yang biasanya baru disadari setelah terjadi. Dengan `SET NULL`, anak-anaknya naik menjadi kategori tingkat teratas dan tetap ada untuk dirapikan kemudian.',
      ),
      callout(
        'tip',
        'Menelusuri hierarki butuh query rekursif',
        'Untuk mengambil seluruh keturunan sebuah kategori, SQL punya `WITH RECURSIVE`. Untuk hierarki yang dangkal (dua sampai tiga tingkat), beberapa `JOIN` biasa lebih sederhana dan lebih mudah dibaca.',
      ),
      references(
        {
          label: 'Foreign Keys',
          href: 'https://www.postgresql.org/docs/17/tutorial-fk.html',
          source: 'PostgreSQL',
          note: 'Dasar ketiga bentuk relasi — semuanya berdiri di atas foreign key.',
        },
        {
          label: 'Indexes on Foreign Keys',
          href: 'https://www.postgresql.org/docs/17/indexes-intro.html',
          source: 'PostgreSQL',
          note: 'Penegasan bahwa index foreign key tidak dibuat otomatis, dan akibatnya.',
        },
        {
          label: 'CREATE TABLE — composite PRIMARY KEY',
          href: 'https://www.postgresql.org/docs/17/sql-createtable.html',
          source: 'PostgreSQL',
          note: 'Bentuk `PRIMARY KEY (a, b)` yang menjaga pasangan pada tabel pivot tidak ganda.',
        },
        {
          label: 'WITH Queries (Common Table Expressions)',
          href: 'https://www.postgresql.org/docs/17/queries-with.html',
          source: 'PostgreSQL',
          note: '`WITH RECURSIVE` untuk menelusuri relasi ke diri sendiri, seperti pohon kategori.',
        },
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

      terms(
        {
          term: 'transaksi',
          meaning:
            'Sekumpulan perintah yang diperlakukan sebagai **satu satuan yang tidak bisa dipecah**. Ia mencegah kelas bug paling mahal di backend: perubahan setengah jadi. Kalau server mati di antara dua `UPDATE`, database membatalkan yang pertama saat pulih.',
        },
        {
          term: 'BEGIN / COMMIT / ROLLBACK',
          meaning:
            'Tiga perintah yang membentuk transaksi. **`BEGIN`** membukanya, **`COMMIT`** membuat semua perubahannya berlaku, **`ROLLBACK`** membatalkan semuanya. Tidak ada keadaan di antara: satu dari dua, tidak pernah sebagian.',
        },
        {
          term: 'ACID',
          meaning:
            'Empat sifat yang dijamin transaksi: **Atomicity** (semua atau tidak sama sekali), **Consistency** (semua constraint tetap terpenuhi), **Isolation** (transaksi bersamaan tidak saling melihat keadaan setengah jadi), **Durability** (setelah `COMMIT`, data selamat meski listrik mati).',
        },
        {
          term: 'atomicity',
          meaning:
            'Huruf **A** pada ACID, dan yang paling langsung terasa. "Atomik" berarti tidak bisa dibelah: transfer saldo yang mati di tengah jalan **tidak** meninggalkan uang yang lenyap, karena tidak ada bagian yang berlaku sendirian.',
        },
        {
          term: 'isolation',
          meaning:
            'Huruf **I** pada ACID, dan yang paling halus. Transaksi yang berjalan bersamaan tidak boleh saling melihat keadaan setengah jadi. Seberapa ketat jaminannya bisa diatur lewat **isolation level**.',
        },
        {
          term: 'isolation level',
          meaning:
            'Tingkat ketat isolasi, dari `READ COMMITTED` (default PostgreSQL) sampai `SERIALIZABLE`. Makin ketat makin aman dari anomali, tapi makin sering transaksi ditolak dan harus diulang. Ini trade-off sadar, bukan setelan yang boleh diabaikan.',
        },
        {
          term: 'durability',
          meaning:
            'Huruf **D** pada ACID. Setelah `COMMIT` dijawab berhasil, data **sudah tersimpan permanen** — mati listrik sesudah itu tidak menghilangkannya. Inilah yang membedakan database dari cache di memori.',
        },
        {
          term: 'transaksi panjang',
          meaning:
            'Transaksi yang dibiarkan terbuka lama. Ia mengunci baris lebih lama dan menahan pembersihan versi lama. Aturan praktisnya: **jangan pernah menahan transaksi terbuka melintasi panggilan jaringan** ke layanan luar — kamu tidak mengendalikan berapa lama jawabannya datang.',
        },
        {
          term: 'deadlock',
          meaning:
            'Dua transaksi saling menunggu kunci milik yang lain, sehingga keduanya berhenti selamanya. Database mendeteksinya dan **membatalkan salah satunya**. Pencegahan paling efektif: selalu ambil kunci dalam **urutan yang sama** di seluruh kodemu.',
        },
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
      p(
        'Perhatikan baris pertamanya: `pool.connect()` mengambil **satu koneksi tertentu** dan menyimpannya di `klien`. Ini syarat mutlak, bukan gaya penulisan — `BEGIN`, semua perintah di tengah, dan `COMMIT` harus berjalan di koneksi yang sama, karena transaksi adalah keadaan yang melekat pada koneksi. Kalau kamu memakai `pool.query()` seperti biasa, setiap perintah bisa mendapat koneksi berbeda dari pool, dan `COMMIT`-mu akan menutup transaksi kosong sementara perubahan sesungguhnya tergantung tanpa induk.',
      ),
      p(
        'Bagian `throw` di dalam perulangan adalah inti pelajaran atomicity-nya. Bayangkan pesanan berisi tiga barang dan barang ketiga kehabisan stok. Tanpa transaksi, dua barang pertama sudah tercatat dan stoknya sudah berkurang, sehingga pelanggan membayar untuk pesanan yang tidak lengkap. Di sini `throw` melompat ke `catch`, `ROLLBACK` membatalkan **seluruhnya**, dan database kembali persis seperti sebelum `BEGIN`. Perhatikan pula `hasil.rowCount === 0` dipakai sebagai penanda gagal, bukan pemeriksaan stok terpisah sebelumnya. Klausa `WHERE ... AND stok >= $1` sudah menggabungkan pemeriksaan dan pengurangan dalam satu operasi yang tidak bisa disela, jadi tidak ada celah untuk dua pembeli merebut barang terakhir.',
      ),
      p(
        'Blok `finally` mengembalikan koneksi ke pool, dan ia ditulis terpisah dari `catch` karena harus berjalan **di kedua jalur** — sukses maupun gagal. Pool berisi jumlah koneksi yang terbatas (sering hanya 10–20), jadi satu jalur keluar yang lupa mengembalikannya akan menggerogoti persediaan sedikit demi sedikit sampai habis.',
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
      p(
        'Kedua kolom menjalankan `UPDATE` dan `kirimEmail` yang sama, dan yang berbeda hanyalah **letak `COMMIT`**. Kuncinya ada pada kenyataan bahwa sejak `UPDATE` dijalankan sampai `COMMIT` selesai, baris yang disentuh terkunci untuk transaksi lain. Pada kolom kiri, kunci itu bertahan selama panggilan email dan pembayaran berlangsung, yaitu tiga detik atau lebih lama lagi kalau pihak ketiganya sedang bermasalah. Selama itu, setiap permintaan lain yang ingin menyentuh baris yang sama hanya bisa menunggu, dan pada trafik ramai antrean tersebut menumpuk sampai koneksi di pool habis.',
      ),
      p(
        'Ada alasan kedua yang sama pentingnya: `kirimEmail` **tidak bisa di-rollback**. Kalau `COMMIT` gagal setelah emailnya terkirim, pelanggan sudah menerima kabar tentang pesanan yang di database tidak pernah ada. Karena itu aturannya berlaku umum, bukan hanya untuk email — jangan pernah menaruh panggilan ke layanan luar di dalam transaksi. Letakkan seluruh efek samping **setelah** `COMMIT`, saat kamu sudah tahu pasti datanya benar-benar tersimpan.',
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
      references(
        {
          label: 'Transactions',
          href: 'https://www.postgresql.org/docs/17/tutorial-transactions.html',
          source: 'PostgreSQL',
          note: 'Pengantar `BEGIN`/`COMMIT`/`ROLLBACK` beserta jaminan yang menyertainya.',
        },
        {
          label: 'Transaction Isolation',
          href: 'https://www.postgresql.org/docs/17/transaction-iso.html',
          source: 'PostgreSQL',
          note: 'Setiap tingkat isolasi, anomali yang dicegahnya, dan harga yang dibayar.',
        },
        {
          label: 'Explicit Locking & Deadlocks',
          href: 'https://www.postgresql.org/docs/17/explicit-locking.html',
          source: 'PostgreSQL',
          note: 'Kenapa mengambil kunci dalam urutan yang sama mencegah deadlock.',
        },
        {
          label: 'MySQL — InnoDB Transaction Model',
          href: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-model.html',
          source: 'MySQL',
          note: 'Perbandingan: default MySQL adalah `REPEATABLE READ`, bukan `READ COMMITTED`.',
        },
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

      terms(
        {
          term: 'SQL injection',
          meaning:
            'Terjadi ketika masukan pengguna berubah menjadi **perintah** SQL, bukan sekadar **nilai**. Kerentanan tertua yang masih menempati peringkat teratas OWASP — karena satu baris kode yang keliru sudah cukup.',
        },
        {
          term: 'string interpolation',
          meaning:
            "Merangkai query dengan menyisipkan variabel ke dalam teks — `` `... email = '${email}'` ``. Inilah **satu-satunya** akar SQL injection. Kutip yang dikirim penyerang menutup string lebih awal, dan sisanya dibaca database sebagai perintah.",
        },
        {
          term: 'prepared statement',
          meaning:
            'Mengirim **perintah dan nilainya secara terpisah** ke database. Database sudah selesai mengurai struktur query sebelum melihat nilainya — jadi apa pun isi input, ia hanya diperlakukan sebagai teks. Ini bukan penyaringan karakter; strukturnya memang **tidak bisa lagi berubah**.',
        },
        {
          term: 'placeholder ($1, ?)',
          meaning:
            'Penanda posisi nilai di dalam query. PostgreSQL memakai `$1`, `$2`; MySQL dan SQLite memakai `?`. Nilainya dioper sebagai array terpisah — dan itulah yang membuat celahnya tertutup.',
        },
        {
          term: 'escaping manual',
          meaning:
            'Mencoba membersihkan input sendiri dengan mengganti karakter berbahaya. **Selalu gagal** cepat atau lambat: ada kasus tepi pada encoding, Unicode, dan multibyte yang tidak kamu duga. Ini bukan alternatif prepared statement.',
        },
        {
          term: 'blocklist',
          meaning:
            'Menolak input yang memuat kata seperti `DROP` atau `UNION`. Pendekatan yang selalu kalah: bisa dilewati dengan variasi huruf, komentar SQL, atau encoding. Daftar hal buruk selalu tertinggal dari kreativitas penyerang.',
        },
        {
          term: 'identifier tidak bisa diparameterkan',
          meaning:
            'Nama tabel, nama kolom, dan arah `ORDER BY` **tidak bisa** jadi placeholder — secara sintaks pun gagal. Untuk itu kamu butuh pendekatan berbeda: allow-list.',
        },
        {
          term: 'allow-list',
          meaning:
            'Daftar nilai sah yang **kamu tulis sendiri**, dan input klien hanya dipakai sebagai kunci pencarian ke dalamnya. Kalau kuncinya tidak ada, dipakai nilai default. Tidak ada jalan bagi teks pengguna untuk sampai ke query — ini berbeda dari "sanitasi".',
        },
        {
          term: 'tagged template',
          meaning:
            'Bentuk `` prisma.$queryRaw`... ${email}` `` — perhatikan **tidak ada tanda kurung**. Library menerima potongan teks dan nilainya secara terpisah, lalu memparameterkannya. Berbeda dari `$queryRawUnsafe(...)` yang menerima string jadi; namanya sudah memberi peringatan.',
        },
        {
          term: 'hak akses minimum',
          meaning:
            'Lapisan pertahanan kedua: user database aplikasi hanya diberi izin yang benar-benar dibutuhkan. Aplikasi yang tidak pernah menjalankan DDL tidak boleh terkoneksi sebagai pemilik skema — sehingga injeksi yang lolos pun tidak bisa menghapus tabel.',
        },
      ),

      h2('Bagaimana ia terjadi'),
      code(
        'js',
        `
        // KODE RENTAN — jangan pernah tulis seperti ini
        const query = \`SELECT * FROM pengguna WHERE email = '\${email}'\`;
        `,
      ),
      p(
        'Sumber seluruh masalahnya ada pada `${email}` yang disisipkan langsung ke dalam string. Baris ini terlihat wajar karena ia hanya menyusun teks, dan justru itu bahayanya. Bagi JavaScript hasilnya sekadar rangkaian karakter, tetapi bagi database rangkaian itu adalah **perintah lengkap**. Karena isi `email` ikut menjadi bagian dari perintah, siapa pun yang mengisi kolom email di formulirmu sebenarnya sedang ikut menulis SQL. Perhatikan tanda kutip tunggal yang mengapitnya, sebab penyerang tidak perlu meretas apa pun dan cukup mengirim satu kutip untuk keluar dari batas yang kamu kira aman.',
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
      p(
        'Perbedaannya dengan kode rentan tadi hanya satu, tetapi menentukan. Nilai `email` **tidak pernah masuk ke dalam string query**. Ia dikirim terpisah lewat argumen kedua, sebagai anggota array. Yang berdiri di dalam query hanyalah penanda posisi, yaitu `$1` di PostgreSQL dan `?` di MySQL. Penanda itu bukan tempat teks disalin, melainkan slot yang diisi database setelah struktur perintahnya selesai ditetapkan. Karena itu tidak ada tanda kutip yang perlu kamu tulis mengelilinginya. Menambahkan kutip di sekitar `$1` justru membuatnya menjadi teks biasa dan query-mu berhenti bekerja.',
      ),
      p(
        'Perhatikan juga penomorannya di PostgreSQL: `$1` merujuk elemen pertama array, `$2` elemen kedua, dan seterusnya — jadi kamu bisa memakai `$1` dua kali dalam satu query tanpa mengirim nilainya dua kali. MySQL memakai `?` yang dicocokkan menurut **urutan kemunculan**, sehingga jumlah tanda tanya harus sama persis dengan jumlah elemen array. Bentuknya berbeda, prinsipnya identik, dan prinsip itulah yang menutup celahnya.',
      ),
      callout(
        'info',
        'Kenapa ini benar-benar menutup celahnya',
        "Perintah dan nilainya dikirim ke database **terpisah**. Database sudah selesai mengurai struktur query sebelum melihat nilainya, jadi apa pun isi `email`, termasuk `'; DROP TABLE --`, hanya diperlakukan sebagai teks yang dicari. Ini bukan penyaringan karakter, melainkan struktur query yang memang tidak bisa lagi berubah.",
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
            'Data dari admin, webhook, atau tabel lain tetap bisa memuat payload',
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
      p(
        'Baris pertama gagal karena parameter hanya bisa menggantikan **nilai**, bukan bagian dari struktur query. Database menetapkan strukturnya lebih dulu dan baru mengisi slot — jadi pada saat `$1` diisi, ia sudah harus tahu kolom mana yang diurutkan. Itu sebabnya nama kolom, nama tabel, dan arah `ASC`/`DESC` tidak bisa diparameterkan; keterbatasannya bukan kelalaian library melainkan konsekuensi langsung dari mekanisme yang membuat parameter aman.',
      ),
      p(
        'Perhatikan baik-baik dari mana `kolomSql` mengambil nilainya: dari objek `KOLOM_BOLEH` yang **kamu tulis sendiri**. Input klien hanya berperan sebagai kunci pencarian, dan `?? \'dibuat_pada\'` menangkap semua kunci yang tidak dikenal. Kirimkan `kolomDiminta = "judul; DROP TABLE catatan; --"` dan pencariannya menghasilkan `undefined`, sehingga yang masuk ke query tetap `dibuat_pada`. Inilah bedanya dengan "sanitasi": kamu tidak berusaha membersihkan teks berbahaya — teks dari klien memang tidak pernah sampai ke query sama sekali. Perhatikan juga baris terakhir tetap memakai template string, dan itu tidak apa-apa justru karena yang disisipkan sudah dipastikan berasal dari daftarmu.',
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
      references(
        {
          label: 'SQL Injection Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Termasuk penegasan bahwa escaping manual bukan alternatif prepared statement.',
        },
        {
          label: 'PREPARE',
          href: 'https://www.postgresql.org/docs/17/sql-prepare.html',
          source: 'PostgreSQL',
          note: 'Mekanisme yang memisahkan struktur query dari nilainya.',
        },
        {
          label: 'GRANT — hak akses',
          href: 'https://www.postgresql.org/docs/17/sql-grant.html',
          source: 'PostgreSQL',
          note: 'Membatasi izin user aplikasi sebagai lapisan pertahanan kedua.',
        },
        {
          label: 'MySQL — Prepared Statements',
          href: 'https://dev.mysql.com/doc/refman/8.4/en/sql-prepared-statements.html',
          source: 'MySQL',
          note: 'Padanan `?` untuk placeholder pada MySQL dan MariaDB.',
        },
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

      terms(
        {
          term: 'slug',
          meaning:
            'Versi judul yang ramah URL — `belajar-sql-dari-nol`. Ia dibuat `UNIQUE` supaya alamat artikel **stabil** meski judulnya nanti diperbaiki, dan supaya URL tidak bergantung pada id yang bisa ditebak.',
        },
        {
          term: 'CHECK bersyarat',
          meaning:
            'Constraint yang menegakkan aturan **antar kolom**: `CHECK (status <> \'terbit\' OR terbit_pada IS NOT NULL)` berarti "artikel terbit wajib punya tanggal terbit". Aturan seperti ini biasanya hidup di kode dan terlupakan — di sini ia mustahil dilanggar.',
        },
        {
          term: 'ON DELETE RESTRICT pada penulis',
          meaning:
            'Pilihan sadar di skema ini: menghapus pengguna **ditolak** selama ia masih punya artikel. Kalau dipakai `CASCADE`, satu penghapusan akun ikut menghapus seluruh tulisannya beserta komentar orang lain di dalamnya.',
        },
        {
          term: 'induk_id NULL',
          meaning:
            'Relasi ke diri sendiri pada tabel komentar. `NULL` berarti komentar **tingkat atas**; nilai berisi id berarti ia balasan. Satu kolom sudah cukup untuk menyatakan struktur bertingkat.',
        },
        {
          term: 'partial index',
          meaning:
            'Index dengan klausa `WHERE` sendiri, sehingga ia **hanya memuat baris yang relevan**. Halaman depan blog tidak pernah mencari draf atau artikel terhapus, jadi keduanya tidak perlu diindeks. Index yang lebih kecil berarti lebih banyak muat di memori.',
        },
        {
          term: 'kata_sandi_hash',
          meaning:
            'Namanya sengaja menyebut **hash**, bukan `password`. Nama kolom adalah dokumentasi: ia mengingatkan setiap pembaca bahwa yang disimpan bukan password. Panjang 255 cukup untuk keluaran argon2 maupun bcrypt.',
        },
        {
          term: 'migrasi',
          meaning:
            'Berkas SQL bernomor yang berisi perubahan skema, dijalankan berurutan. Nama `001_skema_blog.sql` bukan gaya penulisan: urutan itu yang membuat skema di laptopmu dan di produksi bisa dipastikan sama.',
        },
        {
          term: 'pemecah seri pada ORDER BY',
          meaning:
            'Tambahan `, a.id DESC` setelah `ORDER BY a.terbit_pada DESC`. Tanpa itu, artikel yang terbit pada detik yang sama bisa berpindah urutan antar pemanggilan — dan paginasi menampilkan item ganda atau melewatkannya.',
        },
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
      p(
        'Telusuri skema ini dengan membandingkannya pada daftar kebutuhan di atas — setiap butir di sana punya wujudnya di sini. "Artikel punya satu penulis" menjadi kolom `penulis_id` di tabel `artikel` (relasi satu-ke-banyak). "Tag dipakai bersama oleh banyak artikel" menjadi tabel `artikel_tag` dengan kunci gabungan (banyak-ke-banyak). "Komentar bisa membalas komentar lain" menjadi `induk_id` yang menunjuk ke tabelnya sendiri (relasi ke diri sendiri). "Artikel yang dihapus harus bisa dipulihkan" menjadi kolom `dihapus_pada` alih-alih penghapusan sungguhan (soft delete). Merancang skema pada dasarnya adalah pekerjaan penerjemahan seperti ini.',
      ),
      p(
        "Tiga `CHECK` di dalamnya memindahkan aturan yang biasanya hidup di kode ke dalam database. `CHECK (status IN ('draf','terbit','arsip'))` membuat status di luar ketiganya mustahil masuk, bahkan lewat skrip yang menulis langsung. `CHECK (length(trim(judul)) > 0)` menutup celah yang sering lolos dari `NOT NULL`: string kosong dan string berisi spasi bukan `NULL`, jadi tanpa `trim` keduanya akan diterima. Yang paling menarik adalah `CHECK (status <> 'terbit' OR terbit_pada IS NOT NULL)` — ia menegakkan aturan **antar kolom**, dibaca sebagai \"kalau statusnya terbit, maka `terbit_pada` wajib terisi\". Bentuk `A <> x OR B` inilah cara menuliskan \"jika A maka B\" dalam SQL.",
      ),
      p(
        'Perhatikan pula `ON DELETE` tidak dipilih seragam. Pada `artikel.penulis_id` dipakai `RESTRICT`: menghapus pengguna akan **ditolak** selama ia masih punya artikel, karena `CASCADE` di sini berarti satu penghapusan akun ikut melenyapkan seluruh tulisannya beserta komentar orang lain di dalamnya. Sebaliknya `komentar.artikel_id` memakai `CASCADE`, sebab komentar memang tidak punya arti tanpa artikel yang dikomentari. Aturannya: pakai `CASCADE` ketika anak benar-benar **bagian dari** induknya, dan `RESTRICT` ketika anak punya nilai sendiri yang tidak boleh hilang diam-diam.',
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
      p(
        'Lima baris pertama menerapkan aturan yang sudah kamu pelajari — satu index untuk setiap foreign key, karena PostgreSQL tidak membuatnya otomatis. Perhatikan `artikel_tag` hanya diberi satu index tambahan untuk `tag_id`; arah sebaliknya sudah terlayani oleh index bawaan `PRIMARY KEY (artikel_id, tag_id)` sesuai aturan kolom paling kiri.',
      ),
      p(
        'Index terakhir bentuknya berbeda dan layak dibaca pelan-pelan. Klausa `WHERE` di dalam `CREATE INDEX` membuat index **hanya memuat baris yang memenuhi syarat itu** — dan syaratnya sengaja dibuat sama persis dengan `WHERE` pada query halaman depan. Di blog dengan 100.000 artikel yang 90% di antaranya masih draf, index ini hanya berisi 10.000 baris, sehingga lebih ringkas dan lebih mungkin muat seluruhnya di memori. Ada syarat yang harus dipenuhi agar ini bekerja: query-mu harus memuat syarat yang sama, karena database hanya boleh memakai partial index kalau ia bisa membuktikan baris yang dicari pasti ada di dalamnya. Kolom `terbit_pada DESC` dipasang untuk melayani `ORDER BY` dengan arah yang sama, sehingga hasilnya sudah terurut tanpa perlu diurutkan ulang.',
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
      p(
        'Kelima query ini memakai kembali hampir setiap keputusan skema di atas, dan tiga di antaranya memilih jenis `JOIN` yang berbeda dengan sengaja. Query 1 memakai `JOIN` biasa karena setiap artikel dijamin punya penulis (`penulis_id` bertanda `NOT NULL`), jadi tidak ada baris yang bisa hilang. Query 2 memakai `LEFT JOIN` dua kali karena artikel tanpa tag tetap harus tampil — dengan `INNER JOIN`, artikel yang belum diberi tag akan lenyap dari halamannya sendiri. Query 3 memakai `LEFT JOIN` plus `COUNT(k.id)` agar artikel tanpa komentar memperoleh angka `0` dan bukan `1`.',
      ),
      p(
        'Perhatikan `a.dihapus_pada IS NULL` muncul lagi di query 1 dan 2 — inilah biaya soft delete yang disebut sebelumnya, dan ia harus diulang di **setiap** pembacaan. Query 1 juga menutup `ORDER BY`-nya dengan `a.id DESC` sebagai pemecah seri, sehingga dua artikel yang terbit pada detik yang sama tidak akan bertukar urutan antar halaman. Query 5 adalah satu-satunya `DELETE` sungguhan di sini, dan ia yang melengkapi janji "bisa dipulihkan selama 30 hari": `NOW() - INTERVAL \'30 days\'` menghitung batas waktunya di sisi database, dan jalankan sebagai tugas terjadwal, bukan di dalam permintaan pengguna.',
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
      p(
        "Tiga syarat pada `WHERE` menanggung tiga tugas berbeda. `id = 42` menentukan barisnya, `penulis_id = 7` memastikan artikel itu **milik orang yang meminta**, dan `status = 'draf'` menegakkan aturan alur kerja bahwa hanya draf yang boleh diterbitkan. Ketiganya digabung dalam satu perintah bukan tanpa alasan: kalau kamu memeriksanya lebih dulu dengan `SELECT` lalu menjalankan `UPDATE` terpisah, ada celah waktu di antara keduanya yang bisa disisipi perubahan lain. Karena semuanya menyatu, hasilnya cukup dibaca dari **jumlah baris terpengaruh** — nilai `0` berarti salah satu syarat tidak terpenuhi, dan aplikasi harus `ROLLBACK`.",
      ),
      p(
        '`INSERT ... SELECT` di bawahnya menyisipkan banyak baris sekaligus dari hasil sebuah query, bukan dari daftar nilai yang ditulis tangan. Untuk setiap tag yang slug-nya ada di `$1`, ia membuat satu baris penghubung ke artikel 42. Bagian `ON CONFLICT DO NOTHING` menangani tag yang sudah terpasang sebelumnya, karena tanpa itu `PRIMARY KEY (artikel_id, tag_id)` akan menolak duplikatnya dengan error dan menggagalkan seluruh transaksi. Perhatikan `$1` tetap dipakai sebagai parameter walau nilainya berupa daftar, sebab slug dari klien tidak pernah disisipkan langsung ke dalam teks query.',
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
          body: 'Ia membuat impossible state menjadi tidak bisa dinyatakan: artikel berstatus terbit tanpa tanggal terbit akan ditolak database. Aturan yang ditegakkan di lapisan data berlaku untuk semua penulis, termasuk skrip dan migrasi.',
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

      references(
        {
          label: 'CREATE TABLE',
          href: 'https://www.postgresql.org/docs/17/sql-createtable.html',
          source: 'PostgreSQL',
          note: 'Seluruh sintaks yang dipakai skema di atas, termasuk `CHECK` antar kolom.',
        },
        {
          label: 'CREATE INDEX — partial index',
          href: 'https://www.postgresql.org/docs/17/indexes-partial.html',
          source: 'PostgreSQL',
          note: 'Klausa `WHERE` pada index yang membuatnya lebih kecil dan lebih cepat.',
        },
        {
          label: 'Using EXPLAIN',
          href: 'https://www.postgresql.org/docs/17/using-explain.html',
          source: 'PostgreSQL',
          note: 'Membuktikan index halaman depan benar-benar dipakai, sesuai checklist di atas.',
        },
        {
          label: 'Password Storage Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Alasan kolomnya bernama `kata_sandi_hash`, dan panjang 255 yang dipilih.',
        },
      ),
    ],
  ),
];
