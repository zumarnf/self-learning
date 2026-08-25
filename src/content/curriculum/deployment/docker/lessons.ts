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
        'Container membungkus aplikasi bersama seluruh yang ia butuhkan, mulai dari runtime, library sistem, sampai konfigurasi, menjadi satu artefak yang berjalan sama di mana pun.',
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
      p(
        'Berkas ini punya tiga `FROM`, dan itulah yang disebut **multi-stage**, sebab tiap `FROM` memulai image baru dari nol, dan hanya tahap terakhir yang benar-benar dikirim. Tahap `deps` dan `builder` boleh berisi apa saja, entah compiler, devDependencies, atau berkas sumber, karena semuanya ditinggalkan. Yang ikut ke tahap `runner` hanya yang disalin eksplisit lewat `COPY --from=`.',
      ),
      p(
        'Perhatikan tahap `deps` menyalin **hanya** `package.json` dan `package-lock.json` sebelum menjalankan `npm ci`. Docker menyimpan hasil tiap baris sebagai layer dan memakainya ulang selama masukannya tidak berubah; kalau `COPY . .` diletakkan di atas `npm ci`, satu perubahan huruf di README sudah membatalkan cache dan memasang ulang seluruh dependency. Perbandingan di bawah menunjukkan selisihnya secara konkret.',
      ),
      p(
        'Dua baris di tahap `runner` menutup dua risiko berbeda. `RUN addgroup … && adduser …` diikuti `USER nextjs` membuat proses berjalan sebagai pengguna biasa, bukan root — dan `--chown=nextjs:nodejs` pada tiap `COPY` memastikan berkasnya memang bisa dibaca pengguna itu. Sementara `ENV NODE_ENV=production` memberi tahu Next.js dan library lain untuk mematikan mode pengembangan; melewatkannya membuat image produksi berjalan dengan perilaku dev yang lebih lambat dan lebih cerewet.',
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
      p(
        'Kedua kolom memasang dependency yang sama persis; yang berbeda hanya **urutan dua baris**. Di kiri, `COPY . .` mendahului `RUN npm ci`, sehingga masukan layer itu adalah seluruh isi repositori — berubah satu berkas apa pun, layernya batal dan `npm ci` berjalan lagi. Di kanan, masukan layer `npm ci` hanya `package*.json`, yang jarang berubah.',
      ),
      p(
        'Angka 3 menit versus 20 detik itu adalah selisih per build, dan build terjadi setiap kali kamu push. Yang perlu diingat sebagai aturan umum: **letakkan yang paling jarang berubah di atas, yang paling sering berubah di bawah**. Docker membatalkan cache secara berantai — begitu satu layer batal, semua layer di bawahnya ikut dibangun ulang, sehingga urutan menentukan berapa banyak pekerjaan yang terbuang.',
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
      p(
        'Polanya sama dengan versi Node, dengan istilah PHP. `COPY composer.json composer.lock ./` lalu `composer install` mendahului `COPY . .` untuk alasan cache yang identik. Flag `--no-scripts --no-autoloader` di baris itu penting: tanpa keduanya, Composer mencoba membangun autoloader padahal kode aplikasinya **belum** disalin — karena itu `composer dump-autoload --optimize` dijalankan terpisah setelah `COPY . .`.',
      ),
      p(
        'Baris `docker-php-ext-install pdo_pgsql intl opcache` memasang ekstensi yang tidak ikut di image dasar. `pdo_pgsql` dibutuhkan untuk berbicara dengan PostgreSQL, `intl` untuk format tanggal dan angka per-lokal, dan `opcache` menyimpan bytecode PHP di memori — tanpa yang terakhir, setiap permintaan mengurai ulang seluruh berkas PHP, dan bedanya terasa besar di produksi.',
      ),
      p(
        '`chown -R www-data:www-data storage bootstrap/cache` hanya menyentuh **dua** direktori, bukan seluruh `/var/www`. Itu disengaja: hanya kedua folder itu yang benar-benar ditulis Laravel saat berjalan (log, cache, sesi, berkas terkompilasi). Sisanya tetap milik root dan hanya bisa dibaca — sehingga celah yang memungkinkan penulisan berkas tidak bisa menimpa kode aplikasimu sendiri.',
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
      p(
        'Kedua potongan itu satu pasangan: baris pertama di dalam `Dockerfile`, baris kedua adalah perintah yang menjalankannya. `--mount=type=secret,id=npmrc` memasang berkas rahasia ke `/root/.npmrc` **hanya selama** perintah `npm ci` berjalan, lalu melepasnya. Karena ia tidak pernah menjadi bagian dari sistem berkas layer, ia juga tidak ikut tersimpan di image.',
      ),
      p(
        'Bandingkan dengan cara yang salah tetapi sering dipakai, yaitu `COPY .npmrc ./` lalu `RUN rm .npmrc`. Perintah `rm` itu membuat layer baru yang menyembunyikan berkasnya, tetapi layer sebelumnya yang berisi berkas utuh tetap ada di image dan bisa diekstrak. Nilai `id=npmrc` di kedua sisi harus sama persis, sebab itulah yang memasangkan mount di `Dockerfile` dengan berkas yang disebut `src=` di perintah build.',
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
      p(
        'Berkas ini dikelompokkan menurut **alasan**, bukan menurut abjad. Kelompok pertama (`node_modules`, `vendor`, `.next`, `dist`, `build`) adalah hasil build yang akan dibuat ulang di dalam image — menyalinnya bukan hanya sia-sia, tapi berbahaya: `node_modules` dari laptop bisa memuat binary yang dikompilasi untuk sistem operasi lain.',
      ),
      p(
        'Kelompok kedua adalah yang benar-benar soal keamanan. `.env` dan `.env.*` menutup berkas rahasia, sementara `!.env.example` adalah **pengecualian** — tanda seru membalikkan aturan di atasnya, sehingga berkas contoh yang isinya placeholder tetap ikut. `*.pem` dan `*.key` menutup kunci privat dan sertifikat, yang sering tergeletak di direktori project tanpa disadari.',
      ),
      p(
        'Yang paling mudah terlewat adalah `.git`. Direktori itu memuat **seluruh riwayat** repositori — termasuk commit lama yang mungkin masih menyimpan kredensial yang sudah kamu hapus dari kode. Menghapusnya dari kode saat ini tidak menghapusnya dari riwayat, dan riwayat itulah yang ikut tersalin kalau `.git` tidak diabaikan.',
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
      p(
        'Empat perintah pertama menjawab pertanyaan yang berbeda. `docker images app` memberi total ukurannya, sedangkan `docker history app` memecahnya **per layer** sehingga kamu bisa melihat instruksi mana yang menyumbang paling banyak, biasanya satu `COPY` atau satu `RUN apk add` yang tidak dibersihkan. `docker run --rm -it app sh` membuka shell di dalam container sehingga isinya bisa ditelusuri langsung, dan `--rm` membuat container itu terhapus begitu kamu keluar.',
      ),
      p(
        'Perintah terakhir, yaitu `sh -c "ls -la /app | grep -E \'\\.env|\\.git\'"`, adalah pemeriksaan yang layak dijalankan sekali setelah `.dockerignore` dibuat. Ia tidak menghasilkan apa-apa kalau semuanya benar, dan itulah hasil yang diinginkan. `dive` melakukan hal yang sama dengan `docker history` tetapi interaktif, sebab kamu bisa menyorot satu layer dan melihat persis berkas apa yang ia tambahkan.',
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
      p(
        'Blok "SALAH" memakai tiga `RUN`, dan itu berarti tiga layer. `rm -rf /var/cache/apk/*` di baris ketiga hanya menandai berkas cache sebagai terhapus di layer ketiga — isinya tetap tersimpan utuh di layer pertama dan kedua, dan ikut terbawa setiap kali image ditarik. Ukuran image tidak berkurang sedikit pun.',
      ),
      p(
        'Blok "BENAR" menggabungkannya menjadi satu `RUN`, sehingga pemasangan dan pembersihan terjadi **di dalam layer yang sama** — yang tersimpan hanya hasil akhirnya. Di contoh ini flag `--no-cache` bahkan membuat `rm` tidak diperlukan: ia menyuruh `apk` tidak menulis cache sama sekali. Prinsip yang sama berlaku untuk `apt-get`, yang padanannya adalah `rm -rf /var/lib/apt/lists/*` di baris yang sama.',
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
      p(
        "Empat layanan di berkas ini otomatis berada dalam satu jaringan, dan **nama layanan menjadi nama host**. Itulah sebabnya `DATABASE_URL` menyebut `@db:5432` dan bukan `localhost` — dari sudut pandang container `app`, `localhost` adalah dirinya sendiri. Perhatikan porta `5432` di URL itu adalah porta **di dalam** jaringan Docker, terpisah dari `ports: ['5432:5432']` yang hanya membuka akses dari laptopmu.",
      ),
      p(
        'Blok `volumes` di layanan `app` memuat dua baris yang bekerja berlawanan dengan sengaja. `.:/app` menautkan direktori kerja ke dalam container sehingga suntinganmu langsung terlihat tanpa build ulang. Baris `/app/node_modules` di bawahnya adalah **volume anonim** yang menutupi kembali satu subdirektori itu — tanpanya, `node_modules` milik laptop akan menimpa milik container, dan modul native yang dikompilasi untuk sistem operasi berbeda akan gagal dengan pesan yang membingungkan.',
      ),
      p(
        'Bandingkan `depends_on` di `app`: `db` memakai `condition: service_healthy`, sedangkan `cache` cukup `service_started`. Bedanya nyata — Postgres butuh beberapa detik setelah containernya menyala sebelum benar-benar menerima koneksi, dan `healthcheck` dengan `pg_isready` itulah yang mengubah "sudah menyala" menjadi "sudah siap". Redis menyala hampir seketika, sehingga menunggu status sehat tidak sepadan.',
      ),
      p(
        'Volume bernama `data-db` di bagian bawah adalah yang membuat data database **bertahan**. Tanpa baris `- data-db:/var/lib/postgresql/data`, seluruh isi database hilang setiap kali container dibuat ulang — yang terjadi setiap kali kamu mengubah image atau menjalankan `docker compose down`. Perhatikan `worker` memakai `build` dan `environment` yang sama dengan `app` tetapi mengganti `command` menjadi `npm run worker`: satu image, dua peran.',
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
      p(
        'Flag `-d` pada `up` menjalankan semuanya di latar belakang sehingga terminalmu bebas; tanpanya, log semua layanan tercampur di satu layar dan `Ctrl+C` menghentikan seluruh sistem. Karena itu `logs -f app` menjadi pasangannya — ia mengikuti log **satu** layanan saja, yang jauh lebih terbaca saat mendiagnosis masalah.',
      ),
      p(
        '`exec` menjalankan perintah di dalam container yang **sedang berjalan**, berbeda dari `run` yang membuat container baru. Itu sebabnya `docker compose exec db psql -U app app_dev` memberimu psql yang tersambung ke database yang sedang dipakai aplikasi, tanpa perlu memasang klien Postgres di laptop. Perhatikan perbedaan dua baris terakhir: `down` menghentikan container tetapi volume `data-db` tetap utuh, sementara `-v` menghapusnya beserta seluruh isi database.',
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
      p(
        'Kolom kiri memakai bentuk daftar (`- db`), dan itu artinya Compose hanya menunggu **container** `db` dimulai. Container yang dimulai belum tentu punya Postgres yang menerima koneksi: prosesnya masih memuat konfigurasi, memulihkan WAL, dan membuka soket. Aplikasi yang mencoba connect di detik itu mendapat penolakan koneksi dan mati — dan celakanya, ini balapan yang sering **lolos di laptopmu** lalu gagal di mesin CI yang lebih lambat.',
      ),
      p(
        'Kolom kanan menambahkan dua hal yang saling bergantung: `healthcheck` di layanan `db` yang menjalankan `pg_isready -U app` setiap `interval: 5s` hingga `retries: 10`, dan `condition: service_healthy` di `depends_on` yang menunggu hasilnya. Salah satu tanpa yang lain tidak bekerja — healthcheck tanpa `condition` hanya menjadi status yang tidak dibaca siapa pun. Dengan `interval` 5 detik dan 10 percobaan, batas tunggunya sekitar 50 detik sebelum Compose menyerah.',
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
      p(
        "Instruksi `HEALTHCHECK` membuat Docker menjalankan perintah itu berkala dan menilai **kode keluar**-nya, dengan `0` berarti sehat dan `1` berarti tidak. Itulah yang dilakukan `process.exit(r.statusCode === 200 ? 0 : 1)`, yaitu menerjemahkan status HTTP menjadi kode keluar. Bagian `.on('error', () => process.exit(1))` menangani kasus yang lebih parah, yaitu server tidak menjawab sama sekali, sehingga tidak ada `statusCode` untuk diperiksa.",
      ),
      p(
        'Empat flag di baris pertama menentukan seberapa cepat kegagalan terdeteksi dan seberapa toleran ia terhadap gangguan sesaat. `--interval=30s` adalah jarak antar pemeriksaan, `--timeout=3s` batas sabar satu pemeriksaan, dan `--retries=3` berarti container baru dinyatakan tidak sehat setelah **tiga** kegagalan berurutan — kira-kira 90 detik. Menaikkan `retries` membuatnya lebih tahan gangguan sesaat tetapi memperlambat deteksi; itu trade-off yang harus dipilih sadar.',
      ),
      p(
        'Pemeriksaannya memanggil `localhost:3000` dari **dalam** container, bukan dari luar. Itu tepat untuk pertanyaan yang ingin dijawab, yaitu "apakah proses di dalam sini masih melayani", sekaligus menjadi alasan endpoint yang dituju adalah `/health/live` dan bukan `/health/ready`. Bedanya dibahas tepat di bawah.',
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
      p(
        '`/health/live` sengaja hanya mengembalikan `{ status: \'ok\' }` tanpa menyentuh apa pun. Itu bukan kemalasan: satu-satunya hal yang boleh membuatnya gagal adalah proses Node yang benar-benar tidak lagi bisa menjawab. Begitu ia memanggil database, ia berhenti menjawab "prosesku hidup" dan mulai menjawab "seluruh sistem sehat" — dua pertanyaan yang akibatnya sangat berbeda, seperti dijelaskan peringatan di bawah.',
      ),
      p(
        'Di `/health/ready`, tiap `try` dibungkus terpisah dan `catch`-nya sengaja **dibiarkan kosong**, sebab kegagalan Redis tidak boleh menghentikan pemeriksaan database. Baris kuncinya adalah `const siap = cek.db;`, karena hanya database yang menentukan kesiapan, sementara status Redis tetap dilaporkan di dalam objek `cek` untuk keperluan diagnosis. Kalau Redis dipakai untuk cache, aplikasi masih bisa melayani meski lebih lambat tanpanya, sedangkan kalau ia dipakai untuk sesi, baris itu harus berubah menjadi `cek.db && cek.redis`.',
      ),
      p(
        'Status `503` yang dikembalikan saat belum siap bukan pilihan sembarangan. `503 Service Unavailable` adalah sinyal baku yang dimengerti load balancer dan orkestrator sebagai "jangan kirim trafik ke sini dulu" — berbeda dari `500`, yang mereka baca sebagai instance yang sedang bermasalah menangani permintaan tertentu.',
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
      p(
        'Urutan di dalam `server.close()` menentukan apakah shutdown-nya benar-benar bersih. `server.close()` berhenti menerima **koneksi baru** tetapi membiarkan permintaan yang sedang diproses selesai, dan baru setelah itu `pool.end()` serta `redis.quit()` menutup koneksi keluar. Membalik urutannya dengan menutup pool lebih dulu membuat permintaan yang belum selesai gagal di tengah jalan, persis hal yang ingin dihindari.',
      ),
      p(
        '`setTimeout(() => process.exit(1), 15_000).unref()` adalah jaring pengaman untuk kasus `server.close()` tidak pernah selesai, misalnya karena ada koneksi yang menggantung. `.unref()` di ujungnya penting: ia memberi tahu Node bahwa timer ini tidak perlu menahan proses tetap hidup, sehingga kalau shutdown-nya lancar, prosesnya keluar tanpa menunggu 15 detik itu habis.',
      ),
      p(
        'Angka 15 detik itu harus **lebih pendek** dari tenggang yang diberikan platformmu sebelum mengirim `SIGKILL` (bawaan Docker 10 detik, dan bisa dinaikkan dengan `--stop-timeout`). Kalau lebih panjang, jaring pengamannya tidak pernah sempat bekerja. `docker run --init` di potongan kedua menyisipkan proses init kecil sebagai PID 1 yang meneruskan sinyal dan memungut proses zombie — berguna saat aplikasinya memanggil subproses atau tidak dirancang menjadi PID 1.',
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
      p(
        "`limits` dan `reservations` menjawab dua hal berbeda. `limits` adalah **batas atas keras**: container yang melewati `memory: 512M` dimatikan oleh kernel (OOM kill), dan yang melewati `cpus: '1.0'` diperlambat, bukan dimatikan. `reservations: memory: 256M` adalah jaminan minimum yang dipakai penjadwal untuk memutuskan apakah host masih muat menampung container ini.",
      ),
      p(
        'Batas memori bukan sekadar pengaman untuk container itu sendiri — ia mencegah satu layanan yang bocor memori menghabiskan RAM host dan menjatuhkan **semua** layanan lain di mesin yang sama. Peringatan di bawah menjelaskan jebakan khas Node: batas dari Docker saja tidak cukup, karena V8 menyetel ukuran heap-nya dari memori host, bukan dari batas container.',
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
      p(
        '`read_only: true` membuat seluruh sistem berkas container tidak bisa ditulis — dan karena itu `tmpfs: - /tmp` harus menyertainya. Banyak library menulis berkas sementara ke `/tmp`; `tmpfs` memberi mereka satu direktori tulis yang berada **di memori** dan lenyap saat container berhenti. Kalau aplikasimu perlu menulis di tempat lain (misalnya `storage/` pada Laravel), direktori itu harus dipasang sebagai volume tersendiri.',
      ),
      p(
        'Dua baris terakhir bekerja di lapisan kernel. `no-new-privileges:true` mencegah proses di dalam container menaikkan haknya lewat binary `setuid` — jalur klasik dari eksekusi kode biasa menuju root. `cap_drop: - ALL` mencabut seluruh Linux capability; aplikasi web tidak butuh satu pun dari daftar itu, dan kalau ada yang benar-benar diperlukan (misalnya `NET_BIND_SERVICE` untuk mendengarkan porta di bawah 1024), ia bisa dikembalikan satu per satu lewat `cap_add`.',
      ),
      callout(
        'tip',
        'Empat baris terakhir menutup banyak jalur eskalasi sekaligus',
        'Sistem berkas read-only mencegah penyerang menulis berkas; `no-new-privileges` mencegah eskalasi lewat binary setuid; `cap_drop: ALL` mencabut kemampuan kernel yang hampir tidak pernah dibutuhkan aplikasi web. Semuanya murah dipasang.',
      ),
    ],
  ),
];
