import {
  larangStruktur,
  mesinStruktur,
  soal,
  urutStruktur,
  wajibStruktur,
} from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * Laravel — Basic, exercises 30–34: the endpoint layer.
 *
 * Controller, validation, relations, a query that handles "not found", and a resource that
 * decides what leaves the server. Three of the five are as much about security as about Laravel:
 * mass assignment, leaking internal columns, and returning 500 instead of 404 are all defects
 * that ship because the happy path worked.
 */

export const exercises: Exercise[] = [
  soal({
    slug: 'controller-index-store',
    title: 'Controller `index` dan `store`',
    topic: 'endpoint',
    level: 'basic',
    realWorldUse:
      'Dua aksi yang paling sering ditulis ulang di project mana pun, yaitu menampilkan daftar dan menyimpan satu data baru.',
    source: { category: 'backend-basic', chapter: 'php-laravel-basic' },
    brief: {
      situation:
        'Route API catatan sudah didaftarkan, dan sekarang saatnya menulis controller yang menjawabnya. Endpoint `GET /catatan` harus mengembalikan semua catatan, sedangkan `POST /catatan` harus menyimpan catatan baru dari data yang dikirim klien. Validasi datanya sudah disiapkan di class `SimpanCatatanRequest`, jadi controller tinggal memakainya.',
      tasks: [
        'Isi method `index()` supaya mengembalikan semua catatan.',
        'Isi method `store()` supaya menyimpan catatan baru memakai `$request->validated()`.',
        'Kembalikan catatan yang baru dibuat dengan status `201`.',
      ],
      pitfalls: [
        'Pakai `$request->validated()`, bukan `$request->all()`. `validated()` hanya mengembalikan field yang lolos aturan validasi, sedangkan `all()` meneruskan apa pun yang dikirim klien, termasuk field yang tidak pernah kamu izinkan.',
        '`store()` mengembalikan status `201`, bukan `200`. Klien memakainya untuk membedakan "data baru berhasil dibuat" dari "request berhasil" biasa.',
      ],
      terms: [
        {
          term: 'controller',
          meaning:
            'Class yang berisi method untuk menjawab request. Setiap method biasanya menangani satu aksi, misalnya `index` untuk daftar dan `store` untuk menyimpan. Route menentukan method mana yang dipanggil untuk URL tertentu.',
        },
        {
          term: 'validated()',
          meaning:
            'Method pada Form Request yang mengembalikan hanya field yang sudah lolos aturan validasi. Kalau klien mengirim `judul`, `isi`, dan `user_id`, tapi aturannya hanya untuk `judul` dan `isi`, maka `validated()` hanya berisi `judul` dan `isi`.',
        },
        {
          term: '201 Created',
          meaning:
            'Kode status HTTP yang berarti sebuah data baru berhasil dibuat. Ia lebih spesifik daripada `200 OK` yang berarti request berhasil secara umum. Di Laravel ditulis `response()->json($data, 201)`.',
        },
      ],
    },
    rules: [
      'Punya method `index()` dan `store()`.',
      'Memakai `$request->validated()`, bukan `$request->all()`.',
      'Response dari `store()` memakai status `201`.',
    ],
    starter: `
      class CatatanController extends Controller
      {
          public function index()
          {
              // kembalikan semua catatan
          }

          public function store(SimpanCatatanRequest $request)
          {
              // simpan catatan baru, lalu kembalikan dengan status 201
          }
      }
    `,
    hints: [
      'Untuk `index`, `Catatan::all()` sudah cukup di tahap ini.',
      'Form Request yang ditulis sebagai tipe parameter sudah memvalidasi data sebelum method-nya dijalankan.',
      '`response()->json($data, 201)` menentukan status response secara eksplisit.',
    ],
    solution: {
      code: `
        class CatatanController extends Controller
        {
            public function index()
            {
                // Catatan terbaru ditampilkan paling atas.
                return Catatan::latest()->get();
            }

            public function store(SimpanCatatanRequest $request)
            {
                // Sampai di baris ini, datanya SUDAH divalidasi oleh SimpanCatatanRequest.
                // validated() hanya berisi field yang lolos aturan validasi.
                $catatan = Catatan::create($request->validated());

                // 201 berarti data baru berhasil dibuat.
                return response()->json($catatan, 201);
            }
        }
      `,
      steps: [
        '`index()` memanggil `Catatan::latest()->get()` untuk mengambil semua catatan, diurutkan dari yang terbaru.',
        'Parameter `SimpanCatatanRequest $request` membuat Laravel memvalidasi data lebih dulu. Kalau datanya tidak valid, method ini tidak pernah dijalankan.',
        '`$request->validated()` mengambil hanya field yang lolos validasi.',
        '`Catatan::create(...)` menyimpan catatan baru ke database dan mengembalikan objeknya.',
        '`response()->json($catatan, 201)` mengirim catatan itu ke klien dengan status 201.',
      ],
      explanation:
        'Validasi sudah selesai sebelum baris pertama `store()` dijalankan, karena Form Request ditulis sebagai tipe parameter. Itulah sebabnya tidak ada `if` di sini. Request yang tidak valid tidak pernah sampai ke method ini.',
    },
    alternativeSolutions: [
      `
        class CatatanController extends Controller
        {
            public function index(): JsonResponse
            {
                return response()->json(Catatan::orderByDesc('created_at')->get());
            }

            public function store(SimpanCatatanRequest $request): JsonResponse
            {
                $data = $request->validated();
                $catatan = Catatan::create($data);

                return response()->json(['data' => $catatan], 201);
            }
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          class CatatanController extends Controller
          {
              public function index()
              {
                  return Catatan::all();
              }

              public function store(Request $request)
              {
                  $catatan = Catatan::create($request->all());

                  return response()->json($catatan, 201);
              }
          }
        `,
        reason:
          'Memakai `$request->all()`, sehingga field apa pun yang dikirim klien ikut diteruskan ke database.',
      },
      {
        code: `
          class CatatanController extends Controller
          {
              public function index()
              {
                  return Catatan::all();
              }

              public function store(SimpanCatatanRequest $request)
              {
                  return response()->json(Catatan::create($request->validated()));
              }
          }
        `,
        reason:
          'Tanpa status 201, klien tidak bisa membedakan data yang baru dibuat dari response biasa.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'method-index',
        'Punya method `index()`',
        'Belum ada `public function index()` di controller ini.',
        'public\\s+function\\s+index\\s*\\(',
      ),
      wajibStruktur(
        'method-store',
        'Punya method `store()`',
        'Belum ada `public function store()` di controller ini.',
        'public\\s+function\\s+store\\s*\\(',
      ),
      wajibStruktur(
        'pakai-validated',
        'Memakai `$request->validated()`',
        'Belum memakai `$request->validated()`. Method itulah yang membatasi data yang masuk hanya ke field yang sudah divalidasi.',
        '\\$request->validated\\(\\)',
      ),
      larangStruktur(
        'tanpa-all',
        'Tidak memakai `$request->all()`',
        '`$request->all()` meneruskan field apa pun yang dikirim klien ke `create()`. Ini pintu masuk mass assignment.',
        '\\$request->all\\(\\)',
      ),
      wajibStruktur(
        'status-201',
        'Response `store()` memakai status `201`',
        'Belum ada status `201`. Klien memakainya untuk membedakan data yang baru dibuat dari response biasa.',
        '201',
      ),
    ]),
  }),

  soal({
    slug: 'form-request-rules',
    title: 'Aturan validasi di Form Request',
    topic: 'endpoint',
    level: 'basic',
    realWorldUse:
      'Mengumpulkan aturan validasi di satu tempat yang terpisah dari controller, supaya aturan yang sama tidak ditulis ulang di setiap endpoint yang menyentuh data itu.',
    source: { category: 'backend-basic', chapter: 'php-laravel-basic' },
    brief: {
      situation:
        'Controller `store()` di soal sebelumnya memakai `SimpanCatatanRequest`. Sekarang kamu menulis class itu. Isinya aturan untuk data catatan yang dikirim klien, yaitu judul wajib diisi dan tidak boleh terlalu panjang, lalu isi juga wajib diisi. Kalau datanya melanggar, Laravel otomatis menolaknya dengan pesan error sebelum controller dijalankan.',
      tasks: [
        'Tulis class `SimpanCatatanRequest` yang mewarisi `FormRequest`.',
        'Isi method `authorize()` supaya mengembalikan `true`.',
        'Isi method `rules()` dengan aturan `judul` wajib, berupa string, dan maksimal 200 karakter.',
        'Tambahkan aturan `isi` wajib dan berupa string.',
      ],
      pitfalls: [
        '`authorize()` harus mengembalikan sesuatu secara eksplisit. Kalau tidak, bawaannya menolak setiap request dengan status 403.',
        'Batas `max:` bukan formalitas. Tanpa batas, satu request bisa mengirim teks berukuran megabyte ke kolom yang dirancang untuk satu baris judul, lalu database menolaknya dengan error 500.',
      ],
      terms: [
        {
          term: 'Form Request',
          meaning:
            'Class khusus Laravel untuk menampung aturan validasi sebuah request. Kalau class ini ditulis sebagai tipe parameter di controller, Laravel menjalankan validasinya otomatis. Kalau gagal, Laravel langsung mengirim response error berisi daftar field yang bermasalah.',
        },
        {
          term: 'rules()',
          meaning:
            'Method di Form Request yang mengembalikan array aturan. Key-nya nama field dan nilainya aturan yang dipisahkan tanda garis tegak, misalnya `"judul" => "required|string|max:200"`. Setiap aturan diperiksa berurutan.',
        },
        {
          term: 'authorize()',
          meaning:
            'Method di Form Request yang memutuskan apakah pengguna boleh mengirim request ini. Kalau mengembalikan `false`, Laravel menjawab 403 Forbidden. Untuk sementara boleh `true`, tapi pemeriksaan hak akses yang sebenarnya tetap harus dilakukan, misalnya lewat Policy.',
        },
      ],
    },
    rules: [
      'Class mewarisi `FormRequest`.',
      'Punya method `rules()` dan `authorize()`.',
      '`judul` wajib, berupa string, dan punya batas `max:`.',
      '`isi` wajib dan berupa string.',
    ],
    starter: `
      class SimpanCatatanRequest extends FormRequest
      {
          public function authorize(): bool
          {
              //
          }

          public function rules(): array
          {
              //
          }
      }
    `,
    hints: [
      '`rules()` mengembalikan array dengan nama field sebagai key dan aturannya sebagai nilai.',
      'Aturan bisa ditulis sebagai satu string yang dipisahkan tanda garis tegak, atau sebagai array of string.',
      'Bentuknya `"judul" => "required|string|max:200"`.',
    ],
    solution: {
      code: `
        class SimpanCatatanRequest extends FormRequest
        {
            public function authorize(): bool
            {
                // Tanpa ini, setiap request ditolak dengan 403.
                return true;
            }

            public function rules(): array
            {
                return [
                    // max:200 disamakan dengan panjang kolom judul di database.
                    'judul' => 'required|string|max:200',
                    'isi' => 'required|string',
                ];
            }
        }
      `,
      steps: [
        '`class SimpanCatatanRequest extends FormRequest` membuat Form Request baru.',
        '`authorize()` mengembalikan `true`, sehingga request boleh diproses.',
        '`rules()` mengembalikan array berisi aturan untuk setiap field.',
        '`"required|string|max:200"` berarti judul wajib diisi, harus berupa teks, dan paling panjang 200 karakter.',
        '`"required|string"` berarti isi wajib diisi dan harus berupa teks.',
      ],
      explanation:
        '`max:200` disamakan dengan panjang kolom di migration, dan itu disengaja. Kalau validasi mengizinkan teks yang lebih panjang daripada yang muat di database, yang terjadi bukan pesan validasi yang rapi, melainkan error database. Hasilnya error 500 di layar pengguna untuk kesalahan yang sebenarnya bisa dijelaskan.',
    },
    alternativeSolutions: [
      `
        class SimpanCatatanRequest extends FormRequest
        {
            public function authorize(): bool
            {
                return $this->user() !== null;
            }

            public function rules(): array
            {
                return [
                    'judul' => ['required', 'string', 'max:200'],
                    'isi' => ['required', 'string'],
                ];
            }

            public function messages(): array
            {
                return ['judul.required' => 'Judul wajib diisi.'];
            }
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          class SimpanCatatanRequest extends FormRequest
          {
              public function authorize(): bool
              {
                  return true;
              }

              public function rules(): array
              {
                  return [
                      'judul' => 'required|string',
                      'isi' => 'required|string',
                  ];
              }
          }
        `,
        reason:
          'Tanpa `max:`, judul sepanjang apa pun lolos validasi lalu ditolak database dengan error 500.',
      },
      {
        code: `
          class SimpanCatatanRequest extends FormRequest
          {
              public function rules(): array
              {
                  return [
                      'judul' => 'required|string|max:200',
                  ];
              }
          }
        `,
        reason: 'Field `isi` tidak divalidasi sama sekali, dan method `authorize()` tidak ada.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'extends-formrequest',
        'Class mewarisi `FormRequest`',
        'Form Request harus mewarisi class `FormRequest` milik Laravel.',
        'extends\\s+FormRequest',
      ),
      wajibStruktur(
        'ada-authorize',
        'Punya method `authorize()`',
        'Tanpa `authorize()`, bawaannya menolak semua request dengan status 403.',
        'function\\s+authorize\\s*\\(',
      ),
      wajibStruktur(
        'ada-rules',
        'Punya method `rules()`',
        'Belum ada method `rules()` yang mengembalikan aturan validasi.',
        'function\\s+rules\\s*\\(',
      ),
      wajibStruktur(
        'judul-required',
        'Ada aturan untuk field `judul`',
        'Belum ada aturan untuk `judul`. Setiap field yang diterima harus punya aturannya sendiri.',
        '[\'"]judul[\'"]\\s*=>',
      ),
      wajibStruktur(
        'ada-max',
        'Judul punya batas panjang',
        'Belum ada `max:` pada judul. Tanpa batas, teks berukuran megabyte lolos validasi lalu ditolak database sebagai error 500.',
        'max:\\d+',
      ),
      wajibStruktur(
        'isi-required',
        'Ada aturan untuk field `isi`',
        'Belum ada aturan untuk `isi`. Field yang tidak divalidasi sama saja dengan field yang tidak diperiksa.',
        '[\'"]isi[\'"]\\s*=>',
      ),
    ]),
  }),

  soal({
    slug: 'relasi-eloquent',
    title: 'Relasi `hasMany` dan `belongsTo`',
    topic: 'endpoint',
    level: 'basic',
    realWorldUse:
      'Hampir setiap model punya relasi. Mendefinisikannya di kedua arah membuat data bisa dibaca dari sisi mana pun yang paling masuk akal saat itu.',
    source: { category: 'backend-basic', chapter: 'php-laravel-basic' },
    brief: {
      situation:
        'Setiap catatan dimiliki oleh satu pengguna, dan satu pengguna bisa punya banyak catatan. Di database, hubungan ini disimpan lewat kolom `user_id` di tabel `catatan`. Di kode, kamu ingin bisa menulis `$user->catatan` untuk mengambil semua catatan milik seseorang, dan `$catatan->user` untuk tahu siapa pemilik sebuah catatan.',
      tasks: [
        'Tambahkan method `catatan()` di model `User` yang mengembalikan relasi `hasMany` ke `Catatan`.',
        'Tambahkan method `user()` di model `Catatan` yang mengembalikan relasi `belongsTo` ke `User`.',
        'Tulis tipe kembalian kedua method, yaitu `HasMany` dan `BelongsTo`.',
      ],
      pitfalls: [
        '`belongsTo` selalu ditaruh di model yang MENYIMPAN foreign key. Di sini kolom `user_id` ada di tabel `catatan`, jadi `belongsTo` ada di model `Catatan`. Menaruhnya terbalik menghasilkan error tentang kolom yang tidak ada.',
        'Tulis tipe kembaliannya. Tanpa tipe, editor dan PHPStan tidak tahu apa yang dikembalikan, sehingga salah ketik nama relasi baru ketahuan saat kode dijalankan.',
      ],
      terms: [
        {
          term: 'hasMany',
          meaning:
            'Relasi satu ke banyak, dilihat dari sisi "satu". Satu `User` punya banyak `Catatan`. Setelah didefinisikan, `$user->catatan` langsung berisi koleksi semua catatan milik pengguna itu, tanpa perlu menulis query sendiri.',
        },
        {
          term: 'belongsTo',
          meaning:
            'Relasi yang sama, dilihat dari sisi "banyak". Setiap `Catatan` dimiliki oleh satu `User`. Setelah didefinisikan, `$catatan->user` berisi objek pengguna pemiliknya. Relasi ini membaca kolom `user_id` di tabel catatan.',
        },
        {
          term: 'foreign key',
          meaning:
            'Kolom yang menyimpan id dari tabel lain, sebagai penanda hubungan antar tabel. Kolom `user_id` di tabel `catatan` adalah foreign key yang menunjuk ke kolom `id` di tabel `users`. Laravel menebak nama kolom ini dari nama modelnya.',
        },
      ],
    },
    rules: [
      '`User` punya method `catatan()` yang mengembalikan `hasMany`.',
      '`Catatan` punya method `user()` yang mengembalikan `belongsTo`.',
      'Kedua method menuliskan tipe kembaliannya.',
    ],
    starter: `
      class User extends Authenticatable
      {
          // satu user punya banyak catatan
      }

      class Catatan extends Model
      {
          // satu catatan dimiliki satu user
      }
    `,
    hints: [
      'Nama method menentukan cara memanggilnya nanti, yaitu `$user->catatan` dan `$catatan->user`.',
      '`hasMany` dipakai di sisi yang memiliki banyak, sedangkan `belongsTo` dipakai di sisi yang menyimpan foreign key.',
      'Bentuknya `return $this->hasMany(Catatan::class);`.',
    ],
    solution: {
      code: `
        class User extends Authenticatable
        {
            // Satu user punya BANYAK catatan. Dipakai sebagai $user->catatan
            public function catatan(): HasMany
            {
                return $this->hasMany(Catatan::class);
            }
        }

        class Catatan extends Model
        {
            // Tabel catatan MENYIMPAN user_id, jadi sisi ini memakai belongsTo.
            // Dipakai sebagai $catatan->user
            public function user(): BelongsTo
            {
                return $this->belongsTo(User::class);
            }
        }
      `,
      steps: [
        'Di model `User`, method `catatan()` mengembalikan `$this->hasMany(Catatan::class)`.',
        'Tipe kembalian `: HasMany` memberi tahu editor bahwa method ini menghasilkan relasi satu ke banyak.',
        'Di model `Catatan`, method `user()` mengembalikan `$this->belongsTo(User::class)`, karena tabel catatan yang menyimpan `user_id`.',
        'Setelah itu `$user->catatan` berisi semua catatan milik pengguna itu, dan `$catatan->user` berisi pemiliknya.',
      ],
      explanation:
        'Sisi `belongsTo` selalu yang menyimpan foreign key, dan di sini tabel `catatan` punya kolom `user_id`. Menaruhnya terbalik menghasilkan kode yang tetap berjalan sampai query pertama, lalu gagal dengan pesan tentang kolom yang tidak ada.',
    },
    alternativeSolutions: [
      `
        class User extends Authenticatable
        {
            public function catatan(): HasMany
            {
                return $this->hasMany(Catatan::class, 'user_id', 'id');
            }
        }

        class Catatan extends Model
        {
            public function user(): BelongsTo
            {
                return $this->belongsTo(User::class, 'user_id');
            }
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          class User extends Authenticatable
          {
              public function catatan()
              {
                  return $this->hasMany(Catatan::class);
              }
          }

          class Catatan extends Model
          {
              public function user()
              {
                  return $this->belongsTo(User::class);
              }
          }
        `,
        reason:
          'Tidak menuliskan tipe kembalian, sehingga editor dan PHPStan tidak bisa membantu menemukan salah ketik.',
      },
      {
        code: `
          class User extends Authenticatable
          {
              public function catatan(): HasMany
              {
                  return $this->hasMany(Catatan::class);
              }
          }
        `,
        reason:
          'Hanya satu arah relasi yang didefinisikan, sehingga pemilik sebuah catatan tidak bisa dibaca.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'ada-hasmany',
        '`User` punya relasi `hasMany`',
        'Belum ada `$this->hasMany(Catatan::class)` di dalam method `catatan()`.',
        '\\$this->hasMany\\s*\\(\\s*Catatan::class',
      ),
      wajibStruktur(
        'ada-belongsto',
        '`Catatan` punya relasi `belongsTo`',
        'Belum ada `$this->belongsTo(User::class)` di dalam method `user()`. Relasi satu arah membuat data hanya bisa dibaca dari satu sisi.',
        '\\$this->belongsTo\\s*\\(\\s*User::class',
      ),
      wajibStruktur(
        'tipe-hasmany',
        'Method `catatan()` menuliskan tipe `HasMany`',
        'Belum ada `: HasMany` sebagai tipe kembalian. Tanpa itu, salah ketik nama relasi baru ketahuan saat kode dijalankan.',
        'function\\s+catatan\\s*\\(\\s*\\)\\s*:\\s*HasMany',
      ),
      wajibStruktur(
        'tipe-belongsto',
        'Method `user()` menuliskan tipe `BelongsTo`',
        'Belum ada `: BelongsTo` sebagai tipe kembalian pada method `user()`.',
        'function\\s+user\\s*\\(\\s*\\)\\s*:\\s*BelongsTo',
      ),
    ]),
  }),

  soal({
    slug: 'eloquent-where-firstorfail',
    title: 'Query Eloquent dengan `where` dan `firstOrFail`',
    topic: 'endpoint',
    level: 'basic',
    realWorldUse:
      'Mengambil satu data milik pengguna tertentu. Hasilnya dibatasi ke pemiliknya, dan data yang tidak ditemukan menghasilkan 404, bukan 500.',
    source: { category: 'backend-basic', chapter: 'php-laravel-basic' },
    brief: {
      situation:
        'Endpoint `GET /catatan/{id}` menampilkan satu catatan. Ani login lalu membuka catatan nomor 5 miliknya. Lalu ia iseng mengganti angka di URL menjadi 6, dan catatan nomor 6 itu milik Budi. Kalau query-nya hanya mencari berdasarkan id, Ani bisa membaca catatan pribadi Budi. Query-nya harus memastikan catatan itu memang milik pengguna yang sedang login.',
      tasks: [
        'Tulis method `show()` yang mengambil satu catatan berdasarkan `$id`.',
        'Saring juga berdasarkan `user_id` milik pengguna yang sedang login, yaitu `$request->user()->id`.',
        'Pakai `firstOrFail()`, sehingga catatan yang tidak ditemukan menghasilkan 404.',
      ],
      pitfalls: [
        'Saring `user_id` di database, SEBELUM data diambil. Tanpa penyaringan ini, siapa pun yang menebak sebuah id bisa membaca catatan orang lain. Celah ini disebut IDOR.',
        'Pakai `firstOrFail()`, bukan `first()`. `first()` mengembalikan `null` saat tidak ketemu, lalu baris berikutnya yang menyentuh `null` itu gagal dengan error 500, padahal yang sebenarnya terjadi hanya "tidak ada".',
      ],
      terms: [
        {
          term: 'firstOrFail()',
          meaning:
            'Method Eloquent yang mengambil satu data pertama yang cocok, atau melempar `ModelNotFoundException` kalau tidak ada. Laravel otomatis mengubah exception itu menjadi response 404 Not Found. Pasangannya `first()` mengembalikan `null` saat tidak ketemu.',
        },
        {
          term: 'IDOR',
          meaning:
            'Singkatan dari Insecure Direct Object Reference. Ini celah keamanan ketika server menyerahkan data hanya berdasarkan id dari klien tanpa memeriksa kepemilikannya. Contohnya mengganti `/catatan/5` menjadi `/catatan/6` di URL lalu bisa membaca catatan orang lain.',
        },
        {
          term: 'query builder',
          meaning:
            'Cara menyusun query database dengan memanggil method secara berantai. `Catatan::query()->where(...)->where(...)->firstOrFail()` dibaca dari kiri ke kanan, yaitu mulai query, saring, saring lagi, lalu ambil satu. Query baru benar-benar dijalankan pada method terakhir.',
        },
      ],
    },
    rules: [
      'Menyaring berdasarkan `user_id` milik pengguna yang sedang login.',
      'Memakai `firstOrFail()`, bukan `first()`.',
      'Penyaringan dilakukan sebelum data diambil.',
    ],
    starter: `
      public function show(Request $request, int $id)
      {
          // ambil satu catatan milik pengguna yang sedang login
      }
    `,
    hints: [
      'Rangkaian query dibaca dari kiri ke kanan, yaitu saring dulu, lalu ambil.',
      '`$request->user()->id` memberi id pengguna yang sedang login.',
      '`firstOrFail()` melempar exception yang otomatis diubah Laravel menjadi status 404.',
    ],
    solution: {
      code: `
        public function show(Request $request, int $id)
        {
            return Catatan::query()
                ->where('id', $id)
                // Wajib. Tanpa baris ini siapa pun bisa membaca catatan orang lain (IDOR).
                ->where('user_id', $request->user()->id)
                // Tidak ketemu? Laravel otomatis menjawab 404, bukan error 500.
                ->firstOrFail();
        }
      `,
      steps: [
        '`Catatan::query()` memulai penyusunan query untuk tabel catatan.',
        '`->where("id", $id)` menyaring catatan dengan id yang diminta.',
        '`->where("user_id", $request->user()->id)` menyaring lagi, supaya hanya catatan milik pengguna yang login yang bisa cocok.',
        '`->firstOrFail()` menjalankan query. Kalau ada yang cocok, catatan itu dikembalikan. Kalau tidak ada, Laravel menjawab 404.',
        'Catatan milik orang lain tidak pernah cocok, sehingga hasilnya juga 404, dan penyerang tidak bisa tahu apakah catatan itu ada.',
      ],
      explanation:
        'Penyaringan `user_id` terjadi di database, bukan sesudah data diambil. Bedanya bukan soal kecepatan, melainkan soal hak akses. Kalau data diambil dulu lalu kepemilikannya diperiksa di PHP, catatan orang lain sempat berada di memori, dan satu baris yang lupa memeriksa sudah cukup untuk membocorkannya.',
    },
    alternativeSolutions: [
      `
        public function show(Request $request, int $id)
        {
            return $request->user()
                ->catatan()
                ->where('id', $id)
                ->firstOrFail();
        }
      `,
      `
        public function show(Request $request, int $id)
        {
            $catatan = Catatan::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->firstOrFail();

            return response()->json($catatan);
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          public function show(Request $request, int $id)
          {
              return Catatan::where('id', $id)->first();
          }
        `,
        reason:
          'Tidak menyaring pemilik, sehingga catatan orang lain bisa dibaca, dan `first()` mengembalikan `null` yang berujung error 500.',
      },
      {
        code: `
          public function show(Request $request, int $id)
          {
              return Catatan::query()
                  ->where('id', $id)
                  ->where('user_id', $request->user()->id)
                  ->first();
          }
        `,
        reason:
          'Pemeriksaan pemiliknya sudah benar, tapi `first()` tetap mengembalikan `null` alih-alih status 404.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'saring-user',
        'Menyaring berdasarkan pemiliknya',
        'Belum ada penyaringan `user_id`. Tanpa itu, siapa pun yang menebak sebuah id bisa membaca catatan orang lain.',
        'user_id|->catatan\\(\\)',
      ),
      wajibStruktur(
        'pakai-firstorfail',
        'Memakai `firstOrFail()`',
        'Belum memakai `firstOrFail()`. `first()` mengembalikan `null` saat tidak ketemu, lalu baris berikutnya yang menyentuhnya gagal dengan error 500 alih-alih 404.',
        '->firstOrFail\\s*\\(\\)',
      ),
      larangStruktur(
        'tanpa-first-polos',
        'Tidak memakai `first()` saja',
        '`first()` tanpa penanganan `null` menghasilkan error 500 untuk sesuatu yang seharusnya 404.',
        '->first\\s*\\(\\s*\\)',
      ),
      urutStruktur(
        'saring-dulu',
        'Penyaringan dilakukan sebelum data diambil',
        'Penyaringan harus terjadi di database, sebelum data diambil, bukan sesudahnya di PHP.',
        ['->where\\s*\\(|->catatan\\s*\\(', '->firstOrFail\\s*\\('],
      ),
    ]),
  }),

  soal({
    slug: 'api-resource',
    title: 'API Resource untuk membentuk response',
    topic: 'endpoint',
    level: 'basic',
    realWorldUse:
      'Menentukan kolom mana yang boleh keluar dari server. Mengembalikan model apa adanya berarti setiap kolom baru yang ditambahkan nanti ikut terkirim tanpa ada yang memutuskannya.',
    source: { category: 'backend-basic', chapter: 'php-laravel-basic' },
    brief: {
      situation:
        'Tabel catatan punya beberapa kolom yang hanya untuk keperluan internal, misalnya catatan moderasi dari admin. Kalau controller mengembalikan model `Catatan` apa adanya, semua kolom itu ikut terkirim ke klien. Bulan depan ada yang menambahkan kolom baru ke tabel, dan kolom itu juga ikut terkirim tanpa ada yang sadar. API Resource adalah tempat kamu memilih secara eksplisit apa yang boleh keluar.',
      tasks: [
        'Tulis class `CatatanResource` yang mewarisi `JsonResource`.',
        'Isi method `toArray()` supaya mengembalikan array berisi `id`, `judul`, `isi`, dan `dibuat_pada`.',
        '`dibuat_pada` diambil dari kolom `created_at`.',
      ],
      pitfalls: [
        'Jangan memakai `parent::toArray($request)`. Bentuk itu mengembalikan SEMUA kolom model, termasuk kolom internal dan kolom yang belum ada hari ini.',
        'Nama key di response boleh berbeda dengan nama kolom di database. `dibuat_pada` untuk klien, sedangkan `created_at` tetap di database. Pemisahan ini membuat struktur database bisa diubah tanpa merusak aplikasi klien.',
      ],
      terms: [
        {
          term: 'API Resource',
          meaning:
            'Class Laravel yang mengubah model menjadi data JSON untuk dikirim ke klien. Ia bekerja seperti lapisan penerjemah antara bentuk data di database dan bentuk data yang dijanjikan ke klien. Dipakai dengan `new CatatanResource($catatan)` di controller.',
        },
        {
          term: 'toArray()',
          meaning:
            'Method di API Resource yang menentukan isi JSON-nya. Array yang dikembalikan method ini langsung menjadi response. Di dalamnya, `$this` menunjuk ke model yang sedang dibungkus, sehingga `$this->judul` berarti judul catatan itu.',
        },
        {
          term: 'data leak',
          meaning:
            'Data yang tidak seharusnya terlihat tapi ikut terkirim ke klien. Kebocoran lewat response API sering tidak disadari, karena tampilan aplikasi hanya menampilkan sebagian field. Padahal siapa pun bisa membuka tab Network di browser dan melihat seluruh isinya.',
        },
      ],
    },
    rules: [
      'Class mewarisi `JsonResource`.',
      'Punya method `toArray()`.',
      'Menyebut field satu per satu, tanpa `parent::toArray()`.',
    ],
    starter: `
      class CatatanResource extends JsonResource
      {
          public function toArray(Request $request): array
          {
              //
          }
      }
    `,
    hints: [
      'Di dalam resource, `$this` menunjuk ke model yang sedang dibungkus.',
      'Key array hasilnya adalah nama field yang akan dilihat klien.',
      'Contohnya `"dibuat_pada" => $this->created_at,`.',
    ],
    solution: {
      code: `
        class CatatanResource extends JsonResource
        {
            public function toArray(Request $request): array
            {
                // Hanya field yang disebut di sini yang keluar dari server.
                // Kolom baru di database TIDAK otomatis ikut terkirim.
                return [
                    'id' => $this->id,
                    'judul' => $this->judul,
                    'isi' => $this->isi,
                    'dibuat_pada' => $this->created_at, // nama untuk klien boleh beda
                ];
            }
        }
      `,
      steps: [
        '`class CatatanResource extends JsonResource` membuat API Resource untuk model catatan.',
        '`toArray()` mengembalikan array yang akan menjadi isi JSON response.',
        '`$this->id`, `$this->judul`, dan `$this->isi` membaca kolom dari model catatan yang sedang dibungkus.',
        '`"dibuat_pada" => $this->created_at` memberi nama baru untuk klien, tanpa mengubah nama kolom di database.',
        'Kolom lain di tabel catatan tidak disebut, sehingga tidak ikut terkirim.',
      ],
      explanation:
        'Menyebut field satu per satu memang terasa lebih panjang daripada `parent::toArray($request)`. Itulah gunanya. Daftar ini adalah janji kepada klien yang hanya bisa diubah dengan sengaja. Tanpa daftar ini, menambahkan kolom `catatan_internal` ke migration sudah cukup untuk menyebarkannya ke publik.',
    },
    alternativeSolutions: [
      `
        class CatatanResource extends JsonResource
        {
            public function toArray(Request $request): array
            {
                return [
                    'id' => $this->id,
                    'judul' => $this->judul,
                    'isi' => $this->isi,
                    'dibuat_pada' => $this->created_at->toIso8601String(),
                    'penulis' => new UserResource($this->whenLoaded('user')),
                ];
            }
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          class CatatanResource extends JsonResource
          {
              public function toArray(Request $request): array
              {
                  return parent::toArray($request);
              }
          }
        `,
        reason:
          'Mengembalikan semua kolom model, termasuk kolom internal dan kolom yang ditambahkan orang lain nanti.',
      },
      {
        code: `
          class CatatanResource extends JsonResource
          {
              public function toArray(Request $request): array
              {
                  return [
                      'id' => $this->id,
                      'judul' => $this->judul,
                  ];
              }
          }
        `,
        reason: 'Field `isi` dan `dibuat_pada` tidak ikut dikirim ke klien.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'extends-jsonresource',
        'Class mewarisi `JsonResource`',
        'API Resource harus mewarisi class `JsonResource` milik Laravel.',
        'extends\\s+JsonResource',
      ),
      wajibStruktur(
        'ada-toarray',
        'Punya method `toArray()`',
        'Belum ada method `toArray()` yang menentukan bentuk response.',
        'function\\s+toArray\\s*\\(',
      ),
      larangStruktur(
        'tanpa-parent-toarray',
        'Tidak memakai `parent::toArray()`',
        '`parent::toArray($request)` mengembalikan SEMUA kolom model. Setiap kolom yang ditambahkan ke migration nanti akan ikut terkirim tanpa ada yang memutuskannya.',
        'parent::toArray',
      ),
      wajibStruktur(
        'field-judul',
        'Menyebut field `judul`',
        'Field `judul` belum disebut di array hasil.',
        '[\'"]judul[\'"]\\s*=>',
      ),
      wajibStruktur(
        'field-isi',
        'Menyebut field `isi`',
        'Field `isi` belum disebut di array hasil.',
        '[\'"]isi[\'"]\\s*=>',
      ),
      wajibStruktur(
        'field-dibuat-pada',
        'Menyebut `dibuat_pada` dari `created_at`',
        'Field `dibuat_pada` belum ada, atau belum diambil dari `$this->created_at`.',
        '[\'"]dibuat_pada[\'"]\\s*=>',
      ),
    ]),
  }),
];
