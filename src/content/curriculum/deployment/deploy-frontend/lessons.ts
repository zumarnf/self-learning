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
      p(
        'Dua perintah ini melakukan hal yang sangat berbeda meski sering diucapkan sebagai satu langkah. `npm run build` menghasilkan artefak — kode yang sudah dikompilasi, dipecah menjadi chunk, dan diminifikasi ke dalam `.next/`. `npm run start` menjalankan artefak itu; ia **tidak** membangun apa pun, sehingga menjalankannya tanpa build lebih dulu hanya akan menyajikan hasil build yang lama.',
      ),
      p(
        'Menjalankan pasangan ini di laptop sebelum deploy adalah cara termurah menangkap bug yang hanya ada di produksi. Yang paling sering muncul: hydration mismatch (HTML dari server berbeda dengan render pertama di klien), variabel environment yang ternyata hanya ada di berkas `.env.local`, dan impor yang salah huruf besar-kecil — yang lolos di macOS atau Windows tetapi gagal di server Linux yang membedakannya.',
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
      p(
        'Simbol di depan tiap rute adalah informasi terpenting di tabel ini. `○` berarti halaman dibangun sekali saat build dan disajikan sebagai berkas statis; `●` berarti sama, tetapi daftar halamannya dihasilkan `generateStaticParams` — itulah yang dipakai `/kelas/[category]/[chapter]`. `ƒ` berarti halaman di-render ulang **setiap permintaan** di server, yang wajar untuk `/api/artikel` tetapi menjadi tanda bahaya kalau muncul di halaman yang isinya sebenarnya tetap.',
      ),
      p(
        'Dua kolom angkanya juga tidak sama artinya. **Size** adalah JavaScript milik rute itu sendiri — 3,1 kB untuk `/pengaturan`. **First Load JS** adalah total yang harus diunduh pembaca sebelum halaman itu bisa dipakai, yaitu ukuran rute ditambah 98 kB bundle bersama yang tercantum di baris `shared by all`. Karena itu `/` yang hanya 1,2 kB tetap menuntut 105 kB: hampir seluruhnya bundle bersama, dan di situlah penghematan biasanya paling besar.',
      ),
      p(
        'Yang membuat keluaran ini layak dibaca tiap kali build adalah kemampuannya menangkap perubahan yang tidak menimbulkan gejala. Empat pola berikut adalah yang paling sering muncul.',
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
      p(
        'Analyzer dipasang sebagai **pembungkus** konfigurasi, bukan sebagai perintah terpisah: `withBundleAnalyzer({...})(konfigurasiAsli)`. Bentuk fungsi-mengembalikan-fungsi itu yang membuat konfigurasi Next.js aslimu (`reactStrictMode`, `poweredByHeader`) tetap utuh — analyzer hanya menyisipkan langkah tambahan ke dalam proses build.',
      ),
      p(
        "`enabled: process.env.ANALYZE === 'true'` adalah sakelarnya, dan itulah alasan perintahnya ditulis `ANALYZE=true npm run build`. Tanpa variabel itu, build berjalan normal tanpa beban tambahan; dengan variabel itu, Next.js membuka laporan HTML interaktif yang menampilkan tiap modul sebagai kotak seluas ukurannya. Kotak besar yang tidak kamu kenali adalah tempat mencari terlebih dahulu.",
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
      p(
        "Kedua baris impor itu menghasilkan fungsi `debounce` yang sama, tetapi jalur modulnya berbeda. `from 'lodash'` menunjuk berkas indeks yang mengekspor **ratusan** fungsi, dan bundler yang tidak bisa menghilangkan sisanya, sebab lodash versi CommonJS memang sulit di-tree-shake, ikut menyertakan semuanya. `from 'lodash/debounce'` menunjuk satu berkas, sehingga tidak ada sisa yang bisa terbawa.",
      ),
      p(
        'Pola yang sama berlaku untuk **impor barrel** yang disebut di tabel di atas: `index.ts` yang mengekspor ulang seluruh isi folder membuat satu impor kecil berpotensi menarik seluruh tetangganya. Sebelum memasang paket untuk sesuatu yang sederhana, periksa dulu apakah padanannya sudah ada di JavaScript modern — `debounce` sendiri memang beberapa baris saja, dan nol byte dependency.',
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
      p(
        '`dynamic()` mengubah impor biasa menjadi impor yang baru dijalankan saat komponennya benar-benar dirender. Akibatnya kode Playground pindah ke chunk terpisah yang tidak ikut diunduh saat halaman dibuka — pembaca yang tidak pernah membuka playground tidak pernah membayar ratusan KB itu.',
      ),
      p(
        'Dua opsi di dalamnya menutup dua akibat sampingannya. `loading: () => <SkeletonPlayground />` mengisi ruang selama chunk-nya diunduh, sehingga tata letak tidak melompat saat komponennya muncul. `ssr: false` mematikan render di server — perlu untuk komponen yang menyentuh `window` atau `document`, yang tidak ada di server dan akan menggagalkan build kalau dipaksa dirender di sana. Tabel berikut membatasi kapan teknik ini sepadan.',
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
      p(
        'Dua pemeriksaan terakhir sengaja dijalankan terhadap server yang **benar-benar berjalan**, bukan terhadap berkas konfigurasi. `curl -sI` hanya mengambil header responsnya (`-I`) tanpa mencetak progres (`-s`), lalu `grep -i` mencari dua hal: apakah `content-security-policy` benar-benar terkirim, dan apakah `x-powered-by` sudah hilang. Header yang tertulis rapi di `next.config.ts` tetapi tidak muncul di sini berarti ia tidak berlaku.',
      ),
      p(
        'Perintah `grep -rE` terakhir menyisir `.next/static/`, yaitu direktori yang seluruh isinya dikirim ke browser, untuk pola kunci Stripe (`sk_live`), kunci AWS (`AKIA`), dan kunci privat (`-----BEGIN`). Pemeriksaan ini paling berharga persis ketika ia tidak menemukan apa-apa, dan ia adalah versi lokal dari langkah yang sudah dipasang di pipeline CI pada bab sebelumnya.',
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
      p(
        'Tiga baris itu adalah tiga jenis URL dengan umur berbeda. Baris pertama adalah domain produksi yang selalu menunjuk deployment terkini. Baris kedua adalah URL **per branch** — ia berpindah mengikuti commit terbaru di branch itu, sehingga tautan di komentar PR selalu menampilkan versi terakhir.',
      ),
      p(
        'Baris ketiga yang paling sering terlupa: setiap commit juga mendapat URL permanennya sendiri (`app-a1b2c3d-tim`). Itu berarti setiap versi yang pernah dibangun tetap bisa dibuka selamanya — sangat berguna untuk membandingkan "sebelum dan sesudah", dan sekaligus alasan peringatan berikut. Deployment lama yang memuat data sungguhan tetap terjangkau meski PR-nya sudah lama ditutup.',
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
      p(
        'Kata `production` di ujung dua perintah pertama adalah **targetnya**, dan ia wajib disebut karena Vercel menyimpan nilai terpisah untuk Production, Preview, dan Development. Menambahkan variabel tanpa memikirkan target adalah cara paling umum sebuah preview deployment tanpa sengaja menunjuk database produksi.',
      ),
      p(
        'Perhatikan dua nama variabel di sana punya sifat yang berlawanan. `DATABASE_URL` hanya dibaca di server dan tidak pernah sampai ke browser. `NEXT_PUBLIC_API_URL`, karena awalan `NEXT_PUBLIC_`, **ditanam ke dalam bundle** saat build dan bisa dibaca siapa pun yang membuka halamanmu, jadi jangan pernah menaruh rahasia di belakang awalan itu. `vercel env pull` menarik nilai-nilai tersebut ke `.env.local` supaya pengembangan lokal memakai konfigurasi yang sama, dan berkas itu harus ada di `.gitignore`.',
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
      p(
        'Dua URL untuk satu database yang sama, dan bedanya ada pada porta serta host. `DATABASE_URL` menunjuk **pooler** di porta `6543` — satu perantara yang memegang sedikit koneksi sungguhan ke Postgres, lalu membagikannya bergantian ke ratusan instance fungsi. Itulah yang mencegah Postgres kehabisan slot koneksi saat trafik melonjak.',
      ),
      p(
        '`DIRECT_URL` menunjuk database langsung di porta `5432`, dan ia tetap diperlukan karena **migrasi** tidak bisa lewat pooler. Perintah seperti `CREATE INDEX` atau perubahan skema butuh satu sesi yang stabil dari awal sampai akhir, sedangkan pooler dalam mode transaksi bisa memindahkan perintahmu ke koneksi lain di tengah jalan. Parameter `?pgbouncer=true` di URL pertama memberi tahu Prisma untuk mematikan prepared statement, yang juga tidak cocok dengan mode itu.',
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
      p(
        'Keduanya cepat karena tidak ada yang dibangun ulang. Setiap deployment sudah tersimpan utuh sebagai artefak beserta URL permanennya — yang berubah hanyalah **ke mana domain produksi menunjuk**. Itu sebabnya rollback frontend biasanya selesai dalam hitungan detik, bukan selama proses build.',
      ),
      p(
        'Bedanya: `vercel rollback` mundur satu langkah ke deployment sebelumnya, sedangkan `vercel promote <url>` menunjuk deployment **mana pun** yang pernah ada. Yang kedua lebih tepat saat masalahnya baru ketahuan beberapa rilis kemudian, karena "sebelumnya" ternyata juga sudah membawa bug yang sama.',
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
      p(
        'Adaptor `@opennextjs/cloudflare` ada karena Next.js tidak berjalan begitu saja di Workers. Perintah `opennextjs-cloudflare build` mengambil hasil build Next.js yang biasa lalu **membungkusnya ulang** ke bentuk yang dimengerti runtime Workers; `wrangler deploy` yang kemudian mengunggahnya. Lapisan tambahan ini juga alasan fitur Next.js terbaru kadang butuh waktu sebelum didukung di sini.',
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
      p(
        'Tiga perintah `pm2` di potongan pertama menyelesaikan tiga masalah berbeda. `pm2 start` menjalankan aplikasi dan menyalakannya kembali kalau prosesnya mati. `pm2 save` menyimpan daftar proses yang sedang berjalan; `pm2 startup` memasang layanan systemd yang memulihkan daftar itu **setelah server reboot**. Tanpa dua perintah terakhir, aplikasimu tidak menyala lagi setelah server dimulai ulang — dan itu biasanya baru ketahuan pada saat yang paling tidak menyenangkan.',
      ),
      p(
        'Di konfigurasi Nginx, blok `location /_next/static/` sengaja diletakkan **di atas** `location /`. Nginx menyajikan berkas statis itu langsung dari disk tanpa melewati Node sama sekali — jauh lebih cepat, dan aman diberi `expires 1y` karena nama berkasnya mengandung hash yang berubah setiap build. Itulah arti `immutable`: berkas dengan nama itu tidak akan pernah berubah isinya.',
      ),
      p(
        'Tiga baris `proxy_set_header` menjaga informasi yang hilang begitu permintaan melewati proxy. Tanpa `X-Forwarded-Proto $scheme`, aplikasi Next.js di belakang Nginx melihat permintaan datang sebagai HTTP biasa — sehingga redirect yang ia bentuk bisa mengarah ke `http://`, dan cookie bertanda `Secure` tidak terkirim. `X-Forwarded-For` membawa IP asli pengunjung, yang dibutuhkan untuk rate limiting dan log; tanpanya, semua permintaan terlihat berasal dari `127.0.0.1`.',
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
      p(
        "`output: 'standalone'` menyuruh Next.js menelusuri impor yang benar-benar dipakai lalu menyalin **hanya** berkas itu ke `.next/standalone/`, lengkap dengan `server.js` kecil yang menjalankannya. Hasilnya: `node_modules` tidak perlu ikut dikirim sama sekali, dan image container yang tadinya ratusan MB bisa turun drastis.",
      ),
      p(
        'Ini persis mekanisme di balik Dockerfile Node pada bab Docker, yang tahap runtime-nya hanya menyalin `.next/standalone`, `.next/static`, dan `public`. Perhatikan perintah menjalankannya juga berubah: bukan `npm run start` lagi, melainkan `node .next/standalone/server.js` — karena skrip npm dan seluruh `node_modules` yang ia butuhkan memang tidak ikut.',
      ),

      h2('Ekspor statis'),
      code(
        'ts',
        `
        export default { output: 'export' };
        `,
      ),
      p(
        'Satu baris ini mengubah `npm run build` menjadi penghasil **berkas HTML biasa** di direktori `out/`, tanpa server Node sama sekali. Hasilnya bisa diunggah ke penyimpanan statis mana pun seperti GitHub Pages, S3, atau Cloudflare Pages, dan biayanya mendekati nol karena tidak ada proses yang perlu hidup.',
      ),
      p(
        'Harga yang dibayar disebut di peringatan berikut, dan ia besar, sebab semua yang membutuhkan server saat permintaan datang ikut hilang. Aturan sederhananya, kalau setiap pengunjung melihat isi yang sama dan tidak ada yang perlu login, ekspor statis adalah pilihan termurah, sedangkan begitu ada satu halaman yang isinya bergantung pada siapa yang membukanya, jalur ini tertutup.',
      ),
      callout(
        'warning',
        'Ekspor statis mematikan banyak fitur',
        'Tidak ada Route Handler, tidak ada Server Action, tidak ada middleware, tidak ada ISR, dan `next/image` butuh loader kustom. Ia cocok untuk situs yang benar-benar statis seperti dokumentasi, blog, dan landing page, tetapi tidak cocok untuk aplikasi.',
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
      p(
        'Yang memisahkan dua kelompok itu hanyalah **awalan nama**, dan Next.js memperlakukannya secara mekanis: setiap variabel yang namanya dimulai `NEXT_PUBLIC_` nilainya disalin ke dalam JavaScript yang dikirim ke browser saat build. Tidak ada pengecualian, tidak ada pengaturan tambahan — namanya sendiri yang menentukan.',
      ),
      p(
        'Perhatikan apa yang ada di masing-masing kelompok. `DATABASE_URL` dan `JWT_SECRET` adalah kredensial yang cukup untuk mengambil alih seluruh sistem, dan keduanya hanya dibaca kode yang berjalan di server. `NEXT_PUBLIC_API_URL` dan `NEXT_PUBLIC_SITE_URL` adalah alamat yang memang **sudah** terlihat di panel Network browser, sehingga menaruhnya di bundle tidak menambah informasi apa pun bagi penyerang. Aturannya sederhana, kalau nilainya tidak apa-apa dipampang di halaman depan situsmu, ia boleh publik.',
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
      p(
        'Urutan di potongan pertama dibaca dari atas ke bawah sebagai **prioritas**: nilai di `.env.local` menang atas `.env.production`, yang menang atas `.env`. Polanya bisa dimanfaatkan — taruh nilai bawaan yang aman dibagikan di `.env` (yang ikut ter-commit), lalu timpa dengan nilai asli di `.env.local` yang hanya ada di mesinmu.',
      ),
      p(
        'Pengecualian "kecuali saat test" ada karena berkas tes seharusnya berjalan dengan konfigurasi yang sama di mana pun; kalau `.env.local` ikut dibaca, hasil tes di laptopmu bisa berbeda dari hasil tes di CI. Perhatikan pula `.env.production` **bukan** tempat menyimpan rahasia produksi — ia ikut ter-commit kecuali kamu mengabaikannya, dan rahasia produksi seharusnya disuntikkan platform saat deploy.',
      ),
      p(
        'Tiga baris di `.gitignore` menutup ketiga bentuk berkas lokal sekaligus. Pola `.env.*.local` yang terakhir yang paling mudah terlupa: ia menangkap `.env.production.local` dan `.env.development.local` — berkas yang justru paling mungkin memuat kredensial sungguhan.',
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
      p(
        'Skema `Server` tidak sekadar memeriksa keberadaan variabel, ia memeriksa **bentuknya**: `z.string().url()` menolak `DATABASE_URL` yang salah ketik, `z.string().min(32)` menolak `JWT_SECRET` yang terlalu pendek untuk aman, dan `z.enum([...])` menolak `NODE_ENV` yang bernilai di luar tiga pilihan itu. Kegagalannya terjadi saat aplikasi menyala — bukan saat permintaan pertama yang kebetulan menyentuh database, jam dua pagi.',
      ),
      p(
        'Bagian `klien` ditulis dengan cara yang terlihat bertele-tele karena menyebut `NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL` satu per satu, dan komentarnya menjelaskan alasannya. Next.js melakukan **substitusi teks** saat build, sebab ia mencari string `process.env.NEXT_PUBLIC_API_URL` di kode dan menggantinya dengan nilainya. Menulis `Klien.parse(process.env)` tidak memberi teks untuk dicari, sehingga di browser objek itu kosong.',
      ),
      p(
        "Baris terakhir memakai `typeof window === 'undefined'` sebagai penjaga, sehingga hanya di server, tempat `window` tidak ada, skema `Server` benar-benar diurai. Ini membuat kode yang tidak sengaja mengimpor `envServer` dari komponen klien tidak akan mencoba membaca `DATABASE_URL` di browser. Ia pengaman lapis pertama, sedangkan lapis yang lebih tegas berupa `server-only` dibahas tepat di bawah.",
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
      p(
        'Paket `server-only` tidak berisi logika apa pun — ia hanya berisi modul yang **sengaja dibuat gagal** kalau di-bundle untuk browser. Menuliskan `import \'server-only\'` di puncak sebuah berkas mengubah aturan tak tertulis "jangan impor ini dari klien" menjadi kegagalan build yang menyebut nama berkas pelanggarnya.',
      ),
      p(
        "Yang membuatnya berharga adalah **kapan** ia menangkap kesalahan. Tanpa penjaga ini, mengimpor `db.ts` dari sebuah Client Component tidak menimbulkan gejala saat menulis kode; masalahnya baru muncul sebagai kredensial yang ikut ke bundle, atau sebagai error runtime yang membingungkan di browser. Pasang `import 'server-only'` di setiap modul yang menyentuh database, kunci API, atau berkas sistem.",
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
      p(
        'Pemeriksaan pertama mencari nilai yang **tidak boleh ada**: connection string, kunci Stripe, kunci AWS, kunci privat. Rantai `&& … || …` di ujungnya membuat hasilnya terbaca sekali lihat — `grep` yang menemukan sesuatu menjalankan cabang kiri ("hentikan deploy"), yang tidak menemukan apa-apa menjalankan cabang kanan ("bersih").',
      ),
      p(
        'Pemeriksaan kedua menjawab pertanyaan yang berbeda: **apa saja** yang sebenarnya ikut ke bundle. `-o` mencetak hanya bagian yang cocok (bukan seluruh baris), `-h` menyembunyikan nama berkasnya, dan `sort -u` menyisakan daftar unik. Hasilnya adalah daftar nama variabel publik yang benar-benar terpakai — dan kalau ada nama yang membuatmu berpikir "kenapa ini publik?", itulah temuan yang dicari.',
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
      p(
        'Perbedaan mendasar dua jenis record ini: `A` menunjuk **alamat IP**, `CNAME` menunjuk **nama lain**. Karena itu baris pertama harus mencantumkan angka `76.76.21.21` yang bisa berubah kalau penyedia mengganti infrastrukturnya, sementara `CNAME` ke `cname.vercel-dns.com.` tetap benar meski IP di belakangnya berpindah.',
      ),
      p(
        'Perhatikan titik di ujung setiap nama (`contoh.com.`, `cname.vercel-dns.com.`). Titik itu menandakan nama **absolut**; tanpanya, sebagian penyedia DNS menambahkan nama zona di belakangnya sehingga `cname.vercel-dns.com` diam-diam menjadi `cname.vercel-dns.com.contoh.com` — dan domainmu tidak pernah terhubung, dengan gejala yang sulit ditelusuri.',
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
      p(
        'Blok `has` yang membuat aturan ini bekerja secara selektif. Ia menyaring berdasarkan `host` — hanya permintaan yang datang ke `www.contoh.com` yang dialihkan, sedangkan yang sudah di `contoh.com` dibiarkan. Tanpa penyaring itu, aturannya akan mengalihkan permintaan ke dirinya sendiri dan menghasilkan perulangan redirect tak berujung.',
      ),
      p(
        'Pola `/:path*` di `source` dan `destination` menyalin **seluruh** jalur beserta segmennya, sehingga `www.contoh.com/kelas/react/hooks` mendarat di `contoh.com/kelas/react/hooks` dan bukan di beranda. `permanent: true` menerbitkan status `308` — pemberitahuan kepada mesin pencari dan browser bahwa perpindahan ini tetap, sehingga tautan lama diteruskan bobot SEO-nya. Pakai `false` (status `307`) selama masih ragu, karena redirect permanen ikut disimpan browser dan sulit ditarik kembali.',
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
      p(
        'Dua `curl` pertama memeriksa dua hal berbeda. `curl -sI https://...  | head -1` menampilkan baris status untuk memastikan HTTPS-nya menjawab sama sekali; `curl -sI http://... | grep -i location` memastikan versi HTTP-nya **mengalihkan** ke HTTPS, bukan melayani situs apa adanya tanpa enkripsi. Situs yang bisa diakses lewat kedua protokol tanpa pengalihan adalah situs yang sebagian pengunjungnya tetap tidak terenkripsi.',
      ),
      p(
        "Perintah `openssl` terakhir menjawab pertanyaan yang tidak terlihat dari browser: **kapan sertifikatnya kedaluwarsa**. `s_client -connect` membuka koneksi TLS, `-servername` mengirim nama domain lewat SNI (wajib karena satu IP biasanya melayani banyak domain), lalu `x509 -noout -dates` mencetak tanggal `notBefore` dan `notAfter`. Sertifikat Let's Encrypt berumur 90 hari dan biasanya diperbarui otomatis — perintah ini yang membuktikan pembaruannya memang berjalan.",
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
      p(
        'Header `Strict-Transport-Security` memberi tahu browser: "untuk domain ini, **jangan pernah** pakai HTTP lagi". Setelah menerimanya sekali, browser mengubah sendiri setiap tautan `http://` ke `https://` sebelum permintaan dikirim — sehingga tidak ada lagi permintaan tak terenkripsi yang bisa disadap atau dibelokkan, bahkan pada kunjungan pertama di jaringan yang tidak dipercaya.',
      ),
      p(
        'Angka `31536000` adalah satu tahun dalam detik, dan itulah yang membuat header ini sulit dibatalkan: browser mengingatnya selama itu, dan mematikan header tidak menghapus yang sudah tersimpan. `includeSubDomains` memperluasnya ke **semua** subdomain — termasuk yang belum kamu buat, sehingga subdomain internal yang nanti dipasang tanpa sertifikat akan langsung tidak bisa dibuka. Mulai dari `max-age=300` selama beberapa hari, naikkan setelah yakin seluruh subdomain sudah HTTPS.',
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
      p(
        'Tiga baris di potongan pertama adalah pengaturan **setingkat rute**, dan ketiganya saling meniadakan sehingga hanya satu yang boleh dipakai per berkas. `force-static` membangun halaman sekali saat build lalu tidak pernah lagi, `revalidate = 3600` membangunnya ulang di latar belakang paling cepat sejam sekali sebagai ISR, sedangkan `force-dynamic` melewati cache sepenuhnya dan merender di setiap permintaan.',
      ),
      p(
        "Potongan kedua bekerja **setingkat pemanggilan**, yang lebih halus dan biasanya itulah yang kamu butuhkan. `next: { revalidate: 60 }` menetapkan umur cache untuk satu permintaan data saja, `next: { tags: ['artikel'] }` memberinya label sehingga bisa dibuang berdasarkan peristiwa alih-alih waktu, sedangkan `cache: 'no-store'` mematikan cache untuk data yang harus selalu segar, misalnya saldo atau notifikasi.",
      ),
      p(
        'Perbedaan `revalidate` dan `tags` layak dipahami sejak awal karena keduanya menjawab pertanyaan berbeda. `revalidate` cocok untuk data yang berubah tak terduga tetapi boleh terlambat sedikit — kamu memilih seberapa basi yang bisa diterima. `tags` cocok saat kamu **tahu persis kapan** datanya berubah, karena kamu sendiri yang mengubahnya; pemakaiannya ada di potongan berikutnya.',
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
      p(
        "Tiga baris revalidasi di potongan pertama punya jangkauan yang menaik. `revalidateTag('artikel')` membuang setiap hasil `fetch` yang diberi tag itu, di rute mana pun ia dipakai — inilah pasangan dari `next: { tags: [...] }` di atas. `revalidatePath('/artikel')` membuang satu rute. `revalidatePath('/', 'layout')` yang paling luas: argumen kedua `'layout'` membuatnya berlaku untuk rute itu **beserta seluruh turunannya**, jadi praktis membuang hampir semua cache halaman.",
      ),
      p(
        'Perhatikan urutannya: `await api.terbitkan(id)` selesai lebih dulu, baru cache dibuang. Membalik urutan itu menciptakan balapan — cache dibuang, permintaan berikutnya mengambil data yang **belum** berubah, lalu menyimpannya kembali sebagai versi baru yang tetap basi.',
      ),
      p(
        'Di potongan kedua, yang menentukan keamanannya adalah `await req.text()` sebelum verifikasi. Tanda tangan HMAC dihitung dari **byte mentah** yang dikirim pengirim; kalau body sudah diurai menjadi JSON lalu dirangkai ulang, perbedaan spasi atau urutan kunci sudah cukup membuat tanda tangannya tidak cocok. Fungsi `verifikasiHmac` juga wajib memakai perbandingan waktu-konstan agar penyerang tidak bisa menebak tanda tangan dari selisih waktu respons.',
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
      p(
        'Dua header itu menutup dua celah berbeda. `Cache-Control: private, no-store` menyatakan dua hal: `private` melarang cache **bersama** (CDN, proxy perusahaan) menyimpannya, sementara `no-store` melarang penyimpanan sama sekali — termasuk di disk browser pengguna itu sendiri.',
      ),
      p(
        '`Vary: Authorization` menjawab masalah yang lebih halus, sebab ia memberi tahu cache bahwa isi respons **bergantung** pada nilai header `Authorization`, sehingga jawaban untuk satu token tidak boleh dipakai untuk token lain. Tanpa itu, cache menganggap semua permintaan ke URL yang sama setara, dan itulah mekanisme persis di balik insiden "pengguna A melihat data pengguna B". Untuk data privat, pasang keduanya dan jangan mengandalkan satu saja.',
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
      p(
        'Perintah ini menjawab pertanyaan yang tidak bisa dijawab kode: apakah aturan cache yang kamu tulis **benar-benar berlaku**. `curl -sI` mengambil hanya headernya, lalu `grep -iE` menyaring lima yang menentukan — `cache-control` (aturan yang kamu kirim), `x-vercel-cache` atau `cf-cache-status` (keputusan CDN-nya), `age` (sudah berapa detik salinan ini tersimpan), dan `etag` (penanda versi isi).',
      ),
      p(
        'Cara membacanya, `MISS` pada permintaan pertama itu normal, tetapi `MISS` yang **selalu** muncul berarti ada yang membatalkan cache, biasanya cookie yang ikut terkirim atau header `Cache-Control` yang lebih ketat dari yang kamu kira. Nilai `age` yang tidak pernah bertambah adalah gejala yang sama. `STALE` justru pertanda sehat pada ISR, sebab pengunjung mendapat halaman lama seketika sementara versi barunya dibangun di latar belakang.',
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
