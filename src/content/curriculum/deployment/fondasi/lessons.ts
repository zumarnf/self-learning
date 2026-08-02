import { callout, code, h2, p, steps, table, ul } from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Deployment — Chapter 1, all five lessons.
 *
 * The vocabulary chapter. Deployment is the one area of this curriculum that touches tools living
 * outside this repository, so the material is explicit about what can be verified locally and what
 * depends on a provider — stated openly rather than glossed over.
 */
export const lessons: LessonDraft[] = [
  written(
    'dev-staging-prod',
    'Beda Development, Staging & Production',
    9,
    'Tiga lingkungan dengan aturan yang berbeda tajam.',
    [
      p(
        'Kode yang sama berjalan di tiga tempat dengan konsekuensi yang sangat berbeda. Memperlakukan ketiganya sama adalah penyebab sebagian besar kejutan saat rilis.',
      ),

      table(
        ['', 'Development', 'Staging', 'Production'],
        [
          ['Data', 'Palsu', 'Mirip produksi (**tersamarkan**)', 'Sungguhan'],
          ['Kesalahan', 'Murah', 'Murah', '**Mahal**'],
          ['Debug menyala', 'Ya', 'Kadang', '**Tidak pernah**'],
          ['Optimasi build', 'Tidak', 'Ya', 'Ya'],
          ['Siapa yang terkena', 'Kamu', 'Tim', '**Pengguna**'],
          ['Rahasia', 'Palsu/lokal', 'Terpisah', 'Terpisah, dirotasi'],
        ],
      ),
      callout(
        'danger',
        'Jangan pernah menyalin data produksi ke staging apa adanya',
        'Data itu memuat email, nomor telepon, dan alamat orang sungguhan — dan staging biasanya punya kontrol akses yang jauh lebih longgar. Kalau butuh data realistis, **samarkan** dulu: ganti email, acak nama, hapus kolom sensitif. Ini kewajiban privasi, bukan kerapian.',
      ),

      h2('Dev/prod parity'),
      p(
        'Makin mirip ketiganya, makin sedikit kejutan. Yang paling sering berbeda dan paling sering menggigit:',
      ),
      ul(
        '**Versi database** — fungsi yang ada di Postgres 17 tidak ada di 14.',
        '**Versi runtime** — Node 22 di laptop, Node 18 di server.',
        "**Sistem berkas** — macOS tidak membedakan huruf besar-kecil, Linux membedakan. `import Button from './button'` jalan di laptop, gagal di server.",
        '**Zona waktu** — laptop di Asia/Jakarta, server di UTC.',
        '**Variabel environment** — yang ada di lokal belum tentu ada di server.',
      ),
      code(
        'json',
        `
        {
          "engines": { "node": ">=22 <23" }
        }
        `,
      ),
      code(
        'text',
        `
        22.11.0
        `,
        { filename: '.nvmrc' },
      ),

      h2('Yang berbeda dan memang harus berbeda'),
      code(
        'bash',
        `
        # Production
        NODE_ENV=production
        APP_DEBUG=false
        LOG_LEVEL=info
        MAIL_MAILER=ses

        # Development
        NODE_ENV=development
        APP_DEBUG=true
        LOG_LEVEL=debug
        MAIL_MAILER=log        # JANGAN pernah SMTP produksi
        `,
      ),
      callout(
        'danger',
        'SMTP produksi di lingkungan pengembangan adalah kecelakaan yang tidak bisa dibatalkan',
        'Satu seeder yang memicu notifikasi bisa mengirim ribuan email ke alamat pengguna sungguhan. Email yang sudah terkirim tidak bisa ditarik. Pakai `log` atau Mailpit, dan pastikan `.env` pengembangan tidak pernah memuat kredensial produksi.',
      ),

      h2('Apakah kamu butuh staging'),
      p(
        'Untuk project satu orang, staging sering berlebihan — biayanya nyata dan manfaatnya kecil. Ia berbayar saat: ada tim yang perlu meninjau sebelum rilis, ada integrasi pihak ketiga yang harus diuji dengan konfigurasi sungguhan, atau ada migrasi database yang perlu dicoba pada volume data realistis.',
      ),
      callout(
        'tip',
        'Preview deployment sering menggantikan staging',
        'Vercel, Netlify, dan Cloudflare Pages membuat satu lingkungan per pull request secara otomatis. Untuk sebagian besar project, itu memberi manfaat staging tanpa biaya memelihara satu lingkungan permanen.',
      ),
    ],
  ),

  written(
    'build-vs-runtime',
    'Build vs Runtime',
    10,
    'Perbedaan yang menentukan apa yang bisa diubah tanpa build ulang.',
    [
      p(
        'Sebagian hal ditentukan **saat build** dan tertanam permanen; sebagian lagi dibaca **saat runtime** dan bisa diubah tanpa menyentuh kodenya. Salah memahami batas ini adalah penyebab kelas bug "jalan di lokal, gagal di produksi" yang paling sering.',
      ),

      h2('Perbedaannya'),
      table(
        ['', 'Build time', 'Runtime'],
        [
          ['Kapan', 'Sekali, sebelum deploy', 'Setiap kali aplikasi jalan'],
          ['Nilai berubah?', '**Tertanam permanen**', 'Bisa diubah tanpa build ulang'],
          ['Contoh', 'Bundle JS, halaman statis', 'Koneksi database, kunci API'],
          ['Untuk mengubah', 'Build ulang + deploy', 'Ubah env + restart'],
        ],
      ),

      h2('Kasus yang paling sering menggigit'),
      code(
        'ts',
        `
        // Client Component — nilai ini DITANAM saat build
        'use client';
        const url = process.env.NEXT_PUBLIC_API_URL;

        // Kalau build memakai .env staging lalu artefaknya di-deploy
        // ke produksi, aplikasi produksi akan menembak API staging.
        // Mengubah environment produksi TIDAK menolong —
        // nilainya sudah ada di dalam JavaScript-nya.
        `,
      ),
      callout(
        'danger',
        'Artefak build terikat pada environment saat ia dibangun',
        'Ini berarti kamu **tidak bisa** membangun sekali lalu memakai artefak yang sama untuk staging dan produksi, kalau ada variabel publik yang berbeda. Pilihannya: build terpisah per lingkungan, atau pindahkan nilai itu ke runtime lewat konfigurasi yang dibaca server.',
      ),

      h2('Di Next.js'),
      table(
        ['Ditentukan saat build', 'Dibaca saat runtime'],
        [
          ['`NEXT_PUBLIC_*` di Client Component', '`process.env.*` di Server Component'],
          ['Halaman statis dari `generateStaticParams`', 'Route Handler dan Server Action'],
          ['Ukuran dan isi bundle', 'Data yang di-`fetch` per permintaan'],
          ['Berkas font yang di-`next/font/local`', 'Koneksi database'],
        ],
      ),

      h2('Membuat konfigurasi bisa diubah saat runtime'),
      code(
        'tsx',
        `
        // Server Component membaca env, lalu mengopernya sebagai prop.
        // Nilainya bisa diubah tanpa build ulang.
        export default function Layout({ children }) {
          return (
            <PenyediaKonfigurasi
              config={{ apiUrl: process.env.API_URL!, fiturBaru: process.env.FITUR_BARU === 'true' }}
            >
              {children}
            </PenyediaKonfigurasi>
          );
        }
        `,
      ),
      callout(
        'warning',
        'Apa pun yang dioper ke Client Component ikut ke browser',
        'Pola di atas memindahkan konfigurasi ke runtime, tapi nilainya tetap **publik** — ia terkirim lewat payload RSC. Jangan pakai untuk rahasia; pakai hanya untuk hal yang memang boleh diketahui pengguna, seperti URL API atau bendera fitur.',
      ),

      h2('Urutan yang benar'),
      code(
        'text',
        `
        1. Install dependency        npm ci
        2. Type-check & lint         gagal di sini, jangan lanjut
        3. Test                      gagal di sini, jangan lanjut
        4. Build                     dengan env lingkungan TUJUAN
        5. Migrasi database          sebelum kode baru menerima trafik
        6. Deploy artefak
        7. Restart pekerja antrean   queue:restart
        8. Verifikasi
        `,
      ),
      callout(
        'danger',
        'Langkah 7 sangat sering terlupa',
        'Pekerja antrean memuat kode **sekali** saat dijalankan. Setelah deploy, pekerja lama masih menjalankan kode lama sampai dimulai ulang — menghasilkan bug yang membingungkan: perbaikan sudah di-deploy tapi job tetap gagal dengan cara yang sama.',
      ),

      h2('Artefak build tidak boleh memuat rahasia'),
      code(
        'bash',
        `
        # Periksa sebelum deploy
        grep -rE "sk_live|AKIA|-----BEGIN|password" .next/static/ dist/ 2>/dev/null \\
          && echo "RAHASIA DI ARTEFAK — hentikan deploy"
        `,
      ),
    ],
  ),

  written(
    'env-secret',
    'Environment Variable & Secret Management',
    12,
    'Tempat kebocoran paling umum, di lapisan yang paling sering diabaikan.',
    [
      p(
        'Sub-bab 5.11 Backend Intermediate membahas aturannya. Yang ini tentang **cara mewujudkannya saat deploy** — di mana nilainya benar-benar disimpan dan bagaimana ia sampai ke aplikasi.',
      ),

      h2('Empat cara, dari terburuk ke terbaik'),
      table(
        ['Cara', 'Penilaian'],
        [
          ['Hardcode di source', '**Tidak pernah**'],
          ['Berkas `.env` di server', 'Bisa diterima kalau izin berkasnya ketat'],
          ['Environment dari platform', 'Baik — disuntikkan saat deploy'],
          ['Secrets manager', '**Terbaik** — audit, rotasi, akses terkontrol'],
        ],
      ),

      h2('Berkas `.env` di server'),
      code(
        'bash',
        `
        # Kalau memang memakainya, kunci izinnya
        chmod 600 /var/www/app/.env
        chown app:app /var/www/app/.env

        # Dan pastikan tidak terjangkau lewat web —
        # document root HARUS menunjuk public/, bukan akar project.
        curl -s -o /dev/null -w "%{http_code}\\n" https://contoh.com/.env
        # Harus 404. Kalau 200, hentikan semuanya dan rotasi seluruh rahasia.
        `,
      ),
      callout(
        'danger',
        '`.env` yang bisa diunduh lewat web adalah kompromi total',
        'Ia memuat kredensial database, kunci aplikasi, dan token pihak ketiga sekaligus. Ini kesalahan konfigurasi yang masih rutin ditemukan di server sungguhan — dan pemindai otomatis mencarinya terus-menerus.',
      ),

      h2('Environment dari platform'),
      code(
        'bash',
        `
        # Vercel
        vercel env add DATABASE_URL production

        # Fly.io
        fly secrets set DATABASE_URL="postgresql://..."

        # Docker Compose — dari berkas di luar repo
        docker compose --env-file /etc/app/.env up -d
        `,
      ),

      h2('Secrets manager'),
      code(
        'js',
        `
        // Ambil saat boot, jangan dibakukan ke image
        import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

        export async function muatRahasia() {
          const klien = new SecretsManagerClient({});
          const hasil = await klien.send(new GetSecretValueCommand({ SecretId: 'app/produksi' }));

          const rahasia = JSON.parse(hasil.SecretString);
          for (const [k, v] of Object.entries(rahasia)) process.env[k] = v;
        }
        `,
      ),
      p(
        'Keuntungan utamanya bukan enkripsinya — melainkan **audit trail** (siapa membaca apa, kapan) dan **rotasi** yang tidak memerlukan deploy.',
      ),

      h2('Validasi saat boot'),
      code(
        'ts',
        `
        const Skema = z.object({
          DATABASE_URL: z.string().url(),
          JWT_SECRET: z.string().min(32),
          NODE_ENV: z.enum(['development', 'test', 'production']),
        });

        const hasil = Skema.safeParse(process.env);
        if (!hasil.success) {
          console.error('Konfigurasi tidak valid:');
          for (const m of hasil.error.issues) console.error(\`  \${m.path.join('.')}: \${m.message}\`);
          process.exit(1);
        }
        `,
      ),
      callout(
        'tip',
        'Deploy yang gagal saat boot jauh lebih murah daripada deploy yang "berhasil"',
        'Aplikasi yang menolak menyala membuat deploy dibatalkan dan versi lama tetap melayani. Aplikasi yang menyala dengan `JWT_SECRET` bernilai `undefined` akan menandatangani token yang tidak sah — dan baru ketahuan saat pengguna pertama mencoba masuk.',
      ),

      h2('Rotasi'),
      steps(
        {
          title: '1. Buat rahasia baru, jangan hapus yang lama',
          body: 'Kedua nilai harus sah sementara waktu, supaya tidak ada permintaan yang gagal di tengah proses.',
        },
        {
          title: '2. Deploy aplikasi yang menerima keduanya',
          body: 'Untuk kunci penandatangan: verifikasi dengan kunci lama **dan** baru; tanda tangani dengan yang baru.',
        },
        {
          title: '3. Tunggu sampai semua yang lama kedaluwarsa',
          body: 'Untuk token 30 hari, berarti menunggu 30 hari — atau mencabut semuanya secara sadar dan menerima bahwa pengguna harus masuk lagi.',
        },
        {
          title: '4. Hapus yang lama, dan verifikasi',
          body: 'Pastikan tidak ada lagi yang memakainya sebelum benar-benar dihapus.',
        },
      ),
      p(
        'Rotasi wajib dilakukan setelah: rahasia ter-commit, anggota tim keluar, atau ada kecurigaan kompromi.',
      ),

      h2('Pemindaian di CI'),
      code(
        'yaml',
        `
        - name: Pindai rahasia
          uses: gitleaks/gitleaks-action@v2
          # Gagalkan build kalau ada yang terdeteksi.
        `,
      ),
      callout(
        'danger',
        'Rahasia yang pernah ter-commit dianggap bocor selamanya',
        'Menulis ulang riwayat git tidak menariknya dari clone, fork, dan indeks pemindai otomatis yang memantau GitHub secara terus-menerus. Satu-satunya perbaikan yang benar adalah rotasi.',
      ),
    ],
  ),

  written(
    'domain-dns-tls',
    'Domain, DNS & HTTPS/TLS',
    11,
    'Bagaimana nama menjadi alamat, dan koneksi menjadi terenkripsi.',
    [
      h2('DNS'),
      table(
        ['Record', 'Untuk'],
        [
          ['`A`', 'Nama → alamat IPv4'],
          ['`AAAA`', 'Nama → alamat IPv6'],
          ['`CNAME`', 'Nama → nama lain (tidak boleh di root domain)'],
          ['`MX`', 'Server email'],
          ['`TXT`', 'Verifikasi, SPF, DKIM'],
          ['`CAA`', 'Membatasi CA mana yang boleh menerbitkan sertifikat'],
        ],
      ),
      code(
        'text',
        `
        contoh.com.        A      203.0.113.10
        www.contoh.com.    CNAME  contoh.com.
        api.contoh.com.    A      203.0.113.11
        contoh.com.        CAA    0 issue "letsencrypt.org"
        `,
      ),
      callout(
        'tip',
        'Record `CAA` menutup satu kelas serangan yang jarang dibicarakan',
        'Tanpa itu, **CA mana pun** di dunia bisa menerbitkan sertifikat untuk domainmu. `CAA` membatasi ke penerbit yang kamu izinkan — satu baris yang menghilangkan seluruh kategori penerbitan sertifikat yang tidak sah.',
      ),

      h2('TTL dan propagasi'),
      code(
        'bash',
        `
        dig contoh.com A +short
        dig contoh.com A          # lihat TTL-nya
        `,
      ),
      callout(
        'warning',
        'Turunkan TTL sebelum memindahkan server, bukan sesudahnya',
        'TTL 86400 berarti resolver menyimpan jawaban lama sampai 24 jam. Kalau kamu memindahkan server lalu baru menurunkan TTL, sebagian pengguna tetap diarahkan ke server lama sepanjang hari itu. Turunkan ke 300 **beberapa hari sebelum** perpindahan.',
      ),

      h2('HTTPS'),
      code(
        'bash',
        `
        # Let's Encrypt lewat Certbot
        sudo certbot --nginx -d contoh.com -d www.contoh.com
        sudo certbot renew --dry-run     # uji pembaruan otomatisnya
        `,
      ),
      code(
        'text',
        `
        # Caddy: HTTPS otomatis, termasuk pembaruannya
        contoh.com {
            reverse_proxy localhost:3000
        }
        `,
      ),
      callout(
        'danger',
        'Sertifikat kedaluwarsa adalah gangguan total, dan bisa dicegah sepenuhnya',
        'Browser menolak memuat situsnya sama sekali — bukan peringatan kecil. Pastikan pembaruan otomatis benar-benar berjalan (`renew --dry-run`), dan pasang pemantauan yang memberi tahu **30 hari sebelum** kedaluwarsa. Ini kegagalan yang selalu bisa dihindari.',
      ),

      h2('Konfigurasi TLS'),
      code(
        'text',
        `
        # Alihkan HTTP ke HTTPS
        server {
            listen 80;
            server_name contoh.com;
            return 301 https://$host$request_uri;
        }

        server {
            listen 443 ssl http2;
            server_name contoh.com;

            ssl_certificate     /etc/letsencrypt/live/contoh.com/fullchain.pem;
            ssl_certificate_key /etc/letsencrypt/live/contoh.com/privkey.pem;

            # TLS 1.0/1.1 sudah tidak aman
            ssl_protocols TLSv1.2 TLSv1.3;
            ssl_prefer_server_ciphers off;

            add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        }
        `,
      ),
      callout(
        'warning',
        'HSTS sulit dibatalkan — mulai dari `max-age` kecil',
        'Setelah browser menerima HSTS, ia **menolak** koneksi HTTP ke domainmu selama masa berlakunya. Kalau ada yang salah, kamu tidak bisa sekadar mematikannya — browser yang sudah menyimpannya tetap memaksa HTTPS. Mulai dari `max-age=300`, naikkan bertahap, dan pikirkan matang sebelum menambahkan `preload`.',
      ),

      h2('Verifikasi'),
      code(
        'bash',
        `
        curl -sI https://contoh.com | head -1
        curl -sI http://contoh.com | grep -i location     # harus 301 ke https

        echo | openssl s_client -connect contoh.com:443 -servername contoh.com 2>/dev/null \\
          | openssl x509 -noout -dates
        `,
      ),
      p(
        'Untuk penilaian menyeluruh, SSL Labs memberi laporan lengkap termasuk cipher dan rantai sertifikat. Jalankan sekali setelah setup, dan ulangi setelah perubahan konfigurasi TLS.',
      ),
    ],
  ),

  written(
    'reverse-proxy',
    'Reverse Proxy & Load Balancer Sekilas',
    11,
    'Lapisan di depan aplikasi, dan apa yang ia ambil alih.',
    [
      p(
        'Aplikasi Node atau PHP-FPM jarang menghadap internet langsung. Di depannya ada reverse proxy yang mengambil alih TLS, kompresi, berkas statis, dan pembatasan laju — hal-hal yang tidak perlu dikerjakan aplikasimu.',
      ),

      h2('Yang ia kerjakan'),
      table(
        ['Tugas', 'Kenapa di proxy'],
        [
          ['Terminasi TLS', 'Satu tempat mengelola sertifikat'],
          ['Berkas statis', 'Jauh lebih cepat daripada lewat aplikasi'],
          ['Kompresi', 'Tidak membebani proses aplikasi'],
          ['Rate limit lapisan pertama', 'Menahan sebelum mencapai aplikasi'],
          ['Batas ukuran body', 'Menolak permintaan raksasa lebih awal'],
          ['Load balancing', 'Membagi ke beberapa instance'],
        ],
      ),

      h2('Nginx'),
      code(
        'text',
        `
        upstream app {
            server 127.0.0.1:3000;
            keepalive 32;
        }

        server {
            listen 443 ssl http2;
            server_name contoh.com;

            # Batas ukuran body — pertahanan pertama
            client_max_body_size 10m;

            # Timeout supaya koneksi lambat tidak menahan sumber daya
            proxy_connect_timeout 5s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;

            location / {
                proxy_pass http://app;
                proxy_http_version 1.1;

                # WAJIB — tanpa ini aplikasi melihat semua permintaan
                # datang dari 127.0.0.1, dan rate limit per IP jadi tidak berguna.
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }

            location /_next/static/ {
                alias /var/www/app/.next/static/;
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
        `,
      ),
      callout(
        'danger',
        '`trust proxy` di aplikasi harus diberi ANGKA, bukan `true`',
        "Header `X-Forwarded-For` bisa dipalsukan siapa pun. Dengan `app.set('trust proxy', true)`, Express mempercayai seluruh rantainya — dan penyerang cukup mengirim IP acak di setiap permintaan untuk melewati rate limit sepenuhnya. Angka `1` berarti hanya mempercayai satu proxy terdekat.",
      ),

      h2('Caddy — alternatif yang jauh lebih ringkas'),
      code(
        'text',
        `
        contoh.com {
            encode gzip zstd

            handle /_next/static/* {
                root * /var/www/app
                header Cache-Control "public, max-age=31536000, immutable"
                file_server
            }

            handle {
                reverse_proxy localhost:3000
            }
        }
        `,
      ),
      p(
        'Caddy mengurus sertifikat HTTPS otomatis, termasuk pembaruannya. Untuk project kecil dan menengah, itu menghilangkan satu sumber gangguan yang cukup sering.',
      ),

      h2('Rate limit di lapisan proxy'),
      code(
        'text',
        `
        limit_req_zone $binary_remote_addr zone=umum:10m rate=10r/s;
        limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;

        location /api/ {
            limit_req zone=umum burst=20 nodelay;
            proxy_pass http://app;
        }

        location /api/auth/ {
            limit_req zone=auth burst=5 nodelay;
            proxy_pass http://app;
        }
        `,
      ),
      callout(
        'tip',
        'Rate limit di proxy melengkapi, bukan menggantikan',
        'Proxy membatasi per IP dan menahan banjir sebelum mencapai aplikasi. Yang **tidak** bisa ia lakukan: membatasi per akun. Botnet dengan ribuan IP lolos dari batas per-IP tapi tertangkap batas per-akun. Keduanya diperlukan.',
      ),

      h2('Load balancer'),
      code(
        'text',
        `
        upstream app {
            least_conn;
            server 10.0.0.1:3000 max_fails=3 fail_timeout=30s;
            server 10.0.0.2:3000 max_fails=3 fail_timeout=30s;
            server 10.0.0.3:3000 backup;
        }
        `,
      ),
      callout(
        'warning',
        'Beberapa instance mensyaratkan aplikasi yang benar-benar stateless',
        'Sesi di memori proses berarti pengguna tampak "logout sendiri" secara acak, tergantung instance mana yang menerima permintaannya. Rate limit di memori berarti batasnya efektif dikalikan jumlah instance. Keduanya harus pindah ke penyimpanan bersama sebelum menambah instance kedua.',
      ),

      h2('Health check untuk load balancer'),
      code(
        'text',
        `
        location /health {
            proxy_pass http://app/health/ready;
            access_log off;
        }
        `,
      ),
      p(
        'Load balancer memakai endpoint ini untuk memutuskan instance mana yang menerima trafik. Health check yang selalu menjawab `200` membuatnya mengirim trafik ke instance yang databasenya sudah putus.',
      ),
    ],
  ),
];
