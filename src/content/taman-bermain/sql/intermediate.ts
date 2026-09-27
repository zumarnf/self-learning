import {
  larangStruktur,
  mesinStruktur,
  soal,
  urutStruktur,
  wajibStruktur,
} from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';
import { antiJoinIsNull, kolomDiSelect } from './pola';
import { SKEMA_TOKO } from './skema';

/**
 * SQL — Intermediate. Queries that span two tables or summarise groups, and the one piece of
 * schema work every growing table eventually needs.
 *
 * Each trap here runs WITHOUT an error and returns the wrong rows — a wrong `ON`, `= NULL`, a
 * `LEFT JOIN` pointed the wrong way — or fails only once the table is large, which is exactly why
 * they are worth an exercise: nothing in the happy path points at them.
 */

const SUMBER = { category: 'backend-basic', chapter: 'database-sql-dasar' } as const;

export const exercises: Exercise[] = [
  soal({
    slug: 'sql-inner-join',
    title: 'Gabungkan dua tabel dengan `JOIN`',
    topic: 'sql',
    level: 'intermediate',
    realWorldUse:
      'Halaman admin yang menampilkan daftar pesanan beserta nama pembelinya. Datanya tersebar di dua tabel, dan `JOIN` menyatukannya dalam satu query.',
    source: SUMBER,
    brief: {
      situation:
        'Admin toko ingin melihat daftar pesanan yang sudah selesai beserta nama pembelinya. Masalahnya, tabel `pesanan` hanya menyimpan `pengguna_id`, yaitu angka yang menunjuk ke satu baris di tabel `pengguna`. Nama pembelinya sendiri ada di tabel `pengguna`. Kamu perlu menyambungkan kedua tabel itu dalam satu query.',
      tasks: [
        'Tulis query yang mengambil id pesanan, nama pembeli, dan total pesanan.',
        'Sambungkan tabel `pesanan` dengan tabel `pengguna` memakai `JOIN ... ON`.',
        'Syarat sambungannya adalah `pesanan.pengguna_id` sama dengan `pengguna.id`.',
        'Ambil hanya pesanan dengan `status` bernilai `selesai`.',
      ],
      given: SKEMA_TOKO,
      pitfalls: [
        'Kedua tabel punya kolom bernama `id`. Kalau kamu menulis `SELECT id` saja, PostgreSQL tidak tahu id milik tabel mana yang dimaksud, lalu gagal dengan error `column reference "id" is ambiguous`. Tulis lengkap dengan nama tabel atau alias-nya, misalnya `p.id`.',
        'Syarat `ON` yang salah tetap berjalan tanpa error. `ON p.id = u.id` menyambungkan pesanan nomor 3 dengan pengguna nomor 3, padahal keduanya tidak berhubungan sama sekali.',
        'Tulis sambungannya dengan `JOIN ... ON`, bukan `FROM pesanan, pengguna` dengan syarat di `WHERE`. Pada bentuk lama itu, syarat yang terlupa membuat setiap pesanan dipasangkan dengan setiap pengguna, sehingga 1.000 pesanan dan 1.000 pengguna menghasilkan satu juta baris.',
      ],
      terms: [
        {
          term: 'JOIN',
          meaning:
            'Menggabungkan baris dari dua tabel menjadi satu baris hasil, berdasarkan syarat yang ditulis setelah `ON`. `JOIN` tanpa awalan sama dengan `INNER JOIN`, yaitu hanya baris yang punya pasangan di kedua tabel yang ikut masuk ke hasil.',
        },
        {
          term: 'foreign key',
          meaning:
            'Kolom yang menyimpan id milik baris di tabel lain. `pesanan.pengguna_id` adalah foreign key ke `pengguna.id`. Karena ditulis `REFERENCES pengguna (id)`, database menolak pesanan yang menunjuk ke pengguna yang tidak ada.',
        },
        {
          term: 'alias',
          meaning:
            'Nama pendek untuk tabel di dalam satu query. `FROM pesanan AS p` membuat tabel `pesanan` bisa disebut `p`, sehingga `p.total` lebih ringkas daripada `pesanan.total`. Kata `AS` boleh dihilangkan, jadi `FROM pesanan p` artinya sama.',
        },
      ],
    },
    rules: [
      'Memakai `JOIN ... ON`, bukan koma di `FROM`.',
      'Syarat sambungannya `pengguna_id` dengan `id`.',
      'Mengambil `nama` dan `total`.',
      "Menyaring `status = 'selesai'`.",
    ],
    starter: `
      -- tulis query di sini
    `,
    hints: [
      'Mulai dari `FROM pesanan AS p`, lalu tambahkan `JOIN pengguna AS u ON ...`.',
      'Syarat `ON`-nya adalah `u.id = p.pengguna_id`.',
      'Tulis kolom `id` lengkap dengan alias-nya, yaitu `p.id`, supaya tidak ambigu.',
    ],
    solution: {
      code: `
        SELECT p.id, u.nama, p.total
        FROM pesanan AS p
        JOIN pengguna AS u ON u.id = p.pengguna_id   -- sambungkan pesanan ke pembelinya
        WHERE p.status = 'selesai';
      `,
      steps: [
        '`FROM pesanan AS p` menjadikan tabel `pesanan` sebagai titik awal dan memberinya alias `p`.',
        '`JOIN pengguna AS u` menyambungkan tabel `pengguna` dengan alias `u`.',
        '`ON u.id = p.pengguna_id` menentukan pasangannya. Setiap pesanan dipasangkan dengan pengguna yang id-nya sama dengan `pengguna_id` pesanan itu.',
        "`WHERE p.status = 'selesai'` menyaring hasil sambungan tadi, sehingga hanya pesanan yang selesai yang tersisa.",
        '`SELECT p.id, u.nama, p.total` mengambil tiga kolom dari dua tabel yang berbeda. Alias `p.` dan `u.` menunjukkan asal masing-masing kolom.',
      ],
      explanation:
        'Bagian terpenting ada di syarat `ON`. Syarat yang salah, misalnya `ON p.id = u.id`, tetap berjalan tanpa error dan menghasilkan baris yang terlihat wajar, padahal pasangannya acak. Selalu sambungkan foreign key dengan primary key yang ditunjuknya, di sini `p.pengguna_id` dengan `u.id`.',
    },
    alternativeSolutions: [
      `
        select p.id, u.nama, p.total
        from pesanan p
        inner join pengguna u on p.pengguna_id = u.id
        where p.status = 'selesai';
      `,
      `
        SELECT pesanan.id AS id, pengguna.nama, pesanan.total
        FROM pengguna
        JOIN pesanan ON pesanan.pengguna_id = pengguna.id
        WHERE pesanan.status = 'selesai'
        ORDER BY pesanan.id;
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          SELECT id, nama, total
          FROM pesanan
          JOIN pengguna ON pengguna.id = pesanan.pengguna_id
          WHERE status = 'selesai';
        `,
        reason:
          '`SELECT id` ambigu karena kedua tabel punya kolom `id`, sehingga PostgreSQL menolak query ini dengan error.',
      },
      {
        code: `
          SELECT p.id, u.nama, p.total
          FROM pesanan p
          JOIN pengguna u ON p.id = u.id
          WHERE p.status = 'selesai';
        `,
        reason:
          'Syarat `ON p.id = u.id` memasangkan pesanan dengan pengguna yang nomornya kebetulan sama, bukan dengan pembelinya.',
      },
      {
        code: `
          SELECT p.id, u.nama, p.total
          FROM pesanan p, pengguna u
          WHERE u.id = p.pengguna_id AND p.status = 'selesai';
        `,
        reason:
          'Memakai koma di `FROM`. Hasilnya sama, tapi syarat yang terlupa pada bentuk ini langsung memasangkan semua pesanan dengan semua pengguna.',
      },
      {
        code: `
          SELECT p.id, u.nama, p.total
          FROM pesanan p
          JOIN pengguna u ON u.id = p.pengguna_id;
        `,
        reason:
          'Tidak menyaring status, sehingga pesanan yang masih diproses atau dibatalkan ikut tampil.',
      },
    ],
    check: mesinStruktur('sql', [
      wajibStruktur(
        'join-eksplisit',
        'Memakai `JOIN` untuk menyambungkan tabel',
        'Sambungkan tabel dengan `JOIN pengguna ON ...` atau `JOIN pesanan ON ...`.',
        '\\bjoin\\s+(pengguna|pesanan)\\b',
      ),
      larangStruktur(
        'tanpa-koma-di-from',
        'Tidak menyambungkan tabel dengan koma di `FROM`',
        'Tulis sambungannya dengan `JOIN ... ON`, bukan `FROM pesanan, pengguna`.',
        '\\bfrom\\s+(pesanan|pengguna)(\\s+(as\\s+)?(?!join\\b|inner\\b|left\\b|right\\b|cross\\b|natural\\b|where\\b)\\w+)?\\s*,',
      ),
      wajibStruktur(
        'syarat-on',
        'Syarat `ON` menyambungkan `pengguna_id` dengan `id`',
        'Syarat sambungannya harus `pengguna_id` di satu sisi dan `id` di sisi lain, misalnya `ON u.id = p.pengguna_id`.',
        '\\bon\\s*\\(?\\s*(\\w+\\.)?pengguna_id\\s*=\\s*(\\w+\\.)?id\\b|\\bon\\s*\\(?\\s*(\\w+\\.)?id\\s*=\\s*(\\w+\\.)?pengguna_id\\b',
      ),
      larangStruktur(
        'id-tidak-ambigu',
        'Kolom `id` ditulis lengkap dengan tabel atau alias-nya',
        '`id` ada di kedua tabel. Tulis `p.id` atau `pesanan.id`, bukan `id` saja.',
        '\\bselect\\s+(?:(?!\\bfrom\\b)[\\s\\S])*?(?<![\\w."])(?<!\\bas\\s+)\\bid\\b',
      ),
      wajibStruktur(
        'pilih-nama-total',
        'Mengambil `nama` dan `total`',
        'Kolom `nama` dan `total` belum sama-sama disebut di antara `SELECT` dan `FROM`.',
        kolomDiSelect(['nama', 'total']),
      ),
      wajibStruktur(
        'saring-status',
        "Menyaring `status = 'selesai'`",
        "Belum ada syarat `status = 'selesai'` dengan kutip tunggal.",
        "\\bstatus\\s*=\\s*'selesai'",
      ),
    ]),
  }),

  soal({
    slug: 'sql-left-join-tanpa-pesanan',
    title: 'Cari data yang tidak punya pasangan dengan `LEFT JOIN`',
    topic: 'sql',
    level: 'intermediate',
    realWorldUse:
      'Mencari pengguna yang belum pernah belanja, produk yang belum pernah terjual, atau artikel tanpa komentar. Bentuk query-nya sama, dan jebakan `= NULL` di dalamnya berjalan tanpa error.',
    source: SUMBER,
    brief: {
      situation:
        'Tim pemasaran ingin mengirim voucher pesanan pertama kepada pengguna yang sudah mendaftar tapi belum pernah memesan apa pun. Pengguna seperti itu ada di tabel `pengguna`, tapi tidak punya satu baris pun di tabel `pesanan`. Kamu perlu mencari baris yang justru TIDAK punya pasangan.',
      tasks: [
        'Tulis query yang mengambil `id`, `nama`, dan `email` dari pengguna yang belum pernah punya pesanan.',
        'Pakai `LEFT JOIN` dari `pengguna` ke `pesanan`, lalu sisakan baris yang tidak punya pasangan.',
      ],
      given: SKEMA_TOKO,
      pitfalls: [
        '`JOIN` biasa hanya menyisakan pengguna yang PUNYA pesanan, yaitu kebalikan dari yang dicari. Pengguna tanpa pesanan langsung terbuang sebelum `WHERE` sempat memeriksanya.',
        'NULL tidak bisa dibandingkan dengan `=`. `WHERE p.id = NULL` tidak pernah bernilai benar, sehingga query mengembalikan nol baris tanpa error apa pun. Pakai `IS NULL`.',
        'Arah `LEFT JOIN` menentukan tabel mana yang semua barisnya dipertahankan, yaitu tabel di sebelah kiri atau yang ditulis setelah `FROM`. `FROM pesanan LEFT JOIN pengguna` mempertahankan semua pesanan, bukan semua pengguna.',
      ],
      terms: [
        {
          term: 'LEFT JOIN',
          meaning:
            'Sama seperti `JOIN`, tapi semua baris tabel kiri tetap ikut walaupun tidak punya pasangan. Untuk baris kiri yang tidak berpasangan, semua kolom dari tabel kanan diisi NULL. NULL inilah yang dipakai untuk mengenali baris tanpa pasangan.',
        },
        {
          term: 'NULL',
          meaning:
            'Penanda bahwa sebuah nilai tidak ada atau tidak diketahui. NULL bukan nol dan bukan teks kosong. Membandingkan apa pun dengan NULL memakai `=` menghasilkan NULL juga, bukan benar, sehingga baris tersebut tidak pernah lolos dari `WHERE`.',
        },
        {
          term: 'IS NULL',
          meaning:
            'Satu-satunya cara yang benar untuk memeriksa apakah sebuah nilai adalah NULL. `WHERE p.id IS NULL` bernilai benar tepat pada baris pengguna yang tidak punya pasangan pesanan. Kebalikannya adalah `IS NOT NULL`.',
        },
        {
          term: 'NOT EXISTS',
          meaning:
            'Cara lain untuk mencari baris tanpa pasangan. `WHERE NOT EXISTS (SELECT 1 FROM pesanan ...)` bernilai benar kalau subquery di dalamnya tidak menemukan satu baris pun. Hasilnya sama dengan `LEFT JOIN ... IS NULL` dan boleh dipakai di soal ini.',
        },
      ],
    },
    rules: [
      'Memakai `LEFT JOIN ... IS NULL` atau `NOT EXISTS`.',
      'Tabel `pengguna` berada di sisi yang semua barisnya dipertahankan.',
      'Tidak membandingkan NULL memakai `=`.',
      'Mengambil `nama` dan `email`.',
    ],
    starter: `
      -- tulis query di sini
    `,
    hints: [
      'Mulai dari `FROM pengguna AS u`, lalu `LEFT JOIN pesanan AS p ON p.pengguna_id = u.id`.',
      'Pengguna tanpa pesanan akan punya `p.id` bernilai NULL di baris hasilnya.',
      'Sisakan baris itu dengan `WHERE p.id IS NULL`.',
    ],
    solution: {
      code: `
        SELECT u.id, u.nama, u.email
        FROM pengguna AS u
        LEFT JOIN pesanan AS p ON p.pengguna_id = u.id   -- semua pengguna tetap ikut
        WHERE p.id IS NULL;   -- sisakan yang tidak punya pasangan pesanan
      `,
      steps: [
        '`FROM pengguna AS u` menjadikan `pengguna` sebagai tabel kiri, yaitu tabel yang semua barisnya dipertahankan.',
        '`LEFT JOIN pesanan AS p ON p.pengguna_id = u.id` memasangkan setiap pengguna dengan pesanannya. Pengguna yang tidak punya pesanan tetap ikut, dengan semua kolom `p` bernilai NULL.',
        '`WHERE p.id IS NULL` menyisakan baris yang kolom `p.id`-nya NULL. Karena `pesanan.id` tidak pernah NULL pada pesanan sungguhan, NULL di sini pasti berarti tidak ada pasangan.',
        '`SELECT u.id, u.nama, u.email` mengambil data pengguna yang tersisa.',
      ],
      explanation:
        'Kuncinya ada di kolom yang diperiksa dengan `IS NULL`. Pilih kolom dari tabel kanan yang di baris aslinya tidak mungkin NULL, misalnya `p.id`. Dengan begitu NULL di hasil pasti berasal dari `LEFT JOIN` yang tidak menemukan pasangan, bukan dari data yang memang kosong.',
    },
    alternativeSolutions: [
      `
        SELECT u.id, u.nama, u.email
        FROM pengguna u
        WHERE NOT EXISTS (
          SELECT 1 FROM pesanan p WHERE p.pengguna_id = u.id
        );
      `,
      `
        select u.id, u.nama, u.email
        from pesanan p
        right join pengguna u on u.id = p.pengguna_id
        where p.pengguna_id is null;
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          SELECT u.id, u.nama, u.email
          FROM pengguna u
          JOIN pesanan p ON p.pengguna_id = u.id;
        `,
        reason:
          '`JOIN` biasa justru hanya menyisakan pengguna yang punya pesanan, yaitu kebalikan dari yang dicari.',
      },
      {
        code: `
          SELECT u.id, u.nama, u.email
          FROM pengguna u
          LEFT JOIN pesanan p ON p.pengguna_id = u.id
          WHERE p.id = NULL;
        `,
        reason:
          '`= NULL` tidak pernah bernilai benar, sehingga query ini selalu mengembalikan nol baris tanpa error.',
      },
      {
        code: `
          SELECT u.id, u.nama, u.email
          FROM pesanan p
          LEFT JOIN pengguna u ON u.id = p.pengguna_id
          WHERE u.id IS NULL;
        `,
        reason:
          'Arahnya terbalik. Yang dipertahankan semua pesanan, bukan semua pengguna, sehingga pengguna tanpa pesanan tidak pernah muncul.',
      },
      {
        code: `
          SELECT u.id, u.nama, u.email
          FROM pengguna u
          LEFT JOIN pesanan p ON p.pengguna_id = u.id
          WHERE u.kota IS NULL;
        `,
        reason:
          'Memeriksa `kota` milik pengguna, bukan kolom pesanan, sehingga yang tersaring adalah pengguna tanpa kota.',
      },
    ],
    check: mesinStruktur('sql', [
      wajibStruktur(
        'cari-tanpa-pasangan',
        'Memakai `LEFT JOIN ... IS NULL` atau `NOT EXISTS`',
        'Pakai `LEFT JOIN pesanan ... WHERE p.id IS NULL`, atau `WHERE NOT EXISTS (SELECT 1 FROM pesanan ...)`.',
        `${antiJoinIsNull('id|pengguna_id')}|\\bnot\\s+exists\\s*\\(|\\bnot\\s+in\\s*\\(\\s*select\\b`,
      ),
      wajibStruktur(
        'pengguna-dipertahankan',
        'Tabel `pengguna` berada di sisi yang dipertahankan',
        'Tulis `FROM pengguna` lalu `LEFT JOIN pesanan`. Tabel setelah `FROM` adalah tabel yang semua barisnya dipertahankan.',
        '\\bfrom\\s+pengguna\\b|\\bright\\s+(outer\\s+)?join\\s+pengguna\\b',
      ),
      larangStruktur(
        'tanpa-sama-dengan-null',
        'Tidak membandingkan NULL memakai `=`',
        '`= NULL` tidak pernah bernilai benar. Pakai `IS NULL`.',
        '(=|<>|!=)\\s*null\\b',
      ),
      wajibStruktur(
        'pilih-nama-email',
        'Mengambil `nama` dan `email`',
        'Kolom `nama` dan `email` belum sama-sama disebut di `SELECT`.',
        kolomDiSelect(['nama', 'email']),
      ),
    ]),
  }),

  soal({
    slug: 'sql-having-total-belanja',
    title: 'Saring hasil `GROUP BY` dengan `HAVING`',
    topic: 'sql',
    level: 'intermediate',
    realWorldUse:
      'Laporan pelanggan setia, kategori terlaris, atau penjual dengan komplain terbanyak. Semuanya menyaring hasil hitungan per kelompok, dan itu tugas `HAVING`, bukan `WHERE`.',
    source: SUMBER,
    brief: {
      situation:
        'Toko ingin memberi hadiah kepada pelanggan yang total belanjanya di atas Rp1.000.000. Hanya pesanan berstatus selesai yang dihitung, karena pesanan yang dibatalkan tidak pernah dibayar. Kamu perlu menjumlahkan belanja setiap pengguna, lalu menyisakan pengguna yang jumlahnya lewat satu juta.',
      tasks: [
        'Hitung jumlah `total` untuk setiap `pengguna_id` dan beri nama kolomnya `total_belanja`.',
        'Hitung hanya pesanan dengan `status` bernilai `selesai`.',
        'Sisakan pengguna yang `SUM(total)`-nya lebih dari `1000000`.',
        'Urutkan dari total belanja terbesar.',
      ],
      given: SKEMA_TOKO,
      pitfalls: [
        'Fungsi agregat seperti `SUM` tidak boleh dipakai di `WHERE`. PostgreSQL menolaknya dengan error `aggregate functions are not allowed in WHERE`, karena `WHERE` bekerja sebelum baris dikelompokkan.',
        'Di PostgreSQL, `HAVING` tidak bisa memakai alias dari `SELECT`. `HAVING total_belanja > 1000000` gagal dengan error `column "total_belanja" does not exist`. Tulis ulang ekspresinya, yaitu `HAVING SUM(total) > 1000000`. Anehnya, `ORDER BY` justru boleh memakai alias.',
        "Syarat `status = 'selesai'` ditaruh di `WHERE`, bukan di `HAVING`. Status adalah sifat tiap pesanan, jadi ia harus disaring sebelum pesanan-pesanan itu dijumlahkan.",
      ],
      terms: [
        {
          term: 'HAVING',
          meaning:
            'Klausa untuk menyaring kelompok hasil `GROUP BY`, berdasarkan nilai agregatnya. `WHERE` menyaring baris satu per satu sebelum dikelompokkan, sedangkan `HAVING` menyaring kelompok setelah dihitung. Karena itu hanya `HAVING` yang bisa melihat hasil `SUM`.',
        },
        {
          term: 'SUM',
          meaning:
            'Fungsi agregat yang menjumlahkan nilai sebuah kolom di setiap kelompok. `SUM(total)` bersama `GROUP BY pengguna_id` menghasilkan satu angka untuk setiap pengguna, yaitu jumlah total semua pesanannya.',
        },
        {
          term: 'urutan eksekusi query',
          meaning:
            'Database tidak menjalankan query dari atas ke bawah seperti yang tertulis. Urutannya kira-kira `FROM`, lalu `WHERE`, lalu `GROUP BY`, lalu `HAVING`, lalu `SELECT`, lalu `ORDER BY`. Urutan inilah yang menjelaskan kenapa alias dari `SELECT` belum dikenal di `HAVING`.',
        },
      ],
    },
    rules: [
      "Menyaring `status = 'selesai'` di `WHERE`.",
      'Memakai `GROUP BY pengguna_id`.',
      'Memakai `HAVING SUM(total) > 1000000`.',
      'Diurutkan dari yang terbesar.',
    ],
    starter: `
      -- tulis query di sini
    `,
    hints: [
      'Susun dulu query `SELECT pengguna_id, SUM(total) AS total_belanja FROM pesanan GROUP BY pengguna_id`.',
      'Syarat status ditaruh di `WHERE`, di antara `FROM` dan `GROUP BY`.',
      'Syarat jumlah belanja ditaruh di `HAVING`, setelah `GROUP BY`, dengan menulis ulang `SUM(total)`.',
    ],
    solution: {
      code: `
        SELECT pengguna_id, SUM(total) AS total_belanja
        FROM pesanan
        WHERE status = 'selesai'          -- saring BARIS sebelum dikelompokkan
        GROUP BY pengguna_id
        HAVING SUM(total) > 1000000       -- saring KELOMPOK setelah dijumlahkan
        ORDER BY total_belanja DESC;      -- di ORDER BY, alias boleh dipakai
      `,
      steps: [
        "`WHERE status = 'selesai'` membuang pesanan yang belum atau tidak selesai, sebelum apa pun dijumlahkan.",
        '`GROUP BY pengguna_id` mengumpulkan pesanan yang tersisa berdasarkan pemiliknya.',
        '`SUM(total) AS total_belanja` menjumlahkan total di setiap kelompok dan memberi nama kolom hasilnya.',
        '`HAVING SUM(total) > 1000000` membuang kelompok yang jumlahnya belum lewat satu juta. Ekspresinya ditulis ulang karena alias `total_belanja` belum dikenal di tahap ini.',
        '`ORDER BY total_belanja DESC` mengurutkan dari yang terbesar. Di tahap ini alias sudah dikenal, jadi boleh dipakai.',
      ],
      explanation:
        'Soal ini melatih perbedaan `WHERE` dan `HAVING`. `WHERE` menyaring baris sebelum dikelompokkan, jadi syarat per pesanan seperti status ditaruh di sana. `HAVING` menyaring kelompok setelah dihitung, jadi syarat atas hasil `SUM` ditaruh di sana. Menukar keduanya membuat query gagal, atau lebih buruk lagi, berjalan dengan angka yang salah.',
    },
    alternativeSolutions: [
      `
        select pengguna_id, sum(total) as total_belanja
        from pesanan
        where status = 'selesai'
        group by pengguna_id
        having sum(total) > 1000000
        order by sum(total) desc;
      `,
      `
        SELECT p.pengguna_id, SUM(p.total) total_belanja
        FROM pesanan p
        WHERE p.status = 'selesai'
        GROUP BY p.pengguna_id
        HAVING SUM(p.total) > 1_000_000
        ORDER BY 2 DESC;
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          SELECT pengguna_id, SUM(total) AS total_belanja
          FROM pesanan
          WHERE status = 'selesai'
          GROUP BY pengguna_id
          HAVING total_belanja > 1000000
          ORDER BY total_belanja DESC;
        `,
        reason:
          '`HAVING` memakai alias `total_belanja`, dan PostgreSQL menolaknya karena alias itu belum dikenal di tahap `HAVING`.',
      },
      {
        code: `
          SELECT pengguna_id, SUM(total) AS total_belanja
          FROM pesanan
          WHERE status = 'selesai' AND SUM(total) > 1000000
          GROUP BY pengguna_id
          ORDER BY total_belanja DESC;
        `,
        reason:
          'Memakai `SUM` di `WHERE`, padahal `WHERE` bekerja sebelum baris dikelompokkan. PostgreSQL menolaknya dengan error.',
      },
      {
        code: `
          SELECT pengguna_id, SUM(total) AS total_belanja
          FROM pesanan
          GROUP BY pengguna_id
          HAVING SUM(total) > 1000000
          ORDER BY total_belanja DESC;
        `,
        reason:
          'Pesanan yang dibatalkan ikut dijumlahkan, sehingga pengguna yang belum pernah benar-benar belanja satu juta ikut mendapat hadiah.',
      },
    ],
    check: mesinStruktur('sql', [
      wajibStruktur(
        'jumlah-dinamai',
        'Menghitung `SUM(total)` dengan nama `total_belanja`',
        'Tulis `SUM(total) AS total_belanja` di `SELECT`.',
        '\\bsum\\s*\\(\\s*(\\w+\\.)?total\\s*\\)\\s+(as\\s+)?total_belanja\\b',
      ),
      wajibStruktur(
        'saring-status',
        "Menyaring `status = 'selesai'` di `WHERE`",
        'Syarat status ditaruh di `WHERE`, sebelum `GROUP BY`, supaya pesanan lain tidak ikut dijumlahkan.',
        "\\bwhere\\s(?:(?!\\bgroup\\b)[\\s\\S])*?\\bstatus\\s*=\\s*'selesai'",
      ),
      larangStruktur(
        'agregat-bukan-di-where',
        'Tidak memakai fungsi agregat di `WHERE`',
        '`WHERE` bekerja sebelum baris dikelompokkan, jadi belum ada `SUM` yang bisa diperiksa. Pindahkan syaratnya ke `HAVING`.',
        '\\bwhere\\s(?:(?!\\bgroup\\b)[\\s\\S])*?\\b(sum|count|avg|min|max)\\s*\\(',
      ),
      wajibStruktur(
        'kelompok-pengguna',
        'Memakai `GROUP BY pengguna_id`',
        'Belum ada `GROUP BY pengguna_id`.',
        '\\bgroup\\s+by\\s+(\\w+\\.)?pengguna_id\\b',
      ),
      wajibStruktur(
        'having-sum',
        'Memakai `HAVING SUM(total) > 1000000`',
        'Tulis ulang ekspresinya di `HAVING`, yaitu `HAVING SUM(total) > 1000000`. Alias dari `SELECT` belum dikenal di sini.',
        '\\bhaving\\s+sum\\s*\\(\\s*(\\w+\\.)?total\\s*\\)\\s*>\\s*1_?000_?000\\b',
      ),
      urutStruktur(
        'urutan-klausa',
        'Urutan `WHERE`, `GROUP BY`, lalu `HAVING`',
        'Urutan klausanya tetap, yaitu `WHERE` lalu `GROUP BY` lalu `HAVING`.',
        ['\\bwhere\\b', '\\bgroup\\s+by\\b', '\\bhaving\\b'],
      ),
      wajibStruktur(
        'urut-terbesar',
        'Diurutkan dari total belanja terbesar',
        'Tambahkan `ORDER BY total_belanja DESC` di akhir query.',
        '\\border\\s+by\\s+(sum\\s*\\(\\s*(\\w+\\.)?total\\s*\\)|total_belanja|2)\\s+desc\\b',
      ),
    ]),
  }),

  soal({
    slug: 'sql-index-foreign-key',
    title: 'Percepat query dengan index pada foreign key',
    topic: 'sql',
    level: 'intermediate',
    realWorldUse:
      'Endpoint yang dulu cepat lalu melambat seiring bertambahnya data. Penyebab yang paling sering adalah kolom foreign key yang tidak punya index.',
    source: SUMBER,
    brief: {
      situation:
        'Halaman riwayat pesanan dulu terbuka seketika. Setelah tabel `pesanan` berisi dua juta baris, halaman yang sama butuh beberapa detik. Query di baliknya adalah `SELECT id, total, status FROM pesanan WHERE pengguna_id = $1`. Saat diperiksa dengan `EXPLAIN`, hasilnya memuat baris `Parallel Seq Scan on pesanan`, artinya database membaca seluruh tabel hanya untuk mencari pesanan milik satu orang.',
      tasks: [
        'Tulis perintah `CREATE INDEX` pada tabel `pesanan` untuk kolom `pengguna_id`.',
        'Beri nama index-nya `pesanan_pengguna_id_idx`. Nama ini tidak wajib, tapi memudahkan saat index-nya dicari nanti.',
      ],
      given: SKEMA_TOKO,
      pitfalls: [
        'PostgreSQL otomatis membuat index hanya untuk `PRIMARY KEY` dan `UNIQUE`. Kolom yang ditulis dengan `REFERENCES`, seperti `pengguna_id`, TIDAK otomatis diberi index. Ini berbeda dengan MySQL, yang membuatkannya secara otomatis.',
        'Jangan memakai `CREATE UNIQUE INDEX`. Satu pengguna boleh punya banyak pesanan, jadi index unik gagal dibuat selama ada pengguna dengan dua pesanan atau lebih.',
        'Index pada kolom `id` tidak membantu apa pun. `id` adalah primary key, sehingga index-nya sudah ada sejak tabel dibuat.',
      ],
      terms: [
        {
          term: 'index',
          meaning:
            'Struktur data tambahan yang menyimpan nilai sebuah kolom dalam keadaan terurut, beserta letak barisnya. Cara kerjanya mirip indeks di bagian belakang buku. Daripada membaca semua halaman, kamu langsung melompat ke halaman yang tepat.',
        },
        {
          term: 'Seq Scan',
          meaning:
            'Singkatan dari sequential scan, yaitu membaca seluruh tabel dari baris pertama sampai terakhir. Pada tabel besar PostgreSQL membagi pekerjaan ini ke beberapa proses dan menampilkannya sebagai `Parallel Seq Scan`, tapi seluruh tabel tetap dibaca. Untuk tabel kecil ini wajar. Untuk jutaan baris yang hanya dicari beberapa, ini pemborosan. Setelah ada index, `EXPLAIN` biasanya menampilkan `Index Scan` atau `Bitmap Index Scan`.',
        },
        {
          term: 'EXPLAIN',
          meaning:
            'Perintah yang ditulis di depan sebuah query untuk melihat rencana eksekusinya, yaitu cara database akan menjalankan query itu. Contohnya `EXPLAIN SELECT ...`. `EXPLAIN ANALYZE` benar-benar menjalankannya dan ikut melaporkan waktu yang dihabiskan.',
        },
        {
          term: 'CONCURRENTLY',
          meaning:
            'Pilihan pada `CREATE INDEX CONCURRENTLY` yang membangun index tanpa menahan penulisan ke tabel. Prosesnya lebih lama, tapi aplikasi tetap bisa menyimpan pesanan baru selama index dibangun. Pilihan ini tidak bisa dijalankan di dalam transaksi.',
        },
      ],
    },
    rules: ['Membuat index pada `pesanan (pengguna_id)`.', 'Bukan `UNIQUE INDEX`.'],
    starter: `
      -- tulis perintah di sini
    `,
    hints: [
      'Bentuk umumnya `CREATE INDEX nama_index ON tabel (kolom);`.',
      'Tabelnya `pesanan` dan kolomnya `pengguna_id`.',
      'Tulis `CREATE INDEX pesanan_pengguna_id_idx ON pesanan (pengguna_id);`.',
    ],
    solution: {
      code: `
        -- PostgreSQL TIDAK otomatis membuat index untuk kolom REFERENCES
        CREATE INDEX pesanan_pengguna_id_idx ON pesanan (pengguna_id);
      `,
      steps: [
        '`CREATE INDEX pesanan_pengguna_id_idx` memberi nama pada index baru. Nama ini muncul di hasil `EXPLAIN` dan saat index perlu dihapus.',
        '`ON pesanan (pengguna_id)` menentukan tabel dan kolom yang diindeks.',
        'Setelah index jadi, query `WHERE pengguna_id = $1` langsung melompat ke baris milik pengguna itu, tanpa membaca dua juta baris lainnya.',
      ],
      explanation:
        'Setiap kolom foreign key yang dipakai untuk mencari atau menyambungkan tabel hampir selalu butuh index. PostgreSQL tidak membuatkannya otomatis, sehingga masalahnya baru terasa saat datanya sudah besar. Di tabel yang sedang dipakai di production, tulis `CREATE INDEX CONCURRENTLY` supaya penyimpanan pesanan baru tidak tertahan selama index dibangun.',
    },
    alternativeSolutions: [
      `
        create index concurrently if not exists pesanan_pengguna_id_idx on pesanan using btree (pengguna_id);
      `,
      `
        CREATE INDEX ON pesanan (pengguna_id, dibuat_pada DESC);
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          CREATE UNIQUE INDEX pesanan_pengguna_id_idx ON pesanan (pengguna_id);
        `,
        reason:
          'Index unik melarang satu pengguna punya dua pesanan, sehingga pembuatannya gagal selama data seperti itu sudah ada.',
      },
      {
        code: `
          CREATE INDEX pesanan_id_idx ON pesanan (id);
        `,
        reason:
          'Kolom `id` sudah punya index dari primary key, dan query yang lambat mencari berdasarkan `pengguna_id`, bukan `id`.',
      },
      {
        code: `
          CREATE INDEX ON pesanan (status, pengguna_id);
        `,
        reason:
          'Index gabungan hanya membantu pencarian yang dimulai dari kolom pertamanya, yaitu `status`, sehingga pencarian berdasarkan `pengguna_id` saja tidak terbantu.',
      },
    ],
    check: mesinStruktur('sql', [
      wajibStruktur(
        'index-pengguna-id',
        'Membuat index pada `pesanan (pengguna_id)`',
        'Tulis `CREATE INDEX ... ON pesanan (pengguna_id)`. Kolom `pengguna_id` harus menjadi kolom pertama di dalam kurung.',
        '\\bcreate\\s+(unique\\s+)?index\\s+(concurrently\\s+)?(if\\s+not\\s+exists\\s+)?(\\w+\\s+)?on\\s+(only\\s+)?pesanan\\s*(using\\s+\\w+\\s*)?\\(\\s*pengguna_id\\b',
      ),
      larangStruktur(
        'bukan-unik',
        'Bukan `UNIQUE INDEX`',
        'Satu pengguna boleh punya banyak pesanan. Index unik melarang itu, jadi pakai `CREATE INDEX` biasa.',
        '\\bcreate\\s+unique\\s+index\\b',
      ),
      larangStruktur(
        'bukan-index-id',
        'Tidak membuat index untuk `id`',
        'Kolom `id` sudah punya index dari primary key. Yang perlu diindeks adalah `pengguna_id`.',
        '\\bon\\s+(only\\s+)?pesanan\\s*(using\\s+\\w+\\s*)?\\(\\s*id\\s*\\)',
      ),
    ]),
  }),
];
