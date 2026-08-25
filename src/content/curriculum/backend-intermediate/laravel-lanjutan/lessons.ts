import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  ol,
  p,
  references,
  steps,
  table,
  terms,
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

      terms(
        {
          term: 'folder yang tidak disediakan Laravel',
          meaning:
            'Laravel **tidak** menyediakan `Services` maupun `Repositories`. Keduanya kamu buat sendiri saat memang dibutuhkan — dan sebagian besar aplikasi Laravel tidak membutuhkan keduanya sekaligus.',
        },
        {
          term: 'service layer',
          meaning:
            'Tempat aturan bisnis yang **melibatkan beberapa langkah** — membuat slug, menyinkronkan tag, mengirim notifikasi, memeriksa kuota. Ia berbayar begitu logika yang sama dipanggil dari controller **dan** perintah artisan.',
        },
        {
          term: 'kapan service belum perlu',
          meaning:
            'Kalau ia hanya **meneruskan** satu pemanggilan tanpa menambah aturan apa pun. `$layanan->buat()` yang isinya cuma `Artikel::create()` menambah satu berkas dan nol perlindungan.',
        },
        {
          term: 'repository di Laravel',
          meaning:
            'Lapisan abstraksi di atas Eloquent. **Sering tidak diperlukan**: Eloquent sendiri sudah lapisan abstraksi atas SQL, jadi membungkusnya lagi berarti dua lapisan untuk satu tanggung jawab.',
        },
        {
          term: 'kapan repository berbayar',
          meaning:
            'Tiga situasi sah: query rumit yang sama dipakai di banyak tempat, data yang datang dari **luar database** (API partner), atau kebutuhan menukar sumber datanya tanpa menyentuh aturan bisnis.',
        },
        {
          term: 'injeksi lewat metode',
          meaning:
            'Laravel bisa menyuntikkan ketergantungan langsung ke **parameter metode controller** — `store(Request $r, LayananArtikel $layanan)`. Untuk ketergantungan yang hanya dipakai satu metode, ini lebih ringkas daripada konstruktor.',
        },
        {
          term: 'controller tipis',
          meaning:
            'Prinsip yang sama seperti di Express. Controller **mengoordinasi**, tidak menghitung. Begitu ia memuat aturan bisnis, aturan itu jadi tidak bisa dipakai dari perintah artisan, job terjadwal, maupun tes.',
        },
        {
          term: 'deletion test',
          meaning:
            'Cara memutuskan apakah sebuah lapisan layak ada: kalau dihapus, apakah kerumitannya **hilang** atau justru **pindah** ke pemanggilnya? Lapisan yang layak ada adalah yang menyerap kerumitan, bukan meneruskannya.',
        },
        {
          term: 'DI Laravel vs Express',
          meaning:
            'Laravel punya **service container** yang menyelesaikan ketergantungan dari tipe di konstruktor. Express tidak — di sana kamu merakitnya sendiri di composition root. Hasilnya sama; yang berbeda siapa yang mengerjakan perakitannya.',
        },
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
      p(
        'Kolom kiri sengaja dipasang lebih dulu, dan itu penting untuk sub-bab yang membahas lapisan. Untuk operasi satu langkah seperti ini, service hanya akan **meneruskan** — `LayananArtikel::buat()` yang isinya persis satu baris `create()`. Itu lapisan yang tidak menyerap apa pun, hanya menambah satu berkas yang harus dibuka orang berikutnya untuk sampai ke kode yang sesungguhnya.',
      ),
      p(
        'Kolom kanan menjadi layak begitu catatannya berlaku: slug yang harus unik, tag yang mungkin belum ada, notifikasi, pemeriksaan kuota. **Beberapa langkah yang harus terjadi bersama** — dan begitu ada beberapa langkah, ada aturan tentang urutannya dan apa yang terjadi bila salah satunya gagal. Itulah kerumitan yang layak diserap satu lapisan.',
      ),
      p(
        'Catatan kedua di kolom kanan menyebut alasan yang sering lebih menentukan: **dipakai juga dari perintah artisan**. Begitu logika pembuatan artikel dibutuhkan dari impor CSV atau job terjadwal, versi di controller tidak bisa dipakai tanpa memalsukan objek `Request`. Pakai deletion test dari daftar istilah untuk memutuskan: kalau lapisan ini dihapus, kerumitannya **hilang** atau **pindah** ke pemanggilnya?',
      ),
      p(
        'Perhatikan `LayananArtikel` disuntikkan lewat **parameter metode**, bukan konstruktor. Laravel bisa melakukan keduanya, dan bentuk ini lebih tepat untuk ketergantungan yang hanya dipakai satu metode — konstruktor akan membuat setiap pemanggilan controller ini membangun service yang mungkin tidak terpakai.',
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
      p(
        'Perhatikan tanda tangan `buat(User $penulis, array $data)` — yang masuk adalah **objek `User` dan array**, bukan `Request`. Itulah yang membuat service ini bisa dipanggil dari perintah artisan, job antrean, atau tes tanpa memalsukan objek permintaan. Begitu ia menerima `Request`, ia terikat pada HTTP dan seluruh alasan memisahkannya hilang.',
      ),
      p(
        'Blok `DB::transaction` membungkus dua operasi yang **harus terjadi bersama**: membuat artikel dan menyinkronkan tag-nya. Tanpa itu, kegagalan saat menyimpan tag meninggalkan artikel tanpa tag yang seharusnya melekat — keadaan setengah jadi yang tidak pernah dimaksudkan. Perhatikan pengembalian nilai dari dalam closure ikut diteruskan `DB::transaction`, jadi tidak perlu variabel di luar.',
      ),
      p(
        'Anotasi `@param array{judul: string, isi: string, tag?: list<string>}` bukan komentar biasa — itu **tipe array berbentuk** yang dibaca PHPStan. Karena PHP tidak punya cara menyatakan bentuk isi array di tanda tangan, anotasi inilah yang membuat salah ketik kunci atau tipe nilai tertangkap analisis statis. Tanda tanya pada `tag?` menandainya opsional, cocok dengan pemeriksaan `isset` di bawahnya.',
      ),
      p(
        "Perhatikan `PembuatSlug` disuntikkan lewat **konstruktor**, berbeda dari `LayananArtikel` yang tadi lewat parameter metode. Bedanya tepat: ketergantungan yang dipakai hampir setiap metode masuk ke konstruktor, yang hanya dipakai satu metode masuk ke parameter metode. Dan `'status' => 'draf'` ditulis mati di sini, bukan diambil dari `$data` — status awal adalah keputusan aturan bisnis, bukan sesuatu yang boleh ditentukan klien.",
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
      p(
        'Query scope memberi **nama** pada query yang berulang tanpa menambah lapisan baru. Perhatikan awalan `scope` pada nama metodenya dihilangkan saat dipanggil — `scopeMilik` menjadi `Artikel::milik($user)`. Baris komentar terakhir memperlihatkan hasilnya: rangkaian yang terbaca seperti kalimat, dan tiap potongannya bisa dipakai ulang secara mandiri.',
      ),
      p(
        "`scopeMilik` khususnya berharga sebagai kontrol keamanan, bukan sekadar kerapian. Ia mengubah pembatasan kepemilikan dari sesuatu yang harus **diingat** di setiap query menjadi sesuatu yang punya nama dan mudah dilihat ada-tidaknya saat review. Bandingkan `Artikel::milik($user)->terbit()` dengan `Artikel::where('penulis_id', $user->id)->where('status', 'terbit')` yang ditulis ulang di sepuluh tempat — satu yang lupa `penulis_id` adalah kebocoran.",
      ),
      p(
        'Inilah alasan repository sering tidak berbayar di Laravel. Kebutuhan yang biasanya mendorongnya, yaitu memberi nama pada query berulang, sudah dijawab scope **tanpa** menambah berkas dan lapisan. Repository baru masuk akal untuk tiga situasi di tabel di atas, terutama saat sumber datanya bisa berganti dari database ke API luar.',
      ),
      callout(
        'tip',
        'Deletion test',
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
      references(
        {
          label: 'Laravel — Service Container',
          href: 'https://laravel.com/docs/12.x/container',
          source: 'Laravel',
          note: 'Injeksi lewat konstruktor maupun parameter metode controller.',
        },
        {
          label: 'Laravel — Controllers',
          href: 'https://laravel.com/docs/12.x/controllers',
          source: 'Laravel',
          note: 'Termasuk single action controller lewat `__invoke`.',
        },
        {
          label: 'Eloquent — Query Scopes',
          href: 'https://laravel.com/docs/12.x/eloquent#query-scopes',
          source: 'Laravel',
          note: 'Alternatif ringan repository: memberi nama pada query berulang tanpa lapisan baru.',
        },
        {
          label: 'Laravel — Artisan Console',
          href: 'https://laravel.com/docs/12.x/artisan',
          source: 'Laravel',
          note: 'Pemanggil kedua yang membuat service benar-benar berbayar.',
        },
      ),
    ],
  ),

  written(
    'eloquent-lanjutan',
    'Eloquent Lanjutan: scope, accessor, casts',
    12,
    'Memindahkan aturan berulang ke tempat yang tidak bisa dilupakan.',
    [
      terms(
        {
          term: 'cast',
          meaning:
            'Pemetaan tipe kolom database ke tipe PHP, dideklarasikan sekali di model. Nilainya bukan kenyamanan melainkan **konsistensi**: tanpa cast, `diarsipkan` dari MySQL datang sebagai `0`/`1`, dan perbandingan `=== true` gagal diam-diam di satu tempat tapi tidak di tempat lain.',
        },
        {
          term: "cast 'hashed'",
          meaning:
            'Meng-hash nilai **otomatis** saat diisi. Ia menutup satu kelas bug yang berbahaya: password yang tersimpan apa adanya karena satu jalur penulisan lupa memanggil `Hash::make()`.',
        },
        {
          term: "cast 'encrypted'",
          meaning:
            'Mengenkripsi kolom di database memakai `APP_KEY`. Berbeda dari hash: ia **bisa dibaca kembali** — untuk data yang perlu ditampilkan lagi seperti nomor identitas, bukan untuk password.',
        },
        {
          term: 'cast ke enum',
          meaning:
            'Mengubah kolom string menjadi enum PHP. Efeknya besar: nilai yang tidak sah jadi **tidak bisa dinyatakan**, dan `match` atasnya diperiksa kelengkapannya oleh analisis statis.',
        },
        {
          term: 'query scope',
          meaning:
            'Metode `scopeNama()` di model yang membungkus potongan query. Ia memberi **nama** pada aturan berulang — `Artikel::milik($user)->terbit()` terbaca sebagai kalimat, dan aturannya hidup di satu tempat.',
        },
        {
          term: 'scope pemilik',
          meaning:
            'Scope yang paling berharga dari sisi keamanan: `scopeMilik()`. Ia membuat pembatasan kepemilikan **sulit dilupakan** — jauh lebih sulit daripada mengingat menulis `where` yang sama di setiap query.',
        },
        {
          term: 'global scope',
          meaning:
            'Scope yang berlaku **otomatis** untuk setiap query model itu — misalnya menyaring baris yang di-soft-delete. Kuat, tapi juga berbahaya: query yang perilakunya berbeda dari yang tertulis membuat penelusuran jadi membingungkan.',
        },
        {
          term: 'accessor',
          meaning:
            'Properti turunan yang **dihitung saat dibaca** — `$artikel->ringkasan` dari kolom `isi`. Ia menempatkan perhitungan di dekat datanya, sehingga tidak diulang di setiap tempat yang menampilkannya.',
        },
        {
          term: 'mutator',
          meaning:
            'Kebalikan accessor: mengubah nilai **sebelum disimpan** — misalnya menormalkan email jadi huruf kecil. Ia menutup kelas bug "dua akun dengan email yang sama tapi beda kapitalisasi".',
        },
      ),

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
      p(
        "Cast menerjemahkan antara **bentuk penyimpanan** dan **bentuk pemakaian**, dan tiga di antaranya menutup bug yang sudah dibahas di bab sebelumnya. `'boolean'` mengubah `0`/`1` dari MySQL menjadi `true`/`false` sungguhan — tanpanya, `if ($artikel->diarsipkan)` bernilai benar untuk keduanya. `'datetime'` menghasilkan objek `Carbon` yang bisa dibandingkan dan diformat. Dan `StatusArtikel::class` mengubah string menjadi enum, sehingga nilai status yang tidak dikenal langsung melempar alih-alih beredar diam-diam.",
      ),
      p(
        "Tiga baris berikutnya adalah kontrol keamanan yang dipasang di lapisan model. `'hashed'` membuat setiap penugasan ke kolom itu di-hash otomatis, sehingga `$user->update(['password' => $plain])` yang ceroboh tidak menyimpan teks mentah. `'encrypted'` mengenkripsi dengan `APP_KEY` saat menyimpan dan mendekripsi saat membaca — dan ingat konsekuensinya dari sub-bab 5.2: kehilangan `APP_KEY` berarti kehilangan datanya selamanya, jadi ia harus di-backup terpisah dari database.",
      ),
      p(
        "`'decimal:2'` untuk `harga` mengikuti aturan uang dari sub-bab 2.2, sebab nilainya dipertahankan sebagai desimal eksak alih-alih float yang membuat `0.1 + 0.2` tidak sama dengan `0.3`. Perhatikan tempat cast ini bekerja, karena ia mengatur bentuk **di sisi PHP** sedangkan tipe kolom di migration yang mengatur penyimpanannya. Keduanya harus cocok, sebab `decimal:2` di atas kolom `FLOAT` tetap kehilangan presisi di database.",
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
      p(
        'Cast kustom dipakai ketika bentuk yang kamu inginkan di PHP bukan tipe primitif. Di sini `Uang` adalah **value object** — objek yang membawa nilainya sekaligus aturannya, sehingga penjumlahan dan pemformatan mata uang punya satu tempat alih-alih tersebar sebagai perhitungan integer di seluruh aplikasi.',
      ),
      p(
        'Dua metodenya bekerja di arah berlawanan. `get` dipanggil saat **membaca** dari database, dan di situ nilai mentah `$value` dibungkus menjadi objek `Uang`. `set` dipanggil saat **menyimpan**, dan di situ objeknya dibongkar kembali menjadi nilai kolom. Perhatikan `set` mengembalikan **array** `[$key => ...]` alih-alih nilai tunggal, sebab bentuk itu memungkinkan satu cast menulis ke beberapa kolom sekaligus, misalnya jumlah dan kode mata uangnya.',
      ),
      p(
        'Pemeriksaan `! $value instanceof Uang` yang melempar adalah bagian yang membuat cast ini benar-benar menjaga. Tanpanya, seseorang bisa menugaskan angka mentah atau string dan cast-nya akan menyimpan sesuatu yang bentuknya tidak terduga. Dan komentar terakhir menegaskan aturan uang dari sub-bab 2.2: yang tersimpan adalah **integer dalam satuan terkecil**, bukan float — pembulatan yang menumpuk diam-diam adalah kelas bug yang paling mahal di sistem keuangan.',
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
      p(
        'Keduanya memakai `Attribute::make` tetapi mengisi kunci yang berbeda, dan itu yang menentukan arahnya. `get` adalah **accessor** — properti turunan yang dihitung saat dibaca. `namaLengkap` tidak ada sebagai kolom mana pun; ia dirangkai dari `nama_depan` dan `nama_belakang` setiap kali diakses lewat `$user->nama_lengkap`.',
      ),
      p(
        '`set` adalah **mutator** — ia mengubah nilai **sebelum disimpan**. `trim` pada judul terlihat sepele, tetapi menempatkannya di sini berarti aturan itu berlaku dari **setiap** jalur yang menulis: form web, impor CSV, seeder, dan perintah artisan. Bandingkan dengan menaruh `trim` di controller, yang hanya menjaga satu jalur dan akan terlewat pada jalur berikutnya.',
      ),
      p(
        "Perhatikan `get` menerima **dua** parameter, yaitu `$value` yang berisi nilai kolom senama dan `$attributes` yang berisi seluruh kolom baris itu. Untuk properti yang dirangkai dari kolom lain seperti ini, `$attributes` yang dipakai, sebab `$value` akan `null` karena tidak ada kolom `nama_lengkap`. Konsekuensinya ada di peringatan berikut dan ia penting. Karena perhitungannya terjadi **di PHP setelah baris diambil**, `where('nama_lengkap', ...)` akan gagal sebab kolomnya tidak pernah ada di database.",
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
      p(
        "Baris `if ($kata === null || trim($kata) === '') return $q` menjaga scope tetap aman saat argumennya kosong. Mengembalikan `$q` apa adanya berarti \"tidak menambah syarat apa pun\" — sehingga `Artikel::milik($user)->cari(null)` tetap bekerja dan mengembalikan semua artikel milik pengguna itu. Tanpa penjagaan ini, `ILIKE '%%'` yang dihasilkan memang cocok dengan segalanya, tetapi ia memaksa pemindaian yang tidak perlu.",
      ),
      p(
        'Closure pada `where(fn ($sub) => ...)` adalah bagian yang **wajib** dan paling mudah dilewatkan, karena tanpanya kodenya tetap berjalan tanpa error. SQL mengevaluasi `AND` lebih dulu daripada `OR`, jadi rangkaian `milik($user)` lalu `cari($kata)` **tanpa** pengelompokan akan diterjemahkan menjadi `WHERE penulis_id = 7 AND judul ILIKE ... OR isi ILIKE ...` — dan cabang `OR` terakhir berdiri sendiri, terlepas dari syarat kepemilikan.',
      ),
      p(
        'Akibatnya persis kebocoran: pencarian mengembalikan artikel **milik siapa pun** yang isinya cocok. Tidak ada error, tidak ada peringatan, dan hasilnya tampak masuk akal — hanya kebetulan berisi data orang lain. Closure membungkus kedua syarat pencarian menjadi satu kelompok `(...)`, sehingga syarat kepemilikan tetap berlaku atas keduanya. Ini alasan konkret kenapa scope yang menggabungkan `orWhere` harus selalu ditulis dengan pengelompokan eksplisit.',
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
      p(
        'Berbeda dari scope biasa yang harus dipanggil, **global scope berlaku otomatis** pada setiap query model ini — `Artikel::all()` diam-diam menjadi `WHERE tenant_id = ...`. Untuk pemisahan tenant, daya tariknya jelas: tidak ada satu query pun yang bisa lupa menyaring, karena penyaringannya tidak pernah ditulis di query.',
      ),
      p(
        'Justru "diam-diam" itu yang membuatnya berbahaya, dan peringatan di bawah menyebut tiga batasnya. Ia bisa dilewati sengaja dengan `withoutGlobalScope()`. Ia **tidak berlaku** pada `DB::table(...)` maupun raw SQL, yang melewati model sepenuhnya. Dan ia membuat query berperilaku berbeda dari yang tertulis — orang yang menelusuri masalah akan membaca `Artikel::all()` dan tidak melihat penyebab hasilnya kosong.',
      ),
      p(
        'Perhatikan pemeriksaan `auth()->check()` di dalamnya, dan pikirkan apa artinya kalau bernilai `false`. Scope-nya **tidak menambah syarat apa pun**, sehingga query mengembalikan seluruh tenant. Konteks tanpa pengguna itu nyata, misalnya perintah artisan, job antrean, dan seeder. Untuk konteks seperti itu, syarat tenant harus disebut eksplisit. Perlakukan global scope sebagai **lapisan tambahan** alih-alih penjagaan utama, sebab penjagaan utamanya tetap syarat eksplisit di query, sesuai prinsip defense in depth di sub-bab 5.1.',
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
      references(
        {
          label: 'Eloquent — Mutators & Casting',
          href: 'https://laravel.com/docs/12.x/eloquent-mutators',
          source: 'Laravel',
          note: 'Seluruh tipe cast, termasuk `hashed`, `encrypted`, dan cast ke enum.',
        },
        {
          label: 'Eloquent — Query Scopes',
          href: 'https://laravel.com/docs/12.x/eloquent#query-scopes',
          source: 'Laravel',
          note: 'Scope lokal dan global, beserta cara global scope bisa dilewati.',
        },
        {
          label: 'Query Builder — Logical Grouping',
          href: 'https://laravel.com/docs/12.x/queries#logical-grouping',
          source: 'Laravel',
          note: 'Kenapa `orWhere` tanpa closure membatalkan syarat sebelumnya.',
        },
        {
          label: 'Eloquent — Serialization & $hidden',
          href: 'https://laravel.com/docs/12.x/eloquent-serialization',
          source: 'Laravel',
          note: 'Batas `$hidden` sebagai blocklist, dan alasan API Resource lebih tepat.',
        },
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

      terms(
        {
          term: 'preventLazyLoading',
          meaning:
            'Setelan yang membuat Laravel **melempar error** setiap kali relasi diakses tanpa di-eager-load. Dinyalakan hanya di luar produksi, ia mengubah N+1 dari masalah tak terlihat menjadi kegagalan yang langsung tertangkap.',
        },
        {
          term: 'preventSilentlyDiscardingAttributes',
          meaning:
            'Melempar error kalau ada atribut yang diisi tapi **tidak ada di `$fillable`**. Tanpa itu, field yang salah ketik dibuang diam-diam — dan kamu baru sadar saat datanya ternyata tidak tersimpan.',
        },
        {
          term: 'preventAccessingMissingAttributes',
          meaning:
            'Melempar error saat mengakses atribut yang **tidak ikut di-`select`**. Bug yang ditangkapnya halus: atribut yang tidak diambil mengembalikan `null`, dan `null` itu diperlakukan sebagai nilai yang sah di seluruh kode berikutnya.',
        },
        {
          term: 'lazy loading',
          meaning:
            'Relasi diambil **saat pertama kali diakses**. Nyaman, dan justru itu masalahnya: di dalam perulangan ia berubah jadi N query tanpa ada yang terlihat salah di kode.',
        },
        {
          term: 'eager loading bersyarat',
          meaning:
            "Bentuk `with(['komentar' => fn ($q) => $q->latest()->limit(3)])`. Ia menutup kasus yang sering memaksa orang kembali ke lazy loading: butuh relasi, tapi tidak semuanya.",
        },
        {
          term: 'nested eager loading',
          meaning:
            "Memuat relasi dari relasi — `with('komentar.penulis')`. Tanpa notasi titik ini, memuat penulis tiap komentar berubah jadi N+1 di **lapisan kedua**, yang lebih sulit terlihat daripada yang pertama.",
        },
        {
          term: 'lazy eager loading',
          meaning:
            "Memuat relasi **setelah** koleksinya sudah diambil — `$artikel->load('penulis')`. Berguna saat kebutuhannya baru diketahui belakangan, misalnya bergantung pada peran pemanggil.",
        },
        {
          term: 'withCount',
          meaning:
            'Mengambil **jumlah** relasi tanpa memuat isinya. Ia menutup N+1 yang sering luput: menghitung komentar per artikel dengan `$artikel->komentar->count()` memuat seluruh komentarnya hanya untuk menghitung.',
        },
        {
          term: 'menghitung query di tes',
          meaning:
            'Satu-satunya cara N+1 tidak kembali. Ia tidak menimbulkan error dan tidak terlihat saat membaca kode — tes yang **menghitung query** membuatnya gagal saat ditambahkan, bukan saat sudah mahal.',
        },
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
      p(
        'Ketiga baris ini menutup tiga kelas bug yang punya sifat sama: **tidak menimbulkan error, tidak terlihat saat membaca kode, dan baru terasa jauh kemudian**. `preventLazyLoading` membuat setiap akses relasi yang belum di-`with` melempar, sehingga N+1 tertangkap di detik kamu menulisnya — bukan enam bulan kemudian sebagai keluhan "aplikasinya makin lambat".',
      ),
      p(
        '`preventSilentlyDiscardingAttributes` melempar ketika ada field yang dikirim tetapi tidak ada di `$fillable`. Secara bawaan Laravel membuangnya diam-diam, dan itu menyembunyikan dua hal sekaligus: salah ketik nama kolom yang membuat perubahanmu tidak pernah tersimpan, **dan** percobaan mass assignment yang layak kamu ketahui.',
      ),
      p(
        "`preventAccessingMissingAttributes` menangkap yang paling halus. Setelah `select('id', 'judul')`, mengakses `$artikel->isi` mengembalikan `null` — bukan error, melainkan nilai yang **terlihat sah** dan diperlakukan sebagai \"isinya kosong\" oleh seluruh kode berikutnya. Dengan baris ini, ia menjadi pengecualian yang menyebut atribut mana yang tidak ikut diambil.",
      ),
      p(
        'Perhatikan ketiganya dipagari `! $this->app->isProduction()` — menyala di pengembangan dan pengujian, mati di produksi. Alasannya sama seperti pada Prisma di sub-bab 2.3: kamu ingin masalahnya meledak di depan matamu, tetapi tidak ingin satu N+1 yang terlewat menjatuhkan halaman pengguna sungguhan.',
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
      p(
        '`when()` menjalankan closure-nya **hanya bila syaratnya benar**, sehingga relasi dimuat sesuai permintaan klien alih-alih selalu. Itu penting untuk endpoint yang dipakai beberapa layar dengan kebutuhan berbeda: halaman daftar mungkin hanya butuh judul, sementara halaman detail butuh penulis beserta jumlah komentar. Memuat semuanya untuk keduanya berarti membayar ongkos yang tidak dipakai.',
      ),
      p(
        'Perhatikan `with(\'penulis:id,name\')` membatasi kolom yang diambil, dan `id` **wajib** ikut — tanpanya Laravel tidak punya cara mencocokkan penulis kembali ke artikelnya, dan relasinya menjadi `null` tanpa error apa pun. Perhatikan pula parameter query dibaca lewat `$request->boolean(...)`, bukan langsung: ia menangani `"true"`, `"1"`, dan `"on"` sebagai benar, sekaligus menutup jebakan string `"false"` yang bernilai benar kalau diuji apa adanya.',
      ),
      p(
        'Blok kedua memakai `load()` — versi `with()` untuk koleksi yang **sudah** diambil. Bentuk ini yang kamu butuhkan ketika keputusan memuat relasi baru bisa diambil setelah query utama, misalnya setelah pemeriksaan otorisasi menentukan peran pemanggilnya. Dan `loadMissing()` melakukan hal sama tetapi melewati relasi yang sudah dimuat, sehingga aman dipanggil berulang tanpa menghasilkan query duplikat.',
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
      p(
        "Notasi titik pada `'komentar.penulis:id,name'` memuat **relasi dari relasi**. Tanpanya, memuat penulis tiap komentar berubah menjadi N+1 di **lapisan kedua** — dan itu jauh lebih sulit terlihat daripada N+1 lapisan pertama, karena `with('komentar')` sudah ada dan sekilas terasa cukup.",
      ),
      p(
        'Blok kedua menutup kasus yang sering memaksa orang kembali ke lazy loading: butuh relasi, tapi **tidak semuanya**. Closure di dalam `with` memungkinkan penyaringan dan pembatasan — lima komentar terbaru yang sudah disetujui, bukan seluruh dua ribu komentar yang hanya akan dibuang setelah dipotong di PHP.',
      ),
      p(
        "Blok ketiga memperlihatkan bentuk `withCount` yang paling berguna: **dua hitungan sekaligus** dari relasi yang sama. Bagian `'komentar as komentar_disetujui_count' => fn ($q) => ...` memberi alias pada hitungan yang bersyarat, sehingga hasilnya tersedia sebagai `$artikel->komentar_disetujui_count` di samping `$artikel->komentar_count` yang menghitung semuanya. Keduanya dikerjakan lewat subquery tanpa memuat satu baris komentar pun — bandingkan dengan `$artikel->komentar->count()` yang menarik seluruh komentar ke memori hanya untuk menghitungnya.",
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
      p(
        "`Artikel::all()` menarik **seluruh tabel** ke memori sekaligus. Pada tabel berisi sejuta baris itu bukan sekadar lambat — prosesnya kehabisan memori dan mati, dan gejalanya muncul sebagai job yang gagal tanpa pesan yang jelas. Perhatikan `with('penulis')` tetap ada di kedua bentuk yang benar: memproses batch tidak menghapus kebutuhan eager loading, dan N+1 di dalam perulangan batch justru lebih mahal karena berulang di setiap batch.",
      ),
      p(
        '`chunkById(500, ...)` mengambil lima ratus baris pada satu waktu, memprosesnya, lalu melepaskannya, sehingga pemakaian memori tetap **konstan** berapa pun besar tabelnya. Peringatan di bawah menyebut alasan memilih `chunkById` alih-alih `chunk`. Yang terakhir memakai `OFFSET`, dan kalau baris dihapus atau ditambah selama pemrosesan, posisinya bergeser sehingga sebagian baris terlewat atau diproses dua kali. `chunkById` memakai kolom `id` sebagai penanda sehingga ia aman terhadap perubahan, persis alasan paginasi cursor mengalahkan offset di sub-bab 1.5.',
      ),
      p(
        '`lazyById` menyelesaikan hal yang sama dengan bentuk yang lebih nyaman, sebab ia mengembalikan `LazyCollection` yang bisa di-`foreach` seperti koleksi biasa sementara di balik layar tetap mengambil per lima ratus baris. Pilih `chunkById` kalau kamu butuh bekerja per batch, misalnya satu `INSERT` massal per batch, dan pilih `lazyById` kalau logikanya memang per baris.',
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
      p(
        'Tes ini mengubah N+1 dari masalah performa yang tak terlihat menjadi sesuatu yang bisa **gagal**. `DB::enableQueryLog()` merekam setiap query yang benar-benar dijalankan, sehingga jumlahnya bisa dihitung — bukan diperkirakan dari membaca kode.',
      ),
      p(
        'Perhatikan letak `enableQueryLog()`: **setelah** penyiapan data, tepat sebelum permintaan HTTP. Menyalakannya di awal akan ikut menghitung tiga puluh query dari `factory()`, dan ambangnya terlampaui bahkan pada kode yang benar. Yang ingin diukur hanyalah query dari **satu permintaan**, bukan dari persiapannya.',
      ),
      p(
        'Angka 30 pada penyiapan dan ambang `toBeLessThan(6)` bekerja berpasangan. Kalau ada N+1, jumlahnya melonjak ke sekitar 31 — jauh di atas ambang, jadi kegagalannya tegas dan bukan kebetulan. Sebaliknya, menyiapkan hanya tiga baris akan membuat tes ini hijau **walaupun ada N+1**, karena empat query masih di bawah ambang. Aturannya: jumlah data uji harus jauh lebih besar daripada ambang yang kamu pasang.',
      ),
      references(
        {
          label: 'Eloquent — Eager Loading',
          href: 'https://laravel.com/docs/12.x/eloquent-relationships#eager-loading',
          source: 'Laravel',
          note: 'Bentuk bersarang, bersyarat, dan lazy eager loading.',
        },
        {
          label: 'Preventing Lazy Loading',
          href: 'https://laravel.com/docs/12.x/eloquent-relationships#preventing-lazy-loading',
          source: 'Laravel',
          note: 'Tiga setelan yang mengubah bug diam menjadi error saat pengembangan.',
        },
        {
          label: 'Eloquent — Chunking results',
          href: 'https://laravel.com/docs/12.x/eloquent#chunking-results',
          source: 'Laravel',
          note: 'Beda `chunk` dan `chunkById`, dan kenapa yang kedua aman terhadap perubahan data.',
        },
        {
          label: 'API Resources — Conditional Relationships',
          href: 'https://laravel.com/docs/12.x/eloquent-resources#conditional-relationships',
          source: 'Laravel',
          note: '`whenLoaded` dan `whenCounted` yang mencegah N+1 lahir di lapisan respons.',
        },
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

      terms(
        {
          term: 'Sanctum',
          meaning:
            'Paket autentikasi resmi Laravel untuk API dan SPA. Ia menyediakan **dua mekanisme yang sangat berbeda** dalam satu paket — dan memilih yang salah menghasilkan kombinasi yang tidak aman, atau yang tidak bekerja sama sekali.',
        },
        {
          term: 'mode token API',
          meaning:
            'Token dikirim di header `Authorization: Bearer`. Stateless, tanpa cookie, tanpa CSRF — cocok untuk aplikasi mobile, integrasi partner, dan klien server-to-server.',
        },
        {
          term: 'mode SPA cookie',
          meaning:
            'Memakai **sesi Laravel biasa** lewat cookie, bukan token. Cocok untuk SPA di domain yang sama, dan keunggulannya besar: token tidak pernah tersentuh JavaScript, jadi XSS tidak bisa mencurinya.',
        },
        {
          term: 'stateful domains',
          meaning:
            'Daftar domain yang diperlakukan sebagai SPA milikmu sendiri, dikonfigurasi di `SANCTUM_STATEFUL_DOMAINS`. Permintaan dari domain ini memakai sesi cookie; dari luar itu memakai token.',
        },
        {
          term: 'csrf-cookie',
          meaning:
            'Endpoint `/sanctum/csrf-cookie` yang harus dipanggil SPA **sebelum** permintaan yang mengubah data. Ia menyetel cookie CSRF yang kemudian dikirim balik sebagai header — pola double-submit.',
        },
        {
          term: 'ability',
          meaning:
            "Cakupan izin yang menempel pada sebuah token — `['artikel:baca']`. Ia membuat token yang bocor **terbatas kerusakannya**: token untuk integrasi baca-saja tidak bisa dipakai menghapus apa pun.",
        },
        {
          term: 'tokenCan',
          meaning:
            'Pemeriksaan ability di kode. Yang wajib diingat: ia **hanya berlaku pada mode token**. Pada mode SPA cookie, `tokenCan` selalu mengembalikan `true` — jadi otorisasi sungguhan tetap lewat Policy.',
        },
        {
          term: 'pencabutan token',
          meaning:
            'Karena token Sanctum **disimpan di database**, mencabutnya seketika itu mungkin — berbeda dari JWT yang berdiri sendiri. Ini keunggulan yang sering jadi alasan memilih Sanctum daripada JWT.',
        },
        {
          term: 'jangan campur dua mode',
          meaning:
            'Memakai cookie sesi **dan** token bearer di endpoint yang sama membuat model keamanannya kabur: mana yang berlaku, dan apakah CSRF perlu. Pilih satu per kelompok endpoint, dan nyatakan pilihannya di `routes/`.',
        },
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
      p(
        'Kunci mode SPA ada di daftar `stateful`. Sanctum memeriksa header `Origin`/`Referer` permintaan; kalau domainnya ada di daftar itu, ia **memakai sesi cookie biasa** alih-alih mencari token bearer. Perhatikan nilainya diambil dari environment — domain pengembangan (`localhost:3000`) tidak boleh ikut ke konfigurasi produksi, sama seperti aturan allow-list CORS di sub-bab 4.2.',
      ),
      p(
        'Perhatikan rutenya tetap memakai `auth:sanctum` yang sama persis dengan mode token. Itu memang rancangannya, yaitu satu middleware yang **memilih sendiri** mekanisme mana yang berlaku berdasarkan asal permintaannya. Sisi baiknya, kode rute tidak berubah. Sisi yang perlu diwaspadai, mana yang sedang berlaku tidak terlihat dari berkas rute, dan itulah alasan daftar istilah memperingatkan agar tidak mencampur dua mode di kelompok endpoint yang sama.',
      ),
      p(
        'Panggilan ke `/sanctum/csrf-cookie` dilakukan **sekali** di awal, bukan sebelum setiap permintaan. Ia menyetel cookie `XSRF-TOKEN`, dan library HTTP seperti Axios membacanya lalu mengirimkannya kembali sebagai header `X-XSRF-TOKEN` secara otomatis. Itu pola double-submit dari sub-bab 5.3: perlindungannya bekerja karena situs lain **tidak bisa membaca** cookie-mu, sehingga ia tidak bisa menyusun header yang cocok.',
      ),
      p(
        "Komentar `WAJIB` pada `credentials: 'include'` menandai kesalahan yang paling sering terjadi di mode ini. Secara bawaan `fetch` tidak menyertakan cookie pada permintaan lintas origin — jadi tanpa satu opsi itu, setiap permintaan sampai ke server tanpa sesi dan dijawab `401` walaupun penggunanya jelas sudah login. Opsi yang sama juga dibutuhkan pada panggilan `csrf-cookie` di atasnya; melewatkannya di sana membuat cookie-nya tidak pernah tersimpan.",
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
                    'error' => ['pesan' => 'Email atau password salah'],
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
      p(
        'Bagian atas fungsi ini menerapkan seluruh pelajaran auth-failures dari sub-bab 5.7 dalam bentuk Laravel. Kunci rate limiter menggabungkan email **dan** IP dalam satu string, menutup penebakan dari satu mesin sekaligus dari botnet. `Hash::check` tetap dijalankan terhadap `HASH_PALSU` saat pengguna tidak ada, sehingga waktu responsnya seragam. Dan kedua kegagalan dijawab pesan yang **sama persis**, supaya email terdaftar tidak bisa dienumerasi.',
      ),
      p(
        'Tiga argumen bernama pada `createToken` masing-masing menutup risiko yang berbeda. `name` mencatat perangkat asalnya — itulah yang nanti ditampilkan di halaman "perangkat aktif" supaya pengguna bisa mengenali sesi yang bukan miliknya. `abilities` membatasi **apa yang bisa dilakukan** token itu, sehingga token yang bocor terbatas kerusakannya. Dan `expiresAt` memberi masa berlaku; token tanpa kedaluwarsa yang pernah bocor berguna bagi penyerang selamanya.',
      ),
      p(
        'Komentar pada `plainTextToken` menandai sesuatu yang wajib dipahami sebelum membangun antarmukanya: nilai itu **hanya tersedia sekali**, di respons ini. Yang tersimpan di database hanyalah hash-nya, jadi tidak ada cara menampilkannya lagi nanti — persis alasan yang sama seperti password. Antarmuka harus menyampaikannya jelas ("salin sekarang, tidak akan ditampilkan lagi"), dan yang hilang hanya bisa diganti dengan menerbitkan token baru.',
      ),
      callout(
        'tip',
        'Argumen bernama membuat pemanggilan ini terbaca',
        'Ditulis sebagai `createToken($nama, $abilities, $expires)`, urutan ketiganya harus diingat dan mudah tertukar. Sintaks argumen bernama PHP 8 membuat maksud tiap nilai terbaca di tempat pemanggilan — dan menambah argumen baru di masa depan tidak memutus kode yang sudah ada.',
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
      p(
        'Dua bentuk pemeriksaan untuk dua kebutuhan. Middleware `ability:artikel:tulis` menjaga **seluruh rute** dan cocok saat satu endpoint memang butuh satu izin tertentu. `tokenCan(...)` di dalam kode dipakai saat izinnya bergantung pada apa yang sedang dikerjakan — misalnya satu endpoint yang boleh menyimpan draf dengan izin biasa tetapi butuh izin tambahan untuk langsung menerbitkan.',
      ),
      p(
        'Peringatan di bawah menyebut kekeliruan yang paling sering terjadi, dan pembedaannya perlu dipegang: **ability membatasi token, Policy membatasi pengguna atas objek**. Token dengan `artikel:tulis` tetap tidak boleh menulis artikel milik orang lain — dan `ability` sama sekali tidak memeriksa itu. Keduanya lapisan yang berbeda, dan lapisan objek dari sub-bab 5.1 tetap wajib ada.',
      ),
      p(
        'Ada satu jebakan lagi yang disebut daftar istilah: pada **mode SPA**, `tokenCan` selalu mengembalikan `true` karena tidak ada token yang membawa ability. Kode yang mengandalkannya sebagai satu-satunya penjagaan akan bekerja seperti diharapkan di mode token, lalu diam-diam meloloskan segalanya begitu endpoint yang sama diakses lewat cookie sesi.',
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
      p(
        'Ketiganya menghapus baris di database, dan **itulah keunggulan Sanctum atas JWT**. Token Sanctum tidak berdiri sendiri; ia dicari di tabel pada setiap permintaan, jadi menghapus barisnya membuatnya tidak berlaku **seketika**. JWT yang sudah terbit tidak bisa ditarik kembali tanpa mekanisme tambahan seperti `tokenVersi` atau deny-list yang dibahas di sub-bab 2.4.',
      ),
      p(
        'Perbedaan dua baris pertama menentukan pengalaman penggunanya. `currentAccessToken()` hanya mencabut token yang dipakai permintaan ini — tombol "keluar" biasa, yang tidak mengganggu sesi di ponsel. `tokens()->delete()` mencabut **semuanya**, dan itu yang dibutuhkan tombol "keluar dari semua perangkat".',
      ),
      p(
        'Komentar `WAJIB` pada blok ketiga menandai kelalaian yang membuat penggantian password hampir tidak berguna. Alasan utama orang mengganti password adalah kecurigaan akun dibajak — dan kalau token penyerang tetap sah setelahnya, tindakan itu tidak mengubah apa pun baginya, sementara korban mengira dirinya sudah aman. Perhatikan hal yang sama berlaku untuk perubahan peran: token lama masih membawa akses lama sampai dicabut.',
      ),

      h2('Bersihkan token kedaluwarsa'),
      code(
        'php',
        `
        // routes/console.php
        Schedule::command('sanctum:prune-expired --hours=24')->daily();
        `,
      ),
      p(
        'Tabel token bertambah satu baris setiap kali seseorang masuk dari perangkat baru, dan yang kedaluwarsa tidak hilang sendiri — ia hanya berhenti berlaku. Tanpa pembersihan, tabelnya tumbuh tanpa henti dan setiap pencarian token pada setiap permintaan ikut melambat.',
      ),
      p(
        'Perhatikan `--hours=24` bukan berarti "hapus yang berumur 24 jam", melainkan **hapus yang sudah kedaluwarsa lebih dari 24 jam lalu**. Jeda itu disengaja: token yang baru saja kedaluwarsa masih berguna untuk penelusuran — saat menyelidiki laporan "akun saya diakses orang lain", kolom nama perangkat dan waktu pemakaian terakhir dari token lama justru yang paling menjelaskan.',
      ),
      callout(
        'danger',
        'Token tanpa `expiresAt` berlaku selamanya',
        'Sanctum tidak memberi masa berlaku secara default. Token yang bocor dari log, dari perangkat yang hilang, atau dari repositori yang salah commit akan tetap sah bertahun-tahun. Selalu tetapkan `expiresAt`, dan jadwalkan pembersihannya.',
      ),
      references(
        {
          label: 'Laravel Sanctum',
          href: 'https://laravel.com/docs/12.x/sanctum',
          source: 'Laravel',
          note: 'Dua mode, konfigurasi stateful domains, dan alur `csrf-cookie` untuk SPA.',
        },
        {
          label: 'Sanctum — Token Abilities',
          href: 'https://laravel.com/docs/12.x/sanctum#token-abilities',
          source: 'Laravel',
          note: 'Termasuk penegasan bahwa `tokenCan` selalu `true` pada mode SPA cookie.',
        },
        {
          label: 'Authentication Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Pesan gagal seragam dan rate limit yang dipakai contoh login di atas.',
        },
        {
          label: 'Session Management Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Daftar peristiwa yang wajib mencabut token — termasuk ganti password.',
        },
      ),
    ],
  ),

  written(
    'policy-gate',
    'Policy & Gate',
    12,
    'Menaruh aturan "boleh apa" di satu tempat yang tidak bisa dilewati.',
    [
      terms(
        {
          term: 'Policy',
          meaning:
            'Kelas berisi aturan otorisasi untuk **satu model** — siapa boleh melihat, mengubah, menghapus. Ia memindahkan pertanyaan "boleh atau tidak" ke satu tempat, alih-alih tersebar sebagai `if` di setiap controller.',
        },
        {
          term: 'Gate',
          meaning:
            'Aturan otorisasi yang **tidak terikat model** — "boleh mengakses panel admin", "boleh melihat laporan keuangan". Untuk aturan yang menyentuh objek tertentu, Policy lebih tepat.',
        },
        {
          term: 'before()',
          meaning:
            'Metode yang dijalankan **sebelum** metode Policy lain. `true` meloloskan semua, `null` melanjutkan ke pemeriksaan biasa. **Jangan kembalikan `false`** — itu menolak setiap pemeriksaan, termasuk yang seharusnya lolos.',
        },
        {
          term: 'Response::deny',
          meaning:
            'Alternatif mengembalikan `false` yang membawa **pesan dan status code sendiri**. Berguna saat alasan penolakannya perlu dibedakan — misalnya `404` untuk data yang keberadaannya tidak boleh diketahui.',
        },
        {
          term: 'authorize()',
          meaning:
            'Pemanggilan di controller yang menjalankan Policy dan melempar `403` kalau ditolak. Wajib ada di **setiap** aksi yang menyentuh objek milik pengguna — dan itulah yang sering terlewat pada endpoint baru.',
        },
        {
          term: 'authorizeResource',
          meaning:
            'Memasang pemeriksaan Policy untuk **seluruh** metode resource controller sekaligus, di konstruktor. Ia mengubah "ingat memanggil `authorize`" menjadi "otorisasi terpasang secara default".',
        },
        {
          term: 'can pada middleware rute',
          meaning:
            "Bentuk `->middleware('can:update,artikel')` yang menjalankan Policy **sebelum** controller. Kelebihannya: penjagaan terlihat di daftar rute, jadi audit lewat `route:list` bisa menemukannya.",
        },
        {
          term: 'Policy tidak berlaku untuk daftar',
          meaning:
            'Batas yang paling sering luput. Policy memeriksa **satu objek**; untuk `index` tidak ada objek yang diperiksa. Daftar wajib di-scope lewat query — dan itu pemeriksaan yang sama sekali terpisah.',
        },
        {
          term: 'defense in depth',
          meaning:
            'Otorisasi ada di Policy **dan** di scope query. Bukan pengulangan sia-sia: kalau satu terlewat pada endpoint baru, yang lain masih menahan — dan endpoint baru itulah yang biasanya bocor.',
        },
      ),

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
      p(
        'Tipe kembalian `?bool` pada `before()` sudah memberi petunjuk bahwa ia punya **tiga** kemungkinan, bukan dua. `true` meloloskan segalanya, `null` berarti "saya tidak memutuskan, lanjutkan ke method biasa", dan `false` **menolak setiap pemeriksaan** — termasuk yang seharusnya lolos. Menuliskan `return $user->peran === \'admin\';` di situ akan menghasilkan `false` untuk semua non-admin dan mematikan seluruh policy-nya.',
      ),
      p(
        'Method `view` memperlihatkan aturan yang tidak bisa dijawab pemeriksaan kepemilikan saja: artikel **terbit** boleh dilihat siapa pun, artikel **draf** hanya pemiliknya. Perhatikan ini alasan Policy layak ada — aturan seperti ini kalau ditulis sebagai `if` di controller akan tersebar dan cepat menyimpang antar endpoint.',
      ),
      p(
        "`update` mengembalikan `Response`, bukan `bool`, dan itu membuka dua kemampuan yang tidak dimiliki `bool`. `Response::denyAsNotFound()` menjawab **`404` alih-alih `403`** — sesuai aturan sub-bab 5.7, `403` sudah membocorkan bahwa artikel dengan id itu memang ada. Sedangkan `Response::deny('...')` membawa **pesan sendiri**, sehingga penolakan karena artikelnya diarsipkan bisa dijelaskan ke pengguna. Perhatikan keduanya dipakai untuk alasan penolakan yang berbeda: yang pertama menyembunyikan, yang kedua menjelaskan.",
      ),
      p(
        'Method `terbitkan` menggabungkan **dua** lapisan dengan `&&`, yaitu kepemilikan objek dan ability token. Itu bentuk paling jujur dari aturannya, sebab penulis boleh menerbitkan tulisannya sendiri tetapi hanya kalau token yang ia pakai memang berwenang menerbitkan. Perhatikan nama method-nya bukan salah satu dari tujuh nama baku, karena aksi khusus memang butuh method Policy-nya sendiri alih-alih menumpang pada `update`.',
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
      p(
        'Empat tempat pemanggilan, dan perbedaannya bukan selera. `$this->authorize(...)` **melempar** saat ditolak, sehingga baris di bawahnya tidak pernah tercapai — bentuk yang tepat untuk aksi yang memang harus dihentikan. `$user->can(...)` mengembalikan `bool` tanpa melempar, dan itu yang kamu pakai untuk keputusan bersyarat, misalnya menyembunyikan tombol di respons.',
      ),
      p(
        "Bentuk `->can('update', 'artikel')` di rute punya kelebihan yang tidak dimiliki tiga lainnya: penjagaannya **terlihat di `route:list`**. Karena kolom middleware menampilkannya, audit rute dari sub-bab 5.1 bisa menemukan endpoint yang otorisasinya kurang — sesuatu yang mustahil kalau `authorize` hanya ada di dalam badan controller. Perhatikan argumen keduanya `'artikel'` sebagai **string**, yaitu nama parameter rutenya, bukan objeknya.",
      ),
      p(
        'Menaruhnya di `authorize()` milik Form Request menggeser pemeriksaan lebih awal lagi — ia berjalan **sebelum** validasi, sehingga permintaan dari orang yang tidak berhak ditolak tanpa servermu repot memvalidasi isinya. Pilih satu pola dan pakai konsisten; yang berbahaya bukan pilihannya, melainkan endpoint yang tidak memakai satu pun.',
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
      p(
        'Blok pertama adalah kebocoran yang tetap terjadi **walaupun policy-mu lengkap dan benar**. `Artikel::paginate(20)` tidak memanggil `ArtikelPolicy::view()` untuk satu baris pun — dan memang tidak bisa: Policy memeriksa satu objek, sementara endpoint daftar mengembalikan dua puluh sekaligus. Ini kesalahan otorisasi paling umum di Laravel justru karena kodenya terlihat bersih dan policy-nya sudah ada.',
      ),
      p(
        'Perbaikannya menerjemahkan aturan `view()` menjadi **syarat query**: yang terbit, atau yang penulisnya adalah peminta. Perhatikan closure `where(fn ($q) => ...)` yang membungkus keduanya — tanpa pengelompokan itu, `orWhere` akan berdiri sendiri dan membatalkan syarat lain yang mungkin ditambahkan sebelumnya, persis jebakan yang dibahas di sub-bab 6.2.',
      ),
      p(
        'Ada satu hal yang perlu diterima dari pendekatan ini: aturan yang sama kini ada di **dua tempat** — di `ArtikelPolicy::view()` dan di query ini. Keduanya harus dijaga tetap selaras, dan itu memang biayanya. Alternatif yang mengurangi duplikasi adalah memindahkan syaratnya ke query scope (`scopeTerlihatOleh($user)`) lalu memakainya dari kedua sisi, sehingga aturannya tetap hidup di satu tempat.',
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
      p(
        'Perhatikan closure Gate hanya menerima `User`, **tanpa objek kedua**. Itulah yang membedakannya dari Policy, sebab Gate menjawab pertanyaan yang tidak menyentuh baris data tertentu, seperti "boleh membuka dasbor admin" atau "boleh mengekspor". Begitu pertanyaannya menyangkut objek, misalnya "boleh mengubah artikel **ini**", Policy yang tepat.',
      ),
      p(
        'Gate kedua memakai `Response` alih-alih `bool`, dan alasannya sama seperti pada Policy, yaitu ia bisa membawa **pesan sendiri**. Untuk penolakan yang perlu dijelaskan ke pengguna, misalnya "hanya admin yang bisa mengekspor", itu jauh lebih berguna daripada `403` polos yang membuat orang menebak apa yang salah.',
      ),
      p(
        'Dua baris terakhir memperlihatkan bahwa Gate dipakai dengan cara yang sama seperti Policy: melempar lewat `Gate::authorize`, atau dipasang sebagai middleware rute. Bentuk middleware tetap lebih disukai untuk penjagaan tingkat rute karena ia **terlihat di `route:list`** — dan itulah yang membuat audit menemukan endpoint admin yang lupa dijaga.',
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
      p(
        "Komentar di baris pertama menyatakan aturannya: **periksa izin, bukan peran**. Kode yang menulis `if ($user->peran === 'admin')` tersebar di puluhan tempat akan menyakitkan begitu ada peran baru `supervisor` yang butuh sebagian hak admin — kamu harus menemukan dan mengubah semuanya, dan satu yang terlewat adalah celah atau bug.",
      ),
      p(
        "Dengan `punyaIzin('artikel.terbitkan')`, penambahan peran cukup menambah satu baris di konstanta `IZIN`. Perhatikan pemeriksaannya memakai `in_array($izin, $dimiliki, true)` dengan argumen ketiga `true` — perbandingan **ketat**, sehingga tidak ada konversi tipe yang bisa membuat nilai tak terduga lolos.",
      ),
      p(
        "Baris `'admin' => ['*']` beserta pemeriksaan `in_array('*', ...)` adalah jalan pintas yang perlu diambil sadar, sebab admin lolos **setiap** izin termasuk izin yang ditambahkan tahun depan dan belum pernah ditinjau siapa pun. Untuk kebanyakan aplikasi itu wajar, sedangkan untuk yang menyentuh uang atau data sangat sensitif, menyebutkan izin admin satu per satu lebih aman meski lebih repot. Perhatikan pula `?? []` menangani nilai peran yang tidak dikenal dengan **daftar kosong**, dan sekali lagi ketiadaan nilai jatuh ke sisi yang menolak.",
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
      p(
        '`Gate::after` berjalan **setelah setiap** pemeriksaan otorisasi di seluruh aplikasi — Policy maupun Gate. Itulah kekuatannya: satu blok di service provider mencatat semua penolakan, tanpa perlu menambah `log()` di setiap method Policy dan tanpa ada yang bisa terlupa pada endpoint baru.',
      ),
      p(
        'Perhatikan pemeriksaannya `$hasil === false`, bukan `!$hasil`. Bedanya menentukan: `$hasil` bertipe `?bool`, dan nilai `null` berarti **tidak ada aturan yang memutuskan** — bukan penolakan. Memakai `!$hasil` akan ikut mencatat setiap `null` sebagai penolakan, membanjiri log dengan peristiwa yang bukan apa-apa.',
      ),
      p(
        'Empat field yang dicatat memenuhi bentuk minimum catatan audit dari sub-bab 5.9, yaitu **siapa** (`penggunaId`), **apa** (`ability`), dan **objek mana** (`objek` beserta `objekId`), sementara waktu ditambahkan Laravel otomatis. Perhatikan `class_basename` dipakai alih-alih nama kelas lengkap agar log tetap ringkas, dan `?? null` di kedua tempat menangani Gate yang memang tidak punya objek. Dan seperti disebut di bawah, log tanpa alert bukan deteksi, sehingga lonjakan penolakan dari satu akun layak memicu peringatan.',
      ),
      callout(
        'tip',
        'Lonjakan penolakan adalah sinyal serangan',
        'Satu penolakan itu wajar. Lima puluh dari satu akun dalam semenit adalah seseorang yang sedang memetakan apa yang bisa ia sentuh. Ini termasuk kegagalan nomor sembilan OWASP — log tanpa alert bukan deteksi.',
      ),
      references(
        {
          label: 'Laravel — Authorization',
          href: 'https://laravel.com/docs/12.x/authorization',
          source: 'Laravel',
          note: 'Gate, Policy, `before()`, dan `Response::deny` beserta perilakunya.',
        },
        {
          label: 'Authorizing Actions Using Policies',
          href: 'https://laravel.com/docs/12.x/authorization#authorizing-actions-using-policies',
          source: 'Laravel',
          note: '`authorize`, `authorizeResource`, dan middleware `can` pada rute.',
        },
        {
          label: 'Authorization Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa periksa izin lebih tepat daripada periksa peran, dan default deny.',
        },
        {
          label: 'OWASP Top 10 — Broken Access Control',
          href: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
          source: 'OWASP',
          note: 'Endpoint daftar tanpa scope adalah bentuk paling umum kategori ini di Laravel.',
        },
      ),
    ],
  ),

  written(
    'queue-horizon',
    'Queue & Job, Horizon',
    12,
    'Pekerjaan latar di Laravel, beserta pemantauannya.',
    [
      terms(
        {
          term: 'job',
          meaning:
            'Kelas yang membungkus satu pekerjaan latar. Ia diserialisasi ke antrean lalu dijalankan proses **worker** terpisah — jadi apa pun yang ia bawa harus bisa diserialisasi, dan itu punya konsekuensi.',
        },
        {
          term: 'SerializesModels',
          meaning:
            'Trait yang membuat job menyimpan **id model**, bukan seluruh objeknya, lalu mengambilnya lagi saat dijalankan. Efek sampingnya penting: kalau baris itu **dihapus** sebelum job jalan, job akan gagal — dan itu perilaku yang benar.',
        },
        {
          term: 'queue connection vs queue name',
          meaning:
            '**Connection** adalah backend-nya (Redis, database, SQS). **Queue name** adalah jalur di dalamnya (`default`, `email`, `laporan`). Memisahkan jalur membuat job lambat tidak menghambat job cepat.',
        },
        {
          term: 'tries & backoff',
          meaning:
            'Berapa kali job dicoba, dan jeda antar percobaan. `$backoff = [10, 60, 300]` memberi jeda berbeda per percobaan — memberi layanan yang bermasalah waktu untuk pulih sebelum dicoba lagi.',
        },
        {
          term: 'failed()',
          meaning:
            'Metode yang dipanggil setelah job **habis percobaannya**. Di sinilah kegagalan dicatat, pengguna diberi tahu, atau keadaan dikembalikan. Job tanpa `failed()` gagal diam-diam.',
        },
        {
          term: 'failed_jobs',
          meaning:
            'Tabel tempat job yang gagal permanen disimpan. Ia hanya berguna kalau **ada yang membukanya** — antrean gagal yang tidak pernah dilihat sama saja dengan membuang pekerjaannya.',
        },
        {
          term: 'WithoutOverlapping',
          meaning:
            'Middleware job yang mencegah dua job dengan kunci sama berjalan bersamaan. Ia menutup kelas bug balapan pada job — misalnya dua sinkronisasi untuk akun yang sama yang saling menimpa.',
        },
        {
          term: 'Horizon',
          meaning:
            'Dasbor pemantauan antrean Laravel untuk Redis. Ia menampilkan throughput, job gagal, dan waktu tunggu — dan **wajib dilindungi autentikasi**, karena ia menampilkan payload job.',
        },
        {
          term: 'dispatchAfterResponse',
          meaning:
            'Menjalankan pekerjaan **setelah respons dikirim**, di proses yang sama. Cocok untuk hal ringan yang tidak perlu antrean penuh — tapi ia hilang kalau proses mati, jadi bukan untuk pekerjaan yang penting.',
        },
      ),

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
      p(
        'Komentar di konstruktor menandai keputusan yang paling menentukan, yaitu **simpan id, bukan objek**. Payload job diserialisasi ke penyimpanan antrean dan terlihat di dashboard Horizon, jadi objek `User` utuh berarti email dan kolom lain ikut tersimpan di tempat yang aksesnya lebih longgar. Alasan kedua sama pentingnya, sebab data di payload sudah **basi** saat job berjalan. Pengguna bisa mengganti emailnya dalam jeda itu, dan job akan mengirim ke alamat lama.',
      ),
      p(
        'Empat properti di atas konstruktor membatasi kegagalan dari arah berbeda. `$tries = 5` membatasi jumlah percobaan. `$timeout = 30` memutus job yang menggantung, sebab tanpanya satu panggilan email yang tidak pernah dijawab menahan worker selamanya. `$maxExceptions = 3` lebih ketat lagi, karena job boleh dicoba lima kali tetapi kalau **tiga** di antaranya melempar pengecualian ia langsung menyerah. Dan `retryUntil()` memberi batas waktu mutlak, sehingga setelah sepuluh menit tidak ada percobaan lagi berapa pun sisa `$tries`.',
      ),
      p(
        'Blok `if` di dalam `handle()` menangani dua keadaan yang sama-sama berarti "tidak perlu dikerjakan": penggunanya sudah dihapus, atau emailnya sudah terverifikasi. Perhatikan keduanya `return` biasa, **bukan** melempar — melempar akan menandainya gagal dan memicu empat percobaan ulang untuk sesuatu yang tidak akan pernah berubah. Membedakan "gagal" dari "tidak perlu dikerjakan" adalah bagian dari menulis job yang sehat.',
      ),
      p(
        '`backoff()` mengembalikan array, bukan satu angka, sehingga jedanya bisa berbeda per percobaan: 2 detik, lalu 5, 15, 60. Jeda yang naik memberi layanan yang bermasalah waktu untuk pulih alih-alih membanjirinya. Dan `failed()` adalah satu-satunya tempat kegagalan permanen terlihat — job tanpa method ini **gagal diam-diam**, dan tidak ada yang tahu email verifikasi itu tidak pernah terkirim.',
      ),
      callout(
        'danger',
        'Jangan menaruh objek Eloquent utuh di konstruktor job',
        'Laravel menyerialisasinya ke penyimpanan antrean. Isinya, termasuk kolom sensitif, tersimpan dalam bentuk yang bisa dibaca dan terlihat di dashboard Horizon. Oper **ID**, lalu ambil datanya di dalam `handle()`. Ini juga menghindari memakai data yang sudah basi saat job akhirnya berjalan.',
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
      p(
        "Blok pertama menutup celah **at-least-once** dengan cara yang sama seperti pengurangan stok di sub-bab 2.3: `where('status', 'menunggu')->update(...)` menggabungkan pemeriksaan dan perubahan dalam satu operasi yang tidak bisa disela. Dua eksekusi yang berjalan bersamaan sama-sama mencoba, tetapi hanya satu menemukan statusnya masih `menunggu` — yang kalah mendapat `$klaim === 0` dan berhenti. Perhatikan sekali lagi ia `return`, bukan melempar.",
      ),
      p(
        'Blok kedua menyerang masalah yang sama dari arah berbeda, sebab alih-alih menangani kembaran, ia **mencegahnya berjalan bersamaan**. `WithoutOverlapping` dengan kunci `"pembayaran:{$id}"` memastikan hanya satu job untuk pembayaran itu yang aktif, sedangkan yang lain ditunda. Perhatikan kuncinya menyertakan id, sebab memakai kunci tetap seperti `"pembayaran"` akan menyerialkan **seluruh** pembayaran menjadi satu antrean berurutan, dan itu bukan yang kamu mau.',
      ),
      p(
        'Dua opsi di bawahnya menutup kegagalan dari mekanisme kuncinya sendiri. `expireAfter(180)` melepas kunci setelah tiga menit — tanpa itu, job yang mati sebelum sempat melepas kuncinya akan memblokir pembayaran itu **selamanya**. `releaseAfter(10)` menentukan berapa lama job yang tertahan menunggu sebelum dikembalikan ke antrean untuk dicoba lagi.',
      ),
      p(
        'Keduanya bukan pilihan yang saling menggantikan. `WithoutOverlapping` mencegah **tumpang tindih waktu**, tetapi tidak mencegah job yang sama dijalankan lagi setelah yang pertama selesai — dan pengiriman ulang dari antrean justru sering terjadi setelah itu. Klaim atomik di blok pertama yang menutupnya. Untuk pembayaran, pakai keduanya.',
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
      p(
        'Perbedaan dua baris itu bukan soal opsi melainkan **cara prosesnya dijaga hidup**. `queue:work` adalah proses yang berjalan terus, dan kalau ia mati karena kehabisan memori atau karena server restart, tidak ada yang mengambil job sampai seseorang menyadarinya. Supervisor atau systemd yang menyalakannya kembali secara otomatis, dan tanpa itu antreanmu diam-diam berhenti bekerja.',
      ),
      p(
        '`--max-jobs=1000` dan `--max-time=3600` terlihat berlawanan dengan tujuan "jangan mati", padahal justru melengkapinya: keduanya membuat worker **sengaja berhenti** setelah seribu job atau satu jam, lalu supervisor menyalakannya lagi dengan proses baru yang bersih. PHP tidak dirancang untuk proses berumur panjang, dan kebocoran memori kecil yang menumpuk selama berhari-hari akhirnya menjatuhkan worker pada saat yang tidak kamu pilih. Restart terjadwal mengubahnya menjadi peristiwa yang terkendali.',
      ),
      p(
        'Peringatan berikutnya adalah konsekuensi langsung dari sifat proses panjang itu: worker **memuat kode sekali** saat dijalankan. Setelah deploy, worker lama masih menjalankan kode lama — sehingga perbaikan yang sudah rilis tetap gagal dengan cara yang persis sama. Ini bug yang sangat membingungkan karena kodenya jelas sudah benar. Setiap deploy wajib menjalankan `php artisan queue:restart`, yang memberi sinyal ke worker untuk berhenti dengan rapi setelah job yang sedang berjalan selesai.',
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
      p(
        'Memisahkan jalur antrean menyelesaikan masalah yang nyata: **job lambat menghambat job cepat**. Tanpa pemisahan, satu laporan bulanan yang memakan lima menit membuat email verifikasi di belakangnya menunggu lima menit juga — dan pengguna yang baru mendaftar menyangka pendaftarannya gagal.',
      ),
      p(
        'Perhatikan urutan pada `--queue=tinggi,default,rendah` **menentukan prioritas**. Worker selalu mengosongkan `tinggi` sampai habis sebelum menyentuh `default`, lalu `rendah`. Konsekuensinya perlu disadari: kalau `tinggi` terus terisi, `rendah` bisa **tidak pernah** dikerjakan. Untuk mencegahnya, jalankan worker terpisah yang khusus melayani `rendah` — itulah gunanya beberapa proses worker dengan konfigurasi berbeda.',
      ),
      callout(
        'tip',
        'Jangan menaruh terlalu banyak jalur',
        'Setiap jalur butuh kapasitas worker sendiri agar tidak menganggur. Dua sampai empat jalur, misalnya `tinggi`, `default`, dan `rendah`, cukup untuk hampir semua aplikasi. Sepuluh jalur biasanya berarti sebagian di antaranya jarang tersentuh.',
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
      p(
        'Keduanya menjalankan banyak job, tetapi menjawab kebutuhan yang berlawanan. **Chain** menjalankan berurutan dan **berhenti** kalau satu gagal — itu yang kamu mau di contoh ini: tidak ada gunanya mengirim struk untuk pembayaran yang gagal diproses. Urutan dan ketergantungannya nyata.',
      ),
      p(
        '**Batch** menjalankan paralel, cocok untuk pekerjaan yang saling bebas — mengirim seribu email, memproses seribu gambar. Nilainya ada pada **pemantauan bersama**: `then` berjalan sekali setelah semuanya selesai, dan `catch` sekali saat ada yang gagal. Tanpa batch, mengetahui "kapan seribu job ini selesai semua" berarti melacaknya sendiri.',
      ),
      p(
        '`allowFailures()` mengubah perilaku default yang penting untuk dipahami, sebab tanpa itu satu job gagal **membatalkan sisa batch** yang belum dijalankan. Untuk pengiriman email massal itu keliru, karena satu alamat yang tidak valid tidak boleh menghentikan 999 lainnya. Untuk pekerjaan yang saling bergantung, justru pembatalan itu yang benar, tapi kalau begitu chain kemungkinan pilihan yang lebih tepat sejak awal.',
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
      p(
        'Horizon dipasang lewat paket dan langsung punya rutenya sendiri — tanpa kamu menulis satu baris pun di berkas rute. Itulah yang membuatnya sering luput dari audit: ia muncul di `route:list`, tetapi tidak ada berkas di project-mu yang menyebutnya, sehingga ia tidak ketemu saat kamu menelusuri kode.',
      ),
      p(
        'Komentar berhuruf besar menyebut alasan gate-nya wajib. Horizon menampilkan **payload job** — dan menurut aturan di atas, payload seharusnya hanya berisi id. Tetapi satu job saja yang membawa data lengkap sudah cukup untuk memampangkannya di sana. Lebih dari itu, Horizon juga mengizinkan **mencoba ulang dan menghapus** job; dibiarkan terbuka, ia bukan hanya membocorkan tetapi memberi kendali.',
      ),
      p(
        'Perhatikan gate-nya bernama `viewHorizon` — nama itu ditentukan paketnya, bukan pilihanmu, dan Horizon memanggilnya sendiri. Hal yang sama berlaku untuk `viewTelescope` dan `viewPulse`. Ketiganya harus dipasang, dan "alamatnya tidak ditautkan di mana pun" bukan kontrol akses, sesuai prinsip zero trust di sub-bab 5.5.',
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
        'Keempat perintah ini bekerja pada tabel `failed_jobs` — tempat job yang **habis percobaannya** mendarat. `queue:failed` menampilkan daftarnya beserta pesan errornya, dan itulah yang harus rutin dibuka; antrean gagal yang tidak pernah dilihat sama saja dengan membuang pekerjaannya.',
      ),
      p(
        '`queue:retry <id>` mengembalikan satu job ke antrean, dan `retry all` mengembalikan semuanya. Perhatikan mencoba ulang hanya masuk akal setelah **penyebabnya diperbaiki** — kalau job gagal karena bug di kodenya, `retry all` hanya akan mengulang kegagalan yang sama. Dan di sinilah idempotensi tadi terbayar: job yang aman dijalankan berulang bisa di-`retry` tanpa takut memproses pembayaran dua kali.',
      ),
      p(
        '`queue:flush` **menghapus** seluruh isi tabel tanpa konfirmasi. Jalankan hanya setelah kamu benar-benar memeriksa isinya — yang terhapus di sana adalah bukti tentang pekerjaan yang tidak pernah terjadi, dan tidak ada cara mengembalikannya. Pasang alert saat jumlah job gagal melonjak; itu yang mengubah tabel ini dari arsip menjadi deteksi.',
      ),
      references(
        {
          label: 'Laravel — Queues',
          href: 'https://laravel.com/docs/12.x/queues',
          source: 'Laravel',
          note: 'Job, connection, `tries`, `backoff`, dan `failed()` beserta perilakunya.',
        },
        {
          label: 'Queues — Job Middleware',
          href: 'https://laravel.com/docs/12.x/queues#job-middleware',
          source: 'Laravel',
          note: '`WithoutOverlapping` dan middleware job lain yang mencegah balapan.',
        },
        {
          label: 'Queues — Job Batching & Chaining',
          href: 'https://laravel.com/docs/12.x/queues#job-batching',
          source: 'Laravel',
          note: 'Beda `Bus::chain` yang berurutan dari `Bus::batch` yang paralel.',
        },
        {
          label: 'Laravel Horizon',
          href: 'https://laravel.com/docs/12.x/horizon',
          source: 'Laravel',
          note: 'Pemantauan antrean, termasuk gate yang melindungi dasbornya.',
        },
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

      terms(
        {
          term: 'event',
          meaning:
            'Objek yang menyatakan **sesuatu telah terjadi** — `ArtikelDiterbitkan`. Kode yang menerbitkan tidak perlu tahu ada email yang harus dikirim. Itu keuntungannya; harganya dibahas di bawah.',
        },
        {
          term: 'listener',
          meaning:
            'Kelas yang **bereaksi** terhadap sebuah event. Sejak Laravel 11, ia ditemukan otomatis dari tipe parameter `handle()` — jadi tidak ada pendaftaran manual yang bisa terlupa.',
        },
        {
          term: 'ShouldQueue',
          meaning:
            'Antarmuka yang membuat listener berjalan **di antrean**, bukan di jalur permintaan. Tanpa itu, pengiriman notifikasi ke seribu pengikut terjadi sebelum respons dikirim — dan pengguna menunggu selama itu.',
        },
        {
          term: 'alur yang tidak terlihat',
          meaning:
            'Harga yang dibayar event. Membaca kode yang memanggil `event(...)` **tidak memberi tahu** apa yang akan terjadi berikutnya — kamu harus mencari listener-nya. Ini beban nyata saat menelusuri masalah.',
        },
        {
          term: 'observer',
          meaning:
            'Kelas yang bereaksi terhadap **peristiwa siklus hidup model** — `creating`, `updated`, `deleted`. Ia tempat yang tepat untuk hal yang **selalu** harus terjadi: membuat slug, membersihkan cache.',
        },
        {
          term: 'creating vs created',
          meaning:
            'Bentuk **-ing** berjalan **sebelum** disimpan dan bisa mengubah datanya. Bentuk **-ed** berjalan **sesudah**, dan perubahan di sana tidak ikut tersimpan. Salah memilih menghasilkan data yang tidak berubah tanpa error.',
        },
        {
          term: 'observer tidak berjalan pada query massal',
          meaning:
            'Jebakan yang penting. `Artikel::where(...)->delete()` dan `updateMany` **melewati** observer sepenuhnya — karena tidak ada instance model yang dibuat. Kalau observer memuat aturan yang menentukan, aturan itu terlewat diam-diam.',
        },
        {
          term: 'kapan pakai event',
          meaning:
            'Saat efek sampingnya **opsional dan bisa bertambah** — notifikasi, analitik, pencatatan. Untuk langkah yang **wajib** bagi kebenaran operasi, panggil langsung: alur yang jelas lebih berharga daripada pemisahan.',
        },
        {
          term: 'event di dalam transaksi',
          meaning:
            'Listener bisa berjalan **sebelum transaksinya di-commit** — jadi ia melihat data yang belum tentu tersimpan. Laravel menyediakan `afterCommit` untuk itu, dan job yang mengambil ulang dari database wajib memakainya.',
        },
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
      p(
        'Kelas event itu sendiri hampir kosong, karena ia hanya **pembawa data** tentang sesuatu yang sudah terjadi. Perhatikan namanya berbentuk lampau, yaitu `ArtikelDiterbitkan` dan bukan `TerbitkanArtikel`. Itu bukan sekadar gaya, sebab ia menandai bahwa event **melaporkan** alih-alih memerintah. Kelas yang memerintah adalah job atau action, dan membedakan keduanya lewat penamaan menghemat banyak kebingungan.',
      ),
      p(
        '`implements ShouldQueue` pada listener adalah satu baris yang memindahkannya **keluar dari jalur permintaan**. Tanpa itu, listener berjalan sinkron — dan mengirim notifikasi ke ribuan pengikut akan membuat permintaan "terbitkan artikel" menggantung sampai selesai. Perhatikan `chunkById(500, ...)` di dalamnya: jumlah pengikut tidak terbatas, jadi memuat semuanya sekaligus bisa menghabiskan memori worker.',
      ),
      p(
        'Sejak Laravel 11, listener **ditemukan otomatis** dari tipe parameter `handle()` — tidak perlu pendaftaran manual di service provider. Nyaman, tetapi ada konsekuensinya: hubungan antara event dan listener-nya tidak lagi terlihat di satu berkas mana pun. Untuk menelusurinya, cari kelas event-nya, atau jalankan `php artisan event:list`.',
      ),
      p(
        'Perhatikan `event(...)` dipanggil setelah artikelnya benar-benar diterbitkan. Dan di sinilah jebakan yang disebut daftar istilah berlaku: kalau pemanggilan ini berada **di dalam** `DB::transaction`, listener antrean bisa berjalan sebelum transaksinya di-commit — sehingga ia mengambil artikel dari database dan tidak menemukannya. Untuk kasus itu, listener perlu ditandai `afterCommit`.',
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
      p(
        'Observer memasang kode pada **peristiwa siklus hidup model**, yaitu `creating`, `created`, `updating`, `deleted`, dan seterusnya. Perhatikan beda bentuk berlangsung dan bentuk lampau. `creating` berjalan **sebelum** baris ditulis, jadi mengubah `$artikel->slug` di sana ikut tersimpan. `deleted` berjalan **sesudah**, jadi ia tepat untuk membersihkan cache karena pada titik itu penghapusannya sudah pasti terjadi.',
      ),
      p(
        'Atribut `#[ObservedBy(...)]` di atas kelas model adalah cara Laravel 11 mendaftarkan observer, menggantikan pendaftaran manual di service provider. Perhatikan `??=` pada pengisian slug: ia hanya mengisi kalau nilainya belum ada, sehingga slug yang sengaja ditentukan pemanggil tidak ditimpa.',
      ),
      p(
        'Peringatan di bawah menyebut batas yang paling sering menjadi bug, yaitu **observer tidak berjalan pada operasi massal**. `Artikel::where(...)->update([...])` dan `delete()` massal bekerja langsung di tingkat SQL tanpa memuat model satu per satu, jadi tidak ada peristiwa yang dipancarkan. Akibatnya slug tidak terisi, cache tidak dibersihkan, audit log tidak tercatat, dan **tidak ada error apa pun**. Kalau kamu butuh peristiwanya, ambil barisnya lalu ubah satu per satu, atau bersihkan cache secara eksplisit setelah operasi massal.',
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
      p(
        'Komentar di kolom kiri menyatakan masalahnya, yaitu **dari kode pemanggil tidak ada petunjuk bahwa ini terjadi**. Orang yang membaca `Pesanan::create($data)` tidak punya alasan menduga total dan pajaknya dihitung di tempat lain. Dan ketika angkanya salah, ia akan menelusuri service, controller, dan request, tiga tempat yang semuanya benar, sebelum akhirnya menemukan observer yang tidak pernah ia cari.',
      ),
      p(
        'Catatan kedua lebih berbahaya lagi: **dilewati operasi massal**. Impor pesanan lewat `insert()` massal akan menghasilkan baris dengan `total` bernilai nol, tanpa satu pun error. Untuk perhitungan uang, itu kerusakan data yang senyap.',
      ),
      p(
        'Batas yang berguna disebut di bawah dan layak dihafal. Observer cocok untuk hal yang **melengkapi**, seperti mengisi slug, membersihkan cache, dan mencatat audit, tetapi ia tidak cocok untuk hal yang **menentukan**, seperti menghitung harga, memvalidasi aturan, dan memutuskan status. Ujinya sederhana. Kalau langkah itu dilewati, apakah datanya sekadar kurang rapi, atau **salah**? Yang bisa salah harus terlihat di jalur utamanya.',
      ),
      callout(
        'tip',
        'Batas yang berguna',
        'Observer cocok untuk hal yang **melengkapi**, seperti mengisi slug, membersihkan cache, dan mencatat audit. Ia tidak cocok untuk hal yang **menentukan**, seperti menghitung harga, memvalidasi aturan, atau memutuskan status. Yang menentukan harus terlihat di jalur utamanya.',
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
      p(
        'Masalah yang ditutup keduanya adalah **balapan antara worker dan transaksi**. Ketika `event(...)` dipanggil di dalam `DB::transaction`, job listener-nya langsung masuk antrean — dan worker bisa mengambilnya dalam milidetik, sebelum transaksinya sempat di-commit. Job lalu mencari artikel di database dan **tidak menemukannya**, karena dari sudut pandang koneksi lain, baris itu belum ada.',
      ),
      p(
        'Yang membuatnya sulit dilacak: kegagalannya **tidak konsisten**. Di laptop dengan satu worker dan database lokal, transaksinya hampir selalu menang balapan dan semuanya tampak baik. Di produksi dengan beberapa worker dan latensi jaringan, sebagian job gagal dengan `ModelNotFoundException` yang terlihat mustahil — artikelnya jelas ada saat kamu memeriksanya.',
      ),
      p(
        'Perhatikan bahaya keduanya lebih dari sekadar gagal: transaksi bisa **di-rollback** setelah job berjalan. Kalau job itu sudah mengirim email "artikelmu terbit", email itu tidak bisa ditarik kembali sementara artikelnya tidak pernah ada. Pilih `ShouldHandleEventsAfterCommit` untuk listener yang selalu butuh perilaku ini, dan `DB::afterCommit(...)` saat hanya satu pemanggilan tertentu yang memerlukannya.',
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
      p(
        '`Event::fake([...])` **mencegah** event dipancarkan sungguhan lalu mencatat pemanggilannya. Perhatikan ia diberi array berisi satu kelas, bukan dipanggil kosong: memalsukan **semua** event akan ikut mematikan event internal Laravel yang mungkin dibutuhkan alur ini — dan tesnya gagal karena alasan yang tidak ada hubungannya.',
      ),
      p(
        'Yang diuji di sini adalah **kontrak antara controller dan listener**, bukan efek akhirnya. Tes ini membuktikan endpoint memancarkan event yang benar; apakah notifikasinya terkirim adalah tanggung jawab tes listener secara terpisah. Pemisahan itu membuat keduanya cepat dan tidak saling menggagalkan.',
      ),
      p(
        'Closure pada `assertDispatched` yang membuat assertion ini bermakna. Tanpanya, tes hanya membuktikan "ada event `ArtikelDiterbitkan` yang dipancarkan" — dan itu tetap hijau kalau kodenya keliru memancarkan event untuk artikel **yang salah**. `fn ($e) => $e->artikel->is($artikel)` memeriksa artikel di dalam event benar-benar yang dimaksud; perhatikan `->is(...)` dipakai alih-alih `==`, karena ia membandingkan kunci primer dan tabelnya, bukan seluruh atribut yang bisa berbeda setelah disimpan.',
      ),
      callout(
        'warning',
        'Terlalu banyak event membuat alur mustahil diikuti',
        'Rantai "event memicu listener yang memancarkan event lain" berakhir sebagai sistem yang tidak bisa dijelaskan siapa pun. Kalau kamu harus mencari di seluruh codebase untuk menjawab "apa yang terjadi setelah artikel diterbitkan", event sudah dipakai terlalu banyak.',
      ),
      references(
        {
          label: 'Laravel — Events',
          href: 'https://laravel.com/docs/12.x/events',
          source: 'Laravel',
          note: 'Event, listener, penemuan otomatis, dan `ShouldQueue`.',
        },
        {
          label: 'Eloquent — Observers',
          href: 'https://laravel.com/docs/12.x/eloquent#observers',
          source: 'Laravel',
          note: 'Termasuk penegasan bahwa observer dilewati pada operasi massal.',
        },
        {
          label: 'Events — Queued Event Listeners after commit',
          href: 'https://laravel.com/docs/12.x/events#queued-event-listeners-and-database-transactions',
          source: 'Laravel',
          note: 'Kenapa listener bisa berjalan sebelum transaksi di-commit, dan cara mencegahnya.',
        },
        {
          label: 'Laravel — Event Fakes',
          href: 'https://laravel.com/docs/12.x/mocking#event-fake',
          source: 'Laravel',
          note: '`Event::fake` dan `assertDispatched` yang dipakai contoh tes di atas.',
        },
      ),
    ],
  ),

  written(
    'task-scheduling',
    'Task Scheduling',
    9,
    'Pekerjaan berkala yang terdefinisi di kode, bukan di crontab server.',
    [
      terms(
        {
          term: 'task scheduling',
          meaning:
            'Menetapkan pekerjaan berkala **di dalam kode**, bukan di crontab server. Bedanya menentukan: jadwal ikut di-review, ikut di-commit, dan ikut ter-deploy — bukan pengetahuan yang hanya ada di satu mesin.',
        },
        {
          term: 'satu entri cron',
          meaning:
            'Seluruh jadwal Laravel dijalankan **satu** entri cron yang memanggil `schedule:run` tiap menit. Server tidak perlu tahu apa pun tentang isi jadwalnya — dan itulah yang membuatnya bisa berpindah mesin tanpa konfigurasi ulang.',
        },
        {
          term: 'withoutOverlapping',
          meaning:
            'Mencegah jadwal yang sama berjalan bersamaan kalau eksekusi sebelumnya belum selesai. Tanpa itu, tugas yang mulai memakan waktu lebih lama dari intervalnya akan menumpuk sampai server kehabisan sumber daya.',
        },
        {
          term: 'onOneServer',
          meaning:
            'Memastikan sebuah jadwal hanya berjalan di **satu** server saat aplikasi berjalan di beberapa mesin. Tanpa itu, laporan bulanan terkirim sebanyak jumlah servermu.',
        },
        {
          term: 'runInBackground',
          meaning:
            'Menjalankan tugas tanpa menahan penjadwal. Diperlukan untuk tugas panjang — kalau tidak, tugas berikutnya di menit yang sama tertunda menunggu yang ini selesai.',
        },
        {
          term: 'zona waktu jadwal',
          meaning:
            'Jadwal mengikuti zona waktu aplikasi kecuali disebut lain. Menetapkannya eksplisit penting untuk laporan yang harus jatuh pada jam lokal tertentu — dan menghindari kejutan saat server dipindah.',
        },
        {
          term: 'jadwal harus idempoten',
          meaning:
            'Alasan yang sama dengan job antrean: eksekusi bisa tumpang tindih, terlambat, atau terulang setelah kegagalan. Tugas yang mengasumsikan "berjalan tepat sekali" akan salah cepat atau lambat.',
        },
        {
          term: 'pemantauan jadwal',
          meaning:
            'Tugas terjadwal **gagal dalam diam** — tidak ada pengguna yang melapor. Pemantauannya harus aktif: `pingOnSuccess`/`pingOnFailure` ke layanan pemantau, atau alert saat tugas tidak muncul di jendela yang diharapkan.',
        },
        {
          term: 'schedule:list',
          meaning:
            'Perintah yang menampilkan seluruh jadwal beserta waktu jalan berikutnya. Ia cara tercepat memverifikasi jadwal benar-benar terdaftar — dan menemukan yang ternyata tidak pernah berjalan.',
        },
      ),

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
      p(
        'Tiga bentuk penjadwalan untuk tiga kebutuhan berbeda. `Schedule::command` menjalankan perintah artisan, dan ini bentuk yang paling sering dipakai karena perintahnya juga bisa dijalankan manual saat menyelidiki masalah. `Schedule::job` menaruh pekerjaannya ke **antrean**, sehingga penjadwal tidak menunggu selesai dan pekerjaan berat berjalan di worker. `Schedule::call` menjalankan closure langsung di proses penjadwal, praktis untuk hal ringan, tetapi pekerjaan berat di sana akan menahan `schedule:run` sampai menit berikutnya.',
      ),
      p(
        'Baris cron di blok kedua adalah bagian yang paling sering mengejutkan, sebab **hanya ada satu entri untuk seluruh jadwal** dan ia berjalan setiap menit. Server tidak tahu apa pun tentang isi jadwalmu, karena `schedule:run` yang memeriksa tugas mana yang jatuh tempo menit ini. Konsekuensinya bagus, sebab menambah, mengubah, atau menghapus jadwal cukup lewat commit dan server tidak perlu disentuh sama sekali.',
      ),
      p(
        'Perhatikan `cd /var/www/app` di depan perintahnya. Cron berjalan dari direktori home, bukan dari direktori project, jadi tanpa `cd` perintahnya tidak menemukan `artisan`. Dan `>> /dev/null 2>&1` membuang keluarannya supaya cron tidak mengirim email untuk setiap menit — tetapi perhatikan itu **juga membuang pesan errornya**, dan itulah alasan pemantauan lewat `onFailure`/`pingOnSuccess` di bagian bawah menjadi wajib.',
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
      p(
        '`withoutOverlapping(60)` mencegah eksekusi baru dimulai kalau yang sebelumnya belum selesai — masalah nyata untuk laporan yang kadang memakan lebih lama dari jeda jadwalnya. Angka 60 itu **batas waktu kuncinya dalam menit**, dan komentar di atasnya menyebutnya wajib: tanpa batas, proses yang mati sebelum sempat melepas kunci akan memblokir tugas itu **selamanya**, dan tidak ada yang tahu sampai seseorang menyadari laporan bulanan berhenti datang.',
      ),
      p(
        '`onOneServer()` menutup masalah yang muncul begitu aplikasimu berjalan di lebih dari satu instance. Tanpa itu, **setiap** server menjalankan jadwal yang sama — tiga instance berarti laporan dibuat tiga kali dan email terkirim tiga kali. Perhatikan syaratnya: ia mengandalkan **cache bersama** (Redis atau database) untuk menentukan siapa yang menang. Dengan cache per-proses, ia tidak melakukan apa-apa dan diam-diam tidak menjaga apa pun.',
      ),
      p(
        '`runInBackground()` menjalankan tugasnya sebagai proses terpisah, sehingga `schedule:run` selesai seketika alih-alih menunggu laporan rampung. Tanpa itu, satu tugas yang berjalan tiga menit membuat jadwal menit-menit berikutnya terlewat. Dan `timezone(\'Asia/Jakarta\')` disebut eksplisit karena server hampir selalu berjalan di UTC — "jam 2 pagi" tanpa zona waktu berarti jam 9 pagi waktu Jakarta, tepat saat trafik mulai ramai.',
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
      p(
        '`schedule:list` adalah perintah yang paling menghemat waktu, dan ia menjawab pertanyaan yang tidak bisa dijawab dengan membaca `routes/console.php`: **apa yang benar-benar terdaftar, dan kapan berjalan berikutnya**. Jadwal bisa lahir dari paket pihak ketiga, dan ekspresi cron yang salah tulis tidak menimbulkan error — ia hanya tidak pernah jatuh tempo. Kolom waktu berikutnya yang menunjukkannya.',
      ),
      p(
        '`schedule:test` menjalankan **satu** tugas seketika tanpa menunggu jadwalnya. Itu bedanya dengan menjalankan perintahnya langsung, sebab ia melewati seluruh pembungkus jadwal seperti `withoutOverlapping`, `onOneServer`, dan `onFailure`, sehingga kamu menguji tugasnya beserta penjagaannya alih-alih hanya isinya.',
      ),
      p(
        '`schedule:work` menjalankan penjadwal di foreground, memeriksa setiap menit seperti cron akan melakukannya. Ini yang kamu pakai di **lingkungan pengembangan** sebagai pengganti entri cron — jalankan di satu terminal, dan jadwalmu hidup selama kamu bekerja tanpa perlu menyentuh crontab laptop.',
      ),

      h2('Tugas berkala yang hampir selalu dibutuhkan'),
      table(
        ['Tugas', 'Frekuensi', 'Kenapa'],
        [
          ['Hapus token kedaluwarsa', 'Harian', 'Tabel tumbuh tanpa batas'],
          ['Hapus job gagal yang lama', 'Mingguan', 'Sama'],
          ['Bersihkan berkas sementara', 'Setiap jam', 'Disk penuh'],
          ['Hapus data soft-delete lewat retensi', 'Harian', 'Kewajiban privasi'],
          ['Segarkan cache mahal', 'Sesuai kebutuhan', 'Cegah cold cache saat trafik tinggi'],
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
      p(
        'Dua hook ini menutup **dua jenis kegagalan yang berbeda**, dan itulah kenapa keduanya perlu. `onFailure` menangani tugas yang berjalan lalu gagal — ia punya error, dan errornya bisa dicatat. Komentar di dalamnya menyebut syarat yang menentukan: kirim ke saluran yang **benar-benar dibaca orang**. Log yang tidak pernah dibuka bukan pemantauan.',
      ),
      p(
        '`pingOnSuccess` menangani kegagalan yang jauh lebih sulit, yaitu tugas yang **tidak pernah berjalan sama sekali**. Cron mati, `schedule:run` tidak ikut terpasang di server baru, atau kunci `withoutOverlapping` tersangkut, dan tidak ada error yang bisa ditangkap karena tidak ada apa pun yang terjadi. `onFailure` tidak menolong di sini, sebab ia hanya menyala kalau tugasnya sempat berjalan.',
      ),
      p(
        'Komentar terakhir menjelaskan pembalikan yang menyelesaikannya: **yang dipantau adalah ketiadaan sinyal**. Setiap kali tugas berhasil, ia mengirim ping ke layanan pemantau. Kalau ping berhenti datang lebih lama dari yang diharapkan, layanan itu yang memberi tahu kamu. Perhatikan `config(...)` dipakai alih-alih `env(...)` — sesuai aturan di sub-bab 5.10, memanggil `env()` di luar berkas config akan mengembalikan `null` begitu konfigurasinya di-cache di produksi, dan pemantauanmu diam-diam berhenti bekerja.',
      ),
      callout(
        'warning',
        'Tugas terjadwal yang berhenti berjalan tidak menimbulkan error apa pun',
        'Ia hanya... tidak terjadi. Cron mati, `schedule:run` dihapus dari server baru, atau kunci `withoutOverlapping` tersangkut — dan tidak ada yang tahu sampai seseorang menyadari laporan bulanan tidak pernah datang. Pemantauan berbasis heartbeat menutupnya: yang dipantau adalah **ketiadaan** sinyal.',
      ),
      references(
        {
          label: 'Laravel — Task Scheduling',
          href: 'https://laravel.com/docs/12.x/scheduling',
          source: 'Laravel',
          note: 'Seluruh frekuensi, `withoutOverlapping`, `onOneServer`, dan `runInBackground`.',
        },
        {
          label: 'Scheduling — Running the Scheduler',
          href: 'https://laravel.com/docs/12.x/scheduling#running-the-scheduler',
          source: 'Laravel',
          note: 'Satu entri cron yang menjalankan seluruh jadwal, beserta `schedule:work` untuk lokal.',
        },
        {
          label: 'Scheduling — Task Hooks & pings',
          href: 'https://laravel.com/docs/12.x/scheduling#task-hooks',
          source: 'Laravel',
          note: '`onFailure` dan `pingOnSuccess` untuk pemantauan berbasis heartbeat.',
        },
        {
          label: 'Laravel — Cache',
          href: 'https://laravel.com/docs/12.x/cache',
          source: 'Laravel',
          note: 'Cache bersama yang dibutuhkan `onOneServer` agar benar-benar bekerja.',
        },
      ),
    ],
  ),

  written(
    'caching-optimasi',
    'Caching & Optimasi Query',
    12,
    'Membuat cepat dengan cara yang benar, bukan dengan menutupi.',
    [
      terms(
        {
          term: 'ukur sebelum optimasi',
          meaning:
            'Urutan yang tidak boleh dibalik. Sebelum menambah cache, jalankan `EXPLAIN ANALYZE`. **Sangat sering** penyebabnya index yang hilang — dan menambah index menyelesaikannya permanen, tanpa satu sistem lagi untuk dipelihara.',
        },
        {
          term: 'whenQueryingForLongerThan',
          meaning:
            'Kait Laravel yang mencatat query melebihi ambang waktu. Ia mengubah "aplikasinya terasa lambat" menjadi daftar query konkret beserta durasinya — dan itu selisih antara menebak dan mengetahui.',
        },
        {
          term: 'toRawSql',
          meaning:
            'Menampilkan SQL yang **benar-benar dihasilkan** Eloquent, lengkap dengan nilainya. Ia yang mengingatkan bahwa ORM menyembunyikan query, bukan biayanya.',
        },
        {
          term: 'cache::remember',
          meaning:
            'Pola cache-aside satu baris: ambil dari cache, kalau kosong jalankan closure lalu simpan hasilnya. TTL **wajib** disebut — `rememberForever` menumpuk entri sampai memori habis.',
        },
        {
          term: 'cache tag',
          meaning:
            'Label yang memungkinkan penghapusan sekelompok entri sekaligus. Catatan penting: ia **hanya didukung** driver tertentu (Redis, Memcached) — pada driver file atau database, tag diam-diam tidak bekerja.',
        },
        {
          term: 'versi di kunci cache',
          meaning:
            'Alternatif tag yang bekerja di driver mana pun: sertakan versi di kunci (`artikel:v2:...`) dan naikkan saat bentuk datanya berubah. **Jauh lebih andal** daripada berusaha menghapus entri satu per satu.',
        },
        {
          term: 'jangan cache kueri milik pengguna tanpa id',
          meaning:
            'Kunci cache **wajib** memuat identitas kalau hasilnya berbeda per pengguna. Kunci `dasbor` tanpa id menyajikan dasbor Ana kepada Budi — dan tidak ada error apa pun yang memberitahumu.',
        },
        {
          term: 'config:cache & route:cache',
          meaning:
            'Optimasi produksi yang menggabungkan konfigurasi dan rute jadi berkas tunggal. Jebakannya: setelah `config:cache`, `env()` di luar folder `config/` mengembalikan **`null`** — dan itu bekerja sempurna di lokal.',
        },
        {
          term: 'cache bukan penutup query lambat',
          meaning:
            'Kalau query lambat karena kekurangan index, cache hanya **menyembunyikannya** — dan kelambatannya kembali setiap kali cache-nya cold, biasanya justru setelah deploy saat trafik sedang tinggi.',
        },
      ),

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
      p(
        '`whenQueryingForLongerThan(500, ...)` memasang jaring yang menangkap query lambat **saat kamu bekerja**, bukan setelah pengguna mengeluh. Angka 500 itu milidetik, dan nilainya sengaja rendah — di laptop dengan data uji sedikit, query yang menyentuh ambang itu hampir pasti akan jauh lebih buruk di produksi dengan data sungguhan.',
      ),
      p(
        'Perhatikan yang dicatat adalah `$q->sql` **dan** `$q->time`. Tanpa waktunya, kamu tahu query mana yang lambat tetapi tidak tahu seberapa — dan itu menentukan mana yang layak diperbaiki lebih dulu. Pasang ini di service provider dan pagari dengan `! app()->isProduction()`, seperti tiga setelan pencegah N+1 di sub-bab 6.3.',
      ),
      p(
        '`toRawSql()` menutup langkah berikutnya, yaitu melihat SQL yang **benar-benar dihasilkan** lengkap dengan nilainya, sehingga bisa disalin langsung ke `psql` untuk dijalankan `EXPLAIN ANALYZE`. Ini penting karena Eloquent menyembunyikan query di balik rangkaian method yang enak dibaca, sementara scope, global scope, dan eager loading semuanya menambahkan sesuatu yang tidak terlihat dari kodenya. Perhatikan `dd()` berarti *dump and die*, sehingga ia alat penelusuran sementara yang tidak boleh tertinggal di kode yang dikirim.',
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
      p(
        '`Cache::remember($kunci, $ttl, $closure)` menyatukan tiga langkah pola cache-aside dalam satu pemanggilan: coba cache, kalau kosong jalankan closure-nya, lalu simpan hasilnya. Closure-nya **hanya berjalan saat cache meleset** — itulah yang membuatnya lebih ringkas sekaligus lebih sulit salah daripada menulis `if (Cache::has(...))` sendiri.',
      ),
      p(
        'Bagian `v1` di tengah kunci adalah trik yang menghemat banyak kesulitan. Saat bentuk data yang kamu simpan berubah, misalnya `Kategori` mendapat kolom baru, kamu **tidak perlu menghapus apa pun**. Naikkan menjadi `v2`, dan seluruh entri lama otomatis tidak pernah dicari lagi lalu kedaluwarsa sendiri lewat TTL-nya. Bandingkan dengan berusaha menemukan dan menghapus ribuan kunci lama, yang selalu menyisakan sebagian.',
      ),
      p(
        'Kunci kedua menyertakan `{$user->id}`, dan komentarnya menyebutnya **wajib**. Kunci seperti `dasbor:ringkasan` yang dipakai bersama akan menyajikan dasbor Ana kepada Budi, tergantung siapa yang kebetulan mengisi cache lebih dulu. Yang membuatnya sulit ditemukan, ini IDOR yang **tidak terlihat di kode otorisasi mana pun**, karena Policy dan scope query-mu semuanya benar sementara yang bocor adalah lapisan cache di atasnya.',
      ),
      p(
        'Perhatikan TTL keduanya berbeda, yaitu 3600 detik untuk kategori yang jarang berubah dan 300 detik untuk ringkasan dasbor. Nilainya adalah keputusan produk tentang **seberapa basi data ini masih boleh terlihat**, bukan angka teknis. Dan TTL juga jaring pengaman untuk invalidasi yang terlewat, sebab sepintar apa pun kamu menghapus entri saat data berubah, cepat atau lambat ada jalur yang lupa.',
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
      p(
        'Komentar pada `Cache::forever` menandai jebakan yang namanya sudah jujur: ia menyimpan **tanpa masa berlaku**. Tanpa jalur invalidasi yang benar-benar dijalankan di setiap tempat yang mengubah datanya, entri itu akan menyajikan data basi selamanya — dan tidak ada TTL yang menyelamatkan. Pakai hanya kalau kamu memang mengelola pembersihannya dengan sadar.',
      ),
      p(
        '`Cache::tags` menyelesaikan masalah yang tidak bisa dijawab `forget` satu per satu, yaitu **membatalkan sekelompok entri sekaligus**. Menandai entri dengan `"penulis:{$id}"` berarti satu `flush()` membersihkan semua cache milik penulis itu, mulai dari daftar artikelnya, ringkasannya, sampai hitungannya, tanpa kamu perlu tahu satu per satu kunci yang pernah dibuat.',
      ),
      p(
        'Perhatikan komentarnya menyebut batas yang penting: **hanya Redis dan Memcached** yang mendukung tag. Dengan driver `file` atau `database`, pemanggilan ini melempar. Itu berarti kode yang memakainya mengikat aplikasimu pada driver tertentu — dan lingkungan pengujian yang memakai driver `array` perlu diperiksa mendukungnya.',
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
      p(
        'Perhatikan `$halaman` masuk ke dalam kunci cache. Itu penerapan aturan dari sub-bab 4.5: **setiap nilai yang memengaruhi hasil wajib ada di kuncinya**. Tanpa itu, halaman 1 dan halaman 2 berbagi satu slot — pengguna berpindah halaman dan melihat isi halaman sebelumnya. Kalau endpoint ini nanti menerima filter kategori atau urutan, keduanya harus ikut ke kunci juga.',
      ),
      p(
        'Yang di-cache adalah **hasil akhir yang sudah diserialisasi** (`->response()->getData(true)`), bukan koleksi model. Itu disengaja: menyimpan objek Eloquent ke cache berarti menyerialisasi seluruh model beserta relasinya, dan mengambilnya kembali tetap butuh pekerjaan. Menyimpan array hasil jadi membuat cache hit hampir tanpa biaya.',
      ),
      p(
        'Baris terakhir menambahkan **lapisan cache kedua** di sisi klien lewat header `Cache-Control`. Keduanya bekerja di tempat berbeda: `Cache::remember` menghemat query di servermu, `max-age=60` menghemat permintaan yang bahkan tidak sampai ke server. Perhatikan `public` di sana hanya sah karena endpoint ini menyajikan **artikel terbit** yang sama untuk semua orang — untuk data privat, ia wajib `private, no-store`, sesuai aturan di sub-bab 1.8.',
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
      p(
        'Keempat perintah ini memampatkan hal yang **jarang berubah** menjadi berkas siap pakai, sehingga Laravel tidak perlu membaca dan mengurai puluhan berkas di **setiap** permintaan. Bedanya nyata di produksi, dan itulah kenapa keempatnya masuk ke langkah deploy — `php artisan optimize` menjalankan semuanya sekaligus.',
      ),
      p(
        'Sebaliknya, **jangan** menjalankannya saat mengembangkan. Hasil cache tidak ikut berubah ketika kamu menyunting konfigurasi, rute, atau view — dan kamu akan menghabiskan waktu bingung mengapa perubahanmu tidak berpengaruh. Kalau terlanjur, `php artisan optimize:clear` membersihkan semuanya.',
      ),
      p(
        "Peringatan berikutnya adalah konsekuensi terpenting dari `config:cache`, dan ia menjatuhkan banyak deploy. Setelah cache aktif, berkas `.env` **tidak dibaca lagi** — jadi `env()` yang dipanggil di luar folder `config/` mengembalikan `null`. Yang membuatnya menyakitkan: kodenya bekerja sempurna di lokal karena cache tidak menyala di sana, dan gejalanya baru muncul di produksi sebagai koneksi gagal atau kunci API kosong. Di luar folder config, selalu `config('nama.kunci')`.",
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
      references(
        {
          label: 'Laravel — Cache',
          href: 'https://laravel.com/docs/12.x/cache',
          source: 'Laravel',
          note: '`remember`, tag, dan driver mana yang mendukung apa.',
        },
        {
          label: 'Laravel — Database: Query Builder performance',
          href: 'https://laravel.com/docs/12.x/queries',
          source: 'Laravel',
          note: '`count()` di database versus memuat koleksi lalu menghitungnya.',
        },
        {
          label: 'Configuration Caching',
          href: 'https://laravel.com/docs/12.x/configuration#configuration-caching',
          source: 'Laravel',
          note: 'Peringatan resmi bahwa `env()` mengembalikan `null` setelah config di-cache.',
        },
        {
          label: 'Using EXPLAIN',
          href: 'https://www.postgresql.org/docs/17/using-explain.html',
          source: 'PostgreSQL',
          note: 'Langkah pertama sebelum menambah cache: cari tahu kenapa query-nya lambat.',
        },
      ),
    ],
  ),

  written(
    'notification-mail',
    'Notification & Mail',
    10,
    'Mengirim pesan lewat beberapa saluran, tanpa membuat permintaan menunggu.',
    [
      terms(
        {
          term: 'Notification',
          meaning:
            'Satu kelas yang bisa dikirim lewat **beberapa saluran** sekaligus — email, database, Slack, SMS. Isinya ditulis sekali; saluran mana yang dipakai diputuskan `via()` per penerima.',
        },
        {
          term: 'via()',
          meaning:
            'Metode yang menentukan saluran per penerima. Di sinilah **preferensi pengguna** dihormati: saluran yang sudah ia matikan tidak boleh dipaksa, dan itu bukan fitur tambahan melainkan kewajiban.',
        },
        {
          term: 'saluran database',
          meaning:
            'Menyimpan notifikasi ke tabel untuk ditampilkan di dalam aplikasi. Ia tidak butuh layanan luar, tidak bisa gagal terkirim, dan tidak punya biaya per pesan — sering saluran yang paling tepat untuk dipakai default.',
        },
        {
          term: 'ShouldQueue pada notifikasi',
          meaning:
            'Membuat pengiriman berjalan **di antrean**. Tanpa itu, permintaan HTTP menunggu SMTP menjawab — dan pengguna menanggung latensi layanan email yang tidak bisa kamu kendalikan.',
        },
        {
          term: 'Mailable',
          meaning:
            'Kelas khusus untuk satu jenis email, terpisah dari sistem notifikasi. Dipakai saat isinya kompleks atau perlu lampiran — untuk pesan sederhana lintas saluran, Notification lebih ringkas.',
        },
        {
          term: 'Markdown mail',
          meaning:
            'Template email berbasis Markdown dengan komponen bawaan Laravel. Ia menghasilkan HTML yang sudah diuji di banyak klien email — masalah nyata, karena klien email jauh lebih terbatas daripada browser.',
        },
        {
          term: 'simpan id, bukan model',
          meaning:
            'Notifikasi yang di-queue diserialisasi. Menyimpan **id** lalu mengambilnya di `toMail()` memastikan isinya **segar** saat dikirim — bukan salinan yang sudah basi sejak notifikasi dibuat.',
        },
        {
          term: 'jangan kirim di dalam transaksi',
          meaning:
            'Email yang terkirim untuk sesuatu yang akhirnya di-rollback **tidak bisa ditarik kembali**. Kirim setelah commit — lewat `afterCommit`, atau dengan menaruh pengirimannya di antrean yang menunggu commit.',
        },
        {
          term: 'jangan catat isi email',
          meaning:
            'Isi notifikasi sering memuat data pribadi — nama, alamat, nomor pesanan, tautan reset. Mencatatnya penuh "supaya gampang debug" memindahkan data itu ke sistem log yang diakses lebih banyak orang.',
        },
      ),

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
      p(
        'Method `via()` menentukan **saluran mana** yang dipakai, dan bentuk `array_filter` di sana menjadikannya keputusan per pengguna. Elemen yang bernilai `null` dibuang, sehingga pengguna yang mematikan notifikasi database hanya menerima email. Menghormati preferensi bukan sekadar kesopanan — di banyak yurisdiksi ia kewajiban, dan tempat menegakkannya adalah di sini, bukan di setiap pemanggilan.',
      ),
      p(
        'Perhatikan konstruktornya menerima `int $artikelId`, **bukan** objek `Artikel`. Alasannya sama seperti pada job di sub-bab 6.5: notifikasi ini masuk antrean, payload-nya diserialisasi, dan data di dalamnya sudah basi saat akhirnya dikirim. `toMail` mengambil datanya segar lewat `findOrFail` — dan `findOrFail` yang melempar saat artikelnya sudah dihapus adalah perilaku yang benar, karena notifikasi untuk artikel yang tidak ada memang tidak perlu dikirim.',
      ),
      p(
        'Dua method `to*` menghasilkan bentuk berbeda untuk saluran yang berbeda dari satu kelas yang sama. `toMail` menyusun email lengkap dengan tombol lewat `MailMessage`; `toArray` menyimpan data terstruktur ke tabel notifikasi, yang nanti dibaca frontend untuk menampilkan lonceng notifikasi. Perhatikan `toArray` menyimpan **id dan tipe**, bukan teks jadi — dengan begitu tampilannya bisa diubah atau diterjemahkan tanpa menyentuh baris yang sudah tersimpan.',
      ),
      p(
        'Dua bentuk pemanggilan di blok kedua berbeda pada penerimanya. `$user->notify(...)` untuk satu penerima. `Notification::send($pengikut, ...)` untuk koleksi — dan bentuk itu yang menangani pengiriman massal dengan benar. Perhatikan keduanya tidak menunggu apa pun: karena notifikasinya memakai `Queueable`, pemanggilan ini hanya memasukkannya ke antrean dan langsung kembali.',
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
      p(
        'Mailable dan Notification menjawab kebutuhan yang berbeda, dan memilih keliru membuat kode berlebihan. **Notification** ditujukan ke seorang pengguna dan bisa lewat banyak saluran — email, database, Slack. **Mailable** hanya email, tetapi memberi kendali penuh atas isinya; ia yang kamu pakai untuk email yang tidak menempel pada pengguna, seperti faktur ke alamat penagihan atau laporan ke tim.',
      ),
      p(
        'Perhatikan konstruktornya menerima `string $nama` dan `string $url` — **nilai sederhana**, bukan objek model. Untuk mailable yang masuk antrean, itu pilihan yang lebih aman lagi daripada menyimpan id: tidak ada query saat pengiriman, dan tidak ada risiko baris yang sudah berubah. Perhatikan pula properti dideklarasikan `public`, karena view Blade-nya membaca langsung dari sana.',
      ),
      p(
        "`markdown: 'mail.verifikasi'` memakai template markdown bawaan Laravel alih-alih HTML mentah. Nilainya nyata: email HTML yang tampil benar di Gmail, Outlook, dan klien ponsel adalah pekerjaan yang jauh lebih rumit daripada halaman web, dan template bawaan itu sudah diuji lintas klien. Perhatikan `implements ShouldQueue` tetap ada di sini, dengan alasan yang sama seperti notifikasi — SMTP yang lambat tidak boleh menahan permintaan pengguna.",
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
      p(
        '`Notification::fake()` **mencegah** pengiriman lalu mencatat pemanggilannya. Tanpa itu, menjalankan tes berarti benar-benar menembak SMTP — lambat, tidak konsisten, dan pada konfigurasi yang salah bisa mengirim email ke alamat sungguhan. Ini penerapan prinsip dari sub-bab 2.12: **tiru yang di luar kendalimu**, dan penyedia email jelas termasuk.',
      ),
      p(
        "Perhatikan `assertSentTo` menerima **koleksi** `$penulis->pengikut`, bukan satu pengguna. Laravel memeriksa setiap anggotanya menerima notifikasi itu — jadi satu assertion membuktikan ketiganya, dan gagal kalau ada satu yang terlewat. Perhatikan pula penyiapan datanya memakai `has(User::factory()->count(3), 'pengikut')`, yang membuat penulis beserta tiga pengikutnya dalam satu pernyataan.",
      ),
      p(
        'Yang diuji di sini adalah **kontrak endpoint terhadap notifikasi**, bukan isi emailnya. Apakah subjeknya benar atau tombolnya mengarah ke alamat yang tepat adalah tes terpisah untuk `toMail`. Pemisahan itu yang membuat tes ini tetap hijau saat teks emailnya diubah — perubahan kata-kata tidak boleh menggagalkan tes tentang siapa yang menerima notifikasi.',
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
      p(
        'Dua pilihan untuk kebutuhan yang berbeda. `MAIL_MAILER=log` menulis email ke berkas log alih-alih mengirimnya, dan itu paling sederhana serta cukup saat kamu hanya ingin memastikan emailnya benar-benar dipicu. Mailpit menangkapnya di kotak surat lokal dengan antarmuka web, jadi kamu bisa **melihat hasil render HTML-nya**, dan untuk email tampilan itu justru bagian yang paling sering salah.',
      ),
      p(
        'Peringatan berikutnya menyebut kecelakaan yang tidak bisa dibatalkan. Satu seeder yang menjalankan notifikasi, atau satu tes yang lupa `Notification::fake()`, bisa mengirim ribuan email ke alamat pengguna sungguhan — dan email yang sudah terkirim tidak bisa ditarik kembali. Karena itu `.env` pengembangan tidak boleh pernah memuat kredensial SMTP produksi, dan `MAIL_MAILER=log` adalah nilai bawaan yang aman untuk `.env.example`.',
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
      p(
        "Menaruh email di jalur antreannya sendiri (`onQueue('email')`) memungkinkan **worker terpisah** melayaninya dengan aturan berbeda. Itu penting karena penyedia email punya batas kirim per detik, dan melampauinya bukan sekadar ditolak — akunmu bisa diblokir sementara, sehingga email penting seperti reset password ikut berhenti.",
      ),
      p(
        'Opsi `--rest=1` menyuruh worker beristirahat satu detik di antara job, sehingga laju pengirimannya tertahan di tingkat yang aman. Perhatikan pembatasan ini **tidak bisa** dilakukan di jalur `default` tanpa ikut memperlambat semua job lain — dan itulah alasan pemisahan jalurnya diperlukan, bukan sekadar kerapian.',
      ),
      references(
        {
          label: 'Laravel — Notifications',
          href: 'https://laravel.com/docs/12.x/notifications',
          source: 'Laravel',
          note: 'Saluran, `via()`, dan pengiriman lewat antrean.',
        },
        {
          label: 'Laravel — Mail',
          href: 'https://laravel.com/docs/12.x/mail',
          source: 'Laravel',
          note: 'Mailable, template Markdown, dan driver `log` untuk pengembangan.',
        },
        {
          label: 'URL Generation — Signed URLs',
          href: 'https://laravel.com/docs/12.x/urls#signed-urls',
          source: 'Laravel',
          note: 'Tautan bertanda tangan berbatas waktu untuk verifikasi dan reset.',
        },
        {
          label: 'Forgot Password Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Aturan isi email pemulihan: sekali pakai, umur pendek, tanpa data berlebih.',
        },
      ),
    ],
  ),

  written(
    'testing-pest',
    'Testing dengan Pest',
    13,
    'Tes yang membuktikan hal yang tidak boleh terjadi.',
    [
      terms(
        {
          term: 'Pest',
          meaning:
            "Test runner PHP di atas PHPUnit dengan sintaks fungsional — `it('...', function () {})`. Ia tetap PHPUnit di dalamnya, jadi seluruh assertion dan fitur Laravel tetap tersedia.",
        },
        {
          term: 'RefreshDatabase',
          meaning:
            'Trait yang membungkus setiap tes dalam **transaksi** lalu me-rollback-nya. Ia yang membuat tes saling terisolasi tanpa membangun ulang skema di setiap tes — jauh lebih cepat daripada migrasi ulang.',
        },
        {
          term: 'database tes terpisah',
          meaning:
            'Nilai `DB_DATABASE` di `phpunit.xml` **wajib** menunjuk database khusus tes. Salah menunjuk berarti `RefreshDatabase` menghapus data pengembangan — atau, kalau `.env`-nya keliru, data produksi.',
        },
        {
          term: 'QUEUE_CONNECTION=sync',
          meaning:
            'Setelan tes yang menjalankan job **langsung**, bukan mengantrekannya. Tanpa itu, efek job tidak pernah terjadi selama tes — dan asersi tentang hasilnya selalu gagal tanpa alasan yang jelas.',
        },
        {
          term: 'actingAs',
          meaning:
            'Menjalankan permintaan **sebagai** pengguna tertentu tanpa melewati alur login. Ia yang membuat uji otorisasi ringkas: dua pengguna, dua token, satu asersi.',
        },
        {
          term: 'assertJsonCount',
          meaning:
            'Memeriksa **jumlah** elemen pada jalur JSON tertentu. Untuk uji kepemilikan, ia lebih tajam daripada `assertOk`: 3 artikel milik Ana harus tetap 3, meski ada 5 milik Budi di tabel yang sama.',
        },
        {
          term: 'fake',
          meaning:
            'Pengganti sistem luar saat tes — `Notification::fake()`, `Event::fake()`, `Queue::fake()`, `Storage::fake()`. Ia mencegah tes benar-benar mengirim email atau menulis berkas, sambil tetap bisa **memeriksa** bahwa pemanggilannya terjadi.',
        },
        {
          term: 'dataset',
          meaning:
            'Fitur Pest untuk menjalankan tes yang sama dengan **banyak masukan**. Ia yang membuat pengujian unhappy path, misalnya input kosong, terlalu panjang, dan tipe salah, tidak menjadi belasan blok tes yang hampir identik.',
        },
        {
          term: 'tes yang membuktikan larangan',
          meaning:
            'Judul sub-bab ini. Tes yang paling berharga bukan yang membuktikan fitur berjalan, melainkan yang membuktikan sesuatu yang **seharusnya tidak bisa** memang tidak bisa: pengguna lain ditolak, batas ditegakkan, dan field terlarang diabaikan.',
        },
      ),

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
      p(
        "Trait `RefreshDatabase` di `tests/Pest.php` yang membuat setiap tes mulai dari keadaan bersih: ia membungkus tiap tes dalam transaksi lalu me-*rollback* di akhir. Itu jauh lebih cepat daripada `TRUNCATE` di setiap tes, dan hasilnya sama — tes tidak bisa saling mengotori. Perhatikan `->in('Feature')` membatasinya ke folder itu, sehingga unit test yang tidak menyentuh database tidak ikut membayar ongkos penyiapannya.",
      ),
      p(
        'Komentar berhuruf besar pada `DB_DATABASE` menandai penjagaan yang tidak bisa ditawar. `RefreshDatabase` menghapus data **tanpa konfirmasi**, dan konfigurasi yang salah, entah `.env` tertukar atau variabel terbawa dari terminal lain, akan menghapus seluruh data kerjamu. Menuliskan database tes secara eksplisit di `phpunit.xml` menutup kelas kecelakaan yang tidak bisa dibatalkan.',
      ),
      p(
        'Tiga baris terakhir mengganti layanan luar dengan versi yang aman dan cepat. `MAIL_MAILER=array` menampung email di memori alih-alih mengirimnya — sehingga satu tes yang lupa `Notification::fake()` tidak mengirim email ke alamat sungguhan. `QUEUE_CONNECTION=sync` menjalankan job **seketika** alih-alih menaruhnya di antrean, jadi efeknya bisa langsung diperiksa tanpa menjalankan worker. Dan `CACHE_STORE=array` memastikan cache tidak bocor antar tes.',
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
      p(
        "Tes pertama memakai **dua** pengguna dengan jumlah artikel yang sengaja dibedakan — tiga dan lima. Angka berbeda itu bukan kebetulan: kalau keduanya tiga, tes akan tetap hijau meskipun scope pemiliknya bocor, karena jumlahnya kebetulan sama. `assertJsonCount(3, 'data')` yang membuktikan hanya milik Ana yang keluar.",
      ),
      p(
        'Tes kedua menyiapkan **150** artikel untuk menguji batas 100, dan angka itu dipilih dengan alasan. Data uji harus **melebihi** ambang yang diuji; menyiapkan hanya lima puluh akan membuat tes hijau bahkan kalau batas atasnya tidak pernah dipasang. Perhatikan yang diperiksa adalah **jumlah item** yang dikembalikan, bukan status code — permintaan `?per_hal=999999` akan tetap menjawab `200`, dan yang membuktikan batasnya ditegakkan hanya panjang datanya.',
      ),
      p(
        'Keduanya adalah tes **integrasi**: permintaan HTTP sungguhan melewati middleware auth, controller, sampai database. Berbeda dari unit test yang menguji satu fungsi terisolasi, yang diuji di sini adalah **kontrak yang dilihat klien** — dan kontrak itulah yang bocor kalau otorisasi atau batasnya salah.',
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
      p(
        'Tes pertama menguji `GET` **dan** `PATCH`, dan yang kedua itu yang sering terlewat — sangat lazim `GET` sudah diperbaiki sementara `PATCH` masih memakai query tanpa scope pemilik. Perhatikan artikelnya dibuat berstatus `draf`: itu memastikan yang diuji benar-benar aturan kepemilikan, bukan sekadar aturan "artikel terbit boleh dilihat siapa saja". Dan `assertNotFound` yang diharapkan, bukan `403`, sesuai keputusan di sub-bab 6.4.',
      ),
      p(
        'Dua baris terakhir tes itu menutup celah yang paling halus. Status `404` **belum membuktikan apa-apa** kalau ternyata datanya sempat berubah sebelum ditolak — `PATCH` yang menulis dulu baru memeriksa izin akan tetap menghasilkan `404` sambil sudah merusak data. `$artikelBudi->fresh()` membaca ulang dari database, dan itulah bukti yang sesungguhnya.',
      ),
      p(
        'Tes kedua menembakkan `penulis_id` milik Budi ke endpoint pembuatan, dan perhatikan yang diharapkan adalah `assertCreated()` — permintaannya memang **berhasil**, hanya field asingnya yang diabaikan. Inilah yang membuktikan `$fillable` beserta pembuatan lewat relasi pengguna bekerja. Ganti `$user->artikel()->create(...)` menjadi `Artikel::create($request->validated())`, dan tes ini langsung merah.',
      ),
      p(
        'Tes ketiga memeriksa **seluruh respons sebagai teks** lewat `json_encode`, bukan field per field. Itu disengaja: kebocoran kolom sering muncul di tempat yang tidak kamu duga — di dalam relasi bersarang, atau di field yang baru ditambahkan bulan depan. Menyisir seluruh teks menangkapnya tanpa perlu tahu di mana. Perhatikan pola ini akan tetap menjaga meski bentuk responsnya berubah.',
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
      p(
        '`->with([...])` menjalankan blok tes yang **sama** untuk setiap masukan di dalamnya — lima kasus dari satu blok. Tanpa dataset, pengujian unhappy path berubah menjadi lima blok yang hampir identik, dan orang berikutnya akan menambah kasus keenam dengan menyalin-tempel lalu lupa mengubah satu bagian.',
      ),
      p(
        "Kunci berupa string (`'hanya spasi'`, `'bukan string'`) adalah bagian yang paling menghemat waktu saat ada yang merah. Pest memakainya sebagai nama kasus, sehingga kegagalan berbunyi *\"menolak judul yang tidak valid with data set 'terlalu panjang'\"* — langsung menunjuk masukan mana yang lolos, tanpa perlu menghitung indeks array.",
      ),
      p(
        "Kelima kasusnya sengaja menyentuh jenis kegagalan yang berbeda, dan dua di antaranya paling sering lolos ke produksi. `'   '` menguji apakah `trim` berjalan **sebelum** pemeriksaan panjang minimum — tanpa itu, judul berisi spasi lolos `required`. Dan `12345` menguji **tipe**, bukan hanya isi: aturan yang hanya memeriksa panjang akan meloloskan angka, dan itu masalah nyata pada validasi yang lebih longgar seperti di sub-bab 5.4.",
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
      p(
        'Tes ini mengubah N+1 dari masalah performa yang tak terlihat menjadi sesuatu yang bisa **gagal**. Perhatikan letak `enableQueryLog()`: **setelah** penyiapan data, tepat sebelum permintaan. Menyalakannya di awal akan ikut menghitung tiga puluh query dari `factory()`, dan ambangnya terlampaui bahkan pada kode yang benar.',
      ),
      p(
        'Angka 30 pada penyiapan dan ambang `toBeLessThan(6)` bekerja berpasangan, sebab kalau ada N+1 jumlahnya melonjak ke sekitar 31, jauh di atas ambang sehingga kegagalannya tegas. Menyiapkan hanya tiga baris akan membuat tes ini hijau **walaupun ada N+1**. Aturannya sama seperti pada tes batas paginasi, yaitu data uji harus jauh melebihi ambang yang kamu pasang.',
      ),
      p(
        'Perhatikan ini melengkapi `preventLazyLoading` dari sub-bab 6.3, tidak menggantikannya. Setelan itu menangkap lazy loading **saat kamu menulisnya**; tes ini menangkap pertumbuhan query dari sebab lain — subquery di Resource, accessor yang memicu query, atau `withCount` yang hilang saat refactor.',
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
      p(
        'Garis pemisahnya adalah **apa yang kamu kendalikan**. Penyedia email, S3, API partner, dan jam sistem semuanya di luar kendali: memanggilnya sungguhan membuat tes lambat, berbiaya, atau tidak deterministik. `Http::fake` khususnya penting untuk integrasi — tanpa itu, tesmu ikut gagal setiap kali layanan partner sedang bermasalah, padahal kodemu baik-baik saja.',
      ),
      p(
        '`$this->travelTo(...)` menggeser jam yang dilihat aplikasi. Tanpa itu, menguji "token kedaluwarsa setelah 30 hari" berarti benar-benar menunggu tiga puluh hari — jadi jalur kedaluwarsa hampir tidak pernah teruji, dan bug di sana baru ketahuan dari pengguna. Perhatikan ia juga membuat pengujian yang bergantung waktu menjadi **deterministik**: tes yang lulus hari ini tidak boleh gagal karena kebetulan dijalankan lewat tengah malam.',
      ),
      p(
        'Peringatan berikutnya menandai batas yang mudah tergelincir, yaitu `Queue::fake()` memverifikasi job **dikirim ke antrean** dan bukan bahwa job itu bekerja. Isi `handle()`-nya harus diuji terpisah, sebab kalau tidak kamu punya tes hijau untuk job yang selalu gagal. Dan ingat batas satu lagi dari sub-bab 2.12, yaitu **jangan meniru databasemu sendiri**, karena itu menghapus justru bagian yang paling mungkin salah.',
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
      references(
        {
          label: 'Pest — Writing Tests',
          href: 'https://pestphp.com/docs/writing-tests',
          source: 'Pest',
          note: 'Sintaks `it`, ekspektasi, dan dataset yang dipakai contoh di atas.',
        },
        {
          label: 'Pest — Datasets',
          href: 'https://pestphp.com/docs/datasets',
          source: 'Pest',
          note: 'Menjalankan satu tes dengan banyak masukan, tanpa menyalin bloknya.',
        },
        {
          label: 'Laravel — HTTP Tests',
          href: 'https://laravel.com/docs/12.x/http-tests',
          source: 'Laravel',
          note: '`actingAs`, `getJson`, dan seluruh assertion respons.',
        },
        {
          label: 'Laravel — Mocking & Fakes',
          href: 'https://laravel.com/docs/12.x/mocking',
          source: 'Laravel',
          note: '`Mail::fake`, `Queue::fake`, `Http::fake`, dan `travelTo` untuk menguji waktu.',
        },
      ),
    ],
  ),

  written(
    'file-storage',
    'File Storage & S3-compatible',
    10,
    'Menyimpan berkas di luar server aplikasi.',
    [
      terms(
        {
          term: 'disk',
          meaning:
            'Abstraksi penyimpanan Laravel — `local`, `s3`, `public`. Kode yang sama bekerja di semuanya, jadi berpindah dari disk lokal ke object storage tidak menyentuh logika aplikasi.',
        },
        {
          term: 'S3-compatible',
          meaning:
            'Layanan yang memakai **protokol yang sama** dengan Amazon S3 — Cloudflare R2, MinIO, DigitalOcean Spaces. Satu driver melayani semuanya; yang berbeda hanya nilai `endpoint`.',
        },
        {
          term: 'visibility: private',
          meaning:
            'Default yang **wajib** untuk unggahan pengguna. Bucket publik adalah salah satu penyebab kebocoran data paling umum — dokumen, foto identitas, dan berkas internal yang bisa diakses siapa pun yang menebak URL-nya.',
        },
        {
          term: 'periksa di konsol penyedia',
          meaning:
            'Konfigurasi aplikasi **tidak cukup**. Kebijakan bucket ditetapkan di sisi penyedia, dan bucket yang dibuat publik di sana tetap publik meski aplikasimu menulis `private`. Verifikasi di kedua tempat.',
        },
        {
          term: 'temporaryUrl',
          meaning:
            'URL bertanda tangan yang **kedaluwarsa**. Ia cara yang benar menyajikan berkas privat: klien mengunduh langsung dari storage tanpa melewati servermu, tapi hanya selama jendela waktu yang kamu tentukan.',
        },
        {
          term: 'jangan pakai URL permanen',
          meaning:
            'URL yang tidak kedaluwarsa akan bocor cepat atau lambat — lewat riwayat browser, log, `Referer`, atau pesan yang diteruskan. Sekali bocor, ia berlaku selamanya.',
        },
        {
          term: 'storage:link',
          meaning:
            'Perintah yang membuat symlink dari `public/storage` ke `storage/app/public`. Ia **hanya** untuk berkas yang memang publik — logo, aset. Unggahan pengguna tidak boleh berada di sana.',
        },
        {
          term: 'presigned upload',
          meaning:
            'Klien mengunggah **langsung** ke storage memakai URL bertanda tangan, sementara server hanya menerbitkan URL-nya. Ia menghindarkan server dari menangani byte-nya, dengan konsekuensi bahwa verifikasi isi harus dilakukan **setelah** unggahan selesai.',
        },
        {
          term: 'Storage::fake',
          meaning:
            'Disk tiruan untuk tes. Ia membuat pengujian unggahan bisa memeriksa "berkasnya tersimpan dengan nama yang benar" tanpa menyentuh S3 sungguhan maupun meninggalkan berkas di disk.',
        },
      ),

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
      p(
        "`'visibility' => 'private'` muncul di **kedua** disk, dan itu disengaja. Nilai bawaan Laravel untuk disk lokal sebenarnya sudah privat, tetapi menuliskannya eksplisit membuat keputusannya terlihat saat review — dan mencegah orang berikutnya mengiranya kelalaian lalu \"memperbaikinya\" menjadi publik.",
      ),
      p(
        "Baris `'endpoint' => env('AWS_ENDPOINT')` yang membuat konfigurasi S3 ini bisa dipakai untuk penyedia lain. Cloudflare R2, MinIO, dan DigitalOcean Spaces semuanya memakai protokol yang sama dengan S3 — jadi berpindah penyedia cukup mengganti satu variabel environment, tanpa menyentuh kode aplikasi.",
      ),
      p(
        'Peringatan berikutnya menyebut hal yang tidak bisa diselesaikan berkas konfigurasi ini: **kebijakan bucket ada di sisi penyedia, bukan di aplikasimu**. `visibility: private` mengatur bagaimana Laravel mengunggah berkas, tetapi bucket yang kebijakannya terbuka tetap bisa dibaca siapa pun yang menebak URL-nya — dan itu salah satu penyebab kebocoran data paling umum di dunia. Periksa di konsol penyedia, bukan hanya di sini.',
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
      p(
        'Komentar pada `storeAs` menandai keputusan paling penting di seluruh method ini: **nama dibuat server**. `Str::uuid()` menghasilkan nama yang tidak bisa ditebak sekaligus mustahil bertabrakan, menutup path traversal lewat `../` dan penimpaan berkas orang lain sekaligus. Perhatikan `$berkas->extension()` dipakai alih-alih ekstensi dari nama kiriman — Laravel menyimpulkannya dari **isi berkasnya**, bukan dari apa yang diklaim klien.',
      ),
      p(
        'Folder tujuannya menyertakan `{$request->user()->id}`, dan itu bukan sekadar kerapian. Memisahkan unggahan per pengguna membuat pembersihan saat akun dihapus menjadi satu operasi, dan membuat kebocoran akibat kesalahan jalur terbatas pada satu pengguna alih-alih semuanya.',
      ),
      p(
        'Perhatikan komentar `metadata saja` pada `nama_asli`. Nama dari klien tetap **disimpan sebagai data** — untuk ditampilkan kembali ke pengguna dan dipakai di header `Content-Disposition` saat mengunduh. Yang tidak boleh adalah memakainya sebagai nama di sistem berkas. Baris rekaman database inilah yang menjadi source of truth tentang siapa pemilik berkas itu, dan yang nanti dipakai memeriksa kewenangan saat mengunduh.',
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
      p(
        'Komentar di dalamnya menandai bagian yang membedakan validasi ini dari pemeriksaan di sisi klien: **`mimes` memeriksa isi berkas**, bukan nama maupun header `Content-Type` yang dikirim klien. Laravel membaca magic byte-nya, jadi berkas `.php` yang dinamai `foto.jpg` dan dikirim dengan `Content-Type: image/jpeg` tetap ditolak.',
      ),
      p(
        'Perhatikan `max:5120` bersatuan **kilobyte** dan bukan byte, jadi angkanya berarti 5 MB. Ini sumber salah tulis yang umum, sebab menuliskan `max:5242880` dengan maksud 5 MB sebenarnya mengizinkan 5 GB. Perhatikan pula aturan ini berlapis dengan batas di `php.ini` (`upload_max_filesize`, `post_max_size`), sehingga batas PHP yang lebih kecil akan memotong lebih dulu dengan error yang jauh kurang ramah, dan karena itu keduanya harus diselaraskan.',
      ),
      callout(
        'tip',
        'Aturan `file` dan `mimes` menutup dua hal yang berbeda',
        '`file` memastikan yang dikirim benar-benar unggahan yang berhasil, bukan string atau unggahan yang gagal di tengah jalan. `mimes` memastikan isinya sesuai jenis yang diizinkan. Melewatkan `file` membuat `mimes` bekerja pada sesuatu yang mungkin bukan berkas sama sekali.',
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
      p(
        'Komentar di baris pertama menyatakan aturannya: **id berkas bukan bukti kewenangan**. Route model binding sudah mengambil `$berkas` dari database, tetapi ia sama sekali tidak memeriksa siapa pemiliknya — dan tanpa `authorize`, siapa pun yang menaikkan angka di URL bisa mengunduh berkas orang lain. Ini IDOR yang sama seperti di sub-bab 6.4, hanya hadiahnya berupa berkas utuh.',
      ),
      p(
        'Tiga header di bawahnya menutup bahaya yang muncul saat **menyajikan** berkas, bukan saat menyimpannya. `Content-Type` diambil dari nilai tersimpan yang sudah diverifikasi, bukan dari apa pun yang dikirim saat mengunduh. `X-Content-Type-Options: nosniff` mencegah browser menebak sendiri tipe berkasnya dan mengeksekusinya — tanpa itu, berkas HTML atau SVG yang lolos bisa berjalan **di origin situsmu**, dan itu XSS dengan akses penuh ke sesi penggunamu. Dan `Cache-Control: private, no-store` menjaga berkas privat tidak tersimpan di CDN atau proxy bersama.',
      ),
      p(
        'Perhatikan `download()` mengembalikan `StreamedResponse` — berkasnya **dialirkan**, bukan dimuat seluruhnya ke memori. Untuk berkas 500 MB, memuatnya sekaligus akan menjatuhkan proses PHP. Argumen kedua `$berkas->nama_asli` menjadi nama yang dilihat pengguna saat menyimpan, dan itulah gunanya menyimpan nama kiriman sebagai metadata tadi.',
      ),
      code(
        'php',
        `
        // URL sementara — untuk berkas besar, supaya tidak lewat server aplikasi
        $url = Storage::disk('s3')->temporaryUrl($berkas->jalur, now()->addMinutes(5));
        `,
      ),
      p(
        'Bentuk ini menyerahkan pengunduhan **langsung ke storage**, sehingga byte-nya tidak melewati server aplikasimu sama sekali. Untuk berkas besar itu bedanya antara server yang menahan koneksi berlama-lama dan server yang hanya menerbitkan satu tautan lalu selesai.',
      ),
      p(
        'Harganya disebut di peringatan berikut: **selama masa berlakunya, siapa pun yang memegang URL itu bisa mengunduhnya**. Tidak ada lagi pemeriksaan otorisasi karena permintaannya tidak sampai ke aplikasimu. Karena itu masa berlakunya dibuat hitungan **menit**, bukan jam — cukup untuk pengunduhan selesai, terlalu singkat untuk berguna kalau tautannya diteruskan atau tercatat di log akses.',
      ),
      callout(
        'warning',
        'URL sementara tetap bisa diteruskan',
        'Selama masa berlakunya, siapa pun yang memegang URL itu bisa mengunduhnya. Buat masanya sesingkat mungkin dalam hitungan menit alih-alih jam, dan jangan pernah menaruhnya di tempat yang tercatat, seperti log akses atau riwayat pesan.',
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
      p(
        "`Storage::fake('s3')` mengganti disk sungguhan dengan disk tiruan di memori. Tanpa itu, menjalankan tes berarti benar-benar menulis ke bucket S3 — lambat, berbiaya, dan meninggalkan berkas sampah yang menumpuk setiap kali tes dijalankan. `UploadedFile::fake()->image(...)` melengkapinya dengan berkas gambar tiruan yang **valid secara isi**, sehingga aturan `mimes` di Form Request benar-benar teruji.",
      ),
      p(
        "Dua assertion di akhir menguji hal yang berbeda, dan yang kedua paling berharga. `assertExists` membuktikan berkasnya tersimpan. `expect($jalur)->not->toContain('foto.jpg')` membuktikan **nama dari klien tidak dipakai** — dan itu satu-satunya cara memastikan penjagaan path traversal masih ada. Kalau seseorang nanti mengganti `storeAs` menjadi `store` dengan nama asli, tes ini langsung merah.",
      ),
      p(
        'Perhatikan bentuk assertion-nya menguji sesuatu yang **tidak** terjadi, sama seperti tes otorisasi negatif di sub-bab 6.4. Tes yang hanya memeriksa `assertCreated()` akan tetap hijau walaupun nama berkas dari klien dipakai apa adanya — dan celah yang paling berbahaya justru yang lolos dari tes jalur sukses.',
      ),

      h2('Kuota dan pembersihan'),
      ul(
        'Batasi total penyimpanan per pengguna — satu akun tidak boleh menghabiskan bucket.',
        'Hapus berkas saat rekamannya dihapus; berkas yatim menumpuk tanpa batas.',
        'Bersihkan unggahan yang tidak pernah diselesaikan lewat job terjadwal.',
        'Terapkan kebijakan retensi untuk berkas ekspor yang memuat data pribadi.',
      ),
      references(
        {
          label: 'Laravel — File Storage',
          href: 'https://laravel.com/docs/12.x/filesystem',
          source: 'Laravel',
          note: 'Disk, driver S3-compatible, `temporaryUrl`, dan `Storage::fake`.',
        },
        {
          label: 'Validation — file & mimes rules',
          href: 'https://laravel.com/docs/12.x/validation#rule-mimes',
          source: 'Laravel',
          note: 'Aturan `mimes` yang memeriksa isi berkas, bukan hanya nama atau header klien.',
        },
        {
          label: 'File Upload Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Nama dari server, penyimpanan privat, dan penyajian dengan `Content-Disposition`.',
        },
        {
          label: 'X-Content-Type-Options',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options',
          source: 'MDN Web Docs',
          note: 'Header yang mencegah browser menebak tipe berkas yang disajikan kembali.',
        },
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

      terms(
        {
          term: 'spesifikasi identik',
          meaning:
            'Metode belajar latihan ini. Cakupannya **sama persis** dengan versi Express di Bab 2.14 — membangun hal yang sama dua kali adalah cara tercepat melihat mana keputusan yang milik **masalahnya**, dan mana yang hanya kebiasaan framework.',
        },
        {
          term: 'yang sama di kedua stack',
          meaning:
            'Prinsip yang tidak berubah: validasi di server, otorisasi per baris **dan** di query, batas paginasi dari server, bentuk respons yang dipilih sadar, pekerjaan lambat di antrean, dan tes yang membuktikan larangan.',
        },
        {
          term: 'yang berbeda',
          meaning:
            'Cara framework menyediakannya. Laravel memberi Policy, Form Request, dan API Resource sebagai **konvensi**; Express meminta kamu merakit padanannya sendiri. Hasil akhirnya sama — yang berbeda siapa yang menentukan bentuknya.',
        },
        {
          term: 'binding by slug',
          meaning:
            'Perhatikan `{artikel:slug}` pada rute publik. Ia memakai kolom slug, bukan id — alamat jadi stabil dan tidak membocorkan jumlah data, sesuai keputusan URL di Bab 1.1.',
        },
        {
          term: '202 + job id',
          meaning:
            'Endpoint ekspor memakai pola operasi panjang dari Bab 1.9. Yang wajib diingat: status job **di-scope ke pemiliknya** — job id sering bisa ditebak, dan hasilnya berisi data lengkap.',
        },
        {
          term: 'penjagaan pengembangan',
          meaning:
            'Tiga baris di `AppServiceProvider` — `preventLazyLoading`, `preventSilentlyDiscardingAttributes`, `preventAccessingMissingAttributes`. Langkah kedua latihan ini, dan yang membuat tiga kelas bug diam menjadi error sejak awal.',
        },
        {
          term: 'uji rollback migrasi',
          meaning:
            'Bagian langkah pertama yang sering dilewati. Jalankan `migrate` lalu `migrate:rollback` di database lokal — `down()` yang tidak pernah dicoba biasanya rusak, dan kamu menemukannya saat sedang memulihkan produksi.',
        },
        {
          term: 'bandingkan dua implementasi',
          meaning:
            'Langkah penutup yang menentukan nilai latihan ini. Sandingkan dengan versi Express-mu, lalu tulis daftar: apa yang sama, apa yang berbeda, dan **kenapa**. Itulah yang tersisa setelah detail frameworknya terlupa.',
        },
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
      p(
        'Judulnya berbunyi "sama persis", dan itu inti latihan ini: cakupannya **identik** dengan praktik Express di sub-bab 2.13. Membangun hal yang sama dua kali dengan stack berbeda memperlihatkan mana yang benar-benar prinsip dan mana yang sekadar cara sebuah framework menuliskannya — dan tabel perbandingan di akhir sub-bab ini yang merangkumnya.',
      ),
      p(
        'Perhatikan `{artikel:slug}` pada endpoint detail publik, berbeda dari `{artikel}` pada endpoint yang mengubah. Itu custom route key dari sub-bab 4.4: alamat publik memakai slug yang stabil dan ramah dibagikan, sedangkan endpoint pemilik memakai id. Syaratnya kolom `slug` harus `UNIQUE`, kalau tidak alamatnya menjadi ambigu.',
      ),
      p(
        'Empat tingkat akses pada satu sumber daya artikel, yaitu publik, terautentikasi, pemilik-atau-admin, dan butuh ability khusus, adalah alasan konkret kenapa otorisasi tidak bisa diselesaikan satu middleware di depan pintu. Perhatikan pula keterangan pada `GET /api/artikel` yang berbunyi **hanya yang terbit**. Draf yang bocor ke daftar publik adalah kebocoran alih-alih sekadar bug tampilan, dan Policy tidak menjaganya karena hanya scope query yang bisa.',
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
          body: 'Policy untuk view/update/delete/terbitkan, dengan `denyAsNotFound()` untuk data privat. Dan yang paling sering terlewat, **scope di query** untuk endpoint daftar, karena policy tidak berlaku per baris di sana.',
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
      p(
        'Perhatikan hampir setiap judul diawali kata **"menolak"**, **"mengabaikan"**, atau **"menyembunyikan"** — semuanya menguji sesuatu yang seharusnya **tidak** terjadi. Itulah yang membedakan daftar ini dari tes yang biasa ditulis lebih dulu. Jalur sukses adalah bagian yang paling jarang rusak di produksi, dan ia juga bagian yang sudah kamu coba puluhan kali secara manual selama membangun.',
      ),
      p(
        'Perhatikan pula setiap judul menyebut **perilaku yang bisa diamati**, bukan nama kelas yang diuji. "Memberi pesan yang sama untuk email tidak ada dan password salah" tetap bermakna walau seluruh isi controller-nya ditulis ulang; "menguji MasukController" akan berhenti bermakna begitu kelasnya diganti nama.',
      ),
      p(
        'Empat kelompok terakhir sering luput karena tidak terasa seperti "fitur". Kebocoran data dan batas menguji **jalur yang tidak pernah dilalui** saat mencoba manual. Tes penghitung query mengubah N+1 dari masalah yang muncul berbulan-bulan kemudian menjadi kegagalan yang terlihat saat ditambahkan. Dan dua tes job menutup dua hal yang paling mudah bocor di pekerjaan latar: idempotensi handler, dan otorisasi yang mudah terlupa karena "job kan datang dari antrean sendiri".',
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
      p(
        'Empat perintah pertama adalah gerbang yang harus **hijau semua** sebelum pekerjaan disebut selesai. `pint --test` memeriksa format tanpa mengubahnya, sehingga cocok untuk CI. `phpstan analyse` menangkap kesalahan tipe dan properti yang tidak ada sebelum kodenya dijalankan. Perhatikan komentar pada `pest`: **termasuk yang negatif** — suite yang hanya berisi tes jalur sukses tidak membuktikan apa pun tentang keamanan.',
      ),
      p(
        'Tiga perintah terakhir memeriksa hal yang tidak bisa dijawab dari kode. `route:list` memperlihatkan **kolom middleware setiap rute**, dan itu cara tercepat menemukan endpoint yang lupa masuk grup `auth` — kelalaian yang tidak menghasilkan error apa pun. `optimize` memastikan cache config, rute, dan view benar-benar bisa dibangun; kegagalannya di sini jauh lebih murah daripada saat deploy.',
      ),
      p(
        'Dan `curl -sI` memeriksa **header pada server yang benar-benar berjalan**. Konfigurasi yang benar di berkas tetapi tidak diterapkan adalah kegagalan yang paling mudah terlewat sekaligus paling mudah dideteksi. Yang kamu cari: header keamanan ada, `X-Powered-By` **tidak** ada, dan `Cache-Control` sesuai sifat endpoint-nya.',
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

      references(
        {
          label: 'Laravel — Deployment',
          href: 'https://laravel.com/docs/12.x/deployment',
          source: 'Laravel',
          note: 'Langkah yang harus benar sebelum aplikasi Laravel dijalankan di produksi.',
        },
        {
          label: 'Laravel Sanctum',
          href: 'https://laravel.com/docs/12.x/sanctum',
          source: 'Laravel',
          note: 'Autentikasi API pada latihan ini, termasuk `expiresAt` dan pencabutan.',
        },
        {
          label: 'Pest — Writing Tests',
          href: 'https://pestphp.com/docs/writing-tests',
          source: 'Pest',
          note: 'Test runner yang dipakai membuktikan seluruh butir checklist di atas.',
        },
        {
          label: 'REST Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Checklist keamanan yang berlaku sama untuk versi Express maupun Laravel.',
        },
      ),
    ],
  ),
];
