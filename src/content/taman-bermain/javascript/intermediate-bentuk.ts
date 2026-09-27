import { mesinJs, nilai, soal, wajib } from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * JavaScript — Intermediate, exercises 15–21: reshaping data.
 *
 * These are the shapes that sit between an API response and a screen. None of them is exotic, and
 * all of them are where a project quietly accumulates bugs: a grouping that loses a category, a
 * tree builder that drops an orphan, an update that mutates the array a dozen components share.
 */

const KATEGORI = `
const data = [
  { id: 1, indukId: null, nama: 'Elektronik' },
  { id: 2, indukId: 1, nama: 'Laptop' },
  { id: 3, indukId: null, nama: 'Buku' },
];
`;

export const exercises: Exercise[] = [
  soal({
    slug: 'total-per-kelompok',
    title: 'Kelompokkan lalu jumlahkan per kelompok',
    topic: 'bentuk-data',
    level: 'intermediate',
    realWorldUse:
      'Laporan penjualan per kategori, rekap pengeluaran per bulan, dan hampir setiap grafik batang yang pernah kamu lihat di dashboard.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Pemilik toko ingin melihat grafik penjualan per kategori, misalnya berapa total uang dari kategori buku dan berapa dari kategori alat tulis. Data yang kamu terima dari server berupa daftar transaksi satu per satu. Sebelum bisa digambar menjadi grafik, transaksi itu harus dikelompokkan per kategori lalu dijumlahkan.',
      tasks: [
        'Buat fungsi bernama `totalPerKategori` yang menerima array transaksi.',
        'Setiap transaksi berbentuk `{ kategori, jumlah }`, dengan `jumlah` berupa angka.',
        'Kembalikan satu objek yang key-nya nama kategori dan nilainya total `jumlah` untuk kategori itu.',
        'Contohnya dua transaksi buku senilai 10000 dan 2500 menghasilkan `{ buku: 12500 }`.',
      ],
      pitfalls: [
        'Kategori yang baru pertama kali muncul belum punya nilai di objek hasil. Kalau langsung dijumlahkan, `undefined + 10000` menghasilkan `NaN`, dan `NaN` menular ke setiap penjumlahan berikutnya di kategori itu.',
        'Jangan menimpa nilai lama dengan nilai baru. Yang diminta adalah menjumlahkan, bukan menyimpan transaksi terakhir.',
        'Transaksi bernilai `0` tetap membuat kategorinya muncul di hasil dengan nilai `0`.',
      ],
      terms: [
        {
          term: 'group by',
          meaning:
            'Istilah dari dunia database untuk mengelompokkan baris data berdasarkan nilai kolom tertentu, lalu menghitung sesuatu per kelompok. Di SQL bentuknya `GROUP BY kategori`. Di soal ini kamu melakukan hal yang sama, tapi di JavaScript.',
        },
        {
          term: '?? (nullish coalescing)',
          meaning:
            'Operator yang memberi nilai cadangan kalau nilai di kirinya `null` atau `undefined`. `hasil.buku ?? 0` bernilai `0` kalau `hasil.buku` belum ada. Bedanya dengan `||`, operator `??` tidak menganggap angka `0` sebagai kosong.',
        },
        {
          term: 'objek sebagai kamus',
          meaning:
            'Memakai objek biasa untuk menyimpan pasangan nama dan nilai, seperti kamus yang menyimpan kata dan artinya. `hasil[t.kategori]` membaca atau menulis nilai berdasarkan nama kategori yang disimpan di variabel.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `totalPerKategori`.',
      'Array kosong menghasilkan objek kosong.',
    ],
    starter: `
      function totalPerKategori(transaksi) {
        // hasilnya seperti { buku: 12500, alat: 5000 }
      }
    `,
    hints: [
      'Kamu membawa satu objek hasil dari transaksi ke transaksi. Itu bentuk `.reduce()`.',
      'Sebelum menambah, pastikan kategorinya sudah punya nilai awal `0`.',
      '`hasil[t.kategori] = (hasil[t.kategori] ?? 0) + t.jumlah;`',
    ],
    solution: {
      code: `
        function totalPerKategori(transaksi) {
          return transaksi.reduce((hasil, t) => {
            // Kategori yang baru pertama muncul belum punya nilai, jadi mulai dari 0.
            hasil[t.kategori] = (hasil[t.kategori] ?? 0) + t.jumlah;
            return hasil; // objek yang sama dibawa ke transaksi berikutnya
          }, {}); // mulai dari objek kosong
        }
      `,
      steps: [
        '`reduce` dimulai dengan objek kosong `{}` sebagai nilai awal `hasil`.',
        'Untuk setiap transaksi, `hasil[t.kategori] ?? 0` membaca total kategori itu, atau `0` kalau kategorinya baru pertama kali muncul.',
        'Nilai itu ditambah `t.jumlah`, lalu disimpan kembali ke `hasil[t.kategori]`.',
        '`return hasil` mengirim objek yang sudah diperbarui ke putaran berikutnya. Setelah transaksi terakhir, objek itulah hasil akhirnya.',
      ],
      explanation:
        '`?? 0` adalah inti soal ini. Tanpanya, kategori yang baru pertama muncul bernilai `undefined`, dan `undefined + 10000` menghasilkan `NaN` yang menular ke setiap penjumlahan berikutnya di kategori itu.',
    },
    alternativeSolutions: [
      `
        function totalPerKategori(transaksi) {
          const hasil = {};
          for (const t of transaksi) {
            if (!(t.kategori in hasil)) hasil[t.kategori] = 0;
            hasil[t.kategori] += t.jumlah;
          }
          return hasil;
        }
      `,
      `
        const totalPerKategori = (transaksi) => {
          const hasil = {};
          transaksi.forEach((t) => {
            hasil[t.kategori] = (hasil[t.kategori] || 0) + t.jumlah;
          });
          return hasil;
        };
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function totalPerKategori(transaksi) {
            return transaksi.reduce((hasil, t) => {
              hasil[t.kategori] = hasil[t.kategori] + t.jumlah;
              return hasil;
            }, {});
          }
        `,
        reason: 'Tanpa nilai awal per kategori, kategori yang pertama muncul menghasilkan `NaN`.',
      },
      {
        code: `
          function totalPerKategori(transaksi) {
            return transaksi.reduce((hasil, t) => {
              hasil[t.kategori] = t.jumlah;
              return hasil;
            }, {});
          }
        `,
        reason:
          'Menimpa nilai alih-alih menjumlahkan, sehingga hanya transaksi terakhir di setiap kategori yang terhitung.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `totalPerKategori`', '\\btotalPerKategori\\b')],
      [
        nilai(
          'dua-kategori',
          'Tiga transaksi dalam dua kategori',
          'totalPerKategori([{ kategori: "buku", jumlah: 10000 }, { kategori: "alat", jumlah: 5000 }, { kategori: "buku", jumlah: 2500 }])',
          { buku: 12500, alat: 5000 },
          { visible: true },
        ),
        nilai('kosong', 'Tanpa transaksi', 'totalPerKategori([])', {}, {}),
        nilai(
          'satu-kategori',
          'Semuanya satu kategori',
          'totalPerKategori([{ kategori: "buku", jumlah: 100 }, { kategori: "buku", jumlah: 200 }])',
          { buku: 300 },
          {},
        ),
        nilai(
          'jumlah-nol',
          'Transaksi bernilai nol tetap membuat kategorinya muncul',
          'totalPerKategori([{ kategori: "alat", jumlah: 0 }])',
          { alat: 0 },
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'bangun-pohon-kategori',
    title: 'Bangun tree dari array yang datar',
    topic: 'bentuk-data',
    level: 'intermediate',
    realWorldUse:
      'Kategori bersarang, menu navigasi bertingkat, dan komentar yang saling membalas. Database menyimpannya datar dengan kolom `parent_id`, padahal tampilan butuh bentuk bersarang.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Toko online punya kategori bertingkat. Elektronik punya anak Laptop, dan Laptop bisa punya anak lagi. Di database, semua kategori disimpan dalam satu tabel datar, dan setiap baris mencatat siapa induknya lewat kolom `indukId`. Menu navigasi di website butuh bentuk bersarang supaya bisa ditampilkan sebagai menu yang bisa dibuka tutup.',
      tasks: [
        'Buat fungsi bernama `bangunPohon` yang menerima array datar berisi objek `{ id, indukId, nama }`.',
        'Kategori dengan `indukId` bernilai `null` adalah akar, yaitu kategori paling atas.',
        'Kembalikan array berisi akar. Setiap simpul berbentuk `{ id, nama, anak }`, dengan `anak` berupa array simpul turunannya.',
        'Simpul tanpa turunan tetap punya `anak` berupa array kosong.',
      ],
      pitfalls: [
        'Anak bisa muncul lebih dulu daripada induknya di dalam array. Kalau kamu hanya menelusuri sekali dan berharap induk selalu sudah ada, anak itu akan hilang dari hasil.',
        'Jangan lupa key `anak` pada simpul yang tidak punya turunan. Komponen menu biasanya memanggil `.map()` pada `anak`, dan `.map()` pada `undefined` melempar error.',
      ],
      terms: [
        {
          term: 'tree',
          meaning:
            'Struktur data bercabang seperti silsilah keluarga. Ada simpul paling atas yang disebut root atau akar, dan setiap simpul bisa punya beberapa anak. Folder di komputermu adalah contoh tree, karena satu folder bisa berisi folder lain.',
        },
        {
          term: 'parent_id',
          meaning:
            'Kolom yang menyimpan id induk sebuah baris, dan cara paling umum menyimpan tree di database. Di soal ini namanya `indukId`. Nilai `null` berarti baris itu tidak punya induk, sehingga ia menjadi akar.',
        },
        {
          term: 'lookup object',
          meaning:
            'Objek yang dipakai untuk mencari data dengan cepat berdasarkan key. Kalau semua simpul disimpan di objek dengan id sebagai key, induk dengan id 1 bisa ditemukan langsung lewat `peta[1]` tanpa menelusuri seluruh array.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `bangunPohon`.',
      'Setiap simpul punya key `id`, `nama`, dan `anak`.',
      'Simpul tanpa turunan tetap punya `anak` berupa array kosong.',
    ],
    starter: `
      function bangunPohon(datar) {
        // ubah array datar menjadi tree bersarang
      }
    `,
    hints: [
      'Dua kali penelusuran lebih mudah daripada satu. Buat dulu semua simpul, baru sambungkan.',
      'Simpan semua simpul di objek dengan id sebagai key, supaya induknya bisa ditemukan tanpa mencari ulang.',
      'Di penelusuran kedua, kalau `indukId` bernilai `null`, masukkan ke akar. Kalau tidak, masukkan ke `anak` milik induknya.',
    ],
    solution: {
      code: `
        function bangunPohon(datar) {
          // Penelusuran 1. Buat semua simpul lebih dulu, disimpan per id.
          const peta = {};
          for (const item of datar) {
            peta[item.id] = { id: item.id, nama: item.nama, anak: [] };
          }

          // Penelusuran 2. Sambungkan setiap simpul ke induknya.
          const akar = [];
          for (const item of datar) {
            if (item.indukId === null) {
              akar.push(peta[item.id]); // tidak punya induk, berarti akar
            } else if (peta[item.indukId]) {
              peta[item.indukId].anak.push(peta[item.id]); // masuk ke anak milik induk
            }
          }

          return akar;
        }
      `,
      steps: [
        'Penelusuran pertama membuat satu simpul `{ id, nama, anak: [] }` untuk setiap baris, lalu menyimpannya di `peta` dengan id sebagai key.',
        'Setelah penelusuran pertama selesai, SEMUA simpul sudah ada di `peta`, apa pun urutan barisnya.',
        'Penelusuran kedua memeriksa `indukId` setiap baris. Yang bernilai `null` dimasukkan ke array `akar`.',
        'Yang punya induk dimasukkan ke `anak` milik simpul induknya, yang diambil langsung dari `peta[item.indukId]`.',
        'Karena simpul yang sama dipakai bersama, menambah anak ke simpul di `peta` otomatis ikut terlihat di dalam `akar`.',
      ],
      explanation:
        'Dua penelusuran itu disengaja. Satu penelusuran hanya bekerja kalau induk selalu muncul sebelum anaknya, dan asumsi itu benar sampai ada yang mengubah urutan `ORDER BY` di query. Membuat semua simpul lebih dulu membuat urutan data masukan tidak lagi jadi syarat.',
    },
    alternativeSolutions: [
      `
        function bangunPohon(datar) {
          const peta = new Map(datar.map((item) => [item.id, { id: item.id, nama: item.nama, anak: [] }]));
          const akar = [];
          for (const item of datar) {
            const simpul = peta.get(item.id);
            const induk = peta.get(item.indukId);
            if (induk) induk.anak.push(simpul);
            else if (item.indukId === null) akar.push(simpul);
          }
          return akar;
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function bangunPohon(datar) {
            return datar
              .filter((item) => item.indukId === null)
              .map((item) => ({ id: item.id, nama: item.nama }));
          }
        `,
        reason: 'Akarnya sudah benar, tapi tidak ada key `anak` dan seluruh turunannya hilang.',
      },
      {
        code: `
          function bangunPohon(datar) {
            return datar.map((item) => ({ id: item.id, nama: item.nama, anak: [] }));
          }
        `,
        reason:
          'Mengembalikan array datar dengan `anak` kosong semua, sehingga tidak ada yang tersarang.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `bangunPohon`', '\\bbangunPohon\\b')],
      [
        nilai(
          'pohon-dua-akar',
          'Dua akar, salah satunya punya anak',
          'bangunPohon(data)',
          [
            { id: 1, nama: 'Elektronik', anak: [{ id: 2, nama: 'Laptop', anak: [] }] },
            { id: 3, nama: 'Buku', anak: [] },
          ],
          { visible: true, prelude: KATEGORI },
        ),
        nilai('kosong', 'Array kosong', 'bangunPohon([])', [], {}),
        nilai(
          'semua-akar',
          'Tidak ada yang punya induk',
          'bangunPohon([{ id: 1, indukId: null, nama: "A" }, { id: 2, indukId: null, nama: "B" }]).length',
          2,
          {},
        ),
        nilai(
          'tiga-tingkat',
          'Bersarang tiga tingkat',
          'bangunPohon([{ id: 1, indukId: null, nama: "A" }, { id: 2, indukId: 1, nama: "B" }, { id: 3, indukId: 2, nama: "C" }])[0].anak[0].anak[0].nama',
          'C',
          {},
        ),
        nilai(
          'anak-sebelum-induk',
          'Anak muncul lebih dulu daripada induknya',
          'bangunPohon([{ id: 2, indukId: 1, nama: "B" }, { id: 1, indukId: null, nama: "A" }])[0].anak[0].nama',
          'B',
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'gabung-dua-daftar',
    title: 'Gabungkan dua array berdasarkan key',
    topic: 'bentuk-data',
    level: 'intermediate',
    realWorldUse:
      'Menyatukan data pengguna dengan profilnya ketika keduanya datang dari endpoint yang berbeda. Pola ini muncul di hampir setiap halaman yang menampilkan data dari dua sumber.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Halaman daftar anggota mengambil data dari dua endpoint. Endpoint pertama memberi daftar pengguna berisi `id` dan `nama`. Endpoint kedua memberi daftar profil yang menyimpan kota asal dan menunjuk pemiliknya lewat `penggunaId`. Tidak semua pengguna sudah mengisi profil. Tabel di layar harus menampilkan setiap pengguna beserta profilnya kalau ada.',
      tasks: [
        'Buat fungsi bernama `gabungkan` yang menerima dua array, yaitu `pengguna` dan `profil`.',
        'Kembalikan array pengguna, dengan setiap pengguna mendapat key tambahan `profil` berisi profil yang `penggunaId`-nya sama dengan `id` pengguna itu.',
        'Pengguna yang tidak punya profil mendapat `profil` bernilai `null`.',
        'Jumlah elemen hasil selalu sama dengan jumlah pengguna.',
      ],
      pitfalls: [
        'Jangan membuang pengguna yang belum punya profil. Menghilangkan baris karena data pendampingnya belum ada adalah cara termudah membuat pengguna mengira akunnya lenyap.',
        'Yang diminta `null`, bukan `undefined`. `find()` mengembalikan `undefined` kalau tidak ketemu, jadi nilai itu perlu diubah.',
        'Profil yang pemiliknya tidak ada di daftar pengguna tidak ikut terbawa ke mana pun.',
      ],
      terms: [
        {
          term: 'join',
          meaning:
            'Istilah dari database untuk menggabungkan dua tabel berdasarkan kolom yang sama. Yang kamu kerjakan disebut left join, karena semua pengguna di sisi kiri tetap muncul meski pasangannya di sisi kanan tidak ada. Di SQL bentuknya `LEFT JOIN profil ON ...`.',
        },
        {
          term: 'Map',
          meaning:
            'Struktur data bawaan JavaScript untuk menyimpan pasangan key dan nilai, mirip objek. `new Map([[1, "a"]])` membuat Map dengan key `1`. Ambil nilainya dengan `.get(1)`. Map cocok untuk pencarian cepat berdasarkan id.',
        },
        {
          term: 'null vs undefined',
          meaning:
            'Keduanya berarti "tidak ada", tapi dengan niat berbeda. `undefined` muncul otomatis saat sesuatu belum diisi. `null` ditulis programmer dengan sengaja untuk berkata "kosong, dan itu disengaja". Di data yang dikirim ke tampilan, `null` lebih jelas maksudnya.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `gabungkan`.',
      'Pengguna tanpa profil tetap muncul, dengan `profil` bernilai `null`.',
      'Jumlah hasil selalu sama dengan jumlah pengguna.',
    ],
    starter: `
      function gabungkan(pengguna, profil) {
        // tambahkan key profil ke setiap pengguna
      }
    `,
    hints: [
      'Mencari di dalam array untuk setiap pengguna berarti menelusuri berulang kali.',
      'Buat dulu `Map` dari `penggunaId` ke profil, lalu telusuri penggunanya sekali saja.',
      'Memakai `profil.find(...)` di dalam `.map(...)` juga benar, hanya lebih lambat saat datanya besar.',
    ],
    solution: {
      code: `
        function gabungkan(pengguna, profil) {
          // Buat Map sekali di depan. Key-nya penggunaId, nilainya objek profil.
          const peta = new Map(profil.map((p) => [p.penggunaId, p]));

          // Setiap pengguna disalin, lalu ditambah key profil.
          // ?? null mengubah undefined (tidak ketemu) menjadi null.
          return pengguna.map((u) => ({ ...u, profil: peta.get(u.id) ?? null }));
        }
      `,
      steps: [
        '`profil.map((p) => [p.penggunaId, p])` membuat array berisi pasangan `[penggunaId, profil]`.',
        '`new Map(...)` mengubah pasangan itu menjadi Map, sehingga profil bisa dicari langsung lewat id pemiliknya.',
        '`pengguna.map(...)` membuat satu objek baru untuk setiap pengguna, dan `...u` menyalin semua key milik pengguna itu.',
        '`peta.get(u.id)` mengambil profilnya. Kalau tidak ada hasilnya `undefined`, dan `?? null` mengubahnya menjadi `null`.',
      ],
      explanation:
        'Map dibangun sekali di depan, sehingga menggabungkan 1.000 pengguna tidak berubah menjadi 1.000 kali penelusuran array. Untuk data kecil bedanya tidak terasa, tapi bentuk ini tidak lebih sulit ditulis dan tidak berubah menjadi masalah saat datanya bertambah.',
    },
    alternativeSolutions: [
      `
        function gabungkan(pengguna, profil) {
          return pengguna.map((u) => {
            const cocok = profil.find((p) => p.penggunaId === u.id);
            return { ...u, profil: cocok === undefined ? null : cocok };
          });
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function gabungkan(pengguna, profil) {
            return pengguna
              .map((u) => ({ ...u, profil: profil.find((p) => p.penggunaId === u.id) }))
              .filter((u) => u.profil);
          }
        `,
        reason: 'Membuang pengguna yang belum punya profil, sehingga jumlah hasilnya berkurang.',
      },
      {
        code: `
          function gabungkan(pengguna, profil) {
            return pengguna.map((u) => ({ ...u, profil: profil.find((p) => p.penggunaId === u.id) }));
          }
        `,
        reason: 'Pengguna tanpa profil mendapat `undefined`, bukan `null` seperti yang diminta.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `gabungkan`', '\\bgabungkan\\b')],
      [
        nilai(
          'satu-cocok',
          'Satu pengguna punya profil, satu belum',
          'gabungkan([{ id: 1, nama: "Ana" }, { id: 2, nama: "Budi" }], [{ penggunaId: 1, kota: "Bandung" }])',
          [
            { id: 1, nama: 'Ana', profil: { penggunaId: 1, kota: 'Bandung' } },
            { id: 2, nama: 'Budi', profil: null },
          ],
          { visible: true },
        ),
        nilai(
          'tanpa-profil',
          'Tidak ada profil sama sekali',
          'gabungkan([{ id: 1 }], []).length',
          1,
          {},
        ),
        nilai('tanpa-pengguna', 'Tidak ada pengguna', 'gabungkan([], [{ penggunaId: 1 }])', [], {}),
        nilai(
          'profil-yatim',
          'Profil yang pemiliknya tidak ada tidak ikut terbawa',
          'gabungkan([{ id: 1 }], [{ penggunaId: 9, kota: "Solo" }])[0].profil',
          null,
          {},
        ),
        nilai(
          'data-asal-utuh',
          'Key asli pengguna tetap ada',
          'gabungkan([{ id: 1, nama: "Ana" }], [])[0].nama',
          'Ana',
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'daftar-jadi-objek-id',
    title: 'Ubah array menjadi objek dengan `id` sebagai key',
    topic: 'bentuk-data',
    level: 'intermediate',
    realWorldUse:
      'Bentuk state yang dipakai hampir semua state manager. Data disimpan dengan id sebagai key supaya satu record bisa dibaca atau diperbarui tanpa menelusuri seluruh daftar.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Aplikasi chat menyimpan ratusan pesan. Setiap kali ada pesan yang disunting, aplikasi harus menemukan pesan itu dan memperbaruinya. Kalau pesan disimpan di array, setiap penyuntingan berarti menelusuri ratusan elemen. Kalau disimpan di objek dengan id sebagai key, pesan bisa langsung diambil lewat `pesan[id]`.',
      tasks: [
        'Buat fungsi bernama `keObjekById` yang menerima array berisi objek yang masing-masing punya `id`.',
        'Kembalikan satu objek, dengan `id` setiap elemen sebagai key dan elemen itu sendiri sebagai nilainya.',
        'Contohnya `[{ id: "a", n: 1 }]` menjadi `{ a: { id: "a", n: 1 } }`.',
      ],
      pitfalls: [
        'Kalau ada `id` yang sama dua kali, yang terakhir menang. Ini bukan pilihan sembarangan, karena data yang datang belakangan biasanya yang lebih baru.',
        'Key objek di JavaScript selalu berupa string. Id berupa angka `7` akan tersimpan sebagai key `"7"`, dan itu memang perilaku yang benar.',
      ],
      terms: [
        {
          term: 'normalized state',
          meaning:
            'Cara menyimpan data di state aplikasi dengan id sebagai key, alih-alih sebagai array. Bentuknya `{ "1": {...}, "2": {...} }`. Redux dan banyak state manager lain menyarankan bentuk ini karena satu record bisa dibaca dan diubah langsung.',
        },
        {
          term: 'Object.fromEntries()',
          meaning:
            'Fungsi bawaan yang membuat objek dari array berisi pasangan `[key, nilai]`. `Object.fromEntries([["a", 1], ["b", 2]])` menghasilkan `{ a: 1, b: 2 }`. Kebalikannya adalah `Object.entries()`.',
        },
        {
          term: 'key',
          meaning:
            'Nama yang dipakai untuk menyimpan dan mengambil nilai di dalam objek. Pada `{ nama: "Ana" }`, key-nya `nama`. Setiap key di satu objek unik, sehingga menulis ke key yang sudah ada akan menimpa nilai lamanya.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `keObjekById`.',
      '`id` yang muncul dua kali diambil yang terakhir.',
    ],
    starter: `
      function keObjekById(daftar) {
        // [{ id: "a" }] menjadi { a: { id: "a" } }
      }
    `,
    hints: [
      'Kamu membangun satu objek dari banyak elemen.',
      '`Object.fromEntries` menerima array berisi pasangan `[key, nilai]`.',
      '`Object.fromEntries(daftar.map((item) => [item.id, item]))`',
    ],
    solution: {
      code: `
        function keObjekById(daftar) {
          // Ubah setiap elemen menjadi pasangan [id, elemen], lalu jadikan satu objek.
          // Kalau ada id yang sama, pasangan terakhir menimpa yang sebelumnya.
          return Object.fromEntries(daftar.map((item) => [item.id, item]));
        }
      `,
      steps: [
        '`daftar.map((item) => [item.id, item])` mengubah setiap elemen menjadi pasangan, misalnya `["a", { id: "a", n: 1 }]`.',
        '`Object.fromEntries(...)` membaca pasangan itu satu per satu dan menjadikannya key dan nilai di satu objek baru.',
        'Kalau ada key yang sama, pasangan yang dibaca belakangan menimpa yang sebelumnya. Itulah kenapa yang terakhir menang.',
      ],
      explanation:
        '`Object.fromEntries` sudah menangani aturan "yang terakhir menang" tanpa diminta, karena key yang sama ditimpa saat objeknya dibangun. Perilaku itu gratis di sini, sementara kalau memakai `for` loop kamu harus memastikannya sendiri.',
    },
    alternativeSolutions: [
      `
        function keObjekById(daftar) {
          const hasil = {};
          for (const item of daftar) {
            hasil[item.id] = item;
          }
          return hasil;
        }
      `,
      `
        const keObjekById = (daftar) =>
          daftar.reduce((hasil, item) => {
            hasil[item.id] = item;
            return hasil;
          }, {});
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function keObjekById(daftar) {
            return Object.fromEntries(daftar.map((item, i) => [i, item]));
          }
        `,
        reason:
          'Memakai index sebagai key, bukan `id`, sehingga record tidak bisa dicari lewat id-nya.',
      },
      {
        code: `
          function keObjekById(daftar) {
            const hasil = {};
            for (const item of daftar) {
              if (!hasil[item.id]) hasil[item.id] = item;
            }
            return hasil;
          }
        `,
        reason:
          'Yang pertama menang, padahal soal meminta yang terakhir karena itu yang paling baru.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `keObjekById`', '\\bkeObjekById\\b')],
      [
        nilai(
          'dua-item',
          'Dua elemen dengan id berbeda',
          'keObjekById([{ id: "a", n: 1 }, { id: "b", n: 2 }])',
          { a: { id: 'a', n: 1 }, b: { id: 'b', n: 2 } },
          { visible: true },
        ),
        nilai('kosong', 'Array kosong', 'keObjekById([])', {}, {}),
        nilai(
          'id-rangkap',
          'Id yang sama dua kali, yang terakhir menang',
          'keObjekById([{ id: "a", n: 1 }, { id: "a", n: 9 }]).a.n',
          9,
          {},
        ),
        nilai(
          'id-angka',
          'Id berupa angka',
          'Object.keys(keObjekById([{ id: 7, n: 1 }]))',
          ['7'],
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'urutkan-bertingkat',
    title: 'Urutkan dengan kriteria bertingkat',
    topic: 'bentuk-data',
    level: 'intermediate',
    realWorldUse:
      'Tabel yang punya pengurutan kedua, misalnya daftar tugas diurutkan menurut prioritas lalu menurut nama, supaya urutannya tidak berubah-ubah setiap kali dimuat.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Aplikasi to do list menampilkan tugas dari prioritas tertinggi ke terendah. Masalahnya, banyak tugas yang prioritasnya sama. Kalau hanya diurutkan menurut prioritas, dua tugas berprioritas sama bisa bertukar posisi setiap kali halaman dimuat, dan pengguna melihat daftar yang seolah berubah sendiri. Solusinya menambahkan kriteria kedua, yaitu nama tugas secara alfabetis.',
      tasks: [
        'Buat fungsi bernama `urutkanTugas` yang menerima array tugas berbentuk `{ nama, prioritas }`.',
        'Urutkan menurut `prioritas` dari angka BESAR ke kecil.',
        'Tugas dengan prioritas sama diurutkan menurut `nama` secara alfabetis, dari A ke Z.',
        'Kembalikan array baru. Array yang dikirim masuk tidak boleh berubah.',
      ],
      pitfalls: [
        'Kriteria kedua bukan hiasan. Tanpanya urutan tugas berprioritas sama tidak dijamin tetap, sehingga daftar di layar bisa berubah tanpa ada data yang berubah.',
        'Perhatikan arahnya. Prioritas menurun memakai `b.prioritas - a.prioritas`, sedangkan nama menaik memakai `a.nama.localeCompare(b.nama)`.',
        'Seperti soal pengurutan sebelumnya, `.sort()` bekerja in place, jadi salin dulu array-nya.',
      ],
      terms: [
        {
          term: 'localeCompare()',
          meaning:
            'Method string untuk membandingkan dua teks secara alfabetis, lalu mengembalikan angka negatif, nol, atau positif. `"apel".localeCompare("jeruk")` bernilai negatif karena apel datang lebih dulu. Angka itu persis yang dibutuhkan compare function milik `sort()`.',
        },
        {
          term: 'multi-level sort',
          meaning:
            'Pengurutan dengan lebih dari satu kriteria. Kriteria kedua baru dipakai kalau kriteria pertama menghasilkan nilai yang sama. Contoh sehari-harinya daftar hadir kelas, yang diurutkan menurut nama belakang lalu menurut nama depan.',
        },
        {
          term: 'early return',
          meaning:
            'Pola menulis fungsi yang langsung mengembalikan hasil begitu jawabannya sudah pasti. Di compare function, kalau prioritasnya berbeda, hasil perbandingan prioritas langsung dikembalikan dan pemeriksaan nama tidak perlu dilakukan.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `urutkanTugas`.',
      'Prioritas besar lebih dulu, lalu nama secara alfabetis.',
      'Array yang dikirim masuk tidak boleh berubah.',
    ],
    starter: `
      function urutkanTugas(tugas) {
        // prioritas dari besar ke kecil, lalu nama dari A ke Z
      }
    `,
    hints: [
      'Compare function boleh memeriksa lebih dari satu field.',
      'Kalau kriteria pertama menghasilkan `0`, lanjutkan ke kriteria kedua.',
      '`.localeCompare()` membandingkan dua string dan mengembalikan angka, persis yang dibutuhkan `.sort()`.',
    ],
    solution: {
      code: `
        function urutkanTugas(tugas) {
          // Salin dulu, supaya array aslinya tidak ikut teracak.
          return [...tugas].sort((a, b) => {
            // Kriteria 1. Prioritas berbeda? Langsung putuskan, yang besar di depan.
            if (b.prioritas !== a.prioritas) return b.prioritas - a.prioritas;

            // Kriteria 2. Prioritas sama, urutkan nama dari A ke Z.
            return a.nama.localeCompare(b.nama);
          });
        }
      `,
      steps: [
        '`[...tugas]` menyalin array, lalu `.sort()` bekerja pada salinan itu.',
        'Compare function menerima dua tugas, `a` dan `b`.',
        'Kalau prioritasnya berbeda, `b.prioritas - a.prioritas` langsung dikembalikan. Urutan `b - a` membuat angka besar berada di depan.',
        'Kalau prioritasnya sama, baris pertama dilewati dan `a.nama.localeCompare(b.nama)` menentukan urutan alfabetis.',
      ],
      explanation:
        'Pola "kembalikan lebih awal kalau sudah berbeda" membuat pengurutan bertingkat tetap mudah dibaca, dan pola ini bisa ditumpuk untuk kriteria sebanyak yang dibutuhkan. Perhatikan arahnya, `b - a` untuk menurun dan `a.localeCompare(b)` untuk menaik.',
    },
    alternativeSolutions: [
      `
        const urutkanTugas = (tugas) =>
          tugas
            .slice()
            .sort((a, b) => b.prioritas - a.prioritas || (a.nama < b.nama ? -1 : a.nama > b.nama ? 1 : 0));
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function urutkanTugas(tugas) {
            return [...tugas].sort((a, b) => b.prioritas - a.prioritas);
          }
        `,
        reason: 'Tanpa kriteria kedua, urutan tugas yang prioritasnya sama tidak ditentukan.',
      },
      {
        code: `
          function urutkanTugas(tugas) {
            return tugas.sort((a, b) => b.prioritas - a.prioritas || a.nama.localeCompare(b.nama));
          }
        `,
        reason: 'Urutannya sudah benar, tapi array aslinya ikut teracak karena tidak disalin dulu.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `urutkanTugas`', '\\burutkanTugas\\b')],
      [
        nilai(
          'dua-kriteria',
          'Prioritas sama diurutkan menurut nama',
          'urutkanTugas([{ nama: "B", prioritas: 1 }, { nama: "C", prioritas: 2 }, { nama: "A", prioritas: 2 }])',
          [
            { nama: 'A', prioritas: 2 },
            { nama: 'C', prioritas: 2 },
            { nama: 'B', prioritas: 1 },
          ],
          { visible: true },
        ),
        nilai('kosong', 'Array kosong', 'urutkanTugas([])', [], {}),
        nilai(
          'prioritas-semua-sama',
          'Semua prioritasnya sama',
          'urutkanTugas([{ nama: "C", prioritas: 1 }, { nama: "A", prioritas: 1 }]).map((t) => t.nama)',
          ['A', 'C'],
          {},
        ),
        nilai(
          'asli-utuh',
          'Array asli tidak berubah urutannya',
          '(urutkanTugas(daftarTugas), daftarTugas[0].nama)',
          'B',
          {
            prelude: `
              const daftarTugas = [
                { nama: 'B', prioritas: 1 },
                { nama: 'A', prioritas: 2 },
              ];
            `,
          },
        ),
      ],
    ),
  }),

  soal({
    slug: 'perbarui-satu-item',
    title: 'Perbarui satu item tanpa mengubah array aslinya',
    topic: 'bentuk-data',
    level: 'intermediate',
    realWorldUse:
      'Memperbarui satu baris di state React atau state manager lain. Kalau array-nya diubah langsung, komponen tidak ikut menggambar ulang karena reference-nya tidak berubah.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Di aplikasi to do list berbasis React, pengguna mencentang satu tugas sebagai selesai. Daftar tugas tersimpan di state. React hanya tahu ada perubahan kalau kamu memberinya array BARU. Kalau kamu mengubah objek di dalam array yang lama, React mengira tidak ada yang berubah dan tampilannya tetap seperti sebelumnya.',
      tasks: [
        'Buat fungsi bernama `perbaruiItem` yang menerima tiga parameter, yaitu `daftar`, `id`, dan objek `perubahan`.',
        'Kembalikan array BARU, dengan elemen yang `id`-nya cocok sudah digabung dengan `perubahan`.',
        'Elemen lain dikembalikan apa adanya.',
        'Kalau `id`-nya tidak ada, kembalikan salinan array tanpa perubahan apa pun.',
      ],
      pitfalls: [
        'Array asli DAN objek di dalamnya tidak boleh berubah. `Object.assign(item, perubahan)` terlihat benar tapi mengubah objek yang lama, dan itulah bug yang membuat React tidak menggambar ulang.',
        'Perubahan hanya diterapkan ke satu elemen yang id-nya cocok, bukan ke semua elemen.',
      ],
      terms: [
        {
          term: 'immutable update',
          meaning:
            'Cara memperbarui data dengan membuat salinan baru yang sudah berubah, alih-alih mengubah data lama. Kalau diibaratkan revisi dokumen, kamu menyimpan versi baru dan tidak mencoret versi lama. React mengandalkan pola ini untuk mendeteksi perubahan.',
        },
        {
          term: 'reference',
          meaning:
            'Alamat tempat sebuah objek atau array tersimpan di memori. Dua variabel bisa menunjuk ke objek yang sama. React membandingkan reference, bukan isi, sehingga array yang isinya diubah tapi reference-nya sama dianggap tidak berubah.',
        },
        {
          term: 'spread untuk menggabung objek',
          meaning:
            '`{ ...lama, ...baru }` membuat objek baru berisi semua key dari `lama`, lalu ditimpa oleh key dari `baru`. `{ ...{ a: 1, b: 2 }, ...{ b: 9 } }` menghasilkan `{ a: 1, b: 9 }`. Objek `lama` sendiri tidak berubah.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `perbaruiItem`.',
      'Array asli dan objek di dalamnya tidak boleh berubah.',
      'Id yang tidak ditemukan mengembalikan array tanpa perubahan.',
    ],
    starter: `
      function perbaruiItem(daftar, id, perubahan) {
        // kembalikan array baru dengan satu item yang sudah diperbarui
      }
    `,
    hints: [
      '`.map()` sudah membuat array baru. Yang perlu kamu putuskan adalah isi setiap elemennya.',
      'Elemen yang cocok diganti dengan objek BARU, bukan objek lama yang diubah isinya.',
      '`daftar.map((item) => (item.id === id ? { ...item, ...perubahan } : item))`',
    ],
    solution: {
      code: `
        function perbaruiItem(daftar, id, perubahan) {
          return daftar.map((item) =>
            item.id === id
              ? { ...item, ...perubahan } // yang cocok diganti objek BARU hasil gabungan
              : item, // yang lain dikembalikan apa adanya
          );
        }
      `,
      steps: [
        '`daftar.map(...)` membuat array baru, sehingga reference array-nya berubah dan React tahu ada pembaruan.',
        'Untuk setiap elemen, `item.id === id` memeriksa apakah ini elemen yang ingin diperbarui.',
        'Kalau cocok, `{ ...item, ...perubahan }` membuat objek baru berisi isi lama yang ditimpa perubahan.',
        'Kalau tidak cocok, elemen dikembalikan apa adanya tanpa disalin.',
      ],
      explanation:
        'Yang dibuat baru hanya dua, yaitu array-nya dan satu objek yang berubah. Elemen lain sengaja dikembalikan apa adanya. Menyalin semuanya akan membuat setiap baris tampak berubah, sehingga komponen yang membandingkan reference akan menggambar ulang seluruh tabel hanya karena satu baris disunting.',
    },
    alternativeSolutions: [
      `
        function perbaruiItem(daftar, id, perubahan) {
          const hasil = [];
          for (const item of daftar) {
            hasil.push(item.id === id ? Object.assign({}, item, perubahan) : item);
          }
          return hasil;
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function perbaruiItem(daftar, id, perubahan) {
            const item = daftar.find((x) => x.id === id);
            if (item) Object.assign(item, perubahan);
            return daftar;
          }
        `,
        reason:
          'Mengubah objek asli secara langsung. Inilah bug yang membuat React tidak menggambar ulang tampilan.',
      },
      {
        code: `
          function perbaruiItem(daftar, id, perubahan) {
            return daftar.map((item) => ({ ...item, ...perubahan }));
          }
        `,
        reason:
          'Perubahan diterapkan ke SEMUA elemen, bukan hanya ke satu elemen yang id-nya cocok.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `perbaruiItem`', '\\bperbaruiItem\\b')],
      [
        nilai(
          'satu-berubah',
          'Satu tugas ditandai selesai',
          'perbaruiItem([{ id: 1, selesai: false }, { id: 2, selesai: false }], 1, { selesai: true })',
          [
            { id: 1, selesai: true },
            { id: 2, selesai: false },
          ],
          { visible: true },
        ),
        nilai(
          'id-tidak-ada',
          'Id yang tidak ada di array',
          'perbaruiItem([{ id: 1, n: 1 }], 99, { n: 5 })[0].n',
          1,
          {},
        ),
        nilai('kosong', 'Array kosong', 'perbaruiItem([], 1, { n: 1 })', [], {}),
        nilai(
          'objek-asli-utuh',
          'Objek di dalam array asli tidak ikut berubah',
          '(perbaruiItem(tugas, 1, { selesai: true }), tugas[0].selesai)',
          false,
          { prelude: 'const tugas = [{ id: 1, selesai: false }];' },
        ),
        nilai(
          'array-baru',
          'Array yang dikembalikan adalah array baru',
          'perbaruiItem(tugas, 1, {}) !== tugas',
          true,
          { prelude: 'const tugas = [{ id: 1, selesai: false }];' },
        ),
      ],
    ),
  }),

  soal({
    slug: 'ratakan-bersarang',
    title: 'Ratakan struktur yang bersarang',
    topic: 'bentuk-data',
    level: 'intermediate',
    realWorldUse:
      'Mengubah menu bertingkat menjadi daftar datar untuk fitur pencarian, membuat jejak breadcrumb, dan menghitung total item di seluruh cabang.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Menu navigasi dokumentasi punya bentuk bersarang. Bab berisi sub bab, dan sub bab bisa berisi sub bab lagi. Sekarang kamu diminta menambahkan kotak pencarian yang mencari di SEMUA judul menu. Mencari di struktur bersarang itu merepotkan, jadi semua judul dikumpulkan dulu ke satu array datar.',
      tasks: [
        'Buat fungsi bernama `ratakan` yang menerima array menu. Setiap elemen berbentuk `{ nama, anak }`, dan `anak` berisi array menu lagi.',
        'Kembalikan array berisi SEMUA `nama` dari seluruh tingkat.',
        'Urutannya induk dulu, baru turunannya.',
        'Kedalaman menu tidak dibatasi, jadi fungsinya harus bekerja untuk berapa pun tingkatnya.',
      ],
      pitfalls: [
        'Kamu tidak tahu sedalam apa menunya, jadi `for` loop bersarang dengan jumlah tetap tidak cukup. Butuh cara yang bisa menangani kedalaman berapa pun.',
        'Sebagian simpul terakhir tidak membawa key `anak` sama sekali. Bentuk seperti ini umum datang dari API, dan memanggil `ratakan(undefined)` akan melempar error.',
        'Masukkan nama induk SEBELUM nama anaknya, bukan sesudahnya.',
      ],
      terms: [
        {
          term: 'recursion (rekursi)',
          meaning:
            'Teknik ketika sebuah fungsi memanggil dirinya sendiri untuk menyelesaikan bagian yang lebih kecil dari masalah yang sama. Folder yang berisi folder bisa ditelusuri dengan fungsi "buka folder" yang memanggil dirinya sendiri untuk setiap folder di dalamnya. Rekursi selalu butuh kondisi berhenti.',
        },
        {
          term: 'flatten',
          meaning:
            'Meratakan struktur bersarang menjadi satu tingkat. `[1, [2, [3]]]` yang diratakan menjadi `[1, 2, 3]`. JavaScript punya `.flat()` dan `.flatMap()` untuk array biasa, tapi untuk objek bersarang seperti menu kamu perlu menulis logikanya sendiri.',
        },
        {
          term: 'depth-first',
          meaning:
            'Urutan penelusuran yang masuk sedalam mungkin ke satu cabang dulu sebelum pindah ke cabang sebelahnya. Pada menu Produk yang berisi Laptop lalu ada menu Blog, urutannya Produk, Laptop, lalu Blog.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `ratakan`.',
      'Urutannya induk dulu, baru turunannya.',
      'Kedalaman berapa pun harus bisa ditangani.',
    ],
    starter: `
      function ratakan(menu) {
        // kembalikan semua nama dalam satu array datar
      }
    `,
    hints: [
      'Fungsi yang memanggil dirinya sendiri adalah cara paling langsung menangani kedalaman yang tidak diketahui.',
      'Untuk setiap simpul, masukkan namanya lebih dulu, lalu ratakan anaknya.',
      'Periksa dulu apakah simpul itu punya key `anak` sebelum menelusurinya.',
    ],
    solution: {
      code: `
        function ratakan(menu) {
          const hasil = [];
          for (const simpul of menu) {
            hasil.push(simpul.nama); // induk dulu

            // Punya anak? Ratakan anaknya dengan fungsi yang sama, lalu gabungkan.
            if (simpul.anak) hasil.push(...ratakan(simpul.anak));
          }
          return hasil;
        }
      `,
      steps: [
        '`hasil` menampung semua nama yang sudah dikumpulkan.',
        'Untuk setiap simpul, namanya langsung dimasukkan ke `hasil`, sehingga induk selalu masuk lebih dulu.',
        '`if (simpul.anak)` memeriksa apakah simpul punya turunan. Simpul yang tidak membawa key `anak` dilewati dengan aman.',
        '`ratakan(simpul.anak)` memanggil fungsi yang sama untuk anak-anaknya. Hasilnya berupa array nama, lalu `...` menyebarkannya ke dalam `hasil`.',
        'Rekursi berhenti dengan sendirinya ketika sampai di simpul yang tidak punya anak.',
      ],
      explanation:
        'Rekursi di sini bukan soal kepintaran, melainkan bentuk yang paling jujur. Strukturnya memang mendefinisikan dirinya sendiri, karena menu berisi menu, jadi fungsinya boleh begitu juga. Penjagaan `if (simpul.anak)` menangani simpul terakhir yang tidak membawa key itu sama sekali.',
    },
    alternativeSolutions: [
      `
        function ratakan(menu) {
          return menu.flatMap((simpul) => [simpul.nama, ...ratakan(simpul.anak ?? [])]);
        }
      `,
      `
        function ratakan(menu) {
          const hasil = [];
          const tumpukan = [...menu].reverse();
          while (tumpukan.length > 0) {
            const simpul = tumpukan.pop();
            hasil.push(simpul.nama);
            const anak = simpul.anak ?? [];
            for (let i = anak.length - 1; i >= 0; i--) tumpukan.push(anak[i]);
          }
          return hasil;
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function ratakan(menu) {
            return menu.map((simpul) => simpul.nama);
          }
        `,
        reason: 'Hanya mengambil tingkat paling atas, sehingga seluruh turunannya hilang.',
      },
      {
        code: `
          function ratakan(menu) {
            const hasil = [];
            for (const simpul of menu) {
              if (simpul.anak) hasil.push(...ratakan(simpul.anak));
              hasil.push(simpul.nama);
            }
            return hasil;
          }
        `,
        reason: 'Anak dimasukkan sebelum induknya, sehingga urutannya terbalik.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `ratakan`', '\\bratakan\\b')],
      [
        nilai(
          'dua-tingkat',
          'Menu dua tingkat',
          'ratakan([{ nama: "Produk", anak: [{ nama: "Laptop", anak: [] }] }, { nama: "Blog", anak: [] }])',
          ['Produk', 'Laptop', 'Blog'],
          { visible: true },
        ),
        nilai('kosong', 'Menu kosong', 'ratakan([])', [], {}),
        nilai(
          'tiga-tingkat',
          'Bersarang tiga tingkat',
          'ratakan([{ nama: "A", anak: [{ nama: "B", anak: [{ nama: "C", anak: [] }] }] }])',
          ['A', 'B', 'C'],
          {},
        ),
        nilai(
          'tanpa-kunci-anak',
          'Simpul tanpa key anak sama sekali',
          'ratakan([{ nama: "A" }, { nama: "B" }])',
          ['A', 'B'],
          {},
        ),
      ],
    ),
  }),
];
