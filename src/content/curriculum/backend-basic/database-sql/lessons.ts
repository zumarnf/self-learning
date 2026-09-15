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
    14,
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
      h2('Studi kasus di project nyata'),
      p(
        'Alasan memakai database paling mudah dibuktikan pada satu situasi yang mustahil ditangani berkas biasa, yaitu **dua penulis pada saat yang sama**. Berikut ukuran sungguhannya, dijalankan pada PostgreSQL 16.15 dengan dua proses yang berjalan bersamaan mengurangi saldo yang sama.',
      ),
      code(
        'text',
        `
        Saldo awal 100. Dua proses masing-masing mengurangi 10.
        Hasil yang benar seharusnya 80.

        POLA BACA-LALU-TULIS
          proses A: SELECT jumlah -> 100 ... hitung 100-10 ... UPDATE SET jumlah = 90
          proses B: SELECT jumlah -> 100 ... hitung 100-10 ... UPDATE SET jumlah = 90

          saldo akhir = 90        <- satu pengurangan HILANG

        POLA ATOMIK
          proses A: UPDATE saldo SET jumlah = jumlah - 10
          proses B: UPDATE saldo SET jumlah = jumlah - 10

          saldo akhir = 80        <- benar
        `,
        {
          caption:
            'Dijalankan sungguhan pada PostgreSQL 16.15, dua proses psql yang berjalan bersamaan.',
        },
      ),
      p(
        'Selisih antara keduanya bukan gaya penulisan melainkan **di mana perhitungannya terjadi**. Pada pola pertama, angka dibaca ke aplikasi, dihitung di sana, lalu dikirim kembali sebagai nilai jadi. Selama perjalanan itu, database tidak tahu bahwa nilai yang jadi dasar perhitungan sudah kedaluwarsa. Pada pola kedua, perhitungannya terjadi di dalam database sambil barisnya terkunci, sehingga proses kedua menunggu dan membaca nilai yang sudah diperbarui.',
      ),
      p(
        'Kejadian ini punya nama, yaitu **lost update**, dan ia tidak menghasilkan error apa pun. Yang tersisa hanya angka yang salah, dan pada sistem keuangan atau stok barang, angka yang salah itu ditemukan berminggu-minggu kemudian ketika ada yang menghitung ulang secara manual.',
      ),
      table(
        ['Kebutuhan', 'Berkas biasa', 'Database'],
        [
          [
            'Dua penulis pada waktu yang sama',
            'Diukur, satu perubahan bisa hilang tanpa jejak',
            'Baris terkunci selama diubah, jadi perubahan kedua menunggu',
          ],
          [
            'Mencari satu baris di antara ratusan ribu',
            'Seluruh berkas harus dibaca',
            'Diukur, index membuatnya 0,05 milidetik alih-alih 10 milidetik',
          ],
          [
            'Menjaga bentuk data tetap sah',
            'Tidak ada yang memeriksa apa pun',
            'Diuji sungguhan, `NOT NULL`, `CHECK`, dan `UNIQUE` menolak baris yang salah',
          ],
          [
            'Beberapa perubahan yang harus jadi satu kesatuan',
            'Bisa berhenti di tengah dan meninggalkan keadaan setengah',
            'Diuji sungguhan, transaksi membatalkan seluruhnya bila satu bagian gagal',
          ],
        ],
      ),
      p(
        'Baris terakhir tabel itu yang paling sering diremehkan sampai terjadi. Sebuah pesanan yang mengurangi stok, mencatat pembayaran, dan mengirim notifikasi punya tiga langkah, dan kegagalan pada langkah kedua tanpa transaksi meninggalkan stok yang sudah berkurang untuk pesanan yang tidak pernah lahir.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kelas kegagalan berikutnya baru muncul ketika dua transaksi saling menunggu. PostgreSQL mendeteksinya sendiri lalu membunuh salah satunya, dan pesannya menyebutkan kedua pihak.',
      ),
      code(
        'text',
        `
        Sesi A: UPDATE saldo ... WHERE id = 1   lalu   WHERE id = 2
        Sesi B: UPDATE saldo ... WHERE id = 2   lalu   WHERE id = 1

        ERROR:  deadlock detected
        DETAIL:  Process 482844 waits for ShareLock on transaction 821;
                 blocked by process 482845.
                 Process 482845 waits for ShareLock on transaction 822;
                 blocked by process 482844.
        HINT:  See server log for query details.
        CONTEXT:  while updating tuple (0,2) in relation "saldo"
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15 dengan dua sesi psql bersamaan.' },
      ),
      p(
        'Yang layak diperhatikan, hanya **satu** dari dua sesi itu yang menerima error. Sesi yang lain berhasil sepenuhnya. Jadi deadlock bukan kerusakan database melainkan cara database menyelamatkan dirinya dari kebuntuan, dan tugas aplikasi adalah mencoba ulang transaksi yang dibatalkan.',
      ),
      p(
        'Penyebabnya hampir selalu sama, yaitu **urutan pengambilan kunci yang berbeda**. Sesi A memegang baris 1 lalu meminta baris 2, sesi B memegang baris 2 lalu meminta baris 1. Pencegahannya sederhana dan tidak butuh alat apa pun, yaitu selalu mengambil kunci dalam urutan yang tetap, misalnya diurutkan berdasarkan id.',
      ),
      code(
        'sql',
        `
        -- Rentan deadlock: urutannya bergantung siapa pengirim dan siapa penerima.
        UPDATE saldo SET jumlah = jumlah - 100 WHERE id = pengirim;
        UPDATE saldo SET jumlah = jumlah + 100 WHERE id = penerima;

        -- Aman: kunci diambil dalam urutan id yang tetap, apa pun arah transfernya.
        SELECT id FROM saldo
        WHERE id IN (pengirim, penerima)
        ORDER BY id
        FOR UPDATE;

        UPDATE saldo SET jumlah = jumlah - 100 WHERE id = pengirim;
        UPDATE saldo SET jumlah = jumlah + 100 WHERE id = penerima;
        `,
        {
          caption:
            'ORDER BY di dalam FOR UPDATE-nya yang menentukan, sebab ia menetapkan urutan pengambilan kunci.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan pada tahap ini bukan soal sintaks SQL melainkan soal memindahkan pekerjaan ke tempat yang salah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membaca nilai, menghitung di aplikasi, lalu menuliskannya kembali',
            'Lebih mudah dibaca dan diuji',
            'Diukur, dua proses bersamaan membuat satu pengurangan hilang. Pakai `SET kolom = kolom - n`',
          ],
          [
            'Menyimpan data di berkas JSON karena datanya sedikit',
            'Belum butuh database',
            'Diukur, dua penulis bersamaan saling menimpa. Batasnya bukan jumlah data melainkan jumlah penulis',
          ],
          [
            'Menganggap deadlock sebagai kerusakan',
            'Ada kata error',
            'Diuji sungguhan, satu sesi tetap berhasil. Ia mekanisme pelindung, dan aplikasinya harus mencoba ulang',
          ],
          [
            'Mengunci baris lebih lama daripada perlu',
            'Supaya aman',
            'Transaksi panjang menahan sesi lain dan memperbesar peluang deadlock. Buka sependek mungkin',
          ],
          [
            'Memanggil layanan luar di dalam transaksi',
            'Sekalian satu blok',
            'Transaksinya menggantung selama menunggu jaringan, dan kunci ikut tertahan. Panggil di luar transaksi',
          ],
          [
            'Memvalidasi keunikan dengan `SELECT` lalu `INSERT`',
            'Sudah diperiksa dulu',
            'Dua proses bisa lolos pemeriksaan bersamaan. Yang menjamin hanyalah `UNIQUE` di database',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah bentuk lain dari masalah yang sama dengan baris pertama, dan pantas dipegang sebagai aturan. Setiap pemeriksaan yang dilakukan aplikasi sebelum menulis punya celah waktu antara pemeriksaan dan penulisan, dan pada celah itu proses lain bisa menyelip. Yang menutupnya bukan kode yang lebih hati-hati melainkan batasan di database, sebab hanya database yang bisa menilai keduanya dalam satu tindakan.',
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
    17,
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
      h2('Studi kasus di project nyata'),
      p(
        'Keputusan yang paling menentukan saat membuat tabel bukan pemilihan tipe data melainkan **seberapa ketat batasannya**. Tabel yang longgar terasa nyaman selama pengembangan dan menjadi sumber data kotor yang tidak bisa dibersihkan lagi setelah setahun berjalan. Berikut satu tabel produk yang batasannya sengaja ditulis lengkap, lalu diuji dengan data yang salah.',
      ),
      code(
        'sql',
        `
        CREATE TABLE produk (
          id     bigserial PRIMARY KEY,
          sku    text    NOT NULL UNIQUE,
          nama   text    NOT NULL,
          harga  integer NOT NULL CHECK (harga > 0),
          stok   integer NOT NULL DEFAULT 0 CHECK (stok >= 0)
        );

        -- Empat keputusan yang masing-masing menutup satu kelas data kotor:
        --   NOT NULL      -> tidak ada produk tanpa nama
        --   UNIQUE        -> tidak ada dua produk dengan SKU sama
        --   CHECK harga>0 -> tidak ada produk berharga nol atau minus
        --   CHECK stok>=0 -> stok tidak pernah bisa menjadi minus
        --
        -- harga bertipe integer, bukan pecahan: rupiah utuh, bukan rupiah koma.
        -- Alasannya sama dengan yang diukur di bab Fondasi, yaitu 19.99 * 100
        -- menghasilkan 1998.9999999999998 pada bilangan pecahan biner.
        `,
        {
          caption:
            'Skema yang benar-benar dibuat di PostgreSQL 16.15 untuk seluruh pengukuran di bab ini.',
        },
      ),
      p(
        'Setiap batasan itu bukan hiasan, dan cara paling meyakinkan untuk membuktikannya adalah melihat apa yang terjadi ketika data yang salah mencoba masuk.',
      ),
      code(
        'text',
        `
        INSERT INTO pelanggan (email, nama) VALUES ('pengguna1@contoh.id', 'Kembar');
          ERROR:  duplicate key value violates unique constraint "pelanggan_email_key"
          DETAIL:  Key (email)=(pengguna1@contoh.id) already exists.

        INSERT INTO pelanggan (email, nama) VALUES ('baru@contoh.id', NULL);
          ERROR:  null value in column "nama" of relation "pelanggan"
                  violates not-null constraint
          DETAIL:  Failing row contains (200002, baru@contoh.id, null, null, 2026-09-07 ...).

        INSERT INTO produk (sku, nama, harga) VALUES ('SKU-X', 'Gratisan', 0);
          ERROR:  new row for relation "produk" violates check constraint "produk_harga_check"
          DETAIL:  Failing row contains (5001, SKU-X, Gratisan, 0, 0).

        INSERT INTO pesanan (pelanggan_id, status) VALUES (1, 'menunggu');
          ERROR:  new row for relation "pesanan" violates check constraint "pesanan_status_check"
          DETAIL:  Failing row contains (300001, 1, menunggu, 2026-09-07 ...).
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Baris `DETAIL` pada setiap pesan itu sangat berharga saat menelusuri, sebab ia mencetak **seluruh isi baris yang ditolak**. Ketika sebuah impor data massal gagal di baris ke sekian ribu, keterangan itu langsung menunjukkan nilai mana yang bermasalah tanpa perlu mencari sendiri.',
      ),
      p(
        'Nilai `status` yang dibatasi `CHECK` layak diperhatikan tersendiri. Tanpa batasan itu, sebuah salah ketik di kode aplikasi akan melahirkan status baru yang tidak pernah dirancang siapa pun, misalnya `dibayar ` dengan spasi di belakang, dan barisnya menjadi tidak terlihat oleh semua penyaringan yang sudah ada. Data seperti itu tidak menghasilkan error, hanya laporan yang jumlahnya tidak pernah cocok.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Bagian tabel yang paling banyak menghasilkan bug senyap bukan tipe data melainkan `NULL`, sebab `NULL` bukan sebuah nilai melainkan **ketiadaan nilai**, dan perbandingan dengan ketiadaan tidak menghasilkan benar maupun salah.',
      ),
      code(
        'text',
        `
        Dari 205.000 baris pelanggan, 41.000 di antaranya kota-nya NULL.

        SELECT count(*) FROM pelanggan WHERE kota = NULL;
          count = 0            <- TIDAK ada error, dan hasilnya salah

        SELECT count(*) FROM pelanggan WHERE kota IS NULL;
          count = 41000        <- yang benar

        SELECT count(*), count(kota) FROM pelanggan;
          count(*)    = 205000     <- menghitung BARIS
          count(kota) = 164000     <- menghitung NILAI yang tidak NULL
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Baris pertama adalah bentuk kegagalan yang paling berbahaya, yaitu query yang berjalan tanpa keluhan dan mengembalikan nol baris. Penyebabnya, `kota = NULL` tidak bernilai benar maupun salah melainkan `NULL` sendiri, dan baris hanya lolos `WHERE` ketika syaratnya bernilai benar. Karena itu perbandingan dengan ketiadaan harus memakai `IS NULL` dan `IS NOT NULL`.',
      ),
      p('Bentuk yang lebih jahat lagi muncul pada `NOT IN`, dan yang ini menghapus seluruh hasil.'),
      code(
        'text',
        `
        SELECT count(*) FROM pelanggan WHERE kota NOT IN ('Bandung', NULL);
          count = 0            <- seluruh hasil lenyap

        SELECT count(*) FROM pelanggan WHERE kota NOT IN ('Bandung');
          count = 123000       <- yang diharapkan
        `,
        { caption: 'Dijalankan sungguhan. Satu NULL di dalam daftar mengosongkan seluruh hasil.' },
      ),
      p(
        'Sebabnya bisa ditelusuri langkah demi langkah. `kota NOT IN (a, b)` sama artinya dengan `kota <> a AND kota <> b`. Ketika `b` adalah `NULL`, bagian `kota <> NULL` bernilai `NULL`, dan `benar AND NULL` menghasilkan `NULL` yang tidak lolos `WHERE`. Jadi tidak ada satu baris pun yang bisa lolos, berapa pun isinya. Kasus ini nyata karena daftar di dalam `NOT IN` sering datang dari subquery yang tanpa sengaja memuat `NULL`.',
      ),
      table(
        ['Yang ditulis', 'Hasil yang diukur', 'Yang benar'],
        [
          ['`WHERE kota = NULL`', '0 baris, tanpa error', '`WHERE kota IS NULL`'],
          [
            "`WHERE kota <> 'Bandung'`",
            'Diukur, 123.000 baris — 41.000 baris ber-`NULL` ikut terbuang',
            '`IS DISTINCT FROM` bila `NULL` harus ikut: diukur 164.000',
          ],
          [
            '`NOT IN (subquery ber-NULL)`',
            '0 baris, seluruhnya lenyap',
            '`NOT EXISTS`, atau saring `NULL` di subquery-nya',
          ],
          [
            '`count(kolom)`',
            'Melewatkan baris ber-`NULL`',
            '`count(*)` bila yang dihitung memang baris',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan merancang tabel punya biaya yang tertunda, yaitu murah saat ditulis dan sangat mahal saat harus diubah ketika sudah ada jutaan baris dan puluhan tempat yang memakainya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat semua kolom bertipe `text` dan boleh `NULL`',
            'Fleksibel, tidak akan menghalangi',
            'Setiap pembacaan harus memeriksa dan mengubah tipe sendiri, dan data kotor masuk tanpa hambatan',
          ],
          [
            'Membandingkan dengan `= NULL`',
            'Begitu cara membandingkan',
            'Diuji sungguhan, hasilnya 0 baris tanpa error. Pakai `IS NULL`',
          ],
          [
            'Memakai `NOT IN` dengan daftar dari subquery',
            'Paling langsung dibaca',
            'Diuji sungguhan, satu `NULL` di dalamnya mengosongkan seluruh hasil. Pakai `NOT EXISTS`',
          ],
          [
            'Menyimpan uang dengan tipe pecahan',
            'Harga memang berkoma',
            'Pembulatan biner menghasilkan selisih yang tidak bisa dijelaskan. Simpan bilangan bulat dalam satuan terkecil',
          ],
          [
            'Menyimpan waktu tanpa zona waktu',
            'Servernya kan satu',
            'Begitu ada pengguna atau server di zona lain, tidak ada cara mengetahui waktu itu maksudnya kapan. Pakai `timestamptz`',
          ],
          [
            'Memakai string kosong untuk menyatakan tidak ada nilai',
            'Sama saja dengan kosong',
            'String kosong adalah nilai yang ada, jadi ia lolos `NOT NULL` dan ikut terhitung `count(kolom)`. Dua hal berbeda jadi tercampur',
          ],
        ],
      ),
      p(
        'Baris kelima pantas ditegaskan karena akibatnya tidak bisa diperbaiki belakangan. Sebuah kolom `timestamp` tanpa zona menyimpan angka jam tanpa keterangan jam siapa, dan ketika suatu hari perlu diketahui apakah `2026-09-07 08:00` itu waktu Jakarta atau waktu server di Singapura, tidak ada satu pun keterangan di dalam data yang bisa menjawabnya. Menyimpan `timestamptz` sejak awal tidak menambah kerumitan apa pun dan menutup pertanyaan itu selamanya.',
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
    19,
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
      h2('Studi kasus di project nyata'),
      p(
        'Cerita index selalu sama di setiap project. Aplikasinya cepat selama data masih sedikit, lalu melambat pelan-pelan tanpa ada satu perubahan kode pun. Berikut ukurannya pada tabel `pesanan` berisi 300.000 baris, memakai `EXPLAIN ANALYZE` yang menampilkan apa yang benar-benar dikerjakan PostgreSQL, bukan perkiraan.',
      ),
      code(
        'text',
        `
        SELECT * FROM pesanan WHERE pelanggan_id = 137456;

        TANPA index
          Parallel Seq Scan on pesanan (actual time=5.111..6.970 rows=0 loops=2)
            Rows Removed by Filter: 150000
            Buffers: shared hit=2206
          Execution Time: 10.688 ms

        DENGAN index pada pelanggan_id
          Index Scan using idx_pesanan_pelanggan on pesanan (actual time=0.019..0.019 rows=1 loops=1)
            Buffers: shared hit=7
          Execution Time: 0.047 ms
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15 dengan 300.000 baris pesanan.' },
      ),
      p(
        'Tiga angka di situ yang layak dibaca, dan yang paling menjelaskan justru bukan waktunya. `Rows Removed by Filter: 150000` berarti PostgreSQL membaca seratus lima puluh ribu baris **per pekerja** lalu membuang hampir semuanya untuk menemukan satu baris. `Buffers: shared hit=2206` berarti 2206 halaman memori disentuh, dibandingkan dengan 7 pada versi ber-index. Selisih waktunya sekitar 227 kali, dan yang lebih penting, selisih itu **tumbuh seiring jumlah baris** sedangkan versi ber-index hampir tidak berubah.',
      ),
      p('Index bukan barang gratis, dan biayanya juga bisa diukur.'),
      code(
        'text',
        `
        SELECT pg_size_pretty(pg_relation_size('pesanan'))              AS tabel,
               pg_size_pretty(pg_relation_size('idx_pesanan_pelanggan')) AS index;

          tabel | index
          ------+---------
          17 MB | 6168 kB
        `,
        { caption: 'Dijalankan sungguhan. Satu index memakan sekitar sepertiga ukuran tabelnya.' },
      ),
      p(
        'Jadi setiap index menambah ruang penyimpanan dan, yang lebih terasa, menambah pekerjaan pada setiap `INSERT`, `UPDATE`, dan `DELETE`, sebab index-nya ikut diperbarui. Tabel dengan sepuluh index membuat setiap penulisan mengerjakan sebelas pekerjaan. Karena itu index ditambahkan berdasarkan query yang benar-benar dijalankan aplikasi, bukan berdasarkan dugaan bahwa sebuah kolom "mungkin akan dicari".',
      ),
      table(
        ['Kolom seperti apa', 'Perlu index?', 'Alasannya'],
        [
          [
            'Foreign key',
            'Hampir selalu',
            'Setiap `JOIN` dan setiap pemeriksaan penghapusan induk memakainya',
          ],
          ['Kolom di `WHERE` yang sering dipakai', 'Ya', 'Itu tepat gunanya'],
          [
            'Kolom di `ORDER BY` bersama `LIMIT`',
            'Ya',
            'Index menyimpan urutan, jadi tidak perlu mengurutkan seluruh tabel',
          ],
          [
            'Kolom bernilai sedikit variasi, misalnya `status`',
            'Biasanya tidak sendirian',
            'Menyaring separuh tabel tidak lebih murah daripada membaca semuanya',
          ],
          [
            'Kolom yang tidak pernah muncul di query',
            'Tidak',
            'Hanya menambah biaya penulisan dan ruang',
          ],
        ],
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kunci menghasilkan dua error yang akan sering kamu temui, dan keduanya sebenarnya kabar baik, sebab keduanya mencegah data rusak.',
      ),
      code(
        'text',
        `
        INSERT INTO pesanan (pelanggan_id) VALUES (999999999);

          ERROR:  insert or update on table "pesanan" violates foreign key
                  constraint "pesanan_pelanggan_id_fkey"
          DETAIL:  Key (pelanggan_id)=(999999999) is not present in table "pelanggan".

        DELETE FROM pelanggan WHERE id = 1;

          ERROR:  update or delete on table "pelanggan" violates foreign key
                  constraint "pesanan_pelanggan_id_fkey" on table "pesanan"
          DETAIL:  Key (id)=(1) is still referenced from table "pesanan".
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Error pertama menghentikan lahirnya pesanan yatim, yaitu pesanan yang menunjuk pelanggan yang tidak ada. Error kedua menghentikan lahirnya hal yang sama dari arah sebaliknya, yaitu menghapus pelanggan yang masih punya pesanan. Tanpa foreign key, dua tindakan itu berhasil tanpa keluhan dan meninggalkan data yang mustahil dipulihkan, sebab keterangan tentang pelanggan itu sudah hilang.',
      ),
      p(
        'Yang perlu diputuskan sadar adalah **apa yang terjadi ketika induknya dihapus**, dan pilihannya bukan soal selera melainkan soal arti data.',
      ),
      code(
        'sql',
        `
        -- Item pesanan tidak punya arti tanpa pesanannya. Ikut terhapus.
        pesanan_id bigint NOT NULL REFERENCES pesanan(id) ON DELETE CASCADE

        -- Pesanan tetap punya arti meski pelanggannya dihapus (riwayat, akuntansi).
        -- Bawaan PostgreSQL adalah NO ACTION, yaitu MENOLAK penghapusan induknya.
        pelanggan_id bigint NOT NULL REFERENCES pelanggan(id)

        -- Kalau memang boleh yatim, nyatakan secara eksplisit.
        editor_id bigint REFERENCES pengguna(id) ON DELETE SET NULL
        `,
        {
          caption:
            'Diuji sungguhan: DELETE FROM pesanan WHERE id = 1 ikut menghapus 2 baris item_pesanan-nya.',
        },
      ),
      p(
        '`ON DELETE CASCADE` layak dipakai dengan hati-hati justru karena ia bekerja diam-diam. Menghapus satu baris bisa menghapus ribuan baris di tabel lain tanpa satu pun konfirmasi, dan bila tabel itu punya turunan lagi, penghapusannya menjalar. Untuk data yang penting, banyak tim memilih **soft delete**, yaitu menandai baris sebagai terhapus alih-alih menghapusnya.',
      ),
      code(
        'text',
        `
        Error ketiga yang muncul dari UNIQUE, dan ini yang paling sering:

          INSERT INTO pelanggan (email, nama) VALUES ('pengguna1@contoh.id', 'Kembar');

          ERROR:  duplicate key value violates unique constraint "pelanggan_email_key"
          DETAIL:  Key (email)=(pengguna1@contoh.id) already exists.
        `,
        { caption: 'Dijalankan sungguhan.' },
      ),
      p(
        'Cara menanganinya di aplikasi menentukan kualitas pesan yang dilihat pengguna. Menangkapnya sebagai kegagalan umum menghasilkan "terjadi kesalahan", sedangkan memeriksa kode errornya menghasilkan "email ini sudah terdaftar". PostgreSQL memberi kode `23505` untuk pelanggaran keunikan, dan nama batasannya ikut dikirim sehingga bisa dipetakan ke nama field yang tepat.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kunci dan index adalah dua hal yang paling sering ditunda dengan alasan "nanti kalau sudah perlu", dan keduanya jauh lebih mahal ditambahkan setelah datanya banyak.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Tidak memasang foreign key supaya lebih fleksibel',
            'Menghalangi saat mengembangkan',
            'Diuji sungguhan, tanpa itu baris yatim masuk tanpa keluhan dan tidak bisa dipulihkan',
          ],
          [
            'Lupa memberi index pada kolom foreign key',
            'Sudah ada `REFERENCES`-nya',
            '`REFERENCES` tidak membuat index. Setiap `JOIN` lewat kolom itu jadi pemindaian penuh',
          ],
          [
            'Memberi index pada setiap kolom',
            'Supaya semuanya cepat',
            'Diukur, satu index sebesar sepertiga tabelnya, dan setiap penulisan harus memperbaruinya',
          ],
          [
            'Menganggap query lambat pasti butuh index baru',
            'Itu obat yang biasa dipakai',
            'Jalankan `EXPLAIN ANALYZE` dulu. Kadang index-nya sudah ada tapi tidak terpakai karena bentuk query-nya',
          ],
          [
            'Memakai `ON DELETE CASCADE` di mana-mana',
            'Praktis, tidak ada error penghapusan',
            'Satu penghapusan bisa menjalar ke ribuan baris di banyak tabel tanpa konfirmasi apa pun',
          ],
          [
            'Memakai email atau nomor telepon sebagai primary key',
            'Sudah unik secara alami',
            'Keduanya bisa berubah, dan mengubah primary key berarti mengubah setiap baris yang menunjuknya',
          ],
        ],
      ),
      p(
        'Baris keempat pantas dijadikan kebiasaan sebelum menambah index apa pun. Sebuah index tidak terpakai ketika kolomnya dibungkus fungsi, misalnya `WHERE lower(email) = ...` pada index biasa di `email`, atau ketika `LIKE`-nya diawali tanda persen. Menambah index kedua tidak menyelesaikan apa pun di situ, sedangkan mengubah bentuk query atau membuat index berbasis ekspresi menyelesaikannya. `EXPLAIN ANALYZE` yang membedakan dua situasi itu, dan menjalankannya lebih cepat daripada menebak.',
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
    18,
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
      h2('Studi kasus di project nyata'),
      p(
        'Halaman daftar dengan paginasi ada di hampir setiap aplikasi, dan ia punya satu sifat yang tidak terlihat selama pengujian, yaitu **biayanya bertambah seiring nomor halaman**. Halaman pertama selalu cepat, jadi tidak ada yang menyadari apa pun sampai seseorang membuka halaman lima ribu atau sebuah pekerjaan ekspor menelusuri seluruh tabel halaman demi halaman.',
      ),
      code(
        'text',
        `
        SELECT * FROM pesanan ORDER BY id LIMIT 20 OFFSET n;
        Tabel berisi 300.000 baris, kolom id sudah ber-index (primary key).

          OFFSET      0   ->  membaca     20 baris   ->  0,041 ms
          OFFSET 100000   ->  membaca 100.020 baris  ->  9,745 ms
          OFFSET 250000   ->  membaca 250.020 baris  -> 24,722 ms

        Untuk memberi 20 baris pada halaman terakhir, PostgreSQL harus
        membaca 250.020 baris lalu MEMBUANG 250.000 di antaranya.
        `,
        {
          caption:
            'Dijalankan sungguhan pada PostgreSQL 16.15, angka baris diambil dari EXPLAIN ANALYZE.',
        },
      ),
      p(
        'Sifat itu melekat pada cara `OFFSET` bekerja dan tidak bisa diperbaiki dengan index apa pun, sebab `OFFSET` memang berarti "hitung dan lewati sebanyak n baris". Index membantu menemukan urutannya, tetapi baris yang dilewati tetap harus dilalui satu per satu.',
      ),
      p(
        'Penggantinya bernama **keyset pagination** atau paginasi berbasis kursor. Alih-alih menyebut nomor halaman, klien menyebut **di mana halaman sebelumnya berhenti**.',
      ),
      code(
        'sql',
        `
        -- Halaman pertama: tidak perlu penanda apa pun.
        SELECT id, judul, dibuat_pada
        FROM pesanan
        ORDER BY id
        LIMIT 20;

        -- Halaman berikutnya: bawa id terakhir dari halaman sebelumnya.
        SELECT id, judul, dibuat_pada
        FROM pesanan
        WHERE id > $1              -- $1 = id terakhir yang sudah dikirim
        ORDER BY id
        LIMIT 20;
        `,
        { caption: 'Diukur di posisi yang sama dengan OFFSET 250000: membaca 20 baris, 0,064 ms.' },
      ),
      p(
        'Selisihnya di posisi yang sama adalah 24,722 milidetik melawan 0,064 milidetik, sekitar 386 kali. Dan yang lebih penting daripada angkanya, biaya keyset **tidak bertambah** ketika nomor halamannya makin jauh, sebab ia selalu membaca dua puluh baris.',
      ),
      table(
        ['Kebutuhan', 'Cara yang tepat', 'Alasannya'],
        [
          [
            'Menelusuri seluruh data, misalnya ekspor atau sinkronisasi',
            'Keyset',
            'Tidak melambat di halaman jauh, dan tidak melewatkan baris saat data berubah',
          ],
          [
            'Gulir tak berujung di aplikasi',
            'Keyset',
            'Klien hanya perlu bergerak maju, dan itu tepat yang diberikan keyset',
          ],
          [
            'Halaman bernomor yang bisa dilompati pengguna',
            '`OFFSET`, dengan batas nomor halaman',
            'Keyset tidak bisa melompat ke halaman 500. Batasi nomor halaman maksimalnya',
          ],
          [
            'Menampilkan jumlah total halaman',
            'Perkiraan, bukan `count(*)` tepat',
            '`count(*)` pada tabel besar sendiri sudah mahal. Pertimbangkan estimasi dari statistik tabel',
          ],
        ],
      ),

      h2('Saat error-nya muncul'),
      p(
        'Paginasi punya kegagalan kedua yang lebih serius daripada lambat, yaitu **baris yang tidak pernah terlihat pengguna**. Ia terjadi ketika urutannya tidak menentukan satu susunan yang pasti, dan itu terjadi setiap kali kolom pengurut punya nilai yang sama pada beberapa baris.',
      ),
      code(
        'text',
        `
        Sepuluh tugas, SEMUANYA berprioritas 1.

        ORDER BY prioritas   (tanpa pemecah seri)
          halaman 1 (LIMIT 3 OFFSET 0)  ->  Tugas 2 | Tugas 3 | Tugas 1
          ... satu baris di halaman 1 disunting pengguna lain ...
          halaman 2 (LIMIT 3 OFFSET 3)  ->  Tugas 5 | Tugas 6 | Tugas 7

          Tugas 4 TIDAK PERNAH muncul di halaman mana pun.

        ORDER BY prioritas, id   (dengan pemecah seri)
          halaman 1  ->  Tugas 1 | Tugas 2 | Tugas 3
          ... suntingan yang sama ...
          halaman 2  ->  Tugas 4 | Tugas 5 | Tugas 6

          Tidak ada yang hilang.
        `,
        {
          caption:
            'Dijalankan sungguhan pada PostgreSQL 16.15. Suntingannya berupa satu UPDATE biasa di antara dua pembacaan.',
        },
      ),
      p(
        'Penyebabnya, ketika beberapa baris punya nilai pengurut yang sama, database bebas mengembalikannya dalam urutan apa pun, dan urutan itu bisa berubah antara dua query. Sebuah `UPDATE` memindahkan baris secara fisik di dalam tabel, dan itu cukup untuk mengubah urutannya. Halaman pertama sudah mengambil tiga baris, halaman kedua melewati tiga baris dari susunan yang **sudah berbeda**, dan satu baris terlewat di celahnya.',
      ),
      p(
        'Perhatikan juga bahwa halaman pertama tanpa pemecah seri mengembalikan `Tugas 2 | Tugas 3 | Tugas 1`, yaitu bukan urutan yang diharapkan siapa pun meski belum ada suntingan apa pun. Ini bukan bug database melainkan tepat apa yang dijanjikannya, yaitu tidak ada janji urutan untuk nilai yang seri.',
      ),
      code(
        'sql',
        `
        -- Aturan yang menutup seluruh kelas bug ini, dan biayanya nol:
        -- SETIAP query berpaginasi harus berakhir pada kolom yang UNIK.

        ORDER BY dibuat_pada DESC, id DESC     -- benar
        ORDER BY prioritas, id                 -- benar
        ORDER BY nama                          -- rentan, nama bisa sama
        ORDER BY dibuat_pada DESC              -- rentan, terutama bila diisi sekaligus
        `,
      ),
      p(
        'Kelompok kegagalan ketiga di sini adalah pencarian teks, dan yang menjebak adalah index yang **ada tetapi tidak terpakai**. Berikut empat bentuk pencarian pada kolom `email` yang sudah ber-index.',
      ),
      code(
        'text',
        `
        Tabel 205.000 baris, ada index biasa pada email.
        Collation basis data ini en_US.UTF-8.

          WHERE email = 'pengguna137456@contoh.id'
            Index Only Scan  ->   0,100 ms

          WHERE email LIKE 'pengguna137456%'
            Parallel Seq Scan, Rows Removed by Filter: 102500  ->  12,506 ms

          WHERE email LIKE '%137456@contoh.id'
            Parallel Seq Scan  ->  13,929 ms

          WHERE lower(email) = 'pengguna137456@contoh.id'
            Parallel Seq Scan  ->  33,832 ms
        `,
        {
          caption:
            'Dijalankan sungguhan. Index-nya ada di ketiga kasus terakhir dan tidak satu pun memakainya.',
        },
      ),
      p(
        'Baris kedua adalah yang paling mengejutkan, sebab `LIKE` berawalan biasanya dikatakan bisa memakai index. Itu benar hanya bila urutan index-nya cocok dengan cara `LIKE` membandingkan, dan pada collation selain `C` keduanya tidak cocok. Perbaikannya adalah index dengan kelas operator khusus.',
      ),
      code(
        'text',
        `
        CREATE INDEX idx_pelanggan_email_pola ON pelanggan(email text_pattern_ops);

          WHERE email LIKE 'pengguna137456%'
            Index Only Scan using idx_pelanggan_email_pola
            Index Cond: ((email ~>=~ 'pengguna137456') AND (email ~<~ 'pengguna137457'))
            ->  0,119 ms          (dari 12,506 ms)

        CREATE INDEX idx_pelanggan_email_lower ON pelanggan(lower(email));

          WHERE lower(email) = 'pengguna137456@contoh.id'
            Index Scan using idx_pelanggan_email_lower
            ->  0,077 ms          (dari 33,832 ms)
        `,
        {
          caption:
            'Dijalankan sungguhan. Baris Index Cond memperlihatkan LIKE diubah menjadi pencarian rentang.',
        },
      ),
      p(
        'Baris `Index Cond` itu menjelaskan mekanismenya dengan jelas. `LIKE \'pengguna137456%\'` diterjemahkan menjadi "semua nilai antara `pengguna137456` dan `pengguna137457`", dan pencarian rentang memang tepat yang bisa dilakukan index terurut. Pola yang diawali tanda persen tidak bisa diubah menjadi rentang apa pun, dan karena itu tidak ada index biasa yang bisa menolongnya.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di bagian ini hampir semuanya berupa query yang berjalan benar pada data kecil dan berubah sifat pada data besar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `SELECT *` di kode aplikasi',
            'Praktis, tidak perlu menyebut kolom',
            'Menarik kolom yang tidak dipakai, membatalkan Index Only Scan, dan ikut berubah saat skema berubah',
          ],
          [
            'Paginasi dengan `OFFSET` untuk menelusuri seluruh tabel',
            'Itu cara paginasi yang biasa',
            'Diukur, `OFFSET 250000` membaca 250.020 baris untuk memberi 20. Pakai keyset',
          ],
          [
            'Mengurutkan hanya dengan kolom yang bisa seri',
            'Urutannya kan sudah benar',
            'Diuji sungguhan, satu baris tidak pernah muncul di halaman mana pun. Akhiri dengan kolom unik',
          ],
          [
            "Mencari dengan `LIKE '%kata%'`",
            'Paling fleksibel bagi pengguna',
            'Diukur, tidak ada index yang bisa dipakai. Untuk pencarian teks, pakai full-text search atau trigram',
          ],
          [
            'Membungkus kolom dengan fungsi di `WHERE`',
            'Supaya perbandingannya tidak peka huruf',
            'Diukur, index-nya jadi tidak terpakai dan waktunya 33,832 ms. Buat index berbasis ekspresi',
          ],
          [
            'Menyimpulkan query cepat karena cepat di komputer sendiri',
            'Sudah diuji',
            'Data pengembangan biasanya ratusan baris. Uji dengan jumlah baris yang mendekati produksi',
          ],
        ],
      ),
      p(
        'Baris terakhir menjelaskan mengapa hampir semua masalah di sub-bab ini baru ditemukan di produksi. Pada seribu baris, pemindaian penuh selesai dalam waktu yang tidak terasa, jadi tidak ada satu pun gejala. Cara termurah menghindarinya adalah mengisi basis data pengembangan dengan jumlah baris yang mendekati produksi, dan `generate_series` di PostgreSQL membuat itu satu query saja, tepat seperti yang dipakai untuk seluruh pengukuran di bab ini.',
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
    15,
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
      h2('Studi kasus di project nyata'),
      p(
        'Ada satu kesalahan SQL yang biayanya jauh melampaui semua kesalahan lain di bab ini, dan bentuknya cuma satu klausa yang lupa ditulis. Berikut ukurannya pada tabel produk berisi 5.000 baris.',
      ),
      code(
        'text',
        `
        BEGIN;
        UPDATE produk SET harga = 9999;
          UPDATE 5000            <- SELURUH tabel

        UPDATE produk SET harga = 9999 WHERE sku = 'SKU-000042';
          UPDATE 1               <- satu baris, seperti yang dimaksud
        ROLLBACK;
        `,
        {
          caption:
            'Dijalankan sungguhan pada PostgreSQL 16.15 di dalam transaksi, lalu dibatalkan.',
        },
      ),
      p(
        'Angka `UPDATE 5000` itu dicetak PostgreSQL setelah perintahnya selesai, dan di situlah letak masalahnya. Keterangan bahwa lima ribu baris berubah baru tiba **sesudah** perubahannya terjadi. Di luar transaksi, tidak ada jalan kembali.',
      ),
      p(
        'Karena itu ada dua kebiasaan yang layak dipakai selamanya, dan keduanya tidak memperlambat pekerjaan sama sekali.',
      ),
      code(
        'sql',
        `
        -- Kebiasaan 1: tulis SELECT-nya lebih dulu dengan WHERE yang sama persis.
        SELECT count(*) FROM produk WHERE sku = 'SKU-000042';
          count = 1            -- angka ini yang akan jadi jumlah baris yang berubah

        -- Kebiasaan 2: kerjakan di dalam transaksi sampai angkanya terbukti benar.
        BEGIN;
          UPDATE produk SET harga = 95000 WHERE sku = 'SKU-000042';
          -- baca jumlah barisnya. Kalau tidak sesuai, ROLLBACK.
        COMMIT;
        `,
        {
          caption:
            'Dua kebiasaan ini yang memisahkan perubahan data yang bisa dibatalkan dari yang tidak.',
        },
      ),
      p(
        'Ada cara ketiga yang lebih baik lagi karena ia menyatukan pemeriksaan dan perubahan dalam satu perintah, yaitu `RETURNING`. Alih-alih menebak apa yang berubah, PostgreSQL mengembalikan baris hasilnya.',
      ),
      code(
        'text',
        `
        UPDATE produk SET stok = stok - 5
        WHERE sku = 'SKU-000042' AND stok >= 5
        RETURNING id, sku, stok;

          id |    sku     | stok
          ---+------------+------
          42 | SKU-000042 |   95
          (1 row)
        `,
        {
          caption:
            'Dijalankan sungguhan. Bila tidak ada baris yang kembali, syaratnya tidak terpenuhi.',
        },
      ),
      p(
        'Bentuk itu menyelesaikan tiga persoalan sekaligus. Pengurangan stoknya **atomik** karena memakai `stok = stok - 5` alih-alih nilai yang dihitung aplikasi, jadi tidak ada lost update seperti yang diukur di sub-bab pertama. Syarat `stok >= 5` mencegah stok minus tanpa perlu membacanya lebih dulu. Dan `RETURNING` memberi tahu apakah pengurangannya benar-benar terjadi, sebab nol baris yang kembali berarti stoknya tidak cukup.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Menyimpan data yang mungkin sudah ada adalah kebutuhan yang muncul di hampir setiap project, dan cara menanganinya menentukan apakah aplikasinya tahan terhadap dua permintaan bersamaan.',
      ),
      code(
        'text',
        `
        Pola yang terlihat aman dan sebenarnya tidak:

          SELECT id FROM pelanggan WHERE email = $1;    -- tidak ada
          INSERT INTO pelanggan (email, nama) VALUES ($1, $2);

        Dua permintaan bersamaan bisa sama-sama lolos SELECT, lalu yang kedua
        menabrak batasan UNIQUE:

          ERROR:  duplicate key value violates unique constraint "pelanggan_email_key"
          DETAIL:  Key (email)=(pengguna1@contoh.id) already exists.
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Celahnya ada di antara `SELECT` dan `INSERT`, dan celah itu tidak bisa ditutup dengan kode yang lebih hati-hati karena ia melekat pada adanya dua perintah terpisah. Yang menutupnya adalah satu perintah yang memutuskan sendiri.',
      ),
      code(
        'text',
        `
        INSERT INTO produk (sku, nama, harga, stok)
        VALUES ('SKU-000042', 'Nama Baru', 55000, 7)
        ON CONFLICT (sku) DO UPDATE
          SET nama = EXCLUDED.nama, harga = EXCLUDED.harga
        RETURNING id, sku, nama, harga;

          id |    sku     |   nama    | harga
          ---+------------+-----------+-------
          42 | SKU-000042 | Nama Baru | 55000
          (1 row)
        `,
        {
          caption:
            'Dijalankan sungguhan. Baris SKU-000042 sudah ada, jadi cabang DO UPDATE yang berjalan.',
        },
      ),
      p(
        'Kata `EXCLUDED` di situ menunjuk baris yang **gagal masuk**, yaitu nilai yang barusan kamu kirim. Jadi `SET nama = EXCLUDED.nama` berarti "pakai nama yang baru saja saya kirim". Perhatikan juga bahwa `stok` sengaja tidak ikut diperbarui, sebab stok yang sudah tercatat tidak boleh ditimpa oleh nilai dari sebuah operasi impor.',
      ),
      p(
        'Ada varian kedua yang lebih sering dibutuhkan daripada yang disangka, yaitu ketika baris yang sudah ada cukup dibiarkan.',
      ),
      code(
        'sql',
        `
        -- Diamkan bila sudah ada. Tidak error, dan tidak mengubah apa pun.
        INSERT INTO tag (nama) VALUES ('database')
        ON CONFLICT (nama) DO NOTHING
        RETURNING id;

        -- Perhatikan: DO NOTHING membuat RETURNING mengembalikan NOL baris
        -- ketika barisnya sudah ada. Jadi jangan mengandalkannya untuk
        -- mendapatkan id. Untuk itu, pakai DO UPDATE walaupun isinya sepele:
        INSERT INTO tag (nama) VALUES ('database')
        ON CONFLICT (nama) DO UPDATE SET nama = EXCLUDED.nama
        RETURNING id;
        `,
        {
          caption:
            'Jebakan RETURNING pada DO NOTHING ini sering baru ketahuan saat kodenya menerima undefined.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Perintah yang mengubah data punya sifat yang membedakannya dari `SELECT`, yaitu kesalahannya meninggalkan jejak permanen.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menjalankan `UPDATE` langsung di basis data produksi',
            'Cuma satu baris yang diubah',
            'Diukur, `WHERE` yang lupa ditulis mengubah 5000 baris. Jalankan `SELECT` dengan `WHERE` yang sama dulu',
          ],
          [
            'Membaca nilai, menghitung, lalu menulis kembali',
            'Lebih mudah diuji',
            'Dua permintaan bersamaan saling menimpa. Pakai `SET kolom = kolom - n` yang atomik',
          ],
          [
            'Memeriksa keberadaan dengan `SELECT` sebelum `INSERT`',
            'Sudah dipastikan belum ada',
            'Diuji sungguhan, ada celah di antara keduanya. Pakai `ON CONFLICT`',
          ],
          [
            'Mengandalkan `RETURNING` pada `DO NOTHING`',
            'Sama-sama `ON CONFLICT`',
            '`DO NOTHING` mengembalikan nol baris ketika datanya sudah ada, dan kodenya menerima nilai kosong',
          ],
          [
            'Menghapus data penting dengan `DELETE`',
            'Memang diminta dihapus',
            'Riwayat, laporan, dan audit ikut hilang. Untuk data bernilai, pakai penandaan terhapus',
          ],
          [
            'Menjalankan `UPDATE` massal tanpa batas jumlah',
            'Sekalian semuanya',
            'Satu transaksi besar mengunci banyak baris dan menahan sesi lain. Kerjakan bertahap dalam potongan',
          ],
        ],
      ),
      p(
        'Baris terakhir baru terasa ketika datanya sudah besar, dan akibatnya bisa menghentikan seluruh aplikasi. Sebuah `UPDATE` yang menyentuh sejuta baris menahan kuncinya sampai transaksinya selesai, dan selama itu setiap permintaan lain yang menyentuh baris-baris tersebut ikut menunggu. Mengerjakannya dalam potongan sepuluh ribu baris memberi hasil akhir yang sama dengan kunci yang dilepas berkali-kali di antaranya.',
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
    19,
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
      h2('Studi kasus di project nyata'),
      p(
        'Halaman daftar pelanggan beserta jumlah pesanannya adalah kebutuhan yang muncul di hampir setiap panel admin, dan ia memuat dua jebakan `JOIN` yang paling sering menghasilkan angka salah tanpa satu pun error. Berikut datanya, yaitu 205.000 pelanggan dan 300.000 pesanan, dengan 5.000 pelanggan yang belum pernah memesan.',
      ),
      code(
        'text',
        `
        INNER JOIN  pelanggan x pesanan            -> 300.000 baris
        LEFT JOIN   pelanggan x pesanan            -> 305.000 baris
        LEFT JOIN + WHERE o.id IS NULL             ->   5.000 baris

        Selisih 5.000 itu tepat jumlah pelanggan yang belum punya pesanan.
        INNER JOIN membuang mereka; LEFT JOIN menyimpannya dengan kolom pesanan NULL.
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Sekarang jebakan pertamanya, dan ini yang paling sering lolos review karena query-nya terlihat benar.',
      ),
      code(
        'text',
        `
        Maksudnya: "semua pelanggan, beserta pesanan yang sudah dibayar kalau ada"

        SELECT ... FROM pelanggan p
        LEFT JOIN pesanan o ON o.pelanggan_id = p.id
        WHERE o.status = 'dibayar';
          -> 75.000 baris        <- sama persis dengan INNER JOIN

        SELECT ... FROM pelanggan p
        LEFT JOIN pesanan o ON o.pelanggan_id = p.id AND o.status = 'dibayar';
          -> 230.000 baris       <- pelanggan tanpa pesanan dibayar tetap ikut

        Sebagai pembanding:
        SELECT ... FROM pelanggan p JOIN pesanan o ON o.pelanggan_id = p.id
        WHERE o.status = 'dibayar';
          -> 75.000 baris
        `,
        { caption: 'Dijalankan sungguhan. Angka pertama dan ketiga identik, dan itu buktinya.' },
      ),
      p(
        "Penjelasannya terletak pada urutan pengerjaan. `LEFT JOIN` lebih dulu menghasilkan baris, termasuk baris yang kolom pesanannya seluruhnya `NULL` untuk pelanggan tanpa pesanan. Barulah `WHERE` menyaring hasil itu. Karena `NULL = 'dibayar'` tidak pernah bernilai benar, seluruh baris hasil `LEFT JOIN` yang tadi dipertahankan justru terbuang di tahap `WHERE`, dan yang tersisa persis sama dengan `INNER JOIN`. Aturannya satu kalimat, yaitu **syarat terhadap tabel kanan harus ditulis di `ON`, bukan di `WHERE`**.",
      ),
      p(
        'Jebakan kedua muncul saat menghitung, dan hasilnya adalah angka yang terlihat masuk akal sehingga tidak ada yang curiga.',
      ),
      code(
        'text',
        `
        SELECT p.nama, count(*) AS pakai_bintang, count(o.id) AS pakai_kolom
        FROM pelanggan p LEFT JOIN pesanan o ON o.pelanggan_id = p.id
        GROUP BY p.id, p.nama;

              nama      | pakai_bintang | pakai_kolom
          --------------+---------------+-------------
           Belum Pesan 1|             1 |           0     <- belum pernah memesan
           Pengguna 1   |             1 |           1
        `,
        {
          caption:
            'Dijalankan sungguhan. count(*) melaporkan 1 pesanan untuk pelanggan yang punya nol.',
        },
      ),
      p(
        '`count(*)` menghitung **baris**, dan baris hasil `LEFT JOIN` untuk pelanggan tanpa pesanan tetap ada meski seluruh kolom pesanannya `NULL`. `count(o.id)` menghitung **nilai yang tidak NULL**, jadi ia menjawab pertanyaan yang sebenarnya. Kesalahan ini menghasilkan laporan yang menyatakan setiap pelanggan punya minimal satu pesanan, dan angka itu cukup masuk akal untuk tidak dipertanyakan siapa pun.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan `JOIN` yang ketiga tidak terjadi di SQL melainkan di kode aplikasi, dan namanya **masalah N+1**. Bentuknya, satu query mengambil daftar, lalu untuk setiap baris dijalankan satu query lagi.',
      ),
      code(
        'ts',
        `
        // Bentuk yang hampir selalu ditulis lebih dulu, dan terlihat wajar.
        const daftar = await db.query('SELECT id FROM pesanan ORDER BY id LIMIT 1000');

        for (const pesanan of daftar) {
          // Satu query PER BARIS. Untuk 1000 baris, 1000 perjalanan ke database.
          pesanan.item = await db.query(
            'SELECT count(*) FROM item_pesanan WHERE pesanan_id = $1',
            [pesanan.id],
          );
        }
        `,
        {
          caption:
            'ORM sering menghasilkan bentuk ini tanpa terlihat, lewat pembacaan relasi yang malas.',
        },
      ),
      code(
        'text',
        `
        Diukur pada PostgreSQL 16.15, koneksi lokal:

          biaya dasar menjalankan psql + 1 query sepele : 23 ms
          1.000 query terpisah                          : 76 ms   -> 53 ms untuk query-nya
          1 query dengan JOIN untuk 1.000 pesanan       : 26 ms   ->  3 ms untuk query-nya

        Jadi sekitar 0,053 ms per perjalanan bolak-balik DI LOKAL.
        `,
        {
          caption:
            'Dijalankan sungguhan. Angka ini sengaja disebut lokal, sebab di situlah letak jebakannya.',
        },
      ),
      p(
        'Selisih 53 milidetik melawan 3 milidetik terdengar kecil, dan justru itu yang membuat N+1 lolos dari pengujian. Yang menentukan bukan angkanya melainkan **apa yang dikalikan**. Pada koneksi lokal, satu perjalanan bolak-balik berbiaya 0,053 milidetik. Pada database yang berada di zona ketersediaan lain, biayanya biasanya 1 sampai 2 milidetik, dan seribu perjalanan berubah menjadi satu sampai dua **detik** untuk satu permintaan pengguna. Kode yang sama, mesin yang berbeda, dan selisih seribu kali.',
      ),
      p(
        'Cara mengenalinya lebih awal bukan dengan membaca kode melainkan dengan menghitung query per permintaan. Sebagian besar ORM punya cara mencatat setiap query yang dijalankan, dan satu permintaan yang menghasilkan lebih dari beberapa puluh query hampir selalu berbentuk N+1.',
      ),
      code(
        'sql',
        `
        -- Bentuk yang benar: satu query, dikelompokkan di database.
        SELECT p.id, count(i.produk_id) AS jumlah_item
        FROM pesanan p
        LEFT JOIN item_pesanan i ON i.pesanan_id = p.id
        WHERE p.id <= 1000
        GROUP BY p.id;

        -- Bila memang perlu dua query karena datanya berbeda bentuk,
        -- ambil semuanya sekaligus, bukan satu per satu:
        SELECT * FROM item_pesanan WHERE pesanan_id = ANY($1);   -- $1 = array of id
        `,
        {
          caption:
            'Pola kedua bernama batch loading, dan itu yang dipakai dataloader di berbagai ORM.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        '`JOIN` adalah tempat angka salah paling mudah lahir, sebab hasilnya tetap berupa tabel yang terlihat rapi.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh syarat tabel kanan di `WHERE` pada `LEFT JOIN`',
            'Di situ tempat syarat ditulis',
            'Diukur, hasilnya 75.000 baris, sama persis dengan `INNER JOIN`. Taruh di `ON`',
          ],
          [
            'Memakai `count(*)` untuk menghitung baris tabel kanan',
            'Itu cara menghitung',
            'Diukur, pelanggan tanpa pesanan dilaporkan punya 1. Pakai `count(kolom)`',
          ],
          [
            'Mengambil relasi di dalam perulangan',
            'Kodenya paling mudah dibaca',
            'Diukur, 1.000 query melawan 1. Di lokal selisihnya kecil, di produksi bisa seribu kali',
          ],
          [
            'Menganggap jumlah baris hasil `JOIN` sama dengan jumlah baris tabel kiri',
            'Kan cuma menggabungkan',
            'Satu pelanggan dengan tiga pesanan menghasilkan tiga baris. Agregasi apa pun sesudahnya jadi berlipat',
          ],
          [
            'Menjumlahkan nilai setelah `JOIN` ke beberapa tabel',
            'Tinggal `sum`',
            'Baris berlipat membuat jumlahnya berlipat juga. Agregasikan per tabel dulu, baru gabungkan',
          ],
          [
            'Memakai `JOIN` tanpa index pada kolom penghubungnya',
            '`REFERENCES` sudah ada',
            '`REFERENCES` tidak membuat index. Setiap `JOIN` lewat kolom itu memindai tabel penuh',
          ],
        ],
      ),
      p(
        'Baris kelima adalah kesalahan yang paling sulit terlihat karena hasilnya berupa angka, bukan error, dan angkanya masih dalam kisaran yang masuk akal. Sebuah pesanan dengan tiga item yang di-`JOIN` ke tabel pembayaran dengan dua cicilan menghasilkan enam baris, dan `sum(item.harga)` di atasnya menghitung setiap harga dua kali. Cara amannya adalah menghitung tiap agregat di subquery terpisah, lalu menggabungkan hasilnya, sehingga tidak ada satu pun angka yang dihitung lebih dari sekali.',
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
    18,
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
      h2('Studi kasus di project nyata'),
      p(
        'Laporan penjualan per kota adalah permintaan yang datang ke hampir setiap pengembang backend, dan ia memaksa mengambil dua keputusan yang mudah salah, yaitu apa yang dihitung dan di mana penyaringannya diletakkan. Keduanya bisa dilihat langsung pada data 205.000 pelanggan berikut.',
      ),
      code(
        'text',
        `
        SELECT count(*) AS semua, count(kota) AS kota_terisi FROM pelanggan;

          semua  | kota_terisi
          -------+-------------
          205000 |      164000

        Selisih 41.000 adalah baris yang kota-nya NULL.
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Selisih itu menentukan jawaban mana yang benar, dan jawabannya bergantung pada pertanyaannya. Kalau yang ditanya "berapa pelanggan yang kita punya", `count(*)` yang benar. Kalau yang ditanya "berapa pelanggan yang kotanya sudah kita ketahui", `count(kota)` yang benar. Keduanya tidak pernah bisa saling menggantikan, dan tidak ada satu pun error yang muncul bila kamu memilih yang salah.',
      ),
      p(
        'Hal yang sama berlaku pada fungsi agregat lain, dan ini yang paling sering menghasilkan laporan yang salah tanpa disadari.',
      ),
      table(
        ['Fungsi', 'Perlakuan terhadap `NULL`', 'Akibatnya di laporan'],
        [
          ['`count(*)`', 'Menghitung baris, `NULL` ikut', 'Jumlah baris yang sebenarnya'],
          ['`count(kolom)`', 'Melewati `NULL`', 'Jumlah nilai yang terisi'],
          [
            '`sum(kolom)`',
            'Melewati `NULL`; hasilnya `NULL` bila semuanya `NULL`',
            'Angka kosong, bukan nol — pakai `coalesce`',
          ],
          [
            '`avg(kolom)`',
            'Melewati `NULL` di pembilang **dan** penyebut',
            'Rata-rata dari yang terisi saja, bukan dari seluruh baris',
          ],
          [
            '`max` dan `min`',
            'Melewati `NULL`',
            'Aman, tapi hasilnya `NULL` bila tak ada nilai sama sekali',
          ],
        ],
      ),
      p(
        'Baris `avg` layak diperhatikan karena selisihnya paling menyesatkan. Rata-rata nilai ujian dari seratus siswa yang dua puluh di antaranya belum menginput nilai adalah rata-rata dari delapan puluh siswa, bukan seratus. Kedua angka itu benar untuk pertanyaan yang berbeda, dan yang membedakannya hanya niat pembuat laporannya.',
      ),
      p(
        'Keputusan kedua adalah di mana penyaringan diletakkan, dan ini lebih mudah diingat begitu urutan pengerjaannya dipahami.',
      ),
      code(
        'sql',
        `
        SELECT kota, count(*) AS jumlah
        FROM pelanggan
        WHERE kota IS NOT NULL        -- 1. menyaring BARIS, sebelum dikelompokkan
        GROUP BY kota                 -- 2. mengelompokkan
        HAVING count(*) > 30000       -- 3. menyaring KELOMPOK, setelah dihitung
        ORDER BY jumlah DESC;         -- 4. mengurutkan hasil akhir

        -- Urutan yang sebenarnya dikerjakan database:
        --   FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT
        --
        -- Dari urutan itu dua hal langsung jelas:
        --   - WHERE tidak bisa memakai hasil agregat, sebab belum dihitung
        --   - ORDER BY bisa memakai alias dari SELECT, sebab SELECT sudah lewat
        `,
        { caption: 'Urutan inilah yang menjelaskan hampir semua error agregasi.' },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Berbeda dengan bagian lain di bab ini, agregasi justru banyak berteriak, dan itu menguntungkan. Dua error berikut dijalankan sungguhan dan keduanya adalah error yang akan kamu temui berkali-kali.',
      ),
      code(
        'text',
        `
        SELECT kota, nama, count(*) FROM pelanggan GROUP BY kota;

          ERROR:  column "pelanggan.nama" must appear in the GROUP BY clause
                  or be used in an aggregate function
          LINE 1: SELECT kota, nama, count(*) FROM pelanggan GROUP BY kota;
                               ^
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        "Pesan ini sering dianggap kerewelan database, padahal ia menghalangi pertanyaan yang memang tidak punya jawaban. Satu kelompok `kota = 'Bandung'` memuat puluhan ribu baris dengan nama berbeda-beda, jadi `nama` mana yang harus ditampilkan untuk kelompok itu? Tidak ada jawaban yang benar, dan PostgreSQL menolak menebak. Yang harus kamu putuskan adalah apakah `nama` ikut mengelompokkan, atau ia diringkas dengan agregat seperti `min(nama)` atau `string_agg(nama, ', ')`.",
      ),
      p(
        'Perlu disebut bahwa MySQL dengan pengaturan tertentu **menerima** query seperti itu dan memilih satu nama secara sembarang. Itu bukan keunggulan melainkan sumber laporan yang isinya berubah-ubah tanpa sebab yang bisa dijelaskan.',
      ),
      code(
        'text',
        `
        SELECT kota, count(*) FROM pelanggan WHERE count(*) > 10 GROUP BY kota;

          ERROR:  aggregate functions are not allowed in WHERE
          LINE 1: SELECT kota, count(*) FROM pelanggan WHERE count(*) > 10 GRO...
                                                            ^
        `,
        { caption: 'Dijalankan sungguhan.' },
      ),
      p(
        'Error ini langsung terjelaskan oleh urutan pengerjaan. `WHERE` berjalan sebelum `GROUP BY`, jadi pada saat `WHERE` dievaluasi belum ada satu pun kelompok, dan `count(*)` belum punya arti. Yang dibutuhkan adalah `HAVING`, yang berjalan sesudah pengelompokan.',
      ),
      p(
        'Kegagalan ketiga tidak menghasilkan error, dan ia gabungan dari agregasi dengan `LEFT JOIN` yang sudah diukur di sub-bab sebelumnya.',
      ),
      code(
        'text',
        `
        SELECT p.nama, count(*) AS pakai_bintang, count(o.id) AS pakai_kolom
        FROM pelanggan p LEFT JOIN pesanan o ON o.pelanggan_id = p.id
        GROUP BY p.id, p.nama;

              nama       | pakai_bintang | pakai_kolom
          ---------------+---------------+-------------
           Belum Pesan 1 |             1 |           0
           Pengguna 1    |             1 |           1
        `,
        {
          caption:
            'Dijalankan sungguhan. count(*) melaporkan angka yang salah untuk baris tanpa pasangan.',
        },
      ),
      p(
        'Selain itu, `sum` pada kelompok yang seluruh nilainya `NULL` menghasilkan `NULL`, bukan nol, dan itu merambat ke perhitungan berikutnya. Sebuah `sum(total) * 1.11` untuk pelanggan tanpa pesanan menghasilkan `NULL`, dan kalau angka itu ditampilkan apa adanya, pengguna melihat kolom kosong alih-alih nol. Pembungkus `coalesce(sum(total), 0)` menutupnya dalam satu langkah.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Agregasi adalah tempat laporan salah lahir, dan laporan salah punya sifat buruk yang khas, yaitu tetap dipercaya sampai ada yang menghitung ulang dengan tangan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `count(*)` untuk semua perhitungan',
            'Paling sering dicontohkan',
            'Diukur, selisihnya 41.000 baris pada kolom yang boleh `NULL`. Pilih sesuai pertanyaannya',
          ],
          [
            'Menaruh syarat agregat di `WHERE`',
            'Di situ tempat menyaring',
            'Diuji sungguhan, hasilnya error. `WHERE` berjalan sebelum pengelompokan; pakai `HAVING`',
          ],
          [
            'Menyaring baris dengan `HAVING`',
            'Sama-sama menyaring',
            'Menyaring sesudah pengelompokan berarti seluruh baris tetap dibaca dan dikelompokkan dulu. Lebih lambat tanpa alasan',
          ],
          [
            'Menampilkan `sum` tanpa `coalesce`',
            'Jumlahnya kan pasti angka',
            'Kelompok tanpa nilai menghasilkan `NULL`, dan `NULL` merambat ke setiap perhitungan sesudahnya',
          ],
          [
            'Mengira `avg` menghitung seluruh baris',
            'Namanya rata-rata',
            'Ia mengabaikan `NULL` di pembilang dan penyebut. Rata-rata dari 80 baris terisi, bukan dari 100 baris',
          ],
          [
            'Menjalankan agregasi berat langsung ke tabel utama',
            'Datanya kan di situ',
            'Laporan yang sama dihitung ulang setiap kali dibuka. Untuk laporan besar, simpan hasilnya berkala',
          ],
        ],
      ),
      p(
        'Baris ketiga layak diperjelas karena keduanya memang menyaring dan hasilnya bisa sama. Bedanya di biaya. `WHERE kota IS NOT NULL` membuang 41.000 baris **sebelum** pengelompokan, sehingga yang dikelompokkan hanya 164.000. `HAVING kota IS NOT NULL` mengelompokkan seluruh 205.000 baris lebih dulu, baru membuang kelompok `NULL`-nya. Hasilnya identik, pekerjaannya tidak. Aturannya mudah dipegang, yaitu **saring sedini mungkin**, dan `HAVING` hanya dipakai untuk hal yang memang belum ada sebelum pengelompokan.',
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
    18,
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
      h2('Studi kasus di project nyata'),
      p(
        'Normalisasi paling mudah dipahami bukan lewat definisi bentuk normal melainkan lewat melihat apa yang rusak tanpanya. Berikut satu tabel yang memuat segalanya sekaligus, persis seperti yang biasanya lahir ketika data dipindahkan dari spreadsheet.',
      ),
      code(
        'text',
        `
        id | pelanggan_email | pelanggan_nama | pelanggan_kota | produk_sku | produk_nama | produk_harga | jumlah
        ---+-----------------+----------------+----------------+------------+-------------+--------------+-------
         1 | rina@contoh.id  | Rina           | Bandung        | SKU-001    | Kaos Polos  |        89000 |      2
         2 | rina@contoh.id  | Rina           | Bandung        | SKU-002    | Topi Rajut  |        45000 |      1
         3 | rina@contoh.id  | Rina           | Bandung        | SKU-001    | Kaos Polos  |        89000 |      3
         4 | budi@contoh.id  | Budi           | Medan          | SKU-001    | Kaos Polos  |        89000 |      1
        `,
        {
          caption:
            'Tabel ini benar-benar dibuat di PostgreSQL 16.15 untuk menguji ketiga anomali di bawah.',
        },
      ),
      p(
        'Perhatikan bahwa nama dan kota Rina tertulis tiga kali, dan harga Kaos Polos tertulis tiga kali juga. Pengulangan itu bukan sekadar boros ruang, melainkan sumber dari tiga bentuk kerusakan yang punya nama sendiri.',
      ),
      code(
        'text',
        `
        ANOMALI PEMBARUAN
          Rina pindah ke Surabaya. UPDATE dijalankan, tapi satu baris terlewat.

          SELECT DISTINCT pelanggan_email, pelanggan_kota
          FROM pesanan_datar WHERE pelanggan_email = 'rina@contoh.id';

            pelanggan_email | pelanggan_kota
            ----------------+----------------
            rina@contoh.id  | Bandung
            rina@contoh.id  | Surabaya

          Satu orang kini punya DUA kota, dan tidak ada satu pun error.

        ANOMALI PENGHAPUSAN
          Budi membatalkan satu-satunya pesanannya.

          DELETE FROM pesanan_datar WHERE pelanggan_email = 'budi@contoh.id';
          SELECT count(*) ... -> 0

          Seluruh keterangan tentang Budi ikut hilang, padahal Budi masih pelanggan.

        ANOMALI PENYISIPAN
          Produk baru yang belum pernah dipesan tidak punya tempat disimpan,
          sebab satu-satunya tabel yang ada bernama pesanan.
        `,
        { caption: 'Ketiganya dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Ketiga anomali itu punya satu akar yang sama, yaitu **satu fakta disimpan di lebih dari satu tempat**. Kota Rina adalah fakta tentang Rina, bukan fakta tentang pesanan, jadi menyimpannya di baris pesanan berarti menyimpannya berulang kali. Begitu sebuah fakta punya banyak salinan, tidak ada mekanisme apa pun yang menjamin salinan-salinan itu tetap sama.',
      ),
      p(
        'Karena itu normalisasi sebenarnya bisa diringkas jadi satu pertanyaan yang diajukan pada setiap kolom, yaitu **fakta ini tentang apa**. Kolom yang faktanya tentang pelanggan pindah ke tabel pelanggan, kolom yang faktanya tentang produk pindah ke tabel produk, dan yang tersisa di tabel pesanan hanyalah fakta tentang pesanan itu sendiri.',
      ),
      code(
        'sql',
        `
        -- Hasilnya, dan perhatikan harga_satuan yang sengaja TIDAK menunjuk produk.
        CREATE TABLE pelanggan (
          id bigserial PRIMARY KEY, email text NOT NULL UNIQUE,
          nama text NOT NULL, kota text);

        CREATE TABLE produk (
          id bigserial PRIMARY KEY, sku text NOT NULL UNIQUE,
          nama text NOT NULL, harga integer NOT NULL CHECK (harga > 0));

        CREATE TABLE pesanan (
          id bigserial PRIMARY KEY,
          pelanggan_id bigint NOT NULL REFERENCES pelanggan(id),
          dibuat_pada timestamptz NOT NULL DEFAULT now());

        CREATE TABLE item_pesanan (
          pesanan_id bigint NOT NULL REFERENCES pesanan(id) ON DELETE CASCADE,
          produk_id  bigint NOT NULL REFERENCES produk(id),
          jumlah integer NOT NULL CHECK (jumlah > 0),
          harga_satuan integer NOT NULL,   -- <-- SALINAN yang disengaja
          PRIMARY KEY (pesanan_id, produk_id));
        `,
        {
          caption:
            'Kolom harga_satuan melanggar normalisasi dengan sengaja, dan alasannya menentukan.',
        },
      ),
      p(
        'Kolom `harga_satuan` itu terlihat seperti pengulangan yang baru saja kita hapus, dan ia memang pengulangan. Bedanya, ia **bukan salinan dari fakta yang sama**. Harga di tabel produk adalah harga hari ini, sedangkan `harga_satuan` adalah harga pada saat pesanan itu dibuat. Tanpa kolom itu, menaikkan harga produk akan mengubah nilai seluruh pesanan lama, dan laporan penjualan bulan lalu berubah setiap kali ada perubahan harga.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Skema yang sudah dinormalisasi memunculkan error yang **tidak mungkin ada** pada tabel datar, dan itu justru gunanya. Error di bawah adalah penolakan terhadap data yang pada tabel datar akan masuk tanpa keluhan.',
      ),
      code(
        'text',
        `
        Pada tabel datar, mengetik kota yang salah tidak menghasilkan apa-apa:

          INSERT INTO pesanan_datar (..., pelanggan_kota, ...) VALUES (..., 'Bandunng', ...);
          -> berhasil. Rina kini punya kota ketiga.

        Pada skema ternormalisasi, kesalahan yang setara ditolak:

          INSERT INTO pesanan (pelanggan_id) VALUES (999999999);

          ERROR:  insert or update on table "pesanan" violates foreign key
                  constraint "pesanan_pelanggan_id_fkey"
          DETAIL:  Key (pelanggan_id)=(999999999) is not present in table "pelanggan".
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Jadi normalisasi bukan hanya soal menghemat ruang. Ia memindahkan sekelompok kesalahan dari kategori "data kotor yang baru ketahuan berbulan-bulan kemudian" ke kategori "error yang muncul saat itu juga". Tabel datar tidak punya cara memeriksa bahwa `Bandunng` bukan kota yang sah, sebab tidak ada daftar kota yang bisa dijadikan acuan.',
      ),
      p(
        'Sisi sebaliknya juga harus disebut jujur, yaitu normalisasi menambah `JOIN`. Untuk menampilkan satu baris laporan yang dulunya ada di satu tabel, sekarang dibutuhkan tiga sampai empat tabel. Pada kebanyakan aplikasi, biaya itu tidak terasa selama kolom penghubungnya ber-index. Pada laporan analitik yang menggabungkan puluhan juta baris, biayanya nyata, dan di situlah denormalisasi yang disengaja punya tempat.',
      ),
      table(
        ['Bentuk denormalisasi', 'Kapan dibenarkan', 'Yang harus disiapkan'],
        [
          [
            'Menyalin harga saat transaksi',
            'Hampir selalu — nilainya memang berbeda dari harga sekarang',
            'Tidak ada. Ini bukan duplikasi fakta yang sama',
          ],
          [
            'Menyimpan `jumlah_komentar` di tabel artikel',
            'Ketika perhitungannya sering dan mahal',
            'Mekanisme yang menjaganya tetap benar, misalnya trigger, plus pemeriksaan berkala',
          ],
          [
            'Tabel ringkasan untuk laporan',
            'Laporan berat yang tidak perlu waktu nyata',
            'Jadwal pembaruan dan kejelasan bahwa datanya tertinggal beberapa saat',
          ],
          [
            'Menyalin nama pelanggan ke tabel pesanan',
            'Jarang dibenarkan',
            'Hampir selalu berakhir jadi anomali pembaruan yang sudah diukur di atas',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Normalisasi punya dua arah kesalahan yang sama seringnya, yaitu terlalu sedikit dan terlalu banyak.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memindahkan spreadsheet apa adanya jadi satu tabel',
            'Bentuknya sudah mirip',
            'Diuji sungguhan, ketiga anomali langsung muncul dan tidak satu pun menghasilkan error',
          ],
          [
            'Menyalin nama pelanggan ke tabel pesanan supaya tak perlu `JOIN`',
            'Lebih cepat dibaca',
            'Diuji sungguhan, satu pembaruan yang terlewat membuat satu orang punya dua kota',
          ],
          [
            'Menormalisasi sampai bentuk paling ekstrem',
            'Makin normal makin benar',
            'Menampilkan satu halaman jadi butuh tujuh `JOIN`. Berhenti di 3NF kecuali ada alasan jelas',
          ],
          [
            'Tidak menyimpan harga saat transaksi',
            'Harganya kan ada di tabel produk',
            'Menaikkan harga mengubah nilai seluruh pesanan lama, dan laporan bulan lalu ikut berubah',
          ],
          [
            'Menyimpan beberapa nilai dalam satu kolom dipisah koma',
            'Praktis, satu kolom saja',
            'Tidak bisa di-`JOIN`, tidak bisa di-index, dan tidak ada yang menjaga isinya. Pakai tabel terpisah',
          ],
          [
            'Menyimpan angka hasil hitungan tanpa penjaga',
            'Supaya laporan cepat',
            'Angkanya menyimpang pelan-pelan dari kenyataan. Denormalisasi butuh mekanisme yang menjaganya',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah syarat yang membuat denormalisasi boleh dipakai. Setiap angka yang disalin harus punya jawaban atas satu pertanyaan, yaitu **apa yang menjaganya tetap benar**. Kalau jawabannya "kode aplikasi akan mengingatnya", itu bukan jawaban, sebab akan selalu ada satu jalur kode yang lupa. Jawaban yang sah adalah trigger di database, tugas berkala yang menghitung ulang, atau keduanya, ditambah kesadaran bahwa angka itu bisa menyimpang dan perlu diperiksa sesekali.',
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
    18,
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
      h2('Studi kasus di project nyata'),
      p(
        'Relasi banyak-ke-banyak selalu dicontohkan dengan artikel dan tag, dan contoh itu bagus justru karena ia langsung memunculkan pertanyaan yang menentukan, yaitu **apakah tabel penghubungnya membawa data sendiri**. Jawabannya mengubah bentuk tabelnya.',
      ),
      code(
        'sql',
        `
        CREATE TABLE artikel (id serial PRIMARY KEY, judul text NOT NULL);
        CREATE TABLE tag     (id serial PRIMARY KEY, nama text NOT NULL UNIQUE);

        CREATE TABLE artikel_tag (
          artikel_id int NOT NULL REFERENCES artikel(id) ON DELETE CASCADE,
          tag_id     int NOT NULL REFERENCES tag(id)     ON DELETE CASCADE,

          -- Dua kolom berikut yang membuatnya lebih dari sekadar penghubung.
          ditambah_oleh text NOT NULL,
          ditambah_pada timestamptz NOT NULL DEFAULT now(),

          PRIMARY KEY (artikel_id, tag_id)   -- <-- ini yang menjaga tidak ada pasangan ganda
        );
        `,
        { caption: 'Skema ini benar-benar dibuat di PostgreSQL 16.15 untuk pengujian di bawah.' },
      ),
      p(
        'Baris `PRIMARY KEY (artikel_id, tag_id)` adalah bagian yang paling sering dilupakan, dan tanpanya tabel penghubung menerima pasangan yang sama berulang kali. Akibatnya bukan error melainkan tag yang muncul dua kali di halaman artikel, dan hitungan yang berlipat pada laporan.',
      ),
      code(
        'text',
        `
        INSERT INTO artikel_tag (artikel_id, tag_id, ditambah_oleh) VALUES (1, 1, 'budi');

          ERROR:  duplicate key value violates unique constraint "artikel_tag_pkey"
          DETAIL:  Key (artikel_id, tag_id)=(1, 1) already exists.
        `,
        { caption: 'Dijalankan sungguhan. Pasangan (1,1) sudah ditambahkan rina sebelumnya.' },
      ),
      p(
        'Perhatikan bahwa yang ditolak adalah **pasangannya**, bukan nilai kolomnya masing-masing. Artikel 1 tetap boleh punya banyak tag, dan tag 1 tetap boleh menempel di banyak artikel. Yang tidak boleh hanyalah pasangan yang sama muncul dua kali, dan itu tepat arti primary key gabungan.',
      ),
      p(
        'Membacanya kembali memerlukan dua `JOIN`, dan bentuk berikut adalah yang paling sering dipakai karena ia mengembalikan satu baris per artikel.',
      ),
      code(
        'text',
        `
        SELECT a.judul, string_agg(t.nama, ', ' ORDER BY t.nama) AS tag
        FROM artikel a
        JOIN artikel_tag at ON at.artikel_id = a.id
        JOIN tag t          ON t.id = at.tag_id
        GROUP BY a.id, a.judul
        ORDER BY a.id;

              judul     |       tag
          --------------+------------------
           Belajar SQL  | database, pemula
           Belajar HTTP | pemula, web
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Bagian `ORDER BY t.nama` di dalam `string_agg` itu bukan hiasan. Tanpanya, urutan tag di dalam satu baris tidak dijamin, dan halaman yang sama bisa menampilkan urutan berbeda pada pemuatan berikutnya. Ini bentuk lain dari masalah urutan tidak stabil yang sudah diukur pada sub-bab paginasi.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Relasi ke diri sendiri, misalnya komentar yang bisa dibalas, adalah bentuk yang paling sering membuat pemula bingung sebab tabelnya menunjuk dirinya sendiri. Bentuknya sebenarnya sederhana.',
      ),
      code(
        'sql',
        `
        CREATE TABLE komentar (
          id       serial PRIMARY KEY,
          induk_id int REFERENCES komentar(id) ON DELETE CASCADE,  -- boleh NULL
          isi      text NOT NULL
        );

        -- induk_id NULL berarti komentar tingkat atas.
        -- ON DELETE CASCADE berarti menghapus induk ikut menghapus seluruh balasannya,
        -- dan itu MENJALAR ke balasan atas balasan.
        `,
      ),
      code(
        'text',
        `
        Membaca seluruh pohon dengan satu query rekursif:

        WITH RECURSIVE pohon AS (
          SELECT id, induk_id, isi, 0 AS kedalaman
          FROM komentar WHERE induk_id IS NULL
        UNION ALL
          SELECT k.id, k.induk_id, k.isi, p.kedalaman + 1
          FROM komentar k JOIN pohon p ON k.induk_id = p.id
        )
        SELECT repeat('  ', kedalaman) || isi FROM pohon ORDER BY id;

           Komentar utama
             Balasan pertama
               Balasan atas balasan
           Komentar utama kedua
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Query rekursif ini menggantikan pola N+1 yang biasanya ditulis pertama kali, yaitu mengambil komentar tingkat atas lalu memanggil database lagi untuk setiap tingkat balasannya. Untuk pohon sedalam lima tingkat dengan seratus komentar, pola itu menghasilkan ratusan query, sedangkan bentuk di atas satu.',
      ),
      p('Dua bahaya melekat pada relasi ke diri sendiri, dan keduanya harus ditangani sadar.'),
      code(
        'text',
        `
        BAHAYA 1 — penghapusan yang menjalar tanpa terlihat

          DELETE FROM komentar WHERE id = 1;

          Satu perintah itu menghapus 'Balasan pertama' DAN 'Balasan atas balasan',
          sebab CASCADE menjalar mengikuti pohonnya. Tidak ada konfirmasi apa pun,
          dan jumlah baris yang dilaporkan hanya menghitung yang disebut langsung.

        BAHAYA 2 — lingkaran

          UPDATE komentar SET induk_id = 3 WHERE id = 1;

          Komentar 1 jadi anak dari komentar 3, yang merupakan cucunya sendiri.
          Foreign key TIDAK mencegah ini, sebab setiap barisnya tetap menunjuk
          baris yang ada. Query rekursif di atas akan berputar tanpa henti.
        `,
      ),
      p(
        'Bahaya kedua layak ditegaskan karena foreign key sering dianggap menutup segalanya. Ia hanya menjamin bahwa yang ditunjuk **ada**, bukan bahwa susunannya masuk akal. Pencegahannya ada di aplikasi, atau di klausa `CYCLE` pada query rekursif PostgreSQL yang menghentikan penelusuran begitu sebuah baris dikunjungi dua kali.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Merancang relasi adalah keputusan yang paling mahal diubah, sebab mengubahnya berarti memindahkan data yang sudah ada beserta setiap kode yang membacanya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan banyak nilai dalam satu kolom dipisah koma',
            'Menghindari tabel ketiga',
            'Tidak bisa di-`JOIN`, tidak bisa di-index, dan tidak ada yang menjaga isinya tetap sah',
          ],
          [
            'Lupa primary key gabungan di tabel penghubung',
            'Kedua kolomnya sudah `REFERENCES`',
            'Diuji sungguhan, tanpa itu pasangan yang sama bisa masuk berkali-kali dan hitungan jadi berlipat',
          ],
          [
            'Memakai `ON DELETE CASCADE` pada relasi ke diri sendiri tanpa berpikir',
            'Balasan memang ikut terhapus',
            'Penghapusannya menjalar ke seluruh kedalaman pohon tanpa konfirmasi dan tanpa jumlah yang dilaporkan',
          ],
          [
            'Membaca pohon komentar dengan perulangan per tingkat',
            'Paling mudah dibayangkan',
            'Menghasilkan pola N+1 bertingkat. Satu `WITH RECURSIVE` menggantikan seluruhnya',
          ],
          [
            'Mengandalkan foreign key untuk mencegah lingkaran',
            'Kan sudah ada batasannya',
            'Foreign key hanya memastikan yang ditunjuk ada. Susunan melingkar tetap lolos',
          ],
          [
            'Membuat tabel terpisah untuk relasi satu-ke-satu tanpa alasan',
            'Lebih rapi',
            'Menambah `JOIN` pada setiap pembacaan. Pisahkan hanya bila kolomnya jarang dipakai atau bersifat sensitif',
          ],
        ],
      ),
      p(
        'Baris terakhir punya batas yang layak diperjelas karena relasi satu-ke-satu memang kadang benar. Memisahkan kolom yang jarang dibaca, misalnya isi dokumen yang besar, membuat pembacaan tabel utamanya lebih ringan. Memisahkan kolom yang aksesnya perlu dibatasi, misalnya nomor identitas, memungkinkan izin database diberikan terpisah. Di luar dua alasan itu, dua tabel yang selalu dibaca bersamaan lebih baik menjadi satu.',
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
    20,
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
      h2('Studi kasus di project nyata'),
      p(
        'Transaksi paling mudah dipahami lewat satu pengukuran yang menunjukkan keadaan setengah jadi yang **tidak pernah terlihat siapa pun**. Berikut pengurangan stok yang dibatalkan di tengah jalan.',
      ),
      code(
        'text',
        `
        SELECT stok FROM produk WHERE sku = 'SKU-000042';
          stok = 100

        BEGIN;
          UPDATE produk SET stok = stok - 100 WHERE sku = 'SKU-000042';
          SELECT stok FROM produk WHERE sku = 'SKU-000042';
            stok = 0          <- terlihat DI DALAM transaksi ini saja
        ROLLBACK;

        SELECT stok FROM produk WHERE sku = 'SKU-000042';
          stok = 100          <- kembali utuh
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Angka nol di tengah itu nyata bagi transaksi yang sedang berjalan dan tidak pernah ada bagi siapa pun di luarnya. Sesi lain yang membaca stok pada saat itu tetap melihat 100. Inilah yang dimaksud **isolation**, dan ia satu-satunya alasan sebuah operasi berlangkah banyak bisa gagal di tengah tanpa meninggalkan data yang mustahil dijelaskan.',
      ),
      p(
        'Berikut bentuk nyatanya pada pembuatan pesanan, yang selalu punya tiga langkah yang harus berhasil bersama-sama.',
      ),
      code(
        'ts',
        `
        // Tiga langkah yang harus utuh atau tidak sama sekali.
        await db.transaction(async (tx) => {
          // 1. Kurangi stok secara ATOMIK, dan biarkan syaratnya yang menolak.
          const { rowCount } = await tx.query(
            \`UPDATE produk SET stok = stok - $2
             WHERE id = $1 AND stok >= $2\`,
            [produkId, jumlah],
          );
          // Nol baris berarti stoknya tidak cukup. Melempar di sini membatalkan semuanya.
          if (rowCount === 0) throw new StokKurang(produkId);

          // 2. Catat pesanannya.
          const pesanan = await tx.query(
            'INSERT INTO pesanan (pelanggan_id) VALUES ($1) RETURNING id',
            [pelangganId],
          );

          // 3. Catat itemnya, beserta SALINAN harga saat ini.
          await tx.query(
            \`INSERT INTO item_pesanan (pesanan_id, produk_id, jumlah, harga_satuan)
             SELECT $1, id, $3, harga FROM produk WHERE id = $2\`,
            [pesanan.rows[0].id, produkId, jumlah],
          );
        });

        // Yang TIDAK boleh ada di dalam blok ini:
        //   - panggilan ke layanan pembayaran
        //   - pengiriman email atau notifikasi
        //   - pemanggilan API pihak ketiga mana pun
        // Semuanya menahan kunci selama menunggu jaringan, dan jaringan bisa
        // menggantung jauh lebih lama daripada query mana pun.
        `,
        {
          caption:
            'Pengurangan stok dan pemeriksaannya digabung jadi satu perintah, jadi tidak ada celah di antaranya.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ada satu perilaku transaksi PostgreSQL yang membingungkan hampir semua orang saat pertama kali melihatnya, yaitu **satu error membatalkan seluruh transaksi**, termasuk perintah yang sudah berhasil sebelumnya.',
      ),
      code(
        'text',
        `
        BEGIN;
        INSERT INTO pelanggan (email, nama) VALUES ('sah1@contoh.id', 'Sah Satu');
          INSERT 0 1                                          <- berhasil

        INSERT INTO pelanggan (email, nama) VALUES ('pengguna1@contoh.id', 'Kembar');
          ERROR:  duplicate key value violates unique constraint "pelanggan_email_key"
          DETAIL:  Key (email)=(pengguna1@contoh.id) already exists.

        INSERT INTO pelanggan (email, nama) VALUES ('sah2@contoh.id', 'Sah Dua');
          ERROR:  current transaction is aborted, commands ignored
                  until end of transaction block

        SELECT count(*) FROM pelanggan;
          ERROR:  current transaction is aborted, commands ignored
                  until end of transaction block

        COMMIT;
          ROLLBACK                                            <- COMMIT berubah jadi ROLLBACK

        Yang benar-benar tersimpan sesudahnya: 0 baris.
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Tiga hal terjadi sekaligus di situ. Setelah error pertama, **setiap** perintah berikutnya ditolak dengan pesan yang sama, termasuk `SELECT` yang tidak mengubah apa pun. Lalu `COMMIT` yang dijalankan di akhir tidak menyimpan apa-apa melainkan dilaporkan sebagai `ROLLBACK`. Dan yang paling penting, baris `sah1@contoh.id` yang tadi berhasil ikut hilang.',
      ),
      p(
        'Perilaku ini benar dan memang yang diinginkan, sebab arti transaksi adalah semua atau tidak sama sekali. Yang perlu diketahui adalah bahwa error di tengah transaksi tidak bisa sekadar ditangkap lalu dilanjutkan. Untuk itu ada `SAVEPOINT`.',
      ),
      code(
        'text',
        `
        BEGIN;
        INSERT INTO pelanggan (email, nama) VALUES ('sp1@contoh.id', 'Titik Satu');
          INSERT 0 1

        SAVEPOINT sebelum_ragu;
        INSERT INTO pelanggan (email, nama) VALUES ('pengguna1@contoh.id', 'Kembar');
          ERROR:  duplicate key value violates unique constraint "pelanggan_email_key"

        ROLLBACK TO SAVEPOINT sebelum_ragu;    <- hanya membatalkan sampai titik itu
        INSERT INTO pelanggan (email, nama) VALUES ('sp2@contoh.id', 'Titik Dua');
          INSERT 0 1                            <- transaksinya hidup lagi
        COMMIT;

        Yang tersimpan: 2 baris.
        `,
        { caption: 'Dijalankan sungguhan. Bandingkan dengan 0 baris pada percobaan sebelumnya.' },
      ),
      p(
        'Kegagalan kedua adalah **deadlock**, yaitu dua transaksi yang saling menunggu kunci milik lawannya. PostgreSQL mendeteksinya lalu membunuh salah satu.',
      ),
      code(
        'text',
        `
        Sesi A: UPDATE saldo ... id = 1   lalu   id = 2
        Sesi B: UPDATE saldo ... id = 2   lalu   id = 1

        ERROR:  deadlock detected
        DETAIL:  Process 482844 waits for ShareLock on transaction 821;
                 blocked by process 482845.
                 Process 482845 waits for ShareLock on transaction 822;
                 blocked by process 482844.
        HINT:  See server log for query details.
        CONTEXT:  while updating tuple (0,2) in relation "saldo"
        `,
        { caption: 'Dijalankan sungguhan dengan dua sesi psql bersamaan.' },
      ),
      p(
        'Hanya satu dari dua sesi yang menerima error itu, dan yang lain berhasil sepenuhnya. Karena itu aplikasi yang menangani deadlock dengan benar tidak menampilkan kegagalan kepada pengguna melainkan **mencoba ulang** transaksinya. Percobaan ulang aman di sini justru karena transaksinya sudah dibatalkan seluruhnya, jadi tidak ada keadaan setengah jadi yang tertinggal.',
      ),
      p(
        'Pencegahannya satu kalimat, yaitu ambil kunci dalam urutan yang selalu sama. Untuk transfer saldo, urutkan berdasarkan id alih-alih berdasarkan siapa pengirim dan siapa penerima.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Transaksi adalah alat yang mudah dipakai setengah benar, dan setengah benar di sini berarti tetap meninggalkan data rusak.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menangkap error di tengah transaksi lalu melanjutkan',
            'Errornya sudah ditangani',
            'Diuji sungguhan, setiap perintah berikutnya ditolak `current transaction is aborted`. Pakai `SAVEPOINT`',
          ],
          [
            'Memanggil API pembayaran di dalam transaksi',
            'Sekalian satu kesatuan',
            'Kuncinya tertahan selama menunggu jaringan. Panggil di luar, lalu catat hasilnya di transaksi pendek',
          ],
          [
            'Membungkus seluruh permintaan HTTP dalam satu transaksi',
            'Lebih aman',
            'Transaksi jadi sepanjang permintaan, termasuk menunggu hal yang tidak perlu dikunci',
          ],
          [
            'Menganggap deadlock sebagai kegagalan yang harus ditampilkan',
            'Ada kata error',
            'Diuji sungguhan, satu sesi berhasil dan yang gagal sudah dibatalkan utuh. Coba ulang, jangan dilaporkan',
          ],
          [
            'Memeriksa stok dengan `SELECT` lalu `UPDATE`',
            'Sudah dipastikan cukup',
            'Ada celah di antaranya. Gabungkan jadi `UPDATE ... WHERE stok >= n` lalu periksa jumlah barisnya',
          ],
          [
            'Mengandalkan `COMMIT` yang berhasil sebagai bukti data tersimpan',
            'Tidak ada error',
            'Diuji sungguhan, `COMMIT` pada transaksi yang sudah gagal dilaporkan sebagai `ROLLBACK`. Periksa hasilnya',
          ],
        ],
      ),
      p(
        'Baris ketiga layak diperjelas karena ia terdengar seperti kehati-hatian. Transaksi menahan kunci selama ia terbuka, dan permintaan HTTP memuat banyak hal yang tidak ada hubungannya dengan database, misalnya menyusun respons, memformat tanggal, atau menunggu pemanggilan lain. Menahan kunci selama itu memperbesar peluang deadlock dan membuat sesi lain menunggu tanpa alasan. Bukalah transaksi tepat sebelum penulisan pertama dan tutup tepat setelah penulisan terakhir.',
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
    21,
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
      h2('Studi kasus di project nyata'),
      p(
        'Halaman login adalah tempat SQL injection paling sering ditemui, dan alasannya bukan karena login itu rumit melainkan karena bentuk query-nya paling mudah ditebak penyerang. Berikut demonstrasinya, dijalankan sungguhan pada basis data percobaan terisolasi berisi dua pengguna.',
      ),
      code(
        'text',
        `
        Tabel pengguna:
          id | email            | sandi_hash | peran
          ---+------------------+------------+-------
           1 | rina@contoh.id   | $2b$abc    | user
           2 | admin@contoh.id  | $2b$xyz    | admin

        Kode servernya merangkai query dengan penggabungan teks:

          const q = "SELECT id, email, peran FROM pengguna WHERE email = '" + masukan + "'";
        `,
      ),
      code(
        'text',
        `
        MASUKAN 1 — pengguna biasa
          rina@contoh.id

          query jadi: SELECT id, email, peran FROM pengguna WHERE email = 'rina@contoh.id';

           id |     email      | peran
           ---+----------------+-------
            1 | rina@contoh.id | user
          (1 row)

        MASUKAN 2 — penyerang
          ' OR '1'='1

          query jadi: SELECT id, email, peran FROM pengguna WHERE email = '' OR '1'='1';

           id |      email      | peran
           ---+-----------------+-------
            1 | rina@contoh.id  | user
            2 | admin@contoh.id | admin      <-- seluruh tabel terbuka
          (2 rows)
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15 di basis data percobaan terpisah.' },
      ),
      p(
        'Yang terjadi bukan penyerang "membobol" apa pun. Ia hanya mengetik teks yang, setelah digabungkan, **mengubah bentuk query-nya**. Tanda kutip pertama menutup string yang sedang dibuka, dan sisanya menjadi bagian dari SQL yang dijalankan server dengan senang hati. Inilah akar seluruh persoalan, yaitu data pengguna dan perintah SQL dicampur menjadi satu teks, sehingga tidak ada lagi cara membedakan keduanya.',
      ),
      p('Serangan kedua menunjukkan bahwa akibatnya jauh melampaui melewati login.'),
      code(
        'text',
        `
        MASUKAN 3
          ' UNION SELECT id, email, sandi_hash FROM pengguna --

          query jadi:
            SELECT id, email, peran FROM pengguna WHERE email = ''
            UNION SELECT id, email, sandi_hash FROM pengguna --';

           id |      email      |  peran
           ---+-----------------+---------
            1 | rina@contoh.id  | $2b$abc     <-- hash sandi, di kolom "peran"
            2 | admin@contoh.id | $2b$xyz
          (2 rows)
        `,
        { caption: 'Dijalankan sungguhan. Kolom peran kini berisi hash sandi seluruh pengguna.' },
      ),
      p(
        'Penyerang tidak perlu akses ke basis data, tidak perlu kata sandi, dan tidak perlu satu pun kerentanan lain. Ia hanya memakai satu kotak isian yang memang disediakan untuknya, lalu membaca kolom mana pun dari tabel mana pun yang bisa dijangkau akun database aplikasimu. Tanda `--` di akhir mematikan sisa query aslinya sehingga tanda kutip yang menggantung tidak menghasilkan error.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Perbaikannya satu hal, dan hanya satu, yaitu **jangan pernah menggabungkan masukan pengguna ke dalam teks query**. Kirim query dan datanya sebagai dua hal terpisah, dan biarkan database yang menyatukannya. Berikut ketiga masukan yang sama persis, dijalankan lewat query berparameter.',
      ),
      code(
        'text',
        `
        PREPARE cari(text) AS SELECT id, email, peran FROM pengguna WHERE email = $1;

        masukan: rina@contoh.id
           id |     email      | peran
           ---+----------------+-------
            1 | rina@contoh.id | user
          (1 row)

        masukan: ' OR '1'='1
           id | email | peran
           ---+-------+-------
          (0 rows)

        masukan: ' UNION SELECT id, email, sandi_hash FROM pengguna --
           id | email | peran
           ---+-------+-------
          (0 rows)
        `,
        { caption: 'Dijalankan sungguhan. Query-nya sama, masukannya sama, hasilnya aman.' },
      ),
      p(
        "Perhatikan bahwa kedua serangan tidak menghasilkan error, melainkan **nol baris**. Itu tepat yang seharusnya terjadi, sebab `' OR '1'='1` memang bukan alamat email siapa pun. Database mencarinya sebagai teks biasa, tidak menemukannya, lalu menjawab kosong. Parameter tidak \"membersihkan\" masukannya melainkan memindahkannya ke tempat yang **tidak bisa mengubah bentuk query**.",
      ),
      p(
        'Sekarang batas yang harus diketahui, dan bagian ini yang paling sering luput. Parameter hanya bisa dipakai untuk **nilai**, tidak untuk nama tabel, nama kolom, maupun arah pengurutan.',
      ),
      code(
        'text',
        `
        PREPARE urut(text) AS SELECT id, email FROM pengguna ORDER BY $1 LIMIT 2;
        EXECUTE urut('email');

           id |      email
           ---+-----------------
            1 | rina@contoh.id
            2 | admin@contoh.id      <-- urutan id, BUKAN urutan email

        Bandingkan dengan pengurutan yang sebenarnya:
        SELECT id, email FROM pengguna ORDER BY email LIMIT 2;

           id |      email
           ---+-----------------
            2 | admin@contoh.id
            1 | rina@contoh.id
        `,
        {
          caption:
            'Dijalankan sungguhan. Parameternya diperlakukan sebagai teks tetap, jadi pengurutannya tidak terjadi.',
        },
      ),
      p(
        'Jadi memakai parameter untuk nama kolom tidak menghasilkan error melainkan pengurutan yang diam-diam tidak berfungsi. Godaan berikutnya adalah merangkainya dengan penggabungan teks, dan di situlah kerentanan yang sama kembali lewat pintu yang berbeda.',
      ),
      code(
        'text',
        `
        Kode: "SELECT id, email FROM pengguna ORDER BY " + kolomDariPengguna

        masukan: email; DROP TABLE artikel_tag

           id |      email
           ---+-----------------
            2 | admin@contoh.id
            1 | rina@contoh.id
          (2 rows)

        Lalu:
        SELECT count(*) FROM artikel_tag;
          ERROR:  relation "artikel_tag" does not exist
        `,
        { caption: 'Dijalankan sungguhan di basis data percobaan. Tabelnya benar-benar terhapus.' },
      ),
      p(
        'Query pertama mengembalikan hasil yang terlihat normal, dan tabel `artikel_tag` sudah tidak ada. Tidak ada error yang muncul ke pengguna, dan tidak ada tanda apa pun di respons. Karena parameter tidak bisa menolong di sini, satu-satunya perlindungan adalah **daftar yang diizinkan**.',
      ),
      code(
        'ts',
        `
        // Nama kolom TIDAK PERNAH boleh datang dari pengguna, meski sudah "divalidasi"
        // dengan regex. Petakan dari daftar tetap yang kamu tulis sendiri.
        const KOLOM_URUT = {
          terbaru: 'dibuat_pada DESC, id DESC',
          nama: 'nama ASC, id ASC',
          harga: 'harga ASC, id ASC',
        } as const;

        function daftarProduk(urut: string) {
          // Kunci yang tidak dikenal jatuh ke bawaan, bukan diteruskan apa adanya.
          const klausa = KOLOM_URUT[urut as keyof typeof KOLOM_URUT] ?? KOLOM_URUT.terbaru;
          return db.query(\`SELECT * FROM produk ORDER BY \${klausa} LIMIT $1\`, [20]);
        }

        // Nilai tetap lewat parameter; hanya potongan SQL dari daftar TETAP yang boleh
        // digabungkan. Perhatikan setiap kunci berakhir pada kolom unik, sesuai
        // aturan urutan stabil yang sudah diukur di sub-bab paginasi.
        `,
        { caption: 'Ini pola yang menutup injeksi lewat ORDER BY tanpa mengorbankan fiturnya.' },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sebagian besar kesalahan di sini berasal dari percaya pada perlindungan yang sebenarnya tidak melindungi.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyaring kata kunci berbahaya seperti `DROP` dan `UNION`',
            'Serangannya kan memakai kata itu',
            'Selalu ada bentuk lain — huruf besar kecil dicampur, komentar disisipkan, penyandian berbeda. Daftar larangan selalu bisa dilewati',
          ],
          [
            'Meng-escape tanda kutip sendiri',
            'Itu yang dipakai penyerang',
            'Penyandian karakter dan tipe data tertentu punya jalan lain. Serahkan ke driver lewat parameter',
          ],
          [
            'Memakai ORM lalu merasa aman sepenuhnya',
            'ORM kan sudah memakai parameter',
            'Setiap ORM punya jalan keluar untuk SQL mentah, dan di situlah penggabungan teks kembali masuk',
          ],
          [
            'Memakai parameter untuk nama kolom di `ORDER BY`',
            'Sama-sama masukan pengguna',
            'Diuji sungguhan, pengurutannya diam-diam tidak terjadi. Nama kolom butuh daftar yang diizinkan',
          ],
          [
            'Merangkai `ORDER BY` dari masukan pengguna',
            'Parameter tidak bisa, jadi tidak ada pilihan',
            'Diuji sungguhan, satu masukan menghapus sebuah tabel tanpa error apa pun di respons',
          ],
          [
            'Memakai akun database dengan hak penuh',
            'Supaya tidak ada yang menghalangi',
            'Satu celah injeksi jadi berhak menghapus tabel dan membaca segalanya. Beri hak seminimal yang dibutuhkan',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah lapisan kedua yang harganya nol dan sering dilewatkan. Aplikasi web yang tidak pernah membuat tabel tidak perlu terhubung sebagai pemilik skema. Dengan akun yang hanya berhak membaca dan menulis baris, serangan `DROP TABLE` yang barusan ditunjukkan akan gagal di tingkat izin meski celah injeksinya ada. Tidak ada satu lapisan pun yang cukup sendirian, dan itu tepat alasan kenapa keduanya dipasang.',
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
    19,
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

      h2('Studi kasus di project nyata'),
      p(
        'Skema blog yang dibangun di sub-bab ini benar-benar dibuat di PostgreSQL 16.15 lalu diisi 50.000 artikel dan 60.000 komentar, supaya setiap keputusan di dalamnya bisa diukur akibatnya. Dua bagian yang biasanya tidak muncul di contoh sederhana justru yang paling menentukan, yaitu batasan lintas-kolom dan index parsial.',
      ),
      code(
        'sql',
        `
        CREATE TABLE artikel (
          id          bigserial PRIMARY KEY,
          penulis_id  bigint NOT NULL REFERENCES penulis(id),
          slug        text NOT NULL UNIQUE,
          judul       text NOT NULL,
          isi         text NOT NULL,
          status      text NOT NULL DEFAULT 'draf'
                      CHECK (status IN ('draf','terbit','arsip')),
          terbit_pada timestamptz,
          dibuat_pada timestamptz NOT NULL DEFAULT now(),

          -- Batasan LINTAS-KOLOM: artikel berstatus terbit wajib punya waktu terbit.
          -- Satu baris ini menutup keadaan yang mustahil dijelaskan di laporan mana pun.
          CONSTRAINT terbit_wajib_berwaktu
            CHECK (status <> 'terbit' OR terbit_pada IS NOT NULL)
        );
        `,
        { caption: 'Skema ini benar-benar dijalankan, dan batasannya diuji di bawah.' },
      ),
      p(
        'Batasan `terbit_wajib_berwaktu` adalah jenis yang biasanya ditulis sebagai aturan di kode aplikasi lalu dilanggar oleh jalur kode kedua yang lupa memeriksanya, misalnya sebuah skrip impor atau perintah administratif. Ditaruh di database, ia berlaku untuk semua jalur tanpa kecuali.',
      ),
      code(
        'text',
        `
        INSERT INTO artikel (penulis_id, slug, judul, isi, status)
        VALUES (1, 'x', 'X', 'isi', 'terbit');

          ERROR:  new row for relation "artikel" violates check constraint
                  "terbit_wajib_berwaktu"
          DETAIL:  Failing row contains (50001, 1, x, X, isi, terbit, null, 2026-09-14 ...).
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Keputusan kedua adalah **index parsial**, yaitu index yang hanya memuat sebagian baris. Halaman depan blog hanya pernah menampilkan artikel berstatus terbit, jadi tidak ada gunanya artikel draf ikut masuk index.',
      ),
      code(
        'sql',
        `
        CREATE INDEX idx_artikel_terbit
          ON artikel(terbit_pada DESC, id DESC)
          WHERE status = 'terbit';

        -- Tiga keputusan dalam satu baris:
        --   DESC          mengikuti urutan yang benar-benar dipakai halaman depan
        --   , id DESC     pemecah seri, supaya paginasinya tidak melewatkan baris
        --   WHERE status  hanya baris terbit yang masuk index
        `,
      ),
      code(
        'text',
        `
        Diukur pada 50.000 artikel (33.334 terbit, 16.666 draf):

          ukuran tabel artikel        : 5536 kB
          index parsial (hanya terbit): 1040 kB
          index penuh (semua baris)   : 1552 kB

        Query halaman depan:
          SELECT id, judul FROM artikel WHERE status='terbit'
          ORDER BY terbit_pada DESC, id DESC LIMIT 20;

          TANPA index
            Seq Scan on artikel, Rows Removed by Filter: 16666
            Sort Method: top-N heapsort  Memory: 26kB
            Execution Time: 8,865 ms

          DENGAN index parsial
            Index Scan using idx_artikel_terbit
            Execution Time: 0,018 ms
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15.' },
      ),
      p(
        'Dua keuntungan sekaligus terlihat di angka itu. Index parsial 33 persen lebih kecil daripada index penuh, dan ia tidak perlu diperbarui ketika sebuah artikel draf disunting, sebab baris draf memang tidak ada di dalamnya. Selisih waktunya sekitar 490 kali, dan yang membuatnya sebesar itu bukan hanya pemindaian melainkan juga `top-N heapsort` yang hilang seluruhnya karena index sudah menyimpan urutannya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Halaman artikel biasanya menampilkan lebih dari sekadar artikel, yaitu nama penulis, jumlah komentar yang disetujui, dan daftar tag. Di sinilah pola N+1 paling sering lahir, sebab setiap tambahan itu terasa seperti pengambilan data yang terpisah.',
      ),
      code(
        'ts',
        `
        // Bentuk yang hampir selalu ditulis pertama, dan menghasilkan 61 query
        // untuk satu halaman berisi 20 artikel.
        const artikel = await db.query('SELECT ... FROM artikel ... LIMIT 20');

        for (const a of artikel) {
          a.penulis = await db.query('SELECT nama FROM penulis WHERE id = $1', [a.penulis_id]);
          a.jumlahKomentar = await db.query(
            'SELECT count(*) FROM komentar WHERE artikel_id = $1 AND disetujui', [a.id]);
          a.tag = await db.query('SELECT ... FROM artikel_tag ... WHERE artikel_id = $1', [a.id]);
        }
        `,
        {
          caption:
            '1 query daftar + 20 penulis + 20 hitungan + 20 tag = 61 perjalanan ke database.',
        },
      ),
      code(
        'text',
        `
        Satu query yang menggantikan seluruhnya:

        SELECT a.slug, a.judul, p.nama AS penulis,
               (SELECT count(*) FROM komentar k
                WHERE k.artikel_id = a.id AND k.disetujui) AS jml_komentar,
               (SELECT string_agg(t.nama, ', ') FROM artikel_tag at
                JOIN tag t ON t.id = at.tag_id WHERE at.artikel_id = a.id) AS tag
        FROM artikel a JOIN penulis p ON p.id = a.penulis_id
        WHERE a.status = 'terbit'
        ORDER BY a.terbit_pada DESC, a.id DESC
        LIMIT 20;

        Rencana eksekusinya:
          Index Scan using idx_artikel_terbit on artikel a (rows=20)
          SubPlan 1 -> Index Only Scan using idx_komentar_artikel (loops=20)
          SubPlan 2 -> Index Only Scan using artikel_tag_pkey    (loops=20)
          Execution Time: 0,167 ms
        `,
        { caption: 'Dijalankan sungguhan. Satu perjalanan ke database untuk seluruh halaman.' },
      ),
      p(
        'Baris `loops=20` pada rencana eksekusi itu menarik, sebab subquery-nya memang dijalankan dua puluh kali. Bedanya, dua puluh kali itu terjadi **di dalam database** tanpa perjalanan jaringan, dan keduanya memakai index. Seperti yang sudah diukur di sub-bab `JOIN`, biaya N+1 bukan terletak pada banyaknya query melainkan pada banyaknya perjalanan bolak-balik.',
      ),
      p('Index yang membuat subquery pertama murah juga parsial, dan alasannya sama.'),
      code(
        'sql',
        `
        CREATE INDEX idx_komentar_artikel ON komentar(artikel_id) WHERE disetujui;

        -- Komentar yang belum disetujui tidak pernah ikut dihitung di halaman publik,
        -- jadi ia tidak perlu ada di index. Baris moderasi yang menunggu antrean
        -- biasanya jauh lebih sedikit daripada yang sudah tayang, dan dengan index
        -- parsial ia tidak menambah biaya penulisan di jalur publik sama sekali.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Merancang skema adalah pekerjaan yang hasilnya baru terasa berbulan-bulan kemudian, dan itu membuat sebagian besar kesalahannya tidak terlihat saat ditulis.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh aturan lintas-kolom hanya di kode aplikasi',
            'Di situ tempat logika bisnis',
            'Jalur kedua seperti skrip impor melewatinya. Diuji sungguhan, `CHECK` menolaknya dari semua jalur',
          ],
          [
            'Membuat index penuh padahal query-nya selalu menyaring',
            'Index kan untuk mempercepat',
            'Diukur, index parsial 33 persen lebih kecil dan tidak ikut diperbarui saat baris draf disunting',
          ],
          [
            'Mengurutkan hanya dengan `terbit_pada DESC`',
            'Itu yang ditampilkan',
            'Waktu bisa sama persis pada impor massal. Akhiri dengan `id DESC` agar urutannya pasti',
          ],
          [
            'Mengambil penulis, tag, dan jumlah komentar satu per satu',
            'Masing-masing datanya terpisah',
            'Diukur, 61 query untuk satu halaman. Satu query dengan subquery berindeks selesai 0,167 ms',
          ],
          [
            'Memakai `id` berurutan sebagai slug URL',
            'Sudah unik dan pendek',
            'Membocorkan jumlah artikel dan memudahkan penelusuran berurutan. Pakai slug teks yang `UNIQUE`',
          ],
          [
            'Menghapus artikel dengan `DELETE`',
            'Memang diminta dihapus',
            'Komentar ikut terhapus lewat `CASCADE`, dan tidak ada jalan mengembalikannya. Pertimbangkan status `arsip`',
          ],
        ],
      ),
      p(
        'Baris terakhir sekaligus menjelaskan kenapa kolom `status` di skema ini punya nilai `arsip` di samping `draf` dan `terbit`. Menyembunyikan artikel dari halaman publik tidak harus berarti menghapusnya, dan perbedaan keduanya menjadi nyata pada hari seseorang meminta artikel yang tahun lalu ditarik. Dengan `arsip`, artikelnya masih ada beserta seluruh komentarnya, dan index parsial memastikan baris arsip itu tidak membebani halaman depan sama sekali.',
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
