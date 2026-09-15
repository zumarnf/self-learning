import {
  callout,
  code,
  compare,
  h2,
  ol,
  p,
  references,
  steps,
  table,
  terms,
} from '@/lib/content/builders';
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
    19,
    'Dua jalur dengan pembagian tanggung jawab yang berbeda.',
    [
      terms(
        {
          term: 'process manager',
          meaning:
            'Program yang menjaga aplikasi Node.js tetap hidup, menyalakannya ulang saat mati, dan menjalankannya otomatis saat mesin menyala. Contohnya systemd bawaan Linux dan PM2. Tanpa ini, satu kegagalan berarti layanan mati sampai ada yang menyadarinya.',
        },
        {
          term: 'clustering',
          meaning:
            'Menjalankan beberapa proses Node.js sekaligus supaya seluruh inti CPU terpakai, sebab satu proses Node hanya memakai satu inti untuk kode JavaScript-mu. Jumlah yang wajar mengikuti jumlah inti yang tersedia.',
        },
        {
          term: 'graceful shutdown',
          meaning:
            'Mematikan proses dengan tertib setelah menerima `SIGTERM`, yaitu berhenti menerima koneksi baru, menyelesaikan permintaan yang sedang berjalan, menutup koneksi basis data, lalu keluar. Tanpa ini, tiap rilis memutus permintaan pengguna di tengah jalan.',
        },
        {
          term: 'trust proxy',
          meaning:
            'Setelan Express yang menentukan berapa lapis proxy di depan boleh dipercaya saat membaca header `X-Forwarded-*`. Menyalakannya tanpa proxy di depan berarti mempercayai header yang dikirim langsung oleh siapa pun, termasuk penyerang yang ingin memalsukan alamat IP-nya.',
        },
        {
          term: 'NODE_ENV=production',
          meaning:
            'Nilai variabel lingkungan yang membuat Express dan banyak pustaka lain mematikan perilaku khusus pengembangan, misalnya menyajikan halaman error lengkap dan menonaktifkan cache view. Melewatkannya adalah salah satu penyebab paling umum aplikasi produksi berjalan jauh lebih lambat daripada seharusnya.',
        },
        {
          term: 'reverse proxy',
          meaning:
            'Server di depan aplikasi yang menghentikan TLS, menyajikan berkas statis, dan membagi beban. Menyerahkan tugas itu kepadanya membuat proses Node fokus menjalankan logika aplikasi.',
        },
        {
          term: 'connection pool',
          meaning:
            'Sekumpulan koneksi basis data yang dibuka sekali lalu dipakai bergantian, bukan dibuka dan ditutup tiap permintaan. Ukurannya perlu ditakar terhadap batas koneksi basis data, sebab beberapa proses aplikasi yang masing-masing punya pool besar bisa menghabiskannya.',
        },
        {
          term: 'zero-downtime deploy',
          meaning:
            'Rilis yang tidak memutus layanan, dengan menyalakan instance baru sampai lulus pemeriksaan kesiapan sebelum instance lama dihentikan. Bergantung pada dua hal yang harus ada lebih dulu, yaitu health check yang jujur dan graceful shutdown.',
        },
      ),

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
      p(
        'Empat baris di `package.json` itu adalah **kontrak** antara kode dan platform. PaaS tidak menebak cara menjalankan aplikasimu: ia menjalankan `build` untuk menyiapkan artefak, lalu `start` untuk menjalankannya. `postinstall` berjalan otomatis setelah `npm install` — di sinilah `prisma generate` diletakkan, karena klien Prisma harus dibuat ulang di mesin tujuan dan tidak boleh ikut ter-commit.',
      ),
      p(
        '`"engines": { "node": ">=22 <23" }` mengunci versi Node yang dipakai platform. Tanpa itu, penyedia memilih versi bawaannya — yang bisa berubah kapan saja dan membuat aplikasi yang tadinya berjalan tiba-tiba gagal build setelah deploy rutin. Rentang tertutup seperti ini lebih aman daripada `>=22` terbuka, karena mayor berikutnya bisa membawa perubahan yang memutus.',
      ),
      p(
        'Empat perintah `fly` di potongan kedua mewakili urutan yang sama di hampir semua PaaS. `fly launch` mendeteksi jenis project dan membuat konfigurasinya, `fly secrets set` menyimpan kredensial **di sisi platform** dan bukan di berkas yang ikut ter-commit, `fly deploy` membangun dan merilis, sedangkan `fly logs` yang kamu buka begitu ada yang salah. Perhatikan rahasia disetel sebagai langkah terpisah sebelum deploy pertama, sebab aplikasi yang menyala tanpa `DATABASE_URL` akan gagal saat permintaan pertama alih-alih saat deploy.',
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
      p(
        "`-i max` di perintah pertama dan `instances: 'max'` di berkas konfigurasi adalah hal yang sama: jalankan satu proses per inti CPU. Node menjalankan JavaScript di satu utas, jadi tanpa ini server delapan inti hanya memakai seperdelapan kapasitasnya. `exec_mode: 'cluster'` yang membuat semua proses itu berbagi satu porta — pm2 membagikan koneksi masuk ke antara mereka.",
      ),
      p(
        "`max_memory_restart: '500M'` adalah pengaman terhadap kebocoran memori, sebab proses yang melewati batas itu dimulai ulang sendiri, satu per satu, sehingga layanannya tetap hidup. Ia **bukan** perbaikan karena kebocorannya tetap harus dicari, tetapi ia mencegah satu proses yang bocor menghabiskan RAM server dan menjatuhkan semua yang lain.",
      ),
      p(
        'Dua baris terakhir mengarahkan log ke `/dev/stdout` dan `/dev/stderr` alih-alih ke berkas. Ini disengaja: aplikasi mencetak, dan **lingkungan** yang memutuskan ke mana tulisan itu pergi — systemd, Docker, atau agen pengumpul log. Menulis ke berkas sendiri berarti kamu juga harus mengurus rotasinya, dan berkas log yang tidak dirotasi adalah cara paling umum sebuah disk penuh.',
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
      p(
        '`set -euo pipefail` di baris kedua adalah yang membuat skrip ini aman. `-e` menghentikan skrip pada perintah pertama yang gagal, `-u` menolak variabel yang belum diset, dan `-o pipefail` membuat pipa gagal kalau salah satu bagiannya gagal. Tanpa `-e`, `npm run build` yang gagal akan **dilewati begitu saja** dan skrip lanjut me-reload aplikasi dengan artefak lama — kegagalan yang tidak terlihat sebagai kegagalan.',
      ),
      p(
        '`git checkout "$1"` memakai argumen yang dioper pemanggil, dan komentarnya menegaskan alasannya: deploy dari SHA atau tag, bukan dari nama branch. Branch bergerak — mengambilnya berarti yang terpasang adalah "apa pun isi branch itu saat perintah berjalan", yang bisa beberapa commit lebih maju daripada yang lulus CI.',
      ),
      p(
        'Urutan tiga langkah tengahnya menentukan apakah deploy ini aman. Migrasi dijalankan **sebelum** `pm2 reload` karena selama reload bergilir kode lama dan baru berjalan bersamaan — skema database harus sudah bisa melayani keduanya. Ini yang menuntut pola expand–migrate–contract: migrasi yang menghapus kolom akan mematikan proses lama yang belum sempat diganti.',
      ),
      p(
        '`pm2 reload antrean` ditulis terpisah karena pekerja antrean **memuat kode sekali** saat dimulai lalu terus menjalankannya. Tanpa baris ini, API sudah memakai versi baru sementara pekerja masih menjalankan versi lama — dan bug yang timbul dari selisih itu termasuk yang paling sulit ditelusuri. Blok `curl -fsS … || { … exit 1; }` di penutup mengubah "skrip selesai" menjadi "aplikasi terbukti sehat"; flag `-f` yang membuat status `503` dihitung sebagai kegagalan.',
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
      p(
        'Blok `upstream` mendefinisikan tujuan proxy sebagai satu nama, dan `keepalive 32` menyuruh Nginx menyimpan hingga 32 koneksi terbuka ke aplikasi untuk dipakai ulang. Tanpa itu, setiap permintaan membuka koneksi TCP baru ke `127.0.0.1:3000` — biaya kecil per permintaan yang menjadi besar pada trafik tinggi. `proxy_http_version 1.1` di bawah wajib menyertainya; keepalive tidak bekerja pada HTTP/1.0.',
      ),
      p(
        'Dua batas di tingkat `server` menutup dua jenis penyalahgunaan. `client_max_body_size 10m` menolak unggahan yang lebih besar dari 10 MB **di Nginx**, sebelum satu byte pun sampai ke aplikasi — jauh lebih murah daripada membiarkan Node membaca berkas 2 GB lalu menolaknya. `proxy_read_timeout 30s` melepas koneksi yang aplikasinya tidak kunjung menjawab, sehingga permintaan yang menggantung tidak menumpuk sampai Nginx kehabisan slot.',
      ),
      p(
        'Empat `proxy_set_header` memulihkan informasi yang hilang saat permintaan melewati proxy. `Host $host` menjaga nama domain asli, sebab tanpa ini aplikasi melihat `api` dari blok upstream. `X-Real-IP` dan `X-Forwarded-For` membawa IP pengunjung, sedangkan `X-Forwarded-Proto` memberi tahu bahwa aslinya HTTPS. Peringatan berikut menjelaskan kenapa aplikasi harus dikonfigurasi untuk mempercayai header ini secara **terbatas**, sebab mempercayainya tanpa batas sama saja membiarkan siapa pun mengaku beralamat IP apa pun.',
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
      p(
        'Tiga perintah ini menjawab tiga pertanyaan berbeda dan sebaiknya dijalankan berurutan. `curl -fsS … /health/ready | jq` memeriksa dari **luar** lewat domain publik dan TLS alih-alih dari `localhost`, sehingga ia sekaligus membuktikan DNS, sertifikat, dan Nginx bekerja. `jq` memformat JSON-nya agar rincian per dependensi terbaca.',
      ),
      p(
        '`pm2 logs api --lines 50` menampilkan 50 baris terakhir; yang dicari bukan hanya error, melainkan **jenis error baru** yang tidak ada sebelum deploy. `pm2 monit` membuka tampilan langsung memori dan CPU per proses — berguna beberapa menit pertama setelah deploy, karena kebocoran memori yang baru diperkenalkan biasanya terlihat sebagai grafik yang naik terus tanpa turun.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Pilihan antara VPS dan PaaS bukan soal harga melainkan soal **apa yang harus tetap benar selama bertahun-tahun**, dan daftarnya bisa ditulis.',
      ),
      code(
        'text',
        `
        Yang harus disiapkan dan DIJAGA sendiri di VPS:

          TLS beserta pembaruan otomatisnya
          reverse proxy dan header teruskan
          pengelola proses supaya aplikasinya menyala lagi setelah mati
          rotasi dan pengumpulan log
          pemantauan dan alarm
          cadangan, beserta pemulihan yang benar-benar dicoba
          pembaruan keamanan sistem operasi
          aturan firewall

        Di PaaS, kedelapannya sudah ada. Yang dibayar adalah
        keleluasaan: batas waktu proses, versi runtime yang tersedia,
        dan cara koneksi basis data dikelola ditentukan penyedia.
        `,
        {
          caption:
            'Tidak ada yang sulit satu per satu. Yang sering diremehkan adalah bahwa kedelapannya harus tetap benar terus-menerus.',
        },
      ),
      p(
        'Satu hal yang berlaku di keduanya dan sering terlewat adalah bahwa aplikasi di belakang proxy tidak lagi melihat pengunjung aslinya.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan dua server node:http, satu sebagai
        proxy dan satu sebagai aplikasi.

        LEWAT PROXY, dibaca secara naif:
          ip=127.0.0.1   protokol=http   host=127.0.0.1:4102

        LEWAT PROXY, membaca header teruskan:
          ip=203.0.113.7   protokol=https   host=app.contoh.id

        Akibat membaca secara naif:
          - cookie ber-atribut Secure TIDAK dipasang
            -> pengguna login, permintaan berikutnya 401, sesinya
               tidak pernah bertahan, TANPA satu pun error di log
          - pengalihan dibuat ke http:// -> perulangan pengalihan
        `,
      ),
      code(
        'text',
        `
        Dan sisi keamanannya, juga diukur:

        LANGSUNG ke aplikasi, header dipalsukan klien:
          dikirim: X-Forwarded-For: 1.2.3.4
          dibaca : ip=1.2.3.4

        Header X-Forwarded-* BISA dikirim siapa saja. Ia hanya boleh
        dipercaya bila permintaannya DIPASTIKAN lewat proxy milikmu.

          app.set('trust proxy', 1);      // satu hop, bukan "semua"

        Dan pastikan aplikasinya memang tidak bisa dihubungi langsung:
        dengarkan di 127.0.0.1, atau batasi dengan aturan jaringan.
        `,
      ),
      p(
        'Bagian ketiga yang menentukan apakah rilis terasa mulus adalah berhenti dengan rapi, dan bentuknya sudah terlihat pada percobaan container.',
      ),
      code(
        'ts',
        `
        let siap = true;
        const server = app.listen(env.PORT);

        for (const sinyal of ['SIGTERM', 'SIGINT']) {
          process.on(sinyal, async () => {
            siap = false;                        // /readyz mulai 503
            // Beri penyeimbang beban waktu MELIHAT perubahan itu
            // sebelum berhenti menerima koneksi.
            await new Promise((r) => setTimeout(r, 5000));
            server.close(async () => {
              await db.end();
              process.exit(0);
            });
            setTimeout(() => process.exit(1), 25000).unref();
          });
        }
        `,
        {
          caption:
            'Diamati di bab Docker: tanpa penanganan sinyal, container keluar dengan kode 137, yaitu dimatikan paksa.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan deploy backend punya beberapa bentuk yang gejalanya menunjuk ke tempat yang salah.',
      ),
      code(
        'text',
        `
        1. EADDRINUSE

           Error: listen EADDRINUSE: address already in use :::3000

           Proses lama belum benar-benar mati. Sering karena rilis
           sebelumnya tidak menangani SIGTERM, sehingga pengelola
           proses menyalakan yang baru sebelum yang lama selesai.

        2. Aplikasi berjalan, tidak bisa dihubungi dari luar

           Lognya menunjukkan "listening on 3000" dan tetap tidak
           terjangkau. Di dalam container, mendengarkan di 127.0.0.1
           berarti hanya dari container itu sendiri. Harus 0.0.0.0.

        3. Berhasil beberapa jam, lalu kehabisan memori

           JavaScript heap out of memory

           Sering karena sesuatu yang tumbuh tanpa batas: cache tanpa
           batas ukuran, pendengar peristiwa yang tidak pernah dilepas,
           atau interval yang tidak pernah dibersihkan.
           Diukur di bab Integrasi: dari 6 koneksi SSE, 5 yang tidak
           dibersihkan meninggalkan 25 tick yang masih menembak.

        4. 502 Bad Gateway sesudah rilis

           Proxy hidup, aplikasinya belum siap. Pengelola proses
           melaporkan "started" sebelum aplikasinya menerima koneksi.
           Yang menutupnya: healthcheck, dan tunggu sampai SEHAT.
        `,
      ),
      p(
        'Kelas kedua khas lingkungan tanpa keadaan, dan yang paling sering adalah koneksi basis data.',
      ),
      code(
        'text',
        `
          error: sorry, too many clients already
          Error: Timeout acquiring a connection from the pool

        Setiap instance membuka pool sendiri. Sepuluh instance dengan
        pool 10 berarti 100 koneksi, sementara basis data terkelola
        kecil sering hanya mengizinkan 20 sampai 100.

        Hitung mundur dari batas basis datanya:
          ukuran pool per instance = (batas koneksi - cadangan) / jumlah instance

        Dan untuk fungsi tanpa keadaan yang jumlah instance-nya
        berubah-ubah, ukuran pool 1 plus pooler eksternal hampir
        selalu jawaban yang benar.
        `,
      ),
      code(
        'text',
        `
        DAN SATU LAGI yang khas, dan tidak menghasilkan error:

          "Sesi pengguna hilang secara acak"
            -> sesi di memori proses. Begitu instance-nya dua, separuh
               permintaan mendarat di proses yang tidak tahu apa-apa

          "Job berkala berjalan dua kali"
            -> setiap instance menjalankan penjadwalnya sendiri

          "Berkas unggahan kadang tidak ditemukan"
            -> disimpan di disk lokal satu instance

        Ketiganya muncul BERSAMAAN pada hari instance ditambah dari
        satu menjadi dua, dan ketiganya berasal dari asumsi yang sama.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Deploy backend adalah tempat asumsi "hanya ada satu proses" akhirnya diuji, dan hampir semua kesalahannya berakar di sana.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membaca `req.protocol` apa adanya di belakang proxy',
            'Itu kan protokolnya',
            'Diukur, nilainya `http` meski pengunjung memakai https. Cookie `Secure` tidak pernah terpasang',
          ],
          [
            'Memercayai semua proxy dengan `trust proxy: true`',
            'Biar header teruskannya terbaca',
            'Diukur, header itu bisa dikirim siapa saja. Batasi jumlah hop, dan tutup akses langsung',
          ],
          [
            'Menyimpan sesi dan berkas di memori atau disk lokal',
            'Cepat dan sederhana',
            'Begitu instance-nya dua, sesi hilang acak dan berkas kadang tidak ditemukan',
          ],
          [
            'Tidak menangani `SIGTERM`',
            'Prosesnya kan tinggal dimatikan',
            'Permintaan yang berjalan terputus, dan proses lama menahan port sehingga yang baru gagal `EADDRINUSE`',
          ],
          [
            'Memakai ukuran pool yang sama untuk semua jumlah instance',
            'Angkanya kan sudah teruji',
            'Sepuluh instance dengan pool 10 berarti 100 koneksi. Hitung mundur dari batas basis datanya',
          ],
          [
            'Memilih VPS karena lebih murah',
            'Servernya cuma beberapa dolar',
            'Delapan hal harus tetap benar selama bertahun-tahun. Biayanya waktu, bukan uang',
          ],
        ],
      ),
      p(
        'Perlu dinyatakan apa yang diukur dan apa yang tidak. Yang **dijalankan sungguhan** adalah perilaku header teruskan di belakang reverse proxy dengan `node:http`, dan perilaku sinyal serta kode keluar container pada Docker 29.8.0. Yang **tidak dijalankan** adalah penyebaran ke VPS maupun PaaS mana pun, sebab keduanya memerlukan akun penyedia. Express sendiri juga tidak terpasang di project ini; potongan kodenya mengikuti dokumentasi resminya dan ditandai sebagai tidak dieksekusi.',
      ),
      references(
        {
          label: 'Performance Best Practices Using Express in Production',
          href: 'https://expressjs.com/en/advanced/best-practice-performance.html',
          source: 'Express Docs',
          note: 'Daftar resmi hal yang berubah antara pengembangan dan produksi',
        },
        {
          label: 'Express behind proxies',
          href: 'https://expressjs.com/en/guide/behind-proxies.html',
          source: 'Express Docs',
          note: 'Nilai `trust proxy` yang tersedia beserta akibat memilih yang keliru',
        },
        {
          label: 'process',
          href: 'https://nodejs.org/api/process.html',
          source: 'Node.js Docs',
          note: 'Sinyal yang diterima proses dan cara menanganinya saat dimatikan',
        },
        {
          label: 'Disposability',
          href: 'https://12factor.net/disposability',
          source: 'Twelve-Factor App',
          note: 'Kenapa cepat menyala dan tertib saat berhenti menjadi syarat rilis tanpa henti',
        },
      ),
    ],
  ),

  written(
    'deploy-laravel',
    'Deploy Laravel',
    18,
    'Urutan perintah yang benar, dan yang terjadi kalau salah urutan.',
    [
      terms(
        {
          term: 'config cache',
          meaning:
            'Penggabungan seluruh berkas konfigurasi Laravel menjadi satu berkas yang dimuat sekali, lewat `php artisan config:cache`. Mempercepat tiap permintaan, dengan jebakan penting, yaitu sesudah di-cache pemanggilan `env()` di luar berkas konfigurasi akan mengembalikan `null`.',
        },
        {
          term: 'route cache',
          meaning:
            'Penggabungan seluruh definisi rute menjadi satu berkas siap muat. Mempercepat aplikasi dengan banyak rute, dan tidak bisa dipakai bila ada rute yang memakai closure sebagai penangannya.',
        },
        {
          term: 'artisan',
          meaning:
            'Alat baris perintah bawaan Laravel yang menjalankan migrasi, membuat cache, membersihkan cache, dan banyak lagi. Dibaca "artisan".',
        },
        {
          term: 'opcache',
          meaning:
            'Penyimpanan hasil kompilasi skrip PHP di memori supaya tidak dikompilasi ulang tiap permintaan. Ekstensi bawaan PHP yang harus dinyalakan sendiri, dan pengaruhnya pada throughput produksi sangat besar.',
        },
        {
          term: 'storage link',
          meaning:
            'Tautan simbolik dari folder publik ke folder penyimpanan, dibuat lewat `php artisan storage:link`, supaya berkas unggahan bisa diakses lewat web. Sering terlewat saat deploy pertama dan muncul sebagai gambar yang tidak tampil.',
        },
        {
          term: 'queue worker',
          meaning:
            'Proses terpisah yang mengerjakan antrean pekerjaan latar. Karena ia memuat kode ke memori saat menyala, worker harus dimulai ulang setiap kali kode berubah, atau ia akan terus menjalankan versi lama.',
        },
        {
          term: 'maintenance mode',
          meaning:
            'Keadaan aplikasi menolak permintaan dengan halaman pemberitahuan, dinyalakan lewat `php artisan down`. Dipakai saat ada migrasi yang tidak aman berjalan bersamaan dengan lalu lintas.',
        },
        {
          term: 'APP_KEY',
          meaning:
            'Kunci enkripsi aplikasi Laravel yang dipakai untuk cookie terenkripsi dan sesi. Menggantinya membuat seluruh sesi dan data terenkripsi yang lama tidak terbaca, sehingga ia harus disimpan seperti rahasia lain dan tetap sama di seluruh instance.',
        },
      ),

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
      p(
        'Daftar ekstensi itu bukan saran — Laravel menolak menyala tanpa sebagian besarnya. Beberapa yang paling sering terlewat: `mbstring` untuk teks non-ASCII (nama dan alamat berbahasa Indonesia termasuk di dalamnya), `pdo_pgsql` untuk berbicara dengan PostgreSQL (ganti dengan `pdo_mysql` kalau memakai MySQL), dan `bcmath` untuk perhitungan angka presisi tinggi yang dipakai fitur uang.',
      ),
      p(
        'Tiga baris terakhir adalah perkakas di sekitarnya, dan `supervisor` yang paling mudah dianggap opsional padahal bukan. Pekerja antrean Laravel adalah proses yang harus **terus hidup**; tanpa pengawas yang menyalakannya kembali saat ia mati, job berhenti diproses diam-diam — email tidak terkirim, ekspor tidak selesai, dan tidak ada pesan error di mana pun.',
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
      p(
        'Baris `root /var/www/app/public;` adalah baris terpenting di seluruh konfigurasi ini, dan komentarnya sudah menegaskan alasannya. Laravel sengaja menaruh **hanya** `index.php` dan aset publik di dalam `public/`; seluruh kode, konfigurasi, dan `.env` berada satu tingkat di atasnya, di luar jangkauan web server. Menunjuk `root` ke akar project membatalkan seluruh rancangan itu sekaligus.',
      ),
      p(
        '`try_files $uri $uri/ /index.php?$query_string;` adalah mesin routing-nya. Nginx mencoba menyajikan berkas yang benar-benar ada lebih dulu (gambar, CSS); kalau tidak ada, permintaan diteruskan ke `index.php` beserta query string aslinya — dan dari situ router Laravel yang mengambil alih. Tanpa `?$query_string`, parameter seperti `?halaman=2` hilang di perjalanan.',
      ),
      p(
        'Blok `location ~ \\.php$` meneruskan berkas PHP ke PHP-FPM lewat soket Unix alih-alih porta TCP, sehingga lebih cepat dan tidak terjangkau dari jaringan. `$realpath_root` pada `SCRIPT_FILENAME` memakai jalur yang sudah diselesaikan symlink-nya, yang penting untuk deploy bergaya rilis-bertanggal. Dan `location ~ /\\. { deny all; }` menolak semua berkas berawalan titik, sebagai lapis kedua yang menutup `.env` dan `.git` seandainya `root` sempat salah.',
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
      p(
        'Delapan langkah ini **berurutan karena harus**, bukan karena kebetulan. Langkah 1 menyalakan mode pemeliharaan; `|| true` di ujungnya mencegah skrip berhenti kalau aplikasi memang sudah dalam mode itu — satu-satunya tempat di skrip ini yang kegagalannya sengaja diabaikan. `--retry=60` memberi tahu klien (dan mesin pencari) lewat header `Retry-After` untuk mencoba lagi satu menit kemudian.',
      ),
      p(
        'Langkah 3 memakai `--no-dev` agar paket pengembangan tidak ikut ke produksi, dan `--optimize-autoloader` yang memindai seluruh kelas lalu membuat peta statis — tanpa itu, PHP mencari berkas kelas satu per satu di setiap permintaan. `--no-interaction` wajib karena tidak ada manusia yang menjawab prompt di server, sama seperti `--force` pada `migrate` di langkah 4.',
      ),
      p(
        'Urutan langkah 4 dan 5 yang paling menentukan. Perintah `config:cache`, `route:cache`, `view:cache`, dan `event:cache` menulis versi terkompilasi dari konfigurasi dan rute ke disk — dan itu **harus** terjadi setelah kode baru ada, karena yang di-cache adalah isi kode saat itu. Menjalankannya sebelum `git checkout` berarti aplikasi berjalan dengan konfigurasi versi lama, dan gejalanya membingungkan: berkas sudah benar, tetapi perilakunya tidak berubah.',
      ),
      p(
        'Langkah 6 punya alasan yang sama dengan `pm2 reload antrean` di sub-bab sebelumnya. `queue:restart` tidak mematikan pekerja seketika — ia menaruh sinyal yang dibaca pekerja **setelah** job yang sedang diproses selesai, sehingga tidak ada pekerjaan yang terputus di tengah. Langkah 7 dan 8 menutupnya: `up` mengembalikan lalu lintas, lalu `curl -fsS` membuktikan aplikasinya benar-benar menjawab sebelum skrip dinyatakan sukses.',
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
      p(
        'Mekanismenya begini: `config:cache` menjalankan seluruh berkas di `config/` **satu kali**, lalu menyimpan hasilnya sebagai array PHP biasa. Sejak saat itu Laravel tidak pernah lagi memuat `.env` — sehingga `env()` yang dipanggil di luar `config/` tidak punya sumber untuk dibaca, dan mengembalikan `null`.',
      ),
      p(
        'Karena itu aturannya bukan "jangan pakai `env()`", melainkan "pakai `env()` **hanya** di dalam `config/`". Baris pertama contoh di atas sah: ia berjalan saat cache dibuat, dan nilainya ikut tersimpan. Di tempat lain, ambil nilainya lewat `config(\'layanan.pembayaran.kunci\')` — yang membaca array terkompilasi itu dan tetap benar dengan atau tanpa cache.',
      ),
      p(
        'Yang membuat jebakan ini mahal adalah **kapan** ia muncul. Di laptop, konfigurasi biasanya tidak di-cache, sehingga `env()` di mana pun bekerja normal; kegagalannya baru muncul di produksi, sebagai nilai `null` yang menjalar ke pemanggilan API pihak ketiga tanpa pesan yang jelas. Perintah `grep` di bawah adalah cara memeriksanya sebelum itu terjadi.',
      ),
      callout(
        'danger',
        'Setelah `config:cache`, `env()` mengembalikan `null` di luar berkas config',
        'Ini jebakan Laravel yang paling sering menjatuhkan deploy. Kodenya bekerja sempurna di lokal karena di sana konfigurasi tidak di-cache, lalu gagal misterius di produksi. Cari `env(` di luar `config/` sebelum deploy pertama.',
      ),
      code(
        'bash',
        `
        # Temukan pelanggarnya
        grep -rn "env(" app/ routes/ database/ | grep -v "config/"
        `,
      ),
      p(
        'Perintah ini menyisir tiga direktori tempat pelanggaran biasanya bersembunyi, yaitu `app/`, `routes/`, dan `database/`, dan sengaja **tidak** menyertakan `config/`, karena di sanalah `env()` memang boleh. Flag `-n` mencetak nomor barisnya sehingga tiap temuan bisa langsung dibuka. Jalankan sekali sebelum deploy pertama, lalu jadikan langkah CI supaya pelanggaran baru tidak masuk diam-diam.',
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
      p(
        'Lima tanda bintang berarti "setiap menit", dan itu memang disengaja: cron hanya perlu **satu** entri untuk seluruh jadwal aplikasimu. `schedule:run` bangun tiap menit, memeriksa daftar tugas yang kamu definisikan di kode Laravel, lalu menjalankan yang waktunya tiba. Jadwal harian, mingguan, atau tiap lima menit semuanya diatur di kode — bukan dengan menambah baris cron baru.',
      ),
      p(
        'Keuntungannya, perubahan jadwal ikut ter-commit, ter-review, dan ikut berpindah saat aplikasi dipindahkan server. `>> /dev/null 2>&1` membuang keluarannya agar cron tidak mengirim email tiap menit, tetapi karena itu juga membuang pesan error, pastikan tugasmu sendiri menulis ke log aplikasi. Bagian `cd /var/www/app &&` wajib ada, sebab cron berjalan dari direktori home, dan `artisan` hanya bisa dijalankan dari akar project.',
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
      p(
        'Dua direktori pertama adalah **satu-satunya** yang perlu bisa ditulis Laravel saat berjalan: `storage/` untuk log, sesi, cache, dan berkas unggahan; `bootstrap/cache/` untuk konfigurasi dan rute terkompilasi. Sisanya cukup bisa dibaca. `775` memberi tulis kepada pemilik dan grup, sementara pengguna lain hanya bisa membaca dan masuk direktori.',
      ),
      p(
        '`chmod 600 .env` jauh lebih ketat, dan memang harus begitu, karena hanya pemiliknya yang boleh membaca, tidak ada satu pun hak untuk grup maupun pengguna lain. Berkas itu memuat `APP_KEY`, kredensial database, dan token pihak ketiga. Di server bersama, `644` yang terlihat wajar berarti setiap akun lain di mesin itu bisa membacanya. **Jangan** menerapkan `chmod -R 777` sebagai jalan pintas saat ada masalah izin, sebab itu memberi hak tulis kepada semua orang, dan berkas PHP yang bisa ditulis berarti kode yang bisa diganti.',
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
      p(
        'Perintah pertama menguji kesalahan yang paling fatal di sub-bab ini. `-o /dev/null` membuang isinya (kamu tidak ingin `.env` tercetak di terminal), `-w "%{http_code}"` mencetak **hanya** kode statusnya. `404` berarti document root sudah benar; `200` berarti seluruh kredensialmu sudah bisa diunduh siapa pun, dan tindakan pertamanya bukan memperbaiki Nginx melainkan **merotasi semua rahasia** — harus dianggap sudah bocor.',
      ),
      p(
        'Perintah kedua memeriksa `APP_DEBUG`. Halaman error Laravel dalam mode debug menampilkan stack trace lengkap beserta potongan kode, jalur berkas, dan sering kali nilai variabel environment — peta rinci sistemmu untuk siapa pun yang mengetik URL yang salah. Karena itu ia sengaja meminta rute yang tidak ada, lalu mencari teks "stack trace" di responsnya.',
      ),
      p(
        '`php artisan about` menampilkan ringkasan konfigurasi yang sedang **benar-benar berlaku**, bukan yang tertulis di berkas. Tiga hal yang disaring `grep` di sana adalah yang paling menentukan: `environment` harus `production`, `debug` harus mati, dan `cached` harus menunjukkan konfigurasi serta rute sudah terkompilasi. Ketiganya memverifikasi bahwa langkah 5 di skrip deploy memang berjalan.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Laravel punya satu sifat yang membedakan penyebarannya dari aplikasi Node, yaitu sebagian besar konfigurasinya dibaca dari berkas pada setiap permintaan kecuali ia di-cache lebih dulu. Itulah yang membuat langkah pasca-deploy pada Laravel bukan pilihan melainkan keharusan.',
      ),
      code(
        'text',
        `
        Urutan pasca-deploy yang lazim, dan alasan tiap langkahnya:

          composer install --no-dev --optimize-autoloader
            -> tanpa dependency pengembangan, peta autoload dipadatkan

          php artisan config:cache
            -> seluruh config digabung jadi satu berkas
            -> SETELAH ini, env() di luar berkas config TIDAK BEKERJA

          php artisan route:cache
            -> seluruh rute dikompilasi
            -> gagal bila ada rute dengan closure

          php artisan view:cache
            -> template Blade dikompilasi lebih dulu

          php artisan migrate --force
            -> --force karena produksi menolak migrasi interaktif

          php artisan storage:link
            -> tautan simbolik ke direktori publik
        `,
        {
          caption:
            'Baris kedua adalah sumber kelas bug tersendiri, dan namanya hampir selalu "env() mengembalikan null".',
        },
      ),
      p(
        'Sebabnya perlu dipahami sekali supaya tidak berulang. Setelah `config:cache`, berkas konfigurasinya sudah dibaca dan dibekukan, sehingga pemanggilan `env()` di luar berkas `config` tidak lagi menemukan apa pun.',
      ),
      code(
        'php',
        `
        // SALAH: env() dipanggil di luar berkas config.
        // Setelah config:cache, ini mengembalikan null di produksi.
        class LayananBayar
        {
            public function __construct()
            {
                $this->kunci = env('STRIPE_SECRET');   // null
            }
        }

        // BENAR: nilainya dibaca SEKALI di berkas config,
        // dan seluruh aplikasi memakai config().
        // config/layanan.php
        return [
            'stripe' => ['rahasia' => env('STRIPE_SECRET')],
        ];

        class LayananBayar
        {
            public function __construct()
            {
                $this->kunci = config('layanan.stripe.rahasia');   // selalu bekerja
            }
        }
        `,
      ),
      p(
        'Sisi kedua yang khas Laravel adalah bahwa pekerja antrean **tidak** memuat ulang kode secara otomatis, sehingga rilis yang tidak menyertakan langkah ini meninggalkan proses yang menjalankan kode lama.',
      ),
      code(
        'text',
        `
          php artisan queue:restart

        Perintah itu tidak mematikan apa pun secara langsung. Ia
        menandai bahwa pekerja harus berhenti setelah menyelesaikan
        job yang sedang berjalan, lalu pengelola proses menyalakannya
        kembali dengan kode baru.

        Gejala bila langkah ini terlewat:
          - job memakai kode versi LAMA berjam-jam sesudah rilis
          - job gagal dengan error yang menyebut kelas atau kolom
            yang sudah tidak ada
          - perbaikan yang sudah dirilis tidak berpengaruh sama sekali
            pada pekerjaan yang berjalan di latar
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan penyebaran Laravel punya beberapa bentuk yang sangat khas, dan pesannya langsung menunjuk penyebabnya bila dikenali.',
      ),
      code(
        'text',
        `
        1. Halaman putih, tidak ada apa-apa di layar

           Periksa storage/logs/laravel.log lebih dulu. Bila kosong,
           masalahnya ada SEBELUM Laravel sempat menyala:
             - izin direktori storage dan bootstrap/cache
             - ekstensi PHP yang kurang
             - kesalahan sintaks di berkas konfigurasi

           file_put_contents(/var/www/storage/logs/laravel.log):
           Failed to open stream: Permission denied

           Direktori storage harus bisa ditulis oleh pengguna yang
           menjalankan PHP-FPM, dan itu biasanya bukan pengguna yang
           melakukan deploy.

        2. No application encryption key has been specified

           APP_KEY belum ada. php artisan key:generate menghasilkannya,
           dan MENGGANTINYA di produksi membuat seluruh data terenkripsi
           yang sudah ada tidak bisa dibaca lagi — termasuk sesi dan
           cookie.

        3. Route cache tidak bisa dibuat

           Your application's routes cannot be cached because they
           contain closures.

           Ganti closure menjadi controller. Ini bukan sekadar gaya:
           closure tidak bisa diserialisasi.

        4. 419 Page Expired

           Token CSRF tidak cocok. Sering karena APP_URL salah, sesi
           disimpan di memori satu instance, atau cookie domainnya
           tidak cocok.
        `,
      ),
      p(
        'Kelas kedua muncul setelah semuanya berjalan, dan penyebabnya adalah konfigurasi yang tidak sesuai lingkungan.',
      ),
      code(
        'text',
        `
          APP_DEBUG=true di produksi

        Halaman error Laravel menampilkan stack trace, potongan kode
        sumber, dan SELURUH variabel environment termasuk kredensial
        basis data. Satu error yang tidak tertangani sudah cukup.

        Yang harus benar di produksi:
          APP_DEBUG=false
          APP_ENV=production
          LOG_LEVEL=warning atau error

        Dan periksa dengan cara yang tidak bisa salah: buka satu rute
        yang sengaja dibuat gagal, lalu lihat apa yang muncul.
        `,
        {
          caption:
            'Ini kebocoran paling langsung yang ada di daftar ini, dan paling mudah dicegah.',
        },
      ),
      code(
        'text',
        `
        PERINTAH YANG BERBAHAYA DI PRODUKSI:

          php artisan migrate:fresh     MENGHAPUS seluruh tabel
          php artisan db:seed           menimpa data dengan data uji
          php artisan config:clear      tanpa config:cache sesudahnya,
                                        performanya turun drastis

        Yang pertama tidak bisa dibatalkan. Pastikan skrip deploy-mu
        tidak pernah memuatnya, dan pastikan kredensial produksi tidak
        pernah ada di mesin siapa pun.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Laravel menyediakan banyak perintah pasca-deploy, dan kesalahannya hampir selalu berupa melewatkan salah satunya atau menjalankannya dengan urutan yang keliru.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memanggil `env()` di luar berkas `config`',
            'Nilainya kan terbaca saat pengembangan',
            'Setelah `config:cache`, ia mengembalikan `null` di produksi. Pakai `config()`',
          ],
          [
            'Melewatkan `queue:restart` setelah rilis',
            'Pekerjanya kan jalan terus',
            'Pekerja tetap menjalankan kode LAMA berjam-jam, dan perbaikan yang dirilis tidak berpengaruh',
          ],
          [
            'Membiarkan `APP_DEBUG=true` di produksi',
            'Biar gampang mendiagnosis',
            'Halaman error menampilkan stack trace dan SELURUH variabel environment, termasuk kredensial',
          ],
          [
            'Menjalankan `key:generate` di produksi yang sudah berjalan',
            'Perintahnya kan resmi',
            'Seluruh data terenkripsi yang ada tidak bisa dibaca lagi, termasuk sesi dan cookie',
          ],
          [
            'Memakai closure pada rute',
            'Lebih ringkas untuk rute sederhana',
            'Rute dengan closure tidak bisa di-cache. Satu closure membatalkan `route:cache` untuk seluruh aplikasi',
          ],
          [
            'Mengabaikan izin direktori `storage`',
            'Di lokal kan bisa ditulis',
            'Pengguna PHP-FPM berbeda dari pengguna yang men-deploy. Gejalanya halaman putih tanpa log apa pun',
          ],
        ],
      ),
      p(
        'Perlu dinyatakan terus terang bahwa Laravel dan Composer **tidak terpasang** di mesin tempat materi ini disiapkan, sehingga urutan perintah di atas tidak dijalankan. Yang **dijalankan sungguhan** adalah PHP 8.3.6 itu sendiri, termasuk perilaku `password_hash`, `unserialize`, dan penanganan error fatal yang menghasilkan respons berbadan kosong. Perintah `artisan` dan akibatnya ditulis mengikuti dokumentasi resmi Laravel dan ditandai sebagai tidak dieksekusi, alih-alih disajikan seolah terukur.',
      ),
      references(
        {
          label: 'Deployment',
          href: 'https://laravel.com/docs/12.x/deployment',
          source: 'Laravel Docs',
          note: 'Daftar resmi langkah optimasi yang dijalankan saat rilis',
        },
        {
          label: 'Configuration',
          href: 'https://laravel.com/docs/12.x/configuration',
          source: 'Laravel Docs',
          note: 'Hubungan `env()` dengan config cache, termasuk jebakannya',
        },
        {
          label: 'PHP Manual',
          href: 'https://www.php.net/manual/en/book.opcache.php',
          source: 'PHP Manual',
          note: 'Setelan opcache beserta pengaruhnya pada produksi',
        },
      ),
    ],
  ),

  written(
    'database-terkelola',
    'Database Terkelola',
    17,
    'Menyerahkan bagian yang paling mahal kalau salah.',
    [
      p(
        'Menjalankan database sendiri berarti kamu bertanggung jawab atas cadangan, replikasi, failover, pembaruan keamanan, dan penyetelan — dan setiap kesalahan di sana bisa berarti kehilangan data permanen.',
      ),

      terms(
        {
          term: 'managed database',
          meaning:
            'Basis data yang dijalankan penyedia layanan, lengkap dengan pencadangan, pembaruan versi, dan pemantauan. Kamu mengurus skema dan query, penyedia mengurus mesinnya. Harganya biaya lebih tinggi dan setelan tingkat rendah yang tidak selalu bisa kamu ubah.',
        },
        {
          term: 'connection string',
          meaning:
            'Satu teks yang memuat alamat, port, nama basis data, pengguna, dan kata sandi, misalnya berawalan `postgres://`. Karena memuat kata sandi, ia adalah rahasia penuh dan tidak boleh masuk kode sumber maupun log.',
        },
        {
          term: 'connection pooling',
          meaning:
            'Pemakaian ulang koneksi basis data yang sudah terbuka. Penting pada basis data terkelola karena batas jumlah koneksinya sering rendah, dan tiap instance aplikasi yang membuka pool sendiri ikut menghabiskannya.',
        },
        {
          term: 'read replica',
          meaning:
            'Salinan basis data yang hanya bisa dibaca, dipakai untuk memindahkan beban baca dari server utama. Datanya tertinggal beberapa saat dari yang utama, sehingga membaca segera sesudah menulis bisa mengembalikan data lama.',
        },
        {
          term: 'replication lag',
          meaning:
            'Jarak waktu antara sebuah tulisan tercatat di server utama dan muncul di replika. Kecil saat sepi dan membesar justru saat beban tulis tinggi, yaitu tepat ketika kamu paling tidak menginginkannya.',
        },
        {
          term: 'failover',
          meaning:
            'Perpindahan otomatis ke server cadangan ketika server utama tidak sehat. Tidak pernah benar-benar mulus, sebab ada jeda saat perpindahan dan koneksi yang sedang berjalan terputus, jadi aplikasi tetap perlu tahan terhadap kegagalan koneksi sesaat.',
        },
        {
          term: 'least privilege',
          meaning:
            'Prinsip memberi akun basis data hanya izin yang benar-benar dibutuhkan pekerjaannya. Aplikasi yang tidak pernah mengubah struktur tabel tidak perlu terhubung sebagai pemilik skema, dan pekerjaan pelaporan cukup memakai akun hanya-baca.',
        },
        {
          term: 'backup dan restore',
          meaning:
            'Pencadangan berkala beserta prosedur mengembalikannya. Yang menentukan nilainya bukan adanya cadangan melainkan pernah tidaknya pemulihan itu diuji, sebab cadangan yang tidak pernah dicoba dipulihkan belum terbukti bisa dipulihkan.',
        },
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
      p(
        'Perhitungan di potongan pertama adalah aritmetika yang sering mengejutkan orang saat pertama kali menemuinya. Setiap instance serverless membuka pool koneksinya **sendiri** — dan instance-nya bisa ratusan saat trafik naik. Batas bawaan Postgres adalah 100 koneksi; setelah itu koneksi baru ditolak, dan yang ditolak bukan hanya permintaan yang sibuk melainkan semuanya.',
      ),
      p(
        'Pooler memutus rantai itu dengan menjadi perantara: ia menerima 500 koneksi dari aplikasi tetapi hanya memegang 20 koneksi sungguhan ke database, dan menggilirkannya. Karena satu koneksi database dipakai bergantian oleh banyak klien, mode transaksi tidak bisa menjamin dua perintah berturut-turut mendarat di sesi yang sama — inilah alasan `DIRECT_URL` tetap diperlukan untuk migrasi, yang butuh sesi stabil untuk perintah DDL.',
      ),
      p(
        'Perhatikan bedanya hanya di host dan porta: `pooler.contoh.com:6543` versus `db.contoh.com:5432`. Parameter `?pgbouncer=true` di URL pertama memberi tahu Prisma untuk mematikan prepared statement, yang juga tidak cocok dengan koneksi bergilir. Menyamakan keduanya adalah kesalahan yang gejalanya tertunda — semuanya bekerja saat sepi, lalu gagal serentak saat trafik naik.',
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
      p(
        '`max: 10` adalah batas **per instance**, dan komentarnya penting: angka yang harus kamu hitung adalah `max` dikali jumlah instance, lalu dibandingkan dengan batas koneksi database (atau pooler). Empat instance dengan `max: 10` sudah memakai 40 slot — cukup untuk kehabisan lebih cepat dari yang diperkirakan.',
      ),
      p(
        'Dua timeout di bawahnya menutup dua kegagalan berbeda. `connectionTimeoutMillis: 5_000` membatasi berapa lama permintaan **menunggu giliran** koneksi dari pool; tanpanya, saat pool penuh permintaan menumpuk tanpa batas sampai seluruh proses membeku — jauh lebih buruk daripada gagal cepat dengan error yang jelas. `idleTimeoutMillis: 30_000` menutup koneksi yang menganggur setengah menit, mengembalikan slotnya ke database alih-alih menahannya selamanya.',
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
      p(
        'Laravel membaca konfigurasi ini sendiri: begitu ada kunci `read` dan `write` terpisah, ia mengarahkan `SELECT` ke host baca dan `INSERT`/`UPDATE`/`DELETE` ke host tulis — tanpa satu baris pun perubahan di kode query-mu. Nilainya berupa **array** host karena beberapa replika bisa didaftarkan sekaligus, dan Laravel memilihnya secara acak untuk membagi beban.',
      ),
      p(
        'Manfaatnya nyata untuk beban yang didominasi pembacaan: laporan, dasbor, dan pencarian bisa dipindahkan dari database utama sehingga penulisan tidak ikut melambat. Peringatan berikut menyebut harganya — replikasi punya jeda, sehingga otomatisasi ini justru berbahaya persis pada alur baca-setelah-tulis, dan di situ kamu harus memaksa koneksi tulis.',
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
      p(
        'Perhatikan apa yang **tidak** diberikan kepada `app_user`: tidak ada `DROP`, tidak ada `ALTER`, tidak ada `CREATE`. Ia hanya boleh membaca dan mengubah baris — persis yang dibutuhkan aplikasi saat melayani permintaan, dan tidak lebih. Aplikasi tidak pernah mengubah skema saat berjalan, jadi hak itu murni permukaan serangan tambahan.',
      ),
      p(
        '`migrasi_user` memegang `GRANT ALL` karena migrasi memang harus bisa membuat dan mengubah tabel, tetapi kredensialnya hanya dipakai **saat deploy**, bukan disimpan di variabel environment aplikasi yang berjalan. Pemisahan ini yang membuat SQL injection yang lolos tetap terbatas. Dengan `app_user`, penyerang bisa merusak data, yang memang buruk tetapi masih bisa dipulihkan dari cadangan, sedangkan dengan kredensial pemilik skema ia bisa menjalankan `DROP TABLE` dan menghapus strukturnya sekaligus.',
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
      p(
        'Baris pertama hanya menyelesaikan setengah pekerjaan. `pg_dump` menghasilkan berkas, `gzip` memampatkannya, dan `$(date +%F)` menyisipkan tanggal ke namanya sehingga cadangan lama tidak tertimpa. Sampai di sini yang kamu punya adalah **berkas**, bukan cadangan yang terbukti.',
      ),
      p(
        'Tiga baris berikutnya yang mengubahnya menjadi cadangan sungguhan. `createdb uji_pulih` membuat database kosong terpisah, `gunzip -c … | psql` memulihkan isinya ke sana, lalu `SELECT count(*)` membuktikan datanya benar-benar ada. Perhatikan pemulihannya dilakukan ke database **baru**, bukan menimpa yang asli — menguji cadangan tidak boleh berisiko merusak data yang sedang dipakai.',
      ),
      p(
        'Angka dari `count(*)` itu juga informasi yang perlu dicatat: bandingkan dengan jumlah baris di produksi. Cadangan yang berhasil dipulihkan tetapi isinya separuh berarti proses dump-nya terpotong — kegagalan yang tidak menghasilkan pesan error di mana pun, dan hanya terdeteksi dengan cara ini.',
      ),
      callout(
        'danger',
        'Cadangan yang tidak pernah diuji bukan cadangan',
        'Ia asumsi. Cadangan bisa kosong, terpotong, atau memakai versi yang tidak kompatibel — dan semuanya baru ketahuan pada hari kamu benar-benar membutuhkannya. Uji pemulihan secara berkala, dan catat berapa lama prosesnya.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Basis data terkelola menghapus sebagian besar pekerjaan operasional dan menyisakan beberapa hal yang tetap harus kamu putuskan sendiri. Yang paling sering menggigit adalah batas koneksi.',
      ),
      code(
        'text',
        `
        Aritmetika yang harus dihitung SEBELUM rilis:

          jumlah instance aplikasi  x  ukuran pool per instance
          + pekerja antrean x pool-nya
          + job berkala
          + koneksi dari alat administrasi
          + cadangan untuk superuser
          ------------------------------------------------------
          harus DI BAWAH batas koneksi basis datanya

        Contoh yang sering meledak:
          10 instance x pool 10 = 100
          4 pekerja antrean x pool 5 = 20
          total 120, sementara paket basis datanya mengizinkan 60.

        Gejalanya:
          error: sorry, too many clients already
          Error: Timeout acquiring a connection from the pool
        `,
        {
          caption:
            'Yang menutupnya bukan menaikkan paket, melainkan memakai pooler di depan basis datanya.',
        },
      ),
      p('Keputusan kedua menyangkut hak koneksi, dan efeknya bisa diukur.'),
      code(
        'text',
        `
        Diuji sungguhan dengan node:sqlite, koneksi hanya-baca:

          SELECT -> berhasil
          UPDATE -> DITOLAK: attempt to write a readonly database
          DELETE -> DITOLAK: attempt to write a readonly database
          DROP   -> DITOLAK: attempt to write a readonly database
          CREATE -> DITOLAK: attempt to write a readonly database

        Keempat perintah itu adalah injeksi SQL yang BERHASIL dirakit
        sepenuhnya. Yang menghentikannya bukan validasi masukan,
        melainkan hak koneksi.
        `,
      ),
      code(
        'text',
        `
        Bentuknya di PostgreSQL, dijalankan sekali saat menyiapkan:

          REVOKE ALL ON SCHEMA public FROM app;
          GRANT USAGE ON SCHEMA public TO app;
          GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app;
          -- tanpa DELETE bila memakai penandaan terhapus
          -- tanpa DDL, dan app BUKAN pemilik skema

        Kredensial TERPISAH untuk:
          migrasi   -> punya DDL, dipakai hanya saat migrasi berjalan
          laporan   -> hanya SELECT
          cadangan  -> hanya yang dibutuhkan pg_dump
        `,
      ),
      p(
        'Keputusan ketiga menyangkut sesuatu yang tidak terlihat sampai dibutuhkan, yaitu apakah cadangannya benar-benar bisa dipulihkan.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan PostgreSQL 16.15, 5.000 pelanggan
        dan 50.000 pesanan:

          pg_dump -F p (SQL teks)         2,6 MB    57 ms
          pg_dump -F c (terkompresi)      552 KB    84 ms
          pg_dump -F d (direktori, -j 2)  560 KB    87 ms

        Dan pemulihannya:
          pg_restore ke basis data baru   123 ms
          pelanggan=5000  pesanan=50000

        Cadangan yang tidak pernah dipulihkan bukan cadangan,
        melainkan berkas.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Yang paling sering tidak diperiksa pada pemulihan bukan datanya melainkan aturan yang menjaga datanya, dan itu bisa diuji.',
      ),
      code(
        'text',
        `
        Diuji sungguhan pada basis data hasil pemulihan:

          INSERT INTO pesanan (pelanggan_id, total) VALUES (1, -500);
            ERROR: new row for relation "pesanan" violates check
            constraint "pesanan_total_check"

          INSERT INTO pesanan (pelanggan_id, total) VALUES (999999, 100);
            ERROR: insert or update on table "pesanan" violates
            foreign key constraint "pesanan_pelanggan_id_fkey"

          SELECT last_value FROM pesanan_id_seq;
            50002

        Ketiganya pulih dengan benar. Itu bukan sesuatu yang boleh
        diasumsikan — ia harus diuji, sebab pemulihan yang kehilangan
        constraint akan menerima data rusak tanpa satu pun keluhan.
        `,
      ),
      p(
        'Ada satu jebakan pada pemulihan yang perilakunya berbeda tergantung bentuk tabelnya, dan selisihnya diukur.',
      ),
      code(
        'text',
        `
        pg_restore --data-only dijalankan DUA KALI ke tabel yang
        isinya masih ada:

        TABEL DENGAN PRIMARY KEY:
          pg_restore: error: COPY failed for table "pesanan":
          ERROR: duplicate key value violates unique constraint
          "pesanan_pkey"
          jumlah baris sesudahnya: 50000   <- TIDAK berlipat

        TABEL TANPA PRIMARY KEY:
          sebelum = 1000
          sesudah = 2000                   <- BERLIPAT, tanpa satu
                                              pun pesan error

        Yang menyelamatkan pada kasus pertama bukan pg_restore,
        melainkan constraint-nya. Pada tabel tanpa kunci, tidak ada
        yang menghentikannya.
        `,
        { caption: 'Karena itu pulihkan ke basis data BARU, jangan menimpa yang sedang berisi.' },
      ),
      code(
        'text',
        `
        KEGAGALAN LAIN yang khas pada basis data terkelola:

          FATAL: no pg_hba.conf entry for host ..., SSL off
            -> penyedia mewajibkan TLS. Tambahkan sslmode di
               connection string. Dan pakai verify-full, BUKAN require:
               require hanya mengenkripsi, tanpa memeriksa identitas.

          FATAL: remaining connection slots are reserved for
          non-replication superuser connections
            -> batas koneksi sudah habis. Yang tersisa dicadangkan
               untuk superuser supaya kamu masih bisa masuk memperbaiki.

          canceling statement due to statement timeout
            -> batas waktu query terlampaui. Ini perlindungan, bukan
               kegagalan. Perbaiki query-nya, jangan besarkan batasnya.

          could not serialize access due to concurrent update
            -> dua transaksi mengubah baris yang sama pada tingkat
               isolasi yang ketat. Coba lagi transaksinya.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Basis data terkelola menghapus pekerjaan pemeliharaan dan tidak menghapus keputusan yang harus diambil sejak awal.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai ukuran pool yang sama untuk semua jumlah instance',
            'Angkanya kan sudah teruji',
            'Sepuluh instance dengan pool 10 berarti 100 koneksi. Hitung mundur dari batas basis datanya',
          ],
          [
            'Memakai satu kredensial untuk aplikasi dan migrasi',
            'Lebih gampang',
            'Diuji, koneksi hanya-baca menolak `DROP` yang sudah berhasil dirakit. Pisahkan haknya',
          ],
          [
            'Memakai `sslmode=require`',
            'Namanya saja sudah "require"',
            'Ia hanya mengenkripsi. Tidak memeriksa sertifikat maupun nama host. Pakai `verify-full`',
          ],
          [
            'Menyimpan cadangan tanpa pernah memulihkannya',
            'Berkasnya ada dan ukurannya wajar',
            'Diuji, pemulihan ke basis data baru selesai 123 ms. Cadangan yang belum pernah dicoba bukan cadangan',
          ],
          [
            'Memulihkan `--data-only` ke basis data yang masih berisi',
            'Datanya kan ditimpa',
            'Diuji, tabel tanpa primary key berlipat dari 1.000 menjadi 2.000 tanpa satu pun error',
          ],
          [
            'Memperbesar `statement_timeout` saat query dibatalkan',
            'Supaya query-nya selesai',
            'Itu menyembunyikan penyebabnya. Baca rencana eksekusinya, dan perbaiki query atau indeksnya',
          ],
        ],
      ),
      p(
        'Cara paling ringkas menguji apakah rencana pemulihanmu nyata hanya perlu satu latihan yang dijadwalkan. Ambil cadangan terbaru, pulihkan ke basis data yang benar-benar baru, jalankan aplikasimu terhadapnya, lalu catat berapa lama seluruhnya memakan waktu. Angka itulah waktu pemulihan sesungguhnya, dan ia hampir selalu jauh lebih besar daripada yang diperkirakan orang sebelum mencobanya.',
      ),
      references(
        {
          label: 'High Availability, Load Balancing, and Replication',
          href: 'https://www.postgresql.org/docs/current/high-availability.html',
          source: 'PostgreSQL Docs',
          note: 'Pilihan replikasi beserta sifat keterlambatan datanya',
        },
        {
          label: 'Backup and Restore',
          href: 'https://www.postgresql.org/docs/current/backup.html',
          source: 'PostgreSQL Docs',
          note: 'Tiga pendekatan pencadangan dan kapan masing-masing cocok',
        },
        {
          label: 'Backing services',
          href: 'https://12factor.net/backing-services',
          source: 'Twelve-Factor App',
          note: 'Kenapa basis data diperlakukan sebagai sumber daya yang bisa ditukar lewat konfigurasi',
        },
      ),
    ],
  ),

  written(
    'migrasi-saat-deploy',
    'Menjalankan Migrasi saat Deploy',
    19,
    'Langkah yang paling sering menyebabkan kerusakan yang tidak bisa dibatalkan.',
    [
      p(
        'Kode bisa di-rollback dalam hitungan detik. Migrasi yang menghapus kolom tidak bisa. Sub-bab ini tentang menjalankan perubahan skema sehingga rollback kode **tetap aman**.',
      ),

      terms(
        {
          term: 'migrasi (migration)',
          meaning:
            'Berkas yang mendeskripsikan satu perubahan bentuk basis data, dijalankan berurutan dan dicatat supaya tidak terjalankan dua kali. Berbeda dari mengubah tabel langsung, migrasi membuat perubahannya ikut masuk version control dan bisa diulang di lingkungan lain.',
        },
        {
          term: 'expand-migrate-contract',
          meaning:
            'Pola tiga tahap untuk perubahan yang merusak. *Expand* menambahkan bentuk baru tanpa membuang yang lama, *migrate* memindahkan data dan mengalihkan kode, *contract* baru membuang bentuk lama di rilis berikutnya. Yang ia jaga adalah tetap adanya jendela aman untuk membatalkan rilis.',
        },
        {
          term: 'backward compatible',
          meaning:
            'Sifat perubahan skema yang masih bisa dipakai kode versi sebelumnya. Penting karena saat rilis berjalan, kode lama dan kode baru sempat hidup bersamaan, jadi skema harus melayani keduanya.',
        },
        {
          term: 'backfill',
          meaning:
            'Pengisian data untuk kolom atau tabel baru atas baris yang sudah ada. Dijalankan sebagai pekerjaan terpisah yang dipecah per batch, bukan di dalam langkah deploy, sebab pada tabel besar ia bisa berjalan sangat lama dan mengunci.',
        },
        {
          term: 'lock (kunci)',
          meaning:
            'Penguncian yang diambil basis data saat mengubah struktur tabel. Sebagian perubahan mengambil kunci yang menghentikan pembacaan maupun penulisan, dan pada tabel besar itu berarti layanan berhenti selama migrasi berjalan.',
        },
        {
          term: 'reversible migration',
          meaning:
            'Migrasi yang menyertakan cara membatalkannya. Sebagian perubahan tidak benar-benar bisa dibatalkan, misalnya menghapus kolom yang datanya ikut hilang, dan dalam hal itu ketidakmampuannya harus dinyatakan sebagai keputusan sadar, bukan ditemukan saat dibutuhkan.',
        },
        {
          term: 'migration lock',
          meaning:
            'Mekanisme yang memastikan hanya satu proses menjalankan migrasi, meski deploy menyalakan beberapa instance sekaligus. Tanpa ini, dua instance bisa menjalankan migrasi yang sama bersamaan.',
        },
        {
          term: 'seed',
          meaning:
            'Pengisian data awal yang dibutuhkan aplikasi untuk berjalan, misalnya daftar peran. Berbeda dari migrasi yang mengubah bentuk, seed mengisi isi, dan keduanya sebaiknya tidak dicampur dalam satu berkas.',
        },
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
      p(
        'Garis waktu ini layak dibaca mundur, dari `t2`. Yang rusak di sana bukan kode barunya — kode baru bekerja dengan benar di `t1`. Yang rusak adalah **asumsi** bahwa rollback selalu tersedia: begitu kolom `nama` dihapus di `t0`, kode versi lama kehilangan sesuatu yang ia butuhkan, dan tidak ada versi kode mana pun yang bisa memulihkannya.',
      ),
      p(
        'Itulah yang membuat migrasi berbeda dari perubahan kode biasa. Deploy kode bersifat **dua arah** — versi lama masih tersimpan sebagai artefak dan bisa dipasang lagi. Migrasi bersifat satu arah dalam praktiknya: skrip `down()` sering tidak pernah diuji, dan sekalipun ia berjalan, data yang sudah terhapus tidak ikut kembali. Pola empat rilis di bawah ada untuk menjaga agar setiap rilis tetap punya jalan pulang.',
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
      p(
        'Kedua perintah menghasilkan index yang sama; bedanya adalah apa yang terjadi pada tabel **selama** index dibangun. Bentuk pertama mengambil kunci yang memblokir seluruh penulisan ke tabel `artikel` sampai selesai — pada tabel dengan jutaan baris, itu berarti setiap `INSERT` dan `UPDATE` menunggu, dan pengguna melihatnya sebagai aplikasi yang membeku.',
      ),
      p(
        '`CONCURRENTLY` membangun index dengan dua kali penelusuran tabel tanpa memblokir penulisan. Harganya, prosesnya lebih lambat, dan seperti disebut peringatan berikut, ia tidak boleh berada di dalam transaksi. Kalau ia gagal di tengah jalan, yang tertinggal adalah index dalam keadaan `INVALID` yang tidak dipakai query tetapi tetap memakan ruang, dan ia harus dihapus manual dengan `DROP INDEX` sebelum dicoba lagi.',
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
      p(
        '`public $withinTransaction = false;` adalah properti yang menonaktifkan pembungkusan transaksi **untuk migrasi ini saja**. Laravel membungkus setiap migrasi dalam transaksi secara default — perilaku yang biasanya kamu inginkan, karena migrasi yang gagal di tengah lalu dibatalkan seluruhnya jauh lebih baik daripada skema yang setengah berubah. Untuk `CONCURRENTLY`, justru pembungkus itu yang harus dilepas.',
      ),
      p(
        'Perintahnya juga ditulis dengan `DB::statement()` mentah, bukan lewat `Schema::table()->index()`, karena pembangun skema Laravel tidak menyediakan opsi `CONCURRENTLY`. Ini contoh kasus ketika turun ke SQL langsung adalah pilihan yang benar — abstraksinya tidak menjangkau kebutuhan yang spesifik ke PostgreSQL.',
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
      p(
        'Perbandingan di atas menunjukkan pemisahannya, dan potongan ini menunjukkan **bagaimana** job backfill-nya ditulis. `chunkById(500, ...)` yang paling menentukan: ia mengambil 500 baris sekaligus dan melanjutkan berdasarkan `id` terakhir, bukan berdasarkan `OFFSET`. Perbedaan itu penting justru karena job ini **mengubah** baris yang ia proses — dengan `chunk()` biasa, baris yang sudah diperbarui menggeser posisi offset dan sebagian data terlewat tanpa jejak.',
      ),
      p(
        "Filter `whereNull('slug')` membuat job ini **idempoten**: baris yang sudah diisi tidak ikut lagi, sehingga job yang gagal di tengah bisa dijalankan ulang dari awal tanpa merusak apa pun dan tanpa mengulang pekerjaan. Ini sifat yang wajib untuk pekerjaan latar, karena antrean memberi jaminan at-least-once — satu job bisa berjalan lebih dari sekali.",
      ),
      p(
        '`usleep(100_000)` menjeda 0,1 detik di antara batch, dan komentarnya menyebut alasannya. Backfill lima juta baris yang berjalan secepat mungkin akan menghabiskan I/O database dan memperlambat permintaan pengguna sungguhan. Jeda kecil ini memperpanjang durasi totalnya, tetapi membuat pekerjaan latar tidak terasa oleh siapa pun yang sedang memakai aplikasi.',
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
      p(
        'Dua kasus, dua urutan yang berlawanan, dan alasannya sama: **kode mana yang harus tetap bisa berjalan**. Migrasi aditif dijalankan lebih dulu (`&&` memastikan deploy kode hanya berjalan kalau migrasinya sukses) karena kode baru membutuhkan kolom barunya; kode lama tidak terganggu oleh kolom tambahan yang tidak ia kenal.',
      ),
      p(
        'Migrasi destruktif tidak punya urutan yang aman dalam satu rilis, dan itulah sebabnya baris keduanya berupa komentar alih-alih perintah. Syaratnya disebut eksplisit, yaitu "setelah kode yang memakai kolom lama sudah tidak ada **di mana pun**". Frasa terakhir itu mencakup lebih dari server aplikasi, sebab pekerja antrean, tugas terjadwal, dan skrip laporan juga membaca kolom yang sama, dan semuanya harus sudah diperbarui sebelum kolomnya boleh dihapus.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Migrasi adalah satu-satunya bagian rilis yang **tidak ikut mundur** saat kode di-rollback, dan itulah yang menentukan seluruh cara merancangnya.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan PostgreSQL 16.15:

          kode LAMA membaca nama_lengkap  -> berhasil
          -- migrasi RENAME dijalankan, kode BARU di-deploy --
          kode BARU membaca nama          -> berhasil
          -- ada bug, kode di-rollback ke versi LAMA --

          SELECT nama_lengkap FROM pengguna
            ERROR: column "nama_lengkap" does not exist

        Rollback kodenya BERHASIL, dan aplikasinya tetap rusak.
        `,
        {
          caption:
            'Ini alasan tunggal kenapa expand-contract ada, dan kenapa ia layak menambah beberapa rilis.',
        },
      ),
      code(
        'text',
        `
        Mengganti nama kolom dengan rollback yang selalu aman:

          RILIS 1 — EXPAND
            tambah kolom "nama", biarkan "nama_lengkap" tetap ada
            kode MENULIS ke keduanya, MEMBACA dari yang lama
            rollback aman: kolom baru diabaikan kode lama

          RILIS 2 — BACKFILL
            isi kolom baru dari yang lama, dalam batch terpisah
            BUKAN bagian dari langkah deploy

          RILIS 3 — SWITCH
            kode MEMBACA dari "nama", masih menulis ke keduanya
            rollback aman: kolom lama masih terisi

          RILIS 4 — CONTRACT
            kode berhenti menulis ke "nama_lengkap"
            baru setelah itu kolom lama dihapus
        `,
      ),
      p(
        'Biaya setiap operasi juga bagian dari rencana, sebab operasi yang mengunci tabel mengubah rilis menjadi pemadaman. Biayanya bisa diukur.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada PostgreSQL 16.15, tabel 300.000 baris:

          ADD COLUMN tanpa default                    7 ms
          ADD COLUMN + DEFAULT konstan                7 ms   <- metadata saja
          ADD COLUMN + DEFAULT volatile             316 ms   <- MENULIS ULANG
          ALTER COLUMN TYPE                         288 ms   <- MENULIS ULANG
          CREATE INDEX                              384 ms   <- MENGUNCI penulisan
          CREATE INDEX CONCURRENTLY                 419 ms   <- tidak mengunci
          DROP INDEX                                 12 ms

        Dua baris pertama sama cepatnya, dan itu melawan dugaan umum:
        sejak PostgreSQL 11, menambah kolom dengan DEFAULT yang TETAP
        hanya mengubah metadata. Yang menulis ulang adalah DEFAULT
        yang nilainya berbeda per baris.
        `,
        {
          caption:
            'Angkanya kecil karena tabelnya kecil. Yang penting adalah operasi mana yang menulis ulang dan mengunci.',
        },
      ),
      p(
        'Pada tabel puluhan juta baris, selisih 35 ms antara `CREATE INDEX` dan `CREATE INDEX CONCURRENTLY` di atas menjadi selisih antara penulisan terhenti beberapa menit dan tidak ada yang terganggu sama sekali.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Migrasi yang berjalan saat deploy punya beberapa cara gagal yang gejalanya sangat berbeda.',
      ),
      code(
        'text',
        `
        1. Beberapa instance menjalankan migrasi bersamaan

           ERROR: relation "pengguna_surel_key" already exists
           ERROR: duplicate key value violates unique constraint
                  "_migrations_pkey"

           Semua instance menyala bersamaan dan semuanya menjalankan
           migrasi. Menutupnya: migrasi dijalankan sebagai LANGKAH
           TERSENDIRI sebelum instance baru dinyalakan, bukan di dalam
           proses startup aplikasi.

        2. Migrasi menggantung tanpa pesan apa pun

           Ia sedang menunggu kunci. Satu transaksi lain yang belum
           di-commit sudah cukup. Periksa dengan:

             SELECT pid, state, wait_event_type, query
             FROM pg_stat_activity WHERE state <> 'idle';

           Dan pasang batas waktu supaya ia gagal cepat alih-alih
           menahan seluruh rilis:

             SET lock_timeout = '5s';
             SET statement_timeout = '30s';

        3. Migrasi gagal di tengah

           PostgreSQL menjalankan DDL di dalam transaksi, jadi
           sebagian besar migrasi akan mundur utuh. MySQL TIDAK —
           di sana migrasi yang gagal di tengah meninggalkan skema
           yang setengah berubah.

           CREATE INDEX CONCURRENTLY juga TIDAK bisa di dalam
           transaksi, dan bila gagal ia meninggalkan indeks tidak
           valid yang harus dihapus manual.
        `,
      ),
      p(
        'Kegagalan yang paling mahal tidak berupa migrasi yang gagal melainkan migrasi yang berhasil dan memblokir seluruh aplikasi.',
      ),
      code(
        'text',
        `
        Yang MENGUNCI tabel dan harus dihindari pada tabel besar:

          ALTER TABLE ... ADD COLUMN ... NOT NULL tanpa default
          ALTER TABLE ... ALTER COLUMN ... TYPE
          CREATE INDEX tanpa CONCURRENTLY
          ALTER TABLE ... ADD CONSTRAINT ... CHECK tanpa NOT VALID

        Yang aman, dan bentuk penggantinya:

          menambah kolom NOT NULL:
            1. ADD COLUMN nullable
            2. backfill dalam batch
            3. ADD CONSTRAINT ... NOT NULL NOT VALID
            4. VALIDATE CONSTRAINT   (memindai tanpa mengunci penulisan)

          mengubah tipe kolom:
            1. tambah kolom baru dengan tipe yang benar
            2. tulis ke keduanya
            3. backfill
            4. pindah baca
            5. hapus kolom lama
        `,
      ),
      code(
        'text',
        `
        DAN BACKFILL yang dijalankan sekaligus:

          UPDATE pesanan SET status_baru = status;   -- 40 juta baris

        Satu transaksi panjang yang mengunci, membengkakkan WAL, dan
        membuat autovacuum tertinggal. Bentuk yang benar memecahnya:

          UPDATE pesanan SET status_baru = status
          WHERE id BETWEEN $1 AND $2 AND status_baru IS NULL;

        dijalankan berulang dalam batch, di luar langkah deploy,
        dengan jeda di antaranya.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Migrasi terasa seperti langkah teknis kecil di akhir rilis, dan ia satu-satunya langkah yang tidak punya tombol batal.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Merilis migrasi penghapusan bersama kode yang membutuhkannya',
            'Satu perubahan, satu rilis',
            'Diuji, rollback kode menghasilkan `column does not exist`. Tidak ada jendela rollback yang aman',
          ],
          [
            'Menjalankan migrasi di dalam startup aplikasi',
            'Otomatis, tidak ada langkah tambahan',
            'Semua instance menjalankannya bersamaan. Jadikan langkah tersendiri sebelum instance dinyalakan',
          ],
          [
            'Menjalankan `CREATE INDEX` tanpa `CONCURRENTLY`',
            'Cuma menambah indeks',
            'Diukur, ia mengunci penulisan. Pada tabel besar itu berarti pemadaman selama indeksnya dibangun',
          ],
          [
            'Menambah kolom `NOT NULL` langsung pada tabel besar',
            'Kolomnya memang wajib',
            'Ia mengunci dan menulis ulang. Tambahkan nullable, backfill, lalu validasi dengan `NOT VALID`',
          ],
          [
            'Menjalankan backfill sebagai satu `UPDATE`',
            'Sekali jalan, selesai',
            'Transaksi panjang mengunci, membengkakkan WAL, dan membuat autovacuum tertinggal. Pecah jadi batch',
          ],
          [
            'Menguji migrasi hanya pada basis data kosong',
            'Perintahnya kan sama',
            'Waktu dan penguncian ditentukan jumlah baris. Uji pada volume yang realistis',
          ],
        ],
      ),
      p(
        'Ada satu pertanyaan yang menutup hampir seluruh tabel itu, dan pantas ditanyakan pada setiap migrasi sebelum ia digabungkan. Bila kode versi lama dan kode versi baru berjalan **bersamaan** selama sepuluh menit, apakah keduanya masih bekerja dengan benar terhadap skema ini? Bila jawabannya tidak, migrasinya harus dipecah, sebab keadaan itu bukan kemungkinan melainkan keharusan pada setiap rilis tanpa henti.',
      ),
      references(
        {
          label: 'Database: Migrations',
          href: 'https://laravel.com/docs/12.x/migrations',
          source: 'Laravel Docs',
          note: 'Bentuk berkas migrasi beserta cara membatalkannya',
        },
        {
          label: 'Development and production workflows',
          href: 'https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production',
          source: 'Prisma Docs',
          note: 'Beda perintah yang dipakai saat mengembangkan dan saat merilis',
        },
        {
          label: 'Backup and Restore',
          href: 'https://www.postgresql.org/docs/current/backup.html',
          source: 'PostgreSQL Docs',
          note: 'Jaring pengaman yang harus ada sebelum migrasi berisiko dijalankan',
        },
      ),
    ],
  ),

  written(
    'storage-cdn',
    'Penyimpanan Berkas & CDN',
    18,
    'Menyimpan berkas di luar server, dan menyajikannya dengan cepat.',
    [
      terms(
        {
          term: 'object storage',
          meaning:
            'Penyimpanan berkas lewat antarmuka HTTP, tempat tiap berkas punya kunci dan metadata sendiri, bukan folder seperti sistem berkas biasa. Dipakai untuk unggahan pengguna karena kapasitasnya praktis tak terbatas dan tidak terikat pada satu mesin.',
        },
        {
          term: 'ephemeral filesystem',
          meaning:
            'Sistem berkas container atau instance yang isinya hilang saat ia dibuat ulang. Inilah sebabnya menyimpan unggahan pengguna di folder lokal aplikasi berakhir dengan berkas yang lenyap setelah deploy berikutnya.',
        },
        {
          term: 'presigned URL',
          meaning:
            'Alamat berbatas waktu yang memberi izin sementara mengunggah atau mengunduh satu berkas tertentu, tanpa memberikan kredensial penyimpanannya. Memungkinkan peramban mengunggah langsung ke penyimpanan tanpa melewati servermu.',
        },
        {
          term: 'Content-Disposition',
          meaning:
            'Header yang memberi tahu peramban apakah sebuah berkas ditampilkan atau diunduh, beserta nama berkasnya. Menyetelnya `attachment` untuk berkas unggahan pengguna mencegah peramban menjalankan isinya sebagai halaman.',
        },
        {
          term: 'nama berkas acak',
          meaning:
            'Penggantian nama berkas dari pengguna dengan nama yang dibuat server. Menutup dua hal sekaligus, yaitu penelusuran path lewat nama seperti `../../` dan penimpaan berkas milik orang lain.',
        },
        {
          term: 'magic byte',
          meaning:
            'Beberapa byte pertama sebuah berkas yang menunjukkan jenisnya sebenarnya. Diperiksa karena ekstensi nama dan header `Content-Type` dari klien sama-sama bisa dipalsukan.',
        },
        {
          term: 'CDN origin',
          meaning:
            'Sumber asli yang dihubungi CDN saat ia belum punya salinan sebuah berkas. Untuk berkas media, origin-nya adalah object storage, sehingga servermu tidak ikut menanggung lalu lintas unduhan.',
        },
        {
          term: 'cache key',
          meaning:
            'Kombinasi yang menentukan sebuah respons dianggap salinan yang sama atau berbeda di CDN, biasanya alamat ditambah sebagian header. Menyertakan header yang berbeda per pengunjung membuat hampir tidak ada salinan yang bisa dipakai ulang.',
        },
      ),

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
      p(
        'Komentar di baris ketiga menyebut hal yang membuat pola ini portabel: S3, Cloudflare R2, DigitalOcean Spaces, dan MinIO semuanya berbicara dengan protokol yang sama, sehingga berpindah penyedia cukup dengan mengganti `endpoint` dan kredensialnya. Kodenya tidak berubah — dan itu alasan bagus memakai SDK S3 bahkan kalau kamu tidak memakai AWS.',
      ),
      p(
        'Baris `Key` adalah yang paling menentukan keamanannya. Nama berkas dibentuk dari `crypto.randomUUID()`, **bukan** dari nama berkas yang dikirim pengguna. Nama dari klien adalah untrusted input: ia bisa berisi `../` untuk keluar dari direktori, bisa menimpa berkas milik orang lain, dan bisa membawa ekstensi yang berbahaya. Awalan `unggahan/${penggunaId}/` menambah pemisahan per pengguna sehingga aturan akses lebih mudah ditegakkan.',
      ),
      p(
        "`ContentType: 'image/jpeg'` disetel di sisi server, bukan disalin dari `Content-Type` yang dikirim browser — nilai itu ditentukan klien dan bisa berbohong. Menyimpannya salah berarti object storage kelak menyajikan berkas itu dengan tipe yang keliru, dan berkas HTML yang disajikan sebagai HTML dari domain bucket-mu adalah XSS yang menunggu terjadi.",
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
      p(
        'Dua pendekatan ini punya trade-off yang berlawanan. **URL bertanda tangan** paling murah: berkasnya diambil langsung dari object storage tanpa melewati servermu sama sekali, sehingga bandwidth dan CPU aplikasi tidak terpakai. `expiresIn: 300` membatasi masa berlakunya lima menit — cukup untuk mengunduh, terlalu pendek untuk berguna kalau URL-nya bocor.',
      ),
      p(
        'Menyajikan **lewat aplikasi** lebih mahal tetapi memberi sesuatu yang tidak bisa diberikan URL bertanda tangan: pemeriksaan otorisasi per permintaan, dan audit trail siapa mengunduh apa. Baris `repo.cariBerkas(req.params.id, req.pengguna.id)` adalah intinya — ID pengguna ikut masuk ke **query**, bukan diperiksa sesudah datanya diambil. Itulah bentuk yang benar untuk mencegah IDOR, dan `kirim404` (bukan `403`) menjaga agar keberadaan berkas milik orang lain pun tidak terungkap.',
      ),
      p(
        'Empat header di `res.set` masing-masing menutup satu risiko. `Content-Disposition: attachment` memaksa berkas diunduh alih-alih ditampilkan, sehingga HTML atau SVG jahat tidak dieksekusi di domainmu; `encodeURIComponent` mencegah nama berkas menyuntikkan header tambahan. `X-Content-Type-Options: nosniff` melarang browser menebak tipe berkas dari isinya. `Cache-Control: private, no-store` menjaga agar berkas privat tidak tersimpan di proxy bersama.',
      ),
      callout(
        'warning',
        'URL bertanda tangan tetap bisa diteruskan',
        'Selama masa berlakunya, siapa pun yang memegangnya bisa mengunduh. Buat sesingkat mungkin dalam hitungan menit, dan jangan pernah menaruhnya di tempat yang tercatat seperti log akses atau riwayat pesan.',
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
      p(
        'Diagram di atas menjelaskan kenapa nilai `CacheControl` penting: setelah permintaan pertama, CDN yang menjawab — dan asalnya tidak lagi tersentuh selama entri cache masih berlaku. Nilai yang kamu setel di sini menentukan berapa lama "selama" itu, dan berapa lama pula versi lama masih beredar setelah kamu memperbarui berkasnya.',
      ),
      p(
        'Baris pertama (`max-age=31536000, immutable`) hanya aman untuk berkas yang **namanya mengandung hash isinya**. Isinya berubah berarti namanya berubah, jadi tidak pernah ada versi lama yang perlu dibuang — dan `immutable` memberitahu browser untuk tidak repot memeriksa ulang bahkan saat pengguna menekan refresh.',
      ),
      p(
        'Baris kedua untuk berkas yang namanya tetap, misalnya `logo.png`. `max-age=300` membuatnya segar lima menit; `stale-while-revalidate=3600` mengizinkan CDN **tetap menyajikan versi lama** hingga satu jam sesudahnya sambil mengambil yang baru di latar belakang. Pengunjung tidak pernah menunggu, dengan konsekuensi sebagian dari mereka melihat versi lama selama beberapa menit — trade-off yang layak untuk aset, tetapi tidak untuk data.',
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
      p(
        'Kebijakan ini dipasang **di bucket** dan bukan di aplikasi, karena browser berbicara langsung ke object storage saat unggahan memakai URL bertanda tangan. `"AllowedOrigins": ["https://app.contoh.com"]` menyebut satu origin persis, bukan wildcard maupun awalan, sehingga situs lain tidak bisa membaca berkas atas nama pengguna yang sedang login.',
      ),
      p(
        '`"AllowedMethods": ["GET", "PUT"]` hanya mencakup yang benar-benar dipakai: `GET` untuk membaca, `PUT` untuk mengunggah lewat URL bertanda tangan. `DELETE` sengaja tidak ada — penghapusan seharusnya lewat aplikasimu, yang memeriksa kewenangan lebih dulu. `MaxAgeSeconds: 3000` menyuruh browser menyimpan hasil preflight `OPTIONS` selama itu, sehingga tidak setiap unggahan didahului permintaan tambahan.',
      ),
      callout(
        'warning',
        'CORS bucket dengan `*` membuat berkasmu bisa dibaca situs mana pun',
        'Untuk aset publik itu mungkin memang yang diinginkan. Untuk bucket yang menyimpan unggahan pengguna, meski privat, batasi ke origin aplikasimu sendiri.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Menyimpan berkas unggahan di disk server terasa paling sederhana, dan ia menjadi penghalang pada hari instance aplikasimu bertambah dari satu menjadi dua.',
      ),
      code(
        'text',
        `
        Gejala yang muncul BERSAMAAN pada hari itu:

          "Berkas yang baru diunggah kadang tidak ditemukan"
            -> tersimpan di disk instance A, diminta lewat instance B

          "Sesi pengguna hilang secara acak"
            -> sesi di memori satu instance

          "Job berkala berjalan dua kali"
            -> setiap instance menjalankan penjadwalnya sendiri

        Ketiganya berasal dari asumsi yang sama, yaitu bahwa hanya
        ada satu proses.
        `,
        {
          caption:
            'Object storage menyelesaikan yang pertama, dan dua sisanya menuntut penyelesaiannya sendiri.',
        },
      ),
      p(
        'Bentuk yang paling berpengaruh bukan sekadar memindahkan penyimpanannya, melainkan memindahkan **jalur unggahannya** sehingga berkasnya tidak pernah melewati aplikasimu.',
      ),
      code(
        'ts',
        `
        // 1. Klien meminta izin mengunggah. Server memeriksa
        //    otorisasi, tipe, dan ukuran yang DIKLAIM.
        export async function POST(req: Request) {
          const pengguna = await wajibMasuk(req);
          const { tipe, ukuran } = Unggahan.parse(await req.json());

          const kunci = \`unggahan/\${pengguna.id}/\${crypto.randomUUID()}\`;
          const url = await penyimpanan.urlBertandaTangan({
            kunci,
            metode: 'PUT',
            tipeIsi: tipe,
            maksimalByte: ukuran,
            kedaluwarsaDetik: 300,          // berumur pendek
          });

          await db.berkas.create({ data: { kunci, pemilikId: pengguna.id, status: 'menunggu' } });
          return Response.json({ url, kunci });
        }

        // 2. Klien mengunggah LANGSUNG ke penyimpanan.
        // 3. Penyimpanan memberi tahu server lewat webhook, ATAU
        //    klien memanggil endpoint konfirmasi; server lalu
        //    MEMERIKSA ISI berkasnya, bukan mempercayai klaimnya.
        `,
      ),
      p(
        'Langkah ketiga itu yang sering dilewatkan, dan pemeriksaannya tidak bisa mengandalkan apa yang dikirim klien.',
      ),
      code(
        'text',
        `
        Diuji sungguhan pada bab Keamanan, tiga berkas berekstensi
        .png yang semuanya diklaim image/png:

          asli.png       magic byte = image/png       diterima
          jahat.png      magic byte = TIDAK DIKENAL   DITOLAK
          polyglot.png   magic byte = image/png       diterima

        Dan polyglot.png:
          8 byte pertama : 89 50 4e 47 0d 0a 1a 0a    <- tanda PNG sah
          isinya juga    : "<?php system($_GET['c']); ?>"

        Magic byte menutup yang kedua dan TIDAK menutup yang ketiga.
        Yang menutupnya adalah ENCODE ULANG gambarnya, sehingga yang
        tersimpan hanya piksel, bukan byte asli yang diunggah.
        `,
      ),
      p(
        'Cara menyajikannya kembali sama menentukannya, dan selisihnya sudah diukur di peramban sungguhan.',
      ),
      code(
        'text',
        `
        Diukur di Chrome 149. Berkas HTML yang diunggah, disajikan
        dengan tipe yang ditebak dari ekstensi namanya:

          PESAN DITERIMA: XSS-BERJALAN  <- skrip unggahan BERJALAN

        Berkas yang SAMA, disajikan dengan header yang benar:

          content-type: application/octet-stream
          content-disposition: attachment; filename="berkas"
          x-content-type-options: nosniff
          content-security-policy: default-src 'none'; sandbox

          -> peramban mengunduhnya, tidak merendernya, dan tidak
             menjalankan apa pun.
        `,
        { caption: 'Isinya identik. Yang menentukan sepenuhnya adalah header yang menyertainya.' },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan pada jalur penyimpanan punya beberapa bentuk yang gejalanya jauh dari penyebabnya.',
      ),
      code(
        'text',
        `
        1. Unggahan langsung ditolak peramban

           Access to fetch at 'https://penyimpanan.../unggahan/...'
           from origin 'https://app.contoh.id' has been blocked by
           CORS policy

           Bucket-nya punya aturan CORS SENDIRI, terpisah dari aturan
           CORS aplikasimu. Ia harus mengizinkan origin aplikasimu
           dan metode PUT.

        2. URL bertanda tangan kedaluwarsa di tengah unggahan

           Berkas besar di jaringan lambat bisa melebihi masa berlaku
           URL-nya. Untuk berkas besar, pakai unggahan berbagian
           dengan URL per bagian.

        3. 413 dengan badan HTML, bukan JSON

           Yang menolak adalah proxy, bukan aplikasimu. Diukur di
           bab Fondasi, yang dilihat klien:
             SyntaxError: Unexpected token '<', "<!doctype "...

        4. Berkas yatim

           berkas ditulis -> BERHASIL
           baris metadata -> GAGAL
           => berkas yang tidak ditunjuk siapa pun, memakan ruang
              selamanya

           Urutan sebaliknya menghasilkan baris yang menunjuk berkas
           tidak ada, dan setiap pembacaannya 404.

           Menutupnya: catat metadata berstatus "menunggu" LEBIH DULU,
           unggah, lalu ubah statusnya. Plus satu tugas berkala yang
           membersihkan yang tidak pernah dikonfirmasi.
        `,
      ),
      p(
        'Pada sisi CDN, kegagalan yang paling berbahaya bukan berkas yang tidak tampil melainkan berkas pribadi yang tampil kepada orang yang salah.',
      ),
      code(
        'text',
        `
        Bucket yang dibuat publik "supaya gampang":

          - seluruh berkas bisa dibaca siapa saja yang tahu URL-nya
          - URL berisi nama berkas yang bisa ditebak memperparahnya
          - dan bila di-cache CDN, mencabut aksesnya TIDAK serta-merta
            menghapus salinan yang sudah tersebar

        Bentuk yang benar untuk berkas pribadi:
          bucket TETAP privat
          akses diberikan lewat URL bertanda tangan berumur pendek
          Cache-Control: private, max-age=60
          dan otorisasi diperiksa SETIAP KALI URL itu diterbitkan
        `,
      ),
      code(
        'text',
        `
        DAN SATU LAGI yang khas, tentang penamaan:

        Diuji sungguhan dengan Node 26.5.0:

          "../../etc/passwd"        basename="passwd"      <- ../ tertutup
          "CON.png"                 basename="CON.png"     <- lolos
          "a.php.png"               basename="a.php.png"   <- lolos
          "gambar.png .php"         lolos
          "a.png[NUL].php"          basename="a.png"       <- byte nol memotong

        basename() menutup satu hal dan tidak menutup sisanya.
        Nama berkas DIBUAT SERVER; nama asli disimpan sebagai
        metadata untuk ditampilkan saja.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penyimpanan berkas menggabungkan masalah ketersediaan dan masalah keamanan dalam satu fitur, dan kesalahannya sering berasal dari menyelesaikan salah satunya saja.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan unggahan di disk server',
            'Paling sederhana',
            'Begitu instance-nya dua, berkas yang baru diunggah kadang tidak ditemukan',
          ],
          [
            'Membuat bucket publik supaya mudah diakses',
            'Biar tidak repot mengurus izin',
            'Semua berkas bisa dibaca siapa saja yang tahu URL-nya, dan salinan CDN tetap tersebar setelah dicabut',
          ],
          [
            'Menyimpan nama berkas dari pengguna',
            '`basename()` kan sudah menutup `../`',
            'Diuji, `CON.png`, `a.php.png`, dan byte nol semuanya lolos. Buat namanya sendiri di server',
          ],
          [
            'Memercayai `Content-Type` dari klien',
            'Peramban yang mengisinya',
            'Nilainya dari ekstensi nama berkas. Periksa magic byte, lalu encode ulang gambarnya',
          ],
          [
            'Menyajikan unggahan dengan tipe dari ekstensinya',
            'Ekstensinya kan sesuai isinya',
            'Diukur, berkas HTML yang diunggah BERJALAN di origin aplikasi dan bisa membaca sesi pengguna',
          ],
          [
            'Menulis berkas dan metadata tanpa urutan yang aman',
            'Keduanya kan berhasil',
            'Bila satu gagal, hasilnya berkas yatim atau baris yang menunjuk berkas tidak ada',
          ],
        ],
      ),
      p(
        'Perlu dinyatakan apa yang diukur dan apa yang tidak. Yang **dijalankan sungguhan** adalah pemeriksaan magic byte beserta polyglot yang lolos, perilaku `basename()` terhadap tujuh bentuk nama berkas, dan eksekusi berkas HTML unggahan di Chrome 149 beserta header yang menghentikannya. Yang **tidak dijalankan** adalah object storage dan CDN mana pun, sebab keduanya memerlukan akun penyedia. Bentuk URL bertanda tangan dan aturan bucket ditulis mengikuti dokumentasi resmi dan ditandai sebagai tidak dieksekusi.',
      ),
      references(
        {
          label: 'Volumes',
          href: 'https://docs.docker.com/engine/storage/volumes/',
          source: 'Docker Docs',
          note: 'Kenapa sistem berkas container tidak cocok untuk data yang harus bertahan',
        },
        {
          label: 'Backing services',
          href: 'https://12factor.net/backing-services',
          source: 'Twelve-Factor App',
          note: 'Penyimpanan berkas sebagai sumber daya terpasang, bukan bagian dari aplikasi',
        },
        {
          label: 'Cache-Control',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control',
          source: 'MDN',
          note: 'Aturan masa simpan untuk berkas media yang disajikan lewat CDN',
        },
      ),
    ],
  ),
];
