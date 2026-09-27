import { larang, mesinJs, nilai, soal, wajib } from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * JavaScript — Basic, exercises 8–14: text, numbers, and dates.
 *
 * Every one of these is a formatting or validation shape that ships in the first release of any
 * product with a screen. The hidden scenarios carry the lesson: division by zero, a string shorter
 * than the cut, a page past the end, and a field containing only spaces are the four cases that
 * separate an answer that works from an answer that works on the happy path.
 */

export const exercises: Exercise[] = [
  soal({
    slug: 'hitung-persen-progres',
    title: 'Hitung persentase progres',
    topic: 'teks-angka',
    level: 'basic',
    realWorldUse:
      'Progress bar, indikator penyelesaian kursus, dan tulisan seperti "12 dari 40 selesai" yang muncul di hampir setiap dashboard.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Di halaman dashboard kursus ada progress bar yang menunjukkan berapa persen materi sudah selesai. Pengguna yang sudah menyelesaikan 5 dari 10 materi harus melihat 50%. Pengguna baru yang kursusnya belum punya materi sama sekali juga membuka dashboard ini, dan di layarnya tidak boleh muncul tulisan aneh seperti "NaN%".',
      tasks: [
        'Buat fungsi bernama `hitungPersen` yang menerima dua angka, yaitu `selesai` dan `total`.',
        'Kembalikan persentasenya sebagai bilangan bulat, dibulatkan ke bawah.',
        'Kalau `total` bernilai `0`, kembalikan `0`.',
      ],
      pitfalls: [
        'Pembagian `0 / 0` menghasilkan `NaN`. Nilai `NaN` tidak memunculkan error, ia diam-diam mengalir sampai ke layar sebagai tulisan "NaN%". Periksa dulu kasus `total` bernilai `0` sebelum membagi.',
        'Pembulatannya harus ke bawah. 2 dari 3 materi adalah 66,67%, dan yang diminta `66`, bukan `67`. Membulatkan ke atas bisa membuat progress terlihat 100% padahal masih ada yang belum selesai.',
      ],
      terms: [
        {
          term: 'NaN',
          meaning:
            'Singkatan dari Not a Number, yaitu nilai JavaScript untuk hasil hitungan yang tidak masuk akal. Contohnya `0 / 0` atau `"abc" * 2`. Yang membuatnya berbahaya, `NaN` menular. Setiap hitungan yang melibatkan `NaN` ikut menghasilkan `NaN`.',
        },
        {
          term: 'Math.floor()',
          meaning:
            'Fungsi bawaan yang membulatkan angka ke bawah menjadi bilangan bulat. `Math.floor(66.9)` menghasilkan `66`. Bandingkan dengan `Math.round()` yang membulatkan ke angka terdekat, sehingga `Math.round(66.9)` menghasilkan `67`.',
        },
        {
          term: 'guard clause',
          meaning:
            'Pemeriksaan di baris paling awal fungsi yang langsung keluar kalau ada kasus khusus. Contohnya `if (total === 0) return 0;`. Setelah baris itu, sisa fungsi bisa ditulis dengan tenang karena kasus bermasalahnya sudah disingkirkan.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `hitungPersen`.',
      'Total `0` menghasilkan `0`, bukan `NaN`.',
    ],
    starter: `
      function hitungPersen(selesai, total) {
        // kembalikan persentase dalam bilangan bulat
      }
    `,
    hints: [
      'Periksa dulu kasus yang tidak bisa dihitung, baru lakukan pembagian.',
      'Pembulatan ke bawah memakai `Math.floor`.',
      'Bentuknya, jaga `total === 0` lebih dulu, lalu hitung `Math.floor((selesai / total) * 100)`.',
    ],
    solution: {
      code: `
        function hitungPersen(selesai, total) {
          // Guard clause. Tanpa baris ini, 0 / 0 menghasilkan NaN.
          if (total === 0) return 0;

          // Bagi, kalikan 100, lalu bulatkan ke bawah.
          return Math.floor((selesai / total) * 100);
        }
      `,
      steps: [
        '`if (total === 0) return 0;` menangani kasus total nol lebih dulu dan langsung keluar dari fungsi.',
        '`selesai / total` menghasilkan pecahan, misalnya `5 / 10` bernilai `0.5`.',
        'Pecahan itu dikali `100` supaya menjadi persen, sehingga `0.5` menjadi `50`.',
        '`Math.floor(...)` membuang angka di belakang koma dengan membulatkan ke bawah, sehingga `66.67` menjadi `66`.',
      ],
      explanation:
        'Guard clause di baris pertama adalah inti soal ini. Tanpanya, `0 / 0` menghasilkan `NaN`, dan `NaN` tidak memunculkan error. Ia diam-diam mengalir sampai ke layar. Bug yang tidak berisik seperti ini justru yang paling lama bertahan di aplikasi.',
    },
    alternativeSolutions: [
      `
        const hitungPersen = (selesai, total) =>
          total === 0 ? 0 : Math.floor((selesai * 100) / total);
      `,
      `
        function hitungPersen(selesai, total) {
          if (!total) {
            return 0;
          }
          const rasio = selesai / total;
          return Math.floor(rasio * 100);
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function hitungPersen(selesai, total) {
            return Math.floor((selesai / total) * 100);
          }
        `,
        reason: 'Total nol menghasilkan `NaN`, yang tampil ke pengguna sebagai tulisan "NaN%".',
      },
      {
        code: `
          function hitungPersen(selesai, total) {
            if (total === 0) return 0;
            return Math.round((selesai / total) * 100);
          }
        `,
        reason:
          'Memakai `Math.round`, sehingga 2 dari 3 dilaporkan 67% padahal seharusnya dibulatkan ke bawah menjadi 66%.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `hitungPersen`', '\\bhitungPersen\\b')],
      [
        nilai('separuh', 'Lima dari sepuluh', 'hitungPersen(5, 10)', 50, { visible: true }),
        nilai('total-nol', 'Total nol', 'hitungPersen(0, 0)', 0, {}),
        nilai('belum-mulai', 'Belum ada yang selesai', 'hitungPersen(0, 40)', 0, {}),
        nilai('tuntas', 'Semuanya selesai', 'hitungPersen(40, 40)', 100, {}),
        nilai(
          'dibulatkan-bawah',
          'Satu dari tiga dibulatkan ke bawah',
          'hitungPersen(1, 3)',
          33,
          {},
        ),
        // Skenario inilah yang memisahkan floor dari round. Tanpa dia, Math.round lolos semua
        // kasus di atas dan aturan "dibulatkan ke bawah" tidak pernah benar-benar diuji.
        nilai(
          'bukan-terdekat',
          'Dua dari tiga tetap dibulatkan ke bawah',
          'hitungPersen(2, 3)',
          66,
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'potong-teks-elipsis',
    title: 'Potong teks panjang dengan elipsis',
    topic: 'teks-angka',
    level: 'basic',
    realWorldUse:
      'Ringkasan di kartu artikel, pratinjau pesan di daftar chat, dan judul panjang yang harus muat di satu baris tabel.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Di halaman daftar artikel, setiap kartu menampilkan cuplikan judul. Judul yang terlalu panjang merusak tampilan kartu, jadi judul itu dipotong lalu diberi tanda `…` di ujungnya sebagai tanda masih ada lanjutannya. Judul yang sudah cukup pendek ditampilkan utuh tanpa tanda apa pun.',
      tasks: [
        'Buat fungsi bernama `potongTeks` yang menerima dua parameter, yaitu `teks` dan angka `maks`.',
        'Kalau panjang `teks` lebih dari `maks`, ambil `maks` karakter pertama lalu tambahkan `…` di ujungnya.',
        'Kalau panjang `teks` kurang dari atau sama dengan `maks`, kembalikan `teks` apa adanya.',
      ],
      pitfalls: [
        'Teks yang panjangnya persis sama dengan `maks` sudah muat seluruhnya, jadi tidak perlu dipotong. Memakai `<` alih-alih `<=` membuat teks itu tetap dipotong tanpa alasan.',
        'Jangan menambahkan `…` pada teks yang tidak dipotong. Tanda itu menjanjikan masih ada lanjutan, padahal tidak ada.',
      ],
      terms: [
        {
          term: 'ellipsis (…)',
          meaning:
            'Tanda tiga titik yang menandakan ada bagian teks yang dihilangkan. Di soal ini dipakai satu karakter `…`, bukan tiga karakter titik biasa. Di antarmuka aplikasi, tanda ini memberi tahu pengguna bahwa teks aslinya lebih panjang daripada yang terlihat.',
        },
        {
          term: 'slice()',
          meaning:
            'Method untuk mengambil sebagian string atau array tanpa mengubah aslinya. `"Belajar".slice(0, 3)` menghasilkan `"Bel"`. Angka pertama adalah posisi awal, dan angka kedua adalah posisi akhir yang tidak ikut diambil.',
        },
        {
          term: 'length',
          meaning:
            'Properti yang berisi jumlah karakter pada string atau jumlah elemen pada array. `"Halo".length` bernilai `4`. Properti ini tidak ditulis dengan tanda kurung karena ia properti, bukan fungsi.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `potongTeks`.',
      'Teks yang panjangnya kurang dari atau sama dengan `maks` dikembalikan apa adanya.',
    ],
    starter: `
      function potongTeks(teks, maks) {
        // potong kalau terlalu panjang, biarkan kalau sudah pendek
      }
    `,
    hints: [
      'Bandingkan dulu panjangnya sebelum memotong apa pun.',
      '`.slice(0, maks)` mengambil bagian depan sebuah string.',
      'Perhatikan batasnya. Panjang yang persis sama dengan `maks` belum perlu dipotong.',
    ],
    solution: {
      code: `
        function potongTeks(teks, maks) {
          // Sudah muat? Kembalikan utuh, tanpa elipsis.
          if (teks.length <= maks) return teks;

          // Terlalu panjang. Ambil bagian depan, lalu beri tanda lanjutan.
          return teks.slice(0, maks) + '…';
        }
      `,
      steps: [
        '`teks.length <= maks` memeriksa apakah teksnya sudah muat. Kalau ya, teks dikembalikan utuh.',
        'Kalau sampai di baris berikutnya, berarti teksnya terlalu panjang.',
        '`teks.slice(0, maks)` mengambil `maks` karakter pertama.',
        '`+ "…"` menempelkan tanda elipsis di ujung potongan itu.',
      ],
      explanation:
        'Perbandingannya memakai `<=`, bukan `<`. Teks yang panjangnya persis `maks` sudah muat seluruhnya, dan memotongnya berarti membuang satu karakter lalu menggantinya dengan elipsis yang tidak mewakili apa-apa.',
    },
    alternativeSolutions: [
      `
        const potongTeks = (teks, maks) => (teks.length > maks ? teks.substring(0, maks) + '…' : teks);
      `,
      `
        function potongTeks(teks, maks) {
          if (teks.length > maks) {
            return \`\${teks.slice(0, maks)}…\`;
          }
          return teks;
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function potongTeks(teks, maks) {
            return teks.slice(0, maks) + '…';
          }
        `,
        reason: 'Menambahkan elipsis bahkan pada teks yang tidak dipotong sama sekali.',
      },
      {
        code: `
          function potongTeks(teks, maks) {
            if (teks.length < maks) return teks;
            return teks.slice(0, maks) + '…';
          }
        `,
        reason:
          'Memakai `<`, sehingga teks yang panjangnya persis `maks` tetap diberi elipsis tanpa alasan.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `potongTeks`', '\\bpotongTeks\\b')],
      [
        nilai(
          'kepanjangan',
          'Teks lebih panjang dari batas',
          'potongTeks("Belajar fullstack dari nol", 10)',
          'Belajar fu…',
          { visible: true },
        ),
        nilai('sudah-pendek', 'Teks sudah pendek', 'potongTeks("Halo", 10)', 'Halo', {}),
        nilai(
          'persis-batas',
          'Panjangnya persis sama dengan batas',
          'potongTeks("Halo", 4)',
          'Halo',
          {},
        ),
        nilai('kosong', 'Teks kosong', 'potongTeks("", 5)', '', {}),
      ],
    ),
  }),

  soal({
    slug: 'buat-slug-judul',
    title: 'Buat slug dari judul',
    topic: 'teks-angka',
    level: 'basic',
    realWorldUse:
      'Alamat URL artikel, halaman produk, dan anchor heading. Slug yang dibuat sembarangan menghasilkan alamat yang rusak dan tidak enak dibagikan.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Kamu membuat fitur blog. Saat penulis menyimpan artikel berjudul "Apa itu REST API?", alamat halamannya harus menjadi sesuatu seperti `/blog/apa-itu-rest-api`. Bagian terakhir alamat itu disebut slug. Slug dibuat otomatis dari judul, karena penulis tidak boleh diharapkan menulisnya sendiri setiap kali.',
      tasks: [
        'Buat fungsi bernama `buatSlug` yang menerima satu string, yaitu `judul`.',
        'Ubah semua huruf menjadi huruf kecil.',
        'Ganti setiap spasi dan tanda baca menjadi tanda hubung `-`.',
        'Pastikan hasilnya tidak punya tanda hubung dobel, dan tidak diawali atau diakhiri tanda hubung.',
      ],
      pitfalls: [
        'Judul dengan tanda baca di ujung adalah hal biasa, misalnya tanda tanya. Kalau tidak dibersihkan, slug-nya berakhir dengan tanda hubung seperti `apa-itu-rest-api-`, yang terlihat seperti kesalahan sistem.',
        'Spasi ganda atau gabungan tanda baca seperti `" & "` jangan menghasilkan `--`. Beberapa karakter yang tidak diizinkan dan letaknya berurutan cukup diganti satu tanda hubung.',
      ],
      terms: [
        {
          term: 'slug',
          meaning:
            'Bagian alamat URL yang mudah dibaca manusia dan biasanya dibuat dari judul. Pada `/blog/apa-itu-rest-api`, slug-nya adalah `apa-itu-rest-api`. Slug hanya berisi huruf kecil, angka, dan tanda hubung, supaya aman dipakai di URL.',
        },
        {
          term: 'regex (regular expression)',
          meaning:
            'Pola pencarian teks yang ditulis di antara dua garis miring. Contohnya `/[^a-z0-9]+/` berarti "satu atau lebih karakter yang BUKAN huruf kecil atau angka". Tanda `^` di dalam kurung siku artinya kebalikan, dan tanda `+` artinya satu atau lebih.',
        },
        {
          term: 'replace() dengan flag g',
          meaning:
            'Method string untuk mengganti bagian yang cocok dengan sebuah pola. Tanpa flag `g`, hanya kecocokan pertama yang diganti. Dengan `g` yang berarti global, semua kecocokan diganti. Contohnya `"a b c".replace(/ /g, "-")` menghasilkan `"a-b-c"`.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `buatSlug`.',
      'Tidak ada tanda hubung dobel, dan tidak ada tanda hubung di awal atau akhir.',
    ],
    starter: `
      function buatSlug(judul) {
        // ubah judul menjadi slug yang aman dipakai di URL
      }
    `,
    hints: [
      'Kerjakan bertahap. Kecilkan dulu hurufnya, lalu ganti karakter yang tidak diizinkan, baru rapikan ujungnya.',
      '`.replace()` menerima regex dengan flag `g` untuk mengganti semua kecocokan sekaligus.',
      'Pola `/[^a-z0-9]+/g` menangkap rangkaian karakter yang bukan huruf kecil atau angka. Ujungnya dibersihkan dengan `/^-+|-+$/g`.',
    ],
    solution: {
      code: `
        function buatSlug(judul) {
          return judul
            .toLowerCase() // "Apa itu REST API?" menjadi "apa itu rest api?"
            .replace(/[^a-z0-9]+/g, '-') // setiap rangkaian non huruf/angka menjadi SATU "-"
            .replace(/^-+|-+$/g, ''); // buang "-" yang tersisa di awal dan akhir
        }
      `,
      steps: [
        '`.toLowerCase()` mengubah semua huruf menjadi huruf kecil.',
        '`.replace(/[^a-z0-9]+/g, "-")` mencari setiap rangkaian karakter yang bukan huruf kecil atau angka, lalu menggantinya dengan SATU tanda hubung. Karena tanda `+` menangkap rangkaiannya sekaligus, tanda hubung dobel tidak pernah terbentuk.',
        'Tanda baca di ujung judul, misalnya tanda tanya, ikut berubah menjadi `-` di akhir.',
        '`.replace(/^-+|-+$/g, "")` membuang tanda hubung yang tersisa di awal dan akhir string.',
      ],
      explanation:
        'Urutan langkahnya yang membuat ini bekerja. Mengganti setiap rangkaian karakter tak diizinkan dengan SATU tanda hubung sudah mencegah tanda hubung dobel, sehingga tinggal ujungnya yang perlu dibersihkan. Kalau urutannya dibalik, kamu membersihkan ujung yang belum terbentuk.',
    },
    alternativeSolutions: [
      `
        function buatSlug(judul) {
          const kecil = judul.toLowerCase();
          const bersih = kecil.replace(/[^a-z0-9]/g, '-');
          const tunggal = bersih.replace(/-{2,}/g, '-');
          return tunggal.replace(/^-/, '').replace(/-$/, '');
        }
      `,
      `
        const buatSlug = (judul) =>
          judul
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter((bagian) => bagian.length > 0)
            .join('-');
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function buatSlug(judul) {
            return judul.toLowerCase().replace(/ /g, '-');
          }
        `,
        reason: 'Hanya mengganti spasi, sehingga tanda baca seperti tanda tanya ikut masuk ke URL.',
      },
      {
        code: `
          function buatSlug(judul) {
            return judul.toLowerCase().replace(/[^a-z0-9]/g, '-');
          }
        `,
        reason:
          'Setiap karakter diganti satu per satu, sehingga muncul tanda hubung dobel dan tanda hubung di ujung.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `buatSlug`', '\\bbuatSlug\\b')],
      [
        nilai(
          'judul-biasa',
          'Judul dengan spasi',
          'buatSlug("Belajar JavaScript dari Nol")',
          'belajar-javascript-dari-nol',
          { visible: true },
        ),
        nilai(
          'ada-tanda-baca',
          'Judul dengan tanda baca di ujung',
          'buatSlug("Apa itu REST API?")',
          'apa-itu-rest-api',
          {},
        ),
        nilai(
          'spasi-ganda',
          'Spasi ganda dan simbol di tengah',
          'buatSlug("Node.js  &  Express")',
          'node-js-express',
          {},
        ),
        nilai(
          'ada-angka',
          'Judul berisi angka',
          'buatSlug("Tailwind CSS v4")',
          'tailwind-css-v4',
          {},
        ),
        nilai('sudah-slug', 'Sudah berbentuk slug', 'buatSlug("react-hooks")', 'react-hooks', {}),
      ],
    ),
  }),

  soal({
    slug: 'ambil-satu-halaman',
    title: 'Potong daftar menjadi satu halaman',
    topic: 'teks-angka',
    level: 'basic',
    realWorldUse:
      'Pagination di sisi klien, yaitu menampilkan 10 baris per halaman dari data yang sudah dimuat seluruhnya ke browser.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Tabel pesanan di dashboard admin memuat 95 pesanan sekaligus. Menampilkan semuanya di satu layar membuat tabel terlalu panjang, jadi tabel dibagi menjadi beberapa halaman berisi 10 baris. Di bawah tabel ada tombol halaman 1, 2, 3, dan seterusnya. Saat tombol diklik, yang tampil hanya potongan data untuk halaman itu.',
      tasks: [
        'Buat fungsi bernama `ambilHalaman` yang menerima tiga parameter, yaitu array `daftar`, nomor `halaman`, dan jumlah `perHalaman`.',
        'Nomor halaman dimulai dari `1`, bukan `0`.',
        'Kembalikan potongan array untuk halaman tersebut.',
        'Halaman yang melewati ujung data menghasilkan array kosong, bukan error.',
      ],
      pitfalls: [
        'Manusia menghitung halaman mulai dari 1, sedangkan index array dimulai dari 0. Halaman 1 berarti index `0`, dan halaman 2 berarti index `perHalaman`. Lupa mengurangi satu membuat halaman pertama melewatkan data paling awal.',
        'Pengguna bisa sampai di halaman yang sudah tidak ada, misalnya lewat URL yang dibagikan orang lain setelah datanya berkurang. Fungsi harus tetap mengembalikan array kosong dengan tenang.',
      ],
      terms: [
        {
          term: 'pagination',
          meaning:
            'Teknik membagi data yang banyak menjadi beberapa halaman kecil. Kamu melihatnya di hasil pencarian Google dan di tabel admin. Pagination di sisi klien berarti seluruh data sudah ada di browser, lalu JavaScript yang memotongnya sesuai halaman.',
        },
        {
          term: 'index',
          meaning:
            'Nomor posisi elemen di dalam array, dimulai dari `0`. Pada `["a", "b", "c"]`, huruf `"a"` ada di index `0` dan `"c"` di index `2`. Perbedaan antara hitungan manusia yang mulai dari 1 dan index yang mulai dari 0 adalah sumber bug klasik bernama off by one.',
        },
        {
          term: 'slice(start, end)',
          meaning:
            'Method yang mengambil potongan array dari index `start` sampai sebelum index `end`, tanpa mengubah array aslinya. `[10, 20, 30, 40].slice(1, 3)` menghasilkan `[20, 30]`. Kalau `start` melewati ujung array, hasilnya array kosong dan tidak memunculkan error.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `ambilHalaman`.',
      'Nomor halaman dimulai dari 1.',
      'Halaman di luar jangkauan menghasilkan array kosong.',
    ],
    starter: `
      function ambilHalaman(daftar, halaman, perHalaman) {
        // kembalikan potongan untuk halaman ini
      }
    `,
    hints: [
      'Cari dulu index awal potongannya, baru potong array-nya.',
      'Halaman 1 mulai dari index 0, dan halaman 2 mulai dari index `perHalaman`.',
      '`.slice()` sudah mengembalikan array kosong kalau index awalnya melewati ujung. Tidak perlu penjagaan tambahan.',
    ],
    solution: {
      code: `
        function ambilHalaman(daftar, halaman, perHalaman) {
          // Halaman dihitung manusia mulai dari 1, index array mulai dari 0.
          const mulai = (halaman - 1) * perHalaman;

          // slice aman walau "mulai" sudah melewati ujung. Hasilnya array kosong.
          return daftar.slice(mulai, mulai + perHalaman);
        }
      `,
      steps: [
        '`(halaman - 1) * perHalaman` menghitung index awal. Untuk halaman 2 dengan 3 per halaman, hasilnya `(2 - 1) * 3 = 3`.',
        '`mulai + perHalaman` menjadi batas akhir potongan, yaitu index `6` pada contoh itu.',
        '`daftar.slice(3, 6)` mengambil elemen di index 3, 4, dan 5, karena batas akhirnya tidak ikut diambil.',
        'Kalau halamannya terlalu besar, `mulai` melewati ujung array dan `slice()` mengembalikan array kosong.',
      ],
      explanation:
        '`(halaman - 1)` adalah jembatan antara nomor halaman yang dibaca manusia dan index yang dipakai array. `slice()` juga sudah aman di luar jangkauan karena ia mengembalikan array kosong, bukan melempar error. Penjagaan tambahan hanya akan menambah baris tanpa menambah perlindungan.',
    },
    alternativeSolutions: [
      `
        const ambilHalaman = (daftar, halaman, perHalaman) =>
          daftar.slice((halaman - 1) * perHalaman, halaman * perHalaman);
      `,
      `
        function ambilHalaman(daftar, halaman, perHalaman) {
          const hasil = [];
          const mulai = (halaman - 1) * perHalaman;
          for (let i = mulai; i < mulai + perHalaman && i < daftar.length; i++) {
            hasil.push(daftar[i]);
          }
          return hasil;
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function ambilHalaman(daftar, halaman, perHalaman) {
            const mulai = halaman * perHalaman;
            return daftar.slice(mulai, mulai + perHalaman);
          }
        `,
        reason:
          'Lupa mengurangi satu dari nomor halaman, sehingga halaman 1 melewatkan data paling awal.',
      },
      {
        code: `
          function ambilHalaman(daftar, halaman, perHalaman) {
            return daftar.slice(0, perHalaman);
          }
        `,
        reason: 'Selalu mengembalikan halaman pertama, berapa pun nomor halaman yang diminta.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `ambilHalaman`', '\\bambilHalaman\\b')],
      [
        nilai(
          'halaman-pertama',
          'Halaman pertama',
          'ambilHalaman([1, 2, 3, 4, 5, 6, 7], 1, 3)',
          [1, 2, 3],
          { visible: true },
        ),
        nilai(
          'halaman-kedua',
          'Halaman kedua',
          'ambilHalaman([1, 2, 3, 4, 5, 6, 7], 2, 3)',
          [4, 5, 6],
          {},
        ),
        nilai(
          'halaman-terakhir-tak-penuh',
          'Halaman terakhir yang tidak penuh',
          'ambilHalaman([1, 2, 3, 4, 5, 6, 7], 3, 3)',
          [7],
          {},
        ),
        nilai(
          'di-luar-jangkauan',
          'Halaman melewati ujung data',
          'ambilHalaman([1, 2, 3], 9, 3)',
          [],
          {},
        ),
        nilai('daftar-kosong', 'Array kosong', 'ambilHalaman([], 1, 10)', [], {}),
      ],
    ),
  }),

  soal({
    slug: 'cari-field-kosong',
    title: 'Periksa field wajib yang masih kosong',
    topic: 'teks-angka',
    level: 'basic',
    realWorldUse:
      'Validasi form sebelum dikirim, supaya field yang belum diisi bisa ditandai satu per satu dan bukan hanya lewat satu pesan umum di atas form.',
    source: { category: 'frontend-basic', chapter: 'manipulasi-dom' },
    brief: {
      situation:
        'Form pendaftaran punya beberapa field wajib seperti nama dan email, serta field opsional seperti catatan. Saat pengguna menekan tombol Daftar, kamu ingin memberi tanda merah tepat di bawah field wajib yang masih kosong. Untuk itu kamu butuh daftar nama field yang belum diisi. Pengguna yang hanya mengetik spasi juga harus dianggap belum mengisi.',
      tasks: [
        'Buat fungsi bernama `cariYangKosong` yang menerima dua parameter, yaitu objek `form` dan array `wajib`.',
        '`form` berisi isian pengguna, misalnya `{ nama: "Ana", email: "" }`.',
        '`wajib` berisi nama field yang wajib diisi, misalnya `["nama", "email"]`.',
        'Kembalikan array berisi nama field wajib yang isinya masih kosong, dengan urutan mengikuti array `wajib`.',
      ],
      pitfalls: [
        'Isi yang hanya berupa spasi dihitung kosong. Pengguna yang menekan spasi untuk melewati validasi bukan kasus langka, dan data yang lolos karena itu tetap tidak berguna.',
        'Periksa berdasarkan array `wajib`, bukan berdasarkan isi `form`. Kalau kamu menelusuri isi form, field opsional yang sengaja dikosongkan ikut ditandai.',
        'Validasi di sisi klien ini hanya untuk kenyamanan pengguna. Pemeriksaan yang sebenarnya tetap harus dilakukan lagi di server.',
      ],
      terms: [
        {
          term: 'trim()',
          meaning:
            'Method string yang membuang spasi, tab, dan baris baru di awal dan akhir teks. `"   Ana  ".trim()` menghasilkan `"Ana"`, dan `"   ".trim()` menghasilkan string kosong `""`. Karena itulah `trim()` dipakai untuk mendeteksi isian yang cuma berisi spasi.',
        },
        {
          term: 'client-side validation',
          meaning:
            'Pemeriksaan data yang dijalankan di browser sebelum dikirim ke server. Gunanya memberi umpan balik cepat kepada pengguna. Tapi siapa pun bisa melewatinya, misalnya lewat devtools, sehingga server tetap wajib memeriksa ulang.',
        },
        {
          term: 'form[nama]',
          meaning:
            'Cara membaca properti objek memakai nama yang disimpan di variabel. Kalau `nama` bernilai `"email"`, maka `form[nama]` sama dengan `form.email`. Bentuk ini dibutuhkan karena nama field-nya baru diketahui saat program berjalan.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `cariYangKosong`.',
      'Isi yang hanya berupa spasi dihitung kosong.',
      'Urutan hasil mengikuti urutan array `wajib`.',
    ],
    starter: `
      function cariYangKosong(form, wajib) {
        // kembalikan nama field wajib yang masih kosong
      }
    `,
    hints: [
      'Yang kamu periksa adalah array nama field wajib, bukan isi form-nya.',
      '`.trim()` membuang spasi di kedua ujung. Kalau hasilnya kosong, berarti field itu memang kosong.',
      'Bentuknya `wajib.filter((nama) => !(form[nama] ?? "").trim())`.',
    ],
    solution: {
      code: `
        function cariYangKosong(form, wajib) {
          // Telusuri daftar field WAJIB, bukan isi form, supaya field opsional tidak ikut.
          return wajib.filter((nama) => {
            const isi = form[nama];
            // Belum ada, bukan teks, atau cuma berisi spasi berarti dihitung kosong.
            return typeof isi !== 'string' || isi.trim().length === 0;
          });
        }
      `,
      steps: [
        '`wajib.filter(...)` menelusuri setiap nama field wajib satu per satu.',
        '`form[nama]` mengambil isian pengguna untuk field itu.',
        '`typeof isi !== "string"` menangani field yang sama sekali tidak ada di form, karena nilainya `undefined`.',
        '`isi.trim().length === 0` menangani isian kosong dan isian yang hanya berisi spasi.',
        'Nama field yang lolos pemeriksaan itu dikumpulkan dan dikembalikan sesuai urutan array `wajib`.',
      ],
      explanation:
        'Yang ditelusuri adalah array field wajib, bukan isi form. Bedanya terasa ketika form memuat field opsional. Menelusuri isi form akan ikut menandai field opsional yang memang sengaja dikosongkan pengguna.',
    },
    alternativeSolutions: [
      `
        function cariYangKosong(form, wajib) {
          const kosong = [];
          for (const nama of wajib) {
            const isi = form[nama];
            if (!isi || String(isi).trim() === '') kosong.push(nama);
          }
          return kosong;
        }
      `,
      `
        const cariYangKosong = (form, wajib) =>
          wajib.filter((nama) => String(form[nama] ?? '').trim().length === 0);
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function cariYangKosong(form, wajib) {
            return wajib.filter((nama) => !form[nama]);
          }
        `,
        reason: 'Isian yang hanya berisi spasi dianggap sudah terisi, padahal tetap kosong.',
      },
      {
        code: `
          function cariYangKosong(form, wajib) {
            return Object.keys(form).filter((nama) => !String(form[nama]).trim());
          }
        `,
        reason:
          'Menelusuri seluruh isi form, sehingga field opsional yang sengaja dikosongkan ikut ditandai.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `cariYangKosong`', '\\bcariYangKosong\\b')],
      [
        nilai(
          'ada-yang-kosong',
          'Satu field kosong',
          'cariYangKosong({ nama: "Ana", email: "" }, ["nama", "email"])',
          ['email'],
          { visible: true },
        ),
        nilai(
          'cuma-spasi',
          'Field yang hanya berisi spasi',
          'cariYangKosong({ nama: "   " }, ["nama"])',
          ['nama'],
          {},
        ),
        nilai(
          'semuanya-terisi',
          'Semua field terisi',
          'cariYangKosong({ nama: "Ana", email: "a@b.id" }, ["nama", "email"])',
          [],
          {},
        ),
        nilai(
          'field-tidak-ada',
          'Field wajib yang sama sekali tidak ada di form',
          'cariYangKosong({}, ["nama"])',
          ['nama'],
          {},
        ),
        nilai(
          'abaikan-opsional',
          'Field opsional yang kosong tidak ikut ditandai',
          'cariYangKosong({ nama: "Ana", catatan: "" }, ["nama"])',
          [],
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'pisah-ribuan',
    title: 'Pisahkan ribuan pada angka',
    topic: 'teks-angka',
    level: 'basic',
    realWorldUse:
      'Setiap harga, total, dan nominal yang tampil ke pengguna. Angka 1250000 tanpa pemisah praktis tidak terbaca dalam sekali lihat.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Di halaman detail produk, harga tersimpan di database sebagai angka `1250000`. Pembeli yang melihat angka itu harus menghitung digitnya dulu untuk tahu harganya satu juta lebih. Format Indonesia memakai titik sebagai pemisah ribuan, sehingga angka itu seharusnya tampil sebagai `1.250.000`.',
      tasks: [
        'Buat fungsi bernama `pisahRibuan` yang menerima satu angka bulat.',
        'Kembalikan string dengan titik sebagai pemisah setiap tiga digit, dihitung dari kanan.',
        'Contohnya `1250000` menjadi `"1.250.000"`, dan `999` tetap `"999"`.',
      ],
      pitfalls: [
        'Pengelompokan tiga digit dihitung dari KANAN, bukan dari kiri. Kalau dihitung dari kiri, `1250000` malah menjadi `"125.000.0"`.',
        'Angka yang jumlah digitnya kelipatan tiga, seperti `100000`, tidak boleh diawali titik. Hasilnya harus `"100.000"`, bukan `".100.000"`.',
        '`Intl.NumberFormat` dan `toLocaleString` dilarang di soal ini. Di project nyata keduanya justru pilihan yang tepat, tapi keluarannya bisa berbeda antar lingkungan, dan soal ini ingin kamu memahami logikanya.',
      ],
      terms: [
        {
          term: 'thousand separator',
          meaning:
            'Tanda pemisah ribuan pada angka. Indonesia memakai titik seperti `1.250.000`, sedangkan format Inggris memakai koma seperti `1,250,000`. Karena berbeda antar negara, aplikasi yang melayani banyak negara biasanya menyerahkan urusan ini ke `Intl.NumberFormat`.',
        },
        {
          term: 'String()',
          meaning:
            'Fungsi bawaan yang mengubah nilai apa pun menjadi teks. `String(1250000)` menghasilkan `"1250000"`. Langkah ini perlu karena kita akan memeriksa digitnya satu per satu, dan itu hanya bisa dilakukan pada teks, bukan pada angka.',
        },
        {
          term: 'Intl.NumberFormat',
          meaning:
            'Fitur bawaan JavaScript untuk memformat angka sesuai kebiasaan negara tertentu. Contohnya `new Intl.NumberFormat("id-ID").format(1250000)` menghasilkan `"1.250.000"`. Beberapa lingkungan menyisipkan spasi khusus pada format mata uang, sehingga hasilnya tidak selalu sama persis.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `pisahRibuan`.',
      'Dilarang memakai `Intl` atau `toLocaleString`.',
      'Angka di bawah 1000 dikembalikan tanpa pemisah.',
    ],
    starter: `
      function pisahRibuan(angka) {
        // 1250000 menjadi "1.250.000"
      }
    `,
    hints: [
      'Ubah dulu angkanya menjadi teks, lalu sisipkan titik setiap tiga digit dihitung dari KANAN.',
      'Menelusuri teks dari belakang sambil menghitung digit adalah cara yang paling mudah dibaca.',
      'Kalau ingin memakai regex, pola `/\\B(?=(\\d{3})+(?!\\d))/g` menandai posisi setiap tiga digit dari kanan.',
    ],
    solution: {
      code: `
        function pisahRibuan(angka) {
          const teks = String(angka);
          let hasil = '';
          let hitung = 0;

          // Telusuri dari digit paling KANAN, karena ribuan dihitung dari belakang.
          for (let i = teks.length - 1; i >= 0; i--) {
            hasil = teks[i] + hasil; // tempel digit di depan hasil
            hitung++;

            // Setiap tiga digit sisipkan titik, KECUALI kalau sudah di digit paling depan.
            if (hitung % 3 === 0 && i > 0) hasil = '.' + hasil;
          }

          return hasil;
        }
      `,
      steps: [
        '`String(angka)` mengubah angka menjadi teks, misalnya `"1250000"`.',
        '`for` loop berjalan dari index terakhir ke index 0, jadi digit dibaca dari kanan ke kiri.',
        'Setiap digit ditempel di DEPAN `hasil`, sehingga urutan akhirnya tetap benar.',
        '`hitung % 3 === 0` bernilai benar setiap tiga digit. Saat itu sebuah titik disisipkan.',
        'Syarat `i > 0` mencegah titik muncul di paling depan, misalnya pada angka `100000`.',
      ],
      explanation:
        'Loop-nya berjalan dari kanan ke kiri karena pengelompokan ribuan memang dihitung dari belakang. Syarat `i > 0` yang mencegah titik muncul di paling depan pada angka yang jumlah digitnya kelipatan tiga, seperti `100000`.',
    },
    alternativeSolutions: [
      `
        function pisahRibuan(angka) {
          return String(angka).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
        }
      `,
      `
        const pisahRibuan = (angka) =>
          String(angka)
            .split('')
            .reverse()
            .reduce((hasil, digit, i) => digit + (i > 0 && i % 3 === 0 ? '.' : '') + hasil, '');
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function pisahRibuan(angka) {
            return angka.toLocaleString('id-ID');
          }
        `,
        reason: 'Memakai `toLocaleString`, yang sengaja dilarang di soal ini.',
      },
      {
        code: `
          function pisahRibuan(angka) {
            return String(angka).replace(/(\\d{3})/g, '$1.');
          }
        `,
        reason: 'Mengelompokkan digit dari KIRI, sehingga `1250000` malah menjadi `"125.000.0"`.',
      },
    ],
    check: mesinJs(
      [
        wajib('ada-fungsi', 'Ada fungsi bernama `pisahRibuan`', '\\bpisahRibuan\\b'),
        larang(
          'tanpa-intl',
          'Tidak memakai `Intl` atau `toLocaleString`',
          '\\bIntl\\b|toLocaleString',
        ),
      ],
      [
        nilai('jutaan', 'Satu juta lebih', 'pisahRibuan(1250000)', '1.250.000', { visible: true }),
        nilai('ratusan', 'Di bawah seribu', 'pisahRibuan(999)', '999', {}),
        nilai('pas-seribu', 'Tepat seribu', 'pisahRibuan(1000)', '1.000', {}),
        nilai(
          'kelipatan-tiga-digit',
          'Jumlah digitnya kelipatan tiga',
          'pisahRibuan(100000)',
          '100.000',
          {},
        ),
        nilai('nol', 'Angka nol', 'pisahRibuan(0)', '0', {}),
      ],
    ),
  }),

  soal({
    slug: 'selisih-hari',
    title: 'Hitung selisih hari antara dua tanggal',
    topic: 'teks-angka',
    level: 'basic',
    realWorldUse:
      'Tulisan seperti "Kedaluwarsa dalam 3 hari", tanggal jatuh tempo invoice, dan sisa masa langganan. Semuanya berasal dari perhitungan yang sama.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Aplikasi langganan menampilkan pesan "Langgananmu berakhir dalam N hari". Untuk menghitung N, kamu butuh selisih hari antara tanggal hari ini dan tanggal berakhirnya langganan. Kalau tanggal berakhirnya sudah lewat, selisihnya harus negatif supaya aplikasi tahu harus menampilkan pesan "sudah berakhir".',
      tasks: [
        'Buat fungsi bernama `selisihHari` yang menerima dua tanggal berformat `"YYYY-MM-DD"`, yaitu `mulai` dan `selesai`.',
        'Kembalikan selisihnya dalam hari sebagai bilangan bulat.',
        'Hasilnya negatif kalau `selesai` lebih awal daripada `mulai`.',
      ],
      pitfalls: [
        'Jangan memaksa hasilnya menjadi positif dengan `Math.abs`. Selisih negatif itulah yang memberi tahu bahwa tenggatnya sudah lewat.',
        'Jangan hanya membandingkan tanggal dalam bulan dengan `getDate()`. Cara itu rusak begitu dua tanggal ada di bulan yang berbeda, misalnya 28 Januari dan 3 Februari.',
      ],
      terms: [
        {
          term: 'Date',
          meaning:
            'Objek bawaan JavaScript untuk menyimpan tanggal dan waktu. `new Date("2026-01-04")` membuat objek tanggal 4 Januari 2026. Dua objek `Date` bisa dikurangkan satu sama lain, dan hasilnya adalah selisih waktu dalam milidetik.',
        },
        {
          term: 'milidetik',
          meaning:
            'Satuan waktu seperseribu detik, dan satuan yang dipakai JavaScript di balik layar untuk semua tanggal. Satu hari sama dengan `24 * 60 * 60 * 1000`, yaitu `86400000` milidetik. Karena itu selisih dua `Date` perlu dibagi angka tersebut supaya menjadi hari.',
        },
        {
          term: 'UTC',
          meaning:
            'Kependekan dari Coordinated Universal Time, yaitu waktu acuan dunia tanpa zona waktu. Tanggal berformat `"YYYY-MM-DD"` dibaca JavaScript sebagai tengah malam UTC. Karena kedua tanggal dibaca dengan cara yang sama, selisihnya selalu pas kelipatan satu hari.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `selisihHari`.',
      'Hasilnya negatif kalau tanggal selesai lebih awal.',
    ],
    starter: `
      function selisihHari(mulai, selesai) {
        // kembalikan selisih dalam hari
      }
    `,
    hints: [
      '`new Date("2026-01-01")` bisa dikurangkan dengan `Date` lain dan menghasilkan selisih dalam milidetik.',
      'Satu hari sama dengan `86400000` milidetik.',
      'Bentuknya `(new Date(selesai) - new Date(mulai)) / 86400000`.',
    ],
    solution: {
      code: `
        function selisihHari(mulai, selesai) {
          // Ditulis sebagai perkalian supaya mudah dicek. Hasilnya 86400000.
          const SEHARI = 24 * 60 * 60 * 1000;

          const awal = new Date(mulai);
          const akhir = new Date(selesai);

          // getTime() memberi milidetik. Selisihnya dibagi SEHARI menjadi jumlah hari.
          return Math.round((akhir.getTime() - awal.getTime()) / SEHARI);
        }
      `,
      steps: [
        '`SEHARI` menyimpan jumlah milidetik dalam satu hari, ditulis sebagai `24 * 60 * 60 * 1000` supaya mudah diperiksa.',
        '`new Date(mulai)` dan `new Date(selesai)` mengubah teks tanggal menjadi objek `Date`.',
        '`.getTime()` mengambil nilai milidetik dari tiap tanggal, lalu keduanya dikurangkan.',
        'Selisih milidetik itu dibagi `SEHARI`. Hasilnya negatif kalau `selesai` lebih awal, dan tanda negatif itu sengaja dibiarkan.',
        '`Math.round` dipakai sebagai jaring pengaman supaya hasilnya pasti bilangan bulat.',
      ],
      explanation:
        'Konstanta `SEHARI` ditulis sebagai `24 * 60 * 60 * 1000`, bukan `86400000`, supaya pembaca berikutnya tidak perlu menghitung untuk memastikan angkanya benar. `Math.round` dipakai karena tanggal berformat ini dibaca sebagai UTC, jadi hasilnya memang sudah bulat. Pembulatan di sini hanya jaring pengaman, bukan koreksi.',
    },
    alternativeSolutions: [
      `
        const selisihHari = (mulai, selesai) =>
          Math.round((new Date(selesai) - new Date(mulai)) / (1000 * 60 * 60 * 24));
      `,
      `
        function selisihHari(mulai, selesai) {
          const msPerHari = 86400000;
          const selisihMs = Date.parse(selesai) - Date.parse(mulai);
          return Math.round(selisihMs / msPerHari);
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function selisihHari(mulai, selesai) {
            return Math.abs(Math.round((new Date(selesai) - new Date(mulai)) / 86400000));
          }
        `,
        reason:
          'Memakai `Math.abs` sehingga hasilnya selalu positif, dan tanggal yang sudah lewat tidak bisa dibedakan lagi.',
      },
      {
        code: `
          function selisihHari(mulai, selesai) {
            return new Date(selesai).getDate() - new Date(mulai).getDate();
          }
        `,
        reason:
          'Hanya membandingkan tanggal dalam bulan, jadi hasilnya salah begitu dua tanggal ada di bulan yang berbeda.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `selisihHari`', '\\bselisihHari\\b')],
      [
        nilai('tiga-hari', 'Selisih tiga hari', 'selisihHari("2026-01-01", "2026-01-04")', 3, {
          visible: true,
        }),
        nilai('hari-sama', 'Tanggal yang sama', 'selisihHari("2026-01-01", "2026-01-01")', 0, {}),
        nilai(
          'sudah-lewat',
          'Tanggal selesai lebih awal',
          'selisihHari("2026-01-10", "2026-01-07")',
          -3,
          {},
        ),
        nilai('lintas-bulan', 'Berbeda bulan', 'selisihHari("2026-01-28", "2026-02-03")', 6, {}),
        nilai('lintas-tahun', 'Berbeda tahun', 'selisihHari("2025-12-30", "2026-01-02")', 3, {}),
      ],
    ),
  }),
];
