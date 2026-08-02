import { callout, code, h2, ol, p, steps, table, ul } from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Deployment — Chapter 6, all six lessons.
 *
 * GitHub Actions as the concrete example, but the reasoning is portable. Lesson 6.6 (rollback) is
 * placed last on purpose: it is the one that must be decided *before* the first deploy, and the one
 * most teams only think about while something is already burning.
 */
export const lessons: LessonDraft[] = [
  written('konsep-ci-cd', 'Konsep CI vs CD', 9, 'Dua hal berbeda yang sering disebut satu napas.', [
    table(
      ['', 'Continuous Integration', 'Continuous Delivery/Deployment'],
      [
        ['Menjawab', 'Apakah kode ini sehat?', 'Bagaimana ia sampai ke pengguna?'],
        ['Berjalan saat', 'Setiap push dan PR', 'Setelah CI hijau'],
        ['Menghasilkan', 'Keputusan lulus/gagal', 'Artefak yang ter-deploy'],
        ['Kalau gagal', 'Merge diblokir', 'Deploy dibatalkan'],
      ],
    ),
    p(
      '**Delivery** berarti artefaknya siap di-deploy kapan saja, tapi tombolnya ditekan manusia. **Deployment** berarti ia langsung berjalan ke produksi tanpa persetujuan manual. Bedanya satu keputusan, dan keputusan itu bergantung pada seberapa kamu percaya pada tesmu.',
    ),

    h2('Kenapa CI berbayar'),
    ol(
      '**Kegagalan ketahuan menit, bukan hari.** Makin cepat ditemukan, makin murah diperbaiki.',
      '**Semua orang menjalankan pemeriksaan yang sama.** Tidak ada lagi "di laptopku lulus".',
      '**Merge yang tidak sehat diblokir**, bukan diperiksa manual.',
      '**Bukti**, bukan klaim. Log CI menunjukkan apa yang benar-benar dijalankan.',
    ),
    callout(
      'tip',
      'Ini penerapan aturan project ini di tingkat pipeline',
      '"Selesai berarti test ditulis dan dijalankan, seluruh check hijau, lolos pemeriksaan keamanan." CI membuat aturan itu tidak bisa dilewati — bukan karena orang disiplin, tapi karena merge-nya diblokir.',
    ),

    h2('Urutan yang benar'),
    code(
      'text',
      `
        1. Install         npm ci
        2. Lint            paling cepat -> gagal duluan
        3. Type-check
        4. Test
        5. Build
        6. Audit keamanan
        7. Deploy          hanya kalau 1-6 lulus
        `,
    ),
    p(
      'Urutan ini bukan selera — yang paling cepat didahulukan supaya kegagalan yang jelas tidak menunggu build lima menit lebih dulu.',
    ),

    h2('Yang harus memblokir dan yang tidak'),
    table(
      ['Memblokir', 'Tidak memblokir'],
      [
        ['Lint error', 'Peringatan gaya penulisan'],
        ['Type error', 'Cakupan turun sedikit'],
        ['Tes gagal', 'Ada dependency versi baru'],
        ['Build gagal', 'Ukuran bundle naik sedikit'],
        ['Kerentanan **tinggi** di dependency produksi', 'Kerentanan rendah di devDependency'],
        ['Rahasia terdeteksi', ''],
      ],
    ),
    callout(
      'danger',
      'Pipeline yang sering merah palsu akan diabaikan',
      'Kalau CI gagal karena hal yang tidak penting, orang belajar menekan "re-run" tanpa membaca — dan kegagalan yang sungguhan ikut terlewat. Yang memblokir harus benar-benar layak memblokir; sisanya jadi peringatan.',
    ),

    h2('Berapa lama pipeline boleh berjalan'),
    table(
      ['Durasi', 'Akibatnya'],
      [
        ['< 5 menit', 'Orang menunggu — umpan balik terasa langsung'],
        ['5–15 menit', 'Orang pindah kerjaan lain, konteksnya hilang'],
        ['> 15 menit', 'Orang berhenti peduli; PR menumpuk'],
      ],
    ),
    ul(
      'Jalankan job yang tidak saling bergantung secara **paralel**.',
      'Cache dependency antar-jalan.',
      'Untuk PR, jalankan hanya yang terpengaruh; jalankan semuanya di branch utama.',
      'Pindahkan tes yang sangat lambat ke jadwal terpisah, bukan ke jalur PR.',
    ),
  ]),

  written(
    'github-actions',
    'GitHub Actions: workflow, job, step',
    11,
    'Struktur, dan bagian yang menentukan keamanannya.',
    [
      h2('Anatomi'),
      code(
        'yaml',
        `
        name: CI

        on:
          push:
            branches: [main]
          pull_request:

        # Batasi izin token secara global — default-nya terlalu luas.
        permissions:
          contents: read

        # Batalkan jalan lama saat ada push baru ke PR yang sama
        concurrency:
          group: \${{ github.workflow }}-\${{ github.ref }}
          cancel-in-progress: true

        jobs:
          periksa:
            runs-on: ubuntu-latest
            timeout-minutes: 15

            steps:
              - uses: actions/checkout@v4

              - uses: actions/setup-node@v4
                with:
                  node-version-file: '.nvmrc'
                  cache: npm

              - run: npm ci
              - run: npm run lint
              - run: npm run type-check
              - run: npm run test
              - run: npm run build
        `,
        { filename: '.github/workflows/ci.yml' },
      ),
      callout(
        'danger',
        'Setel `permissions` secara eksplisit',
        'Tanpa itu, `GITHUB_TOKEN` bisa punya izin tulis ke repositori. Satu action pihak ketiga yang berbahaya — atau satu dependency yang dibajak — bisa memakainya untuk mendorong commit. Mulai dari `contents: read`, dan tambahkan hanya yang benar-benar dibutuhkan per job.',
      ),
      callout(
        'tip',
        '`concurrency` menghemat banyak waktu dan biaya',
        'Tanpa itu, mendorong tiga commit berturut-turut ke satu PR menjalankan tiga pipeline penuh — dan dua yang pertama hasilnya sudah tidak relevan.',
      ),

      h2('Job paralel'),
      code(
        'yaml',
        `
        jobs:
          lint:
            runs-on: ubuntu-latest
            steps: [...]

          test:
            runs-on: ubuntu-latest
            steps: [...]

          build:
            # Hanya build kalau keduanya lulus
            needs: [lint, test]
            runs-on: ubuntu-latest
            steps: [...]
        `,
      ),

      h2('Layanan untuk tes integrasi'),
      code(
        'yaml',
        `
        jobs:
          test:
            runs-on: ubuntu-latest

            services:
              postgres:
                image: postgres:17-alpine
                env:
                  POSTGRES_USER: app
                  POSTGRES_PASSWORD: rahasia
                  POSTGRES_DB: app_test
                ports: ['5432:5432']
                options: >-
                  --health-cmd pg_isready
                  --health-interval 5s
                  --health-retries 10

            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-node@v4
                with: { node-version-file: '.nvmrc', cache: npm }
              - run: npm ci
              - run: npx prisma migrate deploy
                env:
                  DATABASE_URL: postgresql://app:rahasia@localhost:5432/app_test
              - run: npm run test
                env:
                  DATABASE_URL: postgresql://app:rahasia@localhost:5432/app_test
        `,
      ),
      p(
        'Ini yang membuat tes integrasi bisa berjalan di CI dengan database sungguhan — jauh lebih berharga daripada memalsukan repository.',
      ),

      h2('Keamanan action pihak ketiga'),
      code(
        'yaml',
        `
        # Tag bisa DIPINDAHKAN pemiliknya ke commit mana pun
        - uses: some-org/some-action@v1

        # SHA tidak bisa
        - uses: some-org/some-action@8ade135a41bc03ea155e62e844d188df1ea18608   # v1.2.0
        `,
      ),
      callout(
        'danger',
        'Action berjalan dengan akses ke seluruh rahasia CI-mu',
        'Repositori action yang dibajak bisa memindahkan tag `v1` ke commit berbahaya, dan setiap workflow yang memakai `@v1` langsung menjalankannya — dengan akses ke token deploy, kunci registry, dan kredensial produksi. Sematkan SHA untuk action pihak ketiga.',
      ),

      h2('`pull_request_target` — jangan dipakai sembarangan'),
      code(
        'yaml',
        `
        # BERBAHAYA untuk PR dari fork:
        # ia berjalan dengan RAHASIA repositori, tapi bisa
        # mengeksekusi kode dari PR yang belum ditinjau siapa pun.
        on: pull_request_target
        `,
      ),
      callout(
        'danger',
        '`pull_request_target` + checkout kode PR adalah kombinasi yang membocorkan rahasia',
        'Siapa pun bisa membuka PR dari fork yang berisi skrip apa pun, dan skrip itu berjalan dengan akses penuh ke rahasia repositorimu. Kalau kamu tidak bisa menjelaskan kenapa membutuhkannya, pakai `pull_request` biasa.',
      ),

      h2('Cache'),
      code(
        'yaml',
        `
        - uses: actions/cache@v4
          with:
            path: |
              ~/.npm
              .next/cache
            key: \${{ runner.os }}-build-\${{ hashFiles('**/package-lock.json') }}
            restore-keys: \${{ runner.os }}-build-
        `,
      ),
      callout(
        'warning',
        'Jangan pernah men-cache sesuatu yang bisa memuat rahasia',
        'Cache bisa dipulihkan oleh workflow lain di repositori yang sama, termasuk dari PR fork pada konfigurasi tertentu. Cache dependency dan artefak build — jangan cache berkas konfigurasi atau direktori yang bisa berisi kredensial.',
      ),
    ],
  ),

  written(
    'pipeline-pemeriksaan',
    'Pipeline: lint → type-check → test → build',
    12,
    'Gerbang yang membuat "selesai" punya arti.',
    [
      h2('Pipeline lengkap'),
      code(
        'yaml',
        `
        name: CI

        on:
          push: { branches: [main] }
          pull_request:

        permissions:
          contents: read

        concurrency:
          group: \${{ github.workflow }}-\${{ github.ref }}
          cancel-in-progress: true

        jobs:
          kualitas:
            runs-on: ubuntu-latest
            timeout-minutes: 10
            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-node@v4
                with: { node-version-file: '.nvmrc', cache: npm }

              - run: npm ci

              - name: Lint
                run: npm run lint

              - name: Type-check
                run: npm run type-check

              - name: Format
                run: npm run format:check

          test:
            runs-on: ubuntu-latest
            timeout-minutes: 15
            services:
              postgres:
                image: postgres:17-alpine
                env: { POSTGRES_USER: app, POSTGRES_PASSWORD: rahasia, POSTGRES_DB: app_test }
                ports: ['5432:5432']
                options: --health-cmd pg_isready --health-interval 5s --health-retries 10
            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-node@v4
                with: { node-version-file: '.nvmrc', cache: npm }
              - run: npm ci
              - run: npm run test
                env:
                  DATABASE_URL: postgresql://app:rahasia@localhost:5432/app_test

          keamanan:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4
                with: { fetch-depth: 0 }

              - name: Pindai rahasia
                uses: gitleaks/gitleaks-action@v2

              - uses: actions/setup-node@v4
                with: { node-version-file: '.nvmrc', cache: npm }
              - run: npm ci

              - name: Audit dependency
                run: npm audit --production --audit-level=high

          build:
            needs: [kualitas, test, keamanan]
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-node@v4
                with: { node-version-file: '.nvmrc', cache: npm }
              - run: npm ci
              - run: npm run build

              - name: Pastikan tidak ada rahasia di bundle
                run: |
                  if grep -rqE "sk_live|AKIA|-----BEGIN|postgresql://" .next/static/; then
                    echo "Rahasia ditemukan di bundle klien"
                    exit 1
                  fi
        `,
      ),
      callout(
        'tip',
        'Langkah terakhir menutup satu kelas kebocoran secara permanen',
        'Satu `grep` yang menggagalkan build jauh lebih murah daripada menemukan kredensial database di bundle produksi lewat laporan orang lain. Ini penerapan prinsip yang sama dengan tes: aturan yang dijaga mesin bertahan.',
      ),

      h2('Pemeriksaan khusus project'),
      code(
        'yaml',
        `
        - name: Tipe API masih sinkron dengan backend
          run: |
            npm run tipe:api
            git diff --exit-code src/tipe-api.ts || {
              echo "Kontrak API berubah tapi tipe belum diperbarui."
              exit 1
            }
        `,
      ),
      p(
        'Ini yang membuat perubahan kontrak backend tidak bisa lolos tanpa disadari frontend — pola dari Backend Intermediate 4.1.',
      ),

      h2('Menegakkan batas yang tidak terlihat'),
      code(
        'ts',
        `
        // Tes yang menjaga aturan arsitektur, bukan perilaku.
        // Website yang sedang kamu baca memakai pola ini untuk dua hal:
        // batas bundle klien, dan kemandirian build dari jaringan.
        it('tidak ada Client Component yang mengimpor data besar', () => {
          const pelanggar = berkasKlien.filter((f) => imporRuntime(f).some(terlarang));
          expect(pelanggar).toEqual([]);
        });
        `,
      ),
      callout(
        'tip',
        'Aturan arsitektur yang hanya ditulis di dokumen akan dilanggar',
        'Bukan karena orang tidak peduli, tapi karena tidak ada yang memberi tahu saat ia dilanggar. Tes yang memeriksa struktur kode mengubahnya menjadi kegagalan CI — dan pelanggarannya tidak bisa masuk tanpa seseorang sadar.',
      ),

      h2('Perlindungan branch'),
      code(
        'text',
        `
        Untuk main:
          [x] Wajib lewat pull request
          [x] Wajib status check lulus: kualitas, test, keamanan, build
          [x] Wajib branch up-to-date sebelum merge
          [x] Larang force push
          [x] Larang penghapusan
        `,
      ),
      callout(
        'warning',
        'CI tanpa perlindungan branch hanya memberi tahu, tidak menjaga',
        'Kalau merge tetap bisa dilakukan meski CI merah, pipeline-nya berubah menjadi saran. Perlindungan branch yang paling berharga adalah "status check wajib lulus" — dan ia berguna bahkan untuk project satu orang.',
      ),

      h2('Yang membuat pipeline cepat'),
      ol(
        'Job paralel untuk hal yang tidak saling bergantung.',
        'Cache dependency dan artefak build.',
        '`fail-fast` supaya kegagalan pertama menghentikan sisanya.',
        'Batasi `timeout-minutes` supaya job yang menggantung tidak menahan antrean.',
        'Pindahkan tes yang sangat lambat ke jadwal harian, bukan ke jalur PR.',
      ),
    ],
  ),

  written(
    'deploy-otomatis',
    'Deploy Otomatis & Preview Deployment',
    11,
    'Dari merge ke produksi, dengan gerbang yang tepat.',
    [
      h2('Deploy setelah CI hijau'),
      code(
        'yaml',
        `
        name: Deploy

        on:
          push: { branches: [main] }

        permissions:
          contents: read

        jobs:
          deploy:
            runs-on: ubuntu-latest

            # Environment memungkinkan persetujuan manual & rahasia terpisah
            environment:
              name: production
              url: https://app.contoh.com

            steps:
              - uses: actions/checkout@v4

              - name: Deploy
                run: ./deploy.sh \${{ github.sha }}
                env:
                  DEPLOY_TOKEN: \${{ secrets.DEPLOY_TOKEN }}

              - name: Verifikasi
                run: |
                  for i in $(seq 1 10); do
                    if curl -fsS https://app.contoh.com/health/ready; then
                      echo "sehat"; exit 0
                    fi
                    sleep 5
                  done
                  echo "Health check GAGAL setelah deploy"
                  exit 1
        `,
      ),
      callout(
        'danger',
        'Deploy tanpa langkah verifikasi bukan deploy otomatis — ia peluncuran buta',
        'Pipeline yang berakhir dengan "deploy selesai" tanpa memeriksa apa pun akan melaporkan sukses meski aplikasinya tidak menyala. Langkah verifikasi adalah yang membedakan "sudah dikirim" dari "sudah berjalan".',
      ),

      h2('Deploy dari SHA, bukan dari branch'),
      code(
        'bash',
        `
        ./deploy.sh "\${{ github.sha }}"
        `,
      ),
      p(
        'Ini memastikan yang di-deploy **persis** kode yang lulus CI. Deploy dari nama branch bisa mengambil commit yang lebih baru — termasuk yang belum diuji.',
      ),

      h2('Preview deployment'),
      code(
        'text',
        `
        main            -> https://app.contoh.com
        PR #42          -> https://app-git-fitur-ekspor.vercel.app
        `,
      ),
      callout(
        'danger',
        'Preview tidak boleh menunjuk database produksi',
        'Preview dibuat otomatis dari setiap PR — termasuk yang belum ditinjau siapa pun. Kode di dalamnya bisa apa saja. Menunjuknya ke produksi berarti setiap PR punya akses tulis penuh ke data sungguhan. Pakai database terpisah dengan data yang disamarkan.',
      ),
      callout(
        'warning',
        'URL preview tidak rahasia',
        'Ia muncul di komentar PR, di log, dan di header `Referer`. Kalau preview memuat data yang tidak boleh publik, nyalakan perlindungan akses — "sulit ditebak" bukan kontrol akses.',
      ),

      h2('Strategi rilis'),
      table(
        ['Strategi', 'Cara kerja', 'Cocok kalau'],
        [
          ['Recreate', 'Matikan lama, nyalakan baru', 'Downtime bisa diterima'],
          ['**Rolling**', 'Ganti instance satu per satu', 'Default yang baik'],
          ['Blue-green', 'Dua lingkungan penuh, tukar trafik', 'Rollback harus instan'],
          ['Canary', 'Sebagian kecil trafik dulu', 'Perubahan berisiko tinggi'],
        ],
      ),
      code(
        'bash',
        `
        # Rolling dengan pm2
        pm2 reload ecosystem.config.js --env production
        `,
      ),
      callout(
        'warning',
        'Rolling berarti dua versi berjalan bersamaan sesaat',
        'Kode lama dan baru harus bisa hidup berdampingan dengan skema database yang sama — itulah alasan pola expand–migrate–contract. Perubahan skema yang destruktif akan membuat instance lama gagal selama masa transisi.',
      ),

      h2('Persetujuan manual'),
      code(
        'yaml',
        `
        environment:
          name: production      # atur "required reviewers" di pengaturan repo
        `,
      ),
      p(
        'Untuk sistem yang kegagalannya mahal, gerbang manual sebelum produksi masuk akal. Untuk sisanya, tes yang bisa dipercaya lebih berharga daripada klik persetujuan yang jadi rutinitas.',
      ),

      h2('Beri tahu hasilnya'),
      code(
        'yaml',
        `
        - name: Beri tahu kalau gagal
          if: failure()
          run: |
            curl -X POST "$WEBHOOK_URL" \\
              -H 'Content-Type: application/json' \\
              -d "{\\"text\\":\\"Deploy gagal: \${{ github.sha }}\\"}"
          env:
            WEBHOOK_URL: \${{ secrets.WEBHOOK_URL }}
        `,
      ),
      callout(
        'tip',
        'Beri tahu kegagalan, jangan setiap keberhasilan',
        'Notifikasi sukses yang datang sepuluh kali sehari akan diabaikan — dan yang gagal ikut terlewat bersamanya. Kelelahan notifikasi punya pola yang sama persis dengan kelelahan alert.',
      ),
    ],
  ),

  written(
    'secret-ci',
    'Secret di CI',
    10,
    'Kredensial yang berjalan di mesin yang tidak kamu pegang.',
    [
      h2('Menyimpan'),
      code(
        'yaml',
        `
        steps:
          - run: ./deploy.sh
            env:
              DEPLOY_TOKEN: \${{ secrets.DEPLOY_TOKEN }}
              DATABASE_URL: \${{ secrets.DATABASE_URL }}
        `,
      ),
      table(
        ['Tingkat', 'Untuk'],
        [
          ['Repository secret', 'Dipakai semua workflow di repo itu'],
          ['**Environment secret**', 'Hanya untuk lingkungan tertentu — bisa butuh persetujuan'],
          ['Organization secret', 'Dibagi ke banyak repo'],
        ],
      ),
      callout(
        'tip',
        'Pakai environment secret untuk kredensial produksi',
        'Ia bisa dibatasi ke branch tertentu dan menuntut persetujuan sebelum dipakai. Repository secret tersedia untuk **setiap** workflow, termasuk yang baru ditambahkan seseorang di PR.',
      ),

      h2('Rahasia bisa bocor lewat log'),
      code(
        'yaml',
        `
        # GitHub menyensor nilai rahasia di log — tapi hanya
        # kalau nilainya muncul UTUH.
        - run: echo "\${{ secrets.TOKEN }}"        # tersensor

        # Ini LOLOS dari penyensoran:
        - run: echo "\${{ secrets.TOKEN }}" | base64      # nilainya berubah bentuk
        - run: curl -v -H "Authorization: Bearer \${{ secrets.TOKEN }}" ...   # -v mencetak header
        `,
      ),
      callout(
        'danger',
        'Penyensoran log hanya bekerja untuk nilai yang persis sama',
        'Rahasia yang di-encode, dipotong, atau dicetak dalam bentuk lain akan muncul apa adanya. Hindari `-v` pada `curl` yang membawa kredensial, dan jangan pernah mencetak rahasia "untuk debug" — log workflow bisa dibaca siapa pun yang punya akses baca ke repositori.',
      ),

      h2('Batasi izin token'),
      code(
        'yaml',
        `
        permissions:
          contents: read

        jobs:
          deploy:
            permissions:
              contents: read
              id-token: write      # hanya kalau memakai OIDC
        `,
      ),

      h2('OIDC — lebih baik daripada kunci jangka panjang'),
      code(
        'yaml',
        `
        - uses: aws-actions/configure-aws-credentials@v4
          with:
            role-to-assume: arn:aws:iam::123456789:role/github-deploy
            aws-region: ap-southeast-1
        `,
      ),
      callout(
        'tip',
        'OIDC menghilangkan kunci statis sepenuhnya',
        'Alih-alih menyimpan kunci akses yang berlaku selamanya, CI menukar tokennya dengan kredensial sementara berumur menit. Tidak ada kunci yang bisa bocor, dan tidak ada yang perlu dirotasi. Kalau penyedia cloud-mu mendukungnya, ini jelas lebih baik.',
      ),

      h2('PR dari fork'),
      callout(
        'danger',
        'Jangan pernah menjalankan kode PR fork dengan akses ke rahasia',
        'Siapa pun bisa membuka PR berisi skrip apa pun. `on: pull_request` dari fork **tidak** mendapat rahasia — itu perilaku yang benar. Yang berbahaya adalah `pull_request_target` yang meng-checkout kode PR: ia berjalan dengan rahasia penuh sambil mengeksekusi kode yang belum ditinjau siapa pun.',
      ),

      h2('Hak minimum untuk kredensial deploy'),
      ol(
        'Token deploy hanya boleh men-deploy — bukan mengelola akun.',
        'Kredensial terpisah per lingkungan.',
        'Batasi ke IP runner kalau penyedianya mendukung.',
        'Beri masa berlaku, dan rotasi terjadwal.',
        'Cabut segera saat ada anggota tim yang keluar.',
      ),

      h2('Kalau rahasia bocor'),
      steps(
        {
          title: '1. Rotasi segera',
          body: 'Bukan setelah investigasi — sekarang. Rahasia yang pernah terekspos harus dianggap sudah dipakai.',
        },
        {
          title: '2. Periksa apa yang bisa disentuhnya',
          body: 'Log akses penyedia, riwayat deploy, perubahan yang tidak dikenali.',
        },
        {
          title: '3. Cari kenapa ia bisa bocor',
          body: 'Log yang tidak tersensor, cache, artefak build, atau `.env` yang ter-commit.',
        },
        {
          title: '4. Tutup jalurnya',
          body: 'Pemindai rahasia di pre-commit dan CI, dan izin yang lebih sempit.',
        },
      ),
      callout(
        'warning',
        'Menghapus log tidak membatalkan kebocoran',
        'Log workflow bisa sudah diunduh, ter-cache, atau terindeks. Sama seperti rahasia yang ter-commit ke git: satu-satunya perbaikan yang benar adalah rotasi.',
      ),
    ],
  ),

  written(
    'rollback',
    'Rollback: direncanakan sebelum rilis',
    11,
    'Keputusan yang harus diambil saat tenang, bukan saat panik.',
    [
      p(
        'Rollback bukan tanda kegagalan — ia bagian normal dari merilis. Yang membuatnya mahal adalah merencanakannya **saat** sesuatu sudah terbakar.',
      ),

      h2('Empat pertanyaan yang harus dijawab sebelum deploy'),
      steps(
        {
          title: '1. Bagaimana caranya kembali?',
          body: 'Perintah persisnya, dan berapa lama. "Kita bisa deploy versi lama" bukan rencana — `vercel rollback` atau `./deploy.sh <sha-sebelumnya>` adalah rencana.',
        },
        {
          title: '2. Apa yang TIDAK bisa dibatalkan?',
          body: 'Migrasi yang sudah berjalan, email yang terkirim, pembayaran yang diproses, webhook yang dipancarkan. Semua ini harus dirancang agar rollback kode saja tetap aman.',
        },
        {
          title: '3. Sinyal apa yang memicu rollback?',
          body: 'Tentukan ambangnya **sebelumnya**: tingkat error 5xx di atas sekian persen, health check gagal, latensi p95 naik dua kali lipat. Tanpa ambang, keputusannya diimprovisasi di bawah tekanan.',
        },
        {
          title: '4. Siapa yang memutuskan?',
          body: 'Satu orang. Rollback yang menunggu konsensus adalah rollback yang terlambat.',
        },
      ),

      h2('Rollback kode'),
      code(
        'bash',
        `
        vercel rollback
        ./deploy.sh <sha-sebelumnya>
        docker service update --rollback app
        pm2 reload ecosystem.config.js
        `,
      ),
      callout(
        'tip',
        'Rollback kode biasanya hitungan detik — kalau kamu punya artefak lamanya',
        'Inilah alasan menyimpan build sebelumnya, memberi tag pada image, dan mencatat SHA yang berjalan di produksi. Tanpa itu, "rollback" berarti build ulang dari nol — dan itu bisa lima belas menit di saat yang paling buruk.',
      ),

      h2('Database tidak bisa di-rollback semudah itu'),
      code(
        'text',
        `
        Deploy: migrasi menghapus kolom 'nama'
        Rollback kode: versi lama memakai kolom 'nama'
        -> kolomnya sudah tidak ada
        -> aplikasi gagal total, dan rollback tidak menolong
        `,
      ),
      p(
        'Karena itu migrasi destruktif dipisah ke rilisnya sendiri, setelah kode yang memakainya sudah tidak ada di mana pun — pola expand–migrate–contract dari sub-bab 4.4.',
      ),
      callout(
        'danger',
        'Jangan pernah me-rollback migrasi di produksi sebagai reaksi panik',
        '`migrate:rollback` menjalankan `down()` yang sering tidak pernah diuji, dan bisa menghapus data yang sudah masuk sejak migrasi berjalan. Hampir selalu lebih aman **maju** dengan migrasi perbaikan daripada mundur.',
      ),

      h2('Feature flag: rollback tanpa deploy'),
      code(
        'ts',
        `
        if (fitur.aktif('editor-baru', pengguna)) {
          return <EditorBaru />;
        }
        return <EditorLama />;
        `,
      ),
      callout(
        'tip',
        'Ini bentuk rollback tercepat yang ada',
        'Mematikan bendera berlaku seketika, tanpa deploy, tanpa build, tanpa risiko. Untuk fitur berisiko yang menyentuh banyak pengguna, ini jauh lebih baik daripada mengandalkan rollback deployment.',
      ),

      h2('Setelah rollback'),
      ol(
        '**Pastikan pulih** — periksa metrik dan health check, jangan berasumsi.',
        '**Beri tahu** siapa pun yang terkena.',
        '**Cari akar masalahnya** sebelum mencoba deploy lagi. Deploy ulang tanpa memahami penyebab adalah tebakan.',
        '**Tambahkan tes** yang akan menangkapnya lain kali — kalau tidak, ia akan kembali.',
        '**Tulis catatan singkat**: apa yang terjadi, kenapa lolos CI, apa yang berubah supaya tidak terulang.',
      ),
      callout(
        'warning',
        'Deploy ulang tanpa memahami penyebab adalah cara paling umum satu gangguan menjadi tiga',
        'Godaannya besar: "mungkin tadi kebetulan". Kalau kamu tidak bisa menjelaskan kenapa ia gagal, kamu juga tidak bisa menjelaskan kenapa kali ini tidak akan gagal lagi.',
      ),

      h2('Catatan pasca-insiden'),
      code(
        'text',
        `
        INSIDEN — 2026-08-02 14:30 WIB

        Dampak       API mengembalikan 500 selama 8 menit; ~2% permintaan
        Penyebab     Migrasi menambah NOT NULL ke kolom yang masih punya
                     baris NULL. Migrasi lulus di staging karena datanya
                     lebih sedikit dan tidak punya baris lama.
        Deteksi      Alert tingkat error 5xx, 90 detik setelah deploy
        Penanganan   Rollback kode (30 detik), lalu migrasi perbaikan
        Kenapa lolos CI  Tes berjalan pada database kosong

        Perubahan
        - Tes migrasi dijalankan pada salinan data realistis
        - Migrasi destruktif dipisah ke rilis sendiri
        - Ambang alert 5xx diturunkan dari 5% ke 1%
        `,
      ),
      callout(
        'tip',
        'Catatan pasca-insiden mencari penyebab sistem, bukan orang',
        'Pertanyaannya bukan "siapa yang salah" melainkan "kenapa sistem kita mengizinkannya lolos". Kolom "kenapa lolos CI" biasanya yang paling berharga — di situlah perbaikan yang mencegah pengulangan berada.',
      ),
    ],
  ),
];
