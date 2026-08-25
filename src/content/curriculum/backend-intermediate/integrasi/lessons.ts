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
 * Backend Intermediate — Chapter 4, all eight lessons.
 *
 * The seam between the two halves of the curriculum. Everything here is a problem that neither
 * side owns alone, which is exactly why it tends to be handled badly: each side assumes the other
 * is taking care of it.
 *
 * Next.js 16 on the frontend, the Express and Laravel APIs from chapters 2–3 on the backend.
 */
export const lessons: LessonDraft[] = [
  written(
    'kontrak-tipe-bersama',
    'Kontrak API & Tipe Bersama',
    12,
    'Membuat perubahan backend menjadi error type-check di frontend.',
    [
      p(
        'Frontend dan backend punya satu kontrak, tapi biasanya dua salinan tipenya — satu ditulis di server, satu ditulis ulang dengan tangan di klien. Dua salinan akan menyimpang, dan penyimpangannya baru ketahuan sebagai bug di produksi.',
      ),

      terms(
        {
          term: 'dua salinan tipe',
          meaning:
            'Masalah inti sub-bab ini. Frontend dan backend punya **satu kontrak** tapi biasanya **dua salinan** tipenya — satu di server, satu ditulis ulang dengan tangan di klien. Dua salinan akan menyimpang, dan penyimpangannya baru ketahuan sebagai bug di produksi.',
        },
        {
          term: 'tipe yang dihasilkan',
          meaning:
            'Tipe frontend yang **diturunkan** dari spesifikasi backend, bukan ditulis ulang. Efeknya menentukan: backend mengganti field → frontend **gagal type-check**, bukan diam-diam tetap hijau lalu rusak saat dijalankan.',
        },
        {
          term: 'openapi-typescript',
          meaning:
            'Alat yang membaca spesifikasi OpenAPI lalu menghasilkan berkas tipe TypeScript. Ia menjadikan kontrak yang tadinya dokumen menjadi sesuatu yang **diperiksa compiler**.',
        },
        {
          term: "components['schemas']",
          meaning:
            "Jalur di dalam tipe hasil generate tempat setiap skema berada. Mengambilnya lewat alias (`type Artikel = components['schemas']['Artikel']`) membuat kode aplikasi tidak perlu tahu bentuk berkas hasil generate itu.",
        },
        {
          term: 'regenerate di CI',
          meaning:
            'Menjalankan generate lalu memeriksa apakah hasilnya berubah. Kalau berubah dan tidak di-commit, **CI gagal** — dan itu yang mencegah tipe frontend diam-diam tertinggal dari backend.',
        },
        {
          term: 'tipe bukan validasi',
          meaning:
            'Batas yang wajib dipegang. Tipe TypeScript **hilang saat runtime** — respons server yang bentuknya berbeda tetap masuk tanpa perlawanan. Untuk data dari jaringan, tetap butuh validasi runtime.',
        },
        {
          term: 'validasi respons di klien',
          meaning:
            'Memeriksa respons dengan skema sebelum dipakai. Berguna terutama untuk API pihak ketiga: kalau bentuknya berubah, kamu tahu **di titik masuknya**, bukan lima lapisan kemudian saat sebuah field bernilai `undefined`.',
        },
        {
          term: 'monorepo dengan paket bersama',
          meaning:
            'Alternatif generate: menaruh tipe di paket yang **diimpor kedua sisi**. Bekerja baik kalau frontend dan backend satu repo dan satu bahasa — dan tidak berlaku begitu backendnya PHP.',
        },
        {
          term: 'kontrak lintas bahasa',
          meaning:
            'Alasan OpenAPI menang atas paket bersama di kurikulum ini. Backend Laravel tidak bisa berbagi tipe TypeScript — tapi **bisa** menerbitkan OpenAPI yang menghasilkan tipe untuk frontend mana pun.',
        },
      ),

      h2('Masalahnya'),
      compare(
        {
          title: 'Tipe ditulis dua kali',
          lang: 'ts',
          code: `
          // Backend
          { id: number, judul: string,
            terbitPada: Date | null }

          // Frontend — ditulis ulang
          type Artikel = {
            id: number;
            judul: string;
            terbitPada: string;   // Date? string?
          };
          `,
          notes: ['Backend mengganti field -> frontend tetap hijau', 'Baru rusak saat dijalankan'],
        },
        {
          title: 'Satu sumber',
          lang: 'ts',
          code: `
          // Dihasilkan dari OpenAPI backend
          import type { components }
            from './tipe-api';

          type Artikel =
            components['schemas']['Artikel'];
          `,
          notes: ['Backend berubah -> frontend gagal type-check', 'Ketahuan sebelum deploy'],
        },
      ),
      p(
        'Komentar `// Date? string?` di kolom kiri adalah gejala paling khas dari tipe yang ditulis dua kali: orang yang menulisnya **menebak**. Dan tebakan itu sering salah — `Date` di backend berubah menjadi string ISO begitu melewati `JSON.stringify`, jadi frontend yang menuliskannya sebagai `Date` akan meledak saat memanggil `.getFullYear()` pada sesuatu yang sebenarnya string.',
      ),
      p(
        'Yang membuat kolom kiri berbahaya bukan salah tulis awalnya, melainkan apa yang terjadi **enam bulan kemudian**. Backend mengganti nama `terbitPada` menjadi `diterbitkanPada`, dan tipe frontend tetap menyebut nama lama — TypeScript tidak mengeluh sama sekali, karena ia hanya memeriksa kode frontend terhadap deklarasi frontend. Keduanya konsisten satu sama lain, dan sama-sama salah terhadap kenyataan.',
      ),
      p(
        'Kolom kanan menghapus kemungkinan itu dengan menghilangkan deklarasi keduanya. Tipe `Artikel` bukan ditulis melainkan **diambil** dari berkas hasil generate, jadi tidak ada tempat bagi keduanya untuk menyimpang. Perhatikan catatan di bawahnya: "backend berubah → frontend gagal type-check". Kegagalan itulah produknya — bukan gangguan, melainkan satu-satunya cara ketidakcocokan kontrak bisa ketahuan sebelum sampai ke pengguna.',
      ),

      h2('Menghasilkan tipe dari OpenAPI'),
      code(
        'bash',
        `
        npx openapi-typescript http://localhost:3000/openapi.json -o src/tipe-api.ts
        `,
      ),
      code(
        'json',
        `
        {
          "scripts": {
            "tipe:api": "openapi-typescript $API_URL/openapi.json -o src/tipe-api.ts",
            "type-check": "tsc --noEmit"
          }
        }
        `,
      ),
      p(
        'Perintah pertama menarik spesifikasi OpenAPI dari backend yang **sedang berjalan** lalu menuliskannya sebagai berkas tipe. Perhatikan berkas `src/tipe-api.ts` yang dihasilkan tidak boleh disunting tangan — ia akan ditimpa pada pembangkitan berikutnya, dan suntinganmu hilang tanpa jejak.',
      ),
      p(
        'Menjadikannya skrip npm (`tipe:api`) mengubahnya dari perintah yang harus diingat menjadi langkah yang bisa dijalankan CI. Dan di situlah pola yang disebut peringatan di bawah bekerja: jalankan `npm run tipe:api`, lalu periksa apakah `git diff` pada berkas itu kosong. Kalau tidak kosong, artinya kontrak backend sudah berubah tetapi tipe di repo belum ikut — dan menggagalkan CI di titik itu jauh lebih murah daripada menemukannya sebagai `undefined` di produksi.',
      ),
      p(
        'Perhatikan `$API_URL` dipakai alih-alih alamat yang ditulis mati. CI menjalankannya terhadap backend yang baru saja dibangun, sementara di laptop kamu mengarahkannya ke `localhost:3000` — satu skrip, dua lingkungan, tanpa cabang.',
      ),
      callout(
        'tip',
        'Jalankan penghasil tipe di CI dan gagalkan bila hasilnya berubah',
        'Kalau `git diff` pada berkas tipe tidak kosong setelah dihasilkan ulang, berarti ada perubahan kontrak yang belum masuk ke repo. Menjadikannya kegagalan CI membuat perubahan API tidak bisa lolos tanpa disadari frontend.',
      ),

      h2('Klien bertipe'),
      code(
        'ts',
        `
        import createClient from 'openapi-fetch';
        import type { paths } from './tipe-api';

        export const api = createClient<paths>({
          baseUrl: process.env.NEXT_PUBLIC_API_URL,
          credentials: 'include',
        });

        // Jalur, parameter, dan bentuk respons semuanya bertipe.
        const { data, error } = await api.GET('/api/artikel/{id}', {
          params: { path: { id: 42 } },
        });

        // error dan data adalah union — TypeScript memaksa keduanya ditangani.
        if (error !== undefined) return tampilkanGagal(error);
        console.log(data.data.judul);
        `,
      ),
      p(
        "Generic `createClient<paths>` adalah yang membuat seluruh klien ini bertipe. `paths` berisi **setiap jalur** yang ada di spesifikasi beserta parameter dan bentuk responsnya, jadi `api.GET('/api/artikel/{id}')` diperiksa compiler: salah ketik jalur ditolak, dan lupa mengisi `params.path.id` juga ditolak. Perhatikan jalurnya ditulis dengan `{id}` — bentuk template dari OpenAPI, bukan alamat yang sudah diisi.",
      ),
      p(
        'Baris `const { data, error }` adalah bagian yang paling mengubah kebiasaan. `openapi-fetch` **tidak melempar** untuk respons gagal; ia mengembalikan keduanya sebagai union, dan hanya satu yang terisi. TypeScript lalu memaksamu memeriksa `error` sebelum boleh menyentuh `data` — sesuatu yang `fetch` biasa tidak lakukan, sehingga unhappy path gampang terlupa sampai ia muncul di produksi.',
      ),
      p(
        '`data.data.judul` yang terlihat berulang bukan salah ketik. `data` yang pertama adalah body respons secara keseluruhan, dan `data` yang kedua adalah kunci pembungkus dari kontrak `{ data, meta }` di sub-bab 1.4. Perhatikan pula `credentials: \'include\'` di konfigurasi klien: tanpa itu, cookie sesi tidak ikut terkirim pada permintaan lintas origin — dan itu penyebab paling umum "kenapa API-nya selalu menjawab 401 padahal saya sudah login".',
      ),

      h2('Kalau tidak memakai OpenAPI'),
      code(
        'ts',
        `
        // Paket bersama dalam monorepo
        // packages/kontrak/src/artikel.ts
        import { z } from 'zod';

        export const SkemaArtikel = z.object({
          id: z.number().int(),
          judul: z.string().max(200),
          status: z.enum(['draf', 'terbit', 'arsip']),
          terbitPada: z.string().datetime().nullable(),
        });

        export type Artikel = z.infer<typeof SkemaArtikel>;
        `,
      ),
      p(
        'Backend memakai skema itu untuk memvalidasi keluarannya; frontend memakainya untuk memvalidasi masukannya. Satu berkas, dua arah.',
      ),

      h2('Validasi respons di klien'),
      code(
        'ts',
        `
        export async function ambilArtikel(id: number): Promise<Artikel> {
          const res = await fetch(\`\${API}/api/artikel/\${id}\`, {
            credentials: 'include',
            signal: AbortSignal.timeout(10_000),
          });

          if (!res.ok) throw await KesalahanApi.dari(res);

          const mentah = await res.json();

          // Respons server adalah masukan tidak tepercaya bagi klien —
          // sama seperti input klien bagi server.
          const hasil = SkemaResponsArtikel.safeParse(mentah);

          if (!hasil.success) {
            // Gagal DI SINI, bukan lima komponen kemudian saat sebuah
            // field ternyata undefined.
            laporkan('bentuk respons API tidak sesuai kontrak', hasil.error);
            throw new KesalahanKontrak();
          }

          return hasil.data.data;
        }
        `,
      ),
      p(
        'Komentar di tengah menyatakan pembalikan sudut pandang yang jadi inti sub-bab ini: **respons server adalah masukan tidak tepercaya bagi klien**, persis seperti body permintaan bagi server. Bukan karena servernya jahat, melainkan karena ia bisa berubah — di-deploy versi baru, mengembalikan bentuk berbeda, atau di tengah gangguan mengirim halaman error alih-alih JSON.',
      ),
      p(
        'Inilah batas yang tidak bisa ditutup tipe hasil generate. TypeScript **hilang saat runtime**, jadi `Promise<Artikel>` pada tanda tangan fungsi ini tidak memeriksa apa pun — respons yang bentuknya salah tetap masuk tanpa perlawanan, lalu meledak beberapa komponen kemudian sebagai `undefined`. `safeParse` yang mengubahnya menjadi kegagalan **di titik masuk**, tempat pesannya masih menjelaskan apa yang sebenarnya salah.',
      ),
      p(
        'Perhatikan tiga penjagaan lain yang berjalan berurutan di sini. `AbortSignal.timeout(10_000)` memutus permintaan yang menggantung, sebab tanpanya layar pemuatan berputar selamanya saat backend tidak menjawab. `if (!res.ok)` menangani respons gagal, dan itu wajib karena `fetch` **tidak melempar** untuk status `4xx`/`5xx`, sebab ia hanya melempar saat jaringannya sendiri gagal. Dan `laporkan(...)` mengirim ketidakcocokan kontrak ke pemantauan, sebab kalau tidak, kegagalannya hanya terlihat oleh satu pengguna yang kebetulan mengalaminya.',
      ),
      callout(
        'warning',
        'Validasi respons berbiaya, jadi pilih tempatnya',
        'Memvalidasi setiap respons menambah kerja di klien. Yang paling berharga: endpoint yang datanya dipakai untuk keputusan penting, dan endpoint dari layanan yang **bukan** kamu yang mengendalikannya. Untuk API milik sendiri dengan tipe hasil generate, seringkali cukup di lingkungan pengembangan.',
      ),

      h2('Konvensi yang harus disepakati sekali'),
      table(
        ['Hal', 'Sepakati'],
        [
          ['Penamaan field', '`camelCase` atau `snake_case` — satu untuk seluruh API'],
          ['Tanggal', 'String ISO 8601 dengan zona waktu, selalu'],
          ['Angka besar', 'String, bukan number (di atas 2^53 JavaScript merusaknya)'],
          ['Uang', 'Integer satuan terkecil, atau string desimal'],
          ['Nilai kosong', '`null` atau field dihilangkan — pilih satu'],
          ['Pembungkus', '`{ data, meta }` — putuskan di endpoint pertama'],
        ],
      ),
      callout(
        'danger',
        'ID besar yang dikirim sebagai angka rusak diam-diam',
        '`JSON.parse(\'{"id":9007199254740993}\')` menghasilkan `9007199254740992` — tanpa error, tanpa peringatan. Kalau ID-mu bisa melewati 2^53 (`BIGINT` di Postgres bisa), kirim sebagai **string** sejak awal. Menggantinya setelah ada klien adalah perubahan yang memutus.',
      ),
      references(
        {
          label: 'OpenAPI Specification 3.1',
          href: 'https://spec.openapis.org/oas/latest.html',
          source: 'OpenAPI Initiative',
          note: 'Kontrak yang menjadi sumber tipe di kedua sisi, lintas bahasa.',
        },
        {
          label: 'Zod — Basics',
          href: 'https://zod.dev/basics',
          source: 'Zod',
          note: 'Validasi runtime untuk respons — lapisan yang tidak digantikan tipe TypeScript.',
        },
        {
          label: 'Number.MAX_SAFE_INTEGER',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER',
          source: 'MDN Web Docs',
          note: 'Batas 2^53 yang membuat id besar rusak diam-diam saat di-parse.',
        },
        {
          label: 'RFC 3339 — Date and Time on the Internet',
          href: 'https://www.rfc-editor.org/rfc/rfc3339.html',
          source: 'IETF',
          note: 'Format tanggal yang disepakati kedua sisi, tidak ambigu di zona waktu mana pun.',
        },
      ),
    ],
  ),

  written(
    'cors-praktik',
    'CORS dalam Praktik',
    11,
    'Memahami errornya, bukan sekadar membuatnya hilang.',
    [
      p(
        'CORS adalah sumber frustrasi yang khas karena errornya muncul di browser sementara perbaikannya ada di server. Godaan terbesarnya adalah menyetel `*` supaya errornya berhenti — dan itu justru membuka apa yang seharusnya dijaga.',
      ),

      terms(
        {
          term: 'CORS',
          meaning:
            'Singkatan *Cross-Origin Resource Sharing*. Sumber frustrasi yang khas karena **errornya muncul di browser sementara perbaikannya ada di server**. Godaan terbesarnya: menyetel `*` supaya errornya berhenti — dan itu justru membuka apa yang seharusnya dijaga.',
        },
        {
          term: 'origin',
          meaning:
            'Gabungan **skema + host + port**. `https://app.contoh.com` dan `https://api.contoh.com` adalah origin **berbeda**, begitu juga `http://` dan `https://` pada host yang sama. Perbedaan sekecil apa pun membuatnya lintas-origin.',
        },
        {
          term: 'preflight',
          meaning:
            'Permintaan `OPTIONS` yang dikirim browser **sebelum** permintaan sebenarnya, untuk menanyakan apakah diizinkan. Ia dipicu oleh method selain `GET`/`POST` sederhana, atau oleh header khusus seperti `Authorization`.',
        },
        {
          term: 'simple request',
          meaning:
            'Permintaan yang **tidak** memicu preflight, yaitu `GET` tanpa header khusus. Konsekuensinya penting, sebab browser **mengirimkannya** lalu memblokir pembacaan hasilnya. Efek sampingnya bisa sudah terjadi, dan itu salah satu alasan `GET` tidak boleh mengubah apa pun.',
        },
        {
          term: 'Access-Control-Allow-Origin',
          meaning:
            'Header jawaban yang menyebut origin mana yang diizinkan. Ia harus **sama persis** dengan origin pemanggil — bukan awalan, bukan wildcard domain. Satu karakter berbeda berarti ditolak.',
        },
        {
          term: 'credentials: include',
          meaning:
            'Opsi `fetch` yang menyertakan cookie pada permintaan lintas-origin. Ia menuntut server menjawab `Access-Control-Allow-Credentials: true` **dan** `Allow-Origin` yang spesifik — kombinasi dengan `*` ditolak spesifikasi.',
        },
        {
          term: 'Allow-Headers',
          meaning:
            'Daftar header yang boleh dikirim klien. Header kustom seperti `Idempotency-Key` **wajib** disebut di sini — kalau tidak, preflight-nya gagal dengan pesan "request header field is not allowed".',
        },
        {
          term: 'CORS bukan kontrol akses',
          meaning:
            'Penegasan yang mengikat seluruh sub-bab. CORS adalah **kontrol browser** — ia tidak menghalangi `curl`, skrip, maupun aplikasi mobile. Otorisasi tetap sepenuhnya di server.',
        },
        {
          term: 'maxAge preflight',
          meaning:
            'Berapa lama browser boleh menyimpan hasil preflight. Tanpa itu, setiap permintaan berpasangan dengan satu `OPTIONS` — dua kali perjalanan jaringan untuk setiap aksi.',
        },
      ),

      h2('Yang sebenarnya terjadi'),
      code(
        'text',
        `
        Browser di https://app.contoh.com
          -> fetch ke https://api.contoh.com

        1. Browser melihat origin BERBEDA
        2. Untuk permintaan "tidak sederhana", browser kirim PREFLIGHT dulu:

           OPTIONS /api/artikel
           Origin: https://app.contoh.com
           Access-Control-Request-Method: POST
           Access-Control-Request-Headers: content-type, authorization

        3. Server harus menjawab:

           Access-Control-Allow-Origin: https://app.contoh.com
           Access-Control-Allow-Methods: POST
           Access-Control-Allow-Headers: content-type, authorization

        4. Kalau cocok -> permintaan sebenarnya dikirim
           Kalau tidak -> browser MEMBLOKIRNYA, dan menampilkan error CORS
        `,
      ),
      p(
        'Yang paling penting dipahami dari diagram ini: **yang memblokir adalah browser, bukan server**. Langkah 4 terjadi di dalam browser pengguna, setelah ia membaca jawaban servermu. Itulah alasan error CORS muncul di konsol browser dan tidak pernah muncul di log servermu — dari sudut pandang server, permintaannya dilayani dengan normal.',
      ),
      p(
        'Langkah 2 dan 3 menjelaskan mengapa error CORS sering muncul untuk permintaan yang "kelihatannya tidak salah apa-apa". Preflight adalah permintaan `OPTIONS` **terpisah** yang dikirim browser sendiri — kodemu tidak pernah menuliskannya. Perhatikan isinya: browser menyebutkan method dan header yang **akan** ia pakai, dan server harus menyetujui ketiganya. Melewatkan satu nama header di `Allow-Headers` cukup untuk menggagalkan seluruh permintaan sebelum sempat dikirim.',
      ),
      p(
        'Perhatikan pula preflight hanya dipicu untuk permintaan yang **tidak sederhana** — yang memakai method selain `GET`/`POST` dasar, atau membawa header khusus seperti `Authorization`. Untuk simple request, tidak ada langkah 2 sama sekali: browser langsung mengirimnya, lalu memblokir pembacaan hasilnya. Konsekuensinya ada di peringatan berikut, dan ia serius.',
      ),
      callout(
        'info',
        'Permintaannya sering tetap sampai ke server',
        'Untuk simple request (`GET` tanpa header khusus), browser **mengirimkannya** lalu memblokir **pembacaan hasilnya**. Artinya efek sampingnya bisa sudah terjadi. Ini salah satu alasan `GET` tidak boleh mengubah apa pun.',
      ),

      h2('Membaca pesan errornya'),
      table(
        ['Pesan', 'Artinya'],
        [
          ["`No 'Access-Control-Allow-Origin' header`", 'Origin-mu tidak ada di allow-list server'],
          ['`...does not match the supplied origin`', 'Ada, tapi nilainya tidak sama persis'],
          ['`Request header field X is not allowed`', 'Header itu belum ada di `Allow-Headers`'],
          ['`Method PATCH is not allowed`', 'Method belum ada di `Allow-Methods`'],
          [
            "`Credentials flag is true, but Allow-Origin is '*'`",
            'Kombinasi yang memang dilarang spesifikasi',
          ],
        ],
      ),

      h2('Konfigurasi yang benar'),
      code(
        'js',
        `
        // Express
        const ORIGIN = env.corsOrigins;   // dari environment, berbeda per lingkungan

        app.use(cors({
          origin(origin, cb) {
            // Tanpa origin: curl, server-to-server, aplikasi mobile.
            // Putuskan sadar — bukan otomatis diizinkan tanpa alasan.
            if (origin === undefined) return cb(null, true);

            // Cocokkan PERSIS. Jangan startsWith, jangan regex longgar.
            if (ORIGIN.includes(origin)) return cb(null, true);

            cb(new Error('Origin tidak diizinkan'));
          },
          credentials: true,
          methods: ['GET', 'POST', 'PATCH', 'DELETE'],
          allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
          exposedHeaders: ['X-Request-Id', 'RateLimit-Remaining'],
          maxAge: 86_400,
        }));
        `,
      ),
      code(
        'php',
        `
        // Laravel — config/cors.php
        return [
            'paths' => ['api/*', 'sanctum/csrf-cookie'],
            'allowed_methods' => ['GET', 'POST', 'PATCH', 'DELETE'],
            'allowed_origins' => explode(',', env('CORS_ORIGINS', '')),
            'allowed_origins_patterns' => [],
            'allowed_headers' => ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
            'exposed_headers' => ['X-Request-Id'],
            'max_age' => 86400,
            'supports_credentials' => true,
        ];
        `,
      ),
      p(
        "Kedua konfigurasi menyatakan hal yang sama dengan tata bahasa berbeda, dan keduanya mengambil daftar origin dari **environment** — bukan ditulis mati. Itu yang membuat origin pengembangan tidak pernah ikut ke produksi. Perhatikan Laravel memakai `explode(',', env(...))`: satu variabel berisi daftar dipisah koma, pola yang sama seperti `corsOrigins` di sisi Express.",
      ),
      p(
        "`exposedHeaders` adalah bagian yang paling sering terlewat dan paling membingungkan saat terlewat. Secara bawaan, JavaScript hanya boleh membaca segelintir header standar dari respons lintas origin — header kustommu **tidak terlihat sama sekali**, walaupun jelas terkirim dan terlihat di DevTools. Menyebut `X-Request-Id` di sini yang membuat `res.headers.get('X-Request-Id')` mengembalikan nilai alih-alih `null`.",
      ),
      p(
        'Perhatikan `allowed_origins_patterns` di Laravel sengaja dikosongkan. Field itu menerima regex, dan regex yang sedikit longgar adalah cara paling umum allow-list bocor — pola `/^https:\\/\\/.*\\.contoh\\.com$/` yang lupa meng-escape titik akan meloloskan `https://contohXcom.penyerang.id`. Kalau daftar origin-mu bisa disebut satu per satu, sebutkan satu per satu.',
      ),

      h2('Tiga kesalahan yang membatalkan perlindungannya'),
      ol(
        '**`origin: true`** — memantulkan origin apa pun kembali. Sama saja tidak punya kebijakan sama sekali.',
        '**`origin: \'*\'` dengan `credentials: true`** — ditolak browser, lalu sering "diperbaiki" dengan cara pertama.',
        '**`localhost` tertinggal di daftar produksi** — memberi jalan bagi halaman lokal siapa pun untuk memanggil API produksimu dengan kredensial korban.',
      ),
      callout(
        'danger',
        'CORS bukan kontrol akses',
        'Ia adalah kontrol **browser**. `curl`, skrip Python, dan aplikasi mobile tidak peduli sama sekali pada header CORS. Satu-satunya yang benar-benar menjaga endpoint-mu adalah autentikasi dan otorisasi di server. CORS hanya mengatur origin mana yang boleh **membaca hasilnya** dari dalam browser.',
      ),

      h2('Header yang bisa dibaca klien'),
      code(
        'js',
        `
        // Tanpa exposedHeaders, JavaScript hanya bisa membaca beberapa
        // header standar — header kustommu tidak terlihat sama sekali.
        exposedHeaders: ['X-Request-Id', 'RateLimit-Remaining', 'Location'],
        `,
      ),
      p(
        'Ini penyebab kebingungan yang sering: server jelas mengirim `X-Request-Id`, terlihat di DevTools, tapi `res.headers.get(...)` mengembalikan `null`.',
      ),

      h2('Alternatif: hindari lintas origin sama sekali'),
      code(
        'ts',
        `
        // next.config.ts — proxy lewat origin yang sama
        async rewrites() {
          return [{ source: '/api/:path*', destination: \`\${process.env.API_URL}/api/:path*\` }];
        }
        `,
      ),
      p(
        "Tiga baris ini menghapus seluruh masalah CORS dengan cara yang berbeda, yaitu **membuatnya tidak pernah terjadi**. Browser hanya pernah bicara dengan satu origin, yakni situs Next.js itu sendiri, dan Next.js yang meneruskan permintaannya ke backend dari sisi server. Tidak ada preflight, tidak ada `SameSite=None`, tidak ada `credentials: 'include'` yang harus diingat.",
      ),
      p(
        'Perhatikan `:path*` menangkap seluruh sisa jalur, sehingga `/api/artikel/42?hal=2` diteruskan utuh. Dan `API_URL` **tanpa** awalan `NEXT_PUBLIC_` adalah detail keamanan: alamat backend hanya dibaca di sisi server, jadi ia tidak pernah ikut ke bundle browser — alamat internal backendmu tidak perlu diketahui siapa pun.',
      ),
      p(
        'Harganya disebut di peringatan berikut dan layak dipertimbangkan: satu lompatan jaringan tambahan, dan Next.js kini berada di jalur setiap permintaan API. Kalau proses Next.js-mu sedang berat, API ikut terasa lambat — dua hal yang tadinya berdiri sendiri kini saling bergantung.',
      ),
      callout(
        'tip',
        'Ini menyelesaikan CORS dan sebagian masalah cookie sekaligus',
        'Kalau browser hanya pernah bicara dengan satu origin, tidak ada preflight, tidak ada `SameSite=None`, dan tidak ada masalah cookie lintas domain. Harganya: satu lompatan jaringan tambahan, dan Next.js kini berada di jalur permintaan API.',
      ),

      h2('Verifikasi'),
      code(
        'bash',
        `
        # Preflight — tiru persis yang dikirim browser
        curl -i -X OPTIONS https://api.contoh.com/api/artikel \\
          -H "Origin: https://app.contoh.com" \\
          -H "Access-Control-Request-Method: POST" \\
          -H "Access-Control-Request-Headers: content-type,authorization"

        # Origin yang TIDAK diizinkan harus ditolak, bukan dipantulkan
        curl -sI https://api.contoh.com/api/artikel -H "Origin: https://jahat.com" \\
          | grep -i "access-control-allow-origin"
        `,
      ),
      p(
        'Perintah pertama meniru **persis** apa yang dikirim browser sebelum permintaan sebenarnya: method `OPTIONS`, plus tiga header yang menyebutkan origin, method, dan header yang akan dipakai. Yang kamu periksa di jawabannya adalah apakah ketiganya disetujui — `Allow-Origin` yang cocok, `Allow-Methods` yang memuat `POST`, dan `Allow-Headers` yang memuat keduanya. Menelusuri CORS dengan `curl` seperti ini jauh lebih cepat daripada membaca pesan error browser yang sering hanya menyebut gejala.',
      ),
      p(
        'Perintah kedua adalah uji yang **harus gagal**. Origin `https://jahat.com` tidak ada di allow-list, jadi keluaran `grep` seharusnya **kosong** — tidak ada header `Access-Control-Allow-Origin` sama sekali. Kalau yang muncul justru `Access-Control-Allow-Origin: https://jahat.com`, servermu memantulkan origin apa pun kembali, dan itu sama saja dengan tidak punya kebijakan CORS. Ini kesalahan nomor satu dari daftar tiga di atas, dan satu-satunya cara memastikannya adalah mencobanya.',
      ),
      references(
        {
          label: 'Cross-Origin Resource Sharing (CORS)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS',
          source: 'MDN Web Docs',
          note: 'Alur preflight, simple request, dan setiap header yang terlibat.',
        },
        {
          label: 'Access-Control-Expose-Headers',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Expose-Headers',
          source: 'MDN Web Docs',
          note: 'Kenapa header kustom tidak terbaca JavaScript meski terlihat di DevTools.',
        },
        {
          label: 'Fetch Standard — CORS protocol',
          href: 'https://fetch.spec.whatwg.org/#http-cors-protocol',
          source: 'WHATWG',
          note: 'Spesifikasi yang menetapkan larangan `*` bersama kredensial.',
        },
        {
          label: 'Next.js — Rewrites',
          href: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites',
          source: 'Next.js',
          note: 'Proxy yang menghilangkan lintas-origin sepenuhnya, beserta harganya.',
        },
      ),
    ],
  ),

  written(
    'auth-lintas-domain',
    'Autentikasi Lintas Domain: cookie vs bearer',
    13,
    'Keputusan arsitektur yang menentukan seluruh model keamananmu.',
    [
      p(
        'Ini keputusan yang paling menentukan di seluruh bab. Cookie dan bearer token punya profil risiko yang berbeda secara mendasar, dan memilihnya berdasarkan kemudahan implementasi akan menghasilkan sistem yang rentan di sisi yang tidak kamu perhatikan.',
      ),

      terms(
        {
          term: 'keputusan yang menentukan',
          meaning:
            'Cookie dan bearer token punya **profil risiko yang berbeda secara mendasar**. Memilihnya berdasarkan kemudahan implementasi menghasilkan sistem yang rentan di sisi yang tidak kamu perhatikan.',
        },
        {
          term: 'cookie HttpOnly',
          meaning:
            'Kebal XSS — JavaScript **tidak bisa membacanya sama sekali**, termasuk skrip penyerang. Harganya: rawan CSRF, karena browser mengirimnya otomatis. Perlindungan CSRF sudah disediakan framework, jadi harga itu murah.',
        },
        {
          term: 'bearer token',
          meaning:
            'Kebal CSRF — browser **tidak** menyertakannya otomatis, jadi tidak ada yang bisa ditumpangi permintaan lintas situs. Harganya: kalau disimpan di `localStorage`, satu celah XSS mencurinya.',
        },
        {
          term: 'SameSite=None',
          meaning:
            'Setelan yang membuat cookie ikut pada permintaan lintas situs — dibutuhkan untuk cookie lintas domain berbeda. Ia **wajib** dipasangkan `Secure`, dan sebagian browser membatasinya lebih jauh lagi.',
        },
        {
          term: 'SESSION_DOMAIN',
          meaning:
            'Setelan yang membuat cookie berlaku untuk **seluruh subdomain** — `.contoh.com` mencakup `app.` dan `api.`. Ia yang membuat cookie tetap bisa dipakai tanpa `SameSite=None` selama keduanya satu domain induk.',
        },
        {
          term: 'proxy sebagai jalan tengah',
          meaning:
            'Rewrite di Next.js membuat browser **hanya bicara dengan satu origin** — sehingga cookie tetap bisa dipakai meski API-nya di tempat lain. Sering lebih baik daripada memaksa `SameSite=None`.',
        },
        {
          term: 'token di memori',
          meaning:
            'Menyimpan access token di **variabel JavaScript**, bukan `localStorage`. Ia hilang saat tab ditutup — dan itu justru yang membuatnya lebih aman: XSS tidak bisa membacanya dari penyimpanan yang persisten.',
        },
        {
          term: 'kombinasi yang biasa dipakai',
          meaning:
            'Refresh token di cookie `HttpOnly` ber-`path` sempit, access token pendek di memori. Ia menggabungkan keunggulan keduanya: token panjang tidak bisa dicuri XSS, token pendek tidak rawan CSRF.',
        },
        {
          term: 'jangan pilih berdasarkan kemudahan',
          meaning:
            'Kalimat penutup sub-bab ini. `localStorage` dipilih karena paling mudah — dan itu justru pilihan yang paling rawan XSS. Putuskan dari **profil ancaman** aplikasimu, bukan dari jumlah baris kodenya.',
        },
      ),

      h2('Perbandingan'),
      table(
        ['', 'Cookie `HttpOnly`', 'Bearer token'],
        [
          ['Rawan XSS', '**Tidak** — JS tidak bisa membacanya', 'Ya, kalau di `localStorage`'],
          ['Rawan CSRF', 'Ya — butuh perlindungan tambahan', '**Tidak**'],
          ['Lintas domain berbeda', 'Sulit — butuh `SameSite=None`', 'Mudah'],
          ['Aplikasi mobile', 'Merepotkan', '**Alami**'],
          ['Dikirim otomatis', 'Ya', 'Tidak — kamu yang menyertakannya'],
          ['Pencabutan', 'Hapus sesi di server', 'Butuh mekanisme sendiri'],
        ],
      ),

      h2('Aturan memilih'),
      steps(
        {
          title: 'Satu domain atau subdomain? Pakai cookie.',
          body: '`app.contoh.com` + `api.contoh.com` dengan `SESSION_DOMAIN=.contoh.com`. `HttpOnly` menutup pencurian token lewat XSS sepenuhnya — perlindungan yang tidak bisa diberikan `localStorage`. Harganya adalah CSRF, yang sudah ditangani framework.',
        },
        {
          title: 'Domain benar-benar berbeda? Pertimbangkan proxy dulu.',
          body: 'Rewrite di Next.js membuat browser hanya bicara dengan satu origin, sehingga cookie tetap bisa dipakai. Ini sering lebih baik daripada memaksa `SameSite=None`.',
        },
        {
          title: 'Klien non-browser? Pakai bearer.',
          body: 'Mobile, integrasi partner, CLI. Cookie tidak punya arti di sana, dan bearer memang untuk ini.',
        },
        {
          title: 'Butuh keduanya? Sediakan keduanya.',
          body: 'Sanctum melakukannya dengan cookie untuk SPA dan token untuk klien lain. Yang penting, **jangan campur** dalam satu jalur permintaan, sebab pilih satu saja berdasarkan jenis kliennya.',
        },
      ),

      h2('Pola cookie'),
      code(
        'js',
        `
        // Server
        res.cookie('sesi', idSesi, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',              // 'none' HANYA kalau benar-benar lintas situs
          domain: '.contoh.com',        // dibagikan antar subdomain
          path: '/',
          maxAge: 7 * 24 * 3600_000,
        });
        `,
      ),
      code(
        'ts',
        `
        // Klien — credentials WAJIB, kalau tidak cookie tidak ikut terkirim
        await fetch(\`\${API}/api/artikel\`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': ambilCookie('XSRF-TOKEN'),   // perlindungan CSRF
          },
          body: JSON.stringify(data),
        });
        `,
      ),
      p(
        '`credentials: \'include\'` adalah opsi yang **wajib** ada begitu autentikasimu memakai cookie. Secara bawaan, `fetch` **tidak** menyertakan cookie pada permintaan lintas origin — dan tanpa satu baris itu, setiap permintaan sampai ke server tanpa sesi dan dijawab `401` walaupun penggunanya jelas sudah login. Ini penyebab paling umum dari kebingungan "kok saya dianggap belum masuk padahal cookie-nya ada di browser".',
      ),
      p(
        'Header `X-XSRF-TOKEN` adalah pasangannya yang tidak bisa dilepas. Karena cookie dikirim **otomatis** oleh browser, situs jahat mana pun bisa memicu permintaan ini memakai sesi korban — itulah CSRF. Perlindungannya adalah sesuatu yang **tidak** dikirim otomatis: token yang harus dibaca dari cookie lalu dipasang sebagai header, sesuatu yang tidak bisa dilakukan situs lain karena kebijakan same-origin melarangnya membaca cookie-mu.',
      ),
      callout(
        'danger',
        '`SameSite=None` membuka CSRF yang sebelumnya tertutup',
        'Ia berarti cookie ikut terkirim pada permintaan dari situs mana pun. Kalau kamu terpaksa memakainya, perlindungan CSRF berbasis token menjadi **wajib** — bukan opsional. Dan `Secure` harus menyertainya; browser modern menolak `SameSite=None` tanpa itu.',
      ),

      h2('Pola bearer'),
      code(
        'ts',
        `
        // Access token di MEMORI, bukan localStorage.
        // Hilang saat refresh halaman — dan itu memang yang diinginkan.
        let accessToken: string | null = null;

        export async function fetchApi(jalur: string, opsi: RequestInit = {}) {
          const jalankan = () => fetch(\`\${API}\${jalur}\`, {
            ...opsi,
            credentials: 'include',   // untuk cookie refresh
            headers: {
              ...opsi.headers,
              ...(accessToken !== null && { Authorization: \`Bearer \${accessToken}\` }),
            },
          });

          let res = await jalankan();

          if (res.status === 401) {
            const baru = await perbaruiToken();     // pakai cookie refresh HttpOnly
            if (baru === null) {
              arahkanKeMasuk();
              throw new KesalahanTidakTerautentikasi();
            }
            accessToken = baru;
            res = await jalankan();
          }

          return res;
        }
        `,
      ),
      p(
        'Komentar pertama menyatakan keputusan yang berlawanan dengan naluri banyak orang, yaitu access token disimpan di **variabel biasa** dan bukan `localStorage`. Konsekuensinya token hilang setiap kali halaman dimuat ulang, dan komentarnya menegaskan itu memang yang diinginkan. Alasannya, `localStorage` bisa dibaca skrip apa pun yang berjalan di halamanmu. Satu celah XSS atau satu dependency yang dibajak sudah cukup untuk membuat seluruh token pengguna tercuri. Variabel di memori tidak bisa dijangkau dari luar modulnya.',
      ),
      p(
        'Fungsi `jalankan` dibuat sebagai closure supaya permintaan yang sama bisa **diulang** setelah token diperbarui, tanpa menyusun ulang opsinya. Perhatikan penyebaran bersyarat `...(accessToken !== null && {...})`: kalau tokennya belum ada, header `Authorization` tidak ikut sama sekali — bukan terkirim sebagai `Bearer null` yang akan ditolak dengan pesan membingungkan.',
      ),
      p(
        "Blok `if (res.status === 401)` inilah yang membuat masa berlaku lima belas menit tidak terasa oleh pengguna. Alurnya: permintaan gagal, token diperbarui memakai cookie refresh yang `HttpOnly`, lalu **permintaan yang sama diulang**. Kalau refresh juga gagal, artinya sesinya benar-benar habis dan pengguna diarahkan ke halaman masuk. Perhatikan `credentials: 'include'` tetap ada di sini walau autentikasinya memakai header — cookie refresh butuh itu.",
      ),
      callout(
        'tip',
        'Pola hibrida ini yang paling sering tepat',
        'Access token berumur pendek disimpan di **memori** (tidak bisa dicuri dari `localStorage`), refresh token berumur panjang di **cookie `HttpOnly`** dengan `path` terbatas (tidak bisa dibaca JavaScript). Kehilangan token saat refresh halaman ditutup dengan satu panggilan refresh saat aplikasi dimuat.',
      ),

      h2('Mencegah badai refresh'),
      code(
        'ts',
        `
        // Sepuluh permintaan gagal 401 bersamaan -> jangan sepuluh kali refresh.
        let refreshBerjalan: Promise<string | null> | null = null;

        function perbaruiToken(): Promise<string | null> {
          refreshBerjalan ??= (async () => {
            try {
              const res = await fetch(\`\${API}/api/auth/refresh\`, {
                method: 'POST',
                credentials: 'include',
              });
              if (!res.ok) return null;
              return (await res.json()).data.accessToken;
            } finally {
              refreshBerjalan = null;
            }
          })();

          return refreshBerjalan;
        }
        `,
      ),
      p(
        'Tanpa ini, satu token yang kedaluwarsa saat halaman sedang memuat banyak data menghasilkan belasan permintaan refresh serentak — dan dengan rotasi refresh token, sebagian di antaranya akan **terdeteksi sebagai pemakaian ulang** lalu mencabut seluruh sesi.',
      ),

      h2('Yang tidak boleh dilakukan'),
      ul(
        '**Token di `localStorage` pada aplikasi yang bisa terkena XSS** — dan setiap aplikasi bisa.',
        '**Token di URL** — ia masuk riwayat browser, log server, dan header `Referer`.',
        '**Access token berumur panjang** tanpa cara mencabutnya.',
        '**Menyimpan refresh token di JavaScript** — itu menghapus seluruh keuntungan `HttpOnly`.',
        '**Menyimpulkan izin dari isi token di klien** — klien boleh menampilkan UI berdasarkan itu, tapi server tetap harus memutuskan.',
      ),
      references(
        {
          label: 'Set-Cookie — SameSite',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie',
          source: 'MDN Web Docs',
          note: 'Perilaku `Lax`, `Strict`, dan `None` pada permintaan lintas situs.',
        },
        {
          label: 'Session Management Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa `HttpOnly` cookie lebih aman daripada `localStorage` untuk token.',
        },
        {
          label: 'Cross-Site Request Forgery Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Harga yang dibayar cookie, dan kenapa API murni token tidak menanggungnya.',
        },
        {
          label: 'Laravel Sanctum — SPA Authentication',
          href: 'https://laravel.com/docs/12.x/sanctum#spa-authentication',
          source: 'Laravel',
          note: 'Contoh nyata mode cookie untuk SPA satu domain, beserta konfigurasinya.',
        },
      ),
    ],
  ),

  written(
    'error-end-to-end',
    'Penanganan Error End-to-End',
    12,
    'Dari kegagalan server sampai pesan yang bisa ditindaklanjuti pengguna.',
    [
      p(
        'Rantai error punya empat titik yang masing-masing bisa gagal: server menyusunnya, jaringan mengirimnya, klien menguraikannya, dan antarmuka menampilkannya. Satu yang lemah membuat pengguna melihat layar kosong.',
      ),

      terms(
        {
          term: 'rantai error',
          meaning:
            'Empat titik yang masing-masing bisa gagal: **server menyusunnya**, **jaringan mengirimnya**, **klien menguraikannya**, dan **antarmuka menampilkannya**. Satu yang lemah membuat pengguna melihat layar kosong meski tiga lainnya benar.',
        },
        {
          term: 'kode error stabil',
          meaning:
            'String seperti `VALIDASI_GAGAL` yang dipakai klien untuk **bercabang**. Pesan boleh berubah dan diterjemahkan; kode tidak. Klien yang mencocokkan teks pesan akan rusak begitu pesannya diperhalus.',
        },
        {
          term: 'kelas error di klien',
          meaning:
            'Turunan `Error` yang membawa `status`, `kode`, dan `field`. Ia mengubah error API dari objek acak menjadi sesuatu yang bisa **diperiksa tipenya** dan ditangani berbeda per jenis.',
        },
        {
          term: 'error jaringan vs error API',
          meaning:
            'Dua hal yang berbeda dan sering disamakan. `fetch` **hanya melempar** untuk kegagalan jaringan; respons `500` tetap dianggap berhasil. Keduanya butuh penanganan terpisah — dan pesan yang berbeda ke pengguna.',
        },
        {
          term: 'error boundary',
          meaning:
            'Batas React yang menangkap error saat render sehingga satu komponen gagal tidak menjatuhkan seluruh halaman. Ia lapisan terakhir — bukan pengganti penanganan error di tempat pemanggilannya.',
        },
        {
          term: 'error per field',
          meaning:
            'Peta `{ "judul": "wajib diisi" }` yang memungkinkan antarmuka menampilkan pesan **di sebelah input** yang bersangkutan. Satu pesan umum di atas form memaksa pengguna menebak field mana yang salah.',
        },
        {
          term: 'requestId ke pengguna',
          meaning:
            'Menampilkan correlation id pada pesan error. Ia yang mengubah "tadi error" menjadi laporan yang bisa ditelusuri — dan itu murah dipasang dibanding waktu yang dihemat saat menyelidiki.',
        },
        {
          term: 'pesan yang bisa ditindaklanjuti',
          meaning:
            'Pesan yang memberi tahu pengguna **apa yang harus dilakukan**, bukan apa yang terjadi di dalam sistem. "Jaringan bermasalah, coba lagi" berguna; "Error 500" tidak.',
        },
        {
          term: 'jangan tampilkan pesan server mentah',
          meaning:
            'Pesan `5xx` dari server bisa memuat nama tabel, jalur berkas, atau potongan query. Tampilkan pesan generik milik klien, dan sertakan `requestId` — detail lengkapnya tetap di log server.',
        },
      ),

      h2('Bentuk error yang konsisten'),
      code(
        'json',
        `
        {
          "error": {
            "kode": "VALIDASI_GAGAL",
            "pesan": "Data yang dikirim tidak valid",
            "field": { "judul": "wajib diisi" },
            "requestId": "a1b2c3d4"
          }
        }
        `,
      ),
      p(
        'Bentuk ini sama persis dengan yang diputuskan backend di sub-bab 1.4 — dan kesamaan itulah intinya. Rantai penanganan error yang baik dimulai dari kesepakatan bentuk: selama seluruh endpoint menjawab dengan struktur ini, klien cukup menulis **satu** penerjemah, bukan satu per endpoint.',
      ),
      p(
        'Keempat field-nya punya pembaca yang berbeda, dan itu yang membuat semuanya diperlukan. `kode` dibaca **program** untuk memutuskan cabang — ia stabil dan tidak boleh berubah artinya. `pesan` dibaca **manusia** dan boleh diterjemahkan kapan saja. `field` dibaca **komponen formulir** untuk menempelkan pesan di samping input yang tepat. Dan `requestId` dibaca **kamu**, saat pengguna melaporkan sesuatu dan kamu perlu menemukan jejaknya di log.',
      ),

      h2('Kelas error di klien'),
      code(
        'ts',
        `
        export class KesalahanApi extends Error {
          constructor(
            readonly status: number,
            readonly kode: string,
            pesan: string,
            readonly field?: Record<string, string>,
            readonly requestId?: string,
          ) {
            super(pesan);
            this.name = 'KesalahanApi';
          }

          static async dari(res: Response): Promise<KesalahanApi> {
            let isi: unknown;
            try {
              isi = await res.json();
            } catch {
              // Server bisa menjawab HTML (halaman error proxy) atau kosong.
              // Jangan sampai pengurai yang gagal menutupi error aslinya.
              isi = undefined;
            }

            const e = (isi as { error?: Record<string, unknown> })?.error;

            return new KesalahanApi(
              res.status,
              typeof e?.kode === 'string' ? e.kode : \`HTTP_\${res.status}\`,
              typeof e?.pesan === 'string' ? e.pesan : 'Terjadi kesalahan',
              e?.field as Record<string, string> | undefined,
              res.headers.get('X-Request-Id') ?? undefined,
            );
          }
        }
        `,
      ),
      p(
        'Kelas ini mengubah error API dari "sesuatu yang bentuknya entah apa" menjadi objek yang **bisa dicabangkan**. Perhatikan `status` dan `kode` disimpan terpisah: `status` adalah kode HTTP yang menentukan tindakan umum, sementara `kode` adalah penanda stabil dari sub-bab 1.4 yang membedakan dua kegagalan berbeda pada status yang sama — `SALDO_TIDAK_CUKUP` dan `PRODUK_HABIS` sama-sama `409`, tetapi pesannya ke pengguna berbeda.',
      ),
      p(
        'Blok `try/catch` di sekitar `res.json()` menangani hal yang sering dilupakan: **respons error tidak selalu JSON**. Gateway yang timeout, halaman error dari proxy, atau rate limiter di lapisan infrastruktur sering menjawab HTML atau bahkan kosong. Tanpa `try`, pengurai yang gagal akan melempar `SyntaxError` dan **menutupi error aslinya** — pengguna melihat "Unexpected token <" alih-alih "server sedang bermasalah".',
      ),
      p(
        "Rangkaian `typeof e?.kode === 'string' ? ... : ...` mungkin terlihat berlebihan, tetapi ia menerapkan prinsip yang sama seperti validasi respons di sub-bab 3.1, yaitu badan error pun datang dari jaringan dan bentuknya tidak dijamin. Setiap field diperiksa tipenya, dan nilai cadangan disediakan, misalnya `HTTP_500` sebagai kode kalau servernya tidak mengirim apa-apa. Perhatikan `requestId` diambil dari **header** `X-Request-Id` dan bukan dari body, sebab header tetap ada bahkan ketika body-nya kosong atau rusak, jadi jejak penelusurannya tidak ikut hilang.",
      ),
      callout(
        'warning',
        'Jangan berasumsi respons error selalu JSON',
        'Gateway timeout, halaman error dari proxy, dan rate limiter di lapisan infrastruktur sering menjawab HTML atau kosong. `await res.json()` yang tidak dibungkus `try` akan melempar `SyntaxError` — dan pengguna melihat "Unexpected token <" alih-alih pesan yang berguna.',
      ),

      h2('Menerjemahkan ke tindakan'),
      code(
        'ts',
        `
        export function tanganiKesalahan(err: unknown): TindakanUi {
          if (err instanceof KesalahanApi) {
            switch (err.status) {
              case 401:
                return { jenis: 'masuk-ulang' };
              case 403:
                return { jenis: 'pesan', teks: 'Kamu tidak punya akses ke sini.' };
              case 404:
                return { jenis: 'kosong', teks: 'Data tidak ditemukan.' };
              case 409:
                return { jenis: 'pesan', teks: err.pesan, bisaUlang: true };
              case 422:
                return { jenis: 'error-field', field: err.field ?? {} };
              case 429:
                return { jenis: 'pesan', teks: 'Terlalu banyak permintaan. Tunggu sebentar.' };
              default:
                if (err.status >= 500) {
                  return {
                    jenis: 'pesan',
                    // requestId memberi pengguna sesuatu yang bisa dilaporkan
                    teks: \`Ada gangguan di server. Kode: \${err.requestId ?? '-'}\`,
                    bisaUlang: true,
                  };
                }
                return { jenis: 'pesan', teks: err.pesan };
            }
          }

          if (err instanceof DOMException && err.name === 'AbortError') {
            return { jenis: 'diam' };   // dibatalkan sengaja — bukan kegagalan
          }

          if (err instanceof TypeError) {
            // fetch melempar TypeError saat jaringan gagal
            return { jenis: 'pesan', teks: 'Koneksi bermasalah. Periksa jaringanmu.', bisaUlang: true };
          }

          return { jenis: 'pesan', teks: 'Terjadi kesalahan.', bisaUlang: true };
        }
        `,
      ),
      p(
        'Fungsi ini menerjemahkan status HTTP menjadi **tindakan antarmuka**, dan pemetaannya bukan selera. `401` berarti sesinya habis, jadi arahkan ke halaman masuk. `403` berarti sudah dikenali tetapi tidak berhak, sehingga halaman masuk tidak akan menolong dan yang tepat adalah menampilkan pesan. `404` bukan error melainkan **empty state**, dan menampilkannya sebagai pesan merah membuat daftar yang wajar-wajar saja terlihat rusak. `422` adalah satu-satunya yang menghasilkan `error-field`, karena hanya ia yang membawa rincian per kolom.',
      ),
      p(
        'Cabang `err.status >= 500` menampilkan `requestId` kepada pengguna, dan itu keputusan yang menghemat banyak waktu kedua belah pihak. Pesannya tetap generik tanpa detail internal yang bocor, tetapi pengguna punya **sesuatu yang bisa dilaporkan**, dan kamu bisa menemukan jejak persisnya di log tanpa menebak dari perkiraan waktu.',
      ),
      p(
        "Dua `instanceof` terakhir menangani kegagalan yang **bukan** berasal dari respons server. `AbortError` muncul saat permintaan sengaja dibatalkan, misalnya pengguna mengetik cepat di kotak pencarian atau berpindah halaman, dan jawabannya `{ jenis: 'diam' }` karena itu perilaku yang benar alih-alih kegagalan. Menampilkannya sebagai error adalah bug yang sangat sering muncul di kotak pencarian, berupa banjir pesan gagal yang tidak berarti apa-apa.",
      ),
      p(
        'Sedangkan `TypeError` adalah cara `fetch` melaporkan **kegagalan jaringan** — koneksi putus, DNS gagal, atau permintaan diblokir CORS. Perhatikan pesannya berbicara tentang koneksi, bukan tentang server: dari sisi klien, keduanya tidak bisa dibedakan, dan menyarankan pengguna memeriksa jaringannya adalah tebakan yang paling mungkin menolong.',
      ),
      callout(
        'danger',
        'Membatalkan permintaan bukan kegagalan',
        'Saat pengguna mengetik cepat atau berpindah halaman, permintaan lama dibatalkan — dan itu perilaku yang benar. Menampilkannya sebagai error membuat antarmuka penuh pesan gagal yang tidak berarti apa-apa. Ini bug yang sangat sering muncul di kotak pencarian.',
      ),

      h2('Menampilkan error validasi'),
      code(
        'tsx',
        `
        {/* Field-level, bukan satu pesan umum di atas form */}
        <label htmlFor="judul">Judul</label>
        <input
          id="judul"
          name="judul"
          aria-invalid={errorField.judul !== undefined}
          aria-describedby={errorField.judul !== undefined ? 'judul-error' : undefined}
        />
        {errorField.judul !== undefined && (
          <p id="judul-error" role="alert">{errorField.judul}</p>
        )}
        `,
      ),
      p(
        'Inilah tempat field `field` dari badan error akhirnya terpakai. Karena backend mengirim `{ "judul": "wajib diisi" }` alih-alih satu kalimat umum, antarmuka bisa menempelkan pesannya **tepat di bawah input yang bersangkutan** — pengguna tidak perlu menebak kolom mana yang bermasalah di formulir berisi dua belas isian.',
      ),
      p(
        'Tiga atribut ARIA di sini menyambungkan pesan itu ke input-nya untuk pembaca layar. `aria-invalid` menandai input-nya bermasalah, dan `aria-describedby` menunjuk `id` elemen yang menjelaskannya — sehingga saat pengguna berpindah ke kolom itu, pesan errornya ikut dibacakan. Perhatikan keduanya bernilai `undefined` saat tidak ada error, bukan `false` atau string kosong: atribut yang bernilai `undefined` di React **tidak dirender sama sekali**, dan itu yang benar.',
      ),
      p(
        '`role="alert"` pada paragraf pesannya membuat pembaca layar mengumumkannya **seketika saat muncul**, tanpa menunggu pengguna berpindah fokus ke sana. Tanpa ketiganya, satu pesan umum di atas formulir sering tidak terbaca sama sekali oleh pengguna pembaca layar — kegagalan aksesibilitas yang lahir dari keputusan bentuk respons di sisi backend, bukan dari kelalaian frontend.',
      ),
      callout(
        'tip',
        'Ini juga aturan aksesibilitas',
        '`aria-invalid` dan `aria-describedby` membuat screen reader mengumumkan error bersama field-nya. Satu pesan umum di atas form memaksa pengguna menebak field mana yang bermasalah — dan bagi pengguna screen reader, sering tidak terbaca sama sekali.',
      ),

      h2('Jangan pernah kehilangan isian pengguna'),
      code(
        'tsx',
        `
        async function simpan(data: FormData) {
          try {
            await api.buatArtikel(data);
            router.push('/artikel');
          } catch (err) {
            // JANGAN reset form. Pengguna sudah mengetik sepuluh menit.
            setErrorField(tanganiKesalahan(err));
          }
        }
        `,
      ),
      p(
        'Komentar berhuruf besar itu menandai kegagalan UX yang paling menyakitkan sekaligus paling mudah dihindari. Menyetel ulang formulir setelah simpan gagal terasa seperti "membersihkan keadaan", padahal ia **menghapus pekerjaan pengguna** — dan justru pada saat pengguna sudah frustrasi karena simpanannya gagal. Yang berubah setelah kegagalan hanyalah pesan error; isian tetap utuh.',
      ),
      p(
        'Perhatikan pula `router.push` berada **di dalam** `try`, setelah pemanggilan API berhasil. Menaruhnya di luar akan membuat pengguna berpindah halaman walaupun simpanannya gagal — dan datanya hilang tanpa satu pun peringatan.',
      ),

      h2('Retry hanya untuk yang memang sementara'),
      code(
        'ts',
        `
        const BISA_ULANG = new Set([408, 429, 500, 502, 503, 504]);

        export async function denganRetry<T>(fn: () => Promise<T>, maks = 3): Promise<T> {
          for (let i = 0; i < maks; i++) {
            try {
              return await fn();
            } catch (err) {
              const terakhir = i === maks - 1;
              const bolehUlang = err instanceof KesalahanApi
                ? BISA_ULANG.has(err.status)
                : err instanceof TypeError;   // kegagalan jaringan

              if (terakhir || !bolehUlang) throw err;

              // Backoff eksponensial + jitter, supaya klien tidak
              // menyerbu server bersamaan setelah gangguan.
              const jeda = 2 ** i * 500 + Math.random() * 300;
              await new Promise((r) => setTimeout(r, jeda));
            }
          }
          throw new Error('tak terjangkau');
        }
        `,
      ),
      p(
        '`BISA_ULANG` adalah allow-list, dan isinya dipilih dengan alasan yang sama seperti pada antrean BullMQ di sub-bab 2.8, yaitu hanya kegagalan yang **sifatnya sementara** yang layak diulang. `429` dan `503` berarti "coba lagi nanti", `502`/`504` berarti gangguan di hulu. Yang tidak ada di daftar itu, yaitu seluruh `4xx` lain, tidak akan berubah hasilnya berapa kali pun diulang. Mengulang `422` hanya membebani server tanpa peluang berhasil.',
      ),
      p(
        'Perhatikan `err instanceof TypeError` juga dianggap bisa diulang. Itu kegagalan jaringan, dan jaringan yang putus sedetik memang persis kasus yang retry dirancang untuknya.',
      ),
      p(
        'Bagian `Math.random() * 300` disebut **jitter**, dan ia menyelesaikan masalah yang muncul justru karena retry-nya bekerja. Tanpa jitter, seribu klien yang gagal pada detik yang sama akan mencoba lagi pada detik yang sama pula — menyerbu server yang baru saja pulih dan menjatuhkannya kembali. Menambahkan pengacakan menyebar percobaan itu. Perhatikan pula `if (terakhir || !bolehUlang) throw err`: error aslinya **dilempar apa adanya** pada percobaan terakhir, bukan diganti pesan "gagal setelah 3 kali" yang menghilangkan informasi.',
      ),
      callout(
        'danger',
        'Jangan pernah mengulang `4xx`',
        'Kesalahan klien tidak akan berubah hasilnya dengan diulang — permintaan yang sama tetap salah. Mengulang `422` hanya membebani server. Dan mengulang `POST` yang tidak idempoten bisa menghasilkan data ganda; itu yang diselesaikan `Idempotency-Key`.',
      ),

      h2('Hubungkan log dua sisi'),
      code(
        'ts',
        `
        // requestId dari server ikut dilaporkan dari klien —
        // sehingga satu pencarian menemukan kedua sisinya.
        laporkanKeMonitoring(err, {
          requestId: err instanceof KesalahanApi ? err.requestId : undefined,
          jalur: window.location.pathname,
        });
        `,
      ),
      p(
        'Ini yang menutup rantai penelusuran dari ujung ke ujung. `requestId` lahir di middleware server, dikirim kembali lewat header `X-Request-Id`, ditangkap `KesalahanApi.dari`, dan di sini ikut dilaporkan dari **sisi klien**. Hasilnya: satu pencarian dengan id itu menemukan **kedua sisi** — apa yang dilihat pengguna di browser, dan apa yang benar-benar terjadi di server.',
      ),
      p(
        'Tanpa penyambungan ini, kamu punya dua kumpulan data yang tidak bisa dipertemukan: laporan error frontend yang berbunyi "gagal menyimpan" tanpa sebab, dan log server yang penuh stack trace tanpa tahu mana yang benar-benar dirasakan pengguna. Perhatikan `jalur` ikut dikirim — halaman tempat error terjadi sering menjelaskan konteks yang tidak terlihat dari log server, karena satu endpoint bisa dipanggil dari beberapa layar dengan alasan berbeda.',
      ),

      references(
        {
          label: 'Using the Fetch API — Checking that the fetch was successful',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
          source: 'MDN Web Docs',
          note: 'Menjelaskan kenapa `fetch` tidak melempar untuk respons `4xx`/`5xx` — sumber kebingungan paling umum di rantai error.',
        },
        {
          label: 'Error — Custom error types',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error',
          source: 'MDN Web Docs',
          note: 'Cara membuat turunan `Error` sendiri, dasar dari kelas `KesalahanApi` di sub-bab ini.',
        },
        {
          label: 'ARIA: alert role',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role',
          source: 'MDN Web Docs',
          note: 'Bagaimana pesan error diumumkan ke screen reader tanpa memindahkan fokus.',
        },
        {
          label: 'RFC 9457 — Problem Details for HTTP APIs',
          href: 'https://www.rfc-editor.org/rfc/rfc9457.html',
          source: 'RFC Editor',
          note: 'Format error HTTP baku bila ingin memakai standar alih-alih bentuk buatan sendiri.',
        },
      ),
    ],
  ),

  written(
    'optimistic-sinkronisasi',
    'Optimistic Update & Sinkronisasi Cache',
    12,
    'Menjaga tampilan tetap seirama dengan server.',
    [
      p(
        'Frontend Intermediate membahas mekanikanya. Sub-bab ini tentang bagian yang membutuhkan **kedua sisi**: apa yang harus dikembalikan server, dan bagaimana klien menyelaraskan diri setelahnya.',
      ),

      terms(
        {
          term: 'optimistic update',
          meaning:
            'Mengubah tampilan **sebelum** server menjawab, dengan asumsi permintaannya akan berhasil. Ia menghapus jeda yang terasa; harganya adalah kewajiban mengembalikan keadaan bila ternyata gagal.',
        },
        {
          term: 'mutation (mutasi)',
          meaning:
            'Permintaan yang **mengubah** data di server — `POST`, `PATCH`, `PUT`, `DELETE`. Lawannya query, yang hanya membaca. Library data memisahkan keduanya karena aturan cache-nya berbeda.',
        },
        {
          term: 'cache',
          meaning:
            'Salinan data server yang disimpan klien supaya tidak perlu meminta ulang setiap kali. Ia mempercepat, tapi menciptakan masalah baru: salinan itu bisa **basi** dan harus diselaraskan.',
        },
        {
          term: 'queryKey',
          meaning:
            'Kunci identitas satu potong data di cache. Semua nilai yang memengaruhi hasil, mulai dari kategori, urutan, halaman, sampai identitas pengguna, wajib masuk ke dalamnya, kalau tidak dua hasil berbeda akan berbagi satu slot.',
        },
        {
          term: 'invalidate',
          meaning:
            'Menandai data cache sebagai **basi** sehingga library mengambilnya ulang. Ini yang menyelaraskan tampilan dengan kebenaran server setelah mutasi selesai.',
        },
        {
          term: 'rollback',
          meaning:
            'Mengembalikan cache ke snapshot sebelum perubahan optimistik, saat server menolak. Tanpa snapshot yang disimpan lebih dulu, tidak ada yang bisa dikembalikan.',
        },
        {
          term: 'onMutate / onError / onSettled',
          meaning:
            'Tiga titik hidup sebuah mutasi: **sebelum** dikirim (tempat perubahan optimistik), saat **gagal** (tempat rollback), dan **setelah selesai** apa pun hasilnya (tempat invalidate).',
        },
        {
          term: 'cancelQueries',
          meaning:
            'Menghentikan pengambilan data yang sedang berjalan. Wajib dipanggil sebelum perubahan optimistik — kalau tidak, respons lama bisa tiba **setelahnya** dan menimpa perubahan yang baru saja dibuat.',
        },
        {
          term: 'ETag',
          meaning:
            'Header berisi penanda versi sebuah resource. Klien mengirimnya kembali lewat `If-Match`; server menolak dengan `412` bila versinya sudah berubah — itulah **optimistic concurrency**.',
        },
        {
          term: 'lost update',
          meaning:
            'Dua orang menyunting data yang sama; penyimpan kedua menghapus pekerjaan penyimpan pertama. Bahayanya justru karena ia **tidak menimbulkan error apa pun** — semua terlihat berhasil.',
        },
        {
          term: 'stale time',
          meaning:
            'Berapa lama data cache dianggap masih segar sebelum layak diambil ulang. Nilainya adalah keputusan produk: seberapa basi data ini masih boleh terlihat oleh pengguna.',
        },
      ),

      h2('Kembalikan objek lengkap dari mutasi'),
      compare(
        {
          title: 'Memaksa satu perjalanan lagi',
          lang: 'json',
          code: `
          POST /api/artikel
          -> 201
          { "data": { "id": 42 } }

          Klien harus GET lagi untuk
          mendapat slug, timestamp,
          dan nilai default lainnya.
          `,
          notes: ['Dua perjalanan', 'Ada jeda yang terlihat'],
        },
        {
          title: 'Cukup satu',
          lang: 'json',
          code: `
          POST /api/artikel
          -> 201
          {
            "data": {
              "id": 42,
              "slug": "belajar-api-a1b2",
              "status": "draf",
              "dibuatPada": "2026-08-02T10:00:00Z"
            }
          }
          `,
          notes: ['Klien langsung bisa memperbarui cache'],
        },
      ),
      p(
        'Bandingkan apa yang **tidak** bisa ditebak klien: `slug` mengandung akhiran acak `a1b2`, `dibuatPada` datang dari jam server, dan `status: "draf"` adalah nilai bawaan yang ditetapkan skema database. Karena ketiganya lahir di server, kolom kiri memaksa klien mengirim `GET` susulan hanya untuk mengetahui apa yang baru saja ia buat sendiri.',
      ),
      p(
        'Biaya yang tidak terlihat dari kolom kiri adalah **keadaan sementara yang salah**. Di antara `POST` dan `GET` susulan, antarmuka memegang objek yang hanya punya `id` — jadi ia menampilkan judul kosong, tanggal kosong, atau kerangka pemuatan yang berkedip sesaat. Kolom kanan menghapus jeda itu sepenuhnya: klien langsung punya objek utuh untuk dimasukkan ke cache.',
      ),
      p(
        'Aturan umumnya: **kembalikan bentuk yang sama dengan yang dikembalikan `GET`** untuk sumber daya itu. Dengan begitu klien bisa memakai satu tipe dan satu jalur pembaruan cache, bukan menulis cabang khusus untuk respons pembuatan. Ini juga yang membuat pola optimistic update di bagian berikutnya bisa mengganti data sementara dengan data sungguhan tanpa penyesuaian bentuk.',
      ),
      callout(
        'tip',
        'Ini keputusan API yang langsung terasa di UX',
        'Nilai yang dihasilkan server, seperti slug, nomor urut, timestamp, dan total yang dihitung ulang, tidak bisa ditebak klien. Mengembalikannya menghapus satu perjalanan jaringan **dan** menghilangkan keadaan sementara yang salah.',
      ),

      h2('Optimistic update dengan pembatalan'),
      code(
        'ts',
        `
        const { mutate } = useMutation({
          mutationFn: (id: string) => api.tandaiSelesai(id),

          async onMutate(id) {
            // 1. Hentikan refetch yang sedang jalan — kalau tidak, ia bisa
            //    tiba setelah perubahan optimistik dan menimpanya.
            await queryClient.cancelQueries({ queryKey: ['todo'] });

            // 2. Snapshot untuk dikembalikan
            const sebelumnya = queryClient.getQueryData<Todo[]>(['todo']);

            // 3. Ubah cache sekarang
            queryClient.setQueryData<Todo[]>(['todo'], (lama) =>
              lama?.map((t) => (t.id === id ? { ...t, selesai: true } : t)),
            );

            return { sebelumnya };
          },

          onError(_e, _id, ctx) {
            if (ctx?.sebelumnya) queryClient.setQueryData(['todo'], ctx.sebelumnya);
          },

          onSettled() {
            // 4. Selaraskan dengan kebenaran server, berhasil maupun gagal.
            queryClient.invalidateQueries({ queryKey: ['todo'] });
          },
        });
        `,
      ),
      p(
        'Empat langkah bernomor itu harus lengkap dan berurutan, sebab melewatkan satu pun menghasilkan bug yang sulit dilacak. Langkah 1, `cancelQueries`, paling sering dilupakan. Tanpanya, pengambilan data yang **sedang berjalan** bisa selesai setelah kamu mengubah cache, dan responsnya yang membawa keadaan lama menimpa perubahan optimistikmu. Gejalanya berupa centang yang berkedip menyala lalu padam sendiri.',
      ),
      p(
        'Langkah 2 dan `onError` bekerja berpasangan. `getQueryData` menyimpan salinan keadaan sebelum diubah, dan nilai itu dikembalikan dari `onMutate` — TanStack Query menyalurkannya ke `onError` sebagai `ctx`. Tanpa snapshot itu, tidak ada yang bisa dikembalikan saat server menolak, dan antarmuka tetap menampilkan perubahan yang sebenarnya gagal. Perhatikan `ctx?.sebelumnya` diperiksa dengan optional chaining: `onMutate` bisa saja gagal sebelum sempat mengembalikan apa pun.',
      ),
      p(
        'Langkah 3 memakai bentuk fungsi `(lama) => ...` alih-alih menyetel nilai langsung, sehingga perubahannya selalu didasarkan pada isi cache **saat itu**. Dan `onSettled` di langkah 4 berjalan **di kedua jalur**, baik berhasil maupun gagal. Itu disengaja, sebab setelah berhasil invalidate mengganti tebakan optimistikmu dengan data sungguhan dari server, termasuk field yang tidak kamu ubah, sedangkan setelah gagal ia memastikan cache benar-benar selaras dan bukan hanya bergantung pada ketepatan rollback-mu.',
      ),

      h2('Kapan optimistic berbahaya'),
      table(
        ['Aman', 'Berbahaya'],
        [
          ['Suka, bookmark, tandai dibaca', 'Pembayaran'],
          ['Centang todo', 'Pemesanan berstok terbatas'],
          ['Ubah judul catatan', 'Booking kursi atau jadwal'],
          ['Arsipkan', 'Aksi yang tidak bisa ditarik (kirim email)'],
        ],
      ),
      callout(
        'danger',
        'Optimistic pada operasi yang bisa ditolak server adalah janji palsu',
        'Menampilkan "pesanan berhasil" lalu menariknya kembali karena stok habis jauh lebih buruk daripada menunggu satu detik. Untuk apa pun yang menyangkut uang atau sumber daya terbatas, tampilkan status "memproses" yang jujur.',
      ),

      h2('Kunci cache harus mencerminkan seluruh input'),
      code(
        'ts',
        `
        // Setiap nilai yang memengaruhi hasil WAJIB masuk ke kunci.
        useQuery({
          queryKey: ['artikel', { kategori, urut, halaman }],
          queryFn: () => api.ambilArtikel({ kategori, urut, halaman }),
        });

        // Invalidasi cocok berdasarkan awalan — susun dari umum ke khusus.
        queryClient.invalidateQueries({ queryKey: ['artikel'] });
        `,
      ),
      p(
        'Aturannya satu kalimat: **setiap nilai yang memengaruhi hasil wajib masuk ke `queryKey`**. Kalau `halaman` dihilangkan dari kunci itu, halaman 1 dan halaman 2 akan berbagi satu slot cache — pengguna berpindah halaman dan melihat isi halaman sebelumnya, atau lebih buruk, data yang tercampur. Kunci adalah **identitas** sepotong data, bukan sekadar label.',
      ),
      p(
        "Baris terakhir memperlihatkan mengapa kuncinya disusun sebagai array bertingkat, dari umum ke khusus. `invalidateQueries({ queryKey: ['artikel'] })` mencocokkan berdasarkan **awalan**, jadi satu pemanggilan membatalkan seluruh varian — semua kategori, semua urutan, semua halaman sekaligus. Kalau kuncinya ditulis datar sebagai satu string (`\`artikel-${kategori}-${halaman}\``), kamu terpaksa menghapusnya satu per satu dan pasti ada yang terlewat.",
      ),
      callout(
        'danger',
        'Kunci cache juga harus memisahkan pengguna',
        'Setelah pengguna berganti akun, cache milik akun sebelumnya masih ada di memori. Tanpa identitas di kunci, atau tanpa `queryClient.clear()` saat keluar, pengguna baru bisa melihat data pengguna sebelumnya. Ini kebocoran yang terjadi sepenuhnya di sisi klien.',
      ),
      code(
        'ts',
        `
        // Saat keluar
        await api.keluar();
        queryClient.clear();        // buang SEMUA cache
        accessToken = null;
        `,
      ),
      p(
        'Tiga baris ini harus berjalan **bersama**, dan urutannya masuk akal: cabut sesi di server dulu, baru bersihkan jejaknya di klien. `queryClient.clear()` adalah yang paling sering terlupa, dan akibatnya nyata — cache TanStack Query hidup di memori JavaScript, tidak ikut hilang saat cookie dihapus. Tanpa baris itu, pengguna berikutnya yang masuk di perangkat yang sama bisa melihat data pengguna sebelumnya sesaat sebelum data barunya tiba.',
      ),
      p(
        'Perhatikan ini kebocoran yang terjadi **sepenuhnya di sisi klien** — servermu berperilaku benar sempurna, sesi lama sudah dicabut, dan tidak ada satu pun permintaan yang salah. Karena itu ia tidak akan pernah muncul di log server maupun tertangkap tes API. Yang menangkapnya hanya pengujian alur nyata: masuk sebagai satu pengguna, keluar, masuk sebagai pengguna lain, lalu perhatikan layar pertama yang muncul.',
      ),

      h2('Menyelaraskan setelah perubahan dari luar'),
      code(
        'ts',
        `
        // Data bisa berubah karena orang lain, bukan karena aksi kita.
        useQuery({
          queryKey: ['artikel', id],
          queryFn: () => api.ambilArtikel(id),
          staleTime: 60_000,
          refetchOnWindowFocus: true,    // segarkan saat pengguna kembali
          refetchOnReconnect: true,      // dan saat koneksi pulih
        });
        `,
      ),
      p(
        'Untuk data yang benar-benar kolaboratif, polling atau SSE lebih tepat — dibahas di sub-bab 4.7.',
      ),

      h2('Konflik penulisan bersamaan'),
      code(
        'ts',
        `
        // Kirim versi yang kamu baca; server menolak kalau sudah berubah.
        const res = await fetch(\`\${API}/api/artikel/\${id}\`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'If-Match': etag },
          body: JSON.stringify(perubahan),
        });

        if (res.status === 412) {
          // Beri pilihan, jangan diam-diam menimpa atau membuang isiannya.
          return tampilkanKonflik({ perubahanmu: perubahan, dariServer: await ambilTerbaru(id) });
        }
        `,
      ),
      p(
        'Tanpa ini, editor kedua yang menyimpan akan menghapus pekerjaan editor pertama tanpa ada yang tahu — **lost update**, dan ia tidak menimbulkan error apa pun.',
      ),

      references(
        {
          label: 'Optimistic Updates',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates',
          source: 'TanStack Query',
          note: 'Pola `onMutate`/`onError`/`onSettled` yang dipakai di sub-bab ini, langsung dari dokumentasi library-nya.',
        },
        {
          label: 'Query Keys',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-keys',
          source: 'TanStack Query',
          note: 'Aturan menyusun kunci cache agar setiap input yang memengaruhi hasil ikut terwakili.',
        },
        {
          label: 'ETag',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag',
          source: 'MDN Web Docs',
          note: 'Penanda versi resource — dasar dari `If-Match` dan status `412`.',
        },
        {
          label: 'If-Match',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-Match',
          source: 'MDN Web Docs',
          note: 'Cara klien menyatakan "hanya simpan bila versinya masih yang saya baca" untuk mencegah lost update.',
        },
      ),
    ],
  ),

  written(
    'upload-frontend',
    'Upload Berkas dari Frontend',
    11,
    'Mengirim berkas dengan kemajuan, pembatalan, dan validasi dua sisi.',
    [
      terms(
        {
          term: 'FormData',
          meaning:
            'Objek browser yang menyusun pasangan nama–nilai, termasuk berkas, menjadi body `multipart/form-data`. Ia yang membuat pengiriman berkas lewat `fetch` mungkin tanpa merakit body-nya sendiri.',
        },
        {
          term: 'multipart/form-data',
          meaning:
            'Format body yang membungkus beberapa bagian sekaligus (teks dan berkas biner) dalam satu permintaan, dipisahkan oleh penanda **boundary**.',
        },
        {
          term: 'boundary',
          meaning:
            'String acak yang memisahkan tiap bagian di dalam body multipart. Browser menghasilkannya sendiri — itulah sebabnya `Content-Type` **tidak boleh** ditulis manual untuk `FormData`.',
        },
        {
          term: 'File',
          meaning:
            'Objek yang mewakili satu berkas pilihan pengguna, membawa `name`, `size`, dan `type`. Ia turunan `Blob`, jadi bisa langsung dikirim sebagai body permintaan.',
        },
        {
          term: '`berkas.type` (MIME dari klien)',
          meaning:
            'Tipe berkas menurut sistem operasi pengguna. Ia **atribut yang bisa dipalsukan**, jadi hanya berguna untuk UX — server tetap wajib memverifikasi dari isi berkasnya.',
        },
        {
          term: 'magic byte',
          meaning:
            'Beberapa byte pertama sebuah berkas yang menandai format aslinya (`\\x89PNG` untuk PNG). Itulah yang diperiksa server, karena ekstensi dan MIME dari klien tidak membuktikan apa pun.',
        },
        {
          term: 'XMLHttpRequest (XHR)',
          meaning:
            'API permintaan HTTP generasi sebelum `fetch`. Masih diperlukan untuk satu hal: `fetch` belum bisa melaporkan **kemajuan unggah**, sedangkan `xhr.upload` bisa.',
        },
        {
          term: 'AbortSignal',
          meaning:
            'Objek yang dilewatkan ke permintaan supaya bisa dibatalkan dari luar. Ia yang membuat tombol "batal" pada unggahan benar-benar menghentikan pengiriman, bukan sekadar menyembunyikan progres.',
        },
        {
          term: 'presigned URL (URL bertanda tangan)',
          meaning:
            'URL berumur pendek yang diterbitkan server dan memberi izin **satu kali** mengunggah langsung ke storage. Byte berkasnya tidak pernah melewati server aplikasi.',
        },
        {
          term: 'object URL',
          meaning:
            'URL `blob:` sementara yang dibuat `URL.createObjectURL` untuk menampilkan pratinjau berkas lokal. Ia **menahan berkas di memori** sampai dicabut dengan `revokeObjectURL`.',
        },
        {
          term: 'lengthComputable',
          meaning:
            'Penanda pada event progress bahwa total ukurannya diketahui. Bila `false`, persentase tidak bisa dihitung — tampilkan indikator tak tentu, bukan angka yang salah.',
        },
      ),

      h2('Unggah dasar'),
      code(
        'tsx',
        `
        async function unggah(berkas: File) {
          const form = new FormData();
          form.append('berkas', berkas);

          const res = await fetch(\`\${API}/api/berkas\`, {
            method: 'POST',
            credentials: 'include',
            // JANGAN setel Content-Type sendiri — browser harus
            // menambahkan boundary multipart-nya.
            body: form,
          });

          if (!res.ok) throw await KesalahanApi.dari(res);
          return (await res.json()).data;
        }
        `,
      ),
      p(
        "`FormData` adalah wadah yang menghasilkan format `multipart/form-data` — satu-satunya cara mengirim berkas biner lewat HTTP bersama field lain. Perhatikan `form.append('berkas', berkas)`: nama `'berkas'` di sana harus **cocok** dengan yang diharapkan middleware di server (`upload.single('berkas')` pada Multer). Ketidakcocokan nama muncul sebagai \"berkas tidak ditemukan\" walaupun berkasnya jelas terkirim.",
      ),
      p(
        'Komentar berhuruf besar itu menandai kesalahan yang hampir semua orang lakukan sekali. Format multipart memisahkan bagian-bagiannya dengan sebuah **boundary** — string acak yang dihasilkan browser dan harus disebut di header, seperti `multipart/form-data; boundary=----WebKitFormBoundaryX7c`. Menuliskan `Content-Type: multipart/form-data` sendiri menghapus boundary itu, dan server kehilangan cara memisahkan bagian-bagiannya. Biarkan browser yang menyetelnya.',
      ),
      callout(
        'danger',
        'Menyetel `Content-Type` untuk `FormData` akan merusak unggahan',
        'Browser perlu menambahkan `boundary=...` yang ia hasilkan sendiri. Menulis `Content-Type: multipart/form-data` menghapus boundary itu, dan server tidak bisa mengurai body-nya — biasanya muncul sebagai "berkas tidak ditemukan" yang membingungkan.',
      ),

      h2('Validasi di klien — untuk UX, bukan keamanan'),
      code(
        'ts',
        `
        const MAKS = 5 * 1024 * 1024;
        const TIPE = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

        function periksaSebelumKirim(berkas: File): string | null {
          if (berkas.size > MAKS) return 'Ukuran maksimal 5 MB';
          if (!TIPE.has(berkas.type)) return 'Tipe berkas tidak didukung';
          return null;
        }
        `,
      ),
      p(
        'Judul bagian ini sudah menyatakan batasnya, dan itu penting dipegang: pemeriksaan ini **untuk UX, bukan keamanan**. `berkas.size` dan `berkas.type` dibaca dari objek `File` di browser, dan siapa pun bisa melewati seluruh fungsi ini dengan mengirim permintaan langsung memakai `curl`. Server tetap wajib memverifikasi ukuran serta isi berkas lewat magic byte, seperti di sub-bab 2.7.',
      ),
      p(
        'Lalu apa gunanya? Menghemat waktu pengguna. Tanpa pemeriksaan ini, seseorang yang memilih video 200 MB akan menunggu unggahan berjalan beberapa menit di jaringan lambat — hanya untuk ditolak server di akhir. Perhatikan nilai `MAKS` dan `TIPE` di sini harus **sama persis** dengan yang ditegakkan server; kalau klien lebih longgar, pengguna tetap kena tolakan mengejutkan, dan kalau klien lebih ketat, ada berkas sah yang ditolak tanpa alasan.',
      ),
      callout(
        'warning',
        'Pemeriksaan ini menghemat waktu pengguna, bukan menjaga server',
        '`berkas.type` berasal dari sistem operasi dan bisa dipalsukan dengan mudah. Server tetap **wajib** memverifikasi dari isi berkas (magic byte), seperti di Bab 2.7. Validasi klien mencegah pengguna menunggu unggahan 50 MB yang akan ditolak — itu saja nilainya.',
      ),

      h2('Kemajuan dan pembatalan'),
      code(
        'ts',
        `
        // fetch belum punya progress unggah — XMLHttpRequest masih diperlukan.
        export function unggahDenganKemajuan(
          berkas: File,
          onKemajuan: (persen: number) => void,
          signal: AbortSignal,
        ): Promise<{ id: string }> {
          return new Promise((selesai, gagal) => {
            const xhr = new XMLHttpRequest();
            const form = new FormData();
            form.append('berkas', berkas);

            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) onKemajuan(Math.round((e.loaded / e.total) * 100));
            });

            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                selesai(JSON.parse(xhr.responseText).data);
              } else {
                gagal(new Error(\`Gagal: \${xhr.status}\`));
              }
            });

            xhr.addEventListener('error', () => gagal(new Error('Koneksi bermasalah')));
            xhr.addEventListener('abort', () => gagal(new DOMException('Dibatalkan', 'AbortError')));

            signal.addEventListener('abort', () => xhr.abort());

            xhr.open('POST', \`\${API}/api/berkas\`);
            xhr.withCredentials = true;
            xhr.send(form);
          });
        }
        `,
      ),
      p(
        'Komentar pertama menjelaskan kenapa kode ini terlihat kuno di tengah `fetch`: **`fetch` belum bisa melaporkan kemajuan unggah**. Ia bisa melaporkan kemajuan unduhan lewat stream, tetapi arah sebaliknya belum tersedia di browser mana pun. Selama itu belum berubah, `XMLHttpRequest` adalah satu-satunya pilihan untuk bilah progres unggahan yang jujur.',
      ),
      p(
        'Perhatikan pendengarnya dipasang pada `xhr.upload`, bukan `xhr`. Keduanya berbeda: `xhr.upload` melaporkan byte yang **dikirim**, sedangkan `xhr` sendiri melaporkan byte yang **diterima** sebagai balasan. Memasangnya di objek yang salah menghasilkan bilah progres yang melompat dari 0 ke 100 di akhir. Dan `e.lengthComputable` diperiksa lebih dulu karena total ukurannya tidak selalu diketahui — bila `false`, tampilkan indikator tak tentu, bukan persentase yang mengarang angka.',
      ),
      p(
        "Baris `signal.addEventListener('abort', () => xhr.abort())` yang menyambungkan tombol \"batal\" ke pengiriman sesungguhnya. Tanpa itu, menutup dialog hanya menyembunyikan progres sementara byte-nya tetap mengalir. Perhatikan pembatalan lalu ditolak sebagai `DOMException` bernama `AbortError` — nama yang sama persis dengan yang dihasilkan `fetch`, sehingga `tanganiKesalahan` dari sub-bab 3.4 mengenalinya sebagai `{ jenis: 'diam' }` dan tidak menampilkannya sebagai kegagalan.",
      ),
      p(
        "Dua detail terakhir mudah terlewat. `xhr.withCredentials = true` adalah padanan `credentials: 'include'` pada `fetch`, sebab tanpanya cookie sesi tidak ikut, dan unggahan ditolak `401`. Dan pemeriksaan `status >= 200 && status < 300` harus ditulis manual, karena seperti `fetch`, `XMLHttpRequest` menganggap respons `4xx` sebagai permintaan yang **berhasil sampai**, sehingga event `error` hanya menyala untuk kegagalan jaringan.",
      ),

      h2('Unggah langsung ke storage'),
      code(
        'ts',
        `
        // 1. Minta URL bertanda tangan — server memvalidasi tipe & ukuran DI SINI
        const { url, kunci } = await api.mintaUrlUnggah({
          mime: berkas.type,
          ukuran: berkas.size,
        });

        // 2. Unggah langsung ke storage (tidak lewat server aplikasi)
        await fetch(url, {
          method: 'PUT',
          body: berkas,
          headers: { 'Content-Type': berkas.type },
        });

        // 3. Beri tahu server bahwa unggahan selesai.
        //    Server memverifikasi isinya SEBELUM menandainya siap dipakai.
        await api.konfirmasiUnggahan({ kunci });
        `,
      ),
      p(
        'Pola tiga langkah ini membalik alur unggahan: **byte-nya tidak pernah melewati server aplikasimu**. Server hanya menerbitkan izin di langkah 1 dan memverifikasi hasil di langkah 3; pengiriman sesungguhnya di langkah 2 berlangsung langsung antara browser dan object storage. Untuk berkas berukuran ratusan megabita, itu bedanya antara server yang menahan koneksi berlama-lama dan server yang hanya melayani dua permintaan ringan.',
      ),
      p(
        'Komentar pada langkah 1 menandai tempat validasi yang sesungguhnya: **server memvalidasi tipe dan ukuran di sini**, sebelum menerbitkan URL. Itulah satu-satunya titik kendali yang tersisa, karena setelah URL diterbitkan, kamu tidak lagi berada di jalur pengiriman. Karena itu URL bertanda tangan harus berumur pendek dan mengunci `Content-Type` serta batas ukurannya — kalau tidak, izin yang kamu berikan untuk satu gambar 2 MB bisa dipakai mengunggah berkas apa pun sebesar apa pun.',
      ),
      p(
        'Langkah 3 adalah yang paling sering dilupakan, dan komentarnya menjelaskan kenapa ia wajib: **verifikasi terjadi setelah unggahan, bukan sebelumnya**. Server mengambil berkas dari storage, memeriksa magic byte-nya, baru menandainya siap dipakai. Tanpa langkah konfirmasi ini, berkas yang isinya tidak sesuai klaim akan duduk di storage dan tersaji ke pengguna lain — dan storage-mu juga akan penuh oleh unggahan yang tidak pernah selesai serta tidak pernah dibersihkan.',
      ),
      callout(
        'tip',
        'Untuk berkas besar, ini menghemat sumber daya server secara signifikan',
        'Byte-nya tidak pernah melewati aplikasimu — tidak ada memori yang terpakai, tidak ada koneksi yang tertahan berlama-lama. Konsekuensinya: verifikasi harus dilakukan setelah unggahan, bukan sebelumnya.',
      ),

      h2('Pratinjau dan pembersihan'),
      code(
        'tsx',
        `
        const [pratinjau, setPratinjau] = useState<string | null>(null);

        function pilih(berkas: File) {
          const url = URL.createObjectURL(berkas);
          setPratinjau(url);
        }

        useEffect(() => {
          // WAJIB — object URL menahan berkasnya di memori sampai dicabut.
          return () => { if (pratinjau !== null) URL.revokeObjectURL(pratinjau); };
        }, [pratinjau]);
        `,
      ),
      p(
        '`URL.createObjectURL` menghasilkan alamat `blob:` yang bisa langsung dipasang di `<img src>` — pratinjau muncul **tanpa** berkasnya perlu diunggah dulu. Itu yang membuat pengguna bisa memastikan ia memilih foto yang benar sebelum menunggu pengiriman.',
      ),
      p(
        'Komentar berhuruf besar menandai sisi lain dari kemudahan itu, yaitu object URL **menahan berkasnya di memori** sampai dicabut. Browser tidak bisa membuangnya sendiri karena ia tidak tahu kapan kamu berhenti memakainya. Pada halaman tempat pengguna memilih dan mengganti berkas berkali-kali, misalnya memilih foto 8 MB lalu mengganti berulang kali, memori yang tertahan menumpuk sampai tab-nya berat.',
      ),
      p(
        'Perhatikan pembersihannya dikembalikan dari `useEffect` dengan `[pratinjau]` sebagai dependensi. Fungsi kembalian itu berjalan **dua kali**: saat `pratinjau` berganti nilai (mencabut URL lama sebelum yang baru dipakai) dan saat komponennya dilepas. Menaruh `revokeObjectURL` langsung di dalam `pilih` justru akan mencabut URL yang baru saja dibuat sebelum sempat dirender.',
      ),

      h2('Keadaan UI yang harus ditangani'),
      table(
        ['Keadaan', 'Yang harus terlihat'],
        [
          ['Belum memilih', 'Area jatuh yang jelas + tombol pilih berkas'],
          ['Ditolak validasi klien', 'Alasannya, sebelum satu byte pun terkirim'],
          ['Sedang mengunggah', 'Persentase + tombol batal'],
          ['Gagal', 'Alasan + tombol coba lagi, **berkasnya tetap dipilih**'],
          ['Berhasil', 'Pratinjau + tombol hapus'],
        ],
      ),
      callout(
        'danger',
        'Jangan mereset pilihan berkas saat unggahan gagal',
        'Pengguna harus mencari berkasnya lagi dari awal — untuk kegagalan yang mungkin hanya masalah jaringan sesaat. Ini bentuk lain dari aturan "jangan pernah membuang isian pengguna saat gagal".',
      ),

      h2('Aksesibilitas'),
      code(
        'tsx',
        `
        <label htmlFor="berkas">Unggah foto</label>
        <input
          id="berkas"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => pilih(e.target.files?.[0])}
        />

        {/* Kemajuan harus diumumkan, bukan hanya terlihat */}
        <div role="progressbar" aria-valuenow={persen} aria-valuemin={0} aria-valuemax={100}>
          {persen}%
        </div>
        `,
      ),
      p(
        'Area drag-and-drop **tidak boleh** menjadi satu-satunya cara mengunggah — ia tidak bisa dioperasikan dengan keyboard. Selalu sediakan `<input type="file">` yang sungguhan di belakangnya.',
      ),

      references(
        {
          label: 'FormData',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData',
          source: 'MDN Web Docs',
          note: 'Cara menyusun body multipart dari berkas pilihan pengguna, termasuk catatan agar `Content-Type` tidak disetel manual.',
        },
        {
          label: 'File API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications',
          source: 'MDN Web Docs',
          note: 'Membaca berkas dari `<input type="file">`, membuat pratinjau, dan mencabut object URL.',
        },
        {
          label: 'XMLHttpRequest — Monitoring progress',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_XMLHttpRequest',
          source: 'MDN Web Docs',
          note: 'Satu-satunya jalur bawaan untuk melaporkan kemajuan unggahan sampai hari ini.',
        },
        {
          label: 'ARIA: progressbar role',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role',
          source: 'MDN Web Docs',
          note: 'Membuat indikator kemajuan yang juga terbaca oleh teknologi bantu.',
        },
        {
          label: 'File Upload Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Mengapa validasi sisi klien tidak pernah cukup, dan apa yang harus diperiksa server.',
        },
      ),
    ],
  ),

  written(
    'realtime-frontend',
    'Realtime di Sisi Frontend',
    11,
    'Menerima pembaruan tanpa polling, dan menjaganya tetap konsisten.',
    [
      terms(
        {
          term: 'realtime',
          meaning:
            'Pembaruan yang sampai ke pengguna **tanpa ia meminta**. Di praktiknya hampir selalu berarti satu dari tiga hal: polling berkala, aliran satu arah dari server, atau koneksi dua arah.',
        },
        {
          term: 'polling',
          meaning:
            'Klien bertanya berulang kali dengan jeda tetap. Paling sederhana dan paling tahan gangguan, tapi setiap permintaan tetap dibayar meski tidak ada yang berubah.',
        },
        {
          term: 'SSE (Server-Sent Events)',
          meaning:
            'Aliran teks **satu arah** dari server ke klien di atas HTTP biasa. Kelebihan terbesarnya: browser menyambung ulang sendiri, dan autentikasinya sama persis dengan permintaan HTTP lain.',
        },
        {
          term: 'EventSource',
          meaning:
            'API browser untuk berlangganan SSE. Batasannya penting: ia **tidak bisa mengirim header kustom**, jadi hanya cocok untuk auth berbasis cookie.',
        },
        {
          term: 'WebSocket',
          meaning:
            'Koneksi **dua arah** yang tetap terbuka, dinaikkan dari HTTP lewat proses handshake. Diperlukan saat klien juga harus mengirim terus-menerus — chat, kolaborasi, permainan.',
        },
        {
          term: 'long polling',
          meaning:
            'Variasi polling: server menahan permintaan sampai ada yang baru, lalu menjawab. Ia mengurangi permintaan kosong, tapi menahan koneksi lebih lama.',
        },
        {
          term: 'reconnect',
          meaning:
            'Menyambung ulang setelah koneksi terputus. SSE melakukannya otomatis; WebSocket harus diprogram sendiri — biasanya dengan backoff supaya tidak menyerbu server saat ia baru pulih.',
        },
        {
          term: 'celah saat terputus',
          meaning:
            'Peristiwa yang terjadi selama koneksi mati dan tidak pernah terkirim. Menyambung ulang saja tidak menutupnya — setelah tersambung, data harus **diambil ulang** lewat HTTP.',
        },
        {
          term: 'idempoten di sisi penerima',
          meaning:
            'Menangani peristiwa yang sama dua kali tanpa efek ganda. Setelah menyambung ulang, pesan yang sama bisa tiba lagi — periksa `id` sebelum menambahkannya ke daftar.',
        },
        {
          term: '`aria-live`',
          meaning:
            'Atribut yang membuat perubahan pada sebuah area **diumumkan** oleh screen reader tanpa memindahkan fokus. Wajib untuk indikator koneksi dan pesan yang muncul sendiri.',
        },
      ),

      h2('Tiga pilihan'),
      table(
        ['', 'Polling', 'SSE', 'WebSocket'],
        [
          ['Arah', 'Klien menarik', 'Server → klien', 'Dua arah'],
          ['Kerumitan', 'Paling rendah', 'Rendah', 'Tinggi'],
          ['Menyambung ulang otomatis', '—', '**Bawaan**', 'Manual'],
          ['Lewat proxy tanpa masalah', 'Ya', 'Ya', 'Sering perlu konfigurasi'],
          ['Autentikasi', 'Sama seperti HTTP', 'Sama seperti HTTP', 'Butuh penanganan sendiri'],
          [
            'Cocok untuk',
            'Data yang berubah lambat',
            'Notifikasi, kemajuan job',
            'Chat, kolaborasi',
          ],
        ],
      ),
      callout(
        'tip',
        'Mulai dari yang paling sederhana yang mencukupi',
        'Kebanyakan kebutuhan "realtime" sebenarnya adalah "server memberi tahu klien". Untuk itu SSE sudah cukup dan jauh lebih murah — ia berjalan di atas HTTP biasa, memakai autentikasi yang sama, dan menyambung ulang sendiri. WebSocket baru diperlukan kalau klien juga harus mengirim terus-menerus.',
      ),

      h2('Polling yang sopan'),
      code(
        'ts',
        `
        useQuery({
          queryKey: ['job', jobId],
          queryFn: () => api.statusJob(jobId),

          refetchInterval: (query) => {
            const status = query.state.data?.status;
            // BERHENTI saat selesai — polling selamanya adalah beban
            // yang tidak pernah diminta siapa pun.
            if (status === 'selesai' || status === 'gagal') return false;
            return 3000;
          },

          // Jangan polling saat tab tidak terlihat.
          refetchIntervalInBackground: false,
        });
        `,
      ),
      p(
        'Polling adalah cara paling sederhana memantau job dari sub-bab 1.9, dan ia sering **cukup**. Yang membuatnya tertib di sini adalah `refetchInterval` ditulis sebagai **fungsi**, bukan angka tetap. Fungsi itu membaca status terakhir dan mengembalikan `false` begitu job mencapai keadaan akhir — dan `false` berarti berhenti. Tanpa itu, polling berjalan selamanya untuk job yang sudah selesai lima menit lalu, membebani server tanpa satu pun manfaat.',
      ),
      p(
        'Perhatikan pemeriksaannya menyebut **kedua** keadaan akhir, `selesai` dan `gagal`. Melewatkan salah satunya, biasanya `gagal` karena yang diuji lebih dulu adalah jalur sukses, menghasilkan polling abadi tepat pada job yang bermasalah. Angka `3000` sendiri adalah keputusan produk, sebab terlalu cepat membebani server, terlalu lambat membuat pengguna mengira aplikasinya macet.',
      ),
      p(
        '`refetchIntervalInBackground: false` menghentikan polling saat tab tidak terlihat. Ini penting karena pengguna sering membuka tab lalu pindah mengerjakan hal lain — dan tanpa opsi ini, dua puluh tab yang terlupakan tetap menembak servermu setiap tiga detik. Begitu tab-nya dilihat kembali, TanStack Query mengambil data segar sendiri, jadi tidak ada yang hilang.',
      ),

      h2('SSE'),
      code(
        'ts',
        `
        useEffect(() => {
          const es = new EventSource(\`\${API}/api/notifikasi/stream\`, {
            withCredentials: true,
          });

          es.addEventListener('notifikasi', (e) => {
            const data = SkemaNotifikasi.safeParse(JSON.parse(e.data));
            // Payload dari server tetap masukan yang perlu divalidasi.
            if (!data.success) return;

            queryClient.setQueryData(['notifikasi'], (lama = []) => [data.data, ...lama]);
          });

          es.addEventListener('error', () => {
            // EventSource menyambung ulang sendiri; ini hanya untuk
            // menampilkan indikator koneksi.
            setTerhubung(false);
          });

          return () => es.close();
        }, [queryClient]);
        `,
      ),
      p(
        'SSE (Server-Sent Events) adalah jalur **satu arah** dari server ke klien, dan itu yang membuatnya jauh lebih sederhana daripada WebSocket untuk notifikasi. `EventSource` juga menyambung ulang sendiri saat koneksi putus — kamu tidak perlu menulis logika reconnect sama sekali, dan itulah alasan pendengar `error` di sini hanya menyetel indikator koneksi, bukan mencoba menyambung ulang.',
      ),
      p(
        'Komentar di dalam pendengar `notifikasi` menegakkan prinsip yang sama seperti di sub-bab 3.1: **payload dari server tetap masukan yang perlu divalidasi**. `e.data` datang sebagai string dan diurai `JSON.parse`, jadi bentuknya sama sekali tidak dijamin. Perhatikan `if (!data.success) return` — payload yang tidak sesuai kontrak diabaikan, bukan dimasukkan ke cache dan meledak beberapa komponen kemudian.',
      ),
      p(
        'Baris `return () => es.close()` adalah pembersihan yang tidak boleh dilewatkan. Tanpa itu, setiap kali komponennya dilepas dan dipasang lagi, misalnya berpindah halaman lalu kembali, koneksi lama tetap terbuka dan yang baru ditambahkan di atasnya. Setelah beberapa kali, satu pengguna memegang lima koneksi ke servermu, dan setiap notifikasi masuk ke cache lima kali.',
      ),
      callout(
        'warning',
        '`EventSource` tidak bisa mengirim header kustom',
        'Ia hanya bisa memakai cookie. Untuk auth berbasis bearer, kamu harus memakai `fetch` dengan `ReadableStream`, atau yang lebih sederhana, memakai cookie untuk endpoint ini. Ini salah satu alasan auth berbasis cookie sering lebih praktis.',
      ),

      h2('WebSocket'),
      code(
        'ts',
        `
        useEffect(() => {
          const socket = io(API, {
            auth: { token: accessToken },
            withCredentials: true,
            reconnectionDelayMax: 10_000,
          });

          socket.on('connect_error', (err) => {
            if (err.message === 'tidak terautentikasi') {
              // Token kedaluwarsa saat koneksi terbuka — perbarui, lalu sambung ulang.
              perbaruiTokenLaluSambungUlang(socket);
            }
          });

          socket.on('pesan-baru', (data: unknown) => {
            const hasil = SkemaPesan.safeParse(data);
            if (!hasil.success) return;

            queryClient.setQueryData(['pesan', ruangId], (lama: Pesan[] = []) => {
              // Cegah duplikat — pesan yang sama bisa tiba dua kali
              // setelah menyambung ulang.
              if (lama.some((p) => p.id === hasil.data.id)) return lama;
              return [...lama, hasil.data];
            });
          });

          return () => { socket.disconnect(); };
        }, [ruangId, queryClient]);
        `,
      ),
      p(
        'Token dikirim lewat `auth: { token }` — bukan header, karena WebSocket dari browser tidak menyediakan cara memasang header sembarang. Ini sisi klien dari `socket.handshake.auth` yang dibaca `io.use` di sub-bab 2.11. Perhatikan `connect_error` menangani keadaan yang sangat khas WebSocket: koneksi bisa terbuka berjam-jam, jadi token yang sah saat handshake bisa **kedaluwarsa di tengah jalan** dan menyebabkan penyambungan ulang ditolak.',
      ),
      p(
        'Blok pencegah duplikat di dalam `setQueryData` menutup masalah yang lahir dari penyambungan ulang otomatis. Setelah koneksi pulih, server bisa saja mengirim ulang peristiwa yang sudah pernah kamu terima — dan tanpa `lama.some((p) => p.id === ...)`, pesan yang sama muncul dua kali di layar. Perhatikan pemeriksaannya memakai `id`, bukan membandingkan isi: dua pesan dengan teks sama dari orang berbeda adalah hal wajar.',
      ),
      p(
        'Perhatikan pula `SkemaPesan.safeParse` dipakai lagi di sini, sama seperti pada SSE. Dan `[ruangId, queryClient]` sebagai dependensi memastikan koneksi lama ditutup lalu diganti saat pengguna berpindah ruang — tanpa `ruangId` di sana, ia akan tetap mendengarkan ruang lama sementara layarnya sudah menampilkan ruang baru.',
      ),
      callout(
        'danger',
        'Setelah menyambung ulang, kamu bisa kehilangan pesan',
        'Koneksi terputus tiga puluh detik berarti tiga puluh detik peristiwa yang tidak diterima. Menyambung ulang saja tidak cukup — setelah tersambung, **ambil ulang** data lewat HTTP untuk menutup celahnya. Klien realtime yang tidak melakukan ini akan menampilkan data yang diam-diam tidak lengkap.',
      ),
      code(
        'ts',
        `
        socket.on('connect', () => {
          // Tutup celah selama terputus
          queryClient.invalidateQueries({ queryKey: ['pesan', ruangId] });
        });
        `,
      ),
      p(
        'Tiga baris ini menutup celah yang paling mudah luput dari perhatian. Peristiwa `connect` menyala **setiap kali** tersambung — termasuk penyambungan ulang setelah koneksi sempat putus. Dan selama putus, peristiwa yang dipancarkan server tidak sampai ke mana-mana: koneksi tiga puluh detik yang terputus berarti tiga puluh detik pesan yang hilang.',
      ),
      p(
        'Menyambung ulang saja **tidak** memperbaikinya, sebab pesan yang terlewat tidak dikirim ulang. Yang menutup celahnya adalah `invalidateQueries`, yang memaksa pengambilan ulang lewat HTTP biasa, sebab source of truth-nya tetap database dan bukan aliran peristiwa. Perhatikan polanya, realtime dipakai untuk **kecepatan**, HTTP tetap dipakai untuk **kelengkapan**. Klien realtime yang hanya mengandalkan aliran peristiwa akan menampilkan data yang diam-diam tidak lengkap, dan tidak ada satu pun error yang memberi tahu.',
      ),

      h2('Indikator koneksi'),
      code(
        'tsx',
        `
        {!terhubung && (
          <div role="status" aria-live="polite">
            Koneksi terputus. Mencoba menyambung ulang…
          </div>
        )}
        `,
      ),
      p(
        'Pengguna harus tahu bahwa yang ia lihat mungkin tidak terbaru. Antarmuka realtime yang diam saat koneksinya putus lebih menyesatkan daripada yang tidak realtime sama sekali.',
      ),

      h2('Jangan lupa membersihkan'),
      ul(
        'Tutup koneksi saat komponen dilepas — koneksi menumpuk kalau tidak.',
        'Hentikan polling saat tab tidak terlihat.',
        'Batasi laju pembaruan UI — seribu pesan per detik tidak perlu seribu render.',
        'Batasi jumlah item yang disimpan di memori pada aliran yang panjang.',
      ),

      references(
        {
          label: 'Using server-sent events',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events',
          source: 'MDN Web Docs',
          note: 'Termasuk perilaku menyambung ulang otomatis dan batasan `EventSource` soal header.',
        },
        {
          label: 'The WebSocket API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API',
          source: 'MDN Web Docs',
          note: 'Siklus hidup koneksi dua arah, dari handshake sampai penutupan.',
        },
        {
          label: 'Client API — Socket.IO',
          href: 'https://socket.io/docs/v4/client-api/',
          source: 'Socket.IO',
          note: 'Opsi `auth`, `reconnection`, dan event `connect_error` yang dipakai contoh di sub-bab ini.',
        },
        {
          label: 'ARIA live regions',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions',
          source: 'MDN Web Docs',
          note: 'Cara mengumumkan pembaruan yang datang sendiri tanpa mengganggu fokus pengguna.',
        },
      ),
    ],
  ),

  written(
    'praktik-sambungkan',
    'Praktik: Sambungkan Next.js ke API Express dan Laravel',
    14,
    'Menyatukan kedua sisi kurikulum menjadi satu aplikasi berjalan.',
    [
      p(
        'Latihan penutup bab: hubungkan frontend Next.js ke **dua** backend yang sudah kamu bangun. Menyambungkan ke dua API dengan kontrak yang sama membuktikan bahwa yang kamu tulis di klien bergantung pada kontrak, bukan pada implementasinya.',
      ),

      terms(
        {
          term: 'kontrak identik',
          meaning:
            'Dua backend berbeda yang menjawab dengan **bentuk yang sama persis**: pembungkus, penamaan field, bentuk error, dan kode status. Bila frontend bisa berpindah di antara keduanya tanpa perubahan, kontraknya terbukti nyata.',
        },
        {
          term: 'klien API terpusat',
          meaning:
            'Satu modul yang memegang base URL, kredensial, refresh token, timeout, dan penerjemahan error. Komponen yang memanggil `fetch` sendiri pasti menangani error dengan cara yang berbeda — dan perbedaan itu yang bocor ke pengguna.',
        },
        {
          term: '`NEXT_PUBLIC_`',
          meaning:
            'Awalan Next.js yang menandai variabel environment **boleh terlihat di browser**. Konsekuensinya keras: apa pun di belakang awalan ini bukan rahasia, jadi jangan pernah menaruh kunci API di sana.',
        },
        {
          term: 'ISR (Incremental Static Regeneration)',
          meaning:
            'Halaman dibangun sekali lalu diperbarui di latar belakang setiap `revalidate` detik. Ia memberi kecepatan halaman statis dengan data yang tetap cukup segar.',
        },
        {
          term: '`revalidate`',
          meaning:
            'Angka detik yang menentukan seberapa sering halaman statis dibangun ulang. Nilainya keputusan produk: seberapa basi isi halaman ini masih boleh dilihat pengunjung.',
        },
        {
          term: '`generateMetadata`',
          meaning:
            'Fungsi Next.js yang menghasilkan `<title>` dan meta tag dari data yang diambil server. Ia yang membuat pratinjau tautan dan hasil pencarian benar untuk halaman dinamis.',
        },
        {
          term: '`notFound()`',
          meaning:
            'Fungsi Next.js yang menghentikan render dan menampilkan halaman 404 dengan status HTTP yang benar — bukan halaman kosong berstatus `200`.',
        },
        {
          term: 'satu-refresh-bersama',
          meaning:
            'Pola yang memastikan sepuluh permintaan yang serentak menerima `401` hanya memicu **satu** panggilan refresh, bukan sepuluh. Tanpa itu, kedaluwarsanya token berubah jadi badai permintaan.',
        },
        {
          term: '`AbortSignal.timeout`',
          meaning:
            'Sinyal bawaan yang membatalkan permintaan setelah durasi tertentu. Permintaan tanpa timeout bisa menggantung selamanya dan menahan antarmuka di keadaan memuat.',
        },
        {
          term: 'validasi respons di pengembangan saja',
          meaning:
            'Memeriksa bentuk respons dengan skema hanya saat `NODE_ENV !== "production"`. Ia menangkap ketidakcocokan kontrak lebih awal tanpa membayar biaya penguraian ganda di produksi.',
        },
        {
          term: '`curl`',
          meaning:
            'Perkakas baris perintah untuk memanggil HTTP tanpa browser. Cara tercepat membuktikan bahwa dua backend benar-benar menjawab dengan bentuk yang sama.',
        },
      ),

      h2('Yang dibangun'),
      code(
        'text',
        `
        Frontend (Next.js 16)
          /                     daftar artikel publik — Server Component
          /artikel/[slug]       detail — Server Component + ISR
          /masuk                form login
          /saya/artikel         milik saya — butuh auth
          /saya/artikel/baru    form buat
          /saya/artikel/[id]    form ubah

        Backend: dua-duanya, dengan kontrak identik
          API_URL=http://localhost:3000   (Express)
          API_URL=http://localhost:8000   (Laravel)
        `,
      ),
      p(
        'Dua backend dengan **kontrak identik** adalah inti latihan ini, dan ia bukan sekadar variasi. Selama hanya ada satu backend, mustahil membedakan mana bagian frontend yang benar-benar bergantung pada kontrak dan mana yang diam-diam bergantung pada detail implementasi Express atau Laravel. Menukar `API_URL` menjadikan perbedaan itu **bisa diamati**: apa pun yang rusak setelah pertukaran adalah tempat kontraknya bocor.',
      ),
      p(
        "Perhatikan yang berbeda hanyalah satu variabel environment. Kalau kamu sampai perlu mengubah kode frontend, entah lewat cabang `if (backend === 'laravel')`, penyesuaian nama field, atau penanganan error yang berbeda, itu bukan solusi melainkan **temuan**. Artinya kedua backend belum benar-benar menyepakati kontrak yang sama, dan yang perlu diperbaiki adalah backend-nya.",
      ),

      h2('Langkah pengerjaan'),
      steps(
        {
          title: '1. Samakan kontraknya lebih dulu',
          body: 'Sebelum menulis satu baris frontend, pastikan kedua backend menjawab dengan bentuk yang sama: pembungkus `{ data, meta }`, bentuk error yang sama, dan penamaan field yang sama. Uji dengan `curl` ke keduanya dan bandingkan keluarannya.',
        },
        {
          title: '2. Hasilkan tipe dari OpenAPI',
          body: 'Terbitkan spesifikasi dari salah satu backend, hasilkan tipe TypeScript, dan pakai untuk keduanya. Kalau tipenya cocok untuk keduanya, kontraknya memang sama.',
        },
        {
          title: '3. Satu klien API',
          body: 'Satu modul yang menangani base URL, kredensial, refresh token, dan penerjemahan error. Komponen tidak boleh memanggil `fetch` langsung — kalau ada yang melakukannya, penanganan errornya pasti berbeda.',
        },
        {
          title: '4. Data publik lewat Server Component',
          body: 'Daftar dan detail artikel diambil di server. Tidak ada `useEffect`, tidak ada state loading, tidak ada race condition — dan tidak ada token yang perlu ada di browser untuk itu.',
        },
        {
          title: '5. Autentikasi',
          body: 'Pilih cookie atau bearer berdasarkan aturan di sub-bab 4.3, dan tulis alasannya. Kalau memakai bearer, terapkan pola satu-refresh-bersama untuk mencegah badai refresh.',
        },
        {
          title: '6. Mutasi dengan penanganan error lengkap',
          body: 'Form buat/ubah menampilkan error per field dari `422`, mengarahkan ke login pada `401`, dan **tidak pernah** membuang isian pengguna saat gagal.',
        },
        {
          title: '7. Buktikan dengan bertukar backend',
          body: 'Ganti `API_URL` dari Express ke Laravel tanpa mengubah satu baris pun kode frontend. Kalau ada yang rusak, di situlah kontraknya berbeda.',
        },
      ),

      h2('Klien API'),
      code(
        'ts',
        `
        // src/lib/api.ts
        const API = process.env.NEXT_PUBLIC_API_URL!;

        let accessToken: string | null = null;
        let refreshBerjalan: Promise<string | null> | null = null;

        export async function apiFetch<T>(
          jalur: string,
          opsi: RequestInit & { skema?: z.ZodType<T> } = {},
        ): Promise<T> {
          const { skema, ...sisa } = opsi;

          const jalankan = () => fetch(\`\${API}\${jalur}\`, {
            ...sisa,
            credentials: 'include',
            signal: sisa.signal ?? AbortSignal.timeout(15_000),
            headers: {
              Accept: 'application/json',
              ...sisa.headers,
              ...(accessToken !== null && { Authorization: \`Bearer \${accessToken}\` }),
            },
          });

          let res = await jalankan();

          if (res.status === 401 && !jalur.includes('/auth/')) {
            const baru = await perbaruiSekali();
            if (baru === null) throw new KesalahanApi(401, 'TIDAK_TERAUTENTIKASI', 'Sesi berakhir');
            accessToken = baru;
            res = await jalankan();
          }

          if (!res.ok) throw await KesalahanApi.dari(res);
          if (res.status === 204) return undefined as T;

          const isi = await res.json();

          // Validasi bentuk hanya di pengembangan — di produksi ia biaya
          // tanpa manfaat, karena kontraknya sudah diuji di CI.
          if (skema !== undefined && process.env.NODE_ENV !== 'production') {
            const hasil = skema.safeParse(isi);
            if (!hasil.success) {
              console.error('Respons tidak sesuai kontrak', jalur, hasil.error.issues);
            }
          }

          return isi as T;
        }
        `,
      ),
      p(
        'Fungsi ini adalah **satu-satunya** tempat di aplikasi yang memanggil `fetch`, dan itu yang membuat setiap aturan di sub-bab ini berlaku otomatis di mana-mana: kredensial, timeout, refresh token, dan penerjemahan error. Komponen yang memanggil `fetch` langsung akan melewatkan semuanya — dan kelalaian itu tidak menghasilkan error, hanya penanganan yang diam-diam berbeda.',
      ),
      p(
        "Syarat `!jalur.includes('/auth/')` pada penanganan `401` mencegah perulangan tak berujung. Tanpa itu, endpoint refresh yang sendirinya menjawab `401` akan memicu refresh lagi, yang menjawab `401` lagi — sampai tumpukan pemanggilannya habis. Perhatikan pula `signal: sisa.signal ?? AbortSignal.timeout(15_000)`: pemanggil boleh memberi sinyal sendiri untuk pembatalan manual, tetapi kalau tidak, ada timeout bawaan yang mencegah permintaan menggantung selamanya.",
      ),
      p(
        'Baris `if (res.status === 204) return undefined as T` menangani kasus yang sering terlewat: respons `204` **tidak punya body**, jadi memanggil `res.json()` padanya akan melempar. Ini konsekuensi langsung dari keputusan status code di sub-bab 1.2, dan tanpa penanganan ini setiap `DELETE` yang berhasil justru berakhir sebagai error di klien.',
      ),
      p(
        'Blok validasi terakhir memakai kompromi yang layak dipahami. Memvalidasi setiap respons di produksi berarti membayar penguraian ganda pada setiap permintaan; melewatkannya sama sekali berarti ketidakcocokan kontrak baru ketahuan sebagai `undefined` di tangan pengguna. Menjalankannya **hanya di pengembangan** menangkap masalahnya saat kamu masih menulis kodenya. Perhatikan ia `console.error` dan bukan melempar — di lingkungan pengembangan, memutus alur kerja karena satu field opsional yang berubah lebih mengganggu daripada menolong.',
      ),

      h2('Server Component untuk data publik'),
      code(
        'tsx',
        `
        // app/artikel/[slug]/page.tsx
        export const revalidate = 60;

        export async function generateMetadata({ params }: Props): Promise<Metadata> {
          const { slug } = await params;
          const artikel = await ambilArtikelPublik(slug);

          if (artikel === null) return { title: 'Tidak ditemukan' };
          return { title: artikel.judul, description: artikel.ringkasan };
        }

        export default async function Halaman({ params }: Props) {
          const { slug } = await params;
          const artikel = await ambilArtikelPublik(slug);

          if (artikel === null) notFound();

          return (
            <article>
              <h1>{artikel.judul}</h1>
              <p>{artikel.isi}</p>
              {/* Hanya bagian interaktif yang jadi Client Component */}
              <TombolSuka artikelId={artikel.id} awal={artikel.jumlahSuka} />
            </article>
          );
        }
        `,
      ),
      p(
        'Untuk data publik, Server Component menghapus seluruh keruwetan sekaligus: tidak ada `useEffect`, tidak ada state loading, tidak ada race condition, dan **tidak ada token yang perlu ada di browser**. Pengambilan datanya terjadi di server Next.js, dan yang sampai ke browser hanyalah HTML yang sudah jadi.',
      ),
      p(
        'Perhatikan `ambilArtikelPublik(slug)` dipanggil **dua kali**, yaitu di `generateMetadata` dan di komponennya. Itu tidak menghasilkan dua permintaan, sebab Next.js menyatukan pemanggilan `fetch` yang identik dalam satu render. Karena itu pola ini aman, dan ia yang membuat judul halaman serta deskripsi meta bisa berasal dari data sungguhan, dan itu penting untuk berbagi tautan serta mesin pencari, sesuatu yang tidak bisa dilakukan pengambilan data di sisi klien.',
      ),
      p(
        '`export const revalidate = 60` menyatakan halamannya boleh disajikan dari cache selama enam puluh detik, sebagai padanan `Cache-Control: max-age=60` di lapisan Next.js. Dan komentar pada `TombolSuka` menandai pola yang menjaga bundle tetap kecil, yaitu **hanya bagian yang benar-benar interaktif** yang menjadi Client Component alih-alih seluruh halaman. Perhatikan yang dioper ke sana hanya `artikel.id` dan `artikel.jumlahSuka`, yaitu dua field saja alih-alih objek artikel utuh, sesuai peringatan berikutnya.',
      ),
      callout(
        'danger',
        'Jangan pernah mengoper objek API mentah ke Client Component',
        'Props dari Server Component ke Client Component dikirim ke browser lewat payload RSC — terlihat meski tidak dirender. Kalau responsnya memuat field internal, semuanya ikut. Pilih field yang benar-benar dibutuhkan komponen itu.',
      ),

      h2('Uji yang harus lulus di kedua backend'),
      code(
        'bash',
        `
        # 1. Bentuk respons identik
        curl -s localhost:3000/api/artikel | jq 'keys'
        curl -s localhost:8000/api/artikel | jq 'keys'      # harus sama

        # 2. Bentuk error identik
        curl -s -X POST localhost:3000/api/artikel -H 'Content-Type: application/json' -d '{}'
        curl -s -X POST localhost:8000/api/artikel -H 'Content-Type: application/json' -d '{}'

        # 3. Status code identik untuk kasus yang sama
        for u in localhost:3000 localhost:8000; do
          curl -s -o /dev/null -w "$u tanpa token -> %{http_code}\\n" $u/api/saya/artikel
        done

        # 4. CORS: origin yang tidak diizinkan ditolak di keduanya
        for u in localhost:3000 localhost:8000; do
          curl -sI -H "Origin: https://jahat.com" $u/api/artikel | grep -i "allow-origin" \\
            && echo "$u MEMANTULKAN origin" || echo "$u menolak (benar)"
        done
        `,
      ),
      p(
        "Keempat uji ini menjalankan perintah yang **sama persis** terhadap kedua backend lalu membandingkan hasilnya — dan itulah yang membuat perbedaan kontrak terlihat sebelum frontend menyentuhnya. `jq 'keys'` pada uji 1 mencetak daftar kunci tingkat teratas saja; kalau salah satu membungkus dengan `data` dan yang lain tidak, perbedaannya langsung terbaca tanpa perlu menelusuri respons panjang.",
      ),
      p(
        'Uji 2 dan 3 menyentuh bagian yang paling sering menyimpang antar backend, justru karena keduanya jalur **gagal**. Framework punya penanganan bawaan masing-masing untuk body kosong dan permintaan tanpa token, jadi tanpa penyeragaman sadar, Express menjawab `422` sementara Laravel menjawab `302` yang mengarahkan ke halaman login — dan frontend yang mengharapkan JSON akan tersandung.',
      ),
      p(
        'Uji 4 adalah yang paling penting sekaligus paling mudah terlewat, dan perhatikan ia **berhasil bila `grep` tidak menemukan apa-apa**. Keluaran "menolak (benar)" berarti tidak ada header `Access-Control-Allow-Origin` sama sekali untuk origin asing. Kalau yang muncul "MEMANTULKAN origin", berarti backend itu memantulkan origin apa pun kembali — kesalahan CORS nomor satu yang sudah dibahas di sub-bab 4.2, dan satu-satunya cara memastikannya adalah mencobanya.',
      ),

      h2('Kriteria selesai'),
      p(
        'Bertukar `API_URL` antara Express dan Laravel tidak memerlukan perubahan kode frontend apa pun. Kalau ada yang rusak, itu bukan bug frontend — itu perbedaan kontrak yang harus diselesaikan di backend.',
      ),

      divider,

      checklist(
        'bi4-praktik',
        'Checklist praktik bab ini',
        'Tipe frontend dihasilkan dari kontrak backend, bukan ditulis ulang',
        'CI gagal kalau berkas tipe hasil generate berbeda dari yang di repo',
        'Semua permintaan lewat satu klien API — tidak ada `fetch` telanjang di komponen',
        'Setiap permintaan punya timeout dan bisa dibatalkan',
        'Pembatalan permintaan tidak ditampilkan sebagai error',
        'Error `422` ditampilkan per field dengan `aria-invalid` dan `aria-describedby`',
        'Isian pengguna tidak pernah hilang saat penyimpanan gagal',
        'Retry hanya untuk status yang memang sementara — tidak pernah untuk `4xx`',
        'Refresh token memakai pola satu-panggilan-bersama',
        'Cache dibersihkan sepenuhnya saat pengguna keluar',
        'Kunci cache memuat setiap nilai yang memengaruhi hasilnya',
        'CORS memakai allow-list persis, dan origin asing benar-benar ditolak',
        'Validasi unggahan ada di klien (UX) **dan** di server (keamanan)',
        'Klien realtime mengambil ulang data setelah menyambung ulang',
        'Data publik diambil di Server Component, bukan lewat `useEffect`',
        'Tidak ada objek API mentah yang dioper ke Client Component',
        'Bertukar `API_URL` antar backend tidak memerlukan perubahan kode frontend',
      ),

      references(
        {
          label: 'Server Components',
          href: 'https://react.dev/reference/rsc/server-components',
          source: 'React',
          note: 'Batas antara komponen server dan klien — termasuk kenapa props yang dioper ikut terkirim ke browser.',
        },
        {
          label: 'Data Fetching, Caching, and Revalidating',
          href: 'https://nextjs.org/docs/app/getting-started/fetching-data',
          source: 'Next.js',
          note: 'Mengambil data di Server Component, beserta perilaku cache dan `revalidate`.',
        },
        {
          label: 'generateMetadata',
          href: 'https://nextjs.org/docs/app/api-reference/functions/generate-metadata',
          source: 'Next.js',
          note: 'Menyusun judul dan meta tag dari data yang diambil server.',
        },
        {
          label: 'Environment Variables',
          href: 'https://nextjs.org/docs/app/guides/environment-variables',
          source: 'Next.js',
          note: 'Aturan `NEXT_PUBLIC_` dan batas tegas antara konfigurasi publik dan rahasia server.',
        },
        {
          label: 'AbortSignal: timeout() static method',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static',
          source: 'MDN Web Docs',
          note: 'Membatasi umur setiap permintaan tanpa merakit timer sendiri.',
        },
      ),
    ],
  ),
];
