import { mesinJs, nilai, soal, wajib } from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * JavaScript — Intermediate: the glue every real frontend ends up writing.
 *
 * None of these is a language feature. They are the four utilities that appear, usually
 * half-finished, in the `utils/` folder of any project with a filterable table: turning filters
 * into a URL, reading them back, composing class names, and reshaping the server's validation
 * errors into something a form can display next to its fields.
 */

export const exercises: Exercise[] = [
  soal({
    slug: 'bangun-query-string',
    title: 'Bangun query string dari objek filter',
    topic: 'frontend-nyata',
    level: 'intermediate',
    realWorldUse:
      'Menyimpan keadaan filter tabel di URL, supaya halamannya bisa di-bookmark dan dibagikan, dan supaya tombol back di browser mengembalikan filter alih-alih mengosongkannya.',
    source: { category: 'frontend-basic', chapter: 'ajax-web-api' },
    brief: {
      situation:
        'Pengguna mengatur filter di halaman produk, misalnya mencari "kursi&meja", memilih halaman 2, dan membiarkan kategori kosong. Ia ingin mengirim tautan halaman itu ke temannya, lengkap dengan filternya. Supaya bisa, keadaan filter harus disimpan di URL dalam bentuk query string seperti `?cari=kursi%26meja&halaman=2`.',
      tasks: [
        'Buat fungsi bernama `bangunQueryString` yang menerima satu objek filter.',
        'Kembalikan string berisi pasangan `key=nilai` yang dipisahkan tanda `&`, tanpa tanda `?` di depan.',
        'Field yang nilainya `""`, `null`, atau `undefined` tidak ikut dimasukkan.',
        'Setiap nilai harus di-encode, supaya karakter khusus seperti `&` tidak merusak URL.',
      ],
      pitfalls: [
        'Angka `0` adalah nilai yang sah dan harus tetap ikut, misalnya `halaman=0` atau `diskon=0`. Memeriksa dengan `if (!nilai)` membuang angka `0`, dan itu bug klasik karena memeriksa kebenaran nilai alih-alih memeriksa kekosongan.',
        'Field kosong jangan ikut. URL seperti `?cari=&kategori=&halaman=1` jelek untuk dibagikan, dan sebagian backend memperlakukan string kosong berbeda dari "tidak dikirim sama sekali".',
        'Kata pencarian yang memuat `&` akan memotong query string menjadi dua parameter kalau dibiarkan mentah tanpa encode.',
      ],
      terms: [
        {
          term: 'query string',
          meaning:
            'Bagian URL setelah tanda tanya yang berisi pasangan key dan nilai. Pada `toko.id/produk?cari=kursi&halaman=2`, query string-nya adalah `cari=kursi&halaman=2`. Tanda `&` memisahkan setiap pasangan, dan tanda `=` memisahkan key dari nilainya.',
        },
        {
          term: 'URL encoding',
          meaning:
            'Mengubah karakter yang punya arti khusus di URL menjadi kode yang aman. Karakter `&` menjadi `%26`, dan spasi menjadi `%20` atau `+`. Tanpa encoding, kata "kursi&meja" dibaca browser sebagai dua parameter terpisah.',
        },
        {
          term: 'URLSearchParams',
          meaning:
            'Objek bawaan browser untuk membangun dan membaca query string. `params.set("cari", "kursi&meja")` menambahkan satu pasangan, lalu `params.toString()` menghasilkan `"cari=kursi%26meja"`. Ia meng-encode nilai secara otomatis.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `bangunQueryString`.',
      'Field bernilai `""`, `null`, atau `undefined` tidak ikut.',
      'Angka `0` tetap ikut.',
      'Nilainya di-encode.',
    ],
    starter: `
      function bangunQueryString(filter) {
        // { cari: 'kursi', kategori: '', halaman: 2 } menjadi 'cari=kursi&halaman=2'
      }
    `,
    hints: [
      'Saring dulu pasangan yang kosong, baru susun string-nya.',
      '`Object.entries()` memberi array berisi pasangan `[key, nilai]` yang bisa ditelusuri seperti array biasa.',
      '`URLSearchParams` sudah meng-encode sendiri, tapi ia memasukkan semua yang kamu berikan. Jadi penyaringan tetap tugasmu.',
    ],
    solution: {
      code: `
        function bangunQueryString(filter) {
          const params = new URLSearchParams();

          for (const [kunci, nilai] of Object.entries(filter)) {
            // Periksa TIGA nilai kosong secara eksplisit. Jangan pakai !nilai,
            // karena itu ikut membuang angka 0 yang sah.
            if (nilai === '' || nilai === null || nilai === undefined) continue;

            params.set(kunci, String(nilai)); // URLSearchParams meng-encode otomatis
          }

          return params.toString();
        }
      `,
      steps: [
        '`new URLSearchParams()` membuat objek `URLSearchParams` yang masih kosong, tempat query string akan disusun.',
        '`Object.entries(filter)` mengubah objek filter menjadi array pasangan `[key, nilai]` yang bisa ditelusuri dengan `for...of`.',
        'Pasangan yang nilainya `""`, `null`, atau `undefined` dilewati dengan `continue`. Angka `0` tidak termasuk ketiganya, jadi tetap diproses.',
        '`params.set(kunci, String(nilai))` menambahkan pasangan itu. Nilainya diubah ke string karena URL hanya berisi teks.',
        '`params.toString()` menghasilkan query string yang sudah di-encode, misalnya `"cari=kursi%26meja&halaman=2"`.',
      ],
      explanation:
        'Penyaringannya memeriksa tiga nilai secara eksplisit, bukan memakai `if (!nilai) continue`. Bentuk pendek itu juga membuang angka `0`, padahal `halaman=0` atau `diskon=0` adalah nilai yang sah. Bug seperti ini hanya muncul di satu kasus, dan karena itu bertahan lama.',
    },
    alternativeSolutions: [
      `
        function bangunQueryString(filter) {
          const isi = Object.entries(filter).filter(
            ([, nilai]) => nilai !== '' && nilai !== null && nilai !== undefined,
          );
          return new URLSearchParams(isi.map(([k, v]) => [k, String(v)])).toString();
        }
      `,
      `
        function bangunQueryString(filter) {
          const bagian = [];
          for (const kunci of Object.keys(filter)) {
            const nilai = filter[kunci];
            if (nilai === '' || nilai === null || nilai === undefined) continue;
            bagian.push(encodeURIComponent(kunci) + '=' + encodeURIComponent(String(nilai)));
          }
          return bagian.join('&');
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function bangunQueryString(filter) {
            const params = new URLSearchParams();
            for (const [kunci, nilai] of Object.entries(filter)) {
              if (!nilai) continue;
              params.set(kunci, String(nilai));
            }
            return params.toString();
          }
        `,
        reason: 'Memakai `!nilai`, sehingga angka `0` ikut terbuang padahal ia nilai yang sah.',
      },
      {
        code: `
          function bangunQueryString(filter) {
            return new URLSearchParams(filter).toString();
          }
        `,
        reason: 'Tidak menyaring apa pun, sehingga field kosong ikut menjadi `cari=&kategori=`.',
      },
      {
        code: `
          function bangunQueryString(filter) {
            const bagian = [];
            for (const [kunci, nilai] of Object.entries(filter)) {
              if (nilai === '' || nilai === null || nilai === undefined) continue;
              bagian.push(kunci + '=' + nilai);
            }
            return bagian.join('&');
          }
        `,
        reason:
          'Nilainya tidak di-encode, sehingga kata pencarian yang memuat `&` memotong query string.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `bangunQueryString`', '\\bbangunQueryString\\b')],
      [
        nilai(
          'saring-kosong',
          'Field kosong dibuang dan nilainya di-encode',
          "bangunQueryString({ cari: 'kursi&meja', kategori: '', halaman: 2 })",
          'cari=kursi%26meja&halaman=2',
          { visible: true },
        ),
        nilai(
          'semua-kosong',
          'Semua field kosong',
          "bangunQueryString({ a: '', b: null })",
          '',
          {},
        ),
        nilai('objek-kosong', 'Objek kosong', 'bangunQueryString({})', '', {}),
        nilai(
          'angka-nol-ikut',
          'Angka 0 tetap ikut karena ia nilai yang sah',
          'bangunQueryString({ halaman: 0, diskon: 0 })',
          'halaman=0&diskon=0',
          {},
        ),
        nilai(
          'undefined-dibuang',
          'Nilai undefined dibuang',
          "bangunQueryString({ a: 'x', b: undefined })",
          'a=x',
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'urai-query-string',
    title: 'Baca kembali filter dari query string',
    topic: 'frontend-nyata',
    level: 'intermediate',
    realWorldUse:
      'Pasangan dari soal sebelumnya. Saat halaman dibuka dari URL yang dibagikan, filternya harus dipulihkan dari alamat itu. Kalau tidak, tautan yang dibagikan malah membuka tabel kosong.',
    source: { category: 'frontend-basic', chapter: 'ajax-web-api' },
    brief: {
      situation:
        'Temanmu membuka tautan `toko.id/produk?cari=kursi%26meja&halaman=2` yang kamu kirim. Halaman produk harus langsung menampilkan hasil pencarian "kursi&meja" di halaman 2, bukan halaman awal yang kosong. Artinya, saat halaman dimuat, query string di URL harus dibaca kembali menjadi objek filter.',
      tasks: [
        'Buat fungsi bernama `uraiQueryString` yang menerima satu string query string.',
        'Kembalikan objek biasa berisi setiap pasangan key dan nilai.',
        'String boleh diawali tanda `?` atau tidak, dan keduanya harus bekerja.',
        'Nilai yang ter-encode harus dikembalikan ke bentuk aslinya, misalnya `%26` kembali menjadi `&`.',
      ],
      pitfalls: [
        '`window.location.search` menyertakan tanda `?` di depan, sementara string yang kamu susun sendiri biasanya tidak. Fungsi yang hanya menerima salah satunya akan gagal di separuh tempat yang memanggilnya.',
        'Nilai bisa memuat tanda `=`, misalnya token base64 seperti `YWJjPT0=`. Memecah dengan `split("=")` memotong nilai itu, jadi jangan menguraikan secara manual.',
        'Semua nilai hasilnya berupa string. `halaman=2` menjadi `"2"`, bukan angka `2`, dan itu memang perilaku yang benar.',
      ],
      terms: [
        {
          term: 'URL decoding',
          meaning:
            'Kebalikan dari encoding, yaitu mengubah kode seperti `%26` kembali menjadi karakter aslinya, `&`. Fungsi bawaannya `decodeURIComponent("%26")`. `URLSearchParams` melakukan decoding ini otomatis saat membaca query string.',
        },
        {
          term: 'window.location.search',
          meaning:
            'Properti browser yang berisi query string dari URL halaman saat ini, lengkap dengan tanda `?`. Kalau URL-nya `toko.id/produk?cari=kursi`, nilainya `"?cari=kursi"`. Kalau tidak ada query string, nilainya string kosong.',
        },
        {
          term: 'Object.fromEntries()',
          meaning:
            'Fungsi bawaan yang membuat objek dari apa pun yang berisi pasangan `[key, nilai]`, termasuk `URLSearchParams`. `Object.fromEntries(new URLSearchParams("a=1"))` menghasilkan `{ a: "1" }` dalam satu baris.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `uraiQueryString`.',
      'Menerima string dengan maupun tanpa `?` di depan.',
      'Nilainya di-decode.',
    ],
    starter: `
      function uraiQueryString(qs) {
        // '?cari=kursi&halaman=2' menjadi { cari: 'kursi', halaman: '2' }
      }
    `,
    hints: [
      '`URLSearchParams` sudah menangani tanda `?` di depan dan decoding sekaligus.',
      '`Object.fromEntries()` menerima apa pun yang berisi pasangan, termasuk `URLSearchParams`.',
      'Bentuknya `Object.fromEntries(new URLSearchParams(qs))`.',
    ],
    solution: {
      code: `
        function uraiQueryString(qs) {
          // URLSearchParams membuang "?" di depan, memisahkan pasangan, dan men-decode nilai.
          // Object.fromEntries mengubah hasilnya menjadi objek biasa.
          return Object.fromEntries(new URLSearchParams(qs));
        }
      `,
      steps: [
        '`new URLSearchParams(qs)` membaca query string. Tanda `?` di depan dibuang otomatis kalau ada.',
        'Ia memisahkan setiap pasangan di tanda `&`, lalu memisahkan key dari nilai di tanda `=` yang PERTAMA saja. Karena itu nilai yang memuat `=` tetap utuh.',
        'Setiap nilai di-decode, sehingga `%26` kembali menjadi `&`.',
        '`Object.fromEntries(...)` menelusuri semua pasangan itu dan menjadikannya objek biasa.',
      ],
      explanation:
        'Satu baris ini sudah menangani tiga hal, yaitu tanda `?` di depan, decoding, dan pemisahan pasangan. Menulisnya sendiri dengan `split("&")` lalu `split("=")` terlihat sederhana, sampai bertemu nilai yang memuat `=` di dalamnya. Itu terjadi setiap kali ada token base64 di URL.',
    },
    alternativeSolutions: [
      `
        function uraiQueryString(qs) {
          const hasil = {};
          const params = new URLSearchParams(qs.startsWith('?') ? qs.slice(1) : qs);
          for (const [kunci, nilai] of params) {
            hasil[kunci] = nilai;
          }
          return hasil;
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function uraiQueryString(qs) {
            const hasil = {};
            for (const bagian of qs.split('&')) {
              const [kunci, nilai] = bagian.split('=');
              hasil[kunci] = nilai;
            }
            return hasil;
          }
        `,
        reason:
          'Tidak membuang tanda `?` di depan, tidak men-decode nilai, dan memotong nilai yang memuat `=`.',
      },
      {
        code: `
          function uraiQueryString(qs) {
            return Object.fromEntries(new URLSearchParams(qs.slice(1)));
          }
        `,
        reason:
          'Selalu membuang karakter pertama, sehingga string tanpa `?` kehilangan huruf awalnya.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `uraiQueryString`', '\\buraiQueryString\\b')],
      [
        nilai(
          'dengan-tanda-tanya',
          'Query string lengkap dengan tanda tanya',
          "uraiQueryString('?cari=kursi&halaman=2')",
          { cari: 'kursi', halaman: '2' },
          { visible: true },
        ),
        nilai(
          'tanpa-tanda-tanya',
          'Tanpa tanda tanya di depan',
          "uraiQueryString('cari=kursi')",
          { cari: 'kursi' },
          {},
        ),
        nilai('kosong', 'String kosong', "uraiQueryString('')", {}, {}),
        nilai(
          'nilai-terencode',
          'Nilai yang ter-encode dikembalikan ke bentuk aslinya',
          "uraiQueryString('cari=kursi%26meja')",
          { cari: 'kursi&meja' },
          {},
        ),
        nilai(
          'nilai-berisi-samadengan',
          'Nilai yang memuat tanda sama dengan tetap utuh',
          "uraiQueryString('token=YWJjPT0=')",
          { token: 'YWJjPT0=' },
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'gabung-kelas-bersyarat',
    title: 'Gabungkan className bersyarat',
    topic: 'frontend-nyata',
    level: 'basic',
    realWorldUse:
      'Utility `cn` yang ada di hampir setiap project berbasis utility class. Tanpa utility ini, JSX penuh template literal yang meninggalkan spasi ganda, bahkan tulisan `false` yang ikut tercetak sebagai class.',
    source: { category: 'frontend-intermediate', chapter: 'tailwind-css' },
    brief: {
      situation:
        'Sebuah tombol punya class dasar `btn`, dan class `btn-aktif` hanya dipakai kalau tombolnya sedang aktif. Kalau kamu menulis `"btn " + (aktif && "btn-aktif")`, saat tombol tidak aktif hasilnya menjadi `"btn false"`, dan tulisan `false` ikut menjadi nama class. Karena itu hampir setiap project punya fungsi kecil untuk menggabungkan class secara bersyarat.',
      tasks: [
        'Buat fungsi bernama `gabungKelas` yang menerima jumlah argumen berapa pun.',
        'Gabungkan hanya argumen yang berupa string dan tidak kosong, dipisahkan satu spasi.',
        'Argumen bernilai `false`, `null`, `undefined`, `""`, dan yang bukan string dibuang.',
        'Contohnya `gabungKelas("btn", false, "btn-primary")` menghasilkan `"btn btn-primary"`.',
      ],
      pitfalls: [
        'Memeriksa kebenaran nilai saja dengan `filter(Boolean)` tidak cukup. Angka yang bernilai benar seperti `1` ikut lolos dan berakhir menjadi class seperti `class="btn 1"`.',
        'Hasilnya tidak boleh punya spasi ganda maupun spasi di ujung. Class yang kotor memang tetap berfungsi, tapi membuat snapshot test dan pembacaan di devtools jadi menyebalkan.',
      ],
      terms: [
        {
          term: 'className',
          meaning:
            'Nama atribut di JSX untuk menentukan class CSS sebuah elemen. Di HTML biasa namanya `class`, tapi di JSX harus `className` karena `class` adalah kata khusus di JavaScript. Contohnya `<button className="btn btn-primary">`.',
        },
        {
          term: 'rest parameter (...)',
          meaning:
            'Tiga titik di daftar parameter yang mengumpulkan semua argumen menjadi satu array. `function f(...isi)` yang dipanggil `f(1, 2, 3)` membuat `isi` bernilai `[1, 2, 3]`. Ini yang membuat `gabungKelas` bisa menerima argumen sebanyak apa pun.',
        },
        {
          term: 'typeof',
          meaning:
            'Operator untuk mengetahui tipe sebuah nilai, dan hasilnya berupa string. `typeof "btn"` bernilai `"string"`, sedangkan `typeof 1` bernilai `"number"`. Di soal ini `typeof satu === "string"` dipakai untuk memastikan hanya teks yang lolos.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `gabungKelas`.',
      'Argumen yang bukan string, atau string kosong, dibuang.',
      'Tanpa spasi ganda dan tanpa spasi di ujung.',
    ],
    starter: `
      function gabungKelas(...kelas) {
        // gabungKelas('btn', false, 'btn-primary') menjadi 'btn btn-primary'
      }
    `,
    hints: [
      'Jumlah argumennya bervariasi, dan rest parameter mengumpulkannya menjadi array.',
      'Saring dulu yang tidak diinginkan, baru sambung dengan spasi.',
      'Periksa tipenya dengan `typeof`, jangan hanya memeriksa kebenaran nilainya.',
    ],
    solution: {
      code: `
        function gabungKelas(...kelas) {
          // Hanya string yang isinya bukan spasi saja yang boleh lolos.
          // Memeriksa tipe mencegah angka seperti 1 ikut menjadi class.
          return kelas.filter((satu) => typeof satu === 'string' && satu.trim() !== '').join(' ');
        }
      `,
      steps: [
        '`...kelas` mengumpulkan semua argumen menjadi array, misalnya `["btn", false, "btn-primary"]`.',
        '`.filter(...)` hanya menyimpan elemen yang tipenya string dan isinya tidak kosong setelah di-`trim()`.',
        '`false`, `null`, `undefined`, angka, dan string kosong tidak lolos pemeriksaan itu.',
        '`.join(" ")` menyambung elemen yang tersisa dengan satu spasi. Karena elemen kosong sudah dibuang, tidak ada spasi ganda.',
      ],
      explanation:
        'Penyaringnya memeriksa tipe, bukan hanya kebenaran nilai. `filter(Boolean)` saja akan meloloskan angka dan objek yang bernilai benar, dan keduanya berakhir menjadi class aneh seperti `class="btn 1"`. Class seperti itu tidak memunculkan error dan tidak terlihat, hanya membingungkan orang berikutnya yang membuka devtools.',
    },
    alternativeSolutions: [
      `
        function gabungKelas(...kelas) {
          const dipakai = [];
          for (const satu of kelas) {
            if (typeof satu === 'string' && satu.length > 0 && satu.trim().length > 0) {
              dipakai.push(satu);
            }
          }
          return dipakai.join(' ');
        }
      `,
      `
        const gabungKelas = (...kelas) =>
          kelas
            .filter((satu) => typeof satu === 'string')
            .map((satu) => satu.trim())
            .filter((satu) => satu !== '')
            .join(' ');
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function gabungKelas(...kelas) {
            return kelas.join(' ');
          }
        `,
        reason:
          'Tidak menyaring apa pun, sehingga `false` dan `undefined` ikut tercetak sebagai nama class.',
      },
      {
        code: `
          function gabungKelas(...kelas) {
            return kelas.filter(Boolean).join(' ');
          }
        `,
        reason:
          'Angka yang bernilai benar ikut lolos dan berakhir menjadi class seperti `class="btn 1"`.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `gabungKelas`', '\\bgabungKelas\\b')],
      [
        nilai(
          'bersyarat',
          'Sebagian argumen bernilai false',
          "gabungKelas('btn', false, 'btn-primary')",
          'btn btn-primary',
          { visible: true },
        ),
        nilai('tanpa-argumen', 'Tanpa argumen sama sekali', 'gabungKelas()', '', {}),
        nilai('semua-falsy', 'Semua argumen kosong', 'gabungKelas(false, null, undefined)', '', {}),
        nilai(
          'string-kosong',
          'String kosong dibuang',
          "gabungKelas('btn', '', 'aktif')",
          'btn aktif',
          {},
        ),
        nilai(
          'bukan-string',
          'Angka tidak ikut menjadi class',
          "gabungKelas('btn', 1, 'aktif')",
          'btn aktif',
          {},
        ),
      ],
    ),
  }),

  soal({
    slug: 'kelompok-error-validasi',
    title: 'Kelompokkan error validasi per field',
    topic: 'frontend-nyata',
    level: 'intermediate',
    realWorldUse:
      'Mengubah daftar error dari server menjadi bentuk yang bisa ditempelkan di bawah setiap input. Selama bentuknya masih daftar datar, form hanya bisa menampilkan satu pesan umum di bagian atas.',
    source: { category: 'frontend-basic', chapter: 'ajax-web-api' },
    brief: {
      situation:
        'Pengguna mengirim form pendaftaran, lalu server menolaknya dan mengirim daftar error, misalnya email formatnya salah, email sudah dipakai, dan nama wajib diisi. Supaya setiap pesan bisa ditampilkan tepat di bawah input yang bermasalah, daftar datar itu harus dikelompokkan per nama field terlebih dahulu.',
      tasks: [
        'Buat fungsi bernama `kelompokError` yang menerima array error berbentuk `{ field, pesan }`.',
        'Kembalikan objek dengan nama field sebagai key dan array pesan sebagai nilainya.',
        'Satu field bisa punya lebih dari satu pesan, dan semuanya disimpan.',
        'Contohnya dua error untuk `email` dan satu untuk `nama` menghasilkan `{ email: [a, b], nama: [c] }`.',
      ],
      pitfalls: [
        'Nilainya selalu array, bahkan kalau field itu hanya punya satu pesan. Bentuk yang seragam membuat komponen form cukup menulis satu `.map()` saja tanpa perlu memeriksa tipenya.',
        'Jangan menimpa pesan lama dengan pesan baru. Field yang punya dua masalah harus menampilkan keduanya.',
        'Field yang tidak punya error sama sekali tidak boleh muncul sebagai key. Key yang berisi array kosong membuat komponen form mengira ada error yang harus ditampilkan.',
      ],
      terms: [
        {
          term: 'validation error',
          meaning:
            'Pesan dari server yang menjelaskan kenapa data yang dikirim ditolak, misalnya format email salah. Biasanya dikirim bersama status HTTP `400` atau `422`. Setiap error menyebut field mana yang bermasalah, supaya frontend bisa menandainya.',
        },
        {
          term: '??= (nullish assignment)',
          meaning:
            'Operator yang mengisi sebuah variabel hanya kalau nilainya masih `null` atau `undefined`. `hasil.email ??= []` berarti "kalau `hasil.email` belum ada, isi dengan array kosong". Kalau sudah ada, nilainya tidak diubah.',
        },
        {
          term: 'push()',
          meaning:
            'Method array yang menambahkan elemen di ujung belakang. `const a = [1]; a.push(2);` membuat `a` menjadi `[1, 2]`. Berbeda dengan `map()` dan `filter()`, method `push()` mengubah array aslinya.',
        },
      ],
    },
    rules: [
      'Wajib membuat fungsi bernama `kelompokError`.',
      'Nilainya berupa array pesan, walau hanya ada satu pesan.',
      'Field tanpa error tidak muncul sebagai key.',
    ],
    starter: `
      function kelompokError(daftar) {
        // [{ field: 'email', pesan: 'a' }] menjadi { email: ['a'] }
      }
    `,
    hints: [
      'Bentuknya sama dengan soal pengelompokan sebelumnya, hanya yang dikumpulkan berupa array, bukan angka.',
      'Siapkan array kosong saat sebuah field pertama kali muncul.',
      '`(hasil[e.field] ??= []).push(e.pesan)` melakukan keduanya sekaligus.',
    ],
    solution: {
      code: `
        function kelompokError(daftar) {
          const hasil = {};

          for (const error of daftar) {
            // Field yang baru pertama muncul belum punya array, jadi siapkan dulu.
            if (!hasil[error.field]) hasil[error.field] = [];

            // Tambahkan pesannya. Pesan lama tidak ditimpa.
            hasil[error.field].push(error.pesan);
          }

          return hasil;
        }
      `,
      steps: [
        '`hasil` dimulai sebagai objek kosong.',
        'Untuk setiap error, periksa apakah `hasil[error.field]` sudah ada.',
        'Kalau belum ada, siapkan array kosong untuk field itu.',
        '`push(error.pesan)` menambahkan pesan ke array field tersebut, sehingga pesan kedua dan seterusnya ikut tersimpan.',
        'Field yang tidak pernah muncul di daftar error tidak pernah dibuatkan key.',
      ],
      explanation:
        'Nilainya selalu array, bahkan untuk field yang hanya punya satu pesan. Bentuk yang seragam itulah yang membuat komponen form cukup menulis satu loop. Kalau kadang berupa string dan kadang berupa array, setiap tempat yang membacanya harus memeriksa tipenya lebih dulu.',
    },
    alternativeSolutions: [
      `
        function kelompokError(daftar) {
          return daftar.reduce((hasil, error) => {
            (hasil[error.field] ??= []).push(error.pesan);
            return hasil;
          }, {});
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          function kelompokError(daftar) {
            const hasil = {};
            for (const error of daftar) {
              hasil[error.field] = error.pesan;
            }
            return hasil;
          }
        `,
        reason:
          'Menimpa pesan lama, sehingga field dengan dua pesan hanya menyisakan yang terakhir, dan nilainya bukan array.',
      },
      {
        code: `
          function kelompokError(daftar) {
            const hasil = {};
            for (const error of daftar) {
              hasil[error.field] = [error.pesan];
            }
            return hasil;
          }
        `,
        reason: 'Bentuknya sudah array, tapi tetap menimpa, sehingga pesan pertama hilang.',
      },
    ],
    check: mesinJs(
      [wajib('ada-fungsi', 'Ada fungsi bernama `kelompokError`', '\\bkelompokError\\b')],
      [
        nilai(
          'dua-field',
          'Dua field, salah satunya punya dua pesan',
          "kelompokError([{ field: 'email', pesan: 'Format salah' }, { field: 'email', pesan: 'Sudah dipakai' }, { field: 'nama', pesan: 'Wajib diisi' }])",
          { email: ['Format salah', 'Sudah dipakai'], nama: ['Wajib diisi'] },
          { visible: true },
        ),
        nilai('kosong', 'Tidak ada error', 'kelompokError([])', {}, {}),
        nilai(
          'satu-pesan-tetap-array',
          'Satu pesan tetap dibungkus array',
          "kelompokError([{ field: 'nama', pesan: 'Wajib diisi' }])",
          { nama: ['Wajib diisi'] },
          {},
        ),
        nilai(
          'tanpa-kunci-kosong',
          'Tidak ada key untuk field yang tidak punya error',
          "Object.keys(kelompokError([{ field: 'nama', pesan: 'x' }]))",
          ['nama'],
          {},
        ),
      ],
    ),
  }),
];
