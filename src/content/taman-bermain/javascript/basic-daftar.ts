import { cetak, larang, mesinJs, nilai, soal, wajib } from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * JavaScript — Basic, exercises 1–7: working with lists.
 *
 * Every exercise here is a shape that turns up in the first week of any real project: reversing
 * an order, filtering, reshaping an API response, totalling, and finding one record. None of them
 * is a puzzle. That is the selection rule from PRD §2.5, and `realWorldUse` is where each one has
 * to justify itself.
 *
 * The hidden scenarios are where the teaching actually happens. An empty list, a single element,
 * and an id of `0` are the three cases that break naive answers, and none of them is visible in
 * the worked example.
 */

const PENGGUNA = `
const data = [
  { nama: 'Ana', aktif: true },
  { nama: 'Budi', aktif: false },
  { nama: 'Cici', aktif: true },
];
`;

export const exercises: Exercise[] = [
  soal({
    slug: 'balik-urutan-angka',
    title: 'Balik urutan angka dengan `for` loop',
    topic: 'daftar',
    level: 'basic',
    realWorldUse:
      'Menampilkan data terbaru lebih dulu. Daftar postingan, notifikasi, dan riwayat transaksi hampir selalu dibaca dari yang paling baru.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Bayangkan kamu membuat halaman riwayat transaksi. Datanya tersimpan berurutan dari yang paling lama, yaitu transaksi 1, 2, 3, 4, dan 5. Tapi pengguna ingin melihat yang paling baru di paling atas, jadi urutannya harus dibalik menjadi 5, 4, 3, 2, 1. Soal ini melatih logika membalik urutan itu dengan cara paling dasar, yaitu memakai `for` loop yang menghitung mundur.',
      tasks: [
        'Tulis kode yang mencetak angka `5`, `4`, `3`, `2`, dan `1` ke `console`.',
        'Setiap angka dicetak di barisnya sendiri, artinya satu angka satu kali `console.log`.',
        'Kerjakan langsung di editor tanpa membungkusnya di dalam fungsi.',
      ],
      pitfalls: [
        'Menulis `console.log(5)` sampai `console.log(1)` satu per satu memang menghasilkan keluaran yang benar, tapi akan ditolak. Tujuan soal ini adalah melatih `for` loop, dan kode yang ditulis manual tidak bisa dipakai lagi kalau datanya ada seratus.',
        'Memakai `.reverse()` atau `.forEach()` juga ditolak. Keduanya cara yang sah di project nyata, tapi soal ini sengaja melarangnya supaya kamu memahami apa yang sebenarnya dikerjakan method itu di balik layar.',
      ],
      terms: [
        {
          term: 'for loop',
          meaning:
            'Perintah untuk mengulang sebuah blok kode. Bentuknya `for (awal; syarat; perubahan)`. Bagian awal dijalankan sekali, lalu selama syaratnya benar badan loop dijalankan, dan setelah tiap putaran bagian perubahan dijalankan. Contohnya `for (let i = 1; i <= 3; i++)` menghasilkan `i` bernilai 1, 2, lalu 3.',
        },
        {
          term: 'i--',
          meaning:
            'Operator decrement, artinya mengurangi nilai `i` sebanyak satu. Kebalikannya `i++` yang menambah satu. Huruf `i` sendiri bukan kata kunci, hanya kebiasaan penamaan yang berasal dari kata index. Kamu boleh memakai nama lain seperti `angka`.',
        },
        {
          term: 'console.log',
          meaning:
            'Fungsi bawaan JavaScript untuk mencetak nilai ke console, yaitu panel keluaran di browser atau terminal. Di Taman Bermain, semua yang kamu cetak dengan `console.log` muncul di kotak Output, dan itulah yang dibandingkan dengan keluaran yang diharapkan.',
        },
      ],
    },
    rules: [
      'Wajib memakai `for` loop.',
      'Dilarang mendeklarasikan `function` atau arrow function (`=>`).',
      'Dilarang memakai method array bawaan seperti `.reverse()`, `.map()`, atau `.forEach()`.',
    ],
    starter: `
      // Cetak 5, 4, 3, 2, 1. Satu angka per baris.
    `,
    hints: [
      '`for` loop tidak harus menghitung naik. Bagian ketiganya boleh mengurangi nilai.',
      'Mulai dari angka 5, lalu berhenti begitu nilainya sudah di bawah 1.',
      'Kerangkanya `for (let i = 5; i >= 1; i--)`. Tinggal isi badannya dengan `console.log(i)`.',
    ],
    solution: {
      code: `
        // Mulai dari 5, jalan selama i masih >= 1, turun satu tiap putaran.
        for (let i = 5; i >= 1; i--) {
          console.log(i); // cetak nilai i di barisnya sendiri
        }
      `,
      steps: [
        '`let i = 5` menyiapkan penghitung dengan nilai awal 5. Bagian ini hanya dijalankan sekali di awal.',
        '`i >= 1` adalah syaratnya. Sebelum tiap putaran, JavaScript memeriksa apakah `i` masih lebih besar atau sama dengan 1. Kalau tidak, loop berhenti.',
        'Di dalam badan loop, `console.log(i)` mencetak nilai `i` saat itu.',
        '`i--` dijalankan setelah tiap putaran, sehingga `i` bergerak dari 5 ke 4, 3, 2, 1, lalu menjadi 0. Saat bernilai 0 syaratnya salah, dan loop selesai.',
      ],
      explanation:
        'Satu-satunya yang berubah dari `for` loop biasa adalah arahnya. Mulai dari angka terbesar, syaratnya memakai `>=`, dan perubahannya memakai `i--`. Pola ini sama persis dengan menelusuri array dari belakang, yang nanti kamu pakai untuk menampilkan data terbaru lebih dulu.',
    },
    alternativeSolutions: [
      `
        for (let i = 0; i < 5; i++) {
          console.log(5 - i);
        }
      `,
      `
        const angka = [1, 2, 3, 4, 5];
        for (let i = angka.length - 1; i >= 0; i--) {
          console.log(angka[i]);
        }
      `,
      `
        for (let i = 5; i > 0; i = i - 1) console.log(i);
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          console.log(5);
          console.log(4);
          console.log(3);
          console.log(2);
          console.log(1);
        `,
        reason:
          'Keluarannya benar, tapi tidak ada `for` loop sama sekali. Kode seperti ini tidak bisa dipakai lagi kalau datanya bertambah.',
      },
      {
        code: `[5, 4, 3, 2, 1].forEach((n) => console.log(n));`,
        reason: 'Memakai arrow function dan `.forEach()`. Keduanya dilarang di soal ini.',
      },
      {
        code: `
          for (let i = 1; i <= 5; i++) {
            console.log(i);
          }
        `,
        reason:
          'Bentuknya sudah memakai `for` loop, tapi urutannya naik dari 1 ke 5. Perilakunya salah.',
      },
      {
        code: `
          const angka = [1, 2, 3, 4, 5];
          for (const n of angka.reverse()) console.log(n);
        `,
        reason:
          'Memakai `.reverse()` untuk membalik urutan, padahal method itu dilarang di soal ini.',
      },
    ],
    check: mesinJs(
      [
        wajib('pakai-for', 'Memakai `for` loop', '\\bfor\\s*\\('),
        larang(
          'tanpa-fungsi',
          'Tidak mendeklarasikan `function` atau arrow function',
          '\\bfunction\\b|=>',
        ),
        larang(
          'tanpa-method-array',
          'Tidak memakai method array bawaan',
          '\\.(reverse|map|forEach|filter|reduce|sort)\\s*\\(',
        ),
      ],
      [cetak('urut-mundur', 'Cetak 5 sampai 1', ['5', '4', '3', '2', '1'], { visible: true })],
    ),
  }),

  soal({
    slug: 'saring-daftar-aktif',
    title: 'Saring daftar berdasarkan kondisi',
    topic: 'daftar',
    level: 'basic',
    realWorldUse:
      'Kotak pencarian dan filter tabel. Hampir setiap halaman daftar di project nyata punya penyaringan, dan bentuk kodenya selalu seperti ini.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Kamu sedang membuat halaman admin yang menampilkan daftar pengguna. Ada tombol bertuliskan "Tampilkan yang aktif saja". Saat tombol itu diklik, daftar yang tampil harus hanya berisi pengguna yang masih aktif. Tapi daftar lengkapnya tetap dibutuhkan, karena bagian lain halaman memakainya untuk menghitung jumlah seluruh pengguna.',
      tasks: [
        'Buat fungsi bernama `saringAktif` yang menerima satu parameter, yaitu sebuah array berisi objek pengguna.',
        'Setiap objek pengguna berbentuk `{ nama, aktif }`, dengan `aktif` bernilai `true` atau `false`.',
        'Kembalikan array baru yang hanya berisi pengguna dengan `aktif` bernilai `true`.',
        'Array yang dikirim masuk tidak boleh berubah sedikit pun.',
      ],
      pitfalls: [
        'Kalau array aslinya ikut berubah, bagian lain halaman yang memakai array itu juga ikut berubah tanpa ada yang memintanya. Bug seperti ini sulit dilacak karena sumbernya ada di tempat yang berbeda dengan gejalanya.',
        'Array kosong harus menghasilkan array kosong, bukan `undefined` dan bukan error.',
      ],
      terms: [
        {
          term: 'filter()',
          meaning:
            'Method array yang membuat array baru berisi elemen yang lolos sebuah pemeriksaan. Contohnya `[1, 2, 3].filter((n) => n > 1)` menghasilkan `[2, 3]`. Yang penting diingat, array aslinya tidak berubah. Itulah kenapa `filter()` cocok untuk soal ini.',
        },
        {
          term: 'mutate (mutasi)',
          meaning:
            'Mengubah isi data yang sudah ada, bukan membuat data baru. Contohnya `daftar.splice(0, 1)` memutasi `daftar` dengan membuang elemen pertamanya. Mutasi pada data yang dipakai bersama adalah sumber bug yang paling sering muncul di aplikasi frontend.',
        },
        {
          term: 'callback',
          meaning:
            'Fungsi yang kamu berikan kepada fungsi lain supaya dipanggil nanti. Pada `daftar.filter((p) => p.aktif)`, bagian `(p) => p.aktif` adalah callback. `filter()` memanggilnya sekali untuk setiap elemen, dan elemen ikut disimpan kalau callback-nya mengembalikan nilai benar.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `saringAktif`.',
      'Array yang dikirim masuk tidak boleh berubah.',
    ],
    starter: `
      function saringAktif(daftar) {
        // kembalikan hanya pengguna yang aktif
      }
    `,
    hints: [
      'Yang dikembalikan harus array baru, bukan array yang sama.',
      '`.filter()` mengembalikan array baru dan tidak menyentuh aslinya. `for` loop biasa juga boleh, asal kamu membuat array sendiri untuk menampung hasilnya.',
      'Bentuknya `return daftar.filter((pengguna) => pengguna.aktif);`',
    ],
    solution: {
      code: `
        function saringAktif(daftar) {
          // filter() membuat array BARU berisi elemen yang lolos pemeriksaan.
          // Array "daftar" sendiri tidak diubah sama sekali.
          return daftar.filter((pengguna) => pengguna.aktif);
        }
      `,
      steps: [
        '`function saringAktif(daftar)` membuat fungsi yang menerima array pengguna lewat parameter bernama `daftar`.',
        '`daftar.filter(...)` menelusuri setiap pengguna satu per satu dan memanggil callback untuk masing-masing.',
        'Callback `(pengguna) => pengguna.aktif` mengembalikan nilai `aktif`. Kalau nilainya `true`, pengguna itu ikut disimpan di array hasil.',
        '`return` mengirim array hasil itu keluar dari fungsi. Array `daftar` yang asli tetap utuh.',
      ],
      explanation:
        '`filter()` dipilih bukan karena lebih pendek, tapi karena ia selalu membuat array baru. Itu yang membuat array aslinya selamat. Bandingkan dengan `.splice()` yang memotong array di tempat, sehingga pemanggilnya ikut memegang data yang sudah berubah tanpa diminta.',
    },
    alternativeSolutions: [
      `
        function saringAktif(daftar) {
          const hasil = [];
          for (const pengguna of daftar) {
            if (pengguna.aktif) hasil.push(pengguna);
          }
          return hasil;
        }
      `,
      `
        const saringAktif = (daftar) => daftar.filter((p) => p.aktif === true);
      `,
      `
        function saringAktif(daftar) {
          return [...daftar].filter(function (p) {
            return Boolean(p.aktif);
          });
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function saringAktif(daftar) {
            return daftar;
          }
        `,
        reason:
          'Tidak menyaring apa pun, sehingga pengguna yang tidak aktif ikut terbawa ke hasil.',
      },
      {
        code: `
          function saringAktif(daftar) {
            for (let i = daftar.length - 1; i >= 0; i--) {
              if (!daftar[i].aktif) daftar.splice(i, 1);
            }
            return daftar;
          }
        `,
        reason:
          'Hasilnya benar, tapi array aslinya ikut dipotong dengan `splice()`. Inilah bug yang ingin dicegah soal ini.',
      },
      {
        code: `
          function saring(daftar) {
            return daftar.filter((p) => p.aktif);
          }
        `,
        reason:
          'Nama fungsinya `saring`, bukan `saringAktif`, jadi pemeriksa tidak bisa memanggilnya.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `saringAktif`', '\\bsaringAktif\\b')],
      [
        nilai(
          'campuran',
          'Daftar berisi pengguna aktif dan tidak aktif',
          'saringAktif(data)',
          [
            { nama: 'Ana', aktif: true },
            { nama: 'Cici', aktif: true },
          ],
          { visible: true, prelude: PENGGUNA },
        ),
        nilai('kosong', 'Array kosong', 'saringAktif([])', [], {}),
        nilai(
          'tidak-ada-aktif',
          'Tidak ada yang aktif',
          'saringAktif([{ nama: "Budi", aktif: false }])',
          [],
          {},
        ),
        nilai(
          'semua-aktif',
          'Semuanya aktif',
          'saringAktif([{ nama: "Ana", aktif: true }]).length',
          1,
          {},
        ),
        nilai('asli-utuh', 'Array asli tidak berubah', '(saringAktif(data), data.length)', 3, {
          prelude: PENGGUNA,
        }),
      ],
    ),
  }),

  soal({
    slug: 'ubah-bentuk-daftar',
    title: 'Ubah bentuk array objek',
    topic: 'daftar',
    level: 'basic',
    realWorldUse:
      'Menyesuaikan response API dengan bentuk yang dibutuhkan komponen UI. Backend mengirim `nama_depan` dan `nama_belakang`, padahal tampilan cukup butuh satu `nama`.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Backend tempatmu bekerja mengirim data pengguna dengan kolom `nama_depan` dan `nama_belakang` yang terpisah, ditambah beberapa kolom lain seperti `email`. Komponen kartu profil yang kamu buat cukup butuh dua hal, yaitu `id` dan `nama` lengkap. Daripada setiap komponen menggabungkan nama sendiri-sendiri, bentuk datanya diubah sekali di satu tempat.',
      tasks: [
        'Buat fungsi bernama `keBentukUi` yang menerima sebuah array objek pengguna.',
        'Setiap objek masukan berbentuk `{ id, nama_depan, nama_belakang }` dan mungkin punya kolom lain.',
        'Kembalikan array baru dengan setiap objek berbentuk `{ id, nama }`.',
        '`nama` berisi nama depan dan nama belakang yang dipisahkan satu spasi, misalnya `"Ana Sari"`.',
      ],
      pitfalls: [
        'Objek hasil hanya boleh punya dua key, yaitu `id` dan `nama`. Kolom lain dari API seperti `email` atau `password_hash` tidak boleh ikut terbawa. Makin sedikit data yang beredar di tampilan, makin kecil kemungkinan ada yang bocor tanpa sengaja.',
        'Array kosong harus menghasilkan array kosong.',
      ],
      terms: [
        {
          term: 'map()',
          meaning:
            'Method array yang mengubah setiap elemen menjadi sesuatu yang baru, lalu mengumpulkan hasilnya ke array baru dengan panjang yang sama. Contohnya `[1, 2].map((n) => n * 10)` menghasilkan `[10, 20]`. Ciri khasnya, satu elemen masuk dan satu elemen keluar.',
        },
        {
          term: 'template literal',
          meaning:
            'Cara menulis string memakai tanda backtick, yaitu tanda miring di kiri angka 1 pada keyboard. Di dalamnya kamu bisa menyisipkan nilai dengan `${...}`. Contohnya penulisan dengan backtick berisi `${depan} ${belakang}` menghasilkan dua nama yang dipisah satu spasi.',
        },
        {
          term: 'spread (...)',
          meaning:
            'Tiga titik yang menyalin seluruh isi sebuah objek atau array ke tempat lain. Contohnya `{ ...pengguna }` menyalin semua key milik `pengguna`. Di soal ini justru itu yang harus dihindari, karena semua kolom lama akan ikut terbawa ke hasil.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `keBentukUi`.',
      'Objek hasil hanya boleh punya key `id` dan `nama`.',
    ],
    starter: `
      function keBentukUi(daftar) {
        // ubah setiap item menjadi { id, nama }
      }
    `,
    hints: [
      'Satu item masuk, satu item keluar, dan jumlahnya sama. Itu ciri khas `.map()`.',
      'Gabungkan dua nama memakai template literal atau memakai operator `+`.',
      'Bentuknya `daftar.map((u) => ({ id: u.id, nama: u.nama_depan + " " + u.nama_belakang }))`.',
    ],
    solution: {
      code: `
        function keBentukUi(daftar) {
          return daftar.map((u) => ({
            id: u.id,
            // Gabungkan dua kolom nama dengan satu spasi di tengah.
            nama: \`\${u.nama_depan} \${u.nama_belakang}\`,
          }));
          // Sengaja TIDAK memakai { ...u }, supaya kolom lain seperti email tidak ikut.
        }
      `,
      steps: [
        '`daftar.map(...)` menelusuri setiap pengguna dan membuat satu objek baru untuk masing-masing.',
        'Tanda kurung di sekitar `({ ... })` diperlukan supaya JavaScript membacanya sebagai objek, bukan sebagai badan fungsi.',
        '`id: u.id` menyalin id apa adanya.',
        '`nama` dibuat dari template literal yang menyisipkan nama depan, satu spasi, lalu nama belakang.',
        'Karena key ditulis satu per satu, kolom lain seperti `email` otomatis tertinggal.',
      ],
      explanation:
        'Menyebut key hasil satu per satu terasa lebih panjang daripada menyalin seluruh objek dengan `...u`. Justru itu gunanya. Kalau memakai spread, setiap kolom baru yang ditambahkan backend nanti ikut masuk ke tampilan tanpa ada yang memutuskannya.',
    },
    alternativeSolutions: [
      `
        function keBentukUi(daftar) {
          const hasil = [];
          for (const u of daftar) {
            hasil.push({ id: u.id, nama: u.nama_depan + ' ' + u.nama_belakang });
          }
          return hasil;
        }
      `,
      `
        const keBentukUi = (daftar) =>
          daftar.map(function (u) {
            return { id: u.id, nama: [u.nama_depan, u.nama_belakang].join(' ') };
          });
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function keBentukUi(daftar) {
            return daftar.map((u) => ({ ...u, nama: u.nama_depan + ' ' + u.nama_belakang }));
          }
        `,
        reason:
          'Menyalin seluruh objek dengan spread, sehingga key lama seperti `email` ikut terbawa ke hasil.',
      },
      {
        code: `
          function keBentukUi(daftar) {
            return daftar.map((u) => ({ id: u.id, nama: u.nama_depan }));
          }
        `,
        reason: 'Nama belakangnya hilang, jadi yang tampil hanya nama depan.',
      },
      {
        code: `
          function keBentukUi(daftar) {
            return daftar.map((u) => u.nama_depan + ' ' + u.nama_belakang);
          }
        `,
        reason:
          'Mengembalikan array berisi string, padahal yang diminta array berisi objek `{ id, nama }`.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `keBentukUi`', '\\bkeBentukUi\\b')],
      [
        nilai(
          'dua-item',
          'Dua pengguna',
          'keBentukUi([{ id: 1, nama_depan: "Ana", nama_belakang: "Sari" }, { id: 2, nama_depan: "Budi", nama_belakang: "Raharjo" }])',
          [
            { id: 1, nama: 'Ana Sari' },
            { id: 2, nama: 'Budi Raharjo' },
          ],
          { visible: true },
        ),
        nilai('kosong', 'Array kosong', 'keBentukUi([])', [], {}),
        nilai(
          'satu-item',
          'Satu pengguna',
          'keBentukUi([{ id: 9, nama_depan: "Cici", nama_belakang: "Utami" }])',
          [{ id: 9, nama: 'Cici Utami' }],
          {},
        ),
        nilai(
          'buang-field-lain',
          'Kolom lain dari API tidak ikut terbawa',
          'Object.keys(keBentukUi([{ id: 1, nama_depan: "Ana", nama_belakang: "Sari", email: "ana@contoh.id", password_hash: "xxx" }])[0]).sort()',
          ['id', 'nama'],
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'hitung-total-keranjang',
    title: 'Jumlahkan total dari daftar',
    topic: 'daftar',
    level: 'basic',
    realWorldUse:
      'Total keranjang belanja, subtotal invoice, dan ringkasan pesanan. Perhitungan ini muncul di hampir setiap toko online dan paling terlihat kalau salah.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Di halaman keranjang belanja, setiap barang punya harga satuan dan jumlah yang dibeli. Di bagian bawah halaman ada tulisan "Total belanja" yang harus menunjukkan jumlah seluruh harga dikali jumlahnya. Pengguna baru yang belum memasukkan apa pun juga membuka halaman ini, dan totalnya harus terbaca 0.',
      tasks: [
        'Buat fungsi bernama `hitungTotal` yang menerima sebuah array barang.',
        'Setiap barang berbentuk `{ harga, jumlah }`, keduanya berupa angka.',
        'Kembalikan satu angka, yaitu total dari `harga * jumlah` untuk semua barang.',
        'Array kosong harus menghasilkan `0`.',
      ],
      pitfalls: [
        'Keranjang kosong harus menghasilkan `0`, bukan `undefined` dan bukan `NaN`. Ini bukan kasus buatan. Keranjang kosong adalah keadaan pertama yang dilihat setiap pengguna baru.',
        'Jangan lupa mengalikan dengan `jumlah`. Tanpa itu, membeli tiga barang yang sama dihitung seperti membeli satu.',
      ],
      terms: [
        {
          term: 'reduce()',
          meaning:
            'Method array yang merangkum seluruh elemen menjadi satu nilai. Ia menelusuri elemen satu per satu sambil membawa sebuah nilai yang terus diperbarui. Contohnya `[1, 2, 3].reduce((total, n) => total + n, 0)` menghasilkan `6`.',
        },
        {
          term: 'accumulator',
          meaning:
            'Nilai yang dibawa dari satu putaran ke putaran berikutnya di dalam `reduce()`. Di soal ini accumulator-nya adalah total sementara. Nama parameternya bebas, orang sering menamainya `total`, `acc`, atau `hasil`.',
        },
        {
          term: 'initial value',
          meaning:
            'Nilai awal accumulator, yaitu argumen kedua `reduce()`. Pada `reduce(fn, 0)`, angka `0` adalah initial value. Kalau tidak diberikan, `reduce()` pada array kosong melempar `TypeError` karena tidak ada nilai untuk dimulai.',
        },
      ],
    },
    rules: ['Wajib membuat fungsi bernama `hitungTotal`.', 'Keranjang kosong menghasilkan `0`.'],
    starter: `
      function hitungTotal(keranjang) {
        // jumlahkan harga x jumlah untuk setiap barang
      }
    `,
    hints: [
      'Kamu butuh satu angka yang dibawa terus dari barang ke barang.',
      '`.reduce()` dibuat untuk ini, dan initial value-nya yang menyelamatkan kasus keranjang kosong.',
      'Bentuknya `keranjang.reduce((total, item) => total + item.harga * item.jumlah, 0)`. Perhatikan angka `0` di akhir.',
    ],
    solution: {
      code: `
        function hitungTotal(keranjang) {
          // Angka 0 di akhir adalah initial value. Tanpanya, keranjang kosong melempar error.
          return keranjang.reduce((total, item) => total + item.harga * item.jumlah, 0);
        }
      `,
      steps: [
        '`reduce()` dimulai dengan `total` bernilai `0`, yaitu initial value di argumen kedua.',
        'Untuk setiap barang, callback menghitung `item.harga * item.jumlah` lalu menambahkannya ke `total`.',
        'Nilai yang dikembalikan callback menjadi `total` baru untuk barang berikutnya.',
        'Setelah barang terakhir, `reduce()` mengembalikan `total` akhir. Kalau keranjangnya kosong, callback tidak pernah dipanggil dan hasilnya tetap `0`.',
      ],
      explanation:
        'Angka `0` di argumen kedua `reduce()` itulah yang menangani keranjang kosong. Tanpa initial value, `reduce()` pada array kosong melempar `TypeError`, dan itu terjadi tepat di halaman yang paling sering dilihat pengguna baru.',
    },
    alternativeSolutions: [
      `
        function hitungTotal(keranjang) {
          let total = 0;
          for (const item of keranjang) {
            total += item.harga * item.jumlah;
          }
          return total;
        }
      `,
      `
        const hitungTotal = (keranjang) => {
          let total = 0;
          for (let i = 0; i < keranjang.length; i++) {
            total = total + keranjang[i].harga * keranjang[i].jumlah;
          }
          return total;
        };
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function hitungTotal(keranjang) {
            return keranjang.reduce((total, item) => total + item.harga * item.jumlah);
          }
        `,
        reason: 'Tanpa initial value, `reduce()` pada keranjang kosong melempar `TypeError`.',
      },
      {
        code: `
          function hitungTotal(keranjang) {
            return keranjang.reduce((total, item) => total + item.harga, 0);
          }
        `,
        reason:
          'Harga tidak dikalikan dengan jumlah, jadi membeli tiga barang dihitung seharga satu.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `hitungTotal`', '\\bhitungTotal\\b')],
      [
        nilai(
          'dua-item',
          'Dua jenis barang',
          'hitungTotal([{ harga: 10000, jumlah: 2 }, { harga: 5000, jumlah: 3 }])',
          35000,
          { visible: true },
        ),
        nilai('kosong', 'Keranjang kosong', 'hitungTotal([])', 0, {}),
        nilai('satu-item', 'Satu barang', 'hitungTotal([{ harga: 7500, jumlah: 1 }])', 7500, {}),
        nilai(
          'jumlah-nol',
          'Barang dengan jumlah nol',
          'hitungTotal([{ harga: 9000, jumlah: 0 }, { harga: 1000, jumlah: 2 }])',
          2000,
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'cari-berdasarkan-id',
    title: 'Cari satu item berdasarkan id',
    topic: 'daftar',
    level: 'basic',
    realWorldUse:
      'Mengambil satu record dari daftar yang sudah dimuat tanpa meminta lagi ke server. Ini dipakai setiap kali baris tabel diklik untuk membuka detailnya.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Halaman daftar produk sudah memuat seluruh produk dari server. Saat pengguna mengklik salah satu baris, sebuah panel detail terbuka. Daripada meminta data lagi ke server, kamu cukup mencari produk itu di array yang sudah ada berdasarkan `id`-nya.',
      tasks: [
        'Buat fungsi bernama `cariById` yang menerima dua parameter, yaitu array berisi objek dan sebuah `id`.',
        'Kembalikan objek pertama yang `id`-nya sama persis dengan `id` yang dicari.',
        'Kalau tidak ada yang cocok, kembalikan `undefined`.',
      ],
      pitfalls: [
        '`id` bisa bernilai `0`, dan itu id yang sah. Kode yang memeriksa kebenaran nilai atau memakai `||` sering menganggap `0` sebagai "tidak ada", sehingga record pertama tidak pernah ditemukan.',
        'Pakai perbandingan ketat `===`. `id` yang datang dari URL berupa string `"1"`, sementara id dari database berupa angka `1`, dan keduanya tidak boleh dianggap sama.',
      ],
      terms: [
        {
          term: 'find()',
          meaning:
            'Method array yang mengembalikan elemen pertama yang lolos pemeriksaan, lalu berhenti mencari. Kalau tidak ada yang lolos, hasilnya `undefined`. Contohnya `[5, 8, 12].find((n) => n > 6)` menghasilkan `8`.',
        },
        {
          term: 'undefined',
          meaning:
            'Nilai bawaan JavaScript yang berarti "belum ada nilainya". Ia berbeda dengan `null`, yang biasanya ditulis programmer dengan sengaja untuk berkata "kosong". `find()` mengembalikan `undefined` saat tidak menemukan apa pun, dan soal ini meminta perilaku yang sama.',
        },
        {
          term: '=== (strict equality)',
          meaning:
            'Operator pembanding ketat yang memeriksa nilai dan tipenya sekaligus. `1 === 1` bernilai `true`, tapi `1 === "1"` bernilai `false`. Kebalikannya `==` yang mengubah tipe lebih dulu, sehingga `1 == "1"` dianggap `true` dan sering menimbulkan kejutan.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `cariById`.',
      'Mengembalikan `undefined` kalau tidak ditemukan.',
    ],
    starter: `
      function cariById(daftar, id) {
        // kembalikan item yang id-nya cocok
      }
    `,
    hints: [
      'Kamu mencari satu item, bukan menyaring banyak item.',
      '`.find()` sudah mengembalikan `undefined` sendiri kalau tidak ada yang cocok. Itu persis yang diminta.',
      'Bentuknya `return daftar.find((item) => item.id === id);`',
    ],
    solution: {
      code: `
        function cariById(daftar, id) {
          // find() berhenti di item pertama yang cocok, dan memberi undefined kalau tidak ada.
          // === memastikan "1" (string) tidak dianggap sama dengan 1 (angka).
          return daftar.find((item) => item.id === id);
        }
      `,
      steps: [
        '`daftar.find(...)` menelusuri array dari depan dan memanggil callback untuk setiap item.',
        'Callback `(item) => item.id === id` membandingkan id item dengan id yang dicari memakai `===`.',
        'Begitu ada yang cocok, `find()` langsung mengembalikan item itu dan berhenti mencari.',
        'Kalau sampai akhir tidak ada yang cocok, `find()` mengembalikan `undefined`, dan fungsi ikut mengembalikannya.',
      ],
      explanation:
        '`find()` sudah mengembalikan `undefined` saat tidak ada yang cocok, jadi tidak perlu ditambah apa pun. Menambahkan `|| null` malah mengubah perilakunya. Pemakaian `===` juga disengaja, supaya id `"1"` dari URL tidak diam-diam cocok dengan id `1` dari database.',
    },
    alternativeSolutions: [
      `
        function cariById(daftar, id) {
          for (const item of daftar) {
            if (item.id === id) return item;
          }
          return undefined;
        }
      `,
      `
        const cariById = (daftar, id) => daftar.filter((item) => item.id === id)[0];
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function cariById(daftar, id) {
            return daftar.find((item) => item.id == id);
          }
        `,
        reason:
          'Memakai `==`, sehingga id `"1"` dari URL diam-diam cocok dengan id `1` dari database. Terlihat benar sampai ada dua record yang tipenya berbeda.',
      },
      {
        code: `
          function cariById(daftar, id) {
            return daftar.filter((item) => item.id === id);
          }
        `,
        reason: 'Mengembalikan array berisi hasil pencarian, padahal yang diminta satu item saja.',
      },
      {
        code: `
          function cariById(daftar, id) {
            return daftar.find((item) => item.id === id) ?? null;
          }
        `,
        reason: 'Mengembalikan `null` saat tidak ketemu, sementara soal meminta `undefined`.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `cariById`', '\\bcariById\\b')],
      [
        nilai(
          'ketemu',
          'Id yang ada di daftar',
          'cariById([{ id: 1, nama: "Ana" }, { id: 2, nama: "Budi" }], 2)',
          { id: 2, nama: 'Budi' },
          { visible: true },
        ),
        nilai(
          'tidak-ketemu',
          'Id yang tidak ada',
          'cariById([{ id: 1, nama: "Ana" }], 99)',
          undefined,
          {},
        ),
        nilai('daftar-kosong', 'Array kosong', 'cariById([], 1)', undefined, {}),
        nilai(
          'id-nol',
          'Id bernilai 0, record pertama yang sering terlewat',
          'cariById([{ id: 0, nama: "Pertama" }], 0).nama',
          'Pertama',
          {},
        ),
        nilai(
          'tipe-berbeda',
          'Id berupa string tidak cocok dengan id berupa angka',
          'cariById([{ id: 1, nama: "Ana" }], "1")',
          undefined,
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'buang-duplikat',
    title: 'Buang duplikat dari daftar',
    topic: 'daftar',
    level: 'basic',
    realWorldUse:
      'Membersihkan daftar tag, kategori, dan alamat email penerima sebelum dikirim. Data yang dikumpulkan dari beberapa sumber hampir selalu punya isi yang dobel.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Sebuah artikel blog punya tag yang dikumpulkan dari beberapa penulis. Hasilnya ada tag yang muncul dua kali, misalnya `"react"` ditulis oleh dua orang. Sebelum ditampilkan, daftar tag perlu dibersihkan supaya setiap tag hanya muncul sekali, dan urutannya tetap seperti semula karena tag pertama biasanya yang paling relevan.',
      tasks: [
        'Buat fungsi bernama `buangDuplikat` yang menerima sebuah array.',
        'Kembalikan array baru yang setiap nilainya hanya muncul sekali.',
        'Urutan kemunculan pertama harus dipertahankan.',
      ],
      pitfalls: [
        'Jangan mengurutkan ulang isinya. Kalau kamu memakai `.sort()` demi membuang duplikat, daftar tag yang tadinya tersusun sesuai relevansi berubah jadi tersusun alfabetis, padahal tidak ada yang memintanya.',
      ],
      terms: [
        {
          term: 'Set',
          meaning:
            'Struktur data bawaan JavaScript yang hanya menyimpan nilai unik. Menambahkan nilai yang sudah ada tidak berpengaruh apa-apa. `Set` juga mengingat urutan nilai dimasukkan. Contohnya `new Set(["a", "b", "a"])` hanya berisi `"a"` dan `"b"`.',
        },
        {
          term: 'spread (...)',
          meaning:
            'Tiga titik yang membongkar isi sesuatu yang bisa ditelusuri, misalnya `Set`, ke dalam array baru. `[...new Set(daftar)]` berarti "ambil semua isi Set lalu taruh di array". Tanpa langkah ini hasilnya tetap berupa `Set`, bukan array.',
        },
        {
          term: 'includes()',
          meaning:
            'Method array yang memeriksa apakah sebuah nilai ada di dalamnya, lalu mengembalikan `true` atau `false`. Contohnya `["a", "b"].includes("a")` bernilai `true`. Method ini berguna kalau kamu ingin membuang duplikat memakai `for` loop biasa.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `buangDuplikat`.',
      'Urutan kemunculan pertama harus dipertahankan.',
    ],
    starter: `
      function buangDuplikat(daftar) {
        // kembalikan nilai unik saja
      }
    `,
    hints: [
      'Kamu butuh cara untuk mengingat nilai apa saja yang sudah pernah muncul.',
      '`Set` hanya menyimpan nilai unik dan tetap mengingat urutan nilai dimasukkan.',
      'Bentuknya `return [...new Set(daftar)];`',
    ],
    solution: {
      code: `
        function buangDuplikat(daftar) {
          // Set membuang nilai yang dobel dan tetap mengingat urutan aslinya.
          // Spread (...) mengubah Set itu kembali menjadi array.
          return [...new Set(daftar)];
        }
      `,
      steps: [
        '`new Set(daftar)` memasukkan semua nilai ke `Set`. Nilai yang sudah ada diabaikan, jadi yang tersisa hanya nilai unik.',
        '`Set` menyimpan nilai sesuai urutan pertama kali dimasukkan, sehingga urutan aslinya tidak berubah.',
        '`[...Set]` membongkar isi `Set` ke array baru, karena fungsi ini harus mengembalikan array.',
      ],
      explanation:
        '`Set` menyimpan urutan penyisipan, jadi mengubahnya kembali menjadi array langsung memenuhi syarat urutan. Mengurutkan dulu lalu membuang nilai yang bertetangga juga menghasilkan nilai unik, tapi cara itu mengubah urutan aslinya. Hasilnya benar untuk soal yang berbeda.',
    },
    alternativeSolutions: [
      `
        function buangDuplikat(daftar) {
          const hasil = [];
          for (const nilai of daftar) {
            if (!hasil.includes(nilai)) hasil.push(nilai);
          }
          return hasil;
        }
      `,
      `
        const buangDuplikat = (daftar) => daftar.filter((v, i) => daftar.indexOf(v) === i);
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function buangDuplikat(daftar) {
            return [...new Set(daftar)].sort();
          }
        `,
        reason: 'Nilainya sudah unik, tapi `.sort()` merusak urutan kemunculan pertamanya.',
      },
      {
        code: `
          function buangDuplikat(daftar) {
            return daftar;
          }
        `,
        reason: 'Tidak membuang apa pun, sehingga nilai yang dobel tetap ada di hasil.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `buangDuplikat`', '\\bbuangDuplikat\\b')],
      [
        nilai(
          'ada-rangkap',
          'Array dengan nilai yang dobel',
          'buangDuplikat(["react", "css", "react", "html", "css"])',
          ['react', 'css', 'html'],
          { visible: true },
        ),
        nilai('kosong', 'Array kosong', 'buangDuplikat([])', [], {}),
        nilai('sudah-unik', 'Semua sudah unik', 'buangDuplikat([1, 2, 3])', [1, 2, 3], {}),
        nilai('semua-sama', 'Semua nilainya sama', 'buangDuplikat(["a", "a", "a"])', ['a'], {}),
        nilai(
          'urutan-terjaga',
          'Urutan kemunculan pertama dipertahankan',
          'buangDuplikat(["z", "a", "z", "b"])',
          ['z', 'a', 'b'],
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'urutkan-berdasarkan-field',
    title: 'Urutkan daftar berdasarkan satu field',
    topic: 'daftar',
    level: 'basic',
    realWorldUse:
      'Kolom tabel yang bisa diklik untuk mengurutkan data, misalnya daftar produk berdasarkan harga atau daftar pengguna berdasarkan nama.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Di halaman katalog toko, pengguna bisa memilih "Urutkan dari yang termurah". Daftar produk yang tampil harus berurutan dari harga paling kecil ke paling besar. Tapi daftar aslinya masih dipakai bagian lain halaman dalam urutan semula, jadi tidak boleh ikut teracak.',
      tasks: [
        'Buat fungsi bernama `urutkanHarga` yang menerima sebuah array produk.',
        'Setiap produk berbentuk `{ nama, harga }`, dengan `harga` berupa angka.',
        'Kembalikan array baru yang terurut dari harga termurah ke termahal.',
        'Array yang dikirim masuk tidak boleh berubah urutannya.',
      ],
      pitfalls: [
        '`.sort()` mengubah array yang memanggilnya secara langsung, istilahnya bekerja in place. Kalau dipanggil pada array masukan, urutan aslinya ikut berubah. Salin dulu array-nya sebelum diurutkan.',
        '`.sort()` tanpa compare function membandingkan semuanya sebagai teks. Hasilnya angka `100` dianggap lebih kecil daripada `9`, karena huruf "1" datang sebelum huruf "9".',
      ],
      terms: [
        {
          term: 'sort()',
          meaning:
            'Method array untuk mengurutkan isinya. Ia mengubah array aslinya secara langsung sekaligus mengembalikan array yang sama. Contohnya `[3, 1, 2].sort((a, b) => a - b)` menghasilkan `[1, 2, 3]`.',
        },
        {
          term: 'compare function',
          meaning:
            'Fungsi pembanding yang diberikan ke `sort()`. Ia menerima dua elemen `a` dan `b`, lalu mengembalikan angka negatif kalau `a` harus di depan, angka positif kalau `b` harus di depan, dan `0` kalau sama. Rumus `a.harga - b.harga` menghasilkan urutan naik.',
        },
        {
          term: 'in place',
          meaning:
            'Sebutan untuk operasi yang mengubah data aslinya langsung, bukan membuat salinan baru. `sort()`, `reverse()`, dan `splice()` bekerja in place. `map()`, `filter()`, dan `slice()` tidak, karena ketiganya membuat array baru.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `urutkanHarga`.',
      'Array yang dikirim masuk tidak boleh berubah urutannya.',
    ],
    starter: `
      function urutkanHarga(produk) {
        // kembalikan array terurut dari yang termurah
      }
    `,
    hints: [
      '`.sort()` mengubah array yang memanggilnya, bukan membuat array baru.',
      'Salin dulu sebelum mengurutkan, memakai `[...produk]` atau `produk.slice()`.',
      'Beri `.sort()` sebuah compare function. Tanpa itu, angka dibandingkan sebagai teks.',
    ],
    solution: {
      code: `
        function urutkanHarga(produk) {
          // [...produk] menyalin dulu, supaya array aslinya tidak ikut teracak.
          // (a, b) => a.harga - b.harga membandingkan sebagai ANGKA, bukan teks.
          return [...produk].sort((a, b) => a.harga - b.harga);
        }
      `,
      steps: [
        '`[...produk]` membuat salinan array. Semua pengurutan terjadi pada salinan ini.',
        '`.sort(...)` mengurutkan salinan itu memakai compare function yang diberikan.',
        '`(a, b) => a.harga - b.harga` menghasilkan angka negatif kalau `a` lebih murah, sehingga `a` diletakkan lebih dulu.',
        'Salinan yang sudah terurut dikembalikan, dan array `produk` yang asli tetap dalam urutan semula.',
      ],
      explanation:
        'Ada dua hal di satu baris ini dan keduanya wajib. `[...produk]` menyalin dulu supaya aslinya selamat, dan compare function membuat perbandingannya memakai angka. Tanpa compare function, `.sort()` mengubah semuanya menjadi teks, dan dalam urutan teks `"100"` memang datang sebelum `"9"`.',
    },
    alternativeSolutions: [
      `
        function urutkanHarga(produk) {
          return produk.slice().sort(function (a, b) {
            if (a.harga < b.harga) return -1;
            if (a.harga > b.harga) return 1;
            return 0;
          });
        }
      `,
      `
        const urutkanHarga = (produk) => [...produk].sort((a, b) => (a.harga > b.harga ? 1 : -1));
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function urutkanHarga(produk) {
            return produk.sort((a, b) => a.harga - b.harga);
          }
        `,
        reason:
          'Hasilnya sudah terurut, tapi array aslinya ikut teracak karena `.sort()` bekerja in place.',
      },
      {
        code: `
          function urutkanHarga(produk) {
            return [...produk].sort();
          }
        `,
        reason:
          'Tanpa compare function, `.sort()` membandingkan objek sebagai teks dan urutannya tidak berubah sama sekali.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `urutkanHarga`', '\\burutkanHarga\\b')],
      [
        nilai(
          'tiga-produk',
          'Tiga produk dengan urutan acak',
          'urutkanHarga([{ nama: "A", harga: 9000 }, { nama: "B", harga: 100 }, { nama: "C", harga: 500 }])',
          [
            { nama: 'B', harga: 100 },
            { nama: 'C', harga: 500 },
            { nama: 'A', harga: 9000 },
          ],
          { visible: true },
        ),
        nilai('kosong', 'Array kosong', 'urutkanHarga([])', [], {}),
        nilai(
          'harga-sama',
          'Dua produk dengan harga sama',
          'urutkanHarga([{ nama: "A", harga: 100 }, { nama: "B", harga: 100 }]).length',
          2,
          {},
        ),
        nilai(
          'asli-utuh',
          'Array asli tidak ikut terurut',
          '(urutkanHarga(barang), barang[0].nama)',
          'A',
          {
            prelude: `
              const barang = [
                { nama: 'A', harga: 9000 },
                { nama: 'B', harga: 100 },
              ];
            `,
          },
        ),
      ],
    ),
  }),
];
