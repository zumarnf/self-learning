import {
  callout,
  code,
  compare,
  h2,
  ol,
  p,
  references,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
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
    15,
    'Masalah yang ia selesaikan, dan biaya yang ia tambahkan.',
    [
      p(
        'Container membungkus aplikasi bersama seluruh yang ia butuhkan, mulai dari runtime, library sistem, sampai konfigurasi, menjadi satu artefak yang berjalan sama di mana pun.',
      ),

      terms(
        {
          term: 'container',
          meaning:
            'Proses yang berjalan terpisah dari sisa sistem, dengan sistem berkas, jaringan, dan daftar proses sendiri, tetapi tetap memakai kernel mesin induknya. Perbedaan itulah yang membuatnya ringan. Yang ia selesaikan adalah masalah "di komputer saya jalan", sebab yang dipindahkan bukan hanya kodemu melainkan seluruh lingkungan tempat ia berjalan.',
        },
        {
          term: 'image',
          meaning:
            'Cetakan container yang berisi sistem berkas beserta metadata cara menjalankannya. Sifatnya hanya-baca dan tidak berubah. Satu image bisa menjalankan banyak container sekaligus, seperti satu kelas menghasilkan banyak objek.',
        },
        {
          term: 'layer (lapisan)',
          meaning:
            'Potongan perubahan sistem berkas yang dihasilkan tiap instruksi di `Dockerfile`, ditumpuk membentuk image. Lapisan yang tidak berubah dipakai ulang dari cache, dan itulah kenapa urutan instruksi sangat menentukan lama build. Lapisan juga bersifat menumpuk, sehingga berkas yang dihapus di lapisan atas tetap ada di lapisan bawah dan tetap bisa diambil.',
        },
        {
          term: 'virtual machine (VM)',
          meaning:
            'Mesin virtual lengkap yang menjalankan sistem operasinya sendiri di atas hypervisor. Berbeda dari container yang berbagi kernel induknya, VM memuat kernel sendiri, sehingga lebih berat dan lebih lambat menyala tetapi batas pemisahannya lebih tegas.',
        },
        {
          term: 'registry',
          meaning:
            'Tempat penyimpanan image supaya bisa diambil mesin lain, misalnya Docker Hub atau GitHub Container Registry. `docker push` mengirim ke sana dan `docker pull` mengambilnya.',
        },
        {
          term: 'tag',
          meaning:
            'Label versi pada sebuah image, ditulis sesudah titik dua seperti `node:22-alpine`. Tag `latest` bukan versi terbaru secara otomatis melainkan sekadar nama bawaan, dan memakainya di produksi membuat dua deploy pada waktu berbeda bisa menjalankan isi yang berbeda.',
        },
        {
          term: 'volume',
          meaning:
            'Penyimpanan yang hidupnya terpisah dari container, dipakai untuk data yang harus bertahan saat container dibuat ulang. Tanpa volume, seluruh perubahan sistem berkas di dalam container hilang begitu ia dihapus.',
        },
        {
          term: 'stateless',
          meaning:
            'Sifat proses yang tidak menyimpan keadaan penting di dalam dirinya, sehingga boleh dimatikan dan diganti kapan saja. Inilah yang membuat penskalaan mendatar dan rilis tanpa henti mungkin dilakukan, dan alasan sesi pengguna sebaiknya tidak disimpan di memori proses.',
        },
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
      h2('Studi kasus di project nyata'),
      p(
        'Kalimat "jalan di laptop saya" terdengar seperti lelucon sampai selisihnya ditulis sebagai angka. Container menjawab masalah itu dengan cara yang sederhana, yaitu membawa serta sistem tempat kodenya berjalan.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada mesin ini dengan Docker 29.8.0:

          Node di mesin         : v26.5.0
          Node di dalam image   : v22.23.2
          Sistem di mesin       : Linux Mint 22.3
          Sistem di dalam image : Alpine Linux v3.24

        Dua versi Node yang berbeda mayor, di atas dua distribusi
        dengan pustaka sistem yang berbeda. Kode yang sama, dua
        lingkungan yang sama sekali lain.
        `,
        {
          caption:
            'Itulah selisih yang selama ini ditanggung diam-diam oleh kalimat "jalan di laptop saya".',
        },
      ),
      p(
        'Yang dibawa container bukan hanya versi runtime. Ia membawa pustaka sistem, lokal, zona waktu, dan letak berkas, dan justru hal-hal itulah yang paling sering berbeda tanpa disadari.',
      ),
      code(
        'text',
        `
        Yang ikut terbawa, dan sering menjadi penyebab selisih:

          versi runtime            Node, PHP, Python
          pustaka sistem           glibc versus musl di Alpine
          lokal dan zona waktu     urutan sortir, format tanggal
          alat baris perintah      versi openssl, curl, imagemagick
          peka huruf besar kecil   macOS tidak, Linux ya
          letak dan izin berkas

        Yang TIDAK dibawa, dan tetap harus diurus terpisah:

          data                     ada di volume atau basis data
          rahasia                  disuntikkan saat menjalankan
          konfigurasi per lingkungan
          keadaan yang disimpan di memori proses
        `,
      ),
      p(
        'Perbedaan container dengan mesin virtual terletak pada apa yang dibagi, dan itu menjelaskan kenapa ukurannya jauh berbeda.',
      ),
      table(
        ['', 'Mesin virtual', 'Container'],
        [
          [
            'Yang dijalankan',
            'Sistem operasi lengkap beserta kernelnya',
            'Proses biasa, memakai kernel host',
          ],
          ['Ukuran khas', 'Beberapa gigabyte', 'Puluhan sampai ratusan megabyte'],
          ['Waktu nyala', 'Puluhan detik', 'Di bawah satu detik'],
          ['Pemisahan', 'Kuat, ada kernel sendiri', 'Lebih lemah, kernelnya bersama'],
          [
            'Cocok untuk',
            'Sistem operasi yang berbeda dari host',
            'Menjalankan aplikasi secara konsisten',
          ],
        ],
      ),
      p(
        'Baris keempat penting dibaca jujur. Container **bukan** batas keamanan sekuat mesin virtual. Proses di dalamnya berjalan di atas kernel yang sama dengan host, sehingga celah di kernel berlaku untuk keduanya. Karena itu menjalankan proses sebagai bukan root di dalam container tetap penting.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahpahaman yang paling sering di awal adalah menganggap container menyimpan keadaan, padahal ia sengaja dirancang tidak begitu.',
      ),
      code(
        'text',
        `
        Gejala yang khas:

          "Data saya hilang setiap kali container di-restart"
            -> Perubahan pada lapisan tulis container hilang saat ia
               dibuat ulang. Data harus berada di VOLUME atau di
               layanan terpisah.

          "Berkas yang diunggah kadang tidak ditemukan"
            -> Berkas tersimpan di disk satu container, sementara
               permintaan berikutnya mendarat di container lain.

          "Log saya hilang"
            -> Tulis log ke stdout, biarkan platform yang
               mengumpulkannya. Jangan menulis ke berkas di dalam
               container.
        `,
      ),
      p(
        'Kelas kedua muncul saat container berhenti, dan kode keluarnya memberi tahu penyebabnya bila dibaca.',
      ),
      code(
        'text',
        `
        Diamati sungguhan saat menghentikan container uji:

          api-1 exited with code 137

        Kode keluar yang perlu dikenali:

          0    berhenti normal
          1    aplikasinya sendiri gagal, baca lognya
          125  perintah docker-nya yang salah
          126  berkasnya ada, tidak bisa dieksekusi (izin atau format)
          127  perintahnya TIDAK ADA di dalam image
          137  dihentikan SIGKILL — dimatikan paksa, atau kehabisan memori
          139  segmentation fault
          143  dihentikan SIGTERM — permintaan berhenti yang normal

        127 dan 137 yang paling sering. 127 berarti perintah di CMD
        tidak ada di image; 137 sering berarti batas memori terlampaui.
        `,
        {
          caption:
            'Kode 137 muncul baik saat docker stop memaksa maupun saat pembunuh OOM bekerja. Periksa lognya untuk membedakan.',
        },
      ),
      code(
        'text',
        `
        KESALAHAN LAIN yang gejalanya menyesatkan:

          exec /app/start.sh: no such file or directory
            -> sering BUKAN berkasnya yang hilang, melainkan barisnya
               berakhiran CRLF. Kernel membaca "#!/bin/sh\\r" sebagai
               nama penerjemah yang tidak ada.

          standard_init_linux.go: exec user process caused: exec format error
            -> arsitektur image tidak cocok. Image dibangun untuk
               arm64 dijalankan di amd64, atau sebaliknya.

          Aplikasi berjalan, tapi tidak bisa dihubungi dari luar
            -> aplikasinya mendengarkan di 127.0.0.1 DI DALAM container.
               Harus 0.0.0.0 supaya bisa dijangkau dari luar container.
        `,
      ),
      p(
        'Kesalahan terakhir itu sangat sering, dan gejalanya membingungkan karena lognya menunjukkan server berhasil menyala. Di dalam container, `127.0.0.1` berarti container itu sendiri, bukan mesinmu.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Container mengubah beberapa asumsi dasar sekaligus, dan kesalahannya hampir selalu berupa membawa asumsi lama ke lingkungan baru.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan data di dalam container',
            'Toh berkasnya ada di sana',
            'Lapisan tulis container hilang saat dibuat ulang. Data harus di volume atau layanan terpisah',
          ],
          [
            'Menjalankan aplikasi di `127.0.0.1` di dalam container',
            'Itu yang dipakai di lokal',
            'Di dalam container, itu berarti container itu sendiri. Harus `0.0.0.0` agar bisa dijangkau',
          ],
          [
            'Menulis log ke berkas di dalam container',
            'Supaya rapi',
            'Lognya ikut hilang. Tulis ke stdout, biarkan platform yang mengumpulkan',
          ],
          [
            'Menganggap container sekuat mesin virtual untuk isolasi',
            'Kan sudah terpisah',
            'Kernelnya bersama host. Jalankan sebagai bukan root, dan jangan andalkan ia sebagai batas keamanan',
          ],
          [
            'Menyalin `.env` ke dalam image',
            'Biar aplikasinya bisa baca',
            'Siapa pun yang bisa menarik image itu memegang rahasianya. Suntikkan saat menjalankan',
          ],
          [
            'Mengabaikan kode keluar saat container mati',
            'Yang penting lognya dibaca',
            'Diamati, `137` berarti dimatikan paksa atau kehabisan memori, dan `127` berarti perintahnya tidak ada di image',
          ],
        ],
      ),
      p(
        'Satu pergeseran cara berpikir membuat sisanya jauh lebih mudah, yaitu memperlakukan container sebagai proses yang bisa dibuang dan dibuat ulang kapan saja. Segala sesuatu yang tidak boleh hilang harus berada di luar container, dan segala sesuatu yang dibutuhkan untuk menyala harus bisa diberikan dari luar. Bila kedua hal itu benar, membangun ulang container adalah tindakan yang murah, dan itulah yang membuat rilis, rollback, dan penskalaan menjadi mungkin.',
      ),
      references(
        {
          label: 'What is a container?',
          href: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/',
          source: 'Docker Docs',
          note: 'Beda container dan mesin virtual dijelaskan dari sisi mekanismenya',
        },
        {
          label: 'Volumes',
          href: 'https://docs.docker.com/engine/storage/volumes/',
          source: 'Docker Docs',
          note: 'Cara data bertahan melewati pembuatan ulang container',
        },
        {
          label: 'Processes — Execute the app as stateless processes',
          href: 'https://12factor.net/processes',
          source: 'Twelve-Factor App',
          note: 'Kenapa proses aplikasi sebaiknya tidak menyimpan keadaan di dalam dirinya',
        },
      ),
    ],
  ),

  written(
    'dockerfile',
    'Dockerfile untuk Node & PHP',
    20,
    'Membangun image yang kecil, cepat, dan tidak berjalan sebagai root.',
    [
      terms(
        {
          term: 'Dockerfile',
          meaning:
            'Berkas teks berisi instruksi langkah demi langkah untuk membangun sebuah image. Namanya ditulis persis begitu tanpa ekstensi. Tiap instruksi menghasilkan satu lapisan, sehingga urutannya berpengaruh langsung pada seberapa sering cache bisa dipakai ulang.',
        },
        {
          term: 'FROM',
          meaning:
            'Instruksi yang menyebut image dasar yang dipakai sebagai titik mulai, misalnya `FROM node:22-alpine`. Pilihan di sini menentukan ukuran akhir dan permukaan serangnya, sebab semua yang ada di image dasar ikut terbawa.',
        },
        {
          term: 'RUN',
          meaning:
            'Instruksi yang menjalankan perintah saat build dan menyimpan hasilnya sebagai lapisan baru. Menggabungkan beberapa perintah dengan `&&` dalam satu `RUN` mengurangi jumlah lapisan, dan membersihkan cache paket di dalam `RUN` yang sama penting, sebab membersihkannya di `RUN` berikutnya tidak mengecilkan image.',
        },
        {
          term: 'COPY',
          meaning:
            'Instruksi yang menyalin berkas dari konteks build ke dalam image. Menyalin `package.json` lebih dulu lalu memasang dependensi, baru menyalin sisa kode, membuat lapisan dependensi tetap tersimpan di cache selama daftar dependensinya tidak berubah.',
        },
        {
          term: 'CMD dan ENTRYPOINT',
          meaning:
            'Dua instruksi yang menentukan apa yang dijalankan saat container menyala. `ENTRYPOINT` menetapkan program tetapnya, sementara `CMD` memberi argumen bawaan yang mudah ditimpa saat menjalankan. Bentuk daftar seperti `["node", "server.js"]` lebih disukai karena tidak melewati shell.',
        },
        {
          term: 'multi-stage build',
          meaning:
            'Membangun dalam beberapa tahap di satu `Dockerfile`, lalu menyalin hanya hasil yang diperlukan ke tahap akhir. Alat build, kode sumber, dan dependensi pengembangan ditinggal di tahap sebelumnya sehingga tidak ikut ke image produksi.',
        },
        {
          term: 'build context',
          meaning:
            'Kumpulan berkas yang dikirim ke proses build dan bisa disalin dengan `COPY`. Seluruh isinya dikirim lebih dulu, jadi folder besar yang tidak diperlukan memperlambat build meski tidak pernah disalin.',
        },
        {
          term: 'ENV',
          meaning:
            'Instruksi yang menetapkan variabel lingkungan di dalam image. Nilainya ikut tersimpan di image dan terbaca siapa pun yang memeriksanya, sehingga rahasia tidak boleh ditaruh di sini. Menyetel `ENV NODE_ENV=production` terlalu awal juga membuat pemasangan dependensi melewatkan `devDependencies` yang masih dibutuhkan tahap build.',
        },
      ),

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
      h2('Studi kasus di project nyata'),
      p(
        'Dockerfile yang benar dan Dockerfile yang salah menghasilkan aplikasi yang sama-sama berjalan. Selisihnya baru terlihat pada dua hal, yaitu berapa lama build-nya dan berapa besar hasilnya, dan keduanya bisa diukur.',
      ),
      p('Yang paling menentukan adalah urutan baris, sebab Docker menyimpan cache per lapisan.'),
      code(
        'text',
        `
        Diukur sungguhan dengan Docker 29.8.0 dan node:22-alpine.

        URUTAN BENAR — package.json disalin lebih dulu:

          COPY package.json ./
          RUN npm install
          COPY . .

          Setelah mengubah SATU baris kode sumber:
            [2/5] WORKDIR /app                 CACHED
            [3/5] COPY package.json ./         CACHED
            [4/5] RUN npm install              CACHED   <- tidak diulang

        URUTAN SALAH — seluruh isi disalin lebih dulu:

          COPY . .
          RUN npm install

          Setelah mengubah SATU baris kode sumber:
            [3/4] COPY . .                     dijalankan ulang
            [4/4] RUN npm install              dijalankan ulang
        `,
        {
          caption: 'Aturannya: yang jarang berubah ditaruh di atas, yang sering berubah di bawah.',
        },
      ),
      code(
        'text',
        `
        Dan ketika package.json memang berubah, cache-nya memang harus batal:

          [3/5] COPY package.json ./           dijalankan ulang
          [4/5] RUN npm install                dijalankan ulang, 0,5 detik

        Itu perilaku yang benar. Yang ingin dihindari adalah membayar
        biaya itu pada setiap perubahan kode.
        `,
      ),
      p(
        'Faktor kedua adalah apa yang ikut ke image akhir, dan di sinilah multi-stage membayar dirinya.',
      ),
      code(
        'text',
        `
        Diukur sungguhan, kedua versi memasang devDependency yang sama
        (typescript 5.9.3):

          node:22-alpine (dasar)        232 MB
          satu tahap                    290 MB
          multi tahap                   232 MB

        Isi image satu tahap:
          node_modules berisi typescript, 22,9 MB
          berjalan sebagai uid 0 (root)

        Isi image multi tahap:
          dist, package.json
          berjalan sebagai pengguna "app"
        `,
        {
          caption: 'Selisih 58 MB hanya dari SATU devDependency. Project sungguhan punya ratusan.',
        },
      ),
      code(
        'text',
        `
        # Tahap 1: punya seluruh toolchain, boleh besar.
        FROM node:22-alpine AS pembangun
        WORKDIR /app
        COPY package.json package-lock.json ./
        RUN npm ci
        COPY . .
        RUN npm run build

        # Tahap 2: HANYA yang dibutuhkan untuk berjalan.
        FROM node:22-alpine AS produksi
        WORKDIR /app
        ENV NODE_ENV=production
        RUN addgroup -S app && adduser -S app -G app
        COPY package.json package-lock.json ./
        RUN npm ci --omit=dev && npm cache clean --force
        COPY --from=pembangun --chown=app:app /app/dist ./dist
        USER app
        EXPOSE 3000
        CMD ["node", "dist/server.js"]
        `,
      ),
      p(
        'Dua detail pada tahap kedua pantas diperhatikan. `npm ci` dipakai alih-alih `npm install` supaya versinya persis mengikuti lockfile, dan `USER app` ditulis **sesudah** semua penyalinan, sebab perintah sesudahnya tidak lagi berjalan sebagai root.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ada satu jebakan yang menghasilkan error yang membingungkan, dan ia berasal dari baris yang terlihat paling tidak berbahaya.',
      ),
      code(
        'text',
        `
        Dockerfile:
          ENV NODE_ENV=production
          COPY package.json ./
          RUN npm install
          RUN npx tsc --version

        Hasilnya, diukur sungguhan:

          To get access to the TypeScript compiler, tsc, from the
          command line either:
          - Use npm install typescript to first add TypeScript to your
            project before using npx

          ERROR: failed to build: process "/bin/sh -c npx tsc --version"
          did not complete successfully: exit code: 1

        Sebabnya: NODE_ENV=production membuat npm install MELEWATI
        devDependencies. Kompilernya memang tidak terpasang.

        Menutupnya: setel NODE_ENV SESUDAH build selesai, atau pakai
        multi-stage sehingga tahap build tidak pernah melihat nilai itu.
        `,
        { caption: 'Pesan errornya menyebut TypeScript, penyebabnya satu baris ENV di atasnya.' },
      ),
      code(
        'text',
        `
        KESALAHAN LAIN yang khas:

        1. exec /app/start.sh: no such file or directory

           Berkasnya ADA. Yang salah biasanya akhiran baris CRLF,
           atau bit eksekusinya belum dipasang.
           Perbaikan: COPY --chmod=755, dan pastikan git tidak
           mengubah akhiran baris untuk berkas .sh.

        2. npm ci gagal: lockfile tidak sinkron

           npm error \`npm ci\` can only install packages when your
           package.json and package-lock.json are in sync

           Ini pemeriksaan yang BEKERJA. Perbaiki dengan npm install
           di luar Docker lalu commit lockfile-nya — jangan ganti
           npm ci menjadi npm install.

        3. Perintah CMD tidak ditemukan

           Container keluar dengan kode 127. Bentuk CMD juga menentukan:
             CMD node server.js        -> dijalankan lewat shell
             CMD ["node", "server.js"] -> dijalankan LANGSUNG

           Bentuk kedua yang benar untuk produksi, sebab sinyal
           SIGTERM sampai ke prosesnya, bukan ke shell.
        `,
      ),
      p(
        'Poin terakhir punya akibat yang nyata saat rilis. Bila `SIGTERM` tidak sampai ke aplikasinya, ia tidak pernah punya kesempatan menyelesaikan permintaan yang sedang berjalan, dan container-nya akhirnya dimatikan paksa dengan kode 137.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Dockerfile mudah ditulis sampai berjalan, dan yang membedakan yang baik adalah hal-hal yang tidak terlihat sampai diukur.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh `COPY . .` sebelum `RUN npm install`',
            'Urutannya kan logis',
            'Diukur, setiap perubahan kode membatalkan cache dan memasang ulang seluruh dependency',
          ],
          [
            'Menyetel `ENV NODE_ENV=production` di baris awal',
            'Ini kan image produksi',
            'Diukur, `npm install` melewati devDependencies dan build gagal dengan pesan yang menyebut TypeScript',
          ],
          [
            'Memakai `npm install` di dalam Dockerfile',
            'Sama saja dengan `npm ci`',
            '`npm install` boleh mengubah lockfile. `npm ci` memasang persis seperti lockfile, dan itu yang diinginkan',
          ],
          [
            'Memakai satu tahap untuk build dan runtime',
            'Lebih sederhana',
            'Diukur, 290 MB melawan 232 MB hanya dari satu devDependency. Toolchain ikut terbawa ke produksi',
          ],
          [
            'Menjalankan proses sebagai root',
            'Bawaannya memang begitu',
            'Container bukan batas keamanan sekuat VM. Buat pengguna biasa, dan `USER` ditulis sesudah penyalinan',
          ],
          [
            'Memakai `CMD node server.js` bentuk shell',
            'Lebih enak dibaca',
            'SIGTERM sampai ke shell, bukan ke aplikasinya. Permintaan yang berjalan terputus, container mati kode 137',
          ],
        ],
      ),
      p(
        'Satu pemeriksaan sederhana menangkap sebagian besar baris di tabel itu, yaitu mengubah satu karakter di satu berkas sumber lalu membangun ulang. Bila `RUN npm install` ikut berjalan lagi, urutan lapisannya belum benar. Bila hasilnya jauh lebih besar daripada image dasarnya, ada yang ikut terbawa dan tidak seharusnya. Kedua pemeriksaan itu memakan waktu satu menit dan menghemat menit-menit yang terbuang pada setiap build sesudahnya.',
      ),
      references(
        {
          label: 'Dockerfile reference',
          href: 'https://docs.docker.com/reference/dockerfile/',
          source: 'Docker Docs',
          note: 'Rujukan lengkap seluruh instruksi beserta bentuk penulisannya',
        },
        {
          label: 'Multi-stage builds',
          href: 'https://docs.docker.com/build/building/multi-stage/',
          source: 'Docker Docs',
          note: 'Pola meninggalkan alat build di tahap sebelumnya',
        },
        {
          label: 'Build context',
          href: 'https://docs.docker.com/build/concepts/context/',
          source: 'Docker Docs',
          note: 'Apa yang sebenarnya dikirim ke proses build, dan biayanya',
        },
      ),
    ],
  ),

  written(
    'dockerignore',
    '`.dockerignore` & Ukuran Image',
    17,
    'Yang tidak ikut sama pentingnya dengan yang ikut.',
    [
      terms(
        {
          term: '.dockerignore',
          meaning:
            'Berkas berisi pola nama yang dikecualikan dari konteks build. Bekerja mirip `.gitignore` tetapi untuk keperluan yang berbeda, dan keduanya perlu ada sendiri-sendiri sebab yang berbahaya di image belum tentu sama dengan yang tidak perlu masuk riwayat.',
        },
        {
          term: 'konteks build',
          meaning:
            'Seluruh berkas yang dikirim ke daemon Docker sebelum instruksi pertama dijalankan. Karena pengirimannya terjadi lebih dulu, folder seperti `node_modules/` dan `.next/` memperlambat setiap build meski tidak pernah disalin ke image.',
        },
        {
          term: 'pola glob',
          meaning:
            'Bentuk penulisan pola nama berkas, misalnya `*.log` untuk semua berkas log dan `**/tmp` untuk folder `tmp` di kedalaman mana pun. Tanda `!` di depan sebuah pola mengecualikan kembali berkas yang sudah terkena pola sebelumnya.',
        },
        {
          term: 'kebocoran rahasia lewat image',
          meaning:
            'Masuknya berkas seperti `.env` atau kunci privat ke dalam image karena tidak dikecualikan. Yang membuatnya berbahaya, siapa pun yang bisa menarik image itu bisa membacanya, dan menghapus berkasnya di instruksi berikutnya tidak menolong sebab lapisan sebelumnya tetap menyimpannya.',
        },
        {
          term: 'cache invalidation',
          meaning:
            'Batalnya cache sebuah lapisan karena masukannya berubah, sehingga lapisan itu dan seluruh lapisan sesudahnya dibangun ulang. Berkas yang sering berubah dan ikut tersalin lebih awal akan membatalkan cache hampir setiap build.',
        },
        {
          term: 'image bloat',
          meaning:
            'Membengkaknya ukuran image oleh berkas yang tidak diperlukan saat menjalankan aplikasi, misalnya kode sumber, dependensi pengembangan, cache paket, dan folder `.git`. Akibatnya bukan hanya boros ruang, melainkan waktu tarik yang lebih lama pada setiap deploy dan setiap penskalaan.',
        },
        {
          term: 'reproducible build',
          meaning:
            'Build yang menghasilkan isi sama bila masukannya sama. Konteks build yang rapi mendekatkan ke sifat ini, sebab berkas lokal yang tidak sengaja ikut membuat hasilnya bergantung pada keadaan mesin yang membangunnya.',
        },
      ),

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
      h2('Studi kasus di project nyata'),
      p(
        'Sebelum satu baris Dockerfile dijalankan, Docker mengirim seluruh isi direktori build ke mesin yang membangunnya. Isi itu disebut konteks, dan ukurannya dibayar pada setiap build.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan Docker 29.8.0. Direktori yang sama,
        berisi node_modules 20 MB, .git 8 MB, dan coverage 5 MB.

        TANPA .dockerignore:
          transferring context: 33.01 MB
          ukuran image        : 301 MB

        DENGAN .dockerignore:
          transferring context: 195 B
          ukuran image        : 235 MB

        Konteksnya turun dari 33 megabyte menjadi 195 byte, dan
        image-nya 66 MB lebih kecil.
        `,
        {
          caption:
            'Isi node_modules dari mesin lokal ikut tersalin ke image, lalu ditimpa oleh npm install di dalamnya.',
        },
      ),
      p(
        'Baris terakhir itu menjelaskan kenapa masalahnya lebih dari sekadar ukuran. `node_modules` yang dibangun di macOS atau Windows berisi binary yang dikompilasi untuk sistem itu, dan menyalinnya ke image Linux menghasilkan kegagalan yang sulit ditelusuri.',
      ),
      code(
        'text',
        `
        Gejalanya bila node_modules lokal ikut tersalin:

          Error: /app/node_modules/sharp/build/Release/sharp.node:
          invalid ELF header

          Error: Cannot find module '@rollup/rollup-linux-x64-gnu'

        Keduanya berarti hal yang sama: binary yang ada di sana
        dibangun untuk sistem lain.
        `,
      ),
      p(
        'Isi `.dockerignore` yang lazim mengikuti satu pertanyaan, yaitu apakah berkas ini dibutuhkan **untuk membangun** image.',
      ),
      code(
        'text',
        `
        # Dibangun ulang di dalam image
        node_modules
        .next
        dist
        build

        # Riwayat versi, tidak dibutuhkan saat build
        .git
        .gitignore

        # Hasil pengujian dan alat pengembangan
        coverage
        .vscode
        .idea

        # RAHASIA — ini alasan keamanannya, bukan sekadar ukuran
        .env
        .env.*
        *.pem
        *.key

        # Dokumen
        *.md
        docs

        # Docker itu sendiri
        Dockerfile*
        .dockerignore
        compose*.yaml
        `,
        {
          caption:
            'Blok rahasia itu yang paling penting: berkas .env yang ikut ter-COPY tersimpan permanen di lapisan image.',
        },
      ),
      p(
        'Kata "permanen" di situ harus dibaca harfiah. Menghapus sebuah berkas pada lapisan berikutnya tidak menghapusnya dari lapisan sebelumnya, dan lapisan itu tetap ada di dalam image.',
      ),
      code(
        'text',
        `
        Dockerfile yang TIDAK menghapus apa pun:

          COPY . .              <- .env ikut, tersimpan di lapisan ini
          RUN rm -f .env        <- lapisan BARU yang menandainya hilang

        Berkasnya tidak terlihat saat container berjalan, dan ia tetap
        ada di lapisan sebelumnya. Siapa pun yang bisa menarik image
        itu bisa membacanya.

        Yang menutupnya bukan rm, melainkan tidak pernah menyalinnya.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan pada `.dockerignore` jarang menghasilkan error langsung. Gejalanya berupa build yang lambat, image yang besar, dan sesekali kegagalan yang penyebabnya jauh dari tampilannya.',
      ),
      code(
        'text',
        `
        1. Build lambat tanpa sebab yang jelas

           transferring context: 412.7 MB

           Baris itu muncul di awal setiap build. Bila angkanya
           puluhan atau ratusan megabyte, .dockerignore-nya belum ada
           atau belum lengkap.

        2. Image jauh lebih besar daripada yang masuk akal

           docker history <image>
           menunjukkan ukuran TIAP lapisan. Lapisan COPY yang besar
           hampir selalu berarti ada yang ikut dan tidak seharusnya.

        3. Perubahan kecil selalu membatalkan cache

           Bila .git tidak diabaikan, setiap commit mengubah isi
           direktori .git, dan lapisan COPY ikut batal setiap kali —
           meski tidak ada satu baris kode pun yang berubah.
        `,
      ),
      p('Ada juga kesalahan arah sebaliknya, yaitu mengabaikan sesuatu yang ternyata dibutuhkan.'),
      code(
        'text',
        `
          Error: Cannot find module '/app/dist/server.js'

            -> dist diabaikan di .dockerignore, dan Dockerfile-nya
               mengharapkan hasil build dari luar. Salah satu harus
               berubah: bangun di dalam image, atau jangan abaikan dist.

          npm error \`npm ci\` can only install packages when your
          package.json and package-lock.json are in sync

            -> package-lock.json ikut terabaikan oleh pola yang terlalu
               luas, misalnya *.json. Pola harus spesifik.
        `,
      ),
      p(
        'Aturan pencocokan `.dockerignore` juga punya satu perilaku yang sering mengejutkan, dan berbeda dari `.gitignore`.',
      ),
      code(
        'text',
        `
        Pola dicocokkan terhadap JALUR LENGKAP dari akar konteks.

          node_modules        <- hanya yang di AKAR
          **/node_modules     <- di mana pun, termasuk di dalam paket

        Dan pengecualian dengan tanda seru, urutannya menentukan:

          *.md
          !README.md          <- README tetap ikut

          !README.md
          *.md                <- README TIDAK ikut, sebab baris
                                 terakhir yang cocok yang berlaku
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Berkas ini sering dianggap pelengkap yang bisa ditunda, padahal ia satu-satunya penghalang antara isi direktori kerjamu dan image yang akan didistribusikan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Tidak membuat `.dockerignore` sama sekali',
            'Toh yang dipakai cuma sebagian',
            'Diukur, konteksnya 33,01 MB melawan 195 byte, dan image-nya 66 MB lebih besar',
          ],
          [
            'Membiarkan `node_modules` ikut ke konteks',
            'Nanti ditimpa `npm install` juga',
            'Binary di dalamnya dibangun untuk sistem lain. `invalid ELF header` adalah gejala khasnya',
          ],
          [
            'Menyalin `.env` lalu menghapusnya dengan `RUN rm`',
            'Sudah dihapus, aman',
            'Lapisan sebelumnya tetap menyimpannya. Siapa pun yang menarik image itu bisa membacanya',
          ],
          [
            'Membiarkan `.git` ikut',
            'Cuma riwayat, tidak berbahaya',
            'Riwayatnya memuat setiap berkas yang pernah ada, termasuk rahasia yang sudah dihapus. Dan cache batal tiap commit',
          ],
          [
            'Memakai pola terlalu luas seperti `*.json`',
            'Yang dibutuhkan cuma beberapa',
            '`package-lock.json` ikut terabaikan, dan `npm ci` gagal karena lockfile-nya tidak ada',
          ],
          [
            'Menyalin `.dockerignore` dari project lain tanpa memeriksa',
            'Isinya kan mirip',
            'Struktur direktori berbeda menghasilkan pola yang salah sasaran. Periksa angka konteksnya setelah dipasang',
          ],
        ],
      ),
      p(
        'Cara memeriksanya ada di keluaran build itu sendiri dan hanya perlu dibaca sekali. Baris `transferring context` muncul di setiap build, dan angkanya adalah ukuran sebenarnya dari apa yang kamu kirim. Bila angka itu jauh lebih besar daripada jumlah kode sumbermu, sesuatu ikut terbawa, dan `.dockerignore` adalah tempat memperbaikinya.',
      ),
      references(
        {
          label: 'Build context',
          href: 'https://docs.docker.com/build/concepts/context/',
          source: 'Docker Docs',
          note: 'Bagian `.dockerignore` beserta aturan polanya',
        },
        {
          label: 'Dockerfile reference',
          href: 'https://docs.docker.com/reference/dockerfile/',
          source: 'Docker Docs',
          note: 'Perilaku `COPY` terhadap konteks yang sudah disaring',
        },
        {
          label: 'Multi-stage builds',
          href: 'https://docs.docker.com/build/building/multi-stage/',
          source: 'Docker Docs',
          note: 'Cara kedua menekan ukuran akhir, melengkapi penyaringan konteks',
        },
      ),
    ],
  ),

  written(
    'compose',
    'Docker Compose untuk Pengembangan Lokal',
    20,
    'Seluruh lingkungan dengan satu perintah.',
    [
      p(
        'Ini manfaat Docker yang paling besar dan paling sering diremehkan: anggota baru bisa menjalankan seluruh sistem tanpa memasang Postgres, Redis, atau versi Node tertentu di laptopnya.',
      ),

      terms(
        {
          term: 'Docker Compose',
          meaning:
            'Alat untuk mendefinisikan dan menjalankan beberapa container sekaligus lewat satu berkas YAML. Dipakai saat aplikasimu butuh pendamping seperti basis data dan cache, supaya seluruhnya menyala dengan satu perintah dan konfigurasinya ikut masuk version control.',
        },
        {
          term: 'compose.yaml',
          meaning:
            'Berkas konfigurasi Compose. Nama lamanya `docker-compose.yml` dan keduanya masih dikenali. Isinya mendeklarasikan `services`, `volumes`, dan `networks`.',
        },
        {
          term: 'service',
          meaning:
            'Satu jenis container yang didefinisikan di Compose, misalnya `web`, `db`, atau `redis`. Namanya sekaligus menjadi nama host di jaringan internal, sehingga aplikasi cukup menghubungi `db` tanpa perlu tahu alamat IP-nya.',
        },
        {
          term: 'depends_on',
          meaning:
            'Setelan yang menyatakan sebuah service dimulai sesudah service lain. Batasnya sering disalahpahami, secara bawaan ia hanya menunggu container **menyala**, bukan menunggu layanannya **siap menerima koneksi**, sehingga aplikasi masih bisa gagal menyambung kalau basis datanya belum selesai memulai.',
        },
        {
          term: 'port mapping',
          meaning:
            'Pemetaan port mesin induk ke port di dalam container, ditulis `"3000:3000"`. Angka sebelah kiri adalah port yang terbuka di mesinmu. Menghilangkan bagian kiri membuat service hanya terjangkau dari dalam jaringan Compose, dan itu yang diinginkan untuk basis data.',
        },
        {
          term: 'bind mount',
          meaning:
            'Pemetaan folder di mesinmu ke dalam container, sehingga perubahan berkas langsung terlihat tanpa membangun ulang image. Berguna saat pengembangan, dan justru dihindari di produksi karena membuat isi container bergantung pada isi mesin induk.',
        },
        {
          term: 'profiles',
          meaning:
            'Cara menandai sebagian service supaya tidak ikut menyala kecuali diminta, misalnya alat bantu yang hanya dipakai sesekali. Menjaga perintah menyalakan sehari-hari tetap ringan.',
        },
        {
          term: 'override',
          meaning:
            'Berkas tambahan yang menimpa sebagian konfigurasi, misalnya `compose.override.yaml` untuk pengembangan. Memungkinkan satu definisi dasar dipakai bersama sambil tiap lingkungan mengubah bagian yang perlu.',
        },
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
      h2('Studi kasus di project nyata'),
      p(
        'Compose menjawab satu kebutuhan yang sangat konkret, yaitu menjalankan beberapa layanan sekaligus dengan satu perintah, dan membuat keduanya bisa saling menghubungi tanpa tahu alamat IP masing-masing.',
      ),
      p('Dua hal yang dilakukannya bisa dilihat langsung.'),
      code(
        'text',
        `
        Dijalankan sungguhan dengan Docker Compose:

          Container ujicompose-api-1 Started
          Container ujicompose-api-1 Waiting
          Container ujicompose-api-1 Healthy
          Container ujicompose-pemanggil-1 Started
          pemanggil-1  | BERHASIL memanggil http://api:3000 ->
                         {"halo":"dunia","versi":"2.0.0"}

        Dua hal terbukti di situ:
          1. layanan "pemanggil" MENUNGGU sampai "api" berstatus sehat,
             bukan sekadar sampai proses api-nya berjalan
          2. alamat http://api:3000 bekerja. Nama layanan menjadi
             nama host di dalam jaringan compose
        `,
        { caption: 'Nomor 2 itu yang menghapus kebutuhan menghafal alamat IP container.' },
      ),
      code(
        'text',
        `
        services:
          api:
            image: contoh/api:dev
            healthcheck:
              test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
              interval: 2s
              timeout: 2s
              retries: 5
              start_period: 1s

          pemanggil:
            image: node:22-alpine
            depends_on:
              api:
                condition: service_healthy
        `,
      ),
      p(
        'Bagian `condition: service_healthy` itu yang membedakannya dari `depends_on` biasa. Tanpa syarat itu, compose hanya menunggu container-nya **dimulai**, bukan sampai aplikasinya siap menerima permintaan.',
      ),
      p(
        'Untuk pengembangan lokal, bentuk yang paling berguna menggabungkan basis data, penyimpanan, dan aplikasi dalam satu berkas.',
      ),
      code(
        'text',
        `
        services:
          db:
            image: postgres:16-alpine
            environment:
              POSTGRES_PASSWORD: rahasia-lokal-saja
              POSTGRES_DB: app
            ports:
              - "127.0.0.1:5432:5432"     # HANYA dari mesin ini
            volumes:
              - data-db:/var/lib/postgresql/data
            healthcheck:
              test: ["CMD-SHELL", "pg_isready -U postgres"]
              interval: 2s
              retries: 10

          app:
            build: .
            environment:
              DATABASE_URL: postgres://postgres:rahasia-lokal-saja@db:5432/app
            ports:
              - "127.0.0.1:3000:3000"
            depends_on:
              db:
                condition: service_healthy
            volumes:
              - .:/app                    # kode ikut berubah tanpa build ulang
              - /app/node_modules         # KECUALI node_modules

        volumes:
          data-db:
        `,
        {
          caption:
            'Baris /app/node_modules itu yang mencegah node_modules mesin lokal menimpa yang ada di dalam image.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan compose yang paling sering punya tiga bentuk, dan ketiganya punya pesan yang cukup jelas bila dibaca sampai akhir.',
      ),
      code(
        'text',
        `
        1. Aplikasi tidak bisa menghubungi basis data

           Error: connect ECONNREFUSED 127.0.0.1:5432

           127.0.0.1 di dalam container app berarti container APP itu
           sendiri. Nama host-nya adalah nama LAYANAN, yaitu db.
           Perbaikan: postgres://...@db:5432/app

        2. Port bentrok

           Error response from daemon: failed to bind host port for
           0.0.0.0:5432: address already in use

           Sudah ada yang memakai port itu di mesin — sering PostgreSQL
           yang terpasang langsung, atau compose project lain yang
           masih berjalan.
           Perbaikan: ganti port host ("15432:5432"), atau hentikan
           yang lain. Port di sisi container tidak perlu diubah.

        3. Aplikasi menyala sebelum basis datanya siap

           error: the database system is starting up

           depends_on tanpa condition hanya menunggu container dimulai.
           Perbaikan: healthcheck pada db + condition: service_healthy.
        `,
      ),
      p(
        'Masalah keempat khas pengembangan lokal dan gejalanya sangat membingungkan, sebab ia muncul sebagai modul yang hilang padahal sudah dipasang.',
      ),
      code(
        'text',
        `
          Error: Cannot find module 'express'

        Padahal npm install sudah dijalankan di dalam image saat build.

        Sebabnya: volumes: - .:/app menimpa SELURUH isi /app dengan
        isi direktori lokal, termasuk node_modules lokal yang mungkin
        kosong atau dibangun untuk sistem lain.

        Perbaikannya satu baris tambahan:
          volumes:
            - .:/app
            - /app/node_modules     <- volume anonim, melindungi yang
                                       ada di dalam image
        `,
      ),
      code(
        'text',
        `
        KESALAHAN LAIN yang perlu dikenali:

          "Data saya hilang setiap docker compose down"
            -> down -v MENGHAPUS volume. Tanpa -v, volumenya tetap ada.
               Periksa dengan: docker volume ls

          "Perubahan compose.yaml tidak berlaku"
            -> compose up tanpa --build memakai image lama.
               Untuk perubahan Dockerfile: docker compose up --build

          "Layanan saya bisa dihubungi dari internet"
            -> ports: "5432:5432" mengikat ke 0.0.0.0.
               Untuk pengembangan lokal, tulis "127.0.0.1:5432:5432"
        `,
        {
          caption:
            'Yang terakhir sering terlewat, dan ia membuka basis data pengembangan ke seluruh jaringan tempat mesinmu berada.',
        },
      ),
      p(
        'Satu hal terakhir yang perlu dinyatakan terus terang, yaitu bahwa Compose dirancang untuk satu mesin. Ia sangat baik untuk pengembangan lokal dan untuk penyebaran kecil di satu server, dan ia bukan alat orkestrasi untuk beberapa mesin. Untuk itu ada Kubernetes dan yang sejenisnya, dan memakainya sebelum benar-benar dibutuhkan menambah kerumitan yang besar.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Compose menghapus banyak pekerjaan manual, dan kesalahannya hampir selalu berupa asumsi tentang jaringan dan penyimpanan yang terbawa dari cara kerja tanpa container.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `127.0.0.1` untuk menghubungi layanan lain',
            'Semuanya kan di mesin yang sama',
            'Di dalam container, itu berarti container itu sendiri. Pakai NAMA LAYANAN sebagai nama host',
          ],
          [
            'Memakai `depends_on` tanpa `condition`',
            'Urutannya sudah diatur',
            'Ia hanya menunggu container DIMULAI. Diukur, `service_healthy` menunggu sampai benar-benar siap',
          ],
          [
            'Memasang `volumes: - .:/app` tanpa pengecualian',
            'Biar kode ikut berubah',
            'Ia menimpa `node_modules` di dalam image. Tambahkan volume anonim `- /app/node_modules`',
          ],
          [
            'Menulis `ports: "5432:5432"`',
            'Biar bisa diakses dari alat lokal',
            'Itu mengikat ke `0.0.0.0`. Pakai `"127.0.0.1:5432:5432"` untuk pengembangan',
          ],
          [
            'Menjalankan `docker compose down -v` untuk membersihkan',
            'Biar benar-benar bersih',
            '`-v` menghapus volume beserta datanya. Tanpa `-v`, data basis data lokalmu tetap ada',
          ],
          [
            'Menaruh kredensial produksi di `compose.yaml`',
            'Biar satu berkas saja',
            'Berkas itu ikut ke repositori. Pakai nilai lokal saja, dan baca rahasia produksi dari tempat lain',
          ],
        ],
      ),
      p(
        'Nilai terbesar Compose sebenarnya bukan pada penyebaran melainkan pada hari pertama orang baru bergabung. Satu perintah yang menyalakan basis data, penyimpanan, dan aplikasi dengan versi yang persis sama menghapus satu hari penuh pemasangan manual, dan menghapus seluruh kelas pertanyaan yang berawal dari "versi PostgreSQL kamu berapa".',
      ),
      references(
        {
          label: 'Docker Compose',
          href: 'https://docs.docker.com/compose/',
          source: 'Docker Docs',
          note: 'Gambaran utuh kapan Compose dipakai dan apa batasnya',
        },
        {
          label: 'Compose file reference',
          href: 'https://docs.docker.com/reference/compose-file/',
          source: 'Docker Docs',
          note: 'Rujukan seluruh kunci konfigurasi, termasuk perilaku sebenarnya `depends_on`',
        },
        {
          label: 'Volumes',
          href: 'https://docs.docker.com/engine/storage/volumes/',
          source: 'Docker Docs',
          note: 'Beda volume terkelola dan bind mount beserta kapan masing-masing cocok',
        },
      ),
    ],
  ),

  written(
    'produksi-healthcheck',
    'Menjalankan di Produksi & Healthcheck',
    18,
    'Container yang bisa dipercaya, dan yang tahu kapan dirinya tidak sehat.',
    [
      terms(
        {
          term: 'health check',
          meaning:
            'Pemeriksaan berkala untuk menentukan apakah sebuah container atau instance masih layak menerima lalu lintas. Yang menentukan mutunya adalah apa yang ikut diperiksa, sebab pemeriksaan yang terlalu dangkal meluluskan proses yang sebenarnya sudah tidak berguna.',
        },
        {
          term: 'HEALTHCHECK',
          meaning:
            'Instruksi di `Dockerfile` yang menyebut perintah untuk memeriksa kesehatan container, beserta jeda, batas waktu, dan berapa kali gagal sebelum dinyatakan tidak sehat. Statusnya terbaca lewat `docker ps` sebagai `starting`, `healthy`, atau `unhealthy`.',
        },
        {
          term: 'liveness probe',
          meaning:
            'Pemeriksaan yang menjawab pertanyaan "apakah proses ini perlu dimatikan dan diganti". Bila gagal berulang, orkestratornya membunuh container itu. Karena akibatnya restart, pemeriksaan ini harus bergantung pada proses itu sendiri, bukan pada layanan luar.',
        },
        {
          term: 'readiness probe',
          meaning:
            'Pemeriksaan yang menjawab pertanyaan "apakah instance ini siap menerima permintaan sekarang". Bila gagal, ia dikeluarkan dari rotasi tanpa dimatikan. Di sinilah ketergantungan wajib seperti basis data pantas diperiksa, sementara ketergantungan yang hanya mempercepat seperti cache justru tidak boleh, sebab matinya cache akan mengeluarkan semua instance sekaligus.',
        },
        {
          term: 'startup probe',
          meaning:
            'Pemeriksaan khusus masa menyala, dipakai untuk aplikasi yang butuh waktu lama sebelum siap. Selama ia belum lulus, liveness ditahan, sehingga aplikasi yang lambat menyala tidak dibunuh berulang kali sebelum sempat siap.',
        },
        {
          term: 'graceful shutdown',
          meaning:
            'Mematikan proses dengan tertib setelah menerima sinyal `SIGTERM`, yaitu berhenti menerima permintaan baru, menyelesaikan yang sedang berjalan, menutup koneksi, lalu keluar. Tanpa ini, rilis atau penskalaan memutus permintaan pengguna di tengah jalan.',
        },
        {
          term: 'restart policy',
          meaning:
            'Aturan kapan container dinyalakan ulang otomatis, misalnya `unless-stopped` atau `on-failure`. Perlu dipasangkan dengan jeda mundur, sebab proses yang gagal menyala lalu dinyalakan ulang terus-menerus hanya memindahkan kegagalannya menjadi perulangan.',
        },
        {
          term: 'resource limit',
          meaning:
            'Batas CPU dan memori yang diberikan kepada satu container. Tanpa batas, satu proses yang bocor memorinya bisa menghabiskan mesin dan menjatuhkan container lain di mesin yang sama.',
        },
      ),

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
      h2('Studi kasus di project nyata'),
      p(
        'Healthcheck menjawab pertanyaan yang tidak bisa dijawab oleh "apakah prosesnya berjalan", yaitu apakah aplikasinya benar-benar siap melayani. Selisih di antara keduanya bisa diukur.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan Docker 29.8.0. Aplikasi sengaja
        membutuhkan 3 detik untuk siap.

          t+1s  health=starting  /healthz=000   <- belum menerima koneksi
          t+2s  health=starting  /healthz=503
          t+3s  health=starting  /healthz=503
          t+4s  health=healthy   /healthz=200
          t+5s  health=healthy   /healthz=200

        Riwayat pemeriksaan yang dicatat Docker:
          exit=1  exit=0  exit=0  exit=0

        Selama tiga detik pertama, prosesnya BERJALAN dan aplikasinya
        BELUM SIAP. Tanpa healthcheck, penyeimbang beban sudah
        mengirimkan lalu lintas ke sana.
        `,
        { caption: 'Status "starting" adalah keadaan tersendiri, bukan sekadar belum sehat.' },
      ),
      p(
        'Yang membuat healthcheck berguna bukan keberadaannya melainkan **apa yang diperiksanya**, dan di sini ada keputusan yang sering salah diambil.',
      ),
      table(
        ['Jenis', 'Yang diperiksa', 'Dipakai untuk'],
        [
          [
            'Liveness',
            'Apakah prosesnya masih waras dan perlu direstart',
            'Memutuskan restart. Harus SANGAT sederhana',
          ],
          [
            'Readiness',
            'Apakah siap menerima lalu lintas sekarang',
            'Memutuskan apakah dikirimi permintaan',
          ],
          [
            'Startup',
            'Apakah warm-up awalnya sudah selesai',
            'Menunda liveness supaya tidak restart saat masih menyala',
          ],
        ],
      ),
      code(
        'ts',
        `
        // LIVENESS: jangan periksa dependency di sini.
        // Basis data yang sedang tumbang bukan alasan merestart aplikasi,
        // dan restart massal justru memperburuk keadaan.
        app.get('/healthz', (req, res) => res.json({ ok: true }));

        // READINESS: di sinilah dependency diperiksa.
        app.get('/readyz', async (req, res) => {
          const cek = await Promise.allSettled([
            db.query('SELECT 1'),
            antrean.ping(),
          ]);
          const gagal = cek
            .map((h, i) => (h.status === 'rejected' ? ['db', 'antrean'][i] : null))
            .filter(Boolean);

          if (gagal.length) return res.status(503).json({ siap: false, gagal });
          res.json({ siap: true });
        });
        `,
        {
          caption:
            'Memakai pemeriksaan dependency untuk liveness adalah cara paling cepat mengubah gangguan kecil menjadi pemadaman total.',
        },
      ),
      p(
        'Sisi kedua dari menjalankan di produksi adalah berhenti dengan rapi, dan ini yang menentukan apakah rilis menyebabkan error bagi pengguna.',
      ),
      code(
        'text',
        `
        Urutan yang benar saat container diminta berhenti:

          1. Docker mengirim SIGTERM
          2. Aplikasi BERHENTI menjawab /readyz dengan 200
             -> penyeimbang beban berhenti mengirim permintaan baru
          3. Aplikasi menyelesaikan permintaan yang SEDANG berjalan
          4. Koneksi basis data dan antrean ditutup
          5. Proses keluar dengan kode 0

        Bila langkah 1 tidak pernah sampai ke aplikasinya, Docker
        menunggu (bawaannya 10 detik) lalu mengirim SIGKILL, dan
        container keluar dengan kode 137 — persis seperti yang teramati
        pada percobaan compose sebelumnya.
        `,
      ),
      code(
        'ts',
        `
        let siap = true;
        const server = app.listen(3000);

        for (const sinyal of ['SIGTERM', 'SIGINT']) {
          process.on(sinyal, async () => {
            siap = false;                       // /readyz mulai menjawab 503
            // Beri penyeimbang beban waktu MELIHAT perubahan itu
            // sebelum berhenti menerima koneksi.
            await new Promise((r) => setTimeout(r, 5000));
            server.close(async () => {
              await db.end();
              process.exit(0);
            });
            // Jaring pengaman: jangan menggantung selamanya.
            setTimeout(() => process.exit(1), 25000).unref();
          });
        }
        `,
      ),
      p(
        'Jeda lima detik itu sering dianggap berlebihan dan justru bagian yang paling menentukan. Penyeimbang beban memerlukan waktu untuk melihat bahwa sebuah instance tidak lagi siap, dan tanpa jeda itu, permintaan tetap dikirim ke proses yang sudah menutup pendengarnya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan healthcheck punya bentuk yang khas, dan yang paling merugikan adalah healthcheck yang terlalu bersemangat.',
      ),
      code(
        'text',
        `
        1. Container di-restart terus-menerus

           STATUS: Restarting (1) 4 seconds ago

           Sering karena start_period terlalu pendek. Aplikasi yang
           butuh 20 detik untuk menyala dinyatakan tidak sehat pada
           detik ke-5, dibunuh, lalu menyala lagi dari nol. Selamanya.

           Perbaikan: start_period yang realistis, atau pakai startup
           probe terpisah.

        2. Seluruh armada mati bersamaan

           Liveness memeriksa basis data. Basis data tersendat 30 detik.
           SEMUA instance dinyatakan tidak sehat dan direstart bersamaan.
           Saat menyala, semuanya membuka koneksi baru sekaligus, dan
           basis datanya makin tersendat.

           Perbaikan: liveness TIDAK memeriksa dependency.

        3. Healthcheck-nya sendiri yang membebani

           interval: 1s dengan pemeriksaan yang menjalankan query
           agregasi berarti satu query berat setiap detik per instance.

           Perbaikan: pemeriksaan harus murah, dan interval yang wajar
           dimulai dari 10 detik untuk produksi.
        `,
      ),
      p('Ada juga bentuk yang tidak memeriksa apa pun, dan ini yang paling sering ditemukan.'),
      code(
        'text',
        `
          HEALTHCHECK CMD curl -f http://localhost:3000/ || exit 1

        Masalahnya berlapis:

          - curl sering TIDAK ADA di image alpine atau distroless,
            sehingga pemeriksaannya selalu gagal dengan kode 127
          - halaman / bisa saja dilayani dari cache statis dan
            menjawab 200 meski aplikasinya tidak berfungsi
          - tanpa --max-time, pemeriksaan yang menggantung menghabiskan
            timeout dan menandai container tidak sehat

        Bentuk yang lebih aman memakai runtime yang SUDAH PASTI ada
        di image:

          HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \\
            CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
        `,
      ),
      code(
        'text',
        `
        DAN YANG PALING BERBAHAYA: endpoint kesehatan yang terbuka
        dan terlalu informatif.

          GET /healthz
          {"ok":true,"versi":"2.4.1","db":"postgres://app:rahasia@db:5432",
           "commit":"a1b2c3d","env":{"NODE_ENV":"production",...}}

        Endpoint ini biasanya tidak dilindungi, sebab penyeimbang beban
        harus bisa memanggilnya. Ia tidak boleh memuat apa pun selain
        status. Rincian diagnostik ditaruh di endpoint terpisah yang
        memerlukan autentikasi.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Menjalankan container di produksi menuntut beberapa hal yang tidak pernah terasa penting saat pengembangan lokal.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memeriksa dependency di dalam liveness',
            'Kalau basis data mati, aplikasinya kan tidak berguna',
            'Seluruh armada direstart bersamaan saat basis data tersendat, dan itu memperburuk keadaan',
          ],
          [
            'Memakai `start_period` yang terlalu pendek',
            'Aplikasinya kan cepat menyala',
            'Diukur, aplikasi butuh 3 detik dan statusnya `starting` sampai detik ke-4. Yang lebih berat butuh puluhan detik',
          ],
          [
            'Memakai `curl` di dalam `HEALTHCHECK`',
            'Perintah yang paling umum',
            '`curl` sering tidak ada di image alpine. Pemeriksaannya selalu gagal dengan kode 127',
          ],
          [
            'Tidak menangani `SIGTERM`',
            'Container-nya kan tinggal dimatikan',
            'Permintaan yang sedang berjalan terputus, dan container keluar dengan kode 137 setelah batas waktu',
          ],
          [
            'Menutup server seketika saat `SIGTERM` tiba',
            'Itu kan yang diminta',
            'Penyeimbang beban belum sempat tahu. Tandai tidak siap dulu, beri jeda, baru tutup',
          ],
          [
            'Membuat `/healthz` yang memuat rincian konfigurasi',
            'Biar gampang mendiagnosis',
            'Endpoint itu biasanya tidak dilindungi. Ia hanya boleh memuat status, tanpa versi dan tanpa kredensial',
          ],
        ],
      ),
      p(
        'Cara memeriksa apakah seluruh rangkaian ini benar tidak memerlukan produksi. Jalankan container secara lokal, kirim permintaan yang sengaja lambat, lalu jalankan `docker stop` di tengah-tengah. Permintaan itu harus selesai dengan benar, dan container-nya harus keluar dengan kode `0`, bukan `137`. Bila hasilnya `137`, berarti sinyalnya tidak pernah sampai atau tidak pernah ditangani, dan setiap rilis yang kamu lakukan sedang memutus permintaan pengguna.',
      ),
      references(
        {
          label: 'HEALTHCHECK',
          href: 'https://docs.docker.com/reference/dockerfile/#healthcheck',
          source: 'Docker Docs',
          note: 'Bentuk instruksi beserta arti tiap status yang muncul di `docker ps`',
        },
        {
          label: 'Configure Liveness, Readiness and Startup Probes',
          href: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/',
          source: 'Kubernetes Docs',
          note: 'Pemisahan tiga jenis probe dan akibat berbeda dari masing-masing kegagalan',
        },
        {
          label: 'Disposability',
          href: 'https://12factor.net/disposability',
          source: 'Twelve-Factor App',
          note: 'Kenapa proses harus cepat menyala dan tertib saat dimatikan',
        },
      ),
    ],
  ),
];
