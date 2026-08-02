import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  ol,
  p,
  steps,
  table,
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Backend Intermediate — Chapter 3, all thirteen lessons.
 *
 * The Laravel mirror of chapter 2. Deliberately parallel: the same problems in the same order, so
 * the reader can see which decisions belong to the framework and which belong to the problem.
 *
 * Laravel 12 / PHP 8.3 / Pest 3 throughout.
 */
export const lessons: LessonDraft[] = [
  written(
    'service-repository',
    'Service Layer & Repository di Laravel',
    11,
    'Menarik aturan bisnis keluar dari controller — dan tahu kapan berhenti.',
    [
      p(
        'Laravel tidak menyediakan folder `Services` maupun `Repositories`. Keduanya kamu buat sendiri saat memang dibutuhkan — dan sebagian besar aplikasi Laravel tidak membutuhkan keduanya sekaligus.',
      ),

      h2('Kapan service layer berbayar'),
      compare(
        {
          title: 'Belum perlu',
          lang: 'php',
          code: `
          public function store(SimpanArtikelRequest $r)
          {
              $artikel = $r->user()->artikel()
                  ->create($r->validated());

              return new ArtikelResource($artikel);
          }
          `,
          notes: ['Satu operasi, tanpa aturan tambahan', 'Service hanya akan meneruskan'],
        },
        {
          title: 'Sudah perlu',
          lang: 'php',
          code: `
          public function store(
              SimpanArtikelRequest $r,
              LayananArtikel $layanan,
          ) {
              $artikel = $layanan->buat(
                  $r->user(),
                  $r->validated(),
              );

              return new ArtikelResource($artikel);
          }
          `,
          notes: [
            'Slug, tag, notifikasi, kuota — beberapa langkah',
            'Dipakai juga dari perintah artisan',
          ],
        },
      ),

      h2('Service'),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);

        namespace App\\Services;

        use App\\Models\\Artikel;
        use App\\Models\\User;
        use Illuminate\\Support\\Facades\\DB;
        use Illuminate\\Support\\Str;

        final class LayananArtikel
        {
            public function __construct(
                private readonly PembuatSlug $slug,
            ) {}

            /**
             * @param array{judul: string, isi: string, tag?: list<string>} $data
             */
            public function buat(User $penulis, array $data): Artikel
            {
                return DB::transaction(function () use ($penulis, $data) {
                    $artikel = $penulis->artikel()->create([
                        'judul' => $data['judul'],
                        'isi' => $data['isi'],
                        'slug' => $this->slug->unikUntuk($data['judul']),
                        'status' => 'draf',
                    ]);

                    if (isset($data['tag'])) {
                        $artikel->tag()->sync($this->tagIdDari($data['tag']));
                    }

                    return $artikel;
                });
            }
        }
        `,
        { filename: 'app/Services/LayananArtikel.php' },
      ),
      callout(
        'danger',
        'Service tidak boleh menyentuh `Request` atau `Response`',
        'Begitu ia menerima `Request`, ia terikat pada HTTP dan tidak bisa dipanggil dari perintah artisan, job antrean, atau tes tanpa memalsukan objek permintaan. Oper **array atau DTO** yang sudah divalidasi, bukan objek `Request`-nya.',
      ),

      h2('Repository — sering tidak diperlukan'),
      p(
        'Eloquent **sudah** lapisan akses data. Membungkusnya dengan repository sering menambah berkas tanpa menambah kemampuan.',
      ),
      table(
        ['Repository berbayar kalau', 'Tidak berbayar kalau'],
        [
          ['Sumber datanya bisa berganti (DB → API eksternal)', 'Hanya membungkus `Model::find()`'],
          ['Query rumit yang berulang di banyak tempat', 'Setiap method dipakai satu kali'],
          [
            'Perlu mengganti implementasinya di tes',
            'Tes memakai database sungguhan (yang biasanya lebih baik)',
          ],
        ],
      ),
      code(
        'php',
        `
        // Alternatif yang lebih ringan: query scope di model.
        // Ia memberi nama pada query berulang tanpa lapisan baru.
        public function scopeMilik(Builder $q, User $user): Builder
        {
            return $q->where('penulis_id', $user->id);
        }

        public function scopeTerbit(Builder $q): Builder
        {
            return $q->where('status', 'terbit')->whereNotNull('terbit_pada');
        }

        // Artikel::milik($user)->terbit()->paginate(20);
        `,
      ),
      callout(
        'tip',
        'Uji penghapusan',
        'Untuk setiap lapisan, tanyakan: *kalau dihapus, apakah kerumitannya hilang atau justru pindah ke pemanggil?* Lapisan yang hanya meneruskan panggilan belum layak ada. Tambahkan saat ada aturan yang benar-benar perlu diserap.',
      ),

      h2('Action class — alternatif yang sering lebih pas'),
      code(
        'php',
        `
        // Satu kelas, satu operasi. Lebih kecil dari service,
        // dan batasnya lebih jelas.
        final class TerbitkanArtikel
        {
            public function __invoke(Artikel $artikel): Artikel
            {
                if ($artikel->status !== 'draf') {
                    throw new KonflikStatus('Hanya draf yang bisa diterbitkan');
                }

                $artikel->update(['status' => 'terbit', 'terbit_pada' => now()]);
                event(new ArtikelDiterbitkan($artikel));

                return $artikel;
            }
        }
        `,
      ),
      p(
        'Untuk Laravel, action class sering pilihan yang lebih baik daripada service besar: ia tidak tumbuh menjadi kelas berisi dua puluh method yang tidak berhubungan.',
      ),
    ],
  ),

  written(
    'eloquent-lanjutan',
    'Eloquent Lanjutan: scope, accessor, casts',
    12,
    'Memindahkan aturan berulang ke tempat yang tidak bisa dilupakan.',
    [
      h2('Casts'),
      code(
        'php',
        `
        protected function casts(): array
        {
            return [
                'diarsipkan' => 'boolean',
                'terbit_pada' => 'datetime',
                'meta' => 'array',                      // JSON <-> array PHP
                'status' => StatusArtikel::class,       // enum PHP
                'password' => 'hashed',                 // hash otomatis saat diisi
                'nomor_ktp' => 'encrypted',             // terenkripsi di database
                'harga' => 'decimal:2',
            ];
        }
        `,
      ),
      callout(
        'tip',
        '`encrypted` untuk data sensitif yang perlu dibaca kembali',
        'Berbeda dari `hashed` yang satu arah, `encrypted` bisa didekripsi — cocok untuk nomor identitas, token pihak ketiga, atau alamat yang wajib disimpan. Kuncinya `APP_KEY`, jadi kehilangan kunci itu berarti kehilangan datanya. Untuk password, tetap `hashed`.',
      ),

      h2('Casts kustom'),
      code(
        'php',
        `
        final class UangCast implements CastsAttributes
        {
            public function get($model, string $key, $value, array $attributes): Uang
            {
                return new Uang((int) $value);
            }

            public function set($model, string $key, $value, array $attributes): array
            {
                if (! $value instanceof Uang) {
                    throw new InvalidArgumentException('Nilai harus objek Uang');
                }

                // Disimpan sebagai integer dalam satuan terkecil — bukan float.
                return [$key => $value->jumlah];
            }
        }
        `,
      ),

      h2('Accessor & mutator'),
      code(
        'php',
        `
        use Illuminate\\Database\\Eloquent\\Casts\\Attribute;

        protected function namaLengkap(): Attribute
        {
            return Attribute::make(
                get: fn (mixed $value, array $attributes) =>
                    trim($attributes['nama_depan'] . ' ' . $attributes['nama_belakang']),
            );
        }

        protected function judul(): Attribute
        {
            return Attribute::make(
                set: fn (string $value) => trim($value),
            );
        }
        `,
      ),
      callout(
        'warning',
        'Accessor tidak bisa dipakai di `WHERE`',
        "`namaLengkap` dihitung di PHP setelah baris diambil, jadi `where('nama_lengkap', ...)` akan gagal — kolomnya tidak ada di database. Untuk pencarian, tambahkan kolom sungguhan (generated column) atau cari di kedua kolom aslinya.",
      ),

      h2('Query scope'),
      code(
        'php',
        `
        public function scopeTerbit(Builder $q): Builder
        {
            return $q->where('status', 'terbit')->whereNotNull('terbit_pada');
        }

        public function scopeMilik(Builder $q, User $user): Builder
        {
            return $q->where('penulis_id', $user->id);
        }

        public function scopeCari(Builder $q, ?string $kata): Builder
        {
            // Scope harus tetap aman saat argumennya kosong.
            if ($kata === null || trim($kata) === '') return $q;

            return $q->where(fn ($sub) => $sub
                ->where('judul', 'ILIKE', '%' . $kata . '%')
                ->orWhere('isi', 'ILIKE', '%' . $kata . '%'));
        }
        `,
      ),
      callout(
        'danger',
        'Perhatikan closure pada `orWhere`',
        'Tanpa `where(fn ($sub) => ...)`, kondisi `orWhere` akan **membatalkan** semua syarat sebelumnya. `->milik($user)->cari($kata)` tanpa pengelompokan itu akan mengembalikan artikel milik siapa pun yang judulnya cocok — kebocoran data yang tidak menimbulkan error apa pun.',
      ),

      h2('Global scope'),
      code(
        'php',
        `
        // Berlaku untuk SETIAP query pada model ini
        protected static function booted(): void
        {
            static::addGlobalScope('milikTenant', function (Builder $q) {
                if (auth()->check()) {
                    $q->where('tenant_id', auth()->user()->tenant_id);
                }
            });
        }
        `,
      ),
      callout(
        'warning',
        'Global scope kuat sekaligus berbahaya',
        'Ia mudah dilewati dengan `withoutGlobalScope()`, dan ia tidak berlaku pada query builder mentah (`DB::table(...)`) maupun pada raw SQL. Untuk pemisahan tenant, ia adalah **lapisan tambahan**, bukan penjagaan utama — penjagaan utamanya tetap syarat eksplisit di query.',
      ),

      h2('Hindari bocornya kolom'),
      code(
        'php',
        `
        protected $hidden = ['password', 'remember_token', 'nomor_ktp'];

        // Lebih aman lagi: jangan pernah mengembalikan model mentah.
        // Pakai API Resource, yang menyebut field satu per satu.
        `,
      ),
      p(
        '`$hidden` adalah jaring pengaman, bukan rencana utama. Kolom baru yang ditambahkan bulan depan tidak akan otomatis masuk ke daftar itu — sementara API Resource memaksamu menyebut setiap field secara sadar.',
      ),
    ],
  ),

  written(
    'n-plus-one',
    'Masalah N+1 & Eager Loading',
    11,
    'Bug performa yang paling sering, dan cara membuatnya mustahil kembali.',
    [
      p(
        'N+1 sudah diperkenalkan di Backend Basic 4.9. Sub-bab ini tentang **menemukannya secara otomatis** dan menangani kasus-kasus yang lebih rumit.',
      ),

      h2('Deteksi otomatis'),
      code(
        'php',
        `
        // app/Providers/AppServiceProvider.php
        public function boot(): void
        {
            // Di luar produksi, lazy loading MELEMPAR error.
            Model::preventLazyLoading(! $this->app->isProduction());

            // Melempar kalau ada atribut yang diisi tapi tidak fillable
            Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());

            // Melempar kalau mengakses atribut yang tidak ikut di-select
            Model::preventAccessingMissingAttributes(! $this->app->isProduction());
        }
        `,
      ),
      callout(
        'tip',
        'Tiga baris ini mengubah tiga kelas bug diam menjadi error saat pengembangan',
        'Ketiganya punya sifat yang sama: tidak menimbulkan error, tidak terlihat saat membaca kode, dan baru terasa jauh kemudian. `preventAccessingMissingAttributes` khususnya menangkap bug halus — atribut yang tidak di-`select` mengembalikan `null`, dan `null` itu diperlakukan sebagai nilai yang sah.',
      ),

      h2('Eager loading bersyarat'),
      code(
        'php',
        `
        // Muat relasi hanya bila diminta klien
        $artikel = Artikel::query()
            ->terbit()
            ->when($request->boolean('sertakan_penulis'), fn ($q) =>
                $q->with('penulis:id,name'))
            ->when($request->boolean('sertakan_komentar'), fn ($q) =>
                $q->withCount('komentar'))
            ->paginate(20);
        `,
      ),
      code(
        'php',
        `
        // Muat setelah query utama — misalnya setelah pengecekan otorisasi
        $artikel->load(['penulis:id,name', 'tag:id,nama']);

        // Muat hanya yang belum dimuat
        $artikel->loadMissing('penulis');
        `,
      ),

      h2('Relasi bersarang & terbatas'),
      code(
        'php',
        `
        // Bersarang
        Artikel::with('komentar.penulis:id,name')->get();

        // Dengan syarat dan batas
        Artikel::with([
            'komentar' => fn ($q) => $q
                ->where('disetujui', true)
                ->latest()
                ->limit(5),
        ])->get();

        // Hanya jumlahnya
        Artikel::withCount([
            'komentar',
            'komentar as komentar_disetujui_count' => fn ($q) => $q->where('disetujui', true),
        ])->get();
        `,
      ),
      callout(
        'warning',
        'Kolom kunci wajib ikut saat memilih kolom relasi',
        "`with('penulis:name')` tanpa `id` membuat Laravel tidak bisa mencocokkan hasilnya ke induknya — relasinya menjadi `null` tanpa error. Selalu `with('penulis:id,name')`.",
      ),

      h2('N+1 yang muncul dari lapisan respons'),
      code(
        'php',
        `
        // Di dalam API Resource
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
                'judul' => $this->judul,

                // BENAR: tidak memicu query kalau relasinya belum dimuat
                'penulis' => new PenggunaResource($this->whenLoaded('penulis')),
                'jumlahKomentar' => $this->whenCounted('komentar'),

                // SALAH: memicu satu query PER ITEM
                // 'penulis' => new PenggunaResource($this->penulis),
            ];
        }
        `,
      ),
      p(
        'Ini N+1 yang paling sulit ditemukan, karena controller-nya terlihat benar — masalahnya ada di kelas lain yang dijalankan saat menyusun respons.',
      ),

      h2('Memproses data besar'),
      code(
        'php',
        `
        // SALAH: memuat seluruh tabel ke memori
        foreach (Artikel::all() as $artikel) { ... }

        // BENAR: batch, memori tetap konstan
        Artikel::with('penulis')->chunkById(500, function ($batch) {
            foreach ($batch as $artikel) { ... }
        });

        // Atau lazy: satu per satu, tetap hemat memori
        foreach (Artikel::with('penulis')->lazyById(500) as $artikel) { ... }
        `,
      ),
      callout(
        'tip',
        'Pakai `chunkById`, bukan `chunk`',
        '`chunk` memakai `OFFSET`. Kalau baris dihapus atau ditambah selama pemrosesan, sebagian baris akan terlewat atau diproses dua kali. `chunkById` memakai kolom id sebagai penanda posisi, sehingga aman terhadap perubahan.',
      ),

      h2('Menegakkan lewat tes'),
      code(
        'php',
        `
        it('tidak menjalankan query per baris pada daftar artikel', function () {
            $penulis = User::factory()->create();
            Artikel::factory()->count(30)->create(['penulis_id' => $penulis->id]);

            DB::enableQueryLog();

            $this->actingAs($penulis)->getJson('/api/artikel')->assertOk();

            // Harus tetap kecil — tidak tumbuh mengikuti jumlah baris
            expect(count(DB::getQueryLog()))->toBeLessThan(6);
        });
        `,
      ),
    ],
  ),

  written(
    'sanctum',
    'API Auth dengan Sanctum',
    12,
    'Dua mode autentikasi, dan memilih yang tepat.',
    [
      p(
        'Sanctum menyediakan dua mekanisme yang sangat berbeda dalam satu paket. Memilih yang salah menghasilkan kombinasi yang tidak aman — atau yang tidak bekerja sama sekali.',
      ),

      h2('Dua mode'),
      table(
        ['', 'SPA (cookie sesi)', 'API token'],
        [
          ['Untuk', 'Frontend di domain yang sama/subdomain', 'Mobile, pihak ketiga, server lain'],
          ['Disimpan di', 'Cookie `HttpOnly`', 'Klien menyimpannya sendiri'],
          ['Rawan XSS', '**Tidak** (HttpOnly)', 'Ya, kalau di `localStorage`'],
          ['Rawan CSRF', 'Ya — perlu token CSRF', 'Tidak'],
          ['Pencabutan', 'Hapus sesi', 'Hapus baris token'],
        ],
      ),
      callout(
        'tip',
        'Kalau frontend dan backend satu domain, pilih mode SPA',
        'Cookie `HttpOnly` menutup jalur pencurian token lewat XSS sepenuhnya — sesuatu yang tidak bisa dilakukan token di `localStorage`. Harganya adalah perlindungan CSRF, yang sudah ditangani Laravel secara otomatis.',
      ),

      h2('Mode SPA'),
      code(
        'php',
        `
        // config/sanctum.php
        'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost:3000')),
        `,
      ),
      code(
        'php',
        `
        // Rute — pakai middleware sesi
        Route::middleware('auth:sanctum')->group(function () {
            Route::apiResource('artikel', ArtikelController::class);
        });
        `,
      ),
      code(
        'ts',
        `
        // Frontend: ambil cookie CSRF SEKALI sebelum permintaan pertama
        await fetch('https://api.contoh.com/sanctum/csrf-cookie', {
          credentials: 'include',
        });

        // Setiap permintaan berikutnya menyertakan cookie
        await fetch('https://api.contoh.com/api/artikel', {
          method: 'POST',
          credentials: 'include',        // WAJIB — tanpa ini cookie tidak terkirim
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        `,
      ),
      callout(
        'danger',
        'Mode SPA butuh domain yang sepupu',
        'Cookie tidak bisa dibagikan antar domain yang benar-benar berbeda. `app.contoh.com` dan `api.contoh.com` bisa (dengan `SESSION_DOMAIN=.contoh.com`); `app-saya.com` dan `api-lain.com` tidak. Kalau domainnya berbeda, kamu harus memakai mode token — bukan memaksa cookie dengan `SameSite=None`, yang membuka CSRF lintas situs.',
      ),

      h2('Mode token'),
      code(
        'php',
        `
        public function masuk(MasukRequest $request): JsonResponse
        {
            $kunciBatas = Str::lower($request->input('email')) . '|' . $request->ip();

            if (RateLimiter::tooManyAttempts($kunciBatas, 5)) {
                return response()->json([
                    'error' => ['pesan' => 'Terlalu banyak percobaan. Coba lagi nanti.'],
                ], 429);
            }

            $user = User::where('email', $request->validated('email'))->first();

            // Verifikasi tetap dijalankan walau user tidak ada -> waktu seragam.
            $cocok = Hash::check(
                $request->validated('password'),
                $user?->password ?? static::HASH_PALSU,
            );

            if ($user === null || ! $cocok) {
                RateLimiter::hit($kunciBatas, 900);
                // Pesan yang SAMA untuk kedua kemungkinan.
                return response()->json([
                    'error' => ['pesan' => 'Email atau kata sandi salah'],
                ], 401);
            }

            RateLimiter::clear($kunciBatas);

            // Batasi kemampuan token, dan beri masa berlaku.
            $token = $user->createToken(
                name: $request->input('nama_perangkat', 'api'),
                abilities: ['artikel:baca', 'artikel:tulis'],
                expiresAt: now()->addDays(30),
            );

            return response()->json([
                'data' => [
                    // plainTextToken HANYA tersedia sekali, di sini.
                    'token' => $token->plainTextToken,
                    'kedaluwarsaPada' => $token->accessToken->expires_at,
                ],
            ]);
        }
        `,
      ),

      h2('Ability'),
      code(
        'php',
        `
        // Di rute
        Route::middleware(['auth:sanctum', 'ability:artikel:tulis'])
            ->post('/artikel', [ArtikelController::class, 'store']);

        // Di kode
        if (! $request->user()->tokenCan('artikel:terbitkan')) {
            abort(403, 'Token tidak punya izin ini');
        }
        `,
      ),
      callout(
        'warning',
        'Ability membatasi TOKEN, bukan PENGGUNA',
        'Ini sering tertukar. Token dengan ability `artikel:tulis` tetap tidak boleh menulis artikel **milik orang lain** — pemeriksaan kepemilikan tetap tugas Policy. Ability menjawab "token ini boleh melakukan jenis aksi apa"; Policy menjawab "pengguna ini boleh menyentuh objek yang mana".',
      ),

      h2('Pencabutan'),
      code(
        'php',
        `
        // Keluar dari perangkat ini
        $request->user()->currentAccessToken()->delete();

        // Keluar dari semua perangkat
        $request->user()->tokens()->delete();

        // Setelah ganti password — WAJIB
        $user->update(['password' => $baru]);
        $user->tokens()->delete();
        `,
      ),

      h2('Bersihkan token kedaluwarsa'),
      code(
        'php',
        `
        // routes/console.php
        Schedule::command('sanctum:prune-expired --hours=24')->daily();
        `,
      ),
      callout(
        'danger',
        'Token tanpa `expiresAt` berlaku selamanya',
        'Sanctum tidak memberi masa berlaku secara default. Token yang bocor dari log, dari perangkat yang hilang, atau dari repositori yang salah commit akan tetap sah bertahun-tahun. Selalu tetapkan `expiresAt`, dan jadwalkan pembersihannya.',
      ),
    ],
  ),

  written(
    'policy-gate',
    'Policy & Gate',
    12,
    'Menaruh aturan "boleh apa" di satu tempat yang tidak bisa dilewati.',
    [
      h2('Policy — otorisasi per objek'),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);

        namespace App\\Policies;

        use App\\Models\\Artikel;
        use App\\Models\\User;
        use Illuminate\\Auth\\Access\\Response;

        final class ArtikelPolicy
        {
            // Dijalankan SEBELUM method lain.
            // null = lanjut ke pemeriksaan biasa. JANGAN kembalikan false.
            public function before(User $user, string $ability): ?bool
            {
                return $user->peran === 'admin' ? true : null;
            }

            public function view(User $user, Artikel $artikel): bool
            {
                // Yang terbit boleh dilihat siapa saja; draf hanya pemiliknya.
                return $artikel->status === 'terbit' || $artikel->penulis_id === $user->id;
            }

            public function update(User $user, Artikel $artikel): Response
            {
                if ($artikel->penulis_id !== $user->id) {
                    // Response::denyAsNotFound() -> 404, bukan 403.
                    // Jangan ungkap bahwa artikel privat ini ada.
                    return Response::denyAsNotFound();
                }

                if ($artikel->status === 'arsip') {
                    return Response::deny('Artikel yang diarsipkan tidak bisa diubah.');
                }

                return Response::allow();
            }

            public function terbitkan(User $user, Artikel $artikel): bool
            {
                return $artikel->penulis_id === $user->id
                    && $user->tokenCan('artikel:terbitkan');
            }
        }
        `,
      ),
      callout(
        'danger',
        '`before()` yang mengembalikan `false` mematikan seluruh policy',
        'Ia menolak **setiap** pemeriksaan, termasuk yang seharusnya lolos. Kembalikan `null` untuk melanjutkan ke method biasa. Kesalahan ini menghasilkan "admin tidak bisa apa-apa" — atau, kalau logikanya terbalik, semua orang bisa segalanya.',
      ),

      h2('Memakainya'),
      code(
        'php',
        `
        // Di controller
        $this->authorize('update', $artikel);          // melempar 403/404

        // Bersyarat
        if ($request->user()->can('terbitkan', $artikel)) { ... }

        // Di rute
        Route::patch('/artikel/{artikel}', ...)->can('update', 'artikel');

        // Di Form Request
        public function authorize(): bool
        {
            return $this->user()->can('update', $this->route('artikel'));
        }
        `,
      ),

      h2('Policy tidak berlaku untuk daftar'),
      code(
        'php',
        `
        // SALAH: policy tidak dipanggil per baris.
        // Ini mengembalikan artikel SEMUA orang.
        $artikel = Artikel::paginate(20);

        // BENAR: scope-nya ada di query.
        $artikel = Artikel::query()
            ->where(fn ($q) => $q
                ->where('status', 'terbit')
                ->orWhere('penulis_id', $request->user()->id))
            ->paginate(20);
        `,
      ),
      callout(
        'danger',
        'Ini kesalahan otorisasi yang paling sering di Laravel',
        'Policy bekerja per objek, dan endpoint daftar tidak memanggilnya untuk setiap baris. Aplikasi yang policy-nya lengkap tapi endpoint daftarnya tidak di-scope tetap membocorkan seluruh data. Untuk daftar, penjagaannya **harus** ada di query.',
      ),

      h2('Gate — untuk yang tidak terikat model'),
      code(
        'php',
        `
        // app/Providers/AppServiceProvider.php
        Gate::define('lihat-dasbor-admin', fn (User $user) => $user->peran === 'admin');

        Gate::define('ekspor-data', function (User $user) {
            return $user->peran === 'admin'
                ? Response::allow()
                : Response::deny('Hanya admin yang bisa mengekspor data.');
        });

        // Dipakai
        Gate::authorize('ekspor-data');
        Route::get('/admin', ...)->middleware('can:lihat-dasbor-admin');
        `,
      ),

      h2('Peran + izin'),
      code(
        'php',
        `
        // Periksa IZIN, bukan peran — supaya peran bisa berubah
        // tanpa menyentuh puluhan pemeriksaan.
        final class User extends Authenticatable
        {
            private const IZIN = [
                'pengguna' => ['artikel.baca', 'artikel.tulis'],
                'editor' => ['artikel.baca', 'artikel.tulis', 'artikel.terbitkan'],
                'admin' => ['*'],
            ];

            public function punyaIzin(string $izin): bool
            {
                $dimiliki = self::IZIN[$this->peran] ?? [];
                return in_array('*', $dimiliki, true) || in_array($izin, $dimiliki, true);
            }
        }
        `,
      ),

      h2('Catat penolakan'),
      code(
        'php',
        `
        Gate::after(function (User $user, string $ability, ?bool $hasil, array $argumen) {
            if ($hasil === false) {
                Log::warning('otorisasi ditolak', [
                    'penggunaId' => $user->id,
                    'ability' => $ability,
                    'objek' => class_basename($argumen[0] ?? null),
                    'objekId' => $argumen[0]->id ?? null,
                ]);
            }
        });
        `,
      ),
      callout(
        'tip',
        'Lonjakan penolakan adalah sinyal serangan',
        'Satu penolakan itu wajar. Lima puluh dari satu akun dalam semenit adalah seseorang yang sedang memetakan apa yang bisa ia sentuh. Ini termasuk kegagalan nomor sembilan OWASP — log tanpa alert bukan deteksi.',
      ),
    ],
  ),

  written(
    'queue-horizon',
    'Queue & Job, Horizon',
    12,
    'Pekerjaan latar di Laravel, beserta pemantauannya.',
    [
      h2('Membuat job'),
      code(
        'php',
        `
        <?php

        declare(strict_types=1);

        namespace App\\Jobs;

        use Illuminate\\Contracts\\Queue\\ShouldQueue;
        use Illuminate\\Foundation\\Queue\\Queueable;

        final class KirimEmailVerifikasi implements ShouldQueue
        {
            use Queueable;

            public int $tries = 5;
            public int $timeout = 30;
            public int $maxExceptions = 3;

            // Berhenti mencoba setelah 10 menit sejak job pertama dibuat.
            public function retryUntil(): \\DateTime
            {
                return now()->addMinutes(10);
            }

            public function __construct(
                // Simpan ID, BUKAN objek lengkap — payload tersimpan di
                // penyimpanan antrean dan terlihat di dashboard.
                public readonly int $penggunaId,
            ) {}

            public function handle(): void
            {
                $user = User::find($this->penggunaId);

                // Pengguna sudah dihapus — bukan kegagalan yang perlu diulang.
                if ($user === null || $user->email_verified_at !== null) {
                    return;
                }

                Mail::to($user)->send(new VerifikasiEmail($user));
            }

            public function backoff(): array
            {
                return [2, 5, 15, 60];   // detik, per percobaan
            }

            public function failed(\\Throwable $e): void
            {
                Log::error('gagal mengirim email verifikasi', [
                    'penggunaId' => $this->penggunaId,
                    'error' => $e->getMessage(),
                ]);
            }
        }
        `,
      ),
      callout(
        'danger',
        'Jangan menaruh objek Eloquent utuh di konstruktor job',
        'Laravel menyerialisasinya ke penyimpanan antrean. Isinya — termasuk kolom sensitif — tersimpan dalam bentuk yang bisa dibaca, dan terlihat di dashboard Horizon. Oper **ID**, lalu ambil datanya di dalam `handle()`. Ini juga menghindari memakai data yang sudah basi saat job akhirnya berjalan.',
      ),

      h2('Job harus idempoten'),
      code(
        'php',
        `
        public function handle(): void
        {
            // Klaim atomik: hanya satu eksekusi yang berhasil mengubah statusnya.
            $klaim = Pembayaran::where('id', $this->pembayaranId)
                ->where('status', 'menunggu')
                ->update(['status' => 'diproses']);

            if ($klaim === 0) {
                Log::info('pembayaran sudah diproses, job dilewati', ['id' => $this->pembayaranId]);
                return;
            }

            $this->proses();
        }
        `,
      ),
      code(
        'php',
        `
        // Atau: cegah job kembar sejak awal
        use Illuminate\\Queue\\Middleware\\WithoutOverlapping;

        public function middleware(): array
        {
            return [
                (new WithoutOverlapping("pembayaran:{$this->pembayaranId}"))
                    ->expireAfter(180)      // lepas kunci kalau job mati
                    ->releaseAfter(10),
            ];
        }
        `,
      ),

      h2('Menjalankan'),
      code(
        'bash',
        `
        # Pengembangan
        php artisan queue:work --tries=3

        # Produksi: pakai supervisor/systemd supaya otomatis menyala ulang.
        # --max-jobs dan --max-time membatasi kebocoran memori jangka panjang.
        php artisan queue:work redis --queue=tinggi,default --max-jobs=1000 --max-time=3600
        `,
      ),
      callout(
        'danger',
        'Pekerja memuat kode SEKALI saat dijalankan',
        'Setelah deploy, pekerja lama masih menjalankan kode lama sampai ia dimulai ulang. Ini menghasilkan bug yang sangat membingungkan: perbaikan sudah di-deploy tapi job tetap gagal dengan cara lama. Setiap deploy **wajib** menjalankan `php artisan queue:restart`.',
      ),

      h2('Antrean berprioritas'),
      code(
        'php',
        `
        KirimEmailVerifikasi::dispatch($user->id)->onQueue('tinggi');
        BuatLaporanBulanan::dispatch()->onQueue('rendah');

        // Pekerja mengosongkan 'tinggi' lebih dulu
        // php artisan queue:work --queue=tinggi,default,rendah
        `,
      ),

      h2('Batch & chain'),
      code(
        'php',
        `
        // Chain: berurutan; kalau satu gagal, sisanya tidak dijalankan
        Bus::chain([
            new ProsesPembayaran($pesananId),
            new KirimStruk($pesananId),
            new PerbaruiStok($pesananId),
        ])->dispatch();

        // Batch: paralel, dengan pemantauan bersama
        Bus::batch($jobs)
            ->then(fn (Batch $b) => Log::info('semua selesai'))
            ->catch(fn (Batch $b, \\Throwable $e) => Log::error('ada yang gagal'))
            ->allowFailures()
            ->dispatch();
        `,
      ),

      h2('Horizon'),
      code(
        'bash',
        `
        composer require laravel/horizon
        php artisan horizon:install
        php artisan horizon
        `,
      ),
      code(
        'php',
        `
        // app/Providers/HorizonServiceProvider.php
        // Dashboard Horizon memperlihatkan payload job — LINDUNGI.
        Gate::define('viewHorizon', fn ($user) => $user->peran === 'admin');
        `,
      ),
      callout(
        'danger',
        'Dashboard Horizon memperlihatkan isi payload job',
        'Kalau dibiarkan terbuka, siapa pun bisa membaca data yang lewat antreanmu — dan mencoba ulang atau menghapus job. Batasi dengan gate, dan jangan andalkan "alamatnya tidak ditautkan di mana pun".',
      ),

      h2('Job yang gagal'),
      code(
        'bash',
        `
        php artisan queue:failed
        php artisan queue:retry <id>
        php artisan queue:retry all
        php artisan queue:flush
        `,
      ),
      p(
        'Tabel job gagal hanya berguna kalau ada yang membukanya. Pasang alert saat jumlahnya melonjak — job yang gagal diam-diam adalah pekerjaan yang hilang tanpa ada yang tahu.',
      ),
    ],
  ),

  written(
    'event-listener-observer',
    'Event, Listener & Observer',
    11,
    'Memisahkan efek samping — tanpa membuat alurnya hilang.',
    [
      p(
        'Event membuat kode yang menerbitkan artikel tidak perlu tahu bahwa ada email yang harus dikirim. Itu keuntungannya. Harganya: alur programnya menjadi **tidak terlihat** dari kode yang memicunya.',
      ),

      h2('Event & listener'),
      code(
        'php',
        `
        final class ArtikelDiterbitkan
        {
            use Dispatchable, SerializesModels;

            public function __construct(public readonly Artikel $artikel) {}
        }
        `,
      ),
      code(
        'php',
        `
        // ShouldQueue -> listener berjalan di antrean, bukan di jalur permintaan.
        final class KirimNotifikasiPengikut implements ShouldQueue
        {
            public function handle(ArtikelDiterbitkan $event): void
            {
                $event->artikel->penulis->pengikut()
                    ->chunkById(500, function ($pengikut) use ($event) {
                        foreach ($pengikut as $p) {
                            $p->notify(new ArtikelBaru($event->artikel));
                        }
                    });
            }
        }
        `,
      ),
      code(
        'php',
        `
        // Laravel 11+ menemukan listener otomatis dari tipe parameternya.
        event(new ArtikelDiterbitkan($artikel));
        `,
      ),

      h2('Observer model'),
      code(
        'php',
        `
        #[ObservedBy(ArtikelObserver::class)]
        final class Artikel extends Model { }

        final class ArtikelObserver
        {
            public function creating(Artikel $artikel): void
            {
                $artikel->slug ??= Str::slug($artikel->judul) . '-' . Str::random(6);
            }

            public function deleted(Artikel $artikel): void
            {
                Cache::forget("artikel:v1:{$artikel->id}");
            }
        }
        `,
      ),
      callout(
        'danger',
        'Observer TIDAK berjalan pada operasi massal',
        '`Artikel::where(...)->update([...])`, `delete()` massal, dan `insert()` lewat query builder **melewati** observer sepenuhnya — karena keduanya tidak memuat model. Ini sumber bug yang sangat sering: slug tidak terisi, cache tidak dibersihkan, audit log tidak tercatat, dan tidak ada error apa pun.',
      ),

      h2('Jangan sembunyikan aturan penting di observer'),
      compare(
        {
          title: 'Berbahaya',
          lang: 'php',
          code: `
          // Di observer
          public function creating(Pesanan $p): void
          {
              $p->total = $this->hitungTotal($p);
              $p->pajak = $p->total * 0.11;
          }

          // Dari kode pemanggil, tidak ada
          // petunjuk bahwa ini terjadi.
          `,
          notes: ['Aturan bisnis tersembunyi', 'Dilewati operasi massal', 'Sulit diuji terpisah'],
        },
        {
          title: 'Eksplisit',
          lang: 'php',
          code: `
          // Di service
          $pesanan = $layanan->buat($data);
          // Perhitungan terjadi di dalamnya,
          // dan bisa dibaca serta diuji.
          `,
          notes: ['Alurnya terbaca', 'Berlaku untuk semua jalur pembuatan'],
        },
      ),
      callout(
        'tip',
        'Batas yang berguna',
        'Observer cocok untuk hal yang **melengkapi** — mengisi slug, membersihkan cache, mencatat audit. Ia tidak cocok untuk hal yang **menentukan** — menghitung harga, memvalidasi aturan, atau memutuskan status. Yang menentukan harus terlihat di jalur utamanya.',
      ),

      h2('Jalankan setelah transaksi commit'),
      code(
        'php',
        `
        final class KirimNotifikasi implements ShouldQueue, ShouldHandleEventsAfterCommit
        {
            // Tanpa ini, listener bisa berjalan SEBELUM transaksi di-commit —
            // lalu mencari baris yang belum ada, atau mengirim email untuk
            // sesuatu yang akhirnya di-rollback.
        }
        `,
      ),
      code(
        'php',
        `
        // Alternatif per pemanggilan
        DB::afterCommit(fn () => event(new ArtikelDiterbitkan($artikel)));
        `,
      ),

      h2('Menguji'),
      code(
        'php',
        `
        it('memancarkan event saat artikel diterbitkan', function () {
            Event::fake([ArtikelDiterbitkan::class]);

            $artikel = Artikel::factory()->draf()->create();
            $this->actingAs($artikel->penulis)
                ->postJson("/api/artikel/{$artikel->id}/terbitkan")
                ->assertOk();

            Event::assertDispatched(ArtikelDiterbitkan::class,
                fn ($e) => $e->artikel->is($artikel));
        });
        `,
      ),
      callout(
        'warning',
        'Terlalu banyak event membuat alur mustahil diikuti',
        'Rantai "event memicu listener yang memancarkan event lain" berakhir sebagai sistem yang tidak bisa dijelaskan siapa pun. Kalau kamu harus mencari di seluruh codebase untuk menjawab "apa yang terjadi setelah artikel diterbitkan", event sudah dipakai terlalu banyak.',
      ),
    ],
  ),

  written(
    'task-scheduling',
    'Task Scheduling',
    9,
    'Pekerjaan berkala yang terdefinisi di kode, bukan di crontab server.',
    [
      h2('Mendefinisikan'),
      code(
        'php',
        `
        // routes/console.php
        use Illuminate\\Support\\Facades\\Schedule;

        Schedule::command('sanctum:prune-expired --hours=24')->daily();

        Schedule::job(new BersihkanBerkasSementara)->hourly();

        Schedule::call(function () {
            Artikel::where('status', 'arsip')
                ->where('updated_at', '<', now()->subYear())
                ->delete();
        })->weekly()->sundays()->at('03:00');
        `,
      ),
      code(
        'bash',
        `
        # SATU baris cron untuk seluruh jadwal
        * * * * * cd /var/www/app && php artisan schedule:run >> /dev/null 2>&1
        `,
      ),
      callout(
        'tip',
        'Kenapa ini lebih baik daripada crontab langsung',
        'Jadwalnya ikut di version control, ikut di code review, dan bisa diuji. Crontab server adalah konfigurasi yang hidup di luar repo — tidak ada yang tahu isinya sampai ada yang login ke server, dan ia hilang saat server diganti.',
      ),

      h2('Penjagaan yang wajib'),
      code(
        'php',
        `
        Schedule::command('laporan:bulanan')
            ->monthlyOn(1, '02:00')

            // Cegah tumpang tindih kalau eksekusi sebelumnya belum selesai.
            // WAJIB diberi batas waktu, kalau tidak proses yang mati
            // meninggalkan kunci selamanya.
            ->withoutOverlapping(60)

            // Dengan banyak server, hanya SATU yang menjalankannya.
            ->onOneServer()

            // Jangan menahan permintaan HTTP saat schedule:run berjalan.
            ->runInBackground()

            ->timezone('Asia/Jakarta')
            ->appendOutputTo(storage_path('logs/laporan.log'))
            ->onFailure(fn () => Log::error('laporan bulanan gagal'));
        `,
      ),
      callout(
        'danger',
        'Tanpa `onOneServer`, setiap server menjalankannya',
        'Tiga instance berarti laporan yang sama dibuat tiga kali, email yang sama terkirim tiga kali, dan pembersihan berjalan bersamaan. `onOneServer` membutuhkan cache bersama (Redis atau database) — dengan cache per-proses ia tidak melakukan apa-apa.',
      ),

      h2('Menguji jadwalnya'),
      code(
        'bash',
        `
        php artisan schedule:list        # apa yang terdaftar dan kapan berjalan
        php artisan schedule:test        # jalankan satu tugas sekarang
        php artisan schedule:work        # jalankan penjadwal di foreground
        `,
      ),

      h2('Tugas berkala yang hampir selalu dibutuhkan'),
      table(
        ['Tugas', 'Frekuensi', 'Kenapa'],
        [
          ['Hapus token kedaluwarsa', 'Harian', 'Tabel tumbuh tanpa batas'],
          ['Hapus job gagal yang lama', 'Mingguan', 'Sama'],
          ['Bersihkan berkas sementara', 'Setiap jam', 'Disk penuh'],
          ['Hapus data soft-delete lewat retensi', 'Harian', 'Kewajiban privasi'],
          ['Segarkan cache mahal', 'Sesuai kebutuhan', 'Cegah cache dingin saat trafik tinggi'],
          ['Kirim ringkasan/laporan', 'Sesuai kebutuhan', 'Kebutuhan bisnis'],
        ],
      ),

      h2('Tugas yang gagal harus terlihat'),
      code(
        'php',
        `
        Schedule::command('sinkron:partner')
            ->everyThirtyMinutes()
            ->onFailure(function () {
                Log::error('sinkronisasi partner gagal');
                // Kirim ke saluran yang benar-benar dibaca orang.
            })
            // Ping layanan pemantau; kalau ping berhenti datang,
            // mereka yang memberi tahu kamu.
            ->pingOnSuccess(config('layanan.heartbeat_url'));
        `,
      ),
      callout(
        'warning',
        'Tugas terjadwal yang berhenti berjalan tidak menimbulkan error apa pun',
        'Ia hanya... tidak terjadi. Cron mati, `schedule:run` dihapus dari server baru, atau kunci `withoutOverlapping` tersangkut — dan tidak ada yang tahu sampai seseorang menyadari laporan bulanan tidak pernah datang. Pemantauan berbasis heartbeat menutupnya: yang dipantau adalah **ketiadaan** sinyal.',
      ),
    ],
  ),

  written(
    'caching-optimasi',
    'Caching & Optimasi Query',
    12,
    'Membuat cepat dengan cara yang benar, bukan dengan menutupi.',
    [
      h2('Menemukan yang lambat lebih dulu'),
      code(
        'php',
        `
        // Catat setiap query yang melebihi ambang, di lingkungan pengembangan.
        DB::whenQueryingForLongerThan(500, function (Connection $c, QueryExecuted $q) {
            Log::warning('query lambat', [
                'sql' => $q->sql,
                'waktuMs' => $q->time,
            ]);
        });
        `,
      ),
      code(
        'php',
        `
        // Lihat SQL yang benar-benar dihasilkan
        $q = Artikel::terbit()->with('penulis');
        dd($q->toRawSql());
        `,
      ),
      callout(
        'tip',
        'Optimasi tanpa pengukuran adalah tebakan',
        'Sebelum menambah cache, jalankan `EXPLAIN ANALYZE` pada query-nya. Sangat sering penyebabnya adalah index yang hilang — dan menambah index menyelesaikannya secara permanen, tanpa menambah satu sistem lagi untuk dipelihara.',
      ),

      h2('Urutan perbaikan'),
      ol(
        '**Tambah index** yang hilang — perbaikan permanen, tanpa efek samping.',
        '**Perbaiki N+1** dengan eager loading.',
        '**Pilih kolom** yang benar-benar dipakai, jangan `SELECT *`.',
        '**Paginasi** dan batasi jumlah barisnya.',
        '**Baru** cache — untuk yang memang mahal secara inheren.',
      ),

      h2('Cache di Laravel'),
      code(
        'php',
        `
        // Kunci berversi — naikkan v1 saat bentuk datanya berubah.
        // Jauh lebih andal daripada berusaha menghapus kunci satu per satu.
        $kategori = Cache::remember('kategori:v1:aktif', 3600, function () {
            return Kategori::where('aktif', true)->orderBy('nama')->get();
        });

        // Data privat WAJIB menyertakan identitas di kuncinya.
        $ringkasan = Cache::remember(
            "dasbor:v1:pengguna:{$user->id}",
            300,
            fn () => $this->hitungRingkasan($user),
        );
        `,
      ),
      callout(
        'danger',
        'Kunci cache tanpa identitas menyajikan data orang lain',
        'Kunci `dasbor:ringkasan` yang dipakai untuk semua pengguna akan menyajikan dasbor Ana kepada Budi — tergantung siapa yang kebetulan mengisi cache lebih dulu. Ini IDOR yang tidak terlihat di kode otorisasi mana pun.',
      ),
      code(
        'php',
        `
        // Jangan pakai forever tanpa jalur invalidasi yang jelas
        Cache::forever('kunci', $nilai);   // hanya kalau kamu benar-benar mengelolanya

        // Invalidasi
        Cache::forget('kategori:v1:aktif');

        // Cache tag (hanya Redis/Memcached) — untuk invalidasi berkelompok
        Cache::tags(['artikel', "penulis:{$id}"])->put($kunci, $nilai, 600);
        Cache::tags(["penulis:{$id}"])->flush();
        `,
      ),

      h2('Cache respons'),
      code(
        'php',
        `
        public function index(Request $request): JsonResponse
        {
            $halaman = (int) $request->query('hal', 1);
            $kunci = "artikel:v1:terbit:hal:{$halaman}";

            $data = Cache::remember($kunci, 60, fn () =>
                ArtikelResource::collection(
                    Artikel::terbit()->with('penulis:id,name')->paginate(20),
                )->response()->getData(true),
            );

            return response()->json($data)
                ->header('Cache-Control', 'public, max-age=60');
        }
        `,
      ),

      h2('Cache yang harus dijalankan saat deploy'),
      code(
        'bash',
        `
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        php artisan event:cache

        # Satu perintah untuk semuanya
        php artisan optimize
        `,
      ),
      callout(
        'danger',
        'Setelah `config:cache`, `env()` mengembalikan `null`',
        "Ini jebakan Laravel yang paling sering menjatuhkan deploy. Fungsi `env()` **hanya** boleh dipanggil dari berkas `config/*.php`. Memanggilnya di controller, model, atau service akan mengembalikan `null` di produksi — padahal bekerja sempurna di lokal. Di luar folder config, selalu `config('nama.kunci')`.",
      ),

      h2('Optimasi database'),
      code(
        'php',
        `
        // Chunk untuk data besar — memori tetap konstan
        Artikel::with('penulis')->chunkById(500, fn ($batch) => /* ... */);

        // Hanya kolom yang dipakai
        Artikel::select(['id', 'judul', 'slug'])->get();

        // Hitung di database, jangan di PHP
        $jumlah = Artikel::where('status', 'terbit')->count();   // BENAR
        // $jumlah = Artikel::where(...)->get()->count();        // memuat semuanya dulu

        // Agregasi lewat relasi tanpa memuat datanya
        Artikel::withCount('komentar')->get();
        `,
      ),
      p(
        'Baris kedua dari bawah adalah kesalahan yang sangat sering: `->get()->count()` mengambil **seluruh baris** ke memori PHP hanya untuk menghitungnya.',
      ),
    ],
  ),

  written(
    'notification-mail',
    'Notification & Mail',
    10,
    'Mengirim pesan lewat beberapa saluran, tanpa membuat permintaan menunggu.',
    [
      h2('Notification'),
      code(
        'php',
        `
        final class ArtikelDiterbitkanNotif extends Notification implements ShouldQueue
        {
            use Queueable;

            public function __construct(public readonly int $artikelId) {}

            public function via(object $notifiable): array
            {
                // Hormati preferensi pengguna — jangan kirim ke saluran
                // yang sudah ia matikan.
                return array_filter([
                    'mail',
                    $notifiable->preferensi['notif_database'] ?? true ? 'database' : null,
                ]);
            }

            public function toMail(object $notifiable): MailMessage
            {
                $artikel = Artikel::findOrFail($this->artikelId);

                return (new MailMessage)
                    ->subject('Artikel kamu sudah terbit')
                    ->greeting("Halo {$notifiable->name},")
                    ->line("Artikel \\"{$artikel->judul}\\" sudah bisa dibaca publik.")
                    ->action('Lihat artikel', route('artikel.show', $artikel));
            }

            public function toArray(object $notifiable): array
            {
                return ['artikelId' => $this->artikelId, 'tipe' => 'artikel_terbit'];
            }
        }
        `,
      ),
      code(
        'php',
        `
        $user->notify(new ArtikelDiterbitkanNotif($artikel->id));

        Notification::send($pengikut, new ArtikelDiterbitkanNotif($artikel->id));
        `,
      ),
      callout(
        'danger',
        'Notifikasi WAJIB lewat antrean',
        'Tanpa `ShouldQueue`, permintaan HTTP menunggu SMTP selesai. Penyedia email yang lambat berarti permintaanmu lambat; penyedia yang down berarti permintaanmu gagal — padahal artikelnya sudah tersimpan. Efek samping tidak boleh menentukan keberhasilan operasi utamanya.',
      ),

      h2('Mailable'),
      code(
        'php',
        `
        final class VerifikasiEmail extends Mailable implements ShouldQueue
        {
            use Queueable, SerializesModels;

            public function __construct(public readonly string $nama, public readonly string $url) {}

            public function envelope(): Envelope
            {
                return new Envelope(subject: 'Verifikasi email kamu');
            }

            public function content(): Content
            {
                return new Content(markdown: 'mail.verifikasi');
            }
        }
        `,
      ),

      h2('Menguji tanpa mengirim'),
      code(
        'php',
        `
        it('mengirim notifikasi ke pengikut saat artikel terbit', function () {
            Notification::fake();

            $penulis = User::factory()->has(User::factory()->count(3), 'pengikut')->create();
            $artikel = Artikel::factory()->draf()->create(['penulis_id' => $penulis->id]);

            $this->actingAs($penulis)
                ->postJson("/api/artikel/{$artikel->id}/terbitkan")
                ->assertOk();

            Notification::assertSentTo($penulis->pengikut, ArtikelDiterbitkanNotif::class);
        });
        `,
      ),
      code(
        'bash',
        `
        # Pengembangan: tulis email ke log, jangan kirim sungguhan
        MAIL_MAILER=log

        # Atau tangkap di kotak surat lokal
        MAIL_MAILER=smtp
        MAIL_HOST=localhost
        MAIL_PORT=1025      # Mailpit
        `,
      ),
      callout(
        'danger',
        'Jangan pernah menunjuk SMTP produksi dari lingkungan pengembangan',
        'Satu seeder yang menjalankan notifikasi bisa mengirim ribuan email ke alamat pengguna sungguhan. Ini kecelakaan yang tidak bisa dibatalkan — email yang sudah terkirim tidak bisa ditarik. Pakai `log` atau Mailpit, dan pastikan `.env` pengembangan tidak pernah memuat kredensial produksi.',
      ),

      h2('Yang tidak boleh ada di dalam email'),
      ul(
        'Password — tidak dalam bentuk apa pun, bahkan yang baru dibuat.',
        'Token akses berumur panjang.',
        'Data pribadi lebih dari yang benar-benar perlu.',
        'Tautan yang tidak kedaluwarsa.',
      ),
      code(
        'php',
        `
        // Tautan bertanda tangan yang kedaluwarsa
        $url = URL::temporarySignedRoute(
            'verifikasi', now()->addHours(24), ['id' => $user->id],
        );
        `,
      ),
      p(
        'Tanda tangannya membuat parameter di URL tidak bisa diubah, dan masa berlakunya membatasi kerugian kalau email itu diteruskan atau bocor dari arsip.',
      ),

      h2('Hormati batas penyedia'),
      code(
        'php',
        `
        // Batasi kecepatan pengiriman supaya akunmu tidak diblokir penyedia
        Notification::send($pengguna, $notif)->onQueue('email');

        // php artisan queue:work --queue=email --rest=1
        `,
      ),
    ],
  ),

  written(
    'testing-pest',
    'Testing dengan Pest',
    13,
    'Tes yang membuktikan hal yang tidak boleh terjadi.',
    [
      h2('Menyiapkan'),
      code(
        'bash',
        `
        composer require --dev pestphp/pest pestphp/pest-plugin-laravel
        php artisan pest:install
        `,
      ),
      code(
        'php',
        `
        // tests/Pest.php
        uses(Tests\\TestCase::class, Illuminate\\Foundation\\Testing\\RefreshDatabase::class)
            ->in('Feature');
        `,
      ),
      code(
        'html',
        `
        <!-- phpunit.xml — database TES, jangan pernah menunjuk yang lain -->
        <php>
          <env name="APP_ENV" value="testing"/>
          <env name="DB_DATABASE" value="app_test"/>
          <env name="MAIL_MAILER" value="array"/>
          <env name="QUEUE_CONNECTION" value="sync"/>
          <env name="CACHE_STORE" value="array"/>
        </php>
        `,
      ),

      h2('Tes fitur'),
      code(
        'php',
        `
        it('hanya menampilkan artikel milik pengguna yang masuk', function () {
            $ana = User::factory()->create();
            $budi = User::factory()->create();

            Artikel::factory()->count(3)->create(['penulis_id' => $ana->id]);
            Artikel::factory()->count(5)->create(['penulis_id' => $budi->id]);

            $this->actingAs($ana)
                ->getJson('/api/artikel/saya')
                ->assertOk()
                ->assertJsonCount(3, 'data');
        });

        it('membatasi per_hal di sisi server', function () {
            $ana = User::factory()->create();
            Artikel::factory()->count(150)->create(['penulis_id' => $ana->id]);

            $res = $this->actingAs($ana)->getJson('/api/artikel/saya?per_hal=999999');

            expect(count($res->json('data')))->toBeLessThanOrEqual(100);
        });
        `,
      ),

      h2('Tes yang paling berharga: yang membuktikan larangan'),
      code(
        'php',
        `
        it('menolak akses artikel milik orang lain', function () {
            $ana = User::factory()->create();
            $budi = User::factory()->create();
            $artikelBudi = Artikel::factory()->create(['penulis_id' => $budi->id, 'status' => 'draf']);

            $this->actingAs($ana)
                ->getJson("/api/artikel/{$artikelBudi->id}")
                ->assertNotFound();

            $this->actingAs($ana)
                ->patchJson("/api/artikel/{$artikelBudi->id}", ['judul' => 'dibajak'])
                ->assertNotFound();

            // Dan buktikan datanya benar-benar tidak berubah
            expect($artikelBudi->fresh()->judul)->not->toBe('dibajak');
        });

        it('mengabaikan penulis_id yang dikirim klien', function () {
            $ana = User::factory()->create();
            $budi = User::factory()->create();

            $this->actingAs($ana)->postJson('/api/artikel', [
                'judul' => 'Artikel',
                'isi' => 'Isi',
                'penulis_id' => $budi->id,      // percobaan mass assignment
            ])->assertCreated();

            expect(Artikel::first()->penulis_id)->toBe($ana->id);
        });

        it('tidak pernah mengembalikan hash password', function () {
            $ana = User::factory()->create();

            $res = $this->actingAs($ana)->getJson('/api/saya/profil');

            expect(json_encode($res->json()))->not->toContain('password');
        });
        `,
      ),
      callout(
        'tip',
        'Ketiga tes itu yang paling sering tidak ditulis',
        'Semuanya menguji bahwa sesuatu yang **seharusnya tidak bisa** memang tidak bisa. Tes jalur sukses akan tetap ditulis karena fiturnya harus jalan; tes larangan mudah dilewati — dan justru itu yang menangkap kelas bug paling mahal.',
      ),

      h2('Dataset'),
      code(
        'php',
        `
        it('menolak judul yang tidak valid', function (mixed $judul) {
            $ana = User::factory()->create();

            $this->actingAs($ana)
                ->postJson('/api/artikel', ['judul' => $judul, 'isi' => 'Isi'])
                ->assertStatus(422);
        })->with([
            'kosong' => [''],
            'hanya spasi' => ['   '],
            'terlalu panjang' => [str_repeat('a', 201)],
            'bukan string' => [12345],
            'null' => [null],
        ]);
        `,
      ),

      h2('Tes performa'),
      code(
        'php',
        `
        it('tidak menjalankan query per baris', function () {
            $ana = User::factory()->create();
            Artikel::factory()->count(30)->create(['penulis_id' => $ana->id]);

            DB::enableQueryLog();
            $this->actingAs($ana)->getJson('/api/artikel/saya')->assertOk();

            expect(count(DB::getQueryLog()))->toBeLessThan(6);
        });
        `,
      ),

      h2('Fake untuk yang di luar kendali'),
      code(
        'php',
        `
        Mail::fake();
        Notification::fake();
        Queue::fake();
        Storage::fake('s3');
        Event::fake([ArtikelDiterbitkan::class]);
        Http::fake(['api.partner.com/*' => Http::response(['ok' => true], 200)]);

        $this->travelTo(now()->addDays(31));   // uji kedaluwarsa
        `,
      ),
      callout(
        'warning',
        '`Queue::fake()` mencegah job benar-benar berjalan',
        'Ia memverifikasi bahwa job **dikirim ke antrean**, bukan bahwa job itu bekerja. Uji isi `handle()`-nya secara terpisah — kalau tidak, kamu punya tes hijau untuk job yang selalu gagal.',
      ),

      h2('Cakupan bukan tujuan'),
      code(
        'bash',
        `
        ./vendor/bin/pest --coverage --min=70
        `,
      ),
      p(
        'Cakupan mengukur baris yang **dijalankan**, bukan perilaku yang **diperiksa**. Tes yang memanggil endpoint dan hanya memastikan statusnya `200` menaikkan angka tanpa menangkap satu bug pun.',
      ),
    ],
  ),

  written(
    'file-storage',
    'File Storage & S3-compatible',
    10,
    'Menyimpan berkas di luar server aplikasi.',
    [
      h2('Disk'),
      code(
        'php',
        `
        // config/filesystems.php
        'disks' => [
            'local' => [
                'driver' => 'local',
                'root' => storage_path('app'),
                // TIDAK bisa diakses publik — ini yang benar untuk unggahan pengguna.
                'visibility' => 'private',
            ],
            's3' => [
                'driver' => 's3',
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
                'region' => env('AWS_DEFAULT_REGION'),
                'bucket' => env('AWS_BUCKET'),
                'endpoint' => env('AWS_ENDPOINT'),   // untuk R2, MinIO, Spaces
                'visibility' => 'private',
            ],
        ],
        `,
      ),
      callout(
        'danger',
        'Bucket default harus privat',
        'Bucket publik adalah salah satu penyebab kebocoran data paling umum di dunia — dokumen, foto identitas, dan berkas internal yang bisa diakses siapa pun yang menebak URL-nya. Setel `visibility: private` dan periksa kebijakan bucket-nya di konsol penyedia, bukan hanya di konfigurasi aplikasi.',
      ),

      h2('Menyimpan berkas'),
      code(
        'php',
        `
        public function unggah(UnggahBerkasRequest $request): JsonResponse
        {
            $berkas = $request->file('berkas');

            // Nama dibuat SERVER — bukan dari originalName milik klien.
            $jalur = $berkas->storeAs(
                "unggahan/{$request->user()->id}",
                Str::uuid() . '.' . $berkas->extension(),
                's3',
            );

            $rekaman = $request->user()->berkas()->create([
                'jalur' => $jalur,
                'nama_asli' => $berkas->getClientOriginalName(),   // metadata saja
                'mime' => $berkas->getMimeType(),
                'ukuran' => $berkas->getSize(),
            ]);

            return response()->json(['data' => new BerkasResource($rekaman)], 201);
        }
        `,
      ),
      code(
        'php',
        `
        // Validasi yang benar
        public function rules(): array
        {
            return [
                'berkas' => [
                    'required',
                    'file',
                    'max:5120',                       // KB
                    // 'mimes' memeriksa ISI berkas, bukan hanya nama atau
                    // header Content-Type yang dikirim klien.
                    'mimes:jpg,jpeg,png,webp,pdf',
                ],
            ];
        }
        `,
      ),

      h2('Menyajikan kembali dengan aman'),
      code(
        'php',
        `
        public function unduh(Berkas $berkas): StreamedResponse
        {
            // Berkas bukan milikmu -> 404. ID berkas bukan bukti kewenangan.
            $this->authorize('view', $berkas);

            return Storage::disk('s3')->download(
                $berkas->jalur,
                $berkas->nama_asli,
                [
                    'Content-Type' => $berkas->mime,
                    'X-Content-Type-Options' => 'nosniff',
                    'Cache-Control' => 'private, no-store',
                ],
            );
        }
        `,
      ),
      code(
        'php',
        `
        // URL sementara — untuk berkas besar, supaya tidak lewat server aplikasi
        $url = Storage::disk('s3')->temporaryUrl($berkas->jalur, now()->addMinutes(5));
        `,
      ),
      callout(
        'warning',
        'URL sementara tetap bisa diteruskan',
        'Selama masa berlakunya, siapa pun yang memegang URL itu bisa mengunduhnya. Buat masanya sesingkat mungkin — hitungan menit, bukan jam — dan jangan pernah menaruhnya di tempat yang tercatat, seperti log akses atau riwayat pesan.',
      ),

      h2('Unggah langsung ke storage'),
      code(
        'php',
        `
        // Klien mengunggah langsung ke S3; server hanya menerbitkan URL bertanda tangan.
        public function urlUnggah(Request $request): JsonResponse
        {
            $data = $request->validate([
                'mime' => ['required', Rule::in(['image/jpeg', 'image/png', 'application/pdf'])],
                'ukuran' => ['required', 'integer', 'max:5242880'],
            ]);

            $kunci = "unggahan/{$request->user()->id}/" . Str::uuid();

            $url = Storage::disk('s3')->temporaryUploadUrl($kunci, now()->addMinutes(5));

            return response()->json(['data' => ['url' => $url, 'kunci' => $kunci]]);
        }
        `,
      ),
      p(
        'Karena byte-nya tidak lewat server, verifikasi harus dilakukan **setelah** unggahan selesai — sebelum berkasnya ditandai siap dipakai.',
      ),

      h2('Menguji tanpa menyentuh S3'),
      code(
        'php',
        `
        it('menyimpan berkas dengan nama yang dibuat server', function () {
            Storage::fake('s3');
            $ana = User::factory()->create();

            $res = $this->actingAs($ana)->postJson('/api/berkas', [
                'berkas' => UploadedFile::fake()->image('foto.jpg'),
            ])->assertCreated();

            $jalur = Berkas::first()->jalur;

            Storage::disk('s3')->assertExists($jalur);
            // Nama asli TIDAK boleh dipakai sebagai nama berkas
            expect($jalur)->not->toContain('foto.jpg');
        });
        `,
      ),

      h2('Kuota dan pembersihan'),
      ul(
        'Batasi total penyimpanan per pengguna — satu akun tidak boleh menghabiskan bucket.',
        'Hapus berkas saat rekamannya dihapus; berkas yatim menumpuk tanpa batas.',
        'Bersihkan unggahan yang tidak pernah diselesaikan lewat job terjadwal.',
        'Terapkan kebijakan retensi untuk berkas ekspor yang memuat data pribadi.',
      ),
    ],
  ),

  written(
    'praktik-api-blog-laravel',
    'Praktik: API blog lengkap beserta testnya',
    15,
    'API yang sama dengan Bab 2.14, dibangun dengan Laravel.',
    [
      p(
        'Bangun API blog dengan **spesifikasi identik** dengan versi Express di Bab 2.14. Membangun hal yang sama dua kali adalah cara tercepat melihat mana keputusan yang milik masalahnya, dan mana yang hanya kebiasaan framework.',
      ),

      h2('Cakupan — sama persis'),
      code(
        'text',
        `
        POST   /api/auth/daftar
        POST   /api/auth/masuk
        POST   /api/auth/keluar
        POST   /api/auth/keluar-semua

        GET    /api/artikel                 publik, hanya yang terbit, cache 60s
        GET    /api/artikel/{artikel:slug}  publik
        POST   /api/artikel                 terautentikasi
        PATCH  /api/artikel/{artikel}       pemilik atau admin
        DELETE /api/artikel/{artikel}       pemilik atau admin
        POST   /api/artikel/{artikel}/terbitkan

        GET    /api/artikel/{artikel}/komentar
        POST   /api/artikel/{artikel}/komentar   rate limit ketat

        POST   /api/ekspor                  202 + job id
        GET    /api/ekspor/{job}            status, di-scope ke pemilik
        `,
      ),

      h2('Langkah pengerjaan'),
      steps(
        {
          title: '1. Skema dan model',
          body: 'Migration dengan `foreignId()->constrained()` (index otomatis), index untuk query halaman depan, `$fillable` eksplisit, dan casts termasuk enum status. Uji `migrate:rollback` — `down()` yang tidak pernah dicoba biasanya rusak.',
        },
        {
          title: '2. Penjagaan pengembangan',
          body: '`preventLazyLoading`, `preventSilentlyDiscardingAttributes`, dan `preventAccessingMissingAttributes` di `AppServiceProvider`. Tiga baris yang mengubah tiga kelas bug diam menjadi error.',
        },
        {
          title: '3. Auth dengan Sanctum',
          body: 'Token dengan `expiresAt` dan ability. Rate limit login per akun **dan** per IP dengan pesan yang sama untuk email tidak ada dan password salah. Ganti password mencabut semua token.',
        },
        {
          title: '4. Policy dan scope query',
          body: 'Policy untuk view/update/delete/terbitkan, dengan `denyAsNotFound()` untuk data privat. Dan — yang paling sering terlewat — **scope di query** untuk endpoint daftar, karena policy tidak berlaku per baris di sana.',
        },
        {
          title: '5. Form Request dan API Resource',
          body: 'Validasi dengan batas panjang dan rentang untuk setiap field; `validated()` di controller, bukan `all()`. Resource memakai `whenLoaded` supaya tidak menimbulkan N+1 dari lapisan respons.',
        },
        {
          title: '6. Antrean dan penjadwalan',
          body: 'Ekspor sebagai job idempoten dengan `WithoutOverlapping`. Notifikasi lewat antrean. Pembersihan token dan job gagal dijadwalkan. Jangan lupa `queue:restart` di skrip deploy.',
        },
        {
          title: '7. Cache',
          body: 'Daftar artikel publik dengan kunci berversi; data privat dengan identitas di kuncinya. Pastikan respons privat memakai `Cache-Control: no-store`.',
        },
        {
          title: '8. Tes larangan lebih dulu',
          body: 'Mulai dari tes otorisasi negatif dan mass assignment, lalu tes penghitung query, baru tes jalur sukses.',
        },
      ),

      h2('Tes minimum'),
      code(
        'php',
        `
        // Otorisasi
        it('menolak PATCH dan DELETE artikel milik orang lain');
        it('menyembunyikan artikel draf dari endpoint publik');
        it('menolak terbitkan tanpa ability artikel:terbitkan');
        it('endpoint daftar tidak membocorkan artikel pengguna lain');

        // Mass assignment
        it('mengabaikan penulis_id yang dikirim klien');
        it('mengabaikan status yang dikirim klien saat membuat');

        // Auth
        it('memberi pesan yang sama untuk email tidak ada dan password salah');
        it('menolak token setelah ganti password');
        it('menolak token yang sudah kedaluwarsa');
        it('membatasi percobaan login per akun dan per IP');

        // Kebocoran data
        it('tidak pernah mengembalikan password atau remember_token');

        // Batas & performa
        it('membatasi per_hal ke maksimum 100');
        it('tidak menjalankan query per baris pada daftar');

        // Job
        it('tidak memproses ekspor dua kali');
        it('menolak membaca status job milik pengguna lain');
        `,
      ),

      h2('Membandingkan dengan versi Express'),
      table(
        ['Kebutuhan', 'Express (Bab 2)', 'Laravel (bab ini)'],
        [
          ['Validasi', 'Zod + middleware sendiri', 'Form Request'],
          ['Otorisasi objek', 'Cek di service + scope query', 'Policy + scope query'],
          ['Bentuk respons', 'Pilih kolom manual', 'API Resource'],
          ['ORM', 'Prisma', 'Eloquent'],
          ['Antrean', 'BullMQ + Redis', 'Queue + Horizon'],
          ['Terjadwal', 'BullMQ repeat', 'Task Scheduling'],
          ['Tes', 'Vitest + Supertest', 'Pest'],
          ['Deteksi N+1', 'Hitung query di tes', '`preventLazyLoading` + tes'],
        ],
      ),
      callout(
        'tip',
        'Yang tidak berubah adalah kolom kiri',
        'Setiap kebutuhan itu ada di kedua stack, dan setiap pemeriksaan keamanan tetap harus ditulis sadar di keduanya. Laravel menyediakan lebih banyak bawaan; itu menghemat perakitan, **bukan** penilaian. Scope query untuk endpoint daftar, misalnya, sama-sama harus kamu tulis sendiri.',
      ),

      h2('Kriteria selesai'),
      code(
        'bash',
        `
        ./vendor/bin/pint --test          # format
        ./vendor/bin/phpstan analyse      # analisis statis
        ./vendor/bin/pest                 # semua tes, termasuk yang negatif
        composer audit                    # kerentanan dependency

        php artisan route:list            # periksa kolom middleware tiap rute
        php artisan optimize
        curl -sI localhost:8000/api/artikel
        `,
      ),

      divider,

      checklist(
        'bi3-praktik',
        'Checklist praktik bab ini',
        'Setiap berkas PHP diawali `declare(strict_types=1)`',
        '`preventLazyLoading` dan dua penjagaan lainnya aktif di luar produksi',
        'Setiap method controller yang menerima model memanggil `authorize()`',
        'Endpoint daftar di-scope di query — bukan hanya mengandalkan Policy',
        '`$fillable` eksplisit; tidak ada `$guarded = []` di mana pun',
        'Controller memakai `validated()`, bukan `all()`',
        'Respons memakai API Resource dengan `whenLoaded` untuk relasi',
        'Token Sanctum punya `expiresAt`; pembersihan dijadwalkan',
        'Ganti password mencabut seluruh token',
        'Rate limit login per akun dan per IP, dengan pesan gagal yang seragam',
        'Job idempoten, memakai ID bukan objek model, dan tidak tumpang tindih',
        'Notifikasi lewat antrean — bukan di jalur permintaan',
        'Skrip deploy menjalankan `queue:restart`',
        '`config()` dipakai di luar folder `config/`, bukan `env()`',
        'Kunci cache berversi dan menyertakan identitas untuk data privat',
        'Dashboard Horizon dan endpoint metrik dilindungi gate',
        'Disk penyimpanan privat; nama berkas dibuat server',
        'Tes membuktikan pengguna lain ditolak dan datanya tidak berubah',
        'Tes menghitung query untuk mencegah N+1 kembali',
      ),
    ],
  ),
];
