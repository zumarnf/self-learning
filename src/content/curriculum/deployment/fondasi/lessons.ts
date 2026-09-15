import { callout, code, h2, p, references, steps, table, terms, ul } from '@/lib/content/builders';
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
    14,
    'Tiga lingkungan dengan aturan yang berbeda tajam.',
    [
      p(
        'Kode yang sama berjalan di tiga tempat dengan konsekuensi yang sangat berbeda. Memperlakukan ketiganya sama adalah penyebab sebagian besar kejutan saat rilis.',
      ),

      terms(
        {
          term: 'environment (lingkungan)',
          meaning:
            'Satu tempat lengkap tempat aplikasimu berjalan, mencakup mesinnya, variabel konfigurasinya, basis datanya, dan siapa yang boleh mengaksesnya. Kata ini sering disingkat `env` di nama berkas dan variabel. Yang membuatnya penting, kode yang sama persis bisa berperilaku berbeda di dua lingkungan hanya karena konfigurasinya berbeda, dan itulah sumber sebagian besar kejutan saat rilis.',
        },
        {
          term: 'development (dev)',
          meaning:
            'Lingkungan di komputermu sendiri saat menulis kode. Datanya palsu, error boleh tampil lengkap di layar, dan proses dimulai ulang setiap kali berkas berubah. Dibaca "difelopmen". Ciri khasnya kecepatan umpan balik lebih penting daripada kemiripan dengan produksi.',
        },
        {
          term: 'staging',
          meaning:
            'Lingkungan latihan yang dibuat semirip mungkin dengan produksi, dipakai untuk meninjau perubahan sebelum pengguna sungguhan melihatnya. Dibaca "stejing", dari kata *stage* yang berarti panggung. Nilainya bergantung pada kemiripannya. Staging yang konfigurasinya sudah lama menyimpang dari produksi memberi rasa aman yang salah, dan itu lebih buruk daripada tidak punya staging.',
        },
        {
          term: 'production (prod)',
          meaning:
            'Lingkungan yang dipakai pengguna sungguhan, dengan data sungguhan. Dibaca "produksyen". Di sini pesan error harus generik, kesalahan menimbulkan biaya nyata, dan setiap perubahan butuh cara membatalkannya.',
        },
        {
          term: 'dev/prod parity',
          meaning:
            'Prinsip menjaga jarak antara lingkungan pengembangan dan produksi tetap sempit, dalam tiga hal: jarak waktu (perubahan cepat sampai ke produksi), jarak orang (yang menulis kode ikut merilisnya), dan jarak alat (basis data yang sama, bukan SQLite di lokal dan PostgreSQL di produksi). Istilah ini berasal dari metodologi Twelve-Factor App. *Parity* berarti kesetaraan.',
        },
        {
          term: 'preview deployment',
          meaning:
            'Versi aplikasi yang di-deploy otomatis per pull request, dengan alamat sendiri yang berumur pendek. Fungsinya menggantikan staging permanen untuk banyak project kecil, sebab tiap perubahan mendapat lingkungan tinjauannya sendiri tanpa ada yang perlu dirawat terus-menerus.',
        },
        {
          term: 'data tersamarkan (masked data)',
          meaning:
            'Salinan data produksi yang bagian sensitifnya diganti nilai palsu sebelum dipakai di lingkungan lain, misalnya nama dan email diganti, sementara bentuk dan volumenya dipertahankan. Dipakai supaya staging punya data yang realistis tanpa memindahkan data pribadi ke tempat yang pengamanannya lebih longgar.',
        },
        {
          term: 'seed data',
          meaning:
            'Data awal yang diisikan otomatis ke basis data kosong supaya aplikasi bisa langsung dipakai, misalnya satu akun admin dan beberapa contoh entri. Dibaca "siid", artinya benih. Berbeda dari migrasi, yang mengubah bentuk tabel dan bukan isinya.',
        },
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
      h2('Studi kasus di project nyata'),
      p(
        'Perbedaan antara ketiga lingkungan itu bukan soal nama melainkan soal **apa yang bisa hilang**. Cara paling cepat membuatnya konkret adalah menuliskan apa yang berbeda pada satu fitur yang sama.',
      ),
      table(
        ['Yang berbeda', 'Development', 'Staging', 'Production'],
        [
          [
            'Data',
            'Buatan, boleh dihapus kapan saja',
            'Salinan yang sudah disamarkan',
            'Nyata, tidak bisa dibuat ulang',
          ],
          [
            'Surel keluar',
            'Ditangkap Mailpit atau ditulis ke log',
            'Hanya ke alamat internal',
            'Ke pengguna sungguhan',
          ],
          ['Pembayaran', 'Kunci uji, kartu 4242...', 'Kunci uji', 'Kunci hidup, uang sungguhan'],
          [
            'Pesan error',
            'Lengkap dengan stack trace',
            'Lengkap, hanya untuk tim',
            'Generik plus penanda jejak',
          ],
          [
            'Sumber daya',
            'Satu proses di laptop',
            'Kecil, mirip bentuknya',
            'Beberapa instance, ada penyeimbang',
          ],
          ['Siapa yang terdampak saat rusak', 'Kamu sendiri', 'Tim', 'Seluruh pengguna'],
        ],
      ),
      p(
        'Yang membuat masalah bukan perbedaannya melainkan hal-hal yang **tidak** berbeda padahal seharusnya berbeda, dan sebaliknya.',
      ),
      code(
        'text',
        `
        Yang HARUS berbeda, dan sering tidak:
          kredensial basis data
          kunci penyedia pembayaran
          alamat SMTP
          kunci rahasia sesi
          daftar origin CORS

        Yang HARUS SAMA, dan sering tidak:
          versi bahasa dan runtime
          versi basis data
          HAK pengguna basis data
          zona waktu proses
          berkas migrasi yang sudah diterapkan
        `,
        {
          caption:
            'Baris "hak pengguna basis data" paling sering berbeda, dan akibatnya baru terlihat di produksi.',
        },
      ),
      p(
        'Alasannya bisa dilihat langsung. Bila pengembangan lokal memakai kredensial yang boleh melakukan apa saja sementara produksi memakai kredensial terbatas, error izin baru muncul pada rilis.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan node:sqlite pada Node 26.5.0, koneksi
        yang dibuka hanya-baca:

          SELECT -> berhasil
          UPDATE -> DITOLAK: attempt to write a readonly database
          DROP   -> DITOLAK: attempt to write a readonly database

        Error itu jauh lebih murah ditemukan di laptop hari ini
        daripada di produksi bulan depan.
        `,
      ),
      p(
        'Perbedaan lingkungan juga terasa pada perangkat lunak yang menjalankannya, dan itu terukur.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada mesin ini:

          Node di mesin        : v26.5.0
          Node di dalam image  : v22.23.2
          Sistem di mesin      : Linux Mint 22.3
          Sistem di dalam image: Alpine Linux v3.24

        "Jalan di laptop saya" sering berarti "jalan pada versi Node
        yang berbeda, di atas pustaka sistem yang berbeda".
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kelas bug yang khas kategori ini muncul hanya di satu lingkungan, dan gejalanya jarang menyebut lingkungannya.',
      ),
      code(
        'text',
        `
        1. Jalan di lokal, gagal di produksi

           Error: Cannot find module './Header'
           -> macOS dan Windows tidak membedakan huruf besar kecil,
              Linux membedakan. Berkasnya bernama header.tsx.

           error: relation "Pengguna" does not exist
           -> nama tabel berkapital ditulis tanpa tanda kutip.

        2. Zona waktu berbeda

           laporan harian di lokal  : 2026-09-14
           laporan harian di server : 2026-09-13
           -> server memakai UTC, laptop memakai WIB. Simpan dan hitung
              dalam UTC, ubah ke zona lokal hanya saat menampilkan.

        3. Batas memori berbeda

           JavaScript heap out of memory
           -> laptop punya 16 GB, container dibatasi 512 MB.
        `,
      ),
      p(
        'Kelas kedua jauh lebih mahal, yaitu ketika lingkungan pengembangan menyentuh sumber daya produksi.',
      ),
      code(
        'text',
        `
        Yang tidak bisa dibatalkan:

          seeder dijalankan terhadap DATABASE_URL produksi
            -> tabel dikosongkan, data pelanggan hilang

          migrasi uji dijalankan ke basis data produksi
            -> kolom dihapus, tidak ada cadangan menit itu

          pengujian notifikasi dengan SMTP produksi
            -> ribuan surel terkirim ke alamat sungguhan.
               Surel yang sudah terkirim tidak bisa ditarik kembali

        Ketiganya berawal dari satu hal yang sama: satu berkas .env
        yang berisi kredensial produksi ada di mesin pengembangan.
        `,
      ),
      p(
        'Karena itu pemisahan yang paling berpengaruh bukan pemisahan server melainkan pemisahan **kredensial**. Kredensial produksi tidak pernah ada di mesin siapa pun, dan diambil hanya oleh proses yang berjalan di lingkungan produksi itu sendiri.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di sini hampir semuanya berupa menyamakan hal yang seharusnya berbeda, atau membedakan hal yang seharusnya sama.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai kredensial yang sama di lokal dan produksi',
            'Biar tidak repot berganti-ganti',
            'Satu seeder yang salah jalan mengosongkan data pelanggan. Tidak ada yang bisa dibatalkan',
          ],
          [
            'Memakai hak basis data penuh saat pengembangan',
            'Biar migrasi dan seeder lancar',
            'Diuji, koneksi terbatas menolak `UPDATE` dan `DROP`. Error itu harus muncul di laptop, bukan di produksi',
          ],
          [
            'Memakai versi runtime yang berbeda dari produksi',
            'Yang penting kodenya sama',
            'Diukur, mesin memakai Node v26.5.0 sementara image memakai v22.23.2 di atas Alpine, bukan Mint',
          ],
          [
            'Menganggap nama berkas tidak peka huruf besar kecil',
            'Di laptop kan jalan',
            "Linux membedakannya. `Cannot find module './Header'` hanya muncul setelah di-deploy",
          ],
          [
            'Menyimpan waktu dalam zona lokal',
            'Biar gampang dibaca',
            'Server memakai UTC. Laporan harian bergeser satu hari. Simpan UTC, ubah saat menampilkan',
          ],
          [
            'Membuat staging sebelum benar-benar dibutuhkan',
            'Katanya praktik yang baik',
            'Untuk project satu orang, biayanya nyata dan manfaatnya kecil. Preview deployment per pull request sering cukup',
          ],
        ],
      ),
      p(
        'Baris terakhir sengaja berlawanan arah dengan sisanya. Menambah lingkungan berarti menambah tempat yang harus dikonfigurasi, dipantau, dan dijaga tetap mirip produksi, dan lingkungan yang tidak terawat memberi rasa aman yang salah. Staging berbayar ketika ada yang benar-benar memakainya untuk meninjau, menguji integrasi berbayar, atau mencoba migrasi pada volume data yang realistis.',
      ),
      references(
        {
          label: 'Config — Store config in the environment',
          href: 'https://12factor.net/config',
          source: 'Twelve-Factor App',
          note: 'Dokumen primer yang merumuskan kenapa konfigurasi dipisahkan dari kode, bukan komentar tentangnya',
        },
        {
          label: 'Dev/prod parity',
          href: 'https://12factor.net/dev-prod-parity',
          source: 'Twelve-Factor App',
          note: 'Tiga jenis jarak antara lingkungan, dan kenapa ketiganya perlu dipersempit',
        },
        {
          label: 'Managing environments for deployment',
          href: 'https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments',
          source: 'GitHub Docs',
          note: 'Cara satu lingkungan didefinisikan beserta aturan siapa yang boleh merilis ke sana',
        },
        {
          label: 'Preview Deployments',
          href: 'https://vercel.com/docs/deployments/preview-deployments',
          source: 'Vercel Docs',
          note: 'Bentuk konkret lingkungan tinjauan berumur pendek per pull request',
        },
      ),
    ],
  ),

  written(
    'build-vs-runtime',
    'Build vs Runtime',
    16,
    'Perbedaan yang menentukan apa yang bisa diubah tanpa build ulang.',
    [
      p(
        'Sebagian hal ditentukan **saat build** dan tertanam permanen; sebagian lagi dibaca **saat runtime** dan bisa diubah tanpa menyentuh kodenya. Salah memahami batas ini adalah penyebab kelas bug "jalan di lokal, gagal di produksi" yang paling sering.',
      ),

      terms(
        {
          term: 'build time (waktu build)',
          meaning:
            'Saat kode sumber diubah menjadi artefak siap jalan, sebelum aplikasi melayani satu permintaan pun. Yang terjadi di sini antara lain kompilasi TypeScript, penggabungan berkas, dan pembuatan halaman statis. Nilai yang dibaca pada tahap ini ikut tertanam ke dalam hasilnya dan tidak bisa diubah lagi tanpa membangun ulang.',
        },
        {
          term: 'runtime (waktu jalan)',
          meaning:
            'Saat aplikasi sudah berjalan dan melayani permintaan. Nilai yang dibaca di sini bisa berbeda tiap lingkungan tanpa membangun ulang, sebab ia diambil dari proses yang sedang hidup. Dibaca "rantaim".',
        },
        {
          term: 'artifact (artefak)',
          meaning:
            'Hasil dari proses build yang siap dipindahkan dan dijalankan, misalnya folder `.next/`, berkas `.jar`, atau image container. Yang penting dari artefak, ia dibangun sekali lalu dipromosikan ke beberapa lingkungan. Membangun ulang per lingkungan berarti yang diuji di staging bukan benda yang sama dengan yang dirilis ke produksi.',
        },
        {
          term: 'build-release-run',
          meaning:
            'Pemisahan tiga tahap yang dirumuskan Twelve-Factor App: *build* mengubah kode menjadi artefak, *release* menggabungkan artefak dengan konfigurasi satu lingkungan, dan *run* menjalankannya. Aturannya satu arah, yaitu tahap run tidak boleh mengubah artefaknya. Itulah yang membuat rollback berarti menjalankan rilis lama, bukan membangun ulang kode lama.',
        },
        {
          term: 'bundler',
          meaning:
            'Program yang menggabungkan banyak berkas sumber beserta dependensinya menjadi sedikit berkas yang efisien dikirim ke peramban. Contohnya Turbopack, Vite, dan webpack. Dibaca "bandler".',
        },
        {
          term: 'tree shaking',
          meaning:
            'Pembuangan kode yang tidak pernah dipakai saat proses build, sehingga tidak ikut terkirim ke pengguna. Istilahnya berasal dari gambaran mengguncang pohon supaya daun mati berjatuhan. Hanya bekerja bila impornya statis, jadi impor dinamis yang namanya dihitung saat runtime tidak bisa dipangkas.',
        },
        {
          term: 'prerender',
          meaning:
            'Membuat HTML sebuah halaman pada saat build, bukan saat pengguna memintanya. Hasilnya halaman yang tampil cepat tanpa menunggu server, dengan konsekuensi isinya ikut membeku sampai build berikutnya.',
        },
        {
          term: 'NODE_ENV',
          meaning:
            'Variabel lingkungan konvensional di ekosistem Node.js yang bernilai `development`, `production`, atau `test`. Banyak pustaka mengubah perilakunya berdasarkan nilai ini, misalnya React membuang pemeriksaan pengembangan saat bernilai `production`. Jebakannya, menyetel nilai ini lebih awal dari yang kamu kira bisa membuat pemasangan dependensi melewatkan `devDependencies` yang masih dibutuhkan proses build.',
        },
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
      h2('Studi kasus di project nyata'),
      p(
        'Batas antara build dan runtime menentukan satu hal yang sangat praktis, yaitu apa yang bisa diubah tanpa membangun ulang. Di Next.js, batas itu bisa dilihat langsung pada keluaran build project ini.',
      ),
      code(
        'text',
        `
        Diperiksa sungguhan pada keluaran build project ini:

          berkas JavaScript klien : 30 berkas, 1.823,4 KB
          chunk terbesar          : 653,4 KB
          halaman HTML dihasilkan : 506 berkas, 108,1 MB
          halaman terbesar        : 487,8 KB

        Dan pertanyaan yang menentukan:
          string materi di .next/static (KLIEN)  : 0 berkas
          string materi di .next/server (SERVER) : 1.250 berkas
        `,
        {
          caption:
            'Isi kurikulum yang ratusan megabyte itu tidak pernah diunduh peramban. Ia dirender di server saat build.',
        },
      ),
      p(
        'Dua baris terakhir itu adalah seluruh inti Server Component. Data yang dipakai merender halaman berada di sisi build dan sisi server, sementara yang dikirim ke peramban hanya hasil rendernya beserta JavaScript yang memang perlu berjalan di sana.',
      ),
      p(
        'Variabel environment mengikuti batas yang sama, dan ini yang paling sering menjadi sumber kebingungan.',
      ),
      code(
        'ts',
        `
        // DITANAM SAAT BUILD. Mengubah nilainya menuntut build ulang,
        // dan nilainya ikut terkirim ke peramban.
        const publik = process.env.NEXT_PUBLIC_SITE_URL;

        // DIBACA SAAT RUNTIME, di proses server. Mengubahnya cukup
        // restart, tanpa build ulang, dan nilainya tidak pernah
        // sampai ke peramban.
        export async function GET() {
          const kunci = process.env.STRIPE_SECRET_KEY;
          // ...
        }

        // Jebakan yang khas: nilai yang dibaca di TINGKAT MODUL sebuah
        // Server Component ikut dievaluasi saat build untuk halaman
        // statis, sehingga nilainya membeku pada saat build.
        const dibacaSaatModulDimuat = process.env.FITUR_BARU;   // hati-hati
        `,
      ),
      p(
        'Akibat praktisnya jelas. Nilai yang perlu bisa diubah tanpa rilis, misalnya saklar fitur atau ambang pembatasan laju, harus dibaca **di dalam** fungsi yang berjalan per permintaan, bukan di tingkat modul.',
      ),
      code(
        'text',
        `
        Pertanyaan yang memisahkan keduanya:

          "Kalau nilai ini berubah, apakah saya harus build ulang?"

            YA  -> ia ditentukan saat build
            TIDAK -> ia dibaca saat runtime

        Dan pertanyaan keduanya:

          "Apakah nilai ini boleh dibaca pengunjung mana pun?"

            YA  -> boleh ber-awalan NEXT_PUBLIC_
            TIDAK -> tidak boleh, tanpa pengecualian
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan memahami batas ini menghasilkan gejala yang sangat khas, yaitu nilai yang "tidak mau berubah".',
      ),
      code(
        'text',
        `
        1. Sudah diubah di dasbor hosting, halamannya tetap lama

           Nilai NEXT_PUBLIC_ ditanam ke bundel saat build. Mengubahnya
           di dasbor tidak mengubah berkas yang sudah dibangun.
           Yang diperlukan: build ulang, bukan restart.

        2. undefined di klien, terisi di server

           console.log(process.env.API_KEY)    // di komponen klien
           -> undefined

           Variabel tanpa awalan NEXT_PUBLIC_ memang TIDAK dikirim ke
           peramban. Ini perilaku yang benar, bukan bug.

        3. Build gagal karena variabel belum ada

           Error: Environment variable DATABASE_URL is not defined
           saat "Collecting page data"

           Halaman statis dirender SAAT BUILD, jadi variabel yang
           dipakai halaman itu harus tersedia di lingkungan BUILD,
           bukan hanya di lingkungan runtime.
        `,
      ),
      p(
        'Kasus ketiga sering memicu perbaikan yang salah arah, yaitu memberi kredensial produksi ke lingkungan build. Yang benar biasanya membuat halaman itu tidak lagi dirender saat build.',
      ),
      code(
        'ts',
        `
        // Halaman yang memang perlu data per permintaan tidak boleh
        // dirender saat build.
        export const dynamic = 'force-dynamic';

        // Atau lebih baik: pisahkan bagian yang butuh data runtime ke
        // dalam batas Suspense, sehingga kerangka halamannya tetap
        // statis dan bagian dinamisnya dialirkan saat permintaan tiba.
        export default function Halaman() {
          return (
            <main>
              <Kerangka />
              <Suspense fallback={<Kerangka.Memuat />}>
                <BagianDinamis />
              </Suspense>
            </main>
          );
        }
        `,
      ),
      p(
        'Ada satu gejala lagi yang membingungkan karena berubah-ubah, yaitu nilai yang benar untuk sebagian pengunjung dan basi untuk sebagian lain. Itu bukan masalah build melainkan masalah cache, dan bedanya terletak pada apakah nilainya sama untuk semua orang atau berbeda per pengunjung.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sebagian besar kebingungan di sini berasal dari menganggap "environment variable" sebagai satu hal, padahal ada dua yang perilakunya sangat berbeda.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengubah `NEXT_PUBLIC_` lalu restart saja',
            'Variabelnya kan sudah diganti',
            'Nilainya ditanam ke bundel saat build. Yang diperlukan build ulang, bukan restart',
          ],
          [
            'Memberi awalan `NEXT_PUBLIC_` supaya nilainya terbaca di komponen',
            'Biar tidak `undefined` lagi',
            'Awalan itu mengirimkannya ke peramban. Pindahkan pekerjaannya ke server, bukan nilainya ke klien',
          ],
          [
            'Memberi kredensial produksi ke lingkungan build',
            'Build-nya butuh, jadi harus ada',
            'Halaman itu seharusnya tidak dirender saat build. Perbaiki rendernya, jangan perluas paparan rahasianya',
          ],
          [
            'Membaca saklar fitur di tingkat modul',
            'Sekali baca, hemat',
            'Nilainya membeku pada saat build untuk halaman statis. Baca di dalam fungsi yang berjalan per permintaan',
          ],
          [
            'Menganggap semua halaman dirender saat permintaan tiba',
            'Kan aplikasinya dinamis',
            'Diukur, 506 halaman project ini dirender SAAT BUILD. Perubahan data tidak terlihat sampai dibangun ulang',
          ],
          [
            'Menganggap isi basis data ikut ke bundel klien',
            'Datanya kan dipakai merender',
            'Diperiksa, 0 berkas di `.next/static` memuat isi materi sementara 1.250 berkas di `.next/server` memuatnya',
          ],
        ],
      ),
      p(
        'Cara memeriksanya tidak memerlukan alat khusus dan pantas dijadikan kebiasaan. Setelah build, jalankan `grep -r "kata-yang-dicari" .next/static` untuk kata yang seharusnya tidak pernah sampai ke peramban. Bila kata itu muncul, ia ada di bundel klien, dan tidak ada konfigurasi apa pun yang akan menyembunyikannya dari pengunjung.',
      ),
      references(
        {
          label: 'Build, release, run',
          href: 'https://12factor.net/build-release-run',
          source: 'Twelve-Factor App',
          note: 'Kenapa ketiganya dipisah tegas dan kenapa tahap run tidak boleh mengubah artefaknya',
        },
        {
          label: 'Deploying',
          href: 'https://nextjs.org/docs/app/getting-started/deploying',
          source: 'Next.js Docs',
          note: 'Apa yang dihasilkan proses build dan bentuk artefak yang dipindahkan',
        },
        {
          label: 'Node.js, the difference between development and production',
          href: 'https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production',
          source: 'Node.js Docs',
          note: 'Peran `NODE_ENV` dan salah paham yang paling sering menyertainya',
        },
        {
          label: 'next CLI',
          href: 'https://nextjs.org/docs/app/api-reference/cli/next',
          source: 'Next.js Docs',
          note: 'Perintah yang memisahkan tahap membangun dari tahap menjalankan',
        },
      ),
    ],
  ),

  written(
    'env-secret',
    'Environment Variable & Secret Management',
    18,
    'Tempat kebocoran paling umum, di lapisan yang paling sering diabaikan.',
    [
      p(
        'Sub-bab 5.11 Backend Intermediate membahas aturannya. Yang ini tentang **cara mewujudkannya saat deploy** — di mana nilainya benar-benar disimpan dan bagaimana ia sampai ke aplikasi.',
      ),

      terms(
        {
          term: 'environment variable',
          meaning:
            'Nilai bernama yang diberikan sistem operasi kepada sebuah proses saat ia dijalankan, dibaca lewat `process.env` di Node.js atau `getenv()` di PHP. Dipakai untuk konfigurasi karena bisa berbeda tiap lingkungan tanpa mengubah kode. Sering disingkat *env var*.',
        },
        {
          term: 'secret (rahasia)',
          meaning:
            'Nilai yang memberi akses kepada pemegangnya, misalnya kata sandi basis data, kunci API, atau kunci penanda tangan token. Yang membedakannya dari konfigurasi biasa, membocorkannya sama dengan memberikan akses itu sendiri, sehingga ia tidak boleh masuk kode sumber, riwayat git, log, atau bundel peramban.',
        },
        {
          term: '.env',
          meaning:
            'Berkas teks berisi pasangan `NAMA=nilai` yang dimuat ke variabel lingkungan saat pengembangan lokal. Berkas ini wajib masuk `.gitignore`. Nilai yang pernah ikut ter-commit terhitung bocor meski commit-nya kemudian dihapus, sebab ia tetap terbaca di riwayat, sehingga yang benar adalah menggantinya, bukan menghapus riwayatnya.',
        },
        {
          term: '.env.example',
          meaning:
            'Salinan `.env` yang hanya memuat nama variabelnya dengan nilai kosong atau contoh. Berkas inilah yang ikut masuk version control, supaya orang lain tahu variabel apa saja yang dibutuhkan tanpa ikut menerima nilainya.',
        },
        {
          term: 'secrets manager',
          meaning:
            'Layanan yang menyimpan rahasia terenkripsi dan menyerahkannya ke aplikasi saat dibutuhkan, lengkap dengan catatan siapa mengambil apa dan kapan. Dipakai di produksi karena memungkinkan rotasi tanpa mengubah kode.',
        },
        {
          term: 'rotasi (rotation)',
          meaning:
            'Mengganti sebuah rahasia dengan nilai baru secara berkala, dan segera setelah dicurigai bocor. Supaya rotasi mungkin dilakukan, nilainya harus dibaca tiap boot atau tiap permintaan, bukan disalin sekali lalu disimpan selamanya di dalam kode.',
        },
        {
          term: 'prefix publik',
          meaning:
            'Awalan nama yang menandai sebuah variabel boleh ikut terkirim ke peramban, misalnya `NEXT_PUBLIC_` di Next.js dan `VITE_` di Vite. Nilai di balik awalan itu terbaca siapa pun yang membuka bundel, jadi menaruh rahasia di sana sama dengan menerbitkannya.',
        },
        {
          term: 'fail fast',
          meaning:
            'Perilaku menolak menyala sama sekali ketika konfigurasi yang wajib tidak ada, alih-alih menyala lalu gagal pada permintaan pertama. Alasannya sederhana, kegagalan saat boot menyebut variabel apa yang kurang, sedangkan kegagalan di tengah pemakaian muncul sebagai error yang tidak berhubungan.',
        },
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
      h2('Studi kasus di project nyata'),
      p(
        'Konfigurasi adalah tempat sebagian besar kegagalan rilis berasal, dan bukan karena nilainya sulit melainkan karena kesalahannya ditemukan terlambat. Yang menentukan adalah **kapan** sebuah variabel yang hilang membuat prosesnya berhenti.',
      ),
      code(
        'text',
        `
        KONFIGURASI DIBACA TERSEBAR — ketahuan saat permintaan pertama:

          TypeError: Cannot read properties of undefined (reading 'length')
          Error: connect ECONNREFUSED 127.0.0.1:5432
          error: password authentication failed for user "undefined"

        Ketiganya muncul jauh dari penyebabnya, dan tidak satu pun
        menyebut variabel mana yang hilang.

        KONFIGURASI DIVALIDASI SAAT BOOT — ketahuan sebelum melayani
        satu permintaan pun:

          Konfigurasi tidak valid, proses dihentikan:
            DATABASE_URL : wajib diisi
            SESSION_SECRET : minimal 32 karakter, diterima 8
            PORT : harus berupa angka, diterima "tiga ribu"
        `,
        {
          caption: 'Kedua versi sama-sama gagal. Yang kedua gagal pada saat yang jauh lebih murah.',
        },
      ),
      code(
        'ts',
        `
        const SkemaEnv = z.object({
          DATABASE_URL: z.string().url(),
          SESSION_SECRET: z.string().min(32),
          PORT: z.coerce.number().int().positive().default(3000),
          NODE_ENV: z.enum(['development', 'test', 'production']),
        });

        const hasil = SkemaEnv.safeParse(process.env);
        if (!hasil.success) {
          console.error('Konfigurasi tidak valid, proses dihentikan:');
          for (const [kunci, isu] of Object.entries(hasil.error.flatten().fieldErrors)) {
            console.error(\`  \${kunci} : \${isu?.join(', ')}\`);
          }
          process.exit(1);                  // gagal NYARING, bukan diam
        }

        export const env = Object.freeze(hasil.data);
        // Sisa aplikasi mengimpor \`env\` dan TIDAK PERNAH menyentuh
        // process.env lagi. Itu yang membuat daftar di atas lengkap.
        `,
      ),
      p(
        'Sisi kedua adalah tempat penyimpanan rahasianya, dan urutan pilihannya bergantung pada apa yang benar-benar tersedia.',
      ),
      table(
        ['Tempat', 'Kapan masuk akal', 'Yang harus diwaspadai'],
        [
          [
            'Berkas `.env` di server',
            'Satu VPS, tim kecil',
            'Wajib di luar direktori yang dilayani web, wajib git-ignored, izin berkas `600`',
          ],
          [
            'Variabel yang disuntik platform',
            'PaaS seperti Vercel atau Railway',
            'Pastikan variabel build dan runtime dipisahkan, dan yang ber-awalan publik tidak berisi rahasia',
          ],
          [
            'Secret manager',
            'Ada beberapa layanan, perlu rotasi dan audit',
            'Aplikasi membacanya saat boot atau per permintaan, bukan menanamnya ke image',
          ],
          [
            'Di dalam image container',
            'Tidak pernah',
            'Siapa pun yang bisa menarik image itu memegang rahasianya',
          ],
        ],
      ),
      p(
        'Baris terakhir bukan nasihat berlebihan. Isi sebuah image bisa dibaca tanpa menjalankannya, dan lapisan yang sudah dibuat tetap ada di riwayat image meski berkasnya dihapus pada lapisan berikutnya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Selain variabel yang hilang, ada kelas kesalahan yang tidak menghasilkan error sama sekali, dan itulah yang paling berbahaya.',
      ),
      code(
        'text',
        `
        NILAI BAWAAN YANG JATUH KE ARAH YANG SALAH:

          const wajibHttps = process.env.WAJIB_HTTPS === 'false' ? false : true;
          // variabel salah ketik di produksi -> tetap true. AMAN.

          const wajibHttps = process.env.WAJIB_HTTPS === 'true';
          // variabel salah ketik di produksi -> menjadi false. TERBUKA.

        Aturannya: nilai yang hilang harus jatuh ke pilihan PALING KETAT.
        Konfigurasi yang hilang tidak boleh pernah berarti
        "matikan pengamanannya".
        `,
      ),
      code(
        'text',
        `
        SEMUA VARIABEL ADALAH STRING:

          process.env.DEBUG          -> "false"
          Boolean(process.env.DEBUG) -> true        <- string tak kosong

          process.env.PORT           -> "3000"
          process.env.PORT + 1       -> "30001"     <- penggabungan, bukan penjumlahan

        Karena itu skema konfigurasi harus MENGUBAH TIPE, bukan sekadar
        memeriksa keberadaan.
        `,
      ),
      p(
        'Kelas ketiga menyangkut rahasia yang bocor, dan jalur paling sering adalah riwayat versi.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan git. Berkas konfigurasi berisi kredensial
        di-commit, lalu dikeluarkan dari repo pada commit berikutnya.

          git status sesudah dihapus : (bersih)
          git log                    : dua commit, terlihat rapi

        Yang tetap terbaca siapa pun pemegang klon:
          +  "db": "postgres://app:CONTOH-BUKAN-ASLI-123@db.internal:5432/app",
          +  "kunciBayar": "sk_live_CONTOH_BUKAN_ASLI"

        Rahasia yang pernah masuk riwayat versi dihitung BOCOR.
        Urutan yang benar: ROTASI dulu, baru bereskan repo.
        `,
      ),
      code(
        'text',
        `
        JALUR KEBOCORAN LAIN yang sering terlewat:

          - log saat boot yang mencetak seluruh konfigurasi
          - pesan error yang menyertakan connection string
          - laporan kesalahan ke layanan pemantauan
          - variabel ber-awalan publik yang berisi rahasia
          - argumen perintah (terlihat di ps aux oleh pengguna lain)
          - berkas .env yang ikut ter-COPY ke dalam image

        Yang terakhir ditutup dengan satu baris .dockerignore, dan
        diukur di bab Docker: konteks build turun dari 33,01 MB
        menjadi 195 byte.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Konfigurasi terasa seperti pekerjaan administratif, dan justru karena itu ia jarang mendapat perhatian yang setara dengan akibatnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membaca `process.env` tersebar di banyak berkas',
            'Praktis, langsung di tempat pakainya',
            'Variabel yang hilang baru ketahuan saat permintaan pertama, sebagai error yang tidak menyebut namanya',
          ],
          [
            'Memakai nilai environment tanpa mengubah tipenya',
            'Nilainya kan sudah benar',
            'Semuanya string. `Boolean("false")` bernilai `true`, dan `PORT + 1` menghasilkan `"30001"`',
          ],
          [
            'Menulis nilai bawaan ke arah yang permisif',
            'Biar tidak merepotkan saat pengembangan',
            'Satu salah ketik di produksi mematikan pengamanan tanpa satu pun error',
          ],
          [
            'Mencetak konfigurasi saat boot',
            'Biar yakin semuanya terbaca',
            'Baris itu menuliskan kredensial ke log. Cetak nama variabel dan panjangnya, jangan nilainya',
          ],
          [
            'Menyalin `.env` ke dalam image container',
            'Biar aplikasinya bisa membacanya',
            'Siapa pun yang bisa menarik image itu memegang rahasianya. Suntikkan saat menjalankan',
          ],
          [
            'Menghapus commit berisi rahasia lalu menganggap selesai',
            '`git status` sudah bersih',
            'Diuji, nilainya tetap terbaca dari riwayat. Rahasianya harus DIROTASI',
          ],
        ],
      ),
      p(
        'Satu kebiasaan menutup sebagian besar baris di tabel itu sekaligus, yaitu memperlakukan `.env.example` sebagai dokumen yang wajib benar. Berkas itu memuat setiap nama variabel yang dibaca aplikasi, beserta satu baris penjelasan dan nilai contoh yang jelas-jelas palsu. Ketika berkas itu selalu diperbarui bersama kodenya, orang yang menyiapkan lingkungan baru tidak perlu menebak, dan variabel yang lupa dipasang ketahuan sebelum dijalankan, bukan sesudah.',
      ),
      references(
        {
          label: 'Config — Store config in the environment',
          href: 'https://12factor.net/config',
          source: 'Twelve-Factor App',
          note: 'Dasar pemisahan konfigurasi dari kode, termasuk kenapa berkas konfigurasi per-lingkungan bermasalah',
        },
        {
          label: 'Environment Variables',
          href: 'https://nextjs.org/docs/app/guides/environment-variables',
          source: 'Next.js Docs',
          note: 'Urutan pemuatan berkas `.env` dan batas tegas antara variabel server dan variabel publik',
        },
        {
          label: 'Using secrets in GitHub Actions',
          href: 'https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets',
          source: 'GitHub Docs',
          note: 'Cara rahasia diserahkan ke pipeline tanpa ikut tertulis di berkas workflow',
        },
        {
          label: 'Environment Variables',
          href: 'https://vercel.com/docs/projects/environment-variables',
          source: 'Vercel Docs',
          note: 'Pemisahan nilai per lingkungan pada platform hosting terkelola',
        },
      ),
    ],
  ),

  written(
    'domain-dns-tls',
    'Domain, DNS & HTTPS/TLS',
    18,
    'Bagaimana nama menjadi alamat, dan koneksi menjadi terenkripsi.',
    [
      terms(
        {
          term: 'domain',
          meaning:
            'Nama yang mudah diingat untuk sebuah alamat di internet, misalnya `contoh.com`. Nama ini disewa, bukan dibeli permanen, dan berhenti mengarah ke mana pun bila sewanya tidak diperpanjang.',
        },
        {
          term: 'DNS',
          meaning:
            'Singkatan *Domain Name System*, sistem yang menerjemahkan nama domain menjadi alamat IP. Bekerja berjenjang, dari resolver milik penyedia internet sampai server yang berwenang atas domain itu. Dibaca huruf per huruf.',
        },
        {
          term: 'record A dan AAAA',
          meaning:
            'Dua jenis catatan DNS yang memetakan sebuah nama langsung ke alamat IP. `A` untuk IPv4 seperti `93.184.216.34`, `AAAA` untuk IPv6 yang jauh lebih panjang. Nama `AAAA` dipilih karena alamat IPv6 berukuran empat kali IPv4.',
        },
        {
          term: 'record CNAME',
          meaning:
            'Catatan DNS yang memetakan sebuah nama ke nama lain, bukan ke alamat IP. Dipakai saat hosting-mu memberi alamat berupa nama, sehingga alamat IP di baliknya boleh berubah tanpa kamu perlu memperbarui apa pun.',
        },
        {
          term: 'TTL',
          meaning:
            'Singkatan *Time To Live*, lama sebuah jawaban DNS boleh disimpan sebelum ditanyakan ulang. Dinyatakan dalam detik. Nilai besar membuat perpindahan lambat terlihat oleh sebagian pengguna, jadi kebiasaan yang baik adalah menurunkannya beberapa jam sebelum memindahkan alamat.',
        },
        {
          term: 'propagasi',
          meaning:
            'Istilah sehari-hari untuk jeda sampai perubahan DNS terlihat di mana-mana. Sebenarnya bukan penyebaran, melainkan kedaluwarsanya jawaban lama yang masih tersimpan di berbagai resolver, dan lamanya ditentukan TTL yang berlaku sebelum perubahan.',
        },
        {
          term: 'TLS',
          meaning:
            'Singkatan *Transport Layer Security*, protokol yang mengenkripsi lalu lintas antara peramban dan server. Nama lamanya SSL, dan istilah itu masih sering dipakai meski versinya sudah tidak dianjurkan. TLS yang membuat alamat berawalan `https`.',
        },
        {
          term: 'sertifikat',
          meaning:
            'Berkas yang mengikat sebuah nama domain ke kunci kriptografi, ditandatangani pihak yang dipercaya peramban. Berumur pendek dan perlu diperbarui otomatis. Sertifikat kedaluwarsa menghasilkan peringatan besar di peramban yang menghentikan hampir semua pengunjung.',
        },
        {
          term: 'HSTS',
          meaning:
            'Singkatan *HTTP Strict Transport Security*, header yang memberi tahu peramban agar selalu memakai `https` untuk domain ini sampai batas waktu tertentu. Menutup celah pada kunjungan pertama yang masih memakai `http`. Perlu kehati-hatian, sebab nilainya tersimpan di peramban pengunjung dan tidak bisa kamu tarik kembali begitu saja.',
        },
      ),

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
      h2('Studi kasus di project nyata'),
      p(
        'Domain, DNS, dan TLS adalah tiga hal berbeda yang sering disebut sebagai satu langkah. Memisahkannya membuat penelusuran jauh lebih cepat, sebab masing-masing punya cara pemeriksaannya sendiri.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan dig terhadap domain publik:

          A      104.20.23.154 172.66.147.243
          AAAA   2606:4700:10::ac42:93f3 2606:4700:10::6814:179a
          NS     elliott.ns.cloudflare.com. hera.ns.cloudflare.com.

          example.com.    152   IN   A   104.20.23.154
                          ^^^ TTL dalam detik
        `,
        {
          caption:
            'Dua alamat A untuk satu nama: itu cara paling sederhana membagi lalu lintas ke beberapa server.',
        },
      ),
      p(
        'Angka TTL itu yang menentukan berapa lama perubahan DNS membutuhkan waktu untuk berlaku di mana-mana, dan itu bukan sesuatu yang bisa dipercepat setelah perubahannya dibuat.',
      ),
      code(
        'text',
        `
        Urutan yang benar saat akan memindahkan domain:

          1. TURUNKAN TTL beberapa hari SEBELUM pindah
             misalnya dari 3600 menjadi 60
          2. TUNGGU sampai TTL lama habis di mana-mana
          3. Baru ubah alamatnya
          4. Setelah stabil, naikkan lagi TTL-nya

        Menurunkan TTL pada hari H tidak menolong: yang sudah
        menyimpan jawaban lama tetap memakainya sampai TTL LAMA habis.
        `,
      ),
      p(
        'Perbedaan `A` dan `CNAME` punya satu aturan yang sering menjadi penghalang nyata, dan bisa dilihat pada domain sungguhan.',
      ),
      code(
        'text',
        `
        Diukur sungguhan:

          www.github.com.   238   IN   CNAME   github.com.
          github.com.        29   IN   A       20.205.243.166

        Subdomain www boleh berupa CNAME. Apex-nya (github.com) TIDAK
        BISA, sebab apex harus memuat rekaman NS dan SOA, dan CNAME
        melarang rekaman lain hidup berdampingan.

        Penyedia DNS modern menyiasatinya dengan ALIAS atau ANAME,
        yang secara teknis adalah A yang diselesaikan penyedianya.
        `,
      ),
      p(
        'Bagian TLS-nya kini hampir selalu otomatis, dan yang perlu dipahami adalah apa yang sebenarnya diverifikasi.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan curl 8.5.0:

          ALPN: curl offers h2,http/1.1
          TLSv1.3 (IN), TLS handshake, Certificate (11):
          TLSv1.3 (IN), TLS handshake, CERT verify (15):
          SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519
          ALPN: server accepted h2

        Tiga hal diperiksa sekaligus:
          1. sertifikatnya ditandatangani CA yang dipercaya
          2. sertifikatnya BELUM kedaluwarsa
          3. NAMA di sertifikatnya cocok dengan yang dihubungi
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ketiga pemeriksaan itu punya pesan errornya masing-masing, dan semuanya bisa dilihat langsung terhadap situs uji yang memang disediakan untuk itu.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan curl 8.5.0:

          https://expired.badssl.com
            curl: (60) SSL certificate problem: certificate has expired

          https://wrong.host.badssl.com
            curl: (60) SSL: no alternative certificate subject name
                  matches target host name 'wrong.host.badssl.com'

          https://self-signed.badssl.com
            curl: (60) SSL certificate problem: self-signed certificate

          https://untrusted-root.badssl.com
            curl: (60) SSL certificate problem: self-signed certificate
                  in certificate chain

        Dan keempatnya dengan verifikasi dimatikan (-k):
            200
            200
            200
            200
        `,
        {
          caption:
            'Empat masalah berbeda, satu jalan pintas yang sama, dan jalan pintas itu membuang seluruh manfaat verifikasi.',
        },
      ),
      p(
        'Kesalahan DNS punya gejala yang berbeda, dan yang paling sering membingungkan adalah perubahan yang "sudah dilakukan tapi belum berlaku".',
      ),
      code(
        'text',
        `
        1. Sudah diubah, masih menunjuk server lama

           Penyebabnya TTL. Periksa apa yang dijawab server otoritatifnya
           langsung, bukan yang dijawab resolver lokalmu:

             dig @elliott.ns.cloudflare.com contoh.id A
             dig contoh.id A              # lewat resolver biasa

           Bila keduanya berbeda, perubahannya sudah benar dan tinggal
           menunggu. Bila keduanya sama-sama lama, perubahannya belum
           tersimpan.

        2. Berlaku di satu tempat, belum di tempat lain

           Resolver berbeda menyimpan jawaban berbeda. Ini normal
           selama masa TTL, dan bukan tanda ada yang salah.

        3. NXDOMAIN

           Nama itu tidak ada sama sekali. Sering karena subdomain
           belum dibuat, atau karena nameserver domainnya belum
           diarahkan ke penyedia yang kamu konfigurasi.
        `,
      ),
      code(
        'text',
        `
        KESALAHAN TLS yang khas saat pertama kali memasang:

          - sertifikat diterbitkan untuk contoh.id saja, lalu diakses
            lewat www.contoh.id -> nama tidak cocok
          - pembaruan otomatis gagal karena tantangan HTTP-01 diblokir
            oleh pengalihan http ke https yang dipasang sendiri
          - sertifikat diperbarui, prosesnya tidak pernah di-reload,
            sehingga yang disajikan tetap yang lama
          - HSTS dipasang dengan max-age panjang SEBELUM TLS-nya benar,
            sehingga peramban menolak turun ke http untuk memperbaikinya
        `,
      ),
      p(
        'Poin terakhir pantas ditegaskan karena akibatnya sulit dibatalkan. HSTS disimpan peramban pengunjung, jadi memasangnya terlalu cepat berarti pengunjung yang sudah menerimanya tidak bisa mengakses situsmu sama sekali sampai TLS-nya benar. Uji dengan `max-age` kecil lebih dulu.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di area ini hampir semuanya berupa menunggu hal yang salah, atau mematikan pemeriksaan alih-alih memperbaikinya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menurunkan TTL pada hari pemindahan',
            'Biar perubahannya cepat berlaku',
            'Yang sudah menyimpan jawaban lama memakai TTL LAMA. Turunkan beberapa hari sebelumnya',
          ],
          [
            'Memakai `-k` atau `rejectUnauthorized: false`',
            'Errornya hilang dan koneksinya jalan',
            'Diukur, keempat sertifikat bermasalah menjawab 200 dengan `-k`. Enkripsi tanpa verifikasi identitas',
          ],
          [
            'Memasang `CNAME` di apex domain',
            'Sama saja dengan subdomain',
            'Apex harus memuat NS dan SOA. Pakai `A`, atau `ALIAS` bila penyedianya menyediakannya',
          ],
          [
            'Menerbitkan sertifikat hanya untuk satu nama',
            'Domainnya kan satu',
            '`contoh.id` dan `www.contoh.id` adalah dua nama. Sertifikatnya harus memuat keduanya',
          ],
          [
            'Memasang HSTS panjang sebelum TLS benar-benar siap',
            'Katanya harus dipasang',
            'Peramban menyimpannya. Pengunjung tidak bisa turun ke http untuk memperbaikinya. Uji dengan nilai kecil dulu',
          ],
          [
            'Memeriksa DNS hanya lewat resolver sendiri',
            'Itu yang saya pakai',
            'Resolver menyimpan jawaban lama. Tanyakan langsung ke server otoritatifnya dengan `dig @nameserver`',
          ],
        ],
      ),
      p(
        'Satu urutan pemeriksaan menutup hampir semua penelusuran di area ini, dan urutannya penting. Pertama pastikan namanya menunjuk ke alamat yang benar dengan `dig`, lalu pastikan ada yang menjawab di alamat itu dengan `curl -I`, lalu terakhir periksa sertifikatnya dengan `curl -v`. Mulai dari langkah ketiga ketika langkah pertama belum benar hanya menghasilkan pesan error yang menyesatkan.',
      ),
      references(
        {
          label: 'DNS',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/DNS',
          source: 'MDN',
          note: 'Penjelasan ringkas sistem penamaan dan jenis-jenis catatannya',
        },
        {
          label: 'Transport Layer Security',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security',
          source: 'MDN',
          note: 'Apa yang sebenarnya dijamin TLS, dan apa yang tidak',
        },
        {
          label: 'Strict-Transport-Security',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security',
          source: 'MDN',
          note: 'Sintaks header beserta peringatan soal `max-age` dan `preload`',
        },
        {
          label: 'Domains',
          href: 'https://vercel.com/docs/domains',
          source: 'Vercel Docs',
          note: 'Langkah menghubungkan domain dan penerbitan sertifikat otomatis',
        },
      ),
    ],
  ),

  written(
    'reverse-proxy',
    'Reverse Proxy & Load Balancer Sekilas',
    18,
    'Lapisan di depan aplikasi, dan apa yang ia ambil alih.',
    [
      p(
        'Aplikasi Node atau PHP-FPM jarang menghadap internet langsung. Di depannya ada reverse proxy yang mengambil alih TLS, kompresi, berkas statis, dan pembatasan laju — hal-hal yang tidak perlu dikerjakan aplikasimu.',
      ),

      terms(
        {
          term: 'reverse proxy',
          meaning:
            'Server yang berdiri di depan aplikasimu, menerima permintaan dari internet lalu meneruskannya ke proses aplikasi di belakang. Disebut *reverse* karena kebalikan dari proxy biasa yang mewakili klien. Contohnya Nginx dan Apache. Yang ia kerjakan antara lain menghentikan TLS, menyajikan berkas statis, membatasi laju, dan membagi beban.',
        },
        {
          term: 'upstream',
          meaning:
            'Sebutan untuk proses aplikasi yang berada di belakang reverse proxy dan menerima permintaan yang diteruskan. Di konfigurasi Nginx, blok `upstream` mendaftar alamat-alamat itu beserta cara memilih di antaranya.',
        },
        {
          term: 'TLS termination',
          meaning:
            'Membongkar enkripsi TLS di reverse proxy, sehingga aplikasi di belakangnya menerima permintaan biasa. Membuat sertifikat cukup dikelola di satu tempat. Konsekuensinya, lalu lintas antara proxy dan aplikasi menjadi tidak terenkripsi, jadi jalur itu harus berada di jaringan yang memang tertutup.',
        },
        {
          term: 'X-Forwarded-For',
          meaning:
            'Header yang diisi proxy untuk memberi tahu aplikasi alamat IP asli pengunjung, sebab tanpa itu aplikasi hanya melihat alamat proxy-nya. Nilainya berupa daftar dan **bisa dipalsukan klien**, sehingga hanya boleh dipercaya bila proxy paling depan menimpanya, bukan menambahkannya.',
        },
        {
          term: 'X-Forwarded-Proto',
          meaning:
            'Header yang memberi tahu aplikasi bahwa permintaan aslinya memakai `https`, meski yang sampai ke aplikasi berupa `http`. Tanpa membacanya, pengalihan yang dibuat aplikasi bisa mengarah balik ke `http` dan menghasilkan perulangan pengalihan.',
        },
        {
          term: 'trust proxy',
          meaning:
            'Setelan di framework yang menyatakan berapa lapis proxy di depan boleh dipercaya saat membaca header `X-Forwarded-*`. Di Express namanya `trust proxy`. Menyalakannya tanpa proxy di depan berarti mempercayai header yang dikirim langsung oleh penyerang.',
        },
        {
          term: 'load balancing',
          meaning:
            'Membagi permintaan ke beberapa proses atau mesin supaya tidak ada satu pun yang kelebihan. Strategi paling umum adalah bergiliran (*round robin*) dan memilih yang koneksi aktifnya paling sedikit (*least connections*).',
        },
        {
          term: 'health check',
          meaning:
            'Permintaan berkala ke sebuah alamat khusus untuk menentukan apakah satu instance layak menerima lalu lintas. Yang menentukan kualitasnya adalah apa saja yang ikut diperiksa. Menjadikan cache sebagai syarat wajib, misalnya, membuat matinya cache mengeluarkan seluruh mesin dari rotasi sekaligus.',
        },
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
      h2('Studi kasus di project nyata'),
      p(
        'Reverse proxy adalah satu-satunya komponen yang melihat setiap permintaan sebelum aplikasimu melihatnya. Karena itu ia tempat yang tepat untuk TLS, kompresi, pembatasan ukuran badan, dan pengalihan, dan sekaligus sumber satu kelas bug yang sangat khas.',
      ),
      p(
        'Bug itu berawal dari kenyataan sederhana, yaitu aplikasi di belakang proxy tidak lagi melihat pengunjung aslinya.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan dua server node:http, satu sebagai
        proxy dan satu sebagai aplikasi.

        A. Permintaan LEWAT proxy, dibaca dengan cara naif:
             ip       : 127.0.0.1           <- alamat PROXY, bukan pengunjung
             protokol : http                <- padahal pengunjung memakai https
             host     : 127.0.0.1:4102

           dibaca dengan memperhitungkan header teruskan:
             ip       : 203.0.113.7         <- pengunjung sungguhan
             protokol : https
             host     : app.contoh.id
        `,
        {
          caption:
            'TLS diakhiri di proxy, jadi hop terakhir memang http. Aplikasi harus diberi tahu.',
        },
      ),
      p(
        'Akibat dari membaca protokol secara naif sangat spesifik dan sering menghabiskan waktu berjam-jam untuk ditelusuri.',
      ),
      code(
        'text',
        `
        Aplikasi mengira koneksinya http, maka:

          - cookie ber-atribut Secure TIDAK dipasang
            -> pengguna login, halaman berikutnya 401, sesinya tidak
               pernah bertahan, dan TIDAK ADA error di log aplikasi
          - pengalihan dibuat ke http://
            -> peramban dialihkan ke http, proxy mengalihkannya kembali
               ke https, dan terjadi perulangan
          - URL absolut di surel memakai http://
            -> tautan setel-ulang sandi mengarah ke http
        `,
      ),
      p('Perbaikannya adalah mempercayai header teruskan, dan di sinilah sisi keamanannya masuk.'),
      code(
        'text',
        `
        B. Permintaan LANGSUNG ke aplikasi, header dipalsukan klien:

             header dikirim : X-Forwarded-For: 1.2.3.4
                              X-Forwarded-Proto: https
             yang dibaca    : ip=1.2.3.4  protokol=https

        Diukur sungguhan. Header X-Forwarded-* BISA dikirim siapa saja.
        Ia hanya boleh dipercaya bila permintaannya DIPASTIKAN datang
        lewat proxy milikmu.
        `,
      ),
      code(
        'ts',
        `
        // Express: percayai HANYA sejumlah hop proxy yang memang ada
        // di depanmu, bukan "percayai semua".
        app.set('trust proxy', 1);        // satu proxy di depan
        // app.set('trust proxy', true);  // BAHAYA bila aplikasinya
        //                                // bisa dihubungi langsung

        // Dan pastikan aplikasinya memang TIDAK bisa dihubungi langsung:
        //   - dengarkan hanya di 127.0.0.1, bukan 0.0.0.0
        //   - atau batasi lewat aturan jaringan
        // Bila aplikasinya terbuka ke internet, header teruskan apa pun
        // yang datang adalah klaim pengunjung, bukan fakta.
        `,
      ),
      p(
        'Hal itu punya akibat langsung pada pembatasan laju. Pembatas yang menghitung per IP sementara IP-nya dibaca dari header palsu tidak membatasi apa pun, sebab penyerang cukup mengganti nilainya pada setiap permintaan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Selain gejala cookie di atas, ada beberapa kegagalan yang gejalanya menunjuk ke tempat yang salah.',
      ),
      code(
        'text',
        `
        1. 413 yang badannya HTML, bukan JSON

           Yang menolak adalah proxy, bukan aplikasimu.
           Bawaan nginx: client_max_body_size 1m

           Yang dilihat kode klien (diukur di bab Fondasi backend):
             SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON

           Pesannya menyebut JSON, penyebabnya ukuran berkas.

        2. 502 Bad Gateway

           Proxy hidup, aplikasinya tidak menjawab. Periksa apakah
           prosesnya berjalan dan mendengarkan di port yang ditunjuk
           proxy. Ini hampir tidak pernah masalah konfigurasi proxy.

        3. 504 Gateway Timeout

           Aplikasinya menjawab, terlalu lambat. Batas waktu proxy
           lebih pendek daripada waktu proses. Perpanjang batasnya
           HANYA setelah tahu kenapa lambat — atau pindahkan
           pekerjaannya ke antrean.

        4. Aliran SSE atau WebSocket mati

           Proxy menahan respons sampai buffer penuh, atau memutus
           koneksi yang diam. Untuk nginx: proxy_buffering off,
           plus meneruskan header Upgrade dan Connection.
        `,
      ),
      p(
        'Kasus keempat sudah diukur di bab Integrasi, dan bentuk gejalanya khas, yaitu aliran yang bekerja sempurna di lokal lalu diam sepenuhnya begitu lewat proxy.',
      ),
      code(
        'text',
        `
        Konfigurasi nginx yang menutup empat masalah di atas sekaligus:

          location / {
            proxy_pass http://127.0.0.1:3000;

            # Supaya aplikasi tahu pengunjung dan protokol aslinya
            proxy_set_header Host              $host;
            proxy_set_header X-Real-IP         $remote_addr;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Supaya WebSocket dan SSE bisa lewat
            proxy_http_version 1.1;
            proxy_set_header Upgrade    $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_buffering off;

            # Batas yang harus disamakan dengan aturan aplikasimu
            client_max_body_size 10m;
            proxy_read_timeout   60s;
          }
        `,
        {
          caption:
            'Contoh nginx ini TIDAK dijalankan — nginx tidak terpasang di mesin ini. Perilaku header teruskannya yang diukur, dengan proxy node:http.',
        },
      ),
      p(
        'Penyeimbang beban menambahkan satu kelas masalah lagi, yaitu keadaan yang disimpan di memori satu instance.',
      ),
      code(
        'text',
        `
        Gejala yang khas saat instance ditambah dari satu menjadi dua:

          - pengguna keluar sendiri secara acak
            -> sesi disimpan di memori proses. Pindahkan ke penyimpanan
               bersama, atau pakai sesi bertanda tangan di cookie
          - pembatasan laju tidak berfungsi seperti seharusnya
            -> hitungannya per instance, jadi batas sebenarnya berlipat
               sebanyak jumlah instance
          - berkas yang baru diunggah kadang tidak ditemukan
            -> disimpan di disk lokal satu instance. Pakai object storage
          - job berkala berjalan beberapa kali
            -> setiap instance menjalankan penjadwalnya sendiri
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Reverse proxy memindahkan sebagian tanggung jawab keluar dari aplikasi, dan kesalahannya hampir selalu berupa lupa bahwa perpindahan itu terjadi.',
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
            'Diukur, header itu bisa dikirim siapa saja. Batasi jumlah hop, dan tutup akses langsung ke aplikasi',
          ],
          [
            'Membatasi laju per IP dari header teruskan yang tidak dipercaya',
            'IP-nya kan ada di header',
            'Penyerang mengganti nilainya tiap permintaan. Pembatasnya tidak membatasi apa pun',
          ],
          [
            'Menyamakan batas ukuran hanya di aplikasi',
            'Batasnya sudah ditulis',
            'Yang paling ketat yang berlaku. Proxy menolak lebih dulu, dan responsnya HTML bukan JSON',
          ],
          [
            'Menyimpan sesi di memori proses',
            'Cepat dan sederhana',
            'Begitu instance-nya dua, pengguna keluar secara acak. Pindahkan ke penyimpanan bersama',
          ],
          [
            'Memperpanjang batas waktu proxy saat muncul 504',
            'Supaya tidak timeout lagi',
            'Itu menyembunyikan penyebabnya. Ukur dulu kenapa lambat, lalu pindahkan yang berat ke antrean',
          ],
        ],
      ),
      p(
        'Cara memeriksa apakah aplikasimu benar-benar membaca identitas pengunjung dengan benar hanya perlu satu endpoint sementara yang mengembalikan apa yang ia lihat, yaitu alamat soket, protokol, host, dan seluruh header ber-awalan `X-Forwarded-`. Bukalah lewat proxy dan bandingkan dengan yang kamu harapkan. Itu lima menit pekerjaan yang menghemat penelusuran berjam-jam pada hari sesi pengguna mulai hilang tanpa sebab.',
      ),
      references(
        {
          label: 'ngx_http_proxy_module',
          href: 'https://nginx.org/en/docs/http/ngx_http_proxy_module.html',
          source: 'Nginx Docs',
          note: 'Rujukan lengkap direktif `proxy_pass` beserta header yang diteruskan',
        },
        {
          label: 'mod_proxy',
          href: 'https://httpd.apache.org/docs/2.4/mod/mod_proxy.html',
          source: 'Apache HTTP Server Docs',
          note: 'Padanan konfigurasi yang sama di Apache',
        },
        {
          label: 'X-Forwarded-For',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For',
          source: 'MDN',
          note: 'Bentuk nilainya dan peringatan tegas bahwa header ini bisa dipalsukan',
        },
        {
          label: 'Express behind proxies',
          href: 'https://expressjs.com/en/guide/behind-proxies.html',
          source: 'Express Docs',
          note: 'Nilai `trust proxy` yang tersedia dan akibat memilih yang salah',
        },
      ),
    ],
  ),
];
