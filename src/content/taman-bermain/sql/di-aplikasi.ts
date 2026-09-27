import { mesinJs, nilai, soal, wajib } from '@/lib/taman-bermain/builders';
import type { Exercise, GivenCode } from '@/lib/taman-bermain/types';

/**
 * SQL as it actually lives in a backend: inside Node code, sent through the `pg` library.
 *
 * Unlike the pure-SQL exercises these are EXECUTED. Every scenario hands the learner's function a
 * fake `pg` client that records what it was sent and answers from an in-memory array, so the
 * grader can prove behaviour — that input travels as a parameter, that a failed transfer rolls
 * back and still releases its connection — rather than only matching the shape of the source.
 *
 * The fakes never interpret SQL text. They answer from `values`, which is exactly what makes an
 * answer that pastes input into the query text fail: its `values` are empty.
 */

const SUMBER = { category: 'backend-basic', chapter: 'database-sql-dasar' } as const;

/* ------------------------------------------------------------------ preludes */

const DB_PENGGUNA = `
  // Tabel palsu berisi dua pengguna.
  const tabel = [
    { id: 1, nama: 'Ana', email: 'ana@contoh.id' },
    { id: 2, nama: 'Budi', email: 'budi@contoh.id' },
  ];

  // db palsu dengan bentuk yang sama seperti Pool dari library pg.
  // Ia mencatat setiap query yang dikirim, lalu mencari pengguna berdasarkan values[0].
  const kiriman = [];
  const db = {
    kiriman,
    async query(text, values = []) {
      kiriman.push({ text, values });
      return { rows: tabel.filter((baris) => baris.email === values[0]) };
    },
  };
`;

const RAPIKAN = `
  // rapikan menyatukan spasi dan baris baru yang berlebih menjadi satu spasi,
  // supaya query yang ditulis dalam beberapa baris tetap bisa dibandingkan.
  const rapikan = (q) => ({ text: q.text.replace(/\\s+/g, ' ').trim(), values: q.values });
`;

const POOL_PALSU = `
  // Pool palsu dengan bentuk yang sama seperti Pool dari library pg.
  // gagalPadaKe menentukan query keberapa yang gagal, misalnya 2 untuk UPDATE pertama.
  function buatPool(gagalPadaKe = 0) {
    const log = [];
    const kiriman = [];
    let ke = 0;
    const pool = {
      log,
      kiriman,
      dilepas: 0,
      // pool.query meminjam koneksi LAIN untuk setiap panggilan
      async query(text) {
        log.push('(koneksi lain) ' + text.trim().split(/\\s+/)[0].toUpperCase());
        return { rows: [], rowCount: 0 };
      },
      async connect() {
        return {
          async query(text, values = []) {
            ke += 1;
            log.push(text.trim().split(/\\s+/)[0].toUpperCase());
            kiriman.push({ text, values });
            if (ke === gagalPadaKe) {
              throw new Error('new row for relation "dompet" violates check constraint "dompet_saldo_check"');
            }
            return { rows: [], rowCount: 1 };
          },
          release() {
            pool.dilepas += 1;
          },
        };
      },
    };
    return pool;
  }
`;

const DB_KEYSET = `
  // 25 pesanan palsu dengan id 1 sampai 25.
  const semua = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, total: (i + 1) * 1000 }));

  // db palsu yang menjawab query keyset dari values, yaitu [cursor, jumlah] atau [jumlah] saja.
  function buatDb(isi) {
    const kiriman = [];
    return {
      kiriman,
      async query(text, values = []) {
        kiriman.push({ text, values });
        const [cursor, jumlah] = values.length === 1 ? [null, values[0]] : values;
        const rows = isi
          .filter((p) => cursor === null || cursor === undefined || p.id < cursor)
          .sort((a, b) => b.id - a.id)
          .slice(0, jumlah);
        return { rows };
      },
    };
  }
`;

/* --------------------------------------------------------------- given code */

const SKEMA_DOMPET: GivenCode = {
  file: 'db/skema.sql',
  lang: 'sql',
  code: `
    CREATE TABLE dompet (
      pengguna_id INT PRIMARY KEY REFERENCES pengguna (id),
      saldo       INT NOT NULL CHECK (saldo >= 0)   -- saldo tidak boleh minus
    );
  `,
};

const QUERY_JOIN: GivenCode = {
  file: 'db/pengguna-dan-pesanan.sql',
  lang: 'sql',
  code: `
    -- Satu baris untuk setiap pasangan pengguna dan pesanan.
    -- Pengguna tanpa pesanan tetap muncul satu kali, dengan pesanan_id dan total bernilai NULL.
    SELECT u.id AS pengguna_id, u.nama, p.id AS pesanan_id, p.total
    FROM pengguna AS u
    LEFT JOIN pesanan AS p ON p.pengguna_id = u.id
    ORDER BY u.id, p.id;
  `,
};

const QUERY_KEYSET: GivenCode = {
  file: 'db/halaman-pesanan.sql',
  lang: 'sql',
  code: `
    -- Query keyset. $1 adalah cursor, $2 adalah jumlah baris yang diambil.
    -- Saat $1 bernilai NULL (halaman pertama), syarat id < $1 dilewati.
    SELECT id, total
    FROM pesanan
    WHERE ($1::int IS NULL OR id < $1)
    ORDER BY id DESC
    LIMIT $2;
  `,
};

/* ---------------------------------------------------------------- exercises */

