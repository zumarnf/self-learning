import {
  larangStruktur,
  mesinStruktur,
  soal,
  urutStruktur,
  wajibStruktur,
} from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * Laravel — Intermediate, exercises 35–40 plus the transaction exercise.
 *
 * Shapes that separate an app that works on a laptop from one that survives real traffic and
 * real users: eager loading, reusable query scopes, per-record authorization, caching, moving
 * slow work off the request, a test that keeps an endpoint from breaking quietly, and writes that
 * must succeed or fail together.
 *
 * Two of them (policy, N+1) are the ones the curriculum itself gives extra room, because both are
 * invisible until they are expensive.
 */

export const exercises: Exercise[] = [
  soal({
    slug: 'eager-loading',
    title: 'Eager loading untuk menghapus N+1 query',
    topic: 'optimasi',
    level: 'intermediate',
    realWorldUse:
      'Halaman daftar yang menampilkan data relasi, misalnya 50 catatan beserta nama penulisnya. Tanpa eager loading itu berarti 51 query, dan halamannya makin lambat seiring datanya bertambah.',
    source: { category: 'backend-intermediate', chapter: 'laravel-intermediate' },
    brief: {
      situation:
        'Halaman daftar catatan menampilkan judul setiap catatan beserta nama penulisnya. Di komputermu dengan sepuluh catatan, halaman itu cepat. Di server produksi dengan ribuan catatan, halaman yang sama terasa lambat, padahal kodenya tidak berubah. Penyebabnya, setiap kali nama penulis dibaca, Laravel diam-diam menjalankan satu query baru ke database.',
      tasks: [
        'Tulis method `index()` yang mengambil semua catatan BESERTA relasi `user`-nya.',
        'Pakai `with("user")` supaya data penulis diambil sekaligus dalam satu query tambahan.',
        'Panggil `with()` SEBELUM `get()`.',
      ],
      pitfalls: [
        '`with()` harus dipanggil sebelum `get()`. Setelah `get()`, datanya sudah terlanjur diambil, jadi `with()` tidak melakukan apa-apa.',
        'Jangan memanggil `load()` di dalam `foreach`. Itu sama saja menulis N+1 query dengan sengaja, satu query untuk setiap baris.',
        'N+1 query tidak pernah terlihat saat development dengan sepuluh data. Ia baru terlihat di produksi, sebagai halaman yang makin lama makin lambat tanpa ada kode yang berubah.',
      ],
      terms: [
        {
          term: 'N+1 query',
          meaning:
            'Masalah performa ketika aplikasi menjalankan 1 query untuk mengambil daftar, lalu N query lagi, satu untuk setiap baris, demi mengambil data relasinya. Dengan 50 catatan, itu berarti 51 query. Jumlahnya tumbuh seiring jumlah data.',
        },
        {
          term: 'lazy loading',
          meaning:
            'Perilaku bawaan Eloquent yang baru mengambil data relasi saat relasi itu disentuh, misalnya saat `$catatan->user->name` dibaca. Praktis untuk satu data, tapi di dalam loop setiap sentuhan menjadi satu query baru. Inilah penyebab N+1 query.',
        },
        {
          term: 'eager loading',
          meaning:
            'Mengambil data relasi di depan, bersamaan dengan data utamanya, lewat `with()`. `Catatan::with("user")->get()` hanya menjalankan 2 query, yaitu satu untuk semua catatan dan satu untuk semua penulisnya, berapa pun jumlah catatannya.',
        },
      ],
    },
    rules: [
      'Memakai `with()` untuk memuat relasi `user`.',
      '`with()` dipanggil sebelum `get()`.',
      'Dilarang memuat relasi di dalam loop.',
    ],
    starter: `
      public function index()
      {
          // ambil semua catatan beserta penulisnya
      }
    `,
    hints: [
      'Eloquent memuat relasi secara malas, yaitu baru menjalankan query saat relasinya disentuh.',
      '`with()` memberi tahu Eloquent relasi apa saja yang akan dipakai, sebelum datanya diambil.',
      'Bentuknya `Catatan::with("user")->get()`.',
    ],
    solution: {
      code: `
        public function index()
        {
            return Catatan::query()
                ->with('user') // ambil semua penulis sekaligus di depan
                ->latest()
                ->get(); // total hanya 2 query, berapa pun jumlah catatannya
        }
      `,
      steps: [
        '`Catatan::query()` memulai penyusunan query untuk tabel catatan.',
        '`->with("user")` meminta Eloquent mengambil data penulis sekaligus, alih-alih satu per satu nanti.',
        '`->latest()` mengurutkan catatan dari yang terbaru.',
        '`->get()` menjalankan query. Laravel mengambil semua catatan dalam query pertama, lalu semua penulisnya dalam query kedua.',
        'Saat halaman membaca `$catatan->user->name`, datanya sudah ada di memori, sehingga tidak ada query tambahan.',
      ],
      explanation:
        'Hanya dua query, berapa pun jumlah catatannya, yaitu satu untuk catatan dan satu untuk semua penulisnya sekaligus. Bandingkan dengan tanpa `with()`, yaitu satu query untuk catatan lalu satu query lagi untuk setiap baris saat nama penulisnya dibaca. Itulah N+1, dan jumlahnya tumbuh seiring jumlah data.',
    },
    alternativeSolutions: [
      `
        public function index()
        {
            return Catatan::with(['user'])->orderByDesc('created_at')->get();
        }
      `,
      `
        public function index()
        {
            return Catatan::query()
                ->with('user:id,name')
                ->get();
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          public function index()
          {
              return Catatan::all();
          }
        `,
        reason: 'Tanpa `with()`, setiap kali `$catatan->user` dibaca, satu query baru dijalankan.',
      },
      {
        code: `
          public function index()
          {
              $catatan = Catatan::get();

              foreach ($catatan as $item) {
                  $item->load('user');
              }

              return $catatan;
          }
        `,
        reason: 'Memuat relasi di dalam loop, yaitu N+1 query yang ditulis dengan sengaja.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'pakai-with',
        'Memakai `with()` untuk relasi `user`',
        'Belum ada `with("user")`. Tanpa itu, setiap akses ke relasi menjalankan query barunya sendiri.',
        '(->|::)with\\s*\\(\\s*\\[?\\s*[\'"]user',
      ),
      urutStruktur(
        'with-sebelum-get',
        '`with()` dipanggil sebelum `get()`',
        'Eager loading setelah `get()` tidak melakukan apa-apa, karena datanya sudah terlanjur diambil.',
        ['(->|::)with\\s*\\(', '->get\\s*\\('],
      ),
      larangStruktur(
        'tanpa-load-di-loop',
        'Tidak memuat relasi di dalam loop',
        'Memanggil `load()` di dalam `foreach` adalah N+1 query yang ditulis dengan sengaja.',
        'foreach[\\s\\S]{0,200}->load\\s*\\(',
      ),
    ]),
  }),

  soal({
    slug: 'query-scope',
    title: 'Query scope yang bisa dirangkai',
    topic: 'optimasi',
    level: 'intermediate',
    realWorldUse:
      'Filter yang dipakai berulang di banyak controller, misalnya "hanya yang sudah terbit" atau "hanya milik saya". Ditulis sekali di model, lalu dipakai di mana saja.',
    source: { category: 'backend-intermediate', chapter: 'laravel-intermediate' },
    brief: {
      situation:
        'Aplikasi blog punya catatan berstatus `draft` dan `terbit`. Halaman beranda, halaman arsip, feed RSS, dan sitemap semuanya hanya boleh menampilkan yang sudah terbit. Kalau setiap controller menulis `where("status", "terbit")` sendiri, cepat atau lambat ada satu tempat yang lupa, dan draft yang belum selesai tampil ke publik.',
      tasks: [
        'Tambahkan query scope bernama `terbit` di model `Catatan`.',
        'Scope itu menerima `Builder $query` dan menyaring baris dengan `status` bernilai `"terbit"`.',
        'Kembalikan `$query` supaya scope bisa dirangkai, misalnya `Catatan::terbit()->latest()->get()`.',
      ],
      pitfalls: [
        'Kembalikan `$query`, bukan hasil akhirnya. Scope yang memanggil `get()` di dalamnya memutus rangkaian query, sehingga pemanggil tidak bisa lagi menambahkan pagination atau pengurutan.',
        'Nama method-nya harus diawali `scope`, yaitu `scopeTerbit`. Dari awalan itulah Laravel mengenalinya, lalu kamu memanggilnya tanpa awalan sebagai `Catatan::terbit()`.',
      ],
      terms: [
        {
          term: 'query scope',
          meaning:
            'Potongan query yang diberi nama lalu disimpan di model supaya bisa dipakai ulang. Method `scopeTerbit` bisa dipanggil sebagai `Catatan::terbit()`. Aturan "apa artinya terbit" jadi hanya ditulis di satu tempat.',
        },
        {
          term: 'Builder',
          meaning:
            'Objek yang dipakai Eloquent untuk menyusun query sebelum dijalankan. Selama masih berupa Builder, kamu bisa terus menambahkan `where()`, `orderBy()`, atau `paginate()`. Query baru benar-benar dikirim ke database saat method seperti `get()` dipanggil.',
        },
        {
          term: 'method chaining',
          meaning:
            'Memanggil beberapa method secara berantai dalam satu baris, seperti `Catatan::terbit()->latest()->paginate(10)`. Ini hanya bisa dilakukan kalau setiap method mengembalikan objek yang punya method berikutnya. Itulah kenapa scope harus mengembalikan `$query`.',
        },
      ],
    },
    rules: [
      'Method dinamai `scopeTerbit`.',
      'Menerima `Builder $query` sebagai parameter pertama.',
      'Mengembalikan `$query`, bukan hasil akhirnya.',
    ],
    starter: `
      class Catatan extends Model
      {
          // tambahkan scope terbit di sini
      }
    `,
    hints: [
      'Laravel mengenali scope dari awalan nama method-nya.',
      'Method `scopeTerbit` dipanggil sebagai `Catatan::terbit()`.',
      'Tulis `return $query->where(...)`. Kembalikan Builder-nya, jangan panggil `get()` di dalam scope.',
    ],
    solution: {
      code: `
        class Catatan extends Model
        {
            // Awalan "scope" membuat Laravel mengenalinya. Dipanggil sebagai Catatan::terbit()
            public function scopeTerbit(Builder $query): Builder
            {
                // Kembalikan Builder-nya, supaya pemanggil masih bisa menambah latest(), paginate(), dan lainnya.
                return $query->where('status', 'terbit');
            }
        }
      `,
      steps: [
        '`public function scopeTerbit(Builder $query)` mendefinisikan scope. Laravel otomatis mengirim query yang sedang disusun ke parameter `$query`.',
        '`$query->where("status", "terbit")` menambahkan satu syarat ke query itu.',
        '`return` mengembalikan Builder yang sama, bukan hasil query.',
        'Pemanggil kini bisa menulis `Catatan::terbit()->latest()->paginate(10)`, dan setiap bagian rangkaian tetap bekerja.',
      ],
      explanation:
        'Yang dikembalikan adalah Builder-nya, bukan hasilnya. Itulah yang membuat scope bisa dirangkai dengan apa pun sesudahnya, seperti pagination, pengurutan, atau scope lain. Memanggil `get()` di dalam scope membuat setiap pemanggil menerima semua data sekaligus, sehingga pagination jadi tidak mungkin.',
    },
    alternativeSolutions: [
      `
        class Catatan extends Model
        {
            public function scopeTerbit(Builder $query): Builder
            {
                return $query->where('status', '=', 'terbit');
            }

            public function scopeMilik(Builder $query, int $userId): Builder
            {
                return $query->where('user_id', $userId);
            }
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          class Catatan extends Model
          {
              public function scopeTerbit(Builder $query)
              {
                  return $query->where('status', 'terbit')->get();
              }
          }
        `,
        reason:
          'Memanggil `get()` di dalam scope, sehingga rangkaian query terputus dan pagination tidak mungkin dilakukan.',
      },
      {
        code: `
          class Catatan extends Model
          {
              public function terbit(Builder $query): Builder
              {
                  return $query->where('status', 'terbit');
              }
          }
        `,
        reason: 'Tanpa awalan `scope`, Laravel tidak mengenalinya sebagai query scope.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'nama-scope',
        'Method dinamai `scopeTerbit`',
        'Laravel mengenali scope dari awalan nama method-nya. Tanpa awalan `scope`, `Catatan::terbit()` tidak akan bekerja.',
        'function\\s+scopeTerbit\\s*\\(',
      ),
      wajibStruktur(
        'parameter-builder',
        'Menerima `Builder $query`',
        'Parameter pertama sebuah scope selalu query builder-nya.',
        'scopeTerbit\\s*\\(\\s*Builder\\s+\\$query',
      ),
      wajibStruktur(
        'saring-status',
        'Menyaring status `terbit`',
        'Belum ada `where` pada kolom `status` dengan nilai `"terbit"`.',
        '->where\\s*\\([\\s\\S]{0,60}[\'"]terbit[\'"]',
      ),
      larangStruktur(
        'tanpa-get',
        'Tidak memanggil `get()` di dalam scope',
        '`get()` di dalam scope memutus rangkaian query, sehingga pemanggil tidak bisa lagi menambahkan pagination atau pengurutan.',
        '->get\\s*\\(\\s*\\)',
      ),
    ]),
  }),

  soal({
    slug: 'policy-authorize',
    title: 'Policy beserta pemanggilan `authorize`',
    topic: 'optimasi',
    level: 'intermediate',
    realWorldUse:
      'Membatasi siapa yang boleh mengubah sebuah data. Menyembunyikan tombol Edit di tampilan bukan pengamanan, karena server tetap harus menolak request dari orang yang tidak berhak.',
    source: { category: 'backend-intermediate', chapter: 'laravel-intermediate' },
    brief: {
      situation:
        'Tombol Edit hanya tampil di catatan milikmu sendiri. Tapi siapa pun bisa mengirim request `PUT /catatan/6` langsung, misalnya lewat Postman, tanpa melewati tampilan sama sekali. Kalau server tidak memeriksa kepemilikan, orang lain bisa mengubah catatan milikmu. Laravel menyediakan Policy sebagai tempat aturan "siapa boleh melakukan apa".',
      tasks: [
        'Tulis class `CatatanPolicy` dengan method `update(User $user, Catatan $catatan)`.',
        'Method itu mengembalikan `true` hanya kalau `$user->id` sama dengan `$catatan->user_id`, dibandingkan dengan `===`.',
        'Di method `update` pada controller, panggil `$this->authorize("update", $catatan)` sebagai baris PERTAMA, sebelum data diubah.',
      ],
      pitfalls: [
        'Policy yang ditulis tapi tidak pernah dipanggil adalah pengamanan yang terlihat ada padahal tidak berlaku. `authorize()` di controller itulah yang benar-benar menjalankannya.',
        'Panggil `authorize()` SEBELUM `update()`. Kalau sesudahnya, datanya sudah terlanjur berubah saat penolakan 403 dikirim.',
        'Pakai `===`, bukan `==`. Pada baris yang menentukan siapa boleh mengubah apa, perbandingan longgar bisa memberi hasil yang mengejutkan.',
      ],
      terms: [
        {
          term: 'Policy',
          meaning:
            'Class Laravel yang berisi aturan hak akses untuk satu jenis model. `CatatanPolicy` menjawab pertanyaan seperti "bolehkah user ini mengubah catatan ini". Setiap method mewakili satu aksi dan mengembalikan `true` atau `false`.',
        },
        {
          term: 'authorization',
          meaning:
            'Pemeriksaan apakah seseorang BOLEH melakukan sebuah aksi. Ia berbeda dengan authentication, yaitu pemeriksaan SIAPA orang itu, misalnya lewat login. Pengguna yang sudah login belum tentu boleh mengubah data milik orang lain.',
        },
        {
          term: '403 Forbidden',
          meaning:
            'Kode status HTTP yang berarti "kamu dikenali, tapi tidak boleh melakukan ini". `$this->authorize()` otomatis mengirim 403 kalau policy-nya mengembalikan `false`. Ia berbeda dengan 401 yang berarti "kamu belum login".',
        },
      ],
    },
    rules: [
      'Policy punya method `update(User $user, Catatan $catatan)`.',
      'Membandingkan kepemilikan dengan `===`.',
      'Controller memanggil `$this->authorize(...)`.',
    ],
    starter: `
      class CatatanPolicy
      {
          // izinkan hanya pemiliknya
      }

      class CatatanController extends Controller
      {
          public function update(SimpanCatatanRequest $request, Catatan $catatan)
          {
              // periksa hak akses sebelum mengubah apa pun
          }
      }
    `,
    hints: [
      'Method policy menerima pengguna yang sedang login sebagai parameter pertama.',
      'Kembalikan boolean, yaitu `true` kalau boleh dan `false` kalau tidak.',
      '`$this->authorize()` otomatis mengirim 403 kalau policy menolak, jadi tidak perlu menulis `if`.',
    ],
    solution: {
      code: `
        class CatatanPolicy
        {
            // Hanya pemilik catatan yang boleh mengubahnya.
            public function update(User $user, Catatan $catatan): bool
            {
                return $user->id === $catatan->user_id;
            }
        }

        class CatatanController extends Controller
        {
            public function update(SimpanCatatanRequest $request, Catatan $catatan)
            {
                // Baris PERTAMA. Bukan pemilik? Laravel langsung menjawab 403.
                $this->authorize('update', $catatan);

                // Sampai di sini, pasti pemiliknya.
                $catatan->update($request->validated());

                return response()->json($catatan);
            }
        }
      `,
      steps: [
        '`CatatanPolicy::update()` menerima pengguna yang login dan catatan yang ingin diubah.',
        '`$user->id === $catatan->user_id` bernilai `true` hanya kalau pengguna itu pemilik catatannya.',
        'Di controller, `$this->authorize("update", $catatan)` menjalankan method `update` milik policy.',
        'Kalau policy mengembalikan `false`, Laravel menghentikan request dan menjawab 403. Baris berikutnya tidak pernah dijalankan.',
        'Kalau `true`, barulah `$catatan->update(...)` menyimpan perubahan.',
      ],
      explanation:
        '`authorize()` dipanggil sebagai baris pertama, sebelum apa pun disentuh. Kalau diletakkan setelah `update()`, perubahannya sudah terjadi saat penolakan dikirim, sehingga response 403 datang terlambat untuk data yang sudah telanjur berubah.',
    },
    alternativeSolutions: [
      `
        class CatatanPolicy
        {
            public function update(User $user, Catatan $catatan): bool
            {
                return $catatan->user_id === $user->id;
            }
        }

        class CatatanController extends Controller
        {
            public function update(SimpanCatatanRequest $request, Catatan $catatan)
            {
                $this->authorize('update', $catatan);
                $catatan->fill($request->validated())->save();

                return new CatatanResource($catatan);
            }
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          class CatatanPolicy
          {
              public function update(User $user, Catatan $catatan): bool
              {
                  return $user->id == $catatan->user_id;
              }
          }

          class CatatanController extends Controller
          {
              public function update(SimpanCatatanRequest $request, Catatan $catatan)
              {
                  $this->authorize('update', $catatan);
                  $catatan->update($request->validated());

                  return response()->json($catatan);
              }
          }
        `,
        reason:
          'Memakai `==` pada baris yang menentukan hak akses, padahal perbandingan longgar bisa memberi hasil yang mengejutkan.',
      },
      {
        code: `
          class CatatanPolicy
          {
              public function update(User $user, Catatan $catatan): bool
              {
                  return $user->id === $catatan->user_id;
              }
          }

          class CatatanController extends Controller
          {
              public function update(SimpanCatatanRequest $request, Catatan $catatan)
              {
                  $catatan->update($request->validated());

                  return response()->json($catatan);
              }
          }
        `,
        reason:
          'Policy-nya sudah benar tapi tidak pernah dipanggil, sehingga pengamanannya terlihat ada padahal tidak berlaku.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'method-update',
        'Policy punya method `update(User $user, Catatan $catatan)`',
        'Belum ada method `update` yang menerima `User` dan `Catatan`.',
        'function\\s+update\\s*\\(\\s*User\\s+\\$user\\s*,\\s*Catatan\\s+\\$catatan',
      ),
      wajibStruktur(
        'banding-ketat',
        'Membandingkan kepemilikan dengan `===`',
        'Baris yang menentukan siapa boleh mengubah apa harus memakai `===`, bukan `==`.',
        '\\$user->id\\s*===\\s*\\$catatan->user_id|\\$catatan->user_id\\s*===\\s*\\$user->id',
      ),
      wajibStruktur(
        'panggil-authorize',
        'Controller memanggil `$this->authorize()`',
        'Policy yang tidak pernah dipanggil adalah pengamanan yang terlihat ada padahal tidak berlaku.',
        '\\$this->authorize\\s*\\(\\s*[\'"]update[\'"]',
      ),
      urutStruktur(
        'authorize-duluan',
        '`authorize()` dipanggil sebelum data diubah',
        'Memeriksa hak akses setelah `update()` berarti perubahannya sudah terjadi saat 403 dikirim.',
        ['\\$this->authorize\\s*\\(', '->update\\s*\\(\\s*\\$request|->fill\\s*\\(\\s*\\$request'],
      ),
    ]),
  }),

  soal({
    slug: 'cache-remember',
    title: '`Cache::remember` untuk query yang berat',
    topic: 'optimasi',
    level: 'intermediate',
    realWorldUse:
      'Halaman laporan dan daftar yang jarang berubah tapi sering dibuka. Menyimpan hasilnya sementara memindahkan beban dari database ke memori.',
    source: { category: 'backend-intermediate', chapter: 'laravel-intermediate' },
    brief: {
      situation:
        'Dashboard admin menampilkan rekap jumlah catatan per status. Query-nya menghitung seluruh isi tabel, dan dashboard itu dibuka ratusan kali sehari. Padahal angkanya hanya berubah sedikit dalam beberapa menit. Menjalankan query yang sama ratusan kali adalah pemborosan. Hasilnya bisa disimpan sementara di cache.',
      tasks: [
        'Bungkus query rekap dengan `Cache::remember`.',
        'Pakai key `"rekap-catatan"` dan masa berlaku 300 detik.',
        'Tulis query-nya DI DALAM closure yang diberikan ke `Cache::remember`.',
      ],
      pitfalls: [
        'Tulis masa berlakunya. `Cache::rememberForever` menyimpan selamanya, dan data yang tidak pernah kedaluwarsa suatu saat pasti salah tanpa ada yang tahu sejak kapan.',
        'Query-nya harus ditulis di dalam closure, bukan dijalankan lebih dulu lalu hasilnya diberikan. Kalau dijalankan lebih dulu, database tetap dipanggil setiap kali halaman dibuka, dan cache-nya kehilangan seluruh gunanya.',
      ],
      terms: [
        {
          term: 'cache',
          meaning:
            'Tempat penyimpanan sementara untuk hasil yang mahal dihitung, supaya permintaan berikutnya bisa langsung dijawab. Contoh sehari-harinya menyimpan nomor telepon yang sering dihubungi di daftar favorit, alih-alih mencarinya di buku telepon setiap kali.',
        },
        {
          term: 'TTL (time to live)',
          meaning:
            'Masa berlaku data di cache, biasanya dalam detik. Pada `Cache::remember("rekap", 300, ...)`, angka `300` adalah TTL, jadi data dianggap basi setelah 5 menit dan akan dihitung ulang. TTL yang lebih pendek berarti data lebih segar tapi lebih sering menghitung ulang.',
        },
        {
          term: 'closure',
          meaning:
            'Fungsi tanpa nama yang diberikan sebagai argumen, misalnya `function () { return ...; }`. `Cache::remember` hanya menjalankan closure ini kalau datanya belum ada di cache atau sudah kedaluwarsa. Itulah kenapa query-nya harus ada di dalam closure.',
        },
      ],
    },
    rules: [
      'Memakai `Cache::remember` dengan key `rekap-catatan`.',
      'Menulis masa berlaku, bukan `rememberForever`.',
      'Query ditulis di dalam closure.',
    ],
    starter: `
      public function rekap()
      {
          // simpan hasil rekap selama 300 detik
      }
    `,
    hints: [
      '`Cache::remember` menerima tiga hal, yaitu key, masa berlaku, dan closure yang menghasilkan datanya.',
      'Closure hanya dijalankan kalau cache-nya belum ada atau sudah kedaluwarsa.',
      'Bentuknya `Cache::remember("rekap-catatan", 300, function () { ... });`.',
    ],
    solution: {
      code: `
        public function rekap()
        {
            return Cache::remember('rekap-catatan', 300, function () {
                // Query ini HANYA dijalankan kalau cache kosong atau sudah lewat 300 detik.
                return Catatan::query()
                    ->selectRaw('status, count(*) as jumlah')
                    ->groupBy('status')
                    ->get();
            });
        }
      `,
      steps: [
        '`Cache::remember("rekap-catatan", 300, ...)` mencari data dengan key `rekap-catatan` di cache.',
        'Kalau data itu ada dan umurnya belum 300 detik, data langsung dikembalikan tanpa menyentuh database.',
        'Kalau belum ada atau sudah kedaluwarsa, closure dijalankan untuk menghitung rekapnya.',
        'Hasil closure disimpan ke cache selama 300 detik, lalu dikembalikan.',
        'Selama 5 menit berikutnya, semua pembukaan dashboard memakai hasil yang tersimpan itu.',
      ],
      explanation:
        'Query-nya berada di dalam closure, dan itu bukan soal gaya penulisan. Closure hanya dijalankan saat cache-nya kosong. Kalau query ditulis di luar lalu hasilnya diberikan, database tetap dipanggil setiap request, dan cache hanya menyimpan sesuatu yang sudah terlanjur dihitung.',
    },
    alternativeSolutions: [
      `
        public function rekap()
        {
            return Cache::remember('rekap-catatan', now()->addMinutes(5), fn () => Catatan::query()
                ->selectRaw('status, count(*) as jumlah')
                ->groupBy('status')
                ->get());
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          public function rekap()
          {
              return Cache::rememberForever('rekap-catatan', function () {
                  return Catatan::query()->selectRaw('status, count(*) as jumlah')->groupBy('status')->get();
              });
          }
        `,
        reason:
          'Disimpan selamanya dengan `rememberForever`, sehingga rekapnya tidak pernah diperbarui.',
      },
      {
        code: `
          public function rekap()
          {
              $rekap = Catatan::query()->selectRaw('status, count(*) as jumlah')->groupBy('status')->get();

              return Cache::remember('rekap-catatan', 300, function () use ($rekap) {
                  return $rekap;
              });
          }
        `,
        reason:
          'Query-nya dijalankan lebih dulu di luar closure, sehingga database tetap dipanggil setiap kali halaman dibuka.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'pakai-remember',
        'Memakai `Cache::remember` dengan key `rekap-catatan`',
        'Belum ada `Cache::remember("rekap-catatan", ...)`.',
        'Cache::remember\\s*\\(\\s*[\'"]rekap-catatan[\'"]',
      ),
      larangStruktur(
        'tanpa-forever',
        'Tidak memakai `rememberForever`',
        'Data yang tidak pernah kedaluwarsa suatu saat pasti salah, tanpa ada yang tahu sejak kapan.',
        'rememberForever',
      ),
      urutStruktur(
        'query-di-closure',
        'Query ditulis di dalam closure `Cache::remember`',
        'Query harus ditulis DI DALAM closure. Kalau dijalankan lebih dulu, database tetap dipanggil setiap request dan cache-nya kehilangan seluruh gunanya.',
        ['Cache::remember\\s*\\(', 'function\\s*\\(\\s*\\)|fn\\s*\\(\\s*\\)', 'Catatan::'],
      ),
    ]),
  }),

  soal({
    slug: 'job-dispatch',
    title: 'Job beserta `dispatch`',
    topic: 'optimasi',
    level: 'intermediate',
    realWorldUse:
      'Mengirim email, mengolah file unggahan, dan memanggil API pihak ketiga. Semua pekerjaan yang tidak boleh membuat pengguna menunggu di depan layar.',
    source: { category: 'backend-intermediate', chapter: 'laravel-intermediate' },
    brief: {
      situation:
        'Setelah pengguna menyimpan catatan, aplikasi mengirim email notifikasi. Mengirim email bisa makan waktu beberapa detik, apalagi kalau server email sedang lambat. Kalau pengiriman dilakukan di dalam request, pengguna harus menunggu sampai email terkirim hanya untuk melihat tulisan "tersimpan". Pekerjaan lambat seperti ini dipindahkan ke antrean dan dikerjakan di belakang layar.',
      tasks: [
        'Tulis class job `KirimNotifikasiCatatan` yang mengimplementasikan `ShouldQueue`.',
        'Job itu menerima catatan lewat constructor dan punya method `handle()`.',
        'Di method `store` pada controller, simpan catatan lalu kirim job-nya ke antrean dengan `KirimNotifikasiCatatan::dispatch($catatan)`.',
      ],
      pitfalls: [
        '`implements ShouldQueue` yang menentukan segalanya. Tanpa itu, job-nya tetap berjalan tapi langsung di dalam request yang sama, sehingga pengguna tetap menunggu.',
        'Job yang tidak pernah di-dispatch tidak akan pernah berjalan.',
        'Job harus aman dijalankan dua kali. Antrean menjamin job dikirim minimal sekali, bukan tepat sekali, jadi job yang sama bisa saja berjalan dua kali.',
      ],
      terms: [
        {
          term: 'queue (antrean)',
          meaning:
            'Daftar pekerjaan yang menunggu dikerjakan di belakang layar oleh proses terpisah bernama worker. Request cukup memasukkan pekerjaan ke antrean lalu langsung menjawab pengguna. Worker yang dijalankan dengan `php artisan queue:work` mengerjakannya kemudian.',
        },
        {
          term: 'job',
          meaning:
            'Class yang mewakili satu pekerjaan untuk dimasukkan ke antrean, misalnya mengirim satu email. Isi pekerjaannya ditulis di method `handle()`. Data yang dibutuhkan, misalnya catatan mana yang dinotifikasikan, dikirim lewat constructor.',
        },
        {
          term: 'idempotent',
          meaning:
            'Sifat pekerjaan yang hasilnya tetap sama walau dijalankan berkali-kali. Menandai "email sudah terkirim" lalu memeriksanya sebelum mengirim membuat job notifikasi menjadi idempotent, sehingga penerima tidak mendapat email yang sama dua kali.',
        },
      ],
    },
    rules: [
      'Class job mengimplementasikan `ShouldQueue`.',
      'Punya method `handle()`.',
      'Controller memanggil `dispatch`.',
    ],
    starter: `
      class KirimNotifikasiCatatan implements ShouldQueue
      {
          // terima catatan, kerjakan di luar request
      }

      class CatatanController extends Controller
      {
          public function store(SimpanCatatanRequest $request)
          {
              // simpan, lalu kirim notifikasinya ke antrean
          }
      }
    `,
    hints: [
      'Trait `Queueable` dan `Dispatchable` memberi job kemampuan masuk antrean dan dipanggil lewat `dispatch`.',
      'Data yang dibutuhkan job diterima lewat constructor.',
      'Bentuknya `KirimNotifikasiCatatan::dispatch($catatan);`.',
    ],
    solution: {
      code: `
        // implements ShouldQueue membuat job ini dikerjakan di antrean, bukan di dalam request.
        class KirimNotifikasiCatatan implements ShouldQueue
        {
            use Dispatchable;
            use Queueable;

            // Data yang dibutuhkan job dikirim lewat constructor.
            public function __construct(public Catatan $catatan)
            {
            }

            // Isi pekerjaannya. Dijalankan worker antrean, bukan saat request.
            public function handle(): void
            {
                // kerjakan pengiriman di sini
            }
        }

        class CatatanController extends Controller
        {
            public function store(SimpanCatatanRequest $request)
            {
                $catatan = Catatan::create($request->validated());

                // Masukkan ke antrean lalu langsung lanjut. Pengguna tidak menunggu email terkirim.
                KirimNotifikasiCatatan::dispatch($catatan);

                return response()->json($catatan, 201);
            }
        }
      `,
      steps: [
        '`class KirimNotifikasiCatatan implements ShouldQueue` menandai job ini untuk dikerjakan di antrean.',
        '`use Dispatchable` dan `use Queueable` memberinya kemampuan untuk dipanggil lewat `dispatch` dan dimasukkan ke antrean.',
        'Constructor menerima catatan yang akan dinotifikasikan, dan method `handle()` berisi pekerjaan sebenarnya.',
        'Di controller, `KirimNotifikasiCatatan::dispatch($catatan)` hanya memasukkan job ke antrean, dan langkah ini sangat cepat.',
        'Response 201 langsung dikirim ke pengguna, lalu worker mengirim email-nya kemudian.',
      ],
      explanation:
        '`implements ShouldQueue` yang membedakan pekerjaan yang dimasukkan ke antrean dari pekerjaan yang langsung dijalankan. Tanpa itu, semuanya tetap berfungsi dan test tetap hijau. Yang berubah hanya satu hal, yaitu pengguna menunggu sampai email-nya benar-benar terkirim.',
    },
    alternativeSolutions: [
      `
        class KirimNotifikasiCatatan implements ShouldQueue
        {
            use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

            public function __construct(private readonly Catatan $catatan)
            {
            }

            public function handle(): void
            {
                //
            }
        }

        class CatatanController extends Controller
        {
            public function store(SimpanCatatanRequest $request)
            {
                $catatan = Catatan::create($request->validated());
                dispatch(new KirimNotifikasiCatatan($catatan));

                return response()->json($catatan, 201);
            }
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          class KirimNotifikasiCatatan
          {
              use Dispatchable;

              public function __construct(public Catatan $catatan)
              {
              }

              public function handle(): void
              {
              }
          }

          class CatatanController extends Controller
          {
              public function store(SimpanCatatanRequest $request)
              {
                  $catatan = Catatan::create($request->validated());
                  KirimNotifikasiCatatan::dispatch($catatan);

                  return response()->json($catatan, 201);
              }
          }
        `,
        reason:
          'Tanpa `implements ShouldQueue`, job dijalankan langsung di dalam request dan pengguna tetap menunggu.',
      },
      {
        code: `
          class KirimNotifikasiCatatan implements ShouldQueue
          {
              use Dispatchable;

              public function handle(): void
              {
              }
          }

          class CatatanController extends Controller
          {
              public function store(SimpanCatatanRequest $request)
              {
                  $catatan = Catatan::create($request->validated());

                  return response()->json($catatan, 201);
              }
          }
        `,
        reason:
          'Job-nya sudah ada, tapi tidak pernah di-dispatch dari controller, sehingga tidak pernah berjalan.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'implements-shouldqueue',
        'Job mengimplementasikan `ShouldQueue`',
        'Tanpa `implements ShouldQueue`, job-nya dijalankan langsung di dalam request, sehingga pengguna tetap menunggu.',
        'class\\s+KirimNotifikasiCatatan\\s+implements\\s+ShouldQueue',
      ),
      wajibStruktur(
        'ada-handle',
        'Punya method `handle()`',
        'Belum ada method `handle()`. Method itulah yang dijalankan worker antrean.',
        'function\\s+handle\\s*\\(',
      ),
      wajibStruktur(
        'panggil-dispatch',
        'Controller memasukkan job-nya ke antrean',
        'Job yang tidak pernah di-dispatch tidak akan pernah berjalan.',
        'KirimNotifikasiCatatan::dispatch\\s*\\(|dispatch\\s*\\(\\s*new\\s+KirimNotifikasiCatatan',
      ),
    ]),
  }),

  soal({
    slug: 'pest-test-endpoint',
    title: 'Test Pest untuk satu endpoint',
    topic: 'optimasi',
    level: 'intermediate',
    realWorldUse:
      'Menjaga endpoint supaya tidak rusak diam-diam saat bagian kode lain berubah. Test yang menguji jalur penolakan lebih berharga daripada test yang hanya menguji jalur sukses.',
    source: { category: 'backend-intermediate', chapter: 'laravel-intermediate' },
    brief: {
      situation:
        'Endpoint `POST /api/catatan` hanya boleh dipakai pengguna yang sudah login. Suatu hari seseorang merapikan file route dan tanpa sengaja menghapus middleware `auth` dari endpoint itu. Semua tetap terlihat berjalan normal, sampai ada orang tak dikenal yang mulai membuat catatan tanpa login. Test otomatis yang tepat akan langsung gagal saat perubahan itu dibuat.',
      tasks: [
        'Tulis test Pest pertama untuk pengguna yang sudah login. Ia mengirim catatan baru dan harus mendapat status 201.',
        'Di test yang sama, pastikan catatannya benar-benar tersimpan di database memakai `assertDatabaseHas`.',
        'Tulis test Pest kedua untuk tamu yang belum login. Ia mengirim request yang sama dan harus ditolak dengan status 401.',
      ],
      pitfalls: [
        'Test kedua, yaitu yang memeriksa penolakan, paling penting dan paling sering tidak ditulis. Endpoint yang bocor hampir tidak pernah gagal di jalur suksesnya. Ia gagal karena tidak ada yang pernah memeriksa jalur yang seharusnya ditolak.',
        'Status 201 saja tidak membuktikan datanya tersimpan. Periksa database-nya langsung dengan `assertDatabaseHas`.',
      ],
      terms: [
        {
          term: 'Pest',
          meaning:
            'Framework testing untuk PHP dan Laravel dengan gaya penulisan yang ringkas. Setiap test ditulis sebagai `it("deskripsi", function () { ... })`. Test dijalankan dengan perintah `php artisan test` atau `./vendor/bin/pest`.',
        },
        {
          term: 'actingAs()',
          meaning:
            'Method di test Laravel untuk menjalankan request seolah-olah dilakukan oleh pengguna tertentu yang sudah login. `$this->actingAs($user)->postJson(...)` mengirim request sebagai `$user`, tanpa perlu melewati proses login yang sebenarnya.',
        },
        {
          term: 'assertDatabaseHas()',
          meaning:
            'Pemeriksaan di test Laravel bahwa sebuah baris benar-benar ada di tabel database. `$this->assertDatabaseHas("catatan", ["judul" => "Halo"])` gagal kalau tidak ada catatan berjudul "Halo". Ia membuktikan data tersimpan, bukan sekadar request berhasil.',
        },
        {
          term: '401 Unauthorized',
          meaning:
            'Kode status HTTP yang berarti "kamu belum login" atau "identitasmu tidak dikenali". Endpoint yang dilindungi middleware `auth` menjawab 401 kepada tamu. Ia berbeda dengan 403 yang berarti "kamu dikenali tapi tidak boleh".',
        },
      ],
    },
    rules: [
      'Ada test untuk pengguna yang sudah login dan berhasil.',
      'Ada test untuk tamu yang ditolak.',
      'Memeriksa bahwa data benar-benar tersimpan di database.',
    ],
    starter: `
      it('menyimpan catatan milik pengguna yang login', function () {
          //
      });

      it('menolak tamu yang belum login', function () {
          //
      });
    `,
    hints: [
      '`actingAs()` membuat request berjalan sebagai pengguna tertentu.',
      '`postJson()` mengirim request JSON dan mengembalikan response yang bisa diperiksa.',
      '`assertDatabaseHas()` memeriksa bahwa barisnya benar-benar ada di tabel.',
    ],
    solution: {
      code: `
        it('menyimpan catatan milik pengguna yang login', function () {
            // Siapkan satu pengguna palsu untuk test.
            $user = User::factory()->create();

            // Kirim request SEBAGAI pengguna itu.
            $response = $this->actingAs($user)->postJson('/api/catatan', [
                'judul' => 'Catatan pertama',
                'isi' => 'Isi catatan.',
            ]);

            $response->assertStatus(201);

            // Status 201 saja belum cukup. Pastikan barisnya benar-benar ada di database.
            $this->assertDatabaseHas('catatan', [
                'judul' => 'Catatan pertama',
                'user_id' => $user->id,
            ]);
        });

        it('menolak tamu yang belum login', function () {
            // Tanpa actingAs, request ini dikirim sebagai tamu.
            $response = $this->postJson('/api/catatan', [
                'judul' => 'Catatan pertama',
                'isi' => 'Isi catatan.',
            ]);

            // Test inilah yang gagal kalau middleware auth tidak sengaja terhapus.
            $response->assertStatus(401);
        });
      `,
      steps: [
        '`User::factory()->create()` membuat satu pengguna palsu di database khusus test.',
        '`$this->actingAs($user)->postJson(...)` mengirim request pembuatan catatan sebagai pengguna itu.',
        '`assertStatus(201)` memastikan server menjawab bahwa data baru berhasil dibuat.',
        '`assertDatabaseHas(...)` memastikan catatannya benar-benar tersimpan dan tercatat sebagai milik pengguna itu.',
        'Test kedua mengirim request yang sama TANPA `actingAs`, lalu `assertStatus(401)` memastikan tamu ditolak.',
      ],
      explanation:
        'Test kedua tidak memeriksa apa pun tentang fiturnya, melainkan tentang batasnya. Test seperti ini yang menangkap middleware yang tidak sengaja terlepas dari sebuah route, dan itu cara paling umum sebuah endpoint mulai bocor tanpa ada yang menyadarinya.',
    },
    alternativeSolutions: [
      `
        it('menyimpan catatan milik pengguna yang login', function () {
            $user = User::factory()->create();

            $this->actingAs($user)
                ->postJson('/api/catatan', ['judul' => 'Halo', 'isi' => 'Dunia'])
                ->assertCreated();

            $this->assertDatabaseHas('catatan', ['judul' => 'Halo', 'user_id' => $user->id]);
        });

        it('menolak tamu yang belum login', function () {
            $this->postJson('/api/catatan', ['judul' => 'Halo', 'isi' => 'Dunia'])
                ->assertUnauthorized();
        });
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          it('menyimpan catatan milik pengguna yang login', function () {
              $user = User::factory()->create();

              $response = $this->actingAs($user)->postJson('/api/catatan', [
                  'judul' => 'Catatan pertama',
                  'isi' => 'Isi catatan.',
              ]);

              $response->assertStatus(201);
              $this->assertDatabaseHas('catatan', ['judul' => 'Catatan pertama']);
          });
        `,
        reason:
          'Hanya menguji jalur sukses, sehingga tidak ada yang memeriksa bahwa tamu benar-benar ditolak.',
      },
      {
        code: `
          it('menyimpan catatan milik pengguna yang login', function () {
              $user = User::factory()->create();

              $this->actingAs($user)
                  ->postJson('/api/catatan', ['judul' => 'Halo', 'isi' => 'Dunia'])
                  ->assertStatus(201);
          });

          it('menolak tamu yang belum login', function () {
              $this->postJson('/api/catatan', ['judul' => 'Halo', 'isi' => 'Dunia'])
                  ->assertStatus(401);
          });
        `,
        reason:
          'Tidak memeriksa bahwa datanya benar-benar tersimpan, padahal status 201 saja tidak membuktikan itu.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'ada-actingas',
        'Ada test yang berjalan sebagai pengguna yang sudah login',
        'Belum ada `actingAs()`. Tanpa itu, tidak ada yang menguji jalur pengguna yang sudah login.',
        '->actingAs\\s*\\(',
      ),
      wajibStruktur(
        'ada-postjson',
        'Mengirim request ke endpoint-nya',
        'Belum ada `postJson("/api/catatan", ...)` yang benar-benar memanggil endpoint-nya.',
        'postJson\\s*\\(\\s*[\'"]/api/catatan[\'"]',
      ),
      wajibStruktur(
        'ada-uji-tolak',
        'Ada test untuk tamu yang ditolak',
        'Belum ada pemeriksaan status 401 atau `assertUnauthorized`. Endpoint yang bocor hampir tidak pernah gagal di jalur suksesnya.',
        '401|assertUnauthorized',
      ),
      wajibStruktur(
        'ada-assert-database',
        'Memeriksa bahwa data benar-benar tersimpan',
        'Status 201 tidak membuktikan datanya masuk. Pakai `assertDatabaseHas` untuk memeriksa barisnya benar-benar ada.',
        'assertDatabaseHas\\s*\\(',
      ),
    ]),
  }),

  soal({
    slug: 'laravel-transaksi',
    title: 'Bungkus beberapa penulisan data dalam satu transaksi',
    topic: 'optimasi',
    level: 'intermediate',
    realWorldUse:
      'Checkout, transfer saldo, serta pembuatan pesanan beserta itemnya. Penulisan yang hanya berhasil separuh adalah jenis bug backend yang paling mahal, karena ia tidak terlihat sampai berbulan-bulan kemudian.',
    source: { category: 'backend-intermediate', chapter: 'laravel-intermediate' },
    brief: {
      situation:
        'Saat pembeli menekan tombol "Bayar", aplikasi melakukan tiga hal, yaitu membuat pesanan, membuat item pesanannya, dan mengurangi stok produk. Bayangkan pesanan sudah tersimpan, lalu server mati sebelum stok dikurangi. Sekarang stok di sistem tidak lagi sesuai kenyataan, dan tidak ada error di mana pun karena setiap query berhasil sendiri-sendiri. Ketiganya harus berhasil bersama atau gagal bersama.',
      tasks: [
        'Di method `store`, bungkus ketiga penulisan data dengan `DB::transaction`.',
        'Di dalam transaksi, buat pesanan, buat item pesanannya, lalu kurangi stok produk.',
        'Kirim struk pesanan dengan `KirimStrukPesanan::dispatch($pesanan)` SETELAH transaksi selesai, bukan di dalamnya.',
      ],
      pitfalls: [
        'Jangan memanggil layanan luar di dalam transaksi, misalnya mengirim email, memasukkan job ke antrean, atau memanggil API pihak ketiga. Selama transaksi terbuka, baris data yang disentuh dikunci, dan kunci itu tertahan selama layanan luar belum menjawab.',
        'Transaksi berisi satu penulisan saja tidak menambah perlindungan apa pun. Yang dijaga transaksi adalah beberapa penulisan yang harus berhasil bersama.',
      ],
      terms: [
        {
          term: 'transaction',
          meaning:
            'Sekumpulan perintah database yang diperlakukan sebagai satu kesatuan. Kalau semuanya berhasil, perubahannya disimpan. Kalau ada satu yang gagal, SEMUA perubahannya dibatalkan. Contoh sehari-harinya transfer bank, di mana saldo pengirim berkurang hanya kalau saldo penerima bertambah.',
        },
        {
          term: 'commit dan rollback',
          meaning:
            'Commit berarti menyimpan permanen semua perubahan di dalam transaksi. Rollback berarti membatalkan semuanya seolah tidak pernah terjadi. `DB::transaction` melakukan commit otomatis kalau closure selesai tanpa error, dan rollback otomatis kalau ada exception.',
        },
        {
          term: 'row lock',
          meaning:
            'Kunci yang dipasang database pada baris yang sedang diubah di dalam transaksi, supaya proses lain tidak mengubahnya bersamaan. Kunci baru dilepas saat transaksi selesai. Transaksi yang lama berarti proses lain yang ingin menyentuh baris yang sama ikut menunggu.',
        },
      ],
    },
    rules: [
      'Memakai `DB::transaction`.',
      'Seluruh penulisan data berada di dalam transaksi.',
      'Tidak ada pemanggilan layanan luar di dalam transaksi.',
    ],
    starter: `
      public function store(SimpanPesananRequest $request)
      {
          // buat pesanan, buat itemnya, kurangi stok
      }
    `,
    hints: [
      '`DB::transaction` menerima sebuah closure, lalu mengurus commit dan rollback sendiri.',
      'Nilai yang dikembalikan closure ikut dikembalikan oleh `DB::transaction`.',
      'Apa pun yang menyentuh jaringan diletakkan sesudah transaksinya, bukan di dalamnya.',
    ],
    solution: {
      code: `
        public function store(SimpanPesananRequest $request)
        {
            $data = $request->validated();

            // Ketiga penulisan di dalam closure ini berhasil bersama atau batal bersama.
            $pesanan = DB::transaction(function () use ($data) {
                $pesanan = Pesanan::create(['user_id' => $data['user_id']]);

                $pesanan->item()->create($data['item']);

                Produk::where('id', $data['item']['produk_id'])->decrement('stok', $data['item']['jumlah']);

                return $pesanan; // nilai ini dikembalikan oleh DB::transaction
            });

            // SETELAH transaksi selesai, baru menyentuh layanan luar.
            KirimStrukPesanan::dispatch($pesanan);

            return response()->json($pesanan, 201);
        }
      `,
      steps: [
        '`$request->validated()` mengambil data pesanan yang sudah divalidasi.',
        '`DB::transaction(function () use ($data) {...})` membuka transaksi. Kata `use ($data)` membuat closure bisa membaca variabel `$data` dari luar.',
        'Di dalam closure, pesanan dibuat, item pesanan dibuat, lalu stok produk dikurangi dengan `decrement`.',
        'Kalau ketiganya berhasil, Laravel melakukan commit, lalu `$pesanan` dikembalikan. Kalau ada yang gagal, semuanya di-rollback.',
        'Setelah transaksi selesai dan kunci barisnya dilepas, barulah `KirimStrukPesanan::dispatch` dipanggil.',
      ],
      explanation:
        'Pengiriman struk berada di luar transaksi, dan itu bukan sekadar kerapian. Memanggil layanan luar di dalam transaksi menahan kunci baris selama jaringan pihak lain belum menjawab. Kalau mereka lambat, seluruh tabel pesananmu ikut melambat karena alasan yang tidak ada hubungannya dengan aplikasimu.',
    },
    alternativeSolutions: [
      `
        public function store(SimpanPesananRequest $request)
        {
            $data = $request->validated();

            $pesanan = DB::transaction(function () use ($data) {
                $pesanan = Pesanan::create($data['pesanan']);
                ItemPesanan::create(['pesanan_id' => $pesanan->id] + $data['item']);
                Produk::findOrFail($data['item']['produk_id'])->decrement('stok', 1);

                return $pesanan;
            });

            return new PesananResource($pesanan);
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          public function store(SimpanPesananRequest $request)
          {
              $data = $request->validated();
              $pesanan = Pesanan::create($data['pesanan']);
              $pesanan->item()->create($data['item']);
              Produk::where('id', 1)->decrement('stok', 1);

              return response()->json($pesanan, 201);
          }
        `,
        reason:
          'Tanpa transaksi, pesanan bisa tersimpan sementara pengurangan stoknya gagal, dan tidak ada error di mana pun.',
      },
      {
        code: `
          public function store(SimpanPesananRequest $request)
          {
              $data = $request->validated();

              return DB::transaction(function () use ($data) {
                  $pesanan = Pesanan::create($data['pesanan']);
                  $pesanan->item()->create($data['item']);
                  Produk::where('id', 1)->decrement('stok', 1);

                  KirimStrukPesanan::dispatch($pesanan);

                  return $pesanan;
              });
          }
        `,
        reason:
          'Memasukkan pengiriman struk ke antrean dari dalam transaksi, sehingga kunci baris tertahan selama layanan luar belum menjawab.',
      },
    ],
    check: mesinStruktur('php', [
      wajibStruktur(
        'pakai-transaksi',
        'Memakai `DB::transaction`',
        'Belum ada `DB::transaction`. Tiga penulisan yang berdiri sendiri bisa berhasil separuh tanpa error di mana pun.',
        'DB::transaction\\s*\\(',
      ),
      wajibStruktur(
        'ada-beberapa-tulisan',
        'Beberapa penulisan data berada di dalamnya',
        'Transaksi yang hanya berisi satu penulisan tidak menambah perlindungan apa pun. Yang dijaga adalah beberapa penulisan yang harus berhasil bersama.',
        '(create|decrement|increment|update|save)\\s*\\([\\s\\S]{0,400}(create|decrement|increment|update|save)\\s*\\(',
      ),
      larangStruktur(
        'tanpa-layanan-luar',
        'Tidak memanggil layanan luar di dalam transaksi',
        'Mengirim email, memasukkan job ke antrean, atau memanggil HTTP di dalam transaksi menahan kunci baris selama jaringan pihak lain belum menjawab. Letakkan sesudah transaksinya selesai.',
        // Pola ini berhenti di penutup bloknya, bukan menghitung karakter.
        // `(?:(?!\\}\\s*\\)\\s*;)[\\s\\S])*?` memakan isi transaksi selama belum bertemu `});`,
        // jadi panggilan yang berada SESUDAH transaksi tertutup tidak terjangkau olehnya.
        // Jendela berukuran tetap tidak bisa melakukan ini: ia menembus keluar dari blok dan
        // menolak jawaban yang benar — kekeliruan yang ditangkap test integritas di sini.
        'DB::transaction\\s*\\((?:(?!\\}\\s*\\)\\s*;)[\\s\\S])*?(dispatch\\s*\\(|Mail::|Notification::|Http::)',
      ),
    ]),
  }),
];
