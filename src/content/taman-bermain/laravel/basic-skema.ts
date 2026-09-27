import {
  larangStruktur,
  mesinStruktur,
  soal,
  urutStruktur,
  wajibStruktur,
} from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * Laravel — Basic, exercises 27–29: schema, model, routing.
 *
 * These are graded by the `struktur` engine, which reads the source and never runs it. What that
 * can prove is narrower than the `js` engine, and the UI says so plainly rather than letting the
 * reader assume otherwise (PRD §7 R-3).
 *
 * Because there is no "expected vs got" to show, every assertion's `hint` carries the entire
 * feedback. A hint that merely restates its label leaves the learner with nothing but "salah".
 */

export const exercises: Exercise[] = [
  soal({
    slug: 'migration-tabel-catatan',
    title: 'Migration tabel beserta timestamps',
    topic: 'skema',
    level: 'basic',
    realWorldUse:
      'Setiap tabel baru di project Laravel dibuat lewat migration. Migration yang lupa timestamps baru ketahuan saat ada yang ingin mengurutkan data dari yang terbaru.',
    source: { category: 'backend-basic', chapter: 'php-laravel-basic' },
    brief: {
      situation:
        'Aplikasi catatan yang sedang kamu buat butuh tabel `catatan` di database. Di Laravel, tabel tidak dibuat dengan mengklik di aplikasi database, melainkan lewat file migration. Dengan migration, semua anggota tim bisa membuat tabel yang sama persis di komputer masing-masing cukup dengan satu perintah.',
      tasks: [
        'Isi method `up()` supaya membuat tabel `catatan` memakai `Schema::create`.',
        'Tabelnya punya kolom `id`, kolom `judul` bertipe string, kolom `isi` bertipe text, dan `timestamps`.',
        'Isi method `down()` supaya menghapus tabel `catatan`.',
      ],
      pitfalls: [
        '`timestamps()` membuat dua kolom sekaligus, yaitu `created_at` dan `updated_at`, dan Eloquent mengisinya otomatis. Menambahkannya belakangan berarti semua baris lama bernilai `null`.',
        'Kolom `isi` harus bertipe text, bukan string. Kolom string dibatasi 255 karakter, sehingga catatan yang panjang akan terpotong.',
        'Migration tanpa `down()` tidak bisa dibatalkan. Kekurangannya baru terasa saat kamu benar-benar perlu mundur.',
      ],
      terms: [
        {
          term: 'migration',
          meaning:
            'File PHP yang berisi perubahan struktur database, misalnya membuat tabel atau menambah kolom. Migration dijalankan dengan perintah `php artisan migrate`. Karena perubahannya ditulis sebagai kode, riwayat perubahan database ikut tersimpan di Git bersama kode aplikasi.',
        },
        {
          term: 'Blueprint',
          meaning:
            'Objek yang dipakai di dalam `Schema::create` untuk mendeskripsikan kolom tabel. Biasanya dinamai `$table`. Setiap tipe kolom dipanggil sebagai method, misalnya `$table->string("judul")` untuk teks pendek dan `$table->text("isi")` untuk teks panjang.',
        },
        {
          term: 'rollback',
          meaning:
            'Membatalkan migration terakhir yang sudah dijalankan, dengan perintah `php artisan migrate:rollback`. Laravel menjalankan method `down()` untuk itu. Kalau `down()` kosong, rollback tidak melakukan apa-apa dan tabelnya tetap ada.',
        },
      ],
    },
    rules: [
      'Memanggil `Schema::create` untuk tabel `catatan`.',
      'Punya kolom `judul` bertipe string dan kolom `isi` bertipe text.',
      'Menyertakan `timestamps()`.',
      'Punya method `down()` yang menghapus tabel.',
    ],
    starter: `
      public function up(): void
      {
          // buat tabel catatan di sini
      }

      public function down(): void
      {
          // batalkan perubahan di atas
      }
    `,
    hints: [
      '`Schema::create` menerima nama tabel dan sebuah closure yang menerima `Blueprint $table`.',
      'Setiap tipe kolom dipanggil sebagai method pada `$table`, yaitu `id()`, `string()`, `text()`, dan `timestamps()`.',
      'Untuk `down()`, `Schema::dropIfExists` lebih aman daripada `Schema::drop`, karena tidak melempar error kalau tabelnya memang sudah tidak ada.',
    ],
    solution: {
      code: `
        public function up(): void
        {
            Schema::create('catatan', function (Blueprint $table) {
                $table->id();                 // primary key yang bertambah otomatis
                $table->string('judul');      // teks pendek, maksimal 255 karakter
                $table->text('isi');          // teks panjang, untuk isi catatan
                $table->timestamps();         // created_at dan updated_at
            });
        }

        public function down(): void
        {
            // Kebalikan dari up(). Dipakai saat migration di-rollback.
            Schema::dropIfExists('catatan');
        }
      `,
      steps: [
        '`Schema::create("catatan", ...)` membuat tabel bernama `catatan`. Closure-nya menerima `$table` untuk mendeskripsikan kolom.',
        '`$table->id()` membuat kolom `id` sebagai primary key yang nilainya bertambah otomatis.',
        '`$table->string("judul")` membuat kolom teks pendek, dan `$table->text("isi")` membuat kolom teks panjang.',
        '`$table->timestamps()` membuat kolom `created_at` dan `updated_at`.',
        '`down()` memanggil `Schema::dropIfExists("catatan")`, sehingga migration ini bisa dibatalkan.',
      ],
      explanation:
        '`timestamps()` membuat dua kolom sekaligus, dan Eloquent mengisinya sendiri. Banyak fitur diam-diam bergantung padanya, seperti mengurutkan dari yang terbaru, jejak perubahan sederhana, dan memeriksa kapan sebuah data terakhir diubah. Menambahkannya belakangan berarti semua baris lama bernilai `null`.',
    },
    alternativeSolutions: [
      `
        public function up(): void
        {
            Schema::create('catatan', function (Blueprint $table) {
                $table->id();
                $table->string('judul', 200);
                $table->text('isi')->nullable();
                $table->timestamps();
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('catatan');
        }
      `,
      `
        public function up(): void
        {
            Schema::create('catatan', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('judul');
                $table->text('isi');
                $table->timestamps();
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('catatan');
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          public function up(): void
          {
              Schema::create('catatan', function (Blueprint $table) {
                  $table->id();
                  $table->string('judul');
                  $table->text('isi');
              });
          }

          public function down(): void
          {
              Schema::dropIfExists('catatan');
          }
        `,
        reason: 'Tanpa `timestamps()`, kolom `created_at` dan `updated_at` tidak pernah dibuat.',
      },
      {
        code: `
          public function up(): void
          {
              Schema::create('catatan', function (Blueprint $table) {
                  $table->id();
                  $table->string('judul');
                  $table->string('isi');
                  $table->timestamps();
              });
          }

          public function down(): void
          {
              Schema::dropIfExists('catatan');
          }
        `,
        reason:
          'Kolom `isi` memakai string yang dibatasi 255 karakter, sehingga catatan yang panjang akan terpotong.',
      },
      {
        code: `
          public function up(): void
          {
              Schema::create('catatan', function (Blueprint $table) {
                  $table->id();
                  $table->string('judul');
                  $table->text('isi');
                  $table->timestamps();
              });
          }
        `,
        reason: 'Tidak ada method `down()`, sehingga migration ini tidak bisa dibatalkan.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'schema-create',
        'Memanggil `Schema::create` untuk tabel `catatan`',
        'Tabel dibuat lewat `Schema::create("catatan", function (Blueprint $table) { ... })`.',
        'Schema::create\\s*\\(\\s*[\'"]catatan[\'"]',
      ),
      wajibStruktur(
        'kolom-id',
        'Punya kolom `id`',
        'Setiap tabel butuh primary key. Panggil `$table->id()`.',
        '\\$table->id\\(\\)',
      ),
      wajibStruktur(
        'judul-string',
        'Kolom `judul` bertipe string',
        'Kolom `judul` belum ada atau belum bertipe string. Pakai `$table->string("judul")`.',
        '\\$table->string\\(\\s*[\'"]judul[\'"]',
      ),
      wajibStruktur(
        'isi-text',
        'Kolom `isi` bertipe text',
        'Kolom `isi` harus bertipe text, bukan string. Kolom string dibatasi 255 karakter, padahal isi catatan bisa jauh lebih panjang.',
        '\\$table->text\\(\\s*[\'"]isi[\'"]',
      ),
      wajibStruktur(
        'timestamps',
        'Menyertakan `timestamps()`',
        'Eloquent bergantung pada kolom `created_at` dan `updated_at`. Panggil `$table->timestamps()`.',
        '\\$table->timestamps\\(\\)',
      ),
      wajibStruktur(
        'ada-down',
        'Punya method `down()` yang menghapus tabel',
        'Belum ada `Schema::drop` atau `Schema::dropIfExists` di dalam `down()`. Tanpa itu, migration ini tidak bisa dibatalkan.',
        'Schema::drop(IfExists)?\\s*\\(',
      ),
    ]),
  }),

  soal({
    slug: 'model-fillable',
    title: 'Model dengan `$fillable`',
    topic: 'skema',
    level: 'basic',
    realWorldUse:
      'Mencegah mass assignment di setiap model. Tanpa daftar kolom yang jelas, satu field tambahan di request bisa mengubah kolom yang seharusnya tidak boleh diubah pengguna.',
    source: { category: 'backend-basic', chapter: 'php-laravel-basic' },
    brief: {
      situation:
        'Tabel `catatan` punya kolom `judul`, `isi`, dan `user_id` yang menandai pemiliknya. Pengguna boleh mengubah judul dan isi catatannya, tapi tidak boleh mengubah `user_id`, karena itu sama saja memindahkan catatan ke akun orang lain. Laravel mengatur kolom mana yang boleh diisi dari request lewat properti `$fillable` di model.',
      tasks: [
        'Tulis model `Catatan` yang mewarisi `Model`.',
        'Tambahkan properti `$fillable` yang hanya berisi `judul` dan `isi`.',
      ],
      pitfalls: [
        'Jangan memakai `$guarded = []`. Bentuk itu berarti "semua kolom boleh diisi dari request", termasuk `id`, `user_id`, dan kolom apa pun yang ditambahkan orang lain enam bulan lagi.',
        'Kolom yang tidak disebut di `$fillable` akan diabaikan diam-diam oleh `create()`. Lupa menyebut `isi` membuat setiap catatan tersimpan tanpa isinya.',
      ],
      terms: [
        {
          term: 'Eloquent model',
          meaning:
            'Class PHP yang mewakili satu tabel di database. Model `Catatan` mewakili tabel `catatan`. Lewat model kamu bisa membaca dan menulis data tanpa menulis SQL, misalnya `Catatan::create([...])` untuk menyimpan satu catatan baru.',
        },
        {
          term: '$fillable',
          meaning:
            'Properti di model yang berisi daftar kolom yang boleh diisi sekaligus lewat `create()` atau `update()`. Ini disebut whitelist atau daftar putih. Kolom yang tidak ada di daftar itu diabaikan, walaupun dikirim di request.',
        },
        {
          term: 'mass assignment',
          meaning:
            'Mengisi banyak kolom sekaligus dari satu array, misalnya `Catatan::create($request->all())`. Cara ini praktis, tapi berbahaya kalau semua kolom boleh diisi, karena penyerang bisa menambahkan field seperti `user_id` ke request-nya.',
        },
      ],
    },
    rules: [
      'Class `Catatan` mewarisi `Model`.',
      'Punya `$fillable` yang berisi `judul` dan `isi`.',
      'Dilarang memakai `$guarded = []`.',
    ],
    starter: `
      class Catatan extends Model
      {
          // tentukan kolom mana yang boleh diisi sekaligus
      }
    `,
    hints: [
      '`$fillable` adalah daftar putih. Hanya kolom yang disebut di situ yang boleh diisi lewat `create()` atau `update()`.',
      'Tulis sebagai properti `protected` yang berisi array of string.',
      '`protected $fillable = ["judul", "isi"];`',
    ],
    solution: {
      code: `
        class Catatan extends Model
        {
            // Daftar putih. Hanya kolom ini yang boleh diisi dari request.
            // user_id sengaja TIDAK disebut, supaya tidak bisa dipalsukan pengguna.
            protected $fillable = [
                'judul',
                'isi',
            ];
        }
      `,
      steps: [
        '`class Catatan extends Model` membuat model Eloquent untuk tabel `catatan`.',
        '`protected $fillable = [...]` mendaftarkan kolom yang boleh diisi sekaligus.',
        'Hanya `judul` dan `isi` yang disebut, sehingga `Catatan::create($data)` mengabaikan field lain seperti `user_id`.',
        'Kolom baru yang ditambahkan ke tabel nanti otomatis TIDAK bisa diisi dari request, sampai ada yang sengaja menambahkannya ke daftar ini.',
      ],
      explanation:
        '`$fillable` adalah daftar putih, dan itulah bedanya dengan `$guarded` yang berupa daftar hitam. Daftar putih gagal ke arah yang aman. Kolom baru yang ditambahkan nanti otomatis tidak bisa diisi dari request, sampai ada orang yang sengaja memasukkannya. Daftar hitam gagal ke arah sebaliknya.',
    },
    alternativeSolutions: [
      `
        class Catatan extends Model
        {
            use HasFactory;

            protected $fillable = ['judul', 'isi'];

            protected $casts = [
                'created_at' => 'datetime',
            ];
        }
      `,
      `
        class Catatan extends Model
        {
            protected $fillable = ["judul", "isi"];

            public function user(): BelongsTo
            {
                return $this->belongsTo(User::class);
            }
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          class Catatan extends Model
          {
              protected $guarded = [];
          }
        `,
        reason:
          'Membuka semua kolom untuk mass assignment, termasuk `user_id`. Justru ini yang dilarang soal.',
      },
      {
        code: `
          class Catatan extends Model
          {
              protected $fillable = ['judul'];
          }
        `,
        reason: 'Kolom `isi` tidak ada di daftar, sehingga setiap catatan tersimpan tanpa isinya.',
      },
      {
        code: `
          class Catatan extends Model
          {
          }
        `,
        reason: 'Tanpa `$fillable`, `create()` menolak semua kolom yang dikirim.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'extends-model',
        'Class `Catatan` mewarisi `Model`',
        'Model Eloquent harus mewarisi class `Model` milik Laravel.',
        'class\\s+Catatan\\s+extends\\s+Model',
      ),
      wajibStruktur(
        'ada-fillable',
        'Punya properti `$fillable`',
        'Belum ada `protected $fillable`. Tanpa itu, `create()` menolak semua kolom.',
        '\\$fillable\\s*=',
      ),
      wajibStruktur(
        'fillable-judul',
        'Kolom `judul` ada di `$fillable`',
        'Kolom `judul` belum masuk daftar `$fillable`, sehingga ia tidak akan tersimpan.',
        '[\'"]judul[\'"]',
      ),
      wajibStruktur(
        'fillable-isi',
        'Kolom `isi` ada di `$fillable`',
        'Kolom `isi` belum masuk daftar `$fillable`, sehingga setiap catatan tersimpan tanpa isinya.',
        '[\'"]isi[\'"]',
      ),
      larangStruktur(
        'tanpa-guarded-kosong',
        'Tidak memakai `$guarded = []`',
        '`$guarded = []` membuka SEMUA kolom untuk mass assignment, termasuk kolom yang ditambahkan orang lain nanti.',
        '\\$guarded\\s*=\\s*\\[\\s*\\]',
      ),
    ]),
  }),

  soal({
    slug: 'route-resource',
    title: 'Route resource dan route model binding',
    topic: 'skema',
    level: 'basic',
    realWorldUse:
      'Mendaftarkan endpoint CRUD. `apiResource` menggantikan lima baris route manual dengan satu baris, dan penamaannya konsisten di seluruh project.',
    source: { category: 'backend-basic', chapter: 'php-laravel-basic' },
    brief: {
      situation:
        'API catatan butuh lima endpoint standar, yaitu menampilkan daftar, membuat, menampilkan satu, mengubah, dan menghapus. Menulis kelimanya satu per satu membosankan dan rawan salah ketik. Laravel punya satu baris yang mendaftarkan kelimanya sekaligus. Selain itu, kamu juga butuh satu endpoint tambahan untuk melihat riwayat perubahan sebuah catatan.',
      tasks: [
        'Daftarkan route API untuk `catatan` memakai `Route::apiResource`, menunjuk ke `CatatanController::class`.',
        'Tambahkan satu route manual `GET /catatan/{catatan}/riwayat` yang menunjuk ke method `riwayat` di `CatatanController`.',
        'Beri nama parameter URL-nya `{catatan}`, supaya Laravel mengambilkan data catatannya secara otomatis.',
      ],
      pitfalls: [
        'Pakai `apiResource`, bukan `resource`. `resource` ikut mendaftarkan route `create` dan `edit` yang hanya berguna untuk menampilkan form HTML. Di API, keduanya hanya menjadi dua endpoint yang tidak pernah dipakai tapi tetap harus diamankan.',
        'Tunjuk controller dengan `CatatanController::class`, bukan string `"CatatanController"`. String tidak diperiksa oleh editor, sehingga salah ketik baru ketahuan saat route dipanggil.',
      ],
      terms: [
        {
          term: 'resource route',
          meaning:
            'Satu baris yang mendaftarkan sekumpulan route CRUD standar untuk sebuah resource. `Route::apiResource("catatan", ...)` mendaftarkan `index`, `store`, `show`, `update`, dan `destroy`. Kamu bisa melihat daftarnya dengan perintah `php artisan route:list`.',
        },
        {
          term: 'route model binding',
          meaning:
            'Fitur Laravel yang otomatis mengambil data dari database berdasarkan parameter di URL. Pada route `/catatan/{catatan}`, kalau method controller menerima `Catatan $catatan`, Laravel mencari catatan dengan id itu. Kalau tidak ketemu, Laravel langsung menjawab 404.',
        },
        {
          term: '::class',
          meaning:
            'Cara PHP menulis nama lengkap sebuah class sebagai teks. `CatatanController::class` menghasilkan `"App\\Http\\Controllers\\CatatanController"`. Bedanya dengan menulis string manual, editor dan alat analisis bisa memeriksa bahwa class itu benar-benar ada.',
        },
      ],
    },
    rules: [
      'Memakai `Route::apiResource` untuk `catatan`.',
      'Menunjuk ke `CatatanController::class`.',
      'Punya route riwayat dengan parameter `{catatan}`.',
    ],
    starter: `
      // daftarkan route untuk catatan di sini
    `,
    hints: [
      '`apiResource` mendaftarkan `index`, `store`, `show`, `update`, dan `destroy` sekaligus, tanpa `create` dan `edit` yang hanya berguna untuk form HTML.',
      'Controller ditunjuk memakai `::class`, bukan string.',
      'Route model binding bekerja kalau nama parameter di URL sama dengan nama variabel di method controller.',
    ],
    solution: {
      code: `
        // Satu baris untuk lima route CRUD standar.
        Route::apiResource('catatan', CatatanController::class);

        // Route tambahan. {catatan} diisi Laravel dengan model Catatan yang sesuai.
        Route::get('/catatan/{catatan}/riwayat', [CatatanController::class, 'riwayat']);
      `,
      steps: [
        '`Route::apiResource("catatan", CatatanController::class)` mendaftarkan lima route, misalnya `GET /catatan` ke method `index` dan `POST /catatan` ke method `store`.',
        '`CatatanController::class` menunjuk controller dengan nama class yang bisa diperiksa editor.',
        '`Route::get("/catatan/{catatan}/riwayat", ...)` menambahkan satu route di luar lima route standar.',
        '`[CatatanController::class, "riwayat"]` berarti "panggil method `riwayat` di `CatatanController`".',
        'Karena parameternya bernama `{catatan}`, method `riwayat(Catatan $catatan)` langsung menerima data catatan, bukan sekadar angka id.',
      ],
      explanation:
        '`apiResource` dipilih, bukan `resource`, karena API tidak butuh route `create` dan `edit`. Keduanya hanya berguna untuk menampilkan form HTML. Mendaftarkannya di API berarti ada dua endpoint yang tidak pernah dipakai, tapi tetap harus diamankan.',
    },
    alternativeSolutions: [
      `
        Route::middleware('auth:sanctum')->group(function () {
            Route::apiResource('catatan', CatatanController::class);
            Route::get('catatan/{catatan}/riwayat', [CatatanController::class, 'riwayat'])
                ->name('catatan.riwayat');
        });
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          Route::get('/catatan', [CatatanController::class, 'index']);
          Route::post('/catatan', [CatatanController::class, 'store']);
          Route::get('/catatan/{catatan}/riwayat', [CatatanController::class, 'riwayat']);
        `,
        reason:
          'Mendaftarkan route satu per satu, bukan memakai `apiResource` seperti yang diminta soal.',
      },
      {
        code: `
          Route::apiResource('catatan', 'CatatanController');
        `,
        reason: 'Menunjuk controller dengan string, dan route riwayatnya belum didaftarkan.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'api-resource',
        'Memakai `Route::apiResource`',
        'Belum ada `Route::apiResource`. Untuk API, `apiResource` lebih tepat daripada `resource`, karena tidak mendaftarkan route `create` dan `edit` yang hanya berguna untuk form HTML.',
        'Route::apiResource\\s*\\(\\s*[\'"]catatan[\'"]',
      ),
      wajibStruktur(
        'controller-class',
        'Menunjuk `CatatanController::class`',
        'Controller harus ditunjuk dengan `::class`, bukan string. String tidak diperiksa editor, sehingga salah ketik baru ketahuan saat route dipanggil.',
        'CatatanController::class',
      ),
      urutStruktur(
        'route-riwayat',
        'Punya route riwayat dengan route model binding',
        'Belum ada route `GET` ke `/catatan/{catatan}/riwayat`. Nama parameternya harus `{catatan}` supaya Laravel mengambilkan modelnya sendiri.',
        ['Route::get\\s*\\(', 'catatan/\\{catatan\\}/riwayat'],
      ),
    ]),
  }),
];