export const exercises: Exercise[] = [
  soal({
    slug: 'sql-parameterized-query',
    title: 'Kirim input pengguna lewat parameter `$1`',
    topic: 'sql',
    level: 'basic',
    realWorldUse:
      'Setiap query yang memuat input dari pengguna, seperti form login, pencarian, atau filter. Parameter adalah pertahanan utama terhadap SQL injection, salah satu celah keamanan tertua yang sampai sekarang masih sering ditemukan.',
    source: SUMBER,
    brief: {
      situation:
        "Endpoint lupa password menerima email dari form, lalu mencari pengguna dengan email itu di database. Email tersebut diketik bebas oleh siapa pun, termasuk orang yang sengaja mengetik potongan SQL seperti `x' OR '1'='1`. Kalau email itu ditempel langsung ke teks query, potongan tadi ikut dijalankan sebagai bagian dari perintah.",
      tasks: [
        'Buat fungsi async bernama `cariPenggunaByEmail` yang menerima `db` dan `email`.',
        'Jalankan query `SELECT id, nama, email FROM pengguna WHERE email = $1` lewat `db.query`, dengan email dikirim di argumen kedua sebagai `[email]`.',
        'Kembalikan baris pertama dari `rows`. Kalau tidak ada yang cocok, kembalikan `null`.',
      ],
      pitfalls: [
        'Jangan menempelkan email ke teks query dengan template literal atau `+`. Input yang berisi kutip tunggal bisa keluar dari string SQL lalu mengubah arti query-nya. Inilah yang disebut SQL injection.',
        "Placeholder `$1` ditulis tanpa kutip. Kalau ditulis `'$1'`, isinya dibaca sebagai teks biasa berisi dua karakter, bukan sebagai tempat nilai parameter.",
        '`rows` selalu berupa array, walaupun hasilnya hanya satu baris atau malah kosong. Ambil elemen pertamanya dengan `rows[0]`.',
      ],
      terms: [
        {
          term: 'SQL injection',
          meaning:
            "Celah keamanan yang terjadi ketika input pengguna ditempel langsung ke teks query. Input seperti `x' OR '1'='1` menutup string lebih awal lalu menambahkan syarat yang selalu benar, sehingga query mengembalikan data yang seharusnya tidak boleh dilihat.",
        },
        {
          term: 'parameterized query',
          meaning:
            'Query yang teksnya hanya berisi placeholder seperti `$1` dan `$2`, sementara nilainya dikirim terpisah. Database menerima teks query dan nilainya lewat jalur yang berbeda, sehingga nilai itu selalu diperlakukan sebagai data, tidak pernah sebagai perintah.',
        },
        {
          term: 'placeholder',
          meaning:
            'Penanda tempat nilai parameter di dalam teks query. Di PostgreSQL bentuknya `$1`, `$2`, dan seterusnya. `$1` diisi elemen pertama array parameter, `$2` elemen kedua. Library untuk database lain bisa memakai tanda berbeda, misalnya `?` di MySQL.',
        },
        {
          term: 'db.query',
          meaning:
            'Fungsi dari library `pg` untuk Node.js. Argumen pertamanya teks query, argumen keduanya array nilai parameter. Hasilnya Promise berisi objek yang punya properti `rows`, yaitu array berisi baris-baris hasil query.',
        },
      ],
    },
    rules: [
      'Email dikirim sebagai parameter, tidak ditempel ke teks query.',
      'Teks query memakai placeholder `$1`.',
      'Mengembalikan `null` kalau tidak ditemukan.',
    ],
    starter: `
      async function cariPenggunaByEmail(db, email) {
        // tulis kodemu di sini
      }
    `,
    hints: [
      'Panggil `await db.query(teksQuery, [email])`.',
      'Teks query-nya `SELECT id, nama, email FROM pengguna WHERE email = $1`, tanpa kutip di sekitar `$1`.',
      'Hasilnya ada di `hasil.rows`. Pakai `hasil.rows[0] ?? null`.',
    ],
    solution: {
      code: `
        async function cariPenggunaByEmail(db, email) {
          // $1 hanya penanda tempat. Nilai email dikirim terpisah lewat array di argumen kedua.
          const hasil = await db.query(
            'SELECT id, nama, email FROM pengguna WHERE email = $1',
            [email],
          );

          // rows selalu array. Kalau kosong, rows[0] bernilai undefined, jadi diganti null.
          return hasil.rows[0] ?? null;
        }
      `,
      steps: [
        'Teks query `SELECT ... WHERE email = $1` tidak pernah berubah, apa pun email yang dikirim. Bagian yang berubah hanya ditandai `$1`.',
        '`[email]` dikirim sebagai argumen kedua. Library `pg` mengirimnya ke database secara terpisah dari teks query.',
        'Database mengisi `$1` dengan email tersebut sebagai data. Walaupun email-nya berisi kutip atau kata `OR`, isinya hanya dibandingkan dengan kolom `email` dan tidak pernah dijalankan.',
        '`hasil.rows[0] ?? null` mengambil baris pertama, atau `null` kalau tidak ada yang cocok.',
      ],
      explanation:
        'Perhatikan bahwa teks query di kunci jawaban ini sama persis untuk setiap email. Itulah ciri parameterized query. Selama input pengguna tidak pernah menjadi bagian dari teks query, isi input tersebut tidak mungkin mengubah perintah yang dijalankan database.',
    },
    alternativeSolutions: [
      `
        async function cariPenggunaByEmail(db, email) {
          const { rows } = await db.query(
            'SELECT id, nama, email FROM pengguna WHERE email = $1 LIMIT 1',
            [email],
          );
          return rows.length > 0 ? rows[0] : null;
        }
      `,
      `
        function cariPenggunaByEmail(db, email) {
          const sql = \`
            SELECT id, nama, email
            FROM pengguna
            WHERE email = $1
          \`;
          return db.query(sql, [email]).then((hasil) => hasil.rows[0] ?? null);
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          async function cariPenggunaByEmail(db, email) {
            const hasil = await db.query(
              \`SELECT id, nama, email FROM pengguna WHERE email = '\${email}'\`,
            );
            return hasil.rows[0] ?? null;
          }
        `,
        reason:
          'Email ditempel ke teks query lewat template literal, sehingga input berisi kutip bisa mengubah arti query. Ini SQL injection.',
      },
      {
        code: `
          async function cariPenggunaByEmail(db, email) {
            const hasil = await db.query(
              "SELECT id, nama, email FROM pengguna WHERE email = '" + email + "'",
              [email],
            );
            return hasil.rows[0] ?? null;
          }
        `,
        reason:
          'Email tetap ditempel ke teks query dengan `+`. Mengirim `[email]` sebagai parameter tidak ada gunanya kalau teksnya sendiri tidak memakai `$1`.',
      },
      {
        code: `
          async function cariPenggunaByEmail(db, email) {
            const hasil = await db.query('SELECT id, nama, email FROM pengguna WHERE email = $1', [email]);
            return hasil.rows[0];
          }
        `,
        reason:
          'Mengembalikan `undefined` saat pengguna tidak ditemukan, padahal soal meminta `null`.',
      },
      {
        code: `
          async function cariPenggunaByEmail(db, email) {
            const hasil = await db.query('SELECT id, nama, email FROM pengguna WHERE email = $1', [email]);
            return hasil.rows;
          }
        `,
        reason: 'Mengembalikan seluruh array `rows`, bukan satu objek pengguna.',
      },
    ],
    check: mesinJs(
      [
        wajib(
          'ada-fungsi',
          'Ada fungsi bernama `cariPenggunaByEmail`',
          '\\bcariPenggunaByEmail\\b',
        ),
      ],
      [
        nilai(
          'ditemukan',
          'Email terdaftar',
          "(async () => await cariPenggunaByEmail(db, 'ana@contoh.id'))()",
          { id: 1, nama: 'Ana', email: 'ana@contoh.id' },
          { visible: true, prelude: DB_PENGGUNA },
        ),
        nilai(
          'tidak-ditemukan',
          'Email tidak terdaftar',
          "(async () => await cariPenggunaByEmail(db, 'tidak@ada.id'))()",
          null,
          { visible: true, prelude: DB_PENGGUNA },
        ),
        nilai(
          'pakai-placeholder',
          'Teks query memakai `$1` dan email dikirim sebagai parameter',
          `
            (async () => {
              await cariPenggunaByEmail(db, 'budi@contoh.id');
              const [q] = db.kiriman;
              return { adaPlaceholder: q.text.includes('$1'), values: q.values };
            })()
          `,
          { adaPlaceholder: true, values: ['budi@contoh.id'] },
          { prelude: DB_PENGGUNA },
        ),
        nilai(
          'input-berbahaya',
          'Input berisi potongan SQL tidak ikut masuk ke teks query',
          `
            (async () => {
              const hasil = await cariPenggunaByEmail(db, "x' OR '1'='1");
              return { hasil, masukKeTeks: db.kiriman[0].text.includes("'1'='1") };
            })()
          `,
          { hasil: null, masukKeTeks: false },
          { prelude: DB_PENGGUNA },
        ),
      ],
    ),
  }),

  soal({
    slug: 'sql-baris-ke-camelcase',
    title: 'Ubah nama kolom `snake_case` menjadi `camelCase`',
    topic: 'sql',
    level: 'basic',
    realWorldUse:
      'Hampir setiap backend Node yang memakai SQL langsung melakukan ini sebelum mengirim response. Nama kolom di database memakai garis bawah, sedangkan kode JavaScript dan API memakai huruf kapital di tengah.',
    source: SUMBER,
    brief: {
      situation:
        'Library `pg` mengembalikan setiap baris dengan nama kolom persis seperti di database, misalnya `pengguna_id` dan `dibuat_pada`. Gaya nama dengan garis bawah seperti ini disebut snake_case dan lazim di SQL. Tapi di kode JavaScript dan di response API, konvensinya camelCase, seperti `penggunaId` dan `dibuatPada`. Kamu perlu mengubah nama properti setiap baris sebelum datanya dikirim ke frontend.',
      tasks: [
        'Buat fungsi bernama `keCamelCase` yang menerima satu objek baris.',
        'Kembalikan objek BARU yang nama properti-nya sudah diubah dari snake_case menjadi camelCase. Setiap `_` yang diikuti huruf dihapus, dan huruf itu dijadikan kapital.',
        'Nilai setiap properti tetap sama persis, termasuk `0`, `null`, dan `false`.',
        'Objek aslinya tidak boleh berubah.',
      ],
      pitfalls: [
        'Nama kolom bisa punya lebih dari satu garis bawah, misalnya `tanggal_kirim_ulang`. `replace` dengan teks biasa, atau dengan regex tanpa flag `g`, hanya mengganti kemunculan pertama.',
        'Jangan mengubah objek aslinya dengan `delete`. Baris yang sama mungkin masih dipakai bagian kode lain, misalnya untuk log.',
        'Jangan membuang properti yang nilainya `0`, `null`, atau `false`. Nilai-nilai itu adalah data yang sah.',
      ],
      terms: [
        {
          term: 'snake_case dan camelCase',
          meaning:
            'Dua gaya penulisan nama yang terdiri dari beberapa kata. snake_case memisahkan kata dengan garis bawah, seperti `dibuat_pada`, dan lazim di SQL. camelCase menyambung kata dengan huruf kapital di awal kata berikutnya, seperti `dibuatPada`, dan lazim di JavaScript.',
        },
        {
          term: 'Object.entries',
          meaning:
            '`Object.entries(obj)` mengubah objek menjadi array berisi pasangan `[kunci, nilai]`. Contohnya `{ a: 1 }` menjadi `[["a", 1]]`. Kebalikannya adalah `Object.fromEntries`, yang menyusun objek baru dari array pasangan seperti itu.',
        },
        {
          term: 'flag g',
          meaning:
            'Huruf `g` di akhir regex seperti `/_([a-z])/g` berarti global, yaitu cari dan ganti SEMUA kemunculan. Tanpa `g`, `replace` berhenti setelah menemukan kemunculan pertama, sehingga `tanggal_kirim_ulang` hanya berubah sebagian.',
        },
        {
          term: 'callback replace',
          meaning:
            '`replace` bisa menerima fungsi sebagai argumen kedua. Fungsi itu dipanggil untuk setiap bagian yang cocok, dan nilai kembaliannya menjadi pengganti. Parameter keduanya berisi bagian regex yang dikurung, di sini satu huruf setelah garis bawah.',
        },
      ],
    },
    rules: [
      'Semua garis bawah yang diikuti huruf ikut diubah.',
      'Nilai properti tidak berubah.',
      'Objek aslinya tidak diubah.',
    ],
    starter: `
      function keCamelCase(baris) {
        // tulis kodemu di sini
      }
    `,
    hints: [
      'Buat objek kosong baru, lalu isi satu per satu dengan `for (const [kunci, nilai] of Object.entries(baris))`.',
      'Regex `/_([a-z])/g` menemukan setiap garis bawah beserta huruf sesudahnya.',
      'Pakai `kunci.replace(/_([a-z])/g, (_, huruf) => huruf.toUpperCase())`.',
    ],
    solution: {
      code: `
        function keCamelCase(baris) {
          const hasil = {}; // objek BARU, supaya baris aslinya tidak berubah

          for (const [kunci, nilai] of Object.entries(baris)) {
            // setiap "_" yang diikuti satu huruf diganti dengan huruf itu dalam bentuk kapital
            const kunciBaru = kunci.replace(/_([a-z])/g, (_, huruf) => huruf.toUpperCase());
            hasil[kunciBaru] = nilai; // nilainya disalin apa adanya
          }

          return hasil;
        }
      `,
      steps: [
        '`const hasil = {}` menyiapkan objek baru, sehingga objek `baris` yang asli tidak pernah disentuh.',
        '`Object.entries(baris)` mengubah baris menjadi pasangan `[kunci, nilai]` yang bisa diulang dengan `for...of`.',
        '`/_([a-z])/g` mencari setiap garis bawah beserta satu huruf sesudahnya. Kurung di sekitar `[a-z]` menangkap huruf itu, dan flag `g` membuat semua kemunculan ikut diganti.',
        'Callback `(_, huruf) => huruf.toUpperCase()` menerima huruf yang tertangkap dan mengembalikannya dalam bentuk kapital. Garis bawahnya ikut hilang karena seluruh bagian yang cocok diganti.',
        '`hasil[kunciBaru] = nilai` menyalin nilainya tanpa diperiksa, sehingga `0`, `null`, dan `false` tetap ikut.',
      ],
      explanation:
        'Dua keputusan kecil di sini mencegah dua bug yang sering terjadi. Flag `g` memastikan nama dengan banyak garis bawah berubah seluruhnya. Objek baru memastikan baris asli tetap utuh, jadi fungsi ini aman dipakai dengan `rows.map(keCamelCase)` tanpa efek samping ke bagian kode lain.',
    },
    alternativeSolutions: [
      `
        function keCamelCase(baris) {
          return Object.fromEntries(
            Object.entries(baris).map(([kunci, nilai]) => {
              const [awal, ...sisa] = kunci.split('_');
              const kunciBaru = awal + sisa.map((kata) => kata[0].toUpperCase() + kata.slice(1)).join('');
              return [kunciBaru, nilai];
            }),
          );
        }
      `,
      `
        const keCamelCase = (baris) => {
          const hasil = {};
          for (const kunci of Object.keys(baris)) {
            hasil[kunci.replace(/_(\\w)/g, (cocok, h) => h.toUpperCase())] = baris[kunci];
          }
          return hasil;
        };
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function keCamelCase(baris) {
            const hasil = {};
            for (const [kunci, nilai] of Object.entries(baris)) {
              hasil[kunci.replace(/_([a-z])/, (_, h) => h.toUpperCase())] = nilai;
            }
            return hasil;
          }
        `,
        reason:
          'Regex-nya tanpa flag `g`, sehingga `tanggal_kirim_ulang` hanya berubah menjadi `tanggalKirim_ulang`.',
      },
      {
        code: `
          function keCamelCase(baris) {
            for (const kunci of Object.keys(baris)) {
              const baru = kunci.replace(/_([a-z])/g, (_, h) => h.toUpperCase());
              if (baru !== kunci) {
                baris[baru] = baris[kunci];
                delete baris[kunci];
              }
            }
            return baris;
          }
        `,
        reason:
          'Hasilnya benar, tapi objek aslinya ikut diubah dengan `delete`, sehingga bagian kode lain yang memegang baris yang sama ikut terkena.',
      },
      {
        code: `
          function keCamelCase(baris) {
            const hasil = {};
            for (const [kunci, nilai] of Object.entries(baris)) {
              hasil[kunci.split('_').join('')] = nilai;
            }
            return hasil;
          }
        `,
        reason:
          'Garis bawahnya dibuang tanpa mengubah huruf sesudahnya menjadi kapital, sehingga hasilnya `penggunaid`, bukan `penggunaId`.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `keCamelCase`', '\\bkeCamelCase\\b')],
      [
        nilai(
          'contoh-baris',
          'Satu baris dari tabel pesanan',
          "keCamelCase({ id: 1, pengguna_id: 7, dibuat_pada: '2026-09-01' })",
          { id: 1, penggunaId: 7, dibuatPada: '2026-09-01' },
          { visible: true },
        ),
        nilai(
          'banyak-garis-bawah',
          'Nama dengan lebih dari satu garis bawah',
          "keCamelCase({ tanggal_kirim_ulang: '2026-09-02' })",
          { tanggalKirimUlang: '2026-09-02' },
          { visible: true },
        ),
        nilai(
          'nilai-apa-adanya',
          'Nilai `0`, `null`, dan `false` tetap ikut',
          'keCamelCase({ total_diskon: 0, kode_kupon: null, sudah_bayar: false })',
          { totalDiskon: 0, kodeKupon: null, sudahBayar: false },
        ),
        nilai(
          'asli-tidak-berubah',
          'Objek aslinya tidak berubah',
          `
            (() => {
              const baris = { pengguna_id: 7 };
              keCamelCase(baris);
              return baris;
            })()
          `,
          { pengguna_id: 7 },
        ),
        nilai(
          'untuk-semua-rows',
          'Dipakai untuk semua baris dengan `map`',
          '[{ pengguna_id: 1 }, { pengguna_id: 2 }].map(keCamelCase)',
          [{ penggunaId: 1 }, { penggunaId: 2 }],
        ),
        nilai('objek-kosong', 'Objek kosong', 'keCamelCase({})', {}),
      ],
    ),
  }),

  soal({
    slug: 'sql-filter-dinamis',
    title: 'Rakit query filter tanpa membuka celah SQL injection',
    topic: 'sql',
    level: 'intermediate',
    realWorldUse:
      'Halaman daftar dengan beberapa filter opsional, misalnya daftar pesanan di dashboard admin. Query-nya harus dirakit sesuai filter yang diisi, dan di sinilah SQL injection paling sering menyelinap.',
    source: SUMBER,
    brief: {
      situation:
        'Halaman admin punya tiga filter pesanan, yaitu status, total minimal, dan pembeli. Admin boleh mengisi semuanya, sebagian, atau tidak sama sekali. Karena itu query-nya tidak bisa ditulis sekali jadi, melainkan dirakit sesuai filter yang diisi. Nilai setiap filter tetap harus dikirim sebagai parameter, supaya aman dari SQL injection.',
      tasks: [
        'Buat fungsi `buatQueryPesanan` yang menerima objek `filter` dan mengembalikan objek `{ text, values }`.',
        'Teks dasarnya `SELECT id, total, status FROM pesanan`, dan selalu diakhiri `ORDER BY id`.',
        'Untuk setiap filter yang diisi, tambahkan satu kondisi dengan urutan tetap. `status` menjadi `status = $n`, `minTotal` menjadi `total >= $n`, dan `penggunaId` menjadi `pengguna_id = $n`.',
        'Gabungkan kondisi-kondisi itu dengan `AND`, setelah kata `WHERE`. Kalau tidak ada filter sama sekali, jangan tulis `WHERE`.',
        'Nomor placeholder dimulai dari `$1` dan tidak boleh loncat. Nilainya dimasukkan ke `values` dengan urutan yang sama.',
        'Filter yang tidak diisi bernilai `undefined`.',
      ],
      pitfalls: [
        'Jangan memeriksa filter dengan `if (filter.minTotal)`. Angka `0` adalah total minimal yang sah, tapi dianggap false oleh `if`, sehingga filternya diam-diam hilang. Periksa dengan `!== undefined`.',
        'Nomor placeholder tidak boleh dipatok per jenis filter, misalnya status selalu `$1` dan pembeli selalu `$3`. Kalau total minimal tidak diisi, `values` hanya berisi dua nilai sementara query meminta `$3`, dan PostgreSQL menolak query tersebut.',
        'Yang boleh dirakit hanya bagian struktur query, yaitu kondisi mana yang dipakai. Nilai filter tidak pernah ditempel ke teks, walaupun hanya berasal dari dropdown admin.',
      ],
      terms: [
        {
          term: 'query dinamis',
          meaning:
            'Query yang teksnya dirakit oleh kode berdasarkan kondisi tertentu, misalnya filter yang diisi pengguna. Yang boleh berubah hanya struktur query-nya, seperti kondisi mana yang ikut. Nilai dari pengguna tetap masuk lewat parameter.',
        },
        {
          term: 'placeholder bernomor',
          meaning:
            'Di PostgreSQL, `$1` merujuk ke elemen pertama array parameter, `$2` ke elemen kedua, dan seterusnya. Karena itu nomor di teks query dan urutan isi `values` harus selalu cocok. Satu nomor yang meleset membuat nilai masuk ke kondisi yang salah.',
        },
        {
          term: 'falsy',
          meaning:
            'Nilai yang dianggap false oleh `if`, yaitu `0`, teks kosong, `null`, `undefined`, `NaN`, dan `false`. Memeriksa keberadaan data dengan `if (nilai)` ikut membuang nilai yang sah seperti angka nol.',
        },
      ],
    },
    rules: [
      'Nilai filter dikirim lewat `values`, tidak ditempel ke teks.',
      'Nomor placeholder urut tanpa loncat.',
      'Tanpa filter, query tidak memakai `WHERE`.',
    ],
    starter: `
      function buatQueryPesanan(filter) {
        // tulis kodemu di sini
      }
    `,
    hints: [
      'Siapkan dua array, `kondisi` untuk potongan teks dan `values` untuk nilainya.',
      'Masukkan nilai ke `values` lebih dulu. Setelah itu nomor placeholder-nya adalah `values.length`.',
      "Di akhir, tambahkan `WHERE` dan `kondisi.join(' AND ')` hanya kalau `kondisi.length > 0`.",
    ],
    solution: {
      code: `
        function buatQueryPesanan(filter) {
          const kondisi = [];
          const values = [];

          // Nilai dimasukkan dulu, lalu nomornya diambil dari panjang values.
          // Dengan begitu nomor placeholder selalu urut, berapa pun filter yang terisi.
          if (filter.status !== undefined) {
            values.push(filter.status);
            kondisi.push(\`status = $\${values.length}\`);
          }
          if (filter.minTotal !== undefined) { // !== undefined, supaya angka 0 tetap dipakai
            values.push(filter.minTotal);
            kondisi.push(\`total >= $\${values.length}\`);
          }
          if (filter.penggunaId !== undefined) {
            values.push(filter.penggunaId);
            kondisi.push(\`pengguna_id = $\${values.length}\`);
          }

          let text = 'SELECT id, total, status FROM pesanan';
          if (kondisi.length > 0) {
            text += ' WHERE ' + kondisi.join(' AND ');
          }
          text += ' ORDER BY id';

          return { text, values };
        }
      `,
      steps: [
        '`kondisi` menampung potongan teks seperti `status = $1`, sedangkan `values` menampung nilainya. Keduanya selalu diisi berpasangan.',
        'Setiap filter diperiksa dengan `!== undefined`, sehingga angka `0` tetap dianggap diisi.',
        '`values.push(...)` dijalankan lebih dulu, lalu nomor placeholder diambil dari `values.length`. Filter pertama yang terisi selalu mendapat `$1`, yang kedua `$2`, tanpa peduli filter mana saja yang dilewati.',
        '`WHERE` hanya ditambahkan kalau `kondisi` tidak kosong, lalu kondisi-kondisinya digabung dengan `AND`.',
        '`ORDER BY id` ditambahkan di akhir, sehingga urutan hasilnya selalu sama.',
      ],
      explanation:
        'Kuncinya adalah memisahkan dua hal yang dirakit. Teks query hanya berisi struktur dan placeholder, sedangkan semua nilai dari pengguna masuk ke `values`. Mengambil nomor dari `values.length` membuat keduanya tidak mungkin salah pasang, dan pola ini tetap benar walaupun nanti ada filter keempat atau kelima.',
    },
    alternativeSolutions: [
      `
        const ATURAN = [
          ['status', 'status ='],
          ['minTotal', 'total >='],
          ['penggunaId', 'pengguna_id ='],
        ];

        function buatQueryPesanan(filter) {
          const values = [];
          const kondisi = [];
          for (const [kunci, awalan] of ATURAN) {
            if (filter[kunci] === undefined) continue;
            values.push(filter[kunci]);
            kondisi.push(awalan + ' $' + values.length);
          }
          const where = kondisi.length ? \` WHERE \${kondisi.join(' AND ')}\` : '';
          return { text: \`SELECT id, total, status FROM pesanan\${where} ORDER BY id\`, values };
        }
      `,
      `
        function buatQueryPesanan({ status, minTotal, penggunaId }) {
          const values = [];
          const kondisi = [];
          const tambah = (bagian, nilai) => {
            values.push(nilai);
            kondisi.push(\`\${bagian} $\${values.length}\`);
          };
          if (status !== undefined) tambah('status =', status);
          if (minTotal !== undefined) tambah('total >=', minTotal);
          if (penggunaId !== undefined) tambah('pengguna_id =', penggunaId);

          const text = \`
            SELECT id, total, status
            FROM pesanan
            \${kondisi.length > 0 ? 'WHERE ' + kondisi.join(' AND ') : ''}
            ORDER BY id
          \`;
          return { text, values };
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function buatQueryPesanan(filter) {
            const kondisi = [];
            const values = [];
            if (filter.status) {
              values.push(filter.status);
              kondisi.push('status = $' + values.length);
            }
            if (filter.minTotal) {
              values.push(filter.minTotal);
              kondisi.push('total >= $' + values.length);
            }
            if (filter.penggunaId) {
              values.push(filter.penggunaId);
              kondisi.push('pengguna_id = $' + values.length);
            }
            let text = 'SELECT id, total, status FROM pesanan';
            if (kondisi.length > 0) text += ' WHERE ' + kondisi.join(' AND ');
            return { text: text + ' ORDER BY id', values };
          }
        `,
        reason:
          'Memeriksa filter dengan `if (filter.minTotal)`, sehingga filter total minimal `0` diam-diam hilang.',
      },
      {
        code: `
          function buatQueryPesanan(filter) {
            const kondisi = [];
            const values = [];
            if (filter.status !== undefined) {
              kondisi.push('status = $1');
              values.push(filter.status);
            }
            if (filter.minTotal !== undefined) {
              kondisi.push('total >= $2');
              values.push(filter.minTotal);
            }
            if (filter.penggunaId !== undefined) {
              kondisi.push('pengguna_id = $3');
              values.push(filter.penggunaId);
            }
            let text = 'SELECT id, total, status FROM pesanan';
            if (kondisi.length > 0) text += ' WHERE ' + kondisi.join(' AND ');
            return { text: text + ' ORDER BY id', values };
          }
        `,
        reason:
          'Nomor placeholder dipatok per filter. Kalau filter di tengah kosong, query meminta `$3` padahal `values` hanya berisi dua nilai.',
      },
      {
        code: `
          function buatQueryPesanan(filter) {
            const kondisi = [];
            if (filter.status !== undefined) kondisi.push(\`status = '\${filter.status}'\`);
            if (filter.minTotal !== undefined) kondisi.push(\`total >= \${filter.minTotal}\`);
            if (filter.penggunaId !== undefined) kondisi.push(\`pengguna_id = \${filter.penggunaId}\`);
            let text = 'SELECT id, total, status FROM pesanan';
            if (kondisi.length > 0) text += ' WHERE ' + kondisi.join(' AND ');
            return { text: text + ' ORDER BY id', values: [] };
          }
        `,
        reason:
          'Nilai filter ditempel langsung ke teks query, sehingga status berisi kutip bisa mengubah arti query. Ini SQL injection.',
      },
      {
        code: `
          function buatQueryPesanan(filter) {
            const kondisi = [];
            const values = [];
            for (const [kunci, kolom] of [['status', 'status ='], ['minTotal', 'total >='], ['penggunaId', 'pengguna_id =']]) {
              if (filter[kunci] === undefined) continue;
              values.push(filter[kunci]);
              kondisi.push(kolom + ' $' + values.length);
            }
            return {
              text: 'SELECT id, total, status FROM pesanan WHERE ' + kondisi.join(' AND ') + ' ORDER BY id',
              values,
            };
          }
        `,
        reason:
          '`WHERE` selalu ditulis. Tanpa filter, hasilnya `WHERE ORDER BY id`, dan PostgreSQL menolaknya sebagai syntax error.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `buatQueryPesanan`', '\\bbuatQueryPesanan\\b')],
      [
        nilai(
          'tanpa-filter',
          'Tanpa filter sama sekali',
          'rapikan(buatQueryPesanan({}))',
          { text: 'SELECT id, total, status FROM pesanan ORDER BY id', values: [] },
          { visible: true, prelude: RAPIKAN },
        ),
        nilai(
          'satu-filter',
          'Hanya filter status',
          "rapikan(buatQueryPesanan({ status: 'dikirim' }))",
          {
            text: 'SELECT id, total, status FROM pesanan WHERE status = $1 ORDER BY id',
            values: ['dikirim'],
          },
          { visible: true, prelude: RAPIKAN },
        ),
        nilai(
          'semua-filter',
          'Ketiga filter diisi',
          "rapikan(buatQueryPesanan({ status: 'selesai', minTotal: 50000, penggunaId: 7 }))",
          {
            text: 'SELECT id, total, status FROM pesanan WHERE status = $1 AND total >= $2 AND pengguna_id = $3 ORDER BY id',
            values: ['selesai', 50000, 7],
          },
          { visible: true, prelude: RAPIKAN },
        ),
        nilai(
          'nomor-tidak-loncat',
          'Filter di tengah kosong, nomornya tetap urut',
          "rapikan(buatQueryPesanan({ status: 'selesai', penggunaId: 7 }))",
          {
            text: 'SELECT id, total, status FROM pesanan WHERE status = $1 AND pengguna_id = $2 ORDER BY id',
            values: ['selesai', 7],
          },
          { prelude: RAPIKAN },
        ),
        nilai(
          'angka-nol',
          'Total minimal `0` tetap dipakai',
          'rapikan(buatQueryPesanan({ minTotal: 0 }))',
          {
            text: 'SELECT id, total, status FROM pesanan WHERE total >= $1 ORDER BY id',
            values: [0],
          },
          { prelude: RAPIKAN },
        ),
        nilai(
          'undefined-dilewati',
          'Filter bernilai `undefined` dilewati',
          'rapikan(buatQueryPesanan({ status: undefined, penggunaId: 3 }))',
          {
            text: 'SELECT id, total, status FROM pesanan WHERE pengguna_id = $1 ORDER BY id',
            values: [3],
          },
          { prelude: RAPIKAN },
        ),
        nilai(
          'nilai-berbahaya',
          'Status berisi potongan SQL tetap masuk ke `values`',
          `rapikan(buatQueryPesanan({ status: "x' OR '1'='1" }))`,
          {
            text: 'SELECT id, total, status FROM pesanan WHERE status = $1 ORDER BY id',
            values: ["x' OR '1'='1"],
          },
          { prelude: RAPIKAN },
        ),
      ],
    ),
  }),

  soal({
    slug: 'sql-baris-join-ke-objek',
    title: 'Susun hasil `JOIN` yang datar menjadi data bersarang',
    topic: 'sql',
    level: 'intermediate',
    realWorldUse:
      'Endpoint yang mengembalikan data beserta relasinya, misalnya pengguna beserta pesanannya, tanpa ORM. Satu query `JOIN` lalu disusun di kode jauh lebih cepat daripada satu query per pengguna.',
    source: SUMBER,
    brief: {
      situation:
        'Endpoint `GET /pengguna` harus mengembalikan setiap pengguna beserta daftar pesanannya. Datanya diambil dengan satu query `LEFT JOIN`, dan hasil JOIN selalu berbentuk datar. Pengguna yang punya tiga pesanan muncul di tiga baris, sedangkan pengguna tanpa pesanan muncul di satu baris dengan kolom pesanan bernilai `null`. Kamu perlu menyusun baris-baris datar itu menjadi data bersarang.',
      tasks: [
        'Buat fungsi `kelompokkanPesanan` yang menerima array `rows` hasil query di bawah.',
        'Kembalikan array pengguna dengan bentuk `{ id, nama, pesanan }`, dengan `pesanan` berisi array `{ id, total }`.',
        'Setiap pengguna hanya muncul SATU kali, dengan urutan sesuai kemunculan pertamanya di `rows`.',
        'Pengguna tanpa pesanan tetap ikut, dengan `pesanan` berupa array kosong.',
      ],
      given: QUERY_JOIN,
      pitfalls: [
        'Baris `LEFT JOIN` untuk pengguna tanpa pesanan tetap punya kolom `pesanan_id` dan `total`, hanya saja nilainya `null`. Kalau baris itu langsung dimasukkan, hasilnya `pesanan: [{ id: null, total: null }]`, padahal seharusnya array kosong.',
        'Menampung pengguna di objek biasa dengan id sebagai key, lalu memanggil `Object.values`, bisa mengacak urutan. JavaScript selalu mengurutkan key berupa angka dari kecil ke besar, sehingga urutan dari query hilang.',
      ],
      terms: [
        {
          term: 'hasil JOIN yang datar',
          meaning:
            'Hasil query SQL selalu berupa tabel, yaitu baris dan kolom tanpa struktur bersarang. Relasi satu ke banyak, seperti satu pengguna dengan banyak pesanan, muncul sebagai data pengguna yang berulang di setiap baris pesanannya.',
        },
        {
          term: 'Map',
          meaning:
            'Struktur data bawaan JavaScript untuk pasangan key dan nilai. Berbeda dengan objek biasa, `Map` mengingat urutan key dimasukkan dan menerima key angka tanpa mengubahnya menjadi teks. Method yang dipakai di sini adalah `get` dan `set`.',
        },
        {
          term: 'N+1 query',
          meaning:
            'Pola lambat ketika aplikasi menjalankan satu query untuk daftar pengguna, lalu satu query lagi untuk pesanan setiap pengguna. Seratus pengguna berarti 101 query. Satu query `JOIN` yang hasilnya disusun di kode, seperti di soal ini, adalah salah satu cara menghindarinya.',
        },
      ],
    },
    rules: [
      'Setiap pengguna muncul satu kali.',
      'Urutan mengikuti kemunculan pertama di `rows`.',
      'Pengguna tanpa pesanan punya `pesanan` berupa array kosong.',
    ],
    starter: `
      function kelompokkanPesanan(rows) {
        // tulis kodemu di sini
      }
    `,
    hints: [
      'Siapkan array `hasil` untuk urutan, dan `Map` untuk mencari pengguna yang sudah pernah dibuat berdasarkan id-nya.',
      'Untuk setiap baris, ambil penggunanya dari `Map`. Kalau belum ada, buat objek baru, simpan ke `Map`, dan masukkan ke `hasil`.',
      'Masukkan `{ id, total }` ke `pesanan` hanya kalau `baris.pesanan_id !== null`.',
    ],
    solution: {
      code: `
        function kelompokkanPesanan(rows) {
          const hasil = [];          // menjaga urutan kemunculan
          const perId = new Map();   // pengguna_id -> objek pengguna yang sama di dalam hasil

          for (const baris of rows) {
            let pengguna = perId.get(baris.pengguna_id);
            if (pengguna === undefined) {
              pengguna = { id: baris.pengguna_id, nama: baris.nama, pesanan: [] };
              perId.set(baris.pengguna_id, pengguna);
              hasil.push(pengguna);
            }

            // LEFT JOIN: pengguna tanpa pesanan tetap muncul, tapi kolom pesanannya null
            if (baris.pesanan_id !== null) {
              pengguna.pesanan.push({ id: baris.pesanan_id, total: baris.total });
            }
          }

          return hasil;
        }
      `,
      steps: [
        '`hasil` menyimpan pengguna sesuai urutan kemunculan pertamanya. `perId` dipakai untuk menemukan pengguna yang sudah dibuat, tanpa harus mencari satu per satu di `hasil`.',
        'Untuk setiap baris, `perId.get(...)` mencari penggunanya. Kalau belum ada, objek baru dibuat dengan `pesanan` kosong, lalu disimpan ke `perId` dan ke `hasil`.',
        'Objek yang sama disimpan di dua tempat. Menambah pesanan lewat `pengguna.pesanan.push(...)` otomatis terlihat juga di `hasil`.',
        '`baris.pesanan_id !== null` memastikan baris kosong dari `LEFT JOIN` tidak menjadi pesanan palsu.',
      ],
      explanation:
        'Bagian terpenting ada di pemeriksaan `pesanan_id !== null`. `LEFT JOIN` sengaja mempertahankan pengguna tanpa pesanan dengan mengisi kolom pesanan dengan NULL, dan tugas kode inilah menerjemahkan NULL itu kembali menjadi array kosong. `Map` dipilih karena ia mengingat urutan kemunculan, sedangkan objek biasa mengurutkan ulang key berupa angka.',
    },
    alternativeSolutions: [
      `
        function kelompokkanPesanan(rows) {
          const hasil = [];
          for (const baris of rows) {
            let pengguna = hasil.find((p) => p.id === baris.pengguna_id);
            if (pengguna === undefined) {
              pengguna = { id: baris.pengguna_id, nama: baris.nama, pesanan: [] };
              hasil.push(pengguna);
            }
            if (baris.pesanan_id != null) {
              pengguna.pesanan.push({ id: baris.pesanan_id, total: baris.total });
            }
          }
          return hasil;
        }
      `,
      `
        function kelompokkanPesanan(rows) {
          const perId = rows.reduce((peta, b) => {
            if (!peta.has(b.pengguna_id)) {
              peta.set(b.pengguna_id, { id: b.pengguna_id, nama: b.nama, pesanan: [] });
            }
            if (b.pesanan_id !== null) {
              peta.get(b.pengguna_id).pesanan.push({ id: b.pesanan_id, total: b.total });
            }
            return peta;
          }, new Map());
          return [...perId.values()];
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function kelompokkanPesanan(rows) {
            const perId = new Map();
            for (const b of rows) {
              if (!perId.has(b.pengguna_id)) {
                perId.set(b.pengguna_id, { id: b.pengguna_id, nama: b.nama, pesanan: [] });
              }
              perId.get(b.pengguna_id).pesanan.push({ id: b.pesanan_id, total: b.total });
            }
            return [...perId.values()];
          }
        `,
        reason:
          'Baris kosong dari `LEFT JOIN` ikut dimasukkan, sehingga pengguna tanpa pesanan mendapat pesanan palsu berisi `null`.',
      },
      {
        code: `
          function kelompokkanPesanan(rows) {
            const perId = {};
            for (const b of rows) {
              perId[b.pengguna_id] ??= { id: b.pengguna_id, nama: b.nama, pesanan: [] };
              if (b.pesanan_id !== null) {
                perId[b.pengguna_id].pesanan.push({ id: b.pesanan_id, total: b.total });
              }
            }
            return Object.values(perId);
          }
        `,
        reason:
          'Objek biasa mengurutkan ulang key berupa angka, sehingga urutan pengguna dari query berubah.',
      },
      {
        code: `
          function kelompokkanPesanan(rows) {
            return rows.map((b) => ({
              id: b.pengguna_id,
              nama: b.nama,
              pesanan: b.pesanan_id === null ? [] : [{ id: b.pesanan_id, total: b.total }],
            }));
          }
        `,
        reason:
          'Tidak mengelompokkan sama sekali, sehingga pengguna dengan tiga pesanan muncul tiga kali.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `kelompokkanPesanan`', '\\bkelompokkanPesanan\\b')],
      [
        nilai(
          'contoh',
          'Satu pengguna dengan dua pesanan, satu tanpa pesanan',
          'kelompokkanPesanan(rows)',
          [
            {
              id: 1,
              nama: 'Ana',
              pesanan: [
                { id: 10, total: 50000 },
                { id: 11, total: 75000 },
              ],
            },
            { id: 2, nama: 'Budi', pesanan: [] },
          ],
          {
            visible: true,
            prelude: `
              const rows = [
                { pengguna_id: 1, nama: 'Ana', pesanan_id: 10, total: 50000 },
                { pengguna_id: 1, nama: 'Ana', pesanan_id: 11, total: 75000 },
                { pengguna_id: 2, nama: 'Budi', pesanan_id: null, total: null },
              ];
            `,
          },
        ),
        nilai(
          'urutan-kemunculan',
          'Urutan mengikuti kemunculan pertama, bukan besar kecilnya id',
          `
            kelompokkanPesanan([
              { pengguna_id: 5, nama: 'Eka', pesanan_id: 30, total: 10000 },
              { pengguna_id: 2, nama: 'Budi', pesanan_id: 31, total: 20000 },
              { pengguna_id: 5, nama: 'Eka', pesanan_id: 32, total: 30000 },
            ]).map((p) => [p.id, p.pesanan.length])
          `,
          [
            [5, 2],
            [2, 1],
          ],
        ),
        nilai(
          'semua-tanpa-pesanan',
          'Semua pengguna belum punya pesanan',
          `
            kelompokkanPesanan([
              { pengguna_id: 3, nama: 'Citra', pesanan_id: null, total: null },
              { pengguna_id: 4, nama: 'Dodi', pesanan_id: null, total: null },
            ])
          `,
          [
            { id: 3, nama: 'Citra', pesanan: [] },
            { id: 4, nama: 'Dodi', pesanan: [] },
          ],
        ),
        nilai('tanpa-baris', 'Query tidak mengembalikan baris', 'kelompokkanPesanan([])', []),
      ],
    ),
  }),

  soal({
    slug: 'sql-transaksi-transfer',
    title: 'Bungkus transfer saldo dalam transaksi',
    topic: 'sql',
    level: 'intermediate',
    realWorldUse:
      'Setiap operasi yang mengubah lebih dari satu baris dan tidak boleh berhenti di tengah jalan, seperti transfer saldo, checkout yang mengurangi stok, atau pendaftaran yang mengisi dua tabel sekaligus.',
    source: SUMBER,
    brief: {
      situation:
        'Aplikasi dompet digital punya fitur transfer saldo. Satu transfer berarti dua perubahan, yaitu saldo pengirim dikurangi lalu saldo penerima ditambah. Kalau perubahan pertama berhasil tapi yang kedua gagal, uang pengirim hilang begitu saja tanpa pernah sampai ke penerima. Kedua perubahan itu harus berhasil bersama, atau gagal bersama tanpa meninggalkan jejak.',
      tasks: [
        'Buat fungsi async `transferSaldo(pool, dariId, keId, jumlah)`.',
        'Pinjam satu koneksi dengan `await pool.connect()`, lalu jalankan semua query lewat koneksi itu.',
        'Jalankan `BEGIN`, lalu `UPDATE` yang mengurangi saldo pengirim, lalu `UPDATE` yang menambah saldo penerima, lalu `COMMIT`.',
        'Kalau ada query yang gagal, jalankan `ROLLBACK`, lalu lempar ulang error aslinya.',
        'Apa pun hasilnya, kembalikan koneksi ke pool dengan `client.release()`.',
        'Kirim jumlah dan id sebagai parameter seperti `$1` dan `$2`, bukan ditempel ke teks query.',
      ],
      given: SKEMA_DOMPET,
      pitfalls: [
        "`pool.query('BEGIN')` meminjam koneksi yang bisa berbeda setiap kali dipanggil. Akibatnya `BEGIN`, `UPDATE`, dan `COMMIT` bisa berjalan di koneksi yang berbeda-beda, dan transaksinya tidak membungkus apa pun. Semua query transaksi harus lewat `client` yang sama.",
        'Koneksi yang tidak dikembalikan dengan `release()` tidak bisa dipakai request lain. Pool bawaan library `pg` hanya punya 10 koneksi, jadi setelah sepuluh transfer gagal tanpa `release()`, request berikutnya menunggu tanpa batas waktu.',
        'Jangan menelan error di `catch`. Setelah `ROLLBACK`, lempar ulang error-nya supaya pemanggil tahu transfer gagal dan bisa memberi tahu pengguna.',
      ],
      terms: [
        {
          term: 'transaksi',
          meaning:
            'Sekumpulan query yang diperlakukan sebagai satu kesatuan. Semuanya tersimpan bersama saat `COMMIT`, atau semuanya dibatalkan saat `ROLLBACK`. Query lain tidak pernah melihat keadaan setengah jadi di antaranya.',
        },
        {
          term: 'BEGIN, COMMIT, ROLLBACK',
          meaning:
            '`BEGIN` membuka transaksi. `COMMIT` menyimpan semua perubahan di dalamnya secara permanen. `ROLLBACK` membatalkan semua perubahan sejak `BEGIN`, seolah query-query itu tidak pernah dijalankan.',
        },
        {
          term: 'connection pool',
          meaning:
            'Kumpulan koneksi database yang dibuka sekali lalu dipakai bergantian oleh banyak request. `pool.connect()` meminjam satu koneksi, dan `client.release()` mengembalikannya supaya bisa dipinjam request berikutnya.',
        },
        {
          term: 'CHECK constraint',
          meaning:
            'Aturan di skema tabel yang ditegakkan oleh database sendiri. `CHECK (saldo >= 0)` membuat `UPDATE` yang menghasilkan saldo minus gagal dengan error. Error inilah yang memicu `ROLLBACK` saat saldo pengirim tidak cukup.',
        },
        {
          term: 'finally',
          meaning:
            'Blok yang selalu dijalankan setelah `try` dan `catch`, baik kodenya berhasil maupun gagal, bahkan saat `catch` melempar ulang error. Karena itu `release()` ditaruh di `finally`, supaya koneksi selalu kembali ke pool.',
        },
      ],
    },
    rules: [
      'Semua query lewat satu `client` dari `pool.connect()`.',
      '`ROLLBACK` saat gagal, lalu error dilempar ulang.',
      '`release()` dipanggil baik saat berhasil maupun gagal.',
    ],
    starter: `
      async function transferSaldo(pool, dariId, keId, jumlah) {
        // tulis kodemu di sini
      }
    `,
    hints: [
      'Susunannya `const client = await pool.connect()`, lalu `try { ... } catch (err) { ... } finally { ... }`.',
      'Di dalam `try`, jalankan `BEGIN`, dua `UPDATE`, dan `COMMIT`. Di dalam `catch`, jalankan `ROLLBACK` lalu `throw err`.',
      'Di dalam `finally`, panggil `client.release()`.',
    ],
    solution: {
      code: `
        async function transferSaldo(pool, dariId, keId, jumlah) {
          // Pinjam SATU koneksi. Semua query transaksi harus lewat koneksi yang sama.
          const client = await pool.connect();

          try {
            await client.query('BEGIN');
            await client.query(
              'UPDATE dompet SET saldo = saldo - $1 WHERE pengguna_id = $2',
              [jumlah, dariId],
            );
            await client.query(
              'UPDATE dompet SET saldo = saldo + $1 WHERE pengguna_id = $2',
              [jumlah, keId],
            );
            await client.query('COMMIT'); // simpan kedua perubahan sekaligus
          } catch (err) {
            await client.query('ROLLBACK'); // batalkan semua perubahan sejak BEGIN
            throw err; // lempar ulang, supaya pemanggil tahu transfer gagal
          } finally {
            client.release(); // selalu dikembalikan, berhasil ataupun gagal
          }
        }
      `,
      steps: [
        '`await pool.connect()` meminjam satu koneksi. Transaksi di PostgreSQL melekat pada koneksi, jadi semua query sesudahnya harus lewat `client` ini.',
        '`BEGIN` membuka transaksi. Dua `UPDATE` sesudahnya belum terlihat oleh koneksi lain selama transaksi belum di-`COMMIT`.',
        'Kalau saldo pengirim tidak cukup, `CHECK (saldo >= 0)` membuat `UPDATE` pertama gagal, dan eksekusi langsung melompat ke `catch`.',
        '`ROLLBACK` di dalam `catch` membatalkan semua perubahan sejak `BEGIN`. `throw err` meneruskan error aslinya ke pemanggil.',
        '`finally` selalu dijalankan, sehingga `client.release()` mengembalikan koneksi ke pool, baik transfer berhasil maupun gagal.',
      ],
      explanation:
        'Ada tiga bagian yang masing-masing menutup satu jenis bug. Satu `client` memastikan semua query benar-benar berada di transaksi yang sama. `ROLLBACK` lalu `throw` memastikan kegagalan tidak meninggalkan data setengah jadi dan tetap terdengar oleh pemanggil. `finally` memastikan koneksi tidak bocor, karena koneksi yang bocor baru ketahuan saat aplikasi macet di jam sibuk.',
    },
    alternativeSolutions: [
      `
        async function transferSaldo(pool, dariId, keId, jumlah) {
          const client = await pool.connect();
          try {
            await client.query('begin');
            for (const [perubahan, id] of [[-jumlah, dariId], [jumlah, keId]]) {
              await client.query('UPDATE dompet SET saldo = saldo + $1 WHERE pengguna_id = $2', [perubahan, id]);
            }
            await client.query('commit');
          } catch (error) {
            await client.query('rollback');
            throw error;
          } finally {
            client.release();
          }
        }
      `,
      `
        async function transferSaldo(pool, dariId, keId, jumlah) {
          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            await client.query('UPDATE dompet SET saldo = saldo - $2 WHERE pengguna_id = $1', [dariId, jumlah]);
            await client.query('UPDATE dompet SET saldo = saldo + $2 WHERE pengguna_id = $1', [keId, jumlah]);
            await client.query('COMMIT');
          } catch (err) {
            await client.query('ROLLBACK');
            client.release();
            throw err;
          }
          client.release();
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          async function transferSaldo(pool, dariId, keId, jumlah) {
            const client = await pool.connect();
            await client.query('BEGIN');
            await client.query('UPDATE dompet SET saldo = saldo - $1 WHERE pengguna_id = $2', [jumlah, dariId]);
            await client.query('UPDATE dompet SET saldo = saldo + $1 WHERE pengguna_id = $2', [jumlah, keId]);
            await client.query('COMMIT');
            client.release();
          }
        `,
        reason:
          'Tanpa `try` dan `catch`, kegagalan tidak memicu `ROLLBACK`, dan koneksinya tidak pernah dikembalikan ke pool.',
      },
      {
        code: `
          async function transferSaldo(pool, dariId, keId, jumlah) {
            try {
              await pool.query('BEGIN');
              await pool.query('UPDATE dompet SET saldo = saldo - $1 WHERE pengguna_id = $2', [jumlah, dariId]);
              await pool.query('UPDATE dompet SET saldo = saldo + $1 WHERE pengguna_id = $2', [jumlah, keId]);
              await pool.query('COMMIT');
            } catch (err) {
              await pool.query('ROLLBACK');
              throw err;
            }
          }
        `,
        reason:
          'Memakai `pool.query` untuk setiap perintah, sehingga `BEGIN`, `UPDATE`, dan `COMMIT` bisa berjalan di koneksi yang berbeda dan transaksinya tidak membungkus apa pun.',
      },
      {
        code: `
          async function transferSaldo(pool, dariId, keId, jumlah) {
            const client = await pool.connect();
            try {
              await client.query('BEGIN');
              await client.query('UPDATE dompet SET saldo = saldo - $1 WHERE pengguna_id = $2', [jumlah, dariId]);
              await client.query('UPDATE dompet SET saldo = saldo + $1 WHERE pengguna_id = $2', [jumlah, keId]);
              await client.query('COMMIT');
              return true;
            } catch (err) {
              await client.query('ROLLBACK');
              return false;
            } finally {
              client.release();
            }
          }
        `,
        reason:
          'Error-nya ditelan dan diganti `false`, sehingga pemanggil tidak pernah tahu kenapa transfer gagal.',
      },
      {
        code: `
          async function transferSaldo(pool, dariId, keId, jumlah) {
            const client = await pool.connect();
            try {
              await client.query('BEGIN');
              await client.query('UPDATE dompet SET saldo = saldo - $1 WHERE pengguna_id = $2', [jumlah, dariId]);
              await client.query('UPDATE dompet SET saldo = saldo + $1 WHERE pengguna_id = $2', [jumlah, keId]);
              await client.query('COMMIT');
              client.release();
            } catch (err) {
              await client.query('ROLLBACK');
              throw err;
            }
          }
        `,
        reason:
          '`release()` hanya dipanggil saat berhasil. Setiap transfer yang gagal membuat satu koneksi bocor sampai pool kehabisan koneksi.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `transferSaldo`', '\\btransferSaldo\\b')],
      [
        nilai(
          'berhasil',
          'Transfer berhasil',
          `
            (async () => {
              const pool = buatPool();
              await transferSaldo(pool, 11, 22, 500);
              return { log: pool.log, dilepas: pool.dilepas };
            })()
          `,
          { log: ['BEGIN', 'UPDATE', 'UPDATE', 'COMMIT'], dilepas: 1 },
          { visible: true, prelude: POOL_PALSU },
        ),
        nilai(
          'gagal-update-pertama',
          'Saldo pengirim tidak cukup, jadi `UPDATE` pertama gagal',
          `
            (async () => {
              const pool = buatPool(2); // query ke-2, yaitu UPDATE pertama, akan gagal
              let pesan = null;
              try {
                await transferSaldo(pool, 11, 22, 999999);
              } catch (err) {
                pesan = err.message;
              }
              return { pesan, log: pool.log, dilepas: pool.dilepas };
            })()
          `,
          {
            pesan: 'new row for relation "dompet" violates check constraint "dompet_saldo_check"',
            log: ['BEGIN', 'UPDATE', 'ROLLBACK'],
            dilepas: 1,
          },
          { visible: true, prelude: POOL_PALSU },
        ),
        nilai(
          'gagal-update-kedua',
          '`UPDATE` kedua gagal setelah yang pertama berhasil',
          `
            (async () => {
              const pool = buatPool(3);
              let pesan = null;
              try {
                await transferSaldo(pool, 11, 22, 500);
              } catch (err) {
                pesan = err.message;
              }
              return { gagal: pesan !== null, log: pool.log, dilepas: pool.dilepas };
            })()
          `,
          { gagal: true, log: ['BEGIN', 'UPDATE', 'UPDATE', 'ROLLBACK'], dilepas: 1 },
          { prelude: POOL_PALSU },
        ),
        nilai(
          'lewat-parameter',
          'Jumlah dan id dikirim sebagai parameter',
          `
            (async () => {
              const pool = buatPool();
              await transferSaldo(pool, 11, 22, 500);
              const update = pool.kiriman.filter((k) => k.text.trim().toUpperCase().startsWith('UPDATE'));
              return {
                jumlahUpdate: update.length,
                angkaDiTeks: update.some((k) => ['500', '11', '22'].some((n) => k.text.includes(n))),
                idTerkirim: update
                  .map((k) => (k.values.includes(11) ? 11 : k.values.includes(22) ? 22 : null))
                  .sort((a, b) => a - b),
              };
            })()
          `,
          { jumlahUpdate: 2, angkaDiTeks: false, idTerkirim: [11, 22] },
          { prelude: POOL_PALSU },
        ),
      ],
    ),
  }),

  soal({
    slug: 'sql-keyset-pagination',
    title: 'Keyset pagination dengan `limit + 1`',
    topic: 'sql',
    level: 'intermediate',
    realWorldUse:
      'Infinite scroll di aplikasi mobile, feed, riwayat transaksi, dan API dengan `nextCursor`. Cara ini tetap cepat di halaman yang dalam dan tidak menampilkan data dobel saat ada data baru masuk.',
    source: SUMBER,
    brief: {
      situation:
        'Aplikasi mobile menampilkan riwayat pesanan dengan infinite scroll, yaitu 10 pesanan terbaru lebih dulu, lalu 10 berikutnya setiap kali pengguna menggulir ke bawah. `LIMIT` dan `OFFSET` makin lambat di halaman yang dalam, dan bisa menampilkan pesanan dobel saat ada pesanan baru masuk di tengah jalan. Solusinya adalah keyset pagination, yaitu melanjutkan dari id terakhir yang sudah ditampilkan.',
      tasks: [
        'Buat fungsi async `ambilHalaman(db, cursor, limit)`. Untuk halaman pertama, `cursor` bernilai `null`.',
        'Jalankan query di bawah lewat `db.query` dengan values `[cursor, limit + 1]`.',
        'Kembalikan `{ data, nextCursor }`, dengan `data` berisi paling banyak `limit` pesanan.',
        '`nextCursor` berisi `id` pesanan terakhir di `data` kalau masih ada halaman berikutnya, atau `null` kalau sudah habis.',
      ],
      given: QUERY_KEYSET,
      pitfalls: [
        'Mengambil tepat `limit` baris tidak cukup untuk tahu apakah masih ada sisa. Kalau sisa datanya pas sepuluh, halaman ini terlihat penuh, lalu halaman berikutnya kosong. Ambil `limit + 1` baris, dan baris ke-11 hanya dipakai sebagai tanda bahwa masih ada lanjutan.',
        'Baris cadangan itu jangan ikut dikirim di `data`, dan jangan dipakai sebagai cursor. Cursor-nya adalah id baris TERAKHIR yang ditampilkan, karena query berikutnya mencari `id < cursor`.',
        'Keyset pagination butuh urutan yang unik dan tetap. `ORDER BY id DESC` memenuhinya karena tidak ada dua pesanan dengan `id` yang sama.',
      ],
      terms: [
        {
          term: 'keyset pagination',
          meaning:
            'Pagination yang melanjutkan dari nilai kolom baris terakhir, misalnya `WHERE id < 16`, bukan dengan melewati sejumlah baris. Database langsung melompat ke titik itu memakai index, sehingga halaman ke-1000 secepat halaman pertama.',
        },
        {
          term: 'cursor',
          meaning:
            'Penanda posisi terakhir yang sudah dibaca, di sini `id` pesanan terakhir di halaman sebelumnya. Frontend menyimpan `nextCursor` dari response, lalu mengirimnya kembali saat meminta halaman berikutnya.',
        },
        {
          term: 'infinite scroll',
          meaning:
            'Pola tampilan yang memuat data tambahan secara otomatis saat pengguna menggulir mendekati bagian bawah, tanpa tombol nomor halaman. Pola ini hanya perlu tahu ada lanjutan atau tidak, bukan jumlah total halaman, sehingga cocok dengan keyset pagination.',
        },
        {
          term: 'kenapa OFFSET melambat',
          meaning:
            '`OFFSET 100000` tetap membuat database membaca lalu membuang seratus ribu baris sebelum mengambil sepuluh baris yang diminta. Makin dalam halamannya, makin banyak baris yang dibaca sia-sia. Keyset tidak punya masalah ini karena langsung melompat lewat index.',
        },
      ],
    },
    rules: [
      'Meminta `limit + 1` baris ke database.',
      '`data` berisi paling banyak `limit` baris.',
      '`nextCursor` adalah id terakhir di `data`, atau `null` kalau habis.',
    ],
    starter: `
      async function ambilHalaman(db, cursor, limit) {
        // tulis kodemu di sini
      }
    `,
    hints: [
      'Jalankan `await db.query(teksQuery, [cursor, limit + 1])` dan ambil `rows` dari hasilnya.',
      'Masih ada halaman berikutnya kalau `rows.length > limit`.',
      '`data` adalah `rows.slice(0, limit)`, dan `nextCursor` adalah `id` elemen terakhir `data`.',
    ],
    solution: {
      code: `
        async function ambilHalaman(db, cursor, limit) {
          // Ambil SATU baris lebih banyak, hanya untuk tahu masih ada lanjutan atau tidak.
          const { rows } = await db.query(
            \`SELECT id, total FROM pesanan
             WHERE ($1::int IS NULL OR id < $1)
             ORDER BY id DESC
             LIMIT $2\`,
            [cursor, limit + 1],
          );

          const data = rows.slice(0, limit); // baris cadangan tidak ikut dikirim
          const adaLanjutan = rows.length > limit;

          // Cursor berikutnya adalah id baris TERAKHIR yang ditampilkan.
          const nextCursor = adaLanjutan ? data[data.length - 1].id : null;
          return { data, nextCursor };
        }
      `,
      steps: [
        'Query dikirim dengan values `[cursor, limit + 1]`. Untuk halaman pertama `cursor` bernilai `null`, sehingga syarat `id < $1` dilewati.',
        '`rows.slice(0, limit)` mengambil paling banyak `limit` baris untuk ditampilkan. Baris cadangan ke-11, kalau ada, tidak ikut.',
        '`rows.length > limit` bernilai benar hanya kalau baris cadangan ikut terambil, yang berarti masih ada data sesudah halaman ini.',
        '`nextCursor` diisi id baris terakhir di `data`. Query berikutnya mencari `id < nextCursor`, sehingga lanjut tepat setelah baris itu.',
      ],
      explanation:
        'Trik `limit + 1` menjawab pertanyaan masih ada lanjutan atau tidak, tanpa query `COUNT` terpisah. Tanpa trik itu, halaman yang kebetulan pas berisi `limit` baris terlihat seperti punya lanjutan, dan pengguna menggulir ke halaman kosong. Menghitung ulang dari baris cadangan juga murah, karena hanya satu baris ekstra yang ikut terbaca.',
    },
    alternativeSolutions: [
      `
        async function ambilHalaman(db, cursor, limit) {
          const hasil = cursor === null
            ? await db.query('SELECT id, total FROM pesanan ORDER BY id DESC LIMIT $1', [limit + 1])
            : await db.query(
                'SELECT id, total FROM pesanan WHERE id < $1 ORDER BY id DESC LIMIT $2',
                [cursor, limit + 1],
              );

          const adaLanjutan = hasil.rows.length > limit;
          const data = adaLanjutan ? hasil.rows.slice(0, -1) : hasil.rows;
          return { data, nextCursor: adaLanjutan ? data.at(-1).id : null };
        }
      `,
      `
        async function ambilHalaman(db, cursor, limit) {
          const { rows } = await db.query(
            'SELECT id, total FROM pesanan WHERE ($1::int IS NULL OR id < $1) ORDER BY id DESC LIMIT $2',
            [cursor, limit + 1],
          );
          const adaLanjutan = rows.length > limit;
          if (adaLanjutan) rows.pop(); // buang baris cadangan
          return { data: rows, nextCursor: adaLanjutan ? rows[rows.length - 1].id : null };
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          async function ambilHalaman(db, cursor, limit) {
            const { rows } = await db.query(
              'SELECT id, total FROM pesanan WHERE ($1::int IS NULL OR id < $1) ORDER BY id DESC LIMIT $2',
              [cursor, limit],
            );
            return { data: rows, nextCursor: rows.length === limit ? rows[limit - 1].id : null };
          }
        `,
        reason:
          'Hanya mengambil `limit` baris. Saat sisa data pas sepuluh, `nextCursor` tetap terisi dan pengguna diarahkan ke halaman kosong.',
      },
      {
        code: `
          async function ambilHalaman(db, cursor, limit) {
            const { rows } = await db.query(
              'SELECT id, total FROM pesanan WHERE ($1::int IS NULL OR id < $1) ORDER BY id DESC LIMIT $2',
              [cursor, limit + 1],
            );
            const data = rows.slice(0, limit);
            return { data, nextCursor: rows.length > limit ? rows[limit].id : null };
          }
        `,
        reason:
          'Cursor diambil dari baris cadangan, bukan baris terakhir yang ditampilkan, sehingga pesanan itu terlewat di halaman berikutnya.',
      },
      {
        code: `
          async function ambilHalaman(db, cursor, limit) {
            const { rows } = await db.query(
              'SELECT id, total FROM pesanan WHERE ($1::int IS NULL OR id < $1) ORDER BY id DESC LIMIT $2',
              [cursor, limit + 1],
            );
            return { data: rows, nextCursor: rows.length > limit ? rows[limit - 1].id : null };
          }
        `,
        reason:
          'Baris cadangan ikut dikirim di `data`, sehingga setiap halaman berisi 11 pesanan dan satu di antaranya muncul lagi di halaman berikutnya.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `ambilHalaman`', '\\bambilHalaman\\b')],
      [
        nilai(
          'halaman-pertama',
          'Halaman pertama dari 25 pesanan',
          `
            (async () => {
              const h = await ambilHalaman(buatDb(semua), null, 10);
              return { ids: h.data.map((p) => p.id), nextCursor: h.nextCursor };
            })()
          `,
          { ids: [25, 24, 23, 22, 21, 20, 19, 18, 17, 16], nextCursor: 16 },
          { visible: true, prelude: DB_KEYSET },
        ),
        nilai(
          'halaman-kedua',
          'Halaman kedua, melanjutkan dari cursor 16',
          `
            (async () => {
              const h = await ambilHalaman(buatDb(semua), 16, 10);
              return { ids: h.data.map((p) => p.id), nextCursor: h.nextCursor };
            })()
          `,
          { ids: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6], nextCursor: 6 },
          { visible: true, prelude: DB_KEYSET },
        ),
        nilai(
          'halaman-terakhir',
          'Halaman terakhir yang tidak penuh',
          `
            (async () => {
              const h = await ambilHalaman(buatDb(semua), 6, 10);
              return { ids: h.data.map((p) => p.id), nextCursor: h.nextCursor };
            })()
          `,
          { ids: [5, 4, 3, 2, 1], nextCursor: null },
          { prelude: DB_KEYSET },
        ),
        nilai(
          'sisa-pas-sepuluh',
          'Sisa data pas sebanyak `limit`',
          `
            (async () => {
              const h = await ambilHalaman(buatDb(semua.slice(0, 10)), null, 10);
              return { jumlah: h.data.length, nextCursor: h.nextCursor };
            })()
          `,
          { jumlah: 10, nextCursor: null },
          { prelude: DB_KEYSET },
        ),
        nilai(
          'minta-satu-lebih',
          'Meminta `limit + 1` baris ke database',
          `
            (async () => {
              const db = buatDb(semua);
              await ambilHalaman(db, null, 10);
              return db.kiriman[0].values.at(-1);
            })()
          `,
          11,
          { prelude: DB_KEYSET },
        ),
        nilai(
          'isi-baris-utuh',
          'Isi setiap baris tidak berubah',
          '(async () => (await ambilHalaman(buatDb(semua), null, 2)).data)()',
          [
            { id: 25, total: 25000 },
            { id: 24, total: 24000 },
          ],
          { prelude: DB_KEYSET },
        ),
        nilai(
          'tabel-kosong',
          'Belum ada pesanan sama sekali',
          '(async () => await ambilHalaman(buatDb([]), null, 10))()',
          { data: [], nextCursor: null },
          { prelude: DB_KEYSET },
        ),
      ],
    ),
  }),
];
