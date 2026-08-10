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
    11,
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
      callout(
        'tip',
        'PHPStan level 8 mendekati TypeScript strict',
        'Ia menemukan properti yang tidak ada, tipe yang tidak cocok, dan nilai `null` yang tidak diperiksa — sebelum kodenya dijalankan. Project PHP tanpa analisis statis kehilangan sebagian besar jaring pengaman yang kamu nikmati di TypeScript.',
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
    9,
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
    11,
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
            'Dua tingkat penjagaan. **Global** berjalan untuk setiap permintaan — CORS, batas ukuran body, trim string. **Rute** hanya untuk rute yang menyebutnya — `auth`, `throttle`. Persis pembagian `app.use()` versus middleware per rute di Express.',
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
    10,
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
        '`scopeBindings()` penting: tanpa itu, `/artikel/1/komentar/999` akan mengembalikan komentar 999 meski ia milik artikel lain. Dengan itu, Laravel memastikan komentar tersebut benar-benar anak dari artikel tersebut.',
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

      h2('Memeriksa rute yang benar-benar terdaftar'),
      code(
        'bash',
        `
        php artisan route:list
        php artisan route:list --path=catatan
        `,
      ),
      callout(
        'tip',
        'Pakai ini untuk mengaudit keamanan',
        'Jalankan `route:list` dan periksa kolom middleware-nya. Setiap rute yang seharusnya terlindungi tapi kolomnya kosong adalah endpoint terbuka. Ini cara tercepat menemukan rute yang lupa dimasukkan ke grup `auth`.',
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
    10,
    'Tempat permintaan diterima dan jawabannya disusun.',
    [
      terms(
        {
          term: 'controller',
          meaning:
            'Kelas tempat permintaan diterima dan jawabannya disusun. Sama seperti di Express: ia boleh tahu HTTP — status, header, bentuk respons — tapi tidak boleh memuat aturan bisnis maupun SQL mentah.',
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
    8,
    'Template engine Laravel — dan kapan kamu tidak membutuhkannya.',
    [
      p(
        'Blade menghasilkan HTML di server. Untuk API murni — yang menjadi fokus kategori ini — kamu tidak akan memakainya. Tapi kamu perlu mengenalinya, karena sebagian besar aplikasi Laravel di dunia nyata memakainya.',
      ),

      terms(
        {
          term: 'Blade',
          meaning:
            'Template engine Laravel yang menghasilkan **HTML di server**. Untuk API murni — fokus kategori ini — kamu tidak akan memakainya. Tapi kenali bentuknya: sebagian besar aplikasi Laravel di dunia nyata memakainya.',
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
      callout(
        'danger',
        '`{!! !!}` dengan data pengguna adalah XSS',
        'Kalau `$inputPengguna` berisi `<script>curiCookie()</script>`, skrip itu benar-benar berjalan di browser pengunjung. Ini persis sama dengan `dangerouslySetInnerHTML` di React. Pakai `{!! !!}` **hanya** untuk HTML yang kamu hasilkan sendiri, atau setelah disanitasi dengan pustaka seperti HTMLPurifier.',
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
    11,
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
            'Sekumpulan migration yang dijalankan bersamaan dalam satu `php artisan migrate`. `migrate:rollback` membatalkan **satu batch terakhir** — bukan satu berkas — dan itu sering mengejutkan kalau tidak diketahui.',
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
    12,
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
            'Eloquent mengembalikan **objek model**; query builder (`DB::table`) mengembalikan objek biasa. Yang kedua lebih cepat dan cocok untuk laporan besar — dengan harga: tidak ada relasi, cast, maupun event model.',
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
      callout(
        'tip',
        'ORM menyembunyikan query, bukan biayanya',
        'Satu baris Eloquent yang terlihat sederhana bisa menghasilkan query yang berat. Biasakan memeriksa SQL yang dihasilkan — terutama saat ada relasi yang terlibat, seperti di sub-bab berikutnya.',
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
    12,
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
            "Mengambil relasi **di depan** dengan `with('penulis')`. Query-nya jadi dua — satu untuk catatan, satu untuk semua penulisnya sekaligus — berapa pun jumlah barisnya. Ini obat langsung untuk N+1.",
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
    9,
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
            'Seeder untuk data **uji**. Data awal produksi yang sungguhan — daftar kategori, peran, pengaturan — lebih tepat lewat migration, karena ia berversi dan hanya berjalan sekali.',
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
      code(
        'bash',
        `
        php artisan db:seed
        php artisan migrate:fresh --seed     # bangun ulang dari nol
        `,
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
    11,
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
    11,
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
            'Keduanya menyembunyikan field, tapi berbeda arah. `$hidden` adalah **blocklist** — kolom baru otomatis terlihat. Resource adalah **allow-list** — kolom baru otomatis tersembunyi sampai kamu menyebutnya. Yang kedua yang benar untuk API.',
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

      h2('Kaitannya dengan Bab 3.9'),
      p(
        'Resource menyelesaikan masalah yang sama dengan aturan "jangan kirim hasil `SELECT *`" di Express — hanya dengan cara yang lebih terstruktur. Prinsipnya identik: **bentuk respons adalah kontrak yang kamu putuskan sadar**, bukan cerminan otomatis dari struktur tabel.',
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
    9,
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
    14,
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
          term: 'pertahanan berlapis',
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
