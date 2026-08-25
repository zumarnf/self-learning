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
      p(
        'Dua berkas ini menutup butir "versi runtime" dari daftar di atas, dan keduanya perlu karena bekerja pada **pihak yang berbeda**. `engines` di `package.json` dibaca oleh npm dan sebagian besar penyedia hosting: kalau versi Node di sana tidak memenuhi rentangnya, pemasangan memberi peringatan atau gagal. `.nvmrc` dibaca oleh `nvm` di laptopmu — `nvm use` tanpa argumen langsung berpindah ke versi yang tertulis.',
      ),
      p(
        'Perhatikan rentangnya ditulis `">=22 <23"`, bukan `">=22"`. Batas atas itu disengaja: Node 23 mungkin membawa perubahan yang memutus, dan kamu ingin **memutuskan sadar** untuk naik, bukan ikut terbawa saat penyedia hosting memperbarui bawaannya. Ini pola yang sama seperti mengunci versi mayor dependency.',
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
      p(
        'Keempat variabel ini adalah perbedaan yang **memang harus ada** — kebalikan dari daftar sebelumnya yang harus diseragamkan. `APP_DEBUG=false` di produksi menutup kebocoran terbesar: halaman error mode debug menampilkan stack trace, potongan kode, dan pada beberapa versi isi environment beserta kredensial database. Satu error yang sengaja dipicu sudah cukup untuk mendapat semuanya.',
      ),
      p(
        '`LOG_LEVEL` berbeda karena kebutuhannya berbeda: di pengembangan kamu ingin melihat segalanya, di produksi `debug` akan membanjiri penyimpanan log dan menenggelamkan peristiwa yang benar-benar penting. Dan `NODE_ENV=production` bukan sekadar penanda — banyak library memakai nilai itu untuk menyalakan jalur cepat dan mematikan pemeriksaan yang hanya berguna saat mengembangkan.',
      ),
      p(
        'Komentar berhuruf besar pada `MAIL_MAILER` menandai kecelakaan yang tidak bisa dibatalkan, dan bahayanya lebih halus daripada yang terlihat. Bukan hanya "jangan kirim email uji ke pengguna" — satu seeder yang memicu notifikasi, atau satu tes yang lupa `Notification::fake()`, bisa mengirim **ribuan** email ke alamat sungguhan sekaligus. Email yang sudah terkirim tidak bisa ditarik.',
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
      p(
        'Komentar di dalamnya menjelaskan mengapa ini kelas bug tersendiri: **mengubah environment produksi tidak menolong**. Biasanya variabel yang salah cukup diperbaiki lalu aplikasi di-restart. Di sini tidak — nilainya sudah tersalin ke dalam berkas JavaScript saat build, dan berkas itulah yang diunduh browser. Satu-satunya perbaikan adalah **membangun ulang**.',
      ),
      p(
        'Gejalanya juga menyesatkan. Aplikasi produksi berjalan mulus, tidak ada error di log servermu — hanya saja setiap permintaan dari browser menembak API staging. Data yang muncul terlihat wajar karena staging biasanya punya data serupa, sehingga masalahnya bisa berhari-hari tidak disadari sampai ada yang menyadari perubahannya tidak pernah tersimpan di produksi.',
      ),
      p(
        'Konsekuensi praktisnya disebut di peringatan berikut, dan ia mengubah cara pipeline dirancang: kamu **tidak bisa** membangun sekali lalu memakai artefak yang sama untuk staging dan produksi, selama ada variabel publik yang berbeda. Pilihannya dua — build terpisah per lingkungan, atau memindahkan nilai itu ke runtime dengan membacanya di Server Component lalu mengopernya sebagai props.',
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
      p(
        'Pola ini memindahkan konfigurasi dari **build time ke runtime**: Server Component membaca `process.env` saat permintaan datang, lalu mengopernya sebagai prop. Karena pembacaannya terjadi di server pada setiap permintaan, mengubah nilainya cukup dengan mengubah environment lalu restart — tanpa build ulang, dan artefak yang sama bisa dipakai untuk staging maupun produksi.',
      ),
      p(
        'Peringatan berikutnya menandai batas yang tetap berlaku, yaitu nilainya **tetap publik**. Props dari Server Component ke Client Component dikirim ke browser lewat payload RSC, sehingga terlihat meski tidak dirender di layar. Jadi pola ini menyelesaikan masalah *build-time versus runtime*, **bukan** masalah kerahasiaan. Pakai hanya untuk hal yang memang boleh diketahui pengguna, misalnya URL API, bendera fitur, dan nama lingkungan.',
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
      p(
        'Urutan ini adalah rantai gerbang, bukan daftar tugas. Perhatikan keterangan "gagal di sini, jangan lanjut" pada langkah 2 dan 3: yang membuat pipeline berharga bukan langkah-langkahnya, melainkan **kemampuannya berhenti**. Pipeline yang tetap men-deploy meskipun tesnya merah hanya menambah waktu tunggu tanpa menambah jaminan apa pun.',
      ),
      p(
        'Langkah 4 membawa keterangan yang paling mudah terlewat: build memakai env lingkungan **tujuan**. Itu konsekuensi langsung dari sub-bab sebelumnya — artefak terikat pada environment saat ia dibangun, jadi membangun dengan env staging lalu men-deploy hasilnya ke produksi akan membawa alamat staging ikut serta.',
      ),
      p(
        'Langkah 5 diletakkan **sebelum** kode baru menerima trafik, dan itu urutan yang menentukan. Kode baru yang berjalan di atas skema lama akan gagal mencari kolom yang belum ada. Perhatikan ini menuntut migrasinya bersifat **aditif** dengan menambah kolom alih-alih menghapus, sesuai pola expand–migrate–contract. Migrasi yang menghapus kolom harus menunggu rilis berikutnya, setelah tidak ada lagi kode yang memakainya.',
      ),
      p(
        'Langkah 7 yang paling sering terlupa, dan alasannya ada di peringatan berikut: pekerja antrean memuat kode **sekali** saat dijalankan. Tanpa `queue:restart`, pekerja lama tetap menjalankan kode lama — sehingga perbaikan yang sudah rilis tetap gagal dengan cara yang persis sama, dan tidak ada yang tampak salah di kodenya.',
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
      p(
        '`chmod 600` memberi izin baca-tulis **hanya kepada pemiliknya**, dan `chown app:app` memastikan pemiliknya adalah user yang menjalankan aplikasi. Keduanya perlu bersama: izin ketat pada berkas yang pemiliknya salah tetap tidak bisa dibaca aplikasimu, dan pemilik yang benar dengan izin longgar bisa dibaca setiap user lain di server itu — termasuk proses milik aplikasi lain yang menumpang di mesin yang sama.',
      ),
      p(
        'Perintah `curl` di bawahnya menguji hal yang **tidak bisa** dijawab izin berkas, yaitu apakah `.env` terjangkau lewat web. Berkas itu berada di akar project, satu tingkat di atas `public/`, jadi document root yang salah membuatnya bisa diunduh siapa pun, terlepas dari `chmod` apa pun yang kamu pasang. Ini kesalahan yang tidak bergejala, sebab aplikasinya berjalan normal, semua halaman terbuka, tidak ada satu pun error di log.',
      ),
      p(
        'Komentar terakhir menyebut tindakan yang tepat kalau hasilnya `200`, dan ia sengaja tegas: **rotasi seluruh rahasia**. Memperbaiki document root saja tidak cukup — pemindai otomatis menyisir internet mencari `/.env` terus-menerus, jadi berkas yang pernah terbuka harus dianggap sudah terbaca. Ini prinsip yang sama seperti rahasia yang pernah ter-commit ke git.',
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
      p(
        'Ketiganya punya sifat yang sama dan itulah nilainya: rahasianya **disuntikkan saat deploy** oleh platform, bukan disimpan sebagai berkas di dalam project. Tidak ada `.env` yang bisa salah izin, tidak ada berkas yang bisa ikut ter-commit, dan tidak ada yang bisa diunduh lewat web.',
      ),
      p(
        'Perhatikan dua perintah pertama menyimpan nilainya di sisi penyedia, sehingga sekali disimpan ia tidak bisa dibaca kembali lewat CLI dan hanya bisa diganti. Itu perilaku yang benar, tetapi berarti kamu tetap butuh tempat lain untuk menyimpan salinannya bagi tim. Perhatikan pula baris Docker Compose menunjuk `/etc/app/.env` yang berada **di luar direktori project**, sehingga ia tidak mungkin ikut ter-commit maupun terjangkau document root.',
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
      p(
        'Skema ini berjalan **saat boot**, bukan saat variabelnya pertama dipakai — dan perbedaan waktu itu yang menentukan biayanya. Perhatikan `.min(32)` pada `JWT_SECRET`: ia menegakkan aturan yang biasanya hanya hidup sebagai niat baik, karena rahasia sepanjang delapan karakter bisa ditebak dan tidak ada yang akan menyadarinya sampai token dipalsukan.',
      ),
      p(
        'Perulangan `hasil.error.issues` mencetak **setiap** masalah beserta nama variabelnya, bukan berhenti di yang pertama. Orang yang menyiapkan lingkungan baru langsung melihat daftar lengkap apa yang kurang, bukan memperbaiki satu lalu menjalankan lagi untuk menemukan yang berikutnya.',
      ),
      p(
        '`process.exit(1)` yang menutupnya, dan kode keluar bukan-nol itulah yang membuat sistem deploy tahu prosesnya gagal. Peringatan berikutnya menjelaskan kenapa itu justru hasil yang baik: aplikasi yang **menolak menyala** membuat deploy dibatalkan dan versi lama tetap melayani pengguna. Aplikasi yang menyala dengan `JWT_SECRET` bernilai `undefined` akan menandatangani token yang tidak sah — dan baru ketahuan saat pengguna pertama mencoba masuk, dengan penyebab yang letaknya jauh di belakang.',
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
      p(
        'Pemindai di CI adalah **jaring kedua**, bukan yang pertama. Pertahanan yang sesungguhnya adalah pre-commit hook yang menahan rahasianya sebelum masuk riwayat git sama sekali — tetapi hook lokal bisa dilewati dengan `--no-verify`, dan mesin yang belum menjalankan `npm install` tidak punya hook-nya. Pemindaian di server tidak bisa dilewati siapa pun.',
      ),
      p(
        'Komentar "gagalkan build" menentukan apakah ini berguna. Pemindai yang hanya memberi peringatan akan diabaikan pada temuan kelima, dan setelah itu ia tidak menjaga apa pun. Perhatikan pula konsekuensi yang disebut peringatan berikut: kalau pemindainya menemukan sesuatu, memperbaiki commit **tidak cukup** — rahasia yang pernah ter-push ada di setiap clone, setiap fork, dan kemungkinan besar sudah terindeks pemindai otomatis. Satu-satunya perbaikan yang benar adalah rotasi.',
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
      p(
        'Perhatikan titik di akhir setiap nama — `contoh.com.` bukan `contoh.com`. Titik itu menandai **nama absolut** (FQDN); tanpanya, sebagian penyedia DNS menambahkan nama zona di belakangnya, sehingga `contoh.com` menjadi `contoh.com.contoh.com`. Kesalahan kecil yang menghasilkan alamat yang tidak pernah menjawab.',
      ),
      p(
        'Baris kedua memakai `CNAME` untuk `www`, sedangkan `contoh.com` sendiri memakai `A`. Itu bukan selera: **`CNAME` tidak boleh dipasang di root domain** — spesifikasinya melarangnya karena root harus bisa punya record lain seperti `MX`, dan `CNAME` bersifat eksklusif. Sebagian penyedia menawarkan "ALIAS" atau "ANAME" sebagai jalan keluar.',
      ),
      p(
        'Baris `CAA` adalah yang paling jarang dipasang padahal paling murah. Tanpanya, **CA mana pun di dunia** bisa menerbitkan sertifikat yang sah untuk domainmu — dan itu berarti siapa pun yang berhasil membujuk satu CA mana pun bisa menyamar sebagai situsmu dengan sertifikat yang dipercaya browser. Satu baris membatasinya ke penerbit yang kamu izinkan.',
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
      p(
        'Opsi `+short` mencetak jawabannya saja — cocok untuk memeriksa cepat "sekarang menunjuk ke mana". Tanpa `+short`, keluarannya memuat **TTL** dalam detik, dan angka itulah yang menentukan berapa lama perubahanmu baru terasa oleh semua orang.',
      ),
      p(
        'Peringatan berikutnya menyebut urutan yang menentukan, dan ia berlawanan dengan naluri: **turunkan TTL beberapa hari sebelum perpindahan, bukan saat memindahkan**. Alasannya, resolver di seluruh dunia sudah menyimpan jawaban lama beserta TTL lamanya — menurunkan TTL sekarang tidak membatalkan salinan yang sudah tersimpan. Dengan TTL 86400, sebagian pengguna tetap diarahkan ke server lama sepanjang hari itu, dan data yang mereka tulis mendarat di tempat yang salah.',
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
      p(
        'Perintah pertama menerbitkan sertifikat **sekaligus** menyunting konfigurasi Nginx untuk memakainya — itulah arti flag `--nginx`. Perhatikan kedua nama disebut dalam satu perintah: sertifikat harus mencakup `www` dan non-`www`, karena keduanya nama yang berbeda bagi browser, dan yang tidak tercakup akan menampilkan peringatan keamanan.',
      ),
      p(
        'Baris kedua yang paling sering dilewatkan. Certbot memasang timer pembaruan otomatis, tetapi **tidak ada yang membuktikan timer itu bekerja** sampai sertifikatnya benar-benar hampir kedaluwarsa — dan saat itu terlambat. `renew --dry-run` menjalankan seluruh alur pembaruan tanpa benar-benar menggantinya, sehingga kegagalan konfigurasi ketahuan sekarang. Jalankan ulang setiap kali kamu mengubah konfigurasi web server.',
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
      p(
        'Empat baris ini melakukan seluruh yang dilakukan Certbot **plus** konfigurasi Nginx sekaligus. Caddy menerbitkan sertifikat, memasangnya, mengalihkan HTTP ke HTTPS, dan memperbaruinya otomatis — tanpa satu pun baris tambahan. Itu bukan hanya lebih ringkas: ia menghapus kelas kesalahan konfigurasi TLS yang harus ditulis manual di Nginx.',
      ),
      p(
        'Perhatikan tidak ada penyebutan sertifikat, port 443, maupun `redirect` di mana pun. Caddy menyimpulkannya dari kenyataan bahwa blok ini dinamai sebuah **domain**. Harganya: kendali yang lebih sedikit atas detail TLS, dan satu perkakas lagi yang perlu dipahami tim. Untuk project yang tidak butuh penyetelan khusus, pertukaran itu hampir selalu menguntungkan.',
      ),
      p(
        'Peringatan berikutnya tetap berlaku untuk kedua pendekatan. Sertifikat kedaluwarsa bukan peringatan kecil — **browser menolak memuat situsnya sama sekali**, dan gangguannya total. Pembaruan otomatis memang biasanya bekerja; yang tidak boleh diandalkan adalah asumsi bahwa ia masih bekerja. Pasang pemantauan yang memberi tahu tiga puluh hari sebelum kedaluwarsa, sehingga kegagalannya ketahuan saat masih ada waktu memperbaikinya.',
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
      p(
        'Dua blok `server` di sini punya tugas yang berbeda. Yang pertama hanya mendengar port 80 dan **selalu** mengalihkan ke HTTPS lewat `301` — permanen, sehingga browser mengingatnya. Perhatikan ia tidak menyajikan apa pun; satu-satunya pekerjaannya adalah memastikan tidak ada permintaan yang dilayani tanpa enkripsi.',
      ),
      p(
        '`ssl_protocols TLSv1.2 TLSv1.3` menyebut versi yang diizinkan secara **eksplisit**, dan komentarnya menjelaskan kenapa: TLS 1.0 dan 1.1 sudah tidak aman dan ditolak browser modern. Menyebutkannya sendiri mencegah versi lama ikut aktif kalau bawaan Nginx-mu masih longgar. Dan `ssl_prefer_server_ciphers off` menyerahkan pilihan cipher ke klien — yang justru **lebih baik** pada TLS 1.3, karena klien modern biasanya tahu cipher mana yang paling aman dan cepat di perangkatnya.',
      ),
      p(
        'Kata `always` pada `add_header` adalah detail Nginx yang mudah terlewat, sebab tanpanya header hanya dikirim pada respons sukses sehingga halaman error `404` atau `500` tidak membawa HSTS sama sekali. Dan peringatan berikutnya perlu dibaca serius sebelum menyalin `max-age=31536000`, sebab setelah browser menerima HSTS, ia **menolak** koneksi HTTP ke domainmu selama masa berlakunya, dan mematikan headernya **tidak** membatalkan yang sudah tersimpan. Mulai dari `max-age=300`, naikkan bertahap setelah yakin semuanya bekerja.',
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
      p(
        'Empat baris `proxy_set_header` bertanda WAJIB adalah bagian yang paling sering terlewat, dan komentarnya menjelaskan akibatnya: tanpa keduanya, aplikasi melihat **semua** permintaan datang dari `127.0.0.1`. Rate limit per IP jadi menghitung seluruh dunia sebagai satu pemanggil, dan log servermu tidak lagi bisa menjawab siapa yang melakukan apa.',
      ),
      p(
        '`X-Forwarded-Proto $scheme` menutup masalah yang berbeda: proxy menerima HTTPS lalu meneruskannya ke aplikasi lewat HTTP biasa. Tanpa header itu, aplikasi mengira koneksinya tidak aman — sehingga cookie bertanda `Secure` tidak dikirim, dan tautan yang dibangkitkan Laravel atau Next.js memakai skema `http://`.',
      ),
      p(
        'Blok `location /_next/static/` menyajikan aset langsung dari Nginx, tanpa menyentuh proses aplikasi sama sekali. `expires 1y` bersama `immutable` aman di sini justru karena Next.js menyisipkan hash isi ke dalam nama berkasnya — berkas dengan nama itu tidak akan pernah berubah isinya, jadi browser boleh menyimpannya selamanya tanpa pernah bertanya lagi.',
      ),
      p(
        "Peringatan berikutnya menutup sisi aplikasinya, dan ia harus dibaca berpasangan dengan header di atas. Karena `X-Forwarded-For` bisa **dipalsukan siapa pun**, aplikasi tidak boleh mempercayai seluruh rantainya. `app.set('trust proxy', 1)` berarti hanya satu proxy terdekat yang dipercaya; dengan `true`, penyerang cukup mengirim IP acak di setiap permintaan untuk melewati rate limit sepenuhnya.",
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
      p(
        'Dua zona dengan laju berbeda menerapkan pola berjenjang yang sama seperti di sub-bab 2.6: `/api/` mendapat 10 permintaan per detik, sedangkan `/api/auth/` jauh lebih ketat di 1 per detik. Endpoint login adalah target penebakan password, dan batas yang wajar untuk penjelajahan biasa terlalu longgar di sana.',
      ),
      p(
        '`burst=20 nodelay` adalah bagian yang membuat rate limit ini tidak menyiksa pengguna biasa. Tanpa `burst`, permintaan ke-11 dalam satu detik langsung ditolak — padahal memuat satu halaman sering memicu beberapa permintaan sekaligus. `burst` mengizinkan lonjakan pendek, dan `nodelay` melayaninya **seketika** alih-alih mengantrekannya; tanpa `nodelay`, permintaan dalam burst tetap dilayani tetapi diperlambat, yang terasa seperti aplikasi yang tersendat.',
      ),
      p(
        'Peringatan berikutnya menyebut batas yang tidak bisa ditutup lapisan ini: proxy membatasi **per IP**. Botnet dengan ribuan IP yang masing-masing hanya mencoba beberapa kali lolos sepenuhnya dari batas ini — yang menangkapnya adalah batas **per akun** di aplikasi. Keduanya lapisan yang berbeda dan sama-sama diperlukan.',
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
      p(
        '`least_conn` mengirim permintaan ke instance dengan koneksi aktif **paling sedikit**, bukan bergiliran merata. Bedanya terasa saat durasi permintaan tidak seragam: dengan pembagian giliran biasa, instance yang kebetulan mendapat beberapa permintaan lambat akan terus menerima jatah baru meski sudah kewalahan.',
      ),
      p(
        '`max_fails=3 fail_timeout=30s` adalah health check sederhana: setelah tiga kegagalan berturut-turut, instance itu dikeluarkan dari rotasi selama tiga puluh detik lalu dicoba lagi. Perhatikan baris ketiga ditandai `backup` — ia **tidak menerima trafik** sama sekali selama dua instance utama masih sehat, dan baru dipakai kalau keduanya jatuh.',
      ),
      p(
        'Peringatan berikutnya adalah syarat yang harus dipenuhi **sebelum** menambah instance kedua, bukan sesudahnya. Sesi di memori proses membuat pengguna tampak "logout sendiri" secara acak — tergantung instance mana yang menerima permintaannya. Rate limit di memori membuat batasnya efektif dikalikan jumlah instance. Keduanya harus pindah ke penyimpanan bersama (Redis atau database) lebih dulu; menambah instance di atas aplikasi yang belum stateless menghasilkan bug yang tampak acak dan sangat sulit direproduksi.',
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
