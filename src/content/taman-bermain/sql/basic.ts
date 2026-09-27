import {
  larangStruktur,
  mesinStruktur,
  soal,
  urutStruktur,
  wajibStruktur,
} from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';
import { kolomDiSelect } from './pola';
import { SKEMA_TOKO } from './skema';

/**
 * SQL — Basic. The five statements written most often in any backend: read with a filter, insert
 * and get the new id back, change one row, count per group, and fetch one page.
 *
 * Graded structurally, with keywords case-insensitive and string contents exact, the way
 * PostgreSQL compares them (see `checkStructure`). Each exercise carries the
 * PostgreSQL trap that a passing happy path hides: double quotes that name a column instead of a
 * string, an `UPDATE` with no `WHERE`, `MAX(id)` racing another insert, a non-aggregated column
 * without `GROUP BY`, and pages that overlap because nothing fixed their order.
 */

const SUMBER = { category: 'backend-basic', chapter: 'database-sql-dasar' } as const;

export const exercises: Exercise[] = [
  soal({
    slug: 'sql-select-where-order',
    title: '`SELECT` dengan `WHERE`, `ORDER BY`, dan `LIMIT`',
    topic: 'sql',
    level: 'basic',
    realWorldUse:
      'Hampir setiap halaman daftar di aplikasi dimulai dari query seperti ini, yaitu mengambil beberapa kolom, menyaring, mengurutkan, lalu membatasi jumlahnya.',
    source: SUMBER,
    brief: {
      situation:
        'Tim pemasaran ingin mengirim undangan acara ke pengguna yang tinggal di Bandung. Mereka butuh daftar nama dan email, diurutkan dari A sampai Z, dan untuk tahap pertama cukup sepuluh orang dulu. Datanya ada di tabel `pengguna` yang strukturnya bisa kamu lihat di bawah.',
      tasks: [
        'Tulis satu query `SELECT` yang mengambil kolom `nama` dan `email` dari tabel `pengguna`.',
        'Saring hanya pengguna dengan `kota` bernilai `Bandung`.',
        'Urutkan berdasarkan `nama` dari A ke Z.',
        'Batasi hasilnya paling banyak 10 baris.',
      ],
      given: SKEMA_TOKO,
      pitfalls: [
        'Di PostgreSQL, teks ditulis dengan kutip TUNGGAL, yaitu `\'Bandung\'`. Kutip ganda seperti `"Bandung"` berarti nama kolom, sehingga database mencari kolom bernama Bandung dan gagal dengan error `column "Bandung" does not exist`.',
        'Sebut kolom yang dibutuhkan saja, jangan `SELECT *`. Kolom yang tidak diminta ikut terkirim lewat jaringan, dan kolom baru yang ditambahkan nanti ikut terbawa tanpa ada yang memutuskannya.',
        'Urutan klausa di SQL tetap, yaitu `WHERE` lalu `ORDER BY` lalu `LIMIT`. Menukar urutannya menghasilkan syntax error.',
        "Kata kunci SQL boleh ditulis huruf besar atau kecil, tapi isi teks tidak. `'bandung'` tidak sama dengan `'Bandung'`, sehingga query dengan huruf yang salah berjalan tanpa error dan mengembalikan nol baris.",
      ],
      terms: [
        {
          term: 'SELECT',
          meaning:
            'Perintah SQL untuk membaca data dari tabel. Bentuk dasarnya `SELECT kolom1, kolom2 FROM tabel`. Perintah ini tidak mengubah apa pun di database, ia hanya mengembalikan baris yang cocok.',
        },
        {
          term: 'WHERE',
          meaning:
            "Klausa untuk menyaring baris berdasarkan syarat. Hanya baris yang syaratnya bernilai benar yang dikembalikan. Contohnya `WHERE kota = 'Bandung'` membuang semua pengguna yang kotanya bukan Bandung.",
        },
        {
          term: 'ORDER BY dan LIMIT',
          meaning:
            '`ORDER BY nama` mengurutkan hasil berdasarkan kolom `nama`, dari kecil ke besar secara bawaan, dan `DESC` membaliknya. `LIMIT 10` memotong hasil menjadi paling banyak 10 baris. Keduanya dijalankan setelah penyaringan `WHERE`.',
        },
        {
          term: '\'teks\' vs "nama"',
          meaning:
            'Di PostgreSQL, kutip tunggal menandai nilai teks, sedangkan kutip ganda menandai nama kolom atau tabel. Ini berbeda dengan MySQL yang menerima keduanya untuk teks, dan perbedaan inilah yang sering membuat orang yang pindah ke PostgreSQL bingung.',
        },
      ],
    },
    rules: [
      'Mengambil kolom `nama` dan `email`, tanpa `SELECT *`.',
      "Menyaring `kota` dengan teks `'Bandung'` dalam kutip tunggal.",
      'Diurutkan berdasarkan `nama`.',
      'Dibatasi 10 baris.',
    ],
    starter: `
      -- tulis query di sini
    `,
    hints: [
      'Mulai dari `SELECT nama, email FROM pengguna`.',
      "Tambahkan `WHERE kota = 'Bandung'` dengan kutip tunggal.",
      'Akhiri dengan `ORDER BY nama LIMIT 10;`.',
    ],
    solution: {
      code: `
        -- Ambil kolom yang dibutuhkan saja, bukan SELECT *
        SELECT nama, email
        FROM pengguna
        WHERE kota = 'Bandung'   -- kutip TUNGGAL untuk teks
        ORDER BY nama            -- A ke Z
        LIMIT 10;                -- paling banyak 10 baris
      `,
      steps: [
        '`SELECT nama, email` menyebut dua kolom yang ingin diambil.',
        '`FROM pengguna` menentukan tabel sumbernya.',
        "`WHERE kota = 'Bandung'` menyaring baris. Kutip tunggal menandai bahwa `Bandung` adalah teks, bukan nama kolom.",
        '`ORDER BY nama` mengurutkan hasil saringan itu dari A ke Z.',
        '`LIMIT 10` memotong hasil yang sudah terurut menjadi paling banyak 10 baris.',
      ],
      explanation:
        'Kutip tunggal di `\'Bandung\'` adalah bagian yang paling sering salah pada orang yang baru pindah ke PostgreSQL. Kutip ganda di PostgreSQL berarti nama kolom, jadi `"Bandung"` membuat database mencari kolom bernama Bandung lalu gagal. Aturannya sederhana, teks selalu kutip tunggal.',
    },
    alternativeSolutions: [
      `
        select nama, email from pengguna where kota = 'Bandung' order by nama asc limit 10;
      `,
      `
        SELECT p.email, p.nama
        FROM pengguna AS p
        WHERE p.kota = 'Bandung'
        ORDER BY p.nama
        LIMIT 10;
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          SELECT * FROM pengguna WHERE kota = 'Bandung' ORDER BY nama LIMIT 10;
        `,
        reason:
          'Memakai `SELECT *`, sehingga semua kolom ikut terambil padahal yang dibutuhkan hanya nama dan email.',
      },
      {
        code: `
          SELECT nama, email FROM pengguna WHERE kota = "Bandung" ORDER BY nama LIMIT 10;
        `,
        reason:
          'Memakai kutip ganda, sehingga PostgreSQL mencari kolom bernama Bandung dan gagal dengan error.',
      },
      {
        code: `
          SELECT nama, email FROM pengguna WHERE kota = 'Bandung' LIMIT 10 ORDER BY nama;
        `,
        reason:
          '`LIMIT` ditulis sebelum `ORDER BY`, dan urutan klausa seperti ini adalah syntax error.',
      },
      {
        code: `
          SELECT nama, email FROM pengguna ORDER BY nama LIMIT 10;
        `,
        reason: 'Tidak ada `WHERE`, sehingga pengguna dari semua kota ikut terambil.',
      },
      {
        code: `
          SELECT nama, email FROM pengguna WHERE kota = 'bandung' ORDER BY nama LIMIT 10;
        `,
        reason:
          "Isi teks di PostgreSQL peka huruf besar kecil. `'bandung'` tidak sama dengan `'Bandung'`, sehingga query ini mengembalikan nol baris.",
      },
    ],
    check: mesinStruktur('sql', [
      wajibStruktur(
        'pilih-nama',
        'Mengambil kolom `nama`',
        'Kolom `nama` belum disebut di antara `SELECT` dan `FROM`.',
        kolomDiSelect(['nama']),
      ),
      wajibStruktur(
        'pilih-email',
        'Mengambil kolom `email`',
        'Kolom `email` belum disebut di antara `SELECT` dan `FROM`.',
        kolomDiSelect(['email']),
      ),
      larangStruktur(
        'tanpa-bintang',
        'Tidak memakai `SELECT *`',
        'Sebut kolom yang dibutuhkan saja. `SELECT *` ikut mengambil kolom yang tidak diminta, termasuk kolom yang ditambahkan nanti.',
        'select\\s+\\*',
      ),
      wajibStruktur(
        'saring-kota',
        "Menyaring `kota = 'Bandung'`",
        "Belum ada `WHERE kota = 'Bandung'`. Pastikan teksnya memakai kutip tunggal dan huruf B kapital, karena isi teks di PostgreSQL peka huruf besar kecil.",
        "where\\s[\\s\\S]*?\\bkota\\s*=\\s*'Bandung'",
      ),
      larangStruktur(
        'kutip-tunggal',
        'Tidak memakai kutip ganda untuk teks',
        'Di PostgreSQL, `"Bandung"` berarti nama kolom, bukan teks. Pakai kutip tunggal, yaitu `\'Bandung\'`.',
        '"bandung"',
      ),
      urutStruktur(
        'urutan-klausa',
        'Urutan klausa `WHERE`, `ORDER BY nama`, lalu `LIMIT 10`',
        'Urutan klausa SQL tetap, yaitu `WHERE` lalu `ORDER BY` lalu `LIMIT`. Pastikan juga yang diurutkan adalah `nama` dan batasnya 10.',
        ['\\bwhere\\b', '\\border\\s+by\\s+(\\w+\\.)?nama\\b', '\\blimit\\s+10\\b'],
      ),
    ]),
  }),

  soal({
    slug: 'sql-insert-returning',
    title: '`INSERT` lalu ambil id-nya dengan `RETURNING`',
    topic: 'sql',
    level: 'basic',
    realWorldUse:
      'Setiap fitur "daftar" atau "buat baru" menyimpan satu baris lalu butuh id-nya, misalnya untuk dikirim balik ke klien atau untuk mengisi tabel lain.',
    source: SUMBER,
    brief: {
      situation:
        'Ana baru saja mengisi form pendaftaran. Server harus menyimpan datanya ke tabel `pengguna`, lalu mengirim balik id akun barunya ke aplikasi. Id itu dibuat otomatis oleh database, jadi server tidak tahu nilainya sebelum baris tersimpan.',
      tasks: [
        'Tulis query `INSERT` yang menyimpan pengguna bernama `Ana`, dengan email `ana@contoh.id` dan kota `Bandung`.',
        'Sebutkan daftar kolom yang diisi secara eksplisit, yaitu `(nama, email, kota)`.',
        'Kembalikan `id` baris yang baru dibuat memakai `RETURNING`, dalam query yang sama.',
      ],
      given: SKEMA_TOKO,
      pitfalls: [
        'Selalu sebutkan daftar kolom. `INSERT INTO pengguna VALUES (...)` bergantung pada urutan kolom di tabel, dan query itu rusak begitu ada kolom baru yang ditambahkan.',
        'Jangan mengambil id dengan query kedua seperti `SELECT MAX(id) FROM pengguna`. Kalau dua orang mendaftar bersamaan, keduanya bisa mendapat id yang sama milik orang yang terakhir. Masalah ini disebut race condition.',
      ],
      terms: [
        {
          term: 'INSERT INTO',
          meaning:
            'Perintah SQL untuk menambah baris baru. Bentuknya `INSERT INTO tabel (kolom1, kolom2) VALUES (nilai1, nilai2)`. Kolom yang tidak disebut akan diisi nilai bawaannya, misalnya `id` dari `SERIAL` dan `dibuat_pada` dari `now()`.',
        },
        {
          term: 'RETURNING',
          meaning:
            'Klausa khas PostgreSQL yang membuat `INSERT`, `UPDATE`, atau `DELETE` langsung mengembalikan kolom dari baris yang diubah. `RETURNING id` memberi id baris baru tanpa perlu query kedua, sehingga tidak ada celah waktu di antaranya.',
        },
        {
          term: 'race condition',
          meaning:
            'Bug yang muncul ketika hasil program bergantung pada urutan kejadian yang tidak bisa diatur, misalnya dua request yang datang hampir bersamaan. Kodenya terlihat benar saat diuji sendirian, dan baru rusak ketika ramai.',
        },
      ],
    },
    rules: [
      'Menyebut daftar kolom `(nama, email, kota)` secara eksplisit.',
      'Memakai `RETURNING` untuk mengembalikan `id`.',
      'Tidak mengambil id dengan `MAX(id)`.',
    ],
    starter: `
      -- tulis query di sini
    `,
    hints: [
      'Mulai dari `INSERT INTO pengguna (nama, email, kota)`.',
      'Nilainya ditulis di `VALUES (...)` dengan urutan yang sama seperti daftar kolom.',
      'Tambahkan `RETURNING id` di akhir query yang sama.',
    ],
    solution: {
      code: `
        -- Daftar kolom disebut eksplisit, jadi aman walau tabelnya bertambah kolom.
        INSERT INTO pengguna (nama, email, kota)
        VALUES ('Ana', 'ana@contoh.id', 'Bandung')
        RETURNING id;   -- id baru langsung dikembalikan, tanpa query kedua
      `,
      steps: [
        '`INSERT INTO pengguna (nama, email, kota)` menyebut tabel dan tiga kolom yang akan diisi.',
        '`VALUES (...)` berisi nilainya dengan urutan yang sama seperti daftar kolom. Teksnya memakai kutip tunggal.',
        'Kolom `id` dan `dibuat_pada` tidak disebut, sehingga database mengisinya sendiri dengan nilai bawaan.',
        '`RETURNING id` membuat query ini langsung mengembalikan id baris yang baru dibuat.',
      ],
      explanation:
        '`RETURNING` menghapus kebutuhan akan query kedua. Tanpanya orang sering menulis `SELECT MAX(id)`, yang terlihat benar saat diuji sendirian tapi rusak ketika dua orang mendaftar bersamaan, karena keduanya bisa membaca id yang sama.',
    },
    alternativeSolutions: [
      `
        insert into pengguna (nama, email, kota)
        values ('Ana', 'ana@contoh.id', 'Bandung')
        returning id;
      `,
      `
        INSERT INTO pengguna (nama, email, kota)
        VALUES ('Ana', 'ana@contoh.id', 'Bandung')
        RETURNING id, dibuat_pada;
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          INSERT INTO pengguna VALUES (DEFAULT, 'Ana', 'ana@contoh.id', 'Bandung', now())
          RETURNING id;
        `,
        reason:
          'Tidak menyebut daftar kolom, sehingga query ini rusak begitu ada kolom baru di tabel.',
      },
      {
        code: `
          INSERT INTO pengguna (nama, email, kota) VALUES ('Ana', 'ana@contoh.id', 'Bandung');
          SELECT MAX(id) FROM pengguna;
        `,
        reason:
          'Mengambil id dengan `MAX(id)` di query kedua. Kalau dua orang mendaftar bersamaan, keduanya bisa mendapat id yang sama.',
      },
    ],
    check: mesinStruktur('sql', [
      wajibStruktur(
        'daftar-kolom',
        'Menyebut daftar kolom secara eksplisit',
        'Tulis daftar kolom setelah nama tabel, yaitu `INSERT INTO pengguna (nama, email, kota)`.',
        'insert\\s+into\\s+pengguna\\s*\\(\\s*\\w',
      ),
      wajibStruktur(
        'ada-values',
        'Ada `VALUES`',
        'Belum ada `VALUES (...)` yang berisi nilai untuk setiap kolom.',
        '\\bvalues\\s*\\(',
      ),
      wajibStruktur(
        'nilai-email',
        'Menyimpan email `ana@contoh.id`',
        "Email yang disimpan belum sesuai soal, yaitu `'ana@contoh.id'`.",
        "'ana@contoh\\.id'",
      ),
      wajibStruktur(
        'ada-returning',
        'Memakai `RETURNING` untuk mengembalikan `id`',
        'Belum ada `RETURNING id`. Tanpa itu, server butuh query kedua untuk tahu id barunya.',
        '\\breturning\\s+[\\w\\s,]*?\\bid\\b|\\breturning\\s+\\*',
      ),
      larangStruktur(
        'tanpa-max-id',
        'Tidak mengambil id dengan `MAX(id)`',
        '`MAX(id)` di query kedua bisa mengembalikan id milik orang lain yang mendaftar bersamaan. Pakai `RETURNING`.',
        'max\\s*\\(\\s*id\\s*\\)',
      ),
    ]),
  }),

  soal({
    slug: 'sql-update-dengan-where',
    title: '`UPDATE` yang hanya mengubah satu baris',
    topic: 'sql',
    level: 'basic',
    realWorldUse:
      'Membatalkan pesanan, mengubah status, atau memperbarui profil. `UPDATE` tanpa `WHERE` yang benar adalah salah satu kesalahan paling mahal di database produksi.',
    source: SUMBER,
    brief: {
      situation:
        'Seorang pembeli meminta pesanan nomor 42 dibatalkan. Kamu diminta mengubah status pesanan itu menjadi `dibatalkan`. Tabel `pesanan` berisi ribuan pesanan dari ribuan pembeli lain, dan semuanya harus tetap utuh.',
      tasks: [
        'Tulis query `UPDATE` pada tabel `pesanan`.',
        "Ubah kolom `status` menjadi `'dibatalkan'`.",
        'Pastikan hanya pesanan dengan `id` bernilai `42` yang berubah.',
      ],
      given: SKEMA_TOKO,
      pitfalls: [
        '`UPDATE` tanpa `WHERE` mengubah SEMUA baris di tabel. Satu query itu bisa membatalkan seluruh pesanan di toko dalam sekejap, dan tidak ada tombol undo.',
        'Saring dengan kolom yang tepat, yaitu `id`. `WHERE pengguna_id = 42` juga query yang sah, tapi ia membatalkan semua pesanan milik pengguna nomor 42, bukan pesanan nomor 42.',
      ],
      terms: [
        {
          term: 'UPDATE',
          meaning:
            'Perintah SQL untuk mengubah nilai kolom pada baris yang sudah ada. Bentuknya `UPDATE tabel SET kolom = nilai WHERE syarat`. Semua baris yang cocok dengan syarat `WHERE` akan diubah sekaligus.',
        },
        {
          term: 'SET',
          meaning:
            "Bagian dari `UPDATE` yang menyebut kolom apa yang diubah dan menjadi nilai apa. Beberapa kolom bisa diubah sekaligus dengan dipisah koma, misalnya `SET status = 'dibatalkan', total = 0`.",
        },
        {
          term: 'rows affected',
          meaning:
            'Jumlah baris yang berubah akibat sebuah query, yang dilaporkan database setelah query selesai. Di psql tampil sebagai `UPDATE 1`. Kalau yang muncul `UPDATE 5000` padahal kamu hanya ingin mengubah satu baris, berarti syarat `WHERE`-nya salah.',
        },
      ],
    },
    rules: [
      "Mengubah `status` menjadi `'dibatalkan'`.",
      'Memakai `WHERE id = 42`.',
      'Klausa `SET` ditulis sebelum `WHERE`.',
    ],
    starter: `
      -- tulis query di sini
    `,
    hints: [
      'Bentuk umumnya `UPDATE tabel SET kolom = nilai WHERE syarat`.',
      'Nilai teks memakai kutip tunggal.',
      'Syaratnya `WHERE id = 42`, bukan `pengguna_id`.',
    ],
    solution: {
      code: `
        UPDATE pesanan
        SET status = 'dibatalkan'
        WHERE id = 42;   -- TANPA baris ini, semua pesanan ikut dibatalkan
      `,
      steps: [
        '`UPDATE pesanan` menyebut tabel yang barisnya akan diubah.',
        "`SET status = 'dibatalkan'` menentukan kolom yang diubah dan nilai barunya.",
        '`WHERE id = 42` membatasi perubahan hanya pada baris yang id-nya 42.',
        'Setelah dijalankan, database melaporkan `UPDATE 1`, tanda bahwa tepat satu baris yang berubah.',
      ],
      explanation:
        '`WHERE` pada `UPDATE` bukan tambahan, melainkan batas pengaman. Query `UPDATE` tanpa `WHERE` tetap sah dan berjalan tanpa peringatan, lalu mengubah seluruh isi tabel. Biasakan menulis `WHERE` lebih dulu sebelum `SET`, supaya query yang setengah jadi tidak pernah sempat dijalankan.',
    },
    alternativeSolutions: [
      `
        update pesanan set status = 'dibatalkan' where id = 42;
      `,
      `
        UPDATE pesanan
        SET status = 'dibatalkan'
        WHERE id = 42
        RETURNING id, status;
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          UPDATE pesanan SET status = 'dibatalkan';
        `,
        reason: 'Tidak ada `WHERE`, sehingga SEMUA pesanan di toko ikut dibatalkan.',
      },
      {
        code: `
          UPDATE pesanan SET status = 'dibatalkan' WHERE pengguna_id = 42;
        `,
        reason:
          'Menyaring dengan `pengguna_id`, sehingga yang dibatalkan semua pesanan milik pengguna nomor 42, bukan pesanan nomor 42.',
      },
      {
        code: `
          UPDATE pesanan SET status = "dibatalkan" WHERE id = 42;
        `,
        reason:
          'Memakai kutip ganda, sehingga PostgreSQL mencari kolom bernama dibatalkan dan gagal dengan error.',
      },
    ],
    check: mesinStruktur('sql', [
      wajibStruktur(
        'update-set',
        'Mengubah tabel `pesanan` dengan `SET`',
        'Bentuknya `UPDATE pesanan SET ...`.',
        'update\\s+pesanan\\s+set\\b',
      ),
      wajibStruktur(
        'nilai-status',
        "Mengubah `status` menjadi `'dibatalkan'`",
        "Belum ada `status = 'dibatalkan'` dengan kutip tunggal. Kutip ganda di PostgreSQL berarti nama kolom.",
        "\\bstatus\\s*=\\s*'dibatalkan'",
      ),
      wajibStruktur(
        'ada-where',
        'Memakai `WHERE id = 42`',
        'Belum ada `WHERE id = 42`. Tanpa syarat yang tepat, `UPDATE` mengubah baris lain atau bahkan semua baris.',
        '\\bwhere\\s+(\\w+\\.)?id\\s*=\\s*42\\b',
      ),
      urutStruktur(
        'urutan-klausa',
        'Klausa `SET` sebelum `WHERE`',
        'Urutan klausa `UPDATE` tetap, yaitu `UPDATE` lalu `SET` lalu `WHERE`.',
        ['update\\s+pesanan', '\\bset\\b', '\\bwhere\\b'],
      ),
    ]),
  }),

  soal({
    slug: 'sql-count-group-by',
    title: 'Hitung jumlah per kelompok dengan `GROUP BY`',
    topic: 'sql',
    level: 'basic',
    realWorldUse:
      'Angka ringkasan di dashboard, misalnya berapa pesanan yang masih diproses, dikirim, dan selesai. Menghitungnya di database jauh lebih cepat daripada mengambil semua baris lalu menghitung di aplikasi.',
    source: SUMBER,
    brief: {
      situation:
        'Dashboard admin punya kartu ringkasan berisi jumlah pesanan untuk setiap status, misalnya diproses 120, dikirim 85, dan selesai 940. Mengambil seribu lebih pesanan ke aplikasi hanya untuk menghitungnya adalah pemborosan. Database bisa menghitungnya sendiri dan hanya mengirim beberapa baris hasil.',
      tasks: [
        'Tulis query yang menghitung jumlah pesanan untuk setiap `status` di tabel `pesanan`.',
        'Hasilnya berisi dua kolom, yaitu `status` dan jumlahnya.',
        'Pakai `COUNT` dan `GROUP BY`.',
      ],
      given: SKEMA_TOKO,
      pitfalls: [
        'Kolom yang ditulis di `SELECT` tanpa dibungkus fungsi agregat wajib ikut di `GROUP BY`. Tanpa itu, PostgreSQL menolak query dengan error `column "pesanan.status" must appear in the GROUP BY clause or be used in an aggregate function`.',
        '`SELECT COUNT(*) FROM pesanan` hanya memberi SATU angka total untuk semua pesanan, bukan jumlah per status.',
      ],
      terms: [
        {
          term: 'aggregate function',
          meaning:
            'Fungsi yang merangkum banyak baris menjadi satu nilai, seperti `COUNT` untuk menghitung, `SUM` untuk menjumlahkan, `AVG` untuk rata-rata, serta `MIN` dan `MAX`. Kalau dipakai bersama `GROUP BY`, hasilnya satu nilai untuk setiap kelompok.',
        },
        {
          term: 'GROUP BY',
          meaning:
            'Klausa yang mengumpulkan baris dengan nilai kolom yang sama ke dalam satu kelompok. `GROUP BY status` membuat satu kelompok untuk setiap status yang berbeda, lalu fungsi agregat dihitung terpisah untuk masing-masing kelompok.',
        },
        {
          term: 'COUNT(*)',
          meaning:
            'Menghitung jumlah baris di setiap kelompok. Tanda bintang di sini berarti "semua baris", bukan "semua kolom" seperti pada `SELECT *`. `COUNT(kolom)` hanya menghitung baris yang nilai kolomnya tidak NULL.',
        },
      ],
    },
    rules: ['Menampilkan kolom `status`.', 'Memakai `COUNT`.', 'Memakai `GROUP BY status`.'],
    starter: `
      -- tulis query di sini
    `,
    hints: [
      'Kamu ingin satu baris hasil untuk setiap status yang berbeda.',
      '`COUNT(*)` menghitung jumlah baris di setiap kelompok.',
      'Bentuknya `SELECT status, COUNT(*) FROM pesanan GROUP BY status;`.',
    ],
    solution: {
      code: `
        SELECT status, COUNT(*) AS jumlah   -- AS memberi nama pada kolom hasil hitungan
        FROM pesanan
        GROUP BY status;                    -- satu baris hasil untuk setiap status
      `,
      steps: [
        '`FROM pesanan` mengambil semua pesanan sebagai bahan.',
        '`GROUP BY status` mengumpulkan pesanan yang statusnya sama ke dalam satu kelompok.',
        '`COUNT(*)` menghitung jumlah baris di masing-masing kelompok.',
        '`AS jumlah` memberi nama pada kolom hasil hitungan, sehingga lebih mudah dibaca oleh aplikasi.',
        'Hasilnya hanya beberapa baris, satu untuk setiap status, berapa pun jumlah pesanannya.',
      ],
      explanation:
        'Kolom `status` muncul di `SELECT` tanpa dibungkus fungsi agregat, jadi ia wajib ikut di `GROUP BY`. Aturannya logis. Setiap baris hasil mewakili satu kelompok, sehingga kolom yang tidak dirangkum harus punya satu nilai yang sama di seluruh kelompok itu.',
    },
    alternativeSolutions: [
      `
        select status, count(id) as jumlah from pesanan group by status;
      `,
      `
        SELECT status, COUNT(*) AS jumlah
        FROM pesanan
        GROUP BY status
        ORDER BY jumlah DESC;
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          SELECT status, COUNT(*) FROM pesanan;
        `,
        reason:
          'Tanpa `GROUP BY`, PostgreSQL menolak query ini karena kolom `status` tidak ikut dikelompokkan.',
      },
      {
        code: `
          SELECT COUNT(*) FROM pesanan;
        `,
        reason: 'Hanya memberi satu angka total untuk semua pesanan, bukan jumlah per status.',
      },
      {
        code: `
          SELECT status FROM pesanan GROUP BY status;
        `,
        reason: 'Hanya menampilkan daftar status tanpa jumlahnya.',
      },
    ],
    check: mesinStruktur('sql', [
      wajibStruktur(
        'pilih-status',
        'Menampilkan kolom `status`',
        'Kolom `status` belum disebut di antara `SELECT` dan `FROM pesanan`.',
        kolomDiSelect(['status'], 'pesanan'),
      ),
      wajibStruktur(
        'pakai-count',
        'Memakai `COUNT`',
        'Belum ada `COUNT(*)` atau `COUNT(kolom)` untuk menghitung jumlah pesanan.',
        '\\bcount\\s*\\(\\s*(\\*|(\\w+\\.)?\\w+)\\s*\\)',
      ),
      wajibStruktur(
        'ada-group-by',
        'Memakai `GROUP BY status`',
        'Belum ada `GROUP BY status`. Tanpa itu, PostgreSQL menolak kolom `status` yang tidak dibungkus fungsi agregat.',
        '\\bgroup\\s+by\\s+(\\w+\\.)?status\\b',
      ),
      urutStruktur(
        'urutan-klausa',
        '`FROM` sebelum `GROUP BY`',
        'Urutannya `SELECT` lalu `FROM` lalu `GROUP BY`.',
        ['\\bfrom\\s+pesanan', '\\bgroup\\s+by\\b'],
      ),
    ]),
  }),

  soal({
    slug: 'sql-pagination-limit-offset',
    title: 'Ambil satu halaman dengan `LIMIT` dan `OFFSET`',
    topic: 'sql',
    level: 'basic',
    realWorldUse:
      'Setiap tabel yang punya tombol halaman 1, 2, 3 di bawahnya. Query-nya terlihat sepele, tapi tanpa urutan yang tetap, data bisa muncul dua kali atau hilang di antara halaman.',
    source: SUMBER,
    brief: {
      situation:
        'Tabel riwayat pesanan menampilkan 10 pesanan per halaman. Pengguna mengklik halaman 3. Database harus melewati 20 pesanan pertama, lalu mengambil 10 berikutnya. Supaya halaman 1, 2, dan 3 tidak saling bertumpuk, urutan datanya harus selalu sama setiap kali query dijalankan.',
      tasks: [
        'Tulis query yang mengambil kolom `id`, `total`, dan `status` dari tabel `pesanan`.',
        'Urutkan berdasarkan `id`.',
        'Ambil data untuk halaman ke-3, dengan 10 baris per halaman.',
      ],
      given: SKEMA_TOKO,
      pitfalls: [
        'Tanpa `ORDER BY`, PostgreSQL tidak menjamin urutan baris. Halaman 2 dan halaman 3 bisa berisi pesanan yang sama, dan ada pesanan yang tidak pernah muncul di halaman mana pun.',
        'Rumus offset-nya `(halaman - 1) * perHalaman`, sama dengan rumus di soal pagination JavaScript. Untuk halaman 3, hasilnya 20, bukan 30.',
      ],
      terms: [
        {
          term: 'OFFSET',
          meaning:
            'Klausa yang melewati sejumlah baris pertama sebelum mulai mengambil. `OFFSET 20` berarti 20 baris pertama dilewati. Dipasangkan dengan `LIMIT`, ia menjadi cara paling sederhana membuat pagination di SQL.',
        },
        {
          term: 'deterministic',
          meaning:
            'Sifat query yang selalu memberi hasil dengan urutan yang sama untuk data yang sama. Query tanpa `ORDER BY` tidak deterministic, karena urutannya bergantung pada kondisi internal database yang bisa berubah kapan saja, misalnya setelah ada data yang diperbarui.',
        },
        {
          term: 'pagination',
          meaning:
            'Membagi data yang banyak menjadi beberapa halaman kecil. Di soal JavaScript sebelumnya kamu memotong array yang sudah dimuat ke browser. Di sini potongannya dilakukan database, sehingga hanya 10 baris yang dikirim lewat jaringan.',
        },
      ],
    },
    rules: [
      'Memakai `ORDER BY`.',
      'Memakai `LIMIT 10` dan `OFFSET 20`.',
      '`ORDER BY` ditulis sebelum `LIMIT` dan `OFFSET`.',
    ],
    starter: `
      -- tulis query di sini
    `,
    hints: [
      'Halaman 1 melewati 0 baris, halaman 2 melewati 10 baris, dan halaman 3 melewati 20 baris.',
      'Urutan yang tetap dibutuhkan, jadi pakai `ORDER BY id`.',
      'Akhiri query dengan `LIMIT 10 OFFSET 20;`.',
    ],
    solution: {
      code: `
        SELECT id, total, status
        FROM pesanan
        ORDER BY id          -- urutan yang TETAP, supaya halaman tidak bertumpuk
        LIMIT 10 OFFSET 20;  -- halaman 3 = lewati (3 - 1) x 10 baris, ambil 10
      `,
      steps: [
        '`SELECT id, total, status FROM pesanan` menentukan kolom dan tabelnya.',
        '`ORDER BY id` mengunci urutan, sehingga setiap kali query dijalankan urutannya sama.',
        '`OFFSET 20` melewati 20 baris pertama, yaitu isi halaman 1 dan halaman 2.',
        '`LIMIT 10` mengambil 10 baris berikutnya sebagai isi halaman 3.',
      ],
      explanation:
        '`ORDER BY` adalah bagian yang paling sering dilupakan dan paling berbahaya kalau terlupa. Tanpanya, query tetap berjalan dan terlihat benar saat diuji. Tapi urutan bisa berubah di antara dua klik, sehingga pengguna melihat pesanan yang sama dua kali sementara pesanan lain tidak pernah muncul.',
    },
    alternativeSolutions: [
      `
        select id, total, status from pesanan order by id limit 10 offset 20;
      `,
      `
        SELECT id, total, status
        FROM pesanan
        ORDER BY dibuat_pada DESC, id DESC
        OFFSET 20 LIMIT 10;
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          SELECT id, total, status FROM pesanan LIMIT 10 OFFSET 20;
        `,
        reason:
          'Tanpa `ORDER BY`, urutan tidak dijamin, sehingga isi halaman bisa bertumpuk atau ada data yang terlewat.',
      },
      {
        code: `
          SELECT id, total, status FROM pesanan ORDER BY id LIMIT 10 OFFSET 30;
        `,
        reason: 'Offset 30 adalah halaman 4. Untuk halaman 3 rumusnya `(3 - 1) * 10`, yaitu 20.',
      },
      {
        code: `
          SELECT id, total, status FROM pesanan ORDER BY id LIMIT 10;
        `,
        reason: 'Tanpa `OFFSET`, query ini selalu mengambil halaman pertama.',
      },
    ],
    check: mesinStruktur('sql', [
      wajibStruktur(
        'ada-order',
        'Memakai `ORDER BY`',
        'Belum ada `ORDER BY`. Tanpa urutan yang tetap, isi halaman bisa bertumpuk atau ada data yang terlewat.',
        '\\border\\s+by\\b',
      ),
      wajibStruktur(
        'limit-10',
        'Memakai `LIMIT 10`',
        'Belum ada `LIMIT 10`. Satu halaman berisi 10 baris.',
        '\\blimit\\s+10\\b',
      ),
      wajibStruktur(
        'offset-20',
        'Memakai `OFFSET 20`',
        'Offset untuk halaman 3 adalah `(3 - 1) * 10`, yaitu `OFFSET 20`.',
        '\\boffset\\s+20\\b',
      ),
      urutStruktur(
        'order-sebelum-limit',
        '`ORDER BY` sebelum `LIMIT`',
        '`ORDER BY` harus ditulis sebelum `LIMIT`.',
        ['\\border\\s+by\\b', '\\blimit\\b'],
      ),
      urutStruktur(
        'order-sebelum-offset',
        '`ORDER BY` sebelum `OFFSET`',
        '`ORDER BY` harus ditulis sebelum `OFFSET`.',
        ['\\border\\s+by\\b', '\\boffset\\b'],
      ),
    ]),
  }),
];
