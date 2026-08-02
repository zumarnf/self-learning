import { callout, code, compare, h2, ol, p, table, ul } from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Deployment — Chapter 5, all five lessons.
 *
 * Container as a packaging decision, not as a default. The chapter is explicit that Docker adds a
 * layer to learn and operate, and says where it does not pay off — a reader who containerizes a
 * single-VPS side project has usually made their life harder.
 */
export const lessons: LessonDraft[] = [
  written(
    'kenapa-container',
    'Kenapa Container',
    9,
    'Masalah yang ia selesaikan, dan biaya yang ia tambahkan.',
    [
      p(
        'Container membungkus aplikasi bersama seluruh yang ia butuhkan — runtime, library sistem, konfigurasi — menjadi satu artefak yang berjalan sama di mana pun.',
      ),

      h2('Masalah yang ia selesaikan'),
      table(
        ['Masalah', 'Bagaimana container menutupnya'],
        [
          ['"Jalan di laptopku"', 'Lingkungan yang sama persis di mana-mana'],
          ['Setup server berjam-jam', 'Satu perintah `docker run`'],
          ['Dua aplikasi butuh versi Node berbeda', 'Masing-masing punya container sendiri'],
          ['Rollback yang rumit', 'Jalankan image versi sebelumnya'],
          ['Onboarding anggota baru', '`docker compose up` — selesai'],
        ],
      ),

      h2('Biaya yang ia tambahkan'),
      ul(
        'Satu lapisan lagi yang harus dipahami saat mendiagnosis masalah.',
        'Ukuran image dan waktu build yang harus dikelola.',
        'Image dasar juga punya kerentanan yang perlu diperbarui.',
        'Jaringan, volume, dan izin berkas jadi hal yang perlu dipikirkan.',
        'Untuk produksi berskala, biasanya menyeret orkestrator — dan itu lapisan lagi.',
      ),
      callout(
        'warning',
        'Container bukan default yang benar untuk semua project',
        'Untuk satu aplikasi di satu VPS yang di-deploy dengan `git pull` dan `pm2 reload`, Docker menambah kerumitan tanpa menyelesaikan masalah yang kamu punya. Ia berbayar saat ada beberapa layanan, beberapa lingkungan, atau beberapa orang yang harus menjalankan hal yang sama.',
      ),

      h2('Di mana ia paling berbayar'),
      ol(
        '**Pengembangan lokal** — `docker compose up` memberi database, cache, dan antrean tanpa memasang apa pun di laptop. Ini manfaat terbesar dan paling sering diremehkan.',
        '**CI** — pipeline berjalan di lingkungan yang identik dengan produksi.',
        '**Beberapa layanan** — frontend, backend, worker, database, Redis dalam satu definisi.',
        '**Deploy yang bisa diulang** — image yang sama yang diuji adalah image yang berjalan.',
      ),

      h2('Istilah'),
      table(
        ['Istilah', 'Artinya'],
        [
          ['**Image**', 'Cetakan yang tidak berubah — hasil build'],
          ['**Container**', 'Instance image yang sedang berjalan'],
          ['**Layer**', 'Satu langkah di Dockerfile; di-cache dan dipakai ulang'],
          ['**Volume**', 'Penyimpanan yang bertahan setelah container dihapus'],
          ['**Registry**', 'Tempat menyimpan dan mengambil image'],
        ],
      ),
      callout(
        'danger',
        'Container bersifat sementara — apa pun di dalamnya hilang saat ia diganti',
        'Berkas yang ditulis ke sistem berkas container lenyap saat container dibuat ulang, dan itu terjadi setiap deploy. Unggahan pengguna, log, dan data database **wajib** berada di volume atau di layanan eksternal.',
      ),
    ],
  ),

  written(
    'dockerfile',
    'Dockerfile untuk Node & PHP',
    13,
    'Membangun image yang kecil, cepat, dan tidak berjalan sebagai root.',
    [
      h2('Node — multi-stage'),
      code(
        'text',
        `
        # syntax=docker/dockerfile:1

        # --- Tahap 1: dependency ---
        FROM node:22-alpine AS deps
        WORKDIR /app

        # Salin HANYA manifest dulu. Lapisan ini di-cache dan tidak
        # dibangun ulang selama dependency tidak berubah.
        COPY package.json package-lock.json ./
        RUN npm ci

        # --- Tahap 2: build ---
        FROM node:22-alpine AS builder
        WORKDIR /app
        COPY --from=deps /app/node_modules ./node_modules
        COPY . .
        RUN npm run build

        # --- Tahap 3: runtime ---
        FROM node:22-alpine AS runner
        WORKDIR /app
        ENV NODE_ENV=production

        # JANGAN berjalan sebagai root
        RUN addgroup -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

        # Salin hanya yang dibutuhkan untuk berjalan
        COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
        COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
        COPY --from=builder --chown=nextjs:nodejs /app/public ./public

        USER nextjs
        EXPOSE 3000

        # Bentuk exec (array) — supaya proses menerima SIGTERM langsung
        CMD ["node", "server.js"]
        `,
        { filename: 'Dockerfile' },
      ),
      callout(
        'danger',
        'Container yang berjalan sebagai root memperbesar dampak setiap kerentanan',
        'Kalau ada celah yang memungkinkan eksekusi kode, ia berjalan sebagai root di dalam container — dan dari sana jalan menuju host jauh lebih pendek. Membuat user non-root itu tiga baris, dan ia menutup seluruh kategori eskalasi.',
      ),
      callout(
        'warning',
        'Pakai `CMD ["node", "server.js"]`, bukan `CMD node server.js`',
        'Bentuk string menjalankan perintah lewat shell, dan shell itu yang menjadi PID 1 — sehingga `SIGTERM` tidak sampai ke aplikasimu. Akibatnya: graceful shutdown tidak pernah berjalan, dan setiap deploy memutus permintaan yang sedang diproses.',
      ),

      h2('Urutan `COPY` menentukan kecepatan build'),
      compare(
        {
          title: 'Cache selalu batal',
          lang: 'text',
          code: `
          COPY . .
          RUN npm ci

          Satu perubahan di README
          -> npm ci dijalankan ulang
          -> build 3 menit setiap kali
          `,
          notes: ['Layer dependency ikut batal setiap perubahan apa pun'],
        },
        {
          title: 'Cache bertahan',
          lang: 'text',
          code: `
          COPY package*.json ./
          RUN npm ci
          COPY . .

          Perubahan kode tidak membatalkan
          layer npm ci.
          -> build 20 detik
          `,
          notes: ['Dependency hanya dipasang ulang saat manifest berubah'],
        },
      ),

      h2('PHP / Laravel'),
      code(
        'text',
        `
        FROM php:8.3-fpm-alpine AS base

        RUN apk add --no-cache postgresql-dev icu-dev \\
            && docker-php-ext-install pdo_pgsql intl opcache

        COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

        WORKDIR /var/www

        # Dependency dulu — untuk cache layer
        COPY composer.json composer.lock ./
        RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

        COPY . .
        RUN composer dump-autoload --optimize --no-dev

        # Izin hanya untuk yang perlu ditulis
        RUN chown -R www-data:www-data storage bootstrap/cache

        USER www-data
        EXPOSE 9000
        CMD ["php-fpm"]
        `,
      ),
      callout(
        'danger',
        'Jangan pernah menyalin `.env` ke dalam image',
        'Layer image bersifat permanen — menghapus berkasnya di layer berikutnya **tidak** menghapusnya dari image, dan ia bisa diekstrak siapa pun yang bisa menarik image itu. Rahasia disuntikkan saat runtime lewat environment atau secrets manager.',
      ),

      h2('Rahasia saat build'),
      code(
        'text',
        `
        # Kalau build benar-benar butuh rahasia (misalnya registry privat),
        # pakai secret mount — ia TIDAK tersimpan di layer.
        RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
        `,
      ),
      code(
        'bash',
        `
        docker build --secret id=npmrc,src=$HOME/.npmrc -t app .
        `,
      ),

      h2('Image dasar'),
      table(
        ['Image', 'Ukuran', 'Catatan'],
        [
          ['`node:22`', '~1 GB', 'Lengkap; jarang diperlukan'],
          ['`node:22-slim`', '~200 MB', 'Debian minimal — kompatibilitas baik'],
          ['`node:22-alpine`', '~130 MB', 'Terkecil; memakai musl, bukan glibc'],
          [
            '`gcr.io/distroless/nodejs22`',
            '~110 MB',
            'Tanpa shell — paling aman, paling sulit di-debug',
          ],
        ],
      ),
      callout(
        'warning',
        'Alpine memakai musl libc, bukan glibc',
        'Sebagian native module (termasuk beberapa versi `sharp` dan binary Prisma) berperilaku berbeda atau butuh build khusus. Kalau kamu menemui error native yang aneh di Alpine tapi tidak di laptop, ini penyebab pertama yang perlu dicurigai — `slim` sering menyelesaikannya.',
      ),
      callout(
        'tip',
        'Pin image dasar ke digest, bukan ke tag',
        'Tag seperti `node:22-alpine` berpindah ke image baru setiap ada pembaruan. Untuk build yang benar-benar bisa diulang, pakai `node:22-alpine@sha256:...`. Ini juga bagian dari integritas rantai pasok.',
      ),
    ],
  ),

  written(
    'dockerignore',
    '`.dockerignore` & Ukuran Image',
    10,
    'Yang tidak ikut sama pentingnya dengan yang ikut.',
    [
      h2('`.dockerignore`'),
      code(
        'text',
        `
        node_modules
        vendor
        .next
        dist
        build

        .git
        .github

        .env
        .env.*
        !.env.example
        *.pem
        *.key

        **/*.test.ts
        coverage
        .vscode
        .idea
        *.log
        README.md
        `,
        { filename: '.dockerignore' },
      ),
      callout(
        'danger',
        'Tanpa `.dockerignore`, `.env` dan `.git` ikut masuk ke image',
        '`COPY . .` menyalin **semuanya** — termasuk berkas rahasia dan seluruh riwayat git. Riwayat itu bisa memuat kredensial yang sudah lama dihapus dari kode tapi masih ada di commit lama. Siapa pun yang bisa menarik image itu bisa membacanya.',
      ),
      callout(
        'warning',
        '`.gitignore` tidak otomatis berlaku untuk Docker',
        'Keduanya berkas terpisah dengan aturan sendiri. Project yang punya `.gitignore` rapi tapi tidak punya `.dockerignore` tetap menyalin `node_modules` dan `.env` ke dalam build context.',
      ),

      h2('Build context'),
      code(
        'bash',
        `
        docker build -t app .
        # => Sending build context to Docker daemon  1.2GB

        # Setelah .dockerignore:
        # => Sending build context to Docker daemon  3.4MB
        `,
      ),
      p(
        'Seluruh direktori dikirim ke daemon sebelum satu instruksi pun berjalan. `node_modules` yang ikut membuat setiap build lambat, bahkan kalau nanti ditimpa.',
      ),

      h2('Memeriksa apa yang ada di dalam image'),
      code(
        'bash',
        `
        docker images app                     # ukurannya
        docker history app                    # ukuran per layer

        # Telusuri isinya
        docker run --rm -it app sh
        ls -la

        # Cari rahasia yang tidak sengaja ikut
        docker run --rm app sh -c "ls -la /app | grep -E '\\.env|\\.git'"
        `,
      ),
      code(
        'bash',
        `
        # dive: penjelajah layer interaktif
        dive app:latest
        `,
      ),

      h2('Memperkecil'),
      ol(
        '**Multi-stage build** — perkakas build tidak ikut ke image runtime.',
        '**Image dasar minimal** — `alpine` atau `slim`.',
        '**`npm ci --omit=dev`** — devDependency tidak dibutuhkan saat berjalan.',
        '**`output: standalone`** di Next.js — hanya menyertakan yang benar-benar dipakai.',
        '**Gabungkan `RUN`** yang berhubungan, dan bersihkan cache di baris yang sama.',
      ),
      code(
        'text',
        `
        # SALAH: cache apk tersimpan permanen di layer pertama
        RUN apk add --no-cache curl
        RUN apk add --no-cache git
        RUN rm -rf /var/cache/apk/*

        # BENAR: satu layer, dibersihkan di dalamnya
        RUN apk add --no-cache curl git
        `,
      ),
      callout(
        'tip',
        'Menghapus di layer berikutnya tidak mengurangi ukuran',
        'Setiap instruksi membuat layer baru, dan layer sebelumnya tetap ada di image. Berkas yang "dihapus" masih menempati ruang dan masih bisa diekstrak. Bersihkan di **baris yang sama** dengan yang membuatnya.',
      ),

      h2('Memindai kerentanan'),
      code(
        'bash',
        `
        docker scout cves app:latest
        trivy image app:latest
        `,
      ),
      p(
        'Image dasar juga punya kerentanan sistem operasi. Perbarui secara berkala — image yang dibangun enam bulan lalu hampir pasti memuat paket sistem yang sudah punya CVE.',
      ),
    ],
  ),

  written(
    'compose',
    'Docker Compose untuk Pengembangan Lokal',
    12,
    'Seluruh lingkungan dengan satu perintah.',
    [
      p(
        'Ini manfaat Docker yang paling besar dan paling sering diremehkan: anggota baru bisa menjalankan seluruh sistem tanpa memasang Postgres, Redis, atau versi Node tertentu di laptopnya.',
      ),

      h2('Compose lengkap'),
      code(
        'yaml',
        `
        services:
          app:
            build:
              context: .
              target: dev
            ports: ['3000:3000']
            environment:
              DATABASE_URL: postgresql://app:rahasia@db:5432/app_dev
              REDIS_URL: redis://cache:6379
            volumes:
              # Kode di-mount supaya perubahan langsung terlihat
              - .:/app
              # Volume anonim: JANGAN timpa node_modules milik container
              - /app/node_modules
            depends_on:
              db:
                condition: service_healthy
              cache:
                condition: service_started

          db:
            image: postgres:17-alpine
            environment:
              POSTGRES_USER: app
              POSTGRES_PASSWORD: rahasia
              POSTGRES_DB: app_dev
            ports: ['5432:5432']
            volumes:
              - data-db:/var/lib/postgresql/data
            healthcheck:
              test: ['CMD-SHELL', 'pg_isready -U app']
              interval: 5s
              retries: 10

          cache:
            image: redis:7-alpine
            ports: ['6379:6379']

          worker:
            build: { context: ., target: dev }
            command: npm run worker
            environment:
              DATABASE_URL: postgresql://app:rahasia@db:5432/app_dev
              REDIS_URL: redis://cache:6379
            volumes:
              - .:/app
              - /app/node_modules
            depends_on:
              db: { condition: service_healthy }

        volumes:
          data-db:
        `,
        { filename: 'compose.yaml' },
      ),
      callout(
        'tip',
        'Volume anonim `/app/node_modules` menyelesaikan masalah yang membingungkan',
        'Tanpa itu, mount `.:/app` menimpa `node_modules` di dalam container dengan milik host — yang bisa dibangun untuk sistem operasi berbeda. Gejalanya: modul native gagal dengan error yang tidak masuk akal. Volume anonim membuat container memakai `node_modules`-nya sendiri.',
      ),

      h2('Menjalankan'),
      code(
        'bash',
        `
        docker compose up -d              # jalankan di latar
        docker compose logs -f app        # ikuti log satu layanan
        docker compose exec app sh        # masuk ke container
        docker compose exec db psql -U app app_dev

        docker compose down               # hentikan, volume TETAP ada
        docker compose down -v            # hentikan DAN HAPUS volume
        `,
      ),
      callout(
        'danger',
        '`docker compose down -v` menghapus data database',
        'Bendera `-v` menghapus volume — termasuk seluruh isi database lokalmu. Kalau kamu punya data uji yang butuh waktu menyiapkannya, ia hilang tanpa konfirmasi. Pakai `down` biasa untuk sekadar menghentikan.',
      ),

      h2('`depends_on` saja tidak cukup'),
      compare(
        {
          title: 'Sering gagal',
          lang: 'yaml',
          code: `
          app:
            depends_on:
              - db

          # Hanya menunggu container db DIMULAI,
          # bukan sampai Postgres SIAP menerima
          # koneksi. Aplikasi mencoba connect
          # lalu gagal.
          `,
          notes: ['Balapan saat start'],
        },
        {
          title: 'Benar',
          lang: 'yaml',
          code: `
          db:
            healthcheck:
              test: ['CMD-SHELL', 'pg_isready -U app']
              interval: 5s
              retries: 10

          app:
            depends_on:
              db:
                condition: service_healthy
          `,
          notes: ['Menunggu sampai benar-benar siap'],
        },
      ),

      h2('Compose bukan untuk produksi berskala'),
      callout(
        'warning',
        'Compose tidak punya deploy bergilir, autoscaling, atau failover',
        'Untuk satu server kecil ia bisa diterima. Untuk apa pun yang butuh tersedia terus-menerus, kamu butuh orkestrator — dan itu lapisan kerumitan yang jauh lebih besar. Jangan pindah ke sana sebelum ada masalah nyata yang menuntutnya.',
      ),

      h2('Untuk pengembangan lokal saja'),
      code(
        'yaml',
        `
        # compose.override.yaml — dibaca OTOMATIS, jangan di-commit
        services:
          app:
            environment:
              LOG_LEVEL: debug
            volumes:
              - .:/app
        `,
      ),
      p(
        'Compose menggabungkan `compose.yaml` dengan `compose.override.yaml` secara otomatis. Ini cara memisahkan pengaturan pribadi tanpa mengubah berkas bersama.',
      ),
    ],
  ),

  written(
    'produksi-healthcheck',
    'Menjalankan di Produksi & Healthcheck',
    11,
    'Container yang bisa dipercaya, dan yang tahu kapan dirinya tidak sehat.',
    [
      h2('Healthcheck di image'),
      code(
        'text',
        `
        HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \\
          CMD node -e "require('http').get('http://localhost:3000/health/live', r => \\
            process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
        `,
      ),
      callout(
        'tip',
        '`start-period` mencegah restart beruntun saat boot',
        'Aplikasi yang butuh 15 detik untuk siap akan dinyatakan tidak sehat sebelum sempat menyala — lalu di-restart, lalu gagal lagi. `start-period` memberi tenggang sebelum kegagalan mulai dihitung.',
      ),

      h2('Liveness vs readiness'),
      table(
        ['', 'Liveness', 'Readiness'],
        [
          ['Menjawab', 'Proses masih hidup?', 'Siap menerima trafik?'],
          ['Memeriksa', 'Hampir tidak ada', 'Database, dependensi penting'],
          ['Kalau gagal', '**Restart container**', 'Berhenti dikirimi trafik'],
          ['Harus', 'Sangat ringan', 'Boleh sedikit lebih berat'],
        ],
      ),
      code(
        'js',
        `
        // Liveness — jangan sentuh database di sini
        app.get('/health/live', (req, res) => res.json({ status: 'ok' }));

        // Readiness — periksa dependensi yang menentukan
        app.get('/health/ready', async (req, res) => {
          const cek = { db: false, redis: false };

          try { await pool.query('SELECT 1'); cek.db = true; } catch { /* biarkan false */ }
          try { await redis.ping(); cek.redis = true; } catch { /* biarkan false */ }

          // Redis untuk cache -> boleh mati tanpa membuat layanan tidak siap
          const siap = cek.db;

          res.status(siap ? 200 : 503).json({ status: siap ? 'siap' : 'belum', cek });
        });
        `,
      ),
      callout(
        'danger',
        'Liveness yang memeriksa database membuat gangguan menyebar',
        'Kalau database sesaat tidak terjangkau, **setiap** container dinyatakan mati dan di-restart bersamaan — lalu semuanya mencoba connect sekaligus saat database pulih, dan menjatuhkannya lagi. Liveness harus menjawab "prosesku masih hidup", bukan "seluruh sistem sehat".',
      ),
      callout(
        'danger',
        'Health check yang selalu `200` lebih buruk daripada tidak ada',
        'Ia meyakinkan orchestrator bahwa instance yang rusak masih sehat, sehingga trafik terus dikirim ke sana. Ia juga harus **tidak membocorkan** versi library atau pesan error mentah — endpoint kesehatan sering dibiarkan publik.',
      ),

      h2('Signal handling'),
      code(
        'js',
        `
        // Container menerima SIGTERM, lalu SIGKILL setelah tenggang (default 10 detik).
        for (const sinyal of ['SIGTERM', 'SIGINT']) {
          process.on(sinyal, () => {
            server.close(async () => {
              await pool.end();
              await redis.quit();
              process.exit(0);
            });
            setTimeout(() => process.exit(1), 15_000).unref();
          });
        }
        `,
      ),
      code(
        'text',
        `
        # Kalau prosesmu tidak bisa menangani sinyal dengan benar,
        # init sederhana mengurus reaping dan penerusan sinyal.
        docker run --init app
        `,
      ),

      h2('Batas sumber daya'),
      code(
        'yaml',
        `
        services:
          app:
            deploy:
              resources:
                limits:
                  cpus: '1.0'
                  memory: 512M
                reservations:
                  memory: 256M
        `,
      ),
      callout(
        'warning',
        'Node tidak otomatis tahu batas memori container',
        'Ia melihat memori **host**, lalu menyetel heap V8 berdasarkan itu — dan bisa melebihi batas container, sehingga proses dimatikan OOM tanpa pesan yang jelas. Setel `NODE_OPTIONS=--max-old-space-size=400` untuk batas 512 MB.',
      ),

      h2('Log'),
      code(
        'yaml',
        `
        services:
          app:
            logging:
              driver: json-file
              options:
                max-size: '10m'
                max-file: '3'
        `,
      ),
      p(
        'Tanpa batas, berkas log Docker tumbuh sampai memenuhi disk — dan disk penuh menjatuhkan seluruh host, bukan hanya container itu.',
      ),

      h2('Checklist container produksi'),
      ol(
        'Berjalan sebagai user **non-root**.',
        'Image dasar di-pin ke digest, dan dipindai kerentanan.',
        'Tidak ada rahasia di dalam image — disuntikkan saat runtime.',
        '`CMD` memakai bentuk array supaya `SIGTERM` sampai ke aplikasi.',
        'Healthcheck ada, dan membedakan liveness dari readiness.',
        'Batas memori dan CPU ditetapkan; `NODE_OPTIONS` disesuaikan.',
        'Rotasi log dibatasi.',
        'Data yang harus bertahan ada di volume atau layanan eksternal.',
        'Sistem berkas root **read-only** bila memungkinkan.',
      ),
      code(
        'yaml',
        `
        services:
          app:
            read_only: true
            tmpfs:
              - /tmp
            security_opt:
              - no-new-privileges:true
            cap_drop:
              - ALL
        `,
      ),
      callout(
        'tip',
        'Empat baris terakhir menutup banyak jalur eskalasi sekaligus',
        'Sistem berkas read-only mencegah penyerang menulis berkas; `no-new-privileges` mencegah eskalasi lewat binary setuid; `cap_drop: ALL` mencabut kemampuan kernel yang hampir tidak pernah dibutuhkan aplikasi web. Semuanya murah dipasang.',
      ),
    ],
  ),
];
