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
      callout(
        'info',
        'Permintaannya sering tetap sampai ke server',
        'Untuk permintaan sederhana (`GET` tanpa header khusus), browser **mengirimkannya** lalu memblokir **pembacaan hasilnya**. Artinya efek sampingnya bisa sudah terjadi. Ini salah satu alasan `GET` tidak boleh mengubah apa pun.',
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
      callout(
        'tip',
        'Ini menyelesaikan CORS dan sebagian masalah cookie sekaligus',
        'Kalau browser hanya pernah bicara dengan satu origin, tidak ada preflight, tidak ada `SameSite=None`, dan tidak ada masalah cookie lintas domain. Harganya: satu lompatan jaringan tambahan, dan Next.js kini berada di jalur permintaan API.',
      ),

      h2('Verifikasi'),
      code(
        'bash',
        `
        # Preflight
        curl -i -X OPTIONS https://api.contoh.com/api/artikel \\
          -H "Origin: https://app.contoh.com" \\
          -H "Access-Control-Request-Method: POST" \\
          -H "Access-Control-Request-Headers: content-type,authorization"

        # Origin yang TIDAK diizinkan harus ditolak, bukan dipantulkan
        curl -sI https://api.contoh.com/api/artikel -H "Origin: https://jahat.com" \\
          | grep -i "access-control-allow-origin"
        `,
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
          body: 'Sanctum melakukannya: cookie untuk SPA, token untuk klien lain. Yang penting: **jangan campur** dalam satu jalur permintaan — pilih satu berdasarkan jenis kliennya.',
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
      callout(
        'tip',
        'Ini keputusan API yang langsung terasa di UX',
        'Nilai yang dihasilkan server — slug, nomor urut, timestamp, total yang dihitung ulang — tidak bisa ditebak klien. Mengembalikannya menghapus satu perjalanan jaringan **dan** menghilangkan keadaan sementara yang salah.',
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
      callout(
        'danger',
        'Kunci cache juga harus memisahkan pengguna',
        'Setelah pengguna berganti akun, cache milik akun sebelumnya masih ada di memori. Tanpa identitas di kunci — atau tanpa `queryClient.clear()` saat keluar — pengguna baru bisa melihat data pengguna sebelumnya. Ini kebocoran yang terjadi sepenuhnya di sisi klien.',
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
    ],
  ),

  written(
    'upload-frontend',
    'Upload Berkas dari Frontend',
    11,
    'Mengirim berkas dengan kemajuan, pembatalan, dan validasi dua sisi.',
    [
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
    ],
  ),

  written(
    'realtime-frontend',
    'Realtime di Sisi Frontend',
    11,
    'Menerima pembaruan tanpa polling, dan menjaganya tetap konsisten.',
    [
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
      callout(
        'warning',
        '`EventSource` tidak bisa mengirim header kustom',
        'Ia hanya bisa memakai cookie. Untuk auth berbasis bearer, kamu harus memakai `fetch` dengan `ReadableStream`, atau — lebih sederhana — memakai cookie untuk endpoint ini. Ini salah satu alasan auth berbasis cookie sering lebih praktis.',
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
    ],
  ),
];
