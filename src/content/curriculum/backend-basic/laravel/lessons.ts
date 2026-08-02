import { callout, checklist, code, compare, divider, h2, p, table } from '@/lib/content/builders';
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
    ],
  ),

  written(
    'composer-struktur',
    'Composer & Struktur Project Laravel',
    9,
    'Manajer paket PHP dan peta folder yang akan kamu tinggali.',
    [
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
    ],
  ),

  written(
    'siklus-request-laravel',
    'Siklus Request Laravel & Service Container',
    11,
    'Perjalanan permintaan di dalam framework, dan mesin yang menyatukannya.',
    [
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
    ],
  ),

  written(
    'routing-laravel',
    'Routing & Route Model Binding',
    10,
    'Memetakan URL, dan membiarkan Laravel mengambil datanya.',
    [
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
    ],
  ),

  written(
    'controller',
    'Controller & Resource Controller',
    10,
    'Tempat permintaan diterima dan jawabannya disusun.',
    [
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
    ],
  ),

  written(
    'eloquent-dasar',
    'Eloquent: model, CRUD, mass assignment',
    12,
    'ORM Laravel, beserta celah keamanan yang paling sering dibukanya.',
    [
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
    ],
  ),

  written(
    'relasi-eloquent',
    'Relasi Eloquent',
    12,
    'Menyatakan hubungan antar tabel, dan menghindari N+1.',
    [
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
    ],
  ),

  written(
    'form-request',
    'Validasi dengan Form Request',
    11,
    'Padanan Zod di Laravel — validasi dan otorisasi dalam satu kelas.',
    [
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
    ],
  ),

  written(
    'artisan-tinker',
    'Artisan & Tinker',
    9,
    'Perkakas baris perintah yang dipakai setiap hari.',
    [
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
    ],
  ),
];
