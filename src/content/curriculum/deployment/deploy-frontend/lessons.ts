import { callout, code, h2, ol, p, steps, table, ul } from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Deployment — Chapter 3, all six lessons.
 *
 * Next.js 16 to production. Provider-specific steps are marked as such, and the underlying
 * mechanics are always explained first — a reader who only learns one provider's dashboard cannot
 * move, and cannot diagnose anything the dashboard does not show.
 */
export const lessons: LessonDraft[] = [
  written(
    'build-produksi',
    'Build Produksi & Analisis Bundle',
    11,
    'Membaca keluaran build, bukan sekadar menunggunya selesai.',
    [
      code(
        'bash',
        `
        npm run build
        npm run start        # jalankan versi produksi secara LOKAL dulu
        `,
      ),
      callout(
        'danger',
        '`npm run dev` bukan bukti apa pun',
        'Mode development memakai konfigurasi, penanganan error, dan optimasi yang berbeda. Bug yang hanya muncul di produksi adalah kategori tersendiri: hydration mismatch, variabel environment yang hilang, dan perbedaan huruf besar-kecil pada nama berkas. Selalu jalankan `npm run start` sekali sebelum deploy.',
      ),

      h2('Membaca keluarannya'),
      code(
        'text',
        `
        Route (app)                          Size  First Load JS
        ┌ ○ /                              1.2 kB         105 kB
        ├ ● /kelas/[category]/[chapter]     2.8 kB         112 kB
        ├ ƒ /api/artikel                      0 B            0 B
        └ ○ /pengaturan                     3.1 kB         108 kB

        + First Load JS shared by all                      98 kB

        ○  (Static)   prerendered as static content
        ●  (SSG)      prerendered using generateStaticParams
        ƒ  (Dynamic)  server-rendered on demand
        `,
      ),
      ol(
        '**Rute yang seharusnya statis tapi bertanda `ƒ`** — ada yang memaksanya dinamis, biasanya `cookies()` atau `headers()` di layout yang jauh di atasnya.',
        '**First Load JS yang melonjak di satu rute** — hampir selalu satu impor yang menarik sesuatu besar.',
        '**Jumlah rute yang dihasilkan** — kalau `generateStaticParams` salah, angkanya jauh dari harapan.',
        '**Shared JS yang membesar** — sesuatu masuk ke bundle bersama padahal hanya dipakai satu halaman.',
      ),
      callout(
        'tip',
        'Website yang sedang kamu baca memakai keluaran ini sebagai alat audit',
        'Setiap penambahan materi diikuti pemeriksaan: apakah 377 rute masih semuanya `○`/`●`, dan apakah ukuran chunk berubah. Materi bertambah dari 122 ke 292 sub-bab tanpa satu byte pun masuk ke bundle pembaca — itu terlihat dari sini.',
      ),

      h2('Menemukan yang membengkak'),
      code(
        'bash',
        `
        npm install --save-dev @next/bundle-analyzer
        ANALYZE=true npm run build
        `,
      ),
      code(
        'ts',
        `
        // next.config.ts
        import withBundleAnalyzer from '@next/bundle-analyzer';

        export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })({
          reactStrictMode: true,
          poweredByHeader: false,
        });
        `,
      ),

      h2('Penyebab bundle membengkak'),
      table(
        ['Penyebab', 'Perbaikan'],
        [
          ['Library berat di Client Component', 'Pindahkan ke Server Component'],
          ['Impor barrel (`index.ts`) yang luas', 'Impor langsung dari modulnya'],
          ['Data besar diimpor komponen klien', 'Bangun proyeksi di server, oper sebagai prop'],
          ['Widget berat selalu dimuat', '`next/dynamic` dengan `ssr: false`'],
          ['Moment.js, lodash penuh', '`date-fns`, fungsi native, impor per fungsi'],
          ['Ikon diimpor seluruh paketnya', 'Impor ikon satu per satu'],
        ],
      ),
      code(
        'ts',
        `
        // Menarik seluruh paket
        import { debounce } from 'lodash';

        // Hanya yang dipakai
        import debounce from 'lodash/debounce';

        // Atau tulis sendiri — sering hanya lima baris
        `,
      ),
      callout(
        'danger',
        'Kebocoran bundle tidak menimbulkan gejala apa pun',
        'Tidak ada error, tidak ada peringatan, halamannya berfungsi normal — hanya makin mahal untuk pembaca, dan tumbuh setiap kali data bertambah. Website ini pernah mengalaminya: satu komponen klien mengimpor kurikulum, dan seluruh prosa setiap sub-bab ikut ke browser. Perbaikannya dikunci **tes**, bukan disiplin.',
      ),

      h2('Lazy-load yang berbayar'),
      code(
        'tsx',
        `
        import dynamic from 'next/dynamic';

        // Editor kode ratusan KB, tidak semua pembaca membukanya
        const Playground = dynamic(() => import('@/components/playground'), {
          loading: () => <SkeletonPlayground />,
          ssr: false,
        });
        `,
      ),
      table(
        ['Layak', 'Tidak layak'],
        [
          ['Editor, grafik, peta, 3D', 'Tombol, kartu, komponen kecil'],
          ['Isi modal yang jarang dibuka', 'Apa pun di layar pertama'],
          ['Library > 50 KB', 'Library kecil — biaya muatnya lebih besar'],
        ],
      ),

      h2('Sebelum deploy'),
      code(
        'bash',
        `
        npm run build
        npm run start

        # Periksa header di server yang BENAR-BENAR berjalan
        curl -sI http://localhost:3000 | grep -iE "content-security-policy|x-powered-by"

        # Pastikan tidak ada rahasia di artefak
        grep -rE "sk_live|AKIA|-----BEGIN" .next/static/ && echo "RAHASIA DI BUNDLE"
        `,
      ),
    ],
  ),

  written(
    'deploy-vercel',
    'Deploy ke Vercel',
    10,
    'Jalur termudah untuk Next.js, beserta yang perlu kamu ketahui.',
    [
      p(
        'Vercel dibuat oleh tim yang sama dengan Next.js, jadi fitur baru selalu didukung lebih dulu di sana. Untuk sebagian besar project Next.js ia pilihan yang paling sedikit gesekan — dengan catatan yang perlu disadari sejak awal.',
      ),

      h2('Langkahnya'),
      steps(
        {
          title: '1. Hubungkan repositori',
          body: 'Vercel mendeteksi Next.js otomatis. Perintah build dan direktori keluaran tidak perlu diatur.',
        },
        {
          title: '2. Isi environment variable',
          body: 'Per lingkungan: Production, Preview, Development. Nilai yang berbeda per lingkungan — terutama URL API dan kredensial.',
        },
        {
          title: '3. Deploy pertama',
          body: 'Setiap push ke branch utama men-deploy ke produksi; setiap PR mendapat preview deployment sendiri.',
        },
        {
          title: '4. Pasang domain',
          body: 'Tambahkan domain, arahkan DNS, sertifikat HTTPS diurus otomatis.',
        },
      ),

      h2('Preview deployment'),
      code(
        'text',
        `
        main            -> https://app.contoh.com
        PR #42          -> https://app-git-fitur-ekspor-tim.vercel.app
        commit a1b2c3d  -> https://app-a1b2c3d-tim.vercel.app
        `,
      ),
      callout(
        'danger',
        'Preview deployment bisa terjangkau publik',
        'URL-nya sulit ditebak, tapi "sulit ditebak" bukan kontrol akses — ia muncul di komentar PR, di log, dan di header `Referer`. Kalau preview memakai data sungguhan, nyalakan **Deployment Protection**. Lebih baik lagi: preview memakai database terpisah dengan data yang disamarkan.',
      ),

      h2('Environment variable'),
      code(
        'bash',
        `
        vercel env add DATABASE_URL production
        vercel env add NEXT_PUBLIC_API_URL production
        vercel env pull .env.local        # tarik ke lokal untuk pengembangan
        `,
      ),
      callout(
        'warning',
        'Mengubah `NEXT_PUBLIC_*` menuntut build ulang',
        'Nilainya ditanam ke bundle saat build. Mengubahnya di dasbor **tidak** mengubah aplikasi yang sudah berjalan — kamu harus men-deploy ulang. Ini konsekuensi langsung dari perbedaan build-time dan runtime di sub-bab 1.2.',
      ),

      h2('Yang perlu disadari'),
      table(
        ['Hal', 'Catatan'],
        [
          ['Batas waktu fungsi', '10 detik di paket gratis, bisa dinaikkan berbayar'],
          ['Sistem berkas', '**Read-only** kecuali `/tmp` — tidak ada penyimpanan permanen'],
          ['Cold start', 'Permintaan pertama setelah idle lebih lambat'],
          ['Koneksi database', 'Serverless membuka banyak koneksi — perlu connection pooler'],
          ['Pekerjaan latar', 'Tidak ada proses yang hidup terus — pakai layanan antrean terpisah'],
          ['Harga', 'Berdasarkan pemakaian; trafik tinggi bisa mahal'],
        ],
      ),
      callout(
        'danger',
        'Koneksi database adalah jebakan serverless yang paling sering',
        'Setiap instance fungsi membuka koneksinya sendiri. Pada trafik tinggi, ratusan instance berarti ratusan koneksi — dan Postgres kehabisan slot, lalu **seluruh** aplikasi gagal, termasuk yang tidak ada hubungannya. Pakai connection pooler seperti PgBouncer, Supabase Pooler, atau Prisma Accelerate.',
      ),
      code(
        'bash',
        `
        # Postgres di serverless: pakai URL pooler, bukan koneksi langsung
        DATABASE_URL="postgresql://...@pooler.contoh.com:6543/app?pgbouncer=true"
        DIRECT_URL="postgresql://...@db.contoh.com:5432/app"   # untuk migrasi
        `,
      ),

      h2('Kapan Vercel bukan pilihan terbaik'),
      ul(
        'Butuh proses yang hidup terus — WebSocket, pekerja antrean.',
        'Butuh sistem berkas yang bisa ditulis.',
        'Trafik sangat tinggi dengan anggaran terbatas.',
        'Ada kewajiban menyimpan data di wilayah tertentu.',
        'Backend dan frontend ingin di-deploy sebagai satu kesatuan.',
      ),

      h2('Rollback'),
      code(
        'bash',
        `
        vercel rollback                          # ke deployment sebelumnya
        vercel promote <url-deployment>          # promosikan deployment tertentu
        `,
      ),
      callout(
        'tip',
        'Rollback frontend itu instan — rollback database tidak',
        'Vercel menyimpan setiap deployment, jadi kembali ke versi sebelumnya hanya soal menunjuk yang mana. Yang **tidak** bisa dibatalkan begitu saja adalah migrasi database yang sudah berjalan. Itulah alasan pola expand–migrate–contract di sub-bab 4.4.',
      ),
    ],
  ),

  written(
    'alternatif-hosting',
    'Alternatif: Netlify, Cloudflare Pages, self-host',
    12,
    'Pilihan lain, dan trade-off yang sebenarnya.',
    [
      h2('Perbandingan'),
      table(
        ['', 'Vercel', 'Cloudflare', 'Netlify', 'Self-host'],
        [
          ['Dukungan Next.js', 'Terbaik', 'Baik', 'Baik', 'Penuh'],
          ['Runtime', 'Node + Edge', 'Workers', 'Node + Edge', 'Node penuh'],
          ['Proses hidup terus', 'Tidak', 'Tidak', 'Tidak', '**Ya**'],
          ['Sistem berkas', '`/tmp` saja', 'Tidak ada', '`/tmp` saja', '**Penuh**'],
          ['Biaya trafik tinggi', 'Mahal', '**Murah**', 'Sedang', 'Tetap'],
          ['Kendali', 'Rendah', 'Rendah', 'Rendah', '**Penuh**'],
          ['Beban operasional', 'Nol', 'Nol', 'Nol', '**Kamu**'],
        ],
      ),

      h2('Cloudflare Pages / Workers'),
      code(
        'bash',
        `
        npm install --save-dev @opennextjs/cloudflare
        npx opennextjs-cloudflare build
        npx wrangler deploy
        `,
      ),
      callout(
        'warning',
        'Workers bukan Node.js',
        'Ia berjalan di runtime berbasis V8 dengan API mirip browser. Modul Node seperti `fs`, `net`, dan `child_process` tidak ada, dan sebagian paket npm yang bergantung padanya tidak akan berjalan. Periksa dependency-mu sebelum memilih jalur ini.',
      ),

      h2('Self-host dengan Node'),
      code(
        'bash',
        `
        # Di server
        git clone <repo> /var/www/app && cd /var/www/app
        npm ci
        npm run build

        # Jalankan dengan manajer proses supaya otomatis menyala ulang
        pm2 start npm --name app -- start
        pm2 save
        pm2 startup
        `,
      ),
      code(
        'text',
        `
        # Nginx di depannya
        server {
            listen 443 ssl http2;
            server_name app.contoh.com;

            location /_next/static/ {
                alias /var/www/app/.next/static/;
                expires 1y;
                add_header Cache-Control "public, immutable";
            }

            location / {
                proxy_pass http://127.0.0.1:3000;
                proxy_set_header Host $host;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
        `,
      ),

      h2('Output `standalone`'),
      code(
        'ts',
        `
        // next.config.ts — hanya menyertakan dependency yang benar-benar dipakai
        export default { output: 'standalone' };
        `,
      ),
      code(
        'bash',
        `
        # Hasilnya jauh lebih kecil — berguna untuk container
        node .next/standalone/server.js
        `,
      ),

      h2('Ekspor statis'),
      code(
        'ts',
        `
        export default { output: 'export' };
        `,
      ),
      callout(
        'warning',
        'Ekspor statis mematikan banyak fitur',
        'Tidak ada Route Handler, tidak ada Server Action, tidak ada middleware, tidak ada ISR, dan `next/image` butuh loader kustom. Ia cocok untuk situs yang benar-benar statis — dokumentasi, blog, landing page — dan tidak cocok untuk aplikasi.',
      ),

      h2('Yang sering diremehkan pada self-host'),
      ul(
        'Sertifikat TLS beserta pembaruannya.',
        'Pembaruan keamanan sistem operasi.',
        'Pemantauan, alert, dan rotasi log.',
        'Cadangan dan **uji pemulihannya**.',
        'Deploy tanpa downtime.',
        'Pertahanan DDoS.',
      ),
      callout(
        'tip',
        'Hitung biayanya dalam waktu, bukan hanya uang',
        'VPS seharga lima dolar per bulan terlihat jauh lebih murah daripada PaaS — sampai kamu menghitung jam yang habis untuk memelihara semua di daftar itu. Untuk project belajar, self-host sangat berharga sebagai pengalaman. Untuk sesuatu yang harus tetap hidup, hitung dulu siapa yang akan bangun jam tiga pagi.',
      ),
    ],
  ),

  written(
    'env-nextjs-produksi',
    'Environment Variable di Produksi',
    10,
    'Nilai yang berbeda per lingkungan, dan batas yang tidak boleh dilanggar.',
    [
      h2('Dua jenis'),
      code(
        'bash',
        `
        # Server saja — TIDAK ikut ke browser
        DATABASE_URL="postgresql://..."
        JWT_SECRET="..."

        # IKUT ke bundle browser — bisa dibaca siapa pun
        NEXT_PUBLIC_API_URL="https://api.contoh.com"
        NEXT_PUBLIC_SITE_URL="https://app.contoh.com"
        `,
      ),
      callout(
        'danger',
        '`NEXT_PUBLIC_` berarti publik, tanpa pengecualian',
        'Nilainya ditanam ke JavaScript yang diunduh browser dan bisa dibaca dengan membuka DevTools. Kesalahan ini biasanya terjadi saat seseorang mendapat `undefined` di Client Component lalu "memperbaikinya" dengan menambahkan prefiks — yang justru mengubah rahasia menjadi publik.',
      ),

      h2('Urutan pembacaan berkas'),
      code(
        'text',
        `
        .env.local              paling tinggi (kecuali saat test) — GITIGNORE
        .env.production         saat NODE_ENV=production
        .env.development        saat NODE_ENV=development
        .env                    default untuk semua
        `,
      ),
      code(
        'text',
        `
        .env
        .env.local
        .env.*.local
        `,
        { filename: '.gitignore' },
      ),

      h2('Validasi saat boot'),
      code(
        'ts',
        `
        // src/env.ts
        import { z } from 'zod';

        const Server = z.object({
          DATABASE_URL: z.string().url(),
          JWT_SECRET: z.string().min(32),
          NODE_ENV: z.enum(['development', 'test', 'production']),
        });

        const Klien = z.object({
          NEXT_PUBLIC_API_URL: z.string().url(),
        });

        // Variabel publik harus dirujuk SATU PER SATU.
        // Next.js mengganti teks 'process.env.NEXT_PUBLIC_X' saat build —
        // ia tidak bisa mengganti 'process.env' secara utuh.
        const klien = Klien.safeParse({
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        });

        if (!klien.success) throw new Error('Konfigurasi publik tidak valid');

        export const envKlien = klien.data;

        // Server: hanya diurai di server
        export const envServer =
          typeof window === 'undefined' ? Server.parse(process.env) : (null as never);
        `,
      ),
      callout(
        'warning',
        '`process.env` tidak bisa disebar di kode klien',
        'Menulis `Klien.parse(process.env)` akan gagal di browser karena Next.js hanya mengganti referensi **eksplisit** ke setiap variabel. Ini penyebab error "NEXT_PUBLIC_X is undefined" yang membingungkan — nilainya ada saat build, tapi tidak pernah ikut ke bundle karena tidak pernah dirujuk langsung.',
      ),

      h2('Menjaga batas server'),
      code(
        'bash',
        `
        npm install server-only
        `,
      ),
      code(
        'ts',
        `
        // src/lib/db.ts
        import 'server-only';   // build GAGAL kalau berkas ini terimpor komponen klien

        export const db = buatKoneksi(process.env.DATABASE_URL!);
        `,
      ),

      h2('Memeriksa tidak ada yang bocor'),
      code(
        'bash',
        `
        npm run build

        # Cari nilai rahasia di bundle klien
        grep -rE "postgresql://|sk_live|AKIA|-----BEGIN" .next/static/ \\
          && echo "RAHASIA DI BUNDLE — hentikan deploy" || echo "bersih"

        # Lihat semua NEXT_PUBLIC_ yang benar-benar ikut
        grep -rhoE "NEXT_PUBLIC_[A-Z_]+" .next/static/ | sort -u
        `,
      ),
      callout(
        'tip',
        'Jadikan pemeriksaan ini langkah CI',
        'Satu baris `grep` yang menggagalkan build jauh lebih murah daripada menemukan kredensial database di bundle produksi lewat laporan orang lain.',
      ),

      h2('Nilai berbeda per lingkungan'),
      table(
        ['Variabel', 'Development', 'Preview', 'Production'],
        [
          ['`NEXT_PUBLIC_API_URL`', '`localhost:8000`', 'API staging', 'API produksi'],
          ['`DATABASE_URL`', 'DB lokal', 'DB staging', 'DB produksi'],
          ['`NODE_ENV`', '`development`', '`production`', '`production`'],
        ],
      ),
      callout(
        'danger',
        'Preview tidak boleh menunjuk database produksi',
        'Preview deployment dibuat otomatis dari setiap PR — termasuk PR yang belum direview. Kode di dalamnya bisa apa saja. Menunjuknya ke database produksi berarti setiap PR punya akses tulis penuh ke data sungguhan.',
      ),
    ],
  ),

  written(
    'domain-https-fe',
    'Custom Domain & HTTPS',
    9,
    'Menghubungkan nama ke aplikasi yang sudah berjalan.',
    [
      h2('Menunjuk domain'),
      code(
        'text',
        `
        # Root domain — CNAME tidak boleh di root, jadi pakai A (atau ALIAS)
        contoh.com.       A      76.76.21.21

        # Subdomain — CNAME
        www.contoh.com.   CNAME  cname.vercel-dns.com.
        app.contoh.com.   CNAME  cname.vercel-dns.com.
        `,
      ),
      callout(
        'info',
        'Kenapa root domain tidak boleh CNAME',
        'Spesifikasi DNS melarangnya karena root domain juga harus punya record lain (`MX`, `TXT`) yang tidak bisa hidup berdampingan dengan CNAME. Sebagian penyedia menyediakan `ALIAS` atau `ANAME` yang berperilaku seperti CNAME tapi sah di root.',
      ),

      h2('Pilih satu bentuk kanonis'),
      code(
        'ts',
        `
        // next.config.ts — arahkan www ke non-www (atau sebaliknya)
        async redirects() {
          return [{
            source: '/:path*',
            has: [{ type: 'host', value: 'www.contoh.com' }],
            destination: 'https://contoh.com/:path*',
            permanent: true,
          }];
        }
        `,
      ),
      callout(
        'warning',
        'Dua bentuk yang sama-sama hidup memecah SEO dan cookie',
        'Mesin pencari melihatnya sebagai dua situs dengan konten duplikat. Lebih praktis lagi: cookie yang disetel di `contoh.com` tidak ikut terkirim ke `www.contoh.com`, sehingga pengguna tampak logout saat berpindah antar keduanya.',
      ),

      h2('HTTPS'),
      p(
        'Semua platform modern menerbitkan dan memperbarui sertifikat otomatis setelah DNS mengarah dengan benar. Untuk self-host, Certbot atau Caddy mengurusnya.',
      ),
      code(
        'bash',
        `
        # Verifikasi
        curl -sI https://contoh.com | head -1
        curl -sI http://contoh.com | grep -i location    # harus 301 ke https

        echo | openssl s_client -connect contoh.com:443 -servername contoh.com 2>/dev/null \\
          | openssl x509 -noout -dates
        `,
      ),

      h2('HSTS'),
      code(
        'ts',
        `
        async headers() {
          return [{
            source: '/:path*',
            headers: [{
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains',
            }],
          }];
        }
        `,
      ),
      callout(
        'danger',
        'HSTS sulit dibatalkan; `preload` hampir permanen',
        'Setelah browser menyimpannya, ia menolak koneksi HTTP ke domainmu selama masa berlakunya — mematikan header tidak menolong. Menambahkan domain ke daftar `preload` browser bahkan lebih sulit dibatalkan, dan `includeSubDomains` berlaku untuk **semua** subdomain, termasuk yang belum ada. Mulai dari `max-age` kecil.',
      ),

      h2('Subdomain untuk frontend dan backend'),
      code(
        'text',
        `
        app.contoh.com    -> frontend
        api.contoh.com    -> backend

        Cookie dengan domain=.contoh.com bisa dipakai keduanya.
        `,
      ),
      p(
        'Ini yang membuat autentikasi berbasis cookie tetap mungkin tanpa `SameSite=None` — bahasan lengkapnya di Backend Intermediate 4.3.',
      ),

      h2('Setelah domain aktif'),
      ol(
        'Verifikasi HTTP mengalihkan ke HTTPS.',
        'Verifikasi bentuk non-kanonis mengalihkan ke yang kanonis.',
        'Perbarui `NEXT_PUBLIC_SITE_URL` dan URL di metadata Open Graph.',
        'Perbarui allow-list CORS di backend.',
        'Perbarui `redirect_uri` di penyedia OAuth.',
        'Pasang pemantauan kedaluwarsa sertifikat — 30 hari sebelumnya.',
      ),
      callout(
        'warning',
        'Poin 4 dan 5 sering terlupa sampai ada yang melapor',
        'Domain baru berarti origin baru. CORS akan menolaknya, dan login OAuth akan gagal dengan `redirect_uri_mismatch` — keduanya baru ketahuan saat ada pengguna yang mencobanya.',
      ),
    ],
  ),

  written(
    'caching-cdn-produksi',
    'Caching, CDN & Revalidation di Produksi',
    12,
    'Menyajikan cepat tanpa menyajikan yang basi.',
    [
      h2('Lapisan cache'),
      code(
        'text',
        `
        Browser  ->  CDN  ->  Cache Next.js  ->  Aplikasi  ->  Database
           │         │            │
           │         │            └── halaman statis, hasil fetch
           │         └── aset & halaman statis di tepi jaringan
           └── memori dan disk browser
        `,
      ),
      p(
        'Setiap lapisan punya aturannya sendiri, dan yang paling sering salah adalah aturan lapisan pertama.',
      ),

      h2('Aset statis'),
      code(
        'text',
        `
        # Nama berkas memuat hash isinya -> aman di-cache selamanya
        /_next/static/chunks/main-a1b2c3.js
        Cache-Control: public, max-age=31536000, immutable
        `,
      ),
      p(
        'Karena isi berubah berarti nama berubah, tidak pernah ada kebutuhan menghapus cache-nya. Ini pola yang membuat invalidasi menjadi tidak relevan — jauh lebih andal daripada berusaha menghapus entri di banyak CDN.',
      ),

      h2('Halaman'),
      code(
        'ts',
        `
        // Statis penuh — dibuat sekali saat build
        export const dynamic = 'force-static';

        // ISR — statis yang menyegarkan diri
        export const revalidate = 3600;

        // Selalu dinamis
        export const dynamic = 'force-dynamic';
        `,
      ),
      code(
        'ts',
        `
        // Per pemanggilan fetch
        fetch(url, { next: { revalidate: 60 } });
        fetch(url, { next: { tags: ['artikel'] } });
        fetch(url, { cache: 'no-store' });
        `,
      ),
      callout(
        'warning',
        'Default `fetch` berubah di Next.js 15',
        'Di versi 13–14 ia di-cache secara default, dan banyak orang kaget menemukan datanya basi. Sejak 15, default-nya **tidak** di-cache. Tutorial lama yang menyebut "fetch otomatis di-cache" sudah tidak berlaku.',
      ),

      h2('Revalidasi atas permintaan'),
      code(
        'ts',
        `
        'use server';
        import { revalidatePath, revalidateTag } from 'next/cache';

        export async function terbitkanArtikel(id: string) {
          await api.terbitkan(id);

          revalidateTag('artikel');           // semua fetch bertag 'artikel'
          revalidatePath('/artikel');         // satu rute
          revalidatePath('/', 'layout');      // rute itu dan seluruh turunannya
        }
        `,
      ),
      code(
        'ts',
        `
        // Webhook dari CMS — WAJIB diverifikasi
        export async function POST(req: Request) {
          const tandaTangan = req.headers.get('x-signature');
          const mentah = await req.text();

          if (!verifikasiHmac(mentah, tandaTangan, process.env.WEBHOOK_SECRET!)) {
            return new Response('Tidak sah', { status: 401 });
          }

          revalidateTag('artikel');
          return Response.json({ ok: true });
        }
        `,
      ),
      callout(
        'danger',
        'Endpoint revalidasi tanpa verifikasi adalah jalur penolakan layanan',
        'Siapa pun yang tahu URL-nya bisa memaksa seluruh cache-mu dibuang berulang kali — dan setiap pembuangan berarti semua permintaan berikutnya menembus ke database. "URL-nya sulit ditebak" bukan kontrol akses.',
      ),

      h2('Cache untuk data privat'),
      code(
        'ts',
        `
        // Data privat TIDAK BOLEH tersimpan di CDN atau proxy bersama
        export async function GET() {
          const data = await ambilDataPengguna();

          return Response.json(data, {
            headers: {
              'Cache-Control': 'private, no-store',
              Vary: 'Authorization',
            },
          });
        }
        `,
      ),
      callout(
        'danger',
        'Melewatkan `Vary` bisa menyajikan data orang lain',
        'Kalau respons bergantung pada `Authorization` tapi cache tidak diberi tahu, proxy bersama bisa menyimpan jawaban milik Ana lalu menyajikannya kepada Budi. Untuk data privat, pasangkan `private` dengan `no-store` — dan ingat bahwa `no-cache` **tidak** berarti "jangan simpan".',
      ),

      h2('Memeriksa apa yang benar-benar terjadi'),
      code(
        'bash',
        `
        curl -sI https://contoh.com/artikel/belajar-api | grep -iE \\
          "cache-control|x-vercel-cache|age|cf-cache-status|etag"

        # HIT  = disajikan dari cache
        # MISS = diambil dari asal
        # STALE = disajikan basi sambil disegarkan
        `,
      ),

      h2('Kesalahan yang mahal'),
      table(
        ['Kesalahan', 'Akibat'],
        [
          ['Data privat di-cache publik', '**Data pengguna disajikan ke orang lain**'],
          ['`no-cache` dikira "jangan simpan"', 'Data sensitif tersimpan di proxy'],
          ['Tanpa `Vary`', 'Respons tertukar antar pengguna'],
          ['TTL terlalu panjang untuk data yang berubah', 'Pengguna melihat data lama'],
          ['Semua `no-store`', 'Kehilangan seluruh manfaat cache'],
        ],
      ),
      callout(
        'tip',
        'Kalau ragu, `no-store`',
        'Kesalahan menyajikan data privat ke orang lain jauh lebih mahal daripada kesalahan tidak memakai cache. Mulai dari `no-store`, lalu longgarkan hanya pada endpoint yang kamu yakin memang publik.',
      ),
    ],
  ),
];
