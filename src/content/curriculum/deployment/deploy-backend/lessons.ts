import { callout, code, compare, h2, ol, p, steps, table } from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Deployment — Chapter 4, all five lessons.
 *
 * Express and Laravel to production. Lesson 4.4 (migrations during deploy) is the one that most
 * often causes irreversible damage, so it gets the most space and the sharpest warnings.
 */
export const lessons: LessonDraft[] = [
  written(
    'deploy-express',
    'Deploy Express: VPS vs PaaS',
    12,
    'Dua jalur dengan pembagian tanggung jawab yang berbeda.',
    [
      h2('Memilih'),
      table(
        ['', 'PaaS (Railway, Render, Fly)', 'VPS'],
        [
          ['Waktu setup', 'Menit', 'Jam'],
          ['Yang kamu urus', 'Kode saja', '**Semuanya**'],
          ['TLS', 'Otomatis', 'Kamu'],
          ['Pembaruan OS', 'Mereka', '**Kamu**'],
          ['Biaya kecil', 'Sedang', 'Murah'],
          ['Biaya besar', 'Mahal', 'Tetap'],
          ['Kendali', 'Terbatas', 'Penuh'],
        ],
      ),
      callout(
        'tip',
        'Untuk memulai, PaaS hampir selalu pilihan yang tepat',
        'Biaya sungguhan VPS bukan harga sewanya, melainkan jam yang habis untuk TLS, pembaruan keamanan, pemantauan, cadangan, dan deploy tanpa downtime. Untuk belajar, VPS sangat berharga; untuk sesuatu yang harus tetap hidup, hitung dulu siapa yang bangun jam tiga pagi.',
      ),

      h2('PaaS'),
      code(
        'json',
        `
        {
          "scripts": {
            "build": "tsc",
            "start": "node dist/server.js",
            "postinstall": "prisma generate"
          },
          "engines": { "node": ">=22 <23" }
        }
        `,
      ),
      code(
        'bash',
        `
        fly launch
        fly secrets set DATABASE_URL="..." JWT_SECRET="..."
        fly deploy
        fly logs
        `,
      ),

      h2('VPS: manajer proses'),
      code(
        'bash',
        `
        npm install -g pm2

        pm2 start dist/server.js --name api -i max     # satu proses per inti CPU
        pm2 save
        pm2 startup                                    # nyala otomatis setelah reboot
        `,
      ),
      code(
        'js',
        `
        // ecosystem.config.js
        module.exports = {
          apps: [{
            name: 'api',
            script: 'dist/server.js',
            instances: 'max',
            exec_mode: 'cluster',

            // Batas memori supaya kebocoran tidak menjatuhkan server
            max_memory_restart: '500M',

            env_production: { NODE_ENV: 'production' },

            // Tulis ke stdout; biarkan lingkungan yang mengumpulkan
            out_file: '/dev/stdout',
            error_file: '/dev/stderr',
          }],
        };
        `,
      ),
      callout(
        'warning',
        'Mode cluster mensyaratkan aplikasi yang benar-benar stateless',
        'Beberapa proses berarti sesi di memori tidak lagi bekerja, dan rate limit di memori efektif dikalikan jumlah proses. Keduanya harus pindah ke Redis atau database **sebelum** menambah proses kedua.',
      ),

      h2('Deploy tanpa downtime'),
      code(
        'bash',
        `
        #!/usr/bin/env bash
        set -euo pipefail        # berhenti pada error pertama

        cd /var/www/api

        git fetch origin
        git checkout "$1"        # deploy dari SHA atau tag, bukan dari branch

        npm ci --omit=dev
        npm run build

        # Migrasi SEBELUM kode baru menerima trafik
        npx prisma migrate deploy

        # Reload bergilir — proses lama tetap melayani sampai yang baru siap
        pm2 reload ecosystem.config.js --env production

        # Pekerja antrean memuat kode sekali -> WAJIB dimulai ulang
        pm2 reload antrean

        # Verifikasi
        sleep 3
        curl -fsS http://localhost:3000/health/ready > /dev/null || {
          echo "Health check GAGAL"; exit 1;
        }
        `,
        { filename: 'deploy.sh' },
      ),
      callout(
        'danger',
        '`pm2 restart` memutus permintaan; `pm2 reload` tidak',
        '`restart` mematikan semua proses lalu menyalakan yang baru — ada jeda saat tidak ada yang melayani, dan permintaan yang sedang berjalan terputus di tengah, termasuk yang sedang menulis ke database. `reload` mengganti proses satu per satu.',
      ),

      h2('Graceful shutdown di aplikasi'),
      code(
        'js',
        `
        const server = app.listen(env.PORT);

        for (const sinyal of ['SIGTERM', 'SIGINT']) {
          process.on(sinyal, async () => {
            log.info({ sinyal }, 'menutup server');

            // Berhenti menerima koneksi baru, selesaikan yang sedang berjalan
            server.close(async () => {
              await pool.end();
              await redis.quit();
              process.exit(0);
            });

            // Jangan menggantung selamanya
            setTimeout(() => process.exit(1), 15_000).unref();
          });
        }
        `,
      ),
      p(
        'Tanpa ini, `reload` tetap memutus permintaan yang sedang diproses — manajer prosesnya sudah benar, tapi aplikasinya tidak ikut bekerja sama.',
      ),

      h2('Nginx di depan'),
      code(
        'text',
        `
        upstream api { server 127.0.0.1:3000; keepalive 32; }

        server {
            listen 443 ssl http2;
            server_name api.contoh.com;

            client_max_body_size 10m;
            proxy_read_timeout 30s;

            location / {
                proxy_pass http://api;
                proxy_http_version 1.1;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
        `,
      ),
      callout(
        'danger',
        "Aplikasi harus `app.set('trust proxy', 1)` — angka, bukan `true`",
        'Tanpa itu, aplikasi melihat semua permintaan datang dari `127.0.0.1` dan rate limit per IP jadi tidak berguna. Dengan `true`, ia mempercayai seluruh rantai `X-Forwarded-For` yang bisa dipalsukan siapa pun — dan rate limit jadi tidak berguna dengan cara yang berbeda.',
      ),

      h2('Setelah deploy'),
      code(
        'bash',
        `
        curl -fsS https://api.contoh.com/health/ready | jq
        pm2 logs api --lines 50
        pm2 monit
        `,
      ),
    ],
  ),

  written(
    'deploy-laravel',
    'Deploy Laravel',
    12,
    'Urutan perintah yang benar, dan yang terjadi kalau salah urutan.',
    [
      h2('Kebutuhan server'),
      code(
        'bash',
        `
        php 8.3+ dengan ekstensi:
          bcmath ctype curl dom fileinfo json mbstring
          openssl pcre pdo pdo_pgsql tokenizer xml

        composer
        nginx atau caddy
        supervisor        # untuk pekerja antrean
        `,
      ),

      h2('Nginx'),
      code(
        'text',
        `
        server {
            listen 443 ssl http2;
            server_name api.contoh.com;

            # HANYA public/ — bukan akar project.
            # Kalau ini salah, .env bisa diunduh siapa pun.
            root /var/www/app/public;
            index index.php;

            client_max_body_size 10m;

            location / {
                try_files $uri $uri/ /index.php?$query_string;
            }

            location ~ \\.php$ {
                fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
                fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
                include fastcgi_params;
            }

            # Jangan sajikan berkas tersembunyi
            location ~ /\\. { deny all; }
        }
        `,
      ),
      callout(
        'danger',
        'Document root yang salah adalah kompromi total',
        'Kalau `root` menunjuk `/var/www/app` alih-alih `/var/www/app/public`, maka `https://api.contoh.com/.env` bisa diunduh — lengkap dengan kredensial database, `APP_KEY`, dan token pihak ketiga. Ini kesalahan yang masih rutin ditemukan, dan pemindai otomatis mencarinya terus-menerus.',
      ),

      h2('Skrip deploy'),
      code(
        'bash',
        `
        #!/usr/bin/env bash
        set -euo pipefail

        cd /var/www/app

        # 1. Tolak permintaan baru dengan halaman sopan (opsional)
        php artisan down --render="errors::503" --retry=60 || true

        # 2. Ambil kode
        git fetch origin
        git checkout "$1"

        # 3. Dependency produksi saja, optimized autoloader
        composer install --no-dev --optimize-autoloader --no-interaction

        # 4. Migrasi. --force karena produksi tidak interaktif.
        php artisan migrate --force

        # 5. Cache. HARUS setelah kode baru ada.
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        php artisan event:cache

        # 6. Pekerja memuat kode SEKALI -> wajib dimulai ulang
        php artisan queue:restart

        # 7. Terima permintaan lagi
        php artisan up

        # 8. Verifikasi
        curl -fsS https://api.contoh.com/api/health > /dev/null || {
          echo "Health check GAGAL"; exit 1;
        }
        `,
        { filename: 'deploy.sh' },
      ),
      callout(
        'danger',
        'Langkah 6 adalah yang paling sering terlupa',
        'Pekerja antrean memuat kode saat dijalankan dan tidak pernah memuat ulang. Setelah deploy, mereka masih menjalankan kode **lama** — menghasilkan bug yang sangat membingungkan: perbaikan sudah di-deploy, tapi job tetap gagal persis seperti sebelumnya.',
      ),

      h2('Jebakan `config:cache`'),
      code(
        'php',
        `
        // config/layanan.php — env() BOLEH di sini
        return ['pembayaran' => ['kunci' => env('KUNCI_PEMBAYARAN')]];

        // Di mana pun SELAIN config/
        $kunci = config('layanan.pembayaran.kunci');   // BENAR
        $kunci = env('KUNCI_PEMBAYARAN');              // null setelah config:cache
        `,
      ),
      callout(
        'danger',
        'Setelah `config:cache`, `env()` mengembalikan `null` di luar berkas config',
        'Ini jebakan Laravel yang paling sering menjatuhkan deploy. Kodenya bekerja sempurna di lokal — karena di lokal konfigurasi tidak di-cache — lalu gagal misterius di produksi. Cari `env(` di luar `config/` sebelum deploy pertama.',
      ),
      code(
        'bash',
        `
        # Temukan pelanggarnya
        grep -rn "env(" app/ routes/ database/ | grep -v "config/"
        `,
      ),

      h2('Pekerja antrean dengan supervisor'),
      code(
        'text',
        `
        [program:antrean]
        process_name=%(program_name)s_%(process_num)02d
        command=php /var/www/app/artisan queue:work redis --queue=tinggi,default --max-jobs=1000 --max-time=3600
        autostart=true
        autorestart=true
        user=www-data
        numprocs=2
        stopwaitsecs=3600
        stdout_logfile=/dev/stdout
        stdout_logfile_maxbytes=0
        `,
        { filename: '/etc/supervisor/conf.d/antrean.conf' },
      ),
      p(
        '`--max-jobs` dan `--max-time` membatasi kebocoran memori jangka panjang: pekerja berhenti sendiri secara berkala, dan supervisor menyalakannya lagi dengan kondisi bersih.',
      ),

      h2('Penjadwal'),
      code(
        'bash',
        `
        # Satu baris cron untuk seluruh jadwal
        * * * * * cd /var/www/app && php artisan schedule:run >> /dev/null 2>&1
        `,
      ),

      h2('Izin berkas'),
      code(
        'bash',
        `
        chown -R www-data:www-data storage bootstrap/cache
        chmod -R 775 storage bootstrap/cache

        chmod 600 .env
        chown www-data:www-data .env
        `,
      ),

      h2('Verifikasi setelah deploy'),
      code(
        'bash',
        `
        curl -s -o /dev/null -w ".env -> %{http_code}\\n" https://api.contoh.com/.env
        # HARUS 404. Kalau 200, hentikan semuanya dan rotasi seluruh rahasia.

        curl -s https://api.contoh.com/rute-tidak-ada | grep -i "stack trace" \\
          && echo "APP_DEBUG MENYALA — perbaiki segera"

        php artisan about | grep -iE "environment|debug|cached"
        `,
      ),
    ],
  ),

  written(
    'database-terkelola',
    'Database Terkelola',
    10,
    'Menyerahkan bagian yang paling mahal kalau salah.',
    [
      p(
        'Menjalankan database sendiri berarti kamu bertanggung jawab atas cadangan, replikasi, failover, pembaruan keamanan, dan penyetelan — dan setiap kesalahan di sana bisa berarti kehilangan data permanen.',
      ),

      h2('Yang diurus penyedia'),
      table(
        ['Tugas', 'Terkelola', 'Sendiri'],
        [
          ['Cadangan otomatis', 'Ya', 'Kamu'],
          ['Point-in-time recovery', 'Biasanya ya', 'Rumit'],
          ['Pembaruan keamanan', 'Ya', 'Kamu'],
          ['Replika baca', 'Beberapa klik', 'Rumit'],
          ['Failover', 'Otomatis', 'Kamu'],
          ['Pemantauan', 'Bawaan', 'Kamu'],
          ['Biaya', 'Lebih tinggi', 'Lebih rendah + waktumu'],
        ],
      ),
      callout(
        'tip',
        'Database adalah tempat terakhir untuk berhemat',
        'Server aplikasi yang mati bisa dinyalakan lagi. Data yang hilang tidak bisa dikembalikan. Untuk apa pun yang datanya penting, database terkelola hampir selalu keputusan yang benar — biayanya kecil dibanding risiko yang ia hilangkan.',
      ),

      h2('Connection pooling'),
      code(
        'text',
        `
        Tanpa pooler:
          100 instance serverless x 5 koneksi = 500 koneksi
          Postgres default: 100 -> KEHABISAN, seluruh aplikasi gagal

        Dengan pooler:
          500 koneksi klien -> 20 koneksi sungguhan ke database
        `,
      ),
      code(
        'bash',
        `
        # Aplikasi menunjuk pooler
        DATABASE_URL="postgresql://user:sandi@pooler.contoh.com:6543/app?pgbouncer=true"

        # Migrasi butuh koneksi LANGSUNG (pooler transaction mode
        # tidak mendukung sebagian perintah DDL)
        DIRECT_URL="postgresql://user:sandi@db.contoh.com:5432/app"
        `,
      ),
      callout(
        'danger',
        'Kehabisan koneksi menjatuhkan seluruh aplikasi sekaligus',
        'Bukan hanya endpoint yang sibuk — **setiap** permintaan yang butuh database ikut gagal, termasuk health check. Gejalanya sering disalahartikan sebagai "database lambat", padahal databasenya baik-baik saja dan yang habis adalah slot koneksinya.',
      ),

      h2('Batas koneksi di aplikasi'),
      code(
        'js',
        `
        const pool = new Pool({
          connectionString: env.DATABASE_URL,
          max: 10,                          // per instance
          connectionTimeoutMillis: 5_000,   // jangan menunggu selamanya
          idleTimeoutMillis: 30_000,
        });
        `,
      ),

      h2('Replika baca'),
      code(
        'php',
        `
        // config/database.php
        'pgsql' => [
            'read'  => ['host' => [env('DB_READ_HOST')]],
            'write' => ['host' => [env('DB_HOST')]],
            // ...
        ],
        `,
      ),
      callout(
        'warning',
        'Replika punya jeda replikasi',
        'Menulis lalu langsung membaca dari replika bisa mengembalikan data **lama** — pengguna menyimpan sesuatu lalu tidak melihatnya di halaman berikutnya. Untuk pembacaan setelah penulisan, paksa memakai koneksi tulis. Replika cocok untuk laporan dan analitik, bukan untuk alur baca-setelah-tulis.',
      ),

      h2('Keamanan'),
      ol(
        '**Jangan pernah** ekspos database ke internet — batasi ke IP atau jaringan privat aplikasimu.',
        '**Wajibkan TLS** dengan `sslmode=verify-full`, bukan sekadar `require`.',
        '**User terpisah** untuk aplikasi, migrasi, dan pembacaan laporan.',
        '**Hak minimum** — aplikasi yang tidak mengubah skema tidak boleh jadi pemilik skema.',
        '**Rotasi kredensial** terjadwal, dan setelah ada yang keluar dari tim.',
      ),
      code(
        'sql',
        `
        -- User aplikasi: hanya DML
        CREATE USER app_user WITH PASSWORD '...';
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

        -- User migrasi: boleh DDL, dipakai HANYA saat deploy
        CREATE USER migrasi_user WITH PASSWORD '...';
        GRANT ALL ON SCHEMA public TO migrasi_user;
        `,
      ),
      callout(
        'tip',
        'Pemisahan ini membatasi dampak injeksi yang lolos',
        'Kalau suatu hari ada SQL injection yang tidak tertutup, kredensial tanpa hak `DROP` dan `ALTER` membuat kerusakannya jauh lebih terbatas. Ini pertahanan lapis kedua yang murah dipasang.',
      ),

      h2('Cadangan'),
      code(
        'bash',
        `
        # Verifikasi cadangan benar-benar ada dan bisa dipulihkan
        pg_dump "$DATABASE_URL" | gzip > cadangan-$(date +%F).sql.gz

        # UJI PEMULIHANNYA — ini bagian yang paling sering dilewati
        createdb uji_pulih
        gunzip -c cadangan-2026-08-02.sql.gz | psql uji_pulih
        psql uji_pulih -c "SELECT count(*) FROM pengguna;"
        `,
      ),
      callout(
        'danger',
        'Cadangan yang tidak pernah diuji bukan cadangan',
        'Ia asumsi. Cadangan bisa kosong, terpotong, atau memakai versi yang tidak kompatibel — dan semuanya baru ketahuan pada hari kamu benar-benar membutuhkannya. Uji pemulihan secara berkala, dan catat berapa lama prosesnya.',
      ),
    ],
  ),

  written(
    'migrasi-saat-deploy',
    'Menjalankan Migrasi saat Deploy',
    12,
    'Langkah yang paling sering menyebabkan kerusakan yang tidak bisa dibatalkan.',
    [
      p(
        'Kode bisa di-rollback dalam hitungan detik. Migrasi yang menghapus kolom tidak bisa. Sub-bab ini tentang menjalankan perubahan skema sehingga rollback kode **tetap aman**.',
      ),

      h2('Masalah urutan'),
      code(
        'text',
        `
        Deploy kode baru + migrasi yang menghapus kolom lama:

        t0  migrasi jalan       -> kolom 'nama' DIHAPUS
        t1  kode baru di-deploy -> memakai 'nama_lengkap'  ✓
        t2  ada bug, rollback   -> kode LAMA memakai 'nama'
                                -> kolomnya sudah tidak ada
                                -> aplikasi gagal total

        Rollback kode tidak menolong. Kamu terjebak.
        `,
      ),

      h2('Expand → migrate → contract'),
      steps(
        {
          title: 'Rilis 1 — EXPAND: tambahkan yang baru',
          body: 'Tambahkan kolom `nama_lengkap` sebagai nullable. Kode menulis ke **keduanya**, membaca dari yang lama. Kode lama masih bekerja penuh — rollback aman.',
        },
        {
          title: 'Rilis 2 — MIGRATE: isi dan pindahkan pembacaan',
          body: 'Backfill data ke kolom baru lewat job berbatch, lalu ubah kode agar membaca dari yang baru sambil tetap menulis ke keduanya. Rollback masih aman.',
        },
        {
          title: 'Rilis 3 — berhenti menulis ke yang lama',
          body: 'Kode hanya menyentuh kolom baru. Kolom lama masih ada tapi tidak dipakai. Rollback masih aman.',
        },
        {
          title: 'Rilis 4 — CONTRACT: hapus yang lama',
          body: 'Baru sekarang kolom lama dihapus. Sampai titik ini, setiap rilis bisa di-rollback tanpa kerusakan.',
        },
      ),
      callout(
        'tip',
        'Empat rilis terasa berlebihan sampai kamu membutuhkannya sekali',
        'Sebagian besar perubahan skema memang tidak butuh ini — menambah kolom nullable aman dilakukan sekali jalan. Pola ini untuk yang **destruktif**: menghapus, mengganti nama, mengubah tipe. Di sanalah rollback menjadi mustahil kalau urutannya salah.',
      ),

      h2('Migrasi yang aman dan yang berbahaya'),
      table(
        ['Aman', 'Berbahaya'],
        [
          ['Tambah kolom nullable', '**Hapus kolom**'],
          ['Tambah tabel', '**Ganti nama kolom**'],
          ['Tambah index (`CONCURRENTLY`)', '**Ubah tipe kolom**'],
          ['Longgarkan constraint', 'Tambah `NOT NULL` ke tabel berisi'],
          ['Tambah nilai enum', 'Hapus nilai enum'],
          ['', 'Tambah `UNIQUE` ke data yang mungkin duplikat'],
        ],
      ),

      h2('Index tanpa mengunci tabel'),
      code(
        'sql',
        `
        -- Mengunci tabel — penulisan berhenti sampai selesai.
        -- Pada tabel besar bisa berarti gangguan bermenit-menit.
        CREATE INDEX idx_artikel_penulis ON artikel(penulis_id);

        -- Tidak mengunci. Lebih lambat, tapi aplikasi tetap jalan.
        CREATE INDEX CONCURRENTLY idx_artikel_penulis ON artikel(penulis_id);
        `,
      ),
      callout(
        'warning',
        '`CONCURRENTLY` tidak bisa berjalan di dalam transaksi',
        'Sebagian besar alat migrasi membungkus setiap migrasi dalam transaksi secara default, jadi kamu harus mematikannya khusus untuk migrasi itu. Kalau ia gagal di tengah, ia meninggalkan index dalam keadaan tidak valid yang harus dihapus manual.',
      ),
      code(
        'php',
        `
        // Laravel
        public $withinTransaction = false;

        public function up(): void
        {
            DB::statement('CREATE INDEX CONCURRENTLY idx_artikel_penulis ON artikel(penulis_id)');
        }
        `,
      ),

      h2('Backfill jangan di dalam migrasi'),
      compare(
        {
          title: 'Berbahaya',
          lang: 'php',
          code: `
          public function up(): void
          {
              Schema::table('artikel', fn ($t) =>
                  $t->string('slug')->nullable());

              // 5 juta baris, di dalam deploy.
              // Deploy menggantung berjam-jam.
              DB::table('artikel')->get()->each(...);
          }
          `,
          notes: ['Deploy tertahan', 'Tidak bisa dipantau', 'Gagal di tengah = keadaan tak jelas'],
        },
        {
          title: 'Benar',
          lang: 'php',
          code: `
          // Migrasi: hanya skema. Cepat.
          Schema::table('artikel', fn ($t) =>
              $t->string('slug')->nullable());

          // Backfill: job berbatch, terpisah.
          // Bisa dipantau, dihentikan, diulang.
          BackfillSlug::dispatch();
          `,
          notes: ['Deploy tetap cepat', 'Kemajuannya terlihat'],
        },
      ),
      code(
        'php',
        `
        // Job backfill — chunkById, bukan chunk
        Artikel::whereNull('slug')->chunkById(500, function ($batch) {
            foreach ($batch as $a) {
                $a->update(['slug' => Str::slug($a->judul) . '-' . $a->id]);
            }
            usleep(100_000);   // beri napas ke database
        });
        `,
      ),

      h2('Kapan migrasi dijalankan'),
      code(
        'bash',
        `
        # Untuk migrasi ADITIF: sebelum kode baru
        npx prisma migrate deploy && deploy_kode

        # Untuk migrasi DESTRUKTIF: rilis terpisah, setelah kode
        # yang memakai kolom lama sudah tidak ada di mana pun.
        `,
      ),
      callout(
        'danger',
        'Jangan pernah `prisma migrate dev` atau `migrate:fresh` di produksi',
        '`migrate dev` boleh **menghapus dan membangun ulang** database saat mendeteksi penyimpangan skema. `migrate:fresh` menghapus semua tabel tanpa bertanya. Keduanya dirancang untuk laptop. Di produksi hanya `migrate deploy` dan `php artisan migrate --force` yang aman.',
      ),

      h2('Sebelum menjalankan migrasi di produksi'),
      ol(
        '**Ada cadangan yang baru**, dan pemulihannya sudah pernah diuji.',
        'Migrasi sudah dijalankan di staging dengan **volume data realistis**.',
        '`down()` sudah benar-benar diuji dengan rollback.',
        'Migrasi destruktif dipisah ke rilisnya sendiri.',
        'Backfill besar berjalan sebagai job, bukan di dalam migrasi.',
        'Ada rencana kalau ia gagal di tengah — dan siapa yang memutuskan.',
      ),
      callout(
        'warning',
        'Menguji migrasi pada tabel kosong tidak membuktikan apa pun',
        'Migrasi yang selesai dalam 50 milidetik di laptop bisa mengunci tabel selama sepuluh menit pada lima juta baris. Uji pada salinan data yang volumenya mendekati produksi — itu satu-satunya cara mengetahui berapa lama gangguannya.',
      ),
    ],
  ),

  written(
    'storage-cdn',
    'Penyimpanan Berkas & CDN',
    10,
    'Menyimpan berkas di luar server, dan menyajikannya dengan cepat.',
    [
      h2('Kenapa bukan disk server'),
      table(
        ['Masalah disk lokal', 'Akibat'],
        [
          ['Hilang saat instance diganti', 'Unggahan pengguna lenyap'],
          ['Tidak dibagi antar instance', 'Berkas hanya ada di satu server'],
          ['Tidak ikut cadangan otomatis', 'Tidak bisa dipulihkan'],
          ['Kapasitas terbatas', 'Disk penuh menjatuhkan aplikasi'],
          ['Tidak ada CDN', 'Lambat bagi pengguna yang jauh'],
        ],
      ),
      callout(
        'danger',
        'Menyimpan unggahan di disk server hampir selalu keputusan yang disesali',
        'Ia bekerja sempurna sampai instance pertama diganti — saat autoscaling, saat deploy dengan container, atau saat server dipindah. Lalu berkasnya hilang, dan tidak ada cadangan karena yang dicadangkan hanya database.',
      ),

      h2('Object storage'),
      code(
        'js',
        `
        import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

        // API yang sama untuk S3, R2, Spaces, MinIO — hanya endpoint yang berbeda
        const s3 = new S3Client({
          region: env.S3_REGION,
          endpoint: env.S3_ENDPOINT,
          credentials: { accessKeyId: env.S3_KEY, secretAccessKey: env.S3_SECRET },
        });

        await s3.send(new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: \`unggahan/\${penggunaId}/\${crypto.randomUUID()}.jpg\`,
          Body: buffer,
          ContentType: 'image/jpeg',
          // Bucket PRIVAT — jangan pernah public-read untuk unggahan pengguna
        }));
        `,
      ),
      callout(
        'danger',
        'Bucket publik adalah penyebab kebocoran data yang berulang terjadi',
        'Dokumen, foto identitas, dan berkas internal yang bisa diakses siapa pun yang menebak URL-nya. Setel privat sebagai default, dan periksa kebijakan bucket-nya di konsol penyedia — bukan hanya di konfigurasi aplikasi.',
      ),

      h2('Menyajikan berkas privat'),
      code(
        'js',
        `
        // URL bertanda tangan, berumur pendek
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket, Key }),
          { expiresIn: 300 },
        );
        `,
      ),
      code(
        'js',
        `
        // Atau lewat aplikasi, dengan pemeriksaan otorisasi
        export async function unduh(req, res) {
          // ID berkas BUKAN bukti kewenangan
          const berkas = await repo.cariBerkas(req.params.id, req.pengguna.id);
          if (berkas === null) return kirim404(res);

          res.set({
            'Content-Type': berkas.mime,
            'Content-Disposition': \`attachment; filename="\${encodeURIComponent(berkas.namaAsli)}"\`,
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'private, no-store',
          });

          streamDariS3(berkas.kunci).pipe(res);
        }
        `,
      ),
      callout(
        'warning',
        'URL bertanda tangan tetap bisa diteruskan',
        'Selama masa berlakunya, siapa pun yang memegangnya bisa mengunduh. Buat sesingkat mungkin — hitungan menit — dan jangan pernah menaruhnya di tempat yang tercatat seperti log akses atau riwayat pesan.',
      ),

      h2('CDN untuk aset publik'),
      code(
        'text',
        `
        Pengguna  ->  CDN (terdekat)  ->  Object storage (asal)
                       │
                       └── cache; permintaan berikutnya tidak sampai ke asal
        `,
      ),
      code(
        'js',
        `
        // Aset dengan hash di nama -> aman di-cache selamanya
        CacheControl: 'public, max-age=31536000, immutable'

        // Aset yang bisa berubah dengan nama tetap
        CacheControl: 'public, max-age=300, stale-while-revalidate=3600'
        `,
      ),
      callout(
        'tip',
        'Hash di nama berkas menghapus kebutuhan invalidasi',
        'Menghapus entri cache yang tersebar di banyak lokasi CDN sulit dijamin dan sering lambat. Mengubah nama berkas selalu bekerja seketika — itulah alasan bundler menaruh hash di nama keluarannya.',
      ),

      h2('Yang harus ada'),
      ol(
        'Bucket **privat** sebagai default.',
        'Nama berkas **dibuat server**, bukan dari klien.',
        'Kuota per pengguna, supaya satu akun tidak menghabiskan penyimpanan.',
        'Kebijakan siklus hidup: hapus berkas sementara dan ekspor lama otomatis.',
        'Berkas dihapus saat rekamannya dihapus — berkas yatim menumpuk tanpa batas.',
        'CORS di bucket dibatasi ke origin yang benar-benar perlu.',
      ),
      code(
        'json',
        `
        [
          {
            "AllowedOrigins": ["https://app.contoh.com"],
            "AllowedMethods": ["GET", "PUT"],
            "AllowedHeaders": ["content-type"],
            "MaxAgeSeconds": 3000
          }
        ]
        `,
      ),
      callout(
        'warning',
        'CORS bucket dengan `*` membuat berkasmu bisa dibaca situs mana pun',
        'Untuk aset publik itu mungkin memang yang diinginkan. Untuk bucket yang menyimpan unggahan pengguna — meski privat — batasi ke origin aplikasimu sendiri.',
      ),
    ],
  ),
];
