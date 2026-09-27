import { mesinJs, nilai, soal, wajib } from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * JavaScript — Intermediate, exercises 22–26: pagination metadata and asynchronous work.
 *
 * The three async exercises are graded by running real timers, not by mocking them. Delays are
 * kept to tens of milliseconds so the whole bank still grades in well under the two-second budget,
 * and concurrency is proved by counting how many tasks are in flight at once rather than by
 * measuring elapsed time — a timing assertion would be a flaky test waiting to happen.
 *
 * Visible async scenarios are SHOWN to the learner, so they carry Indonesian step comments. None
 * sits on the final line: `buildScenarioSource` appends `);` there, and a trailing line comment
 * would swallow it.
 */

export const exercises: Exercise[] = [
  soal({
    slug: 'meta-paginasi',
    title: 'Hitung metadata pagination',
    topic: 'async-api',
    level: 'intermediate',
    realWorldUse:
      'Bagian `meta` di response API yang berisi `totalHalaman` dan `adaBerikutnya`. Frontend memakainya untuk memutuskan tombol mana yang boleh diklik.',
    source: { category: 'backend-intermediate', chapter: 'desain-api' },
    brief: {
      situation:
        'Kamu membuat endpoint API yang mengembalikan daftar produk per halaman. Selain datanya, frontend juga butuh informasi pendukung, misalnya ada berapa halaman seluruhnya dan apakah masih ada halaman berikutnya. Tanpa informasi itu, frontend tidak tahu kapan harus mematikan tombol "Berikutnya".',
      tasks: [
        'Buat fungsi bernama `metaPaginasi` yang menerima tiga angka, yaitu `total`, `halaman`, dan `perHalaman`.',
        'Kembalikan objek `{ total, halaman, perHalaman, totalHalaman, adaSebelumnya, adaBerikutnya }`.',
        '`totalHalaman` adalah jumlah halaman yang dibutuhkan untuk menampung semua data.',
        '`adaSebelumnya` dan `adaBerikutnya` bernilai `true` atau `false`.',
      ],
      pitfalls: [
        'Jumlah halaman selalu dibulatkan ke ATAS. 21 data dengan 10 per halaman butuh 3 halaman, karena sisa 1 data tetap butuh satu halaman sendiri.',
        '`adaBerikutnya` dibandingkan dengan `totalHalaman`, bukan dengan `total` data. Salah membandingkan membuat tombol "Berikutnya" tetap menyala di halaman terakhir.',
        'Data kosong menghasilkan `totalHalaman` bernilai `0` dan `adaBerikutnya` bernilai `false`. Kalau salah, pengguna diantar ke halaman kosong dan mengira datanya hilang.',
      ],
      terms: [
        {
          term: 'metadata',
          meaning:
            'Data tentang data. Pada response API, datanya adalah daftar produk, sedangkan metadata-nya adalah keterangan seperti jumlah total dan nomor halaman. Metadata biasanya ditaruh di key terpisah bernama `meta` supaya tidak tercampur dengan datanya.',
        },
        {
          term: 'Math.ceil()',
          meaning:
            'Fungsi bawaan yang membulatkan angka ke ATAS menjadi bilangan bulat. `Math.ceil(2.1)` menghasilkan `3`. Kata ceil berasal dari ceiling yang berarti langit-langit. Kebalikannya `Math.floor()` yang berasal dari kata lantai dan membulatkan ke bawah.',
        },
        {
          term: 'boolean',
          meaning:
            'Tipe data yang hanya punya dua nilai, yaitu `true` dan `false`. Ekspresi perbandingan seperti `halaman > 1` langsung menghasilkan boolean, jadi kamu tidak perlu menulis `if` untuk mengisi `adaSebelumnya`.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `metaPaginasi`.',
      'Data kosong menghasilkan `totalHalaman` bernilai 0.',
      '`adaBerikutnya` bernilai `false` di halaman terakhir.',
    ],
    starter: `
      function metaPaginasi(total, halaman, perHalaman) {
        // kembalikan metadata pagination
      }
    `,
    hints: [
      'Jumlah halaman selalu dibulatkan ke ATAS, karena sisa satu data tetap butuh satu halaman.',
      'Pakai `Math.ceil(total / perHalaman)`.',
      '`adaBerikutnya` membandingkan halaman sekarang dengan `totalHalaman`, bukan dengan jumlah data.',
    ],
    solution: {
      code: `
        function metaPaginasi(total, halaman, perHalaman) {
          // Bulatkan ke ATAS. 21 data dengan 10 per halaman butuh 3 halaman.
          const totalHalaman = Math.ceil(total / perHalaman);

          return {
            total,
            halaman,
            perHalaman,
            totalHalaman,
            adaSebelumnya: halaman > 1, // halaman 1 tidak punya halaman sebelumnya
            adaBerikutnya: halaman < totalHalaman, // dibandingkan dengan totalHalaman
          };
        }
      `,
      steps: [
        '`total / perHalaman` membagi jumlah data dengan kapasitas per halaman, misalnya `21 / 10 = 2.1`.',
        '`Math.ceil(...)` membulatkannya ke atas menjadi `3`. Untuk data kosong, `Math.ceil(0 / 10)` menghasilkan `0`.',
        '`total, halaman, perHalaman` adalah penulisan singkat untuk `total: total`, dan seterusnya.',
        '`halaman > 1` langsung menghasilkan boolean untuk `adaSebelumnya`.',
        '`halaman < totalHalaman` menghasilkan `false` di halaman terakhir dan juga saat datanya kosong.',
      ],
      explanation:
        '`Math.ceil` dipakai karena sisa satu data tetap membutuhkan satu halaman penuh. `adaBerikutnya` dibandingkan dengan `totalHalaman`, bukan dengan `total`. Kekeliruan membandingkan itu menghasilkan tombol "Berikutnya" yang tetap menyala di halaman terakhir.',
    },
    alternativeSolutions: [
      `
        const metaPaginasi = (total, halaman, perHalaman) => {
          const totalHalaman = total === 0 ? 0 : Math.ceil(total / perHalaman);
          return {
            total: total,
            halaman: halaman,
            perHalaman: perHalaman,
            totalHalaman: totalHalaman,
            adaSebelumnya: halaman > 1,
            adaBerikutnya: halaman * perHalaman < total,
          };
        };
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function metaPaginasi(total, halaman, perHalaman) {
            const totalHalaman = Math.floor(total / perHalaman);
            return {
              total,
              halaman,
              perHalaman,
              totalHalaman,
              adaSebelumnya: halaman > 1,
              adaBerikutnya: halaman < totalHalaman,
            };
          }
        `,
        reason:
          'Membulatkan ke bawah, sehingga sisa data di halaman terakhir tidak pernah bisa dijangkau.',
      },
      {
        code: `
          function metaPaginasi(total, halaman, perHalaman) {
            return {
              total,
              halaman,
              perHalaman,
              totalHalaman: Math.ceil(total / perHalaman),
              adaSebelumnya: halaman > 0,
              adaBerikutnya: true,
            };
          }
        `,
        reason: '`adaBerikutnya` selalu `true`, sehingga tombol "Berikutnya" tidak pernah mati.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `metaPaginasi`', '\\bmetaPaginasi\\b')],
      [
        nilai(
          'tengah',
          'Halaman kedua dari tiga',
          'metaPaginasi(25, 2, 10)',
          {
            total: 25,
            halaman: 2,
            perHalaman: 10,
            totalHalaman: 3,
            adaSebelumnya: true,
            adaBerikutnya: true,
          },
          { visible: true },
        ),
        nilai(
          'halaman-terakhir',
          'Halaman terakhir',
          'metaPaginasi(25, 3, 10).adaBerikutnya',
          false,
          {},
        ),
        nilai(
          'halaman-pertama',
          'Halaman pertama',
          'metaPaginasi(25, 1, 10).adaSebelumnya',
          false,
          {},
        ),
        nilai('data-kosong', 'Tidak ada data', 'metaPaginasi(0, 1, 10).totalHalaman', 0, {}),
        nilai(
          'sisa-satu',
          'Sisa satu data tetap mendapat satu halaman',
          'metaPaginasi(21, 1, 10).totalHalaman',
          3,
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'buat-debounce',
    title: 'Buat debounce',
    topic: 'async-api',
    level: 'intermediate',
    realWorldUse:
      'Kotak pencarian yang menunggu pengguna berhenti mengetik sebelum memanggil API. Tanpa debounce, mengetik kata "laptop" mengirim enam request.',
    source: { category: 'frontend-basic', chapter: 'manipulasi-dom' },
    brief: {
      situation:
        'Kotak pencarian produk memanggil API setiap kali isinya berubah. Saat pengguna mengetik "laptop", ada enam request yang terkirim, yaitu untuk "l", "la", "lap", dan seterusnya. Server terbebani, dan hasil yang datang terlambat bisa menimpa hasil yang benar. Solusinya debounce, yaitu menunggu sampai pengguna berhenti mengetik sebentar, baru memanggil API sekali.',
      tasks: [
        'Buat fungsi bernama `buatDebounce` yang menerima dua parameter, yaitu fungsi `fn` dan angka `jeda` dalam milidetik.',
        '`buatDebounce` mengembalikan fungsi BARU.',
        'Setiap kali fungsi baru itu dipanggil, ia menunda pemanggilan `fn` selama `jeda` milidetik.',
        'Kalau fungsi baru itu dipanggil lagi sebelum jedanya habis, penundaan sebelumnya dibatalkan dan hitungan dimulai dari awal.',
        '`fn` dipanggil dengan argumen dari pemanggilan TERAKHIR.',
      ],
      pitfalls: [
        'Id timer harus disimpan di LUAR fungsi yang dikembalikan. Kalau disimpan di dalam, setiap pemanggilan membuat variabel baru dan tidak ada yang bisa membatalkan timer sebelumnya.',
        '`fn` harus menerima argumen pemanggilan terakhir. Kalau yang terkirim argumen pemanggilan pertama, kotak pencarian akan mencari huruf pertama yang diketik, bukan kata yang akhirnya ditulis.',
      ],
      terms: [
        {
          term: 'debounce',
          meaning:
            'Teknik menunda sebuah aksi sampai pemicunya berhenti selama beberapa waktu. Istilahnya berasal dari elektronika, yaitu meredam tombol fisik yang memantul dan terbaca ditekan berkali-kali. Contohnya pencarian yang baru jalan 300 milidetik setelah pengguna berhenti mengetik.',
        },
        {
          term: 'closure',
          meaning:
            'Kemampuan fungsi untuk tetap mengingat variabel di sekitarnya, bahkan setelah fungsi luarnya selesai dijalankan. Di soal ini, fungsi yang dikembalikan tetap bisa membaca dan mengubah variabel `timer` milik `buatDebounce`. Itulah cara ia mengingat timer sebelumnya.',
        },
        {
          term: 'setTimeout / clearTimeout',
          meaning:
            '`setTimeout(fn, 300)` menjadwalkan `fn` untuk dijalankan 300 milidetik lagi, lalu mengembalikan sebuah id. `clearTimeout(id)` membatalkan jadwal itu. Memanggil `clearTimeout` dengan id yang sudah selesai atau `undefined` aman dan tidak melempar error.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `buatDebounce`.',
      'Pemanggilan baru membatalkan penundaan sebelumnya.',
      '`fn` menerima argumen dari pemanggilan terakhir.',
    ],
    starter: `
      function buatDebounce(fn, jeda) {
        // kembalikan fungsi yang menunda pemanggilan fn
      }
    `,
    hints: [
      'Fungsi yang dikembalikan harus mengingat sesuatu di antara pemanggilan, yaitu id timer sebelumnya.',
      'Simpan id timer di variabel yang dideklarasikan di dalam `buatDebounce`, tapi di LUAR fungsi yang dikembalikan.',
      'Di setiap pemanggilan, batalkan timer lama dengan `clearTimeout`, lalu pasang timer baru dengan `setTimeout`.',
    ],
    solution: {
      code: `
        function buatDebounce(fn, jeda) {
          // Disimpan di LUAR fungsi yang dikembalikan, jadi nilainya bertahan antar pemanggilan.
          let timer;

          return (...args) => {
            clearTimeout(timer); // batalkan jadwal yang lama
            timer = setTimeout(() => fn(...args), jeda); // pasang jadwal baru
          };
        }
      `,
      steps: [
        '`let timer` dideklarasikan sekali saat `buatDebounce` dipanggil, dan ia tetap hidup karena closure.',
        '`return (...args) => {...}` mengembalikan fungsi baru. `...args` mengumpulkan semua argumen yang dikirim saat fungsi itu dipanggil.',
        '`clearTimeout(timer)` membatalkan jadwal yang dibuat oleh pemanggilan sebelumnya.',
        '`setTimeout(() => fn(...args), jeda)` membuat jadwal baru yang memakai argumen pemanggilan saat ini, lalu id-nya disimpan kembali ke `timer`.',
        'Kalau tidak ada pemanggilan baru selama `jeda` milidetik, jadwal terakhir berjalan dan `fn` dipanggil sekali saja.',
      ],
      explanation:
        '`timer` hidup di closure, bukan di dalam fungsi yang dikembalikan. Itulah yang membuatnya bertahan dari satu pemanggilan ke pemanggilan berikutnya. Kalau `timer` ditaruh di dalam, setiap pemanggilan memulai timer baru tanpa pernah membatalkan yang lama, sehingga semua panggilan tetap berjalan.',
    },
    alternativeSolutions: [
      `
        function buatDebounce(fn, jeda) {
          let timer = null;
          return function (...args) {
            if (timer !== null) clearTimeout(timer);
            timer = setTimeout(function () {
              fn.apply(null, args);
            }, jeda);
          };
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function buatDebounce(fn, jeda) {
            return (...args) => {
              setTimeout(() => fn(...args), jeda);
            };
          }
        `,
        reason:
          'Tidak membatalkan apa pun, sehingga semua pemanggilan tetap berjalan dan hanya tertunda.',
      },
      {
        code: `
          function buatDebounce(fn, jeda) {
            return (...args) => {
              let timer;
              clearTimeout(timer);
              timer = setTimeout(() => fn(...args), jeda);
            };
          }
        `,
        reason:
          '`timer` dideklarasikan di dalam fungsi yang dikembalikan, jadi tidak ada yang diingat antar pemanggilan.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `buatDebounce`', '\\bbuatDebounce\\b')],
      [
        nilai(
          'tiga-panggilan-jadi-satu',
          'Tiga pemanggilan beruntun hanya menjalankan fn sekali',
          `
            (async () => {
              let hitung = 0;
              let terakhir = null;
              const catat = (n) => { hitung += 1; terakhir = n; };

              const tunda = buatDebounce(catat, 20);
              tunda(1); tunda(2); tunda(3); // dipanggil tiga kali berturut-turut

              await new Promise((r) => setTimeout(r, 80)); // tunggu sampai jedanya lewat
              return [hitung, terakhir]; // hanya sekali jalan, dengan argumen terakhir
            })()
          `,
          [1, 3],
          { visible: true },
        ),
        nilai(
          'belum-jalan-sebelum-jeda',
          'Belum dipanggil sebelum jedanya lewat',
          `
            (async () => {
              let hitung = 0;
              const tunda = buatDebounce(() => { hitung += 1; }, 50);
              tunda();
              await new Promise((r) => setTimeout(r, 10));
              return hitung;
            })()
          `,
          0,
          {},
        ),
        nilai(
          'dua-gelombang',
          'Dua rangkaian pemanggilan yang terpisah menghasilkan dua eksekusi',
          `
            (async () => {
              let hitung = 0;
              const tunda = buatDebounce(() => { hitung += 1; }, 20);
              tunda();
              await new Promise((r) => setTimeout(r, 60));
              tunda();
              await new Promise((r) => setTimeout(r, 60));
              return hitung;
            })()
          `,
          2,
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'jalankan-bersamaan',
    title: 'Jalankan beberapa request sekaligus',
    topic: 'async-api',
    level: 'intermediate',
    realWorldUse:
      'Dashboard yang menarik data dari beberapa endpoint sekaligus. Kalau dikerjakan berurutan, tiga request yang masing-masing 300 milidetik jadi menunggu 900 milidetik tanpa alasan.',
    source: { category: 'frontend-basic', chapter: 'asynchronous-javascript' },
    brief: {
      situation:
        'Halaman dashboard butuh tiga data dari tiga endpoint, yaitu penjualan hari ini, jumlah pengguna baru, dan pesanan yang tertunda. Ketiganya tidak saling bergantung. Kalau diambil satu per satu, waktu tunggunya dijumlahkan. Kalau diambil bersamaan, waktu tunggunya hanya selama request yang paling lambat.',
      tasks: [
        'Buat fungsi bernama `ambilSemua` yang menerima array berisi fungsi.',
        'Setiap fungsi di array itu, kalau dipanggil, mengembalikan sebuah `Promise`.',
        'Jalankan SEMUA fungsi itu bersamaan, lalu kembalikan `Promise` yang berisi array hasilnya.',
        'Urutan hasil harus sama dengan urutan fungsi di array masukan, apa pun urutan selesainya.',
      ],
      pitfalls: [
        'Memakai `await` di dalam `for` loop membuat tugas kedua baru dimulai setelah tugas pertama selesai. Hasilnya sama persis, tapi waktu tunggunya berlipat sebanyak jumlah tugas.',
        '`Promise.race` hanya mengembalikan yang PERTAMA selesai, bukan semuanya.',
      ],
      terms: [
        {
          term: 'Promise',
          meaning:
            'Objek yang mewakili hasil yang baru akan ada nanti, misalnya response dari server. Promise bisa berhasil dengan membawa nilai, atau gagal dengan membawa error. Kamu menunggu hasilnya dengan `await` atau dengan `.then()`.',
        },
        {
          term: 'Promise.all()',
          meaning:
            'Fungsi yang menerima array berisi Promise, lalu mengembalikan satu Promise baru yang selesai ketika SEMUA Promise di dalamnya selesai. Hasilnya array yang urutannya sama dengan array masukan, bukan urutan selesainya.',
        },
        {
          term: 'concurrency',
          meaning:
            'Menjalankan beberapa pekerjaan dalam rentang waktu yang sama, alih-alih satu per satu. Untuk request jaringan, ini berarti mengirim semua request dulu, baru menunggu jawabannya. Menunggu jawaban server tidak memakai CPU, jadi menunggu tiga sekaligus tidak lebih berat daripada menunggu satu.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `ambilSemua`.',
      'Semua tugas berjalan bersamaan, bukan berurutan.',
      'Urutan hasil sama dengan urutan masukan.',
    ],
    starter: `
      function ambilSemua(tugas) {
        // jalankan semua sekaligus, kembalikan array hasil
      }
    `,
    hints: [
      'Mulai dulu semuanya, baru tunggu hasilnya. `await` di dalam `for` loop melakukan kebalikannya.',
      '`Promise.all` menunggu banyak Promise sekaligus dan menjaga urutannya.',
      'Panggil setiap fungsi untuk mendapatkan Promise-nya, lalu serahkan seluruh array Promise itu ke `Promise.all`.',
    ],
    solution: {
      code: `
        function ambilSemua(tugas) {
          // map() memanggil SETIAP fungsi sekarang juga, jadi semuanya mulai bersamaan.
          // Promise.all baru menunggu setelah semuanya berjalan.
          return Promise.all(tugas.map((jalankan) => jalankan()));
        }
      `,
      steps: [
        '`tugas.map((jalankan) => jalankan())` memanggil setiap fungsi saat itu juga. Setiap pemanggilan langsung memulai pekerjaannya dan mengembalikan sebuah Promise.',
        'Hasil `map` adalah array berisi Promise yang semuanya sudah berjalan.',
        '`Promise.all(...)` menunggu sampai semua Promise itu selesai.',
        'Hasilnya array yang urutannya mengikuti array masukan, walaupun tugas kedua mungkin selesai lebih dulu daripada tugas pertama.',
      ],
      explanation:
        '`tugas.map((jalankan) => jalankan())` memulai semuanya lebih dulu, dan `Promise.all` baru menunggu sesudahnya. Bandingkan dengan `for (const t of tugas) hasil.push(await t())`. Bentuk itu baru memulai tugas kedua setelah yang pertama selesai, dan itulah bedanya 300 milidetik dengan 900 milidetik.',
    },
    alternativeSolutions: [
      `
        async function ambilSemua(tugas) {
          const janji = [];
          for (const jalankan of tugas) {
            janji.push(jalankan());
          }
          return await Promise.all(janji);
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          async function ambilSemua(tugas) {
            const hasil = [];
            for (const jalankan of tugas) {
              hasil.push(await jalankan());
            }
            return hasil;
          }
        `,
        reason:
          'Hasilnya benar, tapi dikerjakan berurutan. Hanya satu tugas yang berjalan pada satu waktu.',
      },
      {
        code: `
          function ambilSemua(tugas) {
            return Promise.race(tugas.map((jalankan) => jalankan()));
          }
        `,
        reason: '`Promise.race` hanya mengembalikan hasil yang pertama selesai, bukan semuanya.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `ambilSemua`', '\\bambilSemua\\b')],
      [
        nilai(
          'urutan-terjaga',
          'Hasilnya mengikuti urutan masukan',
          `
            (async () => {
              // Tugas "a" butuh 30 ms, tugas "b" hanya 5 ms, jadi "b" selesai lebih dulu.
              const buat = (nilai, ms) => () => new Promise((r) => setTimeout(() => r(nilai), ms));

              // Walau begitu, hasilnya tetap mengikuti urutan masukan.
              return await ambilSemua([buat('a', 30), buat('b', 5)]);
            })()
          `,
          ['a', 'b'],
          { visible: true },
        ),
        nilai(
          'benar-benar-bersamaan',
          'Beberapa tugas benar-benar berjalan bersamaan',
          `
            (async () => {
              let aktif = 0;
              let puncak = 0;
              const buat = (nilai) => () => new Promise((r) => {
                aktif += 1;
                puncak = Math.max(puncak, aktif);
                setTimeout(() => { aktif -= 1; r(nilai); }, 20);
              });
              await ambilSemua([buat(1), buat(2), buat(3)]);
              return puncak;
            })()
          `,
          3,
          {},
        ),
        nilai(
          'tanpa-tugas',
          'Tanpa tugas sama sekali',
          '(async () => await ambilSemua([]))()',
          [],
          {},
        ),
        nilai(
          'satu-tugas',
          'Satu tugas',
          "(async () => await ambilSemua([() => Promise.resolve('tunggal')]))()",
          ['tunggal'],
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'coba-lagi-dengan-jeda',
    title: 'Retry request yang gagal dengan jeda yang makin panjang',
    topic: 'async-api',
    level: 'intermediate',
    realWorldUse:
      'Panggilan API yang sesekali gagal karena gangguan jaringan. Mengulang langsung tanpa jeda justru menambah beban server yang sedang bermasalah.',
    source: { category: 'frontend-basic', chapter: 'asynchronous-javascript' },
    brief: {
      situation:
        'Aplikasimu mengirim data ke server pembayaran yang kadang sibuk dan menolak request sementara. Biasanya kalau dicoba lagi sebentar kemudian, request itu berhasil. Tapi kalau semua pengguna langsung mencoba ulang tanpa jeda, server yang sedang kewalahan malah makin terbebani. Maka setiap percobaan ulang diberi jeda yang makin lama makin panjang.',
      tasks: [
        'Buat fungsi async bernama `cobaLagi` yang menerima tiga parameter, yaitu fungsi `fn`, angka `maks`, dan angka `jedaAwal`.',
        'Panggil `fn`. Kalau berhasil, kembalikan hasilnya.',
        'Kalau gagal, tunggu sebentar lalu coba lagi, sampai paling banyak `maks` kali percobaan.',
        'Jeda antar percobaan berlipat dua, yaitu `jedaAwal`, lalu dua kalinya, lalu dua kalinya lagi.',
        'Kalau semua percobaan gagal, Promise-nya harus ditolak dengan error terakhir.',
      ],
      pitfalls: [
        'Jangan mengembalikan `null` diam-diam saat semua percobaan gagal. Kegagalan yang disamarkan menjadi nilai kosong adalah bug yang baru ketahuan jauh di bagian kode yang lain.',
        'Jedanya harus berlipat, bukan tetap. Jeda tetap tidak memberi server waktu tambahan untuk pulih.',
        'Percobaan terakhir tidak perlu menunggu, karena tidak ada lagi percobaan yang menyusul.',
      ],
      terms: [
        {
          term: 'retry',
          meaning:
            'Mengulang sebuah operasi yang gagal, dengan harapan kegagalannya hanya sementara. Retry cocok untuk gangguan jaringan atau server yang sibuk. Retry tidak cocok untuk kesalahan yang pasti berulang, misalnya password yang salah.',
        },
        {
          term: 'exponential backoff',
          meaning:
            'Aturan jeda retry yang berlipat setiap kali gagal, misalnya 100, 200, lalu 400 milidetik. Kata exponential merujuk pada pangkat dua. Rumusnya `jedaAwal * 2 ** percobaan`, dengan `**` berarti pangkat, sehingga `2 ** 3` sama dengan `8`.',
        },
        {
          term: 'try / catch',
          meaning:
            'Pasangan blok untuk menangani error. Kode yang mungkin gagal ditulis di dalam `try`. Kalau error terjadi, JavaScript melompat ke `catch` dan error-nya bisa diperiksa di sana. Tanpa `try`, satu error menghentikan seluruh fungsi.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `cobaLagi`.',
      'Jeda antar percobaan berlipat dua, bukan tetap.',
      'Kalau gagal semua, Promise ditolak, bukan mengembalikan nilai kosong.',
    ],
    starter: `
      async function cobaLagi(fn, maks, jedaAwal) {
        // ulangi sampai berhasil atau kehabisan percobaan
      }
    `,
    hints: [
      '`for` loop dengan `try/catch` di dalamnya lebih mudah dibaca daripada rekursi di sini.',
      'Percobaan terakhir tidak perlu menunggu, karena tidak ada lagi percobaan yang menyusul.',
      'Jedanya `jedaAwal * 2 ** percobaan`, dengan `percobaan` dimulai dari 0.',
    ],
    solution: {
      code: `
        async function cobaLagi(fn, maks, jedaAwal) {
          let terakhir; // menyimpan error terakhir untuk dilempar kalau semua gagal

          for (let percobaan = 0; percobaan < maks; percobaan++) {
            try {
              return await fn(); // berhasil? langsung selesai
            } catch (error) {
              terakhir = error;

              // Tunggu dulu, KECUALI ini percobaan terakhir.
              if (percobaan < maks - 1) {
                const jeda = jedaAwal * 2 ** percobaan; // 1x, 2x, 4x, dan seterusnya
                await new Promise((r) => setTimeout(r, jeda));
              }
            }
          }

          throw terakhir; // semua gagal, jadi tolak dengan error yang sebenarnya
        }
      `,
      steps: [
        '`for` loop mencoba paling banyak `maks` kali, dengan `percobaan` bernilai 0, 1, 2, dan seterusnya.',
        'Di dalam `try`, `await fn()` menjalankan fungsinya. Kalau berhasil, `return` langsung mengembalikan hasilnya dan loop berhenti.',
        'Kalau `fn` gagal, JavaScript melompat ke `catch` dan error-nya disimpan di `terakhir`.',
        'Selama belum percobaan terakhir, fungsi menunggu `jedaAwal * 2 ** percobaan` milidetik, yang berlipat setiap kali gagal.',
        'Kalau loop selesai tanpa ada yang berhasil, `throw terakhir` menolak Promise dengan error yang sebenarnya.',
      ],
      explanation:
        'Ada dua detail yang mudah terlewat. Percobaan terakhir tidak menunggu, karena menunggu setelahnya tidak ada gunanya. Error terakhir juga disimpan lalu dilempar ulang, supaya pemanggil tahu apa yang sebenarnya gagal, bukan sekadar tahu semua percobaan sudah habis.',
    },
    alternativeSolutions: [
      `
        async function cobaLagi(fn, maks, jedaAwal) {
          let jeda = jedaAwal;
          for (let i = 1; i <= maks; i++) {
            try {
              return await fn();
            } catch (error) {
              if (i === maks) throw error;
              await new Promise((resolve) => setTimeout(resolve, jeda));
              jeda = jeda * 2;
            }
          }
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          async function cobaLagi(fn, maks, jedaAwal) {
            for (let i = 0; i < maks; i++) {
              try {
                return await fn();
              } catch (error) {
                await new Promise((r) => setTimeout(r, jedaAwal));
              }
            }
            return null;
          }
        `,
        reason: 'Mengembalikan `null` saat semua gagal, dan jedanya tetap sehingga tidak berlipat.',
      },
      {
        code: `
          async function cobaLagi(fn, maks, jedaAwal) {
            try {
              return await fn();
            } catch (error) {
              await new Promise((r) => setTimeout(r, jedaAwal * 2));
              return await fn();
            }
          }
        `,
        reason: 'Selalu mencoba tepat dua kali dan mengabaikan nilai `maks` yang diberikan.',
      },
    ],
    check: mesinJs(
      [
        wajib('ada-fungsi', 'Ada fungsi bernama `cobaLagi`', '\\bcobaLagi\\b'),
        // Lapis batasan dipakai di sini karena menguji lamanya jeda lewat jam dinding akan
        // melahirkan test yang rapuh. Yang diperiksa: jedanya dilipatgandakan, bukan tetap.
        wajib('ada-backoff', 'Jeda antar percobaan dilipatgandakan', '\\*\\s*2|2\\s*\\*\\*|<<\\s*'),
      ],
      [
        nilai(
          'berhasil-di-percobaan-ketiga',
          'Berhasil setelah dua kali gagal',
          `
            (async () => {
              let percobaan = 0;

              // Fungsi ini gagal dua kali, lalu berhasil di percobaan ketiga.
              const kadangGagal = async () => {
                percobaan += 1;
                if (percobaan < 3) throw new Error('jaringan');
                return 'berhasil';
              };

              const hasil = await cobaLagi(kadangGagal, 5, 5);
              return [hasil, percobaan]; // hasilnya "berhasil", setelah 3 kali percobaan
            })()
          `,
          ['berhasil', 3],
          { visible: true },
        ),
        nilai(
          'langsung-berhasil',
          'Berhasil di percobaan pertama, tanpa mengulang',
          `
            (async () => {
              let percobaan = 0;
              const hasil = await cobaLagi(async () => { percobaan += 1; return 'ok'; }, 3, 5);
              return [hasil, percobaan];
            })()
          `,
          ['ok', 1],
          {},
        ),
        nilai(
          'gagal-semua-ditolak',
          'Gagal semua berarti Promise ditolak',
          `
            (async () => {
              const selaluGagal = async () => { throw new Error('mati'); };
              try {
                await cobaLagi(selaluGagal, 3, 5);
                return 'tidak ditolak';
              } catch (error) {
                return 'ditolak';
              }
            })()
          `,
          'ditolak',
          {},
        ),
        nilai(
          'tidak-melebihi-maks',
          'Tidak mencoba lebih dari maks kali',
          `
            (async () => {
              let percobaan = 0;
              const selaluGagal = async () => { percobaan += 1; throw new Error('mati'); };
              try { await cobaLagi(selaluGagal, 3, 5); } catch (error) { /* diharapkan */ }
              return percobaan;
            })()
          `,
          3,
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'waktu-relatif',
    title: 'Ubah tanggal menjadi waktu relatif',
    topic: 'async-api',
    level: 'intermediate',
    realWorldUse:
      'Tulisan "3 jam lalu" di feed, notifikasi, dan riwayat aktivitas. Hampir tidak ada daftar berwaktu yang menampilkan timestamp mentah ke pengguna.',
    source: { category: 'frontend-basic', chapter: 'javascript-dari-nol' },
    brief: {
      situation:
        'Di bawah setiap komentar di sebuah forum ada keterangan waktu. Server mengirim waktu dalam format `"2026-09-17T07:00:00.000Z"`, yang sulit dibaca manusia. Pengguna lebih suka membaca "3 jam lalu" atau "baru saja". Tugasmu mengubah dua timestamp, yaitu waktu komentar dan waktu sekarang, menjadi teks seperti itu.',
      tasks: [
        'Buat fungsi bernama `waktuRelatif` yang menerima dua timestamp ISO, yaitu `waktu` dan `sekarang`.',
        'Selisih di bawah 60 detik menjadi `"baru saja"`.',
        'Di bawah 60 menit menjadi `"N menit lalu"`, dan di bawah 24 jam menjadi `"N jam lalu"`.',
        'Selebihnya menjadi `"N hari lalu"`. Semua angka N dibulatkan ke bawah.',
      ],
      pitfalls: [
        'Perhatikan batasnya. Tepat 60 detik sudah termasuk kategori menit, jadi hasilnya `"1 menit lalu"`, bukan `"baru saja"`. Pakai `<`, bukan `<=`.',
        'Semua angka dibulatkan ke BAWAH. 90 menit adalah `"1 jam lalu"`, bukan `"2 jam lalu"`.',
      ],
      terms: [
        {
          term: 'ISO 8601',
          meaning:
            'Standar internasional untuk menulis tanggal dan waktu, contohnya `"2026-09-17T10:00:00.000Z"`. Huruf `T` memisahkan tanggal dan jam, sedangkan `Z` berarti zona waktu UTC. Hampir semua API memakai format ini karena bisa dibaca mesin tanpa salah tafsir.',
        },
        {
          term: 'timestamp',
          meaning:
            'Penanda waktu sebuah kejadian, misalnya kapan komentar dibuat. Timestamp bisa ditulis sebagai teks ISO atau sebagai angka milidetik sejak 1 Januari 1970. `new Date(teks).getTime()` mengubah bentuk teks menjadi bentuk angka.',
        },
        {
          term: 'relative time',
          meaning:
            'Cara menampilkan waktu sebagai jarak dari sekarang, seperti "5 menit lalu", alih-alih tanggal lengkap. Cara ini lebih cepat dipahami untuk kejadian yang baru terjadi. Untuk kejadian lama, tanggal lengkap biasanya lebih berguna.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `waktuRelatif`.',
      'Semua angka dibulatkan ke bawah.',
      'Tepat di batas sudah masuk kategori berikutnya.',
    ],
    starter: `
      function waktuRelatif(waktu, sekarang) {
        // hasilnya "baru saja", "N menit lalu", "N jam lalu", atau "N hari lalu"
      }
    `,
    hints: [
      'Hitung dulu selisihnya dalam detik, lalu periksa dari satuan terkecil ke satuan terbesar.',
      'Memeriksa dari yang terkecil membuat setiap cabang berikutnya tidak perlu batas atas.',
      'Ada tiga ambang batas, yaitu 60 detik, 3600 detik, dan 86400 detik.',
    ],
    solution: {
      code: `
        function waktuRelatif(waktu, sekarang) {
          // Selisih dalam milidetik, dibagi 1000 menjadi detik, lalu dibulatkan ke bawah.
          const detik = Math.floor((new Date(sekarang).getTime() - new Date(waktu).getTime()) / 1000);

          // Periksa dari satuan terkecil. Tiap cabang cukup satu batas.
          if (detik < 60) return 'baru saja';
          if (detik < 3600) return \`\${Math.floor(detik / 60)} menit lalu\`;
          if (detik < 86400) return \`\${Math.floor(detik / 3600)} jam lalu\`;
          return \`\${Math.floor(detik / 86400)} hari lalu\`;
        }
      `,
      steps: [
        '`new Date(...).getTime()` mengubah kedua timestamp menjadi milidetik, lalu keduanya dikurangkan.',
        'Selisih itu dibagi `1000` menjadi detik, lalu `Math.floor` membulatkannya ke bawah.',
        'Kalau kurang dari 60 detik, hasilnya "baru saja".',
        'Kalau kurang dari 3600 detik atau satu jam, detiknya dibagi 60 dan dibulatkan ke bawah menjadi menit.',
        'Kalau kurang dari 86400 detik atau satu hari, dibagi 3600 menjadi jam. Selebihnya dibagi 86400 menjadi hari.',
      ],
      explanation:
        'Urutan pemeriksaannya dimulai dari satuan terkecil, dan itulah yang membuat setiap cabang hanya butuh satu batas. Kalau dibalik, setiap cabang harus menyebut batas bawah DAN batas atas, sehingga ada dua kali lebih banyak tempat untuk salah menaruh tanda `<`.',
    },
    alternativeSolutions: [
      `
        const waktuRelatif = (waktu, sekarang) => {
          const selisih = (Date.parse(sekarang) - Date.parse(waktu)) / 1000;
          const menit = Math.floor(selisih / 60);
          if (menit < 1) return 'baru saja';
          const jam = Math.floor(menit / 60);
          if (jam < 1) return menit + ' menit lalu';
          const hari = Math.floor(jam / 24);
          if (hari < 1) return jam + ' jam lalu';
          return hari + ' hari lalu';
        };
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function waktuRelatif(waktu, sekarang) {
            const detik = Math.floor((new Date(sekarang) - new Date(waktu)) / 1000);
            if (detik <= 60) return 'baru saja';
            if (detik < 3600) return Math.floor(detik / 60) + ' menit lalu';
            if (detik < 86400) return Math.floor(detik / 3600) + ' jam lalu';
            return Math.floor(detik / 86400) + ' hari lalu';
          }
        `,
        reason:
          'Memakai `<=` pada batas 60 detik, sehingga tepat satu menit masih disebut "baru saja".',
      },
      {
        code: `
          function waktuRelatif(waktu, sekarang) {
            const detik = Math.floor((new Date(sekarang) - new Date(waktu)) / 1000);
            if (detik < 60) return 'baru saja';
            return Math.round(detik / 60) + ' menit lalu';
          }
        `,
        reason:
          'Semua selisih di atas satu menit dilaporkan dalam menit, termasuk yang sudah berhari-hari.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `waktuRelatif`', '\\bwaktuRelatif\\b')],
      [
        nilai(
          'tiga-jam',
          'Selisih tiga jam',
          'waktuRelatif("2026-09-17T07:00:00.000Z", "2026-09-17T10:00:00.000Z")',
          '3 jam lalu',
          { visible: true },
        ),
        nilai(
          'baru-saja',
          'Selisih tiga puluh detik',
          'waktuRelatif("2026-09-17T09:59:30.000Z", "2026-09-17T10:00:00.000Z")',
          'baru saja',
          {},
        ),
        nilai(
          'tepat-semenit',
          'Tepat enam puluh detik sudah masuk kategori menit',
          'waktuRelatif("2026-09-17T09:59:00.000Z", "2026-09-17T10:00:00.000Z")',
          '1 menit lalu',
          {},
        ),
        nilai(
          'dua-hari',
          'Selisih dua hari',
          'waktuRelatif("2026-09-15T10:00:00.000Z", "2026-09-17T10:00:00.000Z")',
          '2 hari lalu',
          {},
        ),
        nilai(
          'dibulatkan-bawah',
          'Sembilan puluh menit dilaporkan satu jam',
          'waktuRelatif("2026-09-17T08:30:00.000Z", "2026-09-17T10:00:00.000Z")',
          '1 jam lalu',
          {},
        ),
      ],
    ),
  }),
];
